/**
 * 层级位置计算策略
 */

import { CoordinateCalculationError } from '../errors/CoordinateErrors.js';

/**
 * 层级计算策略基类
 */
export class LayerCalculationStrategy {
  constructor(name) {
    this.name = name;
    this.config = {};
  }

  /**
   * 计算层级位置 - 抽象方法
   * @param {Array} layers - 层级数据
   * @param {Object} config - 配置参数
   * @returns {Map} 节点位置映射
   */
  calculate(layers, config) {
    throw new Error('LayerCalculationStrategy.calculate() must be implemented');
  }

  /**
   * 验证输入数据
   */
  validateInput(layers, config) {
    if (!Array.isArray(layers)) {
      throw new CoordinateCalculationError('层级数据必须是数组');
    }

    if (!config || typeof config !== 'object') {
      throw new CoordinateCalculationError('配置参数必须是对象');
    }

    return true;
  }

  /**
   * 设置配置
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取策略信息
   */
  getInfo() {
    return {
      name: this.name,
      config: this.config
    };
  }
}

/**
 * 自底向上计算策略
 */
export class BottomUpStrategy extends LayerCalculationStrategy {
  constructor() {
    super('BottomUpStrategy');
    this.config = {
      baseY: 100,
      layerSpacing: 120,
      nodeSpacing: 80,
      centerAlign: true
    };
  }

  calculate(layers, config = {}) {
    this.validateInput(layers, config);
    
    const finalConfig = { ...this.config, ...config };
    const positions = new Map();
    
    console.log(`🔄 [自底向上策略] 开始计算 ${layers.length} 个层级的位置`);

    try {
      // 从最底层开始计算
      for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
        const layer = layers[layerIndex];
        const layerY = finalConfig.baseY + (layers.length - 1 - layerIndex) * finalConfig.layerSpacing;
        
        this.calculateLayerPositions(layer, layerY, finalConfig, positions);
      }

      console.log(`✅ [自底向上策略] 计算完成，共处理 ${positions.size} 个节点`);
      return positions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `自底向上策略计算失败: ${error.message}`,
        null,
        { strategy: this.name, config: finalConfig }
      );
    }
  }

  calculateLayerPositions(layer, layerY, config, positions) {
    if (!layer.nodes || layer.nodes.length === 0) return;

    const totalWidth = (layer.nodes.length - 1) * config.nodeSpacing;
    const startX = config.centerAlign ? -totalWidth / 2 : 0;

    layer.nodes.forEach((node, index) => {
      const x = startX + index * config.nodeSpacing;
      const y = layerY;

      positions.set(node.id, { x, y, layerIndex: layer.index });
      
      console.log(`📍 [自底向上策略] 节点 ${node.id}: (${x}, ${y})`);
    });
  }
}

/**
 * 自顶向下计算策略
 */
export class TopDownStrategy extends LayerCalculationStrategy {
  constructor() {
    super('TopDownStrategy');
    this.config = {
      baseY: 100,
      layerSpacing: 120,
      nodeSpacing: 80,
      centerAlign: true
    };
  }

  calculate(layers, config = {}) {
    this.validateInput(layers, config);
    
    const finalConfig = { ...this.config, ...config };
    const positions = new Map();
    
    console.log(`🔄 [自顶向下策略] 开始计算 ${layers.length} 个层级的位置`);

    try {
      // 从最顶层开始计算
      for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        const layer = layers[layerIndex];
        const layerY = finalConfig.baseY + layerIndex * finalConfig.layerSpacing;
        
        this.calculateLayerPositions(layer, layerY, finalConfig, positions);
      }

      console.log(`✅ [自顶向下策略] 计算完成，共处理 ${positions.size} 个节点`);
      return positions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `自顶向下策略计算失败: ${error.message}`,
        null,
        { strategy: this.name, config: finalConfig }
      );
    }
  }

  calculateLayerPositions(layer, layerY, config, positions) {
    if (!layer.nodes || layer.nodes.length === 0) return;

    const totalWidth = (layer.nodes.length - 1) * config.nodeSpacing;
    const startX = config.centerAlign ? -totalWidth / 2 : 0;

    layer.nodes.forEach((node, index) => {
      const x = startX + index * config.nodeSpacing;
      const y = layerY;

      positions.set(node.id, { x, y, layerIndex: layer.index });
      
      console.log(`📍 [自顶向下策略] 节点 ${node.id}: (${x}, ${y})`);
    });
  }
}

