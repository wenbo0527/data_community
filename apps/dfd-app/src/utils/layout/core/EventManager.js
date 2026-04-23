/**
 * 事件管理器
 * 负责布局过程中的事件发布、订阅和管理
 * 约150行代码
 */

// 导入事件类型定义
import { EventType, EventPriority, BaseEventType, EventListenerType } from '../types/EventTypes.js';

/**
 * 事件管理器类
 * 主要职责：
 * 1. 事件发布订阅机制
 * 2. 事件生命周期管理
 * 3. 异步事件处理
 * 4. 事件优先级管理
 * @class EventManager
 */
export class EventManager {
  /**
   * 构造函数
   * 初始化事件管理器的各种存储和配置
   */
  constructor() {
    // 事件监听器存储
    this.listeners = new Map();
    this.onceListeners = new Map();
    
    // 事件队列和处理
    this.eventQueue = [];
    this.isProcessing = false;
    this.maxQueueSize = 1000;
    
    // 事件统计
    this.eventStats = new Map();
    this.totalEvents = 0;
    
    // 错误处理
    this.errorHandlers = [];
    
    console.log('🎯 [EventManager] 事件管理器初始化完成');
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} [options={}] - 选项
   * @param {number} [options.priority=0] - 监听器优先级
   * @param {Object} [options.context=null] - 执行上下文
   * @returns {string} 监听器ID
   */
  on(event, listener, options = {}) {
    if (typeof listener !== 'function') {
      console.warn('🎯 [EventManager] 监听器必须是函数');
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listenerInfo = {
      fn: listener,
      priority: options.priority || 0,
      context: options.context || null,
      once: false,
      id: this.generateListenerId()
    };

    const listeners = this.listeners.get(event);
    listeners.push(listenerInfo);
    
    // 按优先级排序（高优先级先执行）
    listeners.sort((a, b) => b.priority - a.priority);

    console.log(`🎯 [EventManager] 添加监听器 [${event}]，当前数量:`, listeners.length);
    return listenerInfo.id;
  }

  /**
   * 添加一次性事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} [options={}] - 选项
   * @param {number} [options.priority=0] - 监听器优先级
   * @param {Object} [options.context=null] - 执行上下文
   * @returns {string} 监听器ID
   */
  once(event, listener, options = {}) {
    if (typeof listener !== 'function') {
      console.warn('🎯 [EventManager] 监听器必须是函数');
      return;
    }

    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, []);
    }

    const listenerInfo = {
      fn: listener,
      priority: options.priority || 0,
      context: options.context || null,
      once: true,
      id: this.generateListenerId()
    };

    const listeners = this.onceListeners.get(event);
    listeners.push(listenerInfo);
    listeners.sort((a, b) => b.priority - a.priority);

