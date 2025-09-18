/**
 * 统一结构化布局引擎
 * 基于父子关联关系的分层分级自底向上定位系统
 * 统一处理预览线endpoint和普通节点的同层排列
 * 集成性能优化器和AI外呼节点验证器
 */

import { PerformanceOptimizer } from './coordinate-refactor/performance/PerformanceOptimizer.js';
import { AICallNodeValidator } from './coordinate-refactor/validation/AICallNodeValidator.js';
import { GeometricCenterAlignment } from './coordinate-refactor/algorithms/GeometricCenterAlignment.js';

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
    this.performanceOptimizer = new PerformanceOptimizer({
      enableDelayedExecution: true,
      enableBatching: true,
      enableSmartCache: true,
      enablePreviewLineThrottling: true,
      enableDebug: true,
      ...options.performance
    });
    
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
        endpointSize: { width: 20, height: 20 }, // endpoint虚拟节点大小
      },

      // 优化配置
      optimization: {
        enableGlobalOptimization: true,
        maxIterations: 5,
        convergenceThreshold: 0.01,
        enableAestheticOptimization: true,
        enableEndpointIntegration: true, // 启用endpoint集成
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
      endpointNodes: new Map(), // endpoint虚拟节点
      mixedLayerNodes: new Map(), // 混合层级节点（普通节点+endpoint）
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
          const { validNodes, endpointNodes, totalNodes } = preprocessResult;
          
          // 检查是否只有一个开始节点且没有其他有效节点
          if (validNodes.length === 1 && endpointNodes.length === 0) {
            const singleNode = validNodes[0];
            const nodeId = singleNode.id || singleNode.getId();
            const nodeData = singleNode.getData() || {};
            
            // 如果是开始节点且没有预览线endpoint，跳过布局
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

          // 阶段2：分层构建（包含endpoint集成）
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

          // 阶段4：层级内统一优化（普通节点+endpoint）
          const optimizedPositions = await this.performanceOptimizer.optimizeLayoutExecution(
            () => this.optimizeUnifiedLayerAlignment(positions, layerStructure),
            this,
            { stage: 'optimization' }
          );

          // 阶段5：全局平衡优化
          const finalPositions = await this.performanceOptimizer.optimizeLayoutExecution(
            () => this.applyGlobalOptimization(optimizedPositions, layerStructure),
            this,
            { stage: 'global_optimization' }
          );

          // 阶段6：应用到图形（优化预览线更新频率）
          await this.performanceOptimizer.optimizeLayoutExecution(
            () => this.applyPositionsToGraphOptimized(finalPositions),
            this,
            { stage: 'application' }
          );

          // 🎯 关键修复：最终同步所有endpoint位置到预览线管理器（节流优化）
          const optimizedSyncFunction = this.performanceOptimizer.optimizePreviewLineUpdates(
            () => this.syncAllEndpointPositions(finalPositions),
            { nodeId: 'global_sync' }
          );
          optimizedSyncFunction();

          const result = this.generateLayoutReport(layerStructure, finalPositions);
          
          // 更新性能指标
          const endTime = Date.now();
          const duration = endTime - startTime;
          this.updatePerformanceMetrics(duration);
          this.lastLayoutTime = endTime;
          this.isLayouting = false;
          
          // 🔒 新增：布局完成后解锁预览线刷新
          this.unlockPreviewLineRefresh('布局计算完成');
          
          return result;
        } catch (error) {
          console.error("❌ [统一结构化布局] 布局执行失败:", error);
          this.isLayouting = false;
          
          // 🔒 新增：布局失败时也要解锁预览线刷新
          this.unlockPreviewLineRefresh('布局计算失败');
          
          return {
            success: false,
            error: error.message,
            message: `布局执行失败: ${error.message}`,
          };
        }
      },
      this,
      { operation: 'full_layout' }
    );
  }
  
  /**
   * 执行统一结构化布局（对外接口，默认使用防抖）
   * @param {Object} options - 布局选项
   * @returns {Object} 布局结果
   */
  async executeLayout(options = {}) {
    return this.executeLayoutDebounced(options);
  }

  /**
   * 🔧 更新图实例（支持布局引擎实例复用）
   * @param {Object} newGraph - 新的图实例
   */
  updateGraph(newGraph) {
    if (!newGraph) {
      console.warn('⚠️ [布局引擎更新] 新图实例为空，跳过更新')
      return
    }

    console.log('🔄 [布局引擎更新] 更新图实例')
    this.graph = newGraph
    
    // 清理旧的布局数据
    this.layoutModel = {
      layers: [],
      nodePositions: new Map(),
      parentChildMap: new Map(),
      childParentMap: new Map(),
      layerMetrics: new Map(),
      endpointNodes: new Map(),
      mixedLayerNodes: new Map(),
      nodeToLayer: new Map(),
      optimizationHistory: [],
    }
    
    console.log('✅ [布局引擎更新] 图实例更新完成，布局数据已重置')
  }

  /**
   * 🔧 更新预览线管理器（支持布局引擎实例复用）
   * @param {Object} newPreviewManager - 新的预览线管理器实例
   */
  updatePreviewManager(newPreviewManager) {
    console.log('🔄 [布局引擎更新] 更新预览线管理器')
    // 🎯 修复循环引用：使用WeakRef
    this._previewLineManagerRef = newPreviewManager ? new WeakRef(newPreviewManager) : null;
    
    // 重新建立引用关系
    if (newPreviewManager && newPreviewManager.setLayoutEngine) {
      newPreviewManager.setLayoutEngine(this)
      console.log('🔗 [布局引擎更新] 预览线管理器引用已重新建立')
    } else if (newPreviewManager) {
      newPreviewManager.layoutEngine = this
      console.log('🔗 [布局引擎更新] 预览线管理器引用已直接设置')
    }
    
    console.log('✅ [布局引擎更新] 预览线管理器更新完成')
  }

  /**
   * 🎯 获取预览线管理器（安全访问WeakRef）
   * @returns {Object|null} 预览线管理器实例或null
   */
  get previewLineManager() {
    if (this._previewLineManagerRef) {
      const manager = this._previewLineManagerRef.deref();
      if (manager) {
        return manager;
      } else {
        // WeakRef已被垃圾回收，清理引用
        this._previewLineManagerRef = null;
        console.log('🗑️ [布局引擎] 预览线管理器已被垃圾回收，清理WeakRef');
      }
    }
    
    // 回退到全局查找
    return window.unifiedPreviewLineManager || 
           this.graph?.previewLineManager || 
           null;
  }

  /**
   * 通知预览线管理器布局引擎已就绪
   * 在nodeToLayer映射建立完成后调用
   */
  notifyPreviewManagerReady() {
    console.log('🔔 [布局引擎] nodeToLayer映射已建立，通知预览线管理器可以安全调用');
    
    // 🎯 使用getter安全获取预览线管理器
    const previewLineManager = this.previewLineManager;
    
    if (previewLineManager) {
      // 设置布局引擎就绪状态
      previewLineManager.layoutEngineReady = true;
      
      // 如果有待处理的计算队列，现在可以处理了
      if (previewLineManager.processPendingCalculations && 
          previewLineManager.pendingCalculations && 
          previewLineManager.pendingCalculations.size > 0) {
        console.log('📋 [布局引擎] 触发预览线管理器处理待处理队列');
        previewLineManager.processPendingCalculations();
      }
      
      console.log('✅ [布局引擎] 预览线管理器已收到就绪通知');
    } else {
      console.warn('⚠️ [布局引擎] 未找到预览线管理器，无法发送就绪通知');
    }
  }

  /**
   * 数据预处理：提取节点、边和预览线endpoint
   * @returns {Object} 预处理结果
   */
  async preprocessLayoutData() {
    console.log("📊 [数据预处理] 开始提取布局数据");

    const nodes = this.graph.getNodes();
    const edges = this.graph.getEdges();

    // 过滤有效节点（排除拖拽点）
    const validNodes = nodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const nodeData = node.getData() || {};
      return (
        !nodeId.includes("hint") &&
        !nodeData.isEndpoint &&
        !nodeData.isPreview &&
        !nodeId.startsWith("hint_")
      );
    });

    // 过滤有效边（排除预览线）
    const validEdges = edges.filter((edge) => {
      const edgeId = edge.id || edge.getId();
      const edgeData = edge.getData() || {};
      return (
        !edgeId.includes("preview") &&
        !edgeId.includes("unified_preview") &&
        !edgeData.isPreview
      );
    });

    // 🎯 关键：提取预览线endpoint作为虚拟节点
    const endpointNodes = await this.extractPreviewEndpoints();

    console.log('📊 [数据预处理] 数据统计:', {
      普通节点: validNodes.length,
      有效连线: validEdges.length,
      预览线endpoint: endpointNodes.length,
      总处理节点: validNodes.length + endpointNodes.length,
    });

    return {
      validNodes,
      validEdges,
      endpointNodes,
      totalNodes: validNodes.length + endpointNodes.length,
    };
  }

  /**
   * 提取预览线endpoint作为虚拟节点
   * @returns {Array} endpoint虚拟节点数组
   */
  async extractPreviewEndpoints() {
    const endpointNodes = [];

    console.log("🔍 [预览线提取] 开始提取预览线endpoint并校验连接状态");

    // 获取预览线管理器（用于获取预览线位置信息）
    const previewLineManager =
      this.previewLineManager ||
      window.unifiedPreviewLineManager ||
      this.graph.previewLineManager ||
      null;

    if (
      !previewLineManager ||
      !previewLineManager.previewLines ||
      previewLineManager.previewLines.size === 0
    ) {
      console.log(
        "⚠️ [预览线提取] 预览线管理器不可用，将为所有叶子节点创建默认虚拟endpoint",
      );
      return this.createVirtualEndpointsForLeafNodes();
    }

    const previewLines = previewLineManager.previewLines;
    console.log(`🔍 [预览线提取] 发现 ${previewLines.size} 个源节点的预览线`);

    // 🎯 关键修复：在创建endpoint前校验分支连接状态
    previewLines.forEach((previewInstance, sourceNodeId) => {
      console.log(
        `🔍 [预览线提取] 处理源节点 ${sourceNodeId} 的预览线:`,
        previewInstance,
      );

      // 检查源节点是否存在
      const sourceNode = this.graph.getCellById(sourceNodeId);
      if (!sourceNode) {
        console.warn(`⚠️ [预览线提取] 源节点 ${sourceNodeId} 不存在，跳过`);
        return;
      }

      if (Array.isArray(previewInstance)) {
        // 分支预览线 - 只为未连接的分支创建虚拟endpoint
        console.log(
          `📋 [预览线提取] 源节点 ${sourceNodeId} 有 ${previewInstance.length} 个分支预览线`,
        );
        previewInstance.forEach((instance, index) => {
          if (instance.endPosition && !instance.isAttached) {
            const branchId = instance.branchId || `branch_${index}`;

            // 🎯 关键校验：检查该分支是否已有实际连接
            const hasConnection = this.hasBranchConnection(
              sourceNode,
              branchId,
              instance,
            );

            if (!hasConnection) {
              const endpointNode = this.createEndpointVirtualNode(
                sourceNodeId,
                branchId,
                instance.endPosition,
                instance.branchLabel,
              );
              endpointNodes.push(endpointNode);
              this.layoutModel.endpointNodes.set(endpointNode.id, endpointNode);
              console.log(
                `✅ [预览线提取] 成功创建分支endpoint虚拟节点: ${endpointNode.id}`,
              );
            } else {
              console.log(`⏭️ [预览线提取] 跳过已连接的分支 ${branchId}:`, {
                sourceNodeId,
                branchId,
                branchLabel: instance.branchLabel,
              });
            }
          } else {
            console.log('⚠️ [预览线提取] 跳过已附着或无端点的分支预览线:', instance)
          }
        });
      } else if (
        previewInstance &&
        previewInstance.endPosition &&
        !previewInstance.isAttached
      ) {
        // 单一预览线 - 检查节点是否已有连接
        console.log(`📋 [预览线提取] 源节点 ${sourceNodeId} 有单一预览线`);

        // 🎯 关键校验：检查节点是否已有实际连接
        const hasConnection = this.hasExistingRealConnections(sourceNode);

        if (!hasConnection) {
          const endpointNode = this.createEndpointVirtualNode(
            sourceNodeId,
            "single",
            previewInstance.endPosition,
            null,
          );
          endpointNodes.push(endpointNode);
          this.layoutModel.endpointNodes.set(endpointNode.id, endpointNode);
          console.log(
            `✅ [预览线提取] 成功创建单一endpoint虚拟节点: ${endpointNode.id}`,
          );
        } else {
          console.log(`⏭️ [预览线提取] 跳过已连接的节点 ${sourceNodeId}`);
        }
      } else {
        console.log('⚠️ [预览线提取] 跳过已附着或无端点的预览线:', previewInstance);
      }
    });

    console.log(
      `🎯 [预览线提取] 提取完成，共创建 ${endpointNodes.length} 个endpoint虚拟节点:`,
      endpointNodes.map((node) => node.id),
    );

    return endpointNodes;
  }

  /**
   * 检查特定分支是否已有实际连接
   * @param {Object} sourceNode - 源节点对象
   * @param {string} branchId - 分支ID
   * @param {Object} previewInstance - 预览线实例
   * @returns {boolean} 该分支是否已有实际连接
   */
  hasBranchConnection(sourceNode, branchId, previewInstance) {
    if (!sourceNode || !this.graph) return false;

    const outgoingEdges = this.graph.getOutgoingEdges(sourceNode) || [];

    // 过滤掉预览线，只检查实际连接
    const realConnections = outgoingEdges.filter((edge) => {
      const edgeData = edge.getData() || {};
      return (
        !edgeData.isPreview &&
        edgeData.type !== "preview-line" &&
        edgeData.type !== "unified-preview-line" &&
        edgeData.type !== "draggable-preview"
      );
    });

    // 🎯 关键：检查是否有连接与当前分支相关
    const branchLabel = previewInstance?.branchLabel;
    const branchConnections = realConnections.filter((edge) => {
      const edgeData = edge.getData() || {};

      // 方法1：检查边的数据中是否包含分支信息
      if (
        edgeData.branchId === branchId ||
        edgeData.branchLabel === branchLabel
      ) {
        return true;
      }

      // 方法2：检查边的标签是否匹配分支标签
      const edgeLabels = edge.getLabels() || [];
      if (
        branchLabel &&
        edgeLabels.some(
          (label) =>
            label.attrs?.text?.text === branchLabel ||
            label.attrs?.label?.text === branchLabel,
        )
      ) {
        return true;
      }

      // 方法3：对于分流节点，检查连接的目标位置是否与分支预览线位置匹配
      if (previewInstance?.endPosition) {
        const targetPoint = edge.getTargetPoint();
        if (targetPoint) {
          const distance = Math.sqrt(
            Math.pow(targetPoint.x - previewInstance.endPosition.x, 2) +
              Math.pow(targetPoint.y - previewInstance.endPosition.y, 2),
          );
          // 如果连接的目标位置与预览线端点位置很接近（50像素内），认为是同一分支
          if (distance < 50) {
            return true;
          }
        }
      }

      return false;
    });

    // 方法4：对于分流节点的特殊处理 - 检查连接数量与分支数量的关系
    if (branchConnections.length === 0 && realConnections.length > 0) {
      const sourceNodeData = sourceNode.getData() || {};
      const nodeType = sourceNodeData.type || sourceNodeData.nodeType;

      if (nodeType === "crowd-split" || nodeType === "condition") {
        // 获取预览线管理器中该节点的所有分支
        const previewLineManager =
          this.previewLineManager ||
          window.unifiedPreviewLineManager ||
          this.graph.previewLineManager;

        if (previewLineManager && previewLineManager.previewLines) {
          const nodePreviewLines = previewLineManager.previewLines.get(
            sourceNode.id,
          );
          if (Array.isArray(nodePreviewLines)) {
            const totalBranches = nodePreviewLines.length;
            // 如果实际连接数等于或超过总分支数，说明所有分支都已连接
            if (realConnections.length >= totalBranches) {
              console.log(
                `🔍 [分支连接检查] 节点 ${sourceNode.id} 所有分支都已连接 (${realConnections.length}/${totalBranches})`,
              );
              return true;
            }

            // 如果当前分支索引小于已连接数量，认为该分支已连接
            const currentBranchIndex = nodePreviewLines.findIndex(
              (instance) =>
                instance.branchId === branchId || instance === previewInstance,
            );
            if (
              currentBranchIndex >= 0 &&
              currentBranchIndex < realConnections.length
            ) {
              console.log(
                `🔍 [分支连接检查] 分支 ${branchId} 按索引判断已连接 (索引${currentBranchIndex} < 连接数${realConnections.length})`,
              );
              return true;
            }
          }
        }
      }
    }

    const hasConnection = branchConnections.length > 0;

    console.log(`🔍 [分支连接检查] 节点 ${sourceNode.id} 分支 ${branchId}:`, {
      branchLabel,
      hasConnection,
      branchConnections: branchConnections.length,
      totalRealConnections: realConnections.length,
      branchConnectionIds: branchConnections.map((edge) => edge.id),
      previewEndPosition: previewInstance?.endPosition,
    });

    return hasConnection;
  }

  /**
   * 检查节点是否已有实际连接（非预览线）
   * @param {Object} node - 节点对象
   * @returns {boolean} 是否有实际连接
   */
  hasExistingRealConnections(node) {
    if (!node || !this.graph) return false;

    const outgoingEdges = this.graph.getOutgoingEdges(node) || [];

    // 过滤掉预览线，只检查实际连接
    const realConnections = outgoingEdges.filter((edge) => {
      const edgeData = edge.getData() || {};
      return (
        !edgeData.isPreview &&
        edgeData.type !== "preview-line" &&
        edgeData.type !== "unified-preview-line"
      );
    });

    console.log(
      `🔍 [连接检查] 节点 ${node.id} 实际连接数: ${realConnections.length}`,
      {
        totalEdges: outgoingEdges.length,
        realConnections: realConnections.length,
        realConnectionIds: realConnections.map((edge) => edge.id),
      },
    );

    return realConnections.length > 0;
  }

  /**
   * 为所有叶子节点创建虚拟endpoint节点
   * @returns {Array} 虚拟endpoint节点数组
   */
  createVirtualEndpointsForLeafNodes() {
    const endpointNodes = [];
    const nodes = this.graph.getNodes();

    console.log(
      "🔍 [虚拟endpoint] 开始为叶子节点创建虚拟endpoint（带连接校验）",
    );

    nodes.forEach((node) => {
      const nodeData = node.getData() || {};
      const nodeType = nodeData.type || nodeData.nodeType;

      // 跳过特殊节点
      if (
        nodeData.isEndpoint ||
        nodeType === "endpoint" ||
        nodeType === "end" ||
        nodeType === "finish" ||
        nodeData.isPreview
      ) {
        return;
      }

      // 🎯 关键校验：检查节点是否已有实际连接
      const hasRealConnections = this.hasExistingRealConnections(node);

      if (!hasRealConnections) {
        // 这是一个没有实际连接的叶子节点，为它创建虚拟endpoint
        const nodePosition = node.getPosition();
        const nodeSize = (node && typeof node.getSize === 'function') ? node.getSize() : { width: 120, height: 40 };

        // 计算虚拟endpoint位置 - 智能分布算法
        const endPosition = this.calculateIntelligentEndpointPosition(
          node,
          nodePosition,
          nodeSize,
          endpointNodes.length
        );

        const virtualNode = this.createEndpointVirtualNode(
          node.id,
          'virtual',
          endPosition,
          `${node.id}_virtual_endpoint`
        )

        // 🎯 新增：立即建立位置映射
        if (this.layoutModel && this.layoutModel.nodePositions) {
          this.layoutModel.nodePositions.set(virtualNode.id, {
            x: endPosition.x,
            y: endPosition.y,
            nodeType: "endpoint",
            sourceNodeId: node.id,
            branchId: "virtual",
            isVirtual: true,
          });
          console.log(
            `🎯 [位置映射] 虚拟endpoint位置已建立: ${virtualNode.id} -> (${endPosition.x}, ${endPosition.y})`,
          );
        }

        endpointNodes.push(virtualNode);
        console.log(
          `✅ [虚拟endpoint] 为叶子节点 ${node.id} 创建虚拟endpoint: ${virtualNode.id}`,
        );
      } else {
        console.log(`⏭️ [虚拟endpoint] 跳过已有连接的节点 ${node.id}`);
      }
    });

    console.log(
      `🎯 [虚拟endpoint] 虚拟endpoint创建完成，共创建 ${endpointNodes.length} 个虚拟节点`,
    );
    return endpointNodes;
  }

  /**
   * 创建endpoint虚拟节点
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID
   * @param {Object} endPosition - 端点位置
   * @param {string} branchLabel - 分支标签
   * @returns {Object} 虚拟节点对象
   */
  createEndpointVirtualNode(sourceNodeId, branchId, endPosition, branchLabel) {
    // 🎯 关键：使用与 useStructuredLayout.js 一致的ID格式
    const originalEndpointId = `endpoint_${sourceNodeId}_${branchId}`;
    const endpointId = `virtual_endpoint_${originalEndpointId}`;

    console.log(`🎯 [虚拟节点创建] 创建endpoint虚拟节点: ${endpointId}`, {
      sourceNodeId,
      branchId,
      endPosition: { x: endPosition.x, y: endPosition.y },
    });

    return {
      id: endpointId,
      type: "endpoint",
      sourceNodeId,
      branchId,
      branchLabel,
      isVirtual: true,
      isEndpoint: true,
      position: {
        x: endPosition.x,
        y: 0, // 🎯 关键修复：初始Y坐标设置为0，确保后续层级计算的一致性
      },
      size: this.options.node.endpointSize,

      // 模拟节点接口
      getId: () => endpointId,
      getPosition: () => ({ x: endPosition.x, y: 0 }),
      getSize: () => this.options.node.endpointSize,
      getData: () => ({
        type: "endpoint",
        isEndpoint: true,
        sourceNodeId,
        branchId,
      }),
      setPosition: (pos) => {
        endPosition.x = pos.x;
        endPosition.y = pos.y;
        // 同步更新预览线管理器中的位置
        this.updatePreviewEndpointPosition(sourceNodeId, branchId, pos);
      },
    };
  }

  /**
   * 🎯 全局简单层级计算：获取节点的层级Y坐标
   * 使用统一的简单层级方式，不再依赖复杂的自动计算
   * @param {string} nodeId - 节点ID
   * @returns {number} 层级Y坐标
   */
  getNodeLayerY(nodeId) {
    // 🔧 简化方案：直接使用预定义的层级索引
    const layerIndex = this.getSimpleLayerIndex(nodeId);
    const layerY = layerIndex * this.options.layer.baseHeight;
    
    console.log(
      `📍 [全局简单层级] 节点 ${nodeId} 层级Y坐标: 第${layerIndex}层 -> Y=${layerY}`,
    );
    return layerY;
  }

  /**
   * 🎯 基于连接关系的简化层级计算（按照技术方案文档实现）
   * 规则：
   * 1. 开始节点：固定为第1层
   * 2. 普通节点：上一层连接节点的层级 + 1  
   * 3. 预览线endpoint：源节点层级 + 1
   * @param {string} nodeId - 节点ID
   * @returns {number} 层级索引（从1开始）
   */
  getSimpleLayerIndex(nodeId) {
    // 🔧 层级缓存避免重复计算
    if (!this.layerCache) {
      this.layerCache = new Map();
    }
    
    if (this.layerCache.has(nodeId)) {
      return this.layerCache.get(nodeId);
    }

    let layerIndex = 1;

    try {
      // 🎯 规则1：开始节点固定为第1层
      if (nodeId.includes('start') || nodeId.includes('Start') || nodeId.includes('begin')) {
        layerIndex = 1;
        console.log(`🎯 [连接层级] 开始节点 ${nodeId} -> 第1层`);
      }
      // 🎯 规则2：预览线endpoint = 源节点层级 + 1
      else if (nodeId.includes('virtual_endpoint') || nodeId.includes('endpoint')) {
        const sourceNodeId = this.extractSourceNodeFromEndpoint(nodeId);
        if (sourceNodeId) {
          const sourceLayer = this.getSimpleLayerIndex(sourceNodeId);
          layerIndex = sourceLayer + 1;
          console.log(`🎯 [连接层级] endpoint ${nodeId} 源节点 ${sourceNodeId} 第${sourceLayer}层 -> 第${layerIndex}层`);
        } else {
          layerIndex = 4; // 无法确定源节点时的默认层级
          console.log(`⚠️ [连接层级] endpoint ${nodeId} 无法确定源节点，使用默认第4层`);
        }
      }
      // 🎯 规则3：普通节点 = 父节点最大层级 + 1
      else {
        const parentNodes = this.getParentNodes(nodeId);
        if (parentNodes.length > 0) {
          const parentLayers = parentNodes.map(parentId => 
            this.getSimpleLayerIndex(parentId)
          );
          layerIndex = Math.max(...parentLayers) + 1;
          console.log(`🎯 [连接层级] 普通节点 ${nodeId} 父节点层级 [${parentLayers.join(',')}] -> 第${layerIndex}层`);
        } else {
          layerIndex = 2; // 无父节点时的默认层级
          console.log(`⚠️ [连接层级] 普通节点 ${nodeId} 无父节点，使用默认第2层`);
        }
      }

    } catch (error) {
      console.warn(`⚠️ [连接层级] 节点 ${nodeId} 层级计算失败:`, error.message);
      layerIndex = 2; // 出错时默认第2层
    }

    // 缓存结果并同步到布局模型
    this.layerCache.set(nodeId, layerIndex);
    if (this.layoutModel && this.layoutModel.nodeToLayer) {
      this.layoutModel.nodeToLayer.set(nodeId, layerIndex);
    }

    return layerIndex;
  }

  /**
   * 根据节点类型获取固定层级
   * @param {string} nodeType - 节点类型
   * @param {string} nodeId - 节点ID
   * @returns {number} 层级索引
   */
  getLayerByNodeType(nodeType, nodeId) {
    // 🎯 固定层级分配表
    const layerMapping = {
      // 第1层：开始节点
      'start': 1,
      'begin': 1,
      
      // 第2层：主要处理节点（统一分配到第2层，解决对齐问题）
      'ai-call': 2,
      'manual-call': 2,
      'audience-split': 2,
      'condition': 2,
      'decision': 2,
      'process': 2,
      'action': 2,
      'task': 2,
      
      // 第3层：后续处理节点
      'operation': 3,
      'transform': 3,
      'filter': 3,
      
      // 第4层：结束节点和endpoint
      'end': 4,
      'finish': 4,
      'endpoint': 4,
      'terminal': 4
    };

    // 🔧 特殊处理：根据节点ID模式判断
    if (nodeId.includes('endpoint') || nodeId.includes('preview') || nodeId.includes('virtual')) {
      return 4;
    }
    
    if (nodeId.includes('start') || nodeId.includes('begin')) {
      return 1;
    }

    // 🔧 关键修正：ai-call, manual-call, audience-split 统一第2层
    if (nodeId.includes('ai-call') || nodeId.includes('manual-call') || nodeId.includes('audience-split')) {
      return 2;
    }

    // 使用映射表或默认第2层
    return layerMapping[nodeType] || 2;
  }

  /**
   * 获取节点类型
   * @param {string} nodeId - 节点ID
   * @returns {string} 节点类型
   */
  getNodeType(nodeId) {
    try {
      // 尝试从图中获取节点数据
      if (this.graph) {
        const node = this.graph.getCellById(nodeId);
        if (node) {
          const nodeData = node.getData() || {};
          return nodeData.type || nodeData.nodeType || 'unknown';
        }
      }
    } catch (error) {
      console.warn(`⚠️ [节点类型] 获取节点 ${nodeId} 类型失败:`, error.message);
    }
    
    // 从节点ID推断类型
    if (nodeId.includes('ai-call')) return 'ai-call';
    if (nodeId.includes('manual-call')) return 'manual-call';
    if (nodeId.includes('audience-split')) return 'audience-split';
    if (nodeId.includes('start')) return 'start';
    if (nodeId.includes('end')) return 'end';
    if (nodeId.includes('endpoint')) return 'endpoint';
    
    return 'process'; // 默认类型
  }

  /**
   * 🔧 兼容性方法：保持原有接口
   * @param {string} nodeId - 节点ID
   * @returns {number} 层级索引
   */
  calculateNodeLayerByConnection(nodeId) {
    // 直接调用简单层级计算
    return this.getSimpleLayerIndex(nodeId);
  }

  /**
   * 从endpoint节点ID中提取源节点ID
   * @param {string} endpointId - endpoint节点ID
   * @returns {string|null} 源节点ID
   */
  extractSourceNodeFromEndpoint(endpointId) {
    // 预览线endpoint的命名规则通常是: sourceNodeId_virtual_endpoint_branchId
    if (endpointId.includes('virtual_endpoint')) {
      const parts = endpointId.split('_virtual_endpoint');
      return parts[0];
    }
    
    // 其他endpoint命名规则
    if (endpointId.includes('_endpoint_')) {
      const parts = endpointId.split('_endpoint_');
      return parts[0];
    }
    
    return null;
  }

  /**
   * 获取节点的父节点列表
   * @param {string} nodeId - 节点ID
   * @returns {Array} 父节点ID列表
   */
  getParentNodes(nodeId) {
    const parentNodes = [];
    
    try {
      // 方法1：从图形结构中获取入边
      const node = this.graph.getCellById(nodeId);
      if (node) {
        const incomingEdges = this.graph.getIncomingEdges(node);
        if (incomingEdges && incomingEdges.length > 0) {
          incomingEdges.forEach(edge => {
            const sourceId = edge.getSourceCellId();
            if (sourceId && sourceId !== nodeId) {
              parentNodes.push(sourceId);
            }
          });
        }
      }
      
      // 方法2：从布局模型的父子关系映射中获取
      if (parentNodes.length === 0 && this.layoutModel && this.layoutModel.childParentMap) {
        const parents = this.layoutModel.childParentMap.get(nodeId);
        if (parents && parents.length > 0) {
          parentNodes.push(...parents);
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ [简化层级] 获取节点 ${nodeId} 父节点失败:`, error.message);
    }
    
    return parentNodes;
  }

  /**
   * 智能推断节点层级Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 推断的Y坐标
   */
  inferNodeLayerY(nodeId) {
    try {
      // 🎯 策略1：通过图形节点位置推断
      const node = this.graph.getCellById(nodeId);
      if (node) {
        const position = node.getPosition();
        const estimatedLayer = Math.floor(
          position.y / this.options.layer.baseHeight,
        );
        const estimatedY = estimatedLayer * this.options.layer.baseHeight;
        console.log(
          `🔍 [智能推断] 节点 ${nodeId} 基于位置推断层级Y坐标: ${estimatedY} (第${estimatedLayer}层)`,
        );

        // 🎯 临时添加到层级映射中，避免重复推断
        if (this.layoutModel && this.layoutModel.nodeToLayer) {
          this.layoutModel.nodeToLayer.set(nodeId, estimatedLayer);
        }

        return estimatedY;
      }

      // 🎯 策略2：通过父子关系推断
      if (this.layoutModel && this.layoutModel.childParentMap) {
        const parents = this.layoutModel.childParentMap.get(nodeId) || [];
        if (parents.length > 0) {
          const parentId = parents[0];
          const parentLayer = this.layoutModel.nodeToLayer.get(parentId);
          if (parentLayer !== undefined) {
            const childLayer = parentLayer + 1;
            const childY = childLayer * this.options.layer.baseHeight;
            console.log(
              `🔍 [智能推断] 节点 ${nodeId} 基于父节点 ${parentId} 推断层级Y坐标: ${childY} (第${childLayer}层)`,
            );

            // 临时添加到层级映射中
            this.layoutModel.nodeToLayer.set(nodeId, childLayer);
            return childY;
          }
        }
      }

      // 🎯 策略3：使用默认Y坐标
      return this.getDefaultLayerY(nodeId);
    } catch (error) {
      console.warn(`⚠️ [智能推断] 节点 ${nodeId} 推断失败:`, error.message);
      return this.getDefaultLayerY(nodeId);
    }
  }

  /**
   * 获取默认层级Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 默认Y坐标
   */
  getDefaultLayerY(nodeId) {
    // 🎯 根据节点类型返回不同的默认Y坐标
    if (nodeId.includes("start")) {
      return 0; // 起始节点在第0层
    } else if (
      nodeId.includes("virtual_endpoint") ||
      nodeId.includes("endpoint")
    ) {
      return this.options.layer.baseHeight * 3; // endpoint节点默认在第3层
    } else {
      return this.options.layer.baseHeight; // 普通节点默认在第1层
    }
  }

  /**
   * 获取下一层的Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 下一层的Y坐标
   */
  getNextLayerY(nodeId) {
    try {
      const currentLayerY = this.getNodeLayerY(nodeId);
      const nextLayerY = currentLayerY + this.options.layer.baseHeight;
      console.log(
        `📍 [布局引擎] 节点 ${nodeId} 下一层Y坐标: ${currentLayerY} + ${this.options.layer.baseHeight} = ${nextLayerY}`,
      );
      return nextLayerY;
    } catch (error) {
      console.warn(
        `⚠️ [布局引擎] 获取节点 ${nodeId} 下一层Y坐标失败:`,
        error.message,
      );
      // 使用默认的下一层Y坐标
      return this.options.layer.baseHeight * 2;
    }
  }

  /**
   * 更新预览线endpoint位置
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID
   * @param {Object} position - 新位置
   */
  updatePreviewEndpointPosition(sourceNodeId, branchId, position) {
    console.log("🔄 [位置同步] 更新endpoint位置:", {
      sourceNodeId,
      branchId,
      position,
    });

    const previewLineManager =
      this.previewLineManager ||
      window.unifiedPreviewLineManager ||
      this.graph.previewLineManager;

    if (!previewLineManager) {
      console.warn(
        `⚠️ [位置同步] 预览线管理器不可用，无法更新endpoint位置: ${sourceNodeId}_${branchId}`,
      );
      return;
    }

    // 🔧 新增：检查预览线管理器状态
    if (previewLineManager.isDestroyed || previewLineManager.disposed) {
      console.warn(`⚠️ [位置同步] 预览线管理器已销毁，跳过位置更新: ${sourceNodeId}_${branchId}`);
      return;
    }

    console.log("✅ [位置同步] 找到预览线管理器，开始更新预览线终点位置");

    // 🎯 关键修复：强制更新预览线管理器的endPosition属性
    if (previewLineManager.endPosition) {
      const oldEndPosition = { ...previewLineManager.endPosition };
      previewLineManager.endPosition.x = position.x;
      previewLineManager.endPosition.y = position.y;
      console.log(
        `🎯 [强制同步] 预览线管理器endPosition已更新: (${oldEndPosition.x}, ${oldEndPosition.y}) → (${position.x}, ${position.y})`,
      );
    }

    // 🎯 关键修复：直接查找并更新预览线的终点位置
    const previewInstances = previewLineManager.previewLines.get(sourceNodeId);
    if (!previewInstances) {
      // 🔧 修复：检查节点是否应该有预览线
      const sourceNode = this.graph.getCellById(sourceNodeId);
      if (sourceNode && previewLineManager.shouldCreatePreviewLine && previewLineManager.shouldCreatePreviewLine(sourceNode)) {
        console.log(`🔄 [位置同步] 节点应该有预览线但未找到，尝试创建: ${sourceNodeId}`);
        
        // 尝试创建预览线
        if (typeof previewLineManager.createUnifiedPreviewLine === 'function') {
          try {
            const newPreviewInstance = previewLineManager.createUnifiedPreviewLine(sourceNode);
            if (newPreviewInstance) {
              console.log(`✅ [位置同步] 成功创建预览线实例: ${sourceNodeId}`);
              // 递归调用自己来更新位置
              this.updatePreviewEndpointPosition(sourceNodeId, branchId, position);
              return;
            }
          } catch (error) {
            console.warn(`⚠️ [位置同步] 创建预览线失败: ${sourceNodeId}`, error.message);
          }
        }
      }
      
      console.debug(`🔍 [位置同步] 未找到节点 ${sourceNodeId} 的预览线实例，可能节点不需要预览线`);
      return;
    }

    // 🔧 新增：验证预览线实例的完整性
    const isValidPreviewInstance = (instance) => {
      if (!instance) return false;
      if (!instance.line) return false;
      if (instance.line.removed) return false;
      if (!this.graph.hasCell(instance.line.id)) return false;
      if (instance.isDestroyed || instance.disposed) return false;
      return true;
    };

    let updatedCount = 0;

    if (Array.isArray(previewInstances)) {
      // 分支预览线：查找匹配的分支
      previewInstances.forEach((instance) => {
        if (instance.branchId === branchId) {
          console.log(`🎯 [位置同步] 找到匹配的分支预览线: ${branchId}`);

          // 🔧 修复：使用统一的验证函数检查预览线实例
          if (!isValidPreviewInstance(instance)) {
            console.warn(`⚠️ [位置同步] 分支预览线实例无效或已被移除: ${branchId}`);
            // 🔧 新增：从预览线管理器中清理无效实例
            if (typeof previewLineManager.removeInvalidPreviewLine === 'function') {
              previewLineManager.removeInvalidPreviewLine(sourceNodeId, branchId);
            }
            return;
          }

          // 直接更新预览线的终点位置
          if (typeof instance.line.setTarget === "function") {
            instance.line.setTarget({
              x: position.x,
              y: position.y,
            });

            // 同步更新实例中的endPosition
            if (instance.endPosition) {
              instance.endPosition.x = position.x;
              instance.endPosition.y = position.y;
            }

            // 更新endpoint标记位置
            if (typeof previewLineManager.updateEndpointMarker === "function") {
              previewLineManager.updateEndpointMarker(instance.line, position);
            }

            updatedCount++;
            console.log(
              `✅ [位置同步] 分支预览线终点位置已更新: ${branchId} -> (${position.x}, ${position.y})`,
            );
          } else {
            console.warn(`⚠️ [位置同步] 分支预览线缺少setTarget方法: ${branchId}`);
          }
        }
      });
    } else {
      // 单一预览线
      const instance = previewInstances;
      console.log('🎯 [位置同步] 更新单一预览线终点位置');

      // 🔧 修复：使用统一的验证函数检查单一预览线实例
      if (!isValidPreviewInstance(instance)) {
        console.warn(`⚠️ [位置同步] 单一预览线实例无效或已被移除`);
        // 🔧 新增：从预览线管理器中清理无效实例
        if (typeof previewLineManager.removeInvalidPreviewLine === 'function') {
          previewLineManager.removeInvalidPreviewLine(sourceNodeId);
        }
        return;
      }

      if (typeof instance.line.setTarget === "function") {
        instance.line.setTarget({
          x: position.x,
          y: position.y,
        });

        // 同步更新实例中的endPosition
        if (instance.endPosition) {
          instance.endPosition.x = position.x;
          instance.endPosition.y = position.y;
        }

        // 更新endpoint标记位置
        if (typeof previewLineManager.updateEndpointMarker === "function") {
          previewLineManager.updateEndpointMarker(instance.line, position);
        }

        updatedCount++;
        console.log(
          `✅ [位置同步] 单一预览线终点位置已更新: -> (${position.x}, ${position.y})`,
        );
      } else {
        console.warn(`⚠️ [位置同步] 单一预览线缺少setTarget方法`);
      }
    }

    if (updatedCount === 0) {
      console.warn(
        `⚠️ [位置同步] 未找到可更新的预览线: ${sourceNodeId}_${branchId}`,
      );

      // 尝试强制刷新预览线位置
      const sourceNode = this.graph.getCellById(sourceNodeId);
      if (
        sourceNode &&
        typeof previewLineManager.updatePreviewLinePosition === "function"
      ) {
        console.log("🔄 [位置同步] 尝试强制刷新预览线位置");
        previewLineManager.updatePreviewLinePosition(sourceNode);
      }
    } else {
      console.log(`✅ [位置同步] 成功更新 ${updatedCount} 条预览线的终点位置`);
    }
  }

  /**
   * 构建分层结构（包含endpoint集成）
   * @param {Object} preprocessResult - 预处理结果
   * @returns {Object} 层级结构
   */
  async buildHierarchicalLayers(preprocessResult) {
    console.log("🔍 [分层构建] 开始构建包含endpoint的分层结构");

    const { validNodes, validEdges, endpointNodes } = preprocessResult;

    // 🎯 关键：将普通节点和endpoint节点合并处理
    const allNodes = [...validNodes, ...endpointNodes];

    // 构建父子关系图
    this.buildParentChildRelationships(allNodes, validEdges, endpointNodes);

    // 识别叶子节点（最底层）
    const leafNodes = this.identifyLeafNodes(allNodes);

    // 自底向上分层
    const layers = this.calculateLayersBottomUp(leafNodes, allNodes);

    // 🎯 关键：为每层创建混合节点列表（普通节点+endpoint）
    this.createMixedLayerNodes(layers);

    console.log('🔍 [分层构建] 分层完成:', {
      总层数: layers.length,
      各层节点分布: layers
        .map((layer, index) => {
          const normalCount = layer.filter((n) => !n.isEndpoint).length;
          const endpointCount = layer.filter((n) => n.isEndpoint).length;
          return `第${index + 1}层: ${normalCount}普通+${endpointCount}endpoint`;
        })
        .join(", "),
    });

    return {
      layers,
      nodeToLayer: this.layoutModel.nodeToLayer,
      parentChildMap: this.layoutModel.parentChildMap,
      childParentMap: this.layoutModel.childParentMap,
      mixedLayerNodes: this.layoutModel.mixedLayerNodes,
      totalLayers: layers.length,
    };
  }

  /**
   * 构建父子关系（包含endpoint的虚拟关系）
   * @param {Array} allNodes - 所有节点（普通+endpoint）
   * @param {Array} validEdges - 有效边
   * @param {Array} endpointNodes - endpoint节点
   */
  buildParentChildRelationships(allNodes, validEdges, endpointNodes) {
    // 初始化关系映射
    allNodes.forEach((node) => {
      const nodeId = node.id || node.getId();
      this.layoutModel.parentChildMap.set(nodeId, []);
      this.layoutModel.childParentMap.set(nodeId, []);
    });

    // 处理普通节点间的连接关系
    validEdges.forEach((edge) => {
      const sourceId = edge.getSourceCellId();
      const targetId = edge.getTargetCellId();

      if (sourceId && targetId) {
        // 建立父子关系
        if (this.layoutModel.parentChildMap.has(sourceId)) {
          this.layoutModel.parentChildMap.get(sourceId).push(targetId);
        }
        if (this.layoutModel.childParentMap.has(targetId)) {
          this.layoutModel.childParentMap.get(targetId).push(sourceId);
        }
      }
    });

    // 🎯 关键：建立endpoint与源节点的虚拟父子关系
    endpointNodes.forEach((endpointNode) => {
      const sourceNodeId = endpointNode.sourceNodeId;
      const endpointId = endpointNode.id;

      // endpoint作为源节点的子节点
      if (this.layoutModel.parentChildMap.has(sourceNodeId)) {
        this.layoutModel.parentChildMap.get(sourceNodeId).push(endpointId);
      }
      if (this.layoutModel.childParentMap.has(endpointId)) {
        this.layoutModel.childParentMap.get(endpointId).push(sourceNodeId);
      }
    });

    console.log('🔗 [关系构建] 父子关系构建完成', {
      节点数: allNodes.length,
      连接数: validEdges.length,
      endpoint虚拟关系: endpointNodes.length,
    });
  }

  /**
   * 识别叶子节点（出度为0的节点，但排除endpoint节点）
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 叶子节点数组
   */
  identifyLeafNodes(allNodes) {
    // 首先过滤出普通节点（非endpoint节点）
    const normalNodes = allNodes.filter(
      (node) => !(node.isEndpoint || node.isVirtual),
    );

    const leafNodes = normalNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const children = this.layoutModel.parentChildMap.get(nodeId) || [];

      // 过滤出真正的子节点（排除endpoint虚拟节点）
      const realChildren = children.filter((childId) => {
        const childNode = allNodes.find((n) => (n.id || n.getId()) === childId);
        return childNode && !(childNode.isEndpoint || childNode.isVirtual);
      });

      return realChildren.length === 0;
    });

    console.log(
      `🌿 [叶子识别] 识别到 ${leafNodes.length} 个叶子节点（排除endpoint）`,
    );
    console.log('🌿 [叶子识别] 叶子节点列表:', leafNodes.map(n => n.id || n.getId()));

    // 🎯 关键修复：如果没有边连接，根据节点类型进行分层
    if (leafNodes.length === 0 || leafNodes.length === normalNodes.length) {
      console.warn('⚠️ [叶子识别] 无边连接或所有节点都是叶子节点，启用节点类型分层模式');
      
      // 按节点类型分层：end节点作为叶子节点（最底层）
      const endNodes = normalNodes.filter((node) => {
        const nodeType = node.type || node.getType?.() || '';
        return nodeType === 'end';
      });
      
      if (endNodes.length > 0) {
        console.log(`🌿 [类型分层] 使用 ${endNodes.length} 个end节点作为叶子节点`);
        return endNodes;
      }
      
      // 如果没有end节点，使用非start节点作为叶子节点
      const nonStartNodes = normalNodes.filter((node) => {
        const nodeType = node.type || node.getType?.() || '';
        return nodeType !== 'start';
      });
      
      if (nonStartNodes.length > 0) {
        console.log(`🌿 [类型分层] 使用 ${nonStartNodes.length} 个非start节点作为叶子节点`);
        return nonStartNodes;
      }
    }

    // 如果没有找到叶子节点，可能是因为图中有循环或者所有节点都有连接
    // 在这种情况下，选择入度为0的节点作为起始点
    if (leafNodes.length === 0) {
      console.warn('⚠️ [叶子识别] 未找到叶子节点，尝试寻找根节点（入度为0）');

      const rootNodes = normalNodes.filter((node) => {
        const nodeId = node.id || node.getId();
        const parents = this.layoutModel.childParentMap.get(nodeId) || [];

        // 过滤出真正的父节点（排除endpoint虚拟节点）
        const realParents = parents.filter((parentId) => {
          const parentNode = allNodes.find(
            (n) => (n.id || n.getId()) === parentId,
          );
          return parentNode && !(parentNode.isEndpoint || parentNode.isVirtual);
        });

        return realParents.length === 0;
      });

      console.log(
        `🌿 [根节点识别] 识别到 ${rootNodes.length} 个根节点:`,
        rootNodes.map((n) => n.id || n.getId()),
      );

      if (rootNodes.length > 0) {
        return rootNodes;
      }

      // 如果连根节点都没有，选择第一个普通节点作为起始点
      if (normalNodes.length > 0) {
        console.warn('⚠️ [叶子识别] 未找到根节点，使用第一个普通节点作为起始点')
        return [normalNodes[0]];
      }
    }

    return leafNodes;
  }

  /**
   * 自底向上计算层级（方案D：增强版本）
   * @param {Array} leafNodes - 叶子节点
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 分层结果
   */
  calculateLayersBottomUp(leafNodes, allNodes) {
    const layers = [];
    const processedNodes = new Set();
    const nodeToLayer = new Map();
    let currentLayer = [...leafNodes]; // 复制数组避免修改原数组
    let layerIndex = 0;

    console.log(
      `🔍 [层级构建] 开始自底向上构建，叶子节点: ${leafNodes.length}个`,
    );
    console.log('🔍 [层级构建] 叶子节点列表:', leafNodes.map(n => n.id || n.getId()))
    console.log(`🔍 [层级构建] 总节点数: ${allNodes.length}个`);

    // 🎯 关键修复：检查是否为无边连接的节点类型分层模式
    const normalNodes = allNodes.filter(node => !(node.isEndpoint || node.isVirtual));
    
    // 检查图中是否有真实的边连接（从graph.getEdges()获取）
    const edges = this.graph ? this.graph.getEdges() : [];
    const hasRealConnections = edges && edges.length > 0;
    
    console.log('🔍 [连接检测] 详细信息:', {
      图实例存在: !!this.graph,
      边数组: edges,
      边数量: edges.length,
      有真实连接: hasRealConnections,
      普通节点数: normalNodes.length,
      节点类型: normalNodes.map(n => ({ id: n.id || n.getId(), type: n.type || n.getType?.() || 'unknown' }))
    });
    
    if (!hasRealConnections && normalNodes.length > 1) {
      console.log('🎯 [类型分层] 检测到无边连接模式，启用节点类型垂直分层');
      return this.buildTypeBasedLayers(normalNodes);
    }

    // 从叶子节点开始，逐层向上构建
    while (currentLayer.length > 0) {
      // 当前层级
      const layerNodes = [...currentLayer];
      layers.push(layerNodes);

      console.log(
        `📊 [层级构建] 第${layerIndex}层: ${layerNodes.length}个节点`,
        layerNodes.map((n) => n.id || n.getId()),
      );

      // 记录节点层级
      layerNodes.forEach((node) => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
        nodeToLayer.set(nodeId, layerIndex);
      });

      // 查找下一层（父节点层）
      const nextLayer = [];
      const candidateParents = new Set();

      layerNodes.forEach((node) => {
        const nodeId = node.id || node.getId();
        const parents = this.layoutModel.childParentMap.get(nodeId) || [];

        console.log(`🔗 [层级构建] 节点 ${nodeId} 的父节点:`, parents);

        parents.forEach((parentId) => {
          if (!processedNodes.has(parentId)) {
            candidateParents.add(parentId);
          }
        });
      });

      console.log('🎯 [层级构建] 候选父节点:', Array.from(candidateParents));

      // 验证候选父节点的所有子节点是否都已处理
      candidateParents.forEach((parentId) => {
        const children = this.layoutModel.parentChildMap.get(parentId) || [];

        // 只考虑非endpoint子节点
        const realChildren = children.filter((childId) => {
          const childNode = allNodes.find(
            (n) => (n.id || n.getId()) === childId,
          );
          return childNode && !(childNode.isEndpoint || childNode.isVirtual);
        });

        const allChildrenProcessed = realChildren.every((childId) =>
          processedNodes.has(childId),
        );

        console.log(
          `🔍 [层级构建] 父节点 ${parentId} 的实际子节点:`,
          realChildren,
          `全部处理完成: ${allChildrenProcessed}`,
        );

        if (allChildrenProcessed) {
          const parentNode = allNodes.find(
            (n) => (n.id || n.getId()) === parentId,
          );
          if (parentNode && !(parentNode.isEndpoint || parentNode.isVirtual)) {
            nextLayer.push(parentNode);
            console.log(`✅ [层级构建] 添加父节点 ${parentId} 到下一层`);
          }
        }
      });

      currentLayer = nextLayer;
      layerIndex++;

      // 防止无限循环
      if (layerIndex > 20) {
        console.warn('⚠️ [层级构建] 层级构建超过20层，强制停止');
        break;
      }
    }

    console.log(
      `📊 [层级构建] 初步构建完成，共 ${layers.length} 层，已处理 ${processedNodes.size} 个节点`,
    );

    // 🔍 检查未处理的节点
    const allNodeIds = allNodes
      .filter((node) => !(node.isEndpoint || node.isVirtual))
      .map((node) => node.id || node.getId());
    const unprocessedNodeIds = allNodeIds.filter(
      (nodeId) => !processedNodes.has(nodeId),
    );

    if (unprocessedNodeIds.length > 0) {
      console.warn(
        `⚠️ [层级构建] 发现 ${unprocessedNodeIds.length} 个未处理的节点:`,
        unprocessedNodeIds,
      );

      // 将未处理的节点添加到最后一层
      const unprocessedNodes = allNodes.filter((node) =>
        unprocessedNodeIds.includes(node.id || node.getId()),
      );

      if (layers.length === 0) {
        layers.push([]);
      }
      layers[layers.length - 1].push(...unprocessedNodes);

      unprocessedNodes.forEach((node) => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
        nodeToLayer.set(nodeId, layers.length - 1);
      });

      console.log(`🔧 [层级构建] 已将未处理节点添加到第${layers.length - 1}层`);
    }

    // 反转层级顺序（使第0层为顶层）
    layers.reverse();

    console.log('🔄 [层级构建] 层级反转完成，最终层级结构:');
    layers.forEach((layer, index) => {
      console.log(
        `  第${index}层: ${layer.length}个节点`,
        layer.map((n) => n.id || n.getId()),
      );
    });

    // 重新计算层级索引（确保nodeToLayer映射正确）
    this.layoutModel.nodeToLayer = new Map();
    layers.forEach((layer, index) => {
      layer.forEach((node) => {
        const nodeId = node.id || node.getId();
        this.layoutModel.nodeToLayer.set(nodeId, index);
      });
    });

    console.log(
      `📋 [层级构建] nodeToLayer映射重建完成，共 ${this.layoutModel.nodeToLayer.size} 个节点`,
    );

    // 🎯 关键修复：重新调整endpoint节点的层级
    this.adjustEndpointLayers(layers, allNodes);

    return layers;
  }

  /**
   * 基于节点类型的垂直分层（无边连接模式）
   * @param {Array} normalNodes - 普通节点列表
   * @returns {Array} 分层结果
   */
  buildTypeBasedLayers(normalNodes) {
    const layers = [];
    const startNodes = [];
    const endNodes = [];
    const otherNodes = [];

    // 按节点类型分类
    normalNodes.forEach(node => {
      const nodeType = node.type || node.getType?.() || '';
      if (nodeType === 'start') {
        startNodes.push(node);
      } else if (nodeType === 'end') {
        endNodes.push(node);
      } else {
        otherNodes.push(node);
      }
    });

    console.log('🎯 [类型分层] 节点分类:', {
      start: startNodes.length,
      end: endNodes.length,
      other: otherNodes.length
    });

    // 构建垂直分层：start在顶层，end在底层，其他节点在中间
    if (startNodes.length > 0) {
      layers.push(startNodes);
      console.log('📊 [类型分层] 第0层(顶层): start节点', startNodes.map(n => n.id || n.getId()));
    }

    if (otherNodes.length > 0) {
      layers.push(otherNodes);
      console.log(`📊 [类型分层] 第${layers.length - 1}层(中间层): 其他节点`, otherNodes.map(n => n.id || n.getId()));
    }

    if (endNodes.length > 0) {
      layers.push(endNodes);
      console.log(`📊 [类型分层] 第${layers.length - 1}层(底层): end节点`, endNodes.map(n => n.id || n.getId()));
    }

    // 如果只有一种类型的节点，确保至少有一层
    if (layers.length === 0 && normalNodes.length > 0) {
      layers.push(normalNodes);
      console.log('📊 [类型分层] 单一类型层级:', normalNodes.map(n => n.id || n.getId()));
    }

    // 更新nodeToLayer映射
    this.layoutModel.nodeToLayer = new Map();
    layers.forEach((layer, index) => {
      layer.forEach((node) => {
        const nodeId = node.id || node.getId();
        this.layoutModel.nodeToLayer.set(nodeId, index);
      });
    });

    console.log(`📋 [类型分层] nodeToLayer映射完成，共 ${this.layoutModel.nodeToLayer.size} 个节点`);

    return layers;
  }

  /**
   * 调整endpoint节点的层级（方案E：增强版本）
   * @param {Array} layers - 分层结果
   * @param {Array} allNodes - 所有节点
   */
  adjustEndpointLayers(layers, allNodes) {
    console.log("🔧 [层级调整] 开始调整endpoint节点层级（增强版本）");

    // 收集所有endpoint节点
    const endpointNodes = allNodes.filter(
      (node) => node.isEndpoint || node.isVirtual,
    );
    console.log(`🔍 [层级调整] 发现 ${endpointNodes.length} 个endpoint节点`);

    // 从layers中移除所有endpoint节点
    layers.forEach((layer, layerIndex) => {
      for (let i = layer.length - 1; i >= 0; i--) {
        const node = layer[i];
        if (node.isEndpoint || node.isVirtual) {
          console.log(
            `🗑️ [层级调整] 从第${layerIndex}层移除endpoint ${node.id || node.getId()}`,
          );
          layer.splice(i, 1);
        }
      }
    });

    let successCount = 0;
    let failureCount = 0;

    // 重新分配endpoint节点到正确的层级
    endpointNodes.forEach((endpointNode) => {
      const endpointId = endpointNode.id || endpointNode.getId();
      console.log(`🔍 [层级调整] 处理endpoint: ${endpointId}`);

      // 🎯 增强：多种方式获取源节点ID
      let sourceNodeId = null;

      // 方式1：直接属性
      if (endpointNode.sourceNodeId) {
        sourceNodeId = endpointNode.sourceNodeId;
        console.log(
          `✅ [层级调整] 通过sourceNodeId找到源节点: ${sourceNodeId}`,
        );
      }
      // 方式2：sourceId属性
      else if (endpointNode.sourceId) {
        sourceNodeId = endpointNode.sourceId;
        console.log(`✅ [层级调整] 通过sourceId找到源节点: ${sourceNodeId}`);
      }
      // 方式3：从ID中解析（针对virtual_endpoint_xxx格式）
      else if (endpointId.includes("virtual_endpoint_")) {
        // 🎯 修复：正确解析virtual_endpoint_endpoint_node_xxx_xxx格式的ID
        if (endpointId.includes("virtual_endpoint_endpoint_")) {
          // 格式：virtual_endpoint_endpoint_node_1754380100151_unmatch_default
          const match = endpointId.match(
            /virtual_endpoint_endpoint_(node_\d+)_/,
          );
          if (match) {
            sourceNodeId = match[1]; // 提取 node_1754380100151
            console.log(`✅ [层级调整] 从ID解析出源节点: ${sourceNodeId}`);
          }
        } else {
          // 其他格式：virtual_endpoint_xxx
          const parts = endpointId.split("_");
          if (parts.length >= 3) {
            sourceNodeId = parts[2]; // virtual_endpoint_[sourceId]_xxx
            console.log(`✅ [层级调整] 从ID解析出源节点: ${sourceNodeId}`);
          }
        }
      }
      // 方式4：从连接关系中查找
      else {
        // 查找指向此endpoint的连接
        const incomingConnections =
          this.layoutModel.childParentMap.get(endpointId) || [];
        if (incomingConnections.length > 0) {
          sourceNodeId = incomingConnections[0]; // 取第一个父节点作为源节点
          console.log(`✅ [层级调整] 从连接关系找到源节点: ${sourceNodeId}`);
        }
      }

      if (sourceNodeId) {
        // 找到源节点的层级
        const sourceNodeLayer = this.layoutModel.nodeToLayer.get(sourceNodeId);
        console.log(
          `🔍 [层级调整] 源节点 ${sourceNodeId} 的层级: ${sourceNodeLayer}`,
        );

        if (sourceNodeLayer !== undefined) {
          const targetLayer = sourceNodeLayer + 1;

          // 确保目标层级存在
          while (layers.length <= targetLayer) {
            layers.push([]);
            console.log(`➕ [层级调整] 创建新层级: 第${layers.length - 1}层`);
          }

          // 将endpoint节点添加到正确的层级
          layers[targetLayer].push(endpointNode);
          this.layoutModel.nodeToLayer.set(endpointId, targetLayer);

          console.log(
            `🎯 [层级调整] endpoint ${endpointId} 从源节点 ${sourceNodeId}(第${sourceNodeLayer}层) 调整到第${targetLayer}层`,
          );
          successCount++;
        } else {
          console.warn(
            `⚠️ [层级调整] endpoint ${endpointId} 的源节点 ${sourceNodeId} 未找到层级信息`,
          );

          // 🔧 紧急回退：将endpoint放到最后一层
          const lastLayerIndex = layers.length - 1;
          if (lastLayerIndex >= 0) {
            layers[lastLayerIndex].push(endpointNode);
            this.layoutModel.nodeToLayer.set(endpointId, lastLayerIndex);
            console.log(
              `🚨 [层级调整] 紧急回退：将endpoint ${endpointId} 放到最后一层(第${lastLayerIndex}层)`,
            );
            successCount++;
          } else {
            // 创建新层级
            layers.push([endpointNode]);
            this.layoutModel.nodeToLayer.set(endpointId, 0);
            console.log(
              `🚨 [层级调整] 紧急回退：为endpoint ${endpointId} 创建新层级(第0层)`,
            );
            successCount++;
          }
        }
      } else {
        console.warn(`⚠️ [层级调整] endpoint ${endpointId} 未找到源节点信息`);

        // 🔧 最终回退：将endpoint放到最后一层
        const lastLayerIndex = Math.max(0, layers.length - 1);
        if (layers.length === 0) {
          layers.push([]);
        }
        layers[lastLayerIndex].push(endpointNode);
        this.layoutModel.nodeToLayer.set(endpointId, lastLayerIndex);
        console.log(
          `🚨 [层级调整] 最终回退：将endpoint ${endpointId} 放到第${lastLayerIndex}层`,
        );
        failureCount++;
      }
    });

    console.log('🔧 [层级调整] endpoint节点层级调整完成');
    console.log(`  ✅ 成功处理: ${successCount} 个`);
    console.log(`  ⚠️ 回退处理: ${failureCount} 个`);
    console.log(`  📊 总计: ${endpointNodes.length} 个endpoint`);

    // 最终验证：确保所有endpoint都有层级信息
    const unassignedEndpoints = endpointNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      return !this.layoutModel.nodeToLayer.has(nodeId);
    });

    if (unassignedEndpoints.length > 0) {
      console.error(
        `❌ [层级调整] 仍有 ${unassignedEndpoints.length} 个endpoint未分配层级:`,
        unassignedEndpoints.map((n) => n.id || n.getId()),
      );
    } else {
      console.log('✅ [层级调整] 所有endpoint都已正确分配层级');
    }
  }

  /**
   * 为每层创建混合节点列表（普通节点+endpoint统一管理）
   * @param {Array} layers - 分层结果
   */
  createMixedLayerNodes(layers) {
    layers.forEach((layer, layerIndex) => {
      const mixedNodes = {
        normalNodes: [],
        endpointNodes: [],
        allNodes: layer,
        layerIndex,
      };

      layer.forEach((node) => {
        if (node.isEndpoint) {
          mixedNodes.endpointNodes.push(node);
        } else {
          mixedNodes.normalNodes.push(node);
        }
      });

      this.layoutModel.mixedLayerNodes.set(layerIndex, mixedNodes);

      console.log(
        `📊 [混合层级] 第${layerIndex}层: ${mixedNodes.normalNodes.length}普通节点 + ${mixedNodes.endpointNodes.length}endpoint节点`,
      );
    });
  }

  /**
   * 自底向上位置计算
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 节点位置映射
   */
  async calculateBottomUpPositions(layerStructure) {
    console.log("🎯 [位置计算] 开始自底向上位置计算");

    const { layers } = layerStructure;
    const positions = new Map();

    // 从最底层开始计算
    for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
      const layer = layers[layerIndex];
      const isBottomLayer = layerIndex === layers.length - 1;

      if (isBottomLayer) {
        // 最底层：统一排列所有节点（普通+endpoint）
        this.calculateBottomLayerPositions(layer, positions, layerIndex);
      } else {
        // 上层：基于子节点分布计算
        this.calculateParentLayerPositions(
          layer,
          positions,
          layerIndex,
          layerStructure,
        );
      }
    }

    console.log(
      `🎯 [位置计算] 位置计算完成，共计算 ${positions.size} 个节点位置`,
    );

    return positions;
  }

  /**
   * 几何中心对齐的自底向上位置计算
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 节点位置映射
   */
  async calculateBottomUpPositionsWithGeometricAlignment(layerStructure) {
    console.log("🎯 [几何对齐] 开始几何中心对齐的自底向上位置计算");

    try {
      // 转换layerStructure为layers数组格式
      const layers = layerStructure.layers || [];
      
      // 获取当前节点位置映射
      const currentPositions = new Map();
      this.graph.getNodes().forEach(node => {
        const position = node.getPosition();
        currentPositions.set(node.id, position);
      });
      
      // 使用几何中心对齐算法
      const optimizedPositions = await this.geometricAligner.calculateGeometricAlignment(
        layers,
        currentPositions
      );
      
      // 构造返回结果格式
      const alignmentResult = {
        positions: optimizedPositions,
        isValid: true
      };

      console.log(
        `🎯 [几何对齐] 几何中心对齐完成，共计算 ${alignmentResult.positions.size} 个节点位置`,
      );

      // 验证对齐结果
      const validationResult = this.geometricAligner.validateAlignment(alignmentResult);
      if (!validationResult.isValid) {
        console.warn('⚠️ [几何对齐] 对齐验证失败，回退到标准算法');
        console.warn('验证错误:', validationResult.errors);
        return await this.calculateBottomUpPositions(layerStructure);
      }

      console.log('✅ [几何对齐] 对齐验证通过');
      return alignmentResult.positions;

    } catch (error) {
      console.error('❌ [几何对齐] 几何中心对齐失败，回退到标准算法:', error);
      return await this.calculateBottomUpPositions(layerStructure);
    }
  }

  /**
   * 计算最底层位置（垂直分层布局）
   * @param {Array} bottomLayer - 最底层节点
   * @param {Map} positions - 位置映射
   * @param {number} layerIndex - 层级索引
   */
  calculateBottomLayerPositions(bottomLayer, positions, layerIndex) {
    const nodeSpacing = this.options.node.preferredSpacing;
    
    // 🎯 关键修复：垂直分层布局 - 计算Y坐标（层级位置）
    const layerY = this.calculateLayerY(layerIndex);
    
    console.log(
      `📊 [垂直分层] 第${layerIndex}层，目标Y坐标: ${layerY}，节点数: ${bottomLayer.length}`,
    );

    // 🎯 关键修复：垂直分层布局 - 按节点类型排序，开始节点在顶层
    const sortedNodes = bottomLayer.sort((a, b) => {
      const aId = a.id || a.getId();
      const bId = b.id || b.getId();
      
      // 开始节点永远在最顶层（Y坐标最小）
      if (aId.includes('start')) return -1;
      if (bId.includes('start')) return 1;
      
      // 结束节点在最底层（Y坐标最大）
      if (aId.includes('end')) return 1;
      if (bId.includes('end')) return -1;
      
      // 其他节点按ID排序保持稳定性
      return aId.localeCompare(bId);
    });

    // 🎯 垂直分层布局：为每个节点分配位置
    sortedNodes.forEach((node, index) => {
      const nodeId = node.id || node.getId();
      
      // 🎯 关键修复：垂直分层布局 - 所有节点使用相同的X坐标（居中对齐）
      const centerX = this.options.canvas.width / 2 || 400; // 画布中心X坐标
      const nodeX = centerX;
      
      // 🎯 关键修复：单节点特殊处理
      let finalY;
      if (bottomLayer.length === 1) {
        finalY = 300; // 单节点使用画布中心Y坐标
      } else {
        finalY = layerY; // 多节点使用层级Y坐标
      }
      
      const positionData = {
        x: nodeX,
        y: finalY,
        layerIndex,
        isBottomLayer: true,
        nodeType: node.isEndpoint ? "endpoint" : "normal",
        sortIndex: index
      };
      
      positions.set(nodeId, positionData);
      
      console.log(
        `📍 [垂直分层] ${node.isEndpoint ? "Endpoint" : "普通节点"} ${nodeId}: (${nodeX}, ${finalY}), 层级: ${layerIndex}`,
      );
      
      // 🎯 关键修复：对于虚拟endpoint节点，立即同步其内部位置
      if (node.isEndpoint && node.setPosition) {
        node.setPosition({ x: nodeX, y: finalY });
        console.log(
          `🎯 [同步修复] 虚拟endpoint ${nodeId} 内部位置已同步: (${nodeX}, ${finalY})`,
        );
      }
    });

    console.log(
      `📊 [垂直分层] 垂直分层布局完成，共处理 ${sortedNodes.length} 个节点`,
    );
  }

  /**
   * 计算层级Y坐标
   * @param {number} layerIndex - 层级索引（0为最底层）
   * @returns {number} Y坐标
   */
  calculateLayerY(layerIndex) {
    const baseY = 300; // 基础Y坐标（画布中心）
    const layerSpacing = 150; // 层级间距
    
    // 从底层开始，向上递减Y坐标（因为Y轴向下为正）
    // layerIndex=0（底层）-> Y=300
    // layerIndex=1（上一层）-> Y=150
    // layerIndex=2（再上一层）-> Y=0
    return baseY - (layerIndex * layerSpacing);
  }

  /**
   * 计算父层位置（基于子节点分布）
   * @param {Array} parentLayer - 父层节点
   * @param {Map} positions - 位置映射
   * @param {number} layerIndex - 层级索引
   * @param {Object} layerStructure - 层级结构
   */
  calculateParentLayerPositions(
    parentLayer,
    positions,
    layerIndex,
    layerStructure,
  ) {
    const layerY = this.calculateLayerY(layerIndex);
    console.log(
      `📍 [父层定位] 第${layerIndex}层，目标Y坐标: ${layerY}，父节点数: ${parentLayer.length}`,
    );

    // 🔥 关键修复：强制统一同层Y坐标验证
    console.log(`🎯 [Y坐标统一] 开始强制统一第${layerIndex}层所有节点Y坐标为: ${layerY}`);

    // 🎯 关键修复：分别处理有子节点和无子节点的节点
    const nodesWithChildren = [];
    const nodesWithoutChildren = [];

    parentLayer.forEach((parentNode) => {
      const parentId = parentNode.id || parentNode.getId();
      const children = layerStructure.parentChildMap.get(parentId) || [];

      // 获取子节点位置
      const childPositions = children
        .map((childId) => positions.get(childId))
        .filter((pos) => pos !== undefined);

      if (childPositions.length > 0) {
        nodesWithChildren.push({ node: parentNode, childPositions });
      } else {
        nodesWithoutChildren.push(parentNode);
      }
    });

    // 第一步：处理有子节点的节点
    nodesWithChildren.forEach(({ node, childPositions }) => {
      const parentId = node.id || node.getId();
      const parentX = this.calculateOptimalParentPosition(childPositions);

      const positionData = {
        x: parentX,
        y: layerY, // 🔥 关键修复：强制使用层级计算的Y坐标，确保同层节点Y坐标一致
        layerIndex,
        nodeType: node.isEndpoint ? "endpoint" : "normal",
        childrenCount: childPositions.length,
        childrenSpread: this.calculateChildrenSpread(childPositions),
      };

      positions.set(parentId, positionData);

      console.log(
        `📍 [父层定位] ${node.isEndpoint ? "Endpoint" : "普通节点"} ${parentId}: (${parentX.toFixed(1)}, ${layerY}), 子节点数: ${childPositions.length}`,
      );

      // 🔥 关键修复：Y坐标一致性验证
      console.log(`🎯 [Y坐标验证] 节点 ${parentId} Y坐标已强制设置为: ${layerY}`);
    });

    // 第二步：处理无子节点的节点（通常是endpoint节点）
    if (nodesWithoutChildren.length > 0) {
      console.log(
        `📍 [父层定位] 处理 ${nodesWithoutChildren.length} 个无子节点的节点`,
      );

      // 获取已分配位置的节点X坐标范围
      const existingPositions = Array.from(positions.values())
        .filter((pos) => pos.layerIndex === layerIndex)
        .map((pos) => pos.x);

      let startX = 0;
      if (existingPositions.length > 0) {
        const maxX = Math.max(...existingPositions);
        startX = maxX + this.options.node.preferredSpacing;
      }

      // 为无子节点的节点分配X坐标
      nodesWithoutChildren.forEach((node, index) => {
        const parentId = node.id || node.getId();
        const nodeX = startX + index * this.options.node.preferredSpacing;

        const positionData = {
          x: nodeX,
          y: layerY, // 🔥 关键修复：强制使用层级计算的Y坐标，确保同层节点Y坐标一致
          layerIndex,
          nodeType: node.isEndpoint ? "endpoint" : "normal",
          childrenCount: 0,
          childrenSpread: 0,
          isOrphanNode: true, // 标记为孤立节点
        };

        positions.set(parentId, positionData);

        console.log(
          `📍 [父层定位] ${node.isEndpoint ? "Endpoint" : "普通节点"} ${parentId}: (${nodeX.toFixed(1)}, ${layerY}), 孤立节点`,
        );

        // 🔥 关键修复：Y坐标一致性验证
        console.log(`🎯 [Y坐标验证] 孤立节点 ${parentId} Y坐标已强制设置为: ${layerY}`);

        // 🎯 关键修复：对于虚拟endpoint节点，立即同步其内部位置
        if (node.isEndpoint && node.setPosition) {
          node.setPosition({ x: nodeX, y: layerY });
          console.log(
            `🎯 [同步修复] 虚拟endpoint ${parentId} 内部位置已同步: (${nodeX.toFixed(1)}, ${layerY})`,
          );
        }
      });
    }
  }

  /**
   * 计算父节点最优位置
   * @param {Array} childPositions - 子节点位置数组
   * @returns {number} 最优X坐标
   */
  calculateOptimalParentPosition(childPositions) {
    if (!childPositions || childPositions.length === 0) {
      console.warn('⚠️ [父节点定位] 子节点位置数组为空，返回默认位置0');
      return 0;
    }

    const childXCoords = childPositions.map((pos) => pos.x);

    if (childXCoords.length === 1) {
      // 🔥 关键修复：单个子节点，父节点直接对齐到子节点X坐标
      const optimalX = childXCoords[0];
      console.log(`🎯 [父节点定位] 单子节点对齐: 父节点X = ${optimalX.toFixed(1)}`);
      return optimalX;
    } else if (childXCoords.length === 2) {
      // 🔥 关键修复：两个子节点，父节点精确定位到中心点
      const optimalX = (childXCoords[0] + childXCoords[1]) / 2;
      console.log(`🎯 [父节点定位] 双子节点中心: 父节点X = ${optimalX.toFixed(1)} (子节点: ${childXCoords[0].toFixed(1)}, ${childXCoords[1].toFixed(1)})`);
      return optimalX;
    } else {
      // 🔥 关键修复：多个子节点，使用精确的算术平均值作为中点
      const arithmeticMean = childXCoords.reduce((sum, x) => sum + x, 0) / childXCoords.length;
      
      // 🎯 增强修复：同时计算几何中心（边界中心）作为参考
      const minX = Math.min(...childXCoords);
      const maxX = Math.max(...childXCoords);
      const geometricCenter = (minX + maxX) / 2;
      
      // 🔥 关键修复：优先使用算术平均值，确保父节点位于子节点的真实中心
      const optimalX = arithmeticMean;
      
      console.log(`🎯 [父节点定位] 多子节点中心: 父节点X = ${optimalX.toFixed(1)}`);
      console.log(`  📊 [计算详情] 算术平均: ${arithmeticMean.toFixed(1)}, 几何中心: ${geometricCenter.toFixed(1)}, 子节点X坐标: [${childXCoords.map(x => x.toFixed(1)).join(', ')}]`);
      
      return optimalX;
    }
  }

  /**
   * 计算子节点分布范围
   * @param {Array} childPositions - 子节点位置数组
   * @returns {number} 分布范围
   */
  calculateChildrenSpread(childPositions) {
    if (childPositions.length <= 1) return 0;

    const xCoords = childPositions.map((pos) => pos.x);
    return Math.max(...xCoords) - Math.min(...xCoords);
  }

  /**
   * 层级内统一优化（普通节点+endpoint）
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 优化后的位置映射
   */
  async optimizeUnifiedLayerAlignment(positions, layerStructure) {
    console.log("🔧 [统一优化] 开始层级内统一优化");

    let totalAdjustments = 0;

    // 对每一层进行统一优化
    for (
      let layerIndex = 0;
      layerIndex < layerStructure.layers.length;
      layerIndex++
    ) {
      const mixedNodes = this.layoutModel.mixedLayerNodes.get(layerIndex);

      if (mixedNodes && mixedNodes.allNodes.length > 1) {
        // 🎯 关键：统一处理该层的所有节点（普通+endpoint）
        const layerAdjustments = await this.optimizeSingleLayerUnified(
          mixedNodes,
          positions,
          layerStructure,
        );
        totalAdjustments += layerAdjustments;
      }
    }

    console.log(
      `🔧 [统一优化] 优化完成，共调整 ${totalAdjustments} 个节点位置`,
    );

    return positions;
  }

  /**
   * 优化单层的统一排列（普通节点+endpoint）
   * @param {Object} mixedNodes - 混合节点数据
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {number} 调整次数
   */
  async optimizeSingleLayerUnified(mixedNodes, positions, layerStructure) {
    const { allNodes, layerIndex } = mixedNodes;

    // 第一步：解决节点重叠
    const overlapAdjustments = this.resolveNodeOverlaps(allNodes, positions);

    // 第二步：优化父子对齐（考虑endpoint）
    const alignmentAdjustments = this.optimizeParentChildAlignment(
      allNodes,
      positions,
      layerStructure,
    );

    // 🎯 关键修复：层级居中对齐放在最后执行，确保不被其他优化覆盖
    const centerAdjustments = this.centerAlignLayer(allNodes, positions);

    const totalAdjustments =
      overlapAdjustments + alignmentAdjustments + centerAdjustments;

    console.log(
      `🔧 [单层优化] 第${layerIndex}层优化完成，总调整 ${totalAdjustments} 次`,
    );
    console.log(
      `  📊 [优化详情] 重叠解决: ${overlapAdjustments}, 父子对齐: ${alignmentAdjustments}, 层级居中: ${centerAdjustments}`,
    );

    return totalAdjustments;
  }

  /**
   * 解决节点重叠 - 增强版
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  resolveNodeOverlaps(layerNodes, positions) {
    // 🔧 增强修复：强制最小间距，确保底层节点不重叠
    const baseMinSpacing = this.options.node.minSpacing;
    const enhancedMinSpacing = Math.max(baseMinSpacing, 150); // 强制最小150px间距
    let adjustments = 0;

    // 🎯 关键修复：过滤掉没有位置信息的节点，避免TypeError
    const validNodes = layerNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);
      if (!pos) {
        console.warn(
          `⚠️ [重叠解决] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return false;
      }
      return true;
    });

    if (validNodes.length === 0) {
      console.log('📊 [重叠解决] 没有有效节点需要处理重叠');
      return 0;
    }

    console.log(`📊 [重叠解决] 开始处理 ${validNodes.length} 个节点的重叠问题，强制最小间距: ${enhancedMinSpacing}px`);

    // 按X坐标排序
    const sortedNodes = validNodes.sort((a, b) => {
      const aPos = positions.get(a.id || a.getId());
      const bPos = positions.get(b.id || b.getId());
      // 🎯 修复：按逻辑流程排序，而非X坐标排序
      const aId = a.id || a.getId();
      const bId = b.id || b.getId();
      
      // 开始节点优先级最高
      if (aId.includes('start')) return -1;
      if (bId.includes('start')) return 1;
      
      // 结束节点优先级最低
      if (aId.includes('end')) return 1;
      if (bId.includes('end')) return -1;
      
      // 其他节点按节点ID排序，保持稳定顺序
      return aId.localeCompare(bId);
    });

    // 打印排序后的节点信息
    console.log('📊 [重叠解决] 排序后的节点:', sortedNodes.map(node => {
        const nodeId = node.id || node.getId();
        const pos = positions.get(nodeId);
        return `${nodeId}(${node.isEndpoint ? "endpoint" : "normal"}, x=${pos.x.toFixed(1)})`;
      }),
    );

    // 🔧 增强修复：多轮重叠检测，确保彻底解决重叠
    let maxIterations = 3;
    let iteration = 0;
    
    while (iteration < maxIterations) {
      let iterationAdjustments = 0;
      
      // 从左到右检查并调整重叠
      for (let i = 1; i < sortedNodes.length; i++) {
        const currentNode = sortedNodes[i];
        const prevNode = sortedNodes[i - 1];

        const currentPos = positions.get(currentNode.id || currentNode.getId());
        const prevPos = positions.get(prevNode.id || prevNode.getId());

        // 🔧 增强修复：根据节点类型动态调整间距
        let requiredSpacing = enhancedMinSpacing;
        
        // 如果是不同类型的节点，增加额外间距
        const currentIsEndpoint = currentNode.isEndpoint;
        const prevIsEndpoint = prevNode.isEndpoint;
        if (currentIsEndpoint !== prevIsEndpoint) {
          requiredSpacing += 30; // 混合类型节点额外间距
        }

        const actualSpacing = currentPos.x - prevPos.x;

        if (actualSpacing < requiredSpacing) {
          const adjustment = requiredSpacing - actualSpacing + 10; // 额外10px缓冲
          const oldX = currentPos.x;
          currentPos.x += adjustment;
          adjustments++;
          iterationAdjustments++;

          console.log(
            `🔧 [重叠解决-轮次${iteration + 1}] 调整节点 ${currentNode.id || currentNode.getId()}: ${oldX.toFixed(1)} -> ${currentPos.x.toFixed(1)} (+${adjustment.toFixed(1)}px, 需求间距: ${requiredSpacing}px)`,
          );

          // 🎯 关键修复：对于虚拟endpoint节点，同步其内部位置
          if (currentNode.isEndpoint && currentNode.setPosition) {
            currentNode.setPosition({ x: currentPos.x, y: currentPos.y });
            console.log(
              `🎯 [同步修复] 虚拟endpoint ${currentNode.id || currentNode.getId()} 内部位置已同步: (${currentPos.x.toFixed(1)}, ${currentPos.y})`,
            );
          }

          // 🔧 增强修复：同步更新图形节点位置
          if (!currentNode.isEndpoint) {
            const graphNode = this.graph.getCellById(currentNode.id || currentNode.getId());
            if (graphNode) {
              graphNode.setPosition({ x: currentPos.x, y: currentPos.y });
              console.log(`🎯 [图形同步] 普通节点 ${currentNode.id || currentNode.getId()} 图形位置已同步`);
            }
          }
        }
      }
      
      iteration++;
      
      // 如果本轮没有调整，说明重叠已解决
      if (iterationAdjustments === 0) {
        console.log(`✅ [重叠解决] 第${iteration}轮检测无重叠，解决完成`);
        break;
      }
      
      console.log(`📊 [重叠解决] 第${iteration}轮完成，调整了${iterationAdjustments}个节点`);
    }

    // 🔧 增强修复：最终验证，确保没有遗漏的重叠
    this.validateNoOverlaps(sortedNodes, positions, enhancedMinSpacing);

    console.log(`📊 [重叠解决] 重叠解决完成，共调整 ${adjustments} 个节点，执行了${iteration}轮检测`);

    return adjustments;
  }

  /**
   * 🔧 增强修复：验证没有节点重叠
   * @param {Array} sortedNodes - 排序后的节点
   * @param {Map} positions - 位置映射
   * @param {number} minSpacing - 最小间距
   */
  validateNoOverlaps(sortedNodes, positions, minSpacing) {
    console.log('🔍 [重叠验证] 开始最终重叠验证');
    
    let overlapCount = 0;
    
    for (let i = 1; i < sortedNodes.length; i++) {
      const currentNode = sortedNodes[i];
      const prevNode = sortedNodes[i - 1];

      const currentPos = positions.get(currentNode.id || currentNode.getId());
      const prevPos = positions.get(prevNode.id || prevNode.getId());

      const actualSpacing = currentPos.x - prevPos.x;

      if (actualSpacing < minSpacing) {
        overlapCount++;
        console.error(`❌ [重叠验证] 发现残留重叠: ${prevNode.id || prevNode.getId()} 和 ${currentNode.id || currentNode.getId()}, 间距: ${actualSpacing.toFixed(1)}px (需求: ${minSpacing}px)`);
      }
    }
    
    if (overlapCount === 0) {
      console.log('✅ [重叠验证] 验证通过，无节点重叠');
    } else {
      console.error(`❌ [重叠验证] 发现${overlapCount}处重叠，需要进一步处理`);
    }
  }

  /**
   * 优化父子对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {number} 调整次数
   */
  optimizeParentChildAlignment(layerNodes, positions, layerStructure) {
    let adjustments = 0;
    let forcedAlignments = 0;

    console.log(`🎯 [父子对齐] 开始强化父子X坐标对齐优化，处理 ${layerNodes.length} 个节点`);

    layerNodes.forEach((node) => {
      const nodeId = node.id || node.getId();
      const nodePos = positions.get(nodeId);

      // 🎯 关键修复：检查节点位置是否存在
      if (!nodePos) {
        console.warn(
          `⚠️ [父子对齐] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return;
      }

      const children = layerStructure.parentChildMap.get(nodeId) || [];

      if (children.length > 0) {
        const childPositions = children
          .map((childId) => positions.get(childId))
          .filter((pos) => pos !== undefined);

        if (childPositions.length > 0) {
          // 🎯 关键修复：使用更精确的父节点最优位置计算
          const optimalX = this.calculateOptimalParentPosition(childPositions);
          const currentX = nodePos.x;
          const deviation = Math.abs(optimalX - currentX);

          // 🔥 关键修复：强制精确对齐，容忍度降至0.01px
          if (deviation > 0.01) {
            const oldX = nodePos.x;
            nodePos.x = optimalX;
            adjustments++;

            // 🎯 关键修复：详细记录子节点信息用于调试
            const childInfo = childPositions.map((pos, idx) => `子${idx+1}:(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`).join(', ');
            
            console.log(
              `🔧 [父子对齐] 强制精确调整节点 ${nodeId}: ${oldX.toFixed(1)} → ${optimalX.toFixed(1)} (偏差: ${deviation.toFixed(3)}px)`,
            );
            console.log(`   └─ 子节点位置: ${childInfo}`);
            console.log(`   └─ 计算的最优X坐标: ${optimalX.toFixed(3)}`);

            // 🎯 关键修复：对于虚拟endpoint节点，同步其内部位置
            if (node.isEndpoint && node.setPosition) {
              node.setPosition({ x: optimalX, y: nodePos.y });
              console.log(
                `🎯 [同步修复] 虚拟endpoint ${nodeId} 内部位置已同步到精确对齐位置: (${optimalX.toFixed(3)}, ${nodePos.y})`,
              );
            }

            // 🎯 关键修复：验证对齐结果
            const postAlignmentDeviation = Math.abs(nodePos.x - optimalX);
            if (postAlignmentDeviation > 0.001) {
              console.error(`❌ [对齐验证] 节点 ${nodeId} 对齐后仍有偏差: ${postAlignmentDeviation.toFixed(6)}px`);
              // 强制再次设置
              nodePos.x = optimalX;
              forcedAlignments++;
            }
          } else {
            console.log(
              `✅ [父子对齐] 节点 ${nodeId} 已精确对齐 (偏差: ${deviation.toFixed(6)}px)`,
            );
          }

          // 🎯 关键修复：额外验证父子关系的几何正确性
          this.validateParentChildGeometry(nodeId, nodePos, childPositions);
        }
      }
    });

    console.log(`🔧 [父子对齐] 强化对齐优化完成，共调整 ${adjustments} 个父节点位置，强制修正 ${forcedAlignments} 次`);
    return adjustments;
  }

  /**
   * 🎯 关键修复：验证父子关系的几何正确性
   * @param {string} parentId - 父节点ID
   * @param {Object} parentPos - 父节点位置
   * @param {Array} childPositions - 子节点位置数组
   */
  validateParentChildGeometry(parentId, parentPos, childPositions) {
    if (childPositions.length === 0) return;

    // 计算子节点的X坐标范围
    const childXCoords = childPositions.map(pos => pos.x);
    const minChildX = Math.min(...childXCoords);
    const maxChildX = Math.max(...childXCoords);
    const childCenterX = (minChildX + maxChildX) / 2;

    // 验证父节点是否位于子节点的几何中心
    const geometricDeviation = Math.abs(parentPos.x - childCenterX);
    
    if (geometricDeviation > 0.1) {
      console.warn(`⚠️ [几何验证] 父节点 ${parentId} 几何中心偏差: ${geometricDeviation.toFixed(3)}px`);
      console.warn(`   └─ 父节点X: ${parentPos.x.toFixed(3)}, 子节点几何中心X: ${childCenterX.toFixed(3)}`);
      console.warn(`   └─ 子节点X范围: [${minChildX.toFixed(1)}, ${maxChildX.toFixed(1)}]`);
    } else {
      console.log(`✅ [几何验证] 父节点 ${parentId} 几何位置正确 (偏差: ${geometricDeviation.toFixed(6)}px)`);
    }
  }

  /**
   * 层级居中对齐 - 增强版
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlignLayer(layerNodes, positions) {
    if (layerNodes.length === 0) return 0;

    // 🎯 关键修复：过滤掉没有位置信息的节点
    const validNodes = layerNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);
      if (!pos) {
        console.warn(
          `⚠️ [层级居中] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return false;
      }
      return true;
    });

    if (validNodes.length === 0) {
      console.log('📊 [层级居中] 没有有效节点需要居中对齐');
      return 0;
    }

    // 🎯 高优先级修复：单节点层级强制居中处理 (阈值降至0.1px)
    if (validNodes.length === 1) {
      const node = validNodes[0];
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);

      // 对于单节点，强制居中到 x=0，使用极低阈值确保精确居中
      if (Math.abs(pos.x) > 0.1) {
        const oldX = pos.x;
        pos.x = 0;
        console.log(
          `🎯 [单节点强制居中] 节点 ${nodeId}: ${oldX.toFixed(1)} → 0.0 (强制居中)`,
        );

        // 🎯 关键修复：对于虚拟endpoint节点，同步其内部位置
        if (node.isEndpoint && node.setPosition) {
          node.setPosition({ x: 0, y: pos.y });
          console.log(
            `🎯 [同步修复] 虚拟endpoint ${nodeId} 内部位置已同步到居中位置`,
          );
        }

        return 1;
      } else {
        console.log(
          `✅ [单节点居中] 节点 ${nodeId}: 已精确居中 (${pos.x.toFixed(1)})`,
        );
        return 0;
      }
    }

    // 🎯 中优先级修复：多节点层级对称分布优化
    return this.optimizeMultiNodeSymmetricDistribution(validNodes, positions);
  }

  /**
   * 优化多节点层级对称分布 - 增强版算法
   * @param {Array} validNodes - 有效节点数组
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  optimizeMultiNodeSymmetricDistribution(validNodes, positions) {
    const nodeCount = validNodes.length;
    let adjustments = 0;

    console.log(`🚀 [增强对称分布] 开始优化 ${nodeCount} 个节点的智能对称分布`);

    // 获取当前X坐标并排序
    const nodePositions = validNodes
      .map((node) => {
        const nodeId = node.id || node.getId();
        const pos = positions.get(nodeId);
        return { node, nodeId, pos, x: pos.x };
      })
      .sort((a, b) => a.x - b.x);

    // 计算节点重要性权重（基于连接数和类型）
    const nodeWeights = this.calculateNodeImportanceWeights(validNodes);

    // 根据节点数量采用不同的智能对称分布策略
    if (nodeCount === 2) {
      // 两节点：动态对称分布，基于重要性调整间距
      const baseSpacing = 80; // 基础间距从60增加到80
      const weightDiff = Math.abs(nodeWeights[0] - nodeWeights[1]);
      const dynamicSpacing = baseSpacing + (weightDiff * 20); // 重要性差异影响间距
      const targetPositions = [-dynamicSpacing / 2, dynamicSpacing / 2];
      
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            `🚀 [2节点智能] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (动态间距: ${dynamicSpacing.toFixed(1)})`,
          );

          // 同步endpoint位置
          if (item.node.isEndpoint && item.node.setPosition) {
            item.node.setPosition({ x: targetX, y: item.pos.y });
          }
        }
      });
    } else if (nodeCount === 3) {
      // 三节点：黄金比例分布，中心节点权重影响偏移
      const totalWidth = 140; // 增加总宽度
      const centerWeight = nodeWeights[1]; // 中心节点权重
      const centerOffset = (centerWeight - 0.5) * 20; // 根据重要性微调中心位置
      const targetPositions = [
        -totalWidth / 2,
        centerOffset,
        totalWidth / 2
      ];
      
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            `🚀 [3节点黄金] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (黄金比例+权重调整)`,
          );

          // 同步endpoint位置
          if (item.node.isEndpoint && item.node.setPosition) {
            item.node.setPosition({ x: targetX, y: item.pos.y });
          }
        }
      });
    } else if (nodeCount === 4) {
      // 四节点：黄金比例对称分布
      const goldenRatio = 1.618;
      const baseWidth = 120;
      const innerSpacing = baseWidth / goldenRatio; // 内侧间距使用黄金比例
      const outerSpacing = baseWidth; // 外侧间距
      
      const targetPositions = [
        -outerSpacing,
        -innerSpacing / 2,
        innerSpacing / 2,
        outerSpacing
      ];
      
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            `🚀 [4节点黄金] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (黄金比例对称)`,
          );

          // 同步endpoint位置
          if (item.node.isEndpoint && item.node.setPosition) {
            item.node.setPosition({ x: targetX, y: item.pos.y });
          }
        }
      });
    } else {
      // 多节点（5+）：智能加权分布
      const positions = this.calculateIntelligentMultiNodeDistribution(nodePositions, nodeWeights);
      
      nodePositions.forEach((item, index) => {
        const targetX = positions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            `🚀 [多节点智能] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (智能加权分布)`,
          );

          // 同步endpoint位置
          if (item.node.isEndpoint && item.node.setPosition) {
            item.node.setPosition({ x: targetX, y: item.pos.y });
          }
        }
      });
    }

    // 最终验证：确保整体居中
    const finalXCoords = nodePositions.map((item) => item.pos.x);
    const finalCenterX =
      (Math.min(...finalXCoords) + Math.max(...finalXCoords)) / 2;

    if (Math.abs(finalCenterX) > 0.5) {
      const offsetX = -finalCenterX;
      nodePositions.forEach((item) => {
        item.pos.x += offsetX;
        if (item.node.isEndpoint && item.node.setPosition) {
          item.node.setPosition({ x: item.pos.x, y: item.pos.y });
        }
      });
      adjustments += nodeCount;
      console.log(
        `🚀 [最终居中] 整体微调偏移 ${offsetX.toFixed(1)}px，确保精确居中`,
      );
    }

    console.log(
      `✅ [增强对称分布] 优化完成，调整 ${adjustments} 次，节点分布:`,
      nodePositions
        .map((item) => `${item.nodeId}(${item.pos.x.toFixed(1)})`)
        .join(", "),
    );

    return adjustments;
  }

  /**
   * 计算节点重要性权重
   * @param {Array} nodes - 节点数组
   * @returns {Array} 权重数组
   */
  calculateNodeImportanceWeights(nodes) {
    const weights = nodes.map(node => {
      let weight = 0.5; // 基础权重
      
      // 基于连接数的权重
      const connections = this.getNodeConnections(node);
      weight += Math.min(connections * 0.1, 0.3); // 最多增加0.3
      
      // 基于节点类型的权重
      if (node.isEndpoint) {
        weight += 0.1; // endpoint节点稍微增加权重
      }
      
      // 基于层级位置的权重（中心层级权重更高）
      const layerIndex = this.getNodeLayerIndex(node);
      const totalLayers = this.getTotalLayers();
      const centerDistance = Math.abs(layerIndex - totalLayers / 2);
      weight += (1 - centerDistance / (totalLayers / 2)) * 0.2;
      
      return Math.min(Math.max(weight, 0.1), 1.0); // 限制在0.1-1.0范围内
    });
    
    console.log(`🎯 [节点权重] 计算完成:`, weights.map((w, i) => `${nodes[i].id || nodes[i].getId()}(${w.toFixed(2)})`).join(", "));
    return weights;
  }

  /**
   * 计算智能多节点分布位置
   * @param {Array} nodePositions - 节点位置数组
   * @param {Array} weights - 权重数组
   * @returns {Array} 目标X坐标数组
   */
  calculateIntelligentMultiNodeDistribution(nodePositions, weights) {
    const nodeCount = nodePositions.length;
    const maxWidth = 400; // 最大分布宽度
    
    // 基于权重计算动态间距
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const avgWeight = totalWeight / nodeCount;
    
    // 计算每个节点应占的空间比例
    const spaceRatios = weights.map(w => w / avgWeight);
    
    // 计算累积位置
    const positions = [];
    let currentPos = -maxWidth / 2;
    const unitSpacing = maxWidth / (nodeCount - 1);
    
    for (let i = 0; i < nodeCount; i++) {
      if (i === 0) {
        positions.push(currentPos);
      } else if (i === nodeCount - 1) {
        positions.push(maxWidth / 2);
      } else {
        // 中间节点基于权重调整位置
        const basePos = -maxWidth / 2 + (i * unitSpacing);
        const weightAdjustment = (spaceRatios[i] - 1) * 30; // 权重调整幅度
        positions.push(basePos + weightAdjustment);
      }
    }
    
    // 确保整体居中
    const centerX = (positions[0] + positions[positions.length - 1]) / 2;
    const offset = -centerX;
    return positions.map(pos => pos + offset);
  }

  /**
   * 获取节点连接数
   * @param {Object} node - 节点对象
   * @returns {number} 连接数
   */
  getNodeConnections(node) {
    // 简化实现，实际应该根据图结构计算
    return node.connections ? node.connections.length : 1;
  }

  /**
   * 获取节点层级索引
   * @param {Object} node - 节点对象
   * @returns {number} 层级索引
   */
  getNodeLayerIndex(node) {
    // 简化实现，实际应该根据布局结构计算
    return node.layerIndex || 0;
  }

  /**
   * 获取总层级数
   * @returns {number} 总层级数
   */
  getTotalLayers() {
    // 简化实现，实际应该根据布局结构计算
    return this.layoutModel?.layers?.length || 3;
  }

  /**
   * 全局优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 最终位置映射
   */
  async applyGlobalOptimization(positions, layerStructure) {
    console.log("🌍 [全局优化] 开始全局布局优化");

    // 全局优化1：调整层级间距
    this.adjustGlobalLayerSpacing(positions, layerStructure);

    // 🎯 关键修复：在层级优化完成后重新计算虚拟endpoint位置
    this.recalculateEndpointPositions(positions, layerStructure);

    // 全局优化2：全局X轴平衡算法（新增）
    this.applyGlobalXAxisBalancing(positions, layerStructure);

    // 全局优化3：整体居中
    this.centerAlignGlobalLayout(positions);

    // 全局优化4：美学优化
    if (this.options.optimization.enableAestheticOptimization) {
      this.applyAestheticOptimizations(positions, layerStructure);
    }

    // 🎯 关键修复：验证和修正同层Y坐标一致性（增强版 - 包含父子节点对齐）
    this.validateAndFixLayerYCoordinates(positions);

    console.log("🌍 [全局优化] 全局优化完成");

    return positions;
  }

  /**
   * 🎯 关键修复：重新计算虚拟endpoint位置
   * 在层级优化完成后，基于源节点的最新位置重新计算endpoint位置
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  recalculateEndpointPositions(positions, layerStructure) {
    console.log("🔄 [Endpoint重计算] 开始基于优化后位置重新计算虚拟endpoint位置");

    let recalculatedCount = 0;
    const endpointUpdates = [];

    // 遍历所有位置，找到虚拟endpoint节点
    positions.forEach((position, nodeId) => {
      if (position.nodeType === 'endpoint') {
        const endpointNode = this.layoutModel.endpointNodes.get(nodeId);
        if (endpointNode && endpointNode.sourceNodeId) {
          const sourceNodeId = endpointNode.sourceNodeId;
          const sourcePosition = positions.get(sourceNodeId);
          
          if (sourcePosition) {
            // 获取源节点信息
            const sourceNode = this.graph.getCellById(sourceNodeId);
            if (sourceNode && typeof sourceNode.getSize === 'function') {
              const nodeSize = sourceNode.getSize() || { width: 120, height: 40 };
              
              // 使用优化后的位置重新计算endpoint位置
              const newEndpointPosition = this.calculateIntelligentEndpointPosition(
                sourceNode,
                sourcePosition,
                nodeSize,
                recalculatedCount,
                true // 🎯 关键：标记使用优化后的位置
              );

              // 更新位置信息
              const updatedPosition = {
                ...position,
                x: newEndpointPosition.x,
                y: newEndpointPosition.y,
                sourceX: sourcePosition.x,
                sourceY: sourcePosition.y
              };

              endpointUpdates.push({
                nodeId,
                oldPosition: { x: position.x, y: position.y },
                newPosition: { x: newEndpointPosition.x, y: newEndpointPosition.y },
                updatedPosition
              });

              recalculatedCount++;
            }
          }
        }
      }
    });

    // 批量应用更新
    endpointUpdates.forEach(update => {
      positions.set(update.nodeId, update.updatedPosition);
      
      // 同步到虚拟节点对象
      const endpointNode = this.layoutModel.endpointNodes.get(update.nodeId);
      if (endpointNode && endpointNode.setPosition) {
        endpointNode.setPosition({
          x: update.newPosition.x,
          y: update.newPosition.y
        });
      }

      console.log(
        `🔄 [Endpoint重计算] ${update.nodeId}: (${update.oldPosition.x.toFixed(1)}, ${update.oldPosition.y.toFixed(1)}) → (${update.newPosition.x.toFixed(1)}, ${update.newPosition.y.toFixed(1)})`
      );
    });

    console.log(`🔄 [Endpoint重计算] 完成，共重新计算 ${recalculatedCount} 个虚拟endpoint位置`);
  }

  /**
   * 调整全局层级间距
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  adjustGlobalLayerSpacing(positions, layerStructure) {
    const baseHeight = this.options.layer.baseHeight;
    console.log(
      `🔧 [层级间距] 开始调整全局层级间距，baseHeight: ${baseHeight}`,
    );

    layerStructure.layers.forEach((layer, layerIndex) => {
      const targetY = layerIndex * baseHeight;
      console.log(
        `🔧 [层级间距] 第${layerIndex}层，目标Y坐标: ${targetY}，节点数: ${layer.length}`,
      );

      layer.forEach((node) => {
        const nodeId = node.id || node.getId();
        const pos = positions.get(nodeId);
        if (pos) {
          const oldY = pos.y;
          pos.y = targetY;
          console.log(
            `🔧 [层级间距] 节点 ${nodeId}: Y坐标 ${oldY} → ${targetY}`,
          );

          // 🎯 关键修复：对于虚拟endpoint节点，同步其内部位置
          if (node.isEndpoint && node.setPosition) {
            node.setPosition({ x: pos.x, y: targetY });
            console.log(
              `🎯 [同步修复] 虚拟endpoint ${nodeId} 内部位置已同步到层级Y坐标: ${targetY}`,
            );
          }
        } else {
          console.warn(`⚠️ [层级间距] 节点 ${nodeId} 在positions中不存在`);
        }
      });
    });

    console.log('🔧 [层级间距] 全局层级间距调整完成');
  }

  /**
   * 全局X轴平衡算法 - 解决左重右轻问题
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  applyGlobalXAxisBalancing(positions, layerStructure) {
    console.log("⚖️ [X轴平衡] 开始全局X轴平衡分析");

    // 1. 分析X轴分布密度
    const densityAnalysis = this.analyzeXAxisDensity(positions);
    console.log("⚖️ [密度分析] 完成:", densityAnalysis);

    // 2. 识别稀疏和密集区域
    const { sparseRegions, denseRegions } = this.identifyDensityRegions(densityAnalysis);
    
    if (sparseRegions.length === 0 && denseRegions.length === 0) {
      console.log("⚖️ [X轴平衡] 分布均匀，无需调整");
      return;
    }

    // 3. 智能重平衡策略
    const rebalanceStrategy = this.calculateRebalanceStrategy(densityAnalysis, sparseRegions, denseRegions);
    console.log("⚖️ [重平衡策略]:", rebalanceStrategy);

    // 4. 应用重平衡调整
    this.applyRebalanceAdjustments(positions, layerStructure, rebalanceStrategy);

    console.log("⚖️ [X轴平衡] 全局X轴平衡完成");
  }

  /**
   * 分析X轴分布密度
   * @param {Map} positions - 位置映射
   * @returns {Object} 密度分析结果
   */
  analyzeXAxisDensity(positions) {
    const allPositions = Array.from(positions.values());
    const validPositions = allPositions.filter(pos => 
      pos.x !== undefined && !isNaN(pos.x) && Math.abs(pos.x) < 1000
    );

    if (validPositions.length === 0) {
      return { regions: [], totalWidth: 0, centerOfMass: 0 };
    }

    const xCoords = validPositions.map(pos => pos.x).sort((a, b) => a - b);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const totalWidth = maxX - minX;

    // 将X轴分为10个区域进行密度分析
    const regionCount = 10;
    const regionWidth = totalWidth / regionCount;
    const regions = [];

    for (let i = 0; i < regionCount; i++) {
      const regionStart = minX + i * regionWidth;
      const regionEnd = regionStart + regionWidth;
      const nodesInRegion = xCoords.filter(x => x >= regionStart && x < regionEnd).length;
      
      regions.push({
        index: i,
        start: regionStart,
        end: regionEnd,
        center: regionStart + regionWidth / 2,
        nodeCount: nodesInRegion,
        density: nodesInRegion / validPositions.length
      });
    }

    // 计算质心（重心）
    const totalMass = xCoords.reduce((sum, x) => sum + x, 0);
    const centerOfMass = totalMass / xCoords.length;

    return {
      regions,
      totalWidth,
      centerOfMass,
      minX,
      maxX,
      totalNodes: validPositions.length
    };
  }

  /**
   * 识别稀疏和密集区域
   * @param {Object} densityAnalysis - 密度分析结果
   * @returns {Object} 稀疏和密集区域
   */
  identifyDensityRegions(densityAnalysis) {
    const { regions, totalNodes } = densityAnalysis;
    const avgDensity = 1 / regions.length; // 平均密度
    const densityThreshold = avgDensity * 0.5; // 稀疏阈值
    const denseThreshold = avgDensity * 1.5; // 密集阈值

    const sparseRegions = regions.filter(region => region.density < densityThreshold);
    const denseRegions = regions.filter(region => region.density > denseThreshold);

    console.log(`⚖️ [区域识别] 平均密度: ${(avgDensity * 100).toFixed(1)}%, 稀疏区域: ${sparseRegions.length}, 密集区域: ${denseRegions.length}`);

    return { sparseRegions, denseRegions };
  }

  /**
   * 计算重平衡策略
   * @param {Object} densityAnalysis - 密度分析结果
   * @param {Array} sparseRegions - 稀疏区域
   * @param {Array} denseRegions - 密集区域
   * @returns {Object} 重平衡策略
   */
  calculateRebalanceStrategy(densityAnalysis, sparseRegions, denseRegions) {
    const { centerOfMass, totalWidth, minX, maxX } = densityAnalysis;
    const idealCenter = (minX + maxX) / 2;
    const massOffset = centerOfMass - idealCenter;

    // 判断主要问题类型
    let primaryIssue = 'balanced';
    if (Math.abs(massOffset) > totalWidth * 0.1) {
      primaryIssue = massOffset > 0 ? 'right_heavy' : 'left_heavy';
    }

    // 计算调整强度
    const adjustmentIntensity = Math.min(Math.abs(massOffset) / (totalWidth * 0.2), 1.0);

    return {
      primaryIssue,
      massOffset,
      adjustmentIntensity,
      targetShift: -massOffset * 0.3, // 30%的质心偏移修正
      sparseRegionCount: sparseRegions.length,
      denseRegionCount: denseRegions.length
    };
  }

  /**
   * 应用重平衡调整
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @param {Object} strategy - 重平衡策略
   */
  applyRebalanceAdjustments(positions, layerStructure, strategy) {
    if (strategy.primaryIssue === 'balanced') {
      console.log("⚖️ [重平衡] 分布已平衡，无需调整");
      return;
    }

    const { targetShift, adjustmentIntensity } = strategy;
    let adjustedNodes = 0;

    console.log(`⚖️ [重平衡] 开始调整，目标偏移: ${targetShift.toFixed(1)}, 强度: ${(adjustmentIntensity * 100).toFixed(1)}%`);

    // 对所有节点应用渐进式调整
    positions.forEach((pos, nodeId) => {
      if (pos.x !== undefined && !isNaN(pos.x)) {
        const oldX = pos.x;
        
        // 基于距离中心的位置计算调整权重
        const distanceFromCenter = Math.abs(pos.x);
        const adjustmentWeight = Math.min(distanceFromCenter / 200, 1.0); // 距离中心越远，调整权重越大
        
        // 应用调整
        const adjustment = targetShift * adjustmentIntensity * adjustmentWeight;
        pos.x += adjustment;
        
        if (Math.abs(adjustment) > 0.5) {
          adjustedNodes++;
          console.log(`⚖️ [节点调整] ${nodeId}: ${oldX.toFixed(1)} → ${pos.x.toFixed(1)} (调整: ${adjustment.toFixed(1)})`);
        }
      }
    });

    console.log(`⚖️ [重平衡] 完成，调整了 ${adjustedNodes} 个节点`);
  }

  /**
   * 计算智能端点位置 - 避免重叠的分布算法
   * @param {any} sourceNode - 源节点
   * @param {any} nodePosition - 节点位置
   * @param {any} nodeSize - 节点大小
   * @param {number} existingEndpointCount - 已存在的端点数量
   * @param {boolean} useOptimizedPosition - 是否使用优化后的位置
   * @returns {any} 计算出的端点位置
   */
  calculateIntelligentEndpointPosition(sourceNode, nodePosition, nodeSize, existingEndpointCount, useOptimizedPosition = false) {
    console.log(`🎯 [智能端点] 为节点 ${sourceNode.id} 计算智能端点位置，已有端点: ${existingEndpointCount}, 使用优化位置: ${useOptimizedPosition}`);

    // 🎯 关键修复1：根据阶段选择合适的位置源
    let correctedNodePosition = nodePosition;
    
    if (useOptimizedPosition && this.layoutModel && this.layoutModel.nodePositions) {
      // 在层级优化完成后，使用最新的优化位置
      const layoutPosition = this.layoutModel.nodePositions.get(sourceNode.id);
      if (layoutPosition && layoutPosition.x !== undefined && !isNaN(layoutPosition.x)) {
        correctedNodePosition = {
          x: layoutPosition.x,
          y: layoutPosition.y || nodePosition.y
        };
        console.log(`🔄 [优化位置] 节点 ${sourceNode.id} 使用层级优化后位置: (${layoutPosition.x}, ${layoutPosition.y})`);
      }
    } else {
      // 在初始创建阶段，使用原始位置
      console.log(`📍 [初始位置] 节点 ${sourceNode.id} 使用原始位置: (${nodePosition.x}, ${nodePosition.y})`);
    }

    // 🎯 关键修复2：预先检查源节点位置的合理性，避免异常传播
    if (Math.abs(correctedNodePosition.x) > 250) {
      console.warn(`⚠️ [源节点位置异常] 节点 ${sourceNode.id} 源位置X坐标异常: ${correctedNodePosition.x}，进行预修正`);
      correctedNodePosition = {
        x: correctedNodePosition.x > 0 ? 200 : -200, // 限制在合理范围内
        y: correctedNodePosition.y
      };
      console.log(`🛡️ [源位置修正] 节点 ${sourceNode.id} 修正后源位置: (${correctedNodePosition.x}, ${correctedNodePosition.y})`);
    }

    // 🎯 关键修复3：根据阶段使用不同的X坐标计算策略
    let baseX;
    if (useOptimizedPosition) {
      // 优化阶段：使用更保守的计算，避免过大偏移
      const nodeWidth = nodeSize.width || 120;
      const conservativeOffset = Math.min(nodeWidth * 0.4, 40); // 最多40像素偏移
      baseX = correctedNodePosition.x + conservativeOffset;
      console.log(`🎯 [优化计算] 节点宽度: ${nodeWidth}, 保守偏移: ${conservativeOffset}`);
    } else {
      // 初始阶段：使用保守的固定偏移
      baseX = correctedNodePosition.x + 30; // 减少初始偏移
    }
    
    const baseY = correctedNodePosition.y + (nodeSize.height || 40) / 2;

    // 🎯 关键修复3：验证计算结果的合理性
    if (Math.abs(baseX) > 300) {
      console.warn(`⚠️ [异常检测] 节点 ${sourceNode.id} 计算出异常X坐标: ${baseX}，使用默认值`);
      const fallbackX = correctedNodePosition.x > 0 ? 100 : -100; // 根据源节点位置选择合理的默认值
      const finalPosition = {
        x: fallbackX,
        y: baseY
      };
      console.log(`🛡️ [异常修复] 节点 ${sourceNode.id} 使用安全坐标: (${finalPosition.x}, ${finalPosition.y})`);
      return finalPosition;
    }

    // 分析同层级现有端点分布
    const sameLayerEndpoints = this.analyzeSameLayerEndpoints(sourceNode, correctedNodePosition);
    console.log(`🎯 [同层分析] 同层级端点数量: ${sameLayerEndpoints.length}`);

    // 计算最优X坐标偏移，避免重叠
    const optimalXOffset = this.calculateOptimalXOffset(
      baseX,
      sameLayerEndpoints,
      existingEndpointCount
    );

    // 计算最优Y坐标微调，增加视觉层次
    const optimalYOffset = this.calculateOptimalYOffset(
      baseY,
      sameLayerEndpoints,
      existingEndpointCount
    );

    const finalPosition = {
      x: baseX + optimalXOffset,
      y: baseY + optimalYOffset
    };

    // 🎯 关键修复4：最终验证和边界限制
    if (Math.abs(finalPosition.x) > 250) {
      console.warn(`⚠️ [边界限制] 端点X坐标超出合理范围: ${finalPosition.x}，进行限制`);
      finalPosition.x = Math.sign(finalPosition.x) * Math.min(Math.abs(finalPosition.x), 250);
    }

    console.log(
      `🎯 [智能端点] 节点 ${sourceNode.id} 端点位置: (${finalPosition.x.toFixed(1)}, ${finalPosition.y.toFixed(1)}) ` +
      `偏移: X+${optimalXOffset.toFixed(1)}, Y+${optimalYOffset.toFixed(1)}`
    );

    return finalPosition;
  }

  /**
   * 分析同层级端点分布
   * @param {any} sourceNode - 源节点
   * @param {any} nodePosition - 节点位置
   * @returns {any[]} 同层级端点位置数组
   */
  analyzeSameLayerEndpoints(sourceNode, nodePosition) {
    const sameLayerEndpoints = [];
    const layerTolerance = 50; // Y坐标容差

    // 检查已存在的端点位置
    if (this.layoutModel && this.layoutModel.nodePositions) {
      this.layoutModel.nodePositions.forEach((pos, nodeId) => {
        if (pos.nodeType === 'endpoint' && 
            Math.abs(pos.y - nodePosition.y) <= layerTolerance) {
          sameLayerEndpoints.push({
            nodeId,
            x: pos.x,
            y: pos.y
          });
        }
      });
    }

    return sameLayerEndpoints.sort((a, b) => a.x - b.x);
  }

  /**
   * 计算最优X坐标偏移
   * @param {number} baseX - 基础X坐标
   * @param {any[]} existingEndpoints - 现有端点
   * @param {number} endpointIndex - 端点索引
   * @returns {number} X坐标偏移量
   */
  calculateOptimalXOffset(baseX, existingEndpoints, endpointIndex) {
    if (existingEndpoints.length === 0) {
      return 0; // 第一个端点，无需偏移
    }

    const minSpacing = 25; // 减少最小间距要求
    const preferredSpacing = 35; // 减少首选间距

    // 检查基础位置是否与现有端点冲突
    const conflicts = existingEndpoints.filter(ep => 
      Math.abs(ep.x - baseX) < minSpacing
    );

    if (conflicts.length === 0) {
      return 0; // 无冲突，使用基础位置
    }

    // 寻找最佳插入位置
    const sortedX = existingEndpoints.map(ep => ep.x).sort((a, b) => a - b);
    
    // 尝试在现有端点之间插入
    for (let i = 0; i < sortedX.length - 1; i++) {
      const gap = sortedX[i + 1] - sortedX[i];
      if (gap >= preferredSpacing) {
        const insertX = sortedX[i] + gap / 2;
        const offset = insertX - baseX;
        // 限制偏移量，避免过大的移动
        return Math.sign(offset) * Math.min(Math.abs(offset), 50);
      }
    }

    // 如果无法插入，使用更保守的右侧偏移
    const rightmostX = Math.max(...sortedX);
    const rightOffset = rightmostX + preferredSpacing - baseX;
    // 限制右侧偏移量，避免端点过于分散
    return Math.sign(rightOffset) * Math.min(Math.abs(rightOffset), 60);
  }

  /**
   * 计算最优Y坐标偏移
   * @param {number} baseY - 基础Y坐标
   * @param {any[]} existingEndpoints - 现有端点
   * @param {number} endpointIndex - 端点索引
   * @returns {number} Y坐标偏移量
   */
  calculateOptimalYOffset(baseY, existingEndpoints, endpointIndex) {
    // 为端点添加轻微的Y坐标变化，增加视觉层次感
    const maxYVariation = 15; // 最大Y坐标变化
    const pattern = [-5, 5, -10, 10, -15, 15]; // 交替模式
    
    const offsetIndex = endpointIndex % pattern.length;
    return pattern[offsetIndex] || 0;
  }

  /**
   * 全局居中对齐 - 修复版，只负责Y轴居中，保护X轴分布
   * @param {Map} positions - 位置映射
   */
  centerAlignGlobalLayout(positions) {
    const allPositions = Array.from(positions.values());

    if (allPositions.length === 0) return;

    // 🎯 修复：只进行基础的位置有效性检查
    const validPositions = allPositions.filter(pos => {
      const isValid = pos.x !== undefined && pos.y !== undefined && 
                     !isNaN(pos.x) && !isNaN(pos.y);
      if (!isValid) {
        console.warn(`⚠️ [全局居中] 发现无效位置，已过滤:`, pos);
      }
      return isValid;
    });

    if (validPositions.length === 0) {
      console.warn("⚠️ [全局居中] 没有有效位置，跳过全局居中");
      return;
    }

    // 🎯 核心修复：全局居中只负责Y轴平移，不修改X轴分布
    const minY = Math.min(...validPositions.map(pos => pos.y));
    const offsetY = -minY;

    console.log(
      `🌍 [全局Y轴居中] Y轴边界: minY=${minY.toFixed(1)}, offsetY=${offsetY.toFixed(1)} (有效位置数: ${validPositions.length})`,
    );

    // 🎯 关键修复：只应用Y轴偏移，完全保护X轴分布
    positions.forEach((pos, nodeId) => {
      pos.y += offsetY;  // 只修改Y轴，保持X轴不变
      // pos.x 保持完全不变，由层级居中负责
    });

    console.log(
      `🌍 [全局居中完成] 仅进行Y轴居中，X轴分布完全保护`,
    );
  }

  /**
   * 检查是否为对称分布
   * @param {Array} xCoords - 排序后的X坐标数组
   * @returns {boolean} 是否对称
   */
  checkSymmetricDistribution(xCoords) {
    if (xCoords.length < 2) return false;
    
    // 检查是否接近对称分布的特征值
    const symmetricPatterns = [
      [-60, 60], // 2节点
      [-80, 0, 80], // 3节点
      [-90, -30, 30, 90], // 4节点
    ];
    
    for (const pattern of symmetricPatterns) {
      if (pattern.length === xCoords.length) {
        const matches = pattern.every((expected, index) => 
          Math.abs(xCoords[index] - expected) < 10
        );
        if (matches) return true;
      }
    }
    
    return false;
  }

  /**
   * 重新应用对称分布（增强版 - 支持混合层级）
   * @param {Array} layerNodes - 层级节点
   */
  reapplySymmetricDistribution(layerNodes) {
    // 🔧 关键修复：使用新的混合层级对称分布算法
    try {
      // 动态导入混合层级对称分布算法
      const MixedLayerSymmetricDistribution = require('./coordinate-refactor/strategies/MixedLayerSymmetricDistribution.js').default || 
                                              require('./coordinate-refactor/strategies/MixedLayerSymmetricDistribution.js').MixedLayerSymmetricDistribution;
      
      const distributionAlgorithm = new MixedLayerSymmetricDistribution();
      const optimizedPositions = distributionAlgorithm.optimizeLayer(layerNodes);
      
      // 应用优化后的位置
      optimizedPositions.forEach(position => {
        const targetNode = layerNodes.find(node => 
          (node.nodeId || node.id) === position.nodeId
        );
        
        if (targetNode) {
          const oldX = targetNode.pos?.x || targetNode.x || 0;
          if (targetNode.pos) {
            targetNode.pos.x = position.x;
          } else {
            targetNode.x = position.x;
          }
          
          console.log(`🔧 [混合层级对称分布] ${position.nodeType}节点 ${position.nodeId}: ${oldX.toFixed(1)} → ${position.x.toFixed(1)}`);
        }
      });
      
      console.log(`✅ [混合层级对称分布] 完成 ${layerNodes.length} 个节点的优化分布`);
      
    } catch (error) {
      console.warn(`⚠️ [对称分布] 混合层级算法加载失败，使用备用算法:`, error.message);
      this.reapplySymmetricDistributionFallback(layerNodes);
    }
  }

  /**
   * 备用对称分布算法
   * @param {Array} layerNodes - 层级节点
   */
  reapplySymmetricDistributionFallback(layerNodes) {
    const nodeCount = layerNodes.length;
    let targetPositions = [];
    
    // 🔧 关键修复：根据节点类型和数量计算更合适的间距
    const hasEndpoints = layerNodes.some(node => node.nodeType === 'endpoint');
    const normalNodes = layerNodes.filter(node => node.nodeType !== 'endpoint');
    const endpointNodes = layerNodes.filter(node => node.nodeType === 'endpoint');
    
    console.log(`🔄 [备用对称分布] 层级节点分析:`, {
      总数: nodeCount,
      普通节点: normalNodes.length,
      虚拟端点: endpointNodes.length,
      混合层级: hasEndpoints
    });
    
    if (nodeCount === 2) {
      // 双节点对称分布 - 使用更大的间距确保清晰度
      const spacing = hasEndpoints ? 120 : 160; // endpoint间距稍小
      targetPositions = [-spacing/2, spacing/2];
    } else if (nodeCount === 3) {
      // 三节点对称分布 - 中心对齐
      const spacing = hasEndpoints ? 100 : 120;
      targetPositions = [-spacing, 0, spacing];
    } else if (nodeCount === 4) {
      // 四节点对称分布
      const spacing = hasEndpoints ? 80 : 100;
      targetPositions = [-spacing*1.5, -spacing*0.5, spacing*0.5, spacing*1.5];
    } else {
      // 动态对称分布 - 根据节点类型调整间距
      const baseSpacing = hasEndpoints ? 80 : 120;
      const spacing = Math.max(60, Math.min(baseSpacing, 300 / (nodeCount - 1)));
      const totalWidth = (nodeCount - 1) * spacing;
      const startX = -totalWidth / 2;
      targetPositions = Array.from({length: nodeCount}, (_, i) => startX + i * spacing);
    }
    
    // 🔧 关键修复：按节点类型、层级关系和模块分组排序，而非X坐标排序
    layerNodes.sort((a, b) => {
      const aId = a.nodeId || a.id;
      const bId = b.nodeId || b.id;
      
      // 第一优先级：开始节点永远在最前面
      if (aId && aId.includes('start')) return -1;
      if (bId && bId.includes('start')) return 1;
      
      // 第二优先级：结束节点永远在最后面
      if (aId && aId.includes('end')) return 1;
      if (bId && bId.includes('end')) return -1;
      
      // 第三优先级：按节点类型分组（普通节点优先于endpoint）
      if (a.nodeType !== b.nodeType) {
        if (a.nodeType === 'endpoint') return 1;
        if (b.nodeType === 'endpoint') return -1;
      }
      
      // 第四优先级：按模块功能分组（基于节点类型）
      const getNodeTypeOrder = (nodeId) => {
        if (!nodeId) return 8;
        if (nodeId.includes('audience')) return 1;
        if (nodeId.includes('event')) return 2;
        if (nodeId.includes('sms')) return 3;
        if (nodeId.includes('ai-call')) return 4;
        if (nodeId.includes('manual-call')) return 5;
        if (nodeId.includes('ab-test')) return 6;
        if (nodeId.includes('wait')) return 7;
        return 8; // 其他节点
      };
      
      const aTypeOrder = getNodeTypeOrder(aId);
      const bTypeOrder = getNodeTypeOrder(bId);
      if (aTypeOrder !== bTypeOrder) {
        return aTypeOrder - bTypeOrder;
      }
      
      // 最后：按创建时间或ID稳定排序（避免随机性）
      return (aId || '').localeCompare(bId || '');
    });
    
    // 应用目标位置
    layerNodes.forEach((item, index) => {
      if (index < targetPositions.length) {
        const oldX = item.pos.x;
        item.pos.x = targetPositions[index];
        console.log(`🔧 [备用对称恢复] ${item.nodeType || '普通'}节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetPositions[index]}`);
      }
    });
    
    console.log(`✅ [备用对称分布] 完成 ${nodeCount} 个节点的对称分布，目标位置:`, targetPositions);
  }

  /**
   * 美学优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  applyAestheticOptimizations(positions, layerStructure) {
    // 美学优化可以在这里添加更多细节
    console.log("✨ [美学优化] 应用美学优化");
  }

  /**
   * 优化版本的位置应用方法
   * @param {Map} finalPositions - 最终位置映射
   */
  async applyPositionsToGraphOptimized(finalPositions) {
    console.log("📍 [优化位置应用] 开始优化版本的位置应用");

    try {
      // 使用性能优化器进行批处理应用
      const optimizedResult = await this.performanceOptimizer.optimizeBatchOperation(
        async () => {
          // 使用AI外呼节点验证器验证节点配置
          const validationResults = new Map();
          for (const [nodeId, position] of finalPositions) {
            const graphNode = this.graph.getCellById(nodeId);
            if (graphNode) {
              const validationResult = this.aiCallValidator.validateAICallNode(graphNode);
              validationResults.set(nodeId, validationResult);
            }
          }

          // 应用位置
          return await this.applyPositionsToGraph(finalPositions);
        },
        this,
        { 
          batchSize: 50,
          delay: 10,
          enableCache: true 
        }
      );

      console.log("✅ [优化位置应用] 优化版本应用完成");
      return optimizedResult;

    } catch (error) {
      console.error('❌ [优化位置应用] 优化版本失败，回退到标准方法:', error);
      return await this.applyPositionsToGraph(finalPositions);
    }
  }

  /**
   * 应用位置到图形
   * @param {Map} finalPositions - 最终位置映射
   */
  async applyPositionsToGraph(finalPositions) {
    console.log("📍 [位置应用] 开始应用位置到图形");

    // 🎯 关键修复：预先验证和修正同层Y坐标一致性
    this.validateAndFixLayerYCoordinates(finalPositions);

    let appliedCount = 0;
    let endpointCount = 0;
    let forcedYCorrections = 0;

    finalPositions.forEach((position, nodeId) => {
      // 🎯 关键修复：验证位置数据的有效性，防止异常偏移
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        console.error(`❌ [位置应用] 节点 ${nodeId} 位置数据无效:`, position);
        return;
      }

      // 🎯 关键修复：检测异常的X坐标偏移（如418.2px的异常值）
      if (Math.abs(position.x) > 300) {
        console.warn(`⚠️ [异常坐标] 节点 ${nodeId} X坐标异常: ${position.x}，可能存在计算错误`);
        // 对于异常的X坐标，使用0作为默认值
        position.x = 0;
        console.log(`🔧 [坐标修正] 节点 ${nodeId} X坐标已修正为: 0`);
      }

      // 🎯 关键：统一计算中心点位置，确保Y坐标一致
      const centerPosition = {
        x: position.x,
        y: position.y, // 直接使用层级计算的Y坐标
      };

      // 处理普通节点
      const graphNode = this.graph.getCellById(nodeId);
      if (graphNode) {
        const size = graphNode.getSize();
        const topLeftPosition = {
          x: centerPosition.x - size.width / 2,
          y: centerPosition.y - size.height / 2,
        };
        
        // 🎯 关键修复：系统设置位置时添加特殊标识，区分系统操作和用户操作
        graphNode.setPosition(topLeftPosition, { 
          silent: false,
          systemInitiated: true, // 🔧 新增：标识这是系统发起的位置变更
          layoutEngine: true,    // 🔧 新增：标识这是布局引擎操作
          source: 'UnifiedStructuredLayoutEngine' // 🔧 新增：标识操作来源
        });
        
        // 🎯 关键修复：验证位置是否正确应用
        const actualPosition = graphNode.getPosition();
        if (Math.abs(actualPosition.y - topLeftPosition.y) > 1) {
          console.warn(`⚠️ [Y坐标修正] 节点 ${nodeId} Y坐标应用失败，强制重新设置`);
          graphNode.setPosition({ x: topLeftPosition.x, y: topLeftPosition.y }, { 
            silent: false,
            systemInitiated: true,
            layoutEngine: true,
            source: 'UnifiedStructuredLayoutEngine-correction'
          });
          forcedYCorrections++;
        }
        
        appliedCount++;

        console.log(
          `📍 [位置应用] 普通节点 ${nodeId}: 中心点(${centerPosition.x.toFixed(1)}, ${centerPosition.y.toFixed(1)}) 左上角(${topLeftPosition.x.toFixed(1)}, ${topLeftPosition.y.toFixed(1)}) 层级: ${position.layerIndex}`,
        );
        return;
      }

      // 🎯 关键：处理虚拟endpoint节点 - 使用与同层节点相同的Y坐标
      const endpointNode = this.layoutModel.endpointNodes.get(nodeId);
      if (endpointNode) {
        // 🎯 关键修复：虚拟endpoint使用与同层节点相同的Y坐标
        if (endpointNode.setPosition) {
          endpointNode.setPosition(centerPosition);
        } else if (endpointNode.position) {
          endpointNode.position.x = centerPosition.x;
          endpointNode.position.y = centerPosition.y;
        }

        // 🎯 关键修复：延迟到批量同步阶段，避免重复调用
        // this.updatePreviewEndpointPosition(
        //   endpointNode.sourceNodeId,
        //   endpointNode.branchId,
        //   centerPosition,
        // );

        endpointCount++;

        console.log(
          `📍 [位置应用] 虚拟Endpoint ${nodeId}: 中心点(${centerPosition.x.toFixed(1)}, ${centerPosition.y.toFixed(1)}) 源节点: ${endpointNode.sourceNodeId} 分支: ${endpointNode.branchId} 层级: ${position.layerIndex}`,
        );
      }
    });

    console.log(
      `📍 [位置应用] 应用完成: ${appliedCount}个普通节点 + ${endpointCount}个虚拟endpoint + ${forcedYCorrections}个Y坐标强制修正`,
    );

    // 🎯 关键修复：位置应用后再次验证Y坐标一致性
    this.postApplyYCoordinateValidation(finalPositions);

    // 🎯 关键修复：统一批量同步所有Endpoint位置，避免重复调用
    console.log("🔄 [批量同步] 开始统一同步所有Endpoint位置");
    this.syncAllEndpointPositions(finalPositions);
  }

  /**
   * 🎯 关键修复：验证和修正同层Y坐标一致性
   * @param {Map} finalPositions - 最终位置映射
   */
  validateAndFixLayerYCoordinates(finalPositions) {
    console.log("🔍 [Y坐标验证] 开始验证同层Y坐标一致性");

    // 按层级分组
    const layerGroups = new Map();
    finalPositions.forEach((position, nodeId) => {
      const layerIndex = position.layerIndex;
      if (!layerGroups.has(layerIndex)) {
        layerGroups.set(layerIndex, []);
      }
      layerGroups.get(layerIndex).push({ nodeId, position });
    });

    let fixedLayers = 0;
    let fixedNodes = 0;

    // 验证每层的Y坐标一致性
    layerGroups.forEach((nodes, layerIndex) => {
      if (nodes.length <= 1) return;

      console.log(`🔍 [层级验证] 检查第 ${layerIndex} 层，共 ${nodes.length} 个节点`);

      // 计算层级标准Y坐标（使用理论层级Y坐标）
      const standardY = layerIndex * this.options.layer.baseHeight;
      let hasInconsistency = false;

      // 检查是否有不一致的Y坐标
      nodes.forEach(({ nodeId, position }) => {
        const deviation = Math.abs(position.y - standardY);
        if (deviation > 1) {
          console.warn(`⚠️ [Y坐标不一致] 层级 ${layerIndex} 节点 ${nodeId}: ${position.y.toFixed(1)} ≠ ${standardY.toFixed(1)} (偏差: ${deviation.toFixed(1)}px)`);
          hasInconsistency = true;
        }
      });

      // 如果有不一致，强制修正为标准Y坐标
      if (hasInconsistency) {
        nodes.forEach(({ nodeId, position }) => {
          const deviation = Math.abs(position.y - standardY);
          if (deviation > 1) {
            const oldY = position.y;
            position.y = standardY;
            console.log(`🔧 [Y坐标修正] 节点 ${nodeId}: ${oldY.toFixed(1)} → ${standardY.toFixed(1)} (修正偏差: ${deviation.toFixed(1)}px)`);
            fixedNodes++;

            // 🎯 关键修复：同步虚拟endpoint节点的内部位置
            this.syncVirtualEndpointPosition(nodeId, { x: position.x, y: standardY });
          }
        });
        fixedLayers++;
      }
    });

    console.log(`🔍 [Y坐标验证] 完成，修正了 ${fixedLayers} 个层级的 ${fixedNodes} 个节点`);
  }



  /**
   * 🎯 新增：同步虚拟endpoint节点的内部位置
   * @param {string} nodeId - 节点ID
   * @param {Object} position - 新位置 {x, y}
   */
  syncVirtualEndpointPosition(nodeId, position) {
    const endpointNode = this.layoutModel.endpointNodes.get(nodeId);
    if (endpointNode && endpointNode.setPosition) {
      endpointNode.setPosition(position);
      console.log(`🎯 [同步修复] 虚拟endpoint ${nodeId} 内部位置已同步: (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
    }
  }

  /**
   * 🎯 关键修复：位置应用后Y坐标验证
   * @param {Map} finalPositions - 最终位置映射
   */
  postApplyYCoordinateValidation(finalPositions) {
    console.log("🔍 [后验证] 开始位置应用后Y坐标验证");

    let validationErrors = 0;

    finalPositions.forEach((position, nodeId) => {
      const graphNode = this.graph.getCellById(nodeId);
      if (graphNode) {
        const actualPosition = graphNode.getPosition();
        const size = graphNode.getSize();
        const actualCenterY = actualPosition.y + size.height / 2;
        const expectedCenterY = position.y;

        if (Math.abs(actualCenterY - expectedCenterY) > 1) {
          console.error(`❌ [后验证] 节点 ${nodeId} Y坐标验证失败: 实际=${actualCenterY.toFixed(1)}, 期望=${expectedCenterY.toFixed(1)}, 差异=${Math.abs(actualCenterY - expectedCenterY).toFixed(1)}`);
          validationErrors++;
        }
      }
    });

    if (validationErrors === 0) {
      console.log("✅ [后验证] 所有节点Y坐标验证通过");
    } else {
      console.error(`❌ [后验证] 发现 ${validationErrors} 个Y坐标验证错误`);
    }
  }

  /**
   * 生成布局报告
   * @param {Object} layerStructure - 层级结构
   * @param {Map} finalPositions - 最终位置
   * @returns {Object} 布局报告
   */
  generateLayoutReport(layerStructure, finalPositions) {
    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      statistics: {
        totalLayers: layerStructure.totalLayers,
        totalNodes: finalPositions.size,
        normalNodes: 0,
        endpointNodes: 0,
        layerDistribution: [],
      },
      performance: {
        executionTime: Date.now() - this.startTime,
        optimizationIterations: this.layoutModel.optimizationHistory.length,
      },
      message: "统一结构化布局执行成功",
    };

    // 统计节点类型分布
    finalPositions.forEach((position, nodeId) => {
      if (position.nodeType === "endpoint") {
        report.statistics.endpointNodes++;
      } else {
        report.statistics.normalNodes++;
      }
    });

    // 统计层级分布
    layerStructure.layers.forEach((layer, index) => {
      const normalCount = layer.filter((n) => !n.isEndpoint).length;
      const endpointCount = layer.filter((n) => n.isEndpoint).length;

      report.statistics.layerDistribution.push({
        layer: index,
        normalNodes: normalCount,
        endpointNodes: endpointCount,
        total: layer.length,
      });
    });

    console.log("📊 [布局报告]", report);

    // 🎯 关键修复：布局完成后执行预览线清理
    this.performPostLayoutCleanup();

    return report;
  }

  /**
   * 🎯 关键修复：同步所有endpoint位置到预览线管理器
   * @param {Map} finalPositions - 最终位置映射
   */
  syncAllEndpointPositions(finalPositions) {
    console.log("🔄 [批量同步] 开始同步所有endpoint位置到预览线管理器");

    const previewLineManager =
      this.previewLineManager ||
      window.unifiedPreviewLineManager ||
      this.graph.previewLineManager;

    if (!previewLineManager) {
      console.warn("⚠️ [批量同步] 预览线管理器不可用，跳过同步");
      return;
    }

    let syncedCount = 0;

    // 遍历所有endpoint节点
    this.layoutModel.endpointNodes.forEach((endpointNode, nodeId) => {
      const position = finalPositions.get(nodeId);
      if (position) {
        // 强制更新预览线管理器中的对应endpoint位置
        this.updatePreviewEndpointPosition(
          endpointNode.sourceNodeId,
          endpointNode.branchId,
          { x: position.x, y: position.y },
        );
        syncedCount++;

        console.log(
          `🔄 [批量同步] Endpoint ${nodeId}: 源节点=${endpointNode.sourceNodeId}, 分支=${endpointNode.branchId}, 位置=(${position.x.toFixed(1)}, ${position.y.toFixed(1)})`,
        );
      }
    });

    // 🎯 关键修复：强制更新预览线管理器的全局endPosition
    if (
      previewLineManager.endPosition &&
      this.layoutModel.endpointNodes.size > 0
    ) {
      // 使用最后一个endpoint的位置作为全局endPosition
      const lastEndpointPosition = Array.from(finalPositions.values())
        .filter((pos) => pos.nodeType === "endpoint")
        .pop();

      if (lastEndpointPosition) {
        previewLineManager.endPosition.x = lastEndpointPosition.x;
        previewLineManager.endPosition.y = lastEndpointPosition.y;
        console.log(
          `🎯 [全局同步] 预览线管理器全局endPosition已更新: (${lastEndpointPosition.x.toFixed(1)}, ${lastEndpointPosition.y.toFixed(1)})`,
        );
      }
    }

    console.log(`🔄 [批量同步] 同步完成，共处理 ${syncedCount} 个endpoint位置`);

    // 🎯 新增：调用预览线管理器的新同步方法
    if (typeof previewLineManager.syncLayoutEndpointPositions === 'function') {
      try {
        previewLineManager.syncLayoutEndpointPositions(finalPositions);
        console.log("✅ [新同步方法] 已调用预览线管理器的布局endpoint位置同步方法");
      } catch (error) {
        console.error("❌ [新同步方法] 调用新同步方法时发生错误:", error);
      }
    } else {
      console.warn("⚠️ [新同步方法] 预览线管理器不支持新的同步方法");
    }
  }

  /**
   * 🎯 新增：验证虚拟endpoint位置映射
   */
  validateEndpointPositions() {
    if (
      !this.layoutModel ||
      !this.layoutModel.nodePositions ||
      !this.layoutModel.endpointNodes
    ) {
      console.warn("⚠️ [位置验证] 布局模型未完全初始化，跳过验证");
      return;
    }

    let missingCount = 0;
    let fixedCount = 0;

    console.log("🔍 [位置验证] 开始验证虚拟endpoint位置映射");

    this.layoutModel.endpointNodes.forEach((endpointNode, nodeId) => {
      if (!this.layoutModel.nodePositions.has(nodeId)) {
        missingCount++;
        console.log(`⚠️ [位置验证] 发现缺失位置映射: ${nodeId}`);

        // 自动补全缺失的位置映射
        const sourcePosition = this.layoutModel.nodePositions.get(
          endpointNode.sourceNodeId,
        );
        if (sourcePosition) {
          const estimatedPosition = {
            x: sourcePosition.x + 150, // 默认水平偏移
            y: sourcePosition.y + 150, // 默认垂直偏移
            nodeType: "endpoint",
            sourceNodeId: endpointNode.sourceNodeId,
            branchId: endpointNode.branchId,
            isVirtual: true,
            isAutoFixed: true,
          };

          this.layoutModel.nodePositions.set(nodeId, estimatedPosition);
          fixedCount++;
          console.log(
            `🔧 [位置修复] 自动补全虚拟endpoint位置: ${nodeId} -> (${estimatedPosition.x}, ${estimatedPosition.y})`,
          );
        } else {
          console.warn(
            `⚠️ [位置修复] 无法找到源节点位置，跳过修复: ${endpointNode.sourceNodeId}`,
          );
        }
      }
    });

    if (missingCount > 0) {
      console.log(
        `🔧 [位置验证] 验证完成 - 发现 ${missingCount} 个缺失位置，已修复 ${fixedCount} 个`,
      );
    } else {
      console.log("✅ [位置验证] 所有虚拟endpoint位置映射正常");
    }

    return { missingCount, fixedCount };
  }

  /**
   * 🎯 关键修复：布局完成后执行清理工作
   * 清理孤立的预览线和无效的endpoint
   */
  performPostLayoutCleanup() {
    console.log("🧹 [布局后清理] 开始执行布局完成后的清理工作");

    // 获取预览线管理器
    const previewLineManager =
      this.previewLineManager ||
      window.unifiedPreviewLineManager ||
      this.graph?.previewLineManager;

    if (!previewLineManager) {
      console.warn("⚠️ [布局后清理] 预览线管理器不可用，跳过清理");
      return;
    }

    // 🎯 关键修复：设置布局完成时间标记
    previewLineManager.lastLayoutTime = Date.now();
    console.log("⏰ [布局时间标记] 已设置布局完成时间，用于预览线清理判断");

    // 🎯 关键修复：增加更长的延迟，确保虚拟endpoint创建完全完成
    setTimeout(() => {
      try {
        // 🎯 新增：检查虚拟endpoint是否已创建完成
        const nodes = this.graph.getNodes();
        const virtualEndpoints = nodes.filter(node => {
          const nodeData = node.getData() || {};
          return nodeData.isEndpoint && nodeData.isVirtual;
        });
        
        console.log(`🔍 [布局后清理] 检测到 ${virtualEndpoints.length} 个虚拟endpoint节点`);
        
        // 如果有虚拟endpoint，延迟清理以保护它们的预览线
        if (virtualEndpoints.length > 0) {
          console.log("⏭️ [布局后清理] 检测到虚拟endpoint，延迟清理以保护endpoint预览线");
          
          // 再次延迟清理
          setTimeout(() => {
            this.executeDelayedCleanup(previewLineManager);
          }, 1500); // 额外1.5秒延迟
          
          return;
        }
        
        // 没有虚拟endpoint时，正常执行清理
        this.executeDelayedCleanup(previewLineManager);

      } catch (error) {
        console.error("❌ [布局后清理] 清理过程中发生错误:", error);
      }
    }, 500); // 🎯 增加延迟到500ms，确保布局完全应用
  }

  /**
   * 🎯 新增：执行延迟清理
   * @param {Object} previewLineManager - 预览线管理器
   */
  executeDelayedCleanup(previewLineManager) {
    try {
      // 执行预览线清理
      if (typeof previewLineManager.performLoadCompleteCheck === 'function') {
        previewLineManager.performLoadCompleteCheck();
        console.log("✅ [延迟清理] 已触发预览线管理器的完整清理检查");
      } else if (typeof previewLineManager.cleanupOrphanedPreviewLines === 'function') {
        const cleanedCount = previewLineManager.cleanupOrphanedPreviewLines();
        console.log(`✅ [延迟清理] 清理了 ${cleanedCount} 条孤立预览线`);
      } else {
        console.warn("⚠️ [延迟清理] 预览线管理器不支持清理方法");
      }

      // 验证清理结果
      this.validateCleanupResults(previewLineManager);

    } catch (error) {
      console.error("❌ [延迟清理] 清理过程中发生错误:", error);
    }
  }

  /**
   * 验证清理结果
   * @param {Object} previewLineManager - 预览线管理器
   */
  validateCleanupResults(previewLineManager) {
    if (!previewLineManager.previewLines) {
      return;
    }

    const remainingPreviewLines = previewLineManager.previewLines.size;
    const totalNodes = this.graph.getNodes().length;
    const totalEdges = this.graph.getEdges().length;

    console.log("📊 [清理验证] 清理后状态统计:", {
      剩余预览线实例: remainingPreviewLines,
      总节点数: totalNodes,
      总边数: totalEdges,
      清理状态: remainingPreviewLines === 0 ? "完全清理" : "部分保留"
    });

    // 如果还有预览线，检查是否合理
    if (remainingPreviewLines > 0) {
      let validPreviewLines = 0;
      previewLineManager.previewLines.forEach((previewInstance, nodeId) => {
        const sourceNode = this.graph.getCellById(nodeId);
        if (sourceNode && !previewLineManager.hasExistingRealConnections(sourceNode)) {
          validPreviewLines++;
        }
      });

      console.log(`📊 [清理验证] 剩余 ${remainingPreviewLines} 个预览线实例中，${validPreviewLines} 个是有效的`);
    }
  }

  /**
   * 🚀 新增：生成布局缓存键
   * @returns {string} 缓存键
   */
  generateLayoutCacheKey() {
    const graph = this.graph;
    if (!graph) return 'no-graph';
    
    const nodes = graph.getNodes();
    const edges = graph.getEdges();
    
    // 基于节点和边的基本信息生成缓存键
    const nodeInfo = nodes.map(node => ({
      id: node.id,
      position: node.getPosition(),
      size: node.getSize()
    }));
    
    const edgeInfo = edges.map(edge => ({
      id: edge.id,
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId()
    }));
    
    return JSON.stringify({ nodes: nodeInfo, edges: edgeInfo });
  }
  
  /**
   * 🚀 新增：缓存布局结果
   * @param {string} key - 缓存键
   * @param {Object} result - 布局结果
   */
  cacheLayoutResult(key, result) {
    if (!this.layoutCache.enabled) return;
    
    // 检查缓存大小限制
    if (this.layoutCache.cache.size >= this.layoutCache.maxSize) {
      // 删除最旧的缓存项（LRU策略）
      const firstKey = this.layoutCache.cache.keys().next().value;
      this.layoutCache.cache.delete(firstKey);
    }
    
    this.layoutCache.cache.set(key, result);
    this.layoutCache.misses++;
    this.updateCacheHitRate();
    console.log(`💾 [布局缓存] 缓存布局结果，当前缓存大小: ${this.layoutCache.cache.size}`);
  }
  
  /**
   * 🚀 新增：更新缓存命中率
   */
  updateCacheHitRate() {
    const total = this.layoutCache.hits + this.layoutCache.misses;
    this.performanceMetrics.cacheHitRate = total > 0 ? (this.layoutCache.hits / total) * 100 : 0;
  }
  
  /**
   * 🚀 新增：更新性能指标
   * @param {number} duration - 布局持续时间（毫秒）
   */
  updatePerformanceMetrics(duration) {
    this.performanceMetrics.totalLayoutTime += duration;
    this.performanceMetrics.averageLayoutTime = 
      this.performanceMetrics.totalLayoutTime / this.performanceMetrics.layoutCount;
    this.performanceMetrics.lastLayoutDuration = duration;
    
    console.log(`📊 [性能监控] 布局耗时: ${duration}ms, 平均耗时: ${this.performanceMetrics.averageLayoutTime.toFixed(2)}ms`);
  }
  
  /**
   * 🚀 新增：清除布局缓存
   */
  clearLayoutCache() {
    this.layoutCache.cache.clear();
    this.layoutCache.hits = 0;
    this.layoutCache.misses = 0;
    this.updateCacheHitRate();
    console.log('🗑️ [布局缓存] 缓存已清除');
  }
  
  /**
   * 🔒 新增：锁定预览线刷新
   * @param {string} reason - 锁定原因
   */
  lockPreviewLineRefresh(reason = '布局计算中') {
    if (this.previewLineRefreshLocked) {
      console.warn(`⚠️ [预览线锁定] 已处于锁定状态，原因: ${this.lockReason}`);
      return false;
    }
    
    this.previewLineRefreshLocked = true;
    this.lockStartTime = Date.now();
    this.lockReason = reason;
    
    // 设置超时自动解锁
    this.lockTimeoutTimer = setTimeout(() => {
      console.warn(`⚠️ [预览线锁定] 锁定超时，自动解锁。原因: ${this.lockReason}`);
      this.unlockPreviewLineRefresh('超时自动解锁');
    }, this.LOCK_TIMEOUT);
    
    console.log(`🔒 [预览线锁定] 已锁定预览线刷新，原因: ${reason}`);
    return true;
  }
  
  /**
   * 🔒 新增：解锁预览线刷新
   * @param {string} reason - 解锁原因
   */
  unlockPreviewLineRefresh(reason = '布局计算完成') {
    if (!this.previewLineRefreshLocked) {
      console.warn(`⚠️ [预览线锁定] 当前未处于锁定状态`);
      return false;
    }
    
    const lockDuration = Date.now() - this.lockStartTime;
    
    this.previewLineRefreshLocked = false;
    this.lockStartTime = null;
    this.lockReason = null;
    
    // 清除超时定时器
    if (this.lockTimeoutTimer) {
      clearTimeout(this.lockTimeoutTimer);
      this.lockTimeoutTimer = null;
    }
    
    console.log(`🔓 [预览线锁定] 已解锁预览线刷新，原因: ${reason}，锁定时长: ${lockDuration}ms`);
    return true;
  }
  
  /**
   * 🔒 新增：检查预览线刷新是否被锁定
   * @returns {boolean} 是否被锁定
   */
  isPreviewLineRefreshLocked() {
    return this.previewLineRefreshLocked;
  }
  
  /**
   * 🔒 新增：获取锁定状态信息
   * @returns {Object} 锁定状态信息
   */
  getPreviewLineLockStatus() {
    return {
      locked: this.previewLineRefreshLocked,
      reason: this.lockReason,
      startTime: this.lockStartTime,
      duration: this.lockStartTime ? Date.now() - this.lockStartTime : 0
    };
  }

  /**
   * 🚀 新增：获取性能报告
   * @returns {Object} 性能报告
   */
  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      cacheInfo: {
        enabled: this.layoutCache.enabled,
        size: this.layoutCache.cache.size,
        maxSize: this.layoutCache.maxSize,
        hits: this.layoutCache.hits,
        misses: this.layoutCache.misses
      },
      debounceInfo: {
        delay: this.debounceConfig.delay,
        maxWait: this.debounceConfig.maxWait,
        isLayouting: this.isLayouting,
        hasPendingLayout: !!this.pendingLayoutPromise
      }
    };
  }


}
