import type { Graph, Edge, Node } from '@antv/x6'
import type { UnifiedEventBus } from '@/core/UnifiedEventBus'
import type { UnifiedCacheManager } from '@/core/UnifiedCacheManager'
import type { ErrorHandler } from '@/core/ErrorHandler'
import NodeConfigValidator from '@/validators/NodeConfigValidator'
import ConnectionValidator from '@/validators/ConnectionValidator'
import FlowIntegrityValidator from '@/validators/FlowIntegrityValidator'

export interface ValidationManagerOptions {
  canvas: Graph
  eventBus: UnifiedEventBus
  cacheManager: UnifiedCacheManager
  errorHandler: ErrorHandler
}

export interface ValidationError {
  type: string
  field?: string
  message: string
  severity: 'error' | 'warning'
  nodeId?: string
  edgeId?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  timestamp: number
}

export interface NodeValidationResult extends ValidationResult {
  nodeId: string
  nodeType: string
}

export interface ConnectionValidationResult {
  edgeId: string
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export interface FlowValidationResult {
  validations: Array<{
    type: string
    isValid: boolean
    message: string
    affectedNodes?: string[]
  }>
  errors: ValidationError[]
  warnings: ValidationError[]
}

export interface ComprehensiveValidationResult extends ValidationResult {
  nodeValidations: Map<string, NodeValidationResult>
  connectionValidations: ConnectionValidationResult[]
  flowValidations: FlowValidationResult
}

/**
 * 校验管理器
 * 负责协调各种校验器，执行发布前的完整性检查
 */
export default class ValidationManager {
  private canvas: Graph
  private eventBus: UnifiedEventBus
  private cacheManager: UnifiedCacheManager
  private errorHandler: ErrorHandler
  
  public validators: {
    nodeConfig: NodeConfigValidator
    connection: ConnectionValidator
    flowIntegrity: FlowIntegrityValidator
  }
  
  public validationResults: Map<string, any> = new Map()

  constructor(options: ValidationManagerOptions) {
    this.canvas = options.canvas
    this.eventBus = options.eventBus
    this.cacheManager = options.cacheManager
    this.errorHandler = options.errorHandler

    // 初始化各种校验器
    this.validators = {
      nodeConfig: new NodeConfigValidator({
        eventBus: this.eventBus,
        errorHandler: this.errorHandler
      }),
      connection: new ConnectionValidator({
        canvas: this.canvas,
        eventBus: this.eventBus,
        errorHandler: this.errorHandler
      }),
      flowIntegrity: new FlowIntegrityValidator({
        canvas: this.canvas,
        eventBus: this.eventBus,
        errorHandler: this.errorHandler
      })
    }

    this.setupEventListeners()
  }

  /**
   * 执行完整的校验流程
   */
  async validateAll(): Promise<ComprehensiveValidationResult> {
    try {
      const startTime = Date.now()
      
      // 并行执行各种校验
      const [nodeValidations, connectionValidations, flowValidations] = await Promise.all([
        this.validateAllNodes(),
        this.validateConnections(),
        this.validateFlowIntegrity()
      ])

      // 汇总所有错误和警告
      const allErrors: ValidationError[] = [
        ...nodeValidations.errors,
        ...connectionValidations.errors,
        ...flowValidations.errors
      ]

      const allWarnings: ValidationError[] = [
        ...nodeValidations.warnings,
        ...connectionValidations.warnings,
        ...flowValidations.warnings
      ]

      const result: ComprehensiveValidationResult = {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        nodeValidations: nodeValidations.validations,
        connectionValidations: connectionValidations.validations,
        flowValidations,
        timestamp: Date.now()
      }

      // 缓存校验结果
      this.validationResults.set('latest', result)
      
      // 发出校验完成事件
      this.eventBus.emit('validation:completed', {
        result,
        duration: Date.now() - startTime
      })

      return result
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'ValidationManager.validateAll',
        severity: 'high'
      })

      const errorResult: ComprehensiveValidationResult = {
        isValid: false,
        errors: [{
          type: 'VALIDATION_ERROR',
          message: `校验过程发生错误: ${(error as Error).message}`,
          severity: 'error'
        }],
        warnings: [],
        nodeValidations: new Map(),
        connectionValidations: [],
        flowValidations: { validations: [], errors: [], warnings: [] },
        timestamp: Date.now()
      }

