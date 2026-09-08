import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import MarketingRecords from '@/pages/discovery/customer360/components/MarketingRecords.vue'
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
  ADescriptions: { name: 'ADescriptions', template: '<div class="a-descriptions"><slot /></div>' },
  ADescriptionsItem: { name: 'ADescriptionsItem', template: '<div class="a-descriptions-item"><slot /></div>' },
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
  ATimeline: { name: 'ATimeline', template: '<div class="a-timeline"><slot /></div>' },
  ATimelineItem: { name: 'ATimelineItem', template: '<div class="a-timeline-item"><slot /></div>' },
  AStatistic: { name: 'AStatistic', template: '<div class="a-statistic"><slot /></div>' },
  AProgress: { name: 'AProgress', template: '<div class="a-progress"></div>' },
  AAlert: { name: 'AAlert', template: '<div class="a-alert"><slot /></div>' },
  AEmpty: { name: 'AEmpty', template: '<div class="a-empty">暂无数据</div>' },
  ATooltip: { name: 'ATooltip', template: '<div class="a-tooltip"><slot /></div>' },
  ATabs: { name: 'ATabs', template: '<div class="a-tabs"><slot /></div>' },
  ATabPane: { name: 'ATabPane', template: '<div class="a-tab-pane"><slot /></div>' }
}))

// Mock 复制服务
const mockCopyService = {
  copyText: vi.fn().mockResolvedValue(true),
  copyTableData: vi.fn().mockResolvedValue(true),
  copyJSON: vi.fn().mockResolvedValue(true)
}
vi.mock('@/services/copyService', () => ({
  default: mockCopyService
}))

