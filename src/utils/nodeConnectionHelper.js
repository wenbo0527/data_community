/**
 * 节点连接辅助工具类
 * 负责处理节点的预设连接线和后续节点位置计算
 */

import { getNodeConfig } from './nodeTypes.js'

/**
 * 计算后续节点的推荐位置
 * @param {Object} sourceNode - 源节点
 * @param {number} outputIndex - 输出端口索引（从0开始）
 * @param {string} targetNodeType - 目标节点类型
 * @returns {Object} 推荐位置 {x, y}
 */
export const calculateNextNodePosition = (sourceNode, outputIndex = 0, targetNodeType = 'sms') => {
  if (!sourceNode) {
    return { x: 200, y: 200 }
  }

  const sourcePos = sourceNode.position()
  const sourceSize = sourceNode.size()
  const sourceData = sourceNode.getData()
  const sourceConfig = getNodeConfig(sourceData?.type)
  
  // 基础间距配置
  const HORIZONTAL_SPACING = 200 // 水平间距
  const VERTICAL_SPACING = 150   // 垂直间距
  const BRANCH_OFFSET = 100      // 分支偏移

  let targetX = sourcePos.x + sourceSize.width + HORIZONTAL_SPACING
  let targetY = sourcePos.y

  // 根据源节点类型和输出端口数量调整位置
  if (sourceConfig?.maxOutputs > 1 || sourceConfig?.maxOutputs === 'dynamic') {
    // 多输出端口节点，垂直分布后续节点
    const maxOutputs = sourceConfig.maxOutputs === 'dynamic' ? 
      (sourceNode.getPorts().filter(p => p.group === 'out').length || 2) : 
      sourceConfig.maxOutputs
    
    // 计算垂直偏移
    const totalHeight = (maxOutputs - 1) * BRANCH_OFFSET
    const startY = sourcePos.y - totalHeight / 2
    targetY = startY + outputIndex * BRANCH_OFFSET
  }

  // 根据目标节点类型微调位置
  const targetConfig = getNodeConfig(targetNodeType)
  if (targetConfig) {
    // 确保节点不重叠
    targetX += (targetConfig.width || 100) / 2
    targetY += (targetConfig.height || 100) / 2
  }

  return { x: targetX, y: targetY }
}

/**
 * 创建预设连接线
 * @param {Object} graph - X6 图实例
 * @param {Object} sourceNode - 源节点
 * @param {string} sourcePortId - 源端口ID
 * @param {Object} targetPosition - 目标位置
 * @param {string} connectionId - 连接线ID
 * @param {string} layoutDirection - 布局方向 ('TB' | 'LR')
 * @returns {Object|null} 创建的连接线
 */
