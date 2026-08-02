import { describe, it, expect, beforeEach } from 'vitest'
import {
  track, trackFunnelStep, getEvents, clearEvents, clearFunnelState,
  getAllFunnelStates, setRemote, resetSession, subscribe
} from '../../src/utils/trackerService.js'

describe('trackerService', () => {
  beforeEach(() => {
    clearEvents()
    clearFunnelState()
    resetSession()
  })

  it('track: 写入一条事件并能读出', () => {
    const e = track('canvas_open', { taskId: 1, version: 1, props: { mode: 'edit' } })
    expect(e).toBeTruthy()
    expect(e.event).toBe('canvas_open')
    expect(e.taskId).toBe('1')
    expect(e.version).toBe(1)
    expect(e.props.mode).toBe('edit')
    expect(typeof e.ts).toBe('number')
    expect(e.sessionId).toBeTruthy()
    expect(getEvents().length).toBe(1)
  })

  it('track: 无效事件名静默返回 null', () => {
    expect(track(null)).toBeNull()
    expect(track('')).toBeNull()
  })

  it('track: 同一任务下多条事件按时间升序', () => {
    track('a', { taskId: 1 })
    track('b', { taskId: 1 })
    track('c', { taskId: 2 })
    const evs = getEvents()
    expect(evs.map(e => e.event)).toEqual(['a', 'b', 'c'])
  })

  it('trackFunnelStep: 同一 (session, funnel, step) 仅首次记录', () => {
    trackFunnelStep('canvas_creation', 'canvas_open', { taskId: 1 })
    trackFunnelStep('canvas_creation', 'canvas_open', { taskId: 1 })
    const states = getAllFunnelStates('canvas_creation')
    expect(states.length).toBe(1)
    expect(Object.keys(states[0].steps)).toEqual(['canvas_open'])
  })

  it('trackFunnelStep: 不同 step 同会话独立累计', () => {
    trackFunnelStep('canvas_creation', 'canvas_open', {})
    trackFunnelStep('canvas_creation', 'first_node_drop', { nodeType: 'sms' })
    trackFunnelStep('canvas_creation', 'publish', { v: 1 })
    const states = getAllFunnelStates('canvas_creation')
    expect(states.length).toBe(1)
    expect(Object.keys(states[0].steps).sort()).toEqual(['canvas_open', 'first_node_drop', 'publish'])
  })

  it('subscribe: 触发回调', () => {
    let calls = 0
    const unsub = subscribe(() => { calls++ })
    track('test', { taskId: 1 })
    track('test', { taskId: 1 })
    expect(calls).toBe(2)
    unsub()
    track('test', { taskId: 1 })
    expect(calls).toBe(2)
  })

  it('setRemote: 注入的远程上报器被调用', async () => {
    let received = null
    setRemote(async (e) => { received = e; return true })
    const e = track('canvas_open', { taskId: 9, props: { a: 1 } })
    // 等待微任务
    await Promise.resolve()
    expect(received).toBeTruthy()
    expect(received.event).toBe('canvas_open')
    expect(received.taskId).toBe('9')
    setRemote(null)
  })
})
/*
用途：trackerService 单元测试
说明：覆盖 track / trackFunnelStep / subscribe / setRemote；测试隔离用 clearEvents/clearFunnelState/resetSession。
边界：tracker 写入 localStorage；不测远程上报返回值（依赖 Promise 微任务）。
*/