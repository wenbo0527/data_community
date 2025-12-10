/**
 * 供应商信息变更通知机制
 * 当外数档案模块中的供应商信息发生变更时，通知相关系统同步更新
 */

export interface SupplierChangeEvent {
  type: 'create' | 'update' | 'delete' | 'status_change'
  supplierId: string
  supplierCode: string
  supplierName: string
  timestamp: string
  changes?: Record<string, { oldValue: any; newValue: any }>
  oldStatus?: string
  newStatus?: string
}

export interface SupplierChangeListener {
  id: string
  name: string
  callback: (event: SupplierChangeEvent) => void | Promise<void>
  filter?: {
    supplierIds?: string[]
    categories?: string[]
    eventTypes?: SupplierChangeEvent['type'][]
  }
}

class SupplierChangeNotifier {
  private listeners: Map<string, SupplierChangeListener> = new Map()
  private eventQueue: SupplierChangeEvent[] = []
  private isProcessing = false

  /**
   * 注册变更监听器
   */
  registerListener(listener: SupplierChangeListener): () => void {
    this.listeners.set(listener.id, listener)
    
    // 返回注销函数
    return () => {
      this.listeners.delete(listener.id)
    }
  }

  /**
   * 触发供应商变更事件
   */
  async notifyChange(event: SupplierChangeEvent): Promise<void> {
    // 添加到事件队列
    this.eventQueue.push(event)
    
    // 触发实时通知
    this.notifyListeners(event)
    
    // 如果不在处理中，开始处理队列
    if (!this.isProcessing) {
      this.processEventQueue()
    }
  }

  /**
   * 通知所有匹配的监听器
   */
  private async notifyListeners(event: SupplierChangeEvent): Promise<void> {
    const promises = Array.from(this.listeners.values()).map(async (listener) => {
      if (this.shouldNotify(listener, event)) {
        try {
          await listener.callback(event)
        } catch (error) {
          console.error(`供应商变更监听器 ${listener.name} 处理失败:`, error)
        }
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * 检查是否应该通知监听器
   */
  private shouldNotify(listener: SupplierChangeListener, event: SupplierChangeEvent): boolean {
    if (!listener.filter) return true

    const { supplierIds, categories, eventTypes } = listener.filter

    // 检查事件类型
    if (eventTypes && !eventTypes.includes(event.type)) return false

    // 检查供应商ID
    if (supplierIds && !supplierIds.includes(event.supplierId)) return false

    // 检查分类（这里需要从外部获取供应商信息）
    if (categories) {
      // 注意：这里需要访问供应商信息来判断分类
      // 实际实现中可能需要从缓存或API获取
      return true // 暂时返回true，实际使用时需要完善
    }

    return true
  }

  /**
   * 处理事件队列
   */
  private async processEventQueue(): Promise<void> {
    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const batch = this.eventQueue.splice(0, 10) // 批量处理10个事件
      
      try {
        // 这里可以实现批量处理逻辑
        // 比如写入数据库、发送批量通知等
        await this.processBatch(batch)
      } catch (error) {
        console.error('批量处理供应商变更事件失败:', error)
      }
    }

    this.isProcessing = false
  }

  /**
   * 批量处理事件
   */
  private async processBatch(events: SupplierChangeEvent[]): Promise<void> {
    // 按供应商ID分组
    const grouped = events.reduce((groups, event) => {
      const key = event.supplierId
      if (!groups[key]) groups[key] = []
      groups[key].push(event)
      return groups
    }, {} as Record<string, SupplierChangeEvent[]>)

    // 处理每个供应商的变更事件
    for (const [supplierId, supplierEvents] of Object.entries(grouped)) {
      // 合并同一供应商的多个变更
      const mergedEvent = this.mergeEvents(supplierEvents)
      
      // 这里可以实现具体的业务逻辑
      // 比如更新缓存、发送通知、同步数据等
      console.log(`处理供应商 ${supplierId} 的变更事件:`, mergedEvent)
    }
  }

  /**
   * 合并同一供应商的多个事件
   */
  private mergeEvents(events: SupplierChangeEvent[]): SupplierChangeEvent {
    if (events.length === 1) return events[0]

    // 取最新的事件作为基础
    const latest = events[events.length - 1]
    
    // 合并所有的变更
    const allChanges: Record<string, { oldValue: any; newValue: any }> = {}
    events.forEach(event => {
      if (event.changes) {
        Object.assign(allChanges, event.changes)
      }
    })

    return {
      ...latest,
      changes: Object.keys(allChanges).length > 0 ? allChanges : undefined
    }
  }

  /**
   * 获取监听器统计
   */
  getStats() {
    return {
      listenerCount: this.listeners.size,
      queuedEvents: this.eventQueue.length,
      isProcessing: this.isProcessing
    }
  }
}

// 创建全局实例
export const supplierChangeNotifier = new SupplierChangeNotifier()

/**
 * 预定义的监听器配置
 */
export const settlementSystemListener: SupplierChangeListener = {
  id: 'settlement-system',
  name: '结算系统',
  callback: async (event) => {
    console.log(`结算系统收到供应商变更通知:`, event)
    
    // 根据事件类型处理
    switch (event.type) {
      case 'status_change':
        if (event.newStatus === 'inactive' || event.newStatus === 'suspended') {
          console.log(`供应商 ${event.supplierName} 已停用，需要检查相关结算任务`)
          // 这里可以实现具体的处理逻辑
          // 比如暂停相关结算任务、发送告警等
        }
        break
      
      case 'update':
        console.log(`供应商 ${event.supplierName} 信息已更新，需要同步结算数据`)
        // 同步供应商信息到结算系统
        break
      
      case 'delete':
        console.log(`供应商 ${event.supplierName} 已被删除，需要清理相关数据`)
        // 清理相关结算数据
        break
    }
  },
  filter: {
    eventTypes: ['status_change', 'update', 'delete']
  }
}

/**
 * 缓存更新监听器
 */
export const cacheUpdateListener: SupplierChangeListener = {
  id: 'cache-updater',
  name: '缓存更新器',
  callback: async (event) => {
    console.log(`更新供应商缓存:`, event)
    // 这里可以实现缓存更新逻辑
    // 比如清除相关缓存、重新加载数据等
  }
}

/**
 * 注册默认监听器
 */
export function registerDefaultListeners() {
  supplierChangeNotifier.registerListener(settlementSystemListener)
  supplierChangeNotifier.registerListener(cacheUpdateListener)
}

/**
 * 触发供应商变更事件的工具函数
 */
export async function notifySupplierChange(
  type: SupplierChangeEvent['type'],
  supplier: { id: string; code: string; name: string; status?: string },
  changes?: Record<string, { oldValue: any; newValue: any }>
): Promise<void> {
  const event: SupplierChangeEvent = {
    type,
    supplierId: supplier.id,
    supplierCode: supplier.code,
    supplierName: supplier.name,
    timestamp: new Date().toISOString(),
    changes
  }

  if (type === 'status_change' && changes?.status) {
    event.oldStatus = changes.status.oldValue
    event.newStatus = changes.status.newValue
  }

  await supplierChangeNotifier.notifyChange(event)
}