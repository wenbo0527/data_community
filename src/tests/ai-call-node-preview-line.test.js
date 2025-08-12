/**
 * AI外呼节点预览线生成测试
 * 测试AI外呼节点在不同配置状态下的预览线生成逻辑
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { UnifiedPreviewLineManager } from '../utils/UnifiedPreviewLineManager.js'

describe('AI外呼节点预览线生成测试', () => {
  let previewManager
  let mockGraph
  let mockLayoutEngine

  beforeEach(() => {
    // 创建mock图形对象
    mockGraph = {
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getEdges: vi.fn(() => []),
      getNodes: vi.fn(() => []),
      getCellById: vi.fn(),
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建mock布局引擎
    mockLayoutEngine = {
      getNodeLayer: vi.fn(),
      calculatePreviewLineEndpoint: vi.fn(() => ({ x: 400, y: 300 })),
      isReady: vi.fn(() => true)
    }

    // 创建预览线管理器实例
    previewManager = new UnifiedPreviewLineManager(mockGraph, mockLayoutEngine)
    previewManager.layoutEngineReady = true
  })

  describe('未配置AI外呼节点测试', () => {
    test('未配置的AI外呼节点不应生成预览线', () => {
      // 创建未配置的AI外呼节点
      const unconfiguredAiCallNode = {
        id: 'ai-call-unconfigured',
        type: 'ai-call',
        data: {
          // 没有配置数据
          isConfigured: false
        },
        getData: vi.fn(() => ({
          type: 'ai-call',
          isConfigured: false
        }))
      }

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.shouldCreatePreviewLine(unconfiguredAiCallNode)
      
      console.log('🧪 [测试] 未配置AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] 节点数据:', unconfiguredAiCallNode.data)

      // 验证不应该创建预览线
      expect(shouldCreate).toBe(false)
    })

    test('isConfigured为undefined的AI外呼节点不应生成预览线', () => {
      // 创建isConfigured为undefined的AI外呼节点
      const undefinedConfigNode = {
        id: 'ai-call-undefined',
        type: 'ai-call',
        data: {
          // isConfigured未设置，默认为undefined
        },
        getData: vi.fn(() => ({
          type: 'ai-call'
          // isConfigured未设置
        }))
      }

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.shouldCreatePreviewLine(undefinedConfigNode)
      
      console.log('🧪 [测试] isConfigured为undefined的AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] isConfigured值:', undefinedConfigNode.data.isConfigured)

      // 验证不应该创建预览线
      expect(shouldCreate).toBe(false)
    })

    test('空配置对象的AI外呼节点不应生成预览线', () => {
      // 创建空配置的AI外呼节点
      const emptyConfigNode = {
        id: 'ai-call-empty',
        type: 'ai-call',
        data: {
          config: {}, // 空配置对象
          isConfigured: false
        },
        getData: vi.fn(() => ({
          type: 'ai-call',
          config: {},
          isConfigured: false
        }))
      }

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.shouldCreatePreviewLine(emptyConfigNode)
      
      console.log('🧪 [测试] 空配置AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] 配置对象:', emptyConfigNode.data.config)

      // 验证不应该创建预览线
      expect(shouldCreate).toBe(false)
    })
  })

  describe('已配置AI外呼节点测试', () => {
    test('已配置的AI外呼节点应正确生成预览线', () => {
      // 创建已配置的AI外呼节点
      const configuredAiCallNode = {
        id: 'ai-call-configured',
        type: 'ai-call',
        data: {
          config: {
            taskId: 'task-123',
            nodeName: 'AI外呼任务'
          },
          isConfigured: true
        },
        getData: vi.fn(() => ({
          type: 'ai-call',
          config: {
            taskId: 'task-123',
            nodeName: 'AI外呼任务'
          },
          isConfigured: true
        }))
      }

      // 模拟没有现有连接
      mockGraph.getEdges.mockReturnValue([])

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.shouldCreatePreviewLine(configuredAiCallNode)
      
      console.log('🧪 [测试] 已配置AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] 节点配置:', configuredAiCallNode.data.config)

      // 验证应该创建预览线
      expect(shouldCreate).toBe(true)
    })

    test('已配置但已有连接的AI外呼节点不应生成预览线', () => {
      // 创建已配置的AI外呼节点
      const configuredConnectedNode = {
        id: 'ai-call-connected',
        type: 'ai-call',
        data: {
          config: {
            taskId: 'task-456',
            nodeName: 'AI外呼任务'
          },
          isConfigured: true
        },
        getData: vi.fn(() => ({
          type: 'ai-call',
          config: {
            taskId: 'task-456',
            nodeName: 'AI外呼任务'
          },
          isConfigured: true
        }))
      }

      // 模拟已有连接
      mockGraph.getOutgoingEdges.mockReturnValue([
        {
          id: 'edge-1',
          source: { cell: 'ai-call-connected' },
          target: { cell: 'some-target' },
          getTargetCellId: vi.fn(() => 'some-target'),
          getSourceCellId: vi.fn(() => 'ai-call-connected'),
          getData: vi.fn(() => ({
            type: 'normal-connection',
            isUnifiedPreview: false
          }))
        }
      ])

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.shouldCreatePreviewLine(configuredConnectedNode)
      
      console.log('🧪 [测试] 已连接AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] 现有连接数:', mockGraph.getEdges().length)

      // 验证不应该创建预览线（因为已有连接）
      expect(shouldCreate).toBe(false)
    })
  })

  describe('validateNodeConfiguration方法测试', () => {
    test('应该正确验证AI外呼节点的配置状态', () => {
      // 测试未配置节点
      const unconfiguredNode = {
        id: 'test-unconfigured',
        type: 'ai-call',
        data: { isConfigured: false },
        getData: vi.fn(() => ({ type: 'ai-call', isConfigured: false }))
      }

      const unconfiguredResult = previewManager.validateNodeConfiguration(
        unconfiguredNode, 
        'ai-call', 
        unconfiguredNode.data
      )

      console.log('🧪 [测试] 未配置节点验证结果:', unconfiguredResult)
      expect(unconfiguredResult.isConfigured).toBe(false)

      // 测试已配置节点
      const configuredNode = {
        id: 'test-configured',
        type: 'ai-call',
        data: {
          config: { taskId: 'task-789' },
          isConfigured: true
        },
        getData: vi.fn(() => ({
          type: 'ai-call',
          config: { taskId: 'task-789' },
          isConfigured: true
        }))
      }

      const configuredResult = previewManager.validateNodeConfiguration(
        configuredNode,
        'ai-call',
        configuredNode.data
      )

      console.log('🧪 [测试] 已配置节点验证结果:', configuredResult)
      expect(configuredResult.isConfigured).toBe(true)
    })

    test('应该处理isConfigured为undefined的情况', () => {
      // 测试isConfigured为undefined但有有效配置的节点
      const nodeWithValidConfig = {
        id: 'test-valid-config',
        type: 'ai-call',
        data: {
          config: {
            taskId: 'task-valid',
            nodeName: 'Valid AI Call'
          }
          // isConfigured未设置
        },
        getData: vi.fn(() => ({
          type: 'ai-call',
          config: {
            taskId: 'task-valid',
            nodeName: 'Valid AI Call'
          }
          // isConfigured未设置
        }))
      }

      const result = previewManager.validateNodeConfiguration(
        nodeWithValidConfig,
        'ai-call',
        nodeWithValidConfig.data
      )

      console.log('🧪 [测试] 有效配置但isConfigured未设置的验证结果:', result)
      console.log('🧪 [测试] isConfigured值:', nodeWithValidConfig.data.isConfigured)
      
      // 根据当前逻辑，应该基于配置数据的有效性来判断
      // 如果有有效的taskId，应该被认为是已配置的
      expect(result.isConfigured).toBe(true)
    })
  })

  describe('边界情况测试', () => {
    test('应该处理null节点', () => {
      const result = previewManager.shouldCreatePreviewLine(null)
      expect(result).toBe(false)
    })

    test('应该处理undefined节点', () => {
      const result = previewManager.shouldCreatePreviewLine(undefined)
      expect(result).toBe(false)
    })

    test('应该处理缺少data属性的节点', () => {
      const nodeWithoutData = {
        id: 'no-data-node',
        type: 'ai-call',
        // 缺少data属性
        getData: vi.fn(() => ({
          type: 'ai-call'
          // 缺少其他配置
        }))
      }

      const result = previewManager.shouldCreatePreviewLine(nodeWithoutData)
      console.log('🧪 [测试] 缺少data属性的节点测试结果:', result)
      expect(result).toBe(false)
    })
  })
})