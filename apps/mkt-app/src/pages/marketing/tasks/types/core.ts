/**
 * 营销画布系统核心数据类型定义
 * 定义所有核心数据结构，确保类型安全
 */

/**
 * 基础坐标接口
 */
export interface Position {
  x: number
  y: number
}

/**
 * 基础尺寸接口
 */
export interface Size {
  width: number
  height: number
}

/**
 * 基础矩形接口
 */
export interface Rectangle extends Position, Size {}

/**
 * 节点基础接口
 */
export interface BaseNode {
  id: string
  type: NodeType
  x: number
  y: number
  width?: number
  height?: number
  label?: string
  data?: Record<string, any>
  style?: NodeStyle
  ports?: NodePort[]
  metadata?: NodeMetadata
}

/**
 * 节点类型枚举
 */
export enum NodeType {
  START = 'start',
  AUDIENCE_SPLIT = 'audience-split',
  EVENT_SPLIT = 'event-split',
  SMS = 'sms',
  AI_CALL = 'ai-call',
  MANUAL_CALL = 'manual-call',
  AB_TEST = 'ab-test',
  WAIT = 'wait',
  BENEFIT = 'benefit'
}

/**
 * 节点样式接口
 */
export interface NodeStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  borderRadius?: number
  opacity?: number
  shadow?: boolean
  className?: string
}

/**
 * 节点端口接口
 */
export interface NodePort {
  id: string
  type: 'input' | 'output'
  position: 'top' | 'right' | 'bottom' | 'left'
  offset?: number
  style?: PortStyle
  connected?: boolean
}

/**
 * 端口样式接口
 */
export interface PortStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  radius?: number
  visible?: boolean
}

/**
 * 节点元数据接口
 */
export interface NodeMetadata {
  createTime?: number
  updateTime?: number
  version?: string
  author?: string
  description?: string
  tags?: string[]
  complexity?: number
  category?: string
}

/**
 * 连接线接口
 */
export interface Connection {
  id: string
  sourceId: string
  targetId: string
  sourcePortId?: string
  targetPortId?: string
  style?: ConnectionStyle
  data?: Record<string, any>
  metadata?: ConnectionMetadata
}

/**
 * 连接线样式接口
 */
export interface ConnectionStyle {
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
  opacity?: number
  animated?: boolean
  marker?: MarkerStyle
  className?: string
}

/**
 * 标记样式接口
 */
export interface MarkerStyle {
  type: 'arrow' | 'circle' | 'diamond'
  size?: number
  fill?: string
  stroke?: string
}

/**
 * 连接线元数据接口
 */
export interface ConnectionMetadata {
  createTime?: number
  updateTime?: number
  condition?: string
  probability?: number
  weight?: number
  description?: string
}

/**
 * 画布状态接口
 */
export interface CanvasState {
  nodes: BaseNode[]
  connections: Connection[]
  viewport: Viewport
  selection: Selection
  history: HistoryState
  mode: CanvasMode
  config: CanvasConfig
}

/**
 * 视口接口
 */
export interface Viewport {
  x: number
  y: number
  zoom: number
  width: number
  height: number
}

/**
 * 选择状态接口
 */
export interface Selection {
  nodes: string[]
  connections: string[]
  area?: Rectangle
  mode: SelectionMode
}

/**
 * 选择模式枚举
 */
export enum SelectionMode {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  AREA = 'area'
}

/**
 * 历史状态接口
 */
export interface HistoryState {
  past: CanvasSnapshot[]
  present: CanvasSnapshot
  future: CanvasSnapshot[]
  maxSize: number
  canUndo: boolean
  canRedo: boolean
}

/**
 * 画布快照接口
 */
export interface CanvasSnapshot {
  id: string
  timestamp: number
  nodes: BaseNode[]
  connections: Connection[]
  viewport: Viewport
  description?: string
  type: SnapshotType
}

/**
 * 快照类型枚举
 */
