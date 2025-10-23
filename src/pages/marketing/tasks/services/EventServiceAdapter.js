/**
 * EventService适配器
 * 将现有的EventService适配为IService接口
 */

import { IService } from '../interfaces/IService.js'
import { EventService } from './EventService.js'

export class EventServiceAdapter extends IService {
  constructor(name = 'EventService', dependencies = []) {
    super(name, dependencies)
    this.eventService = null
    this.globalEventBus = null
  }

  /**
   * 初始化EventService
   * @param {Object} config - 配置参数
   * @returns {Promise<void>}
   */
  async _doInitialize(config) {
    this.globalEventBus = config.eventBus || this.eventBus
    
    this.eventService = new EventService(this.globalEventBus)
    
    if (this.eventService && typeof this.eventService.initialize === 'function') {
      await this.eventService.initialize()
    }

    console.log(`[${this.name}] EventService initialized successfully`)
  }

  /**
   * 销毁EventService
   * @returns {Promise<void>}
   */
  async _doDestroy() {
    if (this.eventService && typeof this.eventService.destroy === 'function') {
      await this.eventService.destroy()
    }
    
    this.eventService = null
    this.globalEventBus = null
    
    console.log(`[${this.name}] EventService destroyed successfully`)
  }

  /**
   * 获取原始EventService实例
   * @returns {Object|null}
   */
  getEventService() {
    return this.eventService
  }

  /**
   * 代理EventService方法
   */
  on(event, handler) {
    if (!this.isReady() || !this.eventService) {
      throw new Error('EventService is not ready')
    }
    return this.eventService.on(event, handler)
  }

  off(event, handler) {
    if (!this.isReady() || !this.eventService) {
      throw new Error('EventService is not ready')
    }
    return this.eventService.off(event, handler)
  }

  emit(event, data) {
    if (!this.isReady() || !this.eventService) {
      throw new Error('EventService is not ready')
    }
    return this.eventService.emit(event, data)
  }

  once(event, handler) {
    if (!this.isReady() || !this.eventService) {
      throw new Error('EventService is not ready')
    }
    return this.eventService.once ? this.eventService.once(event, handler) : null
  }
}