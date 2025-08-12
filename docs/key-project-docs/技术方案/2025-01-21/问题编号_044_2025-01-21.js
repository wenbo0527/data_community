/**
 * 坐标计算流程重构实施示例
 * 展示新架构的具体实现和使用方式
 */

// ===== 1. 核心坐标计算器 =====
class CoordinateCalculator {
  constructor(config = {}) {
    this.config = {
      layer: {
        baseHeight: 200,
        dynamicSpacing: true,
        tolerance: 20
      },
      node: {
        minSpacing: 120,
        preferredSpacing: 180,
        maxSpacing: 300
      },
      optimization: {
        maxIterations: 5,
        convergenceThreshold: 0.01
      },
      ...config
    };
    
    this.layerCalculator = new LayerPositionCalculator(this.config);
    this.distributionOptimizer = new DistributionOptimizer(this.config);
    this.validator = new CoordinateValidator(this.config);
    this.anomalyDetector = new AnomalyDetector(this.config);
  }

  /**
   * 主计算流程
   * @param {Object} layoutData - 布局数据
   * @returns {Map} 计算结果
   */
  async calculateCoordinates(layoutData) {
    console.log('🧮 [坐标计算器] 开始坐标计算流程');
    
    try {
      // 1. 数据预处理
      const preprocessed = await this.preprocessData(layoutData);
      
      // 2. 层级位置计算
      const layerPositions = await this.layerCalculator.calculate(preprocessed);
      
      // 3. 分布优化
      const optimized = await this.distributionOptimizer.optimize(layerPositions);
      
      // 4. 异常检测
      const anomalies = await this.anomalyDetector.detect(optimized);
      
      // 5. 自动修正
      const corrected = await this.autoCorrect(optimized, anomalies);
      
      // 6. 最终验证
      const validation = await this.validator.validate(corrected);
      
      if (!validation.isValid) {
        console.warn('⚠️ [坐标计算器] 验证失败，应用建议修正');
        return await this.validator.autoFix(corrected, validation.violations);
      }
      
      console.log('✅ [坐标计算器] 坐标计算完成');
      return corrected;
      
    } catch (error) {
      console.error('❌ [坐标计算器] 计算失败:', error);
      throw new CoordinateCalculationError('坐标计算失败', error);
    }
  }

  async preprocessData(layoutData) {
    console.log('📊 [数据预处理] 开始处理布局数据');
    
    // 数据清洗和标准化
    const cleaned = this.cleanData(layoutData);
    
    // 构建层级结构
    const layerStructure = this.buildLayerStructure(cleaned);
    
    // 建立关系映射
    const relationships = this.buildRelationships(cleaned);
    
    return {
      ...cleaned,
      layerStructure,
      relationships
    };
  }

  cleanData(layoutData) {
    // 过滤无效节点和边
    const validNodes = layoutData.nodes.filter(node => 
      node && node.id && !node.id.includes('hint')
    );
    
    const validEdges = layoutData.edges.filter(edge => 
      edge && edge.source && edge.target && !edge.isPreview
    );
    
    return {
      nodes: validNodes,
      edges: validEdges,
      endpoints: layoutData.endpoints || []
    };
  }

  async autoCorrect(positions, anomalies) {
    if (anomalies.length === 0) return positions;
    
    console.log(`🔧 [自动修正] 发现 ${anomalies.length} 个异常，开始修正`);
    
    const corrected = new Map(positions);
    
    for (const anomaly of anomalies) {
      switch (anomaly.type) {
        case 'EXCESSIVE_OFFSET':
          await this.correctExcessiveOffset(corrected, anomaly);
          break;
        case 'LAYER_INCONSISTENCY':
          await this.correctLayerInconsistency(corrected, anomaly);
          break;
        case 'OVERLAP_DETECTED':
          await this.correctOverlap(corrected, anomaly);
          break;
      }
    }
    
    console.log('✅ [自动修正] 异常修正完成');
    return corrected;
  }

  async correctExcessiveOffset(positions, anomaly) {
    const position = positions.get(anomaly.nodeId);
    if (!position) return;
    
    // 将异常偏移重置为合理范围
    const maxOffset = this.config.node.maxSpacing;
    position.x = Math.max(-maxOffset, Math.min(maxOffset, position.x));
    
    console.log(`🔧 [偏移修正] 节点 ${anomaly.nodeId} X坐标修正为: ${position.x}`);
  }

