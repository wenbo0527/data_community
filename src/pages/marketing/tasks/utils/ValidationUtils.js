/**
 * 数据验证工具类
 * 提供统一的数据验证功能，消除降级逻辑
 * 确保所有验证都有明确的成功/失败结果
 */

/**
 * 验证结果类
 */
export class ValidationResult {
  constructor(isValid, message = '', errors = []) {
    this.isValid = isValid
    this.message = message
    this.errors = errors
  }

  /**
   * 添加错误信息
   * @param {string} field - 字段名
   * @param {string} message - 错误信息
   */
  addError(field, message) {
    this.errors.push({ field, message })
    this.isValid = false
  }

  /**
   * 获取第一个错误信息
   * @returns {string} 错误信息
   */
  getFirstError() {
    return this.errors.length > 0 ? this.errors[0].message : this.message
  }

  /**
   * 获取指定字段的错误信息
   * @param {string} field - 字段名
   * @returns {string|null} 错误信息
   */
  getFieldError(field) {
    const error = this.errors.find(e => e.field === field)
    return error ? error.message : null
  }
}

/**
 * 数据验证工具类
 */
export class ValidationUtils {
  /**
   * 验证节点数据
   * @param {Object} nodeData - 节点数据
   * @returns {ValidationResult} 验证结果
   */
  static validateNodeData(nodeData) {
    const result = new ValidationResult(true)

    // 验证基础字段
    if (!nodeData) {
      result.addError('nodeData', '节点数据不能为空')
      return result
    }

    if (!nodeData.id || typeof nodeData.id !== 'string') {
      result.addError('id', '节点ID必须是非空字符串')
    }

    if (!nodeData.type || typeof nodeData.type !== 'string') {
      result.addError('type', '节点类型必须是非空字符串')
    }

    // 验证坐标
    if (nodeData.x !== undefined && (typeof nodeData.x !== 'number' || isNaN(nodeData.x))) {
      result.addError('x', 'X坐标必须是有效数字')
    }

    if (nodeData.y !== undefined && (typeof nodeData.y !== 'number' || isNaN(nodeData.y))) {
      result.addError('y', 'Y坐标必须是有效数字')
    }

    // 验证尺寸
    if (nodeData.width !== undefined && (typeof nodeData.width !== 'number' || nodeData.width <= 0)) {
      result.addError('width', '宽度必须是正数')
    }

    if (nodeData.height !== undefined && (typeof nodeData.height !== 'number' || nodeData.height <= 0)) {
      result.addError('height', '高度必须是正数')
    }

    return result
  }

  /**
   * 验证连接数据
   * @param {Object} connectionData - 连接数据
   * @returns {ValidationResult} 验证结果
   */
  static validateConnectionData(connectionData) {
    const result = new ValidationResult(true)

    if (!connectionData) {
      result.addError('connectionData', '连接数据不能为空')
      return result
    }

    if (!connectionData.id || typeof connectionData.id !== 'string') {
      result.addError('id', '连接ID必须是非空字符串')
    }

    if (!connectionData.sourceId || typeof connectionData.sourceId !== 'string') {
      result.addError('sourceId', '源节点ID必须是非空字符串')
    }

    if (!connectionData.targetId || typeof connectionData.targetId !== 'string') {
      result.addError('targetId', '目标节点ID必须是非空字符串')
    }

    // 验证源节点和目标节点不能相同
    if (connectionData.sourceId === connectionData.targetId) {
      result.addError('connection', '源节点和目标节点不能相同')
    }

    return result
  }

