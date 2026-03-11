import { ref, nextTick } from 'vue'

export function useStructuredLayout(getGraph) {
  const layoutDirection = ref('LR')
  const isLayouting = ref(false)

  async function initializeLayoutEngine() {
    const graph = getGraph && getGraph()
    if (!graph) return false
    return true
  }

  async function switchLayoutDirection(dir) {
    layoutDirection.value = dir === 'TB' ? 'TB' : 'LR'
    return true
  }

  async function applyUnifiedStructuredLayout(graph) {
    const g = graph || (getGraph && getGraph())
    if (!g) return { success: false }
    try {
      isLayouting.value = true
      const nodes = g.getNodes?.() || []
      let x = 100
      let y = 100
      nodes.forEach((n, i) => {
        try {
          const pos = layoutDirection.value === 'LR'
            ? { x: x + i * 300, y }
            : { x, y: y + i * 160 }
          n.position(pos)
        } catch {}
      })
      nextTick(() => { try { g.centerContent?.(); g.zoomToFit?.({ padding: 40 }) } catch {} })
      return { success: true }
    } finally {
      isLayouting.value = false
    }
  }

  async function centerAndFitCanvas() {
    const g = getGraph && getGraph()
    if (!g) return
    try { g.centerContent?.(); g.zoomToFit?.({ padding: 50 }) } catch {}
  }

  return {
    layoutDirection,
    isLayouting,
    initializeLayoutEngine,
    switchLayoutDirection,
    applyUnifiedStructuredLayout,
    centerAndFitCanvas
  }
}
