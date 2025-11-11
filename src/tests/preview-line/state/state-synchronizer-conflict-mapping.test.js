import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CanvasEventSystem, CanvasEventTypes } from '@/core'
import { StateSynchronizer } from '@/utils/preview-line/state/StateSynchronizer.js'

describe('StateSynchronizer 冲突检测映射到统一错误事件', () => {
  let sync
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
    sync = new StateSynchronizer({ enableBroadcast: false, enableLogging: false })
  })

  afterEach(() => {
    for (const { event, handler } of handlers) {
      try { CanvasEventSystem.eventBus.off(event, handler) } catch {}
    }
    handlers = []
    sync?.destroy && sync.destroy()
  })

  it('时间戳冲突应触发 error:preview-line-conflict', async () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.ERROR.PREVIEW_LINE_CONFLICT, spy)

    const conn = { state: {}, lastSync: Date.now() + 10000 }
    sync.registerConnection('t-2', conn)

    const ok = await sync.syncState('unit', { id: 'x' }, { targets: ['t-2'] })
    expect(ok).toBe(false)

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.type).toBe('timestamp')
    expect(payload.targetId).toBe('t-2')
  })

  it('数据冲突应触发 error:preview-line-conflict', async () => {
    const spy = vi.fn()
    onBus(CanvasEventTypes.ERROR.PREVIEW_LINE_CONFLICT, spy)

    const connObj = {
      state: { a: 1 },
      setState: vi.fn(async () => true),
      lastSync: Date.now() - 1000
    }
    // 直接传入连接对象，避免嵌套导致状态读取失败
    sync.registerConnection('t-3', connObj)

    const ok = await sync.syncState('unit', { a: 2 }, { targets: ['t-3'] })
    // 结果可能因策略而异，这里仅验证事件映射

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.type).toBe('data')
    expect(payload.targetId).toBe('t-3')
  })
})