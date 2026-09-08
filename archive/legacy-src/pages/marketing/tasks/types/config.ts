/**
 * 营销画布系统配置类型定义
 * 定义所有配置相关的类型，确保配置管理的类型安全
 */

import type { Position, Size, NodeType, LayoutAlgorithm, LayoutDirection } from './core'

/**
 * 应用配置接口
 */
export interface AppConfig {
  // 应用基础信息
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  
  // 环境配置
  environment: 'development' | 'production' | 'test'
  debug: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace'
  
  // API配置
  api: ApiConfig
  
  // 画布配置
  canvas: CanvasConfig
  
  // 主题配置
  theme: ThemeConfig
  
  // 性能配置
  performance: PerformanceConfig
  
  // 存储配置
  storage: StorageConfig
  
  // 国际化配置
  i18n: I18nConfig
  
  // 插件配置
  plugins: PluginConfig[]
  
  // 功能开关
  features: FeatureFlags
}

/**
 * API配置接口
 */
export interface ApiConfig {
  baseURL: string
  timeout: number
  retryCount: number
  retryDelay: number
  headers: Record<string, string>
  interceptors: {
    request?: boolean
    response?: boolean
  }
}

/**
 * 画布配置接口
 */
export interface CanvasConfig {
  // 画布尺寸
  width: number
  height: number
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
  
  // 视口配置
  viewport: ViewportConfig
  
  // 网格配置
  grid: GridConfig
  
  // 吸附配置
  snap: SnapConfig
  
  // 选择配置
  selection: SelectionConfig
  
  // 拖拽配置
  drag: DragConfig
  
  // 缩放配置
  zoom: ZoomConfig
  
  // 连接配置
  connection: ConnectionConfig
  
  // 布局配置
  layout: LayoutConfig
  
  // 动画配置
  animation: AnimationConfig
  
  // 渲染配置
  rendering: RenderingConfig
  
  // 交互配置
  interaction: InteractionConfig
  
  // 键盘快捷键配置
  keyboard: KeyboardConfig
  
  // 右键菜单配置
  contextMenu: ContextMenuConfig
  
  // 工具栏配置
  toolbar: ToolbarConfig
  
  // 小地图配置
  minimap: MinimapConfig
}

/**
 * 视口配置接口
 */
export interface ViewportConfig {
  x: number
  y: number
  zoom: number
  minZoom: number
  maxZoom: number
  zoomStep: number
  centerOnLoad: boolean
  fitToContent: boolean
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

/**
 * 网格配置接口
 */
export interface GridConfig {
  enabled: boolean
  visible: boolean
  size: number
  color: string
  opacity: number
  style: 'dot' | 'line' | 'cross'
  snapToGrid: boolean
  snapThreshold: number
}

/**
 * 吸附配置接口
 */
export interface SnapConfig {
  enabled: boolean
  threshold: number
  snapToGrid: boolean
  snapToNodes: boolean
  snapToConnections: boolean
  snapToGuides: boolean
  showGuides: boolean
  guideColor: string
  guideOpacity: number
}

/**
 * 选择配置接口
 */
export interface SelectionConfig {
  enabled: boolean
  multiple: boolean
  rubberBand: boolean
  rubberBandColor: string
  rubberBandOpacity: number
  selectedNodeColor: string
  selectedConnectionColor: string
  hoverNodeColor: string
  hoverConnectionColor: string
}

/**
 * 拖拽配置接口
 */
export interface DragConfig {
  enabled: boolean
  threshold: number
  ghostOpacity: number
  showPreview: boolean
  constrainToCanvas: boolean
  autoScroll: boolean
  autoScrollSpeed: number
  autoScrollThreshold: number
}

/**
 * 缩放配置接口
 */
export interface ZoomConfig {
  enabled: boolean
  wheel: boolean
  pinch: boolean
  doubleClick: boolean
  minZoom: number
  maxZoom: number
  step: number
  sensitivity: number
  centerOnCursor: boolean
}

/**
 * 连接配置接口
 */
export interface ConnectionConfig {
  enabled: boolean
  type: 'straight' | 'curved' | 'orthogonal' | 'bezier'
  strokeWidth: number
  strokeColor: string
  strokeDasharray?: string
  arrowSize: number
  arrowColor: string
  hoverStrokeWidth: number
  hoverStrokeColor: string
  selectedStrokeWidth: number
  selectedStrokeColor: string
  allowSelfConnection: boolean
  allowMultipleConnections: boolean
  validateConnection: boolean
  showConnectionPoints: boolean
  connectionPointSize: number
  connectionPointColor: string
}

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  algorithm: LayoutAlgorithm
  direction: LayoutDirection
  spacing: {
    horizontal: number
    vertical: number
  }
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  alignment: 'start' | 'center' | 'end'
  animate: boolean
  animationDuration: number
  animationEasing: string
}

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  enabled: boolean
  duration: number
  easing: string
  fps: number
  useRequestAnimationFrame: boolean
  transitions: {
    node: boolean
    connection: boolean
    viewport: boolean
    selection: boolean
  }
}

