import { ref, reactive, computed } from 'vue'

/**
 * 连接限制管理器
 * 负责管理节点连接数限制、端口配置验证等连接约束
 */
export class ConnectionLimitManager {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = {
      maxConnectionsPerNode: 10,
      maxIncomingConnections: 5,
      maxOutgoingConnections: 5,
      enablePortValidation: true,
      enableNodeTypeValidation: true,
      enableCircularDependencyCheck: true,
      customLimits: new Map(), // 节点类型特定限制
      ...options
    }
    
    // 连接统计
    this.connectionStats = reactive(new Map())
    
    // 端口使用情况
    this.portUsage = reactive(new Map())
    
    // 节点类型限制配置
    this.nodeTypeLimits = reactive(new Map([
      ['start', { maxOutgoing: 1, maxIncoming: 0 }],
      ['end', { maxOutgoing: 0, maxIncoming: 10 }],
      ['event-split', { maxOutgoing: 10, maxIncoming: 1 }],
      ['audience-split', { maxOutgoing: 10, maxIncoming: 1 }],
      ['ab-test', { maxOutgoing: 2, maxIncoming: 1 }],
      ['delay', { maxOutgoing: 1, maxIncoming: 1 }],
      ['condition', { maxOutgoing: 2, maxIncoming: 1 }],
      ['action', { maxOutgoing: 1, maxIncoming: 1 }]
    ]))
    
    // 端口兼容性规则
    this.portCompatibilityRules = reactive(new Map())
    
    // 初始化状态
    this.isInitialized = ref(false)
    
