/**
 * 分布优化算法
 */

import { CoordinateCalculationError } from '../errors/CoordinateErrors.js';

/**
 * 分布算法基类
 */
export class DistributionAlgorithm {
  constructor(name) {
    this.name = name;
    this.config = {};
  }

  /**
   * 优化分布 - 抽象方法
   * @param {Map} positions - 节点位置映射
   * @param {Array} layers - 层级数据
   * @param {Object} config - 配置参数
   * @returns {Map} 优化后的位置映射
   */
  optimize(positions, layers, config) {
    throw new Error('DistributionAlgorithm.optimize() must be implemented');
  }

  /**
   * 验证输入数据
   */
  validateInput(positions, layers, config) {
    if (!(positions instanceof Map)) {
      throw new CoordinateCalculationError('位置数据必须是Map类型');
    }

    if (!Array.isArray(layers)) {
      throw new CoordinateCalculationError('层级数据必须是数组');
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
   * 获取算法信息
   */
  getInfo() {
    return {
      name: this.name,
      config: this.config
    };
  }
}

/**
 * 对称分布算法
 */
export class SymmetricDistribution extends DistributionAlgorithm {
  constructor() {
    super('SymmetricDistribution');
    this.config = {
      centerX: 0,
      symmetryTolerance: 5,
      adjustmentFactor: 0.8
    };
  }

  optimize(positions, layers, config = {}) {
    this.validateInput(positions, layers, config);
    
    const finalConfig = { ...this.config, ...config };
    const optimizedPositions = new Map(positions);
    
    console.log(`🔄 [对称分布] 开始优化 ${positions.size} 个节点的分布`);

    try {
      layers.forEach(layer => {
        this.optimizeLayerSymmetry(layer, optimizedPositions, finalConfig);
      });

      console.log(`✅ [对称分布] 优化完成`);
      return optimizedPositions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `对称分布优化失败: ${error.message}`,
        null,
        { algorithm: this.name, config: finalConfig }
      );
    }
  }

  optimizeLayerSymmetry(layer, positions, config) {
    if (!layer.nodes || layer.nodes.length === 0) return;

    const layerNodes = layer.nodes.filter(node => positions.has(node.id));
    if (layerNodes.length === 0) return;

    // 计算当前分布的中心
    const currentPositions = layerNodes.map(node => positions.get(node.id));
    const currentCenterX = currentPositions.reduce((sum, pos) => sum + pos.x, 0) / currentPositions.length;

    // 计算偏移量
    const offsetX = config.centerX - currentCenterX;

    // 如果偏移量在容忍范围内，则不调整
    if (Math.abs(offsetX) <= config.symmetryTolerance) {
      console.log(`📍 [对称分布] 层级 ${layer.index} 已对称，无需调整`);
      return;
    }

    // 应用对称调整
    const adjustmentX = offsetX * config.adjustmentFactor;
    
    layerNodes.forEach(node => {
      const currentPos = positions.get(node.id);
      const newPos = {
        ...currentPos,
        x: currentPos.x + adjustmentX
      };
      
      positions.set(node.id, newPos);
      console.log(`📍 [对称分布] 节点 ${node.id}: ${currentPos.x.toFixed(1)} -> ${newPos.x.toFixed(1)}`);
    });

    console.log(`🔧 [对称分布] 层级 ${layer.index} 对称调整: ${adjustmentX.toFixed(1)}px`);
  }
}

/**
 * 黄金比例分布算法
 */
export class GoldenRatioDistribution extends DistributionAlgorithm {
  constructor() {
    super('GoldenRatioDistribution');
    this.config = {
      goldenRatio: 1.618,
      baseSpacing: 80,
      maxSpacing: 150,
      minSpacing: 50
    };
  }

  optimize(positions, layers, config = {}) {
    this.validateInput(positions, layers, config);
    
    const finalConfig = { ...this.config, ...config };
    const optimizedPositions = new Map(positions);
    
    console.log(`🔄 [黄金比例分布] 开始优化 ${positions.size} 个节点的分布`);

    try {
      layers.forEach(layer => {
        this.optimizeLayerGoldenRatio(layer, optimizedPositions, finalConfig);
      });

      console.log(`✅ [黄金比例分布] 优化完成`);
      return optimizedPositions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `黄金比例分布优化失败: ${error.message}`,
        null,
        { algorithm: this.name, config: finalConfig }
      );
    }
  }

