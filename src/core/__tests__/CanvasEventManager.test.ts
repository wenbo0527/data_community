import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CanvasEventManager } from '../CanvasEventManager'
import { CanvasEventBus } from '../CanvasEventBus'
import { CanvasEventTypes } from '../CanvasEventTypes'
import type { CanvasEvent } from '../CanvasEventTypes'

describe('CanvasEventManager', () => {
  let eventManager: CanvasEventManager
  let eventBus: CanvasEventBus

  beforeEach(() => {
    eventBus = new CanvasEventBus()
    eventManager = new CanvasEventManager(eventBus)
  })

  afterEach(() => {
    eventManager.destroy()
    eventBus.destroy()
  })

  describe('事件处理器注册', () => {
    it('应该能够注册事件处理器', () => {
      const handler = vi.fn()
      const result = eventManager.registerHandler('node.added', handler)

      expect(result).toBe(true)
      expect(eventManager.getHandler('node.added')).toBe(handler)
    })

    it('应该能够注册多个事件处理器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventManager.registerHandler('node.added', handler1)
      eventManager.registerHandler('node.removed', handler2)

      expect(eventManager.getHandler('node.added')).toBe(handler1)
      expect(eventManager.getHandler('node.removed')).toBe(handler2)
    })

    it('应该拒绝重复注册相同事件类型的处理器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventManager.registerHandler('node.added', handler1)
      const result = eventManager.registerHandler('node.added', handler2)

      expect(result).toBe(false)
      expect(eventManager.getHandler('node.added')).toBe(handler1)
    })
  })

  describe('事件处理器执行', () => {
    it('应该执行注册的事件处理器', () => {
      const handler = vi.fn()
      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventManager.registerHandler('node.added', handler)
      eventManager.processEvent(eventData)

      expect(handler).toHaveBeenCalledWith(eventData)
    })

    it('应该处理多个事件类型', () => {
      const nodeHandler = vi.fn()
      const connectionHandler = vi.fn()

      eventManager.registerHandler('node.added', nodeHandler)
      eventManager.registerHandler('connection.added', connectionHandler)

      const nodeEvent: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      const connectionEvent: CanvasEvent = {
        type: 'connection.added',
        payload: { id: 'edge1', source: 'node1', target: 'node2' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventManager.processEvent(nodeEvent)
      eventManager.processEvent(connectionEvent)

      expect(nodeHandler).toHaveBeenCalledWith(nodeEvent)
      expect(connectionHandler).toHaveBeenCalledWith(connectionEvent)
    })
  })

  describe('事件拦截和修改', () => {
    it('应该支持事件拦截', () => {
      const handler = vi.fn()
      const interceptor = vi.fn((event) => {
        event.payload.modified = true
        return event
      })

      eventManager.registerInterceptor('node.added', interceptor)
      eventManager.registerHandler('node.added', handler)

      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventManager.processEvent(eventData)

      expect(interceptor).toHaveBeenCalledWith(eventData)
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        payload: expect.objectContaining({ modified: true })
      }))
    })

    it('应该支持阻止事件传播', () => {
      const handler = vi.fn()
      const interceptor = vi.fn(() => {
        return null // 阻止事件传播
      })

      eventManager.registerInterceptor('node.added', interceptor)
      eventManager.registerHandler('node.added', handler)

      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventManager.processEvent(eventData)

      expect(interceptor).toHaveBeenCalledWith(eventData)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('事件批处理', () => {
    it('应该支持批量处理事件', () => {
      const handler = vi.fn()
      eventManager.registerHandler('node.added', handler)

      const events: CanvasEvent[] = [
        {
          type: 'node.added',
          payload: { id: 'node1', type: 'start' },
          timestamp: Date.now(),
          source: 'test'
        },
        {
          type: 'node.added',
          payload: { id: 'node2', type: 'end' },
          timestamp: Date.now() + 1,
          source: 'test'
        }
      ]

      eventManager.processBatch(events)

      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenCalledWith(events[0])
      expect(handler).toHaveBeenCalledWith(events[1])
    })
  })

  describe('性能统计', () => {
    it('应该记录事件处理统计', () => {
      const handler = vi.fn()
      eventManager.registerHandler('node.added', handler)

      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventManager.processEvent(eventData)
      eventManager.processEvent(eventData)

      const stats = eventManager.getStats()
      expect(stats.processedEvents).toBe(2)
      expect(stats.eventTypes['node.added']).toBe(2)
      expect(stats.handlerStats['node.added'].executions).toBe(2)
    })

    it('应该记录处理时间', () => {
      const handler = vi.fn(() => {
        // 模拟一些处理时间
        const start = Date.now()
        while (Date.now() - start < 10) {
          // 忙等待
        }
      })

      eventManager.registerHandler('node.added', handler)

      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventManager.processEvent(eventData)

      const stats = eventManager.getStats()
      expect(stats.handlerStats['node.added'].totalTime).toBeGreaterThan(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理处理器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error')
      })
      const normalHandler = vi.fn()

      eventManager.registerHandler('test.event', errorHandler)
      eventManager.registerHandler('test.event', normalHandler)

      const eventData: CanvasEvent = {
        type: 'test.event',
        payload: {},
        timestamp: Date.now(),
        source: 'test'
      }

      eventManager.processEvent(eventData)

      expect(consoleSpy).toHaveBeenCalledWith('事件处理器错误:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      const handler = vi.fn()
      eventManager.registerHandler('node.added', handler)
      eventManager.registerInterceptor('node.added', (event) => event)

      eventManager.destroy()

      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventManager.processEvent(eventData)
      expect(handler).not.toHaveBeenCalled()
    })
  })
})