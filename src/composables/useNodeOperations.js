import { ref, computed } from 'vue'
import { getNodeConfig, getNodeAttrs, getNodePorts } from '../utils/nodeTypes.js'
import { connectionValidator } from '../utils/connectionValidator.js'
import { 
  calculateNextNodePosition, 
  createNodePresetConnections,
  clearNodePresetConnections,
  convertPresetToActualConnection
} from '../utils/nodeConnectionHelper.js'
import { FlowLayoutManager } from '../utils/FlowLayoutManager.js'

/**
 * 节点操作 Composable
 * 负责节点的创建、删除、更新等操作
 */
export function useNodeOperations(getGraph) {
  const isDraggingNode = ref(false)
  const draggingNodeId = ref(null)
  const layoutManager = ref(null)
  const presetSlots = ref([])

  // 初始化布局管理器
  const initLayoutManager = () => {
    const graph = getGraph()
    if (graph && !layoutManager.value) {
      layoutManager.value = new FlowLayoutManager(graph)
    }
    return layoutManager.value
  }

  // 获取布局管理器
  const getLayoutManager = () => {
    return layoutManager.value || initLayoutManager()
  }

  /**
   * 添加节点
   * @param {string|Object} nodeData - 节点数据或节点类型
   * @param {Object} position - 节点位置 {x, y}
   * @param {Object} options - 额外选项
   * @returns {Object|null} 创建的节点实例
   */
  const addNode = (nodeData, position = {}, options = {}) => {
    const graph = getGraph()
    if (!graph) {
      console.error('Graph instance not available')
      return null
    }

    // 标准化节点数据
    if (typeof nodeData === 'string') {
      nodeData = { type: nodeData }
    }

    if (!nodeData || !nodeData.type) {
      console.error('Invalid nodeData: Missing type property')
      return null
    }

    const config = getNodeConfig(nodeData.type)
    if (!config) {
      console.warn(`Unknown node type: ${nodeData.type}`)
      return null
    }

    // 设置节点位置
    const nodePosition = {
      x: (position.x ?? 100) - 50,
      y: (position.y ?? 100) - 50
    }

    // 生成唯一节点ID
    const nodeId = nodeData.id || `${nodeData.type}-${Date.now()}`

    try {
      // 创建节点
      const node = graph.addNode({
        id: nodeId,
        x: nodePosition.x,
        y: nodePosition.y,
        width: config.width || 100,
        height: config.height || 100,
        label: config.label,
        shape: config.shape || 'circle',
        attrs: getNodeAttrs(nodeData.type),
        data: {
          type: nodeData.type,
          config: nodeData.config || {},
          ...nodeData.data
        },
        ports: getNodePorts(nodeData.type, { ...nodeData.portOptions, ...options })
      })

      // 将新添加的节点置于底层（除了开始节点）
      if (node && nodeData.type !== 'start') {
        node.toBack()
      }

      // 初始化节点的预设位
      const manager = getLayoutManager()
      if (manager && config.autoExpand) {
        const slots = manager.initNodePresetSlots(node)
        if (slots) {
          updatePresetSlots()
        }
      }

      // 为新节点创建预设连接线（如果有输出端口）
      if (config.maxOutputs > 0) {
        setTimeout(() => {
          createNodePresetConnections(graph, node)
        }, 100)
      }

      console.log(`Node created: ${nodeData.type} (${nodeId})`)
      return node
    } catch (error) {
      console.error('Failed to create node:', error)
      return null
    }
  }

  /**
   * 添加开始节点
   * @param {Object} containerRef - 容器引用
   * @returns {Object|null} 开始节点实例
   */
  const addStartNode = (containerRef) => {
    const graph = getGraph()
    if (!graph) return null

    // 检查是否已存在开始节点
    const existingStartNode = graph.getNodes().find(node => 
      node.getData()?.type === 'start'
    )
    
    if (existingStartNode) {
      console.warn('开始节点已存在')
      return existingStartNode
    }

    const containerWidth = containerRef?.value?.offsetWidth || 800
    const startX = containerWidth / 2 - 50

    const startNode = addNode({
      id: 'start-node',
      type: 'start',
      data: {
        fixed: true,
        debugCreatedAt: new Date().toISOString()
      }
    }, { x: startX + 50, y: 100 })

    // 确保开始节点在顶层
    if (startNode) {
      startNode.toFront()
    }

    return startNode
  }

  /**
   * 删除节点
   * @param {string|Array} nodeIds - 节点ID或ID数组
   * @returns {boolean} 是否删除成功
   */
  const removeNodes = (nodeIds) => {
    const graph = getGraph()
    if (!graph) return false

    try {
      const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds]
      const cells = ids.map(id => graph.getCellById(id)).filter(Boolean)
      
      // 过滤掉不可删除的节点（如开始节点）
      const removableCells = cells.filter(cell => 
        cell.isNode() && cell.getData()?.type !== 'start'
      )

      if (removableCells.length > 0) {
        // 清理节点的预设连接线和预设位
        const manager = getLayoutManager()
        removableCells.forEach(cell => {
          clearNodePresetConnections(graph, cell)
          if (manager) {
            manager.removeNodePresetSlots(cell.id)
          }
        })
        
        graph.removeCells(removableCells)
        updatePresetSlots()
        console.log(`Removed ${removableCells.length} nodes`)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to remove nodes:', error)
      return false
    }
  }

  /**
   * 更新节点数据
   * @param {string} nodeId - 节点ID
   * @param {Object} data - 新的数据
   * @returns {boolean} 是否更新成功
   */
  const updateNodeData = (nodeId, data) => {
    const graph = getGraph()
    if (!graph) return false

    try {
      const node = graph.getCellById(nodeId)
      if (!node || !node.isNode()) {
        console.warn(`Node not found: ${nodeId}`)
        return false
      }

      const currentData = node.getData() || {}
      node.setData({ ...currentData, ...data })
      
      console.log(`Node data updated: ${nodeId}`)
      return true
    } catch (error) {
      console.error('Failed to update node data:', error)
      return false
    }
  }

  /**
   * 更新节点样式
   * @param {string} nodeId - 节点ID
   * @param {Object} attrs - 样式属性
   * @returns {boolean} 是否更新成功
   */
  const updateNodeStyle = (nodeId, attrs) => {
    const graph = getGraph()
    if (!graph) return false

    try {
      const node = graph.getCellById(nodeId)
      if (!node || !node.isNode()) {
        console.warn(`Node not found: ${nodeId}`)
        return false
      }

      node.attr(attrs)
      console.log(`Node style updated: ${nodeId}`)
      return true
    } catch (error) {
      console.error('Failed to update node style:', error)
      return false
    }
  }

  /**
   * 更新节点标签
   * @param {string} nodeId - 节点ID
   * @param {string} label - 新标签
   * @returns {boolean} 是否更新成功
   */
  const updateNodeLabel = (nodeId, label) => {
    return updateNodeStyle(nodeId, {
      text: { text: label }
    })
  }

  /**
   * 获取节点信息
   * @param {string} nodeId - 节点ID
   * @returns {Object|null} 节点信息
   */
  const getNodeInfo = (nodeId) => {
    const graph = getGraph()
    if (!graph) return null

    try {
      const node = graph.getCellById(nodeId)
      if (!node || !node.isNode()) {
        return null
      }

      return {
        id: node.id,
        type: node.getData()?.type,
        position: node.position(),
        size: node.size(),
        data: node.getData(),
        label: node.getAttrByPath('text/text')
      }
    } catch (error) {
      console.error('Failed to get node info:', error)
      return null
    }
  }

  /**
   * 获取所有节点
   * @returns {Array} 节点数组
   */
  const getAllNodes = () => {
    const graph = getGraph()
    if (!graph) return []

    try {
      return graph.getNodes().map(node => ({
        id: node.id,
        type: node.getData()?.type,
        position: node.position(),
        size: node.size(),
        data: node.getData()
      }))
    } catch (error) {
      console.error('Failed to get all nodes:', error)
      return []
    }
  }

  /**
   * 检查节点是否可删除
   * @param {Object} cell - 节点对象
   * @returns {boolean} 是否可删除
   */
  const isRemovableNode = (cell) => {
    return cell.isNode() && cell.getData()?.type !== 'start'
  }

  /**
   * 移动节点到指定位置
   * @param {string} nodeId - 节点ID
   * @param {Object} position - 新位置 {x, y}
   * @returns {boolean} 是否移动成功
   */
  const moveNode = (nodeId, position) => {
    const graph = getGraph()
    if (!graph) return false

    try {
      const node = graph.getCellById(nodeId)
      if (!node || !node.isNode()) {
        console.warn(`Node not found: ${nodeId}`)
        return false
      }

      node.setPosition(position.x, position.y)
      
      // 更新节点的预设位位置
      const manager = getLayoutManager()
      if (manager) {
        manager.updateNodePresetSlots(nodeId, position)
        updatePresetSlots()
      }
      
      // 非开始节点置于底层
      if (node.getData()?.type !== 'start') {
        node.toBack()
      }
      
      console.log(`Node moved: ${nodeId} to (${position.x}, ${position.y})`)
      return true
    } catch (error) {
      console.error('Failed to move node:', error)
      return false
    }
  }

  /**
   * 添加后续节点
   * @param {Object} sourceNode - 源节点
   * @param {string} nodeType - 节点类型
   * @param {string} portId - 端口ID
   * @returns {Object|null} 新创建的节点
   */
  const addNextNode = (sourceNode, nodeType, portId = 'out1') => {
    const graph = getGraph()
    if (!graph || !sourceNode) {
      console.error('Graph instance or source node not available')
      return null
    }

    try {
      // 计算后续节点位置
      const nextPosition = calculateNextNodePosition(sourceNode, portId)
      
      // 添加新节点
      const newNode = addNode({ type: nodeType }, nextPosition)
      
      if (newNode) {
        // 将预设连接线转换为正式连接
        setTimeout(() => {
          convertPresetToActualConnection(graph, sourceNode, newNode, portId)
        }, 100)
      }
      
      return newNode
    } catch (error) {
      console.error('Failed to add next node:', error)
      return null
    }
  }

  /**
   * 在预设位添加节点
   * @param {string} slotId - 预设位ID
   * @param {string} nodeType - 节点类型
   * @param {Object} options - 额外选项
   * @returns {Object|null} 新创建的节点
   */
  const addNodeToPresetSlot = (slotId, nodeType, options = {}) => {
    const manager = getLayoutManager()
    if (!manager) {
      console.error('Layout manager not available')
      return null
    }

    try {
      const result = manager.addNodeToPresetSlot(slotId, nodeType, options)
      if (result) {
        // 创建节点
        const node = addNode(result.node, result.node.position)
        
        if (node && result.edge) {
          // 创建连接
          const graph = getGraph()
          if (graph) {
            graph.addEdge({
              id: result.edge.id,
              source: result.edge.source,
              target: result.edge.target,
              label: result.edge.label,
              attrs: {
                line: {
                  stroke: '#5F95FF',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'classic',
                    size: 8
                  }
                }
              }
            })
          }
        }
        
        updatePresetSlots()
        return node
      }
    } catch (error) {
      console.error('Failed to add node to preset slot:', error)
    }
    
    return null
  }

  /**
   * 更新预设位状态
   */
  const updatePresetSlots = () => {
    const manager = getLayoutManager()
    if (manager) {
      presetSlots.value = manager.getAllPresetSlots()
    }
  }

  /**
   * 获取节点的预设位
   * @param {string} nodeId - 节点ID
   * @returns {Array} 预设位数组
   */
  const getNodePresetSlots = (nodeId) => {
    const manager = getLayoutManager()
    return manager ? manager.getNodePresetSlots(nodeId) : []
  }

  /**
   * 获取空闲的预设位
   * @returns {Array} 空闲预设位数组
   */
  const getEmptyPresetSlots = () => {
    const manager = getLayoutManager()
    return manager ? manager.getEmptyPresetSlots() : []
  }

  /**
   * 清理所有预设位
   */
  const clearAllPresetSlots = () => {
    const manager = getLayoutManager()
    if (manager) {
      manager.clearAllPresetSlots()
      presetSlots.value = []
    }
  }

  /**
   * 获取预设位统计信息
   * @returns {Object} 统计信息
   */
  const getPresetSlotStats = () => {
    const manager = getLayoutManager()
    return manager ? manager.getPresetSlotStats() : {
      total: 0,
      empty: 0,
      occupied: 0,
      disabled: 0,
      byType: { single: 0, branch: 0, parallel: 0, terminal: 0 }
    }
  }

  return {
    // 状态
    isDraggingNode,
    draggingNodeId,
    presetSlots,
    
    // 节点操作方法
    addNode,
    addStartNode,
    addNextNode,
    removeNodes,
    updateNodeData,
    updateNodeStyle,
    updateNodeLabel,
    getNodeInfo,
    getAllNodes,
    isRemovableNode,
    moveNode,
    
    // 预设位相关方法
    addNodeToPresetSlot,
    updatePresetSlots,
    getNodePresetSlots,
    getEmptyPresetSlots,
    clearAllPresetSlots,
    getPresetSlotStats,
    
    // 布局管理器
    initLayoutManager,
    getLayoutManager
  }
}
