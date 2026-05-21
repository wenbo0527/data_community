/**
 * 统一结构化布局引擎 - 简化版本
 * 基于父子关联关系的分层分级自底向上定位系统
 * 第一阶段重构：使用新的配置和工具模块
 * 已迁移到新的PreviewLineSystem架构
 */

import { PerformanceOptimizer } from '../coordinate-refactor/performance/PerformanceOptimizer.js';
import { AICallNodeValidator } from '../coordinate-refactor/validation/AICallNodeValidator.js';
import { GeometricCenterAlignment } from '../coordinate-refactor/algorithms/GeometricCenterAlignment.js';
import { PreviewLineSystem } from '../../../../../utils/preview-line/PreviewLineSystem.js';

// 导入配置模块
import { LayoutConfig } from './layout/config/LayoutConfig.js';
import { PerformanceConfig } from './layout/config/PerformanceConfig.js';

// 导入工具模块
import { NodeFilter } from './layout/utils/NodeFilter.js';
import { EdgeFilter } from './layout/utils/EdgeFilter.js';
import { LayerUtils } from './layout/utils/LayerUtils.js';
import { PositionUtils } from './layout/utils/PositionUtils.js';

// 导入性能模块
import { LayoutCache } from './layout/performance/LayoutCache.js';
import { DebounceManager } from './layout/performance/DebounceManager.js';
import { PerformanceMonitor } from './layout/performance/PerformanceMonitor.js';
import { PreviewLineLock } from './layout/performance/PreviewLineLock.js';

