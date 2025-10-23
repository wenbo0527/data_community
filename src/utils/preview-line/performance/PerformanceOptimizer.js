/**
 * 性能优化器
 * 提供预览线系统的性能监控、优化和资源管理功能
 */

export class PerformanceOptimizer {
  constructor(options = {}) {
    this.options = {
      // 批处理配置
      batchSize: 50,
      batchDelay: 16, // ~60fps
      
      // 防抖配置
      debounceDelay: 100,
      
      // 缓存配置
      cacheSize: 1000,
      cacheTimeout: 300000, // 5分钟
      
      // 性能监控
      enableProfiling: false,
      profilingInterval: 1000,
      
      // 资源限制
      maxConcurrentOperations: 10,
      maxPreviewLines: 500,
      
      // 优化策略
      enableLazyLoading: true,
      enableVirtualization: true,
      enableRequestAnimationFrame: true,
      
      ...options
    };

    // 性能统计
    this.stats = {
      operationsCount: 0,
      batchedOperations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageExecutionTime: 0,
      peakMemoryUsage: 0,
      totalExecutionTime: 0,
      errorCount: 0
    };

    // 运行时状态
    this.isRunning = false;
    this.operationQueue = [];
    this.batchTimer = null;
    this.debounceTimers = new Map();
    this.cache = new Map();
    this.activeOperations = new Set();
    this.performanceObserver = null;
    this.batchMode = false;
    this.batchOperations = [];
    
    // 初始化性能监控
    if (this.options.enableProfiling) {
      this.initPerformanceMonitoring();
    }
  }

