/**
 * 几何中心对齐算法 - 解决X坐标中点对齐问题
 * 基于技术方案文档的优化算法实现
 * @typedef {Object} AlignmentConfig
 * @property {boolean} enableVirtualNodes - 启用虚拟节点
 * @property {boolean} enableGlobalAlignment - 启用全局对齐
 * @property {boolean} enableMixedDepthHandling - 启用混合深度处理
 * @property {number} minSpacing - 最小间距
 * @property {number} preferredSpacing - 首选间距
 * @property {number} maxWidth - 最大宽度
 * @property {boolean} enableDebug - 启用调试
 * @property {string} logLevel - 日志级别
 * 
 * @typedef {Object} Position
 * @property {number} x - X坐标
 * @property {number} y - Y坐标
 * 
 * @typedef {Object} LayerNode
 * @property {string} id - 节点ID
 * @property {Array<string>} children - 子节点ID列表
 * @property {number} layerIndex - 层级索引
 * @property {boolean} isLeaf - 是否为叶子节点
 * 
 * @typedef {Object} Layer
 * @property {Array<LayerNode>} nodes - 节点列表
 */

export class GeometricCenterAlignment {
  /**
   * @param {AlignmentConfig} config - 配置对象
   */
  constructor(config = {}) {
    this.config = {
      // 基础配置
      enableVirtualNodes: true,
      enableGlobalAlignment: true,
      enableMixedDepthHandling: true,
      
      // 间距配置
      minSpacing: 150,
      preferredSpacing: 200,
      maxWidth: 800,
      
      // 调试配置
      enableDebug: true,
      logLevel: 'info',
      
      ...config
    };

    this.calculationStats = {
      totalCalculations: 0,
      virtualNodesCreated: 0,
      alignmentAdjustments: 0,
      mixedDepthCases: 0
    };
  }

  /**
   * 主要计算方法：几何中心对齐
   * @param {Array<Layer>} layers - 层级数据
   * @param {Map<string, Position>} currentPositions - 当前位置映射
   * @returns {Promise<Map<string, Position>>} 优化后的位置映射
   */
  async calculateGeometricAlignment(layers, currentPositions) {
    console.log('🎯 [几何中心对齐] 开始计算');
    
    // 参数验证：确保layers和currentPositions有效
    if (!layers || !Array.isArray(layers)) {
      console.error('❌ [几何中心对齐] layers参数无效:', layers);
      throw new Error('layers参数必须是数组');
    }
    
    // 确保currentPositions是可迭代的Map对象
    let optimizedPositions;
    if (!currentPositions) {
      console.warn('⚠️ [几何中心对齐] currentPositions为空，创建新的Map');
      optimizedPositions = new Map();
    } else if (currentPositions instanceof Map) {
      optimizedPositions = new Map(currentPositions);
    } else if (typeof currentPositions === 'object') {
      // 如果是普通对象，转换为Map
      console.warn('⚠️ [几何中心对齐] currentPositions不是Map对象，正在转换');
      optimizedPositions = new Map(Object.entries(currentPositions));
    } else {
      console.error('❌ [几何中心对齐] currentPositions类型无效:', typeof currentPositions);
      throw new Error('currentPositions必须是Map对象或普通对象');
    }
    
    try {
      // 步骤1：识别所有叶子节点
      const leafNodes = this.identifyLeafNodes(layers);
      console.log(`📍 [叶子节点] 识别到 ${leafNodes.length} 个叶子节点`);
      
      // 步骤2：等间距分布叶子节点
      this.distributeLeafNodes(leafNodes, optimizedPositions);
      
      // 步骤3：自底向上计算父节点位置
      await this.calculateParentPositionsBottomUp(layers, optimizedPositions);
      
      // 步骤4：处理混合深度问题
      if (this.config.enableMixedDepthHandling) {
        await this.handleMixedDepthAlignment(layers, optimizedPositions);
      }
      
      // 步骤5：全局中心对齐
      if (this.config.enableGlobalAlignment) {
        this.applyGlobalCenterAlignment(layers, optimizedPositions);
      }
      
      // 步骤6：验证对齐结果
      this.validateAlignment(layers, optimizedPositions);
      
      this.calculationStats.totalCalculations++;
      console.log('✅ [几何中心对齐] 计算完成');
      
      return optimizedPositions;
    } catch (error) {
      console.error('❌ [几何中心对齐] 计算失败:', error);
      throw error;
    }
  }

