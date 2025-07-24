/**
 * 增强版画布数据校验工具
 * 用于保存和发布时的完整性校验，包含循环检测和自动修复功能
 */

import { validateCanvasData, formatValidationMessage } from './canvasValidation.js'

/**
 * 发布前的完整校验
 * @param {Object} canvasData - 画布数据 { nodes, connections }
 * @param {Object} options - 校验选项 { autoFix, previewLines }
 * @returns {Object} 校验结果和修复建议
 */
export function validateForPublish(canvasData, options = {}) {
  const { autoFix = false, previewLines = [] } = options
  const result = {
    isValid: false,
    errors: [],
    warnings: [],
    autoFixedData: null,
    canAutoFix: false
  }

  if (!canvasData || !canvasData.nodes) {
    result.errors.push('画布数据不能为空')
    return result
  }

  let { nodes, connections = [] } = canvasData
  let fixedNodes = [...nodes]
  let fixedConnections = [...connections]
  let hasAutoFix = false

  // 1. 基础校验
  const basicValidation = validateCanvasData({ nodes: fixedNodes, connections: fixedConnections })
  result.errors.push(...basicValidation.errors)
  result.warnings.push(...basicValidation.warnings)

  // 2. 检查开始节点数量
  const startNodes = fixedNodes.filter(node => node.type === 'start')
  if (startNodes.length === 0) {
    result.errors.push('必须有且仅有一个开始节点')
  } else if (startNodes.length > 1) {
    result.errors.push('只能有一个开始节点')
  }

  // 3. 检查开始节点的输出连接数量
  if (startNodes.length === 1) {
    const startNodeId = startNodes[0].id
    const startNodeOutConnections = fixedConnections.filter(conn => conn.source === startNodeId)
    if (startNodeOutConnections.length === 0) {
      result.errors.push('开始节点必须有输出连接')
    } else if (startNodeOutConnections.length > 1) {
      result.errors.push('开始节点只能有一个输出连接')
    }
  }

  // 4. 检查结束节点的输入连接数量
  const endNodes = fixedNodes.filter(node => node.type === 'end')
  endNodes.forEach(endNode => {
    const endNodeInConnections = fixedConnections.filter(conn => conn.target === endNode.id)
    if (endNodeInConnections.length === 0) {
      result.errors.push(`结束节点"${endNode.label || endNode.id}"必须有输入连接`)
    } else if (endNodeInConnections.length > 1) {
      result.errors.push(`结束节点"${endNode.label || endNode.id}"只能有一个输入连接`)
    }
  })

  // 5. 检查循环依赖
  const cycleResult = detectCycles(fixedNodes, fixedConnections)
  if (cycleResult.hasCycles) {
    result.errors.push('流程中存在循环依赖')
    cycleResult.cycles.forEach(cycle => {
      result.errors.push(`循环路径: ${cycle.join(' → ')}`)
    })
  }

  // 6. 检查是否需要添加结束节点
  const nodesNeedingEndNodes = findNodesNeedingEndNodes(fixedNodes, fixedConnections, previewLines)
  if (nodesNeedingEndNodes.length > 0) {
    result.canAutoFix = true
    if (autoFix) {
      // 自动修复：为没有后续节点的节点添加结束节点
      const fixResult = autoAddEndNodes(fixedNodes, fixedConnections, previewLines)
      if (fixResult.modified) {
        fixedNodes = fixResult.nodes
        fixedConnections = fixResult.connections
        hasAutoFix = true
        result.warnings.push(`自动添加了 ${fixResult.addedEndNodes} 个结束节点`)
      }
    } else {
      result.warnings.push(`以下节点没有后续连接，建议添加结束节点: ${nodesNeedingEndNodes.map(n => n.label || n.id).join(', ')}`)
    }
  }

  // 7. 检查节点配置完整性
  const incompleteNodes = findIncompleteNodes(fixedNodes)
  if (incompleteNodes.length > 0) {
    incompleteNodes.forEach(node => {
      result.warnings.push(`节点"${node.label || node.id}"配置不完整，请补充配置信息`)
    })
  }

  // 8. 最终校验
  if (result.errors.length === 0) {
    result.isValid = true
  }

  if (hasAutoFix) {
    result.autoFixedData = {
      nodes: fixedNodes,
      connections: fixedConnections
    }
  }

  return result
}

/**
 * 检测流程中的循环依赖
 * @param {Array} nodes - 节点数组
 * @param {Array} connections - 连接数组
 * @returns {Object} 循环检测结果
 */
