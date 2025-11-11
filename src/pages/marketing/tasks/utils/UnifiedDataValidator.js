/**
 * 统一数据验证器 - 确保数据完整性和格式正确性
 * 提供全面的数据验证、修复建议和错误报告功能
 */

/**
 * 验证规则类型枚举
 */
const ValidationRuleType = {
  REQUIRED: 'required',
  TYPE: 'type',
  FORMAT: 'format',
  RANGE: 'range',
  CUSTOM: 'custom',
  REFERENCE: 'reference'
}

/**
 * 验证严重程度枚举
 */
const ValidationSeverity = {
  ERROR: 'error',     // 严重错误，必须修复
  WARNING: 'warning', // 警告，建议修复
  INFO: 'info'        // 信息，可选修复
}

/**
 * 数据类型枚举
 */
const DataType = {
  NODE: 'node',
  EDGE: 'edge',
  PREVIEW_LINE: 'preview_line',
  CONNECTION: 'connection',
  CANVAS: 'canvas'
}

/**
 * 验证结果类
 */
class ValidationResult {
  constructor() {
    this.isValid = true
    this.errors = []
    this.warnings = []
    this.infos = []
    this.fixSuggestions = []
    this.statistics = {
      totalItems: 0,
      validItems: 0,
      errorItems: 0,
      warningItems: 0
    }
  }

  addError(message, path = '', suggestion = '') {
    this.isValid = false
    this.errors.push({ message, path, suggestion, severity: ValidationSeverity.ERROR })
    this.statistics.errorItems++
    if (suggestion) {
      this.fixSuggestions.push({ type: 'error', message, path, suggestion })
    }
  }

  addWarning(message, path = '', suggestion = '') {
    this.warnings.push({ message, path, suggestion, severity: ValidationSeverity.WARNING })
    this.statistics.warningItems++
    if (suggestion) {
      this.fixSuggestions.push({ type: 'warning', message, path, suggestion })
    }
  }

  addInfo(message, path = '', suggestion = '') {
    this.infos.push({ message, path, suggestion, severity: ValidationSeverity.INFO })
    if (suggestion) {
      this.fixSuggestions.push({ type: 'info', message, path, suggestion })
    }
  }

  getAllIssues() {
    return [...this.errors, ...this.warnings, ...this.infos]
  }

  getReport() {
    return {
      isValid: this.isValid,
      summary: {
        total: this.statistics.totalItems,
        valid: this.statistics.validItems,
        errors: this.statistics.errorItems,
        warnings: this.statistics.warningItems,
        infos: this.infos.length
      },
      issues: {
        errors: this.errors,
        warnings: this.warnings,
        infos: this.infos
      },
      fixSuggestions: this.fixSuggestions
    }
  }
}

/**
 * 统一数据验证器
 */
class UnifiedDataValidator {
  constructor(options = {}) {
    this.options = {
      strictMode: false,
      autoFix: false,
      validateReferences: true,
      validateFormat: true,
      validateIntegrity: true,
      ...options
    }
    
    this.validationRules = new Map()
    this.customValidators = new Map()
    
    this.setupDefaultRules()
  }

