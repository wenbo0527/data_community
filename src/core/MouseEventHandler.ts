import { canvasEventBus } from './CanvasEventBus'
import { CanvasEventTypes, isValidEventType } from './CanvasEventTypes'
import { eventTypeValidator } from './EventTypeValidator'

export interface MouseEventConfig {
  throttleDelay?: number
  debounceDelay?: number
  enabled?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
  capture?: boolean
}

export interface MouseEventData {
  type: string
  x: number
  y: number
  clientX: number
  clientY: number
  target: Element | null
  timestamp: number
  originalEvent: MouseEvent
  button?: number
  buttons?: number
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
}

export interface MouseClickHandler {
  (event: MouseEventData): void
}

export interface MouseMoveHandler {
  (event: MouseEventData): void
}

export interface MouseDragHandler {
  start: (event: MouseEventData) => void
  move: (event: MouseEventData) => void
  end: (event: MouseEventData) => void
}

export class MouseEventHandler {
  private enabled: boolean = true
  private throttleDelay: number = 16 // 60fps
  private debounceDelay: number = 0
  private preventDefault: boolean = false
  private stopPropagation: boolean = false
  private capture: boolean = false
  
  private clickHandlers: Map<string, MouseClickHandler> = new Map()
  private dblClickHandlers: Map<string, MouseClickHandler> = new Map()
  private mouseDownHandlers: Map<string, MouseClickHandler> = new Map()
  private mouseUpHandlers: Map<string, MouseClickHandler> = new Map()
  private mouseMoveHandlers: Map<string, MouseMoveHandler> = new Map()
  private mouseEnterHandlers: Map<string, MouseClickHandler> = new Map()
  private mouseLeaveHandlers: Map<string, MouseClickHandler> = new Map()
  private dragHandlers: Map<string, MouseDragHandler> = new Map()
  
  private throttleTimers: Map<string, number> = new Map()
  private debounceTimers: Map<string, number> = new Map()
  
  private isDragging: boolean = false
  private dragStartData: MouseEventData | null = null
  private currentDragHandler: string | null = null
  
  private boundMouseDownHandler: (event: MouseEvent) => void
  private boundMouseMoveHandler: (event: MouseEvent) => void
  private boundMouseUpHandler: (event: MouseEvent) => void
  private boundClickHandler: (event: MouseEvent) => void
  private boundDblClickHandler: (event: MouseEvent) => void
  private boundMouseEnterHandler: (event: MouseEvent) => void
  private boundMouseLeaveHandler: (event: MouseEvent) => void

