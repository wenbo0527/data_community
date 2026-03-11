import { EventService } from './EventService.js'

export class CanvasController {
  constructor(opts) {
    this.graph = opts.graph
    this.eventService = new EventService({
      graph: opts.graph,
      readOnly: !!opts.readOnly,
      isStatisticsMode: typeof opts.isStatisticsMode === 'function' ? opts.isStatisticsMode : undefined,
      onNodeClickForStats: typeof opts.onNodeClickForStats === 'function' ? opts.onNodeClickForStats : undefined,
      openConfigDrawer: opts.openConfigDrawer,
      setShowNodeSelector: opts.setShowNodeSelector,
      setNodeSelectorPosition: opts.setNodeSelectorPosition,
      setNodeSelectorSourceNode: opts.setNodeSelectorSourceNode,
      setPendingCreatePoint: opts.setPendingCreatePoint,
      setPendingInsertionEdge: opts.setPendingInsertionEdge,
      deleteNodeCascade: opts.deleteNodeCascade,
      getContainerRect: opts.getContainerRect,
      setNodeMenuButton: opts.setNodeMenuButton,
      setNodeActionsMenu: opts.setNodeActionsMenu,
      getNodeActionsMenuRect: opts.getNodeActionsMenuRect,
      isMenuHovering: opts.isMenuHovering,
      getMenuCooldownUntil: opts.getMenuCooldownUntil,
      closeAllDrawers: opts.closeAllDrawers
    })
    this.eventService.bindGraphEvents(this.graph)
  }
}

export default CanvasController
/*
用途：画布控制器（装配事件服务）
说明：聚合页面注入的依赖并实例化 EventService，绑定 Graph 事件；页面通过控制器保持装配职责。
边界：不包含图/布局/持久化具体逻辑；仅负责事件路由与依赖传递。
*/
