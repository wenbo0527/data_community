/**
 * AI外呼节点预览线生成测试
 * 测试AI外呼节点在不同配置状态下的预览线生成逻辑
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'
import { createAICallNodeTestEnvironment } from './utils/MockGraphFactory.js'

describe('AI外呼节点预览线生成测试', () => {
  let previewManager
  let testEnv

  beforeEach(() => {
    // 使用AI外呼节点专用的测试环境
    testEnv = createAICallNodeTestEnvironment()

    // 直接使用测试环境提供的预览线管理器
    previewManager = testEnv.mockPreviewManager
  })

  describe('未配置AI外呼节点测试', () => {
    it('未配置的AI外呼节点不应生成预览线', () => {
      // 创建未配置的AI外呼节点
      const unconfiguredAiCallNode = testEnv.addNode({
        id: 'ai-call-unconfigured',
        type: 'ai-call',
        data: {
          type: 'ai-call',
          isConfigured: false
        }
      })

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.validator.shouldCreatePreviewLine(unconfiguredAiCallNode)
      
      console.log('🧪 [测试] 未配置AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] 节点数据:', unconfiguredAiCallNode.getData())

      // 验证不应该创建预览线
      expect(shouldCreate).toBe(false)
    })

    it('isConfigured为undefined的AI外呼节点不应生成预览线', () => {
      // 创建isConfigured为undefined的AI外呼节点
      const undefinedConfigNode = testEnv.addNode({
        id: 'ai-call-undefined',
        type: 'ai-call',
        data: {
          type: 'ai-call'
          // isConfigured未设置
        }
      })

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.validator.shouldCreatePreviewLine(undefinedConfigNode)
      
      console.log('🧪 [测试] isConfigured为undefined的AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] isConfigured值:', undefinedConfigNode.getData().isConfigured)

      // 验证不应该创建预览线
      expect(shouldCreate).toBe(false)
    })

    it('空配置对象的AI外呼节点不应生成预览线', () => {
      // 创建空配置的AI外呼节点
      const emptyConfigNode = testEnv.addNode({
        id: 'ai-call-empty',
        type: 'ai-call',
        data: {
          type: 'ai-call',
          config: {}, // 空配置对象
          isConfigured: false
        }
      })

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.validator.shouldCreatePreviewLine(emptyConfigNode)
      
      console.log('🧪 [测试] 空配置AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] 配置对象:', emptyConfigNode.getData().config)

      // 验证不应该创建预览线
      expect(shouldCreate).toBe(false)
    })
  })

  describe('已配置AI外呼节点测试', () => {
    test('已配置的AI外呼节点应正确生成预览线', () => {
      // 创建已配置的AI外呼节点
      const configuredAiCallNode = testEnv.addNode({
        id: 'ai-call-configured',
        type: 'ai-call',
        data: {
          type: 'ai-call',
          config: {
            taskId: 'task-123',
            nodeName: 'AI外呼任务'
          },
          isConfigured: true
        }
      })

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.validator.shouldCreatePreviewLine(configuredAiCallNode)
      
      console.log('🧪 [测试] 已配置AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] 节点配置:', configuredAiCallNode.getData().config)

      // 验证应该创建预览线
      expect(shouldCreate).toBe(true)
    })

    test('已配置但已有连接的AI外呼节点不应生成预览线', () => {
      // 创建已配置的AI外呼节点
      const configuredConnectedNode = testEnv.addNode({
        id: 'ai-call-connected',
        type: 'ai-call',
        data: {
          type: 'ai-call',
          config: {
            taskId: 'task-456',
            nodeName: 'AI外呼任务'
          },
          isConfigured: true
        }
      })

      // 添加真实连接
      testEnv.addEdge({
        id: 'edge-1',
        source: 'ai-call-connected',
        target: 'some-target',
        data: {
          type: 'normal-connection'
        }
      })

      // 测试shouldCreatePreviewLine方法
      const shouldCreate = previewManager.validator.shouldCreatePreviewLine(configuredConnectedNode)
      
      console.log('🧪 [测试] 已连接AI外呼节点预览线生成结果:', shouldCreate)
      console.log('🧪 [测试] 现有连接数:', testEnv.mockGraph.getOutgoingEdges(configuredConnectedNode.id).length)

      // 验证不应该创建预览线（因为已有连接）
      expect(shouldCreate).toBe(false)
    })
  })

  describe('validateNodeConfiguration方法测试', () => {
    test('应该正确验证AI外呼节点的配置状态', () => {
      // 测试未配置节点
      const unconfiguredNode = testEnv.addNode({
        id: 'test-unconfigured',
        type: 'ai-call',
        data: { 
          type: 'ai-call', 
          isConfigured: false 
        }
      })

      const unconfiguredResult = previewManager.validator.validateNodeConfiguration(
        unconfiguredNode, 
        'ai-call', 
        unconfiguredNode.getData()
      )

      console.log('🧪 [测试] 未配置节点验证结果:', unconfiguredResult)
      expect(unconfiguredResult.isConfigured).toBe(false)

      // 测试已配置节点
      const configuredNode = testEnv.addNode({
        id: 'test-configured',
        type: 'ai-call',
        data: {
          type: 'ai-call',
          config: { taskId: 'task-789' },
          isConfigured: true
        }
      })

      const configuredResult = previewManager.validator.validateNodeConfiguration(
        configuredNode,
        'ai-call',
        configuredNode.getData()
      )

      console.log('🧪 [测试] 已配置节点验证结果:', configuredResult)
      expect(configuredResult.isConfigured).toBe(true)
    })

    test('应该处理isConfigured为undefined的情况', () => {
      // 测试isConfigured为undefined但有有效配置的节点
      const nodeWithValidConfig = testEnv.addNode({
        id: 'test-valid-config',
        type: 'ai-call',
        data: {
          type: 'ai-call',
          config: {
            taskId: 'task-valid',
            nodeName: 'Valid AI Call'
          }
          // isConfigured未设置
        }
      })

      const result = previewManager.validator.validateNodeConfiguration(
        nodeWithValidConfig,
        'ai-call',
        nodeWithValidConfig.getData()
      )

      console.log('🧪 [测试] 有效配置但isConfigured未设置的验证结果:', result)
      console.log('🧪 [测试] isConfigured值:', nodeWithValidConfig.getData().isConfigured)
      
      // 根据当前逻辑，应该基于配置数据的有效性来判断
      // 如果有有效的taskId，应该被认为是已配置的
      expect(result).toBeDefined()
      expect(result.isConfigured).toBe(true)
    })
  })

  describe('边界情况测试', () => {
    test('应该处理null节点', () => {
      const result = previewManager.validator.shouldCreatePreviewLine(null)
      expect(result).toBe(false)
    })

    test('应该处理undefined节点', () => {
      const result = previewManager.validator.shouldCreatePreviewLine(undefined)
      expect(result).toBe(false)
    })

    test('应该处理缺少data属性的节点', () => {
      const nodeWithoutData = {
        id: 'no-data-node',
        type: 'ai-call',
        // 缺少data属性，但有getData方法
        getData: vi.fn(() => ({
          type: 'ai-call'
          // 缺少其他配置
        }))
      }

      const result = previewManager.validator.shouldCreatePreviewLine(nodeWithoutData)
      console.log('🧪 [测试] 缺少data属性的节点测试结果:', result)
      expect(result).toBe(false)
    })

    it('应该处理getData方法返回null的情况', () => {
      const nodeWithNullData = testEnv.addNode({
        id: 'null-data-node',
        type: 'ai-call',
        data: null
      })

      const result = previewManager.validator.shouldCreatePreviewLine(nodeWithNullData)
      console.log('🧪 [测试] getData返回null的节点测试结果:', result)
      expect(result).toBe(false)
    })
  })
})