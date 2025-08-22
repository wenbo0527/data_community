import type { UnifiedEventBus } from '@/core/UnifiedEventBus'
import type { ErrorHandler } from '@/core/ErrorHandler'
import type { ValidationError, ValidationResult } from '@/managers/publish/ValidationManager'

export interface NodeConfigValidatorOptions {
  eventBus: UnifiedEventBus
  errorHandler: ErrorHandler
}

export interface NodeData {
  nodeType: string
  dataSource?: {
    type: string
    connectionString?: string
    database?: string
    table?: string
    query?: string
  }
  processingLogic?: {
    code: string
    language?: string
    dependencies?: string[]
  }
  outputSchema?: {
    fields: string[]
    types?: Record<string, string>
  }
  outputTarget?: {
    type: string
    destination?: string
    format?: string
  }
  [key: string]: any
}

/**
 * 节点配置校验器
 * 负责校验节点的配置完整性和有效性
 */
export default class NodeConfigValidator {
  private eventBus: UnifiedEventBus
  private errorHandler: ErrorHandler

  // 节点类型配置要求
  private readonly nodeTypeRequirements = {
    INPUT_NODE: {
      required: ['dataSource'],
      optional: ['outputSchema']
    },
    PROCESSING_NODE: {
      required: ['processingLogic'],
      optional: ['outputSchema']
    },
    OUTPUT_NODE: {
      required: ['outputTarget'],
      optional: ['outputSchema']
    },
    FILTER_NODE: {
      required: ['processingLogic'],
      optional: ['outputSchema']
    },
    JOIN_NODE: {
      required: ['processingLogic'],
      optional: ['outputSchema']
    },
    AGGREGATE_NODE: {
      required: ['processingLogic'],
      optional: ['outputSchema']
    }
  }

  constructor(options: NodeConfigValidatorOptions) {
    this.eventBus = options.eventBus
    this.errorHandler = options.errorHandler
  }

  /**
   * 校验节点配置
   */
  async validate(nodeData: NodeData, nodeId: string): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    try {
      // 基础校验
      this.validateBasicStructure(nodeData, nodeId, errors)
      
      // 节点类型特定校验
      this.validateNodeTypeSpecific(nodeData, nodeId, errors, warnings)
      
      // 数据源校验
      if (nodeData.dataSource) {
        this.validateDataSource(nodeData.dataSource, nodeId, errors, warnings)
      }
      
      // 处理逻辑校验
      if (nodeData.processingLogic) {
        this.validateProcessingLogic(nodeData.processingLogic, nodeId, errors, warnings)
      }
      
      // 输出目标校验
      if (nodeData.outputTarget) {
        this.validateOutputTarget(nodeData.outputTarget, nodeId, errors, warnings)
      }
      
      // 输出模式校验
      if (nodeData.outputSchema) {
        this.validateOutputSchema(nodeData.outputSchema, nodeId, errors, warnings)
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        timestamp: Date.now()
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'NodeConfigValidator.validate',
        nodeId
      })

