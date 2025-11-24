// 主应用集成文件 - 画布统计功能
import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import * as echarts from 'echarts'
import { CanvasStatisticsPanel } from '@/components/canvas-statistics'
import { realtimeManager, performanceMonitor, cacheManager } from '@/utils/supabase'

/**
 * 画布统计功能集成器
 * 提供统一的API接口，简化统计功能的集成
 */
export class CanvasStatisticsIntegration {
  private app: any = null
  private isInitialized = false
  private activePanels: Map<string, any> = new Map()

  /**
   * 初始化统计功能
   */
  async initialize(options: {
    container?: HTMLElement
    canvasId: string
    autoRefresh?: boolean
    refreshInterval?: number
    enableRealtime?: boolean
    enableCache?: boolean
    enablePerformance?: boolean
  }): Promise<void> {
    if (this.isInitialized) {
      console.warn('画布统计功能已经初始化')
      return
    }

    try {
      // 初始化Vue应用
      if (options.container) {
        this.app = createApp(CanvasStatisticsPanel, {
          canvasId: options.canvasId
        })
        
        // 注册Arco Design
        this.app.use(ArcoVue)
        
        // 挂载应用
        this.app.mount(options.container)
      }

      // 配置实时订阅
      if (options.enableRealtime) {
        this.setupRealtimeSubscription(options.canvasId)
      }

      // 配置缓存
      if (options.enableCache) {
        cacheManager.set(`canvas-${options.canvasId}`, {
          initialized: true,
          timestamp: Date.now()
        })
      }

      // 配置性能监控
      if (options.enablePerformance) {
        performanceMonitor.startTimer('canvas-stats-init')
      }

      // 配置自动刷新
      if (options.autoRefresh) {
        this.setupAutoRefresh(options.canvasId, options.refreshInterval || 30000)
      }

      this.isInitialized = true
      
      if (options.enablePerformance) {
        const duration = performanceMonitor.endTimer('canvas-stats-init')
        console.log(`画布统计功能初始化完成，耗时: ${duration}ms`)
      }

      console.log('画布统计功能初始化成功')
    } catch (error) {
      console.error('画布统计功能初始化失败:', error)
      throw error
    }
  }

  /**
   * 设置实时订阅
   */
  private setupRealtimeSubscription(canvasId: string): void {
    // 订阅节点统计更新
    realtimeManager.subscribeCanvasStats(canvasId, (payload) => {
      console.log('节点统计数据更新:', payload)
      // 这里可以触发组件更新
      this.notifyPanelUpdate(canvasId, 'node-stats', payload.new)
    })

    // 订阅用户会话更新
    realtimeManager.subscribeUserSessions(canvasId, (payload) => {
      console.log('用户会话数据更新:', payload)
      this.notifyPanelUpdate(canvasId, 'user-sessions', payload.new)
    })

    console.log(`实时订阅已设置: canvas-${canvasId}`)
  }

  /**
   * 设置自动刷新
   */
  private setupAutoRefresh(canvasId: string, interval: number): void {
    const timer = setInterval(() => {
      console.log(`自动刷新统计数据: canvas-${canvasId}`)
      this.refreshStatistics(canvasId)
    }, interval)

    // 存储定时器引用
    this.activePanels.set(`auto-refresh-${canvasId}`, timer)
  }

  /**
   * 刷新统计数据
   */
  private async refreshStatistics(canvasId: string): Promise<void> {
    try {
      performanceMonitor.startTimer(`refresh-${canvasId}`)
      
      // 这里可以调用API刷新数据
      console.log(`刷新统计数据: ${canvasId}`)
      
      const duration = performanceMonitor.endTimer(`refresh-${canvasId}`)
      console.log(`统计数据刷新完成，耗时: ${duration}ms`)
    } catch (error) {
      console.error('刷新统计数据失败:', error)
    }
  }

  /**
   * 通知面板更新
   */
  private notifyPanelUpdate(canvasId: string, type: string, data: any): void {
    // 这里可以实现事件总线或直接调用组件方法
    console.log(`面板更新通知: ${canvasId} - ${type}`, data)
  }

  /**
   * 显示统计面板
   */
  showPanel(canvasId: string, options?: {
    position?: 'right' | 'left' | 'bottom' | 'top'
    width?: number
    height?: number
    draggable?: boolean
    resizable?: boolean
  }): void {
    if (!this.isInitialized) {
      console.warn('请先初始化统计功能')
      return
    }

    // 这里可以实现面板的显示逻辑
    console.log(`显示统计面板: ${canvasId}`, options)
  }

  /**
   * 隐藏统计面板
   */
  hidePanel(canvasId: string): void {
    console.log(`隐藏统计面板: ${canvasId}`)
  }

