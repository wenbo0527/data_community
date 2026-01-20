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
