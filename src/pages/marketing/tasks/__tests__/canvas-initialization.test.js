import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TaskFlowCanvas from '../components/TaskFlowCanvas.vue'

// Mock X6 Graph
vi.mock('@antv/x6', () => {
  const MockGraph = vi.fn().mockImplementation((config) => {
    const mockGraph = {
      on: vi.fn(),
      off: vi.fn(),
      addCell: vi.fn(),
      removeCell: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getData: vi.fn(() => ({})),
      getCells: vi.fn(() => []),
      getCellById: vi.fn(),
      dispose: vi.fn(),
      disposePlugin: vi.fn(),
      enableHistory: vi.fn(),
      canUndo: vi.fn(() => false),
      canRedo: vi.fn(() => false),
      undo: vi.fn(),
      redo: vi.fn(),
      use: vi.fn().mockReturnThis(),
      transform: vi.fn(),
      translate: vi.fn(),
      zoom: vi.fn(),
      zoomTo: vi.fn(),
      zoomToFit: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      fitToContent: vi.fn(),
      centerContent: vi.fn(),
      toJSON: vi.fn(() => ({ cells: [] })),
      fromJSON: vi.fn(),
      clearCells: vi.fn(),
      resize: vi.fn(),
      getTransform: vi.fn(() => ({ tx: 0, ty: 0, sx: 1, sy: 1 })),
      addNode: vi.fn((nodeConfig) => {
        // 返回一个模拟的节点对象
        const mockNode = {
          id: nodeConfig.id || 'mock-node-id',
          data: nodeConfig.data || {},
          store: {
            data: {
              data: nodeConfig.data || {}
            }
          },
          getPosition: vi.fn(() => ({ x: 0, y: 0 })),
          setPosition: vi.fn(),
          getData: vi.fn(() => nodeConfig.data || {}),
          setData: vi.fn()
        }
        return mockNode
      }),
      addEdge: vi.fn(),
      history: {
        enabled: config?.history === true || config?.history?.enabled === true,
        undoStack: [],
        redoStack: [],
        clear: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        canUndo: vi.fn(() => false),
        canRedo: vi.fn(() => false),
        options: {
          enabled: config?.history === true || config?.history?.enabled === true
        }
      },
      container: config?.container,
      clearSelection: vi.fn(),
      getSelectedCells: vi.fn(() => []),
      scroller: {
        enabled: true,
        pannable: false,
        enableAutoResize: vi.fn(),
        options: {
          enabled: true,
          pannable: false
        }
      }
    }
    return mockGraph
  })
  
  // 添加静态方法
  MockGraph.registerEdge = vi.fn()
  MockGraph.registerNode = vi.fn()
  
  return {
     Graph: MockGraph,
     Node: {
       registry: {
         get: vi.fn(),
         register: vi.fn()
       }
     },
     // 添加所有需要的插件Mock
     Export: vi.fn().mockImplementation(() => ({
       name: 'export',
       install: vi.fn()
     })),
     Selection: vi.fn().mockImplementation(() => ({
       name: 'selection',
       install: vi.fn()
     })),
     Snapline: vi.fn().mockImplementation(() => ({
       name: 'snapline',
       install: vi.fn()
     })),
     Keyboard: vi.fn().mockImplementation(() => ({
       name: 'keyboard',
       install: vi.fn()
     })),
     Clipboard: vi.fn().mockImplementation(() => ({
       name: 'clipboard',
       install: vi.fn()
     })),
     History: vi.fn().mockImplementation(() => ({
       name: 'history',
       install: vi.fn()
     })),
     MiniMap: vi.fn().mockImplementation(() => ({
       name: 'minimap',
       install: vi.fn()
     }))
   }
 })

// Mock other dependencies
vi.mock('../utils/canvas/GraphOperationUtils.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    addNode: vi.fn(),
    removeNode: vi.fn(),
    updateNode: vi.fn(),
    addConnection: vi.fn(),
    removeConnection: vi.fn()
  }))
}))

