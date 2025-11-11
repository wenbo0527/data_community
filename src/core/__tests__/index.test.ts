import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CanvasEventSystem } from '../index'
import { CanvasEventBus } from '../CanvasEventBus'
import { CanvasEventManager } from '../CanvasEventManager'
import { KeyboardEventHandler } from '../KeyboardEventHandler'
import { MouseEventHandler } from '../MouseEventHandler'
import { CanvasServiceIntegration } from '../CanvasServiceIntegration'

describe('CanvasEventSystem', () => {
  let originalWindow: any

  beforeEach(() => {
    // 保存原始 window 对象
    originalWindow = global.window
    // 创建 mock window 对象
    global.window = {
      CanvasEventSystem: undefined
    } as any
  })

  afterEach(() => {
    // 恢复原始 window 对象
    global.window = originalWindow
    // 清理 CanvasEventSystem 实例
    if (CanvasEventSystem && typeof CanvasEventSystem.destroy === 'function') {
      CanvasEventSystem.destroy()
    }
  })

  describe('模块导出', () => {
    it('应该正确导出所有核心模块', () => {
      expect(CanvasEventBus).toBeDefined()
      expect(CanvasEventManager).toBeDefined()
      expect(KeyboardEventHandler).toBeDefined()
      expect(MouseEventHandler).toBeDefined()
      expect(CanvasServiceIntegration).toBeDefined()
    })

    it('应该导出事件类型和常量', () => {
      const { CanvasEventTypes, EventCategories, EventPriorities } = require('../index')
      
      expect(CanvasEventTypes).toBeDefined()
      expect(EventCategories).toBeDefined()
      expect(EventPriorities).toBeDefined()
      expect(CanvasEventTypes.NODE_ADDED).toBe('node.added')
      expect(CanvasEventTypes.CONNECTION_ADDED).toBe('connection.added')
    })
  })

  describe('CanvasEventSystem 实例', () => {
    it('应该创建全局 CanvasEventSystem 实例', () => {
      expect(CanvasEventSystem).toBeDefined()
      expect(CanvasEventSystem.eventBus).toBeDefined()
      expect(CanvasEventSystem.eventManager).toBeDefined()
      expect(CanvasEventSystem.keyboardHandler).toBeDefined()
      expect(CanvasEventSystem.mouseHandler).toBeDefined()
      expect(CanvasEventSystem.serviceIntegration).toBeDefined()
    })

    it('应该正确初始化事件系统', () => {
      const result = CanvasEventSystem.initialize({
        debug: true,
        performance: true
      })

      expect(result).toBe(true)
      expect(CanvasEventSystem.isInitialized()).toBe(true)
      expect(CanvasEventSystem.getConfig().debug).toBe(true)
      expect(CanvasEventSystem.getConfig().performance).toBe(true)
    })

    it('应该支持多次初始化调用', () => {
      const result1 = CanvasEventSystem.initialize()
      const result2 = CanvasEventSystem.initialize({ debug: true })

      expect(result1).toBe(true)
      expect(result2).toBe(true) // 应该支持重复初始化
    })
  })

  describe('事件系统功能', () => {
    beforeEach(() => {
      CanvasEventSystem.initialize({
        debug: false, // 测试时关闭调试模式
        performance: false
      })
    })

    it('应该能够通过事件总线发布事件', () => {
      const listener = vi.fn()
      CanvasEventSystem.eventBus.on('test.event', listener)

      CanvasEventSystem.emit('test.event', {
        type: 'test.event',
        payload: { data: 'test' },
        timestamp: Date.now(),
        source: 'test'
      })

      expect(listener).toHaveBeenCalled()
    })

    it('应该能够通过事件管理器处理事件', () => {
      const handler = vi.fn()
      CanvasEventSystem.eventManager.registerHandler('test.event', handler)

      CanvasEventSystem.processEvent({
        type: 'test.event',
        payload: { data: 'test' },
        timestamp: Date.now(),
        source: 'test'
      })

      expect(handler).toHaveBeenCalled()
    })

    it('应该能够批量处理事件', () => {
      const handler = vi.fn()
      CanvasEventSystem.eventManager.registerHandler('test.event', handler)

      CanvasEventSystem.processBatch([
        {
          type: 'test.event',
          payload: { data: 'test1' },
          timestamp: Date.now(),
          source: 'test'
        },
        {
          type: 'test.event',
          payload: { data: 'test2' },
          timestamp: Date.now() + 1,
          source: 'test'
        }
      ])

      expect(handler).toHaveBeenCalledTimes(2)
    })
  })

  describe('键盘事件处理', () => {
    it('应该能够初始化键盘事件处理器', () => {
      const mockElement = document.createElement('div')
      
      CanvasEventSystem.initializeKeyboardHandler(mockElement)
      
      expect(CanvasEventSystem.keyboardHandler).toBeDefined()
      // 注意：实际测试中需要 DOM 环境
    })

    it('应该能够添加自定义快捷键', () => {
      CanvasEventSystem.addCustomShortcut('ctrl+shift+t', 'custom.test')
      
      // 验证快捷键是否被添加
      // 注意：这需要访问内部状态，实际测试中可能需要其他验证方式
    })
  })

  describe('鼠标事件处理', () => {
    it('应该能够初始化鼠标事件处理器', () => {
      const mockElement = document.createElement('div')
      
      CanvasEventSystem.initializeMouseHandler(mockElement)
      
      expect(CanvasEventSystem.mouseHandler).toBeDefined()
    })
  })

  describe('服务集成', () => {
    it('应该能够配置服务集成', () => {
      const mockStore = {
        state: { canvas: { nodes: [], connections: [] } },
        commit: vi.fn(),
        dispatch: vi.fn()
      }

      CanvasEventSystem.configureServiceIntegration({
        store: mockStore,
        enableBridge: true,
        enableValidation: true,
        enableSync: true
      })

      expect(CanvasEventSystem.serviceIntegration).toBeDefined()
    })

    it('应该能够注册服务适配器', () => {
      const mockAdapter = {
        name: 'TestAdapter',
        initialize: vi.fn(),
        destroy: vi.fn(),
        syncState: vi.fn()
      }

      CanvasEventSystem.registerServiceAdapter('test', mockAdapter)
      
      // 验证适配器是否被注册
      const adapter = CanvasEventSystem.serviceIntegration.getAdapter('test')
      expect(adapter).toBe(mockAdapter)
    })
  })

  describe('状态管理', () => {
    beforeEach(() => {
      CanvasEventSystem.initialize()
    })

    it('应该能够获取系统状态', () => {
      const status = CanvasEventSystem.getStatus()
      
      expect(status).toBeDefined()
      expect(status.initialized).toBe(true)
      expect(status.eventBus).toBeDefined()
      expect(status.eventManager).toBeDefined()
      expect(status.keyboardHandler).toBeDefined()
      expect(status.mouseHandler).toBeDefined()
      expect(status.serviceIntegration).toBeDefined()
    })

    it('应该能够获取性能统计', () => {
      const stats = CanvasEventSystem.getPerformanceStats()
      
      expect(stats).toBeDefined()
      expect(stats.eventBusStats).toBeDefined()
      expect(stats.eventManagerStats).toBeDefined()
      expect(stats.keyboardHandlerStats).toBeDefined()
      expect(stats.mouseHandlerStats).toBeDefined()
      expect(stats.serviceIntegrationStats).toBeDefined()
    })
  })

  describe('工具函数', () => {
    it('应该提供事件类型验证', () => {
      const validResult = CanvasEventSystem.validateEventType('node.added')
      const invalidResult = CanvasEventSystem.validateEventType('invalid.event')

      expect(validResult).toBe(true)
      expect(invalidResult).toBe(false)
    })

    it('应该提供事件创建工具', () => {
      const event = CanvasEventSystem.createEvent('node.added', {
        id: 'node1',
        type: 'start'
      })

      expect(event).toBeDefined()
      expect(event.type).toBe('node.added')
      expect(event.payload).toEqual({ id: 'node1', type: 'start' })
      expect(event.timestamp).toBeDefined()
      expect(event.source).toBe('CanvasEventSystem')
    })
  })

  describe('错误处理', () => {
    it('应该处理初始化错误', () => {
      // 模拟初始化错误
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // 这里可以测试各种错误情况
      
      consoleSpy.mockRestore()
    })

    it('应该处理事件处理错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // 注册一个会抛出错误的事件处理器
      CanvasEventSystem.eventManager.registerHandler('error.event', () => {
        throw new Error('Test error')
      })

      CanvasEventSystem.processEvent({
        type: 'error.event',
        payload: {},
        timestamp: Date.now(),
        source: 'test'
      })

      // 验证错误被正确处理
      
      consoleSpy.mockRestore()
    })
  })

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      CanvasEventSystem.initialize()
      
      const result = CanvasEventSystem.destroy()
      
      expect(result).toBe(true)
      expect(CanvasEventSystem.isInitialized()).toBe(false)
    })

    it('应该支持重复销毁', () => {
      CanvasEventSystem.destroy()
      const result = CanvasEventSystem.destroy()
      
      expect(result).toBe(true) // 应该支持重复销毁
    })
  })
})