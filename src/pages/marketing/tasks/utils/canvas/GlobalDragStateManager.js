/**
 * 全局拖拽状态管理器
 * 统一管理所有预览线拖拽相关的状态和事件
 */

// 拖拽状态枚举
export const DragStates = {
  IDLE: 'idle',                    // 空闲状态
  DRAGGING: 'dragging',            // 拖拽中
  SNAPPING: 'snapping',            // 吸附中
  CONNECTING: 'connecting',        // 连接中
  CREATING_NODE: 'creating_node',  // 创建节点中
  ERROR: 'error',                  // 错误状态
  RECOVERING: 'recovering'         // 恢复中
}

// 拖拽类型枚举
export const DragTypes = {
  PREVIEW_LINE: 'preview_line',    // 预览线拖拽
  NODE: 'node',                    // 节点拖拽
  BRANCH_LINE: 'branch_line'       // 分支线拖拽
}

// 拖拽阶段枚举
export const DragPhases = {
  START: 'start',                  // 开始阶段
  MOVE: 'move',                    // 移动阶段
  END: 'end',                      // 结束阶段
  CANCEL: 'cancel'                 // 取消阶段
}

// 状态转换规则
const STATE_TRANSITIONS = {
  [DragStates.IDLE]: [DragStates.DRAGGING, DragStates.ERROR],
  [DragStates.DRAGGING]: [DragStates.SNAPPING, DragStates.CONNECTING, DragStates.CREATING_NODE, DragStates.IDLE, DragStates.ERROR],
  [DragStates.SNAPPING]: [DragStates.CONNECTING, DragStates.DRAGGING, DragStates.IDLE, DragStates.ERROR],
  [DragStates.CONNECTING]: [DragStates.IDLE, DragStates.ERROR, DragStates.RECOVERING],
  [DragStates.CREATING_NODE]: [DragStates.IDLE, DragStates.ERROR, DragStates.RECOVERING],
  [DragStates.ERROR]: [DragStates.RECOVERING, DragStates.IDLE],
  [DragStates.RECOVERING]: [DragStates.IDLE, DragStates.ERROR]
}

/**
 * 全局拖拽状态管理器类
 */
export class GlobalDragStateManager {
  constructor() {
    // 当前状态
    this.currentState = DragStates.IDLE
    this.previousState = null
    
    // 当前拖拽信息
    this.currentDrag = {
      type: null,                    // 拖拽类型
      phase: null,                   // 拖拽阶段
      object: null,                  // 拖拽对象
      sourceNode: null,              // 源节点
      targetNode: null,              // 目标节点
      startPosition: null,           // 开始位置
      currentPosition: null,         // 当前位置
      branchId: null,                // 分支ID
      branchLabel: null,             // 分支标签
      metadata: {}                   // 额外元数据
    }
    
    // 状态历史记录（用于调试和恢复）
    this.stateHistory = []
    this.maxHistorySize = 50
    
    // 事件监听器
    this.eventListeners = new Map()
    
    // 防重复操作
    this.operationLocks = new Set()
    this.lastOperationTime = 0
    this.minOperationInterval = 50 // 最小操作间隔（毫秒）
    
    // 状态持久化
    this.persistenceEnabled = false
    this.persistenceKey = 'drag_state_manager'
    
    // 错误处理
    this.errorHandlers = new Map()
    this.maxRetries = 3
    
    console.log('🚀 [全局拖拽状态管理器] 初始化完成')
  }

  /**
   * 状态转换
   * @param {string} newState - 新状态
   * @param {Object} context - 上下文信息
   * @returns {boolean} 转换是否成功
   */
  transitionTo(newState, context = {}) {
    // 检查状态转换是否合法（允许从DRAGGING到SNAPPING的转换）
    if (!this.isValidTransition(this.currentState, newState)) {
      console.warn(`⚠️ [全局拖拽状态管理器] 非法状态转换: ${this.currentState} -> ${newState}`)
      return false
    }
    
    // 防重复操作检查
    if (this.isOperationLocked(newState)) {
      console.warn(`⚠️ [全局拖拽状态管理器] 操作被锁定: ${newState}`)
      return false
    }
    
    const oldState = this.currentState
    this.previousState = oldState
    this.currentState = newState
    
    // 记录状态历史
    this.addToHistory({
      from: oldState,
      to: newState,
      timestamp: Date.now(),
      context: context
    })
    
    // 触发状态变化事件
    this.emit('stateChange', {
      from: oldState,
      to: newState,
      context: context
    })
    
    // 执行状态进入处理
    this.onStateEnter(newState, context)
    
    console.log(`🔄 [全局拖拽状态管理器] 状态转换: ${oldState} -> ${newState}`, context)
    
    return true
  }

