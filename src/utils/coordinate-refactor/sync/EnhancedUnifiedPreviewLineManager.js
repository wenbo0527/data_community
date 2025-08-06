/**
 * 增强版统一预览线管理器
 * 集成坐标重构模块，提供更强大的预览线管理功能
 */

import { CoordinateRefactorSystem } from '../index.js';
import { PreviewLineRefreshManager, RefreshPriority } from './PreviewLineRefreshManager.js';
import { BranchFlowManager, BranchType, BranchState } from './BranchFlowManager.js';
import { ErrorFactory } from '../errors/CoordinateErrors.js';

/**
 * 预览线类型枚举
 */
export const PreviewLineType = {
  NORMAL: 'normal',
  SPLIT: 'split',
  MERGE: 'merge',
  LOOP: 'loop',
  CONDITIONAL: 'conditional'
};

/**
 * 预览线状态枚举
 */
export const PreviewLineState = {
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  ACTIVE: 'active',
  ERROR: 'error',
  UPDATING: 'updating'
};

/**
 * 预览线信息类
 */
class PreviewLineInfo {
  constructor(id, sourceNodeId, targetNodeId, type = PreviewLineType.NORMAL) {
    this.id = id;
    this.sourceNodeId = sourceNodeId;
    this.targetNodeId = targetNodeId;
    this.type = type;
    this.state = PreviewLineState.HIDDEN;
    this.position = { x1: 0, y1: 0, x2: 0, y2: 0 };
    this.style = {};
    this.metadata = {};
    this.createdAt = Date.now();
    this.lastUpdated = Date.now();
    this.updateCount = 0;
    this.errorCount = 0;
    this.lastError = null;
  }

  /**
   * 更新位置
   */
  updatePosition(newPosition) {
    this.position = { ...newPosition };
    this.lastUpdated = Date.now();
    this.updateCount++;
  }

  /**
   * 更新状态
   */
  updateState(newState, reason = '') {
    const oldState = this.state;
    this.state = newState;
    this.lastUpdated = Date.now();

    if (newState === PreviewLineState.ERROR) {
      this.errorCount++;
      this.lastError = reason;
    }

    return { oldState, newState, reason };
  }

  /**
   * 更新样式
   */
  updateStyle(newStyle) {
    this.style = { ...this.style, ...newStyle };
    this.lastUpdated = Date.now();
  }

  /**
   * 获取摘要信息
   */
  getSummary() {
    return {
      id: this.id,
      source: this.sourceNodeId,
      target: this.targetNodeId,
      type: this.type,
      state: this.state,
      position: this.position,
      updateCount: this.updateCount,
      errorCount: this.errorCount,
      uptime: Date.now() - this.createdAt
    };
  }
}

/**
 * 增强版统一预览线管理器
 */