export enum SnapshotType {
  MANUAL = 'manual',
  AUTO = 'auto',
  CHECKPOINT = 'checkpoint'
}

/**
 * 画布模式枚举
 */
export enum CanvasMode {
  EDIT = 'edit',
  VIEW = 'view',
  DEBUG = 'debug',
  STATISTICS = 'statistics'
}

/**
 * 画布配置接口
 */
export interface CanvasConfig {
  grid: GridConfig
  snap: SnapConfig
  layout: LayoutConfig
  interaction: InteractionConfig
  performance: PerformanceConfig
  validation: ValidationConfig
}

/**
 * 网格配置接口
 */
export interface GridConfig {
  enabled: boolean
  size: number
  color: string
  opacity: number
  type: 'dot' | 'line'
}

/**
 * 吸附配置接口
 */
export interface SnapConfig {
  enabled: boolean
  threshold: number
  targets: SnapTarget[]
  visual: boolean
}

/**
 * 吸附目标枚举
 */
export enum SnapTarget {
  GRID = 'grid',
  NODE = 'node',
  PORT = 'port',
  GUIDE = 'guide'
}

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  algorithm: LayoutAlgorithm
  direction: LayoutDirection
  spacing: LayoutSpacing
  alignment: LayoutAlignment
  autoLayout: boolean
}

/**
 * 布局算法枚举
 */
export enum LayoutAlgorithm {
  HIERARCHICAL = 'hierarchical',
  FORCE = 'force',
  CIRCULAR = 'circular',
  GRID = 'grid',
  MANUAL = 'manual'
}

/**
 * 布局方向枚举
 */
export enum LayoutDirection {
  TOP_BOTTOM = 'TB',
  BOTTOM_TOP = 'BT',
  LEFT_RIGHT = 'LR',
  RIGHT_LEFT = 'RL'
}

/**
 * 布局间距接口
 */
export interface LayoutSpacing {
  node: number
  level: number
  branch: number
}

/**
 * 布局对齐枚举
 */
export enum LayoutAlignment {
  START = 'start',
  CENTER = 'center',
  END = 'end'
}

/**
 * 交互配置接口
 */
export interface InteractionConfig {
  drag: DragConfig
  zoom: ZoomConfig
  selection: SelectionConfig
  connection: ConnectionConfig
}

/**
 * 拖拽配置接口
 */
export interface DragConfig {
  enabled: boolean
  threshold: number
  constrainToParent: boolean
  ghostNode: boolean
}

/**
 * 缩放配置接口
 */
export interface ZoomConfig {
  enabled: boolean
  min: number
  max: number
  step: number
  wheelSensitivity: number
}

/**
 * 选择配置接口
 */
export interface SelectionConfig {
  enabled: boolean
  multiple: boolean
  area: boolean
  rubberBand: boolean
}

/**
 * 连接配置接口
 */
export interface ConnectionConfig {
  enabled: boolean
  validation: boolean
  preview: boolean
  autoRoute: boolean
  allowSelfLoop: boolean
  allowMultiple: boolean
}

/**
 * 性能配置接口
 */
export interface PerformanceConfig {
  virtualization: boolean
  batchUpdate: boolean
  debounceTime: number
  maxNodes: number
  maxConnections: number
}

/**
 * 验证配置接口
 */
export interface ValidationConfig {
  enabled: boolean
  realTime: boolean
  strict: boolean
  rules: ValidationRule[]
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  id: string
  name: string
  type: ValidationType
  severity: ValidationSeverity
  message: string
  validator: (data: any) => boolean
}

/**
 * 验证类型枚举
 */
export enum ValidationType {
  NODE = 'node',
  CONNECTION = 'connection',
  GRAPH = 'graph',
  DATA = 'data'
}

/**
 * 验证严重程度枚举
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * 事件数据接口
 */
export interface EventData {
  type: string
  target?: any
  source?: any
  data?: any
  timestamp: number
  preventDefault?: () => void
  stopPropagation?: () => void
}

/**
 * 操作结果接口
 */
