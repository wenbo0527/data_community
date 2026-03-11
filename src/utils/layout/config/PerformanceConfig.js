/**
 * 性能配置管理器
 * 负责管理布局引擎的性能相关配置
 */

/**
 * 默认性能配置
 */
const DEFAULT_PERFORMANCE_CONFIG = {
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 300000, // 5分钟
    strategy: 'lru', // lru, fifo, lfu
    autoCleanup: true,
    cleanupInterval: 60000, // 1分钟
    compressionEnabled: false
  },
  
  // 防抖配置
  debounce: {
    enabled: true,
    delay: 300, // 毫秒
    maxWait: 1000, // 最大等待时间
    leading: false, // 是否在延迟开始前调用
    trailing: true // 是否在延迟结束后调用
  },
  
  // 性能监控配置
  monitoring: {
    enabled: true,
    sampleRate: 1.0, // 采样率 0-1
    metricsRetention: 100, // 保留的性能指标数量
    alertThresholds: {
      executionTime: 5000, // 执行时间阈值(ms)
      memoryUsage: 100 * 1024 * 1024, // 内存使用阈值(bytes)
      cacheHitRate: 0.8 // 缓存命中率阈值
    },
    autoReport: false,
    reportInterval: 30000 // 自动报告间隔(ms)
  },
  
  // 预览线锁定配置
  previewLineLock: {
    enabled: true,
    timeout: 10000, // 锁定超时时间(ms)
    maxRetries: 3, // 最大重试次数
    retryDelay: 1000, // 重试延迟(ms)
    autoRelease: true // 自动释放锁
  },
  
  // 批处理配置
  batching: {
    enabled: true,
    batchSize: 50, // 批处理大小
    flushInterval: 100, // 刷新间隔(ms)
    maxBatchWait: 500 // 最大批处理等待时间(ms)
  },
  
  // 内存管理配置
  memory: {
    gcEnabled: true,
    gcInterval: 120000, // GC间隔(ms)
    maxHeapSize: 512 * 1024 * 1024, // 最大堆大小(bytes)
    memoryWarningThreshold: 0.8, // 内存警告阈值
    autoCleanup: true
  },
  
  // 并发控制配置
  concurrency: {
    maxConcurrentOperations: 5,
    queueSize: 100,
    timeoutMs: 30000,
    priorityEnabled: true
  },
  
  // 优化配置
  optimization: {
    lazyLoading: true,
    precomputation: true,
    memoization: true,
    virtualization: false, // 虚拟化渲染
    levelOfDetail: true // 细节层次
  }
};

/**
 * 性能配置管理器类
 */
class PerformanceConfig {
  constructor(customConfig = {}) {
    this.config = this.mergeConfig(DEFAULT_PERFORMANCE_CONFIG, customConfig);
    this.listeners = new Map();
    this.metrics = new Map();
    this.version = '1.0.0';
    this.startTime = Date.now();
  }
  
  /**
   * 深度合并配置对象
   */
  mergeConfig(defaultConfig, customConfig) {
    const merged = { ...defaultConfig };
    
    for (const key in customConfig) {
      if (customConfig.hasOwnProperty(key)) {
        if (typeof customConfig[key] === 'object' && 
            customConfig[key] !== null && 
            !Array.isArray(customConfig[key])) {
          merged[key] = this.mergeConfig(merged[key] || {}, customConfig[key]);
        } else {
          merged[key] = customConfig[key];
        }
      }
    }
    
    return merged;
  }
  
