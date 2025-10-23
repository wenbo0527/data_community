/**
 * PreviewLineManager Builder 模式实现
 * 提供链式调用的方式来构建 PreviewLineManager 实例
 * 解决复杂的初始化参数配置问题
 */

import { PreviewLineManager } from './PreviewLineManager.js'
import { PreviewLineConfigManager } from '../config/PreviewLineConfig.js'
import { PreviewLineValidator } from './PreviewLineValidator.js'
import { 
  ValidationUtils, 
  ValidationSchemas,
  RequiredParameterError,
  ParameterTypeError,
  ConfigurationConflictError,
  DependencyMissingError
} from './PreviewLineValidationError.js'

/**
 * PreviewLineManager 构建器类
 * 使用 Builder 模式简化复杂对象的创建过程
 */
export class PreviewLineManagerBuilder {
  constructor() {
    // 重置所有配置
    this.reset()
  }

  /**
   * 重置构建器状态
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  reset() {
    this._config = {
      // 核心依赖
      graph: null,
      branchManager: null,
      layoutEngine: null,
      renderer: null,
      
      // 配置管理
      configManager: null,
      customConfig: {},
      
      // 验证器配置
      validatorOptions: {},
      
      // 性能配置
      performanceOptions: {
        enablePerformanceMonitor: false,
        cacheEnabled: true,
        maxCacheSize: 1000
      },
      
      // 调试配置
      debugOptions: {
        enabled: false,
        logLevel: 'info',
        enableDetailedLogs: false
      },
      
      // 事件配置
      eventOptions: {
        enableEventListeners: true,
        customEventHandlers: new Map()
      },
      
      // 初始化配置
      initOptions: {
        autoInitialize: true,
        createForExistingNodes: false,
        validateOnInit: true
      }
    }
    
    return this
  }

  /**
   * 设置图形实例
   * @param {Object} graph - X6 图形实例
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withGraph(graph) {
    try {
      ValidationUtils.validateRequired(graph, 'graph', 'object')
      
      // 验证 Graph 实例的必要方法
      const requiredMethods = ['getNodes', 'addEdge', 'removeEdge', 'getCells']
      for (const method of requiredMethods) {
        if (!graph[method] || typeof graph[method] !== 'function') {
          throw new DependencyMissingError(
            `graph.${method}`,
            'PreviewLineManager',
            `确保传入的 graph 实例包含 ${method} 方法`
          )
        }
      }
      
      this._config.graph = graph
      return this
    } catch (error) {
      throw new ParameterTypeError('graph', 'X6 Graph instance', typeof graph, graph)
    }
  }

  /**
   * 设置分支管理器
   * @param {Object} branchManager - 分支管理器实例
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withBranchManager(branchManager) {
    this._config.branchManager = branchManager
    return this
  }

  /**
   * 设置布局引擎
   * @param {Object} layoutEngine - 布局引擎实例
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withLayoutEngine(layoutEngine) {
    this._config.layoutEngine = layoutEngine
    return this
  }

  /**
   * 设置渲染器
   * @param {Object} renderer - 渲染器实例
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withRenderer(renderer) {
    this._config.renderer = renderer
    return this
  }

  /**
   * 设置配置管理器
   * @param {PreviewLineConfigManager} configManager - 配置管理器实例
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withConfigManager(configManager) {
    ValidationUtils.validateInstance(
      configManager, 
      'configManager', 
      PreviewLineConfigManager, 
      true
    )
    this._config.configManager = configManager
    return this
  }

  /**
   * 设置自定义配置
   * @param {Object} config - 自定义配置对象
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withConfig(config) {
    ValidationUtils.validateType(config, 'config', 'object')
    this._config.customConfig = { ...this._config.customConfig, ...config }
    return this
  }

  /**
   * 设置性能选项
   * @param {Object} options - 性能配置选项
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withPerformanceOptions(options) {
    ValidationUtils.validateType(options, 'performanceOptions', 'object')
    
    // 验证具体的性能选项
    if (options.maxCacheSize !== undefined) {
      ValidationUtils.validateType(options.maxCacheSize, 'maxCacheSize', 'number')
      ValidationUtils.validateRange(options.maxCacheSize, 'maxCacheSize', 1, 10000)
    }
    
    if (options.cacheEnabled !== undefined) {
      ValidationUtils.validateType(options.cacheEnabled, 'cacheEnabled', 'boolean')
    }
    
    this._config.performanceOptions = { ...this._config.performanceOptions, ...options }
    return this
  }

  /**
   * 启用性能监控
   * @param {boolean} enabled - 是否启用
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  enablePerformanceMonitor(enabled = true) {
    this._config.performanceOptions.enablePerformanceMonitor = enabled
    return this
  }

  /**
   * 设置调试选项
   * @param {Object} options - 调试配置选项
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withDebugOptions(options) {
    this._config.debugOptions = { ...this._config.debugOptions, ...options }
    return this
  }

  /**
   * 启用调试模式
   * @param {boolean} enabled - 是否启用
   * @param {string} logLevel - 日志级别
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  enableDebug(enabled = true, logLevel = 'info') {
    this._config.debugOptions.enabled = enabled
    this._config.debugOptions.logLevel = logLevel
    return this
  }

  /**
   * 设置事件选项
   * @param {Object} options - 事件配置选项
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withEventOptions(options) {
    this._config.eventOptions = { ...this._config.eventOptions, ...options }
    return this
  }

  /**
   * 添加自定义事件处理器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理器
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  addEventHandler(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new Error('事件处理器必须是一个函数')
    }
    this._config.eventOptions.customEventHandlers.set(eventName, handler)
    return this
  }

  /**
   * 设置初始化选项
   * @param {Object} options - 初始化配置选项
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withInitOptions(options) {
    this._config.initOptions = { ...this._config.initOptions, ...options }
    return this
  }

  /**
   * 设置是否自动初始化
   * @param {boolean} autoInit - 是否自动初始化
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  autoInitialize(autoInit = true) {
    this._config.initOptions.autoInitialize = autoInit
    return this
  }

  /**
   * 设置验证器选项
   * @param {Object} options - 验证器配置选项
   * @returns {PreviewLineManagerBuilder} 构建器实例
   */
  withValidatorOptions(options) {
    this._config.validatorOptions = { ...this._config.validatorOptions, ...options }
    return this
  }

