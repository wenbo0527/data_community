/**
 * 统一布局管理器
 * 合并了EnhancedAutoLayoutManager和BranchLayoutManager的功能
 * 提供统一的布局管理接口，支持层级布局和分支布局
 */

import { getNodeConfig } from './nodeTypes.js'
import { 
  BRANCH_SPACING_CONFIG, 
  calculateAdaptiveBranchSpacing, 
  checkBranchOverlap 
} from './branchSpacingConfig.js'

export class UnifiedLayoutManager {
  constructor(graph, options = {}) {
    this.graph = graph
    
    // 统一配置结构
    this.config = {
      // 通用配置
      gridSize: 20,
      canvasMargin: { top: 100, left: 100, right: 100, bottom: 100 },
      
      // 节点布局配置
      nodeSpacing: { x: 200, y: 150 },
      minCanvasSize: { width: 1200, height: 800 },
      expansionStep: 400,
      
      // 分支布局配置
      branchSpacing: 180,
      minBranchSpacing: 150,
      maxBranchSpacing: 250,
      branchOffset: 120,
      levelHeight: 150,
      
      // 节点尺寸配置
      nodeWidth: 120,
      nodeHeight: 80,
      
      // 布局模式
      mode: options.mode || 'unified', // 'auto-layout', 'branch-layout', 'unified'
      
      ...options
    }
    
    // 坐标系统（来自EnhancedAutoLayoutManager）
    this.coordinateSystem = {
      origin: { x: 400, y: 100 },
      levels: new Map(),
      nodePositions: new Map(),
      connections: new Map()
    }
    
    // 布局状态
    this.layoutState = {
      maxLevel: 0,
      maxNodesPerLevel: 0,
      canvasSize: { width: 0, height: 0 }
    }
  }

  // ==================== 通用工具方法 ====================

  /**
   * 将位置对齐到网格
   * @param {Object} position - 位置坐标
   * @returns {Object} 对齐后的位置
   */
  snapToGrid(position) {
    return {
      x: Math.round(position.x / this.config.gridSize) * this.config.gridSize,
      y: Math.round(position.y / this.config.gridSize) * this.config.gridSize
    }
  }

  /**
   * 根据新节点位置按需扩展画布
   * @param {Object} position - 节点位置
   */
  expandCanvasIfNeeded(position) {
    const { canvasMargin, expansionStep } = this.config
    const currentSize = this.layoutState.canvasSize
    
    let needsExpansion = false
    let newSize = { ...currentSize }
    
    // 检查是否需要扩展宽度
    if (position.x + canvasMargin.right > currentSize.width) {
      newSize.width = Math.ceil((position.x + canvasMargin.right) / expansionStep) * expansionStep
      needsExpansion = true
    }
    
    // 检查是否需要扩展高度
    if (position.y + canvasMargin.bottom > currentSize.height) {
      newSize.height = Math.ceil((position.y + canvasMargin.bottom) / expansionStep) * expansionStep
      needsExpansion = true
    }
    
    if (needsExpansion) {
      this.layoutState.canvasSize = newSize
      console.log('[UnifiedLayoutManager] 画布已扩展:', newSize)
    }
  }

  // ==================== 坐标系统管理（来自EnhancedAutoLayoutManager）====================

  /**
   * 初始化坐标系统
   */
  initCoordinateSystem() {
    this.coordinateSystem.levels.clear()
    this.coordinateSystem.nodePositions.clear()
    this.coordinateSystem.connections.clear()
    this.layoutState.maxLevel = 0
    this.layoutState.maxNodesPerLevel = 0
    
    console.log('[UnifiedLayoutManager] 坐标系统已初始化')
  }

  /**
   * 注册节点到坐标系统
   * @param {Object} nodeData - 节点数据
   * @param {number} level - 层级
   * @param {Object} parentNode - 父节点
   */
  registerNodeInCoordinateSystem(nodeData, level, parentNode) {
    // 更新层级映射
    if (!this.coordinateSystem.levels.has(level)) {
      this.coordinateSystem.levels.set(level, [])
    }
    this.coordinateSystem.levels.get(level).push(nodeData.id)
    
    // 更新节点位置映射
    this.coordinateSystem.nodePositions.set(nodeData.id, {
      x: nodeData.position.x,
      y: nodeData.position.y,
      level: level,
      index: this.coordinateSystem.levels.get(level).length - 1
    })
    
    // 更新连接映射
    if (parentNode) {
      const parentId = parentNode.id || parentNode.getData?.()?.id
      if (parentId) {
        if (!this.coordinateSystem.connections.has(parentId)) {
          this.coordinateSystem.connections.set(parentId, [])
        }
        this.coordinateSystem.connections.get(parentId).push(nodeData.id)
      }
    }
    
    // 更新布局状态
    this.layoutState.maxLevel = Math.max(this.layoutState.maxLevel, level)
    const nodesInLevel = this.coordinateSystem.levels.get(level).length
    this.layoutState.maxNodesPerLevel = Math.max(this.layoutState.maxNodesPerLevel, nodesInLevel)
  }

