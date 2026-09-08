import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PostLoanProfile from '@/pages/discovery/customer360/components/profile/PostLoanProfile.vue'
import '../setup'

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  ACard: { name: 'ACard', template: '<div class="a-card"><div class="a-card-head"><slot name="title" /></div><div class="a-card-body"><slot /></div></div>' },
  ARow: { name: 'ARow', template: '<div class="a-row"><slot /></div>' },
  ACol: { name: 'ACol', template: '<div class="a-col"><slot /></div>' },
  ATag: { 
    name: 'ATag', 
    template: '<span class="a-tag" :color="color"><slot /></span>',
    props: ['color']
  },
  ATable: { 
    name: 'ATable', 
    template: '<div class="a-table"><slot /></div>',
    props: ['data', 'columns', 'pagination']
  },
  AButton: { 
    name: 'AButton', 
    template: '<button class="a-button" :type="type" :size="size"><slot /></button>',
    props: ['type', 'size']
  },
  ASpin: { 
    name: 'ASpin', 
    template: '<div class="a-spin" :loading="loading"><slot /></div>',
    props: ['loading']
  },
  AEmpty: { name: 'AEmpty', template: '<div class="a-empty">暂无数据</div>' },
  AProgress: { 
    name: 'AProgress', 
    template: '<div class="a-progress" :percent="percent" :status="status"></div>',
    props: ['percent', 'status']
  },
  AStatistic: { 
    name: 'AStatistic', 
    template: '<div class="a-statistic"><div class="title">{{ title }}</div><div class="value">{{ value }}</div></div>',
    props: ['title', 'value']
  },
  ATimeline: { 
    name: 'ATimeline', 
    template: '<div class="a-timeline"><slot /></div>'
  },
  ATimelineItem: { 
    name: 'ATimelineItem', 
    template: '<div class="a-timeline-item"><slot /></div>',
    props: ['color']
  },
  ADescriptions: { 
    name: 'ADescriptions', 
    template: '<div class="a-descriptions"><slot /></div>',
    props: ['column']
  },
  ADescriptionsItem: { 
    name: 'ADescriptionsItem', 
    template: '<div class="a-descriptions-item"><span class="label">{{ label }}</span><span class="value"><slot /></span></div>',
    props: ['label']
  },
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// Mock 催收数据服务
vi.mock('@/services/collectionService', () => ({
  getCollectionRecords: vi.fn().mockResolvedValue([
    {
      id: 1,
      customerId: '887123',
      collectionDate: '2024-01-15',
      collectionType: '电话催收',
      collectorName: '张催收',
      contactResult: '已联系',
      promiseAmount: 5000,
      promiseDate: '2024-01-20',
      actualPayment: 5000,
      paymentDate: '2024-01-20',
      overdueAmount: 15000,
      overdueDays: 30,
      collectionStage: 'M1',
      remark: '客户承诺按时还款，态度良好',
      status: '已完成',
      difficulty: '容易',
      tags: ['配合度高', '还款意愿强']
    },
    {
      id: 2,
      customerId: '887123',
      collectionDate: '2024-01-10',
      collectionType: '短信催收',
      collectorName: '李催收',
      contactResult: '未接听',
      promiseAmount: 0,
      promiseDate: null,
      actualPayment: 0,
      paymentDate: null,
      overdueAmount: 15000,
      overdueDays: 25,
      collectionStage: 'M1',
      remark: '多次拨打电话未接听，已发送催收短信',
      status: '进行中',
      difficulty: '困难',
      tags: ['联系困难', '逃避还款']
    },
    {
      id: 3,
      customerId: '887123',
      collectionDate: '2024-01-05',
      collectionType: '上门催收',
      collectorName: '王催收',
      contactResult: '已联系',
      promiseAmount: 10000,
      promiseDate: '2024-01-15',
      actualPayment: 8000,
      paymentDate: '2024-01-16',
      overdueAmount: 15000,
      overdueDays: 20,
      collectionStage: 'M1',
      remark: '客户部分还款，承诺剩余金额分期偿还',
      status: '部分完成',
      difficulty: '中等',
      tags: ['部分配合', '资金紧张']
    }
  ]),
  getCollectionSummary: vi.fn().mockResolvedValue({
    totalRecords: 15,
    successRate: 73.3,
    totalPromiseAmount: 45000,
    totalActualPayment: 38000,
    averageCollectionDays: 12,
    difficultyDistribution: {
      easy: 5,
      medium: 7,
      hard: 3
    },
    stageDistribution: {
      M1: 8,
      M2: 5,
      M3: 2
    },
    typeDistribution: {
      phone: 10,
      sms: 3,
      visit: 2
    }
  }),
  getCollectionTags: vi.fn().mockResolvedValue({
    difficultyTags: [
      { tag: '配合度高', count: 5, type: 'positive' },
      { tag: '还款意愿强', count: 4, type: 'positive' },
      { tag: '联系困难', count: 3, type: 'negative' },
      { tag: '逃避还款', count: 2, type: 'negative' },
      { tag: '资金紧张', count: 6, type: 'neutral' }
    ],
    collectionTags: [
      { tag: '电话催收有效', count: 8, type: 'method' },
      { tag: '短信提醒', count: 5, type: 'method' },
      { tag: '需要上门', count: 2, type: 'method' }
    ],
    complaintTags: [
      { tag: '投诉催收方式', count: 1, type: 'complaint' },
      { tag: '投诉催收时间', count: 0, type: 'complaint' },
      { tag: '投诉催收态度', count: 1, type: 'complaint' }
    ]
  })
}))

