/**
 * 生命周期日志类型定义（架构基础）
 *
 * 注：实际类型定义在 stores/midloanStateMachine.ts 中（包含内部状态），
 *     本文件作为架构基础保留，导出通用日志结构用于未来扩展。
 *
 * 同步日志 + 状态变更日志 + 下线记录
 */

/** 同步方向 */
export type SyncDirection = 'call' | 'callback' | 'batch'

/** 同步日志状态 */
export type SyncStatus = 'success' | 'failed' | 'pending'

/** 同步日志类型 */
export type SyncType =
  | 'oa_dev'
  | 'oa_verify'
  | 'oa_production_internal'
  | 'oa_production_variable'
  | 'dw_callback'
  | 'internal_sync'
  | 'variable_sync'
  | 'offline_batch'

/** 下线批次状态 */
export type OfflineBatchStatus = 'success' | 'failed'