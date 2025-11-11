/**
 * 全局拖拽状态管理器
 * 统一管理所有拖拽操作的状态，解决节点拖拽、预览线拖拽、画布平移等操作冲突问题
 */

export class GlobalDragStateManager {
  constructor(options = {}) {
    this.options = {
      enableDebug: false,
      enableHistory: true,
      maxHistorySize: 50,
      enableConflictDetection: true,
      enablePriorityManagement: true,
      ...options
    }

    // 拖拽状态
    this.currentState = 'idle' // 'idle', 'node-drag', 'preview-line-drag', 'canvas-pan', 'multi-select'
    this.currentDrag = null
    this.dragHistory = []
    
    // 优先级管理
    this.dragPriorities = {
      'node-drag': 1,
      'preview-line-drag': 2,
      'canvas-pan': 3,
      'multi-select': 4,
      'default': 5
    }
    
    // 冲突检测
    this.conflictRules = {
      'node-drag': ['preview-line-drag', 'canvas-pan'],
      'preview-line-drag': ['node-drag', 'canvas-pan'],
      'canvas-pan': ['node-drag', 'preview-line-drag'],
      'multi-select': ['node-drag', 'preview-line-drag']
    }
    
    // 状态锁
    this.stateLocks = new Set()
    this.priorityLocks = new Map()
    
    // 性能监控
    this.performanceMetrics = {
      dragStartTime: 0,
      dragDuration: 0,
      conflictResolutions: 0,
      stateTransitions: 0
    }
    
    // 事件监听器
    this.eventListeners = new Map()
    
    if (this.options.enableDebug) {
      console.log('[GlobalDragStateManager] 初始化完成')
    }
  }

  /**
   * 获取当前状态信息
   */
  getStateInfo() {
    return {
      currentState: this.currentState,
      currentDrag: this.currentDrag,
      stateLocks: Array.from(this.stateLocks),
      priorityLocks: Object.fromEntries(this.priorityLocks),
      performanceMetrics: { ...this.performanceMetrics },
      historyLength: this.dragHistory.length,
      timestamp: Date.now()
    }
  }

  /**
   * 检查是否可以开始新的拖拽操作
   */
  canStartDrag(dragType, dragInfo = {}) {
    // 如果当前有更高优先级的拖拽在进行中，则不允许开始新的拖拽
    if (this.currentState !== 'idle' && this.currentDrag) {
      const currentPriority = this.dragPriorities[this.currentState] || this.dragPriorities.default
      const newPriority = this.dragPriorities[dragType] || this.dragPriorities.default
      
      if (currentPriority <= newPriority) {
        if (this.options.enableDebug) {
          console.log(`[GlobalDragStateManager] 拖拽被拒绝: ${this.currentState} 优先级高于 ${dragType}`)
        }
        return false
      }
    }
    
    // 检查状态锁
    if (this.stateLocks.has(dragType)) {
      if (this.options.enableDebug) {
        console.log(`[GlobalDragStateManager] 拖拽被拒绝: ${dragType} 被锁定`)
      }
      return false
    }
    
    // 检查冲突规则
    if (this.options.enableConflictDetection && this.currentState !== 'idle') {
      const conflicts = this.conflictRules[dragType] || []
      if (conflicts.includes(this.currentState)) {
        if (this.options.enableDebug) {
          console.log(`[GlobalDragStateManager] 拖拽冲突检测: ${dragType} 与 ${this.currentState} 冲突`)
        }
        return false
      }
    }
    
    return true
  }

