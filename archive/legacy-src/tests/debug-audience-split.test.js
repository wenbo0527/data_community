/**
 * 调试人群分流节点预览线问题
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'

describe('调试人群分流节点预览线问题', () => {
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
    previewManager = new PreviewLineSystem(
      mockGraph,  // graph
      null,      // branchManager
      {},        // layoutConfig
      null       // layoutEngine
    )
  })

  test('调试createBranchPreviewLines方法', () => {
    // 模拟前两个分支已连接
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

    // 直接调用createBranchPreviewLines方法
    console.log('=== 开始调试 ===')
    const result = previewManager.createBranchPreviewLines(mockNode, 'INTERACTIVE', {})
    console.log('=== createBranchPreviewLines结果 ===', result)
    console.log('=== addedEdges ===', addedEdges)

    // 验证结果
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    
    // 应该只为"未命中人群"分支创建预览线
    expect(result.length).toBe(1)
    expect(result[0].branchId).toBe('unmatch_default')
    expect(result[0].branchLabel).toBe('未命中人群')
    
    // 验证addEdge被调用
    expect(addedEdges.length).toBe(1)
    expect(addedEdges[0].data.branchId).toBe('unmatch_default')
  })
})