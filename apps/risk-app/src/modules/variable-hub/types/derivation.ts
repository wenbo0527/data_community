/**
 * 衍生需求类型定义 · 文档 §三 模块 A
 * 4 状态机：pending_dev → developing → pending_register → registered
 */

export type DerivationStatus = 'pending_dev' | 'developing' | 'pending_register' | 'registered'

export const DERIVATION_STATUS_LABELS: Record<DerivationStatus, string> = {
  pending_dev: '待开发',
  developing: '开发中',
  pending_register: '待注册',
  registered: '已注册'
}

export const DERIVATION_STATUS_COLORS: Record<DerivationStatus, string> = {
  pending_dev: 'gray',
  developing: 'arcoblue',
  pending_register: 'gold',
  registered: 'green'
}

export const DERIVATION_STATUS_ORDER: DerivationStatus[] = [
  'pending_dev',
  'developing',
  'pending_register',
  'registered'
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
  featureId?: string
  status: DerivationStatus
  creator?: string
  createdAt: string
  updatedAt: string
}