  /**
   * 获取配置值
   */
  get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }
  
  /**
   * 设置配置值
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.config;
    
    // 创建嵌套对象路径
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    // 触发配置变更事件
    this.notifyListeners(path, value, oldValue);
    
    return this;
  }
  
  /**
   * 获取缓存配置
   */
  getCacheConfig() {
    return { ...this.config.cache };
  }
  
  /**
   * 获取防抖配置
   */
  getDebounceConfig() {
    return { ...this.config.debounce };
  }
  
  /**
   * 获取监控配置
   */
  getMonitoringConfig() {
    return { ...this.config.monitoring };
  }
  
  /**
   * 获取预览线锁定配置
   */
  getPreviewLineLockConfig() {
    return { ...this.config.previewLineLock };
  }
  
  /**
   * 获取批处理配置
   */
  getBatchingConfig() {
    return { ...this.config.batching };
  }
  
  /**
   * 获取内存管理配置
   */
  getMemoryConfig() {
    return { ...this.config.memory };
  }
  
  /**
   * 获取并发控制配置
   */
  getConcurrencyConfig() {
    return { ...this.config.concurrency };
  }
  
  /**
   * 获取优化配置
   */
  getOptimizationConfig() {
    return { ...this.config.optimization };
  }
  
  /**
   * 检查功能是否启用
   */
  isEnabled(feature) {
    return this.get(`${feature}.enabled`, false);
  }
  
  /**
   * 启用功能
   */
  enable(feature) {
    return this.set(`${feature}.enabled`, true);
  }
  
  /**
   * 禁用功能
   */
  disable(feature) {
    return this.set(`${feature}.enabled`, false);
  }
  
  /**
   * 获取阈值配置
   */
  getThreshold(metric) {
    return this.get(`monitoring.alertThresholds.${metric}`);
  }
  
  /**
   * 设置阈值配置
   */
  setThreshold(metric, value) {
    return this.set(`monitoring.alertThresholds.${metric}`, value);
  }
  
  /**
   * 记录性能指标
   */
  recordMetric(name, value, timestamp = Date.now()) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name);
    metrics.push({ value, timestamp });
    
    // 保持指标数量在限制范围内
    const maxRetention = this.get('monitoring.metricsRetention', 100);
    if (metrics.length > maxRetention) {
      metrics.splice(0, metrics.length - maxRetention);
    }
    
    // 检查阈值
    this.checkThreshold(name, value);
  }
  
  /**
   * 检查阈值
   */
  checkThreshold(metric, value) {
    const threshold = this.getThreshold(metric);
    if (threshold !== undefined && value > threshold) {
      this.notifyListeners('threshold-exceeded', {
        metric,
        value,
        threshold,
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * 获取性能指标
   */
  getMetrics(name = null) {
    if (name) {
      return this.metrics.get(name) || [];
    }
    
    const result = {};
    for (const [key, values] of this.metrics.entries()) {
      result[key] = [...values];
    }
    return result;
  }
  
  /**
   * 清除性能指标
   */
  clearMetrics(name = null) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
  
  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    const stats = {
      uptime: Date.now() - this.startTime,
      metricsCount: this.metrics.size,
      totalDataPoints: 0,
      averages: {},
      peaks: {},
      config: this.getAll()
    };
    
    for (const [name, values] of this.metrics.entries()) {
      stats.totalDataPoints += values.length;
      
      if (values.length > 0) {
        const numericValues = values.map(v => v.value).filter(v => typeof v === 'number');
        if (numericValues.length > 0) {
          stats.averages[name] = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
          stats.peaks[name] = Math.max(...numericValues);
        }
      }
    }
    
    return stats;
  }
  
  /**
   * 优化配置建议
   */
  getOptimizationSuggestions() {
    const suggestions = [];
    const stats = this.getPerformanceStats();
    
    // 检查缓存命中率
    const cacheMetrics = this.getMetrics('cacheHitRate');
    if (cacheMetrics.length > 0) {
      const avgHitRate = stats.averages.cacheHitRate || 0;
      const threshold = this.getThreshold('cacheHitRate') || 0.8;
      
      if (avgHitRate < threshold) {
        suggestions.push({
          type: 'cache',
          message: `缓存命中率较低 (${(avgHitRate * 100).toFixed(1)}%)，建议增加缓存大小或调整缓存策略`,
          priority: 'high',
          action: 'increase-cache-size'
        });
      }
    }
    
    // 检查执行时间
    const executionMetrics = this.getMetrics('executionTime');
    if (executionMetrics.length > 0) {
      const avgExecutionTime = stats.averages.executionTime || 0;
      const threshold = this.getThreshold('executionTime') || 5000;
      
      if (avgExecutionTime > threshold) {
        suggestions.push({
          type: 'performance',
          message: `平均执行时间过长 (${avgExecutionTime.toFixed(0)}ms)，建议启用更多优化选项`,
          priority: 'high',
          action: 'enable-optimizations'
        });
      }
    }
    
    // 检查内存使用
    const memoryMetrics = this.getMetrics('memoryUsage');
    if (memoryMetrics.length > 0) {
      const avgMemoryUsage = stats.averages.memoryUsage || 0;
      const threshold = this.getThreshold('memoryUsage') || 100 * 1024 * 1024;
      
      if (avgMemoryUsage > threshold) {
        suggestions.push({
          type: 'memory',
          message: `内存使用量较高 (${(avgMemoryUsage / 1024 / 1024).toFixed(1)}MB)，建议启用内存清理`,
          priority: 'medium',
          action: 'enable-memory-cleanup'
        });
      }
    }
    
    return suggestions;
  }
  
  /**
   * 应用优化建议
   */
  applyOptimizationSuggestion(suggestion) {
    switch (suggestion.action) {
      case 'increase-cache-size':
        this.set('cache.maxSize', this.get('cache.maxSize') * 2);
        break;
        
      case 'enable-optimizations':
        this.set('optimization.memoization', true);
        this.set('optimization.precomputation', true);
        this.set('optimization.lazyLoading', true);
        break;
        
      case 'enable-memory-cleanup':
        this.set('memory.autoCleanup', true);
        this.set('memory.gcEnabled', true);
        break;
        
      default:
        console.warn(`Unknown optimization action: ${suggestion.action}`);
    }
  }
  
  /**
   * 添加配置变更监听器
   */
  addListener(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path).add(callback);
    
    return () => {
      const pathListeners = this.listeners.get(path);
      if (pathListeners) {
        pathListeners.delete(callback);
        if (pathListeners.size === 0) {
          this.listeners.delete(path);
        }
      }
    };
  }
  
  /**
   * 通知监听器
   */
  notifyListeners(path, newValue, oldValue) {
    const pathListeners = this.listeners.get(path);
    if (pathListeners) {
      pathListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.warn(`PerformanceConfig listener error for path '${path}':`, error);
        }
      });
    }
  }
  
  /**
   * 获取完整配置对象
   */
  getAll() {
    return { ...this.config };
  }
  
  /**
   * 重置配置
   */
  reset() {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG };
    this.clearMetrics();
    this.notifyListeners('reset', this.config);
    return this;
  }
  
  /**
   * 导出配置和指标
   */
  export() {
    return {
      version: this.version,
      config: this.config,
      metrics: this.getMetrics(),
      stats: this.getPerformanceStats(),
      timestamp: Date.now()
    };
  }
  
  /**
   * 销毁配置管理器
   */
  dispose() {
    this.listeners.clear();
    this.metrics.clear();
    this.config = null;
  }
}

export { PerformanceConfig, DEFAULT_PERFORMANCE_CONFIG };
export default PerformanceConfig;