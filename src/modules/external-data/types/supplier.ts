/**
 * 外数档案模块 - 供应商管理统一数据结构
 * 作为供应商信息的唯一真实来源（Single Source of Truth）
 */

// 供应商基础信息
export interface Supplier {
  id: string
  supplierCode: string // 供应商编码
  supplierName: string // 供应商名称
  supplierType: 'data_provider' | 'service_provider' | 'platform_provider' // 供应商类型
  status: 'active' | 'inactive' | 'suspended' // 状态
  creditRating?: number // 信用评级 1-5
  registrationDate: string // 注册时间
  contactInfo: {
    company: string
    contactPerson: string
    email: string
    phone: string
    address: string
  }
  businessLicense?: string // 营业执照号
  taxId?: string // 税号
  bankInfo?: {
    bankName: string
    bankAccount: string
    bankCode: string
  }
  tags: string[] // 标签
  description?: string // 描述
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// 供应商定价档案
export interface SupplierPricing {
  id: string
  supplierId: string // 供应商ID
  productCode: string // 产品编码
  productName: string // 产品名称
  billingType: 'fixed' | 'tiered' | 'volume' | 'subscription' // 计费类型
  billingMode: 'per_call' | 'per_record' | 'per_gb' | 'monthly' | 'yearly' // 计费模式
  currency: 'CNY' | 'USD' | 'EUR' // 币种
  unitPrice: number // 基础单价
  minPrice?: number // 最低价格
  maxPrice?: number // 最高价格
  effectiveDate: string // 生效日期
  expireDate: string // 失效日期
  status: 'active' | 'inactive' | 'draft' // 状态
  tiers?: PricingTier[] // 阶梯定价
  volumeDiscounts?: VolumeDiscount[] // 量量折扣
  taxRate?: number // 税率
  settlementCycle: 'monthly' | 'quarterly' | 'yearly' // 结算周期
  paymentTerms: number // 付款账期（天）
  remark?: string // 备注
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// 阶梯定价
export interface PricingTier {
  lower: number // 下限
  upper: number // 上限
  price: number // 单价
  unit: string // 单位
}

// 量量折扣
export interface VolumeDiscount {
  minVolume: number // 最小数量
  maxVolume?: number // 最大数量
  discountRate: number // 折扣率
  discountType: 'percentage' | 'fixed' // 折扣类型
}

// 供应商产品关联
export interface SupplierProduct {
  id: string
  supplierId: string
  productId: string
  productCode: string
  productName: string
  category: string
  status: 'active' | 'inactive'
  interfaceCount: number
  hasContract: boolean
  createdAt: string
  updatedAt: string
}

// 供应商查询参数
export interface SupplierQuery {
  keyword?: string // 关键词搜索
  supplierType?: string // 供应商类型
  status?: string // 状态
  tags?: string[] // 标签
  page: number
  pageSize: number
}

// 供应商列表响应
export interface SupplierListResponse {
  list: Supplier[]
  total: number
  page: number
  pageSize: number
}

// 供应商定价查询参数
export interface PricingQuery {
  supplierId?: string
  productCode?: string
  status?: string
  effectiveDate?: string
  page: number
  pageSize: number
}

// 供应商定价列表响应
export interface PricingListResponse {
  list: SupplierPricing[]
  total: number
  page: number
  pageSize: number
}

// 供应商状态变更记录
export interface SupplierStatusLog {
  id: string
  supplierId: string
  fromStatus: string
  toStatus: string
  reason?: string
  createdAt: string
  createdBy: string
}

// 供应商评估信息
export interface SupplierEvaluation {
  id: string
  supplierId: string
  evaluationType: 'quality' | 'service' | 'price' | 'comprehensive'
  score: number // 评分 1-100
  evaluationDate: string
  evaluator: string
  content?: string // 评估内容
  attachments?: string[] // 附件
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}