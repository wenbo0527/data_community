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

  const { nodes, connections = [] } = canvasData
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
  const endNodeResult = autoAddEndNodes(nodes, fixedConnections, options);
  // 从结果中提取并筛选出结束节点
  const endNodes = endNodeResult.nodes.filter(node => node.type === 'end');
  endNodes.forEach(node => {
  // 合并固定连接和预览线连接用于结束节点验证
  const allConnections = [...fixedConnections, ...(options.previewLines || [])];
  const incomingConnections = allConnections.filter(c => c.target.cell === node.id);

  if (incomingConnections.length !== 1) {
    errors.push({
      type: 'END_NODE_CONNECTION',
      message: `自动生成的结束节点必须有且仅有一个输入连接，当前为 ${incomingConnections.length} 个`,
      nodeId: node.id
    });
  }
});

  // 5. 检查循环依赖
  const cycleResult = detectCycles(fixedNodes, fixedConnections)
  if (cycleResult.hasCycles) {
    result.errors.push('流程中存在循环依赖')
    cycleResult.cycles.forEach(cycle => {
      result.errors.push(`循环路径: ${cycle.join(' → ')}`)
    })
  }

  // 6. 检查是否需要添加结束节点
  // 修改逻辑：在发布校验时自动添加结束节点，而不是仅仅添加警告信息
  const nodesNeedingEndNodes = findNodesNeedingEndNodes(fixedNodes, fixedConnections, previewLines)
  if (nodesNeedingEndNodes.length > 0) {
    result.canAutoFix = true
    // 自动修复：为没有后续节点的节点添加结束节点
    const fixResult = autoAddEndNodes(fixedNodes, fixedConnections, previewLines)
    if (fixResult.modified) {
      fixedNodes = fixResult.nodes
      fixedConnections = fixResult.connections
      hasAutoFix = true
      result.warnings.push(`自动添加了 ${fixResult.addedEndNodes} 个结束节点`)
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
export function findNodesNeedingEndNodes(nodes, connections, previewLines) {
  // 确保previewLines是数组类型
  previewLines = Array.isArray(previewLines) ? previewLines : [];
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
    if (node.type === 'end') {return false}
    
    // 查找没有输出连接但有预览线的节点，或者完全没有输出的节点
    const hasRealConnection = nodesWithOutgoing.has(node.id)
    const hasPreviewLine = nodesWithPreviewLines.has(node.id)
    
    // 如果有预览线但没有真实连接，需要添加结束节点
    // 如果既没有预览线也没有真实连接，也需要添加结束节点
    return !hasRealConnection && hasPreviewLine
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
        const endNodeId = `end_${node.id}_${previewInfo.branchId || 'default'}_${branchIndex}`
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
        const connectionId = `conn_${node.id}_${endNodeId}_${branchIndex}`
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
      const endNodeId = `end_${node.id}_${index}`
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
      const connectionId = `conn_${node.id}_${endNodeId}`
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
  // 定义分支节点类型
  const branchNodeTypes = ['audience-split', 'event-split', 'ab-test'];
  
  // 验证存储的分支数据是否基于有效配置
  function validateStoredBranches(nodeType, nodeConfig) {
    switch (nodeType) {
      case 'audience-split':
        return nodeConfig.crowdLayers && 
               Array.isArray(nodeConfig.crowdLayers) && 
               nodeConfig.crowdLayers.length > 0;
        
      case 'event-split':
        return !!(nodeConfig.eventCondition || 
                 nodeConfig.yesLabel || 
                 nodeConfig.noLabel);
        
      case 'ab-test':
        return !!(
          (nodeConfig.versions && Array.isArray(nodeConfig.versions) && nodeConfig.versions.length > 0) ||
          nodeConfig.groupALabel || 
          nodeConfig.groupBLabel || 
          nodeConfig.groupARatio || 
          nodeConfig.groupBRatio
        );
        
      default:
        return true;
    }
  }
  
  return nodes.filter(node => {
    // 排除结束节点
    if (node.type === 'end') {return false;}
    
    const nodeData = node.data || {};
    const nodeConfig = nodeData.config || {};
    const nodeType = node.type;
    
    // 添加调试日志
    console.log('[调试] 检查节点配置完整性:', {
      nodeId: node.id,
      nodeType,
      isConfigured: nodeData.isConfigured,
      hasConfigData: !!(nodeConfig && Object.keys(nodeConfig).length > 0),
      configKeys: nodeConfig ? Object.keys(nodeConfig) : [],
      crowdLayers: nodeConfig.crowdLayers
    });
    
    // 采用与PreviewLineSystem中validateNodeConfiguration相同的验证策略
    // 方法1：检查 isConfigured 标志
    if (nodeData.isConfigured === true) {
      console.log('[调试] 节点标记为已配置:', node.id);
      return false;
    }
    
    // 方法2：检查是否有实际配置数据
    const hasConfigData = nodeConfig && Object.keys(nodeConfig).length > 0;
    if (hasConfigData) {
      // 对于分流节点，需要验证配置的有效性
      const isBranchNode = branchNodeTypes.includes(nodeType);
      
      if (isBranchNode) {
        const isValidBranchConfig = validateStoredBranches(nodeType, nodeConfig);
        console.log('[调试] 分流节点配置验证:', {
          nodeId: node.id,
          nodeType,
          isValidBranchConfig,
          crowdLayers: nodeConfig.crowdLayers,
          crowdLayersLength: nodeConfig.crowdLayers ? nodeConfig.crowdLayers.length : 0
        });
        
        if (isValidBranchConfig) {
          return false;
        } else {
          // 分流节点配置数据无效，认为未配置完整
          console.log('[调试] 分流节点配置无效:', node.id);
          return true;
        }
      } else {
        // 非分流节点，有配置数据就认为已配置
        console.log('[调试] 非分流节点有配置数据:', node.id);
        return false;
      }
    }
    
    // 方法3：对于分流节点，检查是否有分支数据（即使没有明确的配置）
    const isBranchNode = branchNodeTypes.includes(nodeType);
    if (isBranchNode && nodeData.branches && nodeData.branches.length > 0) {
      // 验证分支数据的合理性
      const validBranches = nodeData.branches.filter(branch => 
        branch && (branch.id || branch.label || branch.name)
      );
      
      console.log('[调试] 检查现有分支数据:', {
        nodeId: node.id,
        branchCount: nodeData.branches.length,
        validBranchCount: validBranches.length
      });
      
      if (validBranches.length > 0) {
        return false;
      }
    }
    
    // 方法4：对于开始节点，总是认为已配置
    if (nodeType === 'start') {
      console.log('[调试] 开始节点默认已配置:', node.id);
      return false;
    }
    
    // 方法5：检查节点是否有任何有意义的数据
    const hasAnyMeaningfulData = !!(
      node.label || 
      node.name || 
      node.title ||
      (nodeData && Object.keys(nodeData).length > 0)
    );
    
    console.log('[调试] 检查是否有任何有意义数据:', {
      nodeId: node.id,
      hasAnyMeaningfulData,
      nodeLabel: node.label,
      nodeName: node.name,
      nodeTitle: node.title
    });
    
    if (hasAnyMeaningfulData) {
      return false;
    }
    
    // 如果以上检查都未通过，则认为节点配置不完整
    console.log('[调试] 节点配置不完整:', node.id);
    return true;
  });
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
  
  // 🔧 修复：检查节点配置状态，提供更准确的保存反馈
  const { nodes } = canvasData
  const configuredNodes = nodes.filter(node => {
    // 开始节点默认已配置
    if (node.type === 'start') {return true}
    
    // 检查isConfigured标志
    if (node.isConfigured === true || node.data?.isConfigured === true) {return true}
    
    // 检查是否有配置数据
    if (node.config && Object.keys(node.config).length > 0) {return true}
    if (node.data?.config && Object.keys(node.data.config).length > 0) {return true}
    
    return false
  })
  
  const unconfiguredNodes = nodes.filter(node => {
    // 开始节点默认已配置
    if (node.type === 'start') {return false}
    
    // 检查isConfigured标志
    if (node.isConfigured === true || node.data?.isConfigured === true) {return false}
    
    // 检查是否有配置数据
    if (node.config && Object.keys(node.config).length > 0) {return false}
    if (node.data?.config && Object.keys(node.data.config).length > 0) {return false}
    
    return true
  })
  
  console.log('[validateForSave] 节点配置状态检查:', {
    totalNodes: nodes.length,
    configuredNodes: configuredNodes.length,
    unconfiguredNodes: unconfiguredNodes.length,
    nodeDetails: nodes.map(n => ({
      id: n.id,
      type: n.type,
      isConfigured: n.isConfigured || n.data?.isConfigured,
      hasConfig: !!(n.config && Object.keys(n.config).length > 0) || !!(n.data?.config && Object.keys(n.data.config).length > 0)
    }))
  })
  
  // 如果有已配置的节点，不显示'暂无节点'警告
  if (configuredNodes.length > 0) {
    if (unconfiguredNodes.length > 0) {
      result.warnings.push(`画布中有 ${configuredNodes.length} 个已配置节点和 ${unconfiguredNodes.length} 个未配置节点，已保存当前状态`)
    } else {
      // 所有节点都已配置，这是正常情况，不需要警告
      console.log('[validateForSave] 所有节点都已配置，保存成功')
    }
  } else {
    // 只有在所有节点都未配置时才显示'暂无节点'警告
    result.warnings.push('画布中的节点尚未配置，已保存为草稿')
  }

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
    if (message) {message += '\n\n'}
    message += '⚠️ 警告信息：\n'
    message += warnings.map(warning => `  • ${warning}`).join('\n')
    
    if (canAutoFix && !autoFixedData) {
      message += '\n\n🔧 系统可以自动修复这些问题'
    }
  }
  
  if (autoFixedData) {
    if (message) {message += '\n\n'}
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