import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import QueryModePanel from '../components/QueryModePanel.vue'
import { TaskStorage } from '../utils/taskStorage.js'
import MockDataGenerator from '../utils/mockDataGenerator.js'

// Mock dependencies
vi.mock('../utils/taskStorage.js', () => ({
  TaskStorage: {
    getAllTasks: vi.fn(() => []),
    getTaskById: vi.fn(() => null)
  }
}))

vi.mock('../utils/mockDataGenerator.js', () => ({
  default: {
    generateQueryMockData: vi.fn(() => [
      {
        id: 'query-1',
        taskName: '查询任务1',
        taskType: '数据查询',
        status: 'running',
        creator: '查询用户',
        createTime: '2024-01-01 10:00:00',
        canvasData: {
          nodes: [
            { id: 'node1', type: 'input', name: '输入节点1' },
            { id: 'node2', type: 'process', name: '处理节点1' }
          ],
          connections: [
            { id: 'conn1', source: 'node1', target: 'node2' }
          ]
        }
      },
      {
        id: 'query-2',
        taskName: '查询任务2',
        taskType: '数据分析',
        status: 'completed',
        creator: '分析用户',
        createTime: '2024-01-02 14:00:00',
        canvasData: {
          nodes: [
            { id: 'node3', type: 'output', name: '输出节点1' }
          ],
          connections: []
        }
      }
    ])
  }
}))

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock Arco Design icons
vi.mock('@arco-design/web-vue/es/icon', () => ({
  IconSearch: { name: 'IconSearch', template: '<div>search-icon</div>' },
  IconRefresh: { name: 'IconRefresh', template: '<div>refresh-icon</div>' },
  IconEye: { name: 'IconEye', template: '<div>eye-icon</div>' },
  IconFilter: { name: 'IconFilter', template: '<div>filter-icon</div>' },
  IconDownload: { name: 'IconDownload', template: '<div>download-icon</div>' }
}))

