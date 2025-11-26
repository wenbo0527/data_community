import { NODE_DIMENSIONS, POSITIONS } from '../styles/nodeStyles.js'

export class EventService {
  constructor(deps) {
    this.graph = deps.graph
    this.isStatisticsMode = deps.isStatisticsMode || (() => false)
    this.onNodeClickForStats = deps.onNodeClickForStats || (() => {})
    this.readOnly = !!deps.readOnly
    this.openConfigDrawer = deps.openConfigDrawer
    this.setShowNodeSelector = deps.setShowNodeSelector
    this.setNodeSelectorPosition = deps.setNodeSelectorPosition
    this.setNodeSelectorSourceNode = deps.setNodeSelectorSourceNode
    this.setPendingCreatePoint = deps.setPendingCreatePoint
    this.setPendingInsertionEdge = deps.setPendingInsertionEdge
    this.deleteNodeCascade = deps.deleteNodeCascade
    this.getContainerRect = deps.getContainerRect
    this.setNodeMenuButton = deps.setNodeMenuButton
    this.setNodeActionsMenu = deps.setNodeActionsMenu
  }

  bindGraphEvents(graph) {
    const readOnly = this.readOnly
    const toContainerCoords = (point) => {
      try {
        const clientPos = this.graph.localToClient ? this.graph.localToClient(point) : point
        const rect = this.getContainerRect ? this.getContainerRect() : { left: 0, top: 0 }
        return { x: clientPos.x - rect.left, y: clientPos.y - rect.top }
      } catch (e) {
        return point
      }
    }

    const getClickRegion = (e, node) => {
      try {
        const bbox = node.getBBox()
        const width = bbox.width
        const local = this.graph.clientToLocal 
          ? this.graph.clientToLocal({ x: e.clientX, y: e.clientY }) 
          : { x: e.clientX, y: e.clientY }
        const rx = local.x - bbox.x
        const ry = local.y - bbox.y
        const HEADER_H = NODE_DIMENSIONS.HEADER_HEIGHT
        const DOT_Y = POSITIONS.MENU_DOT_Y
        const DOT_PAD_X = 30
        const DOT_PAD_Y = 8
        const inHeader = ry >= 0 && ry <= HEADER_H
        const inDotArea = inHeader && (rx >= width - DOT_PAD_X && rx <= width - 8) && (ry >= DOT_Y - DOT_PAD_Y && ry <= DOT_Y + DOT_PAD_Y)
        return { inHeader, inDotArea }
      } catch (_) {
        return { inHeader: false, inDotArea: false }
      }
    }
    graph.on('edge:mouseenter', () => {})
    graph.on('edge:mouseleave', () => {})
    graph.on('edge:contextmenu', ({ e }) => {
      try { e?.preventDefault?.(); e?.stopPropagation?.() } catch {}
    })

    graph.on('node:contextmenu', ({ e, node }) => {
      if (readOnly) return
      const target = e?.target || null
      const selector = target && target.getAttribute 
        ? (target.getAttribute('selector') || target.getAttribute('data-selector'))
        : null
      const isMenuIcon = selector && (selector === 'menu-dot-0' || selector === 'menu-dot-1' || selector === 'menu-dot-2')
      const { inDotArea } = getClickRegion(e, node)
      if (!(isMenuIcon || inDotArea)) return
      const data = node.getData ? node.getData() : {}
      const t = data?.type || data?.nodeType
      if (t === 'start' || t === 'end') return
      const bbox = node.getBBox()
      const uiPos = toContainerCoords({ x: bbox.x + bbox.width - 28, y: bbox.y + 12 })
      this.setNodeActionsMenu({ visible: true, x: uiPos.x, y: uiPos.y, nodeId: node.id })
    })
    graph.on('node:mouseleave', () => {})
    graph.on('node:mousedown', ({ e, node }) => {
      if (readOnly) return
      const target = e?.target || null
      const selector = target && target.getAttribute 
        ? (target.getAttribute('selector') || target.getAttribute('data-selector'))
        : null
      const isMenuIcon = selector && (selector === 'menu-dot-0' || selector === 'menu-dot-1' || selector === 'menu-dot-2')
      const { inDotArea } = getClickRegion(e, node)
      if (!(isMenuIcon || inDotArea)) {
        this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null })
      }
    })
    // DocRef: 架构文档「关键代码片段/事件服务：节点点击与菜单区域识别」
    graph.on('node:click', ({ e, node }) => {
      const target = e?.target || null
      const selector = target && target.getAttribute 
        ? (target.getAttribute('selector') || target.getAttribute('data-selector'))
        : null
      const region = getClickRegion(e, node)
      const isMenuIcon = selector && (selector === 'menu-dot-0' || selector === 'menu-dot-1' || selector === 'menu-dot-2')
      if (!readOnly && !this.isStatisticsMode() && (isMenuIcon || region.inDotArea)) {
        const data = node.getData ? node.getData() : {}
        const t = data?.type || data?.nodeType
        if (t === 'start' || t === 'end') return
        const bbox = node.getBBox()
        const uiPos = toContainerCoords({ x: bbox.x + bbox.width - 28, y: bbox.y + 12 })
        this.setNodeActionsMenu({ visible: true, x: uiPos.x, y: uiPos.y, nodeId: node.id })
        return
      }
      this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null })
      const isHeader = selector && (
        selector === 'header' || selector === 'header-icon' || selector === 'header-icon-text' || selector === 'header-title'
      ) || region.inHeader
      if (isHeader) {
        if (this.isStatisticsMode()) { 
          try { 
            console.log('[Stats] header-click -> node:', node?.id)
            this.onNodeClickForStats(node)
          } catch {}
        }
        try { if (!(node.isSelected && node.isSelected())) { graph.select(node) } } catch {}
        return
      }
      const isContent = selector && (selector === 'content-area' || /^row-\d+$/.test(selector)) || (!region.inHeader)
      if (isContent) {
        if (this.isStatisticsMode()) {
          try { 
            console.log('[Stats] content-click -> node:', node?.id)
            this.onNodeClickForStats(node) 
          } catch {}
        }
        try {
          if (!readOnly) {
            if (node.isSelected && node.isSelected()) {
              graph.unselect(node)
            } else {
              graph.select(node)
            }
          }
        } catch {}
        const d = node.getData ? node.getData() : {}
        const t = d?.type || d?.nodeType
        if (t) this.openConfigDrawer(t, node, d)
      }
    })
    graph.on('blank:click', ({ x, y }) => { if (readOnly) return })
    
  }
}

export default EventService
