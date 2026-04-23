/**
 * 层次结构构建器
 * 负责构建节点的层次结构和依赖关系
 */
export class HierarchicalBuilder {
  constructor(config = {}) {
    this.config = {
      direction: config.direction || 'TB', // TB, BT, LR, RL
      rankSeparation: config.rankSeparation || 100,
      nodeSeparation: config.nodeSeparation || 80,
      edgeSeparation: config.edgeSeparation || 10,
      ...config
    };
  }

  /**
   * 构建层次结构
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Object} 层次结构信息
   */
  buildHierarchy(nodes, edges) {
    console.log(`🏗️ [层次构建器] 开始构建层次结构 - 节点数: ${nodes.length}, 边数: ${edges.length}`);
    
    const startTime = Date.now();
    
    // 构建图结构
    const graph = this.buildGraph(nodes, edges);
    
    // 检测并处理环
    const acyclicGraph = this.removeCircles(graph);
    
    // 分配层级
    const rankedGraph = this.assignRanks(acyclicGraph);
    
    // 添加虚拟节点处理长边
    const expandedGraph = this.addVirtualNodes(rankedGraph);
    
    // 构建层次结构
    const hierarchy = this.buildLayers(expandedGraph);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ [层次构建器] 层次结构构建完成 - 层数: ${hierarchy.layers.length}, 耗时: ${executionTime}ms`);
    
    return hierarchy;
  }

  /**
   * 构建图结构
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Object} 图结构
   */
  buildGraph(nodes, edges) {
    // 验证输入参数
    if (!Array.isArray(nodes)) {
      console.warn('⚠️ [层次构建器] 节点数据不是数组，使用空数组');
      nodes = [];
    }
    
    if (!Array.isArray(edges)) {
      console.warn('⚠️ [层次构建器] 边数据不是数组，使用空数组');
      edges = [];
    }
    
    const graph = {
      nodes: new Map(),
      edges: [],
      inEdges: new Map(),
      outEdges: new Map()
    };
    
    // 添加节点
    nodes.forEach(node => {
      if (node && node.id) {
        graph.nodes.set(node.id, {
          ...node,
          rank: -1,
          layer: -1,
          position: { x: 0, y: 0 }
        });
        graph.inEdges.set(node.id, []);
        graph.outEdges.set(node.id, []);
      }
    });
    
    // 添加边
    edges.forEach(edge => {
      if (!edge) {return;}
      
      const sourceId = edge.source || edge.sourceNodeId;
      const targetId = edge.target || edge.targetNodeId;
      
      if (sourceId && targetId && graph.nodes.has(sourceId) && graph.nodes.has(targetId)) {
        const edgeObj = {
          id: edge.id || `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          weight: edge.weight || 1,
          virtual: false
        };
        
