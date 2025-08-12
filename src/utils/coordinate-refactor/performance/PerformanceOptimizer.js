/**
 * 性能优化管理器 - 解决页面首次加载操作过多的问题
 * 基于技术方案文档的性能优化策略
 */

export class PerformanceOptimizer {
  constructor(config = {}) {
    this.config = {
      // 延迟执行配置
      enableDelayedExecution: true,
      initialDelay: 300, // 页面加载后延迟300ms执行布局
      
      // 批处理配置
      enableBatching: true,
      batchSize: 20,
      batchDelay: 50,
      
      // 缓存配置
      enableSmartCache: true,
      cacheExpiry: 5000, // 5秒缓存过期
      
      // 预览线优化
      enablePreviewLineThrottling: true,
      previewLineUpdateDelay: 100,
      maxPreviewLineUpdates: 3,
      
      // 调试配置
      enableDebug: true,
      enablePerformanceMonitoring: true,
      
      ...config
    };

    this.state = {
      isInitialLoad: true,
      pendingOperations: [],
      executionQueue: [],
      lastExecutionTime: 0,
      performanceMetrics: {
        totalOperations: 0,
        skippedOperations: 0,
        batchedOperations: 0,
        cacheHits: 0,
        averageExecutionTime: 0
      }
    };

    this.cache = new Map();
    this.timers = new Map();
    this.throttledFunctions = new Map();

    this.initializeOptimizer();
  }

