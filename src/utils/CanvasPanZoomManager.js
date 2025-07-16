/**
 * 画布拖拽和缩放管理器
 * 提供增强的画布交互体验
 */
export class CanvasPanZoomManager {
  constructor(graph) {
    this.graph = graph
    this.isPanning = false
    this.lastPanPoint = null
    this.panStartPoint = null
    this.minScale = 0.1
    this.maxScale = 5.0
    this.zoomStep = 0.1
    
    this.init()
  }

  /**
   * 初始化管理器
   */
  init() {
    if (!this.graph) return
    
    this.bindEvents()
    this.setupKeyboardShortcuts()
    console.log('[CanvasPanZoomManager] 画布拖拽缩放管理器初始化完成')
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const container = this.graph.container
    
    // 设置默认光标
    container.style.cursor = 'default'
    
    // 鼠标事件
    container.addEventListener('mousedown', this.handleMouseDown.bind(this))
    container.addEventListener('mousemove', this.handleMouseMove.bind(this))
    container.addEventListener('mouseup', this.handleMouseUp.bind(this))
    container.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    container.addEventListener('mouseenter', this.handleMouseEnter.bind(this))
    
    // 滚轮事件
    container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false })
    
    // 触摸事件（移动端支持）
    container.addEventListener('touchstart', this.handleTouchStart.bind(this))
    container.addEventListener('touchmove', this.handleTouchMove.bind(this))
    container.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  /**
   * 设置键盘快捷键
   */
  setupKeyboardShortcuts() {
    this.handleKeyDown = (e) => {
      // 防止在输入框中触发
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      switch (e.key) {
        case '=':
        case '+':
          e.preventDefault()
          this.zoomIn()
          break
        case '-':
          e.preventDefault()
          this.zoomOut()
          break
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            this.resetZoom()
          }
          break
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            this.fitToContent()
          }
          break
      }
    }
    
    document.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * 鼠标按下事件
   */
  handleMouseDown(e) {
    // 检查是否点击在空白区域
    const target = e.target
    const isBlankArea = target === this.graph.container || 
                       target.classList.contains('x6-graph-svg') ||
                       target.classList.contains('x6-graph-svg-stage') ||
                       target.tagName === 'svg'
    
    if (isBlankArea && e.button === 0) { // 只处理左键
      this.isPanning = true
      this.panStartPoint = { x: e.clientX, y: e.clientY }
      this.lastPanPoint = { x: e.clientX, y: e.clientY }
      this.graph.container.style.cursor = 'grabbing'
      e.preventDefault()
      e.stopPropagation()
    }
  }

  /**
   * 鼠标移动事件
   */
  handleMouseMove(e) {
    if (!this.isPanning || !this.lastPanPoint) return
    
    const deltaX = e.clientX - this.lastPanPoint.x
    const deltaY = e.clientY - this.lastPanPoint.y
    
    // 只有移动距离足够大时才进行平移，避免微小抖动
    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      // 应用平移
      this.graph.translate(deltaX, deltaY)
      this.lastPanPoint = { x: e.clientX, y: e.clientY }
    }
    
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * 鼠标抬起事件
   */
  handleMouseUp(e) {
    if (this.isPanning) {
      this.isPanning = false
      this.lastPanPoint = null
      this.panStartPoint = null
      this.graph.container.style.cursor = 'default'
      e.preventDefault()
      e.stopPropagation()
    }
  }

  /**
   * 鼠标离开事件
   */
  handleMouseLeave(e) {
    this.handleMouseUp(e)
  }

  /**
   * 鼠标进入事件
   */
  handleMouseEnter(e) {
    // 检查是否在空白区域
    const target = e.target
    const isBlankArea = target === this.graph.container || 
                       target.classList.contains('x6-graph-svg') ||
                       target.classList.contains('x6-graph-svg-stage') ||
                       target.tagName === 'svg'
    
    if (isBlankArea && !this.isPanning) {
      this.graph.container.style.cursor = 'grab'
    }
  }

  /**
   * 滚轮事件 - 已禁用缩放功能
   */
  handleWheel(e) {
    // 禁用滚轮缩放，只阻止默认行为
    e.preventDefault()
    e.stopPropagation()
    
    // 可选：显示提示信息告知用户使用拖拽移动画布
    // console.log('[CanvasPanZoomManager] 滚轮缩放已禁用，请使用鼠标拖拽移动画布')
  }

  /**
   * 触摸开始事件
   */
  handleTouchStart(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      this.handleMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: e.target,
        preventDefault: () => e.preventDefault()
      })
    }
  }

  /**
   * 触摸移动事件
   */
  handleTouchMove(e) {
    if (e.touches.length === 1 && this.isPanning) {
      const touch = e.touches[0]
      this.handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault()
      })
    }
  }

  /**
   * 触摸结束事件
   */
  handleTouchEnd(e) {
    this.handleMouseUp(e)
  }

  /**
   * 在指定点缩放
   */
  zoomAtPoint(delta, clientX, clientY) {
    const currentScale = this.graph.zoom()
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, currentScale + delta))
    
    if (newScale !== currentScale) {
      // 计算缩放中心点
      const graphPoint = this.graph.clientToLocal(clientX, clientY)
      
      // 应用缩放
      this.graph.zoom(newScale, { absolute: true })
      
      // 调整位置以保持缩放中心点不变
      const newGraphPoint = this.graph.clientToLocal(clientX, clientY)
      const dx = graphPoint.x - newGraphPoint.x
      const dy = graphPoint.y - newGraphPoint.y
      
      this.graph.translate(dx, dy)
    }
  }

  /**
   * 放大
   */
  zoomIn() {
    const rect = this.graph.container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    this.zoomAtPoint(this.zoomStep, centerX, centerY)
  }

  /**
   * 缩小
   */
  zoomOut() {
    const rect = this.graph.container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    this.zoomAtPoint(-this.zoomStep, centerX, centerY)
  }

  /**
   * 重置缩放
   */
  resetZoom() {
    this.graph.zoom(1, { absolute: true })
    this.graph.centerContent()
  }

  /**
   * 适应内容
   */
  fitToContent() {
    this.graph.zoomToFit({ padding: 50 })
  }

  /**
   * 获取当前缩放比例
   */
  getCurrentScale() {
    return this.graph.zoom()
  }

  /**
   * 设置缩放比例
   */
  setScale(scale) {
    const clampedScale = Math.max(this.minScale, Math.min(this.maxScale, scale))
    this.graph.zoom(clampedScale, { absolute: true })
  }

  /**
   * 销毁管理器
   */
  destroy() {
    const container = this.graph.container
    if (container) {
      // 重置光标
      container.style.cursor = 'default'
      
      // 移除所有事件监听器
      container.removeEventListener('mousedown', this.handleMouseDown)
      container.removeEventListener('mousemove', this.handleMouseMove)
      container.removeEventListener('mouseup', this.handleMouseUp)
      container.removeEventListener('mouseleave', this.handleMouseLeave)
      container.removeEventListener('mouseenter', this.handleMouseEnter)
      container.removeEventListener('wheel', this.handleWheel)
      container.removeEventListener('touchstart', this.handleTouchStart)
      container.removeEventListener('touchmove', this.handleTouchMove)
      container.removeEventListener('touchend', this.handleTouchEnd)
    }
    
    // 移除键盘事件监听器
    document.removeEventListener('keydown', this.handleKeyDown)
    
    // 重置状态
    this.isPanning = false
    this.lastPanPoint = null
    this.panStartPoint = null
    
    console.log('[CanvasPanZoomManager] 画布拖拽缩放管理器已销毁')
  }
}

export default CanvasPanZoomManager