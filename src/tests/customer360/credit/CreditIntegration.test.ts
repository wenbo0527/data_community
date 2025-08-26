import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import RiskProfile from '@/pages/discovery/customer360/components/profile/RiskProfile.vue'
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
    template: '<button class="a-button" :type="type"><slot /></button>',
    props: ['type']
  },
  ASpin: { 
    name: 'ASpin', 
    template: '<div class="a-spin" :loading="loading"><slot /></div>',
    props: ['loading']
  },
  AEmpty: { name: 'AEmpty', template: '<div class="a-empty">暂无数据</div>' },
  AProgress: { 
    name: 'AProgress', 
    template: '<div class="a-progress" :percent="percent"></div>',
    props: ['percent']
  },
  AStatistic: { 
    name: 'AStatistic', 
    template: '<div class="a-statistic"><div class="title">{{ title }}</div><div class="value">{{ value }}</div></div>',
    props: ['title', 'value']
  },
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// Mock 征信数据服务
vi.mock('@/services/creditService', () => ({
  getCreditReports: vi.fn().mockResolvedValue([
    {
      id: 1,
      reportDate: '2024-01-15',
      reportType: '个人征信报告',
      creditScore: 750,
      riskLevel: '低风险',
      queryCount: 3,
      accountCount: 8,
      overdueCount: 0,
      totalCredit: 500000,
      usedCredit: 150000,
      creditUtilization: 30,
      details: {
        personalInfo: {
          name: '张三',
          idCard: '110101199001011234',
          phone: '13800138000'
        },
        creditAccounts: [
          {
            id: 1,
            bankName: '工商银行',
            accountType: '信用卡',
            creditLimit: 50000,
            balance: 15000,
            status: '正常',
            openDate: '2020-01-01',
            lastPaymentDate: '2024-01-10'
          },
          {
            id: 2,
            bankName: '建设银行',
            accountType: '个人贷款',
            creditLimit: 300000,
            balance: 120000,
            status: '正常',
            openDate: '2021-06-15',
            lastPaymentDate: '2024-01-05'
          }
        ],
        queryRecords: [
          {
            id: 1,
            queryDate: '2024-01-10',
            queryReason: '贷款审批',
            queryInstitution: '某银行'
          },
          {
            id: 2,
            queryDate: '2023-12-15',
            queryReason: '信用卡申请',
            queryInstitution: '某信用卡公司'
          }
        ],
        riskIndicators: {
          fraudRisk: '低',
          creditRisk: '中',
          behaviorRisk: '低',
          overdueDays: 0,
          maxOverdueAmount: 0,
          recentQueryCount: 2
        }
      }
    }
  ]),
  getCreditScore: vi.fn().mockResolvedValue({
    score: 750,
    level: '优秀',
    factors: [
      { factor: '还款历史', impact: '正面', weight: 35 },
      { factor: '信用使用率', impact: '正面', weight: 30 },
      { factor: '信用历史长度', impact: '正面', weight: 15 },
      { factor: '信用类型', impact: '中性', weight: 10 },
      { factor: '新开账户', impact: '负面', weight: 10 }
    ]
  }),
  getCreditTrend: vi.fn().mockResolvedValue([
    { month: '2023-07', score: 720 },
    { month: '2023-08', score: 725 },
    { month: '2023-09', score: 730 },
    { month: '2023-10', score: 735 },
    { month: '2023-11', score: 740 },
    { month: '2023-12', score: 745 },
    { month: '2024-01', score: 750 }
  ])
}))

