/**
 * 统一预览线管理器
 * 将持久化预览线和可拖拽预设线合并为一个统一的系统
 * 核心理念：一条预览线，多种状态
 */

// 分支标签生成工具类
class BranchLabelUtils {
  /**
   * 根据分支ID和索引生成默认标签
   * @param {string} branchId - 分支ID
   * @param {number} branchIndex - 分支索引
   * @param {string} nodeType - 节点类型
   * @returns {string} 生成的标签
   */
  static generateDefaultLabel(branchId, branchIndex, nodeType) {
    if (branchId.includes('audience') || nodeType === 'audience-split') {
      return branchId.includes('default') ? '未命中人群' : `人群${branchIndex + 1}`
    } else if (branchId.includes('event') || nodeType === 'event-split') {
      return branchIndex === 0 ? '是' : '否'
    } else if (branchId.includes('group') || branchId.includes('version') || nodeType === 'ab-test') {
      return branchIndex === 0 ? 'A组' : 'B组'
    } else {
      return `分支${branchIndex + 1}`
    }
  }

  /**
   * 验证并修复分支标签
   * @param {Object} branch - 分支对象
   * @param {number} branchIndex - 分支索引
   * @param {string} nodeType - 节点类型
   * @returns {Object} 修复后的分支对象
   */
  static validateAndFixBranchLabel(branch, branchIndex, nodeType) {
    // 对于人群分流，确保使用正确的人群名称
    if (nodeType === 'audience-split') {
      // 如果分支有crowdName属性，使用它作为标签
      if (branch.crowdName && branch.crowdName !== branch.label) {
        console.log('🔧 [分支标签工具] 修复人群分流标签:', {
          branchId: branch.id,
          oldLabel: branch.label,
          newLabel: branch.crowdName,
          branchIndex: branchIndex
        })
        branch.label = branch.crowdName
      }
      // 如果是默认分支（未命中人群），确保标签正确
      else if (branch.id === 'default_audience' || branch.id === 'default') {
        branch.label = '未命中人群'
      }
      // 如果没有标签，生成默认标签
      else if (!branch.label) {
        branch.label = this.generateDefaultLabel(branch.id, branchIndex, nodeType)
        console.log('🔧 [分支标签工具] 自动生成人群分流标签:', {
          branchId: branch.id,
          branchIndex: branchIndex,
          generatedLabel: branch.label
        })
      }
    } else {
      // 对于其他类型的节点，只在标签为空时修复
      if (!branch.label) {
        branch.label = this.generateDefaultLabel(branch.id, branchIndex, nodeType)
        console.log('🔧 [分支标签工具] 自动修复分支标签:', {
          branchId: branch.id,
          branchIndex: branchIndex,
          nodeType: nodeType,
          generatedLabel: branch.label
        })
      }
    }
    return branch
  }
}

// 性能优化工具类
class PerformanceUtils {
  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  static throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// 统一预览线状态枚举
export const UnifiedPreviewStates = {
  STATIC_DISPLAY: 'static_display',     // 静态显示（替代持久化预览线）
  INTERACTIVE: 'interactive',           // 可交互（节点配置完成后）
  DRAGGING: 'dragging',                // 拖拽中
  CONNECTED: 'connected',              // 已连接
  HIDDEN: 'hidden'                     // 隐藏状态
}

// 预览线类型枚举
export const PreviewLineTypes = {
  SINGLE: 'single',                    // 单一预览线
  BRANCH: 'branch'                     // 分支预览线
}

export class UnifiedPreviewLineManager {
  constructor(graph, branchManager, layoutConfig) {
    this.graph = graph
    this.branchManager = branchManager
    this.layoutConfig = layoutConfig
    
    // 统一存储所有预览线
    this.previewLines = new Map() // key: nodeId, value: PreviewLineInstance
    
    // 拖拽提示点存储
    this.dragHints = new Map() // key: hintId, value: hintNode
    
    // 节点配置状态管理
    this.nodeStates = new Map() // key: nodeId, value: configState
    
    // 拖拽相关状态
    this.isDragging = false
    this.currentDragLine = null
    this.dragStartPosition = null
    this.isDragHintActive = false
    
    // 事件监听器存储
    this.eventListeners = new Map()
    
    // 性能优化：缓存机制
    this.branchInfoCache = new Map() // key: nodeId, value: { branches, timestamp }
    this.positionCache = new Map() // key: nodeId, value: { position, timestamp }
    this.cacheTimeout = 5000 // 缓存5秒
    
    // 定期清理过期缓存
    this.cacheCleanupInterval = setInterval(() => {
      this.clearExpiredCache()
    }, 10000) // 每10秒清理一次过期缓存
    
    // 性能优化：防抖和节流函数
    this.debouncedUpdatePosition = PerformanceUtils.debounce(
      this.updatePreviewLinePosition.bind(this), 
      100
    )
    this.throttledRefreshAll = PerformanceUtils.throttle(
      this.refreshAllPreviewLines.bind(this), 
      200
    )
    
    console.log('🚀 [统一预览线管理器] 初始化完成 - 已启用性能优化')
  }

  /**
   * 添加事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  addEventListener(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType).push(callback)
    console.log('📡 [统一预览线管理器] 添加事件监听器:', eventType)
  }

  /**
   * 移除事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  removeEventListener(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      const listeners = this.eventListeners.get(eventType)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
        console.log('📡 [统一预览线管理器] 移除事件监听器:', eventType)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} eventType - 事件类型
   * @param {Object} eventData - 事件数据
   */
  emit(eventType, eventData) {
    if (this.eventListeners.has(eventType)) {
      const listeners = this.eventListeners.get(eventType)
      listeners.forEach(callback => {
        try {
          callback(eventData)
        } catch (error) {
          console.error('❌ [统一预览线管理器] 事件监听器执行错误:', error)
        }
      })
    }
  }

