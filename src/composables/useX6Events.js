/**
 * X6 事件处理 Composable
 * 统一管理所有 X6 图形事件
 */
import { ref } from 'vue'

export function useX6Events(graph, canvasState, emit) {
  const isDragging = ref(false)
  const isConnecting = ref(false)
  
  // 绑定所有事件
  const bindEvents = () => {
    if (!graph) return
    
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
  }
  
  // 节点事件
  const bindNodeEvents = () => {
    // 节点点击
    graph.on('node:click', ({ node }) => {
      const nodeData = canvasState.nodes.value.find(n => n.id === node.id)
      if (nodeData) {
        canvasState.selectNode(node.id)
        emit('node-selected', nodeData)
      }
    })
    
    // 节点双击 - 打开配置
    graph.on('node:dblclick', ({ node }) => {
      const nodeData = canvasState.nodes.value.find(n => n.id === node.id)
      if (nodeData && nodeData.type !== 'start') {
        canvasState.selectNode(node.id)
        emit('node-config-open', nodeData)
      }
    })
    
    // 节点移动开始
    graph.on('node:move', ({ node }) => {
      isDragging.value = true
    })
    
    // 节点移动结束
    graph.on('node:moved', ({ node }) => {
      isDragging.value = false
      const nodeData = canvasState.nodes.value.find(n => n.id === node.id)
      if (nodeData) {
        const position = node.getPosition()
        canvasState.updateNode(node.id, { position })
        emit('node-moved', { nodeId: node.id, position })
      }
    })
    
    // 节点悬停
    graph.on('node:mouseenter', ({ node }) => {
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
    
    graph.on('node:mouseleave', ({ node }) => {
      node.removeTools()
    })
  }
  
  // 连接事件
  const bindEdgeEvents = () => {
    // 连接开始
    graph.on('edge:connecting', () => {
      isConnecting.value = true
    })
    
    // 连接创建
    graph.on('edge:connected', ({ edge }) => {
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
    graph.on('edge:removed', ({ edge }) => {
      canvasState.removeConnection(edge.id)
      emit('connection-deleted', { id: edge.id })
    })
    
    // 连接悬停
    graph.on('edge:mouseenter', ({ edge }) => {
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
    })
    
    graph.on('edge:mouseleave', ({ edge }) => {
      edge.removeTools()
    })
  }
  
  // 画布事件
  const bindCanvasEvents = () => {
    // 空白区域点击
    graph.on('blank:click', () => {
      canvasState.clearSelection()
      emit('canvas-click')
    })
    
    // 画布右键菜单
    graph.on('blank:contextmenu', ({ e }) => {
      e.preventDefault()
      const position = graph.clientToLocal(e.clientX, e.clientY)
      emit('canvas-contextmenu', { position, event: e })
    })
    
    // 画布缩放
    graph.on('scale', ({ sx, sy }) => {
      emit('canvas-scale', { scaleX: sx, scaleY: sy })
    })
    
    // 画布平移
    graph.on('translate', ({ tx, ty }) => {
      emit('canvas-translate', { translateX: tx, translateY: ty })
    })
  }
  
  // 端口事件
  const bindPortEvents = () => {
    // 端口点击
    graph.on('node:port:click', ({ node, port }) => {
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
          const graphPosition = graph.localToGraph(portPosition)
          const clientPosition = graph.graphToClient(graphPosition)
          
          emit('port-click', {
            node: nodeData,
            port,
            position: clientPosition
          })
        } catch (error) {
          console.warn('端口位置计算失败:', error)
          // 降级处理：使用节点中心位置
          const nodePosition = node.getPosition()
          const nodeSize = node.getSize()
          const centerPosition = {
            x: nodePosition.x + nodeSize.width / 2,
            y: nodePosition.y + nodeSize.height / 2
          }
          const graphPosition = graph.localToGraph(centerPosition)
          const clientPosition = graph.graphToClient(graphPosition)
          
          emit('port-click', {
            node: nodeData,
            port,
            position: clientPosition
          })
        }
      }
    })
    
    // 端口悬停
    graph.on('node:port:mouseenter', ({ port }) => {
      // 高亮端口
      const portElement = graph.findView(port).container.querySelector('.x6-port-body')
      if (portElement) {
        portElement.style.stroke = '#5F95FF'
        portElement.style.strokeWidth = '3'
      }
    })
    
    graph.on('node:port:mouseleave', ({ port }) => {
      // 取消高亮
      const portElement = graph.findView(port).container.querySelector('.x6-port-body')
      if (portElement) {
        portElement.style.stroke = ''
        portElement.style.strokeWidth = ''
      }
    })
  }
  
  // 键盘事件
  const bindKeyboardEvents = () => {
    // 删除键
    graph.bindKey('delete', () => {
      const selectedCells = graph.getSelectedCells()
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
        graph.removeCells((selectedCells || []).filter(cell => 
          !cell.isNode() || canvasState.nodes.value.find(n => n.id === cell.id)?.type !== 'start'
        ))
      }
    })
    
    // 复制
    graph.bindKey('ctrl+c', () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length > 0) {
        graph.copy(selectedCells)
        emit('cells-copied', selectedCells.length)
      }
    })
    
    // 粘贴
    graph.bindKey('ctrl+v', () => {
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 })
        emit('cells-pasted', cells.length)
      }
    })
    
    // 撤销
    graph.bindKey('ctrl+z', () => {
      if (graph.canUndo()) {
        graph.undo()
        emit('action-undo')
      }
    })
    
    // 重做
    graph.bindKey('ctrl+y', () => {
      if (graph.canRedo()) {
        graph.redo()
        emit('action-redo')
      }
    })
    
    // 全选
    graph.bindKey('ctrl+a', () => {
      graph.select(graph.getCells())
      emit('cells-select-all')
    })
  }
  
  // 解绑事件
  const unbindEvents = () => {
    if (graph) {
      graph.off()
      graph.unbindKey()
    }
  }
  
  return {
    isDragging,
    isConnecting,
    bindEvents,
    unbindEvents
  }
}