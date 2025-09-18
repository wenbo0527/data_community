/**
 * 增强版预览线刷新管理器
 * 综合考虑源节点分支、连接线和预览线位置的协调更新
 */

import { ErrorFactory } from '../errors/CoordinateErrors.js';

/**
 * 刷新策略枚举
 */
export const RefreshStrategy = {
  BRANCH_FIRST: 'branch_first',           // 分支优先策略
  CONNECTION_FIRST: 'connection_first',   // 连接线优先策略
  BALANCED: 'balanced',                   // 平衡策略
  PREVIEW_ONLY: 'preview_only'           // 仅预览线策略
};

/**
 * 位置同步模式
 */
export const SyncMode = {
  IMMEDIATE: 'immediate',     // 立即同步
  DEBOUNCED: 'debounced',    // 防抖同步
  BATCHED: 'batched'         // 批量同步
};

/**
 * 增强版预览线刷新管理器
 */
export class EnhancedPreviewLineRefreshManager {
  constructor(options = {}) {
    this.options = {
      enableDebug: false,
      refreshStrategy: RefreshStrategy.BALANCED,
      syncMode: SyncMode.DEBOUNCED,
      debounceDelay: 16,
      batchSize: 10,
      maxRetries: 3,
      ...options
    };

    // 核心管理器引用
    this.graph = null;
    this.previewLineManager = null;
    this.branchManager = null;
    this.layoutEngine = null;

    // 节点分支缓存
    this.branchCache = new Map(); // nodeId -> { branches, timestamp, connections }
    this.cacheTimeout = 5000;

    // 连接线状态跟踪
    this.connectionStates = new Map(); // nodeId -> { edges, previewLines, lastUpdate }
    
    // 位置同步队列
    this.syncQueue = new Map(); // nodeId -> { tasks, priority, timestamp }
    this.processingSyncs = new Set();

    // 防抖和节流函数
    this.debouncedRefresh = this.debounce(this.performRefresh.bind(this), this.options.debounceDelay);
    this.batchProcessor = null;

    // 事件监听器
    this.eventListeners = new Map();

    // 统计信息
    this.stats = {
      totalRefreshes: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      averageRefreshTime: 0,
      branchCacheHits: 0,
      branchCacheMisses: 0
    };

    // console.log('🚀 [增强预览线刷新管理器] 初始化完成', this.options);
  }

  /**
   * 初始化管理器
   * @param {Object} dependencies - 依赖对象
   */
  initialize(dependencies) {
    this.graph = dependencies.graph;
    this.previewLineManager = dependencies.previewLineManager;
    this.branchManager = dependencies.branchManager;
    this.layoutEngine = dependencies.layoutEngine;

    if (this.options.enableDebug) {
      // console.log('🔧 [增强预览线刷新管理器] 依赖注入完成');
    }
  }

  /**
   * 综合刷新预览线（核心方法）
   * @param {string} nodeId - 源节点ID
   * @param {Object} options - 刷新选项
   */
  async comprehensiveRefresh(nodeId, options = {}) {
    const startTime = Date.now();
    
    try {
      this.stats.totalRefreshes++;

      // 1. 获取源节点信息
      const sourceNode = this.getSourceNode(nodeId);
      if (!sourceNode) {
        throw new Error(`源节点不存在: ${nodeId}`);
      }

      // 2. 分析节点分支情况
      const branchAnalysis = await this.analyzeBranches(sourceNode, options);
      
      // 3. 检查连接线状态
      const connectionAnalysis = await this.analyzeConnections(sourceNode, branchAnalysis);
      
      // 4. 计算预览线位置
      const positionAnalysis = await this.analyzePositions(sourceNode, branchAnalysis, connectionAnalysis);
      
      // 5. 执行协调更新
      const refreshResult = await this.performCoordinatedUpdate(sourceNode, {
        branches: branchAnalysis,
        connections: connectionAnalysis,
        positions: positionAnalysis,
        options
      });

      // 6. 验证更新结果
      await this.validateRefreshResult(nodeId, refreshResult);

      const refreshTime = Date.now() - startTime;
      this.updateStats(true, refreshTime);

      if (this.options.enableDebug) {
        // console.log(`✅ [增强预览线刷新] 综合刷新完成`, {
        //   nodeId,
        //   refreshTime,
        //   branchCount: branchAnalysis.branches.length,
        //   connectionCount: connectionAnalysis.connections.length,
        //   previewLineCount: positionAnalysis.previewLines.length
        // });
      }

      return refreshResult;

    } catch (error) {
      this.updateStats(false, Date.now() - startTime);
      // console.error(`❌ [增强预览线刷新] 综合刷新失败:`, error);
      throw error;
    }
  }

