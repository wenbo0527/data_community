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
    this.getNodeActionsMenuRect = deps.getNodeActionsMenuRect || (() => null)
    this.isMenuHovering = deps.isMenuHovering || (() => false)
    this.closeAllDrawers = deps.closeAllDrawers || (() => {})
  }

  bindGraphEvents(graph) {
    const readOnly = this.readOnly
    let lastMenuNodeId = null
    let hideTimer = null
    let lastShowTs = 0
    /**
     * 坐标转换到容器坐标系
     * 入参：point({x;y}) 局部/客户端坐标
     * 返回：{x;y} 相对于容器左上角的坐标
     */
    const toContainerCoords = (point) => {
      try {
        const pagePos = this.graph.localToPage ? this.graph.localToPage(point) : point
        const rect = this.getContainerRect ? this.getContainerRect() : { left: 0, top: 0 }
        return { x: pagePos.x - rect.left, y: pagePos.y - rect.top }
      } catch (e) {
        return point
      }
    }

    const isMenuHot = (e, node) => {
      const target = e?.target || null
      const selector = target && target.getAttribute 
        ? (target.getAttribute('selector') || target.getAttribute('data-selector'))
        : null
      const inHeaderMenuDom = !!(target && target.closest && (target.closest('[data-selector="header-menu"]') || target.closest('.node-menu') || target.closest('.node-menu__icon')))
      const isMenuIcon = selector && /^(menu-dot|header-menu)/.test(String(selector))
      return !!(isMenuIcon || inHeaderMenuDom)
    }
    const showMenuForNode = (node) => {
      const data = node.getData ? node.getData() : {}
      const t = data?.type || data?.nodeType
      if (t === 'start' || t === 'end') return
      const bbox = node.getBBox()
      const uiPos = toContainerCoords({ x: bbox.x + bbox.width - 28, y: bbox.y + 12 })
      const now = Date.now()
      const tooSoon = now - lastShowTs < 60
      const sameNode = lastMenuNodeId === node.id
      if (tooSoon && sameNode) return
      lastShowTs = now
      lastMenuNodeId = node.id
      this.setNodeActionsMenu({ visible: true, x: uiPos.x, y: uiPos.y, nodeId: node.id })
    }
    const scheduleHideMenu = (e) => {
      if (readOnly) return
      try { clearTimeout(hideTimer) } catch {}
      hideTimer = setTimeout(() => {
        try {
          const t = e?.target || null
          if (t && t.closest && t.closest('[data-selector="header-menu"]')) return
          // 选中状态下保持菜单，不进行自动关闭
          try { if (this.graph && lastMenuNodeId) { const n = this.graph.getCellById?.(lastMenuNodeId); if (n?.isSelected && n.isSelected()) return } } catch {}
          if (this.isMenuHovering && this.isMenuHovering()) return
          const rect = this.getNodeActionsMenuRect ? this.getNodeActionsMenuRect() : null
          if (rect && e && typeof e.pageX === 'number' && typeof e.pageY === 'number') {
            const x = e.pageX, y = e.pageY
            const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
            if (inside) return
          }
        } catch {}
        this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null })
      }, 200)
    }
    graph.on('edge:mouseenter', () => {})
    graph.on('edge:mouseleave', () => {})
    graph.on('edge:contextmenu', ({ e }) => {
      try { e?.preventDefault?.(); e?.stopPropagation?.() } catch {}
    })

    graph.on('node:contextmenu', ({ e, node }) => {
      if (readOnly) return
      try { e?.preventDefault?.(); e?.stopPropagation?.() } catch {}
      if (isMenuHot(e, node)) showMenuForNode(node)
    })
    graph.on('node:mouseleave', ({ e }) => { 
      if (readOnly) return
      try {
        if (this.isMenuHovering && this.isMenuHovering()) return
        const rect = this.getNodeActionsMenuRect ? this.getNodeActionsMenuRect() : null
        if (rect && e && typeof e.pageX === 'number' && typeof e.pageY === 'number') {
          const x = e.pageX, y = e.pageY
          const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
          if (inside) return
        }
      } catch {}
      this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null }) 
    })
    graph.on('node:mousedown', ({ e, node }) => {
      if (readOnly) return
      if (!isMenuHot(e, node)) scheduleHideMenu(e)
    })
    // DocRef: 架构文档「关键代码片段/事件服务：节点点击与菜单区域识别」
    graph.on('node:click', ({ e, node }) => {
      if (!readOnly && !this.isStatisticsMode() && isMenuHot(e, node)) {
        showMenuForNode(node)
        return
      }
      scheduleHideMenu(e)
      const d = node.getData ? node.getData() : {}
      const t = d?.type || d?.nodeType
      if (t && typeof this.openConfigDrawer === 'function') this.openConfigDrawer(t, node, d)
    })
    // 鼠标移动到菜单点区域时显示，移出时关闭
    graph.on('node:mouseenter', ({ e, node }) => {
      if (readOnly) return
      if (isMenuHot(e, node)) showMenuForNode(node)
    })
    graph.on('node:mousemove', ({ e, node }) => {
      if (readOnly) return
      if (isMenuHot(e, node)) {
        showMenuForNode(node)
      } else {
        scheduleHideMenu(e)
      }
    })
    graph.on('blank:click', ({ x, y }) => { if (readOnly) return })

    const refreshMenuPosition = () => {
      try {
        if (!lastMenuNodeId) return
        const node = this.graph.getCellById?.(lastMenuNodeId)
        if (!node) { this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null }); return }
        const bbox = node.getBBox?.() || null
        if (!bbox) return
        const uiPos = toContainerCoords({ x: bbox.x + bbox.width - 28, y: bbox.y + 12 })
        this.setNodeActionsMenu({ visible: true, x: uiPos.x, y: uiPos.y, nodeId: node.id })
      } catch {}
    }

    // 视口变化或节点移动时，菜单跟随
    this.graph.on('scale', refreshMenuPosition)
    this.graph.on('translate', refreshMenuPosition)
    this.graph.on('node:moved', ({ node }) => { if (node?.id === lastMenuNodeId) refreshMenuPosition() })
    this.graph.on('node:selected', ({ node }) => {
      if (readOnly) return
      try { node.addClass && node.addClass('menu-active') } catch {}
      showMenuForNode(node)
    })
    this.graph.on('node:unselected', ({ node }) => {
      if (readOnly) return
      try { node.removeClass && node.removeClass('menu-active') } catch {}
      this.setNodeActionsMenu({ visible: false, x: 0, y: 0, nodeId: null })
    })
    this.graph.on('node:mouseenter', ({ e, node }) => {
      if (readOnly) return
      // 选中状态下，进入节点时始终展示菜单，提升可靠性
      try { if (node?.isSelected && node.isSelected()) { showMenuForNode(node); return } } catch {}
      if (isMenuHot(e, node)) showMenuForNode(node)
    })
  }
}

export default EventService
/*
用途：事件服务（Graph 事件绑定与区域识别）
说明：统一处理节点菜单图标/标题/内容区域的交互行为，结合只读/统计模式进行分支；页面注入依赖以打开抽屉与定位菜单。
边界：不直接持久化；查看模式屏蔽编辑操作；坐标转换依赖容器与 Graph 提供的方法。
*/
