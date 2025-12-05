export const NODE_DIMENSIONS = {
  WIDTH: 260,
  MIN_HEIGHT: 88,
  HEADER_HEIGHT: 32,
  ROW_HEIGHT: 28,
  ROW_GAP: 4,
  ADAPTIVE_CONTENT_LAYOUT: true,
  CONTENT_SPACING: { top: 12, gap: 8, bottom: 12 },
  CONTENT_PADDING: 16,
  ICON_SIZE: { width: 24, height: 24 },
  ICON_RADIUS: 8,
  MENU_DOT_SIZE: 3,
  PORT_RADIUS: 5,
  BORDER_RADIUS: 12,
  HEADER_RADIUS: '12px 12px 0 0'
}

export const COLORS = {
  BODY_FILL: '#ffffff',
  BODY_STROKE: '#e2e8f0',
  BODY_STROKE_WIDTH: 1,
  BODY_RADIUS: 12,
  HEADER_FILL: 'linear-gradient(135deg, var(--node-color) 0%, var(--node-color-light) 100%)',
  HEADER_STROKE: 'rgba(255, 255, 255, 0.2)',
  HEADER_STROKE_WIDTH: 1,
  ICON_FILL: 'rgba(255, 255, 255, 0.95)',
  ICON_STROKE: 'var(--node-color)',
  ICON_TEXT: 'var(--node-color)',
  TITLE_TEXT: '#1e293b',
  CONTENT_TEXT: '#475569',
  MENU_DOT: '#64748b',
  PORT_STROKE: '#2563eb',
  PORT_FILL_IN: '#ffffff',
  PORT_FILL_OUT: '#2563eb',
  PORT_STROKE_WIDTH: 1.5,
  PORT_ANIMATION_DURATION: 200,
  PORT_HOVER_SCALE: 1.15,
  PORT_DEFAULT_SCALE: 1.0,
  PORT_UNSELECTED_SCALE: 0.9
}

export const TYPOGRAPHY = {
  ICON_FONT_SIZE: 14,
  ICON_TEXT_ANCHOR: 'middle',
  TITLE_FONT_SIZE: 14,
  TITLE_FONT_WEIGHT: 600,
  TITLE_TEXT_ANCHOR: 'start',
  TITLE_LINE_HEIGHT: 1.4,
  CONTENT_FONT_SIZE: 12,
  CONTENT_FONT_WEIGHT: 400,
  CONTENT_TEXT_ANCHOR: 'start',
  CONTENT_LINE_HEIGHT: 1.5,
  CONTENT_BASELINE_ADJUST: 4,
  HELPER_FONT_SIZE: 11,
  HELPER_FONT_WEIGHT: 400,
  HELPER_LINE_HEIGHT: 1.4,
  FONT_FAMILY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}

export const POSITIONS = {
  ICON_X: 12,
  ICON_Y: 8,
  ICON_TEXT_X: 26,
  ICON_TEXT_Y: 18,
  TITLE_X: 48,
  TITLE_Y: 18,
  CONTENT_START_X: 16,
  MENU_DOT_BASE_X: -24,
  MENU_DOT_Y: 16,
  MENU_DOT_SPACING: 6,
  MENU_DOT_OFFSETS: [-24, -18, -12]
}

export const INTERACTION_STATES = {
  HOVER: { BODY_STROKE: '#9CA3AF', BODY_STROKE_WIDTH: 2, SHADOW_COLOR: 'rgba(0, 0, 0, 0.1)', SHADOW_BLUR: 4 },
  SELECTED: { BODY_STROKE: '#4C78FF', BODY_STROKE_WIDTH: 2, SHADOW_COLOR: 'rgba(76, 120, 255, 0.15)', SHADOW_BLUR: 8 },
  DISABLED: { BODY_FILL: '#F9FAFB', BODY_STROKE: '#E5E7EB', HEADER_FILL: '#F3F4F6', TEXT_OPACITY: 0.5, CURSOR: 'not-allowed' },
  DRAGGING: { OPACITY: 0.8, SHADOW_COLOR: 'rgba(0, 0, 0, 0.15)', SHADOW_BLUR: 12 }
}

