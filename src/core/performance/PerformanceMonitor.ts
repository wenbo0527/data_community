import { CanvasEventSystem } from '../index'

export interface PerformanceMetrics {
  eventProcessingTime: number
  memoryUsage: number
  eventQueueLength: number
  errorCount: number
  warningCount: number
}

export interface PerformanceStats {
  totalEvents: number
  averageProcessingTime: number
  maxProcessingTime: number
  minProcessingTime: number
  memoryUsage: number
  errorRate: number
  timestamp: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private stats: Map<string, PerformanceStats[]> = new Map()
  private monitoring = false
  private monitoringInterval: number | null = null
  private readonly INTERVAL = 5000 // 5秒

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.monitoring) {
      return
    }

    this.monitoring = true
    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics()
    }, this.INTERVAL)

    // 监听事件处理时间
    CanvasEventSystem.eventBus.on('*', this.measureEventProcessingTime.bind(this))
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (!this.monitoring) {
      return
    }

    this.monitoring = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    // 移除事件监听
    CanvasEventSystem.eventBus.off('*', this.measureEventProcessingTime.bind(this))
  }

  /**
   * 测量事件处理时间
   */
  private measureEventProcessingTime(eventName: string, data: any): void {
    const startTime = performance.now()
    
    // 使用微任务来测量事件处理完成时间
    Promise.resolve().then(() => {
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      this.recordEventProcessingTime(eventName, processingTime)
    })
  }

  /**
   * 记录事件处理时间
   */
  private recordEventProcessingTime(eventName: string, processingTime: number): void {
    if (!this.metrics.has(eventName)) {
      this.metrics.set(eventName, {
        eventProcessingTime: 0,
        memoryUsage: 0,
        eventQueueLength: 0,
        errorCount: 0,
        warningCount: 0
      })
    }

    const metric = this.metrics.get(eventName)!
    metric.eventProcessingTime = processingTime

    // 如果处理时间超过阈值，记录警告
    if (processingTime > 100) { // 100ms
      metric.warningCount++
      console.warn(`Event ${eventName} processing took ${processingTime}ms`)
    }
  }

  /**
   * 收集性能指标
   */
  private collectMetrics(): void {
    const memoryInfo = (performance as any).memory
    const currentMemoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize : 0

    this.metrics.forEach((metric, eventName) => {
      // 更新内存使用
      metric.memoryUsage = currentMemoryUsage

      // 计算事件队列长度
      const eventQueueLength = CanvasEventSystem.eventBus.getListenerCount(eventName)
      metric.eventQueueLength = eventQueueLength

      // 记录统计信息
      this.recordStats(eventName, metric)
    })

    // 检查内存泄漏
    this.checkMemoryLeak()
  }

  /**
   * 记录统计信息
   */
  private recordStats(eventName: string, metric: PerformanceMetrics): void {
    if (!this.stats.has(eventName)) {
      this.stats.set(eventName, [])
    }

    const stats = this.stats.get(eventName)!
    const stat: PerformanceStats = {
      totalEvents: stats.length + 1,
      averageProcessingTime: metric.eventProcessingTime,
      maxProcessingTime: metric.eventProcessingTime,
      minProcessingTime: metric.eventProcessingTime,
      memoryUsage: metric.memoryUsage,
      errorRate: metric.errorCount / Math.max(1, stats.length + 1),
      timestamp: Date.now()
    }

    // 更新统计信息
    if (stats.length > 0) {
      const prevStats = stats[stats.length - 1]
      stat.maxProcessingTime = Math.max(prevStats.maxProcessingTime, metric.eventProcessingTime)
      stat.minProcessingTime = Math.min(prevStats.minProcessingTime, metric.eventProcessingTime)
      stat.averageProcessingTime = (prevStats.averageProcessingTime * stats.length + metric.eventProcessingTime) / (stats.length + 1)
    }

    stats.push(stat)

    // 保持最近100条记录
    if (stats.length > 100) {
      stats.shift()
    }
  }

  /**
   * 检查内存泄漏
   */
  private checkMemoryLeak(): void {
    const memoryInfo = (performance as any).memory
    if (!memoryInfo) {
      return
    }

    const usedHeapSize = memoryInfo.usedJSHeapSize
    const totalHeapSize = memoryInfo.totalJSHeapSize
    const heapSizeLimit = memoryInfo.jsHeapSizeLimit

    // 检查堆内存使用率
    const heapUsageRate = usedHeapSize / totalHeapSize
    if (heapUsageRate > 0.9) {
      console.warn(`High heap usage detected: ${(heapUsageRate * 100).toFixed(2)}%`)
      
      // 触发垃圾回收建议
      if (heapUsageRate > 0.95) {
        console.error('Critical heap usage! Consider forcing garbage collection.')
        this.suggestMemoryOptimization()
      }
    }

    // 检查堆大小限制
    if (totalHeapSize > heapSizeLimit * 0.8) {
      console.warn(`Approaching heap size limit: ${(totalHeapSize / heapSizeLimit * 100).toFixed(2)}%`)
    }
  }

  /**
   * 建议内存优化
   */
  private suggestMemoryOptimization(): void {
    const suggestions = [
      'Consider removing unused event listeners',
      'Clear unused data from event cache',
      'Optimize event processing logic',
      'Consider using event batching for high-frequency events'
    ]

    suggestions.forEach(suggestion => console.warn(`Memory Optimization: ${suggestion}`))
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): Map<string, PerformanceStats[]> {
    return new Map(this.stats)
  }

  /**
   * 获取当前指标
   */
  getCurrentMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics)
  }

  /**
   * 获取事件处理性能报告
   */
  getEventPerformanceReport(eventName?: string): any {
    if (eventName) {
      const stats = this.stats.get(eventName)
      if (!stats || stats.length === 0) {
        return null
      }

      const latestStat = stats[stats.length - 1]
      return {
        eventName,
        ...latestStat,
        trend: this.calculateTrend(stats)
      }
    }

    // 返回所有事件的报告
    const report: any = {}
    this.stats.forEach((stats, eventName) => {
      if (stats.length > 0) {
        const latestStat = stats[stats.length - 1]
        report[eventName] = {
          ...latestStat,
          trend: this.calculateTrend(stats)
        }
      }
    })

    return report
  }

  /**
   * 计算趋势
   */
  private calculateTrend(stats: PerformanceStats[]): 'improving' | 'degrading' | 'stable' {
    if (stats.length < 2) {
      return 'stable'
    }

    const recent = stats.slice(-10) // 最近10个数据点
    const older = stats.slice(-20, -10) // 之前的10个数据点

    if (recent.length === 0 || older.length === 0) {
      return 'stable'
    }

    const recentAvg = recent.reduce((sum, stat) => sum + stat.averageProcessingTime, 0) / recent.length
    const olderAvg = older.reduce((sum, stat) => sum + stat.averageProcessingTime, 0) / older.length

    const changeRate = (recentAvg - olderAvg) / olderAvg

    if (Math.abs(changeRate) < 0.1) {
      return 'stable'
    }

    return changeRate > 0 ? 'degrading' : 'improving'
  }

  /**
   * 清理性能数据
   */
  cleanup(): void {
    this.stopMonitoring()
    this.metrics.clear()
    this.stats.clear()
  }

  /**
   * 导出性能报告
   */
  exportPerformanceReport(): string {
    const report = {
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.metrics),
      stats: Object.fromEntries(this.stats),
      summary: this.generateSummary()
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * 生成摘要
   */
  private generateSummary(): any {
    const summary = {
      totalEvents: 0,
      averageProcessingTime: 0,
      maxProcessingTime: 0,
      memoryUsage: 0,
      errorRate: 0,
      recommendations: []
    }

    let totalProcessingTime = 0
    let totalEvents = 0

    this.stats.forEach((stats, eventName) => {
      if (stats.length > 0) {
        const latestStat = stats[stats.length - 1]
        totalProcessingTime += latestStat.averageProcessingTime
        totalEvents += latestStat.totalEvents
        summary.maxProcessingTime = Math.max(summary.maxProcessingTime, latestStat.maxProcessingTime)
        summary.memoryUsage = Math.max(summary.memoryUsage, latestStat.memoryUsage)
        summary.errorRate = Math.max(summary.errorRate, latestStat.errorRate)
      }
    })

    summary.totalEvents = totalEvents
    summary.averageProcessingTime = totalEvents > 0 ? totalProcessingTime / this.stats.size : 0

    // 生成建议
    if (summary.averageProcessingTime > 50) {
      summary.recommendations.push('Consider optimizing event processing logic')
    }

    if (summary.errorRate > 0.01) {
      summary.recommendations.push('Review and fix error-prone event handlers')
    }

    if (summary.memoryUsage > 100 * 1024 * 1024) { // 100MB
      summary.recommendations.push('Consider memory optimization strategies')
    }

    return summary
  }
}