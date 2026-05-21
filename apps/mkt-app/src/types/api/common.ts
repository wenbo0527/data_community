/**
 * 共享类型定义
 * Phase 2.3: types/api 类型体系
 * 
 * 被所有 API 模块共享的基础类型
 */

/** 分页响应 */
export interface PaginatedResponse<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/** 统一 API 响应 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 通用 ID 类型 */
export type EntityId = string

/** 通用时间戳 */
export interface Timestamp {
  createdAt: string
  updatedAt: string
}

/** 状态枚举 */
export type Status = 'active' | 'inactive' | 'deleted'

/** 分页参数 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}