export function detectCycles(nodes, connections) {
  const result = {
    hasCycles: false,
    cycles: []
  }

  // 构建邻接表
  const graph = new Map()
  nodes.forEach(node => {
    graph.set(node.id, [])
  })

  connections.forEach(connection => {
    if (graph.has(connection.source)) {
      graph.get(connection.source).push(connection.target)
    }
  })

  // DFS检测循环
  const visited = new Set()
  const recursionStack = new Set()
  const currentPath = []

  function dfs(nodeId) {
    if (recursionStack.has(nodeId)) {
      // 找到循环
      const cycleStart = currentPath.indexOf(nodeId)
      const cycle = currentPath.slice(cycleStart).concat([nodeId])
      result.cycles.push(cycle)
      result.hasCycles = true
      return true
    }

    if (visited.has(nodeId)) {
      return false
    }

    visited.add(nodeId)
    recursionStack.add(nodeId)
    currentPath.push(nodeId)

    const neighbors = graph.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    currentPath.pop()
    return false
  }

  // 对所有节点进行DFS
  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId)
    }
  }

  return result
}

/**
 * 查找需要添加结束节点的节点
 * @param {Array} nodes - 节点数组
 * @param {Array} connections - 连接数组
 * @param {Array} previewLines - 预览线数组
 * @returns {Array} 需要添加结束节点的节点列表
 */
export function findNodesNeedingEndNodes(nodes, connections, previewLines = []) {
  const nodesWithOutgoing = new Set()
  
  // 统计有真实连接的节点
  connections.forEach(connection => {
    nodesWithOutgoing.add(connection.source)
  })

  // 查找有预览线但没有真实连接的节点
  const nodesWithPreviewLines = new Set()
  previewLines.forEach(previewLine => {
    if (previewLine.sourceNodeId) {
      nodesWithPreviewLines.add(previewLine.sourceNodeId)
    }
  })

  return nodes.filter(node => {
    // 排除已经是结束节点的
    if (node.type === 'end') return false
    
    // 查找没有输出连接但有预览线的节点，或者完全没有输出的节点
    const hasRealConnection = nodesWithOutgoing.has(node.id)
    const hasPreviewLine = nodesWithPreviewLines.has(node.id)
    
    // 如果有预览线但没有真实连接，需要添加结束节点
    // 如果既没有预览线也没有真实连接，也需要添加结束节点
    return !hasRealConnection && (hasPreviewLine || !hasRealConnection)
  })
}

/**
 * 自动为没有后续节点的节点添加结束节点
 * @param {Array} nodes - 节点数组
 * @param {Array} connections - 连接数组
 * @param {Array} previewLines - 预览线数组
 * @returns {Object} 修复结果
 */
export function autoAddEndNodes(nodes, connections, previewLines = []) {
  const result = {
    modified: false,
    nodes: [...nodes],
    connections: [...connections],
    addedEndNodes: 0
  }

  const nodesNeedingEndNodes = findNodesNeedingEndNodes(nodes, connections, previewLines)
  
  if (nodesNeedingEndNodes.length === 0) {
    return result
  }

  // 创建预览线位置映射
  const previewLinePositions = new Map()
  previewLines.forEach(previewLine => {
    if (previewLine.sourceNodeId && previewLine.position) {
      if (!previewLinePositions.has(previewLine.sourceNodeId)) {
        previewLinePositions.set(previewLine.sourceNodeId, [])
      }
      previewLinePositions.get(previewLine.sourceNodeId).push({
        position: previewLine.position,
        branchId: previewLine.branchId,
        branchLabel: previewLine.branchLabel
      })
    }
  })

  nodesNeedingEndNodes.forEach((node, index) => {
    const nodePreviewLines = previewLinePositions.get(node.id) || []
    
    if (nodePreviewLines.length > 0) {
      // 为每个预览线创建结束节点
      nodePreviewLines.forEach((previewInfo, branchIndex) => {
        const endNodeId = `end_${node.id}_${previewInfo.branchId || 'default'}_${Date.now()}_${branchIndex}`
        const endNode = {
          id: endNodeId,
          type: 'end',
          label: '结束',
          position: {
            x: previewInfo.position.x || (node.position.x + 200),
            y: previewInfo.position.y || (node.position.y + branchIndex * 80)
          },
          data: {
            autoGenerated: true,
            fromPreviewLine: true,
            sourceNodeId: node.id,
            branchId: previewInfo.branchId
          }
        }

        // 创建连接
        const connectionId = `conn_${node.id}_${endNodeId}_${Date.now()}_${branchIndex}`
        const connection = {
          id: connectionId,
          source: node.id,
          target: endNodeId,
          type: 'default',
          data: {
            autoGenerated: true,
            branchId: previewInfo.branchId,
            branchLabel: previewInfo.branchLabel
          }
        }

        result.nodes.push(endNode)
        result.connections.push(connection)
        result.addedEndNodes++
      })
    } else {
      // 没有预览线信息，使用默认位置
      const endNodeId = `end_${node.id}_${Date.now()}_${index}`
      const endNode = {
        id: endNodeId,
        type: 'end',
        label: '结束',
        position: {
          x: node.position.x + 200,
          y: node.position.y
        },
        data: {
          autoGenerated: true,
          sourceNodeId: node.id
        }
      }

      // 创建连接
      const connectionId = `conn_${node.id}_${endNodeId}_${Date.now()}`
      const connection = {
        id: connectionId,
        source: node.id,
        target: endNodeId,
        type: 'default',
        data: {
          autoGenerated: true
        }
      }

      result.nodes.push(endNode)
      result.connections.push(connection)
      result.addedEndNodes++
    }
  })

  result.modified = result.addedEndNodes > 0
  return result
}

