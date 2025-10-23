/**
 * 预览线刷新管理器
 * 负责跟踪节点挂载状态，管理刷新队列，实现延迟和批量刷新
 */

import { ErrorFactory } from '../errors/CoordinateErrors.js';

/**
 * 节点挂载状态枚举
 */
export const NodeMountState = {
  UNMOUNTED: 'unmounted',
  MOUNTING: 'mounting',
  MOUNTED: 'mounted',
  UPDATING: 'updating',
  ERROR: 'error'
};

/**
 * 刷新优先级枚举
 */
export const RefreshPriority = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3
};

/**
 * 刷新任务类
 */
class RefreshTask {
  constructor(nodeId, type, priority = RefreshPriority.NORMAL, data = {}) {
    this.id = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.nodeId = nodeId;
    this.type = type; // 'position', 'connection', 'style', 'all'
    this.priority = priority;
    this.data = data;
    this.createdAt = Date.now();
    this.attempts = 0;
    this.maxAttempts = 3;
    this.delay = 0;
    this.dependencies = new Set(); // 依赖的其他任务
    this.status = 'pending'; // 'pending', 'processing', 'completed', 'failed', 'cancelled'
  }

  /**
   * 检查任务是否可以执行
   */
  canExecute(completedTasks) {
    if (this.status !== 'pending') return false;
    
    // 检查依赖是否都已完成
    for (const depId of this.dependencies) {
      if (!completedTasks.has(depId)) {
        return false;
      }
    }
    
    // 检查延迟时间
    return Date.now() >= this.createdAt + this.delay;
  }

  /**
   * 添加依赖
   */
  addDependency(taskId) {
    this.dependencies.add(taskId);
  }

  /**
   * 标记为处理中
   */
  markProcessing() {
    this.status = 'processing';
    this.attempts++;
  }

  /**
   * 标记为完成
   */
  markCompleted() {
    this.status = 'completed';
  }

  /**
   * 标记为失败
   */
  markFailed(error) {
    this.status = 'failed';
    this.error = error;
  }

  /**
   * 标记为取消
   */
  markCancelled() {
    this.status = 'cancelled';
  }

  /**
   * 检查是否需要重试
   */
  needsRetry() {
    return this.status === 'failed' && this.attempts < this.maxAttempts;
  }
}

/**
 * 预览线刷新管理器
 */
export class PreviewLineRefreshManager {
  constructor(options = {}) {
    this.options = {
      batchSize: 10,
      batchDelay: 100,
      maxRetries: 3,
      retryDelay: 500,
      enablePriorityQueue: true,
      enableBatching: true,
      enableDelayedRefresh: true,
      enableDependencyTracking: true,
      maxQueueSize: 1000,
      processingTimeout: 5000,
      enableDebug: false,
      ...options
    };

    // 节点挂载状态跟踪
    this.nodeMountStates = new Map();
    this.mountObservers = new Map();
    
    // 刷新队列管理
    this.refreshQueue = [];
    this.processingTasks = new Map();
    this.completedTasks = new Set();
    this.failedTasks = new Map();
    
    // 批处理管理
    this.batchTimer = null;
    this.currentBatch = [];
    
    // 性能统计
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      batchesProcessed: 0,
      averageProcessingTime: 0,
      lastProcessingTime: 0
    };

    // 事件监听器
    this.eventListeners = new Map();

