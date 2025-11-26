import { getNodeLabel } from '@/utils/nodeTypes.js'
import { createVueShapeNode } from '../createVueShapeNode.js'

export type GraphLike = any

export function createNodeSpec(nodeType: string, config: any, pos: { x: number; y: number }): any {
  const label = config?.nodeName || getNodeLabel(nodeType) || nodeType
  return createVueShapeNode({ id: `${nodeType}-${Date.now()}`, x: pos.x, y: pos.y, label, data: { type: nodeType, nodeType, config, isConfigured: true } })
}

export function updateNodeUnified(graph: GraphLike, node: any, nodeType: string, config: any): void {
  const pos = node.getPosition?.() || { x: 0, y: 0 }
  const label = config?.nodeName || getNodeLabel(nodeType) || nodeType
  const spec = createVueShapeNode({ id: node.id, x: pos.x, y: pos.y, label, data: { type: nodeType, nodeType, config, isConfigured: true } })
  node.resize(spec.width, spec.height)
  const existingPorts = node.getPorts ? node.getPorts() : []
  const existingIds = new Set((existingPorts || []).map((p: any) => p.id))
  const specIds = new Set((spec.ports.items || []).map((p: any) => p.id))
  if (node.setProp) node.setProp('ports/groups', spec.ports.groups)
  ;(existingPorts || []).forEach((p: any) => {
    if (!specIds.has(p.id)) {
      try {
        const isOut = p.group === 'out'
        const edges = graph?.getConnectedEdges?.(node) || []
        const outgoing = edges.filter((e: any) => {
          try { return e.getSourceCellId?.() === node.id && e.getSourcePortId?.() === p.id } catch { return false }
        })
        let targetNewPortId: string | null = null
        if (isOut) {
          const match = /^out-(\d+)$/.exec(p.id)
          const newOutIds = Array.from(specIds).filter((id: any) => /^out-\d+$/.test(String(id))).sort((a: any, b: any) => Number(String(a).split('-')[1]) - Number(String(b).split('-')[1]))
          if (match) {
            const num = Number(match[1])
            const clamped = Math.max(0, Math.min(num, newOutIds.length - 1))
            targetNewPortId = (newOutIds as string[])[clamped] || (newOutIds as string[])[0] || null
          } else {
            targetNewPortId = (newOutIds as string[])[0] || null
          }
        } else {
          targetNewPortId = specIds.has('in') ? 'in' : null
        }
        if (targetNewPortId) {
          outgoing.forEach((e: any) => { try { e.setSource({ cell: node.id, port: targetNewPortId }) } catch {} })
        }
        node.removePort?.(p.id)
      } catch {}
    }
  })
  if (spec.ports.items && spec.ports.items.length) {
    spec.ports.items.forEach((it: any) => {
      if (existingIds.has(it.id)) {
        try {
          node.setPortProp?.(it.id, 'group', it.group)
          if (it.args != null) node.setPortProp?.(it.id, 'args', it.args)
          if (it.attrs?.circle) {
            const c = it.attrs.circle
            if (c['data-port'] != null) node.setPortProp?.(it.id, 'attrs/circle/data-port', c['data-port'])
            if (c['data-port-group'] != null) node.setPortProp?.(it.id, 'attrs/circle/data-port-group', c['data-port-group'])
            if (c['data-port-type'] != null) node.setPortProp?.(it.id, 'attrs/circle/data-port-type', c['data-port-type'])
          }
        } catch {}
      } else {
        node.addPort && node.addPort(it)
      }
    })
  }
  if (node.setProp) {
    if (node.setData) node.setData(spec.data)
    node.prop('data', spec.data)
    node.prop('nodeType', spec.data.nodeType)
    node.prop('headerTitle', spec.data.headerTitle)
    node.prop('displayLines', spec.data.displayLines)
    node.trigger('change:data', { current: spec.data, previous: node.getData?.() })
  }
}

export function ensureStartNode(graph: GraphLike): void {
  const nodes = graph.getNodes()
  const hasStart = nodes.some((n: any) => { const d = n.getData ? n.getData() : {}; return d?.type === 'start' || d?.nodeType === 'start' || String(n.id).includes('start') })
  if (hasStart) return
  const startNodeId = 'start-node'
  graph.addNode(createVueShapeNode({ id: startNodeId, x: 80, y: 160, label: '开始', outCount: 1, data: { type: 'start', nodeType: 'start', isConfigured: true }, portsOptions: { includeIn: false, outIds: ['out'] } }))
}
