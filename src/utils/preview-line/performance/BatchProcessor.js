/**
 * 批量处理器
 * 用于优化预览线系统中的批量操作性能，减少频繁的DOM操作和计算
 */

export class BatchProcessor {
  constructor(options = {}) {
    this.options = {
      // 批量配置
      batchSize: 50,           // 批量大小
      batchDelay: 16,          // 批量延迟（毫秒，约60fps）
      maxBatchDelay: 100,      // 最大批量延迟
      
      // 性能配置
      enableDebug: false,
      enableStats: true,
      enablePriority: true,    // 启用优先级处理
      
      // 队列配置
      maxQueueSize: 1000,      // 最大队列大小
      enableDeduplication: true, // 启用去重
      
      ...options
    };
    
    // 操作队列
    this.queues = {
      high: [],      // 高优先级队列
      normal: [],    // 普通优先级队列
      low: []        // 低优先级队列
    };
    
    // 去重映射
    this.deduplicationMap = new Map(); // operationKey -> queueItem
    
    // 批量处理定时器
    this.batchTimer = null;
    this.isProcessing = false;
    
    // 性能统计
    this.stats = {
      totalOperations: 0,
      batchedOperations: 0,
      batchCount: 0,
      averageBatchSize: 0,
      averageProcessTime: 0,
      queueOverflows: 0,
      deduplicationHits: 0,
      lastProcessTime: 0
    };
    
    // 操作处理器映射
    this.processors = new Map();
    
    console.log('🚀 [BatchProcessor] 初始化完成', {
      batchSize: this.options.batchSize,
      batchDelay: this.options.batchDelay,
      enablePriority: this.options.enablePriority
    });
  }
  
  /**
   * 注册操作处理器
   * @param {string} operationType - 操作类型
   * @param {Function} processor - 处理器函数
   */
  registerProcessor(operationType, processor) {
    if (typeof processor !== 'function') {
      throw new Error(`处理器必须是函数: ${operationType}`);
    }
    
    this.processors.set(operationType, processor);
    
    if (this.options.enableDebug) {
      console.log(`✅ [BatchProcessor] 注册处理器: ${operationType}`);
    }
  }
  
  /**
   * 添加操作到批量队列
   * @param {string} operationType - 操作类型
   * @param {Object} operationData - 操作数据
   * @param {Object} options - 选项
   */
  addOperation(operationType, operationData, options = {}) {
    const {
      priority = 'normal',
      deduplicationKey = null,
      immediate = false
    } = options;
    
    try {
      // 检查处理器是否存在
      if (!this.processors.has(operationType)) {
        console.warn(`⚠️ [BatchProcessor] 未找到处理器: ${operationType}`);
        return false;
      }
      
      // 检查队列大小限制
      const totalQueueSize = this.getTotalQueueSize();
      if (totalQueueSize >= this.options.maxQueueSize) {
        this.stats.queueOverflows++;
        console.warn(`⚠️ [BatchProcessor] 队列已满，丢弃操作: ${operationType}`);
        return false;
      }
      
      // 创建操作项
      const operationItem = {
        id: this.generateOperationId(),
        type: operationType,
        data: operationData,
        priority,
        timestamp: Date.now(),
        deduplicationKey
      };
      
      // 处理去重
      if (this.options.enableDeduplication && deduplicationKey) {
        const existingItem = this.deduplicationMap.get(deduplicationKey);
        if (existingItem) {
          // 更新现有操作的数据
          existingItem.data = operationData;
          existingItem.timestamp = Date.now();
          this.stats.deduplicationHits++;
          
          if (this.options.enableDebug) {
            console.log(`🔄 [BatchProcessor] 去重更新操作: ${deduplicationKey}`);
          }
          return true;
        }
        
        this.deduplicationMap.set(deduplicationKey, operationItem);
      }
      
      // 添加到相应优先级队列
      if (!this.queues[priority]) {
        console.warn(`⚠️ [BatchProcessor] 无效的优先级: ${priority}，使用normal`);
        priority = 'normal';
      }
      
      this.queues[priority].push(operationItem);
      this.stats.totalOperations++;
      
      // 立即处理或调度批量处理
      if (immediate) {
        this.processImmediate(operationItem);
      } else {
        this.scheduleBatchProcess();
      }
      
      if (this.options.enableDebug) {
        console.log(`➕ [BatchProcessor] 添加操作: ${operationType}`, {
          priority,
          queueSize: this.queues[priority].length,
          totalQueue: this.getTotalQueueSize()
        });
      }
      
      return true;
    } catch (error) {
      console.error(`❌ [BatchProcessor] 添加操作失败: ${operationType}`, error);
      return false;
    }
  }
  
