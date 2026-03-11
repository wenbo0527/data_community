/**
 * 布局数据模型
 * 负责布局数据的结构化管理、状态维护和数据验证
 * 约200行代码
 */

// 导入类型定义
import { LayoutLayerType, PointType } from '../types/LayoutTypes.js';
import { NodeDataType } from '../types/NodeTypes.js';
import { EdgeDataType } from '../types/EdgeTypes.js';

/**
 * 布局数据模型类
 * 主要职责：
 * 1. 布局数据结构化管理
 * 2. 布局状态维护
 * 3. 数据变更追踪
 * 4. 数据验证和完整性检查
 * @class LayoutModel
 */
export class LayoutModel {
  /**
   * 构造函数
   * @param {Object} [initialData={}] - 初始数据
   * @param {Array} [initialData.nodes=[]] - 初始节点数据
   * @param {Array} [initialData.edges=[]] - 初始边数据
   * @param {Array} [initialData.layers=[]] - 初始层级数据
   * @param {Map|Object} [initialData.positions] - 初始位置数据
   * @param {Object} [initialData.config={}] - 初始配置
   * @param {Object} [initialData.constraints={}] - 初始约束
   */
  constructor(initialData = {}) {
    // 布局数据
    this.nodes = initialData.nodes || [];
    this.edges = initialData.edges || [];
    this.layers = initialData.layers || [];
    this.positions = initialData.positions || new Map();
    
    // 布局配置
    this.config = initialData.config || {};
    this.constraints = initialData.constraints || {};
    
    // 状态管理
    this.version = 0;
    this.isDirty = false;
    this.lastModified = Date.now();
    this.changeHistory = [];
    
    // 缓存管理
    this.cache = new Map();
    this.cacheVersion = 0;
    
    // 事件监听器
    this.listeners = new Map();
    
    console.log('📊 [LayoutModel] 初始化完成，节点数:', this.nodes.length);
  }

  /**
   * 设置节点数据
   * @param {Array} nodes - 节点数组
   * @returns {void}
   */
  setNodes(nodes) {
    const oldNodes = this.nodes;
    this.nodes = Array.isArray(nodes) ? [...nodes] : [];
    
    this.recordChange('nodes', oldNodes, this.nodes);
    this.invalidateCache();
    this.emit('nodesChanged', { oldNodes, newNodes: this.nodes });
    
    console.log('📊 [LayoutModel] 节点数据已更新，数量:', this.nodes.length);
  }

  /**
   * 设置边数据
   * @param {Array} edges - 边数组
   * @returns {void}
   */
  setEdges(edges) {
    const oldEdges = this.edges;
    this.edges = Array.isArray(edges) ? [...edges] : [];
    
    this.recordChange('edges', oldEdges, this.edges);
    this.invalidateCache();
    this.emit('edgesChanged', { oldEdges, newEdges: this.edges });
    
    console.log('📊 [LayoutModel] 边数据已更新，数量:', this.edges.length);
  }

  /**
   * 设置层级数据
   * @param {Array} layers - 层级数组
   * @returns {void}
   */
  setLayers(layers) {
    const oldLayers = this.layers;
    this.layers = Array.isArray(layers) ? [...layers] : [];
    
    this.recordChange('layers', oldLayers, this.layers);
    this.invalidateCache();
    this.emit('layersChanged', { oldLayers, newLayers: this.layers });
    
    console.log('📊 [LayoutModel] 层级数据已更新，层数:', this.layers.length);
  }

  /**
   * 设置位置数据
   * @param {Map|Object} positions - 位置数据
   * @returns {void}
   */
  setPositions(positions) {
    const oldPositions = new Map(this.positions);
    
    if (positions instanceof Map) {
      this.positions = new Map(positions);
    } else if (typeof positions === 'object') {
      this.positions = new Map(Object.entries(positions));
    } else {
      this.positions = new Map();
    }
    
    this.recordChange('positions', oldPositions, this.positions);
    this.invalidateCache();
    this.emit('positionsChanged', { oldPositions, newPositions: this.positions });
    
    console.log('📊 [LayoutModel] 位置数据已更新，节点数:', this.positions.size);
  }

  /**
   * 更新单个节点位置
   * @param {string} nodeId - 节点ID
   * @param {Object} position - 位置信息
   * @param {number} position.x - X坐标
   * @param {number} position.y - Y坐标
   * @returns {void}
   */
  updateNodePosition(nodeId, position) {
    if (!nodeId || !position) return;
    
    const oldPosition = this.positions.get(nodeId);
    this.positions.set(nodeId, { ...position });
    
    this.recordChange('nodePosition', { nodeId, oldPosition }, { nodeId, newPosition: position });
    this.invalidateCache(['nodePositions']);
    this.emit('nodePositionChanged', { nodeId, oldPosition, newPosition: position });
  }

  /**
   * 获取节点位置
   * @param {string} nodeId - 节点ID
   * @returns {Object|null} 位置信息
   * @returns {number} returns.x - X坐标
   * @returns {number} returns.y - Y坐标
   */
  getNodePosition(nodeId) {
    return this.positions.get(nodeId) || null;
  }

  /**
   * 获取所有位置数据
   * @returns {Map<string, Object>} 位置映射，键为节点ID，值为位置对象
   */
  getAllPositions() {
    return new Map(this.positions);
  }

