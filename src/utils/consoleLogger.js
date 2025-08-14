/**
 * 控制台日志工具类
 * 用于统一管理调试日志输出
 */
export const consoleLogger = {
  /**
   * 信息日志
   * @param {string} message - 日志消息
   * @param {...any} args - 额外参数
   */
  info(message, ...args) {
    console.log(`[INFO] ${new Date().toLocaleTimeString()} ${message}`, ...args)
  },

  /**
   * 警告日志
   * @param {string} message - 日志消息
   * @param {...any} args - 额外参数
   */
  warn(message, ...args) {
    console.warn(`[WARN] ${new Date().toLocaleTimeString()} ${message}`, ...args)
  },

  /**
   * 错误日志
   * @param {string} message - 日志消息
   * @param {...any} args - 额外参数
   */
  error(message, ...args) {
    console.error(`[ERROR] ${new Date().toLocaleTimeString()} ${message}`, ...args)
  },

  /**
   * 调试日志
   * @param {string} message - 日志消息
   * @param {...any} args - 额外参数
   */
  debug(message, ...args) {
    console.debug(`[DEBUG] ${new Date().toLocaleTimeString()} ${message}`, ...args)
  },

  /**
   * 分组日志开始
   * @param {string} groupName - 分组名称
   */
  group(groupName) {
    console.group(`[GROUP] ${new Date().toLocaleTimeString()} ${groupName}`)
  },

  /**
   * 分组日志结束
   */
  groupEnd() {
    console.groupEnd()
  },

  /**
   * 表格日志
   * @param {any} data - 要显示的数据
   */
  table(data) {
    console.table(data)
  }
}