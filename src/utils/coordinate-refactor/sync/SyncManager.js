/**
 * 同步管理器 - 协调整个坐标计算和应用流程
 */

import { CoordinateCalculator } from '../core/CoordinateCalculator.js';
import { CoordinateValidator } from '../validation/CoordinateValidator.js';
import { PositionApplicator } from '../position/PositionApplicator.js';
import { PreviewLineRefreshManager } from './PreviewLineRefreshManager.js';
import { BranchFlowManager } from './BranchFlowManager.js';
import { ErrorFactory } from '../errors/CoordinateErrors.js';

/**
 * 同步状态枚举
 */
export const SyncState = {
  IDLE: 'idle',
  CALCULATING: 'calculating',
  VALIDATING: 'validating',
  APPLYING: 'applying',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};

/**
 * 同步事件类型
 */
export const SyncEventType = {
  STATE_CHANGED: 'stateChanged',
  PROGRESS_UPDATED: 'progressUpdated',
  CALCULATION_COMPLETED: 'calculationCompleted',
  VALIDATION_COMPLETED: 'validationCompleted',
  APPLICATION_COMPLETED: 'applicationCompleted',
  SYNC_COMPLETED: 'syncCompleted',
  ERROR_OCCURRED: 'errorOccurred',
  CANCELLED: 'cancelled'
};

/**
 * 同步管理器主类
 */
export class SyncManager {
  constructor(config = {}) {
    this.config = {
      // 组件配置
      calculatorConfig: config.calculatorConfig || {},
      validatorConfig: config.validatorConfig || {},
      applicatorConfig: config.applicatorConfig || {},
      
      // 同步配置
      enableValidation: config.enableValidation !== false,
      enableRollback: config.enableRollback !== false,
      enableProgressTracking: config.enableProgressTracking !== false,
      enableEventEmission: config.enableEventEmission !== false,
      
      // 性能配置
      maxConcurrentSyncs: config.maxConcurrentSyncs || 3,
      syncTimeout: config.syncTimeout || 30000, // 30秒
      retryAttempts: config.retryAttempts || 2,
      retryDelay: config.retryDelay || 1000,
      
      // 调试配置
      enableDebug: config.enableDebug || false,
      logLevel: config.logLevel || 'info',
      
      ...config
    };

    // 初始化组件
    this.calculator = new CoordinateCalculator(this.config.calculatorConfig);
    this.validator = this.config.enableValidation ? new CoordinateValidator(this.config.validatorConfig) : null;
    this.applicator = new PositionApplicator(this.config.applicatorConfig);
    
    // 初始化预览线刷新管理器
    this.previewLineManager = new PreviewLineRefreshManager({
      batchSize: this.config.previewLineBatchSize || 10,
      batchDelay: this.config.previewLineBatchDelay || 100,
      enableDebug: this.config.enableDebug || false,
      ...this.config.previewLineConfig
    });
    
    // 初始化分流管理器
    this.branchFlowManager = new BranchFlowManager({
      enableAutoSync: this.config.enableBranchAutoSync !== false,
      syncInterval: this.config.branchSyncInterval || 1000,
      enableDebug: this.config.enableDebug || false,
      ...this.config.branchFlowConfig
    });

    // 状态管理
    this.currentState = SyncState.IDLE;
    this.activeSyncs = new Map();
    this.syncQueue = [];
    this.syncHistory = [];
    
    // 事件系统
    this.eventListeners = new Map();
    
    // 统计信息
    this.statistics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      cancelledSyncs: 0,
      averageSyncTime: 0,
      totalSyncTime: 0
    };