/**
 * 查找配置不完整的节点
 * @param {Array} nodes - 节点数组
 * @returns {Array} 配置不完整的节点列表
 */
export function findIncompleteNodes(nodes) {
  return nodes.filter(node => {
    // 排除开始节点和结束节点
    if (node.type === 'start' || node.type === 'end') return false
    
    // 检查不同类型节点的配置完整性
    switch (node.type) {
      case 'sms':
        // 短信节点需要有模板内容
        return !node.data?.template || !node.data?.template.content
        
      case 'ai-call':
        // AI外呼节点需要有话术配置
        return !node.data?.script || !node.data?.script.content
        
      case 'manual-call':
        // 人工外呼节点需要有话术配置
        return !node.data?.script || !node.data?.script.content
        
      case 'wait':
        // 等待节点需要有等待时间配置
        return !node.data?.duration || node.data?.duration <= 0
        
      case 'audience-split':
        // 受众分流节点需要有人群配置
        return !node.data?.audiences || node.data?.audiences.length === 0
        
      case 'event-split':
        // 事件分流节点需要有事件配置
        return !node.data?.event || !node.data?.event.type
        
      case 'ab-test':
        // A/B测试节点需要有测试配置
        return !node.data?.testConfig || !node.data?.testConfig.groups
        
      default:
        // 其他类型节点检查是否有基本配置
        return !node.data || Object.keys(node.data).length === 0
    }
  })
}

/**
 * 保存前的基础校验
 * @param {Object} canvasData - 画布数据
 * @returns {Object} 校验结果
 */
export function validateForSave(canvasData) {
  // 保存时只进行基础校验，不要求完整性
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // 对于保存操作，允许空画布（作为草稿保存）
  if (!canvasData) {
    result.warnings.push('画布数据为空，已保存为空白草稿')
    return result
  }

  if (!canvasData.nodes || canvasData.nodes.length === 0) {
    result.warnings.push('画布中暂无节点，已保存为空白草稿')
    return result
  }

  const { nodes } = canvasData

  // 检查节点基本数据完整性
  nodes.forEach((node, index) => {
    if (!node.id) {
      result.errors.push(`第${index + 1}个节点缺少ID`)
      result.isValid = false
    }
    if (!node.type) {
      result.errors.push(`节点${node.id || index + 1}缺少类型`)
      result.isValid = false
    }
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      result.errors.push(`节点${node.id || index + 1}位置信息无效`)
      result.isValid = false
    }
  })

  return result
}

/**
 * 格式化发布校验结果
 * @param {Object} validationResult - 校验结果
 * @returns {String} 格式化的消息
 */
export function formatPublishValidationMessage(validationResult) {
  const { isValid, errors, warnings, canAutoFix, autoFixedData } = validationResult
  
  let message = ''
  
  if (errors.length > 0) {
    message += '❌ 发布失败，存在以下错误：\n'
    message += errors.map(error => `  • ${error}`).join('\n')
  }
  
  if (warnings.length > 0) {
    if (message) message += '\n\n'
    message += '⚠️ 警告信息：\n'
    message += warnings.map(warning => `  • ${warning}`).join('\n')
    
    if (canAutoFix && !autoFixedData) {
      message += '\n\n🔧 系统可以自动修复这些问题'
    }
  }
  
  if (autoFixedData) {
    if (message) message += '\n\n'
    message += '✅ 已自动修复问题并优化布局'
  }
  
  if (isValid) {
    if (!message) {
      message = '✅ 校验通过，可以发布'
    } else if (!errors.length) {
      message += '\n\n✅ 校验通过，可以发布'
    }
  }
  
  return message
}