  /**
   * 验证数据完整性
   * @returns {Object} 验证结果
   * @returns {boolean} returns.isValid - 数据是否有效
   * @returns {Array} returns.issues - 问题列表
   * @returns {Object} returns.summary - 数据摘要
   * @returns {number} returns.summary.nodeCount - 节点数量
   * @returns {number} returns.summary.edgeCount - 边数量
   * @returns {number} returns.summary.layerCount - 层级数量
   * @returns {number} returns.summary.positionCount - 位置数量
   */
  validateData() {
    const issues = [];
    
    // 验证节点数据
    if (!Array.isArray(this.nodes)) {
      issues.push({ type: 'invalid_nodes', message: '节点数据必须是数组' });
    } else {
      this.nodes.forEach((node, index) => {
        if (!node || (!node.id && !node.getId)) {
          issues.push({ type: 'invalid_node', index, message: '节点缺少有效ID' });
        }
      });
    }
    
    // 验证边数据
    if (!Array.isArray(this.edges)) {
      issues.push({ type: 'invalid_edges', message: '边数据必须是数组' });
    } else {
      this.edges.forEach((edge, index) => {
        if (!edge || (!edge.source && !edge.getSourceCellId)) {
          issues.push({ type: 'invalid_edge', index, message: '边缺少源节点' });
        }
        if (!edge || (!edge.target && !edge.getTargetCellId)) {
          issues.push({ type: 'invalid_edge', index, message: '边缺少目标节点' });
        }
      });
    }
    
    // 验证层级数据
    if (!Array.isArray(this.layers)) {
      issues.push({ type: 'invalid_layers', message: '层级数据必须是数组' });
    }
    
    const isValid = issues.length === 0;
    console.log(`📊 [LayoutModel] 数据验证${isValid ? '通过' : '失败'}，问题数:`, issues.length);
    
    return {
      isValid,
      issues,
      summary: {
        nodeCount: this.nodes.length,
        edgeCount: this.edges.length,
        layerCount: this.layers.length,
        positionCount: this.positions.size
      }
    };
  }

  /**
   * 记录数据变更
   * @param {string} type - 变更类型
   * @param {*} oldValue - 旧值
   * @param {*} newValue - 新值
   * @returns {void}
   */
  recordChange(type, oldValue, newValue) {
    this.version++;
    this.isDirty = true;
    this.lastModified = Date.now();
    
    const change = {
      type,
      timestamp: this.lastModified,
      version: this.version,
      oldValue: this.cloneValue(oldValue),
      newValue: this.cloneValue(newValue)
    };
    
    this.changeHistory.push(change);
    
    // 限制历史记录数量
    if (this.changeHistory.length > 100) {
      this.changeHistory = this.changeHistory.slice(-50);
    }
  }

  /**
   * 克隆值（用于历史记录）
   * @param {*} value - 要克隆的值
   * @returns {*} 克隆后的值
   */
  cloneValue(value) {
    if (value instanceof Map) {
      return new Map(value);
    } else if (Array.isArray(value)) {
      return [...value];
    } else if (typeof value === 'object' && value !== null) {
      return { ...value };
    }
    return value;
  }

  /**
   * 使缓存失效
   * @param {Array<string>|null} [keys=null] - 要失效的缓存键（可选）
   * @returns {void}
   */
  invalidateCache(keys = null) {
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
      this.cacheVersion++;
    }
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {*} 缓存值，如果不存在则返回undefined
   */
  getCache(key) {
    return this.cache.get(key);
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @returns {void}
   */
  setCache(key, value) {
    this.cache.set(key, value);
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   * @returns {void}
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   * @returns {void}
   */
  off(event, listener) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @returns {void}
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`📊 [LayoutModel] 事件监听器错误 [${event}]:`, error);
        }
      });
    }
  }

  /**
   * 获取模型状态
   * @returns {Object} 状态信息
   * @returns {number} returns.version - 版本号
   * @returns {boolean} returns.isDirty - 是否有未保存的更改
   * @returns {number} returns.lastModified - 最后修改时间戳
   * @returns {number} returns.cacheVersion - 缓存版本号
   * @returns {number} returns.cacheSize - 缓存大小
   * @returns {number} returns.changeHistorySize - 变更历史大小
   * @returns {number} returns.listenerCount - 监听器数量
   */
  getStatus() {
    return {
      version: this.version,
      isDirty: this.isDirty,
      lastModified: this.lastModified,
      cacheVersion: this.cacheVersion,
      cacheSize: this.cache.size,
      changeHistorySize: this.changeHistory.length,
      listenerCount: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0)
    };
  }

  /**
   * 重置模型状态
   * @returns {void}
   */
  reset() {
    this.nodes = [];
    this.edges = [];
    this.layers = [];
    this.positions.clear();
    this.cache.clear();
    this.changeHistory = [];
    this.version = 0;
    this.isDirty = false;
    this.cacheVersion = 0;
    this.lastModified = Date.now();
    
    this.emit('modelReset', {});
    console.log('📊 [LayoutModel] 模型已重置');
  }

  /**
   * 销毁模型
   * @returns {void}
   */
  destroy() {
    this.reset();
    this.listeners.clear();
    console.log('📊 [LayoutModel] 模型已销毁');
  }

  /**
   * 释放资源（dispose的别名）
   * @returns {void}
   */
  dispose() {
    this.destroy();
  }
}

export default LayoutModel;