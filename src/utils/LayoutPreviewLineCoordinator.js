/**
 * 布局与预览线协调器
 * 解决统一布局与预览线时序冲突问题
 * 确保点击统一布局时预览线同步执行
 */

export class LayoutPreviewLineCoordinator {
  constructor(options = {}) {
    this.options = {
      // 协调配置
      coordination: {
        enablePreviewLineSync: true, // 启用预览线同步
        syncTimeout: 5000, // 同步超时时间（毫秒）
        maxRetries: 3, // 最大重试次数
        debounceDelay: 100, // 防抖延迟
      },
      
      // 时序配置
      timing: {
        preLayoutDelay: 50, // 布局前延迟
        postLayoutDelay: 100, // 布局后延迟
        previewLineUpdateDelay: 200, // 预览线更新延迟
      },
      
      // 调试配置
      debug: {
        enableLogging: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
      },
      
      ...options
    };
    
    // 协调状态
    this.coordinationState = {
      isCoordinating: false,
      layoutInProgress: false,
      previewLineUpdateInProgress: false,
      lastCoordinationTime: 0,
      coordinationCount: 0,
    };
    
    // 引用管理（使用WeakRef避免循环引用）
    this._layoutEngineRef = null;
    this._previewLineManagerRef = null;
    this._graphRef = null;
    
    // 事件监听器存储
    this.eventListeners = new Map();
    
    // 协调任务队列
    this.coordinationQueue = [];
    this.isProcessingQueue = false;
    
    // 性能监控
    this.performanceMetrics = {
      totalCoordinations: 0,
      successfulCoordinations: 0,
      failedCoordinations: 0,
      averageCoordinationTime: 0,
      lastCoordinationDuration: 0,
    };
    
    this.log('info', '🎯 LayoutPreviewLineCoordinator 初始化完成');
  }
  
  /**
   * 设置布局引擎引用
   * @param {Object} layoutEngine - 布局引擎实例
   */
  setLayoutEngine(layoutEngine) {
    this._layoutEngineRef = layoutEngine ? new WeakRef(layoutEngine) : null;
    this.log('info', '🔗 布局引擎引用已设置');
  }
  
  /**
   * 设置预览线管理器引用
   * @param {Object} previewLineManager - 预览线管理器实例
   */
  setPreviewLineManager(previewLineManager) {
    this._previewLineManagerRef = previewLineManager ? new WeakRef(previewLineManager) : null;
    this.log('info', '🔗 预览线管理器引用已设置');
  }
  
  /**
   * 设置图实例引用
   * @param {Object} graph - 图实例
   */
  setGraph(graph) {
    this._graphRef = graph ? new WeakRef(graph) : null;
    this.log('info', '🔗 图实例引用已设置');
  }
  
  /**
   * 获取布局引擎实例（安全访问WeakRef）
   * @returns {Object|null} 布局引擎实例或null
   */
  get layoutEngine() {
    if (this._layoutEngineRef) {
      const engine = this._layoutEngineRef.deref();
      if (engine) {
        return engine;
      } else {
        this._layoutEngineRef = null;
        this.log('warn', '🗑️ 布局引擎已被垃圾回收，清理WeakRef');
      }
    }
    return null;
  }
  
  /**
   * 获取预览线管理器实例（安全访问WeakRef）
   * @returns {Object|null} 预览线管理器实例或null
   */
  get previewLineManager() {
    if (this._previewLineManagerRef) {
      const manager = this._previewLineManagerRef.deref();
      if (manager) {
        return manager;
      } else {
        this._previewLineManagerRef = null;
        this.log('warn', '🗑️ 预览线管理器已被垃圾回收，清理WeakRef');
      }
    }
    return null;
  }
  
  /**
   * 获取图实例（安全访问WeakRef）
   * @returns {Object|null} 图实例或null
   */
  get graph() {
    if (this._graphRef) {
      const graph = this._graphRef.deref();
      if (graph) {
        return graph;
      } else {
        this._graphRef = null;
        this.log('warn', '🗑️ 图实例已被垃圾回收，清理WeakRef');
      }
    }
    return null;
  }
  
