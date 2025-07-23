/**
 * 增强型结构化布局引擎
 * 实现智能的自上而下结构化布局，支持预览线空间预留和拖拽点绑定
 */

import { CONNECTION_RULES, LAYOUT_LEVELS } from './StructuredLayoutEngine.js'

export class EnhancedStructuredLayoutEngine {
  constructor(graph, options = {}) {
    this.graph = graph
    this.layoutConfig = {
      levelHeight: 150,           // 层级间距
      nodeSpacing: 120,           // 同层节点间距
      branchSpacing: 180,         // 分支间距
      previewLineSpacing: 80,     // 预览线预留空间
      centerAlignment: true,      // 中心对齐
      gridSize: 20,              // 网格大小
      enableIncrementalLayout: true, // 增量布局
      enableBatching: true,       // 批量处理
      layoutThrottle: 100,        // 布局节流
      ...options
    }
    
    // 缓存系统
    this.layoutCache = new Map()
    this.positionCache = new Map()
    this.branchCache = new Map()
    
    // 性能监控
    this.performanceMetrics = {
      layoutCount: 0,
      averageLayoutTime: 0,
      cacheHitRate: 0
    }
    
    // 批量处理队列
    this.layoutQueue = []
    this.layoutTimer = null
  }

  /**
   * 计算增强型结构化布局
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Array} previewLines - 预览线数组
   * @param {Object} options - 布局选项
   * @returns {Object} 布局结果
   */
  async calculateEnhancedLayout(nodes, edges = [], previewLines = [], options = {}) {
    const startTime = performance.now()
    
    console.log('[EnhancedStructuredLayoutEngine] 开始计算增强型布局', {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      previewLineCount: previewLines.length,
      options
    })

    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey(nodes, edges, previewLines)
      if (this.layoutCache.has(cacheKey) && !options.forceRecalculate) {
        console.log('[EnhancedStructuredLayoutEngine] 使用缓存布局')
        this.performanceMetrics.cacheHitRate++
        return this.layoutCache.get(cacheKey)
      }

      // 1. 拓扑排序分层，考虑预览线
      const levels = this.groupNodesByTopologyWithPreviewLines(nodes, edges, previewLines)
      
      // 2. 计算每层的预览线空间需求
      const previewLineSpaceMap = this.calculatePreviewLineSpaces(levels, previewLines)
      
      // 3. 计算节点位置，预留预览线空间
      const positions = this.calculatePositionsWithPreviewLineSpace(levels, previewLineSpaceMap)
      
      // 4. 应用居中对齐
      const alignedPositions = this.applyCenterAlignment(positions)
      
      // 5. 基于对齐后的位置计算拖拽点位置
      const dragPointPositions = this.calculateDragPointPositions(alignedPositions, previewLines)
      
      const result = {
        positions: alignedPositions,
        dragPointPositions,
        levels: levels.length,
        previewLinesProcessed: previewLines.length,
        previewLineSpaces: previewLineSpaceMap,
        performanceMetrics: {
          layoutTime: performance.now() - startTime,
          cacheUsed: false
        }
      }

      // 缓存结果
      this.layoutCache.set(cacheKey, result)
      this.updatePerformanceMetrics(performance.now() - startTime)
      
      console.log('[EnhancedStructuredLayoutEngine] 增强型布局计算完成:', result)
      return result

    } catch (error) {
      console.error('[EnhancedStructuredLayoutEngine] 布局计算失败:', error)
      throw error
    }
  }

  /**
   * 拓扑排序分层，考虑预览线连接
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Array} previewLines - 预览线数组
   * @returns {Array} 层级分组的节点数组
   */
  groupNodesByTopologyWithPreviewLines(nodes, edges, previewLines) {
    console.log('[EnhancedStructuredLayoutEngine] 开始增强拓扑排序')
    
    const nodeMap = new Map()
    const adjacencyList = new Map()
    const inDegree = new Map()
    const nodeBranchInfo = new Map()
    
    // 初始化节点信息
    nodes.forEach(node => {
      nodeMap.set(node.id, node)
      adjacencyList.set(node.id, [])
      inDegree.set(node.id, 0)
      
      // 计算节点分支信息
      const branchInfo = this.calculateNodeBranchInfo(node, previewLines)
      nodeBranchInfo.set(node.id, branchInfo)
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
    
    // 处理预览线连接（虚拟连接）
    previewLines.forEach(previewLine => {
      if (previewLine.sourceNode && previewLine.targetNode) {
        const sourceId = previewLine.sourceNode.id
        const targetId = previewLine.targetNode.id
        
        if (adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
          // 检查是否已存在连接
          if (!adjacencyList.get(sourceId).includes(targetId)) {
            adjacencyList.get(sourceId).push(targetId)
            inDegree.set(targetId, inDegree.get(targetId) + 1)
          }
        }
      }
    })
    
    // 执行拓扑排序
    const levels = []
    const queue = []
    
    // 找到入度为0的节点
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId)
      }
    })
    
    // 如果没有入度为0的节点，找start节点
    if (queue.length === 0) {
      nodes.forEach(node => {
        if (node.getData()?.type === 'start') {
          queue.push(node.id)
        }
      })
    }
    
    // 按层级处理
    while (queue.length > 0) {
      const currentLevel = []
      const nextQueue = []
      
      while (queue.length > 0) {
        const nodeId = queue.shift()
        const node = nodeMap.get(nodeId)
        if (node) {
          currentLevel.push(node)
        }
        
        // 处理邻接节点
        const neighbors = adjacencyList.get(nodeId) || []
        neighbors.forEach(neighborId => {
          const newDegree = inDegree.get(neighborId) - 1
          inDegree.set(neighborId, newDegree)
          
          if (newDegree === 0) {
            nextQueue.push(neighborId)
          }
        })
      }
      
      if (currentLevel.length > 0) {
        // 按分支数排序，确保分流节点优先布局
        currentLevel.sort((a, b) => {
          const aBranches = nodeBranchInfo.get(a.id).totalBranches
          const bBranches = nodeBranchInfo.get(b.id).totalBranches
          return bBranches - aBranches
        })
        
        levels.push(currentLevel)
      }
      
      queue.push(...nextQueue)
    }
    
    // 处理孤立节点
    const processedNodes = new Set()
    levels.forEach(level => {
      level.forEach(node => processedNodes.add(node.id))
    })
    
    const isolatedNodes = nodes.filter(node => !processedNodes.has(node.id))
    if (isolatedNodes.length > 0) {
      levels.push(isolatedNodes)
    }
    
    console.log('[EnhancedStructuredLayoutEngine] 增强拓扑排序完成，共', levels.length, '层')
    return levels
  }

  /**
   * 计算节点分支信息
   * @param {Object} node - 节点
   * @param {Array} previewLines - 预览线数组
   * @returns {Object} 分支信息
   */
  calculateNodeBranchInfo(node, previewLines) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type
    
    // 计算实际分支数
    let actualBranches = 0
    if (nodeData.branches && Array.isArray(nodeData.branches)) {
      actualBranches = nodeData.branches.length
    } else {
      // 根据节点类型计算默认分支数
      switch (nodeType) {
        case 'audience-split':
          actualBranches = nodeData.config?.crowdLayers?.length || 2
          break
        case 'event-split':
          actualBranches = 2
          break
        case 'ab-test':
          actualBranches = nodeData.config?.branches?.length || 2
          break
        case 'end':
          actualBranches = 0
          break
        default:
          actualBranches = 1
      }
    }
    
    // 计算预览线分支数
    const previewBranches = previewLines.filter(line => 
      line.sourceNode && line.sourceNode.id === node.id
    ).length
    
    return {
      actualBranches,
      previewBranches,
      totalBranches: Math.max(actualBranches, previewBranches),
      hasPreviewLines: previewBranches > 0
    }
  }

  /**
   * 计算预览线空间需求
   * @param {Array} levels - 层级数组
   * @param {Array} previewLines - 预览线数组
   * @returns {Map} 预览线空间映射
   */
  calculatePreviewLineSpaces(levels, previewLines) {
    const spaceMap = new Map()
    
    levels.forEach((level, levelIndex) => {
      level.forEach(node => {
        const nodePreviewLines = previewLines.filter(line => 
          line.sourceNode && line.sourceNode.id === node.id
        )
        
        if (nodePreviewLines.length > 0) {
          // 为每个预览线预留空间
          const spaceNeeded = nodePreviewLines.length * this.layoutConfig.previewLineSpacing
          spaceMap.set(node.id, {
            spaceNeeded,
            previewLineCount: nodePreviewLines.length,
            levelIndex
          })
        }
      })
    })
    
    return spaceMap
  }

  /**
   * 计算节点位置，预留预览线空间
   * @param {Array} levels - 层级数组
   * @param {Map} previewLineSpaceMap - 预览线空间映射
   * @returns {Object} 节点位置映射
   */
  calculatePositionsWithPreviewLineSpace(levels, previewLineSpaceMap) {
    const positions = {}
    let currentY = 0
    
    console.log('[EnhancedStructuredLayoutEngine] 开始计算节点位置，确保行对齐')
    
    levels.forEach((level, levelIndex) => {
      // 计算当前层级的最大预览线空间需求
      const maxPreviewSpace = Math.max(
        ...level.map(node => {
          const spaceInfo = previewLineSpaceMap.get(node.id)
          return spaceInfo ? spaceInfo.spaceNeeded : 0
        }),
        0
      )
      
      // 计算层级Y坐标，考虑预览线空间
      const levelY = currentY
      const levelPositions = this.calculateLevelPositions(level, levelY)
      
      console.log(`[EnhancedStructuredLayoutEngine] 第${levelIndex}层位置计算:`, {
        levelY,
        nodeCount: level.length,
        maxPreviewSpace,
        positions: levelPositions
      })
      
      // 应用位置 - 确保同一层的所有节点Y坐标完全一致
      level.forEach((node, nodeIndex) => {
        positions[node.id] = {
          x: levelPositions[nodeIndex].x,
          y: levelY  // 直接使用levelY，确保同一行Y坐标一致
        }
      })
      
      // 更新下一层级的Y坐标
      currentY += this.layoutConfig.levelHeight + maxPreviewSpace
    })
    
    console.log('[EnhancedStructuredLayoutEngine] 节点位置计算完成，按层级分组:', 
      levels.map((level, index) => ({
        level: index,
        y: index === 0 ? 0 : levels.slice(0, index).reduce((sum, _, i) => {
          const prevMaxSpace = Math.max(...levels[i].map(node => {
            const spaceInfo = previewLineSpaceMap.get(node.id)
            return spaceInfo ? spaceInfo.spaceNeeded : 0
          }), 0)
          return sum + this.layoutConfig.levelHeight + prevMaxSpace
        }, 0),
        nodes: level.map(node => ({ id: node.id, position: positions[node.id] }))
      }))
    )
    
    return positions
  }

  /**
   * 计算拖拽点位置 - 基于预览线的实际路径，确保与节点端口精确对齐
   * @param {Object} positions - 节点位置
   * @param {Array} previewLines - 预览线数组
   * @returns {Object} 拖拽点位置映射
   */
  calculateDragPointPositions(positions, previewLines) {
    console.log('[EnhancedStructuredLayoutEngine] 开始计算拖拽点位置（确保端口对齐）')
    
    const dragPointPositions = {}
    
    // 按源节点分组预览线，用于计算垂直偏移
    const previewLinesBySource = new Map()
    previewLines.forEach(previewLine => {
      if (previewLine.sourceNode) {
        const sourceId = previewLine.sourceNode.id
        if (!previewLinesBySource.has(sourceId)) {
          previewLinesBySource.set(sourceId, [])
        }
        previewLinesBySource.get(sourceId).push(previewLine)
      }
    })
    
    previewLines.forEach(previewLine => {
      if (previewLine.sourceNode && positions[previewLine.sourceNode.id]) {
        const sourcePos = positions[previewLine.sourceNode.id]
        const sourceNode = previewLine.sourceNode
        const branchIndex = previewLine.branchIndex || 0
        
        // 获取源节点的精确大小信息
        let nodeSize = { width: 100, height: 100 }
        try {
          if (sourceNode.getSize) {
            nodeSize = sourceNode.getSize()
          } else if (sourceNode.size) {
            nodeSize = sourceNode.size
          }
        } catch (error) {
          console.warn(`[EnhancedStructuredLayoutEngine] 获取节点 ${sourceNode.id} 大小失败，使用默认值:`, error)
        }
        
        // 计算拖拽点位置 - 基于预览线的实际路径
        const dragPointId = `${previewLine.sourceNode.id}_branch_${branchIndex}`
        
        // 获取同一源节点的所有预览线
        const sourceBranches = previewLinesBySource.get(previewLine.sourceNode.id) || []
        const totalBranches = sourceBranches.length
        
        // 精确计算预览线的起点（源节点的输出端口）
        // 输出端口位于节点右侧中心，考虑端口的实际偏移
        const sourceOutputX = sourcePos.x + nodeSize.width
        const sourceOutputY = sourcePos.y + nodeSize.height / 2
        
        // 尝试获取实际的端口位置（如果节点有端口信息）
        let actualOutputPort = { x: sourceOutputX, y: sourceOutputY }
        try {
          const ports = sourceNode.getPorts ? sourceNode.getPorts() : []
          const outPort = ports.find(port => port.id === 'out' || port.group === 'out')
          if (outPort && sourceNode.getPortProp) {
            const portPosition = sourceNode.getPortProp(outPort.id, 'position')
            if (portPosition && portPosition.name === 'right') {
              const args = portPosition.args || {}
              const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
                parseFloat(args.y) / 100 : 0.5
              actualOutputPort.x = sourcePos.x + nodeSize.width + (args.dx || 0)
              actualOutputPort.y = sourcePos.y + nodeSize.height * yPercent + (args.dy || 0)
            }
          }
        } catch (error) {
          console.warn(`[EnhancedStructuredLayoutEngine] 获取节点 ${sourceNode.id} 端口位置失败，使用计算值:`, error)
        }
        
        console.log(`[EnhancedStructuredLayoutEngine] 源节点 ${previewLine.sourceNode.id} 输出端口:`, {
          nodePosition: sourcePos,
          nodeSize,
          calculatedOutputPort: { x: sourceOutputX, y: sourceOutputY },
          actualOutputPort: actualOutputPort
        })
        
        // 使用实际的端口位置
        const finalOutputX = actualOutputPort.x
        const finalOutputY = actualOutputPort.y
        
        // 计算预览线的路径和终点
        let previewLineEndX, previewLineEndY
        
        if (previewLine.targetNode && positions[previewLine.targetNode.id]) {
          // 如果有目标节点，拖拽点应该在目标节点的输入端口
          const targetPos = positions[previewLine.targetNode.id]
          const targetNode = previewLine.targetNode
          
          let targetSize = { width: 100, height: 100 }
          try {
            if (targetNode.getSize) {
              targetSize = targetNode.getSize()
            } else if (targetNode.size) {
              targetSize = targetNode.size
            }
          } catch (error) {
            console.warn(`[EnhancedStructuredLayoutEngine] 获取目标节点 ${targetNode.id} 大小失败，使用默认值:`, error)
          }
          
          // 目标节点的输入端口位于节点左侧中心
          let calculatedInputX = targetPos.x
          let calculatedInputY = targetPos.y + targetSize.height / 2
          
          // 尝试获取实际的输入端口位置
          let actualInputPort = { x: calculatedInputX, y: calculatedInputY }
          try {
            const ports = targetNode.getPorts ? targetNode.getPorts() : []
            const inPort = ports.find(port => port.id === 'in' || port.group === 'in')
            if (inPort && targetNode.getPortProp) {
              const portPosition = targetNode.getPortProp(inPort.id, 'position')
              if (portPosition && portPosition.name === 'left') {
                const args = portPosition.args || {}
                const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
                  parseFloat(args.y) / 100 : 0.5
                actualInputPort.x = targetPos.x + (args.dx || 0)
                actualInputPort.y = targetPos.y + targetSize.height * yPercent + (args.dy || 0)
              }
            }
          } catch (error) {
            console.warn(`[EnhancedStructuredLayoutEngine] 获取目标节点 ${targetNode.id} 端口位置失败，使用计算值:`, error)
          }
          
          previewLineEndX = actualInputPort.x
          previewLineEndY = actualInputPort.y
          
          console.log(`[EnhancedStructuredLayoutEngine] 目标节点 ${previewLine.targetNode.id} 输入端口:`, {
            nodePosition: targetPos,
            nodeSize: targetSize,
            calculatedInputPort: { x: calculatedInputX, y: calculatedInputY },
            actualInputPort: actualInputPort
          })
        } else {
          // 如果没有目标节点，计算预览线的默认终点
          // 根据分支索引计算垂直偏移，确保多分支不重叠
          let verticalOffset = 0
          let currentIndex = 0
          if (totalBranches > 1) {
            const sortedBranches = sourceBranches.sort((a, b) => (a.branchIndex || 0) - (b.branchIndex || 0))
            currentIndex = sortedBranches.findIndex(branch => branch.id === previewLine.id)
            
            const branchSpacing = 40 // 分支间距
            const totalHeight = (totalBranches - 1) * branchSpacing
            const startY = -totalHeight / 2
            verticalOffset = startY + currentIndex * branchSpacing
          }
          
          // 对于开始节点或单分支节点，拖拽点应该在节点正下方
          // 保持X坐标与节点中心对齐，Y坐标在节点下方
          const nodeType = previewLine.sourceNode.data.type
          
          if (nodeType === 'start' || totalBranches === 1) {
            // 开始节点或单分支：拖拽点在节点正下方
            previewLineEndX = sourcePos.x + nodeSize.width / 2  // 节点中心X坐标
            previewLineEndY = sourcePos.y + nodeSize.height + 100 + verticalOffset  // 节点下方100像素
          } else {
            // 多分支节点：拖拽点在节点右侧
            const previewLineLength = 200 // 预览线长度
            previewLineEndX = finalOutputX + previewLineLength
            previewLineEndY = finalOutputY + verticalOffset
          }
          
          if (totalBranches > 1) {
            console.log(`[EnhancedStructuredLayoutEngine] 无目标节点，计算默认终点:`, {
              nodeType,
              branchIndex,
              currentIndex,
              totalBranches,
              verticalOffset,
              endPoint: { x: previewLineEndX, y: previewLineEndY }
            });
          } else {
            console.log(`[EnhancedStructuredLayoutEngine] 无目标节点，计算默认终点:`, {
              nodeType,
              totalBranches,
              verticalOffset,
              endPoint: { x: previewLineEndX, y: previewLineEndY }
            });
          }
        }
        
        // 拖拽点位置就是预览线的终点
        dragPointPositions[dragPointId] = {
          x: previewLineEndX,
          y: previewLineEndY,
          sourceNodeId: previewLine.sourceNode.id,
          branchIndex,
          previewLineId: previewLine.id,
          // 添加详细的预览线路径信息，确保端口对齐
          previewLinePath: {
            startX: (previewLine.sourceNode.data.type === 'start' || totalBranches === 1) ? 
              sourcePos.x + nodeSize.width / 2 : finalOutputX,  // 开始节点从底部中心出发
            startY: (previewLine.sourceNode.data.type === 'start' || totalBranches === 1) ? 
              sourcePos.y + nodeSize.height : finalOutputY,     // 开始节点从底部出发
            endX: previewLineEndX,
            endY: previewLineEndY,
            // 添加中间控制点，用于绘制平滑的连接线
            controlPoints: (previewLine.sourceNode.data.type === 'start' || totalBranches === 1) ? [
              { x: sourcePos.x + nodeSize.width / 2, y: sourcePos.y + nodeSize.height + 30 },  // 开始节点的第一个控制点
              { x: previewLineEndX, y: previewLineEndY - 30 }  // 第二个控制点
            ] : [
              { x: finalOutputX + 50, y: finalOutputY },  // 多分支节点的第一个控制点
              { x: previewLineEndX - 50, y: previewLineEndY }  // 第二个控制点
            ]
          }
        }
        
        console.log(`[EnhancedStructuredLayoutEngine] 拖拽点位置计算完成: ${dragPointId}`, {
          sourceNodeId: previewLine.sourceNode.id,
          sourcePosition: sourcePos,
          sourceOutputPort: { x: finalOutputX, y: finalOutputY },
          dragPointPosition: { x: previewLineEndX, y: previewLineEndY },
          branchIndex,
          totalBranches,
          hasTarget: !!previewLine.targetNode,
          previewLinePath: dragPointPositions[dragPointId].previewLinePath
        })
      }
    })
    
    console.log('[EnhancedStructuredLayoutEngine] 拖拽点位置计算完成，共计算', Object.keys(dragPointPositions).length, '个拖拽点')
    return dragPointPositions
  }

  /**
   * 应用居中对齐 - 保持行对齐
   * @param {Object} positions - 原始位置
   * @returns {Object} 对齐后的位置
   */
  applyCenterAlignment(positions) {
    if (!this.layoutConfig.centerAlignment || Object.keys(positions).length === 0) {
      return positions
    }

    console.log('[EnhancedStructuredLayoutEngine] 开始居中对齐，保持行对齐')

    // 计算边界
    const xValues = Object.values(positions).map(pos => pos.x)
    const yValues = Object.values(positions).map(pos => pos.y)
    
    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    const minY = Math.min(...yValues)
    
    // 计算偏移量：将最小值移动到正数区域，并添加边距
    const margin = 50 // 添加边距，避免节点贴边
    const centerOffsetX = -minX + margin
    const centerOffsetY = -minY + margin
    
    console.log('[EnhancedStructuredLayoutEngine] 居中对齐计算:', {
      原始边界: { minX, maxX, minY },
      偏移量: { centerOffsetX, centerOffsetY },
      边距: margin
    })
    
    // 按Y坐标分组，确保同一行的节点保持相同的Y坐标
    const nodesByY = new Map()
    Object.entries(positions).forEach(([nodeId, position]) => {
      const originalY = position.y
      if (!nodesByY.has(originalY)) {
        nodesByY.set(originalY, [])
      }
      nodesByY.get(originalY).push({ nodeId, position })
    })
    
    console.log('[EnhancedStructuredLayoutEngine] 按Y坐标分组的节点:', 
      Array.from(nodesByY.entries()).map(([y, nodes]) => ({
        originalY: y,
        alignedY: y + centerOffsetY,
        nodeCount: nodes.length,
        nodeIds: nodes.map(n => n.nodeId)
      }))
    )
    
    // 应用偏移，确保同一行节点的Y坐标完全一致
    const alignedPositions = {}
    nodesByY.forEach((nodes, originalY) => {
      // 计算对齐后的Y坐标（同一行所有节点使用相同的Y坐标）
      const alignedY = Math.max(0, originalY + centerOffsetY)
      const snappedY = Math.round(alignedY / this.layoutConfig.gridSize) * this.layoutConfig.gridSize
      
      nodes.forEach(({ nodeId, position }) => {
        const newX = Math.max(0, position.x + centerOffsetX)
        const snappedX = Math.round(newX / this.layoutConfig.gridSize) * this.layoutConfig.gridSize
        
        alignedPositions[nodeId] = {
          x: snappedX,
          y: snappedY  // 同一行所有节点使用相同的Y坐标
        }
      })
    })
    
    // 验证对齐结果
    const alignmentCheck = new Map()
    Object.entries(alignedPositions).forEach(([nodeId, position]) => {
      if (!alignmentCheck.has(position.y)) {
        alignmentCheck.set(position.y, [])
      }
      alignmentCheck.get(position.y).push(nodeId)
    })
    
    console.log('[EnhancedStructuredLayoutEngine] 居中对齐完成，行对齐验证:', 
      Array.from(alignmentCheck.entries()).map(([y, nodeIds]) => ({
        y,
        nodeCount: nodeIds.length,
        nodeIds
      }))
    )
    
    return alignedPositions
  }

  /**
   * 计算层级内节点位置
   * @param {Array} levelNodes - 层级内的节点
   * @param {number} y - Y坐标
   * @returns {Array} 位置数组
   */
  calculateLevelPositions(levelNodes, y) {
    const positions = []
    const nodeCount = levelNodes.length
    
    if (nodeCount === 1) {
      positions.push({ x: 0, y })
    } else {
      const totalWidth = (nodeCount - 1) * this.layoutConfig.nodeSpacing
      const startX = -totalWidth / 2
      
      levelNodes.forEach((node, index) => {
        positions.push({
          x: startX + index * this.layoutConfig.nodeSpacing,
          y: y
        })
      })
    }
    
    return positions
  }

  /**
   * 对齐到网格
   * @param {Object} position - 原始位置
   * @returns {Object} 对齐后的位置
   */
  snapToGrid(position) {
    return {
      x: Math.round(position.x / this.layoutConfig.gridSize) * this.layoutConfig.gridSize,
      y: Math.round(position.y / this.layoutConfig.gridSize) * this.layoutConfig.gridSize
    }
  }

  /**
   * 生成缓存键
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Array} previewLines - 预览线数组
   * @returns {string} 缓存键
   */
  generateCacheKey(nodes, edges, previewLines) {
    const nodeIds = nodes.map(n => n.id).sort().join(',')
    const edgeIds = edges.map(e => `${e.getSourceCellId()}-${e.getTargetCellId()}`).sort().join(',')
    const previewIds = previewLines.map(p => p.id || `${p.sourceNode?.id}-${p.targetNode?.id}`).sort().join(',')
    
    return `${nodeIds}|${edgeIds}|${previewIds}`
  }

  /**
   * 更新性能指标
   * @param {number} layoutTime - 布局时间
   */
  updatePerformanceMetrics(layoutTime) {
    this.performanceMetrics.layoutCount++
    this.performanceMetrics.averageLayoutTime = 
      (this.performanceMetrics.averageLayoutTime * (this.performanceMetrics.layoutCount - 1) + layoutTime) / 
      this.performanceMetrics.layoutCount
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.layoutCache.clear()
    this.positionCache.clear()
    this.branchCache.clear()
    console.log('[EnhancedStructuredLayoutEngine] 缓存已清理')
  }

  /**
   * 获取性能指标
   * @returns {Object} 性能指标
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics }
  }
}

export default EnhancedStructuredLayoutEngine