/**
 * 统一性能监控系统
 * 提供全面的性能监控、分析和优化建议
 */

export class UnifiedPerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableRealTimeMonitoring: true,
      enableMemoryTracking: true,
      enableFPSMonitoring: true,
      enableNetworkMonitoring: false,
      sampleInterval: 1000, // 1秒
      maxSamples: 300, // 5分钟的数据
      alertThresholds: {
        fps: 30,
        memoryUsage: 100 * 1024 * 1024, // 100MB
        renderTime: 16, // 16ms (60fps)
        cacheHitRate: 0.8 // 80%
      },
      ...options
    }
    
    // 性能数据存储
    this.metrics = {
      fps: [],
      memory: [],
      renderTimes: [],
      cacheStats: [],
      layoutStats: [],
      previewLineStats: [],
      userInteractions: []
    }
    
    // 实时监控状态
    this.monitoring = {
      isActive: false,
      startTime: 0,
      lastSampleTime: 0,
      sampleCount: 0
    }
    
    // 性能分析器
    this.analyzers = new Map()
    
    // 警报系统
    this.alerts = {
      active: [],
      history: [],
      callbacks: new Set()
    }
    
    // 初始化监控器
    this.initializeMonitor()
  }

  /**
   * 初始化性能监控器
   */
  initializeMonitor() {
    // 注册内置分析器
    this.registerAnalyzer('fps', new FPSAnalyzer())
    this.registerAnalyzer('memory', new MemoryAnalyzer())
    this.registerAnalyzer('render', new RenderAnalyzer())
    this.registerAnalyzer('cache', new CacheAnalyzer())
    this.registerAnalyzer('layout', new LayoutAnalyzer())
    this.registerAnalyzer('interaction', new InteractionAnalyzer())
    
    // 设置性能观察器
    if (this.options.enableRealTimeMonitoring) {
      this.setupPerformanceObserver()
    }
    
    console.log('[UnifiedPerformanceMonitor] 性能监控器初始化完成')
  }

  /**
   * 开始监控
   */
  startMonitoring() {
    if (this.monitoring.isActive) {
      console.warn('[UnifiedPerformanceMonitor] 监控已经在运行中')
      return
    }
    
    this.monitoring.isActive = true
    this.monitoring.startTime = performance.now()
    this.monitoring.lastSampleTime = this.monitoring.startTime
    this.monitoring.sampleCount = 0
    
    // 开始采样
    this.startSampling()
    
    // 启动分析器
    this.analyzers.forEach(analyzer => analyzer.start())
    
    console.log('[UnifiedPerformanceMonitor] 性能监控已开始')
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (!this.monitoring.isActive) {
      return
    }
    
    this.monitoring.isActive = false
    
    // 停止采样
    this.stopSampling()
    
    // 停止分析器
    this.analyzers.forEach(analyzer => analyzer.stop())
    
    console.log('[UnifiedPerformanceMonitor] 性能监控已停止')
  }

  /**
   * 开始采样
   */
  startSampling() {
    this.sampleInterval = setInterval(() => {
      this.collectSample()
    }, this.options.sampleInterval)
  }

  /**
   * 停止采样
   */
  stopSampling() {
    if (this.sampleInterval) {
      clearInterval(this.sampleInterval)
      this.sampleInterval = null
    }
  }

  /**
   * 收集性能样本
   */
  collectSample() {
    const now = performance.now()
    const sample = {
      timestamp: now,
      frameId: this.monitoring.sampleCount++
    }
    
    try {
      // 收集FPS数据
      if (this.options.enableFPSMonitoring) {
        sample.fps = this.collectFPSData()
      }
      
      // 收集内存数据
      if (this.options.enableMemoryTracking) {
        sample.memory = this.collectMemoryData()
      }
      
      // 收集渲染数据
      sample.render = this.collectRenderData()
      
      // 收集缓存数据
      sample.cache = this.collectCacheData()
      
      // 收集布局数据
      sample.layout = this.collectLayoutData()
      
      // 收集预览线数据
      sample.previewLine = this.collectPreviewLineData()
      
      // 存储样本
      this.storeSample(sample)
      
      // 实时分析
      this.analyzeRealTime(sample)
      
      this.monitoring.lastSampleTime = now
      
    } catch (error) {
      console.error('[UnifiedPerformanceMonitor] 采样失败:', error)
    }
  }

  /**
   * 收集FPS数据
   */
  collectFPSData() {
    const now = performance.now()
    const deltaTime = now - this.monitoring.lastSampleTime
    const fps = deltaTime > 0 ? 1000 / deltaTime : 0
    
    return {
      current: Math.round(fps),
      deltaTime: deltaTime,
      timestamp: now
    }
  }

  /**
   * 收集内存数据
   */
  collectMemoryData() {
    if (!performance.memory) {
      return null
    }
    
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      usage: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
    }
  }

  /**
   * 收集渲染数据
   */
  collectRenderData() {
    // 从全局性能管理器获取渲染数据
    const renderStats = window.performanceStats?.render || {}
    
    return {
      frameTime: renderStats.lastFrameTime || 0,
      renderCalls: renderStats.renderCalls || 0,
      drawCalls: renderStats.drawCalls || 0,
      triangles: renderStats.triangles || 0
    }
  }

  /**
   * 收集缓存数据
   */
  collectCacheData() {
    const cacheStats = window.performanceStats?.cache || {}
    
    return {
      hits: cacheStats.hits || 0,
      misses: cacheStats.misses || 0,
      hitRate: cacheStats.hitRate || 0,
      size: cacheStats.size || 0,
      maxSize: cacheStats.maxSize || 0
    }
  }

  /**
   * 收集布局数据
   */
  collectLayoutData() {
    const layoutStats = window.performanceStats?.layout || {}
    
    return {
      layoutCount: layoutStats.layoutCount || 0,
      averageTime: layoutStats.averageTime || 0,
      lastLayoutTime: layoutStats.lastLayoutTime || 0,
      nodeCount: layoutStats.nodeCount || 0
    }
  }

  /**
   * 收集预览线数据
   */
  collectPreviewLineData() {
    const previewLineStats = window.performanceStats?.previewLine || {}
    
    return {
      totalLines: previewLineStats.totalLines || 0,
      visibleLines: previewLineStats.visibleLines || 0,
      renderTime: previewLineStats.renderTime || 0,
      poolHits: previewLineStats.poolHits || 0,
      poolMisses: previewLineStats.poolMisses || 0
    }
  }

  /**
   * 存储样本数据
   * @param {Object} sample - 样本数据
   */
  storeSample(sample) {
    // 存储到对应的指标数组
    if (sample.fps) {
      this.metrics.fps.push(sample.fps)
      this.trimMetricArray(this.metrics.fps)
    }
    
    if (sample.memory) {
      this.metrics.memory.push(sample.memory)
      this.trimMetricArray(this.metrics.memory)
    }
    
    if (sample.render) {
      this.metrics.renderTimes.push(sample.render)
      this.trimMetricArray(this.metrics.renderTimes)
    }
    
    if (sample.cache) {
      this.metrics.cacheStats.push(sample.cache)
      this.trimMetricArray(this.metrics.cacheStats)
    }
    
    if (sample.layout) {
      this.metrics.layoutStats.push(sample.layout)
      this.trimMetricArray(this.metrics.layoutStats)
    }
    
    if (sample.previewLine) {
      this.metrics.previewLineStats.push(sample.previewLine)
      this.trimMetricArray(this.metrics.previewLineStats)
    }
  }

  /**
   * 修剪指标数组，保持在最大样本数内
   * @param {Array} array - 指标数组
   */
  trimMetricArray(array) {
    if (array.length > this.options.maxSamples) {
      array.splice(0, array.length - this.options.maxSamples)
    }
  }

  /**
   * 实时分析
   * @param {Object} sample - 样本数据
   */
  analyzeRealTime(sample) {
    // 检查性能阈值
    this.checkPerformanceThresholds(sample)
    
    // 运行分析器
    this.analyzers.forEach((analyzer, name) => {
      try {
        analyzer.analyze(sample)
      } catch (error) {
        console.error(`[UnifiedPerformanceMonitor] 分析器 ${name} 执行失败:`, error)
      }
    })
  }

  /**
   * 检查性能阈值
   * @param {Object} sample - 样本数据
   */
  checkPerformanceThresholds(sample) {
    const thresholds = this.options.alertThresholds
    
    // 检查FPS
    if (sample.fps && sample.fps.current < thresholds.fps) {
      this.triggerAlert('fps', `FPS过低: ${sample.fps.current}`, sample)
    }
    
    // 检查内存使用
    if (sample.memory && sample.memory.used > thresholds.memoryUsage) {
      this.triggerAlert('memory', `内存使用过高: ${(sample.memory.used / 1024 / 1024).toFixed(2)}MB`, sample)
    }
    
    // 检查渲染时间
    if (sample.render && sample.render.frameTime > thresholds.renderTime) {
      this.triggerAlert('render', `渲染时间过长: ${sample.render.frameTime.toFixed(2)}ms`, sample)
    }
    
    // 检查缓存命中率
    if (sample.cache && sample.cache.hitRate < thresholds.cacheHitRate) {
      this.triggerAlert('cache', `缓存命中率过低: ${(sample.cache.hitRate * 100).toFixed(1)}%`, sample)
    }
  }

  /**
   * 触发警报
   * @param {string} type - 警报类型
   * @param {string} message - 警报消息
   * @param {Object} data - 相关数据
   */
  triggerAlert(type, message, data) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now(),
      data,
      severity: this.calculateAlertSeverity(type, data)
    }
    
    // 添加到活跃警报
    this.alerts.active.push(alert)
    
    // 添加到历史记录
    this.alerts.history.push(alert)
    
    // 限制历史记录大小
    if (this.alerts.history.length > 1000) {
      this.alerts.history.splice(0, 100)
    }
    
    // 通知回调函数
    this.alerts.callbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('[UnifiedPerformanceMonitor] 警报回调执行失败:', error)
      }
    })
    
    console.warn(`[UnifiedPerformanceMonitor] 性能警报 [${type}]: ${message}`)
  }

  /**
   * 计算警报严重程度
   * @param {string} type - 警报类型
   * @param {Object} data - 数据
   */
  calculateAlertSeverity(type, data) {
    // 简单的严重程度计算逻辑
    switch (type) {
      case 'fps':
        return data.fps?.current < 15 ? 'critical' : 'warning'
      case 'memory':
        return data.memory?.usage > 0.9 ? 'critical' : 'warning'
      case 'render':
        return data.render?.frameTime > 50 ? 'critical' : 'warning'
      default:
        return 'info'
    }
  }

  /**
   * 生成性能报告
   * @param {Object} options - 报告选项
   */
  generateReport(options = {}) {
    const reportOptions = {
      includeCharts: true,
      includeRecommendations: true,
      timeRange: 'last5min',
      ...options
    }
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        timeRange: reportOptions.timeRange,
        sampleCount: this.monitoring.sampleCount,
        monitoringDuration: performance.now() - this.monitoring.startTime
      },
      summary: this.generateSummary(),
      metrics: this.generateMetricsReport(),
      alerts: this.generateAlertsReport(),
      analysis: this.generateAnalysisReport(),
      recommendations: reportOptions.includeRecommendations ? this.generateRecommendations() : null
    }
    
    console.log('[UnifiedPerformanceMonitor] 性能报告生成完成')
    return report
  }

  /**
   * 生成摘要
   */
  generateSummary() {
    const latestSamples = {
      fps: this.metrics.fps[this.metrics.fps.length - 1],
      memory: this.metrics.memory[this.metrics.memory.length - 1],
      render: this.metrics.renderTimes[this.metrics.renderTimes.length - 1],
      cache: this.metrics.cacheStats[this.metrics.cacheStats.length - 1]
    }
    
    return {
      currentFPS: latestSamples.fps?.current || 0,
      memoryUsage: latestSamples.memory ? `${(latestSamples.memory.used / 1024 / 1024).toFixed(2)}MB` : 'N/A',
      averageRenderTime: latestSamples.render?.frameTime || 0,
      cacheHitRate: latestSamples.cache ? `${(latestSamples.cache.hitRate * 100).toFixed(1)}%` : 'N/A',
      activeAlerts: this.alerts.active.length,
      overallHealth: this.calculateOverallHealth()
    }
  }

  /**
   * 计算整体健康状况
   */
  calculateOverallHealth() {
    let score = 100
    
    // 根据活跃警报扣分
    score -= this.alerts.active.length * 10
    
    // 根据最新指标调整
    const latest = this.generateSummary()
    if (latest.currentFPS < 30) score -= 20
    if (parseFloat(latest.memoryUsage) > 100) score -= 15
    if (latest.averageRenderTime > 16) score -= 15
    if (parseFloat(latest.cacheHitRate) < 80) score -= 10
    
    score = Math.max(0, score)
    
    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }

  /**
   * 注册分析器
   * @param {string} name - 分析器名称
   * @param {Object} analyzer - 分析器实例
   */
  registerAnalyzer(name, analyzer) {
    this.analyzers.set(name, analyzer)
  }

  /**
   * 注册警报回调
   * @param {Function} callback - 回调函数
   */
  onAlert(callback) {
    this.alerts.callbacks.add(callback)
  }

  /**
   * 获取实时统计
   */
  getRealTimeStats() {
    return {
      monitoring: this.monitoring,
      summary: this.generateSummary(),
      alerts: {
        active: this.alerts.active.length,
        total: this.alerts.history.length
      }
    }
  }

  // 占位符方法
  setupPerformanceObserver() { /* 实现性能观察器设置 */ }
  generateMetricsReport() { return {} /* 实现指标报告生成 */ }
  generateAlertsReport() { return {} /* 实现警报报告生成 */ }
  generateAnalysisReport() { return {} /* 实现分析报告生成 */ }
  generateRecommendations() { return [] /* 实现建议生成 */ }
}

