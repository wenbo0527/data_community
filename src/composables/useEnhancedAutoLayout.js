/**
 * 增强的自动布局管理 Composable
 * 提供基于坐标系的智能布局和画布按需扩展功能
 */

import { ref, computed, reactive } from 'vue'
import EnhancedAutoLayoutManager from '../utils/EnhancedAutoLayoutManager.js'

export function useEnhancedAutoLayout(getGraph) {
  const layoutManager = ref(null)
  const isLayouting = ref(false)
  
  // 布局状态
  const layoutState = reactive({
    maxLevel: 0,
    maxNodesPerLevel: 0,
    canvasSize: { width: 0, height: 0 },
    coordinateSystem: {
      levels: new Map(),
      nodePositions: new Map(),
      connections: new Map()
    }
  })

  // 初始化增强布局管理器
  const initLayoutManager = () => {
    const graph = getGraph()
    if (graph && !layoutManager.value) {
      layoutManager.value = new EnhancedAutoLayoutManager(graph)
      console.log('[useEnhancedAutoLayout] 增强自动布局管理器已初始化')
      updateLayoutState()
      updateStats() // 初始化统计信息
    }
    return layoutManager.value
  }

  // 获取布局管理器
  const getLayoutManager = () => {
    return layoutManager.value || initLayoutManager()
  }

  // 更新布局状态
  const updateLayoutState = () => {
    const manager = getLayoutManager()
    if (manager) {
      const info = manager.getCoordinateSystemInfo()
      layoutState.maxLevel = info.layoutState.maxLevel
      layoutState.maxNodesPerLevel = info.layoutState.maxNodesPerLevel
      layoutState.canvasSize = info.layoutState.canvasSize
      
      // 更新坐标系统信息
      layoutState.coordinateSystem.levels.clear()
      layoutState.coordinateSystem.nodePositions.clear()
      layoutState.coordinateSystem.connections.clear()
      
      info.levels.forEach(([level, nodes]) => {
        layoutState.coordinateSystem.levels.set(level, nodes)
      })
      
      info.nodePositions.forEach(([nodeId, position]) => {
        layoutState.coordinateSystem.nodePositions.set(nodeId, position)
      })
      
      info.connections.forEach(([sourceId, targets]) => {
        layoutState.coordinateSystem.connections.set(sourceId, targets)
      })
      
      // 更新统计信息
      updateStats()
    }
  }

  /**
   * 智能添加节点
   * @param {string} nodeType - 节点类型
   * @param {Object} parentNode - 父节点
   * @param {Object} options - 选项
   * @returns {Object} 新节点数据
   */
  const addNodeWithEnhancedLayout = (nodeType, parentNode, options = {}) => {
    const manager = getLayoutManager()
    if (!manager) {
      console.error('[useEnhancedAutoLayout] 布局管理器未初始化')
      return null
    }

    try {
      const result = manager.addNodeWithAutoLayout(nodeType, parentNode, options)
      updateLayoutState()
      updateStats() // 更新统计信息
      console.log('[useEnhancedAutoLayout] 节点已智能添加:', {
        nodeId: result.nodeData.id,
        level: result.level,
        position: result.position
      })
      return result
    } catch (error) {
      console.error('[useEnhancedAutoLayout] 添加节点失败:', error)
      return null
    }
  }

  /**
   * 重新布局所有节点（基于坐标系）
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   */
  const relayoutAllWithCoordinateSystem = async (nodes, edges) => {
    const manager = getLayoutManager()
    if (!manager) {
      console.error('[useEnhancedAutoLayout] 布局管理器未初始化')
      return
    }

    isLayouting.value = true
    try {
      manager.relayoutAll(nodes, edges)
      updateLayoutState()
      console.log('[useEnhancedAutoLayout] 基于坐标系的重新布局完成')
    } catch (error) {
      console.error('[useEnhancedAutoLayout] 重新布局失败:', error)
    } finally {
      isLayouting.value = false
    }
  }

  /**
   * 获取指定层级的节点位置
   * @param {number} level - 层级
   * @returns {Array} 该层级的节点位置数组
   */
  const getNodePositionsInLevel = (level) => {
    const manager = getLayoutManager()
    if (!manager) return []

    const levelNodes = layoutState.coordinateSystem.levels.get(level) || []
    return levelNodes.map(nodeId => {
      const position = layoutState.coordinateSystem.nodePositions.get(nodeId)
      return { nodeId, ...position }
    })
  }

  /**
   * 获取节点的下一层可用位置
   * @param {Object} parentNode - 父节点
   * @param {number} branchCount - 分支数量
   * @returns {Array} 位置数组
   */
  const getNextLevelPositions = (parentNode, branchCount = 1) => {
    const manager = getLayoutManager()
    if (!manager) return []

    const parentData = parentNode.getData()
    const parentLevel = parentData.level || 0
    const nextLevel = parentLevel + 1

    const positions = []
    for (let i = 0; i < branchCount; i++) {
      const position = manager.calculateNodePositionInLevel(nextLevel, i, branchCount, parentNode)
      positions.push({
        level: nextLevel,
        branchIndex: i,
        position: position
      })
    }

    return positions
  }

  /**
   * 验证连接是否符合规则
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   * @returns {Object} 验证结果
   */
  const validateConnection = (sourceNode, targetNode) => {
    const sourceData = sourceNode.getData()
    const targetData = targetNode.getData()
    
    const sourceLevel = sourceData.level || 0
    const targetLevel = targetData.level || 0

    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    }

    // 规则1: 每行的in只能来自上一行的out
    if (targetLevel !== sourceLevel + 1) {
      validation.isValid = false
      validation.errors.push(`连接违反层级规则：目标节点层级(${targetLevel})必须是源节点层级(${sourceLevel})的下一层`)
    }

    // 规则2: 开始节点只能有一个out
    if (sourceData.type === 'start') {
      const sourceConnections = layoutState.coordinateSystem.connections.get(sourceNode.id) || []
      if (sourceConnections.length >= 1) {
        validation.isValid = false
        validation.errors.push('开始节点只能有一个输出连接')
      }
    }

    // 规则3: 每个out对应一个in（检查是否已有连接）
    const existingConnections = layoutState.coordinateSystem.connections.get(sourceNode.id) || []
    if (existingConnections.includes(targetNode.id)) {
      validation.isValid = false
      validation.errors.push('该连接已存在')
    }

    return validation
  }

  /**
   * 智能扩展画布
   * @param {Object} position - 位置
   * @param {Object} options - 扩展选项
   */
  const smartExpandCanvas = (position, options = {}) => {
    const manager = getLayoutManager()
    if (manager) {
      manager.expandCanvasIfNeeded(position)
      updateLayoutState()
    }
  }

  /**
   * 获取画布建议尺寸
   * @returns {Object} 建议的画布尺寸
   */
  const getRecommendedCanvasSize = () => {
    const manager = getLayoutManager()
    if (!manager) return { width: 1200, height: 800 }

    const { maxLevel, maxNodesPerLevel } = layoutState
    const { nodeSpacing, canvasMargin } = manager.config

    const recommendedWidth = Math.max(
      1200,
      maxNodesPerLevel * nodeSpacing.x + canvasMargin.left + canvasMargin.right
    )
    
    const recommendedHeight = Math.max(
      800,
      (maxLevel + 1) * nodeSpacing.y + canvasMargin.top + canvasMargin.bottom
    )

    return { width: recommendedWidth, height: recommendedHeight }
  }

  /**
   * 获取坐标系统统计信息
   * @returns {Object} 统计信息
   */
  const getCoordinateSystemStats = () => {
    // 使用缓存避免重复计算
    const levels = layoutState.coordinateSystem.levels
    const nodePositions = layoutState.coordinateSystem.nodePositions
    const connections = layoutState.coordinateSystem.connections
    
    // 计算总连接数
    let totalConnections = 0
    for (const connectionList of connections.values()) {
      totalConnections += connectionList.length
    }
    
    // 构建层级分布（使用缓存的数据）
    const levelDistribution = []
    for (const [level, nodes] of levels.entries()) {
      levelDistribution.push({ level, nodeCount: nodes.length })
    }
    
    return {
      totalLevels: levels.size,
      totalNodes: nodePositions.size,
      totalConnections,
      maxLevel: layoutState.maxLevel,
      maxNodesPerLevel: layoutState.maxNodesPerLevel,
      canvasSize: { ...layoutState.canvasSize }, // 浅拷贝避免引用问题
      levelDistribution
    }
  }

  // 使用 ref 而不是 computed 来避免递归更新
  const currentStats = ref({
    totalLevels: 0,
    totalNodes: 0,
    totalConnections: 0,
    maxLevel: 0,
    maxNodesPerLevel: 0,
    canvasSize: { width: 0, height: 0 },
    levelDistribution: []
  })

  // 手动更新统计信息的函数
  const updateStats = () => {
    const newStats = getCoordinateSystemStats()
    // 只在数据真正变化时更新
    if (JSON.stringify(currentStats.value) !== JSON.stringify(newStats)) {
      currentStats.value = newStats
    }
  }

  /**
   * 从坐标系统中移除节点
   * @param {string} nodeId - 要移除的节点ID
   */
  const removeNodeFromCoordinateSystem = (nodeId) => {
    const manager = getLayoutManager()
    if (manager) {
      manager.removeNodeFromCoordinateSystem(nodeId)
      updateLayoutState()
      updateStats() // 更新统计信息
      console.log(`[useEnhancedAutoLayout] 节点 ${nodeId} 已从坐标系统中移除`)
    }
  }

  /**
   * 清理布局数据
   */
  const clearEnhancedLayout = () => {
    if (layoutManager.value) {
      layoutManager.value.clear()
      layoutManager.value = null
      
      // 重置状态
      layoutState.maxLevel = 0
      layoutState.maxNodesPerLevel = 0
      layoutState.canvasSize = { width: 0, height: 0 }
      layoutState.coordinateSystem.levels.clear()
      layoutState.coordinateSystem.nodePositions.clear()
      layoutState.coordinateSystem.connections.clear()
      
      // 重置统计信息
      currentStats.value = {
        totalLevels: 0,
        totalNodes: 0,
        totalConnections: 0,
        maxLevel: 0,
        maxNodesPerLevel: 0,
        canvasSize: { width: 0, height: 0 },
        levelDistribution: []
      }
      
      console.log('[useEnhancedAutoLayout] 增强布局数据已清理')
    }
  }

  // 计算状态 - 使用 shallowRef 避免深度响应式
  const isReady = computed(() => !!layoutManager.value)
  const hasNodes = computed(() => layoutState.coordinateSystem.nodePositions.size > 0)

  return {
    // 状态
    isLayouting,
    isReady,
    hasNodes,
    layoutState,
    currentStats,
    
    // 方法
    initLayoutManager,
    getLayoutManager,
    addNodeWithEnhancedLayout,
    relayoutAllWithCoordinateSystem,
    getNodePositionsInLevel,
    getNextLevelPositions,
    validateConnection,
    smartExpandCanvas,
    getRecommendedCanvasSize,
    getCoordinateSystemStats,
    removeNodeFromCoordinateSystem,
    clearEnhancedLayout,
    updateLayoutState,
    updateStats
  }
}

export default useEnhancedAutoLayout