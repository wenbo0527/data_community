/**
 * 时序管理和异步初始化测试
 * 专门测试Vue应用中的初始化时序问题
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TaskFlowCanvasRefactored from '../components/TaskFlowCanvasRefactored.vue'

// Mock X6 Graph
const mockGraphInstance = {
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
}

vi.mock('@antv/x6', () => ({
  Graph: vi.fn().mockImplementation(() => mockGraphInstance)
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

describe('时序管理和异步初始化测试', () => {
  let wrapper
  let consoleSpy
  let consoleErrorSpy

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 确保 console spy 正确初始化
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock DOM methods - 只在属性不存在时定义
    if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')) {
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        get() { return this.parentNode || null },
        configurable: true
      })
    }
    
    if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        get() { return parseInt(this.style.width) || 800 },
        configurable: true
      })
    }
    
    if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get() { return parseInt(this.style.height) || 600 },
        configurable: true
      })
    }
    
    if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')) {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        get() { return parseInt(this.style.width) || 800 },
        configurable: true
      })
    }
    
    if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')) {
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        get() { return parseInt(this.style.height) || 600 },
        configurable: true
      })
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    
    // 安全地恢复 spy
    if (consoleSpy && typeof consoleSpy.mockRestore === 'function') {
      consoleSpy.mockRestore()
    }
    if (consoleErrorSpy && typeof consoleErrorSpy.mockRestore === 'function') {
      consoleErrorSpy.mockRestore()
    }
    
    // 清理 DOM
    const containers = document.querySelectorAll('.canvas-container')
    containers.forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    })
  })

  describe('DOM容器时序验证', () => {
    it('应该在DOM容器准备就绪后才初始化Graph', async () => {
      // 创建DOM容器
      const container = document.createElement('div')
      container.className = 'canvas-container'
      container.style.width = '800px'
      container.style.height = '600px'
      document.body.appendChild(container)

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

      // 等待初始化完成
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 500))

      // 验证初始化日志顺序
      const logs = consoleSpy?.mock?.calls?.map(call => call[0]) || []
      
      const containerFoundIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] 容器元素获取成功')
      )
      const graphInitIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] X6图实例初始化成功')
      )

      expect(containerFoundIndex).toBeGreaterThan(-1)
      expect(graphInitIndex).toBeGreaterThan(-1)
      expect(containerFoundIndex).toBeLessThan(graphInitIndex)

      // 清理
      document.body.removeChild(container)
    })

    it('应该在DOM容器不存在时正确处理错误', async () => {
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
      await new Promise(resolve => setTimeout(resolve, 200))

      // 验证错误处理
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TaskFlowCanvas] 组件初始化失败'),
        expect.any(Error)
      )
    })
  })

  describe('Graph实例初始化时序', () => {
    it('应该在Graph实例创建后才绑定事件', async () => {
      const container = document.createElement('div')
      container.className = 'canvas-container'
      container.style.width = '800px'
      container.style.height = '600px'
      document.body.appendChild(container)

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

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 500))

      // 验证Graph实例被创建
      expect(mockGraphInstance.on).toHaveBeenCalled()

      // 验证初始化日志顺序
      const logs = consoleSpy?.mock?.calls?.map(call => call[0]) || []
      
      const graphInitIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] X6图实例初始化成功')
      )
      const eventsBindIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] 事件监听器绑定完成')
      )

      expect(graphInitIndex).toBeGreaterThan(-1)
      expect(eventsBindIndex).toBeGreaterThan(-1)
      expect(graphInitIndex).toBeLessThan(eventsBindIndex)

      // 清理
      document.body.removeChild(container)
    })
  })

  describe('组件生命周期时序', () => {
    it('应该在onMounted中按正确顺序执行初始化', async () => {
      const container = document.createElement('div')
      container.className = 'canvas-container'
      container.style.width = '800px'
      container.style.height = '600px'
      document.body.appendChild(container)

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

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 500))

      // 验证系统初始化在画布初始化之前
      const logs = consoleSpy?.mock?.calls?.map(call => call[0]) || []
      
      const systemInitIndex = logs.findIndex(log => 
        log.includes('[TaskFlowCanvas] 系统实例初始化完成')
      )
      const canvasInitIndex = logs.findIndex(log => 
        log.includes('[useCanvasLifecycle] 开始初始化画布')
      )

      if (systemInitIndex > -1 && canvasInitIndex > -1) {
        expect(systemInitIndex).toBeLessThan(canvasInitIndex)
      }

      // 清理
      document.body.removeChild(container)
    })
  })

  describe('异步初始化处理', () => {
    it('应该正确处理异步初始化过程中的状态管理', async () => {
      const container = document.createElement('div')
      container.className = 'canvas-container'
      container.style.width = '800px'
      container.style.height = '600px'
      document.body.appendChild(container)

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

      // 验证初始状态
      const component = wrapper.vm
      expect(component.isInitializing).toBe(false)

      await nextTick()
      
      // 等待初始化完成
      await new Promise(resolve => setTimeout(resolve, 500))

      // 验证最终状态
      expect(component.isInitializing).toBe(false)

      // 清理
      document.body.removeChild(container)
    })

    it('应该在初始化失败时正确重置状态', async () => {
      // 模拟Graph初始化失败
      const { Graph } = await import('@antv/x6')
      Graph.mockImplementationOnce(() => {
        throw new Error('Graph initialization failed')
      })

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

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // 验证错误处理
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TaskFlowCanvas] 组件初始化失败'),
        expect.any(Error)
      )

      // 验证状态重置
      const component = wrapper.vm
      expect(component.isInitializing).toBe(false)
    })
  })

  describe('防御性编程验证', () => {
    it('应该在所有关键点进行null检查', async () => {
      const container = document.createElement('div')
      container.className = 'canvas-container'
      container.style.width = '800px'
      container.style.height = '600px'
      document.body.appendChild(container)

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

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 500))

      // 验证没有未捕获的错误
      const errorLogs = consoleErrorSpy.mock.calls.filter(call => 
        call[0].includes('Uncaught') || call[0].includes('TypeError')
      )
      expect(errorLogs.length).toBe(0)

      // 清理
      document.body.removeChild(container)
    })
  })
})