/**
 * 错误处理工具类
 * 提供统一的错误处理和日志记录功能
 */

export class ErrorHandler {
  static logError(context, error, additionalInfo = {}) {
    console.error(`❌ [${context}] 错误:`, {
      message: error.message,
      stack: error.stack,
      ...additionalInfo
    })
  }

  static logWarning(context, message, additionalInfo = {}) {
    console.warn(`⚠️ [${context}] 警告: ${message}`, additionalInfo)
  }

  static validateRequired(params, context = 'Unknown') {
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        throw new Error(`${context}: 必需参数 '${key}' 不能为空`)
      }
    }
  }

  static safeExecute(fn, context, fallback = null) {
    try {
      return fn()
    } catch (error) {
      this.logError(context, error)
      return fallback
    }
  }

  static async safeExecuteAsync(fn, context, fallback = null) {
    try {
      return await fn()
    } catch (error) {
      this.logError(context, error)
      return fallback
    }
  }
}

/**
 * 参数验证装饰器
 */
export function validateParams(validations) {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value
    descriptor.value = function(...args) {
      try {
        // 执行验证
        validations.forEach((validation, index) => {
          if (validation && typeof validation === 'function') {
            validation(args[index], `${target.constructor.name}.${propertyName}`)
          }
        })
        return method.apply(this, args)
      } catch (error) {
        ErrorHandler.logError(`${target.constructor.name}.${propertyName}`, error)
        throw error
      }
    }
  }
}

/**
 * 常用验证函数
 */
export const Validators = {
  notNull: (value, context) => {
    if (value === null || value === undefined) {
      throw new Error(`${context}: 参数不能为空`)
    }
  },
  
  isObject: (value, context) => {
    if (typeof value !== 'object' || value === null) {
      throw new Error(`${context}: 参数必须是对象`)
    }
  },
  
  hasMethod: (methodName) => (obj, context) => {
    if (!obj || typeof obj[methodName] !== 'function') {
      throw new Error(`${context}: 对象必须包含方法 '${methodName}'`)
    }
  },
  
  isString: (value, context) => {
    if (typeof value !== 'string') {
      throw new Error(`${context}: 参数必须是字符串`)
    }
  }
}