  /**
   * 验证配置的完整性和正确性
   * @private
   * @throws {Error} 当配置无效时抛出错误
   */
  validate() {
    const errors = []
    
    try {
      // 验证必需的参数
      if (!this._config.graph) {
        errors.push(new RequiredParameterError('graph'))
      }
      
      // 验证配置冲突
      if (this._config.performanceOptions?.cacheEnabled === false && 
          this._config.performanceOptions?.maxCacheSize > 0) {
        errors.push(new ConfigurationConflictError(
          'performanceOptions.cacheEnabled 为 false 时，maxCacheSize 应为 0 或未设置'
        ))
      }
      
      // 验证调试和性能配置冲突
      if (this._config.debugOptions?.enabled && 
          this._config.performanceOptions?.cacheEnabled === false) {
        console.warn('警告：调试模式开启时建议启用缓存以提高性能')
      }
      
      // 验证事件处理器
      if (this._config.eventOptions?.handlers) {
        for (const [event, handler] of Object.entries(this._config.eventOptions.handlers)) {
          ValidationUtils.validateFunction(handler, `eventHandler.${event}`)
        }
      }
      
      // 验证依赖关系
      if (this._config.branchManager && !this._config.layoutEngine) {
        console.warn('警告：使用 branchManager 时建议同时配置 layoutEngine')
      }
      
      if (errors.length > 0) {
        throw new Error(`配置验证失败：\n${errors.map(e => e.message).join('\n')}`)
      }
      
    } catch (error) {
      if (error.name && error.name.includes('ValidationError')) {
        throw error
      }
      throw new Error(`配置验证过程中发生错误：${error.message}`)
    }
  }