    // console.log(`✅ [同步管理器] 初始化完成 - 验证: ${!!this.validator}, 回滚: ${this.config.enableRollback}`);
  }

  /**
   * 执行同步 - 主入口方法
   * @param {Array} layers - 层级数据
   * @param {Object} context - 同步上下文
   * @param {Object} options - 同步选项
   * @returns {Promise<Object>} 同步结果
   */
  async sync(layers, context = {}, options = {}) {
    const syncId = this.generateSyncId();
    const startTime = performance.now();

    // console.log(`🔄 [同步管理器] 开始同步 - ID: ${syncId}, 层级数: ${layers.length}`);

    // 检查并发限制
    if (this.activeSyncs.size >= this.config.maxConcurrentSyncs) {
      // console.log(`⏳ [同步管理器] 达到并发限制，加入队列 - ID: ${syncId}`);
      return this.queueSync(syncId, layers, context, options);
    }

    try {
      // 创建同步会话
      const syncSession = this.createSyncSession(syncId, layers, context, options, startTime);
      this.activeSyncs.set(syncId, syncSession);

      // 设置超时
      const timeoutHandle = this.setupSyncTimeout(syncId);

      // 执行同步流程
      const result = await this.executeSyncFlow(syncSession);

      // 清理超时
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      // 完成同步
      const endTime = performance.now();
      const syncTime = endTime - startTime;
      
      await this.completeSyncSession(syncSession, result, syncTime);
      
      // console.log(`✅ [同步管理器] 同步完成 - ID: ${syncId}, 耗时: ${syncTime.toFixed(2)}ms`);
      
      return {
        syncId,
        success: true,
        ...result,
        syncTime: Number(syncTime.toFixed(2))
      };
    } catch (error) {
      await this.handleSyncError(syncId, error);
      throw error;
    } finally {
      this.activeSyncs.delete(syncId);
      this.processNextInQueue();
    }
  }

  /**
   * 创建同步会话
   */
  createSyncSession(syncId, layers, context, options, startTime) {
    const session = {
      id: syncId,
      layers,
      context,
      options,
      startTime,
      state: SyncState.IDLE,
      progress: {
        total: 100,
        current: 0,
        stage: 'initializing',
        details: {}
      },
      results: {
        calculation: null,
        validation: null,
        application: null
      },
      errors: [],
      cancelled: false
    };

    this.updateSyncState(session, SyncState.CALCULATING);
    return session;
  }

  /**
   * 执行同步流程
   */
  async executeSyncFlow(session) {
    const { layers, context, options } = session;

    try {
      // 阶段1: 坐标计算
      this.updateProgress(session, 10, 'calculating', '开始坐标计算');
      const calculationResult = await this.executeCalculation(session, layers, options);
      session.results.calculation = calculationResult;
      this.updateProgress(session, 40, 'calculating', '坐标计算完成');

      // 阶段2: 验证（可选）
      let validationResult = null;
      if (this.validator && this.config.enableValidation) {
        this.updateSyncState(session, SyncState.VALIDATING);
        this.updateProgress(session, 50, 'validating', '开始坐标验证');
        
        validationResult = await this.executeValidation(session, calculationResult, layers, context);
        session.results.validation = validationResult;
        
        this.updateProgress(session, 70, 'validating', '坐标验证完成');
        
        // 检查验证结果
        if (!validationResult.isValid && options.strictValidation) {
          throw new CoordinateCalculationError(
            `坐标验证失败: ${validationResult.summary.totalIssues} 个问题`,
            null,
            { validationResult }
          );
        }
      }

      // 阶段3: 位置应用
      this.updateSyncState(session, SyncState.APPLYING);
      this.updateProgress(session, 80, 'applying', '开始位置应用');
      
      const applicationResult = await this.executeApplication(session, calculationResult, context);
      session.results.application = applicationResult;
      
      this.updateProgress(session, 100, 'applying', '位置应用完成');

      // 完成同步
      this.updateSyncState(session, SyncState.COMPLETED);

      return {
        calculation: calculationResult,
        validation: validationResult,
        application: applicationResult
      };
    } catch (error) {
      this.updateSyncState(session, SyncState.ERROR);
      session.errors.push({
        timestamp: Date.now(),
        stage: session.progress.stage,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * 执行坐标计算
   */
  async executeCalculation(session, layers, options) {
    // console.log(`🔄 [同步管理器] 执行坐标计算 - ID: ${session.id}`);

    try {
      const calculationOptions = {
        ...options.calculationOptions,
        enableDebug: this.config.enableDebug
      };

      const positions = await this.calculator.calculate(layers, calculationOptions);
      
      this.emitEvent(SyncEventType.CALCULATION_COMPLETED, {
        syncId: session.id,
        positions,
        nodeCount: positions.size
      });

      // console.log(`✅ [同步管理器] 坐标计算完成 - ID: ${session.id}, 节点数: ${positions.size}`);
      return positions;
    } catch (error) {
      // console.error(`❌ [同步管理器] 坐标计算失败 - ID: ${session.id}:`, error.message);
      throw new CoordinateCalculationError(
        `坐标计算失败: ${error.message}`,
        null,
        { syncId: session.id, stage: 'calculation' }
      );
    }
  }

  /**
   * 执行坐标验证
   */
  async executeValidation(session, positions, layers, context) {
    // console.log(`🔄 [同步管理器] 执行坐标验证 - ID: ${session.id}`);

    try {
      const validationContext = {
        ...context,
        syncId: session.id,
        nodeCount: positions.size,
        layerCount: layers.length
      };

      const validationResult = await this.validator.validate(positions, layers, validationContext);
      
      this.emitEvent(SyncEventType.VALIDATION_COMPLETED, {
        syncId: session.id,
        validationResult
      });

      // console.log(`✅ [同步管理器] 坐标验证完成 - ID: ${session.id}, 状态: ${validationResult.isValid ? '通过' : '失败'}`);
      return validationResult;
    } catch (error) {
      // console.error(`❌ [同步管理器] 坐标验证失败 - ID: ${session.id}:`, error.message);
      throw new CoordinateCalculationError(
        `坐标验证失败: ${error.message}`,
        null,
        { syncId: session.id, stage: 'validation' }
      );
    }
  }

  /**
   * 执行位置应用
   */
  async executeApplication(session, positions, context) {
    // console.log(`🔄 [同步管理器] 执行位置应用 - ID: ${session.id}`);

    try {
      const applicationContext = {
        ...context,
        syncId: session.id
      };

      const applicationResult = await this.applicator.apply(positions, applicationContext);
      
      this.emitEvent(SyncEventType.APPLICATION_COMPLETED, {
        syncId: session.id,
        applicationResult
      });

      // console.log(`✅ [同步管理器] 位置应用完成 - ID: ${session.id}, 成功: ${applicationResult.applied}, 失败: ${applicationResult.failed}`);
      
      // 刷新预览线
      this.updateProgress(session, 85, 'refreshing', '刷新预览线');
      await this.refreshPreviewLines(session.layers, positions, context);

      // 同步分流状态
      this.updateProgress(session, 95, 'syncing', '同步分流状态');
      await this.syncBranchFlow(session.layers, positions, context);
      
      return applicationResult;
    } catch (error) {
      // console.error(`❌ [同步管理器] 位置应用失败 - ID: ${session.id}:`, error.message);
      throw new CoordinateCalculationError(
        `位置应用失败: ${error.message}`,
        null,
        { syncId: session.id, stage: 'application' }
      );
    }
  }

  /**
   * 刷新预览线
   */
  async refreshPreviewLines(layers, positions, context) {
    try {
      await this.previewLineManager.refreshPreviewLines(layers, positions, context);
      // console.log(`✅ [同步管理器] 预览线刷新完成`);
    } catch (error) {
      // console.error(`❌ [同步管理器] 预览线刷新失败:`, error.message);
      // 预览线刷新失败不应该阻止整个同步流程
    }
  }

  /**
   * 同步分流状态
   */
  async syncBranchFlow(layers, positions, context) {
    try {
      await this.branchFlowManager.syncBranchFlow(layers, positions, context);
      // console.log(`✅ [同步管理器] 分流状态同步完成`);
    } catch (error) {
      // console.error(`❌ [同步管理器] 分流状态同步失败:`, error.message);
      // 分流状态同步失败不应该阻止整个同步流程
    }
  }

  /**
   * 更新同步状态
   */
  updateSyncState(session, newState) {
    const oldState = session.state;
    session.state = newState;

    // console.log(`🔄 [同步管理器] 状态变更 - ID: ${session.id}: ${oldState} -> ${newState}`);

    this.emitEvent(SyncEventType.STATE_CHANGED, {
      syncId: session.id,
      oldState,
      newState,
      timestamp: Date.now()
    });
  }

  /**
   * 更新进度
   */
  updateProgress(session, current, stage, details) {
    session.progress = {
      ...session.progress,
      current: Math.min(current, 100),
      stage,
      details: typeof details === 'string' ? { message: details } : details,
      timestamp: Date.now()
    };

    if (this.config.enableProgressTracking) {
      this.emitEvent(SyncEventType.PROGRESS_UPDATED, {
        syncId: session.id,
        progress: session.progress
      });
    }
  }

  /**
   * 设置同步超时
   */
  setupSyncTimeout(syncId) {
    if (this.config.syncTimeout <= 0) return null;

    return setTimeout(() => {
      const session = this.activeSyncs.get(syncId);
      if (session && session.state !== SyncState.COMPLETED) {
        // console.warn(`⏰ [同步管理器] 同步超时 - ID: ${syncId}`);
        this.cancelSync(syncId, '同步超时');
      }
    }, this.config.syncTimeout);
  }

  /**
   * 取消同步
   */
  async cancelSync(syncId, reason = '用户取消') {
    const session = this.activeSyncs.get(syncId);
    if (!session) {
      // console.warn(`⚠️ [同步管理器] 未找到同步会话 - ID: ${syncId}`);
      return false;
    }

    // console.log(`🛑 [同步管理器] 取消同步 - ID: ${syncId}, 原因: ${reason}`);

    session.cancelled = true;
    this.updateSyncState(session, SyncState.CANCELLED);

    // 尝试回滚（如果已经应用了位置）
    if (session.results.application && this.config.enableRollback) {
      try {
        await this.applicator.rollback(session.results.application.applicationId);
        // console.log(`✅ [同步管理器] 回滚完成 - ID: ${syncId}`);
      } catch (error) {
        // console.error(`❌ [同步管理器] 回滚失败 - ID: ${syncId}:`, error.message);
      }
    }

    this.emitEvent(SyncEventType.CANCELLED, {
      syncId,
      reason,
      timestamp: Date.now()
    });

    this.activeSyncs.delete(syncId);
    this.statistics.cancelledSyncs++;

    return true;
  }

  /**
   * 完成同步会话
   */
  async completeSyncSession(session, result, syncTime) {
    // 记录统计信息
    this.updateStatistics(session, syncTime, true);

    // 记录历史
    this.recordSyncHistory(session, result, syncTime);

    // 发送完成事件
    this.emitEvent(SyncEventType.SYNC_COMPLETED, {
      syncId: session.id,
      result,
      syncTime,
      timestamp: Date.now()
    });

    // console.log(`📊 [同步管理器] 会话完成 - ID: ${session.id}`);
  }

  /**
   * 处理同步错误
   */
  async handleSyncError(syncId, error) {
    const session = this.activeSyncs.get(syncId);
    
    // console.error(`❌ [同步管理器] 同步错误 - ID: ${syncId}:`, error.message);

    // 记录统计信息
    if (session) {
      this.updateStatistics(session, 0, false);
    }

    // 尝试回滚（如果已经应用了位置）
    if (session?.results.application && this.config.enableRollback) {
      try {
        await this.applicator.rollback(session.results.application.applicationId);
        // console.log(`✅ [同步管理器] 错误回滚完成 - ID: ${syncId}`);
      } catch (rollbackError) {
        // console.error(`❌ [同步管理器] 错误回滚失败 - ID: ${syncId}:`, rollbackError.message);
      }
    }

    // 发送错误事件
    this.emitEvent(SyncEventType.ERROR_OCCURRED, {
      syncId,
      error: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });

    // 全局错误处理
    globalErrorHandler.handleError(error, {
      component: 'SyncManager',
      method: 'sync',
      syncId
    });
  }

  /**
   * 队列同步
   */
  async queueSync(syncId, layers, context, options) {
    return new Promise((resolve, reject) => {
      this.syncQueue.push({
        syncId,
        layers,
        context,
        options,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // console.log(`📋 [同步管理器] 同步已加入队列 - ID: ${syncId}, 队列长度: ${this.syncQueue.length}`);
    });
  }

  /**
   * 处理队列中的下一个同步
   */
  async processNextInQueue() {
    if (this.syncQueue.length === 0 || this.activeSyncs.size >= this.config.maxConcurrentSyncs) {
      return;
    }

    const queuedSync = this.syncQueue.shift();
    if (!queuedSync) return;

    // console.log(`📋 [同步管理器] 处理队列同步 - ID: ${queuedSync.syncId}`);

    try {
      const result = await this.sync(queuedSync.layers, queuedSync.context, queuedSync.options);
      queuedSync.resolve(result);
    } catch (error) {
      queuedSync.reject(error);
    }
  }

  /**
   * 更新统计信息
   */
  updateStatistics(session, syncTime, success) {
    this.statistics.totalSyncs++;
    
    if (success) {
      this.statistics.successfulSyncs++;
      this.statistics.totalSyncTime += syncTime;
      this.statistics.averageSyncTime = this.statistics.totalSyncTime / this.statistics.successfulSyncs;
    } else {
      this.statistics.failedSyncs++;
    }
  }

  /**
   * 记录同步历史
   */
  recordSyncHistory(session, result, syncTime) {
    const historyRecord = {
      id: session.id,
      timestamp: session.startTime,
      layers: session.layers.length,
      nodeCount: result.calculation ? result.calculation.size : 0,
      syncTime: Number(syncTime.toFixed(2)),
      success: true,
      validationPassed: result.validation ? result.validation.isValid : null,
      applicationSuccess: result.application ? result.application.applied : 0,
      applicationFailed: result.application ? result.application.failed : 0
    };

    this.syncHistory.push(historyRecord);

    // 限制历史记录大小
    if (this.syncHistory.length > 100) {
      this.syncHistory = this.syncHistory.slice(-100);
    }
  }

  /**
   * 事件系统
   */
  addEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(listener);
  }

  removeEventListener(eventType, listener) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(eventType, data) {
    if (!this.config.enableEventEmission) return;

    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          // console.error(`事件监听器错误 [${eventType}]:`, error);
        }
      });
    }
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(syncId) {
    const session = this.activeSyncs.get(syncId);
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      state: session.state,
      progress: session.progress,
      startTime: session.startTime,
      errors: session.errors,
      cancelled: session.cancelled
    };
  }

  /**
   * 获取所有活动同步
   */
  getActiveSyncs() {
    return Array.from(this.activeSyncs.values()).map(session => ({
      id: session.id,
      state: session.state,
      progress: session.progress,
      startTime: session.startTime
    }));
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    return {
      ...this.statistics,
      successRate: this.statistics.totalSyncs > 0 
        ? this.statistics.successfulSyncs / this.statistics.totalSyncs 
        : 0,
      activeSyncs: this.activeSyncs.size,
      queuedSyncs: this.syncQueue.length,
      recentSyncs: this.syncHistory.slice(-10)
    };
  }

  /**
   * 生成同步ID
   */
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 重新配置
   */
  reconfigure(newConfig) {
    this.config = { ...this.config, ...newConfig };

    // 重新配置子组件
    if (newConfig.calculatorConfig) {
      this.calculator.reconfigure(newConfig.calculatorConfig);
    }

    if (newConfig.validatorConfig && this.validator) {
      this.validator.reconfigure(newConfig.validatorConfig);
    }

    if (newConfig.applicatorConfig) {
      this.applicator.reconfigure(newConfig.applicatorConfig);
    }

    // console.log(`🔧 [同步管理器] 重新配置完成`);
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 取消所有活动同步
    const activeSyncIds = Array.from(this.activeSyncs.keys());
    activeSyncIds.forEach(syncId => {
      this.cancelSync(syncId, '系统清理');
    });

    // 清理队列
    this.syncQueue.forEach(queuedSync => {
      queuedSync.reject(new Error('系统清理，同步已取消'));
    });
    this.syncQueue = [];

    // 清理事件监听器
    this.eventListeners.clear();

    // 清理历史记录
    this.syncHistory = [];

    // 清理预览线管理器
    if (this.previewLineManager) {
      this.previewLineManager.cleanup();
    }

    // 清理分流管理器
    if (this.branchFlowManager) {
      this.branchFlowManager.cleanup();
    }

    // console.log(`🗑️ [同步管理器] 资源清理完成`);
  }
}