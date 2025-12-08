export type GraphLike = any
import { MiniMap } from '@antv/x6-plugin-minimap'
import { History } from '@antv/x6-plugin-history'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import { Graph } from '@antv/x6'

/**
 * 创建通用 Graph 实例（占位 API）
 * 入参：container(HTMLElement) 容器元素；options(any) X6 Graph 额外配置
 * 返回：GraphLike（X6 Graph 实例或 null）
 * 场景：页面装配阶段创建图；当前占位，统一走 createGraph 以使用默认配置
 */
export function create(container: HTMLElement, options: any): GraphLike {
  return null
}

/**
 * 缩放放大一步
 * 入参：graph(GraphLike)
 * 返回：void
 * 场景：工具栏/快捷键触发
 */
export function zoomIn(graph: GraphLike): void {}
/**
 * 缩放缩小一步
 * 入参：graph(GraphLike)
 * 返回：void
 * 场景：工具栏/快捷键触发
 */
export function zoomOut(graph: GraphLike): void {}
/**
 * 缩放到指定比例
 * 入参：graph(GraphLike), scale(number 0.1–3)
 * 返回：void
 * 场景：下拉选择固定比例或代码设定比例
 */
export function zoomTo(graph: GraphLike, scale: number): void {}
/**
 * 视图居中到内容
 * 入参：graph(GraphLike)
 * 返回：void
 * 场景：快速布局/加载完成后适配视图
 */
export function centerContent(graph: GraphLike, options: { padding?: number; preserveZoom?: boolean } = {}): void {
  if (!graph) return
  const z = typeof graph.zoom === 'function' ? graph.zoom() : 1
  const padding = options.padding
  const preserve = options.preserveZoom !== false
  try {
    if (typeof graph.centerContent === 'function') {
      if (padding != null) graph.centerContent({ padding })
      else graph.centerContent()
    } else if (typeof graph.center === 'function') {
      graph.center()
    }
    if (preserve && typeof graph.zoom === 'function') {
      if (typeof graph.zoomTo === 'function') graph.zoomTo(z)
      else graph.zoom(z)
    }
  } catch {}
}
/**
 * 小地图显隐与生命周期管理
 * 入参：graph(GraphLike), container(HTMLElement|null), visible(boolean), options(any)
 * 返回：MiniMap 实例或 null
 * 场景：工具栏切换小地图；销毁时调用 disposePlugin('minimap')
 */
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

/**
 * 注册 History 插件
 * 入参：graph(GraphLike), options(any)
 * 返回：History 插件实例
 * 场景：撤销/重做与历史栈管理
 */
export function useHistory(graph: GraphLike, options: any = {}): any {
  const plugin = new History(options)
  try { graph.use(plugin) } catch {}
  return plugin
}

/**
 * 注册 Keyboard 插件
 * 入参：graph(GraphLike), options(any)
 * 返回：Keyboard 插件实例
 * 场景：绑定快捷键（与 bindDefaultShortcuts 配合）
 */
export function useKeyboard(graph: GraphLike, options: any = {}): any {
  const plugin = new Keyboard(options)
  try { graph.use(plugin) } catch {}
  return plugin
}

/**
 * 注册 Selection 插件
 * 入参：graph(GraphLike), options(any)
 * 返回：Selection 插件实例
 * 场景：多选/橡皮框选择（与 configureSelectionRubberbandGate 配合）
 */
export function useSelection(graph: GraphLike, options: any = {}): any {
  const plugin = new Selection(options)
  try { graph.use(plugin) } catch {}
  return plugin
}

/**
 * 创建 Graph（带默认配置）
 * 入参：container(HTMLElement), options(any)
 * 返回：X6 Graph 实例
 * 场景：页面装配创建图；默认开启背景/网格/滚轮/高亮等
 */
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

/**
 * 绑定默认快捷键
 * 入参：graph(GraphLike), handlers({ handleUndo, handleRedo, handleZoomIn, handleZoomOut })
 * 返回：void
 * 场景：统一映射 Ctrl/Cmd 组合键到页面处理函数
 */
export function bindDefaultShortcuts(graph: GraphLike, handlers: { handleUndo?: () => void; handleRedo?: () => void; handleZoomIn?: () => void; handleZoomOut?: () => void; handleCopy?: () => void; handlePaste?: () => void }) {
  if (!graph || !graph.bindKey) return
  graph.bindKey(['ctrl+z', 'cmd+z'], () => { try { if (graph.canUndo?.()) handlers.handleUndo?.() } catch {} return false })
  graph.bindKey(['ctrl+y', 'cmd+y', 'ctrl+shift+z', 'cmd+shift+z'], () => { try { if (graph.canRedo?.()) handlers.handleRedo?.() } catch {} return false })
  graph.bindKey(['ctrl+plus', 'cmd+plus', 'ctrl+=', 'cmd+='], () => { handlers.handleZoomIn?.(); return false })
  graph.bindKey(['ctrl+-', 'cmd+-'], () => { handlers.handleZoomOut?.(); return false })
  graph.bindKey(['ctrl+c', 'cmd+c'], () => { handlers.handleCopy?.(); return false })
  graph.bindKey(['ctrl+v', 'cmd+v'], () => { handlers.handlePaste?.(); return false })
}

/**
 * 橡皮框门控（Ctrl/Meta 按下时启用）
 * 入参：selectionPlugin(Selection 实例), graph(GraphLike)
 * 返回：{ handleKeyDown, handleKeyUp }
 * 场景：避免与平移冲突，按下修饰键启用橡皮框并禁用平移，松开还原
 */
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

/**
 * 添加节点（占位 API）
 * 入参：graph(GraphLike), spec(any 节点规格)
 * 返回：Cell 或 null
 * 场景：统一入口，当前由页面/工厂直接添加，可后续迁移到服务
 */
export function addNode(graph: GraphLike, spec: any): any { return null }
/**
 * 删除节点（占位 API）
 * 入参：graph(GraphLike), id(string)
 * 返回：void
 */
export function removeNode(graph: GraphLike, id: string): void {}
/**
 * 添加边（占位 API）
 * 入参：graph(GraphLike), spec(any 边规格)
 * 返回：Cell 或 null
 */
export function addEdge(graph: GraphLike, spec: any): any { return null }
/**
 * 删除边（占位 API）
 * 入参：graph(GraphLike), id(string)
 * 返回：void
 */
export function removeEdge(graph: GraphLike, id: string): void {}
/**
 * 级联删除节点（占位 API）
 * 入参：graph(GraphLike), id(string)
 * 返回：void
 * 场景：可扩展为删除节点并清理相关边与选择
 */
export function deleteNodeCascade(graph: GraphLike, id: string): void {}

export function bindConnectionPolicies(graph: GraphLike, ctx: { isViewMode: () => boolean; isPanning: () => boolean; Message?: { warning: (msg: string) => void } }) {
  // 用途：连接与磁铁校验策略（源端口唯一、方向约束）
  // 入参：图实例与上下文（查看模式/平移状态/消息）
  // 返回：`validateConnection/validateMagnet` 方法对接 X6 连接钩子
  // 边界：仅拦截与提示，不做实际连接操作；查看模式屏蔽所有连接
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
/*
用途：图服务（实例创建、插件注册、快捷键与选择门控、小地图、连接策略）
说明：统一封装 Graph 初始化与插件生命周期，提供页面装配所需的入口方法；不承担业务保存/发布逻辑。
边界：依赖容器与 X6 插件；查看模式与平移状态在连接策略中受控；不直接操作页面 UI。
*/
