/**
 * 布局管理服务
 * 基于 UnifiedStructuredLayoutEngine 提供统一的布局算法接口
 * 负责自动布局、手动调整、布局配置和优化等功能
 */

import { UnifiedStructuredLayoutEngine } from '../../pages/marketing/tasks/utils/canvas/UnifiedStructuredLayoutEngine.js'
import { LayoutUtils } from '../../pages/marketing/tasks/utils/LayoutUtils.js'

export class LayoutService {
  constructor() {
    this.graph = null
    this.layoutEngine = null
    this.layoutUtils = null
    this.initialized = false
    this.listeners = new Map()
    
    // 状态管理
    this.state = {
      currentLayout: 'hierarchical',
      isLayouting: false,
      lastLayoutTime: null,
      layoutHistory: [],
      autoLayoutEnabled: true,
      layoutLocked: false
    }
    
    // 配置选项
    this.config = {
      defaultLayout: 'hierarchical',
      autoLayoutDelay: 500,
      enableAnimation: true,
      animationDuration: 300,
      layouts: {
        hierarchical: {
          direction: 'TB',
          nodeSpacing: 80,
          layerSpacing: 120,
          algorithm: 'compactBox'
        },
        horizontal: {
          direction: 'LR',
          nodeSpacing: 100,
          layerSpacing: 150,
          algorithm: 'compactBox'
        },
        vertical: {
          direction: 'TB',
          nodeSpacing: 60,
          layerSpacing: 100,
          algorithm: 'compactBox'
        },
        radial: {
          centerNode: null,
          radius: 200,
          angleStep: 30,
          layerDistance: 150
        },
        grid: {
          columns: 4,
          cellWidth: 200,
          cellHeight: 150,
          padding: 20
        },
        force: {
          strength: 0.3,
          distance: 100,
          iterations: 300,
          alpha: 0.1
        }
      }
    }
  }

  /**
   * 初始化服务
   * @param {Object} graph - X6 图形实例
   * @param {Object} options - 配置选项
   */
  async initialize(graph, options = {}) {
    if (this.initialized) {
      console.warn('[LayoutService] 服务已经初始化')
      return
    }

    try {
      this.graph = graph
      
      // 合并配置
      this.config = { ...this.config, ...options }
      
      // 初始化布局引擎
      this.layoutEngine = new UnifiedStructuredLayoutEngine(
        graph, 
        {
          layout: this.config.layouts[this.config.defaultLayout],
          performance: {
            cache: { enabled: true, maxSize: 100 },
            debounce: { delay: this.config.autoLayoutDelay },
            monitor: { enabled: true }
          }
        }
      )
      
      // 初始化布局工具
      this.layoutUtils = new LayoutUtils()
      
      // 绑定事件监听
      this.bindEvents()
      
      this.initialized = true
      console.log('[LayoutService] 布局管理服务初始化完成')
      
      // 触发初始化完成事件
      this.emit('initialized', { service: this })
      
    } catch (error) {
      console.error('[LayoutService] 初始化失败:', error)
      throw new Error(`LayoutService 初始化失败: ${error.message}`)
    }
  }

  /**
   * 绑定事件监听
   */
  bindEvents() {
    if (!this.graph) return

    // 监听节点变化
    this.graph.on('node:added', (args) => {
      if (this.state.autoLayoutEnabled && !this.state.layoutLocked) {
        this.scheduleAutoLayout('node-added', args)
      }
    })

    this.graph.on('node:removed', (args) => {
      if (this.state.autoLayoutEnabled && !this.state.layoutLocked) {
        this.scheduleAutoLayout('node-removed', args)
      }
    })

    // 监听连线变化
    this.graph.on('edge:added', (args) => {
      if (this.state.autoLayoutEnabled && !this.state.layoutLocked) {
        this.scheduleAutoLayout('edge-added', args)
      }
    })

    this.graph.on('edge:removed', (args) => {
      if (this.state.autoLayoutEnabled && !this.state.layoutLocked) {
        this.scheduleAutoLayout('edge-removed', args)
      }
    })
  }

  // ==================== 布局执行接口 ====================