  async correctLayerInconsistency(positions, anomaly) {
    // 获取该层所有节点
    const layerNodes = Array.from(positions.entries())
      .filter(([_, pos]) => pos.layerIndex === anomaly.layerIndex);
    
    if (layerNodes.length === 0) return;
    
    // 计算标准Y坐标（使用中位数）
    const yCoordinates = layerNodes.map(([_, pos]) => pos.y).sort((a, b) => a - b);
    const standardY = yCoordinates[Math.floor(yCoordinates.length / 2)];
    
    // 修正所有节点的Y坐标
    for (const [nodeId, position] of layerNodes) {
      position.y = standardY;
    }
    
    console.log(`🔧 [层级修正] 层级 ${anomaly.layerIndex} Y坐标统一为: ${standardY}`);
  }
}

// ===== 2. 层级位置计算器 =====
class LayerPositionCalculator {
  constructor(config) {
    this.config = config;
    this.strategies = new Map([
      ['bottom-up', new BottomUpStrategy()],
      ['center-out', new CenterOutStrategy()],
      ['balanced', new BalancedStrategy()]
    ]);
  }

  async calculate(preprocessedData) {
    console.log('📐 [层级计算] 开始层级位置计算');
    
    const { layerStructure } = preprocessedData;
    const strategy = this.selectStrategy(layerStructure);
    
    console.log(`🎯 [策略选择] 使用策略: ${strategy.name}`);
    
    const positions = await strategy.calculate(layerStructure, this.config);
    
    console.log(`✅ [层级计算] 完成，计算了 ${positions.size} 个位置`);
    return positions;
  }

  selectStrategy(layerStructure) {
    const { totalLayers, maxNodesPerLayer, hasComplexBranching } = layerStructure;
    
    if (totalLayers <= 3 && maxNodesPerLayer <= 5) {
      return this.strategies.get('center-out');
    } else if (hasComplexBranching || maxNodesPerLayer > 10) {
      return this.strategies.get('balanced');
    } else {
      return this.strategies.get('bottom-up');
    }
  }
}

// ===== 3. 计算策略实现 =====
class BottomUpStrategy {
  constructor() {
    this.name = 'bottom-up';
  }

  async calculate(layerStructure, config) {
    const positions = new Map();
    const { layers } = layerStructure;
    
    // 从最底层开始计算
    for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
      const layer = layers[layerIndex];
      const isBottomLayer = layerIndex === layers.length - 1;
      
      if (isBottomLayer) {
        // 底层：均匀分布
        await this.calculateBottomLayer(layer, layerIndex, positions, config);
      } else {
        // 上层：基于子节点位置计算
        await this.calculateParentLayer(layer, layerIndex, positions, config);
      }
    }
    
    return positions;
  }

  async calculateBottomLayer(layer, layerIndex, positions, config) {
    const layerY = layerIndex * config.layer.baseHeight;
    const nodeCount = layer.length;
    
    if (nodeCount === 1) {
      // 单节点居中
      const node = layer[0];
      positions.set(node.id, {
        x: 0,
        y: layerY,
        layerIndex,
        nodeType: node.isEndpoint ? 'endpoint' : 'normal'
      });
    } else {
      // 多节点对称分布
      const spacing = config.node.preferredSpacing;
      const totalWidth = (nodeCount - 1) * spacing;
      const startX = -totalWidth / 2;
      
      layer.forEach((node, index) => {
        positions.set(node.id, {
          x: startX + index * spacing,
          y: layerY,
          layerIndex,
          nodeType: node.isEndpoint ? 'endpoint' : 'normal'
        });
      });
    }
  }

  async calculateParentLayer(layer, layerIndex, positions, config) {
    const layerY = layerIndex * config.layer.baseHeight;
    
    for (const node of layer) {
      // 获取子节点位置
      const childPositions = this.getChildPositions(node, positions);
      
      if (childPositions.length === 0) {
        // 无子节点，使用默认位置
        positions.set(node.id, {
          x: 0,
          y: layerY,
          layerIndex,
          nodeType: node.isEndpoint ? 'endpoint' : 'normal'
        });
      } else {
        // 基于子节点计算最优位置
        const optimalX = this.calculateOptimalParentPosition(childPositions);
        positions.set(node.id, {
          x: optimalX,
          y: layerY,
          layerIndex,
          nodeType: node.isEndpoint ? 'endpoint' : 'normal',
          childrenCount: childPositions.length
        });
      }
    }
  }

  getChildPositions(node, positions) {
    const children = node.children || [];
    return children
      .map(childId => positions.get(childId))
      .filter(pos => pos !== undefined);
  }

  calculateOptimalParentPosition(childPositions) {
    if (childPositions.length === 1) {
      return childPositions[0].x;
    }
    
    // 计算子节点的重心
    const totalX = childPositions.reduce((sum, pos) => sum + pos.x, 0);
    return totalX / childPositions.length;
  }
}

