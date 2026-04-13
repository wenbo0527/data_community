/**
 * 预览线锁定管理器
 * 负责预览线的锁定状态管理，防止布局过程中的预览线干扰
 */

export class PreviewLineLock {
  constructor(config = {}) {
    this.enabled = config.enabled !== false; // 默认启用
    this.lockTimeout = config.lockTimeout || 5000; // 默认锁定超时5秒
    this.locks = new Map(); // 存储锁定信息
    this.lockTimers = new Map(); // 存储锁定定时器
    this.lockHistory = []; // 锁定历史记录
    this.maxHistorySize = config.maxHistorySize || 50;
    
    console.log(`🔒 [预览线锁定] 初始化完成，锁定超时: ${this.lockTimeout}ms`);
  }

  /**
   * 锁定预览线
   * @param {string} lockId - 锁定标识符
   * @param {Object} options - 锁定选项
   * @returns {Object} 锁定信息
   */
  lock(lockId, options = {}) {
    if (!this.enabled) {
      console.log(`🔓 [预览线锁定] 锁定功能已禁用，跳过锁定: ${lockId}`);
      return { locked: false, reason: 'disabled' };
    }

    const {
      timeout = this.lockTimeout,
      reason = 'layout_operation',
      metadata = {},
      force = false
    } = options;

    // 检查是否已经被锁定
    if (this.locks.has(lockId) && !force) {
      const existingLock = this.locks.get(lockId);
      console.warn(`⚠️ [预览线锁定] 锁定已存在: ${lockId}, 锁定者: ${existingLock.reason}`);
      return {
        locked: false,
        reason: 'already_locked',
        existingLock
      };
    }

    // 如果是强制锁定，先释放现有锁定
    if (force && this.locks.has(lockId)) {
      this.unlock(lockId, { reason: 'force_unlock' });
    }

    const lockInfo = {
      id: lockId,
      lockedAt: Date.now(),
      timeout,
      reason,
      metadata,
      force
    };

    // 设置锁定
    this.locks.set(lockId, lockInfo);

    // 设置自动解锁定时器
    if (timeout > 0) {
      const timerId = setTimeout(() => {
        this.unlock(lockId, { reason: 'timeout', auto: true });
      }, timeout);
      this.lockTimers.set(lockId, timerId);
    }

    // 记录锁定历史
    this.addToHistory({
      action: 'lock',
      lockId,
      timestamp: Date.now(),
      reason,
      metadata
    });

    console.log(`🔒 [预览线锁定] 已锁定: ${lockId}, 原因: ${reason}, 超时: ${timeout}ms`);
    
    return {
      locked: true,
      lockInfo
    };
  }

  /**
   * 解锁预览线
   * @param {string} lockId - 锁定标识符
   * @param {Object} options - 解锁选项
   * @returns {Object} 解锁结果
   */
  unlock(lockId, options = {}) {
    const {
      reason = 'manual_unlock',
      auto = false
    } = options;

    if (!this.locks.has(lockId)) {
      console.warn(`⚠️ [预览线锁定] 锁定不存在: ${lockId}`);
      return {
        unlocked: false,
        reason: 'not_locked'
      };
    }

    const lockInfo = this.locks.get(lockId);
    const lockDuration = Date.now() - lockInfo.lockedAt;

    // 清除定时器
    if (this.lockTimers.has(lockId)) {
      clearTimeout(this.lockTimers.get(lockId));
      this.lockTimers.delete(lockId);
    }

    // 移除锁定
    this.locks.delete(lockId);

    // 记录解锁历史
    this.addToHistory({
      action: 'unlock',
      lockId,
      timestamp: Date.now(),
      reason,
      duration: lockDuration,
      auto
    });

    const logMessage = auto ? 
      `🔓 [预览线锁定] 自动解锁: ${lockId}, 原因: ${reason}, 持续: ${lockDuration}ms` :
      `🔓 [预览线锁定] 手动解锁: ${lockId}, 原因: ${reason}, 持续: ${lockDuration}ms`;
    
    console.log(logMessage);

    return {
      unlocked: true,
      lockInfo,
      duration: lockDuration
    };
  }

