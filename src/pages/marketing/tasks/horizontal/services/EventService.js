export class EventService {
  constructor(deps) {
    this.graph = deps.graph
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
    const toContainerCoords = (point) => {
      try {
        const clientPos = this.graph.localToClient ? this.graph.localToClient(point) : point
        const rect = this.getContainerRect ? this.getContainerRect() : { left: 0, top: 0 }
        return { x: clientPos.x - rect.left, y: clientPos.y - rect.top }
      } catch (e) {
        return point
      }
    }

    // 基于坐标的回退判断：识别是否在标题区/菜单点区域
    const getClickRegion = (e, node) => {
      try {
        const bbox = node.getBBox()
        const width = bbox.width
        const local = this.graph.clientToLocal 
          ? this.graph.clientToLocal({ x: e.clientX, y: e.clientY }) 
          : { x: e.clientX, y: e.clientY }
        const rx = local.x - bbox.x
        const ry = local.y - bbox.y
        const HEADER_H = 36 // 与 NODE_DIMENSIONS.HEADER_HEIGHT 对齐
        const DOT_Y = 16    // 与 POSITIONS.MENU_DOT_Y 对齐
        const DOT_PAD_X = 30 // 菜单区域宽度容忍
        const DOT_PAD_Y = 8  // 菜单区域高度容忍
        const inHeader = ry >= 0 && ry <= HEADER_H
        const inDotArea = inHeader && (rx >= width - DOT_PAD_X && rx <= width - 8) && (ry >= DOT_Y - DOT_PAD_Y && ry <= DOT_Y + DOT_PAD_Y)
        return { inHeader, inDotArea }
      } catch (_) {
        return { inHeader: false, inDotArea: false }
      }
    }
    graph.on('edge:mouseenter', ({ edge }) => {
      edge.addTools([
        { name: 'button-remove', args: { distance: -30, offset: { x: 0, y: 0 } } },
        {
          name: 'button',
          args: {
            markup: [
              { tagName: 'circle', attrs: { r: 10, fill: '#4C78FF', stroke: '#4C78FF', cursor: 'pointer' } },
              { tagName: 'text', attrs: { fill: '#fff', fontSize: 12, textAnchor: 'middle', pointerEvents: 'none', y: 4, text: '+' } }
            ],
            distance: 0,
            offset: { x: 0, y: 0 },
            onClick: () => {
              const bbox = edge.getBBox()
              const x = bbox.x + bbox.width / 2
              const y = bbox.y + bbox.height / 2
              this.setPendingCreatePoint({ x, y })
              const uiPos = toContainerCoords({ x, y })
              this.setNodeSelectorPosition(uiPos)
              this.setNodeSelectorSourceNode(null)
              this.setPendingInsertionEdge(edge)
              this.setShowNodeSelector(true)
            }
          }
        }
      ])
    })

    graph.on('edge:mouseleave', ({ edge }) => {
      edge.removeTools()
    })

    // 右键边保留删除操作
    graph.on('edge:contextmenu', ({ edge }) => {
      graph.removeEdge(edge.id)
    })

    // 右键仅在点击“更多”菜单点时展示菜单，取消全节点右键菜单
    graph.on('node:contextmenu', ({ e, node }) => {
      const target = e && e.target ? e.target : null
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

    // 移除在离开节点时自动关闭菜单，避免无法将鼠标移到菜单进行操作
    graph.on('node:mouseleave', () => {})

    // 额外在按下时即关闭非菜单点击的菜单，提升关闭可靠性
    graph.on('node:mousedown', ({ e, node }) => {
      const target = e && e.target ? e.target : null
      const selector = target && target.getAttribute 
        ? (target.getAttribute('selector') || target.getAttribute('data-selector'))
        : null
      const isMenuIcon = selector && (selector === 'menu-dot-0' || selector === 'menu-dot-1' || selector === 'menu-dot-2')
      const { inDotArea } = getClickRegion(e, node)
      if (!(isMenuIcon || inDotArea)) {
        this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null })
      }
    })

    graph.on('node:click', ({ e, node }) => {
      const target = e && e.target ? e.target : null
      // 兼容 X6 不同属性命名：优先读取 'selector'，否则尝试 'data-selector'
      const selector = target && target.getAttribute 
        ? (target.getAttribute('selector') || target.getAttribute('data-selector'))
        : null
      const region = getClickRegion(e, node)

      // 菜单按钮点击：打开节点操作菜单
      const isMenuIcon = selector && (selector === 'menu-dot-0' || selector === 'menu-dot-1' || selector === 'menu-dot-2')
      if (isMenuIcon || region.inDotArea) {
        const data = node.getData ? node.getData() : {}
        const t = data?.type || data?.nodeType
        if (t === 'start' || t === 'end') return
        const bbox = node.getBBox()
        const uiPos = toContainerCoords({ x: bbox.x + bbox.width - 28, y: bbox.y + 12 })
        this.setNodeActionsMenu({ visible: true, x: uiPos.x, y: uiPos.y, nodeId: node.id })
        return
      }

      // 点击非菜单区域：先关闭操作菜单，避免菜单遮挡交互
      this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null })

      // 标题区点击：不打开配置抽屉，仅确保选中
      const isHeader = selector && (
        selector === 'header' || selector === 'header-icon' || selector === 'header-icon-text' || selector === 'header-title'
      ) || region.inHeader
      if (isHeader) {
        // 仅在未选中时选中，避免误触导致反选
        try {
          if (!(node.isSelected && node.isSelected())) {
            graph.select(node)
          }
        } catch (selectError) {
          console.warn('[EventService] 标题区选择处理失败:', selectError)
        }
        return
      }

      // 内容区点击：仅在内容区打开配置抽屉
      const isContent = selector && (selector === 'content-area' || /^row-\d+$/.test(selector)) || (!region.inHeader)
      if (isContent) {
        try {
          if (node.isSelected && node.isSelected()) {
            graph.unselect(node)
          } else {
            graph.select(node)
          }
        } catch (selectError) {
          console.warn('[EventService] 内容区选择处理失败:', selectError)
        }
        const d = node.getData ? node.getData() : {}
        const t = d?.type || d?.nodeType
        if (t) this.openConfigDrawer(t, node, d)
      }
      // 其他区域（例如边框空白）：不做抽屉操作
    })

    graph.on('blank:click', ({ x, y }) => {
      this.setPendingCreatePoint({ x, y })
      const uiPos = toContainerCoords({ x, y })
      this.setNodeSelectorPosition(uiPos)
      this.setNodeSelectorSourceNode(null)
      this.setShowNodeSelector(true)
      this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null })
    })
  }
}

export default EventService
