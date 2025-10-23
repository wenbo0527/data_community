/**
 * 统一结构化布局引擎
 * 基于父子关联关系的分层分级自底向上定位系统
 * 统一处理节点的层级布局和排列
 * 集成性能优化器和AI外呼节点验证器
 */

import { PerformanceOptimizer } from '../performance/PerformanceOptimizer.js';
import { AICallNodeValidator } from '../validation/AICallNodeValidator.js';
import { GeometricCenterAlignment } from '../algorithms/GeometricCenterAlignment.js';

export class UnifiedStructuredLayoutEngine {
  constructor(graph, options = {}, previewLineManager = null) {
    this.graph = graph;
    // 🎯 修复循环引用：使用WeakRef来避免强引用
    this._previewLineManagerRef = previewLineManager ? new WeakRef(previewLineManager) : null;
    
    // 🔒 新增：预览线刷新锁定机制
    this.previewLineRefreshLocked = false;
    this.lockStartTime = null;
    this.lockReason = null;
    this.LOCK_TIMEOUT = 5000; // 5秒超时
    this.lockTimeoutTimer = null;
    
    // 🚀 新增：布局计算防抖机制
    this.debounceConfig = {
      delay: 300, // 防抖延迟时间（毫秒）
      maxWait: 1000, // 最大等待时间（毫秒）
      immediate: false, // 是否立即执行第一次
    };
    
    // 初始化引擎
    this.initializeEngine(options);
  }

  /**
   * 创建标准性能优化器
   * @returns {Object} 性能优化器
   */
  createPerformanceOptimizer() {
    console.log('🔧 [性能优化器] 创建标准性能优化器');
    
    return {
      optimizeLayoutExecution: async (layoutFunction, context = {}, options = {}) => {
        try {
          console.log('🔄 [性能优化器] 执行布局函数');
          
          if (typeof layoutFunction !== 'function') {
            throw new Error(`layoutFunction必须是函数类型，当前类型: ${typeof layoutFunction}`);
          }
          
          // 直接调用函数
          if (context && typeof context === 'object' && context !== null) {
            return await layoutFunction.call(context);
          } else {
            return await layoutFunction();
          }
        } catch (error) {
          console.error('❌ [性能优化器] 执行失败:', error);
          throw error;
        }
      },
      
      optimizeBatchOperation: async (layoutFunction, context = {}, options = {}) => {
        return this.optimizeLayoutExecution(layoutFunction, context, options);
      },
      
      optimizePreviewLineUpdates: (updateFunction, context = {}) => {
        return updateFunction; // 直接返回原函数
      }
    };
  }