  /**
   * 导出统计数据
   */
  async exportData(canvasId: string, format: 'csv' | 'excel' | 'json', filters?: any): Promise<void> {
    try {
      performanceMonitor.startTimer(`export-${canvasId}`)
      
      // 这里可以调用导出API
      console.log(`导出统计数据: ${canvasId} - ${format}`, filters)
      
      const duration = performanceMonitor.endTimer(`export-${canvasId}`)
      console.log(`数据导出完成，耗时: ${duration}ms`)
    } catch (error) {
      console.error('导出统计数据失败:', error)
      throw error
    }
  }

  /**
   * 获取用户路径
   */
  async getUserPath(canvasId: string, userId: string): Promise<any> {
    try {
      performanceMonitor.startTimer(`user-path-${canvasId}-${userId}`)
      
      // 这里可以调用API获取用户路径
      console.log(`获取用户路径: ${canvasId} - ${userId}`)
      
      const duration = performanceMonitor.endTimer(`user-path-${canvasId}-${userId}`)
      console.log(`用户路径获取完成，耗时: ${duration}ms`)
      
      return {
        userId,
        path: [],
        totalStayTime: 0,
        conversionPath: false
      }
    } catch (error) {
      console.error('获取用户路径失败:', error)
      throw error
    }
  }

  /**
   * 销毁统计功能
   */
  destroy(): void {
    try {
      // 取消所有实时订阅
      realtimeManager.unsubscribeAll()
      
      // 清除所有定时器
      this.activePanels.forEach((value, key) => {
        if (typeof value === 'number') {
          clearInterval(value)
        }
      })
      
      // 卸载Vue应用
      if (this.app) {
        this.app.unmount()
      }
      
      // 清空缓存
      cacheManager.clear()
      
      this.isInitialized = false
      this.activePanels.clear()
      
      console.log('画布统计功能已销毁')
    } catch (error) {
      console.error('销毁统计功能失败:', error)
    }
  }

  /**
   * 获取统计功能状态
   */
  getStatus(): {
    isInitialized: boolean
    activePanels: number
    cacheSize: number
    realtimeSubscriptions: number
  } {
    return {
      isInitialized: this.isInitialized,
      activePanels: this.activePanels.size,
      cacheSize: cacheManager.size(),
      realtimeSubscriptions: realtimeManager.subscriptions.size
    }
  }
}

/**
 * 快捷API函数
 */
export const canvasStatsAPI = {
  /**
   * 初始化统计功能
   */
  async initialize(options: any) {
    const integration = new CanvasStatisticsIntegration()
    await integration.initialize(options)
    return integration
  },

  /**
   * 显示统计面板
   */
  showPanel(canvasId: string, options?: any) {
    console.log(`显示统计面板: ${canvasId}`, options)
  },

  /**
   * 隐藏统计面板
   */
  hidePanel(canvasId: string) {
    console.log(`隐藏统计面板: ${canvasId}`)
  },

  /**
   * 导出数据
   */
  async exportData(canvasId: string, format: string, filters?: any) {
    console.log(`导出数据: ${canvasId} - ${format}`, filters)
  },

  /**
   * 获取用户路径
   */
  async getUserPath(canvasId: string, userId: string) {
    console.log(`获取用户路径: ${canvasId} - ${userId}`)
    return {
      userId,
      path: [],
      totalStayTime: 0,
      conversionPath: false
    }
  }
}

/**
 * 全局统计功能管理器
 */
export class GlobalStatisticsManager {
  private instances: Map<string, CanvasStatisticsIntegration> = new Map()
  private static instance: GlobalStatisticsManager

  static getInstance(): GlobalStatisticsManager {
    if (!GlobalStatisticsManager.instance) {
      GlobalStatisticsManager.instance = new GlobalStatisticsManager()
    }
    return GlobalStatisticsManager.instance
  }

  /**
   * 获取或创建统计实例
   */
  async getOrCreateInstance(canvasId: string, options?: any): Promise<CanvasStatisticsIntegration> {
    if (this.instances.has(canvasId)) {
      return this.instances.get(canvasId)!
    }

    const instance = new CanvasStatisticsIntegration()
    await instance.initialize({ canvasId, ...options })
    this.instances.set(canvasId, instance)
    
    return instance
  }

  /**
   * 销毁实例
   */
  destroyInstance(canvasId: string): void {
    const instance = this.instances.get(canvasId)
    if (instance) {
      instance.destroy()
      this.instances.delete(canvasId)
    }
  }

  /**
   * 获取所有实例状态
   */
  getAllInstancesStatus(): Record<string, any> {
    const status: Record<string, any> = {}
    this.instances.forEach((instance, canvasId) => {
      status[canvasId] = instance.getStatus()
    })
    return status
  }

  /**
   * 销毁所有实例
   */
  destroyAll(): void {
    this.instances.forEach((instance) => {
      instance.destroy()
    })
    this.instances.clear()
  }
}

// 导出全局管理器实例
export const globalStatsManager = GlobalStatisticsManager.getInstance()

// 默认导出
export default {
  CanvasStatisticsIntegration,
  canvasStatsAPI,
  globalStatsManager,
  realtimeManager,
  performanceMonitor,
  cacheManager
}