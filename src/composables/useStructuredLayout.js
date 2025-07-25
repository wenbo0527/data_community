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
      
      console.log('✅ [布局系统] 原生Dagre布局系统初始化完成')
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
      // 先居中内容
      graph.centerContent()
      
      // 然后适应缩放，限制最大缩放比例
      const currentScale = graph.zoom()
      graph.zoomToFit({ 
        padding: 50,
        maxScale: Math.min(1.2, currentScale * 1.5) // 限制最大缩放比例
      })
      
      console.log('✅ [画布操作] 画布居中和适应完成')
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

    console.log('🚀 [布局开始] 开始应用原生Dagre布局')
    isLayouting.value = true

    try {
      // 获取所有节点和边
      const nodes = graph.getNodes()
      const edges = graph.getEdges()

      // 统计边类型
      let previewLineCount = 0
      let connectionLineCount = 0
      const previewLineIds = new Set()
      const connectionLineIds = new Set()
      
      edges.forEach(edge => {
        const edgeId = edge.id || edge.getId()
        const edgeData = edge.getData()
        
        // 更严格的预览线识别逻辑
        const isPreviewLine = (
          (edgeData?.type === 'preview' || edgeData?.type === 'preview-line') ||
          (edgeId.includes('unified_preview') && !edgeId.includes('hint_')) ||
          (edgeId.includes('preview') && !edgeId.includes('hint_'))
        )
        
        if (isPreviewLine) {
          if (!previewLineIds.has(edgeId)) {
            previewLineIds.add(edgeId)
            previewLineCount++
          }
        } else {
          if (!connectionLineIds.has(edgeId)) {
            connectionLineIds.add(edgeId)
            connectionLineCount++
          }
        }
      })
      
      console.log('📊 [数据统计]', {
        节点数: nodes.length,
        边数: edges.length,
        预览线数: previewLineCount,
        连接线数: connectionLineCount
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

      console.log('⚙️ [布局配置] Dagre布局参数: TB方向, 节点间距200px, 层级间距100px')

      const startTime = performance.now()

      // 执行布局计算
      const layoutResult = await dagreLayout.execute(layoutGraph)
      
      const endTime = performance.now()
      const layoutTime = endTime - startTime

      console.log('✅ [布局计算] Dagre布局计算完成', {
        耗时: `${layoutTime.toFixed(2)}ms`,
        结果节点数: layoutResult?.nodes?.length || 0,
        结果边数: layoutResult?.edges?.length || 0
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

      // 🎯 统一分层布局：拖拽点和普通节点在Dagre布局阶段已经统一处理
      console.log('🎯 [统一分层] 拖拽点与普通节点已在同一层级系统中')
      
      // 分析最终的层级分布
      const finalLayerAnalysis = {}
      positionChanges.forEach(change => {
        const y = change.newCenterPoint.y
        if (!finalLayerAnalysis[y]) {
          finalLayerAnalysis[y] = {
            normalNodes: [],
            hintNodes: []
          }
        }
        
        if (change.isHintNode) {
          finalLayerAnalysis[y].hintNodes.push(change.nodeId)
        } else {
          finalLayerAnalysis[y].normalNodes.push(change.nodeId)
        }
      })
      
      // 按Y坐标排序层级
      const unifiedSortedLayers = Object.keys(finalLayerAnalysis).sort((a, b) => parseFloat(a) - parseFloat(b))
      
      // 统计混合层级
      const mixedLayers = unifiedSortedLayers.filter(y => {
        const layer = finalLayerAnalysis[y]
        return layer.normalNodes.length > 0 && layer.hintNodes.length > 0
      })
      
      console.log('📊 [分层结果]', {
        总层数: unifiedSortedLayers.length,
        混合层级数: mixedLayers.length,
        统一布局效果: mixedLayers.length > 0 ? '✅ 成功实现拖拽点与普通节点统一分层' : '⚠️ 未发现混合层级'
      })

      // 🎯 X坐标层级对齐处理：按层级分组，每层内部居中对齐
      console.log('🔧 [坐标对齐] 开始X坐标层级对齐处理')
      
      // 按Y坐标分组所有节点
      const layerGroups = {}
      positionChanges.forEach(change => {
        const y = change.newPosition.y
        if (!layerGroups[y]) {
          layerGroups[y] = []
        }
        layerGroups[y].push(change)
      })
      
      // 计算画布的中心X坐标作为全局对齐基准
      const allXCoords = positionChanges.map(c => c.newPosition.x)
      const minX = Math.min(...allXCoords)
      const maxX = Math.max(...allXCoords)
      const canvasCenterX = (minX + maxX) / 2
      
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
                
                totalAlignedCount++
              }
            })
          }
        }
      })
      
      console.log(`✅ [坐标对齐] X坐标层级对齐完成，共调整 ${totalAlignedCount} 个节点`)

      // 🔧 分支居中后处理：调整分流节点的子节点位置
      console.log('🔧 [分支处理] 开始分支居中后处理')
      
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
      
      let totalBranchAdjustments = 0
      
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
        
        if (childNodes.length > 1) {
          // 计算子节点的居中位置
          const splitX = splitNode.position.x
          const childSpacing = 150 // 子节点间距
          const totalWidth = (childNodes.length - 1) * childSpacing
          const startX = splitX - (totalWidth / 2)
          
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
              
              // 使用X6的setPosition方法更新节点位置（左上角坐标）
              actualNode.setPosition(newNodePosition)
              
              totalBranchAdjustments++
            }
          })
        }
      })
      
      console.log(`✅ [分支处理] 分支居中后处理完成，处理 ${splitNodes.length} 个分流节点，调整 ${totalBranchAdjustments} 个子节点`)

      // 🎯 新增：层级分支对齐处理 - 每个节点的分支与上一层节点居中对齐
      console.log('🎯 [层级对齐] 开始层级分支对齐处理')
      
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
      
      let totalAlignmentAdjustments = 0
      let totalBranchGroups = 0
      
      // 第三步：对每一层进行分支对齐处理（从第二层开始）
      for (let layerIndex = 1; layerIndex < alignmentLayers.length; layerIndex++) {
        const currentLayer = alignmentLayers[layerIndex]
        const parentLayer = alignmentLayers[layerIndex - 1]
        
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
        
        totalBranchGroups += branchGroups.length
        
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
              totalAlignmentAdjustments++
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
                totalAlignmentAdjustments++
              }
            })
          }
        })
        
        // 第五步：冲突检测和解决
        if (branchAlignmentConfig.enableConflictResolution && branchGroups.length > 1) {
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
                  totalAlignmentAdjustments++
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
                  totalAlignmentAdjustments++
                }
              })
            })
          }
        }
      }
      
      console.log(`✅ [层级对齐] 层级分支对齐处理完成，处理 ${totalBranchGroups} 个分支组，调整 ${totalAlignmentAdjustments} 个节点`)

      // 🎯 完整重绘机制：基于智能布局后的节点位置重新绘制所有连接线和预览线
      console.log('🎨 [重绘机制] 开始基于新节点位置完整重绘连接线和预览线')
      
      // 🔧 高优先级修复：步骤1 - 强制更新所有节点的端口位置
      const layoutNodes = graph.getNodes()
      let updatedPortsCount = 0
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
            updatedPortsCount++
          }
        } catch (error) {
          console.warn(`[重绘机制] 节点 ${node.id} 端口更新失败:`, error)
        }
      })
      
      // 🔧 高优先级修复：步骤2 - 完全重置所有连接线
      const allEdges = graph.getEdges()
      const connectionLines = allEdges.filter(edge => {
        const edgeId = edge.id || ''
        return !edgeId.includes('preview') && !edgeId.includes('unified_preview')
      })
      
      let connectionLinesRedrawn = 0
      connectionLines.forEach(edge => {
        try {
          const sourceId = edge.getSourceCellId()
          const targetId = edge.getTargetCellId()
          const sourceNode = graph.getCellById(sourceId)
          const targetNode = graph.getCellById(targetId)
          
          if (sourceNode && targetNode) {
            // 完全重置：清除所有路径相关信息
            edge.setVertices([])
            edge.removeTool()
            
            // 强制断开并重新连接，确保使用最新的端口位置
            const edgeSourcePort = edge.getSourcePortId() || 'bottom'
            const edgeTargetPort = edge.getTargetPortId() || 'top'
            
            // 临时断开连接
            edge.setSource({ x: 0, y: 0 })
            edge.setTarget({ x: 0, y: 0 })
            
            // 使用边界连接点重新连接
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
              edge.setRouter('normal')
            } else if (xDiff >= 10) {
              edge.setRouter({
                name: 'orth',
                args: {
                  padding: 15,
                  step: 10,
                  startDirections: ['bottom'],
                  endDirections: ['top']
                  // 🚀 [智能路径] 移除fallbackRoute，完全依赖orth路由器的自动最短路径算法
                }
              })
            } else {
              edge.setRouter('normal')
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
            
            connectionLinesRedrawn++
          }
        } catch (error) {
          console.warn(`[useStructuredLayout] 连接线 ${edge.id} 重绘失败:`, error)
        }
      })
      
      // 2. 延迟重绘预览线，确保连接线重绘完成
      setTimeout(() => {
        const previewLines = allEdges.filter(edge => {
          const edgeId = edge.id || ''
          return edgeId.includes('preview') || edgeId.includes('unified_preview')
        })
        
        let previewLinesRedrawn = 0
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
              
              previewLinesRedrawn++
            }
          } catch (error) {
            console.warn(`[useStructuredLayout] 预览线 ${edge.id} 重绘失败:`, error)
          }
        })
        
        console.log(`✅ [重绘机制] 连接线重绘完成 ${connectionLinesRedrawn} 条，预览线重绘完成 ${previewLinesRedrawn} 条`)
      }, 150) // 延迟确保连接线重绘完成

      // 应用边的路径（如果有控制点）
      let controlPointsApplied = 0
      if (layoutResult.edges) {
        layoutResult.edges.forEach(edgeData => {
          const edge = graph.getCellById(edgeData.id)
          if (edge && edgeData.data && edgeData.data.controlPoints && edgeData.data.controlPoints.length > 0) {
            // 使用实际连线端点坐标（拖拽点坐标）而不是普通节点坐标来判断是否应用控制点
            const sourceId = edge.getSourceCellId()
            const targetId = edge.getTargetCellId()
            const sourceNode = graph.getCellById(sourceId)
            const targetNode = graph.getCellById(targetId)
            
            if (sourceNode && targetNode) {
              let sourceCenterX, targetCenterX
              
              // 检查目标节点是否为拖拽点（hint node）
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
              } else {
                // 目标是普通节点，使用普通节点坐标
                const sourcePos = sourceNode.getPosition()
                const targetPos = targetNode.getPosition()
                const sourceSize = sourceNode.getSize()
                const targetSize = targetNode.getSize()
                
                sourceCenterX = sourcePos.x + sourceSize.width / 2
                targetCenterX = targetPos.x + targetSize.width / 2
              }
              
              const xDiff = Math.abs(sourceCenterX - targetCenterX)
              
              // 🚀 [智能路径优化] 完全依赖路由器自动计算最短路径
              // 移除手动控制点应用，让orth路由器自动生成最优路径
              edge.setVertices([]) // 清空控制点，强制路由器重新计算
              
              // 根据节点位置关系设置最优路由器配置
              if (xDiff < 10) {
                // 节点X坐标接近时使用normal路由器（直线）
                edge.setRouter('normal')
              } else {
                // 节点X坐标差异较大时使用orth路由器（自动最短路径）
                edge.setRouter({
                  name: 'orth',
                  args: {
                    padding: 15,
                    step: 10,
                    startDirections: ['bottom'],
                    endDirections: ['top']
                  }
                })
              }
              controlPointsApplied++
            } else {
              // 无法获取节点信息时，默认清空控制点并使用orth路由器
              edge.setVertices([])
              edge.setRouter({
                name: 'orth',
                args: {
                  padding: 15,
                  step: 10,
                  startDirections: ['bottom'],
                  endDirections: ['top']
                }
              })
              controlPointsApplied++
            }
          }
        })
      }

      // 按节点类型分类统计
      const nodeTypeStats = {
        normal: positionChanges.filter(c => !c.isHintNode),
        hintNodes: positionChanges.filter(c => c.isHintNode)
      }
      
      console.log(`📊 [位置统计] 节点位置更新完成：普通节点 ${nodeTypeStats.normal.length} 个，拖拽点 ${nodeTypeStats.hintNodes.length} 个，控制点应用 ${controlPointsApplied} 条边`)

      // 居中并适应画布
      await nextTick()
      centerAndFitCanvas(graph)

      // 统一更新预览线终点位置（与普通节点布局同步）
      if (connectionPreviewManager.value) {
        try {
          // 关键修复：强制清除所有预览线的旧控制点，避免基于旧位置的控制点影响新布局
          const allPreviewLines = connectionPreviewManager.value.getAllPreviewLines ? 
            connectionPreviewManager.value.getAllPreviewLines() : []
          
          let previewLinesUpdated = 0
          allPreviewLines.forEach((previewLine, index) => {
            if (previewLine.id && graph) {
              const actualLine = graph.getCellById(previewLine.id)
              if (actualLine && actualLine.isEdge && actualLine.isEdge()) {
                // 清除旧的控制点（vertices），让路由器基于新的节点位置重新计算路径
                actualLine.setVertices([])
                
                // 设置最优路由器配置，确保预览线也走最短路径
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
                      actualLine.setRouter('normal')
                    } else {
                      actualLine.setRouter({
                        name: 'orth',
                        args: {
                          padding: 10,
                          step: 10,
                          startDirections: ['bottom'],
                          endDirections: ['top']
                        }
                      })
                    }
                    previewLinesUpdated++
                  }
                } catch (error) {
                  console.warn(`[useStructuredLayout] 预览线 ${previewLine.id} 路由器设置失败:`, error)
                }
              }
            }
          })
          
          // 1. 先统一重新计算所有预览线的终点位置
          if (typeof connectionPreviewManager.value.recalculateAllPreviewLineEndPositions === 'function') {
            connectionPreviewManager.value.recalculateAllPreviewLineEndPositions()
          }
          
          // 2. 然后刷新预览线连接（确保预览线正确连接到更新后的拖拽点）
          if (typeof connectionPreviewManager.value.refreshAllPreviewLines === 'function') {
            connectionPreviewManager.value.refreshAllPreviewLines(false, true) // 智能布局后刷新
          } else if (typeof connectionPreviewManager.value.updateAllPreviewLinePositions === 'function') {
            connectionPreviewManager.value.updateAllPreviewLinePositions()
          }
          
          // 额外步骤：强制触发路由器重新计算，确保控制点基于新位置生成
          setTimeout(() => {
            allPreviewLines.forEach((previewLine) => {
              if (previewLine.id && graph) {
                const actualLine = graph.getCellById(previewLine.id)
                if (actualLine && actualLine.isEdge && actualLine.isEdge()) {
                  // 强制触发路由器重新计算
                  const currentRouter = actualLine.getRouter()
                  if (currentRouter) {
                    actualLine.setRouter(currentRouter)
                  }
                }
              }
            })
          }, 100) // 短暂延迟确保节点位置已稳定
          
          console.log(`🔄 [预览线更新] 预览线终点位置更新完成，共处理 ${previewLinesUpdated} 条预览线`)
          
        } catch (error) {
          console.warn('[useStructuredLayout] 预览线刷新失败:', error)
        }
      }

      // 最终重绘验证：确保所有连接线和预览线都基于新节点位置正确绘制
      setTimeout(() => {
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
              } else {
                verificationResults.needsAdjustment++
                
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
              }
            }
          } catch (error) {
            console.warn(`[验证] 边 ${edge.id} 验证失败:`, error)
          }
        })
        
        // 强制刷新画布以确保所有更改生效
        if (graph && typeof graph.refresh === 'function') {
          graph.refresh()
        }
        
        console.log(`🔍 [重绘验证] 验证完成：连接线 ${verificationResults.connectionLines} 条，预览线 ${verificationResults.previewLines} 条，正确配置 ${verificationResults.correctlyRouted} 条，自动修正 ${verificationResults.needsAdjustment} 条`)
        
      }, 300) // 延迟确保所有重绘操作完成

      // 更新布局统计
      updateLayoutStats(layoutTime)

      // 🎯 汇总统计信息
      console.log('📊 [布局汇总] 原生Dagre布局完成:', {
        '总节点数': nodes.length,
        '普通节点数': nodeTypeStats.normal.length,
        '拖拽点数': nodeTypeStats.hintNodes.length,
        '连接线数': connectionLineCount,
        '预览线数': previewLineCount,
        '布局耗时': `${layoutTime.toFixed(2)}ms`,
        '布局方向': 'TB (从上到下)'
      })

      // 🎯 坐标分析汇总
      const layerInfo = {}
      const hintNodeInfo = {}
      let coordinateIssues = 0
      
      positionChanges.forEach(change => {
        const y = change.newPosition.y
        const nodeInfo = {
          id: change.nodeId,
          x: change.newPosition.x,
          y: change.newPosition.y,
          type: change.isHintNode ? 'hint' : 'normal'
        }
        
        if (change.isHintNode) {
          if (!hintNodeInfo[y]) {
            hintNodeInfo[y] = []
          }
          hintNodeInfo[y].push(nodeInfo)
        } else {
          if (!layerInfo[y]) {
            layerInfo[y] = []
          }
          layerInfo[y].push(nodeInfo)
        }
      })

      // 检查坐标对齐问题
      const sortedLayers = Object.keys(layerInfo).sort((a, b) => parseFloat(a) - parseFloat(b))
      sortedLayers.forEach(yPos => {
        const layer = layerInfo[yPos]
        const xCoords = layer.map(node => node.x)
        const minX = Math.min(...xCoords)
        const maxX = Math.max(...xCoords)
        const xSpread = maxX - minX
        
        if (xSpread > 50) {
          coordinateIssues++
        }
      })

      // 🎯 预览线坐标校验汇总
      let previewLineValidation = {
        totalLines: 0,
        validCoordinates: 0,
        controlPointsMatched: 0,
        coordinateIssues: 0
      }

      if (connectionPreviewManager.value) {
        try {
          const allPreviewLines = connectionPreviewManager.value.getAllPreviewLines ? 
            connectionPreviewManager.value.getAllPreviewLines() : []
          
          previewLineValidation.totalLines = allPreviewLines.length
          
          if (allPreviewLines.length > 0) {
            const allHintNodes = []
            Object.values(hintNodeInfo).forEach(layer => {
              allHintNodes.push(...layer)
            })
            
            const controlPointsInfo = []
            
            allPreviewLines.forEach(previewLine => {
              if (previewLine.id && graph && previewLine.sourceNode) {
                const actualLine = graph.getCellById(previewLine.id)
                
                if (actualLine) {
                  // 获取坐标
                  let targetPoint = null
                  let sourcePoint = null
                  
                  try {
                    targetPoint = actualLine.getTargetPoint ? actualLine.getTargetPoint() : null
                    sourcePoint = actualLine.getSourcePoint ? actualLine.getSourcePoint() : null
                  } catch (error) {
                    // 尝试其他方法获取坐标
                  }
                  
                  if (targetPoint && sourcePoint) {
                    previewLineValidation.validCoordinates++
                  }
                  
                  // 查找对应拖拽点
                  const sourceNodeId = previewLine.sourceNode.id
                  const branchId = previewLine.branchId || 'single'
                  
                  let correspondingHint = allHintNodes.find(hint => 
                    hint.id.includes(sourceNodeId) && 
                    (branchId === 'single' || branchId === 'default_audience' || hint.id.includes(branchId))
                  )
                  
                  if (!correspondingHint && allHintNodes.length > 0) {
                    const hintsBySourceNode = allHintNodes.filter(hint => hint.id.includes(sourceNodeId))
                    if (hintsBySourceNode.length === 1) {
                      correspondingHint = hintsBySourceNode[0]
                    }
                  }
                  
                  // 检查坐标匹配
                  if (targetPoint && correspondingHint) {
                    const coordinateMatch = Math.abs(targetPoint.x - correspondingHint.x) < 5 && 
                                          Math.abs(targetPoint.y - correspondingHint.y) < 5
                    if (!coordinateMatch) {
                      previewLineValidation.coordinateIssues++
                    }
                  }
                  
                  // 获取控制点信息
                  try {
                    const vertices = actualLine.getVertices ? actualLine.getVertices() : []
                    const controlPoints = vertices.map(vertex => ({ x: vertex.x, y: vertex.y }))
                    
                    // 查找对应连线的控制点
                    const allEdges = graph.getEdges()
                    const correspondingEdge = allEdges.find(edge => {
                      const sourceId = edge.getSourceCellId()
                      const targetId = edge.getTargetCellId()
                      return sourceId === sourceNodeId && targetId === correspondingHint?.id
                    })
                    
                    if (correspondingEdge) {
                      const edgeVertices = correspondingEdge.getVertices ? correspondingEdge.getVertices() : []
                      const connectionControlPoints = edgeVertices.map(vertex => ({ x: vertex.x, y: vertex.y }))
                      
                      if (JSON.stringify(controlPoints) === JSON.stringify(connectionControlPoints)) {
                        previewLineValidation.controlPointsMatched++
                      }
                    }
                  } catch (error) {
                    // 控制点获取失败
                  }
                }
              }
            })
          }
        } catch (error) {
          // 预览线校验失败
        }
      }

      // 整体坐标对齐检查
      const allPositionNodes = [...positionChanges]
      let overallCoordinateSpread = 0
      if (allPositionNodes.length > 0) {
        const allXCoords = allPositionNodes.map(change => change.newPosition.x)
        const minX = Math.min(...allXCoords)
        const maxX = Math.max(...allXCoords)
        overallCoordinateSpread = maxX - minX
      }

      console.log('📍 [坐标分析] 节点布局分析完成:', {
        '普通节点层数': sortedLayers.length,
        '拖拽点层数': Object.keys(hintNodeInfo).length,
        '坐标对齐问题': coordinateIssues > 0 ? `${coordinateIssues}层` : '无',
        '整体X坐标分布': `${overallCoordinateSpread}px`,
        '布局质量': overallCoordinateSpread > 100 ? '需要优化' : '良好'
      })

      console.log('🔗 [预览线校验] 预览线坐标校验完成:', {
        '预览线总数': previewLineValidation.totalLines,
        '有效坐标': previewLineValidation.validCoordinates,
        '控制点匹配': previewLineValidation.controlPointsMatched,
        '坐标问题': previewLineValidation.coordinateIssues,
        '校验通过率': previewLineValidation.totalLines > 0 ? 
          `${((previewLineValidation.validCoordinates / previewLineValidation.totalLines) * 100).toFixed(1)}%` : '0%'
      })

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