  /**
   * 验证状态转换是否合法
   * @param {string} fromState - 源状态
   * @param {string} toState - 目标状态
   * @returns {boolean} 是否合法
   */
  isValidTransition(fromState, toState) {
    const validTransitions = {
      [DragStates.IDLE]: [DragStates.DRAGGING, DragStates.ERROR],
      [DragStates.DRAGGING]: [DragStates.SNAPPING, DragStates.CONNECTING, DragStates.CREATING_NODE, DragStates.IDLE, DragStates.ERROR],
      [DragStates.SNAPPING]: [DragStates.DRAGGING, DragStates.CONNECTING, DragStates.CREATING_NODE, DragStates.IDLE, DragStates.ERROR],
      [DragStates.CONNECTING]: [DragStates.IDLE, DragStates.ERROR],
      [DragStates.CREATING_NODE]: [DragStates.IDLE, DragStates.ERROR],
      [DragStates.ERROR]: [DragStates.RECOVERING, DragStates.IDLE],
      [DragStates.RECOVERING]: [DragStates.IDLE, DragStates.ERROR]
    }
    const allowedTransitions = validTransitions[fromState]
    return allowedTransitions && allowedTransitions.includes(toState)
  }

  /**
   * 开始拖拽操作
   * @param {string} type - 拖拽类型
   * @param {Object} dragObject - 拖拽对象
   * @param {Object} options - 选项
   * @returns {boolean} 是否成功开始
   */
  startDrag(type, dragObject, options = {}) {
    if (!this.transitionTo(DragStates.DRAGGING, { type, dragObject, options })) {
      return false
    }
    
    // 设置拖拽信息
    this.currentDrag = {
      type: type,
      phase: DragPhases.START,
      object: dragObject,
      sourceNode: options.sourceNode || null,
      targetNode: null,
      startPosition: options.startPosition || null,
      currentPosition: options.startPosition || null,
      branchId: options.branchId || null,
      branchLabel: options.branchLabel || null,
      metadata: options.metadata || {}
    }
    
    // 锁定操作
    this.lockOperation('drag_start')
    
    // 触发拖拽开始事件
    this.emit('dragStart', this.currentDrag)
    
    return true
  }

  /**
   * 更新拖拽位置
   * @param {Object} position - 位置信息 {x, y}
   * @param {Object} context - 上下文（可选）
   * @returns {boolean} 是否成功更新
   */
  updateDragPosition(position, context = {}) {
    if (this.currentState !== DragStates.DRAGGING && this.currentState !== DragStates.SNAPPING) {
      console.warn('⚠️ [全局拖拽状态管理器] 非拖拽状态下尝试更新位置')
      return false
    }
    
    this.currentDrag.currentPosition = { ...position }
    this.currentDrag.phase = DragPhases.MOVE
    
    // 触发位置更新事件
    this.emit('dragMove', {
      position: position,
      drag: this.currentDrag,
      context: context
    })
    
    // 同时触发位置更新事件以保持向后兼容性
    this.emit('positionUpdate', {
      position: position,
      drag: this.currentDrag
    })
    
    return true
  }

  /**
   * 设置拖拽开始位置
   * @param {Object} position - 位置信息 {x, y}
   * @returns {boolean} 是否成功设置
   */
  setDragStartPosition(position) {
    if (this.currentState !== DragStates.DRAGGING) {
      console.warn('⚠️ [全局拖拽状态管理器] 非拖拽状态下无法设置开始位置')
      return false
    }
    
    this.currentDrag.startPosition = { ...position }
    
    // 触发开始位置设置事件
    this.emit('startPositionSet', {
      position: position,
      drag: this.currentDrag
    })
    
    return true
  }

  /**
   * 开始吸附操作
   * @param {Object} targetNode - 目标节点
   * @param {Object} snapInfo - 吸附信息
   * @returns {boolean} 是否成功开始吸附
   */
  startSnapping(targetNode, snapInfo = {}) {
    if (!this.transitionTo(DragStates.SNAPPING, { targetNode, snapInfo })) {
      return false
    }
    
    this.currentDrag.targetNode = targetNode
    this.currentDrag.metadata.snapInfo = snapInfo
    
    // 触发吸附开始事件
    this.emit('snapStart', {
      targetNode: targetNode,
      drag: this.currentDrag,
      snapInfo: snapInfo
    })
    
    return true
  }

