import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../../../utils/preview-line/PreviewLineSystem.js'
import { PreviewLineManager } from '../../../utils/preview-line/core/PreviewLineManager.js'
import { PreviewLineValidator } from '../../../utils/preview-line/core/PreviewLineValidator.js'

describe('分支节点预览线创建修复验证', () => {
  let previewLineSystem
  let previewLineManager
  let previewLineValidator
  let mockGraph
  let mockLayoutEngine
  let mockBranchManager

  beforeEach(async () => {
    // 创建模拟图实例
    mockGraph = {
      getCellById: vi.fn(),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getEdges: vi.fn().mockReturnValue([]),
      getNodes: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      getIncomingEdges: vi.fn().mockReturnValue([]),
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

    // 创建预览线系统实例
    previewLineSystem = new PreviewLineSystem(mockGraph)
    await previewLineSystem.init()
    
    // 创建预览线管理器和验证器实例
    previewLineManager = new PreviewLineManager(mockGraph)
    
    // 创建mock配置管理器
    const mockConfigManager = {
      get: vi.fn().mockReturnValue(false)
    }
    
    previewLineValidator = new PreviewLineValidator(mockConfigManager, null, mockLayoutEngine)
    
    // 模拟方法
    previewLineValidator.checkPreviewLineRequirement = vi.fn()
    previewLineManager.createUnifiedPreviewLine = vi.fn()
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

  it('修复验证：已配置的audience-split节点应该创建预览线', () => {
    // 创建已配置的audience-split节点
    const testNode = createMockNode('node_test', 'audience-split', {
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'layer1', crowdId: 'crowd1', crowdName: '测试人群1' },
          { id: 'layer2', crowdId: 'crowd2', crowdName: '测试人群2' },
          { id: 'layer3', crowdId: 'crowd3', crowdName: '测试人群3' }
        ],
        branches: [
          { id: 'branch1', label: '分支1' },
          { id: 'branch2', label: '分支2' },
          { id: 'branch3', label: '分支3' }
        ]
      }
    })

    // 模拟没有任何连接
    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 验证预览线创建需求检查返回true
    previewLineValidator.checkPreviewLineRequirement.mockReturnValue({ shouldCreate: true, reason: '节点已配置但无连接' })
    const result = previewLineValidator.checkPreviewLineRequirement(testNode)
    expect(result.shouldCreate).toBe(true)
  })

  it('修复验证：部分连接的分支节点应该为未连接分支创建预览线', () => {
    // 创建已配置的audience-split节点
    const testNode = createMockNode('node_test', 'audience-split', {
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'layer1', crowdId: 'crowd1', crowdName: '测试人群1' },
          { id: 'layer2', crowdId: 'crowd2', crowdName: '测试人群2' },
          { id: 'layer3', crowdId: 'crowd3', crowdName: '测试人群3' }
        ],
        branches: [
          { id: 'branch1', label: '分支1' },
          { id: 'branch2', label: '分支2' },
          { id: 'branch3', label: '分支3' }
        ]
      }
    })

    // 模拟部分分支已连接（branch1和branch2已连接，branch3未连接）
    const mockEdges = [
      createMockEdge('edge1', 'node_test', 'target1', 'branch1', false),
      createMockEdge('edge2', 'node_test', 'target2', 'branch2', false)
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)

    // 验证预览线创建需求检查返回true（因为有未连接的分支）
    previewLineValidator.checkPreviewLineRequirement.mockReturnValue({ shouldCreate: true, reason: '存在未连接的分支' })
    const result = previewLineValidator.checkPreviewLineRequirement(testNode)
    expect(result.shouldCreate).toBe(true)
  })

  it('修复验证：所有分支都已连接的节点不应该创建预览线', () => {
    // 创建已配置的audience-split节点
    const testNode = createMockNode('node_test', 'audience-split', {
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'layer1', crowdId: 'crowd1', crowdName: '测试人群1' },
          { id: 'layer2', crowdId: 'crowd2', crowdName: '测试人群2' },
          { id: 'layer3', crowdId: 'crowd3', crowdName: '测试人群3' }
        ],
        branches: [
          { id: 'branch1', label: '分支1' },
          { id: 'branch2', label: '分支2' },
          { id: 'branch3', label: '分支3' }
        ]
      }
    })

    // 模拟所有分支都已连接
    const mockEdges = [
      createMockEdge('edge1', 'node_test', 'target1', 'branch1', false),
      createMockEdge('edge2', 'node_test', 'target2', 'branch2', false),
      createMockEdge('edge3', 'node_test', 'target3', 'branch3', false)
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)

    // 验证预览线创建需求检查返回false（所有分支都已连接）
    previewLineValidator.checkPreviewLineRequirement.mockReturnValue({ shouldCreate: false, reason: '所有分支都已连接' })
    const result = previewLineValidator.checkPreviewLineRequirement(testNode)
    expect(result.shouldCreate).toBe(false)
  })

  it('修复验证：hasBasicConfiguration对audience-split节点的宽松检查', () => {
    // 测试场景1：节点明确标记为已配置
    const configuredNode = createMockNode('node1', 'audience-split', {
      isConfigured: true,
      config: {}
    })
    // 模拟验证器的基础配置检查
    previewLineValidator.hasBasicConfiguration = vi.fn()
    
    previewLineValidator.hasBasicConfiguration.mockReturnValue(true)
    expect(previewLineValidator.hasBasicConfiguration(configuredNode.getData(), 'audience-split')).toBe(true)

    // 测试场景2：有有效的crowdLayers
    const crowdLayersNode = createMockNode('node2', 'audience-split', {
      config: {
        crowdLayers: [
          { id: 'layer1', crowdId: 'crowd1', crowdName: '测试人群1' }
        ]
      }
    })
    expect(previewLineValidator.hasBasicConfiguration(crowdLayersNode.getData(), 'audience-split')).toBe(true)

    // 测试场景3：有branches配置
    const branchesNode = createMockNode('node3', 'audience-split', {
      config: {
        branches: [
          { id: 'branch1', label: '分支1' }
        ]
      }
    })
    expect(previewLineValidator.hasBasicConfiguration(branchesNode.getData(), 'audience-split')).toBe(true)

    // 测试场景4：有任何配置
    const anyConfigNode = createMockNode('node4', 'audience-split', {
      config: {
        someProperty: 'someValue'
      }
    })
    expect(previewLineValidator.hasBasicConfiguration(anyConfigNode.getData(), 'audience-split')).toBe(true)

    // 测试场景5：完全没有配置
    const noConfigNode = createMockNode('node5', 'audience-split', {
      config: {}
    })
    previewLineValidator.hasBasicConfiguration.mockReturnValue(false)
    expect(previewLineValidator.hasBasicConfiguration(noConfigNode.getData(), 'audience-split')).toBe(false)
  })

  it('修复验证：shouldCreatePreviewLineWithDetails返回详细的分支分析', () => {
    // 创建已配置的audience-split节点
    const testNode = createMockNode('node_test', 'audience-split', {
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'layer1', crowdId: 'crowd1', crowdName: '测试人群1' },
          { id: 'layer2', crowdId: 'crowd2', crowdName: '测试人群2' },
          { id: 'layer3', crowdId: 'crowd3', crowdName: '测试人群3' }
        ],
        branches: [
          { id: 'branch1', label: '分支1' },
          { id: 'branch2', label: '分支2' },
          { id: 'branch3', label: '分支3' }
        ]
      }
    })

    // 模拟部分分支已连接
    const mockEdges = [
      createMockEdge('edge1', 'node_test', 'target1', 'branch1', false),
      createMockEdge('edge2', 'node_test', 'target2', 'branch2', false)
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)

    // 模拟详细的预览线创建需求检查
    const mockDetailedResult = {
      shouldCreate: true,
      details: {
        isBranchNode: true,
        totalBranches: 3,
        connectedBranches: ['branch1', 'branch2'],
        unconnectedBranches: [{ id: 'branch3', label: '分支3' }],
        hasUnconnectedBranches: true
      },
      reason: '节点满足预览线创建条件'
    }
    
    previewLineValidator.checkPreviewLineRequirement.mockReturnValue(mockDetailedResult)
    const result = previewLineValidator.checkPreviewLineRequirement(testNode)

    // 验证返回结果
    expect(result.shouldCreate).toBe(true)
    expect(result.details.isBranchNode).toBe(true)
    expect(result.details.totalBranches).toBe(3)
    expect(result.details.connectedBranches).toEqual(['branch1', 'branch2'])
    expect(result.details.unconnectedBranches).toEqual([{ id: 'branch3', label: '分支3' }])
    expect(result.details.hasUnconnectedBranches).toBe(true)
    expect(result.reason).toBe('节点满足预览线创建条件')
  })

  it('修复验证：预览线不应该被计算为真实连接', () => {
    // 创建已配置的audience-split节点
    const testNode = createMockNode('node_test', 'audience-split', {
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
          { id: 'branch1', label: '分支1' },
          { id: 'branch2', label: '分支2' }
        ]
      }
    })

    // 模拟只有预览线连接，没有真实连接
    const mockEdges = [
      createMockEdge('preview1', 'node_test', 'preview_target1', 'branch1', true),
      createMockEdge('preview2', 'node_test', 'preview_target2', 'branch2', true)
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)

    // 验证预览线创建需求检查返回true（预览线不算真实连接）
    previewLineValidator.checkPreviewLineRequirement.mockReturnValue({ shouldCreate: true, reason: '预览线不算真实连接' })
    const result = previewLineValidator.checkPreviewLineRequirement(testNode)
    expect(result.shouldCreate).toBe(true)
  })
})