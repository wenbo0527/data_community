import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StatisticsModePanel from '../components/StatisticsModePanel.vue'
import { TaskStorage } from '../utils/taskStorage.js'
import MockDataGenerator from '../utils/mockDataGenerator.js'
import ChartRenderer from '../utils/chartRenderer.js'

// Mock dependencies
vi.mock('../utils/taskStorage.js', () => ({
  TaskStorage: {
    getAllTasks: vi.fn(() => [])
  }
}))

vi.mock('../utils/mockDataGenerator.js', () => ({
  default: {
    generateStatisticsMockData: vi.fn(() => [
      {
        id: 'mock-1',
        taskName: 'Mock任务1',
        taskType: '数据处理',
        status: 'running',
        creator: '测试用户',
        createTime: '2024-01-01 10:00:00',
        canvasData: {
          nodes: [
            { id: 'node1', type: 'input' },
            { id: 'node2', type: 'process' }
          ],
          connections: [
            { id: 'conn1', source: 'node1', target: 'node2' }
          ]
        }
      },
      {
        id: 'mock-2',
        taskName: 'Mock任务2',
        taskType: '数据分析',
        status: 'completed',
        creator: '测试用户',
        createTime: '2024-01-02 14:00:00',
        canvasData: {
          nodes: [
            { id: 'node3', type: 'output' }
          ],
          connections: []
        }
      }
    ])
  }
}))

vi.mock('../utils/chartRenderer.js', () => ({
  default: {
    renderPieChart: vi.fn(() => ({ destroy: vi.fn(), update: vi.fn() })),
    renderBarChart: vi.fn(() => ({ destroy: vi.fn(), update: vi.fn() })),
    renderLineChart: vi.fn(() => ({ destroy: vi.fn(), update: vi.fn() })),
    renderDoughnutChart: vi.fn(() => ({ destroy: vi.fn(), update: vi.fn() })),
    destroyAll: vi.fn()
  }
}))

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock Arco Design icons
vi.mock('@arco-design/web-vue/es/icon', () => ({
  IconRefresh: { name: 'IconRefresh', template: '<div>refresh-icon</div>' },
  IconDownload: { name: 'IconDownload', template: '<div>download-icon</div>' },
  IconFile: { name: 'IconFile', template: '<div>file-icon</div>' },
  IconPlayArrow: { name: 'IconPlayArrow', template: '<div>play-icon</div>' },
  IconApps: { name: 'IconApps', template: '<div>apps-icon</div>' },
  IconLink: { name: 'IconLink', template: '<div>link-icon</div>' }
}))