  // 初始化构造函数的其余部分
  initializeEngine(options = {}) {
    this.layoutTimer = null;
    this.lastLayoutTime = 0;
    this.pendingLayoutPromise = null;
    this.layoutQueue = [];
    this.isLayouting = false;
    
    // 🚀 新增：布局结果缓存机制
    this.layoutCache = {
      enabled: true,
      maxSize: 10,
      cache: new Map(),
      hits: 0,
      misses: 0,
    };
    
    // 🚀 新增：初始化性能优化器
    try {
      this.performanceOptimizer = new PerformanceOptimizer({
        enableDelayedExecution: true,
        enableBatching: true,
        enableSmartCache: true,
        enablePreviewLineThrottling: true,
        enableDebug: true,
        ...options.performance
      });
      
      // 验证性能优化器是否正确初始化
      if (!this.performanceOptimizer || typeof this.performanceOptimizer.optimizeLayoutExecution !== 'function') {
        throw new Error('PerformanceOptimizer初始化失败：缺少必要的方法');
      }
      
      console.log('✅ [性能优化器] 初始化成功');
    } catch (error) {
      console.error('❌ [性能优化器] 初始化失败:', error);
      // 创建一个标准的性能优化器
      this.performanceOptimizer = this.createPerformanceOptimizer();
    }
    
    // 🔍 新增：初始化AI外呼节点验证器
    this.aiCallValidator = new AICallNodeValidator({
      enableStrictValidation: true,
      enableBusinessConfigCheck: true,
      enablePreviewLineValidation: true,
      enableDebug: true,
      ...options.validation
    });
    
    // 📐 新增：初始化几何中心对齐器
    this.geometricAligner = new GeometricCenterAlignment({
      enableMixedDepthHandling: true,
      enableVirtualNodeStrategy: true,
      enableGlobalCenterAlignment: true,
      enableDebug: true,
      ...options.alignment
    });
    this.options = {
      // 层级配置
      layer: {
        baseHeight: 150, // 🔧 还原：基础层级高度从200还原到150，减少Y轴间距
        dynamicSpacing: true, // 动态间距调整
        maxLayers: 10, // 最大层级数
        tolerance: 20, // 层级容差
      },

      // 节点配置
      node: {
        minSpacing: 120, // 最小节点间距
        preferredSpacing: 180, // 首选节点间距
        maxSpacing: 300, // 最大节点间距
        // 移除endpoint相关配置
      },

      // 优化配置
      optimization: {
        enableGlobalOptimization: true,
        maxIterations: 5,
        convergenceThreshold: 0.01,
        enableAestheticOptimization: true,
        // 移除endpoint集成配置
      },

      // 性能配置
      performance: {
        enableParallelProcessing: false, // 暂时禁用并行处理
        batchSize: 50,
        enableCaching: true,
      },

      ...options,
    };

    // 布局数据模型
    this.layoutModel = {
      layers: [], // 分层结构
      nodePositions: new Map(), // 节点位置
      parentChildMap: new Map(), // 父子关系
      childParentMap: new Map(), // 子父关系
      layerMetrics: new Map(), // 层级指标
      mixedLayerNodes: new Map(), // 混合层级节点
      nodeToLayer: new Map(), // 节点到层级的映射
      optimizationHistory: [], // 优化历史
    };
    
    // 🚀 新增：性能监控指标
    this.performanceMetrics = {
      layoutCount: 0,
      totalLayoutTime: 0,
      averageLayoutTime: 0,
      cacheHitRate: 0,
      lastLayoutDuration: 0,
    };
  }

  /**
   * 🚀 新增：防抖版本的布局执行器
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} 布局结果
   */
  async executeLayoutDebounced(options = {}) {
    const { force = false, priority = 'normal' } = options;
    
    // 如果强制执行，直接调用原始方法
    if (force) {
      return this.executeLayoutImmediate(options);
    }
    
    // 检查缓存
    const cacheKey = this.generateLayoutCacheKey();
    if (this.layoutCache.enabled && this.layoutCache.cache.has(cacheKey)) {
      this.layoutCache.hits++;
      this.updateCacheHitRate();
      console.log('📦 [布局缓存] 命中缓存，直接返回结果');
      return this.layoutCache.cache.get(cacheKey);
    }
    
    // 如果已有待处理的布局，返回现有的Promise
    if (this.pendingLayoutPromise) {
      console.log('⏳ [布局防抖] 已有待处理的布局，等待现有布局完成');
      return this.pendingLayoutPromise;
    }
    
    // 创建防抖Promise
    this.pendingLayoutPromise = new Promise((resolve, reject) => {
      // 清除现有定时器
      if (this.layoutTimer) {
        clearTimeout(this.layoutTimer);
      }
      
      // 检查是否超过最大等待时间
      const now = Date.now();
      const timeSinceLastLayout = now - this.lastLayoutTime;
      const shouldExecuteImmediately = timeSinceLastLayout >= this.debounceConfig.maxWait;
      
      const executeLayout = async () => {
        try {
          this.layoutTimer = null;
          const result = await this.executeLayoutImmediate(options);
          
          // 缓存结果
          if (this.layoutCache.enabled) {
            this.cacheLayoutResult(cacheKey, result);
          }
          
          this.pendingLayoutPromise = null;
          resolve(result);
        } catch (error) {
          this.pendingLayoutPromise = null;
          reject(error);
        }
      };
      
      if (shouldExecuteImmediately || priority === 'high') {
        console.log('🚀 [布局防抖] 立即执行布局（超时或高优先级）');
        executeLayout();
      } else {
        console.log(`⏱️ [布局防抖] 延迟 ${this.debounceConfig.delay}ms 执行布局`);
        this.layoutTimer = setTimeout(executeLayout, this.debounceConfig.delay);
      }
    });
    
    return this.pendingLayoutPromise;
  }
  
