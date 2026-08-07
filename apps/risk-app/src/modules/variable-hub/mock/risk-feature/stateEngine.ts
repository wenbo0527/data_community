/**
 * 风险特征 9 状态机 mock 引擎
 * 来源：风险数据一体化一期 文档 §四 状态流转表
 *
 * INT-01~INT-11 全部用 mock 接口模拟，包含：
 * - 提 OA 单（开发/验收/投产）
 * - 数仓任务回调
 * - 内数 API 注册/变更
 * - 变量中心注册/确认
 * - 失败重试
 * - 变量中心下线批次
 *
 * 状态机严格对齐文档 v2.0 D.4 色板（9 正常 + 4 异常 = 13 态）：
 *   已注册 → 数仓开发中 → 数仓开发完成 → 待验收 → 已验收 →
 *   内数同步中 → 变量中心同步中 → 已上线 → 已下线
 */

import { midloanStatusMeta } from '@/modules/variable-hub/constants/midloanStatusMap'
import { variableAssets } from '@/modules/variable-hub/mock/variable-management/variables'
import { DemoFlags } from '@/modules/variable-hub/mock/risk-feature/demoFlags'

// ============ 同步日志（全局）============
interface SyncLog {
  id: string                          // SYNC-YYYYMMDD-NNNNNN
  featureId: string
  featureName: string
  type: 'oa_dev' | 'oa_verify' | 'oa_production' | 'oa_production_internal' | 'oa_production_variable'
       | 'dw_callback' | 'internal_sync' | 'variable_sync' | 'offline_batch'
  direction: 'call' | 'callback' | 'batch'
  status: 'success' | 'failed' | 'pending'
  request?: any
  response?: any
  reason?: string                     // 失败原因
  startedAt: string
  finishedAt?: string
  retryCount: number
  operator?: string
}

// ============ 状态变更记录（按特征）============
interface StatusChangeLog {
  id: string                          // CHG-YYYYMMDD-NNNNNN
  featureId: string
  featureName: string
  fromStatus: string
  toStatus: string
  trigger: string                     // 触发条件/动作
  operator: string                    // 操作人（人或系统）
  operatorRole: string                // 角色
  operatedAt: string                  // 操作时间
  reason?: any                     // 备注（如驳回原因）
}

let statusChangeLogs: StatusChangeLog[] = []

function chgId() {
  const d = new Date()
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '')
  const count = (statusChangeLogs as any[]).filter((l: any) => l.id.startsWith(`CHG-${ymd}-`)).length
  return `CHG-${ymd}-${String(count + 1).padStart(6, '0')}`
}

export const StatusChangeStore = {
  list(filter: any = {}): any[] {
    let list: any[] = [...statusChangeLogs]
    list = list.reverse()
    if (filter.featureId) list = list.filter((l: any) => l.featureId === filter.featureId)
    return list
  },
  push(log: StatusChangeLog) {
    statusChangeLogs.push(log)
    return log
  },
  clear() {
    statusChangeLogs = []
  }
}

let syncLogs: SyncLog[] = []

function logId() {
  const d = new Date()
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '')
  const count = (syncLogs as any[]).filter((l: any) => l.id.startsWith(`SYNC-${ymd}-`)).length
  return `SYNC-${ymd}-${String(count + 1).padStart(6, '0')}`
}

function nowStr() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * 文档 D.3 状态时间戳字段映射
 * 每个状态切换时同时记录对应的时间戳
 */
const STATUS_TIMESTAMP_MAP: Record<string, string> = {
  registered: 'registeredAt',
  developing_oa: 'developingOaAt',
  dw_online: 'dwOnlineAt',
  pending_verify: 'pendingVerifyAt',
  verified: 'verifiedAt',
  syncing_internal: 'syncingInternalAt',
  syncing_variable: 'syncingVariableAt',
  online: 'onlineAt',
  offline: 'offlineTime'  // 已存在
}

/** 在状态变更时同时记录时间戳 */
function setStatusTimestamp(v: any, status: string) {
  const field = STATUS_TIMESTAMP_MAP[status]
  if (field) {
    v[field] = nowStr()
  }
}

/**
 * G2 R05: 内数同步失败后自动重试策略
 * - 最多 3 次
 * - 每次间隔 5 秒
 * - 重试后仍未成功 → 停留在 internal_sync_failed 等用户手动重试
 */
const autoRetryTimers: Record<string, any> = {}
function scheduleAutoRetry(featureId: string, currentRetryCount: number, retryFn: (id: string, auto?: boolean) => any) {
  // 已达最大重试次数（3次），停止自动重试
  if (currentRetryCount >= 3) {
    recordStatusChange(featureId, '', 'internal_sync_failed', 'internal_sync_failed', 'G2 R05 超过最大重试次数', '内数系统', 'internal_number_system', `已重试 ${currentRetryCount} 次，需用户手动重试`)
    return
  }
  // 清理已有定时器
  if (autoRetryTimers[featureId]) {
    clearTimeout(autoRetryTimers[featureId])
  }
  // 5 秒后自动重试
  autoRetryTimers[featureId] = setTimeout(() => {
    delete autoRetryTimers[featureId]
    const v = variableAssets.find(x => x.id === featureId)
    if (!v) return
    // 仅当仍处于失败状态时重试
    if (v.midloanStatus === 'internal_sync_failed') {
      retryFn(featureId, true)  // autoTriggered = true
    }
  }, 5000)
}

