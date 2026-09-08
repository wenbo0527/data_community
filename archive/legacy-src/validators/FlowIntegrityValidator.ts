import type { Graph, Node, Edge } from '@antv/x6'
import type { UnifiedEventBus } from '@/core/UnifiedEventBus'
import type { ErrorHandler } from '@/core/ErrorHandler'
import type { ValidationError, ValidationResult } from '@/managers/publish/ValidationManager'

export interface FlowIntegrityValidatorOptions {
  canvas: Graph
  eventBus: UnifiedEventBus
  errorHandler: ErrorHandler
}

export interface FlowValidationContext {
  nodes: Node[]
  edges: Edge[]
  validateEndNodes?: boolean
  validateStartNodes?: boolean
  validateConnectivity?: boolean
}

/**
 * 流程完整性校验器
 * 负责校验整个工作流的完整性和有效性
 */
export default class FlowIntegrityValidator {
  private canvas: Graph
  private eventBus: UnifiedEventBus
  private errorHandler: ErrorHandler

  // 节点类型定义 - 营销画布节点类型
  private readonly nodeTypes = {
    INPUT: ['start'],
    PROCESSING: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait'],
    OUTPUT: ['end']
  }

  constructor(options: FlowIntegrityValidatorOptions) {
    this.canvas = options.canvas
    this.eventBus = options.eventBus
    this.errorHandler = options.errorHandler
  }

  /**
   * 校验流程完整性
   */
  async validate(context: FlowValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    try {
      const { nodes, edges, validateEndNodes = true, validateStartNodes = true, validateConnectivity = true } = context

      // 基础流程校验
      this.validateBasicFlow(nodes, edges, errors)
      
      // 起始节点校验
      if (validateStartNodes) {
        this.validateStartNodes(nodes, edges, errors, warnings)
      }
      
      // 结束节点校验
      if (validateEndNodes) {
        this.validateEndNodes(nodes, edges, errors, warnings)
      }
      
      // 连通性校验
      if (validateConnectivity) {
        this.validateConnectivity(nodes, edges, errors, warnings)
      }
      
      // 数据流校验
      this.validateDataFlow(nodes, edges, errors, warnings)
      
      // 孤立节点校验
      this.validateIsolatedNodes(nodes, edges, warnings)
      
      // 分支完整性校验
      this.validateBranchIntegrity(nodes, edges, errors, warnings)

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        timestamp: Date.now()
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'FlowIntegrityValidator.validate'
      })

