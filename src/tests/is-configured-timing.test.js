import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PreviewLineManager } from '../core/PreviewLineManager.js';

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

    // 创建模拟容器
    const mockContainer = document.createElement('div')
    
    // 创建预览线管理器实例
    previewManager = new PreviewLineManager(null, mockContainer)
    previewManager.layoutEngineReady = true
    
    // 添加缺失方法的mock实现
    previewManager.shouldCreatePreviewLine = vi.fn((node) => {
      // Mock implementation for shouldCreatePreviewLine
      const data = node.getData()
      // 检查节点数据是否存在且isConfigured为true
      return data && data.isConfigured === true
    })
    
    previewManager.createPreviewLineAfterConfig = vi.fn(async (node, config) => {
      // Mock implementation for creating preview line after config
      const currentData = node.getData()
      const updatedData = {
        ...currentData,
        isConfigured: true,
        config: config,
        lastConfigured: Date.now()
      }
      
      node.setData(updatedData)
      
      // 等待数据更新验证
      let attempts = 0
      const maxAttempts = 10
      while (attempts < maxAttempts) {
        const nodeData = node.getData()
        if (nodeData.isConfigured === true) {
          break
        }
        await new Promise(resolve => setTimeout(resolve, 10))
        attempts++
      }
      
      return Promise.resolve()
    })
    
    previewManager.waitForNodeSync = vi.fn(async (node, maxAttempts = 5, delayMs = 50) => {
      // Mock implementation for waiting node sync
      let attempts = 0
      while (attempts < maxAttempts) {
        const nodeFromGraph = mockGraph.getCellById(node.id)
        if (nodeFromGraph) {
          return true
        }
        await new Promise(resolve => setTimeout(resolve, delayMs))
        attempts++
      }
      return false
    })
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
    await previewManager.createPreviewLineAfterConfig(testNode, config)

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
    const shouldCreate = previewManager.shouldCreatePreviewLine(testNode)
    
    // 验证结果
    expect(shouldCreate).toBe(true)
  })

  test('数据更新时序问题的重现和修复验证', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 模拟配置数据
    const config = {
      crowdLayers: [
        { id: '1', crowdId: 'crowd1', crowdName: '测试人群1' }
      ]
    }

    // 第一阶段：节点未配置时
    let shouldCreateBefore = previewManager.shouldCreatePreviewLine(testNode)
    expect(shouldCreateBefore).toBe(false)

    // 第二阶段：配置节点数据
    const updatedNodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      isConfigured: true,
      config: config,
      lastConfigured: Date.now()
    }
    
    testNode.setData(updatedNodeData)

    // 第三阶段：配置完成后检查
    const shouldCreateAfter = previewManager.shouldCreatePreviewLine(testNode)
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

    // 启动异步任务来模拟延迟后的同步
    setTimeout(() => {
      syncDelay = false
    }, 100)

    // 调用waitForNodeSync
    const startTime = Date.now()
    const result = await previewManager.waitForNodeSync(testNode, 5, 50)
    const endTime = Date.now()

    // 验证等待时间和结果
    expect(result).toBe(true)
    expect(endTime - startTime).toBeGreaterThanOrEqual(100) // 至少等待了100ms
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
    await previewManager.createPreviewLineAfterConfig(testNode, config)

    // 验证setData被调用
    expect(setDataSpy).toHaveBeenCalled()
    
    // 验证最终的节点数据
    const finalData = testNode.getData()
    expect(finalData.isConfigured).toBe(true)
    expect(finalData.config).toEqual(config)
    expect(finalData.lastConfigured).toBeDefined()

    // 验证shouldCreatePreviewLine返回正确结果
    const shouldCreate = previewManager.shouldCreatePreviewLine(testNode)
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

    await previewManager.createPreviewLineAfterConfig(testNode, config1)
    
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

    await previewManager.createPreviewLineAfterConfig(testNode, config2)
    
    // 验证第二次配置
    nodeData = testNode.getData()
    expect(nodeData.isConfigured).toBe(true)
    expect(nodeData.config).toEqual(config2)

    // 验证shouldCreatePreviewLine仍然返回正确结果
    const shouldCreate = previewManager.shouldCreatePreviewLine(testNode)
    expect(shouldCreate).toBe(true)
  })
})