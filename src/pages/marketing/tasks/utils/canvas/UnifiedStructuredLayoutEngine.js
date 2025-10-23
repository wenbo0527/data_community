/**
 * 统一结构化布局引擎 - 重构版本
 * 主要职责：模块协调和API兼容性
 * 目标：简化为200行左右的协调器
 */

// 导入配置模块
import LayoutConfig from './layout/config/LayoutConfig.js';
import PerformanceConfig from './layout/config/PerformanceConfig.js';

// 导入核心模块
import DataPreprocessor from './layout/core/DataPreprocessor.js';
import LayoutExecutor from './layout/core/LayoutExecutor.js';
import PositionApplicator from './layout/core/PositionApplicator.js';

// 导入算法模块
import LayerCalculator from './layout/algorithms/LayerCalculator.js';
import HierarchicalBuilder from './layout/algorithms/HierarchicalBuilder.js';
import BottomUpPositioner from './layout/algorithms/BottomUpPositioner.js';
import LayerOptimizer from './layout/algorithms/LayerOptimizer.js';
import GlobalOptimizer from './layout/algorithms/GlobalOptimizer.js';

// 导入工具模块
import NodeFilter from './layout/utils/NodeFilter.js';
import EdgeFilter from './layout/utils/EdgeFilter.js';
import LayerUtils from './layout/utils/LayerUtils.js';
import PositionUtils from './layout/utils/PositionUtils.js';

// 导入性能模块
import LayoutCache from './layout/performance/LayoutCache.js';
import DebounceManager from './layout/performance/DebounceManager.js';
import PerformanceMonitor from './layout/performance/PerformanceMonitor.js';
import PreviewLineLock from './layout/performance/PreviewLineLock.js';

/**
 * 统一结构化布局引擎
 * 重构后的协调器版本，保持完全的API兼容性
 */
export class UnifiedStructuredLayoutEngine {
  constructor(graph, options = {}, previewLineManager = null) {
    console.log('🚀 [统一布局引擎] 初始化协调器');
    
    // 验证输入参数
    this.validateInputs(graph, options);
    
    // 存储核心依赖
    this.graph = graph;
    this.options = options;
    this.previewLineManager = previewLineManager;
    
    // 初始化配置
    this.initializeConfigurations(options);
    
    // 初始化核心模块
    this.initializeCoreModules();
    
    // 初始化算法模块
    this.initializeAlgorithmModules();
    
    // 初始化工具和性能模块
    this.initializeUtilityModules();
    
    // 设置模块间依赖关系 - 确保所有模块都已正确初始化
    this.setupModuleDependencies();
    
    // 初始化兼容性数据结构
    this.initializeCompatibilityStructures();
    
    console.log('✅ [统一布局引擎] 协调器初始化完成');
  }

  /**
   * 验证输入参数
   */
  validateInputs(graph, options) {
    if (!graph) {
      throw new Error('[统一布局引擎] Graph实例不能为空');
    }
    
    if (typeof graph.getNodes !== 'function' || typeof graph.getEdges !== 'function') {
      throw new Error('[统一布局引擎] Graph实例缺少必要的方法');
    }
  }

  /**
   * 初始化配置模块
   */
  initializeConfigurations(options) {
    this.layoutConfig = new LayoutConfig(options.layout || {});
    this.performanceConfig = new PerformanceConfig(options.performance || {});
  }

  /**
   * 初始化核心模块
   */
  initializeCoreModules() {
    this.dataPreprocessor = new DataPreprocessor(this.layoutConfig);
    this.layoutExecutor = new LayoutExecutor(this.layoutConfig);
    this.positionApplicator = new PositionApplicator(this.layoutConfig);
  }

  /**
   * 初始化算法模块
   */
  initializeAlgorithmModules() {
    this.layerCalculator = new LayerCalculator(this.layoutConfig);
    this.hierarchicalBuilder = new HierarchicalBuilder(this.layoutConfig);
    this.bottomUpPositioner = new BottomUpPositioner(this.layoutConfig);
    this.layerOptimizer = new LayerOptimizer(this.layoutConfig);
    this.globalOptimizer = new GlobalOptimizer(this.layoutConfig);
  }

