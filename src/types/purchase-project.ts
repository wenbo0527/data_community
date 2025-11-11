/**
 * 采购项目相关类型定义
 */

export enum ProjectStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProjectType {
  DATA_PURCHASE = 'data_purchase',
  SERVICE_PURCHASE = 'service_purchase',
  TECHNOLOGY_PURCHASE = 'technology_purchase',
  OTHER = 'other'
}

/**
 * 采购项目基础接口
 */
export interface PurchaseProject {
  id: string
  projectNo: string
  projectName: string
  projectCode: string
  projectType: ProjectType
  totalAmount: number
  actualConsumedAmount: number
  remainingAmount: number
  associatedAmount: number
  purchaseVolume: number
  purchaseDate: string
  owner: string
  status: ProjectStatus
  budgetId?: string
  budgetInfo?: {
    budgetName: string
    totalAmount: number
  }
  remark?: string
  createdAt: string
  updatedAt: string
}

/**
 * 采购项目查询参数
 */
export interface PurchaseProjectSearchParams {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  projectName?: string
  projectNo?: string
  projectType?: ProjectType
  status?: ProjectStatus
  owner?: string
  startDate?: string
  endDate?: string
}

/**
 * 采购项目创建参数
 */
export interface PurchaseProjectCreateParams {
  projectName: string
  projectCode: string
  projectType: ProjectType
  totalAmount: number
  purchaseVolume: number
  purchaseDate: string
  owner: string
  remark?: string
}

/**
 * 采购项目更新参数
 */
export interface PurchaseProjectUpdateParams {
  projectName?: string
  projectCode?: string
  projectType?: ProjectType
  totalAmount?: number
  purchaseVolume?: number
  purchaseDate?: string
  owner?: string
  status?: ProjectStatus
  remark?: string
}

/**
 * 分页响应接口
 */
export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 预算关联参数
 */
export interface BudgetAssociationParams {
  projectId: string
  budgetId: string
  amount?: number
  remark?: string
}

/**
 * 状态更新参数
 */
export interface StatusUpdateParams {
  projectId: string
  newStatus: ProjectStatus
  remark?: string
}