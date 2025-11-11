import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CanvasEventSystem, CanvasEventTypes } from '@/core'
import { StateManager } from '@/utils/preview-line/state/StateManager.js'

describe('StateManager 统一总线事件映射与兼容性', () => {
  let sm
  let handlers

  const onBus = (event, handler, options) => {
    CanvasEventSystem.eventBus.on(event, handler, options)
    handlers.push({ event, handler })
  }

  beforeEach(() => {
    if (!CanvasEventSystem.isInitialized || !CanvasEventSystem.isInitialized()) {
      CanvasEventSystem.initialize({ debug: true })
    }
    handlers = []
    sm = new StateManager({ enablePersistence: false, enableSync: true })
  })

  afterEach(() => {
    for (const { event, handler } of handlers) {
      try { CanvasEventSystem.eventBus.off(event, handler) } catch {}
    }
    handlers = []
    sm?.destroy && sm.destroy()
  })

  it('事件映射：state:sync → canvas:state-updated', () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.CANVAS.STATE_UPDATED, spy)

    // 通过公开方法触发同步流程
    sm.scheduleSync({ performance: { fps: 60 } })
    sm.processSyncQueue()

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload).toHaveProperty('changes')
  })

  it('事件映射：state:changed → canvas:state-changed', () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.CANVAS.STATE_CHANGED, spy)

    sm.applyStateChanges({ performance: { fps: 30 } })

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload).toHaveProperty('changes')
    expect(payload).toHaveProperty('state')
  })

  it('旧事件名订阅兼容：监听 state:sync 可收到统一总线事件', () => {
    const handler = vi.fn()
    const off = sm.eventManager.on('state:sync', handler)

    CanvasEventSystem.eventBus.emit(CanvasEventTypes.CANVAS.STATE_UPDATED, { ok: true })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0][0]).toMatchObject({ ok: true })

    off && off()
  })

  it('取消订阅：off(state:sync) 后不再接收事件', () => {
    const handler = vi.fn()
    const off = sm.eventManager.on('state:sync', handler)
    off && off()

    CanvasEventSystem.eventBus.emit(CanvasEventTypes.CANVAS.STATE_UPDATED, { ok: true })
    expect(handler).toHaveBeenCalledTimes(0)
  })

  it('错误处理映射：state:error → error:occurred', () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.ERROR.ERROR_OCCURRED, spy)

    sm.handleStateError(new Error('boom'), 'unit')

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload).toHaveProperty('error')
    expect(payload).toHaveProperty('context', 'unit')
  })

  it('一次性订阅：once(state:sync) 仅触发一次', () => {
    const handler = vi.fn()
    sm.eventManager.once('state:sync', handler)

    CanvasEventSystem.eventBus.emit(CanvasEventTypes.CANVAS.STATE_UPDATED, { a: 1 })
    CanvasEventSystem.eventBus.emit(CanvasEventTypes.CANVAS.STATE_UPDATED, { a: 2 })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0][0]).toMatchObject({ a: 1 })
  })
})