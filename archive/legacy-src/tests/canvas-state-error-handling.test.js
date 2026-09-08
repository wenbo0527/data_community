import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import TaskFlowCanvasRefactored from '../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'

// Mock 依赖
vi.mock('@antv/x6', () => ({
  Graph: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    zoom: vi.fn(() => 1),
    centerContent: vi.fn(),
    zoomToFit: vi.fn(),
    getCells: vi.fn(() => []),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    addNode: vi.fn(),
    addEdge: vi.fn(),
    getCellById: vi.fn(),
    dispose: vi.fn(),
    clear: vi.fn()
  }))
}))

vi.mock('@antv/x6-vue-shape', () => ({
  register: vi.fn()
}))

vi.mock('@arco-design/web-vue', () => ({
  Message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock 组合函数
vi.mock('../pages/marketing/tasks/composables/useCanvasState.js', () => ({
  useCanvasState: vi.fn()
}))

vi.mock('../pages/marketing/tasks/composables/useCanvasCore.js', () => ({
  useCanvasCore: vi.fn(() => ({
    initializeGraph: vi.fn(),
    registerCustomEdgeShapes: vi.fn(),
    initializePlugins: vi.fn(),
    initializeMinimap: vi.fn(),
    calculateConnectionPoints: vi.fn(),
    destroyGraph: vi.fn(),
    resetGraph: vi.fn()
  }))
}))

vi.mock('../pages/marketing/tasks/composables/useCanvasEvents.js', () => ({
  useCanvasEvents: vi.fn(() => ({
    bindEvents: vi.fn(),
    handleNodeTypeSelected: vi.fn(),
    handleNodeDelete: vi.fn(),
    handleDeleteConnection: vi.fn(),
    closeNodeSelector: vi.fn()
  }))
}))

vi.mock('../pages/marketing/tasks/composables/useCanvasLifecycle.js', () => ({
  useCanvasLifecycle: vi.fn(() => ({
    initCanvas: vi.fn(),
    destroyCanvas: vi.fn(),
    resetCanvas: vi.fn(),
    handleResize: vi.fn(),
    handleKeydown: vi.fn(),
    waitForInitialization: vi.fn(),
    validateCanvasState: vi.fn()
  }))
}))

describe('TaskFlowCanvasRefactored - 状态错误处理', () => {
  let mockUseCanvasState

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 获取 mock 函数
    const { useCanvasState } = require('../pages/marketing/tasks/composables/useCanvasState.js')
    mockUseCanvasState = useCanvasState
  })

  describe('状态初始化错误处理', () => {
    it('应该处理 state 为 null 的情况', () => {
      // 模拟 useCanvasState 返回 null
      mockUseCanvasState.mockReturnValue(null)

      expect(() => {
        mount(TaskFlowCanvasRefactored, {
          props: {
            initialNodes: [],
            initialConnections: []
          }
        })
      }).toThrow('状态管理初始化失败 - state为null')
    })

    it('应该处理 state.nodes 为 null 的情况并自动修复', () => {
      // 模拟 useCanvasState 返回缺少 nodes 的状态
      const mockState = {
        nodes: null,
        connections: ref([]),
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      mockUseCanvasState.mockReturnValue(mockState)

      const wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 验证 state.nodes 被自动修复
      expect(mockState.nodes).toBeTruthy()
      expect(mockState.nodes.value).toEqual([])
    })

    it('应该处理 state.nodes.value 为 undefined 的情况', () => {
      // 模拟 useCanvasState 返回 nodes.value 为 undefined 的状态
      const mockState = {
        nodes: ref(undefined),
        connections: ref([]),
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      mockUseCanvasState.mockReturnValue(mockState)

      const wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 验证 state.nodes.value 被自动修复为空数组
      expect(Array.isArray(mockState.nodes.value)).toBe(true)
      expect(mockState.nodes.value).toEqual([])
    })

    it('应该处理 state.nodes.value 不是数组的情况', () => {
      // 模拟 useCanvasState 返回 nodes.value 不是数组的状态
      const mockState = {
        nodes: ref('not-an-array'),
        connections: ref([]),
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      mockUseCanvasState.mockReturnValue(mockState)

      const wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 验证 state.nodes.value 被自动修复为空数组
      expect(Array.isArray(mockState.nodes.value)).toBe(true)
      expect(mockState.nodes.value).toEqual([])
    })

    it('应该处理 state.connections 为 null 的情况并自动修复', () => {
      // 模拟 useCanvasState 返回缺少 connections 的状态
      const mockState = {
        nodes: ref([]),
        connections: null,
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      mockUseCanvasState.mockReturnValue(mockState)

      const wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 验证 state.connections 被自动修复
      expect(mockState.connections).toBeTruthy()
      expect(mockState.connections.value).toEqual([])
    })

    it('应该处理 state.connections.value 为 undefined 的情况', () => {
      // 模拟 useCanvasState 返回 connections.value 为 undefined 的状态
      const mockState = {
        nodes: ref([]),
        connections: ref(undefined),
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      mockUseCanvasState.mockReturnValue(mockState)

      const wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 验证 state.connections.value 被自动修复为空数组
      expect(Array.isArray(mockState.connections.value)).toBe(true)
      expect(mockState.connections.value).toEqual([])
    })
  })

  describe('状态访问安全性', () => {
    it('应该安全处理状态访问错误', () => {
      // 模拟正常状态
      const mockState = {
        nodes: ref([]),
        connections: ref([]),
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      mockUseCanvasState.mockReturnValue(mockState)

      const wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 验证组件正常挂载
      expect(wrapper.exists()).toBe(true)
    })

    it('应该在状态重新初始化后保持数据一致性', () => {
      // 模拟初始状态有问题的情况
      const mockState = {
        nodes: null,
        connections: null,
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      mockUseCanvasState.mockReturnValue(mockState)

      const wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [{ id: 'test-node', type: 'start' }],
          initialConnections: []
        }
      })

      // 验证状态被正确修复
      expect(mockState.nodes).toBeTruthy()
      expect(mockState.connections).toBeTruthy()
      expect(Array.isArray(mockState.nodes.value)).toBe(true)
      expect(Array.isArray(mockState.connections.value)).toBe(true)
    })
  })

  describe('边界情况处理', () => {
    it('应该处理状态重新初始化失败的情况', () => {
      // 模拟一个无法修复的状态对象
      const mockState = {
        nodes: null,
        connections: ref([]),
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      
      // 模拟 ref 函数抛出错误
      const originalRef = ref
      vi.mocked(ref).mockImplementation((value) => {
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          throw new Error('Mock ref initialization error')
        }
        return originalRef(value)
      })

      mockUseCanvasState.mockReturnValue(mockState)

      expect(() => {
        mount(TaskFlowCanvasRefactored, {
          props: {
            initialNodes: [],
            initialConnections: []
          }
        })
      }).toThrow('状态管理初始化失败')

      // 恢复原始的 ref 函数
      vi.mocked(ref).mockImplementation(originalRef)
    })

    it('应该处理多次状态修复的情况', () => {
      // 模拟状态在运行时被破坏的情况
      const mockState = {
        nodes: ref([]),
        connections: ref([]),
        isGraphReady: ref(false),
        selectedNodes: ref([]),
        configDrawers: {
          nodeConfig: ref({ visible: false }),
          startNodeConfig: ref({ visible: false })
        }
      }
      mockUseCanvasState.mockReturnValue(mockState)

      const wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: [],
          initialConnections: []
        }
      })

      // 模拟状态被破坏
      mockState.nodes.value = null

      // 触发重新渲染，应该自动修复状态
      wrapper.vm.$forceUpdate()

      // 验证状态仍然正常
      expect(wrapper.exists()).toBe(true)
    })
  })
})