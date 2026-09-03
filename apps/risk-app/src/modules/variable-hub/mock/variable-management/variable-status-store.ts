/**
 * 特征状态变更（Demo）
 *
 * 系统可承接的演示闭环：
 * 1. 启用/停用：用户在台账表格直接切换状态
 * 2. 提交上线申请：草稿 → 启用审批 → 上线（active）
 * 3. 评估写回：评估任务完成后回写 quality / missingRate / lastEvaluatedAt
 *
 * 所有覆盖都通过 localStorage 持久化，由 api/variable-management 合并到特征数据。
 */

const STATUS_KEY = 'variable.status.override'
const APPROVAL_KEY = 'variable.approval.records'
const EVAL_KEY = 'variable.evaluation.metrics.binding'

export type VariableLifecycleStatus = 'draft' | 'pending' | 'active' | 'inactive' | 'expired'

export interface StatusOverride {
  status: VariableLifecycleStatus
  reason?: string
  expectedOnlineTime?: string
  approver?: string
  updatedAt: string
  updatedBy: string
}

export interface EvaluationOverride {
  quality?: number
  missingRate?: number
  passRate?: number
  iv?: number
  ks?: number
  source: 'evaluation_task' | 'governance_drawer' | 'manual'
  taskId?: string
  updatedAt: string
  updatedBy: string
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

type StatusMap = Record<string, StatusOverride>
type EvaluationMap = Record<string, EvaluationOverride>

function readStatusMap(): StatusMap {
  return safeParse<StatusMap>(localStorage.getItem(STATUS_KEY), {})
}

function writeStatusMap(map: StatusMap) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(map))
}

function readEvalMap(): EvaluationMap {
  return safeParse<EvaluationMap>(localStorage.getItem(EVAL_KEY), {})
}

function writeEvalMap(map: EvaluationMap) {
  localStorage.setItem(EVAL_KEY, JSON.stringify(map))
}

export const VariableStatusStore = {
  /**
   * 启用/停用：直接在台账表格切换
   */
  setStatus(variableId: string, status: VariableLifecycleStatus, operator: string = 'Demo 用户', reason?: string) {
    const map = readStatusMap()
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    map[String(variableId)] = {
      status,
      reason,
      updatedAt: now,
      updatedBy: operator
    }
    writeStatusMap(map)
    return map[String(variableId)]
  },
  getStatus(variableId: string): StatusOverride | undefined {
    return readStatusMap()[String(variableId)]
  },
  /**
   * 提交上线申请：草稿 → pending（启用审批通过）→ active
   * Demo 简化为一键通过，落地为 active
   */
  submitForOnline(payload: {
    variableId: string
    reason: string
    expectedOnlineTime?: string
    approver?: string
  }) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const record = {
      id: `APR-${Date.now()}`,
      variableId: String(payload.variableId),
      reason: payload.reason,
      expectedOnlineTime: payload.expectedOnlineTime,
      approver: payload.approver || 'dmt_admin',
      submittedAt: now,
      result: 'approved' as const,
      submittedBy: 'Demo 用户'
    }
    const list = safeParse<any[]>(localStorage.getItem(APPROVAL_KEY), [])
    list.unshift(record)
    localStorage.setItem(APPROVAL_KEY, JSON.stringify(list))
    // 同步把状态推到 active
    this.setStatus(payload.variableId, 'active', 'Demo 用户', payload.reason)
    return record
  },
  listApprovals(variableId?: string) {
    const list = safeParse<any[]>(localStorage.getItem(APPROVAL_KEY), [])
    return variableId ? list.filter((item) => item.variableId === String(variableId)) : list
  },
  /**
   * 评估写回：从评估任务 / 治理抽屉写回 quality / missingRate / passRate / iv / ks
   */
  setEvaluation(variableId: string, payload: Omit<EvaluationOverride, 'updatedAt' | 'updatedBy'>, operator: string = 'Demo 用户') {
    const map = readEvalMap()
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    map[String(variableId)] = { ...payload, updatedAt: now, updatedBy: operator }
    writeEvalMap(map)
    return map[String(variableId)]
  },
  getEvaluation(variableId: string): EvaluationOverride | undefined {
    return readEvalMap()[String(variableId)]
  },
  getAllEvaluations(): EvaluationMap {
    return readEvalMap()
  },
  clear() {
    localStorage.removeItem(STATUS_KEY)
    localStorage.removeItem(APPROVAL_KEY)
    localStorage.removeItem(EVAL_KEY)
  }
}

export default VariableStatusStore
