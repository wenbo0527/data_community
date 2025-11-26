export type GraphLike = any
import { MiniMap } from '@antv/x6-plugin-minimap'
import { History } from '@antv/x6-plugin-history'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'

export function create(container: HTMLElement, options: any): GraphLike {
  return null
}

export function zoomIn(graph: GraphLike): void {}
export function zoomOut(graph: GraphLike): void {}
export function zoomTo(graph: GraphLike, scale: number): void {}
export function centerContent(graph: GraphLike): void {}
export function toggleMinimap(graph: GraphLike, container: HTMLElement | null, visible: boolean, options: any = {}): any {
  if (!graph) return null
  if (visible) {
    if (!container) return null
    const minimap = new MiniMap({ container, ...options })
    try { graph.use(minimap) } catch {}
    return minimap
  } else {
    try { graph.disposePlugin('minimap') } catch {}
    return null
  }
}

export function useHistory(graph: GraphLike, options: any = {}): any {
  const plugin = new History(options)
  try { graph.use(plugin) } catch {}
  return plugin
}

export function useKeyboard(graph: GraphLike, options: any = {}): any {
  const plugin = new Keyboard(options)
  try { graph.use(plugin) } catch {}
  return plugin
}

export function useSelection(graph: GraphLike, options: any = {}): any {
  const plugin = new Selection(options)
  try { graph.use(plugin) } catch {}
  return plugin
}

export function addNode(graph: GraphLike, spec: any): any { return null }
export function removeNode(graph: GraphLike, id: string): void {}
export function addEdge(graph: GraphLike, spec: any): any { return null }
export function removeEdge(graph: GraphLike, id: string): void {}
export function deleteNodeCascade(graph: GraphLike, id: string): void {}

export function bindConnectionPolicies(graph: GraphLike, ctx: { isViewMode: () => boolean; isPanning: () => boolean; Message?: { warning: (msg: string) => void } }) {
  function validateConnection({ sourceMagnet, targetMagnet, sourceView, targetView, edge }: any) {
    if (ctx.isPanning?.()) return false
    if (ctx.isViewMode?.()) return false
    if (!sourceMagnet || !targetMagnet) return false
    const sg = sourceMagnet.getAttribute('port-group') || sourceMagnet.getAttribute('data-port-group')
    const tg = targetMagnet.getAttribute('port-group') || targetMagnet.getAttribute('data-port-group')
    if (sg !== 'out' || tg !== 'in') return false
    const srcCell = sourceView?.cell
    const sourcePortId = sourceMagnet.getAttribute('port') || sourceMagnet.getAttribute('data-port') || sourceMagnet.getAttribute('data-port-id')
    const exists = (graph.getOutgoingEdges?.(srcCell) || []).some((e: any) => {
      try {
        if (edge && e.id === edge.id) return false
        return e.getSourcePortId?.() === sourcePortId
      } catch { return false }
    })
    if (exists) { try { ctx.Message?.warning?.('该源端口已存在连接，不能重复连接') } catch {}; return false }
    return true
  }
  function validateMagnet({ magnet, view }: any) {
    if (!magnet) return false
    if (ctx.isViewMode?.()) return false
    const g = magnet.getAttribute('port-group') || magnet.getAttribute('data-port-group')
    if (g !== 'out') return false
    const sourcePortId = magnet.getAttribute('port') || magnet.getAttribute('data-port') || magnet.getAttribute('data-port-id')
    const cell = view?.cell
    if (cell && sourcePortId) {
      const exists = (graph.getOutgoingEdges?.(cell) || []).some((e: any) => {
        try { return e.getSourcePortId?.() === sourcePortId } catch { return false }
      })
      if (exists) { try { ctx.Message?.warning?.('该源端口已存在连接，不能重复连接') } catch {}; return false }
    }
    return true
  }
  return { validateConnection, validateMagnet }
}