  /**
   * 创建连接
   * @param {Object} connectionInfo - 连接信息
   * @returns {boolean} 是否成功开始连接
   */
  startConnecting(connectionInfo = {}) {
    if (!this.transitionTo(DragStates.CONNECTING, { connectionInfo })) {
      return false
    }
    
    this.currentDrag.metadata.connectionInfo = connectionInfo
    
    // 触发连接开始事件
    this.emit('connectStart', {
      drag: this.currentDrag,
      connectionInfo: connectionInfo
    })
    
    return true
  }

  /**
   * 创建新节点
   * @param {Object} nodeInfo - 节点信息
   * @returns {boolean} 是否成功开始创建节点
   */
  startCreatingNode(nodeInfo = {}) {
    if (!this.transitionTo(DragStates.CREATING_NODE, { nodeInfo })) {
      return false
    }
    
    this.currentDrag.metadata.nodeInfo = nodeInfo
    
    // 触发节点创建开始事件
    this.emit('nodeCreateStart', {
      drag: this.currentDrag,
      nodeInfo: nodeInfo
    })
    
    return true
  }

  /**
   * 结束拖拽操作
   * @param {Object} result - 操作结果
   * @returns {boolean} 是否成功结束
   */
  endDrag(result = {}) {
    if (this.currentState === DragStates.IDLE) {
      // 静默处理：已经是空闲状态，无需警告
      return true
    }
    
    // 强制解锁idle操作以允许结束拖拽
    this.unlockOperation('idle')
    
    const dragInfo = { ...this.currentDrag }
    dragInfo.phase = DragPhases.END
    
    // 触发拖拽结束事件
    this.emit('dragEnd', {
      drag: dragInfo,
      result: result
    })
    
    // 重置拖拽信息
    this.resetDragInfo()
    
    // 转换到空闲状态
    return this.transitionTo(DragStates.IDLE, { result })
  }

  /**
   * 取消拖拽操作
   * @param {string} reason - 取消原因
   * @returns {boolean} 是否成功取消
   */
  cancelDrag(reason = 'user_cancel') {
    if (this.currentState === DragStates.IDLE) {
      return true
    }
    
    const dragInfo = { ...this.currentDrag }
    dragInfo.phase = DragPhases.CANCEL
    
    // 触发拖拽取消事件
    this.emit('dragCancel', {
      drag: dragInfo,
      reason: reason
    })
    
    // 重置拖拽信息
    this.resetDragInfo()
    
    // 转换到空闲状态
    return this.transitionTo(DragStates.IDLE, { reason })
  }

  /**
   * 错误处理
   * @param {Error} error - 错误对象
   * @param {Object} context - 错误上下文
   */
  handleError(error, context = {}) {
    console.error('❌ [全局拖拽状态管理器] 错误:', error, context)
    
    // 转换到错误状态
    this.transitionTo(DragStates.ERROR, { error, context })
    
    // 触发错误事件
    this.emit('error', {
      error: error,
      context: context,
      drag: this.currentDrag
    })
    
    // 尝试恢复
    this.attemptRecovery(error, context)
  }

  /**
   * 尝试恢复
   * @param {Error} error - 错误对象
   * @param {Object} context - 错误上下文
   */
  attemptRecovery(error, context = {}) {
    if (!this.transitionTo(DragStates.RECOVERING, { error, context })) {
      return
    }
    
    // 触发恢复开始事件
    this.emit('recoveryStart', {
      error: error,
      context: context
    })
    
    // 执行恢复逻辑
    setTimeout(() => {
      try {
        // 重置拖拽信息
        this.resetDragInfo()
        
        // 清理操作锁
        this.clearOperationLocks()
        
        // 转换到空闲状态
        this.transitionTo(DragStates.IDLE, { recovered: true })
        
        // 触发恢复完成事件
        this.emit('recoveryComplete', {
          error: error,
          context: context
        })
        
        console.log('✅ [全局拖拽状态管理器] 恢复完成')
      } catch (recoveryError) {
        console.error('❌ [全局拖拽状态管理器] 恢复失败:', recoveryError)
        this.emit('recoveryFailed', {
          originalError: error,
          recoveryError: recoveryError
        })
      }
    }, 100)
  }

  /**
   * 重置拖拽信息
   */
  resetDragInfo() {
    this.currentDrag = {
      type: null,
      phase: null,
      object: null,
      sourceNode: null,
      targetNode: null,
      startPosition: null,
      currentPosition: null,
      branchId: null,
      branchLabel: null,
      metadata: {}
    }
    
    // 解锁操作
    this.unlockOperation('drag_start')
  }

