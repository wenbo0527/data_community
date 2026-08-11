/**
 * Metadata Store(简化版,用于渲染测试)
 *
 * 元数据采集 / 表元数据 / 字段元数据
 */

export interface TableMeta {
  name: string
  schema: string
  description: string
  owner: string
  domain: string
  fieldCount: number
  rowCount: number
  updateTime: string
}

export const MetadataStore = {
  /** 别名:返回表格列表(兼容旧调用) */
  getTables(): TableMeta[] { return this.list() },

  list(): TableMeta[] {
    return [
      { name: 'dim_user', schema: 'default', description: '客户主表', owner: '张三', domain: '客户域', fieldCount: 12, rowCount: 12345678, updateTime: '2025-08-08 10:00' },
      { name: 'fact_loan_apply', schema: 'default', description: '贷款申请主表', owner: '李四', domain: '信贷域', fieldCount: 18, rowCount: 8765432, updateTime: '2025-08-07 22:00' },
      { name: 'dws_user_value', schema: 'default', description: '用户价值宽表', owner: '王五', domain: '用户价值', fieldCount: 24, rowCount: 12345678, updateTime: '2025-08-08 09:00' },
      { name: 'dws_risk_score', schema: 'default', description: '风险评分宽表', owner: '风控值班', domain: '风控域', fieldCount: 32, rowCount: 12345678, updateTime: '2025-08-07 18:00' }
    ]
  },

  byTable(name: string) {
    return this.list().find(t => t.name === name)
  },

  byOwner(owner: string) {
    return this.list().filter(t => t.owner === owner)
  },

  byDomain(domain: string) {
    return this.list().filter(t => t.domain === domain)
  },

  stats() {
    const list = this.list()
    return {
      totalTables: list.length,
      totalFields: list.reduce((sum, t) => sum + t.fieldCount, 0),
      totalRows: list.reduce((sum, t) => sum + t.rowCount, 0),
      byDomain: list.reduce<Record<string, number>>((acc, t) => {
        acc[t.domain] = (acc[t.domain] || 0) + 1
        return acc
      }, {})
    }
  }
}

export default MetadataStore