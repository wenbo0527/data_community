/**
 * 预览线状态常量定义
 * 从 PreviewLineSystem 中提取的状态定义
 */

export const UnifiedPreviewStates = {
  // 基础状态
  INTERACTIVE: 'interactive',     // 可交互状态
  DRAGGING: 'dragging',          // 拖拽状态
  CONNECTED: 'connected',        // 已连接状态
  HOVER: 'hover',               // 悬停状态
  
  // 扩展状态
  CREATING: 'creating',         // 创建中状态
  UPDATING: 'updating',         // 更新中状态
  REMOVING: 'removing',         // 移除中状态
  DISABLED: 'disabled',         // 禁用状态
  
  // 特殊状态
  HIGHLIGHTED: 'highlighted',   // 高亮状态
  SELECTED: 'selected',         // 选中状态
  ERROR: 'error'               // 错误状态
}

/**
 * 状态转换规则
 */
export const StateTransitions = {
  [UnifiedPreviewStates.INTERACTIVE]: [
    UnifiedPreviewStates.DRAGGING,
    UnifiedPreviewStates.HOVER,
    UnifiedPreviewStates.SELECTED,
    UnifiedPreviewStates.CONNECTED
  ],
  
  [UnifiedPreviewStates.DRAGGING]: [
    UnifiedPreviewStates.INTERACTIVE,
    UnifiedPreviewStates.CONNECTED,
    UnifiedPreviewStates.ERROR
  ],
  
  [UnifiedPreviewStates.CONNECTED]: [
    UnifiedPreviewStates.INTERACTIVE,
    UnifiedPreviewStates.REMOVING
  ],
  
  [UnifiedPreviewStates.HOVER]: [
    UnifiedPreviewStates.INTERACTIVE,
    UnifiedPreviewStates.SELECTED
  ]
}

/**
 * 检查状态转换是否有效
 * @param {string} fromState - 源状态
 * @param {string} toState - 目标状态
 * @returns {boolean} 是否允许转换
 */
export function isValidStateTransition(fromState, toState) {
  const allowedTransitions = StateTransitions[fromState]
  return allowedTransitions ? allowedTransitions.includes(toState) : false
}

/**
 * 获取状态的显示名称
 * @param {string} state - 状态值
 * @returns {string} 显示名称
 */
export function getStateDisplayName(state) {
  const displayNames = {
    [UnifiedPreviewStates.INTERACTIVE]: '可交互',
    [UnifiedPreviewStates.DRAGGING]: '拖拽中',
    [UnifiedPreviewStates.CONNECTED]: '已连接',
    [UnifiedPreviewStates.HOVER]: '悬停',
    [UnifiedPreviewStates.CREATING]: '创建中',
    [UnifiedPreviewStates.UPDATING]: '更新中',
    [UnifiedPreviewStates.REMOVING]: '移除中',
    [UnifiedPreviewStates.DISABLED]: '禁用',
    [UnifiedPreviewStates.HIGHLIGHTED]: '高亮',
    [UnifiedPreviewStates.SELECTED]: '选中',
    [UnifiedPreviewStates.ERROR]: '错误'
  }
  
  return displayNames[state] || state
}