export class EnhancedUnifiedPreviewLineManager {
  constructor(options = {}) {
    this.options = {
      enableCoordinateRefactor: true,
      enablePreviewLineRefresh: true,
      enableBranchFlow: true,
      enableAutoUpdate: true,
      updateInterval: 100,
      maxPreviewLines: 1000,
      enableDebug: false,
      enablePerformanceTracking: true,
      enableValidation: true,
      ...options
    };

    // 预览线管理
    this.previewLines = new Map(); // id -> PreviewLineInfo
    this.nodePreviewLines = new Map(); // nodeId -> Set<previewLineId>
    this.typePreviewLines = new Map(); // type -> Set<previewLineId>

    // 集成重构系统
    if (this.options.enableCoordinateRefactor) {
      this.coordinateSystem = new CoordinateRefactorSystem({
        enableDebug: this.options.enableDebug,
        enableValidation: this.options.enableValidation
      });
    }

    // 集成预览线刷新管理器
    if (this.options.enablePreviewLineRefresh) {
      this.refreshManager = new PreviewLineRefreshManager({
        enableDebug: this.options.enableDebug,
        batchSize: this.options.refreshBatchSize || 20,
        batchDelay: this.options.refreshBatchDelay || 50
      });
    }

    // 集成分流管理器
    if (this.options.enableBranchFlow) {
      this.branchFlowManager = new BranchFlowManager({
        enableDebug: this.options.enableDebug,
        enableAutoSync: this.options.enableAutoSync !== false,
        syncInterval: this.options.branchSyncInterval || 500
      });
    }

    // 自动更新定时器
    this.updateTimer = null;
    if (this.options.enableAutoUpdate) {
      this.startAutoUpdate();
    }

    // 事件监听器
    this.eventListeners = new Map();
    this.setupEventListeners();

    // 性能统计
    this.stats = {
      totalPreviewLines: 0,
      activePreviewLines: 0,
      updateOperations: 0,
      refreshOperations: 0,
      errorCount: 0,
      averageUpdateTime: 0,
      lastUpdateTime: 0
    };

    console.log(`🎯 [增强版预览线管理器] 初始化完成 - 坐标重构: ${this.options.enableCoordinateRefactor}, 刷新管理: ${this.options.enablePreviewLineRefresh}, 分流管理: ${this.options.enableBranchFlow}`);
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听刷新管理器事件
    if (this.refreshManager) {
      this.refreshManager.addEventListener('taskCompleted', (event) => {
        this.handleRefreshCompleted(event);
      });

      this.refreshManager.addEventListener('nodeStateChanged', (event) => {
        this.handleNodeStateChanged(event);
      });
    }

    // 监听分流管理器事件
    if (this.branchFlowManager) {
      this.branchFlowManager.addEventListener('branchActivated', (event) => {
        this.handleBranchActivated(event);
      });

      this.branchFlowManager.addEventListener('branchDeactivated', (event) => {
        this.handleBranchDeactivated(event);
      });
    }
  }

  /**
   * 创建预览线
   * @param {string} id - 预览线ID
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} type - 预览线类型
   * @param {Object} options - 创建选项
   * @returns {PreviewLineInfo} 预览线信息
   */
  createPreviewLine(id, sourceNodeId, targetNodeId, type = PreviewLineType.NORMAL, options = {}) {
    // 检查预览线数量限制
    if (this.previewLines.size >= this.options.maxPreviewLines) {
      throw ErrorFactory.createPreviewLineRefreshError(`预览线数量已达上限: ${this.options.maxPreviewLines}`);
    }

    // 检查预览线是否已存在
    if (this.previewLines.has(id)) {
      throw ErrorFactory.createPreviewLineRefreshError(`预览线已存在: ${id}`);
    }

    // 创建预览线信息
    const previewLine = new PreviewLineInfo(id, sourceNodeId, targetNodeId, type);
    
    // 应用选项
    if (options.position) previewLine.updatePosition(options.position);
    if (options.style) previewLine.updateStyle(options.style);
    if (options.metadata) previewLine.metadata = { ...options.metadata };

    // 存储预览线
    this.previewLines.set(id, previewLine);

    // 更新索引
    this.addNodePreviewLine(sourceNodeId, id);
    this.addNodePreviewLine(targetNodeId, id);
    this.addTypePreviewLine(type, id);

    // 创建对应的分支（如果启用分流管理）
    if (this.branchFlowManager && type !== PreviewLineType.NORMAL) {
      this.createCorrespondingBranch(previewLine, options);
    }

    // 跟踪节点挂载状态（如果启用刷新管理）
    if (this.refreshManager) {
      this.trackNodeMounting(sourceNodeId, targetNodeId);
    }

    // 更新统计
    this.stats.totalPreviewLines++;

    // 触发事件
    this.emitEvent('previewLineCreated', { 
      previewLineId: id, 
      previewLine: previewLine.getSummary() 
    });

    if (this.options.enableDebug) {
      console.log(`➕ [增强版预览线管理器] 创建预览线 - ID: ${id}, 源: ${sourceNodeId}, 目标: ${targetNodeId}, 类型: ${type}`);
    }

    return previewLine;
  }