  /**
   * 设置默认验证规则
   */
  setupDefaultRules() {
    // 节点验证规则
    this.validationRules.set(DataType.NODE, [
      {
        type: ValidationRuleType.REQUIRED,
        field: 'id',
        message: '节点必须有唯一ID',
        suggestion: '为节点生成唯一ID'
      },
      {
        type: ValidationRuleType.TYPE,
        field: 'id',
        expectedType: 'string',
        message: '节点ID必须是字符串',
        suggestion: '将节点ID转换为字符串格式'
      },
      {
        type: ValidationRuleType.REQUIRED,
        field: 'shape',
        message: '节点必须指定形状类型',
        suggestion: '为节点设置默认形状类型'
      },
      {
        type: ValidationRuleType.TYPE,
        field: 'position',
        expectedType: 'object',
        message: '节点位置信息必须是对象',
        suggestion: '设置节点位置为 {x: 0, y: 0}'
      },
      {
        type: ValidationRuleType.CUSTOM,
        field: 'position',
        validator: this.validateNodePosition.bind(this),
        message: '节点位置坐标无效',
        suggestion: '确保位置包含有效的x和y坐标'
      }
    ])

    // 边验证规则
    this.validationRules.set(DataType.EDGE, [
      {
        type: ValidationRuleType.REQUIRED,
        field: 'id',
        message: '边必须有唯一ID',
        suggestion: '为边生成唯一ID'
      },
      {
        type: ValidationRuleType.REQUIRED,
        field: 'source',
        message: '边必须指定源节点',
        suggestion: '设置边的源节点引用'
      },
      {
        type: ValidationRuleType.REQUIRED,
        field: 'target',
        message: '边必须指定目标节点',
        suggestion: '设置边的目标节点引用'
      },
      {
        type: ValidationRuleType.CUSTOM,
        field: 'source',
        validator: this.validateEdgeReference.bind(this),
        message: '边源节点引用格式错误',
        suggestion: '确保源节点引用格式为 {cell: "nodeId"}'
      },
      {
        type: ValidationRuleType.CUSTOM,
        field: 'target',
        validator: this.validateEdgeReference.bind(this),
        message: '边目标节点引用格式错误',
        suggestion: '确保目标节点引用格式为 {cell: "nodeId"}'
      }
    ])

    // 预览线验证规则
    this.validationRules.set(DataType.PREVIEW_LINE, [
      {
        type: ValidationRuleType.REQUIRED,
        field: 'id',
        message: '预览线必须有唯一ID',
        suggestion: '为预览线生成唯一ID'
      },
      {
        type: ValidationRuleType.REQUIRED,
        field: 'source',
        message: '预览线必须指定源节点',
        suggestion: '设置预览线的源节点引用'
      },

      {
        type: ValidationRuleType.CUSTOM,
        field: 'shape',
        validator: (item) => {
          const shape = item && item.shape
          // 允许 preview-line、unified-preview-line、persistent-preview-line 或未设置
          return (
            !shape ||
            shape === 'preview-line' ||
            shape === 'unified-preview-line' ||
            shape === 'persistent-preview-line'
          )
        },
        message: '预览线形状类型不兼容',
        suggestion: '将形状设为 unified-preview-line 或 persistent-preview-line'
      }
    ])

    // 画布数据验证规则
    this.validationRules.set(DataType.CANVAS, [
      {
        type: ValidationRuleType.TYPE,
        field: 'nodes',
        expectedType: 'array',
        message: '画布节点数据必须是数组',
        suggestion: '初始化节点数组为 []'
      },
      {
        type: ValidationRuleType.TYPE,
        field: 'edges',
        expectedType: 'array',
        message: '画布边数据必须是数组',
        suggestion: '初始化边数组为 []'
      },
      {
        type: ValidationRuleType.CUSTOM,
        field: 'integrity',
        validator: this.validateDataIntegrity.bind(this),
        message: '画布数据完整性检查失败',
        suggestion: '修复数据引用和关联关系'
      }
    ])
  }

  /**
   * 验证完整数据集
   */
  async validateData(data) {
    console.log('[DataValidator] 开始数据验证...')
    const result = new ValidationResult()
    
    try {
      // 预处理数据
      const processedData = this.preprocessData(data)
      
      // 验证画布级别数据
      await this.validateCanvasData(processedData, result)
      
      // 验证节点数据
      if (Array.isArray(processedData.nodes)) {
        result.statistics.totalItems += processedData.nodes.length
        for (let i = 0; i < processedData.nodes.length; i++) {
          await this.validateNode(processedData.nodes[i], i, processedData, result)
        }
      }
      
      // 验证边数据
      if (Array.isArray(processedData.edges)) {
        result.statistics.totalItems += processedData.edges.length
        for (let i = 0; i < processedData.edges.length; i++) {
          await this.validateEdge(processedData.edges[i], i, processedData, result)
        }
      }
      
      // 验证预览线数据
      if (Array.isArray(processedData.previewLines)) {
        result.statistics.totalItems += processedData.previewLines.length
        for (let i = 0; i < processedData.previewLines.length; i++) {
          await this.validatePreviewLine(processedData.previewLines[i], i, processedData, result)
        }
      }
      
      // 验证连接数据
      if (Array.isArray(processedData.connections)) {
        result.statistics.totalItems += processedData.connections.length
        for (let i = 0; i < processedData.connections.length; i++) {
          await this.validateConnection(processedData.connections[i], i, processedData, result)
        }
      }
      
      // 计算有效项目数
      result.statistics.validItems = result.statistics.totalItems - result.statistics.errorItems
      
      console.log(`[DataValidator] 验证完成: ${result.statistics.validItems}/${result.statistics.totalItems} 项有效`)
      
      return result
      
    } catch (error) {
      console.error('[DataValidator] 验证过程出错:', error)
      result.addError(`验证过程异常: ${error.message}`, '', '检查数据格式和验证器配置')
      return result
    }
  }

  /**
   * 预处理数据
   */
  preprocessData(data) {
    if (!data || typeof data !== 'object') {
      return { nodes: [], edges: [], previewLines: [], connections: [] }
    }
    
    return {
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      edges: Array.isArray(data.edges) ? data.edges : [],
      previewLines: Array.isArray(data.previewLines) ? data.previewLines : [],
      connections: Array.isArray(data.connections) ? data.connections : [],
      ...data
    }
  }

