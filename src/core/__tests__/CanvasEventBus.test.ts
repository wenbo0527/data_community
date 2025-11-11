import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CanvasEventBus } from '../CanvasEventBus'
import type { CanvasEvent } from '../CanvasEventTypes'

describe('CanvasEventBus', () => {
  let eventBus: CanvasEventBus

  beforeEach(() => {
    eventBus = new CanvasEventBus()
  })

  afterEach(() => {
    eventBus.destroy()
  })

  describe('事件注册和触发', () => {
    it('应该能够注册和触发事件监听器', () => {
      const listener = vi.fn()
      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.on('node.added', listener)
      eventBus.emit('node.added', eventData)

      expect(listener).toHaveBeenCalledWith(eventData)
    })

    it('应该能够注册一次性事件监听器', () => {
      const listener = vi.fn()
      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.once('node.added', listener)
      eventBus.emit('node.added', eventData)
      eventBus.emit('node.added', eventData)

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn()
      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.on('node.added', listener)
      eventBus.off('node.added', listener)
      eventBus.emit('node.added', eventData)

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('事件命名空间', () => {
    it('应该支持事件命名空间', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.on('node.*', listener1)
      eventBus.on('node.added', listener2)
      eventBus.emit('node.added', eventData)

      expect(listener1).toHaveBeenCalledWith(eventData)
      expect(listener2).toHaveBeenCalledWith(eventData)
    })

    it('应该支持多级命名空间', () => {
      const listener = vi.fn()
      const eventData: CanvasEvent = {
        type: 'keyboard.delete.pressed',
        payload: { key: 'Delete' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.on('keyboard.*', listener)
      eventBus.emit('keyboard.delete.pressed', eventData)

      expect(listener).toHaveBeenCalledWith(eventData)
    })
  })

  describe('事件优先级', () => {
    it('应该按照优先级顺序执行监听器', () => {
      const calls: string[] = []
      const highPriorityListener = () => calls.push('high')
      const normalPriorityListener = () => calls.push('normal')
      const lowPriorityListener = () => calls.push('low')

      eventBus.on('test.event', normalPriorityListener, { priority: 1 })
      eventBus.on('test.event', highPriorityListener, { priority: 10 })
      eventBus.on('test.event', lowPriorityListener, { priority: -1 })

      const eventData: CanvasEvent = {
        type: 'test.event',
        payload: {},
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.emit('test.event', eventData)

      expect(calls).toEqual(['high', 'normal', 'low'])
    })
  })

  describe('错误处理', () => {
    it('应该捕获并记录监听器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorListener = () => {
        throw new Error('Listener error')
      }
      const normalListener = vi.fn()

      eventBus.on('test.event', errorListener)
      eventBus.on('test.event', normalListener)

      const eventData: CanvasEvent = {
        type: 'test.event',
        payload: {},
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.emit('test.event', eventData)

      expect(consoleSpy).toHaveBeenCalledWith('CanvasEventBus 监听器错误:', expect.any(Error))
      expect(normalListener).toHaveBeenCalled() // 应该继续执行后续监听器

      consoleSpy.mockRestore()
    })
  })

  describe('性能统计', () => {
    it('应该记录事件统计信息', () => {
      const eventData: CanvasEvent = {
        type: 'node.added',
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.emit('node.added', eventData)
      eventBus.emit('node.added', eventData)
      eventBus.emit('node.removed', { ...eventData, type: 'node.removed' })

      const stats = eventBus.getStats()
      expect(stats.totalEvents).toBe(3)
      expect(stats.eventTypes['node.added']).toBe(2)
      expect(stats.eventTypes['node.removed']).toBe(1)
    })
  })

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      const listener = vi.fn()
      eventBus.on('test.event', listener)
      eventBus.destroy()

      const eventData: CanvasEvent = {
        type: 'test.event',
        payload: {},
        timestamp: Date.now(),
        source: 'test'
      }

      eventBus.emit('test.event', eventData)
      expect(listener).not.toHaveBeenCalled()
    })
  })
})