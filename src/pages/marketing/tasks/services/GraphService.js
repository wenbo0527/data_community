/**
 * 图形管理服务
 * 提供统一的图形操作接口，包括节点和连接线的CRUD操作
 * 基于X6图实例进行封装，提供标准化的服务接口
 */

// 🔧 修复：添加ES6 import导入，消除require降级逻辑
import { createNodeConfig } from '../composables/canvas/useCanvasNodes.js'
import { getNodeConfig, getNodeAttrs } from '../../../../utils/nodeTypes.js'

/**
 * 图形操作类型枚举
 */
export const GraphOperationType = {
  NODE_ADD: 'node:add',
  NODE_UPDATE: 'node:update',
  NODE_DELETE: 'node:delete',
  NODE_MOVE: 'node:move',
  EDGE_ADD: 'edge:add',
  EDGE_UPDATE: 'edge:update',
  EDGE_DELETE: 'edge:delete',
  CANVAS_CLEAR: 'canvas:clear',
  CANVAS_RESET: 'canvas:reset',
  GRAPH_CLEAR: 'graph:clear'
}

/**
 * 图形管理服务类
 */
export class GraphService {
  constructor(graph) {
    this.graph = graph
    this.isEnabled = true
    this.operationHistory = []
    this.maxHistorySize = 50
    
    // 服务状态
    this.state = {
      initialized: false,
      nodeCount: 0,
      edgeCount: 0,
      lastOperation: null,
      operationCount: 0
    }
    
    // 事件监听器
    this.eventListeners = new Map()
    
    // 操作配置
    this.config = {
      enableHistory: true,
      enableValidation: true,
      enableEvents: true,
      autoSave: false
    }
  }

  // ==================== 服务生命周期 ====================

  /**
   * 初始化服务
   */
  initialize(graph) {
    try {
      // 如果传入了新的图实例，使用新实例
      if (graph) {
        this.graph = graph
      }
      
      if (!this.graph) {
        throw new Error('图实例不存在')
      }
      
      this.setupEventListeners()
      this.updateState()
      this.state.initialized = true
      
      console.log('[GraphService] 服务初始化完成')
      this.emit('service:initialized')
      
    } catch (error) {
      console.error('[GraphService] 服务初始化失败:', error)
      throw error
    }
  }

  /**
   * 销毁服务
   */
  destroy() {
    try {
      this.removeEventListeners()
      this.eventListeners.clear()
      this.operationHistory = []
      this.state.initialized = false
      this.isEnabled = false
      
      console.log('[GraphService] 服务已销毁')
    } catch (error) {
      console.error('[GraphService] 销毁服务失败:', error)
    }
  }

  /**
   * 释放资源 (dispose 方法别名)
   */
  dispose() {
    this.destroy()
  }

  // ==================== 节点操作接口 ====================

  /**
   * 添加节点
   * @param {Object} nodeData - 节点数据
   * @returns {Promise<Object>} - 添加结果
   */
  async addNode(nodeData) {
    try {
      // 先进行基本类型检查
      if (typeof nodeData !== 'object' || nodeData === null || Array.isArray(nodeData)) {
        throw new Error('节点数据必须是对象类型')
      }
      
      // 数据预处理和验证
      const processedNodeData = this.preprocessNodeData(nodeData)
      this.validateOperation('addNode', processedNodeData)
      
      const node = this.graph.addNode(processedNodeData)
      
      this.recordOperation(GraphOperationType.NODE_ADD, {
        nodeId: node.id,
        nodeData: processedNodeData
      })
      
      this.updateState()
      this.emit('node:added', { node, nodeData: processedNodeData })
      
      return {
        success: true,
        node: node,
        nodeId: node.id
      }
      
    } catch (error) {
      // 增强错误处理，提供更详细的错误信息
      const enhancedError = this.enhanceError(error, 'addNode', nodeData)
      console.error('[GraphService] 添加节点失败:', enhancedError)
      this.emit('node:add:error', { nodeData, error: enhancedError })
      throw enhancedError
    }
  }