  /**
   * 立即处理单个操作
   * @param {Object} operationItem - 操作项
   */
  async processImmediate(operationItem) {
    try {
      const processor = this.processors.get(operationItem.type);
      if (processor) {
        await processor([operationItem.data]);
        
        // 从去重映射中移除
        if (operationItem.deduplicationKey) {
          this.deduplicationMap.delete(operationItem.deduplicationKey);
        }
        
        if (this.options.enableDebug) {
          console.log(`⚡ [BatchProcessor] 立即处理完成: ${operationItem.type}`);
        }
      }
    } catch (error) {
      console.error(`❌ [BatchProcessor] 立即处理失败: ${operationItem.type}`, error);
    }
  }
  
  /**
   * 调度批量处理
   */
  scheduleBatchProcess() {
    if (this.batchTimer || this.isProcessing) {
      return;
    }
    
    // 检查是否需要立即处理（队列过大或延迟过长）
    const totalQueueSize = this.getTotalQueueSize();
    const shouldProcessImmediately = 
      totalQueueSize >= this.options.batchSize ||
      this.getOldestOperationAge() >= this.options.maxBatchDelay;
    
    const delay = shouldProcessImmediately ? 0 : this.options.batchDelay;
    
    this.batchTimer = setTimeout(() => {
      this.batchTimer = null;
      this.processBatch();
    }, delay);
  }
  
