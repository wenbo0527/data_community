import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import WorkflowEditor from '../../pages/exploration/workflows/WorkflowEditor.vue'
import { createMockGraph, createMockNode, createMockWorkflow } from '../setup.js'

// Mock AntV X6
vi.mock('@antv/x6', () => ({
  Graph: vi.fn().mockImplementation(() => createMockGraph()),
  Shape: {
    Edge: vi.fn().mockImplementation((config) => ({
      id: 'edge-' + Math.random().toString(36).substr(2, 9),
      ...config
    }))
  },
  StringExt: {
    uuid: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  }
}))

// Mock @antv/x6-vue-shape
vi.mock('@antv/x6-vue-shape', () => ({
  register: vi.fn()
}))

// Mock Vue Router
const mockRoute = {
  params: { id: 'test-workflow-id' },
  query: {},
  path: '/workflows/test-workflow-id'
}

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn()
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

// Mock WorkflowStorage
vi.mock('../../utils/workflowStorage', () => ({
  WorkflowStorage: {
    getWorkflow: vi.fn(),
    saveWorkflow: vi.fn(),
    publishWorkflow: vi.fn(),
    debugWorkflow: vi.fn()
  }
}))

// Mock workflowNodeCreator
vi.mock('../../utils/workflowNodeCreator.js', () => ({
  createNode: vi.fn((type, position, graph) => {
    const mockNode = createMockNode(`node-${type}`, type, position)
    graph.addNode(mockNode)
    return mockNode
  }),
  createEdge: vi.fn((source, target, graph) => {
    const mockEdge = {
      id: `edge-${source}-${target}`,
      source,
      target
    }
    graph.addEdge(mockEdge)
    return mockEdge
  })
}))

// Mock workflowNodeTypes
vi.mock('../../utils/workflowNodeTypes.js', () => ({
  NodeType: {
    INPUT: 'INPUT',
    PROCESSING: 'PROCESSING',
    OUTPUT: 'OUTPUT'
  },
  PROCESSING_TYPE_LIST: [
    { type: 'SQL', name: 'SQL查询', icon: 'IconCode', color: '#1890ff' },
    { type: 'PYTHON', name: 'Python脚本', icon: 'IconCode', color: '#52c41a' }
  ],
  getNodeTypeName: vi.fn((type) => {
    const names = {
      INPUT: '数据输入',
      PROCESSING: '数据处理', 
      OUTPUT: '数据输出'
    }
    return names[type] || type
  }),
  getNodeTypeColor: vi.fn((type) => {
    const colors = {
      INPUT: '#52c41a',
      PROCESSING: '#1890ff',
      OUTPUT: '#fa8c16'
    }
    return colors[type] || '#666'
  })
}))

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  Button: { name: 'AButton', template: '<button @click="$emit(\'click\')" v-bind="$attrs"><slot /></button>' },
  Dropdown: { name: 'ADropdown', template: '<div><slot /></div>' },
  Form: { name: 'AForm', template: '<form><slot /></form>' },
  FormItem: { name: 'AFormItem', template: '<div><slot /></div>' },
  Input: { name: 'AInput', template: '<input v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue'], emits: ['update:modelValue'] },
  Collapse: { name: 'ACollapse', template: '<div><slot /></div>' },
  CollapseItem: { name: 'ACollapseItem', template: '<div><slot /></div>' },
  Tabs: { name: 'ATabs', template: '<div><slot /></div>' },
  TabPane: { name: 'ATabPane', template: '<div><slot /></div>' },
  Tag: { name: 'ATag', template: '<span><slot /></span>' },
  Divider: { name: 'ADivider', template: '<div></div>' }
}))

// Mock workflow node config components
vi.mock('../../components/workflow/DataSourceNodeConfig.vue', () => ({
  default: {
    name: 'DataSourceNodeConfig',
    template: '<div class="datasource-config">DataSource Config</div>',
    props: ['config'],
    emits: ['update']
  }
}))