  /**
   * 验证节点配置数据
   * @param {string} nodeType - 节点类型
   * @param {Object} configData - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateNodeConfig(nodeType, configData) {
    const result = new ValidationResult(true)

    if (!nodeType || typeof nodeType !== 'string') {
      result.addError('nodeType', '节点类型必须是非空字符串')
      return result
    }

    if (!configData || typeof configData !== 'object') {
      result.addError('configData', '配置数据必须是对象')
      return result
    }

    // 根据节点类型进行特定验证
    switch (nodeType) {
      case 'start':
        return this.validateStartNodeConfig(configData)
      case 'audience-split':
        return this.validateAudienceSplitConfig(configData)
      case 'event-split':
        return this.validateEventSplitConfig(configData)
      case 'sms':
        return this.validateSMSConfig(configData)
      case 'ai-call':
        return this.validateAICallConfig(configData)
      case 'manual-call':
        return this.validateManualCallConfig(configData)
      case 'ab-test':
        return this.validateABTestConfig(configData)
      case 'wait':
        return this.validateWaitConfig(configData)
      case 'benefit':
        return this.validateBenefitConfig(configData)
      default:
        result.addError('nodeType', `不支持的节点类型: ${nodeType}`)
    }

    return result
  }

  /**
   * 验证开始节点配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateStartNodeConfig(config) {
    const result = new ValidationResult(true)

    if (!config.name || typeof config.name !== 'string' || config.name.trim().length === 0) {
      result.addError('name', '任务名称不能为空')
    }

    if (config.description && typeof config.description !== 'string') {
      result.addError('description', '任务描述必须是字符串')
    }

    return result
  }

  /**
   * 验证人群分流配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateAudienceSplitConfig(config) {
    const result = new ValidationResult(true)

    if (!config.splits || !Array.isArray(config.splits) || config.splits.length === 0) {
      result.addError('splits', '分流配置不能为空')
      return result
    }

    config.splits.forEach((split, index) => {
      if (!split.name || typeof split.name !== 'string') {
        result.addError(`splits[${index}].name`, `分流${index + 1}名称不能为空`)
      }

      if (typeof split.percentage !== 'number' || split.percentage < 0 || split.percentage > 100) {
        result.addError(`splits[${index}].percentage`, `分流${index + 1}百分比必须在0-100之间`)
      }
    })

    // 验证百分比总和
    const totalPercentage = config.splits.reduce((sum, split) => sum + (split.percentage || 0), 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      result.addError('splits', '分流百分比总和必须等于100%')
    }

    return result
  }

  /**
   * 验证事件分流配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateEventSplitConfig(config) {
    const result = new ValidationResult(true)

    if (!config.events || !Array.isArray(config.events) || config.events.length === 0) {
      result.addError('events', '事件配置不能为空')
      return result
    }

    config.events.forEach((event, index) => {
      if (!event.name || typeof event.name !== 'string') {
        result.addError(`events[${index}].name`, `事件${index + 1}名称不能为空`)
      }

      if (!event.condition || typeof event.condition !== 'string') {
        result.addError(`events[${index}].condition`, `事件${index + 1}条件不能为空`)
      }
    })

    return result
  }

  /**
   * 验证短信配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateSMSConfig(config) {
    const result = new ValidationResult(true)

    if (!config.template || typeof config.template !== 'string' || config.template.trim().length === 0) {
      result.addError('template', '短信模板不能为空')
    }

    if (config.template && config.template.length > 500) {
      result.addError('template', '短信模板长度不能超过500字符')
    }

    return result
  }

  /**
   * 验证AI外呼配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateAICallConfig(config) {
    const result = new ValidationResult(true)

    if (!config.script || typeof config.script !== 'string' || config.script.trim().length === 0) {
      result.addError('script', 'AI外呼脚本不能为空')
    }

    if (typeof config.maxRetries !== 'number' || config.maxRetries < 0 || config.maxRetries > 10) {
      result.addError('maxRetries', '最大重试次数必须在0-10之间')
    }

    return result
  }

  /**
   * 验证人工外呼配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateManualCallConfig(config) {
    const result = new ValidationResult(true)

    if (!config.assignee || typeof config.assignee !== 'string') {
      result.addError('assignee', '指派人员不能为空')
    }

    if (!config.priority || !['low', 'medium', 'high'].includes(config.priority)) {
      result.addError('priority', '优先级必须是low、medium或high')
    }

    return result
  }

  /**
   * 验证AB测试配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateABTestConfig(config) {
    const result = new ValidationResult(true)

    if (!config.variants || !Array.isArray(config.variants) || config.variants.length < 2) {
      result.addError('variants', 'AB测试至少需要2个变体')
      return result
    }

    config.variants.forEach((variant, index) => {
      if (!variant.name || typeof variant.name !== 'string') {
        result.addError(`variants[${index}].name`, `变体${index + 1}名称不能为空`)
      }

      if (typeof variant.percentage !== 'number' || variant.percentage < 0 || variant.percentage > 100) {
        result.addError(`variants[${index}].percentage`, `变体${index + 1}百分比必须在0-100之间`)
      }
    })

    // 验证百分比总和
    const totalPercentage = config.variants.reduce((sum, variant) => sum + (variant.percentage || 0), 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      result.addError('variants', '变体百分比总和必须等于100%')
    }

    return result
  }

  /**
   * 验证等待节点配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateWaitConfig(config) {
    const result = new ValidationResult(true)

    if (typeof config.duration !== 'number' || config.duration <= 0) {
      result.addError('duration', '等待时长必须是正数')
    }

    if (!config.unit || !['minutes', 'hours', 'days'].includes(config.unit)) {
      result.addError('unit', '时间单位必须是minutes、hours或days')
    }

    return result
  }

  /**
   * 验证权益节点配置
   * @param {Object} config - 配置数据
   * @returns {ValidationResult} 验证结果
   */
  static validateBenefitConfig(config) {
    const result = new ValidationResult(true)

    if (!config.benefitType || typeof config.benefitType !== 'string') {
      result.addError('benefitType', '权益类型不能为空')
    }

    if (!config.benefitId || typeof config.benefitId !== 'string') {
      result.addError('benefitId', '权益ID不能为空')
    }

    if (typeof config.amount !== 'number' || config.amount <= 0) {
      result.addError('amount', '权益金额必须是正数')
    }

    return result
  }

