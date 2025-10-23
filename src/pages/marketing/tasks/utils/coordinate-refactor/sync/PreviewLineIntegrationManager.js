/**
 * 预览线集成管理器
 * 将增强版刷新管理器集成到现有的预览线系统中
 */

import { EnhancedPreviewLineRefreshManager, RefreshStrategy, SyncMode } from './EnhancedPreviewLineRefreshManager.js';

/**
 * 集成事件类型
 */
export const IntegrationEvents = {
  REFRESH_STARTED: 'refresh_started',
  REFRESH_COMPLETED: 'refresh_completed',
  REFRESH_FAILED: 'refresh_failed',
  BRANCH_UPDATED: 'branch_updated',
  CONNECTION_UPDATED: 'connection_updated',
  POSITION_UPDATED: 'position_updated'
};

/**
 * 预览线集成管理器
 */
export class PreviewLineIntegrationManager {
  constructor(options = {}) {
    this.options = {
      enableDebug: false,
      autoRefresh: true,
      refreshDelay: 1000, // 增加刷新延迟到1秒，减少频繁刷新
      maxConcurrentRefreshes: 1, // 限制并发刷新数量为1，避免资源竞争
      enableEventLogging: false, // 关闭事件日志，减少日志输出
      ...options
    };

    // 核心组件
    this.enhancedRefreshManager = null;
    this.originalPreviewLineManager = null;
    this.graph = null;
    this.layoutEngine = null;

    // 状态管理
    this.isInitialized = false;
    this.activeRefreshes = new Set();
    this.refreshQueue = [];
    this.eventListeners = new Map();

    // 性能监控
    this.performanceMetrics = {
      totalIntegrationCalls: 0,
      successfulIntegrations: 0,
      failedIntegrations: 0,
      averageIntegrationTime: 0,
      lastRefreshTime: null
    };

    // console.log('🔧 [预览线集成管理器] 初始化完成');
  }

