/**
 * 分流管理器
 * 负责管理分支映射，跟踪流状态变化，同步预览线与实际连接
 */

import { ErrorFactory } from '../errors/CoordinateErrors.js';

/**
 * 分支状态枚举
 */
export const BranchState = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  PROCESSING: 'processing',
  ERROR: 'error',
  SUSPENDED: 'suspended'
};

/**
 * 流向类型枚举
 */
export const FlowDirection = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  BIDIRECTIONAL: 'bidirectional'
};

/**
 * 分支类型枚举
 */
export const BranchType = {
  CONDITION: 'condition',
  PARALLEL: 'parallel',
  EXCLUSIVE: 'exclusive',
  INCLUSIVE: 'inclusive',
  LOOP: 'loop'
};

/**
 * 分支信息类
 */
class BranchInfo {
  constructor(branchId, sourceNodeId, targetNodeId, type = BranchType.CONDITION) {
    this.id = branchId;
    this.sourceNodeId = sourceNodeId;
    this.targetNodeId = targetNodeId;
    this.type = type;
    this.state = BranchState.INACTIVE;
    this.condition = null;
    this.weight = 1;
    this.priority = 0;
    this.metadata = {};
    this.createdAt = Date.now();
    this.lastUpdated = Date.now();
    this.activationCount = 0;
    this.errorCount = 0;
    this.lastError = null;
  }

  /**
   * 更新分支状态
   */
  updateState(newState, reason = '') {
    const oldState = this.state;
    this.state = newState;
    this.lastUpdated = Date.now();

    if (newState === BranchState.ACTIVE) {
      this.activationCount++;
    } else if (newState === BranchState.ERROR) {
      this.errorCount++;
      this.lastError = reason;
    }

    return { oldState, newState, reason };
  }

  /**
   * 设置分支条件
   */
  setCondition(condition) {
    this.condition = condition;
    this.lastUpdated = Date.now();
  }

  /**
   * 检查分支是否可激活
   */
  canActivate(context = {}) {
    if (this.state === BranchState.ERROR || this.state === BranchState.SUSPENDED) {
      return false;
    }

    if (this.condition) {
      try {
        return this.evaluateCondition(context);
      } catch (error) {
        this.updateState(BranchState.ERROR, error.message);
        return false;
      }
    }

    return true;
  }

  /**
   * 评估分支条件
   */
  evaluateCondition(context) {
    if (typeof this.condition === 'function') {
      return this.condition(context);
    } else if (typeof this.condition === 'string') {
      // 简单的表达式评估
      return this.evaluateExpression(this.condition, context);
    } else if (typeof this.condition === 'boolean') {
      return this.condition;
    }

    return true;
  }

  /**
   * 评估表达式
   */
  evaluateExpression(expression, context) {
    // 简单的表达式评估器
    // 在实际项目中应该使用更安全的表达式评估库
    try {
      const func = new Function('context', `with(context) { return ${expression}; }`);
      return func(context);
    } catch (error) {
      throw new Error(`表达式评估失败: ${expression} - ${error.message}`);
    }
  }

  /**
   * 获取分支摘要
   */
  getSummary() {
    return {
      id: this.id,
      source: this.sourceNodeId,
      target: this.targetNodeId,
      type: this.type,
      state: this.state,
      weight: this.weight,
      priority: this.priority,
      activationCount: this.activationCount,
      errorCount: this.errorCount,
      uptime: Date.now() - this.createdAt
    };
  }
}

/**
 * 流状态跟踪器
 */
class FlowStateTracker {
  constructor() {
    this.flowStates = new Map(); // nodeId -> state
    this.flowHistory = new Map(); // nodeId -> history[]
    this.flowMetrics = new Map(); // nodeId -> metrics
    this.stateChangeListeners = new Set();
  }

