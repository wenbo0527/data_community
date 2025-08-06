/**
 * 统一预览线管理器
 * 将持久化预览线和可拖拽预设线合并为一个统一的系统
 * 核心理念：一条预览线，多种状态
 */

// 导入坐标系统管理器
import { coordinateManager } from './CoordinateSystemManager.js'

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
    else if (branch.id === 'unmatch_default' || branch.id === 'default') {
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
  constructor(graph, branchManager, layoutConfig, layoutDirection = 'TB', layoutEngine = null) {
    this.graph = graph
    this.branchManager = branchManager
    this.layoutConfig = layoutConfig
    this.layoutDirection = layoutDirection
    this.layoutEngine = layoutEngine // 布局引擎引用
    
    // 调试模式开关
    this.debugMode = false
    
    // 初始化坐标系统管理器
    this.coordinateManager = coordinateManager
    this.coordinateManager.setGraph(graph)
    
    // 统一存储所有预览线
    this.previewLines = new Map() // key: nodeId, value: PreviewLineInstance
    
    // endpoint存储
    this.endpoints = new Map() // key: hintId, value: hintNode
    
    // 🔧 新增：手工调整的拖拽点位置记录
    this.manuallyAdjustedHints = new Map() // 存储手工调整的拖拽点位置 {hintId: {x, y, timestamp}}
    
    // 节点配置状态管理
    this.nodeStates = new Map() // key: nodeId, value: configState
    
    // 拖拽相关状态
    this.isDragging = false
    this.currentDragLine = null
    this.dragStartPosition = null
    this.isEndpointActive = false
    
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
    
    // 防重复吸附状态管理
    this.isProcessingSnap = false
    this.snappedNodes = new Set()
    
    // 🔧 新增：待处理计算队列机制
    this.pendingCalculations = new Map() // key: nodeId, value: { node, type, timestamp }
    this.layoutEngineReady = false
    
    console.log('🚀 [统一预览线管理器] 初始化完成 - 已启用性能优化、坐标系统管理和待处理计算队列')
  }

  /**
   * 获取动态方向配置
   * 根据当前布局方向返回相应的连接线方向
   * @returns {Object} 包含startDirections和endDirections的配置对象
   */
  getDynamicDirectionConfig() {
    if (this.layoutDirection === 'LR') {
      return {
        startDirections: ['right'],
        endDirections: ['left']
      }
    } else {
      return {
        startDirections: ['bottom'],
        endDirections: ['top']
      }
    }
  }

  /**
   * 更新布局方向
   * @param {string} newDirection - 新的布局方向 ('TB' 或 'LR')
   */
  updateLayoutDirection(newDirection) {
    if (this.layoutDirection !== newDirection) {
      this.layoutDirection = newDirection
      console.log('🔄 [统一预览线管理器] 布局方向已更新:', newDirection)
      // 刷新所有预览线以应用新的方向配置
      this.refreshAllPreviewLines()
    }
  }

  /**
   * 设置布局引擎引用
   * @param {Object} layoutEngine - 布局引擎实例
   */
  setLayoutEngine(layoutEngine) {
    this.layoutEngine = layoutEngine
    this.layoutEngineReady = !!layoutEngine
    
    console.log('🔗 [统一预览线管理器] 布局引擎引用已设置:', {
      引擎类型: layoutEngine?.constructor?.name,
      有getNodeLayerY方法: typeof layoutEngine?.getNodeLayerY === 'function',
      有getNextLayerY方法: typeof layoutEngine?.getNextLayerY === 'function',
      引擎就绪状态: this.layoutEngineReady
    })
    
    // 🔧 关键修复：重新计算所有预览线位置
    if (layoutEngine && this.previewLines.size > 0) {
      console.log('🔄 [统一预览线管理器] 开始重新计算所有预览线位置...')
      this.recalculateAllPreviewPositions()
    }
    
    // 🔧 新增：处理待处理计算队列
    if (layoutEngine && this.pendingCalculations.size > 0) {
      console.log('📋 [统一预览线管理器] 处理待处理计算队列:', this.pendingCalculations.size, '个任务')
      this.processPendingCalculations()
    }
  }

  /**
   * 重新计算所有预览线位置
   * 当布局引擎设置后调用，确保所有预览线使用正确的Y坐标
   */
  recalculateAllPreviewPositions() {
    let recalculatedCount = 0
    let errorCount = 0
    
    this.previewLines.forEach((previewInstance, nodeId) => {
      try {
        const node = previewInstance.sourceNode
        if (!node) {
          console.warn('⚠️ [统一预览线管理器] 节点不存在，跳过重新计算:', nodeId)
          return
        }
        
        const nodePosition = node.getPosition()
        const nodeSize = node.getSize()
        
        if (previewInstance.type === PreviewLineTypes.SINGLE) {
          // 重新计算单一预览线位置
          const newEndPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
          this.updatePreviewLineEndPosition(previewInstance, newEndPosition)
          recalculatedCount++
        } else if (previewInstance.type === PreviewLineTypes.BRANCH) {
          // 重新计算分支预览线位置
          this.recalculateBranchPreviewPositions(previewInstance, node, nodePosition, nodeSize)
          recalculatedCount++
        }
      } catch (error) {
        console.error('❌ [统一预览线管理器] 重新计算预览线位置失败:', nodeId, error)
        errorCount++
      }
    })
    
    console.log('✅ [统一预览线管理器] 预览线位置重新计算完成:', {
      总数: this.previewLines.size,
      成功: recalculatedCount,
      失败: errorCount
    })
   }

  /**
   * 处理待处理计算队列
   * 当布局引擎设置后，处理所有待处理的预览线计算任务
   */
  processPendingCalculations() {
    let processedCount = 0
    let errorCount = 0
    
    this.pendingCalculations.forEach((task, nodeId) => {
      try {
        const { node, type } = task
        
        if (!node || !this.graph.hasCell(node.id)) {
          console.warn('⚠️ [待处理队列] 节点不存在，跳过:', nodeId)
          return
        }
        
        // 根据任务类型执行相应的计算
        if (type === 'create') {
          this.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
        } else if (type === 'update') {
          this.updatePreviewLinePosition(node)
        }
        
        processedCount++
        console.log('✅ [待处理队列] 任务处理完成:', { nodeId, type })
        
      } catch (error) {
        console.error('❌ [待处理队列] 任务处理失败:', nodeId, error)
        errorCount++
      }
    })
    
    // 清空队列
    this.pendingCalculations.clear()
    
    console.log('📋 [待处理队列] 处理完成:', {
      总任务数: processedCount + errorCount,
      成功: processedCount,
      失败: errorCount
    })
  }

  /**
   * 添加任务到待处理计算队列
   * @param {string} nodeId - 节点ID
   * @param {Object} node - 节点对象
   * @param {string} type - 任务类型 ('create' 或 'update')
   */
  addToPendingCalculations(nodeId, node, type) {
    if (!this.layoutEngineReady) {
      this.pendingCalculations.set(nodeId, {
        node,
        type,
        timestamp: Date.now()
      })
      console.log('📋 [待处理队列] 任务已添加:', { nodeId, type, 队列大小: this.pendingCalculations.size })
      return true
    }
    return false
  }

  /**
   * 更新预览线终点位置
   * @param {Object} previewInstance - 预览线实例
   * @param {Object} newEndPosition - 新的终点位置
   */
  updatePreviewLineEndPosition(previewInstance, newEndPosition) {
    if (!previewInstance.line || !newEndPosition) return
    
    try {
      // 更新存储的终点位置
      previewInstance.endPosition = newEndPosition
      
      // 更新X6线条的终点
      const currentTarget = previewInstance.line.getTarget()
      previewInstance.line.setTarget({
        ...currentTarget,
        x: newEndPosition.x,
        y: newEndPosition.y
      })
      
      console.log('🎯 [统一预览线管理器] 预览线位置已更新:', {
        节点ID: previewInstance.sourceNode?.id,
        新位置: newEndPosition
      })
    } catch (error) {
      console.error('❌ [统一预览线管理器] 更新预览线位置失败:', error)
    }
  }

  /**
   * 重新计算分支预览线位置
   * @param {Object} previewInstance - 分支预览线实例
   * @param {Object} node - 源节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   */
  recalculateBranchPreviewPositions(previewInstance, node, nodePosition, nodeSize) {
    if (!previewInstance.branches || !Array.isArray(previewInstance.branches)) {
      console.warn('⚠️ [统一预览线管理器] 分支预览线数据无效')
      return
    }
    
    previewInstance.branches.forEach((branch, index) => {
      try {
        const newEndPosition = this.calculateBranchPreviewPosition(node, nodePosition, nodeSize, index, previewInstance.branches.length)
        
        if (branch.line && newEndPosition) {
          // 更新分支线条的终点
          const currentTarget = branch.line.getTarget()
          branch.line.setTarget({
            ...currentTarget,
            x: newEndPosition.x,
            y: newEndPosition.y
          })
          
          // 更新存储的位置
          branch.endPosition = newEndPosition
        }
      } catch (error) {
        console.error('❌ [统一预览线管理器] 重新计算分支预览线位置失败:', index, error)
      }
    })
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
    this.graph.on('node:config-updated', this.handleNodeConfigUpdated.bind(this))
    
    // 边相关事件
    this.graph.on('edge:added', this.handleEdgeAdded.bind(this))
    this.graph.on('edge:removed', this.handleEdgeRemoved.bind(this))
    
    // 预览线相关事件
    this.graph.on('edge:mousedown', this.handlePreviewLineMouseDown.bind(this))
    this.graph.on('edge:mouseenter', this.handlePreviewLineMouseEnter.bind(this))
    this.graph.on('edge:mouseleave', this.handlePreviewLineMouseLeave.bind(this))
    
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
    console.log('🔄 [统一预览线管理器] 开始初始化现有节点预览线:', {
      totalNodes: nodes.length,
      existingPreviewLines: this.previewLines.size
    })
    
    nodes.forEach(node => {
      // 🔧 修复：检查是否已经存在预览线，避免重复创建
      const existingPreview = this.previewLines.get(node.id)
      if (existingPreview) {
        console.log('⏭️ [统一预览线管理器] 节点已有预览线，跳过:', node.id)
        return
      }
      
      if (this.shouldCreatePreviewLine(node)) {
        console.log('✅ [统一预览线管理器] 为节点创建预览线:', node.id)
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
      }
    })
    
    console.log('✅ [统一预览线管理器] 初始化完成，当前预览线数量:', this.previewLines.size)
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

    // 🔧 新增：如果布局引擎未就绪，添加到待处理队列
    if (!this.layoutEngineReady) {
      const added = this.addToPendingCalculations(node.id, node, 'create')
      if (added) {
        console.log('📋 [统一预览线管理器] 预览线创建任务已加入待处理队列:', node.id)
        return null
      }
    }

    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType

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
    
    return previewInstance
  }

  /**
   * 创建分支预览线
   * @param {Object} node - 源节点
   * @param {string} initialState - 初始状态
   * @param {Object} options - 额外选项
   */
  createBranchPreviewLines(node, initialState, options = {}) {
    const nodeId = node.id
    
    console.log('🔧 [统一预览线管理器] 开始创建分支预览线:', {
      nodeId: nodeId,
      initialState: initialState,
      options: options
    })
    
    // 🔧 修复：检查是否已经存在预览线实例，避免重复创建
    const existingPreview = this.previewLines.get(nodeId)
    if (existingPreview) {
      console.log('⏭️ [统一预览线管理器] 节点已有预览线，跳过重复创建:', {
        nodeId: nodeId,
        existingType: Array.isArray(existingPreview) ? 'branch' : 'single',
        existingCount: Array.isArray(existingPreview) ? existingPreview.length : 1
      })
      return existingPreview
    }
    
    // 获取分支信息，优先使用传入的配置
    const branches = this.getNodeBranches(node, options.config)
    
    console.log('📊 [统一预览线管理器] 获取到分支信息:', {
      nodeId: nodeId,
      branchCount: branches.length,
      branches: branches.map(b => ({ id: b.id, label: b.label }))
    })
    
    const previewInstances = []

    branches.forEach((branch, index) => {
      // 🔧 关键修复：检查该分支是否已有真实连接
      const hasRealConnection = this.checkBranchHasRealConnection(node, branch.id)
      
      if (hasRealConnection) {
        console.log('⏭️ [统一预览线管理器] 分支已有真实连接，跳过预览线创建:', {
          nodeId: nodeId,
          branchId: branch.id,
          branchLabel: branch.label,
          branchIndex: index
        })
        return // 跳过已有连接的分支
      }
      
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
      
      console.log('✅ [统一预览线管理器] 分支预览线创建成功:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index,
        lineId: previewLine.id
      })
    })

    // 只有在有预览线实例时才存储
    if (previewInstances.length > 0) {
      // 存储分支预览线（使用复合键）
      this.previewLines.set(node.id, previewInstances)
    }
    
    console.log('✅ [统一预览线管理器] 分支预览线创建完成:', {
      nodeId: nodeId,
      totalBranches: branches.length,
      createdCount: previewInstances.length,
      skippedCount: branches.length - previewInstances.length,
      totalPreviewLines: this.previewLines.size
    })
    
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
    
    // 🔧 多线偏移优化：分支预览线创建完成后应用偏移
    if (totalBranches > 1) {
      setTimeout(() => {
        this.optimizeOverlappingPreviewLines(node)
      }, 100) // 稍长延迟确保所有分支线都创建完成
    }
    
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
    
    // 🔧 多线偏移处理：检查是否有其他预览线连接到相同目标
    const offsetConfig = this.calculateMultiLineOffset(sourceNode, endPosition, branchIndex, totalBranches)
    
    // 使用端口连接而不是坐标点，确保节点移动时预览线跟随移动
    console.log('📍 [统一预览线管理器] 使用端口连接创建预览线:', {
      nodeId: sourceNode.id,
      branchIndex: branchIndex,
      branchId: branchId,
      sourcePort: 'out',
      targetPosition: endPosition,
      offsetConfig: offsetConfig
    })
    
    // 生成唯一ID
    const lineId = `unified_preview_${sourceNode.id}_${branchId || 'single'}_${Date.now()}`
    
    // 🔧 路由器选择逻辑
    const useOrthRouter = totalBranches > 1 && Math.abs(offsetConfig.offset) > 5
    const routerName = useOrthRouter ? 'orth' : 'normal'
    
    console.log('🛤️ [预览线路由器] 路由器选择:', {
      sourceNodeId: sourceNode.id,
      branchId: branchId,
      totalBranches: totalBranches,
      offsetValue: offsetConfig.offset,
      routerSelected: routerName,
      reason: useOrthRouter ? '多分支需要偏移路径' : '单分支使用直线路径'
    })
    
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
        name: routerName,
        args: useOrthRouter ? {
          padding: 15, // 统一使用15，与其他配置保持一致
          step: 10, // 统一使用10
          ...this.getDynamicDirectionConfig(),
          offset: offsetConfig.offset,
          excludeEnds: offsetConfig.excludeEnds,
          // 🔧 简化路径约束
          maxAllowedDirectionChange: 1,
          perpendicular: true
        } : {}
      },
      attrs: {
        line: {
          stroke: offsetConfig.strokeColor, // 使用偏移配置的颜色
          strokeWidth: offsetConfig.strokeWidth,
          strokeDasharray: offsetConfig.dashArray,
          opacity: 0.6,
          cursor: 'default',
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
            fill: offsetConfig.strokeColor
          }
        }
      },
      zIndex: 1001 + branchIndex, // 🔧 根据分支索引调整层级
      data: {
        type: 'unified-preview-line',
        sourceNodeId: sourceNode.id,
        previewType: type,
        branchId: branchId,
        branchIndex: branchIndex,
        totalBranches: totalBranches,
        isUnifiedPreview: true,
        offsetConfig: offsetConfig // 保存偏移配置用于后续调整
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

    // 🔧 多线偏移优化：创建完成后立即应用偏移配置
    if (totalBranches > 1) {
      setTimeout(() => {
        this.optimizeOverlappingPreviewLines(sourceNode)
      }, 50) // 短暂延迟确保线条完全创建
    }

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
   * 计算多线偏移配置
   * 当多条预览线连接到相同目标时，提供偏移和视觉区分
   * @param {Object} sourceNode - 源节点
   * @param {Object} endPosition - 终点位置
   * @param {number} branchIndex - 分支索引
   * @param {number} totalBranches - 总分支数
   * @returns {Object} 偏移配置
   */
  calculateMultiLineOffset(sourceNode, endPosition, branchIndex, totalBranches) {
    // 🎨 颜色配置：为不同分支提供不同颜色
    const branchColors = [
      '#1890ff', // 蓝色
      '#fa8c16', // 橙色
      '#52c41a', // 绿色
      '#722ed1', // 紫色
      '#eb2f96', // 粉色
      '#13c2c2', // 青色
      '#f5222d', // 红色
      '#faad14'  // 黄色
    ]
    
    // 🔧 基础偏移配置
    const baseConfig = {
      padding: 15,
      step: 15,
      offset: 0,
      excludeEnds: [],
      strokeColor: '#d9d9d9',
      strokeWidth: 2,
      dashArray: '5,5'
    }
    
    // 🔧 单线情况：使用默认配置
    if (totalBranches <= 1) {
      return baseConfig
    }
    
    // 🔧 多线情况：计算偏移和视觉区分
    const colorIndex = branchIndex % branchColors.length
    const strokeColor = branchColors[colorIndex]
    
    // 计算水平偏移：每条线在不同的水平位置
    const maxOffset = 30 // 最大偏移距离
    const offsetStep = totalBranches > 1 ? maxOffset / (totalBranches - 1) : 0
    const horizontalOffset = branchIndex * offsetStep - maxOffset / 2
    
    // 计算路由器参数偏移
    const paddingOffset = Math.abs(horizontalOffset) * 0.5
    const stepOffset = Math.abs(horizontalOffset) * 0.3
    
    console.log('🎨 [多线偏移] 计算偏移配置:', {
      sourceNodeId: sourceNode.id,
      branchIndex: branchIndex,
      totalBranches: totalBranches,
      horizontalOffset: horizontalOffset,
      strokeColor: strokeColor,
      paddingOffset: paddingOffset,
      stepOffset: stepOffset
    })
    
    return {
      padding: baseConfig.padding + paddingOffset,
      step: baseConfig.step + stepOffset,
      offset: horizontalOffset,
      excludeEnds: horizontalOffset !== 0 ? ['source'] : [],
      strokeColor: strokeColor,
      strokeWidth: 2.5, // 稍微加粗以提高可见性
      dashArray: branchIndex % 2 === 0 ? '5,5' : '8,3' // 交替使用不同的虚线样式
    }
  }

  /**
   * 检查并优化重叠的预览线
   * 当检测到多条预览线路径重叠时，自动应用偏移优化
   * @param {Object} sourceNode - 源节点
   */
  optimizeOverlappingPreviewLines(sourceNode) {
    const previewInstance = this.previewLines.get(sourceNode.id)
    if (!previewInstance) return
    
    // 处理分支预览线的重叠优化
    if (Array.isArray(previewInstance)) {
      console.log('🔧 [重叠优化] 开始优化分支预览线重叠:', {
        sourceNodeId: sourceNode.id,
        branchCount: previewInstance.length
      })
      
      previewInstance.forEach((instance, index) => {
        if (instance.line) {
          // 重新计算偏移配置
          const endPosition = this.getLineEndPosition(instance.line)
          const offsetConfig = this.calculateMultiLineOffset(
            sourceNode, 
            endPosition, 
            index, 
            previewInstance.length
          )
          
          // 应用新的偏移配置
          this.applyOffsetToLine(instance.line, offsetConfig)
        }
      })
    }
  }

  /**
   * 获取预览线的终点位置
   * @param {Object} line - 预览线对象
   * @returns {Object} 终点位置
   */
  getLineEndPosition(line) {
    const target = line.getTarget()
    if (target.x !== undefined && target.y !== undefined) {
      return { x: target.x, y: target.y }
    }
    
    // 如果目标是节点，获取节点位置
    if (target.cell) {
      const targetNode = this.graph.getCellById(target.cell)
      if (targetNode) {
        const pos = targetNode.getPosition()
        const size = targetNode.getSize()
        return {
          x: pos.x + size.width / 2,
          y: pos.y
        }
      }
    }
    
    return { x: 0, y: 0 }
  }

  /**
   * 将偏移配置应用到预览线
   * @param {Object} line - 预览线对象
   * @param {Object} offsetConfig - 偏移配置
   */
  applyOffsetToLine(line, offsetConfig) {
    // 更新路由器配置
    line.setRouter({
      name: 'orth',
      args: {
        padding: offsetConfig.padding,
        step: offsetConfig.step,
        ...this.getDynamicDirectionConfig(),
        offset: offsetConfig.offset,
        excludeEnds: offsetConfig.excludeEnds
      }
    })
    
    // 更新视觉样式
    line.attr({
      line: {
        stroke: offsetConfig.strokeColor,
        strokeWidth: offsetConfig.strokeWidth,
        strokeDasharray: offsetConfig.dashArray,
        targetMarker: {
          fill: offsetConfig.strokeColor
        }
      }
    })
    
    // 更新数据中的偏移配置
    const data = line.getData() || {}
    data.offsetConfig = offsetConfig
    line.setData(data)
    
    console.log('✅ [偏移应用] 已应用偏移配置到预览线:', {
      lineId: line.id,
      offsetConfig: offsetConfig
    })
  }
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
   * 添加交互能力 - 直接在预览线终点实现拖拽功能
   */
  addInteractivity(previewInstance) {
    const { line } = previewInstance
    
    // 为预览线添加拖拽功能，不再创建独立的拖拽点
    this.addPreviewLineEndpointDrag(previewInstance)
    
    // 注意：预览线的鼠标事件现在通过X6的标准事件系统处理
    // 在setupEventListeners方法中已经绑定了edge:mousedown等事件
  }

  /**
   * 移除交互能力
   */
  removeInteractivity(previewInstance) {
    const { line } = previewInstance
    
    // 移除预览线终点拖拽功能
    this.removePreviewLineEndpointDrag(previewInstance)
    
    // 注意：预览线的鼠标事件通过X6的标准事件系统处理，无需手动移除
  }

  /**
   * 为预览线终点添加拖拽功能
   */
  addPreviewLineEndpointDrag(previewInstance) {
    const { line, sourceNode } = previewInstance
    
    // 设置预览线终点的可视化样式
    this.updatePreviewLineEndpointStyle(previewInstance, false)
    
    // 设置预览线终点拖拽功能
    this.setupPreviewLineEndpointDrag(line)
    
    // 存储预览线实例以便后续访问
    if (!this.endpointDragInstances) {
      this.endpointDragInstances = new Map()
    }
    this.endpointDragInstances.set(line.id, previewInstance)
    
    console.log('✅ [预览线终点] 添加拖拽功能:', {
      lineId: line.id,
      sourceNodeId: sourceNode?.id,
      branchId: previewInstance.branchId
    })
  }

  /**
   * 移除预览线终点拖拽功能
   */
  removePreviewLineEndpointDrag(previewInstance) {
    const { line } = previewInstance
    
    if (this.endpointDragInstances) {
      this.endpointDragInstances.delete(line.id)
    }
    
    // 重置预览线样式
    this.updatePreviewLineEndpointStyle(previewInstance, false)
    
    console.log('🗑️ [预览线终点] 移除拖拽功能:', line.id)
  }

  /**
   * 检查鼠标点击是否在预览线终点附近
   */
  isClickNearEndpoint(event, previewInstance) {
    const { line } = previewInstance
    const targetPoint = line.getTargetPoint()
    
    if (!targetPoint) return false
    
    // 获取鼠标在画布上的坐标
    const rect = this.graph.container.getBoundingClientRect()
    const domX = event.clientX - rect.left
    const domY = event.clientY - rect.top
    
    // 转换为逻辑坐标
    let logicalCoords = { x: domX, y: domY }
    if (this.coordinateManager) {
      logicalCoords = this.coordinateManager.DOMToLogical(domX, domY)
    }
    
    // 计算距离
    const distance = Math.sqrt(
      Math.pow(logicalCoords.x - targetPoint.x, 2) + 
      Math.pow(logicalCoords.y - targetPoint.y, 2)
    )
    
    // 如果距离小于20像素，认为是点击在终点附近
    const isNearEndpoint = distance < 20
    
    console.log('🎯 [预览线终点] 点击检测:', {
      lineId: line.id,
      clickPosition: logicalCoords,
      endpointPosition: targetPoint,
      distance: distance,
      isNearEndpoint: isNearEndpoint
    })
    
    return isNearEndpoint
  }

  /**
   * 高亮预览线终点
   */
  highlightPreviewLineEndpoint(previewInstance, highlight) {
    this.updatePreviewLineEndpointStyle(previewInstance, highlight)
  }

  /**
   * 更新预览线终点样式
   */
  updatePreviewLineEndpointStyle(previewInstance, highlight) {
    // 🔧 添加安全检查，确保previewInstance和line存在
    if (!previewInstance) {
      console.warn('⚠️ [统一预览线管理器] updatePreviewLineEndpointStyle: 预览线实例不存在')
      return
    }
    
    if (!previewInstance.line || previewInstance.line.removed) {
      console.warn('⚠️ [统一预览线管理器] updatePreviewLineEndpointStyle: 预览线实例或line对象不存在', {
        hasPreviewInstance: !!previewInstance,
        hasLine: !!(previewInstance && previewInstance.line),
        lineRemoved: !!(previewInstance && previewInstance.line && previewInstance.line.removed)
      })
      
      // 🔧 如果line对象不存在或已被删除，尝试重新创建预览线
      if (previewInstance.sourceNode && previewInstance.branchId) {
        console.log('🔄 [统一预览线管理器] 尝试重新创建已删除的预览线:', {
          nodeId: previewInstance.sourceNode.id,
          branchId: previewInstance.branchId,
          branchLabel: previewInstance.branchLabel
        })
        
        // 重新创建分支预览线
        this.createBranchPreviewLine(
          previewInstance.sourceNode, 
          previewInstance.branchId, 
          previewInstance.branchLabel,
          previewInstance.endPosition
        )
      } else if (previewInstance.sourceNode) {
        console.log('🔄 [统一预览线管理器] 尝试重新创建已删除的单一预览线:', {
          nodeId: previewInstance.sourceNode.id
        })
        
        // 重新创建单一预览线
        this.createUnifiedPreviewLine(previewInstance.sourceNode, UnifiedPreviewStates.INTERACTIVE)
      }
      
      return
    }
    
    const { line } = previewInstance
    
    // 🔧 确保line对象有setAttrs方法
    if (typeof line.setAttrs !== 'function') {
      console.warn('⚠️ [统一预览线管理器] updatePreviewLineEndpointStyle: line对象没有setAttrs方法', {
        lineId: line.id,
        lineType: typeof line,
        hasSetAttrs: typeof line.setAttrs
      })
      return
    }
    
    try {
      if (highlight) {
        // 高亮状态：增加线宽，改变颜色，添加终点标记
        line.setAttrs({
          line: {
            strokeWidth: 3,
            stroke: '#4080FF',
            cursor: 'grab'
          }
        })
        
        // 在终点添加可视化标记
        this.addEndpointMarker(previewInstance)
      } else {
        // 正常状态：恢复原始样式
        line.setAttrs({
          line: {
            strokeWidth: 2,
            stroke: '#1890ff',
            cursor: 'default'
          }
        })
        
        // 移除终点标记
        this.removeEndpointMarker(previewInstance)
      }
    } catch (error) {
      console.error('💥 [统一预览线管理器] updatePreviewLineEndpointStyle 执行失败:', {
        error: error.message,
        lineId: line.id,
        highlight: highlight
      })
    }
  }

  /**
   * 添加终点可视化标记
   */
  addEndpointMarker(previewInstance) {
    const { line } = previewInstance
    const targetPoint = line.getTargetPoint()
    
    if (!targetPoint || previewInstance.endpointMarker) return
    
    // 创建终点标记
    const marker = this.graph.addNode({
      id: `endpoint_marker_${line.id}`,
      shape: 'circle',
      x: targetPoint.x - 8,
      y: targetPoint.y - 8,
      width: 16,
      height: 16,
      attrs: {
        body: {
          fill: '#4080FF',
          stroke: '#fff',
          strokeWidth: 2,
          cursor: 'grab'
        }
      },
      zIndex: 1002,
      data: {
        isEndpointMarker: true,
        parentPreviewLine: line.id
      }
    })
    
    previewInstance.endpointMarker = marker
  }

  /**
   * 移除终点可视化标记
   */
  removeEndpointMarker(previewInstance) {
    if (previewInstance.endpointMarker) {
      this.graph.removeNode(previewInstance.endpointMarker)
      previewInstance.endpointMarker = null
    }
  }

  /**
   * 开始预览线拖拽 - 适配预览线终点拖拽
   */
  startPreviewLineDrag(previewInstance, event) {
    this.isDragging = true
    
    // 设置当前拖拽的预览线实例
    this.currentDragLine = {
      ...previewInstance,
      // 确保分支信息完整
      branchId: previewInstance.branchId || 'default',
      branchLabel: previewInstance.branchLabel || '',
      sourceNodeId: previewInstance.sourceNode?.id
    }
    
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
    
    // 高亮预览线终点，表示正在拖拽
    this.highlightPreviewLineEndpoint(previewInstance, true)
    
    // 更新预览线样式为拖拽状态
    previewInstance.line.setAttrs({
      line: {
        strokeWidth: 4,
        stroke: '#ff4d4f',
        cursor: 'grabbing'
      }
    })
    
    // 阻止事件冒泡
    if (event.stopPropagation) {
      event.stopPropagation()
    }
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
    
    // 先清理已存在的预览线，避免重复创建
    if (this.previewLines.has(node.id)) {
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
      
      // 创建预览线
      const result = await this.createUnifiedPreviewLineWithRetry(node, UnifiedPreviewStates.INTERACTIVE, {
        branchCount: branchCount,
        config: config
      })
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
      // 🔧 修复：临时保存拖拽状态，确保拖拽点能被正确删除
      const originalIsDragging = this.isDragging
      const originalCurrentDragLine = this.currentDragLine
      
      if (Array.isArray(previewInstance)) {
        // 分支预览线 - 只隐藏特定分支的预览线
        if (branchId) {
          const targetInstance = previewInstance.find(instance => 
            instance.branchId === branchId
          )
          if (targetInstance) {
            this.setPreviewLineState(targetInstance, UnifiedPreviewStates.HIDDEN)
            
            console.log('🔄 [统一预览线管理器] 特定分支预览线已隐藏:', {
              nodeId: node.id,
              branchId: branchId,
              branchLabel: branchLabel
            })
          }
        } else {
          // 如果没有指定分支ID，隐藏所有分支预览线（向后兼容）
          previewInstance.forEach(instance => {
            this.setPreviewLineState(instance, UnifiedPreviewStates.HIDDEN)
          })
          console.log('🔄 [统一预览线管理器] 所有分支预览线已隐藏:', node.id)
        }
      } else {
        // 单一预览线
        this.setPreviewLineState(previewInstance, UnifiedPreviewStates.HIDDEN)
        
        console.log('🔄 [统一预览线管理器] 单一预览线已隐藏:', {
          nodeId: node.id,
          branchLabel: branchLabel
        })
      }
      
      // 恢复拖拽状态
      this.isDragging = originalIsDragging
      this.currentDragLine = originalCurrentDragLine
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
            // 🔧 检查预览线的line对象是否存在，如果不存在则重新创建
            if (!targetInstance.line || targetInstance.line.removed) {
              console.log('🔄 [统一预览线管理器] 预览线line对象不存在，重新创建分支预览线:', {
                nodeId: node.id,
                branchId: branchId,
                branchLabel: branchLabel
              })
              
              // 重新创建该分支的预览线
              this.createBranchPreviewLine(node, branchId, branchLabel, targetInstance.endPosition)
              return
            }
            
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
          } else {
            // 如果找不到目标实例，创建新的分支预览线
            console.log('🔄 [统一预览线管理器] 未找到目标分支实例，创建新的分支预览线:', {
              nodeId: node.id,
              branchId: branchId,
              branchLabel: branchLabel
            })
            this.createBranchPreviewLine(node, branchId, branchLabel)
          }
        } else {
          // 如果没有指定分支ID，恢复所有分支预览线（向后兼容）
          previewInstance.forEach(instance => {
            // 🔧 检查每个分支的line对象是否存在
            if (!instance.line || instance.line.removed) {
              console.log('🔄 [统一预览线管理器] 分支预览线line对象不存在，重新创建:', {
                nodeId: node.id,
                branchId: instance.branchId,
                branchLabel: instance.branchLabel
              })
              this.createBranchPreviewLine(node, instance.branchId, instance.branchLabel, instance.endPosition)
              return
            }
            
            // 重新计算预览线的结束位置
            this.recalculatePreviewLineEndPosition(instance)
            this.setPreviewLineState(instance, UnifiedPreviewStates.INTERACTIVE)
          })
          console.log('🔄 [统一预览线管理器] 所有分支预览线已恢复:', node.id)
        }
      } else {
        // 单一预览线
        // 🔧 检查预览线的line对象是否存在，如果不存在则重新创建
        if (!previewInstance.line || previewInstance.line.removed) {
          console.log('🔄 [统一预览线管理器] 单一预览线line对象不存在，重新创建:', {
            nodeId: node.id,
            branchLabel: branchLabel
          })
          
          // 重新创建单一预览线
          this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
          return
        }
        
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
    } else {
      // 如果预览线实例不存在，创建新的预览线
      console.log('🔄 [统一预览线管理器] 预览线实例不存在，创建新的预览线:', {
        nodeId: node.id,
        branchId: branchId,
        branchLabel: branchLabel
      })
      
      if (branchId) {
        this.createBranchPreviewLine(node, branchId, branchLabel)
      } else {
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
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
   * 处理节点配置更新事件
   * @param {Object} data - 事件数据，包含节点、节点类型和配置信息
   */
  handleNodeConfigUpdated(data) {
    const { node, nodeType, config } = data
    const nodeData = node.getData() || {}
    
    console.log('🔄 [统一预览线管理器] 节点配置已更新:', {
      nodeId: node.id,
      nodeType: nodeType,
      isConfigured: nodeData.isConfigured,
      hasConfig: !!nodeData.config
    })
    
    // 清理该节点的缓存，确保使用最新的配置信息
    this.clearNodeCache(node.id)
    
    // 判断是否是分支节点
    const isBranchNode = this.isBranchNode(node, config)
    
    if (isBranchNode) {
      // 分支节点：智能更新预览线
      console.log('🌿 [统一预览线管理器] 分支节点配置更新，智能更新预览线:', {
        nodeId: node.id,
        nodeType: nodeType
      })
      
      // 获取当前分支信息
      const branches = this.getNodeBranches(node, config)
      const existingPreview = this.previewLines.get(node.id)
      
      // 检查每个分支的连接状态
      const branchConnectionStatus = branches.map(branch => ({
        ...branch,
        hasConnection: this.checkBranchHasRealConnection(node, branch.id)
      }))
      
      console.log('🔍 [统一预览线管理器] 分支连接状态检查:', {
        nodeId: node.id,
        branches: branchConnectionStatus.map(b => ({
          id: b.id,
          label: b.label,
          hasConnection: b.hasConnection
        }))
      })
      
      // 如果有未连接的分支，需要创建/更新预览线
      const unconnectedBranches = branchConnectionStatus.filter(b => !b.hasConnection)
      
      if (unconnectedBranches.length > 0) {
        console.log('✅ [统一预览线管理器] 发现未连接的分支，创建预览线:', {
          nodeId: node.id,
          unconnectedBranches: unconnectedBranches.map(b => ({ id: b.id, label: b.label }))
        })
        
        // 移除旧的预览线
        this.removePreviewLine(node.id)
        
        // 创建新的分支预览线，传递配置信息
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE, { config })
      } else {
        console.log('⏭️ [统一预览线管理器] 所有分支都已连接，移除预览线:', {
          nodeId: node.id,
          totalBranches: branches.length
        })
        
        // 所有分支都已连接，移除预览线
        this.removePreviewLine(node.id)
      }
    } else {
      // 非分支节点：使用原有逻辑
      if (this.shouldCreatePreviewLine(node)) {
        console.log('✅ [统一预览线管理器] 配置完成后创建预览线:', {
          nodeId: node.id,
          nodeType: nodeType
        })
        
        // 先移除可能存在的旧预览线
        this.removePreviewLine(node.id)
        
        // 创建新的预览线，传递配置信息以便正确处理分支节点
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE, { config })
      } else {
        console.log('⏭️ [统一预览线管理器] 节点配置更新后仍不应创建预览线:', {
          nodeId: node.id,
          nodeType: nodeType,
          isConfigured: nodeData.isConfigured
        })
      }
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
    const isEndpoint = nodeData.isEndpoint || nodeType === 'endpoint'
    const isPreviewRelated = nodeData.isUnifiedPreview || nodeData.isPersistentPreview || 
                            nodeData.isPreview || nodeType === 'unified-preview-line'
    
    if (isEndpoint || isPreviewRelated) {
      console.log('🗑️ [统一预览线管理器] 跳过拖拽提示点或预览相关节点的删除处理:', {
        nodeId: node.id,
        nodeType: nodeType,
        isEndpoint: isEndpoint,
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
      currentEndpoints: this.endpoints ? Array.from(this.endpoints.keys()) : [],
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
    this.cleanupRelatedEndpoints(node.id)
    
    console.log('🗑️ [统一预览线管理器] 调用预览线恢复方法')
    // 3. 检查是否有其他节点连接到被删除的节点，如果有，恢复它们的预览线
    this.restorePreviewLinesAfterNodeDeletion(node, incomingEdges)
    
    console.log('🗑️ [统一预览线管理器] 节点删除事件处理完成:', {
      nodeId: node.id,
      remainingPreviewLines: Array.from(this.previewLines.keys()),
      remainingEndpoints: this.endpoints ? Array.from(this.endpoints.keys()) : []
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
      isEndpoint: nodeData.isEndpoint,
      isConfigured: nodeData.isConfigured
    })
    
    // 检查是否是拖拽提示点
    if (nodeData.isEndpoint || nodeData.type === 'endpoint') {
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
      // 检查 this.graph 是否存在且有 getCellById 方法
      if (!this.graph || typeof this.graph.getCellById !== 'function') {
        console.error('❌ [统一预览线管理器] this.graph 不存在或 getCellById 方法不可用')
        return
      }
      
      // 创建一个临时节点对象用于位置更新
      const targetNode = this.graph.getCellById(targetNodeId)
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
    if (nodeData.isEndpoint || nodeData.type === 'endpoint') {
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
    if (this.isEndpointActive) {
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
   * 处理预览线鼠标按下事件
   */
  handlePreviewLineMouseDown(e) {
    const { edge } = e
    console.log('🖱️ [统一预览线管理器] 预览线鼠标按下事件:', {
      edgeId: edge.id,
      edgeData: edge.getData()
    })
    
    // 查找对应的预览线实例
    const previewInstance = this.findPreviewInstanceByEdgeId(edge.id)
    if (previewInstance) {
      console.log('✅ [统一预览线管理器] 找到预览线实例，开始拖拽')
      this.startPreviewLineDrag(previewInstance, e)
    } else {
      console.warn('⚠️ [统一预览线管理器] 未找到预览线实例:', edge.id)
    }
  }

  /**
   * 处理预览线鼠标进入事件
   */
  handlePreviewLineMouseEnter(e) {
    const { edge } = e
    console.log('🖱️ [统一预览线管理器] 预览线鼠标进入事件:', edge.id)
    
    // 查找对应的预览线实例
    const previewInstance = this.findPreviewInstanceByEdgeId(edge.id)
    if (previewInstance) {
      this.setPreviewLineState(previewInstance, UnifiedPreviewStates.HOVER)
    }
  }

  /**
   * 处理预览线鼠标离开事件
   */
  handlePreviewLineMouseLeave(e) {
    const { edge } = e
    console.log('🖱️ [统一预览线管理器] 预览线鼠标离开事件:', edge.id)
    
    // 查找对应的预览线实例
    const previewInstance = this.findPreviewInstanceByEdgeId(edge.id)
    if (previewInstance && !this.isDragging) {
      this.setPreviewLineState(previewInstance, UnifiedPreviewStates.INTERACTIVE)
    }
  }

  /**
   * 根据边ID查找预览线实例
   */
  findPreviewInstanceByEdgeId(edgeId) {
    for (const [nodeId, previewInstance] of this.previewLines) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        const targetInstance = previewInstance.find(instance => 
          instance.line.id === edgeId
        )
        if (targetInstance) {
          return targetInstance
        }
      } else {
        // 单一预览线
        if (previewInstance.line.id === edgeId) {
          return previewInstance
        }
      }
    }
    return null
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
    const edgeData = edge.getData() || {}

    // 跳过预览线的删除事件，只处理真实连线的删除
    if (edgeData.isUnifiedPreview || edgeData.isPersistentPreview || edgeData.isPreview || 
        edgeData.type === 'unified-preview-line' || edgeData.type === 'preview-line') {
      console.log('⏭️ [统一预览线管理器] 跳过预览线删除事件:', {
        edgeId: edge.id,
        edgeType: edgeData.type,
        isPreview: edgeData.isUnifiedPreview || edgeData.isPersistentPreview || edgeData.isPreview
      })
      return
    }
    
    const sourceNode = edge.getSourceNode()
    
    if (sourceNode) {
      // 获取边数据中的分支ID和标签
      const branchId = edgeData.branchId
      const branchLabel = edgeData.branchLabel
      
      console.log('🔗 [统一预览线管理器] 真实连线删除，恢复预览线:', {
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
    if (!node) {
      console.log('⏭️ [统一预览线管理器] 节点为空，跳过预览线创建')
      return false
    }
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    console.log('🔍 [统一预览线管理器] 检查是否应该创建预览线:', {
      nodeId: node.id,
      nodeType: nodeType,
      nodeData: nodeData
    })
    
    // 🎯 新增：检查是否为强制更新模式
    if (nodeData._forcePreviewUpdate) {
      console.log('🔄 [统一预览线管理器] 强制更新模式，跳过连接检查:', node.id)
      return true
    }
    
    // 跳过拖拽提示点
    if (nodeData.isEndpoint || nodeData.type === 'endpoint' || nodeType === 'endpoint') {
      console.log('⏭️ [统一预览线管理器] 跳过拖拽提示点:', node.id)
      return false
    }
    
    // 跳过结束节点
    if (nodeType === 'end' || nodeType === 'finish') {
      console.log('⏭️ [统一预览线管理器] 跳过结束节点:', node.id)
      return false
    }
    
    // 跳过预览线相关的节点
    if (nodeData.isUnifiedPreview || nodeData.isPersistentPreview || nodeData.isPreview) {
      console.log('⏭️ [统一预览线管理器] 跳过预览线相关节点:', node.id)
      return false
    }
    
    // 🔧 修改：对分支节点进行特殊处理，检查每个分支的连接情况
    // 检查节点是否已有连接
    let hasConnections = false
    
    // 判断是否是分支节点
    const isBranchNode = this.isBranchNode(node)
    
    if (isBranchNode) {
      // 分支节点：检查是否所有分支都已有连接
      const branches = this.getNodeBranches(node)
      const outgoingEdges = this.graph.getOutgoingEdges(node) || []
      
      // 获取真实连接的分支ID
      const connectedBranches = new Set()
      outgoingEdges.forEach(edge => {
        const edgeData = edge.getData() || {}
        const isRealConnection = !edgeData.isUnifiedPreview && 
                                !edgeData.isPersistentPreview && 
                                !edgeData.isPreview &&
                                edgeData.type !== 'unified-preview-line' &&
                                (excludeEdgeId ? edge.id !== excludeEdgeId : true)
        
        if (isRealConnection && edgeData.branchId) {
          connectedBranches.add(edgeData.branchId)
        }
      })
      
      // 检查是否所有分支都已连接
      const allBranchesConnected = branches.every(branch => connectedBranches.has(branch.id))
      hasConnections = allBranchesConnected
      
      console.log('🔗 [统一预览线管理器] 分支节点连接检查结果:', {
        nodeId: node.id,
        nodeType: nodeType,
        totalBranches: branches.length,
        connectedBranches: Array.from(connectedBranches),
        allBranchesConnected: allBranchesConnected,
        branches: branches.map(b => ({ id: b.id, label: b.label, connected: connectedBranches.has(b.id) }))
      })
    } else {
      // 非分支节点：检查是否有任何出向连接
      hasConnections = this.hasExistingConnections(node, excludeEdgeId)
      
      console.log('🔗 [统一预览线管理器] 单一节点连接检查结果:', {
        nodeId: node.id,
        nodeType: nodeType,
        hasConnections: hasConnections
      })
    }
    
    // 跳过已有连接的节点（排除指定的边）
    if (hasConnections) {
      console.log('⏭️ [统一预览线管理器] 跳过已有连接的节点:', node.id)
      return false
    }
    
    // 🔧 优化：智能配置状态检查，支持多种配置验证方式
    const configValidation = this.validateNodeConfiguration(node, nodeType, nodeData)
    
    console.log('⚙️ [统一预览线管理器] 节点配置检查:', {
      nodeId: node.id,
      nodeType: nodeType,
      isConfigured: configValidation.isConfigured,
      hasConfig: configValidation.hasConfig,
      hasBranchData: configValidation.hasBranchData,
      configuredFlag: !!nodeData.isConfigured,
      validationMethod: configValidation.method,
      reason: configValidation.reason
    })
    
    if (!configValidation.isConfigured) {
      console.log('⏭️ [统一预览线管理器] 跳过未配置节点的预览线创建:', {
        nodeId: node.id,
        nodeType: nodeType,
        reason: configValidation.reason,
        validationDetails: configValidation
      })
      return false
    }
    
    console.log('✅ [统一预览线管理器] 节点应该创建预览线:', {
      nodeId: node.id,
      nodeType: nodeType
    })
    
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
   * 检查节点是否有任何输入连接（排除预览线）
   * @param {Object} node - 节点
   * @returns {boolean} 是否有输入连接
   */
  hasAnyIncomingConnections(node) {
    const edges = this.graph.getConnectedEdges(node, { incoming: true })
    
    // 过滤掉预览线，只检查真实的业务连接
    const realConnections = edges.filter(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isUnifiedPreview && 
             !edgeData.isPersistentPreview && 
             !edgeData.isPreview &&
             edgeData.type !== 'unified-preview-line' &&
             edgeData.type !== 'preview-line'
    })
    
    console.log('🔍 [统一预览线管理器] 检查节点输入连接:', {
      nodeId: node.id,
      totalIncomingEdges: edges.length,
      realConnections: realConnections.length,
      hasIncomingConnections: realConnections.length > 0
    })
    
    return realConnections.length > 0
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
    
    // 检查节点是否有存储的分支数据，但需要验证这些分支是否基于有效配置
    if (nodeConfig.branches && Array.isArray(nodeConfig.branches)) {
      // 对于分流节点，需要验证是否有真实的配置支持这些分支
      const isValidBranchConfig = this.validateStoredBranches(nodeType, nodeConfig, nodeId)
      
      if (isValidBranchConfig) {
        console.log('🔄 [统一预览线管理器] 使用存储的分支数据:', nodeConfig.branches)
        branches = nodeConfig.branches
      } else {
        console.log('⚠️ [统一预览线管理器] 存储的分支数据无效，重新生成:', {
          nodeId: nodeId,
          nodeType: nodeType,
          storedBranches: nodeConfig.branches.length
        })
        // 根据节点类型和配置重新生成分支
        branches = this.generateBranchesByType(nodeType, nodeConfig, nodeId)
      }
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
   * 智能验证节点配置状态
   * @param {Object} node - 节点对象
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeData - 节点数据
   * @returns {Object} 验证结果 { isConfigured, hasConfig, hasBranchData, method, reason }
   */
  validateNodeConfiguration(node, nodeType, nodeData) {
    const nodeConfig = nodeData.config || {}
    
    // 方法1：检查 isConfigured 标志
    if (nodeData.isConfigured === true) {
      return {
        isConfigured: true,
        hasConfig: !!nodeData.config,
        hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
        method: 'isConfigured_flag',
        reason: '节点标记为已配置'
      }
    }
    
    // 方法2：检查是否有实际配置数据
    const hasConfigData = nodeConfig && Object.keys(nodeConfig).length > 0
    if (hasConfigData) {
      // 对于分流节点，需要验证配置的有效性
      const isBranchNode = this.isBranchNode(node)
      
      if (isBranchNode) {
        const isValidBranchConfig = this.validateStoredBranches(nodeType, nodeConfig, node.id)
        if (isValidBranchConfig) {
          return {
            isConfigured: true,
            hasConfig: true,
            hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
            method: 'valid_branch_config',
            reason: '分流节点有有效的配置数据'
          }
        } else {
          return {
            isConfigured: false,
            hasConfig: true,
            hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
            method: 'invalid_branch_config',
            reason: '分流节点配置数据无效'
          }
        }
      } else {
        // 非分流节点，有配置数据就认为已配置
        return {
          isConfigured: true,
          hasConfig: true,
          hasBranchData: false,
          method: 'has_config_data',
          reason: '节点有配置数据'
        }
      }
    }
    
    // 方法3：对于分流节点，检查是否有分支数据（即使没有明确的配置）
    const isBranchNode = this.isBranchNode(node)
    if (isBranchNode && nodeData.branches && nodeData.branches.length > 0) {
      // 验证分支数据的合理性
      const validBranches = nodeData.branches.filter(branch => 
        branch && (branch.id || branch.label || branch.name)
      )
      
      if (validBranches.length > 0) {
        return {
          isConfigured: true,
          hasConfig: hasConfigData,
          hasBranchData: true,
          method: 'has_branch_data',
          reason: '分流节点有有效的分支数据'
        }
      }
    }
    
    // 方法4：对于开始节点，总是允许生成预览线
    if (nodeType === 'start') {
      return {
        isConfigured: true,
        hasConfig: hasConfigData,
        hasBranchData: false,
        method: 'start_node',
        reason: '开始节点总是允许预览线'
      }
    }
    
    // 方法5：检查节点是否有任何有意义的数据
    const hasAnyMeaningfulData = !!(
      nodeData.label || 
      nodeData.name || 
      nodeData.title ||
      (nodeData.data && Object.keys(nodeData.data).length > 0)
    )
    
    if (hasAnyMeaningfulData) {
      return {
        isConfigured: true,
        hasConfig: hasConfigData,
        hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
        method: 'has_meaningful_data',
        reason: '节点有有意义的数据'
      }
    }
    
    // 默认：节点未配置
    return {
      isConfigured: false,
      hasConfig: hasConfigData,
      hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
      method: 'default_unconfigured',
      reason: '节点未配置或配置不完整'
    }
  }

  /**
   * 验证存储的分支数据是否基于有效配置
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否有效
   */
  validateStoredBranches(nodeType, nodeConfig, nodeId) {
    switch (nodeType) {
      case 'audience-split':
        return nodeConfig.crowdLayers && 
               Array.isArray(nodeConfig.crowdLayers) && 
               nodeConfig.crowdLayers.length > 0
        
      case 'event-split':
        return !!(nodeConfig.eventCondition || 
                 nodeConfig.yesLabel || 
                 nodeConfig.noLabel)
        
      case 'ab-test':
        return !!(
          (nodeConfig.versions && Array.isArray(nodeConfig.versions) && nodeConfig.versions.length > 0) ||
          nodeConfig.groupALabel || 
          nodeConfig.groupBLabel || 
          nodeConfig.groupARatio || 
          nodeConfig.groupBRatio
        )
        
      default:
        return true
    }
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
          
          // 从配置中读取未命中分支信息
          if (nodeConfig.unmatchBranch) {
            branches.push({
              id: nodeConfig.unmatchBranch.id || 'unmatch_default',
              label: nodeConfig.unmatchBranch.name || '未命中人群',
              crowdName: nodeConfig.unmatchBranch.crowdName || nodeConfig.unmatchBranch.name || '未命中人群',
              type: 'audience',
              crowdId: nodeConfig.unmatchBranch.crowdId || null,
              order: nodeConfig.unmatchBranch.order || branches.length + 1,
              isDefault: true
            })
          }
          
          return branches
        }
        // 如果没有配置人群层，返回空数组，不创建默认分支
        console.log('⏭️ [统一预览线管理器] 人群分流节点未配置，不生成默认分支:', nodeId)
        return []
        
      case 'event-split':
        // 事件分流：只有在有配置时才生成分支
        if (nodeConfig.eventCondition || nodeConfig.yesLabel || nodeConfig.noLabel) {
          const eventBranches = [
            { id: 'event_yes', label: nodeConfig.yesLabel || '是', type: 'event' },
            { id: 'event_no', label: nodeConfig.noLabel || '否', type: 'event' }
          ]
          
          return eventBranches
        }
        // 如果没有配置事件条件，返回空数组
        return []
        
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
        // 如果有AB测试的基本配置，生成默认分支
        if (nodeConfig.groupALabel || nodeConfig.groupBLabel || nodeConfig.groupARatio || nodeConfig.groupBRatio) {
          return [
            { id: 'group_a', label: nodeConfig.groupALabel || 'A组', type: 'ab-test', ratio: nodeConfig.groupARatio || 50 },
            { id: 'group_b', label: nodeConfig.groupBLabel || 'B组', type: 'ab-test', ratio: nodeConfig.groupBRatio || 50 }
          ]
        }
        // 如果没有配置AB测试，返回空数组
        return []
        
      default:
        return []
    }
  }

  /**
   * 安全地设置路由器配置
   * 当manhattan算法失败时自动回退到orth路由器
   * @param {Object} edge - 边对象
   * @param {Object} routerConfig - 路由器配置
   */
  setSafeRouter(edge, routerConfig = {}) {
    if (!edge) {
      console.warn('⚠️ [路由器设置] 边对象无效')
      return
    }

    // 🔧 优化：根据连接类型智能选择路由器
    const source = edge.getSourcePoint()
    const target = edge.getTargetPoint()
    
    // 检查源点和目标点是否有效
    const hasValidPoints = source && target && 
                          typeof source.x === 'number' && !isNaN(source.x) &&
                          typeof source.y === 'number' && !isNaN(source.y) &&
                          typeof target.x === 'number' && !isNaN(target.x) &&
                          typeof target.y === 'number' && !isNaN(target.y)
    
    if (!hasValidPoints) {
      console.warn('⚠️ [路由器设置] 源点或目标点坐标无效，使用默认路由器:', {
        edgeId: edge.id,
        source,
        target
      })
      edge.setRouter('normal')
      return
    }

    // 计算连接距离和角度，选择最适合的路由器
    const distance = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2))
    const isVerticalConnection = Math.abs(target.x - source.x) < 50 // 垂直连接阈值
    const isShortConnection = distance < 100 // 短距离连接阈值

    // 🔧 智能路由器选择策略
    let preferredRouter = 'orth' // 默认使用更稳定的orth路由器
    
    // 只在特定条件下使用manhattan路由器
    if (!isShortConnection && !isVerticalConnection && distance > 150) {
      preferredRouter = 'manhattan'
    }

    try {
      if (preferredRouter === 'manhattan') {
        // 尝试使用manhattan路由器
        const manhattanConfig = {
          name: 'manhattan',
          args: {
            step: 10, // 统一步长
            padding: 15, // 统一边距
            excludeEnds: ['source'],
            ...this.getDynamicDirectionConfig(),
            ...routerConfig.args
          }
        }
        
        edge.setRouter(manhattanConfig)
        
        // 🔧 简化验证：只检查基本有效性
        const vertices = edge.getVertices()
        if (vertices && Array.isArray(vertices)) {
          if (this.debugMode) {
            console.log('✅ [路由器设置] Manhattan路由器设置成功:', {
              edgeId: edge.id,
              distance: distance.toFixed(2),
              config: manhattanConfig.args
            })
          }
          return
        } else {
          throw new Error('Manhattan router generated invalid vertices')
        }
      } else {
        // 直接使用orth路由器
        throw new Error('Using orth router by preference')
      }
      
    } catch (error) {
      // 🔧 完全静默处理：拖拽时不输出任何日志，避免控制台噪音
      // 只在非拖拽状态且调试模式下输出信息
      const isDragging = this.currentDragLine !== null
      if (!isDragging && this.debugMode) {
        console.log('🔄 [路由器设置] 使用Orth路由器:', {
          edgeId: edge.id,
          reason: preferredRouter === 'manhattan' ? 'Manhattan失败' : '智能选择',
          distance: distance.toFixed(2),
          isVertical: isVerticalConnection,
          isShort: isShortConnection
        })
      }
      
      // 使用orth路由器 - 智能最短路径优化
      const orthConfig = {
        name: 'orth',
        args: {
          padding: 15, // 统一边距
          step: 10, // 统一步长
          ...this.getDynamicDirectionConfig()
          // 🚀 [智能路径] 移除手动干预，完全依赖orth路由器的自动最短路径算法
        }
      }
      
      try {
        edge.setRouter(orthConfig)
      } catch (orthError) {
        // 只在非拖拽状态下输出错误信息
        if (!isDragging) {
          console.warn('⚠️ [路由器设置] Orth路由器失败，使用默认路由器:', {
            edgeId: edge.id,
            error: orthError.message
          })
        }
        edge.setRouter('normal')
      }
    }
  }

  /**
   * 计算单一预览线位置
   */
  calculateSinglePreviewPosition(node, nodePosition, nodeSize) {
    // 🔧 修复坐标系统：确保使用中心点坐标
    // nodePosition 是左上角坐标，需要转换为中心点坐标
    const nodeCenterX = nodePosition.x + nodeSize.width / 2
    
    // 🎯 关键修复：使用布局引擎的层级Y坐标系统
    const nodeId = node.id || node.getId()
    let endY = nodePosition.y + nodeSize.height + 100 // 默认固定偏移
    
    // 尝试获取布局引擎并使用层级Y坐标
    const layoutEngine = this.layoutEngine || 
                        window.unifiedStructuredLayoutEngine || 
                        this.graph?.layoutEngine
    
    if (layoutEngine && typeof layoutEngine.getNextLayerY === 'function') {
      try {
        const nextLayerY = layoutEngine.getNextLayerY(nodeId)
        endY = nextLayerY
        console.log(`📍 [预览线位置] 节点 ${nodeId} 使用布局引擎层级Y坐标: ${endY}`)
      } catch (error) {
        console.warn(`⚠️ [预览线位置] 获取布局引擎层级Y坐标失败，使用固定偏移: ${error.message}`)
      }
    } else {
      console.warn(`⚠️ [预览线位置] 布局引擎不可用，节点 ${nodeId} 使用固定偏移Y坐标: ${endY}`)
    }
    
    return {
      x: nodeCenterX,  // 使用节点中心X坐标
      y: endY  // 使用布局引擎的层级Y坐标或固定偏移
    }
  }

  /**
   * 计算分支预览线位置
   * 修改：所有分支预览线都从节点中心的同一个位置出发
   */
  calculateBranchPreviewPosition(node, branches, index) {
    const nodePosition = node.getPosition()  // 左上角坐标
    const nodeSize = node.getSize()
    
    // 🔧 修复坐标系统：计算节点的中心点坐标
    // node.getPosition() 返回左上角坐标，需要转换为中心点坐标
    const nodeCenterX = nodePosition.x + nodeSize.width / 2
    
    // 🎯 关键修复：使用布局引擎的层级Y坐标系统
    const nodeId = node.id || node.getId()
    let baseY = nodePosition.y + nodeSize.height + 100 // 默认固定偏移
    
    // 尝试获取布局引擎并使用层级Y坐标
    const layoutEngine = this.layoutEngine || 
                        window.unifiedStructuredLayoutEngine || 
                        this.graph?.layoutEngine
    
    if (layoutEngine && typeof layoutEngine.getNextLayerY === 'function') {
      try {
        const nextLayerY = layoutEngine.getNextLayerY(nodeId)
        baseY = nextLayerY
        console.log(`📍 [分支预览线位置] 节点 ${nodeId} 使用布局引擎层级Y坐标: ${baseY}`)
      } catch (error) {
        console.warn(`⚠️ [分支预览线位置] 获取布局引擎层级Y坐标失败，使用固定偏移: ${error.message}`)
      }
    } else {
      console.warn(`⚠️ [分支预览线位置] 布局引擎不可用，节点 ${nodeId} 使用固定偏移Y坐标: ${baseY}`)
    }
    
    // 计算终点位置的分散，但起点保持在中心
    const baseSpacing = Math.max(nodeSize.width * 0.8, 60) // 最小60px，最大为节点宽度的80%
    const maxSpacing = 120 // 最大间距限制
    const spacing = Math.min(baseSpacing, maxSpacing)
    
    const totalWidth = (branches.length - 1) * spacing
    const endX = nodeCenterX - totalWidth / 2 + index * spacing
    
    return {
      x: endX, // 终点X坐标分散
      y: baseY  // 使用布局引擎的层级Y坐标或固定偏移
    }
  }

  /**
   * 更新预览线位置
   */
  updatePreviewLinePosition(node) {
    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      return
    }

    // 🔧 新增：如果布局引擎未就绪，添加到待处理队列
    if (!this.layoutEngineReady) {
      const added = this.addToPendingCalculations(node.id, node, 'update')
      if (added) {
        console.log('📋 [统一预览线管理器] 预览线更新任务已加入待处理队列:', node.id)
        return
      }
    }

    const previewInstance = this.previewLines.get(node.id)
    if (!previewInstance) {
      return
    }

    // 检查预览线状态，如果是隐藏状态则跳过更新
    if (Array.isArray(previewInstance)) {
      // 分支预览线 - 检查是否所有分支都被隐藏
      const allHidden = previewInstance.every(instance => instance.state === UnifiedPreviewStates.HIDDEN)
      if (allHidden) {
        return
      }
    } else {
      // 单一预览线 - 检查是否被隐藏
      if (previewInstance.state === UnifiedPreviewStates.HIDDEN) {
        return
      }
    }
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线 - 只更新未隐藏的分支
      const branches = this.getNodeBranches(node)
      previewInstance.forEach((instance, index) => {
        // 跳过已隐藏的分支预览线
        if (instance.state === UnifiedPreviewStates.HIDDEN) {
          return
        }

        // 计算新的终点位置
        const newEndPosition = this.calculateBranchPreviewPosition(node, branches, index)
        
        // 强制刷新端口位置，确保X6正确计算端口坐标
        if (typeof node.updatePorts === 'function') {
          node.updatePorts()
        }
        
        // 强制重新设置out端口位置属性，确保坐标正确
        try {
          const outPort = node.getPort('out')
          if (outPort) {
            node.setPortProp('out', 'position/args/dx', 0)
            node.setPortProp('out', 'position/args/dy', 0)
          }
        } catch (error) {
          console.warn('⚠️ [预览线位置更新] 端口位置刷新失败:', error)
        }
        
        // 🔧 使用X6规范的方式更新分支预览线位置
        // 保持源端口连接，确保节点移动时预览线跟随
        instance.line.setSource({
          cell: node.id,
          port: 'out'
        })
        
        // 使用setVertices方法设置路径点，而不是直接设置target
        // 这样可以让X6的路由器正确计算路径
        // 修复：使用正确的X6 API获取端口位置
        let sourcePosition
        try {
          // 尝试使用X6的getPortProp方法获取端口位置
          const portProp = node.getPortProp('out', 'position')
          if (portProp) {
            const nodePosition = node.getPosition()
            const nodeSize = node.getSize()
            sourcePosition = {
              x: nodePosition.x + (portProp.x || nodeSize.width / 2),
              y: nodePosition.y + (portProp.y || nodeSize.height)
            }
          } else {
            // 如果端口属性不存在，使用节点底部中心作为默认位置
            const nodePosition = node.getPosition()
            const nodeSize = node.getSize()
            sourcePosition = {
              x: nodePosition.x + nodeSize.width / 2,
              y: nodePosition.y + nodeSize.height
            }
          }
        } catch (error) {
          console.warn('⚠️ [预览线位置更新] 获取端口位置失败，使用默认位置:', error)
          // 使用节点底部中心作为默认位置
          const nodePosition = node.getPosition()
          const nodeSize = node.getSize()
          sourcePosition = {
            x: nodePosition.x + nodeSize.width / 2,
            y: nodePosition.y + nodeSize.height
          }
        }
        const vertices = []
        
        // 对于分支预览线，可以添加中间路径点来实现分支效果
        // 例如：vertices.push({ x: sourcePosition.x + (index * 50), y: newEndPosition.y })
        
        // 设置路径点（不包括起点和终点）
        instance.line.setVertices(vertices)
        
        // 设置终点位置
        instance.line.setTarget(newEndPosition)
        
        // 使用安全的路由器设置方法
        this.setSafeRouter(instance.line, {
          args: {
            step: 10,
            padding: 15,
            excludeEnds: ['source', 'target'],
            startDirections: ['bottom'],
            endDirections: ['top']
          }
        })
        instance.endPosition = newEndPosition

        // 记录更新后的连接属性
        const afterProps = instance.line.prop()
        
        // 更新预览线终点标记位置
        this.updateEndpointMarker(instance.line, newEndPosition)
      })
    } else {
      // 单一预览线
      // 计算新的终点位置
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      const newEndPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
      
      // 强制刷新端口位置，确保X6正确计算端口坐标
      if (typeof node.updatePorts === 'function') {
        node.updatePorts()
      }
      
      // 强制重新设置out端口位置属性，确保坐标正确
      try {
        const outPort = node.getPort('out')
        if (outPort) {
          node.setPortProp('out', 'position/args/dx', 0)
          node.setPortProp('out', 'position/args/dy', 0)
        }
      } catch (error) {
        console.warn('⚠️ [预览线位置更新] 端口位置刷新失败:', error)
      }
      
      // 🔧 使用X6规范的方式更新预览线位置
      // 保持源端口连接，确保节点移动时预览线跟随
      previewInstance.line.setSource({
        cell: node.id,
        port: 'out'
      })
      
      // 使用setVertices方法设置路径点，而不是直接设置target
      // 这样可以让X6的路由器正确计算路径
      // 修复：使用正确的X6 API获取端口位置
      let sourcePosition
      try {
        // 尝试使用X6的getPortProp方法获取端口位置
        const portProp = node.getPortProp('out', 'position')
        if (portProp) {
          const nodePosition = node.getPosition()
          const nodeSize = node.getSize()
          sourcePosition = {
            x: nodePosition.x + (portProp.x || nodeSize.width / 2),
            y: nodePosition.y + (portProp.y || nodeSize.height)
          }
        } else {
          // 如果端口属性不存在，使用节点底部中心作为默认位置
          const nodePosition = node.getPosition()
          const nodeSize = node.getSize()
          sourcePosition = {
            x: nodePosition.x + nodeSize.width / 2,
            y: nodePosition.y + nodeSize.height
          }
        }
      } catch (error) {
        console.warn('⚠️ [预览线位置更新] 获取端口位置失败，使用默认位置:', error)
        // 使用节点底部中心作为默认位置
        const nodePosition = node.getPosition()
        const nodeSize = node.getSize()
        sourcePosition = {
          x: nodePosition.x + nodeSize.width / 2,
          y: nodePosition.y + nodeSize.height
        }
      }
      const vertices = []
      
      // 如果需要中间路径点，可以在这里添加
      // 例如：vertices.push({ x: sourcePosition.x, y: newEndPosition.y })
      
      // 设置路径点（不包括起点和终点）
      previewInstance.line.setVertices(vertices)
      
      // 设置终点位置
      previewInstance.line.setTarget(newEndPosition)
      
      // 使用安全的路由器设置方法
      this.setSafeRouter(previewInstance.line, {
        args: {
          step: 10,
          padding: 15,
          excludeEnds: ['source', 'target'],
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      })
      previewInstance.endPosition = newEndPosition

      // 记录更新后的连接属性
      const afterProps = previewInstance.line.prop()
      
      // 更新预览线终点标记位置
      this.updateEndpointMarker(previewInstance.line, newEndPosition)
    }
  }

  /**
   * 设置预览线终点拖拽功能
   * @param {Object} line - 预览线实例
   */
  setupPreviewLineEndpointDrag(line) {
    if (!line) {
      return
    }
    
    try {
      // 设置预览线的拖拽样式
      line.attr('line/cursor', 'grab')
      
      // 注意：预览线的鼠标事件现在通过X6的标准事件系统处理
      // 在setupEventListeners方法中已经绑定了edge:mousedown等事件
    } catch (error) {
      console.error('❌ [预览线终点拖拽] 设置拖拽功能失败:', error)
    }
  }

  /**
   * 开始预览线终点拖拽
   * @param {Object} line - 预览线实例
   * @param {Event} event - 鼠标事件
   */
  startPreviewLineEndpointDrag(line, event) {
    // 设置当前拖拽状态
    this.currentDragLine = { line }
    this.isDragging = true
    
    // 高亮预览线
    const previewInstance = this.endpointDragInstances?.get(line.id)
    if (previewInstance) {
      this.highlightPreviewLineEndpoint(previewInstance, true)
    }
    line.attr('line/cursor', 'grabbing')
  }

  /**
   * 添加终点标记
   * @param {Object} line - 预览线实例
   * @param {Object} position - 终点位置
   */
  addEndpointMarker(line, position) {
    if (!line || !position) return
    
    // 这里可以添加终点标记的可视化逻辑
    // 例如在终点位置添加一个小圆点或其他标记
  }

  /**
   * 移除预览线终点拖拽功能
   * @param {Object} line - 预览线实例
   */
  removePreviewLineEndpointDrag(line) {
    if (!line) {
      return
    }
    
    try {
      // 移除预览线终点的高亮效果
      const previewInstance = this.endpointDragInstances?.get(line.id)
      if (previewInstance) {
        this.highlightPreviewLineEndpoint(previewInstance, false)
      }
    } catch (error) {
      console.error('❌ [预览线终点拖拽] 移除拖拽功能失败:', error)
    }
  }

  /**
   * 更新预览线终点标记位置
   * @param {Object} line - 预览线对象
   * @param {Object} position - 新的终点位置
   */
  updateEndpointMarker(line, position) {
    if (!line || !position) return
    
    // 更新预览线终点的可视化标记
    this.addEndpointMarker(line, position)
  }

  /**
   * 移除预览线
   */
  removePreviewLine(nodeId) {
    const previewInstance = this.previewLines.get(nodeId)
    if (!previewInstance) return
    
    // 清理相关的手工调整记录
    const removedHints = []
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线
      previewInstance.forEach(instance => {
        this.removePreviewLineEndpointDrag(instance)
        this.graph.removeEdge(instance.line)
        
        // 清理对应的手工调整记录
        const hintId = `hint_${instance.line.id}`
        if (this.manuallyAdjustedHints.has(hintId)) {
          this.manuallyAdjustedHints.delete(hintId)
          removedHints.push(hintId)
        }
      })
    } else {
      // 单一预览线
      this.removePreviewLineEndpointDrag(previewInstance)
      this.graph.removeEdge(previewInstance.line)
      
      // 清理对应的手工调整记录
      const hintId = `hint_${previewInstance.line.id}`
      if (this.manuallyAdjustedHints.has(hintId)) {
        this.manuallyAdjustedHints.delete(hintId)
        removedHints.push(hintId)
      }
    }
    
    this.previewLines.delete(nodeId)
    this.nodeStates.delete(nodeId)
  }

  /**
   * 移除特定分支的预览线
   * @param {string} nodeId - 节点ID
   * @param {string} branchId - 分支ID
   */
  removeSpecificBranchPreviewLine(nodeId, branchId) {
    const previewInstance = this.previewLines.get(nodeId)
    if (!previewInstance) {
      return
    }
    
    const removedHints = []
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线：找到并删除特定分支
      const targetIndex = previewInstance.findIndex(instance => instance.branchId === branchId)
      
      if (targetIndex !== -1) {
        const targetInstance = previewInstance[targetIndex]
        
        // 移除预览线终点拖拽功能和预览线
        this.removePreviewLineEndpointDrag(targetInstance)
        this.graph.removeEdge(targetInstance.line)
        
        // 清理对应的手工调整记录
        const hintId = `hint_${targetInstance.line.id}`
        if (this.manuallyAdjustedHints.has(hintId)) {
          this.manuallyAdjustedHints.delete(hintId)
          removedHints.push(hintId)
        }
        
        // 从数组中移除该分支
        previewInstance.splice(targetIndex, 1)
        
        // 如果没有剩余分支，清理整个预览线实例
        if (previewInstance.length === 0) {
          this.previewLines.delete(nodeId)
          this.nodeStates.delete(nodeId)
        }
      }
    } else {
      // 单一预览线：如果指定了分支ID但实际是单一预览线，则删除整个预览线
      this.removePreviewLineEndpointDrag(previewInstance)
      this.graph.removeEdge(previewInstance.line)
      
      // 清理对应的手工调整记录
      const hintId = `hint_${previewInstance.line.id}`
      if (this.manuallyAdjustedHints.has(hintId)) {
        this.manuallyAdjustedHints.delete(hintId)
        removedHints.push(hintId)
      }
      
      this.previewLines.delete(nodeId)
      this.nodeStates.delete(nodeId)
    }
  }

  /**
   * 更新拖拽位置
   */
  updateDragPosition(e) {
    if (!this.currentDragLine) {
      return
    }
    
    const { line, sourceNode, branchId } = this.currentDragLine
    const rect = this.graph.container.getBoundingClientRect()
    const domX = e.clientX - rect.left
    const domY = e.clientY - rect.top
    
    // 🔧 修复坐标系转换问题：将DOM坐标转换为逻辑坐标
    let logicalCoords = { x: domX, y: domY }
    if (this.coordinateManager) {
      logicalCoords = this.coordinateManager.DOMToLogical(domX, domY)
    }
    
    const { x, y } = logicalCoords
    
    // 🔧 修复：确保预览线始终从源节点的out端口开始
    // 只设置一次source，确保使用正确的out端口
    line.setSource({
      cell: sourceNode.id,
      port: 'out',  // 始终使用out端口，不使用branchId作为端口
      connectionPoint: {
        name: 'boundary',
        args: {
          sticky: true
        }
      }
    })
    
    // 设置终点位置（使用逻辑坐标）
    line.setTarget({
      x,
      y,
      connectionPoint: {
        name: 'boundary',
        args: {
          sticky: true
        }
      }
    })
    
    // 🔧 使用X6规范的方式更新拖拽位置
    // 使用setVertices方法设置路径点，而不是直接设置target
    const vertices = []
    
    // 设置路径点（不包括起点和终点）
    line.setVertices(vertices)
    
    // 确保使用正确的路由器 - 拖拽时优先使用稳定的orth路由器
    // 避免在拖拽过程中频繁尝试manhattan算法导致的警告信息
    line.setRouter({
      name: 'orth',
      args: {
        padding: 15,
        step: 10,
        ...this.getDynamicDirectionConfig()
      }
    })
    
    // 设置连接器配置
    line.setConnector({
      name: 'rounded',
      args: {
        radius: 6
      }
    })
    
    // 更新预览线终点的高亮效果
    const previewInstance = this.endpointDragInstances?.get(line.id)
    if (previewInstance) {
      this.highlightPreviewLineEndpoint(previewInstance, true)
    }
    
    // 检测附近的节点并高亮显示（使用逻辑坐标）
    this.highlightNearbyNodes(x, y)
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
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      // 跳过源节点
      if (this.currentDragLine && node.id === this.currentDragLine.sourceNode.id) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 🔧 使用坐标管理器验证和修正节点坐标
      let nodeCenterX = nodePosition.x + nodeSize.width / 2
      let nodeCenterY = nodePosition.y + nodeSize.height / 2
      
      if (this.coordinateManager) {
        const coordinateValidation = this.coordinateManager.validateCoordinateTransform(node)
        if (coordinateValidation && coordinateValidation.difference) {
          nodeCenterX -= coordinateValidation.difference.x
          nodeCenterY -= coordinateValidation.difference.y
          
          // 已禁用坐标修正日志以减少控制台冗余信息
          // console.log('🔍 [吸附坐标修正] 检测到节点坐标偏差:', {
          //   nodeId: node.id,
          //   originalCenter: { x: nodePosition.x + nodeSize.width / 2, y: nodePosition.y + nodeSize.height / 2 },
          //   correctedCenter: { x: nodeCenterX, y: nodeCenterY },
          //   coordinateValidation
          // })
        }
      }
      
      // 检查是否在检测范围内（使用修正后的坐标）
      const distance = Math.sqrt(
        Math.pow(x - nodeCenterX, 2) +
        Math.pow(y - nodeCenterY, 2)
      )
      
      if (distance <= tolerance) {
        // 高亮节点
        this.highlightNode(node)
        
        console.log('🎯 [节点吸附] 高亮附近节点:', {
          nodeId: node.id,
          nodeType: nodeData.type,
          distance: distance.toFixed(2),
          tolerance,
          dragPosition: { x, y },
          nodeCenter: { x: nodeCenterX, y: nodeCenterY }
        })
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
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      // 跳过源节点
      if (this.currentDragLine && node.id === this.currentDragLine.sourceNode.id) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 🔧 使用坐标管理器验证和修正节点坐标
      let nodeCenterX = nodePosition.x + nodeSize.width / 2
      let nodeCenterY = nodePosition.y + nodeSize.height / 2
      
      if (this.coordinateManager) {
        const coordinateValidation = this.coordinateManager.validateCoordinateTransform(node)
        if (coordinateValidation && coordinateValidation.difference) {
          nodeCenterX -= coordinateValidation.difference.x
          nodeCenterY -= coordinateValidation.difference.y
          
          // 已禁用分支吸附坐标修正日志以减少控制台冗余信息
          // console.log('🔍 [分支吸附坐标修正] 检测到节点坐标偏差:', {
          //   nodeId: node.id,
          //   originalCenter: { x: nodePosition.x + nodeSize.width / 2, y: nodePosition.y + nodeSize.height / 2 },
          //   correctedCenter: { x: nodeCenterX, y: nodeCenterY },
          //   coordinateValidation
          // })
        }
      }
      
      // 检查是否在检测范围内（使用修正后的坐标）
      const distance = Math.sqrt(
        Math.pow(x - nodeCenterX, 2) +
        Math.pow(y - nodeCenterY, 2)
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
    const domDropX = e.clientX - rect.left
    const domDropY = e.clientY - rect.top
    
    // 🔧 修复坐标系转换问题：将DOM坐标转换为逻辑坐标
    let logicalDropCoords = { x: domDropX, y: domDropY }
    if (this.coordinateManager) {
      logicalDropCoords = this.coordinateManager.DOMToLogical(domDropX, domDropY)
    }
    
    const dropX = logicalDropCoords.x
    const dropY = logicalDropCoords.y
    
    // 🔍 记录拖拽结束时的初始状态
    const dragEndInfo = {
      dragLine: {
        id: line?.id,
        sourceNodeId: sourceNode?.id,
        branchId: branchId,
        branchLabel: branchLabel
      },
      dropPosition: { x: dropX, y: dropY },
      domDropPosition: { x: domDropX, y: domDropY },
      nearestTargetNode: nearestTargetNode?.id,
      timestamp: new Date().toISOString()
    }
    
    console.log('🎯 [预览线终点拖拽] 拖拽结束处理:', dragEndInfo)
    
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
      
      console.log('✅ [预览线终点拖拽] 连接成功:', {
        source: sourceNode.id,
        target: targetNode.id,
        branchId: branchId
      })
    } else {
      // 没有找到目标节点，检查是否需要创建新节点
      const shouldCreateNode = this.shouldCreateNodeAtPosition(dropX, dropY)
      
      if (shouldCreateNode) {
        this.createNodeAtPosition(dropX, dropY, sourceNode, this.currentDragLine)
        console.log('✅ [预览线终点拖拽] 创建新节点:', { x: dropX, y: dropY })
      } else {
        console.log('❌ [预览线终点拖拽] 拖拽未成功吸附，恢复预览线状态')
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
    // 已禁用节点删除后恢复预览线日志以减少控制台冗余信息
    // console.log('🔄 [统一预览线管理器] 开始检查节点删除后的预览线恢复:', {
    //   deletedNodeId: deletedNode.id,
    //   deletedNodeType: deletedNode.getData()?.type,
    //   providedIncomingEdges: !!incomingEdges
    // })
    
    // 获取所有连接到被删除节点的边（如果没有提供则重新获取）
    const edges = incomingEdges || this.graph.getIncomingEdges(deletedNode) || []
    
    // 已禁用边信息日志以减少控制台冗余信息
    // console.log('🔍 [统一预览线管理器] 找到连接到被删除节点的边:', {
    //   deletedNodeId: deletedNode.id,
    //   incomingEdgesCount: edges.length,
    //   edges: edges.map(edge => ({
    //     id: edge.id,
    //     sourceId: edge.getSourceNode()?.id,
    //     targetId: edge.getTargetNode()?.id,
    //     data: edge.getData()
    //   }))
    // })

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
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 🔧 使用坐标管理器验证和修正节点坐标
      let correctedX = nodePosition.x
      let correctedY = nodePosition.y
      
      if (this.coordinateManager) {
        const coordinateValidation = this.coordinateManager.validateCoordinateTransform(node)
        if (coordinateValidation && coordinateValidation.difference) {
          correctedX -= coordinateValidation.difference.x
          correctedY -= coordinateValidation.difference.y
          
          console.log('🔍 [位置查找坐标修正] 检测到节点坐标偏差:', {
            nodeId: node.id,
            originalPosition: { x: nodePosition.x, y: nodePosition.y },
            correctedPosition: { x: correctedX, y: correctedY },
            coordinateValidation
          })
        }
      }
      
      // 检查点是否在节点范围内（包含容差，使用修正后的坐标）
      if (x >= correctedX - tolerance && 
          x <= correctedX + nodeSize.width + tolerance &&
          y >= correctedY - tolerance && 
          y <= correctedY + nodeSize.height + tolerance) {
        
        console.log('🎯 [位置查找] 在位置找到节点:', {
          nodeId: node.id,
          nodeType: nodeData.type,
          searchPosition: { x, y },
          nodePosition: { x: correctedX, y: correctedY },
          nodeSize,
          tolerance
        })
        
        return node
      }
    }
    
    console.log('❌ [位置查找] 在位置未找到节点:', {
      searchPosition: { x, y },
      tolerance,
      totalNodesChecked: nodes.length
    })
    
    return null
  }

  /**
   * 创建连接
   */
  createConnection(sourceNode, targetNode, previewInstance) {
    const { branchId, branchLabel } = previewInstance
    
    // 注意：移除对目标节点已有连接的检查，因为节点的in端口支持多个连接
    
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
      // 使用更可靠的boundary连接点
      connectionPoint: {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      },
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
          
          console.log('📍 [预览线终点拖拽] 拖拽结束时更新endPosition:', {
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
        
        // 移除预览线终点的高亮效果
        if (this.currentDragLine.line) {
          this.updatePreviewLineEndpointStyle(this.currentDragLine.line, false)
        }
        
        console.log('🔄 [预览线终点拖拽] 预览线状态重置为交互状态:', {
          lineId: this.currentDragLine.line.id,
          state: this.currentDragLine.state
        })
      } else {
        console.log('⏭️ [预览线终点拖拽] 预览线已隐藏，跳过状态重置:', {
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
    this.isEndpointActive = false
    this.currentDragLine = null
    this.dragStartPosition = null
    
    console.log('🔄 [预览线终点拖拽] 拖拽状态已重置')
  }

  // ==================== 兼容性API ====================

  /**
   * 刷新所有预览线
   * 用于在节点删除后确保剩余预览线正确显示
   * @param {boolean} isAfterNodeDeletion - 是否是节点删除后的刷新
   */
  refreshAllPreviewLines(isAfterNodeDeletion = false, isAfterSmartLayout = false) {
    console.log('🔄 [统一预览线管理器] 开始刷新所有预览线', { 
      isAfterNodeDeletion, 
      isAfterSmartLayout 
    })
    
    let refreshedCount = 0
    let totalBranchesRefreshed = 0
    let restoredHiddenBranches = 0
    let newPreviewLinesCreated = 0
    
    // 🔧 修复：智能布局后特殊处理，避免重新创建已连接的未命中人群预览线
    if (isAfterSmartLayout) {
      console.log('🎯 [统一预览线管理器] 智能布局后刷新，保护已连接的分支')
      
      // 只刷新现有预览线的位置，不创建新的预览线
      this.previewLines.forEach((previewInstance, nodeId) => {
        const node = this.graph.getCellById(nodeId)
        
        if (node) {
          console.log('🔄 [统一预览线管理器] 智能布局后刷新节点预览线位置:', {
            nodeId: nodeId,
            isArray: Array.isArray(previewInstance),
            branchCount: Array.isArray(previewInstance) ? previewInstance.length : 1
          })
          
          // 如果是分支预览线，为每个分支单独更新位置
          if (Array.isArray(previewInstance)) {
            previewInstance.forEach((instance, branchIndex) => {
              // 只处理非隐藏状态的分支
              if (instance.line && instance.state !== UnifiedPreviewStates.HIDDEN) {
                // 为每个分支单独调用位置更新
                this.updatePreviewLinePosition(node, instance.branchId, branchIndex)
                totalBranchesRefreshed++
                
                // 🔧 智能布局后强制刷新预览线终点位置
                try {
                  const currentTarget = instance.line.getTarget()
                  if (currentTarget && typeof currentTarget === 'object' && currentTarget.x !== undefined) {
                    // 强制重新设置终点位置，确保X6正确渲染
                    instance.line.setTarget({ x: currentTarget.x, y: currentTarget.y })
                    instance.endPosition = { x: currentTarget.x, y: currentTarget.y }
                    console.log('🔧 [智能布局后] 强制刷新分支预览线终点位置:', {
                      nodeId: nodeId,
                      branchId: instance.branchId,
                      branchIndex: branchIndex,
                      refreshedTarget: currentTarget
                    })
                  }
                } catch (error) {
                  console.warn('⚠️ [智能布局后] 强制刷新分支预览线终点位置失败:', error)
                }
                
                // 更新预览线终点标记位置
                this.updateEndpointMarker(instance.line, instance.endPosition)
              }
            })
          } else {
            // 单一预览线
            this.updatePreviewLinePosition(node)
            totalBranchesRefreshed++
            
            // 🔧 智能布局后强制刷新预览线终点位置
            try {
              const currentTarget = previewInstance.line.getTarget()
              if (currentTarget && typeof currentTarget === 'object' && currentTarget.x !== undefined) {
                // 强制重新设置终点位置，确保X6正确渲染
                previewInstance.line.setTarget({ x: currentTarget.x, y: currentTarget.y })
                previewInstance.endPosition = { x: currentTarget.x, y: currentTarget.y }
                console.log('🔧 [智能布局后] 强制刷新单一预览线终点位置:', {
                  nodeId: nodeId,
                  refreshedTarget: currentTarget
                })
              }
            } catch (error) {
              console.warn('⚠️ [智能布局后] 强制刷新单一预览线终点位置失败:', error)
            }
            
            // 更新预览线终点标记位置
            this.updateEndpointMarker(previewInstance.line, previewInstance.endPosition)
          }
          
          refreshedCount++
        }
      })
      
      console.log('✅ [统一预览线管理器] 智能布局后预览线刷新完成:', {
        totalPreviewLines: this.previewLines.size,
        refreshedNodes: refreshedCount,
        totalBranchesRefreshed: totalBranchesRefreshed,
        restoredHiddenBranches: 0,
        newPreviewLinesCreated: 0
      })
      
      return // 智能布局后只刷新位置，不创建新预览线
    }
    
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
              
              // 更新预览线终点标记位置
              this.updateEndpointMarker(instance.line, instance.endPosition)
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
          
          // 更新预览线终点标记位置
          this.updateEndpointMarker(previewInstance.line, previewInstance.endPosition)
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
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview || nodeData.isPreview) {
        return
      }
      
      // 检查节点是否已有预览线实例
      const existingPreview = this.previewLines.get(nodeId)
      if (!existingPreview) {
        // 🔧 修复：对于分支节点，不应该因为有部分真实连接就完全跳过
        // 需要检查每个分支是否需要预览线
        if (isAfterNodeDeletion) {
          const nodeType = nodeData.type || nodeData.nodeType
          const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']
          
          if (branchNodeTypes.includes(nodeType)) {
            // 分支节点：检查是否所有分支都有真实连接
            const branches = this.getNodeBranches(node)
            const allBranchesHaveConnections = branches.every(branch => 
              this.checkBranchHasRealConnection(node, branch.id)
            )
            
            if (allBranchesHaveConnections) {
              console.log('⏭️ [统一预览线管理器] 节点删除后刷新：分支节点所有分支都有连接，跳过:', {
                nodeId: nodeId,
                nodeType: nodeType,
                branchCount: branches.length,
                allBranchesConnected: true
              })
              return
            } else {
              console.log('🔧 [统一预览线管理器] 节点删除后刷新：分支节点有未连接的分支，需要创建预览线:', {
                nodeId: nodeId,
                nodeType: nodeType,
                branchCount: branches.length,
                connectedBranches: branches.filter(branch => this.checkBranchHasRealConnection(node, branch.id)).length
              })
            }
          } else {
            // 非分支节点：检查是否有真实连接
            if (this.nodeHasRealConnections(node)) {
              console.log('⏭️ [统一预览线管理器] 节点删除后刷新：跳过有真实连接的节点:', {
                nodeId: nodeId,
                nodeType: nodeType,
                hasRealConnections: true
              })
              return
            }
          }
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
          
          // 🔧 修复：检查当前分支数是否已经超过预期，如果是则不创建新分支
          const expectedBranchCount = branches.length
          const currentBranchCount = currentBranches.length
          
          console.log('🔍 [统一预览线管理器] 分支数量检查:', {
            nodeId: nodeId,
            expectedBranchCount: expectedBranchCount,
            currentBranchCount: currentBranchCount,
            missingBranchesCount: missingBranches.length,
            shouldCreateMissing: currentBranchCount < expectedBranchCount && missingBranches.length > 0
          })
          
          // 只有当前分支数少于预期且有缺失分支时才创建
          if (currentBranchCount < expectedBranchCount && missingBranches.length > 0) {
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
          } else if (currentBranchCount >= expectedBranchCount) {
            console.log('⏭️ [统一预览线管理器] 当前分支数已达到或超过预期，跳过创建:', {
              nodeId: nodeId,
              currentBranchCount: currentBranchCount,
              expectedBranchCount: expectedBranchCount
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
      newPreviewLinesCreated: newPreviewLinesCreated,
      // 🔍 详细的排查信息
      manuallyAdjustedHints: this.manuallyAdjustedHints.size,
      protectedHintsList: Array.from(this.manuallyAdjustedHints.keys()),
      // 🔍 补充受保护拖拽点的详细信息
      protectedHintsDetails: Array.from(this.manuallyAdjustedHints.entries()).map(([hintId, position]) => ({
        hintId,
        position,
        isStillOnGraph: this.graph.hasCell(hintId),
        currentPosition: this.graph.hasCell(hintId) ? this.graph.getCellById(hintId)?.getPosition() : null
      })),
      refreshContext: {
        isAfterNodeDeletion: isAfterNodeDeletion,
        isAfterSmartLayout: isAfterSmartLayout,
        refreshTrigger: isAfterNodeDeletion ? 'node-deletion' : isAfterSmartLayout ? 'smart-layout' : 'node-movement'
      },
      timestamp: new Date().toLocaleTimeString(),
      // 🔍 补充更详细的预览线统计
      previewLineStats: (() => {
        let totalLines = 0
        let hiddenLines = 0
        let interactiveLines = 0
        let staticLines = 0
        let branchPreviewNodes = 0
        let singlePreviewNodes = 0
        
        this.previewLines.forEach((previewInstance, nodeId) => {
          if (Array.isArray(previewInstance)) {
            branchPreviewNodes++
            previewInstance.forEach(instance => {
              totalLines++
              if (instance.state === UnifiedPreviewStates.HIDDEN) hiddenLines++
              else if (instance.state === UnifiedPreviewStates.INTERACTIVE) interactiveLines++
              else if (instance.state === UnifiedPreviewStates.STATIC_DISPLAY) staticLines++
            })
          } else {
            singlePreviewNodes++
            totalLines++
            if (previewInstance.state === UnifiedPreviewStates.HIDDEN) hiddenLines++
            else if (previewInstance.state === UnifiedPreviewStates.INTERACTIVE) interactiveLines++
            else if (previewInstance.state === UnifiedPreviewStates.STATIC_DISPLAY) staticLines++
          }
        })
        
        return { 
          totalLines, 
          hiddenLines, 
          interactiveLines, 
          staticLines,
          branchPreviewNodes,
          singlePreviewNodes,
          averageBranchesPerNode: branchPreviewNodes > 0 ? (totalLines - singlePreviewNodes) / branchPreviewNodes : 0
        }
      })(),
      // 🔍 补充画布状态信息
      graphState: {
        totalNodes: this.graph.getNodes().length,
        totalEdges: this.graph.getEdges().length,
        previewEdges: this.graph.getEdges().filter(edge => {
          const data = edge.getData() || {}
          return data.isUnifiedPreview || data.type === 'unified-preview-line'
        }).length,
        endpoints: this.graph.getNodes().filter(node => {
          const data = node.getData() || {}
          return data.isEndpoint || data.type === 'endpoint'
        }).length
      }
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
      // 排除所有类型的预览线，只检查真实连接
      const isPreviewLine = edgeData.isUnifiedPreview || 
                           edgeData.isPersistentPreview || 
                           edgeData.isPreview ||
                           edgeData.type === 'preview-line' ||
                           edgeData.type === 'unified-preview-line' ||
                           edgeData.type === 'draggable-preview'
      
      // 只有非预览线且分支ID匹配的连接才算真实连接
      return !isPreviewLine && edgeData.branchId === branchId
    })
    
    console.log('🔍 [统一预览线管理器] 检查分支真实连接:', {
      nodeId: node.id,
      branchId: branchId,
      totalOutgoingEdges: outgoingEdges.length,
      realConnections: realConnections.length,
      realConnectionDetails: realConnections.map(edge => {
        const edgeData = edge.getData() || {}
        return {
          edgeId: edge.id,
          branchId: edgeData.branchId,
          target: edge.getTargetCellId(),
          type: edgeData.type
        }
      }),
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
      // 排除所有类型的预览线，只检查真实连接
      const isPreviewLine = edgeData.isUnifiedPreview || 
                           edgeData.isPersistentPreview || 
                           edgeData.isPreview ||
                           edgeData.type === 'preview-line' ||
                           edgeData.type === 'unified-preview-line' ||
                           edgeData.type === 'draggable-preview'
      
      return !isPreviewLine
    })
    
    console.log('🔍 [统一预览线管理器] 检查节点真实连接:', {
      nodeId: node.id,
      totalOutgoingEdges: outgoingEdges.length,
      realConnections: realConnections.length,
      realConnectionDetails: realConnections.map(edge => {
        const edgeData = edge.getData() || {}
        return {
          edgeId: edge.id,
          branchId: edgeData.branchId || 'none',
          target: edge.getTargetCellId(),
          type: edgeData.type || 'unknown'
        }
      }),
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
   * 获取所有预览线（包括活跃和非活跃的）
   * @returns {Array} 所有预览线数组
   */
  getAllPreviewLines() {
    const allLines = []
    
    console.log('🔍 [统一预览线管理器] 获取所有预览线:', {
      totalPreviewInstances: this.previewLines.size
    })
    
    // 遍历所有预览线实例
    this.previewLines.forEach((previewInstance, nodeId) => {
      const node = this.graph ? this.graph.getCellById(nodeId) : null
      
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        previewInstance.forEach((instance, branchIndex) => {
          if (instance.line) {
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
                start: instance.line.getSourcePoint ? instance.line.getSourcePoint() : null,
                end: instance.line.getTargetPoint ? instance.line.getTargetPoint() : null
              },
              state: instance.state,
              isActive: this.graph ? this.graph.hasCell(instance.line) : false
            }
            allLines.push(previewLine)
          }
        })
      } else {
        // 单一预览线
        if (previewInstance.line) {
          const previewLine = {
            id: previewInstance.line.id,
            sourceNode: node,
            targetNode: null,
            sourcePort: 'out',
            targetPort: null,
            type: 'unified',
            branchId: previewInstance.branchId || null,
            position: {
              start: previewInstance.line.getSourcePoint ? previewInstance.line.getSourcePoint() : null,
              end: previewInstance.line.getTargetPoint ? previewInstance.line.getTargetPoint() : null
            },
            state: previewInstance.state,
            isActive: this.graph ? this.graph.hasCell(previewInstance.line) : false
          }
          allLines.push(previewLine)
        }
      }
    })
    
    console.log('✅ [统一预览线管理器] 获取所有预览线完成:', {
      totalLines: allLines.length,
      branchLines: allLines.filter(line => line.branchId).length,
      singleLines: allLines.filter(line => !line.branchId).length,
      activeLines: allLines.filter(line => line.isActive).length
    })
    
    return allLines
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
   * 更新拖拽提示点位置（手工调整）- 已废弃，改为预览线终点拖拽
   * @param {Object} hintNode - 拖拽提示点节点
   * @param {Object} newPosition - 新位置 {x, y}
   */
  /*
  updateHintPosition(hintNode, newPosition) {
    const hintData = hintNode.getData() || {}
    const hintId = hintNode.id
    
    // 🔧 安全检查：确保新位置是有效数字
    if (!newPosition || 
        typeof newPosition.x !== 'number' || isNaN(newPosition.x) ||
        typeof newPosition.y !== 'number' || isNaN(newPosition.y)) {
      console.error('💥 [统一预览线管理器] 新位置无效，无法更新拖拽提示点:', {
        hintId,
        newPosition
      })
      return
    }
    
    console.log('🎯 [统一预览线管理器] 开始更新拖拽提示点位置:', {
      hintId: hintId,
      newPosition: newPosition,
      hintData: hintData
    })
    
    // 🔧 记录手工调整的位置
    this.manuallyAdjustedHints.set(hintId, {
      x: newPosition.x,
      y: newPosition.y,
      timestamp: Date.now()
    })
    
    console.log('📝 [统一预览线管理器] 记录手工调整的拖拽点位置:', {
      hintId: hintId,
      adjustedPosition: newPosition,
      totalAdjustedHints: this.manuallyAdjustedHints.size
    })
    
    // 查找对应的预览线实例
    let foundPreviewInstance = null
    let sourceNodeId = null
    let branchId = null
    let branchIndex = -1
    
    // 遍历所有预览线实例，找到包含这个拖拽提示点的实例
    for (const [nodeId, previewInstance] of this.previewLines) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        for (let i = 0; i < previewInstance.length; i++) {
          const instance = previewInstance[i]
          if (instance.hintNode && instance.hintNode.id === hintId) {
            foundPreviewInstance = instance
            sourceNodeId = nodeId
            branchId = instance.branchId
            branchIndex = i
            break
          }
        }
      } else {
        // 单一预览线
        if (previewInstance.hintNode && previewInstance.hintNode.id === hintId) {
          foundPreviewInstance = previewInstance
          sourceNodeId = nodeId
          branchId = previewInstance.branchId || 'default'
          break
        }
      }
      
      if (foundPreviewInstance) break
    }
    
    if (!foundPreviewInstance) {
      // 提供详细的调试信息
      const allPreviewLines = Array.from(this.previewLines.entries()).map(([nodeId, instance]) => {
        if (Array.isArray(instance)) {
          return {
            nodeId,
            type: 'branch',
            branches: instance.map(inst => ({
              branchId: inst.branchId,
              lineId: inst.line.id,
              hintNodeId: inst.hintNode ? inst.hintNode.id : null
            }))
          }
        } else {
          return {
            nodeId,
            type: 'single',
            lineId: instance.line.id,
            hintNodeId: instance.hintNode ? instance.hintNode.id : null
          }
        }
      })
      
      console.warn('⚠️ [统一预览线管理器] 未找到对应的预览线实例:', {
        searchingForHintId: hintId,
        allPreviewLines: allPreviewLines,
        manuallyAdjustedHints: Array.from(this.manuallyAdjustedHints.keys()),
        possibleCause: '预览线可能已被删除但手工调整记录未清理'
      })
      
      // 如果找不到预览线实例，清理对应的手工调整记录
      if (this.manuallyAdjustedHints.has(hintId)) {
        this.manuallyAdjustedHints.delete(hintId)
        console.log('🧹 [统一预览线管理器] 已清理孤立的手工调整记录:', {
          hintId,
          remainingAdjustments: this.manuallyAdjustedHints.size
        })
      }
      
      return
    }
    
    console.log('🔍 [统一预览线管理器] 找到对应的预览线实例:', {
      sourceNodeId: sourceNodeId,
      branchId: branchId,
      branchIndex: branchIndex,
      previewLineId: foundPreviewInstance.line.id
    })
    
    // 计算拖拽提示点中心位置作为预览线的新终点
    const hintSize = hintNode.getSize()
    
    // 🔧 安全检查：确保hintSize是有效的
    if (!hintSize || 
        typeof hintSize.width !== 'number' || isNaN(hintSize.width) ||
        typeof hintSize.height !== 'number' || isNaN(hintSize.height)) {
      console.error('💥 [统一预览线管理器] 拖拽提示点尺寸无效:', {
        hintId,
        hintSize
      })
      return
    }
    
    const newEndPosition = {
      x: newPosition.x + hintSize.width / 2,
      y: newPosition.y + hintSize.height / 2
    }
    
    // 🔧 最终安全检查：确保计算结果是有效数字
    if (typeof newEndPosition.x !== 'number' || isNaN(newEndPosition.x) ||
        typeof newEndPosition.y !== 'number' || isNaN(newEndPosition.y)) {
      console.error('💥 [统一预览线管理器] 计算的新终点位置无效:', {
        hintId,
        newPosition,
        hintSize,
        newEndPosition
      })
      return
    }
    
    console.log('📐 [统一预览线管理器] 计算新的预览线终点位置:', {
      hintPosition: newPosition,
      hintSize: hintSize,
      newEndPosition: newEndPosition
    })
    
    try {
      // 更新预览线的终点位置
      foundPreviewInstance.line.setTarget(newEndPosition)
      
      // 更新预览线实例中存储的终点位置
      foundPreviewInstance.endPosition = newEndPosition
      
      // 强制重新路由预览线
      this.setSafeRouter(foundPreviewInstance.line, {
        args: {
          step: 10,
          padding: 15,
          excludeEnds: ['source', 'target'],
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      })
      
      console.log('✅ [统一预览线管理器] 拖拽提示点位置更新成功:', {
        hintId: hintId,
        sourceNodeId: sourceNodeId,
        branchId: branchId,
        newEndPosition: newEndPosition,
        previewLineId: foundPreviewInstance.line.id
      })
      
    } catch (error) {
      console.error('💥 [统一预览线管理器] 更新拖拽提示点位置失败:', error)
    }
  }
  */

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
  cleanupRelatedEndpoints(nodeId) {
    const allNodes = this.graph.getNodes()
    const hintNodesToRemove = []
    
    // 查找所有与该节点相关的拖拽提示点
    allNodes.forEach(node => {
      const nodeData = node.getData() || {}
      
      // 检查是否是拖拽提示点
      if (nodeData.isEndpoint || nodeData.type === 'endpoint') {
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
   * 统一重新计算所有预览线的终点位置
   * 用于布局完成后与普通节点同步更新预览线终点位置
   */
  recalculateAllPreviewLineEndPositions() {
    console.log('🔧 [统一预览线管理器] 开始统一重新计算所有预览线终点位置')
    
    let updatedCount = 0
    let totalBranches = 0
    let syncedHintNodes = 0
    
    this.previewLines.forEach((previewInstance, nodeId) => {
      const node = this.graph.getCellById(nodeId)
      
      if (!node) {
        console.warn('⚠️ [统一预览线管理器] 节点不存在，跳过:', nodeId)
        return
      }
      
      console.log('🔄 [统一预览线管理器] 重新计算节点预览线终点位置:', {
        nodeId: nodeId,
        isArray: Array.isArray(previewInstance),
        branchCount: Array.isArray(previewInstance) ? previewInstance.length : 1
      })
      
      // 如果是分支预览线，为每个分支单独重新计算终点位置
      if (Array.isArray(previewInstance)) {
        const branches = this.getNodeBranches(node)
        
        previewInstance.forEach((instance, branchIndex) => {
          if (instance.line && instance.state !== UnifiedPreviewStates.HIDDEN) {
            // 🔧 获取对应的拖拽点实际位置（布局引擎计算后的位置）
            let actualHintPosition = null
            if (instance.hintNode) {
              const hintPosition = instance.hintNode.getPosition()
              const hintSize = instance.hintNode.getSize()
              // 计算拖拽点的中心坐标
              actualHintPosition = {
                x: hintPosition.x + hintSize.width / 2,
                y: hintPosition.y + hintSize.height / 2
              }
              
              console.log('🎯 [终点位置重新计算] 获取拖拽点实际位置:', {
                nodeId: nodeId,
                branchId: instance.branchId,
                branchIndex: branchIndex,
                hintNodeId: instance.hintNode.id,
                hintPosition: hintPosition,
                hintSize: hintSize,
                actualHintPosition: actualHintPosition
              })
            }
            
            // 🔧 优先使用拖拽点的实际位置，如果没有则重新计算
            let newEndPosition
            if (actualHintPosition) {
              // 使用拖拽点的实际位置作为终点位置
              newEndPosition = actualHintPosition
              console.log('✅ [终点位置重新计算] 使用拖拽点实际位置作为终点:', {
                nodeId: nodeId,
                branchId: instance.branchId,
                newEndPosition: newEndPosition
              })
            } else {
              // 如果没有拖拽点，重新计算终点位置
              newEndPosition = this.calculateBranchPreviewPosition(node, branches, branchIndex)
              console.log('⚠️ [终点位置重新计算] 拖拽点不存在，重新计算终点位置:', {
                nodeId: nodeId,
                branchId: instance.branchId,
                newEndPosition: newEndPosition
              })
            }
            
            // 更新预览线的终点位置
            instance.line.setTarget(newEndPosition)
            
            // 更新存储的endPosition
            instance.endPosition = newEndPosition
            
            console.log('✅ [统一预览线管理器] 分支预览线终点位置已重新计算:', {
              nodeId: nodeId,
              branchId: instance.branchId,
              branchIndex: branchIndex,
              newEndPosition: newEndPosition,
              usedHintPosition: !!actualHintPosition
            })
            
            totalBranches++
            if (actualHintPosition) {
              syncedHintNodes++
            }
          }
        })
      } else {
        // 单一预览线
        if (previewInstance.line && previewInstance.state !== UnifiedPreviewStates.HIDDEN) {
          // 🔧 获取对应的拖拽点实际位置（布局引擎计算后的位置）
          let actualHintPosition = null
          if (previewInstance.hintNode) {
            const hintPosition = previewInstance.hintNode.getPosition()
            const hintSize = previewInstance.hintNode.getSize()
            // 计算拖拽点的中心坐标
            actualHintPosition = {
              x: hintPosition.x + hintSize.width / 2,
              y: hintPosition.y + hintSize.height / 2
            }
            
            console.log('🎯 [终点位置重新计算] 获取单一预览线拖拽点实际位置:', {
              nodeId: nodeId,
              hintNodeId: previewInstance.hintNode.id,
              hintPosition: hintPosition,
              hintSize: hintSize,
              actualHintPosition: actualHintPosition
            })
          }
          
          // 🔧 优先使用拖拽点的实际位置，如果没有则重新计算
          let newEndPosition
          if (actualHintPosition) {
            // 使用拖拽点的实际位置作为终点位置
            newEndPosition = actualHintPosition
            console.log('✅ [终点位置重新计算] 使用单一预览线拖拽点实际位置作为终点:', {
              nodeId: nodeId,
              newEndPosition: newEndPosition
            })
          } else {
            // 如果没有拖拽点，重新计算终点位置
            const nodePosition = node.getPosition()
            const nodeSize = node.getSize()
            newEndPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
            console.log('⚠️ [终点位置重新计算] 单一预览线拖拽点不存在，重新计算终点位置:', {
              nodeId: nodeId,
              newEndPosition: newEndPosition
            })
          }
          
          // 更新预览线的终点位置
          previewInstance.line.setTarget(newEndPosition)
          
          // 更新存储的endPosition
          previewInstance.endPosition = newEndPosition
          
          console.log('✅ [统一预览线管理器] 单一预览线终点位置已重新计算:', {
            nodeId: nodeId,
            newEndPosition: newEndPosition,
            usedHintPosition: !!actualHintPosition
          })
          
          totalBranches++
          if (actualHintPosition) {
            syncedHintNodes++
          }
        }
      }
      
      updatedCount++
    })
    
    console.log('✅ [统一预览线管理器] 所有预览线终点位置重新计算完成:', {
      totalPreviewLines: this.previewLines.size,
      updatedNodes: updatedCount,
      totalBranches: totalBranches,
      syncedHintNodes: syncedHintNodes,
      syncRate: totalBranches > 0 ? `${((syncedHintNodes / totalBranches) * 100).toFixed(1)}%` : '0%'
    })
  }

  /**
   * 检查并执行自动吸附到预览线终点
   * 这是一个代理方法，调用统一预览线管理器的checkSnapToPreviewLines方法
   * @param {Object} dragNode - 被拖拽的节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   */
  checkSnapToPreviewLines(dragNode, nodePosition, nodeSize) {
    // 检查节点是否已有输入连接，如果有则跳过吸附
    const edges = this.graph.getIncomingEdges(dragNode)
    if (edges && edges.length > 0) {
      console.log('⏭️ [统一预览线管理器] 节点已有输入连接，跳过预览线终点吸附:', dragNode.id)
      return
    }
    
    // 🔧 防止重复吸附：检查是否正在处理吸附
    if (this.isProcessingSnap) {
      console.log('⏭️ [统一预览线管理器] 正在处理吸附，跳过重复调用:', dragNode.id)
      return
    }
    
    // 🔧 防止重复吸附：检查节点是否已经被标记为吸附目标
    if (this.snappedNodes && this.snappedNodes.has(dragNode.id)) {
      console.log('⏭️ [统一预览线管理器] 节点已被吸附，跳过重复处理:', dragNode.id)
      return
    }
    
    const dragNodeCenter = {
      x: nodePosition.x + nodeSize.width / 2,
      y: nodePosition.y + nodeSize.height / 2
    }
    
    let closestSnap = null
    let minDistance = Infinity
    const snapDistance = 80 // 80px吸附距离
    
    // 检查所有预览线的终点是否在吸附范围内
    this.previewLines.forEach((previewInstance, sourceNodeId) => {
      // 跳过自己的预览线
      if (sourceNodeId === dragNode.id) return
      
      // 🔧 新增：检查是否已经存在从这个源节点到目标节点的连接
      const existingConnection = this.graph.getEdges().find(edge => {
        const sourceNode = edge.getSourceNode()
        const targetNode = edge.getTargetNode()
        return sourceNode && targetNode && 
               sourceNode.id === sourceNodeId && 
               targetNode.id === dragNode.id
      })
      
      if (existingConnection) {
        console.log('⏭️ [统一预览线管理器] 已存在连接，跳过此源节点:', {
          sourceNodeId,
          targetNodeId: dragNode.id,
          existingEdgeId: existingConnection.id
        })
        return
      }
      
      // 处理分支预览线
      if (Array.isArray(previewInstance)) {
        previewInstance.forEach((instance, branchIndex) => {
          if (instance.line && instance.state !== UnifiedPreviewStates.HIDDEN && instance.endPosition) {
            const distance = Math.sqrt(
              Math.pow(dragNodeCenter.x - instance.endPosition.x, 2) + 
              Math.pow(dragNodeCenter.y - instance.endPosition.y, 2)
            )
            
            if (distance < snapDistance && distance < minDistance) {
              minDistance = distance
              closestSnap = {
                x: instance.endPosition.x - nodeSize.width / 2,
                y: instance.endPosition.y - nodeSize.height / 2,
                sourceNodeId: sourceNodeId,
                branchId: instance.branchId,
                branchLabel: instance.branchLabel,
                distance: distance,
                endPosition: instance.endPosition
              }
            }
          }
        })
      } else {
        // 处理单一预览线
        if (previewInstance.line && previewInstance.state !== UnifiedPreviewStates.HIDDEN && previewInstance.endPosition) {
          const distance = Math.sqrt(
            Math.pow(dragNodeCenter.x - previewInstance.endPosition.x, 2) + 
            Math.pow(dragNodeCenter.y - previewInstance.endPosition.y, 2)
          )
          
          if (distance < snapDistance && distance < minDistance) {
            minDistance = distance
            closestSnap = {
              x: previewInstance.endPosition.x - nodeSize.width / 2,
              y: previewInstance.endPosition.y - nodeSize.height / 2,
              sourceNodeId: sourceNodeId,
              branchId: null,
              branchLabel: null,
              distance: distance,
              endPosition: previewInstance.endPosition
            }
          }
        }
      }
    })
    
    // 执行自动吸附
    if (closestSnap) {
      console.log('🎯 [统一预览线管理器] 检测到预览线终点吸附:', {
        dragNodeId: dragNode.id,
        sourceNodeId: closestSnap.sourceNodeId,
        branchId: closestSnap.branchId,
        distance: closestSnap.distance,
        snapPosition: { x: closestSnap.x, y: closestSnap.y }
      })
      
      // 🔧 设置吸附处理标志，防止重复处理
      this.isProcessingSnap = true
      
      // 🔧 初始化已吸附节点集合
      if (!this.snappedNodes) {
        this.snappedNodes = new Set()
      }
      this.snappedNodes.add(dragNode.id)
      
      // 设置节点位置到吸附点
      dragNode.setPosition(closestSnap.x, closestSnap.y)
      
      // 高亮显示吸附的预览线
      this.highlightSnapTarget(closestSnap.sourceNodeId, closestSnap.branchId)
      
      // 延迟创建连接，避免拖拽过程中的冲突
      setTimeout(() => {
        // 🔧 再次检查是否已经存在连接，防止重复创建
        const finalCheck = this.graph.getEdges().find(edge => {
          const sourceNode = edge.getSourceNode()
          const targetNode = edge.getTargetNode()
          return sourceNode && targetNode && 
                 sourceNode.id === closestSnap.sourceNodeId && 
                 targetNode.id === dragNode.id
        })
        
        if (!finalCheck) {
          this.createSnapConnection(closestSnap.sourceNodeId, dragNode.id, closestSnap.branchId, closestSnap.branchLabel)
        } else {
          console.log('⏭️ [统一预览线管理器] 连接已存在，跳过创建:', {
            sourceNodeId: closestSnap.sourceNodeId,
            targetNodeId: dragNode.id,
            existingEdgeId: finalCheck.id
          })
        }
        
        // 🔧 重置吸附处理标志
        this.isProcessingSnap = false
      }, 100)
      
      return true
    }
    
    return false
  }

  /**
   * 高亮吸附目标预览线
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID（可选）
   */
  highlightSnapTarget(sourceNodeId, branchId) {
    const previewInstance = this.previewLines.get(sourceNodeId)
    if (!previewInstance) return
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线
      const targetInstance = previewInstance.find(instance => instance.branchId === branchId)
      if (targetInstance && targetInstance.line) {
        targetInstance.line.setAttrs({
          line: {
            stroke: '#ff4d4f',
            strokeWidth: 3,
            strokeDasharray: '5,5'
          }
        })
      }
    } else {
      // 单一预览线
      if (previewInstance.line) {
        previewInstance.line.setAttrs({
          line: {
            stroke: '#ff4d4f',
            strokeWidth: 3,
            strokeDasharray: '5,5'
          }
        })
      }
    }
  }

  /**
   * 创建吸附连接
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} branchId - 分支ID（可选）
   * @param {string} branchLabel - 分支标签（可选）
   */
  createSnapConnection(sourceNodeId, targetNodeId, branchId, branchLabel) {
    const sourceNode = this.graph.getCellById(sourceNodeId)
    const targetNode = this.graph.getCellById(targetNodeId)
    
    if (!sourceNode || !targetNode) {
      console.warn('🚫 [统一预览线管理器] 无法找到源节点或目标节点:', {
        sourceNodeId,
        targetNodeId,
        sourceNodeFound: !!sourceNode,
        targetNodeFound: !!targetNode
      })
      return
    }
    
    // 创建连接边
    const edge = this.graph.addEdge({
      source: {
        cell: sourceNodeId,
        port: 'out'
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
      connectionPoint: {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      },
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
        branchLabel,
        label: branchLabel, // 确保label字段也被设置
        sourceNodeId,
        targetNodeId,
        isAutoSnapped: true
      }
    })
    
    // 如果是分支连接，添加标签
    if (branchId && branchLabel) {
      edge.setLabels([{
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
        position: {
          distance: 0.5,
          offset: 0
        },
        attrs: {
          label: {
            text: branchLabel,
            fontSize: 12,
            fill: '#666'
          },
          body: {
            fill: '#fff',
            stroke: '#1890ff',
            strokeWidth: 1,
            rx: 3,
            ry: 3
          }
        }
      }])
      
      console.log('🏷️ [统一预览线管理器] 为分支连接添加标签:', {
        edgeId: edge.id,
        branchId: branchId,
        branchLabel: branchLabel
      })
    }
    
    // 移除对应的预览线
    if (branchId) {
      // 分支预览线：移除特定分支
      this.removeSpecificBranchPreviewLine(sourceNodeId, branchId)
    } else {
      // 单一预览线：移除整个预览线
      this.removePreviewLine(sourceNodeId)
    }
    
    console.log('✅ [统一预览线管理器] 预览线终点吸附连接创建成功:', {
      edgeId: edge.id,
      sourceNodeId,
      targetNodeId,
      branchId,
      branchLabel
    })
    
    return edge
  }

  /**
   * 清理吸附状态
   * 在节点拖拽结束后调用，清理防重复状态
   */
  clearSnapState() {
    this.isProcessingSnap = false
    if (this.snappedNodes) {
      this.snappedNodes.clear()
    }
    console.log('🧹 [统一预览线管理器] 已清理吸附状态')
  }

  /**
   * 🎯 新增：清理孤立预览线
   * 清理源节点不存在或已连接的预览线
   */
  cleanupOrphanedPreviewLines() {
    console.log('🧹 [预览线清理] 开始清理孤立预览线')
    
    let cleanedCount = 0
    const previewLinesToRemove = []
    
    // 检查所有预览线
    this.previewLines.forEach((previewInstance, nodeId) => {
      const sourceNode = this.graph.getCellById(nodeId)
      
      // 检查源节点是否存在
      if (!sourceNode) {
        previewLinesToRemove.push(nodeId)
        console.log(`🗑️ [预览线清理] 源节点不存在，标记清理: ${nodeId}`)
        return
      }
      
      // 检查节点是否已有实际连接
      const hasRealConnections = this.hasExistingRealConnections(sourceNode)
      if (hasRealConnections) {
        previewLinesToRemove.push(nodeId)
        console.log(`🗑️ [预览线清理] 节点已有实际连接，标记清理: ${nodeId}`)
        return
      }
      
      // 检查预览线实例是否有效
      if (previewInstance.line && previewInstance.line.removed) {
        previewLinesToRemove.push(nodeId)
        console.log(`🗑️ [预览线清理] 预览线已被移除，标记清理: ${nodeId}`)
        return
      }
    })
    
    // 执行清理
    previewLinesToRemove.forEach(nodeId => {
      this.removePreviewLine(nodeId)
      cleanedCount++
    })
    
    if (cleanedCount > 0) {
      console.log(`🧹 [预览线清理] 清理完成，共清理 ${cleanedCount} 条孤立预览线`)
    } else {
      console.log('✅ [预览线清理] 无需清理，所有预览线状态正常')
    }
    
    return cleanedCount
  }

  /**
   * 🎯 新增：执行加载完成检查
   * 在数据加载完成后调用，确保预览线状态正确
   */
  performLoadCompleteCheck() {
    console.log('🔍 [加载完成检查] 开始检查预览线状态')
    
    // 延迟执行，确保所有数据加载完成
    setTimeout(() => {
      const cleanedCount = this.cleanupOrphanedPreviewLines()
      
      // 统计当前状态
      const totalPreviewLines = this.previewLines.size
      const totalNodes = this.graph.getNodes().length
      
      console.log('📊 [加载完成检查] 状态统计:', {
        总节点数: totalNodes,
        预览线数量: totalPreviewLines,
        清理数量: cleanedCount,
        状态: cleanedCount > 0 ? '已优化' : '正常'
      })
      
      if (cleanedCount === 0 && totalPreviewLines > 0) {
        console.log('✅ [加载完成检查] 预览线状态良好，无需清理')
      }
    }, 100) // 100ms延迟确保所有异步操作完成
  }

  /**
   * 检查节点是否已有实际连接
   * @param {Object} node - 节点对象
   * @returns {boolean} 是否有实际连接
   */
  hasExistingRealConnections(node) {
    const edges = this.graph.getConnectedEdges(node)
    const realConnections = edges.filter(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isPreview && 
             !edgeData.isUnifiedPreview && 
             !edgeData.isPersistentPreview &&
             !edge.id.includes('unified_preview') &&
             !edge.id.includes('preview_')
    })
    
    return realConnections.length > 0
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