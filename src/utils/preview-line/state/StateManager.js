/**
 * 状态管理器
 * 提供预览线系统的状态管理、数据流控制和状态同步功能
 */

import EventManager from '../events/EventManager.js';

export class StateManager {
  constructor(options = {}) {
    this.options = {
      // 状态配置
      enableHistory: true,
      maxHistorySize: 100,
      enablePersistence: false,
      persistenceKey: 'preview-line-state',
      
      // 同步配置
      enableSync: true,
      syncDebounce: 100,
      enableBroadcast: false,
      
      // 验证配置
      enableValidation: true,
      strictMode: false,
      
      // 性能配置
      enableBatching: true,
      batchSize: 50,
      enableOptimization: true,
      
      ...options
    };

    // 事件管理器
    this.eventManager = new EventManager({
      enableAsync: true,
      enableNamespace: true
    });

    // 状态存储
    this.state = {
      // 预览线状态
      previewLines: new Map(),
      
      // 节点状态
      nodes: new Map(),
      
      // 连接状态
      connections: new Map(),
      
      // 渲染状态
      rendering: {
        isRendering: false,
        renderQueue: [],
        lastRenderTime: 0,
        renderCount: 0
      },
      
      // 交互状态
      interaction: {
        isDragging: false,
        isHovering: false,
        selectedItems: new Set(),
        dragTarget: null,
        hoverTarget: null
      },
      
      // 布局状态
      layout: {
        viewport: { x: 0, y: 0, width: 0, height: 0 },
        zoom: 1,
        offset: { x: 0, y: 0 },
        bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
      },
      
      // 性能状态
      performance: {
        fps: 0,
        renderTime: 0,
        memoryUsage: 0,
        optimizationLevel: 'auto'
      }
    };

    // 状态历史
    this.history = [];
    this.historyIndex = -1;
    
    // 状态订阅者
    this.subscribers = new Map();
    
    // 状态验证器
    this.validators = new Map();
    
    // 状态中间件
    this.middleware = [];
    
    // 批处理队列
    this.batchQueue = [];
    this.isBatching = false;
    
    // 同步状态
    this.syncState = {
      lastSync: 0,
      syncQueue: [],
      isSyncing: false
    };
    
    // 统计信息
    this.stats = {
      stateChanges: 0,
      subscriptions: 0,
      validations: 0,
      syncs: 0,
      errors: 0
    };

    // 初始化
    this.init();
  }

  /**
   * 初始化状态管理器
   */
  init() {
    // 注册内置验证器
    this.registerBuiltinValidators();
    
    // 加载持久化状态
    if (this.options.enablePersistence) {
      this.loadPersistedState();
    }
    
    // 设置同步定时器
    if (this.options.enableSync) {
      this.setupSyncTimer();
    }
    
    // 监听窗口事件
    this.setupWindowListeners();
  }

  /**
   * 获取状态
   * @param {string} path - 状态路径
   * @returns {*} 状态值
   */
  getState(path) {
    if (!path) {
      return this.cloneState(this.state);
    }
    
    const keys = path.split('.');
    let current = this.state;
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      
      if (current === null || current === undefined) {
        return undefined;
      }
      
      // 特殊处理Map类型
      if (current instanceof Map) {
        current = current.get(key);
      } else {
        current = current[key];
      }
    }
    
