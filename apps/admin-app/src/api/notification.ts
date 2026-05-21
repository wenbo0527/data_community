// notification API stub
import request from '@/utils/request'

export interface NotificationItem {
  id: number
  title: string
  content: string
  category: string
  status: string
  createdAt: string
}

export const NotificationAPI = {
  list: (params?: any) => request.get('/notifications', { params }),
  detail: (id: number) => request.get(`/notifications/${id}`),
  create: (data: any) => request.post('/notifications', data),
  update: (id: number, data: any) => request.put(`/notifications/${id}`, data),
  delete: (id: number) => request.delete(`/notifications/${id}`)
}

export const CategoryAPI = {
  list: () => request.get('/notification-categories'),
  create: (data: any) => request.post('/notification-categories', data),
  update: (id: number, data: any) => request.put(`/notification-categories/${id}`, data),
  delete: (id: number) => request.delete(`/notification-categories/${id}`)
}

export const OperationLogAPI = { list: (params?: any) => request.get('/operation-logs', { params }) }

export default { NotificationAPI, CategoryAPI, OperationLogAPI }
