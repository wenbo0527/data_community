/**
 * 层级计算器 - 负责节点层级的计算和分配
 * 从UnifiedStructuredLayoutEngine中提取的层级计算功能
 */

class LayerCalculator {
  constructor(options = {}) {
    this.options = {
      layer: {
        baseHeight: 120,
        spacing: 80,
        ...options.layer
      },
      node: {
        preferredSpacing: 150,
        ...options.node
      },
      ...options
    };
    
    // 层级缓存避免重复计算
    this.layerCache = new Map();
  }

  /**
   * 全局简单层级计算：获取节点的层级Y坐标
   * 使用统一的简单层级方式，不再依赖复杂的自动计算
   * @param {string} nodeId - 节点ID
   * @param {Object} graph - 图形对象
   * @returns {number} 层级Y坐标
   */
  getNodeLayerY(nodeId, graph) {
    // 简化方案：直接使用预定义的层级索引
    const layerIndex = this.getSimpleLayerIndex(nodeId, graph);
    const layerY = layerIndex * this.options.layer.baseHeight;
    
    console.log(
      `[全局简单层级] 节点 ${nodeId} 层级Y坐标: 第${layerIndex}层 -> Y=${layerY}`,
    );
    return layerY;
  }

  /**
   * 基于连接关系的简化层级计算（按照技术方案文档实现）
   * 规则：
   * 1. 开始节点：固定为第1层
   * 2. 普通节点：上一层连接节点的层级 + 1  
   * @param {string} nodeId - 节点ID
   * @param {Object} graph - 图形对象
   * @returns {number} 层级索引（从1开始）
   */
  getSimpleLayerIndex(nodeId, graph) {
    // 层级缓存避免重复计算
    if (this.layerCache.has(nodeId)) {
      return this.layerCache.get(nodeId);
    }

    let layerIndex = 1;

    try {
      // 规则1：开始节点固定为第1层
      if (nodeId.includes('start') || nodeId.includes('Start') || nodeId.includes('begin')) {
        layerIndex = 1;
        console.log(`[连接层级] 开始节点 ${nodeId} -> 第1层`);
      }
      // 规则2：普通节点 = 父节点最大层级 + 1
      else {
        const parentNodes = this.getParentNodes(nodeId, graph);
        if (parentNodes.length > 0) {
          const parentLayers = parentNodes.map(parentId => 
            this.getSimpleLayerIndex(parentId, graph)
          );
          layerIndex = Math.max(...parentLayers) + 1;
          console.log(`[连接层级] 普通节点 ${nodeId} 父节点层级 [${parentLayers.join(',')}] -> 第${layerIndex}层`);
        } else {
          layerIndex = 2; // 无父节点时的默认层级
          console.log(`[连接层级] 普通节点 ${nodeId} 无父节点，使用默认第2层`);
        }
      }

    } catch (error) {
      console.warn(`[连接层级] 节点 ${nodeId} 层级计算失败:`, error.message);
      layerIndex = 2; // 出错时默认第2层
    }

    // 缓存结果
    this.layerCache.set(nodeId, layerIndex);
    return layerIndex;
  }

  /**
   * 根据节点类型获取固定层级
   * @param {string} nodeType - 节点类型
   * @param {string} nodeId - 节点ID
   * @returns {number} 层级索引
   */
  getLayerByNodeType(nodeType, nodeId) {
    // 固定层级分配表
    const layerMapping = {
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
      'finish': 4,
      'terminal': 4
    };

    // 特殊处理：根据节点ID模式判断
    if (nodeId.includes('preview') || nodeId.includes('virtual')) {
      return 4;
    }
    
    if (nodeId.includes('start') || nodeId.includes('begin')) {
      return 1;
    }

    // 关键修正：ai-call, manual-call, audience-split 统一第2层
    if (nodeId.includes('ai-call') || nodeId.includes('manual-call') || nodeId.includes('audience-split')) {
      return 2;
    }

    // 使用映射表或默认第2层
    return layerMapping[nodeType] || 2;
  }

  /**
   * 兼容性方法：保持原有接口
   * @param {string} nodeId - 节点ID
   * @param {Object} graph - 图形对象
   * @returns {number} 层级索引
   */
  calculateNodeLayerByConnection(nodeId, graph) {
    // 直接调用简单层级计算
    return this.getSimpleLayerIndex(nodeId, graph);
  }

