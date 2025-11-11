/**
 * 营销画布事件类型统一定义
 * 规范所有画布相关事件，避免硬编码字符串
 * 基于交互监听动作评估文档中的分类
 */

/**
 * 画布基础事件类型
 * 对应画布背景、整体操作等事件
 */
export const CanvasBaseEvents = {
  // 画布生命周期
  CANVAS_INITIALIZED: 'canvas:initialized',
  CANVAS_DESTROYED: 'canvas:destroyed',
  CANVAS_RESIZED: 'canvas:resized',
  
  // 画布状态变更
  CANVAS_STATE_CHANGED: 'canvas:state-changed',
  CANVAS_MODE_CHANGED: 'canvas:mode-changed',
  CANVAS_READONLY_CHANGED: 'canvas:readonly-changed',
  
  // 画布交互
  CANVAS_CLICKED: 'canvas:clicked',
  CANVAS_DOUBLE_CLICKED: 'canvas:double-clicked',
  CANVAS_RIGHT_CLICKED: 'canvas:right-clicked',
  CANVAS_FOCUSED: 'canvas:focused',
  CANVAS_BLURRED: 'canvas:blurred'
} as const

/**
 * 画布视图控制事件类型
 * 对应缩放、平移、居中、自适应等视图操作
 */
export const CanvasViewEvents = {
  // 缩放相关
  VIEW_ZOOMED: 'view:zoomed',
  VIEW_ZOOM_IN: 'view:zoom-in',
  VIEW_ZOOM_OUT: 'view:zoom-out',
  VIEW_ZOOM_TO_FIT: 'view:zoom-to-fit',
  VIEW_ZOOM_TO_NODE: 'view:zoom-to-node',
  
  // 平移相关
  VIEW_PANNED: 'view:panned',
  VIEW_CENTERED: 'view:centered',
  VIEW_RESET: 'view:reset',
  
  // 滚动相关
  VIEW_SCROLLED: 'view:scrolled',
  VIEW_SCROLLED_TO_NODE: 'view:scrolled-to-node'
} as const

/**
 * 节点事件类型
 * 对应节点的创建、删除、移动、选择等操作
 */
export const NodeEvents = {
  // 节点生命周期
  NODE_CREATED: 'node:created',
  NODE_DELETED: 'node:deleted',
  NODE_CLONED: 'node:cloned',
  NODE_RESTORED: 'node:restored',
  
  // 节点状态
  NODE_SELECTED: 'node:selected',
  NODE_DESELECTED: 'node:deselected',
  NODE_FOCUSED: 'node:focused',
  NODE_BLURRED: 'node:blurred',
  NODE_HIGHLIGHTED: 'node:highlighted',
  NODE_UNHIGHLIGHTED: 'node:unhighlighted',
  
  // 节点交互
  NODE_CLICKED: 'node:clicked',
  NODE_DOUBLE_CLICKED: 'node:double-clicked',
  NODE_RIGHT_CLICKED: 'node:right-clicked',
  NODE_HOVERED: 'node:hovered',
  NODE_UNHOVERED: 'node:unhovered',
  
  // 节点变换
  NODE_MOVED: 'node:moved',
  NODE_RESIZED: 'node:resized',
  NODE_ROTATED: 'node:rotated',
  
  // 节点配置
  NODE_CONFIG_OPENED: 'node:config-opened',
  NODE_CONFIG_CLOSED: 'node:config-closed',
  NODE_CONFIG_SAVED: 'node:config-saved',
  NODE_CONFIG_CHANGED: 'node:config-changed',
  
  // 节点类型特定事件
  START_NODE_CREATED: 'node:start-node-created',
  END_NODE_CREATED: 'node:end-node-created',
  AUDIENCE_SPLIT_NODE_CREATED: 'node:audience-split-node-created',
  MANUAL_CALL_NODE_CREATED: 'node:manual-call-node-created',
  SMS_NODE_CREATED: 'node:sms-node-created',
  AB_TEST_NODE_CREATED: 'node:ab-test-node-created',
  BENEFIT_NODE_CREATED: 'node:benefit-node-created'
} as const

