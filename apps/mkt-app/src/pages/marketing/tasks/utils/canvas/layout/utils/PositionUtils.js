/**
 * 位置工具模块
 * 提供位置计算、坐标处理、几何对齐等功能
 */

export class PositionUtils {
  constructor(options = {}) {
    this.options = {
      position: {
        maxCoordinate: 300, // 最大坐标值
        tolerance: 1, // 位置容差
        defaultSpacing: 80, // 默认间距
        centerX: 0, // 中心X坐标
        centerY: 0 // 中心Y坐标
      },
      ...options
    };
  }

  /**
   * 更新配置
   * @param {Object} options - 新配置
   */
  updateOptions(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   * 验证位置数据的有效性
   * @param {Object} position - 位置对象
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否有效
   */
  validatePosition(position, nodeId = 'unknown') {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      console.error(`❌ [位置验证] 节点 ${nodeId} 位置数据无效:`, position);
      return false;
    }

    // 检测异常的坐标偏移
    if (Math.abs(position.x) > this.options.position.maxCoordinate) {
      console.warn(`⚠️ [异常坐标] 节点 ${nodeId} X坐标异常: ${position.x}，可能存在计算错误`);
      return false;
    }

    if (Math.abs(position.y) > this.options.position.maxCoordinate * 10) { // Y坐标允许更大范围
      console.warn(`⚠️ [异常坐标] 节点 ${nodeId} Y坐标异常: ${position.y}，可能存在计算错误`);
      return false;
    }

    return true;
  }

  /**
   * 修正异常坐标
   * @param {Object} position - 位置对象
   * @param {string} nodeId - 节点ID
   * @returns {Object} 修正后的位置
   */
  correctAbnormalPosition(position, nodeId = 'unknown') {
    const correctedPosition = { ...position };
    let corrected = false;

    // 修正异常的X坐标
    if (Math.abs(position.x) > this.options.position.maxCoordinate) {
      correctedPosition.x = this.options.position.centerX;
      console.log(`🔧 [坐标修正] 节点 ${nodeId} X坐标已修正为: ${correctedPosition.x}`);
      corrected = true;
    }

    // 修正异常的Y坐标
    if (Math.abs(position.y) > this.options.position.maxCoordinate * 10) {
      correctedPosition.y = this.options.position.centerY;
      console.log(`🔧 [坐标修正] 节点 ${nodeId} Y坐标已修正为: ${correctedPosition.y}`);
      corrected = true;
    }

    if (corrected) {
      console.log(`✅ [坐标修正] 节点 ${nodeId} 坐标修正完成`);
    }

    return correctedPosition;
  }

  /**
   * 计算节点重要性权重
   * @param {Array} nodes - 节点数组
   * @returns {Map} 权重映射
   */
  calculateNodeImportanceWeights(nodes) {
    const weights = new Map();
    
    nodes.forEach(node => {
      const nodeId = node.id || node.getId();
      let weight = 1.0; // 默认权重
      
      // 根据节点类型调整权重
      if (nodeId.includes('start') || nodeId.includes('begin')) {
        weight = 1.5; // 开始节点权重更高
      } else if (nodeId.includes('end') || nodeId.includes('finish')) {
        weight = 1.5; // 结束节点权重更高
      } else if (nodeId.includes('ai-call') || nodeId.includes('manual-call')) {
        weight = 1.3; // 调用节点权重较高
      } else if (nodeId.includes('condition') || nodeId.includes('decision')) {
        weight = 1.2; // 决策节点权重较高
      }
      
      weights.set(nodeId, weight);
    });
    
    return weights;
  }

