/**
 * 状态管理模块
 * 统一导出状态管理器和状态同步器
 */

import { StateManager } from './StateManager.js';
import { StateSynchronizer } from './StateSynchronizer.js';

// 导出类
export { StateManager, StateSynchronizer };

// 工厂函数
export const createStateManager = (options = {}) => {
  return new StateManager(options);
};

export const createStateSynchronizer = (options = {}) => {
  return new StateSynchronizer(options);
};

// 创建完整的状态管理系统
export const createStateSystem = (options = {}) => {
  const {
    stateManagerOptions = {},
    synchronizerOptions = {},
    enableSync = true
  } = options;

  const stateManager = new StateManager(stateManagerOptions);
  const synchronizer = enableSync ? new StateSynchronizer(synchronizerOptions) : null;

  // 如果启用同步，连接状态管理器和同步器
  if (synchronizer) {
    // 注册状态管理器作为同步连接
    synchronizer.registerConnection('state-manager', stateManager, {
      priority: 'high',
      strategy: 'incremental',
      enableBidirectional: true
    });

    // 监听状态变化并同步
    stateManager.subscribe('*', (changes) => {
      synchronizer.syncState('state-manager', changes, {
        strategy: 'incremental',
        priority: 'normal'
      });
    });

    // 监听同步事件并更新状态
    synchronizer.eventManager.on('sync:completed', (event) => {
      if (event && event.operation && event.operation.source !== 'state-manager') {
        stateManager.setState(event.operation.data, {
          silent: true, // 避免循环同步
          validate: false
        });
      }
    });
    

    
    synchronizer.eventManager.on('sync:reset', () => {
      console.log('状态同步器已重置');
    });
  }

  return {
    stateManager,
    synchronizer,
    
    // 便捷方法
    getState: (path) => stateManager.getState(path),
    setState: (pathOrState, value, options) => stateManager.setState(pathOrState, value, options),
    subscribe: (pathOrCallback, callback, options) => stateManager.subscribe(pathOrCallback, callback, options),
    
    // 同步方法
    sync: synchronizer ? (source, data, options) => synchronizer.syncState(source, data, options) : null,
    broadcast: synchronizer ? (data, options) => synchronizer.broadcast(data, options) : null,
    
    // 生命周期方法
    reset: () => {
      stateManager.reset();
      if (synchronizer) {
        synchronizer.reset();
      }
    },
    
    destroy: () => {
      stateManager.destroy();
      if (synchronizer) {
        synchronizer.destroy();
      }
    },
    
    // 统计信息
    getStats: () => ({
      state: stateManager.getStats(),
      sync: synchronizer ? synchronizer.getStats() : null
    })
  };
};

// 状态管理常量
export const STATE_EVENTS = {
  // 状态事件
  STATE_CHANGED: 'state:changed',
  STATE_ERROR: 'state:error',
  STATE_RESET: 'state:reset',
  STATE_UNDO: 'state:undo',
  STATE_REDO: 'state:redo',
  
  // 同步事件
  SYNC_STARTED: 'sync:started',
  SYNC_COMPLETED: 'sync:completed',
  SYNC_ERROR: 'sync:error',
  SYNC_TIMEOUT: 'sync:timeout',
  SYNC_RESET: 'sync:reset',
  
  // 连接事件
  CONNECTION_REGISTERED: 'connection:registered',
  CONNECTION_UNREGISTERED: 'connection:unregistered',
  
  // 冲突事件
  CONFLICT_DETECTED: 'conflict:detected',
  CONFLICT_RESOLVED: 'conflict:resolved',
  
  // 广播事件
  BROADCAST_SENT: 'broadcast:sent',
  BROADCAST_RECEIVED: 'broadcast:received'
};

// 状态路径常量
export const STATE_PATHS = {
  // 预览线状态
  PREVIEW_LINES: 'previewLines',
  
  // 节点状态
  NODES: 'nodes',
  
  // 连接状态
  CONNECTIONS: 'connections',
  
  // 渲染状态
  RENDERING: 'rendering',
  RENDERING_IS_RENDERING: 'rendering.isRendering',
  RENDERING_QUEUE: 'rendering.renderQueue',
  RENDERING_LAST_TIME: 'rendering.lastRenderTime',
  RENDERING_COUNT: 'rendering.renderCount',
  
  // 交互状态
  INTERACTION: 'interaction',
  INTERACTION_IS_DRAGGING: 'interaction.isDragging',
  INTERACTION_IS_HOVERING: 'interaction.isHovering',
  INTERACTION_SELECTED_ITEMS: 'interaction.selectedItems',
  INTERACTION_DRAG_TARGET: 'interaction.dragTarget',
  INTERACTION_HOVER_TARGET: 'interaction.hoverTarget',
  
  // 布局状态
  LAYOUT: 'layout',
  LAYOUT_VIEWPORT: 'layout.viewport',
  LAYOUT_ZOOM: 'layout.zoom',
  LAYOUT_OFFSET: 'layout.offset',
  LAYOUT_BOUNDS: 'layout.bounds',
  
  // 性能状态
  PERFORMANCE: 'performance',
  PERFORMANCE_FPS: 'performance.fps',
  PERFORMANCE_RENDER_TIME: 'performance.renderTime',
  PERFORMANCE_MEMORY_USAGE: 'performance.memoryUsage',
  PERFORMANCE_OPTIMIZATION_LEVEL: 'performance.optimizationLevel'
};

// 同步策略常量
export const SYNC_STRATEGIES = {
  DEFAULT: 'default',
  INCREMENTAL: 'incremental',
  BATCH: 'batch',
  REAL_TIME: 'real-time'
};

// 冲突解决策略常量
export const CONFLICT_RESOLUTION = {
  LAST_WRITE_WINS: 'last-write-wins',
  MERGE: 'merge',
  REJECT: 'reject',
  CUSTOM: 'custom'
};

// 默认配置
export const DEFAULT_STATE_CONFIG = {
  // 状态管理器配置
  stateManager: {
    enableHistory: true,
    maxHistorySize: 100,
    enablePersistence: false,
    persistenceKey: 'preview-line-state',
    enableSync: true,
    syncDebounce: 100,
    enableValidation: true,
    strictMode: false,
    enableBatching: true,
    batchSize: 50,
    enableOptimization: true
  },
  
  // 状态同步器配置
  synchronizer: {
    enableSync: true,
    syncInterval: 100,
    maxSyncRetries: 3,
    syncTimeout: 5000,
    enableBroadcast: false,
    broadcastChannel: 'preview-line-sync',
    conflictResolution: CONFLICT_RESOLUTION.LAST_WRITE_WINS,
    enableBatching: true,
    batchSize: 50,
    enableCompression: false,
    enableDebug: false,
    enableLogging: true
  }
};

// 默认导出
export default {
  StateManager,
  StateSynchronizer,
  createStateManager,
  createStateSynchronizer,
  createStateSystem,
  STATE_EVENTS,
  STATE_PATHS,
  SYNC_STRATEGIES,
  CONFLICT_RESOLUTION,
  DEFAULT_STATE_CONFIG
};