/**
 * PreviewLineManager Builder 模式兼容性测试
 * 验证 Builder 模式与现有代码的兼容性
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('PreviewLineManager Builder 兼容性测试', () => {
  let mockGraph
  let mockLayoutEngine
  let mockConfigManager
  let mockEventManager

  beforeEach(() => {
    // 创建模拟对象
    mockGraph = {
      getNodes: vi.fn(() => []),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getCells: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn()
    }

    mockLayoutEngine = {
      isReady: vi.fn(() => true),
      calculatePosition: vi.fn(() => ({ x: 100, y: 100 }))
    }

    mockConfigManager = {
      get: vi.fn((path, defaultValue) => defaultValue),
      set: vi.fn(),
      watch: vi.fn()
    }

    mockEventManager = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    }
  })

  describe('传统构造函数兼容性', () => {
    it('应该支持传统的构造函数调用方式', async () => {
      const { PreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      // 传统方式创建实例
      const manager = new PreviewLineManager({
        graph: mockGraph,
        configManager: mockConfigManager,
        eventManager: mockEventManager,
        layoutEngine: mockLayoutEngine,
        initOptions: { autoInitialize: false }
      })

      expect(manager).toBeDefined()
      expect(manager.graph).toBe(mockGraph)
      expect(manager.configManager).toBe(mockConfigManager)
    })

    it('应该支持最小参数的传统构造', async () => {
      const { PreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      // 只传递必需参数
      const manager = new PreviewLineManager({
        graph: mockGraph
      })

      expect(manager).toBeDefined()
      expect(manager.graph).toBe(mockGraph)
    })
  })

  describe('PreviewLineSystem 集成兼容性', () => {
    it('应该与 PreviewLineSystem 的创建方式兼容', async () => {
      const { PreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManager.js')
      const { PreviewLineConfigManager } = await import('../utils/preview-line/config/PreviewLineConfig.js')
      
      // 模拟 PreviewLineSystem 的创建方式
      const configManager = new PreviewLineConfigManager()
      const manager = new PreviewLineManager({
        graph: mockGraph,
        configManager: configManager,
        layoutEngine: mockLayoutEngine,
        initOptions: { autoInitialize: false }
      })

      expect(manager).toBeInstanceOf(PreviewLineManager)
      expect(manager.graph).toBe(mockGraph)
      expect(manager.configManager).toBe(configManager)
    })
  })

  describe('LegacyAdapter 集成兼容性', () => {
    it('应该与 LegacyAdapter 的创建方式兼容', async () => {
      const { PreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      // 模拟 LegacyAdapter 中的创建方式
      const mergedOptions = {
        graph: mockGraph,
        branchManager: null,
        layoutEngine: mockLayoutEngine,
        config: {
          debug: { enabled: false },
          performance: { cacheEnabled: true }
        }
      }

      const manager = new PreviewLineManager(mergedOptions)

      expect(manager).toBeDefined()
      expect(manager.graph).toBe(mockGraph)
      expect(manager.layoutEngine.deref()).toBe(mockLayoutEngine)
    })
  })

  describe('Builder 模式与传统方式的等价性', () => {
    it('Builder 模式应该产生与传统构造函数相同的结果', async () => {
      const { PreviewLineManager, PreviewLineManagerBuilder } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      // 传统方式
      const traditionalManager = new PreviewLineManager({
        graph: mockGraph,
        layoutEngine: mockLayoutEngine,
        initOptions: { autoInitialize: false }
      })

      // Builder 方式 - 使用相同的配置
      const builderManager = new PreviewLineManagerBuilder()
        .withGraph(mockGraph)
        .withLayoutEngine(mockLayoutEngine)
        .withInitOptions({ autoInitialize: false })
        .build()

      // 验证核心属性相同
      expect(builderManager.graph).toBe(traditionalManager.graph)
      expect(builderManager.layoutEngine?.deref()).toBe(traditionalManager.layoutEngine?.deref())
      expect(builderManager.initOptions.autoInitialize).toBe(false)
      expect(traditionalManager.initOptions.autoInitialize).toBe(false)
      expect(builderManager.initOptions.autoInitialize).toBe(traditionalManager.initOptions.autoInitialize)
    })
  })

  describe('工厂函数兼容性', () => {
    it('createPreviewLineManager 工厂函数应该正常工作', async () => {
      const { createPreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      const manager = createPreviewLineManager({
        graph: mockGraph,
        layoutEngine: mockLayoutEngine
      })

      expect(manager).toBeDefined()
      expect(manager.graph).toBe(mockGraph)
    })

    it('Builder 工厂函数应该正常工作', async () => {
      const { createPreviewLineManagerBuilder } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      const builder = createPreviewLineManagerBuilder()
      expect(builder).toBeDefined()
      expect(typeof builder.withGraph).toBe('function')
    })
  })

  describe('现有测试用例兼容性', () => {
    it('应该与现有测试用例的创建方式兼容', async () => {
      const { PreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      // 模拟现有测试用例中的创建方式
      const manager = new PreviewLineManager({
        graph: mockGraph,
        configManager: mockConfigManager,
        eventManager: mockEventManager,
        layoutEngine: mockLayoutEngine,
        initOptions: {
          autoInitialize: false,
          validateOnInit: false
        }
      })

      expect(manager).toBeDefined()
      expect(manager.initOptions.autoInitialize).toBe(false)
      expect(manager.initOptions.validateOnInit).toBe(false)
    })
  })

  describe('API 兼容性', () => {
    it('所有公共方法应该保持可用', async () => {
      const { PreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      const manager = new PreviewLineManager({
        graph: mockGraph,
        initOptions: { autoInitialize: false }
      })

      // 验证关键方法存在
      expect(typeof manager.createUnifiedPreviewLine).toBe('function')
      expect(typeof manager.initialize).toBe('function')
      expect(typeof manager.destroy).toBe('function')
      expect(typeof manager.addEventListener).toBe('function')
      expect(typeof manager.removeEventListener).toBe('function')
    })

    it('Builder 创建的实例应该具有相同的 API', async () => {
      const { PreviewLineManagerBuilder } = await import('../utils/preview-line/core/PreviewLineManagerBuilder.js')
      
      const manager = new PreviewLineManagerBuilder()
        .withGraph(mockGraph)
        .withInitOptions({ autoInitialize: false })
        .build()

      // 验证关键方法存在
      expect(typeof manager.createUnifiedPreviewLine).toBe('function')
      expect(typeof manager.initialize).toBe('function')
      expect(typeof manager.destroy).toBe('function')
      expect(typeof manager.addEventListener).toBe('function')
      expect(typeof manager.removeEventListener).toBe('function')
    })
  })

  describe('错误处理兼容性', () => {
    it('应该保持相同的错误处理行为', async () => {
      const { PreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManager.js')
      
      // 测试无效参数的错误处理
      expect(() => {
        new PreviewLineManager({
          graph: null // 无效的 graph
        })
      }).toThrow()
    })

    it('Builder 应该提供更好的错误信息', async () => {
      const { PreviewLineManagerBuilder } = await import('../utils/preview-line/core/PreviewLineManagerBuilder.js')
      
      const builder = new PreviewLineManagerBuilder()
      
      // 测试构建时的验证
      expect(() => {
        builder.build() // 没有设置必需的 graph
      }).toThrow()
    })
  })
})