/**
 * 连接线事件类型
 * 对应节点之间的连接线操作
 */
export const EdgeEvents = {
  // 连接线生命周期
  EDGE_CREATED: 'edge:created',
  EDGE_DELETED: 'edge:deleted',
  EDGE_RESTORED: 'edge:restored',
  
  // 连接线状态
  EDGE_SELECTED: 'edge:selected',
  EDGE_DESELECTED: 'edge:deselected',
  EDGE_HIGHLIGHTED: 'edge:highlighted',
  EDGE_UNHIGHLIGHTED: 'edge:unhighlighted',
  
  // 连接线交互
  EDGE_CLICKED: 'edge:clicked',
  EDGE_DOUBLE_CLICKED: 'edge:double-clicked',
  EDGE_RIGHT_CLICKED: 'edge:right-clicked',
  EDGE_HOVERED: 'edge:hovered',
  EDGE_UNHOVERED: 'edge:unhovered',
  
  // 连接线更新
  EDGE_UPDATED: 'edge:updated',
  EDGE_RECONNECTED: 'edge:reconnected',
  EDGE_ROUTING_CHANGED: 'edge:routing-changed',
  
  // 连接线验证
  EDGE_VALIDATION_STARTED: 'edge:validation-started',
  EDGE_VALIDATION_COMPLETED: 'edge:validation-completed',
  EDGE_VALIDATION_FAILED: 'edge:validation-failed'
} as const

/**
 * 预览线事件类型
 * 对应拖拽过程中的预览连接线
 */
export const PreviewLineEvents = {
  // 预览线生命周期
  PREVIEW_LINE_CREATED: 'preview-line:created',
  PREVIEW_LINE_DELETED: 'preview-line:deleted',
  PREVIEW_LINE_UPDATED: 'preview-line:updated',
  
  // 预览线状态
  PREVIEW_LINE_STARTED: 'preview-line:started',
  PREVIEW_LINE_ENDED: 'preview-line:ended',
  PREVIEW_LINE_CANCELLED: 'preview-line:cancelled',
  PREVIEW_LINE_CONFIRMED: 'preview-line:confirmed',
  
  // 预览线交互
  PREVIEW_LINE_HOVERED: 'preview-line:hovered',
  PREVIEW_LINE_UNHOVERED: 'preview-line:unhovered',
  
  // 预览线验证
  PREVIEW_LINE_VALIDATION_STARTED: 'preview-line:validation-started',
  PREVIEW_LINE_VALIDATION_COMPLETED: 'preview-line:validation-completed',
  PREVIEW_LINE_VALIDATION_FAILED: 'preview-line:validation-failed',
  
  // 预览线吸附
  PREVIEW_LINE_SNAP_STARTED: 'preview-line:snap-started',
  PREVIEW_LINE_SNAP_COMPLETED: 'preview-line:snap-completed',
  PREVIEW_LINE_SNAP_FAILED: 'preview-line:snap-failed'
} as const

/**
 * 端口事件类型
 * 对应节点的输入输出端口
 */
export const PortEvents = {
  // 端口交互
  PORT_CLICKED: 'port:clicked',
  PORT_DOUBLE_CLICKED: 'port:double-clicked',
  PORT_HOVERED: 'port:hovered',
  PORT_UNHOVERED: 'port:unhovered',
  
  // 端口连接
  PORT_CONNECTION_STARTED: 'port:connection-started',
  PORT_CONNECTION_COMPLETED: 'port:connection-completed',
  PORT_CONNECTION_CANCELLED: 'port:connection-cancelled',
  
  // 端口状态
  PORT_HIGHLIGHTED: 'port:highlighted',
  PORT_UNHIGHLIGHTED: 'port:unhighlighted',
  PORT_VALIDATED: 'port:validated',
  PORT_VALIDATION_FAILED: 'port:validation-failed'
} as const

/**
 * 键盘事件类型
 * 对应键盘快捷键操作
 */
