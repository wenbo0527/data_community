import { describe, it, expect, beforeEach, vi } from 'vitest'
import ValidationManager from '@/managers/publish/ValidationManager'
import NodeConfigValidator from '@/validators/NodeConfigValidator'
import ConnectionValidator from '@/validators/ConnectionValidator'
import FlowIntegrityValidator from '@/validators/FlowIntegrityValidator'

describe('ValidationManager', () => {
  let validationManager: ValidationManager
  let mockCanvas: any
  let mockEventBus: any
  let mockCacheManager: any
  let mockErrorHandler: any

  beforeEach(() => {
    mockCanvas = {
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getCellById: vi.fn(),
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => [])
    }

    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    }

    mockErrorHandler = {
      handleError: vi.fn(),
      register: vi.fn()
    }

    validationManager = new ValidationManager({
      canvas: mockCanvas,
      eventBus: mockEventBus,
      cacheManager: mockCacheManager,
      errorHandler: mockErrorHandler
    })
  })

  describe('初始化', () => {
    it('应该正确初始化校验管理器', () => {
      expect(validationManager).toBeDefined()
      expect(validationManager.validators).toBeDefined()
      expect(validationManager.validators.nodeConfig).toBeInstanceOf(NodeConfigValidator)
      expect(validationManager.validators.connection).toBeInstanceOf(ConnectionValidator)
      expect(validationManager.validators.flowIntegrity).toBeInstanceOf(FlowIntegrityValidator)
    })

    it('应该设置正确的默认配置', () => {
      expect(validationManager.validationResults).toBeInstanceOf(Map)
      expect(validationManager.validationResults.size).toBe(0)
    })
  })

  describe('完整校验', () => {
    it('应该执行所有校验器并返回综合结果', async () => {
      const mockNode = {
        id: 'node-1',
        getData: () => ({ nodeType: 'INPUT_NODE', dataSource: { type: 'database' } })
      }
      mockCanvas.getNodes.mockReturnValue([mockNode])
      mockCanvas.getEdges.mockReturnValue([])

      const result = await validationManager.validateAll()

      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
      expect(result).toHaveProperty('nodeValidations')
      expect(result).toHaveProperty('connectionValidations')
      expect(result).toHaveProperty('flowValidations')
      expect(result.nodeValidations).toBeInstanceOf(Map)
    })

    it('当存在校验错误时应该返回isValid为false', async () => {
      const mockNode = {
        id: 'node-1',
        getData: () => ({ nodeType: 'INPUT_NODE' }) // 缺少必填字段
      }
      mockCanvas.getNodes.mockReturnValue([mockNode])

      const result = await validationManager.validateAll()

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('当所有校验通过时应该返回isValid为true', async () => {
      const mockInputNode = {
        id: 'input-node-1',
        getData: () => ({
          nodeType: 'INPUT_NODE',
          dataSource: { type: 'database', connectionString: 'valid-connection' },
          outputSchema: { fields: ['id', 'name'] }
        })
      }
      const mockOutputNode = {
        id: 'output-node-1',
        getData: () => ({
          nodeType: 'OUTPUT_NODE',
          outputTarget: { type: 'file', format: 'json', destination: 'output.json' }
        })
      }
      const mockEdge = {
        id: 'edge-1',
        getSourceCellId: () => 'input-node-1',
        getTargetCellId: () => 'output-node-1',
        getSourcePortId: () => 'output',
        getTargetPortId: () => 'input',
        getData: () => ({ type: 'NORMAL_CONNECTION' })
      }
      
      mockCanvas.getNodes.mockReturnValue([mockInputNode, mockOutputNode])
      mockCanvas.getEdges.mockReturnValue([mockEdge])
      mockCanvas.getCellById.mockImplementation((id) => {
        if (id === 'input-node-1') return mockInputNode
        if (id === 'output-node-1') return mockOutputNode
        return null
      })

      // 执行完整校验
      const result = await validationManager.validateAll()
      
      // 调试输出
      console.log('ValidationManager test result:', {
        isValid: result.isValid,
        errorsCount: result.errors.length,
        errors: result.errors,
        warningsCount: result.warnings.length,
        warnings: result.warnings
      })
      
      // 验证结果
      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('节点校验', () => {
    it('应该校验所有节点并返回详细结果', async () => {
      const mockNodes = [
        {
          id: 'node-1',
          getData: () => ({ nodeType: 'INPUT_NODE', dataSource: { type: 'database' } })
        },
        {
          id: 'node-2',
          getData: () => ({ nodeType: 'PROCESSING_NODE', processingLogic: { code: 'def process(): return data' } })
        }
      ]
      mockCanvas.getNodes.mockReturnValue(mockNodes)

      const result = await validationManager.validateAllNodes()

      expect(result.validations).toBeInstanceOf(Map)
      expect(result.validations.size).toBe(2)
      expect(result.validations.has('node-1')).toBe(true)
      expect(result.validations.has('node-2')).toBe(true)
    })

    it('应该收集所有节点的错误和警告', async () => {
      const mockNode = {
        id: 'node-1',
        getData: () => ({ nodeType: 'INPUT_NODE' }) // 缺少必填字段
      }
      mockCanvas.getNodes.mockReturnValue([mockNode])

      const result = await validationManager.validateAllNodes()

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toHaveProperty('field')
      expect(result.errors[0]).toHaveProperty('message')
      expect(result.errors[0]).toHaveProperty('severity')
    })
  })

  describe('连接校验', () => {
    it('应该校验所有连接的有效性', async () => {
      const mockEdge = {
        id: 'edge-1',
        getSourceCellId: () => 'node-1',
        getTargetCellId: () => 'node-2',
        getData: () => ({ type: 'NORMAL_CONNECTION' })
      }
      mockCanvas.getEdges.mockReturnValue([mockEdge])

      const result = await validationManager.validateConnections()

      expect(result.validations).toBeInstanceOf(Array)
      expect(result.validations.length).toBe(1)
      expect(result.validations[0]).toHaveProperty('edgeId', 'edge-1')
    })

    it('应该检测无效连接并报告错误', async () => {
      const mockEdge = {
        id: 'edge-1',
        getSourceCellId: () => 'non-existent-node',
        getTargetCellId: () => 'node-2',
        getData: () => ({ type: 'NORMAL_CONNECTION' })
      }
      mockCanvas.getEdges.mockReturnValue([mockEdge])
      mockCanvas.getCellById.mockReturnValue(null) // 模拟节点不存在

      const result = await validationManager.validateConnections()

      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('流程完整性校验', () => {
    it('应该检查流程的完整性', async () => {
      const mockNodes = [
        { id: 'node-1', getData: () => ({ nodeType: 'INPUT_NODE' }) },
        { id: 'node-2', getData: () => ({ nodeType: 'OUTPUT_NODE' }) }
      ]
      const mockEdges = [
        {
          id: 'edge-1',
          getSourceCellId: () => 'node-1',
          getTargetCellId: () => 'node-2'
        }
      ]
      mockCanvas.getNodes.mockReturnValue(mockNodes)
      mockCanvas.getEdges.mockReturnValue(mockEdges)

      const result = await validationManager.validateFlowIntegrity()

      expect(result.validations).toBeInstanceOf(Array)
      expect(result.validations.length).toBeGreaterThan(0)
    })

    it('应该检测孤立节点', async () => {
      const mockNodes = [
        { id: 'node-1', getData: () => ({ nodeType: 'INPUT_NODE' }) },
        { id: 'node-2', getData: () => ({ nodeType: 'PROCESSING_NODE' }) } // 孤立节点
      ]
      mockCanvas.getNodes.mockReturnValue(mockNodes)
      mockCanvas.getEdges.mockReturnValue([])
      mockCanvas.getIncomingEdges.mockReturnValue([])
      mockCanvas.getOutgoingEdges.mockReturnValue([])

      const result = await validationManager.validateFlowIntegrity()

      expect(result.warnings.some(w => w.message.includes('孤立节点'))).toBe(true)
    })
  })

  describe('缓存管理', () => {
    it('应该缓存校验结果', async () => {
      const mockNode = {
        id: 'node-1',
        getData: () => ({ nodeType: 'INPUT_NODE', dataSource: { type: 'database' } })
      }
      mockCanvas.getNodes.mockReturnValue([mockNode])

      await validationManager.validateAll()

      expect(validationManager.validationResults.has('latest')).toBe(true)
    })

    it('应该能够获取缓存的校验结果', () => {
      const mockResult = { isValid: true, errors: [] }
      validationManager.validationResults.set('test', mockResult)

      const result = validationManager.getValidationResult('test')

      expect(result).toEqual(mockResult)
    })
  })

  describe('错误处理', () => {
    it('应该处理校验过程中的异常', async () => {
      mockCanvas.getNodes.mockImplementation(() => {
        throw new Error('Canvas error')
      })

      const result = await validationManager.validateAll()

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.type === 'VALIDATION_ERROR')).toBe(true)
      expect(mockErrorHandler.handleError).toHaveBeenCalled()
    })

    it('应该发出校验完成事件', async () => {
      const mockNode = {
        id: 'node-1',
        getData: () => ({ nodeType: 'INPUT_NODE' })
      }
      mockCanvas.getNodes.mockReturnValue([mockNode])

      await validationManager.validateAll()

      expect(mockEventBus.emit).toHaveBeenCalledWith('validation:completed', expect.any(Object))
    })
  })

  describe('增量校验', () => {
    it('应该支持单个节点的增量校验', async () => {
      const mockNode = {
        id: 'node-1',
        getData: () => ({ nodeType: 'INPUT_NODE', dataSource: { type: 'database' } })
      }
      mockCanvas.getCellById.mockReturnValue(mockNode)

      const result = await validationManager.validateNode('node-1')

      expect(result).toHaveProperty('nodeId', 'node-1')
      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
    })

    it('应该在节点不存在时返回错误', async () => {
      mockCanvas.getCellById.mockReturnValue(null)

      const result = await validationManager.validateNode('non-existent')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})