  /**
   * 识别所有叶子节点
   * @param {Array<Layer>} layers - 层级数据
   * @returns {Array<LayerNode>} 叶子节点列表
   */
  identifyLeafNodes(layers) {
    const leafNodes = [];
    const nodeChildrenMap = new Map();
    
    // 构建父子关系映射
    layers.forEach(layer => {
      layer.nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          nodeChildrenMap.set(node.id, node.children);
        }
      });
    });
    
    // 识别叶子节点（没有子节点的节点）
    layers.forEach((layer, layerIndex) => {
      layer.nodes.forEach(node => {
        if (!nodeChildrenMap.has(node.id)) {
          leafNodes.push({
            ...node,
            layerIndex,
            isLeaf: true
          });
        }
      });
    });
    
    console.log(`📊 [叶子节点] 详情:`, leafNodes.map(node => 
      `${node.id}(层级${node.layerIndex})`
    ).join(', '));
    
    return leafNodes;
  }

  /**
   * 等间距分布叶子节点
   * @param {Array<LayerNode>} leafNodes - 叶子节点列表
   * @param {Map<string, Position>} positions - 位置映射
   */
  distributeLeafNodes(leafNodes, positions) {
    if (leafNodes.length === 0) return;
    
    console.log(`📐 [叶子分布] 开始分布 ${leafNodes.length} 个叶子节点`);
    
    if (leafNodes.length === 1) {
      // 单个叶子节点，居中放置
      const node = leafNodes[0];
      const currentPos = positions.get(node.id) || { x: 0, y: 0 };
      positions.set(node.id, { ...currentPos, x: 0 });
      console.log(`📍 [单叶子] ${node.id} 居中: x=0`);
      return;
    }
    
    // 多个叶子节点，等间距分布
    const totalWidth = Math.min(this.config.maxWidth, leafNodes.length * this.config.preferredSpacing);
    const spacing = totalWidth / (leafNodes.length - 1);
    const startX = -totalWidth / 2;
    
    leafNodes.forEach((node, index) => {
      const x = startX + index * spacing;
      const currentPos = positions.get(node.id) || { x: 0, y: 0 };
      positions.set(node.id, { ...currentPos, x });
      
      console.log(`📍 [叶子分布] ${node.id} -> x=${x.toFixed(1)} (索引${index})`);
    });
    
    // 验证叶子节点中心
    const leafXCoords = leafNodes.map(node => positions.get(node.id).x);
    const leafCenter = leafXCoords.reduce((sum, x) => sum + x, 0) / leafXCoords.length;
    console.log(`🎯 [叶子中心] 几何中心: ${leafCenter.toFixed(3)} (应该接近0)`);
  }

  /**
   * 自底向上计算父节点位置
   * @param {Array<Layer>} layers - 层级数据
   * @param {Map<string, Position>} positions - 位置映射
   * @returns {Promise<void>}
   */
  async calculateParentPositionsBottomUp(layers, positions) {
    console.log('⬆️ [自底向上] 开始计算父节点位置');
    
    // 构建父子关系映射
    const parentChildrenMap = new Map();
    layers.forEach(layer => {
      layer.nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          parentChildrenMap.set(node.id, node.children);
        }
      });
    });
    
    // 从最底层开始，向上计算
    for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
      const layer = layers[layerIndex];
      
      for (const node of layer.nodes) {
        const children = parentChildrenMap.get(node.id);
        
        if (children && children.length > 0) {
          // 有子节点，计算几何中心
          const childXCoords = children.map(childId => {
            const childPos = positions.get(childId);
            if (!childPos) {
              console.warn(`⚠️ [父节点计算] 子节点 ${childId} 位置不存在`);
              return 0;
            }
            return childPos.x;
          });
          
          const geometricCenter = childXCoords.reduce((sum, x) => sum + x, 0) / childXCoords.length;
          
          const currentPos = positions.get(node.id) || { x: 0, y: 0 };
          positions.set(node.id, { ...currentPos, x: geometricCenter });
          
          console.log(`🎯 [父节点] ${node.id} -> x=${geometricCenter.toFixed(1)} (子节点: [${childXCoords.map(x => x.toFixed(1)).join(', ')}])`);
        }
      }
    }
  }

  /**
   * 处理混合深度对齐问题
   * @param {Array} layers - 层级数据
   * @param {Map} positions - 位置映射
   */
  async handleMixedDepthAlignment(layers, positions) {
    console.log('🔧 [混合深度] 开始处理混合深度对齐');
    
    // 检测每层的几何中心
    const layerCenters = [];
    
    layers.forEach((layer, layerIndex) => {
      const layerXCoords = layer.nodes.map(node => {
        const pos = positions.get(node.id);
        return pos ? pos.x : 0;
      });
      
      if (layerXCoords.length > 0) {
        const center = layerXCoords.reduce((sum, x) => sum + x, 0) / layerXCoords.length;
        layerCenters.push({ layerIndex, center, nodeCount: layerXCoords.length });
        
        console.log(`📊 [层级中心] 第${layerIndex}层: 中心=${center.toFixed(3)}, 节点数=${layerXCoords.length}`);
      }
    });
    
    // 检查是否存在中心偏移
    const centerVariance = this.calculateCenterVariance(layerCenters);
    
    if (centerVariance > 10) { // 偏移超过10px认为需要修正
      console.log(`⚠️ [中心偏移] 检测到中心偏移: ${centerVariance.toFixed(2)}px，开始修正`);
      
      // 使用虚拟节点补齐策略
      if (this.config.enableVirtualNodes) {
        await this.applyVirtualNodeStrategy(layers, positions, layerCenters);
      }
      
      this.calculationStats.mixedDepthCases++;
    } else {
      console.log(`✅ [中心对齐] 层级中心对齐良好，偏差: ${centerVariance.toFixed(2)}px`);
    }
  }

  /**
   * 计算层级中心方差
   * @param {Array} layerCenters - 层级中心数据
   * @returns {number} 中心方差
   */
  calculateCenterVariance(layerCenters) {
    if (layerCenters.length <= 1) return 0;
    
    const centers = layerCenters.map(layer => layer.center);
    const mean = centers.reduce((sum, center) => sum + center, 0) / centers.length;
    const variance = centers.reduce((sum, center) => sum + Math.pow(center - mean, 2), 0) / centers.length;
    
    return Math.sqrt(variance);
  }

  /**
   * 应用虚拟节点策略
   * @param {Array} layers - 层级数据
   * @param {Map} positions - 位置映射
   * @param {Array} layerCenters - 层级中心数据
   */
  async applyVirtualNodeStrategy(layers, positions, layerCenters) {
    console.log('👻 [虚拟节点] 开始应用虚拟节点策略');
    
    // 找到目标中心（通常是全局叶子节点的中心）
    const targetCenter = 0; // 目标是居中对齐
    
    // 为每层创建虚拟节点以达到中心对齐
    layerCenters.forEach(layerInfo => {
      const { layerIndex, center, nodeCount } = layerInfo;
      const offset = targetCenter - center;
      
      if (Math.abs(offset) > 5) { // 偏移超过5px才调整
        console.log(`🔧 [虚拟调整] 第${layerIndex}层需要调整 ${offset.toFixed(2)}px`);
        
        // 调整该层所有节点位置
        const layer = layers[layerIndex];
        layer.nodes.forEach(node => {
          const currentPos = positions.get(node.id);
          if (currentPos) {
            positions.set(node.id, {
              ...currentPos,
              x: currentPos.x + offset
            });
          }
        });
        
        this.calculationStats.alignmentAdjustments++;
      }
    });
    
    this.calculationStats.virtualNodesCreated += layerCenters.length;
  }

  /**
   * 应用全局中心对齐
   * @param {Array} layers - 层级数据
   * @param {Map} positions - 位置映射
   */
  applyGlobalCenterAlignment(layers, positions) {
    console.log('🌐 [全局对齐] 开始全局中心对齐');
    
    // 计算所有节点的几何中心
    const allXCoords = [];
    positions.forEach(pos => {
      allXCoords.push(pos.x);
    });
    
    if (allXCoords.length === 0) return;
    
    const globalCenter = allXCoords.reduce((sum, x) => sum + x, 0) / allXCoords.length;
    const offset = -globalCenter; // 偏移到中心
    
    if (Math.abs(offset) > 1) { // 偏移超过1px才调整
      console.log(`🔧 [全局调整] 全局偏移: ${offset.toFixed(2)}px`);
      
      // 调整所有节点位置
      positions.forEach((pos, nodeId) => {
        positions.set(nodeId, {
          ...pos,
          x: pos.x + offset
        });
      });
      
      console.log(`✅ [全局对齐] 全局中心对齐完成`);
    } else {
      console.log(`✅ [全局对齐] 全局中心已对齐，偏差: ${Math.abs(offset).toFixed(3)}px`);
    }
  }

  /**
   * 验证对齐结果 - 主要验证方法
   * @param {Object} alignmentResult - 对齐结果对象
   * @returns {Object} 验证结果
   */
  validateAlignment(alignmentResult) {
    console.log('🔍 [对齐验证] 开始验证对齐结果');
    
    try {
      if (!alignmentResult || !alignmentResult.positions) {
        return {
          isValid: false,
          errors: ['对齐结果为空或缺少位置信息']
        };
      }

      const positions = alignmentResult.positions;
      const errors = [];

      // 验证位置数据的有效性
      for (const [nodeId, position] of positions) {
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
          errors.push(`节点 ${nodeId} 位置数据无效`);
        }
        
        if (isNaN(position.x) || isNaN(position.y)) {
          errors.push(`节点 ${nodeId} 位置包含NaN值`);
        }
      }

      // 验证层级一致性
      const layerGroups = new Map();
      for (const [nodeId, position] of positions) {
        if (position.layerIndex !== undefined) {
          if (!layerGroups.has(position.layerIndex)) {
            layerGroups.set(position.layerIndex, []);
          }
          layerGroups.get(position.layerIndex).push(position);
        }
      }

      // 检查同层Y坐标一致性
      for (const [layerIndex, layerPositions] of layerGroups) {
        if (layerPositions.length > 1) {
          const firstY = layerPositions[0].y;
          const hasInconsistentY = layerPositions.some(pos => Math.abs(pos.y - firstY) > 1);
          if (hasInconsistentY) {
            errors.push(`层级 ${layerIndex} 存在Y坐标不一致问题`);
          }
        }
      }

      const isValid = errors.length === 0;
      
      console.log(`${isValid ? '✅' : '❌'} [对齐验证] 验证${isValid ? '通过' : '失败'}${errors.length > 0 ? `，错误: ${errors.join(', ')}` : ''}`);
      
      return {
        isValid,
        errors,
        validatedPositions: positions.size,
        layerCount: layerGroups.size
      };
    } catch (error) {
      console.error('❌ [对齐验证] 验证过程出错:', error);
      return {
        isValid: false,
        errors: [`验证过程出错: ${error.message}`]
      };
    }
  }

  /**
   * 验证对齐结果（详细版本）
   * @param {Array} layers - 层级数据
   * @param {Map} positions - 位置映射
   * @returns {Object} 验证结果
   */
  validateAlignmentDetailed(layers, positions) {
    console.log('🔍 [对齐验证] 开始验证对齐结果');
    
    const layerCenters = [];
    
    layers.forEach((layer, layerIndex) => {
      const layerXCoords = layer.nodes.map(node => {
        const pos = positions.get(node.id);
        return pos ? pos.x : 0;
      }).filter(x => !isNaN(x));
      
      if (layerXCoords.length > 0) {
        const center = layerXCoords.reduce((sum, x) => sum + x, 0) / layerXCoords.length;
        layerCenters.push(center);
        
        console.log(`📊 [验证] 第${layerIndex}层中心: ${center.toFixed(3)}`);
      }
    });
    
    // 计算中心对齐度
    const centerVariance = this.calculateCenterVariance(layerCenters.map((center, index) => ({ 
      layerIndex: index, 
      center, 
      nodeCount: 1 
    })));
    
    const alignmentQuality = centerVariance < 5 ? '优秀' : centerVariance < 15 ? '良好' : '需要改进';
    
    console.log(`📈 [对齐质量] ${alignmentQuality} (方差: ${centerVariance.toFixed(2)}px)`);
    console.log(`📊 [计算统计] 总计算次数: ${this.calculationStats.totalCalculations}, 虚拟节点: ${this.calculationStats.virtualNodesCreated}, 调整次数: ${this.calculationStats.alignmentAdjustments}`);
    
    return {
      quality: alignmentQuality,
      variance: centerVariance,
      layerCenters,
      stats: this.calculationStats
    };
  }

  /**
   * 获取计算统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return { ...this.calculationStats };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.calculationStats = {
      totalCalculations: 0,
      virtualNodesCreated: 0,
      alignmentAdjustments: 0,
      mixedDepthCases: 0
    };
  }
}

export default GeometricCenterAlignment;