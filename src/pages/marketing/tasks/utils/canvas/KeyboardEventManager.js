/**
 * 键盘事件管理器
 * 负责营销画布中所有键盘事件的统一管理、冲突解决和性能优化
 * 约200行代码
 */

// 简单的自定义事件管理器，不依赖外部导入
class SimpleEventManager {
  constructor() {
    this.listeners = new Map();
  }
  // 初始化事件处理机制已移除，逻辑在构造函数中处理
  /**
   * 启动事件队列处理
   */
  startQueueProcessing() {
    this.queueProcessingInterval = setInterval(() => {
      this.processEventQueue()
    }, this.config.queueProcessingInterval)
    
    if (this.config.debugMode) {
      console.log(`⌨️ [KeyboardEventManager] 事件队列处理已启动，间隔：${this.config.queueProcessingInterval}ms`)
    }
  }
  
  /**
   * 停止事件队列处理
   */
  stopQueueProcessing() {
    if (this.queueProcessingInterval) {
      clearInterval(this.queueProcessingInterval)
      this.queueProcessingInterval = null
      
      if (this.config.debugMode) {
        console.log('⌨️ [KeyboardEventManager] 事件队列处理已停止')
      }
    }
  }
  
  /**
   * 添加到事件队列
   * @param {Object} eventData - 事件数据
   */
  addToEventQueue(eventData) {
    if (this.eventQueue.length >= this.maxQueueSize) {
      // 队列已满，移除最旧的事件
      this.eventQueue.shift()
      this.performanceMetrics.queueOverflowCount++
      
      if (this.config.debugMode) {
        console.warn('⌨️ [KeyboardEventManager] 事件队列溢出，移除最旧事件')
      }
    }
    
    this.eventQueue.push(eventData)
    
    // 触发防抖处理
    if (this.config.enableDebouncing) {
      this.debouncedProcessQueue()
    }
  }
  
  /**
   * 处理事件队列
   */
  processEventQueue() {
    if (this.eventQueue.length === 0) {
      return
    }
    
    const startTime = performance.now()
    let processedCount = 0
    
    // 批量处理队列中的事件
    while (this.eventQueue.length > 0 && processedCount < 10) {
      const eventData = this.eventQueue.shift()
      
      try {
        this.processEventImmediately(eventData)
        processedCount++
      } catch (error) {
        console.error('⌨️ [KeyboardEventManager] 处理队列事件失败:', error)
      }
    }
    
    const processingTime = performance.now() - startTime
    
    if (this.config.debugMode && processedCount > 0) {
      console.log(`⌨️ [KeyboardEventManager] 批量处理 ${processedCount} 个事件，耗时：${processingTime.toFixed(2)}ms`)
    }
  }
  
  /**
   * 立即处理事件
   * @param {Object} eventData - 事件数据
   */
  processEventImmediately(eventData) {
    const { type, event, shortcut } = eventData
    
    try {
      switch (type) {
        case 'keydown':
          this.executeShortcutHandler(shortcut, event)
          break
        case 'keyup':
          this.handleKeyUpEvent(shortcut, event)
          break
        case 'keypress':
          this.handleKeyPressEvent(event)
          break
      }
    } catch (error) {
      console.error(`⌨️ [KeyboardEventManager] 立即处理事件失败 [${type}]:`, error)
      this.handleError(type, error, event)
    }
  }
  
  /**
   * 执行快捷键处理
   * @param {Object} shortcut - 快捷键配置
   * @param {KeyboardEvent} event - 键盘事件
   */
  executeShortcutHandler(shortcut, event) {
    if (shortcut.handler) {
      const eventData = this.createEventData(event, shortcut)
      shortcut.handler(eventData, event)
      
      if (this.config.debugMode) {
        console.log(`⌨️ [KeyboardEventManager] 执行快捷键处理: ${shortcut.name}`)
      }
    }
  }
  
