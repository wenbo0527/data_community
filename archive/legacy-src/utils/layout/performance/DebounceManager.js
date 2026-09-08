/**
 * 防抖管理器
 * 提供防抖和节流功能，优化布局计算性能
 */

/**
 * 防抖管理器类
 */
class DebounceManager {
  constructor(options = {}) {
    this.options = {
      defaultDelay: 300,
      maxDelay: 2000,
      enableMetrics: true,
      autoCleanup: true,
      cleanupInterval: 60 * 1000, // 1分钟
      ...options
    };
    
    // 防抖任务存储
    this.debounceTasks = new Map();
    this.throttleTasks = new Map();
    
    // 统计信息
    this.metrics = {
      debounceCreated: 0,
      debounceExecuted: 0,
      debounceCancelled: 0,
      throttleCreated: 0,
      throttleExecuted: 0,
      throttleSkipped: 0
    };
    
    // 自动清理定时器
    if (this.options.autoCleanup) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.options.cleanupInterval);
    }
  }
  
  /**
   * 创建防抖函数
   */
  debounce(key, func, delay = null, options = {}) {
    const actualDelay = delay || this.options.defaultDelay;
    const {
      immediate = false,
      maxWait = this.options.maxDelay,
      context = null
    } = options;
    
    // 取消之前的任务
    this.cancelDebounce(key);
    
    let timeoutId = null;
    let maxTimeoutId = null;
    let lastCallTime = Date.now();
    let result = null;
    
    const debounced = (...args) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      lastCallTime = now;
      
      // 清除之前的定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // 立即执行模式
      if (immediate && !timeoutId) {
        result = func.apply(context, args);
        this.metrics.debounceExecuted++;
      }
      
      // 设置新的防抖定时器
      timeoutId = setTimeout(() => {
        if (!immediate) {
          result = func.apply(context, args);
          this.metrics.debounceExecuted++;
        }
        
        // 清理任务
        this.debounceTasks.delete(key);
        
        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
          maxTimeoutId = null;
        }
      }, actualDelay);
      
      // 设置最大等待时间
      if (maxWait && !maxTimeoutId) {
        maxTimeoutId = setTimeout(() => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          result = func.apply(context, args);
          this.metrics.debounceExecuted++;
          
          // 清理任务
          this.debounceTasks.delete(key);
        }, maxWait);
      }
      
      return result;
    };
    
    // 取消函数
    debounced.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        this.metrics.debounceCancelled++;
      }
      
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
        maxTimeoutId = null;
      }
      
      this.debounceTasks.delete(key);
    };
    
    // 立即执行函数
    debounced.flush = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
        maxTimeoutId = null;
      }
      
      this.debounceTasks.delete(key);
      this.metrics.debounceExecuted++;
      
      return func.apply(context);
    };
    
    // 检查是否待执行
    debounced.pending = () => {
      return timeoutId !== null;
    };
    
    // 存储任务信息
    this.debounceTasks.set(key, {
      func: debounced,
      originalFunc: func,
      delay: actualDelay,
      maxWait,
      immediate,
      context,
      createdAt: Date.now(),
      lastCallTime
    });
    
    this.metrics.debounceCreated++;
    
    return debounced;
  }
  
  /**
   * 创建节流函数
   */
  throttle(key, func, delay = null, options = {}) {
    const actualDelay = delay || this.options.defaultDelay;
    const {
      leading = true,
      trailing = true,
      context = null
    } = options;
    
    // 取消之前的任务
    this.cancelThrottle(key);
    
    let lastCallTime = 0;
    let lastExecTime = 0;
    let timeoutId = null;
    let result = null;
    
    const throttled = (...args) => {
      const now = Date.now();
      
      // 首次调用且不允许leading执行
      if (!lastCallTime && !leading) {
        lastCallTime = now;
      }
      
      const remaining = actualDelay - (now - lastExecTime);
      lastCallTime = now;
      
      if (remaining <= 0 || remaining > actualDelay) {
        // 可以立即执行
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        lastExecTime = now;
        result = func.apply(context, args);
        this.metrics.throttleExecuted++;
      } else if (!timeoutId && trailing) {
        // 设置延迟执行
        timeoutId = setTimeout(() => {
          lastExecTime = leading ? Date.now() : 0;
          timeoutId = null;
          result = func.apply(context, args);
          this.metrics.throttleExecuted++;
        }, remaining);
      } else {
        this.metrics.throttleSkipped++;
      }
      
      return result;
    };
    
    // 取消函数
    throttled.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      lastCallTime = 0;
      lastExecTime = 0;
      this.throttleTasks.delete(key);
    };
    
    // 立即执行函数
    throttled.flush = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        lastExecTime = Date.now();
        this.metrics.throttleExecuted++;
        return func.apply(context);
      }
    };
    
    // 存储任务信息
    this.throttleTasks.set(key, {
      func: throttled,
      originalFunc: func,
      delay: actualDelay,
      leading,
      trailing,
      context,
      createdAt: Date.now(),
      lastCallTime,
      lastExecTime
    });
    
    this.metrics.throttleCreated++;
    
    return throttled;
  }
  
  /**
   * 获取防抖函数
   */
  getDebounce(key) {
    const task = this.debounceTasks.get(key);
    return task ? task.func : null;
  }
  
  /**
   * 获取节流函数
   */
  getThrottle(key) {
    const task = this.throttleTasks.get(key);
    return task ? task.func : null;
  }
  
  /**
   * 取消防抖任务
   */
  cancelDebounce(key) {
    const task = this.debounceTasks.get(key);
    if (task && task.func.cancel) {
      task.func.cancel();
      return true;
    }
    return false;
  }
  
  /**
   * 取消节流任务
   */
  cancelThrottle(key) {
    const task = this.throttleTasks.get(key);
    if (task && task.func.cancel) {
      task.func.cancel();
      return true;
    }
    return false;
  }
  
  /**
   * 立即执行防抖任务
   */
  flushDebounce(key) {
    const task = this.debounceTasks.get(key);
    if (task && task.func.flush) {
      return task.func.flush();
    }
    return null;
  }
  
  /**
   * 立即执行节流任务
   */
  flushThrottle(key) {
    const task = this.throttleTasks.get(key);
    if (task && task.func.flush) {
      return task.func.flush();
    }
    return null;
  }
  
  /**
   * 检查防抖任务是否待执行
   */
  isDebounceActive(key) {
    const task = this.debounceTasks.get(key);
    return task && task.func.pending && task.func.pending();
  }
  
  /**
   * 批量取消防抖任务
   */
  cancelAllDebounce() {
    let cancelledCount = 0;
    
    for (const key of this.debounceTasks.keys()) {
      if (this.cancelDebounce(key)) {
        cancelledCount++;
      }
    }
    
    return cancelledCount;
  }
  
  /**
   * 批量取消节流任务
   */
  cancelAllThrottle() {
    let cancelledCount = 0;
    
    for (const key of this.throttleTasks.keys()) {
      if (this.cancelThrottle(key)) {
        cancelledCount++;
      }
    }
    
    return cancelledCount;
  }
  
  /**
   * 批量立即执行防抖任务
   */
  flushAllDebounce() {
    const results = new Map();
    
    for (const key of this.debounceTasks.keys()) {
      const result = this.flushDebounce(key);
      if (result !== null) {
        results.set(key, result);
      }
    }
    
    return results;
  }
  
  /**
   * 批量立即执行节流任务
   */
  flushAllThrottle() {
    const results = new Map();
    
    for (const key of this.throttleTasks.keys()) {
      const result = this.flushThrottle(key);
      if (result !== null) {
        results.set(key, result);
      }
    }
    
    return results;
  }
  
  /**
   * 清理过期任务
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10分钟
    let cleanedCount = 0;
    
    // 清理防抖任务
    for (const [key, task] of this.debounceTasks.entries()) {
      if (now - task.createdAt > maxAge && !this.isDebounceActive(key)) {
        this.cancelDebounce(key);
        cleanedCount++;
      }
    }
    
    // 清理节流任务
    for (const [key, task] of this.throttleTasks.entries()) {
      if (now - task.createdAt > maxAge) {
        this.cancelThrottle(key);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    const debounceExecutionRate = this.metrics.debounceCreated > 0 ?
      this.metrics.debounceExecuted / this.metrics.debounceCreated : 0;
    
    const throttleExecutionRate = this.metrics.throttleCreated > 0 ?
      this.metrics.throttleExecuted / this.metrics.throttleCreated : 0;
    
    const throttleSkipRate = this.metrics.throttleCreated > 0 ?
      this.metrics.throttleSkipped / (this.metrics.throttleExecuted + this.metrics.throttleSkipped) : 0;
    
    return {
      ...this.metrics,
      debounceExecutionRate,
      throttleExecutionRate,
      throttleSkipRate,
      activeDebounceTasks: this.debounceTasks.size,
      activeThrottleTasks: this.throttleTasks.size
    };
  }
  
  /**
   * 获取任务信息
   */
  getTaskInfo() {
    const debounceInfo = Array.from(this.debounceTasks.entries()).map(([key, task]) => ({
      key,
      delay: task.delay,
      maxWait: task.maxWait,
      immediate: task.immediate,
      createdAt: task.createdAt,
      lastCallTime: task.lastCallTime,
      pending: this.isDebounceActive(key)
    }));
    
    const throttleInfo = Array.from(this.throttleTasks.entries()).map(([key, task]) => ({
      key,
      delay: task.delay,
      leading: task.leading,
      trailing: task.trailing,
      createdAt: task.createdAt,
      lastCallTime: task.lastCallTime,
      lastExecTime: task.lastExecTime
    }));
    
    return {
      debounce: debounceInfo,
      throttle: throttleInfo
    };
  }
  
  /**
   * 重置统计信息
   */
  resetMetrics() {
    this.metrics = {
      debounceCreated: 0,
      debounceExecuted: 0,
      debounceCancelled: 0,
      throttleCreated: 0,
      throttleExecuted: 0,
      throttleSkipped: 0
    };
  }
  
  /**
   * 创建组合防抖节流函数
   */
  createCombined(key, func, options = {}) {
    const {
      debounceDelay = this.options.defaultDelay,
      throttleDelay = this.options.defaultDelay * 2,
      useDebounce = true,
      useThrottle = true,
      context = null
    } = options;
    
    if (!useDebounce && !useThrottle) {
      return func;
    }
    
    let combinedFunc = func;
    
    if (useThrottle) {
      combinedFunc = this.throttle(`${key}_throttle`, combinedFunc, throttleDelay, {
        context,
        leading: true,
        trailing: false
      });
    }
    
    if (useDebounce) {
      combinedFunc = this.debounce(`${key}_debounce`, combinedFunc, debounceDelay, {
        context,
        immediate: false
      });
    }
    
    return combinedFunc;
  }
  
  /**
   * 取消所有任务
   */
  cancel() {
    this.cancelAllDebounce();
    this.cancelAllThrottle();
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.cancelAllDebounce();
    this.cancelAllThrottle();
    
    this.debounceTasks.clear();
    this.throttleTasks.clear();
  }
  
  /**
   * 获取所有任务键
   */
  getTaskKeys() {
    return {
      debounce: Array.from(this.debounceTasks.keys()),
      throttle: Array.from(this.throttleTasks.keys())
    };
  }
  
  /**
   * 检查任务是否存在
   */
  hasTask(key, type = 'debounce') {
    if (type === 'debounce') {
      return this.debounceTasks.has(key);
    } else if (type === 'throttle') {
      return this.throttleTasks.has(key);
    }
    return false;
  }
  
  /**
   * 更新任务配置
   */
  updateTaskConfig(key, type, newOptions) {
    const taskMap = type === 'debounce' ? this.debounceTasks : this.throttleTasks;
    const task = taskMap.get(key);
    
    if (!task) {
      return false;
    }
    
    // 取消当前任务
    if (type === 'debounce') {
      this.cancelDebounce(key);
      // 重新创建防抖任务
      this.debounce(key, task.originalFunc, newOptions.delay, newOptions);
    } else {
      this.cancelThrottle(key);
      // 重新创建节流任务
      this.throttle(key, task.originalFunc, newOptions.delay, newOptions);
    }
    
    return true;
  }
}

export { DebounceManager };
export default DebounceManager;