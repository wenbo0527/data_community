/**
 * 端口配置工厂类
 * 统一管理所有连接的端口配置，确保连接规范性
 */
export class PortConfigurationFactory {
  constructor(options = {}) {
    this.options = {
      enableValidation: true,
      strictMode: false,
      defaultOutPort: 'out',
      defaultInPort: 'in',
      ...options
    }
    
    this.portConfigurations = new Map()
    this.nodeTypeConfigs = new Map()
    
    // 初始化默认端口配置
    this.initializeDefaultConfigs()
    
    console.log('🔧 [PortConfigFactory] 端口配置工厂初始化完成')
  }

  /**
   * 初始化默认端口配置
   */
  initializeDefaultConfigs() {
    // 默认节点类型配置
    const defaultNodeTypes = [
      'start', 'end', 'action', 'condition', 'delay', 'webhook',
      'audience-split', 'event-split', 'ab-test', 'email', 'sms'
    ]

    defaultNodeTypes.forEach(nodeType => {
      this.nodeTypeConfigs.set(nodeType, {
        hasOutPort: nodeType !== 'end',
        hasInPort: nodeType !== 'start',
        outPortName: this.options.defaultOutPort,
        inPortName: this.options.defaultInPort,
        maxOutConnections: nodeType.includes('split') ? -1 : 1,
        maxInConnections: 1
      })
    })
  }

  /**
   * 获取节点的端口配置
   */
  getPortConfiguration(node) {
    if (!node) {
      throw new Error('节点不能为空')
    }

    const nodeId = node.id
    const nodeData = node.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type || 'default'

    // 检查缓存
    if (this.portConfigurations.has(nodeId)) {
      return this.portConfigurations.get(nodeId)
    }

    // 获取节点类型配置
    const typeConfig = this.nodeTypeConfigs.get(nodeType) || {
      hasOutPort: true,
      hasInPort: true,
      outPortName: this.options.defaultOutPort,
      inPortName: this.options.defaultInPort,
      maxOutConnections: 1,
      maxInConnections: 1
    }

    // 创建端口配置
    const portConfig = {
      nodeId,
      nodeType,
      hasOutPort: typeConfig.hasOutPort,
      hasInPort: typeConfig.hasInPort,
      outPortName: typeConfig.outPortName,
      inPortName: typeConfig.inPortName,
      maxOutConnections: typeConfig.maxOutConnections,
      maxInConnections: typeConfig.maxInConnections,
      currentOutConnections: 0,
      currentInConnections: 0,
      
      // 验证方法
      validate: () => this.validatePortConfig(portConfig),
      
      // 检查是否可以创建输出连接
      canCreateOutConnection: () => {
        if (!portConfig.hasOutPort) {return false}
        if (portConfig.maxOutConnections === -1) {return true}
        return portConfig.currentOutConnections < portConfig.maxOutConnections
      },
      
      // 检查是否可以创建输入连接
      canCreateInConnection: () => {
        if (!portConfig.hasInPort) {return false}
        if (portConfig.maxInConnections === -1) {return true}
        return portConfig.currentInConnections < portConfig.maxInConnections
      }
    }

    // 缓存配置
    this.portConfigurations.set(nodeId, portConfig)
    
    return portConfig
  }

  /**
   * 验证端口配置
   */
  validatePortConfig(portConfig) {
    const errors = []
    
    if (!portConfig.nodeId) {
      errors.push('节点ID不能为空')
    }
    
    if (!portConfig.nodeType) {
      errors.push('节点类型不能为空')
    }
    
    if (portConfig.hasOutPort && !portConfig.outPortName) {
      errors.push('输出端口名称不能为空')
    }
    
    if (portConfig.hasInPort && !portConfig.inPortName) {
      errors.push('输入端口名称不能为空')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 更新节点连接数量
   */
  updateConnectionCount(nodeId, portType, delta) {
    const portConfig = this.portConfigurations.get(nodeId)
    if (!portConfig) {return false}

    if (portType === 'out') {
      portConfig.currentOutConnections += delta
      portConfig.currentOutConnections = Math.max(0, portConfig.currentOutConnections)
    } else if (portType === 'in') {
      portConfig.currentInConnections += delta
      portConfig.currentInConnections = Math.max(0, portConfig.currentInConnections)
    }

    return true
  }

  /**
   * 检查连接是否有效
   */
  validateConnection(sourceNode, targetNode, sourcePort = 'out', targetPort = 'in') {
    const sourceConfig = this.getPortConfiguration(sourceNode)
    const targetConfig = this.getPortConfiguration(targetNode)
    
    const errors = []
    
    // 验证源节点输出端口
    if (!sourceConfig.hasOutPort) {
      errors.push(`源节点 ${sourceNode.id} 没有输出端口`)
    }
    
    if (sourcePort !== sourceConfig.outPortName) {
      errors.push(`源端口名称不匹配: 期望 ${sourceConfig.outPortName}, 实际 ${sourcePort}`)
    }
    
    if (!sourceConfig.canCreateOutConnection()) {
      errors.push(`源节点 ${sourceNode.id} 输出连接已达上限`)
    }
    
    // 验证目标节点输入端口
    if (!targetConfig.hasInPort) {
      errors.push(`目标节点 ${targetNode.id} 没有输入端口`)
    }
    
    if (targetPort !== targetConfig.inPortName) {
      errors.push(`目标端口名称不匹配: 期望 ${targetConfig.inPortName}, 实际 ${targetPort}`)
    }
    
    if (!targetConfig.canCreateInConnection()) {
      errors.push(`目标节点 ${targetNode.id} 输入连接已达上限`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sourceConfig,
      targetConfig
    }
  }

  /**
   * 注册自定义节点类型配置
   */
  registerNodeType(nodeType, config) {
    this.nodeTypeConfigs.set(nodeType, {
      hasOutPort: true,
      hasInPort: true,
      outPortName: this.options.defaultOutPort,
      inPortName: this.options.defaultInPort,
      maxOutConnections: 1,
      maxInConnections: 1,
      ...config
    })
    
    console.log(`🔧 [PortConfigFactory] 注册节点类型配置: ${nodeType}`)
  }

  /**
   * 清除节点配置缓存
   */
  clearNodeCache(nodeId) {
    this.portConfigurations.delete(nodeId)
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      cachedConfigurations: this.portConfigurations.size,
      registeredNodeTypes: this.nodeTypeConfigs.size,
      options: this.options
    }
  }

  /**
   * 销毁工厂
   */
  destroy() {
    this.portConfigurations.clear()
    this.nodeTypeConfigs.clear()
    console.log('🗑️ [PortConfigFactory] 端口配置工厂已销毁')
  }
}

export default PortConfigurationFactory