  /**
   * 初始化集成管理器
   * @param {Object} dependencies - 依赖组件
   */
  async initialize(dependencies) {
    try {
      const { graph, previewLineManager, layoutEngine, branchManager } = dependencies;

      this.graph = graph;
      this.originalPreviewLineManager = previewLineManager;
      this.layoutEngine = layoutEngine;

      // 创建增强版刷新管理器 - 增强防抖控制
      this.enhancedRefreshManager = new EnhancedPreviewLineRefreshManager({
        enableDebug: false, // 强制关闭调试日志
        refreshStrategy: RefreshStrategy.BALANCED,
        syncMode: SyncMode.DEBOUNCED,
        debounceDelay: Math.max(this.options.refreshDelay, 1000) // 确保最小1秒延迟
      });

      // 初始化增强版管理器
      await this.enhancedRefreshManager.initialize({
        graph,
        previewLineManager,
        layoutEngine,
        branchManager
      });

      // 集成到原有预览线管理器
      this.integrateWithOriginalManager();

      // 设置事件监听
      this.setupEventListeners();

      this.isInitialized = true;

      if (this.options.enableDebug) {
        // console.log('✅ [预览线集成管理器] 初始化完成，已集成增强功能');
      }

    } catch (error) {
      // console.error('❌ [预览线集成管理器] 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 集成到原有预览线管理器
   */
  integrateWithOriginalManager() {
    if (!this.originalPreviewLineManager) {
      // console.warn('⚠️ [预览线集成] 原有预览线管理器不存在');
      return;
    }

    // 保存原有方法
    const originalMethods = {
      updatePreviewLinePosition: this.originalPreviewLineManager.updatePreviewLinePosition?.bind(this.originalPreviewLineManager),
      refreshAllPreviewLines: this.originalPreviewLineManager.refreshAllPreviewLines?.bind(this.originalPreviewLineManager),
      createPreviewLine: this.originalPreviewLineManager.createPreviewLine?.bind(this.originalPreviewLineManager)
    };

    // 增强 updatePreviewLinePosition 方法
    if (this.originalPreviewLineManager.updatePreviewLinePosition) {
      this.originalPreviewLineManager.updatePreviewLinePosition = async (node, options = {}) => {
        return this.enhancedUpdatePreviewLinePosition(node, options, originalMethods.updatePreviewLinePosition);
      };
    }

    // 增强 refreshAllPreviewLines 方法
    if (this.originalPreviewLineManager.refreshAllPreviewLines) {
      this.originalPreviewLineManager.refreshAllPreviewLines = async (options = {}) => {
        return this.enhancedRefreshAllPreviewLines(options, originalMethods.refreshAllPreviewLines);
      };
    }

    // 增强 createPreviewLine 方法
    if (this.originalPreviewLineManager.createPreviewLine) {
      this.originalPreviewLineManager.createPreviewLine = async (sourceNode, targetNode, options = {}) => {
        return this.enhancedCreatePreviewLine(sourceNode, targetNode, options, originalMethods.createPreviewLine);
      };
    }

    // 添加新的综合刷新方法
    this.originalPreviewLineManager.comprehensiveRefresh = this.comprehensiveRefresh.bind(this);
    this.originalPreviewLineManager.refreshWithBranchAnalysis = this.refreshWithBranchAnalysis.bind(this);

    if (this.options.enableDebug) {
      // console.log('🔗 [预览线集成] 已增强原有预览线管理器方法');
    }
  }

  /**
   * 增强版更新预览线位置
   * @param {Object} node - 节点对象
   * @param {Object} options - 选项
   * @param {Function} originalMethod - 原有方法
   */
  async enhancedUpdatePreviewLinePosition(node, options = {}, originalMethod) {
    const startTime = Date.now();
    const nodeId = node.id || node.getId();

    try {
      this.performanceMetrics.totalIntegrationCalls++;

      // 触发开始事件
      this.emitEvent(IntegrationEvents.REFRESH_STARTED, { nodeId, type: 'position', options });

      // 如果启用了综合刷新，使用增强版管理器
      if (options.useEnhancedRefresh !== false && this.enhancedRefreshManager) {
        const result = await this.enhancedRefreshManager.comprehensiveRefresh(nodeId, {
          ...options,
          focusType: 'position'
        });

        this.emitEvent(IntegrationEvents.POSITION_UPDATED, { nodeId, result });
        this.updatePerformanceMetrics(true, Date.now() - startTime);

        return result;
      }

      // 否则使用原有方法
      if (originalMethod) {
        const result = await originalMethod(node, options);
        this.updatePerformanceMetrics(true, Date.now() - startTime);
        return result;
      }

    } catch (error) {
      this.emitEvent(IntegrationEvents.REFRESH_FAILED, { nodeId, type: 'position', error: error.message });
      this.updatePerformanceMetrics(false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * 增强版刷新所有预览线
   * @param {Object} options - 选项
   * @param {Function} originalMethod - 原有方法
   */
  async enhancedRefreshAllPreviewLines(options = {}, originalMethod) {
    const startTime = Date.now();

    try {
      this.emitEvent(IntegrationEvents.REFRESH_STARTED, { type: 'all', options });

      // 获取所有需要刷新的节点
      const nodesToRefresh = this.getAllNodesWithPreviewLines();

      if (options.useEnhancedRefresh !== false && this.enhancedRefreshManager) {
        // 使用增强版管理器批量刷新
        const results = await this.batchRefreshNodes(nodesToRefresh, options);
        
        this.emitEvent(IntegrationEvents.REFRESH_COMPLETED, { 
          type: 'all', 
          nodeCount: nodesToRefresh.length,
          results 
        });

        return results;
      }

      // 使用原有方法
      if (originalMethod) {
        const result = await originalMethod(options);
        return result;
      }

    } catch (error) {
      this.emitEvent(IntegrationEvents.REFRESH_FAILED, { type: 'all', error: error.message });
      throw error;
    }
  }

  /**
   * 增强版创建预览线
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   * @param {Object} options - 选项
   * @param {Function} originalMethod - 原有方法
   */
  async enhancedCreatePreviewLine(sourceNode, targetNode, options = {}, originalMethod) {
    const startTime = Date.now();
    const sourceNodeId = sourceNode.id || sourceNode.getId();

    try {
      // 先使用原有方法创建预览线
      let result = null;
      if (originalMethod) {
        result = await originalMethod(sourceNode, targetNode, options);
      }

      // 如果启用了自动刷新，创建后立即进行综合刷新
      if (this.options.autoRefresh && this.enhancedRefreshManager) {
        setTimeout(async () => {
          try {
            await this.enhancedRefreshManager.comprehensiveRefresh(sourceNodeId, {
              reason: 'after_create',
              focusType: 'position'
            });
          } catch (error) {
            // console.warn('⚠️ [预览线集成] 创建后自动刷新失败:', error.message);
          }
        }, this.options.refreshDelay);
      }

      return result;

    } catch (error) {
      // console.error('❌ [预览线集成] 增强创建预览线失败:', error);
      throw error;
    }
  }

  /**
   * 综合刷新方法（新增）
   * @param {string} nodeId - 节点ID
   * @param {Object} options - 选项
   */
  async comprehensiveRefresh(nodeId, options = {}) {
    if (!this.isInitialized) {
      throw new Error('集成管理器未初始化');
    }

    if (!this.enhancedRefreshManager) {
      throw new Error('增强版刷新管理器不可用');
    }

    // 防止并发刷新同一节点
    if (this.activeRefreshes.has(nodeId)) {
      if (this.options.enableDebug) {
        // console.log(`⏳ [综合刷新] 节点 ${nodeId} 正在刷新中，跳过重复请求`);
      }
      return;
    }

    this.activeRefreshes.add(nodeId);

    try {
      const result = await this.enhancedRefreshManager.comprehensiveRefresh(nodeId, options);
      
      this.emitEvent(IntegrationEvents.REFRESH_COMPLETED, { 
        nodeId, 
        type: 'comprehensive',
        result 
      });

      return result;

    } finally {
      this.activeRefreshes.delete(nodeId);
    }
  }

  /**
   * 基于分支分析的刷新方法（新增）
   * @param {string} nodeId - 节点ID
   * @param {Object} options - 选项
   */
  async refreshWithBranchAnalysis(nodeId, options = {}) {
    if (!this.enhancedRefreshManager) {
      throw new Error('增强版刷新管理器不可用');
    }

    const sourceNode = this.graph ? this.graph.getCellById(nodeId) : null;
    if (!sourceNode) {
      throw new Error(`节点不存在: ${nodeId}`);
    }

    // 先进行分支分析
    const branchAnalysis = await this.enhancedRefreshManager.analyzeBranches(sourceNode, options);
    
    if (this.options.enableDebug) {
      // console.log('🔍 [分支分析刷新] 分支分析结果:', {
      //   nodeId,
      //   totalBranches: branchAnalysis.totalBranches,
      //   activeBranches: branchAnalysis.activeBranches
      // });
    }

    // 基于分析结果进行刷新
    return this.comprehensiveRefresh(nodeId, {
      ...options,
      branchAnalysis,
      reason: 'branch_analysis'
    });
  }

  /**
   * 批量刷新节点
   * @param {Array} nodes - 节点列表
   * @param {Object} options - 选项
   */
  async batchRefreshNodes(nodes, options = {}) {
    const batchSize = Math.min(this.options.maxConcurrentRefreshes, nodes.length);
    const results = [];

    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);
      const batchPromises = batch.map(node => {
        const nodeId = node.id || node.getId();
        return this.comprehensiveRefresh(nodeId, options).catch(error => ({
          nodeId,
          error: error.message
        }));
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);

      // 批次间延迟
      if (i + batchSize < nodes.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    return results;
  }

  /**
   * 获取所有有预览线的节点
   */
  getAllNodesWithPreviewLines() {
    if (!this.originalPreviewLineManager || !this.originalPreviewLineManager.previewLines) {
      return [];
    }

    const nodeIds = Array.from(this.originalPreviewLineManager.previewLines.keys());
    return nodeIds.map(nodeId => this.graph ? this.graph.getCellById(nodeId) : null)
                  .filter(node => node !== null);
  }

  /**
   * 设置事件监听
   */
  setupEventListeners() {
    // 🔧 修复：禁用node:moved事件监听，避免与PreviewLineSystem重复处理
    // 监听图形变化事件
    if (this.graph && typeof this.graph.on === 'function') {
      // 注释掉node:moved监听，避免重复创建预览线
      // this.graph.on('node:moved', (event) => {
      //   if (this.options.autoRefresh) {
      //     const nodeId = event.node.id;
      //     setTimeout(() => {
      //       this.comprehensiveRefresh(nodeId, { reason: 'node_moved' }).catch(error => {
      //         // console.warn('⚠️ [自动刷新] 节点移动后刷新失败:', error.message);
      //       });
      //     }, this.options.refreshDelay);
      //   }
      // });

      this.graph.on('edge:connected', (event) => {
        if (this.options.autoRefresh && event.edge) {
          const sourceId = event.edge.getSourceCellId();
          if (sourceId) {
            setTimeout(() => {
              this.comprehensiveRefresh(sourceId, { reason: 'edge_connected' }).catch(error => {
                // console.warn('⚠️ [自动刷新] 连接后刷新失败:', error.message);
              });
            }, this.options.refreshDelay);
          }
        }
      });
    }
  }

  /**
   * 触发事件
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   */
  emitEvent(eventType, data) {
    if (this.options.enableEventLogging) {
      // console.log(`📡 [预览线集成] 事件: ${eventType}`, data);
    }

    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          // console.error(`❌ [事件监听] 事件处理失败: ${eventType}`, error);
        }
      });
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
   * 更新性能指标
   * @param {boolean} success - 是否成功
   * @param {number} duration - 持续时间
   */
  updatePerformanceMetrics(success, duration) {
    if (success) {
      this.performanceMetrics.successfulIntegrations++;
    } else {
      this.performanceMetrics.failedIntegrations++;
    }

    const totalCalls = this.performanceMetrics.successfulIntegrations + this.performanceMetrics.failedIntegrations;
    this.performanceMetrics.averageIntegrationTime = 
      (this.performanceMetrics.averageIntegrationTime * (totalCalls - 1) + duration) / totalCalls;

    this.performanceMetrics.lastRefreshTime = Date.now();
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      enhancedManagerStats: this.enhancedRefreshManager ? this.enhancedRefreshManager.getStats() : null
    };
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeRefreshes: Array.from(this.activeRefreshes),
      queueLength: this.refreshQueue.length,
      performanceMetrics: this.getPerformanceMetrics()
    };
  }

  /**
   * 清理资源
   */
  destroy() {
    // 清理增强版管理器
    if (this.enhancedRefreshManager) {
      this.enhancedRefreshManager.destroy();
    }

    // 清理状态
    this.activeRefreshes.clear();
    this.refreshQueue = [];
    this.eventListeners.clear();

    // 重置标志
    this.isInitialized = false;

    // console.log('🗑️ [预览线集成管理器] 资源已清理');
  }
}

export default PreviewLineIntegrationManager;