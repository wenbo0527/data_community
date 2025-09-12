/**
 * TaskFlow 智能监控系统
 * 负责实时监控系统状态、性能指标和错误情况
 * 环境分离：开发环境启用完整监控，生产环境保持轻量级
 */

class TaskFlowMonitoringSystem {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.metrics = {
      errors: [],
      performance: [],
      healthChecks: [],
      userActions: []
    }
    
    // 环境分离配置
    this.config = this.isDevelopment ? {
      enablePerformanceMonitoring: true,
      enableDetailedErrorTracking: true,
      enableUserActionTracking: true,
      maxMetricsHistory: 1000,
      reportingInterval: 60000, // 1分钟
      enableRealTimeAlerts: true
    } : {
      enablePerformanceMonitoring: false,
      enableDetailedErrorTracking: false,
      enableUserActionTracking: false,
      maxMetricsHistory: 100,
      reportingInterval: 0, // 生产环境不定期报告
      enableRealTimeAlerts: false
    }
    
    this.alertThresholds = {
      errorRate: 0.1, // 10%错误率
      responseTime: 3000, // 3秒响应时间
      memoryUsage: 0.8 // 80%内存使用率
    }
  }

  /**
   * 初始化监控系统
   */
  initialize() {
    if (this.isDevelopment) {
      console.log('📊 [开发环境] 智能监控系统启动中...')
      
      // 开发环境：启用完整监控功能
      this.setupPerformanceMonitoring()
      this.setupErrorTracking()
      this.setupUserActionTracking()
      this.setupHealthMonitoring()
      this.startPeriodicReporting()
      
      console.log('✅ [开发环境] 智能监控系统启动完成')
    } else {
      console.log('📋 [生产环境] 启动轻量级监控系统')
      
      // 生产环境：仅启用基础错误监控
      this.setupBasicErrorTracking()
    }
  }

  /**
   * 设置性能监控（仅开发环境）
   */
  setupPerformanceMonitoring() {
    if (!this.config.enablePerformanceMonitoring) return
    
    // 监控页面加载性能
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0]
      this.recordPerformanceMetric({
        type: 'page_load',
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        timestamp: Date.now()
      })
    })
    
    // 监控资源加载性能
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.recordPerformanceMetric({
            type: 'resource_load',
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            timestamp: Date.now()
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
    
    console.log('📈 [开发监控] 性能监控已启用')
  }

  /**
   * 设置详细错误追踪（仅开发环境）
   */
  setupErrorTracking() {
    if (!this.config.enableDetailedErrorTracking) return
    
    // 监听JavaScript错误
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })
    
    // 监听Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'promise_rejection',
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })
    
    // 监听Vue错误（如果存在）
    if (window.Vue && window.Vue.config) {
      const originalErrorHandler = window.Vue.config.errorHandler
      window.Vue.config.errorHandler = (err, vm, info) => {
        this.recordError({
          type: 'vue_error',
          message: err.message,
          stack: err.stack,
          componentInfo: info,
          timestamp: Date.now()
        })
        
        if (originalErrorHandler) {
          originalErrorHandler(err, vm, info)
        }
      }
    }
    
    console.log('🐛 [开发监控] 详细错误追踪已启用')
  }

  /**
   * 设置基础错误追踪（生产环境）
   */
  setupBasicErrorTracking() {
    // 生产环境只记录关键错误
    window.addEventListener('error', (event) => {
      const errorInfo = {
        type: 'error',
        message: event.message,
        timestamp: Date.now()
      }
      
      // 发送到错误报告系统
      if (window.errorReporting) {
        window.errorReporting.report(errorInfo)
      }
      
      console.error('❌ [生产监控] 错误记录:', errorInfo)
    })
    
    console.log('📋 [生产监控] 基础错误追踪已启用')
  }

  /**
   * 设置用户行为追踪（仅开发环境）
   */
  setupUserActionTracking() {
    if (!this.config.enableUserActionTracking) return
    
    // 监控点击事件
    document.addEventListener('click', (event) => {
      const target = event.target
      this.recordUserAction({
        type: 'click',
        element: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.substring(0, 50),
        timestamp: Date.now()
      })
    })
    
    // 监控页面可见性变化
    document.addEventListener('visibilitychange', () => {
      this.recordUserAction({
        type: 'visibility_change',
        visible: !document.hidden,
        timestamp: Date.now()
      })
    })
    
    console.log('👤 [开发监控] 用户行为追踪已启用')
  }

  /**
   * 设置健康状态监控
   */
  setupHealthMonitoring() {
    if (!this.isDevelopment) return
    
    // 定期检查系统健康状态
    setInterval(() => {
      this.performHealthCheck()
    }, 30000) // 30秒检查一次
    
    console.log('💓 [开发监控] 健康状态监控已启用')
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck() {
    const healthData = {
      timestamp: Date.now(),
      memory: this.getMemoryUsage(),
      performance: this.getPerformanceMetrics(),
      errors: this.getRecentErrors(),
      systemStatus: await this.checkSystemComponents()
    }
    
    this.recordHealthCheck(healthData)
    
    // 检查是否需要发出警报
    this.checkAlertThresholds(healthData)
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usage: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
      }
    }
    return null
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    const recentPerf = this.metrics.performance.slice(-10)
    if (recentPerf.length === 0) return null
    
    const avgLoadTime = recentPerf
      .filter(p => p.type === 'page_load')
      .reduce((sum, p) => sum + p.loadTime, 0) / recentPerf.length
    
    return {
      averageLoadTime: avgLoadTime,
      recentMetricsCount: recentPerf.length
    }
  }

  /**
   * 获取最近错误
   */
  getRecentErrors() {
    const recentErrors = this.metrics.errors.slice(-10)
    const errorRate = recentErrors.length / Math.max(this.metrics.userActions.length, 1)
    
    return {
      count: recentErrors.length,
      rate: errorRate,
      types: [...new Set(recentErrors.map(e => e.type))]
    }
  }

  /**
   * 检查系统组件状态
   */
  async checkSystemComponents() {
    const components = {
      taskFlowGraph: !!window.taskFlowGraph,
      nodeOperations: !!window.nodeOperations,
      configDrawers: !!window.configDrawers?.value,
      unifiedPreviewManager: !!window.unifiedPreviewLineManager,
      layoutEngine: !!window.layoutEngineInitialized,
      autoRepairSystem: !!window.taskFlowAutoRepair
    }
    
    const healthyComponents = Object.values(components).filter(Boolean).length
    const totalComponents = Object.keys(components).length
    
    return {
      components,
      healthScore: healthyComponents / totalComponents,
      healthy: healthyComponents === totalComponents
    }
  }

  /**
   * 检查警报阈值
   */
  checkAlertThresholds(healthData) {
    if (!this.config.enableRealTimeAlerts) return
    
    const alerts = []
    
    // 检查错误率
    if (healthData.errors.rate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'high_error_rate',
        message: `错误率过高: ${(healthData.errors.rate * 100).toFixed(2)}%`,
        severity: 'warning'
      })
    }
    
    // 检查内存使用
    if (healthData.memory && healthData.memory.usage > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'high_memory_usage',
        message: `内存使用率过高: ${(healthData.memory.usage * 100).toFixed(2)}%`,
        severity: 'warning'
      })
    }
    
    // 检查系统健康度
    if (healthData.systemStatus.healthScore < 0.8) {
      alerts.push({
        type: 'system_unhealthy',
        message: `系统健康度低: ${(healthData.systemStatus.healthScore * 100).toFixed(2)}%`,
        severity: 'error'
      })
    }
    
    // 发送警报
    alerts.forEach(alert => this.sendAlert(alert))
  }

  /**
   * 发送警报
   */
  sendAlert(alert) {
    console.warn(`🚨 [监控警报] ${alert.message}`)
    
    // 触发自动修复（如果可用）
    if (alert.type === 'system_unhealthy' && window.taskFlowAutoRepair) {
      console.log('🔧 [监控触发] 启动自动修复')
      window.taskFlowAutoRepair.performHealthCheckAndRepair()
    }
  }

  /**
   * 记录性能指标
   */
  recordPerformanceMetric(metric) {
    this.metrics.performance.push(metric)
    this.trimMetrics('performance')
  }

  /**
   * 记录错误
   */
  recordError(error) {
    this.metrics.errors.push(error)
    this.trimMetrics('errors')
    
    if (this.isDevelopment) {
      console.error('🐛 [监控记录] 错误:', error)
    }
  }

  /**
   * 记录用户行为
   */
  recordUserAction(action) {
    this.metrics.userActions.push(action)
    this.trimMetrics('userActions')
  }

  /**
   * 记录健康检查
   */
  recordHealthCheck(healthData) {
    this.metrics.healthChecks.push(healthData)
    this.trimMetrics('healthChecks')
  }

  /**
   * 修剪指标历史，保持在限制范围内
   */
  trimMetrics(type) {
    const maxHistory = this.config.maxMetricsHistory
    if (this.metrics[type].length > maxHistory) {
      this.metrics[type] = this.metrics[type].slice(-maxHistory)
    }
  }

  /**
   * 启动定期报告（仅开发环境）
   */
  startPeriodicReporting() {
    if (!this.isDevelopment || this.config.reportingInterval <= 0) return
    
    setInterval(() => {
      this.generateReport()
    }, this.config.reportingInterval)
    
    console.log(`📊 [开发监控] 定期报告已启动，间隔: ${this.config.reportingInterval}ms`)
  }

  /**
   * 生成监控报告
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      environment: this.isDevelopment ? 'development' : 'production',
      summary: {
        totalErrors: this.metrics.errors.length,
        totalUserActions: this.metrics.userActions.length,
        totalPerformanceMetrics: this.metrics.performance.length,
        totalHealthChecks: this.metrics.healthChecks.length
      },
      recentActivity: {
        errors: this.metrics.errors.slice(-5),
        performance: this.metrics.performance.slice(-5),
        healthChecks: this.metrics.healthChecks.slice(-1)
      }
    }
    
    console.log('📊 [监控报告]', report)
    return report
  }

  /**
   * 获取监控数据
   */
  getMetrics() {
    return {
      ...this.metrics,
      config: this.config,
      environment: this.isDevelopment ? 'development' : 'production'
    }
  }

  /**
   * 清除监控数据
   */
  clearMetrics() {
    this.metrics = {
      errors: [],
      performance: [],
      healthChecks: [],
      userActions: []
    }
    console.log('🧹 [监控系统] 数据已清除')
  }

  /**
   * 导出监控数据
   */
  exportMetrics() {
    const data = {
      ...this.getMetrics(),
      exportTime: Date.now(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taskflow-monitoring-${Date.now()}.json`
    a.click()
    
    URL.revokeObjectURL(url)
    console.log('💾 [监控系统] 数据已导出')
  }
}

// 导出监控系统
window.TaskFlowMonitoringSystem = TaskFlowMonitoringSystem

// 自动启动监控系统
if (typeof window !== 'undefined') {
  window.taskFlowMonitoring = new TaskFlowMonitoringSystem()
  
  // 在 DOM 加载完成后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.taskFlowMonitoring.initialize()
    })
  } else {
    window.taskFlowMonitoring.initialize()
  }
}