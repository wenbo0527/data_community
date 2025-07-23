/**
 * 智能结构化布局引擎
 * 基于开始节点的分层自动化布局，集成统一坐标系统管理
 */

import { coordinateManager } from './CoordinateSystemManager.js'

export class IntelligentStructuredLayoutEngine {
  constructor(graph, options = {}) {
    this.graph = graph
    this.coordinateManager = coordinateManager
    
    this.layoutConfig = {
      levelHeight: 150,           // 层级间距
      nodeSpacing: 120,           // 同层节点间距
      branchSpacing: 180,         // 分支间距
      previewLineSpacing: 80,     // 预览线预留空间
      centerAlignment: true,      // 中心对齐
      gridSize: 20,              // 网格大小
      startNodeCentered: true,    // 开始节点居中
      ...options
    }
    
    // 布局缓存
    this.layoutCache = new Map()
    this.performanceMetrics = {
      layoutCount: 0,
      averageLayoutTime: 0
    }
  }

  /**
   * 计算智能结构化布局
   * 基于开始节点位置，分层自动化优化所有元素布局
   */
  async calculateIntelligentLayout(nodes, edges = [], previewLines = [], options = {}) {
    const startTime = performance.now()
    
    console.log('[IntelligentStructuredLayoutEngine] 开始计算智能布局', {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      previewLineCount: previewLines.length
    })

    try {
      // 1. 找到开始节点作为布局基准
      const startNode = this.findStartNode(nodes)
      if (!startNode) {
        throw new Error('未找到开始节点，无法进行智能布局')
      }

      // 2. 基于开始节点进行拓扑分层
      const levels = this.performTopologicalLayering(nodes, edges, previewLines, startNode)
      
      // 3. 计算优化的节点位置
      const nodePositions = this.calculateOptimizedNodePositions(levels, startNode)
      
      // 4. 计算连线优化位置
      const edgePositions = this.calculateOptimizedEdgePositions(edges, nodePositions)
      
      // 5. 计算预览线优化位置（使用坐标管理器）
      const previewLinePositions = this.calculateOptimizedPreviewLinePositions(
        previewLines, nodePositions
      )
      
      // 6. 计算拖拽点优化位置（使用坐标管理器）
      const dragPointPositions = this.calculateOptimizedDragPointPositions(
        previewLines, nodePositions
      )

      const result = {
        nodePositions,
        edgePositions,
        previewLinePositions,
        dragPointPositions,
        levels: levels.length,
        startNodePosition: nodePositions[startNode.id],
        layoutMetrics: {
          layoutTime: performance.now() - startTime,
          nodesProcessed: nodes.length,
          previewLinesProcessed: previewLines.length
        }
      }

      this.updatePerformanceMetrics(performance.now() - startTime)
      console.log('[IntelligentStructuredLayoutEngine] 智能布局计算完成:', result)
      
      return result

    } catch (error) {
      console.error('[IntelligentStructuredLayoutEngine] 智能布局计算失败:', error)
      throw error
    }
  }

  /**
   * 找到开始节点
   */
  findStartNode(nodes) {
    return nodes.find(node => {
      const nodeData = node.getData() || {}
      return nodeData.type === 'start'
    })
  }

