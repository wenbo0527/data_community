import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { EventCoordinator } from '../../core/EventCoordinator'
import { ResourceManager } from '../../core/ResourceManager'

/**
 * EventCoordinator 测试套件
 * 测试事件监听器统一管理和内存泄漏防护功能
 */
describe('EventCoordinator', () => {
  let eventCoordinator
  let resourceManager
  let mockElement1
  let mockElement2
  let mockHandler1
  let mockHandler2
  let mockHandler3

  beforeEach(() => {
    // 创建资源管理器
    resourceManager = new ResourceManager()
    
    // 创建事件协调器
    eventCoordinator = new EventCoordinator(resourceManager)
    
    // 创建模拟DOM元素
    mockElement1 = document.createElement('div')
    mockElement2 = document.createElement('button')
    document.body.appendChild(mockElement1)
    document.body.appendChild(mockElement2)
    
    // 创建模拟事件处理器
    mockHandler1 = vi.fn()
    mockHandler2 = vi.fn()
    mockHandler3 = vi.fn()
    
    // 模拟addEventListener和removeEventListener
    mockElement1.addEventListener = vi.fn()
    mockElement1.removeEventListener = vi.fn()
    mockElement2.addEventListener = vi.fn()
    mockElement2.removeEventListener = vi.fn()
  })

  afterEach(() => {
    // 清理DOM
    if (mockElement1 && mockElement1.parentNode) {
      mockElement1.parentNode.removeChild(mockElement1)
    }
    if (mockElement2 && mockElement2.parentNode) {
      mockElement2.parentNode.removeChild(mockElement2)
    }
    
    // 清理事件协调器
    if (eventCoordinator) {
      eventCoordinator.destroy()
    }
    
    // 清理资源管理器
    if (resourceManager) {
      resourceManager.cleanup()
    }
    
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该正确创建EventCoordinator实例', () => {
      expect(eventCoordinator).toBeDefined()
      expect(eventCoordinator.getListenerCount()).toBe(0)
      expect(eventCoordinator.isDestroyed()).toBe(false)
    })

    it('应该在ResourceManager中注册自身', () => {
      const registerSpy = vi.spyOn(resourceManager, 'register')
      
      const newCoordinator = new EventCoordinator(resourceManager)
      
      expect(registerSpy).toHaveBeenCalledWith(
        expect.stringContaining('EventCoordinator'),
        newCoordinator,
        expect.any(Function)
      )
      
      newCoordinator.destroy()
    })
  })

  describe('事件监听器添加', () => {
    it('应该正确添加单个事件监听器', () => {
      const result = eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      
      expect(result).toBe(true)
      expect(mockElement1.addEventListener).toHaveBeenCalledWith('click', mockHandler1, undefined)
      expect(eventCoordinator.getListenerCount()).toBe(1)
    })

    it('应该支持事件选项参数', () => {
      const options = { passive: true, once: true }
      const result = eventCoordinator.addEventListener(mockElement1, 'scroll', mockHandler1, options)
      
      expect(result).toBe(true)
      expect(mockElement1.addEventListener).toHaveBeenCalledWith('scroll', mockHandler1, options)
    })

    it('应该正确添加多个不同的事件监听器', () => {
      eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      eventCoordinator.addEventListener(mockElement1, 'mouseover', mockHandler2)
      eventCoordinator.addEventListener(mockElement2, 'click', mockHandler3)
      
      expect(eventCoordinator.getListenerCount()).toBe(3)
      expect(mockElement1.addEventListener).toHaveBeenCalledTimes(2)
      expect(mockElement2.addEventListener).toHaveBeenCalledTimes(1)
    })

    it('应该防止重复添加相同的事件监听器', () => {
      eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      const result = eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      
      expect(result).toBe(false)
      expect(eventCoordinator.getListenerCount()).toBe(1)
      expect(mockElement1.addEventListener).toHaveBeenCalledTimes(1)
    })

    it('应该允许同一元素的不同事件类型使用相同处理器', () => {
      eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      const result = eventCoordinator.addEventListener(mockElement1, 'mouseover', mockHandler1)
      
      expect(result).toBe(true)
      expect(eventCoordinator.getListenerCount()).toBe(2)
    })
  })

  describe('事件监听器移除', () => {
    beforeEach(() => {
      eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      eventCoordinator.addEventListener(mockElement1, 'mouseover', mockHandler2)
      eventCoordinator.addEventListener(mockElement2, 'click', mockHandler3)
    })

    it('应该正确移除单个事件监听器', () => {
      const result = eventCoordinator.removeEventListener(mockElement1, 'click', mockHandler1)
      
      expect(result).toBe(true)
      expect(mockElement1.removeEventListener).toHaveBeenCalledWith('click', mockHandler1, undefined)
      expect(eventCoordinator.getListenerCount()).toBe(2)
    })

    it('应该处理移除不存在的事件监听器', () => {
      const result = eventCoordinator.removeEventListener(mockElement1, 'keydown', mockHandler1)
      
      expect(result).toBe(false)
      expect(eventCoordinator.getListenerCount()).toBe(3)
    })

    it('应该正确移除元素的所有事件监听器', () => {
      const result = eventCoordinator.removeAllListeners(mockElement1)
      
      expect(result).toBe(true)
      expect(mockElement1.removeEventListener).toHaveBeenCalledTimes(2)
      expect(eventCoordinator.getListenerCount()).toBe(1)
    })

    it('应该处理移除没有监听器的元素', () => {
      const emptyElement = document.createElement('span')
      const result = eventCoordinator.removeAllListeners(emptyElement)
      
      expect(result).toBe(false)
      expect(eventCoordinator.getListenerCount()).toBe(3)
    })
  })

  describe('内存泄漏防护', () => {
    beforeEach(() => {
      eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      eventCoordinator.addEventListener(mockElement1, 'mouseover', mockHandler2)
      eventCoordinator.addEventListener(mockElement2, 'click', mockHandler3)
    })

    it('应该在destroy时清理所有事件监听器', () => {
      eventCoordinator.destroy()
      
      expect(mockElement1.removeEventListener).toHaveBeenCalledTimes(2)
      expect(mockElement2.removeEventListener).toHaveBeenCalledTimes(1)
      expect(eventCoordinator.getListenerCount()).toBe(0)
      expect(eventCoordinator.isDestroyed()).toBe(true)
    })

    it('应该防止在销毁后添加新的监听器', () => {
      eventCoordinator.destroy()
      
      const result = eventCoordinator.addEventListener(mockElement1, 'keydown', mockHandler1)
      
      expect(result).toBe(false)
      expect(eventCoordinator.getListenerCount()).toBe(0)
    })

    it('应该防止在销毁后移除监听器', () => {
      eventCoordinator.destroy()
      
      const result = eventCoordinator.removeEventListener(mockElement1, 'click', mockHandler1)
      
      expect(result).toBe(false)
    })

    it('应该正确处理元素移除时的清理', () => {
      const result = eventCoordinator.cleanupElement(mockElement1)
      
      expect(result).toBe(true)
      expect(mockElement1.removeEventListener).toHaveBeenCalledTimes(2)
      expect(eventCoordinator.getListenerCount()).toBe(1)
    })
  })

  describe('错误处理', () => {
    it('应该处理空元素引用', () => {
      const result = eventCoordinator.addEventListener(null, 'click', mockHandler1)
      
      expect(result).toBe(false)
      expect(eventCoordinator.getListenerCount()).toBe(0)
    })

    it('应该处理无效的事件类型', () => {
      const result = eventCoordinator.addEventListener(mockElement1, '', mockHandler1)
      
      expect(result).toBe(false)
      expect(eventCoordinator.getListenerCount()).toBe(0)
    })

    it('应该处理无效的处理器', () => {
      const result = eventCoordinator.addEventListener(mockElement1, 'click', null)
      
      expect(result).toBe(false)
      expect(eventCoordinator.getListenerCount()).toBe(0)
    })

    it('应该处理addEventListener抛出的异常', () => {
      mockElement1.addEventListener = vi.fn(() => {
        throw new Error('addEventListener failed')
      })
      
      const result = eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      
      expect(result).toBe(false)
      expect(eventCoordinator.getListenerCount()).toBe(0)
    })

    it('应该处理removeEventListener抛出的异常', () => {
      eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      
      mockElement1.removeEventListener = vi.fn(() => {
        throw new Error('removeEventListener failed')
      })
      
      expect(() => {
        eventCoordinator.removeEventListener(mockElement1, 'click', mockHandler1)
      }).not.toThrow()
      
      // 即使removeEventListener失败，也应该从内部记录中移除
      expect(eventCoordinator.getListenerCount()).toBe(0)
    })
  })

  describe('查询和统计', () => {
    beforeEach(() => {
      eventCoordinator.addEventListener(mockElement1, 'click', mockHandler1)
      eventCoordinator.addEventListener(mockElement1, 'mouseover', mockHandler2)
      eventCoordinator.addEventListener(mockElement2, 'click', mockHandler3)
    })

    it('应该正确获取监听器数量', () => {
      expect(eventCoordinator.getListenerCount()).toBe(3)
    })

    it('应该正确获取元素的监听器数量', () => {
      expect(eventCoordinator.getElementListenerCount(mockElement1)).toBe(2)
      expect(eventCoordinator.getElementListenerCount(mockElement2)).toBe(1)
    })

    it('应该正确获取所有监听的元素', () => {
      const elements = eventCoordinator.getListenedElements()
      
      expect(elements).toHaveLength(2)
      expect(elements).toContain(mockElement1)
      expect(elements).toContain(mockElement2)
    })

    it('应该提供详细的统计信息', () => {
      const stats = eventCoordinator.getStats()
      
      expect(stats).toEqual({
        totalListeners: 3,
        totalElements: 2,
        isDestroyed: false,
        listenersByElement: {
          [mockElement1.toString()]: 2,
          [mockElement2.toString()]: 1
        }
      })
    })

    it('应该在销毁后返回正确的统计信息', () => {
      eventCoordinator.destroy()
      
      const stats = eventCoordinator.getStats()
      
      expect(stats).toEqual({
        totalListeners: 0,
        totalElements: 0,
        isDestroyed: true,
        listenersByElement: {}
      })
    })
  })

  describe('批量操作', () => {
    it('应该支持批量添加事件监听器', () => {
      const listeners = [
        { element: mockElement1, type: 'click', handler: mockHandler1 },
        { element: mockElement1, type: 'mouseover', handler: mockHandler2 },
        { element: mockElement2, type: 'click', handler: mockHandler3 }
      ]
      
      const result = eventCoordinator.addEventListeners(listeners)
      
      expect(result).toBe(true)
      expect(eventCoordinator.getListenerCount()).toBe(3)
    })

    it('应该处理批量添加中的部分失败', () => {
      const listeners = [
        { element: mockElement1, type: 'click', handler: mockHandler1 },
        { element: null, type: 'click', handler: mockHandler2 }, // 无效
        { element: mockElement2, type: 'click', handler: mockHandler3 }
      ]
      
      const result = eventCoordinator.addEventListeners(listeners)
      
      expect(result).toBe(false) // 部分失败
      expect(eventCoordinator.getListenerCount()).toBe(2) // 成功添加的数量
    })
  })
})