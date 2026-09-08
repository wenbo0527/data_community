/**
 * 状态管理服务
 * 提供全局状态统一管理，包括状态持久化、状态变更通知和状态同步
 * 基于现有状态管理逻辑进行封装
 */

/**
 * 状态类型枚举
 */
export const StateType = {
  // 画布状态
  CANVAS: 'canvas',
  VIEWPORT: 'viewport',
  ZOOM: 'zoom',
  SELECTION: 'selection',
  
  // 节点状态
  NODES: 'nodes',
  NODE_POSITIONS: 'nodePositions',
  NODE_STYLES: 'nodeStyles',
  NODE_DATA: 'nodeData',
  
  // 连线状态
  EDGES: 'edges',
  EDGE_PATHS: 'edgePaths',
  EDGE_STYLES: 'edgeStyles',
  EDGE_DATA: 'edgeData',
  
  // 布局状态
  LAYOUT: 'layout',
  LAYOUT_CONFIG: 'layoutConfig',
  LAYOUT_HISTORY: 'layoutHistory',
  
  // 交互状态
  INTERACTION: 'interaction',
  DRAG_STATE: 'dragState',
  HOVER_STATE: 'hoverState',
  
  // 预览线状态
  PREVIEW_LINES: 'previewLines',
  PREVIEW_CONFIG: 'previewConfig',
  
  // 性能状态
  PERFORMANCE: 'performance',
  RENDER_STATE: 'renderState',
  
  // 用户偏好
  USER_PREFERENCES: 'userPreferences',
  UI_STATE: 'uiState'
}

/**
 * 状态变更类型枚举
 */
export const StateChangeType = {
  SET: 'set',
  UPDATE: 'update',
  DELETE: 'delete',
  RESET: 'reset',
  MERGE: 'merge',
  BATCH: 'batch'
}

/**
 * 状态管理服务类
 */
export class StateService {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = {
      // 持久化配置
      enablePersistence: true,
      persistenceKey: 'marketing-canvas-state',
      storageType: 'localStorage',
      
      // 同步配置
      enableSync: true,
      syncDebounce: 200,
      enableBroadcast: false,
      
      // 历史记录配置
      enableHistory: true,
      maxHistorySize: 50,
      
      // 验证配置
      enableValidation: true,
      strictMode: false,
      
      // 性能配置
      enableBatching: true,
      batchSize: 20,
      enableOptimization: true,
      
      ...options
    }
    
    // 状态存储
    this.state = new Map()
    
    // 状态历史
    this.history = []
    
    // 状态验证器
    this.validators = new Map()
    
    // 存储工具
    this.storageUtils = {
      save: (key, data) => {
        try {
          localStorage.setItem(key, JSON.stringify(data))
          return true
        } catch (error) {
          console.error('存储失败:', error)
          return false
        }
      },
      load: (key) => {
        try {
          const data = localStorage.getItem(key)
          return data ? JSON.parse(data) : null
        } catch (error) {
          console.error('加载失败:', error)
          return null
        }
      },
      remove: (key) => {
        try {
          localStorage.removeItem(key)
          return true
        } catch (error) {
          console.error('删除失败:', error)
          return false
        }
      }
    }
    
    // 状态订阅者
    this.subscribers = new Map()
    
    // 状态变更监听器
    this.changeListeners = new Map()
    
    // 状态快照
    this.snapshots = new Map()
    
    // 批处理队列
    this.batchQueue = []
    this.isBatching = false
    
    // 同步状态
    this.syncState = {
      lastSync: 0,
      syncQueue: [],
      isSyncing: false,
      syncErrors: []
    }
    
    // 统计信息
    this.stats = {
      stateChanges: 0,
      subscriptions: 0,
      persistenceOperations: 0,
      syncOperations: 0,
      errors: 0
    }
    
    // 初始化服务
    this.initialize()
    
