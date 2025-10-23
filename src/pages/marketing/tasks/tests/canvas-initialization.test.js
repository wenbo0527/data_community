/**
 * 画布初始化自动化测试
 * 验证初始化时序和错误处理机制
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TaskFlowCanvasRefactored from '../components/TaskFlowCanvasRefactored.vue'

// Mock X6 Graph
vi.mock('@antv/x6', () => ({
  Graph: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    dispose: vi.fn(),
    addNode: vi.fn(),
    addEdge: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    zoom: vi.fn(),
    centerContent: vi.fn(),
    clearCells: vi.fn(),
    fromJSON: vi.fn(),
    toJSON: vi.fn(() => ({ cells: [] })),
    use: vi.fn(),
    disposePlugin: vi.fn()
  }))
}))

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  },
  Modal: {
    confirm: vi.fn()
  }
}))

// Mock DOM environment for testing
Object.defineProperty(window, 'HTMLElement', {
  value: class MockHTMLElement {
    constructor() {
      this.style = {}
      this.classList = {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn()
      }
    }
  }
})

describe('Canvas Initialization Tests', () => {
  let wrapper
  let mockContainer

  beforeEach(() => {
    // 清理控制台spy
    vi.clearAllMocks()
    
    // 创建全局DOM容器
    mockContainer = document.createElement('div')
    mockContainer.className = 'canvas-container'
    mockContainer.style.width = '800px'
    mockContainer.style.height = '600px'
    document.body.appendChild(mockContainer)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer)
    }
  })

  describe('DOM容器检测', () => {
    it('应该在DOM容器存在时成功初始化', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        },
        global: {
          stubs: {
            'canvas-minimap': true,
            'canvas-history-panel': true,
            'node-type-selector': true,
            'start-node-config-drawer': true,
            'node-config-drawer': true
          }
        }
      })

      // 等待组件挂载和初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))

      // 验证容器检测日志
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useCanvasLifecycle] 容器元素获取成功')
      )
    })

    it('应该在DOM容器不存在时抛出错误', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      // 移除容器
      if (mockContainer.parentNode) {
        mockContainer.parentNode.removeChild(mockContainer)
      }

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        },
        global: {
          stubs: {
            'canvas-minimap': true,
            'canvas-history-panel': true,
            'node-type-selector': true,
            'start-node-config-drawer': true,
            'node-config-drawer': true
          }
        }
      })

      // 等待初始化尝试
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误日志
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TaskFlowCanvas] 组件初始化失败'),
        expect.any(Error)
      )
    })
  })

  describe('Graph实例初始化', () => {
    it('应该在Graph实例创建成功时正确绑定事件', async () => {
      // 创建模拟的DOM容器
      mockContainer = document.createElement('div')
      mockContainer.className = 'canvas-container'
      document.body.appendChild(mockContainer)
      
      const consoleSpy = vi.spyOn(console, 'log')
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        },
        attachTo: mockContainer
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // 验证Graph实例初始化日志
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useCanvasLifecycle] X6图实例初始化成功')
      )

      // 验证事件绑定日志
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useCanvasLifecycle] 事件监听器绑定完成')
      )
    })

    it('应该在Graph实例创建失败时处理错误', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      // Mock Graph构造函数抛出错误
      const { Graph } = await import('@antv/x6')
      Graph.mockImplementationOnce(() => {
        throw new Error('Graph initialization failed')
      })

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误处理
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TaskFlowCanvas] 组件初始化失败'),
        expect.any(Error)
      )
    })
  })

  describe('事件绑定安全性', () => {
    it('应该在graph实例不存在时安全处理事件绑定', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        }
      })

      // 模拟graph实例为null的情况
      const component = wrapper.vm
      if (component.graph) {
        component.graph.value = null
      }

      await nextTick()

      // 验证安全处理
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useCanvasEvents] 图形实例不存在，无法绑定事件')
      )
    })

    it('应该验证graph实例存在后再调用on方法', async () => {
      // 创建模拟的DOM容器
      mockContainer = document.createElement('div')
      mockContainer.className = 'canvas-container'
      document.body.appendChild(mockContainer)
      
      const mockGraph = {
        on: vi.fn(),
        off: vi.fn(),
        dispose: vi.fn()
      }

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        },
        attachTo: mockContainer
      })

      // 设置有效的graph实例
      const component = wrapper.vm
      if (component.graph) {
        component.graph.value = mockGraph
      }

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证on方法被调用
      expect(mockGraph.on).toHaveBeenCalled()
    })
  })

  describe('初始化时序管理', () => {
    it('应该按正确顺序执行初始化步骤', async () => {
      // 创建模拟的DOM容器
      mockContainer = document.createElement('div')
      mockContainer.className = 'canvas-container'
      document.body.appendChild(mockContainer)
      
      const consoleSpy = vi.spyOn(console, 'log')
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        },
        attachTo: mockContainer
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))

      const logs = consoleSpy.mock.calls.map(call => call[0])
      
      // 验证初始化顺序
      const initStartIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] 开始初始化画布')
      )
      const containerFoundIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] 容器元素获取成功')
      )
      const graphInitIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] X6图实例初始化成功')
      )
      const eventsBindIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] 事件监听器绑定完成')
      )

      // 验证顺序正确
      expect(initStartIndex).toBeLessThan(containerFoundIndex)
      expect(containerFoundIndex).toBeLessThan(graphInitIndex)
      expect(graphInitIndex).toBeLessThan(eventsBindIndex)
    })

    it('应该在初始化失败时正确清理状态', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误处理和状态清理
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      // 验证组件状态
      const component = wrapper.vm
      expect(component.isInitializing).toBe(false)
    })
  })

  describe('防御性编程验证', () => {
    it('应该在所有关键点进行null检查', async () => {
      // 创建模拟的DOM容器
      mockContainer = document.createElement('div')
      mockContainer.className = 'canvas-container'
      document.body.appendChild(mockContainer)
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        },
        attachTo: mockContainer
      })

      const component = wrapper.vm

      // 测试各种null情况的处理
      expect(() => {
        // 模拟各种可能的null情况
        component.graph.value = null
        component.validateCanvasState()
      }).not.toThrow()
    })

    it('应该提供详细的错误信息用于调试', async () => {
      // 创建模拟的DOM容器
      mockContainer = document.createElement('div')
      mockContainer.className = 'canvas-container'
      document.body.appendChild(mockContainer)
      
      const consoleSpy = vi.spyOn(console, 'log')
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [],
          connections: []
        },
        attachTo: mockContainer
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // 验证日志包含足够的调试信息
      const allLogs = [
        ...consoleSpy.mock.calls.map(call => call[0]),
        ...consoleErrorSpy.mock.calls.map(call => call[0])
      ]

      // 验证关键日志存在
      expect(allLogs.some(log => log.includes('[useCanvasLifecycle]'))).toBe(true)
    })
  })

  describe('数据验证集成测试', () => {
    it('应该在加载初始数据时进行完整的数据验证', async () => {
      // 创建模拟的DOM容器
      mockContainer = document.createElement('div')
      mockContainer.className = 'canvas-container'
      document.body.appendChild(mockContainer)
      
      const validateCanvasDataSpy = vi.fn()
      
      // Mock validateCanvasData function
      vi.doMock('../utils/canvas/validation.js', () => ({
        validateCanvasData: validateCanvasDataSpy
      }))

      const initialNodes = [
        { id: 'node1', type: 'start', x: 100, y: 100 }
      ]
      const initialConnections = [
        { id: 'edge1', source: 'node1', target: 'node2' }
      ]

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: initialNodes,
          connections: initialConnections
        },
        attachTo: mockContainer
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))

      // 验证数据验证函数被调用
      expect(validateCanvasDataSpy).toHaveBeenCalledWith({
        nodes: initialNodes,
        connections: initialConnections
      })
    })
  })
})