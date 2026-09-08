/**
 * 画布数据校验工具
 * 用于在保存任务前校验画布数据的完整性和有效性
 */

/**
 * 校验画布数据
 * @param {Object} canvasData - 画布数据 { nodes, connections }
 * @returns {Object} 校验结果 { isValid, errors, warnings }
 */
export function validateCanvasData(canvasData) {
  const errors = []
  const warnings = []
  
  if (!canvasData) {
    errors.push('画布数据不能为空')
    return { isValid: false, errors, warnings }
  }
  
  const { nodes = [], connections = [] } = canvasData
  
  // 1. 检查是否有节点
  if (nodes.length === 0) {
    errors.push('画布中至少需要一个节点')
    return { isValid: false, errors, warnings }
  }
  
  // 2. 检查是否有开始节点
  const startNodes = nodes.filter(node => node.type === 'start')
  if (startNodes.length === 0) {
    errors.push('画布中必须有一个开始节点')
  } else if (startNodes.length > 1) {
    errors.push('画布中只能有一个开始节点')
  }
  
  // 3. 检查是否有结束节点
  const endNodes = nodes.filter(node => node.type === 'end')
  if (endNodes.length === 0) {
    warnings.push('建议添加结束节点以完善流程')
  }
  
  // 4. 检查节点数据完整性
  const nodeIds = new Set()
  nodes.forEach((node, index) => {
    if (!node.id) {
      errors.push(`第${index + 1}个节点缺少ID`)
    } else {
      // 检查ID唯一性
      if (nodeIds.has(node.id)) {
        errors.push(`节点ID "${node.id}" 重复`)
      } else {
        nodeIds.add(node.id)
      }
    }
    if (!node.type) {
      errors.push(`节点${node.id || index + 1}缺少类型`)
    }
    if (!node.label) {
      warnings.push(`节点${node.id || index + 1}缺少标签`)
    }
    // 支持两种位置格式：node.x/y 或 node.position.x/y
    const x = node.x !== undefined ? node.x : node.position?.x
    const y = node.y !== undefined ? node.y : node.position?.y
    
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      errors.push(`节点${node.id || index + 1}位置信息无效`)
    }
  })
  
  // 5. 检查连接数据完整性
  connections.forEach((connection, index) => {
    if (!connection.id) {
      errors.push(`第${index + 1}个连接缺少ID`)
    }
    if (!connection.source) {
      errors.push(`连接${connection.id || index + 1}缺少源节点`)
    }
    if (!connection.target) {
      errors.push(`连接${connection.id || index + 1}缺少目标节点`)
    }
    
    // 检查连接的节点是否存在
    if (connection.source && !nodes.find(node => node.id === connection.source)) {
      errors.push(`连接${connection.id || index + 1}的源节点不存在`)
    }
    if (connection.target && !nodes.find(node => node.id === connection.target)) {
      errors.push(`连接${connection.id || index + 1}的目标节点不存在`)
    }
  })
  
  // 6. 检查流程连通性
  const connectivityResult = validateFlowConnectivity(nodes, connections)
  errors.push(...connectivityResult.errors)
  warnings.push(...connectivityResult.warnings)
  
  // 7. 检查节点配置完整性
  const configResult = validateNodeConfigurations(nodes)
  errors.push(...configResult.errors)
  warnings.push(...configResult.warnings)
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 校验流程连通性
 * @param {Array} nodes - 节点数组
 * @param {Array} connections - 连接数组
 * @returns {Object} 校验结果
 */
