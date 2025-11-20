/**
 * 横向画布节点样式常量
 * 基于文档规范定义的样式参数
 */

// 基础尺寸常量
export const NODE_DIMENSIONS = {
  WIDTH: 280,
  MIN_HEIGHT: 96,
  HEADER_HEIGHT: 36,
  ROW_HEIGHT: 32,
  CONTENT_PADDING: 12,
  ICON_SIZE: { width: 28, height: 20 },
  ICON_RADIUS: 6,
  MENU_DOT_SIZE: 3,
  PORT_RADIUS: 6
}

// 颜色常量
export const COLORS = {
  // 节点主体
  BODY_FILL: '#FFFFFF',
  BODY_STROKE: '#D1D5DB',
  BODY_STROKE_WIDTH: 1,
  BODY_RADIUS: 8,
  
  // 标题区
  HEADER_FILL: '#F8FAFC',
  HEADER_STROKE: '#E5E7EB',
  HEADER_STROKE_WIDTH: 1,
  
  // 图标
  ICON_FILL: '#14B8A6',
  ICON_STROKE: '#14B8A6',
  ICON_TEXT: '#FFFFFF',
  
  // 文本
  TITLE_TEXT: '#111827',
  CONTENT_TEXT: '#111827',
  MENU_DOT: '#6B7280',
  
  // 端口
  PORT_STROKE: '#4C78FF',
  PORT_FILL_IN: '#FFFFFF',
  PORT_FILL_OUT: '#4C78FF',
  PORT_STROKE_WIDTH: 1.5,
  
  // 端口动画
  PORT_ANIMATION_DURATION: 300,
  PORT_HOVER_SCALE: 1.2,
  PORT_DEFAULT_SCALE: 1.0,
  PORT_UNSELECTED_SCALE: 0.8
}

// 字体常量
export const TYPOGRAPHY = {
  // 图标文本
  ICON_FONT_SIZE: 12,
  ICON_TEXT_ANCHOR: 'middle',
  
  // 标题文本
  TITLE_FONT_SIZE: 13,
  TITLE_FONT_WEIGHT: 600,
  TITLE_TEXT_ANCHOR: 'start',
  
  // 内容文本
  CONTENT_FONT_SIZE: 13,
  CONTENT_TEXT_ANCHOR: 'start',
  CONTENT_BASELINE_ADJUST: 5
}

// 位置常量
export const POSITIONS = {
  // 图标位置
  ICON_X: 12,
  ICON_Y: 8,
  // 图标文本位置（消除硬编码）
  ICON_TEXT_X: 26,
  ICON_TEXT_Y: 18, // 修正为18，确保在36px标题区域内垂直居中
  
  // 标题位置
  TITLE_X: 48,
  TITLE_Y: 18, // 修正为18，确保在36px标题区域内垂直居中
  
  // 内容起始位置
  CONTENT_START_X: 16,
  
  // 菜单点位置
  MENU_DOT_BASE_X: -24,
  MENU_DOT_Y: 16, // 保持16，因为菜单点高度只有3px，在36px区域内居中
  MENU_DOT_SPACING: 6,
  // 菜单点X偏移数组（消除硬编码）
  MENU_DOT_OFFSETS: [-24, -18, -12]
}

// 交互状态样式
export const INTERACTION_STATES = {
  // 悬停状态
  HOVER: {
    BODY_STROKE: '#9CA3AF',
    BODY_STROKE_WIDTH: 2,
    SHADOW_COLOR: 'rgba(0, 0, 0, 0.1)',
    SHADOW_BLUR: 4
  },
  
  // 选中状态
  SELECTED: {
    BODY_STROKE: '#4C78FF',
    BODY_STROKE_WIDTH: 2,
    SHADOW_COLOR: 'rgba(76, 120, 255, 0.15)',
    SHADOW_BLUR: 8
  },
  
  // 禁用状态
  DISABLED: {
    BODY_FILL: '#F9FAFB',
    BODY_STROKE: '#E5E7EB',
    HEADER_FILL: '#F3F4F6',
    TEXT_OPACITY: 0.5,
    CURSOR: 'not-allowed'
  },
  
  // 拖拽状态
  DRAGGING: {
    OPACITY: 0.8,
    SHADOW_COLOR: 'rgba(0, 0, 0, 0.15)',
    SHADOW_BLUR: 12
  }
}