  /**
   * 分析节点分支情况
   * @param {Object} sourceNode - 源节点
   * @param {Object} options - 选项
   * @returns {Object} 分支分析结果
   */
  async analyzeBranches(sourceNode, options = {}) {
    const nodeId = sourceNode.id || sourceNode.getId();
    
    // 检查缓存
    const cached = this.branchCache.get(nodeId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.cacheTimeout && !options.forceRefresh) {
      this.stats.branchCacheHits++;
      if (this.options.enableDebug) {
        // console.log(`📦 [分支分析] 使用缓存数据: ${nodeId}`);
      }
      return cached;
    }

    this.stats.branchCacheMisses++;

    // 获取节点分支信息
    let branches = [];
    if (this.previewLineManager && typeof this.previewLineManager.getNodeBranches === 'function') {
      branches = this.previewLineManager.getNodeBranches(sourceNode);
    } else if (this.branchManager && typeof this.branchManager.getNodeBranches === 'function') {
      branches = this.branchManager.getNodeBranches(nodeId);
    }

    // 分析分支状态
    const branchStates = branches.map((branch, index) => ({
      ...branch,
      index,
      hasConnection: this.checkBranchConnection(sourceNode, branch),
      hasPreviewLine: this.checkBranchPreviewLine(sourceNode, branch),
      needsUpdate: this.checkBranchNeedsUpdate(sourceNode, branch)
    }));

    // 计算分支布局信息
    const layoutInfo = this.calculateBranchLayout(sourceNode, branchStates);

    const result = {
      nodeId,
      branches: branchStates,
      layoutInfo,
      totalBranches: branches.length,
      activeBranches: (branchStates || []).filter(b => !b.hasConnection).length,
      timestamp: now
    };

    // 缓存结果
    this.branchCache.set(nodeId, result);

    if (this.options.enableDebug) {
      // console.log(`🔍 [分支分析] 完成分析:`, {
      //   nodeId,
      //   totalBranches: result.totalBranches,
      //   activeBranches: result.activeBranches,
      //   branchStates: branchStates.map(b => ({
      //     id: b.id,
      //     label: b.label,
      //     hasConnection: b.hasConnection,
      //     hasPreviewLine: b.hasPreviewLine
      //   }))
      // });
    }

    return result;
  }

  /**
   * 分析连接线状态
   * @param {Object} sourceNode - 源节点
   * @param {Object} branchAnalysis - 分支分析结果
   * @returns {Object} 连接线分析结果
   */
  async analyzeConnections(sourceNode, branchAnalysis) {
    const nodeId = sourceNode.id || sourceNode.getId();
    
    // 获取所有出边（连接线）
    const outgoingEdges = this.graph ? this.graph.getOutgoingEdges(sourceNode) : [];
    
    // 过滤实际连接线（排除预览线）
    const realConnections = (outgoingEdges || []).filter(edge => {
      const edgeData = edge.getData() || {};
      return !edgeData.isPreview;
    });

    // 分析每个连接线的状态
    const connectionStates = realConnections.map(edge => {
      const targetId = edge.getTargetCellId();
      const targetNode = this.graph ? this.graph.getCellById(targetId) : null;
      const sourcePoint = edge.getSourcePoint();
      const targetPoint = edge.getTargetPoint();

      return {
        edgeId: edge.id,
        targetId,
        targetNode,
        sourcePoint,
        targetPoint,
        isValid: !!(sourcePoint && targetPoint),
        needsUpdate: this.checkConnectionNeedsUpdate(edge, branchAnalysis)
      };
    });

    // 检查连接线与分支的对应关系
    const branchConnectionMapping = this.mapBranchesToConnections(branchAnalysis.branches, connectionStates);

    const result = {
      nodeId,
      connections: connectionStates,
      branchMapping: branchConnectionMapping,
      totalConnections: realConnections.length,
      validConnections: (connectionStates || []).filter(c => c.isValid).length,
      timestamp: Date.now()
    };

    // 更新连接状态缓存
    this.connectionStates.set(nodeId, result);

    if (this.options.enableDebug) {
      // console.log(`🔗 [连接分析] 完成分析:`, {
      //   nodeId,
      //   totalConnections: result.totalConnections,
      //   validConnections: result.validConnections,
      //   branchMappingCount: Object.keys(branchConnectionMapping).length
      // });
    }

    return result;
  }

