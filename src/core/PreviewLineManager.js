/**
 * PreviewLineManager - 预览线管理器
 * 统一管理预览线的创建、更新、移除和DOM清理
 */
export class PreviewLineManager {
  constructor(resourceManager, container) {
    this.resourceManager = resourceManager
    this.container = container
    this.previewLines = new Map() // lineId -> { element, config }
    this.destroyed = false
    this.svgNamespace = 'http://www.w3.org/2000/svg'

    // 在资源管理器中注册自身
    if (this.resourceManager) {
      const resourceId = `PreviewLineManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.resourceManager.register(resourceId, this, () => this.destroy())
    }

    // 查找或创建SVG容器
    this._initializeSvgContainer()
  }

  /**
   * 创建预览线
   * @param {Object} config - 预览线配置
   * @param {number} config.x1 - 起点X坐标
   * @param {number} config.y1 - 起点Y坐标
   * @param {number} config.x2 - 终点X坐标
   * @param {number} config.y2 - 终点Y坐标
   * @param {string} config.stroke - 线条颜色
   * @param {number} config.strokeWidth - 线条宽度
   * @param {string} config.strokeDasharray - 虚线样式
   * @param {number} config.opacity - 透明度
   * @returns {string|null} 预览线ID，失败时返回null
   */
  createPreviewLine(config) {
    if (this.destroyed || !this._isValidConfig(config) || !this.svgContainer) {
      return null
    }

    try {
      // 生成唯一ID
      const lineId = `preview-line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // 创建SVG line元素
      const lineElement = document.createElementNS(this.svgNamespace, 'line')
      
      // 设置基本属性
      lineElement.setAttribute('data-preview-line-id', lineId)
      lineElement.setAttribute('x1', config.x1)
      lineElement.setAttribute('y1', config.y1)
      lineElement.setAttribute('x2', config.x2)
      lineElement.setAttribute('y2', config.y2)

      // 设置样式属性
      lineElement.setAttribute('stroke', config.stroke || '#007bff')
      lineElement.setAttribute('stroke-width', config.strokeWidth || 2)
      
      if (config.strokeDasharray) {
        lineElement.setAttribute('stroke-dasharray', config.strokeDasharray)
      }
      
      if (config.opacity !== undefined) {
        lineElement.setAttribute('opacity', config.opacity)
      }

      // 设置默认样式
      lineElement.setAttribute('fill', 'none')
      lineElement.setAttribute('pointer-events', 'none')

      // 添加到SVG容器
      this.svgContainer.appendChild(lineElement)

      // 记录到内部映射
      this.previewLines.set(lineId, {
        element: lineElement,
        config: { ...config },
        createdAt: Date.now()
      })

      return lineId
    } catch (error) {
      console.warn('Failed to create preview line:', error)
      return null
    }
  }

  /**
   * 更新预览线
   * @param {string} lineId - 预览线ID
   * @param {Object} config - 新的配置
   * @returns {boolean} 是否成功更新
   */
  updatePreviewLine(lineId, config) {
    if (this.destroyed || !lineId || !this.previewLines.has(lineId) || !this._isValidConfig(config)) {
      return false
    }

    try {
      const lineInfo = this.previewLines.get(lineId)
      const element = lineInfo.element

      // 更新坐标
      if (config.x1 !== undefined) element.setAttribute('x1', config.x1)
      if (config.y1 !== undefined) element.setAttribute('y1', config.y1)
      if (config.x2 !== undefined) element.setAttribute('x2', config.x2)
      if (config.y2 !== undefined) element.setAttribute('y2', config.y2)

      // 更新样式
      if (config.stroke !== undefined) element.setAttribute('stroke', config.stroke)
      if (config.strokeWidth !== undefined) element.setAttribute('stroke-width', config.strokeWidth)
      if (config.strokeDasharray !== undefined) element.setAttribute('stroke-dasharray', config.strokeDasharray)
      if (config.opacity !== undefined) element.setAttribute('opacity', config.opacity)

      // 更新内部配置
      Object.assign(lineInfo.config, config)
      lineInfo.updatedAt = Date.now()

      return true
    } catch (error) {
      console.warn('Failed to update preview line:', error)
      return false
    }
  }

