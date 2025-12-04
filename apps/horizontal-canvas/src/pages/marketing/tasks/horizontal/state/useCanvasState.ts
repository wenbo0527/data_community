import { ref, watch, nextTick } from 'vue'

export function useCanvasState() {
  const showHistoryPanel = ref(false)
  const showStatisticsPanel = ref(false)
  const scaleDisplayText = ref('100%')
  const showMinimap = ref(false)
  const statisticsPanelWidth = ref(420)
  const statisticsPanelHeight = ref(300)
  /**
   * 统计面板顶部位置更新
   * 入参：toolbarWrapperEl(HTMLElement|null)、statisticsPanelTopRef({ value:number })
   * 返回：number 顶部像素值
   * 边界：DOM 不存在时回退为 0
   */
  function updateStatisticsPanelTop(toolbarWrapperEl?: HTMLElement | null, statisticsPanelTopRef?: { value: number }) {
    const rect = toolbarWrapperEl && (toolbarWrapperEl as any).getBoundingClientRect ? (toolbarWrapperEl as any).getBoundingClientRect() : null
    const top = rect ? Math.max(0, Math.round(rect.bottom + 8)) : 0
    if (statisticsPanelTopRef && typeof statisticsPanelTopRef === 'object') statisticsPanelTopRef.value = top
    return top
  }
  /**
   * 调试面板停靠范围更新
   * 入参：contentEl(HTMLElement|null)、showStatisticsPanelRef({value:boolean})、isViewMode(boolean)、isPublished(boolean)、statisticsPanelWidthRef({value:number})、debugDockBoundsRef({value:{left:number;width:number}})
   * 返回：{ left:number; width:number }
   * 边界：DOM 不存在时返回 { left:0, width:0 }
   */
  function updateDebugDockBounds(contentEl?: HTMLElement | null, showStatisticsPanelRef?: { value: boolean }, isViewMode?: boolean, isPublished?: boolean, statisticsPanelWidthRef?: { value: number }, debugDockBoundsRef?: { value: { left: number; width: number } }) {
    const rect = contentEl && (contentEl as any).getBoundingClientRect ? (contentEl as any).getBoundingClientRect() : null
    if (!rect) return { left: 0, width: 0 }
    const reservedRight = (showStatisticsPanelRef?.value && !!isViewMode && !!isPublished) ? (statisticsPanelWidthRef?.value || 0) : 0
    const result = { left: Math.round(rect.left), width: Math.round(rect.width - reservedRight) }
    if (debugDockBoundsRef && typeof debugDockBoundsRef === 'object') debugDockBoundsRef.value = result
    return result
  }
  /**
   * 计算小地图位置
   * 入参：anchorRect({left;bottom})、canvasRect({left;top})
   * 返回：{ left:number; top:number }
   */
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
  /**
   * 切换可见性
   * 入参：refBool({value:boolean})
   * 返回：void
   */
  function toggleVisible(refBool: { value: boolean }) { refBool.value = !refBool.value }
  /**
   * 设置可见性
   * 入参：refBool({value:boolean}), visible(boolean)
   * 返回：void
   */
  function setVisible(refBool: { value: boolean }, visible: boolean) { refBool.value = !!visible }
  /**
   * 在指定位置显示节点选择器
   * 入参：showRef({value:boolean}), posRef({value:{x;y}}), position({x;y})
   * 返回：void
   */
  function showNodeSelectorAt(showRef: { value: boolean }, posRef: { value: { x: number; y: number } }, position: { x: number; y: number }) { showRef.value = true; posRef.value = position }
  /**
   * 隐藏节点选择器
   * 入参：showRef({value:boolean})
   * 返回：void
   */
  function hideNodeSelector(showRef: { value: boolean }) { showRef.value = false }
  /**
   * 切换小地图 UI 并更新位置
   * 入参：showMinimapRef({value:boolean}), anchorRect(any), canvasRect(any), minimapPositionRef({value:{left;top}})
   * 返回：{left;top}
   */
  function toggleMinimapUI(showMinimapRef: { value: boolean }, anchorRect: any, canvasRect: any, minimapPositionRef: { value: { left: number; top: number } }) {
    showMinimapRef.value = !showMinimapRef.value
    const pos = computeMinimapPosition(anchorRect, canvasRect)
    minimapPositionRef.value = pos
    return pos
  }
  /**
   * 计算统计面板位置
   * 入参：anchorRect({left;bottom})、canvasRect({left;top})
   * 返回：{ left:number; top:number }
   */
  function computeStatsPanelPosition(anchorRect: { left: number; bottom: number } | null, canvasRect: { left: number; top: number } | null) {
    const offsetY = 8
    if (anchorRect && canvasRect) {
      return {
        left: Math.max(16, Math.round(anchorRect.left - canvasRect.left)),
        top: Math.max(16, Math.round(anchorRect.bottom - canvasRect.top + offsetY))
      }
    }
    return { left: 16, top: 64 }
  }
  /**
   * 约束面板位置在容器范围内
   * 入参：statsPos({left;top})、canvasRect({width;height})、panelRect({width;height})、pad(number)
   * 返回：{ left:number; top:number }
   */
  function clampPanelPosition(statsPos: { left: number; top: number }, canvasRect: { width: number; height: number }, panelRect: { width: number; height: number }, pad = 16) {
    const maxLeft = Math.max(pad, canvasRect.width - panelRect.width - pad)
    const maxTop = Math.max(pad, canvasRect.height - panelRect.height - pad)
    return { left: Math.min(statsPos.left, maxLeft), top: Math.min(statsPos.top, maxTop) }
  }
  /**
   * 绑定窗口 resize 监听（返回 detach 方法）
   * 入参：toolbarWrapperEl、contentEl、showStatisticsPanelRef、isViewMode、isPublished、statisticsPanelWidthRef、debugDockBoundsRef、statisticsPanelTopRef
   * 返回：{ detach:() => void }
   */
  function setupPanelResizeListeners(toolbarWrapperEl: HTMLElement | null, contentEl: HTMLElement | null, showStatisticsPanelRef: { value: boolean }, isViewMode: boolean, isPublished: boolean, statisticsPanelWidthRef: { value: number }, debugDockBoundsRef: { value: { left: number; width: number } }, statisticsPanelTopRef: { value: number }) {
    const onResizeTop = () => updateStatisticsPanelTop(toolbarWrapperEl, statisticsPanelTopRef)
    const onResizeDock = () => updateDebugDockBounds(contentEl, showStatisticsPanelRef, isViewMode, isPublished, statisticsPanelWidthRef, debugDockBoundsRef)
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResizeTop)
      window.addEventListener('resize', onResizeDock)
    }
    return {
      detach() {
        try { window.removeEventListener('resize', onResizeTop) } catch {}
        try { window.removeEventListener('resize', onResizeDock) } catch {}
      }
    }
  }
  /**
   * 绑定面板显隐与宽度变化的联动 watch
   * 入参：showStatisticsPanelRef、statisticsPanelWidthRef、updateTopFn、updateDockFn
   * 返回：void
   */
  function setupPanelWatchers(showStatisticsPanelRef: { value: boolean }, statisticsPanelWidthRef: { value: number }, updateTopFn: () => Promise<void> | void, updateDockFn: () => Promise<void> | void) {
    watch(showStatisticsPanelRef as any, async () => { await nextTick(); await updateTopFn() })
    watch([showStatisticsPanelRef as any, statisticsPanelWidthRef as any], async () => { await nextTick(); await updateDockFn() })
  }
  /**
   * 更新缩放显示文本
   * 入参：scaleDisplayTextRef({value:string}), scale(number)
   * 返回：void
   */
  function updateScaleDisplay(scaleDisplayTextRef: { value: string }, scale: number) {
    const newZoom = Math.round((Number(scale) || 1) * 100)
    scaleDisplayTextRef.value = `${newZoom}%`
  }
  return { showHistoryPanel, showStatisticsPanel, scaleDisplayText, showMinimap, statisticsPanelWidth, statisticsPanelHeight, updateDebugDockBounds, updateStatisticsPanelTop, computeMinimapPosition, setupPanelResizeListeners, setupPanelWatchers, updateScaleDisplay, toggleMinimapUI, computeStatsPanelPosition, clampPanelPosition, toggleVisible, setVisible, showNodeSelectorAt, hideNodeSelector }
}
/*
用途：画布 UI 状态服务（面板位置与尺寸联动、Minimap 显隐与定位、通用显隐工具）
说明：封装 DOM 依赖的计算与窗口 resize/watchers 绑定，供页面装配与组件联动使用。
边界：不直接操作 Graph；只读/查看模式逻辑由页面控制；返回的 detach 方法用于卸载。
*/
