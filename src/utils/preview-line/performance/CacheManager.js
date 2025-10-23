/**
 * 缓存管理器
 * 用于优化预览线系统中的缓存机制，提供多级缓存、LRU淘汰、过期管理等功能
 */

export class CacheManager {
  constructor(options = {}) {
    this.options = {
      // 缓存配置
      maxSize: 1000,           // 最大缓存条目数
      maxMemorySize: 50 * 1024 * 1024, // 最大内存使用（50MB）
      defaultTTL: 5 * 60 * 1000,       // 默认过期时间（5分钟）
      
      // 清理配置
      cleanupInterval: 60 * 1000,      // 清理间隔（1分钟）
      cleanupThreshold: 0.8,           // 清理阈值（80%）
      
      // 性能配置
      enableDebug: false,
      enableStats: true,
      enableCompression: false,        // 启用压缩（大数据时）
      
      // 分层配置
      enableTieredCache: true,         // 启用分层缓存
      l1MaxSize: 100,                  // L1缓存大小（热数据）
      l2MaxSize: 500,                  // L2缓存大小（温数据）
      
      ...options
    };
    
    // 主缓存存储
    this.cache = new Map();
    
    // 分层缓存
    if (this.options.enableTieredCache) {
      this.l1Cache = new Map(); // 热数据缓存
      this.l2Cache = new Map(); // 温数据缓存
    }
    
    // LRU访问顺序跟踪
    this.accessOrder = new Map(); // key -> timestamp
    
    // 过期时间跟踪
    this.expirationTimes = new Map(); // key -> expireTime
    
    // 内存使用跟踪
    this.memorySizes = new Map(); // key -> size
    this.totalMemorySize = 0;
    
    // 性能统计
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      expirations: 0,
      cleanups: 0,
      l1Hits: 0,
      l2Hits: 0,
      l3Hits: 0,
      memoryUsage: 0,
      averageAccessTime: 0
    };
    
    // 清理定时器
    this.cleanupTimer = null;
    this.startCleanupTimer();
    