/**
 * 渲染配置接口
 */
export interface RenderingConfig {
  engine: 'canvas' | 'svg' | 'webgl'
  pixelRatio: number
  antialias: boolean
  alpha: boolean
  premultipliedAlpha: boolean
  preserveDrawingBuffer: boolean
  powerPreference: 'default' | 'high-performance' | 'low-power'
  failIfMajorPerformanceCaveat: boolean
  desynchronized: boolean
  willReadFrequently: boolean
}

/**
 * 交互配置接口
 */
export interface InteractionConfig {
  enabled: boolean
  clickToSelect: boolean
  doubleClickToEdit: boolean
  rightClickForContextMenu: boolean
  dragToMove: boolean
  dragToSelect: boolean
  wheelToZoom: boolean
  keyboardShortcuts: boolean
  touchGestures: boolean
  hoverEffects: boolean
  tooltips: boolean
}

/**
 * 键盘配置接口
 */
export interface KeyboardConfig {
  enabled: boolean
  shortcuts: Record<string, string>
  modifiers: {
    ctrl: boolean
    alt: boolean
    shift: boolean
    meta: boolean
  }
}

/**
 * 右键菜单配置接口
 */
export interface ContextMenuConfig {
  enabled: boolean
  items: ContextMenuItem[]
  showIcons: boolean
  showShortcuts: boolean
  maxWidth: number
  maxHeight: number
}

/**
 * 右键菜单项接口
 */
export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  visible?: boolean
  separator?: boolean
  submenu?: ContextMenuItem[]
  action?: () => void
}

/**
 * 工具栏配置接口
 */
export interface ToolbarConfig {
  enabled: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  items: ToolbarItem[]
  showLabels: boolean
  showIcons: boolean
  size: 'small' | 'medium' | 'large'
}

/**
 * 工具栏项接口
 */
export interface ToolbarItem {
  id: string
  type: 'button' | 'separator' | 'group' | 'dropdown'
  label?: string
  icon?: string
  tooltip?: string
  disabled?: boolean
  visible?: boolean
  active?: boolean
  items?: ToolbarItem[]
  action?: () => void
}

/**
 * 小地图配置接口
 */
export interface MinimapConfig {
  enabled: boolean
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  width: number
  height: number
  zoom: number
  showViewport: boolean
  viewportColor: string
  backgroundColor: string
  borderColor: string
  borderWidth: number
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  name: string
  mode: 'light' | 'dark' | 'auto'
  colors: ColorPalette
  fonts: FontConfig
  spacing: SpacingConfig
  shadows: ShadowConfig
  borders: BorderConfig
  animations: ThemeAnimationConfig
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
  text: {
    primary: string
    secondary: string
    disabled: string
  }
  border: {
    primary: string
    secondary: string
    disabled: string
  }
  node: {
    background: string
    border: string
    text: string
    selected: string
    hover: string
  }
  connection: {
    stroke: string
    selected: string
    hover: string
  }
}

/**
 * 字体配置接口
 */
export interface FontConfig {
  family: string
  size: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
  weight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

/**
 * 间距配置接口
 */
export interface SpacingConfig {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

/**
 * 阴影配置接口
 */
export interface ShadowConfig {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

/**
 * 边框配置接口
 */
export interface BorderConfig {
  width: {
    thin: string
    normal: string
    thick: string
  }
  radius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  style: {
    solid: string
    dashed: string
    dotted: string
  }
}

/**
 * 主题动画配置接口
 */
export interface ThemeAnimationConfig {
  duration: {
    fast: string
    normal: string
    slow: string
  }
  easing: {
    linear: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
}

/**
 * 性能配置接口
 */
export interface PerformanceConfig {
  // 渲染性能
  rendering: {
    maxFPS: number
    enableVSync: boolean
    enableGPUAcceleration: boolean
    enableWebGL: boolean
    enableOffscreenCanvas: boolean
  }
  
