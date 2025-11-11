import { canvasEventBus } from './CanvasEventBus'
import { CanvasEventTypes } from './CanvasEventTypes'
import { canvasEventManager } from './CanvasEventManager'

export interface ServiceIntegrationConfig {
  enableLegacySupport?: boolean
  enableEventBridge?: boolean
  enableStateSync?: boolean
  enableErrorHandling?: boolean
  enableLogging?: boolean
}

export interface LegacyEventBridge {
  fromLegacy: (legacyEvent: any) => any
  toLegacy: (modernEvent: any) => any
}

export interface ServiceAdapter {
  name: string
  initialize: () => void
  destroy: () => void
  handleEvent: (event: any) => void
  syncState: (state: any) => void
}

/**
 * 画布服务集成管理器
 * 提供与现有服务的集成适配，支持新旧事件系统的桥接
 */
export class CanvasServiceIntegration {
  private adapters: Map<string, ServiceAdapter> = new Map()
  private legacyBridges: Map<string, LegacyEventBridge> = new Map()
  private legacyListeners: Map<string, Function> = new Map()
  private enabled: boolean = true
  private legacySupport: boolean = true
  private eventBridge: boolean = true
  private stateSync: boolean = true
  private errorHandling: boolean = true
  private logging: boolean = false

  constructor(config: ServiceIntegrationConfig = {}) {
    this.legacySupport = config.enableLegacySupport ?? true
    this.eventBridge = config.enableEventBridge ?? true
    this.stateSync = config.enableStateSync ?? true
    this.errorHandling = config.enableErrorHandling ?? true
    this.logging = config.enableLogging ?? false
    
    this.initializeLegacySupport()
    this.setupEventBridging()
    this.logInfo('服务集成管理器初始化完成')
  }

  /**
   * 初始化旧系统支持
   */
  private initializeLegacySupport(): void {
    if (!this.legacySupport) return

    // 创建window.eventBus的桥接
    if (typeof window !== 'undefined' && !window.eventBus) {
      window.eventBus = {
        emit: (event: string, data: any) => {
          this.bridgeLegacyEvent('emit', event, data)
        },
        on: (event: string, handler: Function) => {
          this.bridgeLegacyEvent('on', event, handler)
        },
        off: (event: string, handler: Function) => {
          this.bridgeLegacyEvent('off', event, handler)
        }
      }
      
      this.logInfo('Legacy window.eventBus 桥接已创建')
    }

    // 创建unifiedEventBus的桥接
    if (typeof window !== 'undefined' && !window.unifiedEventBus) {
      window.unifiedEventBus = {
        emit: (event: string, data: any) => {
          this.bridgeLegacyEvent('unified-emit', event, data)
        },
        on: (event: string, handler: Function) => {
          this.bridgeLegacyEvent('unified-on', event, handler)
        },
        off: (event: string, handler: Function) => {
          this.bridgeLegacyEvent('unified-off', event, handler)
        }
      }
      
      this.logInfo('Legacy window.unifiedEventBus 桥接已创建')
    }

    // 创建globalEventBus的桥接
    if (typeof window !== 'undefined' && !window.globalEventBus) {
      window.globalEventBus = {
        emit: (event: string, data: any) => {
          this.bridgeLegacyEvent('global-emit', event, data)
        },
        on: (event: string, handler: Function) => {
          this.bridgeLegacyEvent('global-on', event, handler)
        },
        off: (event: string, handler: Function) => {
          this.bridgeLegacyEvent('global-off', event, handler)
        }
      }
      
      this.logInfo('Legacy window.globalEventBus 桥接已创建')
    }
  }

  /**
   * 桥接旧事件系统
   */
  private bridgeLegacyEvent(type: string, event: string, data: any): void {
    try {
      this.logDebug(`桥接事件: ${type} -> ${event}`, data)
      
      switch (type) {
        case 'emit':
        case 'unified-emit':
        case 'global-emit':
          this.handleLegacyEmit(event, data)
          break
        case 'on':
        case 'unified-on':
        case 'global-on':
          this.handleLegacyOn(event, data)
          break
        case 'off':
        case 'unified-off':
        case 'global-off':
          this.handleLegacyOff(event, data)
          break
      }
    } catch (error) {
      this.logError(`桥接事件失败: ${type} -> ${event}`, error)
    }
  }