  /**
   * 执行自动布局
   * @param {string} layoutType - 布局类型
   * @param {Object} options - 布局选项
   */
  async executeLayout(layoutType = null, options = {}) {
    if (!this.graph || !this.layoutEngine) {
      throw new Error('LayoutService 未初始化')
    }

    if (this.state.isLayouting) {
      console.warn('[LayoutService] 布局正在进行中，跳过此次请求')
      return { success: false, reason: 'layout-in-progress' }
    }

    const targetLayout = layoutType || this.state.currentLayout
    
    try {
      this.state.isLayouting = true
      this.state.lastLayoutTime = Date.now()
      
      console.log(`[LayoutService] 开始执行 ${targetLayout} 布局`)
      
      // 获取布局配置
      const layoutConfig = this.getLayoutConfig(targetLayout, options)
      
      // 准备布局输入
      const layoutInput = {
        bounds: this.getCanvasBounds(),
        options: layoutConfig,
        applicationOptions: {
          animate: this.config.enableAnimation,
          duration: this.config.animationDuration
        }
      }
      
      // 执行布局
      const result = await this.layoutEngine.executeLayout(layoutInput)
      
      if (result.success) {
        // 更新状态
        this.state.currentLayout = targetLayout
        this.addToHistory(targetLayout, result)
        
        // 触发布局完成事件
        this.emit('layout-completed', {
          layoutType: targetLayout,
          result,
          duration: Date.now() - this.state.lastLayoutTime
        })
        
        console.log(`[LayoutService] ${targetLayout} 布局执行完成`)
        return result
      } else {
        throw new Error(result.error || '布局执行失败')
      }
      
    } catch (error) {
      console.error('[LayoutService] 布局执行失败:', error)
      
      this.emit('layout-error', {
        layoutType: targetLayout,
        error: error.message,
        options
      })
      
      return {
        success: false,
        error: error.message,
        layoutType: targetLayout
      }
    } finally {
      this.state.isLayouting = false
    }
  }

  /**
   * 执行层次布局
   * @param {Object} options - 布局选项
   */
  async executeHierarchicalLayout(options = {}) {
    return this.executeLayout('hierarchical', options)
  }

  /**
   * 执行水平布局
   * @param {Object} options - 布局选项
   */
  async executeHorizontalLayout(options = {}) {
    return this.executeLayout('horizontal', options)
  }

  /**
   * 执行垂直布局
   * @param {Object} options - 布局选项
   */
  async executeVerticalLayout(options = {}) {
    return this.executeLayout('vertical', options)
  }

  /**
   * 执行径向布局
   * @param {Object} centerNode - 中心节点
   * @param {Object} options - 布局选项
   */
  async executeRadialLayout(centerNode = null, options = {}) {
    const radialOptions = {
      ...options,
      centerNode: centerNode || this.findCenterNode()
    }
    return this.executeLayout('radial', radialOptions)
  }

  /**
   * 执行网格布局
   * @param {Object} options - 布局选项
   */
  async executeGridLayout(options = {}) {
    return this.executeLayout('grid', options)
  }

  /**
   * 执行力导向布局
   * @param {Object} options - 布局选项
   */
  async executeForceLayout(options = {}) {
    return this.executeLayout('force', options)
  }

  // ==================== 节点对齐和分布 ====================

  /**
   * 对齐选中的节点
   * @param {Array} nodes - 节点数组
   * @param {string} alignType - 对齐类型 ('left', 'center', 'right', 'top', 'middle', 'bottom')
   */
  alignNodes(nodes, alignType) {
    if (!nodes || nodes.length < 2) {
      console.warn('[LayoutService] 需要至少2个节点才能对齐')
      return false
    }

    try {
      const alignedPositions = this.layoutUtils.alignNodes(nodes, alignType)
      
      // 应用新位置
      alignedPositions.forEach((position, nodeId) => {
        const node = this.graph.getCellById(nodeId)
        if (node) {
          node.setPosition(position.x, position.y)
        }
      })
      
      this.emit('nodes-aligned', {
        nodes,
        alignType,
        positions: alignedPositions
      })
      
      return true
    } catch (error) {
      console.error('[LayoutService] 节点对齐失败:', error)
      return false
    }
  }

