/**
 * 增强的自动布局管理器
 * 支持基于坐标系的智能布局，画布按需扩展
 * 实现严格的连接规则和分层处理
 */

import { getNodeConfig } from './nodeTypes.js'

export class EnhancedAutoLayoutManager {
  constructor(graph) {
    this.graph = graph
    
    // 布局配置
    this.config = {
      nodeSpacing: { x: 200, y: 150 }, // 节点间距
      gridSize: 20, // 网格大小
      canvasMargin: { top: 100, left: 100, right: 100, bottom: 100 }, // 画布边距
      branchOffset: 120, // 分支偏移量
      minCanvasSize: { width: 1200, height: 800 }, // 最小画布尺寸
      expansionStep: 400 // 画布扩展步长
    }
    
    // 坐标系统
    this.coordinateSystem = {
      origin: { x: 400, y: 100 }, // 坐标原点
      levels: new Map(), // 层级映射 level -> nodes[]
      nodePositions: new Map(), // 节点位置映射 nodeId -> {x, y, level, index}
      connections: new Map() // 连接映射 sourceId -> targetIds[]
    }
    
    // 布局状态
    this.layoutState = {
      maxLevel: 0,
      maxNodesPerLevel: 0,
      canvasSize: { width: 0, height: 0 }
    }
  }

  /**
   * 初始化坐标系统
   */
  initCoordinateSystem() {
    this.coordinateSystem.levels.clear()
    this.coordinateSystem.nodePositions.clear()
    this.coordinateSystem.connections.clear()
    this.layoutState.maxLevel = 0
    this.layoutState.maxNodesPerLevel = 0
    
    console.log('[EnhancedAutoLayoutManager] 坐标系统已初始化')
  }

  /**
   * 添加节点到指定层级
   * @param {string} nodeType - 节点类型
   * @param {Object} parentNode - 父节点
   * @param {Object} options - 选项
   * @returns {Object} 新节点的位置和数据
   */
  addNodeWithAutoLayout(nodeType, parentNode, options = {}) {
    const {
      branchIndex = 0,
      totalBranches = 1,
      connectionLabel = '',
      forceLevel = null
    } = options

    // 确定节点层级
    const level = this.determineNodeLevel(parentNode, forceLevel)
    
    // 计算节点在该层级的位置
    const position = this.calculateNodePositionInLevel(level, branchIndex, totalBranches, parentNode)
    
    // 创建节点数据
    const nodeConfig = getNodeConfig(nodeType)
    const nodeData = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      label: nodeConfig.label,
      position: position,
      data: {
        level: level,
        levelIndex: this.getNodeCountInLevel(level)
      },
      config: nodeConfig
    }

    // 注册节点到坐标系统
    this.registerNodeInCoordinateSystem(nodeData, level, parentNode)
    
    // 自动扩展画布
    this.expandCanvasIfNeeded(position)
    
    // 验证连接规则
    this.validateConnectionRules(nodeData, parentNode)