  /**
   * 处理旧系统的emit事件
   */
  private handleLegacyEmit(event: string, data: any): void {
    // 将旧事件映射到新事件类型
    const mappedEvent = this.mapLegacyEventToModern(event)
    if (mappedEvent) {
      canvasEventBus.emit(mappedEvent, {
        ...data,
        _legacySource: true,
        _originalEvent: event
      })
    } else {
      // 如果没有映射，直接转发
      canvasEventBus.emit(event, {
        ...data,
        _legacySource: true
      })
    }
  }

  /**
   * 处理旧系统的on事件
   */
  private handleLegacyOn(event: string, handler: Function): void {
    // 创建桥接监听器
    const bridgeHandler = (modernData: any) => {
      try {
        // 转换回旧格式
        const legacyData = this.mapModernEventToLegacy(event, modernData)
        handler(legacyData)
      } catch (error) {
        this.logError(`桥接监听器执行失败: ${event}`, error)
      }
    }
    
    this.legacyListeners.set(event, bridgeHandler)
    canvasEventBus.on(event, bridgeHandler)
  }

  /**
   * 处理旧系统的off事件
   */
  private handleLegacyOff(event: string, handler: Function): void {
    const bridgeHandler = this.legacyListeners.get(event)
    if (bridgeHandler) {
      canvasEventBus.off(event, bridgeHandler)
      this.legacyListeners.delete(event)
    }
  }

  /**
   * 设置事件桥接
   */
  private setupEventBridging(): void {
    if (!this.eventBridge) return

    // 监听新事件并桥接到旧系统
    canvasEventBus.on('*', (event: string, data: any) => {
      this.bridgeToLegacy(event, data)
    })
  }

  /**
   * 桥接到旧系统
   */
  private bridgeToLegacy(modernEvent: string, data: any): void {
    if (!this.legacySupport) return

    try {
      const legacyEvent = this.mapModernEventToLegacy(modernEvent, data)
      if (legacyEvent && typeof window !== 'undefined') {
        // 触发旧系统事件
        if (window.eventBus && window.eventBus.emit) {
          window.eventBus.emit(legacyEvent.event, legacyEvent.data)
        }
        
        if (window.unifiedEventBus && window.unifiedEventBus.emit) {
          window.unifiedEventBus.emit(legacyEvent.event, legacyEvent.data)
        }
        
        if (window.globalEventBus && window.globalEventBus.emit) {
          window.globalEventBus.emit(legacyEvent.event, legacyEvent.data)
        }
      }
    } catch (error) {
      this.logError(`桥接到旧系统失败: ${modernEvent}`, error)
    }
  }

  /**
   * 映射旧事件到新事件
   */
  private mapLegacyEventToModern(legacyEvent: string): string | null {
    const eventMap: Record<string, string> = {
      'keyboard-delete-executed': CanvasEventTypes.KEYBOARD.DELETE_PRESSED,
      'keyboard-undo-executed': CanvasEventTypes.KEYBOARD.UNDO_PRESSED,
      'keyboard-redo-executed': CanvasEventTypes.KEYBOARD.REDO_PRESSED,
      'node-selected': CanvasEventTypes.SELECTION.NODE_SELECTED,
      'node-deselected': CanvasEventTypes.SELECTION.NODE_DESELECTED,
      'nodes-selected': CanvasEventTypes.SELECTION.NODES_SELECTED,
      'canvas-clicked': CanvasEventTypes.CANVAS.CLICKED,
      'node-moved': CanvasEventTypes.NODE.MOVED,
      'node-added': CanvasEventTypes.NODE.ADDED,
      'node-removed': CanvasEventTypes.NODE.REMOVED,
      'connection-added': CanvasEventTypes.CONNECTION.ADDED,
      'connection-removed': CanvasEventTypes.CONNECTION.REMOVED,
      'preview-line-generated': CanvasEventTypes.PREVIEW_LINE.GENERATED,
      'preview-line-removed': CanvasEventTypes.PREVIEW_LINE.REMOVED
    }
    
    return eventMap[legacyEvent] || null
  }

