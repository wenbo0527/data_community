import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import StateSynchronizer from '@/utils/preview-line/state/StateSynchronizer.js'
import { CanvasEventSystem, CanvasEventTypes } from '@/core'

describe('StateSynchronizer 冲突事件映射与触发', () => {
  let sync
  let handlers = []

  const addBusListener = (event, handler, options) => {
    CanvasEventSystem.eventBus.on(event, handler, options)
    handlers.push({ event, handler })
  }

  beforeEach(() => {
    if (!CanvasEventSystem.isInitialized || !CanvasEventSystem.isInitialized()) {
      CanvasEventSystem.initialize({ debug: true, performance: true })
    }
    sync = new StateSynchronizer({ enableLogging: false })
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

  it('检测到时间戳冲突时触发 conflict:detected 并映射到统一总线', async () => {
    const detectedSpy = vi.fn()
    addBusListener(CanvasEventTypes.ERROR.OPERATION_CONFLICT_DETECTED, detectedSpy)

    sync.registerConnection('A', { id: 'A', lastSync: Date.now() + 1000 })

    const op = { timestamp: Date.now(), data: { value: 1 }, source: 'unit' }
    const conflict = await sync.detectConflict('A', { value: 1 }, op)

    expect(conflict).toBeTruthy()
    expect(conflict.type).toBe('timestamp')
    expect(detectedSpy).toHaveBeenCalledTimes(1)
    const payload = detectedSpy.mock.calls[0][0]
    expect(payload.type).toBe('timestamp')
    expect(payload.targetId).toBe('A')
  })

  it('检测到数据冲突时触发 conflict:detected 并映射到统一总线', async () => {
    const detectedSpy = vi.fn()
    addBusListener(CanvasEventTypes.ERROR.OPERATION_CONFLICT_DETECTED, detectedSpy)

    sync.registerConnection('B', { id: 'B', lastSync: Date.now() - 1000, state: { a: 1 } })

    const op = { timestamp: Date.now(), data: { a: 2 }, source: 'unit' }
    const conflict = await sync.detectConflict('B', { a: 2 }, op)

    expect(conflict).toBeTruthy()
    expect(conflict.type).toBe('data')
    expect(detectedSpy).toHaveBeenCalledTimes(1)
    const payload = detectedSpy.mock.calls[0][0]
    expect(payload.type).toBe('data')
    expect(payload.targetId).toBe('B')
  })
})