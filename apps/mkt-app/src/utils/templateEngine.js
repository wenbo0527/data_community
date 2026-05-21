/**
 * 模板引擎工具类
 * 用于处理通知模板中的变量替换，支持 {{variable}} 语法
 */

class TemplateEngine {
  constructor() {
    this.variablePattern = /\{\{(\w+)\}\}/g
    this.conditionalPattern = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs
    this.loopPattern = /\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs
  }

  /**
   * 渲染模板
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @param {Object} options - 渲染选项
   * @returns {string} 渲染后的字符串
   */
  render(template, variables = {}, options = {}) {
    if (!template || typeof template !== 'string') {
      return ''
    }

    try {
      let result = template

      // 处理条件语句
      result = this.processConditionals(result, variables)
      
      // 处理循环语句
      result = this.processLoops(result, variables)
      
      // 处理变量替换
      result = this.processVariables(result, variables)
      
      // 清理多余的空白
      if (options.trimWhitespace !== false) {
        result = this.trimWhitespace(result)
      }

      return result
    } catch (error) {
      console.error('Template rendering error:', error)
      return template
    }
  }

  /**
   * 处理变量替换
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 处理后的字符串
   */
  processVariables(template, variables) {
    return template.replace(this.variablePattern, (match, variableName) => {
      const value = this.getVariableValue(variables, variableName)
      return value !== undefined ? String(value) : match
    })
  }

  /**
   * 处理条件语句
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 处理后的字符串
   */
  processConditionals(template, variables) {
    return template.replace(this.conditionalPattern, (match, condition, content) => {
      const value = this.getVariableValue(variables, condition)
      const isTruthy = this.isTruthy(value)
      return isTruthy ? content : ''
    })
  }

  /**
   * 处理循环语句
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 处理后的字符串
   */
  processLoops(template, variables) {
    return template.replace(this.loopPattern, (match, arrayName, content) => {
      const array = this.getVariableValue(variables, arrayName)
      
      if (!Array.isArray(array) || array.length === 0) {
        return ''
      }

      return array.map((item, index) => {
        const itemVariables = {
          ...variables,
          [arrayName]: item,
          [`${arrayName}_index`]: index,
          [`${arrayName}_first`]: index === 0,
          [`${arrayName}_last`]: index === array.length - 1
        }
        return this.processVariables(content, itemVariables)
      }).join('')
    })
  }

  /**
   * 获取变量值
   * @param {Object} variables - 变量对象
   * @param {string} path - 变量路径（支持点语法）
   * @returns {*} 变量值
   */
  getVariableValue(variables, path) {
    if (!path || typeof path !== 'string') {
      return undefined
    }

    // 支持点语法，如：user.name
    const keys = path.split('.')
    let value = variables

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }

    return value
  }

  /**
   * 判断值是否为真
   * @param {*} value - 要判断的值
   * @returns {boolean} 是否为真
   */
  isTruthy(value) {
    if (value === null || value === undefined) {
      return false
    }
    
    if (typeof value === 'boolean') {
      return value
    }
    
    if (typeof value === 'number') {
      return value !== 0
    }
    
    if (typeof value === 'string') {
      return value.length > 0
    }
    
    if (Array.isArray(value)) {
      return value.length > 0
    }
    
    if (typeof value === 'object') {
      return Object.keys(value).length > 0
    }
    
    return Boolean(value)
  }

  /**
   * 清理多余空白
   * @param {string} text - 文本内容
   * @returns {string} 清理后的文本
   */
  trimWhitespace(text) {
    return text
      .replace(/\n\s*\n/g, '\n') // 移除多余空行
      .replace(/^\s+|\s+$/g, '') // 移除首尾空白
      .replace(/\s+/g, ' ') // 合并多个空格
  }

  /**
   * 提取模板中的变量
   * @param {string} template - 模板字符串
   * @returns {Array} 变量名称数组
   */
  extractVariables(template) {
    if (!template || typeof template !== 'string') {
      return []
    }

    const variables = new Set()
    
    // 提取普通变量
    let match
    while ((match = this.variablePattern.exec(template)) !== null) {
      variables.add(match[1])
    }

    // 提取条件变量
    while ((match = this.conditionalPattern.exec(template)) !== null) {
      variables.add(match[1])
    }

    // 提取循环变量
    while ((match = this.loopPattern.exec(template)) !== null) {
      variables.add(match[1])
    }

    return Array.from(variables)
  }

  /**
   * 验证模板变量
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {Object} 验证结果
   */
  validateVariables(template, variables) {
    const requiredVariables = this.extractVariables(template)
    const missingVariables = []
    const validVariables = {}

    requiredVariables.forEach(variable => {
      const value = this.getVariableValue(variables, variable)
      if (value === undefined || value === null) {
        missingVariables.push(variable)
      } else {
        validVariables[variable] = value
      }
    })

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
      validVariables,
      totalVariables: requiredVariables.length
    }
  }

  /**
   * 创建模板编译器
   * @param {string} template - 模板字符串
   * @returns {Function} 编译后的模板函数
   */
  compile(template) {
    const requiredVariables = this.extractVariables(template)
    
    return (variables = {}) => {
      return this.render(template, variables)
    }
  }

  /**
   * 批量渲染模板
   * @param {Array} templates - 模板数组
   * @param {Object} variables - 变量对象
   * @param {Object} options - 渲染选项
   * @returns {Array} 渲染结果数组
   */
  batchRender(templates, variables, options = {}) {
    if (!Array.isArray(templates)) {
      return []
    }

    return templates.map(template => ({
      original: template,
      rendered: this.render(template, variables, options),
      variables: this.extractVariables(template)
    }))
  }

  /**
   * 获取默认变量
   * @param {string} type - 监控类型（inventory, expiry, failure_rate）
   * @returns {Object} 默认变量对象
   */
  getDefaultVariables(type) {
    const baseVariables = {
      ruleName: '库存预警规则',
      currentTime: new Date().toLocaleString(),
      companyName: '示例公司'
    }

    const typeVariables = {
      inventory: {
        productName: '示例商品',
        currentStock: 100,
        minStock: 50,
        unit: '件',
        warehouse: '主仓库',
        category: '电子产品'
      },
      expiry: {
        productName: '示例商品',
        expiryDate: '2024-12-31',
        daysUntilExpiry: 30,
        batchNumber: 'B2024001',
        quantity: 500,
        unit: '件'
      },
      failure_rate: {
        productName: '示例商品',
        failureRate: 5.2,
        threshold: 3.0,
        totalOrders: 1000,
        failedOrders: 52,
        timeWindow: '最近7天'
      }
    }

    return {
      ...baseVariables,
      ...(typeVariables[type] || {})
    }
  }
}

// 创建单例实例
const templateEngine = new TemplateEngine()

// 导出工具函数
export const renderTemplate = (template, variables, options) => {
  return templateEngine.render(template, variables, options)
}

export const extractTemplateVariables = (template) => {
  return templateEngine.extractVariables(template)
}

export const validateTemplateVariables = (template, variables) => {
  return templateEngine.validateVariables(template, variables)
}

export const compileTemplate = (template) => {
  return templateEngine.compile(template)
}

export const batchRenderTemplates = (templates, variables, options) => {
  return templateEngine.batchRender(templates, variables, options)
}

export const getDefaultTemplateVariables = (type) => {
  return templateEngine.getDefaultVariables(type)
}

export default templateEngine