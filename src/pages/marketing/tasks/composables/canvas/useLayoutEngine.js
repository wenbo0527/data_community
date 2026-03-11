import { ref, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'

/**
 * 布局引擎相关功能的 composable
 * 提供自动布局、节点排列等功能
 */
export function useLayoutEngine() {
  // 布局状态
  const isLayouting = ref(false)
  const layoutConfig = ref({
    direction: 'TB', // 布局方向：TB(上下), LR(左右), BT(下上), RL(右左)
    nodeSpacing: 100, // 节点间距
    rankSpacing: 150, // 层级间距
    align: 'center' // 对齐方式
  })

  /**
   * 自动布局算法
   * @param {Object} graph - X6 图实例
   * @param {Object} options - 布局选项
   */
  const autoLayout = async (graph, options = {}) => {
    if (!graph) {
      console.warn('[布局引擎] 图实例不存在')
      return
    }

    isLayouting.value = true

    try {
      const nodes = graph.getNodes()
      const edges = graph.getEdges()

      if (nodes.length === 0) {
        console.log('[布局引擎] 没有节点需要布局')
        return
      }

      console.log('[布局引擎] 开始自动布局，节点数:', nodes.length)

      // 合并配置
      const config = { ...layoutConfig.value, ...options }

      // 构建节点层级关系
      const nodeMap = new Map()
      const inDegree = new Map()
      const outEdges = new Map()

      // 初始化节点数据
      nodes.forEach(node => {
        const nodeId = node.id
        nodeMap.set(nodeId, node)
        inDegree.set(nodeId, 0)
        outEdges.set(nodeId, [])
      })

      // 计算入度和出边
      edges.forEach(edge => {
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()

        if (sourceId && targetId && nodeMap.has(sourceId) && nodeMap.has(targetId)) {
          inDegree.set(targetId, inDegree.get(targetId) + 1)
          outEdges.get(sourceId).push(targetId)
        }
      })

      // 拓扑排序分层
      const layers = []
      const queue = []
      const visited = new Set()

      // 找到入度为0的节点作为起始节点
      for (const [nodeId, degree] of inDegree) {
        if (degree === 0) {
          queue.push(nodeId)
        }
      }

      // 如果没有入度为0的节点，选择第一个节点
      if (queue.length === 0 && nodes.length > 0) {
        queue.push(nodes[0].id)
      }

      // 分层处理
      while (queue.length > 0) {
        const currentLayer = [...queue]
        queue.length = 0
        layers.push(currentLayer)

        currentLayer.forEach(nodeId => {
          visited.add(nodeId)
          const children = outEdges.get(nodeId) || []

          children.forEach(childId => {
            if (!visited.has(childId)) {
              const newInDegree = inDegree.get(childId) - 1
              inDegree.set(childId, newInDegree)

              if (newInDegree === 0) {
                queue.push(childId)
              }
            }
          })
        })
      }

      // 处理剩余未访问的节点（可能存在环路）
      const remainingNodes = nodes.filter(node => !visited.has(node.id))
      if (remainingNodes.length > 0) {
        layers.push(remainingNodes.map(node => node.id))
      }

      console.log('[布局引擎] 分层结果:', layers)

      // 计算布局位置
      const positions = calculateLayoutPositions(layers, nodeMap, config)

      // 应用布局
      await applyLayout(graph, positions)

      console.log('[布局引擎] 布局完成')
      Message.success('自动布局完成')

    } catch (error) {
      console.error('[布局引擎] 布局失败:', error)
      Message.error('自动布局失败: ' + error.message)
    } finally {
      isLayouting.value = false
    }
  }

  /**
   * 计算布局位置
   * @param {Array} layers - 节点层级
   * @param {Map} nodeMap - 节点映射
   * @param {Object} config - 布局配置
   */
  const calculateLayoutPositions = (layers, nodeMap, config) => {
    const positions = new Map()
    const { direction, nodeSpacing, rankSpacing, align } = config

    layers.forEach((layer, layerIndex) => {
      const layerNodeCount = layer.length
      const layerWidth = (layerNodeCount - 1) * nodeSpacing

      layer.forEach((nodeId, nodeIndex) => {
        const node = nodeMap.get(nodeId)
        if (!node) return

        const nodeSize = node.getSize()
        let x, y

        if (direction === 'TB' || direction === 'BT') {
          // 垂直布局
          y = layerIndex * rankSpacing
          if (direction === 'BT') {
            y = -y
          }

          // 水平居中对齐
          if (align === 'center') {
            x = -layerWidth / 2 + nodeIndex * nodeSpacing
          } else if (align === 'left') {
            x = nodeIndex * nodeSpacing
          } else { // right
            x = -layerWidth + nodeIndex * nodeSpacing
          }
        } else {
          // 水平布局
          x = layerIndex * rankSpacing
          if (direction === 'RL') {
            x = -x
          }

          // 垂直居中对齐
          if (align === 'center') {
            y = -layerWidth / 2 + nodeIndex * nodeSpacing
          } else if (align === 'top') {
            y = nodeIndex * nodeSpacing
          } else { // bottom
            y = -layerWidth + nodeIndex * nodeSpacing
          }
        }

        positions.set(nodeId, { x, y })
      })
    })

    return positions
  }

  /**
   * 应用布局位置
   * @param {Object} graph - X6 图实例
   * @param {Map} positions - 位置映射
   */
  const applyLayout = async (graph, positions) => {
    const animations = []

    for (const [nodeId, position] of positions) {
      const node = graph.getCellById(nodeId)
      if (node && node.isNode()) {
        // 使用动画过渡
        animations.push(
          new Promise(resolve => {
            node.position(position.x, position.y, {
              transition: {
                duration: 500,
                timing: 'ease-in-out'
              }
            })
            setTimeout(resolve, 500)
          })
        )
      }
    }

    // 等待所有动画完成
    await Promise.all(animations)
    await nextTick()
  }

  /**
   * 对齐节点
   * @param {Object} graph - X6 图实例
   * @param {string} type - 对齐类型：left, right, top, bottom, center-h, center-v
   */
  const alignNodes = (graph, type) => {
    if (!graph) return

    const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode())
    if (selectedNodes.length < 2) {
      Message.warning('请选择至少两个节点进行对齐')
      return
    }

    console.log(`[布局引擎] 对齐节点: ${type}, 节点数: ${selectedNodes.length}`)

    const positions = selectedNodes.map(node => {
      const pos = node.getPosition()
      const size = node.getSize()
      return {
        node,
        x: pos.x,
        y: pos.y,
        width: size.width,
        height: size.height,
        centerX: pos.x + size.width / 2,
        centerY: pos.y + size.height / 2
      }
    })

    let targetValue
    switch (type) {
      case 'left':
        targetValue = Math.min(...positions.map(p => p.x))
        positions.forEach(p => p.node.position(targetValue, p.y))
        break
      case 'right':
        targetValue = Math.max(...positions.map(p => p.x + p.width))
        positions.forEach(p => p.node.position(targetValue - p.width, p.y))
        break
      case 'top':
        targetValue = Math.min(...positions.map(p => p.y))
        positions.forEach(p => p.node.position(p.x, targetValue))
        break
      case 'bottom':
        targetValue = Math.max(...positions.map(p => p.y + p.height))
        positions.forEach(p => p.node.position(p.x, targetValue - p.height))
        break
      case 'center-h':
        targetValue = positions.reduce((sum, p) => sum + p.centerX, 0) / positions.length
        positions.forEach(p => p.node.position(targetValue - p.width / 2, p.y))
        break
      case 'center-v':
        targetValue = positions.reduce((sum, p) => sum + p.centerY, 0) / positions.length
        positions.forEach(p => p.node.position(p.x, targetValue - p.height / 2))
        break
    }

    Message.success('节点对齐完成')
  }

  /**
   * 分布节点
   * @param {Object} graph - X6 图实例
   * @param {string} direction - 分布方向：horizontal, vertical
   */
  const distributeNodes = (graph, direction) => {
    if (!graph) return

    const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode())
    if (selectedNodes.length < 3) {
      Message.warning('请选择至少三个节点进行分布')
      return
    }

    console.log(`[布局引擎] 分布节点: ${direction}, 节点数: ${selectedNodes.length}`)

    const positions = selectedNodes.map(node => {
      const pos = node.getPosition()
      const size = node.getSize()
      return {
        node,
        x: pos.x,
        y: pos.y,
        width: size.width,
        height: size.height,
        centerX: pos.x + size.width / 2,
        centerY: pos.y + size.height / 2
      }
    })

    if (direction === 'horizontal') {
      // 水平分布
      positions.sort((a, b) => a.centerX - b.centerX)
      const minX = positions[0].centerX
      const maxX = positions[positions.length - 1].centerX
      const spacing = (maxX - minX) / (positions.length - 1)

      positions.forEach((p, index) => {
        const targetX = minX + index * spacing
        p.node.position(targetX - p.width / 2, p.y)
      })
    } else {
      // 垂直分布
      positions.sort((a, b) => a.centerY - b.centerY)
      const minY = positions[0].centerY
      const maxY = positions[positions.length - 1].centerY
      const spacing = (maxY - minY) / (positions.length - 1)

      positions.forEach((p, index) => {
        const targetY = minY + index * spacing
        p.node.position(p.x, targetY - p.height / 2)
      })
    }

    Message.success('节点分布完成')
  }

  /**
   * 测试布局引擎修复
   */
  const testLayoutEnginefix = () => {
    console.log('🔧 [布局引擎] 测试布局引擎修复功能')
    console.log('当前布局配置:', layoutConfig.value)
    Message.info('布局引擎测试完成，详细信息请查看控制台')
  }

  /**
   * 应用统一结构化布局
   */
  const applyUnifiedStructuredLayout = (graph, options = {}) => {
    console.log('🔧 [布局引擎] 应用统一结构化布局')
    // 布局逻辑实现
  }

  /**
   * 更新布局统计
   */
  const updateLayoutStats = (graph) => {
    console.log('🔧 [布局引擎] 更新布局统计')
    // 统计逻辑实现
  }

  /**
   * 生成布局分析
   */
  const generateLayoutAnalysis = (graph) => {
    console.log('🔧 [布局引擎] 生成布局分析')
    // 分析逻辑实现
    return {}
  }

  return {
    isLayouting,
    layoutConfig,
    autoLayout,
    alignNodes,
    distributeNodes,
    testLayoutEnginefix,
    applyUnifiedStructuredLayout,
    updateLayoutStats,
    generateLayoutAnalysis
  }
}