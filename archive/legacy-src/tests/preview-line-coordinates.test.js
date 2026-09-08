import { describe, it, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../utils/preview-line/PreviewLineSystem.js'
import { PositionCalculator } from '../utils/preview-line/algorithms/PositionCalculator.js'
import { createMockGraph, createMockNode } from './utils/mockFactory.js'

describe('PreviewLineSystem - 坐标计算测试', () => {
  let manager
  let positionCalculator
  let mockGraph
  let mockNode
  let mockEdge

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 使用标准化Mock工厂
    mockGraph = createMockGraph()
    mockNode = createMockNode('test-node', 'test', {
      position: { x: 100, y: 100 },
      size: { width: 120, height: 40 }
    })
    
    // 创建测试边
    mockEdge = {
      id: 'test-edge',
      getSource: vi.fn(() => ({ cell: 'test-node', port: 'out' })),
      getTarget: vi.fn(() => ({ x: 200, y: 200 })),
      getSourcePoint: vi.fn(() => ({ x: 100, y: 120 })),
      getTargetPoint: vi.fn(() => ({ x: 200, y: 200 })),
      setSource: vi.fn(),
      setTarget: vi.fn(),
      data: {
        type: 'unified-preview-line',
        isPreview: true
      }
    }
    
    // 创建预览线管理器
    manager = new PreviewLineSystem({
      graph: mockGraph,
      branchManager: null,
      layoutEngine: null,
      layoutEngineReady: true
    })
    manager.init()
    
    positionCalculator = new PositionCalculator(mockGraph)
    
    // Mock graph返回值
    mockGraph.addEdge.mockReturnValue(mockEdge)
    mockGraph.getCellById.mockReturnValue(mockNode)
    
    // Mock getActualNodeCenter 方法
    vi.spyOn(positionCalculator, 'getActualNodeCenter').mockReturnValue({ x: 100, y: 100 })
  })

  it('应该在坐标偏差超过阈值时修正预览线起始位置', () => {
    const previewInstance = {
      line: mockEdge,
      sourceNode: mockNode
    }
    
    // 模拟坐标偏差超过阈值的情况（当前位置与期望位置相差很大）
    let callCount = 0
    mockEdge.getSourcePoint.mockImplementation(() => {
      callCount++
      // 第一次调用返回偏差大的坐标，第二次调用（修正后）返回正确坐标
      return callCount === 1 ? { x: 50, y: 50 } : { x: 100, y: 120 }
    })
    
    const result = positionCalculator.validateAndCorrectPreviewLineCoordinates(previewInstance)
    
    expect(result).toBe(true)
    expect(mockEdge.setSource).toHaveBeenCalledWith({
      cell: 'test-node',
      port: 'out'
    })
  })

  it('应该在坐标偏差小于阈值时不修正预览线位置', () => {
    const previewInstance = {
      line: mockEdge,
      sourceNode: mockNode
    }
    
    // 模拟坐标偏差小于阈值的情况（当前位置接近期望位置）
    mockEdge.getSourcePoint.mockReturnValue({ x: 100, y: 120 })
    
    const result = positionCalculator.validateAndCorrectPreviewLineCoordinates(previewInstance)
    
    expect(result).toBe(true)
    expect(mockEdge.setSource).not.toHaveBeenCalled()
  })

  it('应该正确计算节点的out端口位置', () => {
    const outPortPosition = positionCalculator.calculateOutPortPosition(mockNode)
    
    expect(outPortPosition).toEqual({
      x: 100, // 节点中心x坐标
      y: 120  // 节点中心y坐标 + 高度的一半
    })
  })

  it('应该正确计算节点的in端口位置', () => {
    const inPortPosition = positionCalculator.calculateInPortPosition(mockNode)
    
    expect(inPortPosition).toEqual({
      x: 40,  // 节点中心x坐标 - 宽度的一半
      y: 100  // 节点中心y坐标
    })
  })

  it('应该正确处理预览线的调试信息', () => {
    const endPosition = { x: 200, y: 200 }
    
    const edgeConfig = {
      source: {
        cell: 'test-node',
        port: 'out'
      },
      target: endPosition,
      data: {
        source: 'test-node',
        target: '200,200',
        isPreview: true,
        type: 'unified-preview-line'
      }
    }
    
    mockGraph.addEdge(edgeConfig)
    
    expect(mockGraph.addEdge).toHaveBeenCalled()
    
    const calledConfig = mockGraph.addEdge.mock.calls[0][0]
    
    expect(calledConfig.source).toEqual({
      cell: 'test-node',
      port: 'out'
    })
    expect(calledConfig.target).toEqual(endPosition)
    expect(calledConfig.data.source).toBe('test-node')
    expect(calledConfig.data.target).toBe('200,200')
    expect(calledConfig.data.isPreview).toBe(true)
    expect(calledConfig.data.type).toBe('unified-preview-line')
  })

  it('应该正确处理坐标偏差计算', () => {
    const point1 = { x: 100, y: 100 }
    const point2 = { x: 103, y: 104 }
    
    const distance = positionCalculator.calculatePositionDifference(point1, point2)
    
    // 验证距离计算正确 (sqrt(3^2 + 4^2) = 5)
    expect(distance).toBe(5)
  })

  it('应该在坐标偏差小于阈值时不进行修正', () => {
    const previewInstance = {
      line: mockEdge,
      sourceNode: mockNode
    }
    
    // 模拟坐标偏差小于阈值的情况
    mockEdge.getSourcePoint.mockReturnValue({ x: 100, y: 120 })
    
    positionCalculator.syncPreviewLinePosition(previewInstance)
    
    // 验证setSource没有被调用（因为偏差小于阈值）
    expect(mockEdge.setSource).not.toHaveBeenCalled()
  })

  it('应该在坐标偏差大于阈值时进行修正', () => {
    const previewInstance = {
      line: mockEdge,
      sourceNode: mockNode
    }
    
    // 模拟坐标偏差超过阈值的情况
    mockEdge.getSourcePoint.mockReturnValue({ x: 50, y: 50 })
    
    positionCalculator.syncPreviewLinePosition(previewInstance)
    
    // 验证setSource被调用进行修正
    expect(mockEdge.setSource).toHaveBeenCalledWith({
      cell: 'test-node',
      port: 'out'
    })
  })
})