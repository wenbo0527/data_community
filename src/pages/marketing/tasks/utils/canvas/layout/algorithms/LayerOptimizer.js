/**
 * 层级优化器
 * 负责优化层级内节点的排列，减少边交叉，提升布局美观度
 */
export class LayerOptimizer {
  constructor(config = {}) {
    this.config = {
      maxIterations: config.maxIterations || 10,
      crossingReductionMethod: config.crossingReductionMethod || 'barycenter',
      swapThreshold: config.swapThreshold || 0.1,
      enableMedianHeuristic: config.enableMedianHeuristic !== false,
      ...config
    };
  }

  /**
   * 优化层级排列
   * @param {Object} hierarchy - 层次结构
   * @param {Map} positions - 当前位置映射
   * @returns {Object} 优化结果
   */
  optimizeLayers(hierarchy, positions) {
    console.log(`🎯 [层级优化器] 开始优化层级排列 - 层数: ${hierarchy.layers.length}`);
    
    const startTime = Date.now();
    let currentHierarchy = JSON.parse(JSON.stringify(hierarchy));
    let bestCrossings = this.countTotalCrossings(currentHierarchy);
    let bestHierarchy = JSON.parse(JSON.stringify(currentHierarchy));
    
    console.log(`📊 [层级优化器] 初始交叉数: ${bestCrossings}`);
    
    for (let iteration = 0; iteration < this.config.maxIterations; iteration++) {
      // 向下扫描
      for (let i = 0; i < currentHierarchy.layers.length - 1; i++) {
        this.optimizeLayerPair(currentHierarchy, i, i + 1, 'down');
      }
      
      // 向上扫描
      for (let i = currentHierarchy.layers.length - 2; i >= 0; i--) {
        this.optimizeLayerPair(currentHierarchy, i, i + 1, 'up');
      }
      
      const currentCrossings = this.countTotalCrossings(currentHierarchy);
      
      if (currentCrossings < bestCrossings) {
        bestCrossings = currentCrossings;
        bestHierarchy = JSON.parse(JSON.stringify(currentHierarchy));
        console.log(`📈 [层级优化器] 迭代 ${iteration + 1}: 交叉数减少到 ${currentCrossings}`);
      }
      
      // 如果没有改善，提前退出
      if (currentCrossings === 0) {
        console.log(`🎉 [层级优化器] 达到最优解，无交叉边`);
        break;
      }
    }
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ [层级优化器] 优化完成 - 最终交叉数: ${bestCrossings}, 耗时: ${executionTime}ms`);
    
    return {
      hierarchy: bestHierarchy,
      crossings: bestCrossings,
      improvement: hierarchy ? this.countTotalCrossings(hierarchy) - bestCrossings : 0,
      executionTime
    };
  }

  /**
   * 优化相邻两层
   * @param {Object} hierarchy - 层次结构
   * @param {number} layer1Index - 第一层索引
   * @param {number} layer2Index - 第二层索引
   * @param {string} direction - 扫描方向 ('up' 或 'down')
   */
  optimizeLayerPair(hierarchy, layer1Index, layer2Index, direction) {
    const fixedLayer = hierarchy.layers[layer1Index];
    const movableLayer = hierarchy.layers[layer2Index];
    
    if (direction === 'down') {
      // 固定上层，优化下层
      this.optimizeMovableLayer(hierarchy, fixedLayer, movableLayer, layer1Index, layer2Index);
    } else {
      // 固定下层，优化上层
      this.optimizeMovableLayer(hierarchy, movableLayer, fixedLayer, layer2Index, layer1Index);
    }
  }

  /**
   * 优化可移动层
   * @param {Object} hierarchy - 层次结构
   * @param {Array} fixedLayer - 固定层
   * @param {Array} movableLayer - 可移动层
   * @param {number} fixedLayerIndex - 固定层索引
   * @param {number} movableLayerIndex - 可移动层索引
   */
  optimizeMovableLayer(hierarchy, fixedLayer, movableLayer, fixedLayerIndex, movableLayerIndex) {
    if (this.config.crossingReductionMethod === 'barycenter') {
      this.barycenterHeuristic(hierarchy, fixedLayer, movableLayer, fixedLayerIndex, movableLayerIndex);
    } else if (this.config.crossingReductionMethod === 'median') {
      this.medianHeuristic(hierarchy, fixedLayer, movableLayer, fixedLayerIndex, movableLayerIndex);
    }
    
    // 应用局部交换优化
    this.localSwapOptimization(hierarchy, movableLayer, movableLayerIndex);
  }

  /**
   * 重心启发式算法
   * @param {Object} hierarchy - 层次结构
   * @param {Array} fixedLayer - 固定层
   * @param {Array} movableLayer - 可移动层
   * @param {number} fixedLayerIndex - 固定层索引
   * @param {number} movableLayerIndex - 可移动层索引
   */
  barycenterHeuristic(hierarchy, fixedLayer, movableLayer, fixedLayerIndex, movableLayerIndex) {
    const nodeWeights = new Map();
    
    movableLayer.forEach(node => {
      const connectedNodes = this.getConnectedNodes(node.id, fixedLayer, hierarchy, 
        fixedLayerIndex < movableLayerIndex);
      
      if (connectedNodes.length > 0) {
        const totalWeight = connectedNodes.reduce((sum, connectedNode) => {
          const position = fixedLayer.findIndex(n => n.id === connectedNode.id);
          return sum + position;
        }, 0);
        
        nodeWeights.set(node.id, totalWeight / connectedNodes.length);
      } else {
        // 没有连接的节点保持原位置
        nodeWeights.set(node.id, movableLayer.findIndex(n => n.id === node.id));
      }
    });
    
    // 根据重心权重排序
    movableLayer.sort((a, b) => {
      const weightA = nodeWeights.get(a.id) || 0;
      const weightB = nodeWeights.get(b.id) || 0;
      return weightA - weightB;
    });
  }

  /**
   * 中位数启发式算法
   * @param {Object} hierarchy - 层次结构
   * @param {Array} fixedLayer - 固定层
   * @param {Array} movableLayer - 可移动层
   * @param {number} fixedLayerIndex - 固定层索引
   * @param {number} movableLayerIndex - 可移动层索引
   */
  medianHeuristic(hierarchy, fixedLayer, movableLayer, fixedLayerIndex, movableLayerIndex) {
    const nodeMedians = new Map();
    
    movableLayer.forEach(node => {
      const connectedNodes = this.getConnectedNodes(node.id, fixedLayer, hierarchy, 
        fixedLayerIndex < movableLayerIndex);
      
      if (connectedNodes.length > 0) {
        const positions = connectedNodes.map(connectedNode => 
          fixedLayer.findIndex(n => n.id === connectedNode.id)
        ).sort((a, b) => a - b);
        
        const median = positions.length % 2 === 0 
          ? (positions[positions.length / 2 - 1] + positions[positions.length / 2]) / 2
          : positions[Math.floor(positions.length / 2)];
        
        nodeMedians.set(node.id, median);
      } else {
        nodeMedians.set(node.id, movableLayer.findIndex(n => n.id === node.id));
      }
    });
    
    // 根据中位数排序
    movableLayer.sort((a, b) => {
      const medianA = nodeMedians.get(a.id) || 0;
      const medianB = nodeMedians.get(b.id) || 0;
      return medianA - medianB;
    });
  }

  /**
   * 获取连接的节点
   * @param {string} nodeId - 节点ID
   * @param {Array} targetLayer - 目标层
   * @param {Object} hierarchy - 层次结构
   * @param {boolean} isDownward - 是否向下连接
   * @returns {Array} 连接的节点数组
   */
  getConnectedNodes(nodeId, targetLayer, hierarchy, isDownward) {
    const edges = isDownward 
      ? hierarchy.graph.outEdges.get(nodeId) || []
      : hierarchy.graph.inEdges.get(nodeId) || [];
    
    const connectedNodeIds = edges
      .filter(edge => !edge.virtual)
      .map(edge => isDownward ? edge.target : edge.source);
    
    return targetLayer.filter(node => connectedNodeIds.includes(node.id));
  }

  /**
   * 局部交换优化
   * @param {Object} hierarchy - 层次结构
   * @param {Array} layer - 要优化的层
   * @param {number} layerIndex - 层索引
   */
  localSwapOptimization(hierarchy, layer, layerIndex) {
    let improved = true;
    let iterations = 0;
    const maxLocalIterations = 5;
    
    while (improved && iterations < maxLocalIterations) {
      improved = false;
      iterations++;
      
      for (let i = 0; i < layer.length - 1; i++) {
        const currentCrossings = this.countLayerCrossings(hierarchy, layerIndex);
        
        // 交换相邻节点
        [layer[i], layer[i + 1]] = [layer[i + 1], layer[i]];
        
        const newCrossings = this.countLayerCrossings(hierarchy, layerIndex);
        
        if (newCrossings < currentCrossings) {
          improved = true;
        } else {
          // 恢复交换
          [layer[i], layer[i + 1]] = [layer[i + 1], layer[i]];
        }
      }
    }
  }

  /**
   * 计算总交叉数
   * @param {Object} hierarchy - 层次结构
   * @returns {number} 总交叉数
   */
  countTotalCrossings(hierarchy) {
    let totalCrossings = 0;
    
    for (let i = 0; i < hierarchy.layers.length - 1; i++) {
      totalCrossings += this.countCrossingsBetweenLayers(hierarchy, i, i + 1);
    }
    
    return totalCrossings;
  }

  /**
   * 计算层间交叉数
   * @param {Object} hierarchy - 层次结构
   * @param {number} layer1Index - 第一层索引
   * @param {number} layer2Index - 第二层索引
   * @returns {number} 交叉数
   */
  countCrossingsBetweenLayers(hierarchy, layer1Index, layer2Index) {
    const layer1 = hierarchy.layers[layer1Index];
    const layer2 = hierarchy.layers[layer2Index];
    let crossings = 0;
    
    // 获取层间所有边
    const edges = [];
    layer1.forEach((node1, pos1) => {
      const outEdges = hierarchy.graph.outEdges.get(node1.id) || [];
      outEdges.forEach(edge => {
        const targetPos = layer2.findIndex(node => node.id === edge.target);
        if (targetPos !== -1) {
          edges.push({ source: pos1, target: targetPos });
        }
      });
    });
    
    // 计算交叉
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const edge1 = edges[i];
        const edge2 = edges[j];
        
        // 检查是否交叉
        if ((edge1.source < edge2.source && edge1.target > edge2.target) ||
            (edge1.source > edge2.source && edge1.target < edge2.target)) {
          crossings++;
        }
      }
    }
    
    return crossings;
  }

  /**
   * 计算单层相关的交叉数
   * @param {Object} hierarchy - 层次结构
   * @param {number} layerIndex - 层索引
   * @returns {number} 交叉数
   */
  countLayerCrossings(hierarchy, layerIndex) {
    let crossings = 0;
    
    if (layerIndex > 0) {
      crossings += this.countCrossingsBetweenLayers(hierarchy, layerIndex - 1, layerIndex);
    }
    
    if (layerIndex < hierarchy.layers.length - 1) {
      crossings += this.countCrossingsBetweenLayers(hierarchy, layerIndex, layerIndex + 1);
    }
    
    return crossings;
  }

  /**
   * 获取优化统计信息
   * @param {Object} originalHierarchy - 原始层次结构
   * @param {Object} optimizedHierarchy - 优化后的层次结构
   * @returns {Object} 统计信息
   */
  getOptimizationStats(originalHierarchy, optimizedHierarchy) {
    const originalCrossings = this.countTotalCrossings(originalHierarchy);
    const optimizedCrossings = this.countTotalCrossings(optimizedHierarchy);
    const improvement = originalCrossings - optimizedCrossings;
    const improvementPercentage = originalCrossings > 0 ? (improvement / originalCrossings) * 100 : 0;
    
    return {
      originalCrossings,
      optimizedCrossings,
      improvement,
      improvementPercentage: Math.round(improvementPercentage * 100) / 100,
      method: this.config.crossingReductionMethod,
      iterations: this.config.maxIterations
    };
  }

  /**
   * 验证层级排列的有效性
   * @param {Object} hierarchy - 层次结构
   * @returns {Object} 验证结果
   */
  validateLayerArrangement(hierarchy) {
    const issues = [];
    
    // 检查每层是否有重复节点
    hierarchy.layers.forEach((layer, index) => {
      const nodeIds = layer.map(node => node.id);
      const uniqueIds = new Set(nodeIds);
      
      if (nodeIds.length !== uniqueIds.size) {
        issues.push(`Layer ${index} contains duplicate nodes`);
      }
    });
    
    // 检查所有节点是否都在某一层中
    const allLayerNodes = new Set();
    hierarchy.layers.forEach(layer => {
      layer.forEach(node => allLayerNodes.add(node.id));
    });
    
    hierarchy.graph.nodes.forEach((node, nodeId) => {
      if (!node.virtual && !allLayerNodes.has(nodeId)) {
        issues.push(`Node ${nodeId} is not assigned to any layer`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// 默认导出已通过 export class 实现
