/**
 * 事件相关类型定义
 * 提供统一布局引擎中事件系统相关的类型约束和文档
 */

/**
 * 事件类型枚举
 * @typedef {string} EventType
 */
export const EventType = {
  // 布局事件
  /** 布局开始 */
  LAYOUT_START: 'layout:start',
  /** 布局完成 */
  LAYOUT_COMPLETE: 'layout:complete',
  /** 布局更新 */
  LAYOUT_UPDATE: 'layout:update',
  /** 布局错误 */
  LAYOUT_ERROR: 'layout:error',
  /** 布局取消 */
  LAYOUT_CANCEL: 'layout:cancel',
  
  // 节点事件
  /** 节点添加 */
  NODE_ADD: 'node:add',
  /** 节点删除 */
  NODE_REMOVE: 'node:remove',
  /** 节点更新 */
  NODE_UPDATE: 'node:update',
  /** 节点选择 */
  NODE_SELECT: 'node:select',
  /** 节点取消选择 */
  NODE_DESELECT: 'node:deselect',
  /** 节点悬停 */
  NODE_HOVER: 'node:hover',
  /** 节点点击 */
  NODE_CLICK: 'node:click',
  /** 节点双击 */
  NODE_DOUBLE_CLICK: 'node:double-click',
  /** 节点拖拽开始 */
  NODE_DRAG_START: 'node:drag-start',
  /** 节点拖拽中 */
  NODE_DRAG: 'node:drag',
  /** 节点拖拽结束 */
  NODE_DRAG_END: 'node:drag-end',
  /** 节点位置变化 */
  NODE_POSITION_CHANGE: 'node:position-change',
  
  // 边事件
  /** 边添加 */
  EDGE_ADD: 'edge:add',
  /** 边删除 */
  EDGE_REMOVE: 'edge:remove',
  /** 边更新 */
  EDGE_UPDATE: 'edge:update',
  /** 边选择 */
  EDGE_SELECT: 'edge:select',
  /** 边取消选择 */
  EDGE_DESELECT: 'edge:deselect',
  /** 边悬停 */
  EDGE_HOVER: 'edge:hover',
  /** 边点击 */
  EDGE_CLICK: 'edge:click',
  
  // 视图事件
  /** 视图缩放 */
  VIEW_ZOOM: 'view:zoom',
  /** 视图平移 */
  VIEW_PAN: 'view:pan',
  /** 视图重置 */
  VIEW_RESET: 'view:reset',
  /** 视图适应 */
  VIEW_FIT: 'view:fit',
  /** 视图变化 */
  VIEW_CHANGE: 'view:change',
  
  // 选择事件
  /** 选择变化 */
  SELECTION_CHANGE: 'selection:change',
  /** 全选 */
  SELECTION_SELECT_ALL: 'selection:select-all',
  /** 清空选择 */
  SELECTION_CLEAR: 'selection:clear',
  
  // 配置事件
  /** 配置变化 */
  CONFIG_CHANGE: 'config:change',
  /** 配置重置 */
  CONFIG_RESET: 'config:reset',
  
  // 性能事件
  /** 性能警告 */
  PERFORMANCE_WARNING: 'performance:warning',
  /** 性能报告 */
  PERFORMANCE_REPORT: 'performance:report',
  
  // 系统事件
  /** 初始化完成 */
  SYSTEM_READY: 'system:ready',
  /** 销毁 */
  SYSTEM_DESTROY: 'system:destroy',
  /** 错误 */
  SYSTEM_ERROR: 'system:error'
};

/**
 * 事件优先级枚举
 * @typedef {string} EventPriority
 */
export const EventPriority = {
  /** 低优先级 */
  LOW: 'low',
  /** 普通优先级 */
  NORMAL: 'normal',
  /** 高优先级 */
  HIGH: 'high',
  /** 紧急优先级 */
  URGENT: 'urgent'
};

/**
 * 事件阶段枚举
 * @typedef {string} EventPhase
 */
export const EventPhase = {
  /** 捕获阶段 */
  CAPTURING: 'capturing',
  /** 目标阶段 */
  AT_TARGET: 'at-target',
  /** 冒泡阶段 */
  BUBBLING: 'bubbling'
};

/**
 * 事件状态枚举
 * @typedef {string} EventStatus
 */
export const EventStatus = {
  /** 待处理 */
  PENDING: 'pending',
  /** 处理中 */
  PROCESSING: 'processing',
  /** 已完成 */
  COMPLETED: 'completed',
  /** 已取消 */
  CANCELLED: 'cancelled',
  /** 错误 */
  ERROR: 'error'
};

