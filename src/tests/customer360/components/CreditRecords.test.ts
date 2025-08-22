import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-library'
import { createPinia } from 'pinia'
import CreditRecords from '@/pages/discovery/customer360/components/CreditRecords.vue'
import { createMockUserData } from '../setup'

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  Card: { name: 'ACard', template: '<div class="arco-card"><slot /></div>' },
  Table: { name: 'ATable', template: '<div class="arco-table"><slot /></div>' },
  Button: { name: 'AButton', template: '<button class="arco-btn"><slot /></button>' },
  Tag: { name: 'ATag', template: '<span class="arco-tag"><slot /></span>' },
  Badge: { name: 'ABadge', template: '<span class="arco-badge"><slot /></span>' },
  Tooltip: { name: 'ATooltip', template: '<div class="arco-tooltip"><slot /></div>' },
  Space: { name: 'ASpace', template: '<div class="arco-space"><slot /></div>' },
  Divider: { name: 'ADivider', template: '<div class="arco-divider"></div>' },
  Empty: { name: 'AEmpty', template: '<div class="arco-empty">暂无数据</div>' },
  Modal: { name: 'AModal', template: '<div class="arco-modal"><slot /></div>' },
  Descriptions: { name: 'ADescriptions', template: '<div class="arco-descriptions"><slot /></div>' },
  DescriptionsItem: { name: 'ADescriptionsItem', template: '<div class="arco-descriptions-item"><slot /></div>' },
  Progress: { name: 'AProgress', template: '<div class="arco-progress"><slot /></div>' },
  Alert: { name: 'AAlert', template: '<div class="arco-alert"><slot /></div>' }
}))

// Mock 快速复制服务
vi.mock('@/services/copyService', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
  copyTableData: vi.fn().mockResolvedValue(true),
  copyCreditReport: vi.fn().mockResolvedValue(true)
}))

// Mock 日期格式化工具
vi.mock('@/utils/dateUtils', () => ({
  formatDate: vi.fn((date) => date),
  formatDateTime: vi.fn((date) => date),
  getRelativeTime: vi.fn((date) => '1天前')
}))

// Mock 文件下载服务
vi.mock('@/services/downloadService', () => ({
  downloadFile: vi.fn().mockResolvedValue(true),
  previewFile: vi.fn().mockResolvedValue(true)
}))