  // 内存管理
  memory: {
    maxCacheSize: number
    gcThreshold: number
    enableObjectPooling: boolean
    enableTextureCompression: boolean
  }
  
  // 批处理
  batching: {
    enabled: boolean
    batchSize: number
    batchTimeout: number
  }
  
  // 虚拟化
  virtualization: {
    enabled: boolean
    threshold: number
    bufferSize: number
  }
  
  // 节流和防抖
  throttling: {
    render: number
    resize: number
    scroll: number
    mousemove: number
  }
  
  // 监控
  monitoring: {
    enabled: boolean
    sampleRate: number
    reportThreshold: number
  }
}

/**
 * 存储配置接口
 */
export interface StorageConfig {
  // 存储类型
  type: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory'
  
  // 存储键前缀
  prefix: string
  
  // 自动保存
  autoSave: {
    enabled: boolean
    interval: number
    maxVersions: number
  }
  
  // 压缩
  compression: {
    enabled: boolean
    algorithm: 'gzip' | 'lz4' | 'brotli'
    level: number
  }
  
  // 加密
  encryption: {
    enabled: boolean
    algorithm: 'AES' | 'ChaCha20'
    keySize: number
  }
  
  // 缓存
  cache: {
    enabled: boolean
    maxSize: number
    ttl: number
  }
}

/**
 * 国际化配置接口
 */
export interface I18nConfig {
  // 默认语言
  defaultLocale: string
  
  // 支持的语言
  locales: string[]
  
  // 语言包加载方式
  loadingStrategy: 'eager' | 'lazy' | 'async'
  
  // 默认语言
  defaultLocale: string
  
  // 命名空间
  namespaces: string[]
  
  // 插值配置
  interpolation: {
    prefix: string
    suffix: string
    escapeValue: boolean
  }
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  // 插件名称
  name: string
  
  // 插件版本
  version: string
  
  // 是否启用
  enabled: boolean
  
  // 插件选项
  options: Record<string, any>
  
  // 依赖插件
  dependencies: string[]
  
  // 加载优先级
  priority: number
}

/**
 * 功能开关接口
 */
export interface FeatureFlags {
  // 实验性功能
  experimental: {
    webGL: boolean
    webAssembly: boolean
    offscreenCanvas: boolean
    sharedArrayBuffer: boolean
  }
  
  // 调试功能
  debug: {
    showFPS: boolean
    showMemoryUsage: boolean
    showRenderTime: boolean
    enableDevTools: boolean
  }
  
  // 可访问性功能
  accessibility: {
    screenReader: boolean
    highContrast: boolean
    reducedMotion: boolean
    keyboardNavigation: boolean
  }
  