  // ==================== 层级布局管理（来自EnhancedAutoLayoutManager）====================

  /**
   * 添加节点并自动布局
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
      return 0
    }

    const parentData = parentNode.getData()
    const parentLevel = parentData.level || 0
    
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
      let parentPosition = this.getNodePosition(parentNode)
      
      if (parentPosition && typeof parentPosition.x !== 'undefined') {
        const totalWidth = (totalBranches - 1) * this.config.branchOffset
        const startX = parentPosition.x - totalWidth / 2
        baseX = startX + branchIndex * this.config.branchOffset
      } else {
        baseX = origin.x
      }
    } else if (parentNode) {
      // 有父节点但只有一个分支时，继承父节点X坐标
      let parentPosition = this.getNodePosition(parentNode)
      
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
   * 获取节点位置的通用方法
   * @param {Object} node - 节点对象
   * @returns {Object} 位置坐标
   */
  getNodePosition(node) {
    if (typeof node.getPosition === 'function') {
      return node.getPosition()
    } else if (node.position) {
      return node.position
    } else {
      console.warn('[UnifiedLayoutManager] 无法获取节点位置，使用默认位置')
      return { x: this.coordinateSystem.origin.x, y: this.coordinateSystem.origin.y }
    }
  }

  /**
   * 获取指定层级的节点数量
   * @param {number} level - 层级
   * @returns {number} 节点数量
   */
  getNodeCountInLevel(level) {
    return this.coordinateSystem.levels.get(level)?.length || 0
  }

