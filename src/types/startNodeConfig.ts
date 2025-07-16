// 开始节点配置类型定义
export interface StartNodeConfig {
  taskType: 'marketing' | 'notification' | 'survey' | 'retention' | ''
  entryDate: string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
  deduplicationDays: number
  pushLimit: number
  priority: 'high' | 'medium' | 'low'
  targetAudience: TargetAudienceType[]
  customAudienceConfig?: string
}

export type TargetAudienceType = 
  | 'new-users'
  | 'active-users' 
  | 'inactive-users'
  | 'high-value-users'
  | 'potential-churn'
  | 'custom'

export interface StartNodeConfigDrawerProps {
  visible: boolean
  nodeData?: Partial<StartNodeConfig>
}

export interface StartNodeConfigDrawerEmits {
  'update:visible': [visible: boolean]
  'confirm': [config: StartNodeConfig]
  'cancel': []
}

// 表单验证规则类型
export interface FormValidationRule {
  required?: boolean
  message?: string
  type?: 'string' | 'number' | 'boolean' | 'array'
  min?: number
  max?: number
}

export type FormRules = {
  [K in keyof StartNodeConfig]?: FormValidationRule[]
}