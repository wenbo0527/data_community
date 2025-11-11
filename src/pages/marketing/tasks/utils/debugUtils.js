/**
 * 调试工具函数
 * 提供开发模式检测和条件日志输出功能
 */

// 统一日志管理器
import logManager from './LogManager.js'

/**
 * 检测是否为开发模式
 * @returns {boolean} 是否为开发模式
 */
export const isDevelopmentMode = () => {
  return import.meta.env.DEV || 
         import.meta.env.MODE === 'development' || 
         process.env.NODE_ENV === 'development' ||
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1'
}

/**
 * 条件日志输出 - 仅在开发模式下输出
 * @param {string} level - 日志级别 ('log', 'info', 'warn', 'error', 'debug')
 * @param {string} tag - 日志标签
 * @param {...any} args - 日志参数
 */
export const devLog = (level = 'log', tag = '', ...args) => {
  // 委托统一日志管理器；其内部已区分环境与级别
  switch (level) {
    case 'error':
      logManager.error(tag, ...args)
      break
    case 'warn':
      logManager.warn(tag, ...args)
      break
    case 'info':
      logManager.info(tag, ...args)
      break
    case 'debug':
      logManager.debug(tag, ...args)
      break
    default:
      logManager.info(tag, ...args)
      break
  }
}

/**
 * 开发模式专用日志函数
 */
export const devLogger = {
  log: (tag, ...args) => logManager.info(tag, ...args),
  info: (tag, ...args) => logManager.info(tag, ...args),
  warn: (tag, ...args) => logManager.warn(tag, ...args),
  error: (tag, ...args) => logManager.error(tag, ...args),
  debug: (tag, ...args) => logManager.debug(tag, ...args)
}

/**
 * 性能监控日志 - 仅在开发模式下输出
 * @param {string} operation - 操作名称
 * @param {Function} fn - 要监控的函数
 * @returns {any} 函数执行结果
 */
export const devPerformanceLog = async (operation, fn) => {
  // 使用统一日志管理器的耗时包装；其内部已处理环境输出策略
  return await logManager.time(operation, fn, 'Performance')
}