import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

/**
 * 画布历史记录功能组合式函数
 * 提取历史面板和撤销重做相关逻辑
 */
export function useCanvasHistory(graph) {
  // 历史记录状态
  const canUndo = ref(false)
  const canRedo = ref(false)
  const currentHistoryIndex = ref(-1)
  const historyStack = ref({
    undoStack: [],
    redoStack: []
  })

  // 计算属性
  const hasHistory = computed(() => {
    return historyStack.value.undoStack.length > 0 || historyStack.value.redoStack.length > 0
  })

  const totalHistoryCount = computed(() => {
    return historyStack.value.undoStack.length + historyStack.value.redoStack.length
  })

  // 更新撤销重做状态
  const updateUndoRedoState = () => {
    if (!graph) return
    
    try {
      const canUndoValue = graph.canUndo()
      const canRedoValue = graph.canRedo()
      canUndo.value = canUndoValue
      canRedo.value = canRedoValue
      
      console.log('[useCanvasHistory] 更新撤销重做状态:', {
        canUndo: canUndoValue,
        canRedo: canRedoValue,
        undoStackLength: graph.history?.undoStack?.length || 0,
        redoStackLength: graph.history?.redoStack?.length || 0
      })
    } catch (error) {
      console.error('[useCanvasHistory] 更新撤销重做状态失败:', error)
    }
  }

  // 撤销操作
  const undo = () => {
    if (!graph) {
      Message.error('画布未初始化，无法撤销')
      return
    }
    
    if (graph.canUndo()) {
      try {
        console.log('[useCanvasHistory] 执行撤销操作')
        graph.undo()
        updateUndoRedoState()
        updateHistoryStack()
        Message.success('撤销成功')
      } catch (error) {
        console.error('[useCanvasHistory] 撤销操作执行失败:', error)
        Message.error('撤销操作失败')
      }
    } else {
      Message.warning('没有可撤销的操作')
    }
  }

  // 重做操作
  const redo = () => {
    if (!graph) {
      Message.error('画布未初始化，无法重做')
      return
    }
    
    if (graph.canRedo()) {
      try {
        console.log('[useCanvasHistory] 执行重做操作')
        graph.redo()
        updateUndoRedoState()
        updateHistoryStack()
        Message.success('重做成功')
      } catch (error) {
        console.error('[useCanvasHistory] 重做操作执行失败:', error)
        Message.error('重做操作失败')
      }
    } else {
      Message.warning('没有可重做的操作')
    }
  }

  // 更新历史栈
  const updateHistoryStack = () => {
    if (!graph || !graph.history) return
    
    try {
      const undoStack = graph.history.undoStack || []
      const redoStack = graph.history.redoStack || []
      
      historyStack.value = {
        undoStack: undoStack.map((command, index) => ({
          ...command,
          timestamp: command.timestamp || Date.now(),
          index,
          description: getOperationDescription(command)
        })),
        redoStack: redoStack.map((command, index) => ({
          ...command,
          timestamp: command.timestamp || Date.now(),
          index,
          description: getOperationDescription(command)
        }))
      }
      
      currentHistoryIndex.value = undoStack.length - 1
      
      console.log('[useCanvasHistory] 历史栈已更新:', {
        undoCount: undoStack.length,
        redoCount: redoStack.length,
        currentIndex: currentHistoryIndex.value
      })
    } catch (error) {
      console.error('[useCanvasHistory] 更新历史栈失败:', error)
    }
  }

  // 获取操作描述
  const getOperationDescription = (command) => {
    if (!command) return '未知操作'
    
    const { event, data } = command
    
    switch (event) {
      case 'cell:added':
        return data?.cell?.shape === 'vue-shape' ? '添加节点' : '添加元素'
      case 'cell:removed':
        return data?.cell?.shape === 'vue-shape' ? '删除节点' : '删除元素'
      case 'cell:change:position':
        return '移动节点'
      case 'cell:change:size':
        return '调整大小'
      case 'cell:change:attrs':
        return '修改样式'
      case 'edge:connected':
        return '连接节点'
      case 'edge:disconnected':
        return '断开连接'
      case 'cell:change:data':
        return '修改数据'
      case 'cell:change:zIndex':
        return '调整层级'
      default:
        return event ? event.replace('cell:', '').replace(':', ' ') : '操作'
    }
  }

  // 跳转到指定历史状态
  const jumpToHistoryState = (targetIndex) => {
    if (!graph || !graph.history) return
    
    try {
      const currentIndex = graph.history.undoStack.length - 1
      const diff = targetIndex - currentIndex
      
      console.log('[useCanvasHistory] 跳转历史状态:', {
        currentIndex,
        targetIndex,
        diff
      })
      
      if (diff > 0) {
        // 需要重做
        for (let i = 0; i < diff; i++) {
          if (graph.canRedo()) {
            graph.redo()
          }
        }
      } else if (diff < 0) {
        // 需要撤销
        for (let i = 0; i < Math.abs(diff); i++) {
          if (graph.canUndo()) {
            graph.undo()
          }
        }
      }
      
      updateHistoryStack()
      updateUndoRedoState()
      Message.success(`已跳转到历史状态 ${targetIndex + 1}`)
    } catch (error) {
      console.error('[useCanvasHistory] 跳转到历史状态失败:', error)
      Message.error('跳转失败')
    }
  }

  // 格式化时间显示
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return date.toLocaleString()
    }
  }

  // 清空历史记录
  const clearHistory = () => {
    // 获取实际的graph实例（可能是ref）
    const graphInstance = graph?.value || graph
    
    if (!graphInstance || !graphInstance.history) return
    
    try {
      graphInstance.history.clear()
      historyStack.value = {
        undoStack: [],
        redoStack: []
      }
      currentHistoryIndex.value = -1
      updateUndoRedoState()
      
      console.log('[useCanvasHistory] 历史记录已清空')
      Message.success('历史记录已清空')
    } catch (error) {
      console.error('[useCanvasHistory] 清空历史记录失败:', error)
      Message.error('清空历史记录失败')
    }
  }

  // 设置历史记录监听器
  const setupHistoryListeners = () => {
    // 获取实际的graph实例（可能是ref）
    const graphInstance = graph?.value || graph
    
    if (!graphInstance) {
      console.warn('[useCanvasHistory] graph实例不存在，无法设置历史记录监听器')
      return
    }
    
    // 检查graph是否有on方法
    if (typeof graphInstance.on !== 'function') {
      console.error('[useCanvasHistory] graph.on不是函数，graph类型:', typeof graphInstance, 'graph:', graphInstance)
      return
    }
    
    try {
      // 监听撤销事件
      graphInstance.on('history:undo', (args) => {
        console.log('[useCanvasHistory] 撤销事件触发:', args)
        updateUndoRedoState()
        updateHistoryStack()
      })
      
      // 监听重做事件
      graphInstance.on('history:redo', (args) => {
        console.log('[useCanvasHistory] 重做事件触发:', args)
        updateUndoRedoState()
        updateHistoryStack()
      })
      
      // 监听历史记录变化
      graphInstance.on('history:change', () => {
        console.log('[useCanvasHistory] 历史记录变化')
        updateUndoRedoState()
        updateHistoryStack()
      })

      // 监听命令新增（节点添加、连线连接等）
      graphInstance.on('history:command:added', (args) => {
        console.log('[useCanvasHistory] 命令添加:', args?.command?.event)
        updateUndoRedoState()
        updateHistoryStack()
      })
      
      console.log('[useCanvasHistory] 历史记录监听器设置完成')
    } catch (error) {
      console.error('[useCanvasHistory] 设置历史记录监听器失败:', error)
    }
  }

  // 移除历史记录监听器
  const removeHistoryListeners = () => {
    // 获取实际的graph实例（可能是ref）
    const graphInstance = graph?.value || graph
    
    if (!graphInstance) return
    
    try {
      graphInstance.off('history:undo')
      graphInstance.off('history:redo')
      graphInstance.off('history:change')
      console.log('[useCanvasHistory] 历史记录监听器已移除')
    } catch (error) {
      console.error('[useCanvasHistory] 移除历史记录监听器失败:', error)
    }
  }

  // 键盘快捷键处理
  const handleKeydown = (e) => {
    console.log('[useCanvasHistory] 键盘快捷键事件:', {
      key: e.key,
      metaKey: e.metaKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      target: e.target.tagName
    })
    
    // Mac: Command + Z, Windows: Ctrl + Z
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      console.log('[useCanvasHistory] 检测到撤销快捷键')
      e.preventDefault()
      undo()
    }
    // Mac: Command + Shift + Z, Windows: Ctrl + Y
    else if (((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) ||
             ((e.ctrlKey) && e.key === 'y')) {
      console.log('[useCanvasHistory] 检测到重做快捷键')
      e.preventDefault()
      redo()
    }
  }

  // 保存历史状态
  const saveHistoryState = (description = '操作') => {
    // 获取实际的graph实例（可能是ref）
    const graphInstance = graph?.value || graph
    
    if (!graphInstance) {
      console.warn('[useCanvasHistory] 图形实例不存在，无法保存历史状态')
      return
    }
    
    try {
      // 如果图形实例有历史记录功能，保存当前状态
      if (graphInstance.history) {
        // X6的历史记录会自动记录操作，这里主要是更新UI状态
        updateHistoryStack()
        updateUndoRedoState()
        console.log('[useCanvasHistory] 历史状态已保存:', description)
      } else {
        console.warn('[useCanvasHistory] 图形实例未启用历史记录功能')
      }
    } catch (error) {
      console.error('[useCanvasHistory] 保存历史状态失败:', error)
    }
  }

  return {
    // 状态
    canUndo,
    canRedo,
    currentHistoryIndex,
    historyStack,
    hasHistory,
    totalHistoryCount,
    
    // 方法
    undo,
    redo,
    updateUndoRedoState,
    updateHistoryStack,
    getOperationDescription,
    jumpToHistoryState,
    formatTime,
    clearHistory,
    setupHistoryListeners,
    removeHistoryListeners,
    handleKeydown,
    saveHistoryState
  }
}