// ============ 同步日志 API ============
export const SyncLogStore = {
  list(filter: any = {}): any[] {
    let list: any[] = [...syncLogs]
    list = list.reverse()
    if (filter.featureId) list = list.filter((l: any) => l.featureId === filter.featureId)
    if (filter.type) list = list.filter((l: any) => l.type === filter.type)
    if (filter.status) list = list.filter((l: any) => l.status === filter.status)
    return list
  },
  push(log: SyncLog) {
    syncLogs.push(log)
    return log
  },
  clear() {
    syncLogs = []
  }
}

// ============ 下线记录 ============
interface OfflineRecord {
  batchId: string
  featureId: string
  featureName: string
  offlineAt: string
  reason: string
  status: 'success' | 'failed'
  detail?: string
}
let offlineRecords: OfflineRecord[] = [
  {
    batchId: 'BATCH-20260730-001',
    featureId: 'MIDLOAN-FEAT-0007',
    featureName: '旧版近30日大额交易',
    offlineAt: '2026-07-30 02:00:00',
    reason: '模型 V3 升级，汰换 V2 衍生特征',
    status: 'success'
  },
  {
    batchId: 'BATCH-20260802-002',
    featureId: 'MIDLOAN-FEAT-0008',
    featureName: '近90日多头借贷查询次数',
    offlineAt: '2026-08-02 02:00:00',
    reason: '数据源服务下线',
    status: 'success'
  },
  // ============ 补齐：失败的批次记录（K2 E1）============
  {
    batchId: 'BATCH-20260805-003',
    featureId: 'MIDLOAN-FEAT-0016',
    featureName: '近7日银行卡号变更次数',
    offlineAt: '2026-08-05 02:00:00',
    reason: '变量中心批量接口返回 503',
    status: 'failed',
    detail: '批量接口响应超时，3 条特征中 1 条未确认（feature_id=MIDLOAN-FEAT-0016）'
  }
]

export const OfflineRecordStore = {
  list() {
    return [...offlineRecords].reverse() as any[]
  },
  push(rec: OfflineRecord) {
    offlineRecords.push(rec)
    return rec
  },
  /** 批次结果统计（K2 R03） */
  batchSummary() {
    const success = (offlineRecords as any[]).filter((r: any) => r.status === 'success').length
    const failed = (offlineRecords as any[]).filter((r: any) => r.status === 'failed').length
    return { total: offlineRecords.length, success, failed }
  }
}

/** 记录状态变更（D.3 / B2 R11） */
export function recordStatusChange(featureId: string, featureName: string, fromStatus?: string, toStatus?: string, trigger?: string, operator?: string, operatorRole?: string, reason?: any) {
  StatusChangeStore.push({
    id: chgId(),
    featureId,
    featureName,
    fromStatus: fromStatus || '',
    toStatus: toStatus || '',
    trigger: trigger || '',
    operator: operator || '小李',
    operatorRole: operatorRole || 'risk_data_member',
    operatedAt: nowStr(),
    reason
  })
}

// ============ 9 状态机 mock 联动动作 ============

