import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

/**
 * 节点管理器
 * 提供节点相关的状态管理和功能
 */
export function useNodeManager() {
  // 节点状态
  const selectedNodeId = ref(null)
  const nodeStats = ref({
    total: 0,
    configured: 0,
    unconfigured: 0,
    lastUpdated: null
  })
  
  /**
   * 智能添加开始节点
   */
  const addStartNodeIfNeeded = (graph) => {
    if (!graph) {
      console.warn('[useNodeManager] 图形实例不存在')
      return false
    }
    
    try {
      const nodes = graph.getNodes() || []
      
      // 检查是否已存在开始节点
      const hasStartNode = nodes.some(node => {
        const nodeData = node.getData() || {}
        return nodeData.type === 'start'
      })
      
      if (hasStartNode) {
        console.log('[useNodeManager] 开始节点已存在，跳过添加')
        return false
      }
      
      console.log('[useNodeManager] 未发现开始节点，自动添加...')
      
      // 计算开始节点位置（居中偏上）
      const containerRect = graph.container.getBoundingClientRect()
      const startX = containerRect.width / 2 - 60 // 节点宽度的一半
      const startY = 100
      
      // 创建开始节点
      const startNode = graph.addNode({
        id: `start_${Date.now()}`,
        x: startX,
        y: startY,
        width: 120,
        height: 40,
        shape: 'vue-shape',
        component: 'StartNode',
        data: {
          type: 'start',
          label: '开始',
          config: {
            name: '开始节点',
            description: '流程开始节点'
          }
        },
        ports: {
          groups: {
            out: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff'
                }
              }
            }
          },
          items: [
            { id: 'out', group: 'out' }
          ]
        }
      })
      
      console.log('[useNodeManager] 开始节点添加成功:', startNode.id)
      Message.success('已自动添加开始节点')
      
      return true
      
    } catch (error) {
      console.error('[useNodeManager] 添加开始节点失败:', error)
      Message.error('添加开始节点失败: ' + error.message)
      return false
    }
  }
  
  /**
   * 获取节点配置
   */
  const getNodeConfig = (graph, nodeId) => {
    if (!graph || !nodeId) {
      console.warn('[useNodeManager] 图形实例或节点ID不存在')
      return null
    }
    
    try {
      const node = graph.getCellById(nodeId)
      if (!node) {
        console.warn(`[useNodeManager] 节点 ${nodeId} 不存在`)
        return null
      }
      
      const nodeData = node.getData() || {}
      return {
        id: nodeId,
        type: nodeData.type,
        label: nodeData.label,
        config: nodeData.config || {},
        position: node.getPosition(),
        size: node.getSize()
      }
      
    } catch (error) {
      console.error('[useNodeManager] 获取节点配置失败:', error)
      return null
    }
  }
  
  /**
   * 更新节点配置
   */
  const updateNodeConfig = (graph, nodeId, config) => {
    if (!graph || !nodeId || !config) {
      console.warn('[useNodeManager] 参数不完整')
      return false
    }
    
    try {
      const node = graph.getCellById(nodeId)
      if (!node) {
        console.warn(`[useNodeManager] 节点 ${nodeId} 不存在`)
        return false
      }
      
      const currentData = node.getData() || {}
      const newData = {
        ...currentData,
        config: {
          ...currentData.config,
          ...config
        }
      }
      
      node.setData(newData)
      console.log(`[useNodeManager] 节点 ${nodeId} 配置更新成功`)
      
      return true
      
    } catch (error) {
      console.error('[useNodeManager] 更新节点配置失败:', error)
      return false
    }
  }
  
  /**
   * 删除节点及其相关连接
   */
  const deleteNodeWithConnections = (graph, nodeId) => {
    if (!graph || !nodeId) {
      console.warn('[useNodeManager] 图形实例或节点ID不存在')
      return false
    }
    
    try {
      const node = graph.getCellById(nodeId)
      if (!node) {
        console.warn(`[useNodeManager] 节点 ${nodeId} 不存在`)
        return false
      }
      
      // 获取与该节点相关的所有连接
      const connectedEdges = graph.getConnectedEdges(node)
      
      console.log(`[useNodeManager] 删除节点 ${nodeId} 及其 ${connectedEdges.length} 个相关连接`)
      
      // 删除相关连接
      connectedEdges.forEach(edge => {
        try {
          graph.removeEdge(edge)
        } catch (error) {
          console.error('[useNodeManager] 删除连接失败:', error)
        }
      })
      
      // 删除节点
      graph.removeNode(node)
      
      console.log(`[useNodeManager] 节点 ${nodeId} 删除成功`)
      Message.success('节点删除成功')
      
      return true
      
    } catch (error) {
      console.error('[useNodeManager] 删除节点失败:', error)
      Message.error('删除节点失败: ' + error.message)
      return false
    }
  }
  
  /**
   * 复制节点
   */
  const duplicateNode = (graph, nodeId, offset = { x: 50, y: 50 }) => {
    if (!graph || !nodeId) {
      console.warn('[useNodeManager] 图形实例或节点ID不存在')
      return null
    }
    
    try {
      const originalNode = graph.getCellById(nodeId)
      if (!originalNode) {
        console.warn(`[useNodeManager] 节点 ${nodeId} 不存在`)
        return null
      }
      
      const originalData = originalNode.getData() || {}
      const originalPosition = originalNode.getPosition()
      const originalSize = originalNode.getSize()
      
      // 生成新的节点ID
      const newNodeId = `${originalData.type}_${Date.now()}`
      
      // 创建新节点
      const newNode = graph.addNode({
        id: newNodeId,
        x: originalPosition.x + offset.x,
        y: originalPosition.y + offset.y,
        width: originalSize.width,
        height: originalSize.height,
        shape: originalNode.shape,
        component: originalNode.component,
        data: {
          ...originalData,
          label: `${originalData.label}_副本`,
          config: {
            ...originalData.config,
            name: `${originalData.config?.name || originalData.label}_副本`
          }
        },
        ports: originalNode.getPorts()
      })
      
      console.log(`[useNodeManager] 节点复制成功: ${nodeId} -> ${newNodeId}`)
      Message.success('节点复制成功')
      
      return newNode
      
    } catch (error) {
      console.error('[useNodeManager] 复制节点失败:', error)
      Message.error('复制节点失败: ' + error.message)
      return null
    }
  }
  
  /**
   * 批量更新节点位置
   */
  const batchUpdateNodePositions = (graph, nodePositions) => {
    if (!graph || !nodePositions || !Array.isArray(nodePositions)) {
      console.warn('[useNodeManager] 参数不完整或格式错误')
      return false
    }
    
    try {
      console.log(`[useNodeManager] 批量更新 ${nodePositions.length} 个节点位置`)
      
      let updatedCount = 0
      
      nodePositions.forEach(({ nodeId, x, y }) => {
        try {
          const node = graph.getCellById(nodeId)
          if (node) {
            node.setPosition({ x, y })
            updatedCount++
          } else {
            console.warn(`[useNodeManager] 节点 ${nodeId} 不存在，跳过位置更新`)
          }
        } catch (error) {
          console.error(`[useNodeManager] 更新节点 ${nodeId} 位置失败:`, error)
        }
      })
      
      console.log(`[useNodeManager] 批量位置更新完成，成功更新 ${updatedCount} 个节点`)
      
      if (updatedCount > 0) {
        Message.success(`已更新 ${updatedCount} 个节点位置`)
      }
      
      return updatedCount > 0
      
    } catch (error) {
      console.error('[useNodeManager] 批量更新节点位置失败:', error)
      Message.error('批量更新节点位置失败: ' + error.message)
      return false
    }
  }
  
  /**
   * 获取节点统计信息
   */
  const updateNodeStats = (graph) => {
    if (!graph) {
      console.warn('[useNodeManager] 图形实例不存在')
      return
    }
    
    try {
      const nodes = graph.getNodes() || []
      
      const configuredNodes = nodes.filter(node => {
        const nodeData = node.getData() || {}
        return nodeData.config && Object.keys(nodeData.config).length > 0
      })
      
      nodeStats.value = {
        total: nodes.length,
        configured: configuredNodes.length,
        unconfigured: nodes.length - configuredNodes.length,
        lastUpdated: new Date().toISOString()
      }
      
      console.log('[useNodeManager] 节点统计信息更新:', nodeStats.value)
      
    } catch (error) {
      console.error('[useNodeManager] 更新节点统计信息失败:', error)
    }
  }
  
  /**
   * 验证节点连接规则
   */
  const validateNodeConnections = (graph, sourceNodeId, targetNodeId) => {
    if (!graph || !sourceNodeId || !targetNodeId) {
      return { valid: false, reason: '参数不完整' }
    }
    
    try {
      const sourceNode = graph.getCellById(sourceNodeId)
      const targetNode = graph.getCellById(targetNodeId)
      
      if (!sourceNode || !targetNode) {
        return { valid: false, reason: '源节点或目标节点不存在' }
      }
      
      const sourceData = sourceNode.getData() || {}
      const targetData = targetNode.getData() || {}
      
      // 不能连接到自己
      if (sourceNodeId === targetNodeId) {
        return { valid: false, reason: '不能连接到自己' }
      }
      
      // 检查是否已存在连接
      const existingEdges = graph.getEdges() || []
      const hasConnection = existingEdges.some(edge => 
        edge.getSourceCellId() === sourceNodeId &&
        edge.getTargetCellId() === targetNodeId
      )
      
      if (hasConnection) {
        return { valid: false, reason: '连接已存在' }
      }
      
      // 检查节点类型连接规则
      const sourceType = sourceData.type
      const targetType = targetData.type
      
      // 开始节点只能作为源节点
      if (targetType === 'start') {
        return { valid: false, reason: '开始节点不能作为目标节点' }
      }
      
      // 结束节点只能作为目标节点
      if (sourceType === 'end') {
        return { valid: false, reason: '结束节点不能作为源节点' }
      }
      
      return { valid: true, reason: '连接有效' }
      
    } catch (error) {
      console.error('[useNodeManager] 验证节点连接失败:', error)
      return { valid: false, reason: '验证失败: ' + error.message }
    }
  }
  
  /**
   * 获取节点的可连接目标
   */
  const getConnectableTargets = (graph, sourceNodeId) => {
    if (!graph || !sourceNodeId) {
      console.warn('[useNodeManager] 参数不完整')
      return []
    }
    
    try {
      const allNodes = graph.getNodes() || []
      const connectableTargets = []
      
      allNodes.forEach(node => {
        const targetNodeId = node.id
        if (targetNodeId !== sourceNodeId) {
          const validation = validateNodeConnections(graph, sourceNodeId, targetNodeId)
          if (validation.valid) {
            connectableTargets.push({
              nodeId: targetNodeId,
              node: node,
              data: node.getData() || {}
            })
          }
        }
      })
      
      console.log(`[useNodeManager] 节点 ${sourceNodeId} 可连接到 ${connectableTargets.length} 个目标节点`)
      return connectableTargets
      
    } catch (error) {
      console.error('[useNodeManager] 获取可连接目标失败:', error)
      return []
    }
  }
  
  return {
    // 状态
    selectedNodeId,
    nodeStats,
    
    // 方法
    addStartNodeIfNeeded,
    getNodeConfig,
    updateNodeConfig,
    deleteNodeWithConnections,
    duplicateNode,
    batchUpdateNodePositions,
    updateNodeStats,
    validateNodeConnections,
    getConnectableTargets
  }
}