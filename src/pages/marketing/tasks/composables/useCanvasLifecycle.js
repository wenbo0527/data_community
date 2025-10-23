/**
 * 画布生命周期管理组合函数
 * 负责画布的初始化、销毁、清理等生命周期相关逻辑
 */
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'

export function useCanvasLifecycle(
  graph,
  state,
  emit,
  {
    canvasContainer,
    initializeGraph,
    bindEvents,
    unbindEvents,
    destroyGraph,
    resetGraph,
    previewLineSystem,
    unifiedEdgeManager,
    minimap,
    panZoomManager,
    edgeOverlapManager,
    unifiedPreviewLineManager
  }
) {
  // 初始化状态
  const isInitializing = ref(false)
  const isDestroying = ref(false)
  const initializationPromise = ref(null)

  // 初始化画布 - 同步初始化
  const initCanvas = () => {
    // 防止重复初始化
    if (isInitializing.value) {
      console.log('[useCanvasLifecycle] 画布已在初始化中')
      return
    }

    console.log('[useCanvasLifecycle] 开始同步初始化画布')
    isInitializing.value = true

    try {
      // ========== 第1步：DOM容器准备 ==========
      console.log('[useCanvasLifecycle] 第1步：准备DOM容器')
      
      // 严格检查容器元素
      if (!canvasContainer.value) {
        throw new Error('画布容器引用未找到')
      }
      
      // 检查DOM元素是否真实存在
      const containerElement = canvasContainer.value
      if (!containerElement) {
        throw new Error('画布容器DOM元素不存在')
      }
      
      // 检查容器是否在文档中（更宽松的检查，适用于测试环境）
      if (!document.contains(containerElement)) {
        throw new Error('画布容器DOM元素未添加到文档中')
      }
      
      // 检查容器尺寸（在测试环境中可能为0，但不应该阻止初始化）
      const hasSize = containerElement.offsetWidth > 0 && containerElement.offsetHeight > 0
      if (!hasSize) {
        console.warn('[useCanvasLifecycle] 画布容器尺寸为0，可能在测试环境中')
      }
      
      console.log('[useCanvasLifecycle] ✓ DOM容器准备完成:', {
        element: containerElement.tagName,
        width: containerElement.offsetWidth,
        height: containerElement.offsetHeight
      })

      // ========== 第2步：Graph实例创建 ==========
      console.log('[useCanvasLifecycle] 第2步：创建Graph实例')
      
      // 确保之前的实例已清理
      if (graph.value) {
        console.log('[useCanvasLifecycle] 清理现有Graph实例')
        graph.value.dispose()
        graph.value = null
      }
      
      // 创建新的Graph实例（同步）
      const graphInstance = initializeGraph({
        container: containerElement,
        minimapContainer: null, // 暂时不使用小地图
        config: {} // 使用默认配置
      })
      if (!graphInstance || typeof graphInstance.on !== 'function') {
        throw new Error('Graph实例创建失败或无效')
      }
      
      // 设置Graph实例
      graph.value = graphInstance
      console.log('[useCanvasLifecycle] ✓ Graph实例创建完成:', {
        hasOnMethod: typeof graphInstance.on === 'function',
        hasNodes: typeof graphInstance.getNodes === 'function'
      })

      // ========== 第3步：系统组件初始化 ==========
      console.log('[useCanvasLifecycle] 第3步：初始化系统组件')
      
      // 注意：系统组件初始化已移到外部处理，这里只做基本验证
      console.log('[useCanvasLifecycle] ✓ 系统组件初始化跳过（由外部处理）')

      // ========== 第4步：事件绑定 ==========
      console.log('[useCanvasLifecycle] 第4步：绑定事件监听器')
      
      // 严格验证Graph实例
      if (!graph.value || typeof graph.value.on !== 'function') {
        const errorMsg = `Graph实例在事件绑定前无效: graph=${!!graph.value}, hasOnMethod=${graph.value ? typeof graph.value.on : 'N/A'}`
        console.error('[useCanvasLifecycle]', errorMsg)
        throw new Error(errorMsg)
      }
      
      console.log('[useCanvasLifecycle] Graph实例验证通过:', {
        hasGraph: !!graph.value,
        hasOnMethod: typeof graph.value.on === 'function',
        graphType: graph.value.constructor?.name || 'Unknown'
      })
      
      // 绑定事件监听器
      if (bindEvents) {
        try {
          console.log('[useCanvasLifecycle] 开始绑定事件...')
          bindEvents()
          console.log('[useCanvasLifecycle] ✓ 事件监听器绑定完成')
        } catch (error) {
          console.error('[useCanvasLifecycle] 事件绑定失败:', error)
          console.error('[useCanvasLifecycle] Graph状态:', {
            hasGraph: !!graph.value,
            hasOnMethod: graph.value ? typeof graph.value.on === 'function' : false,
            graphMethods: graph.value ? Object.getOwnPropertyNames(Object.getPrototypeOf(graph.value)) : []
          })
          throw new Error(`事件绑定失败: ${error.message}`)
        }
      } else {
        console.warn('[useCanvasLifecycle] bindEvents函数未提供，跳过事件绑定')
      }

      // ========== 第5步：设置就绪状态 ==========
      console.log('[useCanvasLifecycle] 第5步：设置就绪状态')
      
      // 设置图实例就绪状态
      state.isGraphReady.value = true

      // 触发初始化完成事件
      emit('canvas-initialized', { graph: graphInstance })

      console.log('[useCanvasLifecycle] ✅ 同步初始化完成')

    } catch (error) {
      console.error('[useCanvasLifecycle] 画布初始化失败:', error)
      
      // 清理状态
      state.isGraphReady.value = false
      if (graph.value) {
        try {
          graph.value.dispose()
        } catch (e) {
          console.error('[useCanvasLifecycle] 清理Graph实例失败:', e)
        }
        graph.value = null
      }
      
      Message.error(`画布初始化失败: ${error.message}`)
      throw error
    } finally {
      isInitializing.value = false
    }
  }

  // 销毁画布
  const destroyCanvas = async () => {
    if (isDestroying.value) {
      console.log('[useCanvasLifecycle] 画布已在销毁中')
      return
    }

    console.log('[useCanvasLifecycle] 开始销毁画布')
    isDestroying.value = true

    try {
      // 解绑事件监听器
      if (unbindEvents) {
        unbindEvents()
        console.log('[useCanvasLifecycle] 事件监听器已解绑')
      }

      // 清理小地图
      if (minimap && graph.value) {
        try {
          graph.value.disposePlugin(minimap)
          console.log('[useCanvasLifecycle] 小地图已清理')
        } catch (error) {
          console.error('[useCanvasLifecycle] 清理小地图失败:', error)
        }
      }

      // 销毁拖拽缩放管理器
      if (panZoomManager && panZoomManager.destroy) {
        try {
          panZoomManager.destroy()
          console.log('[useCanvasLifecycle] 拖拽缩放管理器已销毁')
        } catch (error) {
          console.error('[useCanvasLifecycle] 销毁拖拽缩放管理器失败:', error)
        }
      }

      // 清理连线重叠管理器
      if (edgeOverlapManager && edgeOverlapManager.cleanup) {
        try {
          edgeOverlapManager.cleanup()
          console.log('[useCanvasLifecycle] 连线重叠管理器已清理')
        } catch (error) {
          console.error('[useCanvasLifecycle] 清理连线重叠管理器失败:', error)
        }
      }

      // 清理预览线管理器
      if (unifiedPreviewLineManager && unifiedPreviewLineManager.destroy) {
        try {
          unifiedPreviewLineManager.destroy()
          console.log('[useCanvasLifecycle] 预览线管理器已清理')
        } catch (error) {
          console.error('[useCanvasLifecycle] 清理预览线管理器失败:', error)
        }
      }

      // 清理预览线系统实例
      if (window.previewLineSystem) {
        try {
          window.previewLineSystem.destroy()
          window.previewLineSystem = null
          console.log('[useCanvasLifecycle] PreviewLineSystem实例已清理')
        } catch (error) {
          console.error('[useCanvasLifecycle] 清理PreviewLineSystem实例失败:', error)
        }
      }

      // 销毁X6图实例
      if (destroyGraph) {
        destroyGraph()
        console.log('[useCanvasLifecycle] X6图实例已销毁')
      }

      // 重置状态
      state.isGraphReady.value = false
      graph.value = null

      console.log('[useCanvasLifecycle] 画布销毁完成')

    } catch (error) {
      console.error('[useCanvasLifecycle] 画布销毁失败:', error)
    } finally {
      isDestroying.value = false
    }
  }

  // 重置画布
  const resetCanvas = async () => {
    console.log('[useCanvasLifecycle] 开始重置画布')

    try {
      // 清理现有状态
      state.resetAllState()

      // 重置图实例
      if (resetGraph) {
        resetGraph()
      }

      // 清理预览线系统
      if (previewLineSystem && previewLineSystem.clearAll) {
        previewLineSystem.clearAll()
      }

      // 重新初始化
      await initCanvas()

      console.log('[useCanvasLifecycle] 画布重置完成')
      emit('canvas-reset')

    } catch (error) {
      console.error('[useCanvasLifecycle] 画布重置失败:', error)
      Message.error('画布重置失败')
    }
  }

  // 处理窗口大小变化
  const handleResize = () => {
    if (!graph.value) return

    try {
      // 延迟执行以确保DOM更新完成
      setTimeout(() => {
        if (graph.value && state.canvasContainer.value) {
          const container = state.canvasContainer.value
          const rect = container.getBoundingClientRect()
          
          // 更新画布大小
          graph.value.resize(rect.width, rect.height)
          
          // 触发重新布局
          if (graph.value.centerContent) {
            graph.value.centerContent()
          }
          
          console.log('[useCanvasLifecycle] 画布大小已调整:', rect.width, 'x', rect.height)
        }
      }, 100)
    } catch (error) {
      console.error('[useCanvasLifecycle] 处理窗口大小变化失败:', error)
    }
  }

  // 处理键盘快捷键
  const handleKeydown = (e) => {
    if (!graph.value || state.isReadOnly.value) return

    try {
      // 删除键 - 删除选中的节点或连接
      if (e.key === 'Delete' || e.key === 'Backspace') {
        console.log('[useCanvasLifecycle] 检测到删除快捷键')
        e.preventDefault()
        
        if (state.selectedNodeId.value) {
          const node = graph.value.getCellById(state.selectedNodeId.value)
          if (node) {
            emit('node-delete-requested', { node })
          }
        }
      }
      // 撤销快捷键: Ctrl/Cmd + Z
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        console.log('[useCanvasLifecycle] 检测到撤销快捷键')
        e.preventDefault()
        if (state.canUndo.value) {
          emit('undo-requested')
        }
      }
      // 重做快捷键: Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y
      else if (((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) || 
               ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        console.log('[useCanvasLifecycle] 检测到重做快捷键')
        e.preventDefault()
        if (state.canRedo.value) {
          emit('redo-requested')
        }
      }
      // 调试快捷键: Ctrl/Cmd + D
      else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        console.log('[useCanvasLifecycle] 检测到调试快捷键')
        e.preventDefault()
        
        // 调用预览线系统的调试方法
        if (previewLineSystem && typeof previewLineSystem.debugCurrentState === 'function') {
          previewLineSystem.debugCurrentState()
        } else {
          console.warn('[useCanvasLifecycle] PreviewLineSystem未初始化或debugCurrentState方法不存在')
        }
      }
      // 全选快捷键: Ctrl/Cmd + A
      else if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        console.log('[useCanvasLifecycle] 检测到全选快捷键')
        e.preventDefault()
        
        if (graph.value) {
          const nodes = graph.value.getNodes()
          graph.value.select(nodes)
        }
      }
      // 复制快捷键: Ctrl/Cmd + C
      else if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        console.log('[useCanvasLifecycle] 检测到复制快捷键')
        e.preventDefault()
        
        if (state.selectedNodeId.value) {
          emit('copy-requested', { nodeId: state.selectedNodeId.value })
        }
      }
      // 粘贴快捷键: Ctrl/Cmd + V
      else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        console.log('[useCanvasLifecycle] 检测到粘贴快捷键')
        e.preventDefault()
        
        emit('paste-requested')
      }
    } catch (error) {
      console.error('[useCanvasLifecycle] 处理键盘快捷键失败:', error)
    }
  }

  // 等待初始化完成
  const waitForInitialization = async (timeout = 10000) => {
    if (state.isGraphReady.value) {
      return true
    }

    if (initializationPromise.value) {
      return initializationPromise.value
    }

    initializationPromise.value = new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const checkReady = () => {
        if (state.isGraphReady.value) {
          initializationPromise.value = null
          resolve(true)
          return
        }

        if (Date.now() - startTime > timeout) {
          initializationPromise.value = null
          reject(new Error('初始化超时'))
          return
        }

        setTimeout(checkReady, 100)
      }

      checkReady()
    })

    return initializationPromise.value
  }

  // 验证画布状态
  const validateCanvasState = () => {
    const issues = []

    // 检查基础状态
    if (!graph.value) {
      issues.push('X6图实例未初始化')
    }

    if (!state.isGraphReady?.value) {
      issues.push('画布未就绪')
    }

    // 修复：使用正确的容器引用，并添加空值检查
    if (!canvasContainer?.value) {
      issues.push('画布容器未找到')
    }

    // 检查系统组件 - 只在初始化完成后检查
    if (state.isGraphReady?.value) {
      const previewLineSystemInstance = typeof previewLineSystem === 'function' ? previewLineSystem() : previewLineSystem
      const unifiedEdgeManagerInstance = typeof unifiedEdgeManager === 'function' ? unifiedEdgeManager() : unifiedEdgeManager
      
      if (!previewLineSystemInstance) {
        issues.push('预览线系统未初始化')
      }

      if (!unifiedEdgeManagerInstance) {
        issues.push('统一边管理器未初始化')
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }

  // 生命周期钩子 - 移除自动初始化，由父组件控制
  onMounted(() => {
    console.log('[useCanvasLifecycle] 组件挂载，等待父组件调用初始化')
    
    // 只绑定全局事件，不自动初始化画布
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    console.log('[useCanvasLifecycle] 组件卸载，开始清理资源')
    
    // 移除全局事件监听器
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeydown)
    
    // 销毁画布
    destroyCanvas()
  })

  return {
    // 状态
    isInitializing,
    isDestroying,
    
    // 方法
    initCanvas,
    destroyCanvas,
    resetCanvas,
    handleResize,
    handleKeydown,
    waitForInitialization,
    validateCanvasState
  }
}