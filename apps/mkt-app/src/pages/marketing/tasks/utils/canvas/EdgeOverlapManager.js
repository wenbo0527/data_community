/**
 * 连线重叠避免管理器
 * 专门处理同端口连线的重叠问题，通过路径偏移算法避免视觉重叠
 */

export class EdgeOverlapManager {
  constructor(graph) {
    this.graph = graph
    this.edgeOffsetCache = new Map() // 缓存连线偏移信息
    this.portConnectionCount = new Map() // 记录每个端口的连接数量
    this.setupEventListeners()
    
    console.log('🎯 [连线重叠管理器] 初始化完成')
  }



  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听连线添加事件
    this.graph.on('edge:added', ({ edge }) => {
      this.handleEdgeAdded(edge)
    })

    // 监听连线移除事件
    this.graph.on('edge:removed', ({ edge }) => {
      this.handleEdgeRemoved(edge)
    })

    // 监听节点移动事件，重新计算连线偏移
    this.graph.on('node:moved', ({ node }) => {
      this.updateNodeConnectedEdges(node)
    })
  }

  /**
   * 处理连线添加事件
   */
  handleEdgeAdded(edge) {
    console.log('🔗 [连线重叠管理器] 处理连线添加:', edge.id)
    
    // 检查是否是临时连线（拖拽过程中的连线，targetId 为 undefined）
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    
    if (!targetId) {
      console.log('⏭️ [连线重叠管理器] 跳过临时连线（拖拽中）:', {
        edgeId: edge.id,
        sourceId,
        targetId
      })
      return
    }
    
    // 检查是否是预览线，跳过预览线的处理
    const edgeData = edge.getData() || {}
    if (edgeData.isPreview) {
      console.log('⏭️ [连线重叠管理器] 跳过预览线添加处理:', edge.id)
      return
    }

    // 也可以通过ID判断是否为预览线
    if (edge.id.includes('preview') || edge.id.includes('unified_preview')) {
      console.log('⏭️ [连线重叠管理器] 通过ID识别跳过预览线添加处理:', edge.id)
      return
    }

    // 🆕 新增：连接线创建后，自动删除对应的预览线
    this.cleanupRelatedPreviewLines(sourceId, targetId, edgeData)

    // 延迟处理，确保连线完全添加到图中
    setTimeout(() => {
      this.processEdgeOverlap(edge)
    }, 50)
  }

  /**
   * 处理连线移除事件
   */
  handleEdgeRemoved(edge) {
    console.log('🗑️ [连线重叠管理器] 处理连线移除:', edge.id)
    
    // 检查是否是临时连线（拖拽过程中的连线，targetId 为 undefined）
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    
    if (!targetId) {
      console.log('⏭️ [连线重叠管理器] 跳过临时连线移除（拖拽中）:', {
        edgeId: edge.id,
        sourceId,
        targetId
      })
      // 仍然清理缓存
      this.edgeOffsetCache.delete(edge.id)
      return
    }
    
    // 检查是否是预览线，跳过预览线的处理
    const edgeData = edge.getData() || {}
    if (edgeData.isPreview) {
      console.log('⏭️ [连线重叠管理器] 跳过预览线移除处理:', edge.id)
      return
    }

    // 也可以通过ID判断是否为预览线
    if (edge.id.includes('preview') || edge.id.includes('unified_preview')) {
      console.log('⏭️ [连线重叠管理器] 通过ID识别跳过预览线移除处理:', edge.id)
      return
    }
    
    const sourcePort = edge.getSourcePortId() || 'out'
    const targetPort = edge.getTargetPortId() || 'in'

    // 检查源和目标节点ID的有效性
    if (!sourceId || !targetId) {
      console.warn('⚠️ [连线重叠管理器] 移除的连线缺少有效的源或目标节点ID，跳过处理:', {
        edgeId: edge.id,
        sourceId,
        targetId
      })
      // 仍然清理缓存
      this.edgeOffsetCache.delete(edge.id)
      return
    }

    // 🆕 检查是否有跨分支偏移需要重新计算
    const cachedOffset = this.edgeOffsetCache.get(edge.id)
    if (cachedOffset && cachedOffset.type === 'cross-branch') {
      console.log('🔄 [跨分支偏移] 检测到跨分支连线移除，重新计算相关连线:', {
        removedEdgeId: edge.id,
        sourceId,
        targetId
      })
      
      // 重新计算同源同目标的其他连线
      this.recalculateCrossBranchEdges(sourceId, targetId)
    }

    // 更新端口连接计数
    this.updatePortConnectionCount(sourceId, sourcePort, -1)
    this.updatePortConnectionCount(targetId, targetPort, -1)

    // 清理缓存
    this.edgeOffsetCache.delete(edge.id)

    // 重新计算相关连线的偏移
    this.recalculatePortEdges(sourceId, sourcePort)
    this.recalculatePortEdges(targetId, targetPort)
  }

  /**
   * 处理连线重叠
   */
  processEdgeOverlap(edge) {
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    const sourcePort = edge.getSourcePortId() || 'out'
    const targetPort = edge.getTargetPortId() || 'in'

    // 检查源和目标节点ID的有效性
    if (!sourceId || !targetId) {
      console.warn('⚠️ [连线重叠管理器] 连线缺少有效的源或目标节点ID，跳过处理:', {
        edgeId: edge.id,
        sourceId,
        targetId
      })
      return
    }

    // 检查源和目标节点是否存在
    const sourceNode = this.graph.getCellById(sourceId)
    const targetNode = this.graph.getCellById(targetId)
    
    if (!sourceNode || !targetNode) {
      console.warn('⚠️ [连线重叠管理器] 源或目标节点不存在，跳过处理:', {
        edgeId: edge.id,
        sourceId,
        targetId,
        sourceNodeExists: !!sourceNode,
        targetNodeExists: !!targetNode
      })
      return
    }

    // 🆕 优先检查是否需要处理重叠
    // 获取所有同源同目标的连线（包括当前连线）
    const allSamePairEdges = this.getAllSamePairEdges(sourceId, targetId)
    
    // 检查同端口的其他连线
    const sameSourcePortEdges = this.getSamePortEdges(sourceId, sourcePort, 'source')
    const sameTargetPortEdges = this.getSamePortEdges(targetId, targetPort, 'target')

    // 🔍 判断是否需要处理重叠：只有在存在多条连线时才需要处理
    const needsCrossBranchHandling = allSamePairEdges.length > 1
    const needsSourcePortHandling = sameSourcePortEdges.length > 1
    const needsTargetPortHandling = sameTargetPortEdges.length > 1
    
    // 如果不需要任何重叠处理，直接返回
    if (!needsCrossBranchHandling && !needsSourcePortHandling && !needsTargetPortHandling) {
      console.log('✅ [连线重叠管理器] 无需处理重叠，跳过:', {
        edgeId: edge.id,
        sourceId,
        targetId,
        samePairCount: allSamePairEdges.length,
        sameSourcePortCount: sameSourcePortEdges.length,
        sameTargetPortCount: sameTargetPortEdges.length
      })
      return
    }

    console.log('🔍 [连线重叠管理器] 需要处理连线重叠:', {
      edgeId: edge.id,
      sourceId,
      targetId,
      sourcePort,
      targetPort,
      needsCrossBranchHandling,
      needsSourcePortHandling,
      needsTargetPortHandling
    })

    console.log('🔍 [跨分支检测] 同源同目标连线分析:', {
      currentEdgeId: edge.id,
      sourceId,
      targetId,
      totalSamePairEdges: allSamePairEdges.length,
      allEdgeIds: allSamePairEdges.map(e => e.id)
    })

    console.log('📊 [连线重叠管理器] 连线冲突分析:', {
      sameSourcePortCount: sameSourcePortEdges.length,
      sameTargetPortCount: sameTargetPortEdges.length,
      samePairEdgesCount: allSamePairEdges.length,
      currentEdgeId: edge.id
    })

    // 处理跨分支路径冲突（优先级最高）
    if (needsCrossBranchHandling) {
      console.log('🎯 [跨分支冲突] 检测到多条同源同目标连线，应用跨分支偏移策略')
      
      // 为所有同源同目标的连线应用跨分支偏移
      this.handleCrossBranchConflicts(allSamePairEdges)
    }
    // 处理同端口连线重叠
    else {
      console.log('📝 [传统重叠] 处理同端口连线重叠')
      
      // 只有在存在多条连线连接到同一端口时，才应用偏移算法
      if (needsSourcePortHandling) {
        this.applyEdgeOffsets(sameSourcePortEdges, sourceId, sourcePort, 'source')
      }

      if (needsTargetPortHandling) {
        this.applyEdgeOffsets(sameTargetPortEdges, targetId, targetPort, 'target')
      }
    }

    // 只有在实际处理了重叠时才更新端口连接计数
    if (needsCrossBranchHandling || needsSourcePortHandling || needsTargetPortHandling) {
      this.updatePortConnectionCount(sourceId, sourcePort, 1)
      this.updatePortConnectionCount(targetId, targetPort, 1)
    }
  }

  /**
   * 🆕 检测跨分支路径冲突
   * 检查同一个源节点的不同分支连接到同一个目标节点时的路径重叠
   */
  detectCrossBranchOverlap(currentEdge, sourceId, targetId) {
    const conflicts = []
    
    // 获取所有同源同目标的连线（包括当前连线）
    const allSamePairEdges = this.getAllSamePairEdges(sourceId, targetId)
    
    console.log('🔍 [跨分支冲突检测] 查找同源同目标连线:', {
      currentEdgeId: currentEdge.id,
      sourceId,
      targetId,
      totalSamePairEdges: allSamePairEdges.length,
      allEdgeIds: allSamePairEdges.map(e => e.id)
    })
    
    // 如果有多条同源同目标的连线，说明存在潜在的跨分支冲突
    if (allSamePairEdges.length > 1) {
      // 分析每对连线的路径冲突
      allSamePairEdges.forEach(otherEdge => {
        if (otherEdge.id !== currentEdge.id) {
          const conflictInfo = this.analyzePathConflict(currentEdge, otherEdge)
          if (conflictInfo.hasConflict) {
            conflicts.push({
              edge: otherEdge,
              conflictType: 'cross-branch',
              severity: conflictInfo.severity,
              conflictPoints: conflictInfo.conflictPoints
            })
          }
        }
      })
    }
    
    console.log('🔍 [跨分支冲突检测] 检测结果:', {
      currentEdgeId: currentEdge.id,
      sourceId,
      targetId,
      totalSamePairEdges: allSamePairEdges.length,
      conflictsFound: conflicts.length,
      conflicts: conflicts.map(c => ({
        conflictEdgeId: c.edge.id,
        type: c.conflictType,
        severity: c.severity
      }))
    })
    
    return conflicts
  }

  /**
   * 🆕 分析两条连线的路径冲突
   */
  analyzePathConflict(edge1, edge2) {
    try {
      // 获取连线的起点和终点
      const edge1Source = edge1.getSourcePoint()
      const edge1Target = edge1.getTargetPoint()
      const edge2Source = edge2.getSourcePoint()
      const edge2Target = edge2.getTargetPoint()
      
      // 计算路径的中点和方向
      const edge1MidX = (edge1Source.x + edge1Target.x) / 2
      const edge1MidY = (edge1Source.y + edge1Target.y) / 2
      const edge2MidX = (edge2Source.x + edge2Target.x) / 2
      const edge2MidY = (edge2Source.y + edge2Target.y) / 2
      
      // 计算路径距离
      const distance = Math.sqrt(
        Math.pow(edge1MidX - edge2MidX, 2) + 
        Math.pow(edge1MidY - edge2MidY, 2)
      )
      
      // 定义冲突阈值
      const conflictThreshold = 30 // 像素
      const hasConflict = distance < conflictThreshold
      
      // 计算冲突严重程度
      let severity = 'low'
      if (distance < 10) severity = 'high'
      else if (distance < 20) severity = 'medium'
      
      return {
        hasConflict,
        severity,
        distance,
        conflictPoints: [
          { x: edge1MidX, y: edge1MidY },
          { x: edge2MidX, y: edge2MidY }
        ]
      }
    } catch (error) {
      console.error('❌ [路径冲突分析] 分析失败:', error)
      return { hasConflict: false, severity: 'low', conflictPoints: [] }
    }
  }

  /**
   * 🆕 处理跨分支路径冲突
   */
  handleCrossBranchConflicts(allSamePairEdges) {
    console.log('🎯 [跨分支冲突处理] 开始处理冲突:', {
      edgesCount: allSamePairEdges.length,
      edgeIds: allSamePairEdges.map(e => e.id)
    })
    
    // 为所有同源同目标的连线应用跨分支偏移
    allSamePairEdges.forEach((edge, index) => {
      this.applyCrossBranchOffset(edge, index, allSamePairEdges.length)
    })
    
    // 记录处理结果
    console.log('✅ [跨分支冲突处理] 处理完成:', {
      processedEdgesCount: allSamePairEdges.length,
      appliedOffset: true
    })
  }

  /**
   * 🆕 应用跨分支偏移 - 根据布局方向的分层偏移方案
   */
  applyCrossBranchOffset(edge, index, totalCount) {
    try {
      // 🔧 保存当前的标签配置，防止在应用跨分支偏移时丢失
      const currentLabels = edge.getLabels()
      
      // 🔧 从连线的data属性中获取分支标签信息
      const edgeData = edge.getData() || {}
      const branchLabel = edgeData.label || edgeData.branchLabel
      
      const sourcePoint = edge.getSourcePoint()
      const targetPoint = edge.getTargetPoint()
      
      // 根据布局方向计算偏移策略
      const isVerticalLayout = this.layoutDirection === 'TB' || this.layoutDirection === 'BT'
      const isTopDown = this.layoutDirection === 'TB'
      
      // 计算分层偏移量
      const layerSpacing = 40 // 增加间距到40px
      
      // 修复偏移计算：确保连线能够正确分离
      let offsetFromCenter
      if (totalCount === 1) {
        offsetFromCenter = 0
      } else if (totalCount === 2) {
        // 两条连线：一条向左/上偏移，一条向右/下偏移
        offsetFromCenter = index === 0 ? -0.5 : 0.5
      } else {
        // 多条连线：对称分布
        const centerIndex = (totalCount - 1) / 2
        offsetFromCenter = index - centerIndex
      }
      
      let branchPoint, turnPoint, startDirection, endDirection
      
      // 垂直布局：水平分层
      const horizontalOffset = offsetFromCenter * layerSpacing
      const verticalExtension = isTopDown ? 60 : -60
      
      branchPoint = {
        x: sourcePoint.x + horizontalOffset,
        y: sourcePoint.y + verticalExtension
      }
      
      // 让turnPoint也有水平偏移，避免在目标节点附近重叠
      turnPoint = {
        x: targetPoint.x + horizontalOffset,
        y: branchPoint.y
      }
      
      startDirection = isTopDown ? 'bottom' : 'top'
      endDirection = isTopDown ? 'top' : 'bottom'
      
      // 设置路径点：源点 -> 分支点 -> 转折点 -> 目标点
      edge.setVertices([branchPoint, turnPoint])
      
      // 根据布局方向设置路由器
      edge.setRouter({
        name: 'orth',
        args: {
          padding: 10,
          step: 10,
          startDirections: [startDirection],
          endDirections: [endDirection]
        }
      })
      
      // 设置连线样式
      edge.setConnector({
        name: 'rounded',
        args: {
          radius: 6  // 使用x6Config中的默认值
        }
      })
      
      // 设置连线标签位置，避免重叠
      const labelOffset = this.calculateLabelOffset(index, totalCount, this.layoutDirection)
      
      // 🔧 检查连线是否已经有标签，避免重复创建
      const hasExistingLabels = currentLabels && currentLabels.length > 0
      
      if (hasExistingLabels) {
        // 如果已经有标签，只更新位置偏移，不重新创建标签内容
        const labelsWithUpdatedPosition = currentLabels.map(label => ({
          ...label,
          position: {
            distance: label.position?.distance || 0.5, // 保持原有距离
            offset: labelOffset // 更新偏移以避免重叠
          }
        }))
        
        edge.setLabels(labelsWithUpdatedPosition)
        console.log('🏷️ [跨分支偏移] 更新现有标签位置:', {
          edgeId: edge.id,
          labelsCount: labelsWithUpdatedPosition.length,
          labelOffset: labelOffset,
          preservedLabels: labelsWithUpdatedPosition.map(l => ({ 
            text: l.attrs?.label?.text || l.attrs?.text?.text, 
            position: l.position 
          }))
        })
      } else if (branchLabel) {
        // 只有在没有现有标签且有分支标签时才创建新标签
        const branchLabelConfig = {
          markup: [
            {
              tagName: 'rect',
              selector: 'body'
            },
            {
              tagName: 'text',
              selector: 'label'
            }
          ],
          attrs: {
            label: {
              text: branchLabel,
              fontSize: 12,
              fill: '#666',
              fontWeight: 'normal'
            },
            body: {
              fill: '#fff',
              stroke: '#ddd',
              strokeWidth: 1,
              rx: 3,
              ry: 3
            }
          },
          position: {
            distance: 0.5, // 在连线中点
            offset: labelOffset // 使用计算的标签偏移
          }
        }
        
        edge.setLabels([branchLabelConfig])
        console.log('🏷️ [跨分支偏移] 创建新的分支连线标签:', {
          edgeId: edge.id,
          branchLabel: branchLabel,
          labelOffset: labelOffset
        })
      } else {
        // 如果没有任何标签且没有分支标签，不设置标签
        console.log('🏷️ [跨分支偏移] 跳过标签设置（无现有标签且无分支标签):', {
          edgeId: edge.id,
          labelOffset: labelOffset
        })
      }
      
      // 缓存偏移信息
      this.edgeOffsetCache.set(edge.id, {
        type: 'cross-branch-layout',
        layoutDirection: this.layoutDirection,
        offset: { horizontal: offsetFromCenter * layerSpacing, vertical: 0 },
        index,
        totalCount,
        branchPoint,
        turnPoint,
        labelOffset
      })
      
      console.log('✅ [布局感知分层偏移] 应用偏移成功:', {
        edgeId: edge.id,
        layoutDirection: this.layoutDirection,
        index,
        totalCount,
        isVerticalLayout,
        offsetFromCenter,
        horizontalOffset: offsetFromCenter * layerSpacing,
        sourcePoint,
        targetPoint,
        branchPoint,
        turnPoint,
        labelOffset,
        labelsPreserved: currentLabels?.length || 0
      })
      
    } catch (error) {
      console.error('❌ [布局感知分层偏移] 应用偏移失败:', error)
    }
  }

  /**
   * 计算标签偏移位置，避免重叠
   */
  calculateLabelOffset(index, totalCount) {
    const baseOffset = 15
    const spacing = 12 // 增加标签间距
    
    // 修复偏移计算：确保标签能够正确分离
    let offsetFromCenter
    if (totalCount === 1) {
      offsetFromCenter = 0
    } else if (totalCount === 2) {
      // 两条连线：一条向左偏移，一条向右偏移
      offsetFromCenter = index === 0 ? -0.5 : 0.5
    } else {
      // 多条连线：对称分布
      const centerIndex = (totalCount - 1) / 2
      offsetFromCenter = index - centerIndex
    }
    
    // 垂直布局：标签水平偏移
    return {
      x: offsetFromCenter * spacing,
      y: baseOffset
    }
  }

  /**
   * 获取连接到同一端口的所有连线
   */
  getSamePortEdges(nodeId, portId, direction) {
    const allEdges = this.graph.getEdges()
    
    return allEdges.filter(edge => {
      // 跳过预览线
      const edgeData = edge.getData() || {}
      if (edgeData.isPreview) {
        return false
      }

      // 也可以通过ID判断是否为预览线
      if (edge.id.includes('preview') || edge.id.includes('unified_preview')) {
        return false
      }

      if (direction === 'source') {
        return edge.getSourceCellId() === nodeId && 
               (edge.getSourcePortId() || 'out') === portId
      } else {
        return edge.getTargetCellId() === nodeId && 
               (edge.getTargetPortId() || 'in') === portId
      }
    })
  }

  /**
   * 应用连线偏移算法
   */
  applyEdgeOffsets(edges, nodeId, portId, direction) {
    console.log('🎯 [连线重叠管理器] 应用连线偏移:', {
      nodeId,
      portId,
      direction,
      edgeCount: edges.length
    })

    const node = this.graph.getCellById(nodeId)
    if (!node) return

    const nodePosition = node.getPosition()
    const nodeSize = (node && typeof node.getSize === 'function') ? node.getSize() : { width: 120, height: 40 }

    // 计算基础偏移参数
    const baseOffset = 15 // 基础偏移距离
    const maxOffset = 40  // 最大偏移距离
    const edgeCount = edges.length

    edges.forEach((edge, index) => {
      // 计算偏移量
      const offsetMultiplier = this.calculateOffsetMultiplier(index, edgeCount)
      const offset = Math.min(baseOffset * offsetMultiplier, maxOffset)

      console.log('📐 [连线重叠管理器] 计算连线偏移:', {
        edgeId: edge.id,
        index,
        offsetMultiplier,
        offset
      })

      // 应用X6的路径偏移
      this.applyX6EdgeOffset(edge, offset, direction, nodePosition, nodeSize)
      
      // 缓存偏移信息
      this.edgeOffsetCache.set(edge.id, {
        offset,
        direction,
        nodeId,
        portId,
        index
      })
    })
  }

  /**
   * 计算偏移倍数
   */
  calculateOffsetMultiplier(index, totalCount) {
    if (totalCount === 1) return 0
    if (totalCount === 2) return index === 0 ? -0.5 : 0.5
    
    // 对于多条连线，使用对称分布
    const center = (totalCount - 1) / 2
    return (index - center) * 0.8
  }

  /**
   * 应用X6连线偏移
   */
  applyX6EdgeOffset(edge, offset, direction, nodePosition, nodeSize) {
    try {
      // 🔧 保存当前的标签配置，防止在应用偏移时丢失
      const currentLabels = edge.getLabels()
      
      // 使用X6的orth路由器配置偏移
      const currentRouter = edge.getRouter()
      
      // 创建带偏移的路由器配置
      const offsetRouter = {
        name: 'orth',
        args: {
          padding: 15,
          step: 10,
          // 根据方向和偏移量调整起始和结束方向
          startDirections: this.calculateStartDirections(direction, offset),
          endDirections: this.calculateEndDirections(direction, offset),
          // 添加偏移参数
          offset: {
            horizontal: direction === 'source' ? offset : 0,
            vertical: direction === 'target' ? offset : 0
          }
        }
      }

      // 应用新的路由器配置
      edge.setRouter(offsetRouter)

      // 如果偏移较大，使用自定义路径点
      if (Math.abs(offset) > 20) {
        this.applyCustomPathPoints(edge, offset, direction, nodePosition, nodeSize)
      }

      // 🔧 恢复标签配置，确保包含正确的位置信息
      if (currentLabels && currentLabels.length > 0) {
        // 为每个label添加默认位置信息（如果没有的话）
        const labelsWithPosition = currentLabels.map(label => ({
          ...label,
          position: label.position || {
            distance: 0.5, // 在连线中点
            offset: 0      // 无偏移
          }
        }))
        
        edge.setLabels(labelsWithPosition)
        console.log('🏷️ [连线重叠管理器] 恢复连线标签:', {
          edgeId: edge.id,
          labelsCount: labelsWithPosition.length,
          labelsWithPosition: labelsWithPosition.map(l => ({ 
            text: l.attrs?.text?.text, 
            position: l.position 
          }))
        })
      }

      console.log('✅ [连线重叠管理器] 应用X6偏移成功:', {
        edgeId: edge.id,
        offset,
        direction,
        routerConfig: offsetRouter,
        labelsPreserved: currentLabels?.length || 0
      })

    } catch (error) {
      console.error('❌ [连线重叠管理器] 应用X6偏移失败:', {
        edgeId: edge.id,
        error: error.message
      })
    }
  }

  /**
   * 计算起始方向
   */
  calculateStartDirections(direction, offset) {
    if (direction === 'source') {
      if (offset > 0) return ['bottom', 'right']
      if (offset < 0) return ['bottom', 'left']
      return ['bottom']
    }
    return ['bottom']
  }

  /**
   * 计算结束方向
   */
  calculateEndDirections(direction, offset) {
    if (direction === 'target') {
      if (offset > 0) return ['top', 'right']
      if (offset < 0) return ['top', 'left']
      return ['top']
    }
    return ['top']
  }

  /**
   * 应用自定义路径点
   */
  applyCustomPathPoints(edge, offset, direction, nodePosition, nodeSize) {
    try {
      // 🔧 保存当前的标签配置，防止在设置路径点时丢失
      const currentLabels = edge.getLabels()
      
      const sourcePoint = edge.getSourcePoint()
      const targetPoint = edge.getTargetPoint()

      // 计算中间控制点
      const midX = (sourcePoint.x + targetPoint.x) / 2 + offset
      const midY = (sourcePoint.y + targetPoint.y) / 2

      // 设置路径点
      const vertices = [
        { x: midX, y: sourcePoint.y + 30 }, // 源节点下方的控制点
        { x: midX, y: targetPoint.y - 30 }  // 目标节点上方的控制点
      ]

      edge.setVertices(vertices)

      // 🔧 恢复标签配置，确保包含正确的位置信息
      if (currentLabels && currentLabels.length > 0) {
        // 为每个label添加默认位置信息（如果没有的话）
        const labelsWithPosition = currentLabels.map(label => ({
          ...label,
          position: label.position || {
            distance: 0.5, // 在连线中点
            offset: 0      // 无偏移
          }
        }))
        
        edge.setLabels(labelsWithPosition)
        console.log('🏷️ [连线重叠管理器] 恢复路径点连线标签:', {
          edgeId: edge.id,
          labelsCount: labelsWithPosition.length,
          labelsWithPosition: labelsWithPosition.map(l => ({ 
            text: l.attrs?.text?.text, 
            position: l.position 
          }))
        })
      }

      console.log('🎨 [连线重叠管理器] 应用自定义路径点:', {
        edgeId: edge.id,
        vertices,
        offset,
        labelsPreserved: currentLabels?.length || 0
      })

    } catch (error) {
      console.error('❌ [连线重叠管理器] 应用自定义路径点失败:', error)
    }
  }

  /**
   * 更新端口连接计数
   */
  updatePortConnectionCount(nodeId, portId, delta) {
    const key = `${nodeId}:${portId}`
    const currentCount = this.portConnectionCount.get(key) || 0
    const newCount = Math.max(0, currentCount + delta)
    
    if (newCount === 0) {
      this.portConnectionCount.delete(key)
    } else {
      this.portConnectionCount.set(key, newCount)
    }

    console.log('📊 [连线重叠管理器] 更新端口连接计数:', {
      nodeId,
      portId,
      delta,
      newCount
    })
  }

  /**
   * 重新计算端口的所有连线偏移
   */
  recalculatePortEdges(nodeId, portId) {
    console.log('🔄 [连线重叠管理器] 重新计算端口连线偏移:', { nodeId, portId })

    // 获取连接到该端口的所有连线
    const sourceEdges = this.getSamePortEdges(nodeId, portId, 'source')
    const targetEdges = this.getSamePortEdges(nodeId, portId, 'target')

    // 重新应用偏移
    if (sourceEdges.length > 1) {
      this.applyEdgeOffsets(sourceEdges, nodeId, portId, 'source')
    } else if (sourceEdges.length === 1) {
      // 只有一条连线时，移除偏移
      this.removeEdgeOffset(sourceEdges[0])
    }

    if (targetEdges.length > 1) {
      this.applyEdgeOffsets(targetEdges, nodeId, portId, 'target')
    } else if (targetEdges.length === 1) {
      // 只有一条连线时，移除偏移
      this.removeEdgeOffset(targetEdges[0])
    }
  }

  /**
   * 移除连线偏移
   */
  removeEdgeOffset(edge) {
    try {
      // 🔧 保存当前的标签配置，防止在移除偏移时丢失
      const currentLabels = edge.getLabels()
      
      // 获取缓存的偏移信息
      const cachedOffset = this.edgeOffsetCache.get(edge.id)
      
      // 根据当前布局方向恢复默认的路由器配置
      const defaultDirections = this.getDefaultDirections()
      
      edge.setRouter({
        name: 'orth',
        args: {
          padding: 15,
          step: 10,
          startDirections: [defaultDirections.start],
          endDirections: [defaultDirections.end]
        }
      })

      // 恢复默认连接器（与x6Config保持一致）
      edge.setConnector({
        name: 'rounded',
        args: {
          radius: 6  // 使用x6Config中的默认值
        }
      })

      // 清除自定义路径点
      edge.setVertices([])

      // 🔧 恢复默认连接点配置（与x6Config保持一致）
      edge.prop('connectionPoint', {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      })

      // 🔧 恢复默认线条样式（与x6Config保持一致）
      edge.setAttrs({
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8
          }
        }
      })

      // 🔧 恢复标签配置，确保包含正确的位置信息
      if (currentLabels && currentLabels.length > 0) {
        // 为每个label添加默认位置信息（如果没有的话）
        const labelsWithPosition = currentLabels.map(label => ({
          ...label,
          position: label.position || {
            distance: 0.5, // 在连线中点
            offset: 0      // 无偏移
          }
        }))
        
        edge.setLabels(labelsWithPosition)
        console.log('🏷️ [连线重叠管理器] 恢复移除偏移连线标签:', {
          edgeId: edge.id,
          labelsCount: labelsWithPosition.length,
          labelsWithPosition: labelsWithPosition.map(l => ({ 
            text: l.attrs?.text?.text, 
            position: l.position 
          }))
        })
      }

      // 清理缓存
      this.edgeOffsetCache.delete(edge.id)

      console.log('🧹 [连线重叠管理器] 移除连线偏移并恢复默认样式:', {
        edgeId: edge.id,
        offsetType: cachedOffset?.type || 'unknown',
        labelsPreserved: currentLabels?.length || 0,
        defaultStylesApplied: true
      })

    } catch (error) {
      console.error('❌ [连线重叠管理器] 移除连线偏移失败:', error)
    }
  }

  /**
   * 获取默认连线方向
   */
  getDefaultDirections() {
    return { start: 'bottom', end: 'top' }
  }

  /**
   * 更新节点相关的所有连线
   */
  updateNodeConnectedEdges(node) {
    const nodeId = node.id
    const connectedEdges = this.graph.getConnectedEdges(node)

    // 按端口分组处理
    const portGroups = new Map()

    connectedEdges.forEach(edge => {
      const edgeData = edge.getData() || {}
      // 跳过预览线
      if (edgeData.isPreview) {
        return
      }

      // 也可以通过ID判断是否为预览线
      if (edge.id.includes('preview') || edge.id.includes('unified_preview')) {
        return
      }

      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()

      // 检查连线的有效性
      if (!sourceId || !targetId) {
        console.warn('⚠️ [连线重叠管理器] 节点连线缺少有效的源或目标节点ID，跳过处理:', {
          edgeId: edge.id,
          sourceId,
          targetId,
          nodeId
        })
        return
      }

      if (sourceId === nodeId) {
        const portId = edge.getSourcePortId() || 'out'
        const key = `source:${portId}`
        if (!portGroups.has(key)) portGroups.set(key, [])
        portGroups.get(key).push(edge)
      }

      if (targetId === nodeId) {
        const portId = edge.getTargetPortId() || 'in'
        const key = `target:${portId}`
        if (!portGroups.has(key)) portGroups.set(key, [])
        portGroups.get(key).push(edge)
      }
    })

    // 重新计算每个端口组的偏移
    portGroups.forEach((edges, key) => {
      const [direction, portId] = key.split(':')
      if (edges.length > 1) {
        this.applyEdgeOffsets(edges, nodeId, portId, direction)
      }
    })
  }

  /**
   * 重新计算跨分支连线偏移
   * 当一条跨分支连线被移除时，重新计算同源同目标的其他连线
   */
  recalculateCrossBranchEdges(sourceId, targetId) {
    console.log('🔄 [跨分支偏移] 重新计算跨分支连线:', { sourceId, targetId })

    try {
      // 获取所有从同一源节点到同一目标节点的连线
      const samePairEdges = this.getAllSamePairEdges(sourceId, targetId)

      console.log('🔍 [跨分支偏移] 找到同源同目标连线数量:', samePairEdges.length)

      if (samePairEdges.length <= 1) {
        // 如果只剩一条或没有连线，移除所有偏移
        samePairEdges.forEach(edge => {
          this.removeEdgeOffset(edge)
        })
        return
      }

      // 重新应用跨分支偏移
      samePairEdges.forEach((edge, index) => {
        this.applyCrossBranchOffset(edge, index, samePairEdges.length)
      })

    } catch (error) {
      console.error('❌ [跨分支偏移] 重新计算跨分支连线失败:', error)
    }
  }

  /**
   * 检查连线是否重叠
   */
  checkEdgeOverlap(edge1, edge2) {
    try {
      const path1 = edge1.getPath()
      const path2 = edge2.getPath()
      
      // 简单的重叠检测：检查路径是否过于接近
      // 这里可以实现更复杂的几何重叠检测算法
      
      return false // 暂时返回false，可以根据需要实现具体的重叠检测逻辑
    } catch (error) {
      console.error('❌ [连线重叠管理器] 检查连线重叠失败:', error)
      return false
    }
  }

  /**
   * 获取管理器状态
   */
  getManagerStatus() {
    return {
      edgeOffsetCacheSize: this.edgeOffsetCache.size,
      portConnectionCounts: Object.fromEntries(this.portConnectionCount),
      totalManagedEdges: this.edgeOffsetCache.size
    }
  }

  /**
   * 获取所有同源同目标的连线
   */
  getAllSamePairEdges(sourceId, targetId) {
    const allEdges = this.graph.getEdges()
    return allEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      
      // 跳过预览线
      if (edgeData.isPreview) {
        return false
      }
      
      if (edge.id.includes('preview') || edge.id.includes('unified_preview')) {
        return false
      }

      const edgeSourceId = edge.getSourceCellId()
      const edgeTargetId = edge.getTargetCellId()
      
      return edgeSourceId === sourceId && edgeTargetId === targetId
    })
  }

  /**
   * 清理相关预览线
   */
  cleanupRelatedPreviewLines(sourceId, targetId, edgeData) {
    try {
      console.log('🧹 [连线重叠管理器] 开始清理相关预览线:', {
        sourceId,
        targetId,
        branchId: edgeData.branchId
      })

      const allEdges = this.graph.getEdges() || []
      const previewLinesToRemove = []

      // 查找需要删除的预览线
       allEdges.forEach(edge => {
         const edgeSourceId = edge.getSourceCellId()
         const edgeTargetId = edge.getTargetCellId()
         const previewEdgeData = edge.getData() || {}

         // 检查是否是预览线
         const isPreviewLine = previewEdgeData.isPreview || 
                              edge.id.includes('preview') || 
                              edge.id.includes('unified_preview')

         if (isPreviewLine && edgeSourceId === sourceId) {
           // 如果连接线有分支ID，只删除相同分支的预览线
           if (edgeData.branchId && previewEdgeData.branchId === edgeData.branchId) {
             previewLinesToRemove.push(edge)
           } 
           // 如果连接线没有分支ID，删除所有来自同一源节点的预览线
           else if (!edgeData.branchId && !previewEdgeData.branchId) {
             previewLinesToRemove.push(edge)
           }
         }
       })

      // 删除找到的预览线
      previewLinesToRemove.forEach(previewEdge => {
        try {
          console.log('🗑️ [连线重叠管理器] 删除预览线:', previewEdge.id)
          this.graph.removeCell(previewEdge)
        } catch (error) {
          console.warn('⚠️ [连线重叠管理器] 删除预览线失败:', previewEdge.id, error)
        }
      })

      console.log('✅ [连线重叠管理器] 预览线清理完成，删除了', previewLinesToRemove.length, '条预览线')

    } catch (error) {
      console.error('❌ [连线重叠管理器] 预览线清理失败:', error)
    }
  }

  /**
   * 清理管理器
   */
  cleanup() {
    this.edgeOffsetCache.clear()
    this.portConnectionCount.clear()
    
    // 移除事件监听器
    this.graph.off('edge:added')
    this.graph.off('edge:removed')
    this.graph.off('node:moved')
    
    console.log('🧹 [连线重叠管理器] 清理完成')
  }
}

export default EdgeOverlapManager