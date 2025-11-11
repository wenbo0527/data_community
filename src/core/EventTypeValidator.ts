/**
 * 事件类型验证器
 * 提供事件类型和数据的预检查机制，替代降级逻辑
 * 确保事件处理的安全性和一致性
 */

import { 
  CanvasEventTypes, 
  type CanvasEventType, 
  isValidEventType,
  getEventCategory,
  EventCategories
} from './CanvasEventTypes'

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 事件数据验证规则
 */
export interface EventValidationRule {
  requiredFields?: string[]
  optionalFields?: string[]
  fieldTypes?: Record<string, string>
  customValidator?: (data: any) => ValidationResult
}

/**
 * 事件类型验证配置
 */
export interface EventValidationConfig {
  strictMode: boolean
  enableWarnings: boolean
  enableCustomValidation: boolean
  maxDataSize: number
}

/**
 * 事件类型验证器
 * 提供事件类型和数据的预检查机制
 */
export class EventTypeValidator {
  private validationRules: Map<CanvasEventType, EventValidationRule>
  private config: EventValidationConfig

  constructor(config: Partial<EventValidationConfig> = {}) {
    this.config = {
      strictMode: true,
      enableWarnings: true,
      enableCustomValidation: true,
      maxDataSize: 1024 * 1024, // 1MB
      ...config
    }

    this.validationRules = new Map()
    this.initializeValidationRules()
  }

  /**
   * 验证事件类型
   */
  public validateEventType(eventType: string): boolean {
    if (!eventType || typeof eventType !== 'string') {
      this.logError('Event type must be a non-empty string')
      return false
    }

    // 检查是否为有效的事件类型
    if (!isValidEventType(eventType)) {
      this.logError(`Invalid event type: ${eventType}`)
      return false
    }

    // 检查事件类型格式
    if (!this.validateEventTypeFormat(eventType)) {
      this.logError(`Invalid event type format: ${eventType}`)
      return false
    }

    return true
  }

  /**
   * 验证事件数据
   */
  public validateEventData<T = any>(eventType: string, data?: T): boolean {
    // 首先验证事件类型
    if (!this.validateEventType(eventType)) {
      return false
    }

    // 验证数据大小
    if (!this.validateDataSize(data)) {
      return false
    }

    // 获取验证规则
    const rule = this.validationRules.get(eventType as CanvasEventType)
    if (!rule) {
      // 如果没有特定规则，进行基础验证
      return this.validateBasicData(data)
    }

    // 执行验证规则
    const result = this.validateDataWithRule(data, rule)
    
    if (!result.isValid && this.config.strictMode) {
      this.logError(`Event data validation failed for ${eventType}:`, result.errors)
      return false
    }

    if (result.warnings.length > 0 && this.config.enableWarnings) {
      this.logWarning(`Event data warnings for ${eventType}:`, result.warnings)
    }

    return true
  }

