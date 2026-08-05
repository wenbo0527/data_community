/**
 * Column-level Lineage(字段级血缘)
 *
 * 现有 lineage 是 Table-level(表-表)
 * 本文件补充 Column-level(字段-字段)血缘
 *
 * 主流(Alation / DataHub)支持字段级血缘,本项目需要补齐
 */

import type { MockMethod } from 'vite-plugin-mock'
import { MetadataStore } from './metadata-store'

export interface ColumnLineageEdge {
  id: string
  sourceSchema: string
  sourceTable: string
  sourceColumn: string
  targetSchema: string
  targetTable: string
  targetColumn: string
  transform: string  // SQL/转换描述,如 'cast(target.col as decimal(18,2))'
  isDirect: boolean
  evidence?: string // 血缘来源证据(如 SQL、ETL 配置)
}

/**
 * 字段级血缘 mock 数据
 */
export const COLUMN_LINEAGE: ColumnLineageEdge[] = [
  // dim_user.id_card_no → fact_loan_apply.id_card_no(直接透传)
  {
    id: 'cl_001',
    sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'id_card_no',
    targetSchema: 'default', targetTable: 'fact_loan_apply', targetColumn: 'id_card_no',
    transform: 'direct',
    isDirect: true,
    evidence: 'JOIN dim_user ON user_id'
  },
  // dim_user.user_id → fact_loan_apply.user_id
  {
    id: 'cl_002',
    sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'user_id',
    targetSchema: 'default', targetTable: 'fact_loan_apply', targetColumn: 'user_id',
    transform: 'direct',
    isDirect: true,
    evidence: 'JOIN dim_user ON user_id'
  },
  // dim_user.mobile → fact_loan_apply.mobile
  {
    id: 'cl_003',
    sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'mobile',
    targetSchema: 'default', targetTable: 'fact_loan_apply', targetColumn: 'mobile',
    transform: 'direct',
    isDirect: true,
    evidence: 'JOIN dim_user ON user_id'
  },
  // dim_user.id_card_no → fact_user_event.id_card_no(脱敏后)
  {
    id: 'cl_004',
    sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'id_card_no',
    targetSchema: 'default', targetTable: 'fact_user_event', targetColumn: 'id_card_no',
    transform: 'md5(id_card_no)',
    isDirect: false,
    evidence: 'ETL: md5_hash.sql'
  },
  // fact_loan_apply.apply_amt → dws_user_value.total_credit
  {
    id: 'cl_005',
    sourceSchema: 'default', sourceTable: 'fact_loan_apply', sourceColumn: 'apply_amt',
    targetSchema: 'default', targetTable: 'dws_user_value', targetColumn: 'total_credit',
    transform: 'SUM(apply_amt) GROUP BY user_id',
    isDirect: false,
    evidence: 'dws_layer.sql line 45'
  },
  // fact_loan_apply.apply_id → fact_loan_apply.apply_no(衍生)
  {
    id: 'cl_006',
    sourceSchema: 'default', sourceTable: 'fact_loan_apply', sourceColumn: 'apply_id',
    targetSchema: 'default', targetTable: 'fact_loan_apply', targetColumn: 'apply_no',
    transform: "concat('LN', LPAD(apply_id, 10, '0'))",
    isDirect: false,
    evidence: '衍生字段'
  },
  // dim_user.user_id → dws_user_credit.user_id(聚合)
  {
    id: 'cl_007',
    sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'user_id',
    targetSchema: 'default', targetTable: 'dws_user_credit', targetColumn: 'user_id',
    transform: 'group_key',
    isDirect: true,
    evidence: '聚合主键'
  },
  // dim_user.creditScore → dws_risk_score.credit_score
  {
    id: 'cl_008',
    sourceSchema: 'default', sourceTable: 'dim_user', sourceColumn: 'creditScore',
    targetSchema: 'default', targetTable: 'dws_risk_score', targetColumn: 'credit_score',
    transform: 'direct',
    isDirect: true,
    evidence: 'DWD 同步'
  },
  // dws_user_value.total_credit → dws_user_value.used_credit(汇总)
  {
    id: 'cl_009',
    sourceSchema: 'default', sourceTable: 'dws_user_value', sourceColumn: 'total_credit',
    targetSchema: 'default', targetTable: 'dws_user_value', targetColumn: 'used_credit',
    transform: 'SUM(used_amt) WHERE status=approved',
    isDirect: false,
    evidence: 'DWS 内部汇总'
  },
  // dws_risk_score.credit_score → dws_risk_score.risk_level(衍生)
  {
    id: 'cl_010',
    sourceSchema: 'default', sourceTable: 'dws_risk_score', sourceColumn: 'credit_score',
    targetSchema: 'default', targetTable: 'dws_risk_score', targetColumn: 'risk_level',
    transform: "CASE WHEN credit_score>=800 THEN 'low' ...",
    isDirect: false,
    evidence: '衍生字段'
  }
]

/**
 * Column-level Lineage Store
 */
export const ColumnLineageStore = {
  list(): ColumnLineageEdge[] {
    return COLUMN_LINEAGE
  },

  /**
   * 上游血缘:从某字段出发,追溯它来自哪里
   */
  upstream(table: string, column: string): ColumnLineageEdge[] {
    return COLUMN_LINEAGE.filter(e =>
      e.targetTable === table && e.targetColumn === column
    )
  },

  /**
   * 下游血缘:从某字段出发,看它去了哪里
   */
  downstream(table: string, column: string): ColumnLineageEdge[] {
    return COLUMN_LINEAGE.filter(e =>
      e.sourceTable === table && e.sourceColumn === column
    )
  },

  /** 表的全部字段血缘 */
  byTable(tableName: string): ColumnLineageEdge[] {
    return COLUMN_LINEAGE.filter(e =>
      e.sourceTable === tableName || e.targetTable === tableName
    )
  },

  /** 字段是否被引用 */
  isFieldReferenced(table: string, column: string): boolean {
    return COLUMN_LINEAGE.some(e =>
      (e.sourceTable === table && e.sourceColumn === column) ||
      (e.targetTable === table && e.targetColumn === column)
    )
  },

  /** 影响分析:如果某字段改变,哪些下游会受影响 */
  impactOf(table: string, column: string): { table: string; column: string }[] {
    const downstream = this.downstream(table, column)
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

  stats() {
    const tables = new Set<string>()
    COLUMN_LINEAGE.forEach(e => {
      tables.add(e.sourceTable)
      tables.add(e.targetTable)
    })

    const direct = COLUMN_LINEAGE.filter(e => e.isDirect).length
    const derived = COLUMN_LINEAGE.filter(e => !e.isDirect).length

    return {
      totalEdges: COLUMN_LINEAGE.length,
      directEdges: direct,
      derivedEdges: derived,
      tables: tables.size
    }
  }
}

/**
 * HTTP Mock 端点
 */
export const columnLineageMocks: MockMethod[] = [
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
      const table = url.split('/').pop() || ''
      return { code: 0, data: ColumnLineageStore.byTable(table) }
    }
  },
  {
    url: '/api/column-lineage/stats',
    method: 'get',
    response: () => ({ code: 0, data: ColumnLineageStore.stats() })
  }
]