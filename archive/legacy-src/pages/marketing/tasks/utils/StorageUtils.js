/**
 * 存储工具类
 * 提供统一的数据存储和缓存功能
 * 支持localStorage、sessionStorage和内存缓存
 */

/**
 * 存储类型枚举
 */
export const StorageType = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage',
  MEMORY: 'memory'
}

/**
 * 缓存项类
 */
export class CacheItem {
  constructor(value, expireTime = null) {
    this.value = value
    this.expireTime = expireTime
    this.createTime = Date.now()
  }

  /**
   * 检查是否过期
   * @returns {boolean} 是否过期
   */
  isExpired() {
    if (!this.expireTime) return false
    return Date.now() > this.expireTime
  }

  /**
   * 获取剩余有效时间（毫秒）
   * @returns {number} 剩余时间，-1表示永不过期
   */
  getRemainingTime() {
    if (!this.expireTime) return -1
    const remaining = this.expireTime - Date.now()
    return Math.max(0, remaining)
  }
}

/**
 * 存储工具类
 */
export class StorageUtils {
  // 内存缓存
  static memoryCache = new Map()
  
  // 默认过期时间（24小时）
  static DEFAULT_EXPIRE_TIME = 24 * 60 * 60 * 1000

  /**
   * 设置存储项
   * @param {string} key - 键名
   * @param {any} value - 值
   * @param {Object} options - 选项
   * @returns {boolean} 是否成功
   */
  static setItem(key, value, options = {}) {
    const {
      type = StorageType.LOCAL,
      expireTime = null,
      serialize = true
    } = options

    try {
      const cacheItem = new CacheItem(value, expireTime)
      
      switch (type) {
        case StorageType.LOCAL:
          return this.setLocalStorageItem(key, cacheItem, serialize)
        case StorageType.SESSION:
          return this.setSessionStorageItem(key, cacheItem, serialize)
        case StorageType.MEMORY:
          return this.setMemoryItem(key, cacheItem)
        default:
          console.error(`不支持的存储类型: ${type}`)
          return false
      }
    } catch (error) {
      console.error('设置存储项失败:', error)
      return false
    }
  }

  /**
   * 获取存储项
   * @param {string} key - 键名
   * @param {Object} options - 选项
   * @returns {any} 值
   */
  static getItem(key, options = {}) {
    const {
      type = StorageType.LOCAL,
      defaultValue = null,
      deserialize = true
    } = options

    try {
      let cacheItem = null

      switch (type) {
        case StorageType.LOCAL:
          cacheItem = this.getLocalStorageItem(key, deserialize)
          break
        case StorageType.SESSION:
          cacheItem = this.getSessionStorageItem(key, deserialize)
          break
        case StorageType.MEMORY:
          cacheItem = this.getMemoryItem(key)
          break
        default:
          console.error(`不支持的存储类型: ${type}`)
          return defaultValue
      }

      if (!cacheItem) return defaultValue

      // 检查是否过期
      if (cacheItem.isExpired()) {
        this.removeItem(key, { type })
        return defaultValue
      }

      return cacheItem.value
    } catch (error) {
      console.error('获取存储项失败:', error)
      return defaultValue
    }
  }

  /**
   * 移除存储项
   * @param {string} key - 键名
   * @param {Object} options - 选项
   * @returns {boolean} 是否成功
   */
  static removeItem(key, options = {}) {
    const { type = StorageType.LOCAL } = options

    try {
      switch (type) {
        case StorageType.LOCAL:
          localStorage.removeItem(key)
          return true
        case StorageType.SESSION:
          sessionStorage.removeItem(key)
          return true
        case StorageType.MEMORY:
          this.memoryCache.delete(key)
          return true
        default:
          console.error(`不支持的存储类型: ${type}`)
          return false
      }
    } catch (error) {
      console.error('移除存储项失败:', error)
      return false
    }
  }

