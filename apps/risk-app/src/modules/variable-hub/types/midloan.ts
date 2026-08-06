/**
 * Midloan 9 状态机类型定义 · 文档 v2.0
 * 阶段 1 + T3 完善
 *
 * 9 正常状态 + 4 异常状态（共 13 态，严格对齐文档 D.4 色板）
 */

export type MidloanStatus =
  // 9 正常状态（文档 v2.0 严格顺序）
  | 'registered'              // 已注册
  | 'developing_oa'           // 数仓开发中
  | 'dw_online'               // 数仓开发完成
  | 'pending_verify'          // 待验收
  | 'verified'                // 已验收
  | 'syncing_internal'        // 内数同步中
  | 'syncing_variable'        // 变量中心同步中
  | 'online'                  // 已上线
  | 'offline'                 // 已下线
  // 4 异常状态
  | 'internal_sync_failed'    // 内数同步失败
  | 'variable_sync_failed'    // 变量中心同步失败
  | 'dw_online_failed'        // 数仓开发失败
  | 'offline_failed'          // 下线接收失败

export interface MidloanStatusMeta {
  label: string
  color: string
  description: string
}

export const MIDLOAN_STATUS_LABELS: Record<MidloanStatus, string> = {
  registered: '已注册',
  developing_oa: '数仓开发中',
  dw_online: '数仓开发完成',
  pending_verify: '待验收',
  verified: '已验收',
  syncing_internal: '内数同步中',
  syncing_variable: '变量中心同步中',
  online: '已上线',
  offline: '已下线',
  internal_sync_failed: '内数同步失败',
  variable_sync_failed: '变量中心同步失败',
  dw_online_failed: '数仓开发失败',
  offline_failed: '下线接收失败'
}

export const MIDLOAN_STATUS_COLORS: Record<MidloanStatus, string> = {
  registered: 'arcoblue',
  developing_oa: 'purple',
  dw_online: 'cyan',
  pending_verify: 'gold',
  verified: 'green',
  syncing_internal: 'cyan',
  syncing_variable: 'cyan',
  online: 'green',
  offline: 'darkgray',
  internal_sync_failed: 'red',
  variable_sync_failed: 'red',
  dw_online_failed: 'red',
  offline_failed: 'red'
}

/** 9 状态机正常流转顺序（时间轴展示用） */
export const MIDLOAN_STATUS_ORDER: MidloanStatus[] = [
  'registered',
  'developing_oa',
  'dw_online',
  'pending_verify',
  'verified',
  'syncing_internal',
  'syncing_variable',
  'online',
  'offline'
]

/** 文档 D.3 状态时间戳字段映射 */
export const STATUS_TIMESTAMP_MAP: Record<MidloanStatus, string> = {
  registered: 'registeredAt',
  developing_oa: 'developingOaAt',
  dw_online: 'dwOnlineAt',
  pending_verify: 'pendingVerifyAt',
  verified: 'verifiedAt',
  syncing_internal: 'syncingInternalAt',
  syncing_variable: 'syncingVariableAt',
  online: 'onlineAt',
  offline: 'offlineTime',
  internal_sync_failed: 'syncFailedAt',
  variable_sync_failed: 'syncFailedAt',
  dw_online_failed: 'syncFailedAt',
  offline_failed: 'syncFailedAt'
}