import { describe, test, expect, beforeEach, vi } from 'vitest'
import UnifiedPreviewLineManager from '../utils/UnifiedPreviewLineManager.js'

describe('isConfigured字段修复验证', () => {
  let previewManager
  let mockGraph
  let mockLayoutEngine

  beforeEach(() => {
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

    // 创建预览线管理器实例
    // 创建预览线管理器实例 - 修复参数顺序
    // 正确的参数顺序: (graph, branchManager, layoutConfig, layoutEngine)
    previewManager = new UnifiedPreviewLineManager(
      mockGraph,        // graph
      null,            // branchManager
      {},              // layoutConfig
      mockLayoutEngine // layoutEngine
    )
    previewManager.layoutEngineReady = true
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

  test('修复验证：isConfigured字段应该立即生效', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 验证初始状态
    expect(testNode.getData().isConfigured).toBeUndefined()

    // 模拟配置数据
    const config = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' }
      ]
    }

    // 调用createPreviewLineAfterConfig
    await previewManager.createPreviewLineAfterConfig(testNode, config)

    // 验证isConfigured字段已正确设置
    const finalData = testNode.getData()
    expect(finalData.isConfigured).toBe(true)
    expect(finalData.config).toEqual(config)
    
    // 验证shouldCreatePreviewLine返回正确结果
    const shouldCreate = previewManager.shouldCreatePreviewLine(testNode)
    expect(shouldCreate).toBe(true)
  })

  test('修复验证：数据更新验证机制工作正常', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 模拟setData的延迟（测试验证机制）
    let updateDelay = true
    const originalSetData = testNode.setData
    testNode.setData = vi.fn((newData) => {
      // 模拟异步延迟
      setTimeout(() => {
        originalSetData(newData)
        updateDelay = false
      }, 30)
    })

    // 模拟getData在延迟期间的行为
    const originalGetData = testNode.getData
    testNode.getData = vi.fn(() => {
      if (updateDelay) {
        return { type: 'audience-split', nodeType: 'audience-split' }
      } else {
        return originalGetData()
      }
    })

    // 模拟配置数据
    const config = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' }
      ]
    }

    // 调用createPreviewLineAfterConfig
    const startTime = Date.now()
    await previewManager.createPreviewLineAfterConfig(testNode, config)
    const endTime = Date.now()

    // 验证等待时间（应该等待数据更新）
    expect(endTime - startTime).toBeGreaterThanOrEqual(30)
    
    // 验证最终结果
    const finalData = testNode.getData()
    expect(finalData.isConfigured).toBe(true)
  })

  test('修复验证：shouldCreatePreviewLine在配置后返回true', () => {
    // 创建已配置的测试节点
    const testNode = createMockNode('test-node', 'audience-split', {
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' }
        ]
      }
    })

    // 验证shouldCreatePreviewLine返回true
    const shouldCreate = previewManager.shouldCreatePreviewLine(testNode)
    expect(shouldCreate).toBe(true)
  })

  test('修复验证：未配置节点shouldCreatePreviewLine返回false', () => {
    // 创建未配置的测试节点
    const testNode = createMockNode('test-node', 'audience-split')

    // 验证shouldCreatePreviewLine返回false
    const shouldCreate = previewManager.shouldCreatePreviewLine(testNode)
    expect(shouldCreate).toBe(false)
  })
})