    console.log('🗄️ [CacheManager] 初始化完成', {
      maxSize: this.options.maxSize,
      maxMemorySize: this.options.maxMemorySize,
      enableTieredCache: this.options.enableTieredCache
    });
  }
  
  /**
   * 设置缓存项
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {Object} options - 选项
   */
  set(key, value, options = {}) {
    const {
      ttl = this.options.defaultTTL,
      priority = 'normal',
      compress = false,
      metadata = {}
    } = options;
    
    try {
      // 计算数据大小
      const size = this.calculateSize(value);
      
      // 检查内存限制
      if (size > this.options.maxMemorySize) {
        console.warn(`⚠️ [CacheManager] 数据过大，跳过缓存: ${key}`);
        return false;
      }
      
      // 压缩数据（如果启用）
      let processedValue = value;
      if (compress && this.options.enableCompression) {
        processedValue = this.compressValue(value);
      }
      
      // 创建缓存项
      const cacheItem = {
        value: processedValue,
        timestamp: Date.now(),
        ttl,
        priority,
        compressed: compress,
        metadata,
        accessCount: 0,
        size
      };
      
      // 计算过期时间
      const expireTime = ttl > 0 ? Date.now() + ttl : null;
      
      // 检查是否需要清理空间
      if (this.needsCleanup(size)) {
        this.performCleanup();
      }
      
      // 存储到主缓存
      this.cache.set(key, cacheItem);
      this.accessOrder.set(key, Date.now());
      
      if (expireTime) {
        this.expirationTimes.set(key, expireTime);
      }
      
      this.memorySizes.set(key, size);
      this.totalMemorySize += size;
      
      // 分层缓存处理
      if (this.options.enableTieredCache) {
        this.updateTieredCache(key, cacheItem, priority);
      }
      
      this.stats.sets++;
      this.stats.memoryUsage = this.totalMemorySize;
      
      if (this.options.enableDebug) {
        console.log(`💾 [CacheManager] 设置缓存: ${key}`, {
          size,
          ttl,
          priority,
          totalSize: this.totalMemorySize
        });
      }
      
      return true;
    } catch (error) {
      console.error(`❌ [CacheManager] 设置缓存失败: ${key}`, error);
      return false;
    }
  }
  
  /**
   * 获取缓存项
   * @param {string} key - 缓存键
   * @param {Object} options - 选项
   * @returns {*} 缓存值
   */
  get(key, options = {}) {
    const {
      updateAccess = true,
      decompress = true
    } = options;
    
    const startTime = performance.now();
    
    try {
      // 检查分层缓存
      if (this.options.enableTieredCache) {
        const tieredResult = this.getFromTieredCache(key);
        if (tieredResult.found) {
          this.updateStats('hit', tieredResult.tier, performance.now() - startTime);
          return tieredResult.value;
        }
      }
      
      // 检查主缓存
      const cacheItem = this.cache.get(key);
      if (!cacheItem) {
        this.updateStats('miss', null, performance.now() - startTime);
        return undefined;
      }
      
      // 检查是否过期
      if (this.isExpired(key)) {
        this.delete(key);
        this.stats.expirations++;
        this.updateStats('miss', null, performance.now() - startTime);
        return undefined;
      }
      
      // 更新访问信息
      if (updateAccess) {
        cacheItem.accessCount++;
        this.accessOrder.set(key, Date.now());
        
        // 更新分层缓存
        if (this.options.enableTieredCache) {
          this.promoteToHigherTier(key, cacheItem);
        }
      }
      
      // 解压缩数据
      let value = cacheItem.value;
      if (cacheItem.compressed && decompress && this.options.enableCompression) {
        value = this.decompressValue(value);
      }
      
      this.updateStats('hit', 'l3', performance.now() - startTime);
      return value;
      
    } catch (error) {
      console.error(`❌ [CacheManager] 获取缓存失败: ${key}`, error);
      this.updateStats('miss', null, performance.now() - startTime);
      return undefined;
    }
  }
  
  /**
   * 从分层缓存获取数据
   * @param {string} key - 缓存键
   * @returns {Object} 结果对象
   */
  getFromTieredCache(key) {
    // 检查L1缓存（热数据）
    if (this.l1Cache.has(key)) {
      const cacheItem = this.l1Cache.get(key);
      if (!this.isExpired(key)) {
        return { found: true, value: cacheItem.value, tier: 'l1' };
      } else {
        this.l1Cache.delete(key);
      }
    }
    
    // 检查L2缓存（温数据）
    if (this.l2Cache.has(key)) {
      const cacheItem = this.l2Cache.get(key);
      if (!this.isExpired(key)) {
        // 提升到L1缓存
        this.promoteToL1(key, cacheItem);
        return { found: true, value: cacheItem.value, tier: 'l2' };
      } else {
        this.l2Cache.delete(key);
      }
    }
    
    return { found: false };
  }
  
  /**
   * 提升到更高层缓存
   * @param {string} key - 缓存键
   * @param {Object} cacheItem - 缓存项
   */
  promoteToHigherTier(key, cacheItem) {
    if (!this.options.enableTieredCache) return;
    
    // 根据访问频率决定提升策略
    const accessFrequency = cacheItem.accessCount;
    const timeSinceCreation = Date.now() - cacheItem.timestamp;
    
    // 提升到L1缓存的条件
    if (accessFrequency >= 3 || (accessFrequency >= 2 && timeSinceCreation < 60000)) {
      this.promoteToL1(key, cacheItem);
    }
    // 提升到L2缓存的条件
    else if (accessFrequency >= 2 && !this.l2Cache.has(key)) {
      this.promoteToL2(key, cacheItem);
    }
  }
  
  /**
   * 提升到L1缓存
   * @param {string} key - 缓存键
   * @param {Object} cacheItem - 缓存项
   */
  promoteToL1(key, cacheItem) {
    // 检查L1缓存空间
    if (this.l1Cache.size >= this.options.l1MaxSize) {
      this.evictFromL1();
    }
    
    this.l1Cache.set(key, cacheItem);
    this.l2Cache.delete(key); // 从L2移除
    
    if (this.options.enableDebug) {
      console.log(`⬆️ [CacheManager] 提升到L1缓存: ${key}`);
    }
  }
  
  /**
   * 提升到L2缓存
   * @param {string} key - 缓存键
   * @param {Object} cacheItem - 缓存项
   */
  promoteToL2(key, cacheItem) {
    // 检查L2缓存空间
    if (this.l2Cache.size >= this.options.l2MaxSize) {
      this.evictFromL2();
    }
    
    this.l2Cache.set(key, cacheItem);
    
    if (this.options.enableDebug) {
      console.log(`⬆️ [CacheManager] 提升到L2缓存: ${key}`);
    }
  }
  
  /**
   * 从L1缓存淘汰
   */
  evictFromL1() {
    const oldestKey = this.findOldestKey(this.l1Cache);
    if (oldestKey) {
      this.l1Cache.delete(oldestKey);
      // 降级到L2缓存
      const cacheItem = this.cache.get(oldestKey);
      if (cacheItem && this.l2Cache.size < this.options.l2MaxSize) {
        this.l2Cache.set(oldestKey, cacheItem);
      }
    }
  }
  
  /**
   * 从L2缓存淘汰
   */
  evictFromL2() {
    const oldestKey = this.findOldestKey(this.l2Cache);
    if (oldestKey) {
      this.l2Cache.delete(oldestKey);
    }
  }
  
  /**
   * 查找最旧的键
   * @param {Map} cache - 缓存映射
   * @returns {string} 最旧的键
   */
  findOldestKey(cache) {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const key of cache.keys()) {
      const accessTime = this.accessOrder.get(key) || 0;
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }
  
  /**
   * 删除缓存项
   * @param {string} key - 缓存键
   * @returns {boolean} 是否删除成功
   */
  delete(key) {
    try {
      const cacheItem = this.cache.get(key);
      if (!cacheItem) {
        return false;
      }
      
      // 从主缓存删除
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.expirationTimes.delete(key);
      
      // 更新内存使用
      const size = this.memorySizes.get(key) || 0;
      this.memorySizes.delete(key);
      this.totalMemorySize -= size;
      
      // 从分层缓存删除
      if (this.options.enableTieredCache) {
        this.l1Cache.delete(key);
        this.l2Cache.delete(key);
      }
      
      this.stats.deletes++;
      this.stats.memoryUsage = this.totalMemorySize;
      
      if (this.options.enableDebug) {
        console.log(`🗑️ [CacheManager] 删除缓存: ${key}`, {
          size,
          totalSize: this.totalMemorySize
        });
      }
      
      return true;
    } catch (error) {
      console.error(`❌ [CacheManager] 删除缓存失败: ${key}`, error);
      return false;
    }
  }
  
  /**
   * 检查缓存项是否存在
   * @param {string} key - 缓存键
   * @returns {boolean} 是否存在
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }
    
    // 检查是否过期
    if (this.isExpired(key)) {
      this.delete(key);
      this.stats.expirations++;
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查缓存项是否过期
   * @param {string} key - 缓存键
   * @returns {boolean} 是否过期
   */
  isExpired(key) {
    const expireTime = this.expirationTimes.get(key);
    return expireTime && Date.now() > expireTime;
  }
  
  /**
   * 检查是否需要清理
   * @param {number} newItemSize - 新项目大小
   * @returns {boolean} 是否需要清理
   */
  needsCleanup(newItemSize = 0) {
    const sizeThreshold = this.cache.size >= this.options.maxSize * this.options.cleanupThreshold;
    const memoryThreshold = (this.totalMemorySize + newItemSize) >= this.options.maxMemorySize * this.options.cleanupThreshold;
    
    return sizeThreshold || memoryThreshold;
  }
  
  /**
   * 执行清理
   */
  performCleanup() {
    const startTime = performance.now();
    let cleanedCount = 0;
    
    try {
      // 1. 清理过期项
      const expiredKeys = [];
      for (const [key, expireTime] of this.expirationTimes) {
        if (Date.now() > expireTime) {
          expiredKeys.push(key);
        }
      }
      
      expiredKeys.forEach(key => {
        this.delete(key);
        cleanedCount++;
      });
      
      // 2. LRU淘汰
      if (this.cache.size > this.options.maxSize * 0.7) {
        const keysToEvict = this.selectKeysForEviction();
        keysToEvict.forEach(key => {
          this.delete(key);
          cleanedCount++;
        });
        this.stats.evictions += keysToEvict.length;
      }
      
      // 3. 内存压力清理
      if (this.totalMemorySize > this.options.maxMemorySize * 0.7) {
        this.performMemoryCleanup();
      }
      
      this.stats.cleanups++;
      
      if (this.options.enableDebug) {
        console.log(`🧹 [CacheManager] 清理完成`, {
          cleanedCount,
          duration: performance.now() - startTime,
          remainingSize: this.cache.size,
          memoryUsage: this.totalMemorySize
        });
      }
      
    } catch (error) {
      console.error('❌ [CacheManager] 清理失败', error);
    }
  }
  
  /**
   * 选择要淘汰的键
   * @returns {Array} 要淘汰的键列表
   */
  selectKeysForEviction() {
    const targetCount = Math.floor(this.options.maxSize * 0.2); // 淘汰20%
    const candidates = [];
    
    // 收集候选项（按访问时间和优先级排序）
    for (const [key, cacheItem] of this.cache) {
      const accessTime = this.accessOrder.get(key) || 0;
      const priority = cacheItem.priority || 'normal';
      const score = this.calculateEvictionScore(accessTime, priority, cacheItem);
      
      candidates.push({ key, score });
    }
    
    // 按分数排序（分数越低越容易被淘汰）
    candidates.sort((a, b) => a.score - b.score);
    
    return candidates.slice(0, targetCount).map(item => item.key);
  }
  
  /**
   * 计算淘汰分数
   * @param {number} accessTime - 访问时间
   * @param {string} priority - 优先级
   * @param {Object} cacheItem - 缓存项
   * @returns {number} 淘汰分数
   */
  calculateEvictionScore(accessTime, priority, cacheItem) {
    const now = Date.now();
    const timeSinceAccess = now - accessTime;
    const timeSinceCreation = now - cacheItem.timestamp;
    
    // 基础分数（时间越久分数越低）
    let score = timeSinceAccess;
    
    // 优先级调整
    const priorityMultiplier = {
      'high': 3,
      'normal': 1,
      'low': 0.5
    };
    score *= (priorityMultiplier[priority] || 1);
    
    // 访问频率调整
    score *= Math.max(0.1, 1 / (cacheItem.accessCount + 1));
    
    // 大小调整（大项目更容易被淘汰）
    score *= Math.log(cacheItem.size + 1);
    
    return score;
  }
  
  /**
   * 执行内存清理
   */
  performMemoryCleanup() {
    // 找出占用内存最大的项目
    const memoryItems = [];
    for (const [key, size] of this.memorySizes) {
      const cacheItem = this.cache.get(key);
      if (cacheItem) {
        memoryItems.push({ key, size, priority: cacheItem.priority });
      }
    }
    
    // 按大小排序，优先清理大项目
    memoryItems.sort((a, b) => {
      if (a.priority === 'low' && b.priority !== 'low') return -1;
      if (b.priority === 'low' && a.priority !== 'low') return 1;
      return b.size - a.size;
    });
    
    // 清理直到内存使用降到安全水平
    const targetMemory = this.options.maxMemorySize * 0.6;
    for (const item of memoryItems) {
      if (this.totalMemorySize <= targetMemory) break;
      this.delete(item.key);
    }
  }
  
  /**
   * 计算数据大小
   * @param {*} value - 数据值
   * @returns {number} 大小（字节）
   */
  calculateSize(value) {
    try {
      if (value === null || value === undefined) return 0;
      
      const type = typeof value;
      
      switch (type) {
        case 'string':
          return value.length * 2; // UTF-16
        case 'number':
          return 8;
        case 'boolean':
          return 4;
        case 'object':
          return JSON.stringify(value).length * 2;
        default:
          return 100; // 默认估算
      }
    } catch (error) {
      return 100; // 出错时的默认值
    }
  }
  
  /**
   * 压缩值
   * @param {*} value - 原始值
   * @returns {*} 压缩后的值
   */
  compressValue(value) {
    // 简单的压缩实现（实际项目中可以使用更好的压缩算法）
    if (typeof value === 'string' && value.length > 1000) {
      // 对长字符串进行简单压缩
      return {
        __compressed: true,
        data: value // 这里可以实现真正的压缩算法
      };
    }
    return value;
  }
  
  /**
   * 解压缩值
   * @param {*} value - 压缩的值
   * @returns {*} 解压缩后的值
   */
  decompressValue(value) {
    if (value && value.__compressed) {
      return value.data;
    }
    return value;
  }
  
  /**
   * 更新统计信息
   * @param {string} type - 操作类型
   * @param {string} tier - 缓存层级
   * @param {number} accessTime - 访问时间
   */
  updateStats(type, tier, accessTime) {
    if (type === 'hit') {
      this.stats.hits++;
      if (tier === 'l1') this.stats.l1Hits++;
      else if (tier === 'l2') this.stats.l2Hits++;
      else if (tier === 'l3') this.stats.l3Hits++;
    } else if (type === 'miss') {
      this.stats.misses++;
    }
    
    // 更新平均访问时间
    const totalAccess = this.stats.hits + this.stats.misses;
    this.stats.averageAccessTime = 
      (this.stats.averageAccessTime * (totalAccess - 1) + accessTime) / totalAccess;
  }
  
  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      if (this.needsCleanup()) {
        this.performCleanup();
      }
    }, this.options.cleanupInterval);
  }
  
  /**
   * 停止清理定时器
   */
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  
  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    this.accessOrder.clear();
    this.expirationTimes.clear();
    this.memorySizes.clear();
    this.totalMemorySize = 0;
    
    if (this.options.enableTieredCache) {
      this.l1Cache.clear();
      this.l2Cache.clear();
    }
    
    this.stats.memoryUsage = 0;
    
    if (this.options.enableDebug) {
      console.log('🗑️ [CacheManager] 清空所有缓存');
    }
  }
  
  /**
   * 获取缓存大小
   * @returns {number} 缓存大小
   */
  size() {
    return this.cache.size;
  }
  
  /**
   * 获取所有键
   * @returns {Array} 键列表
   */
  keys() {
    return Array.from(this.cache.keys());
  }
  
  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 ? 
      this.stats.hits / (this.stats.hits + this.stats.misses) : 0;
    
    return {
      ...this.stats,
      hitRate,
      size: this.cache.size,
      maxSize: this.options.maxSize,
      memoryUsage: this.totalMemorySize,
      maxMemorySize: this.options.maxMemorySize,
      memoryUtilization: this.totalMemorySize / this.options.maxMemorySize,
      l1Size: this.options.enableTieredCache ? this.l1Cache.size : 0,
      l2Size: this.options.enableTieredCache ? this.l2Cache.size : 0,
      l3Size: this.cache.size - (this.options.enableTieredCache ? 
        (this.l1Cache.size + this.l2Cache.size) : 0)
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      expirations: 0,
      cleanups: 0,
      l1Hits: 0,
      l2Hits: 0,
      l3Hits: 0,
      memoryUsage: this.totalMemorySize,
      averageAccessTime: 0
    };
  }
  
  /**
   * 销毁缓存管理器
   */
  destroy() {
    this.stopCleanupTimer();
    this.clear();
    
    console.log('🗑️ [CacheManager] 已销毁');
  }
}

export default CacheManager;