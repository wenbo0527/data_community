/**
 * permission-store —— 字段权限申请 store
 *
 * 2026-08-06 新建:补齐原版 PermissionApply / PermissionApproval /
 *   PermissionManagement / PermissionProgress 4 步流程的 mock 数据。
 *
 * 状态机:
 *   draft(草稿) ── submit ──> pending(待审批)
 *   pending ── approve ──> approved(已通过)
 *   pending ── reject ──> rejected(已拒绝)
 *   approved ── expire ──> expired(已过期)
 *
 * 上线后:把 mutator 替换为 HTTP 调用即可,业务方不感知。
 */
import { ref, computed } from 'vue'

export type PermissionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired'

export interface PermissionApply {
  id: string
  /** 申请人 */
  applicant: string
  applicantDept: string
  /** 申请字段 */
  tablePath: string
  fieldName: string
  fieldDesc?: string
  /** 申请理由 */
  reason: string
  /** 申请用途分类 */
  purpose: 'data-analysis' | 'risk-control' | 'marketing' | 'report' | 'other'
  /** 申请的权限级别(读/写) */
  scope: 'read' | 'write'
  /** 申请有效期(月) */
  validMonths: number
  /** 审批人 */
  approver?: string
  /** 状态 */
  status: PermissionStatus
  /** 创建时间 */
  createdAt: string
  /** 最近更新 */
  updatedAt: string
  /** 审批意见 */
  approvalComment?: string
  /** 审批完成时间 */
  approvedAt?: string
  /** 流转历史 */
  history: Array<{ ts: string; actor: string; action: string; from: PermissionStatus; to: PermissionStatus; comment?: string }>
}

// ───────────────────────────── 初始数据 ─────────────────────────────
const INITIAL: PermissionApply[] = [
  {
    id: 'PA-001', applicant: '王运营', applicantDept: '数据运营组',
    tablePath: 'dws_loan_apply.amt', fieldName: 'amt', fieldDesc: '贷款本金',
    reason: '需要计算月活用户的贷款转化率', purpose: 'data-analysis', scope: 'read', validMonths: 6,
    approver: '张治理', status: 'pending',
    createdAt: '2026-08-04 10:30', updatedAt: '2026-08-04 10:30',
    history: [
      { ts: '2026-08-04 10:30', actor: '王运营', action: '提交申请', from: 'draft', to: 'pending' }
    ]
  },
  {
    id: 'PA-002', applicant: '张风控', applicantDept: '风控建模组',
    tablePath: 'dwd_user.id_card_no', fieldName: 'id_card_no', fieldDesc: '身份证号',
    reason: '用于反欺诈模型训练', purpose: 'risk-control', scope: 'read', validMonths: 12,
    approver: '张治理', status: 'approved', approvalComment: '已审批,需脱敏使用',
    createdAt: '2026-07-25 14:00', updatedAt: '2026-07-26 09:15', approvedAt: '2026-07-26 09:15',
    history: [
      { ts: '2026-07-25 14:00', actor: '张风控', action: '提交申请', from: 'draft', to: 'pending' },
      { ts: '2026-07-26 09:15', actor: '张治理', action: '审批通过', from: 'pending', to: 'approved', comment: '已审批,需脱敏使用' }
    ]
  },
  {
    id: 'PA-003', applicant: '陈营销', applicantDept: '营销组',
    tablePath: 'dws_user_profile.income', fieldName: 'income', fieldDesc: '年收入',
    reason: '用于客群分层', purpose: 'marketing', scope: 'read', validMonths: 3,
    approver: '张治理', status: 'rejected', approvalComment: '字段安全分级过高,建议申请 L2 字段',
    createdAt: '2026-07-20 11:00', updatedAt: '2026-07-21 09:30',
    history: [
      { ts: '2026-07-20 11:00', actor: '陈营销', action: '提交申请', from: 'draft', to: 'pending' },
      { ts: '2026-07-21 09:30', actor: '张治理', action: '审批拒绝', from: 'pending', to: 'rejected', comment: '字段安全分级过高,建议申请 L2 字段' }
    ]
  },
  {
    id: 'PA-004', applicant: '李产品', applicantDept: '产品组',
    tablePath: 'dws_loan_overdue.overdue_days', fieldName: 'overdue_days', fieldDesc: '逾期天数',
    reason: '产品指标看板需求', purpose: 'report', scope: 'read', validMonths: 12,
    approver: '张治理', status: 'approved', approvalComment: 'OK',
    createdAt: '2026-06-15 09:00', updatedAt: '2026-06-15 14:20', approvedAt: '2026-06-15 14:20',
    history: [
      { ts: '2026-06-15 09:00', actor: '李产品', action: '提交申请', from: 'draft', to: 'pending' },
      { ts: '2026-06-15 14:20', actor: '张治理', action: '审批通过', from: 'pending', to: 'approved', comment: 'OK' }
    ]
  },
  {
    id: 'PA-005', applicant: '王运营', applicantDept: '数据运营组',
    tablePath: 'dwd_loan.principal', fieldName: 'principal', fieldDesc: '贷款本金',
    reason: '历史数据修复', purpose: 'other', scope: 'write', validMonths: 1,
    status: 'draft', createdAt: '2026-08-05 16:00', updatedAt: '2026-08-05 16:00',
    history: [
      { ts: '2026-08-05 16:00', actor: '王运营', action: '创建草稿', from: 'draft', to: 'draft' }
    ]
  },
  {
    id: 'PA-006', applicant: '王运营', applicantDept: '数据运营组',
    tablePath: 'dwd_user.phone', fieldName: 'phone', fieldDesc: '手机号',
    reason: '客群触达', purpose: 'marketing', scope: 'read', validMonths: 3,
    approver: '张治理', status: 'expired',
    createdAt: '2025-08-01 10:00', updatedAt: '2025-08-02 09:00', approvedAt: '2025-08-02 09:00',
    history: [
      { ts: '2025-08-01 10:00', actor: '王运营', action: '提交申请', from: 'draft', to: 'pending' },
      { ts: '2025-08-02 09:00', actor: '张治理', action: '审批通过', from: 'pending', to: 'approved' },
      { ts: '2026-08-01 09:00', actor: 'system', action: '权限到期', from: 'approved', to: 'expired' }
    ]
  }
]