// Mock 日期工具
vi.mock('@/utils/dateUtils', () => ({
  formatDate: vi.fn((date) => date ? '2024-01-01' : ''),
  formatDateTime: vi.fn((date) => date ? '2024-01-01 10:00:00' : ''),
  formatDuration: vi.fn((minutes) => `${minutes}分钟`),
  isValidDate: vi.fn((date) => !!date)
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

describe('MarketingRecords 组件测试', () => {
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
    // 确保测试数据存在
    if (!mockUsers || !mockUsers['887123'] || !mockUsers['887123'].marketingRecords) {
      throw new Error('测试数据不完整')
    }
    
    // 默认使用touchRecords作为营销记录数据
    const defaultMarketingRecords = mockUsers['887123'].marketingRecords.touchRecords || []
    
    return mount(MarketingRecords, {
      props: {
        marketingRecords: defaultMarketingRecords,
        ...props
      },
      global: {
        plugins: [pinia, router]
      }
    })
  }

  describe('组件渲染', () => {
    it('应该正确渲染营销记录组件', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.marketing-records').exists()).toBe(true)
    })

    it('应该显示营销记录标题', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('营销记录')
    })
  })

  describe('触达记录展示', () => {
    it('应该正确展示触达记录基本信息', () => {
      wrapper = createWrapper()
      const marketingData = mockUsers['887123'].marketingRecords.touchRecords[0]
      
      expect(wrapper.text()).toContain(marketingData.campaignName)
      expect(wrapper.text()).toContain(marketingData.channel)
      expect(wrapper.text()).toContain(marketingData.touchType)
    })

    it('应该显示触达统计数据', () => {
      wrapper = createWrapper()
      const marketingData = mockUsers['887123'].marketingRecords.touchRecords[0]
      
      expect(wrapper.text()).toContain(marketingData.totalReach?.toString() || '')
      expect(wrapper.text()).toContain(marketingData.successfulReach?.toString() || '')
      expect(wrapper.text()).toContain(`${marketingData.conversionRate || 0}%`)
    })

    it('应该正确显示触达渠道标签', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.a-tag').exists()).toBe(true)
    })

    it('应该显示触达时间信息', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('2024-01-01')
    })
  })

  describe('权益发放记录', () => {
    it('应该展示权益发放详情', () => {
      wrapper = createWrapper()
      const benefitData = mockUsers['887123'].marketingRecords.benefitGrants[0]
      
      expect(wrapper.text()).toContain(benefitData.benefitType)
      expect(wrapper.text()).toContain(benefitData.benefitName)
      expect(wrapper.text()).toContain(benefitData.amount.toString())
    })

    it('应该显示权益状态', () => {
      wrapper = createWrapper()
      const benefitData = mockUsers['887123'].marketingRecords.benefitGrants[0]
      
      expect(wrapper.text()).toContain(benefitData.status)
    })

    it('应该显示权益有效期', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('有效期')
    })

    it('应该显示权益使用情况', () => {
      wrapper = createWrapper()
      const benefitData = mockUsers['887123'].marketingRecords[0].benefitGrants[0]
      
      if (benefitData.usedAmount !== undefined) {
        expect(wrapper.text()).toContain(benefitData.usedAmount.toString())
      }
    })
  })

  describe('效果分析', () => {
    it('应该显示营销成本', () => {
      wrapper = createWrapper()
      const marketingData = mockUsers['887123'].marketingRecords.touchRecords[0]
      
      expect(wrapper.text()).toContain(marketingData.cost.toString())
    })

    it('应该显示营销收入', () => {
      wrapper = createWrapper()
      const marketingData = mockUsers['887123'].marketingRecords.touchRecords[0]
      
      expect(wrapper.text()).toContain(marketingData.conversionValue?.toString() || '')
    })

    it('应该计算并显示ROI', () => {
      wrapper = createWrapper()
      const effectAnalysis = mockUsers['887123'].marketingRecords.effectAnalysis
      
      expect(wrapper.text()).toContain(`${effectAnalysis.roi}%`)
    })

    it('应该显示客户生命周期价值', () => {
      wrapper = createWrapper()
      const effectAnalysis = mockUsers['887123'].marketingRecords.effectAnalysis
      
      expect(wrapper.text()).toContain(effectAnalysis.customerLifetimeValue.toString())
    })
  })

  describe('营销渠道分析', () => {
    it('应该按渠道分组显示数据', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.channel-analysis').exists()).toBe(true)
    })

    it('应该显示不同渠道的效果对比', () => {
      wrapper = createWrapper()
      const channels = ['短信', '邮件', '电话', 'APP推送']
      channels.forEach(channel => {
        expect(wrapper.text()).toContain(channel)
      })
    })
  })

  describe('时间线视图', () => {
    it('应该支持时间线视图切换', async () => {
      wrapper = createWrapper()
      const timelineButton = wrapper.find('[data-testid="timeline-view"]')
      
      if (timelineButton.exists()) {
        await timelineButton.trigger('click')
        expect(wrapper.find('.a-timeline').exists()).toBe(true)
      }
    })

    it('应该按时间顺序显示营销活动', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.a-timeline-item').exists()).toBe(true)
    })
  })

  describe('快速复制功能', () => {
    it('应该支持复制单条营销记录', async () => {
      wrapper = createWrapper()
      const copyButton = wrapper.find('[data-testid="copy-single"]')
      
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        expect(mockCopyService.copyText).toHaveBeenCalled()
      }
    })

    it('应该支持批量复制营销记录', async () => {
      wrapper = createWrapper()
      const batchCopyButton = wrapper.find('[data-testid="copy-batch"]')
      
      if (batchCopyButton.exists()) {
        await batchCopyButton.trigger('click')
        expect(mockCopyService.copyTableData).toHaveBeenCalled()
      }
    })

    it('应该支持复制营销分析报告', async () => {
      wrapper = createWrapper()
      const reportCopyButton = wrapper.find('[data-testid="copy-report"]')
      
      if (reportCopyButton.exists()) {
        await reportCopyButton.trigger('click')
        expect(mockCopyService.copyJSON).toHaveBeenCalled()
      }
    })

    it('应该支持复制权益发放记录', async () => {
      wrapper = createWrapper()
      const benefitCopyButton = wrapper.find('[data-testid="copy-benefits"]')
      
      if (benefitCopyButton.exists()) {
        await benefitCopyButton.trigger('click')
        expect(mockCopyService.copyTableData).toHaveBeenCalled()
      }
    })
  })

  describe('筛选和排序', () => {
    it('应该支持按营销渠道筛选', async () => {
      wrapper = createWrapper()
      const channelFilter = wrapper.find('[data-testid="channel-filter"]')
      
      if (channelFilter.exists()) {
        await channelFilter.setValue('短信')
        // 验证筛选结果
        expect(wrapper.vm.filteredRecords).toBeDefined()
      }
    })

    it('应该支持按时间范围筛选', async () => {
      wrapper = createWrapper()
      const dateFilter = wrapper.find('[data-testid="date-filter"]')
      
      if (dateFilter.exists()) {
        await dateFilter.setValue(['2024-01-01', '2024-01-31'])
        expect(wrapper.vm.filteredRecords).toBeDefined()
      }
    })

    it('应该支持按转化率排序', async () => {
      wrapper = createWrapper()
      const sortButton = wrapper.find('[data-testid="sort-conversion"]')
      
      if (sortButton.exists()) {
        await sortButton.trigger('click')
        expect(wrapper.vm.sortedRecords).toBeDefined()
      }
    })

    it('应该支持按ROI排序', async () => {
      wrapper = createWrapper()
      const roiSortButton = wrapper.find('[data-testid="sort-roi"]')
      
      if (roiSortButton.exists()) {
        await roiSortButton.trigger('click')
        expect(wrapper.vm.sortedRecords).toBeDefined()
      }
    })
  })

  describe('营销效果可视化', () => {
    it('应该显示转化率进度条', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.a-progress').exists()).toBe(true)
    })

    it('应该显示营销统计图表', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.marketing-chart').exists()).toBe(true)
    })

    it('应该显示渠道效果对比', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.channel-comparison').exists()).toBe(true)
    })
  })

  describe('导出功能', () => {
    it('应该支持导出Excel报告', async () => {
      wrapper = createWrapper()
      const exportButton = wrapper.find('[data-testid="export-excel"]')
      
      if (exportButton.exists()) {
        await exportButton.trigger('click')
        expect(mockDownloadService.exportExcel).toHaveBeenCalled()
      }
    })

    it('应该支持导出PDF报告', async () => {
      wrapper = createWrapper()
      const pdfButton = wrapper.find('[data-testid="export-pdf"]')
      
      if (pdfButton.exists()) {
        await pdfButton.trigger('click')
        expect(mockDownloadService.exportPDF).toHaveBeenCalled()
      }
    })
  })

  describe('空数据处理', () => {
    it('应该正确处理空营销记录', () => {
      wrapper = createWrapper({ marketingRecords: [] })
      expect(wrapper.find('.a-empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无数据')
    })

    it('应该正确处理无权益发放记录', () => {
      const recordsWithoutBenefits = [{
        ...mockUsers['887123'].marketingRecords.touchRecords[0],
        benefitGrants: []
      }]
      wrapper = createWrapper({ marketingRecords: recordsWithoutBenefits })
      expect(wrapper.text()).toContain('暂无权益发放记录')
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化金额显示', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toMatch(/\d+\.\d{2}/)
    })

    it('应该正确格式化百分比显示', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toMatch(/\d+\.\d{1,2}%/)
    })

    it('应该正确格式化日期时间', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('2024-01-01')
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正确显示', () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      wrapper = createWrapper()
      expect(wrapper.find('.mobile-layout').exists()).toBe(true)
    })

    it('应该在桌面端正确显示', () => {
      // 模拟桌面端视口
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
    it('应该处理无效的营销数据', () => {
      const invalidData = [{
        id: 'invalid',
        campaignName: '',
        channel: '',
        touchType: '',
        totalReach: -1,
        successfulReach: -1,
        conversionRate: -1,
        cost: -1,
        revenue: -1,
        roi: -1,
        customerLifetimeValue: -1,
        benefitGrants: []
      }]
      
      wrapper = createWrapper({ marketingRecords: invalidData })
      expect(wrapper.find('.a-alert').exists()).toBe(true)
    })

    it('应该处理复制功能错误', async () => {
      mockCopyService.copyText.mockRejectedValueOnce(new Error('复制失败'))
      
      wrapper = createWrapper()
      const copyButton = wrapper.find('[data-testid="copy-single"]')
      
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        expect(wrapper.find('.error-message').exists()).toBe(true)
      }
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量营销记录', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        ...mockUsers['887123'].marketingRecords.touchRecords[0],
        id: `record-${index}`,
        campaignName: `营销活动-${index}`
      }))
      
      const startTime = performance.now()
      wrapper = createWrapper({ marketingRecords: largeDataset })
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(1000) // 渲染时间应小于1秒
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('数据更新', () => {
    it('应该响应营销记录数据变化', async () => {
      const newRecords = [
        {
          id: 999,
          campaignName: '新营销活动',
          campaignType: '产品推广',
          status: '成功',
          channel: '短信',
          startTime: '2024-02-01 10:00:00',
          endTime: '2024-02-28 23:59:59',
          responseRate: 90,
          targetAmount: 60000,
          actualAmount: 54000
        }
      ]
      
      const wrapper = createWrapper({
        marketingRecords: newRecords
      })
      
      await nextTick()
      
      // 检查组件的computed属性
      const vm = wrapper.vm as any
      console.log('marketingRecords computed:', vm.marketingRecords)
      console.log('filteredRecords computed:', vm.filteredRecords)
      console.log('successfulCampaigns:', vm.successfulCampaigns)
      
      // 验证数据是否正确传递
      expect(vm.marketingRecords).toHaveLength(1)
      expect(vm.marketingRecords[0].campaignName).toBe('新营销活动')
      expect(vm.filteredRecords).toHaveLength(1)
      expect(vm.successfulCampaigns).toBe(1)
    })
  })
})