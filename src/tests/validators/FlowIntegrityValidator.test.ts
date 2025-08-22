import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Graph, Node, Edge } from '@antv/x6'
import FlowIntegrityValidator from '@/validators/FlowIntegrityValidator'
import type { UnifiedEventBus } from '@/core/UnifiedEventBus'
import type { ErrorHandler } from '@/core/ErrorHandler'

// Mock dependencies
const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn()
} as unknown as UnifiedEventBus

const mockErrorHandler = {
  handleError: vi.fn(),
  getErrorStats: vi.fn(),
  clearErrors: vi.fn()
} as unknown as ErrorHandler

const mockCanvas = {
  getNodes: vi.fn(),
  getEdges: vi.fn(),
  getOutgoingEdges: vi.fn(),
  getIncomingEdges: vi.fn(),
  getCellById: vi.fn()
} as unknown as Graph

describe('FlowIntegrityValidator', () => {
  let validator: FlowIntegrityValidator
  let mockInputNode: Node
  let mockProcessingNode: Node
  let mockOutputNode: Node
  let mockEdge: Edge

  beforeEach(() => {
    vi.clearAllMocks()
    
    validator = new FlowIntegrityValidator({
      canvas: mockCanvas,
      eventBus: mockEventBus,
      errorHandler: mockErrorHandler
    })

    // 创建模拟节点
    mockInputNode = {
      id: 'input-node',
      getData: vi.fn().mockReturnValue({
        type: 'start',
        config: { dataSource: 'database' }
      })
    } as unknown as Node

    mockProcessingNode = {
      id: 'processing-node',
      getData: vi.fn().mockReturnValue({
        type: 'sms',
        config: { processingLogic: 'filter' }
      })
    } as unknown as Node

    mockOutputNode = {
      id: 'output-node',
      getData: vi.fn().mockReturnValue({
        type: 'end',
        config: { outputTarget: 'file' }
      })
    } as unknown as Node

    // 创建模拟边
    mockEdge = {
      id: 'test-edge',
      getSourceCellId: vi.fn().mockReturnValue('input-node'),
      getTargetCellId: vi.fn().mockReturnValue('processing-node')
    } as unknown as Edge
  })

  describe('基础流程校验', () => {
    it('应该通过完整流程的校验', async () => {
      const nodes = [mockInputNode, mockProcessingNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('processing-node')
        },
        {
          ...mockEdge,
          id: 'edge-2',
          getSourceCellId: vi.fn().mockReturnValue('processing-node'),
          getTargetCellId: vi.fn().mockReturnValue('output-node')
        }
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        if (nodeId === 'processing-node') return [edges[1]]
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'processing-node') return [edges[0]]
        if (nodeId === 'output-node') return [edges[1]]
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测空流程', async () => {
      vi.mocked(mockCanvas.getNodes).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const result = await validator.validate({
        nodes: [],
        edges: []
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'EMPTY_FLOW',
            severity: 'error'
          })
        ])
      )
    })

    it('应该检测只有节点没有连接的情况', async () => {
      const nodes = [mockInputNode]
      const edges = [] as Edge[]
      
      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getIncomingEdges).mockReturnValue([])

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ISOLATED_INPUT_NODE',
            severity: 'warning'
          })
        ])
      )
    })
  })

  describe('起始节点校验', () => {
    it('应该检测缺少起始节点', async () => {
      const nodes = [mockProcessingNode, mockOutputNode]
      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue([mockEdge])
      vi.mocked(mockCanvas.getIncomingEdges).mockReturnValue([])

      const result = await validator.validate({
        nodes: [mockProcessingNode, mockOutputNode],
        edges: [mockEdge]
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'NO_INPUT_NODES',
            severity: 'error'
          })
        ])
      )
    })

    it('应该检测多个起始节点', async () => {
      const inputNode2 = {
        ...mockInputNode,
        id: 'input-node-2'
      } as Node

      const nodes = [mockInputNode, inputNode2, mockProcessingNode]
      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue([mockEdge])
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'processing-node') return [mockEdge]
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: [mockEdge]
      })

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ISOLATED_INPUT_NODE',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该识别有效的起始节点', async () => {
      const nodes = [mockInputNode, mockProcessingNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('processing-node')
        },
        {
          ...mockEdge,
          id: 'edge-2',
          getSourceCellId: vi.fn().mockReturnValue('processing-node'),
          getTargetCellId: vi.fn().mockReturnValue('output-node')
        }
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'processing-node') return [edges[0]]
        if (nodeId === 'output-node') return [edges[1]]
        return []
      })
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        if (nodeId === 'processing-node') return [edges[1]]
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.isValid).toBe(true)
    })
  })

  describe('结束节点校验', () => {
    it('应该检测缺少结束节点', async () => {
      const nodes = [mockInputNode, mockProcessingNode]
      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue([mockEdge])
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [mockEdge]
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'processing-node') return [mockEdge]
        return []
      })

      const result = await validator.validate({
        nodes: [mockInputNode, mockProcessingNode],
        edges: [mockEdge]
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'NO_OUTPUT_NODES',
            severity: 'error'
          })
        ])
      )
    })

    it('应该检测多个结束节点', async () => {
      const outputNode2 = {
        ...mockOutputNode,
        id: 'output-node-2'
      } as Node

      const nodes = [mockInputNode, mockOutputNode, outputNode2]
      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue([mockEdge])
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [mockEdge]
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'output-node') return [mockEdge]
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: [mockEdge]
      })

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ISOLATED_OUTPUT_NODE',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该识别有效的结束节点', async () => {
      const nodes = [mockInputNode, mockOutputNode]
      const edges = [{
        ...mockEdge,
        getSourceCellId: vi.fn().mockReturnValue('input-node'),
        getTargetCellId: vi.fn().mockReturnValue('output-node')
      }] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return edges
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'output-node') return edges
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.isValid).toBe(true)
    })
  })

  describe('连通性校验', () => {
    it('应该检测断开的流程', async () => {
      const isolatedNode = {
        id: 'isolated-node',
        getData: vi.fn().mockReturnValue({
          nodeType: 'sms' // 营销画布处理节点类型
        })
      } as unknown as Node

      const nodes = [mockInputNode, mockOutputNode, isolatedNode]
      const edges = [{
        ...mockEdge,
        getSourceCellId: vi.fn().mockReturnValue('input-node'),
        getTargetCellId: vi.fn().mockReturnValue('output-node')
      }] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return edges
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'output-node') return edges
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'MULTIPLE_COMPONENTS',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该检测孤立节点', async () => {
      const isolatedNode = {
        id: 'isolated-node',
        getData: vi.fn().mockReturnValue({
          nodeType: 'sms' // 营销画布处理节点类型
        })
      } as unknown as Node

      const nodes = [mockInputNode, mockOutputNode, isolatedNode]
      const edges = [{
        ...mockEdge,
        getSourceCellId: vi.fn().mockReturnValue('input-node'),
        getTargetCellId: vi.fn().mockReturnValue('output-node')
      }] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return edges
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'output-node') return edges
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ISOLATED_NODE',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该验证完全连通的流程', async () => {
      const nodes = [mockInputNode, mockProcessingNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('processing-node')
        },
        {
          ...mockEdge,
          id: 'edge-2',
          getSourceCellId: vi.fn().mockReturnValue('processing-node'),
          getTargetCellId: vi.fn().mockReturnValue('output-node')
        }
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        if (nodeId === 'processing-node') return [edges[1]]
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'processing-node') return [edges[0]]
        if (nodeId === 'output-node') return [edges[1]]
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.isValid).toBe(true)
      expect(result.warnings.filter(w => w.type === 'MULTIPLE_COMPONENTS')).toHaveLength(0)
    })
  })

  describe('数据流校验', () => {
    it('应该检测数据流中断', async () => {
      const brokenNode = {
        id: 'broken-node',
        getData: vi.fn().mockReturnValue({
          nodeType: 'sms', // 营销画布处理节点类型
          config: {} // 缺少处理逻辑
        })
      } as unknown as Node

      const nodes = [mockInputNode, brokenNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('broken-node')
        }
        // 移除broken-node的输出连接，使其成为没有输出连接的节点
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        // broken-node没有输出连接
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'broken-node') return [edges[0]]
        // output-node没有输入连接
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'NO_OUTPUT_CONNECTION',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该验证完整的数据流', async () => {
      const nodes = [mockInputNode, mockProcessingNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('processing-node')
        },
        {
          ...mockEdge,
          id: 'edge-2',
          getSourceCellId: vi.fn().mockReturnValue('processing-node'),
          getTargetCellId: vi.fn().mockReturnValue('output-node')
        }
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        if (nodeId === 'processing-node') return [edges[1]]
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'processing-node') return [edges[0]]
        if (nodeId === 'output-node') return [edges[1]]
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.warnings.filter(w => w.type === 'NO_OUTPUT_CONNECTION')).toHaveLength(0)
    })
  })

  describe('分支完整性校验', () => {
    it('应该检测未完成的分支', async () => {
      const branchNode = {
        id: 'branch-node',
        getData: vi.fn().mockReturnValue({
          nodeType: 'audience-split', // 营销画布分支节点类型
          config: { branchConditions: ['condition1', 'condition2'] }
        })
      } as unknown as Node

      const nodes = [mockInputNode, branchNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('branch-node')
        }
        // 缺少分支的输出连接
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'branch-node') return [edges[0]]
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'NO_OUTPUT_CONNECTION',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该验证完整的分支结构', async () => {
      const branchNode = {
        id: 'branch-node',
        getData: vi.fn().mockReturnValue({
          nodeType: 'audience-split', // 营销画布分支节点类型
          config: { branchConditions: ['condition1'] }
        })
      } as unknown as Node

      const nodes = [mockInputNode, branchNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('branch-node')
        },
        {
          ...mockEdge,
          id: 'edge-2',
          getSourceCellId: vi.fn().mockReturnValue('branch-node'),
          getTargetCellId: vi.fn().mockReturnValue('output-node')
        }
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        if (nodeId === 'branch-node') return [edges[1]]
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'branch-node') return [edges[0]]
        if (nodeId === 'output-node') return [edges[1]]
        return []
      })

      const result = await validator.validate({
        nodes: nodes,
        edges: edges
      })

      expect(result.warnings.filter(w => w.type === 'INCOMPLETE_BRANCHES')).toHaveLength(0)
    })
  })

  describe('工具方法', () => {
    it('应该正确查找可达节点', () => {
      const nodes = [mockInputNode, mockProcessingNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('processing-node')
        },
        {
          ...mockEdge,
          id: 'edge-2',
          getSourceCellId: vi.fn().mockReturnValue('processing-node'),
          getTargetCellId: vi.fn().mockReturnValue('output-node')
        }
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        if (nodeId === 'processing-node') return [edges[1]]
        return []
      })

      const stats = validator.getFlowStatistics(nodes, edges)

      expect(stats.totalNodes).toBe(3)
      expect(stats.totalEdges).toBe(2)
    })

    it('应该正确计算流程统计信息', () => {
      const nodes = [mockInputNode, mockProcessingNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('processing-node')
        },
        {
          ...mockEdge,
          id: 'edge-2',
          getSourceCellId: vi.fn().mockReturnValue('processing-node'),
          getTargetCellId: vi.fn().mockReturnValue('output-node')
        }
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        if (nodeId === 'processing-node') return [edges[1]]
        return []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'processing-node') return [edges[0]]
        if (nodeId === 'output-node') return [edges[1]]
        return []
      })

      const stats = validator.getFlowStatistics(nodes, edges)

      expect(stats.totalNodes).toBe(3)
      expect(stats.totalEdges).toBe(2)
      expect(stats.inputNodes).toBe(0) // 使用营销画布节点类型，没有INPUT类型
      expect(stats.outputNodes).toBe(0) // 使用营销画布节点类型，没有OUTPUT类型
      expect(stats.maxDepth).toBe(0) // 没有输入节点时深度为0
    })

    it('应该正确识别强连通分量', () => {
      const nodes = [mockInputNode, mockProcessingNode, mockOutputNode]
      const edges = [
        {
          ...mockEdge,
          id: 'edge-1',
          getSourceCellId: vi.fn().mockReturnValue('input-node'),
          getTargetCellId: vi.fn().mockReturnValue('processing-node')
        },
        {
          ...mockEdge,
          id: 'edge-2',
          getSourceCellId: vi.fn().mockReturnValue('processing-node'),
          getTargetCellId: vi.fn().mockReturnValue('output-node')
        }
      ] as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(nodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(edges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        if (nodeId === 'input-node') return [edges[0]]
        if (nodeId === 'processing-node') return [edges[1]]
        return []
      })

      const stats = validator.getFlowStatistics(nodes, edges)

      expect(stats.totalNodes).toBe(3) // 验证节点统计
      expect(stats.isolatedNodes).toBe(0) // 验证没有孤立节点
    })
  })

  describe('异常处理', () => {
    it('应该处理校验过程中的异常', async () => {
      vi.mocked(mockCanvas.getNodes).mockImplementation(() => {
        throw new Error('测试异常')
      })

      const result = await validator.validate({
        nodes: [],
        edges: []
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'EMPTY_FLOW',
            severity: 'error'
          })
        ])
      )
    })

    it('应该处理无效节点数据', async () => {
      const invalidNode = {
        id: 'invalid-node',
        getData: vi.fn().mockReturnValue(null)
      } as unknown as Node

      vi.mocked(mockCanvas.getNodes).mockReturnValue([invalidNode])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getIncomingEdges).mockReturnValue([])

      const result = await validator.validate({
        nodes: [invalidNode],
        edges: []
      })

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ISOLATED_NODE',
            severity: 'warning'
          })
        ])
      )
    })
  })

  describe('性能测试', () => {
    it('应该在大型流程中保持良好性能', async () => {
      // 创建大量节点和连接
      const largeNodes = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        getData: vi.fn().mockReturnValue({
          type: i === 0 ? 'start' : i === 99 ? 'end' : 'sms'
        })
      })) as Node[]

      const largeEdges = Array.from({ length: 99 }, (_, i) => ({
        id: `edge-${i}`,
        getSourceCellId: vi.fn().mockReturnValue(`node-${i}`),
        getTargetCellId: vi.fn().mockReturnValue(`node-${i + 1}`)
      })) as Edge[]

      vi.mocked(mockCanvas.getNodes).mockReturnValue(largeNodes)
      vi.mocked(mockCanvas.getEdges).mockReturnValue(largeEdges)
      vi.mocked(mockCanvas.getOutgoingEdges).mockImplementation((nodeId) => {
        const nodeIndex = parseInt(nodeId.split('-')[1])
        return nodeIndex < 99 ? [largeEdges[nodeIndex]] : []
      })
      vi.mocked(mockCanvas.getIncomingEdges).mockImplementation((nodeId) => {
        const nodeIndex = parseInt(nodeId.split('-')[1])
        return nodeIndex > 0 ? [largeEdges[nodeIndex - 1]] : []
      })

      const startTime = Date.now()
      const result = await validator.validate({
        nodes: largeNodes,
        edges: largeEdges
      })
      const endTime = Date.now()

      // 添加调试信息
      if (!result.isValid) {
        console.log('Validation failed with errors:', result.errors)
        console.log('Validation warnings:', result.warnings)
      }

      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
      expect(result.isValid).toBe(true)
    })
  })
})