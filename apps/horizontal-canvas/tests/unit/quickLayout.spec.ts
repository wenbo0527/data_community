import { describe, it, expect } from 'vitest'
import { HorizontalQuickLayout } from '../../src/pages/marketing/tasks/horizontal/utils/quickLayout.js'

describe('HorizontalQuickLayout (constructor + safe getters)', () => {
  it('默认配置：colSpacing/laneGapY/startX/startY 兜底', () => {
    const l = new HorizontalQuickLayout()
    expect(l.config.colSpacing).toBe(250)
    expect(l.config.laneGapY).toBe(150)
    expect(l.config.startX).toBe(100)
    expect(l.config.startY).toBe(100)
    expect(l.config.centerAlign).toBe(true)
  })

  it('自定义配置覆盖默认', () => {
    const l = new HorizontalQuickLayout({ colSpacing: 400, laneGapY: 200, centerAlign: false })
    expect(l.config.colSpacing).toBe(400)
    expect(l.config.laneGapY).toBe(200)
    expect(l.config.centerAlign).toBe(false)
  })

  it('safeGetNodes/safeGetEdges 防御性', () => {
    const l = new HorizontalQuickLayout()
    expect(l.safeGetNodes(null)).toEqual([])
    expect(l.safeGetEdges(null)).toEqual([])
    const fakeGraph = {}
    expect(l.safeGetNodes(fakeGraph)).toEqual([])
    expect(l.safeGetEdges(fakeGraph)).toEqual([])
    const okGraph = { getNodes: () => [{ id: 'a' }], getEdges: () => [{ id: 'e1' }] }
    expect(l.safeGetNodes(okGraph)).toEqual([{ id: 'a' }])
    expect(l.safeGetEdges(okGraph)).toEqual([{ id: 'e1' }])
    // 抛错时返回 []
    const throwingGraph = { getNodes: () => { throw new Error('boom') } }
    expect(l.safeGetNodes(throwingGraph)).toEqual([])
  })

  it('executeHierarchyTreeLayout: 空图返回 undefined', async () => {
    const l = new HorizontalQuickLayout()
    const r = await l.executeHierarchyTreeLayout(null, {})
    expect(r).toBeUndefined()
    const r2 = await l.executeHierarchyTreeLayout({ getNodes: () => [], getEdges: () => [] }, {})
    expect(r2).toBeUndefined()
  })
})
/*
用途：HorizontalQuickLayout 单元测试
说明：仅覆盖构造函数 + safe getters + 空图防御；不测完整 X6 路径（依赖 DOM）。
边界：核心算法正确性依赖集成测试；本单测兜底防御性场景。
*/