  /**
   * 检查是否被锁定
   * @param {string} lockId - 锁定标识符
   * @returns {boolean} 是否被锁定
   */
  isLocked(lockId) {
    return this.locks.has(lockId);
  }

  /**
   * 获取锁定信息
   * @param {string} lockId - 锁定标识符
   * @returns {Object|null} 锁定信息
   */
  getLockInfo(lockId) {
    return this.locks.get(lockId) || null;
  }

  /**
   * 获取所有锁定信息
   * @returns {Array} 所有锁定信息
   */
  getAllLocks() {
    return Array.from(this.locks.values());
  }

  /**
   * 获取锁定数量
   * @returns {number} 锁定数量
   */
  getLockCount() {
    return this.locks.size;
  }

  /**
   * 检查是否有任何锁定
   * @returns {boolean} 是否有锁定
   */
  hasAnyLocks() {
    return this.locks.size > 0;
  }

  /**
   * 延长锁定时间
   * @param {string} lockId - 锁定标识符
   * @param {number} additionalTime - 额外时间（毫秒）
   * @returns {Object} 延长结果
   */
  extendLock(lockId, additionalTime) {
    if (!this.locks.has(lockId)) {
      return {
        extended: false,
        reason: 'not_locked'
      };
    }

    const lockInfo = this.locks.get(lockId);
    
    // 清除现有定时器
    if (this.lockTimers.has(lockId)) {
      clearTimeout(this.lockTimers.get(lockId));
    }

    // 设置新的定时器
    const timerId = setTimeout(() => {
      this.unlock(lockId, { reason: 'timeout', auto: true });
    }, additionalTime);
    
    this.lockTimers.set(lockId, timerId);
    lockInfo.timeout += additionalTime;

    // 记录延长历史
    this.addToHistory({
      action: 'extend',
      lockId,
      timestamp: Date.now(),
      additionalTime
    });

    console.log(`⏰ [预览线锁定] 延长锁定: ${lockId}, 额外时间: ${additionalTime}ms`);

    return {
      extended: true,
      newTimeout: lockInfo.timeout
    };
  }

  /**
   * 批量锁定
   * @param {Array} lockIds - 锁定标识符数组
   * @param {Object} options - 锁定选项
   * @returns {Object} 批量锁定结果
   */
  lockMultiple(lockIds, options = {}) {
    const results = {
      successful: [],
      failed: []
    };

    lockIds.forEach(lockId => {
      const result = this.lock(lockId, options);
      if (result.locked) {
        results.successful.push(lockId);
      } else {
        results.failed.push({ lockId, reason: result.reason });
      }
    });

    console.log(`🔒 [预览线锁定] 批量锁定完成: 成功 ${results.successful.length}, 失败 ${results.failed.length}`);
    
    return results;
  }

  /**
   * 批量解锁
   * @param {Array} lockIds - 锁定标识符数组
   * @param {Object} options - 解锁选项
   * @returns {Object} 批量解锁结果
   */
  unlockMultiple(lockIds, options = {}) {
    const results = {
      successful: [],
      failed: []
    };

    lockIds.forEach(lockId => {
      const result = this.unlock(lockId, options);
      if (result.unlocked) {
        results.successful.push(lockId);
      } else {
        results.failed.push({ lockId, reason: result.reason });
      }
    });

    console.log(`🔓 [预览线锁定] 批量解锁完成: 成功 ${results.successful.length}, 失败 ${results.failed.length}`);
    
    return results;
  }

  /**
   * 解锁所有
   * @param {Object} options - 解锁选项
   * @returns {number} 解锁数量
   */
  unlockAll(options = {}) {
    const lockIds = Array.from(this.locks.keys());
    const count = lockIds.length;
    
    lockIds.forEach(lockId => {
      this.unlock(lockId, { ...options, reason: options.reason || 'unlock_all' });
    });

    console.log(`🔓 [预览线锁定] 已解锁所有锁定，共 ${count} 个`);
    
    return count;
  }

