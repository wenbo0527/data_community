/**
 * 横向画布节点样式常量
 * 基于文档规范定义的样式参数
 */

// 基础尺寸常量 - 基于8px网格系统优化
export const NODE_DIMENSIONS = {
  WIDTH: 260,                    // 从280px优化到260px，提高画布利用率
  MIN_HEIGHT: 88,                // 从96px优化到88px，更紧凑
  HEADER_HEIGHT: 32,             // 从36px优化到32px，更精致
  ROW_HEIGHT: 28,                // 从32px优化到28px，更高密度
  CONTENT_PADDING: 16,           // 从12px优化到16px，更好呼吸感
  ICON_SIZE: { width: 24, height: 24 },   // 统一为正方形，更协调
  ICON_RADIUS: 8,                           // 从6px优化到8px，更现代
  MENU_DOT_SIZE: 3,                         // 保持菜单点大小
  PORT_RADIUS: 5,                           // 从6px优化到5px，更精致
  BORDER_RADIUS: 12,                        // 统一圆角为12px
  HEADER_RADIUS: '12px 12px 0 0'            // 标题区圆角
}

// 颜色常量 - 基于现代化色彩系统
export const COLORS = {
  // 节点主体 - 更简洁的配色
  BODY_FILL: '#ffffff',
  BODY_STROKE: '#e2e8f0',        // 从#D1D5DB优化为#e2e8f0，更柔和
  BODY_STROKE_WIDTH: 1,
  BODY_RADIUS: 12,                // 从8px优化到12px，更现代
  
  // 标题区 - 渐变效果
  HEADER_FILL: 'linear-gradient(135deg, var(--node-color) 0%, var(--node-color-light) 100%)',
  HEADER_STROKE: 'rgba(255, 255, 255, 0.2)',
  HEADER_STROKE_WIDTH: 1,
  
  // 图标 - 更协调的配色
  ICON_FILL: 'rgba(255, 255, 255, 0.95)',
  ICON_STROKE: 'var(--node-color)',
  ICON_TEXT: 'var(--node-color)',
  
  // 文本 - 统一中性色
  TITLE_TEXT: '#1e293b',         // 从#111827优化为#1e293b
  CONTENT_TEXT: '#475569',       // 从#111827优化为#475569，降低对比度
  MENU_DOT: '#64748b',           // 从#6B7280优化为#64748b
  
  // 端口 - 更精致的配色
  PORT_STROKE: '#2563eb',        // 使用主题蓝色
  PORT_FILL_IN: '#ffffff',
  PORT_FILL_OUT: '#2563eb',
  PORT_STROKE_WIDTH: 1.5,
  
  // 端口动画 - 优化参数
  PORT_ANIMATION_DURATION: 200,    // 从300ms优化到200ms，更敏捷
  PORT_HOVER_SCALE: 1.15,         // 从1.2优化到1.15，更克制
  PORT_DEFAULT_SCALE: 1.0,
  PORT_UNSELECTED_SCALE: 0.9        // 从0.8优化到0.9，更明显
}

// 字体常量 - 优化排版系统
export const TYPOGRAPHY = {
  // 图标文本 - 增大字号提升可读性
  ICON_FONT_SIZE: 14,              // 从12px优化到14px
  ICON_TEXT_ANCHOR: 'middle',
  
  // 标题文本 - 层次分明的标题系统
  TITLE_FONT_SIZE: 14,             // 从13px优化到14px，更突出
  TITLE_FONT_WEIGHT: 600,          // 保持半粗体
  TITLE_TEXT_ANCHOR: 'start',
  TITLE_LINE_HEIGHT: 1.4,          // 新增行高，提升可读性
  
  // 内容文本 - 更清晰的正文排版
  CONTENT_FONT_SIZE: 12,           // 从13px优化到12px，更精致
  CONTENT_FONT_WEIGHT: 400,        // 标准字重
  CONTENT_TEXT_ANCHOR: 'start',
  CONTENT_LINE_HEIGHT: 1.5,        // 新增行高，改善阅读体验
  CONTENT_BASELINE_ADJUST: 4,        // 从5px优化到4px，更精确
  
  // 辅助文本 - 新增辅助信息层级
  HELPER_FONT_SIZE: 11,              // 最小字号用于辅助信息
  HELPER_FONT_WEIGHT: 400,
  HELPER_LINE_HEIGHT: 1.4,
  
  // 字体族 - 统一字体系统
  FONT_FAMILY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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