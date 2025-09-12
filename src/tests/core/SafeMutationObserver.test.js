import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SafeMutationObserver } from '../../core/SafeMutationObserver'
import { ResourceManager } from '../../core/ResourceManager'

/**
 * SafeMutationObserver 测试套件
 * 测试内存泄漏修复和资源管理功能
 */
describe('SafeMutationObserver', () => {
  let observer
  let mockElement
  let mockCallback
  let resourceManager

  beforeEach(() => {
    // 创建模拟DOM元素
    mockElement = document.createElement('div')
    document.body.appendChild(mockElement)
    
    // 创建模拟回调函数
    mockCallback = vi.fn()
    
    // 创建资源管理器实例
    resourceManager = new ResourceManager()
    
    // 模拟MutationObserver
    global.MutationObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => [])
    }))
  })

  afterEach(() => {
    // 清理DOM
    if (mockElement && mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement)
    }
    
    // 清理观察器
    if (observer) {
      observer.destroy()
    }
    
    // 清理资源管理器
    if (resourceManager) {
      resourceManager.cleanup()
    }
    
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该正确创建SafeMutationObserver实例', () => {
      observer = new SafeMutationObserver(mockCallback, resourceManager)
      
      expect(observer).toBeDefined()
      expect(observer.isObserving).toBe(false)
      expect(observer.getObservedElements()).toHaveLength(0)
    })

    it('应该在ResourceManager中注册自身', () => {
      const registerSpy = vi.spyOn(resourceManager, 'register')
      
      observer = new SafeMutationObserver(mockCallback, resourceManager)
      
      expect(registerSpy).toHaveBeenCalledWith(
        expect.stringContaining('SafeMutationObserver'),
        observer,
        expect.any(Function)
      )
    })
  })

  describe('观察器管理', () => {
    beforeEach(() => {
      observer = new SafeMutationObserver(mockCallback, resourceManager)
    })

    it('应该正确开始观察元素', () => {
      const result = observer.observe(mockElement, { childList: true })
      
      expect(result).toBe(true)
      expect(observer.isObserving).toBe(true)
      expect(observer.getObservedElements()).toContain(mockElement)
      expect(MutationObserver).toHaveBeenCalled()
    })

    it('应该防止重复观察同一元素', () => {
      observer.observe(mockElement, { childList: true })
      const result = observer.observe(mockElement, { childList: true })
      
      expect(result).toBe(false)
      expect(observer.getObservedElements()).toHaveLength(1)
    })

    it('应该正确停止观察元素', () => {
      observer.observe(mockElement, { childList: true })
      const result = observer.unobserve(mockElement)
      
      expect(result).toBe(true)
      expect(observer.getObservedElements()).not.toContain(mockElement)
    })

    it('应该处理观察不存在元素的情况', () => {
      const nonExistentElement = document.createElement('span')
      const result = observer.unobserve(nonExistentElement)
      
      expect(result).toBe(false)
    })
  })

  describe('内存泄漏防护', () => {
    beforeEach(() => {
      observer = new SafeMutationObserver(mockCallback, resourceManager)
    })

    it('应该在destroy时完全清理资源', () => {
      observer.observe(mockElement, { childList: true })
      
      const mockObserver = observer.mutationObserver
      const disconnectSpy = vi.spyOn(mockObserver, 'disconnect')
      
      observer.destroy()
      
      expect(disconnectSpy).toHaveBeenCalled()
      expect(observer.isObserving).toBe(false)
      expect(observer.getObservedElements()).toHaveLength(0)
      expect(observer.mutationObserver).toBeNull()
    })

    it('应该正确清理所有观察的元素', () => {
      const element1 = document.createElement('div')
      const element2 = document.createElement('span')
      document.body.appendChild(element1)
      document.body.appendChild(element2)
      
      observer.observe(element1, { childList: true })
      observer.observe(element2, { childList: true })
      
      expect(observer.getObservedElements()).toHaveLength(2)
      
      observer.destroy()
      
      expect(observer.getObservedElements()).toHaveLength(0)
      
      // 清理DOM
      document.body.removeChild(element1)
      document.body.removeChild(element2)
    })

    it('应该防止在销毁后继续使用', () => {
      observer.destroy()
      
      const result = observer.observe(mockElement, { childList: true })
      
      expect(result).toBe(false)
      expect(observer.isObserving).toBe(false)
    })
  })

  describe('错误处理', () => {
    beforeEach(() => {
      observer = new SafeMutationObserver(mockCallback, resourceManager)
    })

    it('应该处理无效的观察选项', () => {
      const result = observer.observe(mockElement, null)
      
      expect(result).toBe(false)
    })

    it('应该处理空元素引用', () => {
      const result = observer.observe(null, { childList: true })
      
      expect(result).toBe(false)
    })

    it('应该在MutationObserver创建失败时优雅处理', () => {
      global.MutationObserver = vi.fn().mockImplementation(() => {
        throw new Error('MutationObserver creation failed')
      })
      
      const result = observer.observe(mockElement, { childList: true })
      
      expect(result).toBe(false)
      expect(observer.isObserving).toBe(false)
    })
  })

  describe('回调执行', () => {
    beforeEach(() => {
      observer = new SafeMutationObserver(mockCallback, resourceManager)
    })

    it('应该正确执行变更回调', () => {
      observer.observe(mockElement, { childList: true })
      
      // 模拟MutationObserver回调
      const mockMutations = [{
        type: 'childList',
        target: mockElement,
        addedNodes: [],
        removedNodes: []
      }]
      
      // 获取传递给MutationObserver的回调并执行
      const observerCallback = MutationObserver.mock.calls[0][0]
      observerCallback(mockMutations, observer.mutationObserver)
      
      expect(mockCallback).toHaveBeenCalledWith(mockMutations, observer.mutationObserver)
    })
  })

  describe('性能和内存监控', () => {
    beforeEach(() => {
      observer = new SafeMutationObserver(mockCallback, resourceManager)
    })

    it('应该提供观察器状态信息', () => {
      observer.observe(mockElement, { childList: true })
      
      const status = observer.getStatus()
      
      expect(status).toEqual({
        isObserving: true,
        observedElementsCount: 1,
        isDestroyed: false
      })
    })

    it('应该在销毁后返回正确的状态', () => {
      observer.observe(mockElement, { childList: true })
      observer.destroy()
      
      const status = observer.getStatus()
      
      expect(status).toEqual({
        isObserving: false,
        observedElementsCount: 0,
        isDestroyed: true
      })
    })
  })
})