/**
 * 事件处理服务
 * 提供统一的事件处理机制，包括事件分发、响应、优先级和过滤
 * 基于现有事件系统和 EdgeOverlapManager 进行封装
 */

import { EdgeOverlapManager } from '../utils/canvas/EdgeOverlapManager.js'

/**
 * 事件类型枚举
 */
export const EventType = {
  // 节点事件
  NODE_ADDED: 'node:added',
  NODE_REMOVED: 'node:removed',
  NODE_MOVED: 'node:moved',
  NODE_SELECTED: 'node:selected',
  NODE_CLICKED: 'node:clicked',
  NODE_DOUBLE_CLICKED: 'node:dblclick',
  NODE_HOVER: 'node:mouseenter',
  NODE_LEAVE: 'node:mouseleave',
  
  // 连线事件
  EDGE_ADDED: 'edge:added',
  EDGE_REMOVED: 'edge:removed',
  EDGE_SELECTED: 'edge:selected',
  EDGE_CLICKED: 'edge:clicked',
  EDGE_DOUBLE_CLICKED: 'edge:dblclick',
  EDGE_HOVER: 'edge:mouseenter',
  EDGE_LEAVE: 'edge:mouseleave',
  
  // 画布事件
  CANVAS_CLICKED: 'blank:click',
  CANVAS_DOUBLE_CLICKED: 'blank:dblclick',
  CANVAS_ZOOM: 'scale',
  CANVAS_PAN: 'translate',
  
  // 拖拽事件
  DRAG_START: 'node:drag:start',
  DRAG_MOVE: 'node:drag:move',
  DRAG_END: 'node:drag:end',
  
  // 连接事件
  CONNECT_START: 'edge:connect:start',
  CONNECT_MOVE: 'edge:connect:move',
  CONNECT_END: 'edge:connect:end',
  
  // 自定义业务事件
  LAYOUT_CHANGED: 'layout:changed',
  STATE_CHANGED: 'state:changed',
  PREVIEW_LINE_CREATED: 'preview:line:created',
  PREVIEW_LINE_REMOVED: 'preview:line:removed'
}

/**
 * 事件优先级枚举
 */
export const EventPriority = {
  HIGHEST: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  LOWEST: 5
}

/**
 * 事件处理服务类
 */
export class EventService {
  constructor(graph) {
    this.graph = graph
    this.eventHandlers = new Map() // 事件处理器映射
    this.eventFilters = new Map() // 事件过滤器映射
    this.eventHistory = [] // 事件历史记录
    this.maxHistorySize = 100 // 最大历史记录数量
    this.isEnabled = true // 服务启用状态
    
    // 初始化边缘重叠管理器
    this.edgeOverlapManager = new EdgeOverlapManager(graph)
    
    // 初始化服务
    this.initialize()
    
    console.log('🎯 [事件处理服务] 初始化完成')
  }

  /**
   * 初始化服务
   */
  initialize() {
    this.setupCoreEventListeners()
    this.setupBusinessEventListeners()
  }