// ───────────────────────────── 状态 ─────────────────────────────
const _items = ref<PermissionApply[]>(INITIAL.map(p => ({ ...p, history: [...p.history] })))
const _currentUser = ref<string>('王运营')

function nowStr() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function transition(id: string, to: PermissionStatus, action: string, opts: { comment?: string; actor?: string } = {}) {
  const item = _items.value.find(x => x.id === id)
  if (!item) throw new Error(`未找到申请: ${id}`)
  const from = item.status
  item.status = to
  item.updatedAt = nowStr()
  item.history.unshift({ ts: nowStr(), actor: opts.actor || '当前用户', action, from, to, comment: opts.comment })
  if (to === 'approved') { item.approvedAt = nowStr(); item.approver = opts.actor || '治理者'; if (opts.comment) item.approvalComment = opts.comment }
  if (to === 'rejected' || to === 'expired') { item.approver = opts.actor || item.approver || '治理者'; if (opts.comment) item.approvalComment = opts.comment }
  return item
}

// ───────────────────────────── 对外 API ─────────────────────────────
export const PermissionStore = {
  getAll(): PermissionApply[] { return _items.value },
  byId(id: string): PermissionApply | undefined { return _items.value.find(x => x.id === id) },

  /** 当前用户的申请(我的申请视角) */
  myApplies(actor = _currentUser.value): PermissionApply[] {
    return _items.value.filter(x => x.applicant === actor)
  },
  /** 待我审批(我的审批视角) */
  pendingForApprover(approver = '张治理'): PermissionApply[] {
    return _items.value.filter(x => x.status === 'pending')
  },
  /** 全量(申请管理视角) */
  manageList(): PermissionApply[] {
    return _items.value
  },
  /** 我的进度(按时间倒序的当前用户所有) */
  progress(actor = _currentUser.value): PermissionApply[] {
    return this.myApplies(actor).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  submitForReview(id: string) {
    return transition(id, 'pending', '提交审批')
  },
  approve(id: string, comment?: string, actor?: string) {
    return transition(id, 'approved', '审批通过', { comment, actor })
  },
  reject(id: string, comment?: string, actor?: string) {
    return transition(id, 'rejected', '审批拒绝', { comment, actor })
  },
  expire(id: string) {
    return transition(id, 'expired', '权限到期', { actor: 'system' })
  },
  withdraw(id: string) {
    return transition(id, 'draft', '撤回申请', { actor: _currentUser.value })
  },
  createDraft(input: Omit<PermissionApply, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'history'>) {
    const newOne: PermissionApply = {
      ...input,
      id: 'PA-' + String(_items.value.length + 1).padStart(3, '0'),
      status: 'draft',
      createdAt: nowStr(),
      updatedAt: nowStr(),
      history: [{ ts: nowStr(), actor: _currentUser.value, action: '创建草稿', from: 'draft', to: 'draft' }]
    }
    _items.value.unshift(newOne)
    return newOne
  },
  setCurrentUser(name: string) { _currentUser.value = name }
}

// ───────────────────────────── 派生常量 ─────────────────────────────
export const PERMISSION_STATUSES: PermissionStatus[] = ['draft', 'pending', 'approved', 'rejected', 'expired']
export const PERMISSION_STATUS_LABEL: Record<PermissionStatus, string> = {
  draft: '草稿',
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
  expired: '已过期'
}
export const PERMISSION_STATUS_COLOR: Record<PermissionStatus, string> = {
  draft: 'orange',
  pending: 'arcoblue',
  approved: 'green',
  rejected: 'red',
  expired: 'gray'
}
export const PERMISSION_PURPOSE_LABEL: Record<PermissionApply['purpose'], string> = {
  'data-analysis': '数据分析',
  'risk-control': '风控建模',
  'marketing': '营销',
  'report': '报表',
  'other': '其他'
}
export const PERMISSION_SCOPE_LABEL: Record<PermissionApply['scope'], string> = {
  read: '只读',
  write: '读写'
}