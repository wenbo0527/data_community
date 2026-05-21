/**
 * 布局管理服务
 * 基于 UnifiedStructuredLayoutEngine 提供统一的布局算法接口
 * 负责自动布局、手动调整、布局配置和优化等功能
 * 
 * 标准化接口规范：
 * - 统一的错误处理和返回值格式
 * - 标准化的异步操作Promise处理
 * - 统一的配置管理接口
 * - 清晰的服务生命周期管理
 */

import { UnifiedStructuredLayoutEngine } from '../utils/canvas/UnifiedStructuredLayoutEngine.js'
import { LayoutUtils } from '../utils/LayoutUtils.js'
import { EventBus } from '../utils/EventBus.js'

/**
 * 标准化服务响应格式
 */
export const ServiceResponse = {
  success: (data = {}, message = '') => ({
    success: true,
    data,
    message,
    timestamp: Date.now()
  }),
  
  error: (error, code = 'UNKNOWN_ERROR') => ({
    success: false,
    error: {
      message: error.message || error,
      code,
      stack: error.stack
    },
    timestamp: Date.now()
  })
}

/**
 * 布局类型枚举
 */
export const LayoutType = {
  HIERARCHICAL: 'hierarchical',
  HORIZONTAL: 'horizontal', 
  VERTICAL: 'vertical',
  RADIAL: 'radial',
  GRID: 'grid',
  FORCE_DIRECTED: 'force-directed',
  CIRCULAR: 'circular',
  TREE: 'tree'
}

/**
 * 对齐类型枚举
 */
export const AlignType = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
  CENTER_HORIZONTAL: 'center-horizontal',
  CENTER_VERTICAL: 'center-vertical',
  CENTER: 'center'
}

/**
 * 分布类型枚举
 */
export const DistributeType = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  HORIZONTAL_CENTER: 'horizontal-center',
  VERTICAL_CENTER: 'vertical-center'
}

/**
 * 布局管理服务类
 */
export class LayoutService {
  constructor(graph, eventBus = null) {
    this.graph = graph
    this.layoutEngine = null
    this.layoutUtils = null
    this.isEnabled = true
    this.layoutHistory = []
    this.maxHistorySize = 20
    
    // 事件总线 - 支持依赖注入
    this.eventBus = eventBus || new EventBus()
    
    // 🔧 修复：初始化事件监听器映射
    this.listeners = new Map()
    
    // 布局配置
    this.config = {
      // 默认布局参数
      defaultLayout: LayoutType.HIERARCHICAL,
      nodeSpacing: { x: 150, y: 100 },
      layerSpacing: 120,
      enableAnimation: true,
      animationDuration: 500,
      
      // 自动布局配置
      autoLayout: {
        enabled: false,
        trigger: 'node-change',
        debounce: 1000
      },
      
      // 性能配置
      performance: {
        enableCache: true,
        maxCacheSize: 100,
        enableDebounce: true,
        debounceDelay: 300
      }
    }
    
    // 状态管理
    this.state = {
      currentLayout: null,
      isLayouting: false,
      lastLayoutTime: null,
      layoutCount: 0,
      initialized: false
    }
    
    // 事件监听器清理函数
    this.eventUnsubscribers = []
    
    // 初始化服务
    this.initialize()
    
    console.log('📐 [布局管理服务] 初始化完成')
  }

  /**
   * 初始化服务
   */
  initialize() {
    try {
      // 初始化布局引擎
      this.layoutEngine = new UnifiedStructuredLayoutEngine(this.graph, {
        layout: this.config,
        performance: this.config.performance
      })
      
      // 初始化布局工具
      this.layoutUtils = new LayoutUtils()
      
      // 绑定事件监听
      this.bindEventListeners()
      
      console.log('✅ [布局管理服务] 初始化成功')
    } catch (error) {
      console.error('❌ [布局管理服务] 初始化失败:', error)
      throw new Error(`LayoutService 初始化失败: ${error.message}`)
    }
  }

  /**
   * 绑定事件监听器
   */
  bindEventListeners() {
    if (!this.graph) {return}

    // 监听节点变化
    this.graph.on('node:added', (args) => {
      this.handleNodeChange('added', args)
    })
    
    this.graph.on('node:removed', (args) => {
      this.handleNodeChange('removed', args)
    })
    
    this.graph.on('node:moved', (args) => {
      this.handleNodeChange('moved', args)
    })

    // 监听连线变化
    this.graph.on('edge:added', (args) => {
      this.handleEdgeChange('added', args)
    })
    
    this.graph.on('edge:removed', (args) => {
      this.handleEdgeChange('removed', args)
    })
  }

