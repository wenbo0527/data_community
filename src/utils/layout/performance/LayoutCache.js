/**
 * 布局缓存类
 * 提供布局结果的缓存和管理功能
 */

/**
 * 布局缓存类
 */
class LayoutCache {
  constructor(options = {}) {
    this.options = {
      maxSize: 100,
      ttl: 5 * 60 * 1000, // 5分钟
      enableMetrics: true,
      autoCleanup: true,
      cleanupInterval: 60 * 1000, // 1分钟
      ...options
    };
    
    // 缓存存储
    this.cache = new Map();
    this.accessTimes = new Map();
    this.hitCounts = new Map();
    
    // 统计信息
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0,
      totalSize: 0
    };
    
    // 自动清理定时器
    if (this.options.autoCleanup) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.options.cleanupInterval);
    }
  }
  
  /**
   * 获取缓存项
   */
  get(key) {
    const cacheKey = this.generateKey(key);
    const item = this.cache.get(cacheKey);
    
    if (!item) {
      this.metrics.misses++;
      return null;
    }
    
    // 检查是否过期
    if (this.isExpired(item)) {
      this.delete(key);
      this.metrics.misses++;
      return null;
    }
    
    // 更新访问时间和命中次数
    this.accessTimes.set(cacheKey, Date.now());
    this.hitCounts.set(cacheKey, (this.hitCounts.get(cacheKey) || 0) + 1);
    this.metrics.hits++;
    
    return item.data;
  }
  
  /**
   * 设置缓存项
   */
  set(key, data, options = {}) {
    const cacheKey = this.generateKey(key);
    const ttl = options.ttl || this.options.ttl;
    
    const item = {
      data: this.cloneData(data),
      timestamp: Date.now(),
      ttl,
      size: this.calculateSize(data),
      metadata: options.metadata || {}
    };
    
    // 检查缓存大小限制
    if (this.cache.size >= this.options.maxSize && !this.cache.has(cacheKey)) {
      this.evictLRU();
    }
    
    this.cache.set(cacheKey, item);
    this.accessTimes.set(cacheKey, Date.now());
    this.hitCounts.set(cacheKey, 0);
    
    this.metrics.sets++;
    this.updateTotalSize();
    
    return true;
  }
  
  /**
   * 删除缓存项
   */
  delete(key) {
    const cacheKey = this.generateKey(key);
    const deleted = this.cache.delete(cacheKey);
    
    if (deleted) {
      this.accessTimes.delete(cacheKey);
      this.hitCounts.delete(cacheKey);
      this.metrics.deletes++;
      this.updateTotalSize();
    }
    
    return deleted;
  }
  
  /**
   * 检查缓存项是否存在
   */
  has(key) {
    const cacheKey = this.generateKey(key);
    const item = this.cache.get(cacheKey);
    
    if (!item) {
      return false;
    }
    
    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * 清空缓存
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.accessTimes.clear();
    this.hitCounts.clear();
    this.metrics.totalSize = 0;
    
    return size;
  }
  
  /**
   * 清理过期项
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item, now)) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
        this.hitCounts.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.metrics.cleanups++;
      this.updateTotalSize();
    }
    
    return cleanedCount;
  }
  
  /**
   * 获取缓存统计信息
   */
  getStats() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 ?
      this.metrics.hits / (this.metrics.hits + this.metrics.misses) : 0;
    
    return {
      ...this.metrics,
      hitRate,
      size: this.cache.size,
      maxSize: this.options.maxSize,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * 获取缓存命中率
   */
  getHitRate() {
    return this.metrics.hits + this.metrics.misses > 0 ?
      this.metrics.hits / (this.metrics.hits + this.metrics.misses) : 0;
  }
  
  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    let totalSize = 0;
    const sizeDistribution = new Map();
    
    for (const [key, item] of this.cache.entries()) {
      totalSize += item.size;
      
      const sizeRange = this.getSizeRange(item.size);
      sizeDistribution.set(sizeRange, (sizeDistribution.get(sizeRange) || 0) + 1);
    }
    
    return {
      totalSize,
      averageSize: this.cache.size > 0 ? totalSize / this.cache.size : 0,
      sizeDistribution: Object.fromEntries(sizeDistribution)
    };
  }
  
  /**
   * 获取热点数据
   */
  getHotKeys(limit = 10) {
    const hotKeys = Array.from(this.hitCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, hits]) => ({
        key,
        hits,
        lastAccess: this.accessTimes.get(key)
      }));
    
    return hotKeys;
  }
  
  /**
   * 预热缓存
   */
  async warmup(dataProvider, keys = []) {
    if (typeof dataProvider !== 'function') {
      throw new Error('Data provider must be a function');
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const key of keys) {
      try {
        const data = await dataProvider(key);
        if (data !== null && data !== undefined) {
          this.set(key, data);
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ key, error: error.message });
      }
    }
    
    return results;
  }
  
  /**
   * 批量获取
   */
  getBatch(keys) {
    const results = new Map();
    
    for (const key of keys) {
      const data = this.get(key);
      if (data !== null) {
        results.set(key, data);
      }
    }
    
    return results;
  }
  
  /**
   * 批量设置
   */
  setBatch(entries, options = {}) {
    let successCount = 0;
    
    for (const [key, data] of entries) {
      try {
        this.set(key, data, options);
        successCount++;
      } catch (error) {
        console.warn(`Failed to set cache for key ${key}:`, error);
      }
    }
    
    return successCount;
  }
  
  /**
   * 导出缓存数据
   */
  export() {
    const exportData = {
      timestamp: Date.now(),
      version: '1.0',
      options: this.options,
      metrics: this.metrics,
      entries: []
    };
    
    for (const [key, item] of this.cache.entries()) {
      exportData.entries.push({
        key,
        data: item.data,
        timestamp: item.timestamp,
        ttl: item.ttl,
        metadata: item.metadata,
        hitCount: this.hitCounts.get(key) || 0,
        lastAccess: this.accessTimes.get(key)
      });
    }
    
    return exportData;
  }
  
  /**
   * 导入缓存数据
   */
  import(exportData, options = {}) {
    const {
      overwrite = false,
      skipExpired = true
    } = options;
    
    if (!exportData || !exportData.entries) {
      throw new Error('Invalid export data');
    }
    
    let importedCount = 0;
    const now = Date.now();
    
    for (const entry of exportData.entries) {
      // 检查是否过期
      if (skipExpired && entry.timestamp + entry.ttl < now) {
        continue;
      }
      
      // 检查是否覆盖
      if (!overwrite && this.has(entry.key)) {
        continue;
      }
      
      this.set(entry.key, entry.data, {
        ttl: entry.ttl,
        metadata: entry.metadata
      });
      
      // 恢复访问统计
      if (entry.hitCount) {
        this.hitCounts.set(this.generateKey(entry.key), entry.hitCount);
      }
      if (entry.lastAccess) {
        this.accessTimes.set(this.generateKey(entry.key), entry.lastAccess);
      }
      
      importedCount++;
    }
    
    return importedCount;
  }
  
  /**
   * 销毁缓存
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.clear();
  }
  
  /**
   * 生成缓存键
   */
  generateKey(key) {
    if (typeof key === 'string') {
      return key;
    }
    
    if (typeof key === 'object' && key !== null) {
      return JSON.stringify(key, Object.keys(key).sort());
    }
    
    return String(key);
  }
  
  /**
   * 检查项是否过期
   */
  isExpired(item, now = Date.now()) {
    return item.timestamp + item.ttl < now;
  }
  
  /**
   * LRU淘汰
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.accessTimes.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
      this.hitCounts.delete(oldestKey);
    }
  }
  
  /**
   * 计算数据大小
   */
  calculateSize(data) {
    if (data === null || data === undefined) {
      return 0;
    }
    
    if (typeof data === 'string') {
      return data.length * 2; // Unicode字符
    }
    
    if (typeof data === 'number') {
      return 8;
    }
    
    if (typeof data === 'boolean') {
      return 4;
    }
    
    if (Array.isArray(data)) {
      return data.reduce((size, item) => size + this.calculateSize(item), 0);
    }
    
    if (typeof data === 'object') {
      return Object.entries(data).reduce((size, [key, value]) => {
        return size + this.calculateSize(key) + this.calculateSize(value);
      }, 0);
    }
    
    return JSON.stringify(data).length * 2;
  }
  
  /**
   * 获取大小范围
   */
  getSizeRange(size) {
    if (size < 1024) return 'small';
    if (size < 10240) return 'medium';
    if (size < 102400) return 'large';
    return 'xlarge';
  }
  
  /**
   * 更新总大小
   */
  updateTotalSize() {
    this.metrics.totalSize = Array.from(this.cache.values())
      .reduce((total, item) => total + item.size, 0);
  }
  
  /**
   * 克隆数据
   */
  cloneData(data) {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (typeof data !== 'object') {
      return data;
    }
    
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to clone cache data:', error);
      return data;
    }
  }
  
  /**
   * 重置统计信息
   */
  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0,
      totalSize: this.metrics.totalSize
    };
  }
  
  /**
   * 获取缓存键列表
   */
  keys() {
    return Array.from(this.cache.keys());
  }
  
  /**
   * 获取缓存值列表
   */
  values() {
    return Array.from(this.cache.values()).map(item => item.data);
  }
  
  /**
   * 获取缓存条目列表
   */
  entries() {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.data]);
  }
  
  /**
   * 遍历缓存
   */
  forEach(callback) {
    for (const [key, item] of this.cache.entries()) {
      callback(item.data, key, this);
    }
  }
}

export { LayoutCache };
export default LayoutCache;