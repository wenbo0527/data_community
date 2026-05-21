export interface TaskBatch {
  id: number
  batchName: string
  templateId: string
  recipientCount: number
  creator: string
  createTime: string
  status: string
}

export interface TemplateItem {
  id: string
  messageType: string
  scene: string
  tags?: string[]
  title: string
  strategy: string
  content?: string
}

export interface BlacklistItem {
  username: string
  phone: string
  idCard: string
  addTime: string
  banTime?: string
  policy: string
  source: string
}

export interface Channel {
  id: number
  name: string
  status: string
  quota: number
  used: number
}

export interface GlobalConfig {
  channels: { sms: { quota: number }, email: { quota: number } }
  signatures: string[]
  approval: { enabled: boolean, levels: number }
}
export interface DictionaryItem {
  category: string
  key: string
  value: string
  desc?: string
}
export interface RateLimit {
  perMinute: number
  perHour: number
  perDay: number
}
export interface GlobalRateLimitItem {
  id: number
  channel: string
  scene: string
  line: string
  rule: string
  status: string
  remark?: string
  updatedAt?: string
}
export interface Alert {
  id: number
  name: string
  level: string
  status: string
}
export interface Vendor {
  id: number
  name: string
  status: string
}
export interface TouchDetail {
  id: number
  channel: string
  status: string
  time: string
}
export interface SmsRecord {
  id: number
  phone: string
  status: string
  time: string
}
export interface AiCallRecord {
  id: number
  user: string
  vendor: string
  time: string
}
export interface AiVendorSmsRecord {
  id: number
  vendor: string
  phone: string
  time: string
}
export interface ManualCallRecord {
  id: number
  agent: string
  user: string
  time: string
}
export interface ManualVendorSmsRecord {
  id: number
  vendor: string
  phone: string
  time: string
}
export interface MarketingQueryItem {
  id: number
  title: string
  channel: string
  time: string
}
export interface MarketingListItem {
  id: number
  title: string
  channel: string
  time: string
}
