export function computeSelectorFromAnchor(anchorRect: { left: number; bottom: number; width: number }, contentRect: { left: number; top: number }, graph: any) {
  const x = anchorRect.left - contentRect.left + anchorRect.width / 2
  const y = anchorRect.bottom - contentRect.top + 8
  const pageX = anchorRect.left + anchorRect.width / 2
  const pageY = anchorRect.bottom + 8
  const local = graph && graph.pageToLocal ? graph.pageToLocal(pageX, pageY) : { x, y }
  return { selectorPos: { x, y }, pendingPoint: { x: local.x, y: local.y } }
}

export function computeSelectorCenter(containerRect: { left: number; top: number; width: number; height: number }, graph: any) {
  const x = containerRect.width / 2
  const y = containerRect.height / 2
  const pageX = containerRect.left + containerRect.width / 2
  const pageY = containerRect.top + containerRect.height / 2
  const local = graph && graph.pageToLocal ? graph.pageToLocal(pageX, pageY) : { x, y }
  return { selectorPos: { x, y }, pendingPoint: { x: local.x, y: local.y } }
}

export function insertNodeFromSelector(graph: any, nodeType: string, pendingPoint: { x: number; y: number }, pendingInsertionEdge: any, getNodeLabel: (t: string) => string, createVueShapeNode: (spec: any) => any) {
  if (!graph || !nodeType || !pendingPoint) return null
  if (nodeType === 'audience-split') nodeType = 'crowd-split'
  const label = (getNodeLabel && getNodeLabel(nodeType)) || nodeType
  const fourOutTypes = ['audience-split', 'crowd-split', 'event-split', 'ab-test']
  const outCount = fourOutTypes.includes(nodeType) ? 4 : 1
  const newNodeId = `${nodeType}-${Date.now()}`
  console.log('insertNodeFromSelector11111',{ id: newNodeId, x: pendingPoint.x, y: pendingPoint.y, label, outCount, data: { type: nodeType, nodeType, isConfigured: false } })
  const node = graph.addNode(createVueShapeNode({ id: newNodeId, x: pendingPoint.x, y: pendingPoint.y, label, outCount, data: { type: nodeType, nodeType, isConfigured: false } }))
  console.log('addNode11111',node);
  if (pendingInsertionEdge) {
    try {
      const source = pendingInsertionEdge.getSource?.()
      const target = pendingInsertionEdge.getTarget?.()
      graph.removeEdge?.(pendingInsertionEdge.id)
      graph.addEdge({ source: { cell: source.cell, port: source.port }, target: { cell: newNodeId, port: 'in' }, router: { name: 'normal' }, connector: { name: 'smooth' }, attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } } })
      graph.addEdge({ source: { cell: newNodeId, port: 'out-0' }, target: { cell: target.cell, port: target.port }, router: { name: 'normal' }, connector: { name: 'smooth' }, attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } } })
    } catch {}
  }
  return node
}

export function insertNodeAndFinalize(
  graph: any,
  nodeType: string,
  pendingPoint: { x: number; y: number },
  pendingInsertionEdge: any,
  getNodeLabel: (t: string) => string,
  createVueShapeNode: (spec: any) => any,
  finalize?: { onPersist?: (graph: any, node: any) => void; onAfter?: (node: any) => void }
) {
  const node = insertNodeFromSelector(graph, nodeType, pendingPoint, pendingInsertionEdge, getNodeLabel, createVueShapeNode)
  try { graph.cleanSelection && graph.cleanSelection() } catch {}
  try { finalize?.onPersist && finalize.onPersist(graph, node) } catch {}
  try { finalize?.onAfter && finalize.onAfter(node) } catch {}
  return node
}
/*
用途：节点插入组合式（选择器定位、插入与收尾）
说明：计算选择器位置与待创建坐标，统一插入节点并处理两段边重连、历史入栈与持久化回调。
边界：不进行发布校验；端口修正按 out-0 映射简化；类型归一（audience-split→crowd-split）。
*/
