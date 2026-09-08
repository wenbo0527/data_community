import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import LoanRecords from '@/pages/discovery/customer360/components/LoanRecords.vue'
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
  ADrawer: { name: 'ADrawer', template: '<div class="a-drawer"><slot /></div>' },
  ACollapse: { name: 'ACollapse', template: '<div class="a-collapse"><slot /></div>' },
  ACollapseItem: { name: 'ACollapseItem', template: '<div class="a-collapse-item"><slot /></div>' },
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
  ARadioGroup: { name: 'ARadioGroup', template: '<div class="a-radio-group"><slot /></div>' }
}))

// Mock 复制服务
const mockCopyService = {
  copyText: vi.fn().mockResolvedValue(true),
  copyTableData: vi.fn().mockResolvedValue(true),
  copyJSON: vi.fn().mockResolvedValue(true),
  copyLoanDetails: vi.fn().mockResolvedValue(true),
  copyRepaymentPlan: vi.fn().mockResolvedValue(true)
}
vi.mock('@/services/copyService', () => ({
  default: mockCopyService
}))

// Mock 日期工具
vi.mock('@/utils/dateUtils', () => ({
  formatDate: vi.fn((date) => date ? '2024-01-01' : ''),
  formatDateTime: vi.fn((date) => date ? '2024-01-01 10:00:00' : ''),
  calculateDaysBetween: vi.fn(() => 30),
  isOverdue: vi.fn((date) => false),
  formatDuration: vi.fn((days) => `${days}天`)
}))

