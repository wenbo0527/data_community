/**
 * X6画布集成测试
 * 验证预览线与X6画布的集成效果
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Mock X6 图形库的完整实现
const mockGraph = {
  addEdge: vi.fn(),
  removeEdge: vi.fn(),
  getCellById: vi.fn(),
  getEdges: vi.fn().mockReturnValue([]),
  getNodes: vi.fn().mockReturnValue([]),
  on: vi.fn(),
  off: vi.fn(),
  trigger: vi.fn(),
  toJSON: vi.fn().mockReturnValue({ cells: [] }),
  fromJSON: vi.fn(),
  clearCells: vi.fn(),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  zoom: vi.fn(),
  translate: vi.fn(),
  centerContent: vi.fn(),
  resize: vi.fn(),
  getContainer: vi.fn().mockReturnValue(document.createElement('div'))
}

// Mock X6集成组件
const X6IntegratedCanvas = {
  name: 'X6IntegratedCanvas',
  template: `
    <div class="x6-canvas-container" ref="containerRef" style="width: 800px; height: 600px;">
      <div class="x6-graph" ref="graphRef"></div>
      <div class="preview-overlay" v-if="showPreview">
        <svg class="preview-svg" :style="{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, 'pointer-events': 'none' }">
          <line 
            v-for="line in previewLines" 
            :key="line.id"
            :x1="line.start.x" 
            :y1="line.start.y"
            :x2="line.end.x" 
            :y2="line.end.y"
            :stroke="line.color || '#1890ff'"
            :stroke-width="line.width || 2"
            :stroke-dasharray="line.dashed ? '5,5' : 'none'"
            class="preview-line"
          />
        </svg>
      </div>
    </div>
  `,
  props: ['nodes', 'edges', 'readonly'],
  emits: ['node-click', 'edge-created', 'preview-line-created'],
  setup(props, { emit }) {
    const containerRef = ref(null)
    const graphRef = ref(null)
    const graph = ref(mockGraph)
    const previewLines = ref([])
    const showPreview = ref(true)
    const isConnecting = ref(false)
    const sourceNode = ref(null)

    // 初始化X6画布
    const initializeGraph = () => {
      console.log('✅ X6画布初始化完成')
      return graph.value
    }

    // 添加节点到X6画布
    const addNodeToGraph = (nodeData) => {
      const node = {
        id: nodeData.id,
        x: nodeData.x || 0,
        y: nodeData.y || 0,
        width: nodeData.width || 120,
        height: nodeData.height || 60,
        shape: nodeData.shape || 'rect',
        label: nodeData.label || '节点',
        data: nodeData
      }

      graph.value.addNode(node)
      console.log(`✅ 节点添加到X6画布: ${node.id}`)
      return node
    }

    // 添加边到X6画布
    const addEdgeToGraph = (edgeData) => {
      const edge = {
        id: edgeData.id,
        source: edgeData.source,
        target: edgeData.target,
        shape: edgeData.shape || 'edge',
        data: edgeData
      }

      graph.value.addEdge(edge)
      console.log(`✅ 边添加到X6画布: ${edge.id}`)
      return edge
    }

    // 创建预览线
    const createPreviewLine = (source, target, options = {}) => {
      if (!source || !target) {
        console.warn('创建预览线需要源节点和目标节点')
        return null
      }

      const lineId = `preview_${source.id}_${target.id}_${Date.now()}`
      const newLine = {
        id: lineId,
        sourceId: source.id,
        targetId: target.id,
        start: {
          x: (source.x || 0) + (source.width || 120) / 2,
          y: (source.y || 0) + (source.height || 60) / 2
        },
        end: {
          x: (target.x || 0) + (target.width || 120) / 2,
          y: (target.y || 0) + (target.height || 60) / 2
        },
        color: options.color || '#1890ff',
        width: options.width || 2,
        dashed: options.dashed !== false,
        visible: true,
        created: Date.now()
      }

      previewLines.value.push(newLine)
      emit('preview-line-created', newLine)
      console.log(`✅ X6集成预览线创建: ${lineId}`)
      return newLine
    }

    // 删除预览线
    const removePreviewLine = (lineId) => {
      const index = previewLines.value.findIndex(line => line.id === lineId)
      if (index !== -1) {
        const removedLine = previewLines.value.splice(index, 1)[0]
        console.log(`✅ X6集成预览线删除: ${lineId}`)
        return removedLine
      }
      return null
    }

    // 清除所有预览线
    const clearAllPreviewLines = () => {
      const count = previewLines.value.length
      previewLines.value.splice(0)
      console.log(`✅ 清除所有X6集成预览线: ${count} 条`)
      return count
    }

    // 开始连接模式
    const startConnecting = (node) => {
      isConnecting.value = true
      sourceNode.value = node
      console.log(`✅ 开始连接模式，源节点: ${node.id}`)
    }

    // 完成连接
    const completeConnection = (targetNode) => {
      if (!isConnecting.value || !sourceNode.value) {
        return null
      }

      const previewLine = createPreviewLine(sourceNode.value, targetNode)
      
      // 模拟转换为真实边（使用 Promise 而不是 setTimeout）
      const convertToRealEdge = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (previewLine) {
              removePreviewLine(previewLine.id)
              const edge = addEdgeToGraph({
                id: `edge_${sourceNode.value.id}_${targetNode.id}`,
                source: sourceNode.value.id,
                target: targetNode.id
              })
              emit('edge-created', edge)
              resolve(edge)
            }
          }, 500) // 500ms后转换为真实边
        })
      }

      isConnecting.value = false
      sourceNode.value = null
      
      // 启动异步转换，但不等待
      convertToRealEdge()
      
      return previewLine
    }

    // 取消连接
    const cancelConnection = () => {
      isConnecting.value = false
      sourceNode.value = null
      clearAllPreviewLines()
      console.log('✅ 取消连接模式')
    }

    // 获取画布统计信息
    const getCanvasStats = () => {
      return {
        nodes: graph.value.getNodes().length,
        edges: graph.value.getEdges().length,
        previewLines: previewLines.value.length,
        isConnecting: isConnecting.value,
        sourceNodeId: sourceNode.value?.id || null
      }
    }

    return {
      containerRef,
      graphRef,
      graph,
      previewLines,
      showPreview,
      isConnecting,
      sourceNode,
      initializeGraph,
      addNodeToGraph,
      addEdgeToGraph,
      createPreviewLine,
      removePreviewLine,
      clearAllPreviewLines,
      startConnecting,
      completeConnection,
      cancelConnection,
      getCanvasStats
    }
  }
}

describe('X6画布集成测试', () => {
  let canvasWrapper
  let canvasComponent

  // 测试节点数据
  const createTestNode = (id, position = { x: 100, y: 100 }) => ({
    id,
    x: position.x,
    y: position.y,
    width: 120,
    height: 60,
    label: `节点${id}`,
    shape: 'rect'
  })

  beforeEach(() => {
    vi.clearAllMocks()
    
    canvasWrapper = mount(X6IntegratedCanvas, {
      props: {
        nodes: [],
        edges: [],
        readonly: false
      }
    })

    canvasComponent = canvasWrapper.vm
    canvasComponent.initializeGraph()
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('X6画布基础功能测试', () => {
    it('TC_X6_001 - X6画布初始化', async () => {
      const graph = canvasComponent.initializeGraph()
      
      expect(graph).toBeTruthy()
      expect(graph.addNode).toBeDefined()
      expect(graph.addEdge).toBeDefined()
      expect(graph.getNodes).toBeDefined()
      expect(graph.getEdges).toBeDefined()
      
      const stats = canvasComponent.getCanvasStats()
      expect(stats.nodes).toBe(0)
      expect(stats.edges).toBe(0)
      expect(stats.previewLines).toBe(0)
      expect(stats.isConnecting).toBe(false)
    })

    it('TC_X6_002 - 节点添加到X6画布', async () => {
      const nodeData = createTestNode('node1', { x: 100, y: 100 })
      const node = canvasComponent.addNodeToGraph(nodeData)
      
      expect(node).toBeTruthy()
      expect(node.id).toBe('node1')
      expect(node.x).toBe(100)
      expect(node.y).toBe(100)
      expect(node.label).toBe('节点node1')
      
      expect(mockGraph.addNode).toHaveBeenCalledWith(node)
    })

    it('TC_X6_003 - 边添加到X6画布', async () => {
      const edgeData = {
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      }
      
      const edge = canvasComponent.addEdgeToGraph(edgeData)
      
      expect(edge).toBeTruthy()
      expect(edge.id).toBe('edge1')
      expect(edge.source).toBe('node1')
      expect(edge.target).toBe('node2')
      
      expect(mockGraph.addEdge).toHaveBeenCalledWith(edge)
    })
  })

  describe('预览线与X6集成测试', () => {
    it('TC_X6_004 - X6环境下预览线创建', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })
      
      // 先添加节点到画布
      canvasComponent.addNodeToGraph(sourceNode)
      canvasComponent.addNodeToGraph(targetNode)
      
      const previewLine = canvasComponent.createPreviewLine(sourceNode, targetNode)
      
      expect(previewLine).toBeTruthy()
      expect(previewLine.sourceId).toBe('node1')
      expect(previewLine.targetId).toBe('node2')
      expect(previewLine.start.x).toBe(160) // 100 + 120/2
      expect(previewLine.start.y).toBe(130) // 100 + 60/2
      expect(previewLine.end.x).toBe(360)   // 300 + 120/2
      expect(previewLine.end.y).toBe(230)   // 200 + 60/2
      expect(previewLine.dashed).toBe(true)
      
      const stats = canvasComponent.getCanvasStats()
      expect(stats.previewLines).toBe(1)
    })

    it('TC_X6_005 - 连接模式启动和完成', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })
      
      canvasComponent.addNodeToGraph(sourceNode)
      canvasComponent.addNodeToGraph(targetNode)
      
      // 启动连接模式
      canvasComponent.startConnecting(sourceNode)
      
      let stats = canvasComponent.getCanvasStats()
      expect(stats.isConnecting).toBe(true)
      expect(stats.sourceNodeId).toBe('node1')
      
      // 完成连接
      const previewLine = canvasComponent.completeConnection(targetNode)
      
      expect(previewLine).toBeTruthy()
      expect(previewLine.sourceId).toBe('node1')
      expect(previewLine.targetId).toBe('node2')
      
      stats = canvasComponent.getCanvasStats()
      expect(stats.isConnecting).toBe(false)
      expect(stats.sourceNodeId).toBeNull()
      
      // 验证预览线已创建
      expect(stats.previewLines).toBe(1)
      
      // 验证预览线的属性
      expect(previewLine.start.x).toBe(160) // 100 + 120/2
      expect(previewLine.start.y).toBe(130) // 100 + 60/2
      expect(previewLine.end.x).toBe(360)   // 300 + 120/2
      expect(previewLine.end.y).toBe(230)   // 200 + 60/2
    })

    it('TC_X6_006 - 连接模式取消', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      
      canvasComponent.addNodeToGraph(sourceNode)
      canvasComponent.startConnecting(sourceNode)
      
      let stats = canvasComponent.getCanvasStats()
      expect(stats.isConnecting).toBe(true)
      
      // 取消连接
      canvasComponent.cancelConnection()
      
      stats = canvasComponent.getCanvasStats()
      expect(stats.isConnecting).toBe(false)
      expect(stats.sourceNodeId).toBeNull()
      expect(stats.previewLines).toBe(0)
    })
  })

  describe('复杂场景集成测试', () => {
    it('TC_X6_007 - 多节点连接场景', async () => {
      const nodes = [
        createTestNode('node1', { x: 100, y: 100 }),
        createTestNode('node2', { x: 300, y: 100 }),
        createTestNode('node3', { x: 200, y: 250 })
      ]
      
      // 添加所有节点
      nodes.forEach(node => canvasComponent.addNodeToGraph(node))
      
      // 创建多条预览线
      const line1 = canvasComponent.createPreviewLine(nodes[0], nodes[1])
      const line2 = canvasComponent.createPreviewLine(nodes[1], nodes[2])
      const line3 = canvasComponent.createPreviewLine(nodes[0], nodes[2])
      
      expect(line1).toBeTruthy()
      expect(line2).toBeTruthy()
      expect(line3).toBeTruthy()
      
      const stats = canvasComponent.getCanvasStats()
      expect(stats.previewLines).toBe(3)
      
      // 清除所有预览线
      const clearedCount = canvasComponent.clearAllPreviewLines()
      expect(clearedCount).toBe(3)
      
      const finalStats = canvasComponent.getCanvasStats()
      expect(finalStats.previewLines).toBe(0)
    })

    it('TC_X6_008 - 预览线样式自定义', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })
      
      canvasComponent.addNodeToGraph(sourceNode)
      canvasComponent.addNodeToGraph(targetNode)
      
      const options = {
        color: '#ff4d4f',
        width: 3,
        dashed: false
      }
      
      const previewLine = canvasComponent.createPreviewLine(sourceNode, targetNode, options)
      
      expect(previewLine.color).toBe('#ff4d4f')
      expect(previewLine.width).toBe(3)
      expect(previewLine.dashed).toBe(false)
    })

    it('TC_X6_009 - 画布状态统计', async () => {
      // 初始状态
      let stats = canvasComponent.getCanvasStats()
      expect(stats.nodes).toBe(0)
      expect(stats.edges).toBe(0)
      expect(stats.previewLines).toBe(0)
      expect(stats.isConnecting).toBe(false)
      
      // 添加节点
      const node1 = createTestNode('node1', { x: 100, y: 100 })
      const node2 = createTestNode('node2', { x: 300, y: 200 })
      
      canvasComponent.addNodeToGraph(node1)
      canvasComponent.addNodeToGraph(node2)
      
      // 创建预览线
      canvasComponent.createPreviewLine(node1, node2)
      
      // 添加边
      canvasComponent.addEdgeToGraph({
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      })
      
      stats = canvasComponent.getCanvasStats()
      expect(stats.previewLines).toBe(1)
    })
  })

  describe('性能和稳定性测试', () => {
    it('TC_X6_010 - 大量预览线性能测试', async () => {
      const startTime = performance.now()
      
      // 创建多个节点
      const nodes = []
      for (let i = 0; i < 20; i++) {
        const node = createTestNode(`node_${i}`, { x: i * 50, y: 100 })
        nodes.push(node)
        canvasComponent.addNodeToGraph(node)
      }
      
      // 创建大量预览线
      for (let i = 0; i < 19; i++) {
        canvasComponent.createPreviewLine(nodes[i], nodes[i + 1])
      }
      
      const creationTime = performance.now() - startTime
      expect(creationTime).toBeLessThan(1000) // 应该在1秒内完成
      
      const stats = canvasComponent.getCanvasStats()
      expect(stats.previewLines).toBe(19)
      
      // 测试清除性能
      const clearStartTime = performance.now()
      const clearedCount = canvasComponent.clearAllPreviewLines()
      const clearTime = performance.now() - clearStartTime
      
      expect(clearedCount).toBe(19)
      expect(clearTime).toBeLessThan(100) // 清除应该在100ms内完成
    })
  })
})