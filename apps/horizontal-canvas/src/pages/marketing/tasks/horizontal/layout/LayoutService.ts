import type { X6GraphLike } from '@/types/graph.js'
import HorizontalQuickLayout from '../utils/quickLayout.js'

export type GraphLike = X6GraphLike

export interface ApplyQuickLayoutOptions {
  containerEl?: any
  minimap?: any
  minimapPaused?: boolean
  startX?: number
  startY?: number
  colSpacing?: number
  laneGapY?: number
  colScale?: number
  laneScale?: number
  spreadX?: number
  spreadY?: number
  expandX?: number
  quickLayout?: HorizontalQuickLayout
}

export interface LayoutBounds { minX: number; minY: number; maxX: number; maxY: number }
export interface LayoutResult { bounds?: LayoutBounds; [k: string]: unknown }

/**
 * 快速布局
 * 入参：graph(X6GraphLike), options(ApplyQuickLayoutOptions)
 * 返回：LayoutResult（包含 bounds 等）
 * 边界：失败容错；布局后关闭/开启辅助线；根据容器与布局宽度居中视图；可触发小地图更新
 */
export async function applyQuickLayout(graph: GraphLike, options: ApplyQuickLayoutOptions = {}): Promise<LayoutResult | null> {
  if (!graph) return null
  const {
    containerEl,
    minimap,
    minimapPaused,
    startX,
    startY,
    colSpacing,
    laneGapY,
    colScale,
    laneScale,
    spreadX,
    spreadY,
    expandX
  } = options || {}
  try { graph.setSnaplineEnabled?.(false) } catch {}
  const instance = options.quickLayout || new HorizontalQuickLayout({})
  const result = await instance.executeHierarchyTreeLayout(graph, {
    startX,
    startY,
    colSpacing,
    laneGapY,
    colScale,
    laneScale,
    spreadX,
    spreadY,
    expandX
  })
  cleanupEdgeVertices(graph)
  try { graph.setSnaplineEnabled?.(true) } catch {}
  setTimeout(() => {
    try {
      if (!minimapPaused && minimap && minimap.updateGraph) minimap.updateGraph()
    } catch {}
  }, 80)
  return result
}

/**
 * 清理边顶点
 * 入参：graph(X6GraphLike)
 * 返回：void
 * 场景：布局后或需要还原边路线时调用
 */
export function cleanupEdgeVertices(graph: GraphLike): void {
  try {
    const edges = graph?.getEdges?.() || []
    edges.forEach((e) => { try { e.setVertices?.([]) } catch {} })
  } catch {}
}
/*
用途：布局服务（快速/结构化布局与边顶点清理）
说明：统一提供布局入口与视图适配逻辑，屏蔽页面细节；必要时更新小地图与辅助线开关。
边界：不修改节点数据结构；失败容错并维持当前缩放；结构化布局依赖外部 provider。
*/
