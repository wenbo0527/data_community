/**
 * 预览线系统集成测试
 * 测试预览线与X6画布的完整集成功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// 创建测试环境
const createTestEnvironment = () => ({
  mockGraph: {
    addNode: vi.fn(),
    addEdge: vi.fn().mockReturnValue({
      id: 'preview-edge-1',
      getData: vi.fn(() => ({ isPreview: true, type: 'preview-line' })),
      setData: vi.fn(),
      remove: vi.fn(),
      attr: vi.fn(),
      setAttrs: vi.fn(),
      getAttrs: vi.fn(() => ({ line: {} })),
      isVisible: vi.fn(() => true),
      getZIndex: vi.fn(() => 1)
    }),
    removeEdge: vi.fn(),
    removeCell: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    getOutgoingEdges: vi.fn(() => []),
    getCellById: vi.fn(),
    hasCell: vi.fn(() => true),
    on: vi.fn(),
    off: vi.fn(),
    trigger: vi.fn(),
    model: {
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => [])
    }
  },
  cleanup: vi.fn()
})

// Mock预览线管理器组件
const PreviewLineManager = {
  name: 'PreviewLineManager',
  template: '<div class="preview-line-manager"></div>',
  props: ['graph', 'enabled'],
  emits: ['preview-created', 'preview-deleted', 'preview-converted'],
  setup(props, { emit }) {
    const previewLines = ref(new Map())
    const isCreating = ref(false)
    const currentLineId = ref(null)
    
    // 创建预览线
    const createPreviewLine = (sourceNode, targetNode, options = {}) => {
      if (!sourceNode || !targetNode) {
        console.warn('[PreviewLineManager] 无效的节点参数')
        return null
      }
      
      const lineId = `preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const previewLine = {
        id: lineId,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        start: sourceNode.position || { x: 0, y: 0 },
        end: targetNode.position || { x: 100, y: 100 },
        branchId: options.branchId || null,
        isPreview: true,
        created: Date.now()
      }
      
      // 添加到预览线列表
      if (!previewLines.value.has(sourceNode.id)) {
        previewLines.value.set(sourceNode.id, [])
      }
      previewLines.value.get(sourceNode.id).push(previewLine)
      
      // 更新状态
      isCreating.value = true
      currentLineId.value = lineId
      
      // 模拟X6边的创建
      if (props.graph && props.graph.addEdge) {
        const edge = props.graph.addEdge({
          id: lineId,
          source: sourceNode.id,
          target: targetNode.id,
          attrs: {
            line: {
              stroke: '#ff6b6b',
              strokeWidth: 2,
              strokeDasharray: '5,5'
            }
          },
          data: {
            isPreview: true,
            type: 'preview-line',
            branchId: options.branchId
          }
        })
        
        previewLine.edge = edge
      }
      
      emit('preview-created', previewLine)
      console.log(`✅ [PreviewLineManager] 预览线创建成功: ${lineId}`)
      
      return previewLine
    }
    
    // 删除预览线
    const removePreviewLine = (lineId) => {
      let deletedLine = null
      
      for (const [nodeId, lines] of previewLines.value.entries()) {
        const index = lines.findIndex(line => line.id === lineId)
        if (index !== -1) {
          deletedLine = lines.splice(index, 1)[0]
          
          // 如果该节点没有更多预览线，清理Map条目
          if (lines.length === 0) {
            previewLines.value.delete(nodeId)
          }
          
          // 从X6图中移除边
          if (deletedLine.edge && props.graph && props.graph.removeCell) {
            props.graph.removeCell(deletedLine.edge)
          }
          
          break
        }
      }
      
      if (deletedLine) {
        // 更新状态
        if (currentLineId.value === lineId) {
          currentLineId.value = null
          isCreating.value = false
        }
        
        emit('preview-deleted', deletedLine)
        console.log(`✅ [PreviewLineManager] 预览线删除成功: ${lineId}`)
      }
      
      return deletedLine
    }
    
    // 转换预览线为连接线
    const convertPreviewToConnection = (lineId) => {
      const deletedLine = removePreviewLine(lineId)
      if (!deletedLine) {
        console.warn(`[PreviewLineManager] 未找到预览线: ${lineId}`)
        return null
      }
      
      // 创建正式连接线
      const connectionId = `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const connection = {
        id: connectionId,
        sourceId: deletedLine.sourceId,
        targetId: deletedLine.targetId,
        branchId: deletedLine.branchId,
        isPreview: false,
        converted: Date.now()
      }
      
      // 在X6图中创建正式连接
      if (props.graph && props.graph.addEdge) {
        const edge = props.graph.addEdge({
          id: connectionId,
          source: deletedLine.sourceId,
          target: deletedLine.targetId,
          attrs: {
            line: {
              stroke: '#4CAF50',
              strokeWidth: 2
            }
          },
          data: {
            isPreview: false,
            type: 'connection',
            branchId: deletedLine.branchId
          }
        })
        
        connection.edge = edge
      }
      
      emit('preview-converted', { preview: deletedLine, connection })
      console.log(`✅ [PreviewLineManager] 预览线转换成功: ${lineId} -> ${connectionId}`)
      
      return connection
    }
    
    // 清除所有预览线
    const clearAllPreviewLines = () => {
      const allLines = []
      for (const lines of previewLines.value.values()) {
        allLines.push(...lines)
      }
      
      allLines.forEach(line => {
        if (line.edge && props.graph && props.graph.removeCell) {
          props.graph.removeCell(line.edge)
        }
      })
      
      previewLines.value.clear()
      isCreating.value = false
      currentLineId.value = null
      
      console.log(`✅ [PreviewLineManager] 清除所有预览线: ${allLines.length}条`)
      return allLines.length
    }
    
    // 获取统计信息
    const getPreviewLineStats = () => {
      let total = 0
      for (const lines of previewLines.value.values()) {
        total += lines.length
      }
      
      return {
        total,
        creating: isCreating.value,
        currentLineId: currentLineId.value,
        nodeCount: previewLines.value.size
      }
    }
    
    return {
      previewLines,
      isCreating,
      currentLineId,
      createPreviewLine,
      removePreviewLine,
      convertPreviewToConnection,
      clearAllPreviewLines,
      getPreviewLineStats
    }
  }
}

// Mock画布组件
const CanvasComponent = {
  name: 'CanvasComponent',
  template: `
    <div class="canvas-component">
      <PreviewLineManager 
        :graph="graph" 
        :enabled="true"
        @preview-created="onPreviewCreated"
        @preview-deleted="onPreviewDeleted"
        @preview-converted="onPreviewConverted"
      />
    </div>
  `,
  components: { PreviewLineManager },
  props: ['graph'],
  emits: ['preview-created', 'preview-deleted', 'preview-converted'],
  setup(props, { emit }) {
    const onPreviewCreated = (preview) => {
      emit('preview-created', preview)
    }
    
    const onPreviewDeleted = (preview) => {
      emit('preview-deleted', preview)
    }
    
    const onPreviewConverted = (data) => {
      emit('preview-converted', data)
    }
    
    return {
      onPreviewCreated,
      onPreviewDeleted,
      onPreviewConverted
    }
  }
}

describe('预览线系统集成测试', () => {
  let testEnv
  let canvasWrapper
  let previewLineComponent

  // 创建测试节点
  const createTestNode = (id, position = { x: 0, y: 0 }) => ({
    id,
    position,
    getData: vi.fn().mockReturnValue({
      type: 'test-node',
      label: `测试节点${id}`,
      isConfigured: true
    }),
    setData: vi.fn()
  })

  beforeEach(async () => {
    testEnv = createTestEnvironment()
    
    canvasWrapper = mount(CanvasComponent, {
      props: {
        graph: testEnv.mockGraph
      }
    })

    previewLineComponent = canvasWrapper.findComponent(PreviewLineManager)
    
    // 清除所有预览线，确保每个测试开始时状态干净
    if (previewLineComponent.vm) {
      previewLineComponent.vm.clearAllPreviewLines()
    }
    
    await nextTick()
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    testEnv?.cleanup()
    vi.clearAllMocks()
  })

  describe('预览线创建与显示测试', () => {
    it('TC_INTEGRATION_001 - 基本预览线创建', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)

      expect(line).toBeTruthy()
      expect(line.sourceId).toBe('node1')
      expect(line.targetId).toBe('node2')
      expect(line.start.x).toBe(100)
      expect(line.start.y).toBe(100)
      expect(line.end.x).toBe(300)
      expect(line.end.y).toBe(200)
      expect(line.isPreview).toBe(true)
      
      // 验证X6图中添加了边
      expect(testEnv.mockGraph.addEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'node1',
          target: 'node2',
          data: expect.objectContaining({
            isPreview: true,
            type: 'preview-line'
          })
        })
      )
      
      // 验证预览线已添加到列表中
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(1)
      expect(stats.creating).toBe(true)
      expect(stats.currentLineId).toBe(line.id)
    })

    it('TC_INTEGRATION_002 - 多条预览线创建', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode1 = createTestNode('node2', { x: 300, y: 200 })
      const targetNode2 = createTestNode('node3', { x: 500, y: 300 })

      const line1 = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode1)
      const line2 = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode2)

      expect(line1).toBeTruthy()
      expect(line2).toBeTruthy()
      expect(line1.id).not.toBe(line2.id)
      
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(2)
      expect(stats.nodeCount).toBe(1) // 两条线都从同一个源节点出发
    })

    it('TC_INTEGRATION_003 - 带分支ID的预览线创建', async () => {
      const sourceNode = createTestNode('branch-node', { x: 100, y: 100 })
      const targetNode = createTestNode('target-node', { x: 300, y: 200 })

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode, {
        branchId: 'branch-1'
      })

      expect(line).toBeTruthy()
      expect(line.branchId).toBe('branch-1')
      
      // 验证X6边包含分支ID
      expect(testEnv.mockGraph.addEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            branchId: 'branch-1'
          })
        })
      )
    })
  })

  describe('预览线删除测试', () => {
    it('TC_INTEGRATION_004 - 预览线删除', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      // 先创建预览线
      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      expect(previewLineComponent.vm.getPreviewLineStats().total).toBe(1)

      // 删除预览线
      const deleted = previewLineComponent.vm.removePreviewLine(line.id)
      await nextTick()

      expect(deleted).toBeTruthy()
      expect(deleted.id).toBe(line.id)
      expect(deleted.sourceId).toBe('node1')
      expect(deleted.targetId).toBe('node2')
      
      // 验证预览线已从列表中移除
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(0)
      expect(stats.creating).toBe(false)
      expect(stats.currentLineId).toBeNull()
      
      // 验证X6图中移除了边
      expect(testEnv.mockGraph.removeCell).toHaveBeenCalledWith(line.edge)
    })

    it('TC_INTEGRATION_005 - 清除所有预览线', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode1 = createTestNode('node2', { x: 300, y: 200 })
      const targetNode2 = createTestNode('node3', { x: 500, y: 300 })

      // 创建多条预览线
      previewLineComponent.vm.createPreviewLine(sourceNode, targetNode1)
      previewLineComponent.vm.createPreviewLine(sourceNode, targetNode2)
      expect(previewLineComponent.vm.getPreviewLineStats().total).toBe(2)

      // 清除所有预览线
      const clearedCount = previewLineComponent.vm.clearAllPreviewLines()
      await nextTick()

      expect(clearedCount).toBe(2)
      
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(0)
      expect(stats.creating).toBe(false)
      expect(stats.currentLineId).toBeNull()
      expect(stats.nodeCount).toBe(0)
    })
  })

  describe('预览线转换测试', () => {
    it('TC_INTEGRATION_006 - 预览线转换为连接线', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      // 创建预览线
      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode, {
        branchId: 'branch-1'
      })
      expect(previewLineComponent.vm.getPreviewLineStats().total).toBe(1)

      // 转换为连接线
      const connection = previewLineComponent.vm.convertPreviewToConnection(line.id)
      await nextTick()

      expect(connection).toBeTruthy()
      expect(connection.sourceId).toBe('node1')
      expect(connection.targetId).toBe('node2')
      expect(connection.branchId).toBe('branch-1')
      expect(connection.isPreview).toBe(false)
      
      // 验证预览线已被删除
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(0)
      
      // 验证创建了正式连接
      expect(testEnv.mockGraph.addEdge).toHaveBeenCalledTimes(2) // 一次预览线，一次连接线
      expect(testEnv.mockGraph.addEdge).toHaveBeenLastCalledWith(
        expect.objectContaining({
          source: 'node1',
          target: 'node2',
          data: expect.objectContaining({
            isPreview: false,
            type: 'connection',
            branchId: 'branch-1'
          })
        })
      )
    })
  })

  describe('事件系统测试', () => {
    it('TC_INTEGRATION_007 - 预览线创建事件', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      let createdPreview = null
      
      // 使用Vue 3的事件监听方式
      const onPreviewCreated = (preview) => {
        createdPreview = preview
      }
      
      // 重新挂载组件并监听事件
      canvasWrapper.unmount()
      canvasWrapper = mount(CanvasComponent, {
        props: {
          graph: testEnv.mockGraph
        },
        attrs: {
          onPreviewCreated
        }
      })
      
      previewLineComponent = canvasWrapper.findComponent(PreviewLineManager)

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      await nextTick()

      expect(createdPreview).toBeTruthy()
      expect(createdPreview.id).toBe(line.id)
      expect(createdPreview.sourceId).toBe('node1')
      expect(createdPreview.targetId).toBe('node2')
    })

    it('TC_INTEGRATION_008 - 预览线删除事件', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      let deletedPreview = null
      
      // 使用Vue 3的事件监听方式
      const onPreviewDeleted = (preview) => {
        deletedPreview = preview
      }
      
      // 重新挂载组件并监听事件
      canvasWrapper.unmount()
      canvasWrapper = mount(CanvasComponent, {
        props: {
          graph: testEnv.mockGraph
        },
        attrs: {
          onPreviewDeleted
        }
      })
      
      previewLineComponent = canvasWrapper.findComponent(PreviewLineManager)

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      previewLineComponent.vm.removePreviewLine(line.id)
      await nextTick()

      expect(deletedPreview).toBeTruthy()
      expect(deletedPreview.id).toBe(line.id)
    })

    it('TC_INTEGRATION_009 - 预览线转换事件', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      let convertedData = null
      
      // 使用Vue 3的事件监听方式
      const onPreviewConverted = (data) => {
        convertedData = data
      }
      
      // 重新挂载组件并监听事件
      canvasWrapper.unmount()
      canvasWrapper = mount(CanvasComponent, {
        props: {
          graph: testEnv.mockGraph
        },
        attrs: {
          onPreviewConverted
        }
      })
      
      previewLineComponent = canvasWrapper.findComponent(PreviewLineManager)

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      previewLineComponent.vm.convertPreviewToConnection(line.id)
      await nextTick()

      expect(convertedData).toBeTruthy()
      expect(convertedData.preview).toBeTruthy()
      expect(convertedData.connection).toBeTruthy()
      expect(convertedData.preview.id).toBe(line.id)
      expect(convertedData.connection.sourceId).toBe('node1')
      expect(convertedData.connection.targetId).toBe('node2')
    })
  })

  describe('错误处理测试', () => {
    it('TC_INTEGRATION_010 - 无效节点参数处理', async () => {
      const result1 = previewLineComponent.vm.createPreviewLine(null, null)
      const result2 = previewLineComponent.vm.createPreviewLine(undefined, {})
      const result3 = previewLineComponent.vm.createPreviewLine({}, null)

      expect(result1).toBeNull()
      expect(result2).toBeNull()
      expect(result3).toBeNull()
      
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(0)
    })

    it('TC_INTEGRATION_011 - 删除不存在的预览线', async () => {
      const result = previewLineComponent.vm.removePreviewLine('non-existent-id')
      
      expect(result).toBeNull()
    })

    it('TC_INTEGRATION_012 - 转换不存在的预览线', async () => {
      const result = previewLineComponent.vm.convertPreviewToConnection('non-existent-id')
      
      expect(result).toBeNull()
    })
  })

  describe('性能测试', () => {
    it('TC_INTEGRATION_013 - 大量预览线性能测试', async () => {
      const startTime = performance.now()
      
      // 创建100条预览线
      const sourceNode = createTestNode('source', { x: 100, y: 100 })
      const lines = []
      
      for (let i = 0; i < 100; i++) {
        const targetNode = createTestNode(`target-${i}`, { x: 300 + i * 10, y: 200 })
        const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
        lines.push(line)
      }
      
      const createTime = performance.now() - startTime
      expect(createTime).toBeLessThan(1000) // 创建100条预览线应在1秒内完成
      
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(100)
      
      // 测试清除性能
      const clearStartTime = performance.now()
      const clearedCount = previewLineComponent.vm.clearAllPreviewLines()
      const clearTime = performance.now() - clearStartTime
      
      expect(clearedCount).toBe(100)
      expect(clearTime).toBeLessThan(500) // 清除100条预览线应在0.5秒内完成
    })
  })
})