  /**
   * 更新流状态
   */
  updateFlowState(nodeId, newState, metadata = {}) {
    const oldState = this.flowStates.get(nodeId);
    this.flowStates.set(nodeId, newState);

    // 记录历史
    if (!this.flowHistory.has(nodeId)) {
      this.flowHistory.set(nodeId, []);
    }
    
    const history = this.flowHistory.get(nodeId);
    history.push({
      oldState,
      newState,
      timestamp: Date.now(),
      metadata
    });

    // 限制历史记录长度
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    // 更新指标
    this.updateFlowMetrics(nodeId, newState);

    // 通知监听器
    this.notifyStateChange(nodeId, oldState, newState, metadata);

    return { oldState, newState };
  }

  /**
   * 更新流指标
   */
  updateFlowMetrics(nodeId, state) {
    if (!this.flowMetrics.has(nodeId)) {
      this.flowMetrics.set(nodeId, {
        totalStateChanges: 0,
        stateDistribution: {},
        averageStateTime: 0,
        lastStateChange: Date.now()
      });
    }

    const metrics = this.flowMetrics.get(nodeId);
    metrics.totalStateChanges++;
    metrics.stateDistribution[state] = (metrics.stateDistribution[state] || 0) + 1;
    metrics.lastStateChange = Date.now();
  }

  /**
   * 获取流状态
   */
  getFlowState(nodeId) {
    return this.flowStates.get(nodeId);
  }

  /**
   * 获取流历史
   */
  getFlowHistory(nodeId, limit = 10) {
    const history = this.flowHistory.get(nodeId) || [];
    return history.slice(-limit);
  }

  /**
   * 获取流指标
   */
  getFlowMetrics(nodeId) {
    return this.flowMetrics.get(nodeId);
  }

  /**
   * 添加状态变化监听器
   */
  addStateChangeListener(listener) {
    this.stateChangeListeners.add(listener);
  }

  /**
   * 移除状态变化监听器
   */
  removeStateChangeListener(listener) {
    this.stateChangeListeners.delete(listener);
  }

  /**
   * 通知状态变化
   */
  notifyStateChange(nodeId, oldState, newState, metadata) {
    const event = { nodeId, oldState, newState, metadata, timestamp: Date.now() };
    
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        // console.error(`❌ [流状态跟踪器] 监听器错误:`, error);
      }
    });
  }

  /**
   * 清理节点状态
   */
  clearNodeState(nodeId) {
    this.flowStates.delete(nodeId);
    this.flowHistory.delete(nodeId);
    this.flowMetrics.delete(nodeId);
  }

  /**
   * 清理所有状态
   */
  clearAllStates() {
    this.flowStates.clear();
    this.flowHistory.clear();
    this.flowMetrics.clear();
  }
}

/**
 * 分流管理器
 */
export class BranchFlowManager {
  constructor(options = {}) {
    this.options = {
      enableValidation: true,
      enableMetrics: true,
      enableAutoSync: false, // 禁用自动同步防止频繁触发
      syncInterval: 10000, // 增加到10秒，减少频繁同步
      maxBranches: 1000,
      maxHistorySize: 100,
      enableDebug: false,
      ...options
    };

    // 分支管理
    this.branches = new Map(); // branchId -> BranchInfo
    this.nodeBranches = new Map(); // nodeId -> Set<branchId>
    this.branchConnections = new Map(); // branchId -> connectionInfo

    // 流状态跟踪
    this.flowTracker = new FlowStateTracker();

    // 同步管理
    this.syncTimer = null;
    this.pendingSyncs = new Set();
    this.lastSyncTime = 0;

    // 验证器
    this.validators = new Map();
    this.setupDefaultValidators();

    // 事件监听器
    this.eventListeners = new Map();

    // 性能统计
    this.stats = {
      totalBranches: 0,
      activeBranches: 0,
      syncOperations: 0,
      validationErrors: 0,
      lastSyncDuration: 0
    };

    // 启动自动同步
    if (this.options.enableAutoSync) {
      this.startAutoSync();
    }

    // console.log(`🌊 [分流管理器] 初始化完成 - 自动同步: ${this.options.enableAutoSync}, 间隔: ${this.options.syncInterval}ms`);
  }

