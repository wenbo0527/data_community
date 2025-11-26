import { ref } from 'vue'

export function useCanvasState() {
  const showHistoryPanel = ref(false)
  const showStatisticsPanel = ref(false)
  const scaleDisplayText = ref('100%')
  const showMinimap = ref(false)
  const statisticsPanelWidth = ref(420)
  const statisticsPanelHeight = ref(300)
  const updateDebugDockBounds = () => {}
  const updateStatisticsPanelTop = () => {}
  return { showHistoryPanel, showStatisticsPanel, scaleDisplayText, showMinimap, statisticsPanelWidth, statisticsPanelHeight, updateDebugDockBounds, updateStatisticsPanelTop }
}