  /**
   * 分布选中的节点
   * @param {Array} nodes - 节点数组
   * @param {string} distributeType - 分布类型 ('horizontal', 'vertical')
   */
  distributeNodes(nodes, distributeType) {
    if (!nodes || nodes.length < 3) {
      console.warn('[LayoutService] 需要至少3个节点才能分布')
      return false
    }

    try {
      const distributedPositions = this.layoutUtils.distributeNodes(nodes, distributeType)
      
      // 应用新位置
      distributedPositions.forEach((position, nodeId) => {
        const node = this.graph.getCellById(nodeId)
        if (node) {
          node.setPosition(position.x, position.y)
        }
      })
      
      this.emit('nodes-distributed', {
        nodes,
        distributeType,
        positions: distributedPositions
      })
      
      return true
    } catch (error) {
      console.error('[LayoutService] 节点分布失败:', error)
      return false
    }
  }

  /**
   * 居中显示所有内容
   */
  centerContent() {
    if (!this.graph) return false

    try {
      const contentBounds = this.graph.getContentBBox()
      const canvasBounds = this.getCanvasBounds()
      
      const centerX = (canvasBounds.width - contentBounds.width) / 2
      const centerY = (canvasBounds.height - contentBounds.height) / 2
      
      const offsetX = centerX - contentBounds.x
      const offsetY = centerY - contentBounds.y
      
      // 移动所有节点
      const nodes = this.graph.getNodes()
      nodes.forEach(node => {
        const position = node.getPosition()
        node.setPosition(position.x + offsetX, position.y + offsetY)
      })
      
      this.emit('content-centered', {
        offset: { x: offsetX, y: offsetY },
        bounds: contentBounds
      })
      
      return true
    } catch (error) {
      console.error('[LayoutService] 居中内容失败:', error)
      return false
    }
  }

  // ==================== 自动布局管理 ====================

  /**
   * 启用自动布局
   */
  enableAutoLayout() {
    this.state.autoLayoutEnabled = true
    this.emit('auto-layout-enabled')
    console.log('[LayoutService] 自动布局已启用')
  }

  /**
   * 禁用自动布局
   */
  disableAutoLayout() {
    this.state.autoLayoutEnabled = false
    this.emit('auto-layout-disabled')
    console.log('[LayoutService] 自动布局已禁用')
  }

  /**
   * 锁定布局（防止自动布局）
   */
  lockLayout() {
    this.state.layoutLocked = true
    this.emit('layout-locked')
    console.log('[LayoutService] 布局已锁定')
  }

  /**
   * 解锁布局
   */
  unlockLayout() {
    this.state.layoutLocked = false
    this.emit('layout-unlocked')
    console.log('[LayoutService] 布局已解锁')
  }

  /**
   * 调度自动布局
   * @param {string} trigger - 触发原因
   * @param {Object} data - 相关数据
   */
  scheduleAutoLayout(trigger, data) {
    if (this.autoLayoutTimer) {
      clearTimeout(this.autoLayoutTimer)
    }

    this.autoLayoutTimer = setTimeout(async () => {
      try {
        await this.executeLayout()
        console.log(`[LayoutService] 自动布局完成 (触发: ${trigger})`)
      } catch (error) {
        console.error('[LayoutService] 自动布局失败:', error)
      }
    }, this.config.autoLayoutDelay)
  }

  // ==================== 布局配置管理 ====================

  /**
   * 获取布局配置
   * @param {string} layoutType - 布局类型
   * @param {Object} options - 额外选项
   */
  getLayoutConfig(layoutType, options = {}) {
    const baseConfig = this.config.layouts[layoutType] || this.config.layouts.hierarchical
    return { ...baseConfig, ...options }
  }

  /**
   * 设置布局配置
   * @param {string} layoutType - 布局类型
   * @param {Object} config - 配置对象
   */
  setLayoutConfig(layoutType, config) {
    if (!this.config.layouts[layoutType]) {
      this.config.layouts[layoutType] = {}
    }
    
    this.config.layouts[layoutType] = { ...this.config.layouts[layoutType], ...config }
    
    this.emit('layout-config-updated', {
      layoutType,
      config: this.config.layouts[layoutType]
    })
  }

