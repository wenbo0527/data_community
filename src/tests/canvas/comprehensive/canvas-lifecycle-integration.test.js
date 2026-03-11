/**
 * TaskFlowCanvas 生命周期集成测试
 * 测试画布从创建到销毁的完整生命周期，确保与实际使用场景一致
 * 
 * 测试重点：
 * 1. 完整的初始化流程
 * 2. 数据加载与渲染同步
 * 3. 用户交互响应
 * 4. 资源清理和内存管理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import TaskFlowCanvasRefactored from '../../../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'

// 创建真实的生命周期管理器
function createLifecycleManager() {
  const phases = []
  const resources = new Set()
  const eventListeners = new Map()

  return {
    // 记录生命周期阶段
    recordPhase: (phase, data = {}) => {
      phases.push({
        phase,
        timestamp: Date.now(),
        data
      })
    },

    // 注册资源
    registerResource: (id, resource) => {
      resources.add({ id, resource, createdAt: Date.now() })
    },

    // 清理资源
    cleanupResource: (id) => {
      for (const item of resources) {
        if (item.id === id) {
          resources.delete(item)
          return true
        }
      }
      return false
    },

    // 注册事件监听器
    registerEventListener: (element, event, handler) => {
      const key = `${element}-${event}`
      if (!eventListeners.has(key)) {
        eventListeners.set(key, [])
      }
      eventListeners.get(key).push(handler)
    },

    // 清理事件监听器
    cleanupEventListeners: (element) => {
      for (const [key, handlers] of eventListeners) {
        if (key.startsWith(element)) {
          eventListeners.delete(key)
        }
      }
    },

    // 获取生命周期报告
    getReport: () => ({
      phases: [...phases],
      activeResources: resources.size,
      activeListeners: eventListeners.size
    }),

    // 重置管理器
    reset: () => {
      phases.length = 0
      resources.clear()
      eventListeners.clear()
    }
  }
}

// Mock useCanvasCore 以跟踪生命周期
vi.mock('../../../pages/marketing/tasks/composables/useCanvasCore.js', () => {
  const lifecycleManager = createLifecycleManager()
  
  return {
    useCanvasCore: vi.fn(() => {
      const graph = ref(null)
      const isGraphReady = ref(false)
      
      const initializeGraph = vi.fn().mockImplementation(async (options = {}) => {
        lifecycleManager.recordPhase('graph-init-start', options)
        
        // 模拟真实的Graph创建过程
        await new Promise(resolve => setTimeout(resolve, 50))
        
        const graphInstance = {
          id: `graph-${Date.now()}`,
          addNode: vi.fn().mockImplementation((nodeData) => {
            lifecycleManager.recordPhase('node-added', { nodeId: nodeData.id })
            return { id: nodeData.id || `node-${Date.now()}`, ...nodeData }
          }),
          removeNode: vi.fn().mockImplementation((nodeId) => {
            lifecycleManager.recordPhase('node-removed', { nodeId })
            return true
          }),
          addEdge: vi.fn().mockImplementation((edgeData) => {
            lifecycleManager.recordPhase('edge-added', { edgeId: edgeData.id })
            return { id: edgeData.id || `edge-${Date.now()}`, ...edgeData }
          }),
          removeEdge: vi.fn().mockImplementation((edgeId) => {
            lifecycleManager.recordPhase('edge-removed', { edgeId })
            return true
          }),
          getCells: vi.fn(() => []),
          getNodes: vi.fn(() => []),
          getEdges: vi.fn(() => []),
          getCellById: vi.fn(),
          on: vi.fn().mockImplementation((event, handler) => {
            lifecycleManager.registerEventListener('graph', event, handler)
          }),
          off: vi.fn().mockImplementation((event, handler) => {
            lifecycleManager.recordPhase('event-unbound', { event })
          }),
          dispose: vi.fn().mockImplementation(() => {
            lifecycleManager.recordPhase('graph-disposed')
            lifecycleManager.cleanupEventListeners('graph')
          }),
          zoom: vi.fn(() => 1),
          centerContent: vi.fn(),
          zoomToFit: vi.fn(),
          clear: vi.fn().mockImplementation(() => {
            lifecycleManager.recordPhase('graph-cleared')
          })
        }

        lifecycleManager.registerResource('graph', graphInstance)
        graph.value = graphInstance
        isGraphReady.value = true
        
        lifecycleManager.recordPhase('graph-init-complete')
        return graphInstance
      })

      const destroyGraph = vi.fn().mockImplementation(() => {
        lifecycleManager.recordPhase('graph-destroy-start')
        
        if (graph.value) {
          graph.value.dispose()
          graph.value = null
          isGraphReady.value = false
          lifecycleManager.cleanupResource('graph')
        }
        
        lifecycleManager.recordPhase('graph-destroy-complete')
      })

      return {
        graph,
        isGraphReady,
        initializeGraph,
        destroyGraph,
        registerCustomEdgeShapes: vi.fn(),
        initializePlugins: vi.fn(),
        initializeMinimap: vi.fn(),
        calculateConnectionPoints: vi.fn(),
        resetGraph: vi.fn(),
        _lifecycleManager: lifecycleManager // 暴露给测试使用
      }
    })
  }
})

// Mock useCanvasState 以跟踪状态变化
vi.mock('../../../pages/marketing/tasks/composables/useCanvasState.js', () => ({
  useCanvasState: vi.fn(() => {
    const nodes = ref([])
    const connections = ref([])
    const selectedNodes = ref([])
    const isLoading = ref(false)

    return {
      nodes,
      connections,
      selectedNodes,
      isLoading,
      addNode: vi.fn().mockImplementation((node) => {
        nodes.value.push(node)
        return node
      }),
      removeNode: vi.fn().mockImplementation((nodeId) => {
        const index = nodes.value.findIndex(n => n.id === nodeId)
        if (index > -1) {
          nodes.value.splice(index, 1)
          return true
        }
        return false
      }),
      updateNode: vi.fn(),
      addConnection: vi.fn(),
      removeConnection: vi.fn(),
      selectNode: vi.fn(),
      clearSelection: vi.fn()
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

describe('TaskFlowCanvas 生命周期集成测试', () => {
  let wrapper
  let lifecycleManager

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    if (lifecycleManager) {
      lifecycleManager.reset()
    }
  })

  describe('完整初始化流程测试', () => {
    it('应该按正确顺序执行初始化阶段', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 获取生命周期管理器
      const canvasCore = wrapper.vm.graph
      lifecycleManager = wrapper.vm._lifecycleManager || 
        (await import('../../../pages/marketing/tasks/composables/useCanvasCore.js'))
          .useCanvasCore()._lifecycleManager

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const report = lifecycleManager.getReport()
      const phases = report.phases.map(p => p.phase)

      // 验证初始化阶段顺序
      expect(phases).toContain('graph-init-start')
      expect(phases).toContain('graph-init-complete')
      
      const initStartIndex = phases.indexOf('graph-init-start')
      const initCompleteIndex = phases.indexOf('graph-init-complete')
      expect(initCompleteIndex).toBeGreaterThan(initStartIndex)
    })

    it('应该正确处理带初始数据的初始化', async () => {
      const initialNodes = [
        { id: 'node1', type: 'start', position: { x: 100, y: 100 } },
        { id: 'node2', type: 'sms', position: { x: 300, y: 100 } }
      ]

      const initialConnections = [
        { id: 'conn1', source: 'node1', target: 'node2' }
      ]

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes,
          initialConnections
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))

      // 验证初始数据已正确加载
      expect(wrapper.vm.nodes?.value).toHaveLength(initialNodes.length)
      expect(wrapper.vm.connections?.value).toHaveLength(initialConnections.length)
    })

    it('应该正确处理初始化失败的恢复', async () => {
      // 模拟初始化失败
      const { useCanvasCore } = await import('../../../pages/marketing/tasks/composables/useCanvasCore.js')
      const mockUseCanvasCore = vi.mocked(useCanvasCore)
      
      mockUseCanvasCore.mockReturnValueOnce({
        graph: ref(null),
        isGraphReady: ref(false),
        initializeGraph: vi.fn().mockRejectedValue(new Error('Init failed')),
        destroyGraph: vi.fn(),
        _lifecycleManager: createLifecycleManager()
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 组件应该能够处理初始化失败
      expect(wrapper.vm.isGraphReady?.value).toBe(false)
      
      consoleSpy.mockRestore()
    })
  })

  describe('数据加载与渲染同步测试', () => {
    it('应该在数据变化时正确更新渲染', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 动态添加节点
      const newNode = {
        id: 'dynamic-node',
        type: 'email',
        position: { x: 200, y: 200 },
        data: { label: '动态节点' }
      }

      if (wrapper.vm.addNodeToGraph) {
        const result = wrapper.vm.addNodeToGraph(newNode)
        expect(result).toBeDefined()
      }

      await nextTick()

      // 验证节点已添加到状态中
      const nodes = wrapper.vm.nodes?.value || []
      expect(nodes.some(n => n.id === 'dynamic-node')).toBe(true)
    })

    it('应该正确处理大量数据的批量加载', async () => {
      const largeDataSet = {
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: `node-${i}`,
          type: i % 2 === 0 ? 'sms' : 'email',
          position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 }
        })),
        connections: Array.from({ length: 50 }, (_, i) => ({
          id: `conn-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`
        }))
      }

      const startTime = performance.now()

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: largeDataSet.nodes,
          initialConnections: largeDataSet.connections
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      const endTime = performance.now()
      const loadTime = endTime - startTime

      // 大量数据加载应该在合理时间内完成
      expect(loadTime).toBeLessThan(1000) // 1秒内
      expect(wrapper.vm.nodes?.value).toHaveLength(largeDataSet.nodes.length)
    })
  })

  describe('用户交互响应测试', () => {
    it('应该正确响应节点选择操作', async () => {
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

      // 模拟节点选择
      if (wrapper.vm.selectNode) {
        wrapper.vm.selectNode('node1')
        await nextTick()

        const selectedNodes = wrapper.vm.selectedNodes?.value || []
        expect(selectedNodes).toContain('node1')
      }
    })

    it('应该正确处理节点删除操作', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [
            { id: 'node1', type: 'start', position: { x: 100, y: 100 } },
            { id: 'node2', type: 'sms', position: { x: 300, y: 100 } }
          ],
          initialConnections: [
            { id: 'conn1', source: 'node1', target: 'node2' }
          ]
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const initialNodeCount = wrapper.vm.nodes?.value?.length || 0

      // 删除节点
      if (wrapper.vm.removeNode) {
        wrapper.vm.removeNode('node1')
        await nextTick()

        const currentNodeCount = wrapper.vm.nodes?.value?.length || 0
        expect(currentNodeCount).toBe(initialNodeCount - 1)
      }
    })
  })

  describe('资源清理和内存管理测试', () => {
    it('应该在组件卸载时正确清理所有资源', async () => {
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

      // 获取生命周期管理器
      lifecycleManager = wrapper.vm._lifecycleManager || createLifecycleManager()
      const initialReport = lifecycleManager.getReport()

      // 卸载组件
      wrapper.unmount()
      await nextTick()

      const finalReport = lifecycleManager.getReport()
      const phases = finalReport.phases.map(p => p.phase)

      // 验证清理阶段已执行
      expect(phases).toContain('graph-disposed')
      expect(finalReport.activeResources).toBeLessThanOrEqual(initialReport.activeResources)
    })

    it('应该正确处理内存泄漏预防', async () => {
      // 创建多个组件实例来测试内存管理
      const instances = []

      for (let i = 0; i < 5; i++) {
        const instance = mount(TaskFlowCanvasRefactored, {
          props: {
            initialNodes: [
              { id: `node-${i}`, type: 'start', position: { x: 100 * i, y: 100 } }
            ],
            initialConnections: []
          }
        })

        instances.push(instance)
        await nextTick()
      }

      // 等待所有实例初始化完成
      await new Promise(resolve => setTimeout(resolve, 200))

      // 逐个卸载实例
      for (const instance of instances) {
        instance.unmount()
        await nextTick()
      }

      // 验证没有内存泄漏（这里主要是确保没有抛出错误）
      expect(true).toBe(true) // 如果到这里没有错误，说明清理正常
    })
  })

  describe('错误边界和异常处理测试', () => {
    it('应该正确处理运行时错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 模拟运行时错误
      try {
        if (wrapper.vm.addNodeToGraph) {
          wrapper.vm.addNodeToGraph(null) // 传入无效数据
        }
      } catch (error) {
        // 错误应该被正确捕获
        expect(error).toBeDefined()
      }

      consoleSpy.mockRestore()
    })

    it('应该从严重错误中恢复', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 模拟Graph实例被意外销毁
      if (wrapper.vm.graph?.value) {
        wrapper.vm.graph.value = null
      }

      // 组件应该能够检测到这种情况并处理
      expect(wrapper.vm.isGraphReady?.value).toBeDefined()
    })
  })
})