  /**
   * 执行统一结构化布局（立即执行版本）
   * @param {Object} options - 布局选项
   * @returns {Object} 布局结果
   */
  async executeLayoutImmediate(options = {}) {
    const startTime = Date.now();
    this.isLayouting = true;
    this.performanceMetrics.layoutCount++;
    
    console.log("🚀 [统一结构化布局] 开始执行布局");

    // 🔒 新增：在布局开始时锁定预览线刷新
    this.lockPreviewLineRefresh('布局计算中');

    // 检查性能优化器是否可用
    if (!this.performanceOptimizer || typeof this.performanceOptimizer.optimizeLayoutExecution !== 'function') {
      console.warn('⚠️ [布局引擎] 性能优化器不可用，使用直接执行模式');
      return await this.executeLayoutDirect(options);
    }

    // 🚀 使用性能优化器优化布局执行
    return await this.performanceOptimizer.optimizeLayoutExecution(
      async () => {
        try {
          // 阶段1：数据预处理（优化版）
          const preprocessResult = await this.performanceOptimizer.optimizeLayoutExecution(
            () => this.preprocessLayoutData(),
            this,
            { stage: 'preprocessing' }
          );

          // 🎯 关键修复：节点数量验证，确保在只有开始节点时正确跳过布局
          const { validNodes, totalNodes } = preprocessResult;
          
          // 检查是否只有一个开始节点且没有其他有效节点
          if (validNodes.length === 1) {
            const singleNode = validNodes[0];
            const nodeId = singleNode.id || singleNode.getId();
            const nodeData = singleNode.getData() || {};
            
            // 如果是开始节点，跳过布局
            if (nodeData.type === 'start' || nodeId.includes('start')) {
              console.log('⚠️ [统一结构化布局] 检测到只有单个开始节点，无需执行布局');
              this.isLayouting = false;
              return {
                success: true,
                message: '只有单个开始节点，无需执行布局',
                nodeCount: 1,
                skipped: true
              };
            }
          }
          
          // 检查总节点数量是否足够执行布局
          if (totalNodes < 2) {
            console.log(`⚠️ [统一结构化布局] 节点数量不足(${totalNodes})，无需执行布局`);
            this.isLayouting = false;
            return {
              success: true,
              message: `节点数量不足(${totalNodes})，无需执行布局`,
              nodeCount: totalNodes,
              skipped: true
            };
          }

          // 阶段2：分层构建
          const layerStructure = await this.performanceOptimizer.optimizeLayoutExecution(
            () => this.buildHierarchicalLayers(preprocessResult),
            this,
            { stage: 'layering' }
          );

          // 🎯 关键修复：在nodeToLayer映射建立完成后，通知预览线管理器可以安全调用
          this.notifyPreviewManagerReady();

          // 阶段3：自底向上位置计算（临时禁用几何对齐，使用标准算法）
          console.log('🔧 [临时禁用] 几何对齐已禁用，使用标准布局算法');
          const positions = await this.performanceOptimizer.optimizeLayoutExecution(
            () => this.calculateBottomUpPositions(layerStructure),
            this,
            { stage: 'positioning' }
          );

          // 阶段4：层级内统一优化
          const optimizedPositions = await this.performanceOptimizer.optimizeLayoutExecution(
            () => this.optimizeUnifiedLayerAlignment(positions, layerStructure),
            this,
            { stage: 'optimization' }
          );

          // 阶段5：全局平衡优化
          const finalResult = await this.performanceOptimizer.optimizeLayoutExecution(
            () => this.applyGlobalOptimization(optimizedPositions, layerStructure),
            this,
            { stage: 'global_optimization' }
          );

          // 更新性能指标
          const endTime = Date.now();
          this.performanceMetrics.lastLayoutDuration = endTime - startTime;
          this.performanceMetrics.totalLayoutTime += this.performanceMetrics.lastLayoutDuration;
          this.performanceMetrics.averageLayoutTime = this.performanceMetrics.totalLayoutTime / this.performanceMetrics.layoutCount;
          this.lastLayoutTime = endTime;

          console.log('✅ [统一结构化布局] 布局执行完成', {
            耗时: `${this.performanceMetrics.lastLayoutDuration}ms`,
            节点数: totalNodes,
            层级数: layerStructure.layers.length
          });

          return {
            success: true,
            nodePositions: finalResult.nodePositions,
            layerStructure: layerStructure,
            metrics: {
              duration: this.performanceMetrics.lastLayoutDuration,
              nodeCount: totalNodes,
              layerCount: layerStructure.layers.length
            }
          };

        } catch (error) {
          console.error('❌ [统一结构化布局] 执行失败:', error);
          throw error;
        } finally {
          this.isLayouting = false;
          this.unlockPreviewLineRefresh();
        }
      },
      this,
      { stage: 'complete_layout' }
    );
  }