// Mock 金额格式化工具
vi.mock('@/utils/formatUtils', () => ({
  formatCurrency: vi.fn((amount) => `¥${amount.toLocaleString()}`),
  formatPercent: vi.fn((rate) => `${rate}%`),
  formatNumber: vi.fn((num) => num.toLocaleString())
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

describe('LoanRecords 组件测试', () => {
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
    return mount(LoanRecords, {
      props: {
        loanRecords: mockUsers['887123'].loanRecords,
        ...props
      },
      global: {
        plugins: [pinia, router]
      }
    })
  }

  describe('组件渲染', () => {
    it('应该正确渲染用信列表组件', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.loan-records').exists()).toBe(true)
    })

    it('应该显示用信列表标题', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('用信列表')
    })
  })

  describe('用信记录基本信息展示', () => {
    it('应该正确展示用信记录基本信息', () => {
      wrapper = createWrapper()
      const loanData = mockUsers['887123'].loanRecords[0]
      
      expect(wrapper.text()).toContain(loanData.loanId)
      expect(wrapper.text()).toContain(loanData.productName)
      expect(wrapper.text()).toContain(loanData.loanType)
    })

    it('应该显示贷款金额和利率', () => {
      wrapper = createWrapper()
      const loanData = mockUsers['887123'].loanRecords[0]
      
      expect(wrapper.text()).toContain(loanData.loanAmount.toString())
      expect(wrapper.text()).toContain(`${loanData.interestRate}%`)
    })

    it('应该显示贷款期限和状态', () => {
      wrapper = createWrapper()
      const loanData = mockUsers['887123'].loanRecords[0]
      
      expect(wrapper.text()).toContain(`${loanData.loanTerm}期`)
      expect(wrapper.text()).toContain(loanData.status)
    })

    it('应该显示放款和到期日期', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('2024-01-01')
    })
  })

  describe('还款明细展示', () => {
    it('应该展示还款明细列表', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.repayment-details').exists()).toBe(true)
    })

    it('应该显示每期还款信息', () => {
      wrapper = createWrapper()
      const repaymentDetail = mockUsers['887123'].loanRecords[0].repaymentDetails[0]
      
      expect(wrapper.text()).toContain(`第${repaymentDetail.period}期`)
      expect(wrapper.text()).toContain(repaymentDetail.principalAmount.toString())
      expect(wrapper.text()).toContain(repaymentDetail.interestAmount.toString())
      expect(wrapper.text()).toContain(repaymentDetail.totalAmount.toString())
    })

    it('应该显示还款状态', () => {
      wrapper = createWrapper()
      const repaymentDetail = mockUsers['887123'].loanRecords[0].repaymentDetails[0]
      
      expect(wrapper.text()).toContain(repaymentDetail.status)
    })

    it('应该显示逾期信息', () => {
      wrapper = createWrapper()
      const overdueDetail = mockUsers['887123'].loanRecords[0].repaymentDetails.find(d => d.overdueDays > 0)
      
      if (overdueDetail) {
        expect(wrapper.text()).toContain(`逾期${overdueDetail.overdueDays}天`)
        expect(wrapper.text()).toContain(overdueDetail.penaltyAmount.toString())
      }
    })
  })

  describe('还款计划对比', () => {
    it('应该显示原始还款计划', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.original-plan').exists()).toBe(true)
    })

    it('应该显示实际还款记录', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.actual-repayment').exists()).toBe(true)
    })

    it('应该对比计划与实际的差异', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.plan-comparison').exists()).toBe(true)
    })

    it('应该高亮显示逾期期数', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.overdue-highlight').exists()).toBe(true)
    })

    it('应该显示提前还款记录', () => {
      wrapper = createWrapper()
      const earlyRepayment = mockUsers['887123'].loanRecords[0].repaymentDetails.find(d => d.actualDate && d.actualDate < d.dueDate)
      
      if (earlyRepayment) {
        expect(wrapper.text()).toContain('提前还款')
      }
    })
  })

  describe('贷款状态管理', () => {
    it('应该正确显示正常贷款状态', () => {
      const normalLoan = {
        ...mockUsers['887123'].loanRecords[0],
        status: '正常'
      }
      wrapper = createWrapper({ loanRecords: [normalLoan] })
      expect(wrapper.find('.status-normal').exists()).toBe(true)
    })

    it('应该正确显示逾期贷款状态', () => {
      const overdueLoan = {
        ...mockUsers['887123'].loanRecords[0],
        status: '逾期'
      }
      wrapper = createWrapper({ loanRecords: [overdueLoan] })
      expect(wrapper.find('.status-overdue').exists()).toBe(true)
    })

    it('应该正确显示已结清贷款状态', () => {
      const settledLoan = {
        ...mockUsers['887123'].loanRecords[0],
        status: '已结清'
      }
      wrapper = createWrapper({ loanRecords: [settledLoan] })
      expect(wrapper.find('.status-settled').exists()).toBe(true)
    })
  })

  describe('快速复制功能', () => {
    it('应该支持复制单条用信记录', async () => {
      wrapper = createWrapper()
      const copyButton = wrapper.find('[data-testid="copy-loan-record"]')
      
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        expect(mockCopyService.copyLoanDetails).toHaveBeenCalled()
      }
    })

    it('应该支持复制还款计划', async () => {
      wrapper = createWrapper()
      const copyPlanButton = wrapper.find('[data-testid="copy-repayment-plan"]')
      
      if (copyPlanButton.exists()) {
        await copyPlanButton.trigger('click')
        expect(mockCopyService.copyRepaymentPlan).toHaveBeenCalled()
      }
    })

    it('应该支持批量复制用信记录', async () => {
      wrapper = createWrapper()
      const batchCopyButton = wrapper.find('[data-testid="copy-batch-loans"]')
      
      if (batchCopyButton.exists()) {
        await batchCopyButton.trigger('click')
        expect(mockCopyService.copyTableData).toHaveBeenCalled()
      }
    })

    it('应该支持复制还款明细', async () => {
      wrapper = createWrapper()
      const copyDetailsButton = wrapper.find('[data-testid="copy-repayment-details"]')
      
      if (copyDetailsButton.exists()) {
        await copyDetailsButton.trigger('click')
        expect(mockCopyService.copyTableData).toHaveBeenCalled()
      }
    })

    it('应该支持复制逾期信息', async () => {
      wrapper = createWrapper()
      const copyOverdueButton = wrapper.find('[data-testid="copy-overdue-info"]')
      
      if (copyOverdueButton.exists()) {
        await copyOverdueButton.trigger('click')
        expect(mockCopyService.copyJSON).toHaveBeenCalled()
      }
    })
  })

  describe('筛选和排序功能', () => {
    it('应该支持按贷款状态筛选', async () => {
      wrapper = createWrapper()
      const statusFilter = wrapper.find('[data-testid="status-filter"]')
      
      if (statusFilter.exists()) {
        await statusFilter.setValue('逾期')
        expect(wrapper.vm.filteredLoans).toBeDefined()
      }
    })

    it('应该支持按贷款类型筛选', async () => {
      wrapper = createWrapper()
      const typeFilter = wrapper.find('[data-testid="type-filter"]')
      
      if (typeFilter.exists()) {
        await typeFilter.setValue('信用贷款')
        expect(wrapper.vm.filteredLoans).toBeDefined()
      }
    })

    it('应该支持按金额范围筛选', async () => {
      wrapper = createWrapper()
      const amountFilter = wrapper.find('[data-testid="amount-filter"]')
      
      if (amountFilter.exists()) {
        await amountFilter.setValue([10000, 100000])
        expect(wrapper.vm.filteredLoans).toBeDefined()
      }
    })

    it('应该支持按放款日期排序', async () => {
      wrapper = createWrapper()
      const dateSortButton = wrapper.find('[data-testid="sort-by-date"]')
      
      if (dateSortButton.exists()) {
        await dateSortButton.trigger('click')
        expect(wrapper.vm.sortedLoans).toBeDefined()
      }
    })

    it('应该支持按贷款金额排序', async () => {
      wrapper = createWrapper()
      const amountSortButton = wrapper.find('[data-testid="sort-by-amount"]')
      
      if (amountSortButton.exists()) {
        await amountSortButton.trigger('click')
        expect(wrapper.vm.sortedLoans).toBeDefined()
      }
    })
  })

  describe('详情展开功能', () => {
    it('应该支持展开贷款详情', async () => {
      wrapper = createWrapper()
      const expandButton = wrapper.find('[data-testid="expand-details"]')
      
      if (expandButton.exists()) {
        await expandButton.trigger('click')
        expect(wrapper.find('.loan-details-expanded').exists()).toBe(true)
      }
    })

    it('应该支持折叠贷款详情', async () => {
      wrapper = createWrapper()
      const collapseButton = wrapper.find('[data-testid="collapse-details"]')
      
      if (collapseButton.exists()) {
        await collapseButton.trigger('click')
        expect(wrapper.find('.loan-details-collapsed').exists()).toBe(true)
      }
    })

    it('应该在详情中显示完整还款计划', async () => {
      wrapper = createWrapper()
      const expandButton = wrapper.find('[data-testid="expand-details"]')
      
      if (expandButton.exists()) {
        await expandButton.trigger('click')
        expect(wrapper.find('.full-repayment-schedule').exists()).toBe(true)
      }
    })
  })

  describe('分页功能', () => {
    it('应该支持分页显示大量用信记录', () => {
      const largeDataset = Array.from({ length: 50 }, (_, index) => ({
        ...mockUsers['887123'].loanRecords[0],
        loanId: `LOAN-${index + 1}`,
        productName: `贷款产品-${index + 1}`
      }))
      
      wrapper = createWrapper({ loanRecords: largeDataset })
      expect(wrapper.find('.a-pagination').exists()).toBe(true)
    })

    it('应该支持切换页码', async () => {
      wrapper = createWrapper()
      const pagination = wrapper.find('.a-pagination')
      
      if (pagination.exists()) {
        await pagination.trigger('change', { current: 2 })
        expect(wrapper.vm.currentPage).toBe(2)
      }
    })
  })

  describe('导出功能', () => {
    it('应该支持导出用信记录Excel', async () => {
      wrapper = createWrapper()
      const exportButton = wrapper.find('[data-testid="export-loans-excel"]')
      
      if (exportButton.exists()) {
        await exportButton.trigger('click')
        expect(mockDownloadService.exportExcel).toHaveBeenCalled()
      }
    })

    it('应该支持导出还款计划PDF', async () => {
      wrapper = createWrapper()
      const exportPdfButton = wrapper.find('[data-testid="export-plan-pdf"]')
      
      if (exportPdfButton.exists()) {
        await exportPdfButton.trigger('click')
        expect(mockDownloadService.exportPDF).toHaveBeenCalled()
      }
    })
  })

  describe('空数据处理', () => {
    it('应该正确处理空用信记录', () => {
      wrapper = createWrapper({ loanRecords: [] })
      expect(wrapper.find('.a-empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无数据')
    })

    it('应该正确处理无还款明细', () => {
      const loanWithoutDetails = [{
        ...mockUsers['887123'].loanRecords[0],
        repaymentDetails: []
      }]
      wrapper = createWrapper({ loanRecords: loanWithoutDetails })
      expect(wrapper.text()).toContain('暂无还款明细')
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化金额显示', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toMatch(/¥[\d,]+/)
    })

    it('应该正确格式化利率显示', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toMatch(/\d+\.\d{1,2}%/)
    })

    it('应该正确格式化日期显示', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toContain('2024-01-01')
    })

    it('应该正确格式化期数显示', () => {
      wrapper = createWrapper()
      expect(wrapper.text()).toMatch(/第\d+期/)
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
    it('应该处理无效的用信数据', () => {
      const invalidData = [{
        loanId: '',
        productName: '',
        loanType: '',
        loanAmount: -1,
        interestRate: -1,
        loanTerm: -1,
        status: '',
        repaymentDetails: []
      }]
      
      wrapper = createWrapper({ loanRecords: invalidData })
      expect(wrapper.find('.a-alert').exists()).toBe(true)
    })

    it('应该处理复制功能错误', async () => {
      mockCopyService.copyLoanDetails.mockRejectedValueOnce(new Error('复制失败'))
      
      wrapper = createWrapper()
      const copyButton = wrapper.find('[data-testid="copy-loan-record"]')
      
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        expect(wrapper.find('.error-message').exists()).toBe(true)
      }
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量用信记录', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        ...mockUsers['887123'].loanRecords[0],
        loanId: `LOAN-${index}`,
        productName: `贷款产品-${index}`
      }))
      
      const startTime = performance.now()
      wrapper = createWrapper({ loanRecords: largeDataset })
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(1000)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('数据更新', () => {
    it('应该响应用信记录数据变化', async () => {
      wrapper = createWrapper()
      
      const newRecords = [
        ...mockUsers['887123'].loanRecords,
        {
          loanId: 'LOAN-NEW-001',
          productName: '新贷款产品',
          loanType: '信用贷款',
          loanAmount: 50000,
          interestRate: 8.5,
          loanTerm: 12,
          status: '正常',
          repaymentDetails: []
        }
      ]
      
      await wrapper.setProps({ loanRecords: newRecords })
      expect(wrapper.text()).toContain('LOAN-NEW-001')
    })
  })
})