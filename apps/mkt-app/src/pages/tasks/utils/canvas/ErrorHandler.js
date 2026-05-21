/**
 * 错误处理工具类
 * 提供统一的错误处理机制，消除重复的try-catch代码
 */
export class ErrorHandler {
  // 错误类型常量
  static ERROR_TYPES = {
    GRAPH_OPERATION: 'GRAPH_OPERATION',
    EVENT_HANDLING: 'EVENT_HANDLING',
    DATA_VALIDATION: 'DATA_VALIDATION',
    NETWORK_REQUEST: 'NETWORK_REQUEST',
    FILE_OPERATION: 'FILE_OPERATION'
  }

  // 错误级别
  static ERROR_LEVELS = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal'
  }

  /**
   * 处理操作并捕获错误
   * @param {Function} operation - 要执行的操作函数
   * @param {string} operationName - 操作名称
   * @param {Object} options - 选项配置
   * @returns {*} 操作结果或null
   */
  static handleOperation(operation, operationName = '未知操作', options = {}) {
    const {
      errorType = this.ERROR_TYPES.GRAPH_OPERATION,
      level = this.ERROR_LEVELS.ERROR,
      showNotification = false,
      retryCount = 0,
      retryDelay = 1000
    } = options

    let attempts = 0
    const maxAttempts = retryCount + 1

    const executeOperation = async () => {
      try {
        attempts++
        const result = await operation()
        
        // 记录成功日志
        if (attempts > 1) {
          console.log(`[ErrorHandler] ${operationName} 重试成功 (第${attempts}次尝试)`)
        }
        
        return result
      } catch (error) {
        const errorInfo = {
          operation: operationName,
          type: errorType,
          level,
          attempt: attempts,
          maxAttempts,
          error: error.message || error,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }

        // 记录错误日志
        this.logError(errorInfo)

        // 如果还有重试机会
        if (attempts < maxAttempts) {
          console.warn(`[ErrorHandler] ${operationName} 失败，${retryDelay}ms后重试 (${attempts}/${maxAttempts})`)
          await this.delay(retryDelay)
          return executeOperation()
        }

        // 显示通知
        if (showNotification) {
          this.showErrorNotification(operationName, error)
        }

        // 抛出错误，使用标准错误处理
        throw new Error(`操作 ${operationName} 执行失败: ${error.message || error}`)
      }
    }

    return executeOperation()
  }

  /**
   * 处理异步操作
   * @param {Function} asyncOperation - 异步操作函数
   * @param {string} operationName - 操作名称
   * @param {Object} options - 选项配置
   * @returns {Promise} Promise对象
   */
  static async handleAsyncOperation(asyncOperation, operationName = '异步操作', options = {}) {
    return this.handleOperation(asyncOperation, operationName, options)
  }

  /**
   * 验证数据
   * @param {*} data - 要验证的数据
   * @param {Function} validator - 验证函数
   * @param {string} dataName - 数据名称
   * @returns {boolean} 验证结果
   */
  static validateData(data, validator, dataName = '数据') {
    return this.handleOperation(() => {
      if (!validator(data)) {
        throw new Error(`${dataName} 验证失败`)
      }
      return data
    }, `验证${dataName}`)
  }

  /**
   * 处理事件监听器错误
   * @param {Function} eventHandler - 事件处理函数
   * @param {string} eventName - 事件名称
   * @returns {Function} 包装后的事件处理函数
   */
  static wrapEventHandler(eventHandler, eventName = '事件') {
    return (...args) => {
      return this.handleOperation(() => {
        return eventHandler(...args)
      }, `处理${eventName}`, {
        errorType: this.ERROR_TYPES.EVENT_HANDLING,
        level: this.ERROR_LEVELS.WARN
      })
    }
  }

  /**
   * 包装函数以提供错误处理
   * @param {Function} func - 要包装的函数
   * @param {string} functionName - 函数名称
   * @param {Object} options - 选项配置
   * @returns {Function} 包装后的函数
   */
  static wrapFunction(func, functionName = '函数', options = {}) {
    return (...args) => {
      return this.handleOperation(() => {
        return func(...args)
      }, `执行${functionName}`, {
        errorType: this.ERROR_TYPES.GRAPH_OPERATION,
        level: this.ERROR_LEVELS.ERROR,
        ...options
      })
    }
  }

  /**
   * 包装异步函数以提供错误处理
   * @param {Function} asyncFunc - 要包装的异步函数
   * @param {string} functionName - 函数名称
   * @param {Object} options - 选项配置
   * @returns {Function} 包装后的异步函数
   */
  static wrapAsyncFunction(asyncFunc, functionName = '异步函数', options = {}) {
    return async (...args) => {
      return this.handleAsyncOperation(() => {
        return asyncFunc(...args)
      }, `执行${functionName}`, {
        errorType: this.ERROR_TYPES.GRAPH_OPERATION,
        level: this.ERROR_LEVELS.ERROR,
        ...options
      })
    }
  }

  /**
   * 包装操作以提供错误处理
   * @param {Function} operation - 要包装的操作函数
   * @param {string} operationName - 操作名称
   * @param {Object} options - 选项配置
   * @returns {Function} 包装后的操作函数
   */
  static wrapOperation(operation, operationName = '操作', options = {}) {
    return (...args) => {
      return this.handleOperation(() => {
        return operation(...args)
      }, operationName, {
        errorType: this.ERROR_TYPES.GRAPH_OPERATION,
        level: this.ERROR_LEVELS.ERROR,
        ...options
      })
    }
  }

  /**
   * 记录错误日志
   * @param {Object} errorInfo - 错误信息
   */
  static logError(errorInfo) {
    const logMessage = `[ErrorHandler] ${errorInfo.operation} 失败`
    const logData = {
      type: errorInfo.type,
      level: errorInfo.level,
      attempt: errorInfo.attempt,
      error: errorInfo.error,
      timestamp: errorInfo.timestamp
    }

    switch (errorInfo.level) {
      case this.ERROR_LEVELS.INFO:
        console.info(logMessage, logData)
        break
      case this.ERROR_LEVELS.WARN:
        console.warn(logMessage, logData)
        break
      case this.ERROR_LEVELS.ERROR:
        console.error(logMessage, logData)
        break
      case this.ERROR_LEVELS.FATAL:
        console.error(`[FATAL] ${logMessage}`, logData)
        break
      default:
        console.log(logMessage, logData)
    }
  }

  /**
   * 显示错误通知
   * @param {string} operationName - 操作名称
   * @param {Error} error - 错误对象
   */
  static showErrorNotification(operationName, error) {
    // 这里可以集成具体的通知组件
    // 例如：Message.error() 或 notification.error()
    console.error(`操作失败: ${operationName}`, error.message)
    
    // 如果有全局的通知系统，可以在这里调用
    if (window.__GLOBAL_NOTIFICATION__) {
      window.__GLOBAL_NOTIFICATION__.error({
        title: '操作失败',
        message: `${operationName}: ${error.message}`
      })
    }
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise} Promise对象
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 创建错误对象
   * @param {string} message - 错误消息
   * @param {string} type - 错误类型
   * @param {Object} details - 错误详情
   * @returns {Error} 错误对象
   */
  static createError(message, type = this.ERROR_TYPES.GRAPH_OPERATION, details = {}) {
    const error = new Error(message)
    error.type = type
    error.details = details
    error.timestamp = new Date().toISOString()
    return error
  }

  /**
   * 检查是否为特定类型的错误
   * @param {Error} error - 错误对象
   * @param {string} type - 错误类型
   * @returns {boolean} 是否匹配
   */
  static isErrorType(error, type) {
    return error && error.type === type
  }

  /**
   * 获取错误摘要信息
   * @param {Error} error - 错误对象
   * @returns {Object} 错误摘要
   */
  static getErrorSummary(error) {
    return {
      message: error.message || '未知错误',
      type: error.type || 'UNKNOWN',
      timestamp: error.timestamp || new Date().toISOString(),
      details: error.details || {}
    }
  }

  /**
   * 处理错误的通用方法
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   * @param {Object} options - 选项配置
   */
  static handleError(error, context = '未知操作', options = {}) {
    const {
      level = this.ERROR_LEVELS.ERROR,
      showNotification = false,
      logToConsole = true
    } = options

    const errorInfo = {
      operation: context,
      type: this.ERROR_TYPES.GRAPH_OPERATION,
      level,
      error: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }

    // 记录错误日志
    if (logToConsole) {
      this.logError(errorInfo)
    }

    // 显示通知
    if (showNotification) {
      this.showErrorNotification(context, error)
    }

    // 根据错误级别决定是否抛出错误
    if (level === this.ERROR_LEVELS.FATAL) {
      throw error
    }
  }
}