/**
 * Coupon 模块类型定义
 * Phase 2.3: types/api 类型体系
 */
import type { PaginatedResponse, ApiResponse } from './common'

// ==================== 产品定义 ====================

/** 产品定义 */
export interface Product {
  product_id: string
  product_name: string
  product_type: 'SUD' | 'JD' | 'MT'
  status: 'active' | 'inactive'
}

/** 临价折扣券产品列表 */
export const PRICED_PRODUCTS: Product[] = [
  { product_id: 'JD_001', product_name: '京东大额低息', product_type: 'JD', status: 'active' },
  { product_id: 'MT_001', product_name: '美团大额低息', product_type: 'MT', status: 'active' },
]

// ==================== 券模板 ====================

/**
 * 券模板类型
 * @description 新增 PRICED_DISCOUNT（临价折扣券）用于京东/美团产品
 */
export type CouponTemplateType = 'interest_free' | 'discount' | 'PRICED_DISCOUNT'

/** 券模板 */
export interface CouponTemplate {
  id: string
  templateId: string
  name: string
  type: CouponTemplateType
  description?: string
  denomination?: number // 面值
  threshold?: number // 使用门槛
  /** 产品ID（SUD001/JD_001/MT_001），临价折扣券必填 */
  product_id?: string
  product_name?: string
  /**
   * 有效期类型
   * v1.2.8 5/26 教训链 #4: mock 实例中不用此字段(用 validDays/valid_from/valid_to)
   * 改为 optional
   */
  validityPeriodType?: 'fixed' | 'relative' | 'unlimited'
  /** 固定有效期起止 */
  valid_from?: string
  valid_to?: string
  /** 相对有效期天数 */
  relative_days?: number
  /**
   * 相对有效期天数(中文化)
   * v1.2.8 5/26 教训链 #4: mock 实例中 PRD §12.1 示例用此字段,types 必须先声明
   * 命名:相对期使用 'validDays'、'validPeriodDays' 都是项目历史命名
   * 改为 optional 因为 PRICED_DISCOUNT 用 valid_from/valid_to
   */
  validDays?: number
  /** 有效期范围 [开始, 结束] */
  validityPeriod?: [string, string]
  /**
   * 产品列表(SUD001 存量用 + PRICED_DISCOUNT 单产品并存)
   * v1.2.8 5/26 教训链 #4: mock 实例中字段存在但 types 未声明,导致 TS 编译报错
   * 改为 optional,允许 mock 实例不填
   */
  products?: string[]
  status: 'draft' | 'online' | 'offline'
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

/**
 * 券实例/库存
 * 状态机对齐 PRD v1.2.8 §11.3 + §11.3.1（9 态 + failure_code 失败码体系）
 * - 内部态: pending（对用户不可见，Kafka 消费后→核心回执前）
 * - 终态成功: received / invalidated / expired
 * - 终态失败: failed_1001_core_rejected / failed_1002_timeout /
 *              failed_1003_invalidation / failed_1004_kafka_push / failed_1005_kafka_consume
 * 5/26 教训链 #1: 状态码缺失会导致前端列定义完整但表格空白，types 必须先声明
 */
export interface CouponInventory {
  id: string
  instanceId: string
  couponId: string
  templateId: string
  couponName: string
  couponType: CouponTemplateType
  /** 产品ID（临价折扣券） */
  product_id?: string
  product_name?: string
  userId?: string
  /**
   * 券实例状态（9 态，PRD v1.2.8 §11.3）
   * - pending: 内部态，Kafka 消费后→核心回执前
   * - received: 未使用（激活态）
   * - failed_1001_core_rejected: 核心拒收失败（库存无变化）
   * - failed_1002_timeout: 5 分钟未收到核心回执（库存无变化 + 企微报警）
   * - failed_1003_invalidation: 存量作废失败（同事务回滚）
   * - failed_1004_kafka_push: 权益→核心 Kafka producer 重试耗尽
   * - failed_1005_kafka_consume: 核心→权益 Kafka consumer 重试耗尽
   * - invalidated: 被动作废（同用户同产品被新券覆盖，记 invalidated_time）
   * - expired: 已过期（自然失效）
   */
  status:
    | 'pending'
    | 'received'
    | 'failed_1001_core_rejected'
    | 'failed_1002_timeout'
    | 'failed_1003_invalidation'
    | 'failed_1004_kafka_push'
    | 'failed_1005_kafka_consume'
    | 'invalidated'
    | 'expired'
  /** 作废时间（临价折扣券，PRD §11.3 invalidated 列） */
  invalidated_time?: string
  /**
   * 失败码（PRD v1.2.6 §11.3.1）
   * - 1001: 核心拒收
   * - 1002: pending 超时（5 分钟，可配置）
   * - 1003: 存量作废失败
   * - 1004: Kafka 推送失败
   * - 1005: Kafka 回执消费失败
   * 仅 failed_* 状态时使用，其他状态省略
   */
  failure_code?: number
  /**
   * 失败原因文案（PRD v1.2.6 §11.3.1）
   * 与 failure_code 配对，文案待核心方拍板（Q47 走）
   */
  failure_reason?: string
  /**
   * pending 超时时间（PRD v1.2.6 §11.3.2）
   * 仅 failed_1002_timeout 状态时记录
   * 触发: 5 分钟（可配置）未收到核心回执 → 状态转 failed_1002 + 记 timeout_time
   */
  timeout_time?: string
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

/**
 * 券包挂载的库存批次（PRD §12.2 字段 / Demo-001 G6 落地）
 * 字段含义: batch_id 批次号 / template_id 模板ID / total 批次总量 / remaining 剩余可发
 * 5/26 教训 #4: types 必须声明字段, mock 引用才有类型校验 (本次补的, 之前在 mock 侧)
 */
export interface InventoryBatch {
  batch_id: string
  template_id: string
  total: number
  remaining: number
}

/** 券包 */
export interface CouponPackage {
  id: string
  packageId: string
  name: string
  description?: string
  product_id?: string
  product_name?: string
  templateIds: string[]
  totalCount: number
  remainingCount: number
  /**
   * 券包状态（PRD §11.2）— demo 范围收紧到 3 态
   * TODO 生产级: 独立 CouponGrantTask 类型,恢复 §11.4 5 状态 (pending|executing|success|partial|failed)
   *       PRD 评审 review-prd-v1.2.2.md G5 缺口,派 dev + doc 在 v1.3 阶段补
   */
  status: 'draft' | 'active' | 'inactive'
  createTime: string
  updateTime: string
  /** 挂载的库存批次（PRD §12.2, Demo-001 G6） */
  inventory_batches?: InventoryBatch[]
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

// ==================== 库存预警规则（v1.2 完整版，TASK-20260603-B2A5D2BB）====================

/** 通知渠道 */
export type AlertNotifyChannel = 'inbox' | 'email'

/** 预警等级 */
export type AlertLevel = 'info' | 'warning' | 'critical'

/** 库存预警规则（按产品维度）
 * 字段与 PRD-库存预警配置页增量v1.2 §5 字段定义 1:1 对齐（共 13 字段）
 * 与 mock/inventory-alert.json 完全一致
 */
export interface AlertRule {
  id: string
  /** 产品 ID（JD_001 / MT_001，SUD001 存量保护不允许新建） */
  product_id: 'JD_001' | 'MT_001'
  /** 产品名（冗余存储，避免前端查产品表） */
  product_name: string
  /** 预警阈值，单位：张，范围 [1, 1,000,000] */
  threshold_value: number
  /** 预警等级，默认 warning */
  alert_level: AlertLevel
  /** 通知渠道（至少 1 个） */
  notify_channel: AlertNotifyChannel[]
  /** 通知接收人 user_id 列表（至少 1 个） */
  notify_users: string[]
  /** 是否启用，默认 true */
  enabled: boolean
  /** 同产品通知冷却时间（分钟），默认 60 */
  cooldown_minutes: number
  /** 创建时间，ISO 8601（+08:00） */
  created_at: string
  /** 最后修改时间，ISO 8601（+08:00） */
  updated_at: string
  /** 创建人 user_id */
  created_by: string
  /** 最后修改人 user_id */
  updated_by: string
  /** 停用原因（仅 enabled=false 时使用） */
  disabled_reason?: string
  /** 停用时间（仅 enabled=false 时使用） */
  disabled_at?: string
}

/** 库存当前快照（与产品当前库存对比） */
export interface ProductStatusSnapshot {
  product_id: 'JD_001' | 'MT_001' | 'SUD001'
  product_name: string
  product_status: 'active' | 'inactive'
  current_stock: number
}

/** 审计日志 */
export interface AlertRuleAudit {
  id: string
  rule_id: string
  action: 'create' | 'update' | 'delete' | 'enable' | 'disable'
  before_value: AlertRule | null
  after_value: AlertRule | null
  operator_id: string
  operator_name: string
  operated_at: string
}

/** 异常测试用例（用于 dev 自检 + qa 验证） */
export interface AlertRuleTestCase {
  case_id: string
  scenario: string
  field: string
  invalid_value: unknown
  expected_behavior: string
}

/** 列表查询参数 */
export interface AlertRuleParams {
  page?: number
  pageSize?: number
  product_id?: string
  enabled?: boolean
}

/** Alert Rules API 契约（与 PRD §8 / S406 §八 对齐） */
export interface AlertRulesAPI {
  /** GET /api/coupon/alert-rules - 列表 */
  getAlertRules(params?: AlertRuleParams): Promise<ApiResponse<PaginatedResponse<AlertRule>>>
  /** GET /api/coupon/alert-rules/:id - 详情 */
  getAlertRuleById(id: string): Promise<ApiResponse<AlertRule | null>>
  /** POST /api/coupon/alert-rules - 新建 */
  createAlertRule(data: Partial<AlertRule>): Promise<ApiResponse<AlertRule | null>>
  /** PUT /api/coupon/alert-rules/:id - 编辑 */
  updateAlertRule(id: string, data: Partial<AlertRule>): Promise<ApiResponse<AlertRule | null>>
  /** DELETE /api/coupon/alert-rules/:id - 软删除（enabled=false） */
  deleteAlertRule(id: string): Promise<ApiResponse<boolean>>
  /** PATCH /api/coupon/alert-rules/:id/toggle - 启用/停用 */
  toggleAlertRule(id: string, enabled: boolean): Promise<ApiResponse<AlertRule | null>>
  /** GET /api/coupon/alert-rules/:id/audit - 审计日志 */
  getAlertRuleAudit(id: string): Promise<ApiResponse<AlertRuleAudit[]>>
  /** GET /api/coupon/product-status-snapshot - 产品状态快照（用于库存对比 + R-02 联动） */
  getProductStatusSnapshot(): Promise<ApiResponse<ProductStatusSnapshot[]>>
}

// ==================== 库存预警类型别名导出（TD-S402-1 修复）====================
//
// 背景：types/api/alert.ts:10 已定义同名 AlertRule / AlertRuleParams / AlertRulesAPI
// （旧预警引擎，结构不同：ruleId/name/threshold/condition/severity）。
// 库存预警 v1.2 引入同名类型会导致 import 静默覆盖。
//
// 使用方式：所有库存预警相关代码统一 import 带 Inventory 前缀的别名：
//   import { InventoryAlertRule, InventoryAlertRulesAPI } from '@/types/api/coupon'
//
// v1.3 评估抽到独立 coupon-alert.ts（arch TD-S402-1 中期方案）

export type {
  AlertRule as InventoryAlertRule,
  AlertRuleAudit as InventoryAlertRuleAudit,
  AlertRuleParams as InventoryAlertRuleParams,
  AlertRulesAPI as InventoryAlertRulesAPI,
  AlertLevel as InventoryAlertLevel,
  AlertNotifyChannel as InventoryAlertNotifyChannel,
  ProductStatusSnapshot as InventoryProductStatusSnapshot,
  AlertRuleTestCase as InventoryAlertRuleTestCase,
}