    console.log(`🎯 [EventManager] 添加一次性监听器 [${event}]`);
    return listenerInfo.id;
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function|string} listener - 监听器函数或ID
   * @returns {void}
   */
  off(event, listener) {
    const removeFromList = (listenerMap) => {
      if (!listenerMap.has(event)) return false;
      
      const listeners = listenerMap.get(event);
      let removed = false;
      
      for (let i = listeners.length - 1; i >= 0; i--) {
        const listenerInfo = listeners[i];
        if (listenerInfo.fn === listener || listenerInfo.id === listener) {
          listeners.splice(i, 1);
          removed = true;
        }
      }
      
      if (listeners.length === 0) {
        listenerMap.delete(event);
      }
      
      return removed;
    };

    const removedFromRegular = removeFromList(this.listeners);
    const removedFromOnce = removeFromList(this.onceListeners);

    if (removedFromRegular || removedFromOnce) {
      console.log(`🎯 [EventManager] 移除监听器 [${event}]`);
    }
  }

  /**
   * 发布事件
   * @param {string} event - 事件名称
   * @param {*} [data=null] - 事件数据
   * @param {Object} [options={}] - 选项
   * @param {boolean} [options.async=false] - 是否异步处理
   * @returns {void}
   */
  emit(event, data = null, options = {}) {
    const eventInfo = {
      name: event,
      data,
      timestamp: Date.now(),
      async: options.async || false,
      id: this.generateEventId()
    };

    // 更新统计
    this.updateEventStats(event);
    this.totalEvents++;

    if (options.async) {
      this.queueEvent(eventInfo);
    } else {
      this.processEvent(eventInfo);
    }

    console.log(`🎯 [EventManager] 发布事件 [${event}]${options.async ? ' (异步)' : ''}`);
  }

  /**
   * 处理事件
   * @param {Object} eventInfo - 事件信息
   * @param {string} eventInfo.name - 事件名称
   * @param {*} eventInfo.data - 事件数据
   * @param {number} eventInfo.timestamp - 时间戳
   * @param {boolean} eventInfo.async - 是否异步
   * @param {string} eventInfo.id - 事件ID
   * @returns {number} 处理的监听器数量
   */
  processEvent(eventInfo) {
    const { name, data } = eventInfo;
    let processedCount = 0;

    try {
      // 处理常规监听器
      if (this.listeners.has(name)) {
        const listeners = this.listeners.get(name);
        listeners.forEach(listenerInfo => {
          try {
            if (listenerInfo.context) {
              listenerInfo.fn.call(listenerInfo.context, data, eventInfo);
            } else {
              listenerInfo.fn(data, eventInfo);
            }
            processedCount++;
          } catch (error) {
            this.handleError(error, name, listenerInfo);
          }
        });
      }

      // 处理一次性监听器
      if (this.onceListeners.has(name)) {
        const listeners = this.onceListeners.get(name);
        listeners.forEach(listenerInfo => {
          try {
            if (listenerInfo.context) {
              listenerInfo.fn.call(listenerInfo.context, data, eventInfo);
            } else {
              listenerInfo.fn(data, eventInfo);
            }
            processedCount++;
          } catch (error) {
            this.handleError(error, name, listenerInfo);
          }
        });
        
        // 清除一次性监听器
        this.onceListeners.delete(name);
      }

    } catch (error) {
      this.handleError(error, name);
    }

    return processedCount;
  }

  /**
   * 将事件加入队列
   * @param {Object} eventInfo - 事件信息
   * @param {string} eventInfo.name - 事件名称
   * @param {*} eventInfo.data - 事件数据
   * @param {number} eventInfo.timestamp - 时间戳
   * @param {boolean} eventInfo.async - 是否异步
   * @param {string} eventInfo.id - 事件ID
   * @returns {void}
   */
  queueEvent(eventInfo) {
    if (this.eventQueue.length >= this.maxQueueSize) {
      console.warn('🎯 [EventManager] 事件队列已满，丢弃最旧事件');
      this.eventQueue.shift();
    }

    this.eventQueue.push(eventInfo);
    this.processEventQueue();
  }

  /**
   * 处理事件队列
   * @returns {Promise<void>} 处理完成的Promise
   */
  async processEventQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const eventInfo = this.eventQueue.shift();
        await new Promise(resolve => {
          setTimeout(() => {
            this.processEvent(eventInfo);
            resolve();
          }, 0);
        });
      }
    } catch (error) {
      console.error('🎯 [EventManager] 处理事件队列时出错:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 添加错误处理器
   * @param {Function} handler - 错误处理函数
   * @param {Object} handler.errorInfo - 错误信息对象
   * @param {Error} handler.errorInfo.error - 错误对象
   * @param {string} handler.errorInfo.event - 事件名称
   * @param {Object|null} handler.errorInfo.listenerInfo - 监听器信息
   * @param {number} handler.errorInfo.timestamp - 错误时间戳
   * @returns {void}
   */
  onError(handler) {
    if (typeof handler === 'function') {
      this.errorHandlers.push(handler);
    }
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} event - 事件名称
   * @param {Object|null} [listenerInfo=null] - 监听器信息
   * @param {string} listenerInfo.id - 监听器ID
   * @param {Function} listenerInfo.fn - 监听器函数
   * @param {number} listenerInfo.priority - 优先级
   * @param {Object|null} listenerInfo.context - 执行上下文
   * @returns {void}
   */
  handleError(error, event, listenerInfo = null) {
    const errorInfo = {
      error,
      event,
      listenerInfo,
      timestamp: Date.now()
    };

    console.error(`🎯 [EventManager] 事件处理错误 [${event}]:`, error);

    // 调用错误处理器
    this.errorHandlers.forEach(handler => {
      try {
        handler(errorInfo);
      } catch (handlerError) {
        console.error('🎯 [EventManager] 错误处理器本身出错:', handlerError);
      }
    });
  }

  /**
   * 更新事件统计
   * @param {string} event - 事件名称
   * @returns {void}
   */
  updateEventStats(event) {
    if (!this.eventStats.has(event)) {
      this.eventStats.set(event, { count: 0, lastEmitted: null });
    }
    
    const stats = this.eventStats.get(event);
    stats.count++;
    stats.lastEmitted = Date.now();
  }

  /**
   * 生成监听器ID
   * @returns {string} 唯一的监听器ID
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成事件ID
   * @returns {string} 唯一的事件ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取事件统计信息
   * @returns {Object} 统计信息
   * @returns {number} returns.totalEvents - 总事件数
   * @returns {number} returns.eventTypes - 事件类型数
   * @returns {number} returns.regularListeners - 常规监听器数
   * @returns {number} returns.onceListeners - 一次性监听器数
   * @returns {number} returns.queuedEvents - 队列中的事件数
   * @returns {boolean} returns.isProcessing - 是否正在处理
   * @returns {Object} returns.eventStats - 事件统计详情
   */
  getStats() {
    return {
      totalEvents: this.totalEvents,
      eventTypes: this.eventStats.size,
      regularListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      onceListeners: Array.from(this.onceListeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      queuedEvents: this.eventQueue.length,
      isProcessing: this.isProcessing,
      eventStats: Object.fromEntries(this.eventStats)
    };
  }

  /**
   * 清除所有监听器
   * @returns {void}
   */
  clear() {
    this.listeners.clear();
    this.onceListeners.clear();
    this.eventQueue = [];
    this.eventStats.clear();
    this.totalEvents = 0;
    
    console.log('🎯 [EventManager] 已清除所有监听器和事件');
  }

  /**
   * 销毁事件管理器
   * @returns {void}
   */
  destroy() {
    this.clear();
    this.errorHandlers = [];
    this.isProcessing = false;
    
    console.log('🎯 [EventManager] 事件管理器已销毁');
  }

  /**
   * 释放资源（dispose的别名）
   * @returns {void}
   */
  dispose() {
    this.destroy();
  }
}

export default EventManager;