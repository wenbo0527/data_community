/**
 * 布局缓存管理器
 * 负责布局结果的缓存、命中率统计和缓存清理
 */

export class LayoutCache {
  constructor(config = {}) {
    this.enabled = config.enabled !== false; // 默认启用
    this.maxSize = config.maxSize || 10;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
    this.accessOrder = []; // 用于LRU淘汰策略
    
    console.log(`🗄️ [布局缓存] 初始化完成，最大缓存数: ${this.maxSize}`);
  }

  /**
   * 生成缓存键
   * @param {Object} layoutInput - 布局输入参数
   * @returns {string} 缓存键
   */
  generateCacheKey(layoutInput) {
    const { nodeCount, edgeCount, options = {} } = layoutInput;
    const keyParts = [
      `nodes:${nodeCount}`,
      `edges:${edgeCount}`,
      `spacing:${options.spacing || 'default'}`,
      `alignment:${options.alignment || 'default'}`
    ];
    return keyParts.join('|');
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {Object|null} 缓存的布局结果
   */
  get(key) {
    if (!this.enabled) {
      return null;
    }

    if (this.cache.has(key)) {
      this.hits++;
      // 更新访问顺序（LRU）
      this.updateAccessOrder(key);
      const cachedResult = this.cache.get(key);
      
      console.log(`✅ [布局缓存] 缓存命中: ${key}`);
      return {
        ...cachedResult,
        fromCache: true,
        cacheHitTime: Date.now()
      };
    } else {
      this.misses++;
      console.log(`❌ [布局缓存] 缓存未命中: ${key}`);
      return null;
    }
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {Object} value - 布局结果
   */
  set(key, value) {
    if (!this.enabled) {
      return;
    }

    // 如果缓存已满，使用LRU策略淘汰最久未使用的项
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    // 存储缓存（不包含fromCache标记）
    const cacheValue = {
      ...value,
      cachedAt: Date.now()
    };
    delete cacheValue.fromCache;
    delete cacheValue.cacheHitTime;

    this.cache.set(key, cacheValue);
    this.updateAccessOrder(key);
    
    console.log(`💾 [布局缓存] 缓存已保存: ${key}, 当前缓存数: ${this.cache.size}`);
  }

  /**
   * 更新访问顺序（LRU策略）
   * @param {string} key - 缓存键
   */
  updateAccessOrder(key) {
    // 移除旧的访问记录
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    // 添加到最前面（最近访问）
    this.accessOrder.unshift(key);
  }

  /**
   * 淘汰最久未使用的缓存项（LRU）
   */
  evictLRU() {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder.pop();
      this.cache.delete(lruKey);
      console.log(`🗑️ [布局缓存] LRU淘汰缓存: ${lruKey}`);
    }
  }

  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
    console.log(`🧹 [布局缓存] 缓存已清空`);
  }

  /**
   * 获取缓存命中率
   * @returns {number} 命中率（0-1之间）
   */
  getHitRate() {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getStats() {
    return {
      enabled: this.enabled,
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      totalRequests: this.hits + this.misses
    };
  }

  /**
   * 检查缓存是否有效
   * @param {string} key - 缓存键
   * @param {number} maxAge - 最大缓存时间（毫秒）
   * @returns {boolean} 缓存是否有效
   */
  isValid(key, maxAge = 300000) { // 默认5分钟过期
    if (!this.cache.has(key)) {
      return false;
    }

    const cachedItem = this.cache.get(key);
    const age = Date.now() - cachedItem.cachedAt;
    
    if (age > maxAge) {
      console.log(`⏰ [布局缓存] 缓存已过期: ${key}, 年龄: ${age}ms`);
      this.cache.delete(key);
      // 从访问顺序中移除
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      return false;
    }

    return true;
  }

  /**
   * 启用缓存
   */
  enable() {
    this.enabled = true;
    console.log(`✅ [布局缓存] 缓存已启用`);
  }

  /**
   * 禁用缓存
   */
  disable() {
    this.enabled = false;
    console.log(`❌ [布局缓存] 缓存已禁用`);
  }

  /**
   * 获取缓存键列表
   * @returns {Array} 缓存键数组
   */
  getKeys() {
    return Array.from(this.cache.keys());
  }

  /**
   * 删除指定缓存
   * @param {string} key - 缓存键
   * @returns {boolean} 是否删除成功
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      // 从访问顺序中移除
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      console.log(`🗑️ [布局缓存] 已删除缓存: ${key}`);
    }
    return deleted;
  }

  /**
   * 检查缓存是否存在
   * @param {string} key - 缓存键
   * @returns {boolean} 缓存是否存在
   */
  has(key) {
    return this.cache.has(key);
  }
}
export default LayoutCache;
