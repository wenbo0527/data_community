/**
 * 高性能预览线管理器
 * 优化预览线渲染性能，减少DOM操作，提供智能更新策略
 */

import { SmartCacheManager } from './SmartCacheManager.js'

export class HighPerformancePreviewLineManager {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = {
      enableVirtualization: true,
      enableBatching: true,
      maxVisibleLines: 100,
      updateThrottle: 16, // 60fps
      enableObjectPool: true,
      enableIntersectionObserver: true,
      ...options
    }
    
    // 智能缓存管理器
    this.cache = new SmartCacheManager({
      maxSize: 500,
      ttl: 180000, // 3分钟
      enableLRU: true
    })
    
    // 预览线存储
    this.previewLines = new Map()
    this.visibleLines = new Set()
    this.pendingUpdates = new Set()
    
    // 对象池
    this.objectPool = {
      lines: [],
      labels: [],
      animations: []
    }
    
    // 性能监控
    this.performance = {
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      poolHits: 0,
      poolMisses: 0,
      visibilityChecks: 0
    }
    
    // 视口管理
    this.viewport = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      scale: 1
    }
    
    // 节流的更新函数
    this.throttledUpdate = this.throttle(this.executeUpdate.bind(this), this.options.updateThrottle)
    
    // 初始化
    this.initializeManager()
  }

  /**
   * 初始化管理器
   */
  initializeManager() {
    // 初始化对象池
    this.initializeObjectPool()
    
    // 设置视口监听
    if (this.options.enableIntersectionObserver) {
      this.setupViewportObserver()
    }
    
    // 监听图形事件
    this.setupGraphListeners()
    
    console.log('[HighPerformancePreviewLineManager] 管理器初始化完成')
  }

  /**
   * 初始化对象池
   */
  initializeObjectPool() {
    const poolSize = Math.max(50, this.options.maxVisibleLines)
    
    // 预创建预览线对象
    for (let i = 0; i < poolSize; i++) {
      this.objectPool.lines.push(this.createLineObject())
      this.objectPool.labels.push(this.createLabelObject())
      this.objectPool.animations.push(this.createAnimationObject())
    }
    
    console.log('[HighPerformancePreviewLineManager] 对象池初始化完成', {
      linePool: this.objectPool.lines.length,
      labelPool: this.objectPool.labels.length,
      animationPool: this.objectPool.animations.length
    })
  }

  /**
   * 创建预览线
   * @param {Object} config - 预览线配置
   */
  async createPreviewLine(config) {
    const lineId = this.generateLineId(config)
    
    // 检查缓存
    const cachedLine = this.cache.get('previewLine', lineId)
    if (cachedLine && this.isLineValid(cachedLine, config)) {
      return this.activateCachedLine(cachedLine, config)
    }
    
    // 从对象池获取或创建新对象
    const lineObject = this.getFromPool('lines') || this.createLineObject()
    
    // 配置预览线
    const previewLine = await this.configurePreviewLine(lineObject, config)
    
    // 存储预览线
    this.previewLines.set(lineId, previewLine)
    
    // 缓存预览线
    this.cache.set('previewLine', lineId, {
      ...previewLine,
      timestamp: Date.now()
    })
    
    // 调度更新
    this.scheduleUpdate(lineId)
    
    return previewLine
  }

  /**
   * 配置预览线对象
   * @param {Object} lineObject - 线对象
   * @param {Object} config - 配置
   */
  async configurePreviewLine(lineObject, config) {
    const startTime = performance.now()
    
    try {
      // 基础配置
      lineObject.id = config.id || this.generateLineId(config)
      lineObject.type = config.type || 'default'
      lineObject.visible = true
      lineObject.zIndex = config.zIndex || 1
      
      // 几何配置
      lineObject.geometry = await this.calculateLineGeometry(config)
      
      // 样式配置
      lineObject.style = this.mergeLineStyle(config.style)
      
      // 动画配置
      if (config.animated) {
        lineObject.animation = this.getFromPool('animations') || this.createAnimationObject()
        this.configureAnimation(lineObject.animation, config.animation)
      }
      
      // 标签配置
      if (config.label) {
        lineObject.label = this.getFromPool('labels') || this.createLabelObject()
        this.configureLabel(lineObject.label, config.label)
      }
      
      // 交互配置
      lineObject.interactive = config.interactive !== false
      lineObject.events = new Map()
      
      // 性能优化标记
      lineObject.needsUpdate = true
      lineObject.lastUpdateTime = Date.now()
      
      const duration = performance.now() - startTime
      this.updatePerformanceStats('configure', duration)
      
      return lineObject
      
    } catch (error) {
      console.error('[HighPerformancePreviewLineManager] 预览线配置失败:', error)
      this.returnToPool('lines', lineObject)
      throw error
    }
  }

  /**
   * 计算线几何信息
   * @param {Object} config - 配置
   */
  async calculateLineGeometry(config) {
    const cacheKey = this.generateGeometryKey(config)
    const cached = this.cache.get('geometry', cacheKey)
    
    if (cached) {
      return cached
    }
    
    const geometry = {
      start: { x: config.startX, y: config.startY },
      end: { x: config.endX, y: config.endY },
      controlPoints: [],
      length: 0,
      bounds: null
    }
    
    // 计算控制点（贝塞尔曲线）
    if (config.curved) {
      geometry.controlPoints = this.calculateControlPoints(geometry.start, geometry.end, config.curvature)
    }
    
    // 计算长度
    geometry.length = this.calculateLineLength(geometry)
    
    // 计算边界框
    geometry.bounds = this.calculateLineBounds(geometry)
    
    // 缓存几何信息
    this.cache.set('geometry', cacheKey, geometry)
    
    return geometry
  }

  /**
   * 批量更新预览线
   * @param {Array} updates - 更新数组
   */
  async batchUpdatePreviewLines(updates) {
    if (!this.options.enableBatching || updates.length === 0) {
      return Promise.all(updates.map(update => this.updatePreviewLine(update)))
    }
    
    const startTime = performance.now()
    
    try {
      // 分组更新
      const groupedUpdates = this.groupUpdatesByType(updates)
      
      // 并行处理不同类型的更新
      const results = await Promise.all([
        this.batchUpdateGeometry(groupedUpdates.geometry || []),
        this.batchUpdateStyle(groupedUpdates.style || []),
        this.batchUpdateVisibility(groupedUpdates.visibility || [])
      ])
      
      // 合并结果
      const mergedResults = this.mergeUpdateResults(results)
      
      // 批量DOM更新
      await this.batchDOMUpdate(mergedResults)
      
      const duration = performance.now() - startTime
      this.updatePerformanceStats('batchUpdate', duration)
      
      console.log('[HighPerformancePreviewLineManager] 批量更新完成', {
        updateCount: updates.length,
        duration: `${duration.toFixed(2)}ms`
      })
      
      return mergedResults
      
    } catch (error) {
      console.error('[HighPerformancePreviewLineManager] 批量更新失败:', error)
      throw error
    }
  }

  /**
   * 虚拟化渲染
   */
  async virtualizeRendering() {
    if (!this.options.enableVirtualization) {
      return this.renderAllLines()
    }
    
    const startTime = performance.now()
    
    try {
      // 更新视口信息
      this.updateViewport()
      
      // 计算可见预览线
      const visibleLineIds = this.calculateVisibleLines()
      
      // 隐藏不可见的线
      await this.hideInvisibleLines(visibleLineIds)
      
      // 渲染可见的线
      await this.renderVisibleLines(visibleLineIds)
      
      // 更新可见线集合
      this.visibleLines = new Set(visibleLineIds)
      
      const duration = performance.now() - startTime
      this.updatePerformanceStats('virtualize', duration)
      
      console.log('[HighPerformancePreviewLineManager] 虚拟化渲染完成', {
        totalLines: this.previewLines.size,
        visibleLines: visibleLineIds.length,
        duration: `${duration.toFixed(2)}ms`
      })
      
    } catch (error) {
      console.error('[HighPerformancePreviewLineManager] 虚拟化渲染失败:', error)
    }
  }

  /**
   * 计算可见预览线
   */
  calculateVisibleLines() {
    const visibleLines = []
    const viewportBounds = this.getViewportBounds()
    
    this.previewLines.forEach((line, lineId) => {
      if (this.isLineInViewport(line, viewportBounds)) {
        visibleLines.push(lineId)
      }
    })
    
    // 限制最大可见线数
    if (visibleLines.length > this.options.maxVisibleLines) {
      // 按优先级排序（距离视口中心的距离）
      visibleLines.sort((a, b) => {
        const lineA = this.previewLines.get(a)
        const lineB = this.previewLines.get(b)
        const distanceA = this.calculateDistanceToViewportCenter(lineA)
        const distanceB = this.calculateDistanceToViewportCenter(lineB)
        return distanceA - distanceB
      })
      
      return visibleLines.slice(0, this.options.maxVisibleLines)
    }
    
    return visibleLines
  }

  /**
   * 智能预加载
   * @param {Array} visibleLineIds - 可见线ID数组
   */
  async intelligentPreload(visibleLineIds) {
    const preloadCandidates = []
    const viewportBounds = this.getExpandedViewportBounds(1.5) // 扩展1.5倍视口
    
    this.previewLines.forEach((line, lineId) => {
      if (!visibleLineIds.includes(lineId) && this.isLineInViewport(line, viewportBounds)) {
        preloadCandidates.push(lineId)
      }
    })
    
    // 限制预加载数量
    const maxPreload = Math.min(preloadCandidates.length, 20)
    const preloadLines = preloadCandidates.slice(0, maxPreload)
    
    // 异步预加载
    Promise.all(preloadLines.map(lineId => this.preloadLine(lineId)))
      .then(() => {
        console.log('[HighPerformancePreviewLineManager] 智能预加载完成', {
          preloadCount: preloadLines.length
        })
      })
      .catch(error => {
        console.warn('[HighPerformancePreviewLineManager] 预加载失败:', error)
      })
  }

  /**
   * 调度更新
   * @param {string} lineId - 线ID
   */
  scheduleUpdate(lineId) {
    this.pendingUpdates.add(lineId)
    this.throttledUpdate()
  }

  /**
   * 执行更新
   */
  async executeUpdate() {
    if (this.pendingUpdates.size === 0) return
    
    const updateIds = Array.from(this.pendingUpdates)
    this.pendingUpdates.clear()
    
    try {
      // 虚拟化渲染
      await this.virtualizeRendering()
      
      // 智能预加载
      const visibleLineIds = Array.from(this.visibleLines)
      await this.intelligentPreload(visibleLineIds)
      
    } catch (error) {
      console.error('[HighPerformancePreviewLineManager] 更新执行失败:', error)
    }
  }

  /**
   * 对象池管理
   */
  
  getFromPool(type) {
    const pool = this.objectPool[type]
    if (pool && pool.length > 0) {
      this.performance.poolHits++
      return pool.pop()
    }
    this.performance.poolMisses++
    return null
  }
  
  returnToPool(type, object) {
    if (!object) return
    
    // 重置对象状态
    this.resetObject(object, type)
    
    // 返回到池中
    const pool = this.objectPool[type]
    if (pool && pool.length < 100) { // 限制池大小
      pool.push(object)
    }
  }

  /**
   * 工具方法
   */
  
  createLineObject() {
    return {
      id: null,
      type: 'default',
      visible: false,
      geometry: null,
      style: null,
      animation: null,
      label: null,
      interactive: true,
      events: new Map(),
      needsUpdate: true,
      lastUpdateTime: 0,
      domElement: null
    }
  }
  
  createLabelObject() {
    return {
      text: '',
      position: { x: 0, y: 0 },
      style: {},
      visible: true,
      domElement: null
    }
  }
  
  createAnimationObject() {
    return {
      type: 'none',
      duration: 1000,
      easing: 'ease',
      loop: false,
      progress: 0,
      playing: false
    }
  }
  
  generateLineId(config) {
    return `line_${config.startX}_${config.startY}_${config.endX}_${config.endY}_${Date.now()}`
  }
  
  generateGeometryKey(config) {
    return `geo_${config.startX}_${config.startY}_${config.endX}_${config.endY}_${config.curved || false}`
  }
  
  throttle(func, limit) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  updatePerformanceStats(operation, duration) {
    this.performance.renderCount++
    this.performance.totalRenderTime += duration
    this.performance.averageRenderTime = this.performance.totalRenderTime / this.performance.renderCount
  }
  
  getPerformanceStats() {
    return {
      ...this.performance,
      cacheStats: this.cache.getStats(),
      poolStats: {
        lines: this.objectPool.lines.length,
        labels: this.objectPool.labels.length,
        animations: this.objectPool.animations.length
      },
      visibleLines: this.visibleLines.size,
      totalLines: this.previewLines.size
    }
  }
  
  // 其他方法的占位符
  setupViewportObserver() { /* 实现视口观察器 */ }
  setupGraphListeners() { /* 实现图形事件监听 */ }
  mergeLineStyle(style) { return style /* 实现样式合并 */ }
  configureAnimation(animation, config) { /* 实现动画配置 */ }
  configureLabel(label, config) { /* 实现标签配置 */ }
  calculateControlPoints(start, end, curvature) { return [] /* 实现控制点计算 */ }
  calculateLineLength(geometry) { return 0 /* 实现长度计算 */ }
  calculateLineBounds(geometry) { return null /* 实现边界计算 */ }
  updateViewport() { /* 实现视口更新 */ }
  getViewportBounds() { return null /* 实现视口边界获取 */ }
  getExpandedViewportBounds(factor) { return null /* 实现扩展视口边界 */ }
  isLineInViewport(line, bounds) { return true /* 实现视口检查 */ }
  calculateDistanceToViewportCenter(line) { return 0 /* 实现距离计算 */ }
  preloadLine(lineId) { /* 实现预加载 */ }
  resetObject(object, type) { /* 实现对象重置 */ }
  groupUpdatesByType(updates) { return {} /* 实现更新分组 */ }
  batchUpdateGeometry(updates) { /* 实现几何批量更新 */ }
  batchUpdateStyle(updates) { /* 实现样式批量更新 */ }
  batchUpdateVisibility(updates) { /* 实现可见性批量更新 */ }
  mergeUpdateResults(results) { return {} /* 实现结果合并 */ }
  batchDOMUpdate(results) { /* 实现DOM批量更新 */ }
  hideInvisibleLines(visibleLineIds) { /* 实现隐藏不可见线 */ }
  renderVisibleLines(visibleLineIds) { /* 实现渲染可见线 */ }
  renderAllLines() { /* 实现渲染所有线 */ }
  isLineValid(cachedLine, config) { return true /* 实现线有效性检查 */ }
  activateCachedLine(cachedLine, config) { return cachedLine /* 实现缓存线激活 */ }
  updatePreviewLine(update) { /* 实现预览线更新 */ }
}