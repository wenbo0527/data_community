/**
 * 画布自动化功能配置
 * 控制各种自动化行为的开关
 */

export const CANVAS_AUTOMATION_CONFIG = {
  // 🚫 自动布局相关
  AUTO_LAYOUT: {
    // 是否启用自动结构化布局
    ENABLED: false,
    // 自动布局触发延迟（毫秒）
    TRIGGER_DELAY: 0,
    // 是否在节点添加后自动触发布局
    TRIGGER_ON_NODE_ADD: false,
    // 是否在连接创建后自动触发布局
    TRIGGER_ON_CONNECTION_ADD: false,
    // 是否在节点删除后自动触发布局
    TRIGGER_ON_NODE_DELETE: false
  },

  // 🚫 自动居中相关
  AUTO_CENTER: {
    // 是否启用自动居中
    ENABLED: false,
    // 是否在布局后自动居中
    CENTER_AFTER_LAYOUT: false,
    // 是否在画布初始化后自动居中
    CENTER_ON_INIT: false,
    // 自动居中延迟（毫秒）
    CENTER_DELAY: 0
  },

  // 🚫 自动缩放相关
  AUTO_ZOOM: {
    // 是否启用自动缩放适应
    ENABLED: false,
    // 是否在布局后自动缩放适应
    ZOOM_AFTER_LAYOUT: false,
    // 是否在画布初始化后自动缩放适应
    ZOOM_ON_INIT: false,
    // 最大自动缩放比例
    MAX_SCALE: 1.2,
    // 缩放边距
    PADDING: 50,
    // 自动缩放延迟（毫秒）
    ZOOM_DELAY: 0
  },

  // ✅ 手动操作相关（保持启用）
  MANUAL_CONTROLS: {
    // 是否允许手动触发布局
    ALLOW_MANUAL_LAYOUT: true,
    // 是否允许手动居中
    ALLOW_MANUAL_CENTER: true,
    // 是否允许手动缩放适应
    ALLOW_MANUAL_ZOOM_FIT: true,
    // 是否显示手动控制按钮
    SHOW_MANUAL_BUTTONS: true
  },

  // 📊 拖拽相关
  DRAG_BEHAVIOR: {
    // 是否在拖拽时暂停自动化功能
    PAUSE_AUTOMATION_ON_DRAG: true,
    // 拖拽结束后恢复自动化功能的延迟（毫秒）
    RESUME_DELAY_AFTER_DRAG: 2000,
    // 是否在拖拽结束后自动触发布局
    AUTO_LAYOUT_AFTER_DRAG: false
  },

  // 🔧 调试相关
  DEBUG: {
    // 是否启用详细日志
    VERBOSE_LOGGING: true,
    // 是否显示自动化状态提示
    SHOW_AUTOMATION_HINTS: true,
    // 是否在控制台显示配置信息
    LOG_CONFIG_ON_INIT: true
  }
}

/**
 * 获取自动化配置
 * @param {string} category - 配置类别
 * @param {string} key - 配置键
 * @returns {any} 配置值
 */
export function getAutomationConfig(category, key) {
  if (!CANVAS_AUTOMATION_CONFIG[category]) {
    console.warn(`[CanvasAutomation] 未知的配置类别: ${category}`)
    return undefined
  }
  
  if (key && !CANVAS_AUTOMATION_CONFIG[category].hasOwnProperty(key)) {
    console.warn(`[CanvasAutomation] 未知的配置键: ${category}.${key}`)
    return undefined
  }
  
  return key ? CANVAS_AUTOMATION_CONFIG[category][key] : CANVAS_AUTOMATION_CONFIG[category]
}

/**
 * 设置自动化配置
 * @param {string} category - 配置类别
 * @param {string} key - 配置键
 * @param {any} value - 配置值
 */