  /**
   * 添加节点预览线映射
   */
  addNodePreviewLine(nodeId, previewLineId) {
    if (!this.nodePreviewLines.has(nodeId)) {
      this.nodePreviewLines.set(nodeId, new Set());
    }
    this.nodePreviewLines.get(nodeId).add(previewLineId);
  }

  /**
   * 添加类型预览线映射
   */
  addTypePreviewLine(type, previewLineId) {
    if (!this.typePreviewLines.has(type)) {
      this.typePreviewLines.set(type, new Set());
    }
    this.typePreviewLines.get(type).add(previewLineId);
  }

  /**
   * 创建对应的分支
   */
  createCorrespondingBranch(previewLine, options) {
    try {
      const branchType = this.mapPreviewLineTypeToBranchType(previewLine.type);
      const branchId = `branch_${previewLine.id}`;
      
      this.branchFlowManager.createBranch(
        branchId,
        previewLine.sourceNodeId,
        previewLine.targetNodeId,
        branchType,
        {
          condition: options.condition,
          weight: options.weight || 1,
          priority: options.priority || 0,
          metadata: { previewLineId: previewLine.id, ...options.metadata }
        }
      );

      previewLine.metadata.branchId = branchId;
    } catch (error) {
      console.error(`❌ [增强版预览线管理器] 创建对应分支失败:`, error.message);
    }
  }

  /**
   * 映射预览线类型到分支类型
   */
  mapPreviewLineTypeToBranchType(previewLineType) {
    const mapping = {
      [PreviewLineType.SPLIT]: BranchType.EXCLUSIVE,
      [PreviewLineType.MERGE]: BranchType.INCLUSIVE,
      [PreviewLineType.LOOP]: BranchType.LOOP,
      [PreviewLineType.CONDITIONAL]: BranchType.CONDITION
    };
    return mapping[previewLineType] || BranchType.CONDITION;
  }

  /**
   * 跟踪节点挂载
   */
  trackNodeMounting(sourceNodeId, targetNodeId) {
    // 获取节点DOM元素
    const sourceElement = this.getNodeElement(sourceNodeId);
    const targetElement = this.getNodeElement(targetNodeId);

    if (sourceElement) {
      this.refreshManager.trackNodeMount(sourceNodeId, sourceElement);
    }
    if (targetElement) {
      this.refreshManager.trackNodeMount(targetNodeId, targetElement);
    }
  }

  /**
   * 获取节点DOM元素
   */
  getNodeElement(nodeId) {
    // 这里应该根据实际项目的DOM结构来获取节点元素
    // 暂时返回模拟元素
    return document.querySelector(`[data-node-id="${nodeId}"]`);
  }

