/**
 * 智能缓存管理器
 * 提供多层级缓存策略，优化画布系统性能
 */

export class SmartCacheManager {
  constructor(options = {}) {
    this.cache = new Map()
    this.accessTimes = new Map()
    this.hitCounts = new Map()
    this.maxSize = options.maxSize || 1000
    this.ttl = options.ttl || 5 * 60 * 1000 // 5分钟
    this.cleanupInterval = options.cleanupInterval || 60 * 1000 // 1分钟
    this.hitRateThreshold = options.hitRateThreshold || 0.1
    
    // 启动定期清理
    this.startCleanup()
  }

  /**
   * 设置缓存项
   * @param {string} type - 缓存类型
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} customTtl - 自定义TTL
   */
  set(type, key, value, customTtl) {
    const cache = this.caches[type]
    if (!cache) {
      console.warn(`[SmartCacheManager] 未知缓存类型: ${type}`)
      return
    }

    const expiry = Date.now() + (customTtl || this.options.ttl)
    const cacheKey = `${type}:${key}`
    
    cache.set(key, {
      value,
      expiry,
      accessCount: 0,
      lastAccess: Date.now()
    })
    
    // 更新LRU记录
    if (this.options.enableLRU) {
      this.accessOrder.set(cacheKey, Date.now())
    }
    
    // 检查缓存大小
    this.checkCacheSize(type)
  }

  /**
   * 获取缓存项
   * @param {string} type - 缓存类型
   * @param {string} key - 缓存键
   * @returns {any} 缓存值或null
   */
  get(type, key) {
    const cache = this.caches[type]
    if (!cache) return null

    const item = cache.get(key)
    if (!item) {
      this.stats.misses++
      return null
    }

    // 检查过期
    if (Date.now() > item.expiry) {
      cache.delete(key)
      this.stats.misses++
      return null
    }

    // 更新访问统计
    item.accessCount++
    item.lastAccess = Date.now()
    this.stats.hits++
    
    // 更新LRU记录
    if (this.options.enableLRU) {
      const cacheKey = `${type}:${key}`
      this.accessOrder.set(cacheKey, Date.now())
    }

    return item.value
  }

  /**
   * 批量设置缓存
   * @param {string} type - 缓存类型
   * @param {Object} items - 键值对对象
   */
  setBatch(type, items) {
    Object.entries(items).forEach(([key, value]) => {
      this.set(type, key, value)
    })
  }

  /**
   * 批量获取缓存
   * @param {string} type - 缓存类型
   * @param {Array} keys - 键数组
   * @returns {Object} 结果对象
   */
  getBatch(type, keys) {
    const results = {}
    keys.forEach(key => {
      const value = this.get(type, key)
      if (value !== null) {
        results[key] = value
      }
    })
    return results
  }

  /**
   * 智能预加载
   * @param {string} type - 缓存类型
   * @param {Function} loader - 加载函数
   * @param {Array} keys - 预加载的键
   */
  async preload(type, loader, keys) {
    const missingKeys = keys.filter(key => !this.get(type, key))
    
    if (missingKeys.length === 0) return
    
    try {
      const results = await loader(missingKeys)
      Object.entries(results).forEach(([key, value]) => {
        this.set(type, key, value)
      })
    } catch (error) {
      console.error('[SmartCacheManager] 预加载失败:', error)
    }
  }

  /**
   * 检查缓存大小并执行LRU淘汰
   * @param {string} type - 缓存类型
   */
  checkCacheSize(type) {
    const cache = this.caches[type]
    const maxSizePerType = Math.floor(this.options.maxSize / Object.keys(this.caches).length)
    
    if (cache.size <= maxSizePerType) return

    // LRU淘汰
    if (this.options.enableLRU) {
      this.evictLRU(type, cache.size - maxSizePerType)
    } else {
      // 简单的FIFO淘汰
      this.evictFIFO(type, cache.size - maxSizePerType)
    }
  }

  /**
   * LRU淘汰策略
   * @param {string} type - 缓存类型
   * @param {number} count - 淘汰数量
   */
  evictLRU(type, count) {
    const cache = this.caches[type]
    const typePrefix = `${type}:`
    
    // 获取该类型的所有键，按访问时间排序
    const typeKeys = Array.from(this.accessOrder.entries())
      .filter(([key]) => key.startsWith(typePrefix))
      .sort(([, timeA], [, timeB]) => timeA - timeB)
      .slice(0, count)
    
    typeKeys.forEach(([fullKey]) => {
      const key = fullKey.replace(typePrefix, '')
      cache.delete(key)
      this.accessOrder.delete(fullKey)
      this.stats.evictions++
    })
  }

  /**
   * FIFO淘汰策略
   * @param {string} type - 缓存类型
   * @param {number} count - 淘汰数量
   */
  evictFIFO(type, count) {
    const cache = this.caches[type]
    const keys = Array.from(cache.keys()).slice(0, count)
    
    keys.forEach(key => {
      cache.delete(key)
      this.stats.evictions++
    })
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now()
    let cleanedCount = 0
    
    Object.entries(this.caches).forEach(([type, cache]) => {
      for (const [key, item] of cache.entries()) {
        if (now > item.expiry) {
          cache.delete(key)
          
          // 清理LRU记录
          if (this.options.enableLRU) {
            this.accessOrder.delete(`${type}:${key}`)
          }
          
          cleanedCount++
        }
      }
    })
    
    this.stats.cleanups++
    
    if (cleanedCount > 0) {
      console.log(`[SmartCacheManager] 清理了 ${cleanedCount} 个过期缓存项`)
    }
  }

  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }

  /**
   * 停止清理定时器
   */
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const totalSize = Object.values(this.caches).reduce((sum, cache) => sum + cache.size, 0)
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0
    
    return {
      ...this.stats,
      totalSize,
      hitRate: `${hitRate}%`,
      cacheDetails: Object.fromEntries(
        Object.entries(this.caches).map(([type, cache]) => [type, cache.size])
      )
    }
  }

  /**
   * 清空指定类型的缓存
   * @param {string} type - 缓存类型
   */
  clear(type) {
    if (type) {
      const cache = this.caches[type]
      if (cache) {
        cache.clear()
        
        // 清理LRU记录
        if (this.options.enableLRU) {
          const typePrefix = `${type}:`
          for (const key of this.accessOrder.keys()) {
            if (key.startsWith(typePrefix)) {
              this.accessOrder.delete(key)
            }
          }
        }
      }
    } else {
      // 清空所有缓存
      Object.values(this.caches).forEach(cache => cache.clear())
      this.accessOrder.clear()
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy() {
    this.stopCleanupTimer()
    this.clear()
  }
}

// 创建全局缓存实例
export const globalCacheManager = new SmartCacheManager({
  maxSize: 2000,
  ttl: 600000, // 10分钟
  enableStats: true
})