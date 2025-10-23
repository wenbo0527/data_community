/**
 * 预览线服务 - 统一接口规范
 * 负责管理画布中的预览线功能，包括创建、验证、清理、转换等操作
 * 
 * 标准化接口规范：
 * - 统一的服务响应格式 (ServiceResponse)
 * - 标准化的错误处理机制
 * - 一致的参数验证
 * - 事件驱动的架构
 */

import { EventBus } from '../utils/EventBus.js'

// 统一服务响应格式
const ServiceResponse = {
  success: (data = null, message = '') => ({
    success: true,
    data,
    message,
    timestamp: Date.now()
  }),
  
  error: (message = '', code = 'UNKNOWN_ERROR', details = null) => ({
    success: false,
    error: {
      message,
      code,
      details,
      timestamp: Date.now()
    }
  })
}

/**
 * 预览线服务类
 */
export class PreviewLineService {
  constructor(graph, eventBus = null) {
    this.graph = graph
    this.eventBus = eventBus || new EventBus()
    this.state = {
      enabled: true,
      initialized: false,
      previewLines: new Map(), // 存储预览线实例
      activePreviewLine: null,
      config: {
        strokeWidth: 2,
        strokeDasharray: '5,5',
        stroke: '#1890ff',
        opacity: 0.8,
        zIndex: 1000
      }
    }
    
    // 事件监听器清理函数
    this.eventUnsubscribers = []
    
    console.log('✅ [PreviewLineService] 服务实例已创建')
  }

  /**
   * 初始化服务
   */
  initialize() {
    if (this.state.initialized) {
      return ServiceResponse.success(null, '预览线服务已初始化')
    }

    try {
      if (!this.graph) {
        return ServiceResponse.error('图形实例不存在', 'GRAPH_NOT_FOUND')
      }

      // 绑定图形事件
      this.bindGraphEvents()
      
      // 初始化预览线样式
      this.initializeStyles()
      
      this.state.initialized = true
      
      // 触发初始化完成事件
      this.eventBus.emit('previewLine:initialized', {
        serviceId: this.constructor.name,
        timestamp: Date.now()
      })
      
      console.log('✅ [PreviewLineService] 服务初始化完成')
      return ServiceResponse.success(null, '预览线服务初始化成功')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 初始化失败:', error)
      return ServiceResponse.error(`初始化失败: ${error.message}`, 'INIT_ERROR', error)
    }
  }

  /**
   * 绑定图形事件
   */
  bindGraphEvents() {
    if (!this.graph) return

    try {
      // 监听节点拖拽事件
      const onNodeDrag = (args) => {
        this.handleNodeDrag(args)
      }
      
      const onNodeDragEnd = (args) => {
        this.handleNodeDragEnd(args)
      }
      
      // 监听连接事件
      const onEdgeConnected = (args) => {
        this.handleEdgeConnected(args)
      }
      
      // 监听鼠标移动事件
      const onMouseMove = (args) => {
        this.handleMouseMove(args)
      }

      // 绑定事件
      this.graph.on('node:drag', onNodeDrag)
      this.graph.on('node:dragend', onNodeDragEnd)
      this.graph.on('edge:connected', onEdgeConnected)
      this.graph.on('blank:mousemove', onMouseMove)
      
      // 保存清理函数
      this.eventUnsubscribers.push(
        () => this.graph.off('node:drag', onNodeDrag),
        () => this.graph.off('node:dragend', onNodeDragEnd),
        () => this.graph.off('edge:connected', onEdgeConnected),
        () => this.graph.off('blank:mousemove', onMouseMove)
      )
      
      console.log('✅ [PreviewLineService] 图形事件绑定完成')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 事件绑定失败:', error)
      throw error
    }
  }

  /**
   * 初始化预览线样式
   */
  initializeStyles() {
    try {
      // 注册预览线样式
      if (this.graph && this.graph.addEdge) {
        // 预览线样式配置已准备就绪
        console.log('✅ [PreviewLineService] 预览线样式初始化完成')
      }
    } catch (error) {
      console.error('❌ [PreviewLineService] 样式初始化失败:', error)
      throw error
    }
  }