  /**
   * 初始化工具和性能模块
   */
  initializeUtilityModules() {
    // 工具模块
    this.nodeFilter = new NodeFilter();
    this.edgeFilter = new EdgeFilter();
    this.layerUtils = new LayerUtils();
    this.positionUtils = new PositionUtils();
    
    // 性能模块
    this.layoutCache = new LayoutCache(this.performanceConfig.cache);
    this.debounceManager = new DebounceManager(this.performanceConfig.debounce);
    this.performanceMonitor = new PerformanceMonitor(this.performanceConfig.monitor);
    this.previewLineLock = new PreviewLineLock(this.performanceConfig.previewLock);
  }

  /**
   * 设置模块间依赖关系
   */
  setupModuleDependencies() {
    // 验证所有必需的模块是否已初始化
    if (!this.layoutExecutor) {
      throw new Error('LayoutExecutor 未初始化');
    }
    
    if (!this.layerCalculator || !this.hierarchicalBuilder || !this.bottomUpPositioner || 
        !this.layerOptimizer || !this.globalOptimizer) {
      throw new Error('算法模块未完全初始化');
    }
    
    // 为布局执行器设置算法模块
    this.layoutExecutor.setAlgorithmModules({
      layerCalculator: this.layerCalculator,
      hierarchicalBuilder: this.hierarchicalBuilder,
      bottomUpPositioner: this.bottomUpPositioner,
      layerOptimizer: this.layerOptimizer,
      globalOptimizer: this.globalOptimizer
    });
  }

  /**
   * 初始化兼容性数据结构
   */
  initializeCompatibilityStructures() {
    // 保持向后兼容的数据结构
    this.layoutModel = {
      layers: [],
      nodePositions: new Map(),
      parentChildMap: new Map(),
      childParentMap: new Map(),
      layerMetrics: new Map(),
      mixedLayerNodes: new Map(),
      nodeToLayer: new Map(),
      optimizationHistory: [],
      endpointNodes: new Map()
    };
    
    // 性能指标
    this.performanceMetrics = {
      layoutCount: 0,
      totalLayoutTime: 0,
      averageLayoutTime: 0,
      cacheHitRate: 0,
      lastLayoutDuration: 0
    };
  }

