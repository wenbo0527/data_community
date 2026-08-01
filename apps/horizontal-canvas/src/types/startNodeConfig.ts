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
  // 产品（多选）：sudai | jd_low_interest | meituan_low_interest
  products?: string[]
}
