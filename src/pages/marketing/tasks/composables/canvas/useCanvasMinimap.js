import { ref, nextTick, onUnmounted } from 'vue'
import { MiniMap } from '@antv/x6-plugin-minimap'
import { Message } from '@arco-design/web-vue'

/**
 * 画布小地图功能组合式函数
 * 提取小地图相关逻辑
 */
export function useCanvasMinimap(graph) {
  // 小地图状态
  const showMinimap = ref(false)
  const minimapCollapsed = ref(false)
  const minimapContainer = ref(null)
  const minimapContent = ref(null)
  
  // 小地图实例
  let minimap = null

  // 初始化小地图
  const initMinimap = () => {
    if (!graph || !minimapContainer.value) {
      console.warn('[useCanvasMinimap] 无法初始化小地图：图实例或容器不存在')
      return
    }

    try {
      minimap = new MiniMap({
        container: minimapContainer.value,
        width: 200,
        height: 150,
        padding: 10,
        scalable: false,
        minScale: 0.01,
        maxScale: 16,
        graphOptions: {
          async: true,
          getCellView(cell) {
            // 简化小地图中的节点显示
            if (cell.isNode()) {
              return null // 使用默认视图
            }
          },
          createCellView(cell) {
            // 为小地图创建简化的视图
            if (cell.isNode()) {
              return null // 使用默认视图
            }
          }
        }
      })

      graph.use(minimap)
      console.log('[useCanvasMinimap] 小地图初始化成功')
      
      // 设置小地图样式
      setupMinimapStyles()
      
    } catch (error) {
      console.error('[useCanvasMinimap] 小地图初始化失败:', error)
      Message.error('小地图初始化失败')
    }
  }

  // 设置小地图样式
  const setupMinimapStyles = () => {
    if (!minimapContainer.value) return

    try {
      // 查找小地图的DOM元素并应用样式
      const minimapElement = minimapContainer.value.querySelector('.x6-widget-minimap')
      if (minimapElement) {
        minimapElement.style.border = '1px solid #e5e6eb'
        minimapElement.style.borderRadius = '6px'
        minimapElement.style.backgroundColor = '#fafafa'
      }

      // 设置视口样式
      const viewportElement = minimapContainer.value.querySelector('.x6-widget-minimap-viewport')
      if (viewportElement) {
        viewportElement.style.border = '2px solid #165dff'
        viewportElement.style.borderRadius = '2px'
      }

      console.log('[useCanvasMinimap] 小地图样式设置完成')
    } catch (error) {
      console.warn('[useCanvasMinimap] 设置小地图样式失败:', error)
    }
  }

  // 切换小地图显示
  const toggleMinimap = () => {
    showMinimap.value = !showMinimap.value
    
    console.log('[useCanvasMinimap] 切换小地图显示:', showMinimap.value)
    
    if (showMinimap.value && !minimap) {
      nextTick(() => {
        initMinimap()
      })
    } else if (!showMinimap.value && minimap) {
      // 可选：隐藏时销毁小地图以节省资源
      // disposeMinimap()
    }
  }

  // 切换小地图折叠状态
  const toggleMinimapCollapse = () => {
    minimapCollapsed.value = !minimapCollapsed.value
    console.log('[useCanvasMinimap] 切换小地图折叠状态:', minimapCollapsed.value)
  }

  // 关闭小地图
  const closeMinimap = () => {
    showMinimap.value = false
    console.log('[useCanvasMinimap] 关闭小地图')
    
    if (minimap) {
      disposeMinimap()
    }
  }

  // 销毁小地图
  const disposeMinimap = () => {
    if (!minimap || !graph) return

    try {
      graph.disposePlugin(minimap)
      minimap = null
      console.log('[useCanvasMinimap] 小地图已销毁')
    } catch (error) {
      console.error('[useCanvasMinimap] 销毁小地图失败:', error)
    }
  }

  // 更新小地图
  const updateMinimap = () => {
    if (!minimap) return

    try {
      // 强制更新小地图
      minimap.updateGraph()
      console.log('[useCanvasMinimap] 小地图已更新')
    } catch (error) {
      console.warn('[useCanvasMinimap] 更新小地图失败:', error)
    }
  }

  // 重置小地图视口
  const resetMinimapViewport = () => {
    if (!minimap || !graph) return

    try {
      // 重置视口到画布中心
      const graphArea = graph.getGraphArea()
      if (graphArea) {
        minimap.centerContent()
        console.log('[useCanvasMinimap] 小地图视口已重置')
      }
    } catch (error) {
      console.warn('[useCanvasMinimap] 重置小地图视口失败:', error)
    }
  }

  // 设置小地图尺寸
  const setMinimapSize = (width, height) => {
    if (!minimap) return

    try {
      minimap.resize(width, height)
      console.log('[useCanvasMinimap] 小地图尺寸已更新:', { width, height })
    } catch (error) {
      console.error('[useCanvasMinimap] 设置小地图尺寸失败:', error)
    }
  }

  // 获取小地图配置
  const getMinimapConfig = () => {
    if (!minimap) return null

    return {
      width: minimap.options.width,
      height: minimap.options.height,
      padding: minimap.options.padding,
      scalable: minimap.options.scalable,
      minScale: minimap.options.minScale,
      maxScale: minimap.options.maxScale
    }
  }

  // 监听画布变化并更新小地图
  const setupMinimapListeners = () => {
    if (!graph) return

    // 监听节点添加
    graph.on('node:added', () => {
      updateMinimap()
    })

    // 监听节点移除
    graph.on('node:removed', () => {
      updateMinimap()
    })

    // 监听边添加
    graph.on('edge:added', () => {
      updateMinimap()
    })

    // 监听边移除
    graph.on('edge:removed', () => {
      updateMinimap()
    })

    // 监听画布缩放
    graph.on('scale', () => {
      // 小地图会自动更新视口，无需手动处理
    })

    // 监听画布平移
    graph.on('translate', () => {
      // 小地图会自动更新视口，无需手动处理
    })

    console.log('[useCanvasMinimap] 小地图事件监听器已设置')
  }

  // 移除小地图事件监听器
  const removeMinimapListeners = () => {
    if (!graph) return

    graph.off('node:added')
    graph.off('node:removed')
    graph.off('edge:added')
    graph.off('edge:removed')
    graph.off('scale')
    graph.off('translate')

    console.log('[useCanvasMinimap] 小地图事件监听器已移除')
  }

  // 检查小地图是否可用
  const isMinimapAvailable = () => {
    return !!minimap && !!graph
  }

  // 获取小地图状态信息
  const getMinimapStatus = () => {
    return {
      isVisible: showMinimap.value,
      isCollapsed: minimapCollapsed.value,
      isInitialized: !!minimap,
      hasContainer: !!minimapContainer.value,
      config: getMinimapConfig()
    }
  }

  // 清理资源
  const cleanup = () => {
    removeMinimapListeners()
    disposeMinimap()
    
    // 重置状态
    showMinimap.value = false
    minimapCollapsed.value = false
    
    console.log('[useCanvasMinimap] 资源清理完成')
  }

  return {
    // 状态
    showMinimap,
    minimapCollapsed,
    minimapContainer,
    minimapContent,
    
    // 方法
    initMinimap,
    toggleMinimap,
    toggleMinimapCollapse,
    closeMinimap,
    disposeMinimap,
    updateMinimap,
    resetMinimapViewport,
    setMinimapSize,
    getMinimapConfig,
    setupMinimapListeners,
    removeMinimapListeners,
    isMinimapAvailable,
    getMinimapStatus,
    cleanup
  }
}