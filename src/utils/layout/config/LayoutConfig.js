/**
 * 布局配置管理器
 * 负责管理布局引擎的所有配置参数
 */

/**
 * 默认布局配置
 */
const DEFAULT_LAYOUT_CONFIG = {
  // 基础布局参数
  baseHeight: 120,
  baseWidth: 200,
  horizontalSpacing: 300,
  verticalSpacing: 150,
  
  // 节点类型配置
  nodeTypes: {
    start: { width: 200, height: 120, color: '#52c41a' },
    process: { width: 200, height: 120, color: '#1890ff' },
    decision: { width: 200, height: 120, color: '#faad14' },
    end: { width: 200, height: 120, color: '#f5222d' },
    default: { width: 200, height: 120, color: '#d9d9d9' }
  },
  
  // 布局算法配置
  algorithm: {
    type: 'hierarchical', // hierarchical, force, circular
    direction: 'TB', // TB, BT, LR, RL
    rankSep: 150,
    nodeSep: 100,
    edgeSep: 10,
    ranker: 'network-simplex' // network-simplex, tight-tree, longest-path
  },
  
  // 层级计算配置
  layerCalculation: {
    startNodeLayer: 0,
    defaultLayer: 2,
    maxLayers: 20,
    layerHeight: 150,
    autoAdjustLayers: true
  },
  
  // 位置计算配置
  positioning: {
    centerAlignment: true,
    autoSpacing: true,
    minSpacing: 50,
    maxSpacing: 500,
    preserveUserPositions: false
  },
  
  // 动画配置
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
    stagger: 50
  },
  
  // 调试配置
  debug: {
    enabled: false,
    logLevel: 'info', // debug, info, warn, error
    showBoundingBoxes: false,
    showLayerLines: false
  }
};

/**
 * 布局配置管理器类
 */
class LayoutConfig {
  constructor(customConfig = {}) {
    this.config = this.mergeConfig(DEFAULT_LAYOUT_CONFIG, customConfig);
    this.listeners = new Map();
    this.version = '1.0.0';
  }
  
  /**
   * 深度合并配置对象
   */
  mergeConfig(defaultConfig, customConfig) {
    const merged = { ...defaultConfig };
    
    for (const key in customConfig) {
      if (customConfig.hasOwnProperty(key)) {
        if (typeof customConfig[key] === 'object' && 
            customConfig[key] !== null && 
            !Array.isArray(customConfig[key])) {
          merged[key] = this.mergeConfig(merged[key] || {}, customConfig[key]);
        } else {
          merged[key] = customConfig[key];
        }
      }
    }
    
    return merged;
  }
  
  /**
   * 获取配置值
   */
  get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }
  
  /**
   * 设置配置值
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.config;
    
    // 创建嵌套对象路径
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    // 触发配置变更事件
    this.notifyListeners(path, value, oldValue);
    
    return this;
  }
  
  /**
   * 批量更新配置
   */
  update(updates) {
    const changes = [];
    
    for (const [path, value] of Object.entries(updates)) {
      const oldValue = this.get(path);
      this.set(path, value);
      changes.push({ path, value, oldValue });
    }
    
    // 触发批量更新事件
    this.notifyListeners('batch-update', changes);
    
    return this;
  }
  
  /**
   * 重置配置到默认值
   */
  reset(path = null) {
    if (path) {
      const defaultValue = this.getDefaultValue(path);
      this.set(path, defaultValue);
    } else {
      this.config = { ...DEFAULT_LAYOUT_CONFIG };
      this.notifyListeners('reset', this.config);
    }
    
    return this;
  }
  
  /**
   * 获取默认配置值
   */
  getDefaultValue(path) {
    const keys = path.split('.');
    let current = DEFAULT_LAYOUT_CONFIG;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
  
  /**
   * 获取完整配置对象
   */
  getAll() {
    return { ...this.config };
  }
  
  /**
   * 验证配置
   */
  validate() {
    const errors = [];
    
    // 验证基础参数
    if (this.get('baseHeight') <= 0) {
      errors.push('baseHeight must be greater than 0');
    }
    
    if (this.get('baseWidth') <= 0) {
      errors.push('baseWidth must be greater than 0');
    }
    
    // 验证间距参数
    if (this.get('horizontalSpacing') < 0) {
      errors.push('horizontalSpacing must be non-negative');
    }
    
    if (this.get('verticalSpacing') < 0) {
      errors.push('verticalSpacing must be non-negative');
    }
    
    // 验证算法配置
    const validAlgorithms = ['hierarchical', 'force', 'circular'];
    if (!validAlgorithms.includes(this.get('algorithm.type'))) {
      errors.push(`algorithm.type must be one of: ${validAlgorithms.join(', ')}`);
    }
    
    const validDirections = ['TB', 'BT', 'LR', 'RL'];
    if (!validDirections.includes(this.get('algorithm.direction'))) {
      errors.push(`algorithm.direction must be one of: ${validDirections.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 添加配置变更监听器
   */
  addListener(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path).add(callback);
    
    // 返回取消监听的函数
    return () => {
      const pathListeners = this.listeners.get(path);
      if (pathListeners) {
        pathListeners.delete(callback);
        if (pathListeners.size === 0) {
          this.listeners.delete(path);
        }
      }
    };
  }
  
  /**
   * 移除配置变更监听器
   */
  removeListener(path, callback) {
    const pathListeners = this.listeners.get(path);
    if (pathListeners) {
      pathListeners.delete(callback);
      if (pathListeners.size === 0) {
        this.listeners.delete(path);
      }
    }
  }
  
  /**
   * 通知监听器
   */
  notifyListeners(path, newValue, oldValue) {
    const pathListeners = this.listeners.get(path);
    if (pathListeners) {
      pathListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.warn(`LayoutConfig listener error for path '${path}':`, error);
        }
      });
    }
    
    // 通知通用监听器
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.warn(`LayoutConfig global listener error:`, error);
        }
      });
    }
  }
  
  /**
   * 导出配置为JSON
   */
  toJSON() {
    return {
      version: this.version,
      config: this.config,
      timestamp: Date.now()
    };
  }
  
  /**
   * 从JSON导入配置
   */
  fromJSON(json) {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      
      if (data.config) {
        this.config = this.mergeConfig(DEFAULT_LAYOUT_CONFIG, data.config);
        this.notifyListeners('import', this.config);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import config from JSON:', error);
      return false;
    }
  }
  
  /**
   * 克隆配置管理器
   */
  clone() {
    return new LayoutConfig(this.config);
  }
  
  /**
   * 销毁配置管理器
   */
  dispose() {
    this.listeners.clear();
    this.config = null;
  }
}

export { LayoutConfig, DEFAULT_LAYOUT_CONFIG };
export default LayoutConfig;