import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 事件处理 Composable
 * 负责画布的各种事件监听和处理
 */
export function useEventHandlers(getGraph, nodeOperations, emit) {
  let keydownHandler = null
  let clickTimeout = null

  /**
   * 初始化事件监听器
   */
  const initEventListeners = () => {
    const graph = getGraph()
    if (!graph) return

    // 键盘事件
    setupKeyboardEvents(graph)
    
    // 节点事件
    setupNodeEvents(graph)
    
    // 画布事件
    setupCanvasEvents(graph)
    
    // 连接事件
    setupConnectionEvents(graph)
  }

  /**
   * 设置键盘事件
   */
  const setupKeyboardEvents = (graph) => {
    keydownHandler = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey

      // 复制
      if (isCtrlOrCmd && e.key === 'c') {
        e.preventDefault()
        const cells = graph.getSelectedCells()
        if (cells.length && graph.copy) {
          graph.copy(cells)
        }
      }
      // 粘贴
      else if (isCtrlOrCmd && e.key === 'v') {
        e.preventDefault()
        if (graph.paste && !graph.isClipboardEmpty()) {
          const cells = graph.paste({ offset: 32 })
          graph.cleanSelection()
          graph.select(cells)
        }
      }
      // 删除
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        handleDeleteSelectedNodes(graph)
      }
      // 全选
      else if (isCtrlOrCmd && e.key === 'a') {
        e.preventDefault()
        const nodes = graph.getNodes()
        const edges = graph.getEdges()
        graph.select([...nodes, ...edges])
      }
      // 撤销
      else if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (graph.canUndo && graph.canUndo()) {
          graph.undo()
        }
      }
      // 重做
      else if (isCtrlOrCmd && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        if (graph.canRedo && graph.canRedo()) {
          graph.redo()
        }
      }
    }

    document.addEventListener('keydown', keydownHandler)
  }

  /**
   * 设置节点事件
   */
  const setupNodeEvents = (graph) => {
    // 节点鼠标按下事件
    graph.on('node:mousedown', ({ node }) => {
      const nodeData = node.getData()
      if (nodeData?.type !== 'start') {
        if (nodeOperations.isDraggingNode.value) return // 防止重复触发
        nodeOperations.isDraggingNode.value = true
        nodeOperations.draggingNodeId.value = node.id
        node.toFront()
        console.log('[MouseDown] 开始移动节点', 'nodeId:', node.id)
      }
    }, { passive: true })

    // 节点位置改变事件
    graph.on('node:change:position', ({ node }) => {
      const currentPosition = node.position()

      // 实时更新连线路径
      if (graph && node.isNode()) {
        graph.getConnectedEdges(node).forEach(edge => {
          edge.router?.()
          edge.connector?.()
        })
      }

      // 防抖处理位置同步
      clearTimeout(node.__positionTimer)
      node.__positionTimer = setTimeout(() => {
        node.setData({
          ...node.getData(),
          position: currentPosition
        })
      }, 150)

      // 非开始节点置于底层
      if (node.getData()?.type !== 'start') {
        node.toBack()
      }
    }, { passive: true })

    // 节点单击事件
    graph.on('node:click', ({ node, e }) => {
      handleNodeClick(node, e)
    })

    // 节点双击事件
    graph.on('node:dblclick', ({ node }) => {
      handleNodeDoubleClick(node)
    })

    // 节点移动完成事件
    graph.on('node:moved', ({ node }) => {
      console.log('Node moved:', node.id)
      emit('node-moved', {
        nodeId: node.id,
        position: node.position()
      })
    })
  }

  /**
   * 设置画布事件
   */
  const setupCanvasEvents = (graph) => {
    // 右键菜单
    graph.on('cell:contextmenu', ({ cell, e }) => {
      e.preventDefault()
      if (cell.isNode() && cell.getData()?.type !== 'start') {
        const cells = graph.getSelectedCells().filter(selectedCell =>
          selectedCell.id === cell.id && selectedCell.getData()?.type !== 'start'
        )
        if (cells.length > 0) {
          handleDeleteNodes(graph, cells)
        }
      }
    })
  }

  /**
   * 设置连接事件
   */
  const setupConnectionEvents = (graph) => {
    // 连接完成事件
    graph.on('edge:connected', ({ edge }) => {
      console.log('连接完成:', edge.id)
      emit('edge-connected', {
        edgeId: edge.id,
        source: edge.getSourceNode()?.id,
        target: edge.getTargetNode()?.id
      })
    })
  }

  /**
   * 处理节点单击
   */
  const handleNodeClick = (node, e) => {
    // 防止重复点击
    if (clickTimeout) {
      clearTimeout(clickTimeout)
    }

    clickTimeout = setTimeout(() => {
      const nodeData = node.getData()
      const nodeType = nodeData?.type
      
      console.log('Node clicked:', nodeType, node.id)
      
      // 触发节点点击事件
      emit('node-clicked', {
        node,
        nodeType,
        nodeData
      })
      
      clickTimeout = null
    }, 200) // 200ms 防抖延迟
  }

  /**
   * 处理节点双击
   */
  const handleNodeDoubleClick = (node) => {
    const nodeData = node.getData()
    const nodeType = nodeData?.type
    
    console.log('Node double clicked:', nodeType, node.id)
    
    // 如果节点有输出端口，显示添加后续节点的选项
    if (nodeType !== 'end') {
      // 触发显示节点类型选择器
      emit('show-node-selector', {
        sourceNode: node,
        position: {
          x: node.position().x + node.size().width + 50,
          y: node.position().y
        }
      })
    }
    
    // 触发节点双击事件
    emit('node-double-clicked', {
      node,
      nodeType,
      nodeData
    })
  }

  /**
   * 处理拖拽相关事件
   */
  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragStart = (event, nodeType) => {
    if (!event.dataTransfer) {
      console.error('[DragStart] 缺少dataTransfer对象', event)
      return
    }
    event.dataTransfer.clearData()
    event.dataTransfer.setData('nodeType', nodeType)
    event.dataTransfer.setData('isCreating', 'true')
    console.log('[DragStart] 初始化新节点拖拽', 'nodeType:', nodeType)
  }

  const handleDragEnd = () => {
    const graph = getGraph()
    if (graph) {
      graph.getNodes().forEach(node => {
        node.attr('body/strokeDasharray', null)
      })
    }
    nodeOperations.isDraggingNode.value = false
    nodeOperations.draggingNodeId.value = null
  }

  const handleDrop = (event, containerRef) => {
    event.preventDefault()
    const isCreating = event.dataTransfer.getData('isCreating') === 'true'
    const nodeType = event.dataTransfer.getData('nodeType')
    const graph = getGraph()

    if (!graph) return

    const rect = containerRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (isCreating && nodeType) {
      // 创建新节点
      const newNode = nodeOperations.addNode(nodeType, { x, y })
      if (newNode) {
        newNode.toBack()

        // 自动连接最后一个节点
        const nodes = graph.getNodes()
        if (nodes.length > 1) {
          const prevNode = nodes[nodes.length - 2]
          graph.addEdge({
            source: prevNode,
            target: newNode,
            connector: 'smooth',
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: 'block'
              }
            }
          })
        }

        emit('node-created', {
          node: newNode,
          nodeType,
          position: { x, y }
        })
      }
    } else if (nodeOperations.isDraggingNode.value && nodeOperations.draggingNodeId.value) {
      // 移动现有节点
      const success = nodeOperations.moveNode(nodeOperations.draggingNodeId.value, {
        x: x - 50,
        y: y - 50
      })
      
      if (success) {
        emit('node-moved', {
          nodeId: nodeOperations.draggingNodeId.value,
          position: { x: x - 50, y: y - 50 }
        })
      }
    }

    // 重置拖拽状态
    nodeOperations.isDraggingNode.value = false
    nodeOperations.draggingNodeId.value = null
  }

  /**
   * 处理删除选中的节点
   */
  const handleDeleteSelectedNodes = (graph) => {
    const cells = graph.getSelectedCells().filter(cell =>
      nodeOperations.isRemovableNode(cell)
    )
    
    if (cells.length > 0) {
      handleDeleteNodes(graph, cells)
    }
  }

  /**
   * 处理删除节点
   */
  const handleDeleteNodes = (graph, cells) => {
    // 添加删除确认提示
    if (confirm(`确定要删除选中的${cells.length}个节点吗？`)) {
      // 添加删除动画效果
      cells.forEach(cell => {
        cell.animate('attrs', {
          body: { fill: '#ff4d4f90', stroke: '#ff4d4f' }
        }, {
          duration: 150,
          callback: () => {
            if (graph.hasCell(cell)) {
              graph.removeCells([cell])
            }
          }
        })
      })
      
      // 发布删除事件
      emit('nodes-deleted', cells.map(cell => cell.id))
    }
  }

  /**
   * 清理事件监听器
   */
  const cleanupEventListeners = () => {
    // 清理键盘事件监听器
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler)
      keydownHandler = null
    }

    // 清理点击超时
    if (clickTimeout) {
      clearTimeout(clickTimeout)
      clickTimeout = null
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanupEventListeners()
  })

  return {
    // 初始化方法
    initEventListeners,
    cleanupEventListeners,
    
    // 拖拽事件处理
    handleDragOver,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    
    // 节点事件处理
    handleNodeClick,
    handleNodeDoubleClick,
    
    // 删除处理
    handleDeleteSelectedNodes,
    handleDeleteNodes
  }
}