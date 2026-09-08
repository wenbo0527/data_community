import { EventEmitter } from 'events'

// 缓存项接口
interface CacheItem<T = any> {
  value: T
  expireAt?: number
  accessTime: number
}

// 缓存选项接口
export interface CacheOptions {
  ttl?: number // 生存时间（毫秒）
}

// 缓存管理器配置接口
export interface CacheManagerConfig {
  maxSize?: number // 最大缓存大小
  defaultTtl?: number // 默认TTL
  cleanupInterval?: number // 清理间隔（毫秒）
}

// 缓存统计接口
export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
}

// 缓存事件接口
export interface CacheEvent {
  set: { key: string; value: any; options: CacheOptions }
  delete: { key: string; value: any }
  expire: { key: string; value: any }
  clear: {}
}

/**
 * 统一缓存管理器
 * 提供类型安全的缓存操作，支持TTL、命名空间、LRU淘汰等功能
 */
export class UnifiedCacheManager extends EventEmitter {
  private cache = new Map<string, CacheItem>()
  private accessOrder: string[] = [] // LRU访问顺序
  private stats = {
    hits: 0,
    misses: 0
  }
  private cleanupTimer?: NodeJS.Timeout
  private readonly config: Required<CacheManagerConfig>

  constructor(config: CacheManagerConfig = {}) {
    super()
    this.config = {
      maxSize: config.maxSize ?? Infinity,
      defaultTtl: config.defaultTtl ?? 0,
      cleanupInterval: config.cleanupInterval ?? 60000 // 1分钟
    }

    // 启动定期清理
    if (this.config.cleanupInterval > 0) {
      this.startCleanup()
    }
  }

  /**
   * 设置缓存项
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl ?? this.config.defaultTtl
    const expireAt = ttl > 0 ? Date.now() + ttl : undefined
    const accessTime = Date.now()

    const item: CacheItem<T> = {
      value,
      expireAt,
      accessTime
    }

    // 如果键已存在，先从访问顺序中移除
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key)
    }

    this.cache.set(key, item)
    this.accessOrder.push(key)

    // 检查大小限制
    this.enforceMaxSize()

    // 触发事件
    this.emit('set', { key, value, options })
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.deleteInternal(key, item)
      this.stats.misses++
      return undefined
    }

    // 更新访问时间和顺序
    item.accessTime = Date.now()
    this.updateAccessOrder(key)
    this.stats.hits++

    return item.value as T
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.deleteInternal(key, item)
      return false
    }

    return true
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    this.deleteInternal(key, item)
    return true
  }

  /**
   * 获取剩余TTL时间
   */
  getTtl(key: string): number {
    const item = this.cache.get(key)
    
    if (!item) {
      return -1
    }

    if (!item.expireAt) {
      return -1 // 没有TTL
    }

    const remaining = item.expireAt - Date.now()
    return remaining > 0 ? remaining : 0
  }

  /**
   * 设置命名空间缓存
   */
  setNamespaced<T>(namespace: string, key: string, value: T, options: CacheOptions = {}): void {
    const namespacedKey = this.getNamespacedKey(namespace, key)
    this.set(namespacedKey, value, options)
  }

  /**
   * 获取命名空间缓存
   */
  getNamespaced<T>(namespace: string, key: string): T | undefined {
    const namespacedKey = this.getNamespacedKey(namespace, key)
    return this.get<T>(namespacedKey)
  }

  /**
   * 清除命名空间
   */
  clearNamespace(namespace: string): void {
    const prefix = `${namespace}:`
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.delete(key))
  }

  /**
   * 获取命名空间下的所有键
   */
  getNamespaceKeys(namespace: string): string[] {
    const prefix = `${namespace}:`
    const keys: string[] = []

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keys.push(key.substring(prefix.length))
      }
    }

    return keys
  }

  /**
   * 批量设置
   */
  mset(entries: Record<string, any>, options: CacheOptions = {}): void {
    Object.entries(entries).forEach(([key, value]) => {
      this.set(key, value, options)
    })
  }

  /**
   * 批量获取
   */
  mget<T>(keys: string[]): Record<string, T | undefined> {
    const result: Record<string, T | undefined> = {}
    
    keys.forEach(key => {
      result[key] = this.get<T>(key)
    })

    return result
  }

  /**
   * 批量删除
   */
  mdel(keys: string[]): number {
    let deletedCount = 0
    
    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++
      }
    })

    return deletedCount
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats.hits = 0
    this.stats.misses = 0
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.emit('clear', {})
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.clear()
    this.stopCleanup()
    this.removeAllListeners()
  }

  // 私有方法

  private getNamespacedKey(namespace: string, key: string): string {
    return `${namespace}:${key}`
  }

  private isExpired(item: CacheItem): boolean {
    return item.expireAt !== undefined && Date.now() > item.expireAt
  }

  private deleteInternal(key: string, item: CacheItem): void {
    this.cache.delete(key)
    this.removeFromAccessOrder(key)
    
    // 触发删除或过期事件
    if (this.isExpired(item)) {
      this.emit('expire', { key, value: item.value })
    } else {
      this.emit('delete', { key, value: item.value })
    }
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key)
    this.accessOrder.push(key)
  }

  private enforceMaxSize(): void {
    while (this.cache.size > this.config.maxSize) {
      // 删除最旧的项（LRU）
      const oldestKey = this.accessOrder[0]
      if (oldestKey) {
        const item = this.cache.get(oldestKey)
        if (item) {
          this.deleteInternal(oldestKey, item)
        }
      }
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (item.expireAt && now > item.expireAt) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => {
      const item = this.cache.get(key)
      if (item) {
        this.deleteInternal(key, item)
      }
    })
  }
}

// 导出全局实例
export const globalCacheManager = new UnifiedCacheManager()