  /**
   * 设置默认验证器
   */
  setupDefaultValidators() {
    // 分支连接验证器
    this.validators.set('connection', (branch) => {
      if (!branch.sourceNodeId || !branch.targetNodeId) {
        throw new Error('分支必须有源节点和目标节点');
      }
      if (branch.sourceNodeId === branch.targetNodeId) {
        throw new Error('分支不能连接到自身');
      }
      return true;
    });

    // 分支条件验证器
    this.validators.set('condition', (branch) => {
      if (branch.condition && typeof branch.condition !== 'function' && 
          typeof branch.condition !== 'string' && typeof branch.condition !== 'boolean') {
        throw new Error('分支条件必须是函数、字符串或布尔值');
      }
      return true;
    });

    // 分支权重验证器
    this.validators.set('weight', (branch) => {
      if (branch.weight < 0 || branch.weight > 100) {
        throw new Error('分支权重必须在0-100之间');
      }
      return true;
    });
  }

  /**
   * 创建分支
   * @param {string} branchId - 分支ID
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} type - 分支类型
   * @param {Object} options - 分支选项
   * @returns {BranchInfo} 分支信息
   */
  createBranch(branchId, sourceNodeId, targetNodeId, type = BranchType.CONDITION, options = {}) {
    // 检查分支数量限制
    if (this.branches.size >= this.options.maxBranches) {
      throw ErrorFactory.createBranchFlowError(`分支数量已达上限: ${this.options.maxBranches}`);
    }

    // 检查分支是否已存在
    if (this.branches.has(branchId)) {
      throw ErrorFactory.createBranchFlowError(`分支已存在: ${branchId}`);
    }

    // 创建分支信息
    const branch = new BranchInfo(branchId, sourceNodeId, targetNodeId, type);
    
    // 应用选项
    if (options.condition) branch.setCondition(options.condition);
    if (options.weight !== undefined) branch.weight = options.weight;
    if (options.priority !== undefined) branch.priority = options.priority;
    if (options.metadata) branch.metadata = { ...options.metadata };

    // 验证分支
    if (this.options.enableValidation) {
      this.validateBranch(branch);
    }

    // 存储分支
    this.branches.set(branchId, branch);

    // 更新节点分支映射
    this.addNodeBranch(sourceNodeId, branchId);
    this.addNodeBranch(targetNodeId, branchId);

    // 更新统计
    this.stats.totalBranches++;

    // 触发事件
    this.emitEvent('branchCreated', { branchId, branch: branch.getSummary() });

    // 标记需要同步
    this.markForSync(branchId);

    if (this.options.enableDebug) {
      // console.log(`🌿 [分流管理器] 创建分支 - ID: ${branchId}, 源: ${sourceNodeId}, 目标: ${targetNodeId}, 类型: ${type}`);
    }

    return branch;
  }

  /**
   * 添加节点分支映射
   */
  addNodeBranch(nodeId, branchId) {
    if (!this.nodeBranches.has(nodeId)) {
      this.nodeBranches.set(nodeId, new Set());
    }
    this.nodeBranches.get(nodeId).add(branchId);
  }

  /**
   * 移除节点分支映射
   */
  removeNodeBranch(nodeId, branchId) {
    const branches = this.nodeBranches.get(nodeId);
    if (branches) {
      branches.delete(branchId);
      if (branches.size === 0) {
        this.nodeBranches.delete(nodeId);
      }
    }
  }

  /**
   * 验证分支
   * @param {BranchInfo} branch - 分支信息
   */
  validateBranch(branch) {
    for (const [name, validator] of this.validators) {
      try {
        validator(branch);
      } catch (error) {
        this.stats.validationErrors++;
        throw ErrorFactory.createBranchFlowError(`分支验证失败 (${name}): ${error.message}`);
      }
    }
  }

  /**
   * 更新分支
   * @param {string} branchId - 分支ID
   * @param {Object} updates - 更新内容
   * @returns {BranchInfo} 更新后的分支信息
   */
  updateBranch(branchId, updates) {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw ErrorFactory.createBranchFlowError(`分支不存在: ${branchId}`);
    }