  /**
   * 处理批量操作
   */
  async processBatch() {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    const startTime = performance.now();
    
    try {
      // 收集要处理的操作
      const operationsToProcess = this.collectOperations();
      
      if (operationsToProcess.length === 0) {
        return;
      }
      
      // 按操作类型分组
      const operationGroups = this.groupOperationsByType(operationsToProcess);
      
      // 并行处理不同类型的操作
      const processingPromises = [];
      
      for (const [operationType, operations] of operationGroups) {
        const processor = this.processors.get(operationType);
        if (processor) {
          const promise = this.processOperationGroup(operationType, operations, processor);
          processingPromises.push(promise);
        }
      }
      
      // 等待所有处理完成
      await Promise.all(processingPromises);
      
      // 更新统计
      this.updateBatchStats(operationsToProcess.length, performance.now() - startTime);
      
      if (this.options.enableDebug) {
        console.log(`📦 [BatchProcessor] 批量处理完成`, {
          operationCount: operationsToProcess.length,
          groupCount: operationGroups.size,
          duration: performance.now() - startTime
        });
      }
      
      // 如果还有操作在队列中，继续调度
      if (this.getTotalQueueSize() > 0) {
        this.scheduleBatchProcess();
      }
      
    } catch (error) {
      console.error('❌ [BatchProcessor] 批量处理失败', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * 收集要处理的操作
   * @returns {Array} 操作列表
   */
  collectOperations() {
    const operations = [];
    const maxBatchSize = this.options.batchSize;
    
    // 按优先级收集操作
    const priorities = this.options.enablePriority ? ['high', 'normal', 'low'] : ['normal'];
    
    for (const priority of priorities) {
      const queue = this.queues[priority];
      while (queue.length > 0 && operations.length < maxBatchSize) {
        const operation = queue.shift();
        operations.push(operation);
        
        // 从去重映射中移除
        if (operation.deduplicationKey) {
          this.deduplicationMap.delete(operation.deduplicationKey);
        }
      }
      
      if (operations.length >= maxBatchSize) {
        break;
      }
    }
    
    return operations;
  }
  
  /**
   * 按操作类型分组
   * @param {Array} operations - 操作列表
   * @returns {Map} 分组后的操作映射
   */
  groupOperationsByType(operations) {
    const groups = new Map();
    
    operations.forEach(operation => {
      if (!groups.has(operation.type)) {
        groups.set(operation.type, []);
      }
      groups.get(operation.type).push(operation);
    });
    
    return groups;
  }
  
  /**
   * 处理操作组
   * @param {string} operationType - 操作类型
   * @param {Array} operations - 操作列表
   * @param {Function} processor - 处理器函数
   */
  async processOperationGroup(operationType, operations, processor) {
    try {
      const operationData = operations.map(op => op.data);
      await processor(operationData);
      
      this.stats.batchedOperations += operations.length;
      
      if (this.options.enableDebug) {
        console.log(`✅ [BatchProcessor] 处理操作组: ${operationType}`, {
          count: operations.length
        });
      }
    } catch (error) {
      console.error(`❌ [BatchProcessor] 处理操作组失败: ${operationType}`, error);
      
      // 尝试单独处理每个操作
      for (const operation of operations) {
        try {
          await processor([operation.data]);
          this.stats.batchedOperations++;
        } catch (individualError) {
          console.error(`❌ [BatchProcessor] 单独处理失败: ${operationType}`, individualError);
        }
      }
    }
  }
  
  /**
   * 强制处理所有队列中的操作
   */
  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    while (this.getTotalQueueSize() > 0 && !this.isProcessing) {
      await this.processBatch();
    }
    
    // 等待当前处理完成
    while (this.isProcessing) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  /**
   * 清空所有队列
   */
  clear() {
    Object.values(this.queues).forEach(queue => queue.length = 0);
    this.deduplicationMap.clear();
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    if (this.options.enableDebug) {
      console.log('🗑️ [BatchProcessor] 清空所有队列');
    }
  }
  
  /**
   * 获取总队列大小
   * @returns {number} 总队列大小
   */
  getTotalQueueSize() {
    return Object.values(this.queues).reduce((total, queue) => total + queue.length, 0);
  }
  
  /**
   * 获取最旧操作的年龄
   * @returns {number} 年龄（毫秒）
   */
  getOldestOperationAge() {
    let oldestTimestamp = Date.now();
    
    Object.values(this.queues).forEach(queue => {
      if (queue.length > 0) {
        oldestTimestamp = Math.min(oldestTimestamp, queue[0].timestamp);
      }
    });
    
    return Date.now() - oldestTimestamp;
  }
  
  /**
   * 生成操作ID
   * @returns {string} 操作ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 更新批量处理统计
   * @param {number} operationCount - 操作数量
   * @param {number} processTime - 处理时间
   */
  updateBatchStats(operationCount, processTime) {
    this.stats.batchCount++;
    this.stats.lastProcessTime = Date.now();
    
    // 更新平均批量大小
    this.stats.averageBatchSize = 
      (this.stats.averageBatchSize * (this.stats.batchCount - 1) + operationCount) / this.stats.batchCount;
    
    // 更新平均处理时间
    this.stats.averageProcessTime = 
      (this.stats.averageProcessTime * (this.stats.batchCount - 1) + processTime) / this.stats.batchCount;
  }
  
  /**
   * 获取队列状态
   * @returns {Object} 队列状态
   */
  getQueueStatus() {
    return {
      high: this.queues.high.length,
      normal: this.queues.normal.length,
      low: this.queues.low.length,
      total: this.getTotalQueueSize(),
      isProcessing: this.isProcessing,
      hasPendingBatch: !!this.batchTimer,
      oldestOperationAge: this.getOldestOperationAge()
    };
  }
  
  /**
   * 获取性能统计
   * @returns {Object} 性能统计
   */
  getStats() {
    return {
      ...this.stats,
      queueStatus: this.getQueueStatus(),
      deduplicationMapSize: this.deduplicationMap.size,
      processorCount: this.processors.size,
      batchEfficiency: this.stats.totalOperations > 0 ? 
        this.stats.batchedOperations / this.stats.totalOperations : 0
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalOperations: 0,
      batchedOperations: 0,
      batchCount: 0,
      averageBatchSize: 0,
      averageProcessTime: 0,
      queueOverflows: 0,
      deduplicationHits: 0,
      lastProcessTime: 0
    };
  }
  
  /**
   * 销毁批量处理器
   */
  destroy() {
    // 清理定时器
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    // 清理队列和映射
    this.clear();
    this.processors.clear();
    
    console.log('🗑️ [BatchProcessor] 已销毁');
  }
}

export default BatchProcessor;