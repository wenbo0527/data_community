import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Graph, Node, Edge } from '@antv/x6'
import ConnectionValidator from '@/validators/ConnectionValidator'
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
  getOutgoingEdges: vi.fn(),
  getEdges: vi.fn(),
  getNodes: vi.fn(),
  getCellById: vi.fn()
} as unknown as Graph

describe('ConnectionValidator', () => {
  let validator: ConnectionValidator
  let mockSourceNode: Node
  let mockTargetNode: Node
  let mockEdge: Edge

  beforeEach(() => {
    vi.clearAllMocks()
    
    validator = new ConnectionValidator({
      canvas: mockCanvas,
      eventBus: mockEventBus,
      errorHandler: mockErrorHandler
    })

    // 创建模拟节点
    mockSourceNode = {
      id: 'source-node',
      getData: vi.fn().mockReturnValue({
        nodeType: 'INPUT_NODE',
        outputSchema: {
          fields: ['id', 'name', 'value'],
          types: { id: 'string', name: 'string', value: 'number' }
        }
      })
    } as unknown as Node

    mockTargetNode = {
      id: 'target-node',
      getData: vi.fn().mockReturnValue({
        nodeType: 'PROCESSING_NODE',
        inputSchema: {
          fields: ['id', 'name'],
          types: { id: 'string', name: 'string' }
        }
      })
    } as unknown as Node

    // 创建模拟边
    mockEdge = {
      id: 'test-edge',
      getSourceCellId: vi.fn().mockReturnValue('source-node'),
      getTargetCellId: vi.fn().mockReturnValue('target-node'),
      getSourcePortId: vi.fn().mockReturnValue('out-port'),
      getTargetPortId: vi.fn().mockReturnValue('in-port')
    } as unknown as Edge
  })

  describe('基础连接校验', () => {
    it('应该通过有效连接的校验', async () => {
      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const result = await validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝无效的边对象', async () => {
      const invalidEdge = {
        id: '',
        getSourceCellId: vi.fn().mockReturnValue(''),
        getTargetCellId: vi.fn().mockReturnValue('')
      } as unknown as Edge

      const context = {
        edge: invalidEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'CONNECTION_VALIDATION_EXCEPTION',
            severity: 'error'
          })
        ])
      )
    })

    it('应该拒绝缺少源节点的连接', async () => {
      vi.mocked(mockEdge.getSourceCellId).mockReturnValue('')

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'MISSING_SOURCE_NODE',
            severity: 'error'
          })
        ])
      )
    })

    it('应该拒绝缺少目标节点的连接', async () => {
      vi.mocked(mockEdge.getTargetCellId).mockReturnValue('')

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'MISSING_TARGET_NODE',
            severity: 'error'
          })
        ])
      )
    })

    it('应该拒绝自连接', async () => {
      vi.mocked(mockEdge.getSourceCellId).mockReturnValue('same-node')
      vi.mocked(mockEdge.getTargetCellId).mockReturnValue('same-node')

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'SELF_CONNECTION',
            severity: 'error'
          })
        ])
      )
    })
  })

  describe('节点存在性校验', () => {
    it('应该检测源节点不存在', async () => {
      const context = {
        edge: mockEdge,
        sourceNode: null,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'SOURCE_NODE_NOT_FOUND',
            severity: 'error'
          })
        ])
      )
    })

    it('应该检测目标节点不存在', async () => {
      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: null
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'TARGET_NODE_NOT_FOUND',
            severity: 'error'
          })
        ])
      )
    })
  })

  describe('连接类型校验', () => {
    it('应该允许INPUT_NODE连接到PROCESSING_NODE', async () => {
      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const result = await validator.validate(context)

      expect(result.isValid).toBe(true)
    })

    it('应该拒绝OUTPUT_NODE连接到其他节点', async () => {
      vi.mocked(mockSourceNode.getData).mockReturnValue({
        nodeType: 'OUTPUT_NODE'
      })

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'INVALID_CONNECTION_TYPE',
            severity: 'error'
          })
        ])
      )
    })

    it('应该拒绝连接到不接受该类型输入的节点', async () => {
      vi.mocked(mockTargetNode.getData).mockReturnValue({
        nodeType: 'INPUT_NODE' // INPUT_NODE不应该接收来自其他节点的连接
      })

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'INVALID_CONNECTION_DIRECTION',
            severity: 'error'
          })
        ])
      )
    })

    it('应该处理未知节点类型', async () => {
      vi.mocked(mockSourceNode.getData).mockReturnValue({
        nodeType: 'UNKNOWN_TYPE'
      })

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'UNKNOWN_SOURCE_NODE_TYPE',
            severity: 'warning'
          })
        ])
      )
    })
  })

  describe('循环依赖校验', () => {
    it('应该检测简单循环依赖', async () => {
      // 模拟现有连接：target -> source（形成循环）
      const existingEdge = {
        getTargetCellId: vi.fn().mockReturnValue('source-node')
      } as unknown as Edge

      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([existingEdge])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'CYCLIC_DEPENDENCY',
            severity: 'error'
          })
        ])
      )
    })

    it('应该允许非循环连接', async () => {
      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(true)
    })
  })

  describe('重复连接校验', () => {
    it('应该检测重复连接', async () => {
      const duplicateEdge = {
        id: 'duplicate-edge',
        getSourceCellId: vi.fn().mockReturnValue('source-node'),
        getTargetCellId: vi.fn().mockReturnValue('target-node')
      } as unknown as Edge

      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([duplicateEdge])

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'DUPLICATE_CONNECTION',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该忽略同一条边', async () => {
      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([mockEdge])

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.warnings.filter(w => w.type === 'DUPLICATE_CONNECTION')).toHaveLength(0)
    })
  })

  describe('端口方向校验', () => {
    it('应该要求源端口为输出端口', async () => {
      vi.mocked(mockEdge.getSourcePortId).mockReturnValue('in-port')

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'INVALID_SOURCE_PORT',
            severity: 'error'
          })
        ])
      )
    })

    it('应该要求目标端口为输入端口', async () => {
      vi.mocked(mockEdge.getTargetPortId).mockReturnValue('out-port')

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'INVALID_TARGET_PORT',
            severity: 'error'
          })
        ])
      )
    })

    it('应该接受正确的端口方向', async () => {
      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(true)
    })
  })

  describe('数据兼容性校验', () => {
    it('应该检测缺失的必需字段', async () => {
      vi.mocked(mockTargetNode.getData).mockReturnValue({
        nodeType: 'PROCESSING_NODE',
        inputSchema: {
          fields: ['id', 'name', 'email'], // email字段在源节点中不存在
          types: { id: 'string', name: 'string', email: 'string' }
        }
      })

      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'SCHEMA_MISMATCH',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该检测类型不匹配', async () => {
      vi.mocked(mockTargetNode.getData).mockReturnValue({
        nodeType: 'PROCESSING_NODE',
        inputSchema: {
          fields: ['id', 'name'],
          types: { id: 'number', name: 'string' } // id类型不匹配
        }
      })

      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'TYPE_MISMATCH',
            severity: 'warning'
          })
        ])
      )
    })

    it('应该处理缺少模式信息的情况', async () => {
      vi.mocked(mockSourceNode.getData).mockReturnValue({
        nodeType: 'INPUT_NODE'
        // 没有outputSchema
      })

      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'MISSING_SCHEMA_INFO',
            severity: 'warning'
          })
        ])
      )
    })
  })

  describe('批量校验', () => {
    it('应该批量校验多个连接', async () => {
      const contexts = [
        {
          edge: mockEdge,
          sourceNode: mockSourceNode,
          targetNode: mockTargetNode
        },
        {
          edge: {
            ...mockEdge,
            id: 'edge-2'
          } as Edge,
          sourceNode: mockSourceNode,
          targetNode: mockTargetNode
        }
      ]

      vi.mocked(mockCanvas.getOutgoingEdges).mockReturnValue([])
      vi.mocked(mockCanvas.getEdges).mockReturnValue([])

      const results = await validator.validateMultiple(contexts)

      expect(results).toHaveLength(2)
      expect(results.every(r => r.isValid)).toBe(true)
    })

    it('应该处理批量校验中的异常', async () => {
      const invalidContext = {
        edge: null as any,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const results = await validator.validateMultiple([invalidContext])

      expect(results).toHaveLength(1)
      expect(results[0].isValid).toBe(false)
      expect(results[0].errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'BATCH_VALIDATION_ERROR',
            severity: 'error'
          })
        ])
      )
    })
  })

  describe('工具方法', () => {
    it('应该返回允许的连接类型', () => {
      const allowedConnections = validator.getAllowedConnections()
      
      expect(allowedConnections).toHaveProperty('INPUT_NODE')
      expect(allowedConnections).toHaveProperty('OUTPUT_NODE')
      expect(allowedConnections.INPUT_NODE.canConnectTo).toContain('PROCESSING_NODE')
    })

    it('应该检查节点类型是否可以连接', () => {
      expect(validator.canConnect('INPUT_NODE', 'PROCESSING_NODE')).toBe(true)
      expect(validator.canConnect('OUTPUT_NODE', 'PROCESSING_NODE')).toBe(false)
      expect(validator.canConnect('UNKNOWN_TYPE', 'PROCESSING_NODE')).toBe(false)
    })
  })

  describe('异常处理', () => {
    it('应该处理校验过程中的异常', async () => {
      vi.mocked(mockEdge.getSourceCellId).mockImplementation(() => {
        throw new Error('测试异常')
      })

      const context = {
        edge: mockEdge,
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode
      }

      const result = await validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'CONNECTION_VALIDATION_EXCEPTION',
            severity: 'error'
          })
        ])
      )
      expect(mockErrorHandler.handleError).toHaveBeenCalled()
    })
  })
})