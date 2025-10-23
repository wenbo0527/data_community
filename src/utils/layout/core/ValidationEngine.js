/**
 * @fileoverview 验证引擎
 * 负责布局数据和配置的验证、约束检查和错误报告
 * 约180行代码
 */

import { LayoutAlgorithmType, LayoutDirection } from '../types/LayoutTypes.js';
import { NodeType, NodeStatus } from '../types/NodeTypes.js';
import { EdgeType, EdgeStatus, EdgeDirection } from '../types/EdgeTypes.js';
import { ConfigLevel, ConfigType, ConfigStatus } from '../types/ConfigTypes.js';

/**
 * 验证引擎类
 * 主要职责：
 * 1. 数据结构验证
 * 2. 布局约束检查
 * 3. 配置参数验证
 * 4. 错误收集和报告
 * @class
 */
export class ValidationEngine {
  /**
   * 构造函数
   * @param {Object} [config={}] - 验证配置
   * @param {boolean} [config.strictMode=false] - 严格模式
   * @param {number} [config.maxNodes=10000] - 最大节点数
   * @param {number} [config.maxEdges=50000] - 最大边数
   * @param {number} [config.maxLayers=100] - 最大层级数
   */
  constructor(config = {}) {
    // 验证配置
    this.config = {
      strictMode: config.strictMode || false,
      maxNodes: config.maxNodes || 10000,
      maxEdges: config.maxEdges || 50000,
      maxLayers: config.maxLayers || 100,
      ...config
    };
    
    // 验证规则
    this.rules = new Map();
    this.customValidators = new Map();
    
    // 验证结果缓存
    this.validationCache = new Map();
    this.cacheTimeout = 5000; // 5秒缓存
    
    // 错误收集
    this.errors = [];
    this.warnings = [];
    
    this.initializeDefaultRules();
    console.log('✅ [ValidationEngine] 验证引擎初始化完成');
  }

  /**
   * 初始化默认验证规则
   * @private
   * @returns {void}
   */
  initializeDefaultRules() {
    // 节点验证规则
    this.addRule('nodes', (nodes) => {
      const errors = [];
      const warnings = [];
      
      if (!Array.isArray(nodes)) {
        errors.push({ type: 'invalid_type', message: '节点数据必须是数组' });
        return { errors, warnings };
      }
      
      if (nodes.length > this.config.maxNodes) {
        errors.push({ 
          type: 'limit_exceeded', 
          message: `节点数量超过限制 (${nodes.length} > ${this.config.maxNodes})` 
        });
      }
      
      const nodeIds = new Set();
      nodes.forEach((node, index) => {
        if (!node) {
          errors.push({ type: 'null_node', index, message: `节点 ${index} 为空` });
          return;
        }
        
        const nodeId = node.id || node.getId?.();
        if (!nodeId) {
          errors.push({ type: 'missing_id', index, message: `节点 ${index} 缺少ID` });
        } else if (nodeIds.has(nodeId)) {
          errors.push({ type: 'duplicate_id', index, nodeId, message: `节点ID重复: ${nodeId}` });
        } else {
          nodeIds.add(nodeId);
        }
        
        // 检查节点类型
        if (node.shape && typeof node.shape !== 'string') {
          warnings.push({ type: 'invalid_shape', index, nodeId, message: '节点形状应为字符串' });
        }
      });
      
      return { errors, warnings };
    });

    // 边验证规则
    this.addRule('edges', (edges, context = {}) => {
      const errors = [];
      const warnings = [];
      const { nodes = [] } = context;
      
      if (!Array.isArray(edges)) {
        errors.push({ type: 'invalid_type', message: '边数据必须是数组' });
        return { errors, warnings };
      }
      
      if (edges.length > this.config.maxEdges) {
        errors.push({ 
          type: 'limit_exceeded', 
          message: `边数量超过限制 (${edges.length} > ${this.config.maxEdges})` 
        });
      }
      
      const nodeIds = new Set(nodes.map(n => n.id || n.getId?.()).filter(Boolean));
      const edgeIds = new Set();
      
      edges.forEach((edge, index) => {
        if (!edge) {
          errors.push({ type: 'null_edge', index, message: `边 ${index} 为空` });
          return;
        }
        
        const edgeId = edge.id || edge.getId?.();
        if (edgeId) {
          if (edgeIds.has(edgeId)) {
            errors.push({ type: 'duplicate_id', index, edgeId, message: `边ID重复: ${edgeId}` });
          } else {
            edgeIds.add(edgeId);
          }
        }
        
        const sourceId = edge.source || edge.getSourceCellId?.();
        const targetId = edge.target || edge.getTargetCellId?.();
        
        if (!sourceId) {
          errors.push({ type: 'missing_source', index, message: `边 ${index} 缺少源节点` });
        } else if (nodeIds.size > 0 && !nodeIds.has(sourceId)) {
          warnings.push({ type: 'invalid_source', index, sourceId, message: `边源节点不存在: ${sourceId}` });
        }
        
        if (!targetId) {
          errors.push({ type: 'missing_target', index, message: `边 ${index} 缺少目标节点` });
        } else if (nodeIds.size > 0 && !nodeIds.has(targetId)) {
          warnings.push({ type: 'invalid_target', index, targetId, message: `边目标节点不存在: ${targetId}` });
        }
        
        if (sourceId === targetId) {
          warnings.push({ type: 'self_loop', index, nodeId: sourceId, message: `自环边: ${sourceId}` });
        }
      });
      
      return { errors, warnings };
    });

    // 层级验证规则
    this.addRule('layers', (layers) => {
      const errors = [];
      const warnings = [];
      
      if (!Array.isArray(layers)) {
        errors.push({ type: 'invalid_type', message: '层级数据必须是数组' });
        return { errors, warnings };
      }
      
      if (layers.length > this.config.maxLayers) {
        errors.push({ 
          type: 'limit_exceeded', 
          message: `层级数量超过限制 (${layers.length} > ${this.config.maxLayers})` 
        });
      }
      
      layers.forEach((layer, index) => {
        if (!Array.isArray(layer)) {
          errors.push({ type: 'invalid_layer', index, message: `层级 ${index} 必须是数组` });
        } else if (layer.length === 0) {
          warnings.push({ type: 'empty_layer', index, message: `层级 ${index} 为空` });
        }
      });
      
      return { errors, warnings };
    });

    // 位置验证规则
    this.addRule('positions', (positions) => {
      const errors = [];
      const warnings = [];
      
      if (!(positions instanceof Map) && typeof positions !== 'object') {
        errors.push({ type: 'invalid_type', message: '位置数据必须是Map或对象' });
        return { errors, warnings };
      }
      
      const positionEntries = positions instanceof Map ? positions.entries() : Object.entries(positions);
      
      for (const [nodeId, position] of positionEntries) {
        if (!position || typeof position !== 'object') {
          errors.push({ type: 'invalid_position', nodeId, message: `节点 ${nodeId} 位置数据无效` });
          continue;
        }
        
        if (typeof position.x !== 'number' || typeof position.y !== 'number') {
          errors.push({ type: 'invalid_coordinates', nodeId, message: `节点 ${nodeId} 坐标必须是数字` });
        }
        
        if (isNaN(position.x) || isNaN(position.y)) {
          errors.push({ type: 'nan_coordinates', nodeId, message: `节点 ${nodeId} 坐标为NaN` });
        }
        
        if (!isFinite(position.x) || !isFinite(position.y)) {
          errors.push({ type: 'infinite_coordinates', nodeId, message: `节点 ${nodeId} 坐标为无穷大` });
        }
      }
      
      return { errors, warnings };
    });
  }

