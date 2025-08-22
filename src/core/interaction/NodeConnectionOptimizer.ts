import { UnifiedEventBus } from '../UnifiedEventBus'
import { UnifiedCacheManager } from '../UnifiedCacheManager'
import { ErrorHandler } from '../ErrorHandler'
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager'

/**
 * 位置坐标接口
 */
export interface Position {
  x: number
  y: number
}

/**
 * 连接信息接口
 */
export interface ConnectionInfo {
  sourceNodeId: string
  targetNodeId: string
  sourcePort: string
  targetPort: string
  edgeId?: string
}

/**
 * 节点信息接口
 */
export interface NodeInfo {
  id: string
  position: Position
  ports: string[]
}

/**
 * 端口建议接口
 */
export interface PortSuggestion {
  sourcePort: string
  targetPort: string
}

/**
 * 连接路径点
 */
export interface PathPoint {
  x: number
  y: number
}

/**
 * 节点连接优化器配置
 */
export interface NodeConnectionOptimizerConfig {
  eventBus: UnifiedEventBus
  cacheManager: UnifiedCacheManager
  errorHandler: ErrorHandler
  graph: any
  coordinateManager: CoordinateSystemManager
  snapThreshold?: number
  previewStyle?: {
    strokeDasharray?: string
    stroke?: string
    strokeWidth?: number
  }
}

/**
 * 节点连接优化器
 * 负责处理节点间的连接逻辑，包括预览线、连接验证、路径优化等
 */
export class NodeConnectionOptimizer {
  private eventBus: UnifiedEventBus
  private cacheManager: UnifiedCacheManager
  private errorHandler: ErrorHandler
  private graph: any
  private coordinateManager: CoordinateSystemManager
  private config: NodeConnectionOptimizerConfig
  private enabled: boolean = true
  private activeConnections: Map<string, ConnectionInfo> = new Map()
  private previewConnections: Set<string> = new Set()
  private validationCache: Map<string, boolean> = new Map()

  constructor(config: NodeConnectionOptimizerConfig) {
    this.eventBus = config.eventBus
    this.cacheManager = config.cacheManager
    this.errorHandler = config.errorHandler
    this.graph = config.graph
    this.coordinateManager = config.coordinateManager
    this.config = {
      snapThreshold: 30,
      previewStyle: {
        strokeDasharray: '5 5',
        stroke: '#1890ff',
        strokeWidth: 2
      },
      ...config
    }

    this.initializeEventListeners()
    this.initializeCache()
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    try {
      // 监听连接创建事件
      this.graph.on('edge:connected', this.handleConnectionCreated.bind(this))
      
      // 监听连接断开事件
      this.graph.on('edge:disconnected', this.handleConnectionRemoved.bind(this))
      
      // 监听节点移动事件
      this.eventBus.on('node:moved', this.handleNodeMoved.bind(this))
      
      // 监听拖拽事件
      this.eventBus.on('drag:start', this.handleDragStart.bind(this))
      this.eventBus.on('drag:end', this.handleDragEnd.bind(this))
    } catch (error) {
      this.errorHandler.handleError({
        type: 'EVENT_LISTENER_INIT_FAILED',
        message: '连接优化器事件监听器初始化失败',
        error,
        context: { component: 'NodeConnectionOptimizer' }
      })
    }
  }

  /**
   * 初始化缓存
   */
  private initializeCache(): void {
    this.cacheManager.set('connection_optimizer_config', this.config, 300000) // 5分钟缓存
  }

