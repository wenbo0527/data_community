import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import EventManager from '@/utils/preview-line/events/EventManager.js'
import { CanvasEventSystem, CanvasEventTypes } from '@/core'

describe('EventManager 统一总线桥接与事件映射', () => {
  let em
  let handlers = []

  const addBusListener = (event, handler, options) => {
    CanvasEventSystem.eventBus.on(event, handler, options)
    handlers.push({ event, handler })
  }

  beforeEach(() => {
    // 确保统一事件系统已初始化
    if (!CanvasEventSystem.isInitialized || !CanvasEventSystem.isInitialized()) {
      CanvasEventSystem.initialize({ debug: true, performance: true })
    }
    em = new EventManager({ enableLogging: false })
    handlers = []
  })

  afterEach(() => {
    for (const { event, handler } of handlers) {
      try { CanvasEventSystem.eventBus.off(event, handler) } catch {}
    }
    handlers = []
    if (em && typeof em.destroy === 'function') {
      em.destroy()
    }
  })

  it('旧事件 state:changed 应映射到 canvas:state-changed 并转发到统一总线', () => {
    const spy = vi.fn()
    addBusListener(CanvasEventTypes.CANVAS.STATE_CHANGED, spy)

    em.emit('state:changed', { changes: { a: 1 } })

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.changes.a).toBe(1)
  })

  it('错误事件 preview-line:error 映射到 error:occurred', () => {
    const spy = vi.fn()
    addBusListener(CanvasEventTypes.ERROR.ERROR_OCCURRED, spy)

    const error = new Error('oops')
    em.emit('preview-line:error', { error, context: 'unit' })

    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.error).toBe(error)
    expect(payload.context).toBe('unit')
  })

  it('预览线生命周期 preview-line:create 映射到 preview-line:generated', () => {
    const spy = vi.fn()
    addBusListener(CanvasEventTypes.PREVIEW_LINE.GENERATED, spy)

    em.emit('preview-line:create', { id: 'pl-1' })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ id: 'pl-1' })
  })
})