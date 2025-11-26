// 轻量预览线系统，接口对齐
export function usePreviewLine(graph) {
  const state = { previews: new Map(), previewsByNode: new Map() }
  function initializeFromGraph() {}
  function getPreviewLineByNode(nodeId) { const id = state.previewsByNode.get(String(nodeId)); return id ? state.previews.get(id) || null : null }
  function createPreviewLine(sourceNodeId, options = {}) {
    try {
      const src = graph.getCellById(sourceNodeId)
      if (!src) return null
      if (state.previewsByNode.has(String(sourceNodeId))) return state.previews.get(state.previewsByNode.get(String(sourceNodeId))) || null
      const edge = graph.createEdge({
        source: { cell: sourceNodeId },
        target: { x: (options.x || 0) + 80, y: (options.y || 0) },
        attrs: { line: { stroke: '#22c55e', strokeWidth: 2, targetMarker: { name: 'classic', size: 8 }, strokeDasharray: '6 3', opacity: 0.7 } },
        data: { isPreview: true }
      })
      graph.addEdge(edge)
      const id = String(edge.id)
      state.previews.set(id, edge)
      state.previewsByNode.set(String(sourceNodeId), id)
      return id
    } catch { return null }
  }
  function convertPreviewToConnection(previewId, targetNodeId) {
    const edge = state.previews.get(previewId)
    if (!edge) return null
    try {
      const sourceId = edge.getSourceCellId?.() || (edge.source && edge.source.cell) || null
      edge.setTarget({ cell: targetNodeId })
      edge.setAttrs({ line: { stroke: '#4C78FF', strokeWidth: 2, targetMarker: { name: 'classic', size: 8 }, strokeDasharray: null, opacity: 1 } })
      edge.setData({ isPreview: false, isConnection: true })
      state.previews.delete(previewId)
      if (sourceId) state.previewsByNode.delete(String(sourceId))
      return edge
    } catch { return null }
  }
  function removePreviewLine(previewId) {
    const edge = state.previews.get(previewId)
    if (!edge) return false
    try {
      const sourceId = edge.getSourceCellId?.() || (edge.source && edge.source.cell) || null
      graph.removeEdge(edge)
      state.previews.delete(previewId)
      if (sourceId) state.previewsByNode.delete(String(sourceId))
      return true
    } catch { return false }
  }
  function removePreviewByNode(nodeId) { const id = state.previewsByNode.get(String(nodeId)); if (!id) return false; return removePreviewLine(id) }
  function validatePreviewLines() {}
  function handleNodeRemoved() {}
  function restorePreviewLinesAfterConnectionDelete() {}
  return { initializeFromGraph, createPreviewLine, convertPreviewToConnection, removePreviewLine, removePreviewByNode, getPreviewLineByNode, validatePreviewLines, handleNodeRemoved, restorePreviewLinesAfterConnectionDelete }
}

export default { usePreviewLine }
