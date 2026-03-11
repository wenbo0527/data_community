/**
 * 性能相关类型定义
 * 提供统一布局引擎中性能监控、优化和缓存相关的类型约束和文档
 */

/**
 * 性能指标类型枚举
 * @typedef {string} PerformanceMetricType
 */
export const PerformanceMetricType = {
  /** 布局计算时间 */
  LAYOUT_TIME: 'layout-time',
  /** 渲染时间 */
  RENDER_TIME: 'render-time',
  /** 内存使用量 */
  MEMORY_USAGE: 'memory-usage',
  /** CPU使用率 */
  CPU_USAGE: 'cpu-usage',
  /** 帧率 */
  FPS: 'fps',
  /** 缓存命中率 */
  CACHE_HIT_RATE: 'cache-hit-rate',
  /** 节点数量 */
  NODE_COUNT: 'node-count',
  /** 边数量 */
  EDGE_COUNT: 'edge-count',
  /** 算法迭代次数 */
  ALGORITHM_ITERATIONS: 'algorithm-iterations',
  /** 事件处理时间 */
  EVENT_PROCESSING_TIME: 'event-processing-time'
};

/**
 * 性能级别枚举
 * @typedef {string} PerformanceLevel
 */
export const PerformanceLevel = {
  /** 优秀 */
  EXCELLENT: 'excellent',
  /** 良好 */
  GOOD: 'good',
  /** 一般 */
  FAIR: 'fair',
  /** 较差 */
  POOR: 'poor',
  /** 很差 */
  CRITICAL: 'critical'
};

/**
 * 缓存策略枚举
 * @typedef {string} CacheStrategy
 */
export const CacheStrategy = {
  /** 最近最少使用 */
  LRU: 'lru',
  /** 先进先出 */
  FIFO: 'fifo',
  /** 最近最常使用 */
  LFU: 'lfu',
  /** 时间到期 */
  TTL: 'ttl',
  /** 自定义策略 */
  CUSTOM: 'custom'
};

/**
 * 优化策略枚举
 * @typedef {string} OptimizationStrategy
 */
export const OptimizationStrategy = {
  /** 懒加载 */
  LAZY_LOADING: 'lazy-loading',
  /** 虚拟滚动 */
  VIRTUAL_SCROLLING: 'virtual-scrolling',
  /** 批处理 */
  BATCH_PROCESSING: 'batch-processing',
  /** 防抖 */
  DEBOUNCING: 'debouncing',
  /** 节流 */
  THROTTLING: 'throttling',
  /** 缓存 */
  CACHING: 'caching',
  /** 预计算 */
  PRECOMPUTATION: 'precomputation',
  /** 增量更新 */
  INCREMENTAL_UPDATE: 'incremental-update'
};

/**
 * 监控状态枚举
 * @typedef {string} MonitoringStatus
 */
export const MonitoringStatus = {
  /** 活跃 */
  ACTIVE: 'active',
  /** 暂停 */
  PAUSED: 'paused',
  /** 停止 */
  STOPPED: 'stopped',
  /** 错误 */
  ERROR: 'error'
};

/**
 * 性能指标数据类型定义
 * @typedef {Object} PerformanceMetric
 * @property {string} id - 指标ID
 * @property {PerformanceMetricType} type - 指标类型
 * @property {string} name - 指标名称
 * @property {number} value - 指标值
 * @property {string} unit - 单位
 * @property {Date} timestamp - 时间戳
 * @property {Object} metadata - 元数据
 * @property {PerformanceLevel} level - 性能级别
 * @property {Object} thresholds - 阈值配置
 * @property {number} thresholds.excellent - 优秀阈值
 * @property {number} thresholds.good - 良好阈值
 * @property {number} thresholds.fair - 一般阈值
 * @property {number} thresholds.poor - 较差阈值
 */
export const PerformanceMetricDataType = {
  id: 'string',
  type: 'PerformanceMetricType',
  name: 'string',
  value: 'number',
  unit: 'string',
  timestamp: 'Date',
  metadata: 'Object',
  level: 'PerformanceLevel',
  thresholds: {
    excellent: 'number',
    good: 'number',
    fair: 'number',
    poor: 'number'
  }
};

