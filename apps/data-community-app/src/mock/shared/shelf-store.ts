/**
 * shelf-store —— 数据上下架 mock store
 *
 * 2026-08-06 新建:补齐原版"资产管理"的核心动作——上下架。
 *
 * 适用对象:数据资源 / 数据资产 / 数据要素
 * 状态机:
 *   active(已上架) ── off ──> inactive(已下架)
 *   inactive ── on ──> active
 *   active / inactive ── archive ──> archived(已归档)
 *   archived ── restore ──> inactive
 *
 * "上下架"的业务含义:
 *   - active = 业务系统可见、可调用、可消费
 *   - inactive = 业务系统不可见,但数据保留,可在恢复后再次可用
 *   - archived = 完全封存,只供合规审计,业务不可见
 */
import { ref, computed } from 'vue'

export type ShelfStatus = 'active' | 'inactive' | 'archived'
export type ShelfKind = 'resource' | 'asset' | 'element'

export interface ShelfItem {
  id: string
  kind: ShelfKind
  /** 资源/资产/要素 类型细分 */
  subType: string
  /** 显示名 */
  name: string
  /** 描述 */
  description: string
  /** 路径(资源/资产)或编码(要素) */
  code: string
  /** Owner */
  owner: string
  /** 状态 */
  status: ShelfStatus
  /** 上架时间 */
  onShelfAt?: string
  /** 下架时间 */
  offShelfAt?: string
  /** 关联业务系统(资源类有) */
  sourceSystem?: string
  /** 关联集合(资产类有) */
  collection?: string
  /** 标签 */
  tags?: string[]
  /** 变更历史 */
  history: Array<{ ts: string; actor: string; action: ShelfAction; from?: ShelfStatus; to: ShelfStatus; comment?: string }>
}

export type ShelfAction = 'on' | 'off' | 'archive' | 'restore' | 'update'