vi.mock('../utils/canvas/canvasValidation.js', () => ({
  validateCanvasData: vi.fn(() => ({ isValid: true, errors: [], warnings: [] }))
}))

vi.mock('../utils/canvas/DataTransformUtils.js', () => ({
  default: {
    format: {
      nodeData: vi.fn((data) => ({
        id: data.id || 'test-id',
        type: data.type || 'start',
        x: typeof data.x === 'number' ? data.x : 0,
        y: typeof data.y === 'number' ? data.y : 0,
        width: data.width || 120,
        height: data.height || 80,
        label: data.label || 'Test Node'
      }))
    },
    validate: {
      nodeData: vi.fn(() => ({ isValid: true, errors: [] })),
      coordinates: vi.fn(() => true)
    }
  }
}))

// Mock composables
vi.mock('../composables/canvas/useCanvasNodes.js', () => ({
  useCanvasNodes: vi.fn(() => ({
    nodes: { value: [] },
    addNodeToGraph: vi.fn(),
    removeNodeFromGraph: vi.fn(),
    updateNodeInGraph: vi.fn(),
    formatNodeData: vi.fn((data) => data)
  }))
}))

vi.mock('../composables/canvas/useCanvasConnections.js', () => ({
  useCanvasConnections: vi.fn(() => ({
    connections: { value: [] },
    addConnectionToGraph: vi.fn(),
    removeConnectionFromGraph: vi.fn()
  }))
}))

vi.mock('../composables/canvas/useCanvasHistory.js', () => ({
  useCanvasHistory: vi.fn(() => ({
    canUndo: { value: false },
    canRedo: { value: false },
    historyStack: { value: [] },
    setupHistoryListeners: vi.fn(),
    removeHistoryListeners: vi.fn(),
    saveHistoryState: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn()
  }))
}))

vi.mock('../composables/canvas/useCanvasLayout.js', () => ({
  useCanvasLayout: vi.fn(() => ({
    initializeLayoutEngine: vi.fn(),
    autoLayout: vi.fn(),
    resetLayout: vi.fn()
  }))
}))

// Mock registerCustomShapes
vi.mock('../utils/canvas/registerCustomShapes.js', () => ({
  default: vi.fn(),
  registerCustomShapes: vi.fn()
}))

// Mock CanvasPanZoomManager
vi.mock('../utils/canvas/CanvasPanZoomManager.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    enable: vi.fn(),
    disable: vi.fn(),
    destroy: vi.fn()
  })),
  CanvasPanZoomManager: vi.fn().mockImplementation(() => ({
    enable: vi.fn(),
    disable: vi.fn(),
    destroy: vi.fn()
  }))
}))

// Mock EdgeOverlapManager
vi.mock('../utils/canvas/EdgeOverlapManager.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    enable: vi.fn(),
    disable: vi.fn(),
    destroy: vi.fn(),
    cleanup: vi.fn()
  })),
  EdgeOverlapManager: vi.fn().mockImplementation(() => ({
    enable: vi.fn(),
    disable: vi.fn(),
    destroy: vi.fn(),
    cleanup: vi.fn()
  }))
}))

// Mock CoordinateSystemManager
vi.mock('../utils/canvas/CoordinateSystemManager.js', () => ({
  coordinateManager: {
    setGraph: vi.fn(),
    setDebugMode: vi.fn()
  }
}))