  /**
   * 设置核心事件监听器
   */
  setupCoreEventListeners() {
    // 节点事件
    this.graph.on(EventType.NODE_ADDED, (args) => {
      this.handleEvent(EventType.NODE_ADDED, args, EventPriority.HIGH)
    })
    
    this.graph.on(EventType.NODE_REMOVED, (args) => {
      this.handleEvent(EventType.NODE_REMOVED, args, EventPriority.HIGH)
    })
    
    this.graph.on(EventType.NODE_MOVED, (args) => {
      this.handleEvent(EventType.NODE_MOVED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.NODE_SELECTED, (args) => {
      this.handleEvent(EventType.NODE_SELECTED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.NODE_CLICKED, (args) => {
      this.handleEvent(EventType.NODE_CLICKED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.NODE_DOUBLE_CLICKED, (args) => {
      this.handleEvent(EventType.NODE_DOUBLE_CLICKED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.NODE_HOVER, (args) => {
      this.handleEvent(EventType.NODE_HOVER, args, EventPriority.LOW)
    })
    
    this.graph.on(EventType.NODE_LEAVE, (args) => {
      this.handleEvent(EventType.NODE_LEAVE, args, EventPriority.LOW)
    })

    // 连线事件
    this.graph.on(EventType.EDGE_ADDED, (args) => {
      this.handleEvent(EventType.EDGE_ADDED, args, EventPriority.HIGH)
    })
    
    this.graph.on(EventType.EDGE_REMOVED, (args) => {
      this.handleEvent(EventType.EDGE_REMOVED, args, EventPriority.HIGH)
    })
    
    this.graph.on(EventType.EDGE_SELECTED, (args) => {
      this.handleEvent(EventType.EDGE_SELECTED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.EDGE_CLICKED, (args) => {
      this.handleEvent(EventType.EDGE_CLICKED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.EDGE_DOUBLE_CLICKED, (args) => {
      this.handleEvent(EventType.EDGE_DOUBLE_CLICKED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.EDGE_HOVER, (args) => {
      this.handleEvent(EventType.EDGE_HOVER, args, EventPriority.LOW)
    })
    
    this.graph.on(EventType.EDGE_LEAVE, (args) => {
      this.handleEvent(EventType.EDGE_LEAVE, args, EventPriority.LOW)
    })

    // 画布事件
    this.graph.on(EventType.CANVAS_CLICKED, (args) => {
      this.handleEvent(EventType.CANVAS_CLICKED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.CANVAS_DOUBLE_CLICKED, (args) => {
      this.handleEvent(EventType.CANVAS_DOUBLE_CLICKED, args, EventPriority.NORMAL)
    })
    
    this.graph.on(EventType.CANVAS_ZOOM, (args) => {
      this.handleEvent(EventType.CANVAS_ZOOM, args, EventPriority.LOW)
    })
    
    this.graph.on(EventType.CANVAS_PAN, (args) => {
      this.handleEvent(EventType.CANVAS_PAN, args, EventPriority.LOW)
    })
  }

  /**
   * 设置业务事件监听器
   */
  setupBusinessEventListeners() {
    // 拖拽事件处理
    this.graph.on('node:drag:start', (args) => {
      this.handleEvent(EventType.DRAG_START, args, EventPriority.HIGH)
    })
    
    this.graph.on('node:drag:move', (args) => {
      this.handleEvent(EventType.DRAG_MOVE, args, EventPriority.NORMAL)
    })
    
    this.graph.on('node:drag:end', (args) => {
      this.handleEvent(EventType.DRAG_END, args, EventPriority.HIGH)
    })

    // 连接事件处理
    this.graph.on('edge:connect:start', (args) => {
      this.handleEvent(EventType.CONNECT_START, args, EventPriority.HIGH)
    })
    
    this.graph.on('edge:connect:move', (args) => {
      this.handleEvent(EventType.CONNECT_MOVE, args, EventPriority.NORMAL)
    })
    
    this.graph.on('edge:connect:end', (args) => {
      this.handleEvent(EventType.CONNECT_END, args, EventPriority.HIGH)
    })
  }

  /**
   * 注册事件处理器
   * @param {string} eventType - 事件类型
   * @param {Function} handler - 处理函数
   * @param {number} priority - 优先级
   * @param {Object} options - 选项
   */
  on(eventType, handler, priority = EventPriority.NORMAL, options = {}) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    
    const handlerInfo = {
      handler,
      priority,
      options,
      id: this.generateHandlerId()
    }
    
    const handlers = this.eventHandlers.get(eventType)
    handlers.push(handlerInfo)
    
    // 按优先级排序
    handlers.sort((a, b) => a.priority - b.priority)
    
    console.log('📝 [事件处理服务] 注册事件处理器:', {
      eventType,
      priority,
      handlerId: handlerInfo.id
    })
    
    return handlerInfo.id
  }

  /**
   * 移除事件处理器
   * @param {string} eventType - 事件类型
   * @param {string} handlerId - 处理器ID
   */
  off(eventType, handlerId) {
    if (!this.eventHandlers.has(eventType)) {
      return false
    }
    
    const handlers = this.eventHandlers.get(eventType)
    const index = handlers.findIndex(h => h.id === handlerId)
    
    if (index !== -1) {
      handlers.splice(index, 1)
      console.log('🗑️ [事件处理服务] 移除事件处理器:', {
        eventType,
        handlerId
      })
      return true
    }
    
    return false
  }

  /**
   * 触发自定义事件
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   * @param {number} priority - 优先级
   */
  emit(eventType, data, priority = EventPriority.NORMAL) {
    this.handleEvent(eventType, data, priority)
  }

  /**
   * 处理事件
   * @param {string} eventType - 事件类型
   * @param {Object} args - 事件参数
   * @param {number} priority - 优先级
   */
  handleEvent(eventType, args, priority) {
    if (!this.isEnabled) {
      return
    }

    // 应用事件过滤器
    if (!this.applyEventFilters(eventType, args)) {
      return
    }

    // 记录事件历史
    this.recordEventHistory(eventType, args, priority)

    // 获取事件处理器
    const handlers = this.eventHandlers.get(eventType) || []
    
    if (handlers.length === 0) {
      return
    }

    console.log('🎯 [事件处理服务] 处理事件:', {
      eventType,
      priority,
      handlersCount: handlers.length
    })

    // 按优先级执行处理器
    for (const handlerInfo of handlers) {
      try {
        // 检查处理器选项
        if (handlerInfo.options.once && handlerInfo.executed) {
          continue
        }

        // 执行处理器
        const result = handlerInfo.handler(args, eventType)
        
        // 标记已执行
        handlerInfo.executed = true

        // 如果处理器返回 false，停止后续处理器执行
        if (result === false) {
          console.log('⏹️ [事件处理服务] 事件处理被中断:', {
            eventType,
            handlerId: handlerInfo.id
          })
          break
        }
      } catch (error) {
        console.error('❌ [事件处理服务] 事件处理器执行错误:', {
          eventType,
          handlerId: handlerInfo.id,
          error: error.message
        })
      }
    }
  }

  /**
   * 添加事件过滤器
   * @param {string} eventType - 事件类型
   * @param {Function} filter - 过滤函数
   */
  addFilter(eventType, filter) {
    if (!this.eventFilters.has(eventType)) {
      this.eventFilters.set(eventType, [])
    }
    
    this.eventFilters.get(eventType).push(filter)
    
    console.log('🔍 [事件处理服务] 添加事件过滤器:', eventType)
  }

  /**
   * 移除事件过滤器
   * @param {string} eventType - 事件类型
   * @param {Function} filter - 过滤函数
   */
  removeFilter(eventType, filter) {
    if (!this.eventFilters.has(eventType)) {
      return false
    }
    
    const filters = this.eventFilters.get(eventType)
    const index = filters.indexOf(filter)
    
    if (index !== -1) {
      filters.splice(index, 1)
      console.log('🗑️ [事件处理服务] 移除事件过滤器:', eventType)
      return true
    }
    
    return false
  }

  /**
   * 应用事件过滤器
   * @param {string} eventType - 事件类型
   * @param {Object} args - 事件参数
   * @returns {boolean} - 是否通过过滤
   */
  applyEventFilters(eventType, args) {
    const filters = this.eventFilters.get(eventType) || []
    
    for (const filter of filters) {
      try {
        if (!filter(args, eventType)) {
          console.log('🚫 [事件处理服务] 事件被过滤器拦截:', eventType)
          return false
        }
      } catch (error) {
        console.error('❌ [事件处理服务] 事件过滤器执行错误:', {
          eventType,
          error: error.message
        })
      }
    }
    
    return true
  }

  /**
   * 记录事件历史
   * @param {string} eventType - 事件类型
   * @param {Object} args - 事件参数
   * @param {number} priority - 优先级
   */
  recordEventHistory(eventType, args, priority) {
    const eventRecord = {
      eventType,
      args,
      priority,
      timestamp: Date.now(),
      id: this.generateEventId()
    }
    
    this.eventHistory.push(eventRecord)
    
    // 限制历史记录数量
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }

  /**
   * 获取事件历史
   * @param {string} eventType - 事件类型（可选）
   * @param {number} limit - 限制数量（可选）
   * @returns {Array} - 事件历史记录
   */
  getEventHistory(eventType = null, limit = null) {
    let history = this.eventHistory
    
    if (eventType) {
      history = history.filter(record => record.eventType === eventType)
    }
    
    if (limit) {
      history = history.slice(-limit)
    }
    
    return history
  }

  /**
   * 清空事件历史
   */
  clearEventHistory() {
    this.eventHistory = []
    console.log('🧹 [事件处理服务] 清空事件历史')
  }

  /**
   * 启用服务
   */
  enable() {
    this.isEnabled = true
    console.log('✅ [事件处理服务] 服务已启用')
  }

  /**
   * 禁用服务
   */
  disable() {
    this.isEnabled = false
    console.log('⏸️ [事件处理服务] 服务已禁用')
  }

  /**
   * 获取服务状态
   * @returns {Object} - 服务状态信息
   */
  getStatus() {
    const handlerCounts = {}
    for (const [eventType, handlers] of this.eventHandlers) {
      handlerCounts[eventType] = handlers.length
    }
    
    const filterCounts = {}
    for (const [eventType, filters] of this.eventFilters) {
      filterCounts[eventType] = filters.length
    }
    
    return {
      isEnabled: this.isEnabled,
      totalHandlers: Array.from(this.eventHandlers.values()).reduce((sum, handlers) => sum + handlers.length, 0),
      totalFilters: Array.from(this.eventFilters.values()).reduce((sum, filters) => sum + filters.length, 0),
      eventHistorySize: this.eventHistory.length,
      handlerCounts,
      filterCounts,
      edgeOverlapManagerStatus: this.edgeOverlapManager.getManagerStatus()
    }
  }

  /**
   * 获取边缘重叠管理器
   * @returns {EdgeOverlapManager} - 边缘重叠管理器实例
   */
  getEdgeOverlapManager() {
    return this.edgeOverlapManager
  }

  /**
   * 生成处理器ID
   * @returns {string} - 处理器ID
   */
  generateHandlerId() {
    return `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成事件ID
   * @returns {string} - 事件ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 销毁服务
   */
  destroy() {
    // 清空所有处理器
    this.eventHandlers.clear()
    this.eventFilters.clear()
    this.eventHistory = []
    
    // 销毁边缘重叠管理器
    if (this.edgeOverlapManager) {
      this.edgeOverlapManager.cleanup()
      this.edgeOverlapManager = null
    }
    
    this.isEnabled = false
    
    console.log('🗑️ [事件处理服务] 服务已销毁')
  }
}

/**
 * 事件处理服务工厂函数
 * @param {Object} graph - X6 图实例
 * @returns {EventService} - 事件处理服务实例
 */
export function createEventService(graph) {
  return new EventService(graph)
}

/**
 * 默认事件过滤器
 */
export const DefaultEventFilters = {
  /**
   * 预览线过滤器 - 过滤预览线相关事件
   */
  previewLineFilter: (args, eventType) => {
    if (eventType.includes('edge') && args.edge) {
      const edgeData = args.edge.getData() || {}
      const edgeId = args.edge.id || ''
      
      // 过滤预览线事件
      if (edgeData.isPreview || edgeId.includes('preview') || edgeId.includes('unified_preview')) {
        return false
      }
    }
    return true
  },

  /**
   * 临时连线过滤器 - 过滤拖拽过程中的临时连线
   */
  temporaryEdgeFilter: (args, eventType) => {
    if (eventType.includes('edge') && args.edge) {
      const targetId = args.edge.getTargetCellId()
      
      // 过滤没有目标节点的临时连线
      if (!targetId) {
        return false
      }
    }
    return true
  },

  /**
   * 节点存在性过滤器 - 确保节点存在
   */
  nodeExistenceFilter: (args, eventType) => {
    if (eventType.includes('node') && args.node) {
      // 检查节点是否仍然存在于图中
      const graph = args.node.model?.graph
      if (graph && !graph.getCellById(args.node.id)) {
        return false
      }
    }
    return true
  }
}