    // 事件监听器
    this.eventListeners = new Map()
  }
  
  // 初始化管理器
  async initialize() {
    if (this.isInitialized.value) {
      console.warn('⚠️ [连接限制管理器] 已经初始化')
      return
    }
    
    try {
      console.log('🚀 [连接限制管理器] 开始初始化...')
      
      // 扫描现有连接并统计
      await this.scanExistingConnections()
      
      // 设置端口兼容性规则
      this.setupPortCompatibilityRules()
      
      this.isInitialized.value = true
      
      console.log('✅ [连接限制管理器] 初始化完成')
      
    } catch (error) {
      console.error('❌ [连接限制管理器] 初始化失败:', error)
      throw error
    }
  }
  
  // 扫描现有连接
  async scanExistingConnections() {
    if (!this.graph) {return}
    
    const edges = this.graph.getEdges() || []
    
    for (const edge of edges) {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (sourceId && targetId) {
        this.updateConnectionStats(sourceId, targetId, 'add')
        
        // 更新端口使用情况
        const sourcePort = edge.getSourcePortId()
        const targetPort = edge.getTargetPortId()
        
        if (sourcePort) {
          this.updatePortUsage(sourceId, sourcePort, 'out', 'add')
        }
        if (targetPort) {
          this.updatePortUsage(targetId, targetPort, 'in', 'add')
        }
      }
    }
    
    console.log('📊 [连接限制管理器] 连接统计完成:', {
      totalNodes: this.connectionStats.size,
      totalConnections: edges.length
    })
  }
  
  // 设置端口兼容性规则
  setupPortCompatibilityRules() {
    // 设置默认兼容性规则
    this.portCompatibilityRules.set('default', {
      'out': ['in'], // 输出端口只能连接到输入端口
      'in': [] // 输入端口不能作为源端口
    })
    
    // 可以添加特定节点类型的兼容性规则
    this.portCompatibilityRules.set('event-split', {
      'out': ['in'],
      'branch-out': ['in'] // 分支输出端口
    })
  }
  
  // 验证连接是否允许
  async validateConnection(sourceNodeId, targetNodeId, options = {}) {
    const errors = []
    const warnings = []
    
    try {
      // 基本参数验证
      if (!sourceNodeId || !targetNodeId) {
        errors.push('源节点或目标节点ID不能为空')
        return { isValid: false, errors, warnings }
      }
      
      // 检查节点是否存在
      const sourceNode = this.graph.getCellById(sourceNodeId)
      const targetNode = this.graph.getCellById(targetNodeId)
      
      if (!sourceNode) {
        errors.push('源节点不存在')
      }
      if (!targetNode) {
        errors.push('目标节点不存在')
      }
      
      if (errors.length > 0) {
        return { isValid: false, errors, warnings }
      }
      
      // 获取节点数据
      const sourceData = sourceNode.getData() || {}
      const targetData = targetNode.getData() || {}
      const sourceType = sourceData.nodeType || sourceData.type
      const targetType = targetData.nodeType || targetData.type
      
      // 1. 检查自连接
      if (sourceNodeId === targetNodeId) {
        errors.push('不能连接到自身')
      }
      
      // 2. 检查重复连接
      if (this.hasConnection(sourceNodeId, targetNodeId, options.branchId)) {
        errors.push('连接已存在')
      }
      
      // 3. 检查节点类型限制
      if (this.options.enableNodeTypeValidation) {
        const nodeTypeValidation = this.validateNodeTypeConnection(sourceType, targetType)
        if (!nodeTypeValidation.isValid) {
          errors.push(...nodeTypeValidation.errors)
          warnings.push(...nodeTypeValidation.warnings)
        }
      }
      
      // 4. 检查连接数限制
      const connectionLimitValidation = this.validateConnectionLimits(sourceNodeId, targetNodeId, sourceType, targetType)
      if (!connectionLimitValidation.isValid) {
        errors.push(...connectionLimitValidation.errors)
        warnings.push(...connectionLimitValidation.warnings)
      }
      
      // 5. 检查端口限制
      if (this.options.enablePortValidation && (options.sourcePort || options.targetPort)) {
        const portValidation = this.validatePortConnection(
          sourceNodeId, targetNodeId, 
          options.sourcePort, options.targetPort,
          sourceType, targetType
        )
        if (!portValidation.isValid) {
          errors.push(...portValidation.errors)
          warnings.push(...portValidation.warnings)
        }
      }
      
      // 6. 检查循环依赖
      if (this.options.enableCircularDependencyCheck) {
        const circularCheck = await this.checkCircularDependency(sourceNodeId, targetNodeId)
        if (!circularCheck.isValid) {
          errors.push(...circularCheck.errors)
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
      
    } catch (error) {
      console.error('❌ [连接限制管理器] 连接验证失败:', error)
      return {
        isValid: false,
        errors: ['连接验证过程中发生错误'],
        warnings
      }
    }
  }
  
  // 验证节点类型连接
  validateNodeTypeConnection(sourceType, targetType) {
    const errors = []
    const warnings = []
    
    // 检查结束节点不能作为源节点
    if (sourceType === 'end') {
      errors.push('结束节点不能作为连接的源节点')
    }
    
    // 检查开始节点不能作为目标节点
    if (targetType === 'start') {
      errors.push('开始节点不能作为连接的目标节点')
    }
    
    // 检查特定节点类型的连接规则
    if (sourceType === 'condition' && targetType === 'condition') {
      warnings.push('条件节点之间的连接可能导致复杂的逻辑判断')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  // 验证连接数限制
  validateConnectionLimits(sourceNodeId, targetNodeId, sourceType, targetType) {
    const errors = []
    const warnings = []
    
    // 获取当前连接统计
    const sourceStats = this.getNodeConnectionStats(sourceNodeId)
    const targetStats = this.getNodeConnectionStats(targetNodeId)
    
    // 获取节点类型限制
    const sourceLimits = this.getNodeTypeLimits(sourceType)
    const targetLimits = this.getNodeTypeLimits(targetType)
    
    // 检查源节点出向连接数
    if (sourceStats.outgoing >= sourceLimits.maxOutgoing) {
      errors.push(`源节点出向连接数已达上限 (${sourceStats.outgoing}/${sourceLimits.maxOutgoing})`)
    } else if (sourceStats.outgoing >= sourceLimits.maxOutgoing * 0.8) {
      warnings.push(`源节点出向连接数接近上限 (${sourceStats.outgoing}/${sourceLimits.maxOutgoing})`)
    }
    
    // 检查目标节点入向连接数
    if (targetStats.incoming >= targetLimits.maxIncoming) {
      errors.push(`目标节点入向连接数已达上限 (${targetStats.incoming}/${targetLimits.maxIncoming})`)
    } else if (targetStats.incoming >= targetLimits.maxIncoming * 0.8) {
      warnings.push(`目标节点入向连接数接近上限 (${targetStats.incoming}/${targetLimits.maxIncoming})`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  // 验证端口连接
  validatePortConnection(sourceNodeId, targetNodeId, sourcePort, targetPort, sourceType, targetType) {
    const errors = []
    const warnings = []
    
    // 检查源端口是否被占用
    if (sourcePort && this.isPortOccupied(sourceNodeId, sourcePort, 'out')) {
      errors.push(`源端口 ${sourcePort} 已被占用`)
    }
    
    // 检查目标端口是否被占用
    if (targetPort && this.isPortOccupied(targetNodeId, targetPort, 'in')) {
      errors.push(`目标端口 ${targetPort} 已被占用`)
    }
    
    // 检查端口兼容性
    if (sourcePort && targetPort) {
      const compatibility = this.checkPortCompatibility(sourcePort, targetPort, sourceType, targetType)
      if (!compatibility.isCompatible) {
        errors.push(`端口不兼容: ${sourcePort} -> ${targetPort}`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  // 检查循环依赖
  async checkCircularDependency(sourceNodeId, targetNodeId) {
    const errors = []
    
    try {
      // 使用深度优先搜索检查是否会形成循环
      const visited = new Set()
      const path = new Set()
      
      const hasCycle = (nodeId) => {
        if (path.has(nodeId)) {
          return true // 发现循环
        }
        
        if (visited.has(nodeId)) {
          return false // 已访问过，无循环
        }
        
        visited.add(nodeId)
        path.add(nodeId)
        
        // 获取当前节点的所有出向连接
        const outgoingConnections = this.getNodeOutgoingConnections(nodeId)
        
        for (const connection of outgoingConnections) {
          if (hasCycle(connection.targetNodeId)) {
            return true
          }
        }
        
        path.delete(nodeId)
        return false
      }
      
      // 临时添加新连接进行检查
      this.addTemporaryConnection(sourceNodeId, targetNodeId)
      
      const hasCircularDependency = hasCycle(sourceNodeId)
      
      // 移除临时连接
      this.removeTemporaryConnection(sourceNodeId, targetNodeId)
      
      if (hasCircularDependency) {
        errors.push('连接会形成循环依赖')
      }
      
    } catch (error) {
      console.error('❌ [连接限制管理器] 循环依赖检查失败:', error)
      errors.push('循环依赖检查失败')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // 获取节点连接统计
  getNodeConnectionStats(nodeId) {
    return this.connectionStats.get(nodeId) || {
      outgoing: 0,
      incoming: 0,
      total: 0
    }
  }
  
  // 获取节点类型限制
  getNodeTypeLimits(nodeType) {
    const customLimits = this.options.customLimits.get(nodeType)
    if (customLimits) {
      return customLimits
    }
    
    const typeLimits = this.nodeTypeLimits.get(nodeType)
    if (typeLimits) {
      return typeLimits
    }
    
    // 默认限制
    return {
      maxOutgoing: this.options.maxOutgoingConnections,
      maxIncoming: this.options.maxIncomingConnections
    }
  }
  
  // 检查连接是否存在
  hasConnection(sourceNodeId, targetNodeId, branchId = null) {
    const edges = this.graph.getEdges() || []
    
    return edges.some(edge => {
      const edgeSourceId = edge.getSourceCellId()
      const edgeTargetId = edge.getTargetCellId()
      const edgeData = edge.getData() || {}
      
      const matchesNodes = edgeSourceId === sourceNodeId && edgeTargetId === targetNodeId
      const matchesBranch = branchId ? edgeData.branchId === branchId : true
      
      return matchesNodes && matchesBranch
    })
  }
  
  // 检查端口是否被占用
  isPortOccupied(nodeId, port, direction) {
    const portKey = `${nodeId}:${port}:${direction}`
    return this.portUsage.has(portKey)
  }
  
  // 检查端口兼容性
  checkPortCompatibility(sourcePort, targetPort, sourceType, targetType) {
    // 获取源节点类型的兼容性规则
    const sourceRules = this.portCompatibilityRules.get(sourceType) || 
                       this.portCompatibilityRules.get('default')
    
    if (!sourceRules) {
      return { isCompatible: true }
    }
    
    // 提取端口组（去掉具体的端口ID）
    const sourcePortGroup = sourcePort.split('-')[0] || sourcePort
    const targetPortGroup = targetPort.split('-')[0] || targetPort
    
    const compatibleTargets = sourceRules[sourcePortGroup] || []
    
    return {
      isCompatible: compatibleTargets.includes(targetPortGroup)
    }
  }
  
  // 获取节点的出向连接
  getNodeOutgoingConnections(nodeId) {
    const edges = this.graph.getEdges() || []
    
    return edges
      .filter(edge => edge.getSourceCellId() === nodeId)
      .map(edge => ({
        edgeId: edge.id,
        sourceNodeId: nodeId,
        targetNodeId: edge.getTargetCellId(),
        sourcePort: edge.getSourcePortId(),
        targetPort: edge.getTargetPortId()
      }))
  }
  
  // 更新连接统计
  updateConnectionStats(sourceNodeId, targetNodeId, operation = 'add') {
    const increment = operation === 'add' ? 1 : -1
    
    // 更新源节点统计
    const sourceStats = this.connectionStats.get(sourceNodeId) || { outgoing: 0, incoming: 0, total: 0 }
    sourceStats.outgoing += increment
    sourceStats.total += increment
    this.connectionStats.set(sourceNodeId, sourceStats)
    
    // 更新目标节点统计
    const targetStats = this.connectionStats.get(targetNodeId) || { outgoing: 0, incoming: 0, total: 0 }
    targetStats.incoming += increment
    targetStats.total += increment
    this.connectionStats.set(targetNodeId, targetStats)
  }
  
  // 更新端口使用情况
  updatePortUsage(nodeId, port, direction, operation = 'add') {
    const portKey = `${nodeId}:${port}:${direction}`
    
    if (operation === 'add') {
      this.portUsage.set(portKey, true)
    } else {
      this.portUsage.delete(portKey)
    }
  }
  
  // 添加临时连接（用于循环检查）
  addTemporaryConnection(sourceNodeId, targetNodeId) {
    this.updateConnectionStats(sourceNodeId, targetNodeId, 'add')
  }
  
  // 移除临时连接
  removeTemporaryConnection(sourceNodeId, targetNodeId) {
    this.updateConnectionStats(sourceNodeId, targetNodeId, 'remove')
  }
  
  // 连接创建后的回调
  onConnectionCreated(sourceNodeId, targetNodeId, options = {}) {
    this.updateConnectionStats(sourceNodeId, targetNodeId, 'add')
    
    if (options.sourcePort) {
      this.updatePortUsage(sourceNodeId, options.sourcePort, 'out', 'add')
    }
    if (options.targetPort) {
      this.updatePortUsage(targetNodeId, options.targetPort, 'in', 'add')
    }
    
    this.emit('connection:created', { sourceNodeId, targetNodeId, options })
  }
  
  // 连接删除后的回调
  onConnectionRemoved(sourceNodeId, targetNodeId, options = {}) {
    this.updateConnectionStats(sourceNodeId, targetNodeId, 'remove')
    
    if (options.sourcePort) {
      this.updatePortUsage(sourceNodeId, options.sourcePort, 'out', 'remove')
    }
    if (options.targetPort) {
      this.updatePortUsage(targetNodeId, options.targetPort, 'in', 'remove')
    }
    
    this.emit('connection:removed', { sourceNodeId, targetNodeId, options })
  }
  
  // 设置节点类型限制
  setNodeTypeLimit(nodeType, limits) {
    this.nodeTypeLimits.set(nodeType, {
      maxOutgoing: limits.maxOutgoing || this.options.maxOutgoingConnections,
      maxIncoming: limits.maxIncoming || this.options.maxIncomingConnections
    })
  }
  
  // 设置自定义限制
  setCustomLimit(nodeId, limits) {
    this.options.customLimits.set(nodeId, limits)
  }
  
  // 获取连接限制报告
  getConnectionLimitReport() {
    const report = {
      totalNodes: this.connectionStats.size,
      nodeStats: [],
      violations: [],
      warnings: []
    }
    
    for (const [nodeId, stats] of this.connectionStats) {
      const node = this.graph.getCellById(nodeId)
      if (!node) {continue}
      
      const nodeData = node.getData() || {}
      const nodeType = nodeData.nodeType || nodeData.type
      const limits = this.getNodeTypeLimits(nodeType)
      
      const nodeReport = {
        nodeId,
        nodeType,
        stats,
        limits,
        violations: [],
        warnings: []
      }
      
      // 检查违规
      if (stats.outgoing > limits.maxOutgoing) {
        nodeReport.violations.push(`出向连接数超限 (${stats.outgoing}/${limits.maxOutgoing})`)
        report.violations.push({ nodeId, type: 'outgoing_exceeded', ...nodeReport })
      }
      
      if (stats.incoming > limits.maxIncoming) {
        nodeReport.violations.push(`入向连接数超限 (${stats.incoming}/${limits.maxIncoming})`)
        report.violations.push({ nodeId, type: 'incoming_exceeded', ...nodeReport })
      }
      
      // 检查警告
      if (stats.outgoing >= limits.maxOutgoing * 0.8) {
        nodeReport.warnings.push(`出向连接数接近上限 (${stats.outgoing}/${limits.maxOutgoing})`)
        report.warnings.push({ nodeId, type: 'outgoing_warning', ...nodeReport })
      }
      
      if (stats.incoming >= limits.maxIncoming * 0.8) {
        nodeReport.warnings.push(`入向连接数接近上限 (${stats.incoming}/${limits.maxIncoming})`)
        report.warnings.push({ nodeId, type: 'incoming_warning', ...nodeReport })
      }
      
      report.nodeStats.push(nodeReport)
    }
    
    return report
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
        console.error(`❌ [连接限制管理器] 事件回调错误 (${event}):`, error)
      }
    })
  }
  
  // 销毁管理器
  destroy() {
    this.connectionStats.clear()
    this.portUsage.clear()
    this.nodeTypeLimits.clear()
    this.portCompatibilityRules.clear()
    this.eventListeners.clear()
    
    this.isInitialized.value = false
    
    console.log('🗑️ [连接限制管理器] 已销毁')
  }
}

// 创建连接限制管理器实例的工厂函数
export function createConnectionLimitManager(graph, options = {}) {
  return new ConnectionLimitManager(graph, options)
}

export default ConnectionLimitManager