  /**
   * 创建预览线
   */
  createPreviewLine(sourceNode, targetPosition, options = {}) {
    if (!this.state.enabled || !this.state.initialized) {
      return ServiceResponse.error('预览线服务未启用或未初始化', 'SERVICE_DISABLED')
    }

    try {
      // 参数验证
      const validation = this.validatePreviewLineParams(sourceNode, targetPosition)
      if (!validation.success) {
        return validation
      }

      // 清理现有预览线
      this.clearActivePreviewLine()

      // 计算预览线路径
      const path = this.calculatePreviewPath(sourceNode, targetPosition, options)
      
      // 创建预览线元素
      const previewLineId = `preview-line-${Date.now()}`
      const previewLine = this.createPreviewLineElement(previewLineId, path, options)
      
      if (previewLine) {
        // 存储预览线
        this.state.previewLines.set(previewLineId, previewLine)
        this.state.activePreviewLine = previewLineId
        
        // 触发创建事件
        this.eventBus.emit('previewLine:created', {
          id: previewLineId,
          sourceNode: sourceNode.id,
          targetPosition,
          timestamp: Date.now()
        })
        
        console.log('✅ [PreviewLineService] 预览线创建成功:', previewLineId)
        return ServiceResponse.success({ id: previewLineId, element: previewLine }, '预览线创建成功')
      }
      
      return ServiceResponse.error('预览线元素创建失败', 'ELEMENT_CREATION_FAILED')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 创建预览线失败:', error)
      return ServiceResponse.error(`创建预览线失败: ${error.message}`, 'CREATE_ERROR', error)
    }
  }

  /**
   * 更新预览线
   */
  updatePreviewLine(previewLineId, targetPosition, options = {}) {
    if (!this.state.enabled || !this.state.initialized) {
      return ServiceResponse.error('预览线服务未启用或未初始化', 'SERVICE_DISABLED')
    }

    try {
      const previewLine = this.state.previewLines.get(previewLineId)
      if (!previewLine) {
        return ServiceResponse.error('预览线不存在', 'PREVIEW_LINE_NOT_FOUND')
      }

      // 更新预览线路径
      const path = this.calculatePreviewPath(previewLine.sourceNode, targetPosition, options)
      this.updatePreviewLineElement(previewLine, path, options)
      
      // 触发更新事件
      this.eventBus.emit('previewLine:updated', {
        id: previewLineId,
        targetPosition,
        timestamp: Date.now()
      })
      
      return ServiceResponse.success(null, '预览线更新成功')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 更新预览线失败:', error)
      return ServiceResponse.error(`更新预览线失败: ${error.message}`, 'UPDATE_ERROR', error)
    }
  }

  /**
   * 清理预览线
   */
  clearPreviewLine(previewLineId) {
    try {
      const previewLine = this.state.previewLines.get(previewLineId)
      if (!previewLine) {
        return ServiceResponse.error('预览线不存在', 'PREVIEW_LINE_NOT_FOUND')
      }

      // 移除预览线元素
      this.removePreviewLineElement(previewLine)
      
      // 从存储中移除
      this.state.previewLines.delete(previewLineId)
      
      // 如果是当前活动预览线，清空引用
      if (this.state.activePreviewLine === previewLineId) {
        this.state.activePreviewLine = null
      }
      
      // 触发清理事件
      this.eventBus.emit('previewLine:cleared', {
        id: previewLineId,
        timestamp: Date.now()
      })
      
      console.log('✅ [PreviewLineService] 预览线清理成功:', previewLineId)
      return ServiceResponse.success(null, '预览线清理成功')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 清理预览线失败:', error)
      return ServiceResponse.error(`清理预览线失败: ${error.message}`, 'CLEAR_ERROR', error)
    }
  }

