/**
 * 混合层级对称分布算法
 * 专门处理包含普通节点和虚拟endpoint节点的层级布局
 */

export class MixedLayerSymmetricDistribution {
  constructor() {
    this.name = 'MixedLayerSymmetricDistribution';
    this.config = {
      // 基础间距配置
      normalNodeSpacing: 160,      // 普通节点间距
      endpointSpacing: 120,        // endpoint节点间距
      mixedLayerSpacing: 140,      // 混合层级间距
      
      // 最小间距保证
      minSpacing: 100,
      maxSpacing: 250,
      
      // 节点类型权重
      nodeTypeWeights: {
        'normal': 1.0,
        'endpoint': 0.8,
        'split': 1.2
      }
    };
  }

  /**
   * 优化混合层级的对称分布
   * @param {any[]} layerNodes - 层级中的所有节点
   * @param {any} options - 配置选项
   * @returns {any[]} 优化后的节点位置
   */
  optimizeLayer(layerNodes, options = {}) {
    if (!layerNodes || layerNodes.length === 0) {
      return [];
    }

    console.log(`🔄 [混合层级对称分布] 开始优化 ${layerNodes.length} 个节点`);

    // 分析层级组成
    const analysis = this.analyzeLayerComposition(layerNodes);
    console.log(`📊 [层级分析]`, analysis);

    // 根据层级组成选择分布策略
    const strategy = this.selectDistributionStrategy(analysis);
    console.log(`🎯 [分布策略] 选择策略: ${strategy.name}`);

    // 应用分布策略
    const optimizedPositions = this.applyDistributionStrategy(layerNodes, strategy, analysis);
    
    console.log(`✅ [混合层级对称分布] 完成优化，生成 ${optimizedPositions.length} 个位置`);
    return optimizedPositions;
  }

  /**
   * 分析层级组成
   * @param {any[]} layerNodes - 层级节点
   * @returns {any} 分析结果
   */
  analyzeLayerComposition(layerNodes) {
    const normalNodes = layerNodes.filter(node => 
      !node.nodeType || node.nodeType === 'normal' || node.nodeType === 'split'
    );
    const endpointNodes = layerNodes.filter(node => 
      node.nodeType === 'endpoint'
    );

    return {
      totalCount: layerNodes.length,
      normalCount: normalNodes.length,
      endpointCount: endpointNodes.length,
      isMixed: normalNodes.length > 0 && endpointNodes.length > 0,
      isPureNormal: normalNodes.length > 0 && endpointNodes.length === 0,
      isPureEndpoint: normalNodes.length === 0 && endpointNodes.length > 0,
      normalNodes,
      endpointNodes
    };
  }

  /**
   * 选择分布策略
   * @param {any} analysis - 层级分析结果
   * @returns {any} 分布策略
   */
  selectDistributionStrategy(analysis) {
    if (analysis.isPureNormal) {
      return {
        name: 'PureNormalSymmetric',
        spacing: this.config.normalNodeSpacing,
        method: 'symmetric'
      };
    }

    if (analysis.isPureEndpoint) {
      return {
        name: 'PureEndpointSymmetric', 
        spacing: this.config.endpointSpacing,
        method: 'symmetric'
      };
    }

    if (analysis.isMixed) {
      return {
        name: 'MixedLayerSymmetric',
        spacing: this.config.mixedLayerSpacing,
        method: 'mixed'
      };
    }

    return {
      name: 'DefaultSymmetric',
      spacing: this.config.normalNodeSpacing,
      method: 'symmetric'
    };
  }

  /**
   * 应用分布策略
   * @param {any[]} layerNodes - 层级节点
   * @param {any} strategy - 分布策略
   * @param {any} analysis - 层级分析
   * @returns {any[]} 节点位置数组
   */
  applyDistributionStrategy(layerNodes, strategy, analysis) {
    switch (strategy.method) {
      case 'mixed':
        return this.applyMixedLayerDistribution(layerNodes, strategy, analysis);
      case 'symmetric':
        return this.applySymmetricDistribution(layerNodes, strategy);
      default:
        return this.applyDefaultDistribution(layerNodes, strategy);
    }
  }

  /**
   * 应用混合层级分布
   * @param {any[]} layerNodes - 层级节点
   * @param {any} strategy - 分布策略
   * @param {any} analysis - 层级分析
   * @returns {any[]} 节点位置数组
   */
  applyMixedLayerDistribution(layerNodes, strategy, analysis) {
    const { normalNodes, endpointNodes } = analysis;
    const positions = [];

    // 🔧 关键策略：混合层级中，普通节点和endpoint节点分别对称分布，然后整体居中
    
    // 1. 先处理普通节点的对称分布
    if (normalNodes.length > 0) {
      const normalPositions = this.calculateSymmetricPositions(
        normalNodes.length, 
        this.config.normalNodeSpacing
      );
      
      normalNodes.forEach((node, index) => {
        positions.push({
          nodeId: node.nodeId || node.id,
          x: normalPositions[index],
          y: node.pos?.y || node.y || 0,
          nodeType: 'normal',
          priority: 1
        });
      });
    }

    // 2. 再处理endpoint节点的对称分布
    if (endpointNodes.length > 0) {
      const endpointPositions = this.calculateSymmetricPositions(
        endpointNodes.length,
        this.config.endpointSpacing
      );
      
      endpointNodes.forEach((node, index) => {
        positions.push({
          nodeId: node.nodeId || node.id,
          x: endpointPositions[index],
          y: node.pos?.y || node.y || 0,
          nodeType: 'endpoint',
          priority: 2
        });
      });
    }

    // 3. 整体居中调整
    const allXPositions = positions.map(p => p.x);
    const centerX = allXPositions.reduce((sum, x) => sum + x, 0) / allXPositions.length;
    const offsetX = -centerX; // 移动到中心

    positions.forEach(pos => {
      pos.x += offsetX;
    });

    console.log(`🎯 [混合层级分布] 普通节点: ${normalNodes.length}, endpoint: ${endpointNodes.length}, 整体偏移: ${offsetX.toFixed(1)}`);
    
    return positions;
  }

