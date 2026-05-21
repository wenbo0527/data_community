/**
 * 节点端口位置验证器
 * 验证节点的端口配置是否符合规范：
 * - 开始节点：只有out端口（底端）
 * - 结束节点：只有in端口（顶端）
 * - 中间节点：同时有in端口（顶端）和out端口（底端）
 */

export class NodePortValidator {
  constructor(options = {}) {
    this.options = {
      enableLogging: true,
      strictMode: false, // 严格模式下会抛出错误
      ...options
    }
  }

  /**
   * 验证所有节点的端口配置
   * @param {Array} nodes - 节点数组
   * @returns {Object} 验证结果
   */
  validateAllNodes(nodes) {
    console.log('🔍 [节点端口验证] 开始验证所有节点的端口配置')
    
    const results = {
      isValid: true,
      totalNodes: nodes.length,
      validNodes: 0,
      invalidNodes: 0,
      nodeResults: [],
      summary: {
        startNodes: { total: 0, valid: 0, invalid: 0 },
        endNodes: { total: 0, valid: 0, invalid: 0 },
        middleNodes: { total: 0, valid: 0, invalid: 0 }
      },
      errors: [],
      warnings: []
    }

    for (const node of nodes) {
      const nodeResult = this.validateSingleNode(node)
      results.nodeResults.push(nodeResult)

      if (nodeResult.isValid) {
        results.validNodes++
      } else {
        results.invalidNodes++
        results.isValid = false
        results.errors.push(...nodeResult.errors)
      }

      results.warnings.push(...nodeResult.warnings)

      // 更新统计信息
      const nodeType = this.getNodeType(node)
      if (nodeType === 'start') {
        results.summary.startNodes.total++
        if (nodeResult.isValid) results.summary.startNodes.valid++
        else results.summary.startNodes.invalid++
      } else if (nodeType === 'end') {
        results.summary.endNodes.total++
        if (nodeResult.isValid) results.summary.endNodes.valid++
        else results.summary.endNodes.invalid++
      } else {
        results.summary.middleNodes.total++
        if (nodeResult.isValid) results.summary.middleNodes.valid++
        else results.summary.middleNodes.invalid++
      }
    }

    this.logValidationSummary(results)
    return results
  }

  /**
   * 验证单个节点的端口配置
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  validateSingleNode(node) {
    const nodeId = node.id
    const nodeData = node.getData() || {}
    const nodeType = this.getNodeType(node)
    const ports = node.getPorts() || []

    console.log(`🔍 [节点端口验证] 验证节点 ${nodeId} (类型: ${nodeType})`)

    const result = {
      nodeId,
      nodeType,
      isValid: true,
      errors: [],
      warnings: [],
      portAnalysis: {
        hasInPort: false,
        hasOutPort: false,
        inPortPosition: null,
        outPortPosition: null,
        portCount: ports.length,
        ports: []
      }
    }

    // 分析端口配置
    this.analyzeNodePorts(node, result.portAnalysis)

    // 根据节点类型验证端口配置
    switch (nodeType) {
      case 'start':
        this.validateStartNode(result)
        break
      case 'end':
        this.validateEndNode(result)
        break
      default:
        this.validateMiddleNode(result)
        break
    }

    // 验证端口位置
    this.validatePortPositions(node, result)

    if (this.options.enableLogging) {
      this.logNodeValidation(result)
    }

    return result
  }

  /**
   * 分析节点的端口配置
   * @param {Object} node - 节点对象
   * @param {Object} portAnalysis - 端口分析结果
   */
  analyzeNodePorts(node, portAnalysis) {
    const ports = node.getPorts() || []
    
    for (const port of ports) {
      const portInfo = {
        id: port.id,
        group: port.group,
        position: this.getPortPosition(node, port)
      }
      
      portAnalysis.ports.push(portInfo)

      if (port.group === 'in' || port.id === 'in') {
        portAnalysis.hasInPort = true
        portAnalysis.inPortPosition = portInfo.position
      }
      
      if (port.group === 'out' || port.id === 'out') {
        portAnalysis.hasOutPort = true
        portAnalysis.outPortPosition = portInfo.position
      }
    }
  }

  /**
   * 验证开始节点
   * @param {Object} result - 验证结果对象
   */
  validateStartNode(result) {
    console.log(`📋 [开始节点验证] 验证节点 ${result.nodeId}`)

    // 开始节点应该只有out端口
    if (!result.portAnalysis.hasOutPort) {
      result.isValid = false
      result.errors.push(`开始节点 ${result.nodeId} 缺少out端口`)
    }

    if (result.portAnalysis.hasInPort) {
      result.isValid = false
      result.errors.push(`开始节点 ${result.nodeId} 不应该有in端口`)
    }

    // 检查out端口位置（应该在底端）
    if (result.portAnalysis.hasOutPort && result.portAnalysis.outPortPosition) {
      const position = result.portAnalysis.outPortPosition
      if (!this.isBottomPosition(position)) {
        result.warnings.push(`开始节点 ${result.nodeId} 的out端口位置不在底端`)
      }
    }
  }