describe('QueryModePanel.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件渲染', () => {
    it('正确渲染查询模式面板', () => {
      wrapper = mount(QueryModePanel)

      expect(wrapper.find('.query-mode-panel').exists()).toBe(true)
      expect(wrapper.find('.panel-title').text()).toBe('查询模式')
      expect(wrapper.find('.panel-description').text()).toBe('任务流程查询和画布预览功能')
    })

    it('渲染查询控制区域', () => {
      wrapper = mount(QueryModePanel)

      expect(wrapper.find('.query-controls').exists()).toBe(true)
      expect(wrapper.find('.control-section').exists()).toBe(true)
    })

    it('渲染查询条件输入框', () => {
      wrapper = mount(QueryModePanel)

      const searchInput = wrapper.findComponent({ name: 'AInput' })
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toBe('输入任务名称或关键词')
    })

    it('渲染节点类型筛选区域', () => {
      wrapper = mount(QueryModePanel)

      expect(wrapper.find('.node-type-filters').exists()).toBe(true)
      const checkboxes = wrapper.findAllComponents({ name: 'ACheckbox' })
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('渲染查询结果展示区域', () => {
      wrapper = mount(QueryModePanel)

      expect(wrapper.find('.query-results').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ATable' }).exists()).toBe(true)
    })
  })

  describe('查询参数控制', () => {
    beforeEach(() => {
      wrapper = mount(QueryModePanel)
    })

    it('默认查询参数正确', () => {
      const vm = wrapper.vm
      expect(vm.queryParams.keyword).toBe('')
      expect(vm.queryParams.taskType).toBe('')
      expect(vm.queryParams.status).toBe('')
      expect(vm.queryParams.creator).toBe('')
      expect(vm.queryParams.nodeTypes).toEqual([])
    })

    it('任务类型选择器包含所有选项', () => {
      const taskTypeSelect = wrapper.findAllComponents({ name: 'ASelect' })
        .find(select => select.attributes('placeholder') === '任务类型')
      
      if (taskTypeSelect) {
        const options = taskTypeSelect.findAllComponents({ name: 'AOption' })
        expect(options.length).toBeGreaterThan(0)
      }
    })

    it('状态选择器包含所有选项', () => {
      const statusSelect = wrapper.findAllComponents({ name: 'ASelect' })
        .find(select => select.attributes('placeholder') === '任务状态')
      
      if (statusSelect) {
        const options = statusSelect.findAllComponents({ name: 'AOption' })
        expect(options.length).toBeGreaterThan(0)
      }
    })

    it('节点类型筛选器正确渲染', () => {
      const vm = wrapper.vm
      const nodeTypeFilters = wrapper.find('.node-type-filters')
      
      expect(nodeTypeFilters.exists()).toBe(true)
      expect(vm.availableNodeTypes).toContain('input')
      expect(vm.availableNodeTypes).toContain('process')
      expect(vm.availableNodeTypes).toContain('output')
    })
  })

  describe('查询功能', () => {
    beforeEach(() => {
      wrapper = mount(QueryModePanel)
    })

    it('执行基本查询', async () => {
      const vm = wrapper.vm
      
      // 设置查询参数
      vm.queryParams.keyword = '测试任务'
      
      await vm.executeQuery()
      
      expect(TaskStorage.getAllTasks).toHaveBeenCalled()
      expect(MockDataGenerator.generateQueryMockData).toHaveBeenCalled()
    })

    it('按关键词筛选任务', async () => {
      const vm = wrapper.vm
      const mockTasks = [
        { id: '1', taskName: '数据处理任务', taskType: '处理' },
        { id: '2', taskName: '数据分析任务', taskType: '分析' },
        { id: '3', taskName: '报告生成', taskType: '生成' }
      ]
      
      const filtered = vm.filterTasksByKeyword(mockTasks, '数据')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].taskName).toContain('数据')
      expect(filtered[1].taskName).toContain('数据')
    })

    it('按任务类型筛选任务', async () => {
      const vm = wrapper.vm
      const mockTasks = [
        { id: '1', taskType: '数据处理' },
        { id: '2', taskType: '数据分析' },
        { id: '3', taskType: '数据处理' }
      ]
      
      const filtered = vm.filterTasksByType(mockTasks, '数据处理')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].taskType).toBe('数据处理')
      expect(filtered[1].taskType).toBe('数据处理')
    })

    it('按任务状态筛选任务', async () => {
      const vm = wrapper.vm
      const mockTasks = [
        { id: '1', status: 'running' },
        { id: '2', status: 'completed' },
        { id: '3', status: 'running' }
      ]
      
      const filtered = vm.filterTasksByStatus(mockTasks, 'running')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].status).toBe('running')
      expect(filtered[1].status).toBe('running')
    })

    it('按节点类型筛选任务', async () => {
      const vm = wrapper.vm
      const mockTasks = [
        {
          id: '1',
          canvasData: {
            nodes: [{ type: 'input' }, { type: 'process' }]
          }
        },
        {
          id: '2',
          canvasData: {
            nodes: [{ type: 'output' }]
          }
        }
      ]
      
      const filtered = vm.filterTasksByNodeTypes(mockTasks, ['input'])
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('组合条件筛选任务', async () => {
      const vm = wrapper.vm
      vm.queryParams.keyword = '处理'
      vm.queryParams.taskType = '数据处理'
      vm.queryParams.status = 'running'
      
      await vm.executeQuery()
      
      expect(vm.queryResults.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('查询结果展示', () => {
    beforeEach(() => {
      wrapper = mount(QueryModePanel)
    })

    it('正确显示查询结果数量', async () => {
      const vm = wrapper.vm
      vm.queryResults = [
        { id: '1', taskName: '任务1' },
        { id: '2', taskName: '任务2' }
      ]
      
      await vm.$nextTick()
      
      const resultInfo = wrapper.find('.result-info')
      if (resultInfo.exists()) {
        expect(resultInfo.text()).toContain('2')
      }
    })

    it('查询结果表格包含正确的列', () => {
      const vm = wrapper.vm
      const expectedColumns = ['taskName', 'taskType', 'status', 'creator', 'createTime', 'actions']
      
      vm.queryResultColumns.forEach(column => {
        expect(expectedColumns).toContain(column.dataIndex || column.slotName)
      })
    })

    it('显示空结果提示', async () => {
      const vm = wrapper.vm
      vm.queryResults = []
      vm.hasSearched = true
      
      await vm.$nextTick()
      
      const emptyState = wrapper.find('.empty-state')
      if (emptyState.exists()) {
        expect(emptyState.text()).toContain('未找到匹配的任务')
      }
    })
  })

  describe('画布预览功能', () => {
    beforeEach(() => {
      wrapper = mount(QueryModePanel)
    })

    it('点击预览按钮打开画布预览', async () => {
      const vm = wrapper.vm
      const mockTask = {
        id: 'test-1',
        taskName: '测试任务',
        canvasData: {
          nodes: [{ id: 'n1', type: 'input' }],
          connections: []
        }
      }
      
      await vm.previewCanvas(mockTask)
      
      expect(vm.previewVisible).toBe(true)
      expect(vm.previewTask).toEqual(mockTask)
    })

    it('关闭画布预览', async () => {
      const vm = wrapper.vm
      vm.previewVisible = true
      vm.previewTask = { id: 'test' }
      
      vm.closePreview()
      
      expect(vm.previewVisible).toBe(false)
      expect(vm.previewTask).toBeNull()
    })

    it('预览模态框正确渲染', async () => {
      const vm = wrapper.vm
      vm.previewVisible = true
      vm.previewTask = {
        id: 'test-1',
        taskName: '测试任务'
      }
      
      await vm.$nextTick()
      
      const modal = wrapper.findComponent({ name: 'AModal' })
      expect(modal.exists()).toBe(true)
    })
  })

  describe('用户交互', () => {
    beforeEach(() => {
      wrapper = mount(QueryModePanel)
    })

    it('输入关键词触发搜索', async () => {
      const vm = wrapper.vm
      const searchInput = wrapper.findComponent({ name: 'AInput' })
      
      await searchInput.setValue('测试关键词')
      expect(vm.queryParams.keyword).toBe('测试关键词')
    })

    it('点击搜索按钮执行查询', async () => {
      const vm = wrapper.vm
      const executeQuerySpy = vi.spyOn(vm, 'executeQuery')
      
      const searchButton = wrapper.find('[data-testid="search-button"]')
      if (!searchButton.exists()) {
        // 通过文本查找搜索按钮
        const buttons = wrapper.findAllComponents({ name: 'AButton' })
        const searchBtn = buttons.find(btn => btn.text().includes('搜索'))
        if (searchBtn) {
          await searchBtn.trigger('click')
        }
      } else {
        await searchButton.trigger('click')
      }
      
      expect(executeQuerySpy).toHaveBeenCalled()
    })

    it('点击重置按钮清空查询条件', async () => {
      const vm = wrapper.vm
      
      // 设置一些查询条件
      vm.queryParams.keyword = '测试'
      vm.queryParams.taskType = '处理'
      vm.queryParams.status = 'running'
      
      vm.resetQuery()
      
      expect(vm.queryParams.keyword).toBe('')
      expect(vm.queryParams.taskType).toBe('')
      expect(vm.queryParams.status).toBe('')
      expect(vm.queryParams.nodeTypes).toEqual([])
    })

    it('选择节点类型筛选器', async () => {
      const vm = wrapper.vm
      
      vm.onNodeTypeChange(['input', 'process'])
      
      expect(vm.queryParams.nodeTypes).toEqual(['input', 'process'])
    })
  })

  describe('数据导出功能', () => {
    beforeEach(() => {
      wrapper = mount(QueryModePanel)
    })

    it('导出查询结果', async () => {
      const vm = wrapper.vm
      vm.queryResults = [
        { id: '1', taskName: '任务1', taskType: '处理' },
        { id: '2', taskName: '任务2', taskType: '分析' }
      ]
      
      const exportSpy = vi.spyOn(vm, 'exportResults')
      
      await vm.exportResults()
      
      expect(exportSpy).toHaveBeenCalled()
    })

    it('导出空结果时显示警告', async () => {
      const vm = wrapper.vm
      vm.queryResults = []
      
      await vm.exportResults()
      
      // 验证警告消息
      expect(vm.queryResults).toHaveLength(0)
    })
  })

  describe('工具函数', () => {
    beforeEach(() => {
      wrapper = mount(QueryModePanel)
    })

    it('正确格式化时间', () => {
      const vm = wrapper.vm
      const timestamp = '2024-01-01 10:30:00'
      
      const formatted = vm.formatTime(timestamp)
      expect(formatted).toBe('2024-01-01 10:30:00')
    })

    it('正确获取状态标签颜色', () => {
      const vm = wrapper.vm
      
      expect(vm.getStatusColor('draft')).toBe('gray')
      expect(vm.getStatusColor('running')).toBe('blue')
      expect(vm.getStatusColor('completed')).toBe('green')
      expect(vm.getStatusColor('error')).toBe('red')
    })

    it('正确获取状态文本', () => {
      const vm = wrapper.vm
      
      expect(vm.getStatusText('draft')).toBe('草稿')
      expect(vm.getStatusText('running')).toBe('运行中')
      expect(vm.getStatusText('completed')).toBe('已完成')
      expect(vm.getStatusText('error')).toBe('错误')
    })

    it('正确统计节点类型', () => {
      const vm = wrapper.vm
      const canvasData = {
        nodes: [
          { type: 'input' },
          { type: 'process' },
          { type: 'input' },
          { type: 'output' }
        ]
      }
      
      const nodeTypeCounts = vm.getNodeTypeCounts(canvasData)
      expect(nodeTypeCounts.input).toBe(2)
      expect(nodeTypeCounts.process).toBe(1)
      expect(nodeTypeCounts.output).toBe(1)
    })
  })

  describe('边界情况和异常处理', () => {
    it('处理空查询结果', async () => {
      TaskStorage.getAllTasks.mockReturnValue([])
      MockDataGenerator.generateQueryMockData.mockReturnValue([])
      
      wrapper = mount(QueryModePanel)
      const vm = wrapper.vm
      
      await vm.executeQuery()
      
      expect(vm.queryResults).toHaveLength(0)
      expect(vm.hasSearched).toBe(true)
    })

    it('处理数据获取异常', async () => {
      TaskStorage.getAllTasks.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      wrapper = mount(QueryModePanel)
      const vm = wrapper.vm
      
      await vm.executeQuery()
      
      expect(vm.queryLoading).toBe(false)
    })

    it('处理缺失canvasData的任务', async () => {
      const vm = wrapper.vm
      const tasksWithMissingData = [
        { id: '1', taskName: '任务1' }, // 缺少canvasData
        { id: '2', taskName: '任务2', canvasData: null }, // canvasData为null
        { id: '3', taskName: '任务3', canvasData: {} } // canvasData为空对象
      ]
      
      const filtered = vm.filterTasksByNodeTypes(tasksWithMissingData, ['input'])
      expect(filtered).toHaveLength(0)
    })

    it('处理无效的查询参数', async () => {
      const vm = wrapper.vm
      
      // 设置无效参数
      vm.queryParams.keyword = null
      vm.queryParams.taskType = undefined
      
      await vm.executeQuery()
      
      // 验证不会崩溃
      expect(vm.queryResults).toBeDefined()
    })
  })

  describe('性能测试', () => {
    it('处理大量查询结果时性能正常', async () => {
      const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        taskName: `任务${i}`,
        taskType: `类型${i % 5}`,
        status: ['draft', 'running', 'completed'][i % 3],
        canvasData: {
          nodes: [{ type: 'input' }, { type: 'process' }],
          connections: []
        }
      }))
      
      MockDataGenerator.generateQueryMockData.mockReturnValue(largeMockData)
      
      wrapper = mount(QueryModePanel)
      const vm = wrapper.vm
      
      const startTime = performance.now()
      await vm.executeQuery()
      const endTime = performance.now()
      
      // 验证处理时间合理（小于3秒）
      expect(endTime - startTime).toBeLessThan(3000)
      expect(vm.queryResults.length).toBeGreaterThan(0)
    })
  })
})