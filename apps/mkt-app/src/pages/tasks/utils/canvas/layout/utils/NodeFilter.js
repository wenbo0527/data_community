/**
 * 节点过滤工具模块
 * 提供节点筛选、验证、类型判断等功能
 */

export class NodeFilter {
  constructor(graph = null) {
    this.graph = graph;
  }

  /**
   * 设置图实例
   * @param {Object} graph - 图实例
   */
  setGraph(graph) {
    this.graph = graph;
  }

  /**
   * 获取节点类型 - 统一使用 nodeTypeHelper 中的 getNodeType 函数
   * @param {Object} node - 节点对象
   * @returns {string} 节点类型
   */
  getNodeType(node) {
    // 导入统一的节点类型获取函数
    try {
      const { getNodeType } = require('../../../../../../utils/nodeTypeHelper.js')
      const nodeType = getNodeType(node)
      
      if (nodeType) {
        return nodeType
      }
    } catch (error) {
      console.warn('[NodeFilter] 无法导入 getNodeType，使用本地实现:', error)
    }
    
    // 备用实现
    const nodeId = node.id || node.getId();
    
    try {
      // 优先从节点对象获取类型
      if (node.type) {return node.type;}
      if (node.getType && typeof node.getType === 'function') {
        return node.getType();
      }
      
      // 从节点数据获取类型
      const nodeData = node.getData ? node.getData() : node.data || {};
      if (nodeData.type) {return nodeData.type;}
      if (nodeData.nodeType) {return nodeData.nodeType;}
      
    } catch (error) {
      console.warn(`⚠️ [节点类型] 获取节点 ${nodeId} 类型失败:`, error.message);
    }
    
    // 从节点ID推断类型
    if (nodeId.includes('ai-call')) {return 'ai-call';}
    if (nodeId.includes('manual-call')) {return 'manual-call';}
    if (nodeId.includes('audience-split')) {return 'audience-split';}
    if (nodeId.includes('start')) {return 'start';}
    if (nodeId.includes('end')) {return 'end';}
    
    return 'process'; // 默认类型
  }

  /**
   * 按节点类型分组
   * @param {Array} nodes - 节点数组
   * @returns {Object} 按类型分组的节点
   */
  groupNodesByType(nodes) {
    const groups = {
      start: [],
      end: [],
      'ai-call': [],
      'manual-call': [],
      'audience-split': [],
      process: [],
      other: []
    };

    nodes.forEach(node => {
      const type = this.getNodeType(node);
      if (groups[type]) {
        groups[type].push(node);
      } else {
        groups.other.push(node);
      }
    });

    return groups;
  }

  /**
   * 识别叶子节点（无出边的节点）
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 叶子节点数组
   */
  identifyLeafNodes(allNodes) {
    if (!this.graph) {
      console.warn('⚠️ [叶子识别] 图实例未设置，无法识别叶子节点');
      return [];
    }

    const leafNodes = [];
    
    allNodes.forEach((node) => {
      // 检查节点是否已有实际连接
      const outgoingEdges = this.graph.getOutgoingEdges(node) || [];
      const realOutgoingEdges = outgoingEdges.filter((edge) => {
        const edgeData = edge.getData() || {};
        return (
          !edgeData.isPreview &&
          edgeData.type !== "preview-line" &&
          edgeData.type !== "unified-preview-line"
        );
      });

      // 如果节点没有实际连接，记录为叶子节点
      if (realOutgoingEdges.length === 0) {
        console.log(`📝 [叶子节点] 识别到叶子节点: ${node.id}`);
        leafNodes.push(node);
      } else {
        console.log(`⏭️ [非叶子节点] 跳过已有连接的节点 ${node.id}`);
      }
    });

    console.log('🌿 [叶子识别] 叶子节点列表:', leafNodes.map(n => n.id || n.getId()));
    return leafNodes;
  }