        graph.edges.push(edgeObj);
        graph.outEdges.get(sourceId).push(edgeObj);
        graph.inEdges.get(targetId).push(edgeObj);
      }
    });
    
    return graph;
  }

  /**
   * 移除环路
   * @param {Object} graph - 图结构
   * @returns {Object} 无环图结构
   */
  removeCircles(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    const reversedEdges = new Set();
    
    // DFS检测环
    const dfs = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const outEdges = graph.outEdges.get(nodeId) || [];
      for (const edge of outEdges) {
        if (reversedEdges.has(edge.id)) {continue;}
        
        if (!visited.has(edge.target)) {
          if (dfs(edge.target)) {
            return true;
          }
        } else if (recursionStack.has(edge.target)) {
          // 发现环，反转这条边
          reversedEdges.add(edge.id);
          console.log(`🔄 [层次构建器] 检测到环，反转边: ${edge.source} -> ${edge.target}`);
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    // 对所有未访问的节点执行DFS
    graph.nodes.forEach((node, nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    });
    
    // 创建新的无环图 - 正确地复制Map结构
    const acyclicGraph = {
      nodes: new Map(graph.nodes),
      edges: [...graph.edges],
      inEdges: new Map(),
      outEdges: new Map(),
      reversedEdges: reversedEdges
    };
    
    // 重新构建边映射
    graph.nodes.forEach((node, nodeId) => {
      acyclicGraph.inEdges.set(nodeId, [...(graph.inEdges.get(nodeId) || [])]);
      acyclicGraph.outEdges.set(nodeId, [...(graph.outEdges.get(nodeId) || [])]);
    });
    
    return acyclicGraph;
  }

  /**
   * 分配层级
   * @param {Object} graph - 无环图结构
   * @returns {Object} 带层级的图结构
   */
  assignRanks(graph) {
    const inDegree = new Map();
    const queue = [];
    
    // 验证图结构
    if (!graph || !graph.nodes || !(graph.nodes instanceof Map)) {
      console.error('❌ [层次构建器] 无效的图结构:', graph);
      return graph;
    }
    
    // 计算入度
    graph.nodes.forEach((node, nodeId) => {
      const inEdges = graph.inEdges.get(nodeId) || [];
      const validInEdges = inEdges.filter(edge => !graph.reversedEdges.has(edge.id));
      inDegree.set(nodeId, validInEdges.length);
      
      if (validInEdges.length === 0) {
        queue.push(nodeId);
        graph.nodes.get(nodeId).rank = 0;
      }
    });
    
    // 拓扑排序分配层级
    while (queue.length > 0) {
      const nodeId = queue.shift();
      const currentRank = graph.nodes.get(nodeId).rank;
      
      const outEdges = graph.outEdges.get(nodeId) || [];
      outEdges.forEach(edge => {
        if (graph.reversedEdges.has(edge.id)) {return;}
        
        const targetNode = graph.nodes.get(edge.target);
        const newRank = currentRank + 1;
        
        if (targetNode.rank < newRank) {
          targetNode.rank = newRank;
        }
        
        inDegree.set(edge.target, inDegree.get(edge.target) - 1);
        if (inDegree.get(edge.target) === 0) {
          queue.push(edge.target);
        }
      });
    }
    
    return graph;
  }

  /**
   * 添加虚拟节点处理长边
   * @param {Object} graph - 带层级的图结构
   * @returns {Object} 扩展后的图结构
   */
  addVirtualNodes(graph) {
    const virtualNodeCounter = { count: 0 };
    const newEdges = [];
    const edgesToRemove = [];
    
    graph.edges.forEach(edge => {
      const sourceRank = graph.nodes.get(edge.source).rank;
      const targetRank = graph.nodes.get(edge.target).rank;
      const rankDiff = targetRank - sourceRank;
      
      if (rankDiff > 1) {
        // 需要添加虚拟节点
        edgesToRemove.push(edge);
        
        let prevNodeId = edge.source;
        for (let i = 1; i < rankDiff; i++) {
          const virtualNodeId = `virtual_${virtualNodeCounter.count++}`;
          const virtualNode = {
            id: virtualNodeId,
            virtual: true,
            rank: sourceRank + i,
            layer: -1,
            position: { x: 0, y: 0 },
            width: 0,
            height: 0
          };
          
          graph.nodes.set(virtualNodeId, virtualNode);
          graph.inEdges.set(virtualNodeId, []);
          graph.outEdges.set(virtualNodeId, []);
          
          // 创建虚拟边
          const virtualEdge = {
            id: `virtual_edge_${virtualNodeCounter.count}`,
            source: prevNodeId,
            target: virtualNodeId,
            virtual: true,
            originalEdge: edge.id
          };
          
          newEdges.push(virtualEdge);
          graph.outEdges.get(prevNodeId).push(virtualEdge);
          graph.inEdges.get(virtualNodeId).push(virtualEdge);
          
          prevNodeId = virtualNodeId;
        }
        
        // 最后一段边
        const finalEdge = {
          id: `virtual_edge_final_${virtualNodeCounter.count}`,
          source: prevNodeId,
          target: edge.target,
          virtual: true,
          originalEdge: edge.id
        };
        
        newEdges.push(finalEdge);
        graph.outEdges.get(prevNodeId).push(finalEdge);
        graph.inEdges.get(edge.target).push(finalEdge);
      }
    });
    
    // 移除长边，添加虚拟边
    edgesToRemove.forEach(edge => {
      const index = graph.edges.indexOf(edge);
      if (index > -1) {
        graph.edges.splice(index, 1);
      }
      
      // 从邻接表中移除
      const outEdges = graph.outEdges.get(edge.source);
      const outIndex = outEdges.indexOf(edge);
      if (outIndex > -1) {
        outEdges.splice(outIndex, 1);
      }
      
      const inEdges = graph.inEdges.get(edge.target);
      const inIndex = inEdges.indexOf(edge);
      if (inIndex > -1) {
        inEdges.splice(inIndex, 1);
      }
    });
    
    graph.edges.push(...newEdges);
    
    return graph;
  }

  /**
   * 构建层次结构
   * @param {Object} graph - 扩展后的图结构
   * @returns {Object} 层次结构
   */
  buildLayers(graph) {
    const layers = [];
    const maxRank = Math.max(...Array.from(graph.nodes.values()).map(node => node.rank));
    
    // 初始化层
    for (let i = 0; i <= maxRank; i++) {
      layers[i] = [];
    }
    
    // 将节点分配到对应层
    graph.nodes.forEach((node, nodeId) => {
      node.layer = node.rank;
      layers[node.rank].push(node);
    });
    
    return {
      graph,
      layers: layers.filter(layer => layer.length > 0),
      maxRank,
      stats: this.calculateHierarchyStats(graph, layers)
    };
  }

  /**
   * 计算层次结构统计信息
   * @param {Object} graph - 图结构
   * @param {Array} layers - 层数组
   * @returns {Object} 统计信息
   */
  calculateHierarchyStats(graph, layers) {
    const realNodes = Array.from(graph.nodes.values()).filter(node => !node.virtual);
    const virtualNodes = Array.from(graph.nodes.values()).filter(node => node.virtual);
    const realEdges = graph.edges.filter(edge => !edge.virtual);
    const virtualEdges = graph.edges.filter(edge => edge.virtual);
    
    return {
      totalLayers: layers.filter(layer => layer.length > 0).length,
      totalNodes: graph.nodes.size,
      realNodes: realNodes.length,
      virtualNodes: virtualNodes.length,
      totalEdges: graph.edges.length,
      realEdges: realEdges.length,
      virtualEdges: virtualEdges.length,
      avgNodesPerLayer: realNodes.length / layers.filter(layer => layer.length > 0).length
    };
  }

  /**
   * 获取节点的层级信息
   * @param {string} nodeId - 节点ID
   * @param {Object} hierarchy - 层次结构
   * @returns {Object} 层级信息
   */
  getNodeHierarchyInfo(nodeId, hierarchy) {
    const node = hierarchy.graph.nodes.get(nodeId);
    if (!node) {return null;}
    
    return {
      rank: node.rank,
      layer: node.layer,
      isVirtual: node.virtual || false,
      inDegree: hierarchy.graph.inEdges.get(nodeId).length,
      outDegree: hierarchy.graph.outEdges.get(nodeId).length
    };
  }
}

// 默认导出已通过 export class 实现