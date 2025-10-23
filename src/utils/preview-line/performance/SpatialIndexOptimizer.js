/**
 * 空间索引优化器
 * 用于优化预览线系统中的空间查询性能，特别是吸附检测和碰撞检测
 */

export class SpatialIndexOptimizer {
  constructor(options = {}) {
    this.options = {
      // 网格配置
      gridSize: 100,           // 网格大小（像素）
      maxItemsPerCell: 10,     // 每个网格单元最大项目数
      
      // 性能配置
      enableDebug: false,
      enableStats: true,
      updateThreshold: 50,     // 更新阈值（毫秒）
      
      // 缓存配置
      enableCache: true,
      cacheSize: 1000,
      cacheTTL: 5000,         // 缓存生存时间（毫秒）
      
      ...options
    };
    
    // 空间网格索引
    this.spatialGrid = new Map();
    this.gridBounds = {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0
    };
    
    // 项目索引（用于快速查找和更新）
    this.itemIndex = new Map(); // itemId -> { item, gridCells }
    
    // 查询缓存
    this.queryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
    
    // 性能统计
    this.stats = {
      totalItems: 0,
      totalCells: 0,
      queryCount: 0,
      updateCount: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      lastUpdate: 0
    };
    
    // 批量更新队列
    this.updateQueue = new Set();
    this.updateTimer = null;
    
    console.log('🚀 [SpatialIndexOptimizer] 初始化完成', {
      gridSize: this.options.gridSize,
      enableCache: this.options.enableCache,
      enableDebug: this.options.enableDebug
    });
  }
  
  /**
   * 添加项目到空间索引
   * @param {string} itemId - 项目ID
   * @param {Object} bounds - 边界框 {x, y, width, height}
   * @param {Object} data - 附加数据
   */
  addItem(itemId, bounds, data = {}) {
    const startTime = performance.now();
    
    try {
      // 移除已存在的项目
      if (this.itemIndex.has(itemId)) {
        this.removeItem(itemId);
      }
      
      // 计算项目占用的网格单元
      const gridCells = this.getGridCells(bounds);
      
      // 创建项目对象
      const item = {
        id: itemId,
        bounds: { ...bounds },
        data: { ...data },
        gridCells: [...gridCells],
        timestamp: Date.now()
      };
      
      // 添加到网格单元
      gridCells.forEach(cellKey => {
        if (!this.spatialGrid.has(cellKey)) {
          this.spatialGrid.set(cellKey, new Set());
        }
        this.spatialGrid.get(cellKey).add(itemId);
      });
      
      // 添加到项目索引
      this.itemIndex.set(itemId, item);
      
      // 更新边界
      this.updateBounds(bounds);
      
      // 更新统计
      this.stats.totalItems++;
      this.stats.updateCount++;
      this.stats.lastUpdate = Date.now();
      
      // 清理相关缓存
      this.invalidateCache(bounds);
      
      if (this.options.enableDebug) {
        console.log(`✅ [SpatialIndexOptimizer] 添加项目: ${itemId}`, {
          bounds,
          gridCells: gridCells.length,
          totalItems: this.stats.totalItems
        });
      }
      
      return true;
    } catch (error) {
      console.error(`❌ [SpatialIndexOptimizer] 添加项目失败: ${itemId}`, error);
      return false;
    } finally {
      const duration = performance.now() - startTime;
      this.updateAverageTime('update', duration);
    }
  }
  