  /**
   * 获取节点的父节点列表
   * @param {string} nodeId - 节点ID
   * @param {Object} graph - 图形对象
   * @returns {Array} 父节点ID列表
   */
  getParentNodes(nodeId, graph) {
    const parentNodes = [];
    
    try {
      // 从图形结构中获取入边
      const node = graph.getCellById(nodeId);
      if (node) {
        const incomingEdges = graph.getIncomingEdges(node);
        if (incomingEdges && incomingEdges.length > 0) {
          incomingEdges.forEach(edge => {
            const sourceId = edge.getSourceCellId();
            if (sourceId && sourceId !== nodeId) {
              parentNodes.push(sourceId);
            }
          });
        }
      }
      
    } catch (error) {
      console.warn(`[简化层级] 获取节点 ${nodeId} 父节点失败:`, error.message);
    }
    
    return parentNodes;
  }

  /**
   * 智能推断节点层级Y坐标
   * @param {string} nodeId - 节点ID
   * @param {Object} graph - 图形对象
   * @param {Object} layoutModel - 布局模型
   * @returns {number} 推断的Y坐标
   */
  inferNodeLayerY(nodeId, graph, layoutModel) {
    try {
      // 策略1：通过图形节点位置推断
      const node = graph.getCellById(nodeId);
      if (node) {
        const position = node.getPosition();
        const estimatedLayer = Math.floor(
          position.y / this.options.layer.baseHeight,
        );
        const estimatedY = estimatedLayer * this.options.layer.baseHeight;
        console.log(
          `[智能推断] 节点 ${nodeId} 基于位置推断层级Y坐标: ${estimatedY} (第${estimatedLayer}层)`,
        );

        // 临时添加到层级映射中，避免重复推断
        if (layoutModel && layoutModel.nodeToLayer) {
          layoutModel.nodeToLayer.set(nodeId, estimatedLayer);
        }

        return estimatedY;
      }

      // 策略2：通过父子关系推断
      if (layoutModel && layoutModel.childParentMap) {
        const parents = layoutModel.childParentMap.get(nodeId) || [];
        if (parents.length > 0) {
          const parentId = parents[0];
          const parentLayer = layoutModel.nodeToLayer.get(parentId);
          if (parentLayer !== undefined) {
            const childLayer = parentLayer + 1;
            const childY = childLayer * this.options.layer.baseHeight;
            console.log(
              `[智能推断] 节点 ${nodeId} 基于父节点 ${parentId} 推断层级Y坐标: ${childY} (第${childLayer}层)`,
            );

            // 临时添加到层级映射中
            layoutModel.nodeToLayer.set(nodeId, childLayer);
            return childY;
          }
        }
      }

      // 策略3：使用默认Y坐标
      return this.getDefaultLayerY(nodeId);
    } catch (error) {
      console.warn(`[智能推断] 节点 ${nodeId} 推断失败:`, error.message);
      return this.getDefaultLayerY(nodeId);
    }
  }

  /**
   * 获取默认层级Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 默认Y坐标
   */
  getDefaultLayerY(nodeId) {
    // 根据节点类型返回不同的默认Y坐标
    if (nodeId.includes("start")) {
      return 0; // 起始节点在第0层
    } else {
      return this.options.layer.baseHeight; // 普通节点默认在第1层
    }
  }

  /**
   * 获取下一层的Y坐标
   * @param {string} nodeId - 节点ID
   * @param {Object} graph - 图形对象
   * @returns {number} 下一层的Y坐标
   */
  getNextLayerY(nodeId, graph) {
    try {
      const currentLayerY = this.getNodeLayerY(nodeId, graph);
      const nextLayerY = currentLayerY + this.options.layer.baseHeight;
      console.log(
        `[布局引擎] 节点 ${nodeId} 下一层Y坐标: ${currentLayerY} + ${this.options.layer.baseHeight} = ${nextLayerY}`,
      );
      return nextLayerY;
    } catch (error) {
      console.warn(
        `[布局引擎] 获取节点 ${nodeId} 下一层Y坐标失败:`,
        error.message,
      );
      // 使用默认的下一层Y坐标
      return this.options.layer.baseHeight * 2;
    }
  }

  /**
   * 计算层级Y坐标
   * @param {number} layerIndex - 层级索引（0为最底层）
   * @returns {number} Y坐标
   */
  calculateLayerY(layerIndex) {
    const baseY = 300; // 基础Y坐标（画布中心）
    const layerSpacing = this.options.layer.spacing;
    
    // 从底部向上计算，层级索引越大Y坐标越小
    return baseY - (layerIndex * layerSpacing);
  }

