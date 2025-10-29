/**
 * 节点注册和预览线生成修复测试用例
 * 测试修复后的关键问题点：
 * 1. GraphService中require降级逻辑修复
 * 2. 节点类型信息完整性
 * 3. 预览线生成机制优化
 * 4. 智能降级逻辑消除
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { GraphService } from '../services/GraphService.js'
import { PreviewLineSystem } from '../../../../utils/preview-line/PreviewLineSystem.js'
import { createNodeConfig } from '../composables/canvas/useCanvasNodes.js'
import { getNodeConfig, getNodeAttrs } from '../../../../utils/nodeTypes.js'

// Mock X6 Graph
const mockGraph = {
  addNode: vi.fn(),
  getCellById: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  addCell: vi.fn()
}

describe('节点注册和预览线生成修复测试', () => {
  let graphService
  let previewLineSystem
  
  beforeEach(() => {
    vi.clearAllMocks()
    graphService = new GraphService(mockGraph)
    previewLineSystem = new PreviewLineSystem(mockGraph)
  })
  
  afterEach(() => {
    graphService?.destroy()
    previewLineSystem?.destroy()
  })

  describe('1. GraphService require降级逻辑修复测试', () => {
    test('应该直接使用ES6 import，不再有require降级逻辑', async () => {
      // 准备测试数据
      const nodeData = {
        id: 'test-node-1',
        type: 'start',
        x: 100,
        y: 100,
        isConfigured: true
      }

      // Mock createNodeConfig 成功执行
      const mockNodeConfig = {
        id: 'test-node-1',
        shape: 'rect',
        data: {
          type: 'start',
          nodeType: 'start',
          isConfigured: true
        }
      }
      
      // 模拟节点添加成功
      mockGraph.addNode.mockReturnValue({ id: 'test-node-1' })
      
      // 执行测试
      const result = await graphService.addNode(nodeData)
      
      // 验证结果
      expect(result.success).toBe(true)
      expect(result.nodeId).toBe('test-node-1')
      expect(mockGraph.addNode).toHaveBeenCalledTimes(1)
      
      // 验证没有使用降级逻辑的console.warn
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('createNodeConfig执行失败，使用回退逻辑')
      )
    })

    test('应该在createNodeConfig失败时直接抛出错误，不使用回退逻辑', async () => {
      // 准备无效的节点数据（缺少type）
      const invalidNodeData = {
        id: 'test-node-invalid',
        x: 100,
        y: 100
      }

      // 执行测试并验证抛出错误
      await expect(graphService.addNode(invalidNodeData)).rejects.toThrow()
      
      // 验证没有调用图的addNode方法
      expect(mockGraph.addNode).not.toHaveBeenCalled()
    })
  })

  describe('2. 节点类型信息完整性测试', () => {
    test('节点配置应该包含完整的type和nodeType信息', () => {
      const nodeData = {
        id: 'test-node-2',
        type: 'start',
        x: 100,
        y: 100,
        isConfigured: true
      }

      const config = createNodeConfig(nodeData)
      
      // 验证节点配置包含完整的类型信息
      expect(config.data.type).toBe('start')
      expect(config.data.nodeType).toBe('start')
      expect(config.data.isConfigured).toBe(true)
      
      // 验证元数据存在
      expect(config.data.metadata).toBeDefined()
      expect(config.data.metadata.source).toBe('useCanvasNodes.createNodeConfig')
      expect(config.data.metadata.createdAt).toBeDefined()
    })

    test('不同节点类型都应该有正确的类型信息', () => {
      const nodeTypes = ['start', 'end', 'sms', 'ai-call', 'audience-split']
      
      nodeTypes.forEach(nodeType => {
        const nodeData = {
          id: `test-node-${nodeType}`,
          type: nodeType,
          x: 100,
          y: 100,
          isConfigured: true
        }

        const config = createNodeConfig(nodeData)
        
        expect(config.data.type).toBe(nodeType)
        expect(config.data.nodeType).toBe(nodeType)
        expect(config.data.isConfigured).toBe(true)
      })
    })

    test('节点类型为空时应该抛出错误', () => {
      const nodeData = {
        id: 'test-node-no-type',
        x: 100,
        y: 100
      }

      expect(() => createNodeConfig(nodeData)).toThrow('节点类型不能为空')
    })
  })

  describe('3. 预览线生成机制优化测试', () => {
    test('节点添加事件应该立即触发预览线检查和创建', () => {
      const mockNode = {
        id: 'test-node-3',
        getData: vi.fn().mockReturnValue({
          type: 'start',
          nodeType: 'start',
          isConfigured: true
        })
      }

      // Mock shouldCreatePreviewLine 返回 true
      vi.spyOn(previewLineSystem, 'shouldCreatePreviewLine').mockReturnValue(true)
      vi.spyOn(previewLineSystem, 'createUnifiedPreviewLine').mockImplementation(() => {})

      // 模拟节点添加事件
      const nodeAddedHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:added'
      )?.[1]

      if (nodeAddedHandler) {
        nodeAddedHandler({ node: mockNode })
      }

      // 验证预览线检查被调用
      expect(previewLineSystem.shouldCreatePreviewLine).toHaveBeenCalledWith(mockNode)
    })

    test('shouldCreatePreviewLine应该正确识别节点类型', () => {
      const testCases = [
        {
          node: {
            id: 'start-node',
            getData: () => ({ type: 'start', nodeType: 'start', isConfigured: true })
          },
          expected: true,
          description: '已配置的开始节点应该需要预览线'
        },
        {
          node: {
            id: 'end-node',
            getData: () => ({ type: 'end', nodeType: 'end', isConfigured: true })
          },
          expected: false,
          description: '结束节点不应该需要预览线'
        },
        {
          node: {
            id: 'unconfigured-node',
            getData: () => ({ type: 'sms', nodeType: 'sms', isConfigured: false })
          },
          expected: false,
          description: '未配置的节点不应该需要预览线'
        },
        {
          node: {
            id: 'no-type-node',
            getData: () => ({ isConfigured: true })
          },
          expected: false,
          description: '缺少类型信息的节点不应该需要预览线'
        }
      ]

      testCases.forEach(({ node, expected, description }) => {
        const result = previewLineSystem.shouldCreatePreviewLine(node)
        expect(result).toBe(expected)
      })
    })

    test('预览线创建应该使用异步方式避免阻塞', (done) => {
      const mockNode = {
        id: 'test-node-async',
        getData: vi.fn().mockReturnValue({
          type: 'start',
          nodeType: 'start',
          isConfigured: true
        })
      }

      vi.spyOn(previewLineSystem, 'shouldCreatePreviewLine').mockReturnValue(true)
      const createSpy = vi.spyOn(previewLineSystem, 'createUnifiedPreviewLine').mockImplementation(() => {})

      // 模拟节点添加事件处理
      const nodeAddedHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:added'
      )?.[1]

      if (nodeAddedHandler) {
        nodeAddedHandler({ node: mockNode })
      }

      // 验证预览线创建是异步的
      setTimeout(() => {
        expect(createSpy).toHaveBeenCalledWith(mockNode, 'interactive', false)
        done()
      }, 10)
    })
  })

  describe('4. 智能降级逻辑消除测试', () => {
    test('GraphService.preprocessNodeData应该直接使用createNodeConfig，不包含回退逻辑', () => {
      const nodeData = {
        id: 'test-node-4',
        type: 'start',
        x: 100,
        y: 100,
        isConfigured: true
      }

      // 执行预处理
      const result = graphService.preprocessNodeData(nodeData)
      
      // 验证结果包含正确的配置
      expect(result.data.type).toBe('start')
      expect(result.data.nodeType).toBe('start')
      expect(result.data.isConfigured).toBe(true)
      
      // 验证没有回退逻辑的警告日志
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('使用回退逻辑')
      )
    })

    test('不应该存在try-catch回退逻辑', () => {
      // 读取GraphService源码，验证不包含回退逻辑
      const graphServiceSource = graphService.preprocessNodeData.toString()
      
      // 验证不包含回退相关的关键词
      expect(graphServiceSource).not.toContain('回退到原有逻辑')
      expect(graphServiceSource).not.toContain('使用回退逻辑')
      expect(graphServiceSource).not.toContain('回退到默认配置')
    })
  })

  describe('5. 集成测试：完整的节点注册和预览线生成流程', () => {
    test('完整流程：添加节点 -> 触发事件 -> 创建预览线', async () => {
      // 准备测试数据
      const nodeData = {
        id: 'integration-test-node',
        type: 'start',
        x: 100,
        y: 100,
        isConfigured: true
      }

      // Mock 图方法
      const mockAddedNode = {
        id: 'integration-test-node',
        getData: () => ({
          type: 'start',
          nodeType: 'start',
          isConfigured: true
        })
      }
      
      mockGraph.addNode.mockReturnValue(mockAddedNode)
      
      // Mock 预览线系统方法
      vi.spyOn(previewLineSystem, 'shouldCreatePreviewLine').mockReturnValue(true)
      const createPreviewLineSpy = vi.spyOn(previewLineSystem, 'createUnifiedPreviewLine').mockImplementation(() => {})

      // 执行节点添加
      const result = await graphService.addNode(nodeData)
      
      // 验证节点添加成功
      expect(result.success).toBe(true)
      expect(result.nodeId).toBe('integration-test-node')
      
      // 模拟事件触发
      const nodeAddedHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:added'
      )?.[1]

      if (nodeAddedHandler) {
        nodeAddedHandler({ node: mockAddedNode })
      }

      // 验证预览线创建流程
      expect(previewLineSystem.shouldCreatePreviewLine).toHaveBeenCalledWith(mockAddedNode)
      
      // 等待异步预览线创建
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(createPreviewLineSpy).toHaveBeenCalledWith(mockAddedNode, 'interactive', false)
    })
  })

  describe('6. 错误处理和边界情况测试', () => {
    test('处理空节点数据', async () => {
      await expect(graphService.addNode(null)).rejects.toThrow('节点数据必须是对象类型')
      await expect(graphService.addNode(undefined)).rejects.toThrow('节点数据必须是对象类型')
      await expect(graphService.addNode([])).rejects.toThrow('节点数据必须是对象类型')
    })

    test('处理无效节点类型', async () => {
      const invalidNodeData = {
        id: 'invalid-type-node',
        type: 'invalid-type',
        x: 100,
        y: 100
      }

      await expect(graphService.addNode(invalidNodeData)).rejects.toThrow()
    })

    test('预览线系统处理无效节点', () => {
      const invalidNodes = [
        null,
        undefined,
        { id: 'no-getdata' }, // 没有getData方法
        { id: 'empty-data', getData: () => null }, // getData返回null
        { id: 'no-type', getData: () => ({}) } // 没有type信息
      ]

      invalidNodes.forEach(node => {
        const result = previewLineSystem.shouldCreatePreviewLine(node)
        expect(result).toBe(false)
      })
    })
  })
})