  /**
   * 验证多个事件
   */
  public validateEvents(events: Array<{ type: string; data?: any }>): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    }

    for (const event of events) {
      const eventResult = this.validateEvent(event.type, event.data)
      
      if (!eventResult.isValid) {
        result.isValid = false
        result.errors.push(...eventResult.errors)
      }
      
      result.warnings.push(...eventResult.warnings)
    }

    return result
  }

  /**
   * 验证事件（类型+数据）
   */
  public validateEvent<T = any>(eventType: string, data?: T): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    }

    // 验证事件类型
    if (!this.validateEventType(eventType)) {
      result.isValid = false
      result.errors.push(`Invalid event type: ${eventType}`)
    }

    // 验证事件数据
    if (!this.validateEventData(eventType, data)) {
      result.isValid = false
      result.errors.push(`Invalid event data for type: ${eventType}`)
    }

    return result
  }

  /**
   * 添加自定义验证规则
   */
  public addValidationRule(
    eventType: CanvasEventType, 
    rule: EventValidationRule
  ): void {
    this.validationRules.set(eventType, rule)
    this.logInfo(`Added validation rule for event: ${eventType}`)
  }

  /**
   * 移除验证规则
   */
  public removeValidationRule(eventType: CanvasEventType): void {
    this.validationRules.delete(eventType)
    this.logInfo(`Removed validation rule for event: ${eventType}`)
  }

  /**
   * 获取验证规则
   */
  public getValidationRule(eventType: CanvasEventType): EventValidationRule | undefined {
    return this.validationRules.get(eventType)
  }

  /**
   * 获取所有验证规则
   */
  public getAllValidationRules(): Map<CanvasEventType, EventValidationRule> {
    return new Map(this.validationRules)
  }

  /**
   * 验证事件类型格式
   */
  private validateEventTypeFormat(eventType: string): boolean {
    // 检查是否包含冒号分隔符
    if (!eventType.includes(':')) {
      return false
    }

    // 检查格式：category:event-name
    const parts = eventType.split(':')
    if (parts.length < 2) {
      return false
    }

    // 检查各部分是否为空
    return parts.every(part => part.trim().length > 0)
  }

  /**
   * 验证数据大小
   */
  private validateDataSize<T = any>(data?: T): boolean {
    if (data === null || data === undefined) {
      return true
    }

    try {
      const dataSize = this.getDataSize(data)
      if (dataSize > this.config.maxDataSize) {
        this.logError(`Event data size (${dataSize} bytes) exceeds maximum allowed size (${this.config.maxDataSize} bytes)`)
        return false
      }
    } catch (error) {
      this.logError('Failed to validate data size:', error)
      return false
    }

    return true
  }

  /**
   * 获取数据大小（近似值）
   */
  private getDataSize<T = any>(data: T): number {
    try {
      return JSON.stringify(data).length
    } catch (error) {
      // 如果无法序列化，返回一个较大的值
      return this.config.maxDataSize + 1
    }
  }

  /**
   * 基础数据验证
   */
  private validateBasicData<T = any>(data?: T): boolean {
    if (data === null || data === undefined) {
      return true
    }

    // 检查是否为基本类型或对象
    const dataType = typeof data
    if (!['string', 'number', 'boolean', 'object'].includes(dataType)) {
      this.logError(`Invalid data type: ${dataType}`)
      return false
    }

    return true
  }

  /**
   * 使用规则验证数据
   */
  private validateDataWithRule<T = any>(data?: T, rule?: EventValidationRule): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    }

    if (!rule) {
      return result
    }

    // 检查必需字段
    if (rule.requiredFields) {
      for (const field of rule.requiredFields) {
        if (!this.hasField(data, field)) {
          result.isValid = false
          result.errors.push(`Missing required field: ${field}`)
        }
      }
    }

    // 检查字段类型
    if (rule.fieldTypes && data && typeof data === 'object') {
      for (const [field, expectedType] of Object.entries(rule.fieldTypes)) {
        if (this.hasField(data, field)) {
          const actualType = this.getFieldType(data, field)
          if (actualType !== expectedType) {
            result.isValid = false
            result.errors.push(`Field ${field} has invalid type. Expected: ${expectedType}, Actual: ${actualType}`)
          }
        }
      }
    }

    // 执行自定义验证器
    if (rule.customValidator && this.config.enableCustomValidation) {
      const customResult = rule.customValidator(data)
      if (!customResult.isValid) {
        result.isValid = false
        result.errors.push(...customResult.errors)
      }
      result.warnings.push(...customResult.warnings)
    }

    return result
  }

  /**
   * 检查对象是否包含指定字段
   */
  private hasField(data: any, field: string): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    return field in data
  }

  /**
   * 获取字段类型
   */
  private getFieldType(data: any, field: string): string {
    if (!this.hasField(data, field)) {
      return 'undefined'
    }

    const value = data[field]
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    
    return typeof value
  }

  /**
   * 初始化验证规则
   */
  private initializeValidationRules(): void {
    // 节点事件验证规则
    this.addValidationRule('canvas:node:created', {
      requiredFields: ['id', 'type', 'position'],
      fieldTypes: {
        id: 'string',
        type: 'string'
      }
    })

    // 连接事件验证规则（统一连接事件负载：id/source/target）
    this.addValidationRule('canvas:connection:added', {
      requiredFields: ['id', 'source', 'target'],
      fieldTypes: {
        id: 'string',
        source: 'string',
        target: 'string'
      },
      customValidator: (data: any) => {
        const result: ValidationResult = { isValid: true, errors: [], warnings: [] }
        if (!data) {
          result.isValid = false
          result.errors.push('连接事件缺少负载数据')
          return result
        }
        // 端口ID为可选字段，但若存在需为字符串
        if (data.sourcePort !== undefined && typeof data.sourcePort !== 'string') {
          result.isValid = false
          result.errors.push('sourcePort 类型必须为 string')
        }
        if (data.targetPort !== undefined && typeof data.targetPort !== 'string') {
          result.isValid = false
          result.errors.push('targetPort 类型必须为 string')
        }
        return result
      }
    })

    // 键盘事件验证规则
    this.addValidationRule('canvas:keyboard:key-down', {
      requiredFields: ['key', 'code'],
      fieldTypes: {
        key: 'string',
        code: 'string'
      }
    })

    // 鼠标事件验证规则
    this.addValidationRule('canvas:mouse:mouse-down', {
      requiredFields: ['x', 'y'],
      fieldTypes: {
        x: 'number',
        y: 'number'
      }
    })

    // 视图事件验证规则
    this.addValidationRule('canvas:view:zoomed', {
      requiredFields: ['zoom'],
      fieldTypes: {
        zoom: 'number'
      }
    })
  }

  /**
   * 日志记录
   */
  private logError(message: string, error?: any): void {
    console.error(`[EventTypeValidator] ${message}`, error || '')
  }

  private logWarning(message: string, warnings?: any): void {
    console.warn(`[EventTypeValidator] ${message}`, warnings || '')
  }

  private logInfo(message: string): void {
    console.info(`[EventTypeValidator] ${message}`)
  }
}

/**
 * 默认验证器实例
 */
export const eventTypeValidator = new EventTypeValidator()

/**
 * 快捷验证函数
 */
export const validateEventType = eventTypeValidator.validateEventType.bind(eventTypeValidator)
export const validateEventData = eventTypeValidator.validateEventData.bind(eventTypeValidator)
export const validateEvent = eventTypeValidator.validateEvent.bind(eventTypeValidator)
export const validateEvents = eventTypeValidator.validateEvents.bind(eventTypeValidator)

export default EventTypeValidator