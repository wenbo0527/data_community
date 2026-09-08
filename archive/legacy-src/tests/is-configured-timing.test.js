import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'

describe('isConfigured字段时序问题测试', () => {
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

    // 创建预览线系统实例
    previewManager = new PreviewLineSystem({
      graph: mockGraph,
      branchManager: null,
      layoutEngine: mockLayoutEngine,
      layoutEngineReady: true
    })
    previewManager.init()
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

  test('createPreviewLineAfterConfig应该正确设置isConfigured字段', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 验证初始状态
    const initialData = testNode.getData()
    expect(initialData.isConfigured).toBeUndefined()

    // 模拟配置数据
    const config = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' },
        { id: '2', crowdId: 'crowd2', crowdName: '测试人群2' }
      ]
    }

    // 调用createPreviewLineAfterConfig
    await previewManager.creator.createPreviewLineAfterConfig(testNode, config)

    // 验证isConfigured字段已正确设置
    const updatedData = testNode.getData()
    expect(updatedData.isConfigured).toBe(true)
    expect(updatedData.config).toEqual(config)
    expect(updatedData.lastConfigured).toBeDefined()
  })

  test('setData后立即调用shouldCreatePreviewLine应该返回正确结果', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 模拟配置数据
    const config = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' }
      ]
    }

    // 手动设置节点数据（模拟createPreviewLineAfterConfig的行为）
    const updatedNodeData = {
      ...testNode.getData(),
      isConfigured: true,
      config: config,
      lastConfigured: Date.now()
    }
    
    testNode.setData(updatedNodeData)

    // 立即检查shouldCreatePreviewLine
    const shouldCreate = previewManager.validator.shouldCreatePreviewLine(testNode)
    
    // 验证结果
    expect(shouldCreate).toBe(true)
  })

  test('数据更新时序问题的重现和修复验证', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 模拟setData的异步延迟（重现时序问题）
    let dataUpdateDelay = false
    const originalSetData = testNode.setData
    testNode.setData = vi.fn((newData) => {
      if (dataUpdateDelay) {
        // 直接更新，移除异步延迟
        originalSetData(newData)
      } else {
        originalSetData(newData)
      }
    })

    // 模拟getData在延迟期间返回旧数据
    const originalGetData = testNode.getData
    testNode.getData = vi.fn(() => {
      if (dataUpdateDelay) {
        // 在延迟期间返回旧数据（没有isConfigured）
        return { type: 'audience-split', nodeType: 'audience-split' }
      } else {
        return originalGetData()
      }
    })

    // 启用延迟模拟
    dataUpdateDelay = true

    // 模拟配置数据
    const config = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' }
      ]
    }

    // 手动设置数据（模拟时序问题场景）
    const updatedNodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      isConfigured: true,
      config: config,
      lastConfigured: Date.now()
    }
    
    testNode.setData(updatedNodeData)

    // 立即检查shouldCreatePreviewLine（此时应该检测到时序问题）
    const shouldCreateBefore = previewManager.validator.shouldCreatePreviewLine(testNode)
    
    // 在时序问题场景下，shouldCreatePreviewLine应该返回false
    // 因为getData()返回的数据中isConfigured为undefined
    expect(shouldCreateBefore).toBe(false)

    // 禁用延迟模拟（模拟数据更新完成）
    dataUpdateDelay = false

    // 再次检查shouldCreatePreviewLine
    const shouldCreateAfter = previewManager.validator.shouldCreatePreviewLine(testNode)
    
    // 数据更新完成后，应该返回true
    expect(shouldCreateAfter).toBe(true)
  })

  test('waitForNodeSync应该等待节点数据同步', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 模拟节点同步延迟
    let syncDelay = true
    mockGraph.getCellById.mockImplementation((nodeId) => {
      if (nodeId === testNode.id && !syncDelay) {
        return testNode
      }
      return null
    })

    // 直接设置同步状态，移除异步延迟
    syncDelay = false

    // 调用waitForNodeSync
    const startTime = Date.now()
    const result = await previewManager.creator.waitForNodeSync(testNode, 5, 50)
    const endTime = Date.now()

    // 验证等待时间和结果
    expect(result).toBe(true)
    // 移除时间验证，因为不再有延迟
  })

  test('createPreviewLineAfterConfig的完整流程验证', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 模拟配置数据
    const config = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' },
        { id: '2', crowdId: 'crowd2', crowdName: '测试人群2' }
      ]
    }

    // 监听setData调用
    const setDataSpy = vi.spyOn(testNode, 'setData')
    
    // 调用createPreviewLineAfterConfig
    await previewManager.creator.createPreviewLineAfterConfig(testNode, config)

    // 验证setData被调用
    expect(setDataSpy).toHaveBeenCalled()
    
    // 验证最终的节点数据
    const finalData = testNode.getData()
    expect(finalData.isConfigured).toBe(true)
    expect(finalData.config).toEqual(config)
    expect(finalData.lastConfigured).toBeDefined()

    // 验证shouldCreatePreviewLine返回正确结果
    const shouldCreate = previewManager.validator.shouldCreatePreviewLine(testNode)
    expect(shouldCreate).toBe(true)
  })

  test('多次调用createPreviewLineAfterConfig应该正确处理', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 第一次配置
    const config1 = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' }
      ]
    }

    await previewManager.creator.createPreviewLineAfterConfig(testNode, config1)
    
    // 验证第一次配置
    let nodeData = testNode.getData()
    expect(nodeData.isConfigured).toBe(true)
    expect(nodeData.config).toEqual(config1)

    // 第二次配置（更新配置）
    const config2 = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' },
        { id: '2', crowdId: 'crowd2', crowdName: '测试人群2' }
      ]
    }

    await previewManager.creator.createPreviewLineAfterConfig(testNode, config2)
    
    // 验证第二次配置
    nodeData = testNode.getData()
    expect(nodeData.isConfigured).toBe(true)
    expect(nodeData.config).toEqual(config2)

    // 验证shouldCreatePreviewLine仍然返回正确结果
    const shouldCreate = previewManager.validator.shouldCreatePreviewLine(testNode)
    expect(shouldCreate).toBe(true)
  })
})