  /**
   * 清空存储
   * @param {Object} options - 选项
   * @returns {boolean} 是否成功
   */
  static clear(options = {}) {
    const { type = StorageType.LOCAL } = options

    try {
      switch (type) {
        case StorageType.LOCAL:
          localStorage.clear()
          return true
        case StorageType.SESSION:
          sessionStorage.clear()
          return true
        case StorageType.MEMORY:
          this.memoryCache.clear()
          return true
        default:
          console.error(`不支持的存储类型: ${type}`)
          return false
      }
    } catch (error) {
      console.error('清空存储失败:', error)
      return false
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 键名
   * @param {Object} options - 选项
   * @returns {boolean} 是否存在
   */
  static hasItem(key, options = {}) {
    const { type = StorageType.LOCAL } = options

    try {
      switch (type) {
        case StorageType.LOCAL:
          return localStorage.getItem(key) !== null
        case StorageType.SESSION:
          return sessionStorage.getItem(key) !== null
        case StorageType.MEMORY:
          return this.memoryCache.has(key)
        default:
          return false
      }
    } catch (error) {
      console.error('检查存储项失败:', error)
      return false
    }
  }

  /**
   * 获取所有键名
   * @param {Object} options - 选项
   * @returns {Array<string>} 键名数组
   */
  static getKeys(options = {}) {
    const { type = StorageType.LOCAL } = options

    try {
      switch (type) {
        case StorageType.LOCAL:
          return Object.keys(localStorage)
        case StorageType.SESSION:
          return Object.keys(sessionStorage)
        case StorageType.MEMORY:
          return Array.from(this.memoryCache.keys())
        default:
          return []
      }
    } catch (error) {
      console.error('获取键名失败:', error)
      return []
    }
  }

  /**
   * 获取存储大小（字节）
   * @param {Object} options - 选项
   * @returns {number} 存储大小
   */
  static getSize(options = {}) {
    const { type = StorageType.LOCAL } = options

    try {
      let size = 0

      switch (type) {
        case StorageType.LOCAL:
          for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
              size += localStorage[key].length + key.length
            }
          }
          break
        case StorageType.SESSION:
          for (const key in sessionStorage) {
            if (sessionStorage.hasOwnProperty(key)) {
              size += sessionStorage[key].length + key.length
            }
          }
          break
        case StorageType.MEMORY:
          for (const [key, value] of this.memoryCache) {
            size += JSON.stringify(value).length + key.length
          }
          break
      }

      return size
    } catch (error) {
      console.error('获取存储大小失败:', error)
      return 0
    }
  }

  /**
   * 设置localStorage项
   * @param {string} key - 键名
   * @param {CacheItem} cacheItem - 缓存项
   * @param {boolean} serialize - 是否序列化
   * @returns {boolean} 是否成功
   */
  static setLocalStorageItem(key, cacheItem, serialize) {
    try {
      const data = serialize ? JSON.stringify(cacheItem) : cacheItem
      localStorage.setItem(key, data)
      return true
    } catch (error) {
      console.error('设置localStorage失败:', error)
      return false
    }
  }

  /**
   * 获取localStorage项
   * @param {string} key - 键名
   * @param {boolean} deserialize - 是否反序列化
   * @returns {CacheItem|null} 缓存项
   */
  static getLocalStorageItem(key, deserialize) {
    try {
      const data = localStorage.getItem(key)
      if (!data) return null

      if (deserialize) {
        const parsed = JSON.parse(data)
        return new CacheItem(parsed.value, parsed.expireTime)
      }

      return data
    } catch (error) {
      console.error('获取localStorage失败:', error)
      return null
    }
  }

  /**
   * 设置sessionStorage项
   * @param {string} key - 键名
   * @param {CacheItem} cacheItem - 缓存项
   * @param {boolean} serialize - 是否序列化
   * @returns {boolean} 是否成功
   */
  static setSessionStorageItem(key, cacheItem, serialize) {
    try {
      const data = serialize ? JSON.stringify(cacheItem) : cacheItem
      sessionStorage.setItem(key, data)
      return true
    } catch (error) {
      console.error('设置sessionStorage失败:', error)
      return false
    }
  }

  /**
   * 获取sessionStorage项
   * @param {string} key - 键名
   * @param {boolean} deserialize - 是否反序列化
   * @returns {CacheItem|null} 缓存项
   */
  static getSessionStorageItem(key, deserialize) {
    try {
      const data = sessionStorage.getItem(key)
      if (!data) return null

      if (deserialize) {
        const parsed = JSON.parse(data)
        return new CacheItem(parsed.value, parsed.expireTime)
      }

      return data
    } catch (error) {
      console.error('获取sessionStorage失败:', error)
      return null
    }
  }

  /**
   * 设置内存缓存项
   * @param {string} key - 键名
   * @param {CacheItem} cacheItem - 缓存项
   * @returns {boolean} 是否成功
   */
  static setMemoryItem(key, cacheItem) {
    try {
      this.memoryCache.set(key, cacheItem)
      return true
    } catch (error) {
      console.error('设置内存缓存失败:', error)
      return false
    }
  }

