import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Graph } from '@antv/x6'
import { NODE_DIMENSIONS, TYPOGRAPHY } from '../styles/nodeStyles.js'
import { createHorizontalPortConfig } from '../utils/portConfigFactoryHorizontal.js'

// 使用 jsdom 提供的 DOM 环境
describe('DOM端口对齐集成测试', () => {
  let container: HTMLElement
  let graph: any

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '1200px'
    container.style.height = '800px'
    document.body.appendChild(container)
    graph = new Graph({ container, width: 1200, height: 800 })
  })

  it('分流节点三行时，out端口应与每行几何中点对齐（≤2px）', async () => {
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
    const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0
    const rows = ['命中：A', '命中：B', '否则：未命中']
    const width = NODE_DIMENSIONS.WIDTH
    const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + rows.length * rowHeight + 12)
    const contentStart = headerHeight + contentPadding
    const contentEnd = contentStart + rows.length * rowHeight
    const verticalOffsets = rows.map((_, i) => headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)

    const ports = createHorizontalPortConfig(rows.length, {
      includeIn: true,
      includeOut: true,
      outIds: rows.map((_, i) => `out-${i}`),
      verticalOffsets,
      nodeHeight: height,
      inVerticalOffset: contentStart + Math.floor((rows.length * rowHeight) / 2),
      contentStart,
      contentEnd
    })

    const node = graph.addNode({
      id: 'crowd-split-1',
      x: 200,
      y: 200,
      width,
      height,
      shape: 'rect',
      ports
    })

    await new Promise(r => setTimeout(r, 0))
    const view = graph.findViewByCell(node)
    const containerRect = container.getBoundingClientRect()
    const nodeRect = view.container.getBoundingClientRect()
    const nodeTopGraph = Math.round(nodeRect.top - containerRect.top)
    const nodeCenterGraphY = Math.round(nodeTopGraph + nodeRect.height / 2)
    const lineCentersGraphY = rows.map((_, i) => nodeTopGraph + contentStart + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)

    const getCircleCenterY = (pid: string) => {
      const containerEl = view.container as HTMLElement
      const el =
        containerEl.querySelector(`.x6-port-body[data-port="${pid}"]`) ||
        containerEl.querySelector(`.x6-port-body[port="${pid}"]`) ||
        containerEl.querySelector(`.x6-port[data-port="${pid}"] .x6-port-body`) ||
        containerEl.querySelector(`.x6-port[port="${pid}"] .x6-port-body`)
      if (!el) throw new Error(`未找到端口元素: ${pid}`)
      const r = (el as HTMLElement).getBoundingClientRect()
      return Math.round(r.top + r.height / 2 - containerRect.top)
    }

    const outs = ['out-0', 'out-1', 'out-2']
    const actualYs = outs.map(getCircleCenterY)
    outs.forEach((pid, idx) => {
      const dy = (node.getPorts() || []).find(p => p.id === pid)?.args?.dy ?? 0
      const finalY = nodeCenterGraphY + dy
      const deltaDom = Math.abs(actualYs[idx] - lineCentersGraphY[idx])
      const deltaCalc = Math.abs(finalY - lineCentersGraphY[idx])
      expect(deltaDom).toBeLessThanOrEqual(2)
      expect(deltaCalc).toBeLessThanOrEqual(2)
    })
  })
})