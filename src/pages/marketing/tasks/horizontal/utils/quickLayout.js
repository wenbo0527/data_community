/**
 * 横版画布专用快速布局模块
 * 特点：
 * 1. 仅重新排列节点位置，不改变端口和连线绑定
 * 2. 基于端口索引自然分行（out-0, out-1, out-2...）
 * 3. 从左到右（LR）拓扑分层
 * 4. 高性能，O(n)复杂度
 */

import * as Hierarchy from '@antv/hierarchy'

export class HorizontalQuickLayout {
  constructor(options = {}) {
    this.config = {
      columnSpacing: options.columnSpacing || 250,
      rowHeight: options.rowHeight || 150,
      startX: options.startX || 100,
      startY: options.startY || 100,
      centerAlign: options.centerAlign !== false,
      ...options
    };
  }

  async executeHierarchyTreeLayout(graph, options = {}) {
    // 获取画布容器信息，用于计算居中对齐
    const container = graph?.container
    const containerRect = container?.getBoundingClientRect ? container.getBoundingClientRect() : { width: 1200, height: 800 }
    const canvasWidth = containerRect.width || 1200
    const canvasHeight = containerRect.height || 800
    
    // 计算优化的起始位置：左侧适当偏移，垂直居中
    const defaultStartX = 120 // 增加左侧偏移，给开始节点留出空间
    const defaultStartY = Math.max(120, canvasHeight * 0.3) // 从画布高度的30%位置开始
    
    const startX = options.startX != null ? options.startX : defaultStartX
    const startY = options.startY != null ? options.startY : defaultStartY
    const colSpacing = options.colSpacing != null ? options.colSpacing : 280
    const laneGapY = options.laneGapY != null ? options.laneGapY : 240

    const nodes = this.safeGetNodes(graph)
    const edges = this.safeGetEdges(graph)
    if (!nodes.length) return

    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    let maxW = 0
    let maxH = 0
    const widthMap = new Map()
    const heightMap = new Map()
    nodes.forEach(n => {
      const bb = typeof n.getBBox === 'function' ? n.getBBox() : { width: 120, height: 60 }
      const w = Math.max(40, bb.width || 120)
      const h = Math.max(30, bb.height || 60)
      widthMap.set(n.id, w)
      heightMap.set(n.id, h)
      maxW = Math.max(maxW, w)
      maxH = Math.max(maxH, h)
    })
    const baseCol = Math.max(colSpacing, maxW + 160)
    const baseLane = Math.max(laneGapY, maxH + 120)
    const colScale = options.colScale != null ? options.colScale : 6
    const laneScale = options.laneScale != null ? options.laneScale : 6
    const effCol = baseCol * colScale
    const effLane = baseLane * laneScale

    const outAdj = new Map()
    const inAdj = new Map()
    const indeg = new Map()
    nodeMap.forEach((_, id) => { outAdj.set(id, []); inAdj.set(id, []); indeg.set(id, 0) })
    const sourceEdges = new Map()
    edges.forEach(e => {
      try {
        const s = e.getSource?.()
        const t = e.getTarget?.()
        const p = e.getSourcePortId?.()
        if (s?.cell && t?.cell && nodeMap.has(s.cell) && nodeMap.has(t.cell)) {
          outAdj.get(s.cell).push(t.cell)
          inAdj.get(t.cell).push(s.cell)
          indeg.set(t.cell, (indeg.get(t.cell) || 0) + 1)
          const arr = sourceEdges.get(s.cell) || []
          arr.push({ port: p || '', target: t.cell })
          sourceEdges.set(s.cell, arr)
        }
      } catch {}
    })

    const getOutPorts = (id) => {
      const n = nodeMap.get(id)
      const ports = n?.getPorts?.() || []
      return ports.filter(p => p && p.group === 'out')
        .map(p => ({ id: p.id, idx: (() => { const m = String(p.id || '').match(/(\d+)/); return m ? parseInt(m[1], 10) : 0 })() }))
        .sort((a, b) => a.idx - b.idx)
    }
    const portOrderMap = new Map()
    nodes.forEach(n => {
      const list = getOutPorts(n.id)
      const m = new Map(list.map((p, i) => [p.id, i]))
      portOrderMap.set(n.id, m)
    })

    const childrenByPort = new Map()
    nodeMap.forEach((_, id) => {
      const arr = (sourceEdges.get(id) || []).slice()
      const order = portOrderMap.get(id) || new Map()
      arr.sort((a, b) => {
        const ai = order.has(a.port) ? order.get(a.port) : (() => { const m = String(a.port || '').match(/(\d+)/); return m ? parseInt(m[1], 10) : 0 })()
        const bi = order.has(b.port) ? order.get(b.port) : (() => { const m = String(b.port || '').match(/(\d+)/); return m ? parseInt(m[1], 10) : 0 })()
        return ai - bi
      })
      const uniq = []
      const seen = new Set()
      arr.forEach(it => { if (!seen.has(it.target)) { seen.add(it.target); uniq.push(it.target) } })
      childrenByPort.set(id, uniq)
    })

    const mainParentOf = new Map()
    nodes.forEach(n => {
      const pidList = inAdj.get(n.id) || []
      if (pidList.length <= 1) { if (pidList.length === 1) mainParentOf.set(n.id, pidList[0]); return }
      let best = pidList[0]
      let bestIdx = Number.POSITIVE_INFINITY
      pidList.forEach(pid => {
        const order = portOrderMap.get(pid) || new Map()
        const entry = (sourceEdges.get(pid) || []).find(x => x.target === n.id)
        const idx = entry ? (order.has(entry.port) ? order.get(entry.port) : (() => { const m = String(entry.port || '').match(/(\d+)/); return m ? parseInt(m[1], 10) : 0 })()) : Number.POSITIVE_INFINITY
        if (idx < bestIdx || (idx === bestIdx && String(pid).localeCompare(String(best), undefined, { numeric: true }) < 0)) { best = pid; bestIdx = idx }
      })
      mainParentOf.set(n.id, best)
    })

    const roots = nodes.filter(n => {
      const d = n.getData?.() || {}
      const isStart = d.type === 'start' || d.nodeType === 'start' || String(n.id).includes('start')
      return isStart || (indeg.get(n.id) || 0) === 0
    })
    const rootIds = roots.length ? roots.map(n => n.id) : [nodes[0].id]

    const treeNodeMap = new Map()
    nodes.forEach(n => treeNodeMap.set(n.id, { id: n.id, children: [] }))
    nodeMap.forEach((_, pid) => {
      const children = childrenByPort.get(pid) || []
      children.forEach(cid => {
        const mp = mainParentOf.get(cid)
        if (!mp || mp === pid) {
          const pObj = treeNodeMap.get(pid)
          const cObj = treeNodeMap.get(cid)
          if (pObj && cObj) pObj.children.push(cObj)
        }
      })
    })

    let treeRoot = null
    if (rootIds.length === 1) {
      treeRoot = treeNodeMap.get(rootIds[0])
    } else {
      treeRoot = { id: 'virtual_root', children: rootIds.map(id => treeNodeMap.get(id)).filter(Boolean) }
    }

    const result = Hierarchy.compactBox(treeRoot, {
      direction: 'LR',
      getId: d => d.id,
      getChildren: d => d.children || [],
      getWidth: d => widthMap.get(d.id) || maxW || 120,
      getHeight: d => heightMap.get(d.id) || maxH || 60,
      nodeSize: [maxW, maxH],
      gap: [effCol, effLane],
      hGap: effCol,
      vGap: effLane
    })

    const posMap = new Map()
    const collect = (node) => {
      if (!node) return
      if (node.id && node.id !== 'virtual_root' && typeof node.x === 'number' && typeof node.y === 'number') {
        posMap.set(node.id, { x: node.x + startX, y: node.y + startY })
      }
      const cs = node.children || []
      cs.forEach(c => collect(c))
    }
    collect(result)

    const spreadX = options.spreadX != null ? options.spreadX : 1
    const spreadY = options.spreadY != null ? options.spreadY : 1
    if (spreadX !== 1 || spreadY !== 1) {
      let minX = Infinity
      let minY = Infinity
      posMap.forEach(p => { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y })
      posMap.forEach((p, id) => {
        const nx = minX + (p.x - minX) * spreadX
        const ny = minY + (p.y - minY) * spreadY
        posMap.set(id, { x: nx, y: ny })
      })
    }

    const expandX = options.expandX != null ? options.expandX : 0
    if (expandX) {
      const depthMap = new Map()
      const assignDepth = (node, d) => {
        if (!node) return
        if (node.id && node.id !== 'virtual_root') depthMap.set(node.id, d)
        const cs = node.children || []
        cs.forEach(c => assignDepth(c, d + 1))
      }
      assignDepth(result, 0)
      posMap.forEach((p, id) => {
        const d = depthMap.get(id) || 0
        posMap.set(id, { x: p.x + d * expandX, y: p.y })
      })
    }

    const startNode = roots[0]?.id || rootIds[0]
    const firstHead = (childrenByPort.get(startNode) || [])[0]
    if (startNode && firstHead) {
      const headPos = posMap.get(firstHead)
      const startPos = posMap.get(startNode)
      if (headPos && startPos) posMap.set(startNode, { x: startPos.x, y: headPos.y })
    }

    // 计算布局边界，用于居中对齐和边界检测
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    posMap.forEach(pos => {
      minX = Math.min(minX, pos.x)
      maxX = Math.max(maxX, pos.x)
      minY = Math.min(minY, pos.y)
      maxY = Math.max(maxY, pos.y)
    })
    
    // 计算布局中心偏移，使节点在画布中居中
    const layoutWidth = maxX - minX
    const layoutHeight = maxY - minY
    
    // 计算垂直居中偏移
    const verticalCenterOffset = Math.max(0, (canvasHeight - layoutHeight) / 2 - minY + startY)
    
    // 确保有足够的顶部边距
    const topMargin = Math.max(80, startY)
    const finalVerticalOffset = minY < topMargin ? (topMargin - minY) : 0
    
    // 应用居中和边界调整
    posMap.forEach((pos, id) => {
      const adjustedY = pos.y + finalVerticalOffset
      posMap.set(id, { x: pos.x, y: adjustedY })
    })

    let moved = 0
    posMap.forEach((pos, id) => {
      const cell = graph.getCellById(id)
      if (cell && cell.isNode?.()) {
        try { 
          const finalX = Math.max(20, pos.x)
          const finalY = Math.max(20, pos.y)
          
          cell.position(finalX, finalY)
          moved++ 
        } catch (error) {
          console.warn(`[HorizontalQuickLayout] 移动节点失败: ${id}`, error)
        }
      }
    })
    const es = graph.getEdges?.() || []
    es.forEach(e => { try { e.setVertices?.([]) } catch {} })
    
    // 添加调试信息
    console.log('[HorizontalQuickLayout] 布局完成:', {
      移动节点数: moved,
      画布尺寸: { 宽度: canvasWidth, 高度: canvasHeight },
      布局边界: { minX, maxX, minY, maxY, 宽度: layoutWidth, 高度: layoutHeight },
      起始位置: { x: startX, y: startY },
      垂直偏移: finalVerticalOffset,
      参数配置: { colSpacing, laneGapY, colScale, laneScale }
    })
    
    return { moved, bounds: { minX, maxX, minY, maxY }, canvasSize: { width: canvasWidth, height: canvasHeight } }
  }

