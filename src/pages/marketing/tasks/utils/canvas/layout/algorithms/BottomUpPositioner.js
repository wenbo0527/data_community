/**
 * 自底向上定位器
 * 负责从底层开始计算节点位置，确保布局的稳定性
 */
export class BottomUpPositioner {
  constructor(config = {}) {
    this.config = {
      nodeSpacing: config.nodeSpacing || 80,
      layerSpacing: config.layerSpacing || 100,
      centerAlignment: config.centerAlignment !== false,
      balanceWeight: config.balanceWeight || 0.5,
      ...config
    };
  }

  /**
   * 自底向上计算位置
   * @param {Object} hierarchy - 层次结构
   * @param {Object} bounds - 布局边界
   * @returns {Map} 节点位置映射
   */
  calculatePositions(hierarchy, bounds = {}) {
    console.log(`📍 [自底向上定位器] 开始计算位置 - 层数: ${hierarchy.layers.length}`);
    
    const startTime = Date.now();
    const positions = new Map();
    const { layers } = hierarchy;
    
    // 从最底层开始计算
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      const layerPositions = this.calculateLayerPositions(layer, i, hierarchy, positions, bounds);
      
      // 将层位置添加到总位置映射中
      layerPositions.forEach((pos, nodeId) => {
        positions.set(nodeId, pos);
      });
    }
    
