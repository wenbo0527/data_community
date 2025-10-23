/**
 * PreviewLineManager Builder 模式的验证错误类
 * 提供详细的错误信息和错误分类
 */

/**
 * 预览线管理器验证错误基类
 */
export class PreviewLineValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR', details = null) {
    super(message)
    this.name = 'PreviewLineValidationError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  /**
   * 转换为JSON格式
   * @returns {Object} 错误信息对象
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}

/**
 * 必需参数缺失错误
 */
export class RequiredParameterError extends PreviewLineValidationError {
  constructor(parameterName, expectedType = null) {
    const message = `必需参数 '${parameterName}' 缺失${expectedType ? `, 期望类型: ${expectedType}` : ''}`
    super(message, 'REQUIRED_PARAMETER_MISSING', {
      parameterName,
      expectedType
    })
    this.name = 'RequiredParameterError'
  }
}

/**
 * 参数类型错误
 */
export class ParameterTypeError extends PreviewLineValidationError {
  constructor(parameterName, expectedType, actualType, actualValue = null) {
    const message = `参数 '${parameterName}' 类型错误，期望: ${expectedType}，实际: ${actualType}`
    super(message, 'PARAMETER_TYPE_ERROR', {
      parameterName,
      expectedType,
      actualType,
      actualValue
    })
    this.name = 'ParameterTypeError'
  }
}

/**
 * 参数值范围错误
 */
export class ParameterRangeError extends PreviewLineValidationError {
  constructor(parameterName, value, min = null, max = null, allowedValues = null) {
    let message = `参数 '${parameterName}' 值 '${value}' 超出允许范围`
    
    if (allowedValues) {
      message += `，允许的值: [${allowedValues.join(', ')}]`
    } else if (min !== null || max !== null) {
      const range = []
      if (min !== null) range.push(`最小值: ${min}`)
      if (max !== null) range.push(`最大值: ${max}`)
      message += `，${range.join(', ')}`
    }

    super(message, 'PARAMETER_RANGE_ERROR', {
      parameterName,
      value,
      min,
      max,
      allowedValues
    })
    this.name = 'ParameterRangeError'
  }
}

/**
 * 配置冲突错误
 */
export class ConfigurationConflictError extends PreviewLineValidationError {
  constructor(conflictingParameters, reason) {
    const paramList = Array.isArray(conflictingParameters) 
      ? conflictingParameters.join(', ') 
      : conflictingParameters
    const message = `配置冲突: ${paramList}。原因: ${reason}`
    
    super(message, 'CONFIGURATION_CONFLICT', {
      conflictingParameters,
      reason
    })
    this.name = 'ConfigurationConflictError'
  }
}

/**
 * 依赖缺失错误
 */
export class DependencyMissingError extends PreviewLineValidationError {
  constructor(dependencyName, requiredBy, suggestion = null) {
    let message = `依赖 '${dependencyName}' 缺失，被 '${requiredBy}' 需要`
    if (suggestion) {
      message += `。建议: ${suggestion}`
    }

    super(message, 'DEPENDENCY_MISSING', {
      dependencyName,
      requiredBy,
      suggestion
    })
    this.name = 'DependencyMissingError'
  }
}

/**
 * 初始化错误
 */
export class InitializationError extends PreviewLineValidationError {
  constructor(component, reason, suggestions = []) {
    const message = `${component} 初始化失败: ${reason}`
    
    super(message, 'INITIALIZATION_ERROR', {
      component,
      reason,
      suggestions
    })
    this.name = 'InitializationError'
  }
}

/**
 * 验证器工具类
 * 提供常用的验证方法
 */
export class ValidationUtils {
  /**
   * 验证必需参数
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {string} expectedType - 期望类型
   * @throws {RequiredParameterError} 当参数缺失时
   * @throws {ParameterTypeError} 当参数类型错误时
   */
  static validateRequired(value, name, expectedType = null) {
    if (value === null || value === undefined) {
      throw new RequiredParameterError(name, expectedType)
    }

    if (expectedType && !this.checkType(value, expectedType)) {
      throw new ParameterTypeError(name, expectedType, typeof value, value)
    }
  }

  /**
   * 验证参数类型
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {string} expectedType - 期望类型
   * @param {boolean} allowNull - 是否允许null
   * @throws {ParameterTypeError} 当参数类型错误时
   */
  static validateType(value, name, expectedType, allowNull = false) {
    if (allowNull && (value === null || value === undefined)) {
      return
    }

    if (!this.checkType(value, expectedType)) {
      throw new ParameterTypeError(name, expectedType, typeof value, value)
    }
  }

  /**
   * 验证数值范围
   * @param {number} value - 数值
   * @param {string} name - 参数名
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @throws {ParameterRangeError} 当数值超出范围时
   */
  static validateRange(value, name, min = null, max = null) {
    if (min !== null && value < min) {
      throw new ParameterRangeError(name, value, min, max)
    }
    if (max !== null && value > max) {
      throw new ParameterRangeError(name, value, min, max)
    }
  }

