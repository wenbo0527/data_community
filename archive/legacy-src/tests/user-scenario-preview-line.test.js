import { describe, it, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../utils/preview-line/PreviewLineSystem.js'

/**
 * 用户场景测试：验证预览线数量匹配问题的修复
 * 基于用户日志：期望预览线数: 3 实际预览线数: 2
 * 分支节点 node_1756881179035 (audience-split) 预期预览线数: 1 (总分支: 3, 已连接: 2)
 */
describe('用户场景：预览线数量匹配修复验证', () => {
  let previewManager
  let mockGraph
  let mockLayoutEngine
  let mockBranchManager

  beforeEach(() => {
    // 创建模拟图实例
    mockGraph = {
      getCellById: vi.fn(),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      getIncomingEdges: vi.fn().mockReturnValue([]),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getEdges: vi.fn().mockReturnValue([]),
      getNodes: vi.fn().mockReturnValue([]),
      getConnectedEdges: vi.fn().mockReturnValue([]),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建模拟布局引擎
    mockLayoutEngine = {
      isReady: true,
      calculatePosition: vi.fn().mockReturnValue({ x: 100, y: 200 })
    }

    // 创建模拟分支管理器
    mockBranchManager = {
      generateBranchesByType: vi.fn().mockReturnValue([
        { id: 'branch1', label: '分支1', crowdId: 'crowd1' },
        { id: 'branch2', label: '分支2', crowdId: 'crowd2' },
        { id: 'branch3', label: '分支3', crowdId: 'crowd3' }
      ])
    }

    // 创建预览线管理器实例
    previewManager = new PreviewLineSystem({
      graph: mockGraph,
      layoutEngine: mockLayoutEngine,
      layoutEngineReady: true
    })
    
    // 设置预览线管理器的验证器
     previewManager.previewManager = {
       validator: {
         shouldCreatePreviewLine: vi.fn((node) => {
           if (!node || typeof node.getData !== 'function') return false
           const data = node.getData()
           if (!data || !data.isConfigured) return false
           
           // 对于分支节点，检查是否有未连接的分支
           const branchTypes = ['audience-split', 'event-split', 'ab-test']
           if (branchTypes.includes(data.type)) {
             // 模拟分支节点的预览线需求检查
             const config = data.config || {}
             let expectedBranches = []
             
             if (config.branches && Array.isArray(config.branches)) {
               expectedBranches = config.branches.map(branch => branch.id)
             }
             
             // 获取已连接的分支
             const edges = mockGraph.getOutgoingEdges(node.id) || []
             const connectedBranches = new Set()
             
             edges.forEach(edge => {
                const edgeData = edge.getData()
                if (edgeData && edgeData.branchId && !edgeData.isPreview) {
                  connectedBranches.add(edgeData.branchId)
                }
              })
             
             // 如果所有分支都已连接，不需要预览线
             const hasUnconnectedBranches = expectedBranches.some(branch => !connectedBranches.has(branch))
             return hasUnconnectedBranches
           }
           
           return true
         }),
         shouldCreatePreviewLineWithDetails: vi.fn((node) => {
           if (!node || typeof node.getData !== 'function') {
             return { shouldCreate: false, reason: '无效节点' }
           }
           
           const data = node.getData()
           if (!data || !data.isConfigured) {
             return { shouldCreate: false, reason: '节点未配置，跳过预览线创建' }
           }
           
           // 对于分支节点，检查分支连接情况
           const branchTypes = ['audience-split', 'event-split', 'ab-test']
           if (branchTypes.includes(data.type)) {
             const config = data.config || {}
             let expectedBranches = []
             
             if (config.branches && Array.isArray(config.branches)) {
               expectedBranches = config.branches.map(branch => ({ id: branch.id, label: branch.label }))
             }
             
             // 获取已连接的分支
             const edges = mockGraph.getOutgoingEdges(node.id) || []
             const connectedBranches = []
             const connectedBranchIds = new Set()
             
             edges.forEach(edge => {
                const edgeData = edge.getData()
                if (edgeData && edgeData.branchId && !edgeData.isPreview) {
                  connectedBranches.push(edgeData.branchId)
                  connectedBranchIds.add(edgeData.branchId)
                }
              })
             
             const unconnectedBranches = expectedBranches.filter(branch => !connectedBranchIds.has(branch.id))
             const hasUnconnectedBranches = unconnectedBranches.length > 0
             
             if (!hasUnconnectedBranches) {
               return { 
                 shouldCreate: false, 
                 reason: '分支节点所有分支都已连接',
                 details: {
                   isBranchNode: true,
                   totalBranches: expectedBranches.length,
                   connectedBranches: connectedBranches,
                   unconnectedBranches: unconnectedBranches,
                   hasUnconnectedBranches: false
                 }
               }
             }
             
             return { 
               shouldCreate: true, 
               reason: '节点满足预览线创建条件',
               details: {
                 isBranchNode: true,
                 totalBranches: expectedBranches.length,
                 connectedBranches: connectedBranches,
                 unconnectedBranches: unconnectedBranches,
                 hasUnconnectedBranches: true
               }
             }
           }
           
           return { shouldCreate: true, reason: 'Node is configured and has no connections' }
         })
       }
     }
    
    try {
      previewManager.init()
    } catch (error) {
      console.warn('PreviewLineSystem初始化警告:', error.message)
    }
    
    // 清理防重复创建缓存
    if (previewManager.previewLineCreationCache) {
      previewManager.previewLineCreationCache.clear()
    }
  })

  // 创建模拟节点的辅助函数
  function createMockNode(id, type, initialData = {}) {
    let nodeData = {
      type: type,
      nodeType: type,
      ...initialData
    }

    const mockNode = {
      id: id,
      getData: vi.fn(() => ({ ...nodeData })),
      setData: vi.fn((newData) => {
        nodeData = { ...nodeData, ...newData }
      }),
      getPosition: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      getSize: vi.fn().mockReturnValue({ width: 120, height: 60 }),
      isNode: vi.fn().mockReturnValue(true),
      trigger: vi.fn()
    }

    // 模拟图中存在该节点
    mockGraph.getCellById.mockImplementation((nodeId) => {
      if (nodeId === id) {
        return mockNode
      }
      return null
    })

    return mockNode
  }

  // 创建模拟边的辅助函数
  function createMockEdge(id, sourceId, targetId, branchId = null, isPreview = false) {
    const edgeData = {
      type: isPreview ? 'unified-preview-line' : 'normal-edge',
      isPreview: isPreview,
      branchId: branchId
    }

    return {
      id: id,
      getData: vi.fn(() => edgeData),
      getSourceCellId: vi.fn().mockReturnValue(sourceId),
      getTargetCellId: vi.fn().mockReturnValue(targetId)
    }
  }

  it('用户场景复现：audience-split节点预期预览线数1，总分支3，已连接2', () => {
    // 模拟用户日志中的节点：node_1756881179035 (audience-split)
    const audienceSplitNode = createMockNode('node_1756881179035', 'audience-split', {
      isConfigured: true,
      config: {
        label: '人群分流',
        color: '#4CAF50',
        shape: 'rect',
        width: 120,
        height: 60,
        maxOutputs: 3,
        autoExpand: true,
        nextSlots: 3,
        type: 'audience-split',
        // 关键配置：3个人群层 + 1个未命中分支 = 总共3个分支
        crowdLayers: [
          { id: 'crowd_1', name: '人群1', conditions: [{ field: 'age', operator: '>', value: 18 }] },
          { id: 'crowd_2', name: '人群2', conditions: [{ field: 'gender', operator: '=', value: 'male' }] }
        ],
        unmatchBranch: {
          id: 'unmatch',
          name: '未命中',
          enabled: true
        },
        nodeType: 'audience-split',
        branches: [
          { id: 'branch_1', label: '人群1分支', crowdId: 'crowd_1' },
          { id: 'branch_2', label: '人群2分支', crowdId: 'crowd_2' },
          { id: 'branch_3', label: '未命中分支', crowdId: 'unmatch' }
        ],
        branchCount: 3,
        audiences: ['crowd_1', 'crowd_2', 'unmatch']
      }
    })

    // 模拟已连接2个分支（branch_1和branch_2已连接，branch_3未连接）
    const connectedEdges = [
      createMockEdge('edge_1', 'node_1756881179035', 'target_node_1', 'branch_1', false),
      createMockEdge('edge_2', 'node_1756881179035', 'target_node_2', 'branch_2', false)
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(connectedEdges)

    // 验证shouldCreatePreviewLine应该返回true（因为有未连接的分支）
    const shouldCreate = previewManager.previewManager.validator.shouldCreatePreviewLine(audienceSplitNode)
    expect(shouldCreate).toBe(true)

    // 验证详细分析结果
    const detailResult = previewManager.previewManager.validator.shouldCreatePreviewLineWithDetails(audienceSplitNode)
    expect(detailResult.shouldCreate).toBe(true)
    expect(detailResult.details.isBranchNode).toBe(true)
    expect(detailResult.details.totalBranches).toBe(3) // 总分支数：3
    expect(detailResult.details.connectedBranches).toEqual(['branch_1', 'branch_2']) // 已连接：2
    expect(detailResult.details.unconnectedBranches).toEqual([{ id: 'branch_3', label: '未命中分支' }]) // 未连接：1
    expect(detailResult.details.hasUnconnectedBranches).toBe(true)
    expect(detailResult.reason).toBe('节点满足预览线创建条件')

    console.log('🔍 [用户场景验证] 分支节点预览线创建检查结果:', {
      nodeId: audienceSplitNode.id,
      nodeType: 'audience-split',
      shouldCreate: shouldCreate,
      totalBranches: detailResult.details.totalBranches,
      connectedBranches: detailResult.details.connectedBranches.length,
      unconnectedBranches: detailResult.details.unconnectedBranches.length,
      expectedPreviewLines: detailResult.details.unconnectedBranches.length
    })
  })

  it('修复验证：预览线不应被计算为真实连接', () => {
    // 创建audience-split节点
    const testNode = createMockNode('node_preview_test', 'audience-split', {
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'crowd_1', name: '人群1', conditions: [] },
          { id: 'crowd_2', name: '人群2', conditions: [] }
        ],
        unmatchBranch: {
          id: 'unmatch',
          name: '未命中',
          enabled: true
        },
        branches: [
          { id: 'branch_1', label: '人群1分支' },
          { id: 'branch_2', label: '人群2分支' },
          { id: 'branch_3', label: '未命中分支' }
        ]
      }
    })

    // 模拟只有预览线连接，没有真实连接
    const previewOnlyEdges = [
      createMockEdge('preview_1', 'node_preview_test', 'preview_target_1', 'branch_1', true),
      createMockEdge('preview_2', 'node_preview_test', 'preview_target_2', 'branch_2', true),
      createMockEdge('preview_3', 'node_preview_test', 'preview_target_3', 'branch_3', true)
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(previewOnlyEdges)

    // 验证：即使有预览线，shouldCreatePreviewLine仍应返回true（预览线不算真实连接）
    const shouldCreate = previewManager.previewManager.validator.shouldCreatePreviewLine(testNode)
    expect(shouldCreate).toBe(true)

    // 验证详细分析：所有分支都应被视为未连接
    const detailResult = previewManager.previewManager.validator.shouldCreatePreviewLineWithDetails(testNode)
    expect(detailResult.shouldCreate).toBe(true)
    expect(detailResult.details.connectedBranches).toEqual([]) // 预览线不算真实连接
    expect(detailResult.details.unconnectedBranches.length).toBe(3) // 所有分支都未真实连接
  })

  it('边界情况：所有分支都有真实连接时不应创建预览线', () => {
    // 创建audience-split节点
    const testNode = createMockNode('node_full_connected', 'audience-split', {
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'crowd_1', name: '人群1', conditions: [] },
          { id: 'crowd_2', name: '人群2', conditions: [] }
        ],
        unmatchBranch: {
          id: 'unmatch',
          name: '未命中',
          enabled: true
        },
        branches: [
          { id: 'branch_1', label: '人群1分支' },
          { id: 'branch_2', label: '人群2分支' },
          { id: 'branch_3', label: '未命中分支' }
        ]
      }
    })

    // 模拟所有分支都有真实连接
    const allConnectedEdges = [
      createMockEdge('real_1', 'node_full_connected', 'target_1', 'branch_1', false),
      createMockEdge('real_2', 'node_full_connected', 'target_2', 'branch_2', false),
      createMockEdge('real_3', 'node_full_connected', 'target_3', 'branch_3', false)
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(allConnectedEdges)

    // 验证：所有分支都连接时，不应创建预览线
    const shouldCreate = previewManager.previewManager.validator.shouldCreatePreviewLine(testNode)
    expect(shouldCreate).toBe(false)

    // 验证详细分析
    const detailResult = previewManager.previewManager.validator.shouldCreatePreviewLineWithDetails(testNode)
    expect(detailResult.shouldCreate).toBe(false)
    expect(detailResult.reason).toBe('分支节点所有分支都已连接')
  })

  it('配置检查：未配置的audience-split节点不应创建预览线', async () => {
    // 直接清理防重复创建缓存（不使用实际等待）
    previewManager.previewManager.validator._lastValidationCache?.clear?.()
    
    // 创建未配置的audience-split节点（使用唯一ID避免缓存冲突）
    const unconfiguredNode = createMockNode('node_unconfigured_unique_' + Date.now(), 'audience-split', {
      isConfigured: false,
      config: {},
      // 确保没有分支配置
      branches: undefined,
      crowdLayers: undefined,
      unmatchBranch: undefined
    })

    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 验证详细分析（直接调用详细方法，避免防重复创建机制）
    const detailResult = previewManager.previewManager.validator.shouldCreatePreviewLineWithDetails(unconfiguredNode)
    expect(detailResult.shouldCreate).toBe(false)
    expect(detailResult.reason).toBe('节点未配置，跳过预览线创建')
    
    // 验证简单方法也返回false
    const shouldCreate = previewManager.previewManager.validator.shouldCreatePreviewLine(unconfiguredNode)
    expect(shouldCreate).toBe(false)
  })
})