    // 应用全局对齐
    this.applyGlobalAlignment(positions, hierarchy, bounds);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ [自底向上定位器] 位置计算完成 - 节点数: ${positions.size}, 耗时: ${executionTime}ms`);
    
    return positions;
  }

  /**
   * 计算单层位置
   * @param {Array} layer - 当前层节点
   * @param {number} layerIndex - 层索引
   * @param {Object} hierarchy - 层次结构
   * @param {Map} existingPositions - 已有位置
   * @param {Object} bounds - 布局边界
   * @returns {Map} 当前层位置映射
   */
  calculateLayerPositions(layer, layerIndex, hierarchy, existingPositions, bounds) {
    const layerPositions = new Map();
    const isBottomLayer = layerIndex === hierarchy.layers.length - 1;
    
    if (isBottomLayer) {
      // 底层：均匀分布
      this.distributeBottomLayer(layer, layerPositions, bounds);
    } else {
      // 其他层：基于子节点位置计算
      this.positionBasedOnChildren(layer, layerIndex, hierarchy, existingPositions, layerPositions, bounds);
    }
    
    // 应用层内优化
    this.optimizeLayerPositions(layer, layerPositions, hierarchy);
    
    return layerPositions;
  }

  /**
   * 分布底层节点
   * @param {Array} layer - 底层节点
   * @param {Map} positions - 位置映射
   * @param {Object} bounds - 布局边界
   */
  distributeBottomLayer(layer, positions, bounds) {
    const totalWidth = bounds.width || 800;
    const startX = bounds.x || 0;
    const y = bounds.y || 0;
    
    if (layer.length === 1) {
      // 单个节点居中
      positions.set(layer[0].id, {
        x: startX + totalWidth / 2,
        y: y
      });
    } else {
      // 多个节点均匀分布
      const spacing = totalWidth / (layer.length + 1);
      
      layer.forEach((node, index) => {
        positions.set(node.id, {
          x: startX + spacing * (index + 1),
          y: y
        });
      });
    }
  }

  /**
   * 基于子节点位置计算父节点位置
   * @param {Array} layer - 当前层节点
   * @param {number} layerIndex - 层索引
   * @param {Object} hierarchy - 层次结构
   * @param {Map} existingPositions - 已有位置
   * @param {Map} layerPositions - 当前层位置
   * @param {Object} bounds - 布局边界
   */
  positionBasedOnChildren(layer, layerIndex, hierarchy, existingPositions, layerPositions, bounds) {
    const y = (bounds.y || 0) - (hierarchy.layers.length - 1 - layerIndex) * this.config.layerSpacing;
    
    layer.forEach(node => {
      const children = this.getNodeChildren(node.id, hierarchy);
      
      if (children.length === 0) {
        // 没有子节点，使用默认位置
        layerPositions.set(node.id, {
          x: (bounds.x || 0) + (bounds.width || 800) / 2,
          y: y
        });
      } else {
        // 基于子节点位置计算
        const childPositions = children
          .map(childId => existingPositions.get(childId))
          .filter(pos => pos !== undefined);
        
        if (childPositions.length > 0) {
          const avgX = childPositions.reduce((sum, pos) => sum + pos.x, 0) / childPositions.length;
          layerPositions.set(node.id, {
            x: avgX,
            y: y
          });
        } else {
          // 子节点位置未知，使用默认位置
          layerPositions.set(node.id, {
            x: (bounds.x || 0) + (bounds.width || 800) / 2,
            y: y
          });
        }
      }
    });
  }

  /**
   * 获取节点的子节点
   * @param {string} nodeId - 节点ID
   * @param {Object} hierarchy - 层次结构
   * @returns {Array} 子节点ID数组
   */
  getNodeChildren(nodeId, hierarchy) {
    const outEdges = hierarchy.graph.outEdges.get(nodeId) || [];
    return outEdges
      .filter(edge => !edge.virtual)
      .map(edge => edge.target);
  }

  /**
   * 获取节点的父节点
   * @param {string} nodeId - 节点ID
   * @param {Object} hierarchy - 层次结构
   * @returns {Array} 父节点ID数组
   */
  getNodeParents(nodeId, hierarchy) {
    const inEdges = hierarchy.graph.inEdges.get(nodeId) || [];
    return inEdges
      .filter(edge => !edge.virtual)
      .map(edge => edge.source);
  }

  /**
   * 优化层内位置
   * @param {Array} layer - 当前层节点
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   */
  optimizeLayerPositions(layer, positions, hierarchy) {
    if (layer.length <= 1) return;
    
    // 检测并解决重叠
    this.resolveOverlaps(layer, positions);
    
    // 应用平衡调整
    this.applyBalanceAdjustment(layer, positions, hierarchy);
  }

  /**
   * 解决节点重叠
   * @param {Array} layer - 当前层节点
   * @param {Map} positions - 位置映射
   */
  resolveOverlaps(layer, positions) {
    const sortedNodes = layer.slice().sort((a, b) => {
      const posA = positions.get(a.id);
      const posB = positions.get(b.id);
      return posA.x - posB.x;
    });
    
    for (let i = 1; i < sortedNodes.length; i++) {
      const currentNode = sortedNodes[i];
      const prevNode = sortedNodes[i - 1];
      
      const currentPos = positions.get(currentNode.id);
      const prevPos = positions.get(prevNode.id);
      
      const minDistance = this.config.nodeSpacing;
      const actualDistance = currentPos.x - prevPos.x;
      
      if (actualDistance < minDistance) {
        // 调整当前节点位置
        currentPos.x = prevPos.x + minDistance;
        positions.set(currentNode.id, currentPos);
      }
    }
  }

  /**
   * 应用平衡调整
   * @param {Array} layer - 当前层节点
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   */
  applyBalanceAdjustment(layer, positions, hierarchy) {
    layer.forEach(node => {
      const currentPos = positions.get(node.id);
      const parents = this.getNodeParents(node.id, hierarchy);
      const children = this.getNodeChildren(node.id, hierarchy);
      
      // 计算理想位置（基于父节点和子节点的平均位置）
      let idealX = currentPos.x;
      let weightSum = 0;
      
      if (parents.length > 0) {
        const parentPositions = parents
          .map(parentId => positions.get(parentId))
          .filter(pos => pos !== undefined);
        
        if (parentPositions.length > 0) {
          const parentAvgX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length;
          idealX += parentAvgX * this.config.balanceWeight;
          weightSum += this.config.balanceWeight;
        }
      }
      
      if (children.length > 0) {
        const childPositions = children
          .map(childId => positions.get(childId))
          .filter(pos => pos !== undefined);
        
        if (childPositions.length > 0) {
          const childAvgX = childPositions.reduce((sum, pos) => sum + pos.x, 0) / childPositions.length;
          idealX += childAvgX * this.config.balanceWeight;
          weightSum += this.config.balanceWeight;
        }
      }
      
      if (weightSum > 0) {
        idealX = (idealX + currentPos.x) / (weightSum + 1);
        positions.set(node.id, {
          x: idealX,
          y: currentPos.y
        });
      }
    });
  }

  /**
   * 应用全局对齐
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @param {Object} bounds - 布局边界
   */
  applyGlobalAlignment(positions, hierarchy, bounds) {
    if (!this.config.centerAlignment) return;
    
    // 计算当前布局的边界
    const currentBounds = this.calculateLayoutBounds(positions);
    
    // 计算偏移量以居中对齐
    const targetCenterX = (bounds.x || 0) + (bounds.width || 800) / 2;
    const currentCenterX = (currentBounds.minX + currentBounds.maxX) / 2;
    const offsetX = targetCenterX - currentCenterX;
    
    // 应用偏移
    positions.forEach((pos, nodeId) => {
      positions.set(nodeId, {
        x: pos.x + offsetX,
        y: pos.y
      });
    });
  }

  /**
   * 计算布局边界
   * @param {Map} positions - 位置映射
   * @returns {Object} 边界信息
   */
  calculateLayoutBounds(positions) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });
    
    return { minX, maxX, minY, maxY };
  }

  /**
   * 获取定位统计信息
   * @param {Map} positions - 位置映射
   * @param {Object} hierarchy - 层次结构
   * @returns {Object} 统计信息
   */
  getPositioningStats(positions, hierarchy) {
    const bounds = this.calculateLayoutBounds(positions);
    const layerStats = hierarchy.layers.map((layer, index) => {
      const layerPositions = layer.map(node => positions.get(node.id)).filter(pos => pos);
      const layerBounds = this.calculateLayoutBounds(new Map(layer.map(node => [node.id, positions.get(node.id)])));
      
      return {
        layerIndex: index,
        nodeCount: layer.length,
        width: layerBounds.maxX - layerBounds.minX,
        centerX: (layerBounds.minX + layerBounds.maxX) / 2
      };
    });
    
    return {
      totalNodes: positions.size,
      layoutBounds: bounds,
      layoutWidth: bounds.maxX - bounds.minX,
      layoutHeight: bounds.maxY - bounds.minY,
      layerStats
    };
  }
}

// 默认导出已通过 export class 实现
