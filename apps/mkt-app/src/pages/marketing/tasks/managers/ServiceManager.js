/**
 * 服务管理器
 * 统一管理所有服务层实例，处理服务的生命周期和依赖关系
 */

import { ServiceStatus, ServiceError } from '../interfaces/IService.js'
import { EventBus } from '../utils/EventBus.js'

/**
 * 服务管理器类
 * 负责服务的注册、初始化、销毁和依赖管理
 */
export class ServiceManager {
  constructor() {
    this.services = new Map()
    this.serviceConfigs = new Map()
    this.eventBus = new EventBus()
    this.initializationOrder = []
    this.isInitializing = false
    this.isDestroying = false
    
    // 绑定事件处理器
    this._setupEventHandlers()
  }

  /**
   * 注册服务
   * @param {string} name - 服务名称
   * @param {IService} serviceClass - 服务类
   * @param {Object} config - 服务配置
   * @returns {ServiceManager}
   */
  register(name, serviceClass, config = {}) {
    if (this.services.has(name)) {
      throw new ServiceError(`Service ${name} is already registered`, name)
    }

    // 创建服务实例
    const serviceInstance = new serviceClass(name, config.dependencies || [])
    
    this.services.set(name, serviceInstance)
    this.serviceConfigs.set(name, {
      autoStart: config.autoStart !== false,
      timeout: config.timeout || 10000,
      retryCount: config.retryCount || 3,
      retryDelay: config.retryDelay || 1000,
      dependencies: config.dependencies || [],
      config: config.config || {}
    })

    console.log(`[ServiceManager] Service ${name} registered`)
    return this
  }

  /**
   * 获取服务实例
   * @param {string} name - 服务名称
   * @returns {IService|null}
   */
  get(name) {
    return this.services.get(name) || null
  }

  /**
   * 检查服务是否存在
   * @param {string} name - 服务名称
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name)
  }

  /**
   * 初始化所有服务
   * @param {Object} globalConfig - 全局配置
   * @returns {Promise<void>}
   */
  async initializeAll(globalConfig = {}) {
    if (this.isInitializing) {
      throw new ServiceError('Services are already being initialized', 'ServiceManager')
    }

    this.isInitializing = true
    
    try {
      // 计算初始化顺序（基于依赖关系）
      this.initializationOrder = this._calculateInitializationOrder()
      
      console.log(`[ServiceManager] Initializing services in order: ${this.initializationOrder.join(' -> ')}`)

      // 按顺序初始化服务
      for (const serviceName of this.initializationOrder) {
        await this._initializeService(serviceName, globalConfig)
      }

      console.log('[ServiceManager] All services initialized successfully')
      this.eventBus.emit('serviceManager:allInitialized')
      
    } catch (error) {
      console.error('[ServiceManager] Failed to initialize services:', error)
      this.eventBus.emit('serviceManager:initializationFailed', { error })
      throw error
    } finally {
      this.isInitializing = false
    }
  }

  /**
   * 初始化单个服务
   * @param {string} name - 服务名称
   * @param {Object} globalConfig - 全局配置
   * @returns {Promise<void>}
   */
  async initializeService(name, globalConfig = {}) {
    if (!this.has(name)) {
      throw new ServiceError(`Service ${name} is not registered`, name)
    }

    await this._initializeService(name, globalConfig)
  }

  /**
   * 销毁所有服务
   * @returns {Promise<void>}
   */
  async destroyAll() {
    if (this.isDestroying) {
      return
    }

    this.isDestroying = true

    try {
      // 按初始化顺序的逆序销毁服务
      const destructionOrder = [...this.initializationOrder].reverse()
      
      console.log(`[ServiceManager] Destroying services in order: ${destructionOrder.join(' -> ')}`)

      for (const serviceName of destructionOrder) {
        await this._destroyService(serviceName)
      }

      console.log('[ServiceManager] All services destroyed successfully')
      this.eventBus.emit('serviceManager:allDestroyed')
      
    } catch (error) {
      console.error('[ServiceManager] Failed to destroy services:', error)
      this.eventBus.emit('serviceManager:destructionFailed', { error })
      throw error
    } finally {
      this.isDestroying = false
    }
  }

  /**
   * 销毁单个服务
   * @param {string} name - 服务名称
   * @returns {Promise<void>}
   */
  async destroyService(name) {
    if (!this.has(name)) {
      throw new ServiceError(`Service ${name} is not registered`, name)
    }

    await this._destroyService(name)
  }

  /**
   * 重启服务
   * @param {string} name - 服务名称
   * @param {Object} config - 新配置
   * @returns {Promise<void>}
   */
  async restartService(name, config = {}) {
    if (!this.has(name)) {
      throw new ServiceError(`Service ${name} is not registered`, name)
    }

    const service = this.get(name)
    await service.reset()
    await this._initializeService(name, config)
  }

