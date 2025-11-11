import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import EventManager from '@/utils/preview-line/events/EventManager.js'
import { CanvasEventSystem } from '@/core'

describe('PreviewLine EventManager 统一总线桥接与事件映射', () => {
  let em
  let handlers = []

  const onBus = (event, handler, options) => {
    CanvasEventSystem.eventBus.on(event, handler, options)
    handlers.push({ event, handler })
  }

  beforeEach(() => {
    em = new EventManager({ enableLogging: false, enableWarnings: true })
    handlers = []
  })

  afterEach(() => {
    for (const { event, handler } of handlers) {
      try { CanvasEventSystem.eventBus.off(event, handler) } catch {}
    }
    handlers = []
  })

  it('统一总线桥接：本地 emit 会转发到总线（含meta.source）', () => {
    const spy = vi.fn()
    onBus('canvas:preview-line-created', spy)
    em.emit('preview-line:created', { id: 'pl-1' })
    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.id).toBe('pl-1')
    expect(payload.meta?.source).toBe('EventManager')
  })

  it('事件映射：preview-line:updated → canvas:preview-line-updated', () => {
    const spy = vi.fn()
    onBus('canvas:preview-line-updated', spy)
    em.emit('preview-line:updated', { id: 'pl-2', changes: { x: 10 } })
    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload.id).toBe('pl-2')
    expect(payload.changes).toEqual({ x: 10 })
  })

  it('向后兼容：on(旧事件)可接收总线新事件', () => {
    const spy = vi.fn()
    const off = em.on('preview-line:removed', (evt, data) => spy(data))
    CanvasEventSystem.eventBus.emit('canvas:preview-line-removed', { ok: true })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ ok: true })
    off && off()
    CanvasEventSystem.eventBus.emit('canvas:preview-line-removed', { ok: false })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('错误映射：preview-line:conflict-detected → error:preview-line-conflict', () => {
    const spy = vi.fn()
    onBus('error:preview-line-conflict', spy)
    const conflict = { type: 'port', id: 'c-1' }
    em.emit('preview-line:conflict-detected', conflict)
    expect(spy).toHaveBeenCalledTimes(1)
    const payload = spy.mock.calls[0][0]
    expect(payload).toMatchObject(conflict)
    expect(payload.meta).toMatchObject({ source: 'EventManager' })
  })

  it('事件优先级：高优先级监听器先执行（允许总线回流导致的重复调用）', () => {
    const order = []
    em.on('preview-line:created', () => { order.push('low') }, { priority: 1 })
    em.on('preview-line:created', () => { order.push('high') }, { priority: 10 })
    em.emit('preview-line:created', { id: 'pl-pri' })
    // 验证每次触发中，高优先级先于低优先级
    for (let i = 0; i < order.length; i += 2) {
      expect(order[i]).toBe('high')
      expect(order[i + 1]).toBe('low')
    }
  })
})