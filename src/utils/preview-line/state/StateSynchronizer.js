/**
 * 状态同步器
 * 提供状态同步、广播和跨组件通信功能
 */

import EventManager from '../events/EventManager.js';

export class StateSynchronizer {
  constructor(options = {}) {
    this.options = {
      // 同步配置
      enableSync: true,
      syncInterval: 100,
      maxSyncRetries: 3,
      syncTimeout: 5000,
      
      // 广播配置
      enableBroadcast: false,
      broadcastChannel: 'preview-line-sync',
      
      // 冲突解决
      conflictResolution: 'last-write-wins', // 'last-write-wins', 'merge', 'custom'
      
      // 性能配置
      enableBatching: true,
      batchSize: 50,
      enableCompression: false,
      
      // 调试配置
      enableDebug: false,
      enableLogging: true,
      
      ...options
    };

    // 事件管理器
    this.eventManager = new EventManager({
      enableAsync: true,
      enableNamespace: true
    });

    // 同步状态
    this.syncStatus = {
      isActive: false,
      lastSync: 0,
      syncCount: 0,
      failedSyncs: 0,
      pendingOperations: new Map(),
      syncQueue: [],
      conflictQueue: []
    };

    // 连接状态
    this.connections = new Map();
    
    // 广播通道
    this.broadcastChannel = null;
    
    // 同步策略
    this.syncStrategies = new Map();
    
    // 冲突解决器
    this.conflictResolvers = new Map();
    
    // 数据转换器
    this.transformers = new Map();
    
    // 统计信息
    this.stats = {
      syncOperations: 0,
      broadcastMessages: 0,
      conflicts: 0,
      errors: 0,
      dataTransferred: 0
    };

    // 初始化
    this.init();
  }

  /**
   * 初始化同步器
   */
  init() {
    // 注册内置同步策略
    this.registerBuiltinStrategies();
    
    // 注册内置冲突解决器
    this.registerBuiltinResolvers();
    
    // 设置广播通道
    if (this.options.enableBroadcast) {
      this.setupBroadcastChannel();
    }
    
    // 启动同步循环
    if (this.options.enableSync) {
      this.startSyncLoop();
    }
  }

  /**
   * 注册同步连接
   * @param {string} id - 连接ID
   * @param {Object} connection - 连接对象
   * @param {Object} options - 选项
   */
  registerConnection(id, connection, options = {}) {
    const connectionConfig = {
      id,
      connection,
      isActive: true,
      lastSync: 0,
      syncCount: 0,
      errors: 0,
      options: {
        priority: 'normal', // 'high', 'normal', 'low'
        strategy: 'default',
        enableBidirectional: true,
        enableCompression: this.options.enableCompression,
        ...options
      }
    };

    this.connections.set(id, connectionConfig);
    
    // 触发连接注册事件
    this.eventManager.emit('connection:registered', { id, connection: connectionConfig });
    
    this.log(`连接已注册: ${id}`);
  }

  /**
   * 注销同步连接
   * @param {string} id - 连接ID
   */
  unregisterConnection(id) {
    const connection = this.connections.get(id);
    if (!connection) {
      return false;
    }

    this.connections.delete(id);
    
    // 触发连接注销事件
    this.eventManager.emit('connection:unregistered', { id, connection });
    
    this.log(`连接已注销: ${id}`);
    return true;
  }

  /**
   * 同步状态数据
   * @param {string} source - 源标识
   * @param {Object} data - 状态数据
   * @param {Object} options - 同步选项
   * @returns {Promise<boolean>} 同步结果
   */
  async syncState(source, data, options = {}) {
    const {
      targets = [], // 目标连接ID数组，空数组表示同步到所有连接
      strategy = 'default',
      priority = 'normal',
      timeout = this.options.syncTimeout,
      enableRetry = true
    } = options;

    try {
      // 创建同步操作
      const operation = {
        id: this.generateOperationId(),
        source,
        data: this.cloneData(data),
        targets: targets.length > 0 ? targets : Array.from(this.connections.keys()),
        strategy,
        priority,
        timeout,
        enableRetry,
        timestamp: Date.now(),
        retries: 0,
        status: 'pending'
      };

      // 添加到待处理操作
      this.syncStatus.pendingOperations.set(operation.id, operation);
      
      // 执行同步
      const result = await this.executeSyncOperation(operation);
      
      // 清理操作
      this.syncStatus.pendingOperations.delete(operation.id);
      
      return result;
    } catch (error) {
      this.handleSyncError(error, 'syncState');
      return false;
    }
  }

