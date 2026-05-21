/**
 * 层级工具模块
 * 提供层级构建、分组、对齐、验证等功能
 */

export class LayerUtils {
  constructor(options = {}) {
    this.options = {
      layer: {
        baseHeight: 150, // 层级基础高度
        spacing: 150, // 层级间距
        maxLayers: 20 // 最大层级数
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
   * 获取节点的简单层级索引
   * @param {string} nodeId - 节点ID
   * @returns {number} 层级索引
   */
  getSimpleLayerIndex(nodeId) {
    const layerPriorities = {
      // 第1层：开始节点
      'start': 1,
      'begin': 1,
      
      // 第2层：主要处理节点（统一分配到第2层，解决对齐问题）
      'ai-call': 2,
      'manual-call': 2,
      'audience-split': 2,
      'condition': 2,
      'decision': 2,
      'process': 2,
      'action': 2,
      'task': 2,
      
      // 第3层：后续处理节点
      'operation': 3,
      'transform': 3,
      'filter': 3,
      
      // 第4层：结束节点
      'end': 4,
      'finish': 4
    };

    // 从节点ID推断类型并获取层级
    for (const [type, layerIndex] of Object.entries(layerPriorities)) {
      if (nodeId.includes(type)) {
        return layerIndex;
      }
    }

    return 2; // 默认第2层
  }

  /**
   * 获取节点的层级Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 层级Y坐标
   */
  getNodeLayerY(nodeId) {
    const layerIndex = this.getSimpleLayerIndex(nodeId);
    const layerY = layerIndex * this.options.layer.baseHeight;
    
    console.log(`📐 [层级Y坐标] 节点 ${nodeId} -> 层级 ${layerIndex} -> Y坐标 ${layerY}`);
    return layerY;
  }

  /**
   * 获取下一层的Y坐标
   * @param {string} nodeId - 当前节点ID
   * @returns {number} 下一层Y坐标
   */
  getNextLayerY(nodeId) {
    try {
      const currentLayerY = this.getNodeLayerY(nodeId);
      const nextLayerY = currentLayerY + this.options.layer.baseHeight;
      console.log(
        `📐 [下一层Y坐标] 节点 ${nodeId} 当前层Y: ${currentLayerY} -> 下一层Y: ${nextLayerY}`
      );
      return nextLayerY;
    } catch (error) {
      console.error(`❌ [下一层Y坐标] 计算节点 ${nodeId} 下一层Y坐标失败:`, error);
      return this.options.layer.baseHeight; // 返回默认值
    }
  }

  /**
   * 按节点类型构建垂直分层
   * @param {Array} allNodes - 所有节点
   * @param {Function} getNodeType - 获取节点类型的函数
   * @returns {Array} 分层结构
   */
  buildVerticalLayersByType(allNodes, getNodeType) {
    console.log('🎯 [类型分层] 检测到无边连接模式，启用节点类型垂直分层');
    
    const layers = [];
    const normalNodes = [];
    
    // 按类型分组节点
    const startNodes = [];
    const endNodes = [];
    const otherNodes = [];
    
    allNodes.forEach(node => {
      const nodeType = getNodeType(node);
      if (nodeType === 'start' || nodeType === 'begin') {
        startNodes.push(node);
      } else if (nodeType === 'end' || nodeType === 'finish') {
        endNodes.push(node);
      } else {
        otherNodes.push(node);
        normalNodes.push(node);
      }
    });

    // 构建垂直分层：start在顶层，end在底层，其他节点在中间
    if (startNodes.length > 0) {
      layers.push(startNodes);
      console.log('📊 [类型分层] 第0层(顶层): start节点', startNodes.map(n => n.id || n.getId()));
    }

    if (otherNodes.length > 0) {
      layers.push(otherNodes);
      console.log(`📊 [类型分层] 第${layers.length - 1}层(中间层): 其他节点`, otherNodes.map(n => n.id || n.getId()));
    }

    if (endNodes.length > 0) {
      layers.push(endNodes);
      console.log(`📊 [类型分层] 第${layers.length - 1}层(底层): end节点`, endNodes.map(n => n.id || n.getId()));
    }

    // 如果只有一种类型的节点，确保至少有一层
    if (layers.length === 0 && normalNodes.length > 0) {
      layers.push(normalNodes);
      console.log('📊 [类型分层] 单一类型分层:', normalNodes.map(n => n.id || n.getId()));
    }

    return layers;
  }

  /**
   * 构建基于连接关系的分层结构
   * @param {Array} allNodes - 所有节点
   * @param {Array} leafNodes - 叶子节点
   * @param {Map} childParentMap - 子父关系映射
   * @returns {Array} 分层结构
   */
  buildConnectionBasedLayers(allNodes, leafNodes, childParentMap) {
    console.log('🔍 [层级构建] 开始基于连接关系构建分层结构');
    
    const layers = [];
    const processedNodes = new Set();
    let layerIndex = 0;

    // 第一层：叶子节点（最底层）
    if (leafNodes.length > 0) {
      layers.push([...leafNodes]);
      leafNodes.forEach(node => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
      });
      console.log(`📊 [层级构建] 第${layerIndex}层(叶子层): ${leafNodes.length}个节点`);
      layerIndex++;
    }

    // 逐层向上构建
    while (processedNodes.size < allNodes.length && layerIndex < this.options.layer.maxLayers) {
      const layerNodes = layers[layerIndex - 1] || [];
      
      // 查找下一层（父节点层）
      const nextLayer = [];
      const candidateParents = new Set();

      layerNodes.forEach((node) => {
        const nodeId = node.id || node.getId();
        const parents = childParentMap.get(nodeId) || [];

        console.log(`🔗 [层级构建] 节点 ${nodeId} 的父节点:`, parents);

        parents.forEach((parentId) => {
          if (!processedNodes.has(parentId)) {
            candidateParents.add(parentId);
          }
        });
      });

      console.log('🎯 [层级构建] 候选父节点:', Array.from(candidateParents));

      // 将候选父节点转换为节点对象
      candidateParents.forEach((parentId) => {
        const parentNode = allNodes.find(node => (node.id || node.getId()) === parentId);
        if (parentNode) {
          nextLayer.push(parentNode);
          processedNodes.add(parentId);
        }
      });

      if (nextLayer.length === 0) {
        console.log('🏁 [层级构建] 没有更多父节点，构建完成');
        break;
      }

      layers.push(nextLayer);
      console.log(`📊 [层级构建] 第${layerIndex}层: ${nextLayer.length}个节点`);
      layerIndex++;

      // 防止无限循环
      if (layerIndex > this.options.layer.maxLayers) {
        console.warn('⚠️ [层级构建] 层级构建超过最大层数，强制停止');
        break;
      }
    }

    return layers;
  }

  /**
   * 验证和完善分层结构
   * @param {Array} layers - 分层结构
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 完善后的分层结构
   */
  validateAndCompleteLayers(layers, allNodes) {
    console.log(
      `📊 [层级构建] 初步构建完成，共 ${layers.length} 层`
    );

    // 检查未处理的节点
    const processedNodes = new Set();
    layers.forEach(layer => {
      layer.forEach(node => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
      });
    });

    const allNodeIds = allNodes.map((node) => node.id || node.getId());
    const unprocessedNodeIds = allNodeIds.filter(
      (nodeId) => !processedNodes.has(nodeId)
    );

    if (unprocessedNodeIds.length > 0) {
      console.warn(
        `⚠️ [层级构建] 发现 ${unprocessedNodeIds.length} 个未处理节点:`,
        unprocessedNodeIds
      );
      
      // 将未处理的节点添加到新的层级
      const unprocessedNodes = allNodes.filter(node => 
        unprocessedNodeIds.includes(node.id || node.getId())
      );
      
      if (unprocessedNodes.length > 0) {
        layers.push(unprocessedNodes);
        console.log(`📊 [层级构建] 添加未处理节点层: ${unprocessedNodes.length}个节点`);
      }
    }

    // 打印最终层级结构
    layers.forEach((layer, index) => {
      console.log(
        `  第${index}层: ${layer.length}个节点`,
        layer.map((n) => n.id || n.getId())
      );
    });

    return layers;
  }

  /**
   * 计算自底向上的位置
   * @param {Array} layers - 分层结构
   * @returns {Map} 位置映射
   */
  calculateBottomUpPositions(layers) {
    console.log('📐 [位置计算] 开始自底向上位置计算');
    
    const positions = new Map();
    const layerSpacing = this.options.layer.spacing;
    
    // 从底层开始，向上递减Y坐标（因为Y轴向下为正）
    layers.forEach((layer, layerIndex) => {
      const layerY = (layers.length - 1 - layerIndex) * layerSpacing;
      
      console.log(`📐 [位置计算] 第${layerIndex}层 Y坐标: ${layerY}`);
      
      // 计算层内节点的X坐标（水平居中分布）
      const nodeSpacing = 200; // 节点间距
      const totalWidth = (layer.length - 1) * nodeSpacing;
      const startX = -totalWidth / 2; // 居中起始位置
      
      layer.forEach((node, nodeIndex) => {
        const nodeId = node.id || node.getId();
        const x = startX + nodeIndex * nodeSpacing;
        
        positions.set(nodeId, {
          x,
          y: layerY,
          layerIndex,
          nodeIndex
        });
        
        console.log(`📍 [位置计算] 节点 ${nodeId}: (${x}, ${layerY})`);
      });
    });
    
    console.log(`✅ [位置计算] 位置计算完成，共处理 ${positions.size} 个节点`);
    return positions;
  }

  /**
   * 验证同层Y坐标一致性
   * @param {Map} finalPositions - 最终位置映射
   * @returns {boolean} 验证结果
   */
  validateLayerYConsistency(finalPositions) {
    console.log("🔍 [Y坐标验证] 开始验证同层Y坐标一致性");

    // 按层级分组
    const layerGroups = new Map();
    finalPositions.forEach((position, nodeId) => {
      const layerIndex = position.layerIndex;
      if (!layerGroups.has(layerIndex)) {
        layerGroups.set(layerIndex, []);
      }
      layerGroups.get(layerIndex).push({ nodeId, position });
    });

    let hasInconsistency = false;

    // 验证每层的Y坐标一致性
    layerGroups.forEach((nodes, layerIndex) => {
      if (nodes.length <= 1) {return;} // 单节点层无需验证

      const firstY = nodes[0].position.y;
      const inconsistentNodes = nodes.filter(node => 
        Math.abs(node.position.y - firstY) > 0.1 // 允许0.1的误差
      );

      if (inconsistentNodes.length > 0) {
        hasInconsistency = true;
        console.warn(
          `⚠️ [Y坐标验证] 第${layerIndex}层Y坐标不一致:`,
          inconsistentNodes.map(node => `${node.nodeId}(${node.position.y})`)
        );
      } else {
        console.log(`✅ [Y坐标验证] 第${layerIndex}层Y坐标一致: ${firstY}`);
      }
    });

    if (!hasInconsistency) {
      console.log("✅ [Y坐标验证] 所有层级Y坐标验证通过");
    }

    return !hasInconsistency;
  }

  /**
   * 层级居中对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlignLayer(layerNodes, positions) {
    if (layerNodes.length <= 1) {
      return 0; // 单节点或空层无需对齐
    }

    console.log(`🎯 [层级对齐] 开始对齐 ${layerNodes.length} 个节点`);

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
    const targetCenterX = 0; // 目标中心位置

    const offsetX = targetCenterX - centerX;
    
    if (Math.abs(offsetX) < 1) {
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
   * 优化层级间距
   * @param {Array} layers - 分层结构
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  optimizeLayerSpacing(layers, positions) {
    console.log('📏 [间距优化] 开始优化层级间距');
    
    let adjustedCount = 0;
    const targetSpacing = this.options.layer.spacing;
    
    for (let i = 1; i < layers.length; i++) {
      const currentLayer = layers[i];
      const previousLayer = layers[i - 1];
      
      if (currentLayer.length === 0 || previousLayer.length === 0) {
        continue;
      }
      
      // 获取当前层和上一层的Y坐标
      const currentY = positions.get(currentLayer[0].id || currentLayer[0].getId())?.y;
      const previousY = positions.get(previousLayer[0].id || previousLayer[0].getId())?.y;
      
      if (currentY !== undefined && previousY !== undefined) {
        const actualSpacing = Math.abs(currentY - previousY);
        const spacingDiff = Math.abs(actualSpacing - targetSpacing);
        
        if (spacingDiff > 5) { // 允许5px的误差
          console.log(`📏 [间距优化] 第${i}层间距异常: 实际${actualSpacing}px, 目标${targetSpacing}px`);
          
          // 调整当前层的Y坐标
          const newY = previousY + (currentY > previousY ? targetSpacing : -targetSpacing);
          
          currentLayer.forEach(node => {
            const nodeId = node.id || node.getId();
            const position = positions.get(nodeId);
            if (position) {
              position.y = newY;
              adjustedCount++;
            }
          });
          
          console.log(`✅ [间距优化] 第${i}层Y坐标调整为: ${newY}`);
        }
      }
    }
    
    console.log(`✅ [间距优化] 间距优化完成，调整了 ${adjustedCount} 个节点`);
    return adjustedCount;
  }

  /**
   * 获取层级统计信息
   * @param {Array} layers - 分层结构
   * @returns {Object} 统计信息
   */
  getLayerStatistics(layers) {
    const stats = {
      totalLayers: layers.length,
      totalNodes: 0,
      layerDetails: [],
      averageNodesPerLayer: 0,
      maxNodesInLayer: 0,
      minNodesInLayer: Infinity
    };

    layers.forEach((layer, index) => {
      const nodeCount = layer.length;
      stats.totalNodes += nodeCount;
      stats.maxNodesInLayer = Math.max(stats.maxNodesInLayer, nodeCount);
      stats.minNodesInLayer = Math.min(stats.minNodesInLayer, nodeCount);
      
      stats.layerDetails.push({
        layerIndex: index,
        nodeCount,
        nodes: layer.map(n => n.id || n.getId())
      });
    });

    stats.averageNodesPerLayer = stats.totalNodes / stats.totalLayers;
    if (stats.minNodesInLayer === Infinity) {
      stats.minNodesInLayer = 0;
    }

    return stats;
  }
}

// 默认实例
export const layerUtils = new LayerUtils();

// 工厂函数
export function createLayerUtils(options = {}) {
  return new LayerUtils(options);
}

// 工具函数
export const LayerUtilsHelper = {
  /**
   * 快速获取节点层级Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} Y坐标
   */
  getLayerY: (nodeId) => {
    return layerUtils.getNodeLayerY(nodeId);
  },
  
  /**
   * 快速验证层级一致性
   * @param {Map} positions - 位置映射
   * @returns {boolean} 验证结果
   */
  validateConsistency: (positions) => {
    return layerUtils.validateLayerYConsistency(positions);
  },
  
  /**
   * 快速居中对齐层级
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlign: (layerNodes, positions) => {
    return layerUtils.centerAlignLayer(layerNodes, positions);
  }
};
// 默认导出已通过 export class 实现