  constructor(config: MouseEventConfig = {}) {
    this.throttleDelay = config.throttleDelay ?? 16
    this.debounceDelay = config.debounceDelay ?? 0
    this.enabled = config.enabled ?? true
    this.preventDefault = config.preventDefault ?? false
    this.stopPropagation = config.stopPropagation ?? false
    this.capture = config.capture ?? false
    
    this.boundMouseDownHandler = this.handleMouseDown.bind(this)
    this.boundMouseMoveHandler = this.handleMouseMove.bind(this)
    this.boundMouseUpHandler = this.handleMouseUp.bind(this)
    this.boundClickHandler = this.handleClick.bind(this)
    this.boundDblClickHandler = this.handleDblClick.bind(this)
    this.boundMouseEnterHandler = this.handleMouseEnter.bind(this)
    this.boundMouseLeaveHandler = this.handleMouseLeave.bind(this)
    
    this.setupEventListeners()
    this.publishInitializationEvent()
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', this.boundMouseDownHandler, this.capture)
      document.addEventListener('mousemove', this.boundMouseMoveHandler, this.capture)
      document.addEventListener('mouseup', this.boundMouseUpHandler, this.capture)
      document.addEventListener('click', this.boundClickHandler, this.capture)
      document.addEventListener('dblclick', this.boundDblClickHandler, this.capture)
      document.addEventListener('mouseenter', this.boundMouseEnterHandler, this.capture)
      document.addEventListener('mouseleave', this.boundMouseLeaveHandler, this.capture)
    }
  }

  private publishInitializationEvent(): void {
    canvasEventBus.emit(CanvasEventTypes.MOUSE.INITIALIZED, {
      config: {
        throttleDelay: this.throttleDelay,
        debounceDelay: this.debounceDelay,
        enabled: this.enabled,
        preventDefault: this.preventDefault,
        stopPropagation: this.stopPropagation,
        capture: this.capture
      },
      timestamp: Date.now()
    })
  }

  private createMouseEventData(event: MouseEvent, type: string): MouseEventData {
    return {
      type,
      x: event.pageX,
      y: event.pageY,
      clientX: event.clientX,
      clientY: event.clientY,
      target: event.target as Element,
      timestamp: Date.now(),
      originalEvent: event,
      button: event.button,
      buttons: event.buttons,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.enabled) return

    const eventData = this.createMouseEventData(event, 'mousedown')
    
    if (this.preventDefault) {
      event.preventDefault()
    }
    
    if (this.stopPropagation) {
      event.stopPropagation()
    }

    // 检查拖拽处理程序
    for (const [id, handler] of this.dragHandlers) {
      if (this.shouldHandleDrag(eventData, id)) {
        this.startDrag(eventData, id, handler)
        break
      }
    }

    // 执行鼠标按下处理程序
    this.executeHandlers(this.mouseDownHandlers, eventData, CanvasEventTypes.MOUSE.DOWN)
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.enabled) return

    const eventData = this.createMouseEventData(event, 'mousemove')
    
    if (this.preventDefault) {
      event.preventDefault()
    }
    
    if (this.stopPropagation) {
      event.stopPropagation()
    }

    // 处理拖拽
    if (this.isDragging && this.dragStartData && this.currentDragHandler) {
      const handler = this.dragHandlers.get(this.currentDragHandler)
      if (handler) {
        this.executeDragHandler(handler.move, eventData, 'drag-move')
      }
    }

    // 执行鼠标移动处理程序（带节流）
    this.executeThrottledHandlers(this.mouseMoveHandlers, eventData, CanvasEventTypes.MOUSE.MOVE)
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this.enabled) return

    const eventData = this.createMouseEventData(event, 'mouseup')
    
    if (this.preventDefault) {
      event.preventDefault()
    }
    
    if (this.stopPropagation) {
      event.stopPropagation()
    }

    // 结束拖拽
    if (this.isDragging && this.dragStartData && this.currentDragHandler) {
      const handler = this.dragHandlers.get(this.currentDragHandler)
      if (handler) {
        this.executeDragHandler(handler.end, eventData, 'drag-end')
      }
      this.endDrag()
    }

    // 执行鼠标释放处理程序
    this.executeHandlers(this.mouseUpHandlers, eventData, CanvasEventTypes.MOUSE.UP)
  }

  private handleClick(event: MouseEvent): void {
    if (!this.enabled) return

    const eventData = this.createMouseEventData(event, 'click')
    
    if (this.preventDefault) {
      event.preventDefault()
    }
    
    if (this.stopPropagation) {
      event.stopPropagation()
    }

    this.executeHandlers(this.clickHandlers, eventData, CanvasEventTypes.MOUSE.CLICK)
  }

  private handleDblClick(event: MouseEvent): void {
    if (!this.enabled) return

    const eventData = this.createMouseEventData(event, 'dblclick')
    
    if (this.preventDefault) {
      event.preventDefault()
    }
    
    if (this.stopPropagation) {
      event.stopPropagation()
    }

    this.executeHandlers(this.dblClickHandlers, eventData, CanvasEventTypes.MOUSE.DBL_CLICK)
  }

  private handleMouseEnter(event: MouseEvent): void {
    if (!this.enabled) return

    const eventData = this.createMouseEventData(event, 'mouseenter')
    
    this.executeHandlers(this.mouseEnterHandlers, eventData, CanvasEventTypes.MOUSE.ENTER)
  }

  private handleMouseLeave(event: MouseEvent): void {
    if (!this.enabled) return

    const eventData = this.createMouseEventData(event, 'mouseleave')
    
    this.executeHandlers(this.mouseLeaveHandlers, eventData, CanvasEventTypes.MOUSE.LEAVE)
  }

  private shouldHandleDrag(eventData: MouseEventData, handlerId: string): boolean {
    // 这里可以添加拖拽条件判断逻辑
    // 比如检查目标元素是否匹配特定的选择器
    return true
  }

  private startDrag(eventData: MouseEventData, handlerId: string, handler: MouseDragHandler): void {
    this.isDragging = true
    this.dragStartData = eventData
    this.currentDragHandler = handlerId
    
    this.executeDragHandler(handler.start, eventData, 'drag-start')
    
    canvasEventBus.emit(CanvasEventTypes.MOUSE.DRAG_START, {
      handlerId,
      startData: this.sanitizeEventData(eventData),
      timestamp: Date.now()
    })
  }

  private endDrag(): void {
    this.isDragging = false
    this.dragStartData = null
    this.currentDragHandler = null
    
    canvasEventBus.emit(CanvasEventTypes.MOUSE.DRAG_END, {
      timestamp: Date.now()
    })
  }

  private executeDragHandler(handler: Function, eventData: MouseEventData, type: string): void {
    try {
      handler(eventData)
    } catch (error) {
      console.error(`[MouseEventHandler] 拖拽处理程序执行失败: ${type}`, error)
      
      canvasEventBus.emit(CanvasEventTypes.MOUSE.DRAG_FAILED, {
        type,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      })
    }
  }

  private executeHandlers(handlers: Map<string, Function>, eventData: MouseEventData, eventType: string): void {
    const safeEventData = this.sanitizeEventData(eventData)
    for (const [id, handler] of handlers) {
      try {
        if (!eventTypeValidator.validateEvent(eventType, safeEventData)) {
          console.warn(`[MouseEventHandler] 事件验证失败: ${eventType}`)
          continue
        }

        handler(eventData)
        
        canvasEventBus.emit(eventType, {
          handlerId: id,
          eventData: safeEventData,
          timestamp: Date.now()
        })
        
      } catch (error) {
        console.error(`[MouseEventHandler] 处理程序执行失败: ${id}`, error)
        
        canvasEventBus.emit(CanvasEventTypes.MOUSE.HANDLER_FAILED, {
          handlerId: id,
          eventType,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        })
      }
    }
  }

  private executeThrottledHandlers(handlers: Map<string, Function>, eventData: MouseEventData, eventType: string): void {
    if (this.throttleDelay <= 0) {
      this.executeHandlers(handlers, eventData, eventType)
      return
    }

    const timerId = `throttle-${eventType}`
    const existingTimer = this.throttleTimers.get(timerId)
    
    if (existingTimer) {
      return // 节流中，跳过执行
    }
    
    this.executeHandlers(handlers, eventData, eventType)
    
    const timer = window.setTimeout(() => {
      this.throttleTimers.delete(timerId)
    }, this.throttleDelay)
    
    this.throttleTimers.set(timerId, timer)
  }

  // 公共API
  onClick(id: string, handler: MouseClickHandler): void {
    this.clickHandlers.set(id, handler)
  }

  onDblClick(id: string, handler: MouseClickHandler): void {
    this.dblClickHandlers.set(id, handler)
  }

  onMouseDown(id: string, handler: MouseClickHandler): void {
    this.mouseDownHandlers.set(id, handler)
  }

  onMouseUp(id: string, handler: MouseClickHandler): void {
    this.mouseUpHandlers.set(id, handler)
  }

  onMouseMove(id: string, handler: MouseMoveHandler): void {
    this.mouseMoveHandlers.set(id, handler)
  }

  onMouseEnter(id: string, handler: MouseClickHandler): void {
    this.mouseEnterHandlers.set(id, handler)
  }

  onMouseLeave(id: string, handler: MouseClickHandler): void {
    this.mouseLeaveHandlers.set(id, handler)
  }

  onDrag(id: string, handler: MouseDragHandler): void {
    this.dragHandlers.set(id, handler)
  }

  off(eventType: string, id: string): void {
    const handlersMap = this.getHandlersMap(eventType)
    if (handlersMap) {
      handlersMap.delete(id)
      
      canvasEventBus.emit(CanvasEventTypes.MOUSE.HANDLER_REMOVED, {
        eventType,
        handlerId: id,
        timestamp: Date.now()
      })
    }
  }

  private getHandlersMap(eventType: string): Map<string, Function> | null {
    switch (eventType) {
      case 'click': return this.clickHandlers
      case 'dblclick': return this.dblClickHandlers
      case 'mousedown': return this.mouseDownHandlers
      case 'mouseup': return this.mouseUpHandlers
      case 'mousemove': return this.mouseMoveHandlers
      case 'mouseenter': return this.mouseEnterHandlers
      case 'mouseleave': return this.mouseLeaveHandlers
      case 'drag': return this.dragHandlers
      default: return null
    }
  }

  // 事件数据轻量化，去除不可序列化/体积庞大字段
  private sanitizeEventData(eventData: MouseEventData): Record<string, any> {
    const target = eventData.target as Element | null
    const targetDescriptor = target ? {
      tag: target.tagName,
      id: (target as HTMLElement).id || undefined,
      class: (target as HTMLElement).className || undefined
    } : null

    return {
      type: eventData.type,
      x: eventData.x,
      y: eventData.y,
      clientX: eventData.clientX,
      clientY: eventData.clientY,
      // 仅保留轻量化目标描述，避免序列化完整 DOM
      target: targetDescriptor,
      timestamp: eventData.timestamp,
      button: eventData.button,
      buttons: eventData.buttons,
      ctrlKey: eventData.ctrlKey,
      shiftKey: eventData.shiftKey,
      altKey: eventData.altKey,
      metaKey: eventData.metaKey
      // originalEvent 被移除以避免序列化失败
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    
    canvasEventBus.emit(CanvasEventTypes.MOUSE.STATE_CHANGED, {
      enabled,
      timestamp: Date.now()
    })
  }

  setThrottleDelay(delay: number): void {
    this.throttleDelay = delay
  }

  setDebounceDelay(delay: number): void {
    this.debounceDelay = delay
  }

  isEnabled(): boolean {
    return this.enabled
  }

  // 当前拖拽状态查询（避免与字段同名导致重复成员）
  getIsDragging(): boolean {
    return this.isDragging
  }

  getDragStartData(): MouseEventData | null {
    return this.dragStartData
  }

  clear(): void {
    this.clickHandlers.clear()
    this.dblClickHandlers.clear()
    this.mouseDownHandlers.clear()
    this.mouseUpHandlers.clear()
    this.mouseMoveHandlers.clear()
    this.mouseEnterHandlers.clear()
    this.mouseLeaveHandlers.clear()
    this.dragHandlers.clear()
    
    this.clearTimers()
    
    canvasEventBus.emit(CanvasEventTypes.MOUSE.CLEARED, {
      timestamp: Date.now()
    })
  }

  private clearTimers(): void {
    this.throttleTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.throttleTimers.clear()
    this.debounceTimers.clear()
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      document.removeEventListener('mousedown', this.boundMouseDownHandler, this.capture)
      document.removeEventListener('mousemove', this.boundMouseMoveHandler, this.capture)
      document.removeEventListener('mouseup', this.boundMouseUpHandler, this.capture)
      document.removeEventListener('click', this.boundClickHandler, this.capture)
      document.removeEventListener('dblclick', this.boundDblClickHandler, this.capture)
      document.removeEventListener('mouseenter', this.boundMouseEnterHandler, this.capture)
      document.removeEventListener('mouseleave', this.boundMouseLeaveHandler, this.capture)
    }
    
    this.clear()
    
    canvasEventBus.emit(CanvasEventTypes.MOUSE.DESTROYED, {
      timestamp: Date.now()
    })
  }
}

// 创建默认实例
export const mouseEventHandler = new MouseEventHandler({
  throttleDelay: 16, // 60fps
  debounceDelay: 0,
  enabled: true,
  preventDefault: false,
  stopPropagation: false,
  capture: false
})

export default MouseEventHandler