export const KeyboardEvents = {
  // 基础键盘事件
  KEY_DOWN: 'keyboard:key-down',
  KEY_UP: 'keyboard:key-up',
  KEY_PRESS: 'keyboard:key-press',
  
  // 快捷键操作
  SHORTCUT_DELETE: 'shortcut:delete',
  SHORTCUT_COPY: 'shortcut:copy',
  SHORTCUT_PASTE: 'shortcut:paste',
  SHORTCUT_CUT: 'shortcut:cut',
  SHORTCUT_UNDO: 'shortcut:undo',
  SHORTCUT_REDO: 'shortcut:redo',
  SHORTCUT_SELECT_ALL: 'shortcut:select-all',
  SHORTCUT_DUPLICATE: 'shortcut:duplicate',
  
  // 功能快捷键
  SHORTCUT_SAVE: 'shortcut:save',
  SHORTCUT_ZOOM_IN: 'shortcut:zoom-in',
  SHORTCUT_ZOOM_OUT: 'shortcut:zoom-out',
  SHORTCUT_ZOOM_RESET: 'shortcut:zoom-reset',
  SHORTCUT_ZOOM_FIT: 'shortcut:zoom-fit',
  
  // 编辑快捷键
  SHORTCUT_FIND: 'shortcut:find',
  SHORTCUT_REPLACE: 'shortcut:replace',
  SHORTCUT_REFRESH: 'shortcut:refresh',
  
  // 调试快捷键
  SHORTCUT_DEBUG_TOGGLE: 'shortcut:debug-toggle',
  SHORTCUT_DEBUG_INSPECT: 'shortcut:debug-inspect',
  SHORTCUT_DEBUG_PERFORMANCE: 'shortcut:debug-performance'
} as const

/**
 * 鼠标事件类型
 * 对应鼠标操作事件
 */
export const MouseEvents = {
  // 基础鼠标事件
  MOUSE_DOWN: 'mouse:mouse-down',
  MOUSE_UP: 'mouse:mouse-up',
  MOUSE_CLICK: 'mouse:mouse-click',
  MOUSE_DOUBLE_CLICK: 'mouse:double-click',
  MOUSE_RIGHT_CLICK: 'mouse:right-click',
  MOUSE_MOVE: 'mouse:mouse-move',
  MOUSE_ENTER: 'mouse:mouse-enter',
  MOUSE_LEAVE: 'mouse:mouse-leave',
  
  // 拖拽事件
  DRAG_STARTED: 'mouse:drag-started',
  DRAG_MOVED: 'mouse:drag-moved',
  DRAG_ENDED: 'mouse:drag-ended',
  DRAG_CANCELLED: 'mouse:drag-cancelled',
  
  // 滚轮事件
  WHEEL_SCROLLED: 'mouse:wheel-scrolled',
  WHEEL_ZOOMED: 'mouse:wheel-zoomed',
  
  // 多点触控
  TOUCH_STARTED: 'mouse:touch-started',
  TOUCH_MOVED: 'mouse:touch-moved',
  TOUCH_ENDED: 'mouse:touch-ended'
} as const

/**
 * 选择操作事件类型
 * 对应多选、框选等选择操作
 */
export const SelectionEvents = {
  // 选择状态变更
  SELECTION_STARTED: 'selection:started',
  SELECTION_ENDED: 'selection:ended',
  SELECTION_CLEARED: 'selection:cleared',
  SELECTION_CHANGED: 'selection:changed',
  
  // 多选操作
  MULTI_SELECTION_STARTED: 'selection:multi-started',
  MULTI_SELECTION_ENDED: 'selection:multi-ended',
  MULTI_SELECTION_UPDATED: 'selection:multi-updated',
  
  // 框选操作
  BOX_SELECTION_STARTED: 'selection:box-started',
  BOX_SELECTION_MOVED: 'selection:box-moved',
  BOX_SELECTION_ENDED: 'selection:box-ended',
  
  // 选择验证
  SELECTION_VALIDATED: 'selection:validated',
  SELECTION_VALIDATION_FAILED: 'selection:validation-failed'
} as const

/**
 * 历史记录事件类型
 * 对应撤销、重做等历史操作
 */
