/**
 * 通用验证工具类
 * 提供统一的边界检查和验证方法
 */
export class ValidationUtils {
  /**
   * 检查节点是否有效
   * @param {Object} node - 要检查的节点
   * @returns {boolean} 节点是否有效
   */
  static isValidNode(node) {
    return node && 
           typeof node === 'object' && 
           node.id && 
           typeof node.getData === 'function' &&
           typeof node.position === 'function'
  }

  /**
   * 检查边是否有效
   * @param {Object} edge - 要检查的边
   * @param {Object} graph - 图实例
   * @returns {boolean} 边是否有效
   */
  static isValidEdge(edge, graph) {
    if (!edge || !edge.isEdge || !edge.isEdge()) return false
    if (!graph || !graph.hasCell(edge.id)) return false
    
    const source = edge.getSource()
    const target = edge.getTarget()
    
    // 安全检查source和target对象
    if (!source || !target) return false
    
    // 安全获取cell属性，如果没有cell属性则使用id
    const sourceCell = source.cell || source.id
    const targetCell = target.cell || target.id
    
    return sourceCell && targetCell &&
           graph.hasCell(sourceCell) && graph.hasCell(targetCell)
  }

  /**
   * 检查节点配置是否有效
   * @param {Object} config - 节点配置
   * @param {string} nodeType - 节点类型
   * @returns {Object} 验证结果 { isValid, errors }
   */
  static validateNodeConfig(config, nodeType) {
    const errors = []
    
    if (!config || typeof config !== 'object') {
      errors.push('配置对象无效')
      return { isValid: false, errors }
    }

    // 根据节点类型进行特定验证
    switch (nodeType) {
      case 'audience-split':
        if (!config.crowdLayers || !Array.isArray(config.crowdLayers)) {
          errors.push('人群分流节点缺少有效的人群层配置')
        }
        break
      case 'event-split':
        if (!config.eventConfig || !config.eventConfig.eventId) {
          errors.push('事件分流节点缺少事件配置')
        }
        break
      case 'ab-test':
        if (!config.testConfig || !config.testConfig.variants) {
          errors.push('AB测试节点缺少测试配置')
        }
        break
    }

    return { isValid: errors.length === 0, errors }
  }

  /**
   * 安全地获取嵌套属性
   * @param {Object} obj - 对象
   * @param {string} path - 属性路径，如 'data.config.type'
   * @param {*} defaultValue - 默认值
   * @returns {*} 属性值或默认值
   */
  static safeGet(obj, path, defaultValue = null) {
    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : defaultValue
      }, obj)
    } catch (error) {
      return defaultValue
    }
  }

  /**
   * 深度克隆对象
   * @param {*} obj - 要克隆的对象
   * @returns {*} 克隆后的对象
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => this.deepClone(item))
    if (typeof obj === 'object') {
      const cloned = {}
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key])
      })
      return cloned
    }
    return obj
  }

  /**
   * 检查对象是否为空
   * @param {*} obj - 要检查的对象
   * @returns {boolean} 是否为空
   */
  static isEmpty(obj) {
    if (obj == null) return true
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
    if (typeof obj === 'object') return Object.keys(obj).length === 0
    return false
  }

  /**
   * 生成唯一ID
   * @param {string} prefix - 前缀
   * @returns {string} 唯一ID
   */
  static generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间（毫秒）
   * @param {Object} options - 选项
   * @returns {Function} 防抖后的函数
   */
  static debounce(func, wait, options = {}) {
    let timeout
    let lastArgs
    const { leading = false, trailing = true, maxWait } = options
    
    return function executedFunction(...args) {
      lastArgs = args
      const later = () => {
        timeout = null
        if (trailing && lastArgs) {
          func.apply(this, lastArgs)
        }
      }
      
      const callNow = leading && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      
      if (callNow) {
        func.apply(this, args)
      }
      
      // maxWait 支持
      if (maxWait && !timeout) {
        setTimeout(() => {
          if (timeout) {
            clearTimeout(timeout)
            later()
          }
        }, maxWait)
      }
    }
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  static throttle(func, limit) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  /**
   * 安全执行异步函数
   * @param {Function} asyncFn - 异步函数
   * @param {string} context - 上下文信息
   * @param {*} fallbackValue - 失败时的回退值
   * @returns {Promise} 执行结果
   */
  static async safeExecuteAsync(asyncFn, context = '', fallbackValue = null) {
    try {
      return await asyncFn()
    } catch (error) {
      console.error(`[${context}] 异步操作失败:`, error)
      return fallbackValue
    }
  }

  /**
   * 重试机制
   * @param {Function} fn - 要重试的函数
   * @param {number} maxRetries - 最大重试次数
   * @param {number} delay - 重试延迟（毫秒）
   * @returns {Promise} 执行结果
   */
  static async retry(fn, maxRetries = 3, delay = 1000) {
    let lastError
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        if (i < maxRetries) {
          console.warn(`重试 ${i + 1}/${maxRetries} 失败:`, error.message)
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
        }
      }
    }
    
    throw lastError
  }
}