  optimizeLayerGoldenRatio(layer, positions, config) {
    if (!layer.nodes || layer.nodes.length <= 1) return;

    const layerNodes = layer.nodes.filter(node => positions.has(node.id));
    if (layerNodes.length <= 1) return;

    // 按当前X坐标排序
    layerNodes.sort((a, b) => {
      const posA = positions.get(a.id);
      const posB = positions.get(b.id);
      return posA.x - posB.x;
    });

    // 计算黄金比例间距
    const totalNodes = layerNodes.length;
    const spacings = this.calculateGoldenRatioSpacings(totalNodes, config);

    // 重新分布节点
    let currentX = this.calculateStartX(spacings, config);
    
    layerNodes.forEach((node, index) => {
      const currentPos = positions.get(node.id);
      const newPos = {
        ...currentPos,
        x: currentX
      };
      
      positions.set(node.id, newPos);
      console.log(`📍 [黄金比例分布] 节点 ${node.id}: ${currentPos.x.toFixed(1)} -> ${newPos.x.toFixed(1)}`);
      
      if (index < spacings.length) {
        currentX += spacings[index];
      }
    });

    console.log(`🔧 [黄金比例分布] 层级 ${layer.index} 重新分布完成`);
  }

  calculateGoldenRatioSpacings(nodeCount, config) {
    const spacings = [];
    const { goldenRatio, baseSpacing, maxSpacing, minSpacing } = config;

    for (let i = 0; i < nodeCount - 1; i++) {
      // 使用黄金比例计算间距变化
      const ratio = Math.pow(goldenRatio, (i - (nodeCount - 2) / 2) / (nodeCount - 1));
      let spacing = baseSpacing * ratio;
      
      // 限制间距范围
      spacing = Math.max(minSpacing, Math.min(maxSpacing, spacing));
      spacings.push(spacing);
    }

    return spacings;
  }

  calculateStartX(spacings, config) {
    const totalWidth = spacings.reduce((sum, spacing) => sum + spacing, 0);
    return -totalWidth / 2;
  }
}

/**
 * 均匀分布算法
 */
export class UniformDistribution extends DistributionAlgorithm {
  constructor() {
    super('UniformDistribution');
    this.config = {
      spacing: 80,
      centerAlign: true,
      maintainOrder: true
    };
  }

  optimize(positions, layers, config = {}) {
    this.validateInput(positions, layers, config);
    
    const finalConfig = { ...this.config, ...config };
    const optimizedPositions = new Map(positions);
    
    console.log(`🔄 [均匀分布] 开始优化 ${positions.size} 个节点的分布`);

    try {
      layers.forEach(layer => {
        this.optimizeLayerUniform(layer, optimizedPositions, finalConfig);
      });

      console.log(`✅ [均匀分布] 优化完成`);
      return optimizedPositions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `均匀分布优化失败: ${error.message}`,
        null,
        { algorithm: this.name, config: finalConfig }
      );
    }
  }

  optimizeLayerUniform(layer, positions, config) {
    if (!layer.nodes || layer.nodes.length === 0) return;

    const layerNodes = layer.nodes.filter(node => positions.has(node.id));
    if (layerNodes.length === 0) return;

    // 如果需要保持顺序，按当前X坐标排序
    if (config.maintainOrder) {
      layerNodes.sort((a, b) => {
        const posA = positions.get(a.id);
        const posB = positions.get(b.id);
        return posA.x - posB.x;
      });
    }

    // 计算均匀分布的位置
    const totalWidth = (layerNodes.length - 1) * config.spacing;
    const startX = config.centerAlign ? -totalWidth / 2 : 0;

    layerNodes.forEach((node, index) => {
      const currentPos = positions.get(node.id);
      const newX = startX + index * config.spacing;
      const newPos = {
        ...currentPos,
        x: newX
      };
      
      positions.set(node.id, newPos);
      console.log(`📍 [均匀分布] 节点 ${node.id}: ${currentPos.x.toFixed(1)} -> ${newPos.x.toFixed(1)}`);
    });

    console.log(`🔧 [均匀分布] 层级 ${layer.index} 均匀分布完成，间距: ${config.spacing}px`);
  }
}

/**
 * 力导向分布算法
 */
export class ForceDirectedDistribution extends DistributionAlgorithm {
  constructor() {
    super('ForceDirectedDistribution');
    this.config = {
      iterations: 50,
      repulsionForce: 100,
      attractionForce: 0.1,
      damping: 0.9,
      minDistance: 60
    };
  }