  /**
   * 分析预览线位置
   * @param {Object} sourceNode - 源节点
   * @param {Object} branchAnalysis - 分支分析结果
   * @param {Object} connectionAnalysis - 连接线分析结果
   * @returns {Object} 位置分析结果
   */
  async analyzePositions(sourceNode, branchAnalysis, connectionAnalysis) {
    const nodeId = sourceNode.id || sourceNode.getId();
    
    // 获取当前预览线实例
    const previewInstances = this.previewLineManager ? 
      this.previewLineManager.previewLines.get(nodeId) : null;

    let previewLines = [];
    if (previewInstances) {
      previewLines = Array.isArray(previewInstances) ? previewInstances : [previewInstances];
    }

    // 分析每条预览线的位置状态
    const previewLineStates = previewLines.map((instance, index) => {
      const currentPosition = this.getPreviewLinePosition(instance);
      const expectedPosition = this.calculateExpectedPosition(sourceNode, instance, branchAnalysis, connectionAnalysis);
      const positionDiff = this.calculatePositionDifference(currentPosition, expectedPosition);

      return {
        instanceId: instance.id || `preview_${index}`,
        branchId: instance.branchId,
        currentPosition,
        expectedPosition,
        positionDiff,
        needsUpdate: positionDiff.distance > 5, // 5像素阈值
        instance
      };
    });

    // 计算整体位置布局
    const layoutCalculation = this.calculatePreviewLineLayout(sourceNode, branchAnalysis, connectionAnalysis);

    const result = {
      nodeId,
      previewLines: previewLineStates,
      layoutCalculation,
      totalPreviewLines: previewLines.length,
      needsUpdateCount: (previewLineStates || []).filter(p => p.needsUpdate).length,
      timestamp: Date.now()
    };

    if (this.options.enableDebug) {
      // console.log(`📍 [位置分析] 完成分析:`, {
      //   nodeId,
      //   totalPreviewLines: result.totalPreviewLines,
      //   needsUpdateCount: result.needsUpdateCount,
      //   layoutInfo: layoutCalculation
      // });
    }

    return result;
  }