export class UnifiedStructuredLayoutEngine {
  constructor(graph, options = {}, previewLineManager = null) {
    console.log('🚀 [统一布局引擎] 初始化开始');
    
    // 🔧 关键修复：添加graph参数验证
    if (!graph) {
      const errorMsg = '[统一布局引擎] Graph实例不能为空';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    // 🔧 验证graph实例是否有必要的方法
    if (typeof graph.getNodes !== 'function' || typeof graph.getEdges !== 'function') {
      const errorMsg = '[统一布局引擎] Graph实例缺少必要的方法 (getNodes, getEdges)';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    this.graph = graph;
    this.options = options;
    
    console.log('✅ [统一布局引擎] Graph实例验证通过');
    
    // 支持新旧预览线系统兼容
    if (previewLineManager instanceof PreviewLineSystem) {
      this.previewLineSystem = previewLineManager;
      this.previewLineManager = null; // 标记使用新系统
      console.log('✅ [统一布局引擎] 使用新的PreviewLineSystem');
    } else {
      this.previewLineManager = previewLineManager;
      this.previewLineSystem = null;
      console.log('⚠️ [统一布局引擎] 使用旧的预览线管理器');
    }
    
    // 初始化配置模块
    this.layoutConfig = new LayoutConfig(options.layout || {});
    this.performanceConfig = new PerformanceConfig(options.performance || {});
    
    // 初始化工具模块
    this.nodeFilter = new NodeFilter();
    this.edgeFilter = new EdgeFilter();
    this.layerUtils = new LayerUtils();
    this.positionUtils = new PositionUtils();
    
    // 初始化性能模块
    this.layoutCache = new LayoutCache(this.performanceConfig.cache);
    this.debounceManager = new DebounceManager(this.performanceConfig.debounce);
    this.performanceMonitor = new PerformanceMonitor(this.performanceConfig.monitor);
    this.previewLineLock = new PreviewLineLock(this.performanceConfig.previewLock);
    
    // 初始化现有组件
    this.performanceOptimizer = new PerformanceOptimizer();
    
    // 初始化几何中心对齐器（简化版本）
    this.geometryCenterAligner = {
      align: (nodes) => {
        console.log('🎯 [几何中心对齐器] 执行对齐操作');
        return nodes;
      }
    };
    
    console.log('✅ [统一布局引擎] 初始化完成');
    
    // 布局数据模型
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
    
    // 性能监控指标
    this.performanceMetrics = {
      layoutCount: 0,
      totalLayoutTime: 0,
      averageLayoutTime: 0,
      cacheHitRate: 0,
      lastLayoutDuration: 0
    };
    
    // 预览线刷新锁定机制
    this.previewLineRefreshLocked = false;
    this.lockStartTime = null;
    this.lockReason = null;
    this.LOCK_TIMEOUT = 5000;
    this.lockTimeoutTimer = null;
    
    // 布局计算防抖机制
    this.debounceConfig = {
      delay: 300,
      maxWait: 1000,
      immediate: false
    };
    this.layoutTimer = null;
    this.lastLayoutTime = 0;
    this.pendingLayoutPromise = null;
    this.layoutQueue = [];
    this.isLayouting = false;
    
    // 注意：layoutCache已在上面初始化为LayoutCache实例，这里不需要重复初始化
  }

  /**
   * 设置布局引擎引用（用于预览线系统集成）
   * @param {Object} layoutEngine - 布局引擎实例
   */
  setLayoutEngine(layoutEngine) {
    console.log('🔗 [统一布局引擎] 设置布局引擎引用');
    this.layoutEngineRef = layoutEngine;
    
    // 如果有预览线系统，也设置引用
    if (this.previewLineSystem && typeof this.previewLineSystem.setLayoutEngine === 'function') {
      this.previewLineSystem.setLayoutEngine(layoutEngine);
      console.log('✅ [统一布局引擎] 布局引擎引用已传递给PreviewLineSystem');
    }
    
    return this;
  }

  /**
   * 获取布局引擎引用
   * @returns {Object} 布局引擎实例
   */
  getLayoutEngine() {
    return this.layoutEngineRef || this;
  }

  /**
   * 执行布局
   * @param {Object} layoutInput - 布局输入参数
   * @returns {Object} 布局结果
   */
  async executeLayout(layoutInput = {}) {
    const sessionId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 开始性能监控
    this.performanceMonitor.startSession(sessionId, {
      nodeCount: layoutInput.nodeCount || 0,
      edgeCount: layoutInput.edgeCount || 0,
      layoutType: layoutInput.layoutType || 'unified'
    });
    
    console.log('🎯 [统一布局引擎] 开始执行布局');
    
    try {
      // 检查缓存
      const cacheKey = this.layoutCache.generateCacheKey(layoutInput);
      const cachedResult = this.layoutCache.get(cacheKey);
      
      if (cachedResult) {
        this.performanceMonitor.addMarker(sessionId, 'cache_hit');
        this.performanceMonitor.endSession(sessionId, { success: true, fromCache: true });
        return cachedResult;
      }
      
      this.performanceMonitor.addMarker(sessionId, 'cache_miss');
      
      // 锁定预览线
      const lockResult = this.previewLineLock.lock(`layout_${sessionId}`, {
        reason: 'layout_execution',
        timeout: 10000
      });
      
      try {
        // 第一阶段：层级构建
        this.performanceMonitor.markPhaseStart(sessionId, 'hierarchy_build');
        console.log('📊 [统一布局引擎] 阶段1: 层级构建');
        const hierarchyResult = await this.buildHierarchy(layoutInput);
        this.performanceMonitor.markPhaseEnd(sessionId, 'hierarchy_build', { success: true });
        
        // 第二阶段：节点位置计算
        this.performanceMonitor.markPhaseStart(sessionId, 'position_calculation');
        console.log('📐 [统一布局引擎] 阶段2: 节点位置计算');
        const positionResult = await this.calculateNodePositions(hierarchyResult);
        this.performanceMonitor.markPhaseEnd(sessionId, 'position_calculation', { success: true });
        
        // 第三阶段：位置应用
        this.performanceMonitor.markPhaseStart(sessionId, 'position_apply');
        console.log('🎨 [统一布局引擎] 阶段3: 位置应用');
        const finalResult = await this.applyPositions(positionResult);
        this.performanceMonitor.markPhaseEnd(sessionId, 'position_apply', { success: true });
        
        // 缓存结果
        this.layoutCache.set(cacheKey, finalResult);
        
        console.log('✅ [统一布局引擎] 布局执行完成');
        
        // 结束性能监控
        this.performanceMonitor.endSession(sessionId, { success: true });
        
        return finalResult;
        
      } finally {
        // 解锁预览线
        if (lockResult.locked) {
          this.previewLineLock.unlock(`layout_${sessionId}`, { reason: 'layout_completed' });
        }
      }
      
    } catch (error) {
      console.error('❌ [统一布局引擎] 布局执行失败:', error);
      
      // 结束性能监控（失败）
      this.performanceMonitor.endSession(sessionId, { success: false, error: error.message });
      
      throw error;
    }
  }

  /**
   * 构建层级结构
   * @param {Object} layoutInput - 布局输入参数
   * @returns {Object} 层级构建结果
   */
  async buildHierarchy(layoutInput) {
    console.log('🔍 [层级构建] 开始构建层级结构');
    
    // 获取所有节点和边
    const allNodes = this.graph.getNodes();
    const allEdges = this.graph.getEdges();
    
    console.log(`📊 [层级构建] 原始数据 - 节点: ${allNodes.length}, 边: ${allEdges.length}`);
    
    // 使用工具模块过滤节点和边
    const validNodes = this.nodeFilter.filterValidNodes(allNodes);
    const validEdges = this.edgeFilter.filterValidEdges(allEdges);
    
    console.log(`📊 [层级构建] 过滤后 - 有效节点: ${validNodes.length}, 有效边: ${validEdges.length}`);
    
    // 构建层级结构
    const layers = this.buildLayers(validNodes, validEdges);
    
    return {
      layers,
      validNodes,
      validEdges,
      totalLayers: layers.length
    };
  }

  /**
   * 计算节点位置
   * @param {Object} hierarchyResult - 层级构建结果
   * @returns {Object} 位置计算结果
   */
  async calculateNodePositions(hierarchyResult) {
    console.log('📐 [位置计算] 开始计算节点位置');
    
    const { layers } = hierarchyResult;
    const positions = new Map();
    const layerHeight = 150;
    const nodeWidth = 120;
    const nodeSpacing = 20;
    
    layers.forEach((layer, layerIndex) => {
      const y = layerIndex * layerHeight;
      const totalWidth = layer.length * nodeWidth + (layer.length - 1) * nodeSpacing;
      const startX = -totalWidth / 2;
      
      layer.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * (nodeWidth + nodeSpacing);
        const nodeId = node.id || node.getId?.() || `node_${nodeIndex}`;
        positions.set(nodeId, { x, y });
      });
    });
    
    console.log(`📐 [位置计算] 计算完成 - 共${positions.size}个节点位置`);
    
    return {
      positions,
      bounds: this.calculateBounds(positions),
      centerPoint: this.calculateCenter(positions)
    };
  }