  /**
   * 构建 PreviewLineManager 实例
   * @returns {PreviewLineManager} 构建的实例
   */
  build() {
    // 验证配置
    this.validate()

    // 准备构造函数参数
    const options = this._prepareOptions()

    // 创建实例
    const manager = new PreviewLineManager(options)

    // 应用额外配置
    this._applyAdditionalConfig(manager)

    return manager
  }

  /**
   * 准备构造函数选项
   * @returns {Object} 构造函数选项
   * @private
   */
  _prepareOptions() {
    const config = this._config

    // 创建或使用现有的配置管理器
    let configManager = config.configManager
    if (!configManager && Object.keys(config.customConfig).length > 0) {
      configManager = new PreviewLineConfigManager(config.customConfig)
    }

    // 合并调试配置到主配置
    const mergedConfig = {
      ...config.customConfig,
      debug: config.debugOptions,
      performance: config.performanceOptions
    }

    return {
      graph: config.graph,
      branchManager: config.branchManager,
      layoutEngine: config.layoutEngine,
      renderer: config.renderer,
      configManager: configManager,
      config: mergedConfig,
      validatorOptions: config.validatorOptions,
      initOptions: config.initOptions
    }
  }

  /**
   * 应用额外配置
   * @param {PreviewLineManager} manager - 管理器实例
   * @private
   */
  _applyAdditionalConfig(manager) {
    const config = this._config

    // 应用事件处理器
    if (config.eventOptions.customEventHandlers.size > 0) {
      config.eventOptions.customEventHandlers.forEach((handler, eventName) => {
        manager.addEventListener(eventName, handler)
      })
    }

    // 应用初始化选项
    if (!config.initOptions.autoInitialize) {
      // 如果不自动初始化，需要手动调用
      console.info('PreviewLineManager 已创建但未初始化，请手动调用 initialize() 方法')
    }

    if (config.initOptions.createForExistingNodes && manager.graph) {
      // 为现有节点创建预览线
      setTimeout(() => {
        manager.createPreviewLinesForExistingNodes()
      }, 0)
    }
  }

  /**
   * 创建预设配置的构建器
   * @returns {PreviewLineManagerBuilder} 预设构建器
   */
  static createDefault() {
    return new PreviewLineManagerBuilder()
      .enablePerformanceMonitor(false)
      .enableDebug(false)
      .autoInitialize(true)
      .withPerformanceOptions({
        cacheEnabled: true,
        maxCacheSize: 500
      })
  }

  /**
   * 创建开发环境配置的构建器
   * @returns {PreviewLineManagerBuilder} 开发环境构建器
   */
  static createForDevelopment() {
    return new PreviewLineManagerBuilder()
      .enablePerformanceMonitor(true)
      .enableDebug(true, 'debug')
      .autoInitialize(true)
      .withDebugOptions({
        enableDetailedLogs: true
      })
      .withPerformanceOptions({
        cacheEnabled: true,
        maxCacheSize: 1000
      })
  }

  /**
   * 创建生产环境配置的构建器
   * @returns {PreviewLineManagerBuilder} 生产环境构建器
   */
  static createForProduction() {
    return new PreviewLineManagerBuilder()
      .enablePerformanceMonitor(false)
      .enableDebug(false)
      .autoInitialize(true)
      .withPerformanceOptions({
        cacheEnabled: true,
        maxCacheSize: 2000
      })
  }

  /**
   * 创建测试环境配置的构建器
   * @returns {PreviewLineManagerBuilder} 测试环境构建器
   */
  static createForTesting() {
    return new PreviewLineManagerBuilder()
      .enablePerformanceMonitor(false)
      .enableDebug(true, 'warn')
      .autoInitialize(false) // 测试环境通常需要手动控制初始化
      .withInitOptions({
        validateOnInit: false // 测试环境可能使用模拟对象
      })
  }
}

/**
 * 便捷的工厂函数
 * @returns {PreviewLineManagerBuilder} 新的构建器实例
 */
export function createPreviewLineManagerBuilder() {
  return new PreviewLineManagerBuilder()
}

/**
 * 快速创建 PreviewLineManager 的便捷函数
 * @param {Object} graph - 图形实例
 * @param {Object} options - 其他选项
 * @returns {PreviewLineManager} 创建的管理器实例
 */
