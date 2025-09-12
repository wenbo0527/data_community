import { UnifiedEventBus } from '../UnifiedEventBus'
import { UnifiedCacheManager } from '../UnifiedCacheManager'
import { ErrorHandler } from '../ErrorHandler'
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager'

/**
 * 布局模式类型
 */
export type LayoutMode = 'manual' | 'unified'

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  mode: LayoutMode
  nodeSpacing: number
  layerSpacing: number
  autoLayout: boolean
}

/**
 * 节点位置接口
 */
export interface NodePosition {
  x: number
  y: number
}

/**
 * 营销画布节点类型
 */
export type MarketingNodeType = 'start' | 'audience-split' | 'event-split' | 'sms' | 'ai-call' | 'manual-call' | 'ab-test' | 'wait' | 'end'

/**
 * 通用工作流节点类型（保持兼容性）
 */
export type WorkflowNodeType = 'INPUT' | 'PROCESSING' | 'OUTPUT'

/**
 * 统一节点类型
 */
export type NodeType = MarketingNodeType | WorkflowNodeType

/**
 * 布局模式管理器
 * 负责管理手动布局和统一布局模式的切换
 * 提供布局算法和位置管理功能
 */
export class LayoutModeManager {
  private graph: any
  private eventBus: UnifiedEventBus
  private cacheManager: UnifiedCacheManager
  private errorHandler: ErrorHandler
  private coordinateManager: CoordinateSystemManager
  
  // 布局状态
  private currentMode: LayoutMode = 'manual'
  private layoutConfig: LayoutConfig = {
    mode: 'manual',
    nodeSpacing: 160,
    layerSpacing: 200,
    autoLayout: false
  }
  
  // 事件监听器引用
  private eventListeners: Map<string, Function> = new Map()

