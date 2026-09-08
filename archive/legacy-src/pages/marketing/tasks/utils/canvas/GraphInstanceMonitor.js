/**
 * Graph实例监控机制
 * 负责监控Graph实例的状态变化、生命周期和异步初始化完成确认
 */
import { ref, watch, nextTick } from 'vue'
import { logger } from '../../../../../utils/enhancedErrorHandler.js'

export class GraphInstanceMonitor {
  constructor() {
    // 监控状态
    this.isMonitoring = ref(false)
    this.graphInstance = ref(null)
    this.initializationStatus = ref('idle') // idle, initializing, completed, failed
    this.lastHealthCheck = ref(null)
    this.errorCount = ref(0)
    this.performanceMetrics = ref({
      initializationTime: 0,
      lastOperationTime: 0,
      totalOperations: 0,
      errorRate: 0
    })

    // 监控配置
    this.config = {
      healthCheckInterval: 5000, // 5秒健康检查
      maxErrorCount: 3,
      initializationTimeout: 10000, // 10秒初始化超时
      enablePerformanceTracking: true
    }

    // 事件监听器
    this.listeners = new Map()
    this.healthCheckTimer = null
    this.initializationTimer = null

    // 绑定方法
    this.startMonitoring = this.startMonitoring.bind(this)
    this.stopMonitoring = this.stopMonitoring.bind(this)
    this.onGraphInstanceChange = this.onGraphInstanceChange.bind(this)
    this.performHealthCheck = this.performHealthCheck.bind(this)
  }

  /**
   * 开始监控Graph实例
   * @param {Ref} graphRef - Graph实例的响应式引用
   * @param {Object} options - 监控选项
   */
  startMonitoring(graphRef, options = {}) {
    if (this.isMonitoring.value) {
      logger.warn('[GraphInstanceMonitor] 监控已在运行中')
      return
    }

    // 合并配置
    this.config = { ...this.config, ...options }
    this.graphInstance = graphRef
    this.isMonitoring.value = true

    logger.info('[GraphInstanceMonitor] 开始监控Graph实例')

    // 监听Graph实例变化
    this.setupGraphWatcher()

    // 开始健康检查
    this.startHealthCheck()

    // 触发监控开始事件
    this.emit('monitoring-started', {
      timestamp: Date.now(),
      config: this.config
    })
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (!this.isMonitoring.value) {
      return
    }

    logger.info('[GraphInstanceMonitor] 停止监控Graph实例')

    // 清理定时器
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = null
    }

    if (this.initializationTimer) {
      clearTimeout(this.initializationTimer)
      this.initializationTimer = null
    }

    // 清理监听器
    this.listeners.clear()

    // 重置状态
    this.isMonitoring.value = false
    this.initializationStatus.value = 'idle'
    this.errorCount.value = 0

