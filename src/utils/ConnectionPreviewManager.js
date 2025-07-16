/**
 * 连接预览管理器
 * 用于管理分流节点的连接预览和智能连接功能
 * 支持上下结构布局、持久化显示和拖拽自动吸附
 */
import { 
  VERTICAL_LAYOUT_CONFIG, 
  calculateBranchPreviewPosition, 
  calculateSinglePreviewPosition,
  getBestSnapPosition 
} from './verticalLayoutConfig.js'

export class ConnectionPreviewManager {
  constructor(graph, branchManager) {
    this.graph = graph
    this.branchManager = branchManager
    this.previewLines = new Map() // 存储预览线条
    this.persistentPreviews = new Map() // 存储持久化预览线
    this.isPreviewMode = false
    this.currentPreviewNode = null
    this.isDragging = false
    this.dragNode = null
    this.snapDistance = VERTICAL_LAYOUT_CONFIG.SNAP_CONFIG.DISTANCE
    
    // 使用垂直布局配置
    this.layoutConfig = VERTICAL_LAYOUT_CONFIG
    
    this.initEventListeners()
    this.initPersistentPreviews()
  }

  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    if (!this.graph) return

    // 监听节点悬停事件
    this.graph.on('node:mouseenter', this.handleNodeMouseEnter.bind(this))
    this.graph.on('node:mouseleave', this.handleNodeMouseLeave.bind(this))
    
    // 监听连接开始事件
    this.graph.on('edge:connected', this.handleEdgeConnected.bind(this))
    
    // 监听边删除事件
    this.graph.on('edge:removed', this.handleEdgeRemoved.bind(this))
    
    // 监听节点选中事件
    this.graph.on('node:selected', this.handleNodeSelected.bind(this))
    this.graph.on('node:unselected', this.handleNodeUnselected.bind(this))
    
    // 监听拖拽事件
    this.graph.on('node:move', this.handleNodeMove.bind(this))
    this.graph.on('node:moved', this.handleNodeMoved.bind(this))
    this.graph.on('node:mousedown', this.handleNodeMouseDown.bind(this))
    this.graph.on('node:mouseup', this.handleNodeMouseUp.bind(this))
    
    // 监听画布事件
    this.graph.on('blank:mouseup', this.handleBlankMouseUp.bind(this))
    
