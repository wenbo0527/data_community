/**
 * 统一布局引擎主入口
 * 负责协调所有布局模块的工作，保持向后兼容性
 * 重构后的简化版本，约200行代码
 */

import LayoutConfig from './config/LayoutConfig.js';
import PerformanceConfig from './config/PerformanceConfig.js';
import LayoutExecutor from './core/LayoutExecutor.js';
import DataPreprocessor from './core/DataPreprocessor.js';
import LayoutModel from './core/LayoutModel.js';
import EventManager from './core/EventManager.js';
import ValidationEngine from './core/ValidationEngine.js';
import LayerCalculator from './algorithms/LayerCalculator.js';
import HierarchicalBuilder from './algorithms/HierarchicalBuilder.js';
import BottomUpPositioner from './algorithms/BottomUpPositioner.js';
import LayerOptimizer from './algorithms/LayerOptimizer.js';
import GlobalOptimizer from './algorithms/GlobalOptimizer.js';
import PositionApplicator from './core/PositionApplicator.js';
import LayoutCache from './performance/LayoutCache.js';
import DebounceManager from './performance/DebounceManager.js';
import PerformanceMonitor from './performance/PerformanceMonitor.js';
import PreviewLineLock from './performance/PreviewLineLock.js';

/**
 * 统一布局引擎
 * 主要职责：
 * 1. 模块初始化和依赖注入
 * 2. 对外接口保持不变
 * 3. 错误处理和日志记录
 * 4. 协调各模块工作
 */
export class UnifiedLayoutEngine {
  constructor(graph, options = {}, previewLineManager = null) {
    // 初始化配置
    this.layoutConfig = new LayoutConfig(options.layout || {});
    this.performanceConfig = new PerformanceConfig(options.performance || {});
    
    // 存储核心依赖
    this.graph = graph;
    this.previewLineManager = previewLineManager;
    this.options = options;
    
    // 初始化性能模块
    this.cache = new LayoutCache(this.performanceConfig.cache);
    this.debounceManager = new DebounceManager(this.performanceConfig.debounce);
    this.performanceMonitor = new PerformanceMonitor();
    this.previewLineLock = new PreviewLineLock(this.performanceConfig.lock);
    
    // 初始化核心模块
    this.layoutModel = new LayoutModel();
    this.eventManager = new EventManager();
    this.validationEngine = new ValidationEngine();
    this.dataPreprocessor = new DataPreprocessor(this.graph, this.layoutConfig);
    this.layerCalculator = new LayerCalculator(this.layoutConfig);
    this.hierarchicalBuilder = new HierarchicalBuilder(this.layoutConfig);
    this.bottomUpPositioner = new BottomUpPositioner(this.layoutConfig);
    this.layerOptimizer = new LayerOptimizer(this.layoutConfig);
    this.globalOptimizer = new GlobalOptimizer(this.layoutConfig);
    this.positionApplicator = new PositionApplicator(this.layoutConfig);
    
    // 初始化执行器
    this.layoutExecutor = new LayoutExecutor({
      dataPreprocessor: this.dataPreprocessor,
      layerCalculator: this.layerCalculator,
      hierarchicalBuilder: this.hierarchicalBuilder,
      bottomUpPositioner: this.bottomUpPositioner,
      layerOptimizer: this.layerOptimizer,
      globalOptimizer: this.globalOptimizer,
      positionApplicator: this.positionApplicator
    });
    
    // 错误处理
    this.lastError = null;
    this.isInitialized = true;
    
    console.log('UnifiedLayoutEngine initialized successfully');
  }
  
