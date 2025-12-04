export type GraphLike = any
import HorizontalQuickLayout from '../utils/quickLayout.js'

/**
 * 快速布局
 * 入参：graph(GraphLike), options({ containerEl, minimap, minimapPaused, startX, startY, colSpacing, laneGapY, colScale, laneScale, spreadX, spreadY, expandX, quickLayout })
 * 返回：any（布局结果，包含 bounds 等）
 * 边界：失败容错；布局后关闭/开启辅助线；根据容器与布局宽度居中视图；可触发小地图更新
 */
export async function applyQuickLayout(graph: GraphLike, options: any = {}): Promise<any> {
  if (!graph) return null
  const {
    containerEl,
    minimap,
    minimapPaused,
    startX = 200,
    startY = 0,
    colSpacing = 250,
    laneGapY = 200,
    colScale = 1,
    laneScale = 1,
    spreadX = 1.5,
    spreadY = 1.5,
    expandX = 0
  } = options || {}
  try { graph.setSnaplineEnabled && graph.setSnaplineEnabled(false) } catch {}
  const instance = options.quickLayout || new HorizontalQuickLayout({})
  const result = await instance.executeHierarchyTreeLayout(graph, { startX, startY, colSpacing, laneGapY, colScale, laneScale, spreadX, spreadY, expandX })
  cleanupEdgeVertices(graph)
  try { graph.setSnaplineEnabled && graph.setSnaplineEnabled(true) } catch {}
  setTimeout(() => {
    try {
      if (!minimapPaused && minimap && minimap.updateGraph) minimap.updateGraph()
    } catch {}
  }, 80)
  return result
}

/**
 * 结构化布局装配
 * 入参：graph(GraphLike), options({ provider, direction })
 * 返回：Promise<void>
 * 边界：依赖外部 provider 的 initialize/switch/apply；布局后清理边顶点
 */
export async function applyStructuredLayout(graph: GraphLike, options: any = {}): Promise<void> {
  const provider = options.provider
  const direction = options.direction || 'LR'
  if (provider) {
    try {
      if (provider.initializeLayoutEngine) await provider.initializeLayoutEngine()
      if (provider.switchLayoutDirection) await provider.switchLayoutDirection(direction)
      if (provider.applyUnifiedStructuredLayout) await provider.applyUnifiedStructuredLayout(graph)
    } catch {}
  }
  cleanupEdgeVertices(graph)
}

/**
 * 清理边顶点
 * 入参：graph(GraphLike)
 * 返回：void
 * 场景：布局后或需要还原边路线时调用
 */
export function cleanupEdgeVertices(graph: GraphLike): void {
  try {
    const edges = graph?.getEdges?.() || []
    edges.forEach((e: any) => { try { e && e.setVertices && e.setVertices([]) } catch {} })
  } catch {}
}
/*
用途：布局服务（快速/结构化布局与边顶点清理）
说明：统一提供布局入口与视图适配逻辑，屏蔽页面细节；必要时更新小地图与辅助线开关。
边界：不修改节点数据结构；失败容错并维持当前缩放；结构化布局依赖外部 provider。
*/