  optimize(positions, layers, config = {}) {
    this.validateInput(positions, layers, config);
    
    const finalConfig = { ...this.config, ...config };
    const optimizedPositions = new Map(positions);
    
    console.log(`🔄 [力导向分布] 开始优化 ${positions.size} 个节点的分布`);

    try {
      layers.forEach(layer => {
        this.optimizeLayerForceDirected(layer, optimizedPositions, finalConfig);
      });

      console.log(`✅ [力导向分布] 优化完成`);
      return optimizedPositions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `力导向分布优化失败: ${error.message}`,
        null,
        { algorithm: this.name, config: finalConfig }
      );
    }
  }

  optimizeLayerForceDirected(layer, positions, config) {
    if (!layer.nodes || layer.nodes.length <= 1) return;

    const layerNodes = layer.nodes.filter(node => positions.has(node.id));
    if (layerNodes.length <= 1) return;

    console.log(`🔧 [力导向分布] 开始优化层级 ${layer.index}，${layerNodes.length} 个节点`);

    // 初始化速度
    const velocities = new Map();
    layerNodes.forEach(node => {
      velocities.set(node.id, { x: 0, y: 0 });
    });

    // 迭代优化
    for (let iteration = 0; iteration < config.iterations; iteration++) {
      const forces = this.calculateForces(layerNodes, positions, config);
      
      // 更新速度和位置
      layerNodes.forEach(node => {
        const force = forces.get(node.id);
        const velocity = velocities.get(node.id);
        const currentPos = positions.get(node.id);

        // 更新速度（只在X方向，Y方向保持不变）
        velocity.x = (velocity.x + force.x) * config.damping;

        // 更新位置
        const newPos = {
          ...currentPos,
          x: currentPos.x + velocity.x
        };

        positions.set(node.id, newPos);
        velocities.set(node.id, velocity);
      });

      // 每10次迭代输出一次进度
      if (iteration % 10 === 0) {
        console.log(`🔄 [力导向分布] 层级 ${layer.index} 迭代 ${iteration}/${config.iterations}`);
      }
    }

    console.log(`✅ [力导向分布] 层级 ${layer.index} 优化完成`);
  }

  calculateForces(layerNodes, positions, config) {
    const forces = new Map();
    
    // 初始化力
    layerNodes.forEach(node => {
      forces.set(node.id, { x: 0, y: 0 });
    });

    // 计算节点间的排斥力
    for (let i = 0; i < layerNodes.length; i++) {
      for (let j = i + 1; j < layerNodes.length; j++) {
        const nodeA = layerNodes[i];
        const nodeB = layerNodes[j];
        const posA = positions.get(nodeA.id);
        const posB = positions.get(nodeB.id);

        const dx = posA.x - posB.x;
        const distance = Math.abs(dx);

        if (distance < config.minDistance) {
          const repulsionMagnitude = config.repulsionForce / Math.max(distance, 1);
          const forceDirection = dx > 0 ? 1 : -1;

          const forceA = forces.get(nodeA.id);
          const forceB = forces.get(nodeB.id);

          forceA.x += repulsionMagnitude * forceDirection;
          forceB.x -= repulsionMagnitude * forceDirection;

          forces.set(nodeA.id, forceA);
          forces.set(nodeB.id, forceB);
        }
      }
    }

    return forces;
  }
}

/**
 * 算法工厂
 */
export class AlgorithmFactory {
  static algorithms = new Map([
    ['symmetric', SymmetricDistribution],
    ['goldenRatio', GoldenRatioDistribution],
    ['uniform', UniformDistribution],
    ['forceDirected', ForceDirectedDistribution]
  ]);

  /**
   * 创建算法实例
   */
  static createAlgorithm(algorithmName, config = {}) {
    const AlgorithmClass = this.algorithms.get(algorithmName);
    
    if (!AlgorithmClass) {
      throw new CoordinateCalculationError(
        `未知的分布算法: ${algorithmName}`,
        null,
        { availableAlgorithms: Array.from(this.algorithms.keys()) }
      );
    }

    const algorithm = new AlgorithmClass();
    if (config) {
      algorithm.setConfig(config);
    }

    return algorithm;
  }

  /**
   * 获取所有可用算法
   */
  static getAvailableAlgorithms() {
    return Array.from(this.algorithms.keys());
  }

  /**
   * 注册新算法
   */
  static registerAlgorithm(name, algorithmClass) {
    if (!(algorithmClass.prototype instanceof DistributionAlgorithm)) {
      throw new CoordinateCalculationError(
        `算法类必须继承自 DistributionAlgorithm: ${name}`
      );
    }

    this.algorithms.set(name, algorithmClass);
    console.log(`✅ [算法工厂] 注册新算法: ${name}`);
  }

  /**
   * 移除算法
   */
  static removeAlgorithm(name) {
    const removed = this.algorithms.delete(name);
    if (removed) {
      console.log(`🗑️ [算法工厂] 移除算法: ${name}`);
    }
    return removed;
  }
}