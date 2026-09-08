/**
 * 营销画布系统事件类型定义
 * 定义所有事件相关的类型，确保事件处理的类型安全
 */

import type { BaseNode, Connection, Position, Rectangle } from './core'

/**
 * 基础事件接口
 */
export interface BaseEvent {
  type: string
  timestamp: number
  source?: string
  target?: any
  data?: any
  preventDefault?: () => void
  stopPropagation?: () => void
  stopImmediatePropagation?: () => void
}

/**
 * 画布事件类型枚举
 */
export enum CanvasEventType {
  // 画布生命周期事件
  CANVAS_INITIALIZED = 'canvas:initialized',
  CANVAS_DESTROYED = 'canvas:destroyed',
  CANVAS_READY = 'canvas:ready',
  CANVAS_ERROR = 'canvas:error',

  // 画布状态事件
  CANVAS_STATE_CHANGED = 'canvas:state-changed',
  CANVAS_MODE_CHANGED = 'canvas:mode-changed',
  CANVAS_CONFIG_CHANGED = 'canvas:config-changed',

  // 视口事件
  VIEWPORT_CHANGED = 'viewport:changed',
  ZOOM_CHANGED = 'zoom:changed',
  PAN_CHANGED = 'pan:changed',

  // 节点事件
  NODE_CREATED = 'node:created',
  NODE_UPDATED = 'node:updated',
  NODE_DELETED = 'node:deleted',
  NODE_SELECTED = 'node:selected',
  NODE_DESELECTED = 'node:deselected',
  NODE_MOVED = 'node:moved',
  NODE_RESIZED = 'node:resized',
  NODE_CLICKED = 'node:clicked',
  NODE_DOUBLE_CLICKED = 'node:double-clicked',
  NODE_RIGHT_CLICKED = 'node:right-clicked',
  NODE_HOVER = 'node:hover',
  NODE_UNHOVER = 'node:unhover',
  NODE_DRAG_START = 'node:drag-start',
  NODE_DRAG = 'node:drag',
  NODE_DRAG_END = 'node:drag-end',

  // 连接事件
  CONNECTION_CREATED = 'connection:created',
  CONNECTION_UPDATED = 'connection:updated',
  CONNECTION_DELETED = 'connection:deleted',
  CONNECTION_SELECTED = 'connection:selected',
  CONNECTION_DESELECTED = 'connection:deselected',
  CONNECTION_CLICKED = 'connection:clicked',
  CONNECTION_DOUBLE_CLICKED = 'connection:double-clicked',
  CONNECTION_RIGHT_CLICKED = 'connection:right-clicked',
  CONNECTION_HOVER = 'connection:hover',
  CONNECTION_UNHOVER = 'connection:unhover',

  // 连接创建过程事件
  CONNECTION_START = 'connection:start',
  CONNECTION_PREVIEW = 'connection:preview',
  CONNECTION_END = 'connection:end',
  CONNECTION_CANCEL = 'connection:cancel',

  // 选择事件
  SELECTION_CHANGED = 'selection:changed',
  SELECTION_CLEARED = 'selection:cleared',
  SELECTION_AREA_START = 'selection:area-start',
  SELECTION_AREA_MOVE = 'selection:area-move',
  SELECTION_AREA_END = 'selection:area-end',

  // 历史事件
  HISTORY_CHANGED = 'history:changed',
  HISTORY_UNDO = 'history:undo',
  HISTORY_REDO = 'history:redo',
  SNAPSHOT_CREATED = 'snapshot:created',
  SNAPSHOT_RESTORED = 'snapshot:restored',

  // 布局事件
  LAYOUT_START = 'layout:start',
  LAYOUT_END = 'layout:end',
  LAYOUT_CHANGED = 'layout:changed',

  // 验证事件
  VALIDATION_START = 'validation:start',
  VALIDATION_END = 'validation:end',
  VALIDATION_ERROR = 'validation:error',
  VALIDATION_WARNING = 'validation:warning',

  // 导入导出事件
  EXPORT_START = 'export:start',
  EXPORT_END = 'export:end',
  EXPORT_ERROR = 'export:error',
  IMPORT_START = 'import:start',
  IMPORT_END = 'import:end',
  IMPORT_ERROR = 'import:error',