export interface OperationResult<T = any> {
  success: boolean
  data?: T
  error?: Error
  message?: string
  code?: string
}

/**
 * 批量操作结果接口
 */
export interface BatchOperationResult<T = any> {
  success: boolean
  results: OperationResult<T>[]
  successCount: number
  errorCount: number
  errors: Error[]
}

/**
 * 查询条件接口
 */
export interface QueryCondition {
  field: string
  operator: QueryOperator
  value: any
  logic?: QueryLogic
}

/**
 * 查询操作符枚举
 */
export enum QueryOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  REGEX = 'regex'
}

/**
 * 查询逻辑枚举
 */
export enum QueryLogic {
  AND = 'and',
  OR = 'or',
  NOT = 'not'
}

/**
 * 排序条件接口
 */
export interface SortCondition {
  field: string
  direction: SortDirection
}

/**
 * 排序方向枚举
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * 分页信息接口
 */
export interface Pagination {
  page: number
  size: number
  total: number
  totalPages: number
}

/**
 * 查询结果接口
 */
export interface QueryResult<T = any> {
  data: T[]
  pagination: Pagination
  total: number
}

/**
 * 导出选项接口
 */
export interface ExportOptions {
  format: ExportFormat
  quality?: number
  scale?: number
  background?: string
  padding?: number
  includeMetadata?: boolean
}

/**
 * 导出格式枚举
 */
export enum ExportFormat {
  PNG = 'png',
  JPEG = 'jpeg',
  SVG = 'svg',
  PDF = 'pdf',
  JSON = 'json'
}

/**
 * 导入选项接口
 */
export interface ImportOptions {
  format: ImportFormat
  merge?: boolean
  validate?: boolean
  transform?: (data: any) => any
}

/**
 * 导入格式枚举
 */
export enum ImportFormat {
  JSON = 'json',
  XML = 'xml',
  CSV = 'csv'
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  name: string
  colors: ColorPalette
  fonts: FontConfig
  spacing: SpacingConfig
  shadows: ShadowConfig
}

/**
 * 颜色调色板接口
 */
export interface ColorPalette {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  text: string
  border: string
}

/**
 * 字体配置接口
 */
export interface FontConfig {
  family: string
  size: FontSizeConfig
  weight: FontWeightConfig
}

/**
 * 字体大小配置接口
 */
export interface FontSizeConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

/**
 * 字体粗细配置接口
 */
export interface FontWeightConfig {
  light: number
  normal: number
  medium: number
  bold: number
}

/**
 * 间距配置接口
 */
export interface SpacingConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

/**
 * 阴影配置接口
 */
export interface ShadowConfig {
  sm: string
  md: string
  lg: string
  xl: string
}

/**
 * 类型守卫函数
 */
export function isNode(obj: any): obj is BaseNode {
  return obj && typeof obj.id === 'string' && typeof obj.type === 'string'
}

export function isConnection(obj: any): obj is Connection {
  return obj && typeof obj.id === 'string' && typeof obj.sourceId === 'string' && typeof obj.targetId === 'string'
}

export function isPosition(obj: any): obj is Position {
  return obj && typeof obj.x === 'number' && typeof obj.y === 'number'
}

export function isRectangle(obj: any): obj is Rectangle {
  return isPosition(obj) && typeof obj.width === 'number' && typeof obj.height === 'number'
}

/**
 * 默认配置常量
 */
export const DEFAULT_NODE_SIZE: Size = {
  width: 120,
  height: 80
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  enabled: true,
  size: 20,
  color: '#e0e0e0',
  opacity: 0.5,
  type: 'dot'
}

export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  threshold: 10,
  targets: [SnapTarget.GRID, SnapTarget.NODE],
  visual: true
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  algorithm: LayoutAlgorithm.HIERARCHICAL,
  direction: LayoutDirection.TOP_BOTTOM,
  spacing: {
    node: 50,
    level: 100,
    branch: 30
  },
  alignment: LayoutAlignment.CENTER,
  autoLayout: false
}