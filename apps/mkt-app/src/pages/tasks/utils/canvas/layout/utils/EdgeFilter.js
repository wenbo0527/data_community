/**
 * 边过滤工具模块
 * 提供边筛选、验证、类型判断等功能
 */

export class EdgeFilter {
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
   * 过滤有效边（排除预览线）
   * @param {Array} edges - 边数组
   * @returns {Array} 有效边数组
   */
  filterValidEdges(edges) {
    return edges.filter((edge) => {
      // 兼容不同的边数据结构
      const edgeData = (typeof edge.getData === 'function' ? edge.getData() : edge) || {};
      const edgeId = edge.id || (typeof edge.getId === 'function' ? edge.getId() : edge.id);
      
      // 排除预览线和临时边
      if (edgeData.isPreview || 
          edgeData.type === "preview-line" || 
          edgeData.type === "unified-preview-line" ||
          (edgeId && edgeId.includes('preview')) ||
          (edgeId && edgeId.includes('temp'))) {
        return false;
      }
      
      // 排除无效的源和目标
      const sourceId = typeof edge.getSourceCellId === 'function' ? edge.getSourceCellId() : edge.source;
      const targetId = typeof edge.getTargetCellId === 'function' ? edge.getTargetCellId() : edge.target;
      
      if (!sourceId || !targetId) {
        console.warn(`⚠️ [边过滤] 边 ${edgeId} 缺少源或目标节点`);
        return false;
      }
      
      return true;
    });
  }

  /**
   * 过滤真实连接边（排除预览线和临时边）
   * @param {Array} edges - 边数组
   * @returns {Array} 真实连接边数组
   */
  filterRealConnectionEdges(edges) {
    return edges.filter((edge) => {
      const edgeData = (typeof edge.getData === 'function' ? edge.getData() : edge) || {};
      return (
        !edgeData.isPreview &&
        edgeData.type !== "preview-line" &&
        edgeData.type !== "unified-preview-line"
      );
    });
  }

  /**
   * 获取节点的出边（排除预览线）
   * @param {Object} node - 节点对象
   * @returns {Array} 出边数组
   */
  getNodeOutgoingEdges(node) {
    if (!this.graph) {
      console.warn('⚠️ [边过滤] 图实例未设置，无法获取出边');
      return [];
    }
    
    const outgoingEdges = this.graph.getOutgoingEdges(node) || [];
    return this.filterRealConnectionEdges(outgoingEdges);
  }

  /**
   * 获取节点的入边（排除预览线）
   * @param {Object} node - 节点对象
   * @returns {Array} 入边数组
   */
  getNodeIncomingEdges(node) {
    if (!this.graph) {
      console.warn('⚠️ [边过滤] 图实例未设置，无法获取入边');
      return [];
    }
    
    const incomingEdges = this.graph.getIncomingEdges(node) || [];
    return this.filterRealConnectionEdges(incomingEdges);
  }

  /**
   * 检查边是否为预览线
   * @param {Object} edge - 边对象
   * @returns {boolean} 是否为预览线
   */
  isPreviewLine(edge) {
    const edgeData = (typeof edge.getData === 'function' ? edge.getData() : edge) || {};
    const edgeId = edge.id || (typeof edge.getId === 'function' ? edge.getId() : edge.id);
    
    return edgeData.isPreview || 
           edgeData.type === "preview-line" || 
           edgeData.type === "unified-preview-line" ||
           (edgeId && edgeId.includes('preview'));
  }

  /**
   * 检查边是否为临时边
   * @param {Object} edge - 边对象
   * @returns {boolean} 是否为临时边
   */
  isTemporaryEdge(edge) {
    const edgeData = (typeof edge.getData === 'function' ? edge.getData() : edge) || {};
    const edgeId = edge.id || (typeof edge.getId === 'function' ? edge.getId() : edge.id);
    
    return edgeData.isTemporary || 
           (edgeId && edgeId.includes('temp')) ||
           (edgeId && edgeId.includes('temporary'));
  }

  /**
   * 获取边的类型
   * @param {Object} edge - 边对象
   * @returns {string} 边类型
   */
  getEdgeType(edge) {
    const edgeData = (typeof edge.getData === 'function' ? edge.getData() : edge) || {};
    
    if (edgeData.type) {
      return edgeData.type;
    }
    
    // 从边ID推断类型
    const edgeId = edge.id || (typeof edge.getId === 'function' ? edge.getId() : edge.id);
    if (edgeId && edgeId.includes('preview')) {return 'preview-line';}
    if (edgeId && edgeId.includes('temp')) {return 'temporary';}
    
    return 'normal'; // 默认类型
  }

  /**
   * 按边类型分组
   * @param {Array} edges - 边数组
   * @returns {Object} 按类型分组的边
   */
  groupEdgesByType(edges) {
    const groups = {
      normal: [],
      'preview-line': [],
      'unified-preview-line': [],
      temporary: [],
      other: []
    };

    edges.forEach(edge => {
      const type = this.getEdgeType(edge);
      if (groups[type]) {
        groups[type].push(edge);
      } else {
        groups.other.push(edge);
      }
    });

    return groups;
  }

