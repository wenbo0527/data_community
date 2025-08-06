/**
 * 坐标计算器 - 核心计算模块
 */

import { StrategyFactory } from '../strategies/LayerCalculationStrategies.js';
import { AlgorithmFactory } from '../strategies/DistributionAlgorithms.js';
import { CoordinateCalculationError, globalErrorHandler } from '../errors/CoordinateErrors.js';

/**
 * 坐标计算器主类
 */
export class CoordinateCalculator {
  constructor(config = {}) {
    this.config = {
      // 默认策略配置
      layerStrategy: 'adaptive',
      distributionAlgorithm: 'symmetric',
      
      // 计算配置
      precision: 2,
      enableCache: true,
      enableValidation: true,
      enableOptimization: true,
      
      // 性能配置
      batchSize: 50,
      maxIterations: 100,
      
      // 调试配置
      enableDebug: false,
      logLevel: 'info',
      
      ...config
    };

    // 初始化组件
    this.layerStrategy = null;
    this.distributionAlgorithm = null;
    this.cache = new Map();
    this.calculationHistory = [];
    this.performance = {
      totalCalculations: 0,
      totalTime: 0,
      averageTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    this.initializeComponents();
  }

  /**
   * 初始化计算组件
   */
  initializeComponents() {
    try {
      this.layerStrategy = StrategyFactory.createStrategy(
        this.config.layerStrategy,
        this.config.strategyConfig || {}
      );

      this.distributionAlgorithm = AlgorithmFactory.createAlgorithm(
        this.config.distributionAlgorithm,
        this.config.algorithmConfig || {}
      );

      console.log(`✅ [坐标计算器] 初始化完成 - 策略: ${this.config.layerStrategy}, 算法: ${this.config.distributionAlgorithm}`);
    } catch (error) {
      globalErrorHandler.handleError(error, { component: 'CoordinateCalculator', method: 'initializeComponents' });
      throw error;
    }
  }

  /**
   * 计算坐标 - 主入口方法
   * @param {Array} layers - 层级数据
   * @param {Object} options - 计算选项
   * @returns {Promise<Map>} 节点位置映射
   */
  async calculate(layers, options = {}) {
    const startTime = performance.now();
    const calculationId = this.generateCalculationId();
    
    console.log(`🔄 [坐标计算器] 开始计算 - ID: ${calculationId}`);

    try {
      // 验证输入数据
      if (this.config.enableValidation) {
        this.validateInput(layers, options);
      }

      // 检查缓存
      if (this.config.enableCache) {
        const cachedResult = this.checkCache(layers, options);
        if (cachedResult) {
          this.performance.cacheHits++;
          console.log(`✅ [坐标计算器] 使用缓存结果 - ID: ${calculationId}`);
          return cachedResult;
        }
        this.performance.cacheMisses++;
      }

      // 数据预处理
      const preprocessedLayers = await this.preprocessData(layers, options);

      // 层级位置计算
      const layerPositions = await this.calculateLayerPositions(preprocessedLayers, options);

      // 分布优化
      let optimizedPositions = layerPositions;
      if (this.config.enableOptimization) {
        optimizedPositions = await this.optimizeDistribution(layerPositions, preprocessedLayers, options);
      }

      // 异常检测和修正
      const finalPositions = await this.detectAndCorrectAnomalies(optimizedPositions, preprocessedLayers, options);

      // 精度处理
      const precisePositions = this.applyPrecision(finalPositions);

      // 缓存结果
      if (this.config.enableCache) {
        this.cacheResult(layers, options, precisePositions);
      }

      // 记录性能数据
      const endTime = performance.now();
      const calculationTime = endTime - startTime;
      this.recordPerformance(calculationTime);

      // 记录计算历史
      this.recordCalculationHistory(calculationId, {
        layers: layers.length,
        nodes: precisePositions.size,
        time: calculationTime,
        strategy: this.config.layerStrategy,
        algorithm: this.config.distributionAlgorithm,
        options
      });

      console.log(`✅ [坐标计算器] 计算完成 - ID: ${calculationId}, 耗时: ${calculationTime.toFixed(2)}ms, 节点数: ${precisePositions.size}`);
      
      return precisePositions;
    } catch (error) {
      const calculationError = new CoordinateCalculationError(
        `坐标计算失败: ${error.message}`,
        null,
        { calculationId, layers: layers.length, config: this.config }
      );
      
      globalErrorHandler.handleError(calculationError, { 
        component: 'CoordinateCalculator', 
        method: 'calculate',
        calculationId 
      });
      
      throw calculationError;
    }
  }

  /**
   * 验证输入数据
   */
  validateInput(layers, options) {
    if (!Array.isArray(layers)) {
      throw new CoordinateCalculationError('层级数据必须是数组');
    }

    if (layers.length === 0) {
      throw new CoordinateCalculationError('层级数据不能为空');
    }

    layers.forEach((layer, index) => {
      if (!layer || typeof layer !== 'object') {
        throw new CoordinateCalculationError(`层级 ${index} 数据格式错误`);
      }

      if (!Array.isArray(layer.nodes)) {
        throw new CoordinateCalculationError(`层级 ${index} 缺少节点数据`);
      }
    });

    console.log(`✅ [坐标计算器] 输入验证通过 - ${layers.length} 个层级`);
  }

  /**
   * 数据预处理
   */
  async preprocessData(layers, options) {
    console.log(`🔄 [坐标计算器] 开始数据预处理`);

    const preprocessedLayers = layers.map((layer, index) => {
      const processedLayer = {
        ...layer,
        index: layer.index !== undefined ? layer.index : index,
        nodes: layer.nodes.map(node => ({
          ...node,
          id: node.id || `node_${index}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };

      // 添加层级元数据
      processedLayer.metadata = {
        nodeCount: processedLayer.nodes.length,
        hasConnections: !!(layer.connections && layer.connections.length > 0),
        complexity: this.calculateLayerComplexity(processedLayer)
      };

      return processedLayer;
    });

    console.log(`✅ [坐标计算器] 数据预处理完成`);
    return preprocessedLayers;
  }

  /**
   * 计算层级复杂度
   */
  calculateLayerComplexity(layer) {
    const nodeCount = layer.nodes.length;
    const connectionCount = layer.connections ? layer.connections.length : 0;
    const branchCount = layer.branches ? layer.branches.length : 0;
    
    return nodeCount * 0.5 + connectionCount * 0.3 + branchCount * 0.2;
  }

  /**
   * 计算层级位置
   */
  async calculateLayerPositions(layers, options) {
    console.log(`🔄 [坐标计算器] 开始层级位置计算`);

    try {
      const positions = this.layerStrategy.calculate(layers, {
        ...this.config.strategyConfig,
        ...options.strategyConfig
      });

      console.log(`✅ [坐标计算器] 层级位置计算完成 - ${positions.size} 个节点`);
      return positions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `层级位置计算失败: ${error.message}`,
        null,
        { strategy: this.config.layerStrategy }
      );
    }
  }

  /**
   * 优化分布
   */
  async optimizeDistribution(positions, layers, options) {
    console.log(`🔄 [坐标计算器] 开始分布优化`);

    try {
      const optimizedPositions = this.distributionAlgorithm.optimize(positions, layers, {
        ...this.config.algorithmConfig,
        ...options.algorithmConfig
      });

      console.log(`✅ [坐标计算器] 分布优化完成`);
      return optimizedPositions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `分布优化失败: ${error.message}`,
        null,
        { algorithm: this.config.distributionAlgorithm }
      );
    }
  }

  /**
   * 异常检测和修正
   */
  async detectAndCorrectAnomalies(positions, layers, options) {
    console.log(`🔄 [坐标计算器] 开始异常检测和修正`);

    const correctedPositions = new Map(positions);
    let anomaliesDetected = 0;
    let anomaliesCorrected = 0;

    try {
      // 检测重叠节点
      const overlaps = this.detectOverlaps(correctedPositions);
      if (overlaps.length > 0) {
        anomaliesDetected += overlaps.length;
        anomaliesCorrected += this.correctOverlaps(correctedPositions, overlaps);
      }

      // 检测异常偏移
      const offsets = this.detectExcessiveOffsets(correctedPositions, layers);
      if (offsets.length > 0) {
        anomaliesDetected += offsets.length;
        anomaliesCorrected += this.correctExcessiveOffsets(correctedPositions, offsets);
      }

      // 检测层级不一致
      const inconsistencies = this.detectLayerInconsistencies(correctedPositions, layers);
      if (inconsistencies.length > 0) {
        anomaliesDetected += inconsistencies.length;
        anomaliesCorrected += this.correctLayerInconsistencies(correctedPositions, inconsistencies);
      }

      console.log(`✅ [坐标计算器] 异常检测完成 - 检测到: ${anomaliesDetected}, 修正: ${anomaliesCorrected}`);
      return correctedPositions;
    } catch (error) {
      throw new CoordinateCalculationError(
        `异常检测和修正失败: ${error.message}`,
        null,
        { anomaliesDetected, anomaliesCorrected }
      );
    }
  }

  /**
   * 检测重叠节点
   */
  detectOverlaps(positions) {
    const overlaps = [];
    const positionArray = Array.from(positions.entries());
    const minDistance = 50; // 最小距离阈值

    for (let i = 0; i < positionArray.length; i++) {
      for (let j = i + 1; j < positionArray.length; j++) {
        const [nodeIdA, posA] = positionArray[i];
        const [nodeIdB, posB] = positionArray[j];

        const distance = Math.sqrt(
          Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2)
        );

        if (distance < minDistance) {
          overlaps.push({
            nodeA: nodeIdA,
            nodeB: nodeIdB,
            distance,
            positionA: posA,
            positionB: posB
          });
        }
      }
    }

    return overlaps;
  }

  /**
   * 修正重叠节点
   */
  correctOverlaps(positions, overlaps) {
    let corrected = 0;
    const minDistance = 60;

    overlaps.forEach(overlap => {
      const { nodeA, nodeB, positionA, positionB } = overlap;
      
      // 计算分离向量
      const dx = positionB.x - positionA.x;
      const dy = positionB.y - positionA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) {
        // 完全重叠，随机分离
        const angle = Math.random() * 2 * Math.PI;
        const separationX = Math.cos(angle) * minDistance / 2;
        const separationY = Math.sin(angle) * minDistance / 2;
        
        positions.set(nodeA, {
          ...positionA,
          x: positionA.x - separationX,
          y: positionA.y - separationY
        });
        
        positions.set(nodeB, {
          ...positionB,
          x: positionB.x + separationX,
          y: positionB.y + separationY
        });
      } else {
        // 按比例分离
        const separationDistance = (minDistance - distance) / 2;
        const unitX = dx / distance;
        const unitY = dy / distance;
        
        positions.set(nodeA, {
          ...positionA,
          x: positionA.x - unitX * separationDistance,
          y: positionA.y - unitY * separationDistance
        });
        
        positions.set(nodeB, {
          ...positionB,
          x: positionB.x + unitX * separationDistance,
          y: positionB.y + unitY * separationDistance
        });
      }
      
      corrected++;
      console.log(`🔧 [坐标计算器] 修正重叠: ${nodeA} <-> ${nodeB}`);
    });

    return corrected;
  }

  /**
   * 检测异常偏移
   */
  detectExcessiveOffsets(positions, layers) {
    const offsets = [];
    const maxOffset = 500; // 最大偏移阈值

    layers.forEach(layer => {
      if (!layer.nodes) return;

      const layerPositions = layer.nodes
        .filter(node => positions.has(node.id))
        .map(node => positions.get(node.id));

      if (layerPositions.length === 0) return;

      // 计算层级中心
      const centerX = layerPositions.reduce((sum, pos) => sum + pos.x, 0) / layerPositions.length;
      const centerY = layerPositions.reduce((sum, pos) => sum + pos.y, 0) / layerPositions.length;

      // 检查每个节点的偏移
      layer.nodes.forEach(node => {
        if (!positions.has(node.id)) return;

        const pos = positions.get(node.id);
        const offsetX = Math.abs(pos.x - centerX);
        const offsetY = Math.abs(pos.y - centerY);

        if (offsetX > maxOffset || offsetY > maxOffset) {
          offsets.push({
            nodeId: node.id,
            position: pos,
            layerCenter: { x: centerX, y: centerY },
            offsetX,
            offsetY,
            layerIndex: layer.index
          });
        }
      });
    });

    return offsets;
  }

  /**
   * 修正异常偏移
   */
  correctExcessiveOffsets(positions, offsets) {
    let corrected = 0;
    const maxOffset = 400; // 修正后的最大偏移

    offsets.forEach(offset => {
      const { nodeId, position, layerCenter, offsetX, offsetY } = offset;
      
      let newX = position.x;
      let newY = position.y;

      // 修正X偏移
      if (offsetX > maxOffset) {
        const direction = position.x > layerCenter.x ? 1 : -1;
        newX = layerCenter.x + direction * maxOffset;
      }

      // 修正Y偏移
      if (offsetY > maxOffset) {
        const direction = position.y > layerCenter.y ? 1 : -1;
        newY = layerCenter.y + direction * maxOffset;
      }

      if (newX !== position.x || newY !== position.y) {
        positions.set(nodeId, { ...position, x: newX, y: newY });
        corrected++;
        console.log(`🔧 [坐标计算器] 修正异常偏移: ${nodeId} (${position.x.toFixed(1)}, ${position.y.toFixed(1)}) -> (${newX.toFixed(1)}, ${newY.toFixed(1)})`);
      }
    });

    return corrected;
  }

  /**
   * 检测层级不一致
   */
  detectLayerInconsistencies(positions, layers) {
    const inconsistencies = [];
    const layerTolerance = 20; // 层级Y坐标容忍度

    layers.forEach(layer => {
      if (!layer.nodes || layer.nodes.length === 0) return;

      const layerPositions = layer.nodes
        .filter(node => positions.has(node.id))
        .map(node => ({ nodeId: node.id, position: positions.get(node.id) }));

      if (layerPositions.length === 0) return;

      // 计算层级的期望Y坐标
      const expectedY = layerPositions.reduce((sum, item) => sum + item.position.y, 0) / layerPositions.length;

      // 检查每个节点是否在期望范围内
      layerPositions.forEach(({ nodeId, position }) => {
        const yDifference = Math.abs(position.y - expectedY);
        
        if (yDifference > layerTolerance) {
          inconsistencies.push({
            nodeId,
            position,
            expectedY,
            yDifference,
            layerIndex: layer.index
          });
        }
      });
    });

    return inconsistencies;
  }

  /**
   * 修正层级不一致
   */
  correctLayerInconsistencies(positions, inconsistencies) {
    let corrected = 0;

    inconsistencies.forEach(inconsistency => {
      const { nodeId, position, expectedY } = inconsistency;
      
      const correctedPosition = {
        ...position,
        y: expectedY
      };

      positions.set(nodeId, correctedPosition);
      corrected++;
      
      console.log(`🔧 [坐标计算器] 修正层级不一致: ${nodeId} Y: ${position.y.toFixed(1)} -> ${expectedY.toFixed(1)}`);
    });

    return corrected;
  }

  /**
   * 应用精度处理
   */
  applyPrecision(positions) {
    const precisePositions = new Map();
    
    positions.forEach((position, nodeId) => {
      const precisePosition = {
        x: Number(position.x.toFixed(this.config.precision)),
        y: Number(position.y.toFixed(this.config.precision)),
        layerIndex: position.layerIndex
      };
      
      precisePositions.set(nodeId, precisePosition);
    });

    return precisePositions;
  }

  /**
   * 生成计算ID
   */
  generateCalculationId() {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查缓存
   */
  checkCache(layers, options) {
    const cacheKey = this.generateCacheKey(layers, options);
    return this.cache.get(cacheKey);
  }

  /**
   * 缓存结果
   */
  cacheResult(layers, options, result) {
    const cacheKey = this.generateCacheKey(layers, options);
    this.cache.set(cacheKey, result);
    
    // 限制缓存大小
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(layers, options) {
    const layerHash = layers.map(layer => ({
      nodeCount: layer.nodes ? layer.nodes.length : 0,
      index: layer.index
    }));
    
    return JSON.stringify({
      layers: layerHash,
      strategy: this.config.layerStrategy,
      algorithm: this.config.distributionAlgorithm,
      options
    });
  }

  /**
   * 记录性能数据
   */
  recordPerformance(calculationTime) {
    this.performance.totalCalculations++;
    this.performance.totalTime += calculationTime;
    this.performance.averageTime = this.performance.totalTime / this.performance.totalCalculations;
  }

  /**
   * 记录计算历史
   */
  recordCalculationHistory(calculationId, data) {
    this.calculationHistory.push({
      id: calculationId,
      timestamp: Date.now(),
      ...data
    });

    // 限制历史记录大小
    if (this.calculationHistory.length > 50) {
      this.calculationHistory = this.calculationHistory.slice(-50);
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      ...this.performance,
      cacheEfficiency: this.performance.cacheHits / (this.performance.cacheHits + this.performance.cacheMisses) || 0,
      recentCalculations: this.calculationHistory.slice(-10)
    };
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.cache.clear();
    console.log(`🗑️ [坐标计算器] 缓存已清理`);
  }

  /**
   * 重新配置
   */
  reconfigure(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.initializeComponents();
    this.clearCache(); // 配置变更后清理缓存
    
    console.log(`🔧 [坐标计算器] 重新配置完成`);
  }

  /**
   * 获取当前配置
   */
  getConfig() {
    return { ...this.config };
  }
}