  /**
   * 处理节点变化
   * @param {string} action - 变化类型
   * @param {Object} args - 事件参数
   */
  handleNodeChange(action, args) {
    if (!this.config.autoLayout.enabled) {return}

    console.log('📐 [布局管理服务] 节点变化:', { action, nodeId: args.node?.id })
    
    // 触发自动布局
    if (this.config.autoLayout.trigger === 'node-change') {
      this.scheduleAutoLayout()
    }
  }

  /**
   * 处理连线变化
   * @param {string} action - 变化类型
   * @param {Object} args - 事件参数
   */
  handleEdgeChange(action, args) {
    if (!this.config.autoLayout.enabled) {return}

    console.log('📐 [布局管理服务] 连线变化:', { action, edgeId: args.edge?.id })
    
    // 触发自动布局
    if (this.config.autoLayout.trigger === 'node-change') {
      this.scheduleAutoLayout()
    }
  }

  // ==================== 布局执行接口 ====================

  /**
   * 执行层次布局
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} - 布局结果
   */
  async executeHierarchicalLayout(options = {}) {
    return this.executeLayout(LayoutType.HIERARCHICAL, {
      direction: 'TB', // Top to Bottom
      nodeSpacing: this.config.nodeSpacing,
      layerSpacing: this.config.layerSpacing,
      ...options
    })
  }

  /**
   * 执行水平布局
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} - 布局结果
   */
  async executeHorizontalLayout(options = {}) {
    return this.executeLayout(LayoutType.HORIZONTAL, {
      direction: 'LR', // Left to Right
      spacing: this.config.nodeSpacing.x,
      alignment: 'center',
      ...options
    })
  }

  /**
   * 执行垂直布局
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} - 布局结果
   */
  async executeVerticalLayout(options = {}) {
    return this.executeLayout(LayoutType.VERTICAL, {
      direction: 'TB', // Top to Bottom
      spacing: this.config.nodeSpacing.y,
      alignment: 'center',
      ...options
    })
  }

  /**
   * 执行径向布局
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} - 布局结果
   */
  async executeRadialLayout(options = {}) {
    return this.executeLayout(LayoutType.RADIAL, {
      center: options.center || this.calculateCanvasCenter(),
      radius: options.radius || 200,
      startAngle: options.startAngle || 0,
      ...options
    })
  }

  /**
   * 执行网格布局
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} - 布局结果
   */
  async executeGridLayout(options = {}) {
    const nodes = this.graph.getNodes() || []
    const cols = options.cols || Math.ceil(Math.sqrt(nodes.length))
    
    return this.executeLayout(LayoutType.GRID, {
      cols,
      rows: Math.ceil(nodes.length / cols),
      cellWidth: this.config.nodeSpacing.x,
      cellHeight: this.config.nodeSpacing.y,
      ...options
    })
  }

  /**
   * 执行力导向布局
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} - 布局结果
   */
  async executeForceDirectedLayout(options = {}) {
    return this.executeLayout(LayoutType.FORCE_DIRECTED, {
      iterations: options.iterations || 100,
      repulsion: options.repulsion || 200,
      attraction: options.attraction || 0.1,
      damping: options.damping || 0.9,
      ...options
    })
  }

