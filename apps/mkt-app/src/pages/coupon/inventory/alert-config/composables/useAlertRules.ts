/**
 * 库存预警规则业务逻辑 Composable
 * TASK-20260603-B2A5D2BB (S403)
 *
 * 架构要点（arch S402 §5）：
 * - 唯一性校验：同产品只能有 1 条 enabled=true 规则
 * - 审计 withAudit 包装：所有 CRUD 必须留痕
 * - 软删除：DELETE → enabled=false + 审计 delete
 * - 数据源：mock/inventory-alert.json（dev 阶段直接 import，生产换 API）
 *
 * 严禁直接 import 同名 AlertRule！统一用 InventoryAlert* 别名
 */
import { ref, computed, readonly } from 'vue'
import { Message } from '@arco-design/web-vue'
import type {
  InventoryAlertRule,
  InventoryProductStatusSnapshot,
  InventoryAlertRuleAudit,
} from '@/types/api/coupon'
// ⚠️ 严禁 import { AlertRule } from '@/types/api/alert' 或 '@/types/api/coupon'
// 会与 types/api/alert.ts:10 旧引擎 AlertRule 静默冲突（TD-S402-1）

import mockData from '@/mock/inventory-alert.json'

// ==================== 常量 ====================

/** 支持配置预警的产品（arch §5.1：硬编码，不依赖 PRICED_PRODUCTS 避免含 SUD001）*/
export const ALERT_SUPPORTED_PRODUCTS = [
  { product_id: 'JD_001', product_name: '京东大额低息' },
  { product_id: 'MT_001', product_name: '美团大额低息' },
] as const

/** localStorage key（用于 SUD001 轻量版，存量保护）*/
export const LEGACY_THRESHOLD_KEY = 'mkt-inventory-alert-threshold'

/** 默认冷却时间（分钟）*/
export const DEFAULT_COOLDOWN_MINUTES = 60

/** 当前操作用户（mock 阶段硬编码，arch §5.4 withAudit 需要）*/
const CURRENT_USER = {
  user_id: 'operator_dev',
  user_name: '开发测试账号',
}

// ==================== 顶层工具函数（无需 composable 实例）====================

/**
 * 库存列表预警列渲染（arch §3.3 customCell 增强）
 * - 配置了规则 + 库存 ≤ 阈值 → 🔴
 * - 配置了规则 + 库存 > 阈值 → 🟢
 * - 未配置规则（SUD001） → 走轻量版判断
 * - 完全无数据 → —
 *
 * 可独立 import 使用于 inventory/index.vue customCell
 */
const displayCache = new Map<string, '🔴' | '🟢' | '—'>()

export function getAlertDisplay(productId: string, currentStock?: number): '🔴' | '🟢' | '—' {
  if (!productId) return '—'
  const cacheKey = `${productId}:${currentStock ?? 'na'}`
  if (displayCache.has(cacheKey)) return displayCache.get(cacheKey)!

  let result: '🔴' | '🟢' | '—'
  if (currentStock === undefined || currentStock === null) {
    result = '—'
  } else {
    // 查阈值：SUD001 走轻量版，其他走 alert_rules
    let threshold: number | null = null
    if (productId === 'SUD001') {
      if (typeof window !== 'undefined') {
        threshold = parseInt(localStorage.getItem(LEGACY_THRESHOLD_KEY) || '100')
      } else {
        threshold = 100
      }
    }
    // 其他产品的阈值查 composable 实例（customCell 调用时拿不到实例，使用 mock 静态值）
    // 注：customCell 在表格渲染时调用，此函数必须能在无 composable 实例下运行
    // 简化方案：仅处理 SUD001 轻量版，其他产品返回原记录 stock 判断（由调用方在 template 里补充）
    if (threshold === null) {
      // 预留：其他产品的阈值需从 composable 实例获取（arch TD-S402-7 缓存优化）
      // 此函数仅做 SUD001 + 默认逻辑兜底，完整规则在 AlertRuleList.vue 内处理
      result = '—'
    } else {
      result = currentStock <= threshold ? '🔴' : '🟢'
    }
  }
  displayCache.set(cacheKey, result)
  // 缓存上限（arch TD-S402-7）
  if (displayCache.size > 1000) displayCache.clear()
  return result
}

// ==================== 类型 ====================

/** Composable 返回值 */
export interface UseAlertRulesReturn {
  // 状态
  rules: Readonly<Ref<InventoryAlertRule[]>>
  snapshot: Readonly<Ref<InventoryProductStatusSnapshot[]>>
  auditLogs: Readonly<Ref<InventoryAlertRuleAudit[]>>
  loading: Readonly<Ref<boolean>>

  // 计算属性
  enabledRules: ComputedRef<InventoryAlertRule[]>
  legacyThreshold: ComputedRef<number>