  /**
   * 映射新事件到旧事件
   */
  private mapModernEventToLegacy(modernEvent: string, data: any): { event: string; data: any } | null {
    // 规范化事件名：移除统一事件总线的 'canvas:' 前缀
    const normalizedEvent = modernEvent?.startsWith('canvas:') ? modernEvent.slice(7) : modernEvent

    const reverseMap: Record<string, string> = {
      // 使用 CanvasEventTypes 常量的旧系统映射
      [CanvasEventTypes.KEYBOARD.DELETE_PRESSED]: 'keyboard-delete-pressed',
      [CanvasEventTypes.KEYBOARD.UNDO_PRESSED]: 'keyboard-undo-pressed',
      [CanvasEventTypes.KEYBOARD.REDO_PRESSED]: 'keyboard-redo-pressed',
      [CanvasEventTypes.SELECTION.NODE_SELECTED]: 'node-selected',
      [CanvasEventTypes.SELECTION.NODE_DESELECTED]: 'node-deselected',
      [CanvasEventTypes.SELECTION.NODES_SELECTED]: 'nodes-selected',
      [CanvasEventTypes.CANVAS.CLICKED]: 'canvas-clicked',
      [CanvasEventTypes.NODE.MOVED]: 'node-moved',
      [CanvasEventTypes.NODE.ADDED]: 'node-added',
      [CanvasEventTypes.NODE.REMOVED]: 'node-removed',
      [CanvasEventTypes.CONNECTION.ADDED]: 'connection-added',
      [CanvasEventTypes.CONNECTION.REMOVED]: 'connection-removed',
      [CanvasEventTypes.PREVIEW_LINE.GENERATED]: 'preview-line-generated',
      [CanvasEventTypes.PREVIEW_LINE.REMOVED]: 'preview-line-removed',

      // 直接字符串事件（统一事件系统风格）到旧事件名的桥接
      'canvas.keyboard.delete': 'keyboard-delete-executed',
      'canvas.keyboard.undo': 'keyboard-undo-executed',
      'canvas.keyboard.redo': 'keyboard-redo-executed',
      'canvas.keyboard.selectAll': 'keyboard-select-all-executed',
      'canvas.keyboard.copy': 'keyboard-copy-executed',
      'canvas.keyboard.paste': 'keyboard-paste-executed',
      'canvas.keyboard.debug': 'keyboard-debug-executed',
      'canvas.keyboard.manager.initialized': 'keyboard-manager-initialized',
      'canvas.keyboard.manager.initFailed': 'keyboard-manager-init-failed',
      'canvas.keyboard.manager.destroyed': 'keyboard-manager-destroyed',
      'canvas.keyboard.manager.destroyFailed': 'keyboard-manager-destroy-failed',

      // 节点相关统一事件到旧事件名的桥接
      'canvas.nodes.deleted': 'nodes-deleted',
      'canvas.nodes.selected': 'nodes-selected',
      'canvas.nodes.copied': 'nodes-copied',
      'canvas.nodes.pasted': 'nodes-pasted'
    }
    
    const legacyEvent = reverseMap[normalizedEvent]
    if (legacyEvent) {
      return {
        event: legacyEvent,
        data: {
          ...data,
          _modernSource: true,
          _originalEvent: modernEvent
        }
      }
    }
    
    return null
  }

  /**
   * 注册服务适配器
   */
  registerAdapter(adapter: ServiceAdapter): void {
    this.adapters.set(adapter.name, adapter)
    adapter.initialize()
    
    this.logInfo(`服务适配器已注册: ${adapter.name}`)
  }

  /**
   * 注销服务适配器
   */
  unregisterAdapter(name: string): void {
    const adapter = this.adapters.get(name)
    if (adapter) {
      adapter.destroy()
      this.adapters.delete(name)
      
      this.logInfo(`服务适配器已注销: ${name}`)
    }
  }

  /**
   * 同步状态到所有适配器
   */
  syncState(state: any): void {
    if (!this.stateSync) return

    for (const adapter of this.adapters.values()) {
      try {
        adapter.syncState(state)
      } catch (error) {
        this.logError(`状态同步失败: ${adapter.name}`, error)
      }
    }
  }

  /**
   * 广播事件到所有适配器
   */
  broadcastEvent(event: any): void {
    for (const adapter of this.adapters.values()) {
      try {
        adapter.handleEvent(event)
      } catch (error) {
        this.logError(`事件广播失败: ${adapter.name}`, error)
      }
    }
  }

  /**
   * 获取适配器
   */
  getAdapter(name: string): ServiceAdapter | undefined {
    return this.adapters.get(name)
  }

