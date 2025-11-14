import { EventService } from './EventService.js'

export class CanvasController {
  constructor(opts) {
    this.graph = opts.graph
    this.eventService = new EventService({
      graph: opts.graph,
      openConfigDrawer: opts.openConfigDrawer,
      setShowNodeSelector: opts.setShowNodeSelector,
      setNodeSelectorPosition: opts.setNodeSelectorPosition,
      setNodeSelectorSourceNode: opts.setNodeSelectorSourceNode,
      setPendingCreatePoint: opts.setPendingCreatePoint,
      setPendingInsertionEdge: opts.setPendingInsertionEdge,
      deleteNodeCascade: opts.deleteNodeCascade,
      getContainerRect: opts.getContainerRect,
      setNodeMenuButton: opts.setNodeMenuButton,
      setNodeActionsMenu: opts.setNodeActionsMenu
    })
    this.eventService.bindGraphEvents(this.graph)
  }
}

export default CanvasController