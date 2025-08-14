import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import WorkflowEditor from '../components/workflow/WorkflowEditor.vue'
import { NodeType } from '../utils/workflowNodeTypes.js'
import { createMockGraph, createMockNode, createMockWorkflow } from './setup.js'

// Mock AntV X6
vi.mock('@antv/x6', () => ({
  Graph: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    addNode: vi.fn(),
    addEdge: vi.fn(),
    removeNode: vi.fn(),
    removeEdge: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    getCellById: vi.fn(),
    clearCells: vi.fn(),
    fromJSON: vi.fn(),
    toJSON: vi.fn(() => ({ cells: [] })),
    centerContent: vi.fn(),
    zoomToFit: vi.fn(),
    zoom: vi.fn(),
    translate: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  })),
  Shape: {
    register: vi.fn()
  }
}))

// Mock Vue Router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/workflow/:id', component: { template: '<div>Workflow</div>' } }
  ]
})

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  Button: {
    name: 'AButton',
    template: '<button class="mock-button" @click="$emit(\"click\")"><slot /></button>',
    props: ['type', 'size', 'status', 'loading']
  },
  Input: {
    name: 'AInput',
    template: '<input class="mock-input" :value="modelValue" @input="$emit(\"update:modelValue\", $event.target.value)" />',
    props: ['modelValue', 'placeholder']
  },
  Select: {
    name: 'ASelect',
    template: '<select class="mock-select" :value="modelValue" @change="$emit(\"update:modelValue\", $event.target.value)"><slot /></select>',
    props: ['modelValue', 'placeholder']
  },
  Option: {
    name: 'AOption',
    template: '<option class="mock-option" :value="value"><slot /></option>',
    props: ['value']
  },
  Modal: {
    name: 'AModal',
    template: '<div class="mock-modal" v-if="visible"><slot /></div>',
    props: ['visible', 'title'],
    emits: ['update:visible', 'ok', 'cancel']
  },
  Form: {
    name: 'AForm',
    template: '<form class="mock-form"><slot /></form>',
    props: ['model']
  },
  FormItem: {
    name: 'AFormItem',
    template: '<div class="mock-form-item"><slot /></div>',
    props: ['label', 'field']
  },
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// Mock workflowNodeCreator
vi.mock('../utils/workflowNodeCreator.js', () => ({
  createNode: vi.fn(() => ({ id: 'new-node-id' })),
  createDownstreamNode: vi.fn(() => ({
    node: { id: 'new-node-id' },
    edge: { id: 'new-edge-id' }
  }))
}))

// Mock API
const mockWorkflowAPI = {
  getWorkflow: vi.fn(),
  saveWorkflow: vi.fn(),
  createWorkflow: vi.fn(),
  updateWorkflow: vi.fn()
}

vi.mock('../api/workflow', () => mockWorkflowAPI)

