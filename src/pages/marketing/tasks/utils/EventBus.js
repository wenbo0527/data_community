/**
 * 事件总线工具类
 * 提供统一的事件发布订阅机制，用于组件间解耦通信
 * 支持事件命名空间、一次性监听、事件优先级等高级特性
 */

/**
 * 事件总线类
 */
export class EventBus {
  constructor() {
    // 事件监听器存储
    this.listeners = new Map()
    
    // 一次性监听器存储
    this.onceListeners = new Map()
    
    // 事件历史记录
    this.eventHistory = []
    this.maxHistorySize = 100
    
    // 调试模式
    this.debugMode = false
    
    // 事件统计
    this.stats = {
      totalEvents: 0,
      totalListeners: 0,
      eventCounts: new Map()
    }
  }

  /**
   * 监听事件
   * @param {string} event - 事件名称，支持命名空间 (如: 'canvas:node:added')
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 监听选项
   * @returns {Function} - 取消监听的函数
   */
  on(event, handler, options = {}) {
    if (typeof event !== 'string' || !event.trim()) {
      throw new Error('事件名称必须是非空字符串')
    }
    
    if (typeof handler !== 'function') {
      throw new Error('事件处理函数必须是函数')
    }

    // 创建监听器对象
    const listener = {
      handler,
      priority: options.priority || 0,
      namespace: options.namespace || null,
      id: this.generateListenerId(),
      createdAt: Date.now()
    }

    // 添加到监听器列表
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    
    const eventListeners = this.listeners.get(event)
    eventListeners.push(listener)
    
    // 按优先级排序（优先级高的先执行）
    eventListeners.sort((a, b) => b.priority - a.priority)
    
    this.stats.totalListeners++
    
    if (this.debugMode) {
      console.log(`[EventBus] 添加监听器: ${event}`, { listener, totalListeners: this.stats.totalListeners })
    }

    // 返回取消监听的函数
    return () => this.off(event, listener.id)
  }