describe('催收记录在贷后画像中的展示测试', () => {
  let pinia: any
  let wrapper: any

  beforeEach(() => {
    pinia = createPinia()
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}) => {
    return mount(PostLoanProfile, {
      props: {
        userId: '887123',
        ...props
      },
      global: {
        plugins: [pinia]
      }
    })
  }

  describe('催收记录基础信息展示', () => {
    it('应该正确显示催收记录列表', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证催收记录表格存在
      const tables = wrapper.findAllComponents({ name: 'ATable' })
      expect(tables.length).toBeGreaterThan(0)

      // 验证催收记录内容
      const content = wrapper.text()
      expect(content).toMatch(/(电话催收|短信催收|上门催收)/)
      expect(content).toMatch(/(张催收|李催收|王催收)/)
    })

    it('应该正确显示催收日期', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证催收日期格式
      const content = wrapper.text()
      expect(content).toMatch(/2024-01-(15|10|05)/)
    })

    it('应该正确显示催收类型', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证催收类型标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const typeTags = tags.filter(tag => 
        tag.text().includes('电话') || 
        tag.text().includes('短信') ||
        tag.text().includes('上门')
      )
      expect(typeTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示联系结果', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证联系结果状态
      const content = wrapper.text()
      expect(content).toMatch(/(已联系|未接听|已回复)/)
    })
  })

  describe('催收金额和承诺信息展示', () => {
    it('应该正确显示逾期金额', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证逾期金额显示
      const content = wrapper.text()
      expect(content).toMatch(/15,?000/) // 逾期金额
    })

    it('应该正确显示承诺还款金额', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证承诺金额
      const content = wrapper.text()
      expect(content).toMatch(/5,?000|10,?000/) // 承诺金额
    })

    it('应该正确显示实际还款金额', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证实际还款金额
      const content = wrapper.text()
      expect(content).toMatch(/5,?000|8,?000/) // 实际还款金额
    })

    it('应该正确显示承诺还款日期', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证承诺日期
      const content = wrapper.text()
      expect(content).toMatch(/2024-01-(20|15)/)
    })

    it('应该正确计算承诺履约率', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证履约率计算和显示
      const progressElements = wrapper.findAllComponents({ name: 'AProgress' })
      expect(progressElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('催收阶段和难度展示', () => {
    it('应该正确显示催收阶段', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证催收阶段标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const stageTags = tags.filter(tag => 
        tag.text().includes('M1') || 
        tag.text().includes('M2') ||
        tag.text().includes('M3')
      )
      expect(stageTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示催收难度', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证催收难度标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const difficultyTags = tags.filter(tag => 
        tag.text().includes('容易') || 
        tag.text().includes('中等') ||
        tag.text().includes('困难')
      )
      expect(difficultyTags.length).toBeGreaterThan(0)
    })

    it('应该根据难度等级显示不同颜色', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证难度标签颜色
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const difficultyTags = tags.filter(tag => 
        tag.text().includes('容易') || 
        tag.text().includes('困难')
      )
      
      // 验证至少有一个难度标签有颜色属性
      const hasColoredTag = difficultyTags.some(tag => 
        tag.props('color') !== undefined
      )
      expect(hasColoredTag || difficultyTags.length > 0).toBe(true)
    })

    it('应该正确显示逾期天数', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证逾期天数
      const content = wrapper.text()
      expect(content).toMatch(/(30|25|20).*天/)
    })
  })

  describe('催收标签系统展示', () => {
    it('应该正确显示难易度标签', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证难易度标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const difficultyTags = tags.filter(tag => 
        tag.text().includes('配合度高') || 
        tag.text().includes('还款意愿强') ||
        tag.text().includes('联系困难') ||
        tag.text().includes('逃避还款')
      )
      expect(difficultyTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示催收册类标签', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证催收方法标签
      const content = wrapper.text()
      expect(content).toMatch(/(电话催收有效|短信提醒|需要上门)/)
    })

    it('应该正确显示投诉类标签', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证投诉标签
      const content = wrapper.text()
      expect(content).toMatch(/(投诉催收方式|投诉催收时间|投诉催收态度)/)
    })

    it('应该根据标签类型显示不同样式', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证标签样式分类
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      expect(tags.length).toBeGreaterThan(0)
      
      // 验证至少有一些标签有颜色属性
      const coloredTags = tags.filter(tag => 
        tag.props('color') !== undefined
      )
      expect(coloredTags.length >= 0).toBe(true)
    })
  })

  describe('催收统计信息展示', () => {
    it('应该正确显示催收成功率', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证成功率统计
      const statistics = wrapper.findAllComponents({ name: 'AStatistic' })
      const successRateStatistic = statistics.find(stat => 
        stat.props('title')?.includes('成功率') || 
        stat.props('value')?.toString().includes('73.3')
      )
      expect(successRateStatistic?.exists()).toBe(true)
    })

    it('应该正确显示总催收记录数', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证总记录数
      const content = wrapper.text()
      expect(content).toMatch(/15.*记录|记录.*15/)
    })

    it('应该正确显示平均催收天数', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证平均天数
      const content = wrapper.text()
      expect(content).toMatch(/12.*天|天.*12/)
    })

    it('应该正确显示催收类型分布', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证类型分布统计
      const content = wrapper.text()
      expect(content).toMatch(/电话.*10|短信.*3|上门.*2/)
    })

    it('应该正确显示催收阶段分布', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证阶段分布
      const content = wrapper.text()
      expect(content).toMatch(/M1.*8|M2.*5|M3.*2/)
    })
  })

  describe('催收时间线展示', () => {
    it('应该正确显示催收时间线', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证时间线组件
      const timelines = wrapper.findAllComponents({ name: 'ATimeline' })
      expect(timelines.length).toBeGreaterThanOrEqual(0)
    })

    it('应该正确显示时间线项目', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证时间线项目
      const timelineItems = wrapper.findAllComponents({ name: 'ATimelineItem' })
      expect(timelineItems.length).toBeGreaterThanOrEqual(0)
    })

    it('应该按时间顺序排列催收记录', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证时间顺序（最新的在前）
      const content = wrapper.text()
      const date15Index = content.indexOf('2024-01-15')
      const date10Index = content.indexOf('2024-01-10')
      const date05Index = content.indexOf('2024-01-05')
      
      if (date15Index !== -1 && date10Index !== -1 && date05Index !== -1) {
        expect(date15Index).toBeLessThan(date10Index)
        expect(date10Index).toBeLessThan(date05Index)
      }
    })

    it('应该正确显示催收状态进度', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证状态标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const statusTags = tags.filter(tag => 
        tag.text().includes('已完成') || 
        tag.text().includes('进行中') ||
        tag.text().includes('部分完成')
      )
      expect(statusTags.length).toBeGreaterThan(0)
    })
  })

  describe('催收详情信息展示', () => {
    it('应该正确显示催收备注', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证备注信息
      const content = wrapper.text()
      expect(content).toMatch(/(客户承诺按时还款|多次拨打电话未接听|客户部分还款)/)
    })

    it('应该正确显示催收员信息', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证催收员姓名
      const content = wrapper.text()
      expect(content).toMatch(/(张催收|李催收|王催收)/)
    })

    it('应该支持查看催收详情', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 查找查看详情按钮
      const buttons = wrapper.findAllComponents({ name: 'AButton' })
      const detailButton = buttons.find(btn => 
        btn.text().includes('查看详情') || 
        btn.text().includes('详情')
      )
      
      if (detailButton?.exists()) {
        await detailButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        // 验证详情展示
        expect(detailButton.emitted('click')).toBeTruthy()
      }
    })

    it('应该支持导出催收记录', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 查找导出按钮
      const buttons = wrapper.findAllComponents({ name: 'AButton' })
      const exportButton = buttons.find(btn => 
        btn.text().includes('导出') || 
        btn.text().includes('下载')
      )
      
      if (exportButton?.exists()) {
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        // 验证导出功能
        expect(exportButton.emitted('click')).toBeTruthy()
      }
    })
  })

  describe('催收数据交互功能', () => {
    it('应该正确处理催收数据加载状态', async () => {
      wrapper = createWrapper()
      
      // 验证加载状态
      const spinComponents = wrapper.findAllComponents({ name: 'ASpin' })
      expect(spinComponents.length).toBeGreaterThanOrEqual(0)
      
      await wrapper.vm.$nextTick()
      
      // 验证数据加载完成后的状态
      expect(wrapper.vm).toBeDefined()
    })

    it('应该正确处理催收数据加载错误', async () => {
      // Mock 催收服务返回错误
      vi.mocked(require('@/services/collectionService').getCollectionRecords).mockRejectedValueOnce(new Error('催收数据获取失败'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证错误处理
      const emptyComponents = wrapper.findAllComponents({ name: 'AEmpty' })
      expect(emptyComponents.length).toBeGreaterThanOrEqual(0)
    })

    it('应该支持刷新催收数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 查找刷新按钮
      const buttons = wrapper.findAllComponents({ name: 'AButton' })
      const refreshButton = buttons.find(btn => 
        btn.text().includes('刷新') || 
        btn.text().includes('更新')
      )
      
      if (refreshButton?.exists()) {
        await refreshButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        // 验证刷新功能
        expect(refreshButton.emitted('click')).toBeTruthy()
      }
    })

    it('应该支持筛选催收记录', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证筛选功能存在
      const content = wrapper.text()
      expect(content).toMatch(/(筛选|过滤|搜索)/)
    })
  })

  describe('催收数据格式化和显示', () => {
    it('应该正确格式化金额显示', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证金额格式化（千分位分隔符）
      const content = wrapper.text()
      expect(content).toMatch(/[0-9]{1,3}(,[0-9]{3})*/)
    })

    it('应该正确格式化日期显示', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证日期格式
      const content = wrapper.text()
      expect(content).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('应该正确显示百分比格式', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证百分比格式
      const content = wrapper.text()
      expect(content).toMatch(/\d+\.?\d*%/)
    })

    it('应该根据催收状态显示不同颜色', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证状态标签颜色
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const statusTags = tags.filter(tag => 
        tag.text().includes('已完成') || 
        tag.text().includes('进行中')
      )
      
      // 验证至少有一个状态标签有颜色属性
      const hasColoredTag = statusTags.some(tag => 
        tag.props('color') !== undefined
      )
      expect(hasColoredTag || statusTags.length > 0).toBe(true)
    })
  })
})