  /**
   * 预处理节点数据
   * @param {Object} nodeData - 原始节点数据
   * @returns {Object} - 处理后的节点数据
   */
  preprocessNodeData(nodeData) {
    // 如果数据为空，返回默认结构
    if (!nodeData) {
      throw new Error('节点数据不能为空')
    }
    
    // 🔧 修复：消除智能降级逻辑，实现单一功能实现
    // 直接使用ES6 import导入的createNodeConfig函数，不再使用回退逻辑
    const nodeConfig = createNodeConfig(nodeData)
    console.log('[GraphService] 使用createNodeConfig创建的节点配置:', nodeConfig)
    
    return nodeConfig
  }

  /**
   * 增强错误信息
   * @param {Error} error - 原始错误
   * @param {string} operation - 操作名称
   * @param {*} data - 相关数据
   * @returns {Error} - 增强后的错误
   */
  enhanceError(error, operation, data) {
    const enhancedError = new Error(error.message)
    enhancedError.operation = operation
    enhancedError.originalError = error
    enhancedError.timestamp = new Date().toISOString()
    
    // 提供更详细的调试信息
    enhancedError.debugInfo = {
      operation,
      dataType: typeof data,
      dataValue: this.safeStringify(data),
      isArray: Array.isArray(data),
      hasGraph: !!this.graph,
      isEnabled: this.isEnabled,
      configEnabled: this.config.enableValidation,
      // 针对节点数据的特殊调试信息
      ...(operation === 'addNode' && typeof data === 'object' && data !== null && {
        nodeDataKeys: Object.keys(data),
        hasId: 'id' in data,
        hasPosition: 'position' in data,
        hasCoordinates: 'x' in data && 'y' in data,
        positionType: data.position ? typeof data.position : 'undefined'
      })
    }
    
    // 添加操作建议
    enhancedError.suggestions = this.generateErrorSuggestions(operation, data, error)
    
    return enhancedError
  }