  /**
   * 智能对称分布位置计算
   * @param {Array} nodes - 节点数组
   * @param {number} layerY - 层级Y坐标
   * @returns {Map} 位置映射
   */
  calculateSymmetricDistribution(nodes, layerY) {
    const positions = new Map();
    const nodeCount = nodes.length;
    
    if (nodeCount === 0) {
      return positions;
    }
    
    console.log(`📐 [对称分布] 开始计算 ${nodeCount} 个节点的对称分布`);
    
    const nodeWeights = this.calculateNodeImportanceWeights(nodes);
    const baseSpacing = this.options.position.defaultSpacing;
    
    if (nodeCount === 1) {
      // 单节点：居中放置
      const nodeId = nodes[0].id || nodes[0].getId();
      positions.set(nodeId, {
        x: this.options.position.centerX,
        y: layerY
      });
      console.log(`📍 [对称分布] 单节点居中: ${nodeId} -> (${this.options.position.centerX}, ${layerY})`);
    } else if (nodeCount === 2) {
      // 两节点：动态对称分布，基于重要性调整间距
      const [node1, node2] = nodes;
      const node1Id = node1.id || node1.getId();
      const node2Id = node2.id || node2.getId();
      
      const weight1 = nodeWeights.get(node1Id) || 1.0;
      const weight2 = nodeWeights.get(node2Id) || 1.0;
      
      // 根据权重调整间距
      const weightFactor = Math.max(weight1, weight2);
      const adjustedSpacing = baseSpacing * weightFactor;
      
      positions.set(node1Id, {
        x: -adjustedSpacing / 2,
        y: layerY
      });
      positions.set(node2Id, {
        x: adjustedSpacing / 2,
        y: layerY
      });
      
      console.log(`📍 [对称分布] 双节点对称: ${node1Id}(-${adjustedSpacing/2}), ${node2Id}(${adjustedSpacing/2})`);
    } else {
      // 多节点：均匀分布
      const totalWidth = (nodeCount - 1) * baseSpacing;
      const startX = -totalWidth / 2;
      
      nodes.forEach((node, index) => {
        const nodeId = node.id || node.getId();
        const x = startX + index * baseSpacing;
        
        positions.set(nodeId, {
          x,
          y: layerY
        });
        
        console.log(`📍 [对称分布] 节点 ${nodeId} -> (${x}, ${layerY})`);
      });
    }
    
    console.log(`✅ [对称分布] 对称分布计算完成，共处理 ${nodeCount} 个节点`);
    return positions;
  }

  /**
   * 计算父节点的最优X坐标
   * @param {Array} childPositions - 子节点位置数组
   * @param {string} parentId - 父节点ID
   * @returns {number} 最优X坐标
   */
  calculateOptimalParentX(childPositions, parentId = 'unknown') {
    if (!childPositions || childPositions.length === 0) {
      console.warn('⚠️ [父节点定位] 子节点位置数组为空，返回默认位置0');
      return this.options.position.centerX;
    }

    const childXCoords = childPositions.map((pos) => pos.x);

    if (childXCoords.length === 1) {
      // 单个子节点，父节点直接对齐到子节点X坐标
      const optimalX = childXCoords[0];
      console.log(`🎯 [父节点定位] 单子节点对齐: 父节点X = ${optimalX.toFixed(1)}`);
      return optimalX;
    }

    // 多个子节点，计算几何中心
    const minX = Math.min(...childXCoords);
    const maxX = Math.max(...childXCoords);
    const centerX = (minX + maxX) / 2;
    
    console.log(`🎯 [父节点定位] 多子节点几何中心: 父节点 ${parentId} X = ${centerX.toFixed(1)} (范围: ${minX.toFixed(1)} ~ ${maxX.toFixed(1)})`);
    return centerX;
  }

  /**
   * 几何中心对齐验证
   * @param {string} parentId - 父节点ID
   * @param {Object} parentPosition - 父节点位置
   * @param {Array} childPositions - 子节点位置数组
   * @returns {Object} 验证结果
   */
  validateGeometricAlignment(parentId, parentPosition, childPositions) {
    if (!childPositions || childPositions.length === 0) {
      return { isValid: true, deviation: 0, message: '无子节点，无需验证' };
    }

    const optimalX = this.calculateOptimalParentX(childPositions, parentId);
    const geometricDeviation = Math.abs(parentPosition.x - optimalX);
    const tolerance = this.options.position.tolerance;

    const isValid = geometricDeviation <= tolerance;
    const message = isValid 
      ? `几何位置正确 (偏差: ${geometricDeviation.toFixed(6)}px)`
      : `几何位置偏差过大 (偏差: ${geometricDeviation.toFixed(1)}px > 容差: ${tolerance}px)`;

    console.log(`${isValid ? '✅' : '⚠️'} [几何验证] 父节点 ${parentId} ${message}`);

    return {
      isValid,
      deviation: geometricDeviation,
      optimalX,
      message
    };
  }