  /**
   * 根据节点类型获取叶子节点（当无边连接时使用）
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 叶子节点数组
   */
  getLeafNodesByType(allNodes) {
    // 按节点类型分层：end节点作为叶子节点（最底层）
    const endNodes = allNodes.filter((node) => {
      const nodeType = this.getNodeType(node);
      return nodeType === 'end';
    });
    
    if (endNodes.length > 0) {
      console.log(`🌿 [类型分层] 使用 ${endNodes.length} 个end节点作为叶子节点`);
      return endNodes;
    }
    
    console.log(`🎯 [叶子节点识别] 叶子节点识别完成`);
    return [];
  }

  /**
   * 验证节点位置数据的有效性
   * @param {string} nodeId - 节点ID
   * @param {Object} position - 位置对象
   * @returns {boolean} 是否有效
   */
  validateNodePosition(nodeId, position) {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      console.error(`❌ [位置应用] 节点 ${nodeId} 位置数据无效:`, position);
      return false;
    }
    return true;
  }

  /**
   * 按节点优先级排序
   * @param {Array} nodes - 节点数组
   * @returns {Array} 排序后的节点数组
   */
  sortNodesByPriority(nodes) {
    return nodes.sort((a, b) => {
      const aId = a.id || a.getId();
      const bId = b.id || b.getId();
      
      // 开始节点优先级最高
      if (aId.includes('start')) {return -1;}
      if (bId.includes('start')) {return 1;}
      
      // 结束节点优先级最低
      if (aId.includes('end')) {return 1;}
      if (bId.includes('end')) {return -1;}
      
      // 其他节点按ID排序
      return aId.localeCompare(bId);
    });
  }

  /**
   * 获取节点的层级优先级
   * @param {Object} node - 节点对象
   * @returns {number} 层级优先级
   */
  getNodeLayerPriority(node) {
    const nodeType = this.getNodeType(node);
    
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

    return layerPriorities[nodeType] || 2; // 默认第2层
  }

  /**
   * 过滤有效节点
   * @param {Array} nodes - 节点数组
   * @returns {Array} 有效节点数组
   */
  filterValidNodes(nodes) {
    return nodes.filter(node => {
      const nodeId = node.id || node.getId();
      
      // 基本有效性检查
      if (!nodeId) {
        console.warn('⚠️ [节点过滤] 发现无ID节点，跳过');
        return false;
      }
      
      // 检查节点是否可见
      if (node.isVisible && typeof node.isVisible === 'function' && !node.isVisible()) {
        console.log(`🙈 [节点过滤] 节点 ${nodeId} 不可见，跳过`);
        return false;
      }
      
      return true;
    });
  }

  /**
   * 检查是否有真实的边连接
   * @returns {boolean} 是否有真实连接
   */
  hasRealConnections() {
    if (!this.graph) {
      return false;
    }
    
    const edges = this.graph.getEdges() || [];
    const hasRealConnections = edges && edges.length > 0;
    
    console.log('🔍 [连接检测] 详细信息:', {
      图实例存在: !!this.graph,
      边数组: edges,
      边数量: edges.length,
      有真实连接: hasRealConnections
    });
    
    return hasRealConnections;
  }
}

// 默认实例
export const nodeFilter = new NodeFilter();

// 工厂函数
export function createNodeFilter(graph = null) {
  return new NodeFilter(graph);
}

// 工具函数
export const NodeFilterUtils = {
  /**
   * 快速获取节点类型
   * @param {Object} node - 节点对象
   * @returns {string} 节点类型
   */
  getType: (node) => {
    return nodeFilter.getNodeType(node);
  },
  
  /**
   * 快速验证节点位置
   * @param {string} nodeId - 节点ID
   * @param {Object} position - 位置对象
   * @returns {boolean} 是否有效
   */
  validatePosition: (nodeId, position) => {
    return nodeFilter.validateNodePosition(nodeId, position);
  },
  
  /**
   * 快速按类型分组
   * @param {Array} nodes - 节点数组
   * @returns {Object} 分组结果
   */
  groupByType: (nodes) => {
    return nodeFilter.groupNodesByType(nodes);
  }
};
// 默认导出已通过 export class 实现
