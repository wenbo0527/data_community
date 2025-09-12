/**
 * SafeMutationObserver - 安全的MutationObserver包装器
 * 解决MutationObserver内存泄漏问题，提供统一的资源管理
 */
export class SafeMutationObserver {
  constructor(callback, resourceManager) {
    this.callback = callback
    this.resourceManager = resourceManager
    this.mutationObserver = null
    this.observedElements = new Set()
    this.isObserving = false
    this.destroyed = false
    this.observerOptions = new Map()

    // 在资源管理器中注册自身
    if (this.resourceManager) {
      const resourceId = `SafeMutationObserver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.resourceManager.register(resourceId, this, () => this.destroy())
    }
  }

  /**
   * 开始观察元素
   * @param {Element} element - 要观察的DOM元素
   * @param {Object} options - MutationObserver选项
   * @returns {boolean} 是否成功开始观察
   */
  observe(element, options) {
    if (this.destroyed || !element || !options) {
      return false
    }

    // 防止重复观察同一元素
    if (this.observedElements.has(element)) {
      return false
    }

    try {
      // 创建MutationObserver（如果还没有）
      if (!this.mutationObserver) {
        this.mutationObserver = new MutationObserver((mutations, observer) => {
          if (!this.destroyed && this.callback) {
            this.callback(mutations, observer)
          }
        })
      }

      // 开始观察
      this.mutationObserver.observe(element, options)
      this.observedElements.add(element)
      this.observerOptions.set(element, options)
      this.isObserving = true

      return true
    } catch (error) {
      console.warn('Failed to create or start MutationObserver:', error)
      return false
    }
  }

  /**
   * 停止观察特定元素
   * @param {Element} element - 要停止观察的元素
   * @returns {boolean} 是否成功停止观察
   */
  unobserve(element) {
    if (this.destroyed || !this.observedElements.has(element)) {
      return false
    }

    // 从观察列表中移除
    this.observedElements.delete(element)
    this.observerOptions.delete(element)

    // 如果没有更多元素需要观察，断开观察器
    if (this.observedElements.size === 0) {
      this.disconnect()
    }

    return true
  }

  /**
   * 断开MutationObserver
   */
  disconnect() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.isObserving = false
    }
  }

  /**
   * 获取当前观察的元素列表
   * @returns {Element[]}
   */
  getObservedElements() {
    return Array.from(this.observedElements)
  }

  /**
   * 获取观察器状态
   * @returns {Object}
   */
  getStatus() {
    return {
      isObserving: this.isObserving,
      observedElementsCount: this.observedElements.size,
      isDestroyed: this.destroyed
    }
  }

  /**
   * 销毁观察器并清理所有资源
   */
  destroy() {
    if (this.destroyed) {
      return
    }

    // 断开观察器
    this.disconnect()

    // 清理观察的元素
    this.observedElements.clear()
    this.observerOptions.clear()

    // 清理MutationObserver
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }

    // 清理回调引用
    this.callback = null
    this.resourceManager = null

    // 标记为已销毁
    this.destroyed = true
    this.isObserving = false
  }
}