export function createPreviewLineManager(graph, options = {}) {
  const builder = new PreviewLineManagerBuilder()
    .withGraph(graph)

  // 应用其他选项
  if (options.branchManager) builder.withBranchManager(options.branchManager)
  if (options.layoutEngine) builder.withLayoutEngine(options.layoutEngine)
  if (options.renderer) builder.withRenderer(options.renderer)
  if (options.config) builder.withConfig(options.config)
  if (options.debug) builder.enableDebug(true, options.debugLevel || 'info')

  return builder.build()
}

/**
 * 应用性能优化预设
 * @returns {PreviewLineManagerBuilder} 构建器实例
 */
PreviewLineManagerBuilder.prototype.performance = function() {
  this._config.performanceOptions = {
    enablePerformanceMonitor: true,
    cacheEnabled: true,
    maxCacheSize: 2000
  };
  this._config.debugOptions = {
    enabled: false,
    logLevel: 'warn',
    enableDetailedLogs: false
  };
  return this;
};

/**
 * 应用调试模式预设
 * @returns {PreviewLineManagerBuilder} 构建器实例
 */
PreviewLineManagerBuilder.prototype.debug = function() {
  this._config.debugOptions = {
    enabled: true,
    logLevel: 'debug',
    enableDetailedLogs: true
  };
  this._config.performanceOptions = {
    enablePerformanceMonitor: true,
    cacheEnabled: true,
    maxCacheSize: 1000
  };
  return this;
};

/**
 * 应用最小化配置预设
 * @returns {PreviewLineManagerBuilder} 构建器实例
 */
PreviewLineManagerBuilder.prototype.minimal = function() {
  this._config.performanceOptions = {
    enablePerformanceMonitor: false,
    cacheEnabled: false,
    maxCacheSize: 0
  };
  this._config.debugOptions = {
    enabled: false,
    logLevel: 'error',
    enableDetailedLogs: false
  };
  this._config.eventOptions = {
    enableEventListeners: false,
    customEventHandlers: new Map()
  };
  return this;
};

/**
 * 设置主题配置
 * @param {Object|string} theme - 主题配置或主题名称
 * @returns {PreviewLineManagerBuilder} 构建器实例
 */
PreviewLineManagerBuilder.prototype.theme = function(theme) {
  if (typeof theme === 'string') {
    // 预定义主题
    switch (theme) {
      case 'dark':
        this._config.customConfig.theme = {
          mode: 'dark',
          colors: {
            primary: '#1890ff',
            secondary: '#722ed1',
            background: '#141414'
          }
        };
        break;
      case 'light':
        this._config.customConfig.theme = {
          mode: 'light',
          colors: {
            primary: '#1890ff',
            secondary: '#722ed1',
            background: '#ffffff'
          }
        };
        break;
      default:
        console.warn(`未知的主题: ${theme}`);
    }
  } else if (typeof theme === 'object') {
    this._config.customConfig.theme = { ...theme };
  }
  return this;
};

/**
 * 设置动画配置
 * @param {Object|boolean} animation - 动画配置或启用/禁用动画
 * @returns {PreviewLineManagerBuilder} 构建器实例
 */
PreviewLineManagerBuilder.prototype.animation = function(animation) {
  if (typeof animation === 'boolean') {
    this._config.customConfig.animation = {
      enabled: animation,
      duration: animation ? 300 : 0,
      easing: 'ease-in-out'
    };
  } else if (typeof animation === 'object') {
    this._config.customConfig.animation = { ...animation };
  }
  return this;
};

/**
 * 设置任意配置项
 * @param {string} key - 配置键
 * @param {*} value - 配置值
 * @returns {PreviewLineManagerBuilder} 构建器实例
 */
PreviewLineManagerBuilder.prototype.set = function(key, value) {
  if (typeof key === 'string') {
    // 支持点号分隔的路径，如 'debug.enabled'
    const keys = key.split('.');
    let target = this._config.customConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    
    target[keys[keys.length - 1]] = value;
  }
  return this;
};