/**
 * @fileoverview 位置应用器
 * 负责将计算出的位置应用到图形中，实现位置同步
 * 约150行代码
 */

import { LayoutAlgorithmType, LayoutDirection } from '../types/LayoutTypes.js';
import { NodeType, NodeStatus } from '../types/NodeTypes.js';
import { ConfigLevel, ConfigType, ConfigStatus } from '../types/ConfigTypes.js';

/**
 * 位置应用器类
 * 主要职责：
 * 1. 将计算出的位置应用到图形节点
 * 2. 处理位置同步和更新
 * 3. 管理预览线的清理和验证
 * 4. 提供位置应用的错误处理
 * @class
 */
export class PositionApplicator {
  /**
   * 构造函数
   * @param {ConfigTypes.LayoutConfigType} config - 配置对象
   */
  constructor(config) {
    this.config = config;
    this.appliedCount = 0;
    this.lastApplicationTime = null;
    
    console.log('PositionApplicator initialized');
  }
  
  /**
   * 应用位置到图形
   * @param {Object} context - 应用上下文
   * @param {LayoutTypes.PositionMapType} context.positions - 位置映射
   * @param {Object} context.graph - 图形实例
   * @param {Object} [context.previewLineManager] - 预览线管理器
   * @param {Object} [context.options={}] - 选项
   * @param {boolean} [context.options.clearPreviewLines=true] - 是否清理预览线
   * @param {boolean} [context.options.syncPositions=true] - 是否同步位置
   * @param {boolean} [context.options.verifyPreviewLineCleanup=true] - 是否验证预览线清理
   * @param {Array<string>} [context.options.skipNodeTypes] - 要跳过的节点类型
   * @returns {Promise<Object>} 应用结果
   * @returns {boolean} returns.success - 是否成功
   * @returns {number} returns.appliedNodes - 已应用的节点数
   * @returns {number} returns.skippedNodes - 跳过的节点数
   * @returns {number} returns.totalNodes - 总节点数
   * @returns {Array<Object>} returns.errors - 错误列表
   * @returns {number} returns.duration - 执行时长
   * @returns {number} returns.timestamp - 时间戳
   */
  async applyPositions(context) {
    const { positions, graph, previewLineManager, options = {} } = context;
    
    if (!positions || !graph) {
      throw new Error('Invalid positions or graph provided');
    }
    
    const startTime = Date.now();
    let appliedNodes = 0;
    let skippedNodes = 0;
    const errors = [];
    
    try {
      console.log('Starting position application...');
      
      // 清理预览线（如果需要）
      if (previewLineManager && options.clearPreviewLines !== false) {
        await this.clearPreviewLines(previewLineManager);
      }
      
      // 应用节点位置
      for (const [nodeId, position] of Object.entries(positions)) {
        try {
          const applied = await this.applyNodePosition(graph, nodeId, position, options);
          if (applied) {
            appliedNodes++;
          } else {
            skippedNodes++;
          }
        } catch (error) {
          errors.push({ nodeId, error: error.message });
          console.warn(`Failed to apply position for node ${nodeId}:`, error);
        }
      }
      
      // 同步节点位置（如果需要）
      if (options.syncPositions !== false) {
        await this.syncNodePositions(graph, positions);
      }
      
      // 验证预览线清理（如果需要）
      if (previewLineManager && options.verifyPreviewLineCleanup !== false) {
        await this.verifyPreviewLineCleanup(previewLineManager);
      }
      
      const endTime = Date.now();
      this.lastApplicationTime = endTime - startTime;
      this.appliedCount += appliedNodes;
      
      const result = {
        success: true,
        appliedNodes,
        skippedNodes,
        totalNodes: Object.keys(positions).length,
        errors,
        duration: this.lastApplicationTime,
        timestamp: Date.now()
      };
      
      console.log(`Position application completed: ${appliedNodes} applied, ${skippedNodes} skipped, ${errors.length} errors`);
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      this.lastApplicationTime = endTime - startTime;
      
      console.error('Position application failed:', error);
      throw error;
    }
  }
  
  /**
   * 应用单个节点的位置
   * @param {Object} graph - 图形实例
   * @param {string} nodeId - 节点ID
   * @param {LayoutTypes.PositionType} position - 位置信息
   * @param {Object} [options={}] - 选项
   * @param {Array<string>} [options.skipNodeTypes] - 要跳过的节点类型
   * @returns {Promise<boolean>} 是否成功应用
   */
  async applyNodePosition(graph, nodeId, position, options = {}) {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      console.warn(`Invalid position for node ${nodeId}:`, position);
      return false;
    }
    
