/**
 * HierarchyLayoutEngine - 基于@antv/hierarchy的布局引擎
 * 
 * 功能说明：
 * 1. 集成@antv/hierarchy的CompactBox布局算法
 * 2. 提供与UnifiedStructuredLayoutEngine兼容的接口
 * 3. 处理营销画布的垂直分层布局需求
 * 4. 支持预览线endpoint的特殊处理
 * 5. 提供性能优化和缓存机制
 */

import pkg from '@antv/hierarchy';
const { compactBox } = pkg;
import { HierarchyAdapter } from './HierarchyAdapter.js';

export class HierarchyLayoutEngine {
  constructor(graph, options = {}) {
    this.graph = graph;
    this.options = {
      // 布局配置
      layout: {
        type: 'compactBox',
        direction: 'TB', // 自上而下布局
        nodeSep: 50, // 节点间距
        rankSep: 200, // 层级间距
        align: 'center', // 对齐方式
        ...options.layout
      },
      // 节点配置
      node: {
        width: 120,
        height: 60,
        spacing: 50,
        endpointSize: { width: 20, height: 20 },
        ...options.node
      },
      // 层级配置
      layer: {
        height: 200,
        spacing: 100,
        ...options.layer
      },
      // 性能配置
      performance: {
        enableCache: true,
        enableDebounce: true,
        debounceDelay: 100,
        ...options.performance
      },
      // 调试配置
      debug: options.debug || false,
      ...options
    };

    // 初始化适配器
    this.adapter = new HierarchyAdapter({
      node: this.options.node,
      layer: this.options.layer,
      debug: this.options.debug
    });

    // 内部状态
    this.layoutCache = new Map(); // 布局结果缓存
    this.lastLayoutHash = null; // 上次布局的数据哈希
    this.isLayouting = false; // 布局进行中标志
    this.layoutPromise = null; // 当前布局Promise

    // 防抖处理
    this.debouncedLayout = this.options.performance.enableDebounce 
      ? this.debounce(this.performLayout.bind(this), this.options.performance.debounceDelay)
      : this.performLayout.bind(this);

    this.log('🚀 [HierarchyLayoutEngine] 初始化完成', {
      布局类型: this.options.layout.type,
      方向: this.options.layout.direction,
      节点间距: this.options.layout.nodeSep,
      层级间距: this.options.layout.rankSep
    });
  }

  /**
   * 执行布局计算
   * @param {Object} layoutData - 布局数据 {nodes, edges, previewEndpoints}
   * @param {Object} options - 布局选项
   * @returns {Promise<Map>} 节点位置映射
   */
  async calculateLayout(layoutData, options = {}) {
    this.log('🎯 [布局计算] 开始执行hierarchy布局');
    
    try {
      // 数据验证
      if (!layoutData) {
        return {
          success: false,
          error: '图实例为空',
          positions: new Map()
        };
      }

      if (!layoutData.nodes || layoutData.nodes.length === 0) {
        return {
          success: false,
          error: '图数据为空或无节点',
          positions: new Map()
        };
      }

      // 检查是否正在布局中
      if (this.isLayouting && this.layoutPromise) {
        this.log('⏳ [布局计算] 等待当前布局完成');
        return await this.layoutPromise;
      }

      // 生成数据哈希，检查缓存
      const dataHash = this.generateDataHash(layoutData);
      if (this.options.performance.enableCache && this.layoutCache.has(dataHash)) {
        this.log('💾 [布局计算] 使用缓存结果');
        return this.layoutCache.get(dataHash);
      }

      // 执行布局
      this.isLayouting = true;
      this.layoutPromise = this.debouncedLayout(layoutData, options);
      const positions = await this.layoutPromise;

      // 构建成功结果
      const result = {
        success: true,
        error: null,
        positions: positions
      };

      // 缓存结果
      if (this.options.performance.enableCache) {
        this.layoutCache.set(dataHash, result);
        this.lastLayoutHash = dataHash;
      }

      return result;
    } catch (error) {
      this.log('❌ [布局计算] 布局失败:', error.message);
      return {
        success: false,
        error: error.message,
        positions: new Map()
      };
    } finally {
      this.isLayouting = false;
      this.layoutPromise = null;
    }
  }