// ───────────────────────────── 初始数据 ─────────────────────────────
const INITIAL: ShelfItem[] = [
  // ───── 资源类 ─────
  { id: 'RES-001', kind: 'resource', subType: '业务系统', name: '客户主数据(MySQL)', description: '客户主表,日增量 ~10 万', code: 'mysql.dim_user', owner: '系统组', status: 'active', onShelfAt: '2025-01-10', sourceSystem: 'MySQL-Production', tags: ['核心', 'PII'], history: [] },
  { id: 'RES-002', kind: 'resource', subType: '业务系统', name: '订单主数据(Oracle)', description: '订单主表', code: 'oracle.dwd_order', owner: '系统组', status: 'active', onShelfAt: '2025-02-15', sourceSystem: 'Oracle-Finance', tags: ['交易'], history: [] },
  { id: 'RES-003', kind: 'resource', subType: '文件导入', name: '征信报告(每日文件)', description: '每日上传的征信报告', code: 'sftp.credit_daily', owner: '数据运营', status: 'active', onShelfAt: '2025-03-01', sourceSystem: 'SFTP-External', tags: ['合规', '敏感'], history: [] },
  { id: 'RES-004', kind: 'resource', subType: '文件导入', name: '历史客户档案(批量)', description: '2020 年前的历史数据', code: 'hdfs.archive_user_legacy', owner: '数据治理', status: 'archived', onShelfAt: '2024-01-01', sourceSystem: 'HDFS-Legacy', tags: ['历史', '归档'], history: [{ ts: '2026-07-10 10:00', actor: '系统', action: 'archive', to: 'archived', comment: '历史数据归档' }] },
  { id: 'RES-005', kind: 'resource', subType: '日志数据', name: 'APP 端操作日志', description: 'APP 端所有用户操作埋点', code: 'kafka.app_event_log', owner: '系统组', status: 'active', onShelfAt: '2025-04-20', sourceSystem: 'Kafka-Streaming', tags: ['日志', '实时'], history: [] },
  { id: 'RES-006', kind: 'resource', subType: '实时数据', name: '交易流水(Flink)', description: '实时交易事件', code: 'flink.trade_event', owner: '风控组', status: 'active', onShelfAt: '2025-05-10', sourceSystem: 'Flink-Stream', tags: ['实时', '风控'], history: [] },
  { id: 'RES-007', kind: 'resource', subType: '业务系统', name: '历史产品库(Oracle)', description: '老产品库,已停用', code: 'oracle.legacy_product', owner: '系统组', status: 'inactive', onShelfAt: '2024-06-01', offShelfAt: '2026-06-15', sourceSystem: 'Oracle-Legacy', tags: ['停用'], history: [{ ts: '2026-06-15 14:00', actor: '系统组', action: 'off', from: 'active', to: 'inactive', comment: '迁移至新库' }] },

  // ───── 资产类 ─────
  { id: 'AST-001', kind: 'asset', subType: '集合', name: '贷前分析集合', description: '贷前客户画像 + 信用评估需要的资产', code: 'collection-pre-loan', owner: '王运营', status: 'active', onShelfAt: '2025-03-20', collection: '贷前分析集合', tags: ['核心', '高频'], history: [] },
  { id: 'AST-002', kind: 'asset', subType: '集合', name: '贷后监控集合', description: '贷后还款 / 逾期相关', code: 'collection-post-loan', owner: '张风控', status: 'active', onShelfAt: '2025-04-01', collection: '贷后监控', tags: ['核心'], history: [] },
  { id: 'AST-003', kind: 'asset', subType: '表', name: '客户主表 dws_user', description: '客户主表 DWS 层', code: 'dws_user', owner: '王运营', status: 'active', onShelfAt: '2025-02-10', collection: '客户主数据', tags: ['PII'], history: [] },
  { id: 'AST-004', kind: 'asset', subType: '表', name: '贷款申请表', description: '贷款申请主表', code: 'dws_loan_apply', owner: '张风控', status: 'active', onShelfAt: '2025-03-05', collection: '贷前分析集合', tags: ['核心'], history: [] },
  { id: 'AST-005', kind: 'asset', subType: '表', name: '逾期监控表', description: '实时逾期监控', code: 'dws_loan_overdue', owner: '张风控', status: 'active', onShelfAt: '2025-05-15', collection: '贷后监控', tags: ['实时'], history: [] },
  { id: 'AST-006', kind: 'asset', subType: '表', name: '历史产品映射表', description: '已弃用', code: 'dwd_product_mapping_legacy', owner: '数据治理', status: 'archived', onShelfAt: '2024-08-01', collection: '历史归档', tags: ['历史'], history: [{ ts: '2026-07-30 11:00', actor: '数据治理', action: 'archive', to: 'archived', comment: '完成迁移' }] },
  { id: 'AST-007', kind: 'asset', subType: '外数', name: '数美 - 设备指纹', description: '设备指纹风险评分', code: 'shumei.device_fingerprint', owner: '外部接入组', status: 'active', onShelfAt: '2025-06-01', tags: ['外数', '风控'], history: [] },
  { id: 'AST-008', kind: 'asset', subType: '外数', name: '同盾 - 信贷多头', description: '信贷多头数据', code: 'tongdun.multi_loan', owner: '外部接入组', status: 'inactive', onShelfAt: '2024-12-01', offShelfAt: '2026-08-01', tags: ['外数'], history: [{ ts: '2026-08-01 09:00', actor: '外部接入组', action: 'off', from: 'active', to: 'inactive', comment: '服务到期' }] },

  // ───── 要素类 ─────
  { id: 'ELM-001', kind: 'element', subType: '指标', name: 'DAU(日活跃用户)', description: '日活指标', code: 'M001', owner: '王运营', status: 'active', onShelfAt: '2025-03-01', tags: ['核心', 'DAU'], history: [] },
  { id: 'ELM-002', kind: 'element', subType: '指标', name: '首逾率', description: '首逾率 FPD30', code: 'M020', owner: '张风控', status: 'active', onShelfAt: '2025-04-15', tags: ['风控'], history: [] },
  { id: 'ELM-003', kind: 'element', subType: '变量', name: '近 30 天活跃天数', description: '用户活跃天数', code: 'V101', owner: '王运营', status: 'active', onShelfAt: '2025-03-15', tags: ['活跃'], history: [] },
  { id: 'ELM-004', kind: 'element', subType: '特征', name: '设备指纹风险分', description: '设备指纹综合风险分', code: 'F005', owner: '张风控', status: 'active', onShelfAt: '2025-05-20', tags: ['反欺诈'], history: [] },
  { id: 'ELM-005', kind: 'element', subType: '指标', name: 'GMV(成交总额)', description: '日 GMV', code: 'M010', owner: '李产品', status: 'active', onShelfAt: '2025-03-10', tags: ['核心'], history: [] },
  { id: 'ELM-006', kind: 'element', subType: '变量', name: '历史最大逾期金额', description: '历史最大逾期金额', code: 'V205', owner: '张风控', status: 'inactive', onShelfAt: '2025-04-01', offShelfAt: '2026-08-03', tags: ['敏感'], history: [{ ts: '2026-08-03 16:00', actor: '张风控', action: 'off', from: 'active', to: 'inactive', comment: '合规审查' }] }
]