  /**
   * 一次性监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 监听选项
   * @returns {Function} - 取消监听的函数
   */
  once(event, handler, options = {}) {
    const onceHandler = (...args) => {
      // 执行原处理函数
      handler(...args)
      // 自动移除监听器
      this.off(event, listener.id)
    }

    const listener = {
      handler: onceHandler,
      originalHandler: handler,
      priority: options.priority || 0,
      namespace: options.namespace || null,
      id: this.generateListenerId(),
      createdAt: Date.now(),
      isOnce: true
    }

    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, [])
    }
    
    this.onceListeners.get(event).push(listener)
    
    // 同时添加到普通监听器中
    return this.on(event, onceHandler, options)
  }

  /**
   * 移除事件监听
   * @param {string} event - 事件名称
   * @param {string|Function} handlerOrId - 处理函数或监听器ID
   */
  off(event, handlerOrId) {
    if (!event) {
      // 移除所有监听器
      this.listeners.clear()
      this.onceListeners.clear()
      this.stats.totalListeners = 0
      return
    }

    const eventListeners = this.listeners.get(event)
    if (!eventListeners) return

    if (!handlerOrId) {
      // 移除该事件的所有监听器
      this.stats.totalListeners -= eventListeners.length
      this.listeners.delete(event)
      this.onceListeners.delete(event)
      return
    }

    // 根据ID或处理函数移除
    const isId = typeof handlerOrId === 'string'
    const indexToRemove = eventListeners.findIndex(listener => 
      isId ? listener.id === handlerOrId : listener.handler === handlerOrId
    )

    if (indexToRemove !== -1) {
      eventListeners.splice(indexToRemove, 1)
      this.stats.totalListeners--
      
      if (eventListeners.length === 0) {
        this.listeners.delete(event)
      }
      
      if (this.debugMode) {
        console.log(`[EventBus] 移除监听器: ${event}`, { handlerOrId, totalListeners: this.stats.totalListeners })
      }
    }

    // 同时从一次性监听器中移除
    const onceListeners = this.onceListeners.get(event)
    if (onceListeners) {
      const onceIndex = onceListeners.findIndex(listener => 
        isId ? listener.id === handlerOrId : listener.originalHandler === handlerOrId
      )
      
      if (onceIndex !== -1) {
        onceListeners.splice(onceIndex, 1)
        if (onceListeners.length === 0) {
          this.onceListeners.delete(event)
        }
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @param {Object} options - 触发选项
   * @returns {Array} - 所有处理函数的返回值
   */
  emit(event, data, options = {}) {
    if (typeof event !== 'string' || !event.trim()) {
      throw new Error('事件名称必须是非空字符串')
    }

    const startTime = Date.now()
    const eventData = {
      event,
      data,
      timestamp: startTime,
      source: options.source || 'unknown'
    }

    // 记录事件历史
    this.recordEventHistory(eventData)
    
    // 更新统计信息
    this.updateEventStats(event)

    if (this.debugMode) {
      console.log(`[EventBus] 触发事件: ${event}`, { data, options })
    }

    const results = []
    const eventListeners = this.listeners.get(event)
    
    if (!eventListeners || eventListeners.length === 0) {
      if (this.debugMode) {
        console.log(`[EventBus] 没有找到事件监听器: ${event}`)
      }
      return results
    }

    // 执行所有监听器
    for (const listener of eventListeners) {
      try {
        const result = listener.handler(data, eventData)
        results.push(result)
        
        if (this.debugMode) {
          console.log(`[EventBus] 执行监听器: ${event}`, { listenerId: listener.id, result })
        }
      } catch (error) {
        console.error(`[EventBus] 监听器执行错误: ${event}`, {
          error,
          listenerId: listener.id,
          handler: listener.handler.name || 'anonymous'
        })
        
        // 如果设置了错误处理选项，继续执行其他监听器
        if (!options.stopOnError) {
          results.push({ error: error.message })
        } else {
          throw error
        }
      }
    }

    const duration = Date.now() - startTime
    if (this.debugMode) {
      console.log(`[EventBus] 事件处理完成: ${event}`, {
        listenersCount: eventListeners.length,
        duration: `${duration}ms`,
        results: results.length
      })
    }

    return results
  }

  /**
   * 异步触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @param {Object} options - 触发选项
   * @returns {Promise<Array>} - 所有处理函数的返回值
   */
  async emitAsync(event, data, options = {}) {
    if (typeof event !== 'string' || !event.trim()) {
      throw new Error('事件名称必须是非空字符串')
    }

    const startTime = Date.now()
    const eventData = {
      event,
      data,
      timestamp: startTime,
      source: options.source || 'unknown'
    }

    this.recordEventHistory(eventData)
    this.updateEventStats(event)

    if (this.debugMode) {
      console.log(`[EventBus] 异步触发事件: ${event}`, { data, options })
    }

    const results = []
    const eventListeners = this.listeners.get(event)
    
    if (!eventListeners || eventListeners.length === 0) {
      return results
    }

    // 并行执行所有监听器
    const promises = eventListeners.map(async (listener) => {
      try {
        const result = await listener.handler(data, eventData)
        return result
      } catch (error) {
        console.error(`[EventBus] 异步监听器执行错误: ${event}`, {
          error,
          listenerId: listener.id
        })
        
        if (options.stopOnError) {
          throw error
        }
        
        return { error: error.message }
      }
    })

    try {
      const allResults = await Promise.all(promises)
      results.push(...allResults)
    } catch (error) {
      if (options.stopOnError) {
        throw error
      }
    }

    const duration = Date.now() - startTime
    if (this.debugMode) {
      console.log(`[EventBus] 异步事件处理完成: ${event}`, {
        listenersCount: eventListeners.length,
        duration: `${duration}ms`,
        results: results.length
      })
    }

    return results
  }

  /**
   * 检查是否有监听器
   * @param {string} event - 事件名称
   * @returns {boolean} - 是否有监听器
   */
  hasListeners(event) {
    const listeners = this.listeners.get(event)
    return listeners && listeners.length > 0
  }

  /**
   * 获取事件的监听器数量
   * @param {string} event - 事件名称
   * @returns {number} - 监听器数量
   */
  getListenerCount(event) {
    const listeners = this.listeners.get(event)
    return listeners ? listeners.length : 0
  }

  /**
   * 获取所有事件名称
   * @returns {Array<string>} - 事件名称数组
   */
  getEventNames() {
    return Array.from(this.listeners.keys())
  }

  /**
   * 清空所有监听器
   */
  clear() {
    this.listeners.clear()
    this.onceListeners.clear()
    this.eventHistory = []
    this.stats = {
      totalEvents: 0,
      totalListeners: 0,
      eventCounts: new Map()
    }
    
    if (this.debugMode) {
      console.log('[EventBus] 清空所有监听器')
    }
  }

  /**
   * 启用/禁用调试模式
   * @param {boolean} enabled - 是否启用
   */
  setDebugMode(enabled) {
    this.debugMode = enabled
    console.log(`[EventBus] 调试模式: ${enabled ? '启用' : '禁用'}`)
  }

  /**
   * 获取事件统计信息
   * @returns {Object} - 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      eventNames: this.getEventNames(),
      historySize: this.eventHistory.length
    }
  }

  /**
   * 获取事件历史
   * @param {number} limit - 限制数量
   * @returns {Array} - 事件历史记录
   */
  getEventHistory(limit = 50) {
    return this.eventHistory.slice(-limit)
  }

  // ==================== 内部方法 ====================

  /**
   * 生成监听器ID
   * @returns {string} - 唯一ID
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 记录事件历史
   * @param {Object} eventData - 事件数据
   */
  recordEventHistory(eventData) {
    this.eventHistory.push(eventData)
    
    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }

  /**
   * 更新事件统计
   * @param {string} event - 事件名称
   */
  updateEventStats(event) {
    this.stats.totalEvents++
    
    const currentCount = this.stats.eventCounts.get(event) || 0
    this.stats.eventCounts.set(event, currentCount + 1)
  }
}

/**
 * 全局事件总线实例
 */
export const globalEventBus = new EventBus()

/**
 * 创建新的事件总线实例
 * @param {Object} options - 配置选项
 * @returns {EventBus} - 事件总线实例
 */
export function createEventBus(options = {}) {
  const eventBus = new EventBus()
  
  if (options.debugMode) {
    eventBus.setDebugMode(true)
  }
  
  if (options.maxHistorySize) {
    eventBus.maxHistorySize = options.maxHistorySize
  }
  
  return eventBus
}

/**
 * 事件总线工具函数
 */
export const EventBusUtils = {
  /**
   * 创建命名空间事件名
   * @param {string} namespace - 命名空间
   * @param {string} event - 事件名
   * @returns {string} - 完整事件名
   */
  createNamespacedEvent(namespace, event) {
    return `${namespace}:${event}`
  },

  /**
   * 解析命名空间事件名
   * @param {string} namespacedEvent - 命名空间事件名
   * @returns {Object} - 解析结果
   */
  parseNamespacedEvent(namespacedEvent) {
    const parts = namespacedEvent.split(':')
    return {
      namespace: parts.slice(0, -1).join(':'),
      event: parts[parts.length - 1],
      fullEvent: namespacedEvent
    }
  },

  /**
   * 批量监听事件
   * @param {EventBus} eventBus - 事件总线实例
   * @param {Object} eventHandlers - 事件处理器映射
   * @returns {Array<Function>} - 取消监听函数数组
   */
  batchOn(eventBus, eventHandlers) {
    const unsubscribers = []
    
    for (const [event, handler] of Object.entries(eventHandlers)) {
      const unsubscribe = eventBus.on(event, handler)
      unsubscribers.push(unsubscribe)
    }
    
    return unsubscribers
  },

  /**
   * 批量取消监听
   * @param {Array<Function>} unsubscribers - 取消监听函数数组
   */
  batchOff(unsubscribers) {
    unsubscribers.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    })
  }
}