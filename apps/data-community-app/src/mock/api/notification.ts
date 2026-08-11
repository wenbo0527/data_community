// Notification Mock API

interface NotificationItem {
  id: string
  title: string
  content: string
  category: string
  categoryId?: string
  priority: 'high' | 'medium' | 'low'
  status: 'published' | 'draft' | 'expired' | 'archived'
  publishTime: string
  expireTime: string
  source: string
  createdBy: string
  createdAt: string
  updatedAt: string
  targetUsers: string
  attachments: any[]
  readCount: number
  viewCount: number
  important: boolean
  isTop: boolean
  category_color?: string
}

interface OperationLog {
  id: string
  operator: string
  operation: string
  action: string
  time: string
  operatedAt: string
  detail: string
}

interface Category {
  id: string
  name: string
  description: string
  color: string
  notificationCount: number
  createTime: string
}

const notifications: NotificationItem[] = [
  {
    id: '1',
    title: '系统维护通知',
    content: '本系统将于本周六凌晨2:00-6:00进行例行维护升级，期间服务可能不可用。',
    category: '系统通知',
    categoryId: 'CAT001',
    priority: 'high',
    status: 'published',
    publishTime: '2025-01-15 09:00:00',
    expireTime: '2025-01-20 23:59:59',
    source: '运维团队',
    createdBy: '管理员',
    createdAt: '2025-01-15 08:00:00',
    updatedAt: '2025-01-15 09:00:00',
    targetUsers: '全体用户',
    attachments: [],
    readCount: 1280,
    viewCount: 1280,
    important: true,
    isTop: true
  },
  {
    id: '2',
    title: '数据治理周报',
    content: '本周新增数据资产 12 项，完成质量检核 35 项，指标合格率 96.8%。',
    category: '数据治理',
    categoryId: 'CAT002',
    priority: 'medium',
    status: 'published',
    publishTime: '2025-01-14 18:00:00',
    expireTime: '2025-01-21 23:59:59',
    source: '数据治理团队',
    createdBy: '数据治理员',
    createdAt: '2025-01-14 17:00:00',
    updatedAt: '2025-01-14 18:00:00',
    targetUsers: '数据管理员',
    attachments: [],
    readCount: 86,
    viewCount: 86,
    important: false,
    isTop: false
  },
  {
    id: '3',
    title: '新增指标上架审批通过',
    content: '您提交的指标「客户授信通过率」已通过审批并成功上架。',
    category: '审批通知',
    categoryId: 'CAT003',
    priority: 'low',
    status: 'published',
    publishTime: '2025-01-13 14:30:00',
    expireTime: '2025-02-13 23:59:59',
    source: '审批系统',
    createdBy: '审批系统',
    createdAt: '2025-01-13 14:00:00',
    updatedAt: '2025-01-13 14:30:00',
    targetUsers: '张三',
    attachments: [],
    readCount: 1,
    viewCount: 1,
    important: false,
    isTop: false
  }
]

const operationLogs: OperationLog[] = [
  { id: 'LOG001', operator: '管理员', operation: '创建', action: 'create', time: '2025-01-15 09:00:00', operatedAt: '2025-01-15 09:00:00', detail: '创建通知' },
  { id: 'LOG002', operator: '管理员', operation: '发布', action: 'publish', time: '2025-01-15 09:05:00', operatedAt: '2025-01-15 09:05:00', detail: '发布通知' },
  { id: 'LOG003', operator: '张三', operation: '标记重要', action: 'update', time: '2025-01-15 10:00:00', operatedAt: '2025-01-15 10:00:00', detail: '标记为重要通知' }
]

const categories: Category[] = [
  { id: 'CAT001', name: '系统通知', description: '系统维护、升级等相关通知', color: 'blue', notificationCount: 12, createTime: '2025-01-01 00:00:00' },
  { id: 'CAT002', name: '数据治理', description: '数据治理相关周报与报告', color: 'green', notificationCount: 8, createTime: '2025-01-02 00:00:00' },
  { id: 'CAT003', name: '审批通知', description: '审批流程相关通知', color: 'orange', notificationCount: 25, createTime: '2025-01-03 00:00:00' },
  { id: 'CAT004', name: '安全告警', description: '安全风险与告警通知', color: 'red', notificationCount: 3, createTime: '2025-01-04 00:00:00' }
]

export const NotificationAPI = {
  async getNotifications(params: any = {}) {
    const { page = 1, pageSize = 10, category, status, keyword } = params
    let list = [...notifications]
    if (category) list = list.filter(n => n.categoryId === category || n.category === category)
    if (status) list = list.filter(n => n.status === status)
    if (keyword) list = list.filter(n => n.title.includes(keyword))
    const total = list.length
    const start = (page - 1) * pageSize
    const pageList = list.slice(start, start + pageSize)
    return { success: true, data: { list: pageList, total } }
  },

  async getNotification(id: string) {
    const item = notifications.find(n => n.id === id || n.id === String(id))
    return { success: true, data: item || notifications[0] }
  },

  async createNotification(data: any) {
    const item = { ...data, id: String(notifications.length + 1), readCount: 0, viewCount: 0, attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    notifications.unshift(item)
    return { success: true, data: item }
  },

  async updateNotification(id: string, data: any) {
    const idx = notifications.findIndex(n => n.id === id || n.id === String(id))
    if (idx > -1) Object.assign(notifications[idx], data, { updatedAt: new Date().toISOString() })
    return { success: true, data: notifications[idx] }
  },

  async deleteNotification(id: string) {
    const idx = notifications.findIndex(n => n.id === id || n.id === String(id))
    if (idx > -1) notifications.splice(idx, 1)
    return { success: true }
  }
}

export const OperationLogAPI = {
  async getOperationLogs(id: string) {
    return { success: true, data: { list: operationLogs } }
  }
}

export const CategoryAPI = {
  async getCategories() {
    return { success: true, data: categories }
  },

  async createCategory(data: any) {
    const item = { ...data, id: `CAT${String(categories.length + 1).padStart(3, '0')}`, notificationCount: 0, createTime: new Date().toISOString() }
    categories.push(item)
    return { success: true, data: item }
  },

  async updateCategory(id: string, data: any) {
    const idx = categories.findIndex(c => c.id === id)
    if (idx > -1) Object.assign(categories[idx], data)
    return { success: true, data: categories[idx] }
  },

  async deleteCategory(id: string) {
    const idx = categories.findIndex(c => c.id === id)
    if (idx > -1) categories.splice(idx, 1)
    return { success: true }
  }
}

export default { NotificationAPI, OperationLogAPI, CategoryAPI }