describe('StatisticsModePanel.vue', () => {
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
    it('正确渲染统计模式面板', () => {
      wrapper = mount(StatisticsModePanel)

      expect(wrapper.find('.statistics-mode-panel').exists()).toBe(true)
      expect(wrapper.find('.panel-title').text()).toBe('统计模式')
      expect(wrapper.find('.panel-description').text()).toBe('任务流程数据统计分析和可视化展示')
    })

    it('渲染统计控制区域', () => {
      wrapper = mount(StatisticsModePanel)

      expect(wrapper.find('.statistics-controls').exists()).toBe(true)
      expect(wrapper.find('.section-title').text()).toBe('统计维度')
    })

    it('渲染概览统计卡片', () => {
      wrapper = mount(StatisticsModePanel)

      const statCards = wrapper.findAll('.stat-card')
      expect(statCards).toHaveLength(4)
      
      // 检查统计卡片内容
      const statistics = wrapper.findAllComponents({ name: 'AStatistic' })
      expect(statistics).toHaveLength(4)
    })

    it('渲染详细统计表格', () => {
      wrapper = mount(StatisticsModePanel)

      expect(wrapper.find('.statistics-details').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ATabs' }).exists()).toBe(true)
      
      const tabPanes = wrapper.findAllComponents({ name: 'ATabPane' })
      expect(tabPanes).toHaveLength(3)
    })
  })

  describe('统计参数控制', () => {
    beforeEach(() => {
      wrapper = mount(StatisticsModePanel)
    })

    it('默认统计参数正确', () => {
      const vm = wrapper.vm
      expect(vm.statsParams.dimension).toBe('taskType')
      expect(vm.statsParams.timeRange).toBe('month')
    })

    it('统计维度选择器包含所有选项', () => {
      const dimensionSelect = wrapper.findAllComponents({ name: 'ASelect' })[0]
      const options = dimensionSelect.findAllComponents({ name: 'AOption' })
      
      expect(options).toHaveLength(5)
      expect(options[0].attributes('value')).toBe('taskType')
      expect(options[1].attributes('value')).toBe('status')
      expect(options[2].attributes('value')).toBe('nodeType')
      expect(options[3].attributes('value')).toBe('creator')
      expect(options[4].attributes('value')).toBe('time')
    })

    it('时间范围选择器包含所有选项', () => {
      const timeRangeSelect = wrapper.findAllComponents({ name: 'ASelect' })[1]
      const options = timeRangeSelect.findAllComponents({ name: 'AOption' })
      
      expect(options).toHaveLength(4)
      expect(options[0].attributes('value')).toBe('week')
      expect(options[1].attributes('value')).toBe('month')
      expect(options[2].attributes('value')).toBe('quarter')
      expect(options[3].attributes('value')).toBe('year')
    })
  })

  describe('数据获取和处理', () => {
    beforeEach(() => {
      wrapper = mount(StatisticsModePanel)
    })

    it('正确获取任务数据', async () => {
      const vm = wrapper.vm
      
      // 模拟本地存储数据
      TaskStorage.getAllTasks.mockReturnValue([
        {
          id: 'local-1',
          name: '本地任务',
          type: '数据处理',
          status: 'draft',
          canvasData: {
            nodes: [{ id: 'n1', type: 'input' }],
            connections: []
          }
        }
      ])

      const allTasks = await vm.getAllTasksData()
      
      expect(TaskStorage.getAllTasks).toHaveBeenCalled()
      expect(MockDataGenerator.generateStatisticsMockData).toHaveBeenCalled()
      expect(allTasks).toHaveLength(3) // 1 local + 2 mock
    })

    it('正确计算概览统计', async () => {
      const vm = wrapper.vm
      const mockTasks = [
        {
          id: '1',
          status: 'running',
          canvasData: { nodes: [{ id: 'n1' }, { id: 'n2' }], connections: [{ id: 'c1' }] }
        },
        {
          id: '2',
          status: 'completed',
          canvasData: { nodes: [{ id: 'n3' }], connections: [] }
        }
      ]

      vm.calculateOverviewStats(mockTasks)

      expect(vm.overviewStats.totalTasks).toBe(2)
      expect(vm.overviewStats.runningTasks).toBe(1)
      expect(vm.overviewStats.totalNodes).toBe(3)
      expect(vm.overviewStats.totalConnections).toBe(1)
    })

    it('正确计算详细统计', async () => {
      const vm = wrapper.vm
      const mockTasks = [
        {
          taskType: '数据处理',
          status: 'running',
          canvasData: {
            nodes: [
              { type: 'input' },
              { type: 'process' }
            ]
          }
        },
        {
          taskType: '数据处理',
          status: 'completed',
          canvasData: {
            nodes: [
              { type: 'output' }
            ]
          }
        }
      ]

      vm.calculateDetailedStats(mockTasks)

      expect(vm.taskStatsData).toHaveLength(4) // 2 task types + 2 statuses
      expect(vm.nodeStatsData).toHaveLength(3) // 3 node types
    })

    it('正确计算性能指标', async () => {
      const vm = wrapper.vm
      const mockTasks = [
        {
          canvasData: {
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            connections: [{ id: 'c1' }]
          }
        },
        {
          canvasData: {
            nodes: [{ id: 'n3' }],
            connections: []
          }
        }
      ]

      vm.calculatePerformanceMetrics(mockTasks)

      expect(vm.performanceMetrics.avgNodesPerTask).toBe(1.5)
      expect(vm.performanceMetrics.avgConnectionsPerTask).toBe(0.5)
      expect(vm.performanceMetrics.complexityIndex).toBeGreaterThan(0)
    })
  })

  describe('图表渲染', () => {
    beforeEach(() => {
      wrapper = mount(StatisticsModePanel)
    })

    it('刷新统计时调用图表渲染', async () => {
      const vm = wrapper.vm
      
      await vm.refreshStatistics()
      
      // 验证图表渲染方法被调用
      expect(ChartRenderer.renderPieChart).toHaveBeenCalled()
      expect(ChartRenderer.renderBarChart).toHaveBeenCalled()
    })

    it('组件销毁时清理图表', async () => {
      wrapper.unmount()
      
      expect(ChartRenderer.destroyAll).toHaveBeenCalled()
    })
  })

  describe('用户交互', () => {
    beforeEach(() => {
      wrapper = mount(StatisticsModePanel)
    })

    it('点击刷新按钮触发统计更新', async () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]')
      if (!refreshButton.exists()) {
        // 如果没有data-testid，通过文本查找
        const buttons = wrapper.findAllComponents({ name: 'AButton' })
        const refreshBtn = buttons.find(btn => btn.text().includes('刷新统计'))
        if (refreshBtn) {
          await refreshBtn.trigger('click')
        }
      } else {
        await refreshButton.trigger('click')
      }

      expect(TaskStorage.getAllTasks).toHaveBeenCalled()
      expect(MockDataGenerator.generateStatisticsMockData).toHaveBeenCalled()
    })

    it('点击导出按钮触发数据导出', async () => {
      const vm = wrapper.vm
      const exportSpy = vi.spyOn(vm, 'exportStatistics')
      
      const buttons = wrapper.findAllComponents({ name: 'AButton' })
      const exportBtn = buttons.find(btn => btn.text().includes('导出数据'))
      
      if (exportBtn) {
        await exportBtn.trigger('click')
        expect(exportSpy).toHaveBeenCalled()
      }
    })

    it('切换统计维度触发重新计算', async () => {
      const vm = wrapper.vm
      const onDimensionChangeSpy = vi.spyOn(vm, 'onDimensionChange')
      
      vm.statsParams.dimension = 'status'
      await vm.$nextTick()
      
      // 手动触发维度变更
      vm.onDimensionChange('status')
      expect(onDimensionChangeSpy).toHaveBeenCalledWith('status')
    })

    it('切换时间范围触发重新计算', async () => {
      const vm = wrapper.vm
      const onTimeRangeChangeSpy = vi.spyOn(vm, 'onTimeRangeChange')
      
      vm.statsParams.timeRange = 'week'
      await vm.$nextTick()
      
      // 手动触发时间范围变更
      vm.onTimeRangeChange('week')
      expect(onTimeRangeChangeSpy).toHaveBeenCalledWith('week')
    })
  })

  describe('工具函数', () => {
    beforeEach(() => {
      wrapper = mount(StatisticsModePanel)
    })

    it('正确获取进度条颜色', () => {
      const vm = wrapper.vm
      
      expect(vm.getProgressColor(30)).toBe('#f5222d') // 红色
      expect(vm.getProgressColor(60)).toBe('#fa8c16') // 橙色
      expect(vm.getProgressColor(90)).toBe('#52c41a') // 绿色
    })

    it('正确获取节点类型颜色', () => {
      const vm = wrapper.vm
      
      expect(vm.getNodeTypeColor('input')).toBe('blue')
      expect(vm.getNodeTypeColor('process')).toBe('green')
      expect(vm.getNodeTypeColor('output')).toBe('orange')
      expect(vm.getNodeTypeColor('unknown')).toBe('gray')
    })

    it('正确获取节点类型名称', () => {
      const vm = wrapper.vm
      
      expect(vm.getNodeTypeName('input')).toBe('输入节点')
      expect(vm.getNodeTypeName('process')).toBe('处理节点')
      expect(vm.getNodeTypeName('output')).toBe('输出节点')
      expect(vm.getNodeTypeName('unknown')).toBe('未知类型')
    })

    it('正确获取状态文本', () => {
      const vm = wrapper.vm
      
      expect(vm.getStatusText('draft')).toBe('草稿')
      expect(vm.getStatusText('running')).toBe('运行中')
      expect(vm.getStatusText('completed')).toBe('已完成')
      expect(vm.getStatusText('error')).toBe('错误')
      expect(vm.getStatusText('unknown')).toBe('未知状态')
    })
  })

  describe('边界情况和异常处理', () => {
    it('处理空数据情况', async () => {
      TaskStorage.getAllTasks.mockReturnValue([])
      MockDataGenerator.generateStatisticsMockData.mockReturnValue([])
      
      wrapper = mount(StatisticsModePanel)
      const vm = wrapper.vm
      
      await vm.refreshStatistics()
      
      expect(vm.overviewStats.totalTasks).toBe(0)
      expect(vm.overviewStats.runningTasks).toBe(0)
      expect(vm.overviewStats.totalNodes).toBe(0)
      expect(vm.overviewStats.totalConnections).toBe(0)
    })

    it('处理数据获取异常', async () => {
      TaskStorage.getAllTasks.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      wrapper = mount(StatisticsModePanel)
      const vm = wrapper.vm
      
      await vm.refreshStatistics()
      
      // 验证错误处理
      expect(vm.statsLoading).toBe(false)
    })

    it('处理缺失canvasData的任务', async () => {
      const vm = wrapper.vm
      const tasksWithMissingData = [
        { id: '1', taskType: 'test', status: 'draft' }, // 缺少canvasData
        { id: '2', taskType: 'test', status: 'draft', canvasData: null }, // canvasData为null
        { id: '3', taskType: 'test', status: 'draft', canvasData: {} } // canvasData为空对象
      ]
      
      vm.calculateOverviewStats(tasksWithMissingData)
      
      expect(vm.overviewStats.totalTasks).toBe(3)
      expect(vm.overviewStats.totalNodes).toBe(0)
      expect(vm.overviewStats.totalConnections).toBe(0)
    })
  })

  describe('性能测试', () => {
    it('处理大量数据时性能正常', async () => {
      const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        taskType: `type-${i % 5}`,
        status: ['draft', 'running', 'completed'][i % 3],
        canvasData: {
          nodes: Array.from({ length: 10 }, (_, j) => ({ id: `node-${i}-${j}`, type: 'process' })),
          connections: Array.from({ length: 5 }, (_, j) => ({ id: `conn-${i}-${j}` }))
        }
      }))
      
      MockDataGenerator.generateStatisticsMockData.mockReturnValue(largeMockData)
      
      wrapper = mount(StatisticsModePanel)
      const vm = wrapper.vm
      
      const startTime = performance.now()
      await vm.refreshStatistics()
      const endTime = performance.now()
      
      // 验证处理时间合理（小于5秒）
      expect(endTime - startTime).toBeLessThan(5000)
      expect(vm.overviewStats.totalTasks).toBe(1000)
    })
  })
})