  /**
   * 验证画布数据
   */
  async validateCanvasData(data, result) {
    const rules = this.validationRules.get(DataType.CANVAS) || []
    
    for (const rule of rules) {
      await this.applyValidationRule(rule, data, 'canvas', data, result)
    }
  }

  /**
   * 验证节点
   */
  async validateNode(node, index, fullData, result) {
    const path = `nodes[${index}]`
    const rules = this.validationRules.get(DataType.NODE) || []
    
    for (const rule of rules) {
      await this.applyValidationRule(rule, node, path, fullData, result)
    }
  }

  /**
   * 验证边
   */
  async validateEdge(edge, index, fullData, result) {
    const path = `edges[${index}]`
    const rules = this.validationRules.get(DataType.EDGE) || []
    
    for (const rule of rules) {
      await this.applyValidationRule(rule, edge, path, fullData, result)
    }
    
    // 验证节点引用
    if (this.options.validateReferences) {
      this.validateNodeReferences(edge, path, fullData, result)
    }
  }

  /**
   * 验证预览线
   */
  async validatePreviewLine(previewLine, index, fullData, result) {
    const path = `previewLines[${index}]`
    const rules = this.validationRules.get(DataType.PREVIEW_LINE) || []
    
    for (const rule of rules) {
      await this.applyValidationRule(rule, previewLine, path, fullData, result)
    }
    
    // 验证节点引用
    if (this.options.validateReferences) {
      this.validateNodeReferences(previewLine, path, fullData, result)
    }
  }

  /**
   * 验证连接
   */
  async validateConnection(connection, index, fullData, result) {
    const path = `connections[${index}]`
    
    // 连接使用边的验证规则
    const rules = this.validationRules.get(DataType.EDGE) || []
    
    for (const rule of rules) {
      await this.applyValidationRule(rule, connection, path, fullData, result)
    }
    
    // 验证节点引用
    if (this.options.validateReferences) {
      this.validateNodeReferences(connection, path, fullData, result)
    }
  }

  /**
   * 应用验证规则
   */
  async applyValidationRule(rule, item, path, fullData, result) {
    try {
      switch (rule.type) {
        case ValidationRuleType.REQUIRED:
          this.validateRequired(rule, item, path, result)
          break
          
        case ValidationRuleType.TYPE:
          this.validateType(rule, item, path, result)
          break
          
        case ValidationRuleType.FORMAT:
          this.validateFormat(rule, item, path, result)
          break
          
        case ValidationRuleType.RANGE:
          this.validateRange(rule, item, path, result)
          break
          
        case ValidationRuleType.CUSTOM:
          await this.validateCustom(rule, item, path, fullData, result)
          break
          
        case ValidationRuleType.REFERENCE:
          this.validateReference(rule, item, path, fullData, result)
          break
      }
    } catch (error) {
      result.addError(`验证规则执行失败: ${error.message}`, path, rule.suggestion)
    }
  }

  /**
   * 验证必填字段
   */
  validateRequired(rule, item, path, result) {
    const value = item[rule.field]
    if (value === undefined || value === null || value === '') {
      result.addError(rule.message, `${path}.${rule.field}`, rule.suggestion)
    }
  }

