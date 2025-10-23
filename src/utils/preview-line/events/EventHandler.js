/**
 * 事件处理器
 * 提供预览线系统的具体事件处理逻辑和业务处理器
 */

export class EventHandler {
  constructor(options = {}) {
    this.options = {
      // 处理器配置
      enableLogging: false,
      enableMetrics: true,
      enableValidation: true,
      
      // 性能配置
      maxRetries: 3,
      retryDelay: 100,
      timeout: 5000,
      
      ...options
    };

    // 处理器注册表
    this.handlers = new Map();
    
    // 中间件栈
    this.middlewares = [];
    
    // 处理器统计
    this.stats = {
      handled: 0,
      errors: 0,
      retries: 0,
      timeouts: 0
    };
    
    // 处理器缓存
    this.handlerCache = new Map();
    
    // 初始化默认处理器
    this.initializeDefaultHandlers();
  }

  /**
   * 注册事件处理器
   * @param {string} event - 事件名称
   * @param {Function|Object} handler - 处理器函数或配置对象
   * @param {Object} options - 处理器选项
   */
  register(event, handler, options = {}) {
    let handlerConfig;
    
    if (typeof handler === 'function') {
      // 传统方式：第二个参数是函数
      handlerConfig = {
        handler,
        priority: options.priority || 0,
        async: options.async || false,
        validate: options.validate || options.validator || null,
        transform: options.transform || options.transformer || null,
        retry: options.retry !== false,
        timeout: options.timeout || this.options.timeout,
        middleware: options.middleware || [],
        ...options
      };
    } else if (typeof handler === 'object' && handler.handler) {
      // 新方式：第二个参数是配置对象
      if (typeof handler.handler !== 'function') {
        throw new Error('处理器必须是函数');
      }
      
      handlerConfig = {
        handler: handler.handler,
        priority: handler.priority || options.priority || 0,
        async: handler.async || options.async || false,
        validate: handler.validate || handler.validator || options.validate || options.validator || null,
        transform: handler.transform || handler.transformer || options.transform || options.transformer || null,
        retry: handler.retry !== false && options.retry !== false,
        timeout: handler.timeout || options.timeout || this.options.timeout,
        middleware: handler.middleware || options.middleware || [],
        ...handler,
        ...options
      };
    } else {
      throw new Error('处理器必须是函数或包含handler属性的配置对象');
    }

    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    
    const eventHandlers = this.handlers.get(event);
    eventHandlers.push(handlerConfig);
    
    // 按优先级排序
    eventHandlers.sort((a, b) => b.priority - a.priority);
    
    // 清除缓存
    this.handlerCache.delete(event);
  }

  /**
   * 注销事件处理器
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理器函数
   * @returns {boolean} 是否注销成功
   */
  unregister(event, handler) {
    if (!this.handlers.has(event)) {
      return false;
    }

    const eventHandlers = this.handlers.get(event);
    const index = eventHandlers.findIndex(h => h.handler === handler);
    
    if (index !== -1) {
      eventHandlers.splice(index, 1);
      
      if (eventHandlers.length === 0) {
        this.handlers.delete(event);
      }
      
      // 清除缓存
      this.handlerCache.delete(event);
      return true;
    }
    
    return false;
  }

  /**
   * 处理事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @param {Object} context - 事件上下文
   * @returns {Promise<*>} 处理结果
   */
  async handle(event, data, context = {}) {
    const handlers = this.getHandlers(event);
    
    if (handlers.length === 0) {
      return null;
    }

    const results = [];
    
    for (const handlerConfig of handlers) {
      try {
        const result = await this.executeHandler(handlerConfig, event, data, context);
        results.push(result);
        
        // 如果处理器返回 false，停止后续处理
        if (result === false) {
          break;
        }
      } catch (error) {
        this.stats.errors++;
        
        if (this.options.enableLogging) {
          console.error(`事件处理器错误 [${event}]:`, error);
        }
        
        // 如果是关键处理器，抛出错误
        if (handlerConfig.critical) {
          throw error;
        }
      }
    }
    
    this.stats.handled++;
    return results.length === 1 ? results[0] : results;
  }

  /**
   * 执行处理器
   * @param {Object} handlerConfig - 处理器配置
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @param {Object} context - 事件上下文
   * @returns {Promise<*>} 处理结果
   */
  async executeHandler(handlerConfig, event, data, context) {
    const { handler, validate, transform, retry, timeout, middleware } = handlerConfig;
    
    // 数据验证
    if (validate && this.options.enableValidation) {
      const isValid = await this.validateData(validate, data, context);
      if (!isValid) {
        throw new Error(`事件数据验证失败: ${event}`);
      }
    }
    
    // 数据转换
    let processedData = data;
    if (transform) {
      processedData = await this.transformData(transform, data, context);
    }
    
    // 执行中间件
    const middlewareContext = { event, data: processedData, context };
    await this.executeMiddleware(middleware, middlewareContext);
    
    // 执行处理器 - 禁用重试机制，避免递归调用
    try {
      if (timeout > 0) {
        return await this.executeWithTimeout(handler, [middlewareContext], timeout);
      } else {
        return await handler(middlewareContext);
      }
    } catch (error) {
      // 不再重试，直接抛出错误
      console.warn('事件处理器执行失败（已禁用重试）:', error.message);
      throw error;
    }
  }