  // 存储事件
  SAVE_START = 'save:start',
  SAVE_END = 'save:end',
  SAVE_ERROR = 'save:error',
  LOAD_START = 'load:start',
  LOAD_END = 'load:end',
  LOAD_ERROR = 'load:error',
  AUTO_SAVE = 'auto-save',

  // 性能事件
  PERFORMANCE_MARK = 'performance:mark',
  PERFORMANCE_MEASURE = 'performance:measure',
  PERFORMANCE_WARNING = 'performance:warning',

  // 键盘事件
  KEY_DOWN = 'key:down',
  KEY_UP = 'key:up',
  KEY_PRESS = 'key:press',

  // 鼠标事件
  MOUSE_DOWN = 'mouse:down',
  MOUSE_UP = 'mouse:up',
  MOUSE_MOVE = 'mouse:move',
  MOUSE_CLICK = 'mouse:click',
  MOUSE_DOUBLE_CLICK = 'mouse:double-click',
  MOUSE_RIGHT_CLICK = 'mouse:right-click',
  MOUSE_WHEEL = 'mouse:wheel',
  MOUSE_ENTER = 'mouse:enter',
  MOUSE_LEAVE = 'mouse:leave',

  // 触摸事件
  TOUCH_START = 'touch:start',
  TOUCH_MOVE = 'touch:move',
  TOUCH_END = 'touch:end',
  TOUCH_CANCEL = 'touch:cancel',

  // 自定义事件
  CUSTOM = 'custom'
}

/**
 * 画布事件接口
 */
export interface CanvasEvent extends BaseEvent {
  type: CanvasEventType
}

/**
 * 节点事件数据接口
 */
export interface NodeEventData {
  node: BaseNode
  previousNode?: BaseNode
  position?: Position
  size?: { width: number; height: number }
  delta?: Position
}

/**
 * 节点事件接口
 */
export interface NodeEvent extends CanvasEvent {
  type: CanvasEventType.NODE_CREATED | 
        CanvasEventType.NODE_UPDATED | 
        CanvasEventType.NODE_DELETED | 
        CanvasEventType.NODE_SELECTED | 
        CanvasEventType.NODE_DESELECTED | 
        CanvasEventType.NODE_MOVED | 
        CanvasEventType.NODE_RESIZED | 
        CanvasEventType.NODE_CLICKED | 
        CanvasEventType.NODE_DOUBLE_CLICKED | 
        CanvasEventType.NODE_RIGHT_CLICKED | 
        CanvasEventType.NODE_HOVER | 
        CanvasEventType.NODE_UNHOVER | 
        CanvasEventType.NODE_DRAG_START | 
        CanvasEventType.NODE_DRAG | 
        CanvasEventType.NODE_DRAG_END
  data: NodeEventData
}

/**
 * 连接事件数据接口
 */
export interface ConnectionEventData {
  connection: Connection
  previousConnection?: Connection
  sourceNode?: BaseNode
  targetNode?: BaseNode
}

/**
 * 连接事件接口
 */
export interface ConnectionEvent extends CanvasEvent {
  type: CanvasEventType.CONNECTION_CREATED | 
        CanvasEventType.CONNECTION_UPDATED | 
        CanvasEventType.CONNECTION_DELETED | 
        CanvasEventType.CONNECTION_SELECTED | 
        CanvasEventType.CONNECTION_DESELECTED | 
        CanvasEventType.CONNECTION_CLICKED | 
        CanvasEventType.CONNECTION_DOUBLE_CLICKED | 
        CanvasEventType.CONNECTION_RIGHT_CLICKED | 
        CanvasEventType.CONNECTION_HOVER | 
        CanvasEventType.CONNECTION_UNHOVER
  data: ConnectionEventData
}

/**
 * 连接创建事件数据接口
 */
export interface ConnectionCreationEventData {
  sourceNode?: BaseNode
  targetNode?: BaseNode
  sourcePort?: string
  targetPort?: string
  position?: Position
  preview?: boolean
}

/**
 * 连接创建事件接口
 */
