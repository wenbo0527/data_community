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
      
      // 预览线优化 - 增强防抖和节流
      enablePreviewLineThrottling: true,
      previewLineUpdateDelay: 500, // 增加到500ms，减少频繁更新
      maxPreviewLineUpdates: 1, // 减少到1次，避免频繁触发
      
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
    
    // 确保pendingOperations存在且为数组
    if (!this.state.pendingOperations || !Array.isArray(this.state.pendingOperations)) {
      this.state.pendingOperations = [];
    }
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
    
    // 检查是否有相同的操作已在队列中（去重优化）
    const operationHash = this.hashString(JSON.stringify({
      functionName: layoutFunction.name,
      context: context,
      options: options
    }));
    
    // 确保state和executionQueue存在且为数组
    const safeExecutionQueue = (this.state && Array.isArray(this.state.executionQueue)) ? this.state.executionQueue : [];
    const existingOperation = safeExecutionQueue.find(op => {
      if (!op || !op.function) return false;
      const existingHash = this.hashString(JSON.stringify({
        functionName: op.function.name,
        context: op.context,
        options: op.options
      }));
      return existingHash === operationHash;
    });
    
    if (existingOperation) {
      console.log(`🔄 [批处理去重] 发现重复操作，复用现有Promise - ID: ${operationId}`);
      this.state.performanceMetrics.skippedOperations++;
      
      // 返回现有操作的Promise
      return new Promise((resolve, reject) => {
        const originalResolve = existingOperation.resolve;
        const originalReject = existingOperation.reject;
        
        existingOperation.resolve = (result) => {
          if (originalResolve) originalResolve(result);
          resolve(result);
        };
        
        existingOperation.reject = (error) => {
          if (originalReject) originalReject(error);
          reject(error);
        };
      });
    }
    
    // 确保executionQueue存在且为数组
    if (!this.state.executionQueue || !Array.isArray(this.state.executionQueue)) {
      this.state.executionQueue = [];
    }
    this.state.executionQueue.push(operation);
    
    // 返回Promise等待批处理执行
    const promise = new Promise((resolve, reject) => {
      operation.resolve = resolve;
      operation.reject = reject;
    });
    
    // 如果队列达到批处理大小，立即执行
    const currentQueueLength = (this.state.executionQueue && Array.isArray(this.state.executionQueue)) ? this.state.executionQueue.length : 0;
    if (currentQueueLength >= this.config.batchSize) {
      // 清除现有的延迟执行定时器，避免重复执行
      if (this.timers.has('batchExecution')) {
        clearTimeout(this.timers.get('batchExecution'));
        this.timers.delete('batchExecution');
      }
      
      console.log(`🚀 [批处理] 队列已满(${this.config.batchSize})，立即执行批处理`);
      this.processBatch();
      return promise;
    }
    
    // 否则设置延迟执行（仅在没有定时器时设置）
    if (!this.timers.has('batchExecution')) {
      const timer = setTimeout(() => {
        console.log(`⏰ [批处理] 延迟时间到达，执行批处理`);
        this.processBatch();
        this.timers.delete('batchExecution');
      }, this.config.batchDelay);
      
      this.timers.set('batchExecution', timer);
    }
    
    return promise;
  }

  /**
   * 处理批处理
   */
  async processBatch() {
    // 确保state和executionQueue存在且为数组
    const safeExecutionQueue = (this.state && Array.isArray(this.state.executionQueue)) ? this.state.executionQueue : [];
    if (safeExecutionQueue.length === 0) {
      console.log(`⚠️ [批处理] 队列为空，跳过执行`);
      return;
    }
    
    console.log(`🔄 [批处理执行] 开始处理 ${safeExecutionQueue.length} 个操作`);
    
    const batch = [...safeExecutionQueue];
    if (this.state) {
      this.state.executionQueue = [];
    }
    
    // 清除批处理定时器
    if (this.timers.has('batchExecution')) {
      clearTimeout(this.timers.get('batchExecution'));
      this.timers.delete('batchExecution');
    }
    
    try {
      // 并行执行批处理操作
      let results = [];
      try {
        const safeBatchForMapping = Array.isArray(batch) ? batch : [];
        results = await Promise.allSettled(
          safeBatchForMapping.map(async (operation) => {
            if (!operation || !operation.function) {
              console.warn(`⚠️ [批处理] 跳过无效操作:`, operation);
              return null;
            }
            
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
              console.error(`❌ [批处理操作失败] ID: ${operation.id}:`, error);
              if (operation.reject) {
                operation.reject(error);
              }
              throw error;
            }
          })
        );
      } catch (error) {
        console.error(`❌ [Promise.allSettled执行失败]:`, error);
        results = [];
      }
      
      this.state.performanceMetrics.batchedOperations += batch.length;
      
      // 统计成功和失败的操作 - 增强空值检查
      const safeResults = Array.isArray(results) ? results : [];
      const successful = safeResults.filter(r => r && typeof r === 'object' && r.status === 'fulfilled').length;
      const failed = safeResults.filter(r => r && typeof r === 'object' && r.status === 'rejected').length;
      
      console.log(`✅ [批处理完成] 处理了 ${batch.length} 个操作 (成功: ${successful}, 失败: ${failed})`);
      
      return results;
    } catch (error) {
      console.error(`❌ [批处理执行失败]:`, error);
      
      // 确保所有操作的Promise都被拒绝
      const safeBatch = Array.isArray(batch) ? batch : [];
      safeBatch.forEach(operation => {
        if (operation && operation.reject) {
          operation.reject(error);
        }
      });
      
      throw error;
    }
  }

  /**
   * 处理待执行操作
   */
  async processPendingOperations() {
    // 确保state和pendingOperations存在且为数组
    const safePendingOperations = (this.state && Array.isArray(this.state.pendingOperations)) ? this.state.pendingOperations : [];
    if (safePendingOperations.length === 0) return;
    
    console.log(`🔄 [待执行处理] 开始处理 ${safePendingOperations.length} 个待执行操作`);
    
    const operations = [...safePendingOperations];
    if (this.state) {
      this.state.pendingOperations = [];
    }
    
    // 按时间戳排序，确保执行顺序
    const safeOperations = Array.isArray(operations) ? operations : [];
    safeOperations.sort((a, b) => {
      const aTime = (a && typeof a.timestamp === 'number') ? a.timestamp : 0;
      const bTime = (b && typeof b.timestamp === 'number') ? b.timestamp : 0;
      return aTime - bTime;
    });
    
    for (const operation of safeOperations) {
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
    
    console.log(`✅ [待执行完成] 处理了 ${safeOperations.length} 个待执行操作`);
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
   * 🛡️ 预览线坐标安全验证
   * @param {Array} args - 函数参数
   * @returns {boolean} 是否通过验证
   */
  validatePreviewLineCoordinates(args) {
    if (!args || args.length === 0) return true;
    
    // 检查参数中是否包含坐标信息
    for (const arg of args) {
      if (arg && typeof arg === 'object') {
        // 检查位置参数
        if (arg.position || arg.x !== undefined || arg.y !== undefined) {
          const position = arg.position || { x: arg.x, y: arg.y };
          
          // 坐标有效性检查
          if (position.x !== undefined && position.y !== undefined) {
            if (typeof position.x !== 'number' || typeof position.y !== 'number' ||
                isNaN(position.x) || isNaN(position.y)) {
              console.error(`❌ [坐标验证] 无效的坐标类型:`, position);
              return false;
            }
            
            // 坐标范围检查
            const maxCoordinate = 50000;
            if (Math.abs(position.x) > maxCoordinate || Math.abs(position.y) > maxCoordinate) {
              console.error(`❌ [坐标验证] 坐标超出合理范围:`, position);
              return false;
            }
            
            // 坐标精度检查（避免过于精确的浮点数）
            if (position.x % 1 !== 0 && position.x.toString().split('.')[1]?.length > 2) {
              console.warn(`⚠️ [坐标验证] X坐标精度过高，可能存在计算误差: ${position.x}`);
            }
            if (position.y % 1 !== 0 && position.y.toString().split('.')[1]?.length > 2) {
              console.warn(`⚠️ [坐标验证] Y坐标精度过高，可能存在计算误差: ${position.y}`);
            }
          }
        }
      }
    }
    
    return true;
  }

  /**
   * 优化预览线更新
   * @param {Function} updateFunction - 更新函数
   * @param {Object} context - 上下文
   * @returns {Function} 优化后的函数
   */
  optimizePreviewLineUpdates(updateFunction, context = {}) {
    if (!this.config.enablePreviewLineThrottling) {
      // 即使不启用节流，也要添加坐标验证
      return (...args) => {
        if (!this.validatePreviewLineCoordinates(args)) {
          console.error(`❌ [预览线更新] 坐标验证失败，跳过更新`);
          this.state.performanceMetrics.skippedOperations++;
          return;
        }
        return updateFunction.apply(context, args);
      };
    }

    const throttleKey = `previewLine_${context.nodeId || 'global'}`;
    
    if (this.throttledFunctions.has(throttleKey)) {
      return this.throttledFunctions.get(throttleKey);
    }

    let updateCount = 0;
    let lastUpdateTime = 0;
    const coordinateHistory = new Map(); // 记录坐标历史，检测异常变化
    
    const throttledFunction = (...args) => {
      const now = Date.now();
      
      // 🛡️ 坐标安全验证
      if (!this.validatePreviewLineCoordinates(args)) {
        console.error(`❌ [预览线更新] 坐标验证失败，跳过更新`);
        this.state.performanceMetrics.skippedOperations++;
        return;
      }
      
      // 🛡️ 坐标变化异常检测
      const nodeId = context.nodeId || 'global';
      if (args.length > 0 && args[0] && typeof args[0] === 'object') {
        const currentPos = args[0].position || { x: args[0].x, y: args[0].y };
        if (currentPos.x !== undefined && currentPos.y !== undefined) {
          const lastPos = coordinateHistory.get(nodeId);
          if (lastPos) {
            const distance = Math.sqrt(
              Math.pow(currentPos.x - lastPos.x, 2) + 
              Math.pow(currentPos.y - lastPos.y, 2)
            );
            
            // 检测异常大的坐标变化（可能是计算错误）
            const maxReasonableMove = 1000; // 单次移动的最大合理距离
            if (distance > maxReasonableMove) {
              console.warn(`⚠️ [坐标异常] 检测到异常大的坐标变化: ${distance.toFixed(2)}px，可能存在计算错误`);
              console.warn(`⚠️ [坐标异常] 从 (${lastPos.x}, ${lastPos.y}) 到 (${currentPos.x}, ${currentPos.y})`);
              
              // 可以选择跳过这次更新或使用渐进式更新
              if (distance > maxReasonableMove * 2) {
                console.error(`❌ [坐标异常] 坐标变化过大，跳过此次更新`);
                this.state.performanceMetrics.skippedOperations++;
                return;
              }
            }
          }
          coordinateHistory.set(nodeId, { x: currentPos.x, y: currentPos.y, timestamp: now });
        }
      }
      
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
      
      try {
        return updateFunction.apply(context, args);
      } catch (error) {
        console.error(`❌ [预览线更新] 更新执行失败:`, error);
        this.state.performanceMetrics.skippedOperations++;
        throw error;
      }
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
      result: this.safeDeepCopy(result), // 安全的深拷贝
      timestamp: Date.now()
    });
  }

  /**
   * 安全的深拷贝，处理循环引用
   */
  safeDeepCopy(obj, maxDepth = 5) {
    const seen = new WeakMap();
    
    const copy = (value, depth = 0) => {
      // 限制递归深度
      if (depth > maxDepth) {
        return '[Max Depth Reached]';
      }
      
      // 处理基本类型
      if (value === null || value === undefined || typeof value !== 'object') {
        return value;
      }
      
      // 检测循环引用
      if (seen.has(value)) {
        return seen.get(value);
      }
      
      // 处理特殊对象类型
      if (value instanceof Date) {
        return new Date(value.getTime());
      }
      
      if (value instanceof RegExp) {
        return new RegExp(value.source, value.flags);
      }
      
      // 跳过函数、DOM元素等不可序列化的对象
      if (typeof value === 'function' || value instanceof Element) {
        return null;
      }
      
      // 跳过可能导致循环引用的属性
      if (value.layoutEngine || value.previewLineManager || 
          value.graph || value.canvas || value.parent) {
        return '[Circular Reference Skipped]';
      }
      
      let result;
      
      // 处理数组
      if (Array.isArray(value)) {
        result = [];
        seen.set(value, result);
        
        for (let i = 0; i < value.length; i++) {
          try {
            result[i] = copy(value[i], depth + 1);
          } catch (error) {
            result[i] = '[Copy Error]';
          }
        }
      } else {
        // 处理普通对象
        result = {};
        seen.set(value, result);
        
        for (const [key, val] of Object.entries(value)) {
          try {
            // 跳过一些可能导致问题的属性
            if (key === 'layoutEngine' || key === 'previewLineManager' || 
                key === 'graph' || key === 'canvas' || key === 'parent') {
              result[key] = '[Skipped: Circular Reference Risk]';
              continue;
            }
            result[key] = copy(val, depth + 1);
          } catch (error) {
            result[key] = '[Copy Error]';
          }
        }
      }
      
      return result;
    };
    
    try {
      return copy(obj);
    } catch (error) {
      console.warn('⚠️ [性能优化器] 深拷贝失败，返回原始对象:', error.message);
      return obj;
    }
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(layoutFunction, context, options) {
    const functionName = layoutFunction.name || 'anonymous';
    
    // 安全的JSON序列化，处理循环引用
    const contextHash = this.safeStringify(context);
    const optionsHash = this.safeStringify(options);
    
    return `${functionName}_${this.hashString(contextHash)}_${this.hashString(optionsHash)}`;
  }

  /**
   * 安全的JSON序列化，处理循环引用
   */
  safeStringify(obj, maxDepth = 3) {
    const seen = new WeakSet();
    
    const replacer = (key, value, depth = 0) => {
      // 限制递归深度
      if (depth > maxDepth) {
        return '[Max Depth Reached]';
      }
      
      // 处理null和undefined
      if (value === null || value === undefined) {
        return value === null ? 'null' : 'undefined';
      }
      
      // 处理基本类型
      if (typeof value !== 'object') {
        return value;
      }
      
      // 检测循环引用
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      
      // 处理特殊对象类型
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      if (value instanceof RegExp) {
        return value.toString();
      }
      
      // 处理函数
      if (typeof value === 'function') {
        return `[Function: ${value.name || 'anonymous'}]`;
      }
      
      // 处理DOM元素
      if (value instanceof Element) {
        return `[Element: ${value.tagName}]`;
      }
      
      // 处理Map和Set
      if (value instanceof Map) {
        return `[Map: ${value.size} entries]`;
      }
      
      if (value instanceof Set) {
        return `[Set: ${value.size} entries]`;
      }
      
      // 跳过可能导致循环引用的属性（在标记seen之前检查）
      if (key === 'layoutEngine' || key === 'previewLineManager' || 
          key === 'graph' || key === 'canvas' || key === 'parent' ||
          key === '_previewLineManagerRef' || key === '_layoutEngineRef' ||
          key === 'performanceOptimizer') {
        return '[Skipped: Circular Reference Risk]';
      }
      
      // 标记已访问的对象
      seen.add(value);
      
      let result;
      
      try {
        // 处理数组
        if (Array.isArray(value)) {
          result = value.map((item, index) => {
            try {
              return replacer(index.toString(), item, depth + 1);
            } catch (error) {
              return '[Serialization Error]';
            }
          });
        } else {
          // 处理普通对象
          result = {};
          for (const [k, v] of Object.entries(value)) {
            try {
              result[k] = replacer(k, v, depth + 1);
            } catch (error) {
              result[k] = '[Serialization Error]';
            }
          }
        }
      } catch (error) {
        result = '[Object Serialization Error]';
      }
      
      // 处理完成后从seen中移除
      seen.delete(value);
      return result;
    };
    
    try {
      return JSON.stringify(obj, (key, value) => replacer(key, value));
    } catch (error) {
      console.warn('⚠️ [性能优化器] JSON序列化失败，使用备用方案:', error.message);
      return `[Serialization Failed: ${error.message}]`;
    }
  }

  /**
   * 字符串哈希
   */
  hashString(str) {
    // 🔧 增强参数验证：处理各种边界情况
    if (str === null || str === undefined) {
      console.warn('⚠️ [性能优化器] hashString接收到null/undefined参数，使用默认值');
      return '0';
    }
    
    // 确保str是字符串类型
    if (typeof str !== 'string') {
      try {
        str = String(str);
      } catch (error) {
        console.warn('⚠️ [性能优化器] hashString参数转换失败，使用默认值:', error.message);
        return '0';
      }
    }
    
    // 🔧 新增：处理空字符串
    if (str.length === 0) {
      return '0';
    }
    
    // 🔧 新增：处理超长字符串（避免性能问题）
    if (str.length > 10000) {
      // 使用调试级别日志，避免在正常使用中产生警告
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 [性能优化器] 处理超长字符串(${str.length}字符)，使用智能采样优化`);
      }
      // 使用智能采样策略：取开头、中间、结尾的片段
      const start = str.substring(0, 3000);
      const middle = str.substring(Math.floor(str.length / 2) - 1500, Math.floor(str.length / 2) + 1500);
      const end = str.substring(str.length - 3000);
      str = start + middle + end + `_len${str.length}`;
    }
    
    let hash = 0;
    try {
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
      }
      return hash.toString(36);
    } catch (error) {
      console.warn('⚠️ [性能优化器] hashString计算失败，使用备用方案:', error.message);
      // 备用方案：使用简单的字符串长度和首字符
      return `${str.length}_${str.charCodeAt(0) || 0}`.toString();
    }
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
    // 确保state和相关数组存在
    const safePendingOperations = (this.state && Array.isArray(this.state.pendingOperations)) ? this.state.pendingOperations : [];
    const safeExecutionQueue = (this.state && Array.isArray(this.state.executionQueue)) ? this.state.executionQueue : [];
    const safeMetrics = (this.state && this.state.performanceMetrics) ? this.state.performanceMetrics : {
      totalOperations: 0,
      skippedOperations: 0,
      batchedOperations: 0,
      cacheHits: 0,
      averageExecutionTime: 0
    };
    
    return {
      ...safeMetrics,
      pendingOperations: safePendingOperations.length,
      queuedOperations: safeExecutionQueue.length,
      cacheSize: this.cache ? this.cache.size : 0,
      isInitialLoad: this.state ? this.state.isInitialLoad : true
    };
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 清理定时器
    (this.timers || new Set()).forEach(timer => clearTimeout(timer));
    if (this.timers) {
      this.timers.clear();
    }
    
    // 清理缓存
    if (this.cache) {
      this.cache.clear();
    }
    
    // 清理节流函数
    if (this.throttledFunctions) {
      this.throttledFunctions.clear();
    }
    
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