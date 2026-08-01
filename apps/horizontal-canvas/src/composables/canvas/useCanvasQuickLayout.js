/**
 * 画布智能布局组合式
 * 职责：包装 applyQuickLayout 服务，提供 Toast / 错误处理 / 居中收尾
 * 依赖：getGraph, getContainerEl, getMinimap, getMinimapPaused, getLayoutOptions,
 *       getMessage, onAfterLayout
 * 边界：仅调用 LayoutService.applyQuickLayout，不持久化画布。
 */

export function useCanvasQuickLayout(deps) {
  const {
    getGraph, getContainerEl, getMinimap, getMinimapPaused,
    getLayoutOptions, Message, onAfterLayout,
    applyQuickLayoutSvc
  } = deps || {}

  /**
   * 执行智能布局
   * 入参：无
   * 返回：boolean 是否成功
   * 副作用：调 applyQuickLayout；Toast 提示；触发 onAfterLayout
   */
  async function applyQuickLayout() {
    const graph = getGraph?.()
    if (!graph) {
      Message?.warning?.('画布未初始化，请稍后再试')
      return false
    }
    const loading = Message?.loading?.('正在应用智能布局...')
    try {
      await applyQuickLayoutSvc(graph, {
        containerEl: getContainerEl?.(),
        minimap: getMinimap?.(),
        minimapPaused: getMinimapPaused?.(),
        ...(getLayoutOptions?.() || {})
      })
      loading?.close?.()
      Message?.success?.('智能布局应用成功！')
      onAfterLayout?.()
      return true
    } catch (error) {
      loading?.close?.()
      Message?.error?.(`布局失败: ${error?.message || '未知错误'}`)
      return false
    }
  }

  return { applyQuickLayout }
}
/*
用途：画布智能布局组合式
说明：包装 applyQuickLayout 服务；统一 Toast 与收尾逻辑；动态 import 避免循环依赖。
边界：依赖注入避免直接耦合 index.vue；不持久化画布。
*/