  /**
   * 初始化优化器
   */
  initializeOptimizer() {
    console.log('🚀 [性能优化器] 初始化开始');
    
    // 监听页面加载完成事件
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.handlePageLoadComplete();
        });
      } else {
        // 页面已经加载完成
        setTimeout(() => {
          this.handlePageLoadComplete();
        }, this.config.initialDelay);
      }
    }

    console.log('✅ [性能优化器] 初始化完成');
  }

  /**
   * 处理页面加载完成
   */
  handlePageLoadComplete() {
    console.log('📄 [页面加载] 页面加载完成，开始延迟执行策略');
    
    setTimeout(() => {
      this.state.isInitialLoad = false;
      this.processPendingOperations();
      console.log('⏰ [延迟执行] 初始加载期结束，开始处理待执行操作');
    }, this.config.initialDelay);
  }

  /**
   * 优化布局执行 - 主要入口方法
   * @param {Function} layoutFunction - 布局函数
   * @param {Object} context - 执行上下文
   * @param {Object} options - 执行选项
   * @returns {Promise} 执行结果
   */
  async optimizeLayoutExecution(layoutFunction, context = {}, options = {}) {
    const operationId = this.generateOperationId();
    const startTime = performance.now();
    
    console.log(`🔄 [布局优化] 开始优化执行 - ID: ${operationId}`);

    try {
      // 检查是否在初始加载期间
      if (this.state.isInitialLoad && this.config.enableDelayedExecution) {
        return await this.handleInitialLoadOperation(layoutFunction, context, options, operationId);
      }

      // 检查缓存
      if (this.config.enableSmartCache) {
        const cachedResult = this.checkCache(layoutFunction, context, options);
        if (cachedResult) {
          this.state.performanceMetrics.cacheHits++;
          console.log(`✅ [缓存命中] 使用缓存结果 - ID: ${operationId}`);
          return cachedResult;
        }
      }

      // 批处理执行
      if (this.config.enableBatching) {
        return await this.handleBatchedExecution(layoutFunction, context, options, operationId);
      }

      // 直接执行
      const result = await this.executeWithMonitoring(layoutFunction, context, options, operationId);
      
      // 缓存结果
      if (this.config.enableSmartCache) {
        this.cacheResult(layoutFunction, context, options, result);
      }

      const endTime = performance.now();
      this.updatePerformanceMetrics(endTime - startTime);
      
      return result;
    } catch (error) {
      console.error(`❌ [布局优化] 执行失败 - ID: ${operationId}:`, error);
      throw error;
    }
  }

  /**
   * 处理初始加载期间的操作
   */
  async handleInitialLoadOperation(layoutFunction, context, options, operationId) {
    console.log(`⏳ [初始加载] 延迟执行操作 - ID: ${operationId}`);
    
    // 将操作添加到待执行队列
    const operation = {
      id: operationId,
      function: layoutFunction,
      context,
      options,
      timestamp: Date.now()
    };
    
    this.state.pendingOperations.push(operation);
    
    // 返回一个Promise，在延迟执行时解析
    return new Promise((resolve, reject) => {
      operation.resolve = resolve;
      operation.reject = reject;
    });
  }

  /**
   * 处理批处理执行
   */
  async handleBatchedExecution(layoutFunction, context, options, operationId) {
    console.log(`📦 [批处理] 添加到批处理队列 - ID: ${operationId}`);
    
    const operation = {
      id: operationId,
      function: layoutFunction,
      context,
      options,
      timestamp: Date.now()
    };
    
    this.state.executionQueue.push(operation);
    
    // 如果队列达到批处理大小，立即执行
    if (this.state.executionQueue.length >= this.config.batchSize) {
      return await this.processBatch();
    }
    
    // 否则设置延迟执行
    if (!this.timers.has('batchExecution')) {
      const timer = setTimeout(() => {
        this.processBatch();
        this.timers.delete('batchExecution');
      }, this.config.batchDelay);
      
      this.timers.set('batchExecution', timer);
    }
    
    // 返回Promise等待批处理执行
    return new Promise((resolve, reject) => {
      operation.resolve = resolve;
      operation.reject = reject;
    });
  }

  /**
   * 处理批处理
   */
  async processBatch() {
    if (this.state.executionQueue.length === 0) return;
    
    console.log(`🔄 [批处理执行] 开始处理 ${this.state.executionQueue.length} 个操作`);
    
    const batch = [...this.state.executionQueue];
    this.state.executionQueue = [];
    
    // 并行执行批处理操作
    const results = await Promise.allSettled(
      batch.map(async (operation) => {
        try {
          const result = await this.executeWithMonitoring(
            operation.function,
            operation.context,
            operation.options,
            operation.id
          );
          
          if (operation.resolve) {
            operation.resolve(result);
          }
          
          return result;
        } catch (error) {
          if (operation.reject) {
            operation.reject(error);
          }
          throw error;
        }
      })
    );
    
    this.state.performanceMetrics.batchedOperations += batch.length;
    console.log(`✅ [批处理完成] 处理了 ${batch.length} 个操作`);
    
    return results;
  }

  /**
   * 处理待执行操作
   */
  async processPendingOperations() {
    if (this.state.pendingOperations.length === 0) return;
    
    console.log(`🔄 [待执行处理] 开始处理 ${this.state.pendingOperations.length} 个待执行操作`);
    
    const operations = [...this.state.pendingOperations];
    this.state.pendingOperations = [];
    
    // 按时间戳排序，确保执行顺序
    operations.sort((a, b) => a.timestamp - b.timestamp);
    
    for (const operation of operations) {
      try {
        const result = await this.executeWithMonitoring(
          operation.function,
          operation.context,
          operation.options,
          operation.id
        );
        
        if (operation.resolve) {
          operation.resolve(result);
        }
      } catch (error) {
        if (operation.reject) {
          operation.reject(error);
        }
        console.error(`❌ [待执行失败] 操作 ${operation.id} 执行失败:`, error);
      }
    }
    
    console.log(`✅ [待执行完成] 处理了 ${operations.length} 个待执行操作`);
  }

  /**
   * 带监控的执行
   */
  async executeWithMonitoring(layoutFunction, context, options, operationId) {
    const startTime = performance.now();
    
    try {
      console.log(`⚡ [执行监控] 开始执行 - ID: ${operationId}`);
      
      const result = await layoutFunction.call(context, options);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`✅ [执行完成] ID: ${operationId}, 耗时: ${executionTime.toFixed(2)}ms`);
      
      this.state.performanceMetrics.totalOperations++;
      this.updatePerformanceMetrics(executionTime);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.error(`❌ [执行失败] ID: ${operationId}, 耗时: ${executionTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * 优化批处理操作 - 主要的批处理优化入口
   * @param {Function} operation - 要执行的操作
   * @param {Object} context - 执行上下文
   * @param {Object} options - 执行选项
   * @returns {Promise} 执行结果
   */
  async optimizeBatchOperation(operation, context = {}, options = {}) {
    console.log('📦 [批处理优化] 开始优化批处理操作');
    
    try {
      // 使用现有的优化布局执行方法
      return await this.optimizeLayoutExecution(operation, context, options);
    } catch (error) {
      console.error('❌ [批处理优化] 批处理操作失败:', error);
      throw error;
    }
  }

  /**
   * 优化预览线更新
   * @param {Function} updateFunction - 更新函数
   * @param {Object} context - 上下文
   * @returns {Function} 优化后的函数
   */
  optimizePreviewLineUpdates(updateFunction, context = {}) {
    if (!this.config.enablePreviewLineThrottling) {
      return updateFunction;
    }

    const throttleKey = `previewLine_${context.nodeId || 'global'}`;
    
    if (this.throttledFunctions.has(throttleKey)) {
      return this.throttledFunctions.get(throttleKey);
    }

    let updateCount = 0;
    let lastUpdateTime = 0;
    
    const throttledFunction = (...args) => {
      const now = Date.now();
      
      // 检查更新频率限制
      if (updateCount >= this.config.maxPreviewLineUpdates && 
          now - lastUpdateTime < this.config.previewLineUpdateDelay) {
        console.log(`🚫 [预览线限流] 跳过更新，已达到频率限制`);
        this.state.performanceMetrics.skippedOperations++;
        return;
      }
      
      // 重置计数器
      if (now - lastUpdateTime > this.config.previewLineUpdateDelay * 2) {
        updateCount = 0;
      }
      
      updateCount++;
      lastUpdateTime = now;
      
      console.log(`🔄 [预览线更新] 执行更新 (${updateCount}/${this.config.maxPreviewLineUpdates})`);
      return updateFunction.apply(context, args);
    };
    
    this.throttledFunctions.set(throttleKey, throttledFunction);
    return throttledFunction;
  }

  /**
   * 检查缓存
   */
  checkCache(layoutFunction, context, options) {
    if (!this.config.enableSmartCache) return null;
    
    const cacheKey = this.generateCacheKey(layoutFunction, context, options);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
      return cached.result;
    }
    
    // 清理过期缓存
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * 缓存结果
   */
  cacheResult(layoutFunction, context, options, result) {
    if (!this.config.enableSmartCache) return;
    
    const cacheKey = this.generateCacheKey(layoutFunction, context, options);
    this.cache.set(cacheKey, {
      result: JSON.parse(JSON.stringify(result)), // 深拷贝
      timestamp: Date.now()
    });
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(layoutFunction, context, options) {
    const functionName = layoutFunction.name || 'anonymous';
    const contextHash = JSON.stringify(context);
    const optionsHash = JSON.stringify(options);
    
    return `${functionName}_${this.hashString(contextHash)}_${this.hashString(optionsHash)}`;
  }

  /**
   * 字符串哈希
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(36);
  }

  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(executionTime) {
    const metrics = this.state.performanceMetrics;
    
    // 更新平均执行时间
    metrics.averageExecutionTime = 
      (metrics.averageExecutionTime * (metrics.totalOperations - 1) + executionTime) / 
      metrics.totalOperations;
  }

  /**
   * 生成操作ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      ...this.state.performanceMetrics,
      pendingOperations: this.state.pendingOperations.length,
      queuedOperations: this.state.executionQueue.length,
      cacheSize: this.cache.size,
      isInitialLoad: this.state.isInitialLoad
    };
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 清理定时器
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // 清理缓存
    this.cache.clear();
    
    // 清理节流函数
    this.throttledFunctions.clear();
    
    console.log('🧹 [性能优化器] 资源清理完成');
  }

  /**
   * 重置优化器状态
   */
  reset() {
    this.cleanup();
    
    this.state = {
      isInitialLoad: true,
      pendingOperations: [],
      executionQueue: [],
      lastExecutionTime: 0,
      performanceMetrics: {
        totalOperations: 0,
        skippedOperations: 0,
        batchedOperations: 0,
        cacheHits: 0,
        averageExecutionTime: 0
      }
    };
    
    console.log('🔄 [性能优化器] 状态重置完成');
  }
}

export default PerformanceOptimizer;