import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

/**
 * 画布工具栏功能组合式函数
 * 提取工具栏相关逻辑，包括缩放控制、拖拽模式、画布模式等
 */
export function useCanvasToolbar(graph, panZoomManager) {
  // 工具栏状态
  const currentDragMode = ref('default')
  const currentCanvasMode = ref('normal')
  const currentLayoutDirection = ref('TB')
  const isApplyingLayout = ref(false)
  const showMinimap = ref(false)
  const showHistoryPanel = ref(false)
  const showDebugPanel = ref(false)
  const showQueryPanel = ref(false)
  const showStatisticsPanel = ref(false)
  const showAudienceSplitTestPanel = ref(false)
  
  // 缩放相关状态
  const currentScale = ref(1)
  const scaleDisplayText = computed(() => {
    return `${Math.round(currentScale.value * 100)}%`
  })

  // 更新当前缩放比例
  const updateCurrentScale = () => {
    if (graph) {
      currentScale.value = graph.zoom()
    }
  }

  // 缩放控制方法
  const zoomIn = () => {
    if (panZoomManager) {
      panZoomManager.zoomIn()
      updateCurrentScale()
    } else if (graph) {
      const currentZoom = graph.zoom()
      graph.zoom(currentZoom * 1.2)
      updateCurrentScale()
    }
  }

  const zoomOut = () => {
    if (panZoomManager) {
      panZoomManager.zoomOut()
      updateCurrentScale()
    } else if (graph) {
      const currentZoom = graph.zoom()
      graph.zoom(currentZoom * 0.8)
      updateCurrentScale()
    }
  }

  const resetZoom = () => {
    if (panZoomManager) {
      panZoomManager.resetZoom()
      updateCurrentScale()
    } else if (graph) {
      graph.zoom(1, { absolute: true })
      updateCurrentScale()
    }
  }

  const fitToContent = () => {
    if (panZoomManager) {
      panZoomManager.fitToContent()
      updateCurrentScale()
    } else if (graph) {
      graph.zoomToFit({ padding: 20 })
      updateCurrentScale()
    }
  }

  // 拖拽模式控制
  const setDragMode = (mode) => {
    console.log('[useCanvasToolbar] 设置拖拽模式:', mode)
    currentDragMode.value = mode
    
    if (graph) {
      // 根据模式设置不同的拖拽行为
      switch (mode) {
        case 'default':
          // 默认拖拽模式
          break
        case 'precise':
          // 精确拖拽模式
          break
        case 'fast':
          // 快速拖拽模式
          break
      }
    }
  }

  // 画布模式控制
  const setCanvasMode = (mode) => {
    console.log('[useCanvasToolbar] 设置画布模式:', mode)
    currentCanvasMode.value = mode
    
    // 重置所有面板状态
    showQueryPanel.value = false
    showStatisticsPanel.value = false
    
    // 根据模式显示对应面板
    switch (mode) {
      case 'normal':
        // 正常模式，不显示特殊面板
        break
      case 'query':
        showQueryPanel.value = true
        break
      case 'statistics':
        showStatisticsPanel.value = true
        break
    }
  }

  // 布局方向控制
  const handleLayoutDirectionChange = (direction) => {
    console.log('[useCanvasToolbar] 切换布局方向:', direction)
    currentLayoutDirection.value = direction
  }

  // 小地图控制
  const toggleMinimap = () => {
    showMinimap.value = !showMinimap.value
    console.log('[useCanvasToolbar] 切换小地图显示:', showMinimap.value)
  }

  // 历史面板控制
  const toggleHistoryPanel = () => {
    showHistoryPanel.value = !showHistoryPanel.value
    console.log('[useCanvasToolbar] 切换历史面板显示:', showHistoryPanel.value)
  }

  // 调试面板控制
  const toggleDebugPanel = () => {
    showDebugPanel.value = !showDebugPanel.value
    console.log('[useCanvasToolbar] 切换调试面板显示:', showDebugPanel.value)
  }

  // 清空画布
  const clearCanvas = (nodes, connections, selectedNodeId, addStartNode, autoAddStartNode) => {
    if (graph) {
      console.log('[useCanvasToolbar] 开始清空画布')
      
      // 🔧 关键修复：在清空画布前，先清理预览线管理器状态
      try {
        // 尝试获取全局预览线管理器
        const previewManager = window.unifiedPreviewLineManager || window.previewLineSystem
        if (previewManager && typeof previewManager.clearAllPreviewLines === 'function') {
          console.log('[useCanvasToolbar] 清理预览线管理器状态')
          previewManager.clearAllPreviewLines()
        } else if (previewManager && typeof previewManager.destroy === 'function') {
          console.log('[useCanvasToolbar] 销毁预览线管理器')
          previewManager.destroy()
        } else {
          console.warn('[useCanvasToolbar] 未找到预览线管理器或清理方法')
        }
      } catch (error) {
        console.warn('[useCanvasToolbar] 清理预览线管理器时出错:', error)
      }
      
      // 清空图形中的所有单元格
      graph.clearCells()
      
      // 清空数据数组
      nodes.value = []
      connections.value = []
      selectedNodeId.value = null

      // 重新添加开始节点
      if (autoAddStartNode && addStartNode) {
        addStartNode()
      }

      console.log('[useCanvasToolbar] 画布已清理')
      Message.success('画布已清空')
    }
  }

  // 导出功能
  const handleExport = (format) => {
    if (!graph) {
      Message.error('图形实例不存在，无法导出')
      return
    }

    const fileName = `task-flow-${Date.now()}`
    
    try {
      switch (format) {
        case 'png':
          graph.exportPNG(fileName, {
            backgroundColor: '#ffffff',
            padding: 20,
            quality: 1
          })
          Message.success('PNG图片导出成功')
          break
        case 'jpg':
          graph.exportJPEG(fileName, {
            backgroundColor: '#ffffff',
            padding: 20,
            quality: 0.9
          })
          Message.success('JPG图片导出成功')
          break
        case 'svg':
          graph.exportSVG(fileName, {
            preserveDimensions: true,
            copyStyles: true,
            serializeImages: true
          })
          Message.success('SVG图片导出成功')
          break
        default:
          Message.error('不支持的导出格式')
      }
    } catch (error) {
      console.error('[useCanvasToolbar] 导出失败:', error)
      Message.error('导出失败: ' + error.message)
    }
  }

  // 统一布局应用
  const applyUnifiedStructuredLayout = async (configDrawers) => {
    console.log('[useCanvasToolbar] 应用统一结构化布局')
    
    if (!graph) {
      console.error('[useCanvasToolbar] 图实例不存在，无法应用结构化布局')
      Message.error('图实例不存在，无法应用结构化布局')
      return
    }
    
    if (!configDrawers.value?.structuredLayout) {
      console.error('[useCanvasToolbar] 结构化布局对象不存在')
      return
    }

    // 检查统一结构化布局方法是否可用
    if (!configDrawers.value.structuredLayout.applyUnifiedStructuredLayout) {
      console.error('[useCanvasToolbar] 统一结构化布局功能不可用')
      Message.error('统一结构化布局功能不可用')
      return
    }
    
    try {
      isApplyingLayout.value = true
      
      // 应用统一结构化布局
      const result = await configDrawers.value.structuredLayout.applyUnifiedStructuredLayout(graph)

      if (result && result.success) {
        console.log('[useCanvasToolbar] 统一结构化布局应用成功:', result)
        Message.success(`统一结构化布局应用成功 (${result.layoutTime.toFixed(2)}ms)`)
        
        // 自动缩放到合适大小，限制最大缩放比例为120%
        setTimeout(() => {
          // 先执行适应内容缩放
          graph.zoomToFit({ padding: 50 })
          
          // 检查并限制缩放比例
          const currentZoom = graph.zoom()
          if (currentZoom > 1.2) {
            console.log(`[useCanvasToolbar] 限制缩放比例从 ${currentZoom.toFixed(2)} 到 1.2`)
            graph.zoomTo(1.2, { center: graph.getGraphArea().center })
          }
          updateCurrentScale()
        }, 300)
      } else {
        console.error('[useCanvasToolbar] 统一结构化布局应用失败')
        Message.error('统一结构化布局应用失败')
      }
    } catch (error) {
      console.error('[useCanvasToolbar] 结构化布局应用失败:', error)
      Message.error('结构化布局应用失败: ' + error.message)
    } finally {
      isApplyingLayout.value = false
    }
  }

  return {
    // 状态
    currentDragMode,
    currentCanvasMode,
    currentLayoutDirection,
    isApplyingLayout,
    showMinimap,
    showHistoryPanel,
    showDebugPanel,
    showQueryPanel,
    showStatisticsPanel,
    showAudienceSplitTestPanel,
    currentScale,
    scaleDisplayText,
    
    // 方法
    updateCurrentScale,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    setDragMode,
    setCanvasMode,
    handleLayoutDirectionChange,
    toggleMinimap,
    toggleHistoryPanel,
    toggleDebugPanel,
    clearCanvas,
    handleExport,
    applyUnifiedStructuredLayout
  }
}