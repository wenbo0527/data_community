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
      nodeSpacing: 200,           // 同层节点间距
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
    
    levels.forEach((level, levelIndex) => {
      const levelY = startPosition.y + (levelIndex * this.layoutConfig.levelHeight)
      
      // 🔧 修复分流节点分支居中问题：
      // 对于分流节点的下一层，需要特殊处理居中逻辑
      if (levelIndex > 0) {
        const parentLevel = levels[levelIndex - 1]
        const hasSplitNodeParent = parentLevel.some(node => {
          const nodeData = node.getData() || {}
          const nodeType = nodeData.type || nodeData.nodeType
          return ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
        })
        
        if (hasSplitNodeParent && parentLevel.length === 1) {
          // 分流节点的子节点需要相对于分流节点居中
          const splitNode = parentLevel[0]
          const splitPosition = startPosition.x // 使用开始节点的X坐标作为基准
          
          // 计算当前层的总宽度
          const levelWidth = (level.length - 1) * this.layoutConfig.nodeSpacing
          const startX = splitPosition - (levelWidth / 2)
          
          level.forEach((node, nodeIndex) => {
            positions[node.id] = {
              x: startX + (nodeIndex * this.layoutConfig.nodeSpacing),
              y: levelY
            }
          })
          
          console.log(`第${levelIndex}层位置 (分流节点子层居中):`, {
            y: levelY,
            nodeCount: level.length,
            splitNodeX: splitPosition,
            levelWidth: levelWidth,
            startX: startX,
            positions: level.map((node, i) => ({
              id: node.id,
              x: startX + (i * this.layoutConfig.nodeSpacing),
              y: levelY,
              offsetFromSplit: (startX + (i * this.layoutConfig.nodeSpacing)) - splitPosition
            }))
          })
          
          return // 跳过默认的居中逻辑
        }
      }
      
      // 默认的居中逻辑：每层都相对开始节点居中对齐
      const levelWidth = (level.length - 1) * this.layoutConfig.nodeSpacing
      const levelCenterX = startPosition.x
      const startX = levelCenterX - (levelWidth / 2)
      
      level.forEach((node, nodeIndex) => {
        positions[node.id] = {
          x: startX + (nodeIndex * this.layoutConfig.nodeSpacing),
          y: levelY
        }
      })
      
      console.log(`第${levelIndex}层位置 (相对开始节点居中):`, {
        y: levelY,
        nodeCount: level.length,
        levelCenterX: levelCenterX,
        startNodeX: startPosition.x,
        levelWidth: levelWidth,
        startX: startX,
        positions: level.map((node, i) => ({
          id: node.id,
          x: startX + (i * this.layoutConfig.nodeSpacing),
          y: levelY,
          offsetFromCenter: (startX + (i * this.layoutConfig.nodeSpacing)) - levelCenterX
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
   * 应用布局结果到图形
   * @param {Object} layoutResult - 布局结果
   */
  applyLayoutResult(layoutResult) {
    console.log('[IntelligentStructuredLayoutEngine] 应用布局结果')
    
    // 1. 应用节点位置
    if (layoutResult.nodePositions) {
      Object.entries(layoutResult.nodePositions).forEach(([nodeId, position]) => {
        const node = this.graph.getCellById(nodeId)
        if (node && node.setPosition) {
          node.setPosition(position.x, position.y)
          console.log(`[IntelligentStructuredLayoutEngine] 节点 ${nodeId} 移动到 (${position.x}, ${position.y})`)
        }
      })
    }
    
    // 2. 🔧 修复连线位置更新：强制重新计算所有连线路径
    const allEdges = this.graph.getEdges()
    console.log(`[IntelligentStructuredLayoutEngine] 开始更新 ${allEdges.length} 条连线路径`)
    
    allEdges.forEach(edge => {
      try {
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()
        const sourceNode = this.graph.getCellById(sourceId)
        const targetNode = this.graph.getCellById(targetId)
        
        if (sourceNode && targetNode) {
          // 🔧 使用X6规范的方式强制重新计算连线路径
          // 1. 清除现有的顶点（控制点）
          edge.setVertices([])
          
          // 2. 重新设置源和目标，触发路径重新计算
          const sourcePort = edge.getSourcePortId() || 'out'
          const targetPort = edge.getTargetPortId() || 'in'
          
          edge.setSource({
            cell: sourceId,
            port: sourcePort
          })
          
          edge.setTarget({
            cell: targetId,
            port: targetPort
          })
          
          console.log(`[IntelligentStructuredLayoutEngine] 连线 ${edge.id} 路径已重新计算: ${sourceId}:${sourcePort} -> ${targetId}:${targetPort}`)
        }
      } catch (error) {
        console.warn(`[IntelligentStructuredLayoutEngine] 连线 ${edge.id} 路径更新失败:`, error)
      }
    })
    
    // 3. 应用预览线位置（如果有）
    if (layoutResult.previewLinePositions) {
      console.log('[IntelligentStructuredLayoutEngine] 应用预览线位置')
      // 预览线位置由预览线管理器处理
    }
    
    // 4. 应用拖拽点位置（如果有）
    if (layoutResult.dragPointPositions) {
      console.log('[IntelligentStructuredLayoutEngine] 应用拖拽点位置')
      // 拖拽点位置由预览线管理器处理
    }
    
    console.log('[IntelligentStructuredLayoutEngine] 布局结果应用完成')
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