    // console.log(`🔄 [预览线刷新管理器] 初始化完成 - 批量大小: ${this.options.batchSize}, 延迟: ${this.options.batchDelay}ms`);
  }

  /**
   * 跟踪节点挂载状态
   * @param {string} nodeId - 节点ID
   * @param {Element} nodeElement - 节点DOM元素
   */
  trackNodeMount(nodeId, nodeElement) {
    if (!nodeId || !nodeElement) {
      throw ErrorFactory.createPreviewLineRefreshError('节点ID和元素不能为空');
    }

    // 设置初始状态
    this.setNodeMountState(nodeId, NodeMountState.MOUNTING);

    // 创建挂载观察器
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // 检查节点是否已挂载到DOM
          if (document.contains(nodeElement)) {
            this.setNodeMountState(nodeId, NodeMountState.MOUNTED);
            this.triggerMountedRefresh(nodeId);
          }
        }
      });
    });

    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.mountObservers.set(nodeId, observer);

    // 如果节点已经在DOM中，直接标记为已挂载
    if (document.contains(nodeElement)) {
      this.setNodeMountState(nodeId, NodeMountState.MOUNTED);
      this.triggerMountedRefresh(nodeId);
    }

    if (this.options.enableDebug) {
      // console.log(`👀 [预览线刷新管理器] 开始跟踪节点挂载 - 节点: ${nodeId}`);
    }
  }

  /**
   * 设置节点挂载状态
   * @param {string} nodeId - 节点ID
   * @param {string} state - 挂载状态
   */
  setNodeMountState(nodeId, state) {
    const oldState = this.nodeMountStates.get(nodeId);
    this.nodeMountStates.set(nodeId, state);

    // 触发状态变化事件
    this.emitEvent('nodeStateChanged', {
      nodeId,
      oldState,
      newState: state,
      timestamp: Date.now()
    });

    if (this.options.enableDebug) {
      // console.log(`📊 [预览线刷新管理器] 节点状态变化 - 节点: ${nodeId}, ${oldState} -> ${state}`);
    }
  }

  /**
   * 获取节点挂载状态
   * @param {string} nodeId - 节点ID
   * @returns {string} 挂载状态
   */
  getNodeMountState(nodeId) {
    return this.nodeMountStates.get(nodeId) || NodeMountState.UNMOUNTED;
  }

  /**
   * 检查节点是否已挂载
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否已挂载
   */
  isNodeMounted(nodeId) {
    return this.getNodeMountState(nodeId) === NodeMountState.MOUNTED;
  }

  /**
   * 触发挂载后刷新
   * @param {string} nodeId - 节点ID
   */
  triggerMountedRefresh(nodeId) {
    // 创建高优先级刷新任务
    this.scheduleRefresh(nodeId, 'all', RefreshPriority.HIGH, {
      reason: 'node_mounted',
      timestamp: Date.now()
    });

    if (this.options.enableDebug) {
      // console.log(`🚀 [预览线刷新管理器] 触发挂载后刷新 - 节点: ${nodeId}`);
    }
  }

  /**
   * 调度刷新任务
   * @param {string} nodeId - 节点ID
   * @param {string} type - 刷新类型
   * @param {number} priority - 优先级
   * @param {Object} data - 附加数据
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {string} 任务ID
   */
  scheduleRefresh(nodeId, type = 'position', priority = RefreshPriority.NORMAL, data = {}, delay = 0) {
    // 检查队列大小
    if (this.refreshQueue.length >= this.options.maxQueueSize) {
      throw ErrorFactory.createPreviewLineRefreshError(`刷新队列已满，最大大小: ${this.options.maxQueueSize}`);
    }

    // 创建刷新任务
    const task = new RefreshTask(nodeId, type, priority, data);
    task.delay = delay;

    // 添加到队列
    this.addTaskToQueue(task);

    // 更新统计
    this.stats.totalTasks++;

    // 触发处理
    if (this.options.enableBatching) {
      this.scheduleBatchProcessing();
    } else {
      this.processQueue();
    }

    if (this.options.enableDebug) {
      // console.log(`📝 [预览线刷新管理器] 调度刷新任务 - 节点: ${nodeId}, 类型: ${type}, 优先级: ${priority}, 任务ID: ${task.id}`);
    }

    return task.id;
  }

  /**
   * 添加任务到队列
   * @param {RefreshTask} task - 刷新任务
   */
  addTaskToQueue(task) {
    if (this.options.enablePriorityQueue) {
      // 按优先级插入
      let insertIndex = this.refreshQueue.length;
      for (let i = 0; i < this.refreshQueue.length; i++) {
        if (this.refreshQueue[i].priority < task.priority) {
          insertIndex = i;
          break;
        }
      }
      this.refreshQueue.splice(insertIndex, 0, task);
    } else {
      // 直接添加到末尾
      this.refreshQueue.push(task);
    }
  }

  /**
   * 调度批处理
   */
  scheduleBatchProcessing() {
    if (this.batchTimer) {
      return; // 已经有定时器在运行
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
      this.batchTimer = null;
    }, this.options.batchDelay);
  }

  /**
   * 处理批次
   */
  async processBatch() {
    const startTime = Date.now();
    
    // 收集可执行的任务
    const executableTasks = [];
    const remainingTasks = [];

    for (const task of this.refreshQueue) {
      if (task.canExecute(this.completedTasks) && executableTasks.length < this.options.batchSize) {
        executableTasks.push(task);
      } else {
        remainingTasks.push(task);
      }
    }

    this.refreshQueue = remainingTasks;

    if (executableTasks.length === 0) {
      return;
    }

    if (this.options.enableDebug) {
      // console.log(`🔄 [预览线刷新管理器] 开始处理批次 - 任务数: ${executableTasks.length}`);
    }

    // 并行处理任务
    const results = await Promise.allSettled(
      executableTasks.map(task => this.executeTask(task))
    );

    // 处理结果
    results.forEach((result, index) => {
      const task = executableTasks[index];
      
      if (result.status === 'fulfilled') {
        task.markCompleted();
        this.completedTasks.add(task.id);
        this.stats.completedTasks++;
      } else {
        task.markFailed(result.reason);
        this.failedTasks.set(task.id, task);
        this.stats.failedTasks++;

        // 检查是否需要重试
        if (task.needsRetry()) {
          task.status = 'pending';
          task.delay = this.options.retryDelay;
          this.addTaskToQueue(task);
        }
      }
    });

    // 更新统计
    const processingTime = Date.now() - startTime;
    this.stats.batchesProcessed++;
    this.stats.lastProcessingTime = processingTime;
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (this.stats.batchesProcessed - 1) + processingTime) / this.stats.batchesProcessed;

    // 触发批处理完成事件
    this.emitEvent('batchProcessed', {
      tasksProcessed: executableTasks.length,
      processingTime,
      completedTasks: results.filter(r => r.status === 'fulfilled').length,
      failedTasks: results.filter(r => r.status === 'rejected').length
    });

    // 如果还有任务，继续处理
    if (this.refreshQueue.length > 0) {
      this.scheduleBatchProcessing();
    }

    if (this.options.enableDebug) {
      // console.log(`✅ [预览线刷新管理器] 批次处理完成 - 耗时: ${processingTime}ms, 成功: ${results.filter(r => r.status === 'fulfilled').length}, 失败: ${results.filter(r => r.status === 'rejected').length}`);
    }
  }

  /**
   * 处理队列（非批处理模式）
   */
  async processQueue() {
    while (this.refreshQueue.length > 0) {
      const task = this.refreshQueue.shift();
      
      if (!task.canExecute(this.completedTasks)) {
        this.refreshQueue.push(task); // 重新加入队列
        break;
      }

      try {
        await this.executeTask(task);
        task.markCompleted();
        this.completedTasks.add(task.id);
        this.stats.completedTasks++;
      } catch (error) {
        task.markFailed(error);
        this.failedTasks.set(task.id, task);
        this.stats.failedTasks++;

        if (task.needsRetry()) {
          task.status = 'pending';
          task.delay = this.options.retryDelay;
          this.addTaskToQueue(task);
        }
      }
    }
  }

  /**
   * 执行刷新任务
   * @param {RefreshTask} task - 刷新任务
   * @returns {Promise} 执行结果
   */
  async executeTask(task) {
    task.markProcessing();
    this.processingTasks.set(task.id, task);

    try {
      // 设置超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('任务执行超时')), this.options.processingTimeout);
      });

      // 执行刷新逻辑
      const refreshPromise = this.performRefresh(task);

      await Promise.race([refreshPromise, timeoutPromise]);

      // 触发任务完成事件
      this.emitEvent('taskCompleted', {
        taskId: task.id,
        nodeId: task.nodeId,
        type: task.type,
        processingTime: Date.now() - task.createdAt
      });

    } finally {
      this.processingTasks.delete(task.id);
    }
  }

  /**
   * 执行实际的刷新操作
   * @param {RefreshTask} task - 刷新任务
   * @returns {Promise} 刷新结果
   */
  async performRefresh(task) {
    const { nodeId, type, data } = task;

    // 检查节点是否已挂载
    if (!this.isNodeMounted(nodeId)) {
      throw ErrorFactory.createPreviewLineRefreshError(`节点未挂载: ${nodeId}`);
    }

    // 根据类型执行不同的刷新操作
    switch (type) {
      case 'position':
        await this.refreshNodePosition(nodeId, data);
        break;
      case 'connection':
        await this.refreshNodeConnections(nodeId, data);
        break;
      case 'style':
        await this.refreshNodeStyle(nodeId, data);
        break;
      case 'all':
        await this.refreshNodePosition(nodeId, data);
        await this.refreshNodeConnections(nodeId, data);
        await this.refreshNodeStyle(nodeId, data);
        break;
      default:
        throw ErrorFactory.createPreviewLineRefreshError(`未知的刷新类型: ${type}`);
    }

    if (this.options.enableDebug) {
      // console.log(`🔄 [预览线刷新管理器] 刷新完成 - 节点: ${nodeId}, 类型: ${type}`);
    }
  }

  /**
   * 刷新节点位置
   * @param {string} nodeId - 节点ID
   * @param {Object} data - 刷新数据
   */
  async refreshNodePosition(nodeId, data) {
    // 这里应该调用实际的预览线位置更新逻辑
    // 暂时使用模拟实现
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟位置刷新
        resolve();
      }, 10);
    });
  }

  /**
   * 刷新节点连接
   * @param {string} nodeId - 节点ID
   * @param {Object} data - 刷新数据
   */
  async refreshNodeConnections(nodeId, data) {
    // 这里应该调用实际的连接刷新逻辑
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟连接刷新
        resolve();
      }, 15);
    });
  }

  /**
   * 刷新节点样式
   * @param {string} nodeId - 节点ID
   * @param {Object} data - 刷新数据
   */
  async refreshNodeStyle(nodeId, data) {
    // 这里应该调用实际的样式刷新逻辑
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟样式刷新
        resolve();
      }, 5);
    });
  }

  /**
   * 强制刷新预览线
   * @param {string} nodeId - 节点ID
   * @param {string} type - 刷新类型
   * @returns {Promise} 刷新结果
   */
  async forceRefresh(nodeId, type = 'all') {
    const taskId = this.scheduleRefresh(nodeId, type, RefreshPriority.CRITICAL, {
      reason: 'force_refresh',
      timestamp: Date.now()
    });

    // 等待任务完成
    return new Promise((resolve, reject) => {
      const checkCompletion = () => {
        if (this.completedTasks.has(taskId)) {
          resolve(taskId);
        } else if (this.failedTasks.has(taskId)) {
          reject(this.failedTasks.get(taskId).error);
        } else {
          setTimeout(checkCompletion, 50);
        }
      };
      checkCompletion();
    });
  }

  /**
   * 取消刷新任务
   * @param {string} taskId - 任务ID
   * @returns {boolean} 是否成功取消
   */
  cancelTask(taskId) {
    // 从队列中移除
    const queueIndex = this.refreshQueue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      const task = this.refreshQueue[queueIndex];
      task.markCancelled();
      this.refreshQueue.splice(queueIndex, 1);
      return true;
    }

    // 检查是否在处理中
    const processingTask = this.processingTasks.get(taskId);
    if (processingTask) {
      processingTask.markCancelled();
      return true;
    }

    return false;
  }

  /**
   * 清空刷新队列
   */
  clearQueue() {
    this.refreshQueue.forEach(task => task.markCancelled());
    this.refreshQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // console.log(`🗑️ [预览线刷新管理器] 队列已清空`);
  }

  /**
   * 停止跟踪节点
   * @param {string} nodeId - 节点ID
   */
  stopTrackingNode(nodeId) {
    // 停止挂载观察器
    const observer = this.mountObservers.get(nodeId);
    if (observer) {
      observer.disconnect();
      this.mountObservers.delete(nodeId);
    }

    // 移除状态记录
    this.nodeMountStates.delete(nodeId);

    // 取消相关任务
    this.refreshQueue = this.refreshQueue.filter(task => {
      if (task.nodeId === nodeId) {
        task.markCancelled();
        return false;
      }
      return true;
    });

    if (this.options.enableDebug) {
      // console.log(`🛑 [预览线刷新管理器] 停止跟踪节点 - 节点: ${nodeId}`);
    }
  }

  /**
   * 添加事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} listener - 监听器函数
   */
  addEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType).add(listener);
  }

  /**
   * 移除事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} listener - 监听器函数
   */
  removeEventListener(eventType, listener) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   */
  emitEvent(eventType, data) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          // console.error(`❌ [预览线刷新管理器] 事件监听器错误:`, error);
        }
      });
    }
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    return {
      ...this.stats,
      queueSize: this.refreshQueue.length,
      processingTasks: this.processingTasks.size,
      trackedNodes: this.nodeMountStates.size,
      mountedNodes: Array.from(this.nodeMountStates.values()).filter(state => state === NodeMountState.MOUNTED).length
    };
  }

  /**
   * 获取队列状态
   * @returns {Object} 队列状态
   */
  getQueueStatus() {
    const priorityCount = {};
    const typeCount = {};

    this.refreshQueue.forEach(task => {
      priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
      typeCount[task.type] = (typeCount[task.type] || 0) + 1;
    });

    return {
      totalTasks: this.refreshQueue.length,
      priorityDistribution: priorityCount,
      typeDistribution: typeCount,
      processingTasks: this.processingTasks.size,
      completedTasks: this.completedTasks.size,
      failedTasks: this.failedTasks.size
    };
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 清空队列
    this.clearQueue();

    // 停止所有观察器
    this.mountObservers.forEach(observer => observer.disconnect());
    this.mountObservers.clear();

    // 清空状态
    this.nodeMountStates.clear();
    this.processingTasks.clear();
    this.completedTasks.clear();
    this.failedTasks.clear();

    // 清空事件监听器
    this.eventListeners.clear();

    // console.log(`🗑️ [预览线刷新管理器] 资源清理完成`);
  }
}

export default PreviewLineRefreshManager;