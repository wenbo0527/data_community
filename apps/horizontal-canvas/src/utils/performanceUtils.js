export class PerformanceUtils {
  static debounce(func, delay = 300) {
    let timeoutId
    return function(...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }

  static throttle(func, limit = 100) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => { inThrottle = false }, limit)
      }
    }
  }

  static memoize(maxSize = 100) {
    return function(target, propertyName, descriptor) {
      const originalMethod = descriptor.value
      const cache = new Map()
      descriptor.value = function(...args) {
        const key = JSON.stringify(args)
        if (cache.has(key)) return cache.get(key)
        const result = originalMethod.apply(this, args)
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value
          cache.delete(firstKey)
        }
        cache.set(key, result)
        return result
      }
    }
  }

  static async processBatch(items, batchProcessor, batchSize = 10, delay = 0) {
    const results = []
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await batchProcessor(batch)
      results.push(...batchResults)
      if (delay > 0 && i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    return results
  }
}

export class OptimizedEventBus {
  constructor() {
    this.events = new Map()
    this.onceEvents = new Set()
  }
  on(event, callback, options = {}) {
    if (!this.events.has(event)) this.events.set(event, new Set())
    const wrapped = options.throttle
      ? PerformanceUtils.throttle(callback, options.throttle)
      : options.debounce
        ? PerformanceUtils.debounce(callback, options.debounce)
        : callback
    this.events.get(event).add(wrapped)
    return () => this.off(event, wrapped)
  }
  once(event, callback) {
    const wrapped = (...args) => { callback(...args); this.off(event, wrapped) }
    this.onceEvents.add(wrapped)
    return this.on(event, wrapped)
  }
  off(event, callback) {
    if (this.events.has(event)) this.events.get(event).delete(callback)
    this.onceEvents.delete(callback)
  }
  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(cb => { try { cb(...args) } catch (e) {} })
    }
  }
  clear() {
    this.events.clear()
    this.onceEvents.clear()
  }
}
