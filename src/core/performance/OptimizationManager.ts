import { CanvasEventSystem } from '../index'
import { PerformanceMonitor } from './PerformanceMonitor'
import { MemoryManager } from './MemoryManager'

export interface OptimizationConfig {
  enablePerformanceMonitoring: boolean
  enableMemoryManagement: boolean
  enableEventBatching: boolean
  enableLazyLoading: boolean
  batchSize: number
  batchTimeout: number
  maxMemoryUsage: number
  cleanupInterval: number
}

export class OptimizationManager {
  private static instance: OptimizationManager
  private performanceMonitor: PerformanceMonitor
  private memoryManager: MemoryManager
  private config: OptimizationConfig
  private eventBatch: Array<{ eventName: string; data: any }> = []
  private batchTimer: number | null = null
  private optimizationEnabled = false

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance()
    this.memoryManager = MemoryManager.getInstance()
    this.config = this.getDefaultConfig()
  }

  static getInstance(): OptimizationManager {
    if (!OptimizationManager.instance) {
      OptimizationManager.instance = new OptimizationManager()
    }
    return OptimizationManager.instance
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): OptimizationConfig {
    return {
      enablePerformanceMonitoring: true,
      enableMemoryManagement: true,
      enableEventBatching: true,
      enableLazyLoading: true,
      batchSize: 10,
      batchTimeout: 50,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      cleanupInterval: 30000 // 30秒
    }
  }

  /**
   * 初始化优化管理器
   */
  initialize(config?: Partial<OptimizationConfig>): void {
    this.config = { ...this.getDefaultConfig(), ...config }
    this.optimizationEnabled = true

    // 初始化性能监控
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.startMonitoring()
    }

    // 初始化内存管理
    if (this.config.enableMemoryManagement) {
      this.memoryManager.initialize()
    }

    // 设置事件批处理
    if (this.config.enableEventBatching) {
      this.setupEventBatching()
    }

    console.log('OptimizationManager initialized with config:', this.config)
  }

  /**
   * 销毁优化管理器
   */
  destroy(): void {
    this.optimizationEnabled = false

    // 停止性能监控
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.stopMonitoring()
    }

    // 销毁内存管理
    if (this.config.enableMemoryManagement) {
      this.memoryManager.destroy()
    }

    // 清理事件批处理
    this.cleanupEventBatching()

    console.log('OptimizationManager destroyed')
  }

  /**
   * 设置事件批处理
   */
  private setupEventBatching(): void {
    // 监听所有事件
    CanvasEventSystem.eventBus.on('*', (eventName: string, data: any) => {
      if (!this.optimizationEnabled) {
        return
      }

      // 添加到批处理队列
      this.eventBatch.push({ eventName, data })

      // 如果达到批处理大小，立即处理
      if (this.eventBatch.length >= this.config.batchSize) {
        this.processEventBatch()
      } else if (!this.batchTimer) {
        // 设置批处理定时器
        this.batchTimer = window.setTimeout(() => {
          this.processEventBatch()
        }, this.config.batchTimeout)
      }
    })
  }

  /**
   * 清理事件批处理
   */
  private cleanupEventBatching(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    this.eventBatch = []
  }

  /**
   * 处理事件批处理
   */
  private processEventBatch(): void {
    if (this.eventBatch.length === 0) {
      return
    }

    const batch = [...this.eventBatch]
    this.eventBatch = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    // 批量处理事件
    const startTime = performance.now()
    
    batch.forEach(({ eventName, data }) => {
      try {
        // 这里可以添加批量处理的逻辑
        this.optimizeEventProcessing(eventName, data)
      } catch (error) {
        console.error(`Error processing batched event ${eventName}:`, error)
      }
    })

    const processingTime = performance.now() - startTime
    
    // 如果批处理时间过长，调整批处理大小
    if (processingTime > 100) {
      this.config.batchSize = Math.max(1, this.config.batchSize - 1)
      console.warn(`Reduced batch size to ${this.config.batchSize} due to long processing time`)
    }
  }

  /**
   * 优化事件处理
   */
  private optimizeEventProcessing(eventName: string, data: any): void {
    // 事件去重
    if (this.shouldDedupeEvent(eventName, data)) {
      return
    }

    // 事件节流
    if (this.shouldThrottleEvent(eventName)) {
      return
    }

    // 事件优先级处理
    if (this.shouldPrioritizeEvent(eventName)) {
      this.processHighPriorityEvent(eventName, data)
    } else {
      this.processNormalEvent(eventName, data)
    }
  }

  /**
   * 是否应该去重事件
   */
  private shouldDedupeEvent(eventName: string, data: any): boolean {
    // 简单的去重逻辑：相同事件在短时间内只处理一次
    const dedupeKey = `dedupe:${eventName}:${JSON.stringify(data)}`
    const now = Date.now()
    const lastProcessed = (CanvasEventSystem as any)._lastProcessedEvents || {}
    
    if (lastProcessed[dedupeKey] && now - lastProcessed[dedupeKey] < 100) {
      return true // 100ms内重复的事件去重
    }
    
    lastProcessed[dedupeKey] = now
    ;(CanvasEventSystem as any)._lastProcessedEvents = lastProcessed
    
    return false
  }

  /**
   * 是否应该节流事件
   */
  private shouldThrottleEvent(eventName: string): boolean {
    // 高频事件节流
    const throttleEvents = ['canvas.mouse.move', 'canvas.node.drag']
    
    if (throttleEvents.includes(eventName)) {
      const throttleKey = `throttle:${eventName}`
      const now = Date.now()
      const lastProcessed = (CanvasEventSystem as any)._lastThrottledEvents || {}
      
      if (lastProcessed[throttleKey] && now - lastProcessed[throttleKey] < 16) {
        return true // 16ms节流（约60fps）
      }
      
      lastProcessed[throttleKey] = now
      ;(CanvasEventSystem as any)._lastThrottledEvents = lastProcessed
    }
    
    return false
  }

  /**
   * 是否应该优先处理事件
   */
  private shouldPrioritizeEvent(eventName: string): boolean {
    const highPriorityEvents = [
      'canvas.keyboard.delete',
      'canvas.keyboard.undo',
      'canvas.keyboard.redo',
      'canvas.error',
      'canvas.warning'
    ]
    
    return highPriorityEvents.includes(eventName)
  }

  /**
   * 处理高优先级事件
   */
  private processHighPriorityEvent(eventName: string, data: any): void {
    // 立即处理高优先级事件
    CanvasEventSystem.eventBus.emit(eventName, data)
  }

  /**
   * 处理普通事件
   */
  private processNormalEvent(eventName: string, data: any): void {
    // 普通事件可以延迟处理或批处理
    CanvasEventSystem.eventBus.emit(eventName, data)
  }

  /**
   * 优化内存使用
   */
  optimizeMemory(): void {
    if (!this.config.enableMemoryManagement) {
      return
    }

    const memoryReport = this.memoryManager.getMemorySummary()
    
    if (memoryReport.memoryPressure > 0.8) {
      console.warn('High memory pressure detected, performing cleanup...')
      
      // 清理事件缓存
      this.memoryManager.performCleanup()
      
      // 减少批处理大小
      this.config.batchSize = Math.max(1, Math.floor(this.config.batchSize * 0.8))
      
      // 启用更激进的清理策略
      this.performAggressiveCleanup()
    }
  }

  /**
   * 执行激进清理
   */
  private performAggressiveCleanup(): void {
    console.warn('Performing aggressive cleanup...')
    
    // 清理事件批处理
    this.eventBatch = []
    
    // 清理内存管理器
    this.memoryManager.performCleanup()
    
    // 建议垃圾回收
    if ((window as any).gc) {
      (window as any).gc()
    }
  }

  /**
   * 优化事件监听器
   */
  optimizeEventListeners(): void {
    const listenerCount = this.memoryManager.getMemorySummary().listenersCount
    
    if (listenerCount > 1000) {
      console.warn(`High listener count detected: ${listenerCount}`)
      
      // 建议优化监听器
      this.suggestListenerOptimization()
    }
  }

  /**
   * 建议监听器优化
   */
  private suggestListenerOptimization(): void {
    const suggestions = [
      'Consider using event delegation for similar events',
      'Remove unused event listeners',
      'Use event namespacing for better organization',
      'Consider using throttling/debouncing for high-frequency events'
    ]
    
    suggestions.forEach(suggestion => console.warn(`Listener Optimization: ${suggestion}`))
  }

  /**
   * 获取优化报告
   */
  getOptimizationReport(): any {
    const performanceReport = this.performanceMonitor.getEventPerformanceReport()
    const memoryReport = this.memoryManager.getMemoryReport()
    
    return {
      optimizationEnabled: this.optimizationEnabled,
      config: this.config,
      performance: performanceReport,
      memory: memoryReport,
      batchQueueLength: this.eventBatch.length,
      recommendations: this.generateRecommendations()
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    const memoryReport = this.memoryManager.getMemorySummary()
    
    if (memoryReport.memoryPressure > 0.7) {
      recommendations.push('Consider enabling memory management')
    }
    
    if (memoryReport.listenersCount > 500) {
      recommendations.push('Consider optimizing event listeners')
    }
    
    if (this.eventBatch.length > this.config.batchSize * 2) {
      recommendations.push('Event batch queue is growing, consider increasing batch size')
    }
    
    return recommendations
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config }
    
    // 应用新配置
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.startMonitoring()
    } else {
      this.performanceMonitor.stopMonitoring()
    }
    
    if (this.config.enableMemoryManagement) {
      this.memoryManager.initialize()
    } else {
      this.memoryManager.destroy()
    }
  }

  /**
   * 导出优化报告
   */
  exportOptimizationReport(): string {
    const report = {
      timestamp: Date.now(),
      optimizationReport: this.getOptimizationReport(),
      performanceStats: this.performanceMonitor.getPerformanceStats(),
      memorySummary: this.memoryManager.getMemorySummary()
    }
    
    return JSON.stringify(report, null, 2)
  }
}