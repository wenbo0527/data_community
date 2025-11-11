/**
 * 统一日志管理器
 * - 日志级别控制: debug, info, warn, error
 * - 环境区分: 开发环境全量输出；生产环境仅错误/可选警告
 * - 模块标签: 支持按模块(tag)过滤
 * - 性能计时: 统一的耗时日志输出
 */

const levelOrder = { debug: 0, info: 1, warn: 2, error: 3 }

function getTimestamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function detectIsDev() {
  try {
    // 使用 Vite 环境变量 + 常见本地开发域名
    const isViteDev = (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.DEV || import.meta.env.MODE === 'development'))
    const isNodeEnvDev = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development')
    const isLocalHost = (typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1'))
    return isViteDev || isNodeEnvDev || isLocalHost
  } catch {
    return false
  }
}

class LogManager {
  constructor() {
    this.isDev = detectIsDev()
    this.config = {
      enabled: true,
      minLevel: 'info', // 开发环境下的最小输出级别
      allowProdWarnings: true, // 生产环境是否允许警告输出
      showTimestamp: true,
      showLevel: true,
      showTag: true,
      includeTags: [], // 仅输出这些tag（为空表示不过滤）
      excludeTags: [] // 排除这些tag
    }
  }

  configure(options = {}) {
    this.config = { ...this.config, ...options }
  }

  setMinLevel(level) {
    if (level in levelOrder) this.config.minLevel = level
  }

  enableProdWarnings(enabled = true) {
    this.config.allowProdWarnings = enabled
  }

  shouldOutput(level, tag) {
    if (!this.config.enabled) return false

    // tag 过滤
    if (this.config.includeTags?.length && !this.config.includeTags.includes(tag)) {
      return false
    }
    if (this.config.excludeTags?.length && this.config.excludeTags.includes(tag)) {
      return false
    }

    // 环境过滤
    if (!this.isDev) {
      if (level === 'error') return true
      if (level === 'warn') return !!this.config.allowProdWarnings
      return false
    }

    // 开发环境级别过滤
    const min = levelOrder[this.config.minLevel] ?? 0
    const current = levelOrder[level] ?? 0
    return current >= min
  }

  formatPrefix(level, tag) {
    const parts = []
    if (this.config.showTimestamp) parts.push(`[${getTimestamp()}]`)
    if (this.config.showLevel) parts.push(level.toUpperCase())
    if (this.config.showTag && tag) parts.push(`[${tag}]`)
    return parts.join(' ')
  }

  log(level = 'info', tag = '', ...args) {
    if (!this.shouldOutput(level, tag)) return
    const prefix = this.formatPrefix(level, tag)
    switch (level) {
      case 'error':
        console.error(prefix, ...args)
        break
      case 'warn':
        console.warn(prefix, ...args)
        break
      case 'debug':
        console.debug(prefix, ...args)
        break
      default:
        console.info(prefix, ...args)
        break
    }
  }

  debug(tag, ...args) { this.log('debug', tag, ...args) }
  info(tag, ...args) { this.log('info', tag, ...args) }
  warn(tag, ...args) { this.log('warn', tag, ...args) }
  error(tag, ...args) { this.log('error', tag, ...args) }

  // 性能计时：包装异步/同步函数，记录耗时
  async time(operation, fn, tag = 'Performance') {
    const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
    try {
      const result = await fn()
      const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
      const cost = (end - start).toFixed(2)
      this.info(tag, `${operation} 耗时: ${cost}ms`)
      return result
    } catch (error) {
      const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
      const cost = (end - start).toFixed(2)
      this.error(tag, `${operation} 失败 (耗时: ${cost}ms):`, error)
      throw error
    }
  }

  // 创建模块专用 logger
  module(tag) {
    return {
      debug: (...args) => this.debug(tag, ...args),
      info: (...args) => this.info(tag, ...args),
      warn: (...args) => this.warn(tag, ...args),
      error: (...args) => this.error(tag, ...args)
    }
  }
}

const logManager = new LogManager()
export default logManager
export { LogManager, logManager }