  /**
   * 验证结束节点
   * @param {Object} result - 验证结果对象
   */
  validateEndNode(result) {
    console.log(`📋 [结束节点验证] 验证节点 ${result.nodeId}`)

    // 结束节点应该只有in端口
    if (!result.portAnalysis.hasInPort) {
      result.isValid = false
      result.errors.push(`结束节点 ${result.nodeId} 缺少in端口`)
    }

    if (result.portAnalysis.hasOutPort) {
      result.isValid = false
      result.errors.push(`结束节点 ${result.nodeId} 不应该有out端口`)
    }

    // 检查in端口位置（应该在顶端）
    if (result.portAnalysis.hasInPort && result.portAnalysis.inPortPosition) {
      const position = result.portAnalysis.inPortPosition
      if (!this.isTopPosition(position)) {
        result.warnings.push(`结束节点 ${result.nodeId} 的in端口位置不在顶端`)
      }
    }
  }

  /**
   * 验证中间节点
   * @param {Object} result - 验证结果对象
   */
  validateMiddleNode(result) {
    console.log(`📋 [中间节点验证] 验证节点 ${result.nodeId}`)

    // 中间节点应该同时有in端口和out端口
    if (!result.portAnalysis.hasInPort) {
      result.isValid = false
      result.errors.push(`中间节点 ${result.nodeId} 缺少in端口`)
    }

    if (!result.portAnalysis.hasOutPort) {
      result.isValid = false
      result.errors.push(`中间节点 ${result.nodeId} 缺少out端口`)
    }

    // 检查端口位置
    if (result.portAnalysis.hasInPort && result.portAnalysis.inPortPosition) {
      const position = result.portAnalysis.inPortPosition
      if (!this.isTopPosition(position)) {
        result.warnings.push(`中间节点 ${result.nodeId} 的in端口位置不在顶端`)
      }
    }

    if (result.portAnalysis.hasOutPort && result.portAnalysis.outPortPosition) {
      const position = result.portAnalysis.outPortPosition
      if (!this.isBottomPosition(position)) {
        result.warnings.push(`中间节点 ${result.nodeId} 的out端口位置不在底端`)
      }
    }
  }

  /**
   * 验证端口位置
   * @param {Object} node - 节点对象
   * @param {Object} result - 验证结果对象
   */
  validatePortPositions(node, result) {
    const nodePosition = node.getPosition()
    const nodeSize = node.getSize()

    if (!nodePosition || !nodeSize) {
      result.warnings.push(`节点 ${result.nodeId} 无法获取位置或尺寸信息`)
      return
    }

    // 计算期望的端口位置
    const expectedInPortPosition = {
      x: nodePosition.x + nodeSize.width / 2,  // 节点水平中心
      y: nodePosition.y                        // 节点顶部
    }

    const expectedOutPortPosition = {
      x: nodePosition.x + nodeSize.width / 2,  // 节点水平中心
      y: nodePosition.y + nodeSize.height      // 节点底部
    }

    console.log(`📍 [端口位置验证] 节点 ${result.nodeId}:`, {
      nodePosition,
      nodeSize,
      expectedInPortPosition,
      expectedOutPortPosition,
      actualInPortPosition: result.portAnalysis.inPortPosition,
      actualOutPortPosition: result.portAnalysis.outPortPosition
    })
  }

  /**
   * 获取节点类型
   * @param {Object} node - 节点对象
   * @returns {string} 节点类型
   */
  getNodeType(node) {
    const nodeData = node.getData() || {}
    return nodeData.nodeType || nodeData.type || 'unknown'
  }

  /**
   * 获取端口位置
   * @param {Object} node - 节点对象
   * @param {Object} port - 端口对象
   * @returns {Object|null} 端口位置
   */
  getPortPosition(node, port) {
    try {
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      if (!nodePosition || !nodeSize) return null

      // 根据端口组确定位置
      if (port.group === 'in' || port.id === 'in') {
        return {
          x: nodePosition.x + nodeSize.width / 2,
          y: nodePosition.y,
          position: 'top'
        }
      } else if (port.group === 'out' || port.id === 'out') {
        return {
          x: nodePosition.x + nodeSize.width / 2,
          y: nodePosition.y + nodeSize.height,
          position: 'bottom'
        }
      }

      return null
    } catch (error) {
      console.warn(`获取端口位置失败:`, error)
      return null
    }
  }

  /**
   * 检查是否为顶部位置
   * @param {Object} position - 位置对象
   * @returns {boolean} 是否为顶部位置
   */
  isTopPosition(position) {
    return position && position.position === 'top'
  }

  /**
   * 检查是否为底部位置
   * @param {Object} position - 位置对象
   * @returns {boolean} 是否为底部位置
   */
  isBottomPosition(position) {
    return position && position.position === 'bottom'
  }

  /**
   * 记录节点验证结果
   * @param {Object} result - 验证结果
   */
  logNodeValidation(result) {
    const status = result.isValid ? '✅' : '❌'
    console.log(`${status} [节点验证] ${result.nodeId} (${result.nodeType}):`, {
      isValid: result.isValid,
      hasInPort: result.portAnalysis.hasInPort,
      hasOutPort: result.portAnalysis.hasOutPort,
      portCount: result.portAnalysis.portCount,
      errors: result.errors,
      warnings: result.warnings
    })
  }

  /**
   * 记录验证总结
   * @param {Object} results - 总体验证结果
   */
  logValidationSummary(results) {
    console.log('📊 [节点端口验证总结]:', {
      totalNodes: results.totalNodes,
      validNodes: results.validNodes,
      invalidNodes: results.invalidNodes,
      isValid: results.isValid,
      summary: results.summary,
      errorCount: results.errors.length,
      warningCount: results.warnings.length
    })

    if (results.errors.length > 0) {
      console.error('❌ [验证错误]:', results.errors)
    }

    if (results.warnings.length > 0) {
      console.warn('⚠️ [验证警告]:', results.warnings)
    }
  }
}

export default NodePortValidator