  /**
   * 处理键盘释放事件
   * @param {Object} shortcut - 快捷键配置
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyUpEvent(shortcut, event) {
    if (shortcut && this.activeShortcuts.has(shortcut.name)) {
      this.activeShortcuts.delete(shortcut.name)
      
      const eventData = this.createEventData(event, shortcut)
      this.emit('keyup', eventData)
      this.addToHistory('keyup', eventData)
      
      if (this.config.debugMode) {
        console.log(`⌨️ [KeyboardEventManager] 键盘释放事件: ${shortcut.name}`)
      }
    }
  }
  
  /**
   * 处理键盘按键事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyPressEvent(event) {
    const eventData = {
      key: event.key,
      code: event.code,
      charCode: event.charCode,
      modifiers: { ...this.modifierStates },
      timestamp: Date.now()
    }
    
    this.emit('keypress', eventData)
    this.addToHistory('keypress', eventData)
  }
  
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(listener)
  }
  
  off(event, listener) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`事件监听器错误 [${event}]:`, error)
        }
      })
    }
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {Object} options - 选项
 * @returns {Function}
 */
function debounce(func, wait, options = {}) {
  let timeout
  let lastCallTime
  let lastInvokeTime = 0
  let lastArgs
  let lastThis
  let result
  
  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis
    
    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }
  
  function leadingEdge(time) {
    lastInvokeTime = time
    timeout = setTimeout(timerExpired, wait)
    return options.leading ? invokeFunc(time) : result
  }
  
  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall
    
    return Math.min(timeWaiting, wait - timeSinceLastInvoke)
  }
  
  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    
    return (lastCallTime === undefined || timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 || timeSinceLastInvoke >= wait)
  }
  
  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeout = setTimeout(timerExpired, remainingWait(time))
  }
  
  function trailingEdge(time) {
    timeout = undefined
    if (options.trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }
  
  function debounced(...args) {
    const time = Date.now()
    lastArgs = args
    lastThis = this
    lastCallTime = time
    
    if (timeout === undefined) {
      return leadingEdge(lastCallTime)
    }
    
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeout = setTimeout(timerExpired, remainingWait(time))
    return result
  }
  
  debounced.cancel = function() {
    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timeout = undefined
  }
  
  return debounced
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {Object} options - 选项
 * @returns {Function}
 */
function throttle(func, wait, options = {}) {
  let timeout
  let lastCallTime
  let lastInvokeTime = 0
  let lastArgs
  let lastThis
  let result
  
  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis
    
    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }
  
  function leadingEdge(time) {
    lastInvokeTime = time
    timeout = setTimeout(timerExpired, wait)
    return options.leading ? invokeFunc(time) : result
  }
  
  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall
    
    return Math.min(timeWaiting, wait - timeSinceLastInvoke)
  }
  
  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    
    return (lastCallTime === undefined || timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 || timeSinceLastInvoke >= wait)
  }
  
  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeout = setTimeout(timerExpired, remainingWait(time))
  }
  
  function trailingEdge(time) {
    timeout = undefined
    if (options.trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }
  
  function throttled(...args) {
    const time = Date.now()
    lastArgs = args
    lastThis = this
    lastCallTime = time
    
    if (timeout === undefined) {
      return leadingEdge(lastCallTime)
    }
    
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeout = setTimeout(timerExpired, remainingWait(time))
    return result
  }
  
  throttled.cancel = function() {
    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timeout = undefined
  }
  
  return throttled
}

/**
 * 键盘事件管理器类
 * 主要职责：
 * 1. 统一管理所有键盘事件
 * 2. 解决键盘事件冲突
 * 3. 提供事件优先级机制
 * 4. 支持事件拦截和阻止
 * 5. 提供调试和监控功能
 * 
 * @class KeyboardEventManager
 */
import { CanvasEventSystem, CanvasEventTypes } from '@/core'

