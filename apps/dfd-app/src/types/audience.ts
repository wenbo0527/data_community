// 人群条件配置相关类型定义

export interface Condition {
  id: string
  type: 'tag' | 'behavior' | 'detail'
  field: string
  operator: string
  value: string | number | string[]
  isValid: boolean
  description?: string
}

export interface ConditionGroup {
  id: string
  name: string
  logic: 'and' | 'or'
  conditions: Condition[]
  isExclude: boolean
  collapsed: boolean
  groupType: 'include' | 'exclude'
}

export interface PreCalculateStats {
  includeCount: number
  excludeCount: number
  finalCount: number
  lastUpdateTime: string
  formula?: string
}

export interface ValidationError {
  id: string
  type: string
  message: string
  groupId?: string
  conditionId?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: ValidationError[]
}

export interface LogicNode {
  id: string
  type: 'condition_group' | 'operator'
  label: string
  x: number
  y: number
  width: number
  height: number
  groupType?: 'include' | 'exclude'
  logic?: 'and' | 'or'
}

export interface LogicConnection {
  id: string
  source: string
  target: string
  type: 'and' | 'or'
  label?: string
}

export interface LogicGraph {
  nodes: LogicNode[]
  connections: LogicConnection[]
}

export interface FieldValidation {
  field: string
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface FormValidationState {
  isValid: boolean
  fields: FieldValidation[]
  summary: {
    totalFields: number
    validFields: number
    invalidFields: number
    passRate: number
  }
}