  /**
   * 执行同步操作
   * @param {Object} operation - 同步操作
   * @returns {Promise<boolean>} 执行结果
   */
  async executeSyncOperation(operation) {
    const { id, targets, strategy, data, timeout } = operation;
    
    try {
      operation.status = 'executing';
      
      // 获取同步策略
      const syncStrategy = this.syncStrategies.get(strategy) || this.syncStrategies.get('default');
      
      // 准备同步数据
      const syncData = await this.prepareSyncData(data, operation);
      
      // 执行同步到各个目标
      const syncPromises = targets.map(targetId => 
        this.syncToTarget(targetId, syncData, operation)
      );
      
      // 等待所有同步完成
      const results = await Promise.allSettled(syncPromises);
      
      // 处理结果
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const success = successCount > 0;
      
      operation.status = success ? 'completed' : 'failed';
      
      // 更新统计
      this.stats.syncOperations++;
      this.syncStatus.syncCount++;
      this.syncStatus.lastSync = Date.now();
      
      // 触发同步完成事件
      this.eventManager.emit('sync:completed', {
        operation,
        success,
        successCount,
        totalTargets: targets.length
      });
      
      return success;
    } catch (error) {
      operation.status = 'error';
      this.handleSyncError(error, 'executeSyncOperation');
      return false;
    }
  }

  /**
   * 同步到指定目标
   * @param {string} targetId - 目标ID
   * @param {Object} data - 同步数据
   * @param {Object} operation - 同步操作
   * @returns {Promise<boolean>} 同步结果
   */
  async syncToTarget(targetId, data, operation) {
    const connection = this.connections.get(targetId);
    if (!connection || !connection.isActive) {
      return false;
    }

    try {
      // 检查冲突
      const conflict = await this.detectConflict(targetId, data, operation);
      if (conflict) {
        const resolved = await this.resolveConflict(conflict);
        if (!resolved) {
          return false;
        }
      }

      // 执行同步
      const result = await this.performSync(connection, data, operation);
      
      if (result) {
        connection.syncCount++;
        connection.lastSync = Date.now();
      } else {
        connection.errors++;
      }
      
      return result;
    } catch (error) {
      connection.errors++;
      this.handleSyncError(error, `syncToTarget:${targetId}`);
      return false;
    }
  }

  /**
   * 执行实际同步
   * @param {Object} connection - 连接对象
   * @param {Object} data - 同步数据
   * @param {Object} operation - 同步操作
   * @returns {Promise<boolean>} 同步结果
   */
  async performSync(connection, data, operation) {
    const { connection: conn, options } = connection;
    
    // 数据转换
    const transformedData = await this.transformData(data, connection, operation);
    
    // 执行同步
    if (typeof conn.sync === 'function') {
      return await conn.sync(transformedData, operation);
    } else if (typeof conn.setState === 'function') {
      return await conn.setState(transformedData);
    } else {
      // 默认同步方式
      Object.assign(conn, transformedData);
      return true;
    }
  }

  /**
   * 广播状态变化
   * @param {Object} data - 广播数据
   * @param {Object} options - 广播选项
   */
  broadcast(data, options = {}) {
    if (!this.options.enableBroadcast || !this.broadcastChannel) {
      return;
    }

    const {
      type = 'state-change',
      source = 'unknown',
      timestamp = Date.now()
    } = options;

    const message = {
      type,
      source,
      data: this.cloneData(data),
      timestamp,
      id: this.generateOperationId()
    };

    try {
      this.broadcastChannel.postMessage(message);
      this.stats.broadcastMessages++;
      
      this.log(`广播消息已发送: ${type}`);
    } catch (error) {
      this.handleSyncError(error, 'broadcast');
    }
  }

  /**
   * 检测同步冲突
   * @param {string} targetId - 目标ID
   * @param {Object} data - 同步数据
   * @param {Object} operation - 同步操作
   * @returns {Promise<Object|null>} 冲突信息
   */
  async detectConflict(targetId, data, operation) {
    const connection = this.connections.get(targetId);
    if (!connection) {
      return null;
    }

    // 检查时间戳冲突
    if (connection.lastSync > operation.timestamp) {
      return {
        type: 'timestamp',
        targetId,
        localTimestamp: connection.lastSync,
        remoteTimestamp: operation.timestamp,
        data,
        operation
      };
    }

    // 检查数据冲突
    if (typeof connection.connection.getState === 'function') {
      const currentState = await connection.connection.getState();
      const hasConflict = this.hasDataConflict(currentState, data);
      
      if (hasConflict) {
        return {
          type: 'data',
          targetId,
          currentState,
          incomingData: data,
          operation
        };
      }
    }

    return null;
  }