/**
 * 中心对齐策略
 */
export class CenterAlignStrategy extends LayerCalculationStrategy {
  constructor() {
    super('CenterAlignStrategy');
    this.config = {
      baseY: 100,
      layerSpacing: 120,
      nodeSpacing: 80,
      centerPoint: { x: 0, y: 0 }
    };
  }

  calculate(layers, config = {}) {
    this.validateInput(layers, config);
    
    const finalConfig = { ...this.config, ...config };
    const positions = new Map();
    
    console.log(`🔄 [中心对齐策略] 开始计算 ${layers.length} 个层级的位置`);

    try {
      const centerY = finalConfig.centerPoint.y;
      const totalHeight = (layers.length - 1) * finalConfig.layerSpacing;
      const startY = centerY - totalHeight / 2;

      layers.forEach((layer, layerIndex) => {
        const layerY = startY + layerIndex * finalConfig.layerSpacing;
        this.calculateLayerPositions(layer, layerY, finalConfig, positions);
      });

      console.log(`✅ [中心对齐策略] 计算完成，共处理 ${positions.size} 个节点`);
      return positions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `中心对齐策略计算失败: ${error.message}`,
        null,
        { strategy: this.name, config: finalConfig }
      );
    }
  }

  calculateLayerPositions(layer, layerY, config, positions) {
    if (!layer.nodes || layer.nodes.length === 0) return;

    const totalWidth = (layer.nodes.length - 1) * config.nodeSpacing;
    const startX = config.centerPoint.x - totalWidth / 2;

    layer.nodes.forEach((node, index) => {
      const x = startX + index * config.nodeSpacing;
      const y = layerY;

      positions.set(node.id, { x, y, layerIndex: layer.index });
      
      console.log(`📍 [中心对齐策略] 节点 ${node.id}: (${x}, ${y})`);
    });
  }
}

/**
 * 自适应策略
 */
export class AdaptiveStrategy extends LayerCalculationStrategy {
  constructor() {
    super('AdaptiveStrategy');
    this.config = {
      baseY: 100,
      minLayerSpacing: 100,
      maxLayerSpacing: 150,
      minNodeSpacing: 60,
      maxNodeSpacing: 120,
      adaptToContent: true
    };
  }

