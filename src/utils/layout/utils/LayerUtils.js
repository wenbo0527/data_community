/**
 * 层级工具类
 * 提供层级计算相关的工具函数
 */

/**
 * 层级工具类
 */
class LayerUtils {
  /**
   * 计算节点的层级
   */
  static calculateNodeLayer(nodeId, graph, options = {}) {
    const {
      startNodeLayer = 0,
      defaultLayer = 2,
      maxDepth = 50
    } = options;
    
    try {
      // 检查是否为开始节点
      if (this.isStartNode(nodeId)) {
        return startNodeLayer;
      }
      
      // 使用BFS计算层级
      const layer = this.calculateLayerBFS(nodeId, graph, maxDepth);
      return layer !== -1 ? layer : defaultLayer;
    } catch (error) {
      console.warn(`LayerUtils.calculateNodeLayer error for node ${nodeId}:`, error);
      return defaultLayer;
    }
  }
  
  /**
   * 使用BFS算法计算节点层级
   */
  static calculateLayerBFS(targetNodeId, graph, maxDepth = 50) {
    if (!graph || typeof graph.getNodes !== 'function') {
      return -1;
    }
    
    const nodes = graph.getNodes();
    const startNodes = nodes.filter(node => this.isStartNode(this.getNodeId(node)));
    
    if (startNodes.length === 0) {
      return -1;
    }
    
    // BFS队列：[nodeId, layer]
    const queue = startNodes.map(node => [this.getNodeId(node), 0]);
    const visited = new Set();
    
    while (queue.length > 0) {
      const [currentNodeId, currentLayer] = queue.shift();
      
      if (visited.has(currentNodeId) || currentLayer > maxDepth) {
        continue;
      }
      
      visited.add(currentNodeId);
      
      if (currentNodeId === targetNodeId) {
        return currentLayer;
      }
      
      // 获取子节点
      const childNodes = this.getChildNodes(currentNodeId, graph);
      for (const childId of childNodes) {
        if (!visited.has(childId)) {
          queue.push([childId, currentLayer + 1]);
        }
      }
    }
    
    return -1;
  }
  
  /**
   * 计算所有节点的层级
   */
  static calculateAllNodeLayers(graph, options = {}) {
    const {
      startNodeLayer = 0,
      defaultLayer = 2
    } = options;
    
    if (!graph || typeof graph.getNodes !== 'function') {
      return new Map();
    }
    
    const nodes = graph.getNodes();
    const layerMap = new Map();
    
    // 首先标记所有开始节点
    const startNodes = nodes.filter(node => this.isStartNode(this.getNodeId(node)));
    startNodes.forEach(node => {
      layerMap.set(this.getNodeId(node), startNodeLayer);
    });
    
    // 使用拓扑排序计算其他节点的层级
    const remaining = nodes.filter(node => !this.isStartNode(this.getNodeId(node)));
    let changed = true;
    let iterations = 0;
    const maxIterations = nodes.length * 2;
    
    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      for (const node of remaining) {
        const nodeId = this.getNodeId(node);
        
        if (layerMap.has(nodeId)) {
          continue;
        }
        
        const parentNodes = this.getParentNodes(nodeId, graph);
        
        // 如果所有父节点都已计算层级
        if (parentNodes.length > 0 && parentNodes.every(parentId => layerMap.has(parentId))) {
          const maxParentLayer = Math.max(...parentNodes.map(parentId => layerMap.get(parentId)));
          layerMap.set(nodeId, maxParentLayer + 1);
          changed = true;
        } else if (parentNodes.length === 0) {
          // 没有父节点的孤立节点
          layerMap.set(nodeId, defaultLayer);
          changed = true;
        }
      }
    }
    
    // 为未计算的节点设置默认层级
    nodes.forEach(node => {
      const nodeId = this.getNodeId(node);
      if (!layerMap.has(nodeId)) {
        layerMap.set(nodeId, defaultLayer);
      }
    });
    
    return layerMap;
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
   * 获取层级统计信息
   */
  static getLayerStatistics(layerMap) {
    const layers = Array.from(layerMap.values());
    
    if (layers.length === 0) {
      return {
        totalNodes: 0,
        totalLayers: 0,
        minLayer: 0,
        maxLayer: 0,
        averageLayer: 0,
        layerDistribution: new Map()
      };
    }
    
    const minLayer = Math.min(...layers);
    const maxLayer = Math.max(...layers);
    const averageLayer = layers.reduce((sum, layer) => sum + layer, 0) / layers.length;
    
    // 计算层级分布
    const layerDistribution = new Map();
    layers.forEach(layer => {
      layerDistribution.set(layer, (layerDistribution.get(layer) || 0) + 1);
    });
    
    return {
      totalNodes: layers.length,
      totalLayers: maxLayer - minLayer + 1,
      minLayer,
      maxLayer,
      averageLayer,
      layerDistribution
    };
  }
  