export const NODE_TYPE_STYLES = {
  start: { ICON_TEXT: 'ST' },
  'crowd-split': { ICON_TEXT: 'CS' },
  'event-split': { ICON_TEXT: 'ES' },
  'ab-test': { ICON_TEXT: 'AB' },
  'ai-call': { ICON_TEXT: 'AI' },
  sms: { ICON_TEXT: 'SM' },
  'manual-call': { ICON_TEXT: 'MC' },
  wait: { ICON_TEXT: 'WA' },
  benefit: { ICON_TEXT: 'BE' },
  end: { ICON_TEXT: 'EN' }
}

export function getNodeIconText(nodeType) {
  const map = { 'crowd-split': '人群', 'event-split': '事件', 'ab-test': 'AB', sms: '短信', 'ai-call': '外呼', 'manual-call': '外呼', benefit: '权益', wait: '等待', start: '开始', end: '结束' }
  return NODE_TYPE_STYLES[nodeType]?.ICON_TEXT || map[nodeType] || '节点'
}

export function getBaseNodeStyles() {
  return {
    body: { fill: COLORS.BODY_FILL, stroke: COLORS.BODY_STROKE, strokeWidth: COLORS.BODY_STROKE_WIDTH, rx: COLORS.BODY_RADIUS, ry: COLORS.BODY_RADIUS },
    header: { fill: COLORS.HEADER_FILL, stroke: COLORS.HEADER_STROKE, strokeWidth: COLORS.HEADER_STROKE_WIDTH, rx: COLORS.BODY_RADIUS, ry: COLORS.BODY_RADIUS, height: NODE_DIMENSIONS.HEADER_HEIGHT, ref: 'body', refX: 0, refY: 0, refWidth: '100%', pointerEvents: 'none' },
    'header-icon': { fill: COLORS.ICON_FILL, stroke: COLORS.ICON_STROKE, rx: NODE_DIMENSIONS.ICON_RADIUS, ry: NODE_DIMENSIONS.ICON_RADIUS, width: NODE_DIMENSIONS.ICON_SIZE.width, height: NODE_DIMENSIONS.ICON_SIZE.height, ref: 'header', refX: POSITIONS.ICON_X, refY: POSITIONS.ICON_Y, pointerEvents: 'none' },
    'header-icon-text': { fill: COLORS.ICON_TEXT, fontSize: TYPOGRAPHY.ICON_FONT_SIZE, textAnchor: TYPOGRAPHY.ICON_TEXT_ANCHOR, ref: 'header', refX: POSITIONS.ICON_TEXT_X, refY: POSITIONS.ICON_TEXT_Y, pointerEvents: 'none' },
    'header-title': { fill: COLORS.TITLE_TEXT, fontSize: TYPOGRAPHY.TITLE_FONT_SIZE, fontWeight: TYPOGRAPHY.TITLE_FONT_WEIGHT, textAnchor: TYPOGRAPHY.TITLE_TEXT_ANCHOR, ref: 'header', refX: POSITIONS.TITLE_X, refY: POSITIONS.TITLE_Y, pointerEvents: 'none' }
  }
}

export function getInteractionStyles(state) {
  return INTERACTION_STATES[state] || {}
}

export function getPortStyles(portType) {
  const baseStyle = { r: NODE_DIMENSIONS.PORT_RADIUS, magnet: true, stroke: COLORS.PORT_STROKE, strokeWidth: COLORS.PORT_STROKE_WIDTH }
  if (portType === 'in') { return { ...baseStyle, fill: COLORS.PORT_FILL_IN } }
  if (portType === 'out') { return { ...baseStyle, fill: COLORS.PORT_FILL_OUT } }
  return baseStyle
}