export interface ConnectionCreationEvent extends CanvasEvent {
  type: CanvasEventType.CONNECTION_START | 
        CanvasEventType.CONNECTION_PREVIEW | 
        CanvasEventType.CONNECTION_END | 
        CanvasEventType.CONNECTION_CANCEL
  data: ConnectionCreationEventData
}

/**
 * 选择事件数据接口
 */
export interface SelectionEventData {
  selectedNodes: string[]
  selectedConnections: string[]
  previousSelectedNodes?: string[]
  previousSelectedConnections?: string[]
  area?: Rectangle
}

/**
 * 选择事件接口
 */
export interface SelectionEvent extends CanvasEvent {
  type: CanvasEventType.SELECTION_CHANGED | 
        CanvasEventType.SELECTION_CLEARED | 
        CanvasEventType.SELECTION_AREA_START | 
        CanvasEventType.SELECTION_AREA_MOVE | 
        CanvasEventType.SELECTION_AREA_END
  data: SelectionEventData
}

/**
 * 视口事件数据接口
 */
export interface ViewportEventData {
  x: number
  y: number
  zoom: number
  width: number
  height: number
  previousX?: number
  previousY?: number
  previousZoom?: number
}

/**
 * 视口事件接口
 */
export interface ViewportEvent extends CanvasEvent {
  type: CanvasEventType.VIEWPORT_CHANGED | 
        CanvasEventType.ZOOM_CHANGED | 
        CanvasEventType.PAN_CHANGED
  data: ViewportEventData
}

/**
 * 历史事件数据接口
 */
export interface HistoryEventData {
  canUndo: boolean
  canRedo: boolean
  historySize: number
  snapshotId?: string
  description?: string
}

/**
 * 历史事件接口
 */
export interface HistoryEvent extends CanvasEvent {
  type: CanvasEventType.HISTORY_CHANGED | 
        CanvasEventType.HISTORY_UNDO | 
        CanvasEventType.HISTORY_REDO | 
        CanvasEventType.SNAPSHOT_CREATED | 
        CanvasEventType.SNAPSHOT_RESTORED
  data: HistoryEventData
}

/**
 * 布局事件数据接口
 */
export interface LayoutEventData {
  algorithm?: string
  options?: Record<string, any>
  affectedNodes?: string[]
  duration?: number
}

/**
 * 布局事件接口
 */
export interface LayoutEvent extends CanvasEvent {
  type: CanvasEventType.LAYOUT_START | 
        CanvasEventType.LAYOUT_END | 
        CanvasEventType.LAYOUT_CHANGED
  data: LayoutEventData
}

/**
 * 验证事件数据接口
 */
export interface ValidationEventData {
  target?: string
  targetType?: 'node' | 'connection' | 'canvas' | 'workflow'
  errors?: Array<{ field: string; message: string }>
  warnings?: Array<{ field: string; message: string }>
  isValid?: boolean
  duration?: number
}

/**
 * 验证事件接口
 */
export interface ValidationEvent extends CanvasEvent {
  type: CanvasEventType.VALIDATION_START | 
        CanvasEventType.VALIDATION_END | 
        CanvasEventType.VALIDATION_ERROR | 
        CanvasEventType.VALIDATION_WARNING
  data: ValidationEventData
}

/**
 * 导入导出事件数据接口
 */
export interface ImportExportEventData {
  format?: string
  filename?: string
  size?: number
  duration?: number
  error?: Error
  progress?: number
}

/**
 * 导入导出事件接口
 */
export interface ImportExportEvent extends CanvasEvent {
  type: CanvasEventType.EXPORT_START | 
        CanvasEventType.EXPORT_END | 
        CanvasEventType.EXPORT_ERROR | 
        CanvasEventType.IMPORT_START | 
        CanvasEventType.IMPORT_END | 
        CanvasEventType.IMPORT_ERROR
  data: ImportExportEventData
}

/**
 * 存储事件数据接口
 */
export interface StorageEventData {
  id?: string
  name?: string
  size?: number
  duration?: number
  error?: Error
  autoSave?: boolean
}

/**
 * 存储事件接口
 */