  /**
   * 开始拖拽操作
   */
  startDrag(dragType, dragInfo = {}) {
    if (!this.canStartDrag(dragType, dragInfo)) {
      return false
    }
    
    // 记录拖拽历史
    if (this.options.enableHistory) {
      this.dragHistory.push({
        state: this.currentState,
        dragType,
        dragInfo,
        timestamp: Date.now()
      })
      
      // 限制历史记录大小
      if (this.dragHistory.length > this.options.maxHistorySize) {
        this.dragHistory.shift()
      }
    }
    
    // 更新状态
    const previousState = this.currentState
    this.currentState = dragType
    this.currentDrag = {
      type: dragType,
      startTime: Date.now(),
      dragInfo,
      sessionId: `drag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    this.performanceMetrics.dragStartTime = Date.now()
    this.performanceMetrics.stateTransitions++
    
    // 设置优先级锁
    if (this.options.enablePriorityManagement) {
      this.priorityLocks.set(dragType, {
        priority: this.dragPriorities[dragType] || this.dragPriorities.default,
        startTime: Date.now(),
        dragInfo
      })
    }
    
    if (this.options.enableDebug) {
      console.log(`[GlobalDragStateManager] 拖拽开始: ${dragType}`, {
        previousState,
        sessionId: this.currentDrag.sessionId,
        dragInfo
      })
    }
    
    // 触发事件
    this.emit('drag-start', {
      dragType,
      previousState,
      dragInfo,
      sessionId: this.currentDrag.sessionId
    })
    
    return true
  }

  /**
   * 更新拖拽状态
   */
  updateDrag(position, additionalInfo = {}) {
    if (!this.currentDrag || this.currentState === 'idle') {
      if (this.options.enableDebug) {
        console.warn('[GlobalDragStateManager] 更新拖拽状态失败: 没有活动的拖拽')
      }
      return false
    }
    
    this.currentDrag.currentPosition = position
    this.currentDrag.lastUpdate = Date.now()
    
    if (additionalInfo) {
      this.currentDrag.additionalInfo = {
        ...this.currentDrag.additionalInfo,
        ...additionalInfo
      }
    }
    
    // 触发事件
    this.emit('drag-update', {
      dragType: this.currentState,
      position,
      additionalInfo,
      sessionId: this.currentDrag.sessionId
    })
    
    return true
  }

  /**
   * 结束拖拽操作
   */
  endDrag(result = {}) {
    if (!this.currentDrag || this.currentState === 'idle') {
      if (this.options.enableDebug) {
        console.warn('[GlobalDragStateManager] 结束拖拽失败: 没有活动的拖拽')
      }
      return false
    }
    
    const dragType = this.currentState
    const sessionId = this.currentDrag.sessionId
    const dragDuration = Date.now() - this.currentDrag.startTime
    
    this.performanceMetrics.dragDuration = dragDuration
    
    // 更新拖拽结果
    this.currentDrag.result = result
    this.currentDrag.endTime = Date.now()
    this.currentDrag.duration = dragDuration
    
    if (this.options.enableDebug) {
      console.log(`[GlobalDragStateManager] 拖拽结束: ${dragType}`, {
        sessionId,
        duration: dragDuration,
        result
      })
    }
    
    // 触发事件
    this.emit('drag-end', {
      dragType,
      sessionId,
      duration: dragDuration,
      result,
      dragInfo: this.currentDrag.dragInfo
    })
    
    // 清理状态
    const previousState = this.currentState
    this.currentState = 'idle'
    this.currentDrag = null
    this.priorityLocks.delete(dragType)
    
    return true
  }

  /**
   * 取消当前拖拽
   */
  cancelDrag(reason = 'unknown') {
    if (this.currentState === 'idle') {
      return false
    }
    
    if (this.options.enableDebug) {
      console.log(`[GlobalDragStateManager] 取消拖拽: ${this.currentState}, 原因: ${reason}`)
    }
    
    // 触发取消事件
    this.emit('drag-cancel', {
      dragType: this.currentState,
      reason,
      dragInfo: this.currentDrag?.dragInfo
    })
    
    return this.endDrag({ cancelled: true, reason })
  }

  /**
   * 设置状态锁
   */
  lockState(lockType, reason = '') {
    this.stateLocks.add(lockType)
    
    if (this.options.enableDebug) {
      console.log(`[GlobalDragStateManager] 状态锁定: ${lockType}, 原因: ${reason}`)
    }
    
    this.emit('state-locked', { lockType, reason })
  }

  /**
   * 解除状态锁
   */
  unlockState(lockType) {
    const hadLock = this.stateLocks.has(lockType)
    this.stateLocks.delete(lockType)
    
    if (hadLock && this.options.enableDebug) {
      console.log(`[GlobalDragStateManager] 状态解锁: ${lockType}`)
    }
    
    if (hadLock) {
      this.emit('state-unlocked', { lockType })
    }
    
    return hadLock
  }

  /**
   * 检查是否有冲突的拖拽类型
   */
  hasConflict(dragType) {
    if (this.currentState === 'idle') {
      return false
    }
    
    const conflicts = this.conflictRules[dragType] || []
    return conflicts.includes(this.currentState)
  }

  /**
   * 获取拖拽优先级
   */
  getDragPriority(dragType) {
    return this.dragPriorities[dragType] || this.dragPriorities.default
  }

  /**
   * 设置调试模式
   */
  setDebugMode(enabled) {
    this.options.enableDebug = enabled
    console.log(`[GlobalDragStateManager] 调试模式: ${enabled ? '开启' : '关闭'}`)
  }

  /**
   * 添加事件监听器
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event).add(callback)
  }

  /**
   * 移除事件监听器
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback)
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[GlobalDragStateManager] 事件处理失败: ${event}`, error)
        }
      })
    }
  }

  /**
   * 重置所有状态
   */
  reset() {
    const previousState = this.currentState
    
    this.currentState = 'idle'
    this.currentDrag = null
    this.stateLocks.clear()
    this.priorityLocks.clear()
    this.performanceMetrics = {
      dragStartTime: 0,
      dragDuration: 0,
      conflictResolutions: 0,
      stateTransitions: 0
    }
    
    if (this.options.enableDebug) {
      console.log(`[GlobalDragStateManager] 状态重置: ${previousState} -> idle`)
    }
    
    this.emit('state-reset', { previousState })
  }

  /**
   * 获取状态统计信息
   */
  getStats() {
    return {
      currentState: this.currentState,
      historyCount: this.dragHistory.length,
      stateLocksCount: this.stateLocks.size,
      priorityLocksCount: this.priorityLocks.size,
      performanceMetrics: { ...this.performanceMetrics },
      isIdle: this.currentState === 'idle',
      hasActiveDrag: this.currentState !== 'idle'
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.reset()
    this.eventListeners.clear()
    this.dragHistory = []
    
    if (this.options.enableDebug) {
      console.log('[GlobalDragStateManager] 已销毁')
    }
  }
}

// 单例模式导出
let globalInstance = null

export function getGlobalDragStateManager(options = {}) {
  if (!globalInstance) {
    globalInstance = new GlobalDragStateManager(options)
  }
  return globalInstance
}

export function resetGlobalDragStateManager() {
  if (globalInstance) {
    globalInstance.destroy()
    globalInstance = null
  }
}