export const HistoryEvents = {
  // 历史状态变更
  HISTORY_CHANGED: 'history:changed',
  HISTORY_CLEARED: 'history:cleared',
  
  // 撤销重做
  UNDO_PERFORMED: 'history:undo-performed',
  REDO_PERFORMED: 'history:redo-performed',
  UNDO_FAILED: 'history:undo-failed',
  REDO_FAILED: 'history:redo-failed',
  
  // 历史记录管理
  HISTORY_STATE_CAPTURED: 'history:state-captured',
  HISTORY_STATE_RESTORED: 'history:state-restored',
  HISTORY_LIMIT_REACHED: 'history:limit-reached'
} as const

/**
 * 数据操作事件类型
 * 对应导入、导出、保存等数据操作
 */
export const DataEvents = {
  // 数据导入
  DATA_IMPORT_STARTED: 'data:import-started',
  DATA_IMPORT_COMPLETED: 'data:import-completed',
  DATA_IMPORT_FAILED: 'data:import-failed',
  DATA_IMPORT_CANCELLED: 'data:import-cancelled',
  
  // 数据导出
  DATA_EXPORT_STARTED: 'data:export-started',
  DATA_EXPORT_COMPLETED: 'data:export-completed',
  DATA_EXPORT_FAILED: 'data:export-failed',
  
  // 数据保存
  DATA_SAVE_STARTED: 'data:save-started',
  DATA_SAVE_COMPLETED: 'data:save-completed',
  DATA_SAVE_FAILED: 'data:save-failed',
  
  // 数据验证
  DATA_VALIDATION_STARTED: 'data:validation-started',
  DATA_VALIDATION_COMPLETED: 'data:validation-completed',
  DATA_VALIDATION_FAILED: 'data:validation-failed'
} as const

/**
 * 错误处理事件类型
 * 对应各种错误和异常处理
 */
export const ErrorEvents = {
  // 通用错误
  ERROR_OCCURRED: 'error:occurred',
  ERROR_HANDLED: 'error:handled',
  ERROR_UNHANDLED: 'error:unhandled',
  
  // 操作冲突
  OPERATION_CONFLICT_DETECTED: 'error:operation-conflict-detected',
  OPERATION_CONFLICT_RESOLVED: 'error:operation-conflict-resolved',
  
  // 验证错误
  VALIDATION_FAILED: 'error:validation-failed',
  VALIDATION_ERROR: 'error:validation-error',
  
  // 性能错误
  PERFORMANCE_DEGRADED: 'error:performance-degraded',
  MEMORY_WARNING: 'error:memory-warning',
  
  // 网络错误
  NETWORK_ERROR: 'error:network-error',
  NETWORK_TIMEOUT: 'error:network-timeout',
  
  // 系统错误
  SYSTEM_ERROR: 'error:system-error',
  SYSTEM_WARNING: 'error:system-warning'
} as const

/**
 * 性能监控事件类型
 * 对应性能监控和优化相关事件
 */
export const PerformanceEvents = {
  // 性能指标
  PERFORMANCE_MEASURED: 'performance:measured',
  PERFORMANCE_DEGRADED: 'performance:degraded',
  PERFORMANCE_OPTIMIZED: 'performance:optimized',
  
  // 内存监控
  MEMORY_USAGE_MEASURED: 'performance:memory-usage-measured',
  MEMORY_LEAK_DETECTED: 'performance:memory-leak-detected',
  MEMORY_CLEANUP_PERFORMED: 'performance:cleanup-performed',
  
  // 事件处理性能
  EVENT_PROCESSING_SLOW: 'performance:event-processing-slow',
  EVENT_QUEUE_OVERFLOW: 'performance:event-queue-overflow',
  
  // 渲染性能
  RENDER_PERFORMANCE_MEASURED: 'performance:render-measured',
  RENDER_OPTIMIZATION_APPLIED: 'performance:render-optimization-applied'
} as const

/**
 * 所有画布事件类型的统一导出
 */
