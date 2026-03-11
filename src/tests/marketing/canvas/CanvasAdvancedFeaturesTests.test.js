/**
 * 画布高级功能测试
 * 包括保存、发布、加载、节点删除预览线恢复等功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Mock X6 图形库
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
  resize: vi.fn()
}

// Mock 画布高级功能组件
const AdvancedCanvasComponent = {
  name: 'AdvancedCanvasComponent',
  template: `
    <div class="advanced-canvas-container" style="width: 800px; height: 600px;">
      <div class="canvas-toolbar">
        <button @click="saveCanvas" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
        <button @click="publishCanvas" :disabled="isPublishing">
          {{ isPublishing ? '发布中...' : '发布' }}
        </button>
        <button @click="loadCanvas" :disabled="isLoading">
          {{ isLoading ? '加载中...' : '加载' }}
        </button>
        <button @click="clearCanvas">清空画布</button>
      </div>
      <div class="canvas-content" ref="canvasRef">
        <svg class="preview-svg" :style="{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }">
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
  props: ['initialData'],
  emits: ['canvas-saved', 'canvas-published', 'canvas-loaded', 'node-deleted', 'preview-line-recovered'],
  setup(props, { emit }) {
    const canvasRef = ref(null)
    const graph = ref(mockGraph)
    const nodes = ref([])
    const connections = ref([])
    const previewLines = ref([])
    const isSaving = ref(false)
    const isPublishing = ref(false)
    const isLoading = ref(false)
    const canvasData = ref(null)

    // 保存画布
    const saveCanvas = async () => {
      if (isSaving.value) return

      try {
        isSaving.value = true
        
        const data = {
          nodes: nodes.value,
          connections: connections.value,
          previewLines: previewLines.value,
          metadata: {
            version: '1.0',
            saveTime: Date.now(),
            nodeCount: nodes.value.length,
            connectionCount: connections.value.length
          }
        }

        // 模拟保存延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        canvasData.value = data
        emit('canvas-saved', data)
        console.log('✅ 画布保存成功')
        return data
      } catch (error) {
        console.error('❌ 画布保存失败:', error)
        throw error
      } finally {
        isSaving.value = false
      }
    }

    // 发布画布
    const publishCanvas = async () => {
      if (isPublishing.value) return

      try {
        isPublishing.value = true
        
        // 验证画布数据完整性
        if (nodes.value.length === 0) {
          throw new Error('画布中至少需要一个节点才能发布')
        }

        const startNodes = nodes.value.filter(node => node.type === 'start')
        if (startNodes.length === 0) {
          throw new Error('画布中必须有一个开始节点才能发布')
        }

        const data = {
          nodes: nodes.value,
          connections: connections.value,
          status: 'published',
          publishTime: Date.now(),
          version: '1.0'
        }

        // 模拟发布延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        emit('canvas-published', data)
        console.log('✅ 画布发布成功')
        return data
      } catch (error) {
        console.error('❌ 画布发布失败:', error)
        throw error
      } finally {
        isPublishing.value = false
      }
    }

    // 加载画布
    const loadCanvas = async (data) => {
      if (isLoading.value) return

      try {
        isLoading.value = true
        
        const loadData = data || props.initialData || {
          nodes: [],
          connections: [],
          previewLines: []
        }

        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        nodes.value = loadData.nodes || []
        connections.value = loadData.connections || []
        previewLines.value = loadData.previewLines || []
        
        // 重新渲染画布
        graph.value.clearCells()
        
        // 添加节点到画布
        nodes.value.forEach(node => {
          graph.value.addNode(node)
        })
        
        // 添加连接到画布
        connections.value.forEach(connection => {
          graph.value.addEdge(connection)
        })

        emit('canvas-loaded', loadData)
        console.log('✅ 画布加载成功')
        return loadData
      } catch (error) {
        console.error('❌ 画布加载失败:', error)
        throw error
      } finally {
        isLoading.value = false
      }
    }

    // 清空画布
    const clearCanvas = () => {
      nodes.value = []
      connections.value = []
      previewLines.value = []
      graph.value.clearCells()
      console.log('✅ 画布已清空')
    }

    // 删除节点
    const deleteNode = async (nodeId) => {
      const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
      if (nodeIndex === -1) {
        throw new Error(`节点 ${nodeId} 不存在`)
      }

      const node = nodes.value[nodeIndex]
      
      // 检查是否为受保护节点
      if (node.isProtected || node.type === 'start') {
        throw new Error(`无法删除受保护的节点: ${node.type}`)
      }

      // 删除相关的连接
      const relatedConnections = connections.value.filter(
        conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
      )

      // 删除相关的预览线
      const relatedPreviewLines = previewLines.value.filter(
        line => line.sourceId === nodeId || line.targetId === nodeId
      )

      // 执行删除
      nodes.value.splice(nodeIndex, 1)
      
      // 删除相关连接
      relatedConnections.forEach(conn => {
        const connIndex = connections.value.findIndex(c => c.id === conn.id)
        if (connIndex !== -1) {
          connections.value.splice(connIndex, 1)
        }
      })

      // 删除相关预览线
      relatedPreviewLines.forEach(line => {
        const lineIndex = previewLines.value.findIndex(l => l.id === line.id)
        if (lineIndex !== -1) {
          previewLines.value.splice(lineIndex, 1)
        }
      })

      // 从画布中删除
      graph.value.removeNode(nodeId)

      emit('node-deleted', {
        nodeId,
        deletedConnections: relatedConnections,
        deletedPreviewLines: relatedPreviewLines
      })

      console.log(`✅ 节点 ${nodeId} 删除成功`)
      return {
        nodeId,
        deletedConnections: relatedConnections,
        deletedPreviewLines: relatedPreviewLines
      }
    }

    // 恢复预览线
    const recoverPreviewLines = async (nodeId) => {
      // 查找与该节点相关的潜在连接
      const potentialConnections = connections.value.filter(
        conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
      )

      const recoveredLines = []

      for (const conn of potentialConnections) {
        const sourceNode = nodes.value.find(n => n.id === conn.sourceNodeId)
        const targetNode = nodes.value.find(n => n.id === conn.targetNodeId)

        if (sourceNode && targetNode) {
          const previewLine = {
            id: `recovered_${conn.id}_${Date.now()}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            start: {
              x: sourceNode.x + (sourceNode.width || 120) / 2,
              y: sourceNode.y + (sourceNode.height || 60) / 2
            },
            end: {
              x: targetNode.x + (targetNode.width || 120) / 2,
              y: targetNode.y + (targetNode.height || 60) / 2
            },
            color: '#52c41a',
            width: 2,
            dashed: true,
            recovered: true,
            originalConnectionId: conn.id
          }

          previewLines.value.push(previewLine)
          recoveredLines.push(previewLine)
        }
      }

      if (recoveredLines.length > 0) {
        emit('preview-line-recovered', {
          nodeId,
          recoveredLines
        })
        console.log(`✅ 为节点 ${nodeId} 恢复了 ${recoveredLines.length} 条预览线`)
      }

      return recoveredLines
    }

    // 添加节点
    const addNode = (nodeData) => {
      const node = {
        id: nodeData.id || `node_${Date.now()}`,
        type: nodeData.type || 'default',
        x: nodeData.x || 0,
        y: nodeData.y || 0,
        width: nodeData.width || 120,
        height: nodeData.height || 60,
        label: nodeData.label || '新节点',
        ...nodeData
      }

      nodes.value.push(node)
      graph.value.addNode(node)
      
      console.log(`✅ 节点 ${node.id} 添加成功`)
      return node
    }

    // 获取画布数据
    const getCanvasData = () => {
      return {
        nodes: nodes.value,
        connections: connections.value,
        previewLines: previewLines.value,
        metadata: {
          nodeCount: nodes.value.length,
          connectionCount: connections.value.length,
          previewLineCount: previewLines.value.length
        }
      }
    }

    return {
      canvasRef,
      graph,
      nodes,
      connections,
      previewLines,
      isSaving,
      isPublishing,
      isLoading,
      saveCanvas,
      publishCanvas,
      loadCanvas,
      clearCanvas,
      deleteNode,
      recoverPreviewLines,
      addNode,
      getCanvasData
    }
  }
}

describe('画布高级功能测试', () => {
  let canvasWrapper
  let canvasComponent

  beforeEach(() => {
    vi.clearAllMocks()
    
    canvasWrapper = mount(AdvancedCanvasComponent, {
      props: {
        initialData: null
      }
    })

    canvasComponent = canvasWrapper.vm
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('画布保存功能测试', () => {
    it('TC_SAVE_001 - 空画布保存', async () => {
      const result = await canvasComponent.saveCanvas()
      
      expect(result).toBeDefined()
      expect(result.nodes).toEqual([])
      expect(result.connections).toEqual([])
      expect(result.metadata.nodeCount).toBe(0)
      expect(result.metadata.connectionCount).toBe(0)
      
      console.log('✅ 空画布保存测试通过')
    })

    it('TC_SAVE_002 - 有数据画布保存', async () => {
      // 添加测试节点
      const node1 = canvasComponent.addNode({
        id: 'save_test_node_1',
        type: 'start',
        x: 100,
        y: 100,
        label: '开始节点'
      })

      const node2 = canvasComponent.addNode({
        id: 'save_test_node_2',
        type: 'end',
        x: 300,
        y: 100,
        label: '结束节点'
      })

      const result = await canvasComponent.saveCanvas()
      
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].id).toBe('save_test_node_1')
      expect(result.nodes[1].id).toBe('save_test_node_2')
      expect(result.metadata.nodeCount).toBe(2)
      
      console.log('✅ 有数据画布保存测试通过')
    })

    it('TC_SAVE_003 - 保存状态管理', async () => {
      expect(canvasComponent.isSaving).toBe(false)
      
      const savePromise = canvasComponent.saveCanvas()
      expect(canvasComponent.isSaving).toBe(true)
      
      await savePromise
      expect(canvasComponent.isSaving).toBe(false)
      
      console.log('✅ 保存状态管理测试通过')
    })
  })

  describe('画布发布功能测试', () => {
    it('TC_PUBLISH_001 - 空画布发布失败', async () => {
      await expect(canvasComponent.publishCanvas())
        .rejects.toThrow('画布中至少需要一个节点才能发布')
      
      console.log('✅ 空画布发布失败测试通过')
    })

    it('TC_PUBLISH_002 - 无开始节点发布失败', async () => {
      canvasComponent.addNode({
        id: 'publish_test_node',
        type: 'end',
        x: 100,
        y: 100
      })

      await expect(canvasComponent.publishCanvas())
        .rejects.toThrow('画布中必须有一个开始节点才能发布')
      
      console.log('✅ 无开始节点发布失败测试通过')
    })

    it('TC_PUBLISH_003 - 正常画布发布成功', async () => {
      canvasComponent.addNode({
        id: 'publish_start_node',
        type: 'start',
        x: 100,
        y: 100
      })

      canvasComponent.addNode({
        id: 'publish_end_node',
        type: 'end',
        x: 300,
        y: 100
      })

      const result = await canvasComponent.publishCanvas()
      
      expect(result).toBeDefined()
      expect(result.status).toBe('published')
      expect(result.nodes).toHaveLength(2)
      expect(result.publishTime).toBeDefined()
      
      console.log('✅ 正常画布发布成功测试通过')
    })
  })

  describe('画布加载功能测试', () => {
    it('TC_LOAD_001 - 加载空数据', async () => {
      const testData = {
        nodes: [],
        connections: [],
        previewLines: []
      }

      const result = await canvasComponent.loadCanvas(testData)
      
      expect(result).toEqual(testData)
      expect(canvasComponent.nodes).toEqual([])
      expect(canvasComponent.connections).toEqual([])
      
      console.log('✅ 加载空数据测试通过')
    })

    it('TC_LOAD_002 - 加载完整数据', async () => {
      const testData = {
        nodes: [
          { id: 'load_node_1', type: 'start', x: 100, y: 100 },
          { id: 'load_node_2', type: 'end', x: 300, y: 100 }
        ],
        connections: [
          { id: 'load_conn_1', sourceNodeId: 'load_node_1', targetNodeId: 'load_node_2' }
        ],
        previewLines: []
      }

      const result = await canvasComponent.loadCanvas(testData)
      
      expect(result).toEqual(testData)
      expect(canvasComponent.nodes).toHaveLength(2)
      expect(canvasComponent.connections).toHaveLength(1)
      
      console.log('✅ 加载完整数据测试通过')
    })

    it('TC_LOAD_003 - 加载状态管理', async () => {
      expect(canvasComponent.isLoading).toBe(false)
      
      const loadPromise = canvasComponent.loadCanvas({})
      expect(canvasComponent.isLoading).toBe(true)
      
      await loadPromise
      expect(canvasComponent.isLoading).toBe(false)
      
      console.log('✅ 加载状态管理测试通过')
    })
  })

  describe('节点删除功能测试', () => {
    it('TC_DELETE_001 - 删除普通节点', async () => {
      const node = canvasComponent.addNode({
        id: 'delete_test_node',
        type: 'sms',
        x: 100,
        y: 100
      })

      const result = await canvasComponent.deleteNode('delete_test_node')
      
      expect(result.nodeId).toBe('delete_test_node')
      expect(canvasComponent.nodes).toHaveLength(0)
      
      console.log('✅ 删除普通节点测试通过')
    })

    it('TC_DELETE_002 - 删除不存在节点失败', async () => {
      await expect(canvasComponent.deleteNode('non_existent_node'))
        .rejects.toThrow('节点 non_existent_node 不存在')
      
      console.log('✅ 删除不存在节点失败测试通过')
    })

    it('TC_DELETE_003 - 删除受保护节点失败', async () => {
      canvasComponent.addNode({
        id: 'protected_start_node',
        type: 'start',
        x: 100,
        y: 100,
        isProtected: true
      })

      await expect(canvasComponent.deleteNode('protected_start_node'))
        .rejects.toThrow('无法删除受保护的节点: start')
      
      console.log('✅ 删除受保护节点失败测试通过')
    })

    it('TC_DELETE_004 - 删除节点时清理相关连接', async () => {
      const node1 = canvasComponent.addNode({
        id: 'delete_source_node',
        type: 'start',
        x: 100,
        y: 100
      })

      const node2 = canvasComponent.addNode({
        id: 'delete_target_node',
        type: 'sms',
        x: 300,
        y: 100
      })

      // 添加连接
      canvasComponent.connections.push({
        id: 'delete_test_connection',
        sourceNodeId: 'delete_source_node',
        targetNodeId: 'delete_target_node'
      })

      const result = await canvasComponent.deleteNode('delete_target_node')
      
      expect(result.deletedConnections).toHaveLength(1)
      expect(result.deletedConnections[0].id).toBe('delete_test_connection')
      expect(canvasComponent.connections).toHaveLength(0)
      
      console.log('✅ 删除节点时清理相关连接测试通过')
    })
  })

  describe('预览线恢复功能测试', () => {
    it('TC_RECOVER_001 - 恢复节点相关预览线', async () => {
      const node1 = canvasComponent.addNode({
        id: 'recover_node_1',
        type: 'start',
        x: 100,
        y: 100,
        width: 120,
        height: 60
      })

      const node2 = canvasComponent.addNode({
        id: 'recover_node_2',
        type: 'sms',
        x: 300,
        y: 100,
        width: 120,
        height: 60
      })

      // 添加连接
      canvasComponent.connections.push({
        id: 'recover_test_connection',
        sourceNodeId: 'recover_node_1',
        targetNodeId: 'recover_node_2'
      })

      const recoveredLines = await canvasComponent.recoverPreviewLines('recover_node_1')
      
      expect(recoveredLines).toHaveLength(1)
      expect(recoveredLines[0].sourceId).toBe('recover_node_1')
      expect(recoveredLines[0].targetId).toBe('recover_node_2')
      expect(recoveredLines[0].recovered).toBe(true)
      expect(canvasComponent.previewLines).toHaveLength(1)
      
      console.log('✅ 恢复节点相关预览线测试通过')
    })

    it('TC_RECOVER_002 - 无相关连接时不恢复预览线', async () => {
      canvasComponent.addNode({
        id: 'isolated_node',
        type: 'sms',
        x: 100,
        y: 100
      })

      const recoveredLines = await canvasComponent.recoverPreviewLines('isolated_node')
      
      expect(recoveredLines).toHaveLength(0)
      expect(canvasComponent.previewLines).toHaveLength(0)
      
      console.log('✅ 无相关连接时不恢复预览线测试通过')
    })
  })

  describe('画布清空功能测试', () => {
    it('TC_CLEAR_001 - 清空画布所有数据', async () => {
      // 添加测试数据
      canvasComponent.addNode({ id: 'clear_node_1', type: 'start' })
      canvasComponent.addNode({ id: 'clear_node_2', type: 'end' })
      canvasComponent.connections.push({ id: 'clear_conn_1' })
      canvasComponent.previewLines.push({ id: 'clear_line_1' })

      canvasComponent.clearCanvas()
      
      expect(canvasComponent.nodes).toHaveLength(0)
      expect(canvasComponent.connections).toHaveLength(0)
      expect(canvasComponent.previewLines).toHaveLength(0)
      
      console.log('✅ 清空画布所有数据测试通过')
    })
  })

  describe('画布数据获取测试', () => {
    it('TC_GET_DATA_001 - 获取完整画布数据', async () => {
      canvasComponent.addNode({ id: 'data_node_1', type: 'start' })
      canvasComponent.addNode({ id: 'data_node_2', type: 'end' })
      canvasComponent.connections.push({ id: 'data_conn_1' })

      const data = canvasComponent.getCanvasData()
      
      expect(data.nodes).toHaveLength(2)
      expect(data.connections).toHaveLength(1)
      expect(data.previewLines).toHaveLength(0)
      expect(data.metadata.nodeCount).toBe(2)
      expect(data.metadata.connectionCount).toBe(1)
      expect(data.metadata.previewLineCount).toBe(0)
      
      console.log('✅ 获取完整画布数据测试通过')
    })
  })
})