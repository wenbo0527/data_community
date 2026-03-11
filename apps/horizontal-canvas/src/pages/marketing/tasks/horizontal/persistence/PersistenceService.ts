import { TaskStorage } from '@/utils/taskStorage.js'
import { getNodeLabel } from '@/utils/nodeTypes.js'
import { createVueShapeNode } from '../createVueShapeNode.js'

export type GraphLike = any

export function collectCanvasData(graph: GraphLike): { nodes: any[]; connections: any[] } {
  const nodes = (graph.getNodes?.() || []).map((n: any) => {
    try {
      const pos = n.getPosition?.() || { x: 0, y: 0 }
      const data = n.getData?.() || {}
      return { id: n.id, type: data.nodeType || data.type || 'node', x: pos.x, y: pos.y, label: data.nodeName || data.headerTitle || getNodeLabel(data.nodeType || data.type) || '', config: data.config || {}, isConfigured: data.isConfigured === true, branches: Array.isArray(data?.config?.branches) ? data.config.branches : [] }
    } catch {
      return { id: n.id, type: 'node', x: 0, y: 0, label: '未知节点', config: {}, isConfigured: false, branches: [] }
    }
  })
  const connections = (graph.getEdges?.() || []).map((e: any) => {
    try {
      const src = e.getSource?.() || {}
      const tgt = e.getTarget?.() || {}
      return { id: e.id, source: src.cell || (e.getSourceCell?.() ? e.getSourceCell().id : null), target: tgt.cell || (e.getTargetCell?.() ? e.getTargetCell().id : null), sourcePortId: e.getSourcePortId?.() || null, targetPortId: e.getTargetPortId?.() || null }
    } catch {
      return { id: e.id, source: null, target: null, sourcePortId: null, targetPortId: null }
    }
  })
  return { nodes, connections }
}

/**
 * 加载画布数据到 Graph
 * 入参：graph(GraphLike), canvasData({ nodes: any[]; connections: any[] })
 * 返回：boolean（加载是否成功）
 * 细节：
 * - 清空现有 cells 并逐个创建节点与连接
 * - 出端口不存在时按未占用 out-N 回填
 * - AB 分支按 out-N 与节点 config.branches 的 id 进行 branchId 修复
 */
export function loadCanvasData(graph: GraphLike, canvasData: { nodes: any[]; connections: any[] }): boolean {
  if (!canvasData || !Array.isArray(canvasData.nodes) || !Array.isArray(canvasData.connections)) return false
  try {
    try { graph.freeze?.() } catch {}
    graph.clearCells()
    const nodeMap = new Map<string, any>()
    const seenNodeIds = new Set<string>()
    const nodes = canvasData.nodes.filter((n: any) => {
      const id = String(n?.id || '')
      if (!id) return false
      if (seenNodeIds.has(id)) return false
      seenNodeIds.add(id)
      return true
    })
    nodes.forEach((nodeData: any) => {
      try {
        const position = nodeData.position || { x: nodeData.x || 100, y: nodeData.y || 100 }
        const labelText = nodeData.label || nodeData.data?.label || getNodeLabel(nodeData.type) || ''
        const nodeDataForGraph = { id: nodeData.id, x: position.x, y: position.y, label: labelText, data: { nodeType: nodeData.type, nodeName: labelText, headerTitle: labelText, config: nodeData.config || nodeData.data?.config || {}, level: nodeData.data?.level || 0, levelIndex: nodeData.data?.levelIndex || 0, isConfigured: nodeData.data?.isConfigured !== undefined ? nodeData.data.isConfigured : nodeData.isConfigured !== undefined ? nodeData.isConfigured : nodeData.type === 'start' ? true : false, branches: nodeData.branches || nodeData.data?.branches || (nodeData.config?.branches) || [] } }
        try {
          const existing = graph.getCellById?.(nodeData.id)
          if (existing) graph.removeNode?.(nodeData.id)
        } catch {}
        const node = createVueShapeNode(nodeDataForGraph)
        graph.addNode(node)
        nodeMap.set(nodeData.id, node)
      } catch {}
    })
    const seenConnKeys = new Set<string>()
    const connections = canvasData.connections.filter((e: any) => {
      const id = String(e?.id || '')
      const key = id || `${String(e.source)}->${String(e.target)}:${String(e.sourcePort || e.sourcePortId || '')}|${String(e.targetPort || e.targetPortId || '')}`
      if (seenConnKeys.has(key)) return false
      seenConnKeys.add(key)
      return true
    })
    connections.forEach((connectionData: any) => {
      try {
        const sourceNode = nodeMap.get(connectionData.source)
        const targetNode = nodeMap.get(connectionData.target)
        if (sourceNode && targetNode) {
          let sourcePort = connectionData.sourcePort || connectionData.sourcePortId || 'out'
          const targetPort = connectionData.targetPort || connectionData.targetPortId || 'in'
          try {
            const outPorts = (sourceNode.getPorts?.() || []).filter((p: any) => p?.group === 'out')
            const outIds = outPorts.map((p: any) => p.id)
            if (!outIds.includes(sourcePort)) {
              const used = new Set<string>()
              const existingEdges = graph.getOutgoingEdges?.(sourceNode) || []
              existingEdges.forEach((ed: any) => { try { const pid = ed.getSourcePortId?.(); if (pid) used.add(pid) } catch {} })
              const firstFree = outIds.find((id: string) => !used.has(id)) || outIds[0] || sourcePort
              sourcePort = firstFree
            }
          } catch {}
          const edge = graph.addEdge({ id: connectionData.id, source: { cell: connectionData.source, port: sourcePort }, target: { cell: connectionData.target, port: targetPort }, router: { name: 'normal' }, connector: { name: 'smooth' }, attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, targetMarker: { name: 'block', args: { size: 6, fill: '#4C78FF' } }, strokeLinecap: 'round', strokeLinejoin: 'round' } }, zIndex: 1, data: { branchId: connectionData.branchId || null, label: connectionData.label || '' } })
          try {
            const srcData = sourceNode.getData?.() || {}
            const srcType = srcData?.type || srcData?.nodeType
            if (edge && srcType === 'ab-test' && !edge.getData?.()?.branchId) {
              const match = /^out-(\d+)$/.exec(sourcePort)
              const branches = Array.isArray(srcData?.config?.branches) ? srcData.config.branches : []
              if (match) {
                const idx = Number(match[1])
                const b = branches[idx]
                if (b && b.id) { try { edge.setData({ ...(edge.getData?.() || {}), branchId: b.id }) } catch {} }
              }
            }
          } catch {}
        }
      } catch {}
    })
    try { graph.unfreeze?.() } catch {}
    return true
  } catch { return false }
}

