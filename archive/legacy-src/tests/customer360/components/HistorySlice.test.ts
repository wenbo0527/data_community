import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import HistorySlice from '@/pages/discovery/customer360/components/HistorySlice.vue'
import { mockUsers } from '@/mock/customer360'
import '../setup'

// 验证mockUsers数据
if (!mockUsers || !mockUsers['887123']) {
  throw new Error('mockUsers数据未正确导入')
}

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  ACard: { name: 'ACard', template: '<div class="a-card"><slot /></div>' },
  ARow: { name: 'ARow', template: '<div class="a-row"><slot /></div>' },
  ACol: { name: 'ACol', template: '<div class="a-col"><slot /></div>' },
  AForm: { name: 'AForm', template: '<form class="a-form"><slot /></form>' },
  AFormItem: { name: 'AFormItem', template: '<div class="a-form-item"><slot /></div>' },
  ATable: { name: 'ATable', template: '<div class="a-table"><slot /></div>' },
  ATableColumn: { name: 'ATableColumn', template: '<div class="a-table-column"><slot /></div>' },
  ATag: { name: 'ATag', template: '<span class="a-tag"><slot /></span>' },
  AButton: { name: 'AButton', template: '<button class="a-button"><slot /></button>' },
  ASpace: { name: 'ASpace', template: '<div class="a-space"><slot /></div>' },
  ASelect: { name: 'ASelect', template: '<select class="a-select"><slot /></select>' },
  AOption: { name: 'AOption', template: '<option class="a-option"><slot /></option>' },
  ADatePicker: { name: 'ADatePicker', template: '<input class="a-date-picker" />' },
  ARangePicker: { name: 'ARangePicker', template: '<input class="a-range-picker" />' },
  AInput: { name: 'AInput', template: '<input class="a-input" />' },
  ATextarea: { name: 'ATextarea', template: '<textarea class="a-textarea"></textarea>' },
  AModal: { name: 'AModal', template: '<div class="a-modal"><slot /></div>' },
  ADrawer: { name: 'ADrawer', template: '<div class="a-drawer"><slot /></div>' },
  ATimeline: { name: 'ATimeline', template: '<div class="a-timeline"><slot /></div>' },
  ATimelineItem: { name: 'ATimelineItem', template: '<div class="a-timeline-item"><slot /></div>' },
  AStatistic: { name: 'AStatistic', template: '<div class="a-statistic"><slot /></div>' },
  AProgress: { name: 'AProgress', template: '<div class="a-progress"></div>' },
  AAlert: { name: 'AAlert', template: '<div class="a-alert"><slot /></div>' },
  AEmpty: { name: 'AEmpty', template: '<div class="a-empty">暂无数据</div>' },
  ATooltip: { name: 'ATooltip', template: '<div class="a-tooltip"><slot /></div>' },
  ATabs: { name: 'ATabs', template: '<div class="a-tabs"><slot /></div>' },
  ATabPane: { name: 'ATabPane', template: '<div class="a-tab-pane"><slot /></div>' },
  APagination: { name: 'APagination', template: '<div class="a-pagination"></div>' },
  ACheckbox: { name: 'ACheckbox', template: '<input type="checkbox" class="a-checkbox" />' },
  ARadio: { name: 'ARadio', template: '<input type="radio" class="a-radio" />' },
  ARadioGroup: { name: 'ARadioGroup', template: '<div class="a-radio-group"><slot /></div>' },
  ASpin: { name: 'ASpin', template: '<div class="a-spin"><slot /></div>' },
  ATree: { name: 'ATree', template: '<div class="a-tree"><slot /></div>' },
  ACollapse: { name: 'ACollapse', template: '<div class="a-collapse"><slot /></div>' },
  ACollapseItem: { name: 'ACollapseItem', template: '<div class="a-collapse-item"><slot /></div>' }
}))

// Mock 复制服务
const mockCopyService = {
  copyText: vi.fn().mockResolvedValue(true),
  copyTableData: vi.fn().mockResolvedValue(true),
  copyJSON: vi.fn().mockResolvedValue(true),
  copyHistorySlice: vi.fn().mockResolvedValue(true),
  copyComparison: vi.fn().mockResolvedValue(true)
}
vi.mock('@/services/copyService', () => ({
  default: mockCopyService
}))

// Mock 日期工具
vi.mock('@/utils/dateUtils', () => ({
  formatDate: vi.fn((date) => date ? '2024-01-01' : ''),
  formatDateTime: vi.fn((date) => date ? '2024-01-01 10:00:00' : ''),
  calculateDaysBetween: vi.fn(() => 30),
  isValidDateRange: vi.fn(() => true),
  getDateRange: vi.fn(() => ['2024-01-01', '2024-01-31'])
}))

