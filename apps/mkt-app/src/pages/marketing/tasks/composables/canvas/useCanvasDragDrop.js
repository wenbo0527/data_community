import { ref, computed, onUnmounted } from 'vue'
import { useEventManager } from '../../utils/canvas/EventManagerBase.js'
import { ErrorHandler } from '../../utils/canvas/ErrorHandler.js'
import { DataTransformUtils } from '../../utils/canvas/DataTransformUtils.js'

export function useCanvasDragDrop(graph, emit) {
  const isDragging = ref(false)
  const dragStartPosition = ref({ x: 0, y: 0 })
  const dragOffset = ref({ x: 0, y: 0 })

  // 使用事件管理器
  const { eventManager, addGraphEvent, cleanup } = useEventManager(graph)

  // 设置拖拽事件监听器
  const setupDragListeners = () => {
    if (!graph.value) return

    // 使用事件管理器批量添加拖拽事件
    addGraphEvent('node:mousedown', ErrorHandler.wrapEventHandler((args) => {
      const { node, e } = args
      dragStartPosition.value = { x: e.clientX, y: e.clientY }
      const nodePosition = node.getPosition()
      dragOffset.value = {
        x: e.clientX - nodePosition.x,
        y: e.clientY - nodePosition.y
      }
    }, 'node:mousedown'))

    addGraphEvent('node:move', ErrorHandler.wrapEventHandler((args) => {
      const { node } = args
      isDragging.value = true
      emit('drag-start', { nodeId: node.id, position: node.getPosition() })
    }, 'node:move'))

    addGraphEvent('node:moved', ErrorHandler.wrapEventHandler((args) => {
      const { node } = args
      if (isDragging.value) {
        emit('dragging', { nodeId: node.id, position: node.getPosition() })
      }
    }, 'node:moved'))

    addGraphEvent('node:mouseup', ErrorHandler.wrapEventHandler((args) => {
      const { node } = args
      if (isDragging.value) {
        isDragging.value = false
        emit('drag-end', { nodeId: node.id, position: node.getPosition() })
      }
    }, 'node:mouseup'))
  }

  // 清理拖拽事件监听器（由事件管理器自动处理）
  const cleanupDragListeners = () => {
    // 事件管理器会在组件卸载时自动清理所有事件
    cleanup()
  }

  onUnmounted(() => {
    cleanupDragListeners()
  })

  return {
    isDragging,
    dragStartPosition,
    dragOffset,
    setupDragDrop: setupDragListeners,
    cleanupDragListeners
  }
}