  /**
   * 执行通用布局 - 标准化接口
   * @param {string} layoutType - 布局类型
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} - 标准化布局结果
   */
  async executeLayout(layoutType, options = {}) {
    try {
      // 参数验证
      this.validateLayoutParams(layoutType, options)
      
      if (!this.isEnabled) {
        return ServiceResponse.error(new Error('布局服务已禁用'), 'SERVICE_DISABLED')
      }

      if (this.state.isLayouting) {
        console.warn('📐 [布局管理服务] 布局正在进行中，跳过新的布局请求')
        return ServiceResponse.error(new Error('布局正在进行中'), 'LAYOUT_IN_PROGRESS')
      }

      console.log('📐 [布局管理服务] 开始执行布局:', { layoutType, options })

      this.state.isLayouting = true
      const startTime = Date.now()

      try {
        // 记录布局历史
        this.recordLayoutHistory(layoutType, options)

        // 触发布局开始事件
        this.emit('layout:start', { layoutType, options })

        let result

        // 根据布局类型执行相应的布局算法
        switch (layoutType) {
          case LayoutType.HIERARCHICAL:
            result = await this.layoutEngine.executeLayout({
              type: 'hierarchical',
              ...options
            })
            break

          case LayoutType.HORIZONTAL:
          case LayoutType.VERTICAL:
            result = await this.executeLinearLayout(layoutType, options)
            break

          case LayoutType.RADIAL:
          result = await this.executeRadialLayoutInternal(options)
          break

        case LayoutType.GRID:
          result = await this.executeGridLayoutInternal(options)
          break

        case LayoutType.FORCE_DIRECTED:
          result = await this.executeForceLayoutInternal(options)
          break

          default:
            return ServiceResponse.error(new Error(`不支持的布局类型: ${layoutType}`), 'UNSUPPORTED_LAYOUT_TYPE')
        }

        // 更新状态
        this.state.currentLayout = layoutType
        this.state.lastLayoutTime = Date.now()
        this.state.layoutCount++

        const duration = Date.now() - startTime
        console.log('✅ [布局管理服务] 布局执行完成:', {
          layoutType,
          duration: `${duration}ms`,
          nodesCount: result.nodesCount || 0
        })

        // 触发布局完成事件
        this.emit('layout:complete', {
          layoutType,
          result,
          duration
        })

        return ServiceResponse.success({
          layoutType,
          result,
          duration,
          timestamp: Date.now()
        }, `${layoutType} 布局执行成功`)

      } catch (error) {
        console.error('❌ [布局管理服务] 布局执行失败:', error)
        
        // 触发布局错误事件
        this.emit('layout:error', {
          layoutType,
          error: error.message
        })

        return ServiceResponse.error(error, 'LAYOUT_EXECUTION_ERROR')
      } finally {
        this.state.isLayouting = false
      }
    } catch (error) {
      console.error('❌ [布局管理服务] 参数验证失败:', error)
      return ServiceResponse.error(error, 'INVALID_PARAMETERS')
    }
  }

  /**
   * 验证布局参数
   * @param {string} layoutType - 布局类型
   * @param {Object} options - 布局选项
   */
  validateLayoutParams(layoutType, options) {
    if (!layoutType || typeof layoutType !== 'string') {
      throw new Error('布局类型不能为空且必须是字符串')
    }

    if (!Object.values(LayoutType).includes(layoutType)) {
      throw new Error(`不支持的布局类型: ${layoutType}`)
    }

    if (options && typeof options !== 'object') {
      throw new Error('布局选项必须是对象')
    }

    if (!this.graph) {
      throw new Error('图实例不存在')
    }

    // 特定布局类型的参数验证
    switch (layoutType) {
      case LayoutType.RADIAL:
        if (options.radius && (typeof options.radius !== 'number' || options.radius <= 0)) {
          throw new Error('径向布局的半径必须是正数')
        }
        break
      case LayoutType.GRID:
        if (options.cols && (typeof options.cols !== 'number' || options.cols <= 0)) {
          throw new Error('网格布局的列数必须是正数')
        }
        break
    }
  }

  // ==================== 内部布局实现 ====================

  /**
   * 执行线性布局（水平/垂直）
   * @param {string} layoutType - 布局类型
   * @param {Object} options - 布局选项
   */
  async executeLinearLayout(layoutType, options) {
    const nodes = this.graph.getNodes() || []
    if (nodes.length === 0) {
      return { nodesCount: 0, positions: new Map() }
    }

    const isHorizontal = layoutType === LayoutType.HORIZONTAL
    const spacing = options.spacing || (isHorizontal ? this.config.nodeSpacing.x : this.config.nodeSpacing.y)
    const alignment = options.alignment || 'center'

    const positions = new Map()
    const currentPos = 0

    // 计算起始位置
    const canvasCenter = this.calculateCanvasCenter()
    const startX = isHorizontal ? canvasCenter.x - (nodes.length * spacing) / 2 : canvasCenter.x
    const startY = isHorizontal ? canvasCenter.y : canvasCenter.y - (nodes.length * spacing) / 2

    nodes.forEach((node, index) => {
      const nodeSize = node.getSize()
      
      let x, y
      if (isHorizontal) {
        x = startX + index * spacing
        y = this.calculateAlignedPosition(startY, nodeSize.height, alignment, 'vertical')
      } else {
        x = this.calculateAlignedPosition(startX, nodeSize.width, alignment, 'horizontal')
        y = startY + index * spacing
      }

      positions.set(node.id, { x, y })
      
      // 应用位置
      if (this.config.enableAnimation) {
        node.position(x, y, { transition: { duration: this.config.animationDuration } })
      } else {
        node.position(x, y)
      }
    })

    return {
      nodesCount: nodes.length,
      positions,
      bounds: this.calculateLayoutBounds(positions)
    }
  }

