/**
 * 位置工具类
 * 提供位置计算相关的工具函数
 */

/**
 * 位置工具类
 */
class PositionUtils {
  /**
   * 计算节点的X坐标
   */
  static calculateNodeX(nodeIndex, totalNodes, options = {}) {
    const {
      containerWidth = 1200,
      nodeWidth = 200,
      minSpacing = 50,
      maxSpacing = 150,
      centerAlign = true,
      padding = 50
    } = options;
    
    if (totalNodes <= 0) {
      return centerAlign ? containerWidth / 2 : nodeWidth / 2;
    }
    
    if (totalNodes === 1) {
      return centerAlign ? containerWidth / 2 : nodeWidth / 2;
    }
    
    // 计算可用宽度
    const availableWidth = containerWidth - 2 * padding;
    const totalNodeWidth = totalNodes * nodeWidth;
    const availableSpacing = availableWidth - totalNodeWidth;
    
    // 计算间距
    let spacing = availableSpacing / (totalNodes - 1);
    spacing = Math.max(minSpacing, Math.min(maxSpacing, spacing));
    
    // 计算实际使用的总宽度
    const actualTotalWidth = totalNodeWidth + (totalNodes - 1) * spacing;
    
    // 计算起始X坐标
    const startX = centerAlign ? 
      (containerWidth - actualTotalWidth) / 2 + nodeWidth / 2 :
      padding + nodeWidth / 2;
    
    return startX + nodeIndex * (nodeWidth + spacing);
  }
  
  /**
   * 计算节点的Y坐标
   */
  static calculateNodeY(layer, options = {}) {
    const {
      baseHeight = 120,
      layerSpacing = 150,
      startY = 100,
      nodeHeight = 80
    } = options;
    
    return startY + layer * (baseHeight + layerSpacing) + nodeHeight / 2;
  }
  
  /**
   * 批量计算节点位置
   */
  static calculateNodePositions(nodes, layerMap, options = {}) {
    const positions = new Map();
    
    if (!nodes || nodes.length === 0) {
      return positions;
    }
    
    // 按层级分组节点
    const layerGroups = this.groupNodesByLayer(nodes, layerMap);
    
    // 为每层计算位置
    layerGroups.forEach((layerNodes, layer) => {
      const layerPositions = this.calculateLayerPositions(layerNodes, layer, options);
      
      layerPositions.forEach((position, nodeId) => {
        positions.set(nodeId, position);
      });
    });
    
    return positions;
  }
  
  /**
   * 计算单层节点位置
   */
  static calculateLayerPositions(nodes, layer, options = {}) {
    const positions = new Map();
    
    if (!nodes || nodes.length === 0) {
      return positions;
    }
    
    // 计算Y坐标
    const y = this.calculateNodeY(layer, options);
    
    // 计算X坐标分布
    nodes.forEach((node, index) => {
      const nodeId = this.getNodeId(node);
      const x = this.calculateNodeX(index, nodes.length, options);
      
      positions.set(nodeId, { x, y });
    });
    
    return positions;
  }
  
  /**
   * 优化节点位置以避免重叠
   */
  static optimizePositions(positions, options = {}) {
    const {
      nodeWidth = 200,
      nodeHeight = 80,
      minSpacing = 20,
      maxIterations = 10
    } = options;
    
    const optimizedPositions = new Map(positions);
    const positionArray = Array.from(optimizedPositions.entries());
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let hasOverlap = false;
      
      for (let i = 0; i < positionArray.length; i++) {
        for (let j = i + 1; j < positionArray.length; j++) {
          const [nodeId1, pos1] = positionArray[i];
          const [nodeId2, pos2] = positionArray[j];
          
          if (this.hasOverlap(pos1, pos2, nodeWidth, nodeHeight, minSpacing)) {
            // 调整位置以消除重叠
            const adjustment = this.calculateAdjustment(pos1, pos2, nodeWidth, nodeHeight, minSpacing);
            
            pos1.x += adjustment.dx1;
            pos1.y += adjustment.dy1;
            pos2.x += adjustment.dx2;
            pos2.y += adjustment.dy2;
            
            optimizedPositions.set(nodeId1, pos1);
            optimizedPositions.set(nodeId2, pos2);
            
            hasOverlap = true;
          }
        }
      }
      
      if (!hasOverlap) {
        break;
      }
    }
    
