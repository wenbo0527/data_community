/**
 * 全局优化器
 * 负责整体布局的全局优化，包括整体对齐、间距调整和美观度提升
 */
export class GlobalOptimizer {
  constructor(config = {}) {
    this.config = {
      enableGlobalAlignment: config.enableGlobalAlignment !== false,
      enableSpacingOptimization: config.enableSpacingOptimization !== false,
      enableAestheticOptimization: config.enableAestheticOptimization !== false,
      minNodeSpacing: config.minNodeSpacing || 60,
      minLayerSpacing: config.minLayerSpacing || 80,
      maxIterations: config.maxIterations || 5,
      convergenceThreshold: config.convergenceThreshold || 0.01,
      ...config
    };
  }

  /**
   * 执行全局优化
   * @param {Map} positions - 节点位置映射
   * @param {Object} hierarchy - 层次结构
   * @param {Object} bounds - 布局边界
   * @returns {Object} 优化结果
   */
  optimize(positions, hierarchy, bounds = {}) {
    console.log(`🌍 [全局优化器] 开始全局优化 - 节点数: ${positions.size}`);
    
    const startTime = Date.now();
    let currentPositions = new Map(positions);
    let bestPositions = new Map(positions);
    let bestScore = this.calculateLayoutScore(currentPositions, hierarchy);
    
    console.log(`📊 [全局优化器] 初始布局评分: ${bestScore.toFixed(2)}`);
    
    for (let iteration = 0; iteration < this.config.maxIterations; iteration++) {
      const iterationStartTime = Date.now();
      
      // 全局对齐优化
      if (this.config.enableGlobalAlignment) {
        currentPositions = this.optimizeGlobalAlignment(currentPositions, hierarchy, bounds);
      }
      
      // 间距优化
      if (this.config.enableSpacingOptimization) {
        currentPositions = this.optimizeSpacing(currentPositions, hierarchy);
      }
      
      // 美观度优化
      if (this.config.enableAestheticOptimization) {
        currentPositions = this.optimizeAesthetics(currentPositions, hierarchy);
      }
      
      const currentScore = this.calculateLayoutScore(currentPositions, hierarchy);
      const improvement = currentScore - bestScore;
      
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestPositions = new Map(currentPositions);
        
        const iterationTime = Date.now() - iterationStartTime;
        console.log(`📈 [全局优化器] 迭代 ${iteration + 1}: 评分提升到 ${currentScore.toFixed(2)} (+${improvement.toFixed(2)}) - 耗时: ${iterationTime}ms`);
      }
      
      // 检查收敛
      if (Math.abs(improvement) < this.config.convergenceThreshold) {
        console.log(`🎯 [全局优化器] 达到收敛条件，提前结束优化`);
        break;
      }
    }
    
    const executionTime = Date.now() - startTime;
    const totalImprovement = bestScore - this.calculateLayoutScore(positions, hierarchy);
    
    console.log(`✅ [全局优化器] 全局优化完成 - 最终评分: ${bestScore.toFixed(2)}, 总提升: ${totalImprovement.toFixed(2)}, 耗时: ${executionTime}ms`);
    
