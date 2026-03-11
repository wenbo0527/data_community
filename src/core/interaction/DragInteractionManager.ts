import { UnifiedEventBus } from '../UnifiedEventBus'
import { UnifiedCacheManager } from '../UnifiedCacheManager'
import { ErrorHandler } from '../ErrorHandler'
import { NodeConnectionOptimizer } from './NodeConnectionOptimizer'
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager'

/**
 * 拖拽交互管理器
 * 负责处理节点拖拽、吸附、预览线连接等交互功能
 */
export class DragInteractionManager {
  private graph: any
  private eventBus: UnifiedEventBus
  private cacheManager: UnifiedCacheManager
  private errorHandler: ErrorHandler
  private connectionOptimizer: NodeConnectionOptimizer
  private coordinateManager: CoordinateSystemManager
  
  // 拖拽状态
  private isDraggingState: boolean = false
  private draggedNodeId: string | null = null
  private dragStartPosition: { x: number; y: number } | null = null
  
  // 吸附配置
  private readonly SNAP_THRESHOLD = 30 // 30像素吸附阈值
  
  // 事件监听器引用
  private eventListeners: Map<string, Function> = new Map()

  constructor(
    graph: any,
    eventBus: UnifiedEventBus,
    cacheManager: UnifiedCacheManager,
    errorHandler: ErrorHandler,
    connectionOptimizer: NodeConnectionOptimizer,
    coordinateManager: CoordinateSystemManager
  ) {
    this.graph = graph
    this.eventBus = eventBus
    this.cacheManager = cacheManager
    this.errorHandler = errorHandler
    this.connectionOptimizer = connectionOptimizer
    this.coordinateManager = coordinateManager
    
    this.initializeEventListeners()
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    try {
      const mouseDownHandler = this.handleMouseDown.bind(this)
      const mouseMoveHandler = this.handleMouseMove.bind(this)
      const mouseUpHandler = this.handleMouseUp.bind(this)
      
      this.eventListeners.set('node:mousedown', mouseDownHandler)
      this.eventListeners.set('node:mousemove', mouseMoveHandler)
      this.eventListeners.set('node:mouseup', mouseUpHandler)
      
      this.graph.on('node:mousedown', mouseDownHandler)
      this.graph.on('node:mousemove', mouseMoveHandler)
      this.graph.on('node:mouseup', mouseUpHandler)
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.initializeEventListeners' })
    }
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(event: any): void {
    try {
      const nodeId = event.node?.id
      const position = event.node ? this.graph.getPosition(nodeId) : { x: event.x, y: event.y }
      
      if (nodeId) {
        this.startDrag(nodeId, position)
      }
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.handleMouseDown' })
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(event: any): void {
    try {
      if (this.isDraggingState && this.draggedNodeId) {
        const newPosition = { x: event.x, y: event.y }
        this.updateDragPosition(newPosition)
        
        // 检查吸附目标
        const snapTarget = this.findSnapTarget(this.draggedNodeId, newPosition)
        if (snapTarget) {
          this.createPreviewConnection(snapTarget.nodeId)
        } else {
          this.clearPreviewConnections()
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.handleMouseMove' })
    }
  }

  /**
   * 处理鼠标释放事件
   */
  private handleMouseUp(event: any): void {
    try {
      if (this.isDraggingState) {
        const endPosition = { x: event.x, y: event.y }
        this.endDrag(endPosition)
      }
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.handleMouseUp' })
    }
  }

  /**
   * 开始拖拽
   */
  public startDrag(nodeId: string, position: { x: number; y: number }): boolean {
    try {
      // 验证节点存在
      const node = this.graph.getCellById(nodeId)
      if (!node) {
        return false
      }
      
      this.isDraggingState = true
      this.draggedNodeId = nodeId
      this.dragStartPosition = { ...position }
      
      // 发布拖拽开始事件
      this.eventBus.emit('drag:start', {
        nodeId,
        position
      })
      
      return true
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.startDrag' })
      return false
    }
  }

  /**
   * 更新拖拽位置
   */
  public updateDragPosition(position: { x: number; y: number }): void {
    try {
      if (!this.isDraggingState || !this.draggedNodeId) {
        return
      }
      
      // 使用坐标转换确保位置准确性
      const correctedPosition = this.coordinateManager.correctDragHintPosition(
        this.draggedNodeId,
        position,
        this.graph.getBBox(this.draggedNodeId)
      )
      
      // 更新节点位置
      this.graph.setPosition(this.draggedNodeId, correctedPosition)
      
      // 发布拖拽更新事件
      this.eventBus.emit('drag:update', {
        nodeId: this.draggedNodeId,
        position: correctedPosition,
        startPosition: this.dragStartPosition
      })
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.updateDragPosition' })
    }
  }

  /**
   * 结束拖拽
   */
  public endDrag(endPosition: { x: number; y: number }): void {
    try {
      if (!this.isDraggingState || !this.draggedNodeId) {
        return
      }
      
      const nodeId = this.draggedNodeId
      const startPosition = this.dragStartPosition
      
      // 清除预览线连接
      this.clearPreviewConnections()
      
      // 重置拖拽状态
      this.isDraggingState = false
      this.draggedNodeId = null
      this.dragStartPosition = null
      
      // 发布拖拽结束事件
      this.eventBus.emit('drag:end', {
        nodeId,
        startPosition,
        endPosition
      })
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.endDrag' })
    }
  }

  /**
   * 查找吸附目标
   */
  public findSnapTarget(
    draggedNodeId: string,
    dragPosition: { x: number; y: number }
  ): { nodeId: string; position: { x: number; y: number }; distance: number } | null {
    try {
      const nodes = this.graph.getNodes()
      let closestTarget: { nodeId: string; position: { x: number; y: number }; distance: number } | null = null
      let minDistance = Infinity
      
      // 转换拖拽位置到DOM坐标进行精确计算
      const domDragPos = this.coordinateManager.logicalToDOM(dragPosition)
      
      for (const node of nodes) {
        if (node.id === draggedNodeId) {
          continue
        }
        
        // 获取节点的实际DOM中心位置
        const nodeCenter = this.coordinateManager.getNodeDOMCenter(node.id)
        if (!nodeCenter) continue
        
        const distance = Math.sqrt(
          Math.pow(domDragPos.x - nodeCenter.x, 2) +
          Math.pow(domDragPos.y - nodeCenter.y, 2)
        )
        
        // 只有在吸附阈值内且距离更近时才更新
        if (distance <= this.SNAP_THRESHOLD && distance < minDistance) {
          minDistance = distance
          // 转换回逻辑坐标
          const logicalCenter = this.coordinateManager.DOMToLogical(nodeCenter)
          closestTarget = {
            nodeId: node.id,
            position: logicalCenter,
            distance
          }
        }
      }
      
      return closestTarget
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.findSnapTarget' })
      return null
    }
  }

  /**
   * 应用吸附位置
   */
  public applySnapPosition(nodeId: string, snapPosition: { x: number; y: number }): void {
    try {
      this.graph.setPosition(nodeId, snapPosition)
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.applySnapPosition' })
    }
  }

  /**
   * 创建预览线连接
   */
  public createPreviewConnection(targetNodeId: string): boolean {
    try {
      if (!this.draggedNodeId) {
        return false
      }
      
      return this.connectionOptimizer.createPreviewConnection(
        this.draggedNodeId,
        targetNodeId,
        'output',
        'input'
      )
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.createPreviewConnection' })
      return false
    }
  }

  /**
   * 清除预览线连接
   */
  public clearPreviewConnections(): void {
    try {
      this.connectionOptimizer.clearAllPreviewConnections()
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.clearPreviewConnections' })
    }
  }

  /**
   * 获取拖拽状态
   */
  public isDragging(): boolean {
    return this.isDraggingState
  }

  /**
   * 获取被拖拽的节点ID
   */
  public getDraggedNodeId(): string | null {
    return this.draggedNodeId
  }

  /**
   * 获取拖拽开始位置
   */
  public getDragStartPosition(): { x: number; y: number } | null {
    return this.dragStartPosition ? { ...this.dragStartPosition } : null
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    try {
      // 移除事件监听器
      for (const [eventName, handler] of this.eventListeners) {
        this.graph.off(eventName, handler)
      }
      this.eventListeners.clear()
      
      // 清除拖拽状态
      this.isDraggingState = false
      this.draggedNodeId = null
      this.dragStartPosition = null
      
      // 清除预览线连接
      this.clearPreviewConnections()
    } catch (error) {
      this.errorHandler.handleError(error, { context: 'DragInteractionManager.destroy' })
    }
  }
}