/**
 * 基础事件类型定义
 * @typedef {Object} BaseEvent
 * @property {string} id - 事件ID
 * @property {EventType} type - 事件类型
 * @property {Date} timestamp - 时间戳
 * @property {*} target - 事件目标
 * @property {*} currentTarget - 当前目标
 * @property {EventPhase} phase - 事件阶段
 * @property {boolean} bubbles - 是否冒泡
 * @property {boolean} cancelable - 是否可取消
 * @property {boolean} defaultPrevented - 是否已阻止默认行为
 * @property {boolean} propagationStopped - 是否已停止传播
 * @property {EventPriority} priority - 事件优先级
 * @property {Object} data - 事件数据
 * @property {Object} metadata - 事件元数据
 */
export const BaseEventType = {
  id: 'string',
  type: 'EventType',
  timestamp: 'Date',
  target: 'any',
  currentTarget: 'any',
  phase: 'EventPhase',
  bubbles: 'boolean',
  cancelable: 'boolean',
  defaultPrevented: 'boolean',
  propagationStopped: 'boolean',
  priority: 'EventPriority',
  data: 'Object',
  metadata: 'Object'
};

/**
 * 布局事件类型定义
 * @typedef {Object} LayoutEvent
 * @extends BaseEvent
 * @property {string} algorithmType - 算法类型
 * @property {Object} layoutConfig - 布局配置
 * @property {Object} layoutResult - 布局结果
 * @property {number} duration - 执行时长
 * @property {Object} performance - 性能数据
 * @property {string[]} affectedNodes - 受影响的节点
 * @property {string[]} affectedEdges - 受影响的边
 */
export const LayoutEventType = {
  ...BaseEventType,
  algorithmType: 'string',
  layoutConfig: 'Object',
  layoutResult: 'Object',
  duration: 'number',
  performance: 'Object',
  affectedNodes: 'string[]',
  affectedEdges: 'string[]'
};

/**
 * 节点事件类型定义
 * @typedef {Object} NodeEvent
 * @extends BaseEvent
 * @property {string} nodeId - 节点ID
 * @property {Object} node - 节点对象
 * @property {Object} oldData - 旧数据
 * @property {Object} newData - 新数据
 * @property {Object} position - 位置信息
 * @property {number} position.x - X坐标
 * @property {number} position.y - Y坐标
 * @property {Object} bounds - 边界信息
 * @property {Object} style - 样式信息
 * @property {string[]} connectedEdges - 连接的边
 */
export const NodeEventType = {
  ...BaseEventType,
  nodeId: 'string',
  node: 'Object',
  oldData: 'Object',
  newData: 'Object',
  position: {
    x: 'number',
    y: 'number'
  },
  bounds: 'Object',
  style: 'Object',
  connectedEdges: 'string[]'
};

/**
 * 边事件类型定义
 * @typedef {Object} EdgeEvent
 * @extends BaseEvent
 * @property {string} edgeId - 边ID
 * @property {Object} edge - 边对象
 * @property {string} sourceNodeId - 源节点ID
 * @property {string} targetNodeId - 目标节点ID
 * @property {Object} oldData - 旧数据
 * @property {Object} newData - 新数据
 * @property {Object} path - 路径信息
 * @property {Object} style - 样式信息
 */
export const EdgeEventType = {
  ...BaseEventType,
  edgeId: 'string',
  edge: 'Object',
  sourceNodeId: 'string',
  targetNodeId: 'string',
  oldData: 'Object',
  newData: 'Object',
  path: 'Object',
  style: 'Object'
};

/**
 * 视图事件类型定义
 * @typedef {Object} ViewEvent
 * @extends BaseEvent
 * @property {Object} viewport - 视口信息
 * @property {number} viewport.x - X偏移
 * @property {number} viewport.y - Y偏移
 * @property {number} viewport.zoom - 缩放比例
 * @property {Object} bounds - 可视区域边界
 * @property {Object} transform - 变换矩阵
 * @property {Object} oldViewport - 旧视口信息
 * @property {Object} newViewport - 新视口信息
 */
export const ViewEventType = {
  ...BaseEventType,
  viewport: {
    x: 'number',
    y: 'number',
    zoom: 'number'
  },
  bounds: 'Object',
  transform: 'Object',
  oldViewport: 'Object',
  newViewport: 'Object'
};

/**
 * 选择事件类型定义
 * @typedef {Object} SelectionEvent
 * @extends BaseEvent
 * @property {string[]} selectedNodes - 选中的节点
 * @property {string[]} selectedEdges - 选中的边
 * @property {string[]} addedItems - 新增选中项
 * @property {string[]} removedItems - 移除选中项
 * @property {Object} selectionBounds - 选择区域边界
 * @property {string} selectionMode - 选择模式
 */