export class KeyboardEventManager extends SimpleEventManager {
  constructor() {
    super()
    
    // 键盘状态
    this.keyStates = new Map()
    this.modifierStates = {
      ctrl: false,
      meta: false,
      shift: false,
      alt: false
    }
    
    // 事件处理状态
    this.isProcessing = false
    this.lastProcessedEvent = null
    this.eventThrottleMs = 16 // 约60fps
    
    // 事件队列管理
    this.eventQueue = []
    this.maxQueueSize = 100
    this.queueProcessingInterval = null
    this.debouncedProcessQueue = null
    this.throttledProcessEvent = null
    
    // 快捷键映射
    this.shortcuts = new Map()
    this.activeShortcuts = new Set()
    
    // 冲突检测
    this.conflictResolver = new Map()
    this.eventHistory = []
    this.maxHistorySize = 50
    
    // 性能监控
    this.performanceMetrics = {
      totalEvents: 0,
      processedEvents: 0,
      rejectedEvents: 0,
      averageProcessingTime: 0,
      lastProcessingTime: 0,
      queueOverflowCount: 0,
      debounceCount: 0,
      throttleCount: 0
    }
    
    // 配置选项
    this.config = {
      debugMode: false,
      enableThrottling: true,
      enableDebouncing: true,
      enableConflictResolution: true,
      enablePerformanceMonitoring: true,
      enableQueueManagement: true,
      maxConcurrentShortcuts: 3,
      queueProcessingInterval: 50, // 50ms处理一次队列
      debounceDelay: 150, // 防抖延迟
      throttleDelay: 16 // 节流延迟
    }
    
    // 已移除 initializeEventProcessing，初始化逻辑在构造函数中执行
    // 初始化防抖函数与节流函数
    this.debouncedProcessQueue = debounce(() => {
      this.processEventQueue()
    }, this.config.debounceDelay, { leading: false, trailing: true })
    this.throttledProcessEvent = throttle((eventData) => {
      this.processEventImmediately(eventData)
    }, this.config.throttleDelay, { leading: true, trailing: true })

    // 启动队列处理定时器
    if (this.config.enableQueueManagement) {
      this.startQueueProcessing()
    }

    console.log('⌨️ [KeyboardEventManager] 键盘事件管理器初始化完成')
  }
  
  /**
   * 初始化键盘事件管理器
   * @param {Object} options - 配置选项
   * @returns {Function} 清理函数
   */
  initialize(options = {}) {
    try {
      // 合并配置
      Object.assign(this.config, options)
      
      // 绑定键盘事件
      this.handleKeyDown = this.handleKeyDown.bind(this)
      this.handleKeyUp = this.handleKeyUp.bind(this)
      this.handleKeyPress = this.handleKeyPress.bind(this)
      
      // 改为订阅统一事件系统的键盘事件
      const offKeyDown = CanvasEventSystem.eventBus.on(
        CanvasEventTypes.KEYBOARD.KEY_DOWN,
        (eventData) => this.handleKeyDown(eventData.originalEvent || eventData)
      )
      const offKeyUp = CanvasEventSystem.eventBus.on(
        CanvasEventTypes.KEYBOARD.KEY_UP,
        (eventData) => this.handleKeyUp(eventData.originalEvent || eventData)
      )
      const offKeyPress = CanvasEventSystem.eventBus.on(
        CanvasEventTypes.KEYBOARD.KEY_PRESS,
        (eventData) => this.handleKeyPress(eventData.originalEvent || eventData)
      )
      
      console.log('⌨️ [KeyboardEventManager] 键盘事件绑定完成（事件总线）')
      
      // 返回清理函数
      return () => {
        if (typeof offKeyDown === 'function') offKeyDown()
        if (typeof offKeyUp === 'function') offKeyUp()
        if (typeof offKeyPress === 'function') offKeyPress()
        console.log('⌨️ [KeyboardEventManager] 键盘事件解绑完成（事件总线）')
      }
    } catch (error) {
      console.error('⌨️ [KeyboardEventManager] 初始化失败:', error)
      throw error
    }
  }
  