  /**
   * 验证枚举值
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {Array} allowedValues - 允许的值列表
   * @throws {ParameterRangeError} 当值不在允许列表中时
   */
  static validateEnum(value, name, allowedValues) {
    if (!allowedValues.includes(value)) {
      throw new ParameterRangeError(name, value, null, null, allowedValues)
    }
  }

  /**
   * 验证函数类型
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {boolean} allowNull - 是否允许null
   * @throws {ParameterTypeError} 当不是函数时
   */
  static validateFunction(value, name, allowNull = false) {
    if (allowNull && (value === null || value === undefined)) {
      return
    }
    
    if (typeof value !== 'function') {
      throw new ParameterTypeError(name, 'function', typeof value, value)
    }
  }

  /**
   * 验证对象实例
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {Function} expectedClass - 期望的类构造函数
   * @param {boolean} allowNull - 是否允许null
   * @throws {ParameterTypeError} 当不是期望的实例时
   */
  static validateInstance(value, name, expectedClass, allowNull = false) {
    if (allowNull && (value === null || value === undefined)) {
      return
    }

    if (!(value instanceof expectedClass)) {
      const expectedName = expectedClass.name || 'Unknown'
      const actualName = value?.constructor?.name || typeof value
      throw new ParameterTypeError(name, expectedName, actualName, value)
    }
  }

  /**
   * 检查类型
   * @param {*} value - 值
   * @param {string} expectedType - 期望类型
   * @returns {boolean} 是否匹配
   * @private
   */
  static checkType(value, expectedType) {
    switch (expectedType.toLowerCase()) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'function':
        return typeof value === 'function'
      case 'object':
        return typeof value === 'object' && value !== null
      case 'array':
        return Array.isArray(value)
      case 'map':
        return value instanceof Map
      case 'set':
        return value instanceof Set
      default:
        return typeof value === expectedType
    }
  }

  /**
   * 批量验证参数
   * @param {Object} params - 参数对象
   * @param {Object} schema - 验证模式
   * @throws {PreviewLineValidationError} 当验证失败时
   */
  static validateSchema(params, schema) {
    const errors = []

    for (const [key, rules] of Object.entries(schema)) {
      try {
        const value = params[key]

        // 必需参数检查
        if (rules.required && (value === null || value === undefined)) {
          throw new RequiredParameterError(key, rules.type)
        }

        // 跳过可选的空值
        if (!rules.required && (value === null || value === undefined)) {
          continue
        }

        // 类型检查
        if (rules.type && !this.checkType(value, rules.type)) {
          throw new ParameterTypeError(key, rules.type, typeof value, value)
        }

        // 范围检查
        if (rules.min !== undefined || rules.max !== undefined) {
          this.validateRange(value, key, rules.min, rules.max)
        }

        // 枚举检查
        if (rules.enum) {
          this.validateEnum(value, key, rules.enum)
        }

        // 自定义验证器
        if (rules.validator && typeof rules.validator === 'function') {
          const result = rules.validator(value, key, params)
          if (result !== true) {
            throw new PreviewLineValidationError(
              result || `自定义验证失败: ${key}`,
              'CUSTOM_VALIDATION_ERROR',
              { key, value }
            )
          }
        }

      } catch (error) {
        errors.push(error)
      }
    }

    if (errors.length > 0) {
      const message = `参数验证失败 (${errors.length} 个错误):\n${errors.map(e => `- ${e.message}`).join('\n')}`
      throw new PreviewLineValidationError(message, 'SCHEMA_VALIDATION_ERROR', { errors })
    }
  }
}

/**
 * 预定义的验证模式
 */
export const ValidationSchemas = {
  // Graph 实例验证
  graph: {
    required: true,
    type: 'object',
    validator: (value) => {
      if (!value.getNodes || typeof value.getNodes !== 'function') {
        return 'Graph 实例必须包含 getNodes 方法'
      }
      if (!value.addEdge || typeof value.addEdge !== 'function') {
        return 'Graph 实例必须包含 addEdge 方法'
      }
      return true
    }
  },

  // 性能配置验证
  performanceOptions: {
    required: false,
    type: 'object',
    validator: (value) => {
      if (value.maxCacheSize !== undefined) {
        if (typeof value.maxCacheSize !== 'number' || value.maxCacheSize <= 0) {
          return 'maxCacheSize 必须是正数'
        }
      }
      return true
    }
  },

  // 调试配置验证
  debugOptions: {
    required: false,
    type: 'object',
    validator: (value) => {
      const validLogLevels = ['error', 'warn', 'info', 'debug']
      if (value.logLevel && !validLogLevels.includes(value.logLevel)) {
        return `logLevel 必须是以下值之一: ${validLogLevels.join(', ')}`
      }
      return true
    }
  }
}