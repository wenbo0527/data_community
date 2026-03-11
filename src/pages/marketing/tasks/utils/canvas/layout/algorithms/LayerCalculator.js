/**
 * 层级计算器
 * 负责计算节点的层级分布
 */
export class LayerCalculator {
  constructor(config = {}) {
    this.config = {
      maxNodesPerLayer: config.maxNodesPerLayer || 10,
      layerSpacing: config.layerSpacing || 100,
      nodeSpacing: config.nodeSpacing || 80,
      ...config
    };
  }

  /**
   * 计算节点层级
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Array} 层级数组
   */
  calculateLayers(nodes, edges) {
    console.log(`🔢 [层级计算器] 开始计算层级 - 节点数: ${nodes.length}, 边数: ${edges.length}`);
    
    const startTime = Date.now();
    
    // 构建邻接表
    const adjacencyList = this.buildAdjacencyList(nodes, edges);
    
    // 计算入度
    const inDegree = this.calculateInDegree(nodes, edges);
    
    // 拓扑排序分层
    const layers = this.topologicalSort(nodes, adjacencyList, inDegree);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ [层级计算器] 层级计算完成 - 层数: ${layers.length}, 耗时: ${executionTime}ms`);
    
    return layers;
  }

  /**
   * 构建邻接表
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Map} 邻接表
   */
  buildAdjacencyList(nodes, edges) {
    const adjacencyList = new Map();
    
    // 初始化邻接表
    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
    });
    
    // 构建邻接关系
    edges.forEach(edge => {
      const sourceId = edge.source || edge.sourceNodeId;
      const targetId = edge.target || edge.targetNodeId;
      
      if (adjacencyList.has(sourceId)) {
        adjacencyList.get(sourceId).push(targetId);
      }
    });
    
    return adjacencyList;
  }

  /**
   * 计算入度
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Map} 入度映射
   */
  calculateInDegree(nodes, edges) {
    const inDegree = new Map();
    
    // 初始化入度为0
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
    });
    
    // 计算入度
    edges.forEach(edge => {
      const targetId = edge.target || edge.targetNodeId;
      if (inDegree.has(targetId)) {
        inDegree.set(targetId, inDegree.get(targetId) + 1);
      }
    });
    
    return inDegree;
  }

  /**
   * 拓扑排序分层
   * @param {Array} nodes - 节点数组
   * @param {Map} adjacencyList - 邻接表
   * @param {Map} inDegree - 入度映射
   * @returns {Array} 层级数组
   */
  topologicalSort(nodes, adjacencyList, inDegree) {
    const layers = [];
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const remainingInDegree = new Map(inDegree);
    
    while (remainingInDegree.size > 0) {
      // 找到当前层的节点（入度为0的节点）
      const currentLayer = [];
      const zeroInDegreeNodes = [];
      
      remainingInDegree.forEach((degree, nodeId) => {
        if (degree === 0) {
          zeroInDegreeNodes.push(nodeId);
        }
      });
      
      // 如果没有入度为0的节点，说明有环，随机选择一些节点
      if (zeroInDegreeNodes.length === 0 && remainingInDegree.size > 0) {
        const remainingNodes = Array.from(remainingInDegree.keys());
        zeroInDegreeNodes.push(...remainingNodes.slice(0, Math.min(this.config.maxNodesPerLayer, remainingNodes.length)));
      }
      
      // 构建当前层
      zeroInDegreeNodes.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        if (node) {
          currentLayer.push(node);
        }
        remainingInDegree.delete(nodeId);
      });
      
      // 更新相邻节点的入度
      zeroInDegreeNodes.forEach(nodeId => {
        const neighbors = adjacencyList.get(nodeId) || [];
        neighbors.forEach(neighborId => {
          if (remainingInDegree.has(neighborId)) {
            remainingInDegree.set(neighborId, remainingInDegree.get(neighborId) - 1);
          }
        });
      });
      
      if (currentLayer.length > 0) {
        layers.push(currentLayer);
      }
      
      // 防止无限循环
      if (layers.length > nodes.length) {
        console.warn('⚠️ [层级计算器] 检测到可能的无限循环，强制退出');
        break;
      }
    }
    
    return layers;
  }

  /**
   * 优化层级分布
   * @param {Array} layers - 原始层级
   * @returns {Array} 优化后的层级
   */
  optimizeLayers(layers) {
    const optimizedLayers = [];
    
    layers.forEach(layer => {
      if (layer.length <= this.config.maxNodesPerLayer) {
        optimizedLayers.push(layer);
      } else {
        // 将大层拆分为多个小层
        for (let i = 0; i < layer.length; i += this.config.maxNodesPerLayer) {
          const subLayer = layer.slice(i, i + this.config.maxNodesPerLayer);
          optimizedLayers.push(subLayer);
        }
      }
    });
    
    return optimizedLayers;
  }

  /**
   * 获取层级统计信息
   * @param {Array} layers - 层级数组
   * @returns {Object} 统计信息
   */
  getLayerStats(layers) {
    const totalNodes = layers.reduce((sum, layer) => sum + layer.length, 0);
    const avgNodesPerLayer = totalNodes / layers.length;
    const maxNodesInLayer = Math.max(...layers.map(layer => layer.length));
    const minNodesInLayer = Math.min(...layers.map(layer => layer.length));
    
    return {
      totalLayers: layers.length,
      totalNodes,
      avgNodesPerLayer: Math.round(avgNodesPerLayer * 100) / 100,
      maxNodesInLayer,
      minNodesInLayer
    };
  }
}

// 默认导出已通过 export class 实现