  /**
   * 解决同步冲突
   * @param {Object} conflict - 冲突信息
   * @returns {Promise<boolean>} 解决结果
   */
  async resolveConflict(conflict) {
    const { type, targetId } = conflict;
    
    try {
      // 获取冲突解决器
      const resolver = this.conflictResolvers.get(this.options.conflictResolution) ||
                      this.conflictResolvers.get('last-write-wins');
      
      const resolution = await resolver(conflict);
      
      // 记录冲突
      this.stats.conflicts++;
      this.syncStatus.conflictQueue.push({
        ...conflict,
        resolution,
        timestamp: Date.now()
      });
      
      // 触发冲突解决事件
      this.eventManager.emit('conflict:resolved', {
        conflict,
        resolution
      });
      
      this.log(`冲突已解决: ${type} - ${targetId}`);
      
      return resolution.action !== 'reject';
    } catch (error) {
      this.handleSyncError(error, 'resolveConflict');
      return false;
    }
  }

  /**
   * 注册内置同步策略
   */
  registerBuiltinStrategies() {
    // 默认策略
    this.syncStrategies.set('default', async (data, operation) => {
      return data;
    });
    
    // 增量同步策略
    this.syncStrategies.set('incremental', async (data, operation) => {
      // 只同步变化的部分
      return this.extractChanges(data, operation);
    });
    
    // 批量同步策略
    this.syncStrategies.set('batch', async (data, operation) => {
      // 批量处理多个变化
      return this.batchChanges(data, operation);
    });
  }

  /**
   * 注册内置冲突解决器
   */
  registerBuiltinResolvers() {
    // 最后写入获胜
    this.conflictResolvers.set('last-write-wins', async (conflict) => {
      return {
        action: 'accept',
        data: conflict.incomingData,
        reason: 'last-write-wins'
      };
    });
    
    // 合并策略
    this.conflictResolvers.set('merge', async (conflict) => {
      const merged = this.mergeData(conflict.currentState, conflict.incomingData);
      return {
        action: 'merge',
        data: merged,
        reason: 'merge-strategy'
      };
    });
    
    // 拒绝策略
    this.conflictResolvers.set('reject', async (conflict) => {
      return {
        action: 'reject',
        reason: 'conflict-detected'
      };
    });
  }

  /**
   * 设置广播通道
   */
  setupBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(this.options.broadcastChannel);
      
      // 存储监听器引用以便后续清理
      this.broadcastMessageHandler = (event) => {
        this.handleBroadcastMessage(event.data);
      };
      
      this.broadcastChannel.addEventListener('message', this.broadcastMessageHandler);
      
