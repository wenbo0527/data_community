/**
 * 布局执行器
 * 负责协调各个算法模块，执行完整的布局计算流程
 */
export class LayoutExecutor {
  constructor(config = {}) {
    this.config = {
      enableHierarchicalLayout: config.enableHierarchicalLayout !== false,
      enableLayerOptimization: config.enableLayerOptimization !== false,
      enableGlobalOptimization: config.enableGlobalOptimization !== false,
      maxExecutionTime: config.maxExecutionTime || 30000, // 30秒超时
      ...config
    };
    
    // 算法模块实例
    this.layerCalculator = null;
    this.hierarchicalBuilder = null;
    this.bottomUpPositioner = null;
    this.layerOptimizer = null;
    this.globalOptimizer = null;
  }

  /**
   * 设置算法模块
   * @param {Object} modules - 算法模块集合
   */
  setAlgorithmModules(modules) {
    this.layerCalculator = modules.layerCalculator;
    this.hierarchicalBuilder = modules.hierarchicalBuilder;
    this.bottomUpPositioner = modules.bottomUpPositioner;
    this.layerOptimizer = modules.layerOptimizer;
    this.globalOptimizer = modules.globalOptimizer;
  }

  /**
   * 执行布局计算
   * @param {Object} preprocessedData - 预处理后的数据
   * @param {Object} bounds - 布局边界
   * @param {Object} options - 执行选项
   * @returns {Object} 布局结果
   */
  async executeLayout(preprocessedData, bounds = {}, options = {}) {
    console.log(`🚀 [布局执行器] 开始执行布局计算`);
    
    const startTime = Date.now();
    const executionId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 验证算法模块
      this.validateAlgorithmModules();
      
      // 设置执行超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('布局计算超时')), this.config.maxExecutionTime);
      });
      
      // 执行布局计算
      const layoutPromise = this.performLayoutCalculation(preprocessedData, bounds, options, executionId);
      
      const result = await Promise.race([layoutPromise, timeoutPromise]);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ [布局执行器] 布局计算完成 - 耗时: ${executionTime}ms`);
      
      return {
        ...result,
        executionId,
        totalExecutionTime: executionTime,
        success: true
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [布局执行器] 布局计算失败:`, error);
      
      return {
        success: false,
        error: error.message,
        executionId,
        totalExecutionTime: executionTime,
        positions: new Map(),
        hierarchy: null,
        stats: null
      };
    }
  }

  /**
   * 执行布局计算的核心逻辑
   * @param {Object} preprocessedData - 预处理后的数据
   * @param {Object} bounds - 布局边界
   * @param {Object} options - 执行选项
   * @param {string} executionId - 执行ID
   * @returns {Object} 布局结果
   */
  async performLayoutCalculation(preprocessedData, bounds, options, executionId) {
    const { nodes, edges, relations, statistics } = preprocessedData;
    const phases = [];
    
    console.log(`📊 [布局执行器] 输入数据统计 - 节点: ${nodes.length}, 边: ${edges.length}, 密度: ${statistics.density}`);
    
    // 阶段1: 层级计算
    let hierarchy = null;
    if (this.config.enableHierarchicalLayout && this.hierarchicalBuilder) {
      const phaseStartTime = Date.now();
      console.log(`🏗️ [布局执行器] 阶段1: 构建层次结构`);
      
      hierarchy = this.hierarchicalBuilder.buildHierarchy(nodes, edges);
      
      const phaseTime = Date.now() - phaseStartTime;
      phases.push({
        name: 'hierarchical_building',
        executionTime: phaseTime,
        result: {
          layerCount: hierarchy.layers.length,
          virtualNodes: hierarchy.stats.virtualNodes,
          virtualEdges: hierarchy.stats.virtualEdges
        }
      });
      
      console.log(`✅ [布局执行器] 层次结构构建完成 - 层数: ${hierarchy.layers.length}, 耗时: ${phaseTime}ms`);
    } else {
      // 使用简单的层级计算作为后备
      const phaseStartTime = Date.now();
      console.log(`🔢 [布局执行器] 阶段1: 简单层级计算`);
      
      if (!this.layerCalculator) {
        throw new Error('层级计算器未初始化，无法执行布局计算');
      }
      
      const layers = this.layerCalculator.calculateLayers(nodes, edges);
      
      hierarchy = {
        layers,
        graph: { nodes: new Map(nodes.map(n => [n.id, n])), edges },
        stats: { totalLayers: layers.length, totalNodes: nodes.length }
      };
      
      const phaseTime = Date.now() - phaseStartTime;
      phases.push({
        name: 'simple_layering',
        executionTime: phaseTime,
        result: { layerCount: layers.length }
      });
    }
    
    // 阶段2: 层级优化
    if (this.config.enableLayerOptimization && this.layerOptimizer && hierarchy) {
      const phaseStartTime = Date.now();
      console.log(`🎯 [布局执行器] 阶段2: 层级优化`);
      
      const optimizationResult = this.layerOptimizer.optimizeLayers(hierarchy, new Map());
      hierarchy = optimizationResult.hierarchy;
      
      const phaseTime = Date.now() - phaseStartTime;
      phases.push({
        name: 'layer_optimization',
        executionTime: phaseTime,
        result: {
          crossingReduction: optimizationResult.improvement,
          finalCrossings: optimizationResult.crossings
        }
      });
      
      console.log(`✅ [布局执行器] 层级优化完成 - 交叉数: ${optimizationResult.crossings}, 耗时: ${phaseTime}ms`);
    }
    
    // 阶段3: 位置计算
    let positions = new Map();
    if (this.bottomUpPositioner && hierarchy) {
      const phaseStartTime = Date.now();
      console.log(`📍 [布局执行器] 阶段3: 计算节点位置`);
      
      positions = this.bottomUpPositioner.calculatePositions(hierarchy, bounds);
      
      const phaseTime = Date.now() - phaseStartTime;
      phases.push({
        name: 'position_calculation',
        executionTime: phaseTime,
        result: {
          positionedNodes: positions.size,
          layoutBounds: this.calculateLayoutBounds(positions)
        }
      });
      
      console.log(`✅ [布局执行器] 位置计算完成 - 定位节点: ${positions.size}, 耗时: ${phaseTime}ms`);
    } else {
      throw new Error('位置计算器未初始化，无法执行位置计算');
    }
    
    // 阶段4: 全局优化
    if (this.config.enableGlobalOptimization && this.globalOptimizer && positions.size > 0) {
      const phaseStartTime = Date.now();
      console.log(`🌍 [布局执行器] 阶段4: 全局优化`);
      
      const optimizationResult = this.globalOptimizer.optimize(positions, hierarchy, bounds);
      positions = optimizationResult.positions;
      
      const phaseTime = Date.now() - phaseStartTime;
      phases.push({
        name: 'global_optimization',
        executionTime: phaseTime,
        result: {
          scoreImprovement: optimizationResult.improvement,
          finalScore: optimizationResult.score
        }
      });
      
      console.log(`✅ [布局执行器] 全局优化完成 - 评分: ${optimizationResult.score.toFixed(2)}, 耗时: ${phaseTime}ms`);
    }
    
    // 生成执行统计
    const executionStats = this.generateExecutionStats(phases, positions, hierarchy, preprocessedData);
    
    return {
      positions,
      hierarchy,
      phases,
      stats: executionStats,
      bounds: this.calculateLayoutBounds(positions),
      metadata: {
        executionId,
        timestamp: new Date().toISOString(),
        inputStats: statistics,
        algorithmConfig: this.config
      }
    };
  }

  /**
   * 验证算法模块
   */
  validateAlgorithmModules() {
    const requiredModules = [];
    
    if (this.config.enableHierarchicalLayout && !this.hierarchicalBuilder) {
      requiredModules.push('hierarchicalBuilder');
    }
    
    if (this.config.enableLayerOptimization && !this.layerOptimizer) {
      requiredModules.push('layerOptimizer');
    }
    
    if (this.config.enableGlobalOptimization && !this.globalOptimizer) {
      requiredModules.push('globalOptimizer');
    }
    
    if (!this.bottomUpPositioner) {
      console.warn('⚠️ [布局执行器] 缺少位置计算器，将使用后备算法');
    }
    
    if (requiredModules.length > 0) {
      console.warn(`⚠️ [布局执行器] 缺少算法模块: ${requiredModules.join(', ')}, 将跳过相关步骤`);
    }
  }



  /**
   * 计算布局边界
   * @param {Map} positions - 位置映射
   * @returns {Object} 边界信息
   */
  calculateLayoutBounds(positions) {
    if (positions.size === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
    }
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });
    
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }

  /**
   * 生成执行统计
   * @param {Array} phases - 执行阶段
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @param {Object} preprocessedData - 预处理数据
   * @returns {Object} 执行统计
   */
  generateExecutionStats(phases, positions, hierarchy, preprocessedData) {
    const totalPhaseTime = phases.reduce((sum, phase) => sum + phase.executionTime, 0);
    const layoutBounds = this.calculateLayoutBounds(positions);
    
    return {
      phases: phases.map(phase => ({
        name: phase.name,
        executionTime: phase.executionTime,
        percentage: totalPhaseTime > 0 ? Math.round((phase.executionTime / totalPhaseTime) * 100) : 0,
        result: phase.result
      })),
      totalPhaseTime,
      positionedNodes: positions.size,
      totalNodes: preprocessedData.nodes.length,
      positioningRate: preprocessedData.nodes.length > 0 ? 
        Math.round((positions.size / preprocessedData.nodes.length) * 100) : 0,
      layoutBounds,
      layoutDensity: this.calculateLayoutDensity(positions, layoutBounds),
      hierarchyStats: hierarchy ? {
        layerCount: hierarchy.layers ? hierarchy.layers.length : 0,
        avgNodesPerLayer: hierarchy.layers ? 
          hierarchy.layers.reduce((sum, layer) => sum + layer.length, 0) / hierarchy.layers.length : 0,
        maxNodesInLayer: hierarchy.layers ? 
          Math.max(...hierarchy.layers.map(layer => layer.length)) : 0
      } : null
    };
  }

  /**
   * 计算布局密度
   * @param {Map} positions - 位置映射
   * @param {Object} bounds - 边界信息
   * @returns {number} 布局密度
   */
  calculateLayoutDensity(positions, bounds) {
    if (positions.size === 0 || bounds.width === 0 || bounds.height === 0) {
      return 0;
    }
    
    const layoutArea = bounds.width * bounds.height;
    const nodeArea = positions.size * 80 * 40; // 假设平均节点尺寸
    
    return Math.min(1, nodeArea / layoutArea);
  }

  /**
   * 获取执行器状态
   * @returns {Object} 执行器状态
   */
  getExecutorStatus() {
    return {
      config: this.config,
      availableModules: {
        layerCalculator: !!this.layerCalculator,
        hierarchicalBuilder: !!this.hierarchicalBuilder,
        bottomUpPositioner: !!this.bottomUpPositioner,
        layerOptimizer: !!this.layerOptimizer,
        globalOptimizer: !!this.globalOptimizer
      },
      capabilities: {
        hierarchicalLayout: this.config.enableHierarchicalLayout && !!this.hierarchicalBuilder,
        layerOptimization: this.config.enableLayerOptimization && !!this.layerOptimizer,
        globalOptimization: this.config.enableGlobalOptimization && !!this.globalOptimizer,
        positionCalculation: !!this.bottomUpPositioner
      }
    };
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log(`🔧 [布局执行器] 配置已更新`);
  }

  /**
   * 重置执行器
   */
  reset() {
    // 清理可能的内部状态
    console.log(`🔄 [布局执行器] 执行器已重置`);
  }
}

// 默认导出已通过 export class 实现