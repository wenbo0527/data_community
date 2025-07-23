/**
 * 连接预览管理器（统一版本）
 * 合并了原 ConnectionPreviewManager 和 EnhancedPreviewLineManager 的功能
 * 支持：
 * - 分流节点的连接预览和智能连接功能
 * - 上下结构布局、持久化显示和拖拽自动吸附
 * - 增强预设线管理，可拖拽预设线和自动结束节点功能
 */
import { 
  VERTICAL_LAYOUT_CONFIG, 
  calculateBranchPreviewPosition, 
  calculateSinglePreviewPosition,
  getBestSnapPosition 
} from './verticalLayoutConfig.js'
import { createEndNodeData, getEndNodeX6Config, isEndNode, calculateEndNodePosition } from './EndNodeConfig.js'

// 预设线状态枚举
export const PreviewLineStates = {
  PENDING: 'pending',           // 等待连接（只有一端连接）
  DRAGGING: 'dragging',         // 拖拽中
  CONNECTED: 'connected',       // 已连接（两端都连接）
  END_NODE: 'end_node',        // 转为结束节点
  PARTIAL_CONNECTED: 'partial'  // 部分连接（只有source端连接）
}

// 节点状态枚举
export const NodeStates = {
  CONFIGURED: 'configured',   // 已配置
  CONNECTED: 'connected',     // 已连接
  END_NODE: 'end_node',      // 结束节点
  DRAGGING: 'dragging'       // 拖拽中
}

export class ConnectionPreviewManager {
  constructor(graph, branchManager, layoutEngine = null) {
    this.graph = graph
    this.branchManager = branchManager
    this.layoutEngine = layoutEngine
    
    // 原有的预览线管理
    this.previewLines = new Map() // 存储预览线条
    this.persistentPreviews = new Map() // 存储持久化预览线
    this.isPreviewMode = false
    this.currentPreviewNode = null
    this.dragNode = null
    this.snapDistance = VERTICAL_LAYOUT_CONFIG.SNAP_CONFIG.DISTANCE
    this.moveUpdateTimer = null // 拖拽更新防抖定时器
    
    // 增强预览线管理（原 EnhancedPreviewLineManager 功能）
    this.draggablePreviewLines = new Map() // 可拖拽的预设线
    this.endNodes = new Set() // 结束节点集合
    this.dragHandler = null // 拖拽处理器
    this.currentDragLine = null // 当前拖拽的线
    
    // 拖拽状态管理
    this.isDragging = false // 是否正在拖拽
    this.dragStartPosition = null // 拖拽开始位置
    this.currentSnapTarget = null // 当前吸附目标
    
    // 使用垂直布局配置
    this.layoutConfig = VERTICAL_LAYOUT_CONFIG
    
    console.log('🎯 统一预览线管理器初始化完成')
    
    this.initEventListeners()
    this.initPersistentPreviews()
    this.initEnhancedDragEvents()
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
   * 初始化增强拖拽事件监听（原 EnhancedPreviewLineManager 功能）
   */
  initEnhancedDragEvents() {
    console.log('🎮 [统一预览线管理器] 初始化增强拖拽事件监听器')
    
    // 监听鼠标移动和释放事件
    document.addEventListener('mousemove', this.handleEnhancedMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleEnhancedMouseUp.bind(this))
    
    // 监听节点配置完成事件
    this.graph.on('node:config-updated', this.handleNodeConfigUpdated.bind(this))
    
    console.log('✅ [统一预览线管理器] 增强拖拽事件监听器已绑定')
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
    // 跳过拖拽提示点（防止为拖拽提示点创建预览线）
    if (nodeData.isDragHint || nodeData.type === 'drag-hint' || nodeType === 'drag-hint') {
      console.log('⏭️ [统一预览线管理器] 跳过拖拽提示点，不创建预览线')
      return true
    }
    
    // 开始节点由增强预览线管理器处理，跳过传统预览线
    if (nodeType === 'start') {
      console.log('⏭️ [统一预览线管理器] 开始节点由增强功能处理，跳过传统预览线')
      return true
    }
    
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
    if (nodeData.isDragHint || nodeData.type === 'drag-hint' || nodeType === 'drag-hint') return '拖拽提示点'
    if (nodeType === 'start') return '开始节点（增强功能处理）'
    if (nodeType === 'end' || nodeType === 'finish') return '结束节点'
    if (nodeData.isPersistentPreview || nodeData.isPreview) return '预览线节点'
    if (!nodeType || nodeType === 'unknown') return '未知节点类型'
    return '其他原因'
  }

  /**
   * 验证节点是否适合创建预览线
   * @param {Object} node - 节点对象
   * @returns {boolean} 是否适合创建预览线
   */
  validateNodeForPreview(node) {
    if (!node) {
      console.warn('⚠️ [ConnectionPreview] 节点对象不存在')
      return false
    }
    
    if (!this.graph || !this.graph.hasCell(node)) {
      console.warn('⚠️ [ConnectionPreview] 节点不在图中:', node.id)
      return false
    }
    
    const nodeData = node.getData()
    if (!nodeData) {
      console.warn('⚠️ [ConnectionPreview] 节点数据不存在:', node.id)
      return false
    }
    
    // 检查是否是预览线节点（避免为预览线创建预览线）
    if (nodeData.isPersistentPreview || nodeData.isPreview) {
      console.log('⏭️ [ConnectionPreview] 跳过预览线节点:', node.id)
      return false
    }
    
    return true
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
        name: 'orth', // 使用更稳定的orth路由算法
        args: {
          padding: 10,
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      },
      // 确保预览线从端口开始，而不是节点中心
      connectionPoint: 'anchor',
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
    // 再次验证节点
    if (!this.validateNodeForPreview(node)) {
      return null
    }
    
    try {
      const nodeId = node.id
      const key = `${nodeId}_single`
      
      // 检查是否已存在预览线
      if (this.persistentPreviews.has(key)) {
        console.log('ℹ️ [ConnectionPreview] 预览线已存在，跳过创建:', key)
        return this.persistentPreviews.get(key)
      }
      
      // 检查节点是否已有连接
      if (this.hasAnyOutgoingConnections(node)) {
        console.log('ℹ️ [ConnectionPreview] 节点已有连接，跳过预览线创建:', nodeId)
        return null
      }
      
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
          name: 'orth', // 使用更稳定的orth路由算法
          args: {
            padding: 10,
            startDirections: ['bottom'],
            endDirections: ['top']
          }
        },
        // 确保预览线从端口开始，而不是节点中心
        connectionPoint: 'anchor',
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

      const preview = { line: previewLine, label }
      this.persistentPreviews.set(key, preview)
      
      console.log('✅ [ConnectionPreview] 创建单一预览线成功:', key)
      return preview
      
    } catch (error) {
      console.error('❌ [ConnectionPreview] 创建单一预览线失败:', error)
      return null
    }
  }

