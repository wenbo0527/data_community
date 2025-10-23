/**
 * 性能配置模块
 * 统一管理所有性能相关的配置参数和监控指标
 */

export class PerformanceConfig {
  constructor(options = {}) {
    // 性能优化器配置
    this.optimizer = {
      enableDelayedExecution: true,
      enableBatching: true,
      enableSmartCache: true,
      enablePreviewLineThrottling: true,
      enableDebug: true,
      ...options.optimizer
    };

    // 防抖配置
    this.debounce = {
      delay: 300, // 防抖延迟时间（毫秒）
      maxWait: 1000, // 最大等待时间（毫秒）
      immediate: false, // 是否立即执行第一次
      ...options.debounce
    };

    // 缓存配置
    this.cache = {
      enabled: true,
      maxSize: 10,
      ...options.cache
    };

    // 预览线刷新锁定配置
    this.previewLineLock = {
      timeout: 5000, // 5秒超时
      ...options.previewLineLock
    };

    // 性能监控配置
    this.monitoring = {
      enableMetrics: true,
      enableReporting: true,
      reportInterval: 10000, // 10秒报告间隔
      ...options.monitoring
    };

    // 批处理配置
    this.batch = {
      size: 50,
      enableParallelProcessing: false, // 暂时禁用并行处理
      ...options.batch
    };

    // 初始化性能监控指标
    this.initializeMetrics();
  }