// ───────────────────────────── 状态 ─────────────────────────────
const _items = ref<ShelfItem[]>(INITIAL.map(s => ({ ...s, tags: s.tags ? [...s.tags] : [], history: [...s.history] })))
const _currentUser = ref<string>('当前治理者')

function nowStr() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function transition(id: string, to: ShelfStatus, action: ShelfAction, comment?: string, actor?: string) {
  const item = _items.value.find(x => x.id === id)
  if (!item) throw new Error(`未找到对象: ${id}`)
  const from = item.status
  item.status = to
  const act = actor || _currentUser.value
  const record = { ts: nowStr(), actor: act, action, from, to, comment }
  item.history.unshift(record)
  if (action === 'on') item.onShelfAt = record.ts.slice(0, 10)
  if (action === 'off') item.offShelfAt = record.ts.slice(0, 10)
  return item
}

// ───────────────────────────── 对外 API ─────────────────────────────
export const ShelfStore = {
  getAll(): ShelfItem[] { return _items.value },
  byKind(kind: ShelfKind): ShelfItem[] { return _items.value.filter(x => x.kind === kind) },
  byId(id: string): ShelfItem | undefined { return _items.value.find(x => x.id === id) },

  /** 上架 */
  on(id: string, actor?: string) { return transition(id, 'active', 'on', undefined, actor) },
  /** 下架 */
  off(id: string, comment?: string, actor?: string) { return transition(id, 'inactive', 'off', comment, actor) },
  /** 归档 */
  archive(id: string, comment?: string, actor?: string) { return transition(id, 'archived', 'archive', comment, actor) },
  /** 从归档恢复为下架 */
  restore(id: string, comment?: string, actor?: string) { return transition(id, 'inactive', 'restore', comment, actor) },

  /** 批量操作 */
  batchOn(ids: string[], actor?: string) { ids.forEach(id => this.on(id, actor)); return ids.length },
  batchOff(ids: string[], comment?: string, actor?: string) { ids.forEach(id => this.off(id, comment, actor)); return ids.length },
  batchArchive(ids: string[], comment?: string, actor?: string) { ids.forEach(id => this.archive(id, comment, actor)); return ids.length },

  setCurrentUser(name: string) { _currentUser.value = name }
}

// ───────────────────────────── 派生常量 ─────────────────────────────
export const SHELF_STATUSES: ShelfStatus[] = ['active', 'inactive', 'archived']
export const SHELF_STATUS_LABEL: Record<ShelfStatus, string> = {
  active: '已上架',
  inactive: '已下架',
  archived: '已归档'
}
export const SHELF_STATUS_COLOR: Record<ShelfStatus, string> = {
  active: 'green',
  inactive: 'orange',
  archived: 'gray'
}

export const SHELF_KIND_LABEL: Record<ShelfKind, string> = {
  resource: '数据资源',
  asset: '数据资产',
  element: '数据要素'
}

export const SHELF_RESOURCE_SUBTYPES = ['业务系统', '文件导入', '日志数据', '实时数据']
export const SHELF_ASSET_SUBTYPES = ['集合', '表', '外数']
export const SHELF_ELEMENT_SUBTYPES = ['指标', '变量', '特征']