  /**
   * 直接执行布局（不使用性能优化器）
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} 布局结果
   */
  async executeLayoutDirect(options = {}) {
    console.log('🔧 [布局引擎] 使用直接执行模式');
    
    try {
      // 数据预处理阶段
      const preprocessResult = await this.preprocessLayoutData();
      
      // 检查节点数量
      const { validNodes, totalNodes } = preprocessResult;
      if (totalNodes < 2) {
        console.log(`⚠️ [直接执行] 节点数量不足(${totalNodes})，无需执行布局`);
        return {
          success: true,
          message: `节点数量不足(${totalNodes})，无需执行布局`,
          nodeCount: totalNodes,
          skipped: true
        };
      }
      
      // 分层构建阶段
      const layerStructure = await this.buildHierarchicalLayers(preprocessResult);
      
      // 位置计算阶段
      const positions = await this.calculateBottomUpPositions(layerStructure);
      
      // 层级内优化阶段
      const optimizedPositions = await this.optimizeUnifiedLayerAlignment(positions, layerStructure);
      
      // 全局优化阶段
      const finalResult = await this.applyGlobalOptimization(optimizedPositions, layerStructure);
      
      console.log('✅ [布局引擎] 直接执行模式完成');
      return {
        success: true,
        nodePositions: finalResult.nodePositions,
        layerStructure: layerStructure,
        metrics: {
          nodeCount: totalNodes,
          layerCount: layerStructure.layers.length
        }
      };
      
    } catch (error) {
      console.error('❌ [布局引擎] 直接执行模式失败:', error);
      throw error;
    } finally {
      this.isLayouting = false;
      this.unlockPreviewLineRefresh();
    }
  }

  /**
   * 数据预处理：提取节点和边
   * @returns {Object} 预处理结果
   */
  async preprocessLayoutData() {
    console.log("🔍 [数据预处理] 开始提取节点和边数据");

    // 提取所有节点
    const allNodes = this.graph.getNodes();
    console.log(`📊 [数据预处理] 图中总节点数: ${allNodes.length}`);

    // 过滤有效节点（排除虚拟节点）
    const validNodes = allNodes.filter((node) => {
      const nodeData = node.getData() || {};
      const nodeId = node.id || node.getId();
      return (
        !nodeData.isVirtual &&
        !nodeId.includes("virtual")
      );
    });

    // 提取所有边
    const validEdges = this.graph.getEdges();

    console.log("📊 [数据预处理] 数据统计:", {
      有效节点: validNodes.length,
      有效边: validEdges.length,
      总处理节点: validNodes.length,
    });

    return {
      validNodes,
      validEdges,
      totalNodes: validNodes.length,
    };
  }
}