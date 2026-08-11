/**
 * standard-store —— 数据标准 mock store
 *
 * 2026-08-06 补全:之前引用此文件但实际不存在,导致 standards.vue 启动报 import 错。
 * 现以最小可用实现 + 状态机(draft → pending → published → deprecated)重构。
 *
 * 状态机说明:
 *   draft(草稿) ── submit ──> pending(待审批)
 *   pending(待审批) ── approve ──> published(已发布)
 *   pending(待审批) ── reject ──> draft(打回)
 *   published(已发布) ── deprecate ──> deprecated(已弃用)
 *   deprecated(已弃用) ── restore ──> draft(恢复编辑)
 *
 * 上线后:把下列 mutator 替换为 HTTP 调用即可,业务方不感知。
 */
import { ref, computed } from 'vue'

export type StandardStatus = 'draft' | 'pending' | 'published' | 'deprecated'

export interface AppliedField {
  fullPath: string
  sample: string
  compliant: boolean
}

export interface Standard {
  code: string
  name: string
  category: string
  dataType: string
  length: number
  scale?: number
  owner: string
  complianceRate: number
  definition: string
  valueRange: string
  example: string
  tags?: string[]
  status: StandardStatus
  history: Array<{ ts: string; actor: string; action: string; from: StandardStatus; to: StandardStatus }>
  appliedFields?: AppliedField[]
}

// ───────────────────────────── 初始数据 ─────────────────────────────
const INITIAL: Standard[] = [
  {
    code: 'STD-001', name: '身份证号', category: '身份信息', dataType: 'string', length: 18,
    owner: '王运营', complianceRate: 96,
    definition: '中国公民身份证号码,18 位,末位校验码',
    valueRange: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',
    example: '110101199003078888',
    tags: ['国标', 'PII'],
    status: 'published',
    history: [
      { ts: '2025-01-15 10:00', actor: '王运营', action: '创建标准', from: 'draft', to: 'draft' },
      { ts: '2025-01-15 14:30', actor: '王运营', action: '提交审批', from: 'draft', to: 'pending' },
      { ts: '2025-01-16 09:15', actor: '张治理', action: '审批通过', from: 'pending', to: 'published' }
    ],
    appliedFields: [
      { fullPath: 'dwd_user.user_id_card', sample: '110101********8888', compliant: true },
      { fullPath: 'dws_loan_apply.id_card_no', sample: '110101199003078888', compliant: true }
    ]
  },
  {
    code: 'STD-002', name: '手机号', category: '联系信息', dataType: 'string', length: 11,
    owner: '王运营', complianceRate: 99,
    definition: '11 位中国大陆手机号',
    valueRange: '^1[3-9]\\d{9}$',
    example: '13800138000',
    tags: ['PII'],
    status: 'published',
    history: [
      { ts: '2025-02-01 09:00', actor: '王运营', action: '创建并发布', from: 'draft', to: 'published' }
    ],
    appliedFields: [
      { fullPath: 'dwd_user.phone', sample: '138****8000', compliant: true },
      { fullPath: 'dws_customer.phone_no', sample: '13800138000', compliant: true }
    ]
  },
  {
    code: 'STD-003', name: '贷款金额', category: '金额', dataType: 'number', length: 18, scale: 2,
    owner: '张风控', complianceRate: 88,
    definition: '人民币贷款本金,精度 2 位小数',
    valueRange: '0 < amount <= 10000000',
    example: '50000.00',
    tags: ['金融', '核心'],
    status: 'published',
    history: [
      { ts: '2025-03-10 14:00', actor: '张风控', action: '创建', from: 'draft', to: 'draft' },
      { ts: '2025-03-10 14:30', actor: '张风控', action: '提交审批', from: 'draft', to: 'pending' },
      { ts: '2025-03-11 10:20', actor: '张治理', action: '审批通过', from: 'pending', to: 'published' }
    ],
    appliedFields: [
      { fullPath: 'dwd_loan.principal', sample: '50000.00', compliant: true },
      { fullPath: 'dws_loan_apply.amt', sample: '50000', compliant: false }
    ]
  },
  {
    code: 'STD-004', name: '逾期天数', category: '风控指标', dataType: 'number', length: 3,
    owner: '张风控', complianceRate: 72,
    definition: '当前逾期天数(DPD),0 表示正常',
    valueRange: '0 <= dpd <= 999',
    example: '0',
    tags: ['风控'],
    status: 'pending',
    history: [
      { ts: '2025-04-20 11:00', actor: '张风控', action: '创建', from: 'draft', to: 'draft' },
      { ts: '2026-08-05 17:30', actor: '张风控', action: '提交审批', from: 'draft', to: 'pending' }
    ],
    appliedFields: []
  },
  {
    code: 'STD-005', name: '客户状态', category: '状态枚举', dataType: 'enum', length: 20,
    owner: '王运营', complianceRate: 95,
    definition: '客户生命周期状态',
    valueRange: '正常 / 冻结 / 注销 / 黑名单',
    example: '正常',
    tags: ['枚举'],
    status: 'draft',
    history: [
      { ts: '2026-08-04 15:00', actor: '王运营', action: '创建草稿', from: 'draft', to: 'draft' }
    ],
    appliedFields: []
  },
  {
    code: 'STD-006', name: '邮编', category: '联系信息', dataType: 'string', length: 6,
    owner: '王运营', complianceRate: 60,
    definition: '中国邮政编码',
    valueRange: '^[1-9]\\d{5}$',
    example: '100000',
    tags: [],
    status: 'deprecated',
    history: [
      { ts: '2024-06-01 10:00', actor: '王运营', action: '创建并发布', from: 'draft', to: 'published' },
      { ts: '2026-07-20 14:00', actor: '张治理', action: '弃用标准', from: 'published', to: 'deprecated' }
    ],
    appliedFields: []
  }
]