export const SelectionEventType = {
  ...BaseEventType,
  selectedNodes: 'string[]',
  selectedEdges: 'string[]',
  addedItems: 'string[]',
  removedItems: 'string[]',
  selectionBounds: 'Object',
  selectionMode: 'string'
};

/**
 * 配置事件类型定义
 * @typedef {Object} ConfigEvent
 * @extends BaseEvent
 * @property {string} configKey - 配置键
 * @property {*} oldValue - 旧值
 * @property {*} newValue - 新值
 * @property {string} configPath - 配置路径
 * @property {Object} configContext - 配置上下文
 * @property {boolean} isValid - 配置是否有效
 * @property {string[]} validationErrors - 验证错误
 */
export const ConfigEventType = {
  ...BaseEventType,
  configKey: 'string',
  oldValue: 'any',
  newValue: 'any',
  configPath: 'string',
  configContext: 'Object',
  isValid: 'boolean',
  validationErrors: 'string[]'
};

/**
 * 性能事件类型定义
 * @typedef {Object} PerformanceEvent
 * @extends BaseEvent
 * @property {string} metricType - 指标类型
 * @property {number} value - 指标值
 * @property {string} unit - 单位
 * @property {string} level - 性能级别
 * @property {Object} thresholds - 阈值配置
 * @property {Object} context - 性能上下文
 * @property {string[]} recommendations - 优化建议
 */
export const PerformanceEventType = {
  ...BaseEventType,
  metricType: 'string',
  value: 'number',
  unit: 'string',
  level: 'string',
  thresholds: 'Object',
  context: 'Object',
  recommendations: 'string[]'
};

/**
 * 系统事件类型定义
 * @typedef {Object} SystemEvent
 * @extends BaseEvent
 * @property {string} component - 组件名称
 * @property {string} action - 动作类型
 * @property {Object} systemState - 系统状态
 * @property {Object} error - 错误信息
 * @property {string} version - 版本信息
 * @property {Object} environment - 环境信息
 */
export const SystemEventType = {
  ...BaseEventType,
  component: 'string',
  action: 'string',
  systemState: 'Object',
  error: 'Object',
  version: 'string',
  environment: 'Object'
};

/**
 * 事件监听器类型定义
 * @typedef {Object} EventListener
 * @property {string} id - 监听器ID
 * @property {EventType|EventType[]} eventTypes - 监听的事件类型
 * @property {Function} handler - 事件处理函数
 * @property {Object} options - 监听器选项
 * @property {boolean} options.once - 是否只执行一次
 * @property {boolean} options.passive - 是否为被动监听器
 * @property {boolean} options.capture - 是否在捕获阶段执行
 * @property {EventPriority} priority - 优先级
 * @property {Object} context - 上下文
 * @property {boolean} enabled - 是否启用
 * @property {Date} createdAt - 创建时间
 * @property {Date} lastTriggered - 最后触发时间
 * @property {number} triggerCount - 触发次数
 */
export const EventListenerType = {
  id: 'string',
  eventTypes: 'EventType|EventType[]',
  handler: 'Function',
  options: {
    once: 'boolean',
    passive: 'boolean',
    capture: 'boolean'
  },
  priority: 'EventPriority',
  context: 'Object',
  enabled: 'boolean',
  createdAt: 'Date',
  lastTriggered: 'Date',
  triggerCount: 'number'
};

/**
 * 事件队列项类型定义
 * @typedef {Object} EventQueueItem
 * @property {string} id - 队列项ID
 * @property {BaseEvent} event - 事件对象
 * @property {EventPriority} priority - 优先级
 * @property {Date} queuedAt - 入队时间
 * @property {Date} scheduledAt - 计划执行时间
 * @property {number} retryCount - 重试次数
 * @property {number} maxRetries - 最大重试次数
 * @property {EventStatus} status - 状态
 * @property {Object} result - 执行结果
 * @property {Object} error - 错误信息
 */
export const EventQueueItemType = {
  id: 'string',
  event: 'BaseEvent',
  priority: 'EventPriority',
  queuedAt: 'Date',
  scheduledAt: 'Date',
  retryCount: 'number',
  maxRetries: 'number',
  status: 'EventStatus',
  result: 'Object',
  error: 'Object'
};