  /**
   * 基于节点类型的垂直分层（无边连接模式）
   * @param {Array} normalNodes - 普通节点列表
   * @returns {Array} 分层结果
   */
  buildTypeBasedLayers(normalNodes) {
    const layers = [];
    const startNodes = [];
    const endNodes = [];
    const otherNodes = [];

    // 按节点类型分类
    normalNodes.forEach(node => {
      const nodeId = node.id || node.getId();
      const nodeType = this.getNodeTypeFromId(nodeId);
      
      if (nodeType === 'start' || nodeType === 'begin') {
        startNodes.push(node);
      } else if (nodeType === 'end' || nodeType === 'finish' || nodeType === 'terminal') {
        endNodes.push(node);
      } else {
        otherNodes.push(node);
      }
    });

    // 构建分层结构
    if (startNodes.length > 0) {
      layers.push(startNodes);
      console.log('[类型分层] 开始节点层:', startNodes.map(n => n.id || n.getId()));
    }
    
    if (otherNodes.length > 0) {
      layers.push(otherNodes);
      console.log('[类型分层] 处理节点层:', otherNodes.map(n => n.id || n.getId()));
    }
    
    if (endNodes.length > 0) {
      layers.push(endNodes);
      console.log('[类型分层] 结束节点层:', endNodes.map(n => n.id || n.getId()));
    }

    // 如果没有分层但有节点，创建单一层级
    if (layers.length === 0 && normalNodes.length > 0) {
      layers.push(normalNodes);
      console.log('[类型分层] 单一类型层级:', normalNodes.map(n => n.id || n.getId()));
    }

    return layers;
  }

  /**
   * 自底向上计算层级（增强版本）
   * @param {Array} leafNodes - 叶子节点
   * @param {Array} allNodes - 所有节点
   * @param {Object} graph - 图形对象
   * @returns {Array} 分层结果
   */
  calculateLayersBottomUp(leafNodes, allNodes, graph) {
    const layers = [];
    const processedNodes = new Set();
    const nodeToLayer = new Map();
    let currentLayer = [...leafNodes]; // 复制数组避免修改原数组
    let layerIndex = 0;

    console.log(
      `[层级构建] 开始自底向上构建，叶子节点: ${leafNodes.length}个`,
    );
    console.log('[层级构建] 叶子节点列表:', leafNodes.map(n => n.id || n.getId()));
    console.log(`[层级构建] 总节点数: ${allNodes.length}个`);

    // 检测无边连接模式
    const hasConnections = this.hasNodeConnections(allNodes, graph);
    if (!hasConnections) {
      console.log('[类型分层] 检测到无边连接模式，启用节点类型垂直分层');
      return this.buildTypeBasedLayers(allNodes);
    }

    // 从叶子节点开始，逐层向上构建
    while (currentLayer.length > 0) {
      console.log(`[层级构建] 处理第${layerIndex}层，节点数: ${currentLayer.length}`);
      console.log(`[层级构建] 第${layerIndex}层节点:`, currentLayer.map(n => n.id || n.getId()));
      
      layers.push([...currentLayer]);
      
      // 标记当前层节点为已处理
      currentLayer.forEach(node => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
        nodeToLayer.set(nodeId, layerIndex);
      });
      
      // 查找下一层的父节点
      const nextLayer = this.findParentLayer(currentLayer, allNodes, processedNodes, graph);
      currentLayer = nextLayer;
      layerIndex++;
      
      // 防止无限循环
      if (layerIndex > allNodes.length) {
        console.warn('[层级构建] 检测到可能的无限循环，强制退出');
        break;
      }
    }

    // 处理未处理的节点
    const unprocessedNodes = allNodes.filter(node => 
      !processedNodes.has(node.id || node.getId())
    );
    