/** C1：提 OA 开发单 */
export function submitDevOA(featureId: string, payload?: { oaOrderId?: string; remark?: string }): { success: boolean; oaId?: string; reason?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { success: false, reason: '特征不存在' }
  if (v.midloanStatus !== 'registered') {
    return { success: false, reason: `当前状态（${midloanStatusMeta(v.midloanStatus).label}）不允许提开发单` }
  }
  if (DemoFlags.isOADown()) {
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'oa_dev',
      direction: 'call',
      status: 'failed',
      reason: 'OA系统响应超时（演示开关触发）',
      startedAt: nowStr(),
      finishedAt: nowStr(),
      retryCount: 0
    })
    return { success: false, reason: 'OA系统响应超时（演示开关触发）' }
  }
  // 优先使用用户填写的 OA 单号，否则自动生成
  const oaId = payload?.oaOrderId || `OA-DEV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'developing_oa'
  setStatusTimestamp(v, 'developing_oa')
  v.devOaOrderId = oaId
  recordStatusChange(featureId, v.name, fromStatus, 'developing_oa', 'C1 提开发OA单', '小李', 'risk_data_member', `OA单号：${oaId}`)
  SyncLogStore.push({
    id: logId(),
    featureId,
    featureName: v.name,
    type: 'oa_dev',
    direction: 'call',
    status: 'success',
    request: { featureId, receiver: '数仓团队' },
    response: { oaId, receiver: 'dw_team' },
    startedAt: nowStr(),
    finishedAt: nowStr(),
    retryCount: 0,
    operator: '小李'
  })
  return { success: true, oaId }
}

/** D1：模拟数仓回调（成功/失败） */
export function dwCallback(featureId: string, success = true, taskId = ''): { ok: boolean; reason?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  if (v.midloanStatus !== 'developing_oa') {
    return { ok: false, reason: `当前状态（${midloanStatusMeta(v.midloanStatus).label}）不接受数仓回调` }
  }
  // 演示开关：数仓故障
  if (!success || DemoFlags.isDwDown()) {
    const fromStatus = v.midloanStatus
    v.midloanStatus = 'dw_online_failed'
    recordStatusChange(featureId, v.name, fromStatus, 'dw_online_failed', 'D1 数仓任务回调失败', '数仓任务调度系统', 'dw_system', success ? '数仓任务执行失败（演示开关触发）' : 'Hive 表创建异常')
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'dw_callback',
      direction: 'callback',
      status: 'failed',
      reason: success ? '数仓任务执行失败（演示开关触发）' : '数仓任务执行失败：Hive 表创建异常',
      startedAt: nowStr(),
      finishedAt: nowStr(),
      retryCount: 0
    })
    return { ok: false, reason: '数仓任务执行失败' }
  }
  const now = nowStr()
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'dw_online'
  setStatusTimestamp(v, 'dw_online')
  v.dwTaskId = taskId || `DW-TASK-${Math.floor(Math.random() * 900000 + 100000)}`
  v.dwOnlineTime = now
  recordStatusChange(featureId, v.name, fromStatus, 'dw_online', 'D1 数仓任务回调成功', '数仓任务调度系统', 'dw_system', `任务ID：${v.dwTaskId}`)
  // D1 R07: 数仓回调成功后自动推进至「待验收」
  v.midloanStatus = 'pending_verify'
  setStatusTimestamp(v, 'pending_verify')
  recordStatusChange(featureId, v.name, 'dw_online', 'pending_verify', 'D1 R07 自动推进', '数仓任务调度系统', 'dw_system', '数仓已就绪，等待发起验收')
  SyncLogStore.push({
    id: logId(),
    featureId,
    featureName: v.name,
    type: 'dw_callback',
    direction: 'callback',
    status: 'success',
    request: { taskId: v.dwTaskId },
    response: { status: 'success', dataTableName: v.dataTableName || 'ads_midloan_' + featureId.split('-').pop() },
    startedAt: now,
    finishedAt: now,
    retryCount: 0
  })
  return { ok: true }
}

/** E1：发起验收 → 创建 OA 验收单 */
export function submitVerify(featureId: string, payload?: { acceptor?: string; verifyOaOrderId?: string; remark?: string }): { ok: boolean; oaId?: string; reason?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  if (v.midloanStatus !== 'dw_online') {
    return { ok: false, reason: `当前状态（${midloanStatusMeta(v.midloanStatus).label}）不允许发起验收` }
  }
  if (DemoFlags.isOADown()) {
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'oa_verify',
      direction: 'call',
      status: 'failed',
      reason: 'OA系统响应超时（演示开关触发）',
      startedAt: nowStr(),
      finishedAt: nowStr(),
      retryCount: 0
    })
    return { ok: false, reason: 'OA系统响应超时（演示开关触发）' }
  }
  const oaId = payload?.verifyOaOrderId || `OA-VERIFY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`
  const acceptor = payload?.acceptor || '小李'
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'pending_verify'
  setStatusTimestamp(v, 'pending_verify')
  v.verifyOaOrderId = oaId
  v.acceptor = acceptor
  recordStatusChange(featureId, v.name, fromStatus, 'pending_verify', 'E1 发起验收', '小李', 'risk_data_member', `OA验收单号：${oaId} 验收人：${acceptor}`)
  const now = nowStr()
  SyncLogStore.push({
    id: logId(),
    featureId,
    featureName: v.name,
    type: 'oa_verify',
    direction: 'call',
    status: 'success',
    request: { featureId, content: '数据底表/加工逻辑/字段完整性' },
    response: { oaId, acceptor: v.creator || '验收人' },
    startedAt: now,
    finishedAt: now,
    retryCount: 0
  })
  return { ok: true, oaId }
}

/** E2：验收通过 */
export function verifyPass(featureId: string, operator = '小李'): { ok: boolean } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v || v.midloanStatus !== 'pending_verify') return { ok: false }
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'verified'
  setStatusTimestamp(v, 'verified')
  v.acceptor = operator
  recordStatusChange(featureId, v.name, fromStatus, 'verified', 'E2 验收通过', operator, 'risk_data_member')
  return { ok: true }
}

/** E3：验收驳回 → 回退到开发中（OA单），数仓重新修改后回调 */
export function verifyReject(featureId: string, reason = '验收未通过', operator = '验收人'): { ok: boolean; reason?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  if (v.midloanStatus !== 'pending_verify') {
    return { ok: false, reason: `当前状态（${midloanStatusMeta(v.midloanStatus).label}）不允许驳回` }
  }
  if (!reason || !reason.trim()) {
    return { ok: false, reason: '驳回原因不能为空' }
  }
  const now = nowStr()
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'developing_oa'
  setStatusTimestamp(v, 'developing_oa')
  v.rejectReason = reason
  v.rejectedAt = now
  recordStatusChange(featureId, v.name, fromStatus, 'developing_oa', 'E3 验收驳回', operator, 'risk_data_member', reason)
  SyncLogStore.push({
    id: logId(),
    featureId,
    featureName: v.name,
    type: 'oa_verify',
    direction: 'callback',
    status: 'failed',
    reason: '验收驳回：' + reason,
    startedAt: now,
    finishedAt: now,
    retryCount: 0,
    operator: operator
  })
  return { ok: true }
}

/** F1：发起上线流程（文档 F1 R02：弹出确认抽屉预览后点击「确认」） */
export function startOnlineFlow(featureId: string): { ok: boolean; reason?: string; oaId?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  if (v.midloanStatus !== 'verified') {
    return { ok: false, reason: `当前状态（${midloanStatusMeta(v.midloanStatus).label}）不允许发起上线` }
  }
  // 上线投产 OA 单号（OA 系统自动生成）
  const oaId = `OA-PROD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'syncing_internal'
  setStatusTimestamp(v, 'syncing_internal')
  v.onlineOaOrderId = oaId
  // 记录上线投产 OA 同步日志
  SyncLogStore.push({
    id: logId(),
    featureId,
    featureName: v.name,
    type: 'oa_production',
    direction: 'call',
    status: 'success',
    request: { featureId, receiver: '内数系统 + 变量中心', content: '上线投产通知' },
    response: { oaId, receiver: 'dw_team', target: ['internal_number_system', 'variable_center'] },
    startedAt: nowStr(),
    finishedAt: nowStr(),
    retryCount: 0,
    operator: '小李'
  })
  recordStatusChange(featureId, v.name, fromStatus, 'syncing_internal', 'F1 发起上线流程', '小李', 'risk_data_member', `上线投产 OA 单号：${oaId}（用户确认上线，自动提OA单给内数+变量中心）`)
  // 立即触发内数同步
  setTimeout(() => internalSync(featureId, true), 0)
  return { ok: true, oaId }
}