// ===== 4. 分布优化器 =====
class DistributionOptimizer {
  constructor(config) {
    this.config = config;
    this.algorithms = new Map([
      ['symmetric', new SymmetricDistribution()],
      ['weighted', new WeightedDistribution()],
      ['golden-ratio', new GoldenRatioDistribution()]
    ]);
  }

  async optimize(positions) {
    console.log('⚡ [分布优化] 开始优化节点分布');
    
    const layerGroups = this.groupByLayer(positions);
    const optimized = new Map();
    
    for (const [layerIndex, layerPositions] of layerGroups) {
      const algorithm = this.selectAlgorithm(layerPositions);
      const layerOptimized = await algorithm.optimize(layerPositions, this.config);
      
      // 合并结果
      for (const [nodeId, position] of layerOptimized) {
        optimized.set(nodeId, position);
      }
    }
    
    console.log('✅ [分布优化] 优化完成');
    return optimized;
  }

  groupByLayer(positions) {
    const groups = new Map();
    
    for (const [nodeId, position] of positions) {
      const layerIndex = position.layerIndex;
      if (!groups.has(layerIndex)) {
        groups.set(layerIndex, new Map());
      }
      groups.get(layerIndex).set(nodeId, position);
    }
    
    return groups;
  }

  selectAlgorithm(layerPositions) {
    const nodeCount = layerPositions.size;
    
    if (nodeCount === 2) {
      return this.algorithms.get('symmetric');
    } else if (nodeCount <= 5) {
      return this.algorithms.get('golden-ratio');
    } else {
      return this.algorithms.get('weighted');
    }
  }
}

// ===== 5. 对称分布算法 =====
class SymmetricDistribution {
  async optimize(layerPositions, config) {
    const positions = Array.from(layerPositions.values());
    
    if (positions.length !== 2) {
      return layerPositions; // 只处理双节点
    }
    
    const spacing = config.node.preferredSpacing;
    const [pos1, pos2] = positions;
    
    // 对称分布
    pos1.x = -spacing / 2;
    pos2.x = spacing / 2;
    
    console.log(`🔄 [对称分布] 双节点对称分布，间距: ${spacing}`);
    
    return layerPositions;
  }
}

// ===== 6. 黄金比例分布算法 =====
class GoldenRatioDistribution {
  async optimize(layerPositions, config) {
    const positions = Array.from(layerPositions.values());
    const nodeCount = positions.length;
    
    if (nodeCount <= 1) return layerPositions;
    
    const goldenRatio = 1.618;
    const baseSpacing = config.node.preferredSpacing;
    
    // 使用黄金比例计算间距
    const spacings = this.calculateGoldenSpacings(nodeCount, baseSpacing, goldenRatio);
    const totalWidth = spacings.reduce((sum, spacing) => sum + spacing, 0);
    const startX = -totalWidth / 2;
    
    let currentX = startX;
    positions.forEach((position, index) => {
      position.x = currentX;
      if (index < spacings.length) {
        currentX += spacings[index];
      }
    });
    
    console.log(`🌟 [黄金比例] ${nodeCount}节点黄金比例分布完成`);
    
    return layerPositions;
  }

  calculateGoldenSpacings(nodeCount, baseSpacing, ratio) {
    const spacings = [];
    
    for (let i = 0; i < nodeCount - 1; i++) {
      const factor = Math.pow(ratio, i % 2 === 0 ? 1 : -1);
      spacings.push(baseSpacing * factor);
    }
    
    return spacings;
  }
}

// ===== 7. 异常检测器 =====
class AnomalyDetector {
  constructor(config) {
    this.config = config;
    this.thresholds = {
      maxOffset: 300,
      maxDeviation: 50,
      minSpacing: 50,
      maxSpacing: 500
    };
  }

  async detect(positions) {
    console.log('🔍 [异常检测] 开始检测坐标异常');
    
    const anomalies = [];
    
    // 检测异常偏移
    anomalies.push(...this.detectExcessiveOffsets(positions));
    
    // 检测层级不一致
    anomalies.push(...this.detectLayerInconsistencies(positions));
    
    // 检测节点重叠
    anomalies.push(...this.detectOverlaps(positions));
    
    // 检测异常间距
    anomalies.push(...this.detectAbnormalSpacing(positions));
    
    console.log(`🔍 [异常检测] 检测完成，发现 ${anomalies.length} 个异常`);
    
    return anomalies;
  }

