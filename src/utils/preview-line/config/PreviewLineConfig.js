/**
 * 预览线配置管理器
 * 提供统一的配置管理和默认配置
 */

import { PreviewLineStates, PreviewLineTypes } from '../types/PreviewLineTypes.js'

/**
 * 默认预览线配置
 */
export const DEFAULT_CONFIG = {
  // 性能配置
  performance: {
    enableCache: true,
    cacheTimeout: 30000, // 30秒
    enableDebounce: true,
    debounceDelay: 100, // 100毫秒
    enableThrottle: true,
    throttleDelay: 50, // 50毫秒
    enablePerformanceMonitor: true,
    maxCacheSize: 1000
  },

  // 渲染配置
  render: {
    defaultStroke: '#1890ff',
    defaultStrokeWidth: 2,
    hoverStroke: '#40a9ff',
    hoverStrokeWidth: 3,
    draggingStroke: '#722ed1',
    draggingStrokeWidth: 3,
    connectedStroke: '#52c41a',
    connectedStrokeWidth: 2,
    invalidStroke: '#ff4d4f',
    invalidStrokeWidth: 2,
    opacity: 0.8,
    hoverOpacity: 1.0,
    animationDuration: 200
  },

  // 吸附配置
  snap: {
    enabled: true,
    threshold: 80, // 吸附阈值（像素）- 调整为80像素以支持更远距离的吸附
    gridSize: 10, // 网格大小
    enableGridSnap: true,
    enableNodeSnap: true,
    snapToCenter: true,
    snapToEdge: true
  },

  // 布局配置
  layout: {
    defaultSpacing: 100, // 默认间距
    minSpacing: 50, // 最小间距
    maxSpacing: 200, // 最大间距
    branchSpacing: 80, // 分支间距
    verticalOffset: 40, // 垂直偏移
    horizontalOffset: 120 // 水平偏移
  },

  // 验证配置
  validation: {
    enableStrictMode: false,
    enableWarnings: true,
    maxRetries: 3,
    retryDelay: 1000, // 重试延迟（毫秒）
    enableAutoFix: true
  },

  // 调试配置
  debug: {
    enabled: false,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    enableConsoleLog: true,
    enablePerformanceLog: false,
    maxLogEntries: 1000
  },

  // 事件配置
  events: {
    enableBubbling: true,
    enableCapture: false,
    debounceEvents: ['mousemove', 'scroll'],
    throttleEvents: ['resize']
  }
}

/**
 * 预览线配置管理器类
 */
