/**
 * dfd-app 元数据 Store
 * 从 dmt-app 共享 mock 拉取数据
 */
import { classifyAllTables } from '@shared/classify-modules'
import type { ClassifyTable, ClassifyField } from '@shared/classify-types'

/** dfd 详情页字段结构（兼容现有代码 + 扩展分级字段） */
export interface DfdTableField {
  name: string
  type: string
  description: string
  // 数据分级分类扩展字段
  business_belonging?: string
  grade?: string
  sensitivity_level?: string
  category_l1?: string
  category_l2?: string
  category_l3?: string
  category_l4?: string
}

export interface DfdTableItem {
  name: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: DfdTableField[]
  fieldRelations?: any[]
  rowCount?: number
  createTime?: string
  lastUpdateTime?: string
  storageSize?: string
  collectionOwner?: string
  relationType?: string
  relationField?: string
  relationDescription?: string
  processingLogic?: string
  sql?: string
  versions?: any[]
}

/** 共享的元数据 store（供 dfd 详情页使用） */
export const MetadataStore = {
  state: () => ({}),
  actions: {},

  /**
   * 列出所有表（dfd 格式）
   */
  getTables(): DfdTableItem[] {
    return classifyAllTables.map(t => ({
      name: t.table_name,
      type: t.schema.startsWith('hive') ? 'HIVE 表' : '业务表',
      category: '业务表',
      domain: t.system_name,
      updateFrequency: '每日更新',
      owner: t.owner,
      description: t.table_comment,
      fields: t.fields.map((f: ClassifyField) => ({
        name: f.field_name,
        type: inferType(f.field_name),
        description: f.field_comment,
        business_belonging: f.business_belonging,
        grade: f.grade,
        sensitivity_level: f.sensitivity_level,
        category_l1: f.category_l1,
        category_l2: f.category_l2,
        category_l3: f.category_l3,
        category_l4: f.category_l4
      })),
      createTime: t.updated_at,
      lastUpdateTime: t.updated_at
    }))
  },

  /**
   * 按名称查找
   */
  getTableByName(name: string): DfdTableItem | undefined {
    return this.getTables().find(t => t.name === name)
  }
}

/** 简单推断字段类型 */
function inferType(name: string): string {
  if (/_id$|_no$/.test(name)) return 'string'
  if (/_time$|_date$/.test(name)) return 'datetime'
  if (/amount|balance|score|rate|count|age|amount|price|fee/.test(name)) return 'number'
  return 'string'
}

export default MetadataStore