/**
 * 事件过滤器类型定义
 * @typedef {Object} EventFilter
 * @property {string} id - 过滤器ID
 * @property {string} name - 过滤器名称
 * @property {EventType[]} eventTypes - 过滤的事件类型
 * @property {Function} predicate - 过滤谓词函数
 * @property {Object} conditions - 过滤条件
 * @property {boolean} enabled - 是否启用
 * @property {EventPriority} minPriority - 最小优先级
 * @property {string[]} tags - 标签
 * @property {Object} metadata - 元数据
 */
export const EventFilterType = {
  id: 'string',
  name: 'string',
  eventTypes: 'EventType[]',
  predicate: 'Function',
  conditions: 'Object',
  enabled: 'boolean',
  minPriority: 'EventPriority',
  tags: 'string[]',
  metadata: 'Object'
};

/**
 * 事件统计类型定义
 * @typedef {Object} EventStats
 * @property {number} totalEvents - 总事件数
 * @property {Object} eventCounts - 各类型事件计数
 * @property {Object} priorityCounts - 各优先级事件计数
 * @property {number} averageProcessingTime - 平均处理时间
 * @property {number} errorCount - 错误事件数
 * @property {number} cancelledCount - 取消事件数
 * @property {Date} lastReset - 最后重置时间
 * @property {Object} performance - 性能统计
 * @property {number} performance.minProcessingTime - 最小处理时间
 * @property {number} performance.maxProcessingTime - 最大处理时间
 * @property {number} performance.totalProcessingTime - 总处理时间
 */
export const EventStatsType = {
  totalEvents: 'number',
  eventCounts: 'Object',
  priorityCounts: 'Object',
  averageProcessingTime: 'number',
  errorCount: 'number',
  cancelledCount: 'number',
  lastReset: 'Date',
  performance: {
    minProcessingTime: 'number',
    maxProcessingTime: 'number',
    totalProcessingTime: 'number'
  }
};

/**
 * 事件类型验证工具类
 */
export class EventTypeValidator {
  /**
   * 验证基础事件
   * @param {*} event - 待验证的事件
   * @returns {boolean} 是否有效
   */
  static isValidBaseEvent(event) {
    return event &&
           typeof event.id === 'string' &&
           event.id.length > 0 &&
           Object.values(EventType).includes(event.type) &&
           event.timestamp instanceof Date &&
           Object.values(EventPhase).includes(event.phase) &&
           typeof event.bubbles === 'boolean' &&
           typeof event.cancelable === 'boolean';
  }

  /**
   * 验证事件监听器
   * @param {*} listener - 待验证的监听器
   * @returns {boolean} 是否有效
   */
  static isValidEventListener(listener) {
    return listener &&
           typeof listener.id === 'string' &&
           listener.id.length > 0 &&
           (Object.values(EventType).includes(listener.eventTypes) ||
            (Array.isArray(listener.eventTypes) && 
             listener.eventTypes.every(type => Object.values(EventType).includes(type)))) &&
           typeof listener.handler === 'function' &&
           Object.values(EventPriority).includes(listener.priority);
  }

  /**
   * 验证事件队列项
   * @param {*} queueItem - 待验证的队列项
   * @returns {boolean} 是否有效
   */
  static isValidEventQueueItem(queueItem) {
    return queueItem &&
           typeof queueItem.id === 'string' &&
           queueItem.id.length > 0 &&
           this.isValidBaseEvent(queueItem.event) &&
           Object.values(EventPriority).includes(queueItem.priority) &&
           queueItem.queuedAt instanceof Date &&
           typeof queueItem.retryCount === 'number' &&
           queueItem.retryCount >= 0 &&
           Object.values(EventStatus).includes(queueItem.status);
  }

  /**
   * 验证事件过滤器
   * @param {*} filter - 待验证的过滤器
   * @returns {boolean} 是否有效
   */
  static isValidEventFilter(filter) {
    return filter &&
           typeof filter.id === 'string' &&
           filter.id.length > 0 &&
           typeof filter.name === 'string' &&
           Array.isArray(filter.eventTypes) &&
           filter.eventTypes.every(type => Object.values(EventType).includes(type)) &&
           typeof filter.predicate === 'function' &&
           typeof filter.enabled === 'boolean';
  }
}

/**
 * 事件工具函数
 */
export class EventUtils {
  /**
   * 创建基础事件
   * @param {EventType} type - 事件类型
   * @param {*} target - 事件目标
   * @param {Object} data - 事件数据
   * @param {Object} options - 可选配置
   * @returns {BaseEvent} 基础事件
   */
  static createBaseEvent(type, target, data = {}, options = {}) {
    return {
      id: options.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      target,
      currentTarget: target,
      phase: EventPhase.AT_TARGET,
      bubbles: options.bubbles !== false,
      cancelable: options.cancelable !== false,
      defaultPrevented: false,
      propagationStopped: false,
      priority: options.priority || EventPriority.NORMAL,
      data,
      metadata: options.metadata || {}
    };
  }

