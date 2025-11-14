/**
 * 通用节点样式系统
 * 基于设计规范构建的完整样式体系
 * 支持12种节点类型和8种交互状态
 */

// 基础设计常量
export const DESIGN_CONSTANTS = {
  // 黄金比例
  GOLDEN_RATIO: 1.618033988749895,
  
  // 斐波那契数列（前12项）
  FIBONACCI: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
  
  // 基础尺寸单位（基于4px网格系统）
  BASE_UNIT: 4,
  
  // 响应式断点
  BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
    wide: 1440,
    ultrawide: 1920
  }
}

// 颜色系统
export const COLOR_SYSTEM = {
  // 主色调
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // 主色
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A'
  },
  
  // 辅助色
  secondary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A'
  },
  
  // 状态色
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D'
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  },
  
  // 中性色
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712'
  }
}

// 排版系统
export const TYPOGRAPHY_SYSTEM = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
    mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.8125rem',  // 13px
    base: '0.875rem', // 14px
    lg: '0.9375rem',  // 15px
    xl: '1rem',       // 16px
    '2xl': '1.125rem', // 18px
    '3xl': '1.25rem'   // 20px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em'
  }
}

// 动画系统
export const ANIMATION_SYSTEM = {
  duration: {
    fast: 150,   // ms
    normal: 300, // ms
    slow: 500,   // ms
    slower: 700  // ms
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    custom: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  transition: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

// 尺寸系统（基于4px网格）
export const DIMENSION_SYSTEM = {
  // 基础单位
  unit: 4,
  
  // 节点基础尺寸
  node: {
    width: 280,
    minHeight: 96,
    borderRadius: 8,
    borderWidth: 1
  },
  
  // 标题区域
  header: {
    height: 36,
    padding: 12,
    borderRadius: 8
  },
  
  // 内容区域
  content: {
    padding: 12,
    lineHeight: 32,
    minLineHeight: 24,
    borderRadius: 8
  },
  
  // 图标
  icon: {
    width: 28,
    height: 20,
    borderRadius: 6,
    fontSize: 12
  },
  
  // 端口
  port: {
    size: 8,
    radius: 4,
    borderWidth: 1.5,
    hoverScale: 1.2
  },
  
  // 菜单
  menu: {
    dotSize: 3,
    dotSpacing: 6,
    padding: 8,
    itemHeight: 32,
    borderRadius: 6
  }
}

// 12种节点类型配置
export const NODE_TYPE_CONFIGS = {
  start: {
    type: 'start',
    label: '开始',
    icon: 'ST',
    color: 'primary',
    contentLines: 2,
    hasInput: false,
    hasOutput: true,
    actions: ['configure', 'copy']
  },
  
  'crowd-split': {
    type: 'crowd-split',
    label: '人群分流',
    icon: 'CS',
    color: 'secondary',
    contentLines: 'dynamic', // 动态行数
    hasInput: true,
    hasOutput: true,
    actions: ['configure', 'copy', 'debug', 'delete']
  },
  
  'event-split': {
    type: 'event-split',
    label: '事件分流',
    icon: 'ES',
    color: 'warning',
    contentLines: 2,
    hasInput: true,
    hasOutput: true,
    actions: ['configure', 'copy', 'debug', 'delete']
  },
  
  'ab-test': {
    type: 'ab-test',
    label: 'AB实验',
    icon: 'AB',
    color: 'success',
    contentLines: 'dynamic',
    hasInput: true,
    hasOutput: true,
    actions: ['configure', 'copy', 'debug', 'delete']
  },
  
  'ai-call': {
    type: 'ai-call',
    label: 'AI外呼',
    icon: 'AI',
    color: 'primary',
    contentLines: 1,
    hasInput: true,
    hasOutput: true,
    actions: ['configure', 'copy', 'debug', 'delete']
  },
  
  'sms': {
    type: 'sms',
    label: '短信触达',
    icon: 'SM',
    color: 'secondary',
    contentLines: 1,
    hasInput: true,
    hasOutput: true,
    actions: ['configure', 'copy', 'debug', 'delete']
  },
  
  'manual-call': {
    type: 'manual-call',
    label: '人工外呼',
    icon: 'MC',
    color: 'warning',
    contentLines: '1-2', // 1-2行
    hasInput: true,
    hasOutput: true,
    actions: ['configure', 'copy', 'debug', 'delete']
  },
  
  'wait': {
    type: 'wait',
    label: '等待节点',
    icon: 'WA',
    color: 'neutral',
    contentLines: 1,
    hasInput: true,
    hasOutput: true,
    actions: ['configure', 'copy', 'debug', 'delete']
  },
  
  'benefit': {
    type: 'benefit',
    label: '权益节点',
    icon: 'BE',
    color: 'success',
    contentLines: 1,
    hasInput: true,
    hasOutput: true,
    actions: ['configure', 'copy', 'debug', 'delete']
  },
  
  'end': {
    type: 'end',
    label: '结束节点',
    icon: 'EN',
    color: 'error',
    contentLines: 0,
    hasInput: true,
    hasOutput: false,
    actions: ['copy']
  }
}

// 8种交互状态配置
export const INTERACTION_STATES = {
  default: {
    name: '默认',
    styles: {
      borderColor: 'neutral.300',
      borderWidth: 1,
      backgroundColor: 'neutral.0',
      opacity: 1,
      transform: 'none',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  },
  
  hover: {
    name: '悬停',
    styles: {
      borderColor: 'neutral.400',
      borderWidth: 2,
      backgroundColor: 'neutral.50',
      opacity: 1,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  },
  
  focus: {
    name: '聚焦',
    styles: {
      borderColor: 'primary.500',
      borderWidth: 2,
      backgroundColor: 'neutral.50',
      opacity: 1,
      transform: 'none',
      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
    }
  },
  
  selected: {
    name: '选中',
    styles: {
      borderColor: 'secondary.500',
      borderWidth: 2,
      backgroundColor: 'neutral.50',
      opacity: 1,
      transform: 'none',
      boxShadow: '0 8px 16px rgba(59, 130, 246, 0.15)'
    }
  },
  
  active: {
    name: '激活',
    styles: {
      borderColor: 'primary.600',
      borderWidth: 2,
      backgroundColor: 'primary.50',
      opacity: 1,
      transform: 'scale(1.02)',
      boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
    }
  },
  
  disabled: {
    name: '禁用',
    styles: {
      borderColor: 'neutral.200',
      borderWidth: 1,
      backgroundColor: 'neutral.100',
      opacity: 0.5,
      transform: 'none',
      boxShadow: 'none'
    }
  },
  
  dragging: {
    name: '拖拽',
    styles: {
      borderColor: 'primary.500',
      borderWidth: 2,
      backgroundColor: 'neutral.0',
      opacity: 0.8,
      transform: 'rotate(2deg) scale(1.02)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
    }
  },
  
  loading: {
    name: '加载',
    styles: {
      borderColor: 'neutral.300',
      borderWidth: 1,
      backgroundColor: 'neutral.50',
      opacity: 0.8,
      transform: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }
  }
}

// 尺寸变体配置
export const SIZE_VARIANTS = {
  S: {
    name: '小',
    multiplier: 0.8,
    fontSize: '0.75rem',    // 12px
    headerHeight: 28,
    contentLineHeight: 24,
    iconSize: { width: 20, height: 16 },
    portSize: 6
  },
  
  M: {
    name: '中',
    multiplier: 1.0,
    fontSize: '0.8125rem', // 13px
    headerHeight: 36,
    contentLineHeight: 32,
    iconSize: { width: 28, height: 20 },
    portSize: 8
  },
  
  L: {
    name: '大',
    multiplier: 1.2,
    fontSize: '0.875rem',   // 14px
    headerHeight: 44,
    contentLineHeight: 36,
    iconSize: { width: 32, height: 24 },
    portSize: 10
  },
  
  XL: {
    name: '超大',
    multiplier: 1.5,
    fontSize: '1rem',       // 16px
    headerHeight: 52,
    contentLineHeight: 40,
    iconSize: { width: 36, height: 28 },
    portSize: 12
  }
}

// 响应式断点配置
export const RESPONSIVE_CONFIG = {
  mobile: {
    maxWidth: 768,
    fontSizeMultiplier: 0.9,
    spacingMultiplier: 0.85,
    nodeWidth: 240
  },
  
  tablet: {
    minWidth: 769,
    maxWidth: 1024,
    fontSizeMultiplier: 0.95,
    spacingMultiplier: 0.9,
    nodeWidth: 260
  },
  
  desktop: {
    minWidth: 1025,
    maxWidth: 1440,
    fontSizeMultiplier: 1.0,
    spacingMultiplier: 1.0,
    nodeWidth: 280
  },
  
  wide: {
    minWidth: 1441,
    maxWidth: 1920,
    fontSizeMultiplier: 1.05,
    spacingMultiplier: 1.1,
    nodeWidth: 300
  },
  
  ultrawide: {
    minWidth: 1921,
    fontSizeMultiplier: 1.1,
    spacingMultiplier: 1.2,
    nodeWidth: 320
  }
}

// CSS自定义属性生成函数
export function generateCSSCustomProperties() {
  const properties = {}
  
  // 颜色变量
  Object.entries(COLOR_SYSTEM).forEach(([category, colors]) => {
    if (typeof colors === 'object') {
      Object.entries(colors).forEach(([shade, color]) => {
        properties[`--color-${category}-${shade}`] = color
      })
    }
  })
  
  // 排版变量
  properties['--font-family-sans'] = TYPOGRAPHY_SYSTEM.fontFamily.sans.join(', ')
  properties['--font-family-mono'] = TYPOGRAPHY_SYSTEM.fontFamily.mono.join(', ')
  
  Object.entries(TYPOGRAPHY_SYSTEM.fontSize).forEach(([size, value]) => {
    properties[`--font-size-${size}`] = value
  })
  
  // 动画变量
  Object.entries(ANIMATION_SYSTEM.duration).forEach(([speed, duration]) => {
    properties[`--duration-${speed}`] = `${duration}ms`
  })
  
  properties['--transition-custom'] = ANIMATION_SYSTEM.easing.custom
  
  // 尺寸变量
  properties['--unit'] = `${DESIGN_CONSTANTS.BASE_UNIT}px`
  properties['--node-width'] = `${DIMENSION_SYSTEM.node.width}px`
  properties['--node-min-height'] = `${DIMENSION_SYSTEM.node.minHeight}px`
  properties['--header-height'] = `${DIMENSION_SYSTEM.header.height}px`
  properties['--content-line-height'] = `${DIMENSION_SYSTEM.content.lineHeight}px`
  
  return properties
}

// 样式工具函数
export function getNodeTypeStyle(nodeType) {
  const config = NODE_TYPE_CONFIGS[nodeType]
  if (!config) return NODE_TYPE_CONFIGS.start
  
  const color = COLOR_SYSTEM[config.color] || COLOR_SYSTEM.primary
  
  return {
    ...config,
    color: color[500],
    backgroundColor: color[50],
    borderColor: color[300],
    hoverColor: color[400],
    activeColor: color[600]
  }
}

export function getStateStyle(state) {
  return INTERACTION_STATES[state] || INTERACTION_STATES.default
}

export function getSizeVariant(size) {
  return SIZE_VARIANTS[size] || SIZE_VARIANTS.M
}

export function getResponsiveConfig(viewportWidth) {
  const configs = Object.entries(RESPONSIVE_CONFIG)
  
  for (const [name, config] of configs) {
    if (config.minWidth && viewportWidth >= config.minWidth) {
      if (!config.maxWidth || viewportWidth <= config.maxWidth) {
        return config
      }
    }
  }
  
  return RESPONSIVE_CONFIG.desktop
}