    // 触发监控停止事件
    this.emit('monitoring-stopped', {
      timestamp: Date.now(),
      finalMetrics: this.performanceMetrics.value
    })
  }

  /**
   * 设置Graph实例监听器
   */
  setupGraphWatcher() {
    // 监听Graph实例变化
    const unwatch = watch(
      this.graphInstance,
      (newGraph, oldGraph) => {
        this.onGraphInstanceChange(newGraph, oldGraph)
      },
      { immediate: true }
    )

    // 保存取消监听函数
    this.listeners.set('graph-watcher', unwatch)
  }

  /**
   * Graph实例变化处理
   * @param {Graph|null} newGraph - 新的Graph实例
   * @param {Graph|null} oldGraph - 旧的Graph实例
   */
  onGraphInstanceChange(newGraph, oldGraph) {
    const timestamp = Date.now()

    if (oldGraph && !newGraph) {
      // Graph实例被销毁
      logger.info('[GraphInstanceMonitor] Graph实例已销毁')
      this.initializationStatus.value = 'idle'
      this.emit('graph-destroyed', { timestamp, oldGraph })
      return
    }

    if (!oldGraph && newGraph) {
      // Graph实例被创建
      logger.info('[GraphInstanceMonitor] 检测到新的Graph实例')
      this.initializationStatus.value = 'initializing'
      this.startInitializationTracking(newGraph)
      this.emit('graph-created', { timestamp, newGraph })
      return
    }

    if (oldGraph && newGraph && oldGraph !== newGraph) {
      // Graph实例被替换
      logger.info('[GraphInstanceMonitor] Graph实例已替换')
      this.initializationStatus.value = 'initializing'
      this.startInitializationTracking(newGraph)
      this.emit('graph-replaced', { timestamp, oldGraph, newGraph })
    }
  }

  /**
   * 开始初始化跟踪
   * @param {Graph} graphInstance - Graph实例
   */
  startInitializationTracking(graphInstance) {
    const startTime = performance.now()

    // 设置初始化超时
    this.initializationTimer = setTimeout(() => {
      if (this.initializationStatus.value === 'initializing') {
        logger.error('[GraphInstanceMonitor] Graph初始化超时')
        this.initializationStatus.value = 'failed'
        this.errorCount.value++
        this.emit('initialization-timeout', {
          timestamp: Date.now(),
          timeout: this.config.initializationTimeout
        })
      }
    }, this.config.initializationTimeout)

    // 等待Graph完全初始化
    this.waitForInitializationComplete(graphInstance, startTime)
  }

  /**
   * 等待初始化完成
   * @param {Graph} graphInstance - Graph实例
   * @param {number} startTime - 开始时间
   */
  async waitForInitializationComplete(graphInstance, startTime) {
    try {
      // 等待DOM更新
      await nextTick()

      // 检查Graph实例是否有效
      if (!this.validateGraphInstance(graphInstance)) {
        throw new Error('Graph实例验证失败')
      }

      // 等待Graph内部初始化完成
      await this.waitForGraphReady(graphInstance)

      // 计算初始化时间
      const initializationTime = performance.now() - startTime
      this.performanceMetrics.value.initializationTime = initializationTime

      // 清理初始化定时器
      if (this.initializationTimer) {
        clearTimeout(this.initializationTimer)
        this.initializationTimer = null
      }

      // 更新状态
      this.initializationStatus.value = 'completed'
      logger.info(`[GraphInstanceMonitor] Graph初始化完成，耗时: ${initializationTime.toFixed(2)}ms`)

      // 触发初始化完成事件
      this.emit('initialization-completed', {
        timestamp: Date.now(),
        initializationTime,
        graphInstance
      })

    } catch (error) {
      logger.error('[GraphInstanceMonitor] Graph初始化失败:', error)
      this.initializationStatus.value = 'failed'
      this.errorCount.value++

      // 触发初始化失败事件
      this.emit('initialization-failed', {
        timestamp: Date.now(),
        error: error.message,
        graphInstance
      })
    }
  }

  /**
   * 等待Graph准备就绪
   * @param {Graph} graphInstance - Graph实例
   */
  async waitForGraphReady(graphInstance) {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 50 // 最多尝试50次，每次20ms
      
      const checkReady = () => {
        attempts++
        
        try {
          // 检查Graph是否有容器
          if (!graphInstance.container) {
            if (attempts >= maxAttempts) {
              reject(new Error('Graph容器未找到'))
              return
            }
            setTimeout(checkReady, 20)
            return
          }

          // 检查Graph是否可以执行基本操作
          if (typeof graphInstance.addNode !== 'function' ||
              typeof graphInstance.addEdge !== 'function') {
            if (attempts >= maxAttempts) {
              reject(new Error('Graph基本方法不可用'))
              return
            }
            setTimeout(checkReady, 20)
            return
          }

          // Graph准备就绪
          resolve()
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(error)
          } else {
            setTimeout(checkReady, 20)
          }
        }
      }

      checkReady()
    })
  }

  /**
   * 验证Graph实例
   * @param {Graph} graphInstance - Graph实例
   * @returns {boolean} 是否有效
   */
  validateGraphInstance(graphInstance) {
    if (!graphInstance) {
      return false
    }

    // 检查必要的方法
    const requiredMethods = ['addNode', 'removeNode', 'addEdge', 'removeEdge', 'getCells']
    for (const method of requiredMethods) {
      if (typeof graphInstance[method] !== 'function') {
        logger.error(`[GraphInstanceMonitor] Graph实例缺少方法: ${method}`)
        return false
      }
    }

    return true
  }

  /**
   * 开始健康检查
   */
  startHealthCheck() {
    if (!this.config.enablePerformanceTracking) {
      return
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck()
    }, this.config.healthCheckInterval)
  }

  /**
   * 执行健康检查
   */
  performHealthCheck() {
    if (!this.graphInstance.value) {
      return
    }

    try {
      const startTime = performance.now()
      
      // 执行基本的Graph操作测试
      const cellCount = this.graphInstance.value.getCells().length
      const checkTime = performance.now() - startTime

      // 更新性能指标
      this.performanceMetrics.value.lastOperationTime = checkTime
      this.performanceMetrics.value.totalOperations++
      this.performanceMetrics.value.errorRate = 
        this.errorCount.value / this.performanceMetrics.value.totalOperations

      // 更新最后健康检查时间
      this.lastHealthCheck.value = Date.now()

      // 触发健康检查事件
      this.emit('health-check', {
        timestamp: this.lastHealthCheck.value,
        cellCount,
        checkTime,
        metrics: this.performanceMetrics.value
      })

      // 检查是否需要警告
      if (checkTime > 100) { // 操作时间超过100ms
        logger.warn(`[GraphInstanceMonitor] Graph操作响应缓慢: ${checkTime.toFixed(2)}ms`)
        this.emit('performance-warning', {
          timestamp: Date.now(),
          operationTime: checkTime,
          type: 'slow-response'
        })
      }

    } catch (error) {
      this.errorCount.value++
      logger.error('[GraphInstanceMonitor] 健康检查失败:', error)
      
      this.emit('health-check-failed', {
        timestamp: Date.now(),
        error: error.message,
        errorCount: this.errorCount.value
      })

      // 检查错误计数是否超过阈值
      if (this.errorCount.value >= this.config.maxErrorCount) {
        logger.error('[GraphInstanceMonitor] 错误计数超过阈值，建议重新初始化Graph')
        this.emit('critical-error', {
          timestamp: Date.now(),
          errorCount: this.errorCount.value,
          maxErrorCount: this.config.maxErrorCount
        })
      }
    }
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {Object} data - 事件数据
   */
  emit(eventName, data) {
    const listeners = this.listeners.get(eventName) || []
    listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        logger.error(`[GraphInstanceMonitor] 事件监听器执行失败 (${eventName}):`, error)
      }
    })
  }

  /**
   * 添加事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   */
  on(eventName, listener) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }
    this.listeners.get(eventName).push(listener)
  }

  /**
   * 移除事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   */
  off(eventName, listener) {
    const listeners = this.listeners.get(eventName)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 获取当前监控状态
   * @returns {Object} 监控状态
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring.value,
      initializationStatus: this.initializationStatus.value,
      lastHealthCheck: this.lastHealthCheck.value,
      errorCount: this.errorCount.value,
      performanceMetrics: this.performanceMetrics.value,
      hasGraphInstance: !!this.graphInstance.value
    }
  }

  /**
   * 重置监控状态
   */
  reset() {
    this.errorCount.value = 0
    this.performanceMetrics.value = {
      initializationTime: 0,
      lastOperationTime: 0,
      totalOperations: 0,
      errorRate: 0
    }
    this.lastHealthCheck.value = null
  }
}