  /**
   * 应用对称分布
   * @param {any[]} layerNodes - 层级节点
   * @param {any} strategy - 分布策略
   * @returns {any[]} 节点位置数组
   */
  applySymmetricDistribution(layerNodes, strategy) {
    const positions = this.calculateSymmetricPositions(layerNodes.length, strategy.spacing);
    
    return layerNodes.map((node, index) => ({
      nodeId: node.nodeId || node.id,
      x: positions[index],
      y: node.pos?.y || node.y || 0,
      nodeType: node.nodeType || 'normal',
      priority: 1
    }));
  }

  /**
   * 计算对称位置
   * @param {number} nodeCount - 节点数量
   * @param {number} baseSpacing - 基础间距
   * @returns {number[]} 位置数组
   */
  calculateSymmetricPositions(nodeCount, baseSpacing) {
    if (nodeCount === 1) {
      return [0];
    }

    if (nodeCount === 2) {
      const spacing = Math.max(this.config.minSpacing, baseSpacing);
      return [-spacing/2, spacing/2];
    }

    if (nodeCount === 3) {
      const spacing = Math.max(this.config.minSpacing * 0.8, baseSpacing * 0.8);
      return [-spacing, 0, spacing];
    }

    if (nodeCount === 4) {
      const spacing = Math.max(this.config.minSpacing * 0.7, baseSpacing * 0.7);
      return [-spacing*1.5, -spacing*0.5, spacing*0.5, spacing*1.5];
    }

    // 动态对称分布（5个或更多节点）
    const adaptiveSpacing = Math.max(
      this.config.minSpacing,
      Math.min(baseSpacing, this.config.maxSpacing / (nodeCount - 1))
    );
    
    const totalWidth = (nodeCount - 1) * adaptiveSpacing;
    const startX = -totalWidth / 2;
    
    return Array.from({length: nodeCount}, (_, i) => startX + i * adaptiveSpacing);
  }

  /**
   * 应用默认分布
   * @param {any[]} layerNodes - 层级节点
   * @param {any} strategy - 分布策略
   * @returns {any[]} 节点位置数组
   */
  applyDefaultDistribution(layerNodes, strategy) {
    return this.applySymmetricDistribution(layerNodes, strategy);
  }

  /**
   * 验证分布结果
   * @param {any[]} positions - 位置数组
   * @returns {any} 验证结果
   */
  validateDistribution(positions) {
    if (!positions || positions.length === 0) {
      return {
        isValid: false,
        errors: ['位置数组为空']
      };
    }

    const errors = [];
    const warnings = [];

    // 检查间距是否合理
    for (let i = 0; i < positions.length - 1; i++) {
      const distance = Math.abs(positions[i + 1].x - positions[i].x);
      if (distance < this.config.minSpacing) {
        errors.push(`节点 ${i} 和 ${i + 1} 间距过小: ${distance.toFixed(1)}px`);
      }
      if (distance > this.config.maxSpacing) {
        warnings.push(`节点 ${i} 和 ${i + 1} 间距过大: ${distance.toFixed(1)}px`);
      }
    }

    // 检查是否居中
    const allX = positions.map(p => p.x);
    const centerX = allX.reduce((sum, x) => sum + x, 0) / allX.length;
    if (Math.abs(centerX) > 10) {
      warnings.push(`整体布局未居中，偏移: ${centerX.toFixed(1)}px`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      centerOffset: centerX,
      totalNodes: positions.length
    };
  }

  /**
   * 获取推荐间距
   * @param {string} nodeType - 节点类型
   * @param {number} nodeCount - 节点数量
   * @returns {number} 推荐间距
   */
  getRecommendedSpacing(nodeType, nodeCount) {
    let baseSpacing;
    
    switch (nodeType) {
      case 'endpoint':
        baseSpacing = this.config.endpointSpacing;
        break;
      case 'normal':
      case 'split':
        baseSpacing = this.config.normalNodeSpacing;
        break;
      default:
        baseSpacing = this.config.mixedLayerSpacing;
    }

    // 根据节点数量调整间距
    if (nodeCount > 4) {
      baseSpacing = Math.max(this.config.minSpacing, baseSpacing * 0.8);
    }

    return Math.min(this.config.maxSpacing, Math.max(this.config.minSpacing, baseSpacing));
  }
}

export default MixedLayerSymmetricDistribution;