    // 应用更新
    Object.keys(updates).forEach(key => {
      if (key === 'condition') {
        branch.setCondition(updates[key]);
      } else if (key in branch) {
        branch[key] = updates[key];
      }
    });

    branch.lastUpdated = Date.now();

    // 重新验证
    if (this.options.enableValidation) {
      this.validateBranch(branch);
    }

    // 触发事件
    this.emitEvent('branchUpdated', { branchId, updates, branch: branch.getSummary() });

    // 标记需要同步
    this.markForSync(branchId);

    if (this.options.enableDebug) {
      // console.log(`🔄 [分流管理器] 更新分支 - ID: ${branchId}, 更新: ${Object.keys(updates).join(', ')}`);
    }

    return branch;
  }

  /**
   * 删除分支
   * @param {string} branchId - 分支ID
   * @returns {boolean} 是否成功删除
   */
  deleteBranch(branchId) {
    const branch = this.branches.get(branchId);
    if (!branch) {
      return false;
    }

    // 移除节点分支映射
    this.removeNodeBranch(branch.sourceNodeId, branchId);
    this.removeNodeBranch(branch.targetNodeId, branchId);

    // 移除分支连接
    this.branchConnections.delete(branchId);

    // 移除分支
    this.branches.delete(branchId);

    // 更新统计
    this.stats.totalBranches--;
    if (branch.state === BranchState.ACTIVE) {
      this.stats.activeBranches--;
    }

    // 触发事件
    this.emitEvent('branchDeleted', { branchId, branch: branch.getSummary() });

    if (this.options.enableDebug) {
      // console.log(`🗑️ [分流管理器] 删除分支 - ID: ${branchId}`);
    }

    return true;
  }

  /**
   * 激活分支
   * @param {string} branchId - 分支ID
   * @param {Object} context - 激活上下文
   * @returns {boolean} 是否成功激活
   */
  activateBranch(branchId, context = {}) {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw ErrorFactory.createBranchFlowError(`分支不存在: ${branchId}`);
    }

    // 检查是否可以激活
    if (!branch.canActivate(context)) {
      return false;
    }

    // 更新状态
    const stateChange = branch.updateState(BranchState.ACTIVE, '手动激活');

    // 更新统计
    if (stateChange.oldState !== BranchState.ACTIVE) {
      this.stats.activeBranches++;
    }

    // 更新流状态
    this.flowTracker.updateFlowState(branch.sourceNodeId, 'flowing', { branchId, direction: 'outgoing' });
    this.flowTracker.updateFlowState(branch.targetNodeId, 'receiving', { branchId, direction: 'incoming' });

    // 触发事件
    this.emitEvent('branchActivated', { branchId, context, branch: branch.getSummary() });

    // 标记需要同步
    this.markForSync(branchId);

    if (this.options.enableDebug) {
      // console.log(`✅ [分流管理器] 激活分支 - ID: ${branchId}`);
    }

    return true;
  }

  /**
   * 停用分支
   * @param {string} branchId - 分支ID
   * @param {string} reason - 停用原因
   * @returns {boolean} 是否成功停用
   */
  deactivateBranch(branchId, reason = '手动停用') {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw ErrorFactory.createBranchFlowError(`分支不存在: ${branchId}`);
    }

    // 更新状态
    const stateChange = branch.updateState(BranchState.INACTIVE, reason);

    // 更新统计
    if (stateChange.oldState === BranchState.ACTIVE) {
      this.stats.activeBranches--;
    }

    // 更新流状态
    this.flowTracker.updateFlowState(branch.sourceNodeId, 'idle', { branchId, reason });
    this.flowTracker.updateFlowState(branch.targetNodeId, 'idle', { branchId, reason });

    // 触发事件
    this.emitEvent('branchDeactivated', { branchId, reason, branch: branch.getSummary() });

    // 标记需要同步
    this.markForSync(branchId);

    if (this.options.enableDebug) {
      // console.log(`⏸️ [分流管理器] 停用分支 - ID: ${branchId}, 原因: ${reason}`);
    }

    return true;
  }

  /**
   * 获取节点的所有分支
   * @param {string} nodeId - 节点ID
   * @param {string} direction - 方向过滤 ('incoming', 'outgoing', 'all')
   * @returns {Array} 分支列表
   */
  getNodeBranches(nodeId, direction = 'all') {
    const branchIds = this.nodeBranches.get(nodeId) || new Set();
    const branches = [];

    for (const branchId of branchIds) {
      const branch = this.branches.get(branchId);
      if (!branch) continue;

      if (direction === 'all' ||
          (direction === 'incoming' && branch.targetNodeId === nodeId) ||
          (direction === 'outgoing' && branch.sourceNodeId === nodeId)) {
        branches.push(branch);
      }
    }

    return branches;
  }

  /**
   * 获取活动分支
   * @returns {Array} 活动分支列表
   */
  getActiveBranches() {
    return Array.from(this.branches.values()).filter(branch => branch.state === BranchState.ACTIVE);
  }

  /**
   * 标记需要同步
   * @param {string} branchId - 分支ID
   */
  markForSync(branchId) {
    this.pendingSyncs.add(branchId);
    
    if (this.options.enableAutoSync && !this.syncTimer) {
      this.scheduleSync();
    }
  }

  /**
   * 调度同步
   */
  scheduleSync() {
    if (this.syncTimer) return;

    this.syncTimer = setTimeout(() => {
      this.performSync();
      this.syncTimer = null;
    }, this.options.syncInterval);
  }

  /**
   * 执行同步
   */
  async performSync() {
    if (this.pendingSyncs.size === 0) return;

    const startTime = Date.now();
    const syncBranches = Array.from(this.pendingSyncs);
    this.pendingSyncs.clear();

    try {
      // 批量同步分支
      await this.syncBranches(syncBranches);

      // 更新统计
      this.stats.syncOperations++;
      this.stats.lastSyncDuration = Date.now() - startTime;
      this.lastSyncTime = Date.now();

      // 触发事件
      this.emitEvent('syncCompleted', {
        branchCount: syncBranches.length,
        duration: this.stats.lastSyncDuration
      });

      if (this.options.enableDebug) {
        // console.log(`🔄 [分流管理器] 同步完成 - 分支数: ${syncBranches.length}, 耗时: ${this.stats.lastSyncDuration}ms`);
      }

    } catch (error) {
      // console.error(`❌ [分流管理器] 同步失败:`, error);
      
      // 重新标记失败的分支
      syncBranches.forEach(branchId => this.pendingSyncs.add(branchId));
      
      // 触发错误事件
      this.emitEvent('syncError', { error: error.message, branchCount: syncBranches.length });
    }
  }

  /**
   * 同步分支到预览线
   * @param {Array} branchIds - 分支ID列表
   */
  async syncBranches(branchIds) {
    const syncPromises = branchIds.map(branchId => this.syncBranch(branchId));
    await Promise.allSettled(syncPromises);
  }

  /**
   * 同步单个分支
   * @param {string} branchId - 分支ID
   */
  async syncBranch(branchId) {
    const branch = this.branches.get(branchId);
    if (!branch) return;

    try {
      // 获取或创建连接信息
      let connectionInfo = this.branchConnections.get(branchId);
      if (!connectionInfo) {
        connectionInfo = await this.createConnection(branch);
        this.branchConnections.set(branchId, connectionInfo);
      }

      // 更新连接状态
      await this.updateConnection(connectionInfo, branch);

      // 同步预览线位置
      await this.syncPreviewLine(branch, connectionInfo);

    } catch (error) {
      branch.updateState(BranchState.ERROR, error.message);
      throw error;
    }
  }

  /**
   * 创建连接
   * @param {BranchInfo} branch - 分支信息
   * @returns {Object} 连接信息
   */
  async createConnection(branch) {
    // 这里应该调用实际的连接创建逻辑
    // 暂时返回模拟的连接信息
    return {
      id: `conn_${branch.id}`,
      sourceNodeId: branch.sourceNodeId,
      targetNodeId: branch.targetNodeId,
      type: branch.type,
      createdAt: Date.now()
    };
  }

  /**
   * 更新连接
   * @param {Object} connectionInfo - 连接信息
   * @param {BranchInfo} branch - 分支信息
   */
  async updateConnection(connectionInfo, branch) {
    // 这里应该调用实际的连接更新逻辑
    connectionInfo.lastUpdated = Date.now();
    connectionInfo.state = branch.state;
  }

  /**
   * 同步预览线
   * @param {BranchInfo} branch - 分支信息
   * @param {Object} connectionInfo - 连接信息
   */
  async syncPreviewLine(branch, connectionInfo) {
    // 这里应该调用实际的预览线同步逻辑
    // 暂时使用模拟实现
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟预览线同步
        resolve();
      }, 10);
    });
  }

  /**
   * 启动自动同步
   */
  startAutoSync() {
    if (this.syncTimer) return;

    const sync = () => {
      if (this.pendingSyncs.size > 0) {
        this.performSync();
      }
      this.syncTimer = setTimeout(sync, this.options.syncInterval);
    };

    this.syncTimer = setTimeout(sync, this.options.syncInterval);
    // console.log(`🔄 [分流管理器] 启动自动同步 - 间隔: ${this.options.syncInterval}ms`);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
      // console.log(`⏸️ [分流管理器] 停止自动同步`);
    }
  }

  /**
   * 手动同步所有分支
   */
  async syncAll() {
    const allBranchIds = Array.from(this.branches.keys());
    this.pendingSyncs.clear();
    allBranchIds.forEach(id => this.pendingSyncs.add(id));
    await this.performSync();
  }

  /**
   * 添加验证器
   * @param {string} name - 验证器名称
   * @param {Function} validator - 验证器函数
   */
  addValidator(name, validator) {
    this.validators.set(name, validator);
  }

  /**
   * 移除验证器
   * @param {string} name - 验证器名称
   */
  removeValidator(name) {
    this.validators.delete(name);
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
          // console.error(`❌ [分流管理器] 事件监听器错误:`, error);
        }
      });
    }
  }

  /**
   * 获取分支信息
   * @param {string} branchId - 分支ID
   * @returns {BranchInfo|null} 分支信息
   */
  getBranch(branchId) {
    return this.branches.get(branchId) || null;
  }

  /**
   * 获取所有分支
   * @returns {Array} 分支列表
   */
  getAllBranches() {
    return Array.from(this.branches.values());
  }

  /**
   * 获取分支统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const branchStates = {};
    const branchTypes = {};

    this.branches.forEach(branch => {
      branchStates[branch.state] = (branchStates[branch.state] || 0) + 1;
      branchTypes[branch.type] = (branchTypes[branch.type] || 0) + 1;
    });

    return {
      ...this.stats,
      branchStates,
      branchTypes,
      pendingSyncs: this.pendingSyncs.size,
      lastSyncTime: this.lastSyncTime,
      flowTracker: {
        trackedNodes: this.flowTracker.flowStates.size,
        totalStateChanges: Array.from(this.flowTracker.flowMetrics.values())
          .reduce((sum, metrics) => sum + metrics.totalStateChanges, 0)
      }
    };
  }

  /**
   * 获取流状态跟踪器
   * @returns {FlowStateTracker} 流状态跟踪器
   */
  getFlowTracker() {
    return this.flowTracker;
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 停止自动同步
    this.stopAutoSync();

    // 清空数据
    this.branches.clear();
    this.nodeBranches.clear();
    this.branchConnections.clear();
    this.pendingSyncs.clear();

    // 清理流状态跟踪器
    this.flowTracker.clearAllStates();

    // 清空事件监听器
    this.eventListeners.clear();

    // 清空验证器（保留默认验证器）
    this.validators.clear();
    this.setupDefaultValidators();

    // console.log(`🗑️ [分流管理器] 资源清理完成`);
  }
}

export default BranchFlowManager;