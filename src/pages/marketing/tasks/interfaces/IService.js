/**
 * 统一服务接口规范
 * 定义所有服务层必须实现的标准接口
 */

/**
 * 服务状态枚举
 */
export const ServiceStatus = {
  UNINITIALIZED: 'uninitialized',
  INITIALIZING: 'initializing',
  READY: 'ready',
  ERROR: 'error',
  DESTROYED: 'destroyed'
}

/**
 * 服务接口契约
 * 所有服务层类都应该实现此接口
 */
export class IService {
  constructor(name, dependencies = []) {
    this.name = name
    this.dependencies = dependencies
    this.status = ServiceStatus.UNINITIALIZED
    this.error = null
    this.eventBus = null
    this.initializationPromise = null
  }

  /**
   * 初始化服务
   * @param {Object} config - 配置参数
   * @param {Object} eventBus - 事件总线实例
   * @returns {Promise<void>}
   */
  async initialize(config = {}, eventBus = null) {
    if (this.status === ServiceStatus.READY) {
      return this.initializationPromise
    }

    if (this.status === ServiceStatus.INITIALIZING) {
      return this.initializationPromise
    }

    this.status = ServiceStatus.INITIALIZING
    this.eventBus = eventBus
    this.error = null

    try {
      this.initializationPromise = this._doInitialize(config)
      await this.initializationPromise
      this.status = ServiceStatus.READY
      this._emitEvent('service:initialized', { name: this.name })
    } catch (error) {
      this.status = ServiceStatus.ERROR
      this.error = error
      this._emitEvent('service:error', { name: this.name, error })
      throw error
    }

    return this.initializationPromise
  }

  /**
   * 销毁服务
   * @returns {Promise<void>}
   */
  async destroy() {
    if (this.status === ServiceStatus.DESTROYED) {
      return
    }

    try {
      await this._doDestroy()
      this.status = ServiceStatus.DESTROYED
      this._emitEvent('service:destroyed', { name: this.name })
    } catch (error) {
      this.error = error
      this._emitEvent('service:error', { name: this.name, error })
      throw error
    }
  }

  /**
   * 重置服务状态
   * @returns {Promise<void>}
   */
  async reset() {
    await this.destroy()
    this.status = ServiceStatus.UNINITIALIZED
    this.error = null
    this.initializationPromise = null
  }

  /**
   * 检查服务是否就绪
   * @returns {boolean}
   */
  isReady() {
    return this.status === ServiceStatus.READY
  }

  /**
   * 检查服务是否有错误
   * @returns {boolean}
   */
  hasError() {
    return this.status === ServiceStatus.ERROR
  }

  /**
   * 获取服务状态信息
   * @returns {Object}
   */
  getStatus() {
    return {
      name: this.name,
      status: this.status,
      error: this.error,
      dependencies: this.dependencies,
      isReady: this.isReady(),
      hasError: this.hasError()
    }
  }

  /**
   * 等待服务就绪
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<void>}
   */
  async waitForReady(timeout = 10000) {
    if (this.isReady()) {
      return
    }

    if (this.hasError()) {
      throw this.error
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Service ${this.name} initialization timeout`))
      }, timeout)

      const checkStatus = () => {
        if (this.isReady()) {
          clearTimeout(timeoutId)
          resolve()
        } else if (this.hasError()) {
          clearTimeout(timeoutId)
          reject(this.error)
        } else {
          setTimeout(checkStatus, 100)
        }
      }

      checkStatus()
    })
  }

  /**
   * 具体的初始化实现（子类必须重写）
   * @param {Object} config - 配置参数
   * @returns {Promise<void>}
   * @protected
   */
  async _doInitialize(config) {
    throw new Error(`Service ${this.name} must implement _doInitialize method`)
  }

  /**
   * 具体的销毁实现（子类必须重写）
   * @returns {Promise<void>}
   * @protected
   */
  async _doDestroy() {
    throw new Error(`Service ${this.name} must implement _doDestroy method`)
  }

  /**
   * 发送事件
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   * @protected
   */
  _emitEvent(event, data) {
    if (this.eventBus && typeof this.eventBus.emit === 'function') {
      this.eventBus.emit(event, data)
    }
  }

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @protected
   */
  _onEvent(event, handler) {
    if (this.eventBus && typeof this.eventBus.on === 'function') {
      this.eventBus.on(event, handler)
    }
  }

  /**
   * 移除事件监听
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @protected
   */
  _offEvent(event, handler) {
    if (this.eventBus && typeof this.eventBus.off === 'function') {
      this.eventBus.off(event, handler)
    }
  }
}

/**
 * 服务配置接口
 */
export class ServiceConfig {
  constructor(options = {}) {
    this.autoStart = options.autoStart !== false
    this.timeout = options.timeout || 10000
    this.retryCount = options.retryCount || 3
    this.retryDelay = options.retryDelay || 1000
    this.dependencies = options.dependencies || []
    this.config = options.config || {}
  }
}

/**
 * 服务错误类
 */
export class ServiceError extends Error {
  constructor(message, serviceName, originalError = null) {
    super(message)
    this.name = 'ServiceError'
    this.serviceName = serviceName
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }
}