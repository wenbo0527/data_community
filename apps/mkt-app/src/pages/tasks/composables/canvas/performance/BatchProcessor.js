/**
 * 批量处理器
 * 优化批量操作性能，减少频繁的DOM更新和重绘
 */
export class BatchProcessor {
  constructor(options = {}) {
    this.options = {
      batchSize: 50,
      flushInterval: 16, // 60fps
      maxWaitTime: 100,
      enableAutoFlush: true,
      ...options
    }
    
    this.queues = new Map()
    this.timers = new Map()
    this.stats = {
      totalBatches: 0,
      totalOperations: 0,
      avgBatchSize: 0,
      lastFlushTime: 0
    }
    
    this.isDestroyed = false
    
    console.log('⚡ [BatchProcessor] 批量处理器初始化完成')
  }

  /**
   * 添加操作到批处理队列
   */
  addOperation(queueName, operation, priority = 0) {
    if (this.isDestroyed) {
      console.warn('批量处理器已销毁，无法添加操作')
      return Promise.reject(new Error('BatchProcessor已销毁'))
    }

    return new Promise((resolve, reject) => {
      // 初始化队列
      if (!this.queues.has(queueName)) {
        this.queues.set(queueName, [])
      }
      
      const queue = this.queues.get(queueName)
      
      // 添加操作到队列
      queue.push({
        operation,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      })
      
      // 按优先级排序
      queue.sort((a, b) => b.priority - a.priority)
      
      this.stats.totalOperations++
      
      // 检查是否需要立即刷新
      if (queue.length >= this.options.batchSize) {
        this.flushQueue(queueName)
      } else if (this.options.enableAutoFlush) {
        this.scheduleFlush(queueName)
      }
    })
  }

  /**
   * 调度队列刷新
   */
  scheduleFlush(queueName) {
    // 清除现有定时器
    if (this.timers.has(queueName)) {
      clearTimeout(this.timers.get(queueName))
    }
    
    // 设置新的定时器
    const timer = setTimeout(() => {
      this.flushQueue(queueName)
    }, this.options.flushInterval)
    
    this.timers.set(queueName, timer)
  }

  /**
   * 刷新指定队列
   */
  async flushQueue(queueName) {
    const queue = this.queues.get(queueName)
    if (!queue || queue.length === 0) {return}

    // 清除定时器
    if (this.timers.has(queueName)) {
      clearTimeout(this.timers.get(queueName))
      this.timers.delete(queueName)
    }

    // 提取当前批次
    const batch = queue.splice(0, this.options.batchSize)
    const batchSize = batch.length

    console.log(`⚡ [BatchProcessor] 刷新队列 ${queueName}，批次大小: ${batchSize}`)

    try {
      // 执行批次操作
      const results = await this.executeBatch(batch)
      
      // 解析所有Promise
      batch.forEach((item, index) => {
        item.resolve(results[index])
      })
      
      // 更新统计
      this.updateStats(batchSize)
      
    } catch (error) {
      console.error(`批次执行失败 (${queueName}):`, error)
      
      // 拒绝所有Promise
      batch.forEach(item => {
        item.reject(error)
      })
    }

    // 如果队列还有剩余操作，继续处理
    if (queue.length > 0) {
      this.scheduleFlush(queueName)
    }
  }

  /**
   * 执行批次操作
   */
  async executeBatch(batch) {
    const results = []
    
    // 检查是否有超时的操作
    const now = Date.now()
    const validBatch = batch.filter(item => {
      const age = now - item.timestamp
      if (age > this.options.maxWaitTime) {
        console.warn(`操作超时被跳过，等待时间: ${age}ms`)
        item.reject(new Error(`操作超时: ${age}ms`))
        return false
      }
      return true
    })

    // 执行所有有效操作
    for (const item of validBatch) {
      try {
        const result = await item.operation()
        results.push(result)
      } catch (error) {
        console.error('批次操作执行失败:', error)
        results.push(error)
      }
    }
    
    return results
  }

  /**
   * 立即刷新所有队列
   */
  async flushAll() {
    const flushPromises = []
    
    for (const queueName of this.queues.keys()) {
      flushPromises.push(this.flushQueue(queueName))
    }
    
    await Promise.all(flushPromises)
  }

  /**
   * 清空指定队列
   */
  clearQueue(queueName) {
    const queue = this.queues.get(queueName)
    if (queue) {
      // 拒绝所有待处理的操作
      queue.forEach(item => {
        item.reject(new Error(`队列 ${queueName} 被清空`))
      })
      
      queue.length = 0
    }
    
    // 清除定时器
    if (this.timers.has(queueName)) {
      clearTimeout(this.timers.get(queueName))
      this.timers.delete(queueName)
    }
  }

  /**
   * 清空所有队列
   */
  clearAll() {
    for (const queueName of this.queues.keys()) {
      this.clearQueue(queueName)
    }
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(queueName) {
    const queue = this.queues.get(queueName)
    if (!queue) {return null}

    const now = Date.now()
    const ages = queue.map(item => now - item.timestamp)
    
    return {
      name: queueName,
      size: queue.length,
      hasTimer: this.timers.has(queueName),
      oldestAge: Math.max(...ages, 0),
      avgAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
      priorities: queue.map(item => item.priority)
    }
  }

  /**
   * 获取所有队列状态
   */
  getAllQueueStatus() {
    const status = {}
    
    for (const queueName of this.queues.keys()) {
      status[queueName] = this.getQueueStatus(queueName)
    }
    
    return status
  }

  /**
   * 更新统计信息
   */
  updateStats(batchSize) {
    this.stats.totalBatches++
    this.stats.avgBatchSize = (
      (this.stats.avgBatchSize * (this.stats.totalBatches - 1) + batchSize) / 
      this.stats.totalBatches
    )
    this.stats.lastFlushTime = Date.now()
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const totalPending = Array.from(this.queues.values())
      .reduce((sum, queue) => sum + queue.length, 0)
    
    return {
      ...this.stats,
      totalPending,
      activeQueues: this.queues.size,
      activeTimers: this.timers.size,
      options: this.options
    }
  }

  /**
   * 设置选项
   */
  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions }
    console.log('⚙️ [BatchProcessor] 选项已更新:', this.options)
  }

  /**
   * 暂停批处理
   */
  pause() {
    // 清除所有定时器
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
    
    this.options.enableAutoFlush = false
    console.log('⏸️ [BatchProcessor] 批处理已暂停')
  }

  /**
   * 恢复批处理
   */
  resume() {
    this.options.enableAutoFlush = true
    
    // 为所有非空队列重新调度刷新
    for (const queueName of this.queues.keys()) {
      const queue = this.queues.get(queueName)
      if (queue && queue.length > 0) {
        this.scheduleFlush(queueName)
      }
    }
    
    console.log('▶️ [BatchProcessor] 批处理已恢复')
  }

  /**
   * 销毁处理器
   */
  destroy() {
    this.isDestroyed = true
    
    // 清空所有队列
    this.clearAll()
    
    // 清理资源
    this.queues.clear()
    this.timers.clear()
    
    console.log('🗑️ [BatchProcessor] 批量处理器已销毁')
  }
}

export default BatchProcessor