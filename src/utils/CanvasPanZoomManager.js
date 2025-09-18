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
    
    // 调试标志
    this.loggedNonPanning = false
    
    // 位移累积算法相关
    this.accumulatedDelta = { x: 0, y: 0 } // 累积的位移
    this.lastProcessedTime = 0 // 上次处理时间
    this.minProcessInterval = 16 // 最小处理间隔(约60fps)
    this.smoothingFactor = 0.95 // 提高平滑因子，减少过度平滑
    
    // 拖拽模式配置
    this.dragModes = {
      default: {
        cursor: 'grab',
        sensitivity: 1.5, // 提高默认灵敏度
        name: '默认模式',
        description: '平衡速度和精度'
      },
      precise: {
        cursor: 'crosshair',
        sensitivity: 0.5, // 稍微提高精确模式灵敏度
        name: '精确模式',
        description: '适合精细调整'
      },
      fast: {
        cursor: 'move',
        sensitivity: 2.5, // 提高快速模式灵敏度
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
    // console.log('[CanvasPanZoomManager] 增强版画布拖拽缩放管理器初始化完成')
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const container = this.graph.container
    
    // 设置默认光标
    this.updateCursor()
    
    // 🔧 关键修复：使用冒泡阶段而不是捕获阶段，让X6的节点拖拽事件优先处理
    // 这样X6可以先处理节点拖拽，如果X6没有处理（如空白区域点击），事件会冒泡到我们的处理器
    container.addEventListener('mousedown', this.handleMouseDown.bind(this), false)
    container.addEventListener('mousemove', this.handleMouseMove.bind(this), false)
    container.addEventListener('mouseup', this.handleMouseUp.bind(this), false)
    container.addEventListener('mouseleave', this.handleMouseLeave.bind(this), false)
    container.addEventListener('mouseenter', this.handleMouseEnter.bind(this), false)
    
    // 全局事件监听 - 确保拖拽在容器外也能正常工作
    this.globalMouseMove = this.handleMouseMove.bind(this)
    this.globalMouseUp = this.handleMouseUp.bind(this)
    document.addEventListener('mousemove', this.globalMouseMove, true)
    document.addEventListener('mouseup', this.globalMouseUp, true)
    
    // 滚轮事件（支持Ctrl+滚轮缩放）
    container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false, capture: true })
    
    // 触摸事件（移动端支持）
    container.addEventListener('touchstart', this.handleTouchStart.bind(this), true)
    container.addEventListener('touchmove', this.handleTouchMove.bind(this), true)
    container.addEventListener('touchend', this.handleTouchEnd.bind(this), true)
    
    // 画布事件监听
    this.graph.on('scale', this.handleScaleChange.bind(this))
    this.graph.on('translate', this.handleTranslateChange.bind(this))
    
    // console.log('🔗 [CanvasPanZoomManager] 事件监听器已绑定（捕获阶段 + 全局事件）')
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
    // console.log('🖱️ [CanvasPanZoomManager] 鼠标按下事件触发:', {
    //   button: e.button,
    //   clientX: e.clientX,
    //   clientY: e.clientY,
    //   target: e.target,
    //   targetTagName: e.target.tagName,
    //   targetClasses: e.target.className,
    //   targetId: e.target.id
    // })
    
    // 检查是否点击在空白区域
    const target = e.target
    
    // 检查是否是预览线或其他交互元素
    const isPreviewLine = target.tagName === 'path' && (
      target.id.includes('preview') || 
      target.id.includes('unified_preview') ||
      target.classList.contains('x6-edge-path') ||
      // 检查父元素是否包含预览线标识
      (target.parentElement && (
        target.parentElement.id.includes('preview') ||
        target.parentElement.id.includes('unified_preview')
      )) ||
      // 检查是否有预览线相关的data属性
      target.getAttribute('data-preview') ||
      target.getAttribute('data-unified-preview') ||
      // 检查是否是X6边的路径元素
      (target.classList.contains('x6-edge-path') || 
       target.parentElement?.classList.contains('x6-edge'))
    )
    
    // 检查是否是节点或其他交互元素
    const isInteractiveElement = target.tagName === 'rect' || 
                                target.tagName === 'circle' || 
                                target.tagName === 'ellipse' ||
                                target.tagName === 'text' ||
                                target.tagName === 'image' ||
                                target.tagName === 'g' ||
                                target.classList.contains('x6-node') ||
                                target.classList.contains('x6-port') ||
                                isPreviewLine
    
    const isBlankArea = !isInteractiveElement && (
      target === this.graph.container || 
      target.classList.contains('x6-graph-svg') ||
      target.classList.contains('x6-graph-svg-stage') ||
      target.tagName === 'svg'
    )
    
    // console.log('🎯 [CanvasPanZoomManager] 空白区域检查:', {
    //   isBlankArea,
    //   isPreviewLine,
    //   isInteractiveElement,
    //   targetIsContainer: target === this.graph.container,
    //   hasX6GraphSvg: target.classList.contains('x6-graph-svg'),
    //   hasX6GraphSvgStage: target.classList.contains('x6-graph-svg-stage'),
    //   isSvgTag: target.tagName === 'svg',
    //   containerElement: this.graph.container,
    //   // 新增详细的目标元素信息
    //   targetDetails: {
    //     tagName: target.tagName,
    //     id: target.id,
    //     className: target.className,
    //     classList: Array.from(target.classList || []),
    //     parentId: target.parentElement?.id,
    //     parentClassName: target.parentElement?.className,
    //     dataAttributes: {
    //       preview: target.getAttribute('data-preview'),
    //       unifiedPreview: target.getAttribute('data-unified-preview')
    //     }
    //   }
    // })
    
    // 检查修饰键状态
    // console.log('⌨️ [CanvasPanZoomManager] 修饰键状态:', {
    //   isShiftPressed: this.isShiftPressed,
    //   isCtrlPressed: this.isCtrlPressed,
    //   isSpacePressed: this.isSpacePressed,
    //   tempPanningEnabled: this.tempPanningEnabled,
    //   currentDragMode: this.currentDragMode
    // })
    
    // 如果点击的是预览线，直接跳过画布拖拽处理，让事件传播到预览线
    if (isPreviewLine) {
      // console.log('🎯 [CanvasPanZoomManager] 检测到预览线点击，跳过画布拖拽处理')
      // 确保事件不被阻止，让它继续传播到预览线的事件监听器
      return // 直接返回，不阻止事件传播
    }
    
    // 🔧 关键修复：如果点击的是节点或其他交互元素，跳过画布拖拽处理，让事件传播到X6
    if (isInteractiveElement && !isPreviewLine) {
      console.log('🎯 [CanvasPanZoomManager] 检测到交互元素点击，跳过画布拖拽处理，让X6处理节点拖拽:', {
        targetTagName: target.tagName,
        targetClasses: target.className,
        targetId: target.id,
        isNode: target.classList.contains('x6-node'),
        isPort: target.classList.contains('x6-port')
      })
      // 直接返回，不阻止事件传播，让X6的节点拖拽处理器接管
      return
    }
    
    // 判断是否可以开始拖拽
    const canPan = isBlankArea && e.button === 0 && (
      this.tempPanningEnabled || // 空格键临时启用
      !this.isShiftPressed // 非Shift键模式下直接拖拽
    )
    
    // console.log('🚀 [CanvasPanZoomManager] 拖拽条件判断:', {
    //   canPan,
    //   isBlankArea,
    //   isLeftButton: e.button === 0,
    //   tempPanningEnabled: this.tempPanningEnabled,
    //   notShiftPressed: !this.isShiftPressed,
    //   finalCondition: `${isBlankArea} && ${e.button === 0} && (${this.tempPanningEnabled} || ${!this.isShiftPressed})`
    // })
    
    if (canPan) {
      // console.log('✅ [CanvasPanZoomManager] 开始拖拽操作')
      this.isPanning = true
      this.panStartPoint = { x: e.clientX, y: e.clientY }
      this.lastPanPoint = { x: e.clientX, y: e.clientY }
      this.accumulatedDelta = { x: 0, y: 0 }
      this.lastProcessedTime = performance.now()
      this.dragStartTime = performance.now() // 记录拖拽开始时间
      this.updateCursor('grabbing')
      
      // 记录拖拽开始
      const currentTranslate = this.graph.translate()
      // 已禁用拖拽开始日志以减少控制台冗余信息
      // console.log('🚀 [CanvasPanZoomManager] 拖拽开始:', {
      //   startPosition: { x: e.clientX, y: e.clientY },
      //   currentTranslate: { tx: currentTranslate.tx, ty: currentTranslate.ty },
      //   mode: this.currentDragMode,
      //   sensitivity: this.getCurrentSensitivity()
      // })
      
      // 启用高性能模式
      this.enableHighPerformanceMode()
      
      // 显示拖拽提示
      this.showPositionInfo(e.clientX, e.clientY)
      
      e.preventDefault()
      e.stopPropagation()
      
      // 已禁用拖拽状态设置日志以减少控制台冗余信息
      // console.log('🎯 [CanvasPanZoomManager] 拖拽状态已设置:', {
      //   isPanning: this.isPanning,
      //   panStartPoint: this.panStartPoint,
      //   lastPanPoint: this.lastPanPoint
      // })
    } else {
      // console.log('❌ [CanvasPanZoomManager] 拖拽条件不满足，无法开始拖拽')
      
      // 详细分析为什么不能拖拽
      // if (!isBlankArea) {
      //   console.log('❌ [CanvasPanZoomManager] 拒绝原因: 不是空白区域')
      // }
      // if (e.button !== 0) {
      //   console.log('❌ [CanvasPanZoomManager] 拒绝原因: 不是左键点击，button =', e.button)
      // }
      // if (!this.tempPanningEnabled && this.isShiftPressed) {
      //   console.log('❌ [CanvasPanZoomManager] 拒绝原因: 需要空格键或非Shift键模式')
      // }
    }
  }

  /**
   * 鼠标移动事件 - 使用位移累积算法
   */
  handleMouseMove(e) {
    if (!this.isPanning || !this.lastPanPoint) {
      return
    }
    
    const currentTime = performance.now()
    const deltaX = e.clientX - this.lastPanPoint.x
    const deltaY = e.clientY - this.lastPanPoint.y
    
    // 应用灵敏度调整
    const sensitivity = this.getCurrentSensitivity()
    const adjustedDeltaX = deltaX * sensitivity
    const adjustedDeltaY = deltaY * sensitivity
    
    // 累积位移
    this.accumulatedDelta.x += adjustedDeltaX
    this.accumulatedDelta.y += adjustedDeltaY
    
    // 检查是否需要处理累积的位移
    const shouldProcess = currentTime - this.lastProcessedTime >= this.minProcessInterval ||
                         Math.abs(this.accumulatedDelta.x) > 1 ||
                         Math.abs(this.accumulatedDelta.y) > 1
    
    if (shouldProcess && (Math.abs(this.accumulatedDelta.x) > 0.01 || Math.abs(this.accumulatedDelta.y) > 0.01)) {
      // 应用平滑处理
      const smoothedDeltaX = this.accumulatedDelta.x * this.smoothingFactor
      const smoothedDeltaY = this.accumulatedDelta.y * this.smoothingFactor
      
      // 检查边界限制
      const currentTranslate = this.graph.translate()
      const newTranslateX = currentTranslate.tx + smoothedDeltaX
      const newTranslateY = currentTranslate.ty + smoothedDeltaY
      
      // 应用边界检查和平移
      if (this.isWithinBounds(newTranslateX, newTranslateY)) {
        // 计算新的绝对位置并执行平移
        const newAbsoluteX = currentTranslate.tx + smoothedDeltaX
        const newAbsoluteY = currentTranslate.ty + smoothedDeltaY
        this.graph.translate(newAbsoluteX, newAbsoluteY)
        
        // 减少已处理的累积位移
        this.accumulatedDelta.x *= (1 - this.smoothingFactor)
        this.accumulatedDelta.y *= (1 - this.smoothingFactor)
        
        // 更新位置信息显示
        this.showPositionInfo(newTranslateX, newTranslateY)
      } else {
        // 接近边界时增加阻力
        const resistanceFactor = 0.1
        const resistedDeltaX = smoothedDeltaX * resistanceFactor
        const resistedDeltaY = smoothedDeltaY * resistanceFactor
        
        // 计算新的绝对位置并执行平移
        const newAbsoluteX = currentTranslate.tx + resistedDeltaX
        const newAbsoluteY = currentTranslate.ty + resistedDeltaY
        this.graph.translate(newAbsoluteX, newAbsoluteY)
        
        // 大幅减少累积位移，避免在边界处堆积
        this.accumulatedDelta.x *= 0.3
        this.accumulatedDelta.y *= 0.3
      }
      
      this.lastProcessedTime = currentTime
    }
    
    // 更新最后鼠标位置
    this.lastPanPoint = { x: e.clientX, y: e.clientY }
    
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * 鼠标抬起事件
   */
  handleMouseUp(e) {
    if (this.isPanning) {
      // 记录拖拽结束
      const currentTranslate = this.graph.translate()
      const dragStartTime = this.dragStartTime || this.lastProcessedTime
      const totalDragTime = performance.now() - dragStartTime
      const totalDistance = this.panStartPoint ? Math.sqrt(
        Math.pow(e.clientX - this.panStartPoint.x, 2) + 
        Math.pow(e.clientY - this.panStartPoint.y, 2)
      ) : 0
      
      // 已禁用拖拽结束日志以减少控制台冗余信息
      // console.log('🔚 [CanvasPanZoomManager] 拖拽结束:', {
      //   endPosition: { x: e.clientX, y: e.clientY },
      //   finalTranslate: { tx: currentTranslate.tx, ty: currentTranslate.ty },
      //   finalAccumulatedDelta: { ...this.accumulatedDelta },
      //   totalDragTime: Math.round(totalDragTime),
      //   totalDistance: Math.round(totalDistance),
      //   averageSpeed: totalDragTime > 0 ? Math.round(totalDistance / totalDragTime * 1000) / 1000 : 0
      // })
      
      this.isPanning = false
      this.lastPanPoint = null
      this.panStartPoint = null
      
      // 重置累积位移
      this.accumulatedDelta = { x: 0, y: 0 }
      this.lastProcessedTime = 0
      
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
    // 只有在非拖拽状态下才处理鼠标离开事件
    // 拖拽过程中鼠标可能会移出容器边界，这是正常的
    if (!this.isPanning) {
      // console.log('🚪 [CanvasPanZoomManager] 鼠标离开容器（非拖拽状态）')
      // 重置光标
      this.updateCursor()
    } else {
      // console.log('🚪 [CanvasPanZoomManager] 鼠标离开容器（拖拽状态中，继续拖拽）')
      // 拖拽状态下不结束拖拽，让用户可以在容器外继续拖拽
    }
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
    hint.id = 'endpoint'
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
    const hint = document.getElementById('endpoint')
    if (hint) {
      hint.remove()
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    // console.log('[CanvasPanZoomManager] 销毁管理器...')
    
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
    
    // 移除全局事件监听器
    if (this.globalMouseMove) {
      document.removeEventListener('mousemove', this.globalMouseMove, true)
    }
    if (this.globalMouseUp) {
      document.removeEventListener('mouseup', this.globalMouseUp, true)
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
    
    const dragHint = document.getElementById('endpoint')
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
    
    // console.log('[CanvasPanZoomManager] 画布拖拽缩放管理器已销毁')
  }
}

export default CanvasPanZoomManager