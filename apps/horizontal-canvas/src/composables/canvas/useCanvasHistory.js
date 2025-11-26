import { ref } from 'vue'
export const useCanvasHistory = (graph) => {
  const historyStack = ref([])
  const updateHistoryStack = () => {
    const nodes = graph?.getNodes?.().length || 0
    const edges = graph?.getEdges?.().length || 0
    historyStack.value = [{ description: `nodes:${nodes}, edges:${edges}` }]
  }
  const setupHistoryListeners = () => {
    graph?.on?.('cell:added', updateHistoryStack)
    graph?.on?.('cell:removed', updateHistoryStack)
    graph?.on?.('node:change:data', updateHistoryStack)
  }
  const jumpToHistoryState = () => {}
  const handleKeydown = (e) => {
    const ctrl = e.metaKey || e.ctrlKey
    if (ctrl && e.key.toLowerCase() === 'z') { try { graph?.undo?.() } catch {} }
    if (ctrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { try { graph?.redo?.() } catch {} }
  }
  return { historyStack, updateHistoryStack, setupHistoryListeners, jumpToHistoryState, handleKeydown }
}