    return {
      nodeData,
      position,
      connectionLabel,
      level
    }
  }

  /**
   * 确定节点应该放置的层级
   * @param {Object} parentNode - 父节点
   * @param {number} forceLevel - 强制指定层级
   * @returns {number} 层级
   */
  determineNodeLevel(parentNode, forceLevel = null) {
    if (forceLevel !== null) {
      return forceLevel
    }

    if (!parentNode) {
      // 开始节点在第0层
      return 0
    }

    const parentData = parentNode.getData()
    const parentLevel = parentData.level || 0
    
    // 子节点在父节点的下一层
    return parentLevel + 1
  }

  /**
   * 计算节点在指定层级的位置
   * @param {number} level - 层级
   * @param {number} branchIndex - 分支索引
   * @param {number} totalBranches - 总分支数
   * @param {Object} parentNode - 父节点
   * @returns {Object} 位置坐标
   */
  calculateNodePositionInLevel(level, branchIndex, totalBranches, parentNode) {
    const { nodeSpacing } = this.config
    const { origin } = this.coordinateSystem
    
    // 基础Y坐标（基于层级）
    const baseY = origin.y + level * nodeSpacing.y
    
    // 获取该层级现有节点数量
    const nodesInLevel = this.getNodeCountInLevel(level)
    
    let baseX
    if (parentNode && totalBranches > 1) {
      // 有父节点且有多个分支时，基于父节点位置分布
      let parentPosition
      if (typeof parentNode.getPosition === 'function') {
        parentPosition = parentNode.getPosition()
      } else if (parentNode.position) {
        parentPosition = parentNode.position
      } else {
        console.warn('[EnhancedAutoLayoutManager] 无法获取父节点位置，使用默认位置')
        parentPosition = { x: origin.x, y: origin.y }
      }
      
      if (parentPosition && typeof parentPosition.x !== 'undefined') {
        const totalWidth = (totalBranches - 1) * this.config.branchOffset
        const startX = parentPosition.x - totalWidth / 2
        baseX = startX + branchIndex * this.config.branchOffset
      } else {
        baseX = origin.x
      }
    } else if (parentNode) {
      // 有父节点但只有一个分支时，继承父节点X坐标
      let parentPosition
      if (typeof parentNode.getPosition === 'function') {
        parentPosition = parentNode.getPosition()
      } else if (parentNode.position) {
        parentPosition = parentNode.position
      } else {
        console.warn('[EnhancedAutoLayoutManager] 无法获取父节点位置，使用默认位置')
        parentPosition = { x: origin.x, y: origin.y }
      }
      
      if (parentPosition && typeof parentPosition.x !== 'undefined') {
        baseX = parentPosition.x
      } else {
        baseX = origin.x
      }
    } else {
      // 开始节点，使用原点X坐标
      baseX = origin.x
    }

    // 避免同层级节点重叠
    const position = this.avoidSameLevelOverlap(level, { x: baseX, y: baseY })
    
    // 对齐到网格
    return this.snapToGrid(position)
  }

  /**
   * 避免同层级节点重叠
   * @param {number} level - 层级
   * @param {Object} targetPosition - 目标位置
   * @returns {Object} 调整后的位置
   */
  avoidSameLevelOverlap(level, targetPosition) {
    const levelNodes = this.coordinateSystem.levels.get(level) || []
    const minDistance = this.config.nodeSpacing.x * 0.8
    
    let adjustedPosition = { ...targetPosition }
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      let hasOverlap = false
      
      for (const nodeId of levelNodes) {
        const nodePosition = this.coordinateSystem.nodePositions.get(nodeId)
        if (!nodePosition) continue
        
        const distance = Math.abs(adjustedPosition.x - nodePosition.x)
        
        if (distance < minDistance) {
          hasOverlap = true
          // 向右调整位置
          adjustedPosition.x += this.config.nodeSpacing.x
          break
        }
      }
      
      if (!hasOverlap) {
        break
      }
      
      attempts++
    }

    return adjustedPosition
  }

  /**
   * 注册节点到坐标系统
   * @param {Object} nodeData - 节点数据
   * @param {number} level - 层级
   * @param {Object} parentNode - 父节点
   */
  registerNodeInCoordinateSystem(nodeData, level, parentNode) {
    const { id, position } = nodeData
    
    // 注册到层级映射
    if (!this.coordinateSystem.levels.has(level)) {
      this.coordinateSystem.levels.set(level, [])
    }
    this.coordinateSystem.levels.get(level).push(id)
    
    // 注册位置信息
    this.coordinateSystem.nodePositions.set(id, {
      x: position.x,
      y: position.y,
      level: level,
      index: this.coordinateSystem.levels.get(level).length - 1
    })
    
    // 注册连接关系
    if (parentNode) {
      const parentId = parentNode.id
      if (!this.coordinateSystem.connections.has(parentId)) {
        this.coordinateSystem.connections.set(parentId, [])
      }
      this.coordinateSystem.connections.get(parentId).push(id)
    }
    
    // 更新布局状态
    this.layoutState.maxLevel = Math.max(this.layoutState.maxLevel, level)
    const nodesInLevel = this.coordinateSystem.levels.get(level).length
    this.layoutState.maxNodesPerLevel = Math.max(this.layoutState.maxNodesPerLevel, nodesInLevel)
    
    console.log(`[EnhancedAutoLayoutManager] 节点 ${id} 已注册到层级 ${level}`)
  }

  /**
   * 获取指定层级的节点数量
   * @param {number} level - 层级
   * @returns {number} 节点数量
   */
  getNodeCountInLevel(level) {
    const levelNodes = this.coordinateSystem.levels.get(level)
    return levelNodes ? levelNodes.length : 0
  }

  /**
   * 验证连接规则
   * @param {Object} nodeData - 新节点数据
   * @param {Object} parentNode - 父节点
   */
  validateConnectionRules(nodeData, parentNode) {
    if (!parentNode) {
      // 开始节点，验证是否只有一个out
      if (nodeData.type === 'start') {
        console.log('[EnhancedAutoLayoutManager] 开始节点验证通过：只有一个out')
      }
      return
    }

    const parentData = parentNode.getData()
    const nodeLevel = nodeData.data.level
    const parentLevel = parentData.level || 0

    // 验证层级规则：每行的in只能来自上一行的out
    if (nodeLevel !== parentLevel + 1) {
      console.warn(`[EnhancedAutoLayoutManager] 连接规则警告：节点层级不符合规则 (parent: ${parentLevel}, child: ${nodeLevel})`)
    }

    // 验证连接规则：每个out对应一个in
    const parentConnections = this.coordinateSystem.connections.get(parentNode.id) || []
    console.log(`[EnhancedAutoLayoutManager] 连接验证：父节点 ${parentNode.id} 已有 ${parentConnections.length} 个连接`)
  }

  /**
   * 重新布局所有节点
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   */
  relayoutAll(nodes, edges) {
    if (!nodes.length) return

    console.log('[EnhancedAutoLayoutManager] 开始重新布局所有节点')
    
    // 重新初始化坐标系统
    this.initCoordinateSystem()
    
    // 构建节点层级关系
    const levels = this.buildNodeLevelsFromGraph(nodes, edges)
    
    // 按层级重新布局
    this.layoutNodesByLevels(levels)
    
    // 扩展画布以适应所有节点
    this.expandCanvasToFitAllNodes()
    
    console.log('[EnhancedAutoLayoutManager] 重新布局完成')
  }

  /**
   * 从图构建节点层级关系
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Map} 层级映射
   */
  buildNodeLevelsFromGraph(nodes, edges) {
    const levels = new Map()
    const visited = new Set()
    const nodeMap = new Map()
    
    // 构建节点映射
    nodes.forEach(node => {
      nodeMap.set(node.id, node)
    })

    // 构建邻接表
    const adjacencyList = new Map()
    edges.forEach(edge => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (!adjacencyList.has(sourceId)) {
        adjacencyList.set(sourceId, [])
      }
      adjacencyList.get(sourceId).push(targetId)
    })

    // 找到开始节点
    const startNode = nodes.find(node => {
      const data = node.getData()
      return data.type === 'start'
    })

    if (startNode) {
      levels.set(0, [startNode])
      visited.add(startNode.id)
      
      // 注册开始节点到坐标系统
      this.registerNodeInCoordinateSystem({
        id: startNode.id,
        position: startNode.getPosition(),
        data: { level: 0 }
      }, 0, null)
    }

    // BFS遍历构建层级
    let currentLevel = 0
    while (levels.has(currentLevel) && levels.get(currentLevel).length > 0) {
      const nextLevel = []
      
      levels.get(currentLevel).forEach(node => {
        const children = adjacencyList.get(node.id) || []
        children.forEach(childId => {
          if (!visited.has(childId)) {
            const childNode = nodeMap.get(childId)
            if (childNode) {
              nextLevel.push(childNode)
              visited.add(childId)
              
              // 注册子节点到坐标系统
              this.registerNodeInCoordinateSystem({
                id: childNode.id,
                position: childNode.getPosition(),
                data: { level: currentLevel + 1 }
              }, currentLevel + 1, node)
            }
          }
        })
      })

      if (nextLevel.length > 0) {
        levels.set(currentLevel + 1, nextLevel)
      }
      currentLevel++
    }

    return levels
  }

  /**
   * 按层级布局节点
   * @param {Map} levels - 层级映射
   */
  layoutNodesByLevels(levels) {
    const { origin, nodeSpacing } = this.config
    
    levels.forEach((levelNodes, levelIndex) => {
      const levelY = origin.y + levelIndex * nodeSpacing.y
      const totalWidth = Math.max(0, (levelNodes.length - 1) * nodeSpacing.x)
      const startX = origin.x - totalWidth / 2

      levelNodes.forEach((node, nodeIndex) => {
        const nodeX = startX + nodeIndex * nodeSpacing.x
        const position = this.snapToGrid({ x: nodeX, y: levelY })
        
        // 更新节点位置
        node.setPosition(position)
        
        // 更新坐标系统中的位置信息
        this.coordinateSystem.nodePositions.set(node.id, {
          x: position.x,
          y: position.y,
          level: levelIndex,
          index: nodeIndex
        })
      })
    })
  }

  /**
   * 扩展画布以适应所有节点
   */
  expandCanvasToFitAllNodes() {
    if (!this.graph) return

    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity

    // 计算所有节点的边界
    this.coordinateSystem.nodePositions.forEach(position => {
      minX = Math.min(minX, position.x)
      maxX = Math.max(maxX, position.x)
      minY = Math.min(minY, position.y)
      maxY = Math.max(maxY, position.y)
    })

    if (minX === Infinity) return // 没有节点

    const nodeSize = { width: 100, height: 100 } // 默认节点大小
    const { canvasMargin, minCanvasSize } = this.config

    const requiredWidth = Math.max(
      minCanvasSize.width,
      maxX - minX + nodeSize.width + canvasMargin.left + canvasMargin.right
    )
    
    const requiredHeight = Math.max(
      minCanvasSize.height,
      maxY - minY + nodeSize.height + canvasMargin.top + canvasMargin.bottom
    )

    // 扩展画布
    this.graph.resize(requiredWidth, requiredHeight)
    this.layoutState.canvasSize = { width: requiredWidth, height: requiredHeight }
    
    console.log(`[EnhancedAutoLayoutManager] 画布已扩展至: ${requiredWidth} x ${requiredHeight}`)
  }

  /**
   * 根据需要扩展画布
   * @param {Object} position - 新节点位置
   */
  expandCanvasIfNeeded(position) {
    if (!this.graph) return

    const currentSize = this.graph.getGraphArea()
    const nodeSize = { width: 100, height: 100 }
    const { canvasMargin, expansionStep } = this.config
    
    const requiredWidth = position.x + nodeSize.width + canvasMargin.right
    const requiredHeight = position.y + nodeSize.height + canvasMargin.bottom
    
    let newWidth = currentSize.width
    let newHeight = currentSize.height
    let needsResize = false

    // 按步长扩展宽度
    if (requiredWidth > currentSize.width) {
      newWidth = Math.ceil(requiredWidth / expansionStep) * expansionStep
      needsResize = true
    }

    // 按步长扩展高度
    if (requiredHeight > currentSize.height) {
      newHeight = Math.ceil(requiredHeight / expansionStep) * expansionStep
      needsResize = true
    }

    if (needsResize) {
      this.graph.resize(newWidth, newHeight)
      this.layoutState.canvasSize = { width: newWidth, height: newHeight }
      console.log(`[EnhancedAutoLayoutManager] 画布已按需扩展至: ${newWidth} x ${newHeight}`)
    }
  }

  /**
   * 对齐到网格
   * @param {Object} position - 原始位置
   * @returns {Object} 对齐后的位置
   */
  snapToGrid(position) {
    const { gridSize } = this.config
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    }
  }

  /**
   * 从坐标系统中移除节点
   * @param {string} nodeId - 要移除的节点ID
   */
  removeNodeFromCoordinateSystem(nodeId) {
    // 获取节点位置信息
    const nodePosition = this.coordinateSystem.nodePositions.get(nodeId)
    if (!nodePosition) {
      console.warn(`[EnhancedAutoLayoutManager] 节点 ${nodeId} 不存在于坐标系统中`)
      return
    }

    const { level } = nodePosition

    // 从层级映射中移除节点
    if (this.coordinateSystem.levels.has(level)) {
      const levelNodes = this.coordinateSystem.levels.get(level)
      const nodeIndex = levelNodes.indexOf(nodeId)
      if (nodeIndex >= 0) {
        levelNodes.splice(nodeIndex, 1)
        
        // 如果层级为空，删除该层级
        if (levelNodes.length === 0) {
          this.coordinateSystem.levels.delete(level)
        }
      }
    }

    // 从位置映射中移除节点
    this.coordinateSystem.nodePositions.delete(nodeId)

    // 从连接映射中移除节点的所有连接
    this.coordinateSystem.connections.delete(nodeId)
    
    // 移除其他节点到该节点的连接
    this.coordinateSystem.connections.forEach((targets, sourceId) => {
      const targetIndex = targets.indexOf(nodeId)
      if (targetIndex >= 0) {
        targets.splice(targetIndex, 1)
      }
    })

    // 更新布局状态
    this.updateLayoutState()

    console.log(`[EnhancedAutoLayoutManager] 节点 ${nodeId} 已从坐标系统中移除`)
  }

  /**
   * 更新布局状态
   */
  updateLayoutState() {
    // 重新计算最大层级
    this.layoutState.maxLevel = this.coordinateSystem.levels.size > 0 
      ? Math.max(...this.coordinateSystem.levels.keys()) 
      : 0

    // 重新计算单层最多节点数
    this.layoutState.maxNodesPerLevel = 0
    this.coordinateSystem.levels.forEach(levelNodes => {
      this.layoutState.maxNodesPerLevel = Math.max(
        this.layoutState.maxNodesPerLevel, 
        levelNodes.length
      )
    })
  }

  /**
   * 获取坐标系统信息
   * @returns {Object} 坐标系统信息
   */
  getCoordinateSystemInfo() {
    return {
      levels: Array.from(this.coordinateSystem.levels.entries()),
      nodePositions: Array.from(this.coordinateSystem.nodePositions.entries()),
      connections: Array.from(this.coordinateSystem.connections.entries()),
      layoutState: { ...this.layoutState }
    }
  }

  /**
   * 清理布局数据
   */
  clear() {
    this.initCoordinateSystem()
    this.layoutState.canvasSize = { width: 0, height: 0 }
    console.log('[EnhancedAutoLayoutManager] 布局数据已清理')
  }
}

export default EnhancedAutoLayoutManager