  /**
   * 带超时执行
   * @param {Function} handler - 处理器函数
   * @param {Array} args - 参数
   * @param {number} timeout - 超时时间
   * @returns {Promise<*>} 执行结果
   */
  executeWithTimeout(handler, args, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.stats.timeouts++;
        reject(new Error(`处理器执行超时: ${timeout}ms`));
      }, timeout);
      
      Promise.resolve(handler(...args))
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 执行中间件
   * @param {Array} middlewares - 中间件数组
   * @param {Object} context - 上下文
   */
  async executeMiddleware(middlewares, context) {
    const allMiddlewares = [...this.middlewares, ...middlewares];
    
    for (const middleware of allMiddlewares) {
      if (typeof middleware === 'function') {
        await middleware(context);
      }
    }
  }

  /**
   * 验证数据
   * @param {Function|Object} validator - 验证器
   * @param {*} data - 数据
   * @param {Object} context - 上下文
   * @returns {Promise<boolean>} 验证结果
   */
  async validateData(validator, data, context) {
    if (typeof validator === 'function') {
      return await validator(data, context);
    }
    
    if (typeof validator === 'object' && validator.validate) {
      return await validator.validate(data, context);
    }
    
    return true;
  }

  /**
   * 转换数据
   * @param {Function} transformer - 转换器
   * @param {*} data - 数据
   * @param {Object} context - 上下文
   * @returns {Promise<*>} 转换结果
   */
  async transformData(transformer, data, context) {
    if (typeof transformer === 'function') {
      return await transformer(data, context);
    }
    
    return data;
  }

  /**
   * 获取处理器
   * @param {string} event - 事件名称
   * @returns {Array} 处理器数组
   */
  getHandlers(event) {
    // 使用缓存
    if (this.handlerCache.has(event)) {
      return this.handlerCache.get(event);
    }
    
    const handlers = this.handlers.get(event) || [];
    this.handlerCache.set(event, handlers);
    
    return handlers;
  }

  /**
   * 添加全局中间件
   * @param {Function} middleware - 中间件函数
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('中间件必须是函数');
    }
    
    this.middlewares.push(middleware);
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟时间
   * @returns {Promise} Promise对象
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 初始化默认处理器
   */
  initializeDefaultHandlers() {
    // 预览线创建处理器
    this.register('preview-line:create', async ({ data, context }) => {
      if (this.options.enableLogging) {
        console.log('处理预览线创建事件:', data);
      }
      return { success: true, action: 'create', data };
    });

    // 预览线更新处理器
    this.register('preview-line:update', async ({ data, context }) => {
      if (this.options.enableLogging) {
        console.log('处理预览线更新事件:', data);
      }
      return { success: true, action: 'update', data };
    });

    // 预览线删除处理器
    this.register('preview-line:remove', async ({ data, context }) => {
      if (this.options.enableLogging) {
        console.log('处理预览线删除事件:', data);
      }
      return { success: true, action: 'remove', data };
    });

    // 状态变更处理器
    this.register('preview-line:state-change', async ({ data, context }) => {
      if (this.options.enableLogging) {
        console.log('处理预览线状态变更事件:', data);
      }
      return { success: true, action: 'state-change', data };
    });

    // 交互事件处理器
    this.register('preview-line:interaction', async ({ data, context }) => {
      if (this.options.enableLogging) {
        console.log('处理预览线交互事件:', data);
      }
      return { success: true, action: 'interaction', data };
    });

    // 错误处理器
    this.register('preview-line:error', async ({ data, context }) => {
      console.error('预览线错误:', data);
      return { success: false, action: 'error', data };
    });
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      totalHandlers: Array.from(this.handlers.values()).reduce((sum, handlers) => sum + handlers.length, 0),
      totalHandled: this.stats.handled,
      totalErrors: this.stats.errors,
      eventTypes: this.handlers.size,
      middlewares: this.middlewares.length,
      averageProcessingTime: this.stats.handled > 0 ? (this.stats.totalProcessingTime || 0) / this.stats.handled : 0
    };
  }

  /**
   * 获取统计信息（别名方法）
   * @returns {Object} 统计信息
   */
  getStatistics() {
    return this.getStats();
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      handled: 0,
      errors: 0,
      retries: 0,
      timeouts: 0
    };
  }

  /**
   * 清除所有处理器
   */
  clear() {
    this.handlers.clear();
    this.handlerCache.clear();
    this.middlewares.length = 0;
    this.resetStats();
  }

  /**
   * 销毁事件处理器
   */
  destroy() {
    this.clear();
  }
}

export default EventHandler;