    // 监听节点添加/移除事件
    this.graph.on('node:added', this.onNodeAdded.bind(this))
    this.graph.on('node:removed', this.onNodeRemoved.bind(this))
  }

  /**
   * 初始化持久化预览线
   */
  initPersistentPreviews() {
    console.log('🔄 [ConnectionPreview] 初始化持久化预览线')
    
    // 为所有现有节点创建持久化预览线
    const nodes = this.graph.getNodes()
    nodes.forEach(node => {
      this.createPersistentPreview(node)
    })
  }

  /**
   * 创建持久化预览线
   * @param {Object} node - 节点
   */
  createPersistentPreview(node) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 跳过不需要预览线的节点类型
    if (this.shouldSkipPreview(node, nodeData, nodeType)) {
      console.log('⏭️ [ConnectionPreview] 跳过节点预览线创建:', {
        nodeId: node.id,
        nodeType,
        reason: this.getSkipReason(nodeData, nodeType)
      })
      return
    }
    
    const nodePosition = node.getPosition()
    const nodeSize = node.getSize()
    
    console.log('📌 [ConnectionPreview] 创建持久化预览线:', {
      nodeId: node.id,
      nodeType,
      position: nodePosition,
      size: nodeSize
    })
    
    if (this.isBranchNode(node)) {
      this.createPersistentBranchPreviews(node, nodePosition, nodeSize)
    } else {
      this.createPersistentSinglePreview(node, nodePosition, nodeSize)
    }
  }

  /**
   * 判断是否应该跳过预览线创建
   * @param {Object} node - 节点对象
   * @param {Object} nodeData - 节点数据
   * @param {string} nodeType - 节点类型
   * @returns {boolean} 是否跳过
   */
  shouldSkipPreview(node, nodeData, nodeType) {
    // 跳过结束节点（结束节点不需要输出预览线）
    if (nodeType === 'end' || nodeType === 'finish') return true
    
    // 跳过预览线相关的节点（防止循环）
    if (nodeData.isPersistentPreview || nodeData.isPreview) return true
    
    // 跳过没有有效节点类型的节点
    if (!nodeType || nodeType === 'unknown') return true
    
    // 跳过已经存在预览线的节点
    if (this.hasExistingPreview(node.id)) return true
    
    return false
  }

  /**
   * 获取跳过原因
   * @param {Object} nodeData - 节点数据
   * @param {string} nodeType - 节点类型
   * @returns {string} 跳过原因
   */
  getSkipReason(nodeData, nodeType) {
    if (nodeType === 'end' || nodeType === 'finish') return '结束节点'
    if (nodeData.isPersistentPreview || nodeData.isPreview) return '预览线节点'
    if (!nodeType || nodeType === 'unknown') return '未知节点类型'
    return '其他原因'
  }

  /**
   * 检查节点是否已有预览线
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否已存在
   */
  hasExistingPreview(nodeId) {
    for (const key of this.persistentPreviews.keys()) {
      if (key.startsWith(nodeId + '_')) {
        return true
      }
    }
    return false
  }

  /**
   * 创建分支节点的持久化预览线（上下结构）
   * @param {Object} node - 节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   */
  createPersistentBranchPreviews(node, nodePosition, nodeSize) {
    const branches = this.branchManager.getNodeBranches(node)
    
    branches.forEach((branch, index) => {
      const position = calculateBranchPreviewPosition(node, branches, index)
      const style = this.layoutConfig.PREVIEW_STYLES.PERSISTENT.BRANCH
      const labelStyle = this.layoutConfig.LABEL_STYLES.BRANCH
      
      const previewLine = this.graph.addEdge({
      source: {
        cell: node.id,
        port: 'out' // 统一使用out端口作为出口
      },
      target: {
        x: position.end.x,
        y: position.end.y
      },
      router: {
        name: 'manhattan',
        args: {
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      },
      attrs: {
        line: {
          ...style,
          'data-preview-type': 'branch',
          'data-node-id': node.id,
          'data-branch-id': branch.id
        }
      },
      zIndex: 999,
      data: {
        isPersistentPreview: true,
        branchId: branch.id,
        sourceNodeId: node.id,
        snapZone: position.snapZone
      }
    })

      // 创建分支标签
      const label = this.graph.addNode({
        x: position.end.x - labelStyle.width / 2,
        y: position.end.y + 5,
        width: labelStyle.width,
        height: labelStyle.height,
        shape: 'rect',
        attrs: {
          body: {
            fill: labelStyle.fill,
            stroke: labelStyle.stroke,
            strokeWidth: 1,
            rx: 10,
            ry: 10,
            opacity: 0.8
          },
          text: {
            text: branch.label,
            fontSize: labelStyle.fontSize,
            fill: labelStyle.textColor,
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          }
        },
        zIndex: 1000,
        data: {
          isPersistentPreview: true,
          branchId: branch.id,
          sourceNodeId: node.id
        }
      })

      this.persistentPreviews.set(`${node.id}_${branch.id}`, { line: previewLine, label })
    })
  }

  /**
   * 创建普通节点的持久化预览线（上下结构）
   * @param {Object} node - 节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   */
  createPersistentSinglePreview(node, nodePosition, nodeSize) {
    const position = calculateSinglePreviewPosition(node)
    const style = this.layoutConfig.PREVIEW_STYLES.PERSISTENT.SINGLE
    const labelStyle = this.layoutConfig.LABEL_STYLES.SINGLE
    
    const previewLine = this.graph.addEdge({
      source: {
        cell: node.id,
        port: 'out' // 统一使用out端口作为出口
      },
      target: {
        x: position.end.x,
        y: position.end.y
      },
      router: {
        name: 'manhattan',
        args: {
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      },
      attrs: {
        line: {
          ...style,
          'data-preview-type': 'single',
          'data-node-id': node.id
        }
      },
      zIndex: 999,
      data: {
        isPersistentPreview: true,
        sourceNodeId: node.id,
        snapZone: position.snapZone
      }
    })

    // 创建连接标签
    const label = this.graph.addNode({
      x: position.end.x - labelStyle.width / 2,
      y: position.end.y + 5,
      width: labelStyle.width,
      height: labelStyle.height,
      shape: 'rect',
      attrs: {
        body: {
          fill: labelStyle.fill,
          stroke: labelStyle.stroke,
          strokeWidth: 1,
          rx: 9,
          ry: 9,
          opacity: 0.8
        },
        text: {
          text: '连接',
          fontSize: labelStyle.fontSize,
          fill: labelStyle.textColor,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle'
        }
      },
      zIndex: 1000,
      data: {
        isPersistentPreview: true,
        sourceNodeId: node.id
      }
    })

    this.persistentPreviews.set(`${node.id}_single`, { line: previewLine, label })
  }

  /**
   * 处理节点鼠标按下事件
   * @param {Object} e - 事件对象
   */
  handleNodeMouseDown(e) {
    const { node } = e
    this.isDragging = true
    this.dragNode = node
    
    console.log('🖱️ [ConnectionPreview] 开始拖拽节点:', {
      nodeId: node.id,
      nodeType: node.getData()?.type || 'unknown'
    })
  }

  /**
   * 处理节点鼠标释放事件
   * @param {Object} e - 事件对象
   */
  handleNodeMouseUp(e) {
    this.isDragging = false
    this.dragNode = null
    
    console.log('🖱️ [ConnectionPreview] 结束拖拽节点')
  }

  /**
   * 处理画布空白区域鼠标释放事件
   * @param {Object} e - 事件对象
   */
  handleBlankMouseUp(e) {
    this.isDragging = false
    this.dragNode = null
  }

  /**
   * 处理节点移动事件（拖拽过程中）
   * @param {Object} e - 事件对象
   */
  handleNodeMove(e) {
    const { node } = e
    
    if (!this.isDragging || this.dragNode !== node) return
    
    const nodePosition = node.getPosition()
    const nodeSize = node.getSize()
    
    // 检查是否靠近任何预览线的吸附区域
    this.checkSnapToPreviewLines(node, nodePosition, nodeSize)
    
    // 更新该节点的持久化预览线位置
    this.updatePersistentPreviewPosition(node, nodePosition, nodeSize)
  }

  /**
   * 处理节点移动完成事件
   * @param {Object} e - 事件对象
   */
  handleNodeMoved(e) {
    const { node } = e
    const nodePosition = node.getPosition()
    const nodeSize = node.getSize()
    
    console.log('📍 [ConnectionPreview] 节点移动完成:', {
      nodeId: node.id,
      newPosition: nodePosition
    })
    
    // 更新持久化预览线
    this.updatePersistentPreviewPosition(node, nodePosition, nodeSize)
  }

  /**
   * 检查并执行自动吸附到预览线
   * @param {Object} dragNode - 被拖拽的节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   */
  checkSnapToPreviewLines(dragNode, nodePosition, nodeSize) {
    const dragNodeCenter = {
      x: nodePosition.x + nodeSize.width / 2,
      y: nodePosition.y
    }
    
    let closestSnap = null
    let minDistance = Infinity
    
    // 检查所有持久化预览线的吸附区域
    this.persistentPreviews.forEach(({ line }, key) => {
      const lineData = line.getData()
      if (!lineData.snapZone || lineData.sourceNodeId === dragNode.id) return
      
      const snapZone = lineData.snapZone
      const distance = Math.sqrt(
        Math.pow(dragNodeCenter.x - snapZone.x, 2) + 
        Math.pow(dragNodeCenter.y - snapZone.y, 2)
      )
      
      if (distance < snapZone.radius && distance < minDistance) {
        minDistance = distance
        closestSnap = {
          x: snapZone.x - nodeSize.width / 2,
          y: snapZone.y,
          sourceNodeId: lineData.sourceNodeId,
          branchId: lineData.branchId,
          distance
        }
      }
    })
    
    // 执行自动吸附
    if (closestSnap && minDistance < this.snapDistance) {
      console.log('🧲 [ConnectionPreview] 执行自动吸附:', {
        dragNodeId: dragNode.id,
        snapPosition: { x: closestSnap.x, y: closestSnap.y },
        distance: minDistance,
        sourceNodeId: closestSnap.sourceNodeId
      })
      
      // 设置节点位置到吸附点
      dragNode.setPosition(closestSnap.x, closestSnap.y)
      
      // 高亮显示吸附的预览线
      this.highlightSnapTarget(closestSnap.sourceNodeId, closestSnap.branchId)
      
      // 延迟创建连接
      setTimeout(() => {
        this.createSnapConnection(closestSnap.sourceNodeId, dragNode.id, closestSnap.branchId)
      }, 100)
    }
  }

  /**
   * 创建吸附连接
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} branchId - 分支ID（可选）
   */
  createSnapConnection(sourceNodeId, targetNodeId, branchId) {
    const sourceNode = this.graph.getCellById(sourceNodeId)
    const targetNode = this.graph.getCellById(targetNodeId)
    
    if (!sourceNode || !targetNode) {
      console.warn('🚫 [ConnectionPreview] 无法找到源节点或目标节点:', {
        sourceNodeId,
        targetNodeId,
        sourceNodeFound: !!sourceNode,
        targetNodeFound: !!targetNode
      })
      return
    }
    
    console.log('🔗 [ConnectionPreview] 创建吸附连接:', {
      sourceNodeId,
      targetNodeId,
      branchId
    })
    
    // 创建连接边
    const edge = this.graph.addEdge({
      source: sourceNode,
      target: targetNode,
      attrs: {
        line: {
          stroke: branchId ? '#1890ff' : '#52c41a',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6
          }
        }
      },
      data: {
        branchId,
        sourceNodeId,
        targetNodeId,
        isAutoSnapped: true
      }
    })
    
    // 如果是分支连接，添加标签
    if (branchId && this.branchManager) {
      const branches = this.branchManager.getNodeBranches(sourceNode)
      const branch = branches.find(b => b.id === branchId)
      
      if (branch) {
        edge.setLabels([{
          attrs: {
            text: {
              text: branch.label,
              fontSize: 12,
              fill: '#666'
            },
            rect: {
              fill: '#fff',
              stroke: '#1890ff',
              strokeWidth: 1,
              rx: 3,
              ry: 3
            }
          }
        }])
      }
    }
    
    // 移除对应的持久化预览线
    this.removePersistentPreview(sourceNodeId, branchId)
    
    return edge
  }

  /**
   * 移除持久化预览线
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID（可选）
   */
  removePersistentPreview(sourceNodeId, branchId) {
    const key = branchId ? `${sourceNodeId}_${branchId}` : `${sourceNodeId}_single`
    const preview = this.persistentPreviews.get(key)
    
    if (preview) {
      console.log('🗑️ [ConnectionPreview] 移除持久化预览线:', { key })
      
      if (preview.line && this.graph.hasCell(preview.line)) {
        this.graph.removeCell(preview.line)
      }
      if (preview.label && this.graph.hasCell(preview.label)) {
        this.graph.removeCell(preview.label)
      }
      
      this.persistentPreviews.delete(key)
    }
  }

  /**
   * 更新持久化预览线位置
   * @param {Object} node - 节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   */
  updatePersistentPreviewPosition(node, nodePosition, nodeSize) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 跳过结束节点
    if (nodeType === 'end') return
    
    // 先移除旧的预览线
    this.removePersistentPreviewsForNode(node.id)
    
    // 创建新的预览线
    if (this.isBranchNode(node)) {
      this.createPersistentBranchPreviews(node, nodePosition, nodeSize)
    } else {
      this.createPersistentSinglePreview(node, nodePosition, nodeSize)
    }
  }

  /**
   * 移除指定节点的所有持久化预览线
   * @param {string} nodeId - 节点ID
   */
  removePersistentPreviewsForNode(nodeId) {
    const keysToRemove = []
    
    this.persistentPreviews.forEach((preview, key) => {
      if (key.startsWith(nodeId + '_')) {
        keysToRemove.push(key)
      }
    })
    
    keysToRemove.forEach(key => {
      const preview = this.persistentPreviews.get(key)
      if (preview) {
        if (preview.line && this.graph.hasCell(preview.line)) {
          this.graph.removeCell(preview.line)
        }
        if (preview.label && this.graph.hasCell(preview.label)) {
          this.graph.removeCell(preview.label)
        }
        this.persistentPreviews.delete(key)
      }
    })
  }

  /**
   * 处理节点鼠标进入事件
   * @param {Object} e - 事件对象
   */
  handleNodeMouseEnter(e) {
    const { node } = e
    console.log('🎯 [ConnectionPreview] 节点鼠标进入:', {
      nodeId: node.id,
      nodeType: node.getData()?.type || 'unknown',
      nodeLabel: node.getData()?.label || 'unlabeled',
      isBranchNode: this.isBranchNode(node)
    })
    
    // 高亮显示该节点的持久化预览线
    this.highlightPersistentPreviews(node, true)
  }

  /**
   * 处理节点鼠标离开事件
   * @param {Object} e - 事件对象
   */
  handleNodeMouseLeave(e) {
    const { node } = e
    console.log('🚪 [ConnectionPreview] 节点鼠标离开:', {
      nodeId: node.id,
      nodeType: node.getData()?.type || 'unknown'
    })
    
    // 取消高亮该节点的持久化预览线
    this.highlightPersistentPreviews(node, false)
  }

  /**
   * 高亮或取消高亮持久化预览线
   * @param {Object} node - 节点
   * @param {boolean} highlight - 是否高亮
   */
  highlightPersistentPreviews(node, highlight) {
    const nodeId = node.id
    const highlightStyle = this.layoutConfig.PREVIEW_STYLES.HIGHLIGHT
    const labelHighlightStyle = this.layoutConfig.LABEL_STYLES.HIGHLIGHT
    
    this.persistentPreviews.forEach((preview, key) => {
      if (key.startsWith(nodeId + '_')) {
        if (preview.line && this.graph.hasCell(preview.line)) {
          const isBranch = key.includes('_') && !key.endsWith('_single')
          const baseStyle = isBranch ? 
            this.layoutConfig.PREVIEW_STYLES.PERSISTENT.BRANCH : 
            this.layoutConfig.PREVIEW_STYLES.PERSISTENT.SINGLE
          
          preview.line.setAttrs({
            line: highlight ? {
              ...baseStyle,
              stroke: highlightStyle.stroke,
              strokeWidth: highlightStyle.strokeWidth,
              opacity: highlightStyle.opacity
            } : baseStyle
          })
        }
        
        if (preview.label && this.graph.hasCell(preview.label)) {
          const isBranch = key.includes('_') && !key.endsWith('_single')
          const baseLabelStyle = isBranch ? 
            this.layoutConfig.LABEL_STYLES.BRANCH : 
            this.layoutConfig.LABEL_STYLES.SINGLE
          
          preview.label.setAttrs({
            body: {
              opacity: highlight ? labelHighlightStyle.opacity : 0.8
            },
            text: {
              fill: highlight ? labelHighlightStyle.textColor : baseLabelStyle.textColor
            }
          })
        }
      }
    })
  }

  /**
   * 高亮显示吸附目标
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID（可选）
   */
  highlightSnapTarget(sourceNodeId, branchId) {
    const key = branchId ? `${sourceNodeId}_${branchId}` : `${sourceNodeId}_single`
    const preview = this.persistentPreviews.get(key)
    const snapStyle = this.layoutConfig.PREVIEW_STYLES.SNAP
    
    if (preview && preview.line) {
      // 临时高亮预览线
      preview.line.setAttrs({
        line: {
          stroke: snapStyle.stroke,
          strokeWidth: snapStyle.strokeWidth,
          opacity: snapStyle.opacity
        }
      })
      
      // 指定时间后恢复原样
      setTimeout(() => {
        if (preview.line && this.graph.hasCell(preview.line)) {
          const isBranch = !!branchId
          const baseStyle = isBranch ? 
            this.layoutConfig.PREVIEW_STYLES.PERSISTENT.BRANCH : 
            this.layoutConfig.PREVIEW_STYLES.PERSISTENT.SINGLE
          
          preview.line.setAttrs({
            line: baseStyle
          })
        }
      }, this.layoutConfig.SNAP_CONFIG.HIGHLIGHT_DURATION)
    }
  }

  /**
   * 添加新节点时创建持久化预览线
   * @param {Object} e - 事件对象
   */
  onNodeAdded(e) {
    const node = e.node || e
    
    // 确保node是有效的节点对象
    if (!node || typeof node.getData !== 'function') {
      console.warn('⚠️ [ConnectionPreview] 无效的节点对象:', node)
      return
    }
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 详细的调试信息
    console.log('🔍 [ConnectionPreview] 节点添加详细信息:', {
      nodeId: node.id,
      nodeType: nodeType,
      nodeData: nodeData,
      isStartNode: nodeType === 'start',
      isBeginNode: nodeType === 'begin',
      isPreviewNode: nodeData.isPersistentPreview || nodeData.isPreview,
      hasExisting: this.hasExistingPreview(node.id)
    })
    
    // 立即检查是否应该跳过，避免不必要的日志
    const shouldSkip = this.shouldSkipPreview(node, nodeData, nodeType)
    const skipReason = shouldSkip ? this.getSkipReason(nodeData, nodeType) : null
    
    console.log('🚫 [ConnectionPreview] 跳过检查结果:', {
      nodeId: node.id,
      nodeType: nodeType,
      shouldSkip: shouldSkip,
      skipReason: skipReason
    })
    
    if (shouldSkip) {
      console.log(`⏭️ [ConnectionPreview] 跳过节点 ${node.id} (${nodeType}): ${skipReason}`)
      return
    }
    
    console.log('➕ [ConnectionPreview] 新节点添加:', {
      nodeId: node.id,
      nodeType: nodeType || 'unknown',
      nodeData: nodeData
    })
    
    // 延迟创建预览线，确保节点完全初始化，并避免循环
    setTimeout(() => {
      // 再次检查节点是否仍然存在且有效
      if (this.graph.hasCell(node) && !this.hasExistingPreview(node.id)) {
        console.log('⏰ [ConnectionPreview] 延迟创建预览线:', {
          nodeId: node.id,
          nodeType: nodeType,
          stillExists: this.graph.hasCell(node),
          noExistingPreview: !this.hasExistingPreview(node.id)
        })
        this.createPersistentPreview(node)
      } else {
        console.log('❌ [ConnectionPreview] 取消延迟创建:', {
          nodeId: node.id,
          nodeType: nodeType,
          stillExists: this.graph.hasCell(node),
          hasExistingPreview: this.hasExistingPreview(node.id)
        })
      }
    }, 100)
  }

  /**
   * 移除节点时清理持久化预览线
   * @param {Object} e - 事件对象
   */
  onNodeRemoved(e) {
    const node = e.node || e
    const nodeId = node.id || node
    
    console.log('🗑️ [ConnectionPreview] 节点删除:', {
      nodeId,
      nodeType: node.getData?.()?.type
    })
    
    // 安全检查：确保graph和node存在
    if (!this.graph || !node) {
      console.warn('⚠️ [ConnectionPreview] 节点删除失败: graph或node不存在')
      return
    }
    
    // 获取连接到被删除节点的所有边
    const incomingEdges = this.graph.getIncomingEdges(node)
    
    // 安全检查：确保incomingEdges存在且为数组
    if (incomingEdges && Array.isArray(incomingEdges)) {
      // 为每个连接到被删除节点的源节点恢复预览线
      incomingEdges.forEach(edge => {
        const sourceNode = edge.getSourceNode()
        const sourcePort = edge.getSourcePortId()
        
        if (sourceNode && sourcePort) {
          console.log('🔄 [ConnectionPreview] 恢复源节点预览线:', {
            sourceNodeId: sourceNode.id,
            sourcePort,
            deletedNodeId: nodeId
          })
          
          // 延迟执行，确保边已经被删除
          setTimeout(() => {
            this.restorePreviewLineForConnection(sourceNode, sourcePort)
          }, 100)
        }
      })
    } else {
      console.log('ℹ️ [ConnectionPreview] 节点无输入连接或连接信息无效')
    }
    
    // 清理该节点的所有持久化预览线
    this.removePersistentPreviewsForNode(nodeId)
  }

  /**
   * 处理边连接事件
   * @param {Object} e - 事件对象
   */
  handleEdgeConnected(e) {
    const { edge } = e
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()
    const sourcePort = edge.getSourcePortId()
    
    console.log('🔗 [ConnectionPreview] 连接创建:', {
      edgeId: edge.id,
      sourceNodeId: sourceNode?.id,
      targetNodeId: targetNode?.id,
      sourcePort
    })
    
    if (sourceNode && targetNode && sourcePort) {
      // 删除对应的预览线
      this.removePreviewLineForConnection(sourceNode, sourcePort)
      
      // 如果是分流节点，处理智能连接
      if (this.isBranchNode(sourceNode) && this.branchManager.isSimplifiedMode(sourceNode)) {
        this.handleSmartConnection(edge, sourceNode)
      }
    }
  }

  /**
   * 删除连接对应的预览线
   * @param {Object} sourceNode - 源节点
   * @param {string} sourcePort - 源端口ID
   */
  removePreviewLineForConnection(sourceNode, sourcePort) {
    const nodeId = sourceNode.id
    
    console.log('🗑️ [ConnectionPreview] 删除连接对应的预览线:', {
      nodeId,
      sourcePort
    })
    
    if (this.isBranchNode(sourceNode)) {
      // 分流节点：删除特定分支的预览线
      const branches = this.branchManager.getNodeBranches(sourceNode)
      // 由于所有预览线都使用统一的out端口，需要根据连接的目标位置来确定分支
      const connections = this.graph.getConnectedEdges(sourceNode, { outgoing: true })
      
      // 找到对应的分支预览线并删除
      branches.forEach((branch, index) => {
        const previewKey = `${nodeId}_${branch.id}`
        
        console.log('🌿 [ConnectionPreview] 删除分支预览线:', {
          previewKey,
          branchId: branch.id,
          branchLabel: branch.label
        })
        
        this.removePersistentPreview(nodeId, branch.id)
      })
    } else {
      // 普通节点：删除单一预览线
      const previewKey = `${nodeId}_single`
      
      console.log('📝 [ConnectionPreview] 删除单一预览线:', {
        previewKey
      })
      
      this.removePersistentPreview(nodeId, null)
    }
  }

  /**
   * 处理边删除事件
   * @param {Object} e - 事件对象
   */
  handleEdgeRemoved(e) {
    const { edge } = e
    const sourceNode = edge.getSourceNode()
    const sourcePort = edge.getSourcePortId()
    
    console.log('❌ [ConnectionPreview] 连接删除:', {
      edgeId: edge.id,
      sourceNodeId: sourceNode?.id,
      sourcePort
    })
    
    if (sourceNode && sourcePort) {
      // 恢复对应的预览线
      this.restorePreviewLineForConnection(sourceNode, sourcePort)
    }
  }

  /**
   * 恢复连接删除后的预览线
   * @param {Object} sourceNode - 源节点
   * @param {string} sourcePort - 源端口ID
   */
  restorePreviewLineForConnection(sourceNode, sourcePort) {
    const nodeId = sourceNode.id
    
    console.log('🔄 [ConnectionPreview] 恢复连接删除后的预览线:', {
      nodeId,
      sourcePort
    })
    
    if (this.isBranchNode(sourceNode)) {
      // 分流节点：检查是否需要恢复分支预览线
      const branches = this.branchManager.getNodeBranches(sourceNode)
      
      // 检查节点是否还有其他连接
      if (!this.hasAnyOutgoingConnections(sourceNode)) {
        // 如果没有任何连接，恢复所有分支的预览线
        branches.forEach((branch, index) => {
          console.log('🌿 [ConnectionPreview] 恢复分支预览线:', {
            branchId: branch.id,
            branchLabel: branch.label
          })
          
          this.createSingleBranchPreview(sourceNode, branch, index)
        })
      }
    } else {
      // 普通节点：恢复单一预览线
      const previewKey = `${nodeId}_single`
      
      // 检查节点是否还有其他连接
      if (!this.hasAnyOutgoingConnections(sourceNode)) {
        console.log('📝 [ConnectionPreview] 恢复单一预览线:', {
          previewKey
        })
        
        this.createPersistentSinglePreview(sourceNode, sourceNode.getPosition(), sourceNode.getSize())
      }
    }
  }

  /**
   * 检查节点的特定端口是否有连接
   * @param {Object} node - 节点
   * @param {string} portId - 端口ID
   * @returns {boolean} 是否有连接
   */
  hasConnectionForPort(node, portId) {
    const edges = this.graph.getConnectedEdges(node, { outgoing: true })
    // 由于统一使用out端口，检查是否有任何输出连接
    return edges.some(edge => edge.getSourcePortId() === 'out')
  }

  /**
   * 检查节点是否有任何输出连接
   * @param {Object} node - 节点
   * @returns {boolean} 是否有输出连接
   */
  hasAnyOutgoingConnections(node) {
    const edges = this.graph.getConnectedEdges(node, { outgoing: true })
    return edges.length > 0
  }

  /**
   * 创建单个分支的预览线
   * @param {Object} node - 节点
   * @param {Object} branch - 分支信息
   * @param {number} branchIndex - 分支索引
   */
  createSingleBranchPreview(node, branch, branchIndex) {
    const branches = this.branchManager.getNodeBranches(node)
    const position = calculateBranchPreviewPosition(node, branches, branchIndex)
    const style = this.layoutConfig.PREVIEW_STYLES.PERSISTENT.BRANCH
    const labelStyle = this.layoutConfig.LABEL_STYLES.BRANCH
    
    const previewLine = this.graph.addEdge({
      source: {
        cell: node.id,
        port: 'out' // 统一使用out端口作为出口
      },
      target: {
        x: position.end.x,
        y: position.end.y
      },
      router: {
        name: 'manhattan',
        args: {
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      },
      attrs: {
        line: {
          ...style,
          'data-preview-type': 'branch',
          'data-node-id': node.id,
          'data-branch-id': branch.id
        }
      },
      zIndex: 999,
      data: {
        isPersistentPreview: true,
        branchId: branch.id,
        sourceNodeId: node.id,
        snapZone: position.snapZone
      }
    })

    // 创建分支标签
    const label = this.graph.addNode({
      x: position.end.x - labelStyle.width / 2,
      y: position.end.y + 5,
      width: labelStyle.width,
      height: labelStyle.height,
      shape: 'rect',
      attrs: {
        body: {
          fill: labelStyle.fill,
          stroke: labelStyle.stroke,
          strokeWidth: 1,
          rx: 10,
          ry: 10,
          opacity: 0.8
        },
        text: {
          text: branch.label,
          fontSize: labelStyle.fontSize,
          fill: labelStyle.textColor,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle'
        }
      },
      zIndex: 1000,
      data: {
        isPersistentPreview: true,
        branchId: branch.id,
        sourceNodeId: node.id
      }
    })

    this.persistentPreviews.set(`${node.id}_${branch.id}`, { line: previewLine, label })
    
    console.log('✅ [ConnectionPreview] 单个分支预览线创建完成:', {
      nodeId: node.id,
      branchId: branch.id,
      branchLabel: branch.label
    })
  }

  /**
   * 处理节点选中事件
   * @param {Object} e - 事件对象
   */
  handleNodeSelected(e) {
    const { node } = e
    if (this.isBranchNode(node)) {
      this.branchManager.togglePortMode(node, 'detailed')
    }
  }

  /**
   * 处理节点取消选中事件
   * @param {Object} e - 事件对象
   */
  handleNodeUnselected(e) {
    const { node } = e
    if (this.isBranchNode(node)) {
      this.branchManager.togglePortMode(node, 'auto')
    }
  }

  /**
   * 判断是否为分流节点
   * @param {Object} node - 节点
   * @returns {boolean} 是否为分流节点
   */
  isBranchNode(node) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    const isBranch = ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
    
    console.log('🔍 [ConnectionPreview] 节点类型检查:', {
      nodeId: node.id,
      nodeType,
      nodeData,
      isBranchNode: isBranch
    })
    
    return isBranch
  }

  /**
   * 显示连接预览（保留原有功能，用于特殊情况）
   * @param {Object} node - 节点
   */
  showConnectionPreview(node) {
    console.log('📊 [ConnectionPreview] 显示临时预览线:', {
      nodeId: node.id,
      nodeType: node.getData()?.type || 'unknown'
    })
    
    // 在持久化预览的基础上，可以添加额外的临时预览效果
    this.highlightPersistentPreviews(node, true)
  }

  /**
   * 隐藏连接预览（保留原有功能）
   * @param {Object} node - 节点
   */
  hideConnectionPreview(node) {
    console.log('📊 [ConnectionPreview] 隐藏临时预览线:', {
      nodeId: node.id
    })
    
    // 取消临时预览效果
    this.highlightPersistentPreviews(node, false)
  }

  /**
   * 创建预览线条
   * @param {Object} node - 源节点
   * @param {Object} branch - 分支信息
   * @param {number} index - 分支索引
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   * @returns {Object} 预览线条元素
   */
  createPreviewLine(node, branch, index, nodePosition, nodeSize) {
    console.log('🎨 [ConnectionPreview] 创建分支预览线:', {
      nodeId: node.id,
      branchId: branch.id,
      branchLabel: branch.label,
      index,
      nodePosition,
      nodeSize
    })
    
    const startX = nodePosition.x + nodeSize.width
    const startY = nodePosition.y + nodeSize.height / 2
    
    // 计算预览线的终点位置
    const endX = startX + 150
    const endY = startY + (index - (this.branchManager.getNodeBranches(node).length - 1) / 2) * 40
    
    console.log('📏 [ConnectionPreview] 预览线坐标:', {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    })
    
    // 创建预览线条
    const previewLine = this.graph.addEdge({
      source: { x: startX, y: startY },
      target: { x: endX, y: endY },
      attrs: {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          opacity: 0.6
        }
      },
      zIndex: 1000,
      data: {
        isPreview: true,
        branchId: branch.id,
        sourceNodeId: node.id
      }
    })

    // 创建分支标签
    const label = this.graph.addNode({
      x: endX - 20,
      y: endY - 10,
      width: 80,
      height: 20,
      shape: 'rect',
      attrs: {
        body: {
          fill: '#f0f0f0',
          stroke: '#5F95FF',
          strokeWidth: 1,
          rx: 10,
          ry: 10,
          opacity: 0.9
        },
        text: {
          text: branch.label,
          fontSize: 12,
          fill: '#333',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle'
        }
      },
      zIndex: 1001,
      data: {
        isPreview: true,
        branchId: branch.id,
        sourceNodeId: node.id
      }
    })

    console.log('✨ [ConnectionPreview] 分支预览线创建完成:', {
      lineId: previewLine.id,
      labelId: label.id,
      branchLabel: branch.label
    })

    return { line: previewLine, label }
  }

  /**
   * 创建单条预览线（用于普通节点或详细模式的分流节点）
   * @param {Object} node - 源节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   * @returns {Object} 预览线条元素
   */
  createSinglePreviewLine(node, nodePosition, nodeSize) {
    console.log('🎨 [ConnectionPreview] 创建单条预览线:', {
      nodeId: node.id,
      nodeType: node.getData()?.type || 'unknown',
      nodePosition,
      nodeSize
    })
    
    const startX = nodePosition.x + nodeSize.width
    const startY = nodePosition.y + nodeSize.height / 2
    
    // 计算预览线的终点位置
    const endX = startX + 150
    const endY = startY
    
    console.log('📏 [ConnectionPreview] 单条预览线坐标:', {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    })
    
    // 创建预览线条
    const previewLine = this.graph.addEdge({
      source: { x: startX, y: startY },
      target: { x: endX, y: endY },
      attrs: {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          opacity: 0.6
        }
      },
      zIndex: 1000,
      data: {
        isPreview: true,
        sourceNodeId: node.id
      }
    })

    // 为普通节点创建简单标签
    let label = null
    if (!this.isBranchNode(node)) {
      console.log('🏷️ [ConnectionPreview] 为普通节点创建标签')
      label = this.graph.addNode({
        x: endX - 20,
        y: endY - 10,
        width: 60,
        height: 20,
        shape: 'rect',
        attrs: {
          body: {
            fill: '#f0f0f0',
            stroke: '#5F95FF',
            strokeWidth: 1,
            rx: 10,
            ry: 10,
            opacity: 0.9
          },
          text: {
            text: '连接',
            fontSize: 12,
            fill: '#333',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          }
        },
        zIndex: 1001,
        data: {
          isPreview: true,
          sourceNodeId: node.id
        }
      })
    }

    console.log('✨ [ConnectionPreview] 单条预览线创建完成:', {
      lineId: previewLine.id,
      labelId: label?.id || 'none',
      hasLabel: !!label
    })

    return { line: previewLine, label }
  }

  /**
   * 处理智能连接
   * @param {Object} edge - 边
   * @param {Object} sourceNode - 源节点
   */
  handleSmartConnection(edge, sourceNode) {
    const targetNode = edge.getTargetNode()
    if (!targetNode) return

    const branches = this.branchManager.getNodeBranches(sourceNode)
    
    // 如果只有一个分支，直接连接
    if (branches.length === 1) {
      this.updateEdgeForBranch(edge, branches[0])
      return
    }

    // 多分支情况：显示分支选择器或自动分配
    this.showBranchSelector(edge, sourceNode, targetNode, branches)
  }

  /**
   * 显示分支选择器
   * @param {Object} edge - 边
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   * @param {Array} branches - 分支数组
   */
  showBranchSelector(edge, sourceNode, targetNode, branches) {
    // 这里可以实现一个分支选择器UI
    // 暂时使用第一个分支作为默认选择
    const selectedBranch = branches[0]
    this.updateEdgeForBranch(edge, selectedBranch)
    
    // 更新边的数据，记录分支信息
    edge.setData({
      ...edge.getData(),
      branchId: selectedBranch.id,
      branchLabel: selectedBranch.label
    })
  }

  /**
   * 为特定分支更新边
   * @param {Object} edge - 边
   * @param {Object} branch - 分支信息
   */
  updateEdgeForBranch(edge, branch) {
    // 更新边的样式以反映分支信息
    edge.setAttrs({
      line: {
        stroke: this.getBranchColor(branch.type),
        strokeWidth: 2
      }
    })

    // 添加边标签
    edge.setLabels([{
      attrs: {
        text: {
          text: branch.label,
          fontSize: 12,
          fill: '#666'
        },
        rect: {
          fill: '#fff',
          stroke: '#ccc',
          strokeWidth: 1,
          rx: 3,
          ry: 3
        }
      }
    }])
  }

  /**
   * 获取分支颜色
   * @param {string} branchType - 分支类型
   * @returns {string} 颜色值
   */
  getBranchColor(branchType) {
    const colors = {
      'audience': '#52c41a',
      'event': '#1890ff',
      'ab-test': '#722ed1',
      'default': '#5F95FF'
    }
    return colors[branchType] || colors.default
  }

  /**
   * 隐藏所有预览
   */
  hideAllPreviews() {
    console.log('🧹 [ConnectionPreview] 开始清理所有预览线:', {
      previewCount: this.previewLines.size,
      currentPreviewNode: this.currentPreviewNode?.id || 'none'
    })
    
    let removedCount = 0
    this.previewLines.forEach(({ line, label }, key) => {
      console.log(`🗑️ [ConnectionPreview] 移除预览线 ${key}:`, {
        lineId: line?.id || 'none',
        labelId: label?.id || 'none'
      })
      
      if (line && this.graph.hasCell(line)) {
        this.graph.removeCell(line)
        removedCount++
      }
      if (label && this.graph.hasCell(label)) {
        this.graph.removeCell(label)
        removedCount++
      }
    })
    
    this.previewLines.clear()
    this.currentPreviewNode = null
    this.isPreviewMode = false
    
    console.log('✅ [ConnectionPreview] 预览线清理完成:', {
      removedElements: removedCount,
      isPreviewMode: this.isPreviewMode
    })
  }

  /**
   * 销毁管理器
   */
  destroy() {
    console.log('🔥 [ConnectionPreview] 销毁连接预览管理器')
    
    // 清理所有预览线
    this.hideAllPreviews()
    this.clearAllPersistentPreviews()
    
    // 移除所有事件监听器
    if (this.graph) {
      this.graph.off('node:mouseenter')
      this.graph.off('node:mouseleave')
      this.graph.off('edge:connected')
      this.graph.off('node:selected')
      this.graph.off('node:unselected')
      this.graph.off('node:move')
      this.graph.off('node:moved')
      this.graph.off('node:mousedown')
      this.graph.off('node:mouseup')
      this.graph.off('blank:mouseup')
      this.graph.off('node:added')
      this.graph.off('node:removed')
    }
    
    // 清理引用
    this.graph = null
    this.branchManager = null
    this.previewLines.clear()
    this.persistentPreviews.clear()
    this.currentPreviewNode = null
    this.dragNode = null
  }

  /**
   * 获取当前活跃的预览线
   * @returns {Array} 预览线数组
   */
  getActivePreviewLines() {
    const activeLines = []
    
    // 收集持久化预览线
    this.persistentPreviews.forEach(({ line, label }, key) => {
      if (line && this.graph && this.graph.hasCell(line)) {
        const lineData = line.getData() || {}
        const sourceNodeId = lineData.sourceNodeId
        const branchId = lineData.branchId
        
        if (sourceNodeId) {
          const sourceNode = this.graph.getCellById(sourceNodeId)
          
          // 构造预览线信息
          const previewLine = {
            id: line.id,
            sourceNode: sourceNode,
            targetNode: null, // 持久化预览线没有目标节点
            sourcePort: branchId ? `out-${branchId}` : 'out-0',
            targetPort: null,
            type: 'persistent',
            branchId: branchId,
            position: {
              start: line.getSourcePoint(),
              end: line.getTargetPoint()
            }
          }
          
          activeLines.push(previewLine)
        }
      }
    })
    
    // 收集临时预览线
    this.previewLines.forEach(({ line, label }, key) => {
      if (line && this.graph && this.graph.hasCell(line)) {
        const lineData = line.getData() || {}
        const sourceNodeId = lineData.sourceNodeId
        
        if (sourceNodeId) {
          const sourceNode = this.graph.getCellById(sourceNodeId)
          
          const previewLine = {
            id: line.id,
            sourceNode: sourceNode,
            targetNode: null,
            sourcePort: 'out-0',
            targetPort: null,
            type: 'temporary',
            position: {
              start: line.getSourcePoint(),
              end: line.getTargetPoint()
            }
          }
          
          activeLines.push(previewLine)
        }
      }
    })
    
    console.log('[ConnectionPreview] 获取活跃预览线:', {
      persistentCount: this.persistentPreviews.size,
      temporaryCount: this.previewLines.size,
      totalActiveLines: activeLines.length
    })
    
    return activeLines
  }

  /**
   * 清理指定节点的预览线
   * @param {string} nodeId - 节点ID
   */
  clearNodePreviews(nodeId) {
    console.log('🧹 [ConnectionPreview] 清理节点预览线:', nodeId)
    
    let removedCount = 0
    
    // 清理持久化预览线
    const keysToRemove = []
    this.persistentPreviews.forEach(({ line, label }, key) => {
      if (key.startsWith(nodeId + '_')) {
        keysToRemove.push(key)
        
        if (line && this.graph && this.graph.hasCell(line)) {
          this.graph.removeCell(line)
          removedCount++
        }
        if (label && this.graph && this.graph.hasCell(label)) {
          this.graph.removeCell(label)
          removedCount++
        }
      }
    })
    
    keysToRemove.forEach(key => {
      this.persistentPreviews.delete(key)
    })
    
    // 清理临时预览线
    const tempKeysToRemove = []
    this.previewLines.forEach(({ line, label }, key) => {
      const lineData = line?.getData() || {}
      if (lineData.sourceNodeId === nodeId) {
        tempKeysToRemove.push(key)
        
        if (line && this.graph && this.graph.hasCell(line)) {
          this.graph.removeCell(line)
          removedCount++
        }
        if (label && this.graph && this.graph.hasCell(label)) {
          this.graph.removeCell(label)
          removedCount++
        }
      }
    })
    
    tempKeysToRemove.forEach(key => {
      this.previewLines.delete(key)
    })
    
    console.log('✅ [ConnectionPreview] 节点预览线清理完成:', {
      nodeId,
      removedElements: removedCount,
      persistentKeysRemoved: keysToRemove.length,
      tempKeysRemoved: tempKeysToRemove.length
    })
  }

  /**
   * 清理所有持久化预览线
   */
  clearAllPersistentPreviews() {
    console.log('🧹 [ConnectionPreview] 清理所有持久化预览线:', {
      count: this.persistentPreviews.size
    })
    
    this.persistentPreviews.forEach(({ line, label }, key) => {
      if (line && this.graph && this.graph.hasCell(line)) {
        this.graph.removeCell(line)
      }
      if (label && this.graph && this.graph.hasCell(label)) {
        this.graph.removeCell(label)
      }
    })
    
    this.persistentPreviews.clear()
  }
}

export default ConnectionPreviewManager