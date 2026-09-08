/**
 * 完整血缘链路(资源→要素) - 占位
 */
export type LineageNodeType = 'table' | 'field' | 'metric' | 'variable' | 'feature' | 'business_element'

export interface LineageNode {
  id: string
  type: LineageNodeType
  label: string
  meta?: Record<string, any>
}

export interface LineageEdge {
  id: string
  source: string
  target: string
  type: 'derives_from' | 'feeds_into' | 'transforms_to'
}

export interface LineageGraph {
  nodes: LineageNode[]
  edges: LineageEdge[]
}

const MOCK_GRAPHS: Record<string, LineageGraph> = {
  dim_user: {
    nodes: [
      { id: 'ods_user', type: 'table', label: 'ods_user' },
      { id: 'dim_user', type: 'table', label: 'dim_user' },
      { id: 'dws_user_value', type: 'table', label: 'dws_user_value' },
      { id: 'metric_dau', type: 'metric', label: 'DAU' },
      { id: 'feature_age', type: 'feature', label: '用户年龄' }
    ],
    edges: [
      { id: 'e1', source: 'ods_user', target: 'dim_user', type: 'transforms_to' },
      { id: 'e2', source: 'dim_user', target: 'dws_user_value', type: 'derives_from' },
      { id: 'e3', source: 'dim_user', target: 'metric_dau', type: 'feeds_into' },
      { id: 'e4', source: 'dim_user', target: 'feature_age', type: 'feeds_into' }
    ]
  }
}

export const LineageGraphStore = {
  get(tableName: string): LineageGraph {
    return MOCK_GRAPHS[tableName] || { nodes: [], edges: [] }
  },
  buildFromTable(tableName: string): LineageGraph { return this.get(tableName) },
  buildFromElement(elementId: string): LineageGraph { return { nodes: [], edges: [] } },
  buildLineage(tableName: string): LineageGraph { return this.get(tableName) }
}

export function buildLineageFromTable(tableName: string) { return LineageGraphStore.get(tableName) }
export function buildLineageFromElement(elementId: string) { return { nodes: [], edges: [] } }
export function buildLineage(tableName: string) { return LineageGraphStore.get(tableName) }

export const lineageGraphMocks = []
export default LineageGraphStore