  /**
   * 执行布局计算
   * 主要的对外接口，保持向后兼容性
   */
  async executeLayout(options = {}) {
    if (!this.isInitialized) {
      throw new Error('Layout engine not initialized');
    }

    // 检查预览线锁定状态
    if (this.previewLineLock.isLocked()) {
      console.warn('Layout execution skipped due to preview line lock');
      return { success: false, reason: 'locked' };
    }

    // 开始性能监控
    const taskId = `layout_${Date.now()}`;
    
    try {
      // 触发布局开始事件
      this.emit('layout:start', { taskId, options });
      
      this.performanceMonitor.startTiming(taskId);
      
      // 生成缓存键
      const cacheKey = this.generateCacheKey(options);
      
      // 检查缓存
      if (this.cache.enabled) {
        const cachedResult = this.cache.get(cacheKey);
        if (cachedResult) {
          console.log('Using cached layout result');
          this.performanceMonitor.endTiming(taskId);
          // 触发布局完成事件（缓存）
          this.emit('layout:complete', { taskId, result: cachedResult, fromCache: true });
          return cachedResult;
        }
      }
      
      // 锁定预览线
      this.previewLineLock.lock('layout_execution');
      
      // 执行布局计算
      const result = await this.layoutExecutor.execute({
        graph: this.graph,
        previewLineManager: this.previewLineManager,
        options: { ...this.options, ...options }
      });
      
      // 缓存结果
      if (this.cache.enabled && result.success) {
        this.cache.set(cacheKey, result);
      }
      
      // 结束性能监控
      this.performanceMonitor.endTiming(taskId);
      
      // 解锁预览线
      this.previewLineLock.unlock('layout_execution');
      
      // 触发布局完成事件
      this.emit('layout:complete', { taskId, result, nodeCount: result.nodeCount || 0 });
      
      return result;
      
    } catch (error) {
      this.lastError = error;
      this.previewLineLock.unlock('layout_execution');
      this.performanceMonitor.endTiming(taskId);
      
      // 触发布局错误事件
      this.emit('layout:error', { taskId, error });
      
      console.error('Layout execution failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * 更新图实例
   * 保持向后兼容性
   */
  updateGraph(newGraph) {
    if (!newGraph) {
      console.warn('Invalid graph provided to updateGraph');
      return;
    }
    
    this.graph = newGraph;
    this.cache.clear(); // 清除缓存
    console.log('Graph updated successfully');
  }
  
  /**
   * 更新预览线管理器
   * 保持向后兼容性
   */
  updatePreviewManager(newPreviewManager) {
    this.previewLineManager = newPreviewManager;
    console.log('Preview manager updated successfully');
  }
  
  /**
   * 获取性能报告
   * 新增功能，用于监控和调试
   */
  getPerformanceReport() {
    return {
      monitor: this.performanceMonitor.getReport(),
      cache: {
        hitRate: this.cache.getHitRate(),
        size: this.cache.cache.size
      },
      lock: {
        isLocked: this.previewLineLock.isLocked(),
        lockReason: this.previewLineLock.lockReason
      },
      lastError: this.lastError
    };
  }
  
  /**
   * 生成缓存键
   * 基于图的状态和选项生成唯一键
   */
  generateCacheKey(options) {
    const graphHash = this.graph ? this.graph.getCells().length : 0;
    const optionsHash = JSON.stringify(options);
    // 使用更安全的哈希方法，避免btoa的无效字符问题
    const hash = optionsHash.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `layout_${graphHash}_${Math.abs(hash).toString(36).slice(0, 10)}`;
  }
  
  /**
   * 防抖执行布局
   * 用于频繁触发的场景
   */
  debouncedExecuteLayout(options = {}) {
    return this.debounceManager.debounce(() => {
      return this.executeLayout(options);
    });
  }
  
  /**
   * 清理资源
   * 用于组件销毁时的清理
   */
  dispose() {
    // 清理核心模块
    if (this.layoutModel) {
      this.layoutModel.dispose();
    }
    if (this.eventManager) {
      this.eventManager.dispose();
    }
    if (this.validationEngine) {
      this.validationEngine.dispose();
    }
    
    // 清理性能模块
    this.cache.clear();
    this.debounceManager.cancel();
    this.previewLineLock.unlock('dispose');
    this.isInitialized = false;
    console.log('UnifiedLayoutEngine disposed');
  }
  
  /**
   * 添加事件监听器
   * 暴露事件系统接口
   */
  on(event, listener) {
    if (this.eventManager && typeof this.eventManager.on === 'function') {
      return this.eventManager.on(event, listener);
    } else if (this.layoutModel && typeof this.layoutModel.on === 'function') {
      return this.layoutModel.on(event, listener);
    } else {
      console.warn('Event system not available');
    }
  }
  
  /**
   * 触发事件
   * 暴露事件系统接口
   */
  emit(event, data) {
    if (this.eventManager && typeof this.eventManager.emit === 'function') {
      return this.eventManager.emit(event, data);
    } else if (this.layoutModel && typeof this.layoutModel.emit === 'function') {
      return this.layoutModel.emit(event, data);
    } else {
      console.warn('Event system not available');
    }
  }
  
  /**
   * 移除事件监听器
   * 暴露事件系统接口
   */
  off(event, listener) {
    if (this.eventManager && typeof this.eventManager.off === 'function') {
      return this.eventManager.off(event, listener);
    } else if (this.layoutModel && typeof this.layoutModel.off === 'function') {
      return this.layoutModel.off(event, listener);
    } else {
      console.warn('Event system not available');
    }
  }

  /**
   * 获取模块状态
   * 用于调试和监控
   */
  getModuleStatus() {
    return {
      initialized: this.isInitialized,
      modules: {
        layoutModel: !!this.layoutModel,
        eventManager: !!this.eventManager,
        validationEngine: !!this.validationEngine,
        dataPreprocessor: !!this.dataPreprocessor,
        layerCalculator: !!this.layerCalculator,
        hierarchicalBuilder: !!this.hierarchicalBuilder,
        bottomUpPositioner: !!this.bottomUpPositioner,
        layerOptimizer: !!this.layerOptimizer,
        globalOptimizer: !!this.globalOptimizer,
        positionApplicator: !!this.positionApplicator,
        layoutExecutor: !!this.layoutExecutor
      },
      performance: {
        cache: !!this.cache,
        debounceManager: !!this.debounceManager,
        performanceMonitor: !!this.performanceMonitor,
        previewLineLock: !!this.previewLineLock
      }
    };
  }
}

// 向后兼容性：导出为默认类名
export { UnifiedLayoutEngine as UnifiedStructuredLayoutEngine };
export default UnifiedLayoutEngine;