      return errorResult
    }
  }

  /**
   * 校验所有节点
   */
  async validateAllNodes(): Promise<{
    validations: Map<string, NodeValidationResult>
    errors: ValidationError[]
    warnings: ValidationError[]
  }> {
    const nodes = this.canvas.getNodes()
    const validations = new Map<string, NodeValidationResult>()
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    for (const node of nodes) {
      try {
        const nodeData = node.getData()
        const validation = await this.validators.nodeConfig.validate(nodeData, node.id)
        
        const nodeValidation: NodeValidationResult = {
          nodeId: node.id,
          nodeType: nodeData?.nodeType || 'UNKNOWN',
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
          timestamp: Date.now()
        }

        validations.set(node.id, nodeValidation)
        errors.push(...validation.errors)
        warnings.push(...validation.warnings)
      } catch (error) {
        const errorValidation: NodeValidationResult = {
          nodeId: node.id,
          nodeType: 'UNKNOWN',
          isValid: false,
          errors: [{
            type: 'NODE_VALIDATION_ERROR',
            message: `节点校验失败: ${(error as Error).message}`,
            severity: 'error',
            nodeId: node.id
          }],
          warnings: [],
          timestamp: Date.now()
        }
        
        validations.set(node.id, errorValidation)
        errors.push(...errorValidation.errors)
      }
    }

    return { validations, errors, warnings }
  }

  /**
   * 校验所有连接
   */
  async validateConnections(): Promise<{
    validations: ConnectionValidationResult[]
    errors: ValidationError[]
    warnings: ValidationError[]
  }> {
    const edges = this.canvas.getEdges()
    const validations: ConnectionValidationResult[] = []
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    for (const edge of edges) {
      try {
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()
        const sourceNode = this.canvas.getCellById(sourceId) as Node
        const targetNode = this.canvas.getCellById(targetId) as Node

        const validation = await this.validators.connection.validate({
          edge,
          sourceNode,
          targetNode
        })

        const connectionValidation: ConnectionValidationResult = {
          edgeId: edge.id,
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings
        }

        validations.push(connectionValidation)
        errors.push(...validation.errors)
        warnings.push(...validation.warnings)
      } catch (error) {
        const errorValidation: ConnectionValidationResult = {
          edgeId: edge.id,
          isValid: false,
          errors: [{
            type: 'CONNECTION_VALIDATION_ERROR',
            message: `连接校验失败: ${(error as Error).message}`,
            severity: 'error',
            edgeId: edge.id
          }],
          warnings: []
        }
        
        validations.push(errorValidation)
        errors.push(...errorValidation.errors)
      }
    }

    return { validations, errors, warnings }
  }

  /**
   * 校验流程完整性
   */
  async validateFlowIntegrity(): Promise<FlowValidationResult> {
    try {
      const nodes = this.canvas.getNodes()
      const edges = this.canvas.getEdges()
      
      const validation = await this.validators.flowIntegrity.validate({
        nodes,
        edges
      })

      // 创建流程完整性校验结果
      const flowValidations = [{
        type: 'FLOW_INTEGRITY_CHECK',
        isValid: validation.isValid,
        message: validation.isValid ? '流程完整性校验通过' : '流程完整性校验失败',
        errors: validation.errors,
        warnings: validation.warnings,
        timestamp: validation.timestamp
      }]

      return {
        validations: flowValidations,
        errors: validation.errors,
        warnings: validation.warnings
      }
    } catch (error) {
      return {
        validations: [],
        errors: [{
          type: 'FLOW_INTEGRITY_ERROR',
          message: `流程完整性校验失败: ${(error as Error).message}`,
          severity: 'error'
        }],
        warnings: []
      }
    }
  }

  /**
   * 校验单个节点（增量校验）
   */
  async validateNode(nodeId: string): Promise<NodeValidationResult> {
    try {
      const node = this.canvas.getCellById(nodeId)
      if (!node) {
        return {
          nodeId,
          nodeType: 'UNKNOWN',
          isValid: false,
          errors: [{
            type: 'NODE_NOT_FOUND',
            message: `节点 ${nodeId} 不存在`,
            severity: 'error',
            nodeId
          }],
          warnings: [],
          timestamp: Date.now()
        }
      }

      const nodeData = node.getData()
      const validation = await this.validators.nodeConfig.validate(nodeData, nodeId)
      
      return {
        nodeId,
        nodeType: nodeData?.nodeType || 'UNKNOWN',
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        nodeId,
        nodeType: 'UNKNOWN',
        isValid: false,
        errors: [{
          type: 'NODE_VALIDATION_ERROR',
          message: `节点校验失败: ${(error as Error).message}`,
          severity: 'error',
          nodeId
        }],
        warnings: [],
        timestamp: Date.now()
      }
    }
  }

  /**
   * 获取缓存的校验结果
   */
  getValidationResult(key: string): any {
    return this.validationResults.get(key)
  }

  /**
   * 清除校验结果缓存
   */
  clearValidationCache(): void {
    this.validationResults.clear()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听节点变化，触发增量校验
    this.eventBus.on('node:changed', async (data: { nodeId: string }) => {
      try {
        const result = await this.validateNode(data.nodeId)
        this.eventBus.emit('node:validation:completed', { nodeId: data.nodeId, result })
      } catch (error) {
        this.errorHandler.handleError(error as Error, {
          context: 'ValidationManager.node:changed',
          severity: 'medium'
        })
      }
    })

    // 监听连接变化，触发相关校验
    this.eventBus.on('edge:changed', async (data: { edgeId: string }) => {
      try {
        const edge = this.canvas.getCellById(data.edgeId) as Edge
        if (edge) {
          const sourceId = edge.getSourceCellId()
          const targetId = edge.getTargetCellId()
          const sourceNode = this.canvas.getCellById(sourceId) as Node
          const targetNode = this.canvas.getCellById(targetId) as Node

          const validation = await this.validators.connection.validate({
            edge,
            sourceNode,
            targetNode
          })

          this.eventBus.emit('edge:validation:completed', {
            edgeId: data.edgeId,
            result: validation
          })
        }
      } catch (error) {
        this.errorHandler.handleError(error as Error, {
          context: 'ValidationManager.edge:changed',
          severity: 'medium'
        })
      }
    })
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.eventBus.off('node:changed')
    this.eventBus.off('edge:changed')
    this.clearValidationCache()
  }
}