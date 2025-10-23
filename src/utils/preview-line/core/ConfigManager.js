/**
 * 配置管理器
 * 提供预览线系统的配置管理、动态配置和配置验证功能
 */

import EventManager from '../events/EventManager.js';

export class ConfigManager {
  constructor(options = {}) {
    // 事件管理器
    this.eventManager = new EventManager();

    // 默认配置
    this.defaultConfig = {
      // 渲染配置
      rendering: {
        enableBatching: true,
        batchSize: 50,
        frameRate: 60,
        enableOptimization: true,
        optimizationLevel: 'auto', // 'none', 'basic', 'auto', 'aggressive'
        enableCaching: true,
        cacheSize: 1000,
        enableWebGL: false,
        enableOffscreen: false
      },

      // 样式配置
      style: {
        // 默认样式
        default: {
          stroke: '#1890ff',
          strokeWidth: 2,
          strokeDasharray: '',
          opacity: 1,
          cursor: 'pointer'
        },
        
        // 状态样式
        states: {
          interactive: {
            stroke: '#40a9ff',
            strokeWidth: 2,
            opacity: 0.8,
            cursor: 'pointer'
          },
          dragging: {
            stroke: '#ff7875',
            strokeWidth: 3,
            strokeDasharray: '5,5',
            opacity: 0.9,
            cursor: 'grabbing'
          },
          connected: {
            stroke: '#52c41a',
            strokeWidth: 2,
            opacity: 1,
            cursor: 'default'
          },
          hover: {
            stroke: '#722ed1',
            strokeWidth: 3,
            opacity: 1,
            cursor: 'pointer'
          },
          error: {
            stroke: '#ff4d4f',
            strokeWidth: 2,
            strokeDasharray: '3,3',
            opacity: 0.8,
            cursor: 'not-allowed'
          }
        },
        
        // 节点类型颜色
        nodeTypes: {
          input: '#1890ff',
          output: '#52c41a',
          process: '#722ed1',
          decision: '#fa8c16',
          data: '#13c2c2',
          default: '#8c8c8c'
        },
        
        // 标签样式
        label: {
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          color: '#262626',
          backgroundColor: '#ffffff',
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid #d9d9d9',
          maxWidth: 120,
          textAlign: 'center'
        }
      },

      // 交互配置
      interaction: {
        enableDrag: true,
        enableHover: true,
        enableClick: true,
        enableKeyboard: true,
        
        // 拖拽配置
        drag: {
          threshold: 5,
          enableSnap: true,
          snapDistance: 10,
          enableConstraints: true,
          enableInertia: false
        },
        
        // 悬停配置
        hover: {
          delay: 200,
          enableTooltip: true,
          tooltipDelay: 500
        },
        
        // 选择配置
        selection: {
          enableMultiple: true,
          enableRectSelect: true,
          enableCtrlClick: true
        }
      },

      // 布局配置
      layout: {
        // 自动布局
        autoLayout: {
          enabled: false,
          algorithm: 'force', // 'force', 'hierarchical', 'circular'
          spacing: 50,
          iterations: 100
        },
        
        // 网格配置
        grid: {
          enabled: true,
          size: 20,
          color: '#f0f0f0',
          opacity: 0.5
        },
        
        // 缩放配置
        zoom: {
          min: 0.1,
          max: 5,
          step: 0.1,
          enableWheel: true,
          enablePinch: true
        },
        
        // 平移配置
        pan: {
          enabled: true,
          enableBoundary: true,
          boundary: { x: [-5000, 5000], y: [-5000, 5000] }
        }
      },

      // 性能配置
      performance: {
        // 虚拟化
        virtualization: {
          enabled: false,
          threshold: 1000,
          bufferSize: 100
        },
        
        // 防抖节流
        debounce: {
          render: 16,
          resize: 100,
          scroll: 16
        },
        
        // 内存管理
        memory: {
          enableGC: true,
          gcInterval: 30000,
          maxCacheSize: 10000
        },
        
        // 监控
        monitoring: {
          enabled: false,
          interval: 1000,
          enableFPS: true,
          enableMemory: true
        }
      },

      // 算法配置
      algorithms: {
        // 位置计算
        position: {
          precision: 2,
          enableCache: true,
          cacheTimeout: 5000
        },
        
        // 碰撞检测
        collision: {
          algorithm: 'spatial-hash', // 'brute-force', 'spatial-hash', 'quad-tree'
          threshold: 5,
          enableOptimization: true
        },
        
        // 路径计算
        pathfinding: {
          algorithm: 'astar', // 'astar', 'dijkstra', 'manhattan'
          heuristic: 'manhattan',
          enableSmoothing: true
        }
      },

      // 调试配置
      debug: {
        enabled: false,
        level: 'info', // 'error', 'warn', 'info', 'debug'
        enableConsole: true,
        enableStats: false,
        enableProfiler: false,
        showBounds: false,
        showGrid: false,
        showFPS: false
      },

      // 插件配置
      plugins: {
        enabled: [],
        disabled: [],
        config: {}
      }
    };

    // 当前配置
    this.config = this.deepClone(this.defaultConfig);
    
    // 配置历史
    this.configHistory = [];
    this.maxHistorySize = 50;
    
    // 配置验证器
    this.validators = new Map();
    
    // 配置监听器
    this.watchers = new Map();
    
    // 配置锁定状态
    this.locked = new Set();
    
    // 环境配置
    this.environments = new Map();
    
    // 配置统计
    this.stats = {
      changes: 0,
      validations: 0,
      errors: 0,
      loads: 0,
      saves: 0
    };

    // 应用选项
    this.applyOptions(options);
    
    // 注册内置验证器
    this.registerBuiltinValidators();
  }

