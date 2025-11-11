import { canvasEventBus } from './CanvasEventBus'
import { CanvasEventTypes, isValidEventType } from './CanvasEventTypes'
import { eventTypeValidator } from './EventTypeValidator'
import { KeyboardEventHandler } from './KeyboardEventHandler'
import { MouseEventHandler } from './MouseEventHandler'
import type { MouseEventConfig } from './MouseEventHandler'

export interface CanvasEventManagerConfig {
  enableKeyboard?: boolean
  enableMouse?: boolean
  enableDebug?: boolean
  enablePerformance?: boolean
  enableValidation?: boolean
  keyboardConfig?: any
  mouseConfig?: MouseEventConfig
}

export interface EventStats {
  totalEvents: number
  eventsByType: Record<string, number>
  errors: number
  warnings: number
  lastEventTime: number
  averageProcessingTime: number
}

export interface CanvasState {
  nodes: any[]
  connections: any[]
  selectedNodes: any[]
  zoom: number
  pan: { x: number; y: number }
  mode: string
  history: any[]
}

export class CanvasEventManager {
  private keyboardHandler: KeyboardEventHandler | null = null
  private mouseHandler: MouseEventHandler | null = null
  private enabled: boolean = true
  private debug: boolean = false
  private performance: boolean = false
  private validation: boolean = true
  
  private eventStats: EventStats = {
    totalEvents: 0,
    eventsByType: {},
    errors: 0,
    warnings: 0,
    lastEventTime: 0,
    averageProcessingTime: 0
  }
  
  private canvasState: CanvasState = {
    nodes: [],
    connections: [],
    selectedNodes: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    mode: 'default',
    history: []
  }
  
  private eventListeners: Map<string, Function[]> = new Map()
  private performanceMetrics: Map<string, number[]> = new Map()
  
  constructor(config: CanvasEventManagerConfig = {}) {
    this.enabled = true
    this.debug = config.enableDebug ?? false
    this.performance = config.enablePerformance ?? false
    this.validation = config.enableValidation ?? true
    
    this.initializeHandlers(config)
    this.setupEventListeners()
    this.publishInitializationEvent()
  }

  private initializeHandlers(config: CanvasEventManagerConfig): void {
    // 初始化键盘事件处理器
    if (config.enableKeyboard !== false) {
      this.keyboardHandler = new KeyboardEventHandler(config.keyboardConfig)
      this.setupKeyboardShortcuts()
    }
    
    // 初始化鼠标事件处理器
    if (config.enableMouse !== false) {
      this.mouseHandler = new MouseEventHandler(config.mouseConfig)
      this.setupMouseHandlers()
    }
  }

  private setupKeyboardShortcuts(): void {
    if (!this.keyboardHandler) return

    // 监听键盘事件并转换为画布操作
    canvasEventBus.on(CanvasEventTypes.KEYBOARD.DELETE_PRESSED, () => {
      this.handleDeleteOperation()
    })

    canvasEventBus.on(CanvasEventTypes.KEYBOARD.UNDO_PRESSED, () => {
      this.handleUndoOperation()
    })

    canvasEventBus.on(CanvasEventTypes.KEYBOARD.REDO_PRESSED, () => {
      this.handleRedoOperation()
    })

    canvasEventBus.on(CanvasEventTypes.KEYBOARD.SELECT_ALL_PRESSED, () => {
      this.handleSelectAllOperation()
    })

    canvasEventBus.on(CanvasEventTypes.KEYBOARD.COPY_PRESSED, () => {
      this.handleCopyOperation()
    })

    canvasEventBus.on(CanvasEventTypes.KEYBOARD.PASTE_PRESSED, () => {
      this.handlePasteOperation()
    })

    canvasEventBus.on(CanvasEventTypes.KEYBOARD.DEBUG_PRESSED, () => {
      this.handleDebugOperation()
    })
  }

  private setupMouseHandlers(): void {
    if (!this.mouseHandler) return

    // 设置鼠标拖拽处理
    this.mouseHandler.onDrag('canvas-drag', {
      start: (eventData) => {
        this.handleDragStart(eventData)
      },
      move: (eventData) => {
        this.handleDragMove(eventData)
      },
      end: (eventData) => {
        this.handleDragEnd(eventData)
      }
    })

    // 监听鼠标事件
    canvasEventBus.on(CanvasEventTypes.MOUSE.CLICK, (data) => {
      this.handleMouseClick(data)
    })

    canvasEventBus.on(CanvasEventTypes.MOUSE.DBL_CLICK, (data) => {
      this.handleMouseDblClick(data)
    })
  }

