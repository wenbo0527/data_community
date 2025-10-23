/**
 * 事件管理器
 * 提供预览线系统的事件处理、事件总线和组件间通信功能
 */

export class EventManager {
  constructor(options = {}) {
    this.options = {
      // 事件配置
      maxListeners: 100,
      enableWildcard: true,
      enableNamespace: true,
      enableAsync: true,
      
      // 性能配置
      batchSize: 50,
      debounceDelay: 16, // ~60fps
      throttleDelay: 100,
      
      // 调试配置
      enableLogging: false,
      enableStats: true,
      enableWarnings: true,
      
      ...options
    };

    // 事件监听器存储
    this.listeners = new Map();
    
    // 一次性监听器
    this.onceListeners = new Map();
    
    // 事件队列
    this.eventQueue = [];
    
    // 批处理队列
    this.batchQueue = new Map();
    
    // 防抖和节流缓存
    this.debounceCache = new Map();
    this.throttleCache = new Map();
    
    // 事件统计
    this.stats = {
      emitted: 0,
      handled: 0,
      errors: 0,
      listeners: 0,
      batches: 0
    };
    
    // 事件历史（用于调试）
    this.eventHistory = [];
    this.maxHistorySize = 1000;
    
    // 异步处理标志
    this.isProcessing = false;
    
    // 绑定方法
    this.processEventQueue = this.processEventQueue.bind(this);
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} options - 监听器选项
   * @returns {Function} 移除监听器的函数
   */
  on(event, listener, options = {}) {
    const {
      priority = 0,
      once = false,
      namespace = null,
      context = null,
      debounce = 0,
      throttle = 0
    } = options;

    if (typeof listener !== 'function') {
      throw new Error('监听器必须是函数');
    }

    // 检查监听器数量限制
    if (this.getListenerCount() >= this.options.maxListeners) {
      if (this.options.enableWarnings) {
        console.warn(`事件监听器数量超过限制: ${this.options.maxListeners}`);
      }
      return () => {};
    }

    // 创建监听器包装器
    const wrappedListener = this.wrapListener(listener, {
      priority,
      once,
      namespace,
      context,
      debounce,
      throttle,
      event
    });

    // 存储监听器
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const eventListeners = this.listeners.get(event);
    eventListeners.push(wrappedListener);
    
    // 按优先级排序
    eventListeners.sort((a, b) => b.priority - a.priority);
    
    this.stats.listeners++;
    
    // 返回移除函数
    return () => this.off(event, wrappedListener);
  }

