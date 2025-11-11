/**
 * 统一日志管理器
 * - 支持日志级别控制（debug/info/warn/error/none）
 * - 模块化标签过滤
 * - 区分开发/生产环境
 * - 统一格式化输出与性能计时
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'

interface LogConfig {
  enabled: boolean
  minLevel: LogLevel
  enabledTags: Set<string> | null
  includeTimestamp: boolean
  useEmoji: boolean
}

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  none: 100
}

function isDevEnv(): boolean {
  try {
    // Vite / Node / Host 判断
    // @ts-ignore
    return !!(import.meta?.env?.DEV) ||
           // @ts-ignore
           import.meta?.env?.MODE === 'development' ||
           process.env.NODE_ENV === 'development' ||
           (typeof window !== 'undefined' && (
             window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
           ))
  } catch (_) {
    return true
  }
}

export class LogManager {
  private config: LogConfig

  constructor(initial?: Partial<LogConfig>) {
    this.config = {
      enabled: true,
      minLevel: isDevEnv() ? 'debug' : 'warn',
      enabledTags: null, // null 表示所有标签都允许
      includeTimestamp: true,
      useEmoji: true,
      ...initial
    }
  }

  setEnabled(enabled: boolean) {
    this.config.enabled = enabled
  }

  setMinLevel(level: LogLevel) {
    this.config.minLevel = level
  }

  enableTags(tags: string[] | null) {
    this.config.enabledTags = tags ? new Set(tags.map(t => t.toLowerCase())) : null
  }

  private passLevel(level: LogLevel): boolean {
    return levelPriority[level] >= levelPriority[this.config.minLevel]
  }

  private passTag(tag?: string): boolean {
    if (!this.config.enabledTags || !tag) return true
    return this.config.enabledTags.has(tag.toLowerCase())
  }

  private formatPrefix(level: LogLevel, tag?: string): string {
    const ts = this.config.includeTimestamp ? `[${new Date().toLocaleTimeString()}]` : ''
    const emojiMap: Record<LogLevel, string> = {
      debug: '🔧',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      none: ''
    }
    const emoji = this.config.useEmoji ? emojiMap[level] : ''
    const tagText = tag ? `[${tag}]` : ''
    return `${ts} ${emoji} ${tagText}`.trim()
  }

  log(level: LogLevel, tag?: string, ...args: any[]) {
    if (!this.config.enabled) return
    if (!isDevEnv()) {
      // 生产环境仅输出 warn/error，且需满足阈值
      if (!(level === 'warn' || level === 'error')) return
    }
    if (!this.passLevel(level)) return
    if (!this.passTag(tag)) return

    const prefix = this.formatPrefix(level, tag)
    switch (level) {
      case 'error':
        console.error(prefix, ...args)
        break
      case 'warn':
        console.warn(prefix, ...args)
        break
      case 'info':
        console.info(prefix, ...args)
        break
      case 'debug':
        console.debug(prefix, ...args)
        break
      default:
        // none: 不输出
        break
    }
  }

  createModuleLogger(tag: string) {
    const boundTag = tag
    return {
      debug: (...args: any[]) => this.log('debug', boundTag, ...args),
      info: (...args: any[]) => this.log('info', boundTag, ...args),
      warn: (...args: any[]) => this.log('warn', boundTag, ...args),
      error: (...args: any[]) => this.log('error', boundTag, ...args),
    }
  }

  async time<T>(operation: string, fn: () => Promise<T>, tag?: string): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      this.log('info', tag || 'Performance', `${operation} 耗时: ${(end - start).toFixed(2)}ms`)
      return result
    } catch (error) {
      const end = performance.now()
      this.log('error', tag || 'Performance', `${operation} 失败 (耗时: ${(end - start).toFixed(2)}ms):`, error)
      throw error
    }
  }
}

// 单例实例
export const logManager = new LogManager()