  /**
   * 验证边的连接有效性
   * @param {Object} edge - 边对象
   * @returns {boolean} 连接是否有效
   */
  validateEdgeConnection(edge) {
    const sourceId = typeof edge.getSourceCellId === 'function' ? edge.getSourceCellId() : edge.source;
    const targetId = typeof edge.getTargetCellId === 'function' ? edge.getTargetCellId() : edge.target;
    
    if (!sourceId || !targetId) {
      return false;
    }
    
    // 检查源和目标节点是否存在
    if (this.graph) {
      const sourceNode = this.graph.getCellById(sourceId);
      const targetNode = this.graph.getCellById(targetId);
      
      if (!sourceNode || !targetNode) {
        console.warn(`⚠️ [边验证] 边连接的节点不存在: ${sourceId} -> ${targetId}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 获取所有有效边
   * @returns {Array} 有效边数组
   */
  getAllValidEdges() {
    if (!this.graph) {
      console.warn('⚠️ [边过滤] 图实例未设置，无法获取边');
      return [];
    }
    
    const allEdges = this.graph.getEdges() || [];
    return this.filterValidEdges(allEdges);
  }

  /**
   * 获取所有真实连接边
   * @returns {Array} 真实连接边数组
   */
  getAllRealConnectionEdges() {
    if (!this.graph) {
      console.warn('⚠️ [边过滤] 图实例未设置，无法获取边');
      return [];
    }
    
    const allEdges = this.graph.getEdges() || [];
    return this.filterRealConnectionEdges(allEdges);
  }

  /**
   * 检查图中是否有真实连接
   * @returns {boolean} 是否有真实连接
   */
  hasRealConnections() {
    if (!this.graph) {
      return false;
    }
    
    const edges = this.graph.getEdges() || [];
    const realEdges = this.filterRealConnectionEdges(edges);
    const hasRealConnections = realEdges.length > 0;
    
    console.log('🔍 [连接检测] 详细信息:', {
      图实例存在: !!this.graph,
      总边数: edges.length,
      真实边数: realEdges.length,
      有真实连接: hasRealConnections
    });
    
    return hasRealConnections;
  }

  /**
   * 构建父子关系映射
   * @param {Array} allNodes - 所有节点
   * @param {Array} validEdges - 有效边
   * @returns {Object} 关系映射对象
   */
  buildParentChildRelationships(allNodes, validEdges) {
    const parentChildMap = new Map();
    const childParentMap = new Map();
    
    // 初始化关系映射
    allNodes.forEach((node) => {
      const nodeId = node.id || node.getId();
      parentChildMap.set(nodeId, []);
      childParentMap.set(nodeId, []);
    });

    // 处理普通节点间的连接关系
    validEdges.forEach((edge) => {
      const sourceId = edge.getSourceCellId();
      const targetId = edge.getTargetCellId();

      if (sourceId && targetId) {
        // 源节点是父节点，目标节点是子节点
        const children = parentChildMap.get(sourceId) || [];
        if (!children.includes(targetId)) {
          children.push(targetId);
          parentChildMap.set(sourceId, children);
        }

        // 目标节点的父节点是源节点
        const parents = childParentMap.get(targetId) || [];
        if (!parents.includes(sourceId)) {
          parents.push(sourceId);
          childParentMap.set(targetId, parents);
        }

        console.log(`🔗 [关系构建] ${sourceId} -> ${targetId}`);
      }
    });

    return { parentChildMap, childParentMap };
  }

  /**
   * 清理无效边
   * @returns {Array} 被清理的边ID数组
   */
  cleanupInvalidEdges() {
    if (!this.graph) {
      console.warn('⚠️ [边清理] 图实例未设置，无法清理边');
      return [];
    }
    
    const allEdges = this.graph.getEdges() || [];
    const cleanedEdgeIds = [];
    
    allEdges.forEach(edge => {
      if (!this.validateEdgeConnection(edge)) {
        const edgeId = edge.id || edge.getId();
        try {
          this.graph.removeCell(edge);
          cleanedEdgeIds.push(edgeId);
          console.log(`🧹 [边清理] 已清理无效边: ${edgeId}`);
        } catch (error) {
          console.warn(`⚠️ [边清理] 清理边 ${edgeId} 失败:`, error.message);
        }
      }
    });
    
    return cleanedEdgeIds;
  }
}

// 默认实例
export const edgeFilter = new EdgeFilter();

// 工厂函数
export function createEdgeFilter(graph = null) {
  return new EdgeFilter(graph);
}

// 工具函数
export const EdgeFilterUtils = {
  /**
   * 快速过滤有效边
   * @param {Array} edges - 边数组
   * @returns {Array} 有效边数组
   */
  filterValid: (edges) => {
    return edgeFilter.filterValidEdges(edges);
  },
  
  /**
   * 快速检查是否为预览线
   * @param {Object} edge - 边对象
   * @returns {boolean} 是否为预览线
   */
  isPreview: (edge) => {
    return edgeFilter.isPreviewLine(edge);
  },
  
  /**
   * 快速获取边类型
   * @param {Object} edge - 边对象
   * @returns {string} 边类型
   */
  getType: (edge) => {
    return edgeFilter.getEdgeType(edge);
  },
  
  /**
   * 快速验证边连接
   * @param {Object} edge - 边对象
   * @returns {boolean} 连接是否有效
   */
  validateConnection: (edge) => {
    return edgeFilter.validateEdgeConnection(edge);
  }
};
// 默认导出已通过 export class 实现