/**
 * 性能报告类型定义
 * @typedef {Object} PerformanceReport
 * @property {string} id - 报告ID
 * @property {Date} timestamp - 生成时间
 * @property {number} duration - 监控时长（毫秒）
 * @property {PerformanceMetric[]} metrics - 性能指标列表
 * @property {Object} summary - 汇总信息
 * @property {PerformanceLevel} summary.overallLevel - 整体性能级别
 * @property {number} summary.totalNodes - 总节点数
 * @property {number} summary.totalEdges - 总边数
 * @property {number} summary.layoutTime - 布局时间
 * @property {number} summary.renderTime - 渲染时间
 * @property {Object} recommendations - 优化建议
 * @property {string[]} recommendations.critical - 关键建议
 * @property {string[]} recommendations.suggested - 建议优化
 * @property {Object} metadata - 报告元数据
 */
export const PerformanceReportType = {
  id: 'string',
  timestamp: 'Date',
  duration: 'number',
  metrics: 'PerformanceMetric[]',
  summary: {
    overallLevel: 'PerformanceLevel',
    totalNodes: 'number',
    totalEdges: 'number',
    layoutTime: 'number',
    renderTime: 'number'
  },
  recommendations: {
    critical: 'string[]',
    suggested: 'string[]'
  },
  metadata: 'Object'
};

/**
 * 缓存项类型定义
 * @typedef {Object} CacheItem
 * @property {string} key - 缓存键
 * @property {*} value - 缓存值
 * @property {Date} createdAt - 创建时间
 * @property {Date} lastAccessed - 最后访问时间
 * @property {number} accessCount - 访问次数
 * @property {number} ttl - 生存时间（毫秒）
 * @property {number} size - 数据大小（字节）
 * @property {Object} metadata - 元数据
 * @property {string[]} tags - 标签
 * @property {number} priority - 优先级
 */
export const CacheItemType = {
  key: 'string',
  value: 'any',
  createdAt: 'Date',
  lastAccessed: 'Date',
  accessCount: 'number',
  ttl: 'number',
  size: 'number',
  metadata: 'Object',
  tags: 'string[]',
  priority: 'number'
};

/**
 * 缓存统计类型定义
 * @typedef {Object} CacheStats
 * @property {number} totalItems - 总项目数
 * @property {number} totalSize - 总大小（字节）
 * @property {number} hitCount - 命中次数
 * @property {number} missCount - 未命中次数
 * @property {number} hitRate - 命中率
 * @property {number} evictionCount - 淘汰次数
 * @property {Date} lastReset - 最后重置时间
 * @property {Object} distribution - 分布统计
 * @property {Object} distribution.bySize - 按大小分布
 * @property {Object} distribution.byAge - 按年龄分布
 * @property {Object} distribution.byAccess - 按访问频率分布
 */
export const CacheStatsType = {
  totalItems: 'number',
  totalSize: 'number',
  hitCount: 'number',
  missCount: 'number',
  hitRate: 'number',
  evictionCount: 'number',
  lastReset: 'Date',
  distribution: {
    bySize: 'Object',
    byAge: 'Object',
    byAccess: 'Object'
  }
};

/**
 * 缓存配置类型定义
 * @typedef {Object} CacheConfig
 * @property {boolean} enabled - 是否启用缓存
 * @property {number} maxSize - 最大缓存大小（项目数）
 * @property {number} maxMemory - 最大内存使用（字节）
 * @property {number} defaultTtl - 默认生存时间（毫秒）
 * @property {CacheStrategy} strategy - 缓存策略
 * @property {Object} eviction - 淘汰配置
 * @property {boolean} eviction.enabled - 是否启用自动淘汰
 * @property {number} eviction.threshold - 淘汰阈值（0-1）
 * @property {number} eviction.batchSize - 批量淘汰大小
 * @property {Object} compression - 压缩配置
 * @property {boolean} compression.enabled - 是否启用压缩
 * @property {string} compression.algorithm - 压缩算法
 * @property {number} compression.threshold - 压缩阈值（字节）
 */
