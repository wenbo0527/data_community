/**
 * 数据预处理器 - 负责布局数据的预处理和验证
 * 从UnifiedStructuredLayoutEngine中提取的数据预处理功能
 */

// 导入类型定义
import { NodeType, NodeDataType } from '../types/NodeTypes.js';
import { EdgeType, EdgeDataType } from '../types/EdgeTypes.js';
import { ConfigType } from '../types/ConfigTypes.js';

/**
 * 数据预处理器类
 * @class DataPreprocessor
 */
class DataPreprocessor {
  /**
   * 构造函数
   * @param {Object} graph - X6图形实例
   * @param {Object} options - 配置选项
   * @param {Object} options.nodeFilter - 节点过滤配置
   * @param {boolean} options.nodeFilter.excludeHints - 是否排除提示节点
   * @param {boolean} options.nodeFilter.excludePreview - 是否排除预览节点
   * @param {boolean} options.nodeFilter.excludeVirtual - 是否排除虚拟节点
   * @param {Object} options.edgeFilter - 边过滤配置
   * @param {boolean} options.edgeFilter.excludePreview - 是否排除预览边
   * @param {boolean} options.edgeFilter.excludeUnified - 是否排除统一预览边
   */
  constructor(graph, options = {}) {
    this.graph = graph;
    this.options = {
      // 节点过滤配置
      nodeFilter: {
        excludeHints: true,
        excludePreview: true,
        excludeVirtual: true
      },
      // 边过滤配置
      edgeFilter: {
        excludePreview: true,
        excludeUnified: true
      },
      ...options
    };
  }

  /**
   * 数据预处理（preprocess的别名）
   * @param {Object} context - 上下文对象，包含graph和options
   * @param {Object} context.graph - 图形实例
   * @param {Object} context.options - 配置选项
   * @returns {Promise<Object>} 预处理结果
   * @returns {boolean} returns.success - 是否成功
   * @returns {Array<Object>} returns.nodes - 有效节点列表
   * @returns {Array<Object>} returns.edges - 有效边列表
   * @returns {number} returns.totalNodes - 节点总数
   * @returns {number} returns.totalEdges - 边总数
   * @returns {string} [returns.error] - 错误信息（失败时）
   */
  async preprocess(context = {}) {
    try {
      const result = await this.preprocessLayoutData();
      return {
        success: true,
        nodes: result.validNodes,
        edges: result.validEdges,
        totalNodes: result.totalNodes,
        totalEdges: result.totalEdges,
        ...result
      };
    } catch (error) {
      console.error('[数据预处理] 预处理失败:', error);
      return {
        success: false,
        error: error.message,
        nodes: [],
        edges: [],
        totalNodes: 0,
        totalEdges: 0
      };
    }
  }

  /**
   * 数据预处理：提取节点和边
   * @returns {Promise<Object>} 预处理结果
   * @returns {Array<Object>} returns.validNodes - 有效节点列表
   * @returns {Array<Object>} returns.validEdges - 有效边列表
   * @returns {number} returns.totalNodes - 节点总数
   * @returns {number} returns.totalEdges - 边总数
   */
  async preprocessLayoutData() {
    console.log("[数据预处理] 开始提取布局数据");

    const nodes = this.graph.getNodes();
    const edges = this.graph.getEdges();

    // 过滤有效节点（排除拖拽点）
    const validNodes = this.filterValidNodes(nodes);

    // 过滤有效边（排除预览线）
    const validEdges = this.filterValidEdges(edges);

    console.log('[数据预处理] 数据统计:', {
      '有效节点': validNodes.length,
      '有效连线': validEdges.length,
      '总处理节点': validNodes.length,
    });

    return {
      validNodes,
      validEdges,
      totalNodes: validNodes.length,
      totalEdges: validEdges.length
    };
  }

