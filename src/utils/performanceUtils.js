/**
 * 性能优化工具类
 * 提供防抖、节流、缓存等性能优化功能
 */

export class PerformanceUtils {
  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  static debounce(func, delay = 300) {
    let timeoutId
    return function(...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  static throttle(func, limit = 100) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  /**
   * 简单缓存装饰器
   * @param {number} maxSize - 最大缓存大小
   * @returns {Function} 装饰器函数
   */
  static memoize(maxSize = 100) {
    return function(target, propertyName, descriptor) {
      const originalMethod = descriptor.value
      const cache = new Map()
      
      descriptor.value = function(...args) {
        const key = JSON.stringify(args)
        
        if (cache.has(key)) {
          return cache.get(key)
        }
        
        const result = originalMethod.apply(this, args)
        
        // 限制缓存大小
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value
          cache.delete(firstKey)
        }
        
        cache.set(key, result)
        return result
      }
    }
  }

  /**
   * 批量操作优化
   * @param {Function} batchProcessor - 批量处理函数
   * @param {number} batchSize - 批次大小
   * @param {number} delay - 批次间延迟
   */
  static async processBatch(items, batchProcessor, batchSize = 10, delay = 0) {
    const results = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await batchProcessor(batch)
      results.push(...batchResults)
      
      // 批次间延迟，避免阻塞UI
      if (delay > 0 && i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return results
  }

  /**
   * 性能监控装饰器
   * @param {string} operationName - 操作名称
   */
  static monitor(operationName) {
    return function(target, propertyName, descriptor) {
      const originalMethod = descriptor.value
      
      descriptor.value = function(...args) {
        const startTime = performance.now()
        
        try {
          const result = originalMethod.apply(this, args)
          
          // 如果是Promise，监控异步操作
          if (result && typeof result.then === 'function') {
            return result.finally(() => {
              const endTime = performance.now()
              console.log(`⏱️ [Performance] ${operationName}: ${(endTime - startTime).toFixed(2)}ms`)
            })
          }
          
          const endTime = performance.now()
          console.log(`⏱️ [Performance] ${operationName}: ${(endTime - startTime).toFixed(2)}ms`)
          return result
        } catch (error) {
          const endTime = performance.now()
          console.log(`⏱️ [Performance] ${operationName} (错误): ${(endTime - startTime).toFixed(2)}ms`)
          throw error
        }
      }
    }
  }

  /**
   * 内存使用监控
   */
  static logMemoryUsage(context = 'Unknown') {
    if (performance.memory) {
      const memory = performance.memory
      console.log(`🧠 [Memory] ${context}:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      })
    }
  }

  /**
   * 对象池管理
   */
  static createObjectPool(createFn, resetFn, initialSize = 10) {
    const pool = []
    
    // 初始化对象池
    for (let i = 0; i < initialSize; i++) {
      pool.push(createFn())
    }
    
    return {
      acquire() {
        return pool.length > 0 ? pool.pop() : createFn()
      },
      
      release(obj) {
        if (resetFn) resetFn(obj)
        pool.push(obj)
      },
      
      size() {
        return pool.length
      }
    }
  }
}

/**
 * 事件总线优化
 */
export class OptimizedEventBus {
  constructor() {
    this.events = new Map()
    this.onceEvents = new Set()
  }

  on(event, callback, options = {}) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    
    const wrappedCallback = options.throttle 
      ? PerformanceUtils.throttle(callback, options.throttle)
      : options.debounce 
        ? PerformanceUtils.debounce(callback, options.debounce)
        : callback
    
    this.events.get(event).add(wrappedCallback)
    
    return () => this.off(event, wrappedCallback)
  }

  once(event, callback) {
    const wrappedCallback = (...args) => {
      callback(...args)
      this.off(event, wrappedCallback)
    }
    
    this.onceEvents.add(wrappedCallback)
    return this.on(event, wrappedCallback)
  }

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback)
    }
    this.onceEvents.delete(callback)
  }

  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`事件处理错误 [${event}]:`, error)
        }
      })
    }
  }

  clear() {
    this.events.clear()
    this.onceEvents.clear()
  }
}