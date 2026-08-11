/**
 * 字段血缘工具
 */
export function useColumnLineage() {
  return {
    getUpstream(field: string): string[] { return [] },
    getDownstream(field: string): string[] { return [] },
    buildGraph(table: string) { return { nodes: [], edges: [] } }
  }
}

export default useColumnLineage