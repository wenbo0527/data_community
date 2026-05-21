/**
 * 预览线锁定管理器
 * 提供预览线的锁定和解锁功能，防止布局计算时的冲突
 */

/**
 * 预览线锁定管理器类
 */
class PreviewLineLock {
  constructor(options = {}) {
    this.options = {
      defaultTimeout: 5000, // 5秒默认超时
      maxLocks: 100, // 最大锁数量
      enableMetrics: true,
      autoCleanup: true,
      cleanupInterval: 30 * 1000, // 30秒清理间隔
      ...options
    };
    
    // 锁存储
    this.locks = new Map();
    this.lockQueue = new Map();
    
    // 统计信息
    this.metrics = {
      locksCreated: 0,
      locksReleased: 0,
      locksTimeout: 0,
      locksForced: 0,
      queuedRequests: 0,
      averageLockTime: 0,
      totalLockTime: 0
    };
    
    // 自动清理定时器
    if (this.options.autoCleanup) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.options.cleanupInterval);
    }
    
    // 事件监听器
    this.listeners = new Map();
  }
  
  /**
   * 获取锁
   */
  async acquireLock(lockId, options = {}) {
    const {
      timeout = this.options.defaultTimeout,
      priority = 0,
      metadata = {}
    } = options;
    
    // 检查锁数量限制
    if (this.locks.size >= this.options.maxLocks) {
      throw new Error(`Maximum lock limit reached: ${this.options.maxLocks}`);
    }
    
    // 如果锁已存在，加入队列等待
    if (this.locks.has(lockId)) {
      return this.queueLockRequest(lockId, { timeout, priority, metadata });
    }
    
    // 创建新锁
    const lock = this.createLock(lockId, { timeout, metadata });
    this.locks.set(lockId, lock);
    
    this.metrics.locksCreated++;
    this.emit('lockAcquired', { lockId, lock });
    
    return lock;
  }
  
  /**
   * 加锁（lock的别名）
   */
  lock(lockId, options = {}) {
    return this.acquireLock(lockId, options);
  }

  /**
   * 解锁（unlock的别名）
   */
  unlock(lockId, force = false) {
    return this.releaseLock(lockId, force);
  }

  /**
   * 释放锁
   */
  releaseLock(lockId, force = false) {
    const lock = this.locks.get(lockId);
    if (!lock) {
      return false;
    }
    
    // 清除超时定时器
    if (lock.timeoutId) {
      clearTimeout(lock.timeoutId);
    }
    
    // 计算锁持有时间
    const lockTime = Date.now() - lock.createdAt;
    this.updateLockTimeMetrics(lockTime);
    
    // 移除锁
    this.locks.delete(lockId);
    
    if (force) {
      this.metrics.locksForced++;
    } else {
      this.metrics.locksReleased++;
    }
    
    this.emit('lockReleased', { lockId, lock, force, lockTime });
    
    // 处理队列中的等待请求
    this.processLockQueue(lockId);
    
    return true;
  }
  
  /**
   * 创建锁对象
   */
  createLock(lockId, options) {
    const { timeout, metadata } = options;
    const createdAt = Date.now();
    
    const lock = {
      id: lockId,
      createdAt,
      timeout,
      metadata,
      timeoutId: null
    };
    
    // 设置超时
    if (timeout > 0) {
      lock.timeoutId = setTimeout(() => {
        this.handleLockTimeout(lockId);
      }, timeout);
    }
    
    return lock;
  }
  
  /**
   * 处理锁超时
   */
  handleLockTimeout(lockId) {
    const lock = this.locks.get(lockId);
    if (!lock) {
      return;
    }
    
    this.metrics.locksTimeout++;
    this.emit('lockTimeout', { lockId, lock });
    
    // 强制释放锁
    this.releaseLock(lockId, true);
  }
  
  /**
   * 将锁请求加入队列
   */
  async queueLockRequest(lockId, options) {
    const { timeout, priority, metadata } = options;
    
    return new Promise((resolve, reject) => {
      const request = {
        lockId,
        priority,
        metadata,
        resolve,
        reject,
        createdAt: Date.now(),
        timeoutId: null
      };
      
      // 设置请求超时
      if (timeout > 0) {
        request.timeoutId = setTimeout(() => {
          this.removeFromQueue(lockId, request);
          reject(new Error(`Lock request timeout: ${lockId}`));
        }, timeout);
      }
      
      // 添加到队列
      if (!this.lockQueue.has(lockId)) {
        this.lockQueue.set(lockId, []);
      }
      
      const queue = this.lockQueue.get(lockId);
      queue.push(request);
      
      // 按优先级排序
      queue.sort((a, b) => b.priority - a.priority);
      
      this.metrics.queuedRequests++;
      this.emit('lockQueued', { lockId, request, queueLength: queue.length });
    });
  }
  
  /**
   * 处理锁队列
   */
  processLockQueue(lockId) {
    const queue = this.lockQueue.get(lockId);
    if (!queue || queue.length === 0) {
      return;
    }
    
    // 获取优先级最高的请求
    const request = queue.shift();
    
    // 清除请求超时
    if (request.timeoutId) {
      clearTimeout(request.timeoutId);
    }
    
    try {
      // 创建新锁
      const lock = this.createLock(lockId, {
        timeout: this.options.defaultTimeout,
        metadata: request.metadata
      });
      
      this.locks.set(lockId, lock);
      this.metrics.locksCreated++;
      
      this.emit('lockAcquired', { lockId, lock, fromQueue: true });
      request.resolve(lock);
    } catch (error) {
      request.reject(error);
    }
    
    // 如果队列为空，移除队列
    if (queue.length === 0) {
      this.lockQueue.delete(lockId);
    }
  }
  
  /**
   * 从队列中移除请求
   */
  removeFromQueue(lockId, targetRequest) {
    const queue = this.lockQueue.get(lockId);
    if (!queue) {
      return false;
    }
    
    const index = queue.indexOf(targetRequest);
    if (index > -1) {
      queue.splice(index, 1);
      
      if (queue.length === 0) {
        this.lockQueue.delete(lockId);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * 检查锁是否存在
   */
  hasLock(lockId) {
    return this.locks.has(lockId);
  }

  /**
   * 检查是否被锁定
   */
  isLocked(lockId = null) {
    if (lockId) {
      return this.locks.has(lockId);
    }
    return this.locks.size > 0;
  }
  
  /**
   * 获取锁信息
   */
  getLock(lockId) {
    return this.locks.get(lockId) || null;
  }
  
  /**
   * 获取所有锁
   */
  getAllLocks() {
    return new Map(this.locks);
  }
  
  /**
   * 获取队列信息
   */
  getQueueInfo(lockId = null) {
    if (lockId) {
      const queue = this.lockQueue.get(lockId);
      return queue ? [...queue] : [];
    }
    
    const queueInfo = {};
    for (const [id, queue] of this.lockQueue.entries()) {
      queueInfo[id] = [...queue];
    }
    
    return queueInfo;
  }
  
  /**
   * 获取锁统计信息
   */
  getLockStats(lockId) {
    const lock = this.locks.get(lockId);
    if (!lock) {
      return null;
    }
    
    const now = Date.now();
    const age = now - lock.createdAt;
    const remainingTime = lock.timeout > 0 ? Math.max(0, lock.timeout - age) : Infinity;
    
    return {
      id: lockId,
      age,
      remainingTime,
      hasTimeout: lock.timeout > 0,
      metadata: lock.metadata
    };
  }
  
  /**
   * 批量释放锁
   */
  releaseMultipleLocks(lockIds, force = false) {
    const results = {};
    
    for (const lockId of lockIds) {
      results[lockId] = this.releaseLock(lockId, force);
    }
    
    return results;
  }
  
  /**
   * 释放所有锁
   */
  releaseAllLocks(force = false) {
    const lockIds = Array.from(this.locks.keys());
    return this.releaseMultipleLocks(lockIds, force);
  }
  
  /**
   * 清理过期锁和请求
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    // 清理过期锁（这些应该已经被超时处理了，但以防万一）
    for (const [lockId, lock] of this.locks.entries()) {
      if (lock.timeout > 0 && (now - lock.createdAt) > lock.timeout) {
        this.releaseLock(lockId, true);
        cleanedCount++;
      }
    }
    
    // 清理过期的队列请求
    for (const [lockId, queue] of this.lockQueue.entries()) {
      const originalLength = queue.length;
      
      // 移除过期请求
      for (let i = queue.length - 1; i >= 0; i--) {
        const request = queue[i];
        const age = now - request.createdAt;
        
        if (age > this.options.defaultTimeout * 2) { // 超过默认超时的2倍
          if (request.timeoutId) {
            clearTimeout(request.timeoutId);
          }
          
          request.reject(new Error(`Lock request expired: ${lockId}`));
          queue.splice(i, 1);
          cleanedCount++;
        }
      }
      
      // 如果队列为空，移除队列
      if (queue.length === 0) {
        this.lockQueue.delete(lockId);
      }
    }
    
    if (cleanedCount > 0) {
      this.emit('cleanup', { cleanedCount, timestamp: now });
    }
    
    return cleanedCount;
  }
  
  /**
   * 更新锁时间统计
   */
  updateLockTimeMetrics(lockTime) {
    this.metrics.totalLockTime += lockTime;
    const totalLocks = this.metrics.locksReleased + this.metrics.locksTimeout + this.metrics.locksForced;
    
    if (totalLocks > 0) {
      this.metrics.averageLockTime = this.metrics.totalLockTime / totalLocks;
    }
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    const totalRequests = this.metrics.locksCreated + this.metrics.queuedRequests;
    const successRate = totalRequests > 0 ? this.metrics.locksReleased / totalRequests : 0;
    const timeoutRate = totalRequests > 0 ? this.metrics.locksTimeout / totalRequests : 0;
    
    return {
      ...this.metrics,
      activeLocks: this.locks.size,
      queuedRequests: Array.from(this.lockQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
      successRate,
      timeoutRate,
      totalRequests
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.metrics = {
      locksCreated: 0,
      locksReleased: 0,
      locksTimeout: 0,
      locksForced: 0,
      queuedRequests: 0,
      averageLockTime: 0,
      totalLockTime: 0
    };
  }
  
  /**
   * 事件监听
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }
  
  /**
   * 移除事件监听
   */
  off(event, listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  
  /**
   * 触发事件
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in preview line lock event listener:', error);
        }
      });
    }
  }
  
  /**
   * 导出锁状态
   */
  exportState() {
    const locks = {};
    for (const [id, lock] of this.locks.entries()) {
      locks[id] = {
        id: lock.id,
        createdAt: lock.createdAt,
        timeout: lock.timeout,
        metadata: lock.metadata,
        age: Date.now() - lock.createdAt
      };
    }
    
    const queues = {};
    for (const [id, queue] of this.lockQueue.entries()) {
      queues[id] = queue.map(request => ({
        priority: request.priority,
        metadata: request.metadata,
        createdAt: request.createdAt,
        age: Date.now() - request.createdAt
      }));
    }
    
    return {
      locks,
      queues,
      metrics: this.metrics,
      timestamp: Date.now()
    };
  }
  
  /**
   * 销毁锁管理器
   */
  destroy() {
    // 清理定时器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // 释放所有锁
    this.releaseAllLocks(true);
    
    // 清理队列
    for (const [lockId, queue] of this.lockQueue.entries()) {
      for (const request of queue) {
        if (request.timeoutId) {
          clearTimeout(request.timeoutId);
        }
        request.reject(new Error('Lock manager destroyed'));
      }
    }
    
    this.lockQueue.clear();
    this.listeners.clear();
  }
}

export { PreviewLineLock };
export default PreviewLineLock;