  /**
   * 清理所有预览线
   */
  clearAllPreviewLines() {
    try {
      const clearedCount = this.state.previewLines.size
      
      // 清理所有预览线
      for (const [id, previewLine] of this.state.previewLines) {
        this.removePreviewLineElement(previewLine)
      }
      
      // 清空存储
      this.state.previewLines.clear()
      this.state.activePreviewLine = null
      
      // 触发清理事件
      this.eventBus.emit('previewLine:allCleared', {
        clearedCount,
        timestamp: Date.now()
      })
      
      console.log(`✅ [PreviewLineService] 已清理 ${clearedCount} 条预览线`)
      return ServiceResponse.success({ clearedCount }, `已清理 ${clearedCount} 条预览线`)
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 清理所有预览线失败:', error)
      return ServiceResponse.error(`清理所有预览线失败: ${error.message}`, 'CLEAR_ALL_ERROR', error)
    }
  }

  /**
   * 转换预览线为正式连接
   */
  convertToConnection(previewLineId, targetNode, options = {}) {
    if (!this.state.enabled || !this.state.initialized) {
      return ServiceResponse.error('预览线服务未启用或未初始化', 'SERVICE_DISABLED')
    }

    try {
      const previewLine = this.state.previewLines.get(previewLineId)
      if (!previewLine) {
        return ServiceResponse.error('预览线不存在', 'PREVIEW_LINE_NOT_FOUND')
      }

      // 验证目标节点
      if (!targetNode || !targetNode.id) {
        return ServiceResponse.error('目标节点无效', 'INVALID_TARGET_NODE')
      }

      // 创建连接数据
      const connectionData = {
        id: `connection-${Date.now()}`,
        source: previewLine.sourceNode.id,
        target: targetNode.id,
        sourcePort: options.sourcePort || 'out',
        targetPort: options.targetPort || 'in',
        ...options
      }

      // 清理预览线
      this.clearPreviewLine(previewLineId)
      
      // 触发转换事件
      this.eventBus.emit('previewLine:converted', {
        previewLineId,
        connectionData,
        timestamp: Date.now()
      })
      
      console.log('✅ [PreviewLineService] 预览线转换成功:', connectionData.id)
      return ServiceResponse.success(connectionData, '预览线转换为连接成功')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 转换预览线失败:', error)
      return ServiceResponse.error(`转换预览线失败: ${error.message}`, 'CONVERT_ERROR', error)
    }
  }

  /**
   * 获取预览线信息
   */
  getPreviewLineInfo(previewLineId) {
    try {
      const previewLine = this.state.previewLines.get(previewLineId)
      if (!previewLine) {
        return ServiceResponse.error('预览线不存在', 'PREVIEW_LINE_NOT_FOUND')
      }

      const info = {
        id: previewLineId,
        sourceNode: previewLine.sourceNode,
        targetPosition: previewLine.targetPosition,
        isActive: this.state.activePreviewLine === previewLineId,
        createdAt: previewLine.createdAt,
        config: previewLine.config
      }
      
      return ServiceResponse.success(info, '获取预览线信息成功')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 获取预览线信息失败:', error)
      return ServiceResponse.error(`获取预览线信息失败: ${error.message}`, 'GET_INFO_ERROR', error)
    }
  }

  /**
   * 获取所有预览线
   */
  getAllPreviewLines() {
    try {
      const previewLines = Array.from(this.state.previewLines.entries()).map(([id, previewLine]) => ({
        id,
        sourceNode: previewLine.sourceNode,
        targetPosition: previewLine.targetPosition,
        isActive: this.state.activePreviewLine === id,
        createdAt: previewLine.createdAt
      }))
      
      return ServiceResponse.success(previewLines, '获取所有预览线成功')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 获取所有预览线失败:', error)
      return ServiceResponse.error(`获取所有预览线失败: ${error.message}`, 'GET_ALL_ERROR', error)
    }
  }

