export type GraphLike = any

export function applyQuickLayout(graph: GraphLike, options: any = {}): void {
  cleanupEdgeVertices(graph)
}
export function applyStructuredLayout(graph: GraphLike, options: any = {}): void {
  cleanupEdgeVertices(graph)
}
export function cleanupEdgeVertices(graph: GraphLike): void {
  try {
    const edges = graph?.getEdges?.() || []
    edges.forEach((e: any) => { try { e && e.setVertices && e.setVertices([]) } catch {} })
  } catch {}
}