export const CanvasEventTypes = {
  KEYBOARD: {
    INITIALIZED: 'keyboard:initialized',
    KEY_DOWN: 'keyboard:key-down',
    KEY_UP: 'keyboard:key-up',
    KEY_PRESS: 'keyboard:key-press',
    SHORTCUT_REGISTERED: 'keyboard:shortcut-registered',
    SHORTCUT_UNREGISTERED: 'keyboard:shortcut-unregistered',
    SHORTCUT_UPDATED: 'keyboard:shortcut-updated',
    SHORTCUT_EXECUTED: 'keyboard:shortcut-executed',
    SHORTCUT_FAILED: 'keyboard:shortcut-failed',
    STATE_CHANGED: 'keyboard:state-changed',
    CLEARED: 'keyboard:cleared',
    DESTROYED: 'keyboard:destroyed',
    DELETE_PRESSED: 'keyboard:delete-pressed',
    UNDO_PRESSED: 'keyboard:undo-pressed',
    REDO_PRESSED: 'keyboard:redo-pressed',
    SELECT_ALL_PRESSED: 'keyboard:select-all-pressed',
    COPY_PRESSED: 'keyboard:copy-pressed',
    PASTE_PRESSED: 'keyboard:paste-pressed',
    DEBUG_PRESSED: 'keyboard:debug-pressed'
  },
  MOUSE: {
    INITIALIZED: 'mouse:initialized',
    DOWN: 'mouse:mouse-down',
    MOVE: 'mouse:mouse-move',
    UP: 'mouse:mouse-up',
    CLICK: 'mouse:mouse-click',
    DBL_CLICK: 'mouse:double-click',
    ENTER: 'mouse:mouse-enter',
    LEAVE: 'mouse:mouse-leave',
    // 兼容别名（旧订阅使用的命名）
    MOUSE_DOWN: 'mouse:mouse-down',
    MOUSE_MOVE: 'mouse:mouse-move',
    MOUSE_UP: 'mouse:mouse-up',
    MOUSE_CLICK: 'mouse:mouse-click',
    MOUSE_DOUBLE_CLICK: 'mouse:double-click',
    MOUSE_ENTER: 'mouse:mouse-enter',
    MOUSE_LEAVE: 'mouse:mouse-leave',
    DRAG_START: 'mouse:drag-start',
    DRAG_MOVE: 'mouse:drag-move',
    DRAG_END: 'mouse:drag-end',
    DRAG_FAILED: 'mouse:drag-failed',
    HANDLER_FAILED: 'mouse:handler-failed',
    HANDLER_REMOVED: 'mouse:handler-removed',
    STATE_CHANGED: 'mouse:state-changed',
    CLEARED: 'mouse:cleared',
    DESTROYED: 'mouse:destroyed'
  },
  CANVAS: {
    // 生命周期与状态（与原 CanvasBaseEvents 保持兼容）
    INITIALIZED: 'canvas:initialized',
    DESTROYED: 'canvas:destroyed',
    RESIZED: 'canvas:resized',
    STATE_CHANGED: 'canvas:state-changed',
    MODE_CHANGED: 'canvas:mode-changed',
    READONLY_CHANGED: 'canvas:readonly-changed',
    CLICKED: 'canvas:clicked',
    DOUBLE_CLICKED: 'canvas:double-clicked',
    RIGHT_CLICKED: 'canvas:right-clicked',
    FOCUSED: 'canvas:focused',
    BLURRED: 'canvas:blurred',
    // 统一事件系统扩展
    DRAG_START: 'canvas:drag-start',
    DRAG_MOVE: 'canvas:drag-move',
    DRAG_END: 'canvas:drag-end',
    STATE_UPDATED: 'canvas:state-updated',
    MANAGER_INITIALIZED: 'canvas:manager-initialized',
    MANAGER_DESTROYED: 'canvas:manager-destroyed',
    DELETE_NODES_REQUESTED: 'canvas:delete-nodes-requested'
  },
  HISTORY: {
    UNDO_REQUESTED: 'history:undo-requested',
    REDO_REQUESTED: 'history:redo-requested',
    CLEARED: 'history:cleared'
  },
  SELECTION: {
    SELECT_ALL_REQUESTED: 'selection:select-all-requested',
    NODE_SELECTED: 'selection:node-selected',
    NODE_DESELECTED: 'selection:node-deselected',
    NODES_SELECTED: 'selection:nodes-selected'
  },
  NODE: {
    CLICKED: 'node:clicked',
    MOVED: 'node:moved',
    ADDED: 'node:added',
    REMOVED: 'node:removed'
  },
  CONNECTION: {
    ADDED: 'connection:added',
    REMOVED: 'connection:removed'
  },
  PREVIEW_LINE: {
    GENERATED: 'preview-line:generated',
    REMOVED: 'preview-line:removed',
    // 统一事件系统下的预览线事件（canvas 命名空间），用于映射与兼容
    CANVAS_CREATED: 'canvas:preview-line-created',
    CANVAS_UPDATED: 'canvas:preview-line-updated',
    CANVAS_REMOVED: 'canvas:preview-line-removed',
    CANVAS_STATE_CHANGED: 'canvas:preview-line-state-changed'
  },
  DATA: {
    COPY_REQUESTED: 'data:copy-requested',
    PASTE_REQUESTED: 'data:paste-requested',
    IMPORT_COMPLETED: 'data:import-completed'
  },
  ERROR: {
    EVENT_PROCESSING_FAILED: 'error:event-processing-failed',
    // 兼容旧系统错误与警告事件
    ERROR_OCCURRED: 'error:occurred',
    ERROR_HANDLED: 'error:handled',
    ERROR_UNHANDLED: 'error:unhandled',
    OPERATION_CONFLICT_DETECTED: 'error:operation-conflict-detected',
    SYSTEM_WARNING: 'error:system-warning',
    NETWORK_TIMEOUT: 'error:network-timeout',
    // 预览线冲突错误事件（用于旧事件映射）
    PREVIEW_LINE_CONFLICT: 'error:preview-line-conflict'
  },
  PERFORMANCE: {},
  DEBUG: {
    TOGGLED: 'debug:toggled'
  },
  // 兼容旧的顶层别名（历史代码中存在）
  CANVAS_RESIZED: 'canvas:resized',
  CANVAS_INITIALIZED: 'canvas:initialized',
  CANVAS_DESTROYED: 'canvas:destroyed'
} as const

