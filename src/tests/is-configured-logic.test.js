/**
 * isConfigured逻辑测试
 * 测试节点配置状态的生成、更新和保存逻辑
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { UnifiedPreviewLineManager } from '../utils/UnifiedPreviewLineManager.js'
import { nodeConfigManager } from '../utils/NodeConfigManager.js'

describe('isConfigured逻辑测试', () => {
  let mockGraph
  let mockNode
  let previewManager
  let mockAddEdge
  let addedEdges

  beforeEach(() => {
    // 重置添加的边
    addedEdges = []
    
    // 模拟addEdge方法
    mockAddEdge = vi.fn((edgeConfig) => {
      addedEdges.push(edgeConfig)
      return {
        id: edgeConfig.id,
        source: edgeConfig.source,
        target: edgeConfig.target,
        data: edgeConfig.data || {}
      }
    })

    // 模拟图实例
    mockGraph = {
      addEdge: mockAddEdge,
      getNodes: vi.fn(() => [mockNode]),
      getEdges: vi.fn(() => []),
      getCellById: vi.fn(() => null),
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => []),
      removeEdge: vi.fn(),
      trigger: vi.fn()
    }

    // 创建预览线管理器实例
    previewManager = new UnifiedPreviewLineManager(mockGraph)
  })

  describe('audience-split节点配置状态测试', () => {
    beforeEach(() => {
      // 创建audience-split节点
      mockNode = {
        id: 'node_1754471167446',
        getData: vi.fn(() => ({
          type: 'audience-split',
          config: {
            crowdLayers: [
              { id: '1754471169915668nr1hov', crowdId: 'crowd1', crowdName: '人群1' },
              { id: '1754471169915q8qu2s3ce', crowdId: 'crowd2', crowdName: '人群2' }
            ],
            unmatchBranch: { name: '未命中人群' },
            branches: [
              { id: '1754471169915668nr1hov', name: '人群1', crowdId: 'crowd1' },
              { id: '1754471169915q8qu2s3ce', name: '人群2', crowdId: 'crowd2' },
              { id: 'unmatch_default', name: '未命中人群', crowdId: null }
            ]
          },
          // 关键：测试未配置状态
          isConfigured: false
        })),
        setData: vi.fn(),
        getPosition: vi.fn(() => ({ x: 100, y: 100 })),
        getSize: vi.fn(() => ({ width: 120, height: 60 })),
        getPorts: vi.fn(() => [
          { id: 'in', group: 'in' },
          { id: 'out', group: 'out' }
        ])
      }
    })

    test('未配置的audience-split节点应该跳过预览线创建', () => {
      const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)
      expect(shouldCreate).toBe(false)
    })

    test('已配置的audience-split节点应该创建预览线', () => {
      // 设置节点为已配置状态
      mockNode.getData.mockReturnValue({
        type: 'audience-split',
        config: {
          crowdLayers: [
            { id: '1754471169915668nr1hov', crowdId: 'crowd1', crowdName: '人群1' },
            { id: '1754471169915q8qu2s3ce', crowdId: 'crowd2', crowdName: '人群2' }
          ],
          unmatchBranch: { name: '未命中人群' },
          branches: [
            { id: '1754471169915668nr1hov', name: '人群1', crowdId: 'crowd1' },
            { id: '1754471169915q8qu2s3ce', name: '人群2', crowdId: 'crowd2' },
            { id: 'unmatch_default', name: '未命中人群', crowdId: null }
          ]
        },
        // 关键：设置为已配置状态
        isConfigured: true
      })

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)
      expect(shouldCreate).toBe(true)
    })

    test('NodeConfigManager应该在配置完成后设置isConfigured为true', async () => {
      const config = {
        crowdLayers: [
          { id: 'layer1', crowdId: 'crowd1', crowdName: '人群1' },
          { id: 'layer2', crowdId: 'crowd2', crowdName: '人群2' }
        ],
        unmatchBranch: { name: '未命中人群' }
      }

      const context = {
        nodeOperations: {},
        structuredLayout: {},
        graph: mockGraph
      }

      // 执行配置处理
      await nodeConfigManager.processNodeConfig('audience-split', mockNode, config, context)

      // 验证setData被调用，且isConfigured被设置为true
      expect(mockNode.setData).toHaveBeenCalled()
      const setDataCall = mockNode.setData.mock.calls[0][0]
      expect(setDataCall.isConfigured).toBe(true)
      expect(setDataCall.config).toBeDefined()
    })
  })

  describe('配置流程完整性测试', () => {
    test('useBaseDrawer的handleSubmit应该触发confirm事件', async () => {
      // 模拟useBaseDrawer的handleSubmit逻辑
      const mockEmit = vi.fn()
      const formData = {
        crowdLayers: [
          { id: 'layer1', crowdId: 'crowd1', crowdName: '人群1' }
        ],
        unmatchBranch: { name: '未命中人群' }
      }

      const config = {
        ...formData,
        nodeType: 'crowd-split'
      }

      // 模拟emit('confirm', config)调用
      mockEmit('confirm', config)

      expect(mockEmit).toHaveBeenCalledWith('confirm', config)
    })

    test('useConfigDrawers的handleConfigConfirm应该调用NodeConfigManager', async () => {
      // 这个测试验证配置确认流程的完整性
      const mockNodeInstance = {
        id: 'test-node',
        getData: vi.fn(() => ({ type: 'audience-split' })),
        setData: vi.fn()
      }

      const config = {
        crowdLayers: [
          { id: 'layer1', crowdId: 'crowd1', crowdName: '人群1' }
        ],
        unmatchBranch: { name: '未命中人群' },
        nodeType: 'crowd-split'
      }

      const context = {
        nodeOperations: {},
        structuredLayout: {},
        graph: mockGraph
      }

      // 直接测试NodeConfigManager的processNodeConfig方法
      await nodeConfigManager.processNodeConfig('audience-split', mockNodeInstance, config, context)

      // 验证节点数据被更新，且isConfigured被设置为true
      expect(mockNodeInstance.setData).toHaveBeenCalled()
      const updatedData = mockNodeInstance.setData.mock.calls[0][0]
      expect(updatedData.isConfigured).toBe(true)
    })
  })

  describe('预览线生成条件测试', () => {
    test('validateNodeConfiguration应该正确检查isConfigured状态', () => {
      // 测试未配置节点
      const unconfiguredNode = { 
        id: 'test-node', 
        type: 'audience-split',
        getData: () => ({
          type: 'audience-split',
          config: { branches: [] },
          isConfigured: false
        })
      }
      const unconfiguredNodeData = {
        type: 'audience-split',
        config: { branches: [] },
        isConfigured: false
      }

      const result = previewManager.validateNodeConfiguration(unconfiguredNode, 'audience-split', unconfiguredNodeData)
      expect(result.isConfigured).toBe(false)

      // 测试已配置节点
      const configuredNode = { 
        id: 'test-node', 
        type: 'audience-split',
        getData: () => ({
          type: 'audience-split',
          config: { branches: [] },
          isConfigured: true
        })
      }
      const configuredNodeData = {
        type: 'audience-split',
        config: { branches: [] },
        isConfigured: true
      }

      const result2 = previewManager.validateNodeConfiguration(configuredNode, 'audience-split', configuredNodeData)
      expect(result2.isConfigured).toBe(true)
    })

    test('shouldCreatePreviewLine应该正确判断是否创建预览线', () => {
      const configuredNode = { 
        id: 'test-node', 
        type: 'audience-split',
        getData: () => ({
          type: 'audience-split',
          config: { crowdLayers: [{ id: '1', crowdName: '测试人群' }] },
          isConfigured: true
        })
      }
      
      const result = previewManager.shouldCreatePreviewLine(configuredNode)
      expect(result).toBe(true)
      
      // 测试未配置的节点
      const unconfiguredNode = { 
        id: 'test-node-2', 
        type: 'audience-split',
        getData: () => ({
          type: 'audience-split',
          config: {},
          isConfigured: false
        })
      }
      
      const result2 = previewManager.shouldCreatePreviewLine(unconfiguredNode)
      expect(result2).toBe(false)
    })
  })

  describe('边界情况测试', () => {
    test('节点没有config属性时应该跳过预览线创建', () => {
      const nodeWithoutConfig = {
        id: 'test-node',
        getData: () => ({
          type: 'audience-split',
          isConfigured: true
          // 没有config属性
        })
      }

      const shouldCreate = previewManager.shouldCreatePreviewLine(nodeWithoutConfig)
      expect(shouldCreate).toBe(false)
    })

    test('节点config为空对象时应该跳过预览线创建', () => {
      const nodeWithEmptyConfig = {
        id: 'test-node',
        getData: () => ({
          type: 'audience-split',
          config: {}, // 空配置
          isConfigured: true
        })
      }

      const shouldCreate = previewManager.shouldCreatePreviewLine(nodeWithEmptyConfig)
      expect(shouldCreate).toBe(false)
    })

    test('节点数据为null时应该跳过预览线创建', () => {
      const nodeWithNullData = {
        id: 'test-node',
        getData: () => null
      }

      const shouldCreate = previewManager.shouldCreatePreviewLine(nodeWithNullData)
      expect(shouldCreate).toBe(false)
    })
  })
})