/**
 * 性能监控工具类
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.history = []
  }

  /**
   * 开始计时
   * @param {string} name - 计时器名称
   */
  startTimer(name) {
    this.metrics.set(name, {
      start: performance.now(),
      name
    })
  }

  /**
   * 结束计时
   * @param {string} name - 计时器名称
   * @returns {number} 耗时（毫秒）
   */
  endTimer(name) {
    const timer = this.metrics.get(name)
    if (timer) {
      const duration = performance.now() - timer.start
      const result = {
        name,
        duration: Math.round(duration * 100) / 100,
        timestamp: new Date().toISOString()
      }
      
      this.history.push(result)
      this.metrics.delete(name)
      
      console.log(`[Performance] ${name}: ${result.duration}ms`)
      return result.duration
    }
    return 0
  }

  /**
   * 测量异步函数性能
   * @param {string} name - 测量名称
   * @param {Function} asyncFn - 异步函数
   * @returns {Function} 包装后的函数
   */
  measureAsync(name, asyncFn) {
    return async (...args) => {
      this.startTimer(name)
      try {
        const result = await asyncFn(...args)
        this.endTimer(name)
        return result
      } catch (error) {
        this.endTimer(name)
        throw error
      }
    }
  }

  /**
   * 获取性能历史
   * @param {number} limit - 限制数量
   * @returns {Array} 性能历史记录
   */
  getHistory(limit = 50) {
    return this.history.slice(-limit)
  }

  /**
   * 清除历史记录
   */
  clearHistory() {
    this.history = []
  }

  /**
   * 获取性能统计
   * @returns {Object} 性能统计信息
   */
  getStats() {
    const stats = {}
    
    this.history.forEach(record => {
      if (!stats[record.name]) {
        stats[record.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: 0,
          avg: 0
        }
      }
      
      const stat = stats[record.name]
      stat.count++
      stat.total += record.duration
      stat.min = Math.min(stat.min, record.duration)
      stat.max = Math.max(stat.max, record.duration)
      stat.avg = stat.total / stat.count
    })
    
    return stats
  }
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  constructor() {
    this.errorHistory = []
    this.maxHistorySize = 100
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} context - 上下文信息
   * @param {Object} metadata - 元数据
   */
  handleError(error, context = '', metadata = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      id: ValidationUtils.generateId('error')
    }

    this.errorHistory.push(errorRecord)
    
    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift()
    }

    console.error(`[ErrorHandler] ${context}:`, error, metadata)
    
    // 可以在这里添加错误上报逻辑
    this.reportError(errorRecord)
  }

  /**
   * 上报错误（可扩展）
   * @param {Object} errorRecord - 错误记录
   */
  reportError(errorRecord) {
    // 这里可以添加错误上报到监控系统的逻辑
    // 例如发送到 Sentry、LogRocket 等
  }

  /**
   * 获取错误历史
   * @param {number} limit - 限制数量
   * @returns {Array} 错误历史记录
   */
  getErrorHistory(limit = 20) {
    return this.errorHistory.slice(-limit)
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory() {
    this.errorHistory = []
  }

  /**
   * 包装函数以自动处理错误
   * @param {Function} fn - 要包装的函数
   * @param {string} context - 上下文信息
   * @returns {Function} 包装后的函数
   */
  wrapFunction(fn, context) {
    return (...args) => {
      try {
        const result = fn(...args)
        
        // 如果是 Promise，处理异步错误
        if (result && typeof result.catch === 'function') {
          return result.catch(error => {
            this.handleError(error, context, { args })
            throw error
          })
        }
        
        return result
      } catch (error) {
        this.handleError(error, context, { args })
        throw error
      }
    }
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor()
export const errorHandler = new ErrorHandler()

// 导出默认实例
export default {
  ValidationUtils,
  PerformanceMonitor,
  ErrorHandler,
  performanceMonitor,
  errorHandler
}