  private setupEventListeners(): void {
    // 监听所有画布相关事件
    const eventTypes = Object.values(CanvasEventTypes)
    
    for (const category of Object.values(eventTypes)) {
      if (typeof category === 'object') {
        for (const eventType of Object.values(category)) {
          this.setupEventListener(eventType)
        }
      }
    }
  }

  private setupEventListener(eventType: string): void {
    canvasEventBus.on(eventType, (data) => {
      this.handleEvent(eventType, data)
    })
  }

  private handleEvent(eventType: string, data: any): void {
    if (!this.enabled) return

    const startTime = this.performance ? performance.now() : 0

    try {
      // 事件验证
      if (this.validation && !eventTypeValidator.validateEvent(eventType, data)) {
        this.logWarning(`事件验证失败: ${eventType}`)
        return
      }

      // 更新统计信息
      this.updateEventStats(eventType, startTime)

      // 执行注册的监听器
      this.executeEventListeners(eventType, data)

      // 调试日志
      if (this.debug) {
        this.logDebug(`事件处理完成: ${eventType}`, data)
      }

    } catch (error) {
      this.handleEventError(eventType, error, data)
    }
  }

  private updateEventStats(eventType: string, startTime: number): void {
    this.eventStats.totalEvents++
    this.eventStats.eventsByType[eventType] = (this.eventStats.eventsByType[eventType] || 0) + 1
    this.eventStats.lastEventTime = Date.now()

    if (this.performance && startTime > 0) {
      const processingTime = performance.now() - startTime
      const metrics = this.performanceMetrics.get(eventType) || []
      metrics.push(processingTime)
      
      // 保持最近100个度量
      if (metrics.length > 100) {
        metrics.shift()
      }
      
      this.performanceMetrics.set(eventType, metrics)
      
      // 更新平均处理时间
      const totalTime = metrics.reduce((sum, time) => sum + time, 0)
      this.eventStats.averageProcessingTime = totalTime / metrics.length
    }
  }

