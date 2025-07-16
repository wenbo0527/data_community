import { ref } from 'vue'
import { Graph } from '@antv/x6'
import { canvasConfig } from '../utils/canvasConfig.js'
import { connectionValidator } from '../utils/connectionValidator.js'
import CanvasPanZoomManager from '../utils/CanvasPanZoomManager.js'

/**
 * 画布初始化 Composable
 * 负责 X6 画布的创建、配置和销毁
 */
export function useCanvasInit(containerRef, emit) {
  const graph = ref(null)
  const isCanvasReady = ref(false)
  const panZoomManager = ref(null)

  /**
   * 初始化画布
   */
  const initCanvas = () => {
    if (!containerRef.value) {
      console.warn('Canvas container not found')
      return
    }

    try {
      // 创建 X6 图形实例
      graph.value = new Graph({
        container: containerRef.value,
        ...canvasConfig.getBaseConfig(),
        connecting: {
          ...canvasConfig.getConnectingConfig(),
          validateConnection: connectionValidator.validate
        }
      })

      // 注册边添加事件
      graph.value.on('edge:added', connectionValidator.onEdgeAdded)

      // 初始化拖拽缩放管理器
      panZoomManager.value = new CanvasPanZoomManager(graph.value)

      // 标记画布准备就绪
      isCanvasReady.value = true
      
      // 触发画布准备就绪事件
      emit?.('canvas-ready', graph.value)
      
      console.log('Canvas initialized successfully with enhanced pan/zoom support')
    } catch (error) {
      console.error('Failed to initialize canvas:', error)
    }
  }

  /**
   * 调整画布大小
   */
  const resizeCanvas = () => {
    if (!graph.value || !containerRef.value) return

    try {
      const { offsetWidth, offsetHeight } = containerRef.value
      graph.value.resize(offsetWidth, offsetHeight)
    } catch (error) {
      console.error('调整画布大小失败:', error)
    }
  }

  /**
   * 清空画布
   */
  const clearCanvas = () => {
    if (!graph.value) return

    try {
      graph.value.clearCells()
    } catch (error) {
      console.error('清空画布失败:', error)
    }
  }

  /**
   * 获取画布数据
   */
  const getCanvasData = () => {
    if (!graph.value) return null

    try {
      return graph.value.toJSON()
    } catch (error) {
      console.error('获取画布数据失败:', error)
      return null
    }
  }

  /**
   * 设置画布数据
   */
  const setCanvasData = (data) => {
    if (!graph.value || !data) return

    try {
      graph.value.fromJSON(data)
    } catch (error) {
      console.error('设置画布数据失败:', error)
    }
  }

  /**
   * 销毁画布
   */
  const destroyCanvas = () => {
    // 销毁拖拽缩放管理器
    if (panZoomManager.value) {
      panZoomManager.value.destroy()
      panZoomManager.value = null
    }

    // 销毁画布实例
    if (graph.value) {
      try {
        graph.value.dispose()
        graph.value = null
      } catch (error) {
        console.error('销毁画布失败:', error)
      }
    }

    isCanvasReady.value = false
  }

  // 手动初始化方法（由组件调用）
  const initialize = () => {
    // 延迟初始化，确保 DOM 已渲染
    setTimeout(() => {
      initCanvas()
    }, 100)
  }

  return {
    graph: () => graph.value,
    isCanvasReady,
    panZoomManager: () => panZoomManager.value,
    initCanvas,
    initialize,
    destroyCanvas,
    resizeCanvas,
    clearCanvas,
    getCanvasData,
    setCanvasData,
    // 拖拽缩放相关方法
    zoomIn: () => panZoomManager.value?.zoomIn(),
    zoomOut: () => panZoomManager.value?.zoomOut(),
    resetZoom: () => panZoomManager.value?.resetZoom(),
    fitToContent: () => panZoomManager.value?.fitToContent(),
    getCurrentScale: () => panZoomManager.value?.getCurrentScale() || 1,
    setScale: (scale) => panZoomManager.value?.setScale(scale)
  }
}