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
/*
用途：画布历史组合式（堆栈展示与撤销/重做）
说明：提供历史栈更新与事件监听、键盘快捷支持；实际历史由 X6 History 插件管理。
边界：跳转历史状态需结合插件快照；此处仅示例接口与撤销/重做键盘支持。
*/
