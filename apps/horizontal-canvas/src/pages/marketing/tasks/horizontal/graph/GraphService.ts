export type GraphLike = any
import { MiniMap } from '@antv/x6-plugin-minimap'
import { History } from '@antv/x6-plugin-history'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import { Graph } from '@antv/x6'

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

export function createGraph(container: HTMLElement, options: any = {}): any {
  return new Graph({
    container,
    background: { color: '#ffffff', opacity: 0.8 },
    grid: { size: 20, visible: true, type: 'dot', color: '#e2e8f0', thickness: 1, opacity: 0.6 },
    scroller: { enabled: true, pannable: false, cursor: 'grab' },
    snapline: { enabled: true, tolerance: 8, sharp: true, stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '6,4', opacity: 0.8 },
    panning: { enabled: true, eventTypes: ['leftMouseDown'] },
    mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'], factor: 1.15, maxScale: 3, minScale: 0.1 },
    history: { enabled: false },
    highlighting: { magnetAvailable: { name: 'stroke', args: { padding: 8, attrs: { stroke: '#3b82f6', 'stroke-width': 2, 'stroke-dasharray': '4,4' } } }, magnetAdsorbed: { name: 'stroke', args: { padding: 10, attrs: { stroke: '#2563eb', 'stroke-width': 2.5, 'stroke-dasharray': 'none' } } } },
    ...options
  })
}

export function bindDefaultShortcuts(graph: GraphLike, handlers: { handleUndo?: () => void; handleRedo?: () => void; handleZoomIn?: () => void; handleZoomOut?: () => void }) {
  if (!graph || !graph.bindKey) return
  graph.bindKey(['ctrl+z', 'cmd+z'], () => { try { if (graph.canUndo?.()) handlers.handleUndo?.() } catch {} return false })
  graph.bindKey(['ctrl+y', 'cmd+y', 'ctrl+shift+z', 'cmd+shift+z'], () => { try { if (graph.canRedo?.()) handlers.handleRedo?.() } catch {} return false })
  graph.bindKey(['ctrl+plus', 'cmd+plus', 'ctrl+=', 'cmd+='], () => { handlers.handleZoomIn?.(); return false })
  graph.bindKey(['ctrl+-', 'cmd+-'], () => { handlers.handleZoomOut?.(); return false })
}

export function configureSelectionRubberbandGate(selectionPlugin: any, graph: GraphLike) {
  const modifierPressed = { value: false }
  const handleKeyDown = (e: KeyboardEvent) => {
    const pressed = !!(e && (e.ctrlKey || (e as any).metaKey))
    if (pressed && !modifierPressed.value) {
      modifierPressed.value = true
      try { selectionPlugin?.enableRubberband && selectionPlugin.enableRubberband() } catch {}
      try { graph?.disablePanning && graph.disablePanning() } catch {}
    }
  }
  const handleKeyUp = (e: KeyboardEvent) => {
    const pressed = !!(e && (e.ctrlKey || (e as any).metaKey))
    if (!pressed && modifierPressed.value) {
      modifierPressed.value = false
      try { selectionPlugin?.disableRubberband && selectionPlugin.disableRubberband() } catch {}
      try { graph?.enablePanning && graph.enablePanning() } catch {}
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }
  return { handleKeyDown, handleKeyUp }
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
