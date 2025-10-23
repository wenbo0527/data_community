/**
 * 布局配置模块
 * 统一管理所有布局相关的配置参数
 */

export class LayoutConfig {
  constructor(options = {}) {
    // 层级配置
    this.layer = {
      baseHeight: 150, // 基础层级高度
      dynamicSpacing: true, // 动态间距调整
      maxLayers: 10, // 最大层级数
      tolerance: 20, // 层级容差
      ...options.layer
    };

    // 节点配置
    this.node = {
      minSpacing: 120, // 最小节点间距
      preferredSpacing: 180, // 首选节点间距
      maxSpacing: 300, // 最大节点间距
      defaultSize: { width: 120, height: 40 }, // 默认节点大小
      ...options.node
    };

    // 优化配置
    this.optimization = {
      enableGlobalOptimization: true,
      maxIterations: 5,
      convergenceThreshold: 0.01,
      enableAestheticOptimization: true,
      enableNodeIntegration: true, // 启用节点集成
      ...options.optimization
    };

    // 性能配置
    this.performance = {
      enableParallelProcessing: false, // 暂时禁用并行处理
      batchSize: 50,
      enableCaching: true,
      ...options.performance
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
  }

  /**
   * 获取层级配置
   * @returns {Object} 层级配置对象
   */
  getLayerConfig() {
    return { ...this.layer };
  }

  /**
   * 获取节点配置
   * @returns {Object} 节点配置对象
   */
  getNodeConfig() {
    return { ...this.node };
  }

  /**
   * 获取优化配置
   * @returns {Object} 优化配置对象
   */
  getOptimizationConfig() {
    return { ...this.optimization };
  }

  /**
   * 获取性能配置
   * @returns {Object} 性能配置对象
   */
  getPerformanceConfig() {
    return { ...this.performance };
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
   * 更新配置
   * @param {Object} newConfig - 新的配置对象
   */
  updateConfig(newConfig) {
    if (newConfig.layer) {
      this.layer = { ...this.layer, ...newConfig.layer };
    }
    if (newConfig.node) {
      this.node = { ...this.node, ...newConfig.node };
    }
    if (newConfig.optimization) {
      this.optimization = { ...this.optimization, ...newConfig.optimization };
    }
    if (newConfig.performance) {
      this.performance = { ...this.performance, ...newConfig.performance };
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
  }

  /**
   * 获取完整配置对象
   * @returns {Object} 完整配置对象
   */
  getAllConfig() {
    return {
      layer: this.getLayerConfig(),
      node: this.getNodeConfig(),
      optimization: this.getOptimizationConfig(),
      performance: this.getPerformanceConfig(),
      debounce: this.getDebounceConfig(),
      cache: this.getCacheConfig(),
      previewLineLock: this.getPreviewLineLockConfig()
    };
  }

  /**
   * 验证配置的有效性
   * @returns {Object} 验证结果
   */
  validateConfig() {
    const errors = [];
    const warnings = [];

    // 验证层级配置
    if (this.layer.baseHeight <= 0) {
      errors.push('Layer baseHeight must be greater than 0');
    }
    if (this.layer.maxLayers <= 0) {
      errors.push('Layer maxLayers must be greater than 0');
    }

    // 验证节点配置
    if (this.node.minSpacing >= this.node.maxSpacing) {
      errors.push('Node minSpacing must be less than maxSpacing');
    }
    if (this.node.preferredSpacing < this.node.minSpacing || this.node.preferredSpacing > this.node.maxSpacing) {
      warnings.push('Node preferredSpacing should be between minSpacing and maxSpacing');
    }

    // 验证优化配置
    if (this.optimization.maxIterations <= 0) {
      errors.push('Optimization maxIterations must be greater than 0');
    }
    if (this.optimization.convergenceThreshold <= 0 || this.optimization.convergenceThreshold >= 1) {
      errors.push('Optimization convergenceThreshold must be between 0 and 1');
    }

    // 验证性能配置
    if (this.performance.batchSize <= 0) {
      errors.push('Performance batchSize must be greater than 0');
    }

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

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// 默认配置实例
export const defaultLayoutConfig = new LayoutConfig();

// 配置工厂函数
export function createLayoutConfig(options = {}) {
  return new LayoutConfig(options);
}

// 默认导出
export default LayoutConfig;