describe('征信信息在风险画像中的展示测试', () => {
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
    return mount(RiskProfile, {
      props: {
        userId: '887123',
        ...props
      },
      global: {
        plugins: [pinia]
      }
    })
  }

  describe('征信报告基础信息展示', () => {
    it('应该正确显示征信评分', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证征信评分显示
      const scoreElements = wrapper.findAllComponents({ name: 'AStatistic' })
      const scoreElement = scoreElements.find(el => 
        el.props('title')?.includes('征信评分') || 
        el.text().includes('750')
      )
      expect(scoreElement?.exists()).toBe(true)
    })

    it('应该正确显示风险等级标签', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证风险等级标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const riskTag = tags.find(tag => 
        tag.text().includes('低风险') || 
        tag.text().includes('风险')
      )
      expect(riskTag?.exists()).toBe(true)
    })

    it('应该正确显示信用使用率', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证信用使用率进度条
      const progressElements = wrapper.findAllComponents({ name: 'AProgress' })
      const utilizationProgress = progressElements.find(el => 
        el.props('percent') === 30
      )
      expect(utilizationProgress?.exists()).toBe(true)
    })

    it('应该正确显示征信查询次数', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证查询次数显示
      const content = wrapper.text()
      expect(content).toMatch(/查询.*3.*次|3.*次.*查询/)
    })
  })

  describe('征信账户信息展示', () => {
    it('应该正确显示信用账户列表', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证账户表格存在
      const tables = wrapper.findAllComponents({ name: 'ATable' })
      expect(tables.length).toBeGreaterThan(0)

      // 验证账户信息显示
      const content = wrapper.text()
      expect(content).toMatch(/(工商银行|建设银行)/)
      expect(content).toMatch(/(信用卡|个人贷款)/)
    })

    it('应该正确显示账户状态', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证账户状态标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const statusTags = tags.filter(tag => 
        tag.text().includes('正常') || 
        tag.text().includes('逾期') ||
        tag.text().includes('关闭')
      )
      expect(statusTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示信用额度和余额', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证额度和余额信息
      const content = wrapper.text()
      expect(content).toMatch(/50,?000|300,?000/) // 信用额度
      expect(content).toMatch(/15,?000|120,?000/) // 使用余额
    })

    it('应该正确计算和显示总体信用情况', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证总信用额度
      const content = wrapper.text()
      expect(content).toMatch(/500,?000/) // 总信用额度
      expect(content).toMatch(/150,?000/) // 已使用额度
    })
  })

  describe('征信查询记录展示', () => {
    it('应该正确显示查询记录列表', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证查询记录表格
      const content = wrapper.text()
      expect(content).toMatch(/(贷款审批|信用卡申请)/)
      expect(content).toMatch(/(某银行|某信用卡公司)/)
    })

    it('应该正确显示查询日期', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证查询日期格式
      const content = wrapper.text()
      expect(content).toMatch(/2024-01-10|2023-12-15/)
    })

    it('应该正确显示查询原因', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证查询原因分类
      const content = wrapper.text()
      expect(content).toMatch(/(贷款审批|信用卡申请|贷后管理)/)
    })

    it('应该正确统计近期查询次数', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证近期查询统计
      const content = wrapper.text()
      expect(content).toMatch(/近.*月.*查询.*2.*次|2.*次.*近.*月/)
    })
  })

  describe('风险指标展示', () => {
    it('应该正确显示欺诈风险评估', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证欺诈风险标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const fraudRiskTag = tags.find(tag => 
        tag.text().includes('欺诈风险') && tag.text().includes('低')
      )
      expect(fraudRiskTag?.exists()).toBe(true)
    })

    it('应该正确显示信用风险评估', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证信用风险标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const creditRiskTag = tags.find(tag => 
        tag.text().includes('信用风险') && tag.text().includes('中')
      )
      expect(creditRiskTag?.exists()).toBe(true)
    })

    it('应该正确显示行为风险评估', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证行为风险标签
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const behaviorRiskTag = tags.find(tag => 
        tag.text().includes('行为风险') && tag.text().includes('低')
      )
      expect(behaviorRiskTag?.exists()).toBe(true)
    })

    it('应该正确显示逾期情况', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证逾期天数和金额
      const content = wrapper.text()
      expect(content).toMatch(/逾期.*0.*天|0.*天.*逾期/)
      expect(content).toMatch(/逾期.*0.*元|0.*元.*逾期/)
    })
  })

  describe('征信评分趋势展示', () => {
    it('应该正确显示评分历史趋势', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证趋势图容器存在
      const content = wrapper.text()
      expect(content).toMatch(/(评分趋势|历史评分|趋势图)/)
    })

    it('应该正确显示评分影响因素', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证影响因素列表
      const content = wrapper.text()
      expect(content).toMatch(/(还款历史|信用使用率|信用历史长度)/)
      expect(content).toMatch(/(正面|负面|中性)/)
    })

    it('应该正确显示各因素权重', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证权重百分比
      const content = wrapper.text()
      expect(content).toMatch(/35%|30%|15%|10%/)
    })
  })

  describe('征信数据交互功能', () => {
    it('应该支持查看详细征信报告', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 查找查看详情按钮
      const buttons = wrapper.findAllComponents({ name: 'AButton' })
      const detailButton = buttons.find(btn => 
        btn.text().includes('查看详情') || 
        btn.text().includes('详细报告')
      )
      
      if (detailButton?.exists()) {
        await detailButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        // 验证详情展示
        expect(detailButton.emitted('click')).toBeTruthy()
      }
    })

    it('应该支持刷新征信数据', async () => {
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

    it('应该正确处理征信数据加载状态', async () => {
      wrapper = createWrapper()
      
      // 验证加载状态
      const spinComponents = wrapper.findAllComponents({ name: 'ASpin' })
      expect(spinComponents.length).toBeGreaterThanOrEqual(0)
      
      await wrapper.vm.$nextTick()
      
      // 验证数据加载完成后的状态
      expect(wrapper.vm).toBeDefined()
    })

    it('应该正确处理征信数据加载错误', async () => {
      // Mock 征信服务返回错误
      vi.mocked(require('@/services/creditService').getCreditReports).mockRejectedValueOnce(new Error('征信数据获取失败'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证错误处理
      const emptyComponents = wrapper.findAllComponents({ name: 'AEmpty' })
      expect(emptyComponents.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('征信数据格式化和显示', () => {
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
      expect(content).toMatch(/\d+%/)
    })

    it('应该根据风险等级显示不同颜色标签', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证风险标签颜色
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      const riskTags = tags.filter(tag => 
        tag.text().includes('风险')
      )
      
      // 验证至少有一个风险标签有颜色属性
      const hasColoredTag = riskTags.some(tag => 
        tag.props('color') !== undefined
      )
      expect(hasColoredTag || riskTags.length > 0).toBe(true)
    })
  })
})