export const CacheConfigType = {
  enabled: 'boolean',
  maxSize: 'number',
  maxMemory: 'number',
  defaultTtl: 'number',
  strategy: 'CacheStrategy',
  eviction: {
    enabled: 'boolean',
    threshold: 'number',
    batchSize: 'number'
  },
  compression: {
    enabled: 'boolean',
    algorithm: 'string',
    threshold: 'number'
  }
};

/**
 * 防抖配置类型定义
 * @typedef {Object} DebounceConfig
 * @property {boolean} enabled - 是否启用防抖
 * @property {number} delay - 防抖延迟（毫秒）
 * @property {number} maxWait - 最大等待时间（毫秒）
 * @property {boolean} leading - 是否在开始时执行
 * @property {boolean} trailing - 是否在结束时执行
 * @property {string[]} events - 应用防抖的事件列表
 * @property {Object} customDelays - 自定义延迟配置
 */
export const DebounceConfigType = {
  enabled: 'boolean',
  delay: 'number',
  maxWait: 'number',
  leading: 'boolean',
  trailing: 'boolean',
  events: 'string[]',
  customDelays: 'Object'
};

/**
 * 节流配置类型定义
 * @typedef {Object} ThrottleConfig
 * @property {boolean} enabled - 是否启用节流
 * @property {number} interval - 节流间隔（毫秒）
 * @property {boolean} leading - 是否在开始时执行
 * @property {boolean} trailing - 是否在结束时执行
 * @property {string[]} events - 应用节流的事件列表
 * @property {Object} customIntervals - 自定义间隔配置
 */
export const ThrottleConfigType = {
  enabled: 'boolean',
  interval: 'number',
  leading: 'boolean',
  trailing: 'boolean',
  events: 'string[]',
  customIntervals: 'Object'
};

/**
 * 监控配置类型定义
 * @typedef {Object} MonitoringConfig
 * @property {boolean} enabled - 是否启用监控
 * @property {number} sampleRate - 采样率（0-1）
 * @property {number} reportInterval - 报告间隔（毫秒）
 * @property {PerformanceMetricType[]} metrics - 监控指标列表
 * @property {Object} thresholds - 阈值配置
 * @property {Object} alerts - 告警配置
 * @property {boolean} alerts.enabled - 是否启用告警
 * @property {string[]} alerts.channels - 告警渠道
 * @property {Object} alerts.rules - 告警规则
 * @property {Object} storage - 存储配置
 * @property {boolean} storage.enabled - 是否启用存储
 * @property {number} storage.maxRecords - 最大记录数
 * @property {number} storage.retention - 保留时间（毫秒）
 */
export const MonitoringConfigType = {
  enabled: 'boolean',
  sampleRate: 'number',
  reportInterval: 'number',
  metrics: 'PerformanceMetricType[]',
  thresholds: 'Object',
  alerts: {
    enabled: 'boolean',
    channels: 'string[]',
    rules: 'Object'
  },
  storage: {
    enabled: 'boolean',
    maxRecords: 'number',
    retention: 'number'
  }
};

/**
 * 优化建议类型定义
 * @typedef {Object} OptimizationSuggestion
 * @property {string} id - 建议ID
 * @property {string} type - 建议类型
 * @property {string} title - 建议标题
 * @property {string} description - 建议描述
 * @property {string} priority - 优先级
 * @property {number} impact - 影响程度（0-1）
 * @property {number} effort - 实施难度（0-1）
 * @property {OptimizationStrategy[]} strategies - 相关策略
 * @property {Object} implementation - 实施指南
 * @property {string[]} implementation.steps - 实施步骤
 * @property {Object} implementation.resources - 所需资源
 * @property {Object} metrics - 相关指标
 * @property {string[]} metrics.before - 优化前指标
 * @property {string[]} metrics.after - 预期优化后指标
 */
export const OptimizationSuggestionType = {
  id: 'string',
  type: 'string',
  title: 'string',
  description: 'string',
  priority: 'string',
  impact: 'number',
  effort: 'number',
  strategies: 'OptimizationStrategy[]',
  implementation: {
    steps: 'string[]',
    resources: 'Object'
  },
  metrics: {
    before: 'string[]',
    after: 'string[]'
  }
};