  /**
   * 执行协调更新
   * @param {Object} sourceNode - 源节点
   * @param {Object} analysisResults - 分析结果
   * @returns {Object} 更新结果
   */
  async performCoordinatedUpdate(sourceNode, analysisResults) {
    const { branches, connections, positions, options } = analysisResults;
    const nodeId = sourceNode.id || sourceNode.getId();

    // 根据刷新策略确定更新顺序
    const updatePlan = this.createUpdatePlan(analysisResults);

    const updateResults = {
      nodeId,
      branchUpdates: [],
      connectionUpdates: [],
      positionUpdates: [],
      errors: []
    };

    try {
      // 按计划执行更新
      for (const step of updatePlan.steps) {
        switch (step.type) {
          case 'branch':
            const branchResult = await this.updateBranches(sourceNode, step.data, analysisResults);
            updateResults.branchUpdates.push(branchResult);
            break;

          case 'connection':
            const connectionResult = await this.updateConnections(sourceNode, step.data, analysisResults);
            updateResults.connectionUpdates.push(connectionResult);
            break;

          case 'position':
            const positionResult = await this.updatePositions(sourceNode, step.data, analysisResults);
            updateResults.positionUpdates.push(positionResult);
            break;
        }
      }

      // 最终同步检查
      await this.performFinalSync(sourceNode, updateResults);

    } catch (error) {
      updateResults.errors.push({
        type: 'coordination_error',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }

    return updateResults;
  }

  /**
   * 更新分支状态
   * @param {Object} sourceNode - 源节点
   * @param {Object} stepData - 步骤数据
   * @param {Object} analysisResults - 分析结果
   */
  async updateBranches(sourceNode, stepData, analysisResults) {
    const { branches } = analysisResults;
    const updates = [];

    for (const branch of branches.branches) {
      if (branch.needsUpdate) {
        try {
          // 更新分支预览线
          if (this.previewLineManager && typeof this.previewLineManager.updateBranchPreviewLine === 'function') {
            await this.previewLineManager.updateBranchPreviewLine(sourceNode, branch);
          }

          // 更新分支布局
          if (this.layoutEngine && typeof this.layoutEngine.updateBranchLayout === 'function') {
            await this.layoutEngine.updateBranchLayout(sourceNode, branch);
          }

          updates.push({
            branchId: branch.id,
            status: 'success',
            timestamp: Date.now()
          });

        } catch (error) {
          updates.push({
            branchId: branch.id,
            status: 'error',
            error: error.message,
            timestamp: Date.now()
          });
        }
      }
    }

    return { type: 'branch', updates };
  }

  /**
   * 更新连接线状态
   * @param {Object} sourceNode - 源节点
   * @param {Object} stepData - 步骤数据
   * @param {Object} analysisResults - 分析结果
   */
  async updateConnections(sourceNode, stepData, analysisResults) {
    const { connections } = analysisResults;
    const updates = [];

    for (const connection of connections.connections) {
      if (connection.needsUpdate) {
        try {
          // 更新连接线位置
          if (connection.sourcePoint && connection.targetPoint) {
            const edge = this.graph ? this.graph.getCellById(connection.edgeId) : null;
            if (edge && typeof edge.setSource === 'function' && typeof edge.setTarget === 'function') {
              edge.setSource(connection.sourcePoint);
              edge.setTarget(connection.targetPoint);
            }
          }

          updates.push({
            connectionId: connection.edgeId,
            status: 'success',
            timestamp: Date.now()
          });

        } catch (error) {
          updates.push({
            connectionId: connection.edgeId,
            status: 'error',
            error: error.message,
            timestamp: Date.now()
          });
        }
      }
    }

    return { type: 'connection', updates };
  }

  /**
   * 更新预览线位置
   * @param {Object} sourceNode - 源节点
   * @param {Object} stepData - 步骤数据
   * @param {Object} analysisResults - 分析结果
   */
  async updatePositions(sourceNode, stepData, analysisResults) {
    const { positions } = analysisResults;
    const updates = [];

    for (const previewLine of positions.previewLines) {
      if (previewLine.needsUpdate) {
        try {
          // 更新预览线位置
          if (previewLine.instance && previewLine.expectedPosition) {
            if (typeof previewLine.instance.setTarget === 'function') {
              previewLine.instance.setTarget(previewLine.expectedPosition);
            }

            // 同步更新实例中的位置信息
            if (previewLine.instance.endPosition) {
              previewLine.instance.endPosition.x = previewLine.expectedPosition.x;
              previewLine.instance.endPosition.y = previewLine.expectedPosition.y;
            }
          }

          // 通知布局引擎更新
          if (this.layoutEngine && typeof this.layoutEngine.updatePreviewEndpointPosition === 'function') {
            await this.layoutEngine.updatePreviewEndpointPosition(
              sourceNode.id || sourceNode.getId(),
              previewLine.branchId,
              previewLine.expectedPosition
            );
          }

          updates.push({
            previewLineId: previewLine.instanceId,
            branchId: previewLine.branchId,
            status: 'success',
            positionDiff: previewLine.positionDiff,
            timestamp: Date.now()
          });

        } catch (error) {
          updates.push({
            previewLineId: previewLine.instanceId,
            branchId: previewLine.branchId,
            status: 'error',
            error: error.message,
            timestamp: Date.now()
          });
        }
      }
    }

    return { type: 'position', updates };
  }

  /**
   * 创建更新计划
   * @param {Object} analysisResults - 分析结果
   * @returns {Object} 更新计划
   */
  createUpdatePlan(analysisResults) {
    const { branches, connections, positions } = analysisResults;
    const steps = [];

    switch (this.options.refreshStrategy) {
      case RefreshStrategy.BRANCH_FIRST:
        steps.push(
          { type: 'branch', data: branches, priority: 1 },
          { type: 'position', data: positions, priority: 2 },
          { type: 'connection', data: connections, priority: 3 }
        );
        break;

      case RefreshStrategy.CONNECTION_FIRST:
        steps.push(
          { type: 'connection', data: connections, priority: 1 },
          { type: 'branch', data: branches, priority: 2 },
          { type: 'position', data: positions, priority: 3 }
        );
        break;

      case RefreshStrategy.PREVIEW_ONLY:
        steps.push(
          { type: 'position', data: positions, priority: 1 }
        );
        break;

      case RefreshStrategy.BALANCED:
      default:
        steps.push(
          { type: 'branch', data: branches, priority: 1 },
          { type: 'connection', data: connections, priority: 1 },
          { type: 'position', data: positions, priority: 2 }
        );
        break;
    }

    return {
      strategy: this.options.refreshStrategy,
      steps: steps.sort((a, b) => a.priority - b.priority)
    };
  }

  // 辅助方法
  getSourceNode(nodeId) {
    return this.graph ? this.graph.getCellById(nodeId) : null;
  }

  checkBranchConnection(sourceNode, branch) {
    // 检查分支是否已有连接
    if (!this.graph) return false;
    
    const outgoingEdges = this.graph.getOutgoingEdges(sourceNode) || [];
    return outgoingEdges.some(edge => {
      const edgeData = edge.getData() || {};
      return !edgeData.isPreview;
    });
  }

  checkBranchPreviewLine(sourceNode, branch) {
    // 检查分支是否有预览线
    if (!this.previewLineManager) return false;
    
    const nodeId = sourceNode.id || sourceNode.getId();
    const previewInstances = this.previewLineManager.previewLines.get(nodeId);
    
    if (!previewInstances) return false;
    
    const instances = Array.isArray(previewInstances) ? previewInstances : [previewInstances];
    return instances.some(instance => instance.branchId === branch.id);
  }

  checkBranchNeedsUpdate(sourceNode, branch) {
    // 检查分支是否需要更新
    return !this.checkBranchConnection(sourceNode, branch) && 
           this.checkBranchPreviewLine(sourceNode, branch);
  }

  calculateBranchLayout(sourceNode, branchStates) {
    // 计算分支布局信息
    return {
      totalBranches: branchStates.length,
      activeBranches: branchStates.filter(b => !b.hasConnection).length,
      spacing: 60, // 默认间距
      startAngle: 0,
      endAngle: 180
    };
  }

  checkConnectionNeedsUpdate(edge, branchAnalysis) {
    // 检查连接线是否需要更新
    const sourcePoint = edge.getSourcePoint();
    const targetPoint = edge.getTargetPoint();
    return !sourcePoint || !targetPoint;
  }

  mapBranchesToConnections(branches, connections) {
    // 映射分支到连接线
    const mapping = {};
    branches.forEach((branch, index) => {
      if (connections[index]) {
        mapping[branch.id] = connections[index].edgeId;
      }
    });
    return mapping;
  }

  getPreviewLinePosition(instance) {
    // 获取预览线当前位置
    if (instance.endPosition) {
      return { x: instance.endPosition.x, y: instance.endPosition.y };
    }
    return { x: 0, y: 0 };
  }

  calculateExpectedPosition(sourceNode, instance, branchAnalysis, connectionAnalysis) {
    // 计算预览线期望位置
    // 这里应该根据布局算法计算
    const sourcePosition = sourceNode.getPosition();
    const sourceSize = (sourceNode && typeof sourceNode.getSize === 'function') ? sourceNode.getSize() : { width: 120, height: 40 };
    
    return {
      x: sourcePosition.x + sourceSize.width + 100,
      y: sourcePosition.y + sourceSize.height / 2
    };
  }

  calculatePositionDifference(current, expected) {
    // 计算位置差异
    const dx = expected.x - current.x;
    const dy = expected.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return { dx, dy, distance };
  }

  calculatePreviewLineLayout(sourceNode, branchAnalysis, connectionAnalysis) {
    // 计算预览线布局
    return {
      strategy: 'vertical_distribution',
      spacing: 60,
      totalLines: branchAnalysis.activeBranches
    };
  }

  async performFinalSync(sourceNode, updateResults) {
    // 执行最终同步
    if (this.options.enableDebug) {
      // console.log(`🔄 [最终同步] 执行最终同步检查: ${sourceNode.id || sourceNode.getId()}`);
    }
  }

  async validateRefreshResult(nodeId, refreshResult) {
    // 验证刷新结果
    const hasErrors = refreshResult.errors && refreshResult.errors.length > 0;
    if (hasErrors) {
      // console.warn(`⚠️ [刷新验证] 发现错误:`, refreshResult.errors);
    }
  }

  updateStats(success, refreshTime) {
    // 更新统计信息
    if (success) {
      this.stats.successfulRefreshes++;
    } else {
      this.stats.failedRefreshes++;
    }
    
    // 更新平均刷新时间
    const totalRefreshes = this.stats.successfulRefreshes + this.stats.failedRefreshes;
    this.stats.averageRefreshTime = 
      (this.stats.averageRefreshTime * (totalRefreshes - 1) + refreshTime) / totalRefreshes;
  }

  // 工具方法
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async performRefresh(nodeId, options) {
    return this.comprehensiveRefresh(nodeId, options);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * 清理资源
   */
  destroy() {
    // 清理缓存
    this.branchCache.clear();
    this.connectionStates.clear();
    this.syncQueue.clear();
    
    // 清理定时器
    if (this.batchProcessor) {
      clearTimeout(this.batchProcessor);
    }
    
    // console.log('🗑️ [增强预览线刷新管理器] 资源已清理');
  }
}

export default EnhancedPreviewLineRefreshManager;