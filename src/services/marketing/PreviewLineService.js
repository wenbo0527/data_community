/**
 * 预览线服务
 * 基于 usePreviewLine 和 PreviewLineStyleManager 提供统一的预览线管理接口
 * 负责预览线的显示、隐藏、样式管理和交互处理
 */

import { usePreviewLine } from '../../pages/marketing/tasks/composables/canvas/usePreviewLine.js'
import { PreviewLineStyleManager } from '../../pages/marketing/tasks/utils/canvas/PreviewLineStyleManager.js'

export class PreviewLineService {
  constructor() {
    this.graph = null
    this.previewLineHook = null
    this.styleManager = null
    this.initialized = false
    this.listeners = new Map()
    
    // 状态管理
    this.state = {
      isVisible: false,
      currentStyle: 'default',
      sourceNode: null,
      targetPosition: null,
      isConnecting: false,
      connectionMode: 'auto'
    }
    
    // 配置选项
    this.config = {
      defaultStyle: 'default',
      animationDuration: 200,
      snapDistance: 10,
      enableSnap: true,
      enableAnimation: true,
      styles: {
        default: {
          stroke: '#1890ff',
          strokeWidth: 2,
          strokeDasharray: '5,5'
        },
        success: {
          stroke: '#52c41a',
          strokeWidth: 2,
          strokeDasharray: '0'
        },
        error: {
          stroke: '#ff4d4f',
          strokeWidth: 2,
          strokeDasharray: '3,3'
        },
        warning: {
          stroke: '#faad14',
          strokeWidth: 2,
          strokeDasharray: '8,4'
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
      console.warn('[PreviewLineService] 服务已经初始化')
      return
    }

    try {
      this.graph = graph
      
      // 合并配置
      this.config = { ...this.config, ...options }
      
      // 初始化预览线钩子
      this.previewLineHook = usePreviewLine(graph)
      
      // 初始化样式管理器
      this.styleManager = new PreviewLineStyleManager(this.config.styles)
      
      // 绑定事件监听
      this.bindEvents()
      
      this.initialized = true
      console.log('[PreviewLineService] 预览线服务初始化完成')
      
      // 触发初始化完成事件
      this.emit('initialized', { service: this })
      
    } catch (error) {
      console.error('[PreviewLineService] 初始化失败:', error)
      throw new Error(`PreviewLineService 初始化失败: ${error.message}`)
    }
  }

  /**
   * 绑定事件监听
   */
  bindEvents() {
    if (!this.graph) return

    // 监听节点连接开始
    this.graph.on('node:mousedown', (args) => {
      if (this.isConnectionMode()) {
        this.startConnection(args.node, args.e)
      }
    })

    // 监听鼠标移动
    this.graph.on('blank:mousemove', (args) => {
      if (this.state.isConnecting) {
        this.updatePreviewLine(args.e.clientX, args.e.clientY)
      }
    })

    // 监听鼠标释放
    this.graph.on('blank:mouseup', (args) => {
      if (this.state.isConnecting) {
        this.endConnection(args.e)
      }
    })

    // 监听节点鼠标进入
    this.graph.on('node:mouseenter', (args) => {
      if (this.state.isConnecting) {
        this.highlightTargetNode(args.node, true)
      }
    })

    // 监听节点鼠标离开
    this.graph.on('node:mouseleave', (args) => {
      if (this.state.isConnecting) {
        this.highlightTargetNode(args.node, false)
      }
    })
  }

  // ==================== 预览线显示控制 ====================

  /**
   * 显示预览线
   * @param {Object} sourceNode - 源节点
   * @param {Object} startPosition - 起始位置
   * @param {Object} options - 显示选项
   */
  showPreviewLine(sourceNode, startPosition, options = {}) {
    if (!this.graph || !this.previewLineHook) {
      throw new Error('PreviewLineService 未初始化')
    }

    try {
      const config = { ...this.config, ...options }
      
      // 更新状态
      this.state.isVisible = true
      this.state.sourceNode = sourceNode
      this.state.currentStyle = config.style || this.config.defaultStyle
      
      // 调用预览线钩子显示方法
      if (this.previewLineHook.show) {
        this.previewLineHook.show(sourceNode, startPosition, config)
      }
      
      // 应用样式
      this.applyStyle(this.state.currentStyle)
      
      this.emit('preview-line-shown', {
        sourceNode,
        startPosition,
        style: this.state.currentStyle
      })
      
    } catch (error) {
      console.error('[PreviewLineService] 显示预览线失败:', error)
      throw error
    }
  }

  /**
   * 隐藏预览线
   * @param {Object} options - 隐藏选项
   */
  hidePreviewLine(options = {}) {
    if (!this.previewLineHook) {
      return
    }

    try {
      // 调用预览线钩子隐藏方法
      if (this.previewLineHook.hide) {
        this.previewLineHook.hide(options)
      }
      
      // 重置状态
      this.state.isVisible = false
      this.state.sourceNode = null
      this.state.targetPosition = null
      this.state.isConnecting = false
      
      this.emit('preview-line-hidden', { options })
      
    } catch (error) {
      console.error('[PreviewLineService] 隐藏预览线失败:', error)
    }
  }

  /**
   * 更新预览线位置
   * @param {number} x - 目标X坐标
   * @param {number} y - 目标Y坐标
   * @param {Object} options - 更新选项
   */
  updatePreviewLine(x, y, options = {}) {
    if (!this.state.isVisible || !this.previewLineHook) {
      return
    }

    try {
      // 转换屏幕坐标到画布坐标
      const canvasPosition = this.screenToCanvas(x, y)
      
      // 检查是否需要吸附
      let targetPosition = canvasPosition
      if (this.config.enableSnap) {
        const snapResult = this.findSnapTarget(canvasPosition)
        if (snapResult) {
          targetPosition = snapResult.position
          this.highlightSnapTarget(snapResult.target, true)
        }
      }
      
      // 更新预览线位置
      if (this.previewLineHook.update) {
        this.previewLineHook.update(targetPosition, options)
      }
      
      this.state.targetPosition = targetPosition
      
      this.emit('preview-line-updated', {
        position: targetPosition,
        screenPosition: { x, y },
        options
      })
      
    } catch (error) {
      console.error('[PreviewLineService] 更新预览线失败:', error)
    }
  }

  // ==================== 连接模式管理 ====================

  /**
   * 开始连接模式
   * @param {Object} sourceNode - 源节点
   * @param {Event} event - 鼠标事件
   */
  startConnection(sourceNode, event) {
    if (!sourceNode) {
      console.warn('[PreviewLineService] 源节点不能为空')
      return
    }

    try {
      // 获取起始位置
      const startPosition = this.getNodeConnectionPoint(sourceNode, event)
      
      // 显示预览线
      this.showPreviewLine(sourceNode, startPosition, {
        style: 'default'
      })
      
      // 更新状态
      this.state.isConnecting = true
      this.state.connectionMode = 'manual'
      
      // 设置画布为连接模式
      this.graph.container.style.cursor = 'crosshair'
      
      this.emit('connection-started', {
        sourceNode,
        startPosition,
        event
      })
      
    } catch (error) {
      console.error('[PreviewLineService] 开始连接失败:', error)
    }
  }

  /**
   * 结束连接模式
   * @param {Event} event - 鼠标事件
   */
  endConnection(event) {
    if (!this.state.isConnecting) {
      return
    }

    try {
      const canvasPosition = this.screenToCanvas(event.clientX, event.clientY)
      
      // 查找目标节点
      const targetNode = this.findTargetNodeAt(canvasPosition)
      
      let connectionResult = null
      if (targetNode && targetNode !== this.state.sourceNode) {
        // 尝试创建连接
        connectionResult = this.createConnection(this.state.sourceNode, targetNode)
      }
      
      // 隐藏预览线
      this.hidePreviewLine()
      
      // 重置画布样式
      this.graph.container.style.cursor = 'default'
      
      this.emit('connection-ended', {
        sourceNode: this.state.sourceNode,
        targetNode,
        connectionResult,
        event
      })
      
    } catch (error) {
      console.error('[PreviewLineService] 结束连接失败:', error)
      this.hidePreviewLine()
      this.graph.container.style.cursor = 'default'
    }
  }

  /**
   * 创建连接
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   */
  createConnection(sourceNode, targetNode) {
    if (!sourceNode || !targetNode) {
      return null
    }

    try {
      // 检查连接是否有效
      if (!this.isValidConnection(sourceNode, targetNode)) {
        this.showConnectionError('无效的连接')
        return null
      }
      
      // 创建边
      const edge = this.graph.addEdge({
        source: sourceNode.id,
        target: targetNode.id,
        attrs: {
          line: {
            stroke: '#1890ff',
            strokeWidth: 2
          }
        }
      })
      
      this.emit('connection-created', {
        sourceNode,
        targetNode,
        edge
      })
      
      return edge
      
    } catch (error) {
      console.error('[PreviewLineService] 创建连接失败:', error)
      this.showConnectionError('连接创建失败')
      return null
    }
  }

  // ==================== 样式管理 ====================

  /**
   * 应用预览线样式
   * @param {string} styleName - 样式名称
   */
  applyStyle(styleName) {
    if (!this.styleManager || !this.state.isVisible) {
      return
    }

    try {
      const style = this.config.styles[styleName] || this.config.styles.default
      
      if (this.styleManager.applyStyle) {
        this.styleManager.applyStyle(styleName, style)
      }
      
      this.state.currentStyle = styleName
      
      this.emit('style-applied', { styleName, style })
      
    } catch (error) {
      console.error('[PreviewLineService] 应用样式失败:', error)
    }
  }

  /**
   * 设置预览线样式
   * @param {string} styleName - 样式名称
   * @param {Object} styleConfig - 样式配置
   */
  setStyle(styleName, styleConfig) {
    this.config.styles[styleName] = { ...styleConfig }
    
    if (this.styleManager && this.styleManager.setStyle) {
      this.styleManager.setStyle(styleName, styleConfig)
    }
    
    // 如果当前正在使用这个样式，立即应用
    if (this.state.currentStyle === styleName && this.state.isVisible) {
      this.applyStyle(styleName)
    }
    
    this.emit('style-set', { styleName, styleConfig })
  }

  /**
   * 获取样式配置
   * @param {string} styleName - 样式名称
   */
  getStyle(styleName) {
    return this.config.styles[styleName] || null
  }

  // ==================== 辅助方法 ====================

  /**
   * 屏幕坐标转画布坐标
   * @param {number} x - 屏幕X坐标
   * @param {number} y - 屏幕Y坐标
   */
  screenToCanvas(x, y) {
    if (!this.graph) return { x, y }
    
    try {
      return this.graph.clientToLocal(x, y)
    } catch (error) {
      console.error('[PreviewLineService] 坐标转换失败:', error)
      return { x, y }
    }
  }

  /**
   * 获取节点连接点
   * @param {Object} node - 节点对象
   * @param {Event} event - 鼠标事件
   */
  getNodeConnectionPoint(node, event) {
    if (!node) return { x: 0, y: 0 }
    
    try {
      const bbox = node.getBBox()
      
      // 如果有事件，使用鼠标位置计算最近的连接点
      if (event) {
        const canvasPos = this.screenToCanvas(event.clientX, event.clientY)
        
        // 计算节点边界上最近的点
        const centerX = bbox.x + bbox.width / 2
        const centerY = bbox.y + bbox.height / 2
        
        // 简化计算，返回节点中心点
        return { x: centerX, y: centerY }
      }
      
      // 默认返回节点中心点
      return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2
      }
      
    } catch (error) {
      console.error('[PreviewLineService] 获取连接点失败:', error)
      return { x: 0, y: 0 }
    }
  }

  /**
   * 查找指定位置的目标节点
   * @param {Object} position - 位置坐标
   */
  findTargetNodeAt(position) {
    if (!this.graph) return null
    
    try {
      const elements = this.graph.getNodesFromPoint(position.x, position.y)
      return elements.length > 0 ? elements[0] : null
    } catch (error) {
      console.error('[PreviewLineService] 查找目标节点失败:', error)
      return null
    }
  }

  /**
   * 查找吸附目标
   * @param {Object} position - 当前位置
   */
  findSnapTarget(position) {
    if (!this.config.enableSnap) return null
    
    try {
      const nodes = this.graph.getNodes()
      const snapDistance = this.config.snapDistance
      
      for (const node of nodes) {
        if (node === this.state.sourceNode) continue
        
        const bbox = node.getBBox()
        const centerX = bbox.x + bbox.width / 2
        const centerY = bbox.y + bbox.height / 2
        
        const distance = Math.sqrt(
          Math.pow(position.x - centerX, 2) + 
          Math.pow(position.y - centerY, 2)
        )
        
        if (distance <= snapDistance) {
          return {
            target: node,
            position: { x: centerX, y: centerY },
            distance
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('[PreviewLineService] 查找吸附目标失败:', error)
      return null
    }
  }

  /**
   * 高亮目标节点
   * @param {Object} node - 目标节点
   * @param {boolean} highlight - 是否高亮
   */
  highlightTargetNode(node, highlight) {
    if (!node) return
    
    try {
      if (highlight) {
        node.attr('body/stroke', '#52c41a')
        node.attr('body/strokeWidth', 3)
      } else {
        node.attr('body/stroke', '#d9d9d9')
        node.attr('body/strokeWidth', 1)
      }
    } catch (error) {
      console.error('[PreviewLineService] 高亮节点失败:', error)
    }
  }

  /**
   * 高亮吸附目标
   * @param {Object} target - 吸附目标
   * @param {boolean} highlight - 是否高亮
   */
  highlightSnapTarget(target, highlight) {
    if (!target) return
    
    try {
      if (highlight) {
        target.attr('body/stroke', '#faad14')
        target.attr('body/strokeWidth', 2)
        target.attr('body/strokeDasharray', '3,3')
      } else {
        target.attr('body/stroke', '#d9d9d9')
        target.attr('body/strokeWidth', 1)
        target.attr('body/strokeDasharray', '0')
      }
    } catch (error) {
      console.error('[PreviewLineService] 高亮吸附目标失败:', error)
    }
  }

  /**
   * 检查连接是否有效
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   */
  isValidConnection(sourceNode, targetNode) {
    if (!sourceNode || !targetNode) return false
    if (sourceNode === targetNode) return false
    
    // 检查是否已存在连接
    const existingEdges = this.graph.getEdges()
    const hasConnection = existingEdges.some(edge => {
      const source = edge.getSourceNode()
      const target = edge.getTargetNode()
      return (source === sourceNode && target === targetNode) ||
             (source === targetNode && target === sourceNode)
    })
    
    return !hasConnection
  }

  /**
   * 显示连接错误
   * @param {string} message - 错误消息
   */
  showConnectionError(message) {
    console.warn('[PreviewLineService] 连接错误:', message)
    
    // 临时显示错误样式
    if (this.state.isVisible) {
      this.applyStyle('error')
      
      setTimeout(() => {
        if (this.state.isVisible) {
          this.applyStyle('default')
        }
      }, 1000)
    }
    
    this.emit('connection-error', { message })
  }

  // ==================== 状态查询 ====================

  /**
   * 检查是否处于连接模式
   */
  isConnectionMode() {
    return this.state.connectionMode === 'manual'
  }

  /**
   * 检查预览线是否可见
   */
  isVisible() {
    return this.state.isVisible
  }

  /**
   * 检查是否正在连接
   */
  isConnecting() {
    return this.state.isConnecting
  }

  /**
   * 获取当前状态
   */
  getState() {
    return {
      ...this.state,
      initialized: this.initialized,
      hasGraph: !!this.graph,
      hasPreviewLineHook: !!this.previewLineHook,
      hasStyleManager: !!this.styleManager
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
          console.error(`[PreviewLineService] 事件处理器错误 (${event}):`, error)
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
      // 隐藏预览线
      this.hidePreviewLine()
      
      // 清理事件监听器
      this.listeners.clear()
      
      // 销毁样式管理器
      if (this.styleManager && this.styleManager.destroy) {
        this.styleManager.destroy()
      }
      
      // 重置状态
      this.graph = null
      this.previewLineHook = null
      this.styleManager = null
      this.initialized = false
      
      console.log('[PreviewLineService] 服务已销毁')
      
    } catch (error) {
      console.error('[PreviewLineService] 销毁服务时出错:', error)
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
 * 创建预览线服务实例
 * @param {Object} graph - X6 图形实例
 * @param {Object} options - 配置选项
 * @returns {PreviewLineService} 预览线服务实例
 */
export function createPreviewLineService(graph, options = {}) {
  const service = new PreviewLineService()
  if (graph) {
    service.initialize(graph, options)
  }
  return service
}

// 创建单例实例
export const previewLineService = new PreviewLineService()

// 默认导出
export default PreviewLineService