  /**
   * 启用/禁用服务
   */
  setEnabled(enabled) {
    try {
      const wasEnabled = this.state.enabled
      this.state.enabled = Boolean(enabled)
      
      if (!enabled && wasEnabled) {
        // 禁用时清理所有预览线
        this.clearAllPreviewLines()
      }
      
      // 触发状态变更事件
      this.eventBus.emit('previewLine:enabledChanged', {
        enabled: this.state.enabled,
        previousState: wasEnabled,
        timestamp: Date.now()
      })
      
      console.log(`✅ [PreviewLineService] 服务${enabled ? '启用' : '禁用'}`)
      return ServiceResponse.success({ enabled: this.state.enabled }, `服务${enabled ? '启用' : '禁用'}成功`)
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 设置服务状态失败:', error)
      return ServiceResponse.error(`设置服务状态失败: ${error.message}`, 'SET_ENABLED_ERROR', error)
    }
  }

  /**
   * 获取服务状态
   */
  getServiceStatus() {
    try {
      const status = {
        enabled: this.state.enabled,
        initialized: this.state.initialized,
        previewLineCount: this.state.previewLines.size,
        activePreviewLine: this.state.activePreviewLine,
        config: { ...this.state.config }
      }
      
      return ServiceResponse.success(status, '获取服务状态成功')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 获取服务状态失败:', error)
      return ServiceResponse.error(`获取服务状态失败: ${error.message}`, 'GET_STATUS_ERROR', error)
    }
  }