  /**
   * 执行拓扑分层
   */
  performTopologicalLayering(nodes, edges, previewLines, startNode) {
    console.log('[IntelligentStructuredLayoutEngine] 开始拓扑分层')
    
    const nodeMap = new Map()
    const adjacencyList = new Map()
    const inDegree = new Map()
    
    // 初始化
    nodes.forEach(node => {
      nodeMap.set(node.id, node)
      adjacencyList.set(node.id, [])
      inDegree.set(node.id, 0)
    })
    
    // 处理现有连接
    edges.forEach(edge => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
        adjacencyList.get(sourceId).push(targetId)
        inDegree.set(targetId, inDegree.get(targetId) + 1)
      }
    })
    
    // 处理预览线连接
    previewLines.forEach(previewLine => {
      if (previewLine.sourceNode && previewLine.targetNode) {
        const sourceId = previewLine.sourceNode.id
        const targetId = previewLine.targetNode.id
        
        if (adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
          if (!adjacencyList.get(sourceId).includes(targetId)) {
            adjacencyList.get(sourceId).push(targetId)
            inDegree.set(targetId, inDegree.get(targetId) + 1)
          }
        }
      }
    })
    
    // 从开始节点开始分层
    const levels = []
    const queue = [startNode.id]
    const processed = new Set()
    
    while (queue.length > 0) {
      const currentLevel = []
      const nextQueue = []
      
      while (queue.length > 0) {
        const nodeId = queue.shift()
        if (processed.has(nodeId)) continue
        
        const node = nodeMap.get(nodeId)
        if (node) {
          currentLevel.push(node)
          processed.add(nodeId)
        }
        
        // 添加下一层节点
        const neighbors = adjacencyList.get(nodeId) || []
        neighbors.forEach(neighborId => {
          if (!processed.has(neighborId)) {
            nextQueue.push(neighborId)
          }
        })
      }
      
      if (currentLevel.length > 0) {
        // 按分支复杂度排序
        currentLevel.sort((a, b) => {
          const aBranches = this.calculateNodeBranches(a, previewLines)
          const bBranches = this.calculateNodeBranches(b, previewLines)
          return bBranches - aBranches
        })
        
        levels.push(currentLevel)
      }
      
      queue.push(...nextQueue)
    }
    
    console.log('[IntelligentStructuredLayoutEngine] 拓扑分层完成，共', levels.length, '层')
    return levels
  }

  /**
   * 计算节点分支数
   */
  calculateNodeBranches(node, previewLines) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type
    
    let branches = 1
    switch (nodeType) {
      case 'audience-split':
        branches = nodeData.config?.crowdLayers?.length || 2
        break
      case 'event-split':
        branches = 2
        break
      case 'ab-test':
        branches = nodeData.config?.branches?.length || 2
        break
      case 'end':
        branches = 0
        break
    }
    
    // 加上预览线分支
    const previewBranches = previewLines.filter(line => 
      line.sourceNode && line.sourceNode.id === node.id
    ).length
    
    return Math.max(branches, previewBranches)
  }

  /**
   * 计算优化的节点位置
   */
  calculateOptimizedNodePositions(levels, startNode) {
    console.log('[IntelligentStructuredLayoutEngine] 计算优化节点位置')
    
    const positions = {}
    const startPosition = startNode.getPosition()
    
    // 计算布局的总宽度，用于居中对齐
    const maxLevelWidth = Math.max(...levels.map(level => 
      (level.length - 1) * this.layoutConfig.nodeSpacing
    ))
    
    levels.forEach((level, levelIndex) => {
      const levelY = startPosition.y + (levelIndex * this.layoutConfig.levelHeight)
      const levelWidth = (level.length - 1) * this.layoutConfig.nodeSpacing
      const startX = startPosition.x - (levelWidth / 2)
      
      level.forEach((node, nodeIndex) => {
        positions[node.id] = {
          x: startX + (nodeIndex * this.layoutConfig.nodeSpacing),
          y: levelY
        }
      })
      
      console.log(`第${levelIndex}层位置:`, {
        y: levelY,
        nodeCount: level.length,
        positions: level.map((node, i) => ({
          id: node.id,
          x: startX + (i * this.layoutConfig.nodeSpacing),
          y: levelY
        }))
      })
    })
    
    return positions
  }

  /**
   * 计算优化的连线位置
   */
  calculateOptimizedEdgePositions(edges, nodePositions) {
    console.log('[IntelligentStructuredLayoutEngine] 计算优化连线位置')
    
    const edgePositions = {}
    
    edges.forEach(edge => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (nodePositions[sourceId] && nodePositions[targetId]) {
        edgePositions[edge.id] = {
          source: nodePositions[sourceId],
          target: nodePositions[targetId]
        }
      }
    })
    
    return edgePositions
  }

  /**
   * 计算优化的预览线位置（使用坐标管理器）
   */
  calculateOptimizedPreviewLinePositions(previewLines, nodePositions) {
    console.log('[IntelligentStructuredLayoutEngine] 计算优化预览线位置')
    
    const previewLinePositions = {}
    
    previewLines.forEach(previewLine => {
      if (previewLine.sourceNode && previewLine.targetNode) {
        const sourcePos = nodePositions[previewLine.sourceNode.id]
        const targetPos = nodePositions[previewLine.targetNode.id]
        
        if (sourcePos && targetPos) {
          // 计算预览线路径
          const pathPoints = this.calculatePreviewLinePath(sourcePos, targetPos)
          
          // 使用坐标管理器修正路径
          const correctedPath = this.coordinateManager.correctPreviewLinePath(pathPoints)
          
          previewLinePositions[previewLine.id] = {
            originalPath: pathPoints,
            correctedPath: correctedPath.fullPath,
            startPoint: correctedPath.startPoint,
            endPoint: correctedPath.endPoint,
            middlePoints: correctedPath.middlePoints
          }
        }
      }
    })
    
    return previewLinePositions
  }

  /**
   * 计算优化的拖拽点位置（使用坐标管理器）
   */
  calculateOptimizedDragPointPositions(previewLines, nodePositions) {
    console.log('[IntelligentStructuredLayoutEngine] 计算优化拖拽点位置')
    
    const dragPointPositions = {}
    
    previewLines.forEach(previewLine => {
      if (previewLine.sourceNode && nodePositions[previewLine.sourceNode.id]) {
        const sourcePos = nodePositions[previewLine.sourceNode.id]
        
        // 计算拖拽点的布局位置
        const layoutPosition = this.calculateDragPointLayoutPosition(
          sourcePos, previewLine
        )
        
        // 使用坐标管理器修正位置
        const nodeSize = { width: 120, height: 60 } // 默认节点尺寸
        const correctedPosition = this.coordinateManager.correctDragHintPosition(
          previewLine.sourceNode.id, layoutPosition, nodeSize, previewLine.branchIndex || 0
        )
        
        dragPointPositions[previewLine.id] = {
          layoutPosition,
          correctedPosition,
          sourcePosition: sourcePos
        }
      }
    })
    
    return dragPointPositions
  }

  /**
   * 计算预览线路径
   */
  calculatePreviewLinePath(sourcePos, targetPos) {
    const midX = (sourcePos.x + targetPos.x) / 2
    const midY = (sourcePos.y + targetPos.y) / 2
    
    return [
      { x: sourcePos.x, y: sourcePos.y },
      { x: midX, y: sourcePos.y },
      { x: midX, y: targetPos.y },
      { x: targetPos.x, y: targetPos.y }
    ]
  }

  /**
   * 计算拖拽点布局位置
   */
  calculateDragPointLayoutPosition(sourcePos, previewLine) {
    // 基于源节点位置和预览线方向计算
    const offset = 60 // 拖拽点距离节点的偏移
    
    return {
      x: sourcePos.x + offset,
      y: sourcePos.y + offset
    }
  }

  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(layoutTime) {
    this.performanceMetrics.layoutCount++
    this.performanceMetrics.averageLayoutTime = 
      (this.performanceMetrics.averageLayoutTime + layoutTime) / 2
  }

  /**
   * 获取布局统计信息
   */
  getLayoutStats() {
    return {
      ...this.performanceMetrics,
      coordinateManagerStatus: this.coordinateManager.getStatus()
    }
  }
}

// 导出智能布局引擎
export const intelligentLayoutEngine = new IntelligentStructuredLayoutEngine()