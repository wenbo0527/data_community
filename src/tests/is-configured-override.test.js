/**
 * 测试isConfigured字段被覆盖的问题
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { nodeConfigManager } from '../utils/NodeConfigManager.js'
import { UnifiedPreviewLineManager } from '../utils/UnifiedPreviewLineManager.js'

describe('isConfigured字段覆盖问题测试', () => {
  let mockGraph
  let mockNode
  let previewManager

  beforeEach(() => {
    // 创建模拟图实例
    mockGraph = {
      getCellById: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => []),
      removeEdge: vi.fn(),
      trigger: vi.fn(),
      addNode: vi.fn(),
      addEdge: vi.fn()
    }

    // 创建模拟节点
    mockNode = {
      id: 'test-node-001',
      getData: vi.fn(() => ({
        type: 'audience-split',
        nodeType: 'audience-split',
        label: '人群分流',
        config: {
          crowdLayers: [
            { id: 'layer1', crowdName: '高价值用户' },
            { id: 'layer2', crowdName: '普通用户' }
          ]
        }
      })),
      setData: vi.fn(),
      isNode: vi.fn(() => true)
    }

    // 设置getCellById返回模拟节点
    mockGraph.getCellById.mockReturnValue(mockNode)

    // 创建预览线管理器实例
    previewManager = new UnifiedPreviewLineManager(mockGraph)
  })

  test('NodeConfigManager设置isConfigured后不应被覆盖', async () => {
    const config = {
      crowdLayers: [
        { id: 'layer1', crowdName: '高价值用户', crowdId: 'crowd1' },
        { id: 'layer2', crowdName: '普通用户', crowdId: 'crowd2' }
      ]
    }

    const context = {
      structuredLayout: {
        unifiedPreviewManager: { value: previewManager }
      }
    }

    // 1. 使用NodeConfigManager处理配置
    await nodeConfigManager.processNodeConfig('audience-split', mockNode, config, context)

    // 2. 验证NodeConfigManager正确设置了isConfigured
    const nodeConfigManagerCalls = mockNode.setData.mock.calls
    expect(nodeConfigManagerCalls.length).toBeGreaterThan(0)
    
    const lastCall = nodeConfigManagerCalls[nodeConfigManagerCalls.length - 1][0]
    expect(lastCall.isConfigured).toBe(true)
    expect(lastCall.config).toBeDefined()

    console.log('NodeConfigManager setData calls:', nodeConfigManagerCalls)
  })

  test('UnifiedPreviewLineManager不应覆盖已设置的isConfigured', async () => {
    // 设置节点已经配置的状态
    mockNode.getData.mockReturnValue({
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流',
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'layer1', crowdName: '高价值用户' },
          { id: 'layer2', crowdName: '普通用户' }
        ]
      }
    })

    const config = {
      crowdLayers: [
        { id: 'layer1', crowdName: '高价值用户', crowdId: 'crowd1' },
        { id: 'layer2', crowdName: '普通用户', crowdId: 'crowd2' }
      ]
    }

    // 调用createPreviewLineAfterConfig
    await previewManager.createPreviewLineAfterConfig(mockNode, config)

    // 验证setData调用
    const setDataCalls = mockNode.setData.mock.calls
    console.log('UnifiedPreviewLineManager setData calls:', setDataCalls)

    // 如果有setData调用，验证isConfigured没有被覆盖
    if (setDataCalls.length > 0) {
      const lastCall = setDataCalls[setDataCalls.length - 1][0]
      expect(lastCall.isConfigured).toBe(true)
    }
  })

  test('验证完整的配置流程中isConfigured的保持', async () => {
    const config = {
      crowdLayers: [
        { id: 'layer1', crowdName: '高价值用户', crowdId: 'crowd1' },
        { id: 'layer2', crowdName: '普通用户', crowdId: 'crowd2' }
      ]
    }

    // 模拟完整的配置流程
    // 1. NodeConfigManager处理配置
    await nodeConfigManager.processNodeConfig('audience-split', mockNode, config, {})

    // 2. 获取NodeConfigManager设置的数据
    const nodeConfigCalls = mockNode.setData.mock.calls
    const nodeConfigData = nodeConfigCalls[nodeConfigCalls.length - 1][0]
    
    // 3. 更新mockNode.getData返回值，模拟节点数据已更新
    mockNode.getData.mockReturnValue({
      ...nodeConfigData,
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流'
    })

    // 4. 清除之前的setData调用记录
    mockNode.setData.mockClear()

    // 5. 调用UnifiedPreviewLineManager
    await previewManager.createPreviewLineAfterConfig(mockNode, config)

    // 6. 验证最终状态
    const finalCalls = mockNode.setData.mock.calls
    console.log('Final setData calls:', finalCalls)

    // 验证isConfigured在整个流程中保持为true
    if (finalCalls.length > 0) {
      const finalData = finalCalls[finalCalls.length - 1][0]
      expect(finalData.isConfigured).toBe(true)
    }

    // 验证节点最终状态
    const finalNodeData = mockNode.getData()
    expect(finalNodeData.isConfigured).toBe(true)
  })
})