  /**
   * 安全地序列化对象，避免循环引用问题
   */
  safeStringify(obj) {
    if (obj === null) return 'null'
    if (obj === undefined) return 'undefined'
    if (typeof obj !== 'object') return String(obj)
    
    try {
      const seen = new WeakSet()
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]'
          }
          seen.add(value)
        }
        return value
      })
    } catch (e) {
      return `[Object: ${obj.constructor?.name || 'Unknown'}]`
    }
  }

  /**
   * 生成错误修复建议
   * @param {string} operation - 操作名称
   * @param {*} data - 相关数据
   * @param {Error} error - 原始错误
   * @returns {Array} - 修复建议列表
   */
  generateErrorSuggestions(operation, data, error) {
    const suggestions = []
    
    if (operation === 'addNode') {
      if (data === null || data === undefined) {
        suggestions.push('确保传入有效的节点数据对象，不能为null或undefined')
        suggestions.push('检查调用addNode方法的代码，确保数据源正确')
      } else if (typeof data !== 'object') {
        suggestions.push(`节点数据必须是对象类型，当前类型为${typeof data}`)
        suggestions.push('检查数据转换逻辑，确保传入的是有效对象')
      } else if (Array.isArray(data)) {
        suggestions.push('节点数据不能是数组，应该是单个对象')
        suggestions.push('如果需要批量添加节点，请逐个调用addNode方法')
      } else if (!data.id) {
        suggestions.push('节点数据缺少必要的id字段')
        suggestions.push('使用preprocessNodeData方法自动生成id，或手动设置唯一id')
      } else if (data.position && (typeof data.position.x !== 'number' || typeof data.position.y !== 'number')) {
        suggestions.push('position.x和position.y必须是有效的数字类型')
        suggestions.push('检查拖拽操作的坐标转换逻辑')
      } else if ((data.x !== undefined && !isFinite(data.x)) || (data.y !== undefined && !isFinite(data.y))) {
        suggestions.push('节点坐标不能为NaN或Infinity')
        suggestions.push('检查坐标计算逻辑，确保数值有效')
      }
    }
    
    return suggestions
  }

  /**
   * 更新节点
   * @param {string} nodeId - 节点ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} - 更新结果
   */
  async updateNode(nodeId, updateData) {
    try {
      this.validateOperation('updateNode', { nodeId, updateData })
      
      const node = this.graph.getCellById(nodeId)
      if (!node || !node.isNode()) {
        throw new Error(`节点不存在: ${nodeId}`)
      }
      
      const oldData = node.getData()
      node.setData({ ...oldData, ...updateData })
      
      this.recordOperation(GraphOperationType.NODE_UPDATE, {
        nodeId,
        oldData,
        newData: updateData
      })
      
      this.emit('node:updated', { node, oldData, newData: updateData })
      
      return {
        success: true,
        node: node,
        oldData: oldData,
        newData: updateData
      }
      
    } catch (error) {
      console.error('[GraphService] 更新节点失败:', error)
      this.emit('node:update:error', { nodeId, updateData, error })
      throw error
    }
  }

  /**
   * 删除节点
   * @param {string} nodeId - 节点ID
   * @returns {Promise<Object>} - 删除结果
   */
  async deleteNode(nodeId) {
    try {
      this.validateOperation('deleteNode', { nodeId })
      
      const node = this.graph.getCellById(nodeId)
      if (!node || !node.isNode()) {
        throw new Error(`节点不存在: ${nodeId}`)
      }
      
      const nodeData = node.getData()
      this.graph.removeCell(node)
      
      this.recordOperation(GraphOperationType.NODE_DELETE, {
        nodeId,
        nodeData
      })
      
      this.updateState()
      this.emit('node:deleted', { nodeId, nodeData })
      
      return {
        success: true,
        nodeId: nodeId,
        nodeData: nodeData
      }
      
    } catch (error) {
      console.error('[GraphService] 删除节点失败:', error)
      this.emit('node:delete:error', { nodeId, error })
      throw error
    }
  }

  // ==================== 连接线操作接口 ====================

  /**
   * 添加连接线
   * @param {Object} edgeData - 连接线数据
   * @returns {Promise<Object>} - 添加结果
   */
  async addEdge(edgeData) {
    try {
      this.validateOperation('addEdge', edgeData)
      
      const edge = this.graph.addEdge(edgeData)
      
      this.recordOperation(GraphOperationType.EDGE_ADD, {
        edgeId: edge.id,
        edgeData: edgeData
      })
      
      this.updateState()
      this.emit('edge:added', { edge, edgeData })
      
      return {
        success: true,
        edge: edge,
        edgeId: edge.id
      }
      
    } catch (error) {
      console.error('[GraphService] 添加连接线失败:', error)
      this.emit('edge:add:error', { edgeData, error })
      throw error
    }
  }

  /**
   * 删除连接线
   * @param {string} edgeId - 连接线ID
   * @returns {Promise<Object>} - 删除结果
   */
  async deleteEdge(edgeId) {
    try {
      this.validateOperation('deleteEdge', { edgeId })
      
      const edge = this.graph.getCellById(edgeId)
      if (!edge || !edge.isEdge()) {
        throw new Error(`连接线不存在: ${edgeId}`)
      }
      
      const edgeData = edge.getData()
      this.graph.removeCell(edge)
      
      this.recordOperation(GraphOperationType.EDGE_DELETE, {
        edgeId,
        edgeData
      })
      
      this.updateState()
      this.emit('edge:deleted', { edgeId, edgeData })
      
      return {
        success: true,
        edgeId: edgeId,
        edgeData: edgeData
      }
      
    } catch (error) {
      console.error('[GraphService] 删除连接线失败:', error)
      this.emit('edge:delete:error', { edgeId, error })
      throw error
    }
  }

  // ==================== 画布操作接口 ====================

  /**
   * 清空画布
   * @returns {Promise<Object>} - 清空结果
   */
  async clearCanvas() {
    try {
      const nodes = this.graph.getNodes()
      const edges = this.graph.getEdges()
      
      this.graph.clearCells()
      
      this.recordOperation(GraphOperationType.CANVAS_CLEAR, {
        nodeCount: nodes.length,
        edgeCount: edges.length
      })
      
      this.updateState()
      this.emit('canvas:cleared', { nodeCount: nodes.length, edgeCount: edges.length })
      
      return {
        success: true,
        clearedNodes: nodes.length,
        clearedEdges: edges.length
      }
      
    } catch (error) {
      console.error('[GraphService] 清空画布失败:', error)
      this.emit('canvas:clear:error', { error })
      throw error
    }
  }

  // ==================== 查询接口 ====================

  /**
   * 获取所有节点
   * @returns {Array} - 节点数组
   */
  getNodes() {
    return this.graph ? this.graph.getNodes() : []
  }

  /**
   * 获取所有边
   * @returns {Array} - 边数组
   */
  getEdges() {
    return this.graph ? this.graph.getEdges() : []
  }

  /**
   * 清空图形
   * @returns {Promise<Object>} - 清空结果
   */
  async clearGraph() {
    try {
      this.validateOperation('clearGraph')
      
      if (!this.graph) {
        return { success: true, message: '图形实例不存在，无需清空' }
      }

      // 获取清空前的统计信息
      const beforeStats = {
        nodeCount: this.getNodes().length,
        edgeCount: this.getEdges().length
      }

      // 清空所有单元格（节点和边）
      this.graph.clearCells()

      // 更新状态
      this.updateState()

      // 记录操作历史
      this.recordOperation(GraphOperationType.GRAPH_CLEAR, {
        beforeStats,
        timestamp: Date.now()
      })

      // 触发事件
      this.emit('graph:cleared', {
        beforeStats,
        afterStats: {
          nodeCount: 0,
          edgeCount: 0
        }
      })

      return {
        success: true,
        beforeStats,
        afterStats: {
          nodeCount: 0,
          edgeCount: 0
        }
      }

    } catch (error) {
      const enhancedError = this.enhanceError(error, 'clearGraph')
      
      // 触发错误事件
      this.emit('graph:clear:error', enhancedError)
      
      throw enhancedError
    }
  }

  /**
   * 根据ID获取节点
   * @param {string} nodeId - 节点ID
   * @returns {Object|null} - 节点对象
   */
  getNodeById(nodeId) {
    const cell = this.graph?.getCellById(nodeId)
    return cell && cell.isNode() ? cell : null
  }

  /**
   * 根据ID获取连接线
   * @param {string} edgeId - 连接线ID
   * @returns {Object|null} - 连接线对象
   */
  getEdgeById(edgeId) {
    const cell = this.graph?.getCellById(edgeId)
    return cell && cell.isEdge() ? cell : null
  }

  // ==================== 事件系统 ====================

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理器
   */
  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event).add(handler)
  }

  /**
   * 移除事件监听
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理器
   */
  off(event, handler) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(handler)
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   */
  emit(event, data = {}) {
    if (this.config.enableEvents && this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`[GraphService] 事件处理器执行失败: ${event}`, error)
        }
      })
    }
  }

  // ==================== 内部方法 ====================

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (!this.graph) return
    
    // 监听图的基础事件
    this.graph.on('node:added', (args) => {
      this.updateState()
      this.emit('graph:node:added', args)
    })
    
    this.graph.on('node:removed', (args) => {
      this.updateState()
      this.emit('graph:node:removed', args)
    })
    
    this.graph.on('edge:added', (args) => {
      this.updateState()
      this.emit('graph:edge:added', args)
    })
    
    this.graph.on('edge:removed', (args) => {
      this.updateState()
      this.emit('graph:edge:removed', args)
    })
  }

  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    if (!this.graph) return
    
    this.graph.off('node:added')
    this.graph.off('node:removed')
    this.graph.off('edge:added')
    this.graph.off('edge:removed')
  }

  /**
   * 更新服务状态
   */
  updateState() {
    if (!this.graph) return
    
    this.state.nodeCount = this.graph.getNodes().length
    this.state.edgeCount = this.graph.getEdges().length
    this.state.operationCount++
  }

  /**
   * 记录操作历史
   * @param {string} type - 操作类型
   * @param {Object} data - 操作数据
   */
  recordOperation(type, data) {
    if (!this.config.enableHistory) return
    
    const operation = {
      type,
      data,
      timestamp: Date.now(),
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    this.operationHistory.push(operation)
    this.state.lastOperation = operation
    
    // 限制历史记录大小
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory.shift()
    }
  }

  /**
   * 验证操作参数
   * @param {string} operation - 操作名称
   * @param {Object} params - 参数
   */
  validateOperation(operation, params) {
    if (!this.config.enableValidation) return
    
    if (!this.isEnabled) {
      throw new Error('GraphService已禁用')
    }
    
    if (!this.graph) {
      throw new Error('图实例不存在')
    }
    
    // 根据操作类型进行特定验证
    switch (operation) {
      case 'addNode':
        this.validateNodeData(params)
        break
      case 'updateNode':
        if (!params || !params.id) {
          throw new Error('节点ID不能为空')
        }
        if (!params.data || typeof params.data !== 'object') {
          throw new Error('更新数据无效')
        }
        break
      case 'deleteNode':
        if (!params || !params.nodeId) {
          throw new Error('节点ID不能为空')
        }
        break
      case 'addEdge':
        if (!params || typeof params !== 'object') {
          throw new Error('连接线数据无效：参数不是有效对象')
        }
        if (!params.source || !params.target) {
          throw new Error('连接线数据无效：缺少源节点或目标节点')
        }
        break
      case 'deleteEdge':
        if (!params || !params.edgeId) {
          throw new Error('连接线ID不能为空')
        }
        break
    }
  }

  /**
   * 验证节点数据
   * @param {Object} nodeData - 节点数据
   */
  validateNodeData(nodeData) {
    // 基础类型检查 - 提供更详细的错误信息
    if (nodeData === null) {
      throw new Error('节点数据无效：数据为null。请确保传入有效的节点数据对象。')
    }
    
    if (nodeData === undefined) {
      throw new Error('节点数据无效：数据为undefined。请检查数据源是否正确初始化。')
    }
    
    if (typeof nodeData !== 'object') {
      throw new Error(`节点数据无效：期望对象类型，实际为${typeof nodeData}。请传入有效的节点数据对象。`)
    }
    
    if (Array.isArray(nodeData)) {
      throw new Error('节点数据无效：不能是数组类型。如需批量添加节点，请逐个调用addNode方法。')
    }
    
    // 必要字段检查 - 增强错误信息
    if (!nodeData.id || nodeData.id === '') {
      throw new Error('节点数据无效：缺少必要字段 id。每个节点必须有唯一的标识符。')
    }
    
    if (typeof nodeData.id !== 'string') {
      throw new Error(`节点数据无效：id字段必须为字符串类型，实际为${typeof nodeData.id}。请确保id是有效的字符串。`)
    }
    
    if (nodeData.id.trim() === '') {
      throw new Error('节点数据无效：id字段不能为空字符串。请提供有效的节点标识符。')
    }
    
    // 可选字段类型检查 - 增强错误信息
    if (nodeData.type !== undefined && typeof nodeData.type !== 'string') {
      throw new Error(`节点数据无效：type字段必须为字符串类型，实际为${typeof nodeData.type}。请使用有效的节点类型标识。`)
    }
    
    // 位置信息验证 - 增强错误处理
    if (nodeData.position !== undefined) {
      if (typeof nodeData.position !== 'object' || nodeData.position === null) {
        throw new Error('节点数据无效：position字段必须为对象类型。格式应为 { x: number, y: number }。')
      }
      
      // 检查position对象是否包含必要的坐标字段
      if (!('x' in nodeData.position) || !('y' in nodeData.position)) {
        throw new Error('节点数据无效：position对象必须包含x和y坐标字段。')
      }
      
      // 先检查是否为数字类型
      if (typeof nodeData.position.x !== 'number' || typeof nodeData.position.y !== 'number') {
        throw new Error(`节点数据无效：position.x和position.y必须为数字类型。当前类型：x=${typeof nodeData.position.x}, y=${typeof nodeData.position.y}`)
      }
      
      // 再检查是否为有效数字（包括NaN和Infinity检查）
      if (!isFinite(nodeData.position.x) || !isFinite(nodeData.position.y)) {
        throw new Error(`节点数据无效：position坐标不能为NaN或Infinity。当前值：x=${nodeData.position.x}, y=${nodeData.position.y}`)
      }
    }
    
    // X6 图形库必要字段检查 - 增强错误信息
    if (nodeData.x !== undefined) {
      if (typeof nodeData.x !== 'number') {
        throw new Error(`节点数据无效：x坐标必须为数字类型，实际为${typeof nodeData.x}`)
      }
      if (!isFinite(nodeData.x)) {
        throw new Error(`节点数据无效：x坐标必须为有效数字，当前值为${nodeData.x}`)
      }
    }
    
    if (nodeData.y !== undefined) {
      if (typeof nodeData.y !== 'number') {
        throw new Error(`节点数据无效：y坐标必须为数字类型，实际为${typeof nodeData.y}`)
      }
      if (!isFinite(nodeData.y)) {
        throw new Error(`节点数据无效：y坐标必须为有效数字，当前值为${nodeData.y}`)
      }
    }
    
    // 尺寸验证 - 增强错误信息
    if (nodeData.width !== undefined) {
      if (typeof nodeData.width !== 'number') {
        throw new Error(`节点数据无效：width必须为数字类型，实际为${typeof nodeData.width}`)
      }
      if (isNaN(nodeData.width) || nodeData.width <= 0) {
        throw new Error(`节点数据无效：width必须为正数，当前值为${nodeData.width}`)
      }
    }
    
    if (nodeData.height !== undefined) {
      if (typeof nodeData.height !== 'number') {
        throw new Error(`节点数据无效：height必须为数字类型，实际为${typeof nodeData.height}`)
      }
      if (isNaN(nodeData.height) || nodeData.height <= 0) {
        throw new Error(`节点数据无效：height必须为正数，当前值为${nodeData.height}`)
      }
    }
  }

  // ==================== 状态查询接口 ====================

  /**
   * 获取服务状态
   * @returns {Object} - 服务状态信息
   */
  getStatus() {
    return {
      ...this.state,
      isEnabled: this.isEnabled,
      hasGraph: !!this.graph,
      historySize: this.operationHistory.length,
      config: { ...this.config }
    }
  }

  /**
   * 获取操作历史
   * @returns {Array} - 操作历史记录
   */
  getOperationHistory() {
    return [...this.operationHistory]
  }

  /**
   * 启用/禁用服务
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    this.emit('service:enabled:changed', { enabled })
  }

  // ==================== 数据管理接口 ====================

  /**
   * 加载图形数据到画布
   * @param {Object} graphData - 图形数据对象
   * @param {Array} graphData.nodes - 节点数据数组
   * @param {Array} graphData.edges - 边数据数组
   * @returns {Promise<Object>} - 加载结果
   */
  async loadGraphData(graphData) {
    try {
      // 基础验证
      if (!graphData || typeof graphData !== 'object') {
        throw new Error('图形数据无效：数据必须是有效对象')
      }

      const { nodes = [], edges = [] } = graphData
      
      if (!Array.isArray(nodes)) {
        throw new Error('图形数据无效：nodes必须是数组')
      }
      
      if (!Array.isArray(edges)) {
        throw new Error('图形数据无效：edges必须是数组')
      }

      // 清空现有图形
      this.clearGraph()

      // 记录操作开始
      const operation = {
        type: 'LOAD_DATA',
        timestamp: Date.now(),
        data: { nodeCount: nodes.length, edgeCount: edges.length }
      }

      // 批量添加节点
      const addedNodes = []
      for (const nodeData of nodes) {
        try {
          const node = await this.addNode(nodeData)
          addedNodes.push(node)
        } catch (error) {
          console.warn(`加载节点失败: ${nodeData.id}`, error)
          // 继续加载其他节点，不中断整个过程
        }
      }

      // 批量添加边
      const addedEdges = []
      for (const edgeData of edges) {
        try {
          const edge = await this.addEdge(edgeData)
          addedEdges.push(edge)
        } catch (error) {
          console.warn(`加载边失败: ${edgeData.id || 'unknown'}`, error)
          // 继续加载其他边，不中断整个过程
        }
      }

      // 更新状态
      this.state.lastLoadTime = Date.now()
      this.state.totalNodes = addedNodes.length
      this.state.totalEdges = addedEdges.length

      // 记录操作历史
      operation.result = {
        success: true,
        loadedNodes: addedNodes.length,
        loadedEdges: addedEdges.length,
        totalRequested: nodes.length + edges.length,
        totalLoaded: addedNodes.length + addedEdges.length
      }
      
      if (this.config.enableHistory) {
        this.operationHistory.push(operation)
      }

      // 触发事件
      this.emit('graph:data:loaded', {
        nodes: addedNodes,
        edges: addedEdges,
        stats: operation.result
      })

      return {
        success: true,
        nodes: addedNodes,
        edges: addedEdges,
        stats: operation.result
      }

    } catch (error) {
      const enhancedError = this.enhanceError(error, 'loadGraphData', { graphData })
      
      // 记录失败操作
      if (this.config.enableHistory) {
        this.operationHistory.push({
          type: 'LOAD_DATA',
          timestamp: Date.now(),
          result: { success: false, error: enhancedError.message }
        })
      }

      // 触发错误事件
      this.emit('graph:data:load:error', enhancedError)
      
      throw enhancedError
    }
  }

  /**
   * 获取当前图形数据
   * @returns {Object} - 包含所有节点和边的图形数据
   */
  getGraphData() {
    try {
      const nodes = this.getNodes()
      const edges = this.getEdges()

      const graphData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.getData()?.type || 'default',
          position: node.getPosition(),
          size: node.getSize(),
          data: node.getData(),
          // 包含X6特定属性
          x: node.getPosition().x,
          y: node.getPosition().y,
          width: node.getSize().width,
          height: node.getSize().height
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId(),
          data: edge.getData(),
          // 包含样式和路径信息
          attrs: edge.getAttrs(),
          vertices: edge.getVertices()
        })),
        metadata: {
          timestamp: Date.now(),
          version: '1.0',
          nodeCount: nodes.length,
          edgeCount: edges.length,
          canvasSize: this.graph ? {
            width: this.graph.options.width,
            height: this.graph.options.height
          } : null
        }
      }

      // 触发事件
      this.emit('graph:data:exported', {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        dataSize: JSON.stringify(graphData).length
      })

      return graphData

    } catch (error) {
      const enhancedError = this.enhanceError(error, 'getGraphData')
      
      // 触发错误事件
      this.emit('graph:data:export:error', enhancedError)
      
      throw enhancedError
    }
  }

  /**
   * 验证图形数据格式
   * @param {Object} graphData - 要验证的图形数据
   * @returns {boolean} - 验证结果
   */
  validateGraphData(graphData) {
    if (!graphData || typeof graphData !== 'object') {
      return false
    }

    const { nodes, edges } = graphData

    // 验证节点数组
    if (nodes && !Array.isArray(nodes)) {
      return false
    }

    // 验证边数组
    if (edges && !Array.isArray(edges)) {
      return false
    }

    // 验证节点数据格式
    if (nodes) {
      for (const node of nodes) {
        if (!node.id || typeof node.id !== 'string') {
          return false
        }
      }
    }

    // 验证边数据格式
    if (edges) {
      for (const edge of edges) {
        if (!edge.source || !edge.target) {
          return false
        }
      }
    }

    return true
  }
}

/**
 * 图形管理服务工厂函数
 * @param {Object} graph - X6 图实例
 * @returns {GraphService} - 图形管理服务实例
 */
export function createGraphService(graph) {
  return new GraphService(graph)
}

/**
 * 默认图形服务配置
 */
export const DefaultGraphServiceConfig = {
  enableHistory: true,
  enableValidation: true,
  enableEvents: true,
  autoSave: false,
  maxHistorySize: 50
}