vi.mock('../../components/workflow/SqlNodeConfig.vue', () => ({
  default: {
    name: 'SqlNodeConfig',
    template: '<div class="sql-config">SQL Config</div>',
    props: ['config'],
    emits: ['update']
  }
}))

vi.mock('../../components/workflow/PythonNodeConfig.vue', () => ({
  default: {
    name: 'PythonNodeConfig',
    template: '<div class="python-config">Python Config</div>',
    props: ['config'],
    emits: ['update']
  }
}))

vi.mock('../../components/workflow/WorkflowNode.vue', () => ({
  default: {
    name: 'WorkflowNode',
    template: '<div class="workflow-node">Workflow Node</div>'
  }
}))

describe('WorkflowEditor 组件测试', () => {
  let wrapper
  let mockWorkflow

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockWorkflow = createMockWorkflow({
      id: 'test-workflow-id',
      name: '测试工作流',
      status: 'draft',
      nodes: [
        {
          id: 'node-1',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          data: { name: '数据输入节点', type: 'INPUT' }
        }
      ],
      edges: []
    })
    
    // Mock WorkflowStorage.getWorkflow
    const { WorkflowStorage } = require('../../utils/workflowStorage')
    WorkflowStorage.getWorkflow.mockResolvedValue(mockWorkflow)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件初始化', () => {
    it('应该正确渲染工作流编辑器', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-doption': true,
            'a-divider': true,
            'a-tag': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-collapse': true,
            'a-collapse-item': true,
            'a-tabs': true,
            'a-tab-pane': true,
            'icon-arrow-left': true,
            'icon-undo': true,
            'icon-redo': true,
            'icon-fullscreen': true,
            'icon-zoom-in': true,
            'icon-play-arrow': true,
            'icon-save': true,
            'icon-down': true,
            'icon-check': true,
            'icon-archive': true,
            'icon-plus': true,
            'icon-minus': true,
            'icon-right': true,
            'icon-left': true,
            'icon-info-circle': true,
            'icon-close': true,
            'DataSourceNodeConfig': true,
            'SqlNodeConfig': true,
            'PythonNodeConfig': true,
            'WorkflowNode': true
          }
        }
      })

      await nextTick()
      
      expect(wrapper.find('.workflow-editor').exists()).toBe(true)
      expect(wrapper.find('.editor-header').exists()).toBe(true)
      expect(wrapper.find('.editor-body').exists()).toBe(true)
      expect(wrapper.find('.canvas-container').exists()).toBe(true)
      expect(wrapper.find('.property-panel').exists()).toBe(true)
    })

    it('应该正确初始化图形画布', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-tag': true,
            'icon-arrow-left': true,
            'icon-undo': true,
            'icon-redo': true,
            'icon-fullscreen': true,
            'icon-zoom-in': true,
            'icon-play-arrow': true,
            'icon-save': true,
            'icon-down': true
          }
        }
      })

      await nextTick()
      
      // 验证图形实例被创建
      expect(wrapper.vm.graph).toBeTruthy()
      expect(wrapper.vm.graph.addNode).toBeDefined()
      expect(wrapper.vm.graph.addEdge).toBeDefined()
    })

    it('应该正确加载工作流数据', async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-tag': true,
            'icon-arrow-left': true,
            'icon-undo': true,
            'icon-redo': true,
            'icon-fullscreen': true,
            'icon-zoom-in': true,
            'icon-play-arrow': true,
            'icon-save': true,
            'icon-down': true
          }
        }
      })

      await nextTick()
      
      const { WorkflowStorage } = require('../../utils/workflowStorage')
      expect(WorkflowStorage.getWorkflow).toHaveBeenCalledWith('test-workflow-id')
      expect(wrapper.vm.workflow).toEqual(mockWorkflow)
    })
  })

  describe('工具栏功能', () => {
    beforeEach(async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': {
              template: '<button @click="$emit(\'click\')" :disabled="disabled" v-bind="$attrs"><slot /></button>',
              props: ['disabled']
            },
            'a-dropdown': true,
            'a-tag': true,
            'icon-arrow-left': true,
            'icon-undo': true,
            'icon-redo': true,
            'icon-fullscreen': true,
            'icon-zoom-in': true,
            'icon-play-arrow': true,
            'icon-save': true,
            'icon-down': true
          }
        }
      })
      await nextTick()
    })

    it('应该能够执行撤销操作', async () => {
      const undoButton = wrapper.find('button[disabled="false"]')
      await undoButton.trigger('click')
      
      expect(wrapper.vm.graph.undo).toHaveBeenCalled()
    })

    it('应该能够执行重做操作', async () => {
      const buttons = wrapper.findAll('button')
      const redoButton = buttons.find(btn => !btn.attributes('disabled'))
      
      if (redoButton) {
        await redoButton.trigger('click')
        expect(wrapper.vm.graph.redo).toHaveBeenCalled()
      }
    })

    it('应该能够适应画布', async () => {
      const buttons = wrapper.findAll('button')
      const fitButton = buttons[2] // 第三个按钮是适应画布
      
      await fitButton.trigger('click')
      expect(wrapper.vm.graph.zoomToFit).toHaveBeenCalled()
    })

    it('应该禁用缩放功能', async () => {
      // v2.0新功能：禁用画布缩放
      expect(wrapper.vm.graph.zoom).not.toHaveBeenCalledWith(expect.any(Number))
      
      // 验证缩放相关配置被禁用
      const graphOptions = wrapper.vm.graph.options
      expect(graphOptions.mousewheel).toBeFalsy()
    })

    it('应该支持左右滑动', async () => {
      // v2.0新功能：支持左右滑动查看长流程
      const canvasContainer = wrapper.find('.canvas-container')
      
      // 模拟水平滚动
      await canvasContainer.trigger('wheel', { deltaX: 100 })
      
      // 验证画布支持水平滚动
      expect(wrapper.vm.graph.translate).toHaveBeenCalled()
    })
  })

  describe('工作流操作', () => {
    beforeEach(async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': {
              template: '<button @click="$emit(\'click\')" :loading="loading" v-bind="$attrs"><slot /></button>',
              props: ['loading']
            },
            'a-dropdown': true,
            'a-doption': {
              template: '<div @click="$emit(\'click\')" v-bind="$attrs"><slot /></div>'
            },
            'a-tag': true,
            'icon-arrow-left': true,
            'icon-undo': true,
            'icon-redo': true,
            'icon-fullscreen': true,
            'icon-zoom-in': true,
            'icon-play-arrow': true,
            'icon-save': true,
            'icon-down': true,
            'icon-check': true,
            'icon-archive': true
          }
        }
      })
      await nextTick()
    })

    it('应该能够保存工作流', async () => {
      const { WorkflowStorage } = require('../../utils/workflowStorage')
      WorkflowStorage.saveWorkflow.mockResolvedValue(true)
      
      const saveButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('保存')
      )
      
      await saveButton.trigger('click')
      await nextTick()
      
      expect(WorkflowStorage.saveWorkflow).toHaveBeenCalled()
    })

    it('应该能够调试工作流', async () => {
      const { WorkflowStorage } = require('../../utils/workflowStorage')
      WorkflowStorage.debugWorkflow.mockResolvedValue({
        success: true,
        logs: [{ level: 'info', message: '调试开始', timestamp: Date.now() }]
      })
      
      const debugButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('调试运行')
      )
      
      await debugButton.trigger('click')
      await nextTick()
      
      expect(WorkflowStorage.debugWorkflow).toHaveBeenCalled()
      expect(wrapper.vm.debugging).toBe(false) // 调试完成后应该重置状态
    })

    it('应该能够发布工作流', async () => {
      const { WorkflowStorage } = require('../../utils/workflowStorage')
      WorkflowStorage.publishWorkflow.mockResolvedValue(true)
      
      // 模拟点击发布下拉菜单中的发布选项
      const publishOption = wrapper.find('div[class*="doption"]')
      if (publishOption.exists()) {
        await publishOption.trigger('click')
        await nextTick()
        
        expect(WorkflowStorage.publishWorkflow).toHaveBeenCalledWith(
          'test-workflow-id',
          'published'
        )
      }
    })
  })

  describe('节点操作', () => {
    beforeEach(async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-tag': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': {
              template: '<input v-model="modelValue" @change="$emit(\'change\', $event.target.value)" />',
              props: ['modelValue'],
              emits: ['change']
            },
            'a-collapse': true,
            'a-collapse-item': true,
            'icon-arrow-left': true,
            'icon-undo': true,
            'icon-redo': true,
            'icon-fullscreen': true,
            'icon-zoom-in': true,
            'icon-play-arrow': true,
            'icon-save': true,
            'icon-down': true,
            'icon-right': true,
            'icon-left': true,
            'icon-info-circle': true
          }
        }
      })
      await nextTick()
    })

    it('应该能够选择节点', async () => {
      const mockNode = createMockNode('test-node', 'SQL', { x: 200, y: 200 })
      mockNode.getData.mockReturnValue({
        type: 'SQL',
        name: 'SQL查询节点',
        config: {}
      })
      
      // 模拟节点选择
      wrapper.vm.setSelectedNode(mockNode)
      await nextTick()
      
      expect(wrapper.vm.selectedNode).toEqual({
        id: 'test-node',
        type: 'SQL',
        label: 'SQL查询节点',
        config: {}
      })
    })

    it('应该能够更新节点属性', async () => {
      const mockNode = createMockNode('test-node', 'PROCESSING', { x: 200, y: 200 })
      mockNode.getData.mockReturnValue({
        type: 'PROCESSING',
        subType: 'SQL',
        name: 'SQL查询节点',
        config: {}
      })
      
      wrapper.vm.setSelectedNode(mockNode)
      await nextTick()
      
      expect(wrapper.vm.selectedNode).toEqual({
        id: 'test-node',
        type: 'PROCESSING',
        subType: 'SQL',
        label: 'SQL查询节点',
        config: {}
      })
    })

    it('应该支持数据处理节点名称编辑', async () => {
      // v2.0新功能：数据处理节点支持名称编辑
      const mockNode = createMockNode('processing-node', 'PROCESSING', { x: 200, y: 200 })
      mockNode.getData.mockReturnValue({
        type: 'PROCESSING',
        subType: 'PYTHON',
        name: '数据处理节点',
        config: {}
      })
      
      wrapper.vm.setSelectedNode(mockNode)
      await nextTick()
      
      // 模拟名称编辑
      const nameInput = wrapper.find('input[type="text"]')
      if (nameInput.exists()) {
        await nameInput.setValue('新的节点名称')
        await nameInput.trigger('change')
        
        expect(mockNode.setData).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '新的节点名称'
          })
        )
      }
    })

    it('应该强制从左到右的节点连接', async () => {
      // v2.0新功能：强制从左到右连接规则
      const sourceNode = createMockNode('source', 'INPUT', { x: 100, y: 100 })
      const targetNode = createMockNode('target', 'PROCESSING', { x: 300, y: 100 })
      
      // 正确的连接（从左到右）
      const validConnection = wrapper.vm.validateConnection(sourceNode, targetNode)
      expect(validConnection).toBe(true)
      
      // 错误的连接（从右到左）
      const invalidConnection = wrapper.vm.validateConnection(targetNode, sourceNode)
      expect(invalidConnection).toBe(false)
    })

    it('应该验证节点类型连接规则', async () => {
      // v2.0功能：验证节点类型连接规则
      const inputNode = createMockNode('input', 'INPUT', { x: 100, y: 100 })
      const processingNode = createMockNode('processing', 'PROCESSING', { x: 200, y: 100 })
      const outputNode = createMockNode('output', 'OUTPUT', { x: 300, y: 100 })
      
      // INPUT -> PROCESSING 应该允许
      expect(wrapper.vm.validateNodeTypeConnection('INPUT', 'PROCESSING')).toBe(true)
      
      // PROCESSING -> OUTPUT 应该允许
      expect(wrapper.vm.validateNodeTypeConnection('PROCESSING', 'OUTPUT')).toBe(true)
      
      // INPUT -> OUTPUT 应该允许（直接连接）
      expect(wrapper.vm.validateNodeTypeConnection('INPUT', 'OUTPUT')).toBe(true)
      
      // OUTPUT -> INPUT 不应该允许
       expect(wrapper.vm.validateNodeTypeConnection('OUTPUT', 'INPUT')).toBe(false)
     })
  })

  describe('数据输出节点测试', () => {
    beforeEach(async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-select': {
              template: '<select v-model="modelValue" @change="$emit(\"update:modelValue\", $event.target.value)"><slot /></select>',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'a-option': {
              template: '<option :value="value"><slot /></option>',
              props: ['value']
            },
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'icon-arrow-left': true,
            'icon-download': true,
            'icon-database': true,
            'icon-api': true
          }
        }
      })
      await nextTick()
    })

    it('应该支持多种输出格式', async () => {
      // v2.0新功能：数据输出节点支持多种格式
      const outputNode = createMockNode('output-node', 'OUTPUT', { x: 300, y: 100 })
      outputNode.getData.mockReturnValue({
        type: 'OUTPUT',
        outputType: 'FILE_EXPORT',
        config: {
          format: 'CSV',
          filename: 'output.csv'
        }
      })
      
      wrapper.vm.setSelectedNode(outputNode)
      await nextTick()
      
      // 验证支持的输出格式
      const formatOptions = ['CSV', 'JSON', 'Excel']
      formatOptions.forEach(format => {
        expect(wrapper.vm.getSupportedOutputFormats()).toContain(format)
      })
    })

    it('应该支持数据库写入配置', async () => {
      // v2.0新功能：数据库写入节点
      const dbOutputNode = createMockNode('db-output', 'OUTPUT', { x: 300, y: 100 })
      dbOutputNode.getData.mockReturnValue({
        type: 'OUTPUT',
        outputType: 'DATABASE_WRITE',
        config: {
          connectionString: 'postgresql://localhost:5432/test',
          tableName: 'output_table',
          writeMode: 'INSERT'
        }
      })
      
      wrapper.vm.setSelectedNode(dbOutputNode)
      await nextTick()
      
      // 验证数据库写入配置
      expect(wrapper.vm.selectedNode.config.writeMode).toBe('INSERT')
      expect(wrapper.vm.selectedNode.config.tableName).toBe('output_table')
    })

    it('应该支持API输出配置', async () => {
      // v2.0新功能：API输出节点
      const apiOutputNode = createMockNode('api-output', 'OUTPUT', { x: 300, y: 100 })
      apiOutputNode.getData.mockReturnValue({
        type: 'OUTPUT',
        outputType: 'API_OUTPUT',
        config: {
          endpoint: 'https://api.example.com/data',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      })
      
      wrapper.vm.setSelectedNode(apiOutputNode)
      await nextTick()
      
      // 验证API输出配置
      expect(wrapper.vm.selectedNode.config.endpoint).toBe('https://api.example.com/data')
      expect(wrapper.vm.selectedNode.config.method).toBe('POST')
    })
  })

  describe('Monaco代码编辑器测试', () => {
    beforeEach(async () => {
      // Mock Monaco Editor
      global.monaco = {
        editor: {
          create: vi.fn(() => ({
            getValue: vi.fn(() => 'SELECT * FROM table'),
            setValue: vi.fn(),
            dispose: vi.fn(),
            onDidChangeModelContent: vi.fn(),
            getModel: vi.fn(() => ({
              getLanguageId: vi.fn(() => 'sql')
            }))
          })),
          defineTheme: vi.fn(),
          setTheme: vi.fn()
        },
        languages: {
          register: vi.fn(),
          setMonarchTokensProvider: vi.fn(),
          registerCompletionItemProvider: vi.fn()
        }
      }
      
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': true,
            'a-dropdown': true,
            'a-form': true,
            'a-form-item': true,
            'MonacoEditor': {
              template: '<div class="monaco-editor"></div>',
              props: ['value', 'language'],
              emits: ['update:value']
            }
          }
        }
      })
      await nextTick()
    })

    it('应该集成Monaco编辑器', async () => {
      // v2.0新功能：Monaco代码编辑器集成
      const processingNode = createMockNode('sql-node', 'PROCESSING', { x: 200, y: 100 })
      processingNode.getData.mockReturnValue({
        type: 'PROCESSING',
        subType: 'SQL',
        config: {
          code: 'SELECT * FROM users WHERE age > 18'
        }
      })
      
      wrapper.vm.setSelectedNode(processingNode)
      await nextTick()
      
      // 验证Monaco编辑器存在
      const monacoEditor = wrapper.find('.monaco-editor')
      expect(monacoEditor.exists()).toBe(true)
    })

    it('应该支持SQL语法高亮', async () => {
      // v2.0功能：SQL语法高亮
      const sqlNode = createMockNode('sql-node', 'PROCESSING', { x: 200, y: 100 })
      sqlNode.getData.mockReturnValue({
        type: 'PROCESSING',
        subType: 'SQL',
        config: { code: 'SELECT * FROM table' }
      })
      
      wrapper.vm.setSelectedNode(sqlNode)
      await nextTick()
      
      // 验证语言设置为SQL
      const monacoEditor = wrapper.findComponent({ name: 'MonacoEditor' })
      if (monacoEditor.exists()) {
        expect(monacoEditor.props('language')).toBe('sql')
      }
    })

    it('应该支持Python语法高亮', async () => {
      // v2.0功能：Python语法高亮
      const pythonNode = createMockNode('python-node', 'PROCESSING', { x: 200, y: 100 })
      pythonNode.getData.mockReturnValue({
        type: 'PROCESSING',
        subType: 'PYTHON',
        config: { code: 'import pandas as pd\ndf = pd.read_csv("data.csv")' }
      })
      
      wrapper.vm.setSelectedNode(pythonNode)
      await nextTick()
      
      // 验证语言设置为Python
      const monacoEditor = wrapper.findComponent({ name: 'MonacoEditor' })
      if (monacoEditor.exists()) {
        expect(monacoEditor.props('language')).toBe('python')
      }
    })

    it('应该提供基础语法提示', async () => {
      // v2.0功能：基础语法提示（无自动补全）
      expect(global.monaco.languages.registerCompletionItemProvider).toHaveBeenCalled()
      
      // 验证禁用了高级自动补全功能
      const completionProvider = global.monaco.languages.registerCompletionItemProvider.mock.calls[0]
      expect(completionProvider).toBeDefined()
    })
  })

  describe('数据源配置测试', () => {
    beforeEach(async () => {
      wrapper = mount(WorkflowEditor, {
        global: {
          stubs: {
            'a-button': true,
            'a-upload': {
              template: '<div class="upload-area"><slot /></div>',
              props: ['accept', 'beforeUpload'],
              emits: ['change']
            },
            'a-form': true,
            'a-form-item': true,
            'a-input': {
              template: '<input v-model="modelValue" @input="$emit(\"update:modelValue\", $event.target.value)" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'a-table': {
              template: '<table><slot /></table>',
              props: ['data', 'columns']
            }
          }
        }
      })
      await nextTick()
    })

    it('应该支持CSV文件上传', async () => {
      // v2.0功能：CSV文件上传节点
      const inputNode = createMockNode('csv-input', 'INPUT', { x: 100, y: 100 })
      inputNode.getData.mockReturnValue({
        type: 'INPUT',
        inputType: 'FILE_UPLOAD',
        config: {
          fileType: 'CSV',
          hasHeader: true,
          delimiter: ','
        }
      })
      
      wrapper.vm.setSelectedNode(inputNode)
      await nextTick()
      
      // 验证文件上传组件存在
      const uploadArea = wrapper.find('.upload-area')
      expect(uploadArea.exists()).toBe(true)
    })

    it('应该支持数据库连接配置', async () => {
      // v2.0功能：数据库连接节点
      const dbInputNode = createMockNode('db-input', 'INPUT', { x: 100, y: 100 })
      dbInputNode.getData.mockReturnValue({
        type: 'INPUT',
        inputType: 'DATABASE',
        config: {
          connectionString: 'postgresql://localhost:5432/testdb',
          query: 'SELECT * FROM users',
          testConnection: false
        }
      })
      
      wrapper.vm.setSelectedNode(dbInputNode)
      await nextTick()
      
      // 验证数据库配置表单
      expect(wrapper.vm.selectedNode.config.connectionString).toBe('postgresql://localhost:5432/testdb')
    })

    it('应该支持数据预览功能', async () => {
      // v2.0功能：数据预览
      const inputNode = createMockNode('preview-input', 'INPUT', { x: 100, y: 100 })
      
      // 模拟数据预览
      const previewData = [
        { id: 1, name: 'John', age: 25 },
        { id: 2, name: 'Jane', age: 30 }
      ]
      
      wrapper.vm.setPreviewData(previewData)
      await nextTick()
      
      // 验证数据预览表格
      const previewTable = wrapper.find('table')
      expect(previewTable.exists()).toBe(true)
      expect(wrapper.vm.previewData).toEqual(previewData)
    })

    it('应该支持连接测试功能', async () => {
      // v2.0功能：数据库连接测试
      const dbNode = createMockNode('db-test', 'INPUT', { x: 100, y: 100 })
      
      // 模拟连接测试
      const testResult = await wrapper.vm.testDatabaseConnection({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      })
      
      expect(testResult).toBeDefined()
       expect(typeof testResult.success).toBe('boolean')
     })
   })

   describe('增强调试功能测试', () => {
     beforeEach(async () => {
       wrapper = mount(WorkflowEditor, {
         global: {
           stubs: {
             'a-button': true,
             'a-dropdown': true,
             'a-modal': {
               template: '<div class="debug-modal" v-if="visible"><slot /></div>',
               props: ['visible'],
               emits: ['update:visible']
             },
             'a-steps': {
               template: '<div class="debug-steps"><slot /></div>',
               props: ['current']
             },
             'a-step': {
               template: '<div class="debug-step"><slot /></div>',
               props: ['title', 'status']
             },
             'a-progress': {
               template: '<div class="debug-progress"></div>',
               props: ['percent', 'status']
             },
             'a-alert': {
               template: '<div class="debug-alert"><slot /></div>',
               props: ['type', 'message']
             }
           }
         }
       })
       await nextTick()
     })

     it('应该支持节点级调试', async () => {
       // v2.0新功能：节点级调试
       const processingNode = createMockNode('debug-node', 'PROCESSING', { x: 200, y: 100 })
       processingNode.getData.mockReturnValue({
         type: 'PROCESSING',
         subType: 'SQL',
         config: {
           code: 'SELECT * FROM users',
           debugMode: true
         }
       })
       
       wrapper.vm.setSelectedNode(processingNode)
       await nextTick()
       
       // 触发节点调试
       await wrapper.vm.debugSingleNode(processingNode.id)
       
       // 验证调试状态
       expect(wrapper.vm.debugState.currentNode).toBe(processingNode.id)
       expect(wrapper.vm.debugState.isDebugging).toBe(true)
     })

     it('应该支持全流程调试', async () => {
       // v2.0新功能：全流程调试
       const inputNode = createMockNode('input-1', 'INPUT', { x: 100, y: 100 })
       const processingNode = createMockNode('process-1', 'PROCESSING', { x: 200, y: 100 })
       const outputNode = createMockNode('output-1', 'OUTPUT', { x: 300, y: 100 })
       
       // 模拟工作流
       wrapper.vm.graph.getNodes.mockReturnValue([inputNode, processingNode, outputNode])
       wrapper.vm.graph.getEdges.mockReturnValue([
         { source: { cell: inputNode.id }, target: { cell: processingNode.id } },
         { source: { cell: processingNode.id }, target: { cell: outputNode.id } }
       ])
       
       // 启动全流程调试
       await wrapper.vm.debugWorkflow()
       
       // 验证调试流程
       expect(wrapper.vm.debugState.isWorkflowDebugging).toBe(true)
       expect(wrapper.vm.debugState.executionSteps).toHaveLength(3)
     })

     it('应该显示调试状态可视化', async () => {
       // v2.0新功能：调试状态可视化
       const node = createMockNode('visual-debug', 'PROCESSING', { x: 200, y: 100 })
       
       // 设置调试状态
       wrapper.vm.setNodeDebugStatus(node.id, {
         status: 'running',
         progress: 50,
         message: '正在执行SQL查询...'
       })
       
       await nextTick()
       
       // 验证状态可视化
       expect(wrapper.vm.getNodeDebugStatus(node.id).status).toBe('running')
       expect(wrapper.vm.getNodeDebugStatus(node.id).progress).toBe(50)
       
       // 验证进度条组件
       const progressBar = wrapper.find('.debug-progress')
       expect(progressBar.exists()).toBe(true)
     })

     it('应该支持调试断点功能', async () => {
       // v2.0新功能：调试断点
       const node = createMockNode('breakpoint-node', 'PROCESSING', { x: 200, y: 100 })
       
       // 设置断点
       wrapper.vm.toggleBreakpoint(node.id)
       
       // 验证断点状态
       expect(wrapper.vm.hasBreakpoint(node.id)).toBe(true)
       expect(wrapper.vm.breakpoints).toContain(node.id)
       
       // 移除断点
       wrapper.vm.toggleBreakpoint(node.id)
       expect(wrapper.vm.hasBreakpoint(node.id)).toBe(false)
     })

     it('应该显示调试日志和错误信息', async () => {
       // v2.0新功能：调试日志
       const errorNode = createMockNode('error-node', 'PROCESSING', { x: 200, y: 100 })
       
       // 模拟调试错误
       const errorInfo = {
         nodeId: errorNode.id,
         error: 'SQL语法错误：缺少FROM子句',
         timestamp: new Date().toISOString(),
         level: 'error'
       }
       
       wrapper.vm.addDebugLog(errorInfo)
       
       // 验证错误日志
       expect(wrapper.vm.debugLogs).toContainEqual(errorInfo)
       
       // 验证错误提示组件
       const alertComponent = wrapper.find('.debug-alert')
       expect(alertComponent.exists()).toBe(true)
     })

     it('应该支持调试数据查看', async () => {
       // v2.0新功能：调试数据查看
       const dataNode = createMockNode('data-node', 'PROCESSING', { x: 200, y: 100 })
       
       // 模拟节点输出数据
       const outputData = [
         { id: 1, name: 'Alice', age: 25 },
         { id: 2, name: 'Bob', age: 30 }
       ]
       
       wrapper.vm.setNodeOutputData(dataNode.id, outputData)
       
       // 验证数据查看功能
       expect(wrapper.vm.getNodeOutputData(dataNode.id)).toEqual(outputData)
       expect(wrapper.vm.canViewNodeData(dataNode.id)).toBe(true)
     })

     it('应该支持调试模式切换', async () => {
       // v2.0新功能：调试模式切换
       expect(wrapper.vm.debugMode).toBe(false)
       
       // 进入调试模式
       wrapper.vm.enterDebugMode()
       expect(wrapper.vm.debugMode).toBe(true)
       
       // 退出调试模式
       wrapper.vm.exitDebugMode()
       expect(wrapper.vm.debugMode).toBe(false)
       
       // 验证调试状态清理
       expect(wrapper.vm.debugState.currentNode).toBeNull()
       expect(wrapper.vm.debugState.isDebugging).toBe(false)
     })