  /**
   * 更新预览线位置
   * @param {string} previewLineId - 预览线ID
   * @param {Object} newPosition - 新位置
   * @param {Object} options - 更新选项
   * @returns {Promise<boolean>} 是否成功更新
   */
  async updatePreviewLinePosition(previewLineId, newPosition, options = {}) {
    const startTime = Date.now();
    
    try {
      const previewLine = this.previewLines.get(previewLineId);
      if (!previewLine) {
        throw ErrorFactory.createPreviewLineRefreshError(`预览线不存在: ${previewLineId}`);
      }

      // 使用坐标重构系统计算精确位置
      if (this.coordinateSystem && options.useCoordinateRefactor !== false) {
        newPosition = await this.calculatePrecisePosition(previewLine, newPosition, options);
      }

      // 更新预览线状态
      previewLine.updateState(PreviewLineState.UPDATING);

      // 更新位置
      previewLine.updatePosition(newPosition);

      // 应用位置到DOM
      await this.applyPositionToDOM(previewLine);

      // 更新状态为可见
      previewLine.updateState(PreviewLineState.VISIBLE);

      // 更新统计
      this.stats.updateOperations++;
      const updateTime = Date.now() - startTime;
      this.stats.lastUpdateTime = updateTime;
      this.stats.averageUpdateTime = 
        (this.stats.averageUpdateTime * (this.stats.updateOperations - 1) + updateTime) / this.stats.updateOperations;

      // 触发事件
      this.emitEvent('previewLineUpdated', {
        previewLineId,
        newPosition,
        updateTime,
        previewLine: previewLine.getSummary()
      });

      if (this.options.enableDebug) {
        console.log(`🔄 [增强版预览线管理器] 更新预览线位置 - ID: ${previewLineId}, 耗时: ${updateTime}ms`);
      }

      return true;

    } catch (error) {
      const previewLine = this.previewLines.get(previewLineId);
      if (previewLine) {
        previewLine.updateState(PreviewLineState.ERROR, error.message);
      }

      this.stats.errorCount++;
      console.error(`❌ [增强版预览线管理器] 更新预览线位置失败:`, error.message);
      
      // 触发错误事件
      this.emitEvent('previewLineError', {
        previewLineId,
        error: error.message,
        operation: 'updatePosition'
      });

      return false;
    }
  }

  /**
   * 计算精确位置
   */
  async calculatePrecisePosition(previewLine, basePosition, options) {
    try {
      // 构建层级数据
      const layers = this.buildLayersForCalculation(previewLine, options);
      
      // 使用坐标系统计算
      const positions = await this.coordinateSystem.calculateOnly(layers, {
        strategy: options.strategy || 'adaptive',
        algorithm: options.algorithm || 'symmetric',
        precision: options.precision || 2
      });

      // 提取预览线位置
      const sourcePos = positions.get(previewLine.sourceNodeId);
      const targetPos = positions.get(previewLine.targetNodeId);

      if (sourcePos && targetPos) {
        return {
          x1: sourcePos.x,
          y1: sourcePos.y,
          x2: targetPos.x,
          y2: targetPos.y
        };
      }

      return basePosition;

    } catch (error) {
      console.warn(`⚠️ [增强版预览线管理器] 精确位置计算失败，使用基础位置:`, error.message);
      return basePosition;
    }
  }

  /**
   * 构建计算用的层级数据
   */
  buildLayersForCalculation(previewLine, options) {
    // 这里应该根据实际的节点数据构建层级
    // 暂时返回简化的层级数据
    return [
      {
        id: 'layer_0',
        nodes: [
          { id: previewLine.sourceNodeId, type: 'source' },
          { id: previewLine.targetNodeId, type: 'target' }
        ]
      }
    ];
  }

