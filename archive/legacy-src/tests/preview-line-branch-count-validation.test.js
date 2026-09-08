/**
 * 预览线+连接线数量与节点分支数量关系测试
 * 验证预览线和连接线总数等于节点配置的分支数量
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'

describe('预览线+连接线数量与分支数量关系测试', () => {
  let mockGraph
  let previewLineSystem

  beforeEach(() => {
    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn().mockReturnValue({
        id: 'test-edge',
        prop: vi.fn(),
        getData: vi.fn(),
        setData: vi.fn()
      }),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getCellById: vi.fn(),
      getOutgoingEdges: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn()
    }

    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      layoutEngine: { isReady: true }
    })
  })

  describe('无分支节点测试', () => {
    it('普通节点应该只有1条预览线或连接线', async () => {
      const normalNode = {
        id: 'normal-node',
        getData: () => ({ 
          type: 'sms', 
          isConfigured: true,
          // 无分支配置
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      mockGraph.getCellById.mockReturnValue(normalNode)
      mockGraph.getOutgoingEdges.mockReturnValue([])

      // 创建预览线
      await previewLineSystem.createPreviewLine({
        sourceId: 'normal-node'
      })

      // 验证只创建了1条预览线
      expect(mockGraph.addEdge).toHaveBeenCalledTimes(1)
      
      // 验证预览线数量计算
      const previewCount = await previewLineSystem.getPreviewLineCount('normal-node')
      const connectionCount = await previewLineSystem.getConnectionCount('normal-node')
      
      expect(previewCount + connectionCount).toBe(1)
    })

    it('开始节点应该只有1条预览线或连接线', async () => {
      const startNode = {
        id: 'start-node',
        getData: () => ({ 
          type: 'start', 
          isConfigured: true,
          triggerType: 'manual'
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      mockGraph.getCellById.mockReturnValue(startNode)
      mockGraph.getOutgoingEdges.mockReturnValue([])

      await previewLineSystem.createPreviewLine({
        sourceId: 'start-node'
      })

      expect(mockGraph.addEdge).toHaveBeenCalledTimes(1)
      
      const totalLines = await previewLineSystem.getTotalLineCount('start-node')
      expect(totalLines).toBe(1)
    })
  })

  describe('分支节点测试', () => {
    it('受众分流节点的预览线+连接线数量应等于分支数量', async () => {
      const audienceSplitNode = {
        id: 'audience-split-node',
        getData: () => ({ 
          type: 'audience-split',
          isConfigured: true,
          config: {
            crowdLayers: [
              { id: 'layer1', crowdId: 'crowd1', crowdName: '人群1' },
              { id: 'layer2', crowdId: 'crowd2', crowdName: '人群2' },
              { id: 'layer3', crowdId: 'crowd3', crowdName: '人群3' }
            ],
            branches: [
              { id: 'branch1', label: '分支1' },
              { id: 'branch2', label: '分支2' },
              { id: 'branch3', label: '分支3' }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      mockGraph.getCellById.mockReturnValue(audienceSplitNode)
      
      // 模拟部分分支已连接
      const existingConnections = [
        {
          id: 'conn1',
          source: { cell: 'audience-split-node' },
          target: { cell: 'target1' },
          getData: () => ({ branchId: 'branch1', isPreview: false })
        }
      ]
      mockGraph.getOutgoingEdges.mockReturnValue(existingConnections)

      // 为未连接的分支创建预览线
      await previewLineSystem.createBranchPreviewLines('audience-split-node')

      // 验证总数量 = 分支数量
      const branchCount = audienceSplitNode.getData().config.branches.length
      const previewCount = await previewLineSystem.getPreviewLineCount('audience-split-node')
      const connectionCount = existingConnections.length

      expect(previewCount + connectionCount).toBe(branchCount)
      expect(previewCount + connectionCount).toBe(3)
    })

    it('事件分流节点应该为每个事件分支创建预览线', async () => {
      const eventSplitNode = {
        id: 'event-split-node',
        getData: () => ({ 
          type: 'event-split',
          isConfigured: true,
          config: {
            events: [
              { id: 'event1', name: '事件1', condition: 'condition1' },
              { id: 'event2', name: '事件2', condition: 'condition2' }
            ],
            branches: [
              { id: 'yes-branch', label: '是' },
              { id: 'no-branch', label: '否' }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      mockGraph.getCellById.mockReturnValue(eventSplitNode)
      mockGraph.getOutgoingEdges.mockReturnValue([])

      await previewLineSystem.createBranchPreviewLines('event-split-node')

      const branchCount = eventSplitNode.getData().config.branches.length
      const totalLines = await previewLineSystem.getTotalLineCount('event-split-node')
      
      expect(totalLines).toBe(branchCount)
      expect(totalLines).toBe(2)
    })

    it('AB测试节点应该为每个测试变体创建预览线', async () => {
      const abTestNode = {
        id: 'ab-test-node',
        getData: () => ({ 
          type: 'ab-test',
          isConfigured: true,
          config: {
            variants: [
              { id: 'variant-a', name: '变体A', ratio: 50 },
              { id: 'variant-b', name: '变体B', ratio: 50 }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      mockGraph.getCellById.mockReturnValue(abTestNode)
      mockGraph.getOutgoingEdges.mockReturnValue([])

      await previewLineSystem.createBranchPreviewLines('ab-test-node')

      const variantCount = abTestNode.getData().config.variants.length
      const totalLines = await previewLineSystem.getTotalLineCount('ab-test-node')
      
      expect(totalLines).toBe(variantCount)
      expect(totalLines).toBe(2)
    })
  })

  describe('动态数量调整测试', () => {
    it('连接线创建后应该减少对应的预览线数量', async () => {
      const branchNode = {
        id: 'branch-node',
        getData: () => ({ 
          type: 'audience-split',
          isConfigured: true,
          config: {
            branches: [
              { id: 'branch1', label: '分支1' },
              { id: 'branch2', label: '分支2' }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      mockGraph.getCellById.mockReturnValue(branchNode)
      mockGraph.getOutgoingEdges.mockReturnValue([])

      // 初始创建所有分支的预览线
      await previewLineSystem.createBranchPreviewLines('branch-node')
      
      let totalLines = await previewLineSystem.getTotalLineCount('branch-node')
      expect(totalLines).toBe(2)

      // 创建一个连接线
      const connection = {
        id: 'new-connection',
        source: { cell: 'branch-node' },
        target: { cell: 'target-node' },
        getData: () => ({ branchId: 'branch1', isPreview: false })
      }
      
      mockGraph.getOutgoingEdges.mockReturnValue([connection])
      
      // 删除对应的预览线
      await previewLineSystem.removePreviewLineForBranch('branch-node', 'branch1')
      
      // 验证总数量保持不变，但预览线减少，连接线增加
      totalLines = await previewLineSystem.getTotalLineCount('branch-node')
      expect(totalLines).toBe(2)
      
      const previewCount = await previewLineSystem.getPreviewLineCount('branch-node')
      const connectionCount = await previewLineSystem.getConnectionCount('branch-node')
      
      expect(previewCount).toBe(1)
      expect(connectionCount).toBe(1)
    })

    it('连接线删除后应该恢复对应的预览线数量', async () => {
      const branchNode = {
        id: 'branch-node',
        getData: () => ({ 
          type: 'audience-split',
          isConfigured: true,
          config: {
            branches: [
              { id: 'branch1', label: '分支1' },
              { id: 'branch2', label: '分支2' }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      mockGraph.getCellById.mockReturnValue(branchNode)
      
      // 模拟已有连接线
      const existingConnection = {
        id: 'existing-connection',
        source: { cell: 'branch-node' },
        target: { cell: 'target-node' },
        getData: () => ({ branchId: 'branch1', isPreview: false })
      }
      
      mockGraph.getOutgoingEdges.mockReturnValue([existingConnection])

      // 删除连接线，应该恢复预览线
      await previewLineSystem.handleConnectionDeletion('existing-connection')
      
      // 验证预览线被恢复
      const totalLines = await previewLineSystem.getTotalLineCount('branch-node')
      expect(totalLines).toBe(2)
      
      const previewCount = await previewLineSystem.getPreviewLineCount('branch-node')
      expect(previewCount).toBe(2) // 两个分支都应该有预览线
    })
  })
})