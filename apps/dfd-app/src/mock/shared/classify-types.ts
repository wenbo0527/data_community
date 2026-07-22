/**
 * classify-types (R3 stub)
 *
 * 原始来源: 计划从 dmt-app 共享包 @shared/classify-types 引入
 * 当前状态: workspace 中不存在 @shared 包 (R3 grep 验证)
 *           vite alias 修复后指向本地 src/mock/shared/，需要 stub 文件
 * 实施者: data_community_dev
 * 实施时间: 2026-07-13 11:10 CST
 * 后续: PM A' 决策 - 创建 packages/shared/ 共享包 (技术债 R1/R2 上送文博)
 */

export interface ClassifyField {
  field_name: string
  field_comment: string
  field_type?: string
  is_primary_key?: boolean
  sensitivity_level?: string
  category_l1?: string
  category_l2?: string
  category_l3?: string
  category_l4?: string
}

export interface ClassifyTable {
  table_name: string
  schema: string
  system_name: string
  owner: string
  table_comment: string
  fields: ClassifyField[]
  business_belonging?: string
  grade?: string
  sensitivity_level?: string
}