  /**
   * 应用位置到DOM
   */
  async applyPositionToDOM(previewLine) {
    // 这里应该根据实际的DOM结构来应用位置
    // 暂时使用模拟实现
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟DOM更新
        resolve();
      }, 5);
    });
  }

  /**
   * 强制刷新预览线
   * @param {string} previewLineId - 预览线ID
   * @param {Object} options - 刷新选项
   * @returns {Promise<boolean>} 是否成功刷新
   */
  async forceRefreshPreviewLine(previewLineId, options = {}) {
    const previewLine = this.previewLines.get(previewLineId);
    if (!previewLine) {
      throw ErrorFactory.createPreviewLineRefreshError(`预览线不存在: ${previewLineId}`);
    }

    try {
      // 使用刷新管理器强制刷新
      if (this.refreshManager) {
        await this.refreshManager.forceRefresh(previewLine.sourceNodeId, 'all');
        await this.refreshManager.forceRefresh(previewLine.targetNodeId, 'all');
      }

      // 重新计算位置
      const currentPosition = previewLine.position;
      await this.updatePreviewLinePosition(previewLineId, currentPosition, {
        ...options,
        forceRefresh: true
      });

      // 更新统计
      this.stats.refreshOperations++;

      // 触发事件
      this.emitEvent('previewLineRefreshed', {
        previewLineId,
        previewLine: previewLine.getSummary()
      });

      if (this.options.enableDebug) {
        console.log(`🔄 [增强版预览线管理器] 强制刷新预览线 - ID: ${previewLineId}`);
      }

      return true;

    } catch (error) {
      previewLine.updateState(PreviewLineState.ERROR, error.message);
      this.stats.errorCount++;
      
      console.error(`❌ [增强版预览线管理器] 强制刷新失败:`, error.message);
      return false;
    }
  }

  /**
   * 获取所有预览线
   * @param {Object} filters - 过滤条件
   * @returns {Array} 预览线列表
   */
  getAllPreviewLines(filters = {}) {
    let previewLines = Array.from(this.previewLines.values());

    // 应用过滤器
    if (filters.type) {
      previewLines = previewLines.filter(line => line.type === filters.type);
    }

    if (filters.state) {
      previewLines = previewLines.filter(line => line.state === filters.state);
    }

    if (filters.nodeId) {
      const nodePreviewLineIds = this.nodePreviewLines.get(filters.nodeId) || new Set();
      previewLines = previewLines.filter(line => nodePreviewLineIds.has(line.id));
    }

    if (filters.includeMetadata === false) {
      previewLines = previewLines.map(line => line.getSummary());
    }

    return previewLines;
  }

  /**
   * 获取节点的预览线
   * @param {string} nodeId - 节点ID
   * @param {string} direction - 方向 ('incoming', 'outgoing', 'all')
   * @returns {Array} 预览线列表
   */
  getNodePreviewLines(nodeId, direction = 'all') {
    const previewLineIds = this.nodePreviewLines.get(nodeId) || new Set();
    const previewLines = [];

    for (const id of previewLineIds) {
      const previewLine = this.previewLines.get(id);
      if (!previewLine) continue;

      if (direction === 'all' ||
          (direction === 'incoming' && previewLine.targetNodeId === nodeId) ||
          (direction === 'outgoing' && previewLine.sourceNodeId === nodeId)) {
        previewLines.push(previewLine);
      }
    }

    return previewLines;
  }

  /**
   * 批量更新预览线
   * @param {Array} updates - 更新列表
   * @param {Object} options - 批量更新选项
   * @returns {Promise<Object>} 批量更新结果
   */
  async batchUpdatePreviewLines(updates, options = {}) {
    const startTime = Date.now();
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      // 并行处理更新
      const updatePromises = updates.map(async (update) => {
        try {
          await this.updatePreviewLinePosition(update.id, update.position, update.options);
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            previewLineId: update.id,
            error: error.message
          });
        }
      });

      await Promise.allSettled(updatePromises);

      // 触发批量更新完成事件
      this.emitEvent('batchUpdateCompleted', {
        totalUpdates: updates.length,
        successful: results.successful,
        failed: results.failed,
        duration: Date.now() - startTime
      });

      if (this.options.enableDebug) {
        console.log(`📦 [增强版预览线管理器] 批量更新完成 - 总数: ${updates.length}, 成功: ${results.successful}, 失败: ${results.failed}`);
      }

    } catch (error) {
      console.error(`❌ [增强版预览线管理器] 批量更新失败:`, error.message);
      results.errors.push({ error: error.message });
    }

    return results;
  }

  /**
   * 删除预览线
   * @param {string} previewLineId - 预览线ID
   * @returns {boolean} 是否成功删除
   */
  deletePreviewLine(previewLineId) {
    const previewLine = this.previewLines.get(previewLineId);
    if (!previewLine) {
      return false;
    }

    // 移除节点映射
    this.removeNodePreviewLine(previewLine.sourceNodeId, previewLineId);
    this.removeNodePreviewLine(previewLine.targetNodeId, previewLineId);

    // 移除类型映射
    this.removeTypePreviewLine(previewLine.type, previewLineId);

    // 删除对应的分支
    if (this.branchFlowManager && previewLine.metadata.branchId) {
      this.branchFlowManager.deleteBranch(previewLine.metadata.branchId);
    }

    // 停止跟踪节点
    if (this.refreshManager) {
      this.refreshManager.stopTrackingNode(previewLine.sourceNodeId);
      this.refreshManager.stopTrackingNode(previewLine.targetNodeId);
    }

    // 删除预览线
    this.previewLines.delete(previewLineId);

    // 更新统计
    this.stats.totalPreviewLines--;
    if (previewLine.state === PreviewLineState.ACTIVE) {
      this.stats.activePreviewLines--;
    }

    // 触发事件
    this.emitEvent('previewLineDeleted', {
      previewLineId,
      previewLine: previewLine.getSummary()
    });

    if (this.options.enableDebug) {
      console.log(`🗑️ [增强版预览线管理器] 删除预览线 - ID: ${previewLineId}`);
    }

    return true;
  }

  /**
   * 移除节点预览线映射
   */
  removeNodePreviewLine(nodeId, previewLineId) {
    const previewLines = this.nodePreviewLines.get(nodeId);
    if (previewLines) {
      previewLines.delete(previewLineId);
      if (previewLines.size === 0) {
        this.nodePreviewLines.delete(nodeId);
      }
    }
  }

  /**
   * 移除类型预览线映射
   */
  removeTypePreviewLine(type, previewLineId) {
    const previewLines = this.typePreviewLines.get(type);
    if (previewLines) {
      previewLines.delete(previewLineId);
      if (previewLines.size === 0) {
        this.typePreviewLines.delete(type);
      }
    }
  }

  /**
   * 启动自动更新
   */
  startAutoUpdate() {
    if (this.updateTimer) return;

    const update = () => {
      this.performAutoUpdate();
      this.updateTimer = setTimeout(update, this.options.updateInterval);
    };

    this.updateTimer = setTimeout(update, this.options.updateInterval);
    console.log(`🔄 [增强版预览线管理器] 启动自动更新 - 间隔: ${this.options.updateInterval}ms`);
  }

  /**
   * 停止自动更新
   */
  stopAutoUpdate() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
      console.log(`⏸️ [增强版预览线管理器] 停止自动更新`);
    }
  }

  /**
   * 执行自动更新
   */
  async performAutoUpdate() {
    try {
      // 检查需要更新的预览线
      const needsUpdate = this.getPreviewLinesNeedingUpdate();
      
      if (needsUpdate.length > 0) {
        await this.batchUpdatePreviewLines(needsUpdate.map(line => ({
          id: line.id,
          position: line.position,
          options: { autoUpdate: true }
        })));
      }

    } catch (error) {
      console.error(`❌ [增强版预览线管理器] 自动更新失败:`, error.message);
    }
  }

  /**
   * 获取需要更新的预览线
   */
  getPreviewLinesNeedingUpdate() {
    const now = Date.now();
    const updateThreshold = 5000; // 5秒未更新的预览线

    return Array.from(this.previewLines.values()).filter(line => {
      return line.state === PreviewLineState.VISIBLE && 
             (now - line.lastUpdated) > updateThreshold;
    });
  }

  /**
   * 处理刷新完成事件
   */
  handleRefreshCompleted(event) {
    const { nodeId } = event;
    
    // 更新相关预览线
    const nodePreviewLines = this.getNodePreviewLines(nodeId);
    nodePreviewLines.forEach(line => {
      this.updatePreviewLinePosition(line.id, line.position, { 
        reason: 'node_refresh_completed' 
      });
    });
  }

  /**
   * 处理节点状态变化事件
   */
  handleNodeStateChanged(event) {
    const { nodeId, newState } = event;
    
    if (newState === 'mounted') {
      // 节点挂载后，刷新相关预览线
      const nodePreviewLines = this.getNodePreviewLines(nodeId);
      nodePreviewLines.forEach(line => {
        this.forceRefreshPreviewLine(line.id, { 
          reason: 'node_mounted' 
        });
      });
    }
  }

  /**
   * 处理分支激活事件
   */
  handleBranchActivated(event) {
    const { branchId } = event;
    
    // 查找对应的预览线
    const previewLine = this.findPreviewLineByBranchId(branchId);
    if (previewLine) {
      previewLine.updateState(PreviewLineState.ACTIVE);
      this.stats.activePreviewLines++;
    }
  }

  /**
   * 处理分支停用事件
   */
  handleBranchDeactivated(event) {
    const { branchId } = event;
    
    // 查找对应的预览线
    const previewLine = this.findPreviewLineByBranchId(branchId);
    if (previewLine) {
      previewLine.updateState(PreviewLineState.VISIBLE);
      this.stats.activePreviewLines--;
    }
  }

  /**
   * 根据分支ID查找预览线
   */
  findPreviewLineByBranchId(branchId) {
    for (const previewLine of this.previewLines.values()) {
      if (previewLine.metadata.branchId === branchId) {
        return previewLine;
      }
    }
    return null;
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
          console.error(`❌ [增强版预览线管理器] 事件监听器错误:`, error);
        }
      });
    }
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const typeDistribution = {};
    const stateDistribution = {};

    this.previewLines.forEach(line => {
      typeDistribution[line.type] = (typeDistribution[line.type] || 0) + 1;
      stateDistribution[line.state] = (stateDistribution[line.state] || 0) + 1;
    });

    return {
      ...this.stats,
      typeDistribution,
      stateDistribution,
      totalNodes: this.nodePreviewLines.size,
      refreshManager: this.refreshManager ? this.refreshManager.getStatistics() : null,
      branchFlowManager: this.branchFlowManager ? this.branchFlowManager.getStatistics() : null,
      coordinateSystem: this.coordinateSystem ? this.coordinateSystem.getStatistics() : null
    };
  }

  /**
   * 重新配置管理器
   * @param {Object} newOptions - 新配置选项
   */
  reconfigure(newOptions) {
    this.options = { ...this.options, ...newOptions };

    // 重新配置子系统
    if (this.coordinateSystem && newOptions.coordinateConfig) {
      this.coordinateSystem.reconfigure(newOptions.coordinateConfig);
    }

    if (this.refreshManager && newOptions.refreshConfig) {
      this.refreshManager.reconfigure(newOptions.refreshConfig);
    }

    if (this.branchFlowManager && newOptions.branchFlowConfig) {
      this.branchFlowManager.reconfigure(newOptions.branchFlowConfig);
    }

    // 重启自动更新（如果配置改变）
    if (newOptions.enableAutoUpdate !== undefined || newOptions.updateInterval !== undefined) {
      this.stopAutoUpdate();
      if (this.options.enableAutoUpdate) {
        this.startAutoUpdate();
      }
    }

    console.log(`🔧 [增强版预览线管理器] 重新配置完成`);
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 停止自动更新
    this.stopAutoUpdate();

    // 清理子系统
    if (this.coordinateSystem) {
      this.coordinateSystem.cleanup();
    }

    if (this.refreshManager) {
      this.refreshManager.cleanup();
    }

    if (this.branchFlowManager) {
      this.branchFlowManager.cleanup();
    }

    // 清空数据
    this.previewLines.clear();
    this.nodePreviewLines.clear();
    this.typePreviewLines.clear();

    // 清空事件监听器
    this.eventListeners.clear();

    console.log(`🗑️ [增强版预览线管理器] 资源清理完成`);
  }
}

export default EnhancedUnifiedPreviewLineManager;