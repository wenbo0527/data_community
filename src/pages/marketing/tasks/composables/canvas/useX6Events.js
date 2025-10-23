/**
 * X6 事件处理 Composable
 * 统一管理所有 X6 图形事件
 */
import { ref } from 'vue'

export function useX6Events(graph, canvasState, emit) {
  const isDragging = ref(false)
  const isConnecting = ref(false)
  
  // 验证参数
  const validateParams = () => {
    if (!graph) {
      console.error('[useX6Events] graph参数未提供')
      return false
    }
    if (!canvasState) {
      console.error('[useX6Events] canvasState参数未提供')
      return false
    }
    if (typeof emit !== 'function') {
      console.error('[useX6Events] emit参数不是函数，类型:', typeof emit)
      return false
    }
    return true
  }
  
  // 绑定所有事件
  const bindEvents = () => {
    console.log('[useX6Events] bindEvents调用，开始参数验证')
    
    if (!validateParams()) {
      console.error('[useX6Events] 参数验证失败，跳过事件绑定')
      return
    }
    
    console.log('[useX6Events] graph参数:', graph)
    console.log('[useX6Events] graph.value:', graph.value)
    console.log('[useX6Events] graph.value类型:', typeof graph.value)
    console.log('[useX6Events] graph.value.on方法:', typeof graph.value?.on)
    
    if (!graph.value) {
      console.error('[useX6Events] graph.value不存在')
      return
    }
    
    if (typeof graph.value.on !== 'function') {
      console.error('[useX6Events] graph.value.on不是函数，类型:', typeof graph.value.on)
      console.error('[useX6Events] graph.value详细信息:', {
        constructor: graph.value.constructor?.name,
        keys: Object.keys(graph.value).slice(0, 10)
      })
      return
    }
    
    console.log('[useX6Events] 开始绑定事件')
    
    // 节点事件
    bindNodeEvents()
    
    // 连接事件
    bindEdgeEvents()
    
    // 画布事件
    bindCanvasEvents()
    
    // 端口事件
    bindPortEvents()
    
    // 键盘事件
    bindKeyboardEvents()
    
    console.log('[useX6Events] 所有事件绑定完成')
  }
  
  // 节点事件
  const bindNodeEvents = () => {
    try {
      console.log('[useX6Events] 开始绑定节点事件')
      
      // 节点点击 - 直接打开配置弹窗
      graph.value.on('node:click', ({ node }) => {
        try {
          console.log('[useX6Events] 节点点击事件触发:', node.id)
          const nodeData = canvasState.nodes.value.find(n => n.id === node.id)
          if (nodeData) {
            if (typeof canvasState.selectNode === 'function') {
              canvasState.selectNode(node.id)
            } else {
              console.warn('[useX6Events] canvasState.selectNode不是函数')
            }
            
            // 对于非开始节点，直接打开配置弹窗
            if (nodeData.type !== 'start') {
              console.log('[useX6Events] 触发node-config-open事件')
              emit('node-config-open', nodeData)
            } else {
              // 开始节点只选择，不打开配置
              console.log('[useX6Events] 触发node-selected事件')
              emit('node-selected', nodeData)
            }
          } else {
            console.warn('[useX6Events] 未找到节点数据:', node.id)
          }
        } catch (error) {
          console.error('[useX6Events] 节点点击事件处理失败:', error)
        }
      })
      
      console.log('[useX6Events] 节点点击事件绑定完成')
    } catch (error) {
      console.error('[useX6Events] 绑定节点事件失败:', error)
    }
    
    // 移除节点双击事件，统一使用单击
    // graph.on('node:dblclick', ({ node }) => {
    //   const nodeData = canvasState.nodes.value.find(n => n.id === node.id)
    //   if (nodeData && nodeData.type !== 'start') {
    //     canvasState.selectNode(node.id)
    //     emit('node-config-open', nodeData)
    //   }
    // })
    
    try {
      // 节点移动开始
      graph.value.on('node:move', ({ node }) => {
        try {
          console.log('[useX6Events] 节点移动开始:', node.id)
          isDragging.value = true
        } catch (error) {
          console.error('[useX6Events] 节点移动开始事件处理失败:', error)
        }
      })
      
      // 节点移动结束
      graph.value.on('node:moved', ({ node }) => {
        try {
          console.log('[useX6Events] 节点移动结束:', node.id)
          isDragging.value = false
          const nodeData = canvasState.nodes.value.find(n => n.id === node.id)
          if (nodeData) {
            const position = node.getPosition()
            if (typeof canvasState.updateNode === 'function') {
              canvasState.updateNode(node.id, { position })
            } else {
              console.warn('[useX6Events] canvasState.updateNode不是函数')
            }
            emit('node-moved', { nodeId: node.id, position })
          } else {
            console.warn('[useX6Events] 节点移动结束时未找到节点数据:', node.id)
          }
        } catch (error) {
          console.error('[useX6Events] 节点移动结束事件处理失败:', error)
        }
      })
      
      console.log('[useX6Events] 节点移动事件绑定完成')
    } catch (error) {
      console.error('[useX6Events] 绑定节点移动事件失败:', error)
    }
    
    // 节点悬停
    graph.value.on('node:mouseenter', ({ node }) => {
      node.addTools([
        {
          name: 'boundary',
          args: {
            attrs: {
              fill: '#7c68fc',
              stroke: '#9254de',
              'stroke-width': 1,
              'fill-opacity': 0.2,
            },
          },
        },
      ])
    })
    
    graph.value.on('node:mouseleave', ({ node }) => {
      node.removeTools()
    })
  }
  
  // 连接事件
  const bindEdgeEvents = () => {
    // 连接开始
    graph.value.on('edge:connecting', () => {
      isConnecting.value = true
    })
    
    // 连接创建
    graph.value.on('edge:connected', ({ edge }) => {
      isConnecting.value = false
      const sourceNode = edge.getSourceNode()
      const targetNode = edge.getTargetNode()
      
      if (sourceNode && targetNode) {
        const connection = {
          id: edge.id,
          source: sourceNode.id,
          target: targetNode.id,
          sourcePort: edge.getSourcePortId(),
          targetPort: edge.getTargetPortId()
        }
        
        canvasState.addConnection(connection)
        emit('connection-created', connection)
      }
    })
    
    // 连接删除
    graph.value.on('edge:removed', ({ edge }) => {
      canvasState.removeConnection(edge.id)
      emit('connection-deleted', { id: edge.id })
    })
    
    // 🔧 新增：预览线拖拽事件监听器
    let isDraggingPreviewLine = false
    let dragStartPosition = null
    let draggedPreviewLine = null
    
    // 预览线鼠标按下事件
    graph.value.on('edge:mousedown', ({ edge, e }) => {
      try {
        // 检查是否是预览线
        const edgeData = edge.getData() || {}
        const isPreviewLine = edgeData.isPreview || 
                             edgeData.type === 'preview-line' || 
                             edgeData.type === 'unified-preview-line' ||
                             edge.id.includes('preview') ||
                             edge.id.includes('unified_preview')
        
        if (isPreviewLine) {
          console.log('🎯 [预览线拖拽] 预览线鼠标按下:', {
            edgeId: edge.id,
            edgeData,
            clientX: e.clientX,
            clientY: e.clientY
          })
          
          isDraggingPreviewLine = true
          dragStartPosition = { x: e.clientX, y: e.clientY }
          draggedPreviewLine = edge
          
          // 阻止事件冒泡，防止触发画布拖拽
          e.stopPropagation()
          e.preventDefault()
        }
      } catch (error) {
        console.error('[useX6Events] 预览线鼠标按下事件处理失败:', error)
      }
    })
    
    // 预览线鼠标移动事件
    graph.value.on('edge:mousemove', ({ edge, e }) => {
      try {
        if (isDraggingPreviewLine && draggedPreviewLine && draggedPreviewLine.id === edge.id) {
          const currentPosition = { x: e.clientX, y: e.clientY }
          const deltaX = currentPosition.x - dragStartPosition.x
          const deltaY = currentPosition.y - dragStartPosition.y
          
          console.log('🎯 [预览线拖拽] 预览线拖拽中:', {
            edgeId: edge.id,
            deltaX,
            deltaY,
            currentPosition,
            dragStartPosition
          })
          
          // 获取预览线的当前路径点
          const vertices = edge.getVertices()
          const source = edge.getSourcePoint()
          const target = edge.getTargetPoint()
          
          // 计算新的终点位置
          const newTargetX = target.x + deltaX
          const newTargetY = target.y + deltaY
          
          // 更新预览线的终点位置
          edge.setTarget({ x: newTargetX, y: newTargetY })
          
          // 更新拖拽起始位置
          dragStartPosition = currentPosition
          
          // 阻止事件冒泡
          e.stopPropagation()
          e.preventDefault()
        }
      } catch (error) {
        console.error('[useX6Events] 预览线拖拽事件处理失败:', error)
      }
    })
    
    // 预览线鼠标释放事件
    graph.value.on('edge:mouseup', ({ edge, e }) => {
      try {
        if (isDraggingPreviewLine && draggedPreviewLine && draggedPreviewLine.id === edge.id) {
          console.log('🎯 [预览线拖拽] 预览线拖拽结束:', {
            edgeId: edge.id,
            finalPosition: edge.getTargetPoint()
          })
          
          // 重置拖拽状态
          isDraggingPreviewLine = false
          dragStartPosition = null
          draggedPreviewLine = null
          
          // 触发预览线移动完成事件
          emit('preview-line-moved', {
            edgeId: edge.id,
            newPosition: edge.getTargetPoint()
          })
          
          // 阻止事件冒泡
          e.stopPropagation()
          e.preventDefault()
        }
      } catch (error) {
        console.error('[useX6Events] 预览线鼠标释放事件处理失败:', error)
      }
    })
    
    // 预览线点击事件
    graph.value.on('edge:click', ({ edge, e }) => {
      try {
        // 检查是否是预览线
        const edgeData = edge.getData() || {}
        const isPreviewLine = edgeData.isPreview || 
                             edgeData.type === 'preview-line' || 
                             edgeData.type === 'unified-preview-line' ||
                             edge.id.includes('preview') ||
                             edge.id.includes('unified_preview')
        
        if (isPreviewLine) {
          console.log('🎯 [预览线点击] 预览线被点击:', {
            edgeId: edge.id,
            edgeData,
            position: edge.getTargetPoint()
          })
          
          // 触发预览线点击事件
          emit('preview-line-clicked', {
            edgeId: edge.id,
            edgeData,
            position: edge.getTargetPoint()
          })
          
          // 阻止事件冒泡，防止触发画布点击
          e.stopPropagation()
        }
      } catch (error) {
        console.error('[useX6Events] 预览线点击事件处理失败:', error)
      }
    })
    
    // 连接悬停
    graph.value.on('edge:mouseenter', ({ edge }) => {
      // 检查是否是预览线
      const edgeData = edge.getData() || {}
      const isPreviewLine = edgeData.isPreview || 
                           edgeData.type === 'preview-line' || 
                           edgeData.type === 'unified-preview-line' ||
                           edge.id.includes('preview') ||
                           edge.id.includes('unified_preview')
      
      if (!isPreviewLine) {
        // 只为普通连接线添加工具
        edge.addTools([
          'source-arrowhead',
          'target-arrowhead',
          {
            name: 'button-remove',
            args: {
              x: 0,
              y: 0,
              offset: { x: 10, y: 10 },
            },
          },
        ])
      } else {
        // 为预览线添加特殊的视觉反馈
        console.log('🎯 [预览线悬停] 预览线鼠标进入:', edge.id)
        
        // 高亮预览线
        edge.attr('line/stroke', '#ff6b6b')
        edge.attr('line/strokeWidth', 3)
        
        // 添加拖拽提示
        edge.addTools([
          {
            name: 'vertices',
            args: {
              attrs: {
                fill: '#ff6b6b',
                stroke: '#ff6b6b',
                'stroke-width': 2,
                r: 6
              }
            }
          }
        ])
      }
    })

    graph.value.on('edge:mouseleave', ({ edge }) => {
      // 检查是否是预览线
      const edgeData = edge.getData() || {}
      const isPreviewLine = edgeData.isPreview || 
                           edgeData.type === 'preview-line' || 
                           edgeData.type === 'unified-preview-line' ||
                           edge.id.includes('preview') ||
                           edge.id.includes('unified_preview')
      
      if (isPreviewLine) {
        console.log('🎯 [预览线悬停] 预览线鼠标离开:', edge.id)
        
        // 恢复预览线原始样式
        edge.attr('line/stroke', '#1890ff')
        edge.attr('line/strokeWidth', 2)
      }
      
      // 移除所有工具
      edge.removeTools()
    })
  }
  
  // 画布事件
  const bindCanvasEvents = () => {
    // 空白区域点击
    graph.value.on('blank:click', () => {
      canvasState.clearSelection()
      emit('canvas-click')
    })
    
    // 画布右键菜单
    graph.value.on('blank:contextmenu', ({ e }) => {
      e.preventDefault()
      const position = graph.value.clientToLocal(e.clientX, e.clientY)
      emit('canvas-contextmenu', { position, event: e })
    })
    
    // 画布缩放
    graph.value.on('scale', ({ sx, sy }) => {
      emit('canvas-scale', { scaleX: sx, scaleY: sy })
    })
    
    // 画布平移
    graph.value.on('translate', ({ tx, ty }) => {
      emit('canvas-translate', { translateX: tx, translateY: ty })
    })
  }
  
  // 端口事件
  const bindPortEvents = () => {
    // 端口点击
    graph.value.on('node:port:click', ({ node, port }) => {
      const nodeData = canvasState.nodes.value.find(n => n.id === node.id)
      if (nodeData && port.group === 'out') {
        try {
          // 计算端口的绝对位置
          const nodePosition = node.getPosition()
          const nodeSize = node.getSize()
          const portConfig = node.getPortProp(port.id, 'position') || {}
          
          let portX = nodePosition.x
          let portY = nodePosition.y
          
          // 根据端口配置计算位置
          if (portConfig.name === 'bottom') {
            const args = portConfig.args || {}
            const xPercent = typeof args.x === 'string' && args.x.includes('%') ? 
              parseFloat(args.x) / 100 : 0.5
            portX = nodePosition.x + nodeSize.width * xPercent + (args.dx || 0)
            portY = nodePosition.y + nodeSize.height + (args.dy || 0)
          } else if (portConfig.name === 'top') {
            const args = portConfig.args || {}
            const xPercent = typeof args.x === 'string' && args.x.includes('%') ? 
              parseFloat(args.x) / 100 : 0.5
            portX = nodePosition.x + nodeSize.width * xPercent + (args.dx || 0)
            portY = nodePosition.y + (args.dy || 0)
          } else if (portConfig.name === 'left') {
            const args = portConfig.args || {}
            const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
              parseFloat(args.y) / 100 : 0.5
            portX = nodePosition.x + (args.dx || 0)
            portY = nodePosition.y + nodeSize.height * yPercent + (args.dy || 0)
          } else if (portConfig.name === 'right') {
            const args = portConfig.args || {}
            const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
              parseFloat(args.y) / 100 : 0.5
            portX = nodePosition.x + nodeSize.width + (args.dx || 0)
            portY = nodePosition.y + nodeSize.height * yPercent + (args.dy || 0)
          }
          
          const portPosition = { x: portX, y: portY }
          const graphPosition = graph.value.localToGraph(portPosition)
          const clientPosition = graph.value.graphToClient(graphPosition)
          
          emit('port-click', {
            node: nodeData,
            port,
            position: clientPosition
          })
        } catch (error) {
          console.error('端口位置计算失败:', error)
          throw new Error(`端口位置计算失败: ${error.message}`)
        }
      }
    })
    
    // 端口悬停
    graph.value.on('node:port:mouseenter', ({ port }) => {
      // 高亮端口
      const portElement = graph.value.findView(port).container.querySelector('.x6-port-body')
      if (portElement) {
        portElement.style.stroke = '#5F95FF'
        portElement.style.strokeWidth = '3'
      }
    })
    
    graph.value.on('node:port:mouseleave', ({ port }) => {
      // 取消高亮
      const portElement = graph.value.findView(port).container.querySelector('.x6-port-body')
      if (portElement) {
        portElement.style.stroke = ''
        portElement.style.strokeWidth = ''
      }
    })
  }
  
  // 键盘事件处理函数
  let keyboardCleanup = null
  
  // 键盘事件
  const bindKeyboardEvents = () => {
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
            e.preventDefault()
            const selectedCells = graph.value.getSelectedCells()
            if (selectedCells.length > 0) {
              selectedCells.forEach(cell => {
                if (cell.isNode()) {
                  const nodeData = canvasState.nodes.value.find(n => n.id === cell.id)
                  if (nodeData && nodeData.type !== 'start') {
                    canvasState.removeNode(cell.id)
                    emit('node-deleted', nodeData)
                  }
                }
              })
              graph.value.removeCells((selectedCells || []).filter(cell => 
                !cell.isNode() || canvasState.nodes.value.find(n => n.id === cell.id)?.type !== 'start'
              ))
            }
            break
            
          case 'c':
            if (isCtrlOrCmd) {
              e.preventDefault()
              const selectedCells = graph.value.getSelectedCells()
              if (selectedCells.length > 0) {
                graph.value.copy(selectedCells)
                emit('cells-copied', selectedCells.length)
              }
            }
            break
            
          case 'v':
            if (isCtrlOrCmd) {
              e.preventDefault()
              if (!graph.value.isClipboardEmpty()) {
                const cells = graph.value.paste({ offset: 32 })
                emit('cells-pasted', cells.length)
              }
            }
            break
            
          case 'z':
            if (isCtrlOrCmd) {
              e.preventDefault()
              if (shiftKey) {
                // Ctrl+Shift+Z 重做
                if (graph.value.canRedo()) {
                  graph.value.redo()
                  emit('action-redo')
                }
              } else {
                // Ctrl+Z 撤销
                if (graph.value.canUndo()) {
                  graph.value.undo()
                  emit('action-undo')
                }
              }
            }
            break
            
          case 'y':
            if (isCtrlOrCmd) {
              e.preventDefault()
              if (graph.value.canRedo()) {
                graph.value.redo()
                emit('action-redo')
              }
            }
            break
            
          case 'a':
            if (isCtrlOrCmd) {
              e.preventDefault()
              graph.value.select(graph.value.getCells())
              emit('cells-select-all')
            }
            break
        }
      } catch (error) {
        console.error('[useX6Events] 键盘事件处理失败:', error)
      }
    }
    
    // 绑定键盘事件
    document.addEventListener('keydown', handleKeyDown)
    
    // 保存清理函数
    keyboardCleanup = () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
    
    console.log('[useX6Events] 键盘事件绑定完成')
  }
  
  // 解绑事件
  const unbindEvents = () => {
    if (graph.value) {
      graph.value.off()
    }
    
    // 清理键盘事件监听器
    if (keyboardCleanup) {
      keyboardCleanup()
      keyboardCleanup = null
    }
  }
  
  return {
    isDragging,
    isConnecting,
    bindEvents,
    unbindEvents
  }
}