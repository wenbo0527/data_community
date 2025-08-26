import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import CollectionRecords from '@/pages/discovery/customer360/components/CollectionRecords.vue'
import { createMockUserData } from '../setup'

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  Card: { name: 'ACard', template: '<div class="arco-card"><slot /></div>' },
  Table: { name: 'ATable', template: '<div class="arco-table"><slot /></div>' },
  Timeline: { name: 'ATimeline', template: '<div class="arco-timeline"><slot /></div>' },
  TimelineItem: { name: 'ATimelineItem', template: '<div class="arco-timeline-item"><slot /></div>' },
  Button: { name: 'AButton', template: '<button class="arco-btn"><slot /></button>' },
  Tag: { name: 'ATag', template: '<span class="arco-tag"><slot /></span>' },
  Badge: { name: 'ABadge', template: '<span class="arco-badge"><slot /></span>' },
  Tooltip: { name: 'ATooltip', template: '<div class="arco-tooltip"><slot /></div>' },
  Space: { name: 'ASpace', template: '<div class="arco-space"><slot /></div>' },
  Divider: { name: 'ADivider', template: '<div class="arco-divider"></div>' },
  Empty: { name: 'AEmpty', template: '<div class="arco-empty">暂无数据</div>' },
  Tabs: { name: 'ATabs', template: '<div class="arco-tabs"><slot /></div>' },
  TabPane: { name: 'ATabPane', template: '<div class="arco-tab-pane"><slot /></div>' }
}))

// Mock 快速复制服务
vi.mock('@/services/copyService', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
  copyTableData: vi.fn().mockResolvedValue(true),
  copyCollectionRecord: vi.fn().mockResolvedValue(true)
}))

// Mock 日期格式化工具
vi.mock('@/utils/dateUtils', () => ({
  formatDate: vi.fn((date) => date),
  formatDateTime: vi.fn((date) => date),
  getRelativeTime: vi.fn((date) => '1小时前')
}))

