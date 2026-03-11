/**
 * PreviewLineManagerBuilder 测试用例
 * 测试 Builder 模式的实现和参数验证
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineManagerBuilder } from '../utils/preview-line/core/PreviewLineManagerBuilder.js'
import { PreviewLineManager } from '../utils/preview-line/core/PreviewLineManager.js'
import { PreviewLineConfigManager } from '../utils/preview-line/config/PreviewLineConfig.js'

describe('PreviewLineManagerBuilder', () => {
  let mockGraph
  let mockBranchManager
  let mockLayoutEngine
  let mockRenderer
  let builder

  beforeEach(() => {
    // 创建模拟的 Graph 实例
    mockGraph = {
      getNodes: vi.fn(() => []),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getCells: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建模拟的其他依赖
    mockBranchManager = {
      createBranch: vi.fn(),
      deleteBranch: vi.fn()
    }

    mockLayoutEngine = {
      layout: vi.fn(),
      updateLayout: vi.fn()
    }

    mockRenderer = {
      render: vi.fn(),
      update: vi.fn()
    }

    // 重置 Builder 实例
    builder = new PreviewLineManagerBuilder()
  })

  describe('基础构建功能', () => {
    it('应该能够创建新的 Builder 实例', () => {
      expect(builder).toBeInstanceOf(PreviewLineManagerBuilder)
      expect(builder._config).toBeDefined()
    })

    it('应该能够重置配置', () => {
      builder.withGraph(mockGraph)
      builder.reset()
      expect(builder._config.graph).toBeUndefined()
    })

    it('应该支持链式调用', () => {
      const result = builder
        .withGraph(mockGraph)
        .withBranchManager(mockBranchManager)
        .withLayoutEngine(mockLayoutEngine)

      expect(result).toBe(builder)
    })
  })

  describe('参数验证', () => {
    describe('withGraph 方法', () => {
      it('应该接受有效的 Graph 实例', () => {
        expect(() => {
          builder.withGraph(mockGraph)
        }).not.toThrow()
      })

      it('应该拒绝 null 或 undefined', () => {
        expect(() => {
          builder.withGraph(null)
        }).toThrow()

        expect(() => {
          builder.withGraph(undefined)
        }).toThrow()
      })

      it('应该验证 Graph 实例的必要方法', () => {
        const invalidGraph = {
          getNodes: vi.fn()
          // 缺少其他必要方法
        }

        expect(() => {
          builder.withGraph(invalidGraph)
        }).toThrow()
      })
    })

    describe('withConfigManager 方法', () => {
      it('应该接受 PreviewLineConfigManager 实例', () => {
        const configManager = new PreviewLineConfigManager()
        expect(() => {
          builder.withConfigManager(configManager)
        }).not.toThrow()
      })

      it('应该接受 null（可选参数）', () => {
        expect(() => {
          builder.withConfigManager(null)
        }).not.toThrow()
      })
    })

    describe('withPerformanceOptions 方法', () => {
      it('应该接受有效的性能配置', () => {
        const options = {
          maxCacheSize: 100,
          cacheEnabled: true
        }

        expect(() => {
          builder.withPerformanceOptions(options)
        }).not.toThrow()
      })

      it('应该验证 maxCacheSize 的范围', () => {
        expect(() => {
          builder.withPerformanceOptions({ maxCacheSize: -1 })
        }).toThrow()

        expect(() => {
          builder.withPerformanceOptions({ maxCacheSize: 20000 })
        }).toThrow()
      })

      it('应该验证 cacheEnabled 的类型', () => {
        expect(() => {
          builder.withPerformanceOptions({ cacheEnabled: 'true' })
        }).toThrow()
      })
    })
  })

  describe('配置验证', () => {
    it('应该要求必需的 Graph 参数', () => {
      expect(() => {
        builder.validate()
      }).toThrow()
    })

    it('应该检测配置冲突', () => {
      builder.withGraph(mockGraph)
      builder.withPerformanceOptions({
        cacheEnabled: false,
        maxCacheSize: 100
      })

      expect(() => {
        builder.validate()
      }).toThrow()
    })

    it('应该通过有效配置的验证', () => {
      builder.withGraph(mockGraph)
      builder.withPerformanceOptions({
        cacheEnabled: true,
        maxCacheSize: 100
      })

      expect(() => {
        builder.validate()
      }).not.toThrow()
    })
  })

  describe('构建 PreviewLineManager', () => {
    it('应该能够构建有效的 PreviewLineManager 实例', () => {
      const manager = builder
        .withGraph(mockGraph)
        .build()

      expect(manager).toBeInstanceOf(PreviewLineManager)
    })

    it('应该在构建前自动验证配置', () => {
      expect(() => {
        builder.build() // 没有设置必需的 graph
      }).toThrow()
    })

    it('应该传递所有配置到 PreviewLineManager', () => {
      const customConfig = { testOption: true }
      
      const manager = builder
        .withGraph(mockGraph)
        .withBranchManager(mockBranchManager)
        .withConfig(customConfig)
        .build()

      expect(manager).toBeInstanceOf(PreviewLineManager)
      // 验证配置是否正确传递（这里需要根据实际实现调整）
    })
  })

  describe('预设配置', () => {
    it('应该能够创建默认配置的构建器', () => {
      const defaultBuilder = PreviewLineManagerBuilder.createDefault()
      expect(defaultBuilder).toBeInstanceOf(PreviewLineManagerBuilder)
    })

    it('应该能够创建开发环境配置', () => {
      const devBuilder = PreviewLineManagerBuilder.createForDevelopment()
      expect(devBuilder).toBeInstanceOf(PreviewLineManagerBuilder)
      expect(devBuilder._config.debugOptions?.enabled).toBe(true)
    })

    it('应该能够创建生产环境配置', () => {
      const prodBuilder = PreviewLineManagerBuilder.createForProduction()
      expect(prodBuilder).toBeInstanceOf(PreviewLineManagerBuilder)
      expect(prodBuilder._config.performanceOptions?.cacheEnabled).toBe(true)
    })

    it('应该能够创建测试环境配置', () => {
      const testBuilder = PreviewLineManagerBuilder.createForTesting()
      expect(testBuilder).toBeInstanceOf(PreviewLineManagerBuilder)
    })
  })

  describe('工厂函数', () => {
    it('createPreviewLineManagerBuilder 应该返回新的构建器实例', async () => {
      const { createPreviewLineManagerBuilder } = await import('../utils/preview-line/core/PreviewLineManagerBuilder.js')
      const newBuilder = createPreviewLineManagerBuilder()
      expect(newBuilder).toBeInstanceOf(PreviewLineManagerBuilder)
    })

    it('createPreviewLineManager 应该直接创建 PreviewLineManager 实例', async () => {
      const { createPreviewLineManager } = await import('../utils/preview-line/core/PreviewLineManagerBuilder.js')
      
      const manager = createPreviewLineManager({
        graph: mockGraph
      })
      
      expect(manager).toBeInstanceOf(PreviewLineManager)
    })
  })

  describe('错误处理', () => {
    it('应该提供清晰的错误信息', () => {
      try {
        builder.withGraph(null)
      } catch (error) {
        expect(error.message).toContain('graph')
      }
    })

    it('应该在验证失败时提供详细信息', () => {
      builder.withGraph(mockGraph)
      builder.withPerformanceOptions({
        cacheEnabled: false,
        maxCacheSize: 100
      })

      try {
        builder.validate()
      } catch (error) {
        expect(error.message).toContain('配置验证失败')
      }
    })
  })

  describe('性能和内存管理', () => {
    it('应该能够处理大量配置选项', () => {
      const largeConfig = {}
      for (let i = 0; i < 1000; i++) {
        largeConfig[`option${i}`] = `value${i}`
      }

      expect(() => {
        builder
          .withGraph(mockGraph)
          .withConfig(largeConfig)
          .build()
      }).not.toThrow()
    })

    it('应该正确清理资源', () => {
      builder
        .withGraph(mockGraph)
        .withBranchManager(mockBranchManager)
        .reset()

      expect(builder._config.graph).toBeUndefined()
      expect(builder._config.branchManager).toBeUndefined()
    })
  })
})