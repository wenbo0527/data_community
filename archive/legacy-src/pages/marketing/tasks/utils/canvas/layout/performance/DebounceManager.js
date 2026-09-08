/**
 * 防抖管理器
 * 负责布局操作的防抖处理，避免频繁的布局计算
 */

export class DebounceManager {
  constructor(config = {}) {
    this.defaultDelay = config.defaultDelay || 300; // 默认防抖延迟300ms
    this.timers = new Map(); // 存储不同操作的定时器
    this.pendingOperations = new Map(); // 存储待执行的操作
    this.operationCounts = new Map(); // 统计各操作的调用次数
    this.executionCounts = new Map(); // 统计各操作的实际执行次数
    
    console.log(`⏱️ [防抖管理器] 初始化完成，默认延迟: ${this.defaultDelay}ms`);
  }

  /**
   * 防抖执行函数
   * @param {string} operationId - 操作标识符
   * @param {Function} fn - 要执行的函数
   * @param {number} delay - 防抖延迟时间（毫秒）
   * @param {Object} context - 函数执行上下文
   * @returns {Promise} 执行结果的Promise
   */
  debounce(operationId, fn, delay = this.defaultDelay, context = null) {
    // 统计操作调用次数
    this.operationCounts.set(operationId, (this.operationCounts.get(operationId) || 0) + 1);
    
    return new Promise((resolve, reject) => {
      // 清除之前的定时器
      if (this.timers.has(operationId)) {
        clearTimeout(this.timers.get(operationId));
        console.log(`🔄 [防抖管理器] 重置防抖定时器: ${operationId}`);
      }

      // 存储待执行的操作
      this.pendingOperations.set(operationId, {
        fn,
        context,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // 设置新的定时器
      const timerId = setTimeout(async () => {
        try {
          const operation = this.pendingOperations.get(operationId);
          if (operation) {
            console.log(`▶️ [防抖管理器] 执行防抖操作: ${operationId}`);
            
            // 统计实际执行次数
            this.executionCounts.set(operationId, (this.executionCounts.get(operationId) || 0) + 1);
            
            // 执行函数
            const result = context ? await operation.fn.call(context) : await operation.fn();
            operation.resolve(result);
            
            // 清理
            this.cleanup(operationId);
          }
        } catch (error) {
          console.error(`❌ [防抖管理器] 执行失败: ${operationId}`, error);
          const operation = this.pendingOperations.get(operationId);
          if (operation) {
            operation.reject(error);
          }
          this.cleanup(operationId);
        }
      }, delay);

      this.timers.set(operationId, timerId);
      console.log(`⏰ [防抖管理器] 设置防抖定时器: ${operationId}, 延迟: ${delay}ms`);
    });
  }

  /**
   * 立即执行指定操作（跳过防抖）
   * @param {string} operationId - 操作标识符
   * @returns {Promise} 执行结果的Promise
   */
  async executeImmediately(operationId) {
    const operation = this.pendingOperations.get(operationId);
    if (!operation) {
      console.warn(`⚠️ [防抖管理器] 没有找到待执行的操作: ${operationId}`);
      return null;
    }

    try {
      console.log(`🚀 [防抖管理器] 立即执行操作: ${operationId}`);
      
      // 清除定时器
      if (this.timers.has(operationId)) {
        clearTimeout(this.timers.get(operationId));
      }
      
      // 统计实际执行次数
      this.executionCounts.set(operationId, (this.executionCounts.get(operationId) || 0) + 1);
      
      // 执行函数
      const result = operation.context ? 
        await operation.fn.call(operation.context) : 
        await operation.fn();
      
      operation.resolve(result);
      this.cleanup(operationId);
      
      return result;
    } catch (error) {
      console.error(`❌ [防抖管理器] 立即执行失败: ${operationId}`, error);
      operation.reject(error);
      this.cleanup(operationId);
      throw error;
    }
  }

  /**
   * 取消指定操作
   * @param {string} operationId - 操作标识符
   * @returns {boolean} 是否成功取消
   */
  cancel(operationId) {
    if (this.timers.has(operationId)) {
      clearTimeout(this.timers.get(operationId));
      
      const operation = this.pendingOperations.get(operationId);
      if (operation) {
        operation.reject(new Error(`Operation ${operationId} was cancelled`));
      }
      
      this.cleanup(operationId);
      console.log(`🚫 [防抖管理器] 已取消操作: ${operationId}`);
      return true;
    }
    return false;
  }

  /**
   * 取消所有待执行的操作
   */
  cancelAll() {
    const operationIds = Array.from(this.timers.keys());
    operationIds.forEach(operationId => {
      this.cancel(operationId);
    });
    console.log(`🚫 [防抖管理器] 已取消所有操作，共 ${operationIds.length} 个`);
  }

  /**
   * 检查操作是否正在等待执行
   * @param {string} operationId - 操作标识符
   * @returns {boolean} 是否正在等待
   */
  isPending(operationId) {
    return this.timers.has(operationId);
  }

  /**
   * 获取待执行操作的剩余时间
   * @param {string} operationId - 操作标识符
   * @returns {number} 剩余时间（毫秒），如果操作不存在返回-1
   */
  getRemainingTime(operationId) {
    const operation = this.pendingOperations.get(operationId);
    if (!operation) {
      return -1;
    }
    
    const elapsed = Date.now() - operation.timestamp;
    const remaining = this.defaultDelay - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * 获取所有待执行的操作ID
   * @returns {Array} 操作ID数组
   */
  getPendingOperations() {
    return Array.from(this.timers.keys());
  }

  /**
   * 清理指定操作的相关数据
   * @param {string} operationId - 操作标识符
   */
  cleanup(operationId) {
    this.timers.delete(operationId);
    this.pendingOperations.delete(operationId);
  }

  /**
   * 获取防抖统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const stats = {
      pendingCount: this.timers.size,
      totalOperations: 0,
      totalExecutions: 0,
      operationDetails: {}
    };

    // 计算总调用次数和执行次数
    for (const [operationId, callCount] of this.operationCounts) {
      const execCount = this.executionCounts.get(operationId) || 0;
      stats.totalOperations += callCount;
      stats.totalExecutions += execCount;
      
      stats.operationDetails[operationId] = {
        calls: callCount,
        executions: execCount,
        savedCalls: callCount - execCount,
        efficiency: callCount > 0 ? (callCount - execCount) / callCount : 0
      };
    }

    stats.overallEfficiency = stats.totalOperations > 0 ? 
      (stats.totalOperations - stats.totalExecutions) / stats.totalOperations : 0;

    return stats;
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.operationCounts.clear();
    this.executionCounts.clear();
    console.log(`📊 [防抖管理器] 统计信息已重置`);
  }

  /**
   * 设置默认延迟时间
   * @param {number} delay - 新的默认延迟时间（毫秒）
   */
  setDefaultDelay(delay) {
    this.defaultDelay = delay;
    console.log(`⏱️ [防抖管理器] 默认延迟已更新为: ${delay}ms`);
  }

  /**
   * 创建一个绑定到特定操作ID的防抖函数
   * @param {string} operationId - 操作标识符
   * @param {number} delay - 防抖延迟时间
   * @returns {Function} 防抖函数
   */
  createDebouncedFunction(operationId, delay = this.defaultDelay) {
    return (fn, context = null) => {
      return this.debounce(operationId, fn, delay, context);
    };
  }

  /**
   * 销毁防抖管理器
   */
  destroy() {
    this.cancelAll();
    this.resetStats();
    console.log(`💥 [防抖管理器] 已销毁`);
  }
}

/**
 * 创建防抖装饰器
 * @param {string} operationId - 操作标识符
 * @param {number} delay - 防抖延迟时间
 * @param {DebounceManager} manager - 防抖管理器实例
 * @returns {Function} 装饰器函数
 */
export function debounced(operationId, delay = 300, manager = null) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      const debounceManager = manager || this.debounceManager;
      if (!debounceManager) {
        console.warn(`⚠️ [防抖装饰器] 未找到防抖管理器，直接执行方法: ${propertyKey}`);
        return originalMethod.apply(this, args);
      }
      
      return debounceManager.debounce(
        `${target.constructor.name}.${propertyKey}.${operationId}`,
        () => originalMethod.apply(this, args),
        delay,
        this
      );
    };
    
    return descriptor;
  };
}
// 默认导出已通过 export class 实现