/**
 * 基础分析器类
 */
class BaseAnalyzer {
  constructor() {
    this.isActive = false
  }
  
  start() {
    this.isActive = true
  }
  
  stop() {
    this.isActive = false
  }
  
  analyze(sample) {
    // 子类实现
  }
}

/**
 * FPS分析器
 */
class FPSAnalyzer extends BaseAnalyzer {
  analyze(sample) {
    if (!sample.fps) return
    
    // FPS分析逻辑
    if (sample.fps.current < 30) {
      console.warn('[FPSAnalyzer] 检测到低FPS:', sample.fps.current)
    }
  }
}

/**
 * 内存分析器
 */
class MemoryAnalyzer extends BaseAnalyzer {
  analyze(sample) {
    if (!sample.memory) return
    
    // 内存分析逻辑
    if (sample.memory.usage > 0.8) {
      console.warn('[MemoryAnalyzer] 检测到高内存使用:', sample.memory.usage)
    }
  }
}

/**
 * 渲染分析器
 */
class RenderAnalyzer extends BaseAnalyzer {
  analyze(sample) {
    if (!sample.render) return
    
    // 渲染分析逻辑
    if (sample.render.frameTime > 16) {
      console.warn('[RenderAnalyzer] 检测到长渲染时间:', sample.render.frameTime)
    }
  }
}

/**
 * 缓存分析器
 */
class CacheAnalyzer extends BaseAnalyzer {
  analyze(sample) {
    if (!sample.cache) return
    
    // 缓存分析逻辑
    if (sample.cache.hitRate < 0.8) {
      console.warn('[CacheAnalyzer] 检测到低缓存命中率:', sample.cache.hitRate)
    }
  }
}

/**
 * 布局分析器
 */
class LayoutAnalyzer extends BaseAnalyzer {
  analyze(sample) {
    if (!sample.layout) return
    
    // 布局分析逻辑
    if (sample.layout.averageTime > 50) {
      console.warn('[LayoutAnalyzer] 检测到长布局时间:', sample.layout.averageTime)
    }
  }
}

/**
 * 交互分析器
 */
class InteractionAnalyzer extends BaseAnalyzer {
  analyze(sample) {
    // 交互分析逻辑
    // 分析用户交互模式和响应时间
  }
}