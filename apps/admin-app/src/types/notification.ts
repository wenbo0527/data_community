// notification types
export interface NotificationType {
  id: number
  name: string
  code: string
}

export interface NotificationCategory {
  id: number
  name: string
}

export interface NotificationRecord {
  id: number
  title: string
  content: string
  type: string
  category: string
  status: string
  createdAt: string
}
