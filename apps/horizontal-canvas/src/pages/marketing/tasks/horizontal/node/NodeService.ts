import { getNodeLabel } from '@/utils/nodeTypes.js'
import { createVueShapeNode } from '../createVueShapeNode.js'

export type GraphLike = any

/**
 * 创建节点规格
 * 入参：nodeType(string)、config(any)、pos({ x:number; y:number })
 * 返回：Vue Shape 节点规格对象
 * 边界：标记 isConfigured=true；label 优先使用 config.nodeName 其后回退到类型标签
 */
export function createNodeSpec(nodeType: string, config: any, pos: { x: number; y: number }): any {
  const label = config?.nodeName || getNodeLabel(nodeType) || nodeType
  return createVueShapeNode({ id: `${nodeType}-${Date.now()}`, x: pos.x, y: pos.y, label, data: { type: nodeType, nodeType, config, isConfigured: true } })
}

/**
 * 统一更新节点（尺寸、端口映射、数据写回）
 * 入参：graph(GraphLike)、node(Cell)、nodeType(string)、config(any)
 * 返回：void
 * 边界：按 out-N 规则重映射出端口；移除旧端口并保持连接；写回 data/props 并触发 change:data
 */
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
        if (isOut) {
          const edges = (graph?.getOutgoingEdges?.(node) || []).filter((e: any) => {
            try { return e.getSourcePortId?.() === p.id } catch { return false }
          })
          edges.forEach((e: any) => { try { graph.removeEdge?.(e) } catch {} })
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
  try {
    const outgoing = graph?.getOutgoingEdges?.(node) || []
    const byPort: Record<string, any[]> = {}
    outgoing.forEach((e: any) => {
      const pid = (() => { try { return e.getSourcePortId?.() } catch { return null } })()
      if (!pid) return
      if (!byPort[pid]) byPort[pid] = []
      byPort[pid].push(e)
    })
    Object.keys(byPort).forEach((pid) => {
      const list = byPort[pid]
      if (Array.isArray(list) && list.length > 1) {
        list.slice(1).forEach((e: any) => { try { graph.removeEdge?.(e) } catch {} })
      }
    })
  } catch {}
  if (node.setProp) {
    if (node.setData) node.setData(spec.data)
    node.prop('data', spec.data)
    node.prop('nodeType', spec.data.nodeType)
    node.prop('headerTitle', spec.data.headerTitle)
    node.prop('displayLines', spec.data.displayLines)
    node.trigger('change:data', { current: spec.data, previous: node.getData?.() })
  }
}

/**
 * 保障开始节点存在
 * 入参：graph(GraphLike)
 * 返回：void
 * 场景：空画布或缺少 start 节点时自动补齐一个开始节点
 */
export function ensureStartNode(graph: GraphLike): void {
  console.log('initStart1111',graph)
  const nodes = graph.getNodes()
  console.log('nodes1111',nodes)
  const hasStart = nodes.some((n: any) => { const d = n.getData ? n.getData() : {}; return d?.type === 'start' || d?.nodeType === 'start' || String(n.id).includes('start') })
  if (hasStart) return
  const startNodeId = 'start-node'
  try {
    const rect = graph?.container?.getBoundingClientRect?.() || { width: 800, height: 600 }
    // 先创建规格以获取高度，再按容器垂直居中计算 y
    const draft = createVueShapeNode({ id: startNodeId, x: 60, y: 0, label: '开始', outCount: 1, data: { type: 'start', nodeType: 'start', isConfigured: true }, portsOptions: { includeIn: false, outIds: ['out'] } })
    const y = Math.max(20, Math.round(((rect.height || 600) - (draft?.height || 120)) / 2))
    const spec = { ...draft, y }
    graph.addNode(spec)
  } catch {
    graph.addNode(createVueShapeNode({ id: startNodeId, x: 60, y: 160, label: '开始', outCount: 1, data: { type: 'start', nodeType: 'start', isConfigured: true }, portsOptions: { includeIn: false, outIds: ['out'] } }))
  }
}
/*
用途：节点服务（创建规格、统一更新、起始节点保障）
说明：集中封装节点尺寸/端口映射/数据写回的统一路径，减少页面更新分散；必要时保障开始节点存在。
边界：不负责发布校验；端口映射遵循 out-N 规则与 in 端口回填；避免直接持久化。
*/