  /**
   * 添加一次性事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} options - 监听器选项
   * @returns {Function} 移除监听器的函数
   */
  once(event, listener, options = {}) {
    return this.on(event, listener, { ...options, once: true });
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   * @returns {boolean} 是否移除成功
   */
  off(event, listener) {
    if (!this.listeners.has(event)) {
      return false;
    }

    const eventListeners = this.listeners.get(event);
    const index = eventListeners.findIndex(l => l === listener || l.original === listener);
    
    if (index !== -1) {
      eventListeners.splice(index, 1);
      
      if (eventListeners.length === 0) {
        this.listeners.delete(event);
      }
      
      this.stats.listeners--;
      return true;
    }
    
    return false;
  }

  /**
   * 移除所有事件监听器
   * @param {string} event - 事件名称（可选）
   */
  removeAllListeners(event) {
    if (event) {
      if (this.listeners.has(event)) {
        const count = this.listeners.get(event).length;
        this.listeners.delete(event);
        this.stats.listeners -= count;
      }
    } else {
      this.stats.listeners = 0;
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {...*} args - 事件参数
   * @returns {boolean} 是否有监听器处理了事件
   */
  emit(event, ...args) {
    this.stats.emitted++;
    
    // 记录事件历史
    this.recordEvent(event, args);
    
    // 获取匹配的监听器
    const listeners = this.getMatchingListeners(event);
    
    if (listeners.length === 0) {
      return false;
    }

    // 创建事件对象
    const eventObj = {
      type: event,
      timestamp: Date.now(),
      args,
      preventDefault: false,
      stopPropagation: false
    };

    // 同步执行监听器
    let handled = false;
    
    for (const listener of listeners) {
      try {
        if (eventObj.stopPropagation) {
          break;
        }
        
        const result = listener.call(listener.context || this, eventObj, ...args);
        
        if (result !== undefined) {
          handled = true;
          this.stats.handled++;
        }
        
        // 处理一次性监听器
        if (listener.once) {
          this.off(event, listener);
        }
      } catch (error) {
        this.stats.errors++;
        this.handleListenerError(error, event, listener);
      }
    }
    
    return handled;
  }

  /**
   * 异步触发事件
   * @param {string} event - 事件名称
   * @param {...*} args - 事件参数
   * @returns {Promise<boolean>} 是否有监听器处理了事件
   */
  async emitAsync(event, ...args) {
    if (!this.options.enableAsync) {
      return this.emit(event, ...args);
    }
    
    return new Promise((resolve) => {
      this.eventQueue.push({ event, args, resolve });
      
      if (!this.isProcessing) {
        this.scheduleProcessing();
      }
    });
  }

  /**
   * 批量触发事件
   * @param {Array} events - 事件数组 [{event, args}]
   * @returns {Array} 处理结果数组
   */
  emitBatch(events) {
    const results = [];
    
    // 按事件类型分组
    const groupedEvents = new Map();
    
    events.forEach(({ event, args }) => {
      if (!groupedEvents.has(event)) {
        groupedEvents.set(event, []);
      }
      groupedEvents.get(event).push(args);
    });
    
    // 批量处理每种事件类型
    groupedEvents.forEach((argsList, event) => {
      const batchResult = this.processBatchEvent(event, argsList);
      results.push({ event, result: batchResult });
    });
    
    this.stats.batches++;
    return results;
  }

  /**
   * 处理批量事件
   * @param {string} event - 事件名称
   * @param {Array} argsList - 参数列表数组
   * @returns {boolean} 是否处理成功
   */
  processBatchEvent(event, argsList) {
    const listeners = this.getMatchingListeners(event);
    
    if (listeners.length === 0) {
      return false;
    }
    
    let handled = false;
    
    listeners.forEach(listener => {
      try {
        if (listener.supportsBatch) {
          // 支持批处理的监听器
          const result = listener.call(listener.context || this, event, argsList);
          if (result !== undefined) {
            handled = true;
          }
        } else {
          // 逐个处理
          argsList.forEach(args => {
            const result = listener.call(listener.context || this, { type: event }, ...args);
            if (result !== undefined) {
              handled = true;
            }
          });
        }
        
        this.stats.handled++;
      } catch (error) {
        this.stats.errors++;
        this.handleListenerError(error, event, listener);
      }
    });
    
    return handled;
  }

  /**
   * 包装监听器
   * @param {Function} listener - 原始监听器
   * @param {Object} options - 选项
   * @returns {Function} 包装后的监听器
   */
  wrapListener(listener, options) {
    let wrappedListener = listener;
    
    // 防抖处理
    if (options.debounce > 0) {
      wrappedListener = this.debounce(wrappedListener, options.debounce, options.event);
    }
    
    // 节流处理
    if (options.throttle > 0) {
      wrappedListener = this.throttle(wrappedListener, options.throttle, options.event);
    }
    
    // 添加元数据
    wrappedListener.original = listener;
    wrappedListener.priority = options.priority;
    wrappedListener.once = options.once;
    wrappedListener.namespace = options.namespace;
    wrappedListener.context = options.context;
    wrappedListener.event = options.event;
    
    return wrappedListener;
  }

  /**
   * 防抖函数
   * @param {Function} func - 函数
   * @param {number} delay - 延迟时间
   * @param {string} key - 缓存键
   * @returns {Function} 防抖后的函数
   */
  debounce(func, delay, key) {
    return (...args) => {
      const cacheKey = `debounce_${key}`;
      
      if (this.debounceCache.has(cacheKey)) {
        clearTimeout(this.debounceCache.get(cacheKey));
      }
      
      const timeoutId = setTimeout(() => {
        func.apply(this, args);
        this.debounceCache.delete(cacheKey);
      }, delay);
      
      this.debounceCache.set(cacheKey, timeoutId);
    };
  }

  /**
   * 节流函数
   * @param {Function} func - 函数
   * @param {number} delay - 延迟时间
   * @param {string} key - 缓存键
   * @returns {Function} 节流后的函数
   */
  throttle(func, delay, key) {
    return (...args) => {
      const cacheKey = `throttle_${key}`;
      
      if (this.throttleCache.has(cacheKey)) {
        return;
      }
      
      func.apply(this, args);
      
      this.throttleCache.set(cacheKey, true);
      
      setTimeout(() => {
        this.throttleCache.delete(cacheKey);
      }, delay);
    };
  }

  /**
   * 获取匹配的监听器
   * @param {string} event - 事件名称
   * @returns {Array} 监听器数组
   */
  getMatchingListeners(event) {
    const listeners = [];
    
    // 精确匹配
    if (this.listeners.has(event)) {
      listeners.push(...this.listeners.get(event));
    }
    
    // 通配符匹配
    if (this.options.enableWildcard) {
      this.listeners.forEach((eventListeners, eventName) => {
        if (this.matchWildcard(eventName, event)) {
          listeners.push(...eventListeners);
        }
      });
    }
    
    // 命名空间匹配
    if (this.options.enableNamespace) {
      const namespace = this.extractNamespace(event);
      if (namespace) {
        this.listeners.forEach((eventListeners, eventName) => {
          if (this.matchNamespace(eventName, namespace)) {
            listeners.push(...eventListeners);
          }
        });
      }
    }
    
    return listeners;
  }

  /**
   * 通配符匹配
   * @param {string} pattern - 模式
   * @param {string} event - 事件名称
   * @returns {boolean} 是否匹配
   */
  matchWildcard(pattern, event) {
    if (!pattern.includes('*')) {
      return false;
    }
    
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(event);
  }

  /**
   * 命名空间匹配
   * @param {string} eventName - 事件名称
   * @param {string} namespace - 命名空间
   * @returns {boolean} 是否匹配
   */
  matchNamespace(eventName, namespace) {
    return eventName.startsWith(namespace + ':');
  }

  /**
   * 提取命名空间
   * @param {string} event - 事件名称
   * @returns {string|null} 命名空间
   */
  extractNamespace(event) {
    const colonIndex = event.indexOf(':');
    return colonIndex > 0 ? event.substring(0, colonIndex) : null;
  }

  /**
   * 调度事件队列处理
   */
  scheduleProcessing() {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    // 使用 requestAnimationFrame 或 setTimeout
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(this.processEventQueue);
    } else {
      setTimeout(this.processEventQueue, 0);
    }
  }

  /**
   * 处理事件队列
   */
  processEventQueue() {
    const batchSize = this.options.batchSize;
    const batch = this.eventQueue.splice(0, batchSize);
    
    batch.forEach(({ event, args, resolve }) => {
      try {
        const result = this.emit(event, ...args);
        resolve(result);
      } catch (error) {
        this.stats.errors++;
        resolve(false);
      }
    });
    
    if (this.eventQueue.length > 0) {
      // 继续处理剩余事件
      this.scheduleProcessing();
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * 处理监听器错误
   * @param {Error} error - 错误对象
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器
   */
  handleListenerError(error, event, listener) {
    // 确保error是一个有效的错误对象
    const safeError = error || new Error('Unknown listener error');
    
    if (this.options.enableWarnings) {
      console.warn(`事件监听器错误 [${event}]:`, safeError);
    }
    
    // 触发错误事件
    this.emit('listener:error', {
      error: safeError,
      event,
      listener,
      timestamp: Date.now()
    });
  }

  /**
   * 记录事件历史
   * @param {string} event - 事件名称
   * @param {Array} args - 事件参数
   */
  recordEvent(event, args) {
    if (!this.options.enableLogging) {
      return;
    }
    
    this.eventHistory.push({
      event,
      args: args.length > 0 ? args : undefined,
      timestamp: Date.now()
    });
    
    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * 获取监听器数量
   * @param {string} event - 事件名称（可选）
   * @returns {number} 监听器数量
   */
  getListenerCount(event) {
    if (event) {
      return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }
    
    let total = 0;
    this.listeners.forEach(listeners => {
      total += listeners.length;
    });
    
    return total;
  }

  /**
   * 获取事件列表
   * @returns {Array} 事件名称数组
   */
  getEventNames() {
    return Array.from(this.listeners.keys());
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      totalEvents: this.stats.emitted, // 添加totalEvents字段，与emitted保持一致
      totalListeners: this.getListenerCount(),
      eventTypes: this.listeners.size,
      queueSize: this.eventQueue.length,
      historySize: this.eventHistory.length
    };
  }

  /**
   * 获取统计信息（别名方法，兼容测试用例）
   * @returns {Object} 统计信息
   */
  getStatistics() {
    return this.getStats();
  }

  /**
   * 获取事件历史
   * @param {number} limit - 返回数量限制
   * @returns {Array} 事件历史数组
   */
  getEventHistory(limit = 100) {
    return this.eventHistory.slice(-limit);
  }

  /**
   * 清空事件历史
   */
  clearEventHistory() {
    this.eventHistory.length = 0;
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      emitted: 0,
      handled: 0,
      errors: 0,
      listeners: this.getListenerCount(),
      batches: 0
    };
  }

  /**
   * 销毁事件管理器
   */
  destroy() {
    // 清理定时器
    this.debounceCache.forEach(timeoutId => clearTimeout(timeoutId));
    this.throttleCache.clear();
    this.debounceCache.clear();
    
    // 清理监听器
    this.removeAllListeners();
    
    // 清理队列
    this.eventQueue.length = 0;
    this.batchQueue.clear();
    
    // 清理历史
    this.clearEventHistory();
    
    // 重置状态
    this.isProcessing = false;
    this.resetStats();
  }
}

export default EventManager;