  constructor(
    graph: any,
    eventBus: UnifiedEventBus,
    cacheManager: UnifiedCacheManager,
    errorHandler: ErrorHandler,
    coordinateManager: CoordinateSystemManager
  ) {
    this.graph = graph
    this.eventBus = eventBus
    this.cacheManager = cacheManager
    this.errorHandler = errorHandler
    this.coordinateManager = coordinateManager
    
    this.initializeEventListeners()
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    try {
      const nodeAddedHandler = this.handleNodeAdded.bind(this)
      const nodeRemovedHandler = this.handleNodeRemoved.bind(this)
      const edgeAddedHandler = this.handleEdgeAdded.bind(this)
      
      this.eventListeners.set('node:added', nodeAddedHandler)
      this.eventListeners.set('node:removed', nodeRemovedHandler)
      this.eventListeners.set('edge:added', edgeAddedHandler)
      
      this.graph.on('node:added', nodeAddedHandler)
      this.graph.on('node:removed', nodeRemovedHandler)
      this.graph.on('edge:added', edgeAddedHandler)
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Initialize event listeners failed'), {
        component: 'LayoutModeManager',
        action: 'initializeEventListeners'
      })
    }
  }

  /**
   * 处理节点添加事件
   */
  private handleNodeAdded(event: any): void {
    try {
      const nodeId = event.node?.id
      if (!nodeId) return
      
      let autoLayoutTriggered = false
      
      // 在统一布局模式下自动重新布局
      if (this.currentMode === 'unified') {
        this.applyUnifiedLayout()
        autoLayoutTriggered = true
      }
      
      this.eventBus.emit('layout:node:added', {
        nodeId,
        autoLayoutTriggered
      })
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Handle node added failed'), {
        component: 'LayoutModeManager',
        action: 'handleNodeAdded'
      })
    }
  }

  /**
   * 处理节点移除事件
   */
  private handleNodeRemoved(event: any): void {
    try {
      const nodeId = event.node?.id
      if (!nodeId) return
      
      // 清除手动布局位置缓存
      this.cacheManager.delete(`manual_position_${nodeId}`)
      
      this.eventBus.emit('layout:node:removed', {
        nodeId
      })
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Handle node removed failed'), {
        component: 'LayoutModeManager',
        action: 'handleNodeRemoved'
      })
    }
  }

  /**
   * 处理边添加事件
   */
  private handleEdgeAdded(event: any): void {
    try {
      // 在统一布局模式下可能需要重新布局
      if (this.currentMode === 'unified' && this.layoutConfig.autoLayout) {
        this.applyUnifiedLayout()
      }
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Handle edge added failed'), {
        component: 'LayoutModeManager',
        action: 'handleEdgeAdded'
      })
    }
  }

  /**
   * 切换到统一布局模式
   */
  public switchToUnifiedMode(): boolean {
    try {
      if (this.currentMode === 'unified') {
        return false
      }
      
      const previousMode = this.currentMode
      this.currentMode = 'unified'
      this.layoutConfig.mode = 'unified'
      
      // 禁用手动拖拽
      this.graph.disableSelection()
      this.graph.disableNodeMovable()
      
      this.eventBus.emit('layout:mode:changed', {
        from: previousMode,
        to: 'unified'
      })
      
      console.log('LayoutModeManager: 已切换到统一布局模式')
      
      return true
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Switch to unified mode failed'), {
        component: 'LayoutModeManager',
        action: 'switchToUnifiedMode'
      })
      return false
    }
  }

  /**
   * 切换到手动布局模式
   */
  public switchToManualMode(): boolean {
    try {
      if (this.currentMode === 'manual') {
        return false
      }
      
      const previousMode = this.currentMode
      this.currentMode = 'manual'
      this.layoutConfig.mode = 'manual'
      
      // 启用手动拖拽
      this.graph.enableSelection()
      this.graph.enableNodeMovable()
      
      this.eventBus.emit('layout:mode:changed', {
        from: previousMode,
        to: 'manual'
      })
      
      console.log('LayoutModeManager: 已切换到手动布局模式')
      
      return true
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Switch to manual mode failed'), {
        component: 'LayoutModeManager',
        action: 'switchToManualMode'
      })
      return false
    }
  }

  /**
   * 切换布局模式
   */
  public switchToMode(mode: LayoutMode): boolean {
    try {
      if (mode === 'unified') {
        return this.switchToUnifiedMode()
      } else if (mode === 'manual') {
        return this.switchToManualMode()
      } else {
        console.warn(`LayoutModeManager: 不支持的布局模式 ${mode}`)
        return false
      }
    } catch (error) {
      this.errorHandler.handleError(
        error instanceof Error ? error : new Error('Mode switch failed'),
        { component: 'LayoutModeManager', method: 'switchToMode' }
      )
      return false
    }
  }

  /**
   * 应用统一布局算法
   */
  public applyUnifiedLayout(): boolean {
    try {
      const nodes = this.graph.getNodes()
      const edges = this.graph.getEdges()
      
      if (!nodes || nodes.length === 0) {
        console.warn('LayoutModeManager: 没有节点可以布局')
        return false
      }
      
      // 🎯 新增：统一布局需要至少3个节点才能执行
      if (nodes.length < 3) {
        console.warn('LayoutModeManager: 统一布局需要至少3个节点，当前节点数量:', nodes.length)
        return false
      }
      
      console.log('LayoutModeManager: 开始应用统一布局', { nodeCount: nodes.length, edgeCount: edges.length })
      
      // 按节点类型分组
      const nodesByType = this.groupNodesByType(nodes)
      console.log('LayoutModeManager: 节点分组结果', Object.fromEntries(nodesByType))
      
      // 计算布局位置（已集成坐标验证和修正）
      const positions = this.calculateHierarchicalLayout(nodesByType)
      console.log('LayoutModeManager: 计算出的位置', Object.fromEntries(positions))
      
      if (positions.size === 0) {
        console.error('LayoutModeManager: 没有计算出任何位置')
        return false
      }
      
      // 应用位置前进行坐标转换验证
      let appliedCount = 0
      for (const [nodeId, position] of positions) {
        // 直接使用计算出的位置，避免坐标修正导致的问题
        this.graph.setPosition(nodeId, position)
        appliedCount++
      }
      
      console.log('LayoutModeManager: 布局应用完成', { appliedCount })
      
      this.eventBus.emit('layout:unified:applied', {
        nodeCount: nodes.length,
        appliedCount,
        layoutType: 'hierarchical',
        coordinatesCorrected: true
      })
      
      return true
    } catch (error) {
      console.error('LayoutModeManager: 布局算法执行失败', error)
      this.errorHandler.handleError(
        error instanceof Error ? error : new Error('Apply unified layout failed'),
        { component: 'LayoutModeManager', method: 'applyUnifiedLayout' }
      )
      return false
    }
  }

  /**
   * 按节点类型分组（支持营销画布和通用工作流）
   */
  private groupNodesByType(nodes: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>()
    
    // 检测节点类型系统
    const isMarketingCanvas = nodes.some(node => 
      ['start', 'audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end'].includes(node.type)
    )
    
    if (isMarketingCanvas) {
      // 营销画布节点分层
      groups.set('start', [])
      groups.set('processing', []) // 中间处理节点
      groups.set('end', [])
    } else {
      // 通用工作流节点分层
      groups.set('INPUT', [])
      groups.set('PROCESSING', [])
      groups.set('OUTPUT', [])
    }
    
    for (const node of nodes) {
      const nodeType = node.type || node.getData?.()?.type
      
      if (isMarketingCanvas) {
        if (nodeType === 'start') {
          groups.get('start')!.push(node)
        } else if (nodeType === 'end') {
          groups.get('end')!.push(node)
        } else {
          groups.get('processing')!.push(node)
        }
      } else {
        if (groups.has(nodeType)) {
          groups.get(nodeType)!.push(node)
        }
      }
    }
    
    return groups
  }

  /**
   * 计算分层布局位置（支持营销画布和通用工作流）
   */
  private calculateHierarchicalLayout(nodesByType: Map<string, any[]>): Map<string, NodePosition> {
    const positions = new Map<string, NodePosition>()
    const { nodeSpacing, layerSpacing } = this.layoutConfig
    
    // 检测是否为营销画布
    const isMarketingCanvas = nodesByType.has('start') || nodesByType.has('end')
    
    if (isMarketingCanvas) {
      return this.calculateMarketingCanvasLayout(nodesByType)
    } else {
      return this.calculateWorkflowLayout(nodesByType)
    }
  }
  
  /**
   * 计算营销画布布局（基于图结构的真正垂直分层布局）
   */
  private calculateMarketingCanvasLayout(nodesByType: Map<string, any[]>): Map<string, NodePosition> {
    const positions = new Map<string, NodePosition>()
    const { nodeSpacing, layerSpacing } = this.layoutConfig
    
    // 获取所有节点
    const allNodes = Array.from(nodesByType.values()).flat()
    const totalNodes = allNodes.length
    
    // 🎯 关键修复：基于图结构计算真正的垂直分层
    const layers = this.calculateNodeLayers(allNodes)
    
    // 🎯 新增：构建父子关系映射用于居中对齐
    const parentChildMap = this.buildParentChildMap(allNodes)
    
    // 根据层级布局节点
    const startY = 100
    const centerX = 400 // 画布中心X坐标
    
    // 🎯 修复：实现真正的父子节点居中对齐算法
    for (const [layerIndex, nodesInLayer] of layers.entries()) {
      const layerY = startY + (layerIndex * layerSpacing)
      
      for (let i = 0; i < nodesInLayer.length; i++) {
        const node = nodesInLayer[i]
        const nodeType = this.getNodeTypeCategory(node.type)
        
        let nodeX: number
        
        if (nodesInLayer.length === 1) {
          // 单节点：与父节点或画布中心对齐
          const parentNodes = parentChildMap.parents.get(node.id) || []
          if (parentNodes.length > 0) {
            // 🎯 修复：对于多个父节点，计算父节点的中心X坐标
            if (parentNodes.length === 1) {
              const parentPosition = positions.get(parentNodes[0])
              nodeX = parentPosition ? parentPosition.x : centerX
            } else {
              // 多个父节点：计算父节点的中心X坐标
              const parentPositions = parentNodes.map(pid => positions.get(pid)).filter(pos => pos)
              if (parentPositions.length > 0) {
                const parentCenterX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length
                nodeX = parentCenterX
              } else {
                nodeX = centerX
              }
            }
          } else {
            nodeX = centerX
          }
        } else {
          // 🎯 重新设计：多节点实现真正的居中对称分布
          // 首先找到这一层节点的共同父节点
          const layerParentNodes = new Set<string>()
          for (const layerNode of nodesInLayer) {
            const nodeParents = parentChildMap.parents.get(layerNode.id) || []
            nodeParents.forEach(pid => layerParentNodes.add(pid))
          }
          
          // 查找共同父节点的中心X坐标
          let parentCenterX = centerX
          if (layerParentNodes.size > 0) {
            const parentPositions = Array.from(layerParentNodes)
              .map(pid => positions.get(pid))
              .filter(pos => pos)
            if (parentPositions.length > 0) {
              parentCenterX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length
            }
          }
          
          // 🎯 关键修复：分支节点应该围绕父节点中心对称分布
          // 不依赖子节点位置，因为子节点可能还未计算
          const referenceCenterX = parentCenterX
          
          // 计算对称分布：确保分支中心与参考中心完全对齐
          const totalWidth = (nodesInLayer.length - 1) * nodeSpacing
          const startX = referenceCenterX - totalWidth / 2
          const calculatedBranchCenter = startX + totalWidth / 2
          
          nodeX = startX + (i * nodeSpacing)
          
          // 验证分支中心对齐
          console.log(`Layer ${layerIndex}, Node ${i}:`, {
            parentCenterX,
            referenceCenterX,
            totalWidth,
            startX,
            nodeSpacing,
            nodeX,
            计算的分支中心: calculatedBranchCenter,
            与参考中心差值: Math.abs(calculatedBranchCenter - referenceCenterX)
          })
        }
        
        const position = {
          x: nodeX,
          y: layerY
        }
        
        positions.set(node.id, this.validateAndCorrectPosition(position, node, nodeType, layerIndex))
      }
    }
    
    // 对所有位置进行最终坐标一致性检查
    this.validateLayoutCoordinates(positions)
    
    return positions
  }
  
  /**
   * 构建父子关系映射
   */
  private buildParentChildMap(nodes: any[]): { parents: Map<string, string[]>, children: Map<string, string[]> } {
    const parents = new Map<string, string[]>()
    const children = new Map<string, string[]>()
    
    // 初始化映射
    for (const node of nodes) {
      parents.set(node.id, [])
      children.set(node.id, [])
    }
    
    // 获取边信息并构建父子关系
    const edges = this.graph.getEdges()
    for (const edge of edges) {
      const sourceId = edge.getSourceCellId ? edge.getSourceCellId() : edge.source
      const targetId = edge.getTargetCellId ? edge.getTargetCellId() : edge.target
      
      if (parents.has(targetId) && children.has(sourceId)) {
        parents.get(targetId)!.push(sourceId)
        children.get(sourceId)!.push(targetId)
      }
    }
    
    return { parents, children }
  }
  
  /**
   * 基于图结构计算节点层级
   */
  private calculateNodeLayers(nodes: any[]): Map<number, any[]> {
    const layers = new Map<number, any[]>()
    const nodeMap = new Map<string, any>()
    const inDegree = new Map<string, number>()
    const outEdges = new Map<string, string[]>()
    
    console.log('calculateNodeLayers: 开始计算节点层级', { nodeCount: nodes.length })
    
    // 构建节点映射
    for (const node of nodes) {
      nodeMap.set(node.id, node)
      inDegree.set(node.id, 0)
      outEdges.set(node.id, [])
    }
    
    console.log('calculateNodeLayers: 节点映射构建完成', { nodeIds: Array.from(nodeMap.keys()) })
    
    // 获取边信息并构建图结构
    const edges = this.graph.getEdges()
    console.log('calculateNodeLayers: 获取边信息', { edgeCount: edges.length })
    
    for (const edge of edges) {
      // 兼容不同的边对象结构
      const sourceId = edge.getSourceCellId ? edge.getSourceCellId() : edge.source
      const targetId = edge.getTargetCellId ? edge.getTargetCellId() : edge.target
      
      console.log('calculateNodeLayers: 处理边', { sourceId, targetId })
      
      if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
        outEdges.get(sourceId)!.push(targetId)
        inDegree.set(targetId, inDegree.get(targetId)! + 1)
        console.log('calculateNodeLayers: 边添加成功', { sourceId, targetId, targetInDegree: inDegree.get(targetId) })
      } else {
        console.warn('calculateNodeLayers: 边引用的节点不存在', { sourceId, targetId, hasSource: nodeMap.has(sourceId), hasTarget: nodeMap.has(targetId) })
      }
    }
    
    console.log('calculateNodeLayers: 图结构构建完成', {
      inDegrees: Object.fromEntries(inDegree),
      outEdges: Object.fromEntries(outEdges)
    })
    
    // 拓扑排序计算层级
    const queue: Array<{node: any, layer: number}> = []
    
    // 找到所有入度为0的节点（开始节点）
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        const node = nodeMap.get(nodeId)!
        queue.push({ node, layer: 0 })
      }
    }
    
    // 如果没有入度为0的节点，找到开始节点类型
    if (queue.length === 0) {
      for (const node of nodes) {
        if (node.type === 'start') {
          queue.push({ node, layer: 0 })
          break
        }
      }
    }
    
    const processedNodes = new Set<string>()
    
    while (queue.length > 0) {
      const { node, layer } = queue.shift()!
      
      if (processedNodes.has(node.id)) {
        continue
      }
      
      processedNodes.add(node.id)
      
      // 将节点添加到对应层级
      if (!layers.has(layer)) {
        layers.set(layer, [])
      }
      layers.get(layer)!.push(node)
      
      // 处理子节点
      const children = outEdges.get(node.id) || []
      for (const childId of children) {
        if (!processedNodes.has(childId)) {
          const childNode = nodeMap.get(childId)!
          queue.push({ node: childNode, layer: layer + 1 })
        }
      }
    }
    
    // 处理未连接的节点
    for (const node of nodes) {
      if (!processedNodes.has(node.id)) {
        const layer = node.type === 'end' ? Math.max(...layers.keys()) + 1 : 0
        if (!layers.has(layer)) {
          layers.set(layer, [])
        }
        layers.get(layer)!.push(node)
      }
    }
    
    return layers
  }
  
  /**
   * 获取节点类型分类
   */
  private getNodeTypeCategory(nodeType: string): string {
    if (nodeType === 'start') return 'start'
    if (nodeType === 'end') return 'end'
    return 'processing'
  }
  
  /**
   * 计算通用工作流布局（保持原有逻辑）
   */
  private calculateWorkflowLayout(nodesByType: Map<string, any[]>): Map<string, NodePosition> {
    const positions = new Map<string, NodePosition>()
    const { nodeSpacing, layerSpacing } = this.layoutConfig
    
    let currentX = 100 // 起始X位置
    const startY = 100 // 起始Y位置
    
    // 按层级顺序布局：INPUT -> PROCESSING -> OUTPUT
    const layerOrder = ['INPUT', 'PROCESSING', 'OUTPUT']
    
    for (const nodeType of layerOrder) {
      const nodesInLayer = nodesByType.get(nodeType) || []
      
      if (nodesInLayer.length === 0) {
        continue
      }
      
      // 计算该层节点的Y位置 - 确保同层节点完全对齐
      const layerY = startY // 同层所有节点使用相同的Y坐标
      
      // 为该层的每个节点分配位置
      for (let i = 0; i < nodesInLayer.length; i++) {
        const node = nodesInLayer[i]
        const calculatedPosition = {
          x: currentX + (i * nodeSpacing), // 水平排列同层节点
          y: layerY // 同层节点使用相同的Y坐标
        }
        
        positions.set(node.id, this.validateAndCorrectPosition(
          calculatedPosition, 
          node, 
          nodeType, 
          layerOrder.indexOf(nodeType)
        ))
      }
      
      // 移动到下一层
      currentX += layerSpacing
    }
    
    // 对所有位置进行最终坐标一致性检查
    this.validateLayoutCoordinates(positions)
    
    return positions
  }
  
  /**
   * 验证和修正节点位置
   */
  private validateAndCorrectPosition(
    position: NodePosition, 
    node: any, 
    nodeType: string, 
    layerIndex: number
  ): NodePosition {
    try {
      // 使用坐标管理器验证和修正位置
      const validatedPosition = this.coordinateManager.validateCoordinateTransform(position)
      
      // 如果验证失败，使用布局位置修正机制
      if (typeof validatedPosition === 'boolean') {
        return validatedPosition 
          ? position
          : this.coordinateManager.correctLayoutPosition(
              position,
              { nodeType, layerIndex }
            )
      } else {
        return validatedPosition.isValid 
          ? validatedPosition.position
          : this.coordinateManager.correctLayoutPosition(
              position,
              { nodeType, layerIndex }
            )
      }
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Validate and correct position failed'), {
        component: 'LayoutModeManager',
        action: 'validateAndCorrectPosition'
      })
      return position
    }
  }

  /**
   * 检查是否允许手动拖拽
   */
  public isManualDragEnabled(): boolean {
    return this.currentMode === 'manual'
  }

  /**
   * 保存手动布局位置
   */
  public saveManualPosition(nodeId: string, position: NodePosition): void {
    try {
      this.cacheManager.set(
        `manual_position_${nodeId}`,
        position,
        { ttl: 24 * 60 * 60 * 1000 } // 24小时缓存
      )
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Save manual position failed'), {
        component: 'LayoutModeManager',
        action: 'saveManualPosition'
      })
    }
  }

  /**
   * 恢复手动布局位置
   */
  public restoreManualPosition(nodeId: string): NodePosition | null {
    try {
      return this.cacheManager.get(`manual_position_${nodeId}`) || null
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Restore manual position failed'), {
        component: 'LayoutModeManager',
        action: 'restoreManualPosition'
      })
      return null
    }
  }

  /**
   * 获取当前布局模式
   */
  public getCurrentMode(): LayoutMode {
    return this.currentMode
  }

  /**
   * 检查是否为统一布局模式
   */
  public isUnifiedMode(): boolean {
    return this.currentMode === 'unified'
  }

  /**
   * 获取布局配置
   */
  public getLayoutConfig(): LayoutConfig {
    return { ...this.layoutConfig }
  }

  /**
   * 更新布局配置
   */
  public updateLayoutConfig(config: Partial<Omit<LayoutConfig, 'mode'>>): boolean {
    try {
      this.layoutConfig = {
        ...this.layoutConfig,
        ...config
      }
      return true
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Update layout config failed'), {
        component: 'LayoutModeManager',
        action: 'updateLayoutConfig'
      })
      return false
    }
  }

  /**
   * 验证布局坐标
   */
  public validateLayoutCoordinates(positions: Map<string, NodePosition>): boolean {
    try {
      for (const [nodeId, position] of positions) {
        // 验证逻辑坐标到DOM坐标的转换
        const domPosition = this.coordinateManager.logicalToDOM(position)
        
        // 验证DOM坐标到逻辑坐标的转换
        const backToLogical = this.coordinateManager.DOMToLogical(domPosition)
        
        // 检查转换的一致性（允许小误差）
        const tolerance = 1
        if (Math.abs(backToLogical.x - position.x) > tolerance || 
            Math.abs(backToLogical.y - position.y) > tolerance) {
          return false
        }
        
        // 使用原有的坐标验证
        const validationResult = this.coordinateManager.validateCoordinateTransform(position)
        if (typeof validationResult === 'boolean') {
          if (!validationResult) {
            return false
          }
        } else {
          if (!validationResult.isValid) {
            return false
          }
        }
      }
      return true
    } catch (error) {
      this.errorHandler.handleError(
        error instanceof Error ? error : new Error('Validate layout coordinates failed'),
        { component: 'LayoutModeManager', method: 'validateLayoutCoordinates' }
      )
      return false
    }
  }

  /**
   * 验证节点位置
   */
  public validateNodePosition(node: any): boolean {
    try {
      if (!node || !node.position) {
        return false
      }
      
      const position = node.position
      
      // 检查坐标是否为有效数字
      if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        return false
      }
      
      // 检查坐标是否为NaN或无穷大
      if (isNaN(position.x) || isNaN(position.y) || 
          !isFinite(position.x) || !isFinite(position.y)) {
        return false
      }
      
      // 检查坐标是否为负数（不允许负坐标）
      if (position.x < 0 || position.y < 0) {
        return false
      }
      
      // 检查坐标是否在合理范围内
      const maxCoordinate = 10000
      if (position.x > maxCoordinate || position.y > maxCoordinate) {
        return false
      }
      
      return true
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Validate node position failed'), {
        component: 'LayoutModeManager',
        action: 'validateNodePosition'
      })
      return false
    }
  }

  /**
   * 销毁管理器，清理资源
   */
  public destroy(): void {
    try {
      // 移除事件监听器
      for (const [eventName, handler] of this.eventListeners) {
        this.graph.off(eventName, handler)
      }
      
      this.eventListeners.clear()
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error('Destroy layout manager failed'), {
        component: 'LayoutModeManager',
        action: 'destroy'
      })
    }
  }
}