/** G1：内数同步 */
export function internalSync(featureId: string, autoTriggered = false): { ok: boolean; reason?: string; apiNo?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  const now = nowStr()
  // 触发失败条件：数据底表名称为空 或 演示开关
  if (!v.dataTableName) {
    const fromStatus = v.midloanStatus
    v.midloanStatus = 'internal_sync_failed'
    v.syncFailedReason = `数据底表名称为空，内数API（INT-01）找不到对应表（feature_id=${featureId}）`
    v.syncFailedAt = now
    v.syncRetryCount = (v.syncRetryCount || 0) + 1
    recordStatusChange(featureId, v.name, fromStatus, 'internal_sync_failed', 'G1 内数同步失败', '内数系统', 'internal_number_system', v.syncFailedReason)
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'internal_sync',
      direction: 'call',
      status: 'failed',
      request: { featureId, dataTableName: v.dataTableName, apiName: v.apiName || '' },
      response: { errorCode: 'INT-01-404', errorMsg: 'table not found' },
      reason: v.syncFailedReason,
      startedAt: now,
      finishedAt: now,
      retryCount: v.syncRetryCount
    })
    // G2 R05: 自动重试（最多 3 次，每次间隔 5 秒）
    scheduleAutoRetry(featureId, v.syncRetryCount, internalSync)
    return { ok: false, reason: v.syncFailedReason }
  }
  // 演示开关：内数故障
  if (DemoFlags.isInternalDown()) {
    const fromStatus = v.midloanStatus
    v.midloanStatus = 'internal_sync_failed'
    v.syncFailedReason = '内数API返回错误（演示开关触发）'
    v.syncFailedAt = now
    v.syncRetryCount = (v.syncRetryCount || 0) + 1
    recordStatusChange(featureId, v.name, fromStatus, 'internal_sync_failed', 'G1 内数同步失败', '内数系统', 'internal_number_system', v.syncFailedReason)
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'internal_sync',
      direction: 'call',
      status: 'failed',
      reason: v.syncFailedReason,
      startedAt: now,
      finishedAt: now,
      retryCount: v.syncRetryCount
    })
    // G2 R05: 自动重试
    scheduleAutoRetry(featureId, v.syncRetryCount, internalSync)
    return { ok: false, reason: v.syncFailedReason }
  }
  // 成功
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'syncing_internal'
  setStatusTimestamp(v, 'syncing_internal')
  const apiNo = v.apiNo || `MIDLOAN-API-${Math.floor(Math.random() * 9000 + 1000)}`
  v.apiNo = apiNo
  v.apiName = v.apiName || `midloan_query_${apiNo.split('-').pop()}`
  recordStatusChange(featureId, v.name, fromStatus, 'syncing_internal', 'G1 内数同步成功', '内数系统', 'internal_number_system', `API号：${apiNo}`)
  SyncLogStore.push({
    id: logId(),
    featureId,
    featureName: v.name,
    type: 'oa_production_internal',
    direction: 'call',
    status: 'success',
    request: { featureId, oaReceiver: '内数团队' },
    response: { apiNo, apiName: v.apiName },
    startedAt: now,
    finishedAt: now,
    retryCount: 0
  })
  // 模拟内数回调后立即进入「变量中心同步中」
  setTimeout(() => variableSync(featureId), 100)
  return { ok: true, apiNo }
}