      return {
        isValid: false,
        errors: [{
          type: 'VALIDATION_EXCEPTION',
          message: `节点配置校验异常: ${(error as Error).message}`,
          severity: 'error',
          nodeId
        }],
        warnings: [],
        timestamp: Date.now()
      }
    }
  }

  /**
   * 校验基础结构
   */
  private validateBasicStructure(nodeData: NodeData, nodeId: string, errors: ValidationError[]): void {
    // 检查节点类型
    if (!nodeData.nodeType) {
      errors.push({
        type: 'MISSING_FIELD',
        field: 'nodeType',
        message: '节点类型不能为空',
        severity: 'error',
        nodeId
      })
      return
    }

    // 检查节点类型是否支持
    if (!this.nodeTypeRequirements[nodeData.nodeType as keyof typeof this.nodeTypeRequirements]) {
      errors.push({
        type: 'INVALID_NODE_TYPE',
        field: 'nodeType',
        message: `不支持的节点类型: ${nodeData.nodeType}`,
        severity: 'error',
        nodeId
      })
    }
  }

  /**
   * 校验节点类型特定要求
   */
  private validateNodeTypeSpecific(
    nodeData: NodeData,
    nodeId: string,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const requirements = this.nodeTypeRequirements[nodeData.nodeType as keyof typeof this.nodeTypeRequirements]
    if (!requirements) return

    // 检查必填字段
    for (const field of requirements.required) {
      if (!nodeData[field]) {
        errors.push({
          type: 'MISSING_REQUIRED_FIELD',
          field,
          message: `${nodeData.nodeType} 节点缺少必填字段: ${field}`,
          severity: 'error',
          nodeId
        })
      }
    }

    // 检查可选字段的合理性
    for (const field of requirements.optional) {
      if (nodeData[field] && this.isFieldEmpty(nodeData[field])) {
        warnings.push({
          type: 'EMPTY_OPTIONAL_FIELD',
          field,
          message: `${field} 字段为空，可能影响节点功能`,
          severity: 'warning',
          nodeId
        })
      }
    }
  }

  /**
   * 校验数据源配置
   */
  private validateDataSource(
    dataSource: NodeData['dataSource'],
    nodeId: string,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (!dataSource) return

    // 检查数据源类型
    if (!dataSource.type) {
      errors.push({
        type: 'MISSING_FIELD',
        field: 'dataSource.type',
        message: '数据源类型不能为空',
        severity: 'error',
        nodeId
      })
      return
    }

    // 根据数据源类型校验特定字段
    switch (dataSource.type) {
      case 'database':
        if (!dataSource.connectionString && !dataSource.database) {
          errors.push({
            type: 'MISSING_DATABASE_CONFIG',
            field: 'dataSource',
            message: '数据库数据源需要连接字符串或数据库名称',
            severity: 'error',
            nodeId
          })
        }
        break

      case 'file':
        if (!dataSource.destination) {
          errors.push({
            type: 'MISSING_FILE_PATH',
            field: 'dataSource.destination',
            message: '文件数据源需要指定文件路径',
            severity: 'error',
            nodeId
          })
        }
        break

      case 'api':
        if (!dataSource.connectionString) {
          errors.push({
            type: 'MISSING_API_URL',
            field: 'dataSource.connectionString',
            message: 'API数据源需要指定接口地址',
            severity: 'error',
            nodeId
          })
        }
        break

      default:
        warnings.push({
          type: 'UNKNOWN_DATA_SOURCE_TYPE',
          field: 'dataSource.type',
          message: `未知的数据源类型: ${dataSource.type}`,
          severity: 'warning',
          nodeId
        })
    }
  }

  /**
   * 校验处理逻辑配置
   */
  private validateProcessingLogic(
    processingLogic: NodeData['processingLogic'],
    nodeId: string,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (!processingLogic) return

    // 检查代码内容
    if (!processingLogic.code || processingLogic.code.trim() === '') {
      errors.push({
        type: 'EMPTY_PROCESSING_CODE',
        field: 'processingLogic.code',
        message: '处理逻辑代码不能为空',
        severity: 'error',
        nodeId
      })
    }

    // 检查代码语言
    const supportedLanguages = ['python', 'sql', 'javascript']
    if (processingLogic.language && !supportedLanguages.includes(processingLogic.language)) {
      warnings.push({
        type: 'UNSUPPORTED_LANGUAGE',
        field: 'processingLogic.language',
        message: `不支持的代码语言: ${processingLogic.language}`,
        severity: 'warning',
        nodeId
      })
    }

    // 基础语法检查
    if (processingLogic.code) {
      this.validateCodeSyntax(processingLogic.code, processingLogic.language || 'python', nodeId, errors, warnings)
    }
  }

  /**
   * 校验输出目标配置
   */
  private validateOutputTarget(
    outputTarget: NodeData['outputTarget'],
    nodeId: string,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (!outputTarget) return

    // 检查输出类型
    if (!outputTarget.type) {
      errors.push({
        type: 'MISSING_FIELD',
        field: 'outputTarget.type',
        message: '输出目标类型不能为空',
        severity: 'error',
        nodeId
      })
      return
    }

    // 根据输出类型校验特定字段
    switch (outputTarget.type) {
      case 'database':
      case 'file':
        if (!outputTarget.destination) {
          errors.push({
            type: 'MISSING_OUTPUT_DESTINATION',
            field: 'outputTarget.destination',
            message: `${outputTarget.type} 输出需要指定目标位置`,
            severity: 'error',
            nodeId
          })
        }
        break

      case 'api':
        if (!outputTarget.destination) {
          errors.push({
            type: 'MISSING_API_ENDPOINT',
            field: 'outputTarget.destination',
            message: 'API输出需要指定接口地址',
            severity: 'error',
            nodeId
          })
        }
        break

      default:
        warnings.push({
          type: 'UNKNOWN_OUTPUT_TYPE',
          field: 'outputTarget.type',
          message: `未知的输出类型: ${outputTarget.type}`,
          severity: 'warning',
          nodeId
        })
    }
  }

  /**
   * 校验输出模式配置
   */
  private validateOutputSchema(
    outputSchema: NodeData['outputSchema'],
    nodeId: string,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (!outputSchema) return

    // 检查字段列表
    if (!outputSchema.fields || !Array.isArray(outputSchema.fields) || outputSchema.fields.length === 0) {
      warnings.push({
        type: 'EMPTY_OUTPUT_SCHEMA',
        field: 'outputSchema.fields',
        message: '输出模式字段列表为空',
        severity: 'warning',
        nodeId
      })
    }

    // 检查字段名称有效性
    if (outputSchema.fields) {
      for (const field of outputSchema.fields) {
        if (typeof field !== 'string' || field.trim() === '') {
          errors.push({
            type: 'INVALID_FIELD_NAME',
            field: 'outputSchema.fields',
            message: `无效的字段名称: ${field}`,
            severity: 'error',
            nodeId
          })
        }
      }
    }

    // 检查字段类型定义
    if (outputSchema.types) {
      const supportedTypes = ['string', 'number', 'boolean', 'date', 'object', 'array']
      for (const [field, type] of Object.entries(outputSchema.types)) {
        if (!supportedTypes.includes(type)) {
          warnings.push({
            type: 'UNSUPPORTED_FIELD_TYPE',
            field: `outputSchema.types.${field}`,
            message: `不支持的字段类型: ${type}`,
            severity: 'warning',
            nodeId
          })
        }
      }
    }
  }

  /**
   * 校验代码语法（基础检查）
   */
  private validateCodeSyntax(
    code: string,
    language: string,
    nodeId: string,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // 基础语法检查
    switch (language) {
      case 'python':
        // 检查Python基础语法
        if (code.includes('def ') && !code.includes('return')) {
          warnings.push({
            type: 'MISSING_RETURN_STATEMENT',
            field: 'processingLogic.code',
            message: 'Python函数缺少return语句',
            severity: 'warning',
            nodeId
          })
        }
        break

      case 'sql':
        // 检查SQL基础语法
        const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE']
        const hasKeyword = sqlKeywords.some(keyword => 
          code.toUpperCase().includes(keyword)
        )
        if (!hasKeyword) {
          warnings.push({
            type: 'INVALID_SQL_SYNTAX',
            field: 'processingLogic.code',
            message: 'SQL代码缺少基本关键字',
            severity: 'warning',
            nodeId
          })
        }
        break

      case 'javascript':
        // 检查JavaScript基础语法
        if (code.includes('function ') && !code.includes('return')) {
          warnings.push({
            type: 'MISSING_RETURN_STATEMENT',
            field: 'processingLogic.code',
            message: 'JavaScript函数缺少return语句',
            severity: 'warning',
            nodeId
          })
        }
        break
    }
  }

  /**
   * 检查字段是否为空
   */
  private isFieldEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }
}