export interface StorageEvent extends CanvasEvent {
  type: CanvasEventType.SAVE_START | 
        CanvasEventType.SAVE_END | 
        CanvasEventType.SAVE_ERROR | 
        CanvasEventType.LOAD_START | 
        CanvasEventType.LOAD_END | 
        CanvasEventType.LOAD_ERROR | 
        CanvasEventType.AUTO_SAVE
  data: StorageEventData
}

/**
 * 性能事件数据接口
 */
export interface PerformanceEventData {
  name?: string
  value?: number
  unit?: string
  threshold?: number
  category?: string
  details?: Record<string, any>
}

/**
 * 性能事件接口
 */
export interface PerformanceEvent extends CanvasEvent {
  type: CanvasEventType.PERFORMANCE_MARK | 
        CanvasEventType.PERFORMANCE_MEASURE | 
        CanvasEventType.PERFORMANCE_WARNING
  data: PerformanceEventData
}

/**
 * 键盘事件数据接口
 */
export interface KeyboardEventData {
  key: string
  code: string
  keyCode: number
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  repeat: boolean
}

/**
 * 键盘事件接口
 */
export interface KeyboardEvent extends CanvasEvent {
  type: CanvasEventType.KEY_DOWN | 
        CanvasEventType.KEY_UP | 
        CanvasEventType.KEY_PRESS
  data: KeyboardEventData
}

/**
 * 鼠标事件数据接口
 */
export interface MouseEventData {
  x: number
  y: number
  clientX: number
  clientY: number
  button: number
  buttons: number
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  deltaX?: number
  deltaY?: number
  deltaZ?: number
  deltaMode?: number
}

/**
 * 鼠标事件接口
 */
export interface MouseEvent extends CanvasEvent {
  type: CanvasEventType.MOUSE_DOWN | 
        CanvasEventType.MOUSE_UP | 
        CanvasEventType.MOUSE_MOVE | 
        CanvasEventType.MOUSE_CLICK | 
        CanvasEventType.MOUSE_DOUBLE_CLICK | 
        CanvasEventType.MOUSE_RIGHT_CLICK | 
        CanvasEventType.MOUSE_WHEEL | 
        CanvasEventType.MOUSE_ENTER | 
        CanvasEventType.MOUSE_LEAVE
  data: MouseEventData
}

/**
 * 触摸事件数据接口
 */
export interface TouchEventData {
  touches: Array<{
    identifier: number
    clientX: number
    clientY: number
    pageX: number
    pageY: number
    screenX: number
    screenY: number
    radiusX: number
    radiusY: number
    rotationAngle: number
    force: number
  }>
  changedTouches: Array<{
    identifier: number
    clientX: number
    clientY: number
    pageX: number
    pageY: number
    screenX: number
    screenY: number
    radiusX: number
    radiusY: number
    rotationAngle: number
    force: number
  }>
  targetTouches: Array<{
    identifier: number
    clientX: number
    clientY: number
    pageX: number
    pageY: number
    screenX: number
    screenY: number
    radiusX: number
    radiusY: number
    rotationAngle: number
    force: number
  }>
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

/**
 * 触摸事件接口
 */
export interface TouchEvent extends CanvasEvent {
  type: CanvasEventType.TOUCH_START | 
        CanvasEventType.TOUCH_MOVE | 
        CanvasEventType.TOUCH_END | 
        CanvasEventType.TOUCH_CANCEL
  data: TouchEventData
}

/**
 * 自定义事件数据接口
 */
export interface CustomEventData {
  [key: string]: any
}

/**
 * 自定义事件接口
 */
export interface CustomEvent extends CanvasEvent {
  type: CanvasEventType.CUSTOM
  customType: string
  data: CustomEventData
}

/**
 * 事件处理器类型
 */
export type EventHandler<T extends CanvasEvent = CanvasEvent> = (event: T) => void | Promise<void>

/**
 * 事件监听器配置接口
 */
export interface EventListenerConfig {
  once?: boolean
  passive?: boolean
  capture?: boolean
  priority?: number
}

/**
 * 事件订阅接口
 */
export interface EventSubscription {
  id: string
  eventType: string
  handler: EventHandler
  config: EventListenerConfig
  active: boolean
}

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  /**
   * 添加事件监听器
   */
  on<T extends CanvasEvent>(eventType: string, handler: EventHandler<T>, config?: EventListenerConfig): string