  /**
   * 过滤有效节点
   * @param {Array<Object>} nodes - 原始节点数组
   * @returns {Array<Object>} 过滤后的有效节点
   */
  filterValidNodes(nodes) {
    return nodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const nodeData = node.getData() || {};
      
      // 排除提示节点
      if (this.options.nodeFilter.excludeHints && 
          (nodeId.includes("hint") || nodeId.startsWith("hint_"))) {
        return false;
      }
      
      // 排除预览节点
      if (this.options.nodeFilter.excludePreview && nodeData.isPreview) {
        return false;
      }
      
      // 排除虚拟节点
      if (this.options.nodeFilter.excludeVirtual && 
          (nodeId.includes('virtual') || nodeData.isVirtual)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * 过滤有效边
   * @param {Array<Object>} edges - 原始边数组
   * @returns {Array<Object>} 过滤后的有效边
   */
  filterValidEdges(edges) {
    return edges.filter((edge) => {
      const edgeId = edge.id || edge.getId();
      const edgeData = edge.getData() || {};
      
      // 排除预览边
      if (this.options.edgeFilter.excludePreview && 
          (edgeId.includes("preview") || edgeData.isPreview)) {
        return false;
      }
      
      // 排除统一预览边
      if (this.options.edgeFilter.excludeUnified && 
          edgeId.includes("unified_preview")) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * 获取节点类型
   * @param {string} nodeId - 节点ID
   * @returns {string} 节点类型
   */
  getNodeType(nodeId) {
    try {
      // 尝试从图中获取节点数据
      if (this.graph) {
        const node = this.graph.getCellById(nodeId);
        if (node) {
          const nodeData = node.getData() || {};
          return nodeData.type || nodeData.nodeType || 'unknown';
        }
      }
    } catch (error) {
      console.warn(`[节点类型] 获取节点 ${nodeId} 类型失败:`, error.message);
    }
    
    // 从节点ID推断类型
    return this.inferNodeTypeFromId(nodeId);
  }

  /**
   * 从节点ID推断节点类型
   * @param {string} nodeId - 节点ID
   * @returns {string} 推断的节点类型
   */
  inferNodeTypeFromId(nodeId) {
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
   * 获取节点的父节点列表
   * @param {string} nodeId - 节点ID
   * @returns {Array<string>} 父节点ID列表
   */
  getParentNodes(nodeId) {
    const parentNodes = [];
    
    try {
      // 从图形结构中获取入边
      const node = this.graph.getCellById(nodeId);
      if (node) {
        const incomingEdges = this.graph.getIncomingEdges(node);
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
      console.warn(`[数据预处理] 获取节点 ${nodeId} 父节点失败:`, error.message);
    }
    
    return parentNodes;
  }

  /**
   * 获取节点的子节点列表
   * @param {string} nodeId - 节点ID
   * @returns {Array<string>} 子节点ID列表
   */
  getChildNodes(nodeId) {
    const childNodes = [];
    
    try {
      // 从图形结构中获取出边
      const node = this.graph.getCellById(nodeId);
      if (node) {
        const outgoingEdges = this.graph.getOutgoingEdges(node);
        if (outgoingEdges && outgoingEdges.length > 0) {
          outgoingEdges.forEach(edge => {
            const targetId = edge.getTargetCellId();
            if (targetId && targetId !== nodeId) {
              childNodes.push(targetId);
            }
          });
        }
      }
      
    } catch (error) {
      console.warn(`[数据预处理] 获取节点 ${nodeId} 子节点失败:`, error.message);
    }
    
    return childNodes;
  }

  /**
   * 验证数据完整性
   * @param {Object} preprocessResult - 预处理结果
   * @param {Array<Object>} preprocessResult.validNodes - 有效节点列表
   * @param {Array<Object>} preprocessResult.validEdges - 有效边列表
   * @returns {Object} 验证结果
   * @returns {boolean} returns.isValid - 数据是否有效
   * @returns {Array<Object>} returns.issues - 问题列表
   * @returns {Object} returns.summary - 统计摘要
   * @returns {number} returns.summary.totalNodes - 节点总数
   * @returns {number} returns.summary.totalEdges - 边总数
   * @returns {number} returns.summary.isolatedNodes - 孤立节点数
   * @returns {number} returns.summary.brokenEdges - 断开边数
   */
  validateDataIntegrity(preprocessResult) {
    const { validNodes, validEdges } = preprocessResult;
    const issues = [];
    
    // 检查孤立节点
    const isolatedNodes = validNodes.filter(node => {
      const nodeId = node.id || node.getId();
      const hasIncoming = validEdges.some(edge => 
        (edge.getTargetCellId && edge.getTargetCellId() === nodeId) ||
        (edge.target && edge.target.cell === nodeId)
      );
      const hasOutgoing = validEdges.some(edge => 
        (edge.getSourceCellId && edge.getSourceCellId() === nodeId) ||
        (edge.source && edge.source.cell === nodeId)
      );
      return !hasIncoming && !hasOutgoing;
    });
    
    if (isolatedNodes.length > 0) {
      issues.push({
        type: 'isolated_nodes',
        count: isolatedNodes.length,
        nodes: isolatedNodes.map(node => node.id || node.getId())
      });
    }
    
    // 检查断开的边
    const brokenEdges = validEdges.filter(edge => {
      const sourceId = edge.getSourceCellId ? edge.getSourceCellId() : 
                      (edge.source ? edge.source.cell : null);
      const targetId = edge.getTargetCellId ? edge.getTargetCellId() : 
                      (edge.target ? edge.target.cell : null);
      
      const sourceExists = validNodes.some(node => 
        (node.id || node.getId()) === sourceId
      );
      const targetExists = validNodes.some(node => 
        (node.id || node.getId()) === targetId
      );
      
      return !sourceExists || !targetExists;
    });
    
    if (brokenEdges.length > 0) {
      issues.push({
        type: 'broken_edges',
        count: brokenEdges.length,
        edges: brokenEdges.map(edge => edge.id || edge.getId())
      });
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      summary: {
        totalNodes: validNodes.length,
        totalEdges: validEdges.length,
        isolatedNodes: isolatedNodes.length,
        brokenEdges: brokenEdges.length
      }
    };
  }

  /**
   * 构建节点关系映射
   * @param {Object} preprocessResult - 预处理结果
   * @param {Array<Object>} preprocessResult.validNodes - 有效节点列表
   * @param {Array<Object>} preprocessResult.validEdges - 有效边列表
   * @returns {Object} 关系映射
   * @returns {Map<string, Array<string>>} returns.parentChildMap - 父子关系映射
   * @returns {Map<string, Array<string>>} returns.childParentMap - 子父关系映射
   */
  buildNodeRelationships(preprocessResult) {
    const { validNodes, validEdges } = preprocessResult;
    const parentChildMap = new Map();
    const childParentMap = new Map();
    
    // 初始化映射
    validNodes.forEach(node => {
      const nodeId = node.id || node.getId();
      parentChildMap.set(nodeId, []);
      childParentMap.set(nodeId, []);
    });
    
    // 构建关系映射
    validEdges.forEach(edge => {
      const sourceId = edge.getSourceCellId ? edge.getSourceCellId() : 
                      (edge.source ? edge.source.cell : null);
      const targetId = edge.getTargetCellId ? edge.getTargetCellId() : 
                      (edge.target ? edge.target.cell : null);
      
      if (sourceId && targetId) {
        // 父->子映射
        if (parentChildMap.has(sourceId)) {
          parentChildMap.get(sourceId).push(targetId);
        }
        
        // 子->父映射
        if (childParentMap.has(targetId)) {
          childParentMap.get(targetId).push(sourceId);
        }
      }
    });
    
    return {
      parentChildMap,
      childParentMap
    };
  }
}

export { DataPreprocessor };
export default DataPreprocessor;