  /**
   * 重置布局配置
   * @param {string} layoutType - 布局类型
   */
  resetLayoutConfig(layoutType) {
    if (this.config.layouts[layoutType]) {
      delete this.config.layouts[layoutType]
      this.emit('layout-config-reset', { layoutType })
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 获取画布边界
   */
  getCanvasBounds() {
    if (!this.graph) return { x: 0, y: 0, width: 800, height: 600 }
    
    const container = this.graph.container
    return {
      x: 0,
      y: 0,
      width: container.clientWidth || 800,
      height: container.clientHeight || 600
    }
  }

  /**
   * 查找中心节点（用于径向布局）
   */
  findCenterNode() {
    const nodes = this.graph.getNodes()
    if (nodes.length === 0) return null
    
    // 简单策略：选择连接数最多的节点
    let centerNode = nodes[0]
    let maxConnections = 0
    
    nodes.forEach(node => {
      const connections = this.graph.getConnectedEdges(node).length
      if (connections > maxConnections) {
        maxConnections = connections
        centerNode = node
      }
    })
    
    return centerNode
  }

  /**
   * 添加到历史记录
   * @param {string} layoutType - 布局类型
   * @param {Object} result - 布局结果
   */
  addToHistory(layoutType, result) {
    this.state.layoutHistory.push({
      layoutType,
      timestamp: Date.now(),
      duration: result.duration || 0,
      success: result.success,
      nodeCount: this.graph.getNodes().length,
      edgeCount: this.graph.getEdges().length
    })
    
    // 保持历史记录在合理范围内
    if (this.state.layoutHistory.length > 50) {
      this.state.layoutHistory = this.state.layoutHistory.slice(-50)
    }
  }

  // ==================== 状态查询接口 ====================

  /**
   * 检查是否正在布局
   */
  isLayouting() {
    return this.state.isLayouting
  }

  /**
   * 检查自动布局是否启用
   */
  isAutoLayoutEnabled() {
    return this.state.autoLayoutEnabled
  }

  /**
   * 检查布局是否锁定
   */
  isLayoutLocked() {
    return this.state.layoutLocked
  }

  /**
   * 获取当前布局类型
   */
  getCurrentLayout() {
    return this.state.currentLayout
  }

  /**
   * 获取布局历史
   */
  getLayoutHistory() {
    return [...this.state.layoutHistory]
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    if (!this.layoutEngine) return null
    
    return this.layoutEngine.getPerformanceReport()
  }

  /**
   * 获取服务状态
   */
  getState() {
    return {
      ...this.state,
      initialized: this.initialized,
      hasGraph: !!this.graph,
      hasLayoutEngine: !!this.layoutEngine,
      hasLayoutUtils: !!this.layoutUtils
    }
  }

  // ==================== 事件系统 ====================

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[LayoutService] 事件处理器错误 (${event}):`, error)
        }
      })
    }
  }

  // ==================== 生命周期管理 ====================

  /**
   * 销毁服务
   */
  destroy() {
    try {
      // 清理定时器
      if (this.autoLayoutTimer) {
        clearTimeout(this.autoLayoutTimer)
        this.autoLayoutTimer = null
      }
      
      // 清理事件监听器
      this.listeners.clear()
      
      // 销毁布局引擎
      if (this.layoutEngine && this.layoutEngine.destroy) {
        this.layoutEngine.destroy()
      }
      
      // 重置状态
      this.graph = null
      this.layoutEngine = null
      this.layoutUtils = null
      this.initialized = false
      
      console.log('[LayoutService] 服务已销毁')
      
    } catch (error) {
      console.error('[LayoutService] 销毁服务时出错:', error)
    }
  }

  /**
   * 检查服务是否已初始化
   */
  isInitialized() {
    return this.initialized
  }
}

/**
 * 创建布局服务实例
 * @param {Object} graph - X6 图形实例
 * @param {Object} options - 配置选项
 * @returns {LayoutService} 布局服务实例
 */
export function createLayoutService(graph, options = {}) {
  const service = new LayoutService()
  if (graph) {
    service.initialize(graph, options)
  }
  return service
}

// 创建单例实例
export const layoutService = new LayoutService()

// 默认导出
export default LayoutService