  detectExcessiveOffsets(positions) {
    const anomalies = [];
    
    for (const [nodeId, position] of positions) {
      if (Math.abs(position.x) > this.thresholds.maxOffset) {
        anomalies.push({
          type: 'EXCESSIVE_OFFSET',
          nodeId,
          position: { ...position },
          severity: 'HIGH',
          message: `节点X坐标偏移过大: ${position.x}`
        });
      }
    }
    
    return anomalies;
  }

  detectLayerInconsistencies(positions) {
    const anomalies = [];
    const layerGroups = this.groupByLayer(positions);
    
    for (const [layerIndex, layerPositions] of layerGroups) {
      const yCoordinates = Array.from(layerPositions.values()).map(pos => pos.y);
      const deviation = this.calculateStandardDeviation(yCoordinates);
      
      if (deviation > this.thresholds.maxDeviation) {
        anomalies.push({
          type: 'LAYER_INCONSISTENCY',
          layerIndex,
          deviation,
          severity: 'MEDIUM',
          message: `层级 ${layerIndex} Y坐标不一致，偏差: ${deviation.toFixed(2)}`
        });
      }
    }
    
    return anomalies;
  }

  detectOverlaps(positions) {
    const anomalies = [];
    const positionArray = Array.from(positions.entries());
    
    for (let i = 0; i < positionArray.length; i++) {
      for (let j = i + 1; j < positionArray.length; j++) {
        const [nodeId1, pos1] = positionArray[i];
        const [nodeId2, pos2] = positionArray[j];
        
        if (pos1.layerIndex === pos2.layerIndex) {
          const distance = Math.abs(pos1.x - pos2.x);
          if (distance < this.thresholds.minSpacing) {
            anomalies.push({
              type: 'OVERLAP_DETECTED',
              nodeIds: [nodeId1, nodeId2],
              distance,
              severity: 'HIGH',
              message: `节点重叠: ${nodeId1} 和 ${nodeId2}，距离: ${distance}`
            });
          }
        }
      }
    }
    
    return anomalies;
  }

  groupByLayer(positions) {
    const groups = new Map();
    
    for (const [nodeId, position] of positions) {
      const layerIndex = position.layerIndex;
      if (!groups.has(layerIndex)) {
        groups.set(layerIndex, new Map());
      }
      groups.get(layerIndex).set(nodeId, position);
    }
    
    return groups;
  }

  calculateStandardDeviation(values) {
    if (values.length <= 1) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    
    return Math.sqrt(variance);
  }
}

// ===== 8. 位置应用器 =====
class PositionApplicator {
  constructor(graph, config) {
    this.graph = graph;
    this.config = config;
    this.batchProcessor = new BatchProcessor(config);
    this.validator = new CoordinateValidator(config);
  }

  async apply(positions) {
    console.log('📍 [位置应用] 开始应用坐标到图形');
    
    try {
      // 预验证
      const preValidation = await this.validator.validate(positions);
      if (!preValidation.isValid) {
        console.warn('⚠️ [位置应用] 预验证失败，尝试自动修正');
        positions = await this.validator.autoFix(positions, preValidation.violations);
      }
      
      // 批量应用
      const results = await this.batchProcessor.process(
        Array.from(positions.entries()),
        {
          processor: this.applySinglePosition.bind(this),
          batchSize: this.config.performance?.batchSize || 50
        }
      );
      
      // 后验证
      await this.postValidate(positions);
      
      console.log(`✅ [位置应用] 应用完成，处理了 ${results.length} 个节点`);
      return results;
      
    } catch (error) {
      console.error('❌ [位置应用] 应用失败:', error);
      throw new PositionApplicationError('位置应用失败', error);
    }
  }

  async applySinglePosition([nodeId, position]) {
    const node = this.graph.getCellById(nodeId);
    if (!node) {
      console.warn(`⚠️ [位置应用] 节点不存在: ${nodeId}`);
      return null;
    }
    
    const size = node.getSize();
    const topLeft = {
      x: position.x - size.width / 2,
      y: position.y - size.height / 2
    };
    
    // 应用位置
    node.setPosition(topLeft, {
      silent: false,
      systemInitiated: true,
      layoutEngine: true,
      source: 'CoordinateCalculator'
    });
    
    return {
      nodeId,
      applied: topLeft,
      center: position,
      success: true
    };
  }