/**
 * 性能事件类型定义
 * @typedef {Object} PerformanceEvent
 * @property {string} id - 事件ID
 * @property {string} type - 事件类型
 * @property {Date} timestamp - 时间戳
 * @property {string} source - 事件源
 * @property {Object} data - 事件数据
 * @property {PerformanceLevel} severity - 严重程度
 * @property {Object} context - 上下文信息
 * @property {Object} context.layout - 布局上下文
 * @property {Object} context.performance - 性能上下文
 * @property {Object} context.user - 用户上下文
 */
export const PerformanceEventType = {
  id: 'string',
  type: 'string',
  timestamp: 'Date',
  source: 'string',
  data: 'Object',
  severity: 'PerformanceLevel',
  context: {
    layout: 'Object',
    performance: 'Object',
    user: 'Object'
  }
};

/**
 * 性能类型验证工具类
 */
export class PerformanceTypeValidator {
  /**
   * 验证性能指标
   * @param {*} metric - 待验证的性能指标
   * @returns {boolean} 是否有效
   */
  static isValidPerformanceMetric(metric) {
    return metric &&
           typeof metric.id === 'string' &&
           metric.id.length > 0 &&
           Object.values(PerformanceMetricType).includes(metric.type) &&
           typeof metric.name === 'string' &&
           typeof metric.value === 'number' &&
           metric.value >= 0 &&
           metric.timestamp instanceof Date;
  }

  /**
   * 验证缓存项
   * @param {*} cacheItem - 待验证的缓存项
   * @returns {boolean} 是否有效
   */
  static isValidCacheItem(cacheItem) {
    return cacheItem &&
           typeof cacheItem.key === 'string' &&
           cacheItem.key.length > 0 &&
           cacheItem.createdAt instanceof Date &&
           cacheItem.lastAccessed instanceof Date &&
           typeof cacheItem.accessCount === 'number' &&
           cacheItem.accessCount >= 0 &&
           typeof cacheItem.ttl === 'number' &&
           cacheItem.ttl > 0;
  }

  /**
   * 验证缓存配置
   * @param {*} cacheConfig - 待验证的缓存配置
   * @returns {boolean} 是否有效
   */
  static isValidCacheConfig(cacheConfig) {
    return cacheConfig &&
           typeof cacheConfig.enabled === 'boolean' &&
           typeof cacheConfig.maxSize === 'number' &&
           cacheConfig.maxSize > 0 &&
           typeof cacheConfig.defaultTtl === 'number' &&
           cacheConfig.defaultTtl > 0 &&
           Object.values(CacheStrategy).includes(cacheConfig.strategy);
  }

  /**
   * 验证防抖配置
   * @param {*} debounceConfig - 待验证的防抖配置
   * @returns {boolean} 是否有效
   */
  static isValidDebounceConfig(debounceConfig) {
    return debounceConfig &&
           typeof debounceConfig.enabled === 'boolean' &&
           typeof debounceConfig.delay === 'number' &&
           debounceConfig.delay >= 0 &&
           Array.isArray(debounceConfig.events);
  }

  /**
   * 验证节流配置
   * @param {*} throttleConfig - 待验证的节流配置
   * @returns {boolean} 是否有效
   */
  static isValidThrottleConfig(throttleConfig) {
    return throttleConfig &&
           typeof throttleConfig.enabled === 'boolean' &&
           typeof throttleConfig.interval === 'number' &&
           throttleConfig.interval > 0 &&
           Array.isArray(throttleConfig.events);
  }

  /**
   * 验证监控配置
   * @param {*} monitoringConfig - 待验证的监控配置
   * @returns {boolean} 是否有效
   */
  static isValidMonitoringConfig(monitoringConfig) {
    return monitoringConfig &&
           typeof monitoringConfig.enabled === 'boolean' &&
           typeof monitoringConfig.sampleRate === 'number' &&
           monitoringConfig.sampleRate >= 0 &&
           monitoringConfig.sampleRate <= 1 &&
           Array.isArray(monitoringConfig.metrics);
  }
}

/**
 * 性能工具函数
 */
