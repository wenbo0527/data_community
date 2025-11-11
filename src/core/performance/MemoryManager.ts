import { CanvasEventSystem } from '../index'

export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  timestamp: number
}

export interface MemoryLeakDetector {
  threshold: number
  callback: (info: MemoryInfo) => void
}

export class MemoryManager {
  private static instance: MemoryManager
  private listeners: Map<string, Set<Function>> = new Map()
  private eventCache: Map<string, any[]> = new Map()
  private memoryHistory: MemoryInfo[] = []
  private leakDetectors: Map<string, MemoryLeakDetector> = new Map()
  private cleanupInterval: number | null = null
  private readonly CLEANUP_INTERVAL = 30000 // 30秒
  private readonly MAX_CACHE_SIZE = 1000
  private readonly MAX_HISTORY_SIZE = 50

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager()
    }
    return MemoryManager.instance
  }

  /**
   * 初始化内存管理
   */
  initialize(): void {
    this.startCleanupTimer()
    this.setupMemoryMonitoring()
  }

  /**
   * 销毁内存管理
   */
  destroy(): void {
    this.stopCleanupTimer()
    this.clearAll()
  }

  /**
   * 设置内存监控
   */
  private setupMemoryMonitoring(): void {
    // 监听事件总线事件
    CanvasEventSystem.eventBus.on('*', this.trackEvent.bind(this))
    
    // 监听内存警告
    this.addMemoryLeakDetector('critical', {
      threshold: 0.9, // 90% 内存使用率
      callback: (info: MemoryInfo) => {
        console.warn('Critical memory usage detected:', info)
        this.handleMemoryPressure()
      }
    })

    this.addMemoryLeakDetector('warning', {
      threshold: 0.8, // 80% 内存使用率
      callback: (info: MemoryInfo) => {
        console.warn('High memory usage detected:', info)
        this.performCleanup()
      }
    })
  }

  /**
   * 跟踪事件
   */
  private trackEvent(eventName: string, data: any): void {
    const eventKey = `event:${eventName}`
    
    if (!this.eventCache.has(eventKey)) {
      this.eventCache.set(eventKey, [])
    }

    const cache = this.eventCache.get(eventKey)!
    cache.push({
      timestamp: Date.now(),
      data: this.cloneData(data),
      size: this.estimateObjectSize(data)
    })

    // 限制缓存大小
    if (cache.length > this.MAX_CACHE_SIZE / 10) {
      cache.splice(0, cache.length - this.MAX_CACHE_SIZE / 20)
    }

    // 检查内存使用
    this.checkMemoryUsage()
  }

  /**
   * 克隆数据（避免引用）
   */
  private cloneData(data: any): any {
    try {
      return JSON.parse(JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to clone data:', error)
      return data
    }
  }

  /**
   * 估算对象大小（字节）
   */
  private estimateObjectSize(obj: any): number {
    try {
      return new Blob([JSON.stringify(obj)]).size
    } catch (error) {
      return 1024 // 默认1KB
    }
  }

  /**
   * 添加事件监听器（带内存管理）
   */
  addEventListener(eventName: string, callback: Function): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }

    this.listeners.get(eventName)!.add(callback)

    // 返回清理函数
    return () => {
      this.removeEventListener(eventName, callback)
    }
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(eventName: string, callback: Function): void {
    const callbacks = this.listeners.get(eventName)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(eventName)
      }
    }
  }

  /**
   * 添加内存泄漏检测器
   */
  addMemoryLeakDetector(name: string, detector: MemoryLeakDetector): void {
    this.leakDetectors.set(name, detector)
  }

  /**
   * 检查内存使用
   */
  private checkMemoryUsage(): void {
    const memoryInfo = this.getCurrentMemoryInfo()
    if (!memoryInfo) {
      return
    }

    // 记录内存历史
    this.memoryHistory.push(memoryInfo)
    if (this.memoryHistory.length > this.MAX_HISTORY_SIZE) {
      this.memoryHistory.shift()
    }

    // 检查泄漏检测器
    this.leakDetectors.forEach((detector, name) => {
      const usageRate = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit
      if (usageRate > detector.threshold) {
        detector.callback(memoryInfo)
      }
    })

    // 检测内存泄漏
    this.detectMemoryLeak()
  }

  /**
   * 获取当前内存信息
   */
  private getCurrentMemoryInfo(): MemoryInfo | null {
    const memory = (performance as any).memory
    if (!memory) {
      return null
    }

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now()
    }
  }

  /**
   * 检测内存泄漏
   */
  private detectMemoryLeak(): void {
    if (this.memoryHistory.length < 10) {
      return
    }

    const recent = this.memoryHistory.slice(-10)
    const older = this.memoryHistory.slice(-20, -10)

    if (older.length === 0) {
      return
    }

    const recentAvg = recent.reduce((sum, info) => sum + info.usedJSHeapSize, 0) / recent.length
    const olderAvg = older.reduce((sum, info) => sum + info.usedJSHeapSize, 0) / older.length

    const growthRate = (recentAvg - olderAvg) / olderAvg

    // 如果内存增长超过50%，可能存在内存泄漏
    if (growthRate > 0.5) {
      console.warn(`Potential memory leak detected: ${(growthRate * 100).toFixed(2)}% growth`)
      this.analyzeMemoryUsage()
    }
  }

  /**
   * 分析内存使用
   */
  private analyzeMemoryUsage(): void {
    const analysis = {
      listeners: this.getListenersMemoryUsage(),
      eventCache: this.getEventCacheMemoryUsage(),
      totalListeners: this.getTotalListeners(),
      totalCachedEvents: this.getTotalCachedEvents(),
      largestEventCache: this.getLargestEventCache(),
      oldestEventCache: this.getOldestEventCache()
    }

    console.warn('Memory usage analysis:', analysis)
  }

  /**
   * 获取监听器内存使用
   */
  private getListenersMemoryUsage(): number {
    let totalSize = 0
    this.listeners.forEach(callbacks => {
      totalSize += callbacks.size * 1024 // 估算每个监听器1KB
    })
    return totalSize
  }

  /**
   * 获取事件缓存内存使用
   */
  private getEventCacheMemoryUsage(): number {
    let totalSize = 0
    this.eventCache.forEach(cache => {
      cache.forEach(event => {
        totalSize += event.size
      })
    })
    return totalSize
  }

  /**
   * 获取总监听器数量
   */
  private getTotalListeners(): number {
    let total = 0
    this.listeners.forEach(callbacks => {
      total += callbacks.size
    })
    return total
  }

  /**
   * 获取总缓存事件数量
   */
  private getTotalCachedEvents(): number {
    let total = 0
    this.eventCache.forEach(cache => {
      total += cache.length
    })
    return total
  }

  /**
   * 获取最大的事件缓存
   */
  private getLargestEventCache(): { name: string; size: number } {
    let largest = { name: '', size: 0 }
    this.eventCache.forEach((cache, name) => {
      const size = cache.reduce((sum, event) => sum + event.size, 0)
      if (size > largest.size) {
        largest = { name, size }
      }
    })
    return largest
  }

  /**
   * 获取最老的事件缓存
   */
  private getOldestEventCache(): { name: string; age: number } {
    let oldest = { name: '', age: 0 }
    this.eventCache.forEach((cache, name) => {
      if (cache.length > 0) {
        const oldestEvent = cache[0]
        const age = Date.now() - oldestEvent.timestamp
        if (age > oldest.age) {
          oldest = { name, age }
        }
      }
    })
    return oldest
  }

  /**
   * 处理内存压力
   */
  private handleMemoryPressure(): void {
    console.warn('Handling memory pressure...')
    
    // 执行清理操作
    this.performCleanup()
    
    // 建议垃圾回收
    if ((window as any).gc) {
      (window as any).gc()
    }
  }

  /**
   * 执行清理
   */
  private performCleanup(): void {
    console.warn('Performing memory cleanup...')

    // 清理事件缓存
    this.cleanupEventCache()
    
    // 清理过期监听器
    this.cleanupListeners()
    
    // 清理内存历史
    this.cleanupMemoryHistory()
  }

  /**
   * 清理事件缓存
   */
  private cleanupEventCache(): void {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5分钟

    this.eventCache.forEach((cache, name) => {
      const validEvents = cache.filter(event => now - event.timestamp < maxAge)
      
      if (validEvents.length !== cache.length) {
        console.warn(`Cleaned up ${cache.length - validEvents.length} old events from ${name}`)
      }
      
      this.eventCache.set(name, validEvents)
    })
  }

  /**
   * 清理监听器
   */
  private cleanupListeners(): void {
    this.listeners.forEach((callbacks, eventName) => {
      // 移除可能已失效的监听器
      const validCallbacks = Array.from(callbacks).filter(callback => {
        try {
          // 简单的有效性检查
          return callback !== null && callback !== undefined
        } catch {
          return false
        }
      })

      if (validCallbacks.length !== callbacks.size) {
        console.warn(`Cleaned up ${callbacks.size - validCallbacks.length} invalid listeners from ${eventName}`)
      }

      this.listeners.set(eventName, new Set(validCallbacks))
    })
  }

  /**
   * 清理内存历史
   */
  private cleanupMemoryHistory(): void {
    const now = Date.now()
    const maxAge = 10 * 60 * 1000 // 10分钟

    const validHistory = this.memoryHistory.filter(info => now - info.timestamp < maxAge)
    
    if (validHistory.length !== this.memoryHistory.length) {
      console.warn(`Cleaned up ${this.memoryHistory.length - validHistory.length} old memory records`)
    }

    this.memoryHistory = validHistory
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.cleanupInterval) {
      return
    }

    this.cleanupInterval = window.setInterval(() => {
      this.performCleanup()
    }, this.CLEANUP_INTERVAL)
  }

  /**
   * 停止清理定时器
   */
  private stopCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * 获取内存报告
   */
  getMemoryReport(): any {
    const currentMemory = this.getCurrentMemoryInfo()
    
    return {
      currentMemory,
      memoryHistory: this.memoryHistory,
      listenersCount: this.getTotalListeners(),
      cachedEventsCount: this.getTotalCachedEvents(),
      eventCacheSize: this.getEventCacheMemoryUsage(),
      listenersSize: this.getListenersMemoryUsage(),
      largestCache: this.getLargestEventCache(),
      oldestCache: this.getOldestEventCache(),
      leakDetectors: Array.from(this.leakDetectors.keys())
    }
  }

  /**
   * 清理所有资源
   */
  clearAll(): void {
    this.listeners.clear()
    this.eventCache.clear()
    this.memoryHistory = []
    this.leakDetectors.clear()
  }

  /**
   * 获取内存使用摘要
   */
  getMemorySummary(): any {
    const currentMemory = this.getCurrentMemoryInfo()
    const totalMemoryUsage = this.getListenersMemoryUsage() + this.getEventCacheMemoryUsage()

    return {
      currentMemory,
      totalMemoryUsage,
      listenersCount: this.getTotalListeners(),
      cachedEventsCount: this.getTotalCachedEvents(),
      memoryPressure: currentMemory ? (currentMemory.usedJSHeapSize / currentMemory.jsHeapSizeLimit) : 0,
      recommendations: this.getMemoryRecommendations()
    }
  }

  /**
   * 获取内存优化建议
   */
  private getMemoryRecommendations(): string[] {
    const recommendations: string[] = []
    const summary = this.getMemorySummary()

    if (summary.listenersCount > 1000) {
      recommendations.push('Consider reducing the number of event listeners')
    }

    if (summary.cachedEventsCount > 5000) {
      recommendations.push('Consider reducing event cache size or frequency')
    }

    if (summary.memoryPressure > 0.8) {
      recommendations.push('High memory pressure detected, consider cleanup')
    }

    return recommendations
  }
}