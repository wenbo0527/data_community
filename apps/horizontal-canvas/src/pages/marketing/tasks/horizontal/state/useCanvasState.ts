import { ref } from 'vue'

export function useCanvasState() {
  const showHistoryPanel = ref(false)
  const showStatisticsPanel = ref(false)
  const scaleDisplayText = ref('100%')
  const showMinimap = ref(false)
  const statisticsPanelWidth = ref(420)
  const statisticsPanelHeight = ref(300)
  function updateStatisticsPanelTop(toolbarWrapperEl?: HTMLElement | null, statisticsPanelTopRef?: { value: number }) {
    const rect = toolbarWrapperEl && (toolbarWrapperEl as any).getBoundingClientRect ? (toolbarWrapperEl as any).getBoundingClientRect() : null
    const top = rect ? Math.max(0, Math.round(rect.bottom + 8)) : 0
    if (statisticsPanelTopRef && typeof statisticsPanelTopRef === 'object') statisticsPanelTopRef.value = top
    return top
  }
  function updateDebugDockBounds(contentEl?: HTMLElement | null, showStatisticsPanelRef?: { value: boolean }, isViewMode?: boolean, isPublished?: boolean, statisticsPanelWidthRef?: { value: number }, debugDockBoundsRef?: { value: { left: number; width: number } }) {
    const rect = contentEl && (contentEl as any).getBoundingClientRect ? (contentEl as any).getBoundingClientRect() : null
    if (!rect) return { left: 0, width: 0 }
    const reservedRight = (showStatisticsPanelRef?.value && !!isViewMode && !!isPublished) ? (statisticsPanelWidthRef?.value || 0) : 0
    const result = { left: Math.round(rect.left), width: Math.round(rect.width - reservedRight) }
    if (debugDockBoundsRef && typeof debugDockBoundsRef === 'object') debugDockBoundsRef.value = result
    return result
  }
  function computeMinimapPosition(anchorRect: { left: number; bottom: number } | null, canvasRect: { left: number; top: number } | null) {
    const offsetY = 8
    if (anchorRect && canvasRect) {
      return {
        left: Math.max(16, Math.round(anchorRect.left - canvasRect.left)),
        top: Math.max(16, Math.round(anchorRect.bottom - canvasRect.top + offsetY))
      }
    }
    return { left: 16, top: 64 }
  }
  return { showHistoryPanel, showStatisticsPanel, scaleDisplayText, showMinimap, statisticsPanelWidth, statisticsPanelHeight, updateDebugDockBounds, updateStatisticsPanelTop, computeMinimapPosition }
}
