/**
 * GraphService适配器
 * 将现有的GraphService适配为IService接口
 */

import { IService } from '../interfaces/IService.js'
import { createGraphService } from './GraphService.js'

export class GraphServiceAdapter extends IService {
  constructor(name = 'GraphService', dependencies = []) {
    super(name, dependencies)
    this.graphService = null
    this.graph = null
  }

  /**
   * 初始化GraphService
   * @param {Object} config - 配置参数
   * @returns {Promise<void>}
   */
  async _doInitialize(config) {
    if (!config.graph) {
      throw new Error('GraphService requires graph instance in config')
    }

    this.graph = config.graph
    this.graphService = createGraphService(this.graph)
    
    if (this.graphService && typeof this.graphService.initialize === 'function') {
      await this.graphService.initialize()
    }

    console.log(`[${this.name}] GraphService initialized successfully`)
  }

  /**
   * 销毁GraphService
   * @returns {Promise<void>}
   */
  async _doDestroy() {
    if (this.graphService && typeof this.graphService.destroy === 'function') {
      await this.graphService.destroy()
    }
    
    this.graphService = null
    this.graph = null
    
    console.log(`[${this.name}] GraphService destroyed successfully`)
  }

  /**
   * 获取原始GraphService实例
   * @returns {Object|null}
   */
  getGraphService() {
    return this.graphService
  }

  /**
   * 代理GraphService方法
   */
  addNode(nodeData) {
    if (!this.isReady() || !this.graphService) {
      throw new Error('GraphService is not ready')
    }
    return this.graphService.addNode(nodeData)
  }

  removeNode(nodeId) {
    if (!this.isReady() || !this.graphService) {
      throw new Error('GraphService is not ready')
    }
    return this.graphService.removeNode(nodeId)
  }

  updateNode(nodeId, data) {
    if (!this.isReady() || !this.graphService) {
      throw new Error('GraphService is not ready')
    }
    return this.graphService.updateNode(nodeId, data)
  }

  addConnection(connectionData) {
    if (!this.isReady() || !this.graphService) {
      throw new Error('GraphService is not ready')
    }
    return this.graphService.addConnection(connectionData)
  }

  removeConnection(connectionId) {
    if (!this.isReady() || !this.graphService) {
      throw new Error('GraphService is not ready')
    }
    return this.graphService.removeConnection(connectionId)
  }

  getGraphData() {
    if (!this.isReady() || !this.graphService) {
      throw new Error('GraphService is not ready')
    }
    return this.graphService.getGraphData()
  }

  async loadGraphData(data) {
    if (!this.isReady() || !this.graphService) {
      throw new Error('GraphService is not ready')
    }
    return await this.graphService.loadGraphData(data)
  }
}