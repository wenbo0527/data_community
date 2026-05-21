/**
 * 数据预处理器
 * 负责处理和验证输入的节点和边数据，为布局算法做准备
 */
export class DataPreprocessor {
  constructor(config = {}) {
    this.config = {
      enableValidation: config.enableValidation !== false,
      enableNormalization: config.enableNormalization !== false,
      enableFiltering: config.enableFiltering !== false,
      minNodeSize: config.minNodeSize || { width: 20, height: 20 },
      maxNodeSize: config.maxNodeSize || { width: 300, height: 200 },
      ...config
    };
  }

  /**
   * 预处理数据
   * @param {Array} nodes - 原始节点数组
   * @param {Array} edges - 原始边数组
   * @param {Object} filters - 过滤器配置
   * @returns {Object} 预处理后的数据
   */
  preprocess(nodes, edges, filters = {}) {
    console.log(`🔄 [数据预处理器] 开始预处理数据 - 节点数: ${nodes.length}, 边数: ${edges.length}`);
    
    const startTime = Date.now();
    
    // 验证输入数据
    const validationResult = this.validateInput(nodes, edges);
    if (!validationResult.isValid) {
      throw new Error(`数据验证失败: ${validationResult.errors.join(', ')}`);
    }
    
    // 标准化数据格式
    let processedNodes = this.normalizeNodes(nodes);
    let processedEdges = this.normalizeEdges(edges);
    
    // 应用过滤器
    if (this.config.enableFiltering) {
      const filterResult = this.applyFilters(processedNodes, processedEdges, filters);
      processedNodes = filterResult.nodes;
      processedEdges = filterResult.edges;
    }
    
    // 构建数据关系
    const dataRelations = this.buildDataRelations(processedNodes, processedEdges);
    
    // 计算数据统计
    const statistics = this.calculateStatistics(processedNodes, processedEdges, dataRelations);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ [数据预处理器] 预处理完成 - 有效节点: ${processedNodes.length}, 有效边: ${processedEdges.length}, 耗时: ${executionTime}ms`);
    
    return {
      nodes: processedNodes,
      edges: processedEdges,
      relations: dataRelations,
      statistics,
      executionTime,
      originalCounts: { nodes: nodes.length, edges: edges.length }
    };
  }

  /**
   * 验证输入数据
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Object} 验证结果
   */
  validateInput(nodes, edges) {
    const errors = [];
    
    if (!Array.isArray(nodes)) {
      errors.push('节点数据必须是数组');
    }
    
    if (!Array.isArray(edges)) {
      errors.push('边数据必须是数组');
    }
    
    if (nodes.length === 0) {
      errors.push('节点数组不能为空');
    }
    
    // 验证节点数据结构
    const nodeIds = new Set();
    const duplicateNodeIds = new Set();
    
    nodes.forEach((node, index) => {
      if (!node || typeof node !== 'object') {
        errors.push(`节点 ${index} 必须是对象`);
        return;
      }
      
      if (!node.id) {
        errors.push(`节点 ${index} 缺少必需的 id 字段`);
        return;
      }
      
      if (nodeIds.has(node.id)) {
        duplicateNodeIds.add(node.id);
      } else {
        nodeIds.add(node.id);
      }
    });
    
    if (duplicateNodeIds.size > 0) {
      errors.push(`发现重复的节点ID: ${Array.from(duplicateNodeIds).join(', ')}`);
    }
    
    // 验证边数据结构
    edges.forEach((edge, index) => {
      if (!edge || typeof edge !== 'object') {
        errors.push(`边 ${index} 必须是对象`);
        return;
      }
      
      const sourceId = edge.source || edge.sourceNodeId;
      const targetId = edge.target || edge.targetNodeId;
      
      if (!sourceId) {
        errors.push(`边 ${index} 缺少源节点ID`);
      }
      
      if (!targetId) {
        errors.push(`边 ${index} 缺少目标节点ID`);
      }
      
      if (sourceId && !nodeIds.has(sourceId)) {
        errors.push(`边 ${index} 的源节点 ${sourceId} 不存在`);
      }
      
      if (targetId && !nodeIds.has(targetId)) {
        errors.push(`边 ${index} 的目标节点 ${targetId} 不存在`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      uniqueNodeCount: nodeIds.size
    };
  }

  /**
   * 标准化节点数据
   * @param {Array} nodes - 原始节点数组
   * @returns {Array} 标准化后的节点数组
   */
  normalizeNodes(nodes) {
    return nodes.map(node => {
      const normalizedNode = {
        id: node.id,
        type: node.type || 'default',
        label: node.label || node.name || node.id,
        x: parseFloat(node.x) || 0,
        y: parseFloat(node.y) || 0,
        width: this.normalizeSize(node.width, this.config.minNodeSize.width, this.config.maxNodeSize.width, 80),
        height: this.normalizeSize(node.height, this.config.minNodeSize.height, this.config.maxNodeSize.height, 40),
        data: node.data || {},
        style: node.style || {},
        ...node
      };
      
      // 确保位置是有效数字
      if (isNaN(normalizedNode.x)) {normalizedNode.x = 0;}
      if (isNaN(normalizedNode.y)) {normalizedNode.y = 0;}
      
      return normalizedNode;
    });
  }

  /**
   * 标准化边数据
   * @param {Array} edges - 原始边数组
   * @returns {Array} 标准化后的边数组
   */
  normalizeEdges(edges) {
    return edges.map((edge, index) => {
      const normalizedEdge = {
        id: edge.id || `edge_${index}`,
        source: edge.source || edge.sourceNodeId,
        target: edge.target || edge.targetNodeId,
        type: edge.type || 'default',
        label: edge.label || '',
        weight: parseFloat(edge.weight) || 1,
        data: edge.data || {},
        style: edge.style || {},
        ...edge
      };
      
      // 确保权重是有效数字
      if (isNaN(normalizedEdge.weight) || normalizedEdge.weight <= 0) {
        normalizedEdge.weight = 1;
      }
      
      return normalizedEdge;
    });
  }

  /**
   * 标准化尺寸值
   * @param {number} value - 原始值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @param {number} defaultValue - 默认值
   * @returns {number} 标准化后的值
   */
  normalizeSize(value, min, max, defaultValue) {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return defaultValue;
    }
    
    return Math.max(min, Math.min(max, numValue));
  }

  /**
   * 应用过滤器
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Object} filters - 过滤器配置
   * @returns {Object} 过滤后的数据
   */
  applyFilters(nodes, edges, filters) {
    let filteredNodes = [...nodes];
    let filteredEdges = [...edges];
    
    // 应用节点过滤器
    if (filters.nodeFilter) {
      filteredNodes = filteredNodes.filter(filters.nodeFilter);
    }
    
    // 应用边过滤器
    if (filters.edgeFilter) {
      filteredEdges = filteredEdges.filter(filters.edgeFilter);
    }
    
    // 移除孤立节点（如果配置了）
    if (filters.removeIsolatedNodes) {
      const connectedNodeIds = new Set();
      filteredEdges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
      
      filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));
    }
    
    // 移除无效边（源或目标节点不存在）
    const validNodeIds = new Set(filteredNodes.map(node => node.id));
    filteredEdges = filteredEdges.filter(edge => 
      validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
    );
    
    return {
      nodes: filteredNodes,
      edges: filteredEdges
    };
  }

  /**
   * 构建数据关系
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Object} 数据关系信息
   */
  buildDataRelations(nodes, edges) {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const adjacencyList = new Map();
    const inDegree = new Map();
    const outDegree = new Map();
    const nodeTypes = new Map();
    const edgeTypes = new Map();
    
    // 初始化
    nodes.forEach(node => {
      adjacencyList.set(node.id, { in: [], out: [] });
      inDegree.set(node.id, 0);
      outDegree.set(node.id, 0);
      
      // 统计节点类型
      const type = node.type || 'default';
      nodeTypes.set(type, (nodeTypes.get(type) || 0) + 1);
    });
    
    // 构建关系
    edges.forEach(edge => {
      const sourceId = edge.source;
      const targetId = edge.target;
      
      if (adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
        adjacencyList.get(sourceId).out.push(edge);
        adjacencyList.get(targetId).in.push(edge);
        
        outDegree.set(sourceId, outDegree.get(sourceId) + 1);
        inDegree.set(targetId, inDegree.get(targetId) + 1);
      }
      
      // 统计边类型
      const type = edge.type || 'default';
      edgeTypes.set(type, (edgeTypes.get(type) || 0) + 1);
    });
    
    // 识别特殊节点
    const rootNodes = nodes.filter(node => inDegree.get(node.id) === 0);
    const leafNodes = nodes.filter(node => outDegree.get(node.id) === 0);
    const isolatedNodes = nodes.filter(node => 
      inDegree.get(node.id) === 0 && outDegree.get(node.id) === 0
    );
    
    return {
      nodeMap,
      adjacencyList,
      inDegree,
      outDegree,
      nodeTypes,
      edgeTypes,
      rootNodes,
      leafNodes,
      isolatedNodes
    };
  }

  /**
   * 计算数据统计
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Object} relations - 数据关系
   * @returns {Object} 统计信息
   */
  calculateStatistics(nodes, edges, relations) {
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    
    // 度数统计
    const degrees = Array.from(relations.inDegree.values()).map((inDeg, index) => {
      const nodeId = nodes[index].id;
      const outDeg = relations.outDegree.get(nodeId) || 0;
      return inDeg + outDeg;
    });
    
    const avgDegree = degrees.length > 0 ? degrees.reduce((sum, deg) => sum + deg, 0) / degrees.length : 0;
    const maxDegree = degrees.length > 0 ? Math.max(...degrees) : 0;
    const minDegree = degrees.length > 0 ? Math.min(...degrees) : 0;
    
    // 连通性统计
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    
    // 节点尺寸统计
    const nodeSizes = nodes.map(node => ({ width: node.width, height: node.height }));
    const avgNodeWidth = nodeSizes.reduce((sum, size) => sum + size.width, 0) / nodeCount;
    const avgNodeHeight = nodeSizes.reduce((sum, size) => sum + size.height, 0) / nodeCount;
    
    return {
      nodeCount,
      edgeCount,
      density: Math.round(density * 10000) / 10000,
      avgDegree: Math.round(avgDegree * 100) / 100,
      maxDegree,
      minDegree,
      rootNodeCount: relations.rootNodes.length,
      leafNodeCount: relations.leafNodes.length,
      isolatedNodeCount: relations.isolatedNodes.length,
      nodeTypeCount: relations.nodeTypes.size,
      edgeTypeCount: relations.edgeTypes.size,
      avgNodeWidth: Math.round(avgNodeWidth * 100) / 100,
      avgNodeHeight: Math.round(avgNodeHeight * 100) / 100,
      nodeTypes: Object.fromEntries(relations.nodeTypes),
      edgeTypes: Object.fromEntries(relations.edgeTypes)
    };
  }

  /**
   * 检测数据中的环路
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Object} 环路检测结果
   */
  detectCycles(nodes, edges) {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    
    const adjacencyList = new Map();
    nodes.forEach(node => adjacencyList.set(node.id, []));
    edges.forEach(edge => {
      if (adjacencyList.has(edge.source)) {
        adjacencyList.get(edge.source).push(edge.target);
      }
    });
    
    const dfs = (nodeId, path = []) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);
      
      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, [...path])) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          // 发现环路
          const cycleStart = path.indexOf(neighbor);
          const cycle = path.slice(cycleStart);
          cycle.push(neighbor);
          cycles.push(cycle);
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });
    
    return {
      hasCycles: cycles.length > 0,
      cycles,
      cycleCount: cycles.length
    };
  }

  /**
   * 获取数据质量报告
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Object} 数据质量报告
   */
  getDataQualityReport(nodes, edges) {
    const validation = this.validateInput(nodes, edges);
    const relations = this.buildDataRelations(nodes, edges);
    const statistics = this.calculateStatistics(nodes, edges, relations);
    const cycles = this.detectCycles(nodes, edges);
    
    // 计算质量分数
    let qualityScore = 100;
    
    // 数据完整性检查
    if (!validation.isValid) {
      qualityScore -= validation.errors.length * 10;
    }
    
    // 连通性检查
    if (statistics.isolatedNodeCount > 0) {
      qualityScore -= Math.min(20, statistics.isolatedNodeCount * 2);
    }
    
    // 环路检查
    if (cycles.hasCycles) {
      qualityScore -= Math.min(15, cycles.cycleCount * 3);
    }
    
    // 密度检查
    if (statistics.density < 0.1) {
      qualityScore -= 10; // 图太稀疏
    } else if (statistics.density > 0.8) {
      qualityScore -= 15; // 图太密集
    }
    
    qualityScore = Math.max(0, qualityScore);
    
    return {
      qualityScore: Math.round(qualityScore),
      validation,
      statistics,
      cycles,
      recommendations: this.generateRecommendations(statistics, cycles, validation)
    };
  }

  /**
   * 生成数据优化建议
   * @param {Object} statistics - 统计信息
   * @param {Object} cycles - 环路信息
   * @param {Object} validation - 验证信息
   * @returns {Array} 建议列表
   */
  generateRecommendations(statistics, cycles, validation) {
    const recommendations = [];
    
    if (!validation.isValid) {
      recommendations.push('修复数据验证错误以提高数据质量');
    }
    
    if (statistics.isolatedNodeCount > 0) {
      recommendations.push(`考虑移除或连接 ${statistics.isolatedNodeCount} 个孤立节点`);
    }
    
    if (cycles.hasCycles) {
      recommendations.push(`检测到 ${cycles.cycleCount} 个环路，考虑是否需要移除某些边`);
    }
    
    if (statistics.density < 0.1) {
      recommendations.push('图的密度较低，考虑添加更多连接以改善布局效果');
    } else if (statistics.density > 0.8) {
      recommendations.push('图的密度过高，考虑简化连接关系以提高可读性');
    }
    
    if (statistics.maxDegree > 20) {
      recommendations.push('存在度数过高的节点，可能影响布局美观度');
    }
    
    return recommendations;
  }
}

// 默认导出已通过 export class 实现