export class PerformanceUtils {
  /**
   * 计算性能级别
   * @param {number} value - 性能值
   * @param {Object} thresholds - 阈值配置
   * @returns {PerformanceLevel} 性能级别
   */
  static calculatePerformanceLevel(value, thresholds) {
    if (value <= thresholds.excellent) return PerformanceLevel.EXCELLENT;
    if (value <= thresholds.good) return PerformanceLevel.GOOD;
    if (value <= thresholds.fair) return PerformanceLevel.FAIR;
    if (value <= thresholds.poor) return PerformanceLevel.POOR;
    return PerformanceLevel.CRITICAL;
  }

  /**
   * 创建性能指标
   * @param {PerformanceMetricType} type - 指标类型
   * @param {number} value - 指标值
   * @param {string} unit - 单位
   * @param {Object} options - 可选配置
   * @returns {PerformanceMetric} 性能指标
   */
  static createPerformanceMetric(type, value, unit, options = {}) {
    return {
      id: options.id || `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: options.name || type,
      value,
      unit,
      timestamp: new Date(),
      metadata: options.metadata || {},
      level: options.level || PerformanceLevel.GOOD,
      thresholds: options.thresholds || {
        excellent: value * 0.5,
        good: value * 0.8,
        fair: value * 1.2,
        poor: value * 1.5
      }
    };
  }

  /**
   * 计算缓存命中率
   * @param {number} hitCount - 命中次数
   * @param {number} totalCount - 总访问次数
   * @returns {number} 命中率（0-1）
   */
  static calculateCacheHitRate(hitCount, totalCount) {
    if (totalCount === 0) return 0;
    return Math.min(1, Math.max(0, hitCount / totalCount));
  }

  /**
   * 格式化性能值
   * @param {number} value - 性能值
   * @param {string} unit - 单位
   * @param {number} precision - 精度
   * @returns {string} 格式化后的字符串
   */
  static formatPerformanceValue(value, unit, precision = 2) {
    const formattedValue = typeof value === 'number' ? value.toFixed(precision) : value;
    return `${formattedValue} ${unit}`;
  }

  /**
   * 生成优化建议
   * @param {PerformanceReport} report - 性能报告
   * @returns {OptimizationSuggestion[]} 优化建议列表
   */
  static generateOptimizationSuggestions(report) {
    const suggestions = [];
    
    // 基于性能报告生成建议
    if (report.summary.layoutTime > 1000) {
      suggestions.push({
        id: 'layout_optimization',
        type: 'performance',
        title: '优化布局计算性能',
        description: '布局计算时间过长，建议启用缓存或优化算法',
        priority: 'high',
        impact: 0.8,
        effort: 0.6,
        strategies: [OptimizationStrategy.CACHING, OptimizationStrategy.PRECOMPUTATION],
        implementation: {
          steps: ['启用布局缓存', '优化算法复杂度', '使用增量更新'],
          resources: { time: '2-4小时', complexity: 'medium' }
        },
        metrics: {
          before: ['layout-time: >1000ms'],
          after: ['layout-time: <500ms']
        }
      });
    }
    
    if (report.summary.totalNodes > 1000) {
      suggestions.push({
        id: 'large_dataset_optimization',
        type: 'scalability',
        title: '大数据集优化',
        description: '节点数量较多，建议使用虚拟化技术',
        priority: 'medium',
        impact: 0.7,
        effort: 0.8,
        strategies: [OptimizationStrategy.VIRTUAL_SCROLLING, OptimizationStrategy.LAZY_LOADING],
        implementation: {
          steps: ['实现虚拟滚动', '添加懒加载', '优化渲染批次'],
          resources: { time: '4-8小时', complexity: 'high' }
        },
        metrics: {
          before: ['render-time: high', 'memory-usage: high'],
          after: ['render-time: optimized', 'memory-usage: reduced']
        }
      });
    }
    
    return suggestions;
  }
}

/**
 * 默认导出所有性能类型定义
 */
export default {
  PerformanceMetricType,
  PerformanceLevel,
  CacheStrategy,
  OptimizationStrategy,
  MonitoringStatus,
  PerformanceMetricDataType,
  PerformanceReportType,
  CacheItemType,
  CacheStatsType,
  CacheConfigType,
  DebounceConfigType,
  ThrottleConfigType,
  MonitoringConfigType,
  OptimizationSuggestionType,
  PerformanceEventType,
  PerformanceTypeValidator,
  PerformanceUtils
};