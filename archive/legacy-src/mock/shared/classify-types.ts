/**
 * 数据分级分类 - 共享类型定义
 * dmt-app + dfd-app 共用
 */

/** 敏感级别 */
export type SensitivityLevel = 'L1' | 'L2' | 'L3' | 'L4'

/** 分级（业务分级） */
export type Grade = '一般' | '重要' | '关键'

/** 业务属于 */
export type BusinessBelonging = '零售' | '对公' | '风控' | '运营' | '财务'

/** 单个字段的分级分类信息（字段粒度） */
export interface ClassifyField {
  field_name: string
  field_comment: string
  business_belonging: BusinessBelonging
  grade: Grade
  sensitivity_level: SensitivityLevel
  category_l1: string
  category_l2: string
  category_l3: string
  category_l4: string
  updated_at?: string
}

/** 表元信息（表粒度） */
export interface ClassifyTable {
  schema: string
  table_name: string
  table_comment: string
  owner: string
  fields: ClassifyField[]
  /** 分级覆盖率 0-100 */
  coverage: number
  updated_at: string
}

/** 数据源（系统） */
export interface ClassifySystem {
  id: string
  name: string
  description: string
  icon: string
  tableCount: number
  fieldCount: number
  distribution: { L1: number; L2: number; L3: number; L4: number }
  tables: ClassifyTable[]
}

/** 矩阵表条目（规范定义） */
export interface ClassifyMatrixItem {
  id: string
  category_l1: string
  category_l2: string
  category_l3: string
  category_l4: string
  sensitivity_level: SensitivityLevel
  /** 使用该分类的字段数（mock） */
  usage_count: number
  description?: string
}

/** API 接口定义 */
export interface ClassifyApiDoc {
  id: string
  name: string
  method: 'GET' | 'POST'
  path: string
  summary: string
  request_params: { name: string; type: string; required: boolean; description: string }[]
  response_params: { name: string; type: string; description: string }[]
  request_example: string
  response_example: string
  error_codes?: { code: string; message: string }[]
}