  /**
   * 层级居中对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlignLayer(layerNodes, positions) {
    if (layerNodes.length === 0) {return 0;}

    console.log(`🎯 [层级对齐] 开始对齐 ${layerNodes.length} 个节点`);

    // 特殊处理：单节点层直接居中
    if (layerNodes.length === 1) {
      const nodeId = layerNodes[0].id || layerNodes[0].getId();
      const pos = positions.get(nodeId);
      if (pos && Math.abs(pos.x) > this.options.position.tolerance) {
        console.log(`🔧 [单节点居中] 节点 ${nodeId}: ${pos.x.toFixed(1)} → 0`);
        pos.x = this.options.position.centerX;
        return 1;
      } else {
        console.log(`✅ [单节点居中] 节点 ${nodeId} 已居中`);
        return 0;
      }
    }

    // 计算当前层节点的X坐标范围
    const nodePositions = layerNodes.map(node => {
      const nodeId = node.id || node.getId();
      return positions.get(nodeId);
    }).filter(pos => pos !== undefined);

    if (nodePositions.length === 0) {
      return 0;
    }

    // 计算几何中心
    const totalX = nodePositions.reduce((sum, pos) => sum + pos.x, 0);
    const centerX = totalX / nodePositions.length;
    const targetCenterX = this.options.position.centerX;

    const offsetX = targetCenterX - centerX;
    
    if (Math.abs(offsetX) < this.options.position.tolerance) {
      console.log(`✅ [层级对齐] 层级已居中，无需调整`);
      return 0;
    }

    // 应用偏移
    let adjustedCount = 0;
    layerNodes.forEach(node => {
      const nodeId = node.id || node.getId();
      const position = positions.get(nodeId);
      if (position) {
        position.x += offsetX;
        adjustedCount++;
      }
    });

    console.log(`✅ [层级对齐] 层级居中完成，调整了 ${adjustedCount} 个节点，偏移量: ${offsetX.toFixed(2)}`);
    return adjustedCount;
  }

  /**
   * 全局平衡优化
   * @param {Map} positions - 位置映射
   * @param {Array} layers - 层级结构
   * @returns {number} 调整次数
   */
  globalBalanceOptimization(positions, layers) {
    console.log('⚖️ [全局平衡] 开始全局平衡优化');
    
    let totalAdjustedNodes = 0;
    const adjustmentIntensity = 0.3; // 调整强度
    
    // 计算全局重心
    const allPositions = Array.from(positions.values());
    if (allPositions.length === 0) {
      return 0;
    }
    
    const globalCenterX = allPositions.reduce((sum, pos) => sum + pos.x, 0) / allPositions.length;
    const targetCenterX = this.options.position.centerX;
    const globalShift = targetCenterX - globalCenterX;
    
    console.log(`⚖️ [全局平衡] 全局重心: ${globalCenterX.toFixed(1)}, 目标中心: ${targetCenterX}, 需要偏移: ${globalShift.toFixed(1)}`);
    
    if (Math.abs(globalShift) < this.options.position.tolerance) {
      console.log('✅ [全局平衡] 全局已平衡，无需调整');
      return 0;
    }
    
    // 对每个位置进行平衡调整
    positions.forEach((pos, nodeId) => {
      const oldX = pos.x;
      const distanceFromCenter = Math.abs(pos.x - targetCenterX);
      const targetShift = globalShift;
      
      // 根据距离中心的远近调整权重
      const adjustmentWeight = Math.min(distanceFromCenter / 200, 1.0);
      
      // 应用调整
      const adjustment = targetShift * adjustmentIntensity * adjustmentWeight;
      pos.x += adjustment;
      
      if (Math.abs(adjustment) > 0.5) {
        totalAdjustedNodes++;
        console.log(`⚖️ [节点调整] ${nodeId}: ${oldX.toFixed(1)} → ${pos.x.toFixed(1)} (调整: ${adjustment.toFixed(1)})`);
      }
    });
    
    console.log(`✅ [全局平衡] 全局平衡优化完成，调整了 ${totalAdjustedNodes} 个节点`);
    return totalAdjustedNodes;
  }

