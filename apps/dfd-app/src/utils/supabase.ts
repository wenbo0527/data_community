import { createClient } from '@supabase/supabase-js'

// Supabase配置 - 使用环境变量或默认值
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'canvas-statistics'
    }
  }
})

// 数据库表名常量
export const TABLES = {
  CANVASES: 'canvases',
  CANVAS_NODE_STATS: 'canvas_node_stats',
  CANVAS_USER_SESSIONS: 'canvas_user_sessions',
  USER_PATH_NODES: 'user_path_nodes',
  STATISTICS_AUDIT_LOG: 'statistics_audit_log'
}

// 实时订阅管理器
export class RealtimeSubscriptionManager {
  private subscriptions: Map<string, any> = new Map()

  /**
   * 订阅画布统计更新
   */
  subscribeCanvasStats(canvasId: string, callback: (payload: any) => void) {
    const channelName = `canvas-stats-${canvasId}`
    
    // 如果已存在订阅，先取消
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName)
    }

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.CANVAS_NODE_STATS,
          filter: `canvas_id=eq.${canvasId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(channelName, subscription)
    return subscription
  }

  /**
   * 订阅用户会话更新
   */
  subscribeUserSessions(canvasId: string, callback: (payload: any) => void) {
    const channelName = `user-sessions-${canvasId}`
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName)
    }

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.CANVAS_USER_SESSIONS,
          filter: `canvas_id=eq.${canvasId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(channelName, subscription)
    return subscription
  }

  /**
   * 取消订阅
   */
  unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName)
    if (subscription) {
      supabase.removeChannel(subscription)
      this.subscriptions.delete(channelName)
    }
  }

  /**
   * 取消所有订阅
   */
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, channelName) => {
      this.unsubscribe(channelName)
    })
  }
}

// 创建全局实例
export const realtimeManager = new RealtimeSubscriptionManager()

// 错误处理工具
export class SupabaseErrorHandler {
  static handleError(error: any, context: string): void {
    console.error(`[Supabase Error] ${context}:`, error)
    
    if (error.code) {
      switch (error.code) {
        case 'PGRST116':
          console.warn('数据不存在或已被删除')
          break
        case 'PGRST301':
          console.warn('权限不足，无法访问数据')
          break
        case '23505':
          console.warn('数据重复，违反唯一约束')
          break
        case '23503':
          console.warn('外键约束违反')
          break
        default:
          console.warn(`数据库错误: ${error.message}`)
      }
    }
  }
}

// 数据转换工具
export class DataTransformer {
  /**
   * 转换节点统计数据
   */
  static transformNodeStats(data: any[]): any[] {
    return data.map(item => ({
      nodeId: item.node_id,
      nodeType: item.node_type,
      nodeLabel: item.node_label,
      enterCount: item.enter_count,
      exitCount: item.exit_count,
      conversionRate: item.conversion_rate,
      avgStayTime: item.avg_stay_time,
      uniqueUsers: item.unique_users,
      hourlyStats: item.hourly_stats,
      calculatedAt: item.calculated_at
    }))
  }

  /**
   * 转换用户会话数据
   */
  static transformUserSession(data: any): any {
    return {
      sessionId: data.id,
      userId: data.user_id,
      canvasId: data.canvas_id,
      deviceType: data.device_type,
      location: data.location,
      sessionStart: data.session_start,
      sessionEnd: data.session_end,
      totalDuration: data.total_duration,
      nodesVisited: data.nodes_visited,
      conversionsCount: data.conversions_count,
      metadata: data.metadata
    }
  }

  /**
   * 转换用户路径节点数据
   */
  static transformPathNode(data: any): any {
    return {
      pathId: data.id,
      sessionId: data.session_id,
      nodeId: data.node_id,
      enterTime: data.enter_time,
      exitTime: data.exit_time,
      stayTime: data.stay_time,
      conversionType: data.conversion_type,
      conversionValue: data.conversion_value,
      previousNodeId: data.previous_node_id,
      nextNodeIds: data.next_node_ids ? data.next_node_ids.split(',') : [],
      nodePosition: data.node_position
    }
  }
}

// 性能监控工具
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map()

  /**
   * 开始计时
   */
  startTimer(key: string): void {
    this.metrics.set(key, performance.now())
  }

  /**
   * 结束计时并返回耗时
   */
  endTimer(key: string): number {
    const startTime = this.metrics.get(key)
    if (!startTime) {
      console.warn(`未找到计时器: ${key}`)
      return 0
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    this.metrics.delete(key)
    
    console.log(`[Performance] ${key}: ${duration.toFixed(2)}ms`)
    return duration
  }

  /**
   * 记录查询性能
   */
  logQueryPerformance(queryName: string, duration: number, rowCount: number): void {
    console.log(`[Query Performance] ${queryName}: ${duration.toFixed(2)}ms, ${rowCount} rows`)
    
    // 性能警告
    if (duration > 2000) {
      console.warn(`查询性能警告: ${queryName} 耗时超过2秒`)
    }
    
    if (rowCount > 10000) {
      console.warn(`数据量警告: ${queryName} 返回超过1万条数据`)
    }
  }
}

// 创建性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 缓存管理器
export class CacheManager {
  private cache: Map<string, { data: any; expiry: number }> = new Map()
  private defaultTTL = 5 * 60 * 1000 // 5分钟默认缓存时间

  /**
   * 设置缓存
   */
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl
    this.cache.set(key, { data, expiry })
  }

  /**
   * 获取缓存
   */
  get(key: string): any {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }
}

// 创建缓存管理实例
export const cacheManager = new CacheManager()

// 导出常用工具函数
export const supabaseUtils = {
  /**
   * 格式化时间戳
   */
  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('zh-CN')
  },

  /**
   * 生成唯一ID
   */
  generateId(): string {
    return crypto.randomUUID()
  },

  /**
   * 数据脱敏
   */
  desensitizeData(data: any, fields: string[]): any {
    const result = { ...data }
    fields.forEach(field => {
      if (result[field]) {
        result[field] = '***'
      }
    })
    return result
  },

  /**
   * 验证数据完整性
   */
  validateData(data: any, requiredFields: string[]): boolean {
    return requiredFields.every(field => data[field] !== undefined && data[field] !== null)
  }
}