  // 协作功能
  collaboration: {
    realTimeSync: boolean
    comments: boolean
    presence: boolean
    history: boolean
  }
}

/**
 * 节点类型配置接口
 */
export interface NodeTypeConfig {
  type: NodeType
  label: string
  description?: string
  icon?: string
  category: string
  defaultSize: Size
  minSize: Size
  maxSize: Size
  resizable: boolean
  deletable: boolean
  connectable: boolean
  ports: NodePortConfig[]
  style: NodeStyleConfig
  validation: NodeValidationConfig
  properties: NodePropertyConfig[]
}

/**
 * 节点端口配置接口
 */
export interface NodePortConfig {
  id: string
  label: string
  type: 'input' | 'output'
  position: 'top' | 'right' | 'bottom' | 'left'
  offset: number
  required: boolean
  multiple: boolean
  dataType: string
  validation: PortValidationConfig
}

/**
 * 端口验证配置接口
 */
export interface PortValidationConfig {
  required: boolean
  dataType: string
  allowedConnections: string[]
  maxConnections: number
  customValidator?: (value: any) => boolean
}

/**
 * 节点样式配置接口
 */
export interface NodeStyleConfig {
  backgroundColor: string
  borderColor: string
  borderWidth: number
  borderRadius: number
  textColor: string
  fontSize: number
  fontWeight: string
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  shadow: {
    enabled: boolean
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
}

/**
 * 节点验证配置接口
 */
export interface NodeValidationConfig {
  required: string[]
  rules: ValidationRule[]
  customValidator?: (node: any) => ValidationResult
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  field: string
  type: 'required' | 'string' | 'number' | 'email' | 'url' | 'regex' | 'custom'
  message: string
  params?: any
  validator?: (value: any) => boolean
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  field: string
  message: string
  code: string
  value?: any
}

/**
 * 节点属性配置接口
 */
export interface NodePropertyConfig {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'color' | 'date' | 'time' | 'datetime'
  defaultValue?: any
  required: boolean
  readonly: boolean
  visible: boolean
  placeholder?: string
  description?: string
  validation: PropertyValidationConfig
  options?: PropertyOption[]
  dependencies?: PropertyDependency[]
}

/**
 * 属性验证配置接口
 */
export interface PropertyValidationConfig {
  required: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  customValidator?: (value: any) => boolean
}

/**
 * 属性选项接口
 */
export interface PropertyOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
}

/**
 * 属性依赖接口
 */
export interface PropertyDependency {
  field: string
  value: any
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require'
}

/**
 * 工作流配置接口
 */
export interface WorkflowConfig {
  // 工作流基础信息
  id: string
  name: string
  description?: string
  version: string
  
  // 工作流设置
  settings: {
    autoSave: boolean
    autoLayout: boolean
    validation: boolean
    execution: boolean
  }
  
  // 节点类型配置
  nodeTypes: NodeTypeConfig[]
  
  // 连接规则
  connectionRules: ConnectionRule[]
  
  // 执行配置
  execution: ExecutionConfig
  
  // 变量配置
  variables: VariableConfig[]
  
  // 触发器配置
  triggers: TriggerConfig[]
}

/**
 * 连接规则接口
 */
export interface ConnectionRule {
  sourceType: string
  targetType: string
  sourcePort?: string
  targetPort?: string
  allowed: boolean
  message?: string
}

/**
 * 执行配置接口
 */
export interface ExecutionConfig {
  mode: 'sequential' | 'parallel' | 'conditional'
  timeout: number
  retryCount: number
  retryDelay: number
  errorHandling: 'stop' | 'continue' | 'retry'
  logging: boolean
  monitoring: boolean
}

/**
 * 变量配置接口
 */
export interface VariableConfig {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  defaultValue?: any
  description?: string
  scope: 'global' | 'workflow' | 'node'
  readonly: boolean
}

/**
 * 触发器配置接口
 */
export interface TriggerConfig {
  type: 'manual' | 'scheduled' | 'event' | 'webhook'
  name: string
  description?: string
  enabled: boolean
  config: Record<string, any>
}

/**
 * 默认配置常量
 */
export const DEFAULT_APP_CONFIG: Partial<AppConfig> = {
  environment: 'development',
  debug: false,
  logLevel: 'info'
}

export const DEFAULT_CANVAS_CONFIG: Partial<CanvasConfig> = {
  width: 1920,
  height: 1080,
  minWidth: 800,
  maxWidth: 4096,
  minHeight: 600,
  maxHeight: 4096
}

export const DEFAULT_THEME_CONFIG: Partial<ThemeConfig> = {
  name: 'default',
  mode: 'light'
}

export const DEFAULT_PERFORMANCE_CONFIG: Partial<PerformanceConfig> = {
  rendering: {
    maxFPS: 60,
    enableVSync: true,
    enableGPUAcceleration: true,
    enableWebGL: true,
    enableOffscreenCanvas: false
  }
}

/**
 * 配置类型守卫函数
 */
export function isAppConfig(config: any): config is AppConfig {
  return config && typeof config.name === 'string' && typeof config.version === 'string'
}

export function isCanvasConfig(config: any): config is CanvasConfig {
  return config && typeof config.width === 'number' && typeof config.height === 'number'
}

export function isThemeConfig(config: any): config is ThemeConfig {
  return config && typeof config.name === 'string' && typeof config.mode === 'string'
}

export function isNodeTypeConfig(config: any): config is NodeTypeConfig {
  return config && typeof config.type === 'string' && typeof config.label === 'string'
}