/** H1：变量中心同步成功 → 已上线 */
export function variableSync(featureId: string, forceFail = false): { ok: boolean; reason?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  const now = nowStr()
  if (forceFail || DemoFlags.isVariableDown()) {
    const fromStatus = v.midloanStatus
    v.midloanStatus = 'variable_sync_failed'
    v.syncFailedReason = '变量中心返回失败：特征已存在 / 字段冲突'
    v.syncFailedAt = now
    v.syncRetryCount = (v.syncRetryCount || 0) + 1
    recordStatusChange(featureId, v.name, fromStatus, 'variable_sync_failed', 'H1 变量中心同步失败', '变量中心系统', 'variable_center_system', v.syncFailedReason)
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'variable_sync',
      direction: 'call',
      status: 'failed',
      reason: v.syncFailedReason,
      startedAt: now,
      finishedAt: now,
      retryCount: v.syncRetryCount
    })
    return { ok: false, reason: v.syncFailedReason }
  }
  // 成功 → 已上线（文档 H1 R05：变量中心确认上线 → 已上线）
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'online'
  setStatusTimestamp(v, 'online')
  v.onlineTime = now
  v.referenceStatus = '已引用'
  v.referenceDetail = `已正式投产到变量中心，关联决策引擎：风控V3、风控V4`
  recordStatusChange(featureId, v.name, fromStatus, 'online', 'H1 变量中心确认上线', '变量中心系统', 'variable_center_system', `上线时间：${now} 接口号：VC-API-002`)
  SyncLogStore.push({
    id: logId(),
    featureId,
    featureName: v.name,
    type: 'oa_production_variable',
    direction: 'call',
    status: 'success',
    request: { featureId, apiNo: v.apiNo },
    response: { status: '已上线', onlineTime: now },
    startedAt: now,
    finishedAt: now,
    retryCount: 0
  })
  return { ok: true }
}

/** K1：变量中心发起下线（台账被动接收，文档 K1 R01） */
export function receiveOffline(featureId: string, reason = '变量中心下线', payload?: { offlineDate?: string; remark?: string }): { ok: boolean; reason?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  if (v.midloanStatus !== 'online') {
    return { ok: false, reason: `当前状态（${midloanStatusMeta(v.midloanStatus).label}）不是「已上线」，不接受下线` }
  }
  const now = nowStr()
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'offline'
  setStatusTimestamp(v, 'offline')
  v.offlineTime = payload?.offlineDate ? new Date(payload.offlineDate).toISOString().slice(0, 19).replace('T', ' ') : now
  v.offlineReason = reason + (payload?.remark ? `（${payload.remark}）` : '')
  v.referenceStatus = '已断开'
  v.referenceDetail = '变量中心已断开引用，等待数字社区团队断开 hbase/hive'
  recordStatusChange(featureId, v.name, fromStatus, 'offline', 'K1 变量中心发起下线', '变量中心系统', 'variable_center_system', v.offlineReason)
  OfflineRecordStore.push({
    batchId: `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
    featureId,
    featureName: v.name,
    offlineAt: v.offlineTime,
    reason: v.offlineReason,
    status: 'success'
  })
  SyncLogStore.push({
    id: logId(),
    featureId,
    featureName: v.name,
    type: 'offline_batch',
    direction: 'callback',
    status: 'success',
    reason: v.offlineReason,
    startedAt: now,
    finishedAt: now,
    retryCount: 0,
    operator: 'variable_center_system'
  })
  return { ok: true }
}

/** 重试同步（手动） */
export function retrySync(featureId: string, operator = '小李'): { ok: boolean; reason?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  const now = nowStr()
  if (v.midloanStatus === 'internal_sync_failed') {
    // 模拟：补全数据底表后可成功
    v.dataTableName = v.dataTableName || `ads_midloan_${featureId.split('-').pop()}`
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'internal_sync',
      direction: 'call',
      status: 'pending',
      reason: `操作人 ${operator} 发起手动重试`,
      startedAt: now,
      finishedAt: now,
      retryCount: v.syncRetryCount || 0,
      operator
    })
    return internalSync(featureId)
  }
  if (v.midloanStatus === 'variable_sync_failed') {
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'variable_sync',
      direction: 'call',
      status: 'pending',
      reason: `操作人 ${operator} 发起手动重试`,
      startedAt: now,
      finishedAt: now,
      retryCount: v.syncRetryCount || 0,
      operator
    })
    return variableSync(featureId)
  }
  if (v.midloanStatus === 'dw_online_failed') {
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'dw_callback',
      direction: 'callback',
      status: 'pending',
      reason: `操作人 ${operator} 重新触发数仓任务`,
      startedAt: now,
      finishedAt: now,
      retryCount: v.syncRetryCount || 0,
      operator
    })
    return dwCallback(featureId, true)
  }
  if (v.midloanStatus === 'offline_failed') {
    const fromStatus = v.midloanStatus
    v.midloanStatus = 'offline'
    v.offlineTime = now
    recordStatusChange(featureId, v.name, fromStatus, 'offline', 'K1 手动触发批次重试', operator, 'risk_data_admin', '手动重试成功')
    // 追加一条新的成功批次记录，与详情页「下线批次」展示数据一致
    OfflineRecordStore.push({
      batchId: `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
      featureId,
      featureName: v.name,
      offlineAt: now,
      reason: `操作人 ${operator} 手动触发批次重试`,
      status: 'success',
      detail: '重试后变量中心确认下线成功'
    })
    SyncLogStore.push({
      id: logId(),
      featureId,
      featureName: v.name,
      type: 'offline_batch',
      direction: 'callback',
      status: 'success',
      reason: `操作人 ${operator} 手动触发批次重试`,
      startedAt: now,
      finishedAt: now,
      retryCount: 0,
      operator
    })
    return { ok: true }
  }
  return { ok: false, reason: '当前状态不可重试' }
}