// Mock useConfigDrawers
vi.mock('../composables/canvas/useConfigDrawers.js', () => ({
  useConfigDrawers: vi.fn(() => ({
    drawerStates: {
      start: { visible: false, data: {} },
      'crowd-split': { visible: false, data: {} },
      'event-split': { visible: false, data: {} },
      'ab-test': { visible: false, data: {} },
      'ai-call': { visible: false, data: {} },
      sms: { visible: false, data: {} },
      'manual-call': { visible: false, data: {} },
      wait: { visible: false, data: {} },
      benefit: { visible: false, data: {} }
    },
    structuredLayout: {
      initializeLayoutEngine: vi.fn(),
      createLayoutEngineInstance: vi.fn()
    },
    openConfigDrawer: vi.fn()
  }))
}))

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  AButtonGroup: {
    name: 'AButtonGroup',
    template: '<div><slot /></div>'
  },
  AButton: {
    name: 'AButton',
    template: '<button><slot /></button>'
  },
  ATooltip: {
    name: 'ATooltip',
    template: '<div><slot /></div>'
  },
  ADrawer: {
    name: 'ADrawer',
    template: '<div><slot /></div>'
  },
  AForm: {
    name: 'AForm',
    template: '<div><slot /></div>'
  },
  AFormItem: {
    name: 'AFormItem',
    template: '<div><slot /></div>'
  },
  AInput: {
    name: 'AInput',
    template: '<input />'
  },
  ASelect: {
    name: 'ASelect',
    template: '<select><slot /></select>'
  },
  AOption: {
    name: 'AOption',
    template: '<option><slot /></option>'
  }
}))

