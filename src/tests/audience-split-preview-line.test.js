/**
 * 人群分流节点预览线测试
 * 测试场景：人群分流节点配置了3个分支，但只有2个连接，应该为"未命中人群"分支生成预览线
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import UnifiedPreviewLineManager from '../utils/UnifiedPreviewLineManager.js'

describe('人群分流节点预览线生成', () => {
  let previewManager
  let mockGraph
  let mockNode

  beforeEach(() => {
    // 模拟图形对象
    mockGraph = {
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => []),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getCellById: vi.fn(),
      hasCell: vi.fn(() => true),
      on: vi.fn(),
      off: vi.fn()
    }

    // 模拟人群分流节点
    mockNode = {
      id: 'node_1754471167446',
      getId: () => 'node_1754471167446',
      getData: () => ({
        type: 'audience-split',
        isConfigured: true,
        config: {
          crowdLayers: [
            {
              id: 'crowd_1',
              crowdName: '高响应客群',
              crowdId: 'crowd_001',
              order: 1
            },
            {
              id: 'crowd_2', 
              crowdName: '低响应客群',
              crowdId: 'crowd_002',
              order: 2
            }
          ],
          unmatchBranch: {
            id: 'unmatch_default',
            name: '未命中人群',
            crowdName: '未命中人群',
            crowdId: null,
            order: 3
          }
        }
      }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 })
    }

    // 创建预览线管理器实例
    previewManager = new UnifiedPreviewLineManager(
      mockGraph,  // graph
      null,      // branchManager
      {},        // layoutConfig
      null       // layoutEngine
    )
    
    // 🔧 关键修复：设置布局引擎就绪状态，确保预览线能够立即创建
    previewManager.layoutEngineReady = true
  })

  test('应该为人群分流节点生成3个分支', () => {
    const branches = previewManager.getNodeBranches(mockNode)
    
    expect(branches).toHaveLength(3)
    expect(branches[0]).toMatchObject({
      id: 'crowd_1',
      label: '高响应客群',
      type: 'audience'
    })
    expect(branches[1]).toMatchObject({
      id: 'crowd_2',
      label: '低响应客群', 
      type: 'audience'
    })
    expect(branches[2]).toMatchObject({
      id: 'unmatch_default',
      label: '未命中人群',
      type: 'audience',
      isDefault: true
    })
  })

  test('当前两个分支已连接时，应该为第三个分支生成预览线', () => {
    // 模拟前两个分支已有真实连接
    mockGraph.getOutgoingEdges.mockReturnValue([
      {
        id: 'edge_1',
        getData: () => ({ branchId: 'crowd_1', isPreview: false }),
        getSourceCellId: () => 'node_1754471167446',
        getTargetCellId: () => 'target_node_1'
      },
      {
        id: 'edge_2', 
        getData: () => ({ branchId: 'crowd_2', isPreview: false }),
        getSourceCellId: () => 'node_1754471167446',
        getTargetCellId: () => 'target_node_2'
      }
    ])

    // 检查第一个分支是否有真实连接
    const hasConnection1 = previewManager.checkBranchHasRealConnection(mockNode, 'crowd_1')
    expect(hasConnection1).toBe(true)

    // 检查第二个分支是否有真实连接
    const hasConnection2 = previewManager.checkBranchHasRealConnection(mockNode, 'crowd_2')
    expect(hasConnection2).toBe(true)

    // 检查第三个分支是否有真实连接（应该没有）
    const hasConnection3 = previewManager.checkBranchHasRealConnection(mockNode, 'unmatch_default')
    expect(hasConnection3).toBe(false)
  })

  test('应该为未连接的"未命中人群"分支创建预览线', () => {
    // 模拟前两个分支已连接，第三个分支未连接
    mockGraph.getOutgoingEdges.mockReturnValue([
      {
        id: 'edge_1',
        getData: () => ({ branchId: 'crowd_1', isPreview: false }),
        getSourceCellId: () => 'node_1754471167446',
        getTargetCellId: () => 'target_node_1'
      },
      {
        id: 'edge_2',
        getData: () => ({ branchId: 'crowd_2', isPreview: false }),
        getSourceCellId: () => 'node_1754471167446', 
        getTargetCellId: () => 'target_node_2'
      }
    ])

    // 模拟getCellById方法返回节点本身
    mockGraph.getCellById.mockReturnValue({
      ...mockNode,
      isNode: () => true
    })

    // 模拟图形添加边的方法
    const addedEdges = []
    mockGraph.addEdge.mockImplementation((edgeConfig) => {
      console.log('Mock addEdge called with:', edgeConfig)
      addedEdges.push(edgeConfig)
      return { 
        id: `preview_${Date.now()}`,
        getData: () => edgeConfig.data || {},
        setRouter: vi.fn(),
        setAttrs: vi.fn()
      }
    })

    // 验证节点是否被识别为分支节点
    const isBranch = previewManager.isBranchNode(mockNode)
    console.log('Is branch node:', isBranch)

    // 验证分支信息
    const branches = previewManager.getNodeBranches(mockNode)
    console.log('Branches:', branches)

    // 验证连接状态
    const hasConnection1 = previewManager.checkBranchHasRealConnection(mockNode, 'crowd_1')
    const hasConnection2 = previewManager.checkBranchHasRealConnection(mockNode, 'crowd_2')
    const hasConnection3 = previewManager.checkBranchHasRealConnection(mockNode, 'unmatch_default')
    console.log('Connection status:', { hasConnection1, hasConnection2, hasConnection3 })

    // 创建预览线
    const result = previewManager.createUnifiedPreviewLine(mockNode, 'INTERACTIVE')
    console.log('Create result:', result)
    console.log('Added edges:', addedEdges)

    // 验证是否为"未命中人群"分支创建了预览线
    const unmatchPreviewEdge = addedEdges.find(edge => 
      edge.data && edge.data.branchId === 'unmatch_default'
    )
    
    console.log('Unmatch preview edge:', unmatchPreviewEdge)
    
    expect(unmatchPreviewEdge).toBeDefined()
    expect(unmatchPreviewEdge.data.isUnifiedPreview).toBe(true)
    expect(unmatchPreviewEdge.data.branchLabel).toBe('未命中人群')
  })

  test('节点应该被识别为已配置状态', () => {
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)
    expect(shouldCreate).toBe(true)
  })

  test('generateBranchesByType应该正确处理unmatchBranch配置', () => {
    const nodeConfig = mockNode.getData().config
    const branches = previewManager.generateBranchesByType('audience-split', nodeConfig, mockNode.id)
    
    expect(branches).toHaveLength(3)
    
    // 验证未命中分支的配置
    const unmatchBranch = branches.find(b => b.isDefault === true)
    expect(unmatchBranch).toBeDefined()
    expect(unmatchBranch.id).toBe('unmatch_default')
    expect(unmatchBranch.label).toBe('未命中人群')
    expect(unmatchBranch.type).toBe('audience')
  })
})