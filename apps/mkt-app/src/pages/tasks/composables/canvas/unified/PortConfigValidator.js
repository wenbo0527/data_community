import { ref, reactive, computed } from 'vue'

/**
 * 端口配置验证器
 * 负责验证节点端口配置、端口兼容性和端口使用规则
 */
export class PortConfigValidator {
  constructor(options = {}) {
    this.options = {
      enableStrictValidation: true,
      enablePortTypeChecking: true,
      enableCapacityValidation: true,
      defaultPortCapacity: 1,
      ...options
    }
    
    // 端口配置缓存
    this.portConfigs = reactive(new Map())
    
    // 端口类型定义
    this.portTypes = reactive(new Map([
      ['in', { direction: 'input', allowMultiple: true }],
      ['out', { direction: 'output', allowMultiple: false }],
      ['branch-out', { direction: 'output', allowMultiple: true }],
      ['condition-true', { direction: 'output', allowMultiple: false }],
      ['condition-false', { direction: 'output', allowMultiple: false }],
      ['event-trigger', { direction: 'output', allowMultiple: true }]
    ]))
    
    // 节点类型端口规则
    this.nodePortRules = reactive(new Map([
      ['start', {
        requiredPorts: ['out'],
        optionalPorts: [],
        maxPorts: { out: 1 },
        portCapacity: { out: 1 }
      }],
      ['end', {
        requiredPorts: ['in'],
        optionalPorts: [],
        maxPorts: { in: 10 },
        portCapacity: { in: 1 }
      }],
      ['event-split', {
        requiredPorts: ['in', 'branch-out'],
        optionalPorts: ['event-trigger'],
        maxPorts: { in: 1, 'branch-out': 10, 'event-trigger': 5 },
        portCapacity: { in: 1, 'branch-out': 1, 'event-trigger': 1 }
      }],
      ['audience-split', {
        requiredPorts: ['in', 'branch-out'],
        optionalPorts: [],
        maxPorts: { in: 1, 'branch-out': 10 },
        portCapacity: { in: 1, 'branch-out': 1 }
      }],
      ['ab-test', {
        requiredPorts: ['in', 'condition-true', 'condition-false'],
        optionalPorts: [],
        maxPorts: { in: 1, 'condition-true': 1, 'condition-false': 1 },
        portCapacity: { in: 1, 'condition-true': 1, 'condition-false': 1 }
      }],
      ['condition', {
        requiredPorts: ['in', 'condition-true', 'condition-false'],
        optionalPorts: [],
        maxPorts: { in: 1, 'condition-true': 1, 'condition-false': 1 },
        portCapacity: { in: 1, 'condition-true': 1, 'condition-false': 1 }
      }],
      ['delay', {
        requiredPorts: ['in', 'out'],
        optionalPorts: [],
        maxPorts: { in: 1, out: 1 },
        portCapacity: { in: 1, out: 1 }
      }],
      ['action', {
        requiredPorts: ['in', 'out'],
        optionalPorts: [],
        maxPorts: { in: 1, out: 1 },
        portCapacity: { in: 1, out: 1 }
      }]
    ]))
    
    // 端口兼容性矩阵
    this.compatibilityMatrix = reactive(new Map([
      ['out', ['in']],
      ['branch-out', ['in']],
      ['condition-true', ['in']],
      ['condition-false', ['in']],
      ['event-trigger', ['in']],
      ['in', []] // 输入端口不能作为源端口
    ]))
    
    // 初始化状态
    this.isInitialized = ref(false)
    
    // 事件监听器
    this.eventListeners = new Map()
  }
  
  // 初始化验证器
  async initialize() {
    if (this.isInitialized.value) {
      console.warn('⚠️ [端口配置验证器] 已经初始化')
      return
    }
    
    try {
      console.log('🚀 [端口配置验证器] 开始初始化...')
      
      // 预加载常用端口配置
      this.preloadPortConfigs()
      
      this.isInitialized.value = true
      
      console.log('✅ [端口配置验证器] 初始化完成')
      
    } catch (error) {
      console.error('❌ [端口配置验证器] 初始化失败:', error)
      throw error
    }
  }
  