  /**
   * 处理键盘按下事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyDown(event) {
    try {
      const startTime = performance.now()
      this.performanceMetrics.totalEvents++
      
      // 更新修饰键状态
      this.updateModifierStates(event)
      
      // 检查是否应该处理此事件
      if (!this.shouldProcessEvent(event)) {
        this.performanceMetrics.rejectedEvents++
        return
      }
      
      // 查找匹配的快捷键
      const shortcut = this.findMatchingShortcut(event)
      if (!shortcut) {
        this.performanceMetrics.rejectedEvents++
        return
      }
      
      // 检查冲突
      if (this.config.enableConflictResolution && this.hasConflict(shortcut, event)) {
        const resolution = this.resolveConflict(shortcut, event)
        if (!resolution.shouldProcess) {
          this.performanceMetrics.rejectedEvents++
          if (this.config.debugMode) {
            console.log(`⌨️ [KeyboardEventManager] 快捷键冲突已解决，跳过处理: ${shortcut.name}`)
          }
          return
        }
      }
      
      // 创建事件数据
      const eventData = {
        type: 'keydown',
        event,
        shortcut,
        timestamp: Date.now()
      }
      
      // 根据配置选择处理方式
      if (this.config.enableQueueManagement) {
        // 添加到队列进行批量处理
        this.addToEventQueue(eventData)
      } else if (this.config.enableThrottling) {
        // 使用节流处理
        this.throttledProcessEvent(eventData)
        this.performanceMetrics.throttleCount++
      } else {
        // 立即处理
        this.processEventImmediately(eventData)
      }
      
      // 更新处理状态
      this.isProcessing = true
      this.lastProcessedEvent = {
        key: event.key,
        code: event.code,
        modifiers: { ...this.modifierStates },
        timestamp: Date.now(),
        shortcut: shortcut.name
      }
      
      // 添加到活动快捷键集合
      this.activeShortcuts.add(shortcut.name)
      
      // 添加到历史记录
      this.addToHistory('keydown', this.createEventData(event, shortcut))
      
      this.performanceMetrics.processedEvents++
      this.performanceMetrics.lastProcessingTime = performance.now() - startTime
      this.updateAverageProcessingTime()
      
      this.isProcessing = false
      
      if (this.config.debugMode) {
        console.log(`⌨️ [KeyboardEventManager] 处理键盘事件: ${shortcut.name}`, eventData)
      }
      
    } catch (error) {
      this.isProcessing = false
      console.error('⌨️ [KeyboardEventManager] 处理键盘事件失败:', error)
      this.handleError('keydown', error, event)
    }
  }
  
  /**
   * 处理键盘释放事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyUp(event) {
    try {
      this.updateModifierStates(event)
      
      // 查找之前激活的快捷键
      const shortcut = this.findMatchingShortcut(event)
      if (shortcut && this.activeShortcuts.has(shortcut.name)) {
        
        // 创建事件数据
        const eventData = {
          type: 'keyup',
          event,
          shortcut,
          timestamp: Date.now()
        }
        
        // 根据配置选择处理方式
        if (this.config.enableQueueManagement) {
          this.addToEventQueue(eventData)
        } else {
          this.handleKeyUpEvent(shortcut, event)
        }
      }
      
    } catch (error) {
      console.error('⌨️ [KeyboardEventManager] 处理键盘释放事件失败:', error)
      this.handleError('keyup', error, event)
    }
  }
  
  /**
   * 处理键盘按键事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyPress(event) {
    try {
      if (!this.shouldProcessEvent(event)) {
        return
      }
      
      // 创建事件数据
      const eventData = {
        type: 'keypress',
        event,
        timestamp: Date.now()
      }
      
      // 根据配置选择处理方式
      if (this.config.enableQueueManagement) {
        this.addToEventQueue(eventData)
      } else {
        this.handleKeyPressEvent(event)
      }
      
    } catch (error) {
      console.error('⌨️ [KeyboardEventManager] 处理键盘按键事件失败:', error)
      this.handleError('keypress', error, event)
    }
  }
  
  /**
   * 注册快捷键
   * @param {string} name - 快捷键名称
   * @param {Object} config - 快捷键配置
   */
  registerShortcut(name, config) {
    if (!name || !config) {
      console.warn('注册快捷键失败：无效的参数')
      return false
    }
    try {
      const shortcut = {
        name,
        key: config.key,
        code: config.code,
        modifiers: config.modifiers || {},
        handler: config.handler,
        priority: config.priority || 0,
        description: config.description || '',
        enabled: config.enabled !== false,
        preventDefault: config.preventDefault !== false,
        stopPropagation: config.stopPropagation || false,
        allowInInput: config.allowInInput || false
      }
      
      this.shortcuts.set(name, shortcut)
      
      if (this.config.debugMode) {
        console.log(`⌨️ [KeyboardEventManager] 注册快捷键: ${name}`)
      }
      
      return true
      
    } catch (error) {
      console.error(`⌨️ [KeyboardEventManager] 注册快捷键失败 [${name}]:`, error)
      throw error
    }
  }
  