  /**
   * 从空间索引中移除项目
   * @param {string} itemId - 项目ID
   */
  removeItem(itemId) {
    const item = this.itemIndex.get(itemId);
    if (!item) {
      return false;
    }
    
    try {
      // 从网格单元中移除
      item.gridCells.forEach(cellKey => {
        const cell = this.spatialGrid.get(cellKey);
        if (cell) {
          cell.delete(itemId);
          // 如果单元为空，删除它
          if (cell.size === 0) {
            this.spatialGrid.delete(cellKey);
          }
        }
      });
      
      // 从项目索引中移除
      this.itemIndex.delete(itemId);
      
      // 更新统计
      this.stats.totalItems--;
      
      // 清理相关缓存
      this.invalidateCache(item.bounds);
      
      if (this.options.enableDebug) {
        console.log(`🗑️ [SpatialIndexOptimizer] 移除项目: ${itemId}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ [SpatialIndexOptimizer] 移除项目失败: ${itemId}`, error);
      return false;
    }
  }
  
  /**
   * 更新项目位置
   * @param {string} itemId - 项目ID
   * @param {Object} newBounds - 新的边界框
   * @param {Object} newData - 新的附加数据
   */
  updateItem(itemId, newBounds, newData = {}) {
    const item = this.itemIndex.get(itemId);
    if (!item) {
      return this.addItem(itemId, newBounds, newData);
    }
    
    // 检查是否需要更新网格位置
    const oldGridCells = new Set(item.gridCells);
    const newGridCells = this.getGridCells(newBounds);
    
    // 如果网格位置没有变化，只更新数据
    if (this.areSetsEqual(oldGridCells, newGridCells)) {
      item.bounds = { ...newBounds };
      item.data = { ...newData };
      item.timestamp = Date.now();
      return true;
    }
    
    // 网格位置有变化，需要重新索引
    this.removeItem(itemId);
    return this.addItem(itemId, newBounds, newData);
  }
  
  /**
   * 批量更新项目（性能优化）
   * @param {Array} updates - 更新列表 [{itemId, bounds, data}]
   */
  batchUpdate(updates) {
    const startTime = performance.now();
    
    try {
      // 暂停缓存清理
      const originalCacheEnabled = this.options.enableCache;
      this.options.enableCache = false;
      
      let successCount = 0;
      
      updates.forEach(update => {
        const { itemId, bounds, data } = update;
        if (this.updateItem(itemId, bounds, data)) {
          successCount++;
        }
      });
      
      // 恢复缓存并清理
      this.options.enableCache = originalCacheEnabled;
      this.clearCache();
      
      if (this.options.enableDebug) {
        console.log(`📦 [SpatialIndexOptimizer] 批量更新完成`, {
          total: updates.length,
          success: successCount,
          duration: performance.now() - startTime
        });
      }
      
      return successCount;
    } catch (error) {
      console.error('❌ [SpatialIndexOptimizer] 批量更新失败', error);
      return 0;
    }
  }
  
  /**
   * 查询指定区域内的项目
   * @param {Object} queryBounds - 查询边界框
   * @param {Object} options - 查询选项
   * @returns {Array} 匹配的项目列表
   */
  queryRegion(queryBounds, options = {}) {
    const startTime = performance.now();
    
    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(queryBounds, options);
      
      // 检查缓存
      if (this.options.enableCache) {
        const cached = this.queryCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.options.cacheTTL) {
          this.cacheStats.hits++;
          return cached.result;
        }
        this.cacheStats.misses++;
      }
      
      // 获取相关的网格单元
      const gridCells = this.getGridCells(queryBounds);
      const candidateIds = new Set();
      
      // 收集候选项目
      gridCells.forEach(cellKey => {
        const cell = this.spatialGrid.get(cellKey);
        if (cell) {
          cell.forEach(itemId => candidateIds.add(itemId));
        }
      });
      
      // 精确碰撞检测
      const results = [];
      candidateIds.forEach(itemId => {
        const item = this.itemIndex.get(itemId);
        if (item && this.intersects(queryBounds, item.bounds)) {
          // 应用过滤器
          if (!options.filter || options.filter(item)) {
            results.push({
              id: item.id,
              bounds: item.bounds,
              data: item.data,
              distance: options.includeDistance ? 
                this.calculateDistance(queryBounds, item.bounds) : undefined
            });
          }
        }
      });
      
      // 排序结果
      if (options.sortBy === 'distance' && options.includeDistance) {
        results.sort((a, b) => a.distance - b.distance);
      }
      
      // 限制结果数量
      const finalResults = options.limit ? results.slice(0, options.limit) : results;
      
      // 缓存结果
      if (this.options.enableCache) {
        this.cacheResult(cacheKey, finalResults);
      }
      
      // 更新统计
      this.stats.queryCount++;
      
      if (this.options.enableDebug) {
        console.log(`🔍 [SpatialIndexOptimizer] 区域查询完成`, {
          queryBounds,
          candidates: candidateIds.size,
          results: finalResults.length,
          duration: performance.now() - startTime
        });
      }
      
      return finalResults;
    } catch (error) {
      console.error('❌ [SpatialIndexOptimizer] 区域查询失败', error);
      return [];
    } finally {
      const duration = performance.now() - startTime;
      this.updateAverageTime('query', duration);
    }
  }
  
  /**
   * 查询最近的项目
   * @param {Object} point - 查询点 {x, y}
   * @param {number} maxDistance - 最大距离
   * @param {Object} options - 查询选项
   * @returns {Array} 按距离排序的项目列表
   */
  queryNearest(point, maxDistance = Infinity, options = {}) {
    const queryBounds = {
      x: point.x - maxDistance,
      y: point.y - maxDistance,
      width: maxDistance * 2,
      height: maxDistance * 2
    };
    
    return this.queryRegion(queryBounds, {
      ...options,
      includeDistance: true,
      sortBy: 'distance',
      filter: (item) => {
        const distance = this.calculatePointDistance(point, item.bounds);
        return distance <= maxDistance && (!options.filter || options.filter(item));
      }
    });
  }
  
  /**
   * 获取边界框占用的网格单元
   * @param {Object} bounds - 边界框
   * @returns {Set} 网格单元键集合
   */
  getGridCells(bounds) {
    const cells = new Set();
    const { gridSize } = this.options;
    
    const startX = Math.floor(bounds.x / gridSize);
    const startY = Math.floor(bounds.y / gridSize);
    const endX = Math.floor((bounds.x + bounds.width) / gridSize);
    const endY = Math.floor((bounds.y + bounds.height) / gridSize);
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.add(`${x},${y}`);
      }
    }
    
    return cells;
  }
  
  /**
   * 检查两个边界框是否相交
   * @param {Object} bounds1 - 边界框1
   * @param {Object} bounds2 - 边界框2
   * @returns {boolean} 是否相交
   */
  intersects(bounds1, bounds2) {
    return !(
      bounds1.x + bounds1.width < bounds2.x ||
      bounds2.x + bounds2.width < bounds1.x ||
      bounds1.y + bounds1.height < bounds2.y ||
      bounds2.y + bounds2.height < bounds1.y
    );
  }
  
  /**
   * 计算两个边界框之间的距离
   * @param {Object} bounds1 - 边界框1
   * @param {Object} bounds2 - 边界框2
   * @returns {number} 距离
   */
  calculateDistance(bounds1, bounds2) {
    const center1 = {
      x: bounds1.x + bounds1.width / 2,
      y: bounds1.y + bounds1.height / 2
    };
    const center2 = {
      x: bounds2.x + bounds2.width / 2,
      y: bounds2.y + bounds2.height / 2
    };
    
    return Math.sqrt(
      Math.pow(center2.x - center1.x, 2) + 
      Math.pow(center2.y - center1.y, 2)
    );
  }
  
  /**
   * 计算点到边界框的距离
   * @param {Object} point - 点 {x, y}
   * @param {Object} bounds - 边界框
   * @returns {number} 距离
   */
  calculatePointDistance(point, bounds) {
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
    
    return Math.sqrt(
      Math.pow(point.x - center.x, 2) + 
      Math.pow(point.y - center.y, 2)
    );
  }
  
  /**
   * 更新空间边界
   * @param {Object} bounds - 边界框
   */
  updateBounds(bounds) {
    this.gridBounds.minX = Math.min(this.gridBounds.minX, bounds.x);
    this.gridBounds.minY = Math.min(this.gridBounds.minY, bounds.y);
    this.gridBounds.maxX = Math.max(this.gridBounds.maxX, bounds.x + bounds.width);
    this.gridBounds.maxY = Math.max(this.gridBounds.maxY, bounds.y + bounds.height);
  }
  
  /**
   * 生成缓存键
   * @param {Object} queryBounds - 查询边界
   * @param {Object} options - 查询选项
   * @returns {string} 缓存键
   */
  generateCacheKey(queryBounds, options) {
    const boundsKey = `${queryBounds.x},${queryBounds.y},${queryBounds.width},${queryBounds.height}`;
    const optionsKey = JSON.stringify({
      limit: options.limit,
      sortBy: options.sortBy,
      includeDistance: options.includeDistance
    });
    return `${boundsKey}|${optionsKey}`;
  }
  
  /**
   * 缓存查询结果
   * @param {string} cacheKey - 缓存键
   * @param {Array} result - 查询结果
   */
  cacheResult(cacheKey, result) {
    // 检查缓存大小限制
    if (this.queryCache.size >= this.options.cacheSize) {
      // 删除最旧的缓存项
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
      this.cacheStats.evictions++;
    }
    
    this.queryCache.set(cacheKey, {
      result: [...result],
      timestamp: Date.now()
    });
  }
  
  /**
   * 清理相关缓存
   * @param {Object} bounds - 影响的边界框
   */
  invalidateCache(bounds) {
    if (!this.options.enableCache) return;
    
    // 简单策略：清理所有缓存
    // 更复杂的策略可以只清理相关区域的缓存
    this.clearCache();
  }
  
  /**
   * 清理所有缓存
   */
  clearCache() {
    this.queryCache.clear();
    this.cacheStats.hits = 0;
    this.cacheStats.misses = 0;
    this.cacheStats.evictions = 0;
  }
  
  /**
   * 检查两个集合是否相等
   * @param {Set} set1 - 集合1
   * @param {Set} set2 - 集合2
   * @returns {boolean} 是否相等
   */
  areSetsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }
  
  /**
   * 更新平均时间统计
   * @param {string} type - 操作类型 ('query' | 'update')
   * @param {number} duration - 持续时间
   */
  updateAverageTime(type, duration) {
    const key = type === 'query' ? 'averageQueryTime' : 'averageUpdateTime';
    const count = type === 'query' ? this.stats.queryCount : this.stats.updateCount;
    
    if (count === 1) {
      this.stats[key] = duration;
    } else {
      this.stats[key] = (this.stats[key] * (count - 1) + duration) / count;
    }
  }
  
  /**
   * 获取性能统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      totalCells: this.spatialGrid.size,
      cacheStats: { ...this.cacheStats },
      cacheHitRate: this.cacheStats.hits + this.cacheStats.misses > 0 ? 
        this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) : 0,
      gridBounds: { ...this.gridBounds }
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalItems: this.itemIndex.size,
      totalCells: this.spatialGrid.size,
      queryCount: 0,
      updateCount: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      lastUpdate: Date.now()
    };
    
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }
  
  /**
   * 销毁优化器
   */
  destroy() {
    // 清理定时器
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    
    // 清理数据结构
    this.spatialGrid.clear();
    this.itemIndex.clear();
    this.queryCache.clear();
    this.updateQueue.clear();
    
    console.log('🗑️ [SpatialIndexOptimizer] 已销毁');
  }
}

export default SpatialIndexOptimizer;