/**
 * 保存任务（草稿）
 * 入参：meta(any 任务元信息), canvasData(any 画布数据)
 * 返回：Task 对象
 */
export function saveTask(meta: any, canvasData: any): any {
  return TaskStorage.createTask({ ...meta, canvasData })
}

/**
 * 发布任务（状态置为 published）
 * 入参：meta(any 任务元信息), canvasData(any 画布数据)
 * 返回：Task 对象
 */
export function publishTask(meta: any, canvasData: any): any {
  return TaskStorage.createTask({ ...meta, canvasData, status: 'published' })
}

/**
 * 发布校验（结构/配置/连通性/端口与分支完整性）
 * 入参：graph(GraphLike), canvasData({ nodes: any[]; connections: any[] })
 * 返回：{ pass: boolean; messages: string[] }
 * 细节：
 * - 缺少开始节点/空画布/未配置节点/无出边节点
 * - 端口完整性：每个节点的 out 端口需有连接
 * - 分支完整性：分流/AB 节点每个分支需存在连线（按 edge.data.branchId 对齐）
 */
export function validateForPublish(graph: GraphLike, canvasData: { nodes: any[]; connections: any[] }): { pass: boolean; messages: string[] } {
  const messages: string[] = []
  if (!canvasData || !Array.isArray(canvasData.nodes) || !Array.isArray(canvasData.connections)) return { pass: false, messages: ['画布数据格式不正确'] }
  if (canvasData.nodes.length === 0) messages.push('画布中没有任何节点')
  const byId = new Map<string, any>()
  canvasData.nodes.forEach((n: any) => byId.set(n.id, n))
  const outgoing = new Map<string, number>()
  const incoming = new Map<string, number>()
  canvasData.connections.forEach((e: any) => { if (!e.source || !e.target) return; outgoing.set(e.source, (outgoing.get(e.source) || 0) + 1); incoming.set(e.target, (incoming.get(e.target) || 0) + 1) })
  const hasStart = canvasData.nodes.some((n: any) => n.type === 'start')
  if (!hasStart) messages.push('缺少开始节点')
  const unconfiguredByConfig: any[] = []
  const unconfiguredByFlag: any[] = []
  canvasData.nodes.forEach((n: any) => { if (n.type === 'start' || n.type === 'end') return; const cfg = n.config || {}; const configuredFlag = n.isConfigured === true; if (!cfg || Object.keys(cfg).length === 0) unconfiguredByConfig.push(n); if (!configuredFlag) unconfiguredByFlag.push(n) })
  if (unconfiguredByConfig.length > 0 || unconfiguredByFlag.length > 0) { const idSet = new Set<string>(); const merged = [...unconfiguredByConfig, ...unconfiguredByFlag].filter((n: any) => { if (idSet.has(n.id)) return false; idSet.add(n.id); return true }); messages.push(`存在未完成配置的节点: ${merged.map((n: any) => `${n.label || n.id}`).join(', ')}`) }
  const noOut = canvasData.nodes.filter((n: any) => n.type !== 'end' && (outgoing.get(n.id) || 0) === 0)
  if (noOut.length > 0) messages.push(`存在未连接后续节点的节点: ${noOut.map((n: any) => `${n.label || n.id}`).join(', ')}`)
  try {
    const ids = new Set<string>(canvasData.nodes.map(n => String(n.id)))
    const adj = new Map<string, string[]>()
    ids.forEach(id => adj.set(id, []))
    canvasData.connections.forEach((e: any) => { const s = String(e.source || ''); const t = String(e.target || ''); if (ids.has(s) && ids.has(t)) (adj.get(s) || []).push(t) })
    const WHITE = 0, GRAY = 1, BLACK = 2
    const color = new Map<string, number>()
    ids.forEach(id => color.set(id, WHITE))
    let cyclePath: string[] = []
    let hasCycle = false
    const stack: string[] = []
    const dfs = (u: string): boolean => {
      color.set(u, GRAY)
      stack.push(u)
      const ns = adj.get(u) || []
      for (let i = 0; i < ns.length; i++) {
        const v = ns[i]
        const c = color.get(v) || WHITE
        if (c === WHITE) { if (dfs(v)) return true }
        else if (c === GRAY) { const idx = stack.lastIndexOf(v); cyclePath = stack.slice(idx); hasCycle = true; return true }
      }
      stack.pop()
      color.set(u, BLACK)
      return false
    }
    for (const id of ids) { if ((color.get(id) || WHITE) === WHITE) { if (dfs(id)) break } }
    if (hasCycle) {
      const cycleLabels = cyclePath.map(id => {
        const n = byId.get(id)
        const label = (n && (n.label || (n.data && n.data.label))) || String(id)
        return `${label}(${id})`
      })
      messages.push(`存在环路: ${cycleLabels.join(' -> ')}`)
    }
  } catch {}
  try {
    if (graph) {
      const missingPortConnections: string[] = []
      const missingBranchConnections: string[] = []
      const x6Nodes = graph.getNodes?.() || []
      x6Nodes.forEach((node: any) => {
        const nodeId = node.id
        const nodeData = node.getData?.() || {}
        const nodeType = nodeData.type || nodeData.nodeType || byId.get(nodeId)?.type
        const ports = (node.getPorts?.() || []).filter((p: any) => p?.group === 'out')
        if (ports.length > 0 && nodeType !== 'end') {
          const outs = graph.getOutgoingEdges?.(node) || []
          const realOuts = outs.filter((e: any) => { try { const s = e.getSourceCellId?.(); const t = e.getTargetCellId?.(); return !!s && !!t } catch { return false } })
          const connectedPortIds = new Set<string>()
          realOuts.forEach((e: any) => { try { const pid = e.getSourcePortId?.(); if (pid) connectedPortIds.add(pid) } catch {} })
          ports.forEach((p: any) => { if (!connectedPortIds.has(p.id)) missingPortConnections.push(`${byId.get(nodeId)?.label || nodeId}#${p.id}`) })
        }
        if (['audience-split', 'event-split', 'ab-test'].includes(String(nodeType))) {
          const branches = nodeData.branches || byId.get(nodeId)?.data?.branches || []
          if (Array.isArray(branches) && branches.length > 0) {
            const outs = graph.getOutgoingEdges?.(node) || []
            const realOuts = outs.filter((e: any) => { try { return !!e.getSourceCellId?.() && !!e.getTargetCellId?.() } catch { return false } })
            branches.forEach((b: any) => { const ok = realOuts.some((e: any) => { try { const bd = e.getData?.() || {}; return bd.branchId === b.id } catch { return false } }); if (!ok) missingBranchConnections.push(`${byId.get(nodeId)?.label || nodeId}:${b.label || b.id}`) })
          }
        }
      })
      if (missingPortConnections.length > 0) messages.push(`以下节点的出端口未连接: ${missingPortConnections.join(', ')}`)
      if (missingBranchConnections.length > 0) messages.push(`以下分流分支未连接: ${missingBranchConnections.join(', ')}`)
    }
  } catch {}
  return { pass: messages.length === 0, messages }
}
/*
用途：持久化服务（采集/加载/保存/发布/发布校验）
说明：集中管理画布数据流转与校验逻辑，提供页面调用的统一入口；与 TaskStorage 集成。
边界：不负责 UI；加载时做端口回填与分支标识修复；发布校验覆盖结构/配置/连通性/端口与分支完整性。
*/