describe('画布初始化测试', () => {
  let wrapper
  let mockContainer

  beforeEach(async () => {
    // 创建模拟容器
    mockContainer = {
      clientWidth: 800,
      clientHeight: 600,
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
    
    // Mock DOM methods
    global.document.getElementById = vi.fn(() => mockContainer)
    
    // Mock clientWidth and clientHeight as getters
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      get: () => 800,
      configurable: true
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      get: () => 600,
      configurable: true
    })
    
    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础初始化测试', () => {
    it('应该成功创建Graph实例', async () => {
      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      
      const { Graph } = await import('@antv/x6')
      expect(Graph).toHaveBeenCalledWith(
        expect.objectContaining({
          container: expect.any(Object),
          width: 800,
          height: 600,
          history: expect.objectContaining({
            enabled: true
          })
        })
      )
    })

    it('应该启用历史记录功能', async () => {
      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      
      const { Graph } = await import('@antv/x6')
      const graphConfig = Graph.mock.calls[0][0]
      expect(graphConfig.history).toBeDefined()
      expect(graphConfig.history.enabled).toBe(true)
    })

    it('应该正确设置画布容器尺寸', async () => {
      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      
      const { Graph } = await import('@antv/x6')
      const graphConfig = Graph.mock.calls[0][0]
      expect(graphConfig.width).toBe(800)
      expect(graphConfig.height).toBe(600)
    })
  })

  describe('节点位置验证测试', () => {
    it('应该正确验证有效的节点位置数据', async () => {
      const validNode = {
        id: 'test-node-1',
        type: 'start',
        x: 100,
        y: 200,
        width: 120,
        height: 80,
        label: '开始节点'
      }

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [validNode],
          initialConnections: []
        }
      })

      await nextTick()
      
      // 验证节点数据格式化被调用
      const { default: DataTransformUtils } = await import('../utils/canvas/DataTransformUtils.js')
      expect(DataTransformUtils.format.nodeData).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-node-1',
          x: 100,
          y: 200
        })
      )
    })

    it('应该处理无效的节点位置数据', async () => {
      const invalidNode = {
        id: 'test-node-2',
        type: 'start',
        x: 'invalid',
        y: null,
        width: 120,
        height: 80,
        label: '无效节点'
      }

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [invalidNode],
          initialConnections: []
        }
      })

      await nextTick()
      
      // 验证数据转换工具被调用，应该将无效坐标转换为0
      const { default: DataTransformUtils } = await import('../utils/canvas/DataTransformUtils.js')
      expect(DataTransformUtils.format.nodeData).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-node-2',
          x: 'invalid',
          y: null
        })
      )
    })

    it('应该处理缺少位置信息的节点', async () => {
      const nodeWithoutPosition = {
        id: 'test-node-3',
        type: 'start',
        width: 120,
        height: 80,
        label: '无位置节点'
      }

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [nodeWithoutPosition],
          initialConnections: []
        }
      })

      await nextTick()
      
      // 验证数据转换工具被调用
      const { default: DataTransformUtils } = await import('../utils/canvas/DataTransformUtils.js')
      expect(DataTransformUtils.format.nodeData).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-node-3'
        })
      )
    })
  })

  describe('初始数据加载测试', () => {
    it('应该正确加载多个初始节点', async () => {
      const initialNodes = [
        {
          id: 'start-node',
          type: 'start',
          x: 100,
          y: 100,
          width: 120,
          height: 80,
          label: '开始'
        },
        {
          id: 'task-node',
          type: 'sms',
          x: 300,
          y: 200,
          width: 120,
          height: 80,
          label: '短信任务'
        }
      ]

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes,
          initialConnections: []
        }
      })

      await nextTick()
      
      // 验证每个节点都被处理
      const { default: DataTransformUtils } = await import('../utils/canvas/DataTransformUtils.js')
      expect(DataTransformUtils.format.nodeData).toHaveBeenCalledTimes(2)
    })

    it('应该在autoAddStartNode为true且无初始节点时创建默认开始节点', async () => {
      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: true,
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      
      // 验证创建了默认开始节点
      const { default: DataTransformUtils } = await import('../utils/canvas/DataTransformUtils.js')
      expect(DataTransformUtils.format.nodeData).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'start',
          label: '开始'
        })
      )
    })

    it('应该正确加载初始连接', async () => {
      const initialNodes = [
        { id: 'node1', type: 'start', x: 100, y: 100, width: 120, height: 80, label: '节点1' },
        { id: 'node2', type: 'sms', x: 300, y: 100, width: 120, height: 80, label: '节点2' }
      ]
      
      const initialConnections = [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
          type: 'edge'
        }
      ]

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes,
          initialConnections
        }
      })

      await nextTick()
      
      // 验证连接数据被处理
      const { validateCanvasData } = await import('../utils/canvas/canvasValidation.js')
      expect(validateCanvasData).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: expect.any(Array),
          connections: expect.arrayContaining([
            expect.objectContaining({
              source: 'node1',
              target: 'node2'
            })
          ])
        })
      )
    })
  })

  describe('历史记录初始化测试', () => {
    it('应该在Graph配置中启用历史记录', async () => {
      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      
      const graphConfig = Graph.mock.calls[0][0]
      expect(graphConfig.history).toEqual(
        expect.objectContaining({
          enabled: true,
          beforeAddCommand: expect.any(Function),
          afterAddCommand: expect.any(Function)
        })
      )
    })

    it('应该设置历史记录事件监听器', async () => {
      const mockGraph = {
        on: vi.fn(),
        off: vi.fn(),
        history: { enabled: true, undoStack: [], redoStack: [] },
        canUndo: vi.fn(() => false),
        canRedo: vi.fn(() => false)
      }
      
      Graph.mockImplementation(() => mockGraph)

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      
      // 验证历史记录相关事件监听器被设置
      expect(mockGraph.on).toHaveBeenCalledWith('history:undo', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('history:redo', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('history:change', expect.any(Function))
    })
  })

  describe('错误处理测试', () => {
    it('应该处理Graph实例创建失败的情况', async () => {
      Graph.mockImplementation(() => {
        throw new Error('Graph创建失败')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('图形实例初始化失败'),
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })

    it('应该处理无效的容器元素', async () => {
      global.document.getElementById = vi.fn(() => null)
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: [],
          initialConnections: []
        }
      })

      await nextTick()
      
      // 应该有错误日志
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('数据验证集成测试', () => {
    it('应该在加载初始数据时进行完整的数据验证', async () => {
      const testData = {
        nodes: [
          {
            id: 'test-node',
            type: 'start',
            x: 100,
            y: 200,
            width: 120,
            height: 80,
            label: '测试节点'
          }
        ],
        connections: []
      }

      wrapper = mount(TaskFlowCanvas, {
        props: {
          autoAddStartNode: false,
          initialNodes: testData.nodes,
          initialConnections: testData.connections
        }
      })

      await nextTick()
      
      // 验证数据验证函数被调用
      const { validateCanvasData } = await import('../utils/canvas/canvasValidation.js')
      expect(validateCanvasData).toHaveBeenCalled()
    })
  })
})