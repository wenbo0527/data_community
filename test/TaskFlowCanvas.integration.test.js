// TaskFlowCanvas与PreviewLineSystem集成测试
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskFlowCanvas from '../src/pages/marketing/tasks/components/TaskFlowCanvas.vue'
import { Graph } from '@antv/x6'
import { nextTick } from 'vue'

// Mock X6 Graph
vi.mock('@antv/x6', () => ({
  Graph: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    zoom: vi.fn(() => 1),
    zoomTo: vi.fn(),
    zoomToFit: vi.fn(),
    getGraphArea: vi.fn(() => ({ center: { x: 0, y: 0 } })),
    dispose: vi.fn(),
    getSize: vi.fn(() => ({ width: 100, height: 100 })),
    getPosition: vi.fn(() => ({ x: 0, y: 0 })),
    getData: vi.fn(() => ({ type: 'task' }))
  }))
}))

// Mock PreviewLineSystem
class MockPreviewLineSystem {
  constructor(graph) {
    this.graph = graph
    this.layoutEngineReady = false
  }
  
  init() {
    return Promise.resolve()
  }
  
  setLayoutEngine(engine) {
    this.layoutEngineReady = true
  }
  
  checkNodeSnapToPreviewLines(nodeId, position, options) {
    return { success: false }
  }
  
  clearNodeHighlights() {
    return true
  }
  
  updatePreviewLinePosition(node) {
    return true
  }
  
  performLoadCompleteCheck() {
    return true
  }
}

// Mock global PreviewLineSystem
global.PreviewLineSystem = MockPreviewLineSystem