    return optimizedPositions;
  }
  
  /**
   * 检查两个节点是否重叠
   */
  static hasOverlap(pos1, pos2, nodeWidth, nodeHeight, minSpacing) {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    
    const minDx = nodeWidth + minSpacing;
    const minDy = nodeHeight + minSpacing;
    
    return dx < minDx && dy < minDy;
  }
  
  /**
   * 计算位置调整量
   */
  static calculateAdjustment(pos1, pos2, nodeWidth, nodeHeight, minSpacing) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      // 完全重叠，随机分离
      return {
        dx1: -minSpacing / 2,
        dy1: 0,
        dx2: minSpacing / 2,
        dy2: 0
      };
    }
    
    const minDistance = Math.sqrt((nodeWidth + minSpacing) ** 2 + (nodeHeight + minSpacing) ** 2);
    const adjustmentDistance = (minDistance - distance) / 2;
    
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    return {
      dx1: -unitX * adjustmentDistance,
      dy1: -unitY * adjustmentDistance,
      dx2: unitX * adjustmentDistance,
      dy2: unitY * adjustmentDistance
    };
  }
  
  /**
   * 对齐节点位置到网格
   */
  static alignToGrid(positions, options = {}) {
    const {
      gridSize = 20,
      snapThreshold = 10
    } = options;
    
    const alignedPositions = new Map();
    
    positions.forEach((position, nodeId) => {
      const alignedX = this.snapToGrid(position.x, gridSize, snapThreshold);
      const alignedY = this.snapToGrid(position.y, gridSize, snapThreshold);
      
      alignedPositions.set(nodeId, { x: alignedX, y: alignedY });
    });
    
    return alignedPositions;
  }
  
  /**
   * 将坐标对齐到网格
   */
  static snapToGrid(coordinate, gridSize, snapThreshold) {
    const gridPoint = Math.round(coordinate / gridSize) * gridSize;
    const distance = Math.abs(coordinate - gridPoint);
    
    return distance <= snapThreshold ? gridPoint : coordinate;
  }
  
  /**
   * 计算边界框
   */
  static calculateBoundingBox(positions, options = {}) {
    const {
      nodeWidth = 200,
      nodeHeight = 80,
      padding = 50
    } = options;
    
    if (positions.size === 0) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    }
    
    const positionArray = Array.from(positions.values());
    
    const minX = Math.min(...positionArray.map(pos => pos.x - nodeWidth / 2));
    const maxX = Math.max(...positionArray.map(pos => pos.x + nodeWidth / 2));
    const minY = Math.min(...positionArray.map(pos => pos.y - nodeHeight / 2));
    const maxY = Math.max(...positionArray.map(pos => pos.y + nodeHeight / 2));
    
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + 2 * padding,
      height: maxY - minY + 2 * padding
    };
  }
  
  /**
   * 居中对齐所有节点
   */
  static centerAlign(positions, containerWidth, containerHeight, options = {}) {
    const {
      nodeWidth = 200,
      nodeHeight = 80
    } = options;
    
    if (positions.size === 0) {
      return new Map();
    }
    
    const boundingBox = this.calculateBoundingBox(positions, { nodeWidth, nodeHeight, padding: 0 });
    
    const offsetX = (containerWidth - boundingBox.width) / 2 - boundingBox.x;
    const offsetY = (containerHeight - boundingBox.height) / 2 - boundingBox.y;
    
    const centeredPositions = new Map();
    
    positions.forEach((position, nodeId) => {
      centeredPositions.set(nodeId, {
        x: position.x + offsetX,
        y: position.y + offsetY
      });
    });
    
    return centeredPositions;
  }
  
  /**
   * 计算两点之间的距离
   */
  static calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 计算两点之间的角度（弧度）
   */
  static calculateAngle(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.atan2(dy, dx);
  }
  
  /**
   * 旋转点坐标
   */
  static rotatePoint(position, centerPosition, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const dx = position.x - centerPosition.x;
    const dy = position.y - centerPosition.y;
    
    return {
      x: centerPosition.x + dx * cos - dy * sin,
      y: centerPosition.y + dx * sin + dy * cos
    };
  }
  
  /**
   * 缩放位置
   */
  static scalePositions(positions, scale, centerPosition = null) {
    if (scale === 1) {
      return new Map(positions);
    }
    
    const scaledPositions = new Map();
    
    // 如果没有指定中心点，使用所有节点的中心
    if (!centerPosition && positions.size > 0) {
      const positionArray = Array.from(positions.values());
      centerPosition = {
        x: positionArray.reduce((sum, pos) => sum + pos.x, 0) / positionArray.length,
        y: positionArray.reduce((sum, pos) => sum + pos.y, 0) / positionArray.length
      };
    }
    
    positions.forEach((position, nodeId) => {
      const dx = position.x - centerPosition.x;
      const dy = position.y - centerPosition.y;
      
      scaledPositions.set(nodeId, {
        x: centerPosition.x + dx * scale,
        y: centerPosition.y + dy * scale
      });
    });
    
    return scaledPositions;
  }
  
  /**
   * 平移位置
   */
  static translatePositions(positions, offset) {
    const translatedPositions = new Map();
    
    positions.forEach((position, nodeId) => {
      translatedPositions.set(nodeId, {
        x: position.x + offset.x,
        y: position.y + offset.y
      });
    });
    
    return translatedPositions;
  }
  
  /**
   * 验证位置的有效性
   */
  static validatePositions(positions, options = {}) {
    const {
      minX = 0,
      minY = 0,
      maxX = 2000,
      maxY = 2000,
      allowNegative = false
    } = options;
    
    const errors = [];
    const warnings = [];
    
    positions.forEach((position, nodeId) => {
      // 检查坐标是否为数字
      if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        errors.push(`Invalid position type for node ${nodeId}: x=${position.x}, y=${position.y}`);
        return;
      }
      
      // 检查是否为NaN或无穷大
      if (!isFinite(position.x) || !isFinite(position.y)) {
        errors.push(`Invalid position value for node ${nodeId}: x=${position.x}, y=${position.y}`);
        return;
      }
      
      // 检查负值
      if (!allowNegative && (position.x < 0 || position.y < 0)) {
        warnings.push(`Negative position for node ${nodeId}: x=${position.x}, y=${position.y}`);
      }
      
      // 检查边界
      if (position.x < minX || position.x > maxX || position.y < minY || position.y > maxY) {
        warnings.push(`Position out of bounds for node ${nodeId}: x=${position.x}, y=${position.y}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 计算位置统计信息
   */
  static calculatePositionStatistics(positions) {
    if (positions.size === 0) {
      return {
        count: 0,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
        center: { x: 0, y: 0 },
        spread: { x: 0, y: 0 }
      };
    }
    
    const positionArray = Array.from(positions.values());
    
    const xValues = positionArray.map(pos => pos.x);
    const yValues = positionArray.map(pos => pos.y);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    const centerX = xValues.reduce((sum, x) => sum + x, 0) / xValues.length;
    const centerY = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
    
    return {
      count: positions.size,
      bounds: { minX, maxX, minY, maxY },
      center: { x: centerX, y: centerY },
      spread: { x: maxX - minX, y: maxY - minY }
    };
  }
  
  /**
   * 按层级分组节点
   */
  static groupNodesByLayer(nodes, layerMap) {
    const layerGroups = new Map();
    
    nodes.forEach(node => {
      const nodeId = this.getNodeId(node);
      const layer = layerMap.get(nodeId) || 0;
      
      if (!layerGroups.has(layer)) {
        layerGroups.set(layer, []);
      }
      
      layerGroups.get(layer).push(node);
    });
    
    return layerGroups;
  }
  
  /**
   * 获取节点ID
   */
  static getNodeId(node) {
    if (typeof node === 'string') return node;
    if (typeof node.id === 'string') return node.id;
    if (typeof node.getId === 'function') return node.getId();
    if (node.data && node.data.id) return node.data.id;
    return null;
  }
  
  /**
   * 创建位置对象
   */
  static createPosition(x, y, metadata = {}) {
    return {
      x: Number(x) || 0,
      y: Number(y) || 0,
      ...metadata
    };
  }
  
  /**
   * 复制位置对象
   */
  static clonePosition(position) {
    return {
      x: position.x,
      y: position.y,
      ...(position.metadata && { metadata: { ...position.metadata } })
    };
  }
  
  /**
   * 比较两个位置是否相等
   */
  static positionsEqual(pos1, pos2, tolerance = 0.001) {
    return Math.abs(pos1.x - pos2.x) <= tolerance && 
           Math.abs(pos1.y - pos2.y) <= tolerance;
  }
  
  /**
   * 插值计算两个位置之间的中间位置
   */
  static interpolatePosition(pos1, pos2, t) {
    t = Math.max(0, Math.min(1, t)); // 限制t在[0,1]范围内
    
    return {
      x: pos1.x + (pos2.x - pos1.x) * t,
      y: pos1.y + (pos2.y - pos1.y) * t
    };
  }
  
  /**
   * 计算贝塞尔曲线上的点
   */
  static calculateBezierPoint(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }
}

export { PositionUtils };
export default PositionUtils;