  // 预加载端口配置
  preloadPortConfigs() {
    for (const [nodeType, rules] of this.nodePortRules) {
      const config = this.generatePortConfig(nodeType, rules)
      this.portConfigs.set(nodeType, config)
    }
  }
  
  // 生成端口配置
  generatePortConfig(nodeType, rules) {
    const config = {
      nodeType,
      ports: new Map(),
      rules: { ...rules },
      metadata: {
        createdAt: Date.now(),
        version: '1.0.0'
      }
    }
    
    // 生成必需端口
    for (const portType of rules.requiredPorts) {
      const portInfo = this.createPortInfo(portType, rules, true)
      config.ports.set(portType, portInfo)
    }
    
    // 生成可选端口
    for (const portType of rules.optionalPorts) {
      const portInfo = this.createPortInfo(portType, rules, false)
      config.ports.set(portType, portInfo)
    }
    
    return config
  }
  
  // 创建端口信息
  createPortInfo(portType, rules, isRequired) {
    const typeInfo = this.portTypes.get(portType) || { direction: 'unknown', allowMultiple: false }
    
    return {
      type: portType,
      direction: typeInfo.direction,
      required: isRequired,
      allowMultiple: typeInfo.allowMultiple,
      maxConnections: rules.maxPorts?.[portType] || 1,
      capacity: rules.portCapacity?.[portType] || this.options.defaultPortCapacity,
      currentConnections: 0,
      metadata: {
        createdAt: Date.now()
      }
    }
  }
  
  // 验证节点端口配置
  validateNodePortConfig(nodeType, customConfig = null) {
    const errors = []
    const warnings = []
    
    try {
      // 获取端口配置
      const config = customConfig || this.getPortConfig(nodeType)
      
      if (!config) {
        errors.push(`未找到节点类型 ${nodeType} 的端口配置`)
        return { isValid: false, errors, warnings }
      }
      
      const rules = this.nodePortRules.get(nodeType)
      if (!rules) {
        errors.push(`未找到节点类型 ${nodeType} 的端口规则`)
        return { isValid: false, errors, warnings }
      }
      
      // 验证必需端口
      for (const requiredPort of rules.requiredPorts) {
        if (!config.ports.has(requiredPort)) {
          errors.push(`缺少必需端口: ${requiredPort}`)
        }
      }
      
      // 验证端口数量限制
      for (const [portType, portInfo] of config.ports) {
        const maxAllowed = rules.maxPorts?.[portType]
        if (maxAllowed && portInfo.currentConnections > maxAllowed) {
          errors.push(`端口 ${portType} 连接数超限 (${portInfo.currentConnections}/${maxAllowed})`)
        }
        
        // 警告检查
        if (maxAllowed && portInfo.currentConnections >= maxAllowed * 0.8) {
          warnings.push(`端口 ${portType} 连接数接近上限 (${portInfo.currentConnections}/${maxAllowed})`)
        }
      }
      
      // 验证端口类型
      if (this.options.enablePortTypeChecking) {
        const typeValidation = this.validatePortTypes(config)
        errors.push(...typeValidation.errors)
        warnings.push(...typeValidation.warnings)
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        config
      }
      
    } catch (error) {
      console.error('❌ [端口配置验证器] 节点端口配置验证失败:', error)
      return {
        isValid: false,
        errors: ['端口配置验证过程中发生错误'],
        warnings
      }
    }
  }
  
  // 验证端口类型
  validatePortTypes(config) {
    const errors = []
    const warnings = []
    
    for (const [portType, portInfo] of config.ports) {
      const typeDefinition = this.portTypes.get(portType)
      
      if (!typeDefinition) {
        errors.push(`未知的端口类型: ${portType}`)
        continue
      }
      
      // 验证方向一致性
      if (portInfo.direction !== typeDefinition.direction) {
        errors.push(`端口 ${portType} 方向不匹配: 期望 ${typeDefinition.direction}, 实际 ${portInfo.direction}`)
      }
      
      // 验证多连接支持
      if (!typeDefinition.allowMultiple && portInfo.maxConnections > 1) {
        warnings.push(`端口 ${portType} 不支持多连接，但配置了最大连接数 ${portInfo.maxConnections}`)
      }
    }
    
    return { errors, warnings }
  }
  