/** B1 R10：补充数据底表名称 */
export function supplementDataTable(featureId: string, tableName: string): { ok: boolean; reason?: string } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false, reason: '特征不存在' }
  if (!tableName || !tableName.trim()) {
    return { ok: false, reason: '数据底表名称不能为空' }
  }
  v.dataTableName = tableName.trim()
  v.syncFailedReason = ''
  return { ok: true }
}

/** 演示用：把单个特征重置回 registered 初始状态 */
export function resetFeature(featureId: string): { ok: boolean } {
  const v = variableAssets.find(x => x.id === featureId)
  if (!v) return { ok: false }
  const fromStatus = v.midloanStatus
  v.midloanStatus = 'registered'
  setStatusTimestamp(v, 'registered')
  v.syncFailedReason = ''
  v.syncFailedAt = ''
  v.syncRetryCount = 0
  v.devOaOrderId = ''
  v.verifyOaOrderId = ''
  v.apiNo = ''
  v.apiName = ''
  v.onlineTime = ''
  recordStatusChange(featureId, v.name, fromStatus, 'registered', 'Demo 重置', '小李', 'risk_data_member', '重置到「已注册」')
  return { ok: true }
}

/**
 * ============ Mock 数据补充：完整状态历史初始化（用户反馈）============
 *
 * 给定一个特征，根据其当前 midloanStatus 自动生成从「已注册」开始的
 * 完整状态变更历史 + 同步日志 + 下线批次。
 *
 * 业务规则：
 * - 从 registered 开始，按 9 状态机顺序生成
 * - 异常状态从失败点向前推演
 * - 同一特征只初始化一次（避免重复）
 */
const MOCK_HISTORY_INITIALIZED = new Set<string>()

/** 9 状态机：每个状态的模拟进入时间偏移（分钟）*/
const STATUS_TIMELINE_OFFSET: Record<string, number> = {
  registered: 0,        // 0 分钟（基线）
  developing_oa: 30,    // +30 分钟
  dw_online: 120,       // +1.5 小时
  pending_verify: 125,  // +5 分钟
  verified: 240,        // +1.9 小时
  syncing_internal: 245,// +5 分钟
  syncing_variable: 360,// +1.9 小时
  online: 480,          // +2 小时
  offline: 1440         // +1 天
}

/** 状态变更对应的角色 + 触发方式 + 备注 */
const STATUS_CHANGE_META: Record<string, { trigger: string; operator: string; operatorRole: string; reason: string }> = {
  registered: {
    trigger: '创建特征',
    operator: '小李',
    operatorRole: 'risk_data_member',
    reason: '特征已注册，等待提开发OA单'
  },
  developing_oa: {
    trigger: '提交开发OA单',
    operator: '小李',
    operatorRole: 'risk_data_member',
    reason: 'OA单号：OA-2026-MID-0042'
  },
  dw_online: {
    trigger: '数仓任务回调',
    operator: '数仓系统',
    operatorRole: 'dw_system',
    reason: '数仓任务 ID：DW-MID-2026-0039 执行成功'
  },
  pending_verify: {
    trigger: '提交验收',
    operator: '小李',
    operatorRole: 'risk_data_member',
    reason: 'OA验收单号：OA-VERIFY-2026-0012'
  },
  verified: {
    trigger: '验收通过',
    operator: '王工',
    operatorRole: 'risk_data_member',
    reason: '验收意见：字段逻辑正确，可上线'
  },
  syncing_internal: {
    trigger: '发起上线流程',
    operator: '小李',
    operatorRole: 'risk_data_member',
    reason: 'OA单号：OA-ONLINE-2026-0089'
  },
  syncing_variable: {
    trigger: '内数API回调成功',
    operator: '内数系统',
    operatorRole: 'internal_number_system',
    reason: '内数同步接口号：INTERNAL-API-001'
  },
  online: {
    trigger: '变量中心确认',
    operator: '变量中心',
    operatorRole: 'variable_center_system',
    reason: '变量中心接口号：VC-API-002'
  },
  offline: {
    trigger: '接收下线',
    operator: '变量中心',
    operatorRole: 'variable_center_system',
    reason: '下线原因：业务调整'
  }
}