  private executeEventListeners(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          this.logError(`事件监听器执行失败: ${eventType}`, error)
        }
      })
    }
  }

  private handleEventError(eventType: string, error: any, data: any): void {
    this.eventStats.errors++
    this.logError(`事件处理失败: ${eventType}`, error)
    
    canvasEventBus.emit(CanvasEventTypes.ERROR.EVENT_PROCESSING_FAILED, {
      eventType,
      error: error instanceof Error ? error.message : String(error),
      data,
      timestamp: Date.now()
    })
  }

  // 画布操作处理
  private handleDeleteOperation(): void {
    if (this.canvasState.selectedNodes.length === 0) return

    canvasEventBus.emit(CanvasEventTypes.CANVAS.DELETE_NODES_REQUESTED, {
      nodes: this.canvasState.selectedNodes,
      timestamp: Date.now()
    })
  }

  private handleUndoOperation(): void {
    canvasEventBus.emit(CanvasEventTypes.HISTORY.UNDO_REQUESTED, {
      timestamp: Date.now()
    })
  }

  private handleRedoOperation(): void {
    canvasEventBus.emit(CanvasEventTypes.HISTORY.REDO_REQUESTED, {
      timestamp: Date.now()
    })
  }

  private handleSelectAllOperation(): void {
    canvasEventBus.emit(CanvasEventTypes.SELECTION.SELECT_ALL_REQUESTED, {
      timestamp: Date.now()
    })
  }

  private handleCopyOperation(): void {
    canvasEventBus.emit(CanvasEventTypes.DATA.COPY_REQUESTED, {
      nodes: this.canvasState.selectedNodes,
      timestamp: Date.now()
    })
  }

  private handlePasteOperation(): void {
    canvasEventBus.emit(CanvasEventTypes.DATA.PASTE_REQUESTED, {
      timestamp: Date.now()
    })
  }

  private handleDebugOperation(): void {
    this.debug = !this.debug
    this.logInfo(`调试模式: ${this.debug ? '开启' : '关闭'}`)
    
    canvasEventBus.emit(CanvasEventTypes.DEBUG.TOGGLED, {
      enabled: this.debug,
      timestamp: Date.now()
    })
  }

  private handleDragStart(eventData: any): void {
    const safeEventData = this.sanitizeMouseEventData(eventData)
    canvasEventBus.emit(CanvasEventTypes.CANVAS.DRAG_START, {
      eventData: safeEventData,
      timestamp: Date.now()
    })
  }

  private handleDragMove(eventData: any): void {
    const safeEventData = this.sanitizeMouseEventData(eventData)
    canvasEventBus.emit(CanvasEventTypes.CANVAS.DRAG_MOVE, {
      eventData: safeEventData,
      timestamp: Date.now()
    })
  }

  private handleDragEnd(eventData: any): void {
    const safeEventData = this.sanitizeMouseEventData(eventData)
    canvasEventBus.emit(CanvasEventTypes.CANVAS.DRAG_END, {
      eventData: safeEventData,
      timestamp: Date.now()
    })
  }

  private handleMouseClick(data: any): void {
    // 处理鼠标点击事件
    this.logDebug('鼠标点击', data)
  }

  private handleMouseDblClick(data: any): void {
    // 处理鼠标双击事件
    this.logDebug('鼠标双击', data)
  }

  // 公共API
  on(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    
    this.eventListeners.get(eventType)!.push(listener)
  }

  off(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(eventType: string, data: any): void {
    canvasEventBus.emit(eventType, data)
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    
    if (this.keyboardHandler) {
      this.keyboardHandler.setEnabled(enabled)
    }
    
    if (this.mouseHandler) {
      this.mouseHandler.setEnabled(enabled)
    }
    
    this.logInfo(`事件管理器: ${enabled ? '启用' : '禁用'}`)
  }

  setDebugMode(enabled: boolean): void {
    this.debug = enabled
    canvasEventBus.setDebugMode(enabled)
    this.logInfo(`调试模式: ${enabled ? '开启' : '关闭'}`)
  }

  setPerformanceMode(enabled: boolean): void {
    this.performance = enabled
    this.logInfo(`性能监控: ${enabled ? '开启' : '关闭'}`)
  }

  updateCanvasState(updates: Partial<CanvasState>): void {
    this.canvasState = { ...this.canvasState, ...updates }
    
    canvasEventBus.emit(CanvasEventTypes.CANVAS.STATE_UPDATED, {
      state: this.canvasState,
      updates,
      timestamp: Date.now()
    })
  }

  getCanvasState(): CanvasState {
    return { ...this.canvasState }
  }

  getEventStats(): EventStats {
    return { ...this.eventStats }
  }

  getPerformanceMetrics(): Map<string, number[]> {
    return new Map(this.performanceMetrics)
  }

  // 日志方法
  private logDebug(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[CanvasEventManager] ${message}`, data || '')
    }
  }

  private logInfo(message: string): void {
    console.info(`[CanvasEventManager] ${message}`)
  }

  private logWarning(message: string): void {
    console.warn(`[CanvasEventManager] ${message}`)
    this.eventStats.warnings++
  }

  private logError(message: string, error: any): void {
    console.error(`[CanvasEventManager] ${message}`, error)
    this.eventStats.errors++
  }

  private publishInitializationEvent(): void {
    canvasEventBus.emit(CanvasEventTypes.CANVAS.MANAGER_INITIALIZED, {
      config: {
        enableKeyboard: !!this.keyboardHandler,
        enableMouse: !!this.mouseHandler,
        enableDebug: this.debug,
        enablePerformance: this.performance,
        enableValidation: this.validation
      },
      timestamp: Date.now()
    })
  }

  // 轻量化鼠标事件数据，移除不可序列化/庞大字段
  private sanitizeMouseEventData(eventData: any): Record<string, any> {
    if (!eventData || typeof eventData !== 'object') return eventData

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
      target: targetDescriptor,
      timestamp: eventData.timestamp,
      button: eventData.button,
      buttons: eventData.buttons,
      ctrlKey: eventData.ctrlKey,
      shiftKey: eventData.shiftKey,
      altKey: eventData.altKey,
      metaKey: eventData.metaKey
      // originalEvent 被移除
    }
  }

  // 清理和销毁
  clear(): void {
    this.eventListeners.clear()
    this.performanceMetrics.clear()
    
    if (this.keyboardHandler) {
      this.keyboardHandler.clear()
    }
    
    if (this.mouseHandler) {
      this.mouseHandler.clear()
    }
    
    this.eventStats = {
      totalEvents: 0,
      eventsByType: {},
      errors: 0,
      warnings: 0,
      lastEventTime: 0,
      averageProcessingTime: 0
    }
  }

  destroy(): void {
    this.clear()
    
    if (this.keyboardHandler) {
      this.keyboardHandler.destroy()
    }
    
    if (this.mouseHandler) {
      this.mouseHandler.destroy()
    }
    
    canvasEventBus.emit(CanvasEventTypes.CANVAS.MANAGER_DESTROYED, {
      timestamp: Date.now()
    })
  }
}

// 创建默认实例
export const canvasEventManager = new CanvasEventManager({
  enableKeyboard: true,
  enableMouse: true,
  enableDebug: false,
  enablePerformance: false,
  enableValidation: true
})

export default CanvasEventManager