export class PreviewLineConfigManager {
  constructor(customConfig = {}) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, customConfig)
    this.listeners = new Map()
  }

  /**
   * 深度合并配置
   * @param {Object} defaultConfig - 默认配置
   * @param {Object} customConfig - 自定义配置
   * @returns {Object} 合并后的配置
   */
  mergeConfig(defaultConfig, customConfig) {
    const merged = { ...defaultConfig }
    
    for (const [key, value] of Object.entries(customConfig)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        merged[key] = this.mergeConfig(merged[key] || {}, value)
      } else {
        merged[key] = value
      }
    }
    
    return merged
  }

  /**
   * 获取配置值
   * @param {string} path - 配置路径，如 'performance.enableCache'
   * @param {*} defaultValue - 默认值
   * @returns {*} 配置值
   */
  get(path, defaultValue = undefined) {
    const keys = path.split('.')
    let current = this.config
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return defaultValue
      }
    }
    
    return current
  }

  /**
   * 设置配置值
   * @param {string} path - 配置路径
   * @param {*} value - 配置值
   */
  set(path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    let current = this.config
    
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    const oldValue = current[lastKey]
    current[lastKey] = value
    
    // 触发配置变更事件
    this.notifyChange(path, value, oldValue)
  }

  /**
   * 批量更新配置
   * @param {Object} updates - 配置更新对象
   */
  update(updates) {
    const oldConfig = JSON.parse(JSON.stringify(this.config))
    this.config = this.mergeConfig(this.config, updates)
    
    // 触发批量更新事件
    this.notifyChange('*', this.config, oldConfig)
  }

  /**
   * 重置配置为默认值
   * @param {string} [path] - 要重置的配置路径，不传则重置全部
   */
  reset(path) {
    if (path) {
      const defaultValue = this.get.call({ config: DEFAULT_CONFIG }, path)
      this.set(path, defaultValue)
    } else {
      const oldConfig = this.config
      this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
      this.notifyChange('*', this.config, oldConfig)
    }
  }

  /**
   * 监听配置变更
   * @param {string} path - 配置路径，'*' 表示监听所有变更
   * @param {Function} callback - 回调函数
   */
  onChange(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set())
    }
    this.listeners.get(path).add(callback)
    
    // 返回取消监听的函数
    return () => {
      const pathListeners = this.listeners.get(path)
      if (pathListeners) {
        pathListeners.delete(callback)
        if (pathListeners.size === 0) {
          this.listeners.delete(path)
        }
      }
    }
  }

  /**
   * 通知配置变更
   * @param {string} path - 变更路径
   * @param {*} newValue - 新值
   * @param {*} oldValue - 旧值
   */
  notifyChange(path, newValue, oldValue) {
    // 通知具体路径的监听器
    const pathListeners = this.listeners.get(path)
    if (pathListeners) {
      pathListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path)
        } catch (error) {
          console.error('配置变更监听器执行错误:', error)
        }
      })
    }
    
    // 通知全局监听器
    if (path !== '*') {
      const globalListeners = this.listeners.get('*')
      if (globalListeners) {
        globalListeners.forEach(callback => {
          try {
            callback(newValue, oldValue, path)
          } catch (error) {
            console.error('全局配置变更监听器执行错误:', error)
          }
        })
      }
    }
  }

  /**
   * 获取完整配置
   * @returns {Object} 完整配置对象
   */
  getAll() {
    return JSON.parse(JSON.stringify(this.config))
  }

  /**
   * 验证配置有效性
   * @returns {Object} 验证结果
   */
  validate() {
    const errors = []
    const warnings = []
    
    // 验证性能配置
    const perf = this.config.performance
    if (perf.cacheTimeout < 1000) {
      warnings.push('缓存超时时间过短，可能影响性能')
    }
    if (perf.debounceDelay < 50) {
      warnings.push('防抖延迟过短，可能导致频繁执行')
    }
    
    // 验证渲染配置
    const render = this.config.render
    if (render.opacity < 0 || render.opacity > 1) {
      errors.push('透明度值必须在0-1之间')
    }
    
    // 验证吸附配置
    const snap = this.config.snap
    if (snap.threshold < 0) {
      errors.push('吸附阈值不能为负数')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 销毁配置管理器
   */
  destroy() {
    this.listeners.clear()
    this.config = null
  }
}

// 创建默认配置管理器实例
export const defaultConfigManager = new PreviewLineConfigManager()

// 导出配置相关工具函数
export const ConfigUtils = {
  /**
   * 根据节点类型获取默认配置
   * @param {string} nodeType - 节点类型
   * @returns {Object} 节点特定配置
   */
  getNodeTypeConfig(nodeType) {
    const baseConfig = defaultConfigManager.getAll()
    
    // 根据节点类型调整配置
    switch (nodeType) {
      case 'audience-split':
      case 'event-split':
        return {
          ...baseConfig,
          layout: {
            ...baseConfig.layout,
            branchSpacing: 60
          }
        }
      case 'ab-test':
        return {
          ...baseConfig,
          render: {
            ...baseConfig.render,
            defaultStroke: '#722ed1'
          }
        }
      default:
        return baseConfig
    }
  },

  /**
   * 根据预览线状态获取样式配置
   * @param {string} state - 预览线状态
   * @returns {Object} 样式配置
   */
  getStateStyle(state) {
    const render = defaultConfigManager.get('render')
    
    switch (state) {
      case PreviewLineStates.HOVER:
        return {
          stroke: render.hoverStroke,
          strokeWidth: render.hoverStrokeWidth,
          opacity: render.hoverOpacity
        }
      case PreviewLineStates.DRAGGING:
        return {
          stroke: render.draggingStroke,
          strokeWidth: render.draggingStrokeWidth,
          opacity: render.opacity
        }
      case PreviewLineStates.CONNECTED:
        return {
          stroke: render.connectedStroke,
          strokeWidth: render.connectedStrokeWidth,
          opacity: render.opacity
        }
      case PreviewLineStates.INVALID:
        return {
          stroke: render.invalidStroke,
          strokeWidth: render.invalidStrokeWidth,
          opacity: render.opacity
        }
      default:
        return {
          stroke: render.defaultStroke,
          strokeWidth: render.defaultStrokeWidth,
          opacity: render.opacity
        }
    }
  }
}