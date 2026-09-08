import { onMounted, onUnmounted } from 'vue'
import { ErrorHandler } from './ErrorHandler.js'

/**
 * 事件管理器基类
 * 提供统一的事件监听器管理机制，消除重复的事件设置和清理代码
 */
export class EventManagerBase {
  constructor(graph) {
    this.graph = graph
    this.eventListeners = new Map()
    this.domEventListeners = new Map()
    this.isDestroyed = false
  }

  /**
   * 添加图形事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 选项配置
   */
  addGraphEvent(eventName, handler, options = {}) {
    if (this.isDestroyed || !this.graph.value) return

    const wrappedHandler = ErrorHandler.wrapEventHandler(handler, eventName)
    
    // 存储事件监听器信息
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    
    const listenerInfo = {
      handler: wrappedHandler,
      originalHandler: handler,
      options
    }
    
    this.eventListeners.get(eventName).push(listenerInfo)
    
    // 添加到图形
    this.graph.value.on(eventName, wrappedHandler)
    
    console.log(`[EventManager] 添加图形事件监听器: ${eventName}`)
  }

  /**
   * 添加DOM事件监听器
   * @param {Element|string} target - 目标元素或选择器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 选项配置
   */
  addDomEvent(target, eventName, handler, options = {}) {
    if (this.isDestroyed) return

    const element = typeof target === 'string' ? document.querySelector(target) : target
    if (!element) {
      console.warn(`[EventManager] 找不到目标元素: ${target}`)
      return
    }

    const wrappedHandler = ErrorHandler.wrapEventHandler(handler, `${eventName}@${target}`)
    
    // 存储DOM事件监听器信息
    const key = `${element.tagName || 'document'}_${eventName}`
    if (!this.domEventListeners.has(key)) {
      this.domEventListeners.set(key, [])
    }
    
    const listenerInfo = {
      element,
      handler: wrappedHandler,
      originalHandler: handler,
      options
    }
    
    this.domEventListeners.get(key).push(listenerInfo)
    
    // 添加到DOM元素
    element.addEventListener(eventName, wrappedHandler, options)
    
    console.log(`[EventManager] 添加DOM事件监听器: ${eventName} on ${element.tagName || 'document'}`)
  }

  /**
   * 移除图形事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数（可选）
   */
  removeGraphEvent(eventName, handler = null) {
    if (!this.graph.value || !this.eventListeners.has(eventName)) return

    const listeners = this.eventListeners.get(eventName)
    
    if (handler) {
      // 移除特定处理函数
      const index = listeners.findIndex(l => l.originalHandler === handler)
      if (index !== -1) {
        const listenerInfo = listeners[index]
        this.graph.value.off(eventName, listenerInfo.handler)
        listeners.splice(index, 1)
        console.log(`[EventManager] 移除特定图形事件监听器: ${eventName}`)
      }
    } else {
      // 移除所有该事件的监听器
      listeners.forEach(listenerInfo => {
        this.graph.value.off(eventName, listenerInfo.handler)
      })
      this.eventListeners.delete(eventName)
      console.log(`[EventManager] 移除所有图形事件监听器: ${eventName}`)
    }
  }

  /**
   * 移除DOM事件监听器
   * @param {Element|string} target - 目标元素或选择器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数（可选）
   */
  removeDomEvent(target, eventName, handler = null) {
    const element = typeof target === 'string' ? document.querySelector(target) : target
    if (!element) return

    const key = `${element.tagName || 'document'}_${eventName}`
    if (!this.domEventListeners.has(key)) return

    const listeners = this.domEventListeners.get(key)
    
    if (handler) {
      // 移除特定处理函数
      const index = listeners.findIndex(l => l.originalHandler === handler && l.element === element)
      if (index !== -1) {
        const listenerInfo = listeners[index]
        element.removeEventListener(eventName, listenerInfo.handler, listenerInfo.options)
        listeners.splice(index, 1)
        console.log(`[EventManager] 移除特定DOM事件监听器: ${eventName}`)
      }
    } else {
      // 移除该元素上所有该事件的监听器
      listeners.forEach(listenerInfo => {
        if (listenerInfo.element === element) {
          element.removeEventListener(eventName, listenerInfo.handler, listenerInfo.options)
        }
      })
      this.domEventListeners.set(key, listeners.filter(l => l.element !== element))
      console.log(`[EventManager] 移除元素上所有DOM事件监听器: ${eventName}`)
    }
  }