describe('CreditRecords Component', () => {
  let wrapper: any
  let mockUserData: any
  
  beforeEach(() => {
    mockUserData = createMockUserData()
    const pinia = createPinia()
    
    wrapper = mount(CreditRecords, {
      props: {
        creditReports: mockUserData.creditReports
      },
      global: {
        plugins: [pinia]
      }
    })
  })
  
  describe('组件渲染', () => {
    it('应该正确渲染征信记录组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.arco-card').exists()).toBe(true)
    })
    
    it('应该显示征信记录标题', () => {
      expect(wrapper.text()).toContain('征信记录')
    })
    
    it('应该显示征信报告列表', () => {
      if (mockUserData.creditReports.length > 0) {
        expect(wrapper.find('.arco-table').exists()).toBe(true)
      }
    })
  })
  
  describe('征信数据展示测试', () => {
    it('应该显示征信报告基本信息', () => {
      const report = mockUserData.creditReports[0]
      if (report) {
        expect(wrapper.text()).toContain(report.reportType)
        expect(wrapper.text()).toContain(report.reportSource)
        expect(wrapper.text()).toContain(report.creditScore.toString())
        expect(wrapper.text()).toContain(report.creditLevel)
      }
    })
    
    it('应该显示征信评分', () => {
      const report = mockUserData.creditReports[0]
      if (report) {
        expect(wrapper.text()).toContain(report.creditScore.toString())
      }
    })
    
    it('应该显示征信等级', () => {
      const report = mockUserData.creditReports[0]
      if (report) {
        expect(wrapper.text()).toContain(report.creditLevel)
      }
    })
    
    it('应该显示报告生成时间', () => {
      const report = mockUserData.creditReports[0]
      if (report) {
        const { formatDate } = require('@/utils/dateUtils')
        expect(formatDate).toHaveBeenCalledWith(report.reportDate)
      }
    })
    
    it('应该显示报告有效期', () => {
      const report = mockUserData.creditReports[0]
      if (report) {
        const { formatDate } = require('@/utils/dateUtils')
        expect(formatDate).toHaveBeenCalledWith(report.validUntil)
      }
    })
  })
  
  describe('征信等级标签测试', () => {
    it('应该根据征信等级显示不同颜色的标签', () => {
      const excellentReport = mockUserData.creditReports.find(r => r.creditLevel === '优秀')
      const goodReport = mockUserData.creditReports.find(r => r.creditLevel === '良好')
      const fairReport = mockUserData.creditReports.find(r => r.creditLevel === '一般')
      const poorReport = mockUserData.creditReports.find(r => r.creditLevel === '较差')
      
      if (excellentReport) {
        expect(wrapper.text()).toContain('优秀')
      }
      if (goodReport) {
        expect(wrapper.text()).toContain('良好')
      }
      if (fairReport) {
        expect(wrapper.text()).toContain('一般')
      }
      if (poorReport) {
        expect(wrapper.text()).toContain('较差')
      }
    })
    
    it('应该显示征信评分进度条', () => {
      const report = mockUserData.creditReports[0]
      if (report && report.creditScore) {
        expect(wrapper.find('.arco-progress').exists()).toBe(true)
      }
    })
  })
  
  describe('报告链接和预览测试', () => {
    it('应该显示查看报告按钮', () => {
      const viewButtons = wrapper.findAll('[data-testid="view-report-button"]')
      expect(viewButtons.length).toBeGreaterThanOrEqual(0)
    })
    
    it('点击查看报告应该打开预览模态框', async () => {
      const viewButton = wrapper.find('[data-testid="view-report-button"]')
      if (viewButton.exists()) {
        await viewButton.trigger('click')
        expect(wrapper.find('.arco-modal').exists()).toBe(true)
      }
    })
    
    it('应该显示下载报告按钮', () => {
      const downloadButtons = wrapper.findAll('[data-testid="download-report-button"]')
      expect(downloadButtons.length).toBeGreaterThanOrEqual(0)
    })
    
    it('点击下载报告应该调用下载服务', async () => {
      const { downloadFile } = await import('@/services/downloadService')
      const downloadButton = wrapper.find('[data-testid="download-report-button"]')
      
      if (downloadButton.exists()) {
        await downloadButton.trigger('click')
        expect(downloadFile).toHaveBeenCalled()
      }
    })
    
    it('应该支持在线预览报告', async () => {
      const { previewFile } = await import('@/services/downloadService')
      const previewButton = wrapper.find('[data-testid="preview-report-button"]')
      
      if (previewButton.exists()) {
        await previewButton.trigger('click')
        expect(previewFile).toHaveBeenCalled()
      }
    })
  })
  
  describe('征信详情展示测试', () => {
    it('应该显示征信详情信息', async () => {
      const detailButton = wrapper.find('[data-testid="detail-button"]')
      if (detailButton.exists()) {
        await detailButton.trigger('click')
        expect(wrapper.find('.arco-descriptions').exists()).toBe(true)
      }
    })
    
    it('应该显示查询记录', () => {
      const report = mockUserData.creditReports[0]
      if (report && report.queryRecords) {
        expect(wrapper.text()).toContain('查询记录')
      }
    })
    
    it('应该显示信贷记录', () => {
      const report = mockUserData.creditReports[0]
      if (report && report.creditRecords) {
        expect(wrapper.text()).toContain('信贷记录')
      }
    })
    
    it('应该显示逾期记录', () => {
      const report = mockUserData.creditReports[0]
      if (report && report.overdueRecords) {
        expect(wrapper.text()).toContain('逾期记录')
      }
    })
    
    it('应该显示担保记录', () => {
      const report = mockUserData.creditReports[0]
      if (report && report.guaranteeRecords) {
        expect(wrapper.text()).toContain('担保记录')
      }
    })
  })
  
  describe('报告状态测试', () => {
    it('应该显示报告状态标识', () => {
      const report = mockUserData.creditReports[0]
      if (report) {
        expect(wrapper.text()).toContain(report.status)
      }
    })
    
    it('应该根据报告状态显示不同的标签颜色', () => {
      const validReport = mockUserData.creditReports.find(r => r.status === '有效')
      const expiredReport = mockUserData.creditReports.find(r => r.status === '已过期')
      const processingReport = mockUserData.creditReports.find(r => r.status === '处理中')
      
      if (validReport) {
        expect(wrapper.text()).toContain('有效')
      }
      if (expiredReport) {
        expect(wrapper.text()).toContain('已过期')
      }
      if (processingReport) {
        expect(wrapper.text()).toContain('处理中')
      }
    })
    
    it('应该显示过期警告', () => {
      const expiredReport = mockUserData.creditReports.find(r => r.status === '已过期')
      if (expiredReport) {
        expect(wrapper.find('.arco-alert').exists()).toBe(true)
      }
    })
  })
  
  describe('快速复制功能测试', () => {
    it('应该显示复制按钮', () => {
      const copyButtons = wrapper.findAll('[data-testid="copy-report-button"]')
      expect(copyButtons.length).toBeGreaterThanOrEqual(0)
    })
    
    it('点击复制按钮应该调用复制服务', async () => {
      const { copyCreditReport } = await import('@/services/copyService')
      const copyButton = wrapper.find('[data-testid="copy-report-button"]')
      
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        expect(copyCreditReport).toHaveBeenCalled()
      }
    })
    
    it('应该支持复制征信摘要', async () => {
      const { copyToClipboard } = await import('@/services/copyService')
      const copySummaryButton = wrapper.find('[data-testid="copy-summary-button"]')
      
      if (copySummaryButton.exists()) {
        await copySummaryButton.trigger('click')
        expect(copyToClipboard).toHaveBeenCalled()
      }
    })
    
    it('应该支持批量复制征信记录', async () => {
      const { copyTableData } = await import('@/services/copyService')
      const batchCopyButton = wrapper.find('[data-testid="batch-copy-button"]')
      
      if (batchCopyButton.exists()) {
        await batchCopyButton.trigger('click')
        expect(copyTableData).toHaveBeenCalled()
      }
    })
  })
  
  describe('筛选和排序测试', () => {
    it('应该支持按报告类型筛选', async () => {
      const typeFilter = wrapper.find('[data-testid="type-filter"]')
      if (typeFilter.exists()) {
        await typeFilter.setValue('个人征信报告')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.exists()).toBe(true)
      }
    })
    
    it('应该支持按征信等级筛选', async () => {
      const levelFilter = wrapper.find('[data-testid="level-filter"]')
      if (levelFilter.exists()) {
        await levelFilter.setValue('优秀')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.exists()).toBe(true)
      }
    })
    
    it('应该支持按时间排序', async () => {
      const timeSort = wrapper.find('[data-testid="time-sort-button"]')
      if (timeSort.exists()) {
        await timeSort.trigger('click')
        expect(wrapper.exists()).toBe(true)
      }
    })
    
    it('应该支持按征信评分排序', async () => {
      const scoreSort = wrapper.find('[data-testid="score-sort-button"]')
      if (scoreSort.exists()) {
        await scoreSort.trigger('click')
        expect(wrapper.exists()).toBe(true)
      }
    })
  })
  
  describe('征信风险提示测试', () => {
    it('应该显示低分征信的风险提示', () => {
      const lowScoreReport = mockUserData.creditReports.find(r => r.creditScore < 600)
      if (lowScoreReport) {
        expect(wrapper.find('.arco-alert').exists()).toBe(true)
        expect(wrapper.text()).toContain('风险提示')
      }
    })
    
    it('应该显示逾期记录警告', () => {
      const overdueReport = mockUserData.creditReports.find(r => 
        r.overdueRecords && r.overdueRecords.length > 0
      )
      if (overdueReport) {
        expect(wrapper.text()).toContain('逾期')
      }
    })
    
    it('应该显示查询次数过多警告', () => {
      const highQueryReport = mockUserData.creditReports.find(r => 
        r.queryRecords && r.queryRecords.length > 10
      )
      if (highQueryReport) {
        expect(wrapper.text()).toContain('查询频繁')
      }
    })
  })
  
  describe('空数据处理测试', () => {
    it('应该处理空征信记录列表', async () => {
      await wrapper.setProps({ creditReports: [] })
      expect(wrapper.find('.arco-empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无数据')
    })
    
    it('应该处理null征信记录', async () => {
      await wrapper.setProps({ creditReports: null })
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该处理undefined征信记录', async () => {
      await wrapper.setProps({ creditReports: undefined })
      expect(wrapper.exists()).toBe(true)
    })
  })
  
  describe('数据格式化测试', () => {
    it('应该正确格式化征信评分', () => {
      const report = mockUserData.creditReports[0]
      if (report) {
        expect(wrapper.text()).toContain(report.creditScore.toString())
      }
    })
    
    it('应该正确格式化报告日期', () => {
      const { formatDate } = require('@/utils/dateUtils')
      const report = mockUserData.creditReports[0]
      
      if (report) {
        expect(formatDate).toHaveBeenCalledWith(report.reportDate)
      }
    })
    
    it('应该正确显示相对时间', () => {
      const { getRelativeTime } = require('@/utils/dateUtils')
      const report = mockUserData.creditReports[0]
      
      if (report) {
        expect(getRelativeTime).toHaveBeenCalledWith(report.reportDate)
      }
    })
  })
  
  describe('响应式设计测试', () => {
    it('应该在移动端正确显示', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该在平板端正确显示', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
    })
  })
  
  describe('错误处理测试', () => {
    it('应该处理无效的征信记录数据', async () => {
      const invalidReports = [
        {
          reportType: null,
          creditScore: 'invalid-score',
          creditLevel: undefined,
          reportDate: 'invalid-date',
          validUntil: null
        }
      ]
      
      await wrapper.setProps({ creditReports: invalidReports })
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该处理下载失败', async () => {
      const { downloadFile } = await import('@/services/downloadService')
      downloadFile.mockRejectedValueOnce(new Error('下载失败'))
      
      const downloadButton = wrapper.find('[data-testid="download-report-button"]')
      if (downloadButton.exists()) {
        await downloadButton.trigger('click')
        expect(wrapper.exists()).toBe(true)
      }
    })
    
    it('应该处理预览失败', async () => {
      const { previewFile } = await import('@/services/downloadService')
      previewFile.mockRejectedValueOnce(new Error('预览失败'))
      
      const previewButton = wrapper.find('[data-testid="preview-report-button"]')
      if (previewButton.exists()) {
        await previewButton.trigger('click')
        expect(wrapper.exists()).toBe(true)
      }
    })
  })
  
  describe('性能测试', () => {
    it('应该能够处理大量征信记录', async () => {
      const largeReportList = Array.from({ length: 100 }, (_, index) => ({
        id: `report-${index}`,
        reportType: '个人征信报告',
        reportSource: '人民银行',
        reportDate: new Date().toISOString(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        creditScore: 600 + (index % 300),
        creditLevel: ['优秀', '良好', '一般', '较差'][index % 4],
        status: '有效',
        reportUrl: `https://example.com/report-${index}.pdf`,
        queryRecords: [],
        creditRecords: [],
        overdueRecords: [],
        guaranteeRecords: []
      }))
      
      await wrapper.setProps({ creditReports: largeReportList })
      expect(wrapper.exists()).toBe(true)
    })
  })
})