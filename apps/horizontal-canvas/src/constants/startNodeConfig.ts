export const TASK_TYPES = [
  { label: '营销推广', value: 'marketing' },
  { label: '活动通知', value: 'activity' },
  { label: '系统任务', value: 'system' }
]
export const FREQUENCY_OPTIONS = [
  { label: '一次性', value: 'once' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' }
]
export const PRIORITY_OPTIONS = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' }
]
export const TARGET_AUDIENCE_OPTIONS = [
  { label: '全部用户', value: 'all' },
  { label: '活跃用户', value: 'active' },
  { label: '新用户', value: 'new' },
  { label: '自定义', value: 'custom' }
]
export const VALIDATION_LIMITS = {
  deduplicationDays: { min: 1, max: 365 },
  pushLimit: { min: 1, max: 100000 }
}