  /**
   * 初始化管理器
   */
  init() {
    this.setupEventListeners()
    this.initializeExistingNodes()
    console.log('✅ [统一预览线管理器] 初始化事件监听器和现有节点预览线')
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 节点相关事件
    this.graph.on('node:added', this.handleNodeAdded.bind(this))
    this.graph.on('node:removed', this.handleNodeRemoved.bind(this))
    this.graph.on('node:move', this.handleNodeMove.bind(this))
    this.graph.on('node:moved', this.handleNodeMoved.bind(this))
    this.graph.on('node:mousedown', this.handleNodeMouseDown.bind(this))
    this.graph.on('node:mouseup', this.handleNodeMouseUp.bind(this))
    
    // 边相关事件
    this.graph.on('edge:added', this.handleEdgeAdded.bind(this))
    this.graph.on('edge:removed', this.handleEdgeRemoved.bind(this))
    
    // 画布事件
    this.graph.on('blank:mouseup', this.handleBlankMouseUp.bind(this))
    
    // 全局鼠标事件（用于拖拽）
    document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this))
  }

  /**
   * 初始化现有节点的预览线
   */
  initializeExistingNodes() {
    const nodes = this.graph.getNodes()
    nodes.forEach(node => {
      if (this.shouldCreatePreviewLine(node)) {
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
      }
    })
  }

  /**
   * 创建统一预览线
   * @param {Object} node - 源节点
   * @param {string} initialState - 初始状态
   * @param {Object} options - 额外选项
   */
  createUnifiedPreviewLine(node, initialState = UnifiedPreviewStates.STATIC_DISPLAY, options = {}) {
    if (!this.shouldCreatePreviewLine(node)) {
      console.log('⏭️ [统一预览线管理器] 跳过预览线创建:', node.id)
      return null
    }

    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    console.log('✨ [统一预览线管理器] 创建统一预览线:', {
      nodeId: node.id,
      nodeType: nodeType,
      initialState: initialState,
      options: options
    })

    // 检查是否是分支节点，传递配置参数
    const isBranchNode = this.isBranchNode(node, options.config)
    
    if (isBranchNode) {
      return this.createBranchPreviewLines(node, initialState, options)
    } else {
      return this.createSinglePreviewLine(node, initialState, options)
    }
  }

  /**
   * 创建单一预览线
   * @param {Object} node - 源节点
   * @param {string} initialState - 初始状态
   * @param {Object} options - 额外选项
   */
  createSinglePreviewLine(node, initialState, options = {}) {
    const nodePosition = node.getPosition()
    const nodeSize = node.getSize()
    
    // 计算预览线终点位置
    const endPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
    
    // 创建预览线
    const previewLine = this.createBasicPreviewLine(node, endPosition, {
      type: PreviewLineTypes.SINGLE,
      ...options
    })

    // 检查预览线是否创建成功
    if (!previewLine) {
      console.error('❌ [统一预览线管理器] 单一预览线创建失败:', node.id)
      return null
    }

    // 创建预览线实例
    const previewInstance = {
      line: previewLine,
      sourceNode: node,
      state: initialState,
      type: PreviewLineTypes.SINGLE,
      dragHandler: null,
      hintNode: null,
      endPosition: endPosition
    }

    // 设置初始状态
    this.setPreviewLineState(previewInstance, initialState)
    
    // 存储预览线
    this.previewLines.set(node.id, previewInstance)
    
    console.log('✅ [统一预览线管理器] 单一预览线创建完成:', node.id)
    return previewInstance
  }

  /**
   * 创建分支预览线
   * @param {Object} node - 源节点
   * @param {string} initialState - 初始状态
   * @param {Object} options - 额外选项
   */
  createBranchPreviewLines(node, initialState, options = {}) {
    // 获取分支信息，优先使用传入的配置
    const branches = this.getNodeBranches(node, options.config)
    
    const previewInstances = []

    branches.forEach((branch, index) => {
      const endPosition = this.calculateBranchPreviewPosition(node, branches, index)
      
      // 创建分支预览线，传递分支标签
      const previewLine = this.createBasicPreviewLine(node, endPosition, {
        type: PreviewLineTypes.BRANCH,
        branchId: branch.id,
        branchIndex: index,
        totalBranches: branches.length,
        branchLabel: branch.label, // 传递分支标签
        ...options
      })

      // 检查预览线是否创建成功
      if (!previewLine) {
        console.error('❌ [统一预览线管理器] 分支预览线创建失败:', {
          nodeId: node.id,
          branchId: branch.id,
          branchIndex: index
        })
        return // 跳过这个分支，继续处理下一个
      }

      // 创建预览线实例
      const previewInstance = {
        line: previewLine,
        sourceNode: node,
        state: initialState,
        type: PreviewLineTypes.BRANCH,
        branchId: branch.id,
        branchLabel: branch.label, // 添加分支标签
        branchIndex: index,
        totalBranches: branches.length,
        dragHandler: null,
        hintNode: null,
        endPosition: endPosition,
        branchInfo: branch // 保存分支信息
      }

      // 设置初始状态
      this.setPreviewLineState(previewInstance, initialState)
      
      previewInstances.push(previewInstance)
    })

    // 存储分支预览线（使用复合键）
    this.previewLines.set(node.id, previewInstances)
    
    return previewInstances
  }

  /**
   * 创建单个分支预览线
   * @param {Object} node - 源节点
   * @param {Object} branch - 分支信息
   * @param {number} branchIndex - 分支索引
   * @param {number} totalBranches - 总分支数
   * @param {string} initialState - 初始状态
   */
  createBranchPreviewLine(node, branch, branchIndex, totalBranches, initialState) {
    console.log('🔧 [统一预览线管理器] 创建单个分支预览线:', {
      nodeId: node.id,
      branchId: branch.id,
      branchLabel: branch.label,
      branchIndex: branchIndex,
      totalBranches: totalBranches
    })

    // 计算分支预览线位置
    const branches = Array(totalBranches).fill(null).map((_, index) => {
      if (index === branchIndex) {
        return branch
      }
      return { id: `temp_${index}`, label: `分支${index + 1}` }
    })
    
    const endPosition = this.calculateBranchPreviewPosition(node, branches, branchIndex)
    
    // 创建分支预览线，传递分支标签
    const previewLine = this.createBasicPreviewLine(node, endPosition, {
      type: PreviewLineTypes.BRANCH,
      branchId: branch.id,
      branchIndex: branchIndex,
      totalBranches: totalBranches,
      branchLabel: branch.label
    })

    // 检查预览线是否创建成功
    if (!previewLine) {
      console.error('❌ [统一预览线管理器] 单个分支预览线创建失败:', {
        nodeId: node.id,
        branchId: branch.id,
        branchIndex: branchIndex
      })
      return null
    }

    // 创建预览线实例
    const previewInstance = {
      line: previewLine,
      sourceNode: node,
      state: initialState,
      type: PreviewLineTypes.BRANCH,
      branchId: branch.id,
      branchLabel: branch.label,
      branchIndex: branchIndex,
      totalBranches: totalBranches,
      dragHandler: null,
      hintNode: null,
      endPosition: endPosition,
      branchInfo: branch
    }

    // 设置初始状态
    this.setPreviewLineState(previewInstance, initialState)
    
    console.log('✅ [统一预览线管理器] 单个分支预览线创建成功:', {
      lineId: previewLine.id,
      branchId: branch.id,
      branchLabel: branch.label
    })
    
    return previewInstance
  }

  /**
   * 创建基础预览线
   * @param {Object} sourceNode - 源节点
   * @param {Object} endPosition - 终点位置
   * @param {Object} options - 选项
   */
  createBasicPreviewLine(sourceNode, endPosition, options = {}) {
    const { type, branchId, branchIndex = 0, totalBranches = 1, branchLabel } = options
    
    // 检查源节点是否存在于图中
    const graphNode = this.graph.getCellById(sourceNode.id)
    if (!graphNode || !graphNode.isNode()) {
      console.error('❌ [统一预览线管理器] 源节点不存在于图中:', {
        sourceNodeId: sourceNode.id,
        nodeExists: !!graphNode,
        isNode: graphNode ? graphNode.isNode() : false
      })
      return null
    }
    
    // 使用端口连接而不是坐标点，确保节点移动时预览线跟随移动
    console.log('📍 [统一预览线管理器] 使用端口连接创建预览线:', {
      nodeId: sourceNode.id,
      branchIndex: branchIndex,
      branchId: branchId,
      sourcePort: 'out',
      targetPosition: endPosition
    })
    
    // 生成唯一ID
    const lineId = `unified_preview_${sourceNode.id}_${branchId || 'single'}_${Date.now()}`
    
    // 基础预览线配置 - 使用端口连接确保节点移动时预览线跟随
    const edgeConfig = {
      id: lineId,
      shape: 'edge',
      source: {
        cell: sourceNode.id,
        port: 'out'  // 使用统一的输出端口，确保节点移动时预览线跟随
      },
      target: endPosition,
      router: {
        name: 'orth',
        args: {
          padding: 10,
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      },
      attrs: {
        line: {
          stroke: '#d9d9d9', // 默认灰色
          strokeWidth: 2,
          strokeDasharray: '5,5',
          opacity: 0.6,
          cursor: 'default',
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
            fill: '#d9d9d9'
          }
        }
      },
      zIndex: 1001,
      data: {
        type: 'unified-preview-line',
        sourceNodeId: sourceNode.id,
        previewType: type,
        branchId: branchId,
        branchIndex: branchIndex,
        totalBranches: totalBranches,
        isUnifiedPreview: true
      }
    }
    
    // 如果是分支节点且分支数大于1，添加标签
    if (totalBranches > 1 && branchLabel) {
      edgeConfig.labels = [{
        attrs: {
          text: {
            text: branchLabel,
            fill: '#333',
            fontSize: 14,
            fontWeight: 'bold',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          },
          rect: {
            ref: 'text',
            refX: -8,
            refY: -6,
            refWidth: '100%',
            refHeight: '100%',
            refWidth2: 16,
            refHeight2: 12,
            fill: '#fff',
            stroke: '#fa8c16',
            strokeWidth: 2,
            rx: 4,
            ry: 4
          }
        },
        position: 0.8 // 将标签放在靠近端点的位置（80%处）
      }]
    } else {
      // 无标签情况
    }
    
    // 创建预览线
    const previewLine = this.graph.addEdge(edgeConfig)

    // 强制设置标签样式（如果有标签）
    if (totalBranches > 1 && branchLabel) {
      setTimeout(() => {
        const labels = previewLine.getLabels()
        
        // 强制设置标签样式
        if (labels && labels.length > 0) {
          previewLine.setLabelAt(0, {
            attrs: {
              text: {
                text: branchLabel,
                fill: '#333',
                fontSize: 14,
                fontWeight: 'bold',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                visibility: 'visible'
              },
              rect: {
                fill: '#fff',
                stroke: '#fa8c16',
                strokeWidth: 2,
                rx: 4,
                ry: 4,
                visibility: 'visible'
              }
            },
            position: 0.8
          })
        }
      }, 100)
    }

    return previewLine
  }

  /**
   * 设置预览线状态
   * @param {Object} previewInstance - 预览线实例
   * @param {string} state - 目标状态
   */
  setPreviewLineState(previewInstance, state) {
    if (!previewInstance || !previewInstance.line) {
      console.warn('⚠️ [统一预览线管理器] 预览线实例无效')
      return
    }

    const { line } = previewInstance
    previewInstance.state = state

    console.log('🔄 [统一预览线管理器] 设置预览线状态:', {
      lineId: line.id,
      state: state
    })

    switch (state) {
      case UnifiedPreviewStates.STATIC_DISPLAY:
        this.configureStaticDisplay(previewInstance)
        break
        
      case UnifiedPreviewStates.INTERACTIVE:
        this.configureInteractive(previewInstance)
        break
        
      case UnifiedPreviewStates.DRAGGING:
        this.configureDragging(previewInstance)
        break
        
      case UnifiedPreviewStates.CONNECTED:
        this.configureConnected(previewInstance)
        break
        
      case UnifiedPreviewStates.HIDDEN:
        this.configureHidden(previewInstance)
        break
    }
  }

  /**
   * 配置静态显示状态（替代持久化预览线）
   */
  configureStaticDisplay(previewInstance) {
    const { line } = previewInstance
    
    line.attr({
      line: {
        stroke: '#d9d9d9',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.6,
        cursor: 'default',
        targetMarker: {
          fill: '#d9d9d9'
        }
      }
    })
    
    // 更新标签样式（如果有标签）
    this.updateLabelStyle(line, {
      text: { fill: '#999' },
      rect: { stroke: '#d9d9d9', fill: '#f5f5f5' }
    })
    
    // 移除交互能力
    this.removeInteractivity(previewInstance)
    
    console.log('📊 [统一预览线管理器] 配置为静态显示状态:', line.id)
  }

  /**
   * 配置交互状态（替代可拖拽预设线）
   */
  configureInteractive(previewInstance) {
    const { line, sourceNode } = previewInstance
    const nodeData = sourceNode.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 根据节点类型确定颜色
    let strokeColor, markerColor, labelColor
    if (nodeType === 'start') {
      // 开始节点：蓝色
      strokeColor = '#1890ff'
      markerColor = '#1890ff'
      labelColor = '#1890ff'
    } else {
      // 其他节点：橙色
      strokeColor = '#fa8c16'
      markerColor = '#fa8c16'
      labelColor = '#fa8c16'
    }
    
    line.attr({
      line: {
        stroke: strokeColor,
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.8,
        cursor: 'grab',
        targetMarker: {
          fill: markerColor
        }
      }
    })
    
    // 更新标签样式（如果有标签）
    this.updateLabelStyle(line, {
      text: { fill: labelColor },
      rect: { stroke: strokeColor, fill: '#fff' }
    })
    
    // 添加交互能力
    this.addInteractivity(previewInstance)
    
    console.log('🎯 [统一预览线管理器] 配置为交互状态:', line.id)
  }

  /**
   * 配置拖拽状态
   */
  configureDragging(previewInstance) {
    const { line } = previewInstance
    
    line.attr({
      line: {
        cursor: 'grabbing',
        opacity: 1.0
      }
    })
    
    // 更新标签样式（如果有标签）
    this.updateLabelStyle(line, {
      text: { fill: '#333' },
      rect: { stroke: '#1890ff', fill: '#e6f7ff' }
    })
    
    console.log('🖱️ [统一预览线管理器] 配置为拖拽状态:', line.id)
  }

  /**
   * 配置连接状态
   */
  configureConnected(previewInstance) {
    const { line } = previewInstance
    
    line.attr({
      line: {
        stroke: '#52c41a',
        opacity: 0.3,
        cursor: 'default'
      }
    })
    
    // 更新标签样式（如果有标签）
    this.updateLabelStyle(line, {
      text: { fill: '#52c41a' },
      rect: { stroke: '#52c41a', fill: '#f6ffed' }
    })
    
    // 移除交互能力
    this.removeInteractivity(previewInstance)
    
    console.log('🔗 [统一预览线管理器] 配置为连接状态:', line.id)
  }

  /**
   * 配置隐藏状态
   */
  configureHidden(previewInstance) {
    const { line } = previewInstance
    
    line.attr({
      line: {
        opacity: 0
      }
    })
    
    // 隐藏标签（如果有标签）
    this.updateLabelStyle(line, {
      text: { opacity: 0 },
      rect: { opacity: 0 }
    })
    
    // 移除交互能力
    this.removeInteractivity(previewInstance)
    
    console.log('👻 [统一预览线管理器] 配置为隐藏状态:', line.id)
  }

  /**
   * 更新标签样式
   * @param {Object} line - 预览线对象
   * @param {Object} styles - 标签样式配置
   */
  updateLabelStyle(line, styles) {
    const labels = line.getLabels()
    if (labels && labels.length > 0) {
      // 更新第一个标签的样式，使用正确的选择器
      const currentAttrs = labels[0].attrs || {}
      line.setLabelAt(0, {
        attrs: {
          text: {
            ...currentAttrs.text,
            ...styles.text
          },
          rect: {
            ...currentAttrs.rect,
            ...styles.rect
          }
        }
      })
    }
  }

  /**
   * 添加交互能力
   */
  addInteractivity(previewInstance) {
    const { line } = previewInstance
    
    // 添加拖拽提示点
    this.addDragHint(previewInstance)
    
    // 添加鼠标事件监听
    line.on('mousedown', (e) => {
      this.startPreviewLineDrag(previewInstance, e)
    })
  }

  /**
   * 移除交互能力
   */
  removeInteractivity(previewInstance) {
    const { line } = previewInstance
    
    // 移除拖拽提示点
    this.removeDragHint(previewInstance)
    
    // 移除事件监听
    line.off('mousedown')
  }

  /**
   * 添加拖拽提示点
   */
  addDragHint(previewInstance) {
    // 如果已存在拖拽提示点，先移除它
    if (previewInstance.hintNode) {
      console.log('🔄 [统一预览线管理器] 移除旧的拖拽提示点:', previewInstance.hintNode.id)
      this.removeDragHint(previewInstance)
    }

    const { line, branchId, branchLabel, sourceNode } = previewInstance
    let { endPosition } = previewInstance
    
    // 验证必要的信息
    if (!line || !sourceNode) {
      console.warn('⚠️ [统一预览线管理器] 无法创建拖拽提示点，缺少必要信息:', {
        hasLine: !!line,
        hasSourceNode: !!sourceNode,
        lineId: line?.id,
        sourceNodeId: sourceNode?.id
      })
      return
    }
    
    // 如果endPosition不存在或无效，从预览线获取当前终点
    if (!endPosition || (endPosition.x === undefined || endPosition.y === undefined)) {
      const targetPoint = line.getTargetPoint()
      if (targetPoint) {
        endPosition = {
          x: targetPoint.x,
          y: targetPoint.y
        }
        // 更新预览线实例的endPosition
        previewInstance.endPosition = endPosition
        
        console.log('🔄 [统一预览线管理器] 从预览线获取最新终点位置:', {
          lineId: line.id,
          endPosition: endPosition
        })
      } else {
        console.warn('⚠️ [统一预览线管理器] 无法获取预览线终点位置')
        return
      }
    }
    
    // 创建拖拽提示点
    const hintNode = this.graph.addNode({
      id: `hint_${line.id}`,
      shape: 'circle',
      x: endPosition.x - 6,
      y: endPosition.y - 6,
      width: 12,
      height: 12,
      attrs: {
        body: {
          fill: '#1890ff',
          stroke: '#fff',
          strokeWidth: 2,
          cursor: 'grab'
        }
      },
      zIndex: 1001,
      data: {
        isDragHint: true,
        type: 'drag-hint',
        parentPreviewLine: line.id,
        branchId: branchId, // 添加分支ID信息
        branchLabel: branchLabel, // 添加分支标签信息
        sourceNodeId: sourceNode?.id // 添加源节点ID信息
      }
    })

    // 添加拖拽事件
    hintNode.on('mousedown', (e) => {
      console.log('🎯 [统一预览线管理器] 拖拽提示点鼠标按下:', hintNode.id)
      this.isDragHintActive = true
      this.startPreviewLineDrag(previewInstance, e)
      
      // 阻止事件冒泡，防止触发画布的拖拽
      e.stopPropagation()
    })

    // 添加鼠标样式变化
    hintNode.on('mouseenter', () => {
      hintNode.setAttrs({
        body: {
          fill: '#4080FF',
          cursor: 'grabbing'
        }
      })
    })

    hintNode.on('mouseleave', () => {
      if (!this.isDragging) {
        hintNode.setAttrs({
          body: {
            fill: '#1890ff',
            cursor: 'grab'
          }
        })
      }
    })

    previewInstance.hintNode = hintNode
    
    console.log('🎯 [统一预览线管理器] 添加拖拽提示点:', {
      hintNodeId: hintNode.id,
      lineId: line.id,
      position: { x: endPosition.x, y: endPosition.y },
      branchId: branchId,
      branchLabel: branchLabel,
      sourceNodeId: sourceNode?.id
    })
  }

  /**
   * 移除拖拽提示点
   */
  removeDragHint(previewInstance) {
    if (previewInstance.hintNode) {
      this.graph.removeNode(previewInstance.hintNode)
      previewInstance.hintNode = null
    }
  }

  /**
   * 开始预览线拖拽
   */
  startPreviewLineDrag(previewInstance, event) {
    console.log('🖱️ [统一预览线管理器] 开始预览线拖拽:', previewInstance.line.id)
    console.log('🖱️ [统一预览线管理器] 事件对象:', event)
    
    this.isDragging = true
    this.currentDragLine = previewInstance
    
    // 获取初始位置 - X6事件对象结构
    const rect = this.graph.container.getBoundingClientRect()
    let clientX = 0, clientY = 0
    
    // 尝试从不同的事件属性获取鼠标位置
    if (event.clientX !== undefined && event.clientY !== undefined) {
      clientX = event.clientX
      clientY = event.clientY
    } else if (event.originalEvent) {
      clientX = event.originalEvent.clientX || 0
      clientY = event.originalEvent.clientY || 0
    } else if (event.e) {
      clientX = event.e.clientX || 0
      clientY = event.e.clientY || 0
    }
    
    this.dragStartPosition = {
      x: clientX,
      y: clientY
    }
    
    // 设置为拖拽状态
    this.setPreviewLineState(previewInstance, UnifiedPreviewStates.DRAGGING)
    
    // 更新拖拽提示点样式
    if (previewInstance.hintNode) {
      previewInstance.hintNode.setAttrs({
        body: {
          fill: '#ff4d4f',
          cursor: 'grabbing',
          strokeWidth: 3
        }
      })
    }
    
    console.log('✅ [统一预览线管理器] 拖拽状态已激活:', {
      lineId: previewInstance.line.id,
      isDragging: this.isDragging,
      startPosition: this.dragStartPosition,
      eventType: typeof event
    })
  }

  /**
   * 节点配置完成后的状态转换
   * @param {Object} node - 已配置的节点
   */
  onNodeConfigured(node) {
    const previewInstance = this.previewLines.get(node.id)
    if (previewInstance) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        previewInstance.forEach(instance => {
          this.setPreviewLineState(instance, UnifiedPreviewStates.INTERACTIVE)
        })
      } else {
        // 单一预览线
        this.setPreviewLineState(previewInstance, UnifiedPreviewStates.INTERACTIVE)
      }
      
      // 更新节点状态
      this.nodeStates.set(node.id, 'configured')
      
      console.log('🔄 [统一预览线管理器] 节点配置完成，预览线转为交互状态:', node.id)
    }
  }

  /**
   * 节点配置完成后创建预览线
   * @param {Object} node - 节点实例
   * @param {Object} config - 节点配置
   */
  async createPreviewLineAfterConfig(node, config = {}) {
    if (!node) return
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    console.log('🎯 [统一预览线管理器] 节点配置完成，创建预览线:', {
      nodeId: node.id,
      nodeType: nodeType,
      config: config
    })
    
    // 先清理已存在的预览线，避免重复创建
    if (this.previewLines.has(node.id)) {
      console.log('🧹 [统一预览线管理器] 清理已存在的预览线:', node.id)
      this.removePreviewLine(node.id)
    }
    
    // 标记节点为已配置
    const updatedNodeData = {
      ...nodeData,
      isConfigured: true,
      config: config,
      lastConfigured: Date.now()
    }
    
    node.setData(updatedNodeData)
    
    // 等待节点数据更新完成，确保图状态同步
    await this.waitForNodeSync(node)
    
    // 检查是否应该创建预览线（现在应该返回true，因为节点已配置）
    if (this.shouldCreatePreviewLine(node)) {
      // 根据节点类型和配置确定分支数
      const branchCount = this.calculateBranchCount(node, config)
      
      console.log('📊 [统一预览线管理器] 计算分支数:', {
        nodeId: node.id,
        nodeType: nodeType,
        branchCount: branchCount
      })
      
      // 创建预览线
      const result = await this.createUnifiedPreviewLineWithRetry(node, UnifiedPreviewStates.INTERACTIVE, {
        branchCount: branchCount,
        config: config
      })
      
      if (result) {
        console.log('✅ [统一预览线管理器] 配置完成后预览线创建成功:', node.id)
      } else {
        console.warn('⚠️ [统一预览线管理器] 配置完成后预览线创建失败:', node.id)
      }
    } else {
      console.log('⚠️ [统一预览线管理器] 节点不满足预览线创建条件:', node.id)
    }
  }

  /**
   * 等待节点同步到图中
   * @param {Object} node - 节点实例
   * @param {number} maxRetries - 最大重试次数
   * @param {number} delay - 每次重试的延迟（毫秒）
   */
  async waitForNodeSync(node, maxRetries = 5, delay = 50) {
    console.log(`🔄 [统一预览线管理器] 开始等待节点同步:`, {
      nodeId: node.id,
      maxRetries: maxRetries,
      delay: delay
    })
    
    for (let i = 0; i < maxRetries; i++) {
      const graphNode = this.graph.getCellById(node.id)
      const nodeExists = !!graphNode
      const isNode = graphNode ? graphNode.isNode() : false
      
      console.log(`🔍 [统一预览线管理器] 节点同步检查 (${i + 1}/${maxRetries}):`, {
        nodeId: node.id,
        nodeExists: nodeExists,
        isNode: isNode,
        graphNodeType: graphNode ? graphNode.constructor.name : 'N/A'
      })
      
      if (graphNode && graphNode.isNode()) {
        console.log('✅ [统一预览线管理器] 节点已同步到图中:', node.id)
        return true
      }
      
      if (i < maxRetries - 1) {
        console.log(`⏳ [统一预览线管理器] 等待节点同步 (${i + 1}/${maxRetries})，${delay}ms后重试:`, node.id)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    console.warn('⚠️ [统一预览线管理器] 节点同步超时:', {
      nodeId: node.id,
      maxRetries: maxRetries,
      totalWaitTime: maxRetries * delay
    })
    return false
  }

  /**
   * 带重试机制的预览线创建
   * @param {Object} node - 节点实例
   * @param {string} initialState - 初始状态
   * @param {Object} options - 选项
   * @param {number} maxRetries - 最大重试次数
   */
  async createUnifiedPreviewLineWithRetry(node, initialState, options = {}, maxRetries = 3) {
    console.log(`🔄 [统一预览线管理器] 开始重试创建预览线:`, {
      nodeId: node.id,
      maxRetries: maxRetries
    })
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔄 [统一预览线管理器] 预览线创建尝试 (${i + 1}/${maxRetries}):`, node.id)
        
        // 在每次重试前检查节点是否存在于图中
        const graphNode = this.graph.getCellById(node.id)
        if (!graphNode || !graphNode.isNode()) {
          console.warn(`⚠️ [统一预览线管理器] 重试前检查：节点不存在于图中 (${i + 1}/${maxRetries}):`, {
            nodeId: node.id,
            nodeExists: !!graphNode,
            isNode: graphNode ? graphNode.isNode() : false
          })
          
          if (i < maxRetries - 1) {
            // 等待一段时间后重试
            console.log(`⏳ [统一预览线管理器] 等待后重试 (${i + 1}/${maxRetries}):`, node.id)
            await new Promise(resolve => setTimeout(resolve, 200))
            continue
          } else {
            console.error(`❌ [统一预览线管理器] 所有重试后节点仍不存在:`, node.id)
            return null
          }
        }
        
        const result = this.createUnifiedPreviewLine(node, initialState, options)
        if (result) {
          console.log(`✅ [统一预览线管理器] 预览线创建成功 (${i + 1}/${maxRetries}):`, node.id)
          return result
        } else {
          console.warn(`⚠️ [统一预览线管理器] 预览线创建返回空值 (${i + 1}/${maxRetries}):`, node.id)
        }
      } catch (error) {
        console.warn(`🔄 [统一预览线管理器] 预览线创建异常 (${i + 1}/${maxRetries}):`, {
          nodeId: node.id,
          error: error.message,
          stack: error.stack
        })
      }
      
      if (i < maxRetries - 1) {
        // 等待一段时间后重试
        console.log(`⏳ [统一预览线管理器] 等待后重试 (${i + 1}/${maxRetries}):`, node.id)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    console.error('❌ [统一预览线管理器] 预览线创建重试失败:', node.id)
    return null
  }

  /**
   * 根据节点类型和配置计算分支数
   * @param {Object} node - 节点实例
   * @param {Object} config - 节点配置
   * @returns {number} 分支数量
   */
  calculateBranchCount(node, config = {}) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    switch (nodeType) {
      case 'audience-split':
        // 人群分流：根据配置的人群层数 + 1个未命中分支
        if (config.crowdLayers && Array.isArray(config.crowdLayers)) {
          return config.crowdLayers.length + 1
        } else if (config.branches && Array.isArray(config.branches)) {
          return config.branches.length
        }
        return 2 // 默认：1个分流 + 1个未命中
        
      case 'event-split':
        // 事件分流：固定2个分支（是/否）
        return 2
        
      case 'ab-test':
        // AB测试：根据配置的版本数，默认2个（A/B）
        if (config.versions && Array.isArray(config.versions)) {
          return config.versions.length
        } else if (config.branches && Array.isArray(config.branches)) {
          return config.branches.length
        }
        return 2 // 默认A/B两个版本
        
      default:
        // 其他节点类型：单一输出
        return 1
    }
  }

  /**
   * 配置取消后恢复预览线
   * @param {Object} cancelledNode - 被取消配置的节点实例
   */
  async restorePreviewLinesAfterCancel(cancelledNode) {
    if (!cancelledNode) return
    
    const cancelledNodeData = cancelledNode.getData() || {}
    const cancelledNodeType = cancelledNodeData.type || cancelledNodeData.nodeType
    
    console.log('🔄 [统一预览线管理器] 配置取消，检查需要恢复的预览线:', {
      cancelledNodeId: cancelledNode.id,
      cancelledNodeType: cancelledNodeType
    })
    
    // 查找所有已配置的源节点，这些节点可能需要恢复预览线
    const allNodes = this.graph.getNodes()
    const configuredSourceNodes = allNodes.filter(node => {
      const nodeData = node.getData() || {}
      const nodeType = nodeData.type || nodeData.nodeType
      
      // 检查是否是已配置的分支节点
      const isConfigured = nodeData.isConfigured || nodeData.config
      const isBranchNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
      
      return isConfigured && isBranchNode && node.id !== cancelledNode.id
    })
    
    console.log('🔍 [统一预览线管理器] 找到已配置的源节点:', {
      count: configuredSourceNodes.length,
      nodes: configuredSourceNodes.map(node => ({
        id: node.id,
        type: node.getData()?.type,
        isConfigured: node.getData()?.isConfigured
      }))
    })
    
    // 为每个已配置的源节点恢复预览线
    for (const sourceNode of configuredSourceNodes) {
      try {
        const sourceNodeData = sourceNode.getData() || {}
        const sourceNodeType = sourceNodeData.type || sourceNodeData.nodeType
        const sourceConfig = sourceNodeData.config || {}
        
        console.log('🔄 [统一预览线管理器] 恢复源节点预览线:', {
          sourceNodeId: sourceNode.id,
          sourceNodeType: sourceNodeType,
          hasExistingPreviewLine: this.previewLines.has(sourceNode.id)
        })
        
        // 如果源节点已经有预览线，先清理
        if (this.previewLines.has(sourceNode.id)) {
          console.log('🧹 [统一预览线管理器] 清理源节点已存在的预览线:', sourceNode.id)
          this.removePreviewLine(sourceNode.id)
        }
        
        // 等待节点同步
        await this.waitForNodeSync(sourceNode)
        
        // 检查是否应该创建预览线
        if (this.shouldCreatePreviewLine(sourceNode)) {
          // 根据节点类型和配置确定分支数
          const branchCount = this.calculateBranchCount(sourceNode, sourceConfig)
          
          console.log('📊 [统一预览线管理器] 恢复预览线分支数:', {
            sourceNodeId: sourceNode.id,
            sourceNodeType: sourceNodeType,
            branchCount: branchCount
          })
          
          // 创建预览线
          const result = await this.createUnifiedPreviewLineWithRetry(sourceNode, UnifiedPreviewStates.INTERACTIVE, {
            branchCount: branchCount,
            config: sourceConfig
          })
          
          if (result) {
            console.log('✅ [统一预览线管理器] 源节点预览线恢复成功:', sourceNode.id)
          } else {
            console.warn('⚠️ [统一预览线管理器] 源节点预览线恢复失败:', sourceNode.id)
          }
        } else {
          console.log('⚠️ [统一预览线管理器] 源节点不满足预览线创建条件:', sourceNode.id)
        }
      } catch (error) {
        console.error('❌ [统一预览线管理器] 恢复源节点预览线时出错:', {
          sourceNodeId: sourceNode.id,
          error: error.message,
          stack: error.stack
        })
      }
    }
    
    console.log('🔄 [统一预览线管理器] 配置取消后预览线恢复完成')
  }

  /**
   * 节点连接后的状态转换
   * @param {Object} node - 已连接的节点
   * @param {string} branchId - 连接的分支ID（可选）
   * @param {string} branchLabel - 连接的分支标签（可选）
   */
  onNodeConnected(node, branchId = null, branchLabel = null) {
    const previewInstance = this.previewLines.get(node.id)
    if (previewInstance) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线 - 只隐藏特定分支的预览线
        if (branchId) {
          const targetInstance = previewInstance.find(instance => 
            instance.branchId === branchId
          )
          if (targetInstance) {
            this.setPreviewLineState(targetInstance, UnifiedPreviewStates.HIDDEN)
            // 删除对应的拖拽提示点
            this.removeDragHint(targetInstance)
            console.log('🔄 [统一预览线管理器] 特定分支预览线已隐藏并删除拖拽提示点:', {
              nodeId: node.id,
              branchId: branchId,
              branchLabel: branchLabel
            })
          }
        } else {
          // 如果没有指定分支ID，隐藏所有分支预览线（向后兼容）
          previewInstance.forEach(instance => {
            this.setPreviewLineState(instance, UnifiedPreviewStates.HIDDEN)
            // 删除对应的拖拽提示点
            this.removeDragHint(instance)
          })
          console.log('🔄 [统一预览线管理器] 所有分支预览线已隐藏并删除拖拽提示点:', node.id)
        }
      } else {
        // 单一预览线
        this.setPreviewLineState(previewInstance, UnifiedPreviewStates.HIDDEN)
        // 删除对应的拖拽提示点
        this.removeDragHint(previewInstance)
        console.log('🔄 [统一预览线管理器] 单一预览线已隐藏并删除拖拽提示点:', {
          nodeId: node.id,
          branchLabel: branchLabel
        })
      }
    }
  }

  /**
   * 节点断开连接后的状态恢复
   * @param {Object} node - 断开连接的节点
   * @param {string} branchId - 断开连接的分支ID（可选）
   */
  onNodeDisconnected(node, branchId = null, branchLabel = null) {
    const previewInstance = this.previewLines.get(node.id)
    if (previewInstance) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线 - 只恢复特定分支的预览线
        if (branchId) {
          const targetInstance = previewInstance.find(instance => 
            instance.branchId === branchId
          )
          if (targetInstance) {
            // 如果有标签信息，更新预览线实例的标签
            if (branchLabel) {
              targetInstance.branchLabel = branchLabel
              
              // 更新预览线的标签显示
              this.updatePreviewLineLabel(targetInstance.line, branchLabel)
              
              console.log('🏷️ [统一预览线管理器] 恢复分支预览线标签:', {
                nodeId: node.id,
                branchId: branchId,
                branchLabel: branchLabel
              })
            }
            
            // 重新计算预览线的结束位置，确保拖拽提示点位置正确
            this.recalculatePreviewLineEndPosition(targetInstance)
            
            this.setPreviewLineState(targetInstance, UnifiedPreviewStates.INTERACTIVE)
            console.log('🔄 [统一预览线管理器] 特定分支预览线已恢复:', {
              nodeId: node.id,
              branchId: branchId,
              branchLabel: branchLabel,
              newEndPosition: targetInstance.endPosition
            })
          }
        } else {
          // 如果没有指定分支ID，恢复所有分支预览线（向后兼容）
          previewInstance.forEach(instance => {
            // 重新计算预览线的结束位置
            this.recalculatePreviewLineEndPosition(instance)
            this.setPreviewLineState(instance, UnifiedPreviewStates.INTERACTIVE)
          })
          console.log('🔄 [统一预览线管理器] 所有分支预览线已恢复:', node.id)
        }
      } else {
        // 单一预览线
        if (branchLabel) {
          previewInstance.branchLabel = branchLabel
          this.updatePreviewLineLabel(previewInstance.line, branchLabel)
        }
        
        // 重新计算预览线的结束位置，确保拖拽提示点位置正确
        this.recalculatePreviewLineEndPosition(previewInstance)
        
        this.setPreviewLineState(previewInstance, UnifiedPreviewStates.INTERACTIVE)
        console.log('🔄 [统一预览线管理器] 单一预览线已恢复:', {
          nodeId: node.id,
          branchLabel: branchLabel,
          newEndPosition: previewInstance.endPosition
        })
      }
    }
  }

  /**
   * 重新计算预览线的结束位置
   * @param {Object} previewInstance - 预览线实例
   */
  recalculatePreviewLineEndPosition(previewInstance) {
    const { line, sourceNode } = previewInstance
    
    if (!line || !sourceNode) {
      console.warn('⚠️ [统一预览线管理器] 无法重新计算结束位置，缺少必要信息')
      return
    }
    
    // 获取预览线的当前路径点
    const vertices = line.getVertices()
    let endPosition
    
    if (vertices && vertices.length > 0) {
      // 如果有路径点，使用最后一个路径点作为结束位置
      endPosition = vertices[vertices.length - 1]
    } else {
      // 如果没有路径点，使用预览线的目标点
      const targetPoint = line.getTargetPoint()
      endPosition = targetPoint || previewInstance.endPosition
    }
    
    // 更新预览线实例的结束位置
    previewInstance.endPosition = {
      x: endPosition.x,
      y: endPosition.y
    }
    
    console.log('📍 [统一预览线管理器] 重新计算预览线结束位置:', {
      lineId: line.id,
      oldEndPosition: previewInstance.endPosition,
      newEndPosition: endPosition,
      hasVertices: !!(vertices && vertices.length > 0),
      verticesCount: vertices ? vertices.length : 0
    })
  }

  /**
   * 更新预览线标签
   * @param {Object} line - 预览线对象
   * @param {string} branchLabel - 分支标签
   */
  updatePreviewLineLabel(line, branchLabel) {
    if (!line || !branchLabel) return
    
    console.log('🏷️ [统一预览线管理器] 更新预览线标签:', {
      lineId: line.id,
      branchLabel: branchLabel
    })
    
    // 创建标签配置
    const labelConfig = {
      attrs: {
        text: {
          text: branchLabel,
          fill: '#333',
          fontSize: 14,
          fontWeight: 'bold',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle'
        },
        rect: {
          ref: 'text',
          refX: -8,
          refY: -6,
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: 16,
          refHeight2: 12,
          fill: '#fff',
          stroke: '#fa8c16',
          strokeWidth: 2,
          rx: 4,
          ry: 4
        }
      },
      position: 0.8 // 将标签放在靠近端点的位置（80%处）
    }
    
    // 设置标签
    line.setLabels([labelConfig])
    
    // 强制设置标签样式
    setTimeout(() => {
      if (line && !line.removed) {
        const labels = line.getLabels()
        if (labels && labels.length > 0) {
          line.setLabelAt(0, {
            attrs: {
              text: {
                text: branchLabel,
                fill: '#333',
                fontSize: 14,
                fontWeight: 'bold',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                visibility: 'visible'
              },
              rect: {
                fill: '#fff',
                stroke: '#fa8c16',
                strokeWidth: 2,
                rx: 4,
                ry: 4,
                visibility: 'visible'
              }
            },
            position: 0.8
          })
        }
      }
    }, 100)
  }

  // ==================== 事件处理方法 ====================

  /**
   * 处理节点添加事件
   */
  handleNodeAdded(e) {
    const { node } = e
    
    // 清理该节点的缓存（如果存在）
    this.clearNodeCache(node.id)
    
    if (this.shouldCreatePreviewLine(node)) {
      // 所有预览线默认为可交互状态，支持移动和吸附
      this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
    }
  }

  /**
   * 处理节点移除事件
   * @param {Object} e - 事件对象，包含被删除的节点
   * @param {Array} providedIncomingEdges - 可选的传入边数组，用于优化性能
   */
  handleNodeRemoved(e, providedIncomingEdges = null) {
    const { node } = e
    
    // 检查是否是拖拽提示点或预览相关节点
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type
    const isDragHint = nodeData.isDragHint || nodeType === 'drag-hint'
    const isPreviewRelated = nodeData.isUnifiedPreview || nodeData.isPersistentPreview || 
                            nodeData.isPreview || nodeType === 'unified-preview-line'
    
    if (isDragHint || isPreviewRelated) {
      console.log('🗑️ [统一预览线管理器] 跳过拖拽提示点或预览相关节点的删除处理:', {
        nodeId: node.id,
        nodeType: nodeType,
        isDragHint: isDragHint,
        isPreviewRelated: isPreviewRelated
      })
      return
    }
    
    // 检查是否已经处理过这个节点的删除事件
    if (this.processedNodeDeletions && this.processedNodeDeletions.has(node.id)) {
      console.log('🗑️ [统一预览线管理器] 节点删除事件已处理过，跳过:', node.id)
      return
    }
    
    // 初始化已处理删除事件的集合
    if (!this.processedNodeDeletions) {
      this.processedNodeDeletions = new Set()
    }
    
    // 标记这个节点的删除事件已处理
    this.processedNodeDeletions.add(node.id)
    
    // 设置清理定时器，避免内存泄漏
    setTimeout(() => {
      if (this.processedNodeDeletions) {
        this.processedNodeDeletions.delete(node.id)
      }
    }, 1000) // 1秒后清理标记
    
    console.log('🗑️ [统一预览线管理器] 节点删除事件开始处理:', {
      nodeId: node.id,
      nodeType: nodeType,
      timestamp: new Date().toISOString(),
      currentPreviewLines: Array.from(this.previewLines.keys()),
      currentDragHints: this.dragHints ? Array.from(this.dragHints.keys()) : [],
      providedIncomingEdges: !!providedIncomingEdges,
      providedIncomingEdgesLength: providedIncomingEdges ? providedIncomingEdges.length : 'null'
    })
    
    // 使用提供的传入边信息，或者重新获取（如果没有提供或为空数组）
    let incomingEdges
    if (providedIncomingEdges && providedIncomingEdges.length > 0) {
      incomingEdges = providedIncomingEdges
      console.log('🗑️ [统一预览线管理器] 使用提供的传入边信息')
    } else {
      incomingEdges = this.graph.getIncomingEdges(node.id) || []
      console.log('🗑️ [统一预览线管理器] 重新从图中获取传入边信息')
    }
    
    console.log('🗑️ [统一预览线管理器] 被删除节点的传入连接:', {
      nodeId: node.id,
      incomingEdgesCount: incomingEdges.length,
      incomingEdges: incomingEdges.map(edge => ({
        id: edge.id,
        sourceId: edge.getSourceCellId(),
        targetId: edge.getTargetCellId(),
        data: edge.getData()
      }))
    })
    
    // 1. 删除被移除节点的预览线
    this.removePreviewLine(node.id)
    
    // 2. 清理该节点的缓存
    this.clearNodeCache(node.id)
    
    // 3. 清理与该节点相关的所有拖拽提示点
    this.cleanupRelatedDragHints(node.id)
    
    console.log('🗑️ [统一预览线管理器] 调用预览线恢复方法')
    // 3. 检查是否有其他节点连接到被删除的节点，如果有，恢复它们的预览线
    this.restorePreviewLinesAfterNodeDeletion(node, incomingEdges)
    
    console.log('🗑️ [统一预览线管理器] 节点删除事件处理完成:', {
      nodeId: node.id,
      remainingPreviewLines: Array.from(this.previewLines.keys()),
      remainingDragHints: this.dragHints ? Array.from(this.dragHints.keys()) : []
    })
  }

  /**
   * 处理节点移动事件（使用防抖优化）
   */
  handleNodeMove(e) {
    const { node } = e
    const nodeData = node.getData() || {}
    
    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      return
    }
    
    // 使用防抖的位置更新方法
    this.debouncedUpdatePosition(node)
  }

  /**
   * 处理节点移动完成事件
   */
  handleNodeMoved(e) {
    // 安全检查事件对象和node属性
    if (!e || !e.node) {
      console.warn('⚠️ [统一预览线管理器] handleNodeMoved: 无效的事件对象或缺少node属性', e)
      return
    }
    
    const { node } = e
    const nodeData = node.getData() || {}
    
    console.log('🚚 [统一预览线管理器] 节点移动完成:', {
      nodeId: node.id,
      nodeType: nodeData.nodeType || nodeData.type,
      isDragHint: nodeData.isDragHint,
      isConfigured: nodeData.isConfigured
    })
    
    // 检查是否是拖拽提示点
    if (nodeData.isDragHint || nodeData.type === 'drag-hint') {
      console.log('⏭️ [统一预览线管理器] 跳过拖拽提示点的位置更新:', node.id)
      return
    }
    
    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      console.log('⏭️ [统一预览线管理器] 节点不应该有预览线，跳过位置更新:', {
        nodeId: node.id,
        nodeType: nodeData.nodeType || nodeData.type,
        isConfigured: nodeData.isConfigured || false
      })
      return
    }
    
    // 检查是否是以hint_开头的节点ID，如果是，提取原始节点ID
    let targetNodeId = node.id
    if (node.id.startsWith('hint_')) {
      // 从hint_unified_preview_nodeId_xxx格式中提取原始节点ID
      const parts = node.id.split('_')
      if (parts.length >= 4 && parts[0] === 'hint' && parts[1] === 'unified' && parts[2] === 'preview') {
        targetNodeId = parts[3]
        console.log('🔍 [统一预览线管理器] 从拖拽提示点ID提取原始节点ID:', {
          hintNodeId: node.id,
          extractedNodeId: targetNodeId
        })
      }
    }
    
    // 查找对应的预览线实例
    const previewInstance = this.previewLines.get(targetNodeId)
    if (previewInstance) {
      // 创建一个临时节点对象用于位置更新
      const targetNode = this.graph.getCell(targetNodeId)
      if (targetNode) {
        // 移动完成时立即更新位置，不使用防抖
        this.updatePreviewLinePosition(targetNode)
        
        // 清除缓存，确保下次获取最新位置
        this.positionCache.delete(targetNodeId)
      } else {
        console.warn('⚠️ [统一预览线管理器] 找不到目标节点:', targetNodeId)
      }
    } else {
      // 如果不是拖拽提示点，直接更新预览线位置
      this.updatePreviewLinePosition(node)
      
      // 清除缓存
      this.positionCache.delete(node.id)
    }
  }

  /**
   * 处理节点鼠标按下事件
   */
  handleNodeMouseDown(e) {
    const { node } = e
    const nodeData = node.getData() || {}
    
    // 检查是否是拖拽提示点
    if (nodeData.isDragHint || nodeData.type === 'drag-hint') {
      // 查找对应的预览线实例
      const parentLineId = nodeData.parentPreviewLine
      if (parentLineId) {
        // 遍历所有预览线实例，找到对应的预览线
        for (const [nodeId, previewInstance] of this.previewLines) {
          if (Array.isArray(previewInstance)) {
            // 分支预览线
            const targetInstance = previewInstance.find(instance => 
              instance.line.id === parentLineId
            )
            if (targetInstance) {
              this.startPreviewLineDrag(targetInstance, e)
              return
            }
          } else {
            // 单一预览线
            if (previewInstance.line.id === parentLineId) {
              this.startPreviewLineDrag(previewInstance, e)
              return
            }
          }
        }
      }
      
      return
    }
    
    // 检查是否是拖拽提示点激活状态
    if (this.isDragHintActive) {
      return
    }
  }

  /**
   * 处理节点鼠标释放事件
   */
  handleNodeMouseUp(e) {
    // 处理节点鼠标释放
  }

  /**
   * 处理边添加事件
   */
  handleEdgeAdded(e) {
    const { edge } = e
    const sourceNode = edge.getSourceNode()
    if (sourceNode) {
      // 获取边数据中的分支ID
      const edgeData = edge.getData() || {}
      const branchId = edgeData.branchId
      
      console.log('🔗 [统一预览线管理器] 边添加事件:', {
        sourceNodeId: sourceNode.id,
        branchId: branchId,
        edgeData: edgeData
      })
      
      // 传递分支ID给连接处理方法
      this.onNodeConnected(sourceNode, branchId)
    }
  }

  /**
   * 处理边移除事件
   */
  handleEdgeRemoved(e) {
    const { edge } = e
    const sourceNode = edge.getSourceNode()
    
    if (sourceNode) {
      // 获取边数据中的分支ID和标签
      const edgeData = edge.getData() || {}
      const branchId = edgeData.branchId
      const branchLabel = edgeData.branchLabel
      
      console.log('🔗 [统一预览线管理器] 边移除事件:', {
        sourceNodeId: sourceNode.id,
        branchId: branchId,
        branchLabel: branchLabel,
        edgeData: edgeData
      })
      
      // 如果有分支ID，恢复特定分支的预览线
      if (branchId) {
        this.onNodeDisconnected(sourceNode, branchId, branchLabel)
      } else if (this.shouldCreatePreviewLine(sourceNode)) {
        // 如果没有分支ID且应该创建预览线，重新创建预览线
        this.createUnifiedPreviewLine(sourceNode, UnifiedPreviewStates.INTERACTIVE)
      }
    }
  }

  /**
   * 处理画布空白区域鼠标释放事件
   */
  handleBlankMouseUp(e) {
    this.resetDragState()
  }

  /**
   * 处理全局鼠标移动事件
   */
  handleGlobalMouseMove(e) {
    if (this.isDragging && this.currentDragLine) {
      this.updateDragPosition(e)
    }
  }

  /**
   * 处理全局鼠标释放事件
   */
  handleGlobalMouseUp(e) {
    if (this.isDragging && this.currentDragLine) {
      this.handleDragEnd(e)
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 判断是否应该创建预览线
   */
  shouldCreatePreviewLine(node, excludeEdgeId = null) {
    if (!node) return false
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 跳过拖拽提示点
    if (nodeData.isDragHint || nodeData.type === 'drag-hint' || nodeType === 'drag-hint') {
      return false
    }
    
    // 跳过结束节点
    if (nodeType === 'end' || nodeType === 'finish') {
      return false
    }
    
    // 跳过预览线相关的节点
    if (nodeData.isUnifiedPreview || nodeData.isPersistentPreview || nodeData.isPreview) {
      return false
    }
    
    // 跳过已有连接的节点（排除指定的边）
    if (this.hasExistingConnections(node, excludeEdgeId)) {
      return false
    }
    
    // 新增：只有开始节点在创建时生成预览线，其他节点需要配置完成后才生成
    if (nodeType !== 'start') {
      // 检查节点是否已配置完成
      const isConfigured = nodeData.isConfigured || nodeData.config || false
      if (!isConfigured) {
        console.log('⏭️ [统一预览线管理器] 跳过未配置节点的预览线创建:', {
          nodeId: node.id,
          nodeType: nodeType,
          isConfigured: isConfigured
        })
        return false
      }
    }
    
    return true
  }

  /**
   * 检查节点是否已有连接
   * @param {Object} node - 要检查的节点
   * @param {string} excludeEdgeId - 要排除的边ID（可选）
   */
  hasExistingConnections(node, excludeEdgeId = null) {
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []
    return outgoingEdges.some(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isUnifiedPreview && 
             !edgeData.isPersistentPreview && 
             !edgeData.isPreview &&
             edgeData.type !== 'unified-preview-line' &&
             (excludeEdgeId ? edge.id !== excludeEdgeId : true) // 排除指定的边
    })
  }

  /**
   * 判断是否是分支节点
   * @param {Object} node - 节点
   * @param {Object} config - 节点配置（可选）
   * @returns {boolean} 是否为分支节点
   */
  isBranchNode(node, config = null) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    const nodeConfig = config || nodeData.config || {}
    
    // 基于节点类型判断
    const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']
    const isBranchByType = branchNodeTypes.includes(nodeType)
    
    // 基于配置判断分支数量
    let branchCount = 1
    if (nodeConfig.branchCount && typeof nodeConfig.branchCount === 'number') {
      branchCount = nodeConfig.branchCount
    } else {
      branchCount = this.calculateBranchCount(node, nodeConfig)
    }
    
    const isBranchByCount = branchCount > 1
    
    const isBranch = isBranchByType || isBranchByCount
    
    console.log('🔍 [统一预览线管理器] 节点类型检查:', {
      nodeId: node.id,
      nodeType,
      isBranchByType,
      branchCount,
      isBranchByCount,
      isBranchNode: isBranch
    })
    
    return isBranch
  }

  /**
   * 获取节点的分支信息
   * @param {Object} node - 节点
   * @param {Object} config - 节点配置（可选）
   * @returns {Array} 分支数组
   */
  getNodeBranches(node, config = null) {
    const nodeId = node.id
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 检查缓存
    const cached = this.branchInfoCache.get(nodeId)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      console.log('📦 [统一预览线管理器] 使用缓存的分支信息:', {
        nodeId: nodeId,
        cacheAge: now - cached.timestamp,
        branches: cached.branches.map(b => ({ id: b.id, label: b.label }))
      })
      return cached.branches
    }
    
    // 优先使用传入的配置，否则使用节点数据中的配置
    const nodeConfig = config || nodeData.config || {}
    
    console.log('🔍 [统一预览线管理器] getNodeBranches 被调用:', {
      nodeId: nodeId,
      nodeType: nodeType,
      nodeData: nodeData,
      passedConfig: config,
      finalConfig: nodeConfig,
      hasStoredBranches: !!(nodeConfig.branches && Array.isArray(nodeConfig.branches)),
      cacheStatus: cached ? 'expired' : 'miss'
    })
    
    let branches = []
    
    // 如果节点有存储的分支数据，直接使用
    if (nodeConfig.branches && Array.isArray(nodeConfig.branches)) {
      console.log('🔄 [统一预览线管理器] 使用存储的分支数据:', nodeConfig.branches)
      branches = nodeConfig.branches
    } else {
      // 根据节点类型和配置生成分支
      branches = this.generateBranchesByType(nodeType, nodeConfig, nodeId)
    }
    
    // 使用工具类验证并修复所有分支标签
    branches = branches.map((branch, index) => 
      BranchLabelUtils.validateAndFixBranchLabel(branch, index, nodeType)
    )
    
    // 缓存结果
    this.branchInfoCache.set(nodeId, {
      branches: branches,
      timestamp: now
    })
    
    console.log('💾 [统一预览线管理器] 分支信息已缓存:', {
      nodeId: nodeId,
      branchCount: branches.length,
      branches: branches.map(b => ({ id: b.id, label: b.label }))
    })
    
    return branches
  }

  /**
   * 根据节点类型生成分支信息
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @returns {Array} 分支数组
   */
  generateBranchesByType(nodeType, nodeConfig, nodeId) {
    switch (nodeType) {
      case 'audience-split':
        // 人群分流：根据配置的人群层数生成分支
        if (nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers)) {
          const branches = nodeConfig.crowdLayers.map((layer, index) => ({
            id: layer.id || `audience_${index}`,
            label: layer.crowdName || `人群${index + 1}`,
            crowdName: layer.crowdName || `人群${index + 1}`, // 添加crowdName属性
            type: 'audience',
            crowdId: layer.crowdId,
            order: layer.order || index + 1
          }))
          
          // 添加未命中人群分支
          branches.push({
            id: 'default_audience',
            label: '未命中人群',
            crowdName: '未命中人群', // 添加crowdName属性
            type: 'audience',
            crowdId: null,
            order: branches.length + 1
          })
          
          return branches
        }
        return [
          { id: 'audience_1', label: '人群1', crowdName: '人群1', type: 'audience' },
          { id: 'default_audience', label: '未命中人群', crowdName: '未命中人群', type: 'audience' }
        ]
        
      case 'event-split':
        // 事件分流：固定是/否两个分支
        const eventBranches = [
          { id: 'event_yes', label: nodeConfig.yesLabel || '是', type: 'event' },
          { id: 'event_no', label: nodeConfig.noLabel || '否', type: 'event' }
        ]
        
        console.log('🌿 [统一预览线管理器] 生成事件分流分支:', {
          nodeId: nodeId,
          nodeConfig: nodeConfig,
          yesLabel: nodeConfig.yesLabel,
          noLabel: nodeConfig.noLabel,
          branches: eventBranches
        })
        
        return eventBranches
        
      case 'ab-test':
        // AB测试：根据配置的版本数生成分支
        if (nodeConfig.versions && Array.isArray(nodeConfig.versions)) {
          return nodeConfig.versions.map((version, index) => ({
            id: version.id || `version_${index}`,
            label: version.name || `版本${index + 1}`,
            type: 'ab-test',
            ratio: version.ratio
          }))
        }
        return [
          { id: 'group_a', label: nodeConfig.groupALabel || 'A组', type: 'ab-test', ratio: nodeConfig.groupARatio || 50 },
          { id: 'group_b', label: nodeConfig.groupBLabel || 'B组', type: 'ab-test', ratio: nodeConfig.groupBRatio || 50 }
        ]
        
      default:
        return []
    }
  }

  /**
   * 计算单一预览线位置
   */
  calculateSinglePreviewPosition(node, nodePosition, nodeSize) {
    return {
      x: nodePosition.x + nodeSize.width / 2,
      y: nodePosition.y + nodeSize.height + 100
    }
  }

  /**
   * 计算分支预览线位置
   * 修改：所有分支预览线都从节点中心的同一个位置出发
   */
  calculateBranchPreviewPosition(node, branches, index) {
    const nodePosition = node.getPosition()
    const nodeSize = node.getSize()
    
    // 所有分支预览线都从节点中心出发，到达不同的终点位置
    const centerX = nodePosition.x + nodeSize.width / 2
    const baseY = nodePosition.y + nodeSize.height + 100
    
    // 计算终点位置的分散，但起点保持在中心
    const baseSpacing = Math.max(nodeSize.width * 0.8, 60) // 最小60px，最大为节点宽度的80%
    const maxSpacing = 120 // 最大间距限制
    const spacing = Math.min(baseSpacing, maxSpacing)
    
    const totalWidth = (branches.length - 1) * spacing
    const endX = centerX - totalWidth / 2 + index * spacing
    
    console.log('📏 [统一预览线管理器] 计算分支预览线位置 (统一起点):', {
      nodeId: node.id,
      nodeSize: nodeSize,
      branchCount: branches.length,
      centerX: centerX,
      baseSpacing: baseSpacing,
      finalSpacing: spacing,
      totalWidth: totalWidth,
      index: index,
      endX: endX,
      startFromCenter: true
    })
    
    return {
      x: endX, // 终点X坐标分散
      y: baseY  // 终点Y坐标相同
    }
  }

  /**
   * 更新预览线位置
   */
  updatePreviewLinePosition(node) {
    console.log('🔄 [预览线位置更新] 开始更新预览线位置:', {
      nodeId: node.id,
      nodePosition: node.getPosition()
    })

    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      console.log('⏭️ [预览线位置更新] 节点不应该有预览线，跳过更新:', {
        nodeId: node.id,
        nodeData: node.getData()
      })
      return
    }

    const previewInstance = this.previewLines.get(node.id)
    if (!previewInstance) {
      console.log('⏭️ [预览线位置更新] 找不到预览线实例，可能是新创建的未配置节点:', {
        nodeId: node.id,
        nodeType: node.getData()?.nodeType || node.getData()?.type,
        isConfigured: node.getData()?.isConfigured || false
      })
      return
    }

    // 检查预览线状态，如果是隐藏状态则跳过更新
    if (Array.isArray(previewInstance)) {
      // 分支预览线 - 检查是否所有分支都被隐藏
      const allHidden = previewInstance.every(instance => instance.state === UnifiedPreviewStates.HIDDEN)
      if (allHidden) {
        console.log('⏭️ [预览线位置更新] 所有分支预览线都已隐藏，跳过位置更新:', node.id)
        return
      }
    } else {
      // 单一预览线 - 检查是否被隐藏
      if (previewInstance.state === UnifiedPreviewStates.HIDDEN) {
        console.log('⏭️ [预览线位置更新] 预览线已隐藏，跳过位置更新:', node.id)
        return
      }
    }
    
    if (Array.isArray(previewInstance)) {
      console.log('🌿 [预览线位置更新] 更新分支预览线:', {
        nodeId: node.id,
        branchCount: previewInstance.length
      })

      // 分支预览线 - 只更新未隐藏的分支
      const branches = this.getNodeBranches(node)
      previewInstance.forEach((instance, index) => {
        // 跳过已隐藏的分支预览线
        if (instance.state === UnifiedPreviewStates.HIDDEN) {
          console.log('⏭️ [预览线位置更新] 跳过已隐藏的分支预览线:', {
            nodeId: node.id,
            branchIndex: index,
            branchId: instance.branchId
          })
          return
        }

        // 记录更新前的连接属性
        const beforeProps = instance.line.prop()
        console.log('📋 [预览线位置更新] 分支预览线更新前属性:', {
          nodeId: node.id,
          branchIndex: index,
          branchId: instance.branchId,
          source: beforeProps.source,
          target: beforeProps.target,
          connectionPoint: beforeProps.connectionPoint
        })

        // 计算节点底部中心的精确坐标，确保所有分支都从完全相同的位置开始
        const nodePosition = node.getPosition()
        const nodeSize = node.getSize()
        const sourcePoint = {
          x: nodePosition.x + nodeSize.width / 2,  // 节点水平中心
          y: nodePosition.y + nodeSize.height      // 节点底部
        }

        const newEndPosition = this.calculateBranchPreviewPosition(node, branches, index)
        console.log('📐 [预览线位置更新] 计算的分支新结束位置:', {
          branchIndex: index,
          sourcePoint: sourcePoint,
          newEndPosition
        })
        
        // 更新起点和终点位置，使用精确的坐标点确保所有分支从同一位置开始
        instance.line.prop({
          source: sourcePoint,  // 使用精确的坐标点
          target: newEndPosition
        })
        instance.endPosition = newEndPosition

        // 记录更新后的连接属性
        const afterProps = instance.line.prop()
        console.log('✅ [预览线位置更新] 分支预览线更新后属性:', {
          nodeId: node.id,
          branchIndex: index,
          branchId: instance.branchId,
          source: afterProps.source,
          target: afterProps.target,
          connectionPoint: afterProps.connectionPoint
        })
        
        // 更新拖拽提示点位置
        if (instance.hintNode) {
          instance.hintNode.setPosition(newEndPosition.x - 6, newEndPosition.y - 6)
        }
      })
    } else {
      console.log('📏 [预览线位置更新] 更新单一预览线:', {
        nodeId: node.id,
        branchId: previewInstance.branchId
      })

      // 记录更新前的连接属性
      const beforeProps = previewInstance.line.prop()
      console.log('📋 [预览线位置更新] 单一预览线更新前属性:', {
        nodeId: node.id,
        source: beforeProps.source,
        target: beforeProps.target,
        connectionPoint: beforeProps.connectionPoint
      })

      // 单一预览线
      // 计算节点底部中心的精确坐标
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      const sourcePoint = {
        x: nodePosition.x + nodeSize.width / 2,  // 节点水平中心
        y: nodePosition.y + nodeSize.height      // 节点底部
      }
      
      const newEndPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
      console.log('📐 [预览线位置更新] 计算的单一新结束位置:', {
        sourcePoint: sourcePoint,
        newEndPosition
      })
      
      // 更新起点和终点位置，使用精确的坐标点
      previewInstance.line.prop({
        source: sourcePoint,  // 使用精确的坐标点
        target: newEndPosition
      })
      previewInstance.endPosition = newEndPosition

      // 记录更新后的连接属性
      const afterProps = previewInstance.line.prop()
      console.log('✅ [预览线位置更新] 单一预览线更新后属性:', {
        nodeId: node.id,
        source: afterProps.source,
        target: afterProps.target,
        connectionPoint: afterProps.connectionPoint
      })
      
      // 更新拖拽提示点位置
      if (previewInstance.hintNode) {
        previewInstance.hintNode.setPosition(newEndPosition.x - 6, newEndPosition.y - 6)
      }
    }

    console.log('🎉 [预览线位置更新] 预览线位置更新完成:', {
      nodeId: node.id,
      isArray: Array.isArray(previewInstance)
    })
  }

  /**
   * 移除预览线
   */
  removePreviewLine(nodeId) {
    const previewInstance = this.previewLines.get(nodeId)
    if (!previewInstance) return
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线
      previewInstance.forEach(instance => {
        this.removeDragHint(instance)
        this.graph.removeEdge(instance.line)
      })
    } else {
      // 单一预览线
      this.removeDragHint(previewInstance)
      this.graph.removeEdge(previewInstance.line)
    }
    
    this.previewLines.delete(nodeId)
    this.nodeStates.delete(nodeId)
    
    console.log('🗑️ [统一预览线管理器] 移除预览线:', nodeId)
  }

  /**
   * 移除特定分支的预览线
   * @param {string} nodeId - 节点ID
   * @param {string} branchId - 分支ID
   */
  removeSpecificBranchPreviewLine(nodeId, branchId) {
    const previewInstance = this.previewLines.get(nodeId)
    if (!previewInstance) {
      console.warn('⚠️ [统一预览线管理器] 未找到预览线实例:', nodeId)
      return
    }
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线：找到并删除特定分支
      const targetIndex = previewInstance.findIndex(instance => instance.branchId === branchId)
      
      if (targetIndex !== -1) {
        const targetInstance = previewInstance[targetIndex]
        
        // 移除拖拽提示点和预览线
        this.removeDragHint(targetInstance)
        this.graph.removeEdge(targetInstance.line)
        
        // 从数组中移除该分支
        previewInstance.splice(targetIndex, 1)
        
        console.log('🗑️ [统一预览线管理器] 移除特定分支预览线:', {
          nodeId: nodeId,
          branchId: branchId,
          remainingBranches: previewInstance.length
        })
        
        // 如果没有剩余分支，清理整个预览线实例
        if (previewInstance.length === 0) {
          this.previewLines.delete(nodeId)
          this.nodeStates.delete(nodeId)
          console.log('🗑️ [统一预览线管理器] 所有分支已删除，清理预览线实例:', nodeId)
        }
      } else {
        console.warn('⚠️ [统一预览线管理器] 未找到指定分支:', {
          nodeId: nodeId,
          branchId: branchId,
          availableBranches: previewInstance.map(instance => instance.branchId)
        })
      }
    } else {
      // 单一预览线：如果指定了分支ID但实际是单一预览线，则删除整个预览线
      console.log('🗑️ [统一预览线管理器] 单一预览线，删除整个预览线:', {
        nodeId: nodeId,
        requestedBranchId: branchId
      })
      
      this.removeDragHint(previewInstance)
      this.graph.removeEdge(previewInstance.line)
      this.previewLines.delete(nodeId)
      this.nodeStates.delete(nodeId)
    }
  }

  /**
   * 更新拖拽位置
   */
  updateDragPosition(e) {
    if (!this.currentDragLine) {
      console.warn('❌ [拖拽位置更新] 没有当前拖拽线')
      return
    }
    
    const { line, hintNode, sourceNode, branchId } = this.currentDragLine
    const rect = this.graph.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    console.log('🖱️ [拖拽位置更新] 开始更新拖拽位置:', {
      sourceNodeId: sourceNode?.id,
      branchId,
      mousePosition: { x, y }
    })

    // 记录更新前的连接属性
    const beforeProps = line.prop()
    console.log('📋 [拖拽位置更新] 更新前的连接属性:', {
      source: beforeProps.source,
      target: beforeProps.target,
      connectionPoint: beforeProps.connectionPoint
    })
    
    // 使用prop方法更新预览线终点，同时保持connectionPoint配置
    // 添加更健壮的路由配置以避免Manhattan算法失败
    line.prop({
      target: { x, y },
      connectionPoint: 'anchor',
      router: {
        name: 'orth',
        args: {
          padding: 10
        }
      }
    })

    // 记录更新后的连接属性
    const afterProps = line.prop()
    console.log('✅ [拖拽位置更新] 更新后的连接属性:', {
      source: afterProps.source,
      target: afterProps.target,
      connectionPoint: afterProps.connectionPoint
    })
    
    // 更新拖拽提示点位置
    if (hintNode) {
      hintNode.setPosition(x - 6, y - 6)
    }
    
    // 检测附近的节点并高亮显示
    this.highlightNearbyNodes(x, y)

    console.log('🎉 [拖拽位置更新] 拖拽位置更新完成:', {
      sourceNodeId: sourceNode?.id,
      branchId,
      newTarget: { x, y },
      connectionPoint: afterProps.connectionPoint
    })
  }

  /**
   * 高亮附近的节点
   */
  highlightNearbyNodes(x, y) {
    const tolerance = 80 // 检测范围
    const nodes = this.graph.getNodes()
    
    // 清除之前的高亮
    this.clearNodeHighlights()
    
    // 如果当前拖拽的是分支预览线，需要智能选择最近的分流端口
    if (this.currentDragLine && this.currentDragLine.type === PreviewLineTypes.BRANCH) {
      this.highlightNearestBranchPort(x, y, tolerance)
      return
    }
    
    for (const node of nodes) {
      const nodeData = node.getData() || {}
      
      // 跳过拖拽提示点和预览相关节点
      if (nodeData.isDragHint || nodeData.type === 'drag-hint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      // 跳过源节点
      if (this.currentDragLine && node.id === this.currentDragLine.sourceNode.id) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 检查是否在检测范围内
      const distance = Math.sqrt(
        Math.pow(x - (nodePosition.x + nodeSize.width / 2), 2) +
        Math.pow(y - (nodePosition.y + nodeSize.height / 2), 2)
      )
      
      if (distance <= tolerance) {
        // 高亮节点
        this.highlightNode(node)
      }
    }
  }

  /**
   * 为分支预览线高亮最近的分流端口
   */
  highlightNearestBranchPort(x, y, tolerance) {
    const nodes = this.graph.getNodes()
    let nearestNode = null
    let nearestDistance = Infinity
    
    for (const node of nodes) {
      const nodeData = node.getData() || {}
      
      // 跳过拖拽提示点和预览相关节点
      if (nodeData.isDragHint || nodeData.type === 'drag-hint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      // 跳过源节点
      if (this.currentDragLine && node.id === this.currentDragLine.sourceNode.id) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 检查是否在检测范围内
      const distance = Math.sqrt(
        Math.pow(x - (nodePosition.x + nodeSize.width / 2), 2) +
        Math.pow(y - (nodePosition.y + nodeSize.height / 2), 2)
      )
      
      if (distance <= tolerance && distance < nearestDistance) {
        nearestDistance = distance
        nearestNode = node
      }
    }
    
    // 高亮最近的节点
    if (nearestNode) {
      this.highlightNode(nearestNode)
      
      // 更新当前拖拽线的目标信息，用于后续连接
      if (this.currentDragLine) {
        this.currentDragLine.nearestTargetNode = nearestNode
        this.currentDragLine.nearestDistance = nearestDistance
        
        console.log('🎯 [统一预览线管理器] 分支预览线找到最近目标:', {
          branchId: this.currentDragLine.branchId,
          targetNodeId: nearestNode.id,
          distance: nearestDistance
        })
      }
    }
  }

  /**
   * 高亮节点
   */
  highlightNode(node) {
    const nodeData = node.getData() || {}
    
    // 保存原始样式
    if (!nodeData.originalAttrs) {
      nodeData.originalAttrs = JSON.parse(JSON.stringify(node.getAttrs()))
    }
    
    // 应用高亮样式
    node.setAttrs({
      body: {
        ...node.getAttrs().body,
        stroke: '#52c41a',
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 10px rgba(82, 196, 26, 0.5))'
      }
    })
    
    // 标记为高亮状态
    nodeData.isHighlighted = true
    node.setData(nodeData)
  }

  /**
   * 清除所有节点高亮
   */
  clearNodeHighlights() {
    const nodes = this.graph.getNodes()
    
    nodes.forEach(node => {
      const nodeData = node.getData() || {}
      
      if (nodeData.isHighlighted && nodeData.originalAttrs) {
        // 恢复原始样式
        node.setAttrs(nodeData.originalAttrs)
        
        // 清除高亮标记
        delete nodeData.isHighlighted
        delete nodeData.originalAttrs
        node.setData(nodeData)
      }
    })
  }

  /**
   * 处理拖拽结束
   */
  handleDragEnd(e) {
    if (!this.currentDragLine) return
    
    const { line, sourceNode, branchId, nearestTargetNode, branchLabel } = this.currentDragLine
    const rect = this.graph.container.getBoundingClientRect()
    const dropX = e.clientX - rect.left
    const dropY = e.clientY - rect.top
    
    console.log('🎯 [统一预览线管理器] 拖拽结束:', {
      dropPosition: { x: dropX, y: dropY },
      sourceNodeId: sourceNode.id,
      branchId: branchId,
      branchLabel: branchLabel,
      nearestTargetNode: nearestTargetNode?.id
    })
    
    // 优先使用智能选择的最近目标节点
    let targetNode = nearestTargetNode
    
    // 如果没有智能选择的目标，则使用传统的位置检测
    if (!targetNode) {
      targetNode = this.findNodeAtPosition(dropX, dropY)
    }
    
    if (targetNode && targetNode.id !== sourceNode.id) {
      // 找到目标节点，显示吸附完成的标签（如果有分支标签）
      if (branchLabel) {
        this.showSnapCompleteLabel(line, branchLabel, targetNode)
      }
      
      // 创建连接（源节点out → 目标节点in）
      this.createConnection(sourceNode, targetNode, this.currentDragLine)
      console.log('🔗 [统一预览线管理器] 自动连接到节点:', {
        targetId: targetNode.id,
        branchId: branchId,
        branchLabel: branchLabel,
        method: nearestTargetNode ? 'smart-selection' : 'position-detection'
      })
    } else {
      // 没有找到目标节点，检查是否需要创建新节点
      const shouldCreateNode = this.shouldCreateNodeAtPosition(dropX, dropY)
      if (shouldCreateNode) {
        this.createNodeAtPosition(dropX, dropY, sourceNode, this.currentDragLine)
        console.log('➕ [统一预览线管理器] 在拖拽位置创建新节点')
      }
    }
    
    this.resetDragState()
  }

  /**
   * 节点删除后恢复相关预览线
   * @param {Object} deletedNode - 被删除的节点
   * @param {Array} incomingEdges - 传入的边数组（可选，用于优化性能）
   */
  restorePreviewLinesAfterNodeDeletion(deletedNode, incomingEdges = null) {
    console.log('🔄 [统一预览线管理器] 开始检查节点删除后的预览线恢复:', {
      deletedNodeId: deletedNode.id,
      deletedNodeType: deletedNode.getData()?.type,
      providedIncomingEdges: !!incomingEdges
    })
    
    // 获取所有连接到被删除节点的边（如果没有提供则重新获取）
    const edges = incomingEdges || this.graph.getIncomingEdges(deletedNode) || []
    
    console.log('🔍 [统一预览线管理器] 找到连接到被删除节点的边:', {
      deletedNodeId: deletedNode.id,
      incomingEdgesCount: edges.length,
      edges: edges.map(edge => ({
        id: edge.id,
        sourceId: edge.getSourceNode()?.id,
        targetId: edge.getTargetNode()?.id,
        data: edge.getData()
      }))
    })

    // 收集所有需要检查的源节点
    const sourceNodesToCheck = new Set()
    
    // 遍历所有连接到被删除节点的边
    edges.forEach((edge, index) => {
      const sourceNode = edge.getSourceNode()
      if (sourceNode) {
        sourceNodesToCheck.add(sourceNode)
        
        const edgeData = edge.getData() || {}
        const branchId = edgeData.branchId
        
        console.log(`🔄 [统一预览线管理器] 处理第${index + 1}个源节点的预览线恢复:`, {
          sourceNodeId: sourceNode.id,
          sourceNodeType: sourceNode.getData()?.type,
          branchId: branchId,
          edgeData: edgeData
        })
        
        // 检查源节点是否还有其他连接
        const remainingOutgoingEdges = this.graph.getOutgoingEdges(sourceNode) || []
        const realConnections = remainingOutgoingEdges.filter(e => {
          const data = e.getData() || {}
          return !data.isUnifiedPreview && 
                 !data.isPersistentPreview && 
                 !data.isPreview &&
                 data.type !== 'unified-preview-line' &&
                 e.id !== edge.id // 排除即将被删除的边
        })
        
        console.log('🔍 [统一预览线管理器] 源节点剩余连接检查:', {
          sourceNodeId: sourceNode.id,
          totalOutgoingEdges: remainingOutgoingEdges.length,
          realConnections: realConnections.length,
          realConnectionIds: realConnections.map(e => e.id),
          excludedEdgeId: edge.id
        })
        
        // 如果源节点没有其他真实连接，恢复其预览线
        if (realConnections.length === 0) {
          // 检查源节点是否应该有预览线（排除即将被删除的边）
          if (this.shouldCreatePreviewLine(sourceNode, edge.id)) {
            console.log('✅ [统一预览线管理器] 恢复源节点的预览线:', {
              sourceNodeId: sourceNode.id,
              branchId: branchId,
              restoreType: branchId ? 'branch-specific' : 'full-recreate'
            })
            
            // 如果是分支连接，只恢复特定分支的预览线
            if (branchId) {
              // 获取被删除连接的标签信息
              const deletedEdgeData = edgeData || {}
              const branchLabel = deletedEdgeData.branchLabel
              
              console.log('🏷️ [统一预览线管理器] 恢复分支预览线时传递标签信息:', {
                sourceNodeId: sourceNode.id,
                branchId: branchId,
                branchLabel: branchLabel
              })
              
              this.onNodeDisconnected(sourceNode, branchId, branchLabel)
            } else {
              // 重新创建预览线（获取节点的分支信息以恢复标签）
              const nodeData = sourceNode.getData() || {}
              const nodeConfig = nodeData.config || {}
              
              console.log('🏷️ [统一预览线管理器] 重新创建预览线时恢复标签:', {
                sourceNodeId: sourceNode.id,
                nodeConfig: nodeConfig
              })
              
              this.createUnifiedPreviewLine(sourceNode, UnifiedPreviewStates.INTERACTIVE, {
                preserveLabels: true,
                config: nodeConfig
              })
            }
          } else {
            console.log('⏭️ [统一预览线管理器] 源节点不需要预览线:', {
              sourceNodeId: sourceNode.id,
              reason: '不满足预览线创建条件'
            })
          }
        } else {
          console.log('⏭️ [统一预览线管理器] 源节点仍有其他连接，不恢复预览线:', {
            sourceNodeId: sourceNode.id,
            remainingConnections: realConnections.length,
            connectionDetails: realConnections.map(e => ({
              id: e.id,
              targetId: e.getTargetNode()?.id,
              data: e.getData()
            }))
          })
        }
      } else {
        console.warn('⚠️ [统一预览线管理器] 边的源节点不存在:', {
          edgeId: edge.id,
          edgeData: edge.getData()
        })
      }
    })

    // 对所有受影响的源节点进行完整性检查
    console.log('🔍 [统一预览线管理器] 开始对受影响的源节点进行分支完整性检查')
    sourceNodesToCheck.forEach(sourceNode => {
      this.ensureAllBranchesRestored(sourceNode, true) // 传入isAfterNodeDeletion=true
    })
    
    console.log('🔄 [统一预览线管理器] 节点删除后预览线恢复检查完成:', {
      deletedNodeId: deletedNode.id,
      processedEdges: edges.length,
      checkedSourceNodes: sourceNodesToCheck.size
    })
  }

  /**
   * 确保节点的所有分支都正确恢复
   * @param {Object} node - 需要检查的节点
   * @param {boolean} isAfterNodeDeletion - 是否是节点删除后的恢复过程
   */
  ensureAllBranchesRestored(node, isAfterNodeDeletion = false) {
    if (!this.isBranchNode(node)) {
      console.log('⏭️ [分支完整性检查] 非分支节点，跳过检查:', node.id)
      return
    }

    // 获取节点应该有的分支数
    const expectedBranches = this.getNodeBranches(node)
    const expectedBranchCount = expectedBranches.length
    
    // 获取当前预览线实例
    const previewInstance = this.previewLines.get(node.id)
    
    console.log('🔍 [分支完整性检查] 检查节点分支完整性:', {
      nodeId: node.id,
      expectedBranchCount: expectedBranchCount,
      expectedBranches: expectedBranches.map(b => ({ id: b.id, label: b.label })),
      hasPreviewInstance: !!previewInstance,
      currentInstanceCount: Array.isArray(previewInstance) ? previewInstance.length : 0,
      isAfterNodeDeletion: isAfterNodeDeletion
    })

    if (!previewInstance || !Array.isArray(previewInstance)) {
      // 如果是节点删除后的恢复过程，且节点还有真实连接，则不重新创建预览线
      if (isAfterNodeDeletion) {
        const hasRealConnections = this.nodeHasRealConnections(node)
        if (hasRealConnections) {
          console.log('⏭️ [分支完整性检查] 节点删除后恢复：节点仍有真实连接，跳过预览线重建:', {
            nodeId: node.id,
            hasRealConnections: hasRealConnections
          })
          return
        }
      }
      
      console.log('🔄 [分支完整性检查] 预览线实例不存在或不是数组，重新创建:', node.id)
      this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
      return
    }

    // 检查每个期望的分支是否都有对应的预览线实例
    let missingBranches = []
    let restoredCount = 0

    expectedBranches.forEach((expectedBranch, index) => {
      const existingInstance = previewInstance.find(instance => 
        instance.branchId === expectedBranch.id
      )

      if (!existingInstance) {
        // 如果是节点删除后的恢复过程，检查该分支是否有真实连接
        if (isAfterNodeDeletion) {
          const hasRealConnection = this.checkBranchHasRealConnection(node, expectedBranch.id)
          if (hasRealConnection) {
            console.log('⏭️ [分支完整性检查] 节点删除后恢复：分支有真实连接，跳过重建:', {
              nodeId: node.id,
              branchId: expectedBranch.id,
              branchLabel: expectedBranch.label
            })
            return
          }
        }
        
        missingBranches.push(expectedBranch)
        console.log('❌ [分支完整性检查] 发现缺失的分支:', {
          nodeId: node.id,
          branchId: expectedBranch.id,
          branchLabel: expectedBranch.label,
          branchIndex: index,
          isAfterNodeDeletion: isAfterNodeDeletion
        })
      } else if (existingInstance.state === UnifiedPreviewStates.HIDDEN) {
        // 检查隐藏的分支是否应该恢复
        const hasRealConnection = this.checkBranchHasRealConnection(node, expectedBranch.id)
        if (!hasRealConnection) {
          console.log('🔄 [分支完整性检查] 恢复隐藏的分支:', {
            nodeId: node.id,
            branchId: expectedBranch.id,
            branchLabel: expectedBranch.label
          })
          
          // 恢复隐藏的分支
          existingInstance.state = UnifiedPreviewStates.INTERACTIVE
          this.configureInteractive(existingInstance)
          
          // 恢复标签
          if (!existingInstance.branchLabel && expectedBranch.label) {
            existingInstance.branchLabel = expectedBranch.label
          }
          if (existingInstance.branchLabel) {
            this.updatePreviewLineLabel(existingInstance.line, existingInstance.branchLabel)
          }
          
          restoredCount++
        }
      } else {
        console.log('✅ [分支完整性检查] 分支状态正常:', {
          nodeId: node.id,
          branchId: expectedBranch.id,
          branchState: existingInstance.state
        })
      }
    })

    // 如果有缺失的分支，重新创建整个预览线
    if (missingBranches.length > 0) {
      console.log('🔄 [分支完整性检查] 发现缺失分支，重新创建预览线:', {
        nodeId: node.id,
        missingBranchCount: missingBranches.length,
        missingBranches: missingBranches.map(b => ({ id: b.id, label: b.label })),
        isAfterNodeDeletion: isAfterNodeDeletion
      })
      
      // 移除现有的不完整预览线
      this.removePreviewLine(node.id)
      
      // 重新创建完整的预览线
      this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
    } else if (restoredCount > 0) {
      console.log('✅ [分支完整性检查] 恢复了隐藏分支，刷新预览线位置:', {
        nodeId: node.id,
        restoredCount: restoredCount
      })
      
      // 刷新预览线位置
      this.updatePreviewLinePosition(node)
    }

    console.log('✅ [分支完整性检查] 节点分支完整性检查完成:', {
      nodeId: node.id,
      expectedBranchCount: expectedBranchCount,
      missingBranchCount: missingBranches.length,
      restoredHiddenCount: restoredCount,
      isAfterNodeDeletion: isAfterNodeDeletion
    })
  }

  /**
   * 显示吸附完成的标签
   * @param {Object} line - 预览线对象
   * @param {string} branchLabel - 分支标签
   * @param {Object} targetNode - 目标节点
   */
  showSnapCompleteLabel(line, branchLabel, targetNode) {
    if (!line || !branchLabel) return
    
    console.log('🏷️ [统一预览线管理器] 显示吸附完成标签:', {
      lineId: line.id,
      branchLabel: branchLabel,
      targetNodeId: targetNode.id
    })
    
    // 更新预览线的标签，使其更加突出
    const snapCompleteLabel = {
      attrs: {
        text: {
          text: branchLabel,
          fill: '#52c41a', // 绿色表示成功吸附
          fontSize: 16,
          fontWeight: 'bold',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle'
        },
        rect: {
          ref: 'text',
          refX: -10,
          refY: -8,
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: 20,
          refHeight2: 16,
          fill: '#f6ffed', // 浅绿色背景
          stroke: '#52c41a',
          strokeWidth: 2,
          rx: 6,
          ry: 6
        }
      },
      position: 0.8 // 靠近目标节点
    }
    
    // 设置标签
    line.setLabels([snapCompleteLabel])
    
    // 短暂显示后恢复原样
    setTimeout(() => {
      if (line && !line.removed) {
        // 恢复原始标签样式
        const originalLabel = {
          attrs: {
            text: {
              text: branchLabel,
              fill: '#333',
              fontSize: 14,
              fontWeight: 'bold',
              textAnchor: 'middle',
              textVerticalAnchor: 'middle'
            },
            rect: {
              ref: 'text',
              refX: -8,
              refY: -6,
              refWidth: '100%',
              refHeight: '100%',
              refWidth2: 16,
              refHeight2: 12,
              fill: '#fff',
              stroke: '#fa8c16',
              strokeWidth: 2,
              rx: 4,
              ry: 4
            }
          },
          position: 0.8
        }
        
        line.setLabels([originalLabel])
      }
    }, 1000) // 1秒后恢复
  }

  /**
   * 在指定位置查找节点
   */
  findNodeAtPosition(x, y, tolerance = 50) {
    const nodes = this.graph.getNodes()
    
    for (const node of nodes) {
      const nodeData = node.getData() || {}
      
      // 跳过拖拽提示点和预览相关节点
      if (nodeData.isDragHint || nodeData.type === 'drag-hint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 检查点是否在节点范围内（包含容差）
      if (x >= nodePosition.x - tolerance && 
          x <= nodePosition.x + nodeSize.width + tolerance &&
          y >= nodePosition.y - tolerance && 
          y <= nodePosition.y + nodeSize.height + tolerance) {
        return node
      }
    }
    
    return null
  }

  /**
   * 创建连接
   */
  createConnection(sourceNode, targetNode, previewInstance) {
    const { branchId, branchLabel } = previewInstance
    
    // 确定源端口（源节点的out端口）- 修改：所有连接都使用统一的'out'端口，从UI层面的同一个位置出发
    const sourcePort = 'out'
    
    console.log('🔗 [连接创建] 开始创建连接:', {
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourcePort: sourcePort,
      targetPort: 'in',
      branchId: branchId,
      branchLabel: branchLabel
    })
    
    // 创建连接配置
    const connectionConfig = {
      source: {
        cell: sourceNode.id,
        port: sourcePort
      },
      target: {
        cell: targetNode.id,
        port: 'in' // 目标节点的in端口，支持多个连接
      },
      router: {
        name: 'orth', // 使用更稳定的orth路由算法
        args: {
          padding: 10,
          startDirections: ['bottom'],
          endDirections: ['top']
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
          stroke: '#5F95FF',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
            fill: '#5F95FF'
          }
        }
      },
      data: {
        type: 'connection',
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        branchId: branchId,
        branchLabel: branchLabel,
        allowMultipleConnections: true // 标记支持多连接
      }
    }

    console.log('⚙️ [连接创建] 连接配置:', {
      connectionConfig,
      connectionPoint: connectionConfig.connectionPoint
    })
    
    // 如果有分支标签，添加到连接上
    if (branchLabel) {
      connectionConfig.labels = [{
        attrs: {
          text: {
            text: branchLabel,
            fill: '#333',
            fontSize: 14,
            fontWeight: 'bold',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          },
          rect: {
            ref: 'text',
            refX: -8,
            refY: -6,
            refWidth: '100%',
            refHeight: '100%',
            refWidth2: 16,
            refHeight2: 12,
            fill: '#fff',
            stroke: '#5F95FF',
            strokeWidth: 2,
            rx: 4,
            ry: 4
          }
        },
        position: 0.5 // 将标签放在连接线中间
      }]
      console.log('🏷️ [连接创建] 添加分支标签:', branchLabel)
    }
    
    // 创建实际连接
    const connection = this.graph.addEdge(connectionConfig)
    
    // 验证连接创建后的属性
    const createdProps = connection.prop()
    console.log('✅ [连接创建] 连接创建成功，验证属性:', {
      connectionId: connection.id,
      source: createdProps.source,
      target: createdProps.target,
      connectionPoint: createdProps.connectionPoint,
      hasLabels: !!branchLabel
    })
    
    // 强制设置标签样式（如果有标签）
    if (branchLabel) {
      setTimeout(() => {
        const labels = connection.getLabels()
        if (labels && labels.length > 0) {
          connection.setLabelAt(0, {
            attrs: {
              text: {
                text: branchLabel,
                fill: '#333',
                fontSize: 14,
                fontWeight: 'bold',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                visibility: 'visible'
              },
              rect: {
                fill: '#fff',
                stroke: '#5F95FF',
                strokeWidth: 2,
                rx: 4,
                ry: 4,
                visibility: 'visible'
              }
            },
            position: 0.5
          })
        }
      }, 100)
    }
    
    // 智能删除预览线：如果是分支预览线，只删除特定分支；如果是单一预览线，删除整个预览线
    if (branchId) {
      // 分支预览线：只删除特定分支的预览线
      this.removeSpecificBranchPreviewLine(sourceNode.id, branchId)
      console.log('🗑️ [统一预览线管理器] 删除特定分支预览线:', {
        sourceNodeId: sourceNode.id,
        branchId: branchId,
        branchLabel: branchLabel
      })
    } else {
      // 单一预览线：删除整个预览线
      this.removePreviewLine(sourceNode.id)
      console.log('🗑️ [统一预览线管理器] 删除单一预览线:', {
        sourceNodeId: sourceNode.id
      })
    }
    
    console.log('✅ [统一预览线管理器] 连接创建成功:', {
      sourceId: sourceNode.id,
      targetId: targetNode.id,
      connectionId: connection.id,
      sourcePort: sourcePort,
      targetPort: 'in',
      branchId: branchId,
      branchLabel: branchLabel,
      hasLabel: !!branchLabel
    })
    
    return connection
  }

  /**
   * 判断是否应该在指定位置创建节点
   */
  shouldCreateNodeAtPosition(x, y) {
    // 简单实现：如果拖拽距离足够远，就创建新节点
    // 实际应用中可以根据具体需求调整
    return true
  }

  /**
   * 在指定位置创建新节点
   */
  createNodeAtPosition(x, y, sourceNode, previewInstance) {
    // 这里可以触发节点创建对话框或直接创建默认节点
    // 当前实现为示例，实际应用中需要根据业务需求调整
    
    console.log('📝 [统一预览线管理器] 请求在位置创建新节点:', {
      position: { x, y },
      sourceNodeId: sourceNode.id
    })
    
    // 触发节点创建请求事件
    this.emit('createNodeRequest', {
      position: { x, y },
      sourceNode: sourceNode,
      previewInstance: previewInstance
    })
  }

  /**
   * 重置拖拽状态
   */
  resetDragState() {
    if (this.currentDragLine) {
      // 在重置状态前，先更新预览线实例的endPosition到当前拖拽位置
      const { line } = this.currentDragLine
      if (line) {
        const targetPoint = line.getTargetPoint()
        if (targetPoint) {
          this.currentDragLine.endPosition = {
            x: targetPoint.x,
            y: targetPoint.y
          }
          
          console.log('📍 [统一预览线管理器] 拖拽结束时更新endPosition:', {
            lineId: line.id,
            newEndPosition: this.currentDragLine.endPosition,
            targetPoint: targetPoint
          })
        }
      }
      
      // 检查预览线是否已被隐藏（即连接已建立）
      if (this.currentDragLine.state !== UnifiedPreviewStates.HIDDEN) {
        // 只有在预览线未被隐藏时才重置为交互状态
        this.setPreviewLineState(this.currentDragLine, UnifiedPreviewStates.INTERACTIVE)
        
        // 重置拖拽提示点样式
        if (this.currentDragLine.hintNode) {
          this.currentDragLine.hintNode.setAttrs({
            body: {
              fill: '#5F95FF',
              cursor: 'grab',
              strokeWidth: 2
            }
          })
        }
        
        console.log('🔄 [统一预览线管理器] 预览线状态重置为交互状态:', {
          lineId: this.currentDragLine.line.id,
          state: this.currentDragLine.state
        })
      } else {
        console.log('⏭️ [统一预览线管理器] 预览线已隐藏，跳过状态重置:', {
          lineId: this.currentDragLine.line.id,
          state: this.currentDragLine.state
        })
      }
      
      // 清除智能选择的目标节点信息
      delete this.currentDragLine.nearestTargetNode
      delete this.currentDragLine.nearestDistance
    }
    
    // 清除节点高亮
    this.clearNodeHighlights()
    
    this.isDragging = false
    this.isDragHintActive = false
    this.currentDragLine = null
    this.dragStartPosition = null
    
    console.log('🔄 [统一预览线管理器] 拖拽状态已重置')
  }

  // ==================== 兼容性API ====================

  /**
   * 刷新所有预览线
   * 用于在节点删除后确保剩余预览线正确显示
   * @param {boolean} isAfterNodeDeletion - 是否是节点删除后的刷新
   */
  refreshAllPreviewLines(isAfterNodeDeletion = false) {
    console.log('🔄 [统一预览线管理器] 开始刷新所有预览线', { isAfterNodeDeletion })
    
    let refreshedCount = 0
    let totalBranchesRefreshed = 0
    let restoredHiddenBranches = 0
    let newPreviewLinesCreated = 0
    
    // 第一步：刷新已有的预览线实例
    this.previewLines.forEach((previewInstance, nodeId) => {
      const node = this.graph.getCellById(nodeId)
      
      if (node) {
        console.log('🔄 [统一预览线管理器] 刷新节点预览线:', {
          nodeId: nodeId,
          isArray: Array.isArray(previewInstance),
          branchCount: Array.isArray(previewInstance) ? previewInstance.length : 1
        })
        
        // 如果是分支预览线，为每个分支单独更新位置
        if (Array.isArray(previewInstance)) {
          previewInstance.forEach((instance, branchIndex) => {
            // 检查分支是否被隐藏，如果是则尝试恢复
             if (instance.state === UnifiedPreviewStates.HIDDEN) {
               // 检查该分支是否还有真实连接
               const hasRealConnection = this.checkBranchHasRealConnection(node, instance.branchId)
               if (!hasRealConnection) {
                 // 恢复隐藏的分支预览线
                 console.log('🔄 [统一预览线管理器] 恢复被隐藏的分支预览线:', {
                   nodeId: nodeId,
                   branchId: instance.branchId,
                   branchIndex: branchIndex
                 })
                 
                 // 恢复状态
                 instance.state = UnifiedPreviewStates.INTERACTIVE
                 this.configureInteractive(instance)
                 
                 // 恢复分支标签
                 if (instance.branchLabel) {
                   console.log('🏷️ [统一预览线管理器] 恢复分支标签:', {
                     nodeId: nodeId,
                     branchId: instance.branchId,
                     branchLabel: instance.branchLabel
                   })
                   this.updatePreviewLineLabel(instance.line, instance.branchLabel)
                 } else {
                   // 如果实例中没有保存标签，从节点配置中获取
                   const branches = this.getNodeBranches(node)
                   const branchConfig = branches.find(branch => branch.id === instance.branchId)
                   if (branchConfig && branchConfig.label) {
                     instance.branchLabel = branchConfig.label
                     console.log('🏷️ [统一预览线管理器] 从节点配置恢复分支标签:', {
                       nodeId: nodeId,
                       branchId: instance.branchId,
                       branchLabel: branchConfig.label
                     })
                     this.updatePreviewLineLabel(instance.line, branchConfig.label)
                   }
                 }
                 
                 restoredHiddenBranches++
               } else {
                 console.log('⏭️ [统一预览线管理器] 分支仍有连接，保持隐藏状态:', {
                   nodeId: nodeId,
                   branchId: instance.branchId,
                   branchIndex: branchIndex
                 })
                 // 跳过仍有连接的隐藏分支，但继续处理其他分支
               }
             }
            
            // 只处理非隐藏状态的分支
            if (instance.line && instance.state !== UnifiedPreviewStates.HIDDEN) {
              // 为每个分支单独调用位置更新
              this.updatePreviewLinePosition(node, instance.branchId, branchIndex)
              totalBranchesRefreshed++
              
              // 更新拖拽提示点位置
              if (instance.hintNode) {
                const targetPoint = instance.line.getTargetPoint()
                if (targetPoint) {
                  instance.hintNode.setPosition(targetPoint.x - 6, targetPoint.y - 6)
                  console.log('🔄 [统一预览线管理器] 更新分支拖拽提示点位置:', {
                    nodeId: nodeId,
                    branchId: instance.branchId,
                    branchIndex: branchIndex,
                    position: { x: targetPoint.x - 6, y: targetPoint.y - 6 }
                  })
                }
              }
            } else if (instance.state === UnifiedPreviewStates.HIDDEN) {
              console.log('⏭️ [预览线刷新] 跳过已隐藏的分支预览线:', {
                nodeId: nodeId,
                branchIndex: branchIndex,
                branchId: instance.branchId
              })
            }
          })
        } else {
          // 单一预览线
          this.updatePreviewLinePosition(node)
          totalBranchesRefreshed++
          
          if (previewInstance.hintNode && previewInstance.line) {
            const targetPoint = previewInstance.line.getTargetPoint()
            if (targetPoint) {
              previewInstance.hintNode.setPosition(targetPoint.x - 6, targetPoint.y - 6)
              console.log('🔄 [统一预览线管理器] 更新单一拖拽提示点位置:', {
                nodeId: nodeId,
                position: { x: targetPoint.x - 6, y: targetPoint.y - 6 }
              })
            }
          }
        }
        
        refreshedCount++
      } else {
        console.warn('⚠️ [统一预览线管理器] 节点不存在，移除预览线:', nodeId)
        this.removePreviewLine(nodeId)
      }
    })
    
    // 第二步：检查所有节点，为需要预览线但没有预览线的节点创建预览线
    console.log('🔍 [统一预览线管理器] 检查所有节点是否需要创建新的预览线')
    const allNodes = this.graph.getNodes()
    
    allNodes.forEach(node => {
      const nodeId = node.id
      const nodeData = node.getData() || {}
      
      // 跳过拖拽提示点和预览相关节点
      if (nodeData.isDragHint || nodeData.type === 'drag-hint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview || nodeData.isPreview) {
        return
      }
      
      // 检查节点是否已有预览线实例
      const existingPreview = this.previewLines.get(nodeId)
      if (!existingPreview) {
        // 如果是节点删除后的刷新，检查节点是否还有真实连接
        if (isAfterNodeDeletion && this.nodeHasRealConnections(node)) {
          console.log('⏭️ [统一预览线管理器] 节点删除后刷新：跳过有真实连接的节点:', {
            nodeId: nodeId,
            nodeType: nodeData.type || nodeData.nodeType,
            hasRealConnections: true
          })
          return
        }
        
        // 检查是否应该创建预览线
        if (this.shouldCreatePreviewLine(node)) {
          console.log('🆕 [统一预览线管理器] 为节点创建新的预览线:', {
            nodeId: nodeId,
            nodeType: nodeData.type || nodeData.nodeType,
            isConfigured: nodeData.isConfigured || nodeData.config || false,
            isAfterNodeDeletion: isAfterNodeDeletion
          })
          
          // 强制检查节点类型，确保分支节点正确创建分支预览线
          const nodeType = nodeData.type || nodeData.nodeType
          const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']
          
          if (branchNodeTypes.includes(nodeType)) {
            // 分支节点：直接创建分支预览线
            console.log('🌿 [统一预览线管理器] 检测到分支节点，创建分支预览线:', {
              nodeId: nodeId,
              nodeType: nodeType
            })
            
            const branches = this.getNodeBranches(node)
            console.log('🔍 [统一预览线管理器] 获取分支信息:', {
              nodeId: nodeId,
              branches: branches.map(b => ({ id: b.id, label: b.label }))
            })
            
            if (branches.length > 0) {
              this.createBranchPreviewLines(node, UnifiedPreviewStates.INTERACTIVE)
              newPreviewLinesCreated++
            } else {
              console.warn('⚠️ [统一预览线管理器] 分支节点没有分支信息，创建单一预览线:', nodeId)
              this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
              newPreviewLinesCreated++
            }
          } else {
            // 非分支节点：创建单一预览线
            this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
            newPreviewLinesCreated++
          }
        } else {
          console.log('⏭️ [统一预览线管理器] 节点不需要预览线:', {
            nodeId: nodeId,
            nodeType: nodeData.type || nodeData.nodeType,
            isConfigured: nodeData.isConfigured || nodeData.config || false,
            hasConnections: this.hasExistingConnections(node)
          })
        }
      } else {
        // 节点已有预览线实例，检查是否需要补充缺失的分支
        if (this.isBranchNode(node)) {
          const branches = this.getNodeBranches(node)
          const currentBranches = Array.isArray(existingPreview) ? existingPreview : [existingPreview]
          
          console.log('🔍 [统一预览线管理器] 检查分支节点是否有缺失的分支:', {
            nodeId: nodeId,
            expectedBranches: branches.length,
            currentBranches: currentBranches.length,
            expectedBranchIds: branches.map(b => b.id),
            currentBranchIds: currentBranches.map(b => b.branchId)
          })
          
          // 检查是否有缺失的分支（只考虑没有真实连接的分支）
          const missingBranches = branches.filter(branch => {
            const hasPreviewLine = currentBranches.some(current => current.branchId === branch.id)
            const hasRealConnection = this.checkBranchHasRealConnection(node, branch.id)
            
            // 只有既没有预览线又没有真实连接的分支才被认为是缺失的
            return !hasPreviewLine && !hasRealConnection
          })
          
          if (missingBranches.length > 0) {
            console.log('🔧 [统一预览线管理器] 发现缺失的分支，需要补充:', {
              nodeId: nodeId,
              missingBranches: missingBranches.map(b => ({ id: b.id, label: b.label }))
            })
            
            // 为缺失的分支创建预览线
            missingBranches.forEach((branch, index) => {
              const branchIndex = branches.findIndex(b => b.id === branch.id)
              
              // 使用工具类验证并修复分支标签
              const fixedBranch = BranchLabelUtils.validateAndFixBranchLabel(
                branch, 
                branchIndex, 
                nodeData.type || nodeData.nodeType
              )
              
              console.log('🆕 [统一预览线管理器] 为缺失分支创建预览线:', {
                nodeId: nodeId,
                nodeType: nodeData.type || nodeData.nodeType,
                branchId: fixedBranch.id,
                branchLabel: fixedBranch.label,
                branchIndex: branchIndex,
                allBranches: branches.map(b => ({ id: b.id, label: b.label }))
              })
              
              // 创建单个分支预览线
              const newBranchInstance = this.createBranchPreviewLine(node, fixedBranch, branchIndex, branches.length, UnifiedPreviewStates.INTERACTIVE)
              
              if (newBranchInstance) {
                // 将新创建的分支实例添加到现有数组中
                if (Array.isArray(existingPreview)) {
                  existingPreview.push(newBranchInstance)
                } else {
                  // 如果原来是单一预览线，转换为数组
                  this.previewLines.set(nodeId, [existingPreview, newBranchInstance])
                }
                newPreviewLinesCreated++
                
                console.log('✅ [统一预览线管理器] 缺失分支预览线已添加到现有数组:', {
                  nodeId: nodeId,
                  branchId: branch.id,
                  branchLabel: branch.label,
                  totalBranches: Array.isArray(existingPreview) ? existingPreview.length : 2
                })
              }
            })
          }
        }
      }
    })
    
    console.log('✅ [统一预览线管理器] 预览线刷新完成:', {
      totalPreviewLines: this.previewLines.size,
      refreshedNodes: refreshedCount,
      totalBranchesRefreshed: totalBranchesRefreshed,
      restoredHiddenBranches: restoredHiddenBranches,
      newPreviewLinesCreated: newPreviewLinesCreated
    })
  }

  /**
   * 检查分支是否还有真实连接
   * @param {Object} node - 节点对象
   * @param {string} branchId - 分支ID
   * @returns {boolean} 是否有真实连接
   */
  checkBranchHasRealConnection(node, branchId) {
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []
    
    const realConnections = outgoingEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isUnifiedPreview && 
             !edgeData.isPersistentPreview && 
             !edgeData.isPreview &&
             edgeData.type !== 'unified-preview-line' &&
             edgeData.branchId === branchId
    })
    
    console.log('🔍 [统一预览线管理器] 检查分支真实连接:', {
      nodeId: node.id,
      branchId: branchId,
      totalOutgoingEdges: outgoingEdges.length,
      realConnections: realConnections.length,
      hasRealConnection: realConnections.length > 0
    })
    
    return realConnections.length > 0
  }

  /**
   * 检查节点是否还有真实连接
   * @param {Object} node - 节点对象
   * @returns {boolean} 是否有真实连接
   */
  nodeHasRealConnections(node) {
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []
    
    const realConnections = outgoingEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isUnifiedPreview && 
             !edgeData.isPersistentPreview && 
             !edgeData.isPreview &&
             edgeData.type !== 'unified-preview-line'
    })
    
    console.log('🔍 [统一预览线管理器] 检查节点真实连接:', {
      nodeId: node.id,
      totalOutgoingEdges: outgoingEdges.length,
      realConnections: realConnections.length,
      hasRealConnections: realConnections.length > 0
    })
    
    return realConnections.length > 0
  }

  /**
   * 获取当前活跃的预览线（兼容结构化布局）
   * @returns {Array} 预览线数组
   */
  getActivePreviewLines() {
    const activeLines = []
    
    console.log('🔍 [统一预览线管理器] 获取活跃预览线:', {
      totalPreviewInstances: this.previewLines.size
    })
    
    // 遍历所有预览线实例
    this.previewLines.forEach((previewInstance, nodeId) => {
      const node = this.graph.getCellById(nodeId)
      
      if (!node) {
        console.warn('⚠️ [统一预览线管理器] 节点不存在，跳过预览线:', nodeId)
        return
      }
      
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        previewInstance.forEach((instance, branchIndex) => {
          if (instance.line && this.graph.hasCell(instance.line)) {
            const previewLine = {
              id: instance.line.id,
              sourceNode: node,
              targetNode: null, // 统一预览线没有目标节点
              sourcePort: 'out',
              targetPort: null,
              type: 'unified',
              branchId: instance.branchId,
              branchIndex: branchIndex,
              branchLabel: instance.branchLabel,
              position: {
                start: instance.line.getSourcePoint(),
                end: instance.line.getTargetPoint()
              },
              state: instance.state
            }
            activeLines.push(previewLine)
          }
        })
      } else {
        // 单一预览线
        if (previewInstance.line && this.graph.hasCell(previewInstance.line)) {
          const previewLine = {
            id: previewInstance.line.id,
            sourceNode: node,
            targetNode: null,
            sourcePort: 'out',
            targetPort: null,
            type: 'unified',
            branchId: previewInstance.branchId || null,
            position: {
              start: previewInstance.line.getSourcePoint(),
              end: previewInstance.line.getTargetPoint()
            },
            state: previewInstance.state
          }
          activeLines.push(previewLine)
        }
      }
    })
    
    console.log('✅ [统一预览线管理器] 获取活跃预览线完成:', {
      totalActiveLines: activeLines.length,
      branchLines: activeLines.filter(line => line.branchId).length,
      singleLines: activeLines.filter(line => !line.branchId).length
    })
    
    return activeLines
  }

  /**
   * 兼容持久化预览线API
   */
  createPersistentPreview(node) {
    return this.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
  }

  /**
   * 兼容可拖拽预设线API
   */
  createDraggablePreviewLine(node, branchId = null, branchIndex = 0, totalBranches = 1) {
    return this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE, {
      branchId,
      branchIndex,
      totalBranches
    })
  }

  /**
   * 清理过期缓存
   */
  clearExpiredCache() {
    const now = Date.now()
    
    // 清理分支信息缓存
    for (const [nodeId, cache] of this.branchInfoCache.entries()) {
      if ((now - cache.timestamp) > this.cacheTimeout) {
        this.branchInfoCache.delete(nodeId)
      }
    }
    
    // 清理位置缓存
    for (const [nodeId, cache] of this.positionCache.entries()) {
      if ((now - cache.timestamp) > this.cacheTimeout) {
        this.positionCache.delete(nodeId)
      }
    }
  }

  /**
   * 清理指定节点的缓存
   * @param {string} nodeId - 节点ID
   */
  clearNodeCache(nodeId) {
    this.branchInfoCache.delete(nodeId)
    this.positionCache.delete(nodeId)
    console.log('🧹 [统一预览线管理器] 已清理节点缓存:', nodeId)
  }

  /**
   * 清理与指定节点相关的所有拖拽提示点
   * @param {string} nodeId - 节点ID
   */
  cleanupRelatedDragHints(nodeId) {
    const allNodes = this.graph.getNodes()
    const hintNodesToRemove = []
    
    // 查找所有与该节点相关的拖拽提示点
    allNodes.forEach(node => {
      const nodeData = node.getData() || {}
      
      // 检查是否是拖拽提示点
      if (nodeData.isDragHint || nodeData.type === 'drag-hint') {
        // 检查拖拽提示点的ID是否包含目标节点ID
        if (node.id.includes(nodeId)) {
          hintNodesToRemove.push(node)
        }
        
        // 检查拖拽提示点的父预览线是否属于目标节点
        if (nodeData.parentPreviewLine && nodeData.parentPreviewLine.includes(nodeId)) {
          hintNodesToRemove.push(node)
        }
      }
    })
    
    // 移除找到的拖拽提示点
    hintNodesToRemove.forEach(hintNode => {
      try {
        this.graph.removeNode(hintNode)
        console.log('🧹 [统一预览线管理器] 已清理相关拖拽提示点:', {
          nodeId: nodeId,
          hintNodeId: hintNode.id,
          hintNodeData: hintNode.getData()
        })
      } catch (error) {
        console.warn('⚠️ [统一预览线管理器] 清理拖拽提示点时出错:', {
          nodeId: nodeId,
          hintNodeId: hintNode.id,
          error: error.message
        })
      }
    })
    
    console.log('🧹 [统一预览线管理器] 拖拽提示点清理完成:', {
      nodeId: nodeId,
      removedHintNodes: hintNodesToRemove.length
    })
  }

  /**
   * 销毁管理器
   */
  destroy() {
    // 清理所有预览线
    this.previewLines.forEach((instance, nodeId) => {
      this.removePreviewLine(nodeId)
    })
    
    // 移除事件监听器
    this.graph.off('node:added')
    this.graph.off('node:removed')
    this.graph.off('node:move')
    this.graph.off('node:moved')
    this.graph.off('node:mousedown')
    this.graph.off('node:mouseup')
    this.graph.off('edge:added')
    this.graph.off('edge:removed')
    this.graph.off('blank:mouseup')
    
    document.removeEventListener('mousemove', this.handleGlobalMouseMove)
    document.removeEventListener('mouseup', this.handleGlobalMouseUp)
    
    // 清理状态
    this.previewLines.clear()
    this.nodeStates.clear()
    this.eventListeners.clear()
    
    // 清理缓存
    this.branchInfoCache.clear()
    this.positionCache.clear()
    
    // 清理定时器
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval)
      this.cacheCleanupInterval = null
    }
    
    console.log('🧹 [统一预览线管理器] 已销毁 - 包括缓存清理')
  }
}

export default UnifiedPreviewLineManager