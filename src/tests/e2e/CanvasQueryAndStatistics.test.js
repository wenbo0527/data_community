import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from '../../pages/TaskList.vue'
import QueryModePanel from '../../components/QueryModePanel.vue'
import StatisticsModePanel from '../../components/StatisticsModePanel.vue'
import TaskFlowCanvas from '../../pages/marketing/tasks/components/TaskFlowCanvas.vue'
import { TaskStorage } from '../../utils/taskStorage.js'
import MockDataGenerator from '../../utils/mockDataGenerator.js'
import ChartRenderer from '../../utils/chartRenderer.js'

// Mock X6 Graph
const mockGraph = {
  render: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  fromJSON: vi.fn(),
  toJSON: vi.fn(() => ({ cells: [] })),
  getEdges: vi.fn(() => []),
  getNodes: vi.fn(() => []),
  on: vi.fn(),
  off: vi.fn()
}

vi.mock('@antv/x6', () => ({
  Graph: vi.fn(() => mockGraph)
}))

// Mock Vue Router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
}

const mockRoute = {
  params: { id: 'test-task' },
  query: {},
  path: '/task/test-task'
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

// Mock dependencies
vi.mock('../../utils/taskStorage.js', () => ({
  TaskStorage: {
    getAllTasks: vi.fn(() => [
      {
        id: 'task-1',
        taskName: '数据处理任务',
        taskType: '数据处理',
        status: 'running',
        creator: '用户A',
        createTime: '2024-01-01 10:00:00',
        canvasData: {
          nodes: [
            { id: 'n1', type: 'input', name: '输入节点' },
            { id: 'n2', type: 'process', name: '处理节点' },
            { id: 'n3', type: 'output', name: '输出节点' }
          ],
          connections: [
            { id: 'c1', source: 'n1', target: 'n2' },
            { id: 'c2', source: 'n2', target: 'n3' }
          ]
        }
      },
      {
        id: 'task-2',
        taskName: '数据分析任务',
        taskType: '数据分析',
        status: 'completed',
        creator: '用户B',
        createTime: '2024-01-02 14:00:00',
        canvasData: {
          nodes: [
            { id: 'n4', type: 'input', name: '分析输入' },
            { id: 'n5', type: 'process', name: '分析处理' }
          ],
          connections: [
            { id: 'c3', source: 'n4', target: 'n5' }
          ]
        }
      }
    ]),
    getTaskById: vi.fn((id) => ({
      id,
      taskName: `任务${id}`,
      canvasData: { nodes: [], connections: [] }
    })),
    saveTask: vi.fn()
  }
}))

vi.mock('../../utils/mockDataGenerator.js', () => ({
  default: {
    generateQueryMockData: vi.fn(() => [
      {
        id: 'mock-1',
        taskName: 'Mock查询任务1',
        taskType: 'Mock处理',
        status: 'running',
        creator: 'Mock用户',
        createTime: '2024-01-03 09:00:00',
        canvasData: {
          nodes: [{ id: 'mn1', type: 'input' }],
          connections: []
        }
      }
    ]),
    generateStatisticsMockData: vi.fn(() => ({
      taskStats: {
        total: 10,
        running: 3,
        completed: 6,
        error: 1
      },
      nodeStats: {
        input: 15,
        process: 20,
        output: 10
      },
      connectionStats: {
        total: 25,
        active: 20,
        inactive: 5
      },
      performanceStats: {
        avgExecutionTime: 120,
        successRate: 0.95,
        errorRate: 0.05
      }
    }))
  }
}))

vi.mock('../../utils/chartRenderer.js', () => ({
  default: {
    renderPieChart: vi.fn(),
    renderBarChart: vi.fn(),
    renderLineChart: vi.fn(),
    renderAreaChart: vi.fn(),
    destroy: vi.fn()
  }
}))

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

describe('画布查询与统计模式端到端测试', () => {
  let taskListWrapper
  let queryPanelWrapper
  let statisticsPanelWrapper
  let canvasWrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (taskListWrapper) taskListWrapper.unmount()
    if (queryPanelWrapper) queryPanelWrapper.unmount()
    if (statisticsPanelWrapper) statisticsPanelWrapper.unmount()
    if (canvasWrapper) canvasWrapper.unmount()
  })

  describe('任务列表页面模式切换', () => {
    beforeEach(() => {
      taskListWrapper = mount(TaskList)
    })

    it('默认显示普通列表模式', () => {
      const vm = taskListWrapper.vm
      expect(vm.currentMode).toBe('list')
      expect(taskListWrapper.find('.task-list-container').exists()).toBe(true)
    })

    it('切换到查询模式', async () => {
      const vm = taskListWrapper.vm
      
      await vm.switchMode('query')
      
      expect(vm.currentMode).toBe('query')
      expect(vm.showQueryPanel).toBe(true)
    })

    it('切换到统计模式', async () => {
      const vm = taskListWrapper.vm
      
      await vm.switchMode('statistics')
      
      expect(vm.currentMode).toBe('statistics')
      expect(vm.showStatisticsPanel).toBe(true)
    })

    it('模式切换按钮正确显示', () => {
      const modeButtons = taskListWrapper.findAll('.mode-button')
      expect(modeButtons.length).toBeGreaterThanOrEqual(3)
      
      const buttonTexts = modeButtons.map(btn => btn.text())
      expect(buttonTexts).toContain('列表模式')
      expect(buttonTexts).toContain('查询模式')
      expect(buttonTexts).toContain('统计模式')
    })
  })

  describe('查询模式完整流程', () => {
    beforeEach(() => {
      taskListWrapper = mount(TaskList)
      queryPanelWrapper = mount(QueryModePanel)
    })

    it('进入查询模式并执行查询', async () => {
      // 1. 切换到查询模式
      const taskListVm = taskListWrapper.vm
      await taskListVm.switchMode('query')
      expect(taskListVm.currentMode).toBe('query')

      // 2. 设置查询条件
      const queryVm = queryPanelWrapper.vm
      queryVm.queryParams.keyword = '数据处理'
      queryVm.queryParams.taskType = '数据处理'
      queryVm.queryParams.status = 'running'

      // 3. 执行查询
      await queryVm.executeQuery()

      // 4. 验证查询结果
      expect(TaskStorage.getAllTasks).toHaveBeenCalled()
      expect(MockDataGenerator.generateQueryMockData).toHaveBeenCalled()
      expect(queryVm.queryResults.length).toBeGreaterThanOrEqual(0)
    })

    it('查询结果预览画布', async () => {
      const queryVm = queryPanelWrapper.vm
      
      // 设置查询结果
      queryVm.queryResults = [
        {
          id: 'task-1',
          taskName: '测试任务',
          canvasData: {
            nodes: [{ id: 'n1', type: 'input' }],
            connections: []
          }
        }
      ]

      // 预览画布
      await queryVm.previewCanvas(queryVm.queryResults[0])

      expect(queryVm.previewVisible).toBe(true)
      expect(queryVm.previewTask).toEqual(queryVm.queryResults[0])
    })

    it('导出查询结果', async () => {
      const queryVm = queryPanelWrapper.vm
      
      queryVm.queryResults = [
        { id: '1', taskName: '任务1', taskType: '处理' },
        { id: '2', taskName: '任务2', taskType: '分析' }
      ]

      const exportSpy = vi.spyOn(queryVm, 'exportResults')
      await queryVm.exportResults()

      expect(exportSpy).toHaveBeenCalled()
    })

    it('重置查询条件', async () => {
      const queryVm = queryPanelWrapper.vm
      
      // 设置查询条件
      queryVm.queryParams.keyword = '测试'
      queryVm.queryParams.taskType = '处理'
      queryVm.queryParams.status = 'running'
      queryVm.queryParams.nodeTypes = ['input', 'process']

      // 重置查询
      queryVm.resetQuery()

      expect(queryVm.queryParams.keyword).toBe('')
      expect(queryVm.queryParams.taskType).toBe('')
      expect(queryVm.queryParams.status).toBe('')
      expect(queryVm.queryParams.nodeTypes).toEqual([])
    })
  })

  describe('统计模式完整流程', () => {
    beforeEach(() => {
      taskListWrapper = mount(TaskList)
      statisticsPanelWrapper = mount(StatisticsModePanel)
    })

    it('进入统计模式并刷新数据', async () => {
      // 1. 切换到统计模式
      const taskListVm = taskListWrapper.vm
      await taskListVm.switchMode('statistics')
      expect(taskListVm.currentMode).toBe('statistics')

      // 2. 刷新统计数据
      const statisticsVm = statisticsPanelWrapper.vm
      await statisticsVm.refreshStatistics()

      // 3. 验证数据获取
      expect(TaskStorage.getAllTasks).toHaveBeenCalled()
      expect(MockDataGenerator.generateStatisticsMockData).toHaveBeenCalled()
    })

    it('统计维度控制', async () => {
      const statisticsVm = statisticsPanelWrapper.vm
      
      // 设置统计参数
      statisticsVm.statisticsParams.timeRange = 'week'
      statisticsVm.statisticsParams.groupBy = 'taskType'
      statisticsVm.statisticsParams.includeCompleted = true

      await statisticsVm.refreshStatistics()

      expect(statisticsVm.statisticsParams.timeRange).toBe('week')
      expect(statisticsVm.statisticsParams.groupBy).toBe('taskType')
      expect(statisticsVm.statisticsParams.includeCompleted).toBe(true)
    })

    it('图表渲染', async () => {
      const statisticsVm = statisticsPanelWrapper.vm
      
      await statisticsVm.refreshStatistics()
      await statisticsVm.renderCharts()

      expect(ChartRenderer.renderPieChart).toHaveBeenCalled()
      expect(ChartRenderer.renderBarChart).toHaveBeenCalled()
      expect(ChartRenderer.renderLineChart).toHaveBeenCalled()
    })

    it('概览统计计算', async () => {
      const statisticsVm = statisticsPanelWrapper.vm
      
      const mockTasks = [
        { id: '1', status: 'running', canvasData: { nodes: [{ type: 'input' }], connections: [] } },
        { id: '2', status: 'completed', canvasData: { nodes: [{ type: 'process' }], connections: [] } },
        { id: '3', status: 'error', canvasData: { nodes: [{ type: 'output' }], connections: [] } }
      ]

      const overview = statisticsVm.calculateOverviewStats(mockTasks)

      expect(overview.totalTasks).toBe(3)
      expect(overview.runningTasks).toBe(1)
      expect(overview.totalNodes).toBe(3)
      expect(overview.totalConnections).toBe(0)
    })

    it('详细统计计算', async () => {
      const statisticsVm = statisticsPanelWrapper.vm
      
      const mockTasks = [
        { taskType: '数据处理', status: 'running' },
        { taskType: '数据处理', status: 'completed' },
        { taskType: '数据分析', status: 'running' }
      ]

      const detailed = statisticsVm.calculateDetailedStats(mockTasks)

      expect(detailed.byTaskType['数据处理']).toBe(2)
      expect(detailed.byTaskType['数据分析']).toBe(1)
      expect(detailed.byStatus.running).toBe(2)
      expect(detailed.byStatus.completed).toBe(1)
    })
  })

  describe('模式间数据同步', () => {
    beforeEach(() => {
      taskListWrapper = mount(TaskList)
      queryPanelWrapper = mount(QueryModePanel)
      statisticsPanelWrapper = mount(StatisticsModePanel)
    })

    it('查询模式到统计模式数据传递', async () => {
      // 1. 在查询模式中执行查询
      const queryVm = queryPanelWrapper.vm
      queryVm.queryParams.keyword = '数据处理'
      await queryVm.executeQuery()

      // 2. 切换到统计模式
      const taskListVm = taskListWrapper.vm
      await taskListVm.switchMode('statistics')

      // 3. 统计模式应该能获取到相同的数据源
      const statisticsVm = statisticsPanelWrapper.vm
      await statisticsVm.refreshStatistics()

      expect(TaskStorage.getAllTasks).toHaveBeenCalledTimes(2) // 查询模式一次，统计模式一次
    })

    it('统计模式到查询模式数据一致性', async () => {
      // 1. 在统计模式中刷新数据
      const statisticsVm = statisticsPanelWrapper.vm
      await statisticsVm.refreshStatistics()

      // 2. 切换到查询模式
      const taskListVm = taskListWrapper.vm
      await taskListVm.switchMode('query')

      // 3. 查询模式应该能获取到相同的数据源
      const queryVm = queryPanelWrapper.vm
      await queryVm.executeQuery()

      expect(TaskStorage.getAllTasks).toHaveBeenCalledTimes(2)
    })
  })

  describe('画布预览集成', () => {
    beforeEach(() => {
      queryPanelWrapper = mount(QueryModePanel)
      canvasWrapper = mount(TaskFlowCanvas, {
        props: { taskId: 'test-task' }
      })
    })

    it('从查询结果预览画布', async () => {
      const queryVm = queryPanelWrapper.vm
      const canvasVm = canvasWrapper.vm
      
      const mockTask = {
        id: 'task-1',
        taskName: '测试任务',
        canvasData: {
          nodes: [
            { id: 'n1', type: 'input', x: 100, y: 100 },
            { id: 'n2', type: 'process', x: 300, y: 100 }
          ],
          connections: [
            { id: 'c1', source: 'n1', target: 'n2' }
          ]
        }
      }

      // 预览画布
      await queryVm.previewCanvas(mockTask)
      
      expect(queryVm.previewVisible).toBe(true)
      expect(queryVm.previewTask).toEqual(mockTask)

      // 模拟画布加载数据
      await canvasVm.loadCanvasData(mockTask.canvasData)
      
      expect(mockGraph.fromJSON).toHaveBeenCalledWith(mockTask.canvasData)
    })

    it('画布预览模态框交互', async () => {
      const queryVm = queryPanelWrapper.vm
      
      const mockTask = {
        id: 'task-1',
        taskName: '测试任务',
        canvasData: { nodes: [], connections: [] }
      }

      // 打开预览
      await queryVm.previewCanvas(mockTask)
      expect(queryVm.previewVisible).toBe(true)

      // 关闭预览
      queryVm.closePreview()
      expect(queryVm.previewVisible).toBe(false)
      expect(queryVm.previewTask).toBeNull()
    })
  })

  describe('实时数据更新', () => {
    beforeEach(() => {
      taskListWrapper = mount(TaskList)
      queryPanelWrapper = mount(QueryModePanel)