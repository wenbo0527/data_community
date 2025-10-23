/**
 * LayoutService适配器
 * 将现有的LayoutService适配为IService接口
 */

import { IService } from '../interfaces/IService.js'
import { LayoutService } from './LayoutService.js'

export class LayoutServiceAdapter extends IService {
  constructor(name = 'LayoutService', dependencies = ['GraphService']) {
    super(name, dependencies)
    this.layoutService = null
    this.graph = null
    this.eventBus = null
  }

  /**
   * 初始化LayoutService
   * @param {Object} config - 配置参数
   * @returns {Promise<void>}
   */
  async _doInitialize(config) {
    if (!config.graph) {
      throw new Error('LayoutService requires graph instance in config')
    }

    this.graph = config.graph
    this.eventBus = config.eventBus || this.eventBus
    
    this.layoutService = new LayoutService(this.graph, this.eventBus)
    
    if (this.layoutService && typeof this.layoutService.initialize === 'function') {
      await this.layoutService.initialize()
    }

    console.log(`[${this.name}] LayoutService initialized successfully`)
  }

  /**
   * 销毁LayoutService
   * @returns {Promise<void>}
   */
  async _doDestroy() {
    if (this.layoutService && typeof this.layoutService.destroy === 'function') {
      await this.layoutService.destroy()
    }
    
    this.layoutService = null
    this.graph = null
    this.eventBus = null
    
    console.log(`[${this.name}] LayoutService destroyed successfully`)
  }

  /**
   * 获取原始LayoutService实例
   * @returns {Object|null}
   */
  getLayoutService() {
    return this.layoutService
  }

  /**
   * 代理LayoutService方法
   */
  async executeLayout(layoutType, options = {}) {
    if (!this.isReady() || !this.layoutService) {
      throw new Error('LayoutService is not ready')
    }
    return await this.layoutService.executeLayout(layoutType, options)
  }

  getLayoutStats() {
    if (!this.isReady() || !this.layoutService) {
      throw new Error('LayoutService is not ready')
    }
    return this.layoutService.getLayoutStats ? this.layoutService.getLayoutStats() : {}
  }

  setLayoutDirection(direction) {
    if (!this.isReady() || !this.layoutService) {
      throw new Error('LayoutService is not ready')
    }
    if (this.layoutService.setLayoutDirection) {
      this.layoutService.setLayoutDirection(direction)
    }
  }
}