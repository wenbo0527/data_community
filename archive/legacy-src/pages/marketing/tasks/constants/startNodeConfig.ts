import type { TargetAudienceType } from '../types/startNodeConfig'

// 开始节点配置常量
export const TASK_TYPES = [
  { value: 'marketing', label: '营销活动' },
  { value: 'notification', label: '通知推送' },
  { value: 'survey', label: '问卷调研' },
  { value: 'retention', label: '用户留存' }
] as const

export const FREQUENCY_OPTIONS = [
  { value: 'once', label: '仅一次' },
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'custom', label: '自定义' }
] as const

export const PRIORITY_OPTIONS = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
] as const

export const TARGET_AUDIENCE_OPTIONS = [
  { value: 'new-users', label: '新用户' },
  { value: 'active-users', label: '活跃用户' },
  { value: 'inactive-users', label: '沉默用户' },
  { value: 'high-value-users', label: '高价值用户' },
  { value: 'potential-churn', label: '流失风险用户' },
  { value: 'custom', label: '自定义人群' }
] as const

// 默认配置值
export const DEFAULT_START_NODE_CONFIG = {
  taskType: '' as const,
  entryDate: '',
  frequency: 'once' as const,
  deduplicationDays: 7,
  pushLimit: 1000,
  priority: 'medium' as const,
  targetAudience: [] as TargetAudienceType[],
  customAudienceConfig: ''
}

// 验证配置
export const VALIDATION_LIMITS = {
  deduplicationDays: { min: 1, max: 365 },
  pushLimit: { min: 1, max: 999999 }
} as const