  /**
   * 执行布局 - 主要对外接口
   * @param {Object} layoutInput - 布局输入参数
   * @returns {Object} 布局结果
   */
  async executeLayout(layoutInput = {}) {
    const sessionId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🎯 [统一布局引擎] 开始执行布局 - 会话: ${sessionId}`);
    
    try {
      // 开始性能监控
      this.performanceMonitor.startSession(sessionId, layoutInput);
      
      // 检查预览线锁定
      const lockResult = this.previewLineLock.lock(sessionId, {
        reason: 'layout_execution',
        timeout: 10000
      });
      
      if (!lockResult.locked) {
        console.warn('⚠️ [统一布局引擎] 预览线被锁定，跳过布局');
        return this.createEmptyResult(sessionId);
      }
      
      try {
        // 阶段1: 数据预处理
        const preprocessedData = await this.dataPreprocessor.preprocess(
          this.graph.getNodes(),
          this.graph.getEdges(),
          layoutInput
        );
        
        // 阶段2: 布局计算
        const layoutResult = await this.layoutExecutor.executeLayout(
          preprocessedData,
          layoutInput.bounds,
          layoutInput.options
        );
        
        // 阶段3: 位置应用
        const applicationResult = await this.positionApplicator.applyPositions(
          this.graph,
          layoutResult.positions,
          layoutInput.applicationOptions
        );
        
        // 更新兼容性数据结构
        this.updateCompatibilityStructures(layoutResult, applicationResult);
        
        // 结束性能监控
        this.performanceMonitor.endSession(sessionId, { success: true });
        
        console.log(`✅ [统一布局引擎] 布局执行完成 - 会话: ${sessionId}`);
        
        return this.createSuccessResult(sessionId, layoutResult, applicationResult);
        
      } finally {
        // 释放预览线锁定
        this.previewLineLock.unlock(sessionId);
      }
      
    } catch (error) {
      console.error(`❌ [统一布局引擎] 布局执行失败 - 会话: ${sessionId}`, error);
      this.performanceMonitor.endSession(sessionId, { success: false, error: error.message });
      
      return this.createErrorResult(sessionId, error);
    }
  }

  /**
   * 更新兼容性数据结构
   */
  updateCompatibilityStructures(layoutResult, applicationResult) {
    if (layoutResult.hierarchy) {
      this.layoutModel.layers = layoutResult.hierarchy.layers || [];
    }
    
    if (layoutResult.positions) {
      this.layoutModel.nodePositions = new Map(layoutResult.positions);
    }
    
    // 更新性能指标
    this.performanceMetrics.layoutCount++;
    this.performanceMetrics.lastLayoutDuration = layoutResult.totalExecutionTime || 0;
    
    if (this.performanceMetrics.layoutCount > 0) {
      this.performanceMetrics.totalLayoutTime += this.performanceMetrics.lastLayoutDuration;
      this.performanceMetrics.averageLayoutTime = 
        this.performanceMetrics.totalLayoutTime / this.performanceMetrics.layoutCount;
    }
  }

  /**
   * 创建成功结果
   */
  createSuccessResult(sessionId, layoutResult, applicationResult) {
    return {
      success: true,
      sessionId,
      layoutResult,
      applicationResult,
      performanceReport: this.getPerformanceReport(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 创建错误结果
   */
  createErrorResult(sessionId, error) {
    return {
      success: false,
      sessionId,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 创建空结果
   */
  createEmptyResult(sessionId) {
    return {
      success: false,
      sessionId,
      reason: 'preview_line_locked',
      timestamp: new Date().toISOString()
    };
  }

  // ==================== 向后兼容性方法 ====================

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      cacheStats: this.layoutCache.getStats(),
      monitorStats: this.performanceMonitor.getStats()
    };
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.layoutCache.getStats();
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.layoutCache.clear();
  }

  /**
   * 锁定预览线
   */
  lockPreviewLine(reason = 'manual') {
    return this.previewLineLock.lock('manual_lock', { reason });
  }

  /**
   * 解锁预览线
   */
  unlockPreviewLine() {
    this.previewLineLock.unlock('manual_lock');
  }

  /**
   * 检查预览线锁定状态
   */
  isPreviewLineLocked() {
    return this.previewLineLock.hasAnyLocks();
  }

  /**
   * 获取预览线锁定统计
   */
  getPreviewLineLockStats() {
    return this.previewLineLock.getStats();
  }

  /**
   * 启用缓存
   */
  enableCache() {
    this.layoutCache.enable();
  }

  /**
   * 禁用缓存
   */
  disableCache() {
    this.layoutCache.disable();
  }

  /**
   * 启用性能监控
   */
  enablePerformanceMonitoring() {
    this.performanceMonitor.enable();
  }

  /**
   * 禁用性能监控
   */
  disablePerformanceMonitoring() {
    this.performanceMonitor.disable();
  }

  /**
   * 更新预览线管理器实例
   */
  updatePreviewLineManager(newPreviewLineManager) {
    this.previewLineManager = newPreviewLineManager;
    console.log('🔄 [统一布局引擎] 预览线管理器已更新');
  }

  /**
   * 销毁引擎，清理资源
   */
  destroy() {
    console.log('🧹 [统一布局引擎] 开始清理资源');
    
    // 清理性能模块
    if (this.performanceMonitor) {
      this.performanceMonitor.destroy();
    }
    
    if (this.layoutCache) {
      this.layoutCache.clear();
    }
    
    if (this.previewLineLock) {
      this.previewLineLock.unlockAll();
    }
    
    console.log('✅ [统一布局引擎] 资源清理完成');
  }

  /**
   * 计算自底向上的位置（兼容性方法）
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 位置映射
   */
  async calculateBottomUpPositions(layerStructure) {
    console.log('📐 [统一布局引擎] 执行自底向上位置计算（兼容性方法）');
    
    // 委托给LayerUtils处理
    return this.layerUtils.calculateBottomUpPositions(layerStructure.layers || []);
  }

  /**
   * 构建分层结构（兼容性方法）
   * @param {Object} hierarchyData - 层级数据
   * @returns {Object} 分层结构
   */
  async buildHierarchicalLayers(hierarchyData) {
    console.log('🏗️ [统一布局引擎] 构建分层结构（兼容性方法）');
    
    // 委托给HierarchicalBuilder处理
    return this.hierarchicalBuilder.buildLayers(hierarchyData);
  }

  /**
   * 立即执行布局（兼容性方法）
   * @param {Object} layoutInput - 布局输入
   * @returns {Object} 布局结果
   */
  async executeLayoutImmediate(layoutInput = {}) {
    console.log('⚡ [统一布局引擎] 立即执行布局（兼容性方法）');
    
    // 直接调用主要的executeLayout方法
    return this.executeLayout(layoutInput);
  }
}

export default UnifiedStructuredLayoutEngine;