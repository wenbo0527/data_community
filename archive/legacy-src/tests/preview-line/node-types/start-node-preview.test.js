/**
 * 开始节点预览线测试
 * 验证开始节点的预览线创建和清理逻辑
 * 已迁移到新的PreviewLineSystem架构
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../../../utils/preview-line/PreviewLineSystem.js'
import { PreviewLineManager } from '../../../utils/preview-line/core/PreviewLineManager.js'
import { PreviewLineValidator } from '../../../utils/preview-line/core/PreviewLineValidator.js'

describe('开始节点预览线测试', () => {
  let mockGraph
  let mockBranchManager
  let previewSystem
  let previewLineManager
  let previewLineValidator
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
      clientToGraph: vi.fn().mockReturnValue({ x: 160, y: 130 }),
      getEdges: vi.fn().mockReturnValue([]),
      getNodes: vi.fn().mockReturnValue([])
    }

    // 模拟分支管理器
    mockBranchManager = {
      getBranches: vi.fn().mockReturnValue([])
    }

    // 创建预览线系统
    previewSystem = new PreviewLineSystem({
      graph: mockGraph,
      config: {
        branchManager: null,
        layoutEngine: null,
        layoutEngineReady: true
      }
    })
    // 初始化预览线系统（同步）
    previewSystem.init()
    
    // 初始化子模块
    previewLineManager = new PreviewLineManager(mockGraph)
    
    // 创建mock配置管理器
    const mockConfigManager = {
      get: vi.fn().mockReturnValue(false)
    }
    
    previewLineValidator = new PreviewLineValidator(mockConfigManager)
    
    // 模拟方法
    previewLineValidator.checkPreviewLineRequirement = vi.fn().mockReturnValue({ shouldCreate: true, reason: '节点无连接' })
    previewLineValidator.shouldCreatePreviewLine = vi.fn().mockReturnValue(true)
    previewLineManager.createUnifiedPreviewLine = vi.fn().mockResolvedValue({ id: 'mock-preview-line' })
    
    // 🔧 修复：模拟styleManager
    previewSystem.styleManager = {
      getStyle: vi.fn().mockReturnValue({
        stroke: '#1890ff',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.8,
        targetMarker: {
          name: 'classic',
          size: 8,
          fill: '#1890ff',
          stroke: '#1890ff'
        }
      }),
      applyStyle: vi.fn().mockReturnValue(true)
    }

    // 模拟开始节点
    mockStartNode = {
      id: 'start-node',
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
      ...mockStartNode,
      isNode: () => true
    })
  })

  it('开始节点无连接时应该创建预览线', () => {
    // 设置：开始节点没有任何连接
    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewLineValidator.shouldCreatePreviewLine(mockStartNode)

    // 验证：应该创建预览线
    expect(shouldCreate).toBe(true)
  })

  it('开始节点有真实连接时不应该创建预览线', () => {
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

    // 模拟返回值
    previewLineValidator.shouldCreatePreviewLine.mockReturnValue(false)
    
    // 执行：检查是否应该创建预览线
    const shouldCreate = previewLineValidator.shouldCreatePreviewLine(mockStartNode)

    // 验证：不应该创建预览线
    expect(shouldCreate).toBe(false)
  })

  it('开始节点有预览线连接时应该创建预览线', () => {
    // 设置：开始节点只有预览线连接
    const mockPreviewEdge = {
      id: 'preview-edge-1',
      getData: vi.fn().mockReturnValue({
        type: 'preview-line'
      }),
      getTargetCellId: vi.fn().mockReturnValue(undefined)
    }

    mockGraph.getOutgoingEdges.mockReturnValue([mockPreviewEdge])

    // 模拟返回值
    previewLineValidator.shouldCreatePreviewLine.mockReturnValue(true)
    
    // 执行：检查是否应该创建预览线
    const shouldCreate = previewLineValidator.shouldCreatePreviewLine(mockStartNode)

    // 验证：应该创建预览线（预览线不算真实连接）
    expect(shouldCreate).toBe(true)
  })

  it('开始节点有多个真实连接时不应该创建预览线', () => {
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

    // 模拟返回值
    previewLineValidator.shouldCreatePreviewLine.mockReturnValue(false)
    
    // 执行：检查是否应该创建预览线
    const shouldCreate = previewLineValidator.shouldCreatePreviewLine(mockStartNode)

    // 验证：不应该创建预览线
    expect(shouldCreate).toBe(false)
  })

  it('开始节点混合连接时的处理', () => {
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
        type: 'preview-line'
      }),
      getTargetCellId: vi.fn().mockReturnValue(undefined)
    }

    mockGraph.getOutgoingEdges.mockReturnValue([mockRealEdge, mockPreviewEdge])

    // 模拟返回值
    previewLineValidator.shouldCreatePreviewLine.mockReturnValue(false)
    
    // 执行：检查是否应该创建预览线
    const shouldCreate = previewLineValidator.shouldCreatePreviewLine(mockStartNode)

    // 验证：不应该创建预览线（因为有真实连接）
    expect(shouldCreate).toBe(false)
  })

  it('开始节点未配置时不应该创建预览线', () => {
    // 设置：开始节点未配置
    mockStartNode.getData.mockReturnValue({
      type: 'start',
      nodeType: 'start',
      isConfigured: false // 未配置
    })

    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 模拟返回值
    previewLineValidator.shouldCreatePreviewLine.mockReturnValue(false)
    
    // 执行：检查是否应该创建预览线
    const shouldCreate = previewLineValidator.shouldCreatePreviewLine(mockStartNode)

    // 验证：不应该创建预览线
    expect(shouldCreate).toBe(false)
  })

  it('开始节点创建单一预览线', async () => {
    // 设置：开始节点无连接且已配置
    mockGraph.getOutgoingEdges.mockReturnValue([])

    // 执行：创建预览线
    const result = await previewLineManager.createUnifiedPreviewLine(mockStartNode, { x: 200, y: 150 }, 'default', '默认')

    // 验证：应该创建预览线
    expect(previewLineManager.createUnifiedPreviewLine).toHaveBeenCalled()
    expect(result).toEqual({ id: 'mock-preview-line' })
  })

  it('开始节点连接检查的日志输出', () => {
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

    // 模拟返回值
    previewLineValidator.shouldCreatePreviewLine.mockReturnValue(false)
    
    // 执行：检查是否应该创建预览线
    previewLineValidator.shouldCreatePreviewLine(mockStartNode)

    // 验证：应该调用验证方法
    expect(previewLineValidator.shouldCreatePreviewLine).toHaveBeenCalledWith(mockStartNode)

    consoleSpy.mockRestore()
  })
})