// 节点类型样式映射
export const NODE_TYPE_STYLES = {
  // 开始节点
  start: {
    ICON_TEXT: 'ST'
  },
  
  // 人群分流
  'crowd-split': {
    ICON_TEXT: 'CS'
  },
  
  // 事件分流
  'event-split': {
    ICON_TEXT: 'ES'
  },
  
  // AB实验
  'ab-test': {
    ICON_TEXT: 'AB'
  },
  
  // AI外呼
  'ai-call': {
    ICON_TEXT: 'AI'
  },
  
  // 短信触达
  sms: {
    ICON_TEXT: 'SM'
  },
  
  // 人工外呼
  'manual-call': {
    ICON_TEXT: 'MC'
  },
  
  // 等待节点
  wait: {
    ICON_TEXT: 'WA'
  },
  
  // 权益节点
  benefit: {
    ICON_TEXT: 'BE'
  },
  
  // 结束节点
  end: {
    ICON_TEXT: 'EN'
  }
}

/**
 * 获取节点图标文本
 * @param {string} nodeType - 节点类型
 * @returns {string} 图标文本
 */
export function getNodeIconText(nodeType) {
  return NODE_TYPE_STYLES[nodeType]?.ICON_TEXT || (nodeType || '').slice(0, 2).toUpperCase() || 'IF'
}

/**
 * 获取基础节点样式
 * @returns {Object} 基础样式对象
 */
export function getBaseNodeStyles() {
  return {
    body: {
      fill: COLORS.BODY_FILL,
      stroke: COLORS.BODY_STROKE,
      strokeWidth: COLORS.BODY_STROKE_WIDTH,
      rx: COLORS.BODY_RADIUS,
      ry: COLORS.BODY_RADIUS
    },
    header: {
      fill: COLORS.HEADER_FILL,
      stroke: COLORS.HEADER_STROKE,
      strokeWidth: COLORS.HEADER_STROKE_WIDTH,
      rx: COLORS.BODY_RADIUS,
      ry: COLORS.BODY_RADIUS,
      height: NODE_DIMENSIONS.HEADER_HEIGHT,
      // 绑定到主体矩形，保证随节点宽度变化
      ref: 'body',
      refX: 0,
      refY: 0,
      refWidth: '100%',
      pointerEvents: 'none'
    },
    'header-icon': {
      fill: COLORS.ICON_FILL,
      stroke: COLORS.ICON_STROKE,
      rx: NODE_DIMENSIONS.ICON_RADIUS,
      ry: NODE_DIMENSIONS.ICON_RADIUS,
      width: NODE_DIMENSIONS.ICON_SIZE.width,
      height: NODE_DIMENSIONS.ICON_SIZE.height,
      ref: 'header',
      refX: POSITIONS.ICON_X,
      refY: POSITIONS.ICON_Y,
      pointerEvents: 'none'
    },
    'header-icon-text': {
      fill: COLORS.ICON_TEXT,
      fontSize: TYPOGRAPHY.ICON_FONT_SIZE,
      textAnchor: TYPOGRAPHY.ICON_TEXT_ANCHOR,
      ref: 'header',
      refX: POSITIONS.ICON_TEXT_X,
      refY: POSITIONS.ICON_TEXT_Y,
      pointerEvents: 'none'
    },
    'header-title': {
      fill: COLORS.TITLE_TEXT,
      fontSize: TYPOGRAPHY.TITLE_FONT_SIZE,
      fontWeight: TYPOGRAPHY.TITLE_FONT_WEIGHT,
      textAnchor: TYPOGRAPHY.TITLE_TEXT_ANCHOR,
      ref: 'header',
      refX: POSITIONS.TITLE_X,
      refY: POSITIONS.TITLE_Y,
      pointerEvents: 'none'
    }
  }
}

/**
 * 获取交互状态样式
 * @param {string} state - 交互状态 (hover, selected, disabled, dragging)
 * @returns {Object} 状态样式对象
 */
export function getInteractionStyles(state) {
  return INTERACTION_STATES[state] || {}
}

/**
 * 获取端口样式
 * @param {string} portType - 端口类型 (in, out)
 * @returns {Object} 端口样式对象
 */
export function getPortStyles(portType) {
  const baseStyle = {
    r: NODE_DIMENSIONS.PORT_RADIUS,
    magnet: true,
    stroke: COLORS.PORT_STROKE,
    strokeWidth: COLORS.PORT_STROKE_WIDTH
  }
  
  if (portType === 'in') {
    return {
      ...baseStyle,
      fill: COLORS.PORT_FILL_IN
    }
  } else if (portType === 'out') {
    return {
      ...baseStyle,
      fill: COLORS.PORT_FILL_OUT
    }
  }
  
  return baseStyle
}