  /**
   * 批量添加图形事件监听器
   * @param {Object} eventMap - 事件映射对象 {eventName: handler}
   */
  addGraphEvents(eventMap) {
    Object.entries(eventMap).forEach(([eventName, handler]) => {
      this.addGraphEvent(eventName, handler)
    })
  }

  /**
   * 批量添加DOM事件监听器
   * @param {Element|string} target - 目标元素
   * @param {Object} eventMap - 事件映射对象 {eventName: handler}
   */
  addDomEvents(target, eventMap) {
    Object.entries(eventMap).forEach(([eventName, handler]) => {
      this.addDomEvent(target, eventName, handler)
    })
  }

  /**
   * 清理所有事件监听器
   */
  cleanup() {
    if (this.isDestroyed) return

    console.log('[EventManager] 开始清理事件监听器')
    
    // 清理图形事件监听器
    this.eventListeners.forEach((listeners, eventName) => {
      listeners.forEach(listenerInfo => {
        if (this.graph.value) {
          this.graph.value.off(eventName, listenerInfo.handler)
        }
      })
    })
    this.eventListeners.clear()

    // 清理DOM事件监听器
    this.domEventListeners.forEach((listeners) => {
      listeners.forEach(listenerInfo => {
        if (listenerInfo.element) {
          listenerInfo.element.removeEventListener(
            listenerInfo.eventName, 
            listenerInfo.handler, 
            listenerInfo.options
          )
        }
      })
    })
    this.domEventListeners.clear()

    this.isDestroyed = true
    console.log('[EventManager] 事件监听器清理完成')
  }

  /**
   * 获取事件监听器统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const graphEventCount = Array.from(this.eventListeners.values())
      .reduce((total, listeners) => total + listeners.length, 0)
    
    const domEventCount = Array.from(this.domEventListeners.values())
      .reduce((total, listeners) => total + listeners.length, 0)

    return {
      graphEvents: graphEventCount,
      domEvents: domEventCount,
      totalEvents: graphEventCount + domEventCount,
      isDestroyed: this.isDestroyed
    }
  }

  /**
   * 检查是否有特定事件监听器
   * @param {string} eventName - 事件名称
   * @param {string} type - 事件类型 ('graph' | 'dom')
   * @returns {boolean} 是否存在
   */
  hasEventListener(eventName, type = 'graph') {
    if (type === 'graph') {
      return this.eventListeners.has(eventName) && this.eventListeners.get(eventName).length > 0
    } else {
      return Array.from(this.domEventListeners.keys()).some(key => key.includes(eventName))
    }
  }
}

/**
 * 创建事件管理器的组合式函数
 * @param {Ref} graph - 图形实例引用
 * @returns {Object} 事件管理器实例和相关方法
 */
export function useEventManager(graph) {
  const eventManager = new EventManagerBase(graph)

  // 在组件挂载时初始化
  onMounted(() => {
    console.log('[EventManager] 事件管理器已初始化')
  })

  // 在组件卸载时清理
  onUnmounted(() => {
    eventManager.cleanup()
  })

  return {
    eventManager,
    addGraphEvent: eventManager.addGraphEvent.bind(eventManager),
    addDomEvent: eventManager.addDomEvent.bind(eventManager),
    removeGraphEvent: eventManager.removeGraphEvent.bind(eventManager),
    removeDomEvent: eventManager.removeDomEvent.bind(eventManager),
    addGraphEvents: eventManager.addGraphEvents.bind(eventManager),
    addDomEvents: eventManager.addDomEvents.bind(eventManager),
    cleanup: eventManager.cleanup.bind(eventManager),
    getStats: eventManager.getStats.bind(eventManager),
    hasEventListener: eventManager.hasEventListener.bind(eventManager)
  }
}