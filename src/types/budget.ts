/**
 * 预算管理相关类型定义
 */

// 基础枚举类型
export enum BudgetStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum ProjectStatus {
  DRAFT = 'draft',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVOKED = 'revoked'
}

export enum BusinessType {
  RESEARCH = 'research',
  MARKET = 'market',
  OPERATION = 'operation',
  ADMIN = 'admin'
}

// 基础接口
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

// 预算接口
export interface Budget extends BaseEntity {
  budgetNo: string
  budgetName: string
  budgetYear: number
  businessType: BusinessType
  platformProduct: string
  // 业务与财务扩展字段
  targetLoanBalance?: number
  estimatedLoanAmount?: number
  estimatedExpenses?: number
  annualDataCost?: number
  riskFreeReturn?: number
  granularity?: 'year' | 'quarter' | 'month'
  correspondingTime?: string
  totalAmount: number
  usedAmount: number
  remainingAmount: number
  executionRate: number
  status: BudgetStatus
  description?: string
  startDate?: string
  endDate?: string
  owner?: string
  approver?: string
  approvedAt?: string
}

// 采购项目接口
export interface PurchaseProject extends BaseEntity {
  projectNo: string
  projectName: string
  budgetId?: string
  budgetName?: string
  totalAmount: number
  usedAmount: number
  remainingAmount: number
  purchaseQuantity: number
  purchaseDate: string
  projectManager: string
  status: ProjectStatus
  description?: string
  supplier?: string
  contractNo?: string
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
}

// 核销记录接口
export interface VerificationRecord extends BaseEntity {
  verificationNo: string
  budgetId: string
  budgetName: string
  projectId: string
  projectName: string
  verificationAmount: number
  verificationDate: string
  status: VerificationStatus
  description?: string
  approver?: string
  approvedAt?: string
  approvedBy?: string
  attachments?: string[]
}

// 预算-项目关联关系
export interface BudgetProjectRelation {
  id: string
  budgetId: string
  budgetName: string
  projectId: string
  projectName: string
  allocatedAmount: number
  usedAmount: number
  remainingAmount: number
  relationType: 'allocation' | 'verification'
  createdAt: string
}

// 统计接口
export interface BudgetStatistics {
  totalBudget: number
  usedAmount: number
  remainingAmount: number
  executionRate: number
}

export interface ProjectStatistics {
  totalProjects: number
  executingProjects: number
  completedProjects: number
  totalAmount: number
  executingAmount: number
  completedAmount: number
}

export interface AlertStatistics {
  totalAlerts: number
  unreadAlerts: number
  highLevelAlerts: number
  mediumLevelAlerts: number
  lowLevelAlerts: number
}

// 查询参数接口
export interface BudgetSearchParams {
  keyword?: string
  budgetYear?: number
  granularity?: 'year' | 'quarter' | 'month'
  businessType?: BusinessType
  platformProduct?: string
  status?: BudgetStatus
  minAmount?: number
  maxAmount?: number
  minExecutionRate?: number
  maxExecutionRate?: number
  startDate?: string
  endDate?: string
  creator?: string
  projectStatus?: ProjectStatus
  verificationStatus?: VerificationStatus
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 创建参数接口
export interface BudgetCreateParams {
  budgetName: string
  budgetYear: number
  businessType: BusinessType
  platformProduct: string
  totalAmount: number
  // 扩展业务与财务字段（可选）
  targetLoanBalance?: number
  estimatedLoanAmount?: number
  estimatedExpenses?: number
  annualDataCost?: number
  riskFreeReturn?: number
  granularity?: 'year' | 'quarter' | 'month'
  correspondingTime?: string
  description?: string
  startDate?: string
  endDate?: string
  owner?: string
}

export interface BudgetUpdateParams {
  budgetName?: string
  totalAmount?: number
  // 扩展业务与财务字段（可选）
  targetLoanBalance?: number
  estimatedLoanAmount?: number
  estimatedExpenses?: number
  annualDataCost?: number
  riskFreeReturn?: number
  granularity?: 'year' | 'quarter' | 'month'
  correspondingTime?: string
  description?: string
  startDate?: string
  endDate?: string
  owner?: string
  status?: BudgetStatus
}

export interface VerificationCreateParams {
  budgetId: string
  projectId: string
  verificationAmount: number
  verificationDate: string
  description?: string
  attachments?: string[]
}

// 分页响应接口
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 图表数据接口
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TrendData {
  date: string
  value: number
  category?: string
}

// 预警记录接口
export interface AlertRecord extends BaseEntity {
  alertNo: string
  alertType: 'budget_exceed' | 'execution_rate' | 'deadline_approaching' | 'approval_overdue'
  alertLevel: 'high' | 'medium' | 'low'
  title: string
  content: string
  isRead: boolean
  relatedId: string
  relatedType: 'budget' | 'project' | 'verification'
  actionRequired: boolean
  actionUrl?: string
}

// 成本记录接口
export interface CostRecord extends BaseEntity {
  costNo: string
  budgetId: string
  budgetName: string
  costType: string
  amount: number
  costDate: string
  department: string
  supplier?: string
  description?: string
  attachments?: string[]
  status: 'pending' | 'approved' | 'rejected'
}

// 合同接口
export interface Contract extends BaseEntity {
  contractNo: string
  contractName: string
  projectId: string
  projectName: string
  supplier: string
  contractAmount: number
  signedDate: string
  startDate: string
  endDate: string
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'terminated'
  paymentTerms?: string
  attachments?: string[]
}

// 结算单接口
export interface Settlement extends BaseEntity {
  settlementNo: string
  contractId: string
  contractNo: string
  settlementAmount: number
  settlementDate: string
  status: 'pending' | 'approved' | 'paid'
  description?: string
  attachments?: string[]
}

// 合同统计
export interface ContractStatistics {
  totalContracts: number
  totalAmount: number
  executingContracts: number
  completedContracts: number
  terminatedContracts: number
}

// 结算统计
export interface SettlementStatistics {
  totalSettlements: number
  totalAmount: number
  pendingSettlements: number
  approvedSettlements: number
  paidSettlements: number
}