  /**
   * 获取所有适配器名称
   */
  getAdapterNames(): string[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * 设置启用状态
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.logInfo(`服务集成: ${enabled ? '启用' : '禁用'}`)
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 注销所有适配器
    for (const name of this.adapters.keys()) {
      this.unregisterAdapter(name)
    }
    
    // 清理遗留监听器
    for (const [event, handler] of this.legacyListeners) {
      canvasEventBus.off(event, handler)
    }
    this.legacyListeners.clear()
    
    this.logInfo('服务集成管理器已销毁')
  }

  // 日志方法
  private logDebug(message: string, data?: any): void {
    if (this.logging) {
      console.log(`[CanvasServiceIntegration] ${message}`, data || '')
    }
  }

  private logInfo(message: string): void {
    console.info(`[CanvasServiceIntegration] ${message}`)
  }

  private logError(message: string, error: any): void {
    console.error(`[CanvasServiceIntegration] ${message}`, error)
  }
}

/**
 * Vuex状态同步适配器
 */
export class VuexStateAdapter implements ServiceAdapter {
  name = 'vuex-state'
  private store: any
  private unsubscribe: Function | null = null

  constructor(store: any) {
    this.store = store
  }

  initialize(): void {
    // 监听画布状态变化并同步到Vuex
    this.unsubscribe = canvasEventBus.on(CanvasEventTypes.CANVAS.STATE_UPDATED, (data: any) => {
      this.syncStateToVuex(data.state)
    })
    
    console.log('[VuexStateAdapter] 初始化完成')
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    console.log('[VuexStateAdapter] 已销毁')
  }

  handleEvent(event: any): void {
    // 处理特定事件并更新Vuex状态
    if (event.type === 'node-selected') {
      this.store.commit('SET_SELECTED_NODES', event.nodes)
    }
  }

  syncState(state: any): void {
    this.syncStateToVuex(state)
  }

  private syncStateToVuex(state: any): void {
    if (this.store && state) {
      this.store.commit('UPDATE_CANVAS_STATE', state)
    }
  }
}

/**
 * AntV X6图形引擎适配器
 */
export class AntVX6Adapter implements ServiceAdapter {
  name = 'antv-x6'
  private graph: any
  private eventHandlers: Map<string, Function> = new Map()

  constructor(graph: any) {
    this.graph = graph
  }

  initialize(): void {
    this.setupGraphEventListeners()
    console.log('[AntVX6Adapter] 初始化完成')
  }

  destroy(): void {
    this.cleanupGraphEventListeners()
    console.log('[AntVX6Adapter] 已销毁')
  }

  handleEvent(event: any): void {
    // 处理来自事件总线的事件并应用到图形
    if (event?.type === 'node-moved' && this.graph) {
      try {
        const nodeId = event.nodeId
        const x = typeof event.x === 'number' ? event.x : (event.position?.x)
        const y = typeof event.y === 'number' ? event.y : (event.position?.y)

        if (!nodeId) {
          console.warn('[AntVX6Adapter] handleEvent(node-moved) 缺少节点ID，忽略', event)
          return
        }
        if (typeof x !== 'number' || typeof y !== 'number') {
          console.warn('[AntVX6Adapter] handleEvent(node-moved) 缺少有效坐标，忽略', { nodeId, event })
          return
        }

        const node = this.graph.getCellById(nodeId)
        if (!node) {
          console.warn('[AntVX6Adapter] handleEvent(node-moved) 未找到节点', nodeId)
          return
        }
        if (typeof node.position === 'function') {
          node.position(x, y)
        } else if (node.setPosition && typeof node.setPosition === 'function') {
          node.setPosition({ x, y })
        } else {
          // 兜底：直接设置属性（避免崩溃，但可能无效）
          try {
            node.x = x
            node.y = y
          } catch (_) {}
        }
      } catch (err) {
        console.error('[AntVX6Adapter] 处理 node-moved 事件失败', err)
      }
    }
  }

  syncState(state: any): void {
    // 同步状态到图形
    if (this.graph && state.nodes) {
      // 更新节点状态
      state.nodes.forEach((nodeData: any) => {
        const node = this.graph.getCellById(nodeData.id)
        if (node) {
          node.setData(nodeData.data)
        }
      })
    }
  }

