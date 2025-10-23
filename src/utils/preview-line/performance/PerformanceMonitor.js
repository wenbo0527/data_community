/**
 * 预览线性能监控器
 * 负责监控预览线系统的性能指标，包括执行时间、内存使用、操作统计等
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableMetrics: true,
      retentionPeriod: 3600000, // 1小时
      maxRecords: 1000,
      maxHistorySize: 100,
      ...options
    }

    this.options.warningThresholds = {
      executionTime: 50, // 50ms
      memoryUsage: 100 * 1024 * 1024, // 100MB
      cacheHitRate: 0.8, // 80%
      ...options.warningThresholds
    }

    this.thresholds = {
      warning: 50, // 50ms
      error: 200,  // 200ms
      ...options.thresholds
    }

    this.sessions = new Map()
    this.records = []
    this.enabled = this.options.enableMetrics

    // 任务跟踪
    this.activeTasks = new Map()
    this.executionHistory = []
    this.errors = []
    this.warnings = []

    // 性能指标
    this.metrics = {
      layoutExecutions: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      maxExecutionTime: 0,
      minExecutionTime: Infinity,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      errorCount: 0,
      warningCount: 0
    }

    // 统计信息
    this.statistics = {
      totalPreviewLines: 0,
      activePreviewLines: 0,
      connectedPreviewLines: 0,
      draggingPreviewLines: 0,
      createdCount: 0,
      deletedCount: 0,
      lastUpdated: Date.now()
    }

    console.log('🚀 [性能监控器] 初始化完成', {
      启用状态: this.enabled,
      保留期: this.options.retentionPeriod,
      最大记录数: this.options.maxRecords,
      警告阈值: this.thresholds.warning,
      错误阈值: this.thresholds.error
    })
  }

  /**
   * 开始监控任务
   * @param {string} taskId - 任务ID
   * @param {Object} metadata - 任务元数据
   */
  startTask(taskId, metadata = {}) {
    if (!this.options.enableMetrics) {
      return
    }

    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()

    this.activeTasks.set(taskId, {
      taskId,
      startTime,
      startMemory,
      metadata
    })

    console.log(`⏱️ [性能监控] 开始任务: ${taskId}`, metadata)
  }

  /**
   * 结束监控任务
   * @param {string} taskId - 任务ID
   * @param {Object} result - 任务结果
   */
  endTask(taskId, result = {}) {
    if (!this.options.enableMetrics || !this.activeTasks.has(taskId)) {
      return
    }

    const task = this.activeTasks.get(taskId)
    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()
    const executionTime = endTime - task.startTime
    const memoryDelta = endMemory - task.startMemory

    // 记录执行历史
    const execution = {
      taskId,
      startTime: task.startTime,
      endTime,
      executionTime,
      startMemory: task.startMemory,
      endMemory,
      memoryDelta,
      metadata: task.metadata,
      result
    }

    this.executionHistory.push(execution)
    this.updateMetrics(executionTime, memoryDelta, result)
    this.checkThresholds(execution)

    // 限制历史记录大小
    if (this.executionHistory.length > this.options.maxHistorySize) {
      this.executionHistory.shift()
    }

    this.activeTasks.delete(taskId)

    console.log(`✅ [性能监控] 完成任务: ${taskId}, 耗时: ${executionTime.toFixed(2)}ms`, {
      executionTime,
      memoryDelta,
      result
    })
  }

  /**
   * 开始计时（startTask的别名）
   */
  startTiming(taskId, metadata = {}) {
    return this.startTask(taskId, metadata)
  }

  /**
   * 结束计时（endTask的别名）
   */
  endTiming(taskId, result = {}) {
    return this.endTask(taskId, result)
  }

  /**
   * 记录缓存命中
   * @param {string} cacheKey - 缓存键
   * @param {Object} metadata - 元数据
   */
  recordCacheHit(cacheKey, metadata = {}) {
    if (!this.options.enableMetrics) {
      return
    }

    this.metrics.cacheHits++
    this.updateCacheHitRate()

    console.log(`🎯 [缓存命中] ${cacheKey}`, metadata)
  }

  /**
   * 记录缓存未命中
   * @param {string} cacheKey - 缓存键
   * @param {Object} metadata - 元数据
   */
  recordCacheMiss(cacheKey, metadata = {}) {
    if (!this.options.enableMetrics) {
      return
    }

    this.metrics.cacheMisses++
    this.updateCacheHitRate()

    console.log(`❌ [缓存未命中] ${cacheKey}`, metadata)
  }

  /**
   * 记录错误
   * @param {Error|string} error - 错误信息
   * @param {Object} context - 错误上下文
   */
  recordError(error, context = {}) {
    this.metrics.errorCount++
    
    const errorRecord = {
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : null,
      context
    }
    
    this.errors.push(errorRecord)
    
    // 限制错误记录大小
    if (this.errors.length > this.options.maxHistorySize) {
      this.errors.shift()
    }

    console.error('❌ [性能监控] 记录错误:', errorRecord)
  }

  /**
   * 记录警告
   * @param {string} message - 警告信息
   * @param {Object} context - 警告上下文
   */
  recordWarning(message, context = {}) {
    this.metrics.warningCount++
    
    const warningRecord = {
      timestamp: Date.now(),
      message,
      context
    }
    
    this.warnings.push(warningRecord)
    
    // 限制警告记录大小
    if (this.warnings.length > this.options.maxHistorySize) {
      this.warnings.shift()
    }

    console.warn('⚠️ [性能监控] 记录警告:', warningRecord)
  }

  /**
   * 更新性能指标
   * @param {number} executionTime - 执行时间
   * @param {number} memoryDelta - 内存变化
   * @param {Object} result - 执行结果
   */
  updateMetrics(executionTime, memoryDelta, result) {
    this.metrics.layoutExecutions++
    this.metrics.totalExecutionTime += executionTime
    this.metrics.averageExecutionTime = this.metrics.totalExecutionTime / this.metrics.layoutExecutions

    // 更新最大最小执行时间
    if (executionTime > this.metrics.maxExecutionTime) {
      this.metrics.maxExecutionTime = executionTime
    }

    if (executionTime < this.metrics.minExecutionTime) {
      this.metrics.minExecutionTime = executionTime
    }

    // 更新内存使用情况
    const currentMemory = this.getMemoryUsage()
    this.metrics.memoryUsage = currentMemory

    if (currentMemory > this.metrics.peakMemoryUsage) {
      this.metrics.peakMemoryUsage = currentMemory
    }

    // 如果结果包含成功标志，可以进一步统计
    if (result && result.success === false) {
      this.metrics.errorCount++
    }
  }

  /**
   * 更新缓存命中率
   */
  updateCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses
    this.metrics.cacheHitRate = total > 0 ? this.metrics.cacheHits / total : 0
  }

  /**
   * 获取内存使用量
   * @returns {number} 内存使用量（字节）
   */
  getMemoryUsage() {
    if (!this.options.enableMemoryMonitoring) {
      return 0
    }

    // Node.js 环境
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }

    // 浏览器环境
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize
    }

    return 0
  }

  /**
   * 检查性能阈值
   * @param {Object} execution - 执行记录
   */
  checkThresholds(execution) {
    const { warningThresholds } = this.options

    // 检查执行时间阈值
    if (execution.executionTime > warningThresholds.executionTime) {
      this.recordWarning(`Execution time exceeded threshold: ${execution.executionTime}ms`, {
        taskId: execution.taskId,
        threshold: warningThresholds.executionTime,
        actual: execution.executionTime
      })
    }

    // 检查内存使用阈值
    if (execution.endMemory > warningThresholds.memoryUsage) {
      this.recordWarning(`Memory usage exceeded threshold: ${execution.endMemory} bytes`, {
        taskId: execution.taskId,
        threshold: warningThresholds.memoryUsage,
        actual: execution.endMemory
      })
    }

    // 检查缓存命中率阈值
    if (this.metrics.cacheHitRate < warningThresholds.cacheHitRate) {
      this.recordWarning(`Cache hit rate below threshold: ${this.metrics.cacheHitRate}`, {
        threshold: warningThresholds.cacheHitRate,
        actual: this.metrics.cacheHitRate
      })
    }
  }

  /**
   * 获取性能报告
   * @returns {Object} 性能报告
   */
  getReport() {
    const recentExecutions = this.executionHistory.slice(-10)
    
    return {
      timestamp: Date.now(),
      summary: {
        totalExecutions: this.metrics.layoutExecutions,
        averageExecutionTime: this.metrics.averageExecutionTime,
        maxExecutionTime: this.metrics.maxExecutionTime,
        minExecutionTime: this.metrics.minExecutionTime === Infinity ? 0 : this.metrics.minExecutionTime,
        currentMemoryUsage: this.metrics.memoryUsage,
        peakMemoryUsage: this.metrics.peakMemoryUsage,
        cacheHitRate: this.metrics.cacheHitRate,
        errorCount: this.metrics.errorCount,
        warningCount: this.metrics.warningCount
      },
      metrics: { ...this.metrics },
      recentExecutions,
      totalExecutions: this.metrics.layoutExecutions,
      averageExecutionTime: this.metrics.averageExecutionTime,
      cacheEfficiency: this.metrics.cacheHitRate,
      activeTasks: Array.from(this.activeTasks.keys()),
      warnings: this.warnings.slice(-5), // 最近5个警告
      errors: this.errors.slice(-5) // 最近5个错误
    }
  }

  /**
   * 获取性能趋势分析
   * @returns {Object} 趋势分析
   */
  getTrendAnalysis() {
    const recentExecutions = this.executionHistory.slice(-20)
    
    if (recentExecutions.length < 2) {
      return { message: '数据不足，无法进行趋势分析' }
    }

    const executionTimes = recentExecutions.map(e => e.executionTime)
    const memoryUsages = recentExecutions.map(e => e.endMemory)

    return {
      executionTime: {
        trend: this.calculateTrend(executionTimes),
        average: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
        variance: this.calculateVariance(executionTimes)
      },
      memoryUsage: {
        trend: this.calculateTrend(memoryUsages),
        average: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
        variance: this.calculateVariance(memoryUsages)
      },
      recentExecutions: recentExecutions.length
    }
  }

  /**
   * 计算趋势
   * @param {number[]} values - 数值数组
   * @returns {string} 趋势描述
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    const change = (secondAvg - firstAvg) / firstAvg
    
    if (change > 0.1) return 'increasing'
    if (change < -0.1) return 'decreasing'
    return 'stable'
  }

  /**
   * 计算方差
   * @param {number[]} values - 数值数组
   * @returns {number} 方差
   */
  calculateVariance(values) {
    if (values.length === 0) return 0
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  }

  /**
   * 获取内存效率
   * @returns {number} 内存效率（0-1）
   */
  getMemoryEfficiency() {
    if (this.metrics.peakMemoryUsage === 0) {
      return 1
    }

    return Math.max(0, 1 - (this.metrics.memoryUsage / this.metrics.peakMemoryUsage))
  }

  /**
   * 获取错误率
   * @returns {number} 错误率（0-1）
   */
  getErrorRate() {
    if (this.metrics.layoutExecutions === 0) {
      return 0
    }

    return this.metrics.errorCount / this.metrics.layoutExecutions
  }

  /**
   * 获取性能健康状态
   * @returns {Object} 健康状态
   */
  getHealthStatus() {
    const health = {
      overall: 'good',
      issues: []
    }

    // 检查执行时间
    if (this.metrics.averageExecutionTime > this.options.warningThresholds.executionTime) {
      health.overall = 'warning'
      health.issues.push({
        type: 'performance',
        message: '平均执行时间过长',
        value: this.metrics.averageExecutionTime,
        threshold: this.options.warningThresholds.executionTime
      })
    }

    // 检查缓存命中率
    if (this.metrics.cacheHitRate < this.options.warningThresholds.cacheHitRate) {
      health.overall = 'warning'
      health.issues.push({
        type: 'cache',
        message: '缓存命中率过低',
        value: this.metrics.cacheHitRate,
        threshold: this.options.warningThresholds.cacheHitRate
      })
    }

    // 检查内存使用
    if (this.metrics.memoryUsage > this.options.warningThresholds.memoryUsage) {
      health.overall = 'warning'
      health.issues.push({
        type: 'memory',
        message: '内存使用量过高',
        value: this.metrics.memoryUsage,
        threshold: this.options.warningThresholds.memoryUsage
      })
    }

    // 如果有多个问题，标记为严重
    if (health.issues.length > 2) {
      health.overall = 'critical'
    }

    return health
  }

  /**
   * 获取详细统计信息
   * @returns {Object} 详细统计
   */
  getDetailedStats() {
    return {
      timestamp: Date.now(),
      metrics: this.metrics,
      executionHistory: this.executionHistory,
      activeTasks: Array.from(this.activeTasks.entries()),
      warnings: this.warnings,
      errors: this.errors,
      healthStatus: this.getHealthStatus(),
      trendAnalysis: this.getTrendAnalysis(),
      memoryEfficiency: this.getMemoryEfficiency(),
      errorRate: this.getErrorRate()
    }
  }

  /**
   * 重置性能指标
   */
  resetMetrics() {
    this.metrics = {
      layoutExecutions: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      maxExecutionTime: 0,
      minExecutionTime: Infinity,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      errorCount: 0,
      warningCount: 0
    }

    this.executionHistory = []
    this.warnings = []
    this.errors = []
    this.activeTasks.clear()

    console.log('🔄 [性能监控器] 已重置所有指标')
  }

  /**
   * 导出性能数据
   * @returns {Object} 导出的性能数据
   */
  exportData() {
    return {
      timestamp: Date.now(),
      version: '1.0.0',
      options: this.options,
      metrics: this.metrics,
      executionHistory: this.executionHistory,
      warnings: this.warnings,
      errors: this.errors
    }
  }

  /**
   * 导入性能数据
   * @param {Object} data - 要导入的数据
   */
  importData(data) {
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ [性能监控器] 无效的导入数据')
      return
    }

    if (data.metrics) {
      this.metrics = { ...this.metrics, ...data.metrics }
    }

    if (Array.isArray(data.executionHistory)) {
      this.executionHistory = data.executionHistory
    }

    if (Array.isArray(data.warnings)) {
      this.warnings = data.warnings
    }

    if (Array.isArray(data.errors)) {
      this.errors = data.errors
    }

    console.log('📥 [性能监控器] 已导入性能数据', {
      metricsImported: !!data.metrics,
      historyImported: Array.isArray(data.executionHistory),
      warningsImported: Array.isArray(data.warnings),
      errorsImported: Array.isArray(data.errors)
    })
  }

  /**
   * 销毁监控器
   */
  /**
   * 更新统计信息
   * @param {Map} previewLines - 预览线集合
   */
  updateStatistics(previewLines) {
    let activeCount = 0
    let connectedCount = 0
    let draggingCount = 0
    
    previewLines.forEach((instance) => {
      if (instance && instance.line) {
        activeCount++
        
        // 检查是否已连接（有目标节点）
        const targetId = instance.line.getTargetCellId ? instance.line.getTargetCellId() : null
        if (targetId) {
          connectedCount++
        }
        
        // 检查是否在拖拽中
        const edgeData = instance.line.getData ? instance.line.getData() : {}
        if (edgeData.isDragging) {
          draggingCount++
        }
      }
    })
    
    this.statistics.totalPreviewLines = previewLines.size
    this.statistics.activePreviewLines = activeCount
    this.statistics.connectedPreviewLines = connectedCount
    this.statistics.draggingPreviewLines = draggingCount
    this.statistics.lastUpdated = Date.now()
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息对象
   */
  getStatistics() {
    return {
      ...this.statistics,
      performanceMetrics: this.getReport()
    }
  }

  /**
   * 销毁监控器
   */
  destroy() {
    // 清理活跃任务
    this.activeTasks.clear()
    
    // 清理历史数据
    this.executionHistory = []
    this.warnings = []
    this.errors = []
    
    // 重置指标
    this.resetMetrics()
    
    console.log('🧹 [性能监控器] 已销毁')
  }
}

/**
 * 性能工具类
 * 提供防抖、节流等性能优化工具方法
 */
export class PerformanceUtils {
  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  static throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

export default PerformanceMonitor