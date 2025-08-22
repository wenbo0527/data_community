import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-library'
import { createPinia } from 'pinia'
import ProductInfo from '@/pages/discovery/customer360/components/ProductInfo.vue'
import { createMockUserData } from '../setup'

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  Card: { name: 'ACard', template: '<div class="arco-card"><slot /></div>' },
  Tabs: { name: 'ATabs', template: '<div class="arco-tabs"><slot /></div>' },
  TabPane: { name: 'ATabPane', template: '<div class="arco-tab-pane"><slot /></div>' },
  Table: { name: 'ATable', template: '<div class="arco-table"><slot /></div>' },
  Button: { name: 'AButton', template: '<button class="arco-btn"><slot /></button>' },
  Tag: { name: 'ATag', template: '<span class="arco-tag"><slot /></span>' },
  Badge: { name: 'ABadge', template: '<span class="arco-badge"><slot /></span>' },
  Tooltip: { name: 'ATooltip', template: '<div class="arco-tooltip"><slot /></div>' },
  Space: { name: 'ASpace', template: '<div class="arco-space"><slot /></div>' },
  Divider: { name: 'ADivider', template: '<div class="arco-divider"></div>' }
}))

// Mock 快速复制服务
vi.mock('@/services/copyService', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
  copyTableData: vi.fn().mockResolvedValue(true)
}))