  /**
   * 安全获取图中的节点
   */
  safeGetNodes(graph) {
    try {
      const nodes = graph.getNodes?.() || graph.nodes || [];
      return Array.isArray(nodes) ? nodes.filter(node => node && node.id) : [];
    } catch (error) {
      console.warn('[HorizontalQuickLayout] 获取节点失败，使用空数组:', error);
      return [];
    }
  }

  /**
   * 安全获取图中的边
   */
  safeGetEdges(graph) {
    try {
      const edges = graph.getEdges?.() || graph.edges || [];
      return Array.isArray(edges) ? edges.filter(edge => edge && edge.getSource && edge.getTarget) : [];
    } catch (error) {
      console.warn('[HorizontalQuickLayout] 获取边失败，使用空数组:', error);
      return [];
    }
  }




  /**
   * 获取节点尺寸
   */
  getNodeSize(node) {
    try {
      const bbox = typeof node.getBBox === 'function' ? node.getBBox() : null
      const width = bbox?.width || 120
      const height = bbox?.height || 60
      return { width, height }
    } catch (error) {
      console.warn('[HorizontalQuickLayout] 获取节点尺寸失败，使用默认值:', error)
      return { width: 120, height: 60 }
    }
  }

  /**
   * 计算边界
   */
  calculateBounds(positions) {
    if (positions.size === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const allPositions = Array.from(positions.values());
    const minX = Math.min(...allPositions.map(p => p.x));
    const maxX = Math.max(...allPositions.map(p => p.x));
    const minY = Math.min(...allPositions.map(p => p.y));
    const maxY = Math.max(...allPositions.map(p => p.y));

    return { minX, maxX, minY, maxY };
  }
}

// 默认导出快速布局类
export default HorizontalQuickLayout;