/**
 * EventCoordinator - 事件监听器协调器
 * 统一管理事件监听器，防止事件监听器累积泄漏
 */
export class EventCoordinator {
  constructor(resourceManager) {
    this.resourceManager = resourceManager
    this.listeners = new Map() // element -> Map(eventType -> Set(handlers))
    this.destroyed = false

    // 在资源管理器中注册自身
    if (this.resourceManager) {
      const resourceId = `EventCoordinator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.resourceManager.register(resourceId, this, () => this.destroy())
    }
  }

  /**
   * 添加事件监听器
   * @param {Element} element - DOM元素
   * @param {string} type - 事件类型
   * @param {Function} handler - 事件处理器
   * @param {Object} options - 事件选项
   * @returns {boolean} 是否成功添加
   */
  addEventListener(element, type, handler, options) {
    if (this.destroyed || !element || !type || typeof handler !== 'function') {
      return false
    }

    try {
      // 检查是否已经存在相同的监听器
      if (this._hasListener(element, type, handler)) {
        return false
      }

      // 添加到DOM元素
      element.addEventListener(type, handler, options)

      // 记录到内部映射
      this._addToMap(element, type, handler, options)

      return true
    } catch (error) {
      console.warn('Failed to add event listener:', error)
      return false
    }
  }

  /**
   * 移除事件监听器
   * @param {Element} element - DOM元素
   * @param {string} type - 事件类型
   * @param {Function} handler - 事件处理器
   * @param {Object} options - 事件选项
   * @returns {boolean} 是否成功移除
   */
  removeEventListener(element, type, handler, options) {
    if (this.destroyed || !element || !type || typeof handler !== 'function') {
      return false
    }

    // 检查是否存在该监听器
    if (!this._hasListener(element, type, handler)) {
      return false
    }

    try {
      // 从DOM元素移除
      element.removeEventListener(type, handler, options)
    } catch (error) {
      console.warn('Failed to remove event listener from DOM:', error)
    }

    // 从内部映射移除
    this._removeFromMap(element, type, handler)

    return true
  }

  /**
   * 移除元素的所有事件监听器
   * @param {Element} element - DOM元素
   * @returns {boolean} 是否成功移除
   */
  removeAllListeners(element) {
    if (this.destroyed || !element || !this.listeners.has(element)) {
      return false
    }

    const elementListeners = this.listeners.get(element)
    let removedCount = 0

    for (const [type, handlerMap] of elementListeners) {
      for (const [handler, listenerInfo] of handlerMap) {
        try {
          element.removeEventListener(type, handler, listenerInfo.options)
          removedCount++
        } catch (error) {
          console.warn(`Failed to remove ${type} listener:`, error)
        }
      }
    }

    // 清理内部映射
    this.listeners.delete(element)

    return removedCount > 0
  }

  /**
   * 清理特定元素的监听器（用于元素被移除时）
   * @param {Element} element - DOM元素
   * @returns {boolean} 是否成功清理
   */
  cleanupElement(element) {
    return this.removeAllListeners(element)
  }

  /**
   * 批量添加事件监听器
   * @param {Array} listeners - 监听器配置数组
   * @returns {boolean} 是否全部成功添加
   */
  addEventListeners(listeners) {
    if (!Array.isArray(listeners)) {
      return false
    }

    let allSuccess = true
    for (const config of listeners) {
      const { element, type, handler, options } = config
      const success = this.addEventListener(element, type, handler, options)
      if (!success) {
        allSuccess = false
      }
    }

    return allSuccess
  }

  /**
   * 获取监听器总数
   * @returns {number}
   */
  getListenerCount() {
    let count = 0
    for (const elementListeners of this.listeners.values()) {
      for (const handlerMap of elementListeners.values()) {
        count += handlerMap.size
      }
    }
    return count
  }

  /**
   * 获取特定元素的监听器数量
   * @param {Element} element - DOM元素
   * @returns {number}
   */
  getElementListenerCount(element) {
    if (!this.listeners.has(element)) {
      return 0
    }

    let count = 0
    const elementListeners = this.listeners.get(element)
    for (const handlerMap of elementListeners.values()) {
      count += handlerMap.size
    }
    return count
  }

  /**
   * 获取所有监听的元素
   * @returns {Element[]}
   */
  getListenedElements() {
    return Array.from(this.listeners.keys())
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    const listenersByElement = {}
    for (const element of this.listeners.keys()) {
      listenersByElement[element.toString()] = this.getElementListenerCount(element)
    }

    return {
      totalListeners: this.getListenerCount(),
      totalElements: this.listeners.size,
      isDestroyed: this.destroyed,
      listenersByElement
    }
  }

  /**
   * 检查是否已销毁
   * @returns {boolean}
   */
  isDestroyed() {
    return this.destroyed
  }

  /**
   * 销毁协调器并清理所有监听器
   */
  destroy() {
    if (this.destroyed) {
      return
    }

    // 清理所有监听器
    const elements = Array.from(this.listeners.keys())
    for (const element of elements) {
      this.removeAllListeners(element)
    }

    // 清理内部状态
    this.listeners.clear()
    this.resourceManager = null
    this.destroyed = true
  }

  /**
   * 检查是否存在特定监听器
   * @private
   */
  _hasListener(element, type, handler) {
    if (!this.listeners.has(element)) {
      return false
    }

    const elementListeners = this.listeners.get(element)
    if (!elementListeners.has(type)) {
      return false
    }

    const handlerMap = elementListeners.get(type)
    return handlerMap.has(handler)
  }

  /**
   * 添加到内部映射
   * @private
   */
  _addToMap(element, type, handler, options) {
    // 确保元素映射存在
    if (!this.listeners.has(element)) {
      this.listeners.set(element, new Map())
    }

    const elementListeners = this.listeners.get(element)

    // 确保事件类型映射存在
    if (!elementListeners.has(type)) {
      elementListeners.set(type, new Map())
    }

    const handlerMap = elementListeners.get(type)

    // 添加处理器
    handlerMap.set(handler, {
      options,
      addedAt: Date.now()
    })
  }

  /**
   * 从内部映射移除
   * @private
   */
  _removeFromMap(element, type, handler) {
    if (!this.listeners.has(element)) {
      return
    }

    const elementListeners = this.listeners.get(element)
    if (!elementListeners.has(type)) {
      return
    }

    const handlerMap = elementListeners.get(type)
    handlerMap.delete(handler)

    // 清理空的映射
    if (handlerMap.size === 0) {
      elementListeners.delete(type)
    }

    if (elementListeners.size === 0) {
      this.listeners.delete(element)
    }
  }
}