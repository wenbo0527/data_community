import { UnifiedEventBus } from './UnifiedEventBus'

// 错误级别枚举
export enum ErrorLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4
}

// 错误上下文接口
export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  source?: string
  [key: string]: any
}

// 错误信息接口
export interface ErrorInfo {
  error: Error
  context: ErrorContext
  level: ErrorLevel
  timestamp: number
}

// 错误分组接口
export interface ErrorGroup {
  groupId: string
  count: number
  errors: ErrorInfo[]
  firstOccurrence: number
  lastOccurrence: number
}

// 错误统计接口
export interface ErrorStats {
  total: number
  byLevel: Record<ErrorLevel, number>
  byComponent: Record<string, number>
  recentErrors: ErrorInfo[]
}

// 错误过滤器类型
export type ErrorFilter = (info: ErrorInfo) => boolean

// 错误转换器类型
export type ErrorTransformer = (info: ErrorInfo) => ErrorInfo

// 错误分组条件类型
export type ErrorGroupingCriteria = (info: ErrorInfo) => string | null

// 错误分组选项接口
export interface ErrorGroupingOptions {
  maxErrorsPerGroup?: number
  groupTimeout?: number // 分组超时时间（毫秒）
}

// 错误处理器配置接口
export interface ErrorHandlerConfig {
  minimumLevel?: ErrorLevel
  enableGlobalHandlers?: boolean
  maxRecentErrors?: number
  groupingEnabled?: boolean
  groupingOptions?: ErrorGroupingOptions
}

/**
 * 统一错误处理器
 * 提供错误捕获、过滤、转换、分组和统计功能
 */
export class ErrorHandler {
  private eventBus: UnifiedEventBus
  private config: Required<ErrorHandlerConfig>
  private filters: ErrorFilter[] = []
  private transformers: ErrorTransformer[] = []
  private errorGroups = new Map<string, ErrorGroup>()
  private groupingCriteria?: ErrorGroupingCriteria
  private stats: ErrorStats = {
    total: 0,
    byLevel: {
      [ErrorLevel.DEBUG]: 0,
      [ErrorLevel.INFO]: 0,
      [ErrorLevel.WARNING]: 0,
      [ErrorLevel.ERROR]: 0,
      [ErrorLevel.CRITICAL]: 0
    },
    byComponent: {},
    recentErrors: []
  }
  private errorHandlers: Array<(info: ErrorInfo) => void> = []
  private groupHandlers: Array<(group: ErrorGroup) => void> = []
  private globalHandlersAttached = false

  constructor(
    eventBus: UnifiedEventBus,
    config: ErrorHandlerConfig = {}
  ) {
    this.eventBus = eventBus
    this.config = {
      minimumLevel: config.minimumLevel ?? ErrorLevel.DEBUG,
      enableGlobalHandlers: config.enableGlobalHandlers ?? true,
      maxRecentErrors: config.maxRecentErrors ?? 100,
      groupingEnabled: config.groupingEnabled ?? false,
      groupingOptions: {
        maxErrorsPerGroup: 10,
        groupTimeout: 60000, // 1分钟
        ...config.groupingOptions
      }
    }

    this.setupEventListeners()
    
    if (this.config.enableGlobalHandlers) {
      this.attachGlobalHandlers()
    }
  }

  /**
   * 处理错误
   */
  handleError(
    error: Error,
    context: ErrorContext = {},
    level: ErrorLevel = ErrorLevel.ERROR
  ): void {
    const errorInfo: ErrorInfo = {
      error,
      context: {
        ...context,
        timestamp: Date.now()
      },
      level,
      timestamp: Date.now()
    }

    this.processError(errorInfo)
  }

  /**
   * 处理错误消息
   */
  handleMessage(
    message: string,
    context: ErrorContext = {},
    level: ErrorLevel = ErrorLevel.ERROR
  ): void {
    const error = new Error(message)
    this.handleError(error, context, level)
  }

  /**
   * 设置最小错误级别
   */
  setMinimumLevel(level: ErrorLevel): void {
    this.config.minimumLevel = level
  }

  /**
   * 添加错误过滤器
   */
  addFilter(filter: ErrorFilter): void {
    this.filters.push(filter)
  }

  /**
   * 移除错误过滤器
   */
  removeFilter(filter: ErrorFilter): void {
    const index = this.filters.indexOf(filter)
    if (index > -1) {
      this.filters.splice(index, 1)
    }
  }

  /**
   * 添加错误转换器
   */
  addTransformer(transformer: ErrorTransformer): void {
    this.transformers.push(transformer)
  }

  /**
   * 移除错误转换器
   */
  removeTransformer(transformer: ErrorTransformer): void {
    const index = this.transformers.indexOf(transformer)
    if (index > -1) {
      this.transformers.splice(index, 1)
    }
  }

  /**
   * 设置错误分组功能
   */
  setGroupingEnabled(enabled: boolean): void {
    this.config.groupingEnabled = enabled
  }

  /**
   * 设置错误分组条件
   */
  setGroupingCriteria(criteria: ErrorGroupingCriteria): void {
    this.groupingCriteria = criteria
  }

  /**
   * 设置错误分组选项
   */
  setGroupingOptions(options: ErrorGroupingOptions): void {
    this.config.groupingOptions = {
      ...this.config.groupingOptions,
      ...options
    }
  }

  /**
   * 注册错误处理器
   */
  onError(handler: (info: ErrorInfo) => void): void {
    this.errorHandlers.push(handler)
  }

  /**
   * 注册错误分组处理器
   */
  onErrorGroup(handler: (group: ErrorGroup) => void): void {
    this.groupHandlers.push(handler)
  }