  // 验证端口连接
  validatePortConnection(sourceNodeType, targetNodeType, sourcePort, targetPort) {
    const errors = []
    const warnings = []
    
    try {
      // 获取端口配置
      const sourceConfig = this.getPortConfig(sourceNodeType)
      const targetConfig = this.getPortConfig(targetNodeType)
      
      if (!sourceConfig) {
        errors.push(`源节点类型 ${sourceNodeType} 端口配置不存在`)
      }
      if (!targetConfig) {
        errors.push(`目标节点类型 ${targetNodeType} 端口配置不存在`)
      }
      
      if (errors.length > 0) {
        return { isValid: false, errors, warnings }
      }
      
      // 验证源端口
      const sourcePortInfo = sourceConfig.ports.get(sourcePort)
      if (!sourcePortInfo) {
        errors.push(`源节点不存在端口: ${sourcePort}`)
      } else {
        // 检查源端口方向
        if (sourcePortInfo.direction !== 'output') {
          errors.push(`源端口 ${sourcePort} 不是输出端口`)
        }
        
        // 检查源端口连接数
        if (sourcePortInfo.currentConnections >= sourcePortInfo.maxConnections) {
          errors.push(`源端口 ${sourcePort} 连接数已达上限 (${sourcePortInfo.currentConnections}/${sourcePortInfo.maxConnections})`)
        }
      }
      
      // 验证目标端口
      const targetPortInfo = targetConfig.ports.get(targetPort)
      if (!targetPortInfo) {
        errors.push(`目标节点不存在端口: ${targetPort}`)
      } else {
        // 检查目标端口方向
        if (targetPortInfo.direction !== 'input') {
          errors.push(`目标端口 ${targetPort} 不是输入端口`)
        }
        
        // 检查目标端口连接数
        if (targetPortInfo.currentConnections >= targetPortInfo.maxConnections) {
          errors.push(`目标端口 ${targetPort} 连接数已达上限 (${targetPortInfo.currentConnections}/${targetPortInfo.maxConnections})`)
        }
      }
      
      // 验证端口兼容性
      if (sourcePortInfo && targetPortInfo) {
        const compatibility = this.checkPortCompatibility(sourcePort, targetPort)
        if (!compatibility.isCompatible) {
          errors.push(`端口不兼容: ${sourcePort} -> ${targetPort}`)
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
      
    } catch (error) {
      console.error('❌ [端口配置验证器] 端口连接验证失败:', error)
      return {
        isValid: false,
        errors: ['端口连接验证过程中发生错误'],
        warnings
      }
    }
  }
  
  // 检查端口兼容性
  checkPortCompatibility(sourcePort, targetPort) {
    // 提取端口类型（去掉索引）
    const sourcePortType = sourcePort.split('-')[0] || sourcePort
    const targetPortType = targetPort.split('-')[0] || targetPort
    
    const compatibleTargets = this.compatibilityMatrix.get(sourcePortType) || []
    
    return {
      isCompatible: compatibleTargets.includes(targetPortType),
      sourcePortType,
      targetPortType,
      compatibleTargets
    }
  }
  
  // 获取端口配置
  getPortConfig(nodeType) {
    return this.portConfigs.get(nodeType)
  }
  
  // 更新端口连接数
  updatePortConnectionCount(nodeType, portType, operation = 'add') {
    const config = this.getPortConfig(nodeType)
    if (!config) {return false}
    
    const portInfo = config.ports.get(portType)
    if (!portInfo) {return false}
    
    const increment = operation === 'add' ? 1 : -1
    portInfo.currentConnections = Math.max(0, portInfo.currentConnections + increment)
    
    return true
  }
  
  // 重置端口连接数
  resetPortConnectionCount(nodeType, portType) {
    const config = this.getPortConfig(nodeType)
    if (!config) {return false}
    
    const portInfo = config.ports.get(portType)
    if (!portInfo) {return false}
    
    portInfo.currentConnections = 0
    return true
  }
  
  // 获取端口使用情况
  getPortUsageReport(nodeType = null) {
    const report = {
      totalConfigs: this.portConfigs.size,
      nodeTypes: [],
      summary: {
        totalPorts: 0,
        usedPorts: 0,
        overloadedPorts: 0
      }
    }
    
    const configsToCheck = nodeType ? 
      [this.portConfigs.get(nodeType)].filter(Boolean) : 
      Array.from(this.portConfigs.values())
    
    for (const config of configsToCheck) {
      const nodeReport = {
        nodeType: config.nodeType,
        ports: [],
        stats: {
          totalPorts: config.ports.size,
          usedPorts: 0,
          overloadedPorts: 0
        }
      }
      
      for (const [portType, portInfo] of config.ports) {
        const portReport = {
          type: portType,
          direction: portInfo.direction,
          required: portInfo.required,
          currentConnections: portInfo.currentConnections,
          maxConnections: portInfo.maxConnections,
          utilization: portInfo.maxConnections > 0 ? 
            (portInfo.currentConnections / portInfo.maxConnections) : 0,
          isOverloaded: portInfo.currentConnections > portInfo.maxConnections
        }
        
        nodeReport.ports.push(portReport)
        
        if (portInfo.currentConnections > 0) {
          nodeReport.stats.usedPorts++
        }
        if (portInfo.currentConnections > portInfo.maxConnections) {
          nodeReport.stats.overloadedPorts++
        }
      }
      
      report.nodeTypes.push(nodeReport)
      report.summary.totalPorts += nodeReport.stats.totalPorts
      report.summary.usedPorts += nodeReport.stats.usedPorts
      report.summary.overloadedPorts += nodeReport.stats.overloadedPorts
    }
    
    return report
  }
  
  // 创建自定义端口配置
  createCustomPortConfig(nodeType, customRules) {
    const config = this.generatePortConfig(nodeType, customRules)
    this.portConfigs.set(nodeType, config)
    
    this.emit('config:created', { nodeType, config })
    
    return config
  }
  
  // 更新端口配置
  updatePortConfig(nodeType, updates) {
    const config = this.getPortConfig(nodeType)
    if (!config) {
      throw new Error(`端口配置不存在: ${nodeType}`)
    }
    
    // 更新规则
    if (updates.rules) {
      Object.assign(config.rules, updates.rules)
    }
    
    // 更新端口
    if (updates.ports) {
      for (const [portType, portUpdates] of Object.entries(updates.ports)) {
        const portInfo = config.ports.get(portType)
        if (portInfo) {
          Object.assign(portInfo, portUpdates)
        }
      }
    }
    
    // 更新元数据
    config.metadata.updatedAt = Date.now()
    
    this.emit('config:updated', { nodeType, config, updates })
    
    return config
  }
  
  // 添加端口类型
  addPortType(portType, definition) {
    this.portTypes.set(portType, definition)
    
    // 更新兼容性矩阵
    if (definition.compatibleWith) {
      this.compatibilityMatrix.set(portType, definition.compatibleWith)
    }
    
    this.emit('portType:added', { portType, definition })
  }
  
  // 设置端口兼容性
  setPortCompatibility(sourcePortType, compatibleTargets) {
    this.compatibilityMatrix.set(sourcePortType, compatibleTargets)
    
    this.emit('compatibility:updated', { sourcePortType, compatibleTargets })
  }
  
  // 验证所有端口配置
  validateAllConfigs() {
    const results = []
    
    for (const [nodeType, config] of this.portConfigs) {
      const validation = this.validateNodePortConfig(nodeType, config)
      results.push({
        nodeType,
        ...validation
      })
    }
    
    return results
  }
  
  // 事件系统
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }
  
  off(event, callback) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  emit(event, data) {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`❌ [端口配置验证器] 事件回调错误 (${event}):`, error)
      }
    })
  }
  
  // 销毁验证器
  destroy() {
    this.portConfigs.clear()
    this.portTypes.clear()
    this.nodePortRules.clear()
    this.compatibilityMatrix.clear()
    this.eventListeners.clear()
    
    this.isInitialized.value = false
    
    console.log('🗑️ [端口配置验证器] 已销毁')
  }
}

// 创建端口配置验证器实例的工厂函数
export function createPortConfigValidator(options = {}) {
  return new PortConfigValidator(options)
}

export default PortConfigValidator