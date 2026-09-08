/**
 * Column-level Lineage(字段级血缘) + Table-level 影响分析
 *
 * 字段级血缘:追踪字段-字段的上下游关系(SQL/ETL)
 * 表级影响分析:下架某表时,基于字段血缘计算所有下游受影响的资产/要素
 *
 * @see 文档 §3.5 上下架影响分析(P0 必做)
 * @see 文档 §13.2 落地路径:基于血缘图 BFS/DFS 遍历
 */

import type { MockMethod } from 'vite-plugin-mock'

export interface ColumnLineageEdge {
  id: string
  sourceSchema: string
  sourceTable: string
  sourceColumn: string
  targetSchema: string
  targetTable: string
  targetColumn: string
  transform: string
  isDirect: boolean
  evidence?: string
}

/**
 * 字段级血缘 mock 数据
 */
export const COLUMN_LINEAGE: ColumnLineageEdge[] = [
  // dim_user → fact_loan_apply(贷款申请主表)
  { id: 'cl_001', sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'id_card_no', targetSchema: 'default', targetTable: 'fact_loan_apply', targetColumn: 'id_card_no', transform: 'direct', isDirect: true, evidence: 'JOIN dim_user ON user_id' },
  { id: 'cl_002', sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'user_id', targetSchema: 'default', targetTable: 'fact_loan_apply', targetColumn: 'user_id', transform: 'direct', isDirect: true, evidence: 'JOIN dim_user ON user_id' },
  { id: 'cl_003', sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'mobile', targetSchema: 'default', targetTable: 'fact_loan_apply', targetColumn: 'mobile', transform: 'direct', isDirect: true, evidence: 'JOIN dim_user ON user_id' },
  // dim_user.id_card_no → fact_user_event(脱敏后)
  { id: 'cl_004', sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'id_card_no', targetSchema: 'default', targetTable: 'fact_user_event', targetColumn: 'id_card_no', transform: 'md5(id_card_no)', isDirect: false, evidence: 'ETL: md5_hash.sql' },
  // fact_loan_apply.apply_amt → dws_user_value.total_credit
  { id: 'cl_005', sourceSchema: 'default', sourceTable: 'fact_loan_apply', sourceColumn: 'apply_amt', targetSchema: 'default', targetTable: 'dws_user_value', targetColumn: 'total_credit', transform: 'SUM(apply_amt) GROUP BY user_id', isDirect: false, evidence: 'dws_layer.sql line 45' },
  // fact_loan_apply → fact_loan_apply.apply_no(衍生)
  { id: 'cl_006', sourceSchema: 'default', sourceTable: 'fact_loan_apply', sourceColumn: 'apply_id', targetSchema: 'default', targetTable: 'fact_loan_apply', targetColumn: 'apply_no', transform: "concat('LN', LPAD(apply_id, 10, '0'))", isDirect: false, evidence: '衍生字段' },
  // dim_user → dws_user_credit(聚合)
  { id: 'cl_007', sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'user_id', targetSchema: 'default', targetTable: 'dws_user_credit', targetColumn: 'user_id', transform: 'group_key', isDirect: true, evidence: '聚合主键' },
  // dim_user.creditScore → dws_risk_score.credit_score
  { id: 'cl_008', sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'creditScore', targetSchema: 'default', targetTable: 'dws_risk_score', targetColumn: 'credit_score', transform: 'direct', isDirect: true, evidence: 'DWD 同步' },
  // dws_user_value.total_credit → dws_user_value.used_credit
  { id: 'cl_009', sourceSchema: 'default', sourceTable: 'dws_user_value', sourceColumn: 'total_credit', targetSchema: 'default', targetTable: 'dws_user_value', targetColumn: 'used_credit', transform: 'SUM(used_amt) WHERE status=approved', isDirect: false, evidence: 'DWS 内部汇总' },
  // dws_risk_score.credit_score → dws_risk_score.risk_level
  { id: 'cl_010', sourceSchema: 'default', sourceTable: 'dws_risk_score', sourceColumn: 'credit_score', targetSchema: 'default', targetTable: 'dws_risk_score', targetColumn: 'risk_level', transform: "CASE WHEN credit_score>=800 THEN 'low' ...", isDirect: false, evidence: '衍生字段' }
]

/**
 * Column-level Lineage Store
 */