  /**
   * 注销快捷键
   * @param {string} name - 快捷键名称
   */
  unregisterShortcut(name) {
    if (this.shortcuts.has(name)) {
      this.shortcuts.delete(name)
      this.activeShortcuts.delete(name)
      
      if (this.config.debugMode) {
        console.log(`⌨️ [KeyboardEventManager] 注销快捷键: ${name}`)
      }
    }
  }
  
  /**
   * 启用/禁用快捷键
   * @param {string} name - 快捷键名称
   * @param {boolean} enabled - 是否启用
   */
  setShortcutEnabled(name, enabled) {
    const shortcut = this.shortcuts.get(name)
    if (shortcut) {
      shortcut.enabled = enabled
      
      if (this.config.debugMode) {
        console.log(`⌨️ [KeyboardEventManager] ${enabled ? '启用' : '禁用'}快捷键: ${name}`)
      }
    }
  }
  
  /**
   * 检查是否应该处理事件
   * @param {KeyboardEvent} event - 键盘事件
   * @returns {boolean}
   */
  shouldProcessEvent(event) {
    // 检查是否在输入框中
    const activeElement = document.activeElement
    const isInputActive = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )
    
    if (isInputActive) {
      // 查找匹配的快捷键，检查是否允许在输入框中使用
      const shortcut = this.findMatchingShortcut(event)
      if (!shortcut || !shortcut.allowInInput) {
        return false
      }
    }
    
    // 检查并发限制
    const currentTime = Date.now()
    const timeWindow = 100 // 100ms时间窗口
    const recentEvents = this.eventHistory.filter(event => 
      currentTime - event.timestamp <= timeWindow
    )
    
    if (recentEvents.length >= this.config.maxConcurrentShortcuts) {
      if (this.config.debugMode) {
        console.warn(`键盘事件并发限制：${recentEvents.length} 个事件在 ${timeWindow}ms 内`)
      }
      return false // 返回false表示阻止事件处理
    }
    
    // 检查重复事件
    if (this.isDuplicateEvent(event)) {
      if (this.config.debugMode) {
        console.warn('⌨️ [KeyboardEventManager] 检测到重复事件，已过滤')
      }
      return false
    }
    
