/**
 * 性能监控工具
 * 用于测量节点刷新和渲染性能
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.thresholds = {
      singleNodeUpdate: 16,
      batchNodeUpdate: 1000,
      portRecalculation: 8,
      renderFrame: 16
    }
    this.enabled = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  }
  
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
  
  recordMetric(metric) {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, [])
    }
    
    this.metrics.get(metric.name).push(metric)
    
    const records = this.metrics.get(metric.name)
    if (records.length > 100) {
      records.shift()
    }
    
    if (metric.exceeded) {
      console.warn(`[PerformanceMonitor] ${metric.name} 性能警告: ${metric.duration.toFixed(2)}ms (阈值: ${metric.threshold}ms)`) 
    }
  }
  
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
  
  clear(name) {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
  
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
  
  setThreshold(name, threshold) {
    this.thresholds[name] = threshold
  }
  
  setEnabled(enabled) {
    this.enabled = enabled
  }
}

export const performanceMonitor = new PerformanceMonitor()

export function measurePerformance(name) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args) {
      const endMeasure = performanceMonitor.measure(`${name || propertyKey}`)
      const result = originalMethod.apply(this, args)
      
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