function validateFlowConnectivity(nodes, connections) {
  const errors = []
  const warnings = []
  
  const startNodes = nodes.filter(node => node.type === 'start')
  const endNodes = nodes.filter(node => node.type === 'end')
  
  if (startNodes.length === 0 || endNodes.length === 0) {
    return { errors, warnings }
  }
  
  // 构建连接图
  const outgoingConnections = new Map()
  const incomingConnections = new Map()
  
  connections.forEach(connection => {
    if (!outgoingConnections.has(connection.source)) {
      outgoingConnections.set(connection.source, [])
    }
    outgoingConnections.get(connection.source).push(connection.target)
    
    if (!incomingConnections.has(connection.target)) {
      incomingConnections.set(connection.target, [])
    }
    incomingConnections.get(connection.target).push(connection.source)
  })
  
  // 检查孤立节点
  nodes.forEach(node => {
    const hasIncoming = incomingConnections.has(node.id)
    const hasOutgoing = outgoingConnections.has(node.id)
    
    if (node.type === 'start') {
      if (!hasOutgoing) {
        errors.push('开始节点必须有输出连接')
      }
    } else if (node.type === 'end') {
      if (!hasIncoming) {
        errors.push('结束节点必须有输入连接')
      }
    } else {
      if (!hasIncoming && !hasOutgoing) {
        warnings.push(`节点"${node.label || node.id}"是孤立节点，没有任何连接`)
      } else if (!hasIncoming) {
        warnings.push(`节点"${node.label || node.id}"没有输入连接`)
      } else if (!hasOutgoing) {
        warnings.push(`节点"${node.label || node.id}"没有输出连接`)
      }
    }
  })
  
  // 检查从开始节点到结束节点的可达性
  const startNode = startNodes[0]
  const reachableNodes = new Set()
  const visited = new Set()
  
  function dfs(nodeId) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    reachableNodes.add(nodeId)
    
    const outgoing = outgoingConnections.get(nodeId) || []
    outgoing.forEach(targetId => dfs(targetId))
  }
  
  dfs(startNode.id)
  
  // 检查是否能到达结束节点
  const canReachEnd = endNodes.some(endNode => reachableNodes.has(endNode.id))
  if (!canReachEnd) {
    errors.push('从开始节点无法到达任何结束节点')
  }
  
  // 检查不可达的节点
  nodes.forEach(node => {
    if (node.type !== 'start' && !reachableNodes.has(node.id)) {
      warnings.push(`节点"${node.label || node.id}"从开始节点不可达`)
    }
  })
  
  return { errors, warnings }
}

/**
 * 校验节点配置完整性
 * @param {Array} nodes - 节点数组
 * @returns {Object} 校验结果
 */
function validateNodeConfigurations(nodes) {
  const errors = []
  const warnings = []
  
  nodes.forEach(node => {
    const nodeLabel = node.label || node.id
    
    switch (node.type) {
      case 'sms':
        // 检查是否有配置数据，如果有配置则认为节点已配置
        if (node.data?.config && Object.keys(node.data.config).length > 0) {
          // 节点已配置，跳过验证
          break
        }
        if (!node.data?.content) {
          errors.push(`短信节点"${nodeLabel}"缺少短信内容`)
        }
        if (!node.data?.template) {
          warnings.push(`短信节点"${nodeLabel}"建议配置短信模板`)
        }
        break
        
      case 'ai-call':
        if (!node.data?.script) {
          errors.push(`AI外呼节点"${nodeLabel}"缺少外呼脚本`)
        }
        if (!node.data?.voiceConfig) {
          warnings.push(`AI外呼节点"${nodeLabel}"建议配置语音参数`)
        }
        break
        
      case 'manual-call':
        if (!node.data?.script) {
          errors.push(`人工外呼节点"${nodeLabel}"缺少外呼脚本`)
        }
        if (!node.data?.assignmentRule) {
          warnings.push(`人工外呼节点"${nodeLabel}"建议配置分配规则`)
        }
        break
        
      case 'wait':
        if (!node.data?.duration || node.data.duration <= 0) {
          errors.push(`等待节点"${nodeLabel}"缺少有效的等待时长`)
        }
        break
        
      case 'audience-split':
        if (!node.data?.conditions || node.data.conditions.length === 0) {
          errors.push(`受众分流节点"${nodeLabel}"缺少分流条件`)
        }
        break
        
      case 'event-split':
        if (!node.data?.events || node.data.events.length === 0) {
          errors.push(`事件分流节点"${nodeLabel}"缺少事件配置`)
        }
        break
        
      case 'ab-test':
        if (!node.data?.variants || node.data.variants.length < 2) {
          errors.push(`A/B测试节点"${nodeLabel}"至少需要2个测试变体`)
        }
        break
        
      case 'start':
        if (!node.data?.triggerType) {
          warnings.push(`开始节点"${nodeLabel}"建议配置触发类型`)
        }
        break
    }
  })
  
  return { errors, warnings }
}

/**
 * 格式化校验结果为用户友好的消息
 * @param {Object} validationResult - 校验结果
 * @returns {String} 格式化的消息
 */
export function formatValidationMessage(validationResult) {
  const { isValid, errors, warnings } = validationResult
  
  if (isValid && warnings.length === 0) {
    return '画布数据校验通过'
  }
  
  let message = ''
  
  if (errors.length > 0) {
    message += '错误：\n' + errors.map(error => `• ${error}`).join('\n')
  }
  
  if (warnings.length > 0) {
    if (message) message += '\n\n'
    message += '警告：\n' + warnings.map(warning => `• ${warning}`).join('\n')
  }
  
  return message
}