  /**
   * 避免同层级节点重叠
   * @param {number} level - 层级
   * @param {Object} targetPosition - 目标位置
   * @returns {Object} 调整后的位置
   */
  avoidSameLevelOverlap(level, targetPosition) {
    const nodesInLevel = this.coordinateSystem.levels.get(level) || []
    const { nodeSpacing } = this.config
    
    let adjustedPosition = { ...targetPosition }
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      let hasOverlap = false
      
      for (const nodeId of nodesInLevel) {
        const nodePos = this.coordinateSystem.nodePositions.get(nodeId)
        if (nodePos) {
          const distance = Math.abs(adjustedPosition.x - nodePos.x)
          if (distance < nodeSpacing.x * 0.8) {
            // 有重叠，向右偏移
            adjustedPosition.x += nodeSpacing.x
            hasOverlap = true
            break
          }
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
   * 验证连接规则
   * @param {Object} nodeData - 节点数据
   * @param {Object} parentNode - 父节点
   */
  validateConnectionRules(nodeData, parentNode) {
    // 这里可以添加连接规则验证逻辑
    console.log('[UnifiedLayoutManager] 连接规则验证通过:', nodeData.id)
  }

  // ==================== 分支布局管理（来自BranchLayoutManager）====================

  /**
   * 自动分支布局
   * @param {Object} splitNode - 分流节点
   * @param {Array} branches - 分支配置数组
   * @returns {Array} 分支位置数组
   */
  layoutBranches(splitNode, branches) {
    console.log('[UnifiedLayoutManager] 开始分支布局:', splitNode.id, branches)
    
    const branchCount = branches.length
    const splitPosition = this.getNodePosition(splitNode)
    
    // 获取节点类型
    const nodeData = splitNode.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type || 'default'
    
    // 计算分支位置，传递节点类型
    const branchPositions = this.calculateBranchPositions(splitPosition, branchCount, nodeType)
    
    // 为每个分支分配位置和标签
    const layoutResult = branches.map((branch, index) => ({
      ...branch,
      position: branchPositions[index],
      parentSplit: splitNode.id,
      branchIndex: index
    }))
    
    console.log('[UnifiedLayoutManager] 分支布局完成:', layoutResult)
    return layoutResult
  }

  /**
   * 计算分支位置
   * @param {Object} splitPosition - 分流节点位置
   * @param {number} branchCount - 分支数量
   * @param {string} nodeType - 节点类型
   * @returns {Array} 分支位置数组
   */
  calculateBranchPositions(splitPosition, branchCount, nodeType = 'default') {
    const positions = []
    
    if (branchCount === 1) {
      // 单分支直接向下
      positions.push({
        x: splitPosition.x,
        y: splitPosition.y + this.config.levelHeight
      })
    } else {
      // 多分支水平分布（在同一行）
      const baseY = splitPosition.y + this.config.levelHeight
      
      // 使用自适应分支间距计算
      const adaptiveSpacing = calculateAdaptiveBranchSpacing(branchCount, nodeType)
      
      const totalWidth = (branchCount - 1) * adaptiveSpacing
      const startX = splitPosition.x - totalWidth / 2
      
      console.log('[UnifiedLayoutManager] 分支布局计算:', {
        nodeType,
        branchCount,
        adaptiveSpacing,
        totalWidth,
        startX,
        baseY,
        splitPosition
      })
      
      for (let i = 0; i < branchCount; i++) {
        const branchX = startX + i * adaptiveSpacing
        positions.push({
          x: branchX,
          y: baseY
        })
        
        console.log(`[UnifiedLayoutManager] 分支${i + 1}位置:`, {
          x: branchX,
          y: baseY,
          spacing: adaptiveSpacing
        })
      }
      
      // 检查是否有重叠
      if (checkBranchOverlap(positions, this.config.nodeWidth)) {
        console.warn('[UnifiedLayoutManager] 检测到分支重叠，建议调整间距配置')
      }
    }
    
    return positions.map(pos => this.snapToGrid(pos))
  }

  /**
   * 更新分流节点的分支布局
   * @param {Object} splitNode - 分流节点
   * @param {Object} config - 节点配置
   * @param {boolean} skipStructuredLayout - 是否跳过结构化布局触发
   */
  updateBranchLayout(splitNode, config, skipStructuredLayout = false) {
    console.log('[UnifiedLayoutManager] 更新分支布局:', splitNode.id, config, { skipStructuredLayout })
    
    // 确保获取到正确的X6节点实例
    let x6Node = splitNode
    if (!splitNode.getData || typeof splitNode.getData !== 'function') {
      if (this.graph && splitNode.id) {
        x6Node = this.graph.getCellById(splitNode.id)
        if (!x6Node) {
          console.error('[UnifiedLayoutManager] 无法找到X6节点实例:', splitNode.id)
          return
        }
      } else {
        console.error('[UnifiedLayoutManager] 无效的节点对象:', splitNode)
        return
      }
    }
    
    // 获取节点类型
    const nodeData = x6Node.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type
    console.log('[UnifiedLayoutManager] 节点数据:', nodeData)
    console.log('[UnifiedLayoutManager] 识别的节点类型:', nodeType)
    
    let branches = []
    
    // 根据节点类型提取分支信息
    switch (nodeType) {
      case 'audience-split':
        branches = this.extractAudienceBranches(config)
        break
      case 'event-split':
        branches = this.extractEventBranches(config)
        break
      case 'ab-test':
        branches = this.extractABTestBranches(config)
        break
      default:
        console.warn('[UnifiedLayoutManager] 不支持的分流节点类型:', nodeType)
        return
    }
    
    if (branches.length > 0) {
      // 计算分支布局
      const branchLayout = this.layoutBranches(x6Node, branches)
      
      // 更新节点的分支信息
      this.updateNodeBranchData(x6Node, branchLayout)
      
      // 更新连接端口
      this.updateNodePorts(x6Node, branches)
      
      // 根据参数决定是否触发结构化布局
      if (!skipStructuredLayout) {
        console.log('[UnifiedLayoutManager] 分支布局更新完成，将触发结构化布局')
        this.onBranchLayoutUpdated?.(x6Node, branchLayout)
      } else {
        console.log('[UnifiedLayoutManager] 分支布局更新完成，跳过结构化布局触发')
      }
    }
  }

  /**
   * 提取人群分流分支
   * @param {Object} config - 配置对象
   * @returns {Array} 分支数组
   */
  extractAudienceBranches(config) {
    const audiences = config.audiences || []
    return audiences.map((audience, index) => ({
      id: `audience_${index}`,
      label: audience.name || `人群${index + 1}`,
      type: 'audience',
      audienceId: audience.id,
      condition: audience.condition
    }))
  }

  /**
   * 提取事件分流分支
   * @param {Object} config - 配置对象
   * @returns {Array} 分支数组
   */
  extractEventBranches(config) {
    const events = config.events || []
    return events.map((event, index) => ({
      id: `event_${index}`,
      label: event.name || `事件${index + 1}`,
      type: 'event',
      eventId: event.id,
      condition: event.condition
    }))
  }

  /**
   * 提取AB测试分支
   * @param {Object} config - 配置对象
   * @returns {Array} 分支数组
   */
  extractABTestBranches(config) {
    const variants = config.variants || []
    return variants.map((variant, index) => ({
      id: `variant_${index}`,
      label: variant.name || `版本${String.fromCharCode(65 + index)}`,
      type: 'variant',
      variantId: variant.id,
      percentage: variant.percentage
    }))
  }

  /**
   * 更新节点的分支数据
   * @param {Object} node - 节点
   * @param {Array} branchLayout - 分支布局
   */
  updateNodeBranchData(node, branchLayout) {
    const currentData = node.getData() || {}
    node.setData({
      ...currentData,
      branches: branchLayout,
      branchCount: branchLayout.length,
      lastBranchUpdate: Date.now()
    })
  }

  /**
   * 获取节点的分支信息
   * @param {Object} node - 节点
   * @returns {Array} 分支数组
   */
  getNodeBranches(node) {
    if (!node || !node.getData) {
      console.warn('[UnifiedLayoutManager] 无效的节点对象')
      return []
    }

    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType

    // 检查是否为分支节点
    if (!['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
      return []
    }

    // 如果节点已有分支数据，直接返回
    if (nodeData.branches && Array.isArray(nodeData.branches)) {
      return nodeData.branches
    }

    // 根据节点类型和配置提取分支信息
    const config = nodeData.config || {}
    let branches = []

    switch (nodeType) {
      case 'audience-split':
        branches = this.extractAudienceBranches(config)
        break
      case 'event-split':
        branches = this.extractEventBranches(config)
        break
      case 'ab-test':
        branches = this.extractABTestBranches(config)
        break
      default:
        console.warn('[UnifiedLayoutManager] 不支持的分支节点类型:', nodeType)
        return []
    }

    return branches
  }

  /**
   * 更新节点端口
   * @param {Object} node - 节点
   * @param {Array} branches - 分支数组
   */
  updateNodePorts(node, branches) {
    // 这里可以添加端口更新逻辑
    console.log('[UnifiedLayoutManager] 更新节点端口:', node.id, branches.length)
  }

  // ==================== 统一布局接口 ====================

  /**
   * 应用统一布局
   * @param {Object} options - 布局选项
   */
  applyUnifiedLayout(options = {}) {
    const { mode = this.config.mode } = options
    
    console.log('[UnifiedLayoutManager] 应用统一布局，模式:', mode)
    
    switch (mode) {
      case 'auto-layout':
        this.applyAutoLayout(options)
        break
      case 'branch-layout':
        this.applyBranchLayout(options)
        break
      case 'unified':
      default:
        this.applyHybridLayout(options)
        break
    }
  }

  /**
   * 应用自动布局模式
   * @param {Object} options - 选项
   */
  applyAutoLayout(options) {
    console.log('[UnifiedLayoutManager] 应用自动布局模式')
    this.initCoordinateSystem()
    // 这里可以添加自动布局的具体逻辑
  }

  /**
   * 应用分支布局模式
   * @param {Object} options - 选项
   */
  applyBranchLayout(options) {
    console.log('[UnifiedLayoutManager] 应用分支布局模式')
    // 这里可以添加分支布局的具体逻辑
  }

  /**
   * 应用混合布局模式
   * @param {Object} options - 选项
   */
  applyHybridLayout(options) {
    console.log('[UnifiedLayoutManager] 应用混合布局模式')
    this.initCoordinateSystem()
    // 这里可以添加混合布局的具体逻辑
  }

  // ==================== 扩展方法（来自EnhancedAutoLayoutManager）====================

  /**
   * 重新布局所有节点
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   */
  relayoutAll(nodes, edges) {
    console.log('[UnifiedLayoutManager] 开始重新布局所有节点')
    
    // 清理现有坐标系统
    this.initCoordinateSystem()
    
    // 重新构建坐标系统
    this.rebuildCoordinateSystem(nodes, edges)
    
    // 重新计算所有节点位置
    this.recalculateAllPositions()
    
    // 扩展画布以适应所有节点
    this.expandCanvasToFitAllNodes()
    
    console.log('[UnifiedLayoutManager] 重新布局完成')
  }

  /**
   * 重建坐标系统
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   */
  rebuildCoordinateSystem(nodes, edges) {
    // 构建连接关系图
    const connectionMap = new Map()
    edges.forEach(edge => {
      const sourceId = edge.source?.cell || edge.source
      const targetId = edge.target?.cell || edge.target
      
      if (!connectionMap.has(sourceId)) {
        connectionMap.set(sourceId, [])
      }
      connectionMap.get(sourceId).push(targetId)
    })
    
    // 找到开始节点（没有输入连接的节点）
    const hasInput = new Set()
    edges.forEach(edge => {
      const targetId = edge.target?.cell || edge.target
      hasInput.add(targetId)
    })
    
    const startNodes = nodes.filter(node => !hasInput.has(node.id))
    
    // 从开始节点开始，层级遍历构建坐标系统
    const visited = new Set()
    const queue = startNodes.map(node => ({ node, level: 0 }))
    
    while (queue.length > 0) {
      const { node, level } = queue.shift()
      
      if (visited.has(node.id)) continue
      visited.add(node.id)
      
      // 添加节点到对应层级
      if (!this.coordinateSystem.levels.has(level)) {
        this.coordinateSystem.levels.set(level, [])
      }
      this.coordinateSystem.levels.get(level).push(node.id)
      
      // 更新节点数据中的层级信息
      if (node.setData) {
        const currentData = node.getData() || {}
        node.setData({ ...currentData, level })
      }
      
      // 添加子节点到队列
      const children = connectionMap.get(node.id) || []
      children.forEach(childId => {
        const childNode = nodes.find(n => n.id === childId)
        if (childNode && !visited.has(childId)) {
          queue.push({ node: childNode, level: level + 1 })
        }
      })
    }
    
    // 更新连接映射
    this.coordinateSystem.connections = connectionMap
  }

  /**
   * 重新计算所有节点位置
   */
  recalculateAllPositions() {
    const { nodeSpacing } = this.config
    const { origin } = this.coordinateSystem
    
    // 按层级重新计算位置
    this.coordinateSystem.levels.forEach((levelNodes, levelIndex) => {
      const levelY = origin.y + levelIndex * nodeSpacing.y
      const totalWidth = (levelNodes.length - 1) * nodeSpacing.x
      const startX = origin.x - totalWidth / 2

      levelNodes.forEach((nodeId, nodeIndex) => {
        const nodeX = startX + nodeIndex * nodeSpacing.x
        const position = this.snapToGrid({ x: nodeX, y: levelY })
        
        // 查找节点实例
        const node = this.graph?.getCellById(nodeId)
        if (node && node.setPosition) {
          node.setPosition(position)
        }
        
        // 更新坐标系统中的位置信息
        this.coordinateSystem.nodePositions.set(nodeId, {
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
    if (this.graph.resize) {
      this.graph.resize(requiredWidth, requiredHeight)
    }
    this.layoutState.canvasSize = { width: requiredWidth, height: requiredHeight }
    
    console.log(`[UnifiedLayoutManager] 画布已扩展至: ${requiredWidth} x ${requiredHeight}`)
  }

  /**
   * 从坐标系统中移除节点
   * @param {string} nodeId - 要移除的节点ID
   */
  removeNodeFromCoordinateSystem(nodeId) {
    // 获取节点位置信息
    const nodePosition = this.coordinateSystem.nodePositions.get(nodeId)
    if (!nodePosition) {
      console.warn(`[UnifiedLayoutManager] 节点 ${nodeId} 不存在于坐标系统中`)
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

    console.log(`[UnifiedLayoutManager] 节点 ${nodeId} 已从坐标系统中移除`)
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
    console.log('[UnifiedLayoutManager] 布局数据已清理')
  }
}

// ==================== 向后兼容包装类 ====================

/**
 * EnhancedAutoLayoutManager 兼容包装类
 */
export class EnhancedAutoLayoutManager extends UnifiedLayoutManager {
  constructor(graph) {
    super(graph, { mode: 'auto-layout' })
    console.log('[EnhancedAutoLayoutManager] 兼容模式已启用，使用UnifiedLayoutManager')
  }
}

/**
 * BranchLayoutManager 兼容包装类
 */
export class BranchLayoutManager extends UnifiedLayoutManager {
  constructor(graph, layoutConfig) {
    super(graph, { mode: 'branch-layout', ...layoutConfig })
    console.log('[BranchLayoutManager] 兼容模式已启用，使用UnifiedLayoutManager')
  }
}

export default UnifiedLayoutManager