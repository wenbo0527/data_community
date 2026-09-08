/**
 * 统一事件总线系统
 * 提供类型安全的事件订阅、发布、命名空间管理等功能
 */

export interface EventListener<T = any> {
  handler: (data: T) => void | Promise<void>
  priority: number
  once: boolean
  namespace?: string
}

export interface EventOptions {
  priority?: number
  once?: boolean
}

export interface EventStats {
  totalEvents: number
  totalListeners: number
  eventCounts: Record<string, number>
  namespaces: string[]
}

export interface EventError {
  error: Error
  event: string
  data: any
  listener: EventListener
}

export class UnifiedEventBus {
  private listeners: Map<string, EventListener[]> = new Map()
  private stats: EventStats = {
    totalEvents: 0,
    totalListeners: 0,
    eventCounts: {},
    namespaces: []
  }
  private errorHandlers: ((error: EventError) => void)[] = []
  private debugMode = false
  private destroyed = false

  /**
   * 订阅事件
   */
  on<T = any>(
    event: string,
    handler: (data: T) => void | Promise<void>,
    options: EventOptions = {}
  ): void {
    if (this.destroyed) {
      console.warn('EventBus has been destroyed')
      return
    }

    const listener: EventListener<T> = {
      handler,
      priority: options.priority ?? 0,
      once: options.once ?? false,
      namespace: this.extractNamespace(event)
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    const eventListeners = this.listeners.get(event)!
    eventListeners.push(listener)
    
    // 按优先级排序（高优先级在前）
    eventListeners.sort((a, b) => b.priority - a.priority)

    this.updateStats()
    this.debugLog(`Subscribed to event: ${event}`, { priority: listener.priority, once: listener.once })
  }

  /**
   * 一次性事件订阅
   */
  once<T = any>(
    event: string,
    handler: (data: T) => void | Promise<void>,
    options: Omit<EventOptions, 'once'> = {}
  ): void {
    this.on(event, handler, { ...options, once: true })
  }

  /**
   * 取消订阅事件
   */
  off<T = any>(
    event: string,
    handler: (data: T) => void | Promise<void>
  ): void {
    if (this.destroyed) return

    const eventListeners = this.listeners.get(event)
    if (!eventListeners) return

    const index = eventListeners.findIndex(listener => listener.handler === handler)
    if (index !== -1) {
      eventListeners.splice(index, 1)
      if (eventListeners.length === 0) {
        this.listeners.delete(event)
      }
      this.updateStats()
      this.debugLog(`Unsubscribed from event: ${event}`)
    }
  }

  /**
   * 取消订阅命名空间下的所有事件
   */
  offNamespace(namespace: string): void {
    if (this.destroyed) return

    const eventsToRemove: string[] = []
    
    for (const [event, listeners] of this.listeners.entries()) {
      const filteredListeners = listeners.filter(
        listener => listener.namespace !== namespace
      )
      
      if (filteredListeners.length === 0) {
        eventsToRemove.push(event)
      } else {
        this.listeners.set(event, filteredListeners)
      }
    }
    
    eventsToRemove.forEach(event => this.listeners.delete(event))
    this.updateStats()
    this.debugLog(`Unsubscribed from namespace: ${namespace}`)
  }

  /**
   * 发布事件（同步）
   */
  emit<T = any>(event: string, data?: T): void {
    if (this.destroyed) return

    const eventListeners = this.listeners.get(event)
    if (!eventListeners || eventListeners.length === 0) {
      this.debugLog(`No listeners for event: ${event}`)
      return
    }

    this.debugLog(`Emitting event: ${event}`, data)
    
    // 记录统计信息
    this.stats.totalEvents++
    this.stats.eventCounts[event] = (this.stats.eventCounts[event] || 0) + 1

    // 执行监听器
    const listenersToRemove: EventListener[] = []
    
    for (const listener of eventListeners) {
      try {
        listener.handler(data)
        
        if (listener.once) {
          listenersToRemove.push(listener)
        }
      } catch (error) {
        this.handleError({
          error: error as Error,
          event,
          data,
          listener
        })
      }
    }

    // 移除一次性监听器
    if (listenersToRemove.length > 0) {
      const remainingListeners = eventListeners.filter(
        listener => !listenersToRemove.includes(listener)
      )
      
      if (remainingListeners.length === 0) {
        this.listeners.delete(event)
      } else {
        this.listeners.set(event, remainingListeners)
      }
      
      this.updateStats()
    }
  }

  /**
   * 发布事件（异步）
   */
  async emitAsync<T = any>(event: string, data?: T): Promise<void> {
    if (this.destroyed) return

    const eventListeners = this.listeners.get(event)
    if (!eventListeners || eventListeners.length === 0) {
      this.debugLog(`No listeners for event: ${event}`)
      return
    }

    this.debugLog(`Emitting async event: ${event}`, data)
    
    // 记录统计信息
    this.stats.totalEvents++
    this.stats.eventCounts[event] = (this.stats.eventCounts[event] || 0) + 1

    // 执行监听器
    const listenersToRemove: EventListener[] = []
    const promises: Promise<void>[] = []
    
    for (const listener of eventListeners) {
      const promise = Promise.resolve().then(async () => {
        try {
          await listener.handler(data)
          
          if (listener.once) {
            listenersToRemove.push(listener)
          }
        } catch (error) {
          this.handleError({
            error: error as Error,
            event,
            data,
            listener
          })
        }
      })
      
      promises.push(promise)
    }

    // 等待所有监听器完成
    await Promise.all(promises)

    // 移除一次性监听器
    if (listenersToRemove.length > 0) {
      const remainingListeners = eventListeners.filter(
        listener => !listenersToRemove.includes(listener)
      )
      
      if (remainingListeners.length === 0) {
        this.listeners.delete(event)
      } else {
        this.listeners.set(event, remainingListeners)
      }
      
      this.updateStats()
    }
  }

  /**
   * 注册错误处理器
   */
  onError(handler: (error: EventError) => void): void {
    this.errorHandlers.push(handler)
  }

  /**
   * 获取统计信息
   */
  getStats(): EventStats {
    return { ...this.stats }
  }

  /**
   * 设置调试模式
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.listeners.clear()
    this.updateStats()
    this.debugLog('All listeners cleared')
  }

  /**
   * 销毁事件总线
   */
  destroy(): void {
    this.clear()
    this.errorHandlers.length = 0
    this.destroyed = true
    this.debugLog('EventBus destroyed')
  }

  /**
   * 提取事件命名空间
   */
  private extractNamespace(event: string): string | undefined {
    const parts = event.split(':')
    return parts.length > 1 ? parts[0] : undefined
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.totalListeners = Array.from(this.listeners.values())
      .reduce((total, listeners) => total + listeners.length, 0)
    
    this.stats.namespaces = Array.from(
      new Set(
        Array.from(this.listeners.values())
          .flat()
          .map(listener => listener.namespace)
          .filter(Boolean)
      )
    ) as string[]
  }

  /**
   * 处理错误
   */
  private handleError(errorInfo: EventError): void {
    this.debugLog('Event handler error:', errorInfo.error)
    
    for (const handler of this.errorHandlers) {
      try {
        handler(errorInfo)
      } catch (error) {
        console.error('Error in error handler:', error)
      }
    }
  }

  /**
   * 调试日志
   */
  private debugLog(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[EventBus] ${message}`, data || '')
    }
  }
}

// 创建全局事件总线实例
export const globalEventBus = new UnifiedEventBus()

// 导出事件类型定义
export type EventBusInstance = UnifiedEventBus