  /**
   * 状态进入处理
   * @param {string} state - 进入的状态
   * @param {Object} context - 上下文
   */
  onStateEnter(state, context) {
    switch (state) {
      case DragStates.IDLE:
        this.clearOperationLocks()
        break
      case DragStates.DRAGGING:
        // 拖拽状态特殊处理
        break
      case DragStates.ERROR:
        // 错误状态特殊处理
        break
    }
  }

  /**
   * 防重复操作检查
   * @param {string} operation - 操作名称
   * @returns {boolean} 是否被锁定
   */
  isOperationLocked(operation) {
    const now = Date.now()
    if (now - this.lastOperationTime < this.minOperationInterval) {
      return true
    }
    
    return this.operationLocks.has(operation)
  }

  /**
   * 锁定操作
   * @param {string} operation - 操作名称
   * @param {number} timeout - 超时时间（毫秒）
   */
  lockOperation(operation, timeout = 1000) {
    this.operationLocks.add(operation)
    this.lastOperationTime = Date.now()
    
    // 自动解锁
    setTimeout(() => {
      this.unlockOperation(operation)
    }, timeout)
  }

  /**
   * 解锁操作
   * @param {string} operation - 操作名称
   */
  unlockOperation(operation) {
    this.operationLocks.delete(operation)
  }

  /**
   * 清理所有操作锁
   */
  clearOperationLocks() {
    this.operationLocks.clear()
  }

  /**
   * 添加到历史记录
   * @param {Object} record - 记录
   */
  addToHistory(record) {
    this.stateHistory.push(record)
    
    // 限制历史记录大小
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift()
    }
  }

  /**
   * 事件监听
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * 移除事件监听
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) {
      return
    }
    
    const listeners = this.eventListeners.get(event)
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   */
  emit(event, data) {
    if (!this.eventListeners.has(event)) {
      return
    }
    
    const listeners = this.eventListeners.get(event)
    listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`❌ [全局拖拽状态管理器] 事件处理错误 (${event}):`, error)
      }
    })
  }

  /**
   * 获取当前状态信息
   * @returns {Object} 状态信息
   */
  getStateInfo() {
    return {
      currentState: this.currentState,
      previousState: this.previousState,
      currentDrag: { ...this.currentDrag },
      isIdle: this.currentState === DragStates.IDLE,
      isDragging: this.currentState === DragStates.DRAGGING,
      isSnapping: this.currentState === DragStates.SNAPPING,
      isConnecting: this.currentState === DragStates.CONNECTING,
      isCreatingNode: this.currentState === DragStates.CREATING_NODE,
      hasError: this.currentState === DragStates.ERROR,
      isRecovering: this.currentState === DragStates.RECOVERING
    }
  }

  /**
   * 启用状态持久化
   * @param {string} key - 存储键名
   */
  enablePersistence(key = 'drag_state_manager') {
    this.persistenceEnabled = true
    this.persistenceKey = key
    
    // 尝试恢复状态
    this.restoreState()
  }

  /**
   * 保存状态
   */
  saveState() {
    if (!this.persistenceEnabled) {
      return
    }
    
    try {
      const state = {
        currentState: this.currentState,
        currentDrag: this.currentDrag,
        timestamp: Date.now()
      }
      
      localStorage.setItem(this.persistenceKey, JSON.stringify(state))
    } catch (error) {
      console.warn('⚠️ [全局拖拽状态管理器] 状态保存失败:', error)
    }
  }

  /**
   * 恢复状态
   */
  restoreState() {
    if (!this.persistenceEnabled) {
      return
    }
    
    try {
      const saved = localStorage.getItem(this.persistenceKey)
      if (!saved) {
        return
      }
      
      const state = JSON.parse(saved)
      const now = Date.now()
      
      // 检查状态是否过期（超过5分钟）
      if (now - state.timestamp > 5 * 60 * 1000) {
        localStorage.removeItem(this.persistenceKey)
        return
      }
      
      // 只恢复安全的状态
      if (state.currentState === DragStates.IDLE) {
        this.currentState = state.currentState
        console.log('✅ [全局拖拽状态管理器] 状态恢复完成')
      }
    } catch (error) {
      console.warn('⚠️ [全局拖拽状态管理器] 状态恢复失败:', error)
      localStorage.removeItem(this.persistenceKey)
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    // 清理事件监听器
    this.eventListeners.clear()
    
    // 清理操作锁
    this.clearOperationLocks()
    
    // 重置状态
    this.currentState = DragStates.IDLE
    this.resetDragInfo()
    
    // 清理历史记录
    this.stateHistory = []
    
    console.log('🗑️ [全局拖拽状态管理器] 已销毁')
  }
}

// 创建全局单例实例
export const globalDragStateManager = new GlobalDragStateManager()

// 默认导出
export default globalDragStateManager