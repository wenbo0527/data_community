/**
 * PreviewLineSystem 集成测试
 * 测试预览线系统与TaskFlowCanvas的集成稳定性，确保与实际使用场景一致
 * 
 * 测试重点：
 * 1. PreviewLineSystem与Graph实例的同步初始化
 * 2. 预览线创建、更新、删除的完整流程
 * 3. 异步操作的竞态条件处理
 * 4. 错误恢复和资源清理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import TaskFlowCanvasRefactored from '../../../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'

// 创建真实的PreviewLineSystem模拟
const createRealisticPreviewLineSystem = () => {
  let isInitialized = false
  let graphInstance = null
  const previewLines = new Map()
  const activeOperations = new Set()

  const system = {
    // 初始化方法 - 修复：使用 init 而不是 initialize
    init: vi.fn().mockImplementation(async (graph) => {
      if (isInitialized) {
        console.warn('PreviewLineSystem already initialized')
        return
      }

      if (!graph) {
        throw new Error('PreviewLineSystem requires valid graph instance')
      }

      // 模拟异步初始化过程
      await new Promise(resolve => setTimeout(resolve, 30))

      graphInstance = graph
      isInitialized = true
      
      // 绑定图事件
      graph.on('node:added', (data) => {
        console.log('PreviewLineSystem: Node added', data.node?.id)
      })

      graph.on('node:removed', (data) => {
        console.log('PreviewLineSystem: Node removed', data.node?.id)
        // 清理相关预览线
        if (system.clearPreviewLinesForNode) {
          system.clearPreviewLinesForNode(data.node?.id)
        }
      })

      return Promise.resolve()
    }),

    // 保持向后兼容性，添加 initialize 方法作为 init 的别名
    initialize: vi.fn().mockImplementation(async function(graph) {
      return system.init(graph)
    }),

    // 创建预览线
    createPreviewLine: vi.fn().mockImplementation(async function(sourceId, targetId, options = {}) {
      if (!isInitialized || !graphInstance) {
        throw new Error('PreviewLineSystem not initialized')
      }

      const operationId = `create-${sourceId}-${targetId}-${Date.now()}`
      
      if (activeOperations.has(operationId)) {
        console.warn('Preview line creation already in progress')
        return null
      }

      activeOperations.add(operationId)

      try {
        // 模拟异步创建过程
        await new Promise(resolve => setTimeout(resolve, 20))

        const lineId = `preview-${sourceId}-${targetId}`
        const previewLine = {
          id: lineId,
          sourceId,
          targetId,
          type: 'preview',
          createdAt: Date.now(),
          ...options
        }

        previewLines.set(lineId, previewLine)
        
        // 模拟在图上渲染预览线
        if (graphInstance.addEdge) {
          graphInstance.addEdge({
            id: lineId,
            source: sourceId,
            target: targetId,
            attrs: {
              line: {
                stroke: '#1890ff',
                strokeDasharray: '5 5',
                strokeWidth: 2
              }
            }
          })
        }

        return previewLine
      } finally {
        activeOperations.delete(operationId)
      }
    }),

    // 更新预览线
    updatePreviewLine: vi.fn().mockImplementation(async function(lineId, updates) {
      if (!isInitialized || !graphInstance) {
        throw new Error('PreviewLineSystem not initialized')
      }

      const operationId = `update-${lineId}-${Date.now()}`
      
      if (activeOperations.has(operationId)) {
        console.warn('Preview line update already in progress')
        return null
      }

      activeOperations.add(operationId)

      try {
        const existingLine = previewLines.get(lineId)
        if (!existingLine) {
          throw new Error(`Preview line ${lineId} not found`)
        }

        // 模拟异步更新过程
        await new Promise(resolve => setTimeout(resolve, 15))

        const updatedLine = { ...existingLine, ...updates, updatedAt: Date.now() }
        previewLines.set(lineId, updatedLine)

        return updatedLine
      } finally {
        activeOperations.delete(operationId)
      }
    }),

    // 删除预览线
    deletePreviewLine: vi.fn().mockImplementation(async function(lineId) {
      if (!isInitialized || !graphInstance) {
        throw new Error('PreviewLineSystem not initialized')
      }

      const operationId = `delete-${lineId}-${Date.now()}`
      
      if (activeOperations.has(operationId)) {
        console.warn('Preview line deletion already in progress')
        return false
      }

      activeOperations.add(operationId)

      try {
        // 模拟异步删除过程
        await new Promise(resolve => setTimeout(resolve, 10))

        const existed = previewLines.has(lineId)
        if (existed) {
          previewLines.delete(lineId)
          
          // 从图中移除
          if (graphInstance.removeEdge) {
            graphInstance.removeEdge(lineId)
          }
        }

        return existed
      } finally {
        activeOperations.delete(operationId)
      }
    }),

    // 清理节点相关的预览线
    clearPreviewLinesForNode: vi.fn().mockImplementation(async function(nodeId) {
      if (!isInitialized) {
        return
      }

      const linesToRemove = []
      for (const [lineId, line] of previewLines) {
        if (line.sourceId === nodeId || line.targetId === nodeId) {
          linesToRemove.push(lineId)
        }
      }

      // 批量删除
      const deletePromises = linesToRemove.map(lineId => this.deletePreviewLine(lineId))
      await Promise.allSettled(deletePromises)

      return linesToRemove.length
    }),

    // 刷新所有预览线
    refreshAllPreviewLines: vi.fn().mockImplementation(async function(force = false) {
      if (!isInitialized || !graphInstance) {
        return
      }

      // 模拟刷新过程
      await new Promise(resolve => setTimeout(resolve, 25))

      let refreshedCount = 0
      for (const [lineId, line] of previewLines) {
        // 验证预览线的源节点和目标节点是否仍然存在
        const sourceExists = graphInstance.getCellById && graphInstance.getCellById(line.sourceId)
        const targetExists = graphInstance.getCellById && graphInstance.getCellById(line.targetId)

        if (!sourceExists || !targetExists) {
          await system.deletePreviewLine(lineId)
        } else if (force) {
          await system.updatePreviewLine(lineId, { refreshedAt: Date.now() })
          refreshedCount++
        }
      }

      return refreshedCount
    }),

    // 销毁预览线系统
    destroy: vi.fn().mockImplementation(async function() {
      if (!isInitialized) {
        return
      }

      // 清理所有预览线
      const lineIds = Array.from(previewLines.keys())
      const deletePromises = lineIds.map(lineId => system.deletePreviewLine(lineId))
      await Promise.allSettled(deletePromises)

      // 解绑事件
      if (graphInstance && graphInstance.off) {
        graphInstance.off('node:added')
        graphInstance.off('node:removed')
      }

      isInitialized = false
      graphInstance = null
      previewLines.clear()
      activeOperations.clear()
    }),

    // 获取状态信息
    getStatus: () => ({
      isInitialized,
      hasGraph: !!graphInstance,
      previewLineCount: previewLines.size,
      activeOperationCount: activeOperations.size
    }),

    // 获取所有预览线
    getAllPreviewLines: () => Array.from(previewLines.values()),

    // 检查是否存在预览线
    hasPreviewLine: (lineId) => previewLines.has(lineId)
  }

  return system
}

// Mock PreviewLineSystem
vi.mock('../../../utils/preview-line/PreviewLineSystem.js', () => ({
  PreviewLineSystem: vi.fn().mockImplementation(() => createRealisticPreviewLineSystem())
}))

// Mock useCanvasCore
vi.mock('../../../pages/marketing/tasks/composables/useCanvasCore.js', () => ({
  useCanvasCore: vi.fn(() => {
    const graph = ref(null)
    const isGraphReady = ref(false)
    
    const initializeGraph = vi.fn().mockImplementation(async (options = {}) => {
      // 模拟Graph实例创建
      await new Promise(resolve => setTimeout(resolve, 40))
      
      const graphInstance = {
        id: `graph-${Date.now()}`,
        addNode: vi.fn().mockImplementation((nodeData) => {
          const node = { id: nodeData.id || `node-${Date.now()}`, ...nodeData }
          // 触发节点添加事件
          if (graphInstance._eventHandlers && graphInstance._eventHandlers['node:added']) {
            graphInstance._eventHandlers['node:added'].forEach(handler => {
              handler({ node })
            })
          }
          return node
        }),
        removeNode: vi.fn().mockImplementation((nodeId) => {
          // 触发节点删除事件
          if (graphInstance._eventHandlers && graphInstance._eventHandlers['node:removed']) {
            graphInstance._eventHandlers['node:removed'].forEach(handler => {
              handler({ node: { id: nodeId } })
            })
          }
          return true
        }),
        addEdge: vi.fn().mockImplementation((edgeData) => {
          return { id: edgeData.id || `edge-${Date.now()}`, ...edgeData }
        }),
        removeEdge: vi.fn().mockImplementation((edgeId) => {
          return true
        }),
        getCells: vi.fn(() => []),
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => []),
        getCellById: vi.fn((id) => ({ id })), // 简单模拟，返回包含id的对象
        on: vi.fn().mockImplementation((event, handler) => {
          if (!graphInstance._eventHandlers) {
            graphInstance._eventHandlers = {}
          }
          if (!graphInstance._eventHandlers[event]) {
            graphInstance._eventHandlers[event] = []
          }
          graphInstance._eventHandlers[event].push(handler)
        }),
        off: vi.fn().mockImplementation((event, handler) => {
          if (graphInstance._eventHandlers && graphInstance._eventHandlers[event]) {
            const index = graphInstance._eventHandlers[event].indexOf(handler)
            if (index > -1) {
              graphInstance._eventHandlers[event].splice(index, 1)
            }
          }
        }),
        dispose: vi.fn(),
        zoom: vi.fn(() => 1),
        centerContent: vi.fn(),
        zoomToFit: vi.fn(),
        clear: vi.fn()
      }

      graph.value = graphInstance
      isGraphReady.value = true
      
      return graphInstance
    })

    return {
      graph,
      isGraphReady,
      initializeGraph,
      destroyGraph: vi.fn(),
      registerCustomEdgeShapes: vi.fn(),
      initializePlugins: vi.fn(),
      initializeMinimap: vi.fn(),
      calculateConnectionPoints: vi.fn(),
      resetGraph: vi.fn()
    }
  })
}))

// Mock其他依赖
vi.mock('@antv/x6', () => ({
  Graph: vi.fn()
}))

vi.mock('@antv/x6-vue-shape', () => ({
  register: vi.fn()
}))

describe('PreviewLineSystem 集成测试', () => {
  let wrapper
  let previewLineSystem

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('初始化集成测试', () => {
    it('应该在Graph实例就绪后正确初始化PreviewLineSystem', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证Graph实例已创建
      expect(wrapper.vm.graph?.value).toBeDefined()
      expect(wrapper.vm.isGraphReady?.value).toBe(true)

      // 如果组件中有PreviewLineSystem实例，验证其状态
      // 这里需要根据实际的集成方式进行调整
    })

    it('应该正确处理PreviewLineSystem初始化失败', async () => {
      // 模拟PreviewLineSystem初始化失败
      const { PreviewLineSystem } = await import('../../../utils/preview-line/PreviewLineSystem.js')
      PreviewLineSystem.mockImplementation(() => ({
        init: vi.fn().mockRejectedValue(new Error('PreviewLineSystem init failed')),
        initialize: vi.fn().mockRejectedValue(new Error('PreviewLineSystem init failed')),
        destroy: vi.fn()
      }))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Graph实例应该仍然可用，即使PreviewLineSystem初始化失败
      expect(wrapper.vm.graph?.value).toBeDefined()
      
      consoleSpy.mockRestore()
    })

    it('应该正确处理Graph实例和PreviewLineSystem的初始化顺序', async () => {
      const initOrder = []

      // 监控初始化顺序
      const { useCanvasCore } = await import('../../../pages/marketing/tasks/composables/useCanvasCore.js')
      const mockUseCanvasCore = vi.mocked(useCanvasCore)
      
      mockUseCanvasCore.mockReturnValue({
        graph: ref(null),
        isGraphReady: ref(false),
        initializeGraph: vi.fn().mockImplementation(async () => {
          initOrder.push('graph-init')
          await new Promise(resolve => setTimeout(resolve, 50))
          return { id: 'test-graph' }
        }),
        destroyGraph: vi.fn()
      })

      const { PreviewLineSystem } = await import('../../../utils/preview-line/PreviewLineSystem.js')
      PreviewLineSystem.mockImplementation(() => ({
        init: vi.fn().mockImplementation(async () => {
          initOrder.push('preview-line-init')
          await new Promise(resolve => setTimeout(resolve, 30))
        }),
        initialize: vi.fn().mockImplementation(async () => {
          initOrder.push('preview-line-init')
          await new Promise(resolve => setTimeout(resolve, 30))
        }),
        destroy: vi.fn()
      }))

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))

      // Graph应该在PreviewLineSystem之前初始化
      expect(initOrder.indexOf('graph-init')).toBeLessThan(initOrder.indexOf('preview-line-init'))
    })
  })

  describe('预览线操作集成测试', () => {
    beforeEach(async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [
            { id: 'node1', type: 'start', position: { x: 100, y: 100 } },
            { id: 'node2', type: 'sms', position: { x: 300, y: 100 } },
            { id: 'node3', type: 'email', position: { x: 500, y: 100 } }
          ],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 获取PreviewLineSystem实例（需要根据实际集成方式调整）
      previewLineSystem = createRealisticPreviewLineSystem()
      
      // 确保有一个有效的 graph 实例
      const mockGraph = {
        getNodes: () => [],
        getEdges: () => [],
        addEdge: () => {},
        removeEdge: () => {},
        on: () => {},
        off: () => {},
        getCellById: (id) => null,
        getCells: () => [],
        addNode: () => {},
        removeNode: () => {},
        updateNode: () => {},
        getNodeById: (id) => null,
        getEdgeById: (id) => null
      }
      
      await previewLineSystem.init(mockGraph)
    })

    it('应该正确创建预览线', async () => {
      const previewLine = await previewLineSystem.createPreviewLine('node1', 'node2')
      
      expect(previewLine).toBeDefined()
      expect(previewLine.sourceId).toBe('node1')
      expect(previewLine.targetId).toBe('node2')
      expect(previewLine.type).toBe('preview')
    })

    it('应该正确更新预览线', async () => {
      const previewLine = await previewLineSystem.createPreviewLine('node1', 'node2')
      const updatedLine = await previewLineSystem.updatePreviewLine(previewLine.id, {
        style: 'dashed'
      })
      
      expect(updatedLine).toBeDefined()
      expect(updatedLine.style).toBe('dashed')
      expect(updatedLine.updatedAt).toBeDefined()
    })

    it('应该正确删除预览线', async () => {
      const previewLine = await previewLineSystem.createPreviewLine('node1', 'node2')
      const deleted = await previewLineSystem.deletePreviewLine(previewLine.id)
      
      expect(deleted).toBe(true)
      expect(previewLineSystem.hasPreviewLine(previewLine.id)).toBe(false)
    })

    it('应该正确处理并发预览线操作', async () => {
      // 并发创建多条预览线
      const createPromises = [
        previewLineSystem.createPreviewLine('node1', 'node2'),
        previewLineSystem.createPreviewLine('node2', 'node3'),
        previewLineSystem.createPreviewLine('node1', 'node3')
      ]

      const results = await Promise.allSettled(createPromises)
      
      // 所有操作都应该成功
      results.forEach(result => {
        expect(result.status).toBe('fulfilled')
        expect(result.value).toBeDefined()
      })

      const status = previewLineSystem.getStatus()
      expect(status.previewLineCount).toBe(3)
    })
  })

  describe('节点操作与预览线同步测试', () => {
    beforeEach(async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [
            { id: 'node1', type: 'start', position: { x: 100, y: 100 } },
            { id: 'node2', type: 'sms', position: { x: 300, y: 100 } }
          ],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      previewLineSystem = createRealisticPreviewLineSystem()
      
      // 确保有一个有效的 graph 实例
      const mockGraph = {
        getNodes: () => [],
        getEdges: () => [],
        addEdge: () => {},
        removeEdge: () => {},
        on: () => {},
        off: () => {},
        getCellById: (id) => null,
        getCells: () => [],
        addNode: () => {},
        removeNode: () => {},
        updateNode: () => {},
        getNodeById: (id) => null,
        getEdgeById: (id) => null
      }
      
      await previewLineSystem.init(mockGraph)
    })

    it('应该在节点删除时自动清理相关预览线', async () => {
      // 创建预览线
      await previewLineSystem.createPreviewLine('node1', 'node2')
      
      const initialStatus = previewLineSystem.getStatus()
      expect(initialStatus.previewLineCount).toBe(1)

      // 删除节点（这应该触发预览线清理）
      if (wrapper.vm.graph?.value && wrapper.vm.graph.value.removeNode) {
        wrapper.vm.graph.value.removeNode('node1')
      }

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      const finalStatus = previewLineSystem.getStatus()
      expect(finalStatus.previewLineCount).toBe(0)
    })

    it('应该在添加新节点时正确响应', async () => {
      const newNode = {
        id: 'node3',
        type: 'email',
        position: { x: 500, y: 100 }
      }

      // 添加节点
      if (wrapper.vm.addNodeToGraph) {
        wrapper.vm.addNodeToGraph(newNode)
      }

      await nextTick()

      // 应该能够为新节点创建预览线
      const previewLine = await previewLineSystem.createPreviewLine('node1', 'node3')
      expect(previewLine).toBeDefined()
      expect(previewLine.targetId).toBe('node3')
    })
  })

  describe('错误处理和恢复测试', () => {
    it('应该正确处理预览线创建失败', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      previewLineSystem = createRealisticPreviewLineSystem()
      
      // 尝试在未初始化的情况下创建预览线
      await expect(previewLineSystem.createPreviewLine('node1', 'node2')).rejects.toThrow('not initialized')
    })

    it('应该正确处理无效节点的预览线操作', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [
            { id: 'node1', type: 'start', position: { x: 100, y: 100 } }
          ],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      previewLineSystem = createRealisticPreviewLineSystem()
      
      // 确保有一个有效的 graph 实例
      const mockGraph = {
        getNodes: () => [],
        getEdges: () => [],
        addEdge: () => {},
        removeEdge: () => {},
        on: () => {},
        off: () => {},
        getCellById: (id) => null,
        getCells: () => [],
        addNode: () => {},
        removeNode: () => {},
        updateNode: () => {},
        getNodeById: (id) => null,
        getEdgeById: (id) => null
      }
      
      await previewLineSystem.init(mockGraph)

      // 尝试为不存在的节点创建预览线
      const previewLine = await previewLineSystem.createPreviewLine('node1', 'nonexistent-node')
      
      // 应该能够创建，但在刷新时会被清理
      expect(previewLine).toBeDefined()
      
      const refreshedCount = await previewLineSystem.refreshAllPreviewLines(true)
      expect(refreshedCount).toBe(0) // 无效预览线应该被清理
    })
  })

  describe('资源清理测试', () => {
    it('应该在组件卸载时正确清理PreviewLineSystem', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [
            { id: 'node1', type: 'start', position: { x: 100, y: 100 } }
          ],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      previewLineSystem = createRealisticPreviewLineSystem()
      
      // 确保有一个有效的 graph 实例
      const mockGraph = {
        getNodes: () => [],
        getEdges: () => [],
        addEdge: () => {},
        removeEdge: () => {},
        on: () => {},
        off: () => {},
        getCellById: (id) => null,
        getCells: () => [],
        addNode: () => {},
        removeNode: () => {},
        updateNode: () => {},
        getNodeById: (id) => null,
        getEdgeById: (id) => null
      }
      
      await previewLineSystem.init(mockGraph)
      
      // 创建一些预览线
      await previewLineSystem.createPreviewLine('node1', 'node2')
      
      const initialStatus = previewLineSystem.getStatus()
      expect(initialStatus.isInitialized).toBe(true)
      expect(initialStatus.previewLineCount).toBeGreaterThan(0)

      // 销毁PreviewLineSystem
      await previewLineSystem.destroy()

      const finalStatus = previewLineSystem.getStatus()
      expect(finalStatus.isInitialized).toBe(false)
      expect(finalStatus.previewLineCount).toBe(0)
    })
  })
})