// 将事件类型统一视为字符串
export type CanvasEventType = string

// 分类映射（从嵌套结构收集）
export const EventCategories = {
  KEYBOARD: Object.values(CanvasEventTypes.KEYBOARD),
  MOUSE: Object.values(CanvasEventTypes.MOUSE),
  CANVAS: Object.values(CanvasEventTypes.CANVAS),
  HISTORY: Object.values(CanvasEventTypes.HISTORY),
  SELECTION: Object.values(CanvasEventTypes.SELECTION),
  NODE: Object.values(CanvasEventTypes.NODE),
  EDGE: [],
  CONNECTION: Object.values(CanvasEventTypes.CONNECTION),
  PREVIEW_LINE: Object.values(CanvasEventTypes.PREVIEW_LINE),
  PORT: [],
  DATA: Object.values(CanvasEventTypes.DATA),
  ERROR: Object.values(CanvasEventTypes.ERROR),
  PERFORMANCE: Object.values(CanvasEventTypes.PERFORMANCE)
} as const

export function getEventCategory(eventType: CanvasEventType): string {
  for (const [category, events] of Object.entries(EventCategories)) {
    if ((events as string[]).includes(eventType)) {
      return category
    }
  }
  return 'UNKNOWN'
}

export function isValidEventType(eventType: string): eventType is CanvasEventType {
  return getAllEventTypes().includes(eventType)
}

export function getAllEventTypes(): CanvasEventType[] {
  const all: string[] = []
  for (const category of Object.values(CanvasEventTypes)) {
    for (const evt of Object.values(category)) {
      all.push(evt as string)
    }
  }
  return all
}

export function getEventTypesByCategory(category: keyof typeof EventCategories): CanvasEventType[] {
  return (EventCategories[category] as string[]) || []
}

export function searchEventTypes(searchTerm: string): CanvasEventType[] {
  const term = searchTerm.toLowerCase()
  return getAllEventTypes().filter(eventType => 
    eventType.toLowerCase().includes(term)
  )
}