import { ref, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'

/**
 * 事件管理器
 * 提供事件处理相关的状态管理和功能
 */
export function useEventManager() {
  // 事件状态
  const isDragging = ref(false)
  const isConnecting = ref(false)
  const dragStartPosition = ref({ x: 0, y: 0 })
  const lastClickTime = ref(0)
  const doubleClickDelay = 300 // 双击延迟时间
  
  /**
   * 绑定画布事件
   */
  const bindCanvasEvents = (graph, options = {}) => {
    if (!graph) {
      console.warn('[useEventManager] 图形实例不存在')
      return false
    }
    
    try {
      const {
        onNodeClick,
        onNodeDoubleClick,
        onEdgeClick,
        onCanvasClick,
        onNodeMoved,
        onEdgeConnected,
        onSelectionChanged
      } = options
      
      // 节点点击事件
      if (onNodeClick) {
        graph.on('node:click', ({ node, e }) => {
          try {
            const currentTime = Date.now()
            const timeDiff = currentTime - lastClickTime.value
            
            // 防止双击时触发单击
            if (timeDiff > doubleClickDelay) {
              setTimeout(() => {
                const newTimeDiff = Date.now() - lastClickTime.value
                if (newTimeDiff >= doubleClickDelay) {
                  onNodeClick(node, e)
                }
              }, doubleClickDelay)
            }
            
            lastClickTime.value = currentTime
          } catch (error) {
            console.error('[useEventManager] 节点点击事件处理失败:', error)
          }
        })
      }
      
      // 节点双击事件
      if (onNodeDoubleClick) {
        graph.on('node:dblclick', ({ node, e }) => {
          try {
            lastClickTime.value = Date.now()
            onNodeDoubleClick(node, e)
          } catch (error) {
            console.error('[useEventManager] 节点双击事件处理失败:', error)
          }
        })
      }
      
      // 边点击事件
      if (onEdgeClick) {
        graph.on('edge:click', ({ edge, e }) => {
          try {
            onEdgeClick(edge, e)
          } catch (error) {
            console.error('[useEventManager] 边点击事件处理失败:', error)
          }
        })
      }
      
      // 画布点击事件
      if (onCanvasClick) {
        graph.on('blank:click', ({ e }) => {
          try {
            onCanvasClick(e)
          } catch (error) {
            console.error('[useEventManager] 画布点击事件处理失败:', error)
          }
        })
      }
      
      // 节点移动事件
      if (onNodeMoved) {
        graph.on('node:moved', ({ node, e }) => {
          try {
            onNodeMoved(node, e)
          } catch (error) {
            console.error('[useEventManager] 节点移动事件处理失败:', error)
          }
        })
      }
      
      // 边连接事件
      if (onEdgeConnected) {
        graph.on('edge:connected', ({ edge, e }) => {
          try {
            onEdgeConnected(edge, e)
          } catch (error) {
            console.error('[useEventManager] 边连接事件处理失败:', error)
          }
        })
      }
      
      // 选择变化事件
      if (onSelectionChanged) {
        graph.on('selection:changed', ({ selected, removed }) => {
          try {
            onSelectionChanged(selected, removed)
          } catch (error) {
            console.error('[useEventManager] 选择变化事件处理失败:', error)
          }
        })
      }
      
      // 鼠标按下事件（用于拖拽检测）
      graph.on('node:mousedown', ({ node, e }) => {
        try {
          isDragging.value = false
          dragStartPosition.value = { x: e.clientX, y: e.clientY }
        } catch (error) {
          console.error('[useEventManager] 鼠标按下事件处理失败:', error)
        }
      })
      
      // 鼠标移动事件（用于拖拽检测）
      graph.on('node:mousemove', ({ node, e }) => {
        try {
          if (!isDragging.value) {
            const deltaX = Math.abs(e.clientX - dragStartPosition.value.x)
            const deltaY = Math.abs(e.clientY - dragStartPosition.value.y)
            
            // 移动距离超过阈值时认为是拖拽
            if (deltaX > 5 || deltaY > 5) {
              isDragging.value = true
            }
          }
        } catch (error) {
          console.error('[useEventManager] 鼠标移动事件处理失败:', error)
        }
      })
      
      // 鼠标释放事件（用于拖拽检测）
      graph.on('node:mouseup', ({ node, e }) => {
        try {
          setTimeout(() => {
            isDragging.value = false
          }, 100)
        } catch (error) {
          console.error('[useEventManager] 鼠标释放事件处理失败:', error)
        }
      })
      
      console.log('[useEventManager] 画布事件绑定完成')
      return true
      
    } catch (error) {
      console.error('[useEventManager] 绑定画布事件失败:', error)
      return false
    }
  }
  
  /**
   * 处理节点选择
   */
  const handleNodeSelection = (graph, node, multiSelect = false) => {
    if (!graph || !node) {
      console.warn('[useEventManager] 参数不完整')
      return false
    }
    
    try {
      if (multiSelect) {
        // 多选模式：切换节点选择状态
        if (node.isSelected()) {
          graph.unselect(node)
        } else {
          graph.select(node)
        }
      } else {
        // 单选模式：清除其他选择，选中当前节点
        graph.cleanSelection()
        graph.select(node)
      }
      
      return true
      
    } catch (error) {
      console.error('[useEventManager] 处理节点选择失败:', error)
      return false
    }
  }
  
  /**
   * 处理键盘事件
   */
  const bindKeyboardEvents = (graph, options = {}) => {
    if (!graph) {
      console.warn('[useEventManager] 图形实例不存在')
      return false
    }
    
    try {
      const {
        onDelete,
        onCopy,
        onPaste,
        onUndo,
        onRedo,
        onSelectAll,
        onEscape
      } = options
      
      const handleKeyDown = (e) => {
        try {
          // 检查是否在输入框中
          const activeElement = document.activeElement
          const isInputActive = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
          )
          
          if (isInputActive) {
            return // 在输入框中时不处理快捷键
          }
          
          const { key, ctrlKey, metaKey, shiftKey } = e
          const isCtrlOrCmd = ctrlKey || metaKey
          
          switch (key) {
            case 'Delete':
            case 'Backspace':
              if (onDelete) {
                e.preventDefault()
                onDelete()
              }
              break
              
            case 'c':
              if (isCtrlOrCmd && onCopy) {
                e.preventDefault()
                onCopy()
              }
              break
              
            case 'v':
              if (isCtrlOrCmd && onPaste) {
                e.preventDefault()
                onPaste()
              }
              break
              
            case 'z':
              if (isCtrlOrCmd) {
                e.preventDefault()
                if (shiftKey && onRedo) {
                  onRedo()
                } else if (onUndo) {
                  onUndo()
                }
              }
              break
              
            case 'y':
              if (isCtrlOrCmd && onRedo) {
                e.preventDefault()
                onRedo()
              }
              break
              
            case 'a':
              if (isCtrlOrCmd && onSelectAll) {
                e.preventDefault()
                onSelectAll()
              }
              break
              
            case 'Escape':
              if (onEscape) {
                e.preventDefault()
                onEscape()
              }
              break
          }
        } catch (error) {
          console.error('[useEventManager] 键盘事件处理失败:', error)
        }
      }
      
      // 绑定键盘事件
      document.addEventListener('keydown', handleKeyDown)
      
      // 返回清理函数
      const cleanup = () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
      
      console.log('[useEventManager] 键盘事件绑定完成')
      return cleanup
      
    } catch (error) {
      console.error('[useEventManager] 绑定键盘事件失败:', error)
      return null
    }
  }
  
  /**
   * 处理拖拽事件
   */
  const handleDragEvents = (graph, options = {}) => {
    if (!graph) {
      console.warn('[useEventManager] 图形实例不存在')
      return false
    }
    
    try {
      const {
        onDragStart,
        onDragMove,
        onDragEnd,
        onDropOnCanvas,
        onDropOnNode
      } = options
      
      // 拖拽开始
      if (onDragStart) {
        graph.on('node:mousedown', ({ node, e }) => {
          try {
            onDragStart(node, e)
          } catch (error) {
            console.error('[useEventManager] 拖拽开始事件处理失败:', error)
          }
        })
      }
      
      // 拖拽移动
      if (onDragMove) {
        graph.on('node:mousemove', ({ node, e }) => {
          try {
            if (isDragging.value) {
              onDragMove(node, e)
            }
          } catch (error) {
            console.error('[useEventManager] 拖拽移动事件处理失败:', error)
          }
        })
      }
      
      // 拖拽结束
      if (onDragEnd) {
        graph.on('node:mouseup', ({ node, e }) => {
          try {
            if (isDragging.value) {
              onDragEnd(node, e)
            }
          } catch (error) {
            console.error('[useEventManager] 拖拽结束事件处理失败:', error)
          }
        })
      }
      
      // 拖放到画布
      if (onDropOnCanvas) {
        graph.on('blank:mouseup', ({ e }) => {
          try {
            onDropOnCanvas(e)
          } catch (error) {
            console.error('[useEventManager] 拖放到画布事件处理失败:', error)
          }
        })
      }
      
      // 拖放到节点
      if (onDropOnNode) {
        graph.on('node:mouseup', ({ node, e }) => {
          try {
            onDropOnNode(node, e)
          } catch (error) {
            console.error('[useEventManager] 拖放到节点事件处理失败:', error)
          }
        })
      }
      
      console.log('[useEventManager] 拖拽事件绑定完成')
      return true
      
    } catch (error) {
      console.error('[useEventManager] 处理拖拽事件失败:', error)
      return false
    }
  }
  
  /**
   * 处理连接事件
   */
  const handleConnectionEvents = (graph, options = {}) => {
    if (!graph) {
      console.warn('[useEventManager] 图形实例不存在')
      return false
    }
    
    try {
      const {
        onConnectionStart,
        onConnectionMove,
        onConnectionEnd,
        validateConnection
      } = options
      
      // 连接开始
      if (onConnectionStart) {
        graph.on('edge:mouseenter', ({ edge }) => {
          try {
            isConnecting.value = true
            onConnectionStart(edge)
          } catch (error) {
            console.error('[useEventManager] 连接开始事件处理失败:', error)
          }
        })
      }
      
      // 连接移动
      if (onConnectionMove) {
        graph.on('edge:mousemove', ({ edge, e }) => {
          try {
            if (isConnecting.value) {
              onConnectionMove(edge, e)
            }
          } catch (error) {
            console.error('[useEventManager] 连接移动事件处理失败:', error)
          }
        })
      }
      
      // 连接结束
      if (onConnectionEnd) {
        graph.on('edge:mouseleave', ({ edge }) => {
          try {
            isConnecting.value = false
            onConnectionEnd(edge)
          } catch (error) {
            console.error('[useEventManager] 连接结束事件处理失败:', error)
          }
        })
      }
      
      // 连接验证
      if (validateConnection) {
        graph.on('edge:connected', ({ edge }) => {
          try {
            const sourceId = edge.getSourceCellId()
            const targetId = edge.getTargetCellId()
            
            const validation = validateConnection(sourceId, targetId)
            
            if (!validation.valid) {
              // 连接无效，移除边
              graph.removeEdge(edge)
              Message.warning(validation.reason || '连接无效')
            }
          } catch (error) {
            console.error('[useEventManager] 连接验证失败:', error)
          }
        })
      }
      
      console.log('[useEventManager] 连接事件绑定完成')
      return true
      
    } catch (error) {
      console.error('[useEventManager] 处理连接事件失败:', error)
      return false
    }
  }
  
  /**
   * 清理所有事件监听器
   */
  const cleanupEvents = (graph) => {
    if (!graph) {
      console.warn('[useEventManager] 图形实例不存在')
      return false
    }
    
    try {
      // 移除所有事件监听器
      graph.off()
      
      // 重置状态
      isDragging.value = false
      isConnecting.value = false
      lastClickTime.value = 0
      
      console.log('[useEventManager] 事件监听器清理完成')
      return true
      
    } catch (error) {
      console.error('[useEventManager] 清理事件监听器失败:', error)
      return false
    }
  }
  
  return {
    // 状态
    isDragging,
    isConnecting,
    dragStartPosition,
    lastClickTime,
    
    // 方法
    bindCanvasEvents,
    handleNodeSelection,
    bindKeyboardEvents,
    handleDragEvents,
    handleConnectionEvents,
    cleanupEvents
  }
}