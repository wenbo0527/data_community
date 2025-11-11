import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import EventManager from '@/utils/preview-line/events/EventManager.js'
import { CanvasEventSystem, CanvasEventTypes } from '@/core'

describe('EventManager 优先级与回声抑制', () => {
  let em
  let handlers = []

  const onBus = (event, handler, options) => {
    CanvasEventSystem.eventBus.on(event, handler, options)
    handlers.push({ event, handler })
  }

  beforeEach(() => {
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

  it('监听器优先级：高优先级先执行且可停止传播', () => {
    const order = []

    em.on('preview-line:created', (evt, data) => {
      order.push('low')
    }, { priority: 0 })

    em.on('preview-line:created', (evt, data) => {
      order.push('high')
      evt.stopPropagation = true
    }, { priority: 100 })

    em.emit('preview-line:created', { id: 'pl-x' })

    expect(order[0]).toBe('high')
    expect(order).toHaveLength(1)
  })

  it('回声抑制：本地 emit 转发到总线，但不会回流触发本地监听器', () => {
    const localSpy = vi.fn()
    const busSpy = vi.fn()

    // 本地监听旧事件名
    em.on('preview-line:updated', (evt, payload) => localSpy(payload))

    // 总线监听新事件名
    onBus('canvas:preview-line-updated', busSpy)

    // 本地触发
    em.emit('preview-line:updated', { id: 'pl-123', changes: { x: 1 } })

    // 总线被触发一次
    expect(busSpy).toHaveBeenCalledTimes(1)
    const payload = busSpy.mock.calls[0][0]
    expect(payload.id).toBe('pl-123')
    expect(payload.meta?.source).toBe('EventManager')

    // 本地监听器不会因总线回流再次触发
    expect(localSpy).toHaveBeenCalledTimes(1)
  })

  it('错误事件映射与保留对象结构', () => {
    const busSpy = vi.fn()
    onBus(CanvasEventTypes.ERROR.EVENT_PROCESSING_FAILED, busSpy)

    const err = new Error('listener fail')
    // 通过 emit 让 EventManager 包装对象结构
    em.emit('listener:error', { error: err, context: 'unit' })

    expect(busSpy).toHaveBeenCalledTimes(1)
    const payload = busSpy.mock.calls[0][0]
    expect(payload.error).toBe(err)
    expect(payload.context).toBe('unit')
  })
})