/**
 * 性能监控工具
 * 用于测量节点刷新和渲染性能
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.thresholds = {
      singleNodeUpdate: 16, // 单节点更新最大时间 (ms)
      batchNodeUpdate: 1000, // 批量节点更新最大时间 (ms)
      portRecalculation: 8, // 端口重计算最大时间 (ms)
      renderFrame: 16 // 渲染帧时间 (ms)
    }
    this.enabled = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  }
  
  /**
   * 开始性能测量
   * @param {string} name - 测量名称
   * @returns {Function} 结束测量的函数
   */
  measure(name) {
    if (!this.enabled) {
      return () => ({ duration: 0, success: true })
    }
    
    const startTime = performance.now()
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
    
    return () => {
      const endTime = performance.now()
      const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
      const duration = endTime - startTime
      const memoryDelta = endMemory - startMemory
      
      const metric = {
        name,
        duration,
        memoryDelta,
        timestamp: endTime,
        success: true,
        threshold: this.thresholds[name] || null,
        exceeded: this.thresholds[name] ? duration > this.thresholds[name] : false
      }
      
      this.recordMetric(metric)
      return metric
    }
  }
  
  /**
   * 记录性能指标
   * @param {Object} metric - 性能指标
   */
  recordMetric(metric) {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, [])
    }
    
    this.metrics.get(metric.name).push(metric)
    
    // 保持最近100条记录
    const records = this.metrics.get(metric.name)
    if (records.length > 100) {
      records.shift()
    }
    
    // 如果超出阈值，发出警告
    if (metric.exceeded) {
      console.warn(`[PerformanceMonitor] ${metric.name} 性能警告: ${metric.duration.toFixed(2)}ms (阈值: ${metric.threshold}ms)`)
    }
  }
  
  /**
   * 获取性能统计信息
   * @param {string} name - 测量名称
   * @returns {Object} 统计信息
   */
  getStats(name) {
    const records = this.metrics.get(name) || []
    if (records.length === 0) {
      return null
    }
    
    const durations = records.map(r => r.duration)
    const sorted = durations.sort((a, b) => a - b)
    
    return {
      name,
      count: records.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      threshold: this.thresholds[name] || null,
      exceededCount: records.filter(r => r.exceeded).length,
      exceededRate: (records.filter(r => r.exceeded).length / records.length) * 100
    }
  }
  
  /**
   * 获取所有性能统计
   * @returns {Array} 所有统计信息
   */
  getAllStats() {
    const stats = []
    for (const [name] of this.metrics) {
      const stat = this.getStats(name)
      if (stat) {
        stats.push(stat)
      }
    }
    return stats
  }
  
  /**
   * 清除性能记录
   * @param {string} name - 测量名称，如果未指定则清除所有
   */
  clear(name) {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
  
  /**
   * 导出性能报告
   * @returns {Object} 性能报告
   */
  exportReport() {
    const stats = this.getAllStats()
    const timestamp = new Date().toISOString()
    
    return {
      timestamp,
      enabled: this.enabled,
      thresholds: this.thresholds,
      stats,
      summary: {
        totalMeasurements: stats.reduce((sum, stat) => sum + stat.count, 0),
        totalExceeded: stats.reduce((sum, stat) => sum + stat.exceededCount, 0),
        performanceIssues: stats.filter(stat => stat.exceededRate > 5).length
      }
    }
  }
  
  /**
   * 设置阈值
   * @param {string} name - 测量名称
   * @param {number} threshold - 阈值（毫秒）
   */
  setThreshold(name, threshold) {
    this.thresholds[name] = threshold
  }
  
  /**
   * 启用/禁用监控
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.enabled = enabled
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor()

/**
 * 性能测量装饰器
 * @param {string} name - 测量名称
 * @returns {Function} 装饰器函数
 */
export function measurePerformance(name) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args) {
      const endMeasure = performanceMonitor.measure(`${name || propertyKey}`)
      const result = originalMethod.apply(this, args)
      
      // 如果返回的是Promise，等待其完成
      if (result && typeof result.then === 'function') {
        return result.finally(endMeasure)
      } else {
        endMeasure()
        return result
      }
    }
    
    return descriptor
  }
}

/**
 * 异步性能测量辅助函数
 * @param {string} name - 测量名称
 * @param {Function} fn - 要测量的函数
 * @returns {Promise} 函数执行结果
 */
export async function measureAsync(name, fn) {
  const endMeasure = performanceMonitor.measure(name)
  try {
    const result = await fn()
    endMeasure()
    return result
  } catch (error) {
    endMeasure()
    throw error
  }
}

/**
 * 同步性能测量辅助函数
 * @param {string} name - 测量名称
 * @param {Function} fn - 要测量的函数
 * @returns {*} 函数执行结果
 */
export function measureSync(name, fn) {
  const endMeasure = performanceMonitor.measure(name)
  try {
    const result = fn()
    endMeasure()
    return result
  } catch (error) {
    endMeasure()
    throw error
  }
}

export default performanceMonitor