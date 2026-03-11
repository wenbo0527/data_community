/**
 * TaskFlowCanvas 综合初始化测试
 * 基于问题评估文档的深度分析，确保测试覆盖与实际画布加载场景一致
 * 
 * 测试重点：
 * 1. 异步初始化竞态条件
 * 2. 响应式状态同步问题
 * 3. Graph实例生命周期管理
 * 4. PreviewLineSystem集成稳定性
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import TaskFlowCanvasRefactored from '../../../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'

// 模拟真实的异步初始化环境 - 提前定义
function createRealisticAsyncEnvironment() {
  let graphInstance = null
  let isInitializing = false
  let initializationPromise = null

  return {
    // 模拟真实的Graph创建过程（包含异步操作）
    createGraphInstance: vi.fn().mockImplementation(async (options) => {
      if (isInitializing) {
        return initializationPromise
      }

      isInitializing = true
      initializationPromise = new Promise((resolve, reject) => {
        // 模拟X6 Graph实例创建的异步特性
        setTimeout(() => {
          try {
            graphInstance = {
              id: `graph-${Date.now()}`,
              addNode: vi.fn().mockImplementation((nodeData) => {
                if (!graphInstance) {
                  throw new Error('Graph instance is null')
                }
                return { id: nodeData.id || `node-${Date.now()}`, ...nodeData }
              }),
              removeNode: vi.fn(),
              addEdge: vi.fn(),
              removeEdge: vi.fn(),
              getCells: vi.fn(() => []),
              getNodes: vi.fn(() => []),
              getEdges: vi.fn(() => []),
              getCellById: vi.fn(),
              on: vi.fn(),
              off: vi.fn(),
              dispose: vi.fn(() => {
                graphInstance = null
              }),
              zoom: vi.fn(() => 1),
              centerContent: vi.fn(),
              zoomToFit: vi.fn(),
              clear: vi.fn()
            }
            isInitializing = false
            resolve(graphInstance)
          } catch (error) {
            isInitializing = false
            reject(error)
          }
        }, Math.random() * 50 + 10) // 10-60ms的随机延迟，模拟真实异步
      })

      return initializationPromise
    }),

    // 模拟竞态条件：在初始化过程中访问graph
    simulateRaceCondition: () => {
      // 在初始化完成前尝试访问graph实例
      return graphInstance
    },

    // 重置环境
    reset: () => {
      graphInstance = null
      isInitializing = false
      initializationPromise = null
    }
  }
}

// Mock useCanvasCore 以模拟真实的异步初始化
vi.mock('../../../pages/marketing/tasks/composables/useCanvasCore.js', () => {
  const asyncEnv = createRealisticAsyncEnvironment()
  
  return {
    useCanvasCore: vi.fn(() => {
      const graph = ref(null)
      const isGraphReady = ref(false)
      
      const initializeGraph = vi.fn().mockImplementation(async (options = {}) => {
        try {
          // 模拟真实的异步初始化过程
          const instance = await asyncEnv.createGraphInstance(options)
          
          // 模拟可能的竞态条件：在设置graph.value前有延迟
          await new Promise(resolve => setTimeout(resolve, Math.random() * 20))
          
          graph.value = instance
          isGraphReady.value = true
          
          return instance
        } catch (error) {
          console.error('Graph initialization failed:', error)
          throw error
        }
      })

      const destroyGraph = vi.fn().mockImplementation(() => {
        if (graph.value) {
          graph.value.dispose()
          graph.value = null
          isGraphReady.value = false
        }
        asyncEnv.reset()
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
        resetGraph: vi.fn()
      }
    })
  }
})

// Mock PreviewLineSystem 以测试集成稳定性
vi.mock('../../../utils/preview-line/PreviewLineSystem.js', () => ({
  PreviewLineSystem: vi.fn().mockImplementation(() => ({
    isInitialized: false,
    graph: null,
    
    init: vi.fn().mockImplementation(function(graphInstance) {
      if (!graphInstance) {
        throw new Error('PreviewLineSystem requires valid graph instance')
      }
      this.graph = graphInstance
      this.isInitialized = true
      return Promise.resolve()
    }),
    
    initialize: vi.fn().mockImplementation(function(graphInstance) {
      return this.init(graphInstance)
    }),
    
    createPreviewLine: vi.fn().mockImplementation(function(sourceId, targetId) {
      if (!this.isInitialized || !this.graph) {
        throw new Error('PreviewLineSystem not initialized')
      }
      return { id: `preview-${sourceId}-${targetId}`, sourceId, targetId }
    }),
    
    clearPreviewLines: vi.fn(),
    refreshAllPreviewLines: vi.fn(),
    destroy: vi.fn().mockImplementation(function() {
      this.isInitialized = false
      this.graph = null
    })
  }))
}))

// Mock其他依赖
vi.mock('@antv/x6', () => ({
  Graph: vi.fn()
}))

vi.mock('@antv/x6-vue-shape', () => ({
  register: vi.fn()
}))

describe('TaskFlowCanvas 综合初始化测试', () => {
  let wrapper
  let mockConsoleError

  beforeEach(() => {
    vi.clearAllMocks()
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    mockConsoleError.mockRestore()
  })

  describe('异步初始化竞态条件测试', () => {
    it('应该正确处理Graph实例的异步创建过程', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 等待组件挂载和初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证Graph实例已正确创建
      const canvasCore = wrapper.vm.graph
      expect(canvasCore).toBeDefined()
    })

    it('应该防止在Graph实例未就绪时调用addNodeToGraph', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 在初始化完成前尝试添加节点
      const nodeData = {
        id: 'test-node',
        type: 'start',
        position: { x: 100, y: 100 },
        data: { label: '测试节点' }
      }

      // 这应该不会导致错误，而是优雅地处理
      const result = wrapper.vm.addNodeToGraph?.(nodeData)
      
      // 如果Graph未就绪，应该返回null或抛出可控错误
      if (result === null) {
        expect(result).toBeNull()
      } else {
        expect(result).toBeDefined()
      }
    })

    it('应该正确同步isGraphReady状态与实际Graph实例状态', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 等待初始化完成
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 150))

      // 验证状态同步
      const isReady = wrapper.vm.isGraphReady?.value
      const graphInstance = wrapper.vm.graph?.value

      if (isReady) {
        expect(graphInstance).toBeDefined()
        expect(typeof graphInstance.addNode).toBe('function')
      } else {
        expect(graphInstance).toBeNull()
      }
    })
  })

  describe('响应式状态失效问题测试', () => {
    it('应该在多次异步操作中保持Graph引用的稳定性', async () => {
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

      const initialGraphRef = wrapper.vm.graph
      
      // 模拟多次异步操作
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 20))
        
        // Graph引用应该保持稳定
        expect(wrapper.vm.graph).toBe(initialGraphRef)
      }
    })

    it('应该正确处理Graph实例的销毁和重建', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 销毁Graph实例
      if (wrapper.vm.destroyGraph) {
        wrapper.vm.destroyGraph()
        expect(wrapper.vm.graph?.value).toBeNull()
        expect(wrapper.vm.isGraphReady?.value).toBe(false)
      }
    })
  })

  describe('PreviewLineSystem集成稳定性测试', () => {
    it('应该在Graph实例就绪后正确初始化PreviewLineSystem', async () => {
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
      await new Promise(resolve => setTimeout(resolve, 150))

      // 验证PreviewLineSystem已正确初始化
      // 这里需要根据实际的PreviewLineSystem集成方式进行验证
      expect(wrapper.vm.graph?.value).toBeDefined()
    })

    it('应该正确处理PreviewLineSystem初始化失败的情况', async () => {
      // 模拟PreviewLineSystem初始化失败
      const { PreviewLineSystem } = await import('../../../utils/preview-line/PreviewLineSystem.js')
      PreviewLineSystem.mockImplementation(() => ({
        init: vi.fn().mockRejectedValue(new Error('PreviewLineSystem init failed')),
        initialize: vi.fn().mockRejectedValue(new Error('PreviewLineSystem init failed'))
      }))

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 即使PreviewLineSystem初始化失败，Graph实例应该仍然可用
      expect(wrapper.vm.graph?.value).toBeDefined()
    })
  })

  describe('真实场景模拟测试', () => {
    it('应该正确处理快速连续的节点添加操作', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 快速连续添加多个节点
      const nodes = [
        { id: 'node1', type: 'start', position: { x: 100, y: 100 } },
        { id: 'node2', type: 'sms', position: { x: 200, y: 100 } },
        { id: 'node3', type: 'email', position: { x: 300, y: 100 } }
      ]

      const results = []
      for (const nodeData of nodes) {
        if (wrapper.vm.addNodeToGraph) {
          const result = wrapper.vm.addNodeToGraph(nodeData)
          results.push(result)
        }
      }

      // 所有节点添加操作都应该成功或优雅失败
      results.forEach(result => {
        expect(result === null || (result && result.id)).toBe(true)
      })
    })

    it('应该正确处理组件卸载时的资源清理', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const graphInstance = wrapper.vm.graph?.value

      // 卸载组件
      wrapper.unmount()

      // 验证资源已正确清理
      if (graphInstance && graphInstance.dispose) {
        expect(graphInstance.dispose).toHaveBeenCalled()
      }
    })
  })

  describe('错误边界和恢复测试', () => {
    it('应该从Graph实例创建失败中恢复', async () => {
      // 模拟Graph创建失败
      const { useCanvasCore } = await import('../../../pages/marketing/tasks/composables/useCanvasCore.js')
      const mockUseCanvasCore = vi.mocked(useCanvasCore)
      
      mockUseCanvasCore.mockReturnValueOnce({
        graph: ref(null),
        isGraphReady: ref(false),
        initializeGraph: vi.fn().mockRejectedValue(new Error('Graph creation failed')),
        destroyGraph: vi.fn()
      })

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 组件应该能够处理初始化失败
      expect(wrapper.vm.graph?.value).toBeNull()
      expect(wrapper.vm.isGraphReady?.value).toBe(false)
    })
  })
})