export const ColumnLineageStore = {
  list(): ColumnLineageEdge[] {
    return COLUMN_LINEAGE
  },

  /** 字段的上游血缘 */
  upstream(table: string, column: string): ColumnLineageEdge[] {
    return COLUMN_LINEAGE.filter(e => e.targetTable === table && e.targetColumn === column)
  },

  /** 字段的下游血缘 */
  downstream(table: string, column: string): ColumnLineageEdge[] {
    return COLUMN_LINEAGE.filter(e => e.sourceTable === table && e.sourceColumn === column)
  },

  /** 表的全部字段血缘 */
  byTable(tableName: string): ColumnLineageEdge[] {
    return COLUMN_LINEAGE.filter(e => e.sourceTable === tableName || e.targetTable === tableName)
  },

  /** 字段是否被引用 */
  isFieldReferenced(table: string, column: string): boolean {
    return COLUMN_LINEAGE.some(e =>
      (e.sourceTable === table && e.sourceColumn === column) ||
      (e.targetTable === table && e.targetColumn === column)
    )
  },

  /**
   * 影响分析:如果某字段改变,哪些下游字段会受影响(BFS)
   */
  impactOf(table: string, column: string): { table: string; column: string }[] {
    const result: { table: string; column: string }[] = []
    const visited = new Set<string>()

    const traverse = (t: string, c: string) => {
      const key = `${t}.${c}`
      if (visited.has(key)) return
      visited.add(key)
      const next = this.downstream(t, c)
      next.forEach(e => {
        result.push({ table: e.targetTable, column: e.targetColumn })
        traverse(e.targetTable, e.targetColumn)
      })
    }

    traverse(table, column)
    return result
  },

  /**
   * 表级影响分析:如果下架某张表,基于该表所有字段血缘计算所有下游受影响的表(去重)
   */
  impactOfTable(tableName: string): {
    directDownstreamTables: string[]
    allDownstreamTables: string[]
    affectedColumns: { table: string; column: string }[]
    severity: 'low' | 'medium' | 'high' | 'critical'
    summary: string
  } {
    const fieldsInTable = new Set<string>()
    COLUMN_LINEAGE.forEach(e => {
      if (e.sourceTable === tableName) fieldsInTable.add(e.sourceColumn)
      if (e.targetTable === tableName) fieldsInTable.add(e.targetColumn)
    })

    const directDownstreamSet = new Set<string>()
    const allDownstreamSet = new Set<string>()
    const affectedColumns: { table: string; column: string }[] = []

    fieldsInTable.forEach(field => {
      // 一阶下游
      this.downstream(tableName, field).forEach(e => {
        directDownstreamSet.add(e.targetTable)
        affectedColumns.push({ table: e.targetTable, column: e.targetColumn })
      })
      // 全链路下游
      this.impactOf(tableName, field).forEach(c => {
        if (c.table !== tableName) allDownstreamSet.add(c.table)
      })
    })

    const totalDownstream = allDownstreamSet.size
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let summary = ''
    if (totalDownstream === 0) {
      severity = 'low'
      summary = '该表无下游依赖,可安全下架'
    } else if (totalDownstream <= 2) {
      severity = 'medium'
      summary = `影响范围较小,涉及 ${totalDownstream} 张下游表`
    } else if (totalDownstream <= 5) {
      severity = 'high'
      summary = `影响范围较大,涉及 ${totalDownstream} 张下游表,建议提前通知相关 Owner`
    } else {
      severity = 'critical'
      summary = `影响范围极广,涉及 ${totalDownstream} 张下游表,必须经过治理委员会审批`
    }

    return {
      directDownstreamTables: Array.from(directDownstreamSet),
      allDownstreamTables: Array.from(allDownstreamSet),
      affectedColumns,
      severity,
      summary
    }
  },

  stats() {
    const tables = new Set<string>()
    COLUMN_LINEAGE.forEach(e => {
      tables.add(e.sourceTable)
      tables.add(e.targetTable)
    })

    return {
      totalEdges: COLUMN_LINEAGE.length,
      directEdges: COLUMN_LINEAGE.filter(e => e.isDirect).length,
      derivedEdges: COLUMN_LINEAGE.filter(e => !e.isDirect).length,
      tables: tables.size
    }
  }
}

/**
 * HTTP Mock 端点
 */
export const columnLineageMocks: MockMethod[] = [
  {
    url: '/api/column-lineage/impact/:tableName',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const tableName = url.split('/').pop() || ''
      return { code: 0, data: ColumnLineageStore.impactOfTable(tableName) }
    }
  },
  {
    url: '/api/column-lineage/upstream/:table/:column',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const parts = url.split('/')
      const column = parts.pop() || ''
      const table = parts.pop() || ''
      return { code: 0, data: ColumnLineageStore.upstream(table, column) }
    }
  },
  {
    url: '/api/column-lineage/downstream/:table/:column',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const parts = url.split('/')
      const column = parts.pop() || ''
      const table = parts.pop() || ''
      return { code: 0, data: ColumnLineageStore.downstream(table, column) }
    }
  },
  {
    url: '/api/column-lineage/table/:tableName',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const tableName = url.split('/').pop() || ''
      return { code: 0, data: ColumnLineageStore.byTable(tableName) }
    }
  },
  {
    url: '/api/column-lineage/stats',
    method: 'get',
    response: () => ({ code: 0, data: ColumnLineageStore.stats() })
  }
]