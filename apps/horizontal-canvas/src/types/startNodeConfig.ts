export interface StartNodeConfig {
  nodeName: string
  taskType: string
  entryDate: string
  frequency: string
  deduplicationDays: number
  pushLimit: number
  priority: string
  targetAudience: string[]
  customAudienceConfig?: string
}