  /**
   * 创建布局事件
   * @param {EventType} type - 事件类型
   * @param {string} algorithmType - 算法类型
   * @param {Object} layoutConfig - 布局配置
   * @param {Object} options - 可选配置
   * @returns {LayoutEvent} 布局事件
   */
  static createLayoutEvent(type, algorithmType, layoutConfig, options = {}) {
    const baseEvent = this.createBaseEvent(type, null, {}, options);
    return {
      ...baseEvent,
      algorithmType,
      layoutConfig,
      layoutResult: options.layoutResult || null,
      duration: options.duration || 0,
      performance: options.performance || {},
      affectedNodes: options.affectedNodes || [],
      affectedEdges: options.affectedEdges || []
    };
  }

  /**
   * 创建节点事件
   * @param {EventType} type - 事件类型
   * @param {string} nodeId - 节点ID
   * @param {Object} node - 节点对象
   * @param {Object} options - 可选配置
   * @returns {NodeEvent} 节点事件
   */
  static createNodeEvent(type, nodeId, node, options = {}) {
    const baseEvent = this.createBaseEvent(type, node, {}, options);
    return {
      ...baseEvent,
      nodeId,
      node,
      oldData: options.oldData || null,
      newData: options.newData || null,
      position: options.position || { x: 0, y: 0 },
      bounds: options.bounds || null,
      style: options.style || {},
      connectedEdges: options.connectedEdges || []
    };
  }

  /**
   * 创建边事件
   * @param {EventType} type - 事件类型
   * @param {string} edgeId - 边ID
   * @param {Object} edge - 边对象
   * @param {Object} options - 可选配置
   * @returns {EdgeEvent} 边事件
   */
  static createEdgeEvent(type, edgeId, edge, options = {}) {
    const baseEvent = this.createBaseEvent(type, edge, {}, options);
    return {
      ...baseEvent,
      edgeId,
      edge,
      sourceNodeId: options.sourceNodeId || '',
      targetNodeId: options.targetNodeId || '',
      oldData: options.oldData || null,
      newData: options.newData || null,
      path: options.path || null,
      style: options.style || {}
    };
  }

  /**
   * 判断事件是否匹配过滤器
   * @param {BaseEvent} event - 事件对象
   * @param {EventFilter} filter - 过滤器
   * @returns {boolean} 是否匹配
   */
  static matchesFilter(event, filter) {
    if (!filter.enabled) return false;
    
    // 检查事件类型
    if (!filter.eventTypes.includes(event.type)) return false;
    
    // 检查优先级
    if (filter.minPriority) {
      const priorityOrder = [EventPriority.LOW, EventPriority.NORMAL, EventPriority.HIGH, EventPriority.URGENT];
      const eventPriorityIndex = priorityOrder.indexOf(event.priority);
      const minPriorityIndex = priorityOrder.indexOf(filter.minPriority);
      if (eventPriorityIndex < minPriorityIndex) return false;
    }
    
    // 执行自定义谓词
    if (filter.predicate && !filter.predicate(event)) return false;
    
    return true;
  }

  /**
   * 计算事件优先级权重
   * @param {EventPriority} priority - 事件优先级
   * @returns {number} 权重值
   */
  static getPriorityWeight(priority) {
    const weights = {
      [EventPriority.LOW]: 1,
      [EventPriority.NORMAL]: 2,
      [EventPriority.HIGH]: 3,
      [EventPriority.URGENT]: 4
    };
    return weights[priority] || 2;
  }

  /**
   * 格式化事件信息
   * @param {BaseEvent} event - 事件对象
   * @returns {string} 格式化后的字符串
   */
  static formatEventInfo(event) {
    const timestamp = event.timestamp.toISOString();
    const priority = event.priority.toUpperCase();
    return `[${timestamp}] ${priority} ${event.type} (${event.id})`;
  }
}

/**
 * 默认导出所有事件类型定义
 */
export default {
  EventType,
  EventPriority,
  EventPhase,
  EventStatus,
  BaseEventType,
  LayoutEventType,
  NodeEventType,
  EdgeEventType,
  ViewEventType,
  SelectionEventType,
  ConfigEventType,
  PerformanceEventType,
  SystemEventType,
  EventListenerType,
  EventQueueItemType,
  EventFilterType,
  EventStatsType,
  EventUtils
};