  /**
   * 获取内存缓存项
   * @param {string} key - 键名
   * @returns {CacheItem|null} 缓存项
   */
  static getMemoryItem(key) {
    try {
      return this.memoryCache.get(key) || null
    } catch (error) {
      console.error('获取内存缓存失败:', error)
      return null
    }
  }

  /**
   * 清理过期缓存
   * @param {Object} options - 选项
   * @returns {number} 清理的项目数量
   */
  static cleanExpiredItems(options = {}) {
    const { type = StorageType.LOCAL } = options
    let cleanedCount = 0

    try {
      const keys = this.getKeys({ type })

      keys.forEach(key => {
        const item = this.getItem(key, { type, defaultValue: null })
        if (item === null) {
          cleanedCount++
        }
      })

      return cleanedCount
    } catch (error) {
      console.error('清理过期缓存失败:', error)
      return 0
    }
  }

  /**
   * 批量设置
   * @param {Object} items - 键值对对象
   * @param {Object} options - 选项
   * @returns {boolean} 是否全部成功
   */
  static setItems(items, options = {}) {
    if (!items || typeof items !== 'object') return false

    let allSuccess = true

    Object.entries(items).forEach(([key, value]) => {
      const success = this.setItem(key, value, options)
      if (!success) allSuccess = false
    })

    return allSuccess
  }

  /**
   * 批量获取
   * @param {Array<string>} keys - 键名数组
   * @param {Object} options - 选项
   * @returns {Object} 键值对对象
   */
  static getItems(keys, options = {}) {
    if (!Array.isArray(keys)) return {}

    const result = {}

    keys.forEach(key => {
      result[key] = this.getItem(key, options)
    })

    return result
  }

  /**
   * 批量移除
   * @param {Array<string>} keys - 键名数组
   * @param {Object} options - 选项
   * @returns {boolean} 是否全部成功
   */
  static removeItems(keys, options = {}) {
    if (!Array.isArray(keys)) return false

    let allSuccess = true

    keys.forEach(key => {
      const success = this.removeItem(key, options)
      if (!success) allSuccess = false
    })

    return allSuccess
  }

  /**
   * 设置带过期时间的缓存
   * @param {string} key - 键名
   * @param {any} value - 值
   * @param {number} ttl - 生存时间（毫秒）
   * @param {Object} options - 选项
   * @returns {boolean} 是否成功
   */
  static setWithTTL(key, value, ttl, options = {}) {
    const expireTime = Date.now() + ttl
    return this.setItem(key, value, { ...options, expireTime })
  }

  /**
   * 获取缓存信息
   * @param {string} key - 键名
   * @param {Object} options - 选项
   * @returns {Object|null} 缓存信息
   */
  static getCacheInfo(key, options = {}) {
    const { type = StorageType.LOCAL } = options

    try {
      let cacheItem = null

      switch (type) {
        case StorageType.LOCAL:
          cacheItem = this.getLocalStorageItem(key, true)
          break
        case StorageType.SESSION:
          cacheItem = this.getSessionStorageItem(key, true)
          break
        case StorageType.MEMORY:
          cacheItem = this.getMemoryItem(key)
          break
        default:
          return null
      }

      if (!cacheItem) return null

      return {
        key,
        value: cacheItem.value,
        createTime: cacheItem.createTime,
        expireTime: cacheItem.expireTime,
        remainingTime: cacheItem.getRemainingTime(),
        isExpired: cacheItem.isExpired()
      }
    } catch (error) {
      console.error('获取缓存信息失败:', error)
      return null
    }
  }
}

/**
 * 创建存储实例
 * @param {string} type - 存储类型
 * @returns {Object} 存储实例
 */
export function createStorage(type = StorageType.LOCAL) {
  return {
    set: (key, value, options = {}) => StorageUtils.setItem(key, value, { ...options, type }),
    get: (key, options = {}) => StorageUtils.getItem(key, { ...options, type }),
    remove: (key) => StorageUtils.removeItem(key, { type }),
    clear: () => StorageUtils.clear({ type }),
    has: (key) => StorageUtils.hasItem(key, { type }),
    keys: () => StorageUtils.getKeys({ type }),
    size: () => StorageUtils.getSize({ type })
  }
}

// 预定义的存储实例
export const localStorage = createStorage(StorageType.LOCAL)
export const sessionStorage = createStorage(StorageType.SESSION)
export const memoryStorage = createStorage(StorageType.MEMORY)