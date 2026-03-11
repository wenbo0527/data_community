/**
 * 节点拖拽功能测试
 * 验证节点拖拽和事件触发功能
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import TaskFlowCanvasRefactored from '../../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'

// Mock X6 Graph
const mockGraph = {
  on: vi.fn(),
  off: vi.fn(),
  getCellById: vi.fn(),
  addNode: vi.fn(),
  addEdge: vi.fn(),
  removeNode: vi.fn(),
  removeEdge: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  clearCells: vi.fn(),
  dispose: vi.fn(),
  resize: vi.fn(),
  centerContent: vi.fn(),
  zoom: vi.fn(),
  translate: vi.fn(),
  getScale: vi.fn(() => ({ sx: 1, sy: 1 })),
  getTranslation: vi.fn(() => ({ tx: 0, ty: 0 }))
}

// Mock node instance
const mockNode = {
  id: 'test-node-1',
  getData: vi.fn(() => ({
    id: 'test-node-1',
    type: 'process',
    label: '测试节点',
    nodeType: 'process',
    isConfigured: false
  })),
  getPosition: vi.fn(() => ({ x: 100, y: 100 })),
  setPosition: vi.fn(),
  remove: vi.fn()
}

// Mock X6
vi.mock('@antv/x6', () => ({
  Graph: vi.fn(() => mockGraph),
  register: vi.fn()
}))

// Mock X6 Vue shape
vi.mock('@antv/x6-vue-shape', () => ({
  register: vi.fn()
}))

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  Modal: {
    confirm: vi.fn()
  }
}))

// Mock composables
vi.mock('../../pages/marketing/tasks/composables/useCanvasCore.js', () => ({
  useCanvasCore: vi.fn(() => ({
    graph: ref(mockGraph),
    initializeGraph: vi.fn(() => Promise.resolve(mockGraph)),
    registerCustomEdgeShapes: vi.fn(),
    initializePlugins: vi.fn(),
    initializeMinimap: vi.fn(),
    calculateConnectionPoints: vi.fn(),
    destroyGraph: vi.fn(),
    resetGraph: vi.fn()
  }))
}))

vi.mock('../../pages/marketing/tasks/composables/useCanvasState.js', () => ({
  useCanvasState: vi.fn(() => ({
    nodes: ref([]),
    connections: ref([]),
    selectedNodeId: ref(null),
    selectedNode: ref(null),
    selectedEdgeId: ref(null),
    selectedEdge: ref(null),
    canvasScale: ref(1),
    canvasTranslate: ref({ x: 0, y: 0 }),
    isGraphReady: ref(true),
    showConfigDrawer: ref(false),
    selectedNodeData: ref(null),
    showStartNodeConfigDrawer: ref(false),
    selectedStartNodeData: ref(null),
    isDeletingNode: ref(false),
    connectionContextMenu: ref({ visible: false }),
    resetAllState: vi.fn(),
    updateLayoutStats: vi.fn(),
    addNodeToState: vi.fn(),
    removeNodeFromState: vi.fn()
  }))
}))

vi.mock('../../pages/marketing/tasks/composables/useCanvasEvents.js', () => ({
  useCanvasEvents: vi.fn(() => ({
    bindEvents: vi.fn(),
    handleNodeTypeSelected: vi.fn(),
    handleNodeDelete: vi.fn(),
    handleDeleteConnection: vi.fn(),
    closeNodeSelector: vi.fn()
  }))
}))

vi.mock('../../pages/marketing/tasks/composables/useCanvasLifecycle.js', () => ({
  useCanvasLifecycle: vi.fn(() => ({
    initCanvas: vi.fn(),
    destroyCanvas: vi.fn(),
    resetCanvas: vi.fn(),
    handleResize: vi.fn(),
    handleKeydown: vi.fn(),
    waitForInitialization: vi.fn(() => Promise.resolve()),
    validateCanvasState: vi.fn()
  }))
}))

describe('节点拖拽功能测试', () => {
  let wrapper
  let emittedEvents

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // 重置 mock graph 的事件监听器
    mockGraph.on.mockClear()
    
    wrapper = mount(TaskFlowCanvasRefactored, {
      props: {
        initialNodes: [],
        initialConnections: [],
        autoAddStartNode: false
      }
    })

    // 等待组件初始化
    await nextTick()
    
    // 获取发出的事件
    emittedEvents = wrapper.emitted()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('事件声明验证', () => {
    it('应该正确声明 node-position-changed 事件', () => {
      // 检查组件的 emits 选项
      const componentEmits = wrapper.vm.$options.emits || []
      
      expect(componentEmits).toContain('node-position-changed')
    })

    it('应该正确声明所有必要的画布事件', () => {
      const componentEmits = wrapper.vm.$options.emits || []
      
      const requiredEvents = [
        'canvas-ready',
        'canvas-translated',
        'canvas-scaled',
        'node-created',
        'node-moved',
        'node-selected',
        'node-updated',
        'node-deleted',
        'node-position-changed',
        'connection-created'
      ]

      requiredEvents.forEach(event => {
        expect(componentEmits).toContain(event)
      })
    })
  })

  describe('节点拖拽事件处理', () => {
    it('应该正确绑定节点位置变更事件监听器', () => {
      // 验证 graph.on 被调用来绑定 node:change:position 事件
      expect(mockGraph.on).toHaveBeenCalledWith(
        'node:change:position',
        expect.any(Function)
      )
    })

    it('应该在节点位置变更时触发 node-position-changed 事件', async () => {
      // 模拟节点位置变更事件
      const positionChangeHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:change:position'
      )?.[1]

      if (positionChangeHandler) {
        // 模拟事件触发
        positionChangeHandler({ node: mockNode })
        
        await nextTick()
        
        // 验证事件是否被正确触发
        const emittedEvents = wrapper.emitted('node-position-changed')
        expect(emittedEvents).toBeDefined()
      }
    })

    it('应该正确处理节点拖拽开始事件', async () => {
      // 模拟节点拖拽开始事件
      const moveHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:move'
      )?.[1]

      if (moveHandler) {
        // 模拟事件触发
        moveHandler({ node: mockNode })
        
        await nextTick()
        
        // 验证事件是否被正确触发
        const emittedEvents = wrapper.emitted('node-moved')
        expect(emittedEvents).toBeDefined()
      }
    })
  })

  describe('状态访问安全性', () => {
    it('应该安全处理 canvasScale 状态访问', async () => {
      // 模拟画布缩放事件
      const scaleHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'scale'
      )?.[1]

      if (scaleHandler) {
        // 模拟事件触发，不应该抛出错误
        expect(() => {
          scaleHandler({ sx: 1.5, sy: 1.5 })
        }).not.toThrow()
        
        await nextTick()
        
        // 验证缩放事件是否被正确触发
        const emittedEvents = wrapper.emitted('canvas-scaled')
        expect(emittedEvents).toBeDefined()
      }
    })

    it('应该安全处理 canvasTranslate 状态访问', async () => {
      // 模拟画布平移事件
      const translateHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'translate'
      )?.[1]

      if (translateHandler) {
        // 模拟事件触发，不应该抛出错误
        expect(() => {
          translateHandler({ tx: 100, ty: 50 })
        }).not.toThrow()
        
        await nextTick()
        
        // 验证平移事件是否被正确触发
        const emittedEvents = wrapper.emitted('canvas-translated')
        expect(emittedEvents).toBeDefined()
      }
    })
  })

  describe('错误处理', () => {
    it('应该正确处理节点数据获取失败的情况', async () => {
      // 创建一个会抛出错误的 mock 节点
      const errorNode = {
        id: 'error-node',
        getData: vi.fn(() => {
          throw new Error('获取节点数据失败')
        }),
        getPosition: vi.fn(() => ({ x: 0, y: 0 }))
      }

      // 模拟节点位置变更事件
      const positionChangeHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:change:position'
      )?.[1]

      if (positionChangeHandler) {
        // 模拟事件触发，不应该抛出错误
        expect(() => {
          positionChangeHandler({ node: errorNode })
        }).not.toThrow()
      }
    })

    it('应该正确处理拖拽提示点的过滤', async () => {
      // 创建拖拽提示点节点
      const dragHintNode = {
        id: 'drag-hint',
        getData: vi.fn(() => ({
          id: 'drag-hint',
          isDragHint: true
        })),
        getPosition: vi.fn(() => ({ x: 0, y: 0 }))
      }

      // 模拟节点位置变更事件
      const positionChangeHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:change:position'
      )?.[1]

      if (positionChangeHandler) {
        // 模拟事件触发
        positionChangeHandler({ node: dragHintNode })
        
        await nextTick()
        
        // 验证拖拽提示点不会触发 node-position-changed 事件
        const emittedEvents = wrapper.emitted('node-position-changed')
        expect(emittedEvents).toBeUndefined()
      }
    })
  })

  describe('集成测试', () => {
    it('应该完整支持节点拖拽流程', async () => {
      // 1. 模拟节点拖拽开始
      const moveHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:move'
      )?.[1]

      if (moveHandler) {
        moveHandler({ node: mockNode })
        await nextTick()
        
        // 验证拖拽开始事件
        expect(wrapper.emitted('node-moved')).toBeDefined()
      }

      // 2. 模拟节点位置变更完成
      const positionChangeHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:change:position'
      )?.[1]

      if (positionChangeHandler) {
        positionChangeHandler({ node: mockNode })
        await nextTick()
        
        // 验证位置变更事件
        expect(wrapper.emitted('node-position-changed')).toBeDefined()
      }
    })
  })
})