  /**
   * Y坐标一致性修正
   * @param {Map} positions - 位置映射
   * @param {Array} layers - 层级结构
   * @returns {number} 修正次数
   */
  correctYCoordinateConsistency(positions, layers) {
    console.log('🔧 [Y坐标修正] 开始Y坐标一致性修正');
    
    let fixedNodes = 0;
    const tolerance = this.options.position.tolerance;
    
    layers.forEach((layer, layerIndex) => {
      if (layer.length <= 1) {return;} // 单节点层无需修正
      
      // 计算该层的标准Y坐标（使用第一个节点的Y坐标作为标准）
      const firstNodeId = layer[0].id || layer[0].getId();
      const standardPosition = positions.get(firstNodeId);
      
      if (!standardPosition) {return;}
      
      const standardY = standardPosition.y;
      console.log(`🎯 [Y坐标修正] 第${layerIndex}层标准Y坐标: ${standardY}`);
      
      // 修正该层其他节点的Y坐标
      layer.forEach(node => {
        const nodeId = node.id || node.getId();
        const position = positions.get(nodeId);
        
        if (position) {
          const deviation = Math.abs(position.y - standardY);
          
          if (deviation > tolerance) {
            const oldY = position.y;
            position.y = standardY;
            console.log(`🔧 [Y坐标修正] 节点 ${nodeId}: ${oldY.toFixed(1)} → ${standardY.toFixed(1)} (修正偏差: ${deviation.toFixed(1)}px)`);
            fixedNodes++;
          }
        }
      });
    });
    
    console.log(`✅ [Y坐标修正] Y坐标一致性修正完成，修正了 ${fixedNodes} 个节点`);
    return fixedNodes;
  }

  /**
   * 计算中心点位置
   * @param {Object} position - 原始位置
   * @returns {Object} 中心点位置
   */
  calculateCenterPosition(position) {
    return {
      x: position.x,
      y: position.y
    };
  }

  /**
   * 生成均匀分布的位置数组
   * @param {number} count - 节点数量
   * @param {number} spacing - 间距
   * @returns {Array} 位置数组
   */
  generateUniformPositions(count, spacing = null) {
    if (count <= 0) {return [];}
    
    const actualSpacing = spacing || this.options.position.defaultSpacing;
    const positions = [];
    
    if (count === 1) {
      positions.push(this.options.position.centerX);
    } else {
      const totalWidth = (count - 1) * actualSpacing;
      const startX = -totalWidth / 2;
      
      for (let i = 0; i < count; i++) {
        positions.push(startX + i * actualSpacing);
      }
    }
    
    // 确保整体居中
    const centerX = (positions[0] + positions[positions.length - 1]) / 2;
    const offset = -centerX;
    return positions.map(pos => pos + offset);
  }

  /**
   * 获取位置统计信息
   * @param {Map} positions - 位置映射
   * @returns {Object} 统计信息
   */
  getPositionStatistics(positions) {
    if (positions.size === 0) {
      return {
        totalNodes: 0,
        xRange: { min: 0, max: 0, span: 0 },
        yRange: { min: 0, max: 0, span: 0 },
        centerX: 0,
        centerY: 0
      };
    }
    
    const allPositions = Array.from(positions.values());
    const xCoords = allPositions.map(pos => pos.x);
    const yCoords = allPositions.map(pos => pos.y);
    
    const stats = {
      totalNodes: positions.size,
      xRange: {
        min: Math.min(...xCoords),
        max: Math.max(...xCoords),
        span: Math.max(...xCoords) - Math.min(...xCoords)
      },
      yRange: {
        min: Math.min(...yCoords),
        max: Math.max(...yCoords),
        span: Math.max(...yCoords) - Math.min(...yCoords)
      },
      centerX: xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length,
      centerY: yCoords.reduce((sum, y) => sum + y, 0) / yCoords.length
    };
    
    return stats;
  }
}

// 默认实例
export const positionUtils = new PositionUtils();

// 工厂函数
export function createPositionUtils(options = {}) {
  return new PositionUtils(options);
}

// 工具函数
export const PositionUtilsHelper = {
  /**
   * 快速验证位置
   * @param {Object} position - 位置对象
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否有效
   */
  validate: (position, nodeId) => {
    return positionUtils.validatePosition(position, nodeId);
  },
  
  /**
   * 快速修正位置
   * @param {Object} position - 位置对象
   * @param {string} nodeId - 节点ID
   * @returns {Object} 修正后的位置
   */
  correct: (position, nodeId) => {
    return positionUtils.correctAbnormalPosition(position, nodeId);
  },
  
  /**
   * 快速计算父节点位置
   * @param {Array} childPositions - 子节点位置数组
   * @param {string} parentId - 父节点ID
   * @returns {number} 最优X坐标
   */
  calculateParentX: (childPositions, parentId) => {
    return positionUtils.calculateOptimalParentX(childPositions, parentId);
  },
  
  /**
   * 快速居中对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlign: (layerNodes, positions) => {
    return positionUtils.centerAlignLayer(layerNodes, positions);
  }
};
// 默认导出已通过 export class 实现
