// 批量创建券库存相关的TypeScript类型定义

// 使用场景枚举
export type UsageScenario = 'batch_distribute' | 'telesales'

// 配置模式枚举
export type ConfigMode = 'unified' | 'individual'

// 审批状态枚举
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

// 批量创建状态枚举
export type BatchCreateStatus = 'pending' | 'processing' | 'completed' | 'partial_success' | 'failed'

// 优先级枚举
export type Priority = 'high' | 'medium' | 'low'

// 库存配置接口
export interface InventoryConfig {
  templateId?: string  // 分别编辑模式时必需
  quantity: number
  validFrom: string
  validTo: string
  remark?: string
}

// 批量设置接口
export interface BatchSettings {
  createTime: string
  remark: string
  operator: string
}

// 券模板信息接口
export interface CouponTemplate {
  id: string
  name: string
  type: string
  status: string
  createTime: string
  creator: string
  validityPeriod: [string, string]
  applicableScope: string
  description?: string
}

// 批量创建请求接口
export interface BatchCreateRequest {
  usageScenario: UsageScenario
  configMode: ConfigMode
  templateIds: string[]
  unifiedConfig?: InventoryConfig  // 统一配置模式时使用
  individualConfigs?: InventoryConfig[]  // 分别编辑模式时使用
  batchSettings: BatchSettings
  approvalReason: string
}

// 批量创建结果项接口
export interface BatchCreateResultItem {
  templateId: string
  templateName?: string
  inventoryId: string
  status: 'success' | 'failed'
  quantity?: number
  message: string
}

// 批量创建结果接口
export interface BatchCreateResult {
  batchId: string
  results: BatchCreateResultItem[]
  summary: {
    total: number
    successCount: number
    failedCount: number
  }
  approvalId: string
}

// 批量创建历史记录接口
export interface BatchCreateHistory {
  id: string
  usageScenario: UsageScenario
  configMode: ConfigMode
  templateCount: number
  totalInventory: number
  successCount: number
  failedCount: number
  status: BatchCreateStatus
  approvalStatus: ApprovalStatus
  operator: string
  createTime: string
  completeTime?: string
  remark: string
}

// 批量创建详情接口
export interface BatchCreateDetail {
  id: string
  usageScenario: UsageScenario
  configMode: ConfigMode
  templateIds: string[]
  unifiedConfig?: InventoryConfig
  individualConfigs?: InventoryConfig[]
  batchSettings: BatchSettings
  results: BatchCreateResultItem[]
  approvalInfo: {
    approvalId: string
    status: ApprovalStatus
    approver?: string
    approvalTime?: string
    comment?: string
  }
}

// 审批记录接口
export interface ApprovalRecord {
  id: string
  type: 'batch_create'
  title: string
  applicant: string
  department: string
  templateCount: number
  totalInventory: number
  usageScenario: UsageScenario
  configMode: ConfigMode
  status: ApprovalStatus
  priority: Priority
  createTime: string
  expectedTime?: string
  approvalTime?: string
  approver?: string
  reason: string
  comment?: string
  remark: string
}

// 审批详情接口
export interface ApprovalDetail {
  id: string
  type: 'batch_create'
  title: string
  applicant: string
  department: string
  status: ApprovalStatus
  priority: Priority
  createTime: string
  reason: string
  batchInfo: {
    usageScenario: UsageScenario
    configMode: ConfigMode
    templateIds: string[]
    templateCount: number
    totalInventory: number
    unifiedConfig?: InventoryConfig
    individualConfigs?: InventoryConfig[]
    batchSettings: BatchSettings
  }
  attachments: any[]
  approvalFlow: ApprovalFlowStep[]
}

// 审批流程步骤接口
export interface ApprovalFlowStep {
  step: number
  approver: string
  department: string
  status: 'pending' | 'approved' | 'rejected' | 'waiting'
  comment: string
  time: string
}

// API响应基础接口
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 分页响应接口
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 分页请求参数接口
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// 批量创建历史查询参数接口
export interface BatchHistoryParams extends PaginationParams {
  startDate?: string
  endDate?: string
  status?: BatchCreateStatus
  usageScenario?: UsageScenario
  operator?: string
}

// 审批列表查询参数接口
export interface ApprovalListParams extends PaginationParams {
  status?: ApprovalStatus
  priority?: Priority
  applicant?: string
  startDate?: string
  endDate?: string
}

// 表单验证规则接口
export interface FormValidationRule {
  required?: boolean
  message?: string
  validator?: (rule: any, value: any, callback: any) => void
}

// 表单字段配置接口
export interface FormFieldConfig {
  label: string
  field: string
  type: 'input' | 'select' | 'date' | 'textarea' | 'number'
  rules?: FormValidationRule[]
  options?: { label: string; value: any }[]
  placeholder?: string
  disabled?: boolean
}

// 使用场景选项
export const USAGE_SCENARIO_OPTIONS = [
  { label: '批量下发', value: 'batch_distribute' },
  { label: '电销使用', value: 'telesales' }
] as const

// 配置模式选项
export const CONFIG_MODE_OPTIONS = [
  { label: '统一配置', value: 'unified' },
  { label: '分别编辑', value: 'individual' }
] as const

// 审批状态选项
export const APPROVAL_STATUS_OPTIONS = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已取消', value: 'cancelled' }
] as const

// 批量创建状态选项
export const BATCH_STATUS_OPTIONS = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '部分成功', value: 'partial_success' },
  { label: '失败', value: 'failed' }
] as const

// 优先级选项
export const PRIORITY_OPTIONS = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' }
] as const