  /**
   * 获取所有服务状态
   * @returns {Object}
   */
  getServicesStatus() {
    const status = {}
    
    for (const [name, service] of this.services) {
      status[name] = service.getStatus()
    }

    return {
      services: status,
      totalServices: this.services.size,
      readyServices: Object.values(status).filter(s => s.isReady).length,
      errorServices: Object.values(status).filter(s => s.hasError).length,
      initializationOrder: this.initializationOrder
    }
  }

  /**
   * 等待所有服务就绪
   * @param {number} timeout - 超时时间
   * @returns {Promise<void>}
   */
  async waitForAllReady(timeout = 30000) {
    const promises = []
    
    for (const [name, service] of this.services) {
      promises.push(service.waitForReady(timeout))
    }

    await Promise.all(promises)
  }

  /**
   * 获取事件总线
   * @returns {EventBus}
   */
  getEventBus() {
    return this.eventBus
  }

  /**
   * 内部方法：初始化单个服务
   * @param {string} name - 服务名称
   * @param {Object} globalConfig - 全局配置
   * @returns {Promise<void>}
   * @private
   */
  async _initializeService(name, globalConfig) {
    const service = this.get(name)
    const config = this.serviceConfigs.get(name)
    
    if (!service || !config) {
      throw new ServiceError(`Service ${name} configuration not found`, name)
    }

    // 检查依赖是否已初始化
    for (const dependency of config.dependencies) {
      const depService = this.get(dependency)
      if (!depService || !depService.isReady()) {
        throw new ServiceError(`Dependency ${dependency} is not ready for service ${name}`, name)
      }
    }

    console.log(`[ServiceManager] Initializing service: ${name}`)
    
    try {
      const mergedConfig = { ...config.config, ...globalConfig }
      await service.initialize(mergedConfig, this.eventBus)
      console.log(`[ServiceManager] Service ${name} initialized successfully`)
    } catch (error) {
      console.error(`[ServiceManager] Failed to initialize service ${name}:`, error)
      throw new ServiceError(`Failed to initialize service ${name}`, name, error)
    }
  }

  /**
   * 内部方法：销毁单个服务
   * @param {string} name - 服务名称
   * @returns {Promise<void>}
   * @private
   */
  async _destroyService(name) {
    const service = this.get(name)
    
    if (!service) {
      return
    }

    console.log(`[ServiceManager] Destroying service: ${name}`)
    
    try {
      // 先从服务映射中移除服务，避免重复注册检查
      this.services.delete(name)
      this.serviceConfigs.delete(name)
      
      // 然后销毁服务实例
      await service.destroy()
      console.log(`[ServiceManager] Service ${name} destroyed successfully`)
    } catch (error) {
      console.error(`[ServiceManager] Failed to destroy service ${name}:`, error)
      throw new ServiceError(`Failed to destroy service ${name}`, name, error)
    }
  }

  /**
   * 计算服务初始化顺序（拓扑排序）
   * @returns {string[]}
   * @private
   */
  _calculateInitializationOrder() {
    const visited = new Set()
    const visiting = new Set()
    const order = []

    const visit = (serviceName) => {
      if (visiting.has(serviceName)) {
        throw new ServiceError(`Circular dependency detected involving service ${serviceName}`, serviceName)
      }
      
      if (visited.has(serviceName)) {
        return
      }

      visiting.add(serviceName)
      
      const config = this.serviceConfigs.get(serviceName)
      if (config && config.dependencies) {
        for (const dependency of config.dependencies) {
          if (!this.has(dependency)) {
            throw new ServiceError(`Dependency ${dependency} is not registered for service ${serviceName}`, serviceName)
          }
          visit(dependency)
        }
      }

      visiting.delete(serviceName)
      visited.add(serviceName)
      order.push(serviceName)
    }

    // 访问所有服务
    for (const serviceName of this.services.keys()) {
      visit(serviceName)
    }

    return order
  }

  /**
   * 设置事件处理器
   * @private
   */
  _setupEventHandlers() {
    // 监听服务错误事件
    this.eventBus.on('service:error', (data) => {
      console.error(`[ServiceManager] Service error in ${data.name}:`, data.error)
    })

    // 监听服务初始化事件
    this.eventBus.on('service:initialized', (data) => {
      console.log(`[ServiceManager] Service ${data.name} initialized`)
    })

    // 监听服务销毁事件
    this.eventBus.on('service:destroyed', (data) => {
      console.log(`[ServiceManager] Service ${data.name} destroyed`)
    })
  }
}

/**
 * 全局服务管理器实例
 */
export const serviceManager = new ServiceManager()

/**
 * 服务管理器工厂函数
 * @returns {ServiceManager}
 */
export function createServiceManager() {
  return new ServiceManager()
}

export default ServiceManager