  /**
   * 初始化性能监控指标
   */
  initializeMetrics() {
    this.metrics = {
      layoutCount: 0,
      totalLayoutTime: 0,
      averageLayoutTime: 0,
      cacheHitRate: 0,
      lastLayoutDuration: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * 获取性能优化器配置
   * @returns {Object} 性能优化器配置对象
   */
  getOptimizerConfig() {
    return { ...this.optimizer };
  }

  /**
   * 获取防抖配置
   * @returns {Object} 防抖配置对象
   */
  getDebounceConfig() {
    return { ...this.debounce };
  }

  /**
   * 获取缓存配置
   * @returns {Object} 缓存配置对象
   */
  getCacheConfig() {
    return { ...this.cache };
  }

  /**
   * 获取预览线锁定配置
   * @returns {Object} 预览线锁定配置对象
   */
  getPreviewLineLockConfig() {
    return { ...this.previewLineLock };
  }

  /**
   * 获取监控配置
   * @returns {Object} 监控配置对象
   */
  getMonitoringConfig() {
    return { ...this.monitoring };
  }

  /**
   * 获取批处理配置
   * @returns {Object} 批处理配置对象
   */
  getBatchConfig() {
    return { ...this.batch };
  }

  /**
   * 更新性能指标
   * @param {number} duration - 布局执行时长
   */
  updateMetrics(duration) {
    this.metrics.layoutCount++;
    this.metrics.totalLayoutTime += duration;
    this.metrics.averageLayoutTime = 
      this.metrics.totalLayoutTime / this.metrics.layoutCount;
    this.metrics.lastLayoutDuration = duration;
    
    if (this.monitoring.enableReporting) {
      console.log(`📊 [性能监控] 布局耗时: ${duration}ms, 平均耗时: ${this.metrics.averageLayoutTime.toFixed(2)}ms`);
    }
  }

  /**
   * 更新缓存命中率
   */
  updateCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    this.metrics.cacheHitRate = total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit() {
    this.metrics.cacheHits++;
    this.updateCacheHitRate();
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss() {
    this.metrics.cacheMisses++;
    this.updateCacheHitRate();
  }

  /**
   * 获取性能报告
   * @returns {Object} 性能报告对象
   */
  getPerformanceReport() {
    return {
      metrics: { ...this.metrics },
      cacheInfo: {
        enabled: this.cache.enabled,
        maxSize: this.cache.maxSize,
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRate: this.metrics.cacheHitRate
      },
      debounceInfo: {
        delay: this.debounce.delay,
        maxWait: this.debounce.maxWait,
        immediate: this.debounce.immediate
      },
      optimizerInfo: {
        enableDelayedExecution: this.optimizer.enableDelayedExecution,
        enableBatching: this.optimizer.enableBatching,
        enableSmartCache: this.optimizer.enableSmartCache,
        enablePreviewLineThrottling: this.optimizer.enablePreviewLineThrottling
      }
    };
  }

  /**
   * 重置性能指标
   */
  resetMetrics() {
    this.initializeMetrics();
    console.log('📊 [性能监控] 性能指标已重置');
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新的配置对象
   */
  updateConfig(newConfig) {
    if (newConfig.optimizer) {
      this.optimizer = { ...this.optimizer, ...newConfig.optimizer };
    }
    if (newConfig.debounce) {
      this.debounce = { ...this.debounce, ...newConfig.debounce };
    }
    if (newConfig.cache) {
      this.cache = { ...this.cache, ...newConfig.cache };
    }
    if (newConfig.previewLineLock) {
      this.previewLineLock = { ...this.previewLineLock, ...newConfig.previewLineLock };
    }
    if (newConfig.monitoring) {
      this.monitoring = { ...this.monitoring, ...newConfig.monitoring };
    }
    if (newConfig.batch) {
      this.batch = { ...this.batch, ...newConfig.batch };
    }
  }

  /**
   * 获取完整配置对象
   * @returns {Object} 完整配置对象
   */
  getAllConfig() {
    return {
      optimizer: this.getOptimizerConfig(),
      debounce: this.getDebounceConfig(),
      cache: this.getCacheConfig(),
      previewLineLock: this.getPreviewLineLockConfig(),
      monitoring: this.getMonitoringConfig(),
      batch: this.getBatchConfig()
    };
  }

  /**
   * 验证配置的有效性
   * @returns {Object} 验证结果
   */
  validateConfig() {
    const errors = [];
    const warnings = [];

    // 验证防抖配置
    if (this.debounce.delay < 0) {
      errors.push('Debounce delay must be non-negative');
    }
    if (this.debounce.maxWait < this.debounce.delay) {
      warnings.push('Debounce maxWait should be greater than or equal to delay');
    }

    // 验证缓存配置
    if (this.cache.maxSize <= 0) {
      errors.push('Cache maxSize must be greater than 0');
    }

    // 验证预览线锁定配置
    if (this.previewLineLock.timeout <= 0) {
      errors.push('PreviewLineLock timeout must be greater than 0');
    }

    // 验证监控配置
    if (this.monitoring.reportInterval <= 0) {
      errors.push('Monitoring reportInterval must be greater than 0');
    }

    // 验证批处理配置
    if (this.batch.size <= 0) {
      errors.push('Batch size must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// 默认性能配置实例
export const defaultPerformanceConfig = new PerformanceConfig();

// 性能配置工厂函数
export function createPerformanceConfig(options = {}) {
  return new PerformanceConfig(options);
}

// 性能监控工具函数
export const PerformanceUtils = {
  /**
   * 测量函数执行时间
   * @param {Function} fn - 要测量的函数
   * @param {string} label - 标签
   * @returns {Promise<any>} 函数执行结果
   */
  async measureTime(fn, label = 'Function') {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      console.log(`⏱️ [性能测量] ${label} 执行时间: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [性能测量] ${label} 执行失败 (${duration}ms):`, error);
      throw error;
    }
  },

  /**
   * 创建防抖函数
   * @param {Function} fn - 要防抖的函数
   * @param {number} delay - 延迟时间
   * @param {number} maxWait - 最大等待时间
   * @returns {Function} 防抖函数
   */
  debounce(fn, delay = 300, maxWait = 1000) {
    let timeoutId;
    let lastCallTime = 0;
    
    return function(...args) {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      clearTimeout(timeoutId);
      
      if (timeSinceLastCall >= maxWait) {
        lastCallTime = now;
        return fn.apply(this, args);
      }
      
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        fn.apply(this, args);
      }, delay);
    };
  },

  /**
   * 创建节流函数
   * @param {Function} fn - 要节流的函数
   * @param {number} interval - 节流间隔
   * @returns {Function} 节流函数
   */
  throttle(fn, interval = 100) {
    let lastCallTime = 0;
    
    return function(...args) {
      const now = Date.now();
      if (now - lastCallTime >= interval) {
        lastCallTime = now;
        return fn.apply(this, args);
      }
    };
  }
};

// 默认导出
export default PerformanceConfig;