  /**
   * 添加一次性事件监听器
   */
  once<T extends CanvasEvent>(eventType: string, handler: EventHandler<T>, config?: EventListenerConfig): string

  /**
   * 移除事件监听器
   */
  off(subscriptionId: string): boolean

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(eventType?: string): void

  /**
   * 发射事件
   */
  emit<T extends CanvasEvent>(event: T): Promise<void>

  /**
   * 获取监听器数量
   */
  listenerCount(eventType: string): number

  /**
   * 获取所有事件类型
   */
  eventNames(): string[]

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(n: number): void

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number
}

/**
 * 事件总线接口
 */
export interface EventBus extends EventEmitter {
  /**
   * 创建命名空间
   */
  namespace(name: string): EventBus

  /**
   * 销毁事件总线
   */
  destroy(): void

  /**
   * 获取事件历史
   */
  getHistory(eventType?: string, limit?: number): CanvasEvent[]

  /**
   * 清空事件历史
   */
  clearHistory(): void

  /**
   * 启用事件记录
   */
  enableHistory(): void

  /**
   * 禁用事件记录
   */
  disableHistory(): void
}

/**
 * 事件中间件接口
 */
export interface EventMiddleware {
  /**
   * 处理事件
   */
  handle<T extends CanvasEvent>(event: T, next: (event: T) => Promise<void>): Promise<void>
}

/**
 * 事件过滤器接口
 */
export interface EventFilter {
  /**
   * 过滤事件
   */
  filter<T extends CanvasEvent>(event: T): boolean
}

/**
 * 事件转换器接口
 */
export interface EventTransformer {
  /**
   * 转换事件
   */
  transform<T extends CanvasEvent, R extends CanvasEvent>(event: T): R
}

/**
 * 事件聚合器接口
 */
export interface EventAggregator {
  /**
   * 聚合事件
   */
  aggregate<T extends CanvasEvent>(events: T[]): T[]
}

/**
 * 事件工厂接口
 */
export interface EventFactory {
  /**
   * 创建节点事件
   */
  createNodeEvent(type: CanvasEventType, data: NodeEventData): NodeEvent

  /**
   * 创建连接事件
   */
  createConnectionEvent(type: CanvasEventType, data: ConnectionEventData): ConnectionEvent

  /**
   * 创建选择事件
   */
  createSelectionEvent(type: CanvasEventType, data: SelectionEventData): SelectionEvent

  /**
   * 创建视口事件
   */
  createViewportEvent(type: CanvasEventType, data: ViewportEventData): ViewportEvent

  /**
   * 创建历史事件
   */
  createHistoryEvent(type: CanvasEventType, data: HistoryEventData): HistoryEvent

  /**
   * 创建自定义事件
   */
  createCustomEvent(customType: string, data: CustomEventData): CustomEvent
}

/**
 * 事件类型守卫函数
 */
export function isNodeEvent(event: CanvasEvent): event is NodeEvent {
  return event.type.startsWith('node:')
}

export function isConnectionEvent(event: CanvasEvent): event is ConnectionEvent {
  return event.type.startsWith('connection:')
}

export function isSelectionEvent(event: CanvasEvent): event is SelectionEvent {
  return event.type.startsWith('selection:')
}

export function isViewportEvent(event: CanvasEvent): event is ViewportEvent {
  return event.type.startsWith('viewport:') || event.type.startsWith('zoom:') || event.type.startsWith('pan:')
}

export function isHistoryEvent(event: CanvasEvent): event is HistoryEvent {
  return event.type.startsWith('history:') || event.type.startsWith('snapshot:')
}

export function isKeyboardEvent(event: CanvasEvent): event is KeyboardEvent {
  return event.type.startsWith('key:')
}

export function isMouseEvent(event: CanvasEvent): event is MouseEvent {
  return event.type.startsWith('mouse:')
}

export function isTouchEvent(event: CanvasEvent): event is TouchEvent {
  return event.type.startsWith('touch:')
}

export function isCustomEvent(event: CanvasEvent): event is CustomEvent {
  return event.type === CanvasEventType.CUSTOM
}