  /**
   * 优化层级分布
   */
  static optimizeLayerDistribution(layerMap, options = {}) {
    const {
      maxNodesPerLayer = 10,
      minLayerSpacing = 1
    } = options;
    
    const optimizedMap = new Map(layerMap);
    const layerGroups = this.groupNodesByLayer(Array.from(layerMap.keys()).map(id => ({ id })), layerMap);
    
    // 检查每层节点数量
    for (const [layer, nodes] of layerGroups) {
      if (nodes.length > maxNodesPerLayer) {
        // 将过多的节点分散到相邻层级
        const excessNodes = nodes.slice(maxNodesPerLayer);
        let targetLayer = layer + minLayerSpacing;
        
        excessNodes.forEach((node, index) => {
          const newLayer = targetLayer + Math.floor(index / maxNodesPerLayer) * minLayerSpacing;
          optimizedMap.set(node.id, newLayer);
        });
      }
    }
    
    return optimizedMap;
  }
  
  /**
   * 验证层级的合理性
   */
  static validateLayers(layerMap, graph) {
    const errors = [];
    const warnings = [];
    
    if (!graph || typeof graph.getEdges !== 'function') {
      errors.push('Invalid graph object');
      return { valid: false, errors, warnings };
    }
    
    const edges = graph.getEdges();
    
    // 检查边的层级关系
    edges.forEach(edge => {
      const sourceId = this.getSourceId(edge);
      const targetId = this.getTargetId(edge);
      
      if (!sourceId || !targetId) {
        warnings.push(`Edge ${this.getEdgeId(edge)} has invalid source or target`);
        return;
      }
      
      const sourceLayer = layerMap.get(sourceId);
      const targetLayer = layerMap.get(targetId);
      
      if (sourceLayer === undefined || targetLayer === undefined) {
        warnings.push(`Missing layer information for edge ${this.getEdgeId(edge)}`);
        return;
      }
      
      // 检查层级顺序
      if (sourceLayer >= targetLayer) {
        errors.push(`Invalid layer order: ${sourceId}(${sourceLayer}) -> ${targetId}(${targetLayer})`);
      }
    });
    
    // 检查孤立节点
    const connectedNodes = new Set();
    edges.forEach(edge => {
      const sourceId = this.getSourceId(edge);
      const targetId = this.getTargetId(edge);
      if (sourceId) connectedNodes.add(sourceId);
      if (targetId) connectedNodes.add(targetId);
    });
    
    layerMap.forEach((layer, nodeId) => {
      if (!connectedNodes.has(nodeId) && !this.isStartNode(nodeId)) {
        warnings.push(`Isolated node: ${nodeId}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 计算层级之间的Y坐标
   */
  static calculateLayerY(layer, options = {}) {
    const {
      baseHeight = 120,
      layerSpacing = 150,
      startY = 0
    } = options;
    
    return startY + layer * (baseHeight + layerSpacing);
  }
  
  /**
   * 计算层级内节点的X坐标分布
   */
  static calculateLayerNodePositions(nodes, options = {}) {
    const {
      baseWidth = 200,
      nodeSpacing = 100,
      centerAlign = true,
      containerWidth = 1200
    } = options;
    
    if (nodes.length === 0) {
      return [];
    }
    
    if (nodes.length === 1) {
      return [{ node: nodes[0], x: centerAlign ? containerWidth / 2 : baseWidth / 2 }];
    }
    
    const totalWidth = nodes.length * baseWidth + (nodes.length - 1) * nodeSpacing;
    const startX = centerAlign ? (containerWidth - totalWidth) / 2 : 0;
    
    return nodes.map((node, index) => ({
      node,
      x: startX + index * (baseWidth + nodeSpacing) + baseWidth / 2
    }));
  }
  
  /**
   * 检查是否为开始节点
   */
  static isStartNode(nodeId) {
    if (!nodeId) return false;
    return nodeId.includes('start_node') || nodeId.startsWith('start');
  }
  
  /**
   * 检查是否为结束节点
   */
  static isEndNode(nodeId) {
    if (!nodeId) return false;
    return nodeId.includes('end_node') || nodeId.startsWith('end');
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
   * 获取边ID
   */
  static getEdgeId(edge) {
    if (typeof edge.id === 'string') return edge.id;
    if (typeof edge.getId === 'function') return edge.getId();
    if (edge.data && edge.data.id) return edge.data.id;
    return null;
  }
  
  /**
   * 获取边的源节点ID
   */
  static getSourceId(edge) {
    if (typeof edge.getSourceCellId === 'function') {
      return edge.getSourceCellId();
    }
    if (typeof edge.getSource === 'function') {
      const source = edge.getSource();
      return typeof source === 'string' ? source : source?.cell;
    }
    if (edge.source) {
      return typeof edge.source === 'string' ? edge.source : edge.source.cell || edge.source.id;
    }
    return null;
  }
  
  /**
   * 获取边的目标节点ID
   */
  static getTargetId(edge) {
    if (typeof edge.getTargetCellId === 'function') {
      return edge.getTargetCellId();
    }
    if (typeof edge.getTarget === 'function') {
      const target = edge.getTarget();
      return typeof target === 'string' ? target : target?.cell;
    }
    if (edge.target) {
      return typeof edge.target === 'string' ? edge.target : edge.target.cell || edge.target.id;
    }
    return null;
  }
  
  /**
   * 获取节点的父节点ID列表
   */
  static getParentNodes(nodeId, graph) {
    if (!graph || typeof graph.getIncomingEdges !== 'function') {
      return [];
    }
    
    try {
      const incomingEdges = graph.getIncomingEdges(nodeId);
      return incomingEdges.map(edge => this.getSourceId(edge)).filter(id => id);
    } catch (error) {
      console.warn(`LayerUtils.getParentNodes error for node ${nodeId}:`, error);
      return [];
    }
  }
  
  /**
   * 获取节点的子节点ID列表
   */
  static getChildNodes(nodeId, graph) {
    if (!graph || typeof graph.getOutgoingEdges !== 'function') {
      return [];
    }
    
    try {
      const outgoingEdges = graph.getOutgoingEdges(nodeId);
      return outgoingEdges.map(edge => this.getTargetId(edge)).filter(id => id);
    } catch (error) {
      console.warn(`LayerUtils.getChildNodes error for node ${nodeId}:`, error);
      return [];
    }
  }
  
  /**
   * 查找图中的所有路径
   */
  static findAllPaths(graph, startNodeId = null, endNodeId = null) {
    if (!graph || typeof graph.getNodes !== 'function') {
      return [];
    }
    
    const nodes = graph.getNodes();
    const startNodes = startNodeId ? 
      [nodes.find(node => this.getNodeId(node) === startNodeId)] :
      nodes.filter(node => this.isStartNode(this.getNodeId(node)));
    
    const paths = [];
    
    for (const startNode of startNodes) {
      if (!startNode) continue;
      
      const startId = this.getNodeId(startNode);
      this.dfsPath(startId, graph, [startId], new Set([startId]), paths, endNodeId);
    }
    
    return paths;
  }
  
  /**
   * DFS路径查找
   */
  static dfsPath(currentNodeId, graph, currentPath, visited, allPaths, endNodeId = null) {
    const childNodes = this.getChildNodes(currentNodeId, graph);
    
    if (childNodes.length === 0 || (endNodeId && currentNodeId === endNodeId)) {
      // 到达叶子节点或目标节点
      allPaths.push([...currentPath]);
      return;
    }
    
    for (const childId of childNodes) {
      if (!visited.has(childId)) {
        visited.add(childId);
        currentPath.push(childId);
        
        this.dfsPath(childId, graph, currentPath, visited, allPaths, endNodeId);
        
        currentPath.pop();
        visited.delete(childId);
      }
    }
  }
  
  /**
   * 计算关键路径（最长路径）
   */
  static findCriticalPath(graph) {
    const allPaths = this.findAllPaths(graph);
    
    if (allPaths.length === 0) {
      return [];
    }
    
    // 找到最长的路径
    let criticalPath = allPaths[0];
    let maxLength = criticalPath.length;
    
    for (const path of allPaths) {
      if (path.length > maxLength) {
        criticalPath = path;
        maxLength = path.length;
      }
    }
    
    return criticalPath;
  }
}

export { LayerUtils };
export default LayerUtils;