  calculate(layers, config = {}) {
    this.validateInput(layers, config);
    
    const finalConfig = { ...this.config, ...config };
    const positions = new Map();
    
    console.log(`🔄 [自适应策略] 开始计算 ${layers.length} 个层级的位置`);

    try {
      // 分析层级特征
      const layerAnalysis = this.analyzeLayers(layers);
      
      // 根据分析结果调整间距
      const adaptedConfig = this.adaptSpacing(finalConfig, layerAnalysis);

      // 计算位置
      layers.forEach((layer, layerIndex) => {
        const layerY = adaptedConfig.baseY + layerIndex * adaptedConfig.layerSpacing;
        this.calculateAdaptiveLayerPositions(layer, layerY, adaptedConfig, positions, layerAnalysis);
      });

      console.log(`✅ [自适应策略] 计算完成，共处理 ${positions.size} 个节点`);
      return positions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `自适应策略计算失败: ${error.message}`,
        null,
        { strategy: this.name, config: finalConfig }
      );
    }
  }

  analyzeLayers(layers) {
    const analysis = {
      maxNodesInLayer: 0,
      avgNodesPerLayer: 0,
      totalNodes: 0,
      layerComplexity: []
    };

    layers.forEach(layer => {
      const nodeCount = layer.nodes ? layer.nodes.length : 0;
      analysis.maxNodesInLayer = Math.max(analysis.maxNodesInLayer, nodeCount);
      analysis.totalNodes += nodeCount;
      analysis.layerComplexity.push({
        layerIndex: layer.index,
        nodeCount,
        complexity: this.calculateLayerComplexity(layer)
      });
    });

    analysis.avgNodesPerLayer = analysis.totalNodes / layers.length;

    return analysis;
  }

  calculateLayerComplexity(layer) {
    // 根据节点数量、连接数等计算复杂度
    const nodeCount = layer.nodes ? layer.nodes.length : 0;
    const connectionCount = layer.connections ? layer.connections.length : 0;
    
    return nodeCount * 0.6 + connectionCount * 0.4;
  }

  adaptSpacing(config, analysis) {
    const adaptedConfig = { ...config };

    // 根据最大节点数调整节点间距
    if (analysis.maxNodesInLayer > 5) {
      adaptedConfig.nodeSpacing = Math.max(
        config.minNodeSpacing,
        config.maxNodeSpacing - (analysis.maxNodesInLayer - 5) * 10
      );
    }

    // 根据层级数量调整层级间距
    if (analysis.layerComplexity.length > 3) {
      adaptedConfig.layerSpacing = Math.max(
        config.minLayerSpacing,
        config.maxLayerSpacing - (analysis.layerComplexity.length - 3) * 5
      );
    }

    console.log(`🔧 [自适应策略] 调整后的配置:`, adaptedConfig);
    return adaptedConfig;
  }

  calculateAdaptiveLayerPositions(layer, layerY, config, positions, analysis) {
    if (!layer.nodes || layer.nodes.length === 0) return;

    const layerComplexity = analysis.layerComplexity.find(c => c.layerIndex === layer.index);
    const complexityFactor = layerComplexity ? layerComplexity.complexity / 10 : 1;
    
    // 根据复杂度调整节点间距
    const adaptedNodeSpacing = config.nodeSpacing * Math.max(0.8, Math.min(1.2, complexityFactor));
    
    const totalWidth = (layer.nodes.length - 1) * adaptedNodeSpacing;
    const startX = -totalWidth / 2;

    layer.nodes.forEach((node, index) => {
      const x = startX + index * adaptedNodeSpacing;
      const y = layerY;

      positions.set(node.id, { x, y, layerIndex: layer.index });
      
      console.log(`📍 [自适应策略] 节点 ${node.id}: (${x}, ${y}), 间距: ${adaptedNodeSpacing.toFixed(1)}`);
    });
  }
}

/**
 * 策略工厂
 */
export class StrategyFactory {
  static strategies = new Map([
    ['bottomUp', BottomUpStrategy],
    ['topDown', TopDownStrategy],
    ['centerAlign', CenterAlignStrategy],
    ['adaptive', AdaptiveStrategy]
  ]);

  /**
   * 创建策略实例
   */
  static createStrategy(strategyName, config = {}) {
    const StrategyClass = this.strategies.get(strategyName);
    
    if (!StrategyClass) {
      throw new CoordinateCalculationError(
        `未知的计算策略: ${strategyName}`,
        null,
        { availableStrategies: Array.from(this.strategies.keys()) }
      );
    }

    const strategy = new StrategyClass();
    if (config) {
      strategy.setConfig(config);
    }

    return strategy;
  }

  /**
   * 获取所有可用策略
   */
  static getAvailableStrategies() {
    return Array.from(this.strategies.keys());
  }

  /**
   * 注册新策略
   */
  static registerStrategy(name, strategyClass) {
    if (!(strategyClass.prototype instanceof LayerCalculationStrategy)) {
      throw new CoordinateCalculationError(
        `策略类必须继承自 LayerCalculationStrategy: ${name}`
      );
    }

    this.strategies.set(name, strategyClass);
    console.log(`✅ [策略工厂] 注册新策略: ${name}`);
  }

  /**
   * 移除策略
   */
  static removeStrategy(name) {
    const removed = this.strategies.delete(name);
    if (removed) {
      console.log(`🗑️ [策略工厂] 移除策略: ${name}`);
    }
    return removed;
  }
}