/**
 * 营销画布统一事件总线
 * 基于UnifiedEventBus构建，专门处理营销画布相关事件
 * 提供类型安全的事件管理和预检查机制
 */

import { globalEventBus, type EventBusInstance } from './UnifiedEventBus'
import { CanvasEventTypes } from './CanvasEventTypes'
import { EventTypeValidator } from './EventTypeValidator'

/**
 * 画布事件总线配置
 */
export interface CanvasEventBusConfig {
  enableValidation: boolean
  enableDebug: boolean
  enableStats: boolean
  maxEventQueueSize: number
}

/**
 * 画布事件统计信息
 */
export interface CanvasEventStats {
  totalCanvasEvents: number
  eventTypeCounts: Record<string, number>
  errorCount: number
  averageProcessingTime: number
  lastEventTime?: number
}

/**
 * 营销画布统一事件总线
 * 单一事件源，统一管理所有画布相关事件
 */
export class CanvasEventBus {
  private static instance: CanvasEventBus | null = null
  private eventBus: EventBusInstance
  private validator: EventTypeValidator
  private config: CanvasEventBusConfig
  private stats: CanvasEventStats
  private eventQueue: Array<{ event: string; data: any; timestamp: number }> = []
  private destroyed = false

  /**
   * 私有构造函数 - 单例模式
   */
  private constructor(config: Partial<CanvasEventBusConfig> = {}) {
    this.config = {
      enableValidation: true,
      enableDebug: false,
      enableStats: true,
      maxEventQueueSize: 1000,
      ...config
    }

    // 使用现有的全局事件总线实例，确保应用级统一
    this.eventBus = globalEventBus
    this.validator = new EventTypeValidator()
    this.stats = {
      totalCanvasEvents: 0,
      eventTypeCounts: {},
      errorCount: 0,
      averageProcessingTime: 0
    }

    // 设置调试模式
    if (this.config.enableDebug) {
      this.eventBus.setDebugMode(true)
    }

    // 注册错误处理器
    this.setupErrorHandler()
    
    this.debugLog('CanvasEventBus initialized', this.config)
  }

  /**
   * 获取单例实例
   */
  public static getInstance(config?: Partial<CanvasEventBusConfig>): CanvasEventBus {
    if (!CanvasEventBus.instance) {
      CanvasEventBus.instance = new CanvasEventBus(config)
    }
    return CanvasEventBus.instance
  }

  /**
   * 订阅画布事件
   */
  public on<T = any>(
    event: string,
    handler: (data: T) => void | Promise<void>,
    options: { priority?: number; once?: boolean } = {}
  ): void {
    if (this.destroyed) {
      console.warn('CanvasEventBus has been destroyed')
      return
    }

    // 事件类型验证
    if (this.config.enableValidation && !this.validator.validateEventType(event)) {
      console.error(`Invalid canvas event type: ${event}`)
      return
    }

    // 使用画布事件命名空间
    const canvasEvent = this.formatCanvasEvent(event)
    
    this.eventBus.on(canvasEvent, handler, options)
    this.debugLog(`Subscribed to canvas event: ${canvasEvent}`)
  }

  /**
   * 一次性订阅画布事件
   */
  public once<T = any>(
    event: string,
    handler: (data: T) => void | Promise<void>,
    options: { priority?: number } = {}
  ): void {
    this.on(event, handler, { ...options, once: true })
  }

  /**
   * 取消订阅画布事件
   */
  public off<T = any>(event: string, handler: (data: T) => void | Promise<void>): void {
    if (this.destroyed) return

    const canvasEvent = this.formatCanvasEvent(event)
    this.eventBus.off(canvasEvent, handler)
    this.debugLog(`Unsubscribed from canvas event: ${canvasEvent}`)
  }

  /**
   * 发布画布事件（同步）
   */
  public emit<T = any>(event: string, data?: T): void {
    if (this.destroyed) return

    const startTime = performance.now()

    try {
      // 在验证前进行统一数据轻量化与可序列化清理
      const sanitized = this.sanitizeData(data)
      // 事件数据验证
      if (this.config.enableValidation && !this.validator.validateEventData(event, sanitized)) {
        console.error(`Invalid canvas event data for event: ${event}`, sanitized)
        return
      }

      // 添加到事件队列
      this.addToQueue(event, sanitized)

      // 格式化事件名称
      const canvasEvent = this.formatCanvasEvent(event)

      // 更新统计信息
      this.updateStats(event, startTime)

      // 发布事件
      this.eventBus.emit(canvasEvent, sanitized)
      
      this.debugLog(`Emitted canvas event: ${canvasEvent}`, sanitized)
    } catch (error) {
      this.handleError(event, error as Error, data)
    }
  }

  /**
   * 发布画布事件（异步）
   */
  public async emitAsync<T = any>(event: string, data?: T): Promise<void> {
    if (this.destroyed) return

    const startTime = performance.now()

    try {
      // 统一数据轻量化
      const sanitized = this.sanitizeData(data)
      // 事件数据验证
      if (this.config.enableValidation && !this.validator.validateEventData(event, sanitized)) {
        console.error(`Invalid canvas event data for event: ${event}`, sanitized)
        return
      }

      // 添加到事件队列
      this.addToQueue(event, sanitized)

      // 格式化事件名称
      const canvasEvent = this.formatCanvasEvent(event)

      // 更新统计信息
      this.updateStats(event, startTime)

      // 异步发布事件
      await this.eventBus.emitAsync(canvasEvent, sanitized)
      
      this.debugLog(`Emitted async canvas event: ${canvasEvent}`, sanitized)
    } catch (error) {
      this.handleError(event, error as Error, data)
    }
  }

  /**
   * 获取画布事件统计信息
   */
  public getCanvasStats(): CanvasEventStats {
    return { ...this.stats }
  }