      return {
        isValid: false,
        errors: [{
          type: 'FLOW_VALIDATION_EXCEPTION',
          message: `流程校验异常: ${(error as Error).message}`,
          severity: 'error'
        }],
        warnings: [],
        timestamp: Date.now()
      }
    }
  }

  /**
   * 校验基础流程
   */
  private validateBasicFlow(
    nodes: Node[],
    edges: Edge[],
    errors: ValidationError[]
  ): void {
    // 检查是否有节点
    if (!nodes || nodes.length === 0) {
      errors.push({
        type: 'EMPTY_FLOW',
        message: '工作流不能为空',
        severity: 'error'
      })
      return
    }

    // 检查节点数量限制
    if (nodes.length > 100) {
      errors.push({
        type: 'TOO_MANY_NODES',
        message: '工作流节点数量过多，建议不超过100个',
        severity: 'error'
      })
    }

    // 检查边的有效性
    if (edges) {
      for (const edge of edges) {
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()
        
        if (!sourceId || !targetId) {
          errors.push({
            type: 'INVALID_EDGE',
            message: '存在无效的连接',
            severity: 'error',
            edgeId: edge.id
          })
        }

        // 检查连接的节点是否存在
        const sourceExists = nodes.some(node => node.id === sourceId)
        const targetExists = nodes.some(node => node.id === targetId)
        
        if (!sourceExists) {
          errors.push({
            type: 'MISSING_SOURCE_NODE',
            message: `连接的源节点 ${sourceId} 不存在`,
            severity: 'error',
            edgeId: edge.id,
            nodeId: sourceId
          })
        }
        
        if (!targetExists) {
          errors.push({
            type: 'MISSING_TARGET_NODE',
            message: `连接的目标节点 ${targetId} 不存在`,
            severity: 'error',
            edgeId: edge.id,
            nodeId: targetId
          })
        }
      }
    }
  }

  /**
   * 校验起始节点
   */
  private validateStartNodes(
    nodes: Node[],
    edges: Edge[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const inputNodes = nodes.filter(node => {
      const nodeType = node.getData()?.type || node.getData()?.nodeType
      return this.nodeTypes.INPUT.includes(nodeType)
    })

    // 检查是否有输入节点
    if (inputNodes.length === 0) {
      errors.push({
        type: 'NO_INPUT_NODES',
        message: '工作流必须包含至少一个输入节点',
        severity: 'error'
      })
      return
    }

    // 检查输入节点是否有输入连接（不应该有）
    for (const inputNode of inputNodes) {
      const incomingEdges = edges.filter(edge => edge.getTargetCellId() === inputNode.id)
      if (incomingEdges.length > 0) {
        warnings.push({
          type: 'INPUT_NODE_HAS_INCOMING',
          message: `输入节点 ${inputNode.id} 不应该有输入连接`,
          severity: 'warning',
          nodeId: inputNode.id
        })
      }
    }

    // 检查输入节点是否有输出连接
    for (const inputNode of inputNodes) {
      const outgoingEdges = edges.filter(edge => edge.getSourceCellId() === inputNode.id)
      if (outgoingEdges.length === 0) {
        warnings.push({
          type: 'ISOLATED_INPUT_NODE',
          message: `输入节点 ${inputNode.id} 没有输出连接`,
          severity: 'warning',
          nodeId: inputNode.id
        })
      }
    }
  }

  /**
   * 校验结束节点
   */
  private validateEndNodes(
    nodes: Node[],
    edges: Edge[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const outputNodes = nodes.filter(node => {
      const nodeType = node.getData()?.type || node.getData()?.nodeType
      return this.nodeTypes.OUTPUT.includes(nodeType)
    })

    // 检查是否有输出节点
    if (outputNodes.length === 0) {
      errors.push({
        type: 'NO_OUTPUT_NODES',
        message: '工作流必须包含至少一个输出节点',
        severity: 'error'
      })
      return
    }

    // 检查输出节点是否有输出连接（不应该有）
    for (const outputNode of outputNodes) {
      const outgoingEdges = edges.filter(edge => edge.getSourceCellId() === outputNode.id)
      if (outgoingEdges.length > 0) {
        warnings.push({
          type: 'OUTPUT_NODE_HAS_OUTGOING',
          message: `输出节点 ${outputNode.id} 不应该有输出连接`,
          severity: 'warning',
          nodeId: outputNode.id
        })
      }
    }

    // 检查输出节点是否有输入连接
    for (const outputNode of outputNodes) {
      const incomingEdges = edges.filter(edge => edge.getTargetCellId() === outputNode.id)
      if (incomingEdges.length === 0) {
        warnings.push({
          type: 'ISOLATED_OUTPUT_NODE',
          message: `输出节点 ${outputNode.id} 没有输入连接`,
          severity: 'warning',
          nodeId: outputNode.id
        })
      }
    }
  }

  /**
   * 校验连通性
   */
  private validateConnectivity(
    nodes: Node[],
    edges: Edge[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // 构建邻接表
    const adjacencyList = new Map<string, string[]>()
    const reverseAdjacencyList = new Map<string, string[]>()
    
    for (const node of nodes) {
      adjacencyList.set(node.id, [])
      reverseAdjacencyList.set(node.id, [])
    }
    
    for (const edge of edges) {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (sourceId && targetId) {
        adjacencyList.get(sourceId)?.push(targetId)
        reverseAdjacencyList.get(targetId)?.push(sourceId)
      }
    }

    // 检查从输入节点到输出节点的连通性
    const inputNodes = nodes.filter(node => {
      const nodeType = node.getData()?.type || node.getData()?.nodeType
      return this.nodeTypes.INPUT.includes(nodeType)
    })
    
    const outputNodes = nodes.filter(node => {
      const nodeType = node.getData()?.type || node.getData()?.nodeType
      return this.nodeTypes.OUTPUT.includes(nodeType)
    })

    for (const inputNode of inputNodes) {
      const reachableOutputs = this.findReachableNodes(inputNode.id, adjacencyList, outputNodes.map(n => n.id))
      
      if (reachableOutputs.length === 0) {
        errors.push({
          type: 'DISCONNECTED_INPUT',
          message: `输入节点 ${inputNode.id} 无法到达任何输出节点`,
          severity: 'error',
          nodeId: inputNode.id
        })
      }
    }

    for (const outputNode of outputNodes) {
      const reachableInputs = this.findReachableNodes(outputNode.id, reverseAdjacencyList, inputNodes.map(n => n.id))
      
      if (reachableInputs.length === 0) {
        errors.push({
          type: 'DISCONNECTED_OUTPUT',
          message: `输出节点 ${outputNode.id} 无法从任何输入节点到达`,
          severity: 'error',
          nodeId: outputNode.id
        })
      }
    }

    // 检查强连通分量
    const components = this.findStronglyConnectedComponents(nodes, adjacencyList)
    if (components.length > 1) {
      warnings.push({
        type: 'MULTIPLE_COMPONENTS',
        message: `工作流包含 ${components.length} 个独立的连通分量`,
        severity: 'warning'
      })
    }
  }

  /**
   * 校验数据流
   */
  private validateDataFlow(
    nodes: Node[],
    edges: Edge[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // 检查数据流的逻辑顺序
    for (const edge of edges) {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (!sourceId || !targetId) continue
      
      const sourceNode = nodes.find(n => n.id === sourceId)
      const targetNode = nodes.find(n => n.id === targetId)
      
      if (!sourceNode || !targetNode) continue
      
      const sourceType = sourceNode.getData()?.type || sourceNode.getData()?.nodeType
      const targetType = targetNode.getData()?.type || targetNode.getData()?.nodeType
      
      // 检查数据流方向的合理性
      if (this.nodeTypes.OUTPUT.includes(sourceType) && !this.nodeTypes.OUTPUT.includes(targetType)) {
        errors.push({
          type: 'INVALID_DATA_FLOW',
          message: `输出节点 ${sourceId} 不应该连接到非输出节点 ${targetId}`,
          severity: 'error',
          edgeId: edge.id
        })
      }
      
      // 检查处理节点的输入输出
      if (this.nodeTypes.PROCESSING.includes(targetType)) {
        const targetData = targetNode.getData()
        const requiredInputs = targetData?.requiredInputs || 1
        const actualInputs = edges.filter(e => e.getTargetCellId() === targetId).length
        
        if (actualInputs < requiredInputs) {
          warnings.push({
            type: 'INSUFFICIENT_INPUTS',
            message: `处理节点 ${targetId} 需要 ${requiredInputs} 个输入，但只有 ${actualInputs} 个`,
            severity: 'warning',
            nodeId: targetId
          })
        }
      }
    }
  }

  /**
   * 校验孤立节点
   */
  private validateIsolatedNodes(
    nodes: Node[],
    edges: Edge[],
    warnings: ValidationError[]
  ): void {
    for (const node of nodes) {
      const hasIncoming = edges.some(edge => edge.getTargetCellId() === node.id)
      const hasOutgoing = edges.some(edge => edge.getSourceCellId() === node.id)
      
      const nodeType = node.getData()?.type || node.getData()?.nodeType
      
      // 检查完全孤立的节点（没有任何连接）
      if (!hasIncoming && !hasOutgoing) {
        warnings.push({
          type: 'ISOLATED_NODE',
          message: `孤立节点 ${node.id}，没有任何连接`,
          severity: 'warning',
          nodeId: node.id
        })
        continue
      }
      
      // 输入节点不应该有输入连接，输出节点不应该有输出连接
      const shouldHaveIncoming = !this.nodeTypes.INPUT.includes(nodeType)
      const shouldHaveOutgoing = !this.nodeTypes.OUTPUT.includes(nodeType)
      
      // 检查缺少必要连接的节点
      if (shouldHaveIncoming && !hasIncoming) {
        warnings.push({
          type: 'NO_INPUT_CONNECTION',
          message: `节点 ${node.id} 没有输入连接`,
          severity: 'warning',
          nodeId: node.id
        })
      }
      
      if (shouldHaveOutgoing && !hasOutgoing) {
        warnings.push({
          type: 'NO_OUTPUT_CONNECTION',
          message: `节点 ${node.id} 没有输出连接`,
          severity: 'warning',
          nodeId: node.id
        })
      }
    }
  }

  /**
   * 校验分支完整性
   */
  private validateBranchIntegrity(
    nodes: Node[],
    edges: Edge[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // 检查分流节点的分支
    for (const node of nodes) {
      const nodeData = node.getData()
      const nodeType = nodeData?.type || nodeData?.nodeType
      if (nodeType === 'audience-split' || nodeType === 'event-split' || nodeData?.hasBranches) {
        const outgoingEdges = edges.filter(edge => edge.getSourceCellId() === node.id)
        
        // 检查分支数量
        const expectedBranches = nodeData?.expectedBranches || 2
        if (outgoingEdges.length < expectedBranches) {
          warnings.push({
            type: 'INCOMPLETE_BRANCHES',
            message: `分流节点 ${node.id} 期望 ${expectedBranches} 个分支，但只有 ${outgoingEdges.length} 个`,
            severity: 'warning',
            nodeId: node.id
          })
        }
        
        // 检查分支标签
        for (const edge of outgoingEdges) {
          const edgeData = edge.getData()
          if (!edgeData?.branchLabel) {
            warnings.push({
              type: 'MISSING_BRANCH_LABEL',
              message: `分支连接 ${edge.id} 缺少分支标签`,
              severity: 'warning',
              edgeId: edge.id
            })
          }
        }
      }
    }
  }

  /**
   * 查找可达节点
   */
  private findReachableNodes(
    startNodeId: string,
    adjacencyList: Map<string, string[]>,
    targetNodeIds: string[]
  ): string[] {
    const visited = new Set<string>()
    const reachable: string[] = []
    const queue = [startNodeId]
    
    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visited.has(currentId)) continue
      
      visited.add(currentId)
      
      if (targetNodeIds.includes(currentId)) {
        reachable.push(currentId)
      }
      
      const neighbors = adjacencyList.get(currentId) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      }
    }
    
    return reachable
  }

  /**
   * 查找强连通分量
   */
  private findStronglyConnectedComponents(
    nodes: Node[],
    adjacencyList: Map<string, string[]>
  ): string[][] {
    const visited = new Set<string>()
    const components: string[][] = []
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        const component: string[] = []
        this.dfsComponent(node.id, adjacencyList, visited, component)
        if (component.length > 0) {
          components.push(component)
        }
      }
    }
    
    return components
  }

  /**
   * DFS遍历连通分量
   */
  private dfsComponent(
    nodeId: string,
    adjacencyList: Map<string, string[]>,
    visited: Set<string>,
    component: string[]
  ): void {
    visited.add(nodeId)
    component.push(nodeId)
    
    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.dfsComponent(neighbor, adjacencyList, visited, component)
      }
    }
  }

  /**
   * 获取流程统计信息
   */
  getFlowStatistics(nodes: Node[], edges: Edge[]): {
    totalNodes: number
    totalEdges: number
    inputNodes: number
    processingNodes: number
    outputNodes: number
    isolatedNodes: number
    maxDepth: number
  } {
    const inputNodes = nodes.filter(node => {
      const nodeType = node.getData()?.nodeType
      return this.nodeTypes.INPUT.includes(nodeType)
    }).length

    const processingNodes = nodes.filter(node => {
      const nodeType = node.getData()?.nodeType
      return this.nodeTypes.PROCESSING.includes(nodeType)
    }).length

    const outputNodes = nodes.filter(node => {
      const nodeType = node.getData()?.nodeType
      return this.nodeTypes.OUTPUT.includes(nodeType)
    }).length

    const isolatedNodes = nodes.filter(node => {
      const hasConnection = edges.some(edge => 
        edge.getSourceCellId() === node.id || edge.getTargetCellId() === node.id
      )
      return !hasConnection
    }).length

    // 计算最大深度
    const maxDepth = this.calculateMaxDepth(nodes, edges)

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      inputNodes,
      processingNodes,
      outputNodes,
      isolatedNodes,
      maxDepth
    }
  }

  /**
   * 计算流程最大深度
   */
  private calculateMaxDepth(nodes: Node[], edges: Edge[]): number {
    const adjacencyList = new Map<string, string[]>()
    
    for (const node of nodes) {
      adjacencyList.set(node.id, [])
    }
    
    for (const edge of edges) {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (sourceId && targetId) {
        adjacencyList.get(sourceId)?.push(targetId)
      }
    }

    const inputNodes = nodes.filter(node => {
      const nodeType = node.getData()?.nodeType
      return this.nodeTypes.INPUT.includes(nodeType)
    })

    let maxDepth = 0
    
    for (const inputNode of inputNodes) {
      const depth = this.calculateDepthFromNode(inputNode.id, adjacencyList, new Set())
      maxDepth = Math.max(maxDepth, depth)
    }
    
    return maxDepth
  }

  /**
   * 从指定节点计算深度
   */
  private calculateDepthFromNode(
    nodeId: string,
    adjacencyList: Map<string, string[]>,
    visited: Set<string>
  ): number {
    if (visited.has(nodeId)) {
      return 0 // 避免循环
    }
    
    visited.add(nodeId)
    
    const neighbors = adjacencyList.get(nodeId) || []
    if (neighbors.length === 0) {
      visited.delete(nodeId)
      return 1
    }
    
    let maxChildDepth = 0
    for (const neighbor of neighbors) {
      const childDepth = this.calculateDepthFromNode(neighbor, adjacencyList, visited)
      maxChildDepth = Math.max(maxChildDepth, childDepth)
    }
    
    visited.delete(nodeId)
    return 1 + maxChildDepth
  }
}