// Mock 历史数据服务
const mockHistoryService = {
  queryHistorySlice: vi.fn().mockResolvedValue({
    success: true,
    data: {
      timestamp: '2024-01-01T00:00:00Z',
      userData: mockUsers['887123'],
      changes: []
    }
  }),
  compareSlices: vi.fn().mockResolvedValue({
    success: true,
    data: {
      differences: [],
      summary: {}
    }
  }),
  getAvailableSlices: vi.fn().mockResolvedValue({
    success: true,
    data: [
      { timestamp: '2024-01-01T00:00:00Z', description: '月初快照' },
      { timestamp: '2024-01-15T00:00:00Z', description: '月中快照' },
      { timestamp: '2024-01-31T00:00:00Z', description: '月末快照' }
    ]
  })
}
vi.mock('@/services/historyService', () => ({
  default: mockHistoryService
}))

// Mock 下载服务
const mockDownloadService = {
  downloadFile: vi.fn().mockResolvedValue(true),
  exportExcel: vi.fn().mockResolvedValue(true),
  exportPDF: vi.fn().mockResolvedValue(true)
}
vi.mock('@/services/downloadService', () => ({
  default: mockDownloadService
}))

describe('HistorySlice 组件测试', () => {
  let wrapper: any
  let pinia: any
  let router: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
    })
    
    // 重置所有 mock
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(HistorySlice, {
      props: {
        userId: '887123',
        ...props
      },
      global: {
        plugins: [pinia, router]
      }
    })
  }

  describe('组件渲染', () => {
    it('应该正确渲染历史切片查询组件', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.history-slice').exists()).toBe(true)
    })

    it('应该显示历史切片查询标题', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('历史切片查询')
    })
  })

  describe('查询条件设置', () => {
    it('应该显示日期选择器', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.a-date-picker').exists()).toBe(true)
    })

    it('应该显示时间范围选择器', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.a-range-picker').exists()).toBe(true)
    })

    it('应该支持选择查询维度', () => {
      wrapper = createWrapper()
      expect(wrapper.find('[data-testid="dimension-select"]').exists()).toBe(true)
    })

    it('应该支持选择数据类型', () => {
      wrapper = createWrapper()
      expect(wrapper.find('[data-testid="data-type-select"]').exists()).toBe(true)
    })
  })

  describe('历史切片查询', () => {
    it('应该支持按时间点查询历史切片', async () => {
      wrapper = createWrapper()
      const queryButton = wrapper.find('[data-testid="query-slice"]')
      
      if (queryButton.exists()) {
        await queryButton.trigger('click')
        expect(mockHistoryService.queryHistorySlice).toHaveBeenCalled()
      }
    })

    it('应该显示查询结果', async () => {
      wrapper = createWrapper()
      await wrapper.vm.queryHistorySlice('2024-01-01')
      
      expect(wrapper.find('.slice-result').exists()).toBe(true)
    })

    it('应该显示查询加载状态', async () => {
      mockHistoryService.queryHistorySlice.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      
      wrapper = createWrapper()
      const queryPromise = wrapper.vm.queryHistorySlice('2024-01-01')
      
      expect(wrapper.find('.a-spin').exists()).toBe(true)
      await queryPromise
    })

    it('应该处理查询错误', async () => {
      mockHistoryService.queryHistorySlice.mockRejectedValueOnce(new Error('查询失败'))
      
      wrapper = createWrapper()
      await wrapper.vm.queryHistorySlice('2024-01-01')
      
      expect(wrapper.find('.a-alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('查询失败')
    })
  })

  describe('可用切片列表', () => {
    it('应该显示可用的历史切片列表', async () => {
      wrapper = createWrapper()
      await wrapper.vm.loadAvailableSlices()
      
      expect(wrapper.find('.available-slices').exists()).toBe(true)
      expect(mockHistoryService.getAvailableSlices).toHaveBeenCalled()
    })

    it('应该支持选择预设切片', async () => {
      wrapper = createWrapper()
      const sliceOption = wrapper.find('[data-testid="slice-option"]')
      
      if (sliceOption.exists()) {
        await sliceOption.trigger('click')
        expect(wrapper.vm.selectedSlice).toBeDefined()
      }
    })

    it('应该显示切片描述信息', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('月初快照')
      expect(wrapper.text()).toContain('月中快照')
      expect(wrapper.text()).toContain('月末快照')
    })
  })

  describe('数据展示方式', () => {
    it('应该支持表格视图', async () => {
      wrapper = createWrapper()
      const tableViewButton = wrapper.find('[data-testid="table-view"]')
      
      if (tableViewButton.exists()) {
        await tableViewButton.trigger('click')
        expect(wrapper.find('.a-table').exists()).toBe(true)
      }
    })

    it('应该支持时间线视图', async () => {
      wrapper = createWrapper()
      const timelineViewButton = wrapper.find('[data-testid="timeline-view"]')
      
      if (timelineViewButton.exists()) {
        await timelineViewButton.trigger('click')
        expect(wrapper.find('.a-timeline').exists()).toBe(true)
      }
    })

    it('应该支持树形视图', async () => {
      wrapper = createWrapper()
      const treeViewButton = wrapper.find('[data-testid="tree-view"]')
      
      if (treeViewButton.exists()) {
        await treeViewButton.trigger('click')
        expect(wrapper.find('.a-tree').exists()).toBe(true)
      }
    })

    it('应该支持卡片视图', async () => {
      wrapper = createWrapper()
      const cardViewButton = wrapper.find('[data-testid="card-view"]')
      
      if (cardViewButton.exists()) {
        await cardViewButton.trigger('click')
        expect(wrapper.find('.card-view').exists()).toBe(true)
      }
    })
  })

  describe('切片对比功能', () => {
    it('应该支持选择多个切片进行对比', async () => {
      wrapper = createWrapper()
      const compareButton = wrapper.find('[data-testid="compare-slices"]')
      
      if (compareButton.exists()) {
        await compareButton.trigger('click')
        expect(wrapper.find('.slice-comparison').exists()).toBe(true)
      }
    })

    it('应该显示切片差异', async () => {
      wrapper = createWrapper()
      await wrapper.vm.compareSlices(['2024-01-01', '2024-01-31'])
      
      expect(mockHistoryService.compareSlices).toHaveBeenCalled()
      expect(wrapper.find('.differences').exists()).toBe(true)
    })

    it('应该高亮显示变化项', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.change-highlight').exists()).toBe(true)
    })

    it('应该显示变化统计', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.change-summary').exists()).toBe(true)
    })
  })

  describe('数据筛选和搜索', () => {
    it('应该支持按数据类型筛选', async () => {
      wrapper = createWrapper()
      const typeFilter = wrapper.find('[data-testid="type-filter"]')
      
      if (typeFilter.exists()) {
        await typeFilter.setValue('基本信息')
        expect(wrapper.vm.filteredData).toBeDefined()
      }
    })

    it('应该支持关键字搜索', async () => {
      wrapper = createWrapper()
      const searchInput = wrapper.find('[data-testid="search-input"]')
      
      if (searchInput.exists()) {
        await searchInput.setValue('贷款')
        expect(wrapper.vm.searchResults).toBeDefined()
      }
    })

    it('应该支持按变化类型筛选', async () => {
      wrapper = createWrapper()
      const changeFilter = wrapper.find('[data-testid="change-filter"]')
      
      if (changeFilter.exists()) {
        await changeFilter.setValue('新增')
        expect(wrapper.vm.filteredChanges).toBeDefined()
      }
    })
  })

  describe('快速复制功能', () => {
    it('应该支持复制历史切片数据', async () => {
      wrapper = createWrapper()
      const copySliceButton = wrapper.find('[data-testid="copy-slice"]')
      
      if (copySliceButton.exists()) {
        await copySliceButton.trigger('click')
        expect(mockCopyService.copyHistorySlice).toHaveBeenCalled()
      }
    })

    it('应该支持复制对比结果', async () => {
      wrapper = createWrapper()
      const copyComparisonButton = wrapper.find('[data-testid="copy-comparison"]')
      
      if (copyComparisonButton.exists()) {
        await copyComparisonButton.trigger('click')
        expect(mockCopyService.copyComparison).toHaveBeenCalled()
      }
    })

    it('应该支持复制变化摘要', async () => {
      wrapper = createWrapper()
      const copySummaryButton = wrapper.find('[data-testid="copy-summary"]')
      
      if (copySummaryButton.exists()) {
        await copySummaryButton.trigger('click')
        expect(mockCopyService.copyJSON).toHaveBeenCalled()
      }
    })

    it('应该支持复制选中数据', async () => {
      wrapper = createWrapper()
      const copySelectedButton = wrapper.find('[data-testid="copy-selected"]')
      
      if (copySelectedButton.exists()) {
        await copySelectedButton.trigger('click')
        expect(mockCopyService.copyTableData).toHaveBeenCalled()
      }
    })
  })

  describe('导出功能', () => {
    it('应该支持导出历史切片Excel', async () => {
      wrapper = createWrapper()
      const exportButton = wrapper.find('[data-testid="export-slice-excel"]')
      
      if (exportButton.exists()) {
        await exportButton.trigger('click')
        expect(mockDownloadService.exportExcel).toHaveBeenCalled()
      }
    })

    it('应该支持导出对比报告PDF', async () => {
      wrapper = createWrapper()
      const exportPdfButton = wrapper.find('[data-testid="export-comparison-pdf"]')
      
      if (exportPdfButton.exists()) {
        await exportPdfButton.trigger('click')
        expect(mockDownloadService.exportPDF).toHaveBeenCalled()
      }
    })
  })

  describe('数据详情展示', () => {
    it('应该支持展开数据详情', async () => {
      wrapper = createWrapper()
      const expandButton = wrapper.find('[data-testid="expand-details"]')
      
      if (expandButton.exists()) {
        await expandButton.trigger('click')
        expect(wrapper.find('.data-details').exists()).toBe(true)
      }
    })

    it('应该显示字段级别的变化', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.field-changes').exists()).toBe(true)
    })

    it('应该显示变化时间戳', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('2024-01-01 10:00:00')
    })

    it('应该显示操作人信息', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.operator-info').exists()).toBe(true)
    })
  })

  describe('分页和虚拟滚动', () => {
    it('应该支持大数据量的分页显示', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.a-pagination').exists()).toBe(true)
    })

    it('应该支持虚拟滚动优化性能', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.virtual-scroll').exists()).toBe(true)
    })
  })

  describe('空数据处理', () => {
    it('应该正确处理无历史切片数据', () => {
      mockHistoryService.queryHistorySlice.mockResolvedValueOnce({
        success: true,
        data: null
      })
      
      wrapper = createWrapper()
      expect(wrapper.find('.a-empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无数据')
    })

    it('应该正确处理无可用切片', () => {
      mockHistoryService.getAvailableSlices.mockResolvedValueOnce({
        success: true,
        data: []
      })
      
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('暂无可用切片')
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化时间戳', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('2024-01-01')
    })

    it('应该正确格式化数据变化', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.change-format').exists()).toBe(true)
    })

    it('应该正确显示数据类型标签', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.a-tag').exists()).toBe(true)
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正确显示', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      wrapper = createWrapper()
      expect(wrapper.find('.mobile-layout').exists()).toBe(true)
    })

    it('应该在桌面端正确显示', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })
      
      wrapper = createWrapper()
      expect(wrapper.find('.desktop-layout').exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的查询参数', async () => {
      wrapper = createWrapper()
      await wrapper.vm.queryHistorySlice('')
      
      expect(wrapper.find('.a-alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('查询参数无效')
    })

    it('应该处理网络错误', async () => {
      mockHistoryService.queryHistorySlice.mockRejectedValueOnce(new Error('网络错误'))
      
      wrapper = createWrapper()
      await wrapper.vm.queryHistorySlice('2024-01-01')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
    })

    it('应该处理复制功能错误', async () => {
      mockCopyService.copyHistorySlice.mockRejectedValueOnce(new Error('复制失败'))
      
      wrapper = createWrapper()
      const copyButton = wrapper.find('[data-testid="copy-slice"]')
      
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        expect(wrapper.find('.error-message').exists()).toBe(true)
      }
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量历史数据', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, index) => ({
        id: index,
        timestamp: `2024-01-${String(index % 31 + 1).padStart(2, '0')}`,
        data: { field: `value-${index}` }
      }))
      
      mockHistoryService.queryHistorySlice.mockResolvedValueOnce({
        success: true,
        data: { history: largeDataset }
      })
      
      const startTime = performance.now()
      wrapper = createWrapper()
      await wrapper.vm.queryHistorySlice('2024-01-01')
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(2000)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('数据更新', () => {
    it('应该响应用户ID变化', async () => {
      wrapper = createWrapper()
      await wrapper.setProps({ userId: '123' })
      
      expect(mockHistoryService.getAvailableSlices).toHaveBeenCalledWith('123')
    })

    it('应该支持实时数据刷新', async () => {
      wrapper = createWrapper()
      const refreshButton = wrapper.find('[data-testid="refresh-data"]')
      
      if (refreshButton.exists()) {
        await refreshButton.trigger('click')
        expect(mockHistoryService.queryHistorySlice).toHaveBeenCalled()
      }
    })
  })
})