  /**
   * 执行径向布局内部实现
   * @param {Object} options - 布局选项
   */
  async executeRadialLayoutInternal(options) {
    const nodes = this.graph.getNodes() || []
    if (nodes.length === 0) {
      return { nodesCount: 0, positions: new Map() }
    }

    const center = options.center || this.calculateCanvasCenter()
    const radius = options.radius || 200
    const startAngle = options.startAngle || 0
    const angleStep = (2 * Math.PI) / nodes.length

    const positions = new Map()

    nodes.forEach((node, index) => {
      const angle = startAngle + index * angleStep
      const x = center.x + radius * Math.cos(angle)
      const y = center.y + radius * Math.sin(angle)

      positions.set(node.id, { x, y })
      
      // 应用位置
      if (this.config.enableAnimation) {
        node.position(x, y, { transition: { duration: this.config.animationDuration } })
      } else {
        node.position(x, y)
      }
    })

    return {
      nodesCount: nodes.length,
      positions,
      bounds: this.calculateLayoutBounds(positions),
      center,
      radius
    }
  }

  /**
   * 执行网格布局内部实现
   * @param {Object} options - 布局选项
   */
  async executeGridLayoutInternal(options) {
    const nodes = this.graph.getNodes() || []
    if (nodes.length === 0) {
      return { nodesCount: 0, positions: new Map() }
    }

    const cols = options.cols || Math.ceil(Math.sqrt(nodes.length))
    const rows = options.rows || Math.ceil(nodes.length / cols)
    const cellWidth = options.cellWidth || this.config.nodeSpacing.x
    const cellHeight = options.cellHeight || this.config.nodeSpacing.y

    const canvasCenter = this.calculateCanvasCenter()
    const gridWidth = cols * cellWidth
    const gridHeight = rows * cellHeight
    const startX = canvasCenter.x - gridWidth / 2
    const startY = canvasCenter.y - gridHeight / 2

    const positions = new Map()

    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      
      const x = startX + col * cellWidth + cellWidth / 2
      const y = startY + row * cellHeight + cellHeight / 2

      positions.set(node.id, { x, y })
      
      // 应用位置
      if (this.config.enableAnimation) {
        node.position(x, y, { transition: { duration: this.config.animationDuration } })
      } else {
        node.position(x, y)
      }
    })

    return {
      nodesCount: nodes.length,
      positions,
      bounds: this.calculateLayoutBounds(positions),
      grid: { cols, rows, cellWidth, cellHeight }
    }
  }

  /**
   * 执行力导向布局内部实现
   * @param {Object} options - 布局选项
   */
  async executeForceLayoutInternal(options) {
    const nodes = this.graph.getNodes() || []
    const edges = this.graph.getEdges() || []
    
    if (nodes.length === 0) {
      return { nodesCount: 0, positions: new Map() }
    }

    // 使用 LayoutUtils 的力导向算法
    const result = this.layoutUtils.calculateForceDirectedLayout(nodes, edges, {
      iterations: options.iterations || 100,
      repulsion: options.repulsion || 200,
      attraction: options.attraction || 0.1,
      damping: options.damping || 0.9,
      center: this.calculateCanvasCenter()
    })

    // 应用位置
    result.positions.forEach((position, nodeId) => {
      const node = this.graph.getCellById(nodeId)
      if (node) {
        if (this.config.enableAnimation) {
          node.position(position.x, position.y, { 
            transition: { duration: this.config.animationDuration } 
          })
        } else {
          node.position(position.x, position.y)
        }
      }
    })

    return result
  }

  // ==================== 节点对齐和分布 ====================

  /**
   * 对齐选中的节点
   * @param {string} alignType - 对齐类型
   * @param {Array} nodeIds - 节点ID数组，为空时使用选中节点
   */
  alignNodes(alignType, nodeIds = null) {
    const targetNodes = nodeIds ? 
      nodeIds.map(id => this.graph.getCellById(id)).filter(Boolean) :
      this.graph.getSelectedCells().filter(cell => cell.isNode())

    if (targetNodes.length < 2) {
      console.warn('📐 [布局管理服务] 对齐操作需要至少2个节点')
      return false
    }

    console.log('📐 [布局管理服务] 对齐节点:', { alignType, count: targetNodes.length })

    try {
      const result = this.layoutUtils.alignNodes(targetNodes, alignType)
      
      // 应用对齐结果
      result.positions.forEach((position, nodeId) => {
        const node = this.graph.getCellById(nodeId)
        if (node) {
          if (this.config.enableAnimation) {
            node.position(position.x, position.y, { 
              transition: { duration: this.config.animationDuration } 
            })
          } else {
            node.position(position.x, position.y)
          }
        }
      })

      this.emit('nodes:aligned', { alignType, nodes: targetNodes.length, result })
      return true
    } catch (error) {
      console.error('❌ [布局管理服务] 节点对齐失败:', error)
      return false
    }
  }

  /**
   * 分布选中的节点
   * @param {string} distributeType - 分布类型
   * @param {Array} nodeIds - 节点ID数组，为空时使用选中节点
   */
  distributeNodes(distributeType, nodeIds = null) {
    const targetNodes = nodeIds ? 
      nodeIds.map(id => this.graph.getCellById(id)).filter(Boolean) :
      this.graph.getSelectedCells().filter(cell => cell.isNode())

    if (targetNodes.length < 3) {
      console.warn('📐 [布局管理服务] 分布操作需要至少3个节点')
      return false
    }

    console.log('📐 [布局管理服务] 分布节点:', { distributeType, count: targetNodes.length })

    try {
      const result = this.layoutUtils.distributeNodes(targetNodes, distributeType)
      
      // 应用分布结果
      result.positions.forEach((position, nodeId) => {
        const node = this.graph.getCellById(nodeId)
        if (node) {
          if (this.config.enableAnimation) {
            node.position(position.x, position.y, { 
              transition: { duration: this.config.animationDuration } 
            })
          } else {
            node.position(position.x, position.y)
          }
        }
      })

      this.emit('nodes:distributed', { distributeType, nodes: targetNodes.length, result })
      return true
    } catch (error) {
      console.error('❌ [布局管理服务] 节点分布失败:', error)
      return false
    }
  }

  /**
   * 居中内容到画布
   * @param {Array} nodeIds - 节点ID数组，为空时使用所有节点
   */
  centerContent(nodeIds = null) {
    const targetNodes = nodeIds ? 
      nodeIds.map(id => this.graph.getCellById(id)).filter(Boolean) :
      this.graph.getNodes()

    if (targetNodes.length === 0) {
      console.warn('📐 [布局管理服务] 没有节点可以居中')
      return false
    }

    console.log('📐 [布局管理服务] 居中内容:', { count: targetNodes.length })

    try {
      const result = this.layoutUtils.centerContent(targetNodes, this.calculateCanvasCenter())
      
      // 应用居中结果
      result.positions.forEach((position, nodeId) => {
        const node = this.graph.getCellById(nodeId)
        if (node) {
          if (this.config.enableAnimation) {
            node.position(position.x, position.y, { 
              transition: { duration: this.config.animationDuration } 
            })
          } else {
            node.position(position.x, position.y)
          }
        }
      })

      this.emit('content:centered', { nodes: targetNodes.length, result })
      return true
    } catch (error) {
      console.error('❌ [布局管理服务] 内容居中失败:', error)
      return false
    }
  }

  // ==================== 自动布局管理 ====================

  /**
   * 启用自动布局
   * @param {Object} options - 自动布局配置
   */
  enableAutoLayout(options = {}) {
    this.config.autoLayout = {
      ...this.config.autoLayout,
      enabled: true,
      ...options
    }
    
    console.log('📐 [布局管理服务] 启用自动布局:', this.config.autoLayout)
    this.emit('auto-layout:enabled', this.config.autoLayout)
  }

  /**
   * 禁用自动布局
   */
  disableAutoLayout() {
    this.config.autoLayout.enabled = false
    
    // 清除待执行的自动布局
    if (this.autoLayoutTimer) {
      clearTimeout(this.autoLayoutTimer)
      this.autoLayoutTimer = null
    }
    
    console.log('📐 [布局管理服务] 禁用自动布局')
    this.emit('auto-layout:disabled')
  }

  /**
   * 调度自动布局
   */
  scheduleAutoLayout() {
    if (!this.config.autoLayout.enabled || this.state.isLayouting) {
      return
    }

    // 清除之前的定时器
    if (this.autoLayoutTimer) {
      clearTimeout(this.autoLayoutTimer)
    }

    // 设置新的定时器
    this.autoLayoutTimer = setTimeout(() => {
      this.executeAutoLayout()
    }, this.config.autoLayout.debounce)
  }

  /**
   * 执行自动布局
   */
  async executeAutoLayout() {
    if (!this.config.autoLayout.enabled) {
      return
    }

    console.log('📐 [布局管理服务] 执行自动布局')
    
    try {
      const layoutType = this.config.defaultLayout
      await this.executeLayout(layoutType, {
        auto: true,
        reason: 'auto-layout'
      })
    } catch (error) {
      console.error('❌ [布局管理服务] 自动布局失败:', error)
    }
  }

  // ==================== 布局配置管理 ====================

  /**
   * 更新布局配置
   * @param {Object} newConfig - 新的配置
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    }
    
    console.log('📐 [布局管理服务] 更新配置:', newConfig)
    this.emit('config:updated', this.config)
  }

  /**
   * 获取布局配置
   * @returns {Object} - 当前配置
   */
  getConfig() {
    return { ...this.config }
  }

  /**
   * 重置配置为默认值
   */
  resetConfig() {
    const defaultConfig = {
      defaultLayout: LayoutType.HIERARCHICAL,
      nodeSpacing: { x: 150, y: 100 },
      layerSpacing: 120,
      enableAnimation: true,
      animationDuration: 500,
      autoLayout: {
        enabled: false,
        trigger: 'node-change',
        debounce: 1000
      },
      performance: {
        enableCache: true,
        maxCacheSize: 100,
        enableDebounce: true,
        debounceDelay: 300
      }
    }
    
    this.config = defaultConfig
    console.log('📐 [布局管理服务] 重置配置为默认值')
    this.emit('config:reset', this.config)
  }

  // ==================== 辅助方法 ====================

  /**
   * 计算画布中心点
   * @returns {Object} - 中心点坐标
   */
  calculateCanvasCenter() {
    if (!this.graph) {
      return { x: 400, y: 300 }
    }

    try {
      const graphArea = this.graph.getGraphArea()
      return {
        x: graphArea.width / 2,
        y: graphArea.height / 2
      }
    } catch (error) {
      console.error('[LayoutService] 计算画布中心失败:', error)
      throw new Error(`计算画布中心失败: ${error.message}`)
    }
  }

  /**
   * 计算对齐位置
   * @param {number} basePos - 基准位置
   * @param {number} size - 尺寸
   * @param {string} alignment - 对齐方式
   * @param {string} direction - 方向
   * @returns {number} - 对齐后的位置
   */
  calculateAlignedPosition(basePos, size, alignment, direction) {
    switch (alignment) {
      case 'start':
      case 'left':
      case 'top':
        return basePos
      case 'center':
        return basePos - size / 2
      case 'end':
      case 'right':
      case 'bottom':
        return basePos - size
      default:
        return basePos - size / 2
    }
  }

  /**
   * 计算布局边界
   * @param {Map} positions - 位置映射
   * @returns {Object} - 边界信息
   */
  calculateLayoutBounds(positions) {
    if (positions.size === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    positions.forEach(pos => {
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x)
      maxY = Math.max(maxY, pos.y)
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * 记录布局历史
   * @param {string} layoutType - 布局类型
   * @param {Object} options - 布局选项
   */
  recordLayoutHistory(layoutType, options) {
    const historyEntry = {
      layoutType,
      options: { ...options },
      timestamp: Date.now(),
      nodeCount: this.graph.getNodes().length,
      edgeCount: this.graph.getEdges().length
    }

    this.layoutHistory.unshift(historyEntry)
    
    // 限制历史记录数量
    if (this.layoutHistory.length > this.maxHistorySize) {
      this.layoutHistory = this.layoutHistory.slice(0, this.maxHistorySize)
    }
  }

  // ==================== 状态查询接口 ====================

  /**
   * 获取当前布局状态
   * @returns {Object} - 布局状态
   */
  getLayoutState() {
    return { ...this.state }
  }

  /**
   * 获取布局历史
   * @returns {Array} - 布局历史记录
   */
  getLayoutHistory() {
    return [...this.layoutHistory]
  }

  /**
   * 检查是否正在布局
   * @returns {boolean} - 是否正在布局
   */
  isLayouting() {
    return this.state.isLayouting
  }

  /**
   * 获取服务状态
   * @returns {Object} - 服务状态信息
   */
  getStatus() {
    return {
      initialized: true,
      enabled: this.isEnabled,
      state: this.state,
      config: this.config,
      layoutHistory: this.layoutHistory.length,
      autoLayoutEnabled: this.config.autoLayout.enabled,
      currentLayout: this.state.currentLayout,
      performance: {
        layoutCount: this.state.layoutCount,
        lastLayoutTime: this.state.lastLayoutTime,
        averageLayoutTime: this.calculateAverageLayoutTime()
      }
    }
  }

  /**
   * 计算平均布局时间
   * @returns {number} - 平均布局时间（毫秒）
   */
  calculateAverageLayoutTime() {
    if (this.layoutHistory.length === 0) {
      return 0
    }

    const recentLayouts = this.layoutHistory.slice(0, 10)
    const totalTime = recentLayouts.reduce((sum, entry) => {
      return sum + (entry.duration || 0)
    }, 0)

    return Math.round(totalTime / recentLayouts.length)
  }

  // ==================== 事件系统 ====================

  /**
   * 注册事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   * @returns {string} - 监听器ID
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Map())
    }
    
    const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.listeners.get(event).set(listenerId, listener)
    
    return listenerId
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {string} listenerId - 监听器ID
   */
  off(event, listenerId) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(listenerId)
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   */
  emit(event, data) {
    if (!this.listeners.has(event)) {
      return
    }

    const eventListeners = this.listeners.get(event)
    eventListeners.forEach((listener, listenerId) => {
      try {
        listener(data)
      } catch (error) {
        console.error(`❌ [布局管理服务] 事件监听器错误 (${event}):`, error)
      }
    })
  }

  // ==================== 生命周期管理 ====================

  /**
   * 启用服务
   */
  enable() {
    this.isEnabled = true
    console.log('📐 [布局管理服务] 服务已启用')
    this.emit('service:enabled')
  }

  /**
   * 禁用服务
   */
  disable() {
    this.isEnabled = false
    
    // 停止自动布局
    this.disableAutoLayout()
    
    console.log('📐 [布局管理服务] 服务已禁用')
    this.emit('service:disabled')
  }

  /**
   * 销毁服务
   */
  destroy() {
    try {
      // 禁用服务
      this.disable()
      
      // 🔧 修复：安全清理事件监听器
      if (this.listeners && typeof this.listeners.clear === 'function') {
        this.listeners.clear()
      }
      
      // 清理定时器
      if (this.autoLayoutTimer) {
        clearTimeout(this.autoLayoutTimer)
        this.autoLayoutTimer = null
      }
      
      // 清理引用
      this.graph = null
      this.layoutEngine = null
      this.layoutUtils = null
      this.listeners = null
      
      console.log('📐 [布局管理服务] 服务已销毁')
    } catch (error) {
      console.error('❌ [布局管理服务] 销毁服务时出错:', error)
    }
  }
}

/**
 * 布局管理服务工厂函数
 * @param {Object} graph - X6 图实例
 * @returns {LayoutService} - 布局管理服务实例
 */
export function createLayoutService(graph) {
  return new LayoutService(graph)
}

/**
 * 默认布局配置
 */
export const DefaultLayoutConfig = {
  [LayoutType.HIERARCHICAL]: {
    direction: 'TB',
    nodeSpacing: { x: 150, y: 100 },
    layerSpacing: 120
  },
  [LayoutType.HORIZONTAL]: {
    direction: 'LR',
    spacing: 150,
    alignment: 'center'
  },
  [LayoutType.VERTICAL]: {
    direction: 'TB',
    spacing: 100,
    alignment: 'center'
  },
  [LayoutType.RADIAL]: {
    radius: 200,
    startAngle: 0
  },
  [LayoutType.GRID]: {
    cellWidth: 150,
    cellHeight: 100
  },
  [LayoutType.FORCE_DIRECTED]: {
    iterations: 100,
    repulsion: 200,
    attraction: 0.1,
    damping: 0.9
  }
}

export default LayoutService