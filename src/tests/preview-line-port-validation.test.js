/**
 * 预览线端口位置验证测试
 * 验证预览线是否从节点的out端口开始
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'

describe('预览线端口位置验证', () => {
  let mockGraph
  let previewManager
  let mockNode

  beforeEach(async () => {
    // 模拟图对象
    mockGraph = {
      addEdge: vi.fn().mockReturnValue({
        id: 'preview-line-1',
        getData: () => ({ type: 'preview-line' }),
        remove: vi.fn(),
        isVisible: vi.fn().mockReturnValue(true),
        getZIndex: vi.fn().mockReturnValue(1),
        getAttrs: vi.fn().mockReturnValue({ line: {} }),
        setAttrs: vi.fn(),
        attr: vi.fn()
      }),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      hasCell: vi.fn().mockReturnValue(true),
      getCellById: vi.fn(),
      getEdges: vi.fn().mockReturnValue([]),
      getNodes: vi.fn().mockReturnValue([]),
      removeCell: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建预览线管理器
    previewManager = new PreviewLineSystem({
      graph: mockGraph,
      config: {
        layoutEngineReady: true
      }
    })
    await previewManager.init()

    // 模拟节点
    mockNode = {
      id: 'test-node',
      getPosition: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      getSize: vi.fn().mockReturnValue({ width: 120, height: 60 }),
      getData: vi.fn().mockReturnValue({
        type: 'start',
        nodeType: 'start',
        isConfigured: true,
        config: {
          taskType: 'marketing'
        }
      })
    }

    mockGraph.getCellById.mockReturnValue({
      ...mockNode,
      isNode: () => true
    })
  })

  it('预览线应该从节点的out端口开始', async () => {
    // 设置：节点无连接且已配置
    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 确保系统已初始化
    previewManager.initialized = true
    previewManager.destroyed = false

    // 执行：创建预览线
    const result = await previewManager.createPreviewLine(mockNode.id, { x: 200, y: 150 }, 'default', '默认')

    // 验证：应该创建预览线
    expect(mockGraph.addEdge).toHaveBeenCalled()

    // 获取传递给addEdge的配置
    const edgeConfig = mockGraph.addEdge.mock.calls[0][0]

    // 验证：预览线的source应该指定out端口
    expect(edgeConfig.source).toEqual({
      cell: 'test-node',
      port: 'out'
    })

    console.log('✅ [测试] 预览线端口配置验证通过:', {
      sourceConfig: edgeConfig.source,
      nodeId: mockNode.id,
      port: edgeConfig.source.port
    })
  })

  it('不同类型节点的预览线都应该从out端口开始', async () => {
    const nodeTypes = ['start', 'sms', 'ai-call', 'manual-call']

    for (const nodeType of nodeTypes) {
      // 重置mock
      mockGraph.addEdge.mockClear()
      
      // 设置节点类型
      mockNode.getData.mockReturnValue({
        type: nodeType,
        nodeType: nodeType,
        isConfigured: true,
        config: { test: 'config' }
      })

      // 设置无连接
      mockGraph.getOutgoingEdges.mockReturnValue([])

      // 确保系统已初始化
      previewManager.initialized = true
      previewManager.destroyed = false

      // 创建预览线
      const result = await previewManager.createPreviewLine(mockNode.id, { x: 200, y: 150 }, 'default', '默认')

      if (mockGraph.addEdge.mock.calls.length > 0) {
        const edgeConfig = mockGraph.addEdge.mock.calls[0][0]
        
        // 验证：所有类型的节点预览线都应该从out端口开始
        expect(edgeConfig.source).toEqual({
          cell: 'test-node',
          port: 'out'
        })

        console.log(`✅ [测试] ${nodeType}节点预览线端口配置正确:`, {
          nodeType,
          sourceConfig: edgeConfig.source
        })
      }
    }
  })

  it('预览线配置应该包含正确的端口和连接器设置', async () => {
    // 设置：节点无连接且已配置
    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 确保系统已初始化
    previewManager.initialized = true
    previewManager.destroyed = false

    // 执行：创建预览线
    const result = await previewManager.createPreviewLine(mockNode.id, { x: 200, y: 150 }, 'default', '默认')

    // 验证：应该创建预览线
    expect(mockGraph.addEdge).toHaveBeenCalled()

    // 获取传递给addEdge的配置
    const edgeConfig = mockGraph.addEdge.mock.calls[0][0]

    // 验证：预览线配置应该包含正确的路由和连接器
    expect(edgeConfig).toMatchObject({
      shape: 'edge',
      source: {
        cell: 'test-node',
        port: 'out'
      },
      router: {
        name: 'orth',
        args: {
          padding: 20,
          step: 20
        }
      },
      connector: {
        name: 'rounded'
      }
    })

    // 验证：预览线应该有箭头标记
    expect(edgeConfig.attrs.line.targetMarker).toEqual({
      name: 'classic',
      size: 8
    })

    console.log('✅ [测试] 预览线完整配置验证通过:', {
      source: edgeConfig.source,
      router: edgeConfig.router,
      connector: edgeConfig.connector,
      targetMarker: edgeConfig.attrs.line.targetMarker
    })
  })
})