  /**
   * 实际执行布局计算
   * @param {Object} layoutData - 布局数据
   * @param {Object} options - 布局选项
   * @returns {Promise<Map>} 节点位置映射
   */
  async performLayout(layoutData, options = {}) {
    const startTime = performance.now();
    
    try {
      // 1. 数据转换：X6 -> hierarchy
      const hierarchyData = this.adapter.convertToHierarchyData(
        { nodes: layoutData.nodes || [], edges: layoutData.edges || [] },
        layoutData.previewEndpoints || []
      );

      if (!hierarchyData) {
        throw new Error('数据转换失败：无法生成hierarchy数据');
      }

      // 2. 执行hierarchy布局
      const layoutResult = this.executeHierarchyLayout(hierarchyData, options);
      
      // 🔍 添加详细的@antv/hierarchy布局结果调试日志
      console.log('🔍 [performLayout] @antv/hierarchy布局算法执行完成，开始分析结果:');
      console.log('📊 [performLayout] layoutResult类型:', typeof layoutResult);
      console.log('📊 [performLayout] layoutResult是否为null/undefined:', layoutResult === null || layoutResult === undefined);
      
      if (layoutResult) {
        console.log('📊 [performLayout] layoutResult根节点信息:', {
          id: layoutResult.id,
          x: layoutResult.x,
          y: layoutResult.y,
          x类型: typeof layoutResult.x,
          y类型: typeof layoutResult.y,
          x是否NaN: isNaN(layoutResult.x),
          y是否NaN: isNaN(layoutResult.y)
        });
        
        // 递归检查所有节点的坐标
        const checkNodeCoordinates = (node, path = '') => {
          if (!node) return;
          
          const currentPath = path ? `${path}.${node.id}` : node.id;
          if (isNaN(node.x) || isNaN(node.y)) {
            console.warn(`⚠️ [performLayout] 发现NaN坐标 - 路径: ${currentPath}, x: ${node.x}, y: ${node.y}`);
          }
          
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => checkNodeCoordinates(child, currentPath));
          }
        };
        
        checkNodeCoordinates(layoutResult);
        
        // 检查前几个子节点
        if (layoutResult.children && Array.isArray(layoutResult.children)) {
          console.log('📊 [performLayout] 前3个子节点坐标:');
          layoutResult.children.slice(0, 3).forEach((child, index) => {
            console.log(`  子节点${index + 1}: {id: ${child.id}, x: ${child.x}, y: ${child.y}, x类型: ${typeof child.x}, y类型: ${typeof child.y}, x是否NaN: ${isNaN(child.x)}, y是否NaN: ${isNaN(child.y)}}`);
          });
        }
      }

      // 3. 结果转换：hierarchy -> X6位置
      const positionMap = this.adapter.convertFromHierarchyData(layoutResult);

      // 4. 后处理：应用特殊规则
      const finalPositions = this.postProcessPositions(positionMap, layoutData);

      const endTime = performance.now();
      this.log('✅ [布局计算] 布局完成', {
        节点数量: finalPositions.size,
        耗时: `${(endTime - startTime).toFixed(2)}ms`,
        缓存状态: this.options.performance.enableCache ? '已启用' : '已禁用'
      });