  /**
   * 清理过期锁定
   * @returns {number} 清理数量
   */
  cleanupExpiredLocks() {
    const now = Date.now();
    const expiredLocks = [];

    for (const [lockId, lockInfo] of this.locks) {
      const age = now - lockInfo.lockedAt;
      if (age > lockInfo.timeout) {
        expiredLocks.push(lockId);
      }
    }

    expiredLocks.forEach(lockId => {
      this.unlock(lockId, { reason: 'cleanup_expired', auto: true });
    });

    if (expiredLocks.length > 0) {
      console.log(`🧹 [预览线锁定] 清理过期锁定，共 ${expiredLocks.length} 个`);
    }

    return expiredLocks.length;
  }

  /**
   * 添加到历史记录
   * @param {Object} record - 历史记录
   */
  addToHistory(record) {
    this.lockHistory.push(record);
    
    // 限制历史记录大小
    if (this.lockHistory.length > this.maxHistorySize) {
      this.lockHistory.shift();
    }
  }

  /**
   * 获取锁定历史
   * @param {Object} options - 查询选项
   * @returns {Array} 历史记录
   */
  getHistory(options = {}) {
    const {
      lockId = null,
      action = null,
      timeRange = null,
      limit = null
    } = options;

    let filtered = [...this.lockHistory];

    // 按锁定ID过滤
    if (lockId) {
      filtered = filtered.filter(record => record.lockId === lockId);
    }

    // 按操作类型过滤
    if (action) {
      filtered = filtered.filter(record => record.action === action);
    }

    // 按时间范围过滤
    if (timeRange) {
      const now = Date.now();
      filtered = filtered.filter(record => now - record.timestamp <= timeRange);
    }

    // 限制数量
    if (limit && limit > 0) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  /**
   * 获取锁定统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const history = this.lockHistory;
    const locks = history.filter(r => r.action === 'lock');
    const unlocks = history.filter(r => r.action === 'unlock');
    const extensions = history.filter(r => r.action === 'extend');

    // 计算平均锁定时间
    const durations = unlocks
      .filter(r => r.duration !== undefined)
      .map(r => r.duration);
    
    const avgDuration = durations.length > 0 ? 
      durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    return {
      enabled: this.enabled,
      currentLocks: this.locks.size,
      totalLocks: locks.length,
      totalUnlocks: unlocks.length,
      totalExtensions: extensions.length,
      averageLockDuration: avgDuration,
      lockTimeout: this.lockTimeout,
      historySize: history.length,
      maxHistorySize: this.maxHistorySize
    };
  }

  /**
   * 清空历史记录
   */
  clearHistory() {
    this.lockHistory = [];
    console.log(`🧹 [预览线锁定] 历史记录已清空`);
  }

  /**
   * 启用锁定功能
   */
  enable() {
    this.enabled = true;
    console.log(`✅ [预览线锁定] 锁定功能已启用`);
  }

  /**
   * 禁用锁定功能
   */
  disable() {
    this.enabled = false;
    // 解锁所有现有锁定
    this.unlockAll({ reason: 'disabled' });
    console.log(`❌ [预览线锁定] 锁定功能已禁用`);
  }

  /**
   * 设置默认锁定超时
   * @param {number} timeout - 超时时间（毫秒）
   */
  setDefaultTimeout(timeout) {
    this.lockTimeout = timeout;
    console.log(`⏰ [预览线锁定] 默认超时已更新为: ${timeout}ms`);
  }

  /**
   * 销毁锁定管理器
   */
  destroy() {
    // 清除所有定时器
    for (const timerId of this.lockTimers.values()) {
      clearTimeout(timerId);
    }
    
    // 清空所有数据
    this.locks.clear();
    this.lockTimers.clear();
    this.clearHistory();
    this.enabled = false;
    
    console.log(`💥 [预览线锁定] 已销毁`);
  }
}
// 默认导出已通过 export class 实现