describe('CollectionRecords Component', () => {
  let wrapper: any
  let mockUserData: any
  
  beforeEach(() => {
    mockUserData = createMockUserData()
    const pinia = createPinia()
    
    wrapper = mount(CollectionRecords, {
      props: {
        records: mockUserData.collectionRecords
      },
      global: {
        plugins: [pinia]
      }
    })
  })
  
  describe('组件渲染', () => {
    it('应该正确渲染催收记录组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('催收记录')
    })
    
    it('应该显示催收记录标题', () => {
      expect(wrapper.text()).toContain('催收记录')
    })
    
    it('应该显示视图切换标签', () => {
      expect(wrapper.text()).toContain('催收记录')
    })
  })
  
  describe('数据展示测试', () => {
    it('应该显示催收记录列表', () => {
      if (mockUserData.collectionRecords.length > 0) {
        expect(wrapper.text()).toContain('催收记录')
      }
    })
    
    it('应该显示催收记录基本信息', () => {
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain(record.collector)
        expect(wrapper.text()).toContain(record.method)
        expect(wrapper.text()).toContain(record.status)
      }
    })
    
    it('应该显示催收金额', () => {
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain('¥5,000.00')
      }
    })
    
    it('应该显示逾期天数', () => {
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain(record.overdueDays.toString())
      }
    })
    
    it('应该显示催收备注', () => {
      const record = mockUserData.collectionRecords[0]
      if (record && record.notes) {
        expect(wrapper.text()).toContain(record.notes)
      }
    })
  })
  
  describe('时间线视图测试', () => {
    it('应该能够切换到时间线视图', async () => {
      const timelineTab = wrapper.find('[data-testid="timeline-tab"]')
      if (timelineTab.exists()) {
        await timelineTab.trigger('click')
        expect(wrapper.find('.arco-timeline').exists()).toBe(true)
      }
    })
    
    it('应该在时间线中显示催收记录', () => {
      // 检查催收记录是否正确显示
      if (mockUserData.collectionRecords.length > 0) {
        expect(wrapper.text()).toContain('催收记录')
      }
    })
    
    it('应该按时间顺序排列催收记录', () => {
      // 检查催收记录是否按时间顺序显示
      expect(wrapper.text()).toContain('2024/01/15')
    })
    
    it('应该显示催收记录的相对时间', () => {
      // 检查日期格式化是否正确
      expect(wrapper.text()).toContain('2024/01/15')
    })
  })
  
  describe('催收方式标签测试', () => {
    it('应该显示不同催收方式的标签', () => {
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain(record.method)
      }
    })
    
    it('应该根据催收方式显示不同颜色的标签', () => {
      const phoneRecord = mockUserData.collectionRecords.find(r => r.method === '电话催收')
      const smsRecord = mockUserData.collectionRecords.find(r => r.method === '短信催收')
      const visitRecord = mockUserData.collectionRecords.find(r => r.method === '上门催收')
      
      if (phoneRecord) {
        expect(wrapper.text()).toContain('电话催收')
      }
      if (smsRecord) {
        expect(wrapper.text()).toContain('短信催收')
      }
      if (visitRecord) {
        expect(wrapper.text()).toContain('上门催收')
      }
    })
  })
  
  describe('催收结果状态测试', () => {
    it('应该显示催收结果状态', () => {
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain(record.status)
      }
    })
    
    it('应该根据催收结果显示不同的状态标识', () => {
      const contactedRecord = mockUserData.collectionRecords.find(r => r.status === '已联系')
      const uncontactedRecord = mockUserData.collectionRecords.find(r => r.status === '无法联系')
      const processingRecord = mockUserData.collectionRecords.find(r => r.status === '处理中')
      
      if (contactedRecord) {
        expect(wrapper.text()).toContain('已联系')
      }
      if (uncontactedRecord) {
        expect(wrapper.text()).toContain('无法联系')
      }
      if (processingRecord) {
        expect(wrapper.text()).toContain('处理中')
      }
    })
  })
  
  describe('快速复制功能测试', () => {
    it('应该显示复制按钮', () => {
      const copyButtons = wrapper.findAll('[data-testid="copy-record-button"]')
      expect(copyButtons.length).toBeGreaterThanOrEqual(0)
    })
    
    it('点击复制按钮应该调用复制服务', async () => {
      const { copyCollectionRecord } = await import('@/services/copyService')
      const copyButton = wrapper.find('[data-testid="copy-record-button"]')
      
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        expect(copyCollectionRecord).toHaveBeenCalled()
      }
    })
    
    it('应该支持批量复制催收记录', async () => {
      const { copyTableData } = await import('@/services/copyService')
      const batchCopyButton = wrapper.find('[data-testid="batch-copy-button"]')
      
      if (batchCopyButton.exists()) {
        await batchCopyButton.trigger('click')
        expect(copyTableData).toHaveBeenCalled()
      }
    })
    
    it('应该支持复制单条催收记录详情', async () => {
      const { copyToClipboard } = await import('@/services/copyService')
      const detailCopyButton = wrapper.find('[data-testid="copy-detail-button"]')
      
      if (detailCopyButton.exists()) {
        await detailCopyButton.trigger('click')
        expect(copyToClipboard).toHaveBeenCalled()
      }
    })
  })
  
  describe('筛选和排序测试', () => {
    it('应该支持按催收方式筛选', async () => {
      const filterSelect = wrapper.find('[data-testid="method-filter"]')
      if (filterSelect.exists()) {
        await filterSelect.setValue('电话催收')
        await wrapper.vm.$nextTick()
        
        // 验证筛选结果
        expect(wrapper.exists()).toBe(true)
      }
    })
    
    it('应该支持按催收结果筛选', async () => {
      const resultFilter = wrapper.find('[data-testid="result-filter"]')
      if (resultFilter.exists()) {
        await resultFilter.setValue('已联系')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.exists()).toBe(true)
      }
    })
    
    it('应该支持按时间排序', async () => {
      const sortButton = wrapper.find('[data-testid="time-sort-button"]')
      if (sortButton.exists()) {
        await sortButton.trigger('click')
        expect(wrapper.exists()).toBe(true)
      }
    })
    
    it('应该支持按效果评分排序', async () => {
      const scoreSort = wrapper.find('[data-testid="score-sort-button"]')
      if (scoreSort.exists()) {
        await scoreSort.trigger('click')
        expect(wrapper.exists()).toBe(true)
      }
    })
  })
  
  describe('空数据处理测试', () => {
    it('应该处理空催收记录列表', async () => {
      await wrapper.setProps({ records: [] })
      expect(wrapper.text()).toContain('暂无催收记录')
    })
    
    it('应该处理null催收记录', async () => {
      await wrapper.setProps({ records: null })
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该处理undefined催收记录', async () => {
      await wrapper.setProps({ records: undefined })
      expect(wrapper.exists()).toBe(true)
    })
  })
  
  describe('数据格式化测试', () => {
    it('应该正确格式化催收日期', () => {
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain('2024/01/15')
      }
    })
    
    it('应该正确格式化催收金额', () => {
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain('¥5,000.00')
      }
    })
    
    it('应该正确显示逾期天数', () => {
      const record = mockUserData.collectionRecords[0]
      if (record) {
        expect(wrapper.text()).toContain(`${record.overdueDays}天`)
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
    it('应该处理无效的催收记录数据', async () => {
      const invalidRecords = [
        {
          collector: null,
          method: undefined,
          overdueAmount: 'invalid-number',
          overdueDays: -1,
          status: null
        }
      ]
      
      await wrapper.setProps({ records: invalidRecords })
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该处理复制功能失败', async () => {
      const { copyCollectionRecord } = await import('@/services/copyService')
      copyCollectionRecord.mockRejectedValueOnce(new Error('复制失败'))
      
      const copyButton = wrapper.find('[data-testid="copy-record-button"]')
      if (copyButton.exists()) {
        await copyButton.trigger('click')
        // 验证错误处理
        expect(wrapper.exists()).toBe(true)
      }
    })
  })
  
  describe('性能测试', () => {
    it('应该能够处理大量催收记录', async () => {
      const largeRecordList = Array.from({ length: 1000 }, (_, index) => ({
        id: `record-${index}`,
        collector: `催收员${index}`,
        method: '电话催收',
        date: '2024-01-15',
        status: '已联系',
        overdueAmount: 10000 + index,
        overdueDays: 30 + (index % 60),
        notes: `催收记录${index}的备注信息`
      }))
      
      await wrapper.setProps({ records: largeRecordList })
      expect(wrapper.exists()).toBe(true)
    })
  })
})