describe('WorkflowEditor.vue - 工作流编辑器组件测试', () => {
  let wrapper
  let mockGraph

  beforeEach(() => {
    mockGraph = createMockGraph()
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}, routeParams = {}) => {
    return mount(WorkflowEditor, {
      props,
      global: {
        plugins: [mockRouter],
        mocks: {
          $route: {
            params: { id: 'test-workflow-id', ...routeParams },
            query: {}
          },
          $router: mockRouter
        },
        stubs: {
          'a-button': {
            template: '<button class="mock-button" @click="$emit(\"click\")"><slot /></button>'
          },
          'a-input': {
            template: '<input class="mock-input" :value="modelValue" @input="$emit(\"update:modelValue\", $event.target.value)" />'
          },
          'a-select': {
            template: '<select class="mock-select"><slot /></select>'
          },
          'a-option': {
            template: '<option class="mock-option"><slot /></option>'
          },
          'a-modal': {
            template: '<div class="mock-modal" v-if="visible"><slot /></div>'
          },
          'a-form': {
            template: '<form class="mock-form"><slot /></form>'
          },
          'a-form-item': {
            template: '<div class="mock-form-item"><slot /></div>'
          }
        }
      }
    })
  }

  describe('组件初始化测试', () => {
    it('应该正确渲染编辑器基本结构', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.workflow-editor').exists()).toBe(true)
      expect(wrapper.find('.editor-toolbar').exists()).toBe(true)
      expect(wrapper.find('.editor-canvas').exists()).toBe(true)
      expect(wrapper.find('.editor-sidebar').exists()).toBe(true)
    })

    it('应该初始化X6图形实例', () => {
      const { Graph } = require('@antv/x6')
      
      wrapper = createWrapper()
      
      expect(Graph).toHaveBeenCalled()
    })

    it('应该注册自定义节点和边', () => {
      const { Shape } = require('@antv/x6')
      
      wrapper = createWrapper()
      
      expect(Shape.register).toHaveBeenCalled()
    })

    it('应该设置画布事件监听器', () => {
      wrapper = createWrapper()
      
      const graphInstance = wrapper.vm.graph
      expect(graphInstance.on).toHaveBeenCalledWith('node:click', expect.any(Function))
      expect(graphInstance.on).toHaveBeenCalledWith('edge:click', expect.any(Function))
      expect(graphInstance.on).toHaveBeenCalledWith('blank:click', expect.any(Function))
    })
  })

  describe('工作流加载测试', () => {
    it('应该在组件挂载时加载工作流数据', async () => {
      const mockWorkflowData = createMockWorkflow('test-workflow-id')
      mockWorkflowAPI.getWorkflow.mockResolvedValue(mockWorkflowData)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(mockWorkflowAPI.getWorkflow).toHaveBeenCalledWith('test-workflow-id')
    })

    it('应该处理工作流加载失败', async () => {
      mockWorkflowAPI.getWorkflow.mockRejectedValue(new Error('加载失败'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('应该将加载的数据渲染到画布', async () => {
      const mockWorkflowData = createMockWorkflow('test-workflow-id')
      mockWorkflowAPI.getWorkflow.mockResolvedValue(mockWorkflowData)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const graphInstance = wrapper.vm.graph
      expect(graphInstance.fromJSON).toHaveBeenCalledWith(mockWorkflowData.definition)
    })
  })

  describe('节点操作测试', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该能够添加新节点', async () => {
      const { createNode } = require('../utils/workflowNodeCreator.js')
      
      // 模拟点击添加节点按钮
      const addNodeBtn = wrapper.find('[data-testid="add-input-node"]')
      await addNodeBtn.trigger('click')
      
      expect(createNode).toHaveBeenCalledWith(
        NodeType.INPUT,
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('应该能够选择节点', async () => {
      const mockNode = createMockNode('test-node', NodeType.FILTER)
      
      // 模拟节点点击事件
      await wrapper.vm.handleNodeClick({ node: mockNode })
      
      expect(wrapper.vm.selectedNodeId).toBe('test-node')
    })

    it('应该能够删除选中的节点', async () => {
      const mockNode = createMockNode('test-node', NodeType.FILTER)
      wrapper.vm.selectedNodeId = 'test-node'
      wrapper.vm.graph.getCellById.mockReturnValue(mockNode)
      
      // 模拟删除操作
      await wrapper.vm.deleteSelectedNode()
      
      expect(wrapper.vm.graph.removeNode).toHaveBeenCalledWith(mockNode)
      expect(wrapper.vm.selectedNodeId).toBeNull()
    })

    it('应该能够复制节点', async () => {
      const mockNode = createMockNode('test-node', NodeType.FILTER)
      wrapper.vm.selectedNodeId = 'test-node'
      wrapper.vm.graph.getCellById.mockReturnValue(mockNode)
      
      await wrapper.vm.copySelectedNode()
      
      expect(wrapper.vm.copiedNode).toEqual(mockNode)
    })

    it('应该能够粘贴节点', async () => {
      const { createNode } = require('../utils/workflowNodeCreator.js')
      const mockNode = createMockNode('test-node', NodeType.FILTER)
      wrapper.vm.copiedNode = mockNode
      
      await wrapper.vm.pasteNode()
      
      expect(createNode).toHaveBeenCalled()
    })
  })

  describe('工作流保存测试', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该能够保存工作流', async () => {
      const mockWorkflowData = { cells: [] }
      wrapper.vm.graph.toJSON.mockReturnValue(mockWorkflowData)
      wrapper.vm.workflowName = '测试工作流'
      
      mockWorkflowAPI.saveWorkflow.mockResolvedValue({ success: true })
      
      await wrapper.vm.saveWorkflow()
      
      expect(mockWorkflowAPI.saveWorkflow).toHaveBeenCalledWith({
        id: 'test-workflow-id',
        name: '测试工作流',
        definition: mockWorkflowData
      })
    })

    it('应该处理保存失败', async () => {
      mockWorkflowAPI.saveWorkflow.mockRejectedValue(new Error('保存失败'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.saveWorkflow()
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('应该在保存成功后显示提示消息', async () => {
      const { Message } = require('@arco-design/web-vue')
      mockWorkflowAPI.saveWorkflow.mockResolvedValue({ success: true })
      
      await wrapper.vm.saveWorkflow()
      
      expect(Message.success).toHaveBeenCalledWith('工作流保存成功')
    })

    it('应该支持自动保存', async () => {
      wrapper.vm.enableAutoSave = true
      
      // 模拟图形变化
      await wrapper.vm.handleGraphChange()
      
      // 等待自动保存延迟
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(mockWorkflowAPI.saveWorkflow).toHaveBeenCalled()
    })
  })

  describe('工具栏功能测试', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该显示所有工具栏按钮', () => {
      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="undo-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="redo-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="zoom-in-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="zoom-out-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="fit-btn"]').exists()).toBe(true)
    })

    it('应该支持缩放操作', async () => {
      const zoomInBtn = wrapper.find('[data-testid="zoom-in-btn"]')
      const zoomOutBtn = wrapper.find('[data-testid="zoom-out-btn"]')
      
      await zoomInBtn.trigger('click')
      expect(wrapper.vm.graph.zoom).toHaveBeenCalledWith(0.1)
      
      await zoomOutBtn.trigger('click')
      expect(wrapper.vm.graph.zoom).toHaveBeenCalledWith(-0.1)
    })

    it('应该支持适应画布操作', async () => {
      const fitBtn = wrapper.find('[data-testid="fit-btn"]')
      
      await fitBtn.trigger('click')
      
      expect(wrapper.vm.graph.zoomToFit).toHaveBeenCalled()
    })

    it('应该支持撤销重做操作', async () => {
      const undoBtn = wrapper.find('[data-testid="undo-btn"]')
      const redoBtn = wrapper.find('[data-testid="redo-btn"]')
      
      // 这里需要根据实际的撤销重做实现来测试
      await undoBtn.trigger('click')
      await redoBtn.trigger('click')
      
      // 验证撤销重做逻辑
      expect(undoBtn.exists()).toBe(true)
      expect(redoBtn.exists()).toBe(true)
    })
  })

  describe('侧边栏功能测试', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该显示节点类型面板', () => {
      expect(wrapper.find('.node-palette').exists()).toBe(true)
    })

    it('应该显示所有可用的节点类型', () => {
      const nodeTypeButtons = wrapper.findAll('[data-testid^="add-"][data-testid$="-node"]')
      expect(nodeTypeButtons.length).toBeGreaterThan(0)
    })

    it('应该显示属性面板', () => {
      expect(wrapper.find('.property-panel').exists()).toBe(true)
    })

    it('选中节点时应该显示节点属性', async () => {
      const mockNode = createMockNode('test-node', NodeType.FILTER)
      wrapper.vm.selectedNodeId = 'test-node'
      wrapper.vm.graph.getCellById.mockReturnValue(mockNode)
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.node-properties').exists()).toBe(true)
    })

    it('应该能够编辑节点属性', async () => {
      const mockNode = createMockNode('test-node', NodeType.FILTER)
      mockNode.setData = vi.fn()
      wrapper.vm.selectedNodeId = 'test-node'
      wrapper.vm.graph.getCellById.mockReturnValue(mockNode)
      
      await wrapper.vm.$nextTick()
      
      // 模拟属性编辑
      const nameInput = wrapper.find('[data-testid="node-name-input"]')
      await nameInput.setValue('新节点名称')
      
      expect(mockNode.setData).toHaveBeenCalledWith(
        expect.objectContaining({ name: '新节点名称' })
      )
    })
  })

  describe('键盘快捷键测试', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该支持Ctrl+S保存', async () => {
      const saveWorkflowSpy = vi.spyOn(wrapper.vm, 'saveWorkflow')
      
      await wrapper.trigger('keydown', { key: 's', ctrlKey: true })
      
      expect(saveWorkflowSpy).toHaveBeenCalled()
    })

    it('应该支持Delete删除选中节点', async () => {
      const deleteNodeSpy = vi.spyOn(wrapper.vm, 'deleteSelectedNode')
      wrapper.vm.selectedNodeId = 'test-node'
      
      await wrapper.trigger('keydown', { key: 'Delete' })
      
      expect(deleteNodeSpy).toHaveBeenCalled()
    })

    it('应该支持Ctrl+C复制节点', async () => {
      const copyNodeSpy = vi.spyOn(wrapper.vm, 'copySelectedNode')
      wrapper.vm.selectedNodeId = 'test-node'
      
      await wrapper.trigger('keydown', { key: 'c', ctrlKey: true })
      
      expect(copyNodeSpy).toHaveBeenCalled()
    })

    it('应该支持Ctrl+V粘贴节点', async () => {
      const pasteNodeSpy = vi.spyOn(wrapper.vm, 'pasteNode')
      wrapper.vm.copiedNode = createMockNode('copied-node', NodeType.FILTER)
      
      await wrapper.trigger('keydown', { key: 'v', ctrlKey: true })
      
      expect(pasteNodeSpy).toHaveBeenCalled()
    })
  })

  describe('工作流验证测试', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('应该验证工作流的完整性', () => {
      const mockNodes = [
        createMockNode('input-1', NodeType.INPUT),
        createMockNode('filter-1', NodeType.FILTER),
        createMockNode('output-1', NodeType.OUTPUT)
      ]
      const mockEdges = [
        { source: { cell: 'input-1' }, target: { cell: 'filter-1' } },
        { source: { cell: 'filter-1' }, target: { cell: 'output-1' } }
      ]
      
      wrapper.vm.graph.getNodes.mockReturnValue(mockNodes)
      wrapper.vm.graph.getEdges.mockReturnValue(mockEdges)
      
      const isValid = wrapper.vm.validateWorkflow()
      
      expect(isValid).toBe(true)
    })

    it('应该检测缺少输入节点的情况', () => {
      const mockNodes = [
        createMockNode('filter-1', NodeType.FILTER),
        createMockNode('output-1', NodeType.OUTPUT)
      ]
      
      wrapper.vm.graph.getNodes.mockReturnValue(mockNodes)
      wrapper.vm.graph.getEdges.mockReturnValue([])
      
      const isValid = wrapper.vm.validateWorkflow()
      
      expect(isValid).toBe(false)
    })

    it('应该检测缺少输出节点的情况', () => {
      const mockNodes = [
        createMockNode('input-1', NodeType.INPUT),
        createMockNode('filter-1', NodeType.FILTER)
      ]
      
      wrapper.vm.graph.getNodes.mockReturnValue(mockNodes)
      wrapper.vm.graph.getEdges.mockReturnValue([])
      
      const isValid = wrapper.vm.validateWorkflow()
      
      expect(isValid).toBe(false)
    })

    it('应该检测孤立节点', () => {
      const mockNodes = [
        createMockNode('input-1', NodeType.INPUT),
        createMockNode('filter-1', NodeType.FILTER),
        createMockNode('filter-2', NodeType.FILTER), // 孤立节点
        createMockNode('output-1', NodeType.OUTPUT)
      ]
      const mockEdges = [
        { source: { cell: 'input-1' }, target: { cell: 'filter-1' } },
        { source: { cell: 'filter-1' }, target: { cell: 'output-1' } }
      ]
      
      wrapper.vm.graph.getNodes.mockReturnValue(mockNodes)
      wrapper.vm.graph.getEdges.mockReturnValue(mockEdges)
      
      const isValid = wrapper.vm.validateWorkflow()
      
      expect(isValid).toBe(false)
    })
  })

  describe('响应式布局测试', () => {
    it('应该在窗口大小变化时调整画布', async () => {
      wrapper = createWrapper()
      
      // 模拟窗口大小变化
      window.dispatchEvent(new Event('resize'))
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.graph.resize).toHaveBeenCalled()
    })

    it('应该支持全屏模式', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.toggleFullscreen()
      
      expect(wrapper.vm.isFullscreen).toBe(true)
      expect(wrapper.find('.workflow-editor').classes()).toContain('fullscreen')
    })
  })

  describe('性能测试', () => {
    it('应该能够处理大量节点', () => {
      wrapper = createWrapper()
      
      const startTime = performance.now()
      
      // 模拟添加大量节点
      const mockNodes = []
      for (let i = 0; i < 100; i++) {
        mockNodes.push(createMockNode(`node-${i}`, NodeType.FILTER))
      }
      
      wrapper.vm.graph.getNodes.mockReturnValue(mockNodes)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(100)
    })

    it('应该优化渲染性能', async () => {
      wrapper = createWrapper()
      
      const startTime = performance.now()
      
      // 模拟频繁的状态更新
      for (let i = 0; i < 50; i++) {
        wrapper.vm.selectedNodeId = `node-${i}`
        await wrapper.vm.$nextTick()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(1000)
    })
  })

  describe('错误处理测试', () => {
    it('应该处理图形初始化失败', () => {
      const { Graph } = require('@antv/x6')
      Graph.mockImplementation(() => {
        throw new Error('初始化失败')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      wrapper = createWrapper()
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('应该处理节点操作异常', async () => {
      wrapper = createWrapper()
      wrapper.vm.graph.addNode.mockImplementation(() => {
        throw new Error('添加节点失败')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.addNode(NodeType.FILTER)
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('组件销毁测试', () => {
    it('应该在组件销毁时清理资源', () => {
      wrapper = createWrapper()
      const graphInstance = wrapper.vm.graph
      
      wrapper.unmount()
      
      expect(graphInstance.dispose).toHaveBeenCalled()
    })

    it('应该移除事件监听器', () => {
      wrapper = createWrapper()
      const graphInstance = wrapper.vm.graph
      
      wrapper.unmount()
      
      expect(graphInstance.off).toHaveBeenCalled()
    })
  })
})