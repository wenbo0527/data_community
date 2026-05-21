/**
 * 缓存管理器
 * 提供智能缓存机制，减少重复计算和提高性能
 */
export class CacheManager {
  constructor(options = {}) {
    this.options = {
      maxSize: 1000,
      ttl: 300000, // 5分钟
      cleanupInterval: 60000, // 1分钟
      enableLRU: true,
      enableStats: true,
      ...options
    }
    
    this.cache = new Map()
    this.accessTimes = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0,
      evictions: 0
    }
    
    this.cleanupTimer = null
    this.isDestroyed = false
    
    this.startCleanupTimer()
    
    console.log('💾 [CacheManager] 缓存管理器初始化完成')
  }

  /**
   * 设置缓存项
   */
  set(key, value, customTTL = null) {
    if (this.isDestroyed) {return false}

    try {
      const ttl = customTTL || this.options.ttl
      const now = Date.now()
      
      const cacheItem = {
        value,
        timestamp: now,
        ttl,
        expiresAt: now + ttl,
        accessCount: 0,
        lastAccess: now
      }
      
      // 检查缓存大小限制
      if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
        this.evictLRU()
      }
      
      this.cache.set(key, cacheItem)
      this.accessTimes.set(key, now)
      
      if (this.options.enableStats) {
        this.stats.sets++
      }
      
      return true
      
    } catch (error) {
      console.error('设置缓存失败:', error)
      return false
    }
  }

  /**
   * 获取缓存项
   */
  get(key) {
    if (this.isDestroyed) {return null}

    const cacheItem = this.cache.get(key)
    
    if (!cacheItem) {
      if (this.options.enableStats) {
        this.stats.misses++
      }
      return null
    }
    
    const now = Date.now()
    
    // 检查是否过期
    if (now > cacheItem.expiresAt) {
      this.delete(key)
      if (this.options.enableStats) {
        this.stats.misses++
      }
      return null
    }
    
    // 更新访问信息
    cacheItem.accessCount++
    cacheItem.lastAccess = now
    this.accessTimes.set(key, now)
    
    if (this.options.enableStats) {
      this.stats.hits++
    }
    
    return cacheItem.value
  }

  /**
   * 检查缓存项是否存在且未过期
   */
  has(key) {
    const cacheItem = this.cache.get(key)
    if (!cacheItem) {return false}
    
    const now = Date.now()
    if (now > cacheItem.expiresAt) {
      this.delete(key)
      return false
    }
    
    return true
  }

  /**
   * 删除缓存项
   */
  delete(key) {
    const deleted = this.cache.delete(key)
    this.accessTimes.delete(key)
    
    if (deleted && this.options.enableStats) {
      this.stats.deletes++
    }
    
    return deleted
  }

  /**
   * 批量删除缓存项
   */
  deleteMany(keys) {
    let deletedCount = 0
    
    for (const key of keys) {
      if (this.delete(key)) {
        deletedCount++
      }
    }
    
    return deletedCount
  }

  /**
   * 根据前缀删除缓存项
   */
  deleteByPrefix(prefix) {
    const keysToDelete = []
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }
    
    return this.deleteMany(keysToDelete)
  }

  /**
   * 根据模式删除缓存项
   */
  deleteByPattern(pattern) {
    const regex = new RegExp(pattern)
    const keysToDelete = []
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }
    
    return this.deleteMany(keysToDelete)
  }

  /**
   * 获取或设置缓存项（如果不存在则计算）
   */
  async getOrSet(key, factory, customTTL = null) {
    let value = this.get(key)
    
    if (value === null) {
      try {
        value = await factory()
        this.set(key, value, customTTL)
      } catch (error) {
        console.error('缓存工厂函数执行失败:', error)
        throw error
      }
    }
    
    return value
  }

  /**
   * 批量获取缓存项
   */
  getMany(keys) {
    const results = new Map()
    
    for (const key of keys) {
      const value = this.get(key)
      if (value !== null) {
        results.set(key, value)
      }
    }
    
    return results
  }

  /**
   * 批量设置缓存项
   */
  setMany(entries, customTTL = null) {
    let successCount = 0
    
    for (const [key, value] of entries) {
      if (this.set(key, value, customTTL)) {
        successCount++
      }
    }
    
    return successCount
  }

  /**
   * 清空所有缓存
   */
  clear() {
    const size = this.cache.size
    this.cache.clear()
    this.accessTimes.clear()
    
    console.log(`🧹 [CacheManager] 清空了 ${size} 个缓存项`)
    return size
  }

  /**
   * 驱逐最近最少使用的项目
   */
  evictLRU() {
    if (!this.options.enableLRU || this.cache.size === 0) {return}

    let oldestKey = null
    let oldestTime = Infinity
    
    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey)
      if (this.options.enableStats) {
        this.stats.evictions++
      }
      console.log(`🗑️ [CacheManager] LRU驱逐: ${oldestKey}`)
    }
  }

  /**
   * 清理过期缓存项
   */
  cleanup() {
    const now = Date.now()
    const keysToDelete = []
    
    for (const [key, cacheItem] of this.cache) {
      if (now > cacheItem.expiresAt) {
        keysToDelete.push(key)
      }
    }
    
    const deletedCount = this.deleteMany(keysToDelete)
    
    if (deletedCount > 0) {
      console.log(`🧹 [CacheManager] 清理了 ${deletedCount} 个过期缓存项`)
    }
    
    if (this.options.enableStats) {
      this.stats.cleanups++
    }
    
    return deletedCount
  }

  /**
   * 启动自动清理定时器
   */
  startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }

  /**
   * 停止自动清理定时器
   */
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? this.stats.hits / (this.stats.hits + this.stats.misses) 
      : 0

    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: Math.round(hitRate * 10000) / 100, // 百分比，保留2位小数
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * 估算内存使用量
   */
  estimateMemoryUsage() {
    let totalSize = 0
    
    for (const [key, cacheItem] of this.cache) {
      // 粗略估算
      totalSize += key.length * 2 // 字符串键
      totalSize += JSON.stringify(cacheItem.value).length * 2 // 值的大小
      totalSize += 100 // 元数据开销
    }
    
    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024 * 100) / 100,
      mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
    }
  }

  /**
   * 获取缓存项详细信息
   */
  getItemInfo(key) {
    const cacheItem = this.cache.get(key)
    if (!cacheItem) {return null}

    const now = Date.now()
    
    return {
      key,
      exists: true,
      expired: now > cacheItem.expiresAt,
      age: now - cacheItem.timestamp,
      ttl: cacheItem.ttl,
      remainingTTL: Math.max(0, cacheItem.expiresAt - now),
      accessCount: cacheItem.accessCount,
      lastAccess: cacheItem.lastAccess,
      timeSinceLastAccess: now - cacheItem.lastAccess
    }
  }

  /**
   * 获取所有缓存键
   */
  keys() {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取所有缓存值
   */
  values() {
    return Array.from(this.cache.values()).map(item => item.value)
  }

  /**
   * 获取所有缓存项
   */
  entries() {
    const entries = []
    for (const [key, cacheItem] of this.cache) {
      entries.push([key, cacheItem.value])
    }
    return entries
  }

  /**
   * 更新选项
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions }
    
    // 重启清理定时器
    this.startCleanupTimer()
    
    console.log('⚙️ [CacheManager] 选项已更新:', this.options)
  }

  /**
   * 销毁缓存管理器
   */
  destroy() {
    this.isDestroyed = true
    
    this.stopCleanupTimer()
    this.clear()
    
    console.log('🗑️ [CacheManager] 缓存管理器已销毁')
  }
}

export default CacheManager