    return true
  }
  
  /**
   * 检查是否为重复事件
   * @param {KeyboardEvent} event - 键盘事件
   * @returns {boolean}
   */
  isDuplicateEvent(event) {
    if (!this.lastProcessedEvent) {
      return false
    }
    
    const now = Date.now()
    const timeSinceLastEvent = now - this.lastProcessedEvent.timestamp
    
    // 50ms内的相同按键事件视为重复
    if (timeSinceLastEvent < 50 &&
        this.lastProcessedEvent.key === event.key &&
        this.lastProcessedEvent.code === event.code &&
        JSON.stringify(this.lastProcessedEvent.modifiers) === JSON.stringify({
          ctrl: event.ctrlKey,
          meta: event.metaKey,
          shift: event.shiftKey,
          alt: event.altKey
        })) {
      return true
    }
    
    return false
  }
  
  /**
   * 查找匹配的快捷键
   * @param {KeyboardEvent} event - 键盘事件
   * @returns {Object|null}
   */
  findMatchingShortcut(event) {
    for (const [name, shortcut] of this.shortcuts) {
      if (!shortcut.enabled) continue
      
      // 检查按键匹配
      const keyMatch = (shortcut.key && shortcut.key === event.key) ||
                      (shortcut.code && shortcut.code === event.code)
      
      if (!keyMatch) continue
      
      // 检查修饰键匹配
      const modifiersMatch = (
        (shortcut.modifiers.ctrl === undefined || shortcut.modifiers.ctrl === event.ctrlKey) &&
        (shortcut.modifiers.meta === undefined || shortcut.modifiers.meta === event.metaKey) &&
        (shortcut.modifiers.shift === undefined || shortcut.modifiers.shift === event.shiftKey) &&
        (shortcut.modifiers.alt === undefined || shortcut.modifiers.alt === event.altKey)
      )
      
      if (modifiersMatch) {
        return shortcut
      }
    }
    
    return null
  }
  
  /**
   * 检查是否有冲突
   * @param {Object} shortcut - 快捷键配置
   * @param {KeyboardEvent} event - 键盘事件
   * @returns {boolean}
   */
  hasConflict(shortcut, event) {
    // 检查活动快捷键数量限制
    if (this.activeShortcuts.size >= this.config.maxConcurrentShortcuts) {
      return true
    }
    
    // 检查与当前拖拽状态的冲突
    if (window.globalDragStateManager && window.globalDragStateManager.isDragging()) {
      // 某些快捷键在拖拽时应该被阻止
      const blockedInDrag = ['copy', 'paste', 'select-all']
      if (blockedInDrag.some(action => shortcut.name.includes(action))) {
        return true
      }
    }
    
    return false
  }
  
  /**
   * 解决冲突
   * @param {Object} shortcut - 快捷键配置
   * @param {KeyboardEvent} event - 键盘事件
   * @returns {Object}
   */
  resolveConflict(shortcut, event) {
    // 简单的优先级比较
    const currentShortcuts = Array.from(this.activeShortcuts).map(name => this.shortcuts.get(name))
    const higherPriorityShortcuts = currentShortcuts.filter(s => s.priority > shortcut.priority)
    
    if (higherPriorityShortcuts.length > 0) {
      return {
        shouldProcess: false,
        reason: '存在更高优先级的活动快捷键'
      }
    }
    
    return {
      shouldProcess: true,
      reason: '无冲突或优先级足够高'
    }
  }
  
  /**
   * 更新修饰键状态
   * @param {KeyboardEvent} event - 键盘事件
   */
  updateModifierStates(event) {
    this.modifierStates.ctrl = event.ctrlKey
    this.modifierStates.meta = event.metaKey
    this.modifierStates.shift = event.shiftKey
    this.modifierStates.alt = event.altKey
  }
  
  /**
   * 检查是否被节流
   * @returns {boolean}
   */
  isThrottled() {
    if (!this.lastProcessedEvent) return false
    
    const now = Date.now()
    const timeSinceLastEvent = now - this.lastProcessedEvent.timestamp
    
    return timeSinceLastEvent < this.eventThrottleMs
  }
  
  /**
   * 创建事件数据
   * @param {KeyboardEvent} event - 键盘事件
   * @param {Object} shortcut - 快捷键配置
   * @returns {Object}
   */
  createEventData(event, shortcut) {
    return {
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      charCode: event.charCode,
      modifiers: { ...this.modifierStates },
      shortcut: shortcut.name,
      description: shortcut.description,
      timestamp: Date.now(),
      target: event.target,
      preventDefault: () => {
        if (shortcut.preventDefault) {
          event.preventDefault()
        }
      },
      stopPropagation: () => {
        if (shortcut.stopPropagation) {
          event.stopPropagation()
        }
      }
    }
  }
  
  /**
   * 添加到历史记录
   * @param {string} type - 事件类型
   * @param {Object} eventData - 事件数据
   */
  addToHistory(type, eventData) {
    this.eventHistory.push({
      type,
      data: eventData,
      timestamp: Date.now()
    })
    
    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }
  
  /**
   * 更新平均处理时间
   */
  updateAverageProcessingTime() {
    const totalTime = this.performanceMetrics.averageProcessingTime * 
                     (this.performanceMetrics.processedEvents - 1) + 
                     this.performanceMetrics.lastProcessingTime
    this.performanceMetrics.averageProcessingTime = 
      totalTime / this.performanceMetrics.processedEvents
  }
  
  /**
   * 处理错误
   * @param {string} type - 事件类型
   * @param {Error} error - 错误对象
   * @param {KeyboardEvent} event - 原始事件
   */
  handleError(type, error, event) {
    const errorInfo = {
      type,
      error: error.message,
      key: event?.key,
      code: event?.code,
      modifiers: { ...this.modifierStates },
      timestamp: Date.now()
    }
    
    console.error(`⌨️ [KeyboardEventManager] 键盘事件处理错误 [${type}]:`, errorInfo)
    this.emit('error', errorInfo)
  }
  
  /**
   * 获取性能指标
   * @returns {Object}
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      activeShortcuts: Array.from(this.activeShortcuts),
      shortcutsCount: this.shortcuts.size,
      historyLength: this.eventHistory.length,
      queueLength: this.eventQueue.length,
      queueOverflowRate: this.performanceMetrics.queueOverflowCount / Math.max(1, this.performanceMetrics.totalEvents),
      throttleRate: this.performanceMetrics.throttleCount / Math.max(1, this.performanceMetrics.totalEvents),
      debounceRate: this.performanceMetrics.debounceCount / Math.max(1, this.performanceMetrics.totalEvents)
    }
  }
  
  /**
   * 获取事件历史
   * @param {number} limit - 限制返回的记录数
   * @returns {Array}
   */
  getEventHistory(limit = 10) {
    return this.eventHistory.slice(-limit)
  }
  
  /**
   * 获取当前状态
   * @returns {Object}
   */
  getState() {
    return {
      modifierStates: { ...this.modifierStates },
      activeShortcuts: Array.from(this.activeShortcuts),
      isProcessing: this.isProcessing,
      shortcuts: Array.from(this.shortcuts.keys()),
      performance: this.getPerformanceMetrics()
    }
  }
  
  /**
   * 设置调试模式
   * @param {boolean} enabled - 是否启用调试模式
   */
  setDebugMode(enabled) {
    this.config.debugMode = enabled
    console.log(`⌨️ [KeyboardEventManager] 调试模式 ${enabled ? '启用' : '禁用'}`)
  }
  
  /**
   * 清理资源
   */
  destroy() {
    // 停止队列处理
    this.stopQueueProcessing()
    
    // 清理防抖和节流函数
    if (this.debouncedProcessQueue) {
      this.debouncedProcessQueue.cancel()
    }
    if (this.throttledProcessEvent) {
      this.throttledProcessEvent.cancel()
    }
    
    // 清理其他资源
    this.shortcuts.clear()
    this.activeShortcuts.clear()
    this.eventHistory = []
    this.eventQueue = []
    this.keyStates.clear()
    this.conflictResolver.clear()
    
    console.log('⌨️ [KeyboardEventManager] 键盘事件管理器已销毁')
  }
}