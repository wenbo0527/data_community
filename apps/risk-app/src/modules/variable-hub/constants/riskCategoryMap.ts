/**
 * 风险特征品类枚举 + 色板
 * 来源：风险数据一体化一期 文档
 *
 * 三品类：贷中行为 / 外数 / 征信
 * 一期聚焦「贷中行为」品类，启用 11 状态机；
 * 外数/征信继续使用现有 5 状态机（draft/pending/active/inactive/expired）。
 */

export type RiskCategory = 'midloan_behavior' | 'external' | 'credit'

export const RISK_CATEGORY_OPTIONS = [
  { label: '贷中行为', value: 'midloan_behavior', color: 'arcoblue', description: '11 状态机 · Hbase 元数据' },
  { label: '外数',   value: 'external',         color: 'purple',   description: '5 状态机 · 外部数据服务' },
  { label: '征信',   value: 'credit',           color: 'gold',     description: '5 状态机 · 人行/三方资信' }
] as const

export const RISK_CATEGORY_MAP: Record<RiskCategory, { label: string; color: string; description: string }> = {
  midloan_behavior: { label: '贷中行为', color: 'arcoblue', description: '11 状态机 · Hbase 元数据' },
  external:         { label: '外数',   color: 'purple',   description: '5 状态机 · 外部数据服务' },
  credit:           { label: '征信',   color: 'gold',     description: '5 状态机 · 人行/三方资信' }
}

/**
 * 一级分类（贷中行为品类） - 文档 A1 R12
 */
export const MIDLOAN_L1_CATEGORIES = [
  { label: '授信', value: 'credit_grant' },
  { label: '支用', value: 'loan_usage' },
  { label: '还款', value: 'repayment' },
  { label: '催收', value: 'collection' }
]

/**
 * 字段类型枚举 - 文档 A1 R08
 */
export const FIELD_TYPES = [
  { label: 'Integer', value: 'Integer' },
  { label: 'Double',  value: 'Double' },
  { label: 'Boolean', value: 'Boolean' },
  { label: 'String',  value: 'String' }
]

/**
 * 数据时效枚举 - 文档 A1 R17
 */
export const DATA_FRESHNESS = [
  { label: '实时',     value: 'realtime' },
  { label: '离线T-1', value: 'offline_t1' },
  { label: '离线T-2', value: 'offline_t2' }
]

/**
 * 名单类型 - 文档 附录 A B1
 */
export const LIST_TYPES = [
  { label: '空',     value: 'none' },
  { label: '白名单', value: 'white' },
  { label: '黑名单', value: 'black' },
  { label: '灰名单', value: 'gray' }
]

/**
 * 变量分类筛选选项（2026-08-10 会议新增 · 需求5）
 * 按内数/外数/行为/实时分类展示，支持全量混合展示
 */
export const VARIABLE_SOURCE_FILTER_OPTIONS = [
  { label: '全量', value: '', description: '全量混合展示' },
  { label: '内数', value: 'internal', description: '内部数据源变量' },
  { label: '外数', value: 'external', description: '外部数据源变量' },
  { label: '行为', value: 'behavior', description: '行为类变量' },
  { label: '实时', value: 'realtime', description: '实时数据源变量' }
] as const

export const riskCategoryLabel = (cat: string) => RISK_CATEGORY_MAP[cat as RiskCategory]?.label || cat || '—'
export const riskCategoryColor = (cat: string) => RISK_CATEGORY_MAP[cat as RiskCategory]?.color || 'gray'