      this.log(`广播通道已设置: ${this.options.broadcastChannel}`);
    }
  }

  /**
   * 清理广播通道
   */
  cleanupBroadcastChannel() {
    if (this.broadcastChannel) {
      if (this.broadcastMessageHandler) {
        this.broadcastChannel.removeEventListener('message', this.broadcastMessageHandler);
        this.broadcastMessageHandler = null;
      }
      
      this.broadcastChannel.close();
      this.broadcastChannel = null;
      
      this.log('广播通道已清理');
    }
  }

  /**
   * 处理广播消息
   * @param {Object} message - 广播消息
   */
  handleBroadcastMessage(message) {
    const { type, source, data, timestamp, id } = message;
    
    // 触发广播消息事件
    this.eventManager.emit('broadcast:received', {
      type,
      source,
      data,
      timestamp,
      id
    });
    
    this.log(`收到广播消息: ${type} from ${source}`);
  }

  /**
   * 启动同步循环 - 已禁用，避免递归调用
   */
  startSyncLoop() {
    this.syncStatus.isActive = false; // 禁用循环同步
    this.log('同步循环已禁用，避免递归调用');
    
    // 只处理一次同步队列，不启动循环
    if (this.syncStatus.syncQueue.length > 0) {
      this.processSyncQueue().catch(error => {
        this.handleSyncError(error, 'syncLoop');
      });
    }
  }

  /**
   * 停止同步循环
   */
  stopSyncLoop() {
    this.syncStatus.isActive = false;
    this.log('同步循环已停止');
  }

  /**
   * 处理同步队列
   */
  async processSyncQueue() {
    const queue = this.syncStatus.syncQueue.splice(0, this.options.batchSize);
    
    const promises = queue.map(async (item) => {
      try {
        await this.syncState(item.source, item.data, item.options);
      } catch (error) {
        this.handleSyncError(error, 'processSyncQueue');
      }
    });
    
    await Promise.allSettled(promises);
  }

  /**
   * 清理过期操作
   */
  cleanupExpiredOperations() {
    const now = Date.now();
    const expiredOperations = [];
    
    for (const [id, operation] of this.syncStatus.pendingOperations) {
      if (now - operation.timestamp > operation.timeout) {
        expiredOperations.push(id);
      }
    }
    
    expiredOperations.forEach(id => {
      const operation = this.syncStatus.pendingOperations.get(id);
      this.syncStatus.pendingOperations.delete(id);
      
      this.eventManager.emit('sync:timeout', { operation });
      this.log(`同步操作超时: ${id}`);
    });
  }

  /**
   * 工具方法
   */
  
  async prepareSyncData(data, operation) {
    // 应用数据转换
    let transformedData = data;
    
    for (const [name, transformer] of this.transformers) {
      try {
        transformedData = await transformer(transformedData, operation);
      } catch (error) {
        this.handleSyncError(error, `transformer:${name}`);
      }
    }
    
    return transformedData;
  }

  async transformData(data, connection, operation) {
    // 根据连接配置转换数据
    if (connection.options.enableCompression) {
      // 压缩数据
      return this.compressData(data);
    }
    
    return data;
  }

  cloneData(data) {
    if (data instanceof Map) {
      return new Map(data);
    }
    if (data instanceof Set) {
      return new Set(data);
    }
    if (Array.isArray(data)) {
      return data.map(item => this.cloneData(item));
    }
    if (typeof data === 'object' && data !== null) {
      const cloned = {};
      Object.keys(data).forEach(key => {
        cloned[key] = this.cloneData(data[key]);
      });
      return cloned;
    }
    return data;
  }

  hasDataConflict(current, incoming) {
    // 简单的冲突检测逻辑
    return JSON.stringify(current) !== JSON.stringify(incoming);
  }

  mergeData(current, incoming) {
    // 简单的数据合并逻辑
    return { ...current, ...incoming };
  }

  extractChanges(data, operation) {
    // 提取增量变化
    return data; // 简化实现
  }

  batchChanges(data, operation) {
    // 批量处理变化
    return data; // 简化实现
  }

  compressData(data) {
    // 数据压缩
    return data; // 简化实现
  }

  generateOperationId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  log(message) {
    if (this.options.enableLogging) {
      console.log(`[StateSynchronizer] ${message}`);
    }
  }

  /**
   * 错误处理
   */
  handleSyncError(error, context) {
    this.stats.errors++;
    
    if (this.options.enableDebug) {
      console.error(`同步错误 [${context}]:`, error);
    }
    
    this.eventManager.emit('sync:error', {
      error,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      connections: this.connections.size,
      pendingOperations: this.syncStatus.pendingOperations.size,
      syncQueueSize: this.syncStatus.syncQueue.length,
      conflictQueueSize: this.syncStatus.conflictQueue.length,
      isActive: this.syncStatus.isActive,
      lastSync: this.syncStatus.lastSync
    };
  }

  /**
   * 重置同步器
   */
  reset() {
    // 停止同步
    this.stopSyncLoop();
    
    // 清理连接
    this.connections.clear();
    
    // 清理队列
    this.syncStatus.syncQueue.length = 0;
    this.syncStatus.conflictQueue.length = 0;
    this.syncStatus.pendingOperations.clear();
    
    // 重置统计
    this.stats = {
      syncOperations: 0,
      broadcastMessages: 0,
      conflicts: 0,
      errors: 0,
      dataTransferred: 0
    };
    
    // 重置同步状态
    this.syncStatus = {
      isActive: false,
      lastSync: 0,
      syncCount: 0,
      failedSyncs: 0,
      pendingOperations: new Map(),
      syncQueue: [],
      conflictQueue: []
    };
    
    this.eventManager.emit('sync:reset');
  }

  /**
   * 销毁同步器
   */
  destroy() {
    this.log('开始销毁同步器...');
    
    // 停止同步
    this.stopSyncLoop();
    
    // 清理广播通道 - 防止内存泄漏
    this.cleanupBroadcastChannel();
    
    // 清理资源
    this.reset();
    
    // 销毁事件管理器
    if (this.eventManager && typeof this.eventManager.destroy === 'function') {
      this.eventManager.destroy();
    }
    
    this.log('同步器已完全销毁');
  }
}

export default StateSynchronizer;