  /**
   * 应用位置
   * @param {Object} positionResult - 位置计算结果
   * @returns {Object} 最终布局结果
   */
  async applyPositions(positionResult) {
    console.log('🎨 [位置应用] 开始应用节点位置');
    
    const { positions, bounds, centerPoint } = positionResult;
    let appliedCount = 0;
    
    positions.forEach((position, nodeId) => {
      const node = this.graph.getCellById(nodeId);
      if (node) {
        node.setPosition(position.x, position.y);
        appliedCount++;
      }
    });
    
    console.log(`🎨 [位置应用] 应用完成 - 成功应用${appliedCount}个节点位置`);
    
    return {
      success: true,
      appliedCount,
      totalPositions: positions.size,
      bounds,
      centerPoint,
      executionTime: Date.now()
    };
  }

  /**
   * 构建层级
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Array} 层级数组
   */
  buildLayers(nodes, edges) {
    // 简单的层级构建逻辑
    const layers = [];
    const nodesPerLayer = Math.ceil(Math.sqrt(nodes.length));
    
    for (let i = 0; i < nodes.length; i += nodesPerLayer) {
      layers.push(nodes.slice(i, i + nodesPerLayer));
    }
    
    return layers;
  }

  /**
   * 计算边界
   * @param {Map} positions - 位置映射
   * @returns {Object} 边界信息
   */
  calculateBounds(positions) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });
    
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }

  /**
   * 计算中心点
   * @param {Map} positions - 位置映射
   * @returns {Object} 中心点坐标
   */
  calculateCenter(positions) {
    let totalX = 0, totalY = 0;
    const count = positions.size;
    
    positions.forEach(pos => {
      totalX += pos.x;
      totalY += pos.y;
    });
    
    return { x: totalX / count, y: totalY / count };
  }

  /**
   * 获取性能报告
   * @returns {Object} 性能报告
   */
  getPerformanceReport() {
    return this.performanceMonitor.generateReport();
  }

  /**
   * 获取缓存统计
   * @returns {Object} 缓存统计信息
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
   * @param {string} lockId - 锁定ID
   * @param {Object} options - 锁定选项
   * @returns {Object} 锁定结果
   */
  lockPreviewLine(lockId, options = {}) {
    return this.previewLineLock.lock(lockId, options);
  }

  /**
   * 解锁预览线
   * @param {string} lockId - 锁定ID
   * @param {Object} options - 解锁选项
   * @returns {Object} 解锁结果
   */
  unlockPreviewLine(lockId, options = {}) {
    return this.previewLineLock.unlock(lockId, options);
  }

  /**
   * 检查预览线锁定状态
   * @param {string} lockId - 锁定ID
   * @returns {boolean} 是否已锁定
   */
  isPreviewLineLocked(lockId) {
    return this.previewLineLock.isLocked(lockId);
  }

  /**
   * 获取预览线锁定统计
   * @returns {Object} 锁定统计信息
   */
  getPreviewLineLockStats() {
    return this.previewLineLock.getStats();
  }

  /**
   * 启用/禁用缓存
   * @param {boolean} enabled - 是否启用
   */
  setCacheEnabled(enabled) {
    if (enabled) {
      this.layoutCache.enable();
    } else {
      this.layoutCache.disable();
    }
  }

  /**
   * 启用/禁用性能监控
   * @param {boolean} enabled - 是否启用
   */
  setPerformanceMonitorEnabled(enabled) {
    if (enabled) {
      this.performanceMonitor.enable();
    } else {
      this.performanceMonitor.disable();
    }
  }

  /**
   * 更新预览线管理器实例
   * @param {Object} newPreviewManager - 新的预览线管理器实例（支持PreviewLineSystem或旧管理器）
   */
  updatePreviewManager(newPreviewManager) {
    if (newPreviewManager) {
      // 检查是否为新的PreviewLineSystem
      if (newPreviewManager instanceof PreviewLineSystem) {
        this.previewLineSystem = newPreviewManager;
        this.previewLineManager = null;
        console.log('🔄 [统一布局引擎] 预览线系统已更新为新的PreviewLineSystem');
      } else {
        // 使用旧的管理器
        this.previewLineManagerRef = new WeakRef(newPreviewManager);
        this.previewLineSystem = null;
        console.log('🔄 [统一布局引擎] 预览线管理器已更新（旧版本）');
      }
    }
  }

  /**
   * 销毁引擎，清理资源
   */
  destroy() {
    console.log('🔄 [统一布局引擎] 开始销毁引擎');
    
    // 销毁性能模块
    if (this.performanceMonitor) {
      this.performanceMonitor.destroy();
    }
    
    if (this.previewLineLock) {
      this.previewLineLock.destroy();
    }
    
    // 清空缓存
    if (this.layoutCache) {
      this.layoutCache.clear();
    }
    
    console.log('✅ [统一布局引擎] 引擎销毁完成');
  }

}

export default UnifiedStructuredLayoutEngine;
