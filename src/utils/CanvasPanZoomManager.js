/**
 * 增强版画布拖拽和缩放管理器
 * 提供桌面端专属的画布交互体验
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
    
    // 拖拽模式配置
    this.dragModes = {
      default: {
        cursor: 'grab',
        sensitivity: 1.0,
        name: '默认模式',
        description: '平衡速度和精度'
      },
      precise: {
        cursor: 'crosshair',
        sensitivity: 0.3,
        name: '精确模式',
        description: '适合精细调整'
      },
      fast: {
        cursor: 'move',
        sensitivity: 2.0,
        name: '快速模式',
        description: '适合大范围导航'
      }
    }
    
    this.currentDragMode = 'default'
    this.isSpacePressed = false
    this.isShiftPressed = false
    this.isCtrlPressed = false
    this.tempPanningEnabled = false
    
    // 性能优化相关
    this.isHighPerformanceMode = false
    this.panThreshold = 2 // 最小移动距离阈值
    
    // 边界限制
    this.restrictArea = {
      x: -1000,
      y: -1000,
      width: 4000,
      height: 4000
    }
    
    this.init()
  }

  /**
   * 初始化管理器
   */
  init() {
    if (!this.graph) return
    
    this.bindEvents()
    this.setupKeyboardShortcuts()
    this.setupModeIndicator()
    this.setupPositionIndicator()
    console.log('[CanvasPanZoomManager] 增强版画布拖拽缩放管理器初始化完成')
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const container = this.graph.container
    
    // 设置默认光标
    this.updateCursor()
    
    // 鼠标事件
    container.addEventListener('mousedown', this.handleMouseDown.bind(this))
    container.addEventListener('mousemove', this.handleMouseMove.bind(this))
    container.addEventListener('mouseup', this.handleMouseUp.bind(this))
    container.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    container.addEventListener('mouseenter', this.handleMouseEnter.bind(this))
    
    // 滚轮事件（支持Ctrl+滚轮缩放）
    container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false })
    
    // 触摸事件（移动端支持）
    container.addEventListener('touchstart', this.handleTouchStart.bind(this))
    container.addEventListener('touchmove', this.handleTouchMove.bind(this))
    container.addEventListener('touchend', this.handleTouchEnd.bind(this))
    
    // 画布事件监听
    this.graph.on('scale', this.handleScaleChange.bind(this))
    this.graph.on('translate', this.handleTranslateChange.bind(this))
  }

  /**
   * 设置键盘快捷键
   */
  setupKeyboardShortcuts() {
    this.handleKeyDown = (e) => {
      // 防止在输入框中触发
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      // 更新修饰键状态
      this.isShiftPressed = e.shiftKey
      this.isCtrlPressed = e.ctrlKey || e.metaKey
      
      switch (e.key) {
        case ' ': // 空格键临时启用拖拽
          e.preventDefault()
          if (!this.isSpacePressed) {
            this.isSpacePressed = true
            this.tempPanningEnabled = true
            this.updateCursor('grab')
            this.showModeIndicator('临时拖拽模式', '松开空格键退出')
          }
          break
        case '1':
          e.preventDefault()
          this.setDragMode('default')
          break
        case '2':
          e.preventDefault()
          this.setDragMode('precise')
          break
        case '3':
          e.preventDefault()
          this.setDragMode('fast')
          break
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
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            this.fitToContent()
          }
          break
        case 'h':
        case 'H':
          e.preventDefault()
          this.centerContent()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          this.resetTransform()
          break
        case 'ArrowLeft':
          e.preventDefault()
          this.panByDirection('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          this.panByDirection('right')
          break
        case 'ArrowUp':
          e.preventDefault()
          this.panByDirection('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          this.panByDirection('down')
          break
      }
    }
    
    this.handleKeyUp = (e) => {
      // 更新修饰键状态
      this.isShiftPressed = e.shiftKey
      this.isCtrlPressed = e.ctrlKey || e.metaKey
      
      if (e.key === ' ') { // 空格键释放
        this.isSpacePressed = false
        this.tempPanningEnabled = false
        this.updateCursor()
        this.hideModeIndicator()
      }
    }
    
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
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
    
    // 判断是否可以开始拖拽
    const canPan = isBlankArea && e.button === 0 && (
      this.tempPanningEnabled || // 空格键临时启用
      !this.isShiftPressed // 非Shift键模式下直接拖拽
    )
    
    if (canPan) {
      this.isPanning = true
      this.panStartPoint = { x: e.clientX, y: e.clientY }
      this.lastPanPoint = { x: e.clientX, y: e.clientY }
      this.updateCursor('grabbing')
      
      // 启用高性能模式
      this.enableHighPerformanceMode()
      
      // 显示拖拽提示
      this.showPositionInfo(e.clientX, e.clientY)
      
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
    
    // 应用灵敏度调整
    const sensitivity = this.getCurrentSensitivity()
    const adjustedDeltaX = deltaX * sensitivity
    const adjustedDeltaY = deltaY * sensitivity
    
    // 只有移动距离足够大时才进行平移，避免微小抖动
    if (Math.abs(adjustedDeltaX) > this.panThreshold || Math.abs(adjustedDeltaY) > this.panThreshold) {
      // 检查边界限制
      const currentTranslate = this.graph.translate()
      const newTranslateX = currentTranslate.tx + adjustedDeltaX
      const newTranslateY = currentTranslate.ty + adjustedDeltaY
      
      // 应用边界检查
      if (this.isWithinBounds(newTranslateX, newTranslateY)) {
        this.graph.translate(adjustedDeltaX, adjustedDeltaY)
        this.lastPanPoint = { x: e.clientX, y: e.clientY }
        
        // 更新位置信息显示
        this.showPositionInfo(newTranslateX, newTranslateY)
      } else {
        // 接近边界时增加阻力
        const resistanceFactor = 0.1
        this.graph.translate(adjustedDeltaX * resistanceFactor, adjustedDeltaY * resistanceFactor)
        this.lastPanPoint = { x: e.clientX, y: e.clientY }
      }
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
      this.updateCursor()
      
      // 禁用高性能模式
      this.disableHighPerformanceMode()
      
      // 隐藏位置信息
      this.hidePositionInfo()
      
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
      this.updateCursor()
    }
  }

  /**
   * 滚轮事件 - 支持Ctrl+滚轮缩放
   */
  handleWheel(e) {
    // Ctrl+滚轮进行缩放
    if (this.isCtrlPressed || e.ctrlKey || e.metaKey) {
      e.preventDefault()
      e.stopPropagation()
      
      const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep
      this.zoomAtPoint(delta, e.clientX, e.clientY)
      
      // 显示缩放信息
      this.showZoomInfo()
    } else {
      // 普通滚轮滚动进行平移
      e.preventDefault()
      e.stopPropagation()
      
      const sensitivity = this.getCurrentSensitivity()
      const deltaX = -e.deltaX * sensitivity * 0.5
      const deltaY = -e.deltaY * sensitivity * 0.5
      
      // 检查边界
      const currentTranslate = this.graph.translate()
      const newTranslateX = currentTranslate.tx + deltaX
      const newTranslateY = currentTranslate.ty + deltaY
      
      if (this.isWithinBounds(newTranslateX, newTranslateY)) {
        this.graph.translate(deltaX, deltaY)
      }
    }
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
   * 获取当前灵敏度
   */
  getCurrentSensitivity() {
    let baseSensitivity = this.dragModes[this.currentDragMode].sensitivity
    
    // 根据修饰键调整灵敏度
    if (this.isShiftPressed) {
      baseSensitivity *= 2.0 // Shift键提高灵敏度
    } else if (this.isCtrlPressed) {
      baseSensitivity *= 0.3 // Ctrl键降低灵敏度
    }
    
    return baseSensitivity
  }

  /**
   * 检查是否在边界范围内
   */
  isWithinBounds(x, y) {
    return x >= this.restrictArea.x && 
           x <= this.restrictArea.x + this.restrictArea.width &&
           y >= this.restrictArea.y && 
           y <= this.restrictArea.y + this.restrictArea.height
  }

  /**
   * 更新光标样式
   */
  updateCursor(forceCursor = null) {
    const container = this.graph.container
    
    if (forceCursor) {
      container.style.cursor = forceCursor
    } else if (this.isPanning) {
      container.style.cursor = 'grabbing'
    } else if (this.tempPanningEnabled) {
      container.style.cursor = 'grab'
    } else {
      container.style.cursor = this.dragModes[this.currentDragMode].cursor
    }
  }

  /**
   * 设置拖拽模式
   */
  setDragMode(mode) {
    if (this.dragModes[mode]) {
      this.currentDragMode = mode
      this.updateCursor()
      this.showModeIndicator(
        this.dragModes[mode].name,
        this.dragModes[mode].description
      )
    }
  }

  /**
   * 方向键平移
   */
  panByDirection(direction) {
    const moveStep = 50 * this.getCurrentSensitivity()
    
    switch (direction) {
      case 'left':
        this.graph.translate(moveStep, 0)
        break
      case 'right':
        this.graph.translate(-moveStep, 0)
        break
      case 'up':
        this.graph.translate(0, moveStep)
        break
      case 'down':
        this.graph.translate(0, -moveStep)
        break
    }
  }

  /**
   * 居中内容
   */
  centerContent() {
    this.graph.centerContent()
  }

  /**
   * 重置变换
   */
  resetTransform() {
    this.graph.resetTransform()
  }

  /**
   * 启用高性能模式
   */
  enableHighPerformanceMode() {
    if (!this.isHighPerformanceMode) {
      this.isHighPerformanceMode = true
      // 可以在这里添加性能优化逻辑，比如降低渲染质量
      this.graph.container.style.imageRendering = 'pixelated'
    }
  }

  /**
   * 禁用高性能模式
   */
  disableHighPerformanceMode() {
    if (this.isHighPerformanceMode) {
      this.isHighPerformanceMode = false
      // 恢复正常渲染质量
      this.graph.container.style.imageRendering = 'auto'
    }
  }

  /**
   * 画布缩放变化事件
   */
  handleScaleChange() {
    // 可以在这里添加缩放变化的处理逻辑
  }

  /**
   * 画布平移变化事件
   */
  handleTranslateChange() {
    // 可以在这里添加平移变化的处理逻辑
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
   * 设置模式指示器
   */
  setupModeIndicator() {
    // 创建模式指示器容器
    const indicator = document.createElement('div')
    indicator.id = 'drag-mode-indicator'
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `
    document.body.appendChild(indicator)
  }

  /**
   * 设置位置指示器
   */
  setupPositionIndicator() {
    // 创建位置指示器容器
    const indicator = document.createElement('div')
    indicator.id = 'position-indicator'
    indicator.style.cssText = `
      position: fixed;
      bottom: 60px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `
    document.body.appendChild(indicator)
  }

  /**
   * 显示模式指示器
   */
  showModeIndicator(modeName, description) {
    const indicator = document.getElementById('drag-mode-indicator')
    if (indicator) {
      indicator.textContent = `拖拽模式: ${modeName} - ${description}`
      indicator.style.opacity = '1'
      
      // 3秒后淡出
      clearTimeout(this.modeIndicatorTimeout)
      this.modeIndicatorTimeout = setTimeout(() => {
        indicator.style.opacity = '0'
      }, 3000)
    }
  }

  /**
   * 隐藏模式指示器
   */
  hideModeIndicator() {
    const indicator = document.getElementById('drag-mode-indicator')
    if (indicator) {
      indicator.style.opacity = '0'
      clearTimeout(this.modeIndicatorTimeout)
    }
  }

  /**
   * 显示位置信息
   */
  showPositionInfo(x, y) {
    const indicator = document.getElementById('position-indicator')
    if (indicator) {
      const scale = this.graph.zoom()
      indicator.textContent = `位置: X=${Math.round(x)} Y=${Math.round(y)} 缩放: ${Math.round(scale * 100)}%`
      indicator.style.opacity = '1'
    }
  }

  /**
   * 隐藏位置信息
   */
  hidePositionInfo() {
    const indicator = document.getElementById('position-indicator')
    if (indicator) {
      indicator.style.opacity = '0'
    }
  }

  /**
   * 显示缩放信息
   */
  showZoomInfo() {
    const scale = this.graph.zoom()
    const indicator = document.getElementById('position-indicator')
    if (indicator) {
      const translate = this.graph.translate()
      indicator.textContent = `位置: X=${Math.round(translate.tx)} Y=${Math.round(translate.ty)} 缩放: ${Math.round(scale * 100)}%`
      indicator.style.opacity = '1'
      
      // 2秒后淡出
      clearTimeout(this.zoomInfoTimeout)
      this.zoomInfoTimeout = setTimeout(() => {
        indicator.style.opacity = '0'
      }, 2000)
    }
  }

  /**
   * 显示拖拽提示
   */
  showDragHint() {
    const hint = document.createElement('div')
    hint.id = 'drag-hint'
    hint.textContent = '拖拽中...'
    hint.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: sans-serif;
      font-size: 14px;
      z-index: 1001;
      pointer-events: none;
    `
    document.body.appendChild(hint)
  }

  /**
   * 隐藏拖拽提示
   */
  hideDragHint() {
    const hint = document.getElementById('drag-hint')
    if (hint) {
      hint.remove()
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    console.log('[CanvasPanZoomManager] 销毁管理器...')
    
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
    document.removeEventListener('keyup', this.handleKeyUp)
    
    // 移除图形事件监听器
    if (this.graph) {
      this.graph.off('scale', this.handleScaleChange)
      this.graph.off('translate', this.handleTranslateChange)
    }
    
    // 清理定时器
    if (this.modeIndicatorTimeout) {
      clearTimeout(this.modeIndicatorTimeout)
    }
    if (this.zoomInfoTimeout) {
      clearTimeout(this.zoomInfoTimeout)
    }
    
    // 清理UI元素
    const modeIndicator = document.getElementById('drag-mode-indicator')
    if (modeIndicator) {
      modeIndicator.remove()
    }
    
    const positionIndicator = document.getElementById('position-indicator')
    if (positionIndicator) {
      positionIndicator.remove()
    }
    
    const dragHint = document.getElementById('drag-hint')
    if (dragHint) {
      dragHint.remove()
    }
    
    // 重置状态
    this.isPanning = false
    this.lastPanPoint = null
    this.panStartPoint = null
    this.isSpacePressed = false
    this.isShiftPressed = false
    this.isCtrlPressed = false
    this.tempPanningEnabled = false
    this.isHighPerformanceMode = false
    this.currentDragMode = 'default'
    
    console.log('[CanvasPanZoomManager] 画布拖拽缩放管理器已销毁')
  }
}

export default CanvasPanZoomManager