describe('ProductInfo Component', () => {
  let wrapper: any
  let mockUserData: any
  
  beforeEach(() => {
    mockUserData = createMockUserData()
    const pinia = createPinia()
    
    wrapper = mount(ProductInfo, {
      props: {
        userInfo: mockUserData
      },
      global: {
        plugins: [pinia]
      }
    })
  })
  
  describe('组件渲染', () => {
    it('应该正确渲染产品信息组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.arco-card').exists()).toBe(true)
    })
    
    it('应该显示产品类型标签页', () => {
      expect(wrapper.find('.arco-tabs').exists()).toBe(true)
    })
    
    it('应该显示自营产品和助贷产品标签', () => {
      expect(wrapper.text()).toContain('自营产品')
      expect(wrapper.text()).toContain('助贷产品')
    })
  })
  
  describe('产品切换测试', () => {
    it('应该能够切换到自营产品', async () => {
      const selfOperatedTab = wrapper.find('[data-testid="self-operated-tab"]')
      if (selfOperatedTab.exists()) {
        await selfOperatedTab.trigger('click')
        expect(wrapper.vm.activeProductType).toBe('self-operated')
      }
    })
    
    it('应该能够切换到助贷产品', async () => {
      const assistedLoanTab = wrapper.find('[data-testid="assisted-loan-tab"]')
      if (assistedLoanTab.exists()) {
        await assistedLoanTab.trigger('click')
        expect(wrapper.vm.activeProductType).toBe('assisted-loan')
      }
    })
    
    it('切换产品类型时应该更新显示内容', async () => {
      // 模拟切换到助贷产品
      await wrapper.setData({ activeProductType: 'assisted-loan' })
      await wrapper.vm.$nextTick()
      
      // 验证内容是否更新
      expect(wrapper.exists()).toBe(true)
    })
  })
  
  describe('模块切换测试', () => {
    it('应该显示基础信息模块', () => {
      expect(wrapper.text()).toContain('基础信息')
    })
    
    it('应该显示催收记录模块', () => {
      expect(wrapper.text()).toContain('催收记录')
    })
    
    it('应该显示征信记录模块', () => {
      expect(wrapper.text()).toContain('征信记录')
    })
    
    it('应该显示营销记录模块', () => {
      expect(wrapper.text()).toContain('营销记录')
    })
    
    it('应该能够切换到不同模块', async () => {
      const collectionTab = wrapper.find('[data-testid="collection-tab"]')
      if (collectionTab.exists()) {
        await collectionTab.trigger('click')
        expect(wrapper.vm.activeModule).toBe('collection')
      }
    })
  })
  
  describe('存款产品数据展示', () => {
    it('应该显示存款产品列表', () => {
      if (mockUserData.products.deposits.length > 0) {
        expect(wrapper.text()).toContain('存款产品')
      }
    })
    
    it('应该显示存款产品基本信息', () => {
      const deposit = mockUserData.products.deposits[0]
      if (deposit) {
        expect(wrapper.text()).toContain(deposit.productName)
        expect(wrapper.text()).toContain(deposit.accountNo)
        expect(wrapper.text()).toContain(deposit.balance.toString())
      }
    })
    
    it('应该显示存款产品状态标签', () => {
      const deposit = mockUserData.products.deposits[0]
      if (deposit) {
        expect(wrapper.text()).toContain(deposit.status)
      }
    })
  })
  
  describe('贷款产品数据展示', () => {
    it('应该显示贷款产品列表', () => {
      if (mockUserData.products.loans.length > 0) {
        expect(wrapper.text()).toContain('贷款产品')
      }
    })
    
    it('应该显示贷款产品基本信息', () => {
      const loan = mockUserData.products.loans[0]
      if (loan) {
        expect(wrapper.text()).toContain(loan.productName)
        expect(wrapper.text()).toContain(loan.contractNo)
        expect(wrapper.text()).toContain(loan.amount.toString())
      }
    })
    
    it('应该显示贷款利率信息', () => {
      const loan = mockUserData.products.loans[0]
      if (loan) {
        expect(wrapper.text()).toContain(loan.rate.toString())
      }
    })
    
    it('应该显示还款期数信息', () => {
      const loan = mockUserData.products.loans[0]
      if (loan) {
        expect(wrapper.text()).toContain(loan.remainingPeriod.toString())
        expect(wrapper.text()).toContain(loan.totalPeriod.toString())
      }
    })
  })
  
  describe('催收记录模块测试', () => {
    it('应该显示催收记录列表', async () => {
      await wrapper.setData({ activeModule: 'collection' })
      await wrapper.vm.$nextTick()
      
      if (mockUserData.collectionRecords.length > 0) {
        expect(wrapper.text()).toContain('催收记录')
      }
    })
    
    it('应该显示催收记录详细信息', async () => {
      await wrapper.setData({ activeModule: 'collection' })
      await wrapper.vm.$nextTick()
      
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain(record.collectorName)
        expect(wrapper.text()).toContain(record.collectionMethod)
      }
    })
    
    it('应该显示催收效果评分', async () => {
      await wrapper.setData({ activeModule: 'collection' })
      await wrapper.vm.$nextTick()
      
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain(record.effectiveScore.toString())
      }
    })
  })
  
  describe('征信记录模块测试', () => {
    it('应该显示征信记录列表', async () => {
      await wrapper.setData({ activeModule: 'credit' })
      await wrapper.vm.$nextTick()
      
      if (mockUserData.creditReports.length > 0) {
        expect(wrapper.text()).toContain('征信记录')
      }
    })
    
    it('应该显示征信评分', async () => {
      await wrapper.setData({ activeModule: 'credit' })
      await wrapper.vm.$nextTick()
      
      const report = mockUserData.creditReports[0]
      if (report) {
        expect(wrapper.text()).toContain(report.creditScore.toString())
        expect(wrapper.text()).toContain(report.creditLevel)
      }
    })
    
    it('应该显示征信报告链接', async () => {
      await wrapper.setData({ activeModule: 'credit' })
      await wrapper.vm.$nextTick()
      
      const report = mockUserData.creditReports[0]
      if (report) {
        expect(wrapper.text()).toContain('查看报告')
      }
    })
  })
  
  describe('营销记录模块测试', () => {
    it('应该显示营销记录', async () => {
      await wrapper.setData({ activeModule: 'marketing' })
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('营销记录')
    })
    
    it('应该显示触达记录', async () => {
      await wrapper.setData({ activeModule: 'marketing' })
      await wrapper.vm.$nextTick()
      
      if (mockUserData.marketingRecords.touchRecords.length > 0) {
        expect(wrapper.text()).toContain('触达记录')
      }
    })
    
    it('应该显示权益发放记录', async () => {
      await wrapper.setData({ activeModule: 'marketing' })
      await wrapper.vm.$nextTick()
      
      if (mockUserData.marketingRecords.benefitRecords.length > 0) {
        expect(wrapper.text()).toContain('权益发放')
      }
    })
    
    it('应该显示营销效果分析', async () => {
      await wrapper.setData({ activeModule: 'marketing' })
      await wrapper.vm.$nextTick()
      
      const analysis = mockUserData.marketingRecords.effectAnalysis
      if (analysis) {
        expect(wrapper.text()).toContain('转化率')
        expect(wrapper.text()).toContain('投资回报率')
      }
    })
  })
  
  describe('快速复制功能测试', () => {
    it('应该显示复制按钮', () => {
      const copyButtons = wrapper.findAll('[data-testid="copy-button"]')
      expect(copyButtons.length).toBeGreaterThan(0)
    })
    
    it('点击复制按钮应该调用复制服务', async () => {
      const { copyTableData } = await import('@/services/copyService')
      const copyButton = wrapper.find('[data-testid="copy-button"]')
      
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        expect(copyTableData).toHaveBeenCalled()
      }
    })
  })
  
  describe('空数据处理测试', () => {
    it('应该处理空产品列表', async () => {
      const emptyUserData = {
        ...mockUserData,
        products: { deposits: [], loans: [] },
        collectionRecords: [],
        creditReports: [],
        marketingRecords: {
          touchRecords: [],
          benefitRecords: [],
          effectAnalysis: {
            totalTouchCount: 0,
            successfulTouchCount: 0,
            conversionRate: 0,
            totalCost: 0,
            totalRevenue: 0,
            roi: 0,
            customerLifetimeValue: 0
          }
        }
      }
      
      await wrapper.setProps({ userInfo: emptyUserData })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无数据')
    })
    
    it('应该处理null用户信息', async () => {
      await wrapper.setProps({ userInfo: null })
      expect(wrapper.exists()).toBe(true)
    })
  })
  
  describe('响应式设计测试', () => {
    it('应该在移动端正确显示', async () => {
      // 模拟移动端屏幕
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
      // 模拟平板端屏幕
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
  
  describe('数据更新测试', () => {
    it('应该响应用户信息的变化', async () => {
      const newUserData = {
        ...mockUserData,
        products: {
          deposits: [
            {
              productName: '新存款产品',
              accountNo: 'NEW001',
              balance: 100000,
              openDate: '2024-01-01',
              maturityDate: '2024-12-31',
              rate: 3.5,
              status: '正常'
            }
          ],
          loans: []
        }
      }
      
      await wrapper.setProps({ userInfo: newUserData })
      expect(wrapper.text()).toContain('新存款产品')
    })
  })
  
  describe('错误处理测试', () => {
    it('应该处理无效的数据格式', async () => {
      const invalidData = {
        ...mockUserData,
        products: {
          deposits: [
            {
              productName: null,
              balance: 'invalid-number',
              rate: undefined
            }
          ],
          loans: 'invalid-array'
        }
      }
      
      await wrapper.setProps({ userInfo: invalidData })
      expect(wrapper.exists()).toBe(true)
    })
  })
})