  /**
   * 获取错误统计
   */
  getStats(): ErrorStats {
    return {
      ...this.stats,
      byLevel: { ...this.stats.byLevel },
      byComponent: { ...this.stats.byComponent },
      recentErrors: [...this.stats.recentErrors]
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      total: 0,
      byLevel: {
        [ErrorLevel.DEBUG]: 0,
        [ErrorLevel.INFO]: 0,
        [ErrorLevel.WARNING]: 0,
        [ErrorLevel.ERROR]: 0,
        [ErrorLevel.CRITICAL]: 0
      },
      byComponent: {},
      recentErrors: []
    }
  }

  /**
   * 获取错误分组
   */
  getErrorGroups(): ErrorGroup[] {
    return Array.from(this.errorGroups.values())
  }

  /**
   * 清除错误分组
   */
  clearErrorGroups(): void {
    this.errorGroups.clear()
  }

  /**
   * 销毁错误处理器
   */
  destroy(): void {
    this.detachGlobalHandlers()
    this.errorHandlers = []
    this.groupHandlers = []
    this.filters = []
    this.transformers = []
    this.errorGroups.clear()
    this.resetStats()
  }

  // 私有方法

  private processError(errorInfo: ErrorInfo): void {
    // 检查错误级别
    if (errorInfo.level < this.config.minimumLevel) {
      return
    }

    // 应用过滤器
    if (!this.applyFilters(errorInfo)) {
      return
    }

    // 应用转换器
    const transformedInfo = this.applyTransformers(errorInfo)

    // 更新统计信息
    this.updateStats(transformedInfo)

    // 处理错误分组
    if (this.config.groupingEnabled && this.groupingCriteria) {
      this.handleErrorGrouping(transformedInfo)
    }

    // 通知错误处理器
    this.notifyErrorHandlers(transformedInfo)

    // 发送事件
    this.eventBus.emit('error', transformedInfo)
  }

  private applyFilters(errorInfo: ErrorInfo): boolean {
    return this.filters.every(filter => filter(errorInfo))
  }

  private applyTransformers(errorInfo: ErrorInfo): ErrorInfo {
    return this.transformers.reduce(
      (info, transformer) => transformer(info),
      errorInfo
    )
  }

  private updateStats(errorInfo: ErrorInfo): void {
    this.stats.total++
    this.stats.byLevel[errorInfo.level]++
    
    if (errorInfo.context.component) {
      this.stats.byComponent[errorInfo.context.component] = 
        (this.stats.byComponent[errorInfo.context.component] || 0) + 1
    }

    // 添加到最近错误列表
    this.stats.recentErrors.unshift(errorInfo)
    if (this.stats.recentErrors.length > this.config.maxRecentErrors) {
      this.stats.recentErrors = this.stats.recentErrors.slice(0, this.config.maxRecentErrors)
    }
  }

  private handleErrorGrouping(errorInfo: ErrorInfo): void {
    if (!this.groupingCriteria) return

    const groupId = this.groupingCriteria(errorInfo)
    if (!groupId) return

    let group = this.errorGroups.get(groupId)
    const isNewGroup = !group
    
    if (!group) {
      group = {
        groupId,
        count: 0,
        errors: [],
        firstOccurrence: errorInfo.timestamp,
        lastOccurrence: errorInfo.timestamp
      }
      this.errorGroups.set(groupId, group)
    }

    group.count++
    group.lastOccurrence = errorInfo.timestamp
    
    // 添加错误到分组，限制数量
    group.errors.push(errorInfo)
    if (group.errors.length > this.config.groupingOptions.maxErrorsPerGroup!) {
      group.errors = group.errors.slice(-this.config.groupingOptions.maxErrorsPerGroup!)
    }

    // 只在新分组创建时通知分组处理器
    if (isNewGroup) {
      this.notifyGroupHandlers(group)
    }
  }

  private notifyErrorHandlers(errorInfo: ErrorInfo): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(errorInfo)
      } catch (error) {
        console.error('Error in error handler:', error)
      }
    })
  }

  private notifyGroupHandlers(group: ErrorGroup): void {
    this.groupHandlers.forEach(handler => {
      try {
        handler(group)
      } catch (error) {
        console.error('Error in group handler:', error)
      }
    })
  }

  private setupEventListeners(): void {
    // 不需要监听自己发出的错误事件，避免循环调用
    // 错误处理逻辑已经在processError中完成
  }

  private attachGlobalHandlers(): void {
    if (this.globalHandlersAttached || typeof window === 'undefined') {
      return
    }

    // 捕获未处理的Promise异常
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
    
    // 捕获全局错误
    window.addEventListener('error', this.handleGlobalError)
    
    this.globalHandlersAttached = true
  }

  private detachGlobalHandlers(): void {
    if (!this.globalHandlersAttached || typeof window === 'undefined') {
      return
    }

    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
    window.removeEventListener('error', this.handleGlobalError)
    
    this.globalHandlersAttached = false
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason))
    
    this.handleError(error, {
      source: 'unhandledrejection',
      url: window.location.href,
      userAgent: navigator.userAgent
    }, ErrorLevel.ERROR)
  }

  private handleGlobalError = (event: ErrorEvent): void => {
    const error = event.error || new Error(event.message)
    
    this.handleError(error, {
      source: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href,
      userAgent: navigator.userAgent
    }, ErrorLevel.ERROR)
  }
}

// 导入全局事件总线
import { globalEventBus } from './UnifiedEventBus'

// 导出全局实例
export const globalErrorHandler = new ErrorHandler(globalEventBus)