  /**
   * 验证字符串
   * @param {any} value - 待验证值
   * @param {Object} options - 验证选项
   * @returns {ValidationResult} 验证结果
   */
  static validateString(value, options = {}) {
    const result = new ValidationResult(true)
    const { required = false, minLength = 0, maxLength = Infinity, pattern = null } = options

    if (required && (!value || typeof value !== 'string' || value.trim().length === 0)) {
      result.addError('value', '字段不能为空')
      return result
    }

    if (value && typeof value !== 'string') {
      result.addError('value', '字段必须是字符串')
      return result
    }

    if (value && value.length < minLength) {
      result.addError('value', `字段长度不能少于${minLength}个字符`)
    }

    if (value && value.length > maxLength) {
      result.addError('value', `字段长度不能超过${maxLength}个字符`)
    }

    if (value && pattern && !pattern.test(value)) {
      result.addError('value', '字段格式不正确')
    }

    return result
  }

  /**
   * 验证数字
   * @param {any} value - 待验证值
   * @param {Object} options - 验证选项
   * @returns {ValidationResult} 验证结果
   */
  static validateNumber(value, options = {}) {
    const result = new ValidationResult(true)
    const { required = false, min = -Infinity, max = Infinity, integer = false } = options

    if (required && (value === undefined || value === null)) {
      result.addError('value', '字段不能为空')
      return result
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        result.addError('value', '字段必须是有效数字')
        return result
      }

      if (value < min) {
        result.addError('value', `数值不能小于${min}`)
      }

      if (value > max) {
        result.addError('value', `数值不能大于${max}`)
      }

      if (integer && !Number.isInteger(value)) {
        result.addError('value', '字段必须是整数')
      }
    }

    return result
  }

  /**
   * 验证数组
   * @param {any} value - 待验证值
   * @param {Object} options - 验证选项
   * @returns {ValidationResult} 验证结果
   */
  static validateArray(value, options = {}) {
    const result = new ValidationResult(true)
    const { required = false, minLength = 0, maxLength = Infinity } = options

    if (required && (!value || !Array.isArray(value) || value.length === 0)) {
      result.addError('value', '字段不能为空')
      return result
    }

    if (value && !Array.isArray(value)) {
      result.addError('value', '字段必须是数组')
      return result
    }

    if (value && value.length < minLength) {
      result.addError('value', `数组长度不能少于${minLength}`)
    }

    if (value && value.length > maxLength) {
      result.addError('value', `数组长度不能超过${maxLength}`)
    }

    return result
  }

  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {ValidationResult} 验证结果
   */
  static validateEmail(email) {
    const result = new ValidationResult(true)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || typeof email !== 'string') {
      result.addError('email', '邮箱地址不能为空')
      return result
    }

    if (!emailPattern.test(email)) {
      result.addError('email', '邮箱格式不正确')
    }

    return result
  }

  /**
   * 验证手机号格式
   * @param {string} phone - 手机号
   * @returns {ValidationResult} 验证结果
   */
  static validatePhone(phone) {
    const result = new ValidationResult(true)
    const phonePattern = /^1[3-9]\d{9}$/

    if (!phone || typeof phone !== 'string') {
      result.addError('phone', '手机号不能为空')
      return result
    }

    if (!phonePattern.test(phone)) {
      result.addError('phone', '手机号格式不正确')
    }

    return result
  }
}

/**
 * 创建验证结果
 * @param {boolean} isValid - 是否有效
 * @param {string} message - 消息
 * @param {Array} errors - 错误列表
 * @returns {ValidationResult} 验证结果
 */
export function createValidationResult(isValid, message = '', errors = []) {
  return new ValidationResult(isValid, message, errors)
}

/**
 * 成功的验证结果
 * @param {string} message - 成功消息
 * @returns {ValidationResult} 验证结果
 */
export function validationSuccess(message = '验证通过') {
  return new ValidationResult(true, message)
}

/**
 * 失败的验证结果
 * @param {string} message - 失败消息
 * @param {Array} errors - 错误列表
 * @returns {ValidationResult} 验证结果
 */
export function validationFailure(message = '验证失败', errors = []) {
  return new ValidationResult(false, message, errors)
}