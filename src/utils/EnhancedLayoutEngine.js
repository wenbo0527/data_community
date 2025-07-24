/**
 * 增强型布局引擎
 * 优化布局算法性能，减少重复计算，提供智能布局策略
 */

import { SmartCacheManager } from './SmartCacheManager.js'

export class EnhancedLayoutEngine {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = {
      enableCache: true,
      enableBatching: true,
      enableIncrementalLayout: true,
      maxBatchSize: 50,
      layoutThrottle: 100,
      ...options
    }
    
    // 智能缓存管理器
    this.cache = new SmartCacheManager({
      maxSize: 1000,
      ttl: 300000, // 5分钟
      enableLRU: true
    })
    
    // 布局状态
    this.layoutState = {
      isLayouting: false,
      pendingUpdates: new Set(),
      lastLayoutTime: 0,
      layoutVersion: 0
    }
    
    // 性能监控
    this.performance = {
      layoutCount: 0,
      totalTime: 0,
      averageTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    }
    
    // 节流的布局函数
    this.throttledLayout = this.throttle(this.executeLayout.bind(this), this.options.layoutThrottle)
  }

  /**
   * 智能布局调度器
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Object} options - 布局选项
   */
  async scheduleLayout(nodes, edges, options = {}) {
    const layoutId = this.generateLayoutId(nodes, edges, options)
    
    // 检查缓存
    if (this.options.enableCache) {
      const cachedResult = this.cache.get('layout', layoutId)
      if (cachedResult && this.isLayoutValid(cachedResult, nodes, edges)) {
        this.performance.cacheHits++
        return cachedResult
      }
      this.performance.cacheMisses++
    }
    
    // 增量布局检查
    if (this.options.enableIncrementalLayout && this.canUseIncrementalLayout(nodes, edges)) {
      return this.executeIncrementalLayout(nodes, edges, options)
    }
    
    // 批量处理
    if (this.options.enableBatching) {
      return this.scheduleBatchLayout(nodes, edges, options)
    }
    
    // 直接执行布局
    return this.throttledLayout(nodes, edges, options)
  }

  /**
   * 执行布局计算
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Object} options - 布局选项
   */
  async executeLayout(nodes, edges, options = {}) {
    if (this.layoutState.isLayouting) {
      console.log('[EnhancedLayoutEngine] 布局正在进行中，跳过重复请求')
      return null
    }
    
    const startTime = performance.now()
    this.layoutState.isLayouting = true
    this.layoutState.layoutVersion++
    
    try {
      console.log('[EnhancedLayoutEngine] 开始执行布局计算', {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        version: this.layoutState.layoutVersion
      })
      
      // 预处理节点和边
      const processedData = this.preprocessLayoutData(nodes, edges)
      
      // 执行核心布局算法
      const layoutResult = await this.computeOptimalLayout(processedData, options)
      
      // 后处理和优化
      const optimizedResult = this.postprocessLayout(layoutResult, options)
      
      // 缓存结果
      if (this.options.enableCache) {
        const layoutId = this.generateLayoutId(nodes, edges, options)
        this.cache.set('layout', layoutId, optimizedResult)
      }
      
      // 更新性能统计
      const duration = performance.now() - startTime
      this.updatePerformanceStats(duration)
      
      console.log('[EnhancedLayoutEngine] 布局计算完成', {
        duration: `${duration.toFixed(2)}ms`,
        nodeCount: Object.keys(optimizedResult.positions).length
      })
      
      return optimizedResult
      
    } catch (error) {
      console.error('[EnhancedLayoutEngine] 布局计算失败:', error)
      throw error
    } finally {
      this.layoutState.isLayouting = false
      this.layoutState.lastLayoutTime = Date.now()
    }
  }

  /**
   * 预处理布局数据
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   */
  preprocessLayoutData(nodes, edges) {
    // 过滤无效节点和边
    const validNodes = nodes.filter(node => this.isValidNode(node))
    const validEdges = edges.filter(edge => this.isValidEdge(edge, validNodes))
    
    // 构建邻接表
    const adjacencyList = this.buildAdjacencyList(validNodes, validEdges)
    
    // 检测连通分量
    const components = this.findConnectedComponents(validNodes, adjacencyList)
    
    // 拓扑排序
    const topologyLevels = this.performTopologicalSort(validNodes, adjacencyList)
    
    return {
      nodes: validNodes,
      edges: validEdges,
      adjacencyList,
      components,
      topologyLevels
    }
  }

  /**
   * 计算最优布局
   * @param {Object} data - 预处理的数据
   * @param {Object} options - 布局选项
   */
  async computeOptimalLayout(data, options) {
    const { nodes, topologyLevels, components } = data
    const positions = {}
    
    // 为每个连通分量计算布局
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const componentPositions = await this.layoutComponent(component, topologyLevels, options)
      
      // 合并位置信息
      Object.assign(positions, componentPositions)
      
      // 分量间的间距调整
      if (i > 0) {
        this.adjustComponentSpacing(positions, component, components.slice(0, i))
      }
    }
    
    // 全局对齐和优化
    const alignedPositions = this.applyGlobalAlignment(positions, options)
    
    return {
      positions: alignedPositions,
      levels: topologyLevels.length,
      components: components.length,
      metadata: {
        layoutVersion: this.layoutState.layoutVersion,
        timestamp: Date.now()
      }
    }
  }

  /**
   * 布局单个连通分量
   * @param {Array} componentNodes - 分量节点
   * @param {Array} topologyLevels - 拓扑层级
   * @param {Object} options - 布局选项
   */
  async layoutComponent(componentNodes, topologyLevels, options) {
    const positions = {}
    const config = {
      levelHeight: 150,
      nodeSpacing: 200,
      branchSpacing: 180,
      ...options.layoutConfig
    }
    
    // 按层级布局
    for (let levelIndex = 0; levelIndex < topologyLevels.length; levelIndex++) {
      const levelNodes = topologyLevels[levelIndex].filter(node => 
        componentNodes.some(cn => cn.id === node.id)
      )
      
      if (levelNodes.length === 0) continue
      
      const y = levelIndex * config.levelHeight
      const levelPositions = await this.layoutLevel(levelNodes, y, levelIndex, config)
      
      levelNodes.forEach((node, index) => {
        positions[node.id] = levelPositions[index]
      })
    }
    
    return positions
  }

  /**
   * 布局单个层级
   * @param {Array} levelNodes - 层级节点
   * @param {number} y - Y坐标
   * @param {number} levelIndex - 层级索引
   * @param {Object} config - 配置
   */
  async layoutLevel(levelNodes, y, levelIndex, config) {
    const positions = []
    
    if (levelNodes.length === 1) {
      // 单节点居中
      positions.push({ x: 0, y })
    } else {
      // 多节点分布
      const totalWidth = (levelNodes.length - 1) * config.nodeSpacing
      const startX = -totalWidth / 2
      
      levelNodes.forEach((node, index) => {
        const x = startX + index * config.nodeSpacing
        positions.push({ x, y })
      })
    }
    
    // 检查并解决重叠
    return this.resolveOverlaps(positions, config)
  }

  /**
   * 解决节点重叠
   * @param {Array} positions - 位置数组
   * @param {Object} config - 配置
   */
  resolveOverlaps(positions, config) {
    const minDistance = config.nodeSpacing * 0.8
    const resolvedPositions = [...positions]
    
    for (let i = 0; i < resolvedPositions.length; i++) {
      for (let j = i + 1; j < resolvedPositions.length; j++) {
        const pos1 = resolvedPositions[i]
        const pos2 = resolvedPositions[j]
        const distance = Math.abs(pos1.x - pos2.x)
        
        if (distance < minDistance) {
          const adjustment = (minDistance - distance) / 2
          pos1.x -= adjustment
          pos2.x += adjustment
        }
      }
    }
    
    return resolvedPositions
  }

  /**
   * 应用全局对齐
   * @param {Object} positions - 位置对象
   * @param {Object} options - 选项
   */
  applyGlobalAlignment(positions, options) {
    if (Object.keys(positions).length === 0) return positions
    
    const alignment = options.alignment || 'center'
    const positionValues = Object.values(positions)
    
    // 计算边界
    const bounds = {
      minX: Math.min(...positionValues.map(p => p.x)),
      maxX: Math.max(...positionValues.map(p => p.x)),
      minY: Math.min(...positionValues.map(p => p.y)),
      maxY: Math.max(...positionValues.map(p => p.y))
    }
    
    // 计算偏移量
    let offsetX = 0
    let offsetY = 0
    
    switch (alignment) {
      case 'center':
        offsetX = -(bounds.minX + bounds.maxX) / 2
        offsetY = -(bounds.minY + bounds.maxY) / 2
        break
      case 'top-left':
        offsetX = -bounds.minX
        offsetY = -bounds.minY
        break
      case 'top-center':
        offsetX = -(bounds.minX + bounds.maxX) / 2
        offsetY = -bounds.minY
        break
    }
    
    // 应用偏移
    const alignedPositions = {}
    Object.entries(positions).forEach(([nodeId, position]) => {
      alignedPositions[nodeId] = {
        x: position.x + offsetX,
        y: position.y + offsetY
      }
    })
    
    return alignedPositions
  }

  /**
   * 增量布局
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Object} options - 选项
   */
  async executeIncrementalLayout(nodes, edges, options) {
    console.log('[EnhancedLayoutEngine] 执行增量布局')
    
    // 获取变更的节点
    const changedNodes = this.getChangedNodes(nodes)
    const affectedNodes = this.getAffectedNodes(changedNodes, edges)
    
    // 只重新计算受影响的节点
    const partialResult = await this.computePartialLayout(affectedNodes, edges, options)
    
    // 合并到现有布局
    return this.mergeLayoutResults(partialResult, options)
  }

  /**
   * 批量布局调度
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Object} options - 选项
   */
  scheduleBatchLayout(nodes, edges, options) {
    return new Promise((resolve) => {
      // 添加到待处理队列
      this.layoutState.pendingUpdates.add({ nodes, edges, options, resolve })
      
      // 延迟执行批量处理
      setTimeout(() => {
        this.processBatchUpdates()
      }, 50)
    })
  }

  /**
   * 处理批量更新
   */
  async processBatchUpdates() {
    if (this.layoutState.pendingUpdates.size === 0) return
    
    const updates = Array.from(this.layoutState.pendingUpdates)
    this.layoutState.pendingUpdates.clear()
    
    // 合并所有更新
    const mergedUpdate = this.mergeUpdates(updates)
    
    try {
      const result = await this.executeLayout(
        mergedUpdate.nodes, 
        mergedUpdate.edges, 
        mergedUpdate.options
      )
      
      // 通知所有等待的调用者
      updates.forEach(update => update.resolve(result))
    } catch (error) {
      updates.forEach(update => update.resolve(null))
    }
  }

  /**
   * 工具方法
   */
  
  generateLayoutId(nodes, edges, options) {
    const nodeIds = nodes.map(n => n.id).sort().join(',')
    const edgeIds = edges.map(e => e.id).sort().join(',')
    const optionsHash = JSON.stringify(options)
    return `${nodeIds}_${edgeIds}_${btoa(optionsHash).slice(0, 10)}`
  }
  
  isValidNode(node) {
    return node && node.id && typeof node.getData === 'function'
  }
  
  isValidEdge(edge, nodes) {
    if (!edge || !edge.getSource || !edge.getTarget) return false
    const source = edge.getSource()
    const target = edge.getTarget()
    return source && target && 
           nodes.some(n => n.id === source.cell) && 
           nodes.some(n => n.id === target.cell)
  }
  
  throttle(func, limit) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  updatePerformanceStats(duration) {
    this.performance.layoutCount++
    this.performance.totalTime += duration
    this.performance.averageTime = this.performance.totalTime / this.performance.layoutCount
  }
  
  getPerformanceStats() {
    return {
      ...this.performance,
      cacheStats: this.cache.getStats()
    }
  }
  
  // 其他辅助方法的占位符
  buildAdjacencyList(nodes, edges) { /* 实现邻接表构建 */ }
  findConnectedComponents(nodes, adjacencyList) { /* 实现连通分量查找 */ }
  performTopologicalSort(nodes, adjacencyList) { /* 实现拓扑排序 */ }
  canUseIncrementalLayout(nodes, edges) { return false /* 实现增量布局检查 */ }
  getChangedNodes(nodes) { return [] /* 实现变更节点检测 */ }
  getAffectedNodes(changedNodes, edges) { return [] /* 实现受影响节点计算 */ }
  computePartialLayout(nodes, edges, options) { /* 实现部分布局计算 */ }
  mergeLayoutResults(partialResult, options) { /* 实现布局结果合并 */ }
  mergeUpdates(updates) { /* 实现更新合并 */ }
  adjustComponentSpacing(positions, component, previousComponents) { /* 实现分量间距调整 */ }
  isLayoutValid(cachedResult, nodes, edges) { return true /* 实现布局有效性检查 */ }
}