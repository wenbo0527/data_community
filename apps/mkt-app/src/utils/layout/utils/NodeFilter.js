/**
 * 节点过滤器
 * 负责过滤和筛选图形中的节点
 */

/**
 * 节点过滤器类
 */
class NodeFilter {
  constructor(config = {}) {
    this.config = {
      // 默认过滤规则
      excludeTypes: ['preview', 'temp', 'ghost'],
      excludeIds: [],
      includeTypes: null, // null表示包含所有类型
      includeIds: null, // null表示包含所有ID
      
      // 状态过滤
      excludeHidden: true,
      excludeDisabled: false,
      excludeSelected: false,
      
      // 位置过滤
      excludeOutOfBounds: false,
      boundingBox: null, // { x, y, width, height }
      
      // 自定义过滤函数
      customFilters: [],
      
      ...config
    };
    
    this.cache = new Map();
    this.cacheEnabled = true;
    this.statistics = {
      totalFiltered: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
  
  /**
   * 过滤节点数组
   */
  filter(nodes) {
    if (!Array.isArray(nodes)) {
      console.warn('NodeFilter.filter: nodes must be an array');
      return [];
    }
    
    const cacheKey = this.generateCacheKey(nodes);
    
    // 检查缓存
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      this.statistics.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    this.statistics.cacheMisses++;
    
    // 执行过滤
    const filtered = nodes.filter(node => this.shouldIncludeNode(node));
    
    // 更新统计
    this.statistics.totalFiltered += nodes.length - filtered.length;
    
    // 缓存结果
    if (this.cacheEnabled) {
      this.cache.set(cacheKey, filtered);
      
      // 限制缓存大小
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
    }
    
    return filtered;
  }
  
  /**
   * 判断是否应该包含节点
   */
  shouldIncludeNode(node) {
    if (!node) return false;
    
    try {
      // 检查节点ID过滤
      if (!this.checkIdFilter(node)) return false;
      
      // 检查节点类型过滤
      if (!this.checkTypeFilter(node)) return false;
      
      // 检查状态过滤
      if (!this.checkStateFilter(node)) return false;
      
      // 检查位置过滤
      if (!this.checkPositionFilter(node)) return false;
      
      // 检查自定义过滤器
      if (!this.checkCustomFilters(node)) return false;
      
      return true;
    } catch (error) {
      console.warn('NodeFilter.shouldIncludeNode error:', error);
      return false;
    }
  }
  
  /**
   * 检查ID过滤
   */
  checkIdFilter(node) {
    const nodeId = this.getNodeId(node);
    if (!nodeId) return false;
    
    // 检查排除ID列表
    if (this.config.excludeIds.includes(nodeId)) {
      return false;
    }
    
    // 检查包含ID列表
    if (this.config.includeIds && !this.config.includeIds.includes(nodeId)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查类型过滤
   */
  checkTypeFilter(node) {
    const nodeType = this.getNodeType(node);
    
    // 检查排除类型列表
    if (this.config.excludeTypes.includes(nodeType)) {
      return false;
    }
    
    // 检查包含类型列表
    if (this.config.includeTypes && !this.config.includeTypes.includes(nodeType)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查状态过滤
   */
  checkStateFilter(node) {
    // 检查隐藏状态
    if (this.config.excludeHidden && this.isNodeHidden(node)) {
      return false;
    }
    
    // 检查禁用状态
    if (this.config.excludeDisabled && this.isNodeDisabled(node)) {
      return false;
    }
    
    // 检查选中状态
    if (this.config.excludeSelected && this.isNodeSelected(node)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查位置过滤
   */
  checkPositionFilter(node) {
    if (!this.config.excludeOutOfBounds || !this.config.boundingBox) {
      return true;
    }
    
    const position = this.getNodePosition(node);
    if (!position) return true;
    
    const { x, y, width, height } = this.config.boundingBox;
    
    return position.x >= x && 
           position.y >= y && 
           position.x <= x + width && 
           position.y <= y + height;
  }
  
  /**
   * 检查自定义过滤器
   */
  checkCustomFilters(node) {
    for (const filter of this.config.customFilters) {
      if (typeof filter === 'function') {
        try {
          if (!filter(node)) {
            return false;
          }
        } catch (error) {
          console.warn('Custom filter error:', error);
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * 获取节点ID
   */
  getNodeId(node) {
    if (typeof node.id === 'string') return node.id;
    if (typeof node.getId === 'function') return node.getId();
    if (node.data && node.data.id) return node.data.id;
    return null;
  }
  
  /**
   * 获取节点类型
   */
  getNodeType(node) {
    // 尝试多种方式获取节点类型
    if (node.type) return node.type;
    if (typeof node.getType === 'function') return node.getType();
    if (typeof node.getData === 'function') {
      const data = node.getData();
      if (data && data.type) return data.type;
    }
    if (node.data && node.data.type) return node.data.type;
    
    // 根据ID推断类型
    const nodeId = this.getNodeId(node);
    if (nodeId) {
      if (nodeId.includes('start')) return 'start';
      if (nodeId.includes('end')) return 'end';
      if (nodeId.includes('preview')) return 'preview';
      if (nodeId.includes('temp')) return 'temp';
    }
    
    return 'unknown';
  }
  
  /**
   * 获取节点位置
   */
  getNodePosition(node) {
    if (typeof node.getPosition === 'function') {
      return node.getPosition();
    }
    if (node.position) {
      return node.position;
    }
    if (node.x !== undefined && node.y !== undefined) {
      return { x: node.x, y: node.y };
    }
    return null;
  }
  
  /**
   * 检查节点是否隐藏
   */
  isNodeHidden(node) {
    if (typeof node.isVisible === 'function') {
      return !node.isVisible();
    }
    if (node.visible !== undefined) {
      return !node.visible;
    }
    if (node.hidden !== undefined) {
      return node.hidden;
    }
    return false;
  }
  
  /**
   * 检查节点是否禁用
   */
  isNodeDisabled(node) {
    if (typeof node.isEnabled === 'function') {
      return !node.isEnabled();
    }
    if (node.enabled !== undefined) {
      return !node.enabled;
    }
    if (node.disabled !== undefined) {
      return node.disabled;
    }
    return false;
  }
  
  /**
   * 检查节点是否选中
   */
  isNodeSelected(node) {
    if (typeof node.isSelected === 'function') {
      return node.isSelected();
    }
    if (node.selected !== undefined) {
      return node.selected;
    }
    return false;
  }
  
  /**
   * 生成缓存键
   */
  generateCacheKey(nodes) {
    const nodeIds = nodes.map(node => this.getNodeId(node)).sort();
    const configHash = JSON.stringify(this.config);
    return `${nodeIds.join(',')}:${configHash}`;
  }
  
  /**
   * 添加排除类型
   */
  addExcludeType(type) {
    if (!this.config.excludeTypes.includes(type)) {
      this.config.excludeTypes.push(type);
      this.clearCache();
    }
    return this;
  }
  
  /**
   * 移除排除类型
   */
  removeExcludeType(type) {
    const index = this.config.excludeTypes.indexOf(type);
    if (index > -1) {
      this.config.excludeTypes.splice(index, 1);
      this.clearCache();
    }
    return this;
  }
  
  /**
   * 添加排除ID
   */
  addExcludeId(id) {
    if (!this.config.excludeIds.includes(id)) {
      this.config.excludeIds.push(id);
      this.clearCache();
    }
    return this;
  }
  
  /**
   * 移除排除ID
   */
  removeExcludeId(id) {
    const index = this.config.excludeIds.indexOf(id);
    if (index > -1) {
      this.config.excludeIds.splice(index, 1);
      this.clearCache();
    }
    return this;
  }
  
  /**
   * 添加自定义过滤器
   */
  addCustomFilter(filter) {
    if (typeof filter === 'function') {
      this.config.customFilters.push(filter);
      this.clearCache();
    }
    return this;
  }
  
  /**
   * 移除自定义过滤器
   */
  removeCustomFilter(filter) {
    const index = this.config.customFilters.indexOf(filter);
    if (index > -1) {
      this.config.customFilters.splice(index, 1);
      this.clearCache();
    }
    return this;
  }
  
  /**
   * 设置边界框
   */
  setBoundingBox(boundingBox) {
    this.config.boundingBox = boundingBox;
    this.clearCache();
    return this;
  }
  
  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * 启用/禁用缓存
   */
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }
  
  /**
   * 获取统计信息
   */
  getStatistics() {
    return {
      ...this.statistics,
      cacheSize: this.cache.size,
      cacheHitRate: this.statistics.cacheHits / (this.statistics.cacheHits + this.statistics.cacheMisses) || 0
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStatistics() {
    this.statistics = {
      totalFiltered: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
  
  /**
   * 获取配置
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.clearCache();
    return this;
  }
  
  /**
   * 重置配置
   */
  resetConfig() {
    this.config = {
      excludeTypes: ['preview', 'temp', 'ghost'],
      excludeIds: [],
      includeTypes: null,
      includeIds: null,
      excludeHidden: true,
      excludeDisabled: false,
      excludeSelected: false,
      excludeOutOfBounds: false,
      boundingBox: null,
      customFilters: []
    };
    this.clearCache();
    return this;
  }
  
  /**
   * 销毁过滤器
   */
  dispose() {
    this.clearCache();
    this.config = null;
    this.statistics = null;
  }
}

export { NodeFilter };
export default NodeFilter;