    return {
      positions: bestPositions,
      score: bestScore,
      improvement: totalImprovement,
      executionTime,
      stats: this.generateOptimizationStats(positions, bestPositions, hierarchy)
    };
  }

  /**
   * 优化全局对齐
   * @param {Map} positions - 当前位置
   * @param {Object} hierarchy - 层次结构
   * @param {Object} bounds - 布局边界
   * @returns {Map} 优化后的位置
   */
  optimizeGlobalAlignment(positions, hierarchy, bounds) {
    const optimizedPositions = new Map(positions);
    
    // 计算每层的中心点
    const layerCenters = this.calculateLayerCenters(positions, hierarchy);
    
    // 计算全局中心线
    const globalCenterX = bounds.width ? (bounds.x || 0) + bounds.width / 2 : this.calculateGlobalCenterX(positions);
    
    // 对齐每层到全局中心线
    hierarchy.layers.forEach((layer, layerIndex) => {
      const layerCenter = layerCenters[layerIndex];
      const offsetX = globalCenterX - layerCenter.x;
      
      // 应用渐进式对齐，避免过度调整
      const alignmentFactor = 0.3;
      const adjustedOffsetX = offsetX * alignmentFactor;
      
      layer.forEach(node => {
        const currentPos = optimizedPositions.get(node.id);
        if (currentPos) {
          optimizedPositions.set(node.id, {
            x: currentPos.x + adjustedOffsetX,
            y: currentPos.y
          });
        }
      });
    });
    
    return optimizedPositions;
  }

  /**
   * 优化节点间距
   * @param {Map} positions - 当前位置
   * @param {Object} hierarchy - 层次结构
   * @returns {Map} 优化后的位置
   */
  optimizeSpacing(positions, hierarchy) {
    const optimizedPositions = new Map(positions);
    
    // 优化层内间距
    hierarchy.layers.forEach(layer => {
      if (layer.length <= 1) return;
      
      // 获取层内节点位置并排序
      const layerNodes = layer.map(node => ({
        node,
        position: optimizedPositions.get(node.id)
      })).filter(item => item.position).sort((a, b) => a.position.x - b.position.x);
      
      // 调整间距
      for (let i = 1; i < layerNodes.length; i++) {
        const prevNode = layerNodes[i - 1];
        const currentNode = layerNodes[i];
        
        const currentDistance = currentNode.position.x - prevNode.position.x;
        
        if (currentDistance < this.config.minNodeSpacing) {
          const adjustment = this.config.minNodeSpacing - currentDistance;
          
          // 向右推移当前节点及其后续节点
          for (let j = i; j < layerNodes.length; j++) {
            const nodeToAdjust = layerNodes[j];
            optimizedPositions.set(nodeToAdjust.node.id, {
              x: nodeToAdjust.position.x + adjustment,
              y: nodeToAdjust.position.y
            });
            nodeToAdjust.position.x += adjustment;
          }
        }
      }
    });
    
    // 优化层间距
    this.optimizeLayerSpacing(optimizedPositions, hierarchy);
    
    return optimizedPositions;
  }

  /**
   * 优化层间距
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   */
  optimizeLayerSpacing(positions, hierarchy) {
    if (hierarchy.layers.length <= 1) return;
    
    // 计算每层的Y坐标
    const layerYPositions = hierarchy.layers.map(layer => {
      const layerPositions = layer.map(node => positions.get(node.id)).filter(pos => pos);
      if (layerPositions.length === 0) return 0;
      
      return layerPositions.reduce((sum, pos) => sum + pos.y, 0) / layerPositions.length;
    });
    
    // 调整层间距
    for (let i = 1; i < hierarchy.layers.length; i++) {
      const currentLayerY = layerYPositions[i];
      const prevLayerY = layerYPositions[i - 1];
      const currentSpacing = Math.abs(currentLayerY - prevLayerY);
      
      if (currentSpacing < this.config.minLayerSpacing) {
        const adjustment = this.config.minLayerSpacing - currentSpacing;
        const direction = currentLayerY > prevLayerY ? 1 : -1;
        
        // 调整当前层及后续层的Y坐标
        for (let j = i; j < hierarchy.layers.length; j++) {
          hierarchy.layers[j].forEach(node => {
            const pos = positions.get(node.id);
            if (pos) {
              positions.set(node.id, {
                x: pos.x,
                y: pos.y + adjustment * direction
              });
            }
          });
          
          layerYPositions[j] += adjustment * direction;
        }
      }
    }
  }

  /**
   * 优化美观度
   * @param {Map} positions - 当前位置
   * @param {Object} hierarchy - 层次结构
   * @returns {Map} 优化后的位置
   */
  optimizeAesthetics(positions, hierarchy) {
    const optimizedPositions = new Map(positions);
    
    // 应用对称性优化
    this.applySymmetryOptimization(optimizedPositions, hierarchy);
    
    // 应用平衡性优化
    this.applyBalanceOptimization(optimizedPositions, hierarchy);
    
    // 应用边长度优化
    this.applyEdgeLengthOptimization(optimizedPositions, hierarchy);
    
    return optimizedPositions;
  }

  /**
   * 应用对称性优化
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   */
  applySymmetryOptimization(positions, hierarchy) {
    hierarchy.layers.forEach(layer => {
      if (layer.length <= 2) return;
      
      // 计算层的中心点
      const layerPositions = layer.map(node => positions.get(node.id)).filter(pos => pos);
      if (layerPositions.length === 0) return;
      
      const centerX = layerPositions.reduce((sum, pos) => sum + pos.x, 0) / layerPositions.length;
      
      // 对于奇数个节点，确保中间节点在中心
      if (layer.length % 2 === 1) {
        const middleIndex = Math.floor(layer.length / 2);
        const sortedNodes = layer.slice().sort((a, b) => {
          const posA = positions.get(a.id);
          const posB = positions.get(b.id);
          return posA.x - posB.x;
        });
        
        const middleNode = sortedNodes[middleIndex];
        const middlePos = positions.get(middleNode.id);
        
        if (middlePos && Math.abs(middlePos.x - centerX) > 10) {
          positions.set(middleNode.id, {
            x: centerX,
            y: middlePos.y
          });
        }
      }
    });
  }

  /**
   * 应用平衡性优化
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   */
  applyBalanceOptimization(positions, hierarchy) {
    hierarchy.layers.forEach(layer => {
      layer.forEach(node => {
        const currentPos = positions.get(node.id);
        if (!currentPos) return;
        
        // 获取相邻层的连接节点
        const connectedNodes = this.getConnectedNodesInAdjacentLayers(node.id, hierarchy);
        
        if (connectedNodes.length > 0) {
          // 计算连接节点的平均X坐标
          const connectedPositions = connectedNodes
            .map(nodeId => positions.get(nodeId))
            .filter(pos => pos);
          
          if (connectedPositions.length > 0) {
            const avgX = connectedPositions.reduce((sum, pos) => sum + pos.x, 0) / connectedPositions.length;
            
            // 应用平衡调整
            const balanceFactor = 0.2;
            const adjustedX = currentPos.x + (avgX - currentPos.x) * balanceFactor;
            
            positions.set(node.id, {
              x: adjustedX,
              y: currentPos.y
            });
          }
        }
      });
    });
  }

  /**
   * 应用边长度优化
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   */
  applyEdgeLengthOptimization(positions, hierarchy) {
    const targetEdgeLength = 100;
    const adjustmentFactor = 0.1;
    
    hierarchy.graph.edges.forEach(edge => {
      if (edge.virtual) return;
      
      const sourcePos = positions.get(edge.source);
      const targetPos = positions.get(edge.target);
      
      if (!sourcePos || !targetPos) return;
      
      const currentLength = Math.sqrt(
        Math.pow(targetPos.x - sourcePos.x, 2) + 
        Math.pow(targetPos.y - sourcePos.y, 2)
      );
      
      if (Math.abs(currentLength - targetEdgeLength) > 20) {
        const lengthRatio = targetEdgeLength / currentLength;
        const adjustment = (lengthRatio - 1) * adjustmentFactor;
        
        // 调整目标节点位置
        const deltaX = (targetPos.x - sourcePos.x) * adjustment;
        const deltaY = (targetPos.y - sourcePos.y) * adjustment;
        
        positions.set(edge.target, {
          x: targetPos.x + deltaX,
          y: targetPos.y + deltaY
        });
      }
    });
  }

  /**
   * 计算布局评分
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @returns {number} 布局评分
   */
  calculateLayoutScore(positions, hierarchy) {
    let score = 100; // 基础分数
    
    // 对称性评分
    score += this.calculateSymmetryScore(positions, hierarchy) * 0.3;
    
    // 间距均匀性评分
    score += this.calculateSpacingScore(positions, hierarchy) * 0.3;
    
    // 边交叉惩罚
    score -= this.calculateCrossingPenalty(positions, hierarchy) * 0.2;
    
    // 边长度一致性评分
    score += this.calculateEdgeLengthScore(positions, hierarchy) * 0.2;
    
    return Math.max(0, score);
  }

  /**
   * 计算对称性评分
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @returns {number} 对称性评分
   */
  calculateSymmetryScore(positions, hierarchy) {
    let totalScore = 0;
    let layerCount = 0;
    
    hierarchy.layers.forEach(layer => {
      if (layer.length <= 1) return;
      
      const layerPositions = layer.map(node => positions.get(node.id)).filter(pos => pos);
      if (layerPositions.length === 0) return;
      
      const centerX = layerPositions.reduce((sum, pos) => sum + pos.x, 0) / layerPositions.length;
      
      // 计算节点到中心的距离方差
      const distances = layerPositions.map(pos => Math.abs(pos.x - centerX));
      const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
      const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
      
      // 方差越小，对称性越好
      const symmetryScore = Math.max(0, 100 - variance / 10);
      totalScore += symmetryScore;
      layerCount++;
    });
    
    return layerCount > 0 ? totalScore / layerCount : 0;
  }

  /**
   * 计算间距评分
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @returns {number} 间距评分
   */
  calculateSpacingScore(positions, hierarchy) {
    let totalScore = 0;
    let layerCount = 0;
    
    hierarchy.layers.forEach(layer => {
      if (layer.length <= 1) {
        totalScore += 100;
        layerCount++;
        return;
      }
      
      const layerNodes = layer.map(node => ({
        node,
        position: positions.get(node.id)
      })).filter(item => item.position).sort((a, b) => a.position.x - b.position.x);
      
      if (layerNodes.length <= 1) return;
      
      // 计算间距的一致性
      const spacings = [];
      for (let i = 1; i < layerNodes.length; i++) {
        const spacing = layerNodes[i].position.x - layerNodes[i - 1].position.x;
        spacings.push(spacing);
      }
      
      const avgSpacing = spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
      const spacingVariance = spacings.reduce((sum, s) => sum + Math.pow(s - avgSpacing, 2), 0) / spacings.length;
      
      // 方差越小，间距越均匀
      const spacingScore = Math.max(0, 100 - spacingVariance / 100);
      totalScore += spacingScore;
      layerCount++;
    });
    
    return layerCount > 0 ? totalScore / layerCount : 0;
  }

  /**
   * 计算边交叉惩罚
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @returns {number} 交叉惩罚分数
   */
  calculateCrossingPenalty(positions, hierarchy) {
    // 这里简化处理，实际应该计算边的交叉数
    return 0;
  }

  /**
   * 计算边长度评分
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @returns {number} 边长度评分
   */
  calculateEdgeLengthScore(positions, hierarchy) {
    const targetLength = 100;
    let totalScore = 0;
    let edgeCount = 0;
    
    hierarchy.graph.edges.forEach(edge => {
      if (edge.virtual) return;
      
      const sourcePos = positions.get(edge.source);
      const targetPos = positions.get(edge.target);
      
      if (!sourcePos || !targetPos) return;
      
      const length = Math.sqrt(
        Math.pow(targetPos.x - sourcePos.x, 2) + 
        Math.pow(targetPos.y - sourcePos.y, 2)
      );
      
      const lengthDiff = Math.abs(length - targetLength);
      const lengthScore = Math.max(0, 100 - lengthDiff);
      
      totalScore += lengthScore;
      edgeCount++;
    });
    
    return edgeCount > 0 ? totalScore / edgeCount : 0;
  }

  /**
   * 计算层中心点
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @returns {Array} 层中心点数组
   */
  calculateLayerCenters(positions, hierarchy) {
    return hierarchy.layers.map(layer => {
      const layerPositions = layer.map(node => positions.get(node.id)).filter(pos => pos);
      
      if (layerPositions.length === 0) {
        return { x: 0, y: 0 };
      }
      
      const centerX = layerPositions.reduce((sum, pos) => sum + pos.x, 0) / layerPositions.length;
      const centerY = layerPositions.reduce((sum, pos) => sum + pos.y, 0) / layerPositions.length;
      
      return { x: centerX, y: centerY };
    });
  }

  /**
   * 计算全局中心X坐标
   * @param {Map} positions - 位置映射
   * @returns {number} 全局中心X坐标
   */
  calculateGlobalCenterX(positions) {
    const allPositions = Array.from(positions.values());
    if (allPositions.length === 0) return 0;
    
    return allPositions.reduce((sum, pos) => sum + pos.x, 0) / allPositions.length;
  }

  /**
   * 获取相邻层的连接节点
   * @param {string} nodeId - 节点ID
   * @param {Object} hierarchy - 层次结构
   * @returns {Array} 连接节点ID数组
   */
  getConnectedNodesInAdjacentLayers(nodeId, hierarchy) {
    const connectedNodes = [];
    
    // 获取输入边的源节点
    const inEdges = hierarchy.graph.inEdges.get(nodeId) || [];
    inEdges.forEach(edge => {
      if (!edge.virtual) {
        connectedNodes.push(edge.source);
      }
    });
    
    // 获取输出边的目标节点
    const outEdges = hierarchy.graph.outEdges.get(nodeId) || [];
    outEdges.forEach(edge => {
      if (!edge.virtual) {
        connectedNodes.push(edge.target);
      }
    });
    
    return connectedNodes;
  }

  /**
   * 生成优化统计信息
   * @param {Map} originalPositions - 原始位置
   * @param {Map} optimizedPositions - 优化后位置
   * @param {Object} hierarchy - 层次结构
   * @returns {Object} 统计信息
   */
  generateOptimizationStats(originalPositions, optimizedPositions, hierarchy) {
    const originalScore = this.calculateLayoutScore(originalPositions, hierarchy);
    const optimizedScore = this.calculateLayoutScore(optimizedPositions, hierarchy);
    
    return {
      originalScore: Math.round(originalScore * 100) / 100,
      optimizedScore: Math.round(optimizedScore * 100) / 100,
      improvement: Math.round((optimizedScore - originalScore) * 100) / 100,
      improvementPercentage: originalScore > 0 ? Math.round(((optimizedScore - originalScore) / originalScore) * 10000) / 100 : 0,
      totalNodes: optimizedPositions.size,
      totalLayers: hierarchy.layers.length
    };
  }
}

// 默认导出已通过 export class 实现
