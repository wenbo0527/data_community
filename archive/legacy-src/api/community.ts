/**
 * 社区资源管理系统 - API 接口定义
 */

import type {
  ResourceCategoryModel,
  TreeNode,
  Document,
  Notification,
  NotificationAttachment,
  User,
  OperationLog,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  TreeQueryParams,
  CategoryStats,
  HomeStats
} from '@/types/community'

// API 基础配置
const API_BASE_URL = '/api/community'

// HTTP 请求工具函数
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 分类管理 API
export const categoryApi = {
  // 获取所有分类
  getCategories: (): Promise<ApiResponse<ResourceCategoryModel[]>> =>
    request('/categories'),

  // 获取分类详情
  getCategoryById: (id: string): Promise<ApiResponse<ResourceCategoryModel>> =>
    request(`/categories/${id}`),

  // 创建分类
  createCategory: (data: Omit<ResourceCategoryModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ResourceCategoryModel>> =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新分类
  updateCategory: (id: string, data: Partial<ResourceCategoryModel>): Promise<ApiResponse<ResourceCategoryModel>> =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除分类
  deleteCategory: (id: string): Promise<ApiResponse<void>> =>
    request(`/categories/${id}`, {
      method: 'DELETE',
    }),
}

// 树节点管理 API
export const treeApi = {
  // 获取树形结构
  getTreeNodes: (params?: TreeQueryParams): Promise<ApiResponse<TreeNode[]>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return request(`/tree${queryString}`)
  },

  // 获取树节点详情
  getTreeNodeById: (id: string): Promise<ApiResponse<TreeNode>> =>
    request(`/tree/${id}`),

  // 创建树节点
  createTreeNode: (data: Omit<TreeNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TreeNode>> =>
    request('/tree', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新树节点
  updateTreeNode: (id: string, data: Partial<TreeNode>): Promise<ApiResponse<TreeNode>> =>
    request(`/tree/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除树节点
  deleteTreeNode: (id: string): Promise<ApiResponse<void>> =>
    request(`/tree/${id}`, {
      method: 'DELETE',
    }),
}

// 文档管理 API
export const documentApi = {
  // 获取文档列表
  getDocuments: (params?: QueryParams): Promise<ApiResponse<PaginatedResponse<Document>>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return request(`/documents${queryString}`)
  },

  // 获取文档详情
  getDocumentById: (id: string): Promise<ApiResponse<Document>> =>
    request(`/documents/${id}`),

  // 创建文档
  createDocument: (data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Document>> =>
    request('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新文档
  updateDocument: (id: string, data: Partial<Document>): Promise<ApiResponse<Document>> =>
    request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除文档
  deleteDocument: (id: string): Promise<ApiResponse<void>> =>
    request(`/documents/${id}`, {
      method: 'DELETE',
    }),

  // 上传文档文件
  uploadDocument: (file: File, categoryId: string): Promise<ApiResponse<{ fileUrl: string; fileName: string; fileSize: string }>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('categoryId', categoryId)

    return fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    }).then(response => response.json())
  },

  // 增加文档查看次数
  incrementViews: (id: string): Promise<ApiResponse<void>> =>
    request(`/documents/${id}/views`, {
      method: 'POST',
    }),
}

// 通知管理 API
export const notificationApi = {
  // 获取通知列表
  getNotifications: (params?: QueryParams): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return request(`/notifications${queryString}`)
  },

  // 获取通知详情
  getNotificationById: (id: string): Promise<ApiResponse<Notification>> =>
    request(`/notifications/${id}`),

  // 创建通知
  createNotification: (data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Notification>> =>
    request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新通知
  updateNotification: (id: string, data: Partial<Notification>): Promise<ApiResponse<Notification>> =>
    request(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除通知
  deleteNotification: (id: string): Promise<ApiResponse<void>> =>
    request(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  // 发布通知
  publishNotification: (id: string): Promise<ApiResponse<Notification>> =>
    request(`/notifications/${id}/publish`, {
      method: 'POST',
    }),

  // 撤回通知
  unpublishNotification: (id: string): Promise<ApiResponse<Notification>> =>
    request(`/notifications/${id}/unpublish`, {
      method: 'POST',
    }),

  // 增加通知查看次数
  incrementViews: (id: string): Promise<ApiResponse<void>> =>
    request(`/notifications/${id}/views`, {
      method: 'POST',
    }),
}

// 通知附件管理 API
export const attachmentApi = {
  // 获取通知附件列表
  getAttachments: (notificationId: string): Promise<ApiResponse<NotificationAttachment[]>> =>
    request(`/notifications/${notificationId}/attachments`),

  // 上传通知附件
  uploadAttachment: (notificationId: string, file: File, description?: string): Promise<ApiResponse<NotificationAttachment>> => {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }

    return fetch(`${API_BASE_URL}/notifications/${notificationId}/attachments`, {
      method: 'POST',
      body: formData,
    }).then(response => response.json())
  },

  // 删除通知附件
  deleteAttachment: (notificationId: string, attachmentId: string): Promise<ApiResponse<void>> =>
    request(`/notifications/${notificationId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    }),
}

// 用户管理 API
export const userApi = {
  // 获取用户列表
  getUsers: (params?: QueryParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return request(`/users${queryString}`)
  },

  // 获取用户详情
  getUserById: (id: string): Promise<ApiResponse<User>> =>
    request(`/users/${id}`),

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse<User>> =>
    request('/users/me'),

  // 更新用户信息
  updateUser: (id: string, data: Partial<User>): Promise<ApiResponse<User>> =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// 统计数据 API
export const statsApi = {
  // 获取首页统计数据
  getHomeStats: (): Promise<ApiResponse<HomeStats>> =>
    request('/stats/home'),

  // 获取分类统计数据
  getCategoryStats: (): Promise<ApiResponse<CategoryStats[]>> =>
    request('/stats/categories'),

  // 获取用户活动统计
  getUserActivityStats: (userId?: string): Promise<ApiResponse<any>> => {
    const queryString = userId ? `?userId=${userId}` : ''
    return request(`/stats/activity${queryString}`)
  },
}

// 操作日志 API
export const logApi = {
  // 获取操作日志列表
  getLogs: (params?: QueryParams): Promise<ApiResponse<PaginatedResponse<OperationLog>>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return request(`/logs${queryString}`)
  },

  // 记录操作日志
  createLog: (data: Omit<OperationLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<OperationLog>> =>
    request('/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// 搜索 API
export const searchApi = {
  // 全文搜索
  search: (keyword: string, params?: Partial<QueryParams>): Promise<ApiResponse<{
    documents: Document[]
    notifications: Notification[]
    total: number
  }>> => {
    const queryParams = { keyword, ...params }
    const queryString = `?${new URLSearchParams(queryParams as any).toString()}`
    return request(`/search${queryString}`)
  },

  // 搜索建议
  getSuggestions: (keyword: string): Promise<ApiResponse<string[]>> =>
    request(`/search/suggestions?keyword=${encodeURIComponent(keyword)}`),
}

// 导出所有 API
export default {
  category: categoryApi,
  tree: treeApi,
  document: documentApi,
  notification: notificationApi,
  attachment: attachmentApi,
  user: userApi,
  stats: statsApi,
  log: logApi,
  search: searchApi,
}