// 创建单例实例
export const graphInstanceMonitor = new GraphInstanceMonitor()

// 导出工厂函数
export function createGraphInstanceMonitor(options = {}) {
  return new GraphInstanceMonitor(options)
}

// 导出异步初始化完成确认机制
export class AsyncInitializationConfirm {
  constructor(monitor = graphInstanceMonitor) {
    this.monitor = monitor
    this.pendingConfirmations = new Map()
  }

  /**
   * 等待异步初始化完成
   * @param {string} operationId - 操作ID
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise} 初始化完成Promise
   */
  waitForInitialization(operationId = 'default', timeout = 10000) {
    return new Promise((resolve, reject) => {
      // 如果已经初始化完成，直接返回
      if (this.monitor.initializationStatus.value === 'completed') {
        resolve({
          operationId,
          status: 'completed',
          timestamp: Date.now()
        })
        return
      }

      // 如果初始化失败，直接拒绝
      if (this.monitor.initializationStatus.value === 'failed') {
        reject(new Error(`Graph初始化失败 (${operationId})`))
        return
      }

      // 设置超时
      const timeoutId = setTimeout(() => {
        this.pendingConfirmations.delete(operationId)
        reject(new Error(`异步初始化确认超时 (${operationId})`))
      }, timeout)

      // 监听初始化完成事件
      const onCompleted = (data) => {
        clearTimeout(timeoutId)
        this.pendingConfirmations.delete(operationId)
        this.monitor.off('initialization-completed', onCompleted)
        this.monitor.off('initialization-failed', onFailed)
        resolve({
          operationId,
          status: 'completed',
          timestamp: data.timestamp,
          initializationTime: data.initializationTime
        })
      }

      // 监听初始化失败事件
      const onFailed = (data) => {
        clearTimeout(timeoutId)
        this.pendingConfirmations.delete(operationId)
        this.monitor.off('initialization-completed', onCompleted)
        this.monitor.off('initialization-failed', onFailed)
        reject(new Error(`Graph初始化失败: ${data.error} (${operationId})`))
      }

      // 注册监听器
      this.monitor.on('initialization-completed', onCompleted)
      this.monitor.on('initialization-failed', onFailed)

      // 记录待确认的操作
      this.pendingConfirmations.set(operationId, {
        resolve,
        reject,
        timeout: timeoutId,
        timestamp: Date.now()
      })
    })
  }

  /**
   * 取消等待
   * @param {string} operationId - 操作ID
   */
  cancel(operationId) {
    const pending = this.pendingConfirmations.get(operationId)
    if (pending) {
      clearTimeout(pending.timeout)
      pending.reject(new Error(`异步初始化确认已取消 (${operationId})`))
      this.pendingConfirmations.delete(operationId)
    }
  }

  /**
   * 取消所有等待
   */
  cancelAll() {
    for (const [operationId] of this.pendingConfirmations) {
      this.cancel(operationId)
    }
  }

  /**
   * 获取待确认操作列表
   * @returns {Array} 待确认操作列表
   */
  getPendingOperations() {
    return Array.from(this.pendingConfirmations.keys())
  }
}

// 创建单例实例
export const asyncInitializationConfirm = new AsyncInitializationConfirm()