  async postValidate(positions) {
    console.log('🔍 [后验证] 开始验证应用结果');
    
    let errors = 0;
    
    for (const [nodeId, expectedPosition] of positions) {
      const node = this.graph.getCellById(nodeId);
      if (!node) continue;
      
      const actualPosition = node.getPosition();
      const size = node.getSize();
      const actualCenter = {
        x: actualPosition.x + size.width / 2,
        y: actualPosition.y + size.height / 2
      };
      
      const deviation = Math.sqrt(
        Math.pow(actualCenter.x - expectedPosition.x, 2) +
        Math.pow(actualCenter.y - expectedPosition.y, 2)
      );
      
      if (deviation > 5) { // 5像素容差
        console.error(`❌ [后验证] 节点 ${nodeId} 位置偏差过大: ${deviation.toFixed(2)}px`);
        errors++;
      }
    }
    
    if (errors === 0) {
      console.log('✅ [后验证] 所有节点位置验证通过');
    } else {
      console.error(`❌ [后验证] 发现 ${errors} 个位置偏差`);
    }
  }
}

// ===== 9. 批量处理器 =====
class BatchProcessor {
  constructor(config) {
    this.config = config;
    this.defaultBatchSize = 50;
  }

  async process(items, options) {
    const batchSize = options.batchSize || this.defaultBatchSize;
    const processor = options.processor;
    
    if (!processor) {
      throw new Error('批量处理器需要处理函数');
    }
    
    const batches = this.createBatches(items, batchSize);
    const results = [];
    
    console.log(`🔄 [批量处理] 开始处理 ${items.length} 个项目，分 ${batches.length} 批`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`🔄 [批量处理] 处理第 ${i + 1}/${batches.length} 批 (${batch.length} 项)`);
      
      const batchResults = await this.processBatch(batch, processor);
      results.push(...batchResults);
      
      // 允许UI更新
      if (i < batches.length - 1) {
        await this.yield();
      }
    }
    
    console.log('✅ [批量处理] 所有批次处理完成');
    return results;
  }

  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async processBatch(batch, processor) {
    const promises = batch.map(item => {
      try {
        return processor(item);
      } catch (error) {
        console.error('批量处理项目失败:', error);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  }

  async yield() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}

// ===== 10. 自定义错误类 =====
class CoordinateCalculationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'CoordinateCalculationError';
    this.cause = cause;
  }
}

class PositionApplicationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'PositionApplicationError';
    this.cause = cause;
  }
}

// ===== 11. 使用示例 =====
class RefactoredLayoutEngine {
  constructor(graph, options = {}) {
    this.graph = graph;
    this.calculator = new CoordinateCalculator(options);
    this.applicator = new PositionApplicator(graph, options);
    this.syncManager = new SyncManager(options.previewLineManager, options);
  }

  async executeLayout(layoutData) {
    console.log('🚀 [重构布局引擎] 开始执行布局');
    
    try {
      // 1. 计算坐标
      const positions = await this.calculator.calculateCoordinates(layoutData);
      
      // 2. 应用位置
      const results = await this.applicator.apply(positions);
      
      // 3. 同步Endpoint
      await this.syncManager.syncEndpoints(positions);
      
      console.log('✅ [重构布局引擎] 布局执行完成');
      
      return {
        success: true,
        positions,
        results,
        message: '布局执行成功'
      };
      
    } catch (error) {
      console.error('❌ [重构布局引擎] 布局执行失败:', error);
      
      return {
        success: false,
        error: error.message,
        message: `布局执行失败: ${error.message}`
      };
    }
  }
}

// ===== 12. 导出模块 =====
export {
  CoordinateCalculator,
  LayerPositionCalculator,
  DistributionOptimizer,
  AnomalyDetector,
  PositionApplicator,
  BatchProcessor,
  RefactoredLayoutEngine
};

/**
 * 使用方式示例：
 * 
 * const layoutEngine = new RefactoredLayoutEngine(graph, {
 *   layer: { baseHeight: 200 },
 *   node: { preferredSpacing: 180 },
 *   performance: { batchSize: 30 }
 * });
 * 
 * const result = await layoutEngine.executeLayout({
 *   nodes: graphNodes,
 *   edges: graphEdges,
 *   endpoints: previewEndpoints
 * });
 * 
 * if (result.success) {
 *   console.log('布局成功完成');
 * } else {
 *   console.error('布局失败:', result.error);
 * }
 */