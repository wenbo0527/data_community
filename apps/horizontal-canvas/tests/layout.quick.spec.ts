import { describe, it, expect, vi } from 'vitest'
import { applyQuickLayout } from '@/pages/marketing/tasks/horizontal/layout/LayoutService.ts'

describe('applyQuickLayout 保持缩放与中心不变', () => {
  it('不调用center/centerContent，保留当前zoom', async () => {
    const centerSpy = vi.fn()
    const centerContentSpy = vi.fn()
    const zoomSpy = vi.fn(() => 1)
    const setSnaplineEnabled = vi.fn()
    const getEdges = vi.fn(() => [])
    const graph: any = { center: centerSpy, centerContent: centerContentSpy, zoom: zoomSpy, setSnaplineEnabled, getEdges }

    const quickLayout = { executeHierarchyTreeLayout: vi.fn(async () => ({ bounds: { minX: 0, maxX: 100 } })) }
    const minimap = { updateGraph: vi.fn() }
    const containerEl = { getBoundingClientRect: () => ({ width: 800, height: 600 }) }

    await applyQuickLayout(graph, { containerEl, minimap, quickLayout })

    expect(centerSpy).not.toHaveBeenCalled()
    expect(centerContentSpy).not.toHaveBeenCalled()
    expect(zoomSpy).not.toHaveBeenCalled()
    expect(minimap.updateGraph).toHaveBeenCalled()
  })
})
