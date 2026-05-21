/**
 * 分层构建器 - 负责构建节点的分层结构
 * 从UnifiedStructuredLayoutEngine.js中提取的分层构建功能
 */
export class HierarchicalBuilder {
  constructor(layoutModel, options = {}) {
    this.layoutModel = layoutModel;
    this.options = options;
  }

  /**
   * 构建分层结构
   * @param {Object|Array} context - 上下文对象或节点数组（兼容旧接口）
   * @param {Array} allEdges - 所有边（当第一个参数是数组时使用）
   * @returns {Object} 分层结构 { layers, nodeToLayer }
   */
  buildHierarchicalLayers(context, allEdges = null) {
    // 兼容新旧接口
    let allNodes, edges;
    if (Array.isArray(context)) {
      // 旧接口：第一个参数是节点数组
      allNodes = context;
      edges = allEdges || [];
    } else {
      // 新接口：第一个参数是上下文对象
      allNodes = context.nodes || [];
      edges = context.edges || [];
    }
    console.log(' [分层构建] 开始构建分层结构');
    console.log(` [分层构建] 输入节点数: ${allNodes.length}, 边数: ${edges.length}`);

    // 过滤掉虚拟节点
    const normalNodes = allNodes.filter(node => !node.isVirtual);
    console.log(` [分层构建] 过滤后节点数: ${normalNodes.length}`);

    // 检查是否有边连接
    const hasEdges = edges && edges.length > 0;
    console.log(` [分层构建] 是否有边连接: ${hasEdges}`);

    let layers;
    if (hasEdges) {
      // 有边连接：使用自底向上的分层算法
      layers = this.calculateLayersBottomUp(normalNodes, edges);
    } else {
      // 无边连接：基于节点类型的垂直分层
      layers = this.buildTypeBasedLayers(normalNodes);
    }

    console.log(` [分层构建] 分层构建完成，共 ${layers.length} 层`);
    layers.forEach((layer, index) => {
      console.log(`  第${index}层: ${layer.length}个节点`, layer.map(n => n.id || n.getId()));
    });

    return {
      layers,
      nodeToLayer: this.layoutModel.nodeToLayer
    };
  }

  /**
   * 自底向上计算层级
   * @param {Array} normalNodes - 普通节点列表
   * @param {Array} allEdges - 所有边
   * @returns {Array} 分层结果
   */
  calculateLayersBottomUp(normalNodes, allEdges) {
    console.log(' [自底向上分层] 开始自底向上层级计算');

    // 构建父子关系
    this.buildParentChildRelationships(normalNodes, allEdges);

    // 识别叶子节点（没有子节点的节点）
    const leafNodes = this.identifyLeafNodes(normalNodes);
    console.log(` [自底向上分层] 识别到 ${leafNodes.length} 个叶子节点:`, leafNodes.map(n => n.id || n.getId()));

    const layers = [];
    const processedNodes = new Set();
    const nodeToLayer = new Map();
    let currentLayer = leafNodes;
    let layerIndex = 0;

    // 从叶子节点开始，逐层向上构建
    while (currentLayer.length > 0) {
      console.log(` [自底向上分层] 处理第${layerIndex}层，节点数: ${currentLayer.length}`);
      
      layers.push([...currentLayer]);
      
      // 标记当前层节点为已处理
      currentLayer.forEach((node) => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
        nodeToLayer.set(nodeId, layerIndex);
      });

      // 查找下一层（父节点层）
      const nextLayer = [];
      const candidateParents = new Set();

      currentLayer.forEach((node) => {
        const nodeId = node.id || node.getId();
        const parents = this.layoutModel.childParentMap.get(nodeId) || [];

        console.log(` [自底向上分层] 节点 ${nodeId} 的父节点:`, parents);

        parents.forEach((parentId) => {
          if (!processedNodes.has(parentId)) {
            candidateParents.add(parentId);
          }
        });
      });

      console.log(' [自底向上分层] 候选父节点:', Array.from(candidateParents));

      // 验证候选父节点的所有子节点是否都已处理
      candidateParents.forEach((parentId) => {
        const children = this.layoutModel.parentChildMap.get(parentId) || [];

        // 只考虑非虚拟子节点
        const realChildren = children.filter((childId) => {
          const childNode = normalNodes.find(
            (n) => (n.id || n.getId()) === childId,
          );
          return childNode && !childNode.isVirtual;
        });

        const allChildrenProcessed = realChildren.every((childId) =>
          processedNodes.has(childId),
        );

        console.log(
          ` [自底向上分层] 父节点 ${parentId} 的实际子节点:`,
          realChildren,
          `全部处理完成: ${allChildrenProcessed}`,
        );

        if (allChildrenProcessed) {
          const parentNode = normalNodes.find(
            (n) => (n.id || n.getId()) === parentId,
          );
          if (parentNode && !parentNode.isVirtual) {
            nextLayer.push(parentNode);
            console.log(` [自底向上分层] 添加父节点 ${parentId} 到下一层`);
          }
        }
      });

      currentLayer = nextLayer;
      layerIndex++;

      // 防止无限循环
      if (layerIndex > 20) {
        console.warn(' [自底向上分层] 层级构建超过20层，强制停止');
        break;
      }
    }

