/**
 * Column-level Lineage composable
 *
 * 用法:
 *   const { upstream, downstream, impact, hasLineage } = useColumnLineage()
 *   upstream('dim_user', 'id_card_no')  // 上游血缘
 *   impact('dim_user', 'id_card_no')    // 影响分析
 */

import { ColumnLineageStore } from '@/mock/shared/column-lineage'

export function useColumnLineage() {
  const upstream = ColumnLineageStore.upstream
  const downstream = ColumnLineageStore.downstream
  const impact = ColumnLineageStore.impactOf
  const hasLineage = ColumnLineageStore.isFieldReferenced
  const byTable = ColumnLineageStore.byTable
  const stats = ColumnLineageStore.stats

  /**
   * 字段血缘字符串描述(用于 tooltip)
   */
  const describeLineage = (table: string, column: string): string => {
    const up = upstream(table, column)
    const down = downstream(table, column)
    const lines: string[] = []
    if (up.length > 0) {
      lines.push(`↑ 上游 ${up.length} 条:`)
      up.forEach(e => lines.push(`  ${e.sourceTable}.${e.sourceColumn} → ${e.transform}`))
    }
    if (down.length > 0) {
      lines.push(`↓ 下游 ${down.length} 条:`)
      down.forEach(e => lines.push(`  → ${e.targetTable}.${e.targetColumn} (${e.transform})`))
    }
    return lines.length > 0 ? lines.join('\n') : '该字段无血缘信息'
  }

  return {
    upstream,
    downstream,
    impact,
    hasLineage,
    byTable,
    stats,
    describeLineage
  }
}