export const createPresetConnection = (graph, sourceNode, sourcePortId, targetPosition, connectionId, layoutDirection = 'TB') => {
  if (!graph || !sourceNode) {
    console.warn('Graph or source node not available for preset connection')
    return null
  }

  // 根据布局方向配置连接方向
  const getDynamicDirectionConfig = (layoutDirection) => {
    if (layoutDirection === 'LR') {
      return {
        startDirections: ['right'],
        endDirections: ['left']
      }
    } else {
      return {
        startDirections: ['bottom'],
        endDirections: ['top']
      }
    }
  }
  
  const directionConfig = getDynamicDirectionConfig(layoutDirection)

  try {
    // 创建临时目标点
    const tempTargetId = `temp-target-${connectionId}`
    
    const edge = graph.addEdge({
      id: connectionId,
      source: {
        cell: sourceNode.id,
        port: sourcePortId
      },
      target: {
        x: targetPosition.x,
        y: targetPosition.y
      },
      router: {
        name: 'orth',
        args: {
          ...directionConfig
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      // 使用更可靠的boundary连接点
      connectionPoint: {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      },
      attrs: {
        line: {
          stroke: '#91C9FF',
          strokeWidth: 2,
          strokeDasharray: '5,5', // 虚线表示预设连接
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
            fill: '#91C9FF'
          }
        }
      },
      data: {
        isPreset: true,
        sourcePortId,
        targetPosition,
        layoutDirection
      },
      zIndex: -1 // 置于底层
    })

    // console.log(`Preset connection created: ${connectionId}`)
    return edge
  } catch (error) {
    console.error('Failed to create preset connection:', error)
    return null
  }
}

/**
 * 移除预设连接线
 * @param {Object} graph - X6 图实例
 * @param {string} connectionId - 连接线ID
 * @returns {boolean} 是否移除成功
 */
export const removePresetConnection = (graph, connectionId) => {
  if (!graph) return false

  try {
    const edge = graph.getCellById(connectionId)
    if (edge && edge.getData()?.isPreset) {
      graph.removeCell(edge)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to remove preset connection:', error)
    return false
  }
}

/**
 * 将预设连接线转换为正式连接
 * @param {Object} graph - X6 图实例
 * @param {string} connectionId - 连接线ID
 * @param {Object} targetNode - 目标节点
 * @param {string} targetPortId - 目标端口ID
 * @returns {boolean} 是否转换成功
 */
export const convertPresetToActualConnection = (graph, connectionId, targetNode, targetPortId = 'in') => {
  console.log('🔄 [预览线转换] 开始转换预设连接为正式连接:', {
    connectionId,
    targetNodeId: targetNode?.id,
    targetPortId
  })

  if (!graph || !targetNode) {
    console.warn('❌ [预览线转换] 参数无效:', { graph: !!graph, targetNode: !!targetNode })
    return false
  }

  try {
    const edge = graph.getCellById(connectionId)
    if (!edge) {
      console.warn('❌ [预览线转换] 找不到连接线:', connectionId)
      return false
    }

    const edgeData = edge.getData()
    console.log('📊 [预览线转换] 连接线当前数据:', edgeData)

    if (!edgeData?.isPreset) {
      console.warn('❌ [预览线转换] 不是预设连接线:', { connectionId, isPreset: edgeData?.isPreset })
      return false
    }

    // 记录转换前的连接点配置
    const beforeProps = edge.prop()
    console.log('📋 [预览线转换] 转换前的连接属性:', {
      source: beforeProps.source,
      target: beforeProps.target,
      connectionPoint: beforeProps.connectionPoint
    })

    // 使用prop方法更新连接目标，同时保持connectionPoint配置
    edge.prop({
      target: {
        cell: targetNode.id,
        port: targetPortId
      },
      connectionPoint: {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      }
    })

    // 记录转换后的连接点配置
    const afterProps = edge.prop()
    console.log('✅ [预览线转换] 转换后的连接属性:', {
      source: afterProps.source,
      target: afterProps.target,
      connectionPoint: afterProps.connectionPoint
    })

    // 更新样式为正式连接
    edge.attr({
      line: {
        stroke: '#A2B1C3',
        strokeWidth: 2,
        strokeDasharray: 'none',
        targetMarker: {
          name: 'block',
          width: 12,
          height: 8,
          fill: '#A2B1C3'
        }
      }
    })

    // 更新数据
    edge.setData({
      ...edge.getData(),
      isPreset: false,
      targetNodeId: targetNode.id,
      targetPortId
    })

    edge.setZIndex(0) // 恢复正常层级

    console.log('🎉 [预览线转换] 预设连接转换成功:', {
      connectionId,
      sourceNode: afterProps.source?.cell,
      sourcePort: afterProps.source?.port,
      targetNode: targetNode.id,
      targetPort: targetPortId,
      connectionPoint: afterProps.connectionPoint
    })
    return true
  } catch (error) {
    console.error('💥 [预览线转换] 转换失败:', error)
    return false
  }
}

/**
 * 获取节点的所有预设连接线
 * @param {Object} graph - X6 图实例
 * @param {string} nodeId - 节点ID
 * @returns {Array} 预设连接线数组
 */
export const getNodePresetConnections = (graph, nodeId) => {
  if (!graph) return []

  try {
    return graph.getEdges().filter(edge => {
      const edgeData = edge.getData()
      return edgeData?.isPreset && edge.getSourceCellId() === nodeId
    })
  } catch (error) {
    console.error('Failed to get node preset connections:', error)
    return []
  }
}

/**
 * 清理节点的所有预设连接线
 * @param {Object} graph - X6 图实例
 * @param {string} nodeId - 节点ID
 * @returns {number} 清理的连接线数量
 */
export const clearNodePresetConnections = (graph, nodeId) => {
  if (!graph) return 0

  try {
    const presetConnections = getNodePresetConnections(graph, nodeId)
    if (presetConnections.length > 0) {
      graph.removeCells(presetConnections)
      console.log(`Cleared ${presetConnections.length} preset connections for node: ${nodeId}`)
    }
    return presetConnections.length
  } catch (error) {
    console.error('Failed to clear node preset connections:', error)
    return 0
  }
}

/**
 * 创建节点的所有预设连接线
 * @param {Object} graph - X6 图实例
 * @param {Object} node - 节点对象
 * @param {string} layoutDirection - 布局方向 ('TB' | 'LR')
 * @returns {Array} 创建的预设连接线数组
 */
export const createNodePresetConnections = (graph, node, layoutDirection = 'TB') => {
  if (!graph || !node) return []

  const nodeData = node.getData()
  const nodeConfig = getNodeConfig(nodeData?.type)
  
  if (!nodeConfig || nodeConfig.maxOutputs === 0) {
    return []
  }

  const presetConnections = []
  const outputPorts = node.getPorts().filter(port => port.group === 'out')
  
  outputPorts.forEach((port, index) => {
    const targetPosition = calculateNextNodePosition(node, index, 'sms')
    const connectionId = `preset-${node.id}-${port.id || `out${index + 1}`}`
    
    const connection = createPresetConnection(
      graph, 
      node, 
      port.id || `out${index + 1}`, 
      targetPosition, 
      connectionId,
      layoutDirection
    )
    
    if (connection) {
      presetConnections.push(connection)
    }
  })

  return presetConnections
}

export default {
  calculateNextNodePosition,
  createPresetConnection,
  removePresetConnection,
  convertPresetToActualConnection,
  getNodePresetConnections,
  clearNodePresetConnections,
  createNodePresetConnections
}