    console.log(
      ` [自底向上分层] 初步构建完成，共 ${layers.length} 层，已处理 ${processedNodes.size} 个节点`,
    );

    // 检查未处理的节点
    const allNodeIds = normalNodes
      .filter((node) => !node.isVirtual)
      .map((node) => node.id || node.getId());
    const unprocessedNodeIds = allNodeIds.filter(
      (nodeId) => !processedNodes.has(nodeId),
    );

    if (unprocessedNodeIds.length > 0) {
      console.warn(
        ` [自底向上分层] 发现 ${unprocessedNodeIds.length} 个未处理的节点:`,
        unprocessedNodeIds,
      );

      // 将未处理的节点添加到最后一层
      const unprocessedNodes = normalNodes.filter((node) =>
        unprocessedNodeIds.includes(node.id || node.getId()),
      );

      if (layers.length === 0) {
        layers.push([]);
      }
      layers[layers.length - 1].push(...unprocessedNodes);

      unprocessedNodes.forEach((node) => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
        nodeToLayer.set(nodeId, layers.length - 1);
      });

      console.log(` [自底向上分层] 已将未处理节点添加到第${layers.length - 1}层`);
    }

    // 反转层级顺序（使第0层为顶层）
    layers.reverse();

    console.log(' [自底向上分层] 层级反转完成，最终层级结构:');
    layers.forEach((layer, index) => {
      console.log(
        `  第${index}层: ${layer.length}个节点`,
        layer.map((n) => n.id || n.getId()),
      );
    });

    // 重新计算层级索引（确保nodeToLayer映射正确）
    this.layoutModel.nodeToLayer = new Map();
    layers.forEach((layer, index) => {
      layer.forEach((node) => {
        const nodeId = node.id || node.getId();
        this.layoutModel.nodeToLayer.set(nodeId, index);
      });
    });

    console.log(
      ` [自底向上分层] nodeToLayer映射重建完成，共 ${this.layoutModel.nodeToLayer.size} 个节点`,
    );

    return layers;
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
      const nodeType = node.type || node.getType?.() || '';
      if (nodeType === 'start') {
        startNodes.push(node);
      } else if (nodeType === 'end') {
        endNodes.push(node);
      } else {
        otherNodes.push(node);
      }
    });

    console.log(' [类型分层] 节点分类:', {
      start: startNodes.length,
      end: endNodes.length,
      other: otherNodes.length
    });

    // 构建垂直分层：start在顶层，end在底层，其他节点在中间
    if (startNodes.length > 0) {
      layers.push(startNodes);
      console.log(' [类型分层] 第0层(顶层): start节点', startNodes.map(n => n.id || n.getId()));
    }

    if (otherNodes.length > 0) {
      layers.push(otherNodes);
      console.log(` [类型分层] 第${layers.length - 1}层(中间层): 其他节点`, otherNodes.map(n => n.id || n.getId()));
    }

    if (endNodes.length > 0) {
      layers.push(endNodes);
      console.log(` [类型分层] 第${layers.length - 1}层(底层): end节点`, endNodes.map(n => n.id || n.getId()));
    }

    // 如果只有一种类型的节点，确保至少有一层
    if (layers.length === 0 && normalNodes.length > 0) {
      layers.push(normalNodes);
      console.log(' [类型分层] 单一类型层级:', normalNodes.map(n => n.id || n.getId()));
    }

    // 更新nodeToLayer映射
    this.layoutModel.nodeToLayer = new Map();
    layers.forEach((layer, index) => {
      layer.forEach((node) => {
        const nodeId = node.id || node.getId();
        this.layoutModel.nodeToLayer.set(nodeId, index);
      });
    });

    console.log(` [类型分层] nodeToLayer映射完成，共 ${this.layoutModel.nodeToLayer.size} 个节点`);

    return layers;
  }

  /**
   * 构建父子关系映射
   * @param {Array} nodes - 节点列表
   * @param {Array} edges - 边列表
   */
  buildParentChildRelationships(nodes, edges) {
    console.log(' [关系构建] 开始构建父子关系');
    
    // 初始化映射
    this.layoutModel.parentChildMap = new Map();
    this.layoutModel.childParentMap = new Map();

    // 为所有节点初始化空数组
    nodes.forEach(node => {
      const nodeId = node.id || node.getId();
      this.layoutModel.parentChildMap.set(nodeId, []);
      this.layoutModel.childParentMap.set(nodeId, []);
    });

    // 根据边构建关系
    edges.forEach(edge => {
      const sourceId = edge.source || edge.getSourceCellId();
      const targetId = edge.target || edge.getTargetCellId();

      if (sourceId && targetId) {
        // source是parent，target是child
        const children = this.layoutModel.parentChildMap.get(sourceId) || [];
        if (!children.includes(targetId)) {
          children.push(targetId);
          this.layoutModel.parentChildMap.set(sourceId, children);
        }

        // target的parent是source
        const parents = this.layoutModel.childParentMap.get(targetId) || [];
        if (!parents.includes(sourceId)) {
          parents.push(sourceId);
          this.layoutModel.childParentMap.set(targetId, parents);
        }
      }
    });

    console.log(` [关系构建] 父子关系构建完成，父子映射: ${this.layoutModel.parentChildMap.size}, 子父映射: ${this.layoutModel.childParentMap.size}`);
  }

  /**
   * 识别叶子节点（没有子节点的节点）
   * @param {Array} nodes - 节点列表
   * @returns {Array} 叶子节点列表
   */
  identifyLeafNodes(nodes) {
    const leafNodes = [];
    
    nodes.forEach(node => {
      const nodeId = node.id || node.getId();
      const children = this.layoutModel.parentChildMap.get(nodeId) || [];
      
      // 过滤掉虚拟子节点
      const realChildren = children.filter(childId => {
        const childNode = nodes.find(n => (n.id || n.getId()) === childId);
        return childNode && !childNode.isVirtual;
      });
      
      if (realChildren.length === 0) {
        leafNodes.push(node);
      }
    });
    
    return leafNodes;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    if (this.layoutModel) {
      this.layoutModel.nodeToLayer = new Map();
      this.layoutModel.parentChildMap = new Map();
      this.layoutModel.childParentMap = new Map();
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      nodeToLayerSize: this.layoutModel.nodeToLayer?.size || 0,
      parentChildMapSize: this.layoutModel.parentChildMap?.size || 0,
      childParentMapSize: this.layoutModel.childParentMap?.size || 0
    };
  }
}

export default HierarchicalBuilder;