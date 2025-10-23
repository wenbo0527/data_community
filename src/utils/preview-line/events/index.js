/**
 * 事件管理模块索引文件
 * 统一导出事件管理相关的类和工具
 */

import { EventManager } from './EventManager.js';
import { EventHandler } from './EventHandler.js';

/**
 * 创建事件管理器实例
 * @param {Object} options - 配置选项
 * @returns {EventManager} 事件管理器实例
 */
export function createEventManager(options = {}) {
  return new EventManager(options);
}

/**
 * 创建事件处理器实例
 * @param {Object} options - 配置选项
 * @returns {EventHandler} 事件处理器实例
 */
export function createEventHandler(options = {}) {
  return new EventHandler(options);
}

/**
 * 创建完整的事件系统
 * @param {Object} options - 配置选项
 * @returns {Object} 包含事件管理器和处理器的对象
 */
export function createEventSystem(options = {}) {
  const eventManager = createEventManager(options.manager);
  const eventHandler = createEventHandler(options.handler);
  
  // 连接事件管理器和处理器
  eventManager.on('*', async (eventObj, ...args) => {
    try {
      await eventHandler.handle(eventObj.type, args[0], {
        event: eventObj,
        args: args.slice(1)
      });
    } catch (error) {
      eventManager.emit('handler:error', {
        error,
        event: eventObj.type,
        data: args[0]
      });
    }
  });
  
  return {
    eventManager,
    eventHandler,
    manager: eventManager, // 别名
    handler: eventHandler, // 别名
    
    // 便捷方法
    emit: (event, ...args) => eventManager.emit(event, ...args),
    on: (event, listener, options) => eventManager.on(event, listener, options),
    off: (event, listener) => eventManager.off(event, listener),
    handle: (event, data, context) => eventHandler.handle(event, data, context),
    register: (event, handler, options) => eventHandler.register(event, handler, options),
    
    // 销毁方法
    destroy: () => {
      eventManager.destroy();
      eventHandler.destroy();
    }
  };
}

// 默认事件类型常量
export const EVENT_TYPES = {
  // 预览线生命周期事件
  PREVIEW_LINE_CREATE: 'preview-line:create',
  PREVIEW_LINE_UPDATE: 'preview-line:update',
  PREVIEW_LINE_REMOVE: 'preview-line:remove',
  PREVIEW_LINE_DESTROY: 'preview-line:destroy',
  
  // 状态变更事件
  STATE_CHANGE: 'preview-line:state-change',
  STATE_ENTER: 'preview-line:state-enter',
  STATE_EXIT: 'preview-line:state-exit',
  
  // 交互事件
  INTERACTION_START: 'preview-line:interaction-start',
  INTERACTION_END: 'preview-line:interaction-end',
  INTERACTION_HOVER: 'preview-line:interaction-hover',
  INTERACTION_CLICK: 'preview-line:interaction-click',
  INTERACTION_DRAG: 'preview-line:interaction-drag',
  
  // 渲染事件
  RENDER_START: 'preview-line:render-start',
  RENDER_END: 'preview-line:render-end',
  RENDER_ERROR: 'preview-line:render-error',
  
  // 性能事件
  PERFORMANCE_MEASURE: 'preview-line:performance-measure',
  PERFORMANCE_WARNING: 'preview-line:performance-warning',
  
  // 错误事件
  ERROR: 'preview-line:error',
  WARNING: 'preview-line:warning',
  
  // 系统事件
  SYSTEM_INIT: 'preview-line:system-init',
  SYSTEM_DESTROY: 'preview-line:system-destroy',
  SYSTEM_CONFIG_CHANGE: 'preview-line:system-config-change'
};

// 导出类
export { EventManager, EventHandler };

// 默认导出
export default {
  EventManager,
  EventHandler,
  createEventManager,
  createEventHandler,
  createEventSystem,
  EVENT_TYPES
};