  /**
   * 创建预览线连接
   */
  public createPreviewConnection(
    sourceNodeId: string,
    targetNodeId: string,
    sourcePort: string,
    targetPort: string
  ): boolean {
    try {
      // 验证参数
      if (!sourceNodeId || !targetNodeId || !sourcePort || !targetPort) {
        this.errorHandler.handleError({
          type: 'INVALID_CONNECTION_PARAMS',
          message: '连接参数无效',
          context: { sourceNodeId, targetNodeId, sourcePort, targetPort }
        })
        return false
      }

      // 验证连接有效性
      if (!this.validateConnection(sourceNodeId, targetNodeId, sourcePort, targetPort)) {
        return false
      }

      // 获取源节点和目标节点
      const sourceNode = this.graph.getCellById(sourceNodeId)
      const targetNode = this.graph.getCellById(targetNodeId)
      
      if (!sourceNode || !targetNode) {
        return false
      }

      // 使用坐标管理器获取精确的端口位置
      const sourcePortPos = this.coordinateManager.getPortPosition(sourceNode, sourcePort)
      const targetPortPos = this.coordinateManager.getPortPosition(targetNode, targetPort)
      
      if (!sourcePortPos || !targetPortPos) {
        this.errorHandler.handleError({
          type: 'PORT_POSITION_NOT_FOUND',
          message: '无法获取端口位置',
          context: { sourceNodeId, targetNodeId, sourcePort, targetPort }
        })
        return false
      }

      // 创建预览边
      const previewEdgeId = `preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // 使用坐标修正优化预览线路径
      const optimizedPath = this.coordinateManager.correctPreviewLinePath(
        sourcePortPos,
        targetPortPos,
        { sourceNodeId, targetNodeId, sourcePort, targetPort }
      )
      
      const edgeConfig = {
        id: previewEdgeId,
        source: { cell: sourceNodeId, port: sourcePort },
        target: { cell: targetNodeId, port: targetPort },
        vertices: optimizedPath.vertices || [], // 使用优化后的路径点
        attrs: {
          line: {
            ...this.config.previewStyle,
            targetMarker: {
              name: 'classic',
              size: 8
            }
          }
        },
        zIndex: 1000, // 确保预览线在最上层
        data: {
          isPreview: true,
          coordinatesCorrected: true
        }
      }

      this.graph.addEdge(edgeConfig)
      this.previewConnections.add(previewEdgeId)

      // 发布预览连接创建事件
      this.eventBus.emit('preview:connection:created', {
        edgeId: previewEdgeId,
        sourceNodeId,
        targetNodeId,
        sourcePort,
        targetPort,
        optimizedPath
      })

      return true
    } catch (error) {
      this.errorHandler.handleError({
        type: 'CONNECTION_CREATION_FAILED',
        message: '预览连接创建失败',
        error,
        context: { sourceNodeId, targetNodeId, sourcePort, targetPort }
      })
      return false
    }
  }

  /**
   * 移除预览线连接
   */
  public removePreviewConnection(previewId: string): void {
    try {
      this.graph.removeEdge(previewId)
      this.previewConnections.delete(previewId)
      
      this.eventBus.emit('preview:connection:removed', { edgeId: previewId })
    } catch (error) {
      this.errorHandler.handleError({
        type: 'PREVIEW_CONNECTION_REMOVAL_FAILED',
        message: '预览连接移除失败',
        error,
        context: { previewId }
      })
    }
  }

  /**
   * 清除所有预览线连接
   */
  public clearAllPreviewConnections(): void {
    try {
      const previewIds = Array.from(this.previewConnections)
      previewIds.forEach(id => {
        this.graph.removeEdge(id)
      })
      this.previewConnections.clear()
      
      this.eventBus.emit('preview:connections:cleared')
    } catch (error) {
      this.errorHandler.handleError({
        type: 'PREVIEW_CONNECTIONS_CLEAR_FAILED',
        message: '清除所有预览连接失败',
        error
      })
    }
  }

  /**
   * 获取预览连接列表
   */
  public getPreviewConnections(): string[] {
    return Array.from(this.previewConnections)
  }

  /**
   * 验证连接有效性
   * 确保只能从out端口连接到in端口（单向连接）
   */
  public validateConnection(
    sourceNodeId: string,
    targetNodeId: string,
    sourcePort: string,
    targetPort: string
  ): boolean {
    try {
      // 生成缓存键
      const cacheKey = `validation_${sourceNodeId}_${targetNodeId}_${sourcePort}_${targetPort}`
      
      // 检查缓存
      if (this.validationCache.has(cacheKey)) {
        return this.validationCache.get(cacheKey)!
      }

      // 检查自连接
      if (sourceNodeId === targetNodeId) {
        this.validationCache.set(cacheKey, false)
        return false
      }

      // 检查节点是否存在
      const sourceNode = this.graph.getCellById(sourceNodeId)
      const targetNode = this.graph.getCellById(targetNodeId)
      
      if (!sourceNode || !targetNode) {
        this.validationCache.set(cacheKey, false)
        return false
      }

      // 验证单向连接：只能从out端口连接到in端口
      if (!this.validatePortDirection(sourcePort, targetPort)) {
        this.validationCache.set(cacheKey, false)
        return false
      }

      // 检查是否会形成循环依赖
      if (this.detectCyclicDependency(sourceNodeId, targetNodeId)) {
        this.validationCache.set(cacheKey, false)
        return false
      }

      // 检查是否已存在相同连接
      const existingConnection = this.findExistingConnection(sourceNodeId, targetNodeId, sourcePort, targetPort)
      if (existingConnection) {
        this.validationCache.set(cacheKey, false)
        return false
      }

      this.validationCache.set(cacheKey, true)
      return true
    } catch (error) {
      this.errorHandler.handleError({
        type: 'CONNECTION_VALIDATION_FAILED',
        message: '连接验证失败',
        error,
        context: { sourceNodeId, targetNodeId, sourcePort, targetPort }
      })
      return false
    }
  }

  /**
   * 验证端口连接方向
   * 只允许从out端口连接到in端口
   */
  private validatePortDirection(sourcePort: string, targetPort: string): boolean {
    // 检查源端口是否为输出端口
    const isSourceOutput = sourcePort.toLowerCase().includes('out') || 
                          sourcePort.toLowerCase().includes('output') ||
                          sourcePort === 'out'
    
    // 检查目标端口是否为输入端口
    const isTargetInput = targetPort.toLowerCase().includes('in') || 
                         targetPort.toLowerCase().includes('input') ||
                         targetPort === 'in'
    
    return isSourceOutput && isTargetInput
  }

  /**
   * 检测循环依赖
   */
  public detectCyclicDependency(sourceNodeId: string, targetNodeId: string): boolean {
    try {
      // 模拟添加新连接后检查是否形成循环
      const edges = this.graph.getEdges()
      
      // 创建临时图结构，包含新连接
      const adjacencyList = new Map<string, string[]>()
      
      // 添加现有连接
      for (const edge of edges) {
        const source = edge.source?.cell
        const target = edge.target?.cell
        if (source && target) {
          if (!adjacencyList.has(source)) {
            adjacencyList.set(source, [])
          }
          adjacencyList.get(source)!.push(target)
        }
      }
      
      // 添加新的连接
      if (!adjacencyList.has(sourceNodeId)) {
        adjacencyList.set(sourceNodeId, [])
      }
      adjacencyList.get(sourceNodeId)!.push(targetNodeId)
      
      // 使用DFS检测循环
      const visited = new Set<string>()
      const recursionStack = new Set<string>()
      
      const hasCycle = (nodeId: string): boolean => {
        if (recursionStack.has(nodeId)) {
          return true
        }
        
        if (visited.has(nodeId)) {
          return false
        }
        
        visited.add(nodeId)
        recursionStack.add(nodeId)
        
        const neighbors = adjacencyList.get(nodeId) || []
        for (const neighbor of neighbors) {
          if (hasCycle(neighbor)) {
            return true
          }
        }
        
        recursionStack.delete(nodeId)
        return false
      }
      
      // 从源节点开始检查是否能形成循环
      return hasCycle(sourceNodeId)
    } catch (error) {
      this.errorHandler.handleError({
        type: 'CYCLE_DETECTION_FAILED',
        message: '循环依赖检测失败',
        error,
        context: { sourceNodeId, targetNodeId }
      })
      return false
    }
  }

  /**
   * 查找现有连接
   */
  private findExistingConnection(
    sourceNodeId: string,
    targetNodeId: string,
    sourcePort: string,
    targetPort: string
  ): any {
    const edges = this.graph.getEdges()
    return edges.find((edge: any) => 
      edge.source?.cell === sourceNodeId &&
      edge.target?.cell === targetNodeId &&
      edge.source?.port === sourcePort &&
      edge.target?.port === targetPort
    )
  }

  /**
   * 优化连接路径
   */
  public optimizeConnectionPath(sourcePos: Position, targetPos: Position): PathPoint[] {
    try {
      const path: PathPoint[] = []
      
      // 计算中间控制点
      const deltaX = targetPos.x - sourcePos.x
      const deltaY = targetPos.y - sourcePos.y
      
      // 添加起始点
      path.push({ x: sourcePos.x, y: sourcePos.y })
      
      // 如果距离较远，添加中间控制点
      if (Math.abs(deltaX) > 100 || Math.abs(deltaY) > 100) {
        const midX = sourcePos.x + deltaX * 0.5
        const midY = sourcePos.y + deltaY * 0.3
        path.push({ x: midX, y: midY })
        
        const midX2 = sourcePos.x + deltaX * 0.7
        const midY2 = sourcePos.y + deltaY * 0.8
        path.push({ x: midX2, y: midY2 })
      }
      
      // 添加终点
      path.push({ x: targetPos.x, y: targetPos.y })
      
      return path
    } catch (error) {
      this.errorHandler.handleError({
        type: 'PATH_OPTIMIZATION_FAILED',
        message: '连接路径优化失败',
        error,
        context: { sourcePos, targetPos }
      })
      return [sourcePos, targetPos]
    }
  }

  /**
   * 计算连接距离
   */
  public calculateConnectionDistance(sourcePos: Position, targetPos: Position): number {
    const deltaX = targetPos.x - sourcePos.x
    const deltaY = targetPos.y - sourcePos.y
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }

  /**
   * 建议最佳连接端口
   */
  public suggestBestPorts(sourceNode: NodeInfo, targetNode: NodeInfo): PortSuggestion {
    try {
      // 简单策略：选择距离最近的端口组合
      let bestDistance = Infinity
      let bestSuggestion: PortSuggestion = {
        sourcePort: sourceNode.ports[0] || 'output',
        targetPort: targetNode.ports[0] || 'input'
      }
      
      for (const sourcePort of sourceNode.ports) {
        for (const targetPort of targetNode.ports) {
          const distance = this.calculateConnectionDistance(sourceNode.position, targetNode.position)
          if (distance < bestDistance) {
            bestDistance = distance
            bestSuggestion = { sourcePort, targetPort }
          }
        }
      }
      
      return bestSuggestion
    } catch (error) {
      this.errorHandler.handleError({
        type: 'PORT_SUGGESTION_FAILED',
        message: '端口建议失败',
        error,
        context: { sourceNode, targetNode }
      })
      return {
        sourcePort: 'output',
        targetPort: 'input'
      }
    }
  }

  /**
   * 处理连接创建事件
   */
  public handleConnectionCreated(data: any): void {
    try {
      const { edge } = data
      if (!edge) return
      
      const connectionInfo: ConnectionInfo = {
        sourceNodeId: edge.source?.cell,
        targetNodeId: edge.target?.cell,
        sourcePort: edge.source?.port,
        targetPort: edge.target?.port,
        edgeId: edge.id
      }
      
      this.activeConnections.set(edge.id, connectionInfo)
      
      this.eventBus.emit('connection:created', {
        edgeId: edge.id,
        sourceNodeId: edge.source?.cell,
        targetNodeId: edge.target?.cell,
        sourcePort: edge.source?.port,
        targetPort: edge.target?.port
      })
    } catch (error) {
      this.errorHandler.handleError({
        type: 'CONNECTION_EVENT_HANDLING_FAILED',
        message: '连接创建事件处理失败',
        error,
        context: { data }
      })
    }
  }

  /**
   * 处理连接删除事件
   */
  public handleConnectionRemoved(data: any): void {
    try {
      const { edge } = data
      if (!edge) return
      
      this.activeConnections.delete(edge.id)
      
      this.eventBus.emit('connection:removed', {
        edgeId: edge.id,
        sourceNodeId: edge.source?.cell,
        targetNodeId: edge.target?.cell
      })
    } catch (error) {
      this.errorHandler.handleError({
        type: 'CONNECTION_REMOVAL_EVENT_HANDLING_FAILED',
        message: '连接删除事件处理失败',
        error,
        context: { data }
      })
    }
  }

  /**
   * 处理节点移动事件
   */
  private handleNodeMoved(data: any): void {
    try {
      // 清除相关的验证缓存
      const nodeId = data.nodeId
      const keysToDelete = Array.from(this.validationCache.keys())
        .filter(key => key.includes(nodeId))
      
      keysToDelete.forEach(key => this.validationCache.delete(key))
    } catch (error) {
      this.errorHandler.handleError({
        type: 'NODE_MOVE_EVENT_HANDLING_FAILED',
        message: '节点移动事件处理失败',
        error,
        context: { data }
      })
    }
  }

  /**
   * 处理拖拽开始事件
   */
  private handleDragStart(data: any): void {
    // 拖拽开始时清除所有预览连接
    this.clearAllPreviewConnections()
  }

  /**
   * 处理拖拽结束事件
   */
  private handleDragEnd(data: any): void {
    // 拖拽结束时清除所有预览连接
    this.clearAllPreviewConnections()
  }

  /**
   * 添加活跃连接
   */
  public addActiveConnection(connectionId: string, connectionInfo: ConnectionInfo): void {
    this.activeConnections.set(connectionId, connectionInfo)
  }

  /**
   * 获取活跃连接
   */
  public getActiveConnections(): Map<string, ConnectionInfo> {
    return new Map(this.activeConnections)
  }

  /**
   * 获取节点的所有连接
   */
  public getNodeConnections(nodeId: string): any[] {
    const edges = this.graph.getEdges()
    return edges.filter((edge: any) => 
      edge.source?.cell === nodeId || edge.target?.cell === nodeId
    )
  }

  /**
   * 批量创建连接
   */
  public batchCreateConnections(connections: ConnectionInfo[]): void {
    try {
      connections.forEach(connection => {
        this.createPreviewConnection(
          connection.sourceNodeId,
          connection.targetNodeId,
          connection.sourcePort,
          connection.targetPort
        )
      })
    } catch (error) {
      this.errorHandler.handleError({
        type: 'BATCH_CONNECTION_CREATION_FAILED',
        message: '批量连接创建失败',
        error,
        context: { connections }
      })
    }
  }

  /**
   * 获取节点端口位置
   */
  public getPortPosition(node: any, portType: string): Position {
    try {
      if (!node || !node.position || !node.size) {
        throw new Error('Invalid node data')
      }

      const { position, size } = node
      const centerY = position.y + size.height / 2

      if (portType === 'input' || portType === 'in') {
        // 输入端口在节点左侧
        return {
          x: position.x,
          y: centerY
        }
      } else if (portType === 'output' || portType === 'out') {
        // 输出端口在节点右侧
        return {
          x: position.x + size.width,
          y: centerY
        }
      } else {
        // 默认返回节点中心
        return {
          x: position.x + size.width / 2,
          y: centerY
        }
      }
    } catch (error) {
      this.errorHandler.handleError({
        type: 'PORT_POSITION_CALCULATION_FAILED',
        message: '端口位置计算失败',
        error,
        context: { node, portType }
      })
      
      // 返回默认位置
      return {
        x: node?.position?.x || 0,
        y: node?.position?.y || 0
      }
    }
  }

  /**
   * 创建预览线
   */
  public createPreviewLine(sourceNodeId: string, sourcePort: string, targetPoint: Position): boolean {
    try {
      // 获取源节点
      const sourceNode = this.graph.getNodeById(sourceNodeId)
      if (!sourceNode) {
        throw new Error(`Source node not found: ${sourceNodeId}`)
      }

      // 获取源端口位置
      const sourcePortPos = this.getPortPosition(sourceNode, sourcePort)
      
      // 使用坐标管理器优化预览线路径
      const optimizedPath = this.coordinateManager.correctPreviewLinePath(
        sourcePortPos,
        targetPoint,
        { sourceNodeId, sourcePort }
      )

      // 创建预览线ID
      const previewLineId = `preview-line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // 添加到预览连接集合
      this.previewConnections.add(previewLineId)
      
      // 发送预览线创建事件
      this.eventBus.emit('preview:line:created', {
        id: previewLineId,
        sourceNodeId,
        sourcePort,
        sourcePosition: sourcePortPos,
        targetPosition: targetPoint,
        path: optimizedPath
      })
      
      return true
    } catch (error) {
      this.errorHandler.handleError({
        type: 'PREVIEW_LINE_CREATION_FAILED',
        message: '预览线创建失败',
        error,
        context: { sourceNodeId, sourcePort, targetPoint }
      })
      return false
    }
  }

  /**
   * 检查是否启用
   */
  public isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 启用连接优化器
   */
  public enable(): void {
    this.enabled = true
  }

  /**
   * 禁用连接优化器
   */
  public disable(): void {
    this.enabled = false
    this.clearAllPreviewConnections()
  }

  /**
   * 销毁连接优化器
   */
  public destroy(): void {
    try {
      // 移除事件监听器
      this.graph.off('edge:connected')
      this.graph.off('edge:disconnected')
      this.eventBus.off('node:moved')
      this.eventBus.off('drag:start')
      this.eventBus.off('drag:end', this.handleDragEnd.bind(this))
      
      // 清除所有预览连接
      this.clearAllPreviewConnections()
      
      // 清除缓存
      this.activeConnections.clear()
      this.previewConnections.clear()
      this.validationCache.clear()
      
      this.enabled = false
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'CONNECTION_OPTIMIZER_DESTROY_FAILED',
        severity: 'high'
      })
    }
  }
}