  /**
   * 验证类型
   */
  validateType(rule, item, path, result) {
    const value = item[rule.field]
    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value
      
      if (rule.expectedType && actualType !== rule.expectedType) {
        result.addError(
          rule.message || `字段类型错误，期望 ${rule.expectedType}，实际 ${actualType}`,
          `${path}.${rule.field}`,
          rule.suggestion
        )
      }
      
      if (rule.expectedValue && value !== rule.expectedValue) {
        result.addError(
          rule.message || `字段值错误，期望 ${rule.expectedValue}，实际 ${value}`,
          `${path}.${rule.field}`,
          rule.suggestion
        )
      }
    }
  }

  /**
   * 验证格式
   */
  validateFormat(rule, item, path, result) {
    const value = item[rule.field]
    if (value !== undefined && value !== null && rule.pattern) {
      const regex = new RegExp(rule.pattern)
      if (!regex.test(String(value))) {
        result.addError(rule.message, `${path}.${rule.field}`, rule.suggestion)
      }
    }
  }

  /**
   * 验证范围
   */
  validateRange(rule, item, path, result) {
    const value = item[rule.field]
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        result.addError(
          rule.message || `值小于最小值 ${rule.min}`,
          `${path}.${rule.field}`,
          rule.suggestion
        )
      }
      if (rule.max !== undefined && value > rule.max) {
        result.addError(
          rule.message || `值大于最大值 ${rule.max}`,
          `${path}.${rule.field}`,
          rule.suggestion
        )
      }
    }
  }

  /**
   * 验证自定义规则
   */
  async validateCustom(rule, item, path, fullData, result) {
    if (typeof rule.validator === 'function') {
      const isValid = await rule.validator(item, fullData, path)
      if (!isValid) {
        result.addError(rule.message, `${path}.${rule.field}`, rule.suggestion)
      }
    }
  }

  /**
   * 验证引用
   */
  validateReference(rule, item, path, fullData, result) {
    // 引用验证逻辑
    const value = item[rule.field]
    if (value && rule.referenceCollection) {
      const collection = fullData[rule.referenceCollection]
      if (Array.isArray(collection)) {
        const exists = collection.some(ref => ref.id === value)
        if (!exists) {
          result.addError(
            rule.message || `引用的项目不存在: ${value}`,
            `${path}.${rule.field}`,
            rule.suggestion
          )
        }
      }
    }
  }

  /**
   * 验证节点位置
   */
  validateNodePosition(node) {
    if (!node.position || typeof node.position !== 'object') {
      return false
    }
    
    const { x, y } = node.position
    return typeof x === 'number' && typeof y === 'number' && 
           !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)
  }

  /**
   * 验证边引用格式
   */
  validateEdgeReference(item, fullData, path) {
    const field = path.includes('source') ? 'source' : 'target'
    const reference = item[field]
    
    if (!reference) return false
    
    // 检查新格式 {cell: "nodeId"}
    if (typeof reference === 'object' && reference.cell && typeof reference.cell === 'string') {
      return true
    }
    
    // 旧格式字符串ID（在严格模式下不允许）
    if (typeof reference === 'string' && !this.options.strictMode) {
      return true
    }
    
    return false
  }

  /**
   * 验证节点引用
   */
  validateNodeReferences(item, path, fullData, result) {
    const nodeIds = new Set((fullData.nodes || []).map(node => node.id).filter(Boolean))
    
    // 验证source引用
    if (item.source) {
      const sourceId = typeof item.source === 'string' ? item.source : item.source.cell
      if (sourceId && !nodeIds.has(sourceId)) {
        result.addError(
          `源节点引用不存在: ${sourceId}`,
          `${path}.source`,
          '确保引用的节点存在或移除无效引用'
        )
      }
    }
    
    // 验证target引用
    if (item.target) {
      const targetId = typeof item.target === 'string' ? item.target : item.target.cell
      if (targetId && !nodeIds.has(targetId)) {
        result.addError(
          `目标节点引用不存在: ${targetId}`,
          `${path}.target`,
          '确保引用的节点存在或移除无效引用'
        )
      }
    }
  }

  /**
   * 验证数据完整性
   */
  validateDataIntegrity(data) {
    // 检查基本结构
    if (!data || typeof data !== 'object') {
      return false
    }
    
    // 检查必要的数组字段
    const requiredArrays = ['nodes', 'edges']
    for (const field of requiredArrays) {
      if (!Array.isArray(data[field])) {
        return false
      }
    }
    
    // 检查ID唯一性
    const nodeIds = new Set()
    const edgeIds = new Set()
    
    for (const node of data.nodes) {
      if (!node.id || nodeIds.has(node.id)) {
        return false
      }
      nodeIds.add(node.id)
    }
    
    for (const edge of data.edges) {
      if (!edge.id || edgeIds.has(edge.id)) {
        return false
      }
      edgeIds.add(edge.id)
    }
    
    return true
  }

  /**
   * 添加自定义验证器
   */
  addCustomValidator(name, validator) {
    this.customValidators.set(name, validator)
  }

  /**
   * 获取验证统计
   */
  getValidationStatistics(result) {
    return {
      ...result.statistics,
      errorRate: result.statistics.totalItems > 0 ? 
        (result.statistics.errorItems / result.statistics.totalItems * 100).toFixed(2) + '%' : '0%',
      warningRate: result.statistics.totalItems > 0 ? 
        (result.statistics.warningItems / result.statistics.totalItems * 100).toFixed(2) + '%' : '0%'
    }
  }

  /**
   * 生成修复建议
   */
  generateFixSuggestions(result) {
    const suggestions = []
    
    // 按严重程度分组建议
    const errorSuggestions = result.fixSuggestions.filter(s => s.type === 'error')
    const warningSuggestions = result.fixSuggestions.filter(s => s.type === 'warning')
    
    if (errorSuggestions.length > 0) {
      suggestions.push({
        priority: 'high',
        title: '严重错误修复建议',
        items: errorSuggestions
      })
    }
    
    if (warningSuggestions.length > 0) {
      suggestions.push({
        priority: 'medium',
        title: '警告修复建议',
        items: warningSuggestions
      })
    }
    
    return suggestions
  }
}

export default UnifiedDataValidator
export { ValidationResult, ValidationRuleType, ValidationSeverity, DataType }