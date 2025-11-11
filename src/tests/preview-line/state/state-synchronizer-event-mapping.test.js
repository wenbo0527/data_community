import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StateSynchronizer } from '@/utils/preview-line/state/StateSynchronizer.js'
import { CanvasEventSystem, CanvasEventTypes } from '@/core'

describe('StateSynchronizer 事件映射与兼容接口', () => {
  let sync
  let handlers = []

  const onBus = (event, handler, options) => {
    CanvasEventSystem.eventBus.on(event, handler, options)
    handlers.push({ event, handler })
  }

  beforeEach(() => {
    if (!CanvasEventSystem.isInitialized || !CanvasEventSystem.isInitialized()) {
      CanvasEventSystem.initialize({ debug: true, performance: true })
    }
    sync = new StateSynchronizer({ enableBroadcast: false, enableDebug: true })
    handlers = []
  })

  afterEach(() => {
    for (const { event, handler } of handlers) {
      try { CanvasEventSystem.eventBus.off(event, handler) } catch {}
    }
    handlers = []
    if (sync && typeof sync.destroy === 'function') {
      sync.destroy()
    }
  })

  it('使用统一总线：connection:registered → connection.added', () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.CONNECTION.ADDED, spy)

    sync.registerConnection('conn-1', { state: {} })

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.id).toBe('conn-1')
  })

  it('事件映射：sync:completed → canvas:state-updated', async () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.CANVAS.STATE_UPDATED, spy)

    // 注册一个目标连接
    sync.registerConnection('c-1', { setState: () => true })

    const result = await sync.syncState('unit', { a: 1 }, { targets: ['c-1'] })
    expect(result).toBe(true)

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.success).toBe(true)
    expect(payload.totalTargets).toBe(1)
  })

  it('向后兼容：on(旧事件)接收总线新事件', () => {
    const spy = vi.fn()
    const off = sync.eventManager.on('conflict:detected', spy)

    CanvasEventSystem.eventBus.emit(CanvasEventTypes.ERROR.OPERATION_CONFLICT_DETECTED, { ok: true })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ ok: true })

    off && off()
    CanvasEventSystem.eventBus.emit(CanvasEventTypes.ERROR.OPERATION_CONFLICT_DETECTED, { ok: false })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('错误处理：sync:error → error:occurred', () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.ERROR.ERROR_OCCURRED, spy)

    const err = new Error('boom')
    sync.handleSyncError(err, 'unit')

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.error).toBe(err)
    expect(payload.context).toBe('unit')
  })

  it('状态同步重置：sync:reset → history:cleared', () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.HISTORY.CLEARED, spy)

    sync.reset()

    expect(spy).toHaveBeenCalledTimes(1)
  })
})