  /**
   * 处理节点鼠标按下事件
   * @param {Object} e - 事件对象
   */
  handleNodeMouseDown(e) {
    const { node } = e
    const nodeData = node.getData() || {}
    
    // 检查是否是拖拽提示点激活状态
    if (this.isDragHintActive) {
      console.log('🎯 [统一预览线管理器] 拖拽提示点激活中，忽略节点拖拽事件')
      return
    }
    
    // 检查是否是拖拽提示点
    if (nodeData.isDragHint || nodeData.type === 'drag-hint') {
      console.log('🎯 [统一预览线管理器] 拖拽提示点被点击，阻止普通节点拖拽:', node.id)
      // X6 事件对象不支持 stopPropagation，直接返回即可
      return
    }
    
    this.isDragging = true
    this.dragNode = node
    
    console.log('🖱️ [ConnectionPreview] 开始拖拽节点:', {
      nodeId: node.id,
      nodeType: nodeData.type || 'unknown'
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
    
    // 验证节点是否有效
    if (!this.validateNodeForPreview(node)) {
      console.warn('⚠️ [ConnectionPreview] 拖拽的节点无效，跳过处理:', node?.id)
      return
    }
    
    // 清除之前的定时器
    if (this.moveUpdateTimer) {
      clearTimeout(this.moveUpdateTimer)
    }
    
    // 防抖处理，避免频繁更新预览线
    this.moveUpdateTimer = setTimeout(() => {
      if (this.validateNodeForPreview(node)) {
        const nodePosition = node.getPosition()
        const nodeSize = node.getSize()
        
        // 检查是否靠近任何预览线的吸附区域
        this.checkSnapToPreviewLines(node, nodePosition, nodeSize)
        
        // 更新该节点的持久化预览线位置
        this.updatePersistentPreviewPosition(node, nodePosition, nodeSize)
      }
    }, 16) // 约60fps的更新频率
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
    
    // 确定源端口
    const sourcePort = this.getSourcePort(sourceNode, branchId)
    
    // 创建连接边 - 使用端口连接
    const edge = this.graph.addEdge({
      source: {
        cell: sourceNodeId,
        port: sourcePort
      },
      target: {
        cell: targetNodeId,
        port: 'in'
      },
      router: {
        name: 'orth',
        args: {
          padding: 10
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      // 确保连接从端口开始，而不是节点中心
      connectionPoint: 'anchor',
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
    // 严格的节点验证
    if (!this.validateNodeForPreview(node)) {
      return
    }
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 跳过结束节点
    if (nodeType === 'end') return
    
    // 跳过开始节点 - 开始节点由增强预览线管理器处理
    if (nodeType === 'start') {
      console.log('⏭️ [统一预览线管理器] 开始节点移动，跳过传统预览线更新')
      return
    }
    
    try {
      // 先移除旧的预览线（使用安全删除）
      this.safeRemovePersistentPreviewsForNode(node.id)
      
      // 延迟创建新的预览线，确保删除操作完成
      setTimeout(() => {
        // 再次验证节点是否仍然存在
        if (this.validateNodeForPreview(node)) {
          if (this.isBranchNode(node)) {
            this.createPersistentBranchPreviews(node, nodePosition, nodeSize)
          } else {
            this.createPersistentSinglePreview(node, nodePosition, nodeSize)
          }
        }
      }, 50)
      
    } catch (error) {
      console.error('❌ [ConnectionPreview] 更新预览线位置失败:', error)
    }
  }

  /**
   * 安全删除指定节点的所有持久化预览线
   * @param {string} nodeId - 节点ID
   */
  safeRemovePersistentPreviewsForNode(nodeId) {
    console.log('🧹 [ConnectionPreview] 安全删除节点预览线:', nodeId)
    
    const keysToRemove = []
    
    try {
      this.persistentPreviews.forEach((preview, key) => {
        if (key.startsWith(nodeId + '_')) {
          keysToRemove.push(key)
        }
      })
      
      keysToRemove.forEach(key => {
        const preview = this.persistentPreviews.get(key)
        if (preview) {
          try {
            if (preview.line && this.graph && this.graph.hasCell(preview.line)) {
              this.graph.removeCell(preview.line)
            }
            if (preview.label && this.graph && this.graph.hasCell(preview.label)) {
              this.graph.removeCell(preview.label)
            }
          } catch (error) {
            console.warn('⚠️ [ConnectionPreview] 删除预览线元素失败:', error)
          }
          
          this.persistentPreviews.delete(key)
        }
      })
      
      console.log(`✅ [ConnectionPreview] 已安全删除 ${keysToRemove.length} 条预览线`)
      
    } catch (error) {
      console.error('❌ [ConnectionPreview] 安全删除预览线失败:', error)
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
    const nodeData = node.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type || 'unknown'
    
    console.log('🎯 [ConnectionPreview] 节点鼠标进入:', {
      nodeId: node.id,
      nodeType: nodeType,
      nodeLabel: nodeData.label || 'unlabeled',
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
    const nodeData = node.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type || 'unknown'
    
    console.log('🚪 [ConnectionPreview] 节点鼠标离开:', {
      nodeId: node.id,
      nodeType: nodeType
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
   * 添加新节点时创建持久化预览线（支持增强预览线）
   * @param {Object} e - 事件对象
   */
  onNodeAdded(e) {
    const node = e.node || e
    
    // 确保node是有效的节点对象
    if (!node || typeof node.getData !== 'function') {
      console.warn('⚠️ [统一预览线管理器] 无效的节点对象:', node)
      return
    }
    
    // 防重复处理：检查是否已经处理过这个节点
    if (this.processedNodes && this.processedNodes.has(node.id)) {
      console.log('⏭️ [统一预览线管理器] 节点已处理过，跳过重复处理:', node.id)
      return
    }
    
    // 初始化已处理节点集合
    if (!this.processedNodes) {
      this.processedNodes = new Set()
    }
    
    // 标记节点为已处理
    this.processedNodes.add(node.id)
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    console.log('🔍 [统一预览线管理器] 节点添加事件:', {
      nodeId: node.id,
      nodeType: nodeType,
      nodeData: nodeData
    })
    
    // 开始节点使用增强预览线功能
    if (nodeType === 'start') {
      console.log('🚀 [统一预览线管理器] 检测到开始节点，创建增强预览线')
      
      // 延迟创建，确保节点完全初始化
      setTimeout(() => {
        if (this.graph.hasCell(node)) {
          this.createEnhancedPreviewLinesForNode(node)
        }
      }, 100)
      return
    }
    
    // 其他节点使用传统的持久化预览线
    // 详细的调试信息
    console.log('🔍 [统一预览线管理器] 传统节点添加详细信息:', {
      nodeId: node.id,
      nodeType: nodeType,
      nodeData: nodeData,
      isPreviewNode: nodeData.isPersistentPreview || nodeData.isPreview,
      hasExisting: this.hasExistingPreview(node.id)
    })
    
    // 立即检查是否应该跳过，避免不必要的日志
    const shouldSkip = this.shouldSkipPreview(node, nodeData, nodeType)
    const skipReason = shouldSkip ? this.getSkipReason(nodeData, nodeType) : null
    
    console.log('🚫 [统一预览线管理器] 跳过检查结果:', {
      nodeId: node.id,
      nodeType: nodeType,
      shouldSkip: shouldSkip,
      skipReason: skipReason
    })
    
    if (shouldSkip) {
      console.log(`⏭️ [统一预览线管理器] 跳过节点 ${node.id} (${nodeType}): ${skipReason}`)
      return
    }
    
    console.log('➕ [统一预览线管理器] 新节点添加:', {
      nodeId: node.id,
      nodeType: nodeType || 'unknown',
      nodeData: nodeData
    })
    
    // 延迟创建预览线，确保节点完全初始化，并避免循环
    setTimeout(() => {
      // 再次检查节点是否仍然存在且有效
      if (this.graph.hasCell(node) && !this.hasExistingPreview(node.id)) {
        console.log('⏰ [统一预览线管理器] 延迟创建传统预览线:', {
          nodeId: node.id,
          nodeType: nodeType,
          stillExists: this.graph.hasCell(node),
          noExistingPreview: !this.hasExistingPreview(node.id)
        })
        this.createPersistentPreview(node)
      } else {
        console.log('❌ [统一预览线管理器] 取消延迟创建:', {
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
  onNodeRemoved(e, providedIncomingEdges = null) {
    const node = e.node || e
    const nodeId = node.id || node
    const nodeData = node.getData?.() || {}
    const nodeType = nodeData.nodeType || nodeData.type || 'unknown'
    
    console.log('🗑️ [ConnectionPreview] 处理节点删除:', {
      nodeId,
      nodeType: nodeType,
      providedIncomingEdges: !!providedIncomingEdges
    })
    
    // 清理已处理节点记录
    if (this.processedNodes && this.processedNodes.has(nodeId)) {
      this.processedNodes.delete(nodeId)
      console.log('🧹 [ConnectionPreview] 已清理节点处理记录:', nodeId)
    }
    
    try {
      // 1. 清理所有相关的预览线
      this.clearNodePreviews(nodeId)
      
      // 2. 清理持久化预览线
      this.clearPersistentPreviewsForNode(nodeId)
      
      // 3. 使用提供的传入边信息，或者重新获取（如果没有提供）
      let incomingEdges = providedIncomingEdges
      let outgoingEdges = null
      
      if (!incomingEdges && this.graph && node) {
        incomingEdges = this.graph.getIncomingEdges(node)
        outgoingEdges = this.graph.getOutgoingEdges(node)
      }
      
      // 4. 为失去连接的源节点恢复预览线
      if (incomingEdges && Array.isArray(incomingEdges)) {
        incomingEdges.forEach(edge => {
          const sourceNode = edge.getSourceNode()
          if (sourceNode && this.graph.hasCell(sourceNode)) {
            console.log('🔄 [ConnectionPreview] 为失去连接的源节点恢复预览线:', sourceNode.id)
            
            // 延迟恢复，确保删除操作完成
            setTimeout(() => {
              if (this.graph.hasCell(sourceNode)) {
                // 检查源节点是否为分流节点
                if (this.isBranchNode(sourceNode)) {
                  // 对于分流节点，只恢复失去连接的特定分支的预览线
                  this.restoreSpecificBranchPreview(sourceNode, edge)
                } else {
                  // 对于普通节点，恢复单一预览线
                  this.createPersistentPreview(sourceNode)
                }
              }
            }, 200)
          }
        })
      }
      
      console.log('✅ [ConnectionPreview] 节点删除处理完成:', nodeId)
      
    } catch (error) {
      console.error('❌ [ConnectionPreview] 节点删除处理失败:', error)
    }
  }

  /**
   * 恢复特定分支的预览线
   * @param {Object} sourceNode - 源节点（分流节点）
   * @param {Object} deletedEdge - 被删除的边
   */
  restoreSpecificBranchPreview(sourceNode, deletedEdge) {
    const branches = this.branchManager.getNodeBranches(sourceNode)
    const sourceNodeId = sourceNode.id
    
    console.log('🌿 [ConnectionPreview] 恢复特定分支预览线:', {
      sourceNodeId,
      branchCount: branches.length
    })
    
    // 获取当前所有有效的输出连接（过滤掉已删除的边）
    const allConnections = this.graph.getConnectedEdges(sourceNode, { outgoing: true })
    const currentConnections = allConnections.filter(edge => {
      // 确保边仍然在图中且有效
      return this.graph.hasCell(edge) && this.validateEdge(edge)
    })
    
    console.log('🔍 [ConnectionPreview] 当前有效连接数:', {
      total: allConnections.length,
      valid: currentConnections.length
    })
    
    // 计算被删除连接的目标位置，以确定对应的分支
    const deletedTargetPosition = deletedEdge.getTargetPoint()
    const sourcePosition = sourceNode.getPosition()
    const sourceSize = sourceNode.getSize()
    
    // 找到最接近被删除连接目标位置的分支
    let targetBranchIndex = 0
    let minDistance = Infinity
    
    branches.forEach((branch, index) => {
      const branchPosition = calculateBranchPreviewPosition(sourceNode, branches, index)
      const distance = Math.abs(branchPosition.end.x - deletedTargetPosition.x) + 
                      Math.abs(branchPosition.end.y - deletedTargetPosition.y)
      
      if (distance < minDistance) {
        minDistance = distance
        targetBranchIndex = index
      }
    })
    
    const targetBranch = branches[targetBranchIndex]
    const previewKey = `${sourceNodeId}_${targetBranch.id}`
    
    console.log('🎯 [ConnectionPreview] 目标分支信息:', {
      branchIndex: targetBranchIndex,
      branchId: targetBranch.id,
      branchLabel: targetBranch.label,
      previewKey
    })
    
    // 检查该分支是否已有预览线
    if (!this.persistentPreviews.has(previewKey)) {
      // 检查该分支是否还有其他有效连接
      const branchHasConnection = currentConnections.some(edge => {
        const targetPos = edge.getTargetPoint()
        const branchPos = calculateBranchPreviewPosition(sourceNode, branches, targetBranchIndex)
        const distance = Math.abs(branchPos.end.x - targetPos.x) + Math.abs(branchPos.end.y - targetPos.y)
        const hasConnection = distance < 50 // 50像素的容差范围
        
        if (hasConnection) {
          console.log('🔗 [ConnectionPreview] 发现分支连接:', {
            edgeId: edge.id,
            targetNodeId: edge.getTargetNode()?.id,
            distance,
            branchIndex: targetBranchIndex
          })
        }
        
        return hasConnection
      })
      
      if (!branchHasConnection) {
        console.log('🔄 [ConnectionPreview] 恢复分支预览线:', {
          branchId: targetBranch.id,
          branchLabel: targetBranch.label,
          branchIndex: targetBranchIndex
        })
        
        this.createSingleBranchPreview(sourceNode, targetBranch, targetBranchIndex)
      } else {
        console.log('⏭️ [ConnectionPreview] 分支仍有连接，跳过预览线恢复:', {
          branchId: targetBranch.id,
          branchLabel: targetBranch.label
        })
      }
    } else {
      console.log('⏭️ [ConnectionPreview] 分支预览线已存在，跳过恢复:', {
        branchId: targetBranch.id,
        previewKey
      })
    }
  }

  /**
   * 验证边的有效性
   * @param {Object} edge - 边对象
   * @returns {boolean} 边是否有效
   */
  validateEdge(edge) {
    if (!edge || !this.graph.hasCell(edge)) {
      return false
    }
    
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()
    
    return sourceNode && targetNode && 
           this.graph.hasCell(sourceNode) && 
           this.graph.hasCell(targetNode)
  }

  /**
   * 批量清理无效的边
   * @returns {number} 清理的边数量
   */
  cleanupInvalidEdges() {
    if (!this.graph) return 0
    
    const edges = this.graph.getEdges()
    const invalidEdges = []
    
    edges.forEach(edge => {
      if (!this.validateEdge(edge)) {
        invalidEdges.push(edge)
      }
    })
    
    console.log(`[ConnectionPreview] 发现 ${invalidEdges.length} 条无效边`)
    
    invalidEdges.forEach(edge => {
      if (this.graph.hasCell(edge)) {
        this.graph.removeCell(edge)
      }
    })
    
    return invalidEdges.length
  }

  /**
   * 清理指定节点的所有持久化预览线
   * @param {string} nodeId - 节点ID
   */
  clearPersistentPreviewsForNode(nodeId) {
    console.log('🧹 [ConnectionPreview] 清理节点的持久化预览线:', nodeId)
    
    const keysToRemove = []
    
    // 查找所有相关的预览线
    this.persistentPreviews.forEach((preview, key) => {
      if (key.startsWith(nodeId + '_') || key.includes('_' + nodeId + '_') || key.endsWith('_' + nodeId)) {
        keysToRemove.push(key)
      }
    })
    
    // 删除预览线
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
    
    console.log(`🗑️ [ConnectionPreview] 已清理 ${keysToRemove.length} 条持久化预览线`)
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
    const targetPort = edge.getTargetPortId()
    
    console.log('🔗 [ConnectionPreview] 连接创建事件:', {
      edgeId: edge.id,
      sourceNodeId: sourceNode?.id,
      targetNodeId: targetNode?.id,
      sourcePort,
      targetPort,
      sourceNodeType: sourceNode?.getData()?.nodeType || sourceNode?.getData()?.type,
      targetNodeType: targetNode?.getData()?.nodeType || targetNode?.getData()?.type
    })
    
    // 检查端口是否存在
    if (sourceNode && sourcePort) {
      const sourcePorts = sourceNode.getPorts ? sourceNode.getPorts() : []
      const sourcePortExists = sourcePorts.find(p => p.id === sourcePort)
      
      console.log('🔌 [ConnectionPreview] 源端口检查:', {
        sourcePort,
        sourcePortExists: !!sourcePortExists,
        availableSourcePorts: sourcePorts.map(p => ({ id: p.id, group: p.group }))
      })
    }
    
    if (targetNode && targetPort) {
      const targetPorts = targetNode.getPorts ? targetNode.getPorts() : []
      const targetPortExists = targetPorts.find(p => p.id === targetPort)
      
      console.log('🔌 [ConnectionPreview] 目标端口检查:', {
        targetPort,
        targetPortExists: !!targetPortExists,
        availableTargetPorts: targetPorts.map(p => ({ id: p.id, group: p.group }))
      })
    }
    
    if (sourceNode && targetNode && sourcePort) {
      console.log('✅ [ConnectionPreview] 连接有效，开始处理预览线')
      
      // 删除对应的预览线
      this.removePreviewLineForConnection(sourceNode, sourcePort)
      
      // 如果是分流节点，处理智能连接
      if (this.isBranchNode(sourceNode) && this.branchManager.isSimplifiedMode(sourceNode)) {
        console.log('🌿 [ConnectionPreview] 处理分流节点智能连接')
        this.handleSmartConnection(edge, sourceNode)
      }
    } else {
      console.error('❌ [ConnectionPreview] 连接无效，缺少必要信息:', {
        hasSourceNode: !!sourceNode,
        hasTargetNode: !!targetNode,
        hasSourcePort: !!sourcePort
      })
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
    
    if (!edge) return
    
    try {
      const sourceNode = edge.getSourceNode()
      const targetNode = edge.getTargetNode()
      const sourcePort = edge.getSourcePortId()
      
      console.log('❌ [ConnectionPreview] 连接删除:', {
        edgeId: edge.id,
        sourceNodeId: sourceNode?.id,
        targetNodeId: targetNode?.id,
        sourcePort
      })
      
      // 检查源节点和目标节点是否仍然存在
      if (sourceNode && this.graph.hasCell(sourceNode)) {
        // 为源节点恢复预览线
        setTimeout(() => {
          if (this.graph.hasCell(sourceNode)) {
            this.createPersistentPreview(sourceNode)
          }
        }, 100)
      }
      
    } catch (error) {
      console.error('❌ [ConnectionPreview] 处理边删除时发生错误:', error)
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
   * 检查节点是否有任何输出连接（排除预览线）
   * @param {Object} node - 节点
   * @returns {boolean} 是否有输出连接
   */
  hasAnyOutgoingConnections(node) {
    const edges = this.graph.getConnectedEdges(node, { outgoing: true })
    
    // 过滤掉预览线，只检查真实的业务连接
    const realConnections = edges.filter(edge => {
      const edgeData = edge.getData() || {}
      
      // 排除持久化预览线
      if (edgeData.isPersistentPreview) {
        return false
      }
      
      // 排除可拖拽预设线
      if (edgeData.type === 'draggable-preview' || edgeData.isDraggable) {
        return false
      }
      
      // 排除其他类型的预览线
      if (edgeData.isPreview || edgeData.preview) {
        return false
      }
      
      return true
    })
    
    console.log('🔍 [ConnectionPreview] 连接检查结果:', {
      nodeId: node.id,
      totalEdges: edges.length,
      realConnections: realConnections.length,
      hasRealConnections: realConnections.length > 0
    })
    
    return realConnections.length > 0
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
        name: 'orth',
        args: {
          padding: 10,
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      },
      // 确保预览线从端口开始，而不是节点中心
      connectionPoint: 'anchor',
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
    const startX = nodePosition.x + nodeSize.width
    const startY = nodePosition.y + nodeSize.height / 2
    
    // 计算预览线的终点位置
    const branchSpacing = this.config?.branchSpacing || 40 // 从配置获取分支间距，默认40
    const endX = startX + 150
    const endY = startY + (index - (this.branchManager.getNodeBranches(node).length - 1) / 2) * branchSpacing
    
    // 创建预览线条 - 使用统一的输出端口
    const previewLine = this.graph.addEdge({
      source: {
        cell: node.id,
        port: 'out' // 使用统一的输出端口，确保所有分支从同一位置开始
      },
      target: { x: endX, y: endY }, // 预览线的终点仍使用坐标，因为还没有目标节点
      // 确保预览线从端口开始，而不是节点中心
      connectionPoint: 'anchor',
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
    
    // 创建预览线条 - 使用端口连接
    const previewLine = this.graph.addEdge({
      source: {
        cell: node.id,
        port: 'out' // 使用节点的输出端口
      },
      target: { x: endX, y: endY }, // 预览线的终点仍使用坐标，因为还没有目标节点
      // 确保预览线从端口开始，而不是节点中心
      connectionPoint: 'anchor',
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
    
    // 清理定时器
    if (this.moveUpdateTimer) {
      clearTimeout(this.moveUpdateTimer)
      this.moveUpdateTimer = null
    }
    
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
            sourcePort: 'out', // 统一使用'out'端口
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
            sourcePort: 'out', // 统一使用'out'端口
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
   * 获取所有预览线（包括活跃和非活跃的）
   * @returns {Array} 所有预览线数组
   */
  getAllPreviewLines() {
    const allLines = []
    
    // 收集持久化预览线
    this.persistentPreviews.forEach(({ line, label }, key) => {
      if (line) {
        const lineData = line.getData() || {}
        const sourceNodeId = lineData.sourceNodeId
        const branchId = lineData.branchId
        
        if (sourceNodeId) {
          const sourceNode = this.graph ? this.graph.getCellById(sourceNodeId) : null
          
          // 构造预览线信息
          const previewLine = {
            id: line.id,
            sourceNode: sourceNode,
            targetNode: null, // 持久化预览线没有目标节点
            sourcePort: 'out', // 统一使用'out'端口
            targetPort: null,
            type: 'persistent',
            branchId: branchId,
            position: {
              start: line.getSourcePoint ? line.getSourcePoint() : null,
              end: line.getTargetPoint ? line.getTargetPoint() : null
            },
            isActive: this.graph ? this.graph.hasCell(line) : false
          }
          
          allLines.push(previewLine)
        }
      }
    })
    
    // 收集临时预览线
    this.previewLines.forEach(({ line, label }, key) => {
      if (line) {
        const lineData = line.getData() || {}
        const sourceNodeId = lineData.sourceNodeId
        
        if (sourceNodeId) {
          const sourceNode = this.graph ? this.graph.getCellById(sourceNodeId) : null
          
          const previewLine = {
            id: line.id,
            sourceNode: sourceNode,
            targetNode: null,
            sourcePort: 'out', // 统一使用'out'端口
            targetPort: null,
            type: 'temporary',
            position: {
              start: line.getSourcePoint ? line.getSourcePoint() : null,
              end: line.getTargetPoint ? line.getTargetPoint() : null
            },
            isActive: this.graph ? this.graph.hasCell(line) : false
          }
          
          allLines.push(previewLine)
        }
      }
    })
    
    // 收集可拖拽预览线
    this.draggablePreviewLines.forEach((previewData, previewLineId) => {
      if (previewData.line) {
        const sourceNode = this.graph ? this.graph.getCellById(previewData.sourceNodeId) : null
        
        const previewLine = {
          id: previewData.line.id,
          sourceNode: sourceNode,
          targetNode: null,
          sourcePort: 'out',
          targetPort: null,
          type: 'draggable',
          branchId: previewData.branchId,
          position: {
            start: previewData.line.getSourcePoint ? previewData.line.getSourcePoint() : null,
            end: previewData.line.getTargetPoint ? previewData.line.getTargetPoint() : null
          },
          isActive: this.graph ? this.graph.hasCell(previewData.line) : false
        }
        
        allLines.push(previewLine)
      }
    })
    
    console.log('[ConnectionPreview] 获取所有预览线:', {
      persistentCount: this.persistentPreviews.size,
      temporaryCount: this.previewLines.size,
      draggableCount: this.draggablePreviewLines.size,
      totalLines: allLines.length
    })
    
    return allLines
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

  // ==================== 增强预览线功能（原 EnhancedPreviewLineManager 功能）====================

  /**
   * 处理节点配置更新事件（增强功能）
   */
  handleNodeConfigUpdated(data) {
    const { node } = data
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    console.log('🔄 [统一预览线管理器] 节点配置已更新:', {
      nodeId: node.id,
      nodeType: nodeType
    })
    
    // 只为特定节点类型在配置完成后创建预览线
    const shouldCreatePreviewAfterConfig = [
      'ai-call',      // AI外呼
      'manual-call',  // 人工外呼
      'sms',          // 短信
      'wait'          // 等待节点
    ]
    
    if (shouldCreatePreviewAfterConfig.includes(nodeType)) {
      console.log('📝 [统一预览线管理器] 配置完成后创建预览线:', nodeType)
      this.createEnhancedPreviewLinesForNode(node)
    } else {
      console.log('⏭️ [统一预览线管理器] 节点类型不需要配置后创建预览线:', nodeType)
    }
  }

  /**
   * 为节点创建增强预览线（根据分流数）
   */
  createEnhancedPreviewLinesForNode(sourceNode) {
    console.log('🎯 [统一预览线管理器] 为节点创建增强预览线:', sourceNode.id)
    
    const nodeData = sourceNode.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 检查是否是分流节点
    if (this.isBranchNode(sourceNode)) {
      console.log('🌿 [统一预览线管理器] 检测到分流节点，创建分支预览线')
      this.createEnhancedBranchPreviewLines(sourceNode)
    } else {
      console.log('📝 [统一预览线管理器] 普通节点，创建单一预览线')
      this.createDraggablePreviewLine(sourceNode)
    }
  }

  /**
   * 为分流节点创建多条分支预览线（增强版）
   */
  createEnhancedBranchPreviewLines(sourceNode) {
    const nodeData = sourceNode.getData() || {}
    const branches = nodeData.branches || []
    
    if (branches.length === 0) {
      // 如果没有分支配置，创建默认的预览线
      this.createDraggablePreviewLine(sourceNode)
      return
    }
    
    // 为每个分支创建预览线
    branches.forEach((branch, index) => {
      this.createDraggablePreviewLine(sourceNode, branch.id, index, branches.length)
    })
  }

  /**
   * 创建可拖拽的预设线（增强功能）
   */
  createDraggablePreviewLine(sourceNode, branchId = null, branchIndex = 0, totalBranches = 1) {
    console.log('🚀 [ConnectionPreview] 开始创建可拖拽预设线:', {
      sourceNodeId: sourceNode.id,
      branchId,
      branchIndex,
      totalBranches,
      nodeData: sourceNode.getData()
    })
    
    // 检查节点是否已有连接
    if (this.hasExistingConnections(sourceNode, branchId)) {
      console.log('⚠️ [ConnectionPreview] 节点已有连接，跳过创建:', sourceNode.id)
      return null
    }

    // 获取源端口
    const sourcePort = this.getSourcePort(sourceNode, branchId)
    if (!sourcePort) {
      console.log('❌ [ConnectionPreview] 无法获取源端口，跳过创建:', sourceNode.id)
      return null
    }

    // 计算预设线终点位置 - 支持多分支布局
    const sourcePosition = sourceNode.getPosition()
    const sourceSize = sourceNode.getSize()
    
    // 计算节点底部中心点
    const nodeBottomCenter = {
      x: sourcePosition.x + sourceSize.width / 2,
      y: sourcePosition.y + sourceSize.height
    }
    
    // 计算多分支的水平偏移
    let xOffset = 0
    if (totalBranches > 1) {
      const spacing = 80 // 分支间距
      const totalWidth = (totalBranches - 1) * spacing
      const startX = -totalWidth / 2
      xOffset = startX + branchIndex * spacing
    }
    
    // 预设线终点位置：在节点下方100像素，支持水平偏移
    const endPosition = {
      x: nodeBottomCenter.x + xOffset,
      y: nodeBottomCenter.y + 100
    }

    console.log('📍 [ConnectionPreview] 计算连线位置:', {
      sourcePosition,
      sourceSize,
      nodeBottomCenter,
      xOffset,
      endPosition,
      sourcePort
    })

    // 计算分支颜色
    let lineColor = '#1890ff'
    if (totalBranches > 1 && branchId) {
      lineColor = this.getBranchColor(branchIndex)
    }

    // 根据节点类型确定初始状态
    const nodeData = sourceNode.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    let initialState, strokeColor, markerColor
    if (nodeType === 'start') {
      // 开始节点：等待连接状态（灰色）
      initialState = PreviewLineStates.PENDING
      strokeColor = '#d9d9d9'
      markerColor = '#d9d9d9'
    } else {
      // 其他节点：部分连接状态（橙色）
      initialState = PreviewLineStates.PARTIAL_CONNECTED
      strokeColor = '#fa8c16'
      markerColor = '#fa8c16'
    }

    // 创建预设线 - source在上方（节点端口），target在下方（可拖拽端点）
    const previewLineConfig = {
      id: `preview_${sourceNode.id}_${branchId || 'default'}_${Date.now()}`,
      shape: 'edge', // 使用标准边形状
      source: {
        cell: sourceNode.id,
        port: sourcePort
      },
      target: endPosition, // 这是底部的可拖拽端点
      // 确保预览线从端口开始，而不是节点中心
      connectionPoint: 'anchor',
      attrs: {
        line: {
          stroke: strokeColor,
          strokeWidth: 2,
          strokeDasharray: '5,5',
          cursor: 'grab',
          opacity: 0.8,
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
            fill: markerColor
          }
        }
      },
      zIndex: 1000,
      data: {
        type: 'preview-line',
        sourceNodeId: sourceNode.id,
        branchId: branchId,
        branchIndex: branchIndex,
        totalBranches: totalBranches,
        lineColor: lineColor,
        state: initialState,
        isDraggable: true
      }
    }
    
    console.log('⚙️ [ConnectionPreview] 预设线配置:', previewLineConfig)
    
    const previewLine = this.graph.addEdge(previewLineConfig)
    
    console.log('✅ [ConnectionPreview] 预设线创建成功:', {
      previewLineId: previewLine.id,
      sourceCell: previewLine.getSourceCellId(),
      sourcePort: previewLine.getSourcePortId(),
      targetPosition: previewLine.getTargetPoint()
    })

    // 添加拖拽能力
    this.makeDraggable(previewLine)
    
    // 添加拖拽提示 - 应该在底部的target位置
    this.addDragHint(previewLine, endPosition)
    
    // 存储到可拖拽预设线集合
    this.draggablePreviewLines.set(previewLine.id, {
      line: previewLine,
      sourceNode: sourceNode,
      branchId: branchId,
      branchIndex: branchIndex,
      totalBranches: totalBranches,
      state: initialState,
      sourceHintNode: null, // 源端拖拽提示节点
      targetHintNode: null  // 目标端拖拽提示节点
    })

    return previewLine
  }

  /**
   * 检查节点是否已有连接（增强版）
   */
  hasExistingConnections(sourceNode, branchId = null) {
    if (!sourceNode || !this.graph) return false
    
    const outgoingEdges = this.graph.getOutgoingEdges(sourceNode) || []
    
    // 过滤掉预览线，只检查实际连接
    const realConnections = outgoingEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isPersistentPreview && 
             !edgeData.isPreview && 
             edgeData.type !== 'preview-line'
    })
    
    return realConnections.length > 0
  }

  /**
   * 获取源端口（增强版）
   */
  getSourcePort(sourceNode, branchId = null) {
    const nodeData = sourceNode.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 统一使用'out'端口，从UI层面的同一个位置出发
    let sourcePort = 'out'
    
    // 添加详细日志
    console.log('🔍 [ConnectionPreview] 获取源端口:', {
      nodeId: sourceNode.id,
      nodeType,
      branchId,
      calculatedPort: sourcePort,
      availablePorts: sourceNode.getPorts ? sourceNode.getPorts().map(p => ({ id: p.id, group: p.group })) : 'N/A'
    })
    
    return sourcePort
  }

  /**
   * 获取分支颜色
   */
  getBranchColor(branchIndex) {
    const colors = [
      '#1890ff', // 蓝色
      '#52c41a', // 绿色
      '#fa8c16', // 橙色
      '#eb2f96', // 粉色
      '#722ed1', // 紫色
      '#13c2c2', // 青色
      '#faad14', // 金色
      '#f5222d'  // 红色
    ]
    return colors[branchIndex % colors.length]
  }

  /**
   * 使预设线可拖拽
   */
  makeDraggable(previewLine) {
    console.log('🎯 [统一预览线管理器] 为预设线配置拖拽能力:', previewLine.id)
    
    // 为预览线添加鼠标事件监听
    previewLine.on('mousedown', (e) => {
      console.log('🖱️ [统一预览线管理器] 预设线鼠标按下:', previewLine.id)
      this.startPreviewLineDrag(previewLine, e)
    })
    
    // 设置预览线的拖拽样式
    previewLine.attr('line/cursor', 'grab')
    
    // 添加悬停效果
    previewLine.on('mouseenter', () => {
      const currentAttrs = previewLine.getAttrs()
      previewLine.attr('line/strokeWidth', 3)
      previewLine.attr('line/opacity', 1)
    })
    
    previewLine.on('mouseleave', () => {
      if (!this.currentDragLine || this.currentDragLine.id !== previewLine.id) {
        previewLine.attr('line/strokeWidth', 2)
        previewLine.attr('line/opacity', 0.8)
      }
    })
  }

  /**
   * 添加拖拽提示
   */
  addDragHint(previewLine, position) {
    console.log('💡 [统一预览线管理器] 添加拖拽提示:', previewLine.id)
    
    // 在预览线的终点位置创建一个可视化的拖拽提示点
    const hintNode = this.graph.addNode({
      id: `hint_${previewLine.id}`,
      shape: 'circle',
      x: position.x - 6,
      y: position.y - 6,
      width: 12,
      height: 12,
      attrs: {
        body: {
          fill: '#1890ff',
          stroke: '#ffffff',
          strokeWidth: 2,
          opacity: 0.8,
          cursor: 'grab'
        }
      },
      zIndex: 1001,
      // 禁用默认的节点拖拽行为
      movable: false,
      data: {
        type: 'drag-hint',
        previewLineId: previewLine.id,
        isDragHint: true
      }
    })
    
    // 为拖拽提示点添加事件监听
    hintNode.on('mousedown', (e) => {
      console.log('🎯 [统一预览线管理器] 拖拽提示点被点击:', hintNode.id)
      
      // 设置标记，防止其他事件处理器处理此事件
      this.isDragHintActive = true
      
      // 启动预览线拖拽
      this.startPreviewLineDrag(previewLine, e)
    })
    
    // 添加悬停效果
    hintNode.on('mouseenter', () => {
      hintNode.attr('body/fill', '#40a9ff')
      hintNode.attr('body/opacity', 1)
    })
    
    hintNode.on('mouseleave', () => {
      if (!this.currentDragLine || this.currentDragLine.id !== previewLine.id) {
        hintNode.attr('body/fill', '#1890ff')
        hintNode.attr('body/opacity', 0.8)
      }
    })
    
    // 将提示点关联到预览线数据
    const previewData = this.draggablePreviewLines.get(previewLine.id)
    if (previewData) {
      previewData.targetHintNode = hintNode
    }
    
    return hintNode
  }

  /**
   * 开始预览线拖拽
   */
  startPreviewLineDrag(previewLine, event) {
    console.log('🚀 [统一预览线管理器] 开始拖拽预设线:', previewLine.id)
    
    // 设置当前拖拽状态
    this.currentDragLine = previewLine
    this.isDragging = true
    
    // 获取预览线数据
    const previewData = this.draggablePreviewLines.get(previewLine.id)
    if (!previewData) {
      console.warn('⚠️ [统一预览线管理器] 未找到预设线数据:', previewLine.id)
      return
    }
    
    // 记录拖拽开始位置 - 使用默认位置，因为 X6 事件对象可能没有 clientX/clientY
    this.dragStartPosition = {
      x: 0,
      y: 0
    }
    
    // 高亮预览线
    previewLine.attr('line/strokeWidth', 3)
    previewLine.attr('line/opacity', 1)
    previewLine.attr('line/cursor', 'grabbing')
    
    // 高亮拖拽提示点
    if (previewData.targetHintNode) {
      previewData.targetHintNode.attr('body/fill', '#40a9ff')
      previewData.targetHintNode.attr('body/opacity', 1)
      previewData.targetHintNode.attr('body/cursor', 'grabbing')
    }
    
    console.log('✅ [统一预览线管理器] 拖拽开始，当前位置:', this.dragStartPosition)
  }

  /**
   * 增强鼠标移动处理
   */
  handleEnhancedMouseMove(event) {
    if (!this.isDragging || !this.currentDragLine) {
      return
    }
    
    // 获取当前鼠标位置
    const clientPoint = this.graph.clientToLocal(event.clientX, event.clientY)
    
    // 获取预览线数据
    const previewData = this.draggablePreviewLines.get(this.currentDragLine.id)
    if (!previewData) {
      return
    }
    
    // 更新预览线的终点位置
    const sourceNode = this.graph.getCell(previewData.sourceNodeId)
    if (!sourceNode) {
      return
    }
    
    const sourcePosition = sourceNode.getPosition()
    const sourceSize = sourceNode.getSize()
    
    // 计算源端口的实际位置（从节点底部中心的端口开始）
    const sourcePortPosition = {
      x: sourcePosition.x + sourceSize.width / 2,
      y: sourcePosition.y + sourceSize.height
    }
    
    console.log('🔄 [统一预览线管理器] 更新预览线路径:', {
      sourceNodeId: previewData.sourceNodeId,
      branchId: previewData.branchId,
      sourcePortPosition: sourcePortPosition,
      targetPosition: clientPoint
    })
    
    // 更新预览线路径 - 从端口位置开始
    this.currentDragLine.setVertices([
      { x: sourcePortPosition.x, y: sourcePortPosition.y },
      { x: clientPoint.x, y: clientPoint.y }
    ])
    
    // 更新拖拽提示点位置
    if (previewData.targetHintNode) {
      previewData.targetHintNode.setPosition(clientPoint.x - 6, clientPoint.y - 6)
    }
    
    // 检查是否靠近其他节点（吸附功能）
    this.checkSnapToNodes(clientPoint)
  }

  /**
   * 增强鼠标释放处理
   */
  handleEnhancedMouseUp(event) {
    if (!this.isDragging || !this.currentDragLine) {
      return
    }
    
    console.log('🏁 [统一预览线管理器] 拖拽结束:', this.currentDragLine.id)
    
    // 获取当前鼠标位置
    const clientPoint = this.graph.clientToLocal(event.clientX, event.clientY)
    
    // 获取预览线数据
    const previewData = this.draggablePreviewLines.get(this.currentDragLine.id)
    if (!previewData) {
      this.resetDragState()
      return
    }
    
    // 检查是否可以创建连接
    const targetNode = this.findTargetNodeAt(clientPoint)
    if (targetNode && this.canCreateConnection(previewData.sourceNodeId, targetNode.id)) {
      console.log('🔗 [统一预览线管理器] 创建连接:', {
        source: previewData.sourceNodeId,
        target: targetNode.id,
        branchId: previewData.branchId
      })
      
      // 创建实际连接
      this.createConnection(previewData.sourceNodeId, targetNode.id, previewData.branchId)
      
      // 移除预览线
      this.removeDraggablePreviewLine(this.currentDragLine.id)
    } else {
      // 恢复预览线到原始状态
      this.restorePreviewLineState(this.currentDragLine, previewData)
    }
    
    // 重置拖拽状态
    this.resetDragState()
  }

  /**
   * 检查节点吸附
   */
  checkSnapToNodes(currentPosition) {
    const snapDistance = 50 // 吸附距离
    let closestNode = null
    let minDistance = Infinity
    
    // 遍历所有节点，找到最近的可连接节点
    this.graph.getNodes().forEach(node => {
      if (node.getData()?.isDragHint) {
        return // 跳过拖拽提示点
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      const nodeCenter = {
        x: nodePosition.x + nodeSize.width / 2,
        y: nodePosition.y + nodeSize.height / 2
      }
      
      const distance = Math.sqrt(
        Math.pow(currentPosition.x - nodeCenter.x, 2) +
        Math.pow(currentPosition.y - nodeCenter.y, 2)
      )
      
      if (distance < snapDistance && distance < minDistance) {
        const previewData = this.draggablePreviewLines.get(this.currentDragLine.id)
        if (previewData && this.canCreateConnection(previewData.sourceNodeId, node.id)) {
          closestNode = node
          minDistance = distance
        }
      }
    })
    
    // 高亮最近的节点
    this.highlightSnapTarget(closestNode)
  }

  /**
   * 查找指定位置的目标节点
   */
  findTargetNodeAt(position) {
    const snapDistance = 50
    let targetNode = null
    let minDistance = Infinity
    
    this.graph.getNodes().forEach(node => {
      if (node.getData()?.isDragHint) {
        return // 跳过拖拽提示点
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      const nodeCenter = {
        x: nodePosition.x + nodeSize.width / 2,
        y: nodePosition.y + nodeSize.height / 2
      }
      
      const distance = Math.sqrt(
        Math.pow(position.x - nodeCenter.x, 2) +
        Math.pow(position.y - nodeCenter.y, 2)
      )
      
      if (distance < snapDistance && distance < minDistance) {
        targetNode = node
        minDistance = distance
      }
    })
    
    return targetNode
  }

  /**
   * 检查是否可以创建连接
   */
  canCreateConnection(sourceNodeId, targetNodeId) {
    if (sourceNodeId === targetNodeId) {
      return false // 不能连接自己
    }
    
    // 检查是否已存在连接
    const existingEdges = this.graph.getEdges()
    const hasConnection = existingEdges.some(edge => {
      const source = edge.getSourceCell()
      const target = edge.getTargetCell()
      return source?.id === sourceNodeId && target?.id === targetNodeId
    })
    
    return !hasConnection
  }

  /**
   * 创建实际连接
   */
  createConnection(sourceNodeId, targetNodeId, branchId = null) {
    const sourceNode = this.graph.getCell(sourceNodeId)
    const targetNode = this.graph.getCell(targetNodeId)
    
    if (!sourceNode || !targetNode) {
      console.warn('⚠️ [统一预览线管理器] 无法找到源节点或目标节点')
      return
    }
    
    const edgeId = `edge_${sourceNodeId}_${targetNodeId}_${Date.now()}`
    const sourcePort = this.getSourcePort(sourceNode, branchId)
    
    console.log('🔗 [ConnectionPreviewManager] 开始创建连接:', {
      sourceNodeId: sourceNodeId,
      targetNodeId: targetNodeId,
      sourcePort: sourcePort,
      targetPort: 'in',
      branchId: branchId,
      edgeId: edgeId
    })
    
    const edge = this.graph.addEdge({
      id: edgeId,
      source: { cell: sourceNodeId, port: sourcePort },
      target: { cell: targetNodeId, port: 'in' },
      router: {
        name: 'orth',
        args: {
          padding: 10
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      // 确保连接从端口开始
      connectionPoint: 'anchor',
      attrs: {
        line: {
          stroke: branchId ? this.getBranchColor(parseInt(branchId) - 1) : '#1890ff',
          strokeWidth: 2,
          targetMarker: {
            name: 'classic',
            size: 8
          }
        }
      },
      data: {
        branchId: branchId,
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId
      }
    })
    
    // 如果是分支连接，添加标签
    if (branchId) {
      edge.setLabels([{
        attrs: {
          text: {
            text: `分支${branchId}`,
            fontSize: 12,
            fill: '#666'
          }
        }
      }])
    }
    
    console.log('✅ [统一预览线管理器] 连接创建成功:', edgeId)
    return edge
  }

  /**
   * 恢复预览线状态
   */
  restorePreviewLineState(previewLine, previewData) {
    // 恢复预览线样式
    previewLine.attr('line/strokeWidth', 2)
    previewLine.attr('line/opacity', 0.8)
    previewLine.attr('line/cursor', 'grab')
    
    // 恢复拖拽提示点样式
    if (previewData.targetHintNode) {
      previewData.targetHintNode.attr('body/fill', '#1890ff')
      previewData.targetHintNode.attr('body/opacity', 0.8)
      previewData.targetHintNode.attr('body/cursor', 'grab')
    }
    
    // 恢复预览线到原始位置
    const sourceNode = this.graph.getCell(previewData.sourceNodeId)
    if (sourceNode) {
      const endPosition = this.calculatePreviewEndPosition(sourceNode, previewData.branchId)
      
      // 更新预览线路径 - 从端口位置开始
      const sourcePosition = sourceNode.getPosition()
      const sourceSize = sourceNode.getSize()
      const sourcePortPosition = {
        x: sourcePosition.x + sourceSize.width / 2,
        y: sourcePosition.y + sourceSize.height
      }
      
      console.log('🔄 [统一预览线管理器] 恢复预览线到端口位置:', {
        sourceNodeId: previewData.sourceNodeId,
        branchId: previewData.branchId,
        sourcePortPosition: sourcePortPosition,
        endPosition: endPosition
      })
      
      previewLine.setVertices([
        { x: sourcePortPosition.x, y: sourcePortPosition.y },
        { x: endPosition.x, y: endPosition.y }
      ])
      
      // 恢复拖拽提示点位置
      if (previewData.targetHintNode) {
        previewData.targetHintNode.setPosition(endPosition.x - 6, endPosition.y - 6)
      }
    }
  }

  /**
   * 重置拖拽状态
   */
  resetDragState() {
    this.isDragging = false
    this.currentDragLine = null
    this.dragStartPosition = null
    this.isDragHintActive = false // 重置拖拽提示点激活标记
    
    // 清除高亮
    this.highlightSnapTarget(null)
  }

  /**
   * 移除可拖拽预览线
   */
  removeDraggablePreviewLine(previewLineId) {
    const previewData = this.draggablePreviewLines.get(previewLineId)
    if (previewData) {
      // 移除预览线
      if (previewData.line && this.graph.hasCell(previewData.line)) {
        this.graph.removeCell(previewData.line)
      }
      
      // 移除拖拽提示点
      if (previewData.targetHintNode && this.graph.hasCell(previewData.targetHintNode)) {
        this.graph.removeCell(previewData.targetHintNode)
      }
      
      // 从映射中移除
      this.draggablePreviewLines.delete(previewLineId)
      
      console.log('🗑️ [统一预览线管理器] 已移除可拖拽预设线:', previewLineId)
    }
  }

  /**
   * 销毁管理器（增强版）
   */
  destroy() {
    console.log('🔥 [统一预览线管理器] 销毁连接预览管理器')
    
    // 清理定时器
    if (this.moveUpdateTimer) {
      clearTimeout(this.moveUpdateTimer)
      this.moveUpdateTimer = null
    }
    
    // 清理所有预览线
    this.hideAllPreviews()
    this.clearAllPersistentPreviews()
    
    // 清理增强预览线
    this.draggablePreviewLines.forEach(({ line }) => {
      if (line && this.graph && this.graph.hasCell(line)) {
        this.graph.removeCell(line)
      }
    })
    this.draggablePreviewLines.clear()
    
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
      this.graph.off('node:config-updated')
    }
    
    // 移除增强事件监听器
    document.removeEventListener('mousemove', this.handleEnhancedMouseMove.bind(this))
    document.removeEventListener('mouseup', this.handleEnhancedMouseUp.bind(this))
    
    // 清理引用
    this.graph = null
    this.branchManager = null
    this.layoutEngine = null
    this.previewLines.clear()
    this.persistentPreviews.clear()
    this.currentPreviewNode = null
    this.dragNode = null
    this.endNodes.clear()
    this.dragHandler = null
    this.currentDragLine = null
    
    // 拖拽状态变量
    this.isDragging = false
    this.dragStartPosition = null
    this.currentSnapTarget = null
    this.isDragHintActive = false // 拖拽提示点激活标记
  }
}

export default ConnectionPreviewManager