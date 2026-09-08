import type { Graph, Edge, Node } from '@antv/x6'
import type { UnifiedEventBus } from '@/core/UnifiedEventBus'
import type { ErrorHandler } from '@/core/ErrorHandler'
import type { ValidationError, ValidationResult } from '@/managers/publish/ValidationManager'

export interface ConnectionValidatorOptions {
  canvas: Graph
  eventBus: UnifiedEventBus
  errorHandler: ErrorHandler
}

export interface ConnectionValidationContext {
  edge: Edge
  sourceNode: Node | null
  targetNode: Node | null
}

/**
 * 连接校验器
 * 负责校验节点间连接的有效性和完整性
 */
export default class ConnectionValidator {
  private canvas: Graph
  private eventBus: UnifiedEventBus
  private errorHandler: ErrorHandler

  // 允许的连接类型映射
  private readonly allowedConnections = {
    INPUT_NODE: {
      canConnectTo: ['PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE', 'OUTPUT_NODE'],
      canReceiveFrom: []
    },
    PROCESSING_NODE: {
      canConnectTo: ['PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE', 'OUTPUT_NODE'],
      canReceiveFrom: ['INPUT_NODE', 'PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE']
    },
    FILTER_NODE: {
      canConnectTo: ['PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE', 'OUTPUT_NODE'],
      canReceiveFrom: ['INPUT_NODE', 'PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE']
    },
    JOIN_NODE: {
      canConnectTo: ['PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE', 'OUTPUT_NODE'],
      canReceiveFrom: ['INPUT_NODE', 'PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE']
    },
    AGGREGATE_NODE: {
      canConnectTo: ['PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE', 'OUTPUT_NODE'],
      canReceiveFrom: ['INPUT_NODE', 'PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE']
    },
    OUTPUT_NODE: {
      canConnectTo: [],
      canReceiveFrom: ['INPUT_NODE', 'PROCESSING_NODE', 'FILTER_NODE', 'JOIN_NODE', 'AGGREGATE_NODE']
    }
  }

  constructor(options: ConnectionValidatorOptions) {
    this.canvas = options.canvas
    this.eventBus = options.eventBus
    this.errorHandler = options.errorHandler
  }

