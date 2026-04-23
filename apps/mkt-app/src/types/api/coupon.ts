/**
 * Coupon 模块类型定义
 * Phase 2.3: types/api 类型体系
 */
import type { PaginatedResponse, ApiResponse } from './common'

// ==================== 券模板 ====================

/** 券模板 */
export interface CouponTemplate {
  id: string
  templateId: string
  name: string
  type: 'discount' | 'reduction' | 'cash' | 'gift'
  description?: string
  denomination?: number // 面值
  threshold?: number // 使用门槛
  validDays: number // 有效天数
  startTime?: string
  endTime?: string
  status: 'draft' | 'active' | 'paused' | 'expired'
  createTime: string
  updateTime: string
}

export interface CouponTemplateParams {
  page?: number
  pageSize?: number
  name?: string
  type?: string
  status?: string
}

// ==================== 券实例 ====================

/** 券实例/库存 */
export interface CouponInventory {
  id: string
  instanceId: string
  couponId: string
  templateId: string
  couponName: string
  couponType: 'discount' | 'reduction' | 'cash' | 'gift'
  userId?: string
  status: 'received' | 'locked' | 'used' | 'expired' | 'invalid'
  validPeriod: string
  startTime: string
  endTime: string
  createTime: string
  updateTime: string
  // 审批相关
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedTime?: string
}

export interface CouponInventoryParams {
  page?: number
  pageSize?: number
  couponId?: string
  templateId?: string
  userId?: string
  packageId?: string
  status?: string
  approvalStatus?: string
  createTime?: [string, string]
}

export interface CouponStatistics {
  totalInventory: number
  pendingApproval: number
  approvedCount: number
  rejectedCount: number
}

// ==================== 券包 ====================

/** 券包 */
export interface CouponPackage {
  id: string
  packageId: string
  name: string
  description?: string
  templateIds: string[]
  totalCount: number
  remainingCount: number
  status: 'active' | 'paused' | 'expired'
  createTime: string
  updateTime: string
}

export interface CouponPackageParams {
  page?: number
  pageSize?: number
  name?: string
  status?: string
}

// ==================== API 方法签名 ====================

/** Coupon API */
export interface CouponAPI {
  getList(params: CouponTemplateParams): Promise<ApiResponse<PaginatedResponse<CouponTemplate>>>
  getById(id: string): Promise<ApiResponse<CouponTemplate | null>>
  create(data: Partial<CouponTemplate>): Promise<ApiResponse<CouponTemplate | null>>
  update(id: string, data: Partial<CouponTemplate>): Promise<ApiResponse<CouponTemplate | null>>
  delete(id: string): Promise<ApiResponse<boolean>>
}

/** Inventory API */
export interface InventoryAPI {
  getInventoryList(params: CouponInventoryParams): Promise<ApiResponse<PaginatedResponse<CouponInventory>>>
  getInventoryDetail(instanceId: string): Promise<ApiResponse<CouponInventory | null>>
  batchCreateInventory(data: {
    templateId: string
    count: number
    userIds?: string[]
  }): Promise<ApiResponse<{ success: number; failed: number }>>
  batchApproveInventory(ids: string[]): Promise<ApiResponse<{ success: number; failed: number }>>
  batchWithdraw(ids: string[]): Promise<ApiResponse<{ success: number; failed: number }>>
  getBatchCreateDetail(batchId: string): Promise<ApiResponse<CouponInventory[]>>
  getBatchCreateHistory(params: { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<{
    batchId: string
    templateId: string
    count: number
    createTime: string
  }>>>
}

/** Template API */
export interface TemplateAPI {
  getList(params: CouponTemplateParams): Promise<ApiResponse<PaginatedResponse<CouponTemplate>>>
  getById(id: string): Promise<ApiResponse<CouponTemplate | null>>
  create(data: Partial<CouponTemplate>): Promise<ApiResponse<CouponTemplate | null>>
  update(id: string, data: Partial<CouponTemplate>): Promise<ApiResponse<CouponTemplate | null>>
  delete(id: string): Promise<ApiResponse<boolean>>
}
