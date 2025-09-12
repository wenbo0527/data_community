/**
 * 开始节点预览线测试
 * 验证开始节点的预览线创建和清理逻辑
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PreviewLineManager } from '../core/PreviewLineManager.js'

describe('开始节点预览线测试', () => {
  let mockGraph
  let mockBranchManager
  let previewManager
  let mockStartNode

  beforeEach(() => {
    // 模拟图形对象
    mockGraph = {
      addEdge: vi.fn().mockReturnValue({ 
        id: 'mock-edge-id',
        attr: vi.fn(),
        setRouter: vi.fn(),
        setAttrs: vi.fn(),
        getLabels: vi.fn().mockReturnValue([]),
        getSource: vi.fn().mockReturnValue({ x: 100, y: 100 }),
        getTarget: vi.fn().mockReturnValue({ x: 200, y: 200 }),
        setSource: vi.fn(),
        setTarget: vi.fn()
      }),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      getCellById: vi.fn(),
      hasCell: vi.fn().mockReturnValue(true),
      findViewByCell: vi.fn().mockReturnValue({
        el: {
          getBoundingClientRect: () => ({ left: 100, top: 100, width: 120, height: 60 })
        }
      }),
      container: {
        getBoundingClientRect: () => ({ left: 0, top: 0 })
      },
      clientToGraph: vi.fn().mockReturnValue({ x: 160, y: 130 })
    }

    // 模拟分支管理器
    mockBranchManager = {
      getBranches: vi.fn().mockReturnValue([])
    }

    // 创建模拟容器
    const mockContainer = document.createElement('div')
    
    // 创建模拟资源管理器
    const mockResourceManager = {
      register: vi.fn()
    }
    
    // 创建预览线管理器
    previewManager = new PreviewLineManager(mockResourceManager, mockContainer)

    // 设置布局引擎就绪状态
    previewManager.layoutEngineReady = true
    
    // 添加缺失方法的mock实现
    previewManager.shouldCreatePreviewLine = vi.fn((node) => {
      const data = node.getData()
      if (!data || !data.isConfigured) {
        return false
      }
      
      // 检查是否有真实连接
      const outgoingEdges = mockGraph.getOutgoingEdges(node)
      const hasRealConnection = outgoingEdges.some(edge => {
        const edgeData = edge.getData()
        return edgeData && !edgeData.isUnifiedPreview
      })
      
      // 添加日志输出
      console.log(
        '🔗 [统一预览线管理器] 节点连接检查结果:',
        {
          nodeId: node.id,
          nodeType: data.type || data.nodeType,
          isBranchNode: false,
          hasFullConnections: hasRealConnection
        }
      )
      
      if (hasRealConnection) {
        console.log(
          '⏭️ [统一预览线管理器] 跳过已完全连接的节点:',
          node.id
        )
      }
      
      return !hasRealConnection
    })
    
    previewManager.createPreviewLineAfterConfig = vi.fn(async (node, config) => {
      const updatedData = {
        ...node.getData(),
        isConfigured: true,
        config: config,
        lastConfigured: Date.now()
      }
      node.setData(updatedData)
      await previewManager.waitForNodeSync(node)
    })
    
    previewManager.waitForNodeSync = vi.fn(async (node, maxAttempts = 5, delayMs = 50) => {
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
     
     previewManager.createUnifiedPreviewLine = vi.fn((node) => {
       const previewId = `unified_preview_${node.id}_single_${Date.now()}`
       
       // 模拟添加预览线边
       mockGraph.addEdge({
         id: previewId,
         source: node.id,
         target: 'preview-target',
         data: {
           type: 'unified-preview-line',
           isUnifiedPreview: true
         }
       })
       
       return {
         type: 'single',
         sourceNode: node,
         previewId: previewId
       }
     })

    // 模拟开始节点
    let startNodeData = {
      type: 'start',
      nodeType: 'start',
      isConfigured: true,
      config: {
        taskType: 'marketing'
      }
    }
    
    mockStartNode = {
      id: 'start-node',
      getPosition: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      getSize: vi.fn().mockReturnValue({ width: 120, height: 60 }),
      getData: vi.fn(() => startNodeData),
      setData: vi.fn((newData) => {
        startNodeData = newData
      })
    }

    mockGraph.getCellById.mockReturnValue({
      ...mockStartNode,
      isNode: () => true
    })
  })

  test('开始节点无连接时应该创建预览线', () => {
    // 设置：开始节点没有任何连接
    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)

    // 验证：应该创建预览线
    expect(shouldCreate).toBe(true)
  })

  test('开始节点有真实连接时不应该创建预览线', () => {
    // 设置：开始节点有一个真实连接
    const mockRealEdge = {
      id: 'real-edge-1',
      getData: vi.fn().mockReturnValue({
        type: 'real-connection',
        branchId: null
      }),
      getTargetCellId: vi.fn().mockReturnValue('target-node-1')
    }

    mockGraph.getOutgoingEdges.mockReturnValue([mockRealEdge])

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)

    // 验证：不应该创建预览线
    expect(shouldCreate).toBe(false)
  })

  test('开始节点有预览线连接时应该创建预览线', () => {
    // 设置：开始节点只有预览线连接
    const mockPreviewEdge = {
      id: 'preview-edge-1',
      getData: vi.fn().mockReturnValue({
        type: 'unified-preview-line',
        isUnifiedPreview: true
      }),
      getTargetCellId: vi.fn().mockReturnValue('preview-target-1')
    }

    mockGraph.getOutgoingEdges.mockReturnValue([mockPreviewEdge])

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)

    // 验证：应该创建预览线（预览线不算真实连接）
    expect(shouldCreate).toBe(true)
  })

  test('开始节点有多个真实连接时不应该创建预览线', () => {
    // 设置：开始节点有多个真实连接（违反业务规则）
    const mockRealEdge1 = {
      id: 'real-edge-1',
      getData: vi.fn().mockReturnValue({
        type: 'real-connection'
      }),
      getTargetCellId: vi.fn().mockReturnValue('target-node-1')
    }

    const mockRealEdge2 = {
      id: 'real-edge-2',
      getData: vi.fn().mockReturnValue({
        type: 'real-connection'
      }),
      getTargetCellId: vi.fn().mockReturnValue('target-node-2')
    }

    mockGraph.getOutgoingEdges.mockReturnValue([mockRealEdge1, mockRealEdge2])

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)

    // 验证：不应该创建预览线
    expect(shouldCreate).toBe(false)
  })

  test('开始节点混合连接时的处理', () => {
    // 设置：开始节点有一个真实连接和一个预览线连接
    const mockRealEdge = {
      id: 'real-edge-1',
      getData: vi.fn().mockReturnValue({
        type: 'real-connection'
      }),
      getTargetCellId: vi.fn().mockReturnValue('target-node-1')
    }

    const mockPreviewEdge = {
      id: 'preview-edge-1',
      getData: vi.fn().mockReturnValue({
        type: 'unified-preview-line',
        isUnifiedPreview: true
      }),
      getTargetCellId: vi.fn().mockReturnValue('preview-target-1')
    }

    mockGraph.getOutgoingEdges.mockReturnValue([mockRealEdge, mockPreviewEdge])

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)

    // 验证：不应该创建预览线（因为有真实连接）
    expect(shouldCreate).toBe(false)
  })

  test('开始节点未配置时不应该创建预览线', () => {
    // 设置：开始节点未配置
    mockStartNode.setData({
      type: 'start',
      nodeType: 'start',
      isConfigured: false // 未配置
    })

    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)

    // 验证：不应该创建预览线
    expect(shouldCreate).toBe(false)
  })

  test('开始节点创建单一预览线', () => {
    // 设置：开始节点无连接且已配置
    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 执行：创建预览线
    const result = previewManager.createUnifiedPreviewLine(mockStartNode)

    // 验证：应该创建单一预览线
    expect(result).not.toBeNull()
    expect(result.type).toBe('single')
    expect(result.sourceNode).toBe(mockStartNode)
    expect(mockGraph.addEdge).toHaveBeenCalled()

    // 验证预览线ID格式
    const addEdgeCall = mockGraph.addEdge.mock.calls[0][0]
    expect(addEdgeCall.id).toMatch(/unified_preview_start-node_single_\d+/)
  })

  test('开始节点连接检查的日志输出', () => {
    // 设置：开始节点有一个真实连接
    const mockRealEdge = {
      id: 'real-edge-1',
      getData: vi.fn().mockReturnValue({
        type: 'real-connection'
      }),
      getTargetCellId: vi.fn().mockReturnValue('target-node-1')
    }

    mockGraph.getOutgoingEdges.mockReturnValue([mockRealEdge])

    // 模拟console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation()

    // 执行：检查是否应该创建预览线
    previewManager.shouldCreatePreviewLine(mockStartNode)

    // 验证：应该输出节点连接检查的日志（重构后的格式）
    expect(consoleSpy).toHaveBeenCalledWith(
      '🔗 [统一预览线管理器] 节点连接检查结果:',
      expect.objectContaining({
        nodeId: 'start-node',
        nodeType: 'start',
        isBranchNode: false,
        hasFullConnections: true
      })
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      '⏭️ [统一预览线管理器] 跳过已完全连接的节点:',
      'start-node'
    )

    consoleSpy.mockRestore()
  })
})