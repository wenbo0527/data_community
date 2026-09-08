/**
 * 边过滤器
 * 负责过滤和筛选图形中的边
 */

/**
 * 边过滤器类
 */
class EdgeFilter {
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
      
      // 连接过滤
      excludeDisconnected: false, // 排除断开连接的边
      excludeSelfLoops: false, // 排除自环边
      excludeInvalidConnections: true, // 排除无效连接
      
      // 节点过滤（基于连接的节点）
      excludeIfSourceFiltered: true, // 如果源节点被过滤则排除
      excludeIfTargetFiltered: true, // 如果目标节点被过滤则排除
      
      // 自定义过滤函数
      customFilters: [],
      
      ...config
    };
    
    this.cache = new Map();
    this.cacheEnabled = true;
    this.nodeFilter = null; // 可选的节点过滤器引用
    this.statistics = {
      totalFiltered: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
  
  /**
   * 设置节点过滤器
   */
  setNodeFilter(nodeFilter) {
    this.nodeFilter = nodeFilter;
    this.clearCache();
    return this;
  }
  
  /**
   * 过滤边数组
   */
  filter(edges, nodes = null) {
    if (!Array.isArray(edges)) {
      console.warn('EdgeFilter.filter: edges must be an array');
      return [];
    }
    
    const cacheKey = this.generateCacheKey(edges, nodes);
    
    // 检查缓存
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      this.statistics.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    this.statistics.cacheMisses++;
    
    // 执行过滤
    const filtered = edges.filter(edge => this.shouldIncludeEdge(edge, nodes));
    
    // 更新统计
    this.statistics.totalFiltered += edges.length - filtered.length;
    
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
   * 判断是否应该包含边
   */
  shouldIncludeEdge(edge, nodes = null) {
    if (!edge) return false;
    
    try {
      // 检查边ID过滤
      if (!this.checkIdFilter(edge)) return false;
      
      // 检查边类型过滤
      if (!this.checkTypeFilter(edge)) return false;
      
      // 检查状态过滤
      if (!this.checkStateFilter(edge)) return false;
      
      // 检查连接过滤
      if (!this.checkConnectionFilter(edge, nodes)) return false;
      
      // 检查节点过滤
      if (!this.checkNodeFilter(edge, nodes)) return false;
      
      // 检查自定义过滤器
      if (!this.checkCustomFilters(edge)) return false;
      
      return true;
    } catch (error) {
      console.warn('EdgeFilter.shouldIncludeEdge error:', error);
      return false;
    }
  }
  
  /**
   * 检查ID过滤
   */
  checkIdFilter(edge) {
    const edgeId = this.getEdgeId(edge);
    if (!edgeId) return false;
    
    // 检查排除ID列表
    if (this.config.excludeIds.includes(edgeId)) {
      return false;
    }
    
    // 检查包含ID列表
    if (this.config.includeIds && !this.config.includeIds.includes(edgeId)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查类型过滤
   */
  checkTypeFilter(edge) {
    const edgeType = this.getEdgeType(edge);
    
    // 检查排除类型列表
    if (this.config.excludeTypes.includes(edgeType)) {
      return false;
    }
    
    // 检查包含类型列表
    if (this.config.includeTypes && !this.config.includeTypes.includes(edgeType)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查状态过滤
   */
  checkStateFilter(edge) {
    // 检查隐藏状态
    if (this.config.excludeHidden && this.isEdgeHidden(edge)) {
      return false;
    }
    
    // 检查禁用状态
    if (this.config.excludeDisabled && this.isEdgeDisabled(edge)) {
      return false;
    }
    
    // 检查选中状态
    if (this.config.excludeSelected && this.isEdgeSelected(edge)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查连接过滤
   */
  checkConnectionFilter(edge, nodes) {
    const sourceId = this.getSourceId(edge);
    const targetId = this.getTargetId(edge);
    
    // 检查无效连接
    if (this.config.excludeInvalidConnections) {
      if (!sourceId || !targetId) {
        return false;
      }
    }
    
    // 检查自环边
    if (this.config.excludeSelfLoops && sourceId === targetId) {
      return false;
    }
    
    // 检查断开连接
    if (this.config.excludeDisconnected && nodes) {
      const sourceExists = nodes.some(node => this.getNodeId(node) === sourceId);
      const targetExists = nodes.some(node => this.getNodeId(node) === targetId);
      
      if (!sourceExists || !targetExists) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 检查节点过滤
   */
  checkNodeFilter(edge, nodes) {
    if (!this.nodeFilter || !nodes) {
      return true;
    }
    
    const sourceId = this.getSourceId(edge);
    const targetId = this.getTargetId(edge);
    
    // 获取源节点和目标节点
    const sourceNode = nodes.find(node => this.getNodeId(node) === sourceId);
    const targetNode = nodes.find(node => this.getNodeId(node) === targetId);
    
    // 检查源节点是否被过滤
    if (this.config.excludeIfSourceFiltered && sourceNode) {
      if (!this.nodeFilter.shouldIncludeNode(sourceNode)) {
        return false;
      }
    }
    
    // 检查目标节点是否被过滤
    if (this.config.excludeIfTargetFiltered && targetNode) {
      if (!this.nodeFilter.shouldIncludeNode(targetNode)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 检查自定义过滤器
   */
  checkCustomFilters(edge) {
    for (const filter of this.config.customFilters) {
      if (typeof filter === 'function') {
        try {
          if (!filter(edge)) {
            return false;
          }
        } catch (error) {
          console.warn('Custom edge filter error:', error);
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * 获取边ID
   */
  getEdgeId(edge) {
    if (typeof edge.id === 'string') return edge.id;
    if (typeof edge.getId === 'function') return edge.getId();
    if (edge.data && edge.data.id) return edge.data.id;
    return null;
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
   * 获取边类型
   */
  getEdgeType(edge) {
    // 尝试多种方式获取边类型
    if (edge.type) return edge.type;
    if (typeof edge.getType === 'function') return edge.getType();
    if (typeof edge.getData === 'function') {
      const data = edge.getData();
      if (data && data.type) return data.type;
    }
    if (edge.data && edge.data.type) return edge.data.type;
    
    // 根据ID推断类型
    const edgeId = this.getEdgeId(edge);
    if (edgeId) {
      if (edgeId.includes('preview')) return 'preview';
      if (edgeId.includes('temp')) return 'temp';
      if (edgeId.includes('ghost')) return 'ghost';
    }
    
    return 'unknown';
  }
  
  /**
   * 获取源节点ID
   */
  getSourceId(edge) {
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
    if (edge.sourceId) return edge.sourceId;
    return null;
  }
  
  /**
   * 获取目标节点ID
   */
  getTargetId(edge) {
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
    if (edge.targetId) return edge.targetId;
    return null;
  }
  
  /**
   * 检查边是否隐藏
   */
  isEdgeHidden(edge) {
    if (typeof edge.isVisible === 'function') {
      return !edge.isVisible();
    }
    if (edge.visible !== undefined) {
      return !edge.visible;
    }
    if (edge.hidden !== undefined) {
      return edge.hidden;
    }
    return false;
  }
  
  /**
   * 检查边是否禁用
   */
  isEdgeDisabled(edge) {
    if (typeof edge.isEnabled === 'function') {
      return !edge.isEnabled();
    }
    if (edge.enabled !== undefined) {
      return !edge.enabled;
    }
    if (edge.disabled !== undefined) {
      return edge.disabled;
    }
    return false;
  }
  
  /**
   * 检查边是否选中
   */
  isEdgeSelected(edge) {
    if (typeof edge.isSelected === 'function') {
      return edge.isSelected();
    }
    if (edge.selected !== undefined) {
      return edge.selected;
    }
    return false;
  }
  
  /**
   * 生成缓存键
   */
  generateCacheKey(edges, nodes) {
    const edgeIds = edges.map(edge => this.getEdgeId(edge)).sort();
    const nodeIds = nodes ? nodes.map(node => this.getNodeId(node)).sort() : [];
    const configHash = JSON.stringify(this.config);
    return `edges:${edgeIds.join(',')}:nodes:${nodeIds.join(',')}:${configHash}`;
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
      excludeDisconnected: false,
      excludeSelfLoops: false,
      excludeInvalidConnections: true,
      excludeIfSourceFiltered: true,
      excludeIfTargetFiltered: true,
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
    this.nodeFilter = null;
    this.config = null;
    this.statistics = null;
  }
}

export { EdgeFilter };
export default EdgeFilter;