  /**
   * 应用初始选项
   * @param {Object} options - 选项
   */
  applyOptions(options) {
    if (options && typeof options === 'object') {
      this.merge(options);
    }
  }

  /**
   * 获取配置值
   * @param {string} path - 配置路径
   * @param {*} defaultValue - 默认值
   * @returns {*} 配置值
   */
  get(path, defaultValue) {
    if (!path) {
      return this.deepClone(this.config);
    }
    
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current !== undefined ? this.deepClone(current) : defaultValue;
  }

  /**
   * 设置配置值
   * @param {string|Object} pathOrConfig - 配置路径或配置对象
   * @param {*} value - 配置值
   * @param {Object} options - 选项
   * @returns {boolean} 是否设置成功
   */
  set(pathOrConfig, value, options = {}) {
    const {
      validate = true,
      silent = false,
      force = false,
      saveHistory = true
    } = options;

    try {
      let changes;
      
      if (typeof pathOrConfig === 'string') {
        // 路径方式设置
        if (this.isLocked(pathOrConfig) && !force) {
          throw new Error(`配置路径已锁定: ${pathOrConfig}`);
        }
        
        changes = this.setByPath(pathOrConfig, value);
      } else {
        // 对象方式设置
        changes = this.setByObject(pathOrConfig, { force });
      }
      
      if (!changes || Object.keys(changes).length === 0) {
        return false;
      }
      
      // 验证配置
      if (validate && !this.validateChanges(changes)) {
        return false;
      }
      
      // 保存历史
      if (saveHistory) {
        this.saveToHistory();
      }
      
      // 应用变化
      this.applyChanges(changes);
      
      // 更新统计
      this.stats.changes++;
      
      // 触发事件
      if (!silent) {
        this.notifyWatchers(changes);
        this.eventManager.emit('config:changed', changes, this.config);
      }
      
      return true;
    } catch (error) {
      this.stats.errors++;
      this.handleError(error, 'set');
      return false;
    }
  }