    return this.cloneState(current);
  }

  /**
   * 设置状态
   * @param {string|Object} pathOrState - 状态路径或状态对象
   * @param {*} value - 状态值
   * @param {Object} options - 选项
   * @returns {boolean} 是否设置成功
   */
  setState(pathOrState, value, options = {}) {
    const {
      silent = false,
      validate = this.options.enableValidation,
      batch = this.options.enableBatching,
      merge = true
    } = options;

    try {
      let changes;
      
      if (typeof pathOrState === 'string') {
        // 路径方式设置
        changes = this.setStatePath(pathOrState, value, { merge });
      } else {
        // 对象方式设置
        changes = this.setStateObject(pathOrState, { merge });
      }
      
      if (!changes || Object.keys(changes).length === 0) {
        return false;
      }
      
      // 验证状态
      if (validate && !this.validateStateChanges(changes)) {
        return false;
      }
      
      // 应用中间件
      const processedChanges = this.applyMiddleware(changes);
      
      // 批处理或立即应用
      if (batch && this.options.enableBatching) {
        this.addToBatch(processedChanges, { silent });
      } else {
        this.applyStateChanges(processedChanges, { silent });
      }
      
      return true;
    } catch (error) {
      this.stats.errors++;
      this.handleStateError(error, 'setState');
      return false;
    }
  }

  /**
   * 通过路径设置状态
   * @param {string} path - 状态路径
   * @param {*} value - 状态值
   * @param {Object} options - 选项
   * @returns {Object} 状态变化
   */
  setStatePath(path, value, options = {}) {
    const { merge = true } = options;
    const keys = path.split('.');
    const changes = {};
    
    // 获取当前值
    const currentValue = this.getState(path);
    
    // 检查是否有变化
    if (this.isEqual(currentValue, value)) {
      return {};
    }
    
    // 特殊处理Map类型的状态设置
    if (keys.length === 2 && keys[0] === 'previewLines') {
      const mapKey = keys[1];
      const previewLinesMap = this.state.previewLines;
      
      if (value === undefined || value === null) {
        // 删除Map中的项
        if (previewLinesMap.has(mapKey)) {
          previewLinesMap.delete(mapKey);
          changes.previewLines = { [mapKey]: undefined };
        }
      } else {
        // 设置Map中的项
        previewLinesMap.set(mapKey, value);
        changes.previewLines = { [mapKey]: value };
      }
      
      return changes;
    }
    
    // 构建变化对象
    let current = changes;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }
    
    const lastKey = keys[keys.length - 1];
    
    if (merge && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      current[lastKey] = { ...currentValue, ...value };
    } else {
      current[lastKey] = value;
    }
    
    return changes;
  }

  /**
   * 通过对象设置状态
   * @param {Object} stateObject - 状态对象
   * @param {Object} options - 选项
   * @returns {Object} 状态变化
   */
  setStateObject(stateObject, options = {}) {
    const { merge = true } = options;
    
    if (merge) {
      return this.mergeState(this.state, stateObject);
    } else {
      return stateObject;
    }
  }

  /**
   * 合并状态
   * @param {Object} target - 目标状态
   * @param {Object} source - 源状态
   * @returns {Object} 合并后的状态变化
   */
  mergeState(target, source) {
    const changes = {};
    
    Object.keys(source).forEach(key => {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (this.isEqual(targetValue, sourceValue)) {
        return;
      }
      
      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) &&
          typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
        const nestedChanges = this.mergeState(targetValue, sourceValue);
        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = nestedChanges;
        }
      } else {
        changes[key] = sourceValue;
      }
    });
    
    return changes;
  }

  /**
   * 应用状态变化
   * @param {Object} changes - 状态变化
   * @param {Object} options - 选项
   */
  applyStateChanges(changes, options = {}) {
    const { silent = false } = options;
    
    // 保存历史
    if (this.options.enableHistory) {
      this.saveToHistory();
    }
    
    // 应用变化 - 特殊处理Map类型的变化
    if (changes.previewLines) {
      // previewLines的变化已经在setStatePath中直接应用到Map了
      // 这里不需要再次应用
    } else {
      this.deepMerge(this.state, changes);
    }
    
    // 更新统计
    this.stats.stateChanges++;
    
    // 触发事件
    if (!silent) {
      this.notifySubscribers(changes);
      this.eventManager.emit('state:changed', changes, this.state);
    }
    
    // 持久化
    if (this.options.enablePersistence) {
      this.persistState();
    }
    
    // 同步
    if (this.options.enableSync) {
      this.scheduleSync(changes);
    }
  }

  /**
   * 深度合并对象
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   */
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

  /**
   * 订阅状态变化
   * @param {string|Function} pathOrCallback - 状态路径或回调函数
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项
   * @returns {Function} 取消订阅函数
   */
  subscribe(pathOrCallback, callback, options = {}) {
    const {
      immediate = false,
      deep = false,
      debounce = 0
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
    
    // 包装回调函数
    let wrappedCallback = actualCallback;
    
    if (debounce > 0) {
      wrappedCallback = this.debounce(actualCallback, debounce);
    }
    
    // 生成订阅ID
    const subscriptionId = this.generateSubscriptionId();
    
    // 存储订阅
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Map());
    }
    
    this.subscribers.get(path).set(subscriptionId, {
      callback: wrappedCallback,
      options: { immediate, deep, debounce },
      created: Date.now()
    });
    
    this.stats.subscriptions++;
    
    // 立即执行
    if (immediate) {
      const currentValue = this.getState(path === '*' ? undefined : path);
      wrappedCallback(currentValue, undefined, path);
    }
    
    // 返回取消订阅函数
    return () => this.unsubscribe(path, subscriptionId);
  }

  /**
   * 取消订阅
   * @param {string} path - 状态路径
   * @param {string} subscriptionId - 订阅ID
   * @returns {boolean} 是否取消成功
   */
  unsubscribe(path, subscriptionId) {
    if (!this.subscribers.has(path)) {
      return false;
    }
    
    const pathSubscribers = this.subscribers.get(path);
    const success = pathSubscribers.delete(subscriptionId);
    
    if (pathSubscribers.size === 0) {
      this.subscribers.delete(path);
    }
    
    if (success) {
      this.stats.subscriptions--;
    }
    
    return success;
  }

  /**
   * 通知订阅者
   * @param {Object} changes - 状态变化
   */
  notifySubscribers(changes) {
    const notifiedPaths = new Set();
    
    // 通知具体路径的订阅者
    Object.keys(changes).forEach(key => {
      this.notifyPathSubscribers(key, changes[key], notifiedPaths);
    });
    
    // 通知全局订阅者
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(({ callback }) => {
        try {
          callback(changes, this.state, '*');
        } catch (error) {
          this.handleSubscriberError(error, '*');
        }
      });
    }
  }

  /**
   * 通知路径订阅者
   * @param {string} path - 路径
   * @param {*} value - 值
   * @param {Set} notifiedPaths - 已通知路径集合
   */
  notifyPathSubscribers(path, value, notifiedPaths) {
    if (notifiedPaths.has(path)) {
      return;
    }
    
    notifiedPaths.add(path);
    
    // 通知精确匹配的订阅者
    if (this.subscribers.has(path)) {
      this.subscribers.get(path).forEach(({ callback, options }) => {
        try {
          const currentValue = this.getState(path);
          callback(currentValue, value, path);
        } catch (error) {
          this.handleSubscriberError(error, path);
        }
      });
    }
    
    // 递归通知父路径
    const parentPath = this.getParentPath(path);
    if (parentPath) {
      this.notifyPathSubscribers(parentPath, value, notifiedPaths);
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
   * 注册状态验证器
   * @param {string} path - 状态路径
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
   * 验证状态变化
   * @param {Object} changes - 状态变化
   * @returns {boolean} 是否验证通过
   */
  validateStateChanges(changes) {
    try {
      for (const [path, validators] of this.validators) {
        const value = this.getValueFromChanges(changes, path);
        
        if (value !== undefined) {
          for (const validator of validators) {
            const result = validator(value, path, this.state);
            
            if (result === false || (typeof result === 'object' && result.valid === false)) {
              if (this.options.strictMode) {
                throw new Error(`状态验证失败: ${path} - ${result.message || '无效值'}`);
              }
              return false;
            }
          }
        }
      }
      
      this.stats.validations++;
      return true;
    } catch (error) {
      this.stats.errors++;
      this.handleStateError(error, 'validation');
      return false;
    }
  }

  /**
   * 从变化中获取值
   * @param {Object} changes - 状态变化
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
   * 注册中间件
   * @param {Function} middleware - 中间件函数
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('中间件必须是函数');
    }
    
    this.middleware.push(middleware);
  }

  /**
   * 应用中间件
   * @param {Object} changes - 状态变化
   * @returns {Object} 处理后的状态变化
   */
  applyMiddleware(changes) {
    let processedChanges = changes;
    
    for (const middleware of this.middleware) {
      try {
        processedChanges = middleware(processedChanges, this.state) || processedChanges;
      } catch (error) {
        this.handleStateError(error, 'middleware');
      }
    }
    
    return processedChanges;
  }

  /**
   * 开始批处理
   */
  startBatch() {
    this.isBatching = true;
  }

  /**
   * 结束批处理
   */
  endBatch() {
    if (!this.isBatching) {
      return;
    }
    
    this.isBatching = false;
    
    if (this.batchQueue.length > 0) {
      const mergedChanges = this.mergeBatchChanges(this.batchQueue);
      this.batchQueue.length = 0;
      
      this.applyStateChanges(mergedChanges.changes, mergedChanges.options);
    }
  }

  /**
   * 添加到批处理队列
   * @param {Object} changes - 状态变化
   * @param {Object} options - 选项
   */
  addToBatch(changes, options = {}) {
    this.batchQueue.push({ changes, options });
    
    if (!this.isBatching) {
      // 自动批处理
      setTimeout(() => this.endBatch(), 0);
    }
  }

  /**
   * 合并批处理变化
   * @param {Array} batchQueue - 批处理队列
   * @returns {Object} 合并后的变化
   */
  mergeBatchChanges(batchQueue) {
    const mergedChanges = {};
    const mergedOptions = { silent: false };
    
    batchQueue.forEach(({ changes, options }) => {
      this.deepMerge(mergedChanges, changes);
      
      if (options.silent) {
        mergedOptions.silent = true;
      }
    });
    
    return { changes: mergedChanges, options: mergedOptions };
  }

  /**
   * 撤销操作
   * @returns {boolean} 是否撤销成功
   */
  undo() {
    if (!this.options.enableHistory || this.historyIndex <= 0) {
      return false;
    }
    
    this.historyIndex--;
    const previousState = this.history[this.historyIndex];
    
    this.state = this.cloneState(previousState);
    
    this.eventManager.emit('state:undo', this.state);
    this.notifySubscribers(this.state);
    
    return true;
  }

  /**
   * 重做操作
   * @returns {boolean} 是否重做成功
   */
  redo() {
    if (!this.options.enableHistory || this.historyIndex >= this.history.length - 1) {
      return false;
    }
    
    this.historyIndex++;
    const nextState = this.history[this.historyIndex];
    
    this.state = this.cloneState(nextState);
    
    this.eventManager.emit('state:redo', this.state);
    this.notifySubscribers(this.state);
    
    return true;
  }

  /**
   * 保存到历史
   */
  saveToHistory() {
    const stateSnapshot = this.cloneState(this.state);
    
    // 移除后续历史
    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }
    
    this.history.push(stateSnapshot);
    this.historyIndex = this.history.length - 1;
    
    // 限制历史大小
    if (this.history.length > this.options.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * 注册内置验证器
   */
  registerBuiltinValidators() {
    // 预览线验证器
    this.registerValidator('previewLines', (previewLines) => {
      return previewLines instanceof Map;
    });
    
    // 节点验证器
    this.registerValidator('nodes', (nodes) => {
      return nodes instanceof Map;
    });
    
    // 渲染状态验证器
    this.registerValidator('rendering.isRendering', (isRendering) => {
      return typeof isRendering === 'boolean';
    });
  }

  /**
   * 工具方法
   */
  
  cloneState(state) {
    if (state instanceof Map) {
      return new Map(state);
    }
    if (state instanceof Set) {
      return new Set(state);
    }
    if (Array.isArray(state)) {
      return state.map(item => this.cloneState(item));
    }
    if (typeof state === 'object' && state !== null) {
      const cloned = {};
      Object.keys(state).forEach(key => {
        cloned[key] = this.cloneState(state[key]);
      });
      return cloned;
    }
    return state;
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

  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 错误处理
   */
  
  handleStateError(error, context) {
    console.error(`状态管理错误 [${context}]:`, error);
    this.eventManager.emit('state:error', { error, context, timestamp: Date.now() });
  }

  handleSubscriberError(error, path) {
    console.error(`订阅者错误 [${path}]:`, error);
    this.eventManager.emit('subscriber:error', { error, path, timestamp: Date.now() });
  }

  /**
   * 持久化相关
   */
  
  persistState() {
    try {
      const serializedState = this.serializeState(this.state);
      localStorage.setItem(this.options.persistenceKey, serializedState);
    } catch (error) {
      this.handleStateError(error, 'persistence');
    }
  }

  loadPersistedState() {
    try {
      const serializedState = localStorage.getItem(this.options.persistenceKey);
      if (serializedState) {
        const persistedState = this.deserializeState(serializedState);
        this.state = { ...this.state, ...persistedState };
      }
    } catch (error) {
      this.handleStateError(error, 'load-persistence');
    }
  }

  serializeState(state) {
    return JSON.stringify(state, (key, value) => {
      if (value instanceof Map) {
        return { __type: 'Map', data: Array.from(value.entries()) };
      }
      if (value instanceof Set) {
        return { __type: 'Set', data: Array.from(value) };
      }
      return value;
    });
  }

  deserializeState(serializedState) {
    return JSON.parse(serializedState, (key, value) => {
      if (value && value.__type === 'Map') {
        return new Map(value.data);
      }
      if (value && value.__type === 'Set') {
        return new Set(value.data);
      }
      return value;
    });
  }

  /**
   * 同步相关
   */
  
  setupSyncTimer() {
    setInterval(() => {
      if (this.syncState.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, this.options.syncDebounce);
  }

  scheduleSync(changes) {
    this.syncState.syncQueue.push({
      changes,
      timestamp: Date.now()
    });
  }

  processSyncQueue() {
    if (this.syncState.isSyncing) {
      return;
    }
    
    this.syncState.isSyncing = true;
    
    const syncData = this.syncState.syncQueue.splice(0);
    
    // 合并同步数据
    const mergedChanges = {};
    syncData.forEach(({ changes }) => {
      this.deepMerge(mergedChanges, changes);
    });
    
    // 触发同步事件
    this.eventManager.emit('state:sync', mergedChanges);
    
    this.stats.syncs++;
    this.syncState.lastSync = Date.now();
    this.syncState.isSyncing = false;
  }

  setupWindowListeners() {
    if (typeof window !== 'undefined') {
      // 存储监听器引用以便后续清理
      this.windowBeforeUnloadHandler = () => {
        if (this.options.enablePersistence) {
          this.persistState();
        }
      };
      
      window.addEventListener('beforeunload', this.windowBeforeUnloadHandler);
      console.log('🔗 [StateManager] 已注册 window beforeunload 事件监听器');
    }
  }

  /**
   * 清理 window 事件监听器
   */
  cleanupWindowListeners() {
    if (typeof window !== 'undefined' && this.windowBeforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.windowBeforeUnloadHandler);
      this.windowBeforeUnloadHandler = null;
      console.log('🧹 [StateManager] 已清理 window beforeunload 事件监听器');
    }
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      historySize: this.history.length,
      subscriberCount: Array.from(this.subscribers.values())
        .reduce((sum, subs) => sum + subs.size, 0),
      validatorCount: Array.from(this.validators.values())
        .reduce((sum, validators) => sum + validators.length, 0),
      middlewareCount: this.middleware.length,
      batchQueueSize: this.batchQueue.length,
      syncQueueSize: this.syncState.syncQueue.length
    };
  }

  /**
   * 重置状态管理器
   */
  reset() {
    // 重置状态
    this.state = {
      previewLines: new Map(),
      nodes: new Map(),
      connections: new Map(),
      rendering: {
        isRendering: false,
        renderQueue: [],
        lastRenderTime: 0,
        renderCount: 0
      },
      interaction: {
        isDragging: false,
        isHovering: false,
        selectedItems: new Set(),
        dragTarget: null,
        hoverTarget: null
      },
      layout: {
        viewport: { x: 0, y: 0, width: 0, height: 0 },
        zoom: 1,
        offset: { x: 0, y: 0 },
        bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
      },
      performance: {
        fps: 0,
        renderTime: 0,
        memoryUsage: 0,
        optimizationLevel: 'auto'
      }
    };
    
    // 清理历史
    this.history.length = 0;
    this.historyIndex = -1;
    
    // 清理队列
    this.batchQueue.length = 0;
    this.syncState.syncQueue.length = 0;
    
    // 重置统计
    this.stats = {
      stateChanges: 0,
      subscriptions: 0,
      validations: 0,
      syncs: 0,
      errors: 0
    };
    
    // 触发重置事件
    this.eventManager.emit('state:reset');
  }

  /**
   * 销毁状态管理器
   */
  destroy() {
    console.log('🗑️ [StateManager] 开始销毁状态管理器...');
    
    // 持久化最终状态
    if (this.options.enablePersistence) {
      this.persistState();
    }
    
    // 清理 window 事件监听器 - 防止内存泄漏
    this.cleanupWindowListeners();
    
    // 清理订阅者
    let totalSubscribers = 0;
    for (const [key, subscribers] of this.subscribers) {
      totalSubscribers += subscribers.size;
      subscribers.clear();
    }
    this.subscribers.clear();
    console.log(`🧹 [StateManager] 已清理 ${totalSubscribers} 个订阅者`);
    
    // 清理验证器
    let totalValidators = 0;
    for (const [key, validators] of this.validators) {
      totalValidators += validators.length;
    }
    this.validators.clear();
    console.log(`🧹 [StateManager] 已清理 ${totalValidators} 个验证器`);
    
    // 清理中间件
    const middlewareCount = this.middleware.length;
    this.middleware.length = 0;
    console.log(`🧹 [StateManager] 已清理 ${middlewareCount} 个中间件`);
    
    // 销毁事件管理器
    if (this.eventManager && typeof this.eventManager.destroy === 'function') {
      this.eventManager.destroy();
    }
    
    // 重置状态
    this.reset();
    
    console.log('✅ [StateManager] 状态管理器已完全销毁');
  }
}

export default StateManager;