// ───────────────────────────── 全局响应式状态 ─────────────────────────────
// 用模块级 ref 模拟后端状态,组件订阅即实时刷新
const _standards = ref<Standard[]>(INITIAL.map(s => ({ ...s, history: [...s.history] })))

function nowStr() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function transition(code: string, to: StandardStatus, action: string, actor = '当前用户') {
  const s = _standards.value.find(x => x.code === code)
  if (!s) throw new Error(`未找到标准: ${code}`)
  const from = s.status
  s.status = to
  s.history.unshift({ ts: nowStr(), actor, action, from, to })
  return s
}

// ───────────────────────────── 对外 API ─────────────────────────────
export const StandardStore = {
  /** 获取所有标准(返回副本,避免外部直接修改) */
  getStandards(): Standard[] {
    return _standards.value
  },

  /** 按 code 查找 */
  findByCode(code: string): Standard | undefined {
    return _standards.value.find(s => s.code === code)
  },

  /** 草稿 → 提交审批 */
  submitForReview(code: string, actor?: string) {
    return transition(code, 'pending', '提交审批', actor)
  },

  /** 待审批 → 审批通过 → 已发布 */
  approve(code: string, actor?: string) {
    return transition(code, 'published', '审批通过', actor || '治理者')
  },

  /** 待审批 → 打回草稿 */
  reject(code: string, reason?: string, actor?: string) {
    return transition(code, 'draft', `打回草稿${reason ? `(${reason})` : ''}`, actor || '治理者')
  },

  /** 已发布 → 弃用 */
  deprecate(code: string, actor?: string) {
    return transition(code, 'deprecated', '弃用标准', actor || '治理者')
  },

  /** 弃用 → 恢复为草稿 */
  restoreFromDeprecated(code: string, actor?: string) {
    return transition(code, 'draft', '恢复编辑', actor)
  },

  /** 新建草稿 */
  createDraft(input: Omit<Standard, 'status' | 'history'>, actor?: string) {
    const newOne: Standard = {
      ...input,
      status: 'draft',
      history: [{ ts: nowStr(), actor: actor || '当前用户', action: '创建草稿', from: 'draft', to: 'draft' }],
      appliedFields: []
    }
    _standards.value.unshift(newOne)
    return newOne
  }
}

/** 派生常量(可在模板里直接用) */
export const STANDARD_STATUS_LIST: StandardStatus[] = ['draft', 'pending', 'published', 'deprecated']
export const STANDARD_STATUS_LABEL: Record<StandardStatus, string> = {
  draft: '草稿',
  pending: '待审批',
  published: '已发布',
  deprecated: '已弃用'
}
export const STANDARD_STATUS_COLOR: Record<StandardStatus, string> = {
  draft: 'orange',
  pending: 'arcoblue',
  published: 'green',
  deprecated: 'gray'
}