  /**
   * 初始化性能监控
   */
  initPerformanceMonitoring() {
    try {
      // 使用Performance Observer监控性能
      if (typeof PerformanceObserver !== 'undefined') {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name.startsWith('preview-line-')) {
              this.updatePerformanceStats(entry);
            }
          });
        });
        
        this.performanceObserver.observe({ entryTypes: ['measure'] });
      }
      
      // 定期收集内存使用情况
      this.memoryMonitorInterval = setInterval(() => {
        this.collectMemoryStats();
      }, this.options.profilingInterval);
      
    } catch (error) {
      console.warn('性能监控初始化失败:', error);
    }
  }

  /**
   * 批处理操作
   * @param {Function} operation - 要执行的操作
   * @param {string} key - 操作键（用于去重）
   * @param {Object} context - 操作上下文
   * @returns {Promise} 操作结果
   */
  batchOperation(operation, key, context = {}) {
    return new Promise((resolve, reject) => {
      // 检查是否已有相同操作在队列中
      const existingIndex = this.operationQueue.findIndex(item => item.key === key);
      
      if (existingIndex !== -1) {
        // 更新现有操作
        this.operationQueue[existingIndex] = {
          operation,
          key,
          context,
          resolve,
          reject,
          timestamp: Date.now()
        };
      } else {
        // 添加新操作
        this.operationQueue.push({
          operation,
          key,
          context,
          resolve,
          reject,
          timestamp: Date.now()
        });
      }

      // 启动批处理定时器
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch();
        }, this.options.batchDelay);
      }
    });
  }

  /**
   * 处理批次操作
   */
  async processBatch() {
    if (this.operationQueue.length === 0) {
      this.batchTimer = null;
      return;
    }

    const batch = this.operationQueue.splice(0, this.options.batchSize);
    this.batchTimer = null;
    
    // 如果还有剩余操作，继续批处理
    if (this.operationQueue.length > 0) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.options.batchDelay);
    }

    const startTime = performance.now();
    
    try {
      // 并行执行批次中的操作
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          try {
            const result = await this.executeOperation(item.operation, item.context);
            item.resolve(result);
            return result;
          } catch (error) {
            item.reject(error);
            throw error;
          }
        })
      );
      
      this.stats.batchedOperations += batch.length;
      
    } catch (error) {
      console.error('批处理执行失败:', error);
      this.stats.errorCount++;
    } finally {
      const executionTime = performance.now() - startTime;
      this.updateExecutionStats(executionTime);
    }
  }

  /**
   * 执行单个操作
   * @param {Function} operation - 操作函数
   * @param {Object} context - 操作上下文
   * @returns {*} 操作结果
   */
  async executeOperation(operation, context) {
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.activeOperations.add(operationId);
      
      // 检查并发限制
      if (this.activeOperations.size > this.options.maxConcurrentOperations) {
        await this.waitForAvailableSlot();
      }
      
      const startTime = performance.now();
      
      // 执行操作
      const result = await operation(context);
      
      const executionTime = performance.now() - startTime;
      this.updateExecutionStats(executionTime);
      this.stats.operationsCount++;
      
      return result;
      
    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * 等待可用的操作槽位
   */
  async waitForAvailableSlot() {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.activeOperations.size < this.options.maxConcurrentOperations) {
          resolve();
        } else {
          setTimeout(checkSlot, 10);
        }
      };
      checkSlot();
    });
  }

  /**
   * 防抖操作
   * @param {Function} operation - 要执行的操作
   * @param {string} key - 防抖键
   * @param {number} delay - 防抖延迟
   * @returns {Promise} 操作结果
   */
  debounceOperation(operation, key, delay = this.options.debounceDelay) {
    return new Promise((resolve, reject) => {
      // 清除现有的防抖定时器
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key).timer);
      }
      
      // 设置新的防抖定时器
      const timer = setTimeout(async () => {
        try {
          const result = await this.executeOperation(operation, {});
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.debounceTimers.delete(key);
        }
      }, delay);
      
      this.debounceTimers.set(key, { timer, resolve, reject });
    });
  }

  /**
   * 缓存操作结果
   * @param {string} key - 缓存键
   * @param {Function} operation - 操作函数
   * @param {number} timeout - 缓存超时时间
   * @returns {*} 操作结果
   */
  async cacheOperation(key, operation, timeout = this.options.cacheTimeout) {
    // 检查缓存
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < timeout) {
        this.stats.cacheHits++;
        return cached.value;
      } else {
        this.cache.delete(key);
      }
    }
    
    this.stats.cacheMisses++;
    
    // 执行操作并缓存结果
    const result = await this.executeOperation(operation, {});
    
    // 检查缓存大小限制
    if (this.cache.size >= this.options.cacheSize) {
      this.clearOldestCacheEntries();
    }
    
    this.cache.set(key, {
      value: result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * 清理最旧的缓存条目
   */
  clearOldestCacheEntries() {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const removeCount = Math.floor(this.options.cacheSize * 0.2); // 移除20%
    
    for (let i = 0; i < removeCount; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * 使用requestAnimationFrame优化渲染操作
   * @param {Function} operation - 渲染操作
   * @returns {Promise} 操作结果
   */
  scheduleRenderOperation(operation) {
    if (!this.options.enableRequestAnimationFrame) {
      return this.executeOperation(operation, {});
    }
    
    return new Promise((resolve, reject) => {
      requestAnimationFrame(async () => {
        try {
          const result = await this.executeOperation(operation, {});
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 虚拟化处理大量预览线
   * @param {Array} previewLines - 预览线数组
   * @param {Object} viewport - 视口信息
   * @returns {Array} 可见的预览线
   */
  virtualizePreviewLines(previewLines, viewport) {
    if (!this.options.enableVirtualization || !viewport) {
      return previewLines;
    }
    
    const { x, y, width, height } = viewport;
    const buffer = 100; // 缓冲区大小
    
    return previewLines.filter(line => {
      if (!line || !line.line) return false;
      
      try {
        const sourcePoint = line.line.getSourcePoint();
        const targetPoint = line.line.getTargetPoint();
        
        // 检查预览线是否在视口范围内
        const lineMinX = Math.min(sourcePoint.x, targetPoint?.x || sourcePoint.x);
        const lineMaxX = Math.max(sourcePoint.x, targetPoint?.x || sourcePoint.x);
        const lineMinY = Math.min(sourcePoint.y, targetPoint?.y || sourcePoint.y);
        const lineMaxY = Math.max(sourcePoint.y, targetPoint?.y || sourcePoint.y);
        
        return !(lineMaxX < x - buffer || 
                lineMinX > x + width + buffer || 
                lineMaxY < y - buffer || 
                lineMinY > y + height + buffer);
      } catch (error) {
        return true; // 出错时保留
      }
    });
  }

  /**
   * 懒加载预览线
   * @param {Array} previewLines - 预览线数组
   * @param {number} priority - 优先级
   * @returns {Promise<Array>} 加载的预览线
   */
  async lazyLoadPreviewLines(previewLines, priority = 0) {
    if (!this.options.enableLazyLoading) {
      return previewLines;
    }
    
    // 按优先级排序
    const sortedLines = previewLines.sort((a, b) => {
      const aPriority = a.priority || 0;
      const bPriority = b.priority || 0;
      return bPriority - aPriority;
    });
    
    const loadedLines = [];
    const batchSize = Math.min(this.options.batchSize, 20);
    
    for (let i = 0; i < sortedLines.length; i += batchSize) {
      const batch = sortedLines.slice(i, i + batchSize);
      
      await this.batchOperation(
        async () => {
          batch.forEach(line => {
            if (line && line.line) {
              loadedLines.push(line);
            }
          });
        },
        `lazy-load-${i}`,
        { batch, priority }
      );
      
      // 在批次之间添加小延迟，避免阻塞UI
      if (i + batchSize < sortedLines.length) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    return loadedLines;
  }

  /**
   * 更新性能统计
   * @param {PerformanceEntry} entry - 性能条目
   */
  updatePerformanceStats(entry) {
    const executionTime = entry.duration;
    this.updateExecutionStats(executionTime);
  }

  /**
   * 更新执行时间统计
   * @param {number} executionTime - 执行时间
   */
  updateExecutionStats(executionTime) {
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / Math.max(this.stats.operationsCount, 1);
  }

  /**
   * 收集内存使用统计
   */
  collectMemoryStats() {
    try {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize;
        this.stats.peakMemoryUsage = Math.max(this.stats.peakMemoryUsage, memoryUsage);
      }
    } catch (error) {
      // 忽略内存统计错误
    }
  }

  /**
   * 获取性能统计信息
   * @returns {Object} 性能统计
   */
  getPerformanceStats() {
    return {
      ...this.stats,
      activeOperations: this.activeOperations.size,
      queuedOperations: this.operationQueue.length,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHits / Math.max(this.stats.cacheHits + this.stats.cacheMisses, 1),
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
    };
  }

  /**
   * 重置性能统计
   */
  resetStats() {
    this.stats = {
      operationsCount: 0,
      batchedOperations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageExecutionTime: 0,
      peakMemoryUsage: 0,
      totalExecutionTime: 0,
      errorCount: 0
    };
  }

  /**
   * 清理缓存
   * @param {string} pattern - 清理模式（可选）
   */
  clearCache(pattern) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * 优化配置
   * @param {Object} newOptions - 新配置
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // 重新初始化性能监控（如果需要）
    if (newOptions.enableProfiling !== undefined) {
      if (newOptions.enableProfiling && !this.performanceObserver) {
        this.initPerformanceMonitoring();
      } else if (!newOptions.enableProfiling && this.performanceObserver) {
        this.destroy();
      }
    }
  }

  /**
   * 开始批处理模式
   */
  startBatch() {
    this.batchMode = true;
    this.batchOperations = [];
  }

  /**
   * 结束批处理模式并处理所有批处理操作
   */
  async endBatch() {
    if (!this.batchMode) {
      return;
    }
    
    this.batchMode = false;
    
    if (this.batchOperations.length > 0) {
      const operations = [...this.batchOperations];
      this.batchOperations = [];
      
      // 处理批处理操作
      await this.processBatch();
    }
  }

  /**
   * 销毁优化器
   */
  destroy() {
    // 清理定时器
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }
    
    // 清理防抖定时器
    this.debounceTimers.forEach(({ timer }) => {
      clearTimeout(timer);
    });
    this.debounceTimers.clear();
    
    // 停止性能监控
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    // 清理缓存和队列
    this.cache.clear();
    this.operationQueue.length = 0;
    this.activeOperations.clear();
    
    this.isRunning = false;
  }
}

export default PerformanceOptimizer;