/** 异常状态对应的原因 */
const FAILED_REASON_MAP: Record<string, string> = {
  internal_sync_failed: '内数API注册接口返回 timeout，请稍后重试',
  variable_sync_failed: '变量中心接口返回 503 服务暂时不可用',
  dw_online_failed: '数仓任务执行超时（> 30 分钟），疑似任务阻塞',
  offline_failed: '变量中心批次同步接口返回 500，已记录待人工处理'
}

/**
 * 给定基础时间，返回「当前时间 - offset 分钟」的时间字符串
 */
function offsetTime(baseISO: string, offsetMin: number): string {
  const d = new Date(baseISO)
  d.setMinutes(d.getMinutes() - offsetMin)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * 初始化某个特征的完整状态历史（如果还没初始化过）
 */
export function initMockStatusHistory(featureId: string): void {
  if (MOCK_HISTORY_INITIALIZED.has(featureId)) return

  const v = variableAssets.find(x => x.id === featureId)
  if (!v || !v.midloanStatus) return

  const currentStatus = v.midloanStatus

  // 找到当前状态在 9 状态机顺序中的下标
  const STATUS_ORDER = [
    'registered', 'developing_oa', 'dw_online', 'pending_verify',
    'verified', 'syncing_internal', 'syncing_variable', 'online', 'offline'
  ]
  const currentIdx = STATUS_ORDER.indexOf(currentStatus)
  const isFailed = currentStatus.endsWith('_failed')

  // 异常状态映射到正常状态
  const failedToNormal: Record<string, number> = {
    internal_sync_failed: 5,    // syncing_internal
    variable_sync_failed: 6,    // syncing_variable
    dw_online_failed: 2,        // dw_online
    offline_failed: 8           // offline
  }
  const targetIdx = isFailed
    ? failedToNormal[currentStatus]
    : currentIdx
  if (targetIdx < 0) return

  // 基础时间：当前时间
  const baseTime = new Date().toISOString()

  // 从 registered 开始到 targetIdx 生成变更记录
  let prevStatus = 'registered'
  for (let i = 0; i <= targetIdx; i++) {
    const status = STATUS_ORDER[i]
    const meta = STATUS_CHANGE_META[status]
    const offset = STATUS_TIMELINE_OFFSET[status] || (i * 60)
    const operatedAt = offsetTime(baseTime, offset)

    // 触发变量数据上的 timestamp 字段（如果有）
    if (v) {
      const tsKey = STATUS_TIMESTAMP_MAP[status]
      if (tsKey) (v as any)[tsKey] = operatedAt
    }

    // 入变更记录（除首个状态外）
    if (i > 0) {
      const fromStatus = prevStatus
      recordStatusChange(
        featureId,
        v.name,
        fromStatus,
        status,
        meta.trigger,
        meta.operator,
        meta.operatorRole,
        meta.reason
      )
    }
    prevStatus = status
  }

  // 异常态：额外生成「失败」状态记录
  if (isFailed) {
    const failMeta: any = {
      trigger: '自动流转失败',
      operator: '系统',
      operatorRole: 'variable_center_system',
      reason: FAILED_REASON_MAP[currentStatus] || '未知失败原因'
    }
    recordStatusChange(
      featureId,
      v.name,
      STATUS_ORDER[targetIdx],
      currentStatus,
      failMeta.trigger,
      failMeta.operator,
      failMeta.operatorRole,
      failMeta.reason
    )
    // 设置失败字段
    v.syncFailedReason = failMeta.reason
    v.syncFailedAt = offsetTime(baseTime, STATUS_TIMELINE_OFFSET[STATUS_ORDER[targetIdx]] + 5)
    v.syncRetryCount = Math.floor(Math.random() * 3) + 1
  }

  // 补充：内数 + 变量中心同步日志（如果当前到 syncing_internal 或之后）
  if (targetIdx >= 5) {
    pushMockSyncLog(featureId, v.name, 'internal_sync', 'callback', 'success', STATUS_TIMELINE_OFFSET['syncing_internal'], baseTime, '内数API返回成功，接口号：INTERNAL-API-001')
  }
  if (targetIdx >= 6) {
    pushMockSyncLog(featureId, v.name, 'variable_sync', 'callback', 'success', STATUS_TIMELINE_OFFSET['syncing_variable'], baseTime, '变量中心注册成功，接口号：VC-API-002')
  }

  // 补充：下线批次（如果当前是 offline / offline_failed）
  if (currentStatus === 'offline' || currentStatus === 'offline_failed') {
    pushMockOfflineBatch(featureId, v.name, currentStatus === 'offline_failed' ? 'failed' : 'success', STATUS_TIMELINE_OFFSET['offline'], baseTime, currentStatus === 'offline_failed' ? '变量中心批次同步失败' : '业务调整下线')
  }

  MOCK_HISTORY_INITIALIZED.add(featureId)
}

/**
 * 添加一条 mock 同步日志
 */
function pushMockSyncLog(featureId: string, featureName: string, type: string, direction: string, status: string, offsetMin: number, baseTime: string, reason?: string) {
  syncLogs.push({
    id: logId(),
    featureId,
    featureName,
    type: type as any,
    direction: direction as any,
    status: status as any,
    startedAt: offsetTime(baseTime, offsetMin),
    finishedAt: offsetTime(baseTime, offsetMin - 1),
    retryCount: 0,
    reason: status === 'failed' ? reason : undefined
  })
}

/**
 * 添加一条 mock 下线批次
 */
function pushMockOfflineBatch(featureId: string, featureName: string, status: string, offsetMin: number, baseTime: string, reason: string) {
  offlineRecords.push({
    batchId: `BATCH-${Date.now().toString().slice(-6)}`,
    featureId,
    featureName,
    offlineAt: offsetTime(baseTime, offsetMin),
    reason,
    status: status as any,
    detail: status === 'failed' ? '变量中心接口返回 500，请联系管理员' : '变量中心确认下线成功'
  })
}

/** 一次性批量初始化所有特征的 mock 历史 */
export function initAllMockHistories(): void {
  variableAssets.forEach(v => {
    if (v.category === 'midloan_behavior' && v.midloanStatus) {
      initMockStatusHistory(v.id)
    }
  })
}

/** 重试数仓任务 */
export function retryDwTask(featureId: string) {
  return dwCallback(featureId, true)
}

export const MidloanStateEngine = {
  submitDevOA,
  dwCallback,
  submitVerify,
  verifyPass,
  verifyReject,
  startOnlineFlow,
  internalSync,
  variableSync,
  receiveOffline,
  retrySync,
  retryDwTask,
  /** B1 R10 补充数据底表名称 */
  supplementDataTable,
  /** 重置单个特征到初始状态 */
  resetFeature,
  /** 初始化 mock 完整状态历史 */
  initMockStatusHistory,
  /** 聚合：根据 action key 调用对应函数 */
  handleAction(featureId: string, key: string, payload?: any): any {
    switch (key) {
      case 'submit_dev_oa': return submitDevOA(featureId, payload)
      case 'simulate_dw_success':
      case 'simulate_dw_success_dw': return dwCallback(featureId, true)
      case 'simulate_dw_failed': return dwCallback(featureId, false)
      case 'submit_verify': return submitVerify(featureId, payload)
      case 'verify_pass': return verifyPass(featureId)
      case 'verify_reject': return verifyReject(featureId, payload?.reason || '验收未通过', payload?.operator || '验收人')
      case 'start_online': return startOnlineFlow(featureId)
      case 'retry_sync': return retrySync(featureId)
      case 'retry_dw': return retryDwTask(featureId)
      case 'manual_batch_retry': return retrySync(featureId)
      case 'simulate_supplement_table':
        return supplementDataTable(featureId, 'ads_midloan_demo_table')
      default: return { ok: false, reason: `未知动作：${key}` }
    }
  },

  /**
   * ============ 批量执行（用户反馈）============
   *
   * 业务规则：
   * - 每条记录独立执行（一条失败不影响其他）
   * - 仅允许部分 action key（白名单）
   * - 校验每条记录的状态匹配（不符合的记录跳过）
   *
   * 文档 K1 明确：下线是被动接收，不允许主动批量申请下线，故移除 request_offline
   */
  batchExecute(featureIds: string[], actionKey: string, payload?: any) {
    // 白名单：仅允许主流程操作 + 重试类
    const allowedKeys = [
      'submit_dev_oa',
      'submit_verify',
      'verify_pass',
      'verify_reject',
      'start_online',
      'retry_sync',
      'retry_dw',
      'manual_batch_retry'
    ]
    if (!allowedKeys.includes(actionKey)) {
      return {
        ok: false,
        reason: `批量提交不支持该动作：${actionKey}`,
        total: featureIds.length,
        succeeded: 0,
        failed: 0,
        results: []
      }
    }

    const results: Array<{
      featureId: string
      ok: boolean
      reason?: string
      result?: any
    }> = []

    let succeeded = 0
    let failed = 0

    for (const fid of featureIds) {
      const r = this.handleAction(fid, actionKey, payload)
      const ok = !!(r && r.ok)
      if (ok) {
        succeeded++
      } else {
        failed++
      }
      results.push({
        featureId: fid,
        ok,
        reason: r?.reason,
        result: r
      })
    }

    return {
      ok: failed === 0,
      total: featureIds.length,
      succeeded,
      failed,
      results,
      reason: failed > 0 ? `${failed} 条失败` : undefined
    }
  }
}

export default MidloanStateEngine