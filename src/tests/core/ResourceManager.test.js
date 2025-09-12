import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ResourceManager } from '../../core/ResourceManager'

/**
 * ResourceManager 测试套件
 * 测试资源管理和内存泄漏防护功能
 */
describe('ResourceManager', () => {
  let resourceManager
  let mockResource1
  let mockResource2
  let mockCleanupFn1
  let mockCleanupFn2

  beforeEach(() => {
    resourceManager = new ResourceManager()
    
    // 创建模拟资源对象
    mockResource1 = {
      id: 'resource1',
      destroy: vi.fn(),
      cleanup: vi.fn()
    }
    
    mockResource2 = {
      id: 'resource2', 
      destroy: vi.fn(),
      cleanup: vi.fn()
    }
    
    // 创建模拟清理函数
    mockCleanupFn1 = vi.fn()
    mockCleanupFn2 = vi.fn()
  })

  afterEach(() => {
    if (resourceManager) {
      resourceManager.cleanup()
    }
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该正确创建ResourceManager实例', () => {
      expect(resourceManager).toBeDefined()
      expect(resourceManager.getResourceCount()).toBe(0)
      expect(resourceManager.isDestroyed()).toBe(false)
    })

    it('应该初始化空的资源映射', () => {
      const resources = resourceManager.getAllResources()
      expect(resources).toEqual({})
    })
  })

  describe('资源注册', () => {
    it('应该正确注册单个资源', () => {
      const result = resourceManager.register('test-resource', mockResource1, mockCleanupFn1)
      
      expect(result).toBe(true)
      expect(resourceManager.getResourceCount()).toBe(1)
      expect(resourceManager.hasResource('test-resource')).toBe(true)
    })

    it('应该防止重复注册相同ID的资源', () => {
      resourceManager.register('test-resource', mockResource1, mockCleanupFn1)
      const result = resourceManager.register('test-resource', mockResource2, mockCleanupFn2)
      
      expect(result).toBe(false)
      expect(resourceManager.getResourceCount()).toBe(1)
    })

    it('应该正确注册多个不同的资源', () => {
      resourceManager.register('resource1', mockResource1, mockCleanupFn1)
      resourceManager.register('resource2', mockResource2, mockCleanupFn2)
      
      expect(resourceManager.getResourceCount()).toBe(2)
      expect(resourceManager.hasResource('resource1')).toBe(true)
      expect(resourceManager.hasResource('resource2')).toBe(true)
    })

    it('应该处理没有清理函数的资源注册', () => {
      const result = resourceManager.register('no-cleanup', mockResource1)
      
      expect(result).toBe(true)
      expect(resourceManager.hasResource('no-cleanup')).toBe(true)
    })

    it('应该处理空资源对象的注册', () => {
      const result = resourceManager.register('null-resource', null, mockCleanupFn1)
      
      expect(result).toBe(true)
      expect(resourceManager.hasResource('null-resource')).toBe(true)
    })
  })

  describe('资源注销', () => {
    beforeEach(() => {
      resourceManager.register('resource1', mockResource1, mockCleanupFn1)
      resourceManager.register('resource2', mockResource2, mockCleanupFn2)
    })

    it('应该正确注销单个资源', () => {
      const result = resourceManager.unregister('resource1')
      
      expect(result).toBe(true)
      expect(mockCleanupFn1).toHaveBeenCalled()
      expect(resourceManager.getResourceCount()).toBe(1)
      expect(resourceManager.hasResource('resource1')).toBe(false)
    })

    it('应该处理注销不存在的资源', () => {
      const result = resourceManager.unregister('non-existent')
      
      expect(result).toBe(false)
      expect(resourceManager.getResourceCount()).toBe(2)
    })

    it('应该在清理函数抛出异常时继续执行', () => {
      const errorCleanupFn = vi.fn(() => {
        throw new Error('Cleanup error')
      })
      
      resourceManager.register('error-resource', {}, errorCleanupFn)
      
      const result = resourceManager.unregister('error-resource')
      
      expect(result).toBe(true)
      expect(errorCleanupFn).toHaveBeenCalled()
      expect(resourceManager.hasResource('error-resource')).toBe(false)
    })
  })

  describe('批量清理', () => {
    beforeEach(() => {
      resourceManager.register('resource1', mockResource1, mockCleanupFn1)
      resourceManager.register('resource2', mockResource2, mockCleanupFn2)
    })

    it('应该正确清理所有资源', () => {
      resourceManager.cleanup()
      
      expect(mockCleanupFn1).toHaveBeenCalled()
      expect(mockCleanupFn2).toHaveBeenCalled()
      expect(resourceManager.getResourceCount()).toBe(0)
      expect(resourceManager.isDestroyed()).toBe(true)
    })

    it('应该防止在销毁后注册新资源', () => {
      resourceManager.cleanup()
      
      const result = resourceManager.register('new-resource', {}, vi.fn())
      
      expect(result).toBe(false)
      expect(resourceManager.getResourceCount()).toBe(0)
    })

    it('应该防止在销毁后注销资源', () => {
      resourceManager.cleanup()
      
      const result = resourceManager.unregister('resource1')
      
      expect(result).toBe(false)
    })
  })

  describe('资源查询', () => {
    beforeEach(() => {
      resourceManager.register('resource1', mockResource1, mockCleanupFn1)
      resourceManager.register('resource2', mockResource2, mockCleanupFn2)
    })

    it('应该正确获取资源对象', () => {
      const resource = resourceManager.getResource('resource1')
      
      expect(resource).toBe(mockResource1)
    })

    it('应该处理获取不存在的资源', () => {
      const resource = resourceManager.getResource('non-existent')
      
      expect(resource).toBeNull()
    })

    it('应该正确获取所有资源', () => {
      const allResources = resourceManager.getAllResources()
      
      expect(allResources).toEqual({
        'resource1': mockResource1,
        'resource2': mockResource2
      })
    })

    it('应该正确获取资源ID列表', () => {
      const resourceIds = resourceManager.getResourceIds()
      
      expect(resourceIds).toEqual(['resource1', 'resource2'])
    })
  })

  describe('内存泄漏防护', () => {
    it('应该在资源对象有destroy方法时自动调用', () => {
      resourceManager.register('auto-destroy', mockResource1, mockCleanupFn1)
      
      resourceManager.unregister('auto-destroy')
      
      expect(mockResource1.destroy).toHaveBeenCalled()
      expect(mockCleanupFn1).toHaveBeenCalled()
    })

    it('应该在资源对象有cleanup方法时自动调用', () => {
      const resourceWithCleanup = {
        cleanup: vi.fn()
      }
      
      resourceManager.register('auto-cleanup', resourceWithCleanup)
      resourceManager.unregister('auto-cleanup')
      
      expect(resourceWithCleanup.cleanup).toHaveBeenCalled()
    })

    it('应该处理资源对象方法调用异常', () => {
      const errorResource = {
        destroy: vi.fn(() => {
          throw new Error('Destroy error')
        }),
        cleanup: vi.fn(() => {
          throw new Error('Cleanup error')
        })
      }
      
      resourceManager.register('error-resource', errorResource)
      
      expect(() => {
        resourceManager.unregister('error-resource')
      }).not.toThrow()
      
      expect(errorResource.destroy).toHaveBeenCalled()
      expect(errorResource.cleanup).toHaveBeenCalled()
    })
  })

  describe('性能监控', () => {
    it('应该提供资源统计信息', () => {
      resourceManager.register('resource1', mockResource1, mockCleanupFn1)
      resourceManager.register('resource2', mockResource2, mockCleanupFn2)
      
      const stats = resourceManager.getStats()
      
      expect(stats).toEqual({
        totalResources: 2,
        isDestroyed: false,
        resourceTypes: {
          'resource1': 'object',
          'resource2': 'object'
        }
      })
    })

    it('应该在销毁后返回正确的统计信息', () => {
      resourceManager.register('resource1', mockResource1, mockCleanupFn1)
      resourceManager.cleanup()
      
      const stats = resourceManager.getStats()
      
      expect(stats).toEqual({
        totalResources: 0,
        isDestroyed: true,
        resourceTypes: {}
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的资源ID', () => {
      const result1 = resourceManager.register('', mockResource1, mockCleanupFn1)
      const result2 = resourceManager.register(null, mockResource1, mockCleanupFn1)
      const result3 = resourceManager.register(undefined, mockResource1, mockCleanupFn1)
      
      expect(result1).toBe(false)
      expect(result2).toBe(false)
      expect(result3).toBe(false)
      expect(resourceManager.getResourceCount()).toBe(0)
    })

    it('应该处理清理函数不是函数的情况', () => {
      const result = resourceManager.register('test', mockResource1, 'not-a-function')
      
      expect(result).toBe(true)
      expect(resourceManager.hasResource('test')).toBe(true)
    })
  })
})