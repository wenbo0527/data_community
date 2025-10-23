/**
 * 统一事件总线
 * 提供标准化的事件处理机制，统一组件间通信
 */

import { globalEventBus } from './EventBus.js'

/**
 * 事件类型枚举
 */
export const EventTypes = {
  // 节点相关事件
  NODE_CREATED: 'node:created',
  NODE_UPDATED: 'node:updated',
  NODE_DELETED: 'node:deleted',
  NODE_SELECTED: 'node:selected',
  NODE_MOVED: 'node:moved',
  NODE_CONFIG_UPDATED: 'node:config-updated',
  
  // 连接相关事件
  CONNECTION_CREATED: 'connection:created',
  CONNECTION_UPDATED: 'connection:updated',
  CONNECTION_DELETED: 'connection:deleted',
  CONNECTION_SELECTED: 'connection:selected',
  
  // 画布相关事件
  CANVAS_READY: 'canvas:ready',
  CANVAS_RESET: 'canvas:reset',
  CANVAS_SCALED: 'canvas:scaled',
  CANVAS_TRANSLATED: 'canvas:translated',
  
  // 布局相关事件
  LAYOUT_CHANGED: 'layout:changed',
  LAYOUT_APPLIED: 'layout:applied',
  
  // 配置相关事件
  CONFIG_CONFIRM: 'config:confirm',
  CONFIG_CANCEL: 'config:cancel',
  CONFIG_DRAWER_VISIBILITY_CHANGE: 'config:drawer-visibility-change',
  
  // 预览线相关事件
  PREVIEW_LINE_CREATED: 'preview-line:created',
  PREVIEW_LINE_MOVED: 'preview-line:moved',
  PREVIEW_LINE_CLICKED: 'preview-line:clicked',
  PREVIEW_LINE_RESTORED: 'preview-line:restored',
  
  // 服务相关事件
  SERVICE_INITIALIZED: 'service:initialized',
  SERVICE_ERROR: 'service:error',
  SERVICE_DESTROYED: 'service:destroyed',
  
  // 工具栏相关事件
  TOOLBAR_ACTION: 'toolbar:action',
  
  // 调试相关事件
  DEBUG_PANEL_TOGGLE: 'debug:panel-toggle',
  DEBUG_ACTION: 'debug:action'
}

/**
 * 统一事件总线类
 * 封装全局事件总线，提供类型安全和标准化的事件处理
 */
export class UnifiedEventBus {
  constructor(eventBus = globalEventBus) {
    this.eventBus = eventBus
    this.listeners = new Map()
    this.eventHistory = []
    this.maxHistorySize = 100
  }

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 选项
   * @returns {Function} 取消监听的函数
   */
  on(event, handler, options = {}) {
    if (!event || typeof handler !== 'function') {
      throw new Error('Invalid event or handler')
    }

    // 包装处理函数以支持额外功能
    const wrappedHandler = (data) => {
      try {
        // 记录事件历史
        this._recordEvent(event, data, 'received')
        
        // 调用原始处理函数
        handler(data)
      } catch (error) {
        console.error(`[UnifiedEventBus] Error in event handler for ${event}:`, error)
        this.emit(EventTypes.SERVICE_ERROR, {
          event,
          error,
          handler: handler.name || 'anonymous'
        })
      }
    }

    // 存储监听器信息
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add({ handler, wrappedHandler, options })

    // 注册到底层事件总线
    this.eventBus.on(event, wrappedHandler)

    // 返回取消监听的函数
    return () => this.off(event, handler)
  }

  /**
   * 监听一次性事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @returns {Function} 取消监听的函数
   */
  once(event, handler) {
    const onceHandler = (data) => {
      handler(data)
      this.off(event, onceHandler)
    }
    
    return this.on(event, onceHandler)
  }

  /**
   * 取消监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  off(event, handler) {
    if (!this.listeners.has(event)) {
      return
    }

    const eventListeners = this.listeners.get(event)
    for (const listener of eventListeners) {
      if (listener.handler === handler) {
        // 从底层事件总线取消监听
        this.eventBus.off(event, listener.wrappedHandler)
        
        // 从本地监听器集合中移除
        eventListeners.delete(listener)
        break
      }
    }

    // 如果没有监听器了，清理事件
    if (eventListeners.size === 0) {
      this.listeners.delete(event)
    }
  }

  /**
   * 发送事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    try {
      // 记录事件历史
      this._recordEvent(event, data, 'emitted')
      
      // 发送到底层事件总线
      this.eventBus.emit(event, data)
    } catch (error) {
      console.error(`[UnifiedEventBus] Error emitting event ${event}:`, error)
    }
  }

  /**
   * 清除所有监听器
   */
  clear() {
    for (const [event, listeners] of this.listeners) {
      for (const listener of listeners) {
        this.eventBus.off(event, listener.wrappedHandler)
      }
    }
    this.listeners.clear()
  }

  /**
   * 获取事件监听器数量
   * @param {string} event - 事件名称
   * @returns {number}
   */
  getListenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).size : 0
  }

  /**
   * 获取所有监听的事件
   * @returns {string[]}
   */
  getEvents() {
    return Array.from(this.listeners.keys())
  }

  /**
   * 获取事件历史
   * @param {number} limit - 限制数量
   * @returns {Array}
   */
  getEventHistory(limit = 50) {
    return this.eventHistory.slice(-limit)
  }

  /**
   * 清除事件历史
   */
  clearEventHistory() {
    this.eventHistory = []
  }

  /**
   * 记录事件历史
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @param {string} type - 事件类型（emitted/received）
   * @private
   */
  _recordEvent(event, data, type) {
    const record = {
      event,
      data,
      type,
      timestamp: new Date().toISOString(),
      listeners: this.getListenerCount(event)
    }

    this.eventHistory.push(record)

    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }
}

/**
 * 全局统一事件总线实例
 */
export const unifiedEventBus = new UnifiedEventBus()

/**
 * 事件总线工厂函数
 * @param {Object} eventBus - 底层事件总线实例
 * @returns {UnifiedEventBus}
 */
export function createUnifiedEventBus(eventBus) {
  return new UnifiedEventBus(eventBus)
}

/**
 * 事件处理器装饰器
 * 用于标准化事件处理函数
 */
export function eventHandler(eventType, options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args) {
      try {
        return originalMethod.apply(this, args)
      } catch (error) {
        console.error(`[EventHandler] Error in ${eventType} handler:`, error)
        unifiedEventBus.emit(EventTypes.SERVICE_ERROR, {
          event: eventType,
          error,
          handler: propertyKey
        })
        throw error
      }
    }
    
    return descriptor
  }
}

export default UnifiedEventBus