    if (unprocessedNodes.length > 0) {
      const unprocessedNodeIds = unprocessedNodes.map(n => n.id || n.getId());
      console.log(
        `[层级构建] 发现 ${unprocessedNodeIds.length} 个未处理的节点:`,
        unprocessedNodeIds,
      );

      // 将未处理的节点添加到最后一层
      layers.push(unprocessedNodes);
      unprocessedNodes.forEach(node => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
        nodeToLayer.set(nodeId, layerIndex);
      });
    }

    console.log(`[层级构建] 完成分层，共${layers.length}层`);
    return layers;
  }

  /**
   * 检查节点是否有连接关系
   * @param {Array} nodes - 节点数组
   * @param {Object} graph - 图形对象
   * @returns {boolean} 是否有连接关系
   */
  hasNodeConnections(nodes, graph) {
    try {
      const edges = graph.getEdges();
      return edges && edges.length > 0;
    } catch (error) {
      console.warn('[层级构建] 检查连接关系失败:', error.message);
      return false;
    }
  }

  /**
   * 查找父节点层
   * @param {Array} currentLayer - 当前层节点
   * @param {Array} allNodes - 所有节点
   * @param {Set} processedNodes - 已处理节点集合
   * @param {Object} graph - 图形对象
   * @returns {Array} 父节点层
   */
  findParentLayer(currentLayer, allNodes, processedNodes, graph) {
    const parentNodes = new Set();
    
    currentLayer.forEach(node => {
      const nodeId = node.id || node.getId();
      const parents = this.getParentNodes(nodeId, graph);
      
      parents.forEach(parentId => {
        if (!processedNodes.has(parentId)) {
          const parentNode = allNodes.find(n => (n.id || n.getId()) === parentId);
          if (parentNode) {
            parentNodes.add(parentNode);
          }
        }
      });
    });
    
    return Array.from(parentNodes);
  }

  /**
   * 从节点ID推断节点类型
   * @param {string} nodeId - 节点ID
   * @returns {string} 推断的节点类型
   */
  getNodeTypeFromId(nodeId) {
    if (nodeId.includes('ai-call')) return 'ai-call';
    if (nodeId.includes('manual-call')) return 'manual-call';
    if (nodeId.includes('audience-split')) return 'audience-split';
    if (nodeId.includes('start')) return 'start';
    if (nodeId.includes('end')) return 'end';
    if (nodeId.includes('condition')) return 'condition';
    if (nodeId.includes('decision')) return 'decision';
    if (nodeId.includes('process')) return 'process';
    if (nodeId.includes('action')) return 'action';
    if (nodeId.includes('task')) return 'task';
    if (nodeId.includes('operation')) return 'operation';
    if (nodeId.includes('transform')) return 'transform';
    if (nodeId.includes('filter')) return 'filter';
    
    return 'process'; // 默认类型
  }

  /**
   * 清除层级缓存
   */
  clearCache() {
    this.layerCache.clear();
    console.log('[层级计算] 缓存已清除');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      size: this.layerCache.size,
      keys: Array.from(this.layerCache.keys())
    };
  }

  /**
   * 计算层级（主要接口方法）
   * @param {Object} context - 上下文对象，包含nodes、edges等
   * @returns {Object} 层级计算结果
   */
  async calculateLayers(context = {}) {
    try {
      const { nodes = [], edges = [], graph } = context;
      
      // 如果没有节点，返回空结果
      if (nodes.length === 0) {
        return {
          success: true,
          layers: [],
          nodeToLayer: new Map(),
          totalLayers: 0
        };
      }

      // 找到叶子节点（没有出边的节点）
      const leafNodes = nodes.filter(node => {
        const nodeId = node.id || node.getId();
        const outgoingEdges = edges.filter(edge => 
          edge.source === nodeId || edge.getSourceCellId?.() === nodeId
        );
        return outgoingEdges.length === 0;
      });

      // 如果没有叶子节点，使用所有节点
      const startNodes = leafNodes.length > 0 ? leafNodes : nodes;
      
      // 执行自底向上层级计算
      const layers = this.calculateLayersBottomUp(startNodes, nodes, graph);
      
      // 构建节点到层级的映射
      const nodeToLayer = new Map();
      layers.forEach((layer, index) => {
        layer.forEach(node => {
          const nodeId = node.id || node.getId();
          nodeToLayer.set(nodeId, index);
        });
      });

      console.log(`[层级计算] 完成计算，共${layers.length}层，${nodes.length}个节点`);
      
      return {
        success: true,
        layers,
        nodeToLayer,
        totalLayers: layers.length
      };
      
    } catch (error) {
      console.error('[层级计算] 计算失败:', error);
      return {
        success: false,
        error: error.message,
        layers: [],
        nodeToLayer: new Map(),
        totalLayers: 0
      };
    }
  }
}

export default LayerCalculator;