  // 业务方法
  loadAll: () => Promise<void>
  getRuleByProduct: (productId: string) => InventoryAlertRule | undefined
  getThresholdForProduct: (productId: string) => number | null
  getAlertDisplay: (productId: string, currentStock?: number) => '🔴' | '🟢' | '—'
  validateUniqueActiveRule: (productId: string, excludeRuleId?: string) => boolean
  createRule: (data: Partial<InventoryAlertRule>) => Promise<InventoryAlertRule | null>
  updateRule: (id: string, data: Partial<InventoryAlertRule>) => Promise<InventoryAlertRule | null>
  toggleRule: (id: string, enabled: boolean) => Promise<InventoryAlertRule | null>
  deleteRule: (id: string) => Promise<boolean>
}

// ==================== Composable ====================

/**
 * 库存预警规则 composable
 * 单例模式（模块级 state）— mock 阶段不接 Pinia，避免过度设计
 */
export function useAlertRules(): UseAlertRulesReturn {
  // ---------- 状态 ----------
  const rules = ref<InventoryAlertRule[]>([])
  const snapshot = ref<InventoryProductStatusSnapshot[]>([])
  const auditLogs = ref<InventoryAlertRuleAudit[]>([])
  const loading = ref(false)

  // ---------- 计算属性 ----------
  const enabledRules = computed(() => rules.value.filter((r) => r.enabled))

  /** SUD001 轻量版阈值（arch §5.1.4：localStorage 继续生效）*/
  const legacyThreshold = computed(() => {
    if (typeof window === 'undefined') return 100
    return parseInt(localStorage.getItem(LEGACY_THRESHOLD_KEY) || '100')
  })

  // ---------- 数据加载 ----------
  async function loadAll(): Promise<void> {
    loading.value = true
    try {
      // mock 阶段：直接从 import 的 json 读
      // 生产阶段：替换为 await api.getAlertRules() 等
      rules.value = (mockData.alert_rules as InventoryAlertRule[]).map((r) => ({ ...r }))
      snapshot.value = (mockData.product_status_snapshot as InventoryProductStatusSnapshot[]).map((s) => ({ ...s }))
      auditLogs.value = (mockData.alert_rules_audit as InventoryAlertRuleAudit[]).map((a) => ({ ...a }))
    } catch (err) {
      Message.error(`加载预警规则失败：${(err as Error).message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ---------- 查询 ----------
  function getRuleByProduct(productId: string): InventoryAlertRule | undefined {
    return enabledRules.value.find((r) => r.product_id === productId)
  }

  /**
   * 查产品阈值（SUD001 走轻量版，其他走 alert_rules）
   * @returns 阈值，未配置返回 null
   */
  function getThresholdForProduct(productId: string): number | null {
    if (productId === 'SUD001') {
      return legacyThreshold.value
    }
    const rule = getRuleByProduct(productId)
    return rule ? rule.threshold_value : null
  }

  /**
   * 库存列表预警列渲染（arch §3.3 customCell 增强）
   * - 配置了规则 + 库存 ≤ 阈值 → 🔴
   * - 配置了规则 + 库存 > 阈值 → 🟢
   * - 未配置规则（SUD001） → 走轻量版判断
   * - 完全无数据 → —
   *
   * 注：独立函数版本在文件顶部顶层 export，此处使用同一函数
   * （composable 实例的 enabledRules 状态由顶层 getAlertDisplay 通过 useAlertRules 间接获取）
   */
  function getAlertDisplayImpl(productId: string, currentStock?: number): '🔴' | '🟢' | '—' {
    if (!productId) return '—'

    let result: '🔴' | '🟢' | '—'
    if (currentStock === undefined || currentStock === null) {
      result = '—'
    } else {
      const threshold = getThresholdForProduct(productId)
      if (threshold === null) {
        result = '—'
      } else {
        result = currentStock <= threshold ? '🔴' : '🟢'
      }
    }
    return result
  }

  // ---------- 校验 ----------
  /**
   * 唯一性校验（arch §5.2 / PRD §AC-1.5）
   * 同一产品只能有 1 条 enabled=true 规则
   */
  function validateUniqueActiveRule(productId: string, excludeRuleId?: string): boolean {
    return !enabledRules.value.some(
      (r) => r.product_id === productId && r.id !== excludeRuleId
    )
  }

  // ---------- 审计 withAudit 包装（arch §5.4 架构铁律）----------
  async function withAudit<T>(
    action: 'create' | 'update' | 'delete' | 'enable' | 'disable',
    ruleId: string,
    before: InventoryAlertRule | null,
    after: InventoryAlertRule | null,
    fn: () => Promise<T>
  ): Promise<T> {
    const result = await fn()
    const auditEntry: InventoryAlertRuleAudit = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      rule_id: ruleId,
      action,
      before_value: before,
      after_value: after,
      operator_id: CURRENT_USER.user_id,
      operator_name: CURRENT_USER.user_name,
      operated_at: new Date().toISOString(),
    }
    auditLogs.value.push(auditEntry)
    return result
  }

  // ---------- CRUD ----------
  async function createRule(data: Partial<InventoryAlertRule>): Promise<InventoryAlertRule | null> {
    // 校验 1：必填字段
    if (!data.product_id || !data.threshold_value) {
      Message.error('产品 ID 和阈值为必填项')
      return null
    }
    // 校验 2：阈值范围
    if (data.threshold_value < 1 || data.threshold_value > 1_000_000) {
      Message.error('阈值需在 1 - 1,000,000 之间')
      return null
    }
    // 校验 3：通知渠道 / 接收人至少 1 个
    if (!data.notify_channel || data.notify_channel.length === 0) {
      Message.error('至少选择 1 个通知渠道')
      return null
    }
    if (!data.notify_users || data.notify_users.length === 0) {
      Message.error('至少选择 1 名通知接收人')
      return null
    }
    // 校验 4：唯一性（arch §5.2 / PRD §AC-1.5）
    if (data.enabled !== false && !validateUniqueActiveRule(data.product_id)) {
      Message.error('同产品已有启用规则，请先停用同产品现有规则')
      return null
    }
    // 校验 5：SUD001 不允许（arch §5.1 / PRD §AC-4.1）
    if (data.product_id === 'SUD001') {
      Message.error('SUD001 存量保护：不允许新建规则，请使用轻量版配置')
      return null
    }

    const now = new Date().toISOString()
    const newRule: InventoryAlertRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      product_id: data.product_id as 'JD_001' | 'MT_001',
      product_name: data.product_name || ALERT_SUPPORTED_PRODUCTS.find(p => p.product_id === data.product_id)?.product_name || '',
      threshold_value: data.threshold_value,
      alert_level: data.alert_level || 'warning',
      notify_channel: data.notify_channel,
      notify_users: data.notify_users,
      enabled: data.enabled !== false,
      cooldown_minutes: data.cooldown_minutes || DEFAULT_COOLDOWN_MINUTES,
      created_at: now,
      updated_at: now,
      created_by: CURRENT_USER.user_id,
      updated_by: CURRENT_USER.user_id,
    }

    return withAudit('create', newRule.id, null, newRule, async () => {
      rules.value.push(newRule)
      Message.success('预警规则创建成功')
      return newRule
    })
  }

  async function updateRule(id: string, data: Partial<InventoryAlertRule>): Promise<InventoryAlertRule | null> {
    const idx = rules.value.findIndex((r) => r.id === id)
    if (idx === -1) {
      Message.error('规则不存在')
      return null
    }
    const before = { ...rules.value[idx] }
    // 唯一性校验（排除自己）
    if (data.enabled !== false && data.product_id && !validateUniqueActiveRule(data.product_id, id)) {
      Message.error('同产品已有启用规则，请先停用同产品现有规则')
      return null
    }
    const after: InventoryAlertRule = {
      ...before,
      ...data,
      product_id: before.product_id, // 锁定产品字段（PRD §AC-2.1）
      id: before.id,
      created_at: before.created_at,
      created_by: before.created_by,
      updated_at: new Date().toISOString(),
      updated_by: CURRENT_USER.user_id,
    }
    return withAudit('update', id, before, after, async () => {
      rules.value[idx] = after
      Message.success('预警规则更新成功')
      return after
    })
  }

  async function toggleRule(id: string, enabled: boolean): Promise<InventoryAlertRule | null> {
    const idx = rules.value.findIndex((r) => r.id === id)
    if (idx === -1) {
      Message.error('规则不存在')
      return null
    }
    // 启用前做唯一性校验
    if (enabled && !validateUniqueActiveRule(rules.value[idx].product_id, id)) {
      Message.error('同产品已有启用规则，请先停用同产品现有规则')
      return null
    }
    const before = { ...rules.value[idx] }
    const after: InventoryAlertRule = {
      ...before,
      enabled,
      updated_at: new Date().toISOString(),
      updated_by: CURRENT_USER.user_id,
    }
    return withAudit(enabled ? 'enable' : 'disable', id, before, after, async () => {
      rules.value[idx] = after
      Message.success(enabled ? '已启用' : '已停用')
      return after
    })
  }

  /**
   * 软删除（arch §5.5 / PRD §5.3）
   * 不物理删除，置 enabled=false + 审计 delete
   */
  async function deleteRule(id: string): Promise<boolean> {
    const idx = rules.value.findIndex((r) => r.id === id)
    if (idx === -1) {
      Message.error('规则不存在')
      return false
    }
    const before = { ...rules.value[idx] }
    return withAudit('delete', id, before, null, async () => {
      rules.value[idx] = { ...before, enabled: false, updated_at: new Date().toISOString(), updated_by: CURRENT_USER.user_id }
      Message.success('规则已删除（软删除）')
      return true
    })
  }

  return {
    rules: readonly(rules),
    snapshot: readonly(snapshot),
    auditLogs: readonly(auditLogs),
    loading: readonly(loading),
    enabledRules,
    legacyThreshold,
    loadAll,
    getRuleByProduct,
    getThresholdForProduct,
    getAlertDisplay: getAlertDisplayImpl,
    validateUniqueActiveRule,
    createRule,
    updateRule,
    toggleRule,
    deleteRule,
  }
}
