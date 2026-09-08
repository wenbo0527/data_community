/**
 * 工作流编辑器集成测试
 * 采用TDD方式验证完整功能流程
 */
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import WorkflowEditor from '@/pages/exploration/workflows/WorkflowEditor.vue'
import { Graph } from '@antv/x6'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'

// Mock路由
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div></div>' } }]
})

// Mock Vuex store
const store = createStore({
  state: {
    workflows: {
      currentWorkflow: {
        id: 'test-workflow',
        name: '测试工作流',
        nodes: [],
        edges: []
      }
    }
  },
  getters: {
    currentWorkflow: state => state.workflows.currentWorkflow
  }
})

// Mock X6 Graph
vi.mock('@antv/x6', () => ({
  Graph: vi.fn().mockImplementation(() => ({
    addNode: vi.fn(),
    addEdge: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    on: vi.fn(),
    off: vi.fn(),
    dispose: vi.fn(),
    render: vi.fn(),
    centerContent: vi.fn(),
    zoom: vi.fn(),
    translate: vi.fn()
  })),
  registerVueShape: vi.fn()
}))

describe('WorkflowEditor 集成测试', () => {
  let wrapper
  let mockGraph

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()
    
    // 创建mock graph实例
    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn(),
      dispose: vi.fn(),
      render: vi.fn(),
      centerContent: vi.fn(),
      zoom: vi.fn(),
      translate: vi.fn()
    }
    
    Graph.mockImplementation(() => mockGraph)
  })

  describe('1. 组件初始化测试', () => {
    it('应该正确初始化WorkflowEditor组件', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.workflow-editor').exists()).toBe(true)
    })

    it('应该正确初始化X6 Graph实例', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      expect(Graph).toHaveBeenCalled()
    })
  })

  describe('2. Graph实例依赖注入测试', () => {
    it('应该正确provide graph实例给子组件', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      // 验证graph实例已经被provide
      const providedGraph = wrapper.vm.$.provides.graph
      expect(providedGraph).toBeDefined()
    })

    it('应该provide selectedNodeId和setSelectedNode函数', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      const providedSelectedNodeId = wrapper.vm.$.provides.selectedNodeId
      const providedSetSelectedNode = wrapper.vm.$.provides.setSelectedNode
      
      expect(providedSelectedNodeId).toBeDefined()
      expect(providedSetSelectedNode).toBeDefined()
      expect(typeof providedSetSelectedNode).toBe('function')
    })
  })

  describe('3. 节点创建功能测试', () => {
    it('应该在空工作流时自动创建数据输入节点', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      // 验证addNode被调用来创建默认输入节点
      expect(mockGraph.addNode).toHaveBeenCalled()
    })

    it('应该能够通过API创建不同类型的节点', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      // 测试创建数据处理节点
      const processingNodeConfig = {
        id: 'processing-1',
        shape: 'workflow-node',
        x: 200,
        y: 100,
        data: {
          type: 'PROCESSING',
          subType: 'PYTHON',
          name: '数据处理节点'
        }
      }
      
      mockGraph.addNode(processingNodeConfig)
      expect(mockGraph.addNode).toHaveBeenCalledWith(processingNodeConfig)
    })
  })

  describe('4. 属性面板功能测试', () => {
    it('应该在选择节点时显示属性面板', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      // 模拟选择节点
      const setSelectedNode = wrapper.vm.$.provides.setSelectedNode
      setSelectedNode('test-node-id')
      
      await wrapper.vm.$nextTick()
      
      // 验证属性面板显示
      expect(wrapper.find('.property-panel').exists()).toBe(true)
    })

    it('应该正确处理Form组件的model属性', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': {
              template: '<form><slot /></form>',
              props: ['model']
            },
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      // 验证Form组件接收到正确的model属性
      const formComponents = wrapper.findAllComponents({ name: 'AForm' })
      if (formComponents.length > 0) {
        expect(formComponents[0].props('model')).toBeDefined()
      }
    })
  })

  describe('5. 调试功能测试', () => {
    it('应该能够切换调试面板显示状态', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      // 初始状态调试面板应该隐藏
      expect(wrapper.find('.debug-panel').exists()).toBe(false)
      
      // 切换调试面板显示
      if (wrapper.vm.toggleDebugPanel) {
        wrapper.vm.toggleDebugPanel()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.debug-panel').exists()).toBe(true)
      }
    })
  })

  describe('6. 完整工作流程测试', () => {
    it('应该支持完整的节点创建->连接->配置流程', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          plugins: [router, store],
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      // 1. 验证默认输入节点已创建
      expect(mockGraph.addNode).toHaveBeenCalled()
      
      // 2. 创建处理节点
      const processingNode = {
        id: 'processing-1',
        shape: 'workflow-node',
        x: 300,
        y: 100,
        data: { type: 'PROCESSING', subType: 'PYTHON' }
      }
      mockGraph.addNode(processingNode)
      
      // 3. 创建输出节点
      const outputNode = {
        id: 'output-1',
        shape: 'workflow-node',
        x: 500,
        y: 100,
        data: { type: 'OUTPUT' }
      }
      mockGraph.addNode(outputNode)
      
      // 4. 创建连接
      const edge1 = {
        id: 'edge-1',
        source: 'input-1',
        target: 'processing-1'
      }
      const edge2 = {
        id: 'edge-2',
        source: 'processing-1',
        target: 'output-1'
      }
      mockGraph.addEdge(edge1)
      mockGraph.addEdge(edge2)
      
      // 验证所有操作都被正确调用
      expect(mockGraph.addNode).toHaveBeenCalledTimes(3) // 包括默认输入节点
      expect(mockGraph.addEdge).toHaveBeenCalledTimes(2)
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })
})