describe('TaskFlowCanvas与PreviewLineSystem集成测试', () => {
  let wrapper
  let mockGraph

  beforeEach(() => {
    // 清理全局状态
    delete window.previewLineSystem
    delete window.layoutEngine
    
    // 创建mock图实例
    mockGraph = new Graph()
    
    // Mock组件props
    const props = {
      nodes: [
        { id: 'node1', type: 'task', position: { x: 100, y: 100 } },
        { id: 'node2', type: 'task', position: { x: 200, y: 200 } }
      ],
      connections: [],
      readonly: false
    }
    
    wrapper = mount(TaskFlowCanvas, {
      props,
      global: {
        stubs: {
          'a-button': true,
          'a-dropdown': true,
          'a-menu': true,
          'a-menu-item': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('初始化状态管理', () => {
    it('应该正确初始化初始化完成状态', async () => {
      // 验证初始状态
      expect(wrapper.vm.isInitializationComplete).toBe(false)
      
      // 模拟初始化完成
      await wrapper.vm.initializeLayoutEngineAfterDataLoad()
      await nextTick()
      
      // 验证初始化完成状态
      expect(wrapper.vm.isInitializationComplete).toBe(true)
    })

    it('waitForInitialization应该正确等待初始化完成', async () => {
      // 设置初始化未完成
      wrapper.vm.isInitializationComplete = false
      
      // 异步设置初始化完成
      setTimeout(() => {
        wrapper.vm.isInitializationComplete = true
      }, 500)
      
      // 等待初始化完成
      const result = await wrapper.vm.waitForInitialization(1000)
      expect(result).toBe(true)
    })

    it('waitForInitialization应该在超时后返回false', async () => {
      // 设置初始化未完成
      wrapper.vm.isInitializationComplete = false
      
      // 等待初始化完成（超时）
      const result = await wrapper.vm.waitForInitialization(100)
      expect(result).toBe(false)
    })
  })

  describe('PreviewLineSystem初始化', () => {
    it('应该正确初始化PreviewLineSystem', async () => {
      // 模拟图实例存在
      wrapper.vm.graph = mockGraph
      
      // 模拟configDrawers
      wrapper.vm.configDrawers = {
        structuredLayout: {
          initializeLayoutEngine: vi.fn().mockResolvedValue(true),
          createLayoutEngineInstance: vi.fn().mockReturnValue({}),
          getLayoutEngineStatus: vi.fn().mockReturnValue('ready'),
          isReady: true
        }
      }
      
      // 执行初始化
      await wrapper.vm.initializeLayoutEngineAfterDataLoad()
      
      // 验证PreviewLineSystem已初始化
      expect(wrapper.vm.previewLineSystem).toBeDefined()
      expect(window.previewLineSystem).toBeDefined()
    })

    it('应该在初始化失败时仍设置完成状态', async () => {
      // 模拟初始化失败
      wrapper.vm.configDrawers = {
        structuredLayout: {
          initializeLayoutEngine: vi.fn().mockRejectedValue(new Error('初始化失败'))
        }
      }
      
      // 执行初始化
      await wrapper.vm.initializeLayoutEngineAfterDataLoad()
      
      // 验证即使失败也设置为完成状态
      expect(wrapper.vm.isInitializationComplete).toBe(true)
    })
  })

  describe('节点移动事件处理', () => {
    it('应该在初始化完成后处理节点移动', async () => {
      // 设置初始化完成
      wrapper.vm.isInitializationComplete = true
      wrapper.vm.previewLineSystem = new MockPreviewLineSystem(mockGraph)
      
      // 模拟节点移动事件
      const mockNode = {
        id: 'test-node',
        getPosition: () => ({ x: 150, y: 150 }),
        getSize: () => ({ width: 100, height: 50 }),
        getData: () => ({ type: 'task' })
      }
      
      // 模拟节点移动处理
      const spy = vi.spyOn(wrapper.vm.previewLineSystem, 'checkNodeSnapToPreviewLines')
      
      // 触发节点移动（需要模拟完整的事件处理流程）
      await wrapper.vm.handleNodeMove(mockNode, { x: 150, y: 150 })
      
      // 验证预览线系统方法被调用
      expect(spy).toHaveBeenCalled()
    })

    it('应该在初始化未完成时跳过预览线处理', async () => {
      // 设置初始化未完成
      wrapper.vm.isInitializationComplete = false
      
      // 模拟节点移动事件
      const mockNode = {
        id: 'test-node',
        getPosition: () => ({ x: 150, y: 150 }),
        getSize: () => ({ width: 100, height: 50 }),
        getData: () => ({ type: 'task' })
      }
      
      // 创建spy来监控是否调用了预览线方法
      const consoleSpy = vi.spyOn(console, 'warn')
      
      // 触发节点移动
      await wrapper.vm.handleNodeMove(mockNode, { x: 150, y: 150 })
      
      // 验证输出了警告信息
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('初始化未完成，跳过预览线处理')
      )
    })
  })

  describe('错误处理', () => {
    it('应该正确处理PreviewLineSystem方法调用错误', async () => {
      // 设置初始化完成
      wrapper.vm.isInitializationComplete = true
      
      // 创建会抛出错误的mock PreviewLineSystem
      wrapper.vm.previewLineSystem = {
        checkNodeSnapToPreviewLines: vi.fn().mockImplementation(() => {
          throw new Error('方法调用失败')
        })
      }
      
      const consoleSpy = vi.spyOn(console, 'error')
      
      // 模拟节点移动
      const mockNode = {
        id: 'test-node',
        getPosition: () => ({ x: 150, y: 150 }),
        getSize: () => ({ width: 100, height: 50 }),
        getData: () => ({ type: 'task' })
      }
      
      // 触发节点移动
      await wrapper.vm.handleNodeMove(mockNode, { x: 150, y: 150 })
      
      // 验证错误被正确捕获和记录
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('调用预览线吸附检测方法失败')
      )
    })

    it('应该正确处理方法不存在的情况', async () => {
      // 设置初始化完成但PreviewLineSystem方法不存在
      wrapper.vm.isInitializationComplete = true
      wrapper.vm.previewLineSystem = {}
      
      const consoleSpy = vi.spyOn(console, 'warn')
      
      // 模拟节点移动
      const mockNode = {
        id: 'test-node',
        getPosition: () => ({ x: 150, y: 150 }),
        getSize: () => ({ width: 100, height: 50 }),
        getData: () => ({ type: 'task' })
      }
      
      // 触发节点移动
      await wrapper.vm.handleNodeMove(mockNode, { x: 150, y: 150 })
      
      // 验证输出了方法不可用的警告
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('预览线系统方法不可用')
      )
    })
  })

  describe('全局状态管理', () => {
    it('应该正确设置window.previewLineSystem', async () => {
      // 模拟图实例存在
      wrapper.vm.graph = mockGraph
      
      // 模拟configDrawers
      wrapper.vm.configDrawers = {
        structuredLayout: {
          initializeLayoutEngine: vi.fn().mockResolvedValue(true),
          createLayoutEngineInstance: vi.fn().mockReturnValue({}),
          getLayoutEngineStatus: vi.fn().mockReturnValue('ready'),
          isReady: true
        }
      }
      
      // 执行初始化
      await wrapper.vm.initializeLayoutEngineAfterDataLoad()
      
      // 验证全局状态已设置
      expect(window.previewLineSystem).toBeDefined()
      expect(window.previewLineSystem).toBeInstanceOf(MockPreviewLineSystem)
    })

    it('应该正确替换已存在的window.previewLineSystem', async () => {
      // 设置已存在的实例
      const oldInstance = new MockPreviewLineSystem(mockGraph)
      window.previewLineSystem = oldInstance
      
      // 模拟图实例存在
      wrapper.vm.graph = mockGraph
      
      // 模拟configDrawers
      wrapper.vm.configDrawers = {
        structuredLayout: {
          initializeLayoutEngine: vi.fn().mockResolvedValue(true),
          createLayoutEngineInstance: vi.fn().mockReturnValue({}),
          getLayoutEngineStatus: vi.fn().mockReturnValue('ready'),
          isReady: true
        }
      }
      
      const consoleSpy = vi.spyOn(console, 'log')
      
      // 执行初始化
      await wrapper.vm.initializeLayoutEngineAfterDataLoad()
      
      // 验证输出了替换信息
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('替换已存在的window.previewLineSystem实例')
      )
      
      // 验证实例已被替换
      expect(window.previewLineSystem).not.toBe(oldInstance)
    })
  })
})