      return finalPositions;
    } catch (error) {
      this.log('❌ [布局计算] 执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 执行@antv/hierarchy布局算法
   * @param {Object} hierarchyData - hierarchy格式数据
   * @param {Object} options - 布局选项
   * @returns {Object} 布局结果
   */
  executeHierarchyLayout(hierarchyData, options = {}) {
    console.log('🚀 [原生@antv/hierarchy] 开始执行CompactBox算法');
    console.log('📊 [原生@antv/hierarchy] 输入数据结构:', {
      节点数量: this.countNodes(hierarchyData),
      根节点ID: hierarchyData?.id,
      子节点数量: hierarchyData?.children?.length || 0
    });

    // 合并布局配置
    const layoutConfig = {
      ...this.options.layout,
      ...options,
      // 确保基本配置
      getId: (node) => node.id,
      getWidth: (node) => {
        // X6节点实例方法
        if (node.getSize && typeof node.getSize === 'function') {
          return node.getSize().width;
        }
        // 直接尺寸属性
        if (node.size && typeof node.size.width === 'number') {
          return node.size.width;
        }
        // 直接width属性
        if (typeof node.width === 'number') {
          return node.width;
        }
        // 默认值
        return this.options.node.width;
      },
      getHeight: (node) => {
        // X6节点实例方法
        if (node.getSize && typeof node.getSize === 'function') {
          return node.getSize().height;
        }
        // 直接尺寸属性
        if (node.size && typeof node.size.height === 'number') {
          return node.size.height;
        }
        // 直接height属性
        if (typeof node.height === 'number') {
          return node.height;
        }
        // 默认值
        return this.options.node.height;
      },
      getChildren: (node) => node.children || []
    };

    console.log('⚙️ [原生@antv/hierarchy] 布局配置:', {
      方向: layoutConfig.direction,
      节点间距: layoutConfig.nodeSep,
      层级间距: layoutConfig.rankSep,
      对齐方式: layoutConfig.align,
      默认节点宽度: this.options.node.width,
      默认节点高度: this.options.node.height
    });

    try {
      // 执行CompactBox布局
      console.log('🔄 [原生@antv/hierarchy] 正在执行CompactBox算法...');
      const result = compactBox(hierarchyData, layoutConfig);
      
      console.log('✅ [原生@antv/hierarchy] CompactBox算法执行完成!');
      console.log('📈 [原生@antv/hierarchy] 布局结果概览:', {
        根节点: result?.id,
        根节点位置: { x: result?.x, y: result?.y },
        总节点数: this.countNodes(result),
        布局边界: this.calculateBounds(result)
      });
      
      // 🔧 添加坐标验证检查
      this.validateLayoutResult(result, 'CompactBox布局结果');
      
      // 详细输出每个节点的位置信息
      this.logNodePositions(result, '原生@antv/hierarchy布局结果');

      return result;
    } catch (error) {
      console.error('❌ [原生@antv/hierarchy] CompactBox算法执行失败:', error.message);
      console.error('❌ [原生@antv/hierarchy] 错误详情:', error);
      throw new Error(`Hierarchy布局失败: ${error.message}`);
    }
  }

  /**
   * 后处理位置数据，应用特殊规则
   * @param {Map} positionMap - 原始位置映射
   * @param {Object} layoutData - 原始布局数据
   * @returns {Map} 处理后的位置映射
   */
  postProcessPositions(positionMap, layoutData) {
    this.log('🔧 [后处理] 开始应用特殊规则');

    const processedMap = new Map(positionMap);

    // 1. 处理预览线endpoint位置
    this.adjustEndpointPositions(processedMap, layoutData.previewEndpoints || []);

    // 2. 应用层级对齐规则
    this.applyLayerAlignment(processedMap, layoutData);

    // 3. 确保最小间距
    this.enforceMinimumSpacing(processedMap);

    // 4. 居中对齐处理
    this.applyCenterAlignment(processedMap);

    this.log('✅ [后处理] 特殊规则应用完成');
    return processedMap;
  }

  // 🗑️ [已删除] adjustEndpointPositions 方法已被新的预览线分层策略替代

  /**
   * 应用层级对齐规则
   * @param {Map} positionMap - 位置映射
   * @param {Object} layoutData - 布局数据
   */
  applyLayerAlignment(positionMap, layoutData) {
    // 🔍 检查layer.height配置
    const layerHeight = this.options.layer.height;
    console.log('🔍 [applyLayerAlignment] layer.height配置检查:', {
      layerHeight: layerHeight,
      类型: typeof layerHeight,
      是否为数字: typeof layerHeight === 'number',
      是否为0: layerHeight === 0,
      是否NaN: isNaN(layerHeight),
      是否有限: isFinite(layerHeight),
      完整options: this.options.layer
    });
    
    // 🛡️ 防止除零运算导致NaN
    if (!layerHeight || typeof layerHeight !== 'number' || layerHeight <= 0 || !isFinite(layerHeight)) {
      console.error('❌ [applyLayerAlignment] layer.height配置无效，跳过层级对齐:', {
        layerHeight: layerHeight,
        使用默认值: 200
      });
      // 使用默认值或跳过对齐
      return;
    }
    
    // 按Y坐标分组节点到层级
    const layers = new Map();
    
    positionMap.forEach((position, nodeId) => {
      console.log(`🔍 [applyLayerAlignment] 处理节点 ${nodeId}:`, {
        原始Y: position.y,
        layerHeight: layerHeight,
        除法结果: position.y / layerHeight,
        Math_round结果: Math.round(position.y / layerHeight),
        最终layerY: Math.round(position.y / layerHeight) * layerHeight
      });
      
      const layerY = Math.round(position.y / layerHeight) * layerHeight;
      
      // 🔍 检查计算结果是否有效
      if (isNaN(layerY) || !isFinite(layerY)) {
        console.error(`❌ [applyLayerAlignment] 节点 ${nodeId} 层级Y计算结果无效:`, {
          原始Y: position.y,
          layerHeight: layerHeight,
          计算结果: layerY,
          跳过该节点: true
        });
        return; // 跳过这个节点
      }
      
      if (!layers.has(layerY)) {
        layers.set(layerY, []);
      }
      layers.get(layerY).push({ nodeId, position });
    });

    console.log('📊 [applyLayerAlignment] 层级分组结果:', {
      层级数量: layers.size,
      层级详情: Array.from(layers.entries()).map(([y, nodes]) => ({
        layerY: y,
        节点数量: nodes.length,
        节点列表: nodes.map(n => n.nodeId)
      }))
    });

    // 对每层进行对齐处理
    layers.forEach((layerNodes, layerY) => {
      console.log(`🔧 [applyLayerAlignment] 对齐层级 Y=${layerY}，包含 ${layerNodes.length} 个节点`);
      
      layerNodes.forEach(({ nodeId, position }) => {
        const newPosition = {
          ...position,
          y: layerY // 确保Y坐标对齐到层级
        };
        
        console.log(`✅ [applyLayerAlignment] 节点 ${nodeId} 对齐: ${position.y} -> ${layerY}`);
        positionMap.set(nodeId, newPosition);
      });
    });
  }

  /**
   * 确保最小间距
   * @param {Map} positionMap - 位置映射
   */
  enforceMinimumSpacing(positionMap) {
    const positions = Array.from(positionMap.entries());
    const minSpacing = this.options.node.spacing;

    // 按X坐标排序
    positions.sort((a, b) => a[1].x - b[1].x);

    // 调整X坐标确保最小间距
    for (let i = 1; i < positions.length; i++) {
      const [currentId, currentPos] = positions[i];
      const [prevId, prevPos] = positions[i - 1];
      
      const minX = prevPos.x + this.options.node.width + minSpacing;
      if (currentPos.x < minX) {
        positionMap.set(currentId, {
          ...currentPos,
          x: minX
        });
      }
    }
  }

  /**
   * 应用居中对齐
   * @param {Map} positionMap - 位置映射
   */
  applyCenterAlignment(positionMap) {
    if (positionMap.size === 0) return;

    // 计算整体边界
    const positions = Array.from(positionMap.values());
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x + (p.width || this.options.node.width)));
    const centerOffset = -((minX + maxX) / 2);

    // 应用居中偏移
    positionMap.forEach((position, nodeId) => {
      positionMap.set(nodeId, {
        ...position,
        x: position.x + centerOffset
      });
    });
  }

  /**
   * 生成数据哈希用于缓存
   * @param {Object} layoutData - 布局数据
   * @returns {string} 数据哈希
   */
  generateDataHash(layoutData) {
    const hashData = {
      nodes: (layoutData.nodes || []).map(n => ({ id: n.id, type: n.type })),
      edges: (layoutData.edges || []).map(e => ({ source: e.source, target: e.target })),
      endpoints: (layoutData.previewEndpoints || []).map(e => ({ id: e.id, sourceNodeId: e.sourceNodeId })),
      options: this.options.layout
    };
    
    return JSON.stringify(hashData);
  }

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} delay - 延迟时间
   * @returns {Function} 防抖后的函数
   */
  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * 清除布局缓存
   */
  clearCache() {
    this.layoutCache.clear();
    this.lastLayoutHash = null;
    this.log('🗑️ [缓存管理] 布局缓存已清除');
  }

  /**
   * 获取布局引擎统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      缓存大小: this.layoutCache.size,
      是否布局中: this.isLayouting,
      上次布局哈希: this.lastLayoutHash,
      适配器统计: this.adapter.getStats(),
      配置信息: {
        布局类型: this.options.layout.type,
        方向: this.options.layout.direction,
        缓存启用: this.options.performance.enableCache,
        防抖启用: this.options.performance.enableDebounce
      }
    };
  }

  /**
   * 🔧 更新图实例（支持布局引擎实例复用）
   * @param {Object} newGraph - 新的图实例
   */
  updateGraph(newGraph) {
    if (!newGraph) {
      console.warn('⚠️ [HierarchyLayoutEngine] 新图实例为空，跳过更新')
      return
    }

    console.log('🔄 [HierarchyLayoutEngine] 更新图实例')
    this.graph = newGraph
    
    // 清理旧的布局数据和缓存
    this.clearCache()
    this.isLayouting = false
    this.layoutPromise = null
    
    // 重置适配器
    this.adapter.reset()
    
    console.log('✅ [HierarchyLayoutEngine] 图实例更新完成，布局数据已重置')
   }

   /**
    * 🔧 更新预览线管理器（支持布局引擎实例复用）
    * @param {Object} newPreviewManager - 新的预览线管理器实例
    */
   updatePreviewManager(newPreviewManager) {
     console.log('🔄 [HierarchyLayoutEngine] 更新预览线管理器')
     
     // 简化版本：直接存储预览线管理器引用
     this.previewLineManager = newPreviewManager
     
     // 重新建立引用关系
     if (newPreviewManager && newPreviewManager.setLayoutEngine) {
       newPreviewManager.setLayoutEngine(this)
       console.log('🔗 [HierarchyLayoutEngine] 预览线管理器引用已重新建立')
     } else if (newPreviewManager) {
       newPreviewManager.layoutEngine = this
       console.log('🔗 [HierarchyLayoutEngine] 预览线管理器引用已直接设置')
     }
     
     console.log('✅ [HierarchyLayoutEngine] 预览线管理器更新完成')
   }

   /**
   * 更新布局配置
   * @param {Object} newOptions - 新的配置选项
   */
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions,
      layout: { ...this.options.layout, ...newOptions.layout },
      node: { ...this.options.node, ...newOptions.node },
      layer: { ...this.options.layer, ...newOptions.layer },
      performance: { ...this.options.performance, ...newOptions.performance }
    };
    
    // 更新适配器配置
    this.adapter = new HierarchyAdapter({
      node: this.options.node,
      layer: this.options.layer,
      debug: this.options.debug
    });
    
    // 清除缓存以应用新配置
    this.clearCache();
    
    this.log('🔧 [配置更新] 布局配置已更新', newOptions);
  }

  /**
   * 执行布局（与UnifiedStructuredLayoutEngine接口保持一致）
   * @param {Object} options - 布局选项
   * @returns {Promise<Object>} 布局结果
   */
  async executeLayout(options = {}) {
    const startTime = Date.now();
    this.log('🚀 [HierarchyLayoutEngine] 开始执行executeLayout');
    
    try {
      // 获取图数据
      const nodes = this.graph.getNodes();
      const edges = this.graph.getEdges();
      
      // 🔍 调试：检查从X6图实例获取的原始节点数据
      console.log('🔍 [HierarchyLayoutEngine] 从X6图实例获取的原始节点数据:', {
        节点总数: nodes.length,
        边总数: edges.length
      });
      
      // 🔍 调试：检查前几个节点的原始位置信息
      nodes.slice(0, 3).forEach((node, index) => {
        const nodeId = node.id || node.getId();
        const nodeData = node.getData() || {};
        const hasGetPosition = typeof node.getPosition === 'function';
        let originalPosition = null;
        
        if (hasGetPosition) {
          try {
            originalPosition = node.getPosition();
          } catch (error) {
            console.error(`❌ [HierarchyLayoutEngine] 节点 ${nodeId} getPosition() 调用失败:`, error);
          }
        }
        
        console.log(`🔍 [HierarchyLayoutEngine] 原始节点 ${index + 1} (${nodeId}):`, {
          节点ID: nodeId,
          节点类型: nodeData.type || nodeData.nodeType || 'unknown',
          有getPosition方法: hasGetPosition,
          原始位置: originalPosition,
          位置x值: originalPosition?.x,
          位置y值: originalPosition?.y,
          x类型: typeof originalPosition?.x,
          y类型: typeof originalPosition?.y,
          x是否NaN: originalPosition?.x !== undefined ? isNaN(originalPosition.x) : 'undefined',
          y是否NaN: originalPosition?.y !== undefined ? isNaN(originalPosition.y) : 'undefined',
          节点数据: nodeData
        });
      });
      
      // 过滤有效节点（排除拖拽点和预览相关节点）
      const validNodes = (nodes || []).filter((node) => {
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
      const validEdges = (edges || []).filter((edge) => {
        const edgeId = edge.id || edge.getId();
        const edgeData = edge.getData() || {};
        return (
          !edgeId.includes("preview") &&
          !edgeId.includes("unified_preview") &&
          !edgeData.isPreview &&
          !edgeData.isPersistentPreview
        );
      });
      
      // 检查节点数量
      if (validNodes.length === 0) {
        this.log('⚠️ [HierarchyLayoutEngine] 没有有效节点，跳过布局');
        return {
          success: true,
          message: '没有有效节点，跳过布局',
          nodeCount: 0,
          skipped: true,
          timestamp: new Date().toISOString(),
          statistics: {
            totalLayers: 0,
            totalNodes: 0,
            normalNodes: 0,
            endpointNodes: 0,
            layerDistribution: []
          },
          performance: {
            executionTime: Date.now() - startTime,
            optimizationIterations: 0
          }
        };
      }
      
      if (validNodes.length === 1) {
        const singleNode = validNodes[0];
        const nodeData = singleNode.getData() || {};
        
        // 如果是开始节点，跳过布局
        if (nodeData.type === 'start') {
          this.log('⚠️ [HierarchyLayoutEngine] 只有单个开始节点，跳过布局');
          return {
            success: true,
            message: '只有单个开始节点，无需执行布局',
            nodeCount: 1,
            skipped: true,
            timestamp: new Date().toISOString(),
            statistics: {
              totalLayers: 1,
              totalNodes: 1,
              normalNodes: 1,
              endpointNodes: 0,
              layerDistribution: [{
                layer: 0,
                normalNodes: 1,
                endpointNodes: 0,
                total: 1
              }]
            },
            performance: {
              executionTime: Date.now() - startTime,
              optimizationIterations: 0
            }
          };
        }
      }
      
      // 执行布局计算
      const layoutData = {
        nodes: validNodes,
        edges: validEdges,
        previewEndpoints: [] // HierarchyLayoutEngine暂不处理预览线endpoint
      };
      
      const layoutResult = await this.calculateLayout(layoutData, options);
      
      if (!layoutResult.success) {
        return {
          success: false,
          error: layoutResult.error,
          message: `HierarchyLayoutEngine布局执行失败: ${layoutResult.error}`,
          timestamp: new Date().toISOString(),
          statistics: {
            totalLayers: 0,
            totalNodes: validNodes.length,
            normalNodes: validNodes.length,
            endpointNodes: 0,
            layerDistribution: []
          },
          performance: {
            executionTime: Date.now() - startTime,
            optimizationIterations: 0
          }
        };
      }
      
      // 应用位置到图形
      const appliedCount = this.applyPositionsToGraph(layoutResult.positions);
      
      // 生成布局报告
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      const result = {
        success: true,
        message: 'HierarchyLayoutEngine布局执行成功',
        timestamp: new Date().toISOString(),
        statistics: {
          totalLayers: this.calculateLayerCount(layoutResult.positions),
          totalNodes: layoutResult.positions.size,
          normalNodes: layoutResult.positions.size,
          endpointNodes: 0,
          layerDistribution: this.generateLayerDistribution(layoutResult.positions)
        },
        performance: {
          executionTime: executionTime,
          optimizationIterations: 0
        }
      };
      
      this.log('✅ [HierarchyLayoutEngine] executeLayout执行完成', {
        节点数量: layoutResult.positions.size,
        应用节点: appliedCount,
        执行时间: `${executionTime}ms`
      });
      
      return result;
      
    } catch (error) {
      this.log('❌ [HierarchyLayoutEngine] executeLayout执行失败:', error.message);
      return {
        success: false,
        error: error.message,
        message: `HierarchyLayoutEngine布局执行失败: ${error.message}`,
        timestamp: new Date().toISOString(),
        statistics: {
          totalLayers: 0,
          totalNodes: 0,
          normalNodes: 0,
          endpointNodes: 0,
          layerDistribution: []
        },
        performance: {
          executionTime: Date.now() - startTime,
          optimizationIterations: 0
        }
      };
    }
  }
  
  /**
   * 应用位置到图形
   * @param {Map} positions - 位置映射
   * @returns {number} 应用的节点数量
   */
  applyPositionsToGraph(positions) {
    console.log('🔄 [HierarchyLayoutEngine] 开始应用位置到图形');
    console.log('🔍 [HierarchyLayoutEngine] 输入的positions映射:', Array.from(positions.entries()));
    
    let appliedCount = 0;
    
    positions.forEach((position, nodeId) => {
      console.log(`🔍 [HierarchyLayoutEngine] 处理节点 ${nodeId}:`, {
        原始position对象: position,
        x值: position.x,
        y值: position.y,
        x类型: typeof position.x,
        y类型: typeof position.y,
        x是否NaN: isNaN(position.x),
        y是否NaN: isNaN(position.y),
        x是否有限: isFinite(position.x),
        y是否有限: isFinite(position.y)
      });
      
      const node = this.graph.getCellById(nodeId);
      if (node && node.setPosition) {
        // 🔧 修复NaN坐标问题：检查并处理无效坐标
        let x = position.x;
        let y = position.y;
        
        console.log(`📊 [HierarchyLayoutEngine] 节点 ${nodeId} 坐标处理前:`, {
          原始x: x,
          原始y: y,
          x类型: typeof x,
          y类型: typeof y
        });
        
        // 🛡️ 强化坐标验证和修复机制
        let validX = x;
        let validY = y;
        
        // 验证X坐标
        if (typeof x !== 'number' || !isFinite(x) || isNaN(x)) {
          console.warn('⚠️ [HierarchyLayoutEngine] X坐标无效，使用默认值200:', {
            nodeId: nodeId,
            原始X: x,
            X类型: typeof x,
            X是否NaN: isNaN(x),
            X是否有限: isFinite(x),
            修复后X: 200
          });
          validX = 200;
        }

        // 验证Y坐标
        if (typeof y !== 'number' || !isFinite(y) || isNaN(y)) {
          console.warn('⚠️ [HierarchyLayoutEngine] Y坐标无效，使用默认值100:', {
            nodeId: nodeId,
            原始Y: y,
            Y类型: typeof y,
            Y是否NaN: isNaN(y),
            Y是否有限: isFinite(y),
            修复后Y: 100
          });
          validY = 100;
        }
        
        // 使用验证后的坐标
        x = validX;
        y = validY;
        
        console.log(`✅ [HierarchyLayoutEngine] 节点 ${nodeId} 最终应用坐标: (${x}, ${y})`);
        
        // 应用有效坐标
        node.setPosition(x, y);
        appliedCount++;
        this.log(`📍 [位置应用] 节点 ${nodeId}: (${x.toFixed(1)}, ${y.toFixed(1)})`);
      } else {
        console.warn(`⚠️ [HierarchyLayoutEngine] 节点 ${nodeId} 不存在或无setPosition方法`);
      }
    });
    
    console.log(`✅ [HierarchyLayoutEngine] 位置应用完成，共处理 ${appliedCount} 个节点`);
    return appliedCount;
  }
  
  /**
   * 计算层级数量
   * @param {Map} positions - 位置映射
   * @returns {number} 层级数量
   */
  calculateLayerCount(positions) {
    const yPositions = Array.from(positions.values()).map(pos => pos.y);
    const uniqueYPositions = [...new Set(yPositions.map(y => Math.round(y / this.options.layer.height)))];
    return uniqueYPositions.length;
  }
  
  /**
   * 生成层级分布信息
   * @param {Map} positions - 位置映射
   * @returns {Array} 层级分布数组
   */
  generateLayerDistribution(positions) {
    const layerMap = new Map();
    
    positions.forEach((position, nodeId) => {
      const layer = Math.round(position.y / this.options.layer.height);
      if (!layerMap.has(layer)) {
        layerMap.set(layer, { normalNodes: 0, endpointNodes: 0 });
      }
      layerMap.get(layer).normalNodes++;
    });
    
    return Array.from(layerMap.entries()).map(([layer, counts]) => ({
      layer,
      normalNodes: counts.normalNodes,
      endpointNodes: counts.endpointNodes,
      total: counts.normalNodes + counts.endpointNodes
    }));
  }

  /**
   * 销毁布局引擎
   */
  destroy() {
    this.clearCache();
    this.adapter.reset();
    this.isLayouting = false;
    this.layoutPromise = null;
    this.log('🗑️ [销毁] HierarchyLayoutEngine已销毁');
  }

  /**
   * 调试日志输出
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  log(message, data = null) {
    if (this.options.debug) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * 计算节点总数（递归）
   * @param {Object} node - 节点对象
   * @returns {number} 节点总数
   */
  countNodes(node) {
    if (!node) return 0;
    let count = 1;
    if (node.children && Array.isArray(node.children)) {
      count += node.children.reduce((sum, child) => sum + this.countNodes(child), 0);
    }
    return count;
  }

  /**
   * 计算布局边界
   * @param {Object} node - 根节点
   * @returns {Object} 边界信息
   */
  calculateBounds(node) {
    if (!node) return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
    
    const positions = [];
    this.collectPositions(node, positions);
    
    if (positions.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
    }
    
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));
    
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 收集所有节点位置（递归）
   * @param {Object} node - 节点
   * @param {Array} positions - 位置数组
   */
  collectPositions(node, positions) {
    if (!node) return;
    
    if (typeof node.x === 'number' && typeof node.y === 'number') {
      positions.push({ x: node.x, y: node.y, id: node.id });
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.collectPositions(child, positions));
    }
  }

  /**
   * 验证布局结果中的坐标有效性
   * @param {Object} node - 根节点
   * @param {string} title - 标题
   */
  validateLayoutResult(node, title) {
    console.log(`🔍 [${title}] 开始验证坐标有效性`);
    const invalidNodes = [];
    
    const validateNode = (currentNode) => {
      if (!currentNode) return;
      
      // 检查当前节点坐标
      if (typeof currentNode.x !== 'number' || isNaN(currentNode.x) || !isFinite(currentNode.x)) {
        invalidNodes.push({
          id: currentNode.id,
          issue: 'X坐标无效',
          value: currentNode.x,
          type: typeof currentNode.x
        });
      }
      
      if (typeof currentNode.y !== 'number' || isNaN(currentNode.y) || !isFinite(currentNode.y)) {
        invalidNodes.push({
          id: currentNode.id,
          issue: 'Y坐标无效',
          value: currentNode.y,
          type: typeof currentNode.y
        });
      }
      
      // 递归检查子节点
      if (currentNode.children && Array.isArray(currentNode.children)) {
        currentNode.children.forEach(child => validateNode(child));
      }
    };
    
    validateNode(node);
    
    if (invalidNodes.length > 0) {
      console.error(`❌ [${title}] 发现 ${invalidNodes.length} 个坐标问题:`);
      invalidNodes.forEach((issue, index) => {
        console.error(`  ${index + 1}. 节点 ${issue.id}: ${issue.issue} (值: ${issue.value}, 类型: ${issue.type})`);
      });
    } else {
      console.log(`✅ [${title}] 所有节点坐标验证通过`);
    }
    
    return invalidNodes.length === 0;
  }

  /**
   * 输出节点位置信息
   * @param {Object} node - 根节点
   * @param {string} title - 标题
   */
  logNodePositions(node, title) {
    console.log(`📍 [${title}] 节点位置详情:`);
    const positions = [];
    this.collectPositions(node, positions);
    
    positions.forEach((pos, index) => {
      console.log(`  ${index + 1}. 节点${pos.id}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`);
    });
    
    if (positions.length > 10) {
      console.log(`  ... 共${positions.length}个节点`);
    }
  }
}

// 默认导出
export default HierarchyLayoutEngine;