  private setupGraphEventListeners(): void {
    if (!this.graph) return

    // 监听图形事件并转发到事件总线
    this.graph.on('node:click', ({ node, e }: any) => {
      try {
        if (!node) return
        const nodeId = node.id || (typeof node.getID === 'function' ? node.getID() : undefined)
        const nodeData = typeof node.getData === 'function' ? node.getData() : (node.data || {})
        const position = typeof node.getPosition === 'function' ? node.getPosition() : (node.position || {})

        if (!nodeId) {
          console.warn('[AntVX6Adapter] node:click 缺少节点ID，事件忽略')
          return
        }

        canvasEventBus.emit(CanvasEventTypes.NODE.CLICKED, {
          nodeId,
          nodeData,
          position,
          timestamp: Date.now()
        })
      } catch (err) {
        console.error('[AntVX6Adapter] 处理 node:click 事件失败', err)
      }
    })

    this.graph.on('node:moved', ({ node, x, y }: any) => {
      try {
        if (!node) return
        const nodeId = node.id || (typeof node.getID === 'function' ? node.getID() : undefined)
        if (!nodeId) {
          console.warn('[AntVX6Adapter] node:moved 缺少节点ID，事件忽略')
          return
        }

        const pos = typeof node.getPosition === 'function' ? node.getPosition() : { x, y }
        const nx = typeof pos?.x === 'number' ? pos.x : x
        const ny = typeof pos?.y === 'number' ? pos.y : y

        canvasEventBus.emit(CanvasEventTypes.NODE.MOVED, {
          nodeId,
          x: nx,
          y: ny,
          timestamp: Date.now()
        })
      } catch (err) {
        console.error('[AntVX6Adapter] 处理 node:moved 事件失败', err)
      }
    })

    this.graph.on('edge:connected', ({ edge }: any) => {
      try {
        if (!edge) return

        // 统一提取连接ID
        const id = edge?.id
          || (typeof edge?.getID === 'function' ? edge.getID() : undefined)

        // 统一提取 source/target 节点ID与端口ID
        const rawSource = typeof edge?.getSource === 'function' ? edge.getSource() : edge?.source
        const rawTarget = typeof edge?.getTarget === 'function' ? edge.getTarget() : edge?.target

        const source = (typeof edge?.getSourceCellId === 'function' ? edge.getSourceCellId() : undefined)
          || (typeof rawSource === 'string' ? rawSource : (rawSource?.cell || rawSource?.id || rawSource?.nodeId))

        const target = (typeof edge?.getTargetCellId === 'function' ? edge.getTargetCellId() : undefined)
          || (typeof rawTarget === 'string' ? rawTarget : (rawTarget?.cell || rawTarget?.id || rawTarget?.nodeId))

        const sourcePort = (typeof edge?.getSourcePortId === 'function' ? edge.getSourcePortId() : undefined)
          || (typeof rawSource === 'object' ? rawSource?.port : undefined)

        const targetPort = (typeof edge?.getTargetPortId === 'function' ? edge.getTargetPortId() : undefined)
          || (typeof rawTarget === 'object' ? rawTarget?.port : undefined)

        // 空值保护与规范化
        if (!id) {
          console.warn('[AntVX6Adapter] edge:connected 缺少连接ID，事件忽略')
          return
        }
        if (!source || !target) {
          console.warn('[AntVX6Adapter] edge:connected 缺少 source/target，事件忽略', { id, source, target })
          return
        }

        // 事件负载统一为 { id, source, target, ... }
        const payload: any = {
          id,
          connectionId: id,
          source,
          target,
          timestamp: Date.now()
        }
        if (sourcePort) payload.sourcePort = sourcePort
        if (targetPort) payload.targetPort = targetPort

        // 通过事件总线分发（由 CanvasEventBus 进行数据验证与命名空间格式化）
        canvasEventBus.emit(CanvasEventTypes.CONNECTION.ADDED, payload)
      } catch (err) {
        console.error('[AntVX6Adapter] 处理 edge:connected 事件失败', err)
      }
    })
  }

  private cleanupGraphEventListeners(): void {
    if (this.graph) {
      this.graph.off('node:click')
      this.graph.off('node:moved')
      this.graph.off('edge:connected')
    }
  }
}

// 创建默认实例
export const canvasServiceIntegration = new CanvasServiceIntegration({
  enableLegacySupport: true,
  enableEventBridge: true,
  enableStateSync: true,
  enableErrorHandling: true,
  enableLogging: false
})

export default CanvasServiceIntegration