  /**
   * 通过路径设置配置
   * @param {string} path - 配置路径
   * @param {*} value - 配置值
   * @returns {Object} 变化对象
   */
  setByPath(path, value) {
    const keys = path.split('.');
    const changes = {};
    
    // 获取当前值
    const currentValue = this.get(path);
    
    // 检查是否有变化
    if (this.isEqual(currentValue, value)) {
      return {};
    }
    
    // 构建变化对象
    let current = changes;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    return changes;
  }

  /**
   * 通过对象设置配置
   * @param {Object} configObject - 配置对象
   * @param {Object} options - 选项
   * @returns {Object} 变化对象
   */
  setByObject(configObject, options = {}) {
    const { force = false } = options;
    const changes = {};
    
    this.collectChanges(this.config, configObject, changes, '', force);
    
    return changes;
  }

  /**
   * 收集配置变化
   * @param {Object} target - 目标配置
   * @param {Object} source - 源配置
   * @param {Object} changes - 变化对象
   * @param {string} prefix - 路径前缀
   * @param {boolean} force - 是否强制设置
   */
  collectChanges(target, source, changes, prefix, force) {
    Object.keys(source).forEach(key => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const sourceValue = source[key];
      const targetValue = target[key];
      
      // 检查锁定状态
      if (this.isLocked(fullPath) && !force) {
        return;
      }
      
      if (this.isEqual(targetValue, sourceValue)) {
        return;
      }
      
      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) &&
          typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
        // 递归处理嵌套对象
        if (!changes[key]) {
          changes[key] = {};
        }
        this.collectChanges(targetValue, sourceValue, changes[key], fullPath, force);
      } else {
        changes[key] = sourceValue;
      }
    });
  }

  /**
   * 应用配置变化
   * @param {Object} changes - 配置变化
   */
  applyChanges(changes) {
    this.deepMerge(this.config, changes);
  }

  /**
   * 合并配置
   * @param {Object} configObject - 配置对象
   * @param {Object} options - 选项
   * @returns {boolean} 是否合并成功
   */
  merge(configObject, options = {}) {
    return this.set(configObject, undefined, options);
  }

  /**
   * 重置配置
   * @param {string} path - 配置路径（可选）
   * @param {Object} options - 选项
   * @returns {boolean} 是否重置成功
   */
  reset(path, options = {}) {
    const { silent = false } = options;
    
    try {
      if (path) {
        // 重置指定路径
        const defaultValue = this.getDefaultValue(path);
        return this.set(path, defaultValue, { silent });
      } else {
        // 重置全部配置
        this.saveToHistory();
        this.config = this.deepClone(this.defaultConfig);
        
        this.stats.changes++;
        
        if (!silent) {
          this.eventManager.emit('config:reset', this.config);
        }
        
        return true;
      }
    } catch (error) {
      this.stats.errors++;
      this.handleError(error, 'reset');
      return false;
    }
  }

  /**
   * 获取默认值
   * @param {string} path - 配置路径
   * @returns {*} 默认值
   */
  getDefaultValue(path) {
    const keys = path.split('.');
    let current = this.defaultConfig;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return this.deepClone(current);
  }

  /**
   * 监听配置变化
   * @param {string|Function} pathOrCallback - 配置路径或回调函数
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项
   * @returns {Function} 取消监听函数
   */
  watch(pathOrCallback, callback, options = {}) {
    const {
      immediate = false,
      deep = false
    } = options;

    let path, actualCallback;
    
    if (typeof pathOrCallback === 'function') {
      path = '*';
      actualCallback = pathOrCallback;
    } else {
      path = pathOrCallback;
      actualCallback = callback;
    }
    
    if (typeof actualCallback !== 'function') {
      throw new Error('回调函数必须是函数');
    }
    
    // 生成监听器ID
    const watcherId = this.generateWatcherId();
    
    // 存储监听器
    if (!this.watchers.has(path)) {
      this.watchers.set(path, new Map());
    }
    
    this.watchers.get(path).set(watcherId, {
      callback: actualCallback,
      options: { immediate, deep },
      created: Date.now()
    });
    
    // 立即执行
    if (immediate) {
      const currentValue = this.get(path === '*' ? undefined : path);
      actualCallback(currentValue, undefined, path);
    }
    
    // 返回取消监听函数
    return () => this.unwatch(path, watcherId);
  }

  /**
   * 取消监听
   * @param {string} path - 配置路径
   * @param {string} watcherId - 监听器ID
   * @returns {boolean} 是否取消成功
   */
  unwatch(path, watcherId) {
    if (!this.watchers.has(path)) {
      return false;
    }
    
    const pathWatchers = this.watchers.get(path);
    const success = pathWatchers.delete(watcherId);
    
    if (pathWatchers.size === 0) {
      this.watchers.delete(path);
    }
    
    return success;
  }

  /**
   * 通知监听器
   * @param {Object} changes - 配置变化
   */
  notifyWatchers(changes) {
    const notifiedPaths = new Set();
    
    // 通知具体路径的监听器
    Object.keys(changes).forEach(key => {
      this.notifyPathWatchers(key, changes[key], notifiedPaths);
    });
    
    // 通知全局监听器
    if (this.watchers.has('*')) {
      this.watchers.get('*').forEach(({ callback }) => {
        try {
          callback(changes, this.config, '*');
        } catch (error) {
          this.handleWatcherError(error, '*');
        }
      });
    }
  }

  /**
   * 通知路径监听器
   * @param {string} path - 路径
   * @param {*} value - 值
   * @param {Set} notifiedPaths - 已通知路径集合
   */
  notifyPathWatchers(path, value, notifiedPaths) {
    if (notifiedPaths.has(path)) {
      return;
    }
    
    notifiedPaths.add(path);
    
    // 通知精确匹配的监听器
    if (this.watchers.has(path)) {
      this.watchers.get(path).forEach(({ callback }) => {
        try {
          const currentValue = this.get(path);
          callback(currentValue, value, path);
        } catch (error) {
          this.handleWatcherError(error, path);
        }
      });
    }
    
    // 递归通知父路径
    const parentPath = this.getParentPath(path);
    if (parentPath) {
      this.notifyPathWatchers(parentPath, value, notifiedPaths);
    }
  }

  /**
   * 获取父路径
   * @param {string} path - 路径
   * @returns {string|null} 父路径
   */
  getParentPath(path) {
    const lastDotIndex = path.lastIndexOf('.');
    return lastDotIndex > 0 ? path.substring(0, lastDotIndex) : null;
  }

  /**
   * 锁定配置路径
   * @param {string|Array} paths - 配置路径
   */
  lock(paths) {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    pathArray.forEach(path => this.locked.add(path));
  }

  /**
   * 解锁配置路径
   * @param {string|Array} paths - 配置路径
   */
  unlock(paths) {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    pathArray.forEach(path => this.locked.delete(path));
  }

  /**
   * 检查路径是否锁定
   * @param {string} path - 配置路径
   * @returns {boolean} 是否锁定
   */
  isLocked(path) {
    // 检查精确匹配
    if (this.locked.has(path)) {
      return true;
    }
    
    // 检查父路径
    const keys = path.split('.');
    for (let i = 1; i <= keys.length; i++) {
      const parentPath = keys.slice(0, i).join('.');
      if (this.locked.has(parentPath)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 注册配置验证器
   * @param {string} path - 配置路径
   * @param {Function} validator - 验证器函数
   */
  registerValidator(path, validator) {
    if (typeof validator !== 'function') {
      throw new Error('验证器必须是函数');
    }
    
    if (!this.validators.has(path)) {
      this.validators.set(path, []);
    }
    
    this.validators.get(path).push(validator);
  }

  /**
   * 验证配置变化
   * @param {Object} changes - 配置变化
   * @returns {boolean} 是否验证通过
   */
  validateChanges(changes) {
    try {
      for (const [path, validators] of this.validators) {
        const value = this.getValueFromChanges(changes, path);
        
        if (value !== undefined) {
          for (const validator of validators) {
            const result = validator(value, path, this.config);
            
            if (result === false || (typeof result === 'object' && result.valid === false)) {
              throw new Error(`配置验证失败: ${path} - ${result.message || '无效值'}`);
            }
          }
        }
      }
      
      this.stats.validations++;
      return true;
    } catch (error) {
      this.stats.errors++;
      this.handleError(error, 'validation');
      return false;
    }
  }

  /**
   * 从变化中获取值
   * @param {Object} changes - 配置变化
   * @param {string} path - 路径
   * @returns {*} 值
   */
  getValueFromChanges(changes, path) {
    const keys = path.split('.');
    let current = changes;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * 注册内置验证器
   */
  registerBuiltinValidators() {
    // 渲染配置验证器
    this.registerValidator('rendering.frameRate', (value) => {
      return typeof value === 'number' && value > 0 && value <= 120;
    });
    
    this.registerValidator('rendering.batchSize', (value) => {
      return typeof value === 'number' && value > 0 && value <= 1000;
    });
    
    // 样式配置验证器
    this.registerValidator('style.default.strokeWidth', (value) => {
      return typeof value === 'number' && value >= 0;
    });
    
    this.registerValidator('style.default.opacity', (value) => {
      return typeof value === 'number' && value >= 0 && value <= 1;
    });
    
    // 性能配置验证器
    this.registerValidator('performance.virtualization.threshold', (value) => {
      return typeof value === 'number' && value > 0;
    });
    
    // 布局配置验证器
    this.registerValidator('layout.zoom.min', (value) => {
      return typeof value === 'number' && value > 0;
    });
    
    this.registerValidator('layout.zoom.max', (value) => {
      return typeof value === 'number' && value > 0;
    });
  }

  /**
   * 环境配置管理
   */
  
  /**
   * 设置环境配置
   * @param {string} env - 环境名称
   * @param {Object} config - 环境配置
   */
  setEnvironment(env, config) {
    this.environments.set(env, this.deepClone(config));
  }

  /**
   * 加载环境配置
   * @param {string} env - 环境名称
   * @param {Object} options - 选项
   * @returns {boolean} 是否加载成功
   */
  loadEnvironment(env, options = {}) {
    if (!this.environments.has(env)) {
      return false;
    }
    
    const envConfig = this.environments.get(env);
    return this.merge(envConfig, options);
  }

  /**
   * 历史管理
   */
  
  /**
   * 保存到历史
   */
  saveToHistory() {
    const configSnapshot = this.deepClone(this.config);
    
    this.configHistory.push({
      config: configSnapshot,
      timestamp: Date.now()
    });
    
    // 限制历史大小
    if (this.configHistory.length > this.maxHistorySize) {
      this.configHistory.shift();
    }
  }

  /**
   * 从历史恢复
   * @param {number} index - 历史索引
   * @returns {boolean} 是否恢复成功
   */
  restoreFromHistory(index) {
    if (index < 0 || index >= this.configHistory.length) {
      return false;
    }
    
    const historyItem = this.configHistory[index];
    this.config = this.deepClone(historyItem.config);
    
    this.eventManager.emit('config:restored', this.config, historyItem.timestamp);
    
    return true;
  }

  /**
   * 获取配置历史
   * @returns {Array} 配置历史
   */
  getHistory() {
    return this.configHistory.map(item => ({
      timestamp: item.timestamp,
      config: this.deepClone(item.config)
    }));
  }

  /**
   * 持久化
   */
  
  /**
   * 保存配置到存储
   * @param {string} key - 存储键
   * @returns {boolean} 是否保存成功
   */
  save(key = 'preview-line-config') {
    try {
      const configData = {
        config: this.config,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      
      localStorage.setItem(key, JSON.stringify(configData));
      
      this.stats.saves++;
      this.eventManager.emit('config:saved', key);
      
      return true;
    } catch (error) {
      this.stats.errors++;
      this.handleError(error, 'save');
      return false;
    }
  }

  /**
   * 从存储加载配置
   * @param {string} key - 存储键
   * @param {Object} options - 选项
   * @returns {boolean} 是否加载成功
   */
  load(key = 'preview-line-config', options = {}) {
    const { merge = true, validate = true } = options;
    
    try {
      const configData = localStorage.getItem(key);
      
      if (!configData) {
        return false;
      }
      
      const parsedData = JSON.parse(configData);
      
      if (!parsedData.config) {
        return false;
      }
      
      if (merge) {
        return this.merge(parsedData.config, { validate });
      } else {
        this.saveToHistory();
        this.config = this.deepClone(parsedData.config);
        
        if (validate && !this.validateChanges(this.config)) {
          return false;
        }
        
        this.stats.loads++;
        this.eventManager.emit('config:loaded', key, parsedData.timestamp);
        
        return true;
      }
    } catch (error) {
      this.stats.errors++;
      this.handleError(error, 'load');
      return false;
    }
  }

  /**
   * 导出配置
   * @param {Object} options - 选项
   * @returns {Object} 配置数据
   */
  export(options = {}) {
    const {
      includeDefaults = false,
      includeHistory = false,
      format = 'json'
    } = options;

    const exportData = {
      config: this.deepClone(this.config),
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    if (includeDefaults) {
      exportData.defaults = this.deepClone(this.defaultConfig);
    }
    
    if (includeHistory) {
      exportData.history = this.getHistory();
    }
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    return exportData;
  }

  /**
   * 导入配置
   * @param {string|Object} configData - 配置数据
   * @param {Object} options - 选项
   * @returns {boolean} 是否导入成功
   */
  import(configData, options = {}) {
    const { merge = true, validate = true } = options;
    
    try {
      let parsedData;
      
      if (typeof configData === 'string') {
        parsedData = JSON.parse(configData);
      } else {
        parsedData = configData;
      }
      
      if (!parsedData.config) {
        return false;
      }
      
      return merge ? 
        this.merge(parsedData.config, { validate }) :
        this.set(parsedData.config, undefined, { validate });
    } catch (error) {
      this.stats.errors++;
      this.handleError(error, 'import');
      return false;
    }
  }

  /**
   * 工具方法
   */
  
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }
    
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = this.deepClone(obj[key]);
    });
    
    return cloned;
  }

  deepMerge(target, source) {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key];
      
      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.deepMerge(target[key], sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
  }

  isEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => this.isEqual(a[key], b[key]));
    }
    
    return false;
  }

  generateWatcherId() {
    return `watcher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 错误处理
   */
  
  handleError(error, context) {
    console.error(`配置管理错误 [${context}]:`, error);
    this.eventManager.emit('config:error', { error, context, timestamp: Date.now() });
  }

  handleWatcherError(error, path) {
    console.error(`配置监听器错误 [${path}]:`, error);
    this.eventManager.emit('config:watcher:error', { error, path, timestamp: Date.now() });
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      configSize: JSON.stringify(this.config).length,
      watcherCount: Array.from(this.watchers.values())
        .reduce((sum, watchers) => sum + watchers.size, 0),
      validatorCount: Array.from(this.validators.values())
        .reduce((sum, validators) => sum + validators.length, 0),
      lockedPaths: this.locked.size,
      environments: this.environments.size,
      historySize: this.configHistory.length
    };
  }

  /**
   * 销毁配置管理器
   */
  destroy() {
    // 清理监听器
    this.watchers.clear();
    
    // 清理验证器
    this.validators.clear();
    
    // 清理锁定状态
    this.locked.clear();
    
    // 清理环境配置
    this.environments.clear();
    
    // 清理历史
    this.configHistory.length = 0;
    
    // 销毁事件管理器
    this.eventManager.destroy();
    
    // 重置配置
    this.config = this.deepClone(this.defaultConfig);
  }
}

export default ConfigManager;