  /**
   * 添加验证规则
   * @param {string} type - 验证类型
   * @param {Function} validator - 验证函数
   * @param {*} validator.data - 要验证的数据
   * @param {Object} [validator.context] - 验证上下文
   * @returns {Object} validator.returns - 验证结果
   * @returns {Array<Object>} validator.returns.errors - 错误列表
   * @returns {Array<Object>} validator.returns.warnings - 警告列表
   * @returns {void}
   */
  addRule(type, validator) {
    if (typeof validator !== 'function') {
      console.warn('✅ [ValidationEngine] 验证器必须是函数');
      return;
    }
    
    this.rules.set(type, validator);
    console.log(`✅ [ValidationEngine] 添加验证规则: ${type}`);
  }

  /**
   * 添加自定义验证器
   * @param {string} name - 验证器名称
   * @param {Function} validator - 验证函数
   * @returns {void}
   */
  addCustomValidator(name, validator) {
    if (typeof validator !== 'function') {
      console.warn('✅ [ValidationEngine] 自定义验证器必须是函数');
      return;
    }
    
    this.customValidators.set(name, validator);
    console.log(`✅ [ValidationEngine] 添加自定义验证器: ${name}`);
  }

  /**
   * 验证数据
   * @param {string} type - 验证类型
   * @param {*} data - 要验证的数据
   * @param {Object} [context={}] - 验证上下文
   * @param {Array<NodeTypes.NodeType>} [context.nodes] - 节点列表（用于边验证）
   * @returns {Object} 验证结果
   * @returns {Array<Object>} returns.errors - 错误列表
   * @returns {Array<Object>} returns.warnings - 警告列表
   * @returns {boolean} returns.isValid - 是否有效
   */
  validate(type, data, context = {}) {
    const cacheKey = this.generateCacheKey(type, data, context);
    
    // 检查缓存
    if (this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }
    }
    
    let result = { errors: [], warnings: [], isValid: true };
    