    try {
      const node = graph.getCellById(nodeId);
      if (!node) {
        console.warn(`Node ${nodeId} not found in graph`);
        return false;
      }
      
      // 检查节点是否需要跳过
      if (this.shouldSkipNode(node, options)) {
        return false;
      }
      
      // 应用位置
      const currentPosition = node.getPosition();
      const newPosition = {
        x: Math.round(position.x),
        y: Math.round(position.y)
      };
      
      // 检查位置是否有变化
      if (currentPosition.x === newPosition.x && currentPosition.y === newPosition.y) {
        return false; // 位置没有变化，跳过
      }
      
      // 设置新位置
      node.setPosition(newPosition.x, newPosition.y);
      
      return true;
      
    } catch (error) {
      console.error(`Error applying position to node ${nodeId}:`, error);
      throw error;
    }
  }
  
  /**
   * 检查节点是否应该跳过位置应用
   * @param {Object} node - 节点对象
   * @param {Object} [options={}] - 选项
   * @param {Array<string>} [options.skipNodeTypes] - 要跳过的节点类型
   * @returns {boolean} 是否跳过
   */
  shouldSkipNode(node, options) {
    const nodeId = node.id || node.getId();
    const nodeData = node.getData() || {};
    
    // 跳过提示节点
    if (nodeId.includes('hint') || nodeId.startsWith('hint_')) {
      return true;
    }
    
    // 跳过端点节点
    if (nodeData.isEndpoint) {
      return true;
    }
    
    // 跳过预览节点
    if (nodeData.isPreview) {
      return true;
    }
    
    // 根据选项跳过特定类型的节点
    if (options.skipNodeTypes && options.skipNodeTypes.includes(nodeData.type)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 同步节点位置
   * @param {Object} graph - 图形实例
   * @param {LayoutTypes.PositionMapType} positions - 位置映射
   * @returns {Promise<void>}
   */
  async syncNodePositions(graph, positions) {
    try {
      console.log('Syncing node positions...');
      
      // 这里可以添加额外的同步逻辑
      // 例如：更新相关的边、连接点等
      
      // 触发图形更新事件
      if (graph.trigger) {
        graph.trigger('node:positions:updated', { positions });
      }
      
    } catch (error) {
      console.warn('Node position sync failed:', error);
    }
  }
  
  /**
   * 清理预览线
   * @param {Object} previewLineManager - 预览线管理器
   * @returns {Promise<void>}
   */
  async clearPreviewLines(previewLineManager) {
    try {
      if (previewLineManager && typeof previewLineManager.clearAllPreviewLines === 'function') {
        await previewLineManager.clearAllPreviewLines();
        console.log('Preview lines cleared');
      }
    } catch (error) {
      console.warn('Failed to clear preview lines:', error);
    }
  }
  
  /**
   * 验证预览线清理
   * @param {Object} previewLineManager - 预览线管理器
   * @returns {Promise<void>}
   */
  async verifyPreviewLineCleanup(previewLineManager) {
    try {
      if (previewLineManager && typeof previewLineManager.verifyCleanup === 'function') {
        const isClean = await previewLineManager.verifyCleanup();
        if (!isClean) {
          console.warn('Preview line cleanup verification failed');
        }
      }
    } catch (error) {
      console.warn('Preview line cleanup verification error:', error);
    }
  }
  
  /**
   * 获取应用统计信息
   * @returns {Object} 统计信息
   * @returns {number} returns.appliedCount - 已应用的节点总数
   * @returns {number|null} returns.lastApplicationTime - 最后一次应用的时长
   * @returns {number} returns.averageApplicationTime - 平均应用时长
   */
  getStatistics() {
    return {
      appliedCount: this.appliedCount,
      lastApplicationTime: this.lastApplicationTime,
      averageApplicationTime: this.appliedCount > 0 ? this.lastApplicationTime / this.appliedCount : 0
    };
  }
  
  /**
   * 重置统计信息
   * @returns {void}
   */
  resetStatistics() {
    this.appliedCount = 0;
    this.lastApplicationTime = null;
  }
}

export default PositionApplicator;