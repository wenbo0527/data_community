import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UnifiedCacheManager } from '@/core/UnifiedCacheManager'

describe('UnifiedCacheManager', () => {
  let cacheManager: UnifiedCacheManager

  beforeEach(() => {
    cacheManager = new UnifiedCacheManager()
  })

  afterEach(() => {
    cacheManager.clear()
  })

  describe('基础缓存操作', () => {
    it('应该能够设置和获取缓存值', () => {
      const key = 'test-key'
      const value = { data: 'test-value' }

      cacheManager.set(key, value)
      const result = cacheManager.get(key)

      expect(result).toEqual(value)
    })

    it('应该在键不存在时返回undefined', () => {
      const result = cacheManager.get('non-existent-key')
      expect(result).toBeUndefined()
    })

    it('应该能够检查键是否存在', () => {
      const key = 'test-key'
      
      expect(cacheManager.has(key)).toBe(false)
      
      cacheManager.set(key, 'value')
      expect(cacheManager.has(key)).toBe(true)
    })

    it('应该能够删除缓存项', () => {
      const key = 'test-key'
      
      cacheManager.set(key, 'value')
      expect(cacheManager.has(key)).toBe(true)
      
      const deleted = cacheManager.delete(key)
      expect(deleted).toBe(true)
      expect(cacheManager.has(key)).toBe(false)
    })

    it('删除不存在的键应该返回false', () => {
      const deleted = cacheManager.delete('non-existent-key')
      expect(deleted).toBe(false)
    })
  })

  describe('TTL（生存时间）功能', () => {
    it('应该支持设置TTL', () => {
      const key = 'ttl-key'
      const value = 'ttl-value'
      const ttl = 100 // 100ms

      cacheManager.set(key, value, { ttl })
      expect(cacheManager.get(key)).toBe(value)
    })

    it('应该在TTL过期后自动删除缓存项', async () => {
      const key = 'ttl-key'
      const value = 'ttl-value'
      const ttl = 50 // 50ms

      cacheManager.set(key, value, { ttl })
      expect(cacheManager.get(key)).toBe(value)

      // 等待TTL过期
      await new Promise(resolve => setTimeout(resolve, 60))
      
      expect(cacheManager.get(key)).toBeUndefined()
      expect(cacheManager.has(key)).toBe(false)
    })

    it('应该能够获取剩余TTL时间', () => {
      const key = 'ttl-key'
      const value = 'ttl-value'
      const ttl = 1000 // 1000ms

      cacheManager.set(key, value, { ttl })
      const remainingTtl = cacheManager.getTtl(key)
      
      expect(remainingTtl).toBeGreaterThan(0)
      expect(remainingTtl).toBeLessThanOrEqual(ttl)
    })

    it('不存在的键应该返回-1的TTL', () => {
      const ttl = cacheManager.getTtl('non-existent-key')
      expect(ttl).toBe(-1)
    })

    it('没有TTL的键应该返回-1', () => {
      cacheManager.set('no-ttl-key', 'value')
      const ttl = cacheManager.getTtl('no-ttl-key')
      expect(ttl).toBe(-1)
    })
  })

  describe('命名空间功能', () => {
    it('应该支持命名空间缓存', () => {
      const namespace = 'test-namespace'
      const key = 'test-key'
      const value = 'test-value'

      cacheManager.setNamespaced(namespace, key, value)
      const result = cacheManager.getNamespaced(namespace, key)

      expect(result).toBe(value)
    })

    it('不同命名空间的相同键应该独立存储', () => {
      const key = 'same-key'
      const value1 = 'value1'
      const value2 = 'value2'

      cacheManager.setNamespaced('namespace1', key, value1)
      cacheManager.setNamespaced('namespace2', key, value2)

      expect(cacheManager.getNamespaced('namespace1', key)).toBe(value1)
      expect(cacheManager.getNamespaced('namespace2', key)).toBe(value2)
    })

    it('应该能够清除整个命名空间', () => {
      const namespace = 'test-namespace'
      
      cacheManager.setNamespaced(namespace, 'key1', 'value1')
      cacheManager.setNamespaced(namespace, 'key2', 'value2')
      cacheManager.setNamespaced('other-namespace', 'key1', 'value3')

      cacheManager.clearNamespace(namespace)

      expect(cacheManager.getNamespaced(namespace, 'key1')).toBeUndefined()
      expect(cacheManager.getNamespaced(namespace, 'key2')).toBeUndefined()
      expect(cacheManager.getNamespaced('other-namespace', 'key1')).toBe('value3')
    })

    it('应该能够获取命名空间下的所有键', () => {
      const namespace = 'test-namespace'
      
      cacheManager.setNamespaced(namespace, 'key1', 'value1')
      cacheManager.setNamespaced(namespace, 'key2', 'value2')
      cacheManager.setNamespaced('other-namespace', 'key3', 'value3')

      const keys = cacheManager.getNamespaceKeys(namespace)
      
      expect(keys).toHaveLength(2)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).not.toContain('key3')
    })
  })

  describe('缓存大小限制', () => {
    it('应该支持设置最大缓存大小', () => {
      const limitedCache = new UnifiedCacheManager({ maxSize: 2 })
      
      limitedCache.set('key1', 'value1')
      limitedCache.set('key2', 'value2')
      limitedCache.set('key3', 'value3') // 应该触发LRU淘汰

      expect(limitedCache.has('key1')).toBe(false) // 最旧的被淘汰
      expect(limitedCache.has('key2')).toBe(true)
      expect(limitedCache.has('key3')).toBe(true)
    })

    it('访问缓存项应该更新LRU顺序', () => {
      const limitedCache = new UnifiedCacheManager({ maxSize: 2 })
      
      limitedCache.set('key1', 'value1')
      limitedCache.set('key2', 'value2')
      
      // 访问key1，使其变为最近使用
      limitedCache.get('key1')
      
      limitedCache.set('key3', 'value3') // 应该淘汰key2

      expect(limitedCache.has('key1')).toBe(true)
      expect(limitedCache.has('key2')).toBe(false) // key2被淘汰
      expect(limitedCache.has('key3')).toBe(true)
    })
  })

  describe('缓存统计', () => {
    it('应该提供缓存统计信息', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')
      cacheManager.get('key1') // 命中
      cacheManager.get('key3') // 未命中

      const stats = cacheManager.getStats()

      expect(stats.size).toBe(2)
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })

    it('应该能够重置统计信息', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.get('key1')
      cacheManager.get('key2')

      let stats = cacheManager.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)

      cacheManager.resetStats()
      stats = cacheManager.getStats()
      
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
    })
  })

  describe('批量操作', () => {
    it('应该支持批量设置', () => {
      const entries = {
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
      }

      cacheManager.mset(entries)

      expect(cacheManager.get('key1')).toBe('value1')
      expect(cacheManager.get('key2')).toBe('value2')
      expect(cacheManager.get('key3')).toBe('value3')
    })

    it('应该支持批量获取', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')
      cacheManager.set('key3', 'value3')

      const results = cacheManager.mget(['key1', 'key2', 'key4'])

      expect(results).toEqual({
        'key1': 'value1',
        'key2': 'value2',
        'key4': undefined
      })
    })

    it('应该支持批量删除', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')
      cacheManager.set('key3', 'value3')

      const deletedCount = cacheManager.mdel(['key1', 'key3', 'key4'])

      expect(deletedCount).toBe(2)
      expect(cacheManager.has('key1')).toBe(false)
      expect(cacheManager.has('key2')).toBe(true)
      expect(cacheManager.has('key3')).toBe(false)
    })
  })

  describe('事件通知', () => {
    it('应该在设置缓存时触发事件', () => {
      const onSet = vi.fn()
      cacheManager.on('set', onSet)

      cacheManager.set('key1', 'value1')

      expect(onSet).toHaveBeenCalledWith({
        key: 'key1',
        value: 'value1',
        options: {}
      })
    })

    it('应该在删除缓存时触发事件', () => {
      const onDelete = vi.fn()
      cacheManager.on('delete', onDelete)

      cacheManager.set('key1', 'value1')
      cacheManager.delete('key1')

      expect(onDelete).toHaveBeenCalledWith({
        key: 'key1',
        value: 'value1'
      })
    })

    it('应该在TTL过期时触发事件', async () => {
      const onExpire = vi.fn()
      cacheManager.on('expire', onExpire)

      cacheManager.set('key1', 'value1', { ttl: 50 })
      
      // 等待TTL过期
      await new Promise(resolve => setTimeout(resolve, 60))
      
      // 触发过期检查
      cacheManager.get('key1')

      expect(onExpire).toHaveBeenCalledWith({
        key: 'key1',
        value: 'value1'
      })
    })
  })

  describe('内存管理', () => {
    it('应该能够清除所有缓存', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')

      expect(cacheManager.size()).toBe(2)
      
      cacheManager.clear()
      
      expect(cacheManager.size()).toBe(0)
      expect(cacheManager.has('key1')).toBe(false)
      expect(cacheManager.has('key2')).toBe(false)
    })

    it('应该能够获取缓存大小', () => {
      expect(cacheManager.size()).toBe(0)
      
      cacheManager.set('key1', 'value1')
      expect(cacheManager.size()).toBe(1)
      
      cacheManager.set('key2', 'value2')
      expect(cacheManager.size()).toBe(2)
      
      cacheManager.delete('key1')
      expect(cacheManager.size()).toBe(1)
    })

    it('应该能够获取所有键', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')
      cacheManager.set('key3', 'value3')

      const keys = cacheManager.keys()
      
      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })
  })
})