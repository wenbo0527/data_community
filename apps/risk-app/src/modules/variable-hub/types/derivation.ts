/**
 * 需求类型定义
 *
 * 需求列表 2 状态：
 * - 需求受理 (requirement_accepted)：初始状态
 * - 需求驳回 (rejected)：驳回（含原因），不创建特征
 *
 * 特征台账 2 状态（对应 VariableAssetMock.midloanStatus）：
 * - 需求提出 (requirement_proposal)：需求受理后「去注册」时在特征台账生成
 * - 已注册 (registered)：注册完成后
 */

export type DerivationStatus = 'requirement_accepted' | 'rejected'

export const DERIVATION_STATUS_LABELS: Record<DerivationStatus, string> = {
  requirement_accepted: '需求受理',
  rejected: '需求驳回'
}

export const DERIVATION_STATUS_COLORS: Record<DerivationStatus, string> = {
  requirement_accepted: 'blue',
  rejected: 'red'
}

export const DERIVATION_STATUS_ORDER: DerivationStatus[] = [
  'requirement_accepted',
  'rejected'
]

export interface DerivationRecord {
  id: string
  name: string
  businessScene: string
  expectedEffect?: string
  category?: string
  dataSource?: string
  featureEnName?: string
  featureCnName?: string
  fieldType?: string
  processingLogic?: string
  defaultValue?: string
  l1Category?: string
  l2Category?: string
  sourceTableAfter?: string
  sourceTableBefore?: string
  originFeatureEnName?: string
  dataFreshness?: string
  developer?: string
  excelReport?: string
  dataTableName?: string
  dwTaskId?: string
  productScope?: string
  listType?: string
  batch?: string
  acceptor?: string
  remark?: string
  /** 驳回原因（仅 rejected 状态有值） */
  rejectReason?: string
  /** 驳回时间 */
  rejectedAt?: string
  /** 提出人 & 处理人 */
  proposer?: string
  handler?: string
  syncLevel?: string
  featureId?: string
  status: DerivationStatus
  creator?: string
  createdAt: string
  updatedAt: string
}
