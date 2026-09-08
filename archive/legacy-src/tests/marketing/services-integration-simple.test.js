/**
 * 营销画布核心服务简化集成测试
 * 测试服务的基本功能和协作，不依赖复杂的 DOM 环境
 */

import { vi } from 'vitest'

// 模拟 X6 Graph
const mockGraph = {
  addNode: vi.fn(),
  addEdge: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  on: vi.fn(),
  off: vi.fn(),
  dispose: vi.fn(),
  zoom: vi.fn(),
  centerContent: vi.fn(),
  fitToContent: vi.fn()
}

// 动态导入服务
let GraphService, PreviewLineService, LayoutService, EventService, StateService

describe('营销画布核心服务集成测试', () => {
  let graphService
  let previewLineService
  let layoutService
  let eventService
  let stateService

  beforeAll(async () => {
    // 动态导入服务类
    try {
      const graphModule = await import('../../services/marketing/GraphService.js')
      GraphService = graphModule.GraphService

      const previewModule = await import('../../services/marketing/PreviewLineService.js')
      PreviewLineService = previewModule.PreviewLineService

      const layoutModule = await import('../../pages/marketing/tasks/services/LayoutService.js')
      LayoutService = layoutModule.LayoutService

      const eventModule = await import('../../pages/marketing/tasks/services/EventService.js')
      EventService = eventModule.EventService

      const stateModule = await import('../../pages/marketing/tasks/services/StateService.js')
      StateService = stateModule.StateService
    } catch (error) {
      console.warn('部分服务导入失败:', error.message)
    }
  })

  beforeEach(() => {
    // 重置模拟函数
    vi.clearAllMocks()
    
    // 初始化服务（使用 try-catch 处理可能的导入失败）
    try {
      if (GraphService) {
        graphService = new GraphService(mockGraph)
      }
    } catch (error) {
      console.warn('GraphService 初始化失败:', error.message)
    }

    try {
      if (PreviewLineService) {
        previewLineService = new PreviewLineService(mockGraph)
      }
    } catch (error) {
      console.warn('PreviewLineService 初始化失败:', error.message)
    }

    try {
      if (LayoutService) {
        layoutService = new LayoutService(mockGraph)
      }
    } catch (error) {
      console.warn('LayoutService 初始化失败:', error.message)
    }

    try {
      if (EventService) {
        eventService = new EventService(mockGraph)
      }
    } catch (error) {
      console.warn('EventService 初始化失败:', error.message)
    }

    try {
      if (StateService) {
        stateService = new StateService(mockGraph)
      }
    } catch (error) {
      console.warn('StateService 初始化失败:', error.message)
    }
  })

  afterEach(() => {
    // 清理服务
    try {
      if (layoutService && typeof layoutService.destroy === 'function') {
        layoutService.destroy()
      }
    } catch (error) {
      console.warn('LayoutService 清理失败:', error.message)
    }

    try {
      if (eventService && typeof eventService.destroy === 'function') {
        eventService.destroy()
      }
    } catch (error) {
      console.warn('EventService 清理失败:', error.message)
    }

    try {
      if (stateService && typeof stateService.destroy === 'function') {
        stateService.destroy()
      }
    } catch (error) {
      console.warn('StateService 清理失败:', error.message)
    }

    try {
      if (previewLineService && typeof previewLineService.destroy === 'function') {
        previewLineService.destroy()
      }
    } catch (error) {
      console.warn('PreviewLineService 清理失败:', error.message)
    }

    try {
      if (graphService && typeof graphService.destroy === 'function') {
        graphService.destroy()
      }
    } catch (error) {
      console.warn('GraphService 清理失败:', error.message)
    }
  })

  describe('服务可用性测试', () => {
    test('应该能够导入所有服务类', () => {
      expect(GraphService).toBeDefined()
      expect(PreviewLineService).toBeDefined()
      expect(LayoutService).toBeDefined()
      expect(EventService).toBeDefined()
      expect(StateService).toBeDefined()
    })

    test('服务应该能够正确实例化', () => {
      if (GraphService) {
        expect(() => new GraphService(mockGraph)).not.toThrow()
      }
      
      if (PreviewLineService) {
        expect(() => new PreviewLineService(mockGraph)).not.toThrow()
      }
      
      if (LayoutService) {
        expect(() => new LayoutService(mockGraph)).not.toThrow()
      }
      
      if (EventService) {
        expect(() => new EventService(mockGraph)).not.toThrow()
      }
      
      if (StateService) {
        expect(() => new StateService(mockGraph)).not.toThrow()
      }
    })
  })

  describe('服务基本功能测试', () => {
    test('GraphService 基本功能', () => {
      if (!graphService) {
        console.warn('GraphService 不可用，跳过测试')
        return
      }

      expect(graphService.graph).toBe(mockGraph)
      
      // 测试基本方法存在
      expect(typeof graphService.zoomIn).toBe('function')
      expect(typeof graphService.zoomOut).toBe('function')
      expect(typeof graphService.fitToContent).toBe('function')
      expect(typeof graphService.centerContent).toBe('function')
      
      // 测试状态获取
      const status = graphService.getStatus()
      expect(status).toBeDefined()
      expect(typeof status.initialized).toBe('boolean')
    })

    test('LayoutService 基本功能', () => {
      if (!layoutService) {
        console.warn('LayoutService 不可用，跳过测试')
        return
      }

      expect(layoutService.graph).toBe(mockGraph)
      
      // 测试基本方法存在
      expect(typeof layoutService.executeHierarchicalLayout).toBe('function')
      expect(typeof layoutService.executeHorizontalLayout).toBe('function')
      expect(typeof layoutService.executeVerticalLayout).toBe('function')
      
      // 测试状态获取
      const status = layoutService.getStatus()
      expect(status).toBeDefined()
      expect(typeof status.initialized).toBe('boolean')
    })

    test('EventService 基本功能', () => {
      if (!eventService) {
        console.warn('EventService 不可用，跳过测试')
        return
      }

      expect(eventService.graph).toBe(mockGraph)
      
      // 测试基本方法存在
      expect(typeof eventService.on).toBe('function')
      expect(typeof eventService.off).toBe('function')
      expect(typeof eventService.emit).toBe('function')
      
      // 测试状态获取
      const status = eventService.getStatus()
      expect(status).toBeDefined()
      expect(typeof status.initialized).toBe('boolean')
    })

    test('StateService 基本功能', () => {
      if (!stateService) {
        console.warn('StateService 不可用，跳过测试')
        return
      }

      expect(stateService.graph).toBe(mockGraph)
      
      // 测试基本方法存在
      expect(typeof stateService.setState).toBe('function')
      expect(typeof stateService.getState).toBe('function')
      expect(typeof stateService.subscribe).toBe('function')
      
      // 测试状态获取
      const status = stateService.getStatus()
      expect(status).toBeDefined()
      expect(typeof status.initialized).toBe('boolean')
    })

    test('PreviewLineService 基本功能', () => {
      if (!previewLineService) {
        console.warn('PreviewLineService 不可用，跳过测试')
        return
      }

      expect(previewLineService.graph).toBe(mockGraph)
      
      // 测试基本方法存在
      expect(typeof previewLineService.createPreviewLine).toBe('function')
      expect(typeof previewLineService.clearPreviewLine).toBe('function')
      
      // 测试状态获取
      const status = previewLineService.getStatus()
      expect(status).toBeDefined()
      expect(typeof status.initialized).toBe('boolean')
    })
  })

  describe('服务事件系统测试', () => {
    test('EventService 事件注册和触发', () => {
      if (!eventService) {
        console.warn('EventService 不可用，跳过测试')
        return
      }

      const mockCallback = vi.fn()
      
      // 注册事件监听器
      const listenerId = eventService.on('test:event', mockCallback)
      expect(listenerId).toBeDefined()
      
      // 触发事件
      eventService.emit('test:event', { data: 'test' })
      
      // 验证回调被调用
      expect(mockCallback).toHaveBeenCalledWith({ data: 'test' })
      
      // 移除事件监听器
      eventService.off('test:event', listenerId)
      
      // 再次触发事件，回调不应该被调用
      eventService.emit('test:event', { data: 'test2' })
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    test('StateService 状态订阅', () => {
      if (!stateService) {
        console.warn('StateService 不可用，跳过测试')
        return
      }

      const mockCallback = vi.fn()
      
      // 订阅状态变更
      const subscriptionId = stateService.subscribe('test', mockCallback)
      expect(subscriptionId).toBeDefined()
      
      // 设置状态
      stateService.setState('test', { value: 'test-data' })
      
      // 验证回调被调用
      expect(mockCallback).toHaveBeenCalled()
      
      // 取消订阅
      stateService.unsubscribe('test', subscriptionId)
    })
  })

  describe('服务协作测试', () => {
    test('服务间应该能够正常协作', () => {
      const availableServices = [
        graphService,
        previewLineService,
        layoutService,
        eventService,
        stateService
      ].filter(service => service !== undefined)

      expect(availableServices.length).toBeGreaterThan(0)
      
      // 验证所有可用服务都有基本的接口
      availableServices.forEach(service => {
        expect(typeof service.getStatus).toBe('function')
        
        const status = service.getStatus()
        expect(status).toBeDefined()
        expect(typeof status.initialized).toBe('boolean')
      })
    })

    test('服务销毁应该正确清理资源', () => {
      const services = [
        { service: layoutService, name: 'LayoutService' },
        { service: eventService, name: 'EventService' },
        { service: stateService, name: 'StateService' },
        { service: previewLineService, name: 'PreviewLineService' },
        { service: graphService, name: 'GraphService' }
      ]

      services.forEach(({ service, name }) => {
        if (service && typeof service.destroy === 'function') {
          expect(() => service.destroy()).not.toThrow()
          console.log(`✅ ${name} 销毁成功`)
        } else {
          console.warn(`⚠️ ${name} 不可用或没有 destroy 方法`)
        }
      })
    })
  })

  describe('错误处理测试', () => {
    test('服务应该能够处理无效输入', () => {
      // 测试 null 图实例
      if (LayoutService) {
        expect(() => new LayoutService(null)).not.toThrow()
      }
      
      if (EventService) {
        expect(() => new EventService(null)).not.toThrow()
      }
      
      if (StateService) {
        expect(() => new StateService(null)).not.toThrow()
      }
    })

    test('服务方法应该有适当的错误处理', async () => {
      if (layoutService) {
        // 测试布局执行错误处理
        const result = await layoutService.executeHierarchicalLayout()
        expect(result).toBeDefined()
        expect(typeof result.success).toBe('boolean')
      }

      if (stateService) {
        // 测试状态设置错误处理
        const result = stateService.setState('invalid-type', null)
        expect(typeof result).toBe('boolean')
      }
    })
  })

  describe('服务状态一致性测试', () => {
    test('所有服务状态应该保持一致', () => {
      const services = [
        { service: graphService, name: 'GraphService' },
        { service: previewLineService, name: 'PreviewLineService' },
        { service: layoutService, name: 'LayoutService' },
        { service: eventService, name: 'EventService' },
        { service: stateService, name: 'StateService' }
      ]

      const statuses = services
        .filter(({ service }) => service)
        .map(({ service, name }) => ({
          name,
          status: service.getStatus()
        }))

      // 验证所有服务都已初始化
      statuses.forEach(({ name, status }) => {
        expect(status.initialized).toBe(true)
        console.log(`✅ ${name} 状态正常:`, {
          initialized: status.initialized,
          enabled: status.enabled !== undefined ? status.enabled : 'N/A'
        })
      })

      expect(statuses.length).toBeGreaterThan(0)
    })
  })
})