    try {
      if (this.rules.has(type)) {
        const validator = this.rules.get(type);
        const validationResult = validator(data, context);
        
        result.errors = validationResult.errors || [];
        result.warnings = validationResult.warnings || [];
        result.isValid = result.errors.length === 0;
      } else {
        result.warnings.push({ type: 'unknown_type', message: `未知验证类型: ${type}` });
      }
    } catch (error) {
      result.errors.push({ type: 'validation_error', message: `验证过程出错: ${error.message}` });
      result.isValid = false;
      console.error('✅ [ValidationEngine] 验证过程出错:', error);
    }
    
    // 缓存结果
    this.validationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    console.log(`✅ [ValidationEngine] 验证 ${type}:`, result.isValid ? '通过' : '失败', 
                `(错误: ${result.errors.length}, 警告: ${result.warnings.length})`);
    
    return result;
  }

  /**
   * 验证完整布局数据
   * @param {Object} layoutData - 布局数据
   * @param {Array<NodeTypes.NodeType>} [layoutData.nodes=[]] - 节点列表
   * @param {Array<EdgeTypes.EdgeType>} [layoutData.edges=[]] - 边列表
   * @param {Array<Array<string>>} [layoutData.layers=[]] - 层级列表
   * @param {LayoutTypes.PositionMapType} [layoutData.positions=new Map()] - 位置映射
   * @returns {Object} 完整验证结果
   * @returns {boolean} returns.isValid - 整体是否有效
   * @returns {Object} returns.results - 各部分验证结果
   * @returns {Object} returns.results.nodes - 节点验证结果
   * @returns {Object} returns.results.edges - 边验证结果
   * @returns {Object} returns.results.layers - 层级验证结果
   * @returns {Object} returns.results.positions - 位置验证结果
   * @returns {Object} returns.summary - 验证摘要
   * @returns {number} returns.summary.totalErrors - 总错误数
   * @returns {number} returns.summary.totalWarnings - 总警告数
   * @returns {number} returns.summary.nodeCount - 节点数
   * @returns {number} returns.summary.edgeCount - 边数
   * @returns {number} returns.summary.layerCount - 层级数
   * @returns {number} returns.summary.positionCount - 位置数
   * @returns {Array<Object>} returns.errors - 所有错误
   * @returns {Array<Object>} returns.warnings - 所有警告
   */
  validateLayout(layoutData) {
    const { nodes = [], edges = [], layers = [], positions = new Map() } = layoutData;
    
    const results = {
      nodes: this.validate('nodes', nodes),
      edges: this.validate('edges', edges, { nodes }),
      layers: this.validate('layers', layers),
      positions: this.validate('positions', positions)
    };
    
    const allErrors = Object.values(results).flatMap(r => r.errors);
    const allWarnings = Object.values(results).flatMap(r => r.warnings);
    
    const overallResult = {
      isValid: allErrors.length === 0,
      results,
      summary: {
        totalErrors: allErrors.length,
        totalWarnings: allWarnings.length,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        layerCount: layers.length,
        positionCount: positions instanceof Map ? positions.size : Object.keys(positions).length
      },
      errors: allErrors,
      warnings: allWarnings
    };
    
    console.log('✅ [ValidationEngine] 完整布局验证:', overallResult.isValid ? '通过' : '失败');
    return overallResult;
  }

  /**
   * 生成缓存键
   * @private
   * @param {string} type - 验证类型
   * @param {*} data - 数据
   * @param {Object} context - 上下文
   * @returns {string} 缓存键
   */
  generateCacheKey(type, data, context) {
    const dataHash = this.hashData(data);
    const contextHash = this.hashData(context);
    return `${type}_${dataHash}_${contextHash}`;
  }

  /**
   * 简单数据哈希
   * @private
   * @param {*} data - 数据
   * @returns {string} 哈希值
   */
  hashData(data) {
    return JSON.stringify(data).length.toString(36);
  }

  /**
   * 清除验证缓存
   * @returns {void}
   */
  clearCache() {
    this.validationCache.clear();
    console.log('✅ [ValidationEngine] 验证缓存已清除');
  }

  /**
   * 获取验证统计
   * @returns {Object} 统计信息
   * @returns {number} returns.ruleCount - 规则数量
   * @returns {number} returns.customValidatorCount - 自定义验证器数量
   * @returns {number} returns.cacheSize - 缓存大小
   * @returns {Object} returns.config - 配置信息
   */
  getStats() {
    return {
      ruleCount: this.rules.size,
      customValidatorCount: this.customValidators.size,
      cacheSize: this.validationCache.size,
      config: { ...this.config }
    };
  }

  /**
   * 释放资源（dispose的别名）
   * @returns {void}
   */
  dispose() {
    return this.destroy();
  }

  /**
   * 销毁验证引擎
   * @returns {void}
   */
  destroy() {
    this.rules.clear();
    this.customValidators.clear();
    this.clearCache();
    this.errors = [];
    this.warnings = [];
    
    console.log('✅ [ValidationEngine] 验证引擎已销毁');
  }
}

export default ValidationEngine;