  /**
   * 销毁服务
   */
  destroy() {
    try {
      // 清理所有预览线
      this.clearAllPreviewLines()
      
      // 清理事件监听器
      this.eventUnsubscribers.forEach(unsubscribe => {
        try {
          unsubscribe()
        } catch (error) {
          console.warn('[PreviewLineService] 清理事件监听器失败:', error)
        }
      })
      this.eventUnsubscribers = []
      
      // 重置状态
      this.state.initialized = false
      this.state.enabled = false
      this.graph = null
      
      // 触发销毁事件
      this.eventBus.emit('previewLine:destroyed', {
        timestamp: Date.now()
      })
      
      console.log('✅ [PreviewLineService] 服务已销毁')
      return ServiceResponse.success(null, '预览线服务销毁成功')
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 销毁服务失败:', error)
      return ServiceResponse.error(`销毁服务失败: ${error.message}`, 'DESTROY_ERROR', error)
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 验证预览线参数
   */
  validatePreviewLineParams(sourceNode, targetPosition) {
    if (!sourceNode || !sourceNode.id) {
      return ServiceResponse.error('源节点无效', 'INVALID_SOURCE_NODE')
    }

    if (!targetPosition || typeof targetPosition.x !== 'number' || typeof targetPosition.y !== 'number') {
      return ServiceResponse.error('目标位置无效', 'INVALID_TARGET_POSITION')
    }

    return ServiceResponse.success(null, '参数验证通过')
  }

  /**
   * 计算预览线路径
   */
  calculatePreviewPath(sourceNode, targetPosition, options = {}) {
    try {
      // 获取源节点位置
      const sourcePosition = sourceNode.position || { x: 0, y: 0 }
      const sourceSize = sourceNode.size || { width: 100, height: 60 }
      
      // 计算连接点
      const sourcePoint = {
        x: sourcePosition.x + sourceSize.width / 2,
        y: sourcePosition.y + sourceSize.height
      }
      
      const targetPoint = {
        x: targetPosition.x,
        y: targetPosition.y
      }
      
      // 生成路径字符串
      const path = `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`
      
      return path
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 计算预览线路径失败:', error)
      return `M 0 0 L 0 0` // 默认路径
    }
  }

  /**
   * 创建预览线元素
   */
  createPreviewLineElement(id, path, options = {}) {
    try {
      // 这里应该根据具体的图形库实现创建预览线元素
      // 由于使用的是 X6，这里提供一个通用的实现框架
      
      const config = {
        ...this.state.config,
        ...options
      }
      
      // 模拟创建预览线元素
      const element = {
        id,
        type: 'preview-line',
        path,
        config,
        sourceNode: options.sourceNode,
        targetPosition: options.targetPosition,
        createdAt: Date.now()
      }
      
      console.log('✅ [PreviewLineService] 预览线元素创建成功:', id)
      return element
      
    } catch (error) {
      console.error('❌ [PreviewLineService] 创建预览线元素失败:', error)
      return null
    }
  }

  /**
   * 更新预览线元素
   */
  updatePreviewLineElement(previewLine, path, options = {}) {
    try {
      if (previewLine) {
        previewLine.path = path
        previewLine.config = { ...previewLine.config, ...options }
        previewLine.updatedAt = Date.now()
      }
    } catch (error) {
      console.error('❌ [PreviewLineService] 更新预览线元素失败:', error)
    }
  }

  /**
   * 移除预览线元素
   */
  removePreviewLineElement(previewLine) {
    try {
      if (previewLine && previewLine.id) {
        // 这里应该根据具体的图形库实现移除预览线元素
        console.log('✅ [PreviewLineService] 预览线元素已移除:', previewLine.id)
      }
    } catch (error) {
      console.error('❌ [PreviewLineService] 移除预览线元素失败:', error)
    }
  }

  /**
   * 清理当前活动预览线
   */
  clearActivePreviewLine() {
    if (this.state.activePreviewLine) {
      this.clearPreviewLine(this.state.activePreviewLine)
    }
  }

  /**
   * 处理节点拖拽事件
   */
  handleNodeDrag(args) {
    try {
      // 实现节点拖拽时的预览线逻辑
      console.log('[PreviewLineService] 处理节点拖拽:', args)
    } catch (error) {
      console.error('❌ [PreviewLineService] 处理节点拖拽失败:', error)
    }
  }

  /**
   * 处理节点拖拽结束事件
   */
  handleNodeDragEnd(args) {
    try {
      // 实现节点拖拽结束时的预览线逻辑
      console.log('[PreviewLineService] 处理节点拖拽结束:', args)
      this.clearActivePreviewLine()
    } catch (error) {
      console.error('❌ [PreviewLineService] 处理节点拖拽结束失败:', error)
    }
  }

  /**
   * 处理连接事件
   */
  handleEdgeConnected(args) {
    try {
      // 实现连接完成时的预览线逻辑
      console.log('[PreviewLineService] 处理连接事件:', args)
      this.clearActivePreviewLine()
    } catch (error) {
      console.error('❌ [PreviewLineService] 处理连接事件失败:', error)
    }
  }

  /**
   * 处理鼠标移动事件
   */
  handleMouseMove(args) {
    try {
      // 实现鼠标移动时的预览线逻辑
      if (this.state.activePreviewLine && args.x !== undefined && args.y !== undefined) {
        this.updatePreviewLine(this.state.activePreviewLine, { x: args.x, y: args.y })
      }
    } catch (error) {
      console.error('❌ [PreviewLineService] 处理鼠标移动失败:', error)
    }
  }
}

/**
 * 创建预览线服务实例
 */
export const createPreviewLineService = (graph, eventBus = null) => {
  return new PreviewLineService(graph, eventBus)
}

/**
 * 预览线服务工具函数
 */
export const PreviewLineServiceUtils = {
  /**
   * 验证预览线服务实例
   */
  isValidService: (service) => {
    return service instanceof PreviewLineService && service.state.initialized
  },

  /**
   * 获取预览线服务状态摘要
   */
  getServiceSummary: (service) => {
    if (!PreviewLineServiceUtils.isValidService(service)) {
      return { valid: false, message: '无效的预览线服务实例' }
    }

    const status = service.getServiceStatus()
    return {
      valid: true,
      enabled: status.data.enabled,
      previewLineCount: status.data.previewLineCount,
      hasActivePreviewLine: !!status.data.activePreviewLine
    }
  },

  /**
   * 批量清理预览线
   */
  batchClearPreviewLines: (service, previewLineIds) => {
    if (!PreviewLineServiceUtils.isValidService(service)) {
      return ServiceResponse.error('无效的预览线服务实例', 'INVALID_SERVICE')
    }

    const results = []
    for (const id of previewLineIds) {
      const result = service.clearPreviewLine(id)
      results.push({ id, result })
    }

    return ServiceResponse.success(results, '批量清理预览线完成')
  }
}

export default PreviewLineService