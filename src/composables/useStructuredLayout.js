/**
 * 原生Dagre布局 Composable
 * 专注于原生Dagre布局，支持预览线和拖拽点处理
 */

import { ref, computed, nextTick } from 'vue'
import { DagreLayout } from '@antv/layout'
import { Graph } from '@antv/graphlib'
import { coordinateManager } from '../utils/CoordinateSystemManager.js'
import UnifiedPreviewLineManager from '../utils/UnifiedPreviewLineManager.js'

export function useStructuredLayout(getGraph) {
  const connectionPreviewManager = ref(null)
  const isLayouting = ref(false)
  const layoutOptions = ref({
    centerAfterLayout: true,
    animateTransition: true,
    preserveConnections: true
  })
  
  // 布局统计
  const layoutStats = ref({
    lastLayoutTime: 0,
    totalLayouts: 0,
    averageLayoutTime: 0
  })
  
  // 布局配置
  const layoutConfig = ref({
    levelHeight: 150,
    nodeSpacing: 200,
    branchSpacing: 180,
    centerAlignment: true,
    gridSize: 20,
    previewLineSpacing: 80,
    enableIncrementalLayout: true,
    enableBatching: true,
    layoutThrottle: 100
  })

  /**
   * 初始化布局系统
   */
  const initializeLayoutEngine = () => {
    console.log('[useStructuredLayout] 初始化原生Dagre布局系统')
    
    try {
      const graph = getGraph()
      
      if (!graph) {
        console.error('[useStructuredLayout] 图实例不存在，无法初始化')
        return false
      }
      
      // 初始化坐标管理器
      coordinateManager.setGraph(graph)
      coordinateManager.setDebugMode(process.env.NODE_ENV === 'development')
      
      // 创建统一预览线管理器
      connectionPreviewManager.value = new UnifiedPreviewLineManager(graph, null, layoutConfig.value)
      
      // 初始化预览线管理器
      if (connectionPreviewManager.value) {
        connectionPreviewManager.value.init()
      }
      
      console.log('[useStructuredLayout] 原生Dagre布局系统初始化完成', {
        coordinateManager: coordinateManager.getStatus(),
        previewManager: !!connectionPreviewManager.value
      })
      return true
      
    } catch (error) {
      console.error('[useStructuredLayout] 初始化失败:', error)
      connectionPreviewManager.value = null
      return false
    }
  }

  /**
   * 居中并适应画布内容
   */
  const centerAndFitCanvas = async () => {
    const graph = getGraph()
    if (!graph) return

    try {
      console.log('[useStructuredLayout] 开始居中并适应画布内容')
      
      // 先居中内容
      graph.centerContent()
      
      // 然后适应缩放，限制最大缩放比例
      const currentScale = graph.zoom()
      graph.zoomToFit({ 
        padding: 50,
        maxScale: Math.min(1.2, currentScale * 1.5) // 限制最大缩放比例
      })
      
      console.log('[useStructuredLayout] 画布居中和适应完成')
    } catch (error) {
      console.warn('[useStructuredLayout] 画布居中和适应失败:', error)
    }
  }

  /**
   * 更新布局统计信息
   * @param {number} layoutTime - 布局耗时
   */
  const updateLayoutStats = (layoutTime) => {
    layoutStats.value = {
      ...layoutStats.value,
      lastLayoutTime: layoutTime,
      totalLayouts: (layoutStats.value.totalLayouts || 0) + 1,
      lastLayoutTimestamp: Date.now()
    }
    
    console.log('[useStructuredLayout] 布局统计信息已更新:', layoutStats.value)
  }

  /**
   * 应用原生Dagre布局
   * @param {Object} graph - 图实例
   * @returns {Promise<Object>} 布局结果
   */
  const applyNativeDagreLayout = async (graph) => {
    if (!graph) {
      throw new Error('[useStructuredLayout] Graph实例不能为空')
    }

    console.log('[useStructuredLayout] 开始应用原生Dagre布局')
    isLayouting.value = true

    try {
      // 获取所有节点和边
      const nodes = graph.getNodes()
      const edges = graph.getEdges()

      console.log('[useStructuredLayout] 收集图数据:', {
        nodeCount: nodes.length,
        edgeCount: edges.length
      })

      // 统计分支数量（预览线数量）
      let previewLineCount = 0
      let connectionLineCount = 0
      const previewLineIds = new Set() // 用于去重
      const connectionLineIds = new Set() // 用于去重
      
      console.log('[useStructuredLayout] 🔍 开始分析边的类型:')
      edges.forEach(edge => {
        const edgeId = edge.id || edge.getId()
        const edgeData = edge.getData()
        
        // 更严格的预览线识别逻辑
        const isPreviewLine = (
          (edgeData?.type === 'preview' || edgeData?.type === 'preview-line') ||
          (edgeId.includes('unified_preview') && !edgeId.includes('hint_')) ||
          (edgeId.includes('preview') && !edgeId.includes('hint_'))
        )
        
        console.log(`[useStructuredLayout] 边分析: ${edgeId}`, {
          edgeData,
          isPreviewLine,
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId(),
          targetInfo: edge.getTarget(),
          edgeIdPattern: {
            includesUnifiedPreview: edgeId.includes('unified_preview'),
            includesPreview: edgeId.includes('preview'),
            includesHint: edgeId.includes('hint_')
          }
        })
        
        if (isPreviewLine) {
          if (!previewLineIds.has(edgeId)) {
            previewLineIds.add(edgeId)
            previewLineCount++
            console.log(`[useStructuredLayout] ✅ 确认预览线: ${edgeId} (总数: ${previewLineCount})`)
          } else {
            console.log(`[useStructuredLayout] ⚠️ 重复预览线: ${edgeId}`)
          }
        } else {
          if (!connectionLineIds.has(edgeId)) {
            connectionLineIds.add(edgeId)
            connectionLineCount++
            console.log(`[useStructuredLayout] ✅ 确认连接线: ${edgeId} (总数: ${connectionLineCount})`)
          } else {
            console.log(`[useStructuredLayout] ⚠️ 重复连接线: ${edgeId}`)
          }
        }
      })
      
      console.log('[useStructuredLayout] 边类型统计:', {
        总边数: edges.length,
        预览线数: previewLineCount,
        连接线数: connectionLineCount,
        预览线列表: Array.from(previewLineIds),
        连接线列表: Array.from(connectionLineIds)
      })

      // 记录布局前的节点位置
      const beforePositions = {}
      nodes.forEach(node => {
        const nodeId = node.id || node.getId()
        const position = node.getPosition()
        const size = node.getSize()
        beforePositions[nodeId] = {
          position: { ...position },
          size: { ...size },
          center: {
            x: position.x + size.width / 2,
            y: position.y + size.height / 2
          }
        }
      })

      // 创建 @antv/graphlib 的 Graph 对象
      const layoutGraph = new Graph({
        nodes: nodes.map(node => {
          const size = node.getSize()
          const nodeId = node.id || node.getId()
          return {
            id: nodeId,
            data: {
              x: node.getPosition().x,
              y: node.getPosition().y,
              width: size.width,
              height: size.height,
              ...node.getData()
            }
          }
        }),
        edges: edges.map(edge => {
          const edgeId = edge.id || edge.getId()
          let sourceId = edge.getSourceCellId() || edge.getSource()?.cell || edge.getSourceCell()?.id
          let targetId = edge.getTargetCellId() || edge.getTarget()?.cell || edge.getTargetCell()?.id
          
          // 检查是否是预览线 - 使用统一的严格识别逻辑
          const edgeData = edge.getData()
          const isPreviewLine = (
            (edgeData?.type === 'preview' || edgeData?.type === 'preview-line') ||
            (edgeId.includes('unified_preview') && !edgeId.includes('hint_')) ||
            (edgeId.includes('preview') && !edgeId.includes('hint_'))
          )
          
          // 如果是预览线且targetId为undefined，尝试查找对应的拖拽点
          if (isPreviewLine && !targetId) {
            // 查找对应的拖拽点（hint node）
            const hintNodeId = `hint_${edgeId}`
            const hintNode = graph.getCellById(hintNodeId)
            if (hintNode) {
              targetId = hintNodeId
            }
            // 注意：移除了虚拟节点的创建逻辑，因为拖拽点现在已注册为真实节点
          }
          
          // 如果仍然无法获取到source或target，跳过这条边
          if (!sourceId || !targetId) {
            return null
          }
          
          return {
            id: edgeId,
            source: sourceId,
            target: targetId,
            data: edge.getData()
          }
        }).filter(Boolean) // 过滤掉null值
      })

      // 创建DagreLayout实例
      const dagreLayout = new DagreLayout({
        type: 'dagre',
        rankdir: 'TB', // 从上到下
        align: undefined, // 不设置对齐，让Dagre自动居中对齐
        nodesep: 200, // 节点间距
        ranksep: 100, // 层级间距
        controlPoints: true // 启用控制点
      })

      console.log('[useStructuredLayout] 🎯 Dagre布局配置:', {
        rankdir: 'TB',
        align: 'undefined (自动居中)',
        nodesep: 200,
        ranksep: 100,
        controlPoints: true,
        说明: '移除UL对齐，使用默认居中对齐确保X坐标一致'
      })

      console.log('[useStructuredLayout] 开始Dagre布局计算')
      const startTime = performance.now()

      // 执行布局计算
      const layoutResult = await dagreLayout.execute(layoutGraph)
      
      const endTime = performance.now()
      const layoutTime = endTime - startTime

      console.log('[useStructuredLayout] Dagre布局计算完成:', {
        layoutTime: `${layoutTime.toFixed(2)}ms`,
        resultNodes: layoutResult?.nodes?.length || 0,
        resultEdges: layoutResult?.edges?.length || 0
      })

      // 检查布局结果
      if (!layoutResult || !layoutResult.nodes) {
        throw new Error('布局计算失败，未返回有效结果')
      }

      // 记录布局后的节点位置变化
      const afterPositions = {}
      const positionChanges = []

      // 应用节点位置
      layoutResult.nodes.forEach(nodeData => {
        const node = graph.getCellById(nodeData.id)
        if (node && nodeData.data) {
          // DagreLayout返回的是中心点坐标，需要转换为左上角坐标
          const size = node.getSize()
          const oldPosition = node.getPosition()
          const newCenterPoint = { x: nodeData.data.x, y: nodeData.data.y }
          const newPosition = {
            x: nodeData.data.x - size.width / 2,
            y: nodeData.data.y - size.height / 2
          }
          
          // 计算位置变化
          const positionDelta = {
            x: newPosition.x - oldPosition.x,
            y: newPosition.y - oldPosition.y
          }
          const distance = Math.sqrt(positionDelta.x ** 2 + positionDelta.y ** 2)
          
          node.setPosition(newPosition)
          
          // 判断节点类型
          const nodeType = nodeData.data.type || 'normal'
          const isHintNode = nodeData.id.startsWith('hint_')
          
          // 记录详细的位置更新信息
          const updateInfo = {
            nodeId: nodeData.id,
            nodeType,
            isHintNode,
            oldPosition: { ...oldPosition },
            newCenterPoint,
            newPosition: { ...newPosition },
            positionDelta,
            distance: distance.toFixed(2),
            size: { ...size }
          }
          
          afterPositions[nodeData.id] = {
            position: { ...newPosition },
            center: { ...newCenterPoint },
            size: { ...size },
            type: nodeType
          }
          
          positionChanges.push(updateInfo)
        }
        // 注意：移除了虚拟节点的位置处理逻辑，因为现在不再需要虚拟节点
      })

      // 🎯 拖拽点层级调整：确保拖拽点位于源节点的下一层（与现有节点合并）
      console.log('[useStructuredLayout] 开始拖拽点层级调整')
      
      const dragPointAdjustments = []
      
      // 🔧 修复坐标系统：使用中心点坐标进行层级分组
      const allLayers = {}
      positionChanges.forEach(change => {
        if (!change.isHintNode) { // 只考虑非拖拽点节点
          const y = change.newCenterPoint.y  // 使用中心点Y坐标
          if (!allLayers[y]) {
            allLayers[y] = []
          }
          allLayers[y].push(change)
        }
      })
      
      // 按Y坐标排序所有层级
      const dragPointSortedLayers = Object.keys(allLayers).sort((a, b) => parseFloat(a) - parseFloat(b))
      
      console.log('[useStructuredLayout] 拖拽点层级调整 - 层级分析:', {
        所有层级: dragPointSortedLayers.map(y => parseFloat(y)),
        层级详情: dragPointSortedLayers.map(y => ({
          Y坐标: parseFloat(y),
          节点: allLayers[y].map(c => c.nodeId)
        }))
      })
      
      // 为每个拖拽点找到其源节点所在层级，并将其放置在下一层
      const hintNodes = positionChanges.filter(c => c.isHintNode)
      console.log('[useStructuredLayout] 发现拖拽点:', hintNodes.map(c => ({
        id: c.nodeId,
        currentY: c.newCenterPoint.y,  // 使用中心点Y坐标
        currentX: c.newCenterPoint.x   // 使用中心点X坐标
      })))
      
      positionChanges.forEach(change => {
        if (change.isHintNode) {
          console.log(`[useStructuredLayout] 处理拖拽点: ${change.nodeId}`)
          
          // 获取拖拽点的源节点ID
          const hintNode = graph.getCellById(change.nodeId)
          if (hintNode) {
            const hintData = hintNode.getData()
            const sourceNodeId = hintData?.sourceNodeId
            
            console.log(`[useStructuredLayout] 拖拽点 ${change.nodeId} 数据:`, {
              sourceNodeId,
              hintData: hintData ? Object.keys(hintData) : 'null'
            })
            
            if (sourceNodeId) {
              // 查找源节点的位置信息
              const sourceNodeChange = positionChanges.find(c => c.nodeId === sourceNodeId)
              
              console.log(`[useStructuredLayout] 源节点查找结果:`, {
                sourceNodeId,
                found: !!sourceNodeChange,
                sourceY: sourceNodeChange?.newPosition.y
              })
              
              if (sourceNodeChange) {
                const sourceY = sourceNodeChange.newCenterPoint.y  // 🔧 使用源节点中心点Y坐标
                const currentY = change.newCenterPoint.y           // 🔧 使用拖拽点中心点Y坐标
                
                // 找到源节点所在的层级索引
                const sourceLayerIndex = dragPointSortedLayers.findIndex(y => parseFloat(y) === sourceY)
                
                console.log(`[useStructuredLayout] 层级索引查找:`, {
                  sourceY,
                  sourceLayerIndex,
                  totalLayers: dragPointSortedLayers.length,
                  allLayerYs: dragPointSortedLayers.map(y => parseFloat(y))
                })
                
                if (sourceLayerIndex !== -1) {
                  // 确定拖拽点应该放置的层级（直接使用下一层，与现有节点合并）
                  let targetLayerY
                  
                  if (sourceLayerIndex < dragPointSortedLayers.length - 1) {
                    // 源节点不是最后一层，拖拽点直接放在下一层与现有节点合并
                    targetLayerY = parseFloat(dragPointSortedLayers[sourceLayerIndex + 1])
                    console.log(`[useStructuredLayout] 拖拽点合并到下一层: ${targetLayerY}`)
                  } else {
                    // 如果源节点是最后一层，则在其下方创建新层
                    targetLayerY = sourceY + 100 // 标准层级间距
                    console.log(`[useStructuredLayout] 源节点是最后一层，创建新层: ${targetLayerY}`)
                  }
                  
                  // 计算需要调整的Y坐标差值
                  const yDiff = Math.abs(targetLayerY - currentY)
                  
                  console.log(`[useStructuredLayout] 位置调整计算:`, {
                    currentY,
                    targetLayerY,
                    yDiff,
                    needAdjust: yDiff > 5
                  })
                  
                  // 如果拖拽点与目标层级的Y坐标差值大于5px，调整拖拽点位置
                  if (yDiff > 5) {
                    // 🔧 修复坐标系统一致性问题
                    const size = hintNode.getSize()
                    
                    // 计算新的中心点坐标（与其他节点保持一致）
                    const newCenterPoint = {
                      x: change.newCenterPoint.x, // 🔧 使用拖拽点原始中心点X坐标
                      y: targetLayerY              // Y坐标调整到目标层级
                    }
                    
                    // 计算节点的左上角坐标（用于setPosition）
                    const newNodePosition = {
                      x: newCenterPoint.x - size.width / 2,
                      y: newCenterPoint.y - size.height / 2
                    }
                    
                    console.log(`[useStructuredLayout] 拖拽点坐标调整计算:`, {
                      nodeId: change.nodeId,
                      size,
                      oldCenterPoint: { x: change.newCenterPoint.x, y: change.newCenterPoint.y },
                      newCenterPoint,
                      newNodePosition,
                      coordinateType: '中心点->左上角转换'
                    })
                    
                    // 使用X6的setPosition方法更新节点位置（左上角坐标）
                    hintNode.setPosition(newNodePosition)
                    
                    // 更新记录中的中心点坐标
                    change.newPosition.x = newCenterPoint.x
                    change.newPosition.y = newCenterPoint.y
                    change.newCenterPoint.x = newCenterPoint.x
                    change.newCenterPoint.y = newCenterPoint.y
                    
                    // 更新afterPositions（保持坐标系统一致）
                    if (afterPositions[change.nodeId]) {
                      afterPositions[change.nodeId].position.x = newNodePosition.x
                      afterPositions[change.nodeId].position.y = newNodePosition.y
                      afterPositions[change.nodeId].center.x = newCenterPoint.x
                      afterPositions[change.nodeId].center.y = newCenterPoint.y
                    }
                    
                    dragPointAdjustments.push({
                      dragPointId: change.nodeId,
                      sourceNodeId,
                      sourceLayerY: sourceY,
                      targetLayerY: targetLayerY,
                      originalY: currentY,
                      adjustedY: targetLayerY,
                      yDiff: yDiff.toFixed(1),
                      coordinateInfo: {
                        centerPoint: newCenterPoint,
                        nodePosition: newNodePosition,
                        size
                      }
                    })
                    
                    console.log(`[useStructuredLayout] ✅ 拖拽点 ${change.nodeId} 层级调整: Y ${currentY.toFixed(1)} -> ${targetLayerY.toFixed(1)} (源节点: ${sourceNodeId}, 源层级: ${sourceY.toFixed(1)})`)
                  } else {
                    console.log(`[useStructuredLayout] ✅ 拖拽点 ${change.nodeId} 已位于源节点 ${sourceNodeId} 的下一层 (Y差值: ${yDiff.toFixed(1)}px)`)
                  }
                } else {
                  console.warn(`[useStructuredLayout] ❌ 无法确定源节点 ${sourceNodeId} 的层级索引`)
                }
              } else {
                console.warn(`[useStructuredLayout] ❌ 拖拽点 ${change.nodeId} 的源节点 ${sourceNodeId} 未找到`)
              }
            } else {
              console.warn(`[useStructuredLayout] ❌ 拖拽点 ${change.nodeId} 缺少 sourceNodeId 信息`)
            }
          }
        }
      })
      
      console.log('[useStructuredLayout] 拖拽点层级调整完成:', {
        总拖拽点数: positionChanges.filter(c => c.isHintNode).length,
        调整数量: dragPointAdjustments.length,
        调整详情: dragPointAdjustments
      })

      // 🎯 X坐标层级对齐处理：按层级分组，每层内部居中对齐
      console.log('[useStructuredLayout] 开始X坐标层级对齐处理')
      
      // 按Y坐标分组所有节点
      const layerGroups = {}
      positionChanges.forEach(change => {
        const y = change.newPosition.y
        if (!layerGroups[y]) {
          layerGroups[y] = []
        }
        layerGroups[y].push(change)
      })
      
      console.log('[useStructuredLayout] 层级分组结果:', {
        总层数: Object.keys(layerGroups).length,
        层级详情: Object.keys(layerGroups).map(y => ({
          Y坐标: parseFloat(y),
          节点数: layerGroups[y].length,
          节点类型: layerGroups[y].map(c => ({
            id: c.nodeId,
            type: c.isHintNode ? 'hint' : 'normal',
            x: c.newPosition.x
          }))
        }))
      })
      
      // 计算画布的中心X坐标作为全局对齐基准
      const allXCoords = positionChanges.map(c => c.newPosition.x)
      const minX = Math.min(...allXCoords)
      const maxX = Math.max(...allXCoords)
      const canvasCenterX = (minX + maxX) / 2
      
      console.log('[useStructuredLayout] 画布中心计算:', {
        X坐标范围: `${minX} ~ ${maxX}`,
        画布中心X: canvasCenterX.toFixed(1)
      })
      
      let totalAlignedCount = 0
      
      // 处理每一层
      Object.keys(layerGroups).forEach(yPos => {
        const layer = layerGroups[yPos]
        const y = parseFloat(yPos)
        
        if (layer.length === 1) {
          // 单节点层：直接对齐到画布中心
          const change = layer[0]
          const node = graph.getCellById(change.nodeId)
          if (node) {
            const oldX = change.newPosition.x
            const newX = canvasCenterX
            const deltaX = newX - oldX
            
            if (Math.abs(deltaX) > 1) {
              // 🔧 修复坐标系统一致性问题
              const size = node.getSize()
              
              // 计算新的左上角坐标（用于setPosition）
              const newNodePosition = {
                x: newX - size.width / 2,  // 中心点坐标转换为左上角坐标
                y: node.getPosition().y    // Y坐标保持不变
              }
              
              console.log(`[useStructuredLayout] 单节点层坐标调整计算:`, {
                nodeId: change.nodeId,
                size,
                oldCenterX: oldX,
                newCenterX: newX,
                newNodePosition,
                coordinateType: '中心点->左上角转换'
              })
              
              // 使用X6的setPosition方法更新节点位置（左上角坐标）
              node.setPosition(newNodePosition)
              
              // 更新记录中的中心点坐标
              change.newPosition.x = newX
              if (change.newCenterPoint) {
                change.newCenterPoint.x = newX
              }
              
              // 更新afterPositions（保持坐标系统一致）
              if (afterPositions[change.nodeId]) {
                afterPositions[change.nodeId].position.x = newNodePosition.x
                afterPositions[change.nodeId].center.x = newX
              }
              
              console.log(`[useStructuredLayout] 单节点层 (Y=${y}) ${change.nodeId} 居中对齐: ${oldX.toFixed(1)} -> ${newX.toFixed(1)}`)
              totalAlignedCount++
            }
          }
        } else if (layer.length > 1) {
          // 多节点层：计算层内分布
          const layerXCoords = layer.map(c => c.newPosition.x).sort((a, b) => a - b)
          const layerMinX = layerXCoords[0]
          const layerMaxX = layerXCoords[layerXCoords.length - 1]
          const layerCenterX = (layerMinX + layerMaxX) / 2
          const layerWidth = layerMaxX - layerMinX
          
          // 计算需要的偏移量，使层中心对齐到画布中心
          const centerOffset = canvasCenterX - layerCenterX
          
          console.log(`[useStructuredLayout] 多节点层 (Y=${y}) 分析:`, {
            节点数: layer.length,
            层内X范围: `${layerMinX.toFixed(1)} ~ ${layerMaxX.toFixed(1)}`,
            层内宽度: layerWidth.toFixed(1),
            层中心X: layerCenterX.toFixed(1),
            需要偏移: centerOffset.toFixed(1)
          })
          
          if (Math.abs(centerOffset) > 1) {
            // 整体平移该层的所有节点
            layer.forEach(change => {
              const node = graph.getCellById(change.nodeId)
              if (node) {
                const oldX = change.newPosition.x
                const newX = oldX + centerOffset
                
                // 🔧 修复坐标系统一致性问题
                const size = node.getSize()
                
                // 计算新的左上角坐标（用于setPosition）
                const newNodePosition = {
                  x: newX - size.width / 2,  // 中心点坐标转换为左上角坐标
                  y: node.getPosition().y    // Y坐标保持不变
                }
                
                console.log(`[useStructuredLayout] 多节点层坐标调整计算:`, {
                  nodeId: change.nodeId,
                  size,
                  oldCenterX: oldX,
                  newCenterX: newX,
                  centerOffset,
                  newNodePosition,
                  coordinateType: '中心点->左上角转换'
                })
                
                // 使用X6的setPosition方法更新节点位置（左上角坐标）
                node.setPosition(newNodePosition)
                
                // 更新记录中的中心点坐标
                change.newPosition.x = newX
                if (change.newCenterPoint) {
                  change.newCenterPoint.x = newX
                }
                
                // 更新afterPositions（保持坐标系统一致）
                if (afterPositions[change.nodeId]) {
                  afterPositions[change.nodeId].position.x = newNodePosition.x
                  afterPositions[change.nodeId].center.x = newX
                }
                
                console.log(`[useStructuredLayout] 多节点层 ${change.nodeId} 平移: ${oldX.toFixed(1)} -> ${newX.toFixed(1)}`)
                totalAlignedCount++
              }
            })
          } else {
            console.log(`[useStructuredLayout] 多节点层 (Y=${y}) 已居中，无需调整`)
          }
        }
      })
      
      console.log(`[useStructuredLayout] X坐标层级对齐完成，共调整 ${totalAlignedCount} 个节点`)
      
      console.log('[useStructuredLayout] X坐标层级对齐处理完成')

      // 🔧 分支居中后处理：调整分流节点的子节点位置
      console.log('[useStructuredLayout] 开始分支居中后处理')
      
      // 找到所有分流节点
      const splitNodes = []
      layoutResult.nodes.forEach(nodeData => {
        const nodeType = nodeData.data?.type || nodeData.data?.nodeType
        if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
          splitNodes.push({
            id: nodeData.id,
            type: nodeType,
            position: { x: nodeData.data.x, y: nodeData.data.y }
          })
        }
      })
      
      console.log(`[useStructuredLayout] 找到 ${splitNodes.length} 个分流节点:`, splitNodes)
      
      // 为每个分流节点调整其子节点位置
      splitNodes.forEach(splitNode => {
        // 找到分流节点的所有子节点
        const childNodes = []
        const edges = graph.getEdges()
        
        edges.forEach(edge => {
          const sourceId = edge.getSourceCellId()
          if (sourceId === splitNode.id) {
            const targetId = edge.getTargetCellId()
            const targetNodeData = layoutResult.nodes.find(n => n.id === targetId)
            if (targetNodeData) {
              childNodes.push({
                id: targetId,
                position: { x: targetNodeData.data.x, y: targetNodeData.data.y },
                layoutData: targetNodeData
              })
            }
          }
        })
        
        console.log(`[useStructuredLayout] 分流节点 ${splitNode.id} 的子节点:`, childNodes)
        
        if (childNodes.length > 1) {
          // 计算子节点的居中位置
          const splitX = splitNode.position.x
          const childSpacing = 150 // 子节点间距
          const totalWidth = (childNodes.length - 1) * childSpacing
          const startX = splitX - (totalWidth / 2)
          
          console.log(`[useStructuredLayout] 分流节点 ${splitNode.id} 居中计算:`, {
            splitX,
            childCount: childNodes.length,
            childSpacing,
            totalWidth,
            startX
          })
          
          // 重新排列子节点位置
          childNodes.forEach((childNode, index) => {
            const newX = startX + (index * childSpacing)
            const oldX = childNode.position.x
            
            // 更新布局结果中的位置（中心点坐标）
            childNode.layoutData.data.x = newX
            
            // 更新实际节点位置
            const actualNode = graph.getCellById(childNode.id)
            if (actualNode) {
              // 🔧 修复坐标系统一致性问题
              const size = actualNode.getSize()
              
              // 计算新的左上角坐标（用于setPosition）
              const newNodePosition = {
                x: newX - size.width / 2,   // 中心点坐标转换为左上角坐标
                y: childNode.position.y - size.height / 2  // Y坐标也需要转换
              }
              
              console.log(`[useStructuredLayout] 分支子节点坐标调整计算:`, {
                nodeId: childNode.id,
                size,
                oldCenterX: oldX,
                newCenterX: newX,
                newNodePosition,
                coordinateType: '中心点->左上角转换'
              })
              
              // 使用X6的setPosition方法更新节点位置（左上角坐标）
              actualNode.setPosition(newNodePosition)
              
              console.log(`[useStructuredLayout] 子节点 ${childNode.id} 居中调整: ${oldX.toFixed(1)} -> ${newX.toFixed(1)} (偏移: ${(newX - oldX).toFixed(1)})`)
            }
          })
        }
      })
      
      console.log('[useStructuredLayout] 分支居中后处理完成')

      // 🎯 新增：层级分支对齐处理 - 每个节点的分支与上一层节点居中对齐
      console.log('[useStructuredLayout] 开始层级分支对齐处理')
      
      // 配置参数
      const branchAlignmentConfig = {
        nodeSpacing: 180,           // 同一分支组内节点间距
        minGroupSpacing: 50,        // 不同分支组之间的最小间距
        enableConflictResolution: true,  // 是否启用冲突解决
        alignmentMode: 'center'     // 对齐模式：center
      }
      
      // 第一步：按Y坐标分层
      const layersByYCoord = {}
      positionChanges.forEach(change => {
        const y = Math.round(change.newPosition.y / 10) * 10 // 10px容差分层
        if (!layersByYCoord[y]) {
          layersByYCoord[y] = []
        }
        layersByYCoord[y].push(change)
      })
      
      const alignmentLayers = Object.keys(layersByYCoord)
        .map(y => parseInt(y))
        .sort((a, b) => a - b)
        .map(y => layersByYCoord[y])
      
      console.log(`[useStructuredLayout] 层级分析完成，共 ${alignmentLayers.length} 层:`, 
        alignmentLayers.map((layer, index) => ({
          层级: index,
          Y坐标: layer[0].newPosition.y,
          节点数: layer.length,
          节点列表: layer.map(c => c.nodeId)
        }))
      )
      
      // 第二步：建立父子关系映射
      const parentChildMap = new Map()
      const graphEdges = graph.getEdges()
      
      // 初始化每个节点的子节点列表
      positionChanges.forEach(change => {
        parentChildMap.set(change.nodeId, [])
      })
      
      // 建立父子关系
      graphEdges.forEach(edge => {
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()
        
        // 跳过预览线和拖拽点连接
        if (edge.id && (edge.id.includes('preview') || edge.id.includes('hint'))) {
          return
        }
        
        if (sourceId && targetId && parentChildMap.has(sourceId) && parentChildMap.has(targetId)) {
          parentChildMap.get(sourceId).push(targetId)
        }
      })
      
      console.log('[useStructuredLayout] 父子关系映射完成:', 
        Array.from(parentChildMap.entries())
          .filter(([parent, children]) => children.length > 0)
          .map(([parent, children]) => ({ 父节点: parent, 子节点: children }))
      )
      
      // 第三步：对每一层进行分支对齐处理（从第二层开始）
      for (let layerIndex = 1; layerIndex < alignmentLayers.length; layerIndex++) {
        const currentLayer = alignmentLayers[layerIndex]
        const parentLayer = alignmentLayers[layerIndex - 1]
        
        console.log(`[useStructuredLayout] 处理第 ${layerIndex} 层分支对齐:`, {
          当前层节点数: currentLayer.length,
          父层节点数: parentLayer.length
        })
        
        // 识别当前层的分支组
        const branchGroups = []
        const processedNodes = new Set()
        
        parentLayer.forEach(parentChange => {
          const parentId = parentChange.nodeId
          const childrenIds = parentChildMap.get(parentId) || []
          
          // 找到当前层中属于这个父节点的子节点
          const childrenInCurrentLayer = currentLayer.filter(change => 
            childrenIds.includes(change.nodeId) && !processedNodes.has(change.nodeId)
          )
          
          if (childrenInCurrentLayer.length > 0) {
            branchGroups.push({
              parent: parentChange,
              children: childrenInCurrentLayer
            })
            
            // 标记已处理的节点
            childrenInCurrentLayer.forEach(child => {
              processedNodes.add(child.nodeId)
            })
          }
        })
        
        console.log(`[useStructuredLayout] 第 ${layerIndex} 层分支组识别完成:`, 
          branchGroups.map(group => ({
            父节点: group.parent.nodeId,
            父节点X: group.parent.newPosition.x.toFixed(1),
            子节点数: group.children.length,
            子节点列表: group.children.map(c => `${c.nodeId}(${c.newPosition.x.toFixed(1)})`)
          }))
        )
        
        // 第四步：为每个分支组计算居中对齐位置
        branchGroups.forEach(group => {
          const parentX = group.parent.newPosition.x
          const children = group.children
          
          if (children.length === 1) {
            // 单个子节点直接对齐到父节点
            const child = children[0]
            const oldX = child.newPosition.x
            const newX = parentX
            
            // 更新节点位置
            const node = graph.getCellById(child.nodeId)
            if (node) {
              const size = node.getSize()
              const newNodePosition = {
                x: newX - size.width / 2,
                y: node.getPosition().y
              }
              
              node.setPosition(newNodePosition)
              child.newPosition.x = newX
              
              console.log(`[useStructuredLayout] 单子节点 ${child.nodeId} 对齐到父节点: ${oldX.toFixed(1)} -> ${newX.toFixed(1)}`)
            }
          } else if (children.length > 1) {
            // 多个子节点相对于父节点居中分布
            const totalWidth = (children.length - 1) * branchAlignmentConfig.nodeSpacing
            const startX = parentX - totalWidth / 2
            
            // 按当前X坐标排序，保持相对顺序
            children.sort((a, b) => a.newPosition.x - b.newPosition.x)
            
            children.forEach((child, index) => {
              const oldX = child.newPosition.x
              const newX = startX + index * branchAlignmentConfig.nodeSpacing
              
              // 更新节点位置
              const node = graph.getCellById(child.nodeId)
              if (node) {
                const size = node.getSize()
                const newNodePosition = {
                  x: newX - size.width / 2,
                  y: node.getPosition().y
                }
                
                node.setPosition(newNodePosition)
                child.newPosition.x = newX
                
                console.log(`[useStructuredLayout] 多子节点 ${child.nodeId} 居中对齐: ${oldX.toFixed(1)} -> ${newX.toFixed(1)} (索引${index})`)
              }
            })
            
            console.log(`[useStructuredLayout] 分支组居中完成:`, {
              父节点: group.parent.nodeId,
              父节点X: parentX.toFixed(1),
              子节点数: children.length,
              总宽度: totalWidth.toFixed(1),
              起始X: startX.toFixed(1),
              节点间距: branchAlignmentConfig.nodeSpacing
            })
          }
        })
        
        // 第五步：冲突检测和解决
        if (branchAlignmentConfig.enableConflictResolution && branchGroups.length > 1) {
          console.log(`[useStructuredLayout] 第 ${layerIndex} 层冲突检测开始`)
          
          // 检测分支组之间的重叠
          const overlaps = []
          for (let i = 0; i < branchGroups.length - 1; i++) {
            for (let j = i + 1; j < branchGroups.length; j++) {
              const group1 = branchGroups[i]
              const group2 = branchGroups[j]
              
              // 计算每个分支组的X坐标范围
              const group1XCoords = group1.children.map(c => c.newPosition.x)
              const group2XCoords = group2.children.map(c => c.newPosition.x)
              
              const group1MinX = Math.min(...group1XCoords)
              const group1MaxX = Math.max(...group1XCoords)
              const group2MinX = Math.min(...group2XCoords)
              const group2MaxX = Math.max(...group2XCoords)
              
              // 检查是否重叠（考虑最小间距）
              const minSpacing = branchAlignmentConfig.minGroupSpacing
              const overlap = Math.max(0, Math.min(group1MaxX, group2MaxX) - Math.max(group1MinX, group2MinX) + minSpacing)
              
              if (overlap > 0) {
                overlaps.push({
                  group1Index: i,
                  group2Index: j,
                  overlap: overlap,
                  group1Range: `${group1MinX.toFixed(1)} ~ ${group1MaxX.toFixed(1)}`,
                  group2Range: `${group2MinX.toFixed(1)} ~ ${group2MaxX.toFixed(1)}`
                })
              }
            }
          }
          
          if (overlaps.length > 0) {
            console.log(`[useStructuredLayout] 第 ${layerIndex} 层发现 ${overlaps.length} 个重叠:`, overlaps)
            
            // 简单的冲突解决策略：向两侧扩展
            overlaps.forEach(overlap => {
              const group1 = branchGroups[overlap.group1Index]
              const group2 = branchGroups[overlap.group2Index]
              
              // 计算需要的调整量
              const adjustmentPerGroup = overlap.overlap / 2
              
              // 向左调整group1
              group1.children.forEach(child => {
                const oldX = child.newPosition.x
                const newX = oldX - adjustmentPerGroup
                
                const node = graph.getCellById(child.nodeId)
                if (node) {
                  const size = node.getSize()
                  const newNodePosition = {
                    x: newX - size.width / 2,
                    y: node.getPosition().y
                  }
                  
                  node.setPosition(newNodePosition)
                  child.newPosition.x = newX
                  
                  console.log(`[useStructuredLayout] 冲突解决：${child.nodeId} 左移 ${adjustmentPerGroup.toFixed(1)}px: ${oldX.toFixed(1)} -> ${newX.toFixed(1)}`)
                }
              })
              
              // 向右调整group2
              group2.children.forEach(child => {
                const oldX = child.newPosition.x
                const newX = oldX + adjustmentPerGroup
                
                const node = graph.getCellById(child.nodeId)
                if (node) {
                  const size = node.getSize()
                  const newNodePosition = {
                    x: newX - size.width / 2,
                    y: node.getPosition().y
                  }
                  
                  node.setPosition(newNodePosition)
                  child.newPosition.x = newX
                  
                  console.log(`[useStructuredLayout] 冲突解决：${child.nodeId} 右移 ${adjustmentPerGroup.toFixed(1)}px: ${oldX.toFixed(1)} -> ${newX.toFixed(1)}`)
                }
              })
            })
          } else {
            console.log(`[useStructuredLayout] 第 ${layerIndex} 层无冲突`)
          }
        }
      }
      
      console.log('[useStructuredLayout] 层级分支对齐处理完成')

      // 🎯 完整重绘机制：基于智能布局后的节点位置重新绘制所有连接线和预览线
      console.log('🎨 [useStructuredLayout] 开始基于新节点位置完整重绘连接线和预览线')
      
      // 🔧 高优先级修复：步骤1 - 强制更新所有节点的端口位置
      console.log('🎨 [useStructuredLayout] 步骤1: 强制更新所有节点端口位置')
      const layoutNodes = graph.getNodes()
      layoutNodes.forEach(node => {
        try {
          // 强制更新端口位置，确保端口坐标基于新的节点位置计算
          if (node.updatePorts) {
            node.updatePorts()
          }
          // 强制重新计算端口的绝对位置
          const ports = node.getPorts()
          if (ports && ports.length > 0) {
            ports.forEach(port => {
              // 触发端口位置重新计算
              const currentPos = node.portProp(port.id, 'position')
              node.portProp(port.id, 'position', currentPos)
            })
          }
          console.log(`[useStructuredLayout] 节点 ${node.id} 端口位置已更新`)
        } catch (error) {
          console.warn(`[useStructuredLayout] 节点 ${node.id} 端口更新失败:`, error)
        }
      })
      
      // 🔧 高优先级修复：步骤2 - 完全重置所有连接线
      console.log('🎨 [useStructuredLayout] 步骤2: 开始完全重置连接线')
      
      // 1. 重绘所有连接线（非预览线）
      const allEdges = graph.getEdges()
      const connectionLines = allEdges.filter(edge => {
        const edgeId = edge.id || ''
        return !edgeId.includes('preview') && !edgeId.includes('unified_preview')
      })
      
      console.log(`[useStructuredLayout] 重置 ${connectionLines.length} 条连接线`)
      
      connectionLines.forEach(edge => {
        try {
          const sourceId = edge.getSourceCellId()
          const targetId = edge.getTargetCellId()
          const sourceNode = graph.getCellById(sourceId)
          const targetNode = graph.getCellById(targetId)
          
          if (sourceNode && targetNode) {
            // 🔧 完全重置：清除所有路径相关信息
            edge.setVertices([])
            edge.removeTool() // 移除所有工具（如顶点编辑工具）
            
            // 强制断开并重新连接，确保使用最新的端口位置
            const edgeSourcePort = edge.getSourcePortId() || 'bottom'
            const edgeTargetPort = edge.getTargetPortId() || 'top'
            
            // 临时断开连接
            edge.setSource({ x: 0, y: 0 })
            edge.setTarget({ x: 0, y: 0 })
            
            // 使用边界连接点重新连接，更可靠
            edge.setSource({
              cell: sourceId,
              port: edgeSourcePort,
              connectionPoint: {
                name: 'boundary',
                args: {
                  anchor: 'center'
                }
              }
            })
            
            edge.setTarget({
              cell: targetId,
              port: edgeTargetPort,
              connectionPoint: {
                name: 'boundary',
                args: {
                  anchor: 'center'
                }
              }
            })
            
            // 获取智能布局后的新节点位置
            const sourcePos = sourceNode.getPosition()
            const targetPos = targetNode.getPosition()
            const sourceSize = sourceNode.getSize()
            const targetSize = targetNode.getSize()
            
            const sourceCenterX = sourcePos.x + sourceSize.width / 2
            const targetCenterX = targetPos.x + targetSize.width / 2
            const sourceCenterY = sourcePos.y + sourceSize.height / 2
            const targetCenterY = targetPos.y + targetSize.height / 2
            const xDiff = Math.abs(sourceCenterX - targetCenterX)
            const yDiff = Math.abs(targetCenterY - sourceCenterY)
            
            // 智能路由器选择：基于新位置关系
            if (xDiff < 10 && yDiff > 50) {
              // 垂直对齐且有足够垂直距离，使用直线
              edge.setRouter('normal')
              console.log(`[useStructuredLayout] 连接线 ${edge.id} 使用直线路由器 (垂直对齐, X差值: ${xDiff.toFixed(1)}px, Y差值: ${yDiff.toFixed(1)}px)`)
            } else if (xDiff >= 10) {
              // 水平分布，使用正交路由器确保最短路径
              edge.setRouter({
                name: 'orth',
                args: {
                  padding: 15,
                  step: 10,
                  startDirections: ['bottom'],
                  endDirections: ['top'],
                  fallbackRoute: (vertices, options) => {
                    // 自定义回退路由：简单的L型路径
                    const sourcePoint = vertices[0]
                    const targetPoint = vertices[vertices.length - 1]
                    const midY = sourcePoint.y + (targetPoint.y - sourcePoint.y) / 2
                    return [
                      sourcePoint,
                      { x: sourcePoint.x, y: midY },
                      { x: targetPoint.x, y: midY },
                      targetPoint
                    ]
                  }
                }
              })
              console.log(`[useStructuredLayout] 连接线 ${edge.id} 使用正交路由器 (水平分布, X差值: ${xDiff.toFixed(1)}px)`)
            } else {
              // 其他情况使用默认路由器
              edge.setRouter('normal')
              console.log(`[useStructuredLayout] 连接线 ${edge.id} 使用默认路由器 (X差值: ${xDiff.toFixed(1)}px, Y差值: ${yDiff.toFixed(1)}px)`)
            }
            
            // 强制重新连接：基于新位置重新设置连接点
            const connSourcePort = edge.getSourcePortId() || 'bottom'
            const connTargetPort = edge.getTargetPortId() || 'top'
            
            edge.setSource({
              cell: sourceId,
              port: connSourcePort
            })
            
            edge.setTarget({
              cell: targetId,
              port: connTargetPort
            })
            
            console.log(`[useStructuredLayout] 连接线 ${edge.id} 重绘完成: ${sourceId}:${connSourcePort} -> ${targetId}:${connTargetPort}`)
          }
        } catch (error) {
          console.warn(`[useStructuredLayout] 连接线 ${edge.id} 重绘失败:`, error)
        }
      })
      
      // 2. 延迟重绘预览线，确保连接线重绘完成
      setTimeout(() => {
        console.log('🎨 [useStructuredLayout] 开始重绘预览线')
        
        const previewLines = allEdges.filter(edge => {
          const edgeId = edge.id || ''
          return edgeId.includes('preview') || edgeId.includes('unified_preview')
        })
        
        console.log(`[useStructuredLayout] 重绘 ${previewLines.length} 条预览线`)
        
        previewLines.forEach(edge => {
          try {
            const sourceId = edge.getSourceCellId()
            const targetId = edge.getTargetCellId()
            const sourceNode = graph.getCellById(sourceId)
            const targetNode = graph.getCellById(targetId)
            
            if (sourceNode && targetNode) {
              // 清除旧路径
              edge.setVertices([])
              
              // 获取智能布局后的新节点位置
              const sourcePos = sourceNode.getPosition()
              const targetPos = targetNode.getPosition()
              const sourceSize = sourceNode.getSize()
              const targetSize = targetNode.getSize()
              
              const sourceCenterX = sourcePos.x + sourceSize.width / 2
              const targetCenterX = targetPos.x + targetSize.width / 2
              const xDiff = Math.abs(sourceCenterX - targetCenterX)
              
              // 预览线路由器选择
              if (xDiff < 10) {
                edge.setRouter('normal')
                console.log(`[useStructuredLayout] 预览线 ${edge.id} 使用直线路由器 (X差值: ${xDiff.toFixed(1)}px)`)
              } else {
                edge.setRouter({
                  name: 'orth',
                  args: {
                    padding: 15,
                    step: 10,
                    startDirections: ['bottom'],
                    endDirections: ['top']
                  }
                })
                console.log(`[useStructuredLayout] 预览线 ${edge.id} 使用正交路由器 (X差值: ${xDiff.toFixed(1)}px)`)
              }
              
              // 重新设置连接点
              const previewSourcePort = edge.getSourcePortId() || 'bottom'
              const previewTargetPort = edge.getTargetPortId() || 'top'
              
              edge.setSource({
                cell: sourceId,
                port: previewSourcePort
              })
              
              edge.setTarget({
                cell: targetId,
                port: previewTargetPort
              })
              
              console.log(`[useStructuredLayout] 预览线 ${edge.id} 重绘完成`)
            }
          } catch (error) {
            console.warn(`[useStructuredLayout] 预览线 ${edge.id} 重绘失败:`, error)
          }
        })
        
        console.log('✅ [useStructuredLayout] 预览线重绘完成')
      }, 150) // 延迟确保连接线重绘完成

      // 应用边的路径（如果有控制点）
      if (layoutResult.edges) {
        layoutResult.edges.forEach(edgeData => {
          const edge = graph.getCellById(edgeData.id)
          if (edge && edgeData.data && edgeData.data.controlPoints && edgeData.data.controlPoints.length > 0) {
            // 🔧 修复：使用实际连线端点坐标（拖拽点坐标）而不是普通节点坐标来判断是否应用控制点
            const sourceId = edge.getSourceCellId()
            const targetId = edge.getTargetCellId()
            const sourceNode = graph.getCellById(sourceId)
            const targetNode = graph.getCellById(targetId)
            
            if (sourceNode && targetNode) {
              let sourceCenterX, targetCenterX
              
              // 🎯 检查目标节点是否为拖拽点（hint node）
              const isTargetHintNode = targetNode.id && targetNode.id.includes('hint')
              
              if (isTargetHintNode) {
                // 目标是拖拽点，使用拖拽点的实际坐标
                const sourcePos = sourceNode.getPosition()
                const sourceSize = sourceNode.getSize()
                const targetPos = targetNode.getPosition()
                const targetSize = targetNode.getSize()
                
                // 计算实际连线端点的X坐标
                sourceCenterX = sourcePos.x + sourceSize.width / 2
                targetCenterX = targetPos.x + targetSize.width / 2
                
                console.log(`[useStructuredLayout] 连线 ${edgeData.id} 使用拖拽点坐标判断:`, {
                  sourceNode: `${sourceId}(${sourceCenterX.toFixed(1)})`,
                  targetHintNode: `${targetId}(${targetCenterX.toFixed(1)})`,
                  isTargetHintNode: true
                })
              } else {
                // 目标是普通节点，使用普通节点坐标
                const sourcePos = sourceNode.getPosition()
                const targetPos = targetNode.getPosition()
                const sourceSize = sourceNode.getSize()
                const targetSize = targetNode.getSize()
                
                sourceCenterX = sourcePos.x + sourceSize.width / 2
                targetCenterX = targetPos.x + targetSize.width / 2
                
                console.log(`[useStructuredLayout] 连线 ${edgeData.id} 使用普通节点坐标判断:`, {
                  sourceNode: `${sourceId}(${sourceCenterX.toFixed(1)})`,
                  targetNode: `${targetId}(${targetCenterX.toFixed(1)})`,
                  isTargetHintNode: false
                })
              }
              
              const xDiff = Math.abs(sourceCenterX - targetCenterX)
              
              // 如果X坐标基本相同（差值小于5px），不应用控制点，保持直线
              if (xDiff < 5) {
                console.log(`[useStructuredLayout] 连线 ${edgeData.id} X坐标相同 (差值${xDiff.toFixed(1)}px)，跳过控制点应用，保持直线`)
              } else {
                // X坐标不同，应用控制点
                edge.setVertices(edgeData.data.controlPoints)
                console.log(`[useStructuredLayout] 连线 ${edgeData.id} X坐标不同 (差值${xDiff.toFixed(1)}px)，应用了 ${edgeData.data.controlPoints.length} 个控制点`)
              }
            } else {
              // 无法获取节点信息，默认应用控制点
              edge.setVertices(edgeData.data.controlPoints)
              console.log(`[useStructuredLayout] 连线 ${edgeData.id} 无法获取节点信息，默认应用了 ${edgeData.data.controlPoints.length} 个控制点`)
            }
          }
        })
      }

      // 按节点类型分类统计
      const nodeTypeStats = {
        normal: positionChanges.filter(c => !c.isHintNode),
        hintNodes: positionChanges.filter(c => c.isHintNode)
      }
      
      console.log('[useStructuredLayout] 位置变化统计:', {
        totalNodes: positionChanges.length,
        normalNodes: nodeTypeStats.normal.length,
        hintNodes: nodeTypeStats.hintNodes.length,
        nodeTypeBreakdown: {
          normal: {
            count: nodeTypeStats.normal.length,
            avgDistance: nodeTypeStats.normal.length > 0 ? 
              (nodeTypeStats.normal.reduce((sum, c) => sum + parseFloat(c.distance), 0) / nodeTypeStats.normal.length).toFixed(2) : 0
          },
          hintNodes: {
            count: nodeTypeStats.hintNodes.length,
            avgDistance: nodeTypeStats.hintNodes.length > 0 ? 
              (nodeTypeStats.hintNodes.reduce((sum, c) => sum + parseFloat(c.distance), 0) / nodeTypeStats.hintNodes.length).toFixed(2) : 0
          }
        }
      })

      // 检查布局方向（从上到下）
      if (positionChanges.length >= 2) {
        const sortedByY = [...positionChanges].sort((a, b) => a.newPosition.y - b.newPosition.y)
        console.log('[useStructuredLayout] 布局方向检查（从上到下）:', {
          topNode: { id: sortedByY[0].nodeId, y: sortedByY[0].newPosition.y },
          bottomNode: { id: sortedByY[sortedByY.length - 1].nodeId, y: sortedByY[sortedByY.length - 1].newPosition.y },
          verticalSpread: (sortedByY[sortedByY.length - 1].newPosition.y - sortedByY[0].newPosition.y).toFixed(2),
          isTopToBottom: sortedByY[0].newPosition.y < sortedByY[sortedByY.length - 1].newPosition.y
        })
      }

      // 居中并适应画布
      await nextTick()
      centerAndFitCanvas(graph)

      // 🔧 统一更新预览线终点位置（与普通节点布局同步）
      if (connectionPreviewManager.value) {
        try {
          console.log('[useStructuredLayout] 开始统一更新预览线终点位置')
          
          // 🔧 关键修复：强制清除所有预览线的旧控制点，避免基于旧位置的控制点影响新布局
          const allPreviewLines = connectionPreviewManager.value.getAllPreviewLines ? 
            connectionPreviewManager.value.getAllPreviewLines() : []
          
          console.log(`[useStructuredLayout] 清除 ${allPreviewLines.length} 条预览线的旧控制点`)
          
          allPreviewLines.forEach((previewLine, index) => {
            if (previewLine.id && graph) {
              const actualLine = graph.getCellById(previewLine.id)
              if (actualLine && actualLine.isEdge && actualLine.isEdge()) {
                // 清除旧的控制点（vertices），让路由器基于新的节点位置重新计算路径
                actualLine.setVertices([])
                
                // 🔧 设置最优路由器配置，确保预览线也走最短路径
                try {
                  const sourceId = actualLine.getSourceCellId()
                  const targetId = actualLine.getTargetCellId()
                  const sourceNode = graph.getCellById(sourceId)
                  const targetNode = graph.getCellById(targetId)
                  
                  if (sourceNode && targetNode) {
                    const sourcePos = sourceNode.getPosition()
                    const targetPos = targetNode.getPosition()
                    const sourceSize = sourceNode.getSize()
                    const targetSize = targetNode.getSize()
                    
                    const sourceCenterX = sourcePos.x + sourceSize.width / 2
                    const targetCenterX = targetPos.x + targetSize.width / 2
                    const xDiff = Math.abs(sourceCenterX - targetCenterX)
                    
                    // 根据节点位置关系选择最优路由器
                    if (xDiff < 10) {
                      // X坐标基本相同，使用直线路由器
                      actualLine.setRouter('normal')
                      console.log(`[useStructuredLayout] 预览线 ${previewLine.id} 使用直线路由器 (X差值: ${xDiff.toFixed(1)}px)`)
                    } else {
                      // X坐标不同，使用orth路由器确保最短路径
                      actualLine.setRouter({
                        name: 'orth',
                        args: {
                          padding: 10,
                          step: 10,
                          startDirections: ['bottom'],
                          endDirections: ['top']
                        }
                      })
                      console.log(`[useStructuredLayout] 预览线 ${previewLine.id} 使用orth路由器 (X差值: ${xDiff.toFixed(1)}px)`)
                    }
                  }
                } catch (error) {
                  console.warn(`[useStructuredLayout] 预览线 ${previewLine.id} 路由器设置失败:`, error)
                }
                
                console.log(`[useStructuredLayout] 已清除预览线 ${previewLine.id} 的旧控制点`)
              }
            }
          })
          
          // 1. 先统一重新计算所有预览线的终点位置
          if (typeof connectionPreviewManager.value.recalculateAllPreviewLineEndPositions === 'function') {
            connectionPreviewManager.value.recalculateAllPreviewLineEndPositions()
            console.log('[useStructuredLayout] 预览线终点位置重新计算完成')
          }
          
          // 2. 然后刷新预览线连接（确保预览线正确连接到更新后的拖拽点）
          if (typeof connectionPreviewManager.value.refreshAllPreviewLines === 'function') {
            connectionPreviewManager.value.refreshAllPreviewLines(false, true) // 智能布局后刷新
            console.log('[useStructuredLayout] 预览线刷新完成 - 使用 refreshAllPreviewLines')
          } else if (typeof connectionPreviewManager.value.updateAllPreviewLinePositions === 'function') {
            connectionPreviewManager.value.updateAllPreviewLinePositions()
            console.log('[useStructuredLayout] 预览线刷新完成 - 使用 updateAllPreviewLinePositions')
          } else {
            console.warn('[useStructuredLayout] 预览线管理器没有可用的刷新方法')
          }
          
          // 🔧 额外步骤：强制触发路由器重新计算，确保控制点基于新位置生成
          setTimeout(() => {
            allPreviewLines.forEach((previewLine) => {
              if (previewLine.id && graph) {
                const actualLine = graph.getCellById(previewLine.id)
                if (actualLine && actualLine.isEdge && actualLine.isEdge()) {
                  // 强制触发路由器重新计算
                  const currentRouter = actualLine.getRouter()
                  if (currentRouter) {
                    actualLine.setRouter(currentRouter)
                    console.log(`[useStructuredLayout] 强制重新计算预览线 ${previewLine.id} 的路径`)
                  }
                }
              }
            })
          }, 100) // 短暂延迟确保节点位置已稳定
          
        } catch (error) {
          console.warn('[useStructuredLayout] 预览线刷新失败:', error)
        }
      } else {
        console.warn('[useStructuredLayout] 预览线管理器未初始化，跳过预览线刷新')
      }

      // 🎯 最终重绘验证：确保所有连接线和预览线都基于新节点位置正确绘制
      setTimeout(() => {
        console.log('🔍 [useStructuredLayout] 开始最终重绘验证')
        
        const allEdges = graph.getEdges()
        let verificationResults = {
          totalEdges: allEdges.length,
          connectionLines: 0,
          previewLines: 0,
          correctlyRouted: 0,
          needsAdjustment: 0
        }
        
        allEdges.forEach(edge => {
          try {
            const edgeId = edge.id || ''
            const isPreviewLine = edgeId.includes('preview') || edgeId.includes('unified_preview')
            
            if (isPreviewLine) {
              verificationResults.previewLines++
            } else {
              verificationResults.connectionLines++
            }
            
            const sourceId = edge.getSourceCellId()
            const targetId = edge.getTargetCellId()
            const sourceNode = graph.getCellById(sourceId)
            const targetNode = graph.getCellById(targetId)
            
            if (sourceNode && targetNode) {
              const sourcePos = sourceNode.getPosition()
              const targetPos = targetNode.getPosition()
              const sourceSize = sourceNode.getSize()
              const targetSize = targetNode.getSize()
              
              const sourceCenterX = sourcePos.x + sourceSize.width / 2
              const targetCenterX = targetPos.x + targetSize.width / 2
              const xDiff = Math.abs(sourceCenterX - targetCenterX)
              
              const currentRouter = edge.getRouter()
              const routerName = typeof currentRouter === 'string' ? currentRouter : currentRouter?.name || 'unknown'
              
              // 验证路由器配置是否正确
              const shouldUseNormal = xDiff < 10
              const isUsingNormal = routerName === 'normal'
              const isUsingOrth = routerName === 'orth'
              
              if ((shouldUseNormal && isUsingNormal) || (!shouldUseNormal && isUsingOrth)) {
                verificationResults.correctlyRouted++
                console.log(`✅ [验证] ${isPreviewLine ? '预览线' : '连接线'} ${edgeId} 路由器配置正确: ${routerName} (X差值: ${xDiff.toFixed(1)}px)`)
              } else {
                verificationResults.needsAdjustment++
                console.warn(`⚠️ [验证] ${isPreviewLine ? '预览线' : '连接线'} ${edgeId} 路由器配置需要调整: 当前=${routerName}, 应该=${shouldUseNormal ? 'normal' : 'orth'} (X差值: ${xDiff.toFixed(1)}px)`)
                
                // 自动修正路由器配置
                if (shouldUseNormal) {
                  edge.setRouter('normal')
                } else {
                  edge.setRouter({
                    name: 'orth',
                    args: {
                      padding: 15, // 统一使用15，与连接线保持一致
                      step: 10,
                      startDirections: ['bottom'],
                      endDirections: ['top']
                    }
                  })
                }
                console.log(`🔧 [验证] 已自动修正 ${edgeId} 的路由器配置`)
              }
            }
          } catch (error) {
            console.warn(`[验证] 边 ${edge.id} 验证失败:`, error)
          }
        })
        
        console.log('📊 [useStructuredLayout] 最终重绘验证结果:', verificationResults)
        
        if (verificationResults.needsAdjustment === 0) {
          console.log('✅ [useStructuredLayout] 所有连接线和预览线都已正确配置路由器')
        } else {
          console.log(`🔧 [useStructuredLayout] 已自动修正 ${verificationResults.needsAdjustment} 条线的路由器配置`)
        }
        
        // 强制刷新画布以确保所有更改生效
        if (graph && typeof graph.refresh === 'function') {
          graph.refresh()
          console.log('🔄 [useStructuredLayout] 画布已强制刷新')
        }
        
      }, 300) // 延迟确保所有重绘操作完成

      // 更新布局统计
      updateLayoutStats(layoutTime)

      // 🎯 汇总统计信息
      console.log('🎯 [原生Dagre布局] 汇总统计信息:')
      console.log('📊 布局汇总:', {
        '总节点数': nodes.length,
        '普通节点数': nodeTypeStats.normal.length,
        '拖拽点数': nodeTypeStats.hintNodes.length,
        '总分支数': previewLineCount,
        '连接线数': connectionLineCount,
        '预览线数': previewLineCount,
        '布局耗时': `${layoutTime.toFixed(2)}ms`,
        '布局方向': 'TB (从上到下)',
        '节点间距': '50px',
        '层级间距': '100px'
      })

      // 🎯 按层级显示节点坐标信息
      const layerInfo = {}
      const hintNodeInfo = {}
      
      positionChanges.forEach(change => {
        const y = change.newPosition.y
        const nodeInfo = {
          id: change.nodeId,
          x: change.newPosition.x,
          y: change.newPosition.y,
          type: change.isHintNode ? 'hint' : 'normal'
        }
        
        if (change.isHintNode) {
          // 拖拽点
          if (!hintNodeInfo[y]) {
            hintNodeInfo[y] = []
          }
          hintNodeInfo[y].push(nodeInfo)
        } else {
          // 普通节点
          if (!layerInfo[y]) {
            layerInfo[y] = []
          }
          layerInfo[y].push(nodeInfo)
        }
      })

      // 按Y坐标排序层级
      const sortedLayers = Object.keys(layerInfo).sort((a, b) => parseFloat(a) - parseFloat(b))
      const sortedHintLayers = Object.keys(hintNodeInfo).sort((a, b) => parseFloat(a) - parseFloat(b))
      
      console.log('📍 [原生Dagre布局] 每层节点坐标详情:')
      
      // 显示普通节点
      if (sortedLayers.length > 0) {
        console.log('  🔵 普通节点:')
        sortedLayers.forEach((yPos, index) => {
          const layer = layerInfo[yPos]
          // 按X坐标排序同层节点
          layer.sort((a, b) => a.x - b.x)
          
          // 检查X坐标对齐问题
          const xCoords = layer.map(node => node.x)
          const minX = Math.min(...xCoords)
          const maxX = Math.max(...xCoords)
          const xSpread = maxX - minX
          
          console.log(`    第${index + 1}层 (Y=${yPos}):`, layer.map(node => `${node.id}(${node.x},${node.y})`).join(', '))
          
          if (xSpread > 50) {
            console.warn(`    ⚠️ 第${index + 1}层X坐标分布过宽: ${xSpread}px (${minX} ~ ${maxX})`)
          }
        })
      } else {
        console.log('  🔵 无普通节点')
      }
      
      // 显示拖拽点
      if (sortedHintLayers.length > 0) {
        console.log('  🟡 拖拽点:')
        sortedHintLayers.forEach((yPos, index) => {
          const layer = hintNodeInfo[yPos]
          layer.sort((a, b) => a.x - b.x)
          console.log(`    拖拽点层 (Y=${yPos}):`, layer.map(node => `${node.id}(${node.x},${node.y})`).join(', '))
        })
        
        // 🎯 添加预览线endpoint坐标校验
        console.log('  🔗 预览线Endpoint坐标校验:')
        if (connectionPreviewManager.value) {
          try {
            // 获取所有预览线实例
            const allPreviewLines = connectionPreviewManager.value.getAllPreviewLines ? 
              connectionPreviewManager.value.getAllPreviewLines() : []
            
            console.log(`    🔍 获取到预览线数量: ${allPreviewLines.length}`)
            
            if (allPreviewLines.length > 0) {
              // 收集所有拖拽点信息
              const allHintNodes = []
              sortedHintLayers.forEach(yPos => {
                const layer = hintNodeInfo[yPos]
                allHintNodes.push(...layer)
              })
              
              console.log(`    🔍 收集到拖拽点数量: ${allHintNodes.length}`)
              
              // 🎯 添加控制点坐标信息收集
              const controlPointsInfo = []
              
              console.log('🚀 [版本确认] 使用最新的预览线控制点日志代码 v2.0')
              
              allPreviewLines.forEach((previewLine, index) => {
                console.log(`    🔍 [新版本] 处理预览线 ${index + 1}/${allPreviewLines.length}:`, {
                  id: previewLine.id,
                  hasSourceNode: !!previewLine.sourceNode,
                  sourceNodeId: previewLine.sourceNode?.id,
                  branchId: previewLine.branchId,
                  type: previewLine.type,
                  isActive: previewLine.isActive
                })
                
                // 🔧 修正：从UnifiedPreviewLineManager获取实际的线条对象
                let actualLine = null
                if (previewLine.id && graph) {
                  actualLine = graph.getCellById(previewLine.id)
                }
                
                console.log(`    🔍 预览线 ${previewLine.id} 线条对象:`, {
                  hasActualLine: !!actualLine,
                  lineType: actualLine?.shape,
                  isEdge: actualLine?.isEdge?.()
                })
                
                if (actualLine && previewLine.sourceNode) {
                  // 🔧 使用多种方法获取预览线的实际坐标
                  let targetPoint = null
                  let sourcePoint = null
                  
                  // 方法1: 使用getTargetPoint和getSourcePoint
                  try {
                    targetPoint = actualLine.getTargetPoint ? actualLine.getTargetPoint() : null
                    sourcePoint = actualLine.getSourcePoint ? actualLine.getSourcePoint() : null
                  } catch (error) {
                    console.warn(`    方法1失败:`, error)
                  }
                  
                  // 方法2: 如果方法1失败，尝试从target和source属性获取
                  if (!targetPoint || !sourcePoint) {
                    try {
                      const target = actualLine.getTarget()
                      const source = actualLine.getSource()
                      
                      if (target && typeof target.x === 'number' && typeof target.y === 'number') {
                        targetPoint = { x: target.x, y: target.y }
                      }
                      
                      if (source && source.cell) {
                        const sourceNode = graph.getCellById(source.cell)
                        if (sourceNode) {
                          const nodePos = sourceNode.getPosition()
                          const nodeSize = sourceNode.getSize()
                          sourcePoint = {
                            x: nodePos.x + nodeSize.width / 2,
                            y: nodePos.y + nodeSize.height
                          }
                        }
                      }
                      console.log(`    方法2获取坐标:`, { sourcePoint, targetPoint })
                    } catch (error) {
                      console.warn(`    方法2失败:`, error)
                    }
                  }
                  
                  // 方法3: 如果仍然失败，尝试从预览线的position属性获取
                  if (!targetPoint || !sourcePoint) {
                    if (previewLine.position) {
                      sourcePoint = previewLine.position.start
                      targetPoint = previewLine.position.end
                      console.log(`    方法3从position获取坐标:`, { sourcePoint, targetPoint })
                    }
                  }
                  
                  const sourceNodeId = previewLine.sourceNode.id
                  const branchId = previewLine.branchId || 'single'
                  
                  console.log(`    🔍 预览线 ${sourceNodeId}_${branchId} 最终坐标:`, {
                    sourcePoint: sourcePoint ? `(${Math.round(sourcePoint.x)},${Math.round(sourcePoint.y)})` : 'null',
                    targetPoint: targetPoint ? `(${Math.round(targetPoint.x)},${Math.round(targetPoint.y)})` : 'null',
                    获取方法: targetPoint && sourcePoint ? '成功获取' : '获取失败'
                  })
                  
                  // 🔧 增强拖拽点查找逻辑
                  console.log(`    🔍 预览线 ${sourceNodeId}_${branchId} 开始查找拖拽点:`, {
                    sourceNodeId,
                    branchId,
                    previewLineId: previewLine.id,
                    totalHintNodes: allHintNodes.length,
                    allHintIds: allHintNodes.map(h => h.id)
                  })
                  
                  // 尝试多种匹配策略
                  let correspondingHint = null
                  
                  // 策略1: 精确匹配预览线ID
                  correspondingHint = allHintNodes.find(hint => 
                    hint.id.includes(previewLine.id.replace('unified_preview_', 'hint_'))
                  )
                  
                  if (!correspondingHint) {
                    // 策略2: 通过源节点ID和分支ID匹配
                    correspondingHint = allHintNodes.find(hint => 
                      hint.id.includes(sourceNodeId) && 
                      (branchId === 'single' || branchId === 'default_audience' || hint.id.includes(branchId))
                    )
                  }
                  
                  if (!correspondingHint) {
                    // 策略3: 仅通过源节点ID匹配（适用于单分支情况）
                    const hintsBySourceNode = allHintNodes.filter(hint => hint.id.includes(sourceNodeId))
                    if (hintsBySourceNode.length === 1) {
                      correspondingHint = hintsBySourceNode[0]
                      console.log(`    🎯 通过源节点ID找到唯一拖拽点: ${correspondingHint.id}`)
                    } else if (hintsBySourceNode.length > 1) {
                      console.log(`    ⚠️ 找到多个拖拽点，需要更精确的匹配:`, hintsBySourceNode.map(h => h.id))
                    }
                  }
                  
                  if (!correspondingHint) {
                    // 策略4: 通过坐标距离匹配（最近的拖拽点）
                    if (targetPoint) {
                      const distances = allHintNodes.map(hint => ({
                        hint,
                        distance: Math.sqrt(
                          Math.pow(hint.x - targetPoint.x, 2) + 
                          Math.pow(hint.y - targetPoint.y, 2)
                        )
                      }))
                      
                      distances.sort((a, b) => a.distance - b.distance)
                      
                      if (distances.length > 0 && distances[0].distance < 100) {
                        correspondingHint = distances[0].hint
                        console.log(`    🎯 通过坐标距离找到最近拖拽点: ${correspondingHint.id} (距离: ${distances[0].distance.toFixed(1)}px)`)
                      }
                    }
                  }
                  
                  console.log(`    🔍 预览线 ${sourceNodeId}_${branchId} 查找拖拽点结果:`, {
                    sourceNodeId,
                    branchId,
                    previewLineId: previewLine.id,
                    foundHint: !!correspondingHint,
                    hintId: correspondingHint?.id,
                    hintPosition: correspondingHint ? `(${correspondingHint.x},${correspondingHint.y})` : 'null',
                    targetPoint: targetPoint ? `(${targetPoint.x},${targetPoint.y})` : 'null'
                  })
                  
                  // 🔧 获取预览线的控制点信息
                  let controlPoints = []
                  try {
                    // 尝试获取预览线的路径顶点（控制点）
                    const vertices = actualLine.getVertices ? actualLine.getVertices() : []
                    controlPoints = vertices.map((vertex, vIndex) => ({
                      index: vIndex,
                      x: vertex.x,
                      y: vertex.y
                    }))
                    console.log(`    🔍 预览线 ${sourceNodeId}_${branchId} 控制点:`, controlPoints)
                  } catch (error) {
                    console.warn(`    预览线 ${sourceNodeId}_${branchId} 控制点获取失败:`, error)
                  }
                  
                  // 🔧 获取对应连线的控制点信息（如果存在）
                  let connectionControlPoints = []
                  try {
                    // 查找对应的连线
                    const allEdges = graph.getEdges()
                    const correspondingEdge = allEdges.find(edge => {
                      const sourceId = edge.getSourceCellId()
                      const targetId = edge.getTargetCellId()
                      return sourceId === sourceNodeId && targetId === correspondingHint?.id
                    })
                    
                    console.log(`    🔍 预览线 ${sourceNodeId}_${branchId} 查找连线:`, {
                      totalEdges: allEdges.length,
                      foundEdge: !!correspondingEdge,
                      edgeId: correspondingEdge?.id
                    })
                    
                    if (correspondingEdge) {
                      const edgeVertices = correspondingEdge.getVertices ? correspondingEdge.getVertices() : []
                      connectionControlPoints = edgeVertices.map((vertex, vIndex) => ({
                        index: vIndex,
                        x: vertex.x,
                        y: vertex.y
                      }))
                      console.log(`    🔍 连线 ${correspondingEdge.id} 控制点:`, connectionControlPoints)
                    }
                  } catch (error) {
                    console.warn(`    连线控制点获取失败:`, error)
                  }
                  
                  // 存储控制点信息
                  controlPointsInfo.push({
                    previewLineId: `${sourceNodeId}_${branchId}`,
                    previewControlPoints: controlPoints,
                    connectionControlPoints: connectionControlPoints,
                    controlPointsMatch: JSON.stringify(controlPoints) === JSON.stringify(connectionControlPoints)
                  })
                  
                  console.log(`    预览线 ${sourceNodeId}_${branchId}:`, {
                    'sourcePoint': sourcePoint ? `(${sourcePoint.x},${sourcePoint.y})` : 'null',
                    'targetPoint': targetPoint ? `(${targetPoint.x},${targetPoint.y})` : 'null',
                    'correspondingHint': correspondingHint ? `${correspondingHint.id}(${correspondingHint.x},${correspondingHint.y})` : 'not found',
                    'coordinate_match': targetPoint && correspondingHint ? 
                      (Math.abs(targetPoint.x - correspondingHint.x) < 5 && Math.abs(targetPoint.y - correspondingHint.y) < 5) : false,
                    'previewControlPoints': controlPoints.length > 0 ? 
                      controlPoints.map(cp => `(${cp.x},${cp.y})`).join(' -> ') : 'none',
                    'connectionControlPoints': connectionControlPoints.length > 0 ? 
                      connectionControlPoints.map(cp => `(${cp.x},${cp.y})`).join(' -> ') : 'none',
                    'controlPointsMatch': controlPoints.length === connectionControlPoints.length && 
                      JSON.stringify(controlPoints) === JSON.stringify(connectionControlPoints)
                  })
                } else {
                  console.log(`    ⚠️ 预览线 ${index + 1} 缺少必要属性:`, {
                    hasActualLine: !!actualLine,
                    hasSourceNode: !!previewLine.sourceNode,
                    previewLineId: previewLine.id
                  })
                }
              })
              
              console.log(`    🔍 控制点信息收集完成，总数: ${controlPointsInfo.length}`)
              
              // 🎯 汇总控制点信息
              if (controlPointsInfo.length > 0) {
                console.log('  🎮 控制点坐标汇总:')
                const totalPreviewControlPoints = controlPointsInfo.reduce((sum, info) => sum + info.previewControlPoints.length, 0)
                const totalConnectionControlPoints = controlPointsInfo.reduce((sum, info) => sum + info.connectionControlPoints.length, 0)
                const matchingControlPoints = controlPointsInfo.filter(info => info.controlPointsMatch).length
                
                console.log(`    总预览线数: ${controlPointsInfo.length}`)
                console.log(`    预览线控制点总数: ${totalPreviewControlPoints}`)
                console.log(`    连线控制点总数: ${totalConnectionControlPoints}`)
                console.log(`    控制点匹配数: ${matchingControlPoints}/${controlPointsInfo.length}`)
                console.log(`    控制点匹配率: ${controlPointsInfo.length > 0 ? ((matchingControlPoints / controlPointsInfo.length) * 100).toFixed(1) : 0}%`)
                
                // 显示不匹配的控制点详情
                const mismatchedControlPoints = controlPointsInfo.filter(info => !info.controlPointsMatch)
                if (mismatchedControlPoints.length > 0) {
                  console.warn('    ⚠️ 控制点不匹配的预览线:')
                  mismatchedControlPoints.forEach(info => {
                    console.warn(`      ${info.previewLineId}: 预览线${info.previewControlPoints.length}个 vs 连线${info.connectionControlPoints.length}个`)
                  })
                }
              } else {
                console.log('    ⚠️ 没有收集到任何控制点信息')
              }
            } else {
              console.log('    无预览线实例')
            }
          } catch (error) {
            console.warn('    预览线endpoint坐标获取失败:', error)
          }
        } else {
          console.log('    预览线管理器未初始化')
        }
      } else {
        console.log('  🟡 无拖拽点')
      }

      // 检查整体X坐标对齐问题
      const allPositionNodes = [...positionChanges]
      if (allPositionNodes.length > 0) {
        const allXCoords = allPositionNodes.map(change => change.newPosition.x)
        const minX = Math.min(...allXCoords)
        const maxX = Math.max(...allXCoords)
        const xSpread = maxX - minX
        
        console.log('📊 [坐标对齐检查]:', {
          '总节点数': allPositionNodes.length,
          'X坐标范围': `${minX} ~ ${maxX}`,
          'X坐标分布宽度': `${xSpread}px`,
          '是否需要对齐': xSpread > 100 ? '是' : '否',
          '建议': xSpread > 100 ? '检查布局算法的X坐标计算' : '坐标分布正常'
        })
      }

      console.log('[useStructuredLayout] 原生Dagre布局应用完成')

      return {
        type: 'native-dagre',
        layoutTime,
        nodeCount: nodes.length,
        normalNodeCount: nodeTypeStats.normal.length,
        hintNodeCount: nodeTypeStats.hintNodes.length,
        branchCount: previewLineCount,
        connectionLineCount: connectionLineCount,
        previewLineCount: previewLineCount,
        edgeCount: layoutResult.edges ? layoutResult.edges.length : 0,
        success: true
      }

    } catch (error) {
      console.error('[useStructuredLayout] 应用原生Dagre布局失败:', error)
      throw error
    } finally {
      isLayouting.value = false
    }
  }

  return {
    // 布局状态
    isLayouting: computed(() => isLayouting.value),
    layoutOptions: computed(() => layoutOptions.value),
    layoutStats: computed(() => layoutStats.value),
    
    // 布局配置
    layoutConfig: computed(() => layoutConfig.value),
    
    // 布局方法
    initializeLayoutEngine,
    applyNativeDagreLayout,
    
    // 布局选项控制
    updateLayoutOptions: (options) => { 
      layoutOptions.value = { ...layoutOptions.value, ...options } 
    },
    
    // 坐标管理器
    coordinateManager,
    
    // 工具方法
    centerAndFitCanvas,
    updateLayoutStats,
    
    // 调试方法
    getLayoutEngineStatus: () => ({
      coordinateManager: coordinateManager.getStatus(),
      stats: layoutStats.value
    }),
    
    // 管理器实例
    unifiedPreviewManager: computed(() => connectionPreviewManager.value),
    isReady: computed(() => !!connectionPreviewManager.value)
  }
}