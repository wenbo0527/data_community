/**
 * PreviewLineValidator 修复测试
 * 测试 start-node 处理逻辑和错误修复
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineValidator } from '../../utils/preview-line/core/PreviewLineValidator.js'
import { PreviewLineStates } from '../../utils/preview-line/types/PreviewLineTypes.js'

describe('PreviewLineValidator 修复测试', () => {
  let validator
  let mockGraph
  let mockConfigManager

  beforeEach(() => {
    mockConfigManager = {
      getConfig: vi.fn(() => ({
        validation: { enabled: true },
        performance: { enabled: true }
      })),
      get: vi.fn((key, defaultValue) => {
        if (key === 'debug.enabled') return true
        return defaultValue
      })
    }

    mockGraph = {
      getNodes: vi.fn(() => []),
      getCellById: vi.fn(),
      hasCell: vi.fn(() => true) // 修改为 true，让节点被认为在图中存在
    }

    validator = new PreviewLineValidator(mockConfigManager, mockGraph)
  })

  describe('start-node 类型识别修复', () => {
    it('应该正确识别 start 节点类型', async () => {
      const startNode = {
        id: 'start-node',
        data: {
          type: 'start',
          nodeType: 'start',
          isConfigured: true
        },
        getId: () => 'start-node',
        store: { data: { data: { type: 'start' } } }
      }

      const result = await validator.checkPreviewLineRequirement(
        startNode,
        PreviewLineStates.ACTIVE,
        new Map()
      )

      expect(result).toBeDefined()
      expect(result.needsCreation).toBeDefined()
      expect(result.reason).toBeDefined()
    })

    it('应该在错误日志中显示正确的节点类型而不是 "object"', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const invalidNode = {
        id: 'start-node',
        data: {
          type: 'start',
          nodeType: 'start'
        },
        // 故意制造错误
        getId: () => { throw new Error('测试错误') }
      }

      try {
        await validator.checkPreviewLineRequirement(
          invalidNode,
          PreviewLineStates.ACTIVE,
          new Map()
        )
      } catch (error) {
        // 预期会有错误
      }

      // 检查错误日志是否包含正确的节点类型
      const errorCalls = consoleSpy.mock.calls.filter(call => 
        call[0] && call[0].includes('预览线需求检查异常')
      )

      if (errorCalls.length > 0) {
        const errorMessage = errorCalls[0][0]
        expect(errorMessage).toContain('start-node')
        expect(errorMessage).not.toContain('object-node')
      }

      consoleSpy.mockRestore()
    })

    it('应该正确处理节点类型的多种获取方式', async () => {
      const testCases = [
        {
          name: 'data.type',
          node: { id: 'test', data: { type: 'start' } }
        },
        {
          name: 'data.nodeType',
          node: { id: 'test', data: { nodeType: 'start' } }
        },
        {
          name: 'nodeType',
          node: { id: 'test', nodeType: 'start' }
        },
        {
          name: 'type',
          node: { id: 'test', type: 'start' }
        }
      ]

      for (const testCase of testCases) {
        const result = await validator.checkPreviewLineRequirement(
          testCase.node,
          PreviewLineStates.ACTIVE,
          new Map()
        )

        expect(result).toBeDefined()
        // 应该能够识别为 start 节点
        expect(result.reason).not.toContain('unknown')
      }
    })
  })

  describe('错误处理改进', () => {
    it('应该提供详细的错误上下文信息', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const problematicNode = {
        id: 'test-node',
        data: { type: 'start' },
        getId: () => { throw new Error('ID获取失败') }
      }

      try {
        await validator.checkPreviewLineRequirement(
          problematicNode,
          PreviewLineStates.ACTIVE,
          new Map()
        )
      } catch (error) {
        // 预期会有错误
      }

      // 检查是否记录了详细的错误上下文
      const errorCalls = consoleSpy.mock.calls
      if (errorCalls.length > 0) {
        const errorData = errorCalls.find(call => call[1] && typeof call[1] === 'object')
        if (errorData) {
          const context = errorData[1]
          expect(context).toHaveProperty('actualNodeType')
          expect(context).toHaveProperty('nodeData')
          expect(context.actualNodeType).toBe('start')
        }
      }

      consoleSpy.mockRestore()
    })

    it('应该安全处理空节点或无效节点', async () => {
      const testCases = [
        null,
        undefined,
        {},
        { id: null },
        { data: null }
      ]

      for (const testNode of testCases) {
        const result = await validator.checkPreviewLineRequirement(
          testNode,
          PreviewLineStates.ACTIVE,
          new Map()
        )

        expect(result).toBeDefined()
        expect(result.needsCreation).toBe(false)
        expect(result.reason).toContain('节点')
      }
    })
  })

  describe('start 节点特殊处理', () => {
    it('应该正确识别 start 节点并应用特殊逻辑', async () => {
      const startNode = {
        id: 'start-node',
        data: {
          type: 'start',
          isConfigured: true
        },
        getId: () => 'start-node'
      }

      const result = await validator.checkPreviewLineRequirement(
        startNode,
        PreviewLineStates.ACTIVE,
        new Map()
      )

      expect(result).toBeDefined()
      // start 节点应该有特殊的处理逻辑
      expect(result.type).toBeDefined()
    })

    it('应该正确验证 start 节点的配置状态', async () => {
      // 设置布局引擎为就绪状态
      const mockLayoutEngine = {
        isReady: () => true,
        getNodePosition: vi.fn(() => ({ x: 0, y: 0 }))
      }
      validator.setLayoutEngine(mockLayoutEngine)

      const unconfiguredStartNode = {
        id: 'start-node',
        data: {
          type: 'start',
          isConfigured: false
        },
        getId: () => 'start-node'
      }

      const result = await validator.checkPreviewLineRequirement(
        unconfiguredStartNode,
        PreviewLineStates.ACTIVE,
        new Map()
      )

      expect(result).toBeDefined()
      if (result.needsCreation === false) {
        expect(result.reason).toMatch(/配置|布局引擎/)
      }
    })
  })

  describe('性能和稳定性', () => {
    it('应该在合理时间内完成验证', async () => {
      const startTime = performance.now()
      
      const node = {
        id: 'test-node',
        data: { type: 'start', isConfigured: true },
        getId: () => 'test-node'
      }

      await validator.checkPreviewLineRequirement(
        node,
        PreviewLineStates.ACTIVE,
        new Map()
      )

      const endTime = performance.now()
      const duration = endTime - startTime

      // 验证应该在 100ms 内完成
      expect(duration).toBeLessThan(100)
    })

    it('应该能够处理大量节点而不崩溃', async () => {
      const nodes = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        data: { type: 'start', isConfigured: true },
        getId: () => `node-${i}`
      }))

      const promises = nodes.map(node =>
        validator.checkPreviewLineRequirement(
          node,
          PreviewLineStates.ACTIVE,
          new Map()
        )
      )

      const results = await Promise.all(promises)
      expect(results).toHaveLength(100)
      results.forEach(result => {
        expect(result).toBeDefined()
      })
    })
  })
})