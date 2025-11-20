import { describe, it, expect } from 'vitest'
import { createHorizontalPortConfig } from '../portConfigFactoryHorizontal.js'
import { NODE_DIMENSIONS, TYPOGRAPHY } from '../../styles/nodeStyles.js'

describe('createHorizontalPortConfig', () => {
  it('生成单个输入端口并带有position参数', () => {
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
    const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0
    const rows = ['A', 'B', 'C']
    const contentHeight = rows.length * rowHeight
    const contentStart = headerHeight + contentPadding
    const contentCenter = contentStart + Math.floor(contentHeight / 2)
    const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + rows.length * rowHeight + 12)
    const cfg = createHorizontalPortConfig(rows.length, {
      includeIn: true,
      includeOut: true,
      outIds: rows.map((_, i) => `out-${i}`),
      verticalOffsets: rows.map((_, i) => headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust),
      nodeHeight: height,
      inVerticalOffset: contentCenter,
      contentStart,
      contentEnd: contentStart + contentHeight
    })
    const inItem = cfg.items.find(i => i.id === 'in')
    expect(inItem?.group).toBe('in')
    expect(typeof inItem?.args?.dy).toBe('number')
    expect(cfg.groups?.in?.position).toBe('left')
    expect(cfg.groups?.in?.layout?.name).toBe('fixed-left-y')
  })

  it('为每个out端口生成position.args.dy与args.dy一致', () => {
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
    const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0
    const rows = ['A', 'B', 'C']
    const contentHeight = rows.length * rowHeight
    const contentStart = headerHeight + contentPadding
    const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + rows.length * rowHeight + 12)
    const verticalOffsets = rows.map((_, i) => headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)
    const cfg = createHorizontalPortConfig(rows.length, {
      includeIn: true,
      includeOut: true,
      outIds: rows.map((_, i) => `out-${i}`),
      verticalOffsets,
      nodeHeight: height,
      inVerticalOffset: contentStart + Math.floor(contentHeight / 2),
      contentStart,
      contentEnd: contentStart + contentHeight
    })
    const outs = cfg.items.filter(i => i.group === 'out')
    expect(outs.length).toBe(rows.length)
    outs.forEach((it) => {
      expect(typeof it.args?.dy).toBe('number')
    })
    expect(cfg.groups?.out?.position).toBe('right')
    expect(cfg.groups?.out?.layout?.name).toBe('fixed-right-y')
  })
})