/**
 * API 类型定义
 */

/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T = any> {
  code: number      // 0=成功, 其他=失败
  message?: string  // 错误消息
  data: T           // 响应数据
  [key: string]: any
}

/**
 * API 错误格式
 */
export interface ApiError {
  code?: number      // HTTP 状态码
  message: string   // 错误消息
  details?: any     // 详细错误信息
}

/**
 * 分页请求参数
 */
export interface PageParams {
  page?: number
  pageSize?: number
  current?: number
  size?: number
}

/**
 * 分页响应数据
 */
export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 分页 API 响应
 */
export interface PageResponse<T = any> extends ApiResponse {
  data: PageResult<T>
}

/**
 * 通用列表响应
 */
export interface ListResponse<T = any> extends ApiResponse {
  data: T[]
}