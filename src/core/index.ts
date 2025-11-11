// 统一事件管理核心模块
export { canvasEventBus } from './CanvasEventBus'
export { CanvasEventBus } from './CanvasEventBus'

export { CanvasEventTypes, getEventCategory, isValidEventType, getAllEventTypes, getEventTypesByCategory, searchEventTypes } from './CanvasEventTypes'

export { eventTypeValidator } from './EventTypeValidator'
export { EventTypeValidator } from './EventTypeValidator'

export { keyboardEventHandler, KeyboardEventHandler, DEFAULT_KEYBOARD_SHORTCUTS } from './KeyboardEventHandler'
export type { KeyboardShortcut, KeyboardEventConfig } from './KeyboardEventHandler'

export { mouseEventHandler, MouseEventHandler } from './MouseEventHandler'
export type { MouseEventConfig, MouseEventData, MouseClickHandler, MouseMoveHandler, MouseDragHandler } from './MouseEventHandler'

export { canvasEventManager, CanvasEventManager } from './CanvasEventManager'
export type { CanvasEventManagerConfig, EventStats, CanvasState } from './CanvasEventManager'

export { canvasServiceIntegration, CanvasServiceIntegration, VuexStateAdapter, AntVX6Adapter } from './CanvasServiceIntegration'
export type { ServiceIntegrationConfig, LegacyEventBridge, ServiceAdapter } from './CanvasServiceIntegration'

export * from './performance'

// 本地使用所需的导入（避免仅重导出导致的未定义引用）
import { canvasEventBus } from './CanvasEventBus'
import { CanvasEventTypes, getEventCategory, isValidEventType, getAllEventTypes, getEventTypesByCategory, searchEventTypes } from './CanvasEventTypes'
import { keyboardEventHandler } from './KeyboardEventHandler'
import { mouseEventHandler } from './MouseEventHandler'
import { canvasEventManager } from './CanvasEventManager'
import { canvasServiceIntegration, VuexStateAdapter, AntVX6Adapter } from './CanvasServiceIntegration'

// 统一导出全局实例
export const CanvasEventSystem = {
  // 事件总线
  eventBus: canvasEventBus,
  
  // 事件管理器
  eventManager: canvasEventManager,
  
  // 事件处理器
  keyboardHandler: keyboardEventHandler,
  mouseHandler: mouseEventHandler,
  
  // 服务集成
  serviceIntegration: canvasServiceIntegration,
  
  // 工具函数
  utils: {
    validateEventType: isValidEventType,
    getEventCategory,
    getAllEventTypes,
    getEventTypesByCategory,
    searchEventTypes
  },
  
  // 初始化函数
  initialize: (config: any = {}) => {
    console.log('[CanvasEventSystem] 初始化统一事件系统...')
    
    // 设置调试模式
    if (config.debug) {
      canvasEventManager.setDebugMode(true)
      canvasEventBus.setDebugMode(true)
    }
    
    // 设置性能监控
    if (config.performance) {
      canvasEventManager.setPerformanceMode(true)
    }
    
    // 注册服务适配器
    if (config.store) {
      canvasServiceIntegration.registerAdapter(new VuexStateAdapter(config.store))
    }
    
    if (config.graph) {
      canvasServiceIntegration.registerAdapter(new AntVX6Adapter(config.graph))
    }
    
    // 统一发布窗口尺寸变化事件
    if (typeof window !== 'undefined') {
      const handleResizeEmit = () => {
        try {
          canvasEventBus.emit(CanvasEventTypes.CANVAS_RESIZED, {
            width: window.innerWidth,
            height: window.innerHeight,
            timestamp: Date.now(),
            source: 'window.resize'
          })
        } catch (err) {
          console.warn('[CanvasEventSystem] 发布画布尺寸事件失败:', err)
        }
      }
      // 立即发布一次当前尺寸
      handleResizeEmit()
      window.addEventListener('resize', handleResizeEmit)
      // 保留处理器以便销毁时清理
      ;(window as any).__canvasEventSystemResizeHandler = handleResizeEmit
    }
    
    console.log('[CanvasEventSystem] 统一事件系统初始化完成')
  },
  
  // 销毁函数
  destroy: () => {
    console.log('[CanvasEventSystem] 销毁统一事件系统...')
    
    // 移除窗口尺寸事件
    if (typeof window !== 'undefined' && (window as any).__canvasEventSystemResizeHandler) {
      window.removeEventListener('resize', (window as any).__canvasEventSystemResizeHandler)
      ;(window as any).__canvasEventSystemResizeHandler = null
    }
    
    canvasServiceIntegration.destroy()
    canvasEventManager.destroy()
    keyboardEventHandler.destroy()
    mouseEventHandler.destroy()
    canvasEventBus.destroy()
    
    console.log('[CanvasEventSystem] 统一事件系统已销毁')
  },
  
  // 获取状态
  getStats: () => {
    return canvasEventManager.getEventStats()
  },
  
  getCanvasState: () => {
    return canvasEventManager.getCanvasState()
  },
  
  getPerformanceMetrics: () => {
    return canvasEventManager.getPerformanceMetrics()
  },
  
  // 性能优化相关方法
  enablePerformanceOptimization: (config?: any) => {
    try {
      const { OptimizationManager } = require('./performance/OptimizationManager')
      OptimizationManager.getInstance().initialize(config)
    } catch (error) {
      console.warn('Failed to enable performance optimization:', error)
    }
  },
  disablePerformanceOptimization: () => {
    try {
      const { OptimizationManager } = require('./performance/OptimizationManager')
      OptimizationManager.getInstance().destroy()
    } catch (error) {
      console.warn('Failed to disable performance optimization:', error)
    }
  },
  getOptimizationReport: () => {
    try {
      const { OptimizationManager } = require('./performance/OptimizationManager')
      return OptimizationManager.getInstance().getOptimizationReport()
    } catch (error) {
      console.warn('Failed to get optimization report:', error)
      return null
    }
  }
}

// 类型声明增强
declare global {
  interface Window {
    CanvasEventSystem: typeof CanvasEventSystem
    canvasEventSystem: typeof CanvasEventSystem
    eventBus?: any
    unifiedEventBus?: any
    globalEventBus?: any
  }
}

// 挂载到全局对象
if (typeof window !== 'undefined') {
  window.CanvasEventSystem = CanvasEventSystem
  window.canvasEventSystem = CanvasEventSystem
  
  console.log('[CanvasEventSystem] 已挂载到全局对象')
}

export default CanvasEventSystem