  /**
   * 移除预览线
   * @param {string} lineId - 预览线ID
   * @returns {boolean} 是否成功移除
   */
  removePreviewLine(lineId) {
    if (this.destroyed || !lineId || !this.previewLines.has(lineId)) {
      return false
    }

    try {
      const lineInfo = this.previewLines.get(lineId)
      const element = lineInfo.element

      // 从DOM中移除
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }

      // 从内部映射移除
      this.previewLines.delete(lineId)

      return true
    } catch (error) {
      console.warn('Failed to remove preview line:', error)
      // 即使DOM操作失败，也要清理内部映射
      this.previewLines.delete(lineId)
      return false
    }
  }

  /**
   * 清理所有预览线
   * @returns {boolean} 是否成功清理
   */
  clearAllPreviewLines() {
    if (this.destroyed) {
      return false
    }

    try {
      const lineIds = Array.from(this.previewLines.keys())
      let successCount = 0

      for (const lineId of lineIds) {
        if (this.removePreviewLine(lineId)) {
          successCount++
        }
      }

      return successCount === lineIds.length
    } catch (error) {
      console.warn('Failed to clear all preview lines:', error)
      // 强制清理内部映射
      this.previewLines.clear()
      return false
    }
  }

  /**
   * 清理孤立的DOM元素
   * @returns {number} 清理的元素数量
   */
  cleanupOrphanedElements() {
    if (this.destroyed || !this.container) {
      return 0
    }

    try {
      const orphanedElements = this.container.querySelectorAll('[data-preview-line-id]')
      let cleanedCount = 0

      for (const element of orphanedElements) {
        const lineId = element.getAttribute('data-preview-line-id')
        
        // 如果内部映射中不存在该ID，则认为是孤立元素
        if (!this.previewLines.has(lineId)) {
          try {
            if (element.parentNode) {
              element.parentNode.removeChild(element)
            }
            cleanedCount++
          } catch (removeError) {
            console.warn('Failed to remove orphaned element:', removeError)
          }
        }
      }

      return cleanedCount
    } catch (error) {
      console.warn('Failed to cleanup orphaned elements:', error)
      return 0
    }
  }

  /**
   * 检查是否存在指定预览线
   * @param {string} lineId - 预览线ID
   * @returns {boolean}
   */
  hasPreviewLine(lineId) {
    return !this.destroyed && this.previewLines.has(lineId)
  }

  /**
   * 获取预览线数量
   * @returns {number}
   */
  getPreviewLineCount() {
    return this.destroyed ? 0 : this.previewLines.size
  }

  /**
   * 获取所有预览线ID
   * @returns {string[]}
   */
  getAllPreviewLineIds() {
    return this.destroyed ? [] : Array.from(this.previewLines.keys())
  }

  /**
   * 获取容器元素
   * @returns {Element|null}
   */
  getContainer() {
    return this.container
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    const domElementCount = this.container ? 
      this.container.querySelectorAll('[data-preview-line-id]').length : 0

    return {
      totalLines: this.getPreviewLineCount(),
      isDestroyed: this.destroyed,
      hasContainer: !!this.container,
      hasSvgContainer: !!this.svgContainer,
      domElementCount,
      memoryMappingCount: this.previewLines.size
    }
  }

  /**
   * 设置布局引擎引用
   * @param {Object} layoutEngine - 布局引擎实例
   */
  setLayoutEngine(layoutEngine) {
    this.layoutEngine = layoutEngine
    this.layoutEngineReady = !!layoutEngine
    console.log('🔗 [PreviewLineManager] 布局引擎引用已设置:', !!layoutEngine)
  }

  /**
   * 获取布局引擎引用
   * @returns {Object|null} 布局引擎实例
   */
  getLayoutEngine() {
    return this.layoutEngine || null
  }

  /**
   * 检查布局引擎是否就绪
   * @returns {boolean}
   */
  isLayoutEngineReady() {
    return this.layoutEngineReady === true
  }

  /**
   * 执行数据加载完成检查
   * 兼容性方法，用于支持布局引擎的清理操作
   */
  performLoadCompleteCheck() {
    console.log('🔍 [PreviewLineManager] 执行数据加载完成检查')
    // 清理孤立的预览线
    const cleanedCount = this.cleanupOrphanedElements()
    console.log(`✅ [PreviewLineManager] 数据加载完成检查完毕，清理了 ${cleanedCount} 个孤立元素`)
  }

  /**
   * 检查是否已销毁
   * @returns {boolean}
   */
  isDestroyed() {
    return this.destroyed
  }

  /**
   * 销毁管理器并清理所有资源
   */
  destroy() {
    if (this.destroyed) {
      return
    }

    try {
      // 清理所有预览线
      this.clearAllPreviewLines()

      // 清理孤立元素
      this.cleanupOrphanedElements()

      // 清理内部状态
      this.previewLines.clear()
      this.container = null
      this.svgContainer = null
      this.resourceManager = null
      this.destroyed = true
    } catch (error) {
      console.warn('Error during PreviewLineManager destruction:', error)
      // 确保标记为已销毁
      this.destroyed = true
    }
  }

  /**
   * 初始化SVG容器
   * @private
   */
  _initializeSvgContainer() {
    if (!this.container) {
      this.svgContainer = null
      return
    }

    try {
      // 查找现有的SVG元素
      let svgElement = this.container.querySelector('svg')
      
      if (!svgElement) {
        // 创建新的SVG元素
        svgElement = document.createElementNS(this.svgNamespace, 'svg')
        svgElement.setAttribute('width', '100%')
        svgElement.setAttribute('height', '100%')
        svgElement.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1000;')
        this.container.appendChild(svgElement)
      }

      this.svgContainer = svgElement
    } catch (error) {
      console.warn('Failed to initialize SVG container:', error)
      this.svgContainer = null
    }
  }

  /**
   * 验证配置是否有效
   * @private
   */
  _isValidConfig(config) {
    if (!config || typeof config !== 'object') {
      return false
    }

    // 检查必需的坐标属性
    const requiredProps = ['x1', 'y1', 'x2', 'y2']
    for (const prop of requiredProps) {
      if (config[prop] === undefined || typeof config[prop] !== 'number' || isNaN(config[prop])) {
        return false
      }
    }

    return true
  }
}