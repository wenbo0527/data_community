import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UnifiedEventBus } from '@/core/UnifiedEventBus'

describe('UnifiedEventBus', () => {
  let eventBus: UnifiedEventBus

  beforeEach(() => {
    eventBus = new UnifiedEventBus()
  })

  describe('基础事件订阅和发布', () => {
    it('应该能够订阅和发布事件', () => {
      const mockHandler = vi.fn()
      const eventData = { message: 'test' }

      eventBus.on('test-event', mockHandler)
      eventBus.emit('test-event', eventData)

      expect(mockHandler).toHaveBeenCalledWith(eventData)
      expect(mockHandler).toHaveBeenCalledTimes(1)
    })

    it('应该支持多个监听器订阅同一事件', () => {
      const mockHandler1 = vi.fn()
      const mockHandler2 = vi.fn()
      const eventData = { message: 'test' }

      eventBus.on('test-event', mockHandler1)
      eventBus.on('test-event', mockHandler2)
      eventBus.emit('test-event', eventData)

      expect(mockHandler1).toHaveBeenCalledWith(eventData)
      expect(mockHandler2).toHaveBeenCalledWith(eventData)
    })

    it('应该能够取消订阅事件', () => {
      const mockHandler = vi.fn()
      
      eventBus.on('test-event', mockHandler)
      eventBus.off('test-event', mockHandler)
      eventBus.emit('test-event', { message: 'test' })

      expect(mockHandler).not.toHaveBeenCalled()
    })
  })

  describe('一次性事件监听', () => {
    it('应该支持一次性事件监听', () => {
      const mockHandler = vi.fn()
      
      eventBus.once('test-event', mockHandler)
      eventBus.emit('test-event', { message: 'test1' })
      eventBus.emit('test-event', { message: 'test2' })

      expect(mockHandler).toHaveBeenCalledTimes(1)
      expect(mockHandler).toHaveBeenCalledWith({ message: 'test1' })
    })
  })

  describe('事件命名空间', () => {
    it('应该支持命名空间事件', () => {
      const mockHandler = vi.fn()
      
      eventBus.on('canvas:node:add', mockHandler)
      eventBus.emit('canvas:node:add', { nodeId: '123' })

      expect(mockHandler).toHaveBeenCalledWith({ nodeId: '123' })
    })

    it('应该能够取消订阅命名空间下的所有事件', () => {
      const mockHandler1 = vi.fn()
      const mockHandler2 = vi.fn()
      
      eventBus.on('canvas:node:add', mockHandler1)
      eventBus.on('canvas:edge:add', mockHandler2)
      eventBus.offNamespace('canvas')
      
      eventBus.emit('canvas:node:add', { nodeId: '123' })
      eventBus.emit('canvas:edge:add', { edgeId: '456' })

      expect(mockHandler1).not.toHaveBeenCalled()
      expect(mockHandler2).not.toHaveBeenCalled()
    })
  })

  describe('事件优先级', () => {
    it('应该按照优先级顺序执行监听器', () => {
      const executionOrder: number[] = []
      
      eventBus.on('test-event', () => executionOrder.push(1), { priority: 1 })
      eventBus.on('test-event', () => executionOrder.push(3), { priority: 3 })
      eventBus.on('test-event', () => executionOrder.push(2), { priority: 2 })
      
      eventBus.emit('test-event')

      expect(executionOrder).toEqual([3, 2, 1])
    })
  })

  describe('异步事件处理', () => {
    it('应该支持异步事件监听器', async () => {
      const mockAsyncHandler = vi.fn().mockResolvedValue('success')
      
      eventBus.on('async-event', mockAsyncHandler)
      await eventBus.emitAsync('async-event', { data: 'test' })

      expect(mockAsyncHandler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该等待所有异步监听器完成', async () => {
      const results: string[] = []
      
      eventBus.on('async-event', async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        results.push('handler1')
      })
      
      eventBus.on('async-event', async () => {
        await new Promise(resolve => setTimeout(resolve, 5))
        results.push('handler2')
      })
      
      await eventBus.emitAsync('async-event')
      
      expect(results).toHaveLength(2)
      expect(results).toContain('handler1')
      expect(results).toContain('handler2')
    })
  })

  describe('错误处理', () => {
    it('应该捕获监听器中的错误并继续执行其他监听器', () => {
      const mockHandler1 = vi.fn(() => {
        throw new Error('Handler 1 error')
      })
      const mockHandler2 = vi.fn()
      const mockErrorHandler = vi.fn()
      
      eventBus.onError(mockErrorHandler)
      eventBus.on('test-event', mockHandler1)
      eventBus.on('test-event', mockHandler2)
      
      eventBus.emit('test-event', { data: 'test' })

      expect(mockHandler1).toHaveBeenCalled()
      expect(mockHandler2).toHaveBeenCalled()
      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          event: 'test-event',
          data: { data: 'test' }
        })
      )
    })
  })

  describe('事件统计和调试', () => {
    it('应该提供事件统计信息', () => {
      eventBus.on('test-event', vi.fn())
      eventBus.emit('test-event')
      
      const stats = eventBus.getStats()
      
      expect(stats.totalEvents).toBe(1)
      expect(stats.totalListeners).toBe(1)
      expect(stats.eventCounts['test-event']).toBe(1)
    })

    it('应该支持调试模式', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      eventBus.setDebugMode(true)
      eventBus.on('test-event', vi.fn())
      eventBus.emit('test-event', { data: 'test' })
      
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('内存管理', () => {
    it('应该能够清除所有监听器', () => {
      eventBus.on('event1', vi.fn())
      eventBus.on('event2', vi.fn())
      
      eventBus.clear()
      
      const stats = eventBus.getStats()
      expect(stats.totalListeners).toBe(0)
    })

    it('应该能够销毁事件总线', () => {
      const mockHandler = vi.fn()
      
      eventBus.on('test-event', mockHandler)
      eventBus.destroy()
      eventBus.emit('test-event', { data: 'test' })
      
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })
})