  /**
   * 获取事件队列
   */
  public getEventQueue(): Array<{ event: string; data: any; timestamp: number }> {
    return [...this.eventQueue]
  }

  /**
   * 清空事件队列
   */
  public clearEventQueue(): void {
    this.eventQueue = []
    this.debugLog('Canvas event queue cleared')
  }

  /**
   * 设置调试模式
   */
  public setDebugMode(enabled: boolean): void {
    this.config.enableDebug = enabled
    this.eventBus.setDebugMode(enabled)
    this.debugLog(`Canvas debug mode ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * 销毁画布事件总线
   */
  public destroy(): void {
    if (this.destroyed) return

    // 清空事件队列
    this.clearEventQueue()

    // 清除画布相关的监听器
    this.eventBus.offNamespace('canvas')

    // 销毁实例
    CanvasEventBus.instance = null
    this.destroyed = true

    this.debugLog('CanvasEventBus destroyed')
  }

  /**
   * 格式化画布事件名称
   * 统一使用 canvas: 前缀命名空间
   */
  private formatCanvasEvent(event: string): string {
    // 如果已经包含canvas:前缀，直接使用
    if (event.startsWith('canvas:')) {
      return event
    }
    // 否则添加canvas:前缀
    return `canvas:${event}`
  }

  /**
   * 添加到事件队列
   */
  private addToQueue<T = any>(event: string, data?: T): void {
    if (this.eventQueue.length >= this.config.maxEventQueueSize) {
      // 队列满时移除最老的事件
      this.eventQueue.shift()
    }

    this.eventQueue.push({
      event,
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 更新统计信息
   */
  private updateStats(event: string, startTime: number): void {
    if (!this.config.enableStats) return

    const processingTime = performance.now() - startTime
    
    this.stats.totalCanvasEvents++
    this.stats.eventTypeCounts[event] = (this.stats.eventTypeCounts[event] || 0) + 1
    this.stats.lastEventTime = Date.now()

    // 更新平均处理时间
    const totalEvents = this.stats.totalCanvasEvents
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (totalEvents - 1) + processingTime) / totalEvents
  }

  /**
   * 设置错误处理器
   */
  private setupErrorHandler(): void {
    this.eventBus.onError((errorInfo) => {
      this.stats.errorCount++
      this.debugLog('Canvas event error', errorInfo)
      
      // 可以在这里添加额外的错误处理逻辑
      console.error('Canvas EventBus Error:', errorInfo.error)
    })
  }

  /**
   * 处理错误
   */
  private handleError(event: string, error: Error, data?: any): void {
    this.stats.errorCount++
    this.debugLog(`Canvas event error for ${event}:`, { error, data })
    
    console.error(`Canvas Event Error [${event}]:`, error)
  }

  /**
   * 调试日志
   */
  private debugLog(message: string, data?: any): void {
    if (this.config.enableDebug) {
      console.log(`[CanvasEventBus] ${message}`, data || '')
    }
  }

  // 统一数据清理，确保可序列化且体积轻量
  private sanitizeData<T = any>(data: T): any {
    if (data === null || data === undefined) return data

    const seen = new WeakSet()

    const isDomElement = (val: any): val is Element => {
      return val && typeof val === 'object' && typeof (val as Element).tagName === 'string' && !!(val as Element).ownerDocument
    }

    const serializeDom = (el: Element) => ({
      tag: el.tagName,
      id: (el as HTMLElement).id || undefined,
      class: (el as HTMLElement).className || undefined
    })

    const helper = (val: any, depth = 0): any => {
      if (val === null || val === undefined) return val
      // 保留 Error 对象原始引用，避免错误信息丢失
      if (val instanceof Error) return val
      if (depth > 4) return undefined // 限制深度，防止过深对象导致体积膨胀

      const t = typeof val
      if (t === 'string' || t === 'number' || t === 'boolean') return val
      if (t === 'bigint' || t === 'symbol' || t === 'function') return undefined

      if (Array.isArray(val)) {
        return val.map(v => helper(v, depth + 1)).filter(v => v !== undefined)
      }

      if (isDomElement(val)) {
        return serializeDom(val)
      }

      if (val instanceof Date) return val.toISOString()
      if (val instanceof Map) return Array.from(val.entries()).map(([k, v]) => [helper(k, depth + 1), helper(v, depth + 1)])
      if (val instanceof Set) return Array.from(val.values()).map(v => helper(v, depth + 1))

      if (t === 'object') {
        if (seen.has(val)) return undefined // 去重避免循环
        seen.add(val)
        const out: Record<string, any> = {}
        for (const key of Object.keys(val)) {
          const v = (val as any)[key]
          if (key === 'originalEvent') continue
          // 嵌套属性中保留 Error 实例
          if (v instanceof Error) {
            out[key] = v
            continue
          }
          const sv = helper(v, depth + 1)
          if (sv !== undefined) out[key] = sv
        }
        return out
      }

      try {
        return JSON.parse(JSON.stringify(val))
      } catch {
        return undefined
      }
    }

    return helper(data, 0)
  }
}

/**
 * 画布事件总线实例
 * 全局单例，确保整个应用使用统一的事件总线
 */
export const canvasEventBus = CanvasEventBus.getInstance()

/**
 * 快捷访问函数
 */
export const canvasOn = canvasEventBus.on.bind(canvasEventBus)
export const canvasOnce = canvasEventBus.once.bind(canvasEventBus)
export const canvasOff = canvasEventBus.off.bind(canvasEventBus)
export const canvasEmit = canvasEventBus.emit.bind(canvasEventBus)
export const canvasEmitAsync = canvasEventBus.emitAsync.bind(canvasEventBus)

export default CanvasEventBus