export function setAutomationConfig(category, key, value) {
  if (!CANVAS_AUTOMATION_CONFIG[category]) {
    console.warn(`[CanvasAutomation] 未知的配置类别: ${category}`)
    return false
  }
  
  if (!CANVAS_AUTOMATION_CONFIG[category].hasOwnProperty(key)) {
    console.warn(`[CanvasAutomation] 未知的配置键: ${category}.${key}`)
    return false
  }
  
  const oldValue = CANVAS_AUTOMATION_CONFIG[category][key]
  
  // 避免重复设置相同值
  if (oldValue === value) {
    console.log(`[CanvasAutomation] 配置值无变化，跳过设置: ${category}.${key} = ${value}`)
    return true
  }
  
  CANVAS_AUTOMATION_CONFIG[category][key] = value
  
  console.log(`[CanvasAutomation] 配置已更新: ${category}.${key} = ${value} (原值: ${oldValue})`)
  return true
}

/**
 * 重置所有自动化配置为默认值
 */
export function resetAutomationConfig() {
  // 禁用所有自动化功能
  CANVAS_AUTOMATION_CONFIG.AUTO_LAYOUT.ENABLED = false
  CANVAS_AUTOMATION_CONFIG.AUTO_CENTER.ENABLED = false
  CANVAS_AUTOMATION_CONFIG.AUTO_ZOOM.ENABLED = false
  
  // 保持手动控制启用
  CANVAS_AUTOMATION_CONFIG.MANUAL_CONTROLS.ALLOW_MANUAL_LAYOUT = true
  CANVAS_AUTOMATION_CONFIG.MANUAL_CONTROLS.ALLOW_MANUAL_CENTER = true
  CANVAS_AUTOMATION_CONFIG.MANUAL_CONTROLS.ALLOW_MANUAL_ZOOM_FIT = true
  
  console.log('[CanvasAutomation] 配置已重置为默认值（禁用所有自动化功能）')
}

/**
 * 启用所有自动化功能（谨慎使用）
 */
export function enableAllAutomation() {
  CANVAS_AUTOMATION_CONFIG.AUTO_LAYOUT.ENABLED = true
  CANVAS_AUTOMATION_CONFIG.AUTO_CENTER.ENABLED = true
  CANVAS_AUTOMATION_CONFIG.AUTO_ZOOM.ENABLED = true
  
  console.warn('[CanvasAutomation] ⚠️ 已启用所有自动化功能，这可能会影响用户体验')
}

/**
 * 禁用所有自动化功能
 */
export function disableAllAutomation() {
  CANVAS_AUTOMATION_CONFIG.AUTO_LAYOUT.ENABLED = false
  CANVAS_AUTOMATION_CONFIG.AUTO_CENTER.ENABLED = false
  CANVAS_AUTOMATION_CONFIG.AUTO_ZOOM.ENABLED = false
  
  console.log('[CanvasAutomation] ✅ 已禁用所有自动化功能')
}

/**
 * 打印当前配置状态
 */
export function logCurrentConfig() {
  console.group('[CanvasAutomation] 当前配置状态')
  console.log('🔄 自动布局:', CANVAS_AUTOMATION_CONFIG.AUTO_LAYOUT.ENABLED ? '✅ 启用' : '❌ 禁用')
  console.log('📍 自动居中:', CANVAS_AUTOMATION_CONFIG.AUTO_CENTER.ENABLED ? '✅ 启用' : '❌ 禁用')
  console.log('🔍 自动缩放:', CANVAS_AUTOMATION_CONFIG.AUTO_ZOOM.ENABLED ? '✅ 启用' : '❌ 禁用')
  console.log('🎮 手动控制:', CANVAS_AUTOMATION_CONFIG.MANUAL_CONTROLS.ALLOW_MANUAL_LAYOUT ? '✅ 可用' : '❌ 不可用')
  console.groupEnd()
}

// 初始化时打印配置信息
if (CANVAS_AUTOMATION_CONFIG.DEBUG.LOG_CONFIG_ON_INIT) {
  console.log('[CanvasAutomation] 🚫 自动化功能配置已加载 - 默认禁用所有自动化功能')
  logCurrentConfig()
}