import { describe, it, expect, beforeEach } from 'vitest'
import {
  track, trackFunnelStep, clearEvents, clearFunnelState, resetSession
} from '../../src/utils/trackerService.js'
import {
  computeFunnel, computeFunnelDropoff, computeBasicMetrics,
  CANVAS_FUNNEL_STEPS
} from '../../src/utils/canvasFunnel.js'

describe('canvasFunnel 归因算法', () => {
  beforeEach(() => {
    clearEvents()
    clearFunnelState()
    resetSession()
  })

  it('computeFunnel：空数据时所有步 count=0', () => {
    const r = computeFunnel()
    expect(r.totalSessions).toBe(0)
    expect(r.steps.every(s => s.count === 0 && s.conversion === 0)).toBe(true)
    expect(r.steps.length).toBe(CANVAS_FUNNEL_STEPS.length)
  })

  it('computeFunnel：单个会话完整漏斗，count 全为 1', () => {
    trackFunnelStep('canvas_creation', 'canvas_open')
    trackFunnelStep('canvas_creation', 'first_node_drop')
    trackFunnelStep('canvas_creation', 'first_node_saved')
    trackFunnelStep('canvas_creation', 'validate_pass')
    trackFunnelStep('canvas_creation', 'save_draft')
    trackFunnelStep('canvas_creation', 'publish')
    const r = computeFunnel()
    expect(r.totalSessions).toBe(1)
    expect(r.steps.every(s => s.count === 1)).toBe(true)
    expect(r.steps.every(s => s.conversion === 1)).toBe(true)
  })

  it('computeFunnel：2 个会话，仅 1 个完成发布，转化率 50%', () => {
    // 会话 1：完整漏斗
    trackFunnelStep('canvas_creation', 'canvas_open')
    trackFunnelStep('canvas_creation', 'first_node_drop')
    trackFunnelStep('canvas_creation', 'first_node_saved')
    trackFunnelStep('canvas_creation', 'validate_pass')
    trackFunnelStep('canvas_creation', 'save_draft')
    trackFunnelStep('canvas_creation', 'publish')
    // 会话 2：仅到 first_node_drop
    resetSession()
    trackFunnelStep('canvas_creation', 'canvas_open')
    trackFunnelStep('canvas_creation', 'first_node_drop')

    const r = computeFunnel()
    expect(r.totalSessions).toBe(2)
    const labels = r.steps.map(s => s.label)
    expect(r.steps[0].count).toBe(2) // canvas_open
    expect(r.steps[1].count).toBe(2) // first_node_drop
    expect(r.steps[5].count).toBe(1) // publish
    expect(r.steps[5].conversion).toBeCloseTo(0.5, 2)
  })

  it('computeFunnelDropoff：相邻步正确计算流失率', () => {
    trackFunnelStep('canvas_creation', 'canvas_open')
    trackFunnelStep('canvas_creation', 'first_node_drop')
    trackFunnelStep('canvas_creation', 'first_node_drop') // 同一会话去重
    trackFunnelStep('canvas_creation', 'first_node_saved') // 1/2 留存
    resetSession()
    trackFunnelStep('canvas_creation', 'canvas_open')
    trackFunnelStep('canvas_creation', 'first_node_drop')
    // 此时 first_node_drop 仍是 2/2；first_node_saved 1/2

    const d = computeFunnelDropoff()
    expect(d.length).toBe(CANVAS_FUNNEL_STEPS.length - 1)
    // canvas_open → first_node_drop 流失 0%
    expect(d[0].dropoff).toBe(0)
    // first_node_drop → first_node_saved 流失 0.5
    expect(d[1].fromCount).toBe(2)
    expect(d[1].toCount).toBe(1)
    expect(d[1].dropoff).toBeCloseTo(0.5, 2)
  })

  it('computeBasicMetrics：独立任务数与事件计数', () => {
    track('save_draft', { taskId: 1 })
    track('save_draft', { taskId: 1 })
    track('save_draft', { taskId: 2 })
    track('publish', { taskId: 1 })
    track('validate_fail', { taskId: 1 })
    track('combo_insert', { taskId: 2 })
    track('drawer_save', { taskId: 1 })
    track('drawer_save_fail', { taskId: 1 })
    const m = computeBasicMetrics(getEventsLocal())
    expect(m.totalTasks).toBe(2)
    expect(m.totalSaves).toBe(3)
    expect(m.totalPublish).toBe(1)
    expect(m.validateFailCount).toBe(1)
    expect(m.comboInsertCount).toBe(1)
    expect(m.drawerSaveFailRate).toBeCloseTo(0.5, 2)
  })

  it('computeBasicMetrics：空输入安全降级', () => {
    const m = computeBasicMetrics([])
    expect(m.totalTasks).toBe(0)
    expect(m.totalSaves).toBe(0)
    expect(m.drawerSaveFailRate).toBe(0)
  })
})

// 直接从 tracker 同步读取（避免循环依赖）
function getEventsLocal() {
  try {
    const raw = localStorage.getItem('horizontal_canvas_tracker_events')
    if (!raw) return []
    return JSON.parse(raw)
  } catch { return [] }
}
/*
用途：canvasFunnel 归因算法单元测试
说明：覆盖 computeFunnel / computeFunnelDropoff / computeBasicMetrics；测试隔离用 clearEvents/clearFunnelState/resetSession。
边界：tracker 在 beforeEach 重置；本地函数 getEventsLocal 直接读 localStorage 与 tracker 同步。
*/