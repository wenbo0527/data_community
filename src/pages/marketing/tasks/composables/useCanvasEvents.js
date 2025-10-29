/**
 * 画布事件处理组合函数
 * 负责处理所有画布相关的事件逻辑
 */
import { nextTick } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'

export function useCanvasEvents(
  graph,
  state,
  emit,
  {
    getNodeConfig,
    addNodeToGraph,
    addConnectionToGraph,
    getAllChildNodes,
    cascadeDeleteNode,
    updateLayoutStats,
    validateNodeConfiguration,
    portConfigFactory,
    previewLineSystem,
    unifiedEdgeManager,
    configDrawers
  }
) {
  // 绑定画布事件 - 增强状态验证
  const bindEvents = () => {
    // 严格验证Graph实例
    if (!graph || !graph.value) {
      const error = new Error('[useCanvasEvents] Graph实例不存在，无法绑定事件')
      console.error(error.message, {
        hasGraph: !!graph,
        hasGraphValue: graph ? !!graph.value : false,
        graphType: graph?.value?.constructor?.name || 'N/A'
      })
      throw error
    }

    if (typeof graph.value.on !== 'function') {
      const error = new Error('[useCanvasEvents] Graph实例缺少on方法，无法绑定事件')
      console.error(error.message, {
        graphValue: graph.value,
        onMethodType: typeof graph.value.on,
        availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(graph.value))
      })
      throw error
    }

    console.log('[useCanvasEvents] Graph实例验证通过，开始绑定事件...', {
      hasGraph: !!graph.value,
      hasOnMethod: typeof graph.value.on === 'function',
      graphType: graph.value.constructor?.name || 'Unknown'
    })

    try {
      // ==================== 节点相关事件 ====================
      
      // 节点点击事件 - 选择节点并打开配置抽屉
      graph.value.on('node:click', ({ node }) => {
        // 防止删除过程中触发节点点击事件
        if (state.isDeletingNode?.value) {
          console.log('[useCanvasEvents] 删除过程中，跳过节点点击事件')
          return
        }

        console.log('[useCanvasEvents] 节点点击:', node.id)
        
        // 安全获取节点数据
        let nodeData
        try {
          nodeData = node.getData()
        } catch (error) {
          console.error('[useCanvasEvents] 获取节点数据失败:', error)
          return
        }

        if (!nodeData) {
          console.warn('[useCanvasEvents] 节点数据为空')
          return
        }

        // 检查是否是拖拽提示点，如果是则跳过
        if (nodeData.isDragHint) {
          console.log('[useCanvasEvents] 拖拽提示点，跳过点击处理')
          return
        }

        // 🔧 修复：统一获取节点类型，支持多种字段格式
        const nodeType = nodeData.type || nodeData.nodeType || 'unknown'
        console.log('[useCanvasEvents] 节点类型获取:', {
          nodeId: node.id,
          nodeType,
          originalType: nodeData.type,
          originalNodeType: nodeData.nodeType,
          nodeData: nodeData
        })

        // 🔧 修复：如果节点类型为 undefined，尝试从节点ID推断
        let finalNodeType = nodeType
        if (nodeType === 'unknown' || !nodeType) {
          const nodeId = node.id || node.getId()
          if (nodeId.includes('audience-split')) {
            finalNodeType = 'audience-split'
          } else if (nodeId.includes('start')) {
            finalNodeType = 'start'
          } else if (nodeId.includes('end')) {
            finalNodeType = 'end'
          } else if (nodeId.includes('ai-call')) {
            finalNodeType = 'ai-call'
          } else if (nodeId.includes('manual-call')) {
            finalNodeType = 'manual-call'
          } else if (nodeId.includes('sms')) {
            finalNodeType = 'sms'
          } else if (nodeId.includes('event-split')) {
            finalNodeType = 'event-split'
          } else if (nodeId.includes('ab-test')) {
            finalNodeType = 'ab-test'
          } else if (nodeId.includes('wait')) {
            finalNodeType = 'wait'
          } else if (nodeId.includes('benefit')) {
            finalNodeType = 'benefit'
          }
          console.log('[useCanvasEvents] 从节点ID推断类型:', {
            nodeId,
            inferredType: finalNodeType
          })
        }

        // 🔧 新增：验证节点类型是否有效
        if (finalNodeType === 'unknown') {
          console.warn('[useCanvasEvents] 无法确定节点类型，使用默认值:', {
            nodeId: node.id,
            nodeData: nodeData
          })
        }

        // 更新选中状态 - 添加安全检查
        try {
          if (state?.selectedNodeId && typeof state.selectedNodeId === 'object' && 'value' in state.selectedNodeId) {
            state.selectedNodeId.value = node.id
          } else {
            console.error('[useCanvasEvents] state.selectedNodeId 未正确初始化:', {
              hasState: !!state,
              hasSelectedNodeId: !!(state?.selectedNodeId),
              selectedNodeIdType: typeof state?.selectedNodeId,
              hasValue: state?.selectedNodeId && 'value' in state.selectedNodeId
            })
          }

          if (state?.selectedNode && typeof state.selectedNode === 'object' && 'value' in state.selectedNode) {
            state.selectedNode.value = node
          } else {
            console.error('[useCanvasEvents] state.selectedNode 未正确初始化:', {
              hasState: !!state,
              hasSelectedNode: !!(state?.selectedNode),
              selectedNodeType: typeof state?.selectedNode,
              hasValue: state?.selectedNode && 'value' in state.selectedNode
            })
          }

          // 触发节点选中事件，使用修复后的节点类型
          emit('node-selected', { node, nodeData: { ...nodeData, type: finalNodeType, nodeType: finalNodeType } })

          // 根据节点类型打开相应的配置抽屉 - 使用修复后的节点类型
          if (finalNodeType === 'start') {
            if (state?.selectedStartNodeData && typeof state.selectedStartNodeData === 'object' && 'value' in state.selectedStartNodeData) {
              // 🔧 修复：确保传递的节点数据包含正确的类型信息
              state.selectedStartNodeData.value = { ...nodeData, type: finalNodeType, nodeType: finalNodeType }
            } else {
              console.error('[useCanvasEvents] state.selectedStartNodeData 未正确初始化')
            }
            
            if (state?.showStartNodeConfigDrawer && typeof state.showStartNodeConfigDrawer === 'object' && 'value' in state.showStartNodeConfigDrawer) {
              state.showStartNodeConfigDrawer.value = true
            } else {
              console.error('[useCanvasEvents] state.showStartNodeConfigDrawer 未正确初始化')
            }
          } else {
            // 使用统一配置抽屉系统
            if (configDrawers && typeof configDrawers.openConfigDrawer === 'function') {
              console.log('[useCanvasEvents] 使用统一配置抽屉系统打开节点配置:', {
                nodeType: finalNodeType,
                nodeId: node.id
              })
              
              // 传递完整的节点数据给配置抽屉系统
              const nodeDataForDrawer = { 
                ...nodeData, 
                type: finalNodeType, 
                nodeType: finalNodeType,
                id: node.id
              }
              
              configDrawers.openConfigDrawer(finalNodeType, node, nodeDataForDrawer)
            } else {
              console.error('[useCanvasEvents] configDrawers 系统未正确初始化或缺少 openConfigDrawer 方法')
              console.error('[useCanvasEvents] configDrawers 详情:', {
                hasConfigDrawers: !!configDrawers,
                configDrawersType: typeof configDrawers,
                configDrawersKeys: configDrawers ? Object.keys(configDrawers) : [],
                hasOpenConfigDrawer: !!(configDrawers && configDrawers.openConfigDrawer),
                openConfigDrawerType: configDrawers && configDrawers.openConfigDrawer ? typeof configDrawers.openConfigDrawer : 'undefined'
              })
              
              // 更新选中节点数据
              if (state?.selectedNodeData && typeof state.selectedNodeData === 'object' && 'value' in state.selectedNodeData) {
                try {
                  state.selectedNodeData.value = { ...nodeData, type: finalNodeType, nodeType: finalNodeType }
                } catch (updateError) {
                  console.error('[useCanvasEvents] 更新选中节点数据失败:', updateError)
                  throw new Error(`更新选中节点数据失败: ${updateError.message}`)
                }
              }
            }
          }
        } catch (stateError) {
          console.error('[useCanvasEvents] 更新节点选中状态时发生错误:', stateError)
          console.error('[useCanvasEvents] 状态对象详情:', {
            hasState: !!state,
            stateKeys: state ? Object.keys(state) : [],
            selectedNodeIdExists: !!(state?.selectedNodeId),
            selectedNodeExists: !!(state?.selectedNode)
          })
          
          // 错误处理：状态更新失败时抛出错误
          throw new Error(`节点选中状态更新失败: ${stateError.message}`)
        }
      })

      // 节点双击事件 - 快速编辑节点
      graph.value.on('node:dblclick', ({ node }) => {
        console.log('[useCanvasEvents] 节点双击:', node.id)
        
        try {
          const nodeData = node.getData()
          if (nodeData && !nodeData.isDragHint) {
            // 触发节点编辑事件
            emit('node-edit-requested', { node, nodeData })
          }
        } catch (error) {
          console.error('[useCanvasEvents] 处理节点双击事件失败:', error)
        }
      })

      // 节点拖拽开始事件
      graph.value.on('node:mousedown', ({ node }) => {
        try {
          const nodeData = node.getData()
          if (nodeData && !nodeData.isDragHint) {
            console.log('[useCanvasEvents] 节点拖拽开始:', node.id)
            
            // 🔧 修复层级遮挡：拖拽开始时提升节点z-index到最高层级
            const originalZIndex = node.getZIndex()
            node.setData({ ...nodeData, originalZIndex }) // 保存原始z-index
            node.setZIndex(1000) // 设置为最高层级
            console.log(`[useCanvasEvents] 节点 ${node.id} z-index 提升至 1000`)
          }
        } catch (error) {
          console.error('[useCanvasEvents] 处理节点拖拽开始事件失败:', error)
        }
      })

      // 节点拖拽移动事件
      graph.value.on('node:move', ({ node }) => {
        try {
          const nodeData = node.getData()
          if (nodeData && !nodeData.isDragHint) {
            console.log('[useCanvasEvents] 节点拖拽移动:', node.id)
            
            // 更新节点位置
            const position = node.getPosition()
            emit('node-moved', { 
              node, 
              nodeData, 
              position,
              nodeId: node.id 
            })
          }
        } catch (error) {
          console.error('[useCanvasEvents] 处理节点拖拽事件失败:', error)
        }
      })

      // 节点拖拽结束事件
      graph.value.on('node:mouseup', ({ node }) => {
        try {
          const nodeData = node.getData()
          if (nodeData && !nodeData.isDragHint) {
            console.log('[useCanvasEvents] 节点拖拽结束:', node.id)
            
            // 🔧 修复层级遮挡：拖拽结束时恢复节点原始z-index
            const originalZIndex = nodeData.originalZIndex
            if (originalZIndex !== undefined) {
              node.setZIndex(originalZIndex)
              console.log(`[useCanvasEvents] 节点 ${node.id} z-index 恢复至 ${originalZIndex}`)
              
              // 清理临时数据
              const { originalZIndex: _, ...cleanNodeData } = nodeData
              node.setData(cleanNodeData)
            } else {
              // 如果没有原始z-index，设置为默认值
              const defaultZIndex = node.isSelected() ? 20 : 10
              node.setZIndex(defaultZIndex)
              console.log(`[useCanvasEvents] 节点 ${node.id} z-index 设置为默认值 ${defaultZIndex}`)
            }
          }
        } catch (error) {
          console.error('[useCanvasEvents] 处理节点拖拽结束事件失败:', error)
        }
      })

      // 节点位置变更事件
      graph.value.on('node:change:position', ({ node }) => {
        try {
          const nodeData = node.getData()
          if (nodeData && !nodeData.isDragHint) {
            console.log('[useCanvasEvents] 节点位置更新完成:', node.id)
            
            const position = node.getPosition()
            emit('node-position-changed', { 
              node, 
              nodeData, 
              position,
              nodeId: node.id 
            })
          }
        } catch (error) {
          console.error('[useCanvasEvents] 处理节点位置变更事件失败:', error)
        }
      })

      // ==================== 连接线相关事件 ====================
      
      // 连接线点击事件
      graph.value.on('edge:click', ({ edge, e }) => {
        console.log('[useCanvasEvents] 连接线点击:', edge.id)
        
        try {
          const edgeData = edge.getData() || {}
          
          // 更新选中状态 - 添加安全检查
          if (state?.selectedEdgeId && typeof state.selectedEdgeId === 'object' && 'value' in state.selectedEdgeId) {
            state.selectedEdgeId.value = edge.id
          } else {
            console.error('[useCanvasEvents] state.selectedEdgeId 未正确初始化')
          }
          
          if (state?.selectedEdge && typeof state.selectedEdge === 'object' && 'value' in state.selectedEdge) {
            state.selectedEdge.value = edge
          } else {
            console.error('[useCanvasEvents] state.selectedEdge 未正确初始化')
          }
          
          // 触发连接线选中事件
          emit('edge-selected', { edge, edgeData })
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理连接线点击事件失败:', error)
        }
      })

      // 连接线右键菜单事件
      graph.value.on('edge:contextmenu', ({ edge, e }) => {
        console.log('[useCanvasEvents] 连接线右键菜单:', edge.id)
        
        try {
          e.preventDefault()
          
          const edgeData = edge.getData() || {}
          const position = {
            x: e.clientX,
            y: e.clientY
          }
          
          // 🔧 修复：添加连接线右键删除功能
          const isPreviewLine = edgeData.isPreview || edge.id.includes('preview')
          
          // 创建右键菜单选项
          const menuOptions = []
          
          if (!isPreviewLine) {
            // 只有真实连接线才显示删除选项
            menuOptions.push({
              label: '删除连接',
              key: 'delete',
              icon: 'icon-delete',
              danger: true,
              onClick: () => {
                handleDeleteConnection(edge)
              }
            })
          }
          
          // 显示连接线右键菜单 - 修复状态名称
          if (state?.edgeContextMenu && typeof state.edgeContextMenu === 'object' && 'value' in state.edgeContextMenu) {
            state.edgeContextMenu.value = {
              visible: true,
              x: position.x,
              y: position.y,
              edge,
              edgeData,
              menuOptions,
              isPreviewLine
            }
          } else {
            console.error('[useCanvasEvents] state.edgeContextMenu 未正确初始化')
          }
          
          // 触发右键菜单事件
          emit('edge-context-menu', { edge, edgeData, position, menuOptions, isPreviewLine })
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理连接线右键菜单事件失败:', error)
        }
      })

      // 连接线创建事件
      graph.value.on('edge:connected', ({ edge }) => {
        console.log('[useCanvasEvents] 连接线创建:', edge.id)
        
        try {
          const edgeData = edge.getData() || {}
          const sourceId = edge.getSourceCellId()
          const targetId = edge.getTargetCellId()
          const sourcePort = edge.getSourcePortId()
          const targetPort = edge.getTargetPortId()
          
          // 触发连接创建事件
          emit('connection-created', {
            edge,
            edgeData,
            sourceId,
            targetId,
            sourcePort,
            targetPort
          })
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理连接线创建事件失败:', error)
        }
      })

      // 连接线删除事件
      graph.value.on('edge:removed', ({ edge }) => {
        console.log('[useCanvasEvents] 连接线删除:', edge.id)
        
        try {
          const edgeData = edge.getData() || {}
          
          // 清除选中状态 - 添加安全检查
          if (state?.selectedEdgeId && 'value' in state.selectedEdgeId && state.selectedEdgeId.value === edge.id) {
            if (state?.selectedEdgeId && 'value' in state.selectedEdgeId) {
              state.selectedEdgeId.value = null
            }
            if (state?.selectedEdge && 'value' in state.selectedEdge) {
              state.selectedEdge.value = null
            }
          }
          
          // 触发连接删除事件
          emit('connection-deleted', { edge, edgeData })
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理连接线删除事件失败:', error)
        }
      })

      // ==================== Vue组件自定义事件 ====================
      
      // Vue组件删除事件 - FlowNode组件触发的删除事件
      graph.value.on('vue:delete', ({ node }) => {
        console.log('[useCanvasEvents] 接收到vue:delete事件:', node?.id)
        handleNodeDelete({ node })
      })

      // Vue组件预设位点击事件 - FlowNode组件触发的预设位点击事件
      graph.value.on('vue:slot-click', ({ node, data }) => {
        console.log('[useCanvasEvents] 接收到vue:slot-click事件:', node?.id, data)
        handleNodeTypeSelected(data)
      })

      // ==================== 画布相关事件 ====================
      
      // 画布点击事件 - 清除选中状态
      graph.value.on('blank:click', ({ e }) => {
        console.log('[useCanvasEvents] 画布空白区域点击')
        
        try {
          // 清除节点选中状态 - 添加安全检查
          if (state?.selectedNodeId && 'value' in state.selectedNodeId) {
            state.selectedNodeId.value = null
          }
          if (state?.selectedNode && 'value' in state.selectedNode) {
            state.selectedNode.value = null
          }
          
          // 清除连接线选中状态 - 添加安全检查
          if (state?.selectedEdgeId && 'value' in state.selectedEdgeId) {
            state.selectedEdgeId.value = null
          }
          if (state?.selectedEdge && 'value' in state.selectedEdge) {
            state.selectedEdge.value = null
          }
          
          // 关闭配置抽屉 - 添加安全检查
          if (state?.showConfigDrawer && 'value' in state.showConfigDrawer) {
            state.showConfigDrawer.value = false
          }
          if (state?.showStartNodeConfigDrawer && 'value' in state.showStartNodeConfigDrawer) {
            state.showStartNodeConfigDrawer.value = false
          }
          
          // 隐藏右键菜单 - 修复状态名称
          if (state?.edgeContextMenu && 'value' in state.edgeContextMenu && state.edgeContextMenu.value) {
            state.edgeContextMenu.value.visible = false
          }
          
          // 触发画布点击事件
          emit('canvas-clicked', { event: e })
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理画布点击事件失败:', error)
        }
      })

      // 画布右键菜单事件
      graph.value.on('blank:contextmenu', ({ e }) => {
        console.log('[useCanvasEvents] 画布右键菜单')
        
        try {
          e.preventDefault()
          
          const position = {
            x: e.clientX,
            y: e.clientY
          }
          
          // 触发画布右键菜单事件
          emit('canvas-context-menu', { position, event: e })
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理画布右键菜单事件失败:', error)
        }
      })

      // 画布缩放事件
      graph.value.on('scale', ({ sx, sy }) => {
        console.log('[useCanvasEvents] 画布缩放:', { sx, sy })
        
        try {
          // 更新缩放状态 - 增强安全检查
          if (state && state.canvasScale && typeof state.canvasScale === 'object' && 'value' in state.canvasScale) {
            state.canvasScale.value = sx
          } else {
            console.warn('[useCanvasEvents] state.canvasScale 不存在或无效，跳过状态更新:', {
              hasState: !!state,
              hasCanvasScale: !!(state && state.canvasScale),
              canvasScaleType: state && state.canvasScale ? typeof state.canvasScale : 'undefined',
              hasValue: state && state.canvasScale && 'value' in state.canvasScale
            })
          }
          
          // 触发缩放事件
          emit('canvas-scaled', { scaleX: sx, scaleY: sy })
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理画布缩放事件失败:', error)
        }
      })

      // 画布平移事件
      graph.value.on('translate', ({ tx, ty }) => {
        console.log('[useCanvasEvents] 画布平移:', { tx, ty })
        
        try {
          // 更新平移状态 - 增强安全检查
          if (state && state.canvasTranslate && typeof state.canvasTranslate === 'object' && 'value' in state.canvasTranslate) {
            state.canvasTranslate.value = { x: tx, y: ty }
          } else {
            console.warn('[useCanvasEvents] state.canvasTranslate 不存在或无效，跳过状态更新:', {
              hasState: !!state,
              hasCanvasTranslate: !!(state && state.canvasTranslate),
              canvasTranslateType: state && state.canvasTranslate ? typeof state.canvasTranslate : 'undefined',
              hasValue: state && state.canvasTranslate && 'value' in state.canvasTranslate
            })
          }
          
          // 触发平移事件
          emit('canvas-translated', { translateX: tx, translateY: ty })
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理画布平移事件失败:', error)
        }
      })

      // ==================== 键盘事件处理 ====================
      
      // 绑定键盘事件监听器
      const handleKeydown = (e) => {
        // 防止在输入框中触发快捷键
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' || 
            e.target.contentEditable === 'true') {
          return
        }

        try {
          // Delete/Backspace - 删除选中的节点或连接线
          if (e.key === 'Delete' || e.key === 'Backspace') {
            console.log('[useCanvasEvents] 检测到删除快捷键')
            e.preventDefault()
            
            if (state?.selectedNodeId && 'value' in state.selectedNodeId && state.selectedNodeId.value) {
              const node = graph.value.getCellById(state.selectedNodeId.value)
              if (node) {
                emit('node-delete-requested', { node })
              }
            } else if (state?.selectedEdgeId && 'value' in state.selectedEdgeId && state.selectedEdgeId.value) {
              const edge = graph.value.getCellById(state.selectedEdgeId.value)
              if (edge) {
                emit('edge-delete-requested', { edge })
              }
            }
          }
          // ESC - 取消当前操作
          else if (e.key === 'Escape') {
            console.log('[useCanvasEvents] 检测到ESC键')
            e.preventDefault()
            
            // 清除选中状态 - 添加安全检查
            if (state?.selectedNodeId && 'value' in state.selectedNodeId) {
              state.selectedNodeId.value = null
            }
            if (state?.selectedNode && 'value' in state.selectedNode) {
              state.selectedNode.value = null
            }
            if (state?.selectedEdgeId && 'value' in state.selectedEdgeId) {
              state.selectedEdgeId.value = null
            }
            if (state?.selectedEdge && 'value' in state.selectedEdge) {
              state.selectedEdge.value = null
            }
            
            // 关闭抽屉和菜单 - 添加安全检查
            if (state?.showConfigDrawer && 'value' in state.showConfigDrawer) {
              state.showConfigDrawer.value = false
            }
            if (state?.showStartNodeConfigDrawer && 'value' in state.showStartNodeConfigDrawer) {
              state.showStartNodeConfigDrawer.value = false
            }
            
            if (state?.edgeContextMenu && 'value' in state.edgeContextMenu && state.edgeContextMenu.value) {
              state.edgeContextMenu.value.visible = false
            }
            
            emit('operation-cancelled')
          }
          // Ctrl/Cmd + Z - 撤销
          else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
            console.log('[useCanvasEvents] 检测到撤销快捷键')
            e.preventDefault()
            emit('undo-requested')
          }
          // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y - 重做
          else if (((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) ||
                   ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
            console.log('[useCanvasEvents] 检测到重做快捷键')
            e.preventDefault()
            emit('redo-requested')
          }
          // Ctrl/Cmd + A - 全选
          else if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
            console.log('[useCanvasEvents] 检测到全选快捷键')
            e.preventDefault()
            
            const nodes = graph.value.getNodes()
            graph.value.select(nodes)
            emit('select-all-requested', { nodes })
          }
          // Ctrl/Cmd + C - 复制
          else if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
            console.log('[useCanvasEvents] 检测到复制快捷键')
            e.preventDefault()
            
            if (state.selectedNodeId.value) {
              const node = graph.value.getCellById(state.selectedNodeId.value)
              if (node) {
                emit('copy-requested', { node })
              }
            }
          }
          // Ctrl/Cmd + V - 粘贴
          else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
            console.log('[useCanvasEvents] 检测到粘贴快捷键')
            e.preventDefault()
            emit('paste-requested')
          }
          
        } catch (error) {
          console.error('[useCanvasEvents] 处理键盘事件失败:', error)
        }
      }

      // 绑定键盘事件
      document.addEventListener('keydown', handleKeydown)
      
      // 存储事件处理器引用，用于解绑
      state.keydownHandler = handleKeydown

      console.log('[useCanvasEvents] ✓ 所有事件绑定完成')
      
    } catch (error) {
      console.error('[useCanvasEvents] 事件绑定过程中发生错误:', error)
      throw new Error(`事件绑定失败: ${error.message}`)
    }
  }

  // 解绑事件
  const unbindEvents = () => {
    try {
      console.log('[useCanvasEvents] 开始解绑事件...')
      
      // 解绑键盘事件
      if (state.keydownHandler) {
        document.removeEventListener('keydown', state.keydownHandler)
        state.keydownHandler = null
        console.log('[useCanvasEvents] ✓ 键盘事件已解绑')
      }
      
      // Graph事件会在Graph实例销毁时自动解绑
      console.log('[useCanvasEvents] ✓ 事件解绑完成')
      
    } catch (error) {
      console.error('[useCanvasEvents] 解绑事件失败:', error)
    }
  }

  // 处理连接线删除
  const handleDeleteConnection = (connectionInfo) => {
    try {
      console.log('[useCanvasEvents] 处理连接线删除:', connectionInfo)
      
      // 如果有预览线系统，尝试恢复预览线
      if (previewLineSystem && typeof previewLineSystem.restorePreviewLine === 'function') {
        previewLineSystem.restorePreviewLine(connectionInfo.source, connectionInfo.target)
      }
      
      // 触发连接删除事件
      emit('connection-deleted', connectionInfo)
      
    } catch (error) {
      console.error('[useCanvasEvents] 处理连接线删除失败:', error)
    }
  }

  // 处理节点删除
  const handleNodeDelete = ({ node }) => {
    console.log('[useCanvasEvents] 开始处理节点删除:', node?.id)
    
    try {
      // 验证节点参数
      if (!node) {
        console.error('[useCanvasEvents] 节点参数为空')
        return
      }

      const nodeId = node.id
      const nodeData = node.getData()
      
      // 验证节点数据
      if (!nodeId) {
        console.error('[useCanvasEvents] 节点ID为空')
        return
      }

      // 检查是否为拖拽提示节点，不允许删除
      if (nodeData && nodeData.isDragHint) {
        console.log('[useCanvasEvents] 跳过删除拖拽提示节点:', nodeId)
        return
      }

      // 显示删除确认对话框
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除这个节点吗？删除后无法恢复。',
        okText: '删除',
        cancelText: '取消',
        okButtonProps: { status: 'danger' },
        onOk: () => {
          try {
            console.log('[useCanvasEvents] 用户确认删除节点:', nodeId)
            
            // 清除选中状态（如果当前节点被选中）
            if (state?.selectedNodeId && 'value' in state.selectedNodeId && state.selectedNodeId.value === nodeId) {
              state.selectedNodeId.value = null
            }
            if (state?.selectedNode && 'value' in state.selectedNode && state.selectedNode.value?.id === nodeId) {
              state.selectedNode.value = null
            }
            
            // 关闭配置抽屉（如果打开）
            if (state?.showConfigDrawer && 'value' in state.showConfigDrawer) {
              state.showConfigDrawer.value = false
            }
            if (state?.showStartNodeConfigDrawer && 'value' in state.showStartNodeConfigDrawer) {
              state.showStartNodeConfigDrawer.value = false
            }
            
            // 直接调用级联删除函数执行实际删除
            if (typeof cascadeDeleteNode === 'function') {
              cascadeDeleteNode(nodeId)
            } else {
              console.error('[useCanvasEvents] cascadeDeleteNode 函数不可用')
              // 作为备用，触发节点删除事件
              emit('node-delete-requested', { node, nodeData })
            }
            
            Message.success('节点删除成功')
            
          } catch (error) {
            console.error('[useCanvasEvents] 删除节点失败:', error)
            Message.error('删除节点失败: ' + error.message)
          }
        },
        onCancel: () => {
          console.log('[useCanvasEvents] 用户取消删除节点:', nodeId)
        }
      })
      
    } catch (error) {
      console.error('[useCanvasEvents] 处理节点删除失败:', error)
      Message.error('删除节点失败: ' + error.message)
    }
  }

  // 处理节点类型选择
  const handleNodeTypeSelected = async (nodeType) => {
    console.log('[useCanvasEvents] 开始处理节点类型选择:', { nodeType, type: typeof nodeType })
    
    try {
      // 🔧 修复：增强参数验证，确保 nodeType 是有效的字符串
      if (!nodeType || typeof nodeType !== 'string' || nodeType.trim() === '') {
        console.error('[useCanvasEvents] 无效的节点类型参数:', { 
          nodeType, 
          type: typeof nodeType,
          isEmpty: !nodeType,
          isString: typeof nodeType === 'string',
          trimmed: typeof nodeType === 'string' ? nodeType.trim() : 'N/A'
        })
        return
      }

      // 规范化节点类型
      const normalizedNodeType = nodeType.trim()
      
      // 验证节点类型配置是否存在
      console.log('[useCanvasEvents] 调用 getNodeConfig，参数:', { normalizedNodeType, type: typeof normalizedNodeType })
      const nodeConfig = getNodeConfig(normalizedNodeType)
      console.log('[useCanvasEvents] getNodeConfig 返回结果:', nodeConfig)
      if (!nodeConfig) {
        console.error('[useCanvasEvents] 节点类型配置不存在:', normalizedNodeType)
        return
      }

      // 验证graph实例
      if (!graph?.value) {
        console.error('[useCanvasEvents] Graph实例不存在，无法添加节点')
        return
      }

      // 获取节点选择器的位置
      const position = state.nodeSelectorPosition?.value
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        console.error('[useCanvasEvents] 无效的位置参数:', position)
        return
      }

      // 生成节点ID
      const nodeId = `${normalizedNodeType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 创建节点数据 - 使用已验证的 nodeConfig
      const nodeData = {
        id: nodeId,
        type: normalizedNodeType,
        nodeType: normalizedNodeType, // 确保兼容性
        label: nodeConfig.label || normalizedNodeType,
        position: { ...position },
        data: {
          type: normalizedNodeType,
          nodeType: normalizedNodeType,
          label: nodeConfig.label || normalizedNodeType,
          isConfigured: false,
          config: {}
        }
      }

      console.log('[useCanvasEvents] 准备添加节点:', nodeData)

      // 调用添加节点函数
      const node = await addNodeToGraph(nodeData, position)
      
      if (node) {
        console.log('[useCanvasEvents] ✅ 节点添加成功:', {
          nodeId,
          nodeType: normalizedNodeType,
          position,
          nodeInstance: node.id
        })
        
        // 隐藏节点选择器 - 添加安全检查
        if (state?.showNodeSelector && 'value' in state.showNodeSelector) {
          state.showNodeSelector.value = false
        }
        if (state?.nodeSelectorPosition && 'value' in state.nodeSelectorPosition) {
          state.nodeSelectorPosition.value = null
        }
        
        // 触发节点添加事件
        emit('nodeAdded', { 
          nodeId, 
          nodeType: normalizedNodeType, 
          position, 
          node 
        })
        
        // 显示成功消息
        if (typeof Message !== 'undefined' && Message.success) {
          Message.success(`成功添加${nodeConfig.label || normalizedNodeType}节点`)
        }
      } else {
        console.error('[useCanvasEvents] ❌ 节点添加失败，返回null')
        
        // 显示错误消息
        if (typeof Message !== 'undefined' && Message.error) {
          Message.error('节点添加失败，请重试')
        }
      }
      
    } catch (error) {
      console.error('[useCanvasEvents] 处理节点类型选择时发生错误:', error)
      console.error('[useCanvasEvents] 错误堆栈:', error.stack)
      
      // 确保隐藏节点选择器 - 添加安全检查
      if (state?.showNodeSelector && 'value' in state.showNodeSelector) {
        state.showNodeSelector.value = false
      }
      if (state?.nodeSelectorPosition && 'value' in state.nodeSelectorPosition) {
        state.nodeSelectorPosition.value = null
      }
      
      // 显示错误消息给用户
      if (typeof Message !== 'undefined' && Message.error) {
        Message.error(`添加节点失败: ${error.message}`)
      }
    }
  }

  // 关闭节点选择器
  const closeNodeSelector = () => {
    try {
      if (state?.showNodeSelector && 'value' in state.showNodeSelector) {
        state.showNodeSelector.value = false
      }
      if (state?.nodeSelectorPosition && 'value' in state.nodeSelectorPosition) {
        state.nodeSelectorPosition.value = null
      }
    } catch (error) {
      console.error('[useCanvasEvents] 关闭节点选择器失败:', error)
    }
  }

  return {
    bindEvents,
    unbindEvents,
    handleNodeTypeSelected,
    handleNodeDelete,
    handleDeleteConnection,
    closeNodeSelector
  }
}