  /**
   * 🎯 核心方法：协调统一布局与预览线同步执行
   * 这是P04任务的核心功能，确保点击统一布局时预览线一起执行
   * @param {Object} options - 协调选项
   * @returns {Promise<Object>} 协调结果
   */
  async coordinateUnifiedLayoutWithPreviewLines(options = {}) {
    const startTime = performance.now();
    const coordinationId = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.log('info', `🚀 开始协调统一布局与预览线同步执行 [${coordinationId}]`);
    
    // 检查协调状态
    if (this.coordinationState.isCoordinating) {
      this.log('warn', '⚠️ 协调正在进行中，跳过重复请求');
      return {
        success: false,
        message: '协调正在进行中',
        coordinationId,
        skipped: true
      };
    }
    
    // 设置协调状态
    this.coordinationState.isCoordinating = true;
    this.coordinationState.lastCoordinationTime = Date.now();
    this.coordinationState.coordinationCount++;
    
    try {
      // 验证必要的组件引用
      const validationResult = this.validateComponentReferences();
      if (!validationResult.success) {
        throw new Error(`组件引用验证失败: ${validationResult.message}`);
      }
      
      // 🎯 阶段1：预布局准备 - 预览线状态检查和准备
      this.log('info', '📋 阶段1：预布局准备 - 预览线状态检查');
      const preLayoutResult = await this.performPreLayoutPreparation();
      if (!preLayoutResult.success) {
        throw new Error(`预布局准备失败: ${preLayoutResult.message}`);
      }
      
      // 🎯 阶段2：执行统一布局 - 包含预览线endpoint处理
      this.log('info', '🏗️ 阶段2：执行统一布局');
      const layoutResult = await this.executeUnifiedLayoutWithPreviewLineIntegration(options);
      if (!layoutResult.success) {
        throw new Error(`统一布局执行失败: ${layoutResult.message}`);
      }
      
      // 🎯 阶段3：后布局同步 - 预览线位置同步和状态更新
      this.log('info', '🔄 阶段3：后布局同步 - 预览线位置同步');
      const postLayoutResult = await this.performPostLayoutSynchronization(layoutResult);
      if (!postLayoutResult.success) {
        this.log('warn', `⚠️ 后布局同步部分失败: ${postLayoutResult.message}`);
      }
      
      // 更新性能指标
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.updatePerformanceMetrics(duration, true);
      
      const result = {
        success: true,
        coordinationId,
        duration,
        layoutResult,
        preLayoutResult,
        postLayoutResult,
        message: '统一布局与预览线协调执行成功',
        timestamp: new Date().toISOString()
      };
      
      this.log('info', `✅ 协调执行成功 [${coordinationId}] - 耗时: ${duration.toFixed(2)}ms`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.updatePerformanceMetrics(duration, false);
      
      this.log('error', `❌ 协调执行失败 [${coordinationId}]: ${error.message}`);
      
      return {
        success: false,
        coordinationId,
        duration,
        error: error.message,
        message: `协调执行失败: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      
    } finally {
      // 重置协调状态
      this.coordinationState.isCoordinating = false;
      this.coordinationState.layoutInProgress = false;
      this.coordinationState.previewLineUpdateInProgress = false;
    }
  }
  
  /**
   * 验证组件引用的有效性
   * @returns {Object} 验证结果
   */
  validateComponentReferences() {
    const layoutEngine = this.layoutEngine;
    const previewLineManager = this.previewLineManager;
    const graph = this.graph;
    
    if (!layoutEngine) {
      return {
        success: false,
        message: '布局引擎引用无效或已被回收'
      };
    }
    
    if (!previewLineManager) {
      return {
        success: false,
        message: '预览线管理器引用无效或已被回收'
      };
    }
    
    if (!graph) {
      return {
        success: false,
        message: '图实例引用无效或已被回收'
      };
    }
    
    return {
      success: true,
      message: '所有组件引用验证通过'
    };
  }
  
  /**
   * 执行预布局准备工作
   * @returns {Promise<Object>} 准备结果
   */
  async performPreLayoutPreparation() {
    try {
      const previewLineManager = this.previewLineManager;
      
      // 检查预览线管理器状态
      const previewLineCount = previewLineManager.previewLines ? previewLineManager.previewLines.size : 0;
      this.log('info', `📊 当前预览线数量: ${previewLineCount}`);
      
      // 初始化现有节点的预览线（如果需要）
      if (typeof previewLineManager.initializeExistingNodes === 'function') {
        previewLineManager.initializeExistingNodes();
        this.log('info', '🔄 已触发预览线管理器初始化现有节点');
      }
      
      // 处理待处理的计算队列
      if (typeof previewLineManager.processPendingCalculations === 'function' &&
          previewLineManager.pendingCalculations &&
          previewLineManager.pendingCalculations.size > 0) {
        previewLineManager.processPendingCalculations();
        this.log('info', '📋 已处理预览线管理器的待处理计算队列');
      }
      
      // 延迟等待预览线准备完成
      await this.delay(this.options.timing.preLayoutDelay);
      
      return {
        success: true,
        previewLineCount,
        message: '预布局准备完成'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `预布局准备失败: ${error.message}`
      };
    }
  }
  
  /**
   * 执行包含预览线集成的统一布局
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} 布局结果
   */
  async executeUnifiedLayoutWithPreviewLineIntegration(options = {}) {
    try {
      const layoutEngine = this.layoutEngine;
      const previewLineManager = this.previewLineManager;
      
      // 设置布局进行状态
      this.coordinationState.layoutInProgress = true;
      
      // 确保布局引擎有预览线管理器引用
      if (layoutEngine.setLayoutEngine && typeof layoutEngine.updatePreviewManager === 'function') {
        layoutEngine.updatePreviewManager(previewLineManager);
        this.log('info', '🔗 已更新布局引擎的预览线管理器引用');
      }
      
      // 确保预览线管理器有布局引擎引用
      if (typeof previewLineManager.setLayoutEngine === 'function') {
        previewLineManager.setLayoutEngine(layoutEngine);
        this.log('info', '🔗 已更新预览线管理器的布局引擎引用');
      }
      
      // 执行统一布局（这会自动包含预览线endpoint处理）
      this.log('info', '🚀 开始执行统一布局（包含预览线集成）');
      const layoutResult = await layoutEngine.executeLayoutImmediate({
        ...options,
        includePreviewLines: true, // 明确指示包含预览线处理
        coordinationMode: true // 标识这是协调模式下的布局
      });
      
      if (!layoutResult.success) {
        throw new Error(layoutResult.message || '布局执行失败');
      }
      
      this.log('info', `✅ 统一布局执行成功 - 耗时: ${layoutResult.performance?.executionTime || 0}ms`);
      
      return {
        success: true,
        layoutResult,
        message: '统一布局（含预览线集成）执行成功'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `统一布局执行失败: ${error.message}`
      };
    } finally {
      this.coordinationState.layoutInProgress = false;
    }
  }
  
  /**
   * 执行后布局同步工作
   * @param {Object} layoutResult - 布局结果
   * @returns {Promise<Object>} 同步结果
   */
  async performPostLayoutSynchronization(layoutResult) {
    try {
      const previewLineManager = this.previewLineManager;
      
      // 设置预览线更新状态
      this.coordinationState.previewLineUpdateInProgress = true;
      
      // 延迟等待布局完成
      await this.delay(this.options.timing.postLayoutDelay);
      
      // 重新计算所有预览线位置
      if (typeof previewLineManager.recalculateAllPreviewPositions === 'function') {
        previewLineManager.recalculateAllPreviewPositions();
        this.log('info', '🔄 已重新计算所有预览线位置');
      }
      
      // 同步endpoint位置
      if (typeof previewLineManager.syncEndpointPositions === 'function') {
        previewLineManager.syncEndpointPositions();
        this.log('info', '🎯 已同步endpoint位置');
      }
      
      // 延迟等待预览线更新完成
      await this.delay(this.options.timing.previewLineUpdateDelay);
      
      // 验证同步结果
      const validationResult = this.validateSynchronizationResult();
      
      return {
        success: true,
        validationResult,
        message: '后布局同步完成'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `后布局同步失败: ${error.message}`
      };
    } finally {
      this.coordinationState.previewLineUpdateInProgress = false;
    }
  }
  
  /**
   * 验证同步结果
   * @returns {Object} 验证结果
   */
  validateSynchronizationResult() {
    try {
      const previewLineManager = this.previewLineManager;
      const graph = this.graph;
      
      if (!previewLineManager || !graph) {
        return {
          success: false,
          message: '组件引用无效，无法验证同步结果'
        };
      }
      
      const nodes = graph.getNodes() || [];
      const previewLineCount = previewLineManager.previewLines ? previewLineManager.previewLines.size : 0;
      
      // 检查节点位置是否有效
      let validNodePositions = 0;
      let invalidNodePositions = 0;
      
      nodes.forEach(node => {
        const position = node.getPosition();
        if (position && !isNaN(position.x) && !isNaN(position.y)) {
          validNodePositions++;
        } else {
          invalidNodePositions++;
        }
      });
      
      return {
        success: invalidNodePositions === 0,
        nodeCount: nodes.length,
        validNodePositions,
        invalidNodePositions,
        previewLineCount,
        message: invalidNodePositions === 0 ? '同步验证通过' : `发现${invalidNodePositions}个无效节点位置`
      };
      
    } catch (error) {
      return {
        success: false,
        message: `同步验证失败: ${error.message}`
      };
    }
  }
  
  /**
   * 更新性能指标
   * @param {number} duration - 执行时长
   * @param {boolean} success - 是否成功
   */
  updatePerformanceMetrics(duration, success) {
    this.performanceMetrics.totalCoordinations++;
    this.performanceMetrics.lastCoordinationDuration = duration;
    
    if (success) {
      this.performanceMetrics.successfulCoordinations++;
    } else {
      this.performanceMetrics.failedCoordinations++;
    }
    
    // 计算平均协调时间
    this.performanceMetrics.averageCoordinationTime = 
      (this.performanceMetrics.averageCoordinationTime * (this.performanceMetrics.totalCoordinations - 1) + duration) / 
      this.performanceMetrics.totalCoordinations;
  }
  
  /**
   * 获取性能指标
   * @returns {Object} 性能指标
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      successRate: this.performanceMetrics.totalCoordinations > 0 ? 
        (this.performanceMetrics.successfulCoordinations / this.performanceMetrics.totalCoordinations * 100).toFixed(2) + '%' : '0%'
    };
  }
  
  /**
   * 延迟工具函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise} Promise对象
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 日志记录工具
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   */
  log(level, message) {
    if (!this.options.debug.enableLogging) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [LayoutPreviewLineCoordinator] ${message}`;
    
    switch (level) {
      case 'debug':
        if (this.options.debug.logLevel === 'debug') {
          console.debug(logMessage);
        }
        break;
      case 'info':
        if (['debug', 'info'].includes(this.options.debug.logLevel)) {
          console.log(logMessage);
        }
        break;
      case 'warn':
        if (['debug', 'info', 'warn'].includes(this.options.debug.logLevel)) {
          console.warn(logMessage);
        }
        break;
      case 'error':
        console.error(logMessage);
        break;
    }
  }
  
  /**
   * 销毁协调器，清理资源
   */
  destroy() {
    this.log('info', '🗑️ 开始销毁LayoutPreviewLineCoordinator');
    
    // 清理WeakRef引用
    this._layoutEngineRef = null;
    this._previewLineManagerRef = null;
    this._graphRef = null;
    
    // 清理事件监听器
    this.eventListeners.clear();
    
    // 清理队列
    this.coordinationQueue = [];
    
    // 重置状态
    this.coordinationState = {
      isCoordinating: false,
      layoutInProgress: false,
      previewLineUpdateInProgress: false,
      lastCoordinationTime: 0,
      coordinationCount: 0,
    };
    
    this.log('info', '✅ LayoutPreviewLineCoordinator 销毁完成');
  }
}

// 导出单例实例（可选）
let coordinatorInstance = null;

export function getLayoutPreviewLineCoordinator(options = {}) {
  if (!coordinatorInstance) {
    coordinatorInstance = new LayoutPreviewLineCoordinator(options);
  }
  return coordinatorInstance;
}

export function resetLayoutPreviewLineCoordinator() {
  if (coordinatorInstance) {
    coordinatorInstance.destroy();
    coordinatorInstance = null;
  }
}