  /**
   * 校验连接
   */
  async validate(context: ConnectionValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    try {
      const { edge, sourceNode, targetNode } = context

      // 基础连接校验
      this.validateBasicConnection(edge, sourceNode, targetNode, errors)
      
      // 节点存在性校验
      this.validateNodeExistence(edge, sourceNode, targetNode, errors)
      
      // 连接类型校验
      if (sourceNode && targetNode) {
        this.validateConnectionType(edge, sourceNode, targetNode, errors, warnings)
        
        // 循环依赖校验
        this.validateCyclicDependency(edge, sourceNode, targetNode, errors)
        
        // 重复连接校验
        this.validateDuplicateConnection(edge, sourceNode, targetNode, warnings)
        
        // 端口方向校验
        this.validatePortDirection(edge, sourceNode, targetNode, errors)
        
        // 数据兼容性校验
        this.validateDataCompatibility(edge, sourceNode, targetNode, warnings)
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        timestamp: Date.now()
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'ConnectionValidator.validate',
        edgeId: context.edge.id
      })

      return {
        isValid: false,
        errors: [{
          type: 'CONNECTION_VALIDATION_EXCEPTION',
          message: `连接校验异常: ${(error as Error).message}`,
          severity: 'error',
          edgeId: context.edge.id
        }],
        warnings: [],
        timestamp: Date.now()
      }
    }
  }

  /**
   * 校验基础连接信息
   */
  private validateBasicConnection(
    edge: Edge,
    sourceNode: Node | null,
    targetNode: Node | null,
    errors: ValidationError[]
  ): void {
    // 检查边是否有效
    if (!edge || !edge.id) {
      errors.push({
        type: 'INVALID_EDGE',
        message: '连接对象无效',
        severity: 'error'
      })
      return
    }

    // 检查源节点和目标节点ID
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()

    if (!sourceId) {
      errors.push({
        type: 'MISSING_SOURCE_NODE',
        message: '连接缺少源节点',
        severity: 'error',
        edgeId: edge.id
      })
    }

    if (!targetId) {
      errors.push({
        type: 'MISSING_TARGET_NODE',
        message: '连接缺少目标节点',
        severity: 'error',
        edgeId: edge.id
      })
    }

    // 检查自连接
    if (sourceId && targetId && sourceId === targetId) {
      errors.push({
        type: 'SELF_CONNECTION',
        message: '节点不能连接到自身',
        severity: 'error',
        edgeId: edge.id,
        nodeId: sourceId
      })
    }
  }

  /**
   * 校验节点存在性
   */
  private validateNodeExistence(
    edge: Edge,
    sourceNode: Node | null,
    targetNode: Node | null,
    errors: ValidationError[]
  ): void {
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()

    if (sourceId && !sourceNode) {
      errors.push({
        type: 'SOURCE_NODE_NOT_FOUND',
        message: `源节点 ${sourceId} 不存在`,
        severity: 'error',
        edgeId: edge.id,
        nodeId: sourceId
      })
    }

    if (targetId && !targetNode) {
      errors.push({
        type: 'TARGET_NODE_NOT_FOUND',
        message: `目标节点 ${targetId} 不存在`,
        severity: 'error',
        edgeId: edge.id,
        nodeId: targetId
      })
    }
  }

  /**
   * 校验连接类型
   */
  private validateConnectionType(
    edge: Edge,
    sourceNode: Node,
    targetNode: Node,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const sourceData = sourceNode.getData()
    const targetData = targetNode.getData()
    
    const sourceType = sourceData?.nodeType
    const targetType = targetData?.nodeType

    if (!sourceType || !targetType) {
      errors.push({
        type: 'MISSING_NODE_TYPE',
        message: '节点类型信息缺失',
        severity: 'error',
        edgeId: edge.id
      })
      return
    }

    // 检查源节点是否可以连接到目标节点
    const sourceConfig = this.allowedConnections[sourceType as keyof typeof this.allowedConnections]
    if (!sourceConfig) {
      warnings.push({
        type: 'UNKNOWN_SOURCE_NODE_TYPE',
        message: `未知的源节点类型: ${sourceType}`,
        severity: 'warning',
        edgeId: edge.id,
        nodeId: sourceNode.id
      })
      return
    }

    if (!sourceConfig.canConnectTo.includes(targetType)) {
      errors.push({
        type: 'INVALID_CONNECTION_TYPE',
        message: `${sourceType} 节点不能连接到 ${targetType} 节点`,
        severity: 'error',
        edgeId: edge.id
      })
    }

    // 检查目标节点是否可以接收来自源节点的连接
    const targetConfig = this.allowedConnections[targetType as keyof typeof this.allowedConnections]
    if (targetConfig && !targetConfig.canReceiveFrom.includes(sourceType)) {
      errors.push({
        type: 'INVALID_CONNECTION_DIRECTION',
        message: `${targetType} 节点不能接收来自 ${sourceType} 节点的连接`,
        severity: 'error',
        edgeId: edge.id
      })
    }
  }

  /**
   * 校验循环依赖
   */
  private validateCyclicDependency(
    edge: Edge,
    sourceNode: Node,
    targetNode: Node,
    errors: ValidationError[]
  ): void {
    // 使用DFS检测是否会形成循环
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true // 发现循环
      }
      if (visited.has(nodeId)) {
        return false // 已访问过，无循环
      }

      visited.add(nodeId)
      recursionStack.add(nodeId)

      // 获取当前节点的所有输出连接
      const outgoingEdges = this.canvas.getOutgoingEdges(nodeId)
      for (const outEdge of outgoingEdges) {
        const targetId = outEdge.getTargetCellId()
        if (targetId && hasCycle(targetId)) {
          return true
        }
      }

      // 模拟添加新连接后的情况
      if (nodeId === sourceNode.id) {
        if (hasCycle(targetNode.id)) {
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    if (hasCycle(sourceNode.id)) {
      errors.push({
        type: 'CYCLIC_DEPENDENCY',
        message: '此连接会形成循环依赖',
        severity: 'error',
        edgeId: edge.id
      })
    }
  }

  /**
   * 校验重复连接
   */
  private validateDuplicateConnection(
    edge: Edge,
    sourceNode: Node,
    targetNode: Node,
    warnings: ValidationError[]
  ): void {
    const existingEdges = this.canvas.getEdges()
    const duplicates = existingEdges.filter(existingEdge => 
      existingEdge.id !== edge.id &&
      existingEdge.getSourceCellId() === sourceNode.id &&
      existingEdge.getTargetCellId() === targetNode.id
    )

    if (duplicates.length > 0) {
      warnings.push({
        type: 'DUPLICATE_CONNECTION',
        message: '存在重复的连接',
        severity: 'warning',
        edgeId: edge.id
      })
    }
  }

  /**
   * 校验端口方向（确保单向连接）
   */
  private validatePortDirection(
    edge: Edge,
    sourceNode: Node,
    targetNode: Node,
    errors: ValidationError[]
  ): void {
    const sourcePort = edge.getSourcePortId()
    const targetPort = edge.getTargetPortId()

    // 检查源端口是否为输出端口
    if (sourcePort && !sourcePort.includes('out')) {
      errors.push({
        type: 'INVALID_SOURCE_PORT',
        message: '连接必须从输出端口开始',
        severity: 'error',
        edgeId: edge.id,
        nodeId: sourceNode.id
      })
    }

    // 检查目标端口是否为输入端口
    if (targetPort && !targetPort.includes('in')) {
      errors.push({
        type: 'INVALID_TARGET_PORT',
        message: '连接必须连接到输入端口',
        severity: 'error',
        edgeId: edge.id,
        nodeId: targetNode.id
      })
    }
  }

  /**
   * 校验数据兼容性
   */
  private validateDataCompatibility(
    edge: Edge,
    sourceNode: Node,
    targetNode: Node,
    warnings: ValidationError[]
  ): void {
    const sourceData = sourceNode.getData()
    const targetData = targetNode.getData()

    const sourceSchema = sourceData?.outputSchema
    const targetSchema = targetData?.inputSchema || targetData?.expectedInputSchema

    if (!sourceSchema || !targetSchema) {
      warnings.push({
        type: 'MISSING_SCHEMA_INFO',
        message: '缺少数据模式信息，无法验证数据兼容性',
        severity: 'warning',
        edgeId: edge.id
      })
      return
    }

    // 检查字段兼容性
    if (sourceSchema.fields && targetSchema.fields) {
      const missingFields = targetSchema.fields.filter(
        (field: string) => !sourceSchema.fields.includes(field)
      )

      if (missingFields.length > 0) {
        warnings.push({
          type: 'SCHEMA_MISMATCH',
          message: `目标节点需要的字段在源节点中不存在: ${missingFields.join(', ')}`,
          severity: 'warning',
          edgeId: edge.id
        })
      }
    }

    // 检查数据类型兼容性
    if (sourceSchema.types && targetSchema.types) {
      for (const [field, targetType] of Object.entries(targetSchema.types)) {
        const sourceType = sourceSchema.types[field]
        if (sourceType && sourceType !== targetType) {
          warnings.push({
            type: 'TYPE_MISMATCH',
            message: `字段 ${field} 的类型不匹配: 源节点为 ${sourceType}，目标节点期望 ${targetType}`,
            severity: 'warning',
            edgeId: edge.id
          })
        }
      }
    }
  }

  /**
   * 批量校验连接
   */
  async validateMultiple(contexts: ConnectionValidationContext[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    for (const context of contexts) {
      try {
        const result = await this.validate(context)
        results.push(result)
      } catch (error) {
        results.push({
          isValid: false,
          errors: [{
            type: 'BATCH_VALIDATION_ERROR',
            message: `批量校验失败: ${(error as Error).message}`,
            severity: 'error',
            edgeId: context.edge?.id || 'unknown'
          }],
          warnings: [],
          timestamp: Date.now()
        })
      }
    }

    return results
  }

  /**
   * 获取允许的连接类型
   */
  getAllowedConnections(): typeof this.allowedConnections {
    return this.allowedConnections
  }

  /**
   * 检查两个节点类型是否可以连接
   */
  canConnect(sourceType: string, targetType: string): boolean {
    const sourceConfig = this.allowedConnections[sourceType as keyof typeof this.allowedConnections]
    return sourceConfig ? sourceConfig.canConnectTo.includes(targetType) : false
  }
}