    console.log('🏪 [状态管理服务] 初始化完成')
  }

  /**
   * 初始化服务
   */
  initialize(graph = null, options = {}) {
    if (graph) {
      this.graph = graph
    }
    this.setupInitialState()
    this.setupEventListeners()
    this.setupStateValidators()
    this.loadPersistedState()
    this.setupSyncHandlers()
  }

  /**
   * 设置初始状态
   */
  setupInitialState() {
    const initialState = {
      // 画布状态
      [StateType.CANVAS]: {
        width: 0,
        height: 0,
        background: '#ffffff',
        grid: { enabled: true, size: 20 }
      },
      
      // 视口状态
      [StateType.VIEWPORT]: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      
      // 缩放状态
      [StateType.ZOOM]: {
        scale: 1,
        minScale: 0.1,
        maxScale: 3,
        center: { x: 0, y: 0 }
      },
      
      // 选择状态
      [StateType.SELECTION]: {
        selectedNodes: [],
        selectedEdges: [],
        selectionBox: null
      },
      
      // 节点状态
      [StateType.NODES]: new Map(),
      [StateType.NODE_POSITIONS]: new Map(),
      [StateType.NODE_STYLES]: new Map(),
      [StateType.NODE_DATA]: new Map(),
      
      // 连线状态
      [StateType.EDGES]: new Map(),
      [StateType.EDGE_PATHS]: new Map(),
      [StateType.EDGE_STYLES]: new Map(),
      [StateType.EDGE_DATA]: new Map(),
      
      // 布局状态
      [StateType.LAYOUT]: {
        type: 'hierarchical',
        direction: 'TB',
        spacing: { node: 50, rank: 100 }
      },
      
      // 交互状态
      [StateType.INTERACTION]: {
        mode: 'select',
        isDragging: false,
        isConnecting: false,
        dragTarget: null,
        hoverTarget: null
      },
      
      // 预览线状态
      [StateType.PREVIEW_LINES]: new Map(),
      [StateType.PREVIEW_CONFIG]: {
        enabled: true,
        style: { stroke: '#1890ff', strokeWidth: 2 },
        animation: { enabled: true, duration: 300 }
      },
      
      // 性能状态
      [StateType.PERFORMANCE]: {
        fps: 60,
        renderTime: 0,
        memoryUsage: 0,
        optimizationLevel: 'auto'
      },
      
      // 用户偏好
      [StateType.USER_PREFERENCES]: {
        theme: 'light',
        language: 'zh-CN',
        autoSave: true,
        showGrid: true,
        snapToGrid: true
      },
      
      // UI状态
      [StateType.UI_STATE]: {
        sidebarVisible: true,
        toolbarVisible: true,
        miniMapVisible: false,
        propertiesPanelVisible: true
      }
    }
    
    // 直接设置到内部状态存储
    for (const [key, value] of Object.entries(initialState)) {
      this.state.set(key, value)
    }
    
    console.log('[StateService] 初始状态设置完成:', this.state)
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听图实例事件
    if (this.graph) {
      this.setupGraphEventListeners()
    }
  }

  /**
   * 设置图事件监听器
   */
  setupGraphEventListeners() {
    // 检查图实例是否有事件监听方法
    if (!this.graph || typeof this.graph.on !== 'function') {
      console.warn('[StateService] 图实例不支持事件监听，跳过事件绑定')
      return
    }
    
    console.log('[StateService] 开始设置图事件监听器')
    
    try {
      // 节点事件
      this.graph.on('node:added', ({ node }) => {
        console.log('[StateService] 节点添加事件触发:', node.id)
        this.updateNodeState(node.id, node.toJSON ? node.toJSON() : node)
      })
      
      this.graph.on('node:removed', ({ node }) => {
        console.log('[StateService] 节点删除事件触发:', node.id)
        this.removeNodeState(node.id)
      })
      
      this.graph.on('node:moved', ({ node }) => {
        console.log('[StateService] 节点移动事件触发:', node.id)
        const position = node.getPosition ? node.getPosition() : { x: 0, y: 0 }
        this.updateNodePosition(node.id, position)
      })
      
      this.graph.on('node:selected', ({ node }) => {
        this.addToSelection('nodes', node.id)
      })
      
      this.graph.on('node:unselected', ({ node }) => {
        this.removeFromSelection('nodes', node.id)
      })
      
      // 连线事件
      this.graph.on('edge:added', ({ edge }) => {
        this.updateEdgeState(edge.id, edge.toJSON())
      })
      
      this.graph.on('edge:removed', ({ edge }) => {
        this.removeEdgeState(edge.id)
      })
      
      this.graph.on('edge:selected', ({ edge }) => {
        this.addToSelection('edges', edge.id)
      })
      
      this.graph.on('edge:unselected', ({ edge }) => {
        this.removeFromSelection('edges', edge.id)
      })
      
      // 画布事件
      this.graph.on('scale', ({ sx, sy, ox, oy }) => {
        this.updateZoomState({ scale: sx, center: { x: ox, y: oy } })
      })
      
      this.graph.on('translate', ({ tx, ty }) => {
        this.updateViewportState({ x: tx, y: ty })
      })
    } catch (error) {
      console.warn('[StateService] 绑定图事件监听器失败:', error.message)
    }
  }

  /**
   * 设置状态验证器
   */
  setupStateValidators() {
    // 缩放状态验证器
    this.validators.set('zoom', (value) => {
      if (!value || typeof value !== 'object') {
        return { valid: false, error: '缩放状态必须是对象' }
      }
      
      if (typeof value.scale !== 'number' || value.scale <= 0) {
        return { valid: false, error: '缩放比例必须是正数' }
      }
      
      return { valid: true }
    })
    
    // 选择状态验证器
    this.validators.set('selection', (value) => {
      if (!value || typeof value !== 'object') {
        return { valid: false, error: '选择状态必须是对象' }
      }
      
      if (!Array.isArray(value.selectedNodes) || !Array.isArray(value.selectedEdges)) {
        return { valid: false, error: '选择列表必须是数组' }
      }
      
      return { valid: true }
    })
  }

  /**
   * 获取状态
   * @param {string} stateType - 状态类型
   * @param {string} key - 状态键（可选）
   * @returns {*} - 状态值
   */
  getState(stateType, key = null) {
    const stateValue = this.state.get(stateType)
    if (key && stateValue && typeof stateValue === 'object') {
      return stateValue[key]
    }
    return stateValue
  }

  /**
   * 设置状态
   * @param {string} stateType - 状态类型
   * @param {*} value - 状态值
   * @param {Object} options - 选项
   * @returns {boolean} - 是否设置成功
   */
  setState(stateType, value, options = {}) {
    const {
      silent = false,
      persist = this.options.enablePersistence,
      sync = this.options.enableSync,
      validate = this.options.enableValidation,
      batch = false
    } = options
    
    try {
      // 验证状态
      if (validate && this.validators.has(stateType)) {
        const validator = this.validators.get(stateType)
        const result = validator(value)
        if (!result.valid) {
          console.error('❌ [状态管理服务] 状态验证失败:', result.error)
          return false
        }
      }
      
      // 设置状态
      this.state.set(stateType, value)
      this.stats.stateChanges++
      
      // 持久化状态
      if (persist && !batch) {
        this.persistState(stateType, value)
      }
      
      // 同步状态
      if (sync && !batch) {
        this.syncState(stateType, value)
      }
      
      // 触发变更事件
      if (!silent) {
        this.notifyStateChange(stateType, value)
      }
      
      return true
    } catch (error) {
      console.error('❌ [状态管理服务] 设置状态失败:', {
        stateType,
        error: error.message
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * 更新状态
   * @param {string} stateType - 状态类型
   * @param {Object} updates - 更新对象
   * @param {Object} options - 选项
   * @returns {boolean} - 是否更新成功
   */
  updateState(stateType, updates, options = {}) {
    const currentState = this.getState(stateType)
    
    if (!currentState || typeof currentState !== 'object') {
      console.warn('⚠️ [状态管理服务] 无法更新非对象状态:', stateType)
      return false
    }
    
    const newState = { ...currentState, ...updates }
    return this.setState(stateType, newState, options)
  }

  /**
   * 删除状态
   * @param {string} stateType - 状态类型
   * @param {string} key - 状态键（可选）
   * @returns {boolean} - 是否删除成功
   */
  deleteState(stateType, key = null) {
    try {
      if (key) {
        const currentState = this.getState(stateType)
        if (currentState && typeof currentState === 'object') {
          if (currentState instanceof Map) {
            currentState.delete(key)
          } else {
            delete currentState[key]
          }
          return this.setState(stateType, currentState)
        }
      } else {
        return this.stateManager.setState(stateType, undefined)
      }
      
      return false
    } catch (error) {
      console.error('❌ [状态管理服务] 删除状态失败:', {
        stateType,
        key,
        error: error.message
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * 重置状态
   * @param {string} stateType - 状态类型（可选）
   * @returns {boolean} - 是否重置成功
   */
  resetState(stateType = null) {
    try {
      if (stateType) {
        // 重置特定状态
        this.stateManager.resetState(stateType)
      } else {
        // 重置所有状态
        this.setupInitialState()
      }
      
      console.log('🔄 [状态管理服务] 状态重置完成:', stateType || '全部')
      return true
    } catch (error) {
      console.error('❌ [状态管理服务] 重置状态失败:', {
        stateType,
        error: error.message
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * 订阅状态变更
   * @param {string} stateType - 状态类型
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项
   * @returns {string} - 订阅ID
   */
  subscribe(stateType, callback, options = {}) {
    const {
      immediate = false,
      deep = true,
      filter = null
    } = options
    
    const subscriptionId = this.generateSubscriptionId()
    
    const subscription = {
      id: subscriptionId,
      stateType,
      callback,
      options: { immediate, deep, filter },
      created: Date.now()
    }
    
    if (!this.subscribers.has(stateType)) {
      this.subscribers.set(stateType, new Map())
    }
    
    this.subscribers.get(stateType).set(subscriptionId, subscription)
    this.stats.subscriptions++
    
    // 立即执行回调
    if (immediate) {
      const currentState = this.getState(stateType)
      callback(currentState, null, StateChangeType.SET)
    }
    
    console.log('📝 [状态管理服务] 订阅状态变更:', {
      stateType,
      subscriptionId
    })
    
    return subscriptionId
  }

  /**
   * 取消订阅
   * @param {string} subscriptionId - 订阅ID
   * @returns {boolean} - 是否取消成功
   */
  unsubscribe(subscriptionId) {
    for (const [stateType, subscriptions] of this.subscribers) {
      if (subscriptions.has(subscriptionId)) {
        subscriptions.delete(subscriptionId)
        console.log('🗑️ [状态管理服务] 取消订阅:', {
          stateType,
          subscriptionId
        })
        return true
      }
    }
    
    return false
  }

  /**
   * 批量操作
   * @param {Function} operations - 操作函数
   * @returns {Promise} - 操作结果
   */
  async batch(operations) {
    this.isBatching = true
    this.batchQueue = []
    
    try {
      // 执行操作
      await operations()
      
      // 处理批量队列
      if (this.batchQueue.length > 0) {
        await this.processBatchQueue()
      }
      
      console.log('📦 [状态管理服务] 批量操作完成:', {
        operationsCount: this.batchQueue.length
      })
      
      return true
    } catch (error) {
      console.error('❌ [状态管理服务] 批量操作失败:', error.message)
      this.stats.errors++
      return false
    } finally {
      this.isBatching = false
      this.batchQueue = []
    }
  }

  /**
   * 处理批量队列
   */
  async processBatchQueue() {
    const operations = [...this.batchQueue]
    this.batchQueue = []
    
    // 按状态类型分组
    const groupedOperations = new Map()
    
    for (const operation of operations) {
      const { stateType } = operation
      if (!groupedOperations.has(stateType)) {
        groupedOperations.set(stateType, [])
      }
      groupedOperations.get(stateType).push(operation)
    }
    
    // 批量处理每个状态类型
    for (const [stateType, ops] of groupedOperations) {
      await this.processBatchOperations(stateType, ops)
    }
  }

  /**
   * 处理批量操作
   * @param {string} stateType - 状态类型
   * @param {Array} operations - 操作列表
   */
  async processBatchOperations(stateType, operations) {
    try {
      // 合并操作
      let finalState = this.getState(stateType)
      
      for (const operation of operations) {
        const { type, value, updates } = operation
        
        switch (type) {
          case StateChangeType.SET:
            finalState = value
            break
          case StateChangeType.UPDATE:
            if (finalState && typeof finalState === 'object') {
              finalState = { ...finalState, ...updates }
            }
            break
          case StateChangeType.MERGE:
            if (finalState && typeof finalState === 'object') {
              finalState = this.deepMerge(finalState, value)
            }
            break
        }
      }
      
      // 应用最终状态
      await this.setState(stateType, finalState, { batch: false })
      
    } catch (error) {
      console.error('❌ [状态管理服务] 批量操作处理失败:', {
        stateType,
        error: error.message
      })
      this.stats.errors++
    }
  }

  /**
   * 创建状态快照
   * @param {string} name - 快照名称
   * @param {Array} stateTypes - 状态类型列表（可选）
   * @returns {string} - 快照ID
   */
  createSnapshot(name, stateTypes = null) {
    const snapshotId = this.generateSnapshotId()
    
    let snapshot
    if (stateTypes) {
      snapshot = {}
      for (const stateType of stateTypes) {
        snapshot[stateType] = this.getState(stateType)
      }
    } else {
      snapshot = this.stateManager.getState()
    }
    
    this.snapshots.set(snapshotId, {
      id: snapshotId,
      name,
      snapshot,
      stateTypes,
      created: Date.now()
    })
    
    console.log('📸 [状态管理服务] 创建状态快照:', {
      name,
      snapshotId,
      stateTypes: stateTypes || '全部'
    })
    
    return snapshotId
  }

  /**
   * 恢复状态快照
   * @param {string} snapshotId - 快照ID
   * @returns {boolean} - 是否恢复成功
   */
  restoreSnapshot(snapshotId) {
    const snapshotInfo = this.snapshots.get(snapshotId)
    
    if (!snapshotInfo) {
      console.warn('⚠️ [状态管理服务] 快照不存在:', snapshotId)
      return false
    }
    
    try {
      const { snapshot, stateTypes } = snapshotInfo
      
      if (stateTypes) {
        // 恢复特定状态
        for (const stateType of stateTypes) {
          if (snapshot[stateType] !== undefined) {
            this.setState(stateType, snapshot[stateType])
          }
        }
      } else {
        // 恢复所有状态
        this.stateManager.setState(snapshot)
      }
      
      console.log('🔄 [状态管理服务] 恢复状态快照:', {
        snapshotId,
        name: snapshotInfo.name
      })
      
      return true
    } catch (error) {
      console.error('❌ [状态管理服务] 恢复快照失败:', {
        snapshotId,
        error: error.message
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * 删除状态快照
   * @param {string} snapshotId - 快照ID
   * @returns {boolean} - 是否删除成功
   */
  deleteSnapshot(snapshotId) {
    if (this.snapshots.has(snapshotId)) {
      this.snapshots.delete(snapshotId)
      console.log('🗑️ [状态管理服务] 删除状态快照:', snapshotId)
      return true
    }
    
    return false
  }

  /**
   * 获取所有快照
   * @returns {Array} - 快照列表
   */
  getSnapshots() {
    return Array.from(this.snapshots.values()).map(snapshot => ({
      id: snapshot.id,
      name: snapshot.name,
      stateTypes: snapshot.stateTypes,
      created: snapshot.created
    }))
  }

  /**
   * 持久化状态
   * @param {string} stateType - 状态类型
   * @param {*} value - 状态值
   */
  persistState(stateType, value) {
    if (!this.options.enablePersistence) {
      return
    }
    
    try {
      const key = `${this.options.persistenceKey}.${stateType}`
      this.storageUtils.set(key, value, this.options.storageType)
      this.stats.persistenceOperations++
      
      console.log('💾 [状态管理服务] 持久化状态:', stateType)
    } catch (error) {
      console.error('❌ [状态管理服务] 持久化失败:', {
        stateType,
        error: error.message
      })
      this.stats.errors++
    }
  }

  /**
   * 加载持久化状态
   */
  loadPersistedState() {
    if (!this.options.enablePersistence) {
      return
    }
    
    try {
      const stateTypes = Object.values(StateType)
      
      for (const stateType of stateTypes) {
        const key = `${this.options.persistenceKey}.${stateType}`
        const persistedValue = this.storageUtils.get(key, this.options.storageType)
        
        if (persistedValue !== null) {
          this.setState(stateType, persistedValue, { 
            silent: true, 
            persist: false, 
            sync: false 
          })
        }
      }
      
      console.log('📂 [状态管理服务] 加载持久化状态完成')
    } catch (error) {
      console.error('❌ [状态管理服务] 加载持久化状态失败:', error.message)
      this.stats.errors++
    }
  }

  /**
   * 同步状态
   * @param {string} stateType - 状态类型
   * @param {*} value - 状态值
   */
  syncState(stateType, value) {
    if (!this.options.enableSync || this.syncState.isSyncing) {
      return
    }
    
    this.syncState.syncQueue.push({ stateType, value, timestamp: Date.now() })
    
    // 防抖处理
    clearTimeout(this.syncTimeout)
    this.syncTimeout = setTimeout(() => {
      this.processSyncQueue()
    }, this.options.syncDebounce)
  }

  /**
   * 处理同步队列
   */
  async processSyncQueue() {
    if (this.syncState.isSyncing || this.syncState.syncQueue.length === 0) {
      return
    }
    
    this.syncState.isSyncing = true
    
    try {
      const syncData = [...this.syncState.syncQueue]
      this.syncState.syncQueue = []
      
      // 简化版本：直接标记为同步完成
      this.syncState.lastSync = Date.now()
      this.stats.syncOperations++
      
      console.log('🔄 [状态管理服务] 状态同步完成:', {
        itemsCount: syncData.length
      })
      
    } catch (error) {
      console.error('❌ [状态管理服务] 状态同步失败:', error.message)
      this.syncState.syncErrors.push({
        error: error.message,
        timestamp: Date.now()
      })
      this.stats.errors++
    } finally {
      this.syncState.isSyncing = false
    }
  }

  /**
   * 设置同步处理器
   */
  setupSyncHandlers() {
    if (!this.options.enableSync) {
      return
    }
    
    // 在简化版本中不使用外部同步器
    console.log('✅ [状态管理服务] 同步处理器已设置（简化模式）')
  }

  /**
   * 处理状态变更
   * @param {Object} event - 状态变更事件
   */
  handleStateChange(event) {
    const { path, oldValue, newValue, changeType } = event
    
    // 通知订阅者
    this.notifySubscribers(path, oldValue, newValue, changeType)
    
    // 触发变更监听器
    this.triggerChangeListeners(path, oldValue, newValue, changeType)
    
    console.log('🔄 [状态管理服务] 状态变更:', {
      path,
      changeType,
      hasOldValue: oldValue !== undefined,
      hasNewValue: newValue !== undefined
    })
  }

  /**
   * 通知订阅者
   * @param {string} path - 状态路径
   * @param {*} oldValue - 旧值
   * @param {*} newValue - 新值
   * @param {string} changeType - 变更类型
   */
  notifySubscribers(path, oldValue, newValue, changeType) {
    const stateType = path.split('.')[0]
    const subscribers = this.subscribers.get(stateType)
    
    if (!subscribers || subscribers.size === 0) {
      return
    }
    
    for (const subscription of subscribers.values()) {
      try {
        const { callback, options } = subscription
        
        // 应用过滤器
        if (options.filter && !options.filter(newValue, oldValue, changeType)) {
          continue
        }
        
        // 执行回调
        callback(newValue, oldValue, changeType)
        
      } catch (error) {
        console.error('❌ [状态管理服务] 订阅者回调执行错误:', {
          subscriptionId: subscription.id,
          error: error.message
        })
        this.stats.errors++
      }
    }
  }

  /**
   * 触发变更监听器
   * @param {string} path - 状态路径
   * @param {*} oldValue - 旧值
   * @param {*} newValue - 新值
   * @param {string} changeType - 变更类型
   */
  triggerChangeListeners(path, oldValue, newValue, changeType) {
    const listeners = this.changeListeners.get(path) || []
    
    for (const listener of listeners) {
      try {
        listener(newValue, oldValue, changeType)
      } catch (error) {
        console.error('❌ [状态管理服务] 变更监听器执行错误:', {
          path,
          error: error.message
        })
        this.stats.errors++
      }
    }
  }

  // ==================== 便捷方法 ====================

  /**
   * 更新节点状态
   * @param {string} nodeId - 节点ID
   * @param {Object} nodeData - 节点数据
   */
  updateNodeState(nodeId, nodeData) {
    console.log('[StateService] updateNodeState 被调用:', { nodeId, nodeData })
    const nodes = this.getState(StateType.NODES) || new Map()
    console.log('[StateService] 当前 nodes 状态:', nodes)
    nodes.set(nodeId, nodeData)
    console.log('[StateService] 更新后 nodes 状态:', nodes)
    this.setState(StateType.NODES, nodes)
    
    // 验证状态是否正确设置
    const updatedNodes = this.getState(StateType.NODES)
    console.log('[StateService] 验证更新后的状态:', updatedNodes)
    console.log('[StateService] 节点是否存在:', updatedNodes.has(nodeId))
  }

  /**
   * 移除节点状态
   * @param {string} nodeId - 节点ID
   */
  removeNodeState(nodeId) {
    const nodes = this.getState(StateType.NODES) || new Map()
    nodes.delete(nodeId)
    this.setState(StateType.NODES, nodes)
    
    // 同时清理相关状态
    const positions = this.getState(StateType.NODE_POSITIONS) || new Map()
    positions.delete(nodeId)
    this.setState(StateType.NODE_POSITIONS, positions)
  }

  /**
   * 更新节点位置
   * @param {string} nodeId - 节点ID
   * @param {Object} position - 位置信息
   */
  updateNodePosition(nodeId, position) {
    const positions = this.getState(StateType.NODE_POSITIONS) || new Map()
    positions.set(nodeId, position)
    this.setState(StateType.NODE_POSITIONS, positions)
  }

  /**
   * 更新连线状态
   * @param {string} edgeId - 连线ID
   * @param {Object} edgeData - 连线数据
   */
  updateEdgeState(edgeId, edgeData) {
    const edges = this.getState(StateType.EDGES) || new Map()
    edges.set(edgeId, edgeData)
    this.setState(StateType.EDGES, edges)
  }

  /**
   * 移除连线状态
   * @param {string} edgeId - 连线ID
   */
  removeEdgeState(edgeId) {
    const edges = this.getState(StateType.EDGES) || new Map()
    edges.delete(edgeId)
    this.setState(StateType.EDGES, edges)
  }

  /**
   * 更新缩放状态
   * @param {Object} zoomData - 缩放数据
   */
  updateZoomState(zoomData) {
    this.setState(StateType.ZOOM, zoomData)
  }

  /**
   * 更新视口状态
   * @param {Object} viewportData - 视口数据
   */
  updateViewportState(viewportData) {
    this.setState(StateType.VIEWPORT, viewportData)
  }

  /**
   * 添加到选择
   * @param {string} type - 类型（nodes/edges）
   * @param {string} id - ID
   */
  addToSelection(type, id) {
    const selection = this.getState(StateType.SELECTION)
    const key = type === 'nodes' ? 'selectedNodes' : 'selectedEdges'
    
    if (!selection[key].includes(id)) {
      selection[key].push(id)
      this.setState(StateType.SELECTION, selection)
    }
  }

  /**
   * 从选择中移除
   * @param {string} type - 类型（nodes/edges）
   * @param {string} id - ID
   */
  removeFromSelection(type, id) {
    const selection = this.getState(StateType.SELECTION)
    const key = type === 'nodes' ? 'selectedNodes' : 'selectedEdges'
    
    const index = selection[key].indexOf(id)
    if (index !== -1) {
      selection[key].splice(index, 1)
      this.setState(StateType.SELECTION, selection)
    }
  }

  /**
   * 清空选择
   */
  clearSelection() {
    this.setState(StateType.SELECTION, {
      selectedNodes: [],
      selectedEdges: [],
      selectionBox: null
    })
  }

  // ==================== 工具方法 ====================

  /**
   * 深度合并对象
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   * @returns {Object} - 合并后的对象
   */
  deepMerge(target, source) {
    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }

  /**
   * 生成订阅ID
   * @returns {string} - 订阅ID
   */
  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成快照ID
   * @returns {string} - 快照ID
   */
  generateSnapshotId() {
    return `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取服务状态
   * @returns {Object} - 服务状态信息
   */
  getStatus() {
    return {
      initialized: true,
      options: this.options,
      stats: this.stats,
      subscribersCount: Array.from(this.subscribers.values()).reduce((sum, subs) => sum + subs.size, 0),
      snapshotsCount: this.snapshots.size,
      syncState: {
        ...this.syncState,
        syncQueueSize: this.syncState.syncQueue.length,
        syncErrorsCount: this.syncState.syncErrors.length
      },
      stateManagerStatus: { initialized: true, stateCount: this.state.size },
      stateSynchronizerStatus: { initialized: true, syncCount: this.stats.syncOperations }
    }
  }

  /**
   * 销毁服务
   */
  destroy() {
    // 清空订阅者
    this.subscribers.clear()
    this.changeListeners.clear()
    
    // 清空快照
    this.snapshots.clear()
    
    // 清空队列
    this.batchQueue = []
    this.syncState.syncQueue = []
    
    // 清理内部状态
    this.state.clear()
    this.history = []
    this.validators.clear()
    
    // 清理定时器
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
      this.syncTimeout = null
    }
    
    console.log('🗑️ [状态管理服务] 服务已销毁')
  }
}

/**
 * 状态管理服务工厂函数
 * @param {Object} graph - X6 图实例
 * @param {Object} options - 选项
 * @returns {StateService} - 状态管理服务实例
 */
export function createStateService(graph, options = {}) {
  const service = new StateService(options)
  if (graph) {
    service.initialize(graph, options)
  }
  return service
}

/**
 * 默认状态配置
 */
export const DefaultStateConfig = {
  // 持久化配置
  persistence: {
    enabled: true,
    key: 'marketing-canvas-state',
    storageType: 'localStorage',
    include: [
      StateType.USER_PREFERENCES,
      StateType.UI_STATE,
      StateType.LAYOUT,
      StateType.PREVIEW_CONFIG
    ]
  },
  
  // 同步配置
  sync: {
    enabled: true,
    debounce: 200,
    broadcast: false,
    include: [
      StateType.NODES,
      StateType.EDGES,
      StateType.SELECTION,
      StateType.VIEWPORT,
      StateType.ZOOM
    ]
  },
  
  // 历史记录配置
  history: {
    enabled: true,
    maxSize: 50,
    include: [
      StateType.NODES,
      StateType.EDGES,
      StateType.LAYOUT
    ]
  }
}