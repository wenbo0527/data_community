/**
 * Risk App 类型定义
 * @description 风险应用的完整类型定义
 * 
 * 注意：PaginationParams, PaginatedResponse 等通用类型定义在 shared/types 包中
 * 待 npm link 后可通过 @shared/types 导入
 */

// ==================== 通用类型 ====================

/** 分页查询参数 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

// ==================== 预算模块类型 ====================

/** 预算状态 */
export type BudgetStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'executed';

/** 预算项 */
export interface BudgetItem {
  id: string;
  budgetId: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  amount: number;
  currency: string;
  status: BudgetStatus;
  settlementStatus?: 'unsettled' | 'partial' | 'settled';
  createdAt: string;
  updatedAt: string;
}

/** 预算 */
export interface Budget {
  id: string;
  name: string;
  code: string;
  description?: string;
  totalAmount: number;
  spentAmount: number;
  currency: string;
  status: BudgetStatus;
  startDate: string;
  endDate: string;
  ownerId: string;
  ownerName: string;
  items: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

/** 预算查询参数 */
export interface BudgetQueryParams extends PaginationParams {
  status?: BudgetStatus;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

/** 预算列表响应 */
export type BudgetListResponse = PaginatedResponse<Budget>;

/** 创建预算参数 */
export interface CreateBudgetParams {
  name: string;
  description?: string;
  totalAmount: number;
  currency?: string;
  startDate: string;
  endDate: string;
}

/** 更新预算参数 */
export interface UpdateBudgetParams extends Partial<CreateBudgetParams> {
  status?: BudgetStatus;
}

// ==================== 结算模块类型 ====================

/** 结算状态 */
export type SettlementStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled';

/** 结算记录 */
export interface Settlement {
  id: string;
  budgetId: string;
  supplierId: string;
  amount: number;
  currency: string;
  status: SettlementStatus;
  invoiceNo?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 外部数据模块类型 ====================

/** 供应商状态 */
export type SupplierStatus = 'active' | 'inactive' | 'suspended';

/** 供应商类型 */
export type SupplierType = 'data_provider' | 'service_provider' | 'platform_provider';

/** 供应商 */
export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  supplierType: SupplierType;
  status: SupplierStatus;
  creditRating?: number;
  registrationDate: string;
  contactInfo: {
    company: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
  };
  businessLicense?: string;
  taxId?: string;
  bankInfo?: {
    bankName: string;
    bankAccount: string;
    bankCode: string;
  };
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/** 供应商产品 */
export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  status: 'active' | 'inactive';
  interfaceCount: number;
  hasContract: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 供应商查询参数 */
export interface SupplierQueryParams extends PaginationParams {
  status?: SupplierStatus;
  type?: SupplierType;
  keyword?: string;
}

// ==================== 离线模型模块类型 ====================

/** 模型状态 */
export type ModelStatus = 'training' | 'ready' | 'deployed' | 'archived';

/** 模型 */
export interface Model {
  id: string;
  name: string;
  version: string;
  type: string;
  status: ModelStatus;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  trainingDataSize: number;
  createdAt: string;
  updatedAt: string;
  deployedAt?: string;
}

/** 模型回溯任务 */
export interface ModelBacktestTask {
  id: string;
  modelId: string;
  modelName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  result?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}
