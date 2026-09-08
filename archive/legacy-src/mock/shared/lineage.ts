/**
 * Lineage Store(简化版,用于渲染测试)
 *
 * 字段关联 / 字段血缘 / 标准化覆盖率
 * @see 文档 §3.5 上下架影响分析
 */

export interface FieldLink {
  id: string
  sourceTable: string
  sourceField: string
  targetTable: string
  targetField: string
  standardCode?: string
  sensitivity: 'L1' | 'L2' | 'L3' | 'NONE'
  businessElement?: string
  isDirect: boolean
}

const FIELD_LINKS: FieldLink[] = [
  { id: 'fl_001', sourceTable: 'dim_user', sourceField: 'user_id', targetTable: 'fact_loan_apply', targetField: 'user_id', standardCode: 'STD_USER_ID', sensitivity: 'L1', businessElement: 'elem_user_id', isDirect: true },
  { id: 'fl_002', sourceTable: 'dim_user', sourceField: 'id_card_no', targetTable: 'fact_loan_apply', targetField: 'id_card_no', standardCode: 'STD_ID_CARD', sensitivity: 'L3', businessElement: 'elem_id_card', isDirect: true },
  { id: 'fl_003', sourceTable: 'dim_user', sourceField: 'balance', targetTable: 'dws_user_value', targetField: 'balance', sensitivity: 'L2', isDirect: false }
]

export const FieldLinkStore = {
  list() { return FIELD_LINKS },
  byField(table: string, field: string) {
    return FIELD_LINKS.filter(l =>
      (l.sourceTable === table && l.sourceField === field) ||
      (l.targetTable === table && l.targetField === field)
    )
  },
  byStandard(code: string) {
    return FIELD_LINKS.filter(l => l.standardCode === code)
  },
  byBusinessElement(code: string) {
    return FIELD_LINKS.filter(l => l.businessElement === code)
  },
  bySensitivity(level: string) {
    return FIELD_LINKS.filter(l => l.sensitivity === level)
  },
  tableComplianceRate(table: string): number {
    const links = FIELD_LINKS.filter(l => l.sourceTable === table || l.targetTable === table)
    if (links.length === 0) return 0
    const withStandard = links.filter(l => l.standardCode).length
    return Math.round((withStandard / links.length) * 100)
  },
  tableClassifyCoverage(table: string): number {
    const links = FIELD_LINKS.filter(l => l.sourceTable === table || l.targetTable === table)
    if (links.length === 0) return 0
    const classified = links.filter(l => l.sensitivity && l.sensitivity !== 'NONE').length
    return Math.round((classified / links.length) * 100)
  },
  addLink(link: Omit<FieldLink, 'id'>) {
    const newLink = { ...link, id: `fl_${Date.now()}` }
    FIELD_LINKS.push(newLink)
    return newLink
  },
  stats() {
    return {
      total: FIELD_LINKS.length,
      bySensitivity: {
        L1: FIELD_LINKS.filter(l => l.sensitivity === 'L1').length,
        L2: FIELD_LINKS.filter(l => l.sensitivity === 'L2').length,
        L3: FIELD_LINKS.filter(l => l.sensitivity === 'L3').length
      },
      withStandard: FIELD_LINKS.filter(l => l.standardCode).length
    }
  }
}

/** Enhanced field/table getters(供 lineage-graph 使用) */
export function getEnhancedField(table: string, field: string) {
  const link = FIELD_LINKS.find(l =>
    (l.sourceTable === table && l.sourceField === field) ||
    (l.targetTable === table && l.targetField === field)
  )
  return {
    table,
    field,
    sensitivity: link?.sensitivity || 'NONE',
    standardCode: link?.standardCode
  }
}

export function getEnhancedTable(table: string) {
  const links = FIELD_LINKS.filter(l => l.sourceTable === table || l.targetTable === table)
  return {
    table,
    fieldCount: links.length,
    complianceRate: FieldLinkStore.tableComplianceRate(table),
    classifyCoverage: FieldLinkStore.tableClassifyCoverage(table)
  }
}