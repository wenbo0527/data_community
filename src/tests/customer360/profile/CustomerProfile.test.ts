import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import BasicProfile from '@/pages/discovery/customer360/components/profile/BasicProfile.vue'
import RiskProfile from '@/pages/discovery/customer360/components/profile/RiskProfile.vue'
import PostLoanProfile from '@/pages/discovery/customer360/components/profile/PostLoanProfile.vue'
import '../setup'

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  ATag: { name: 'ATag', template: '<span class="a-tag" :color="color"><slot /></span>', props: ['color'] },
  ATable: { name: 'ATable', template: '<div class="a-table"><slot /></div>', props: ['data', 'columns'] },
  AButton: { name: 'AButton', template: '<button class="a-button" @click="$emit(\'click\')" :type="type"><slot /></button>', props: ['type'], emits: ['click'] },
  ARangePicker: { name: 'ARangePicker', template: '<input class="a-range-picker" />', props: ['modelValue', 'placeholder'], emits: ['update:modelValue', 'change'] },
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

describe('客户画像模块测试', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    vi.clearAllMocks()
  })

  describe('基础画像模块 (BasicProfile)', () => {
    it('应该正确渲染人口统计学特征标签', () => {
      const userInfo = {
        name: '张三',
        age: 30,
        gender: '男',
        education: '本科',
        maritalStatus: '已婚'
      }

      const wrapper = mount(BasicProfile, {
        props: { userInfo },
        global: {
          plugins: [pinia]
        }
      })

      // 验证人口统计学特征部分存在
      expect(wrapper.find('.profile-section').exists()).toBe(true)
      expect(wrapper.text()).toContain('人口统计学特征')
      
      // 验证标签容器存在
      expect(wrapper.find('.tags-container').exists()).toBe(true)
      
      // 验证标签组件被渲染
      const tags = wrapper.findAllComponents({ name: 'ATag' })
      expect(tags.length).toBeGreaterThan(0)
    })

    it('应该正确渲染行为特征标签', () => {
      const wrapper = mount(BasicProfile, {
        props: { userInfo: {} },
        global: {
          plugins: [pinia]
        }
      })

      // 验证行为特征部分存在
      expect(wrapper.text()).toContain('行为特征')
      
      // 验证行为特征标签
      const profileSections = wrapper.findAll('.profile-section')
      const behaviorSection = profileSections.find(section => 
        section.text().includes('行为特征')
      )
      expect(behaviorSection).toBeTruthy()
      expect(behaviorSection?.find('.tags-container').exists()).toBe(true)
    })

    it('应该正确渲染消费特征标签', () => {
      const wrapper = mount(BasicProfile, {
        props: { userInfo: {} },
        global: {
          plugins: [pinia]
        }
      })

      // 验证消费特征部分存在
      expect(wrapper.text()).toContain('消费特征')
      
      // 验证消费特征标签
      const profileSections = wrapper.findAll('.profile-section')
      const consumptionSection = profileSections.find(section => 
        section.text().includes('消费特征')
      )
      expect(consumptionSection).toBeTruthy()
      expect(consumptionSection?.find('.tags-container').exists()).toBe(true)
    })

    it('应该使用默认props当userInfo为空时', () => {
      const wrapper = mount(BasicProfile, {
        global: {
          plugins: [pinia]
        }
      })

      // 验证组件能正常渲染即使没有传入userInfo
      expect(wrapper.find('.basic-profile').exists()).toBe(true)
      expect(wrapper.findAll('.profile-section').length).toBe(3) // 三个特征部分
    })
  })

  describe('风险画像模块 (RiskProfile)', () => {
    it('应该正确渲染欺诈风险标签', () => {
      const wrapper = mount(RiskProfile, {
        props: { userInfo: {}, creditInfo: {} },
        global: {
          plugins: [pinia]
        }
      })

      // 验证欺诈风险部分存在
      expect(wrapper.text()).toContain('欺诈风险')
      
      const profileSections = wrapper.findAll('.profile-section')
      const fraudSection = profileSections.find(section => 
        section.text().includes('欺诈风险')
      )
      expect(fraudSection).toBeTruthy()
      expect(fraudSection?.find('.tags-container').exists()).toBe(true)
    })

    it('应该正确渲染信用风险标签和征信报告', () => {
      const creditInfo = {
        reportTime: '2024-01-15 14:30:25',
        queryOrg: '中国人民银行征信中心',
        creditScore: 785,
        creditLevel: 'AA',
        status: '正常',
        riskLevel: '低风险',
        recentQueries: 2
      }

      const wrapper = mount(RiskProfile, {
        props: { userInfo: {}, creditInfo },
        global: {
          plugins: [pinia]
        }
      })

      // 验证信用风险部分存在
      expect(wrapper.text()).toContain('信用风险')
      
      // 验证征信报告部分存在
      expect(wrapper.find('.credit-report-section').exists()).toBe(true)
      expect(wrapper.find('.credit-report-card').exists()).toBe(true)
      
      // 验证征信报告信息显示
      expect(wrapper.text()).toContain('785')
      expect(wrapper.text()).toContain('AA')
      expect(wrapper.text()).toContain('低风险')
    })

    it('应该正确渲染行为风险标签', () => {
      const wrapper = mount(RiskProfile, {
        props: { userInfo: {}, creditInfo: {} },
        global: {
          plugins: [pinia]
        }
      })

      // 验证行为风险部分存在
      expect(wrapper.text()).toContain('行为风险')
      
      const profileSections = wrapper.findAll('.profile-section')
      const behaviorSection = profileSections.find(section => 
        section.text().includes('行为风险')
      )
      expect(behaviorSection).toBeTruthy()
    })

    it('应该正确渲染逾期情况标签', () => {
      const wrapper = mount(RiskProfile, {
        props: { userInfo: {}, creditInfo: {} },
        global: {
          plugins: [pinia]
        }
      })

      // 验证逾期情况部分存在
      expect(wrapper.text()).toContain('逾期情况')
      
      const profileSections = wrapper.findAll('.profile-section')
      const overdueSection = profileSections.find(section => 
        section.text().includes('逾期情况')
      )
      expect(overdueSection).toBeTruthy()
    })

    it('应该正确处理征信报告操作', async () => {
      const wrapper = mount(RiskProfile, {
        props: { userInfo: {}, creditInfo: {} },
        global: {
          plugins: [pinia]
        }
      })

      // 查找操作按钮
      const buttons = wrapper.findAllComponents({ name: 'AButton' })
      expect(buttons.length).toBeGreaterThan(0)
      
      // 模拟点击查看报告按钮
      if (buttons.length > 0) {
        await buttons[0].trigger('click')
        // 验证Message.info被调用
        expect(vi.mocked(require('@arco-design/web-vue').Message.info)).toHaveBeenCalled()
      }
    })
  })

  describe('贷后画像模块 (PostLoanProfile)', () => {
    it('应该正确渲染催收记录标签', () => {
      const wrapper = mount(PostLoanProfile, {
        props: { userInfo: {}, collectionRecords: [] },
        global: {
          plugins: [pinia]
        }
      })

      // 验证催收记录部分存在
      expect(wrapper.text()).toContain('催收记录')
      
      const profileSections = wrapper.findAll('.profile-section')
      const collectionSection = profileSections.find(section => 
        section.text().includes('催收记录')
      )
      expect(collectionSection).toBeTruthy()
    })

    it('应该正确渲染难易度标签', () => {
      const wrapper = mount(PostLoanProfile, {
        props: { userInfo: {}, collectionRecords: [] },
        global: {
          plugins: [pinia]
        }
      })

      // 验证难易度标签部分存在
      expect(wrapper.text()).toContain('难易度标签')
      
      const profileSections = wrapper.findAll('.profile-section')
      const difficultySection = profileSections.find(section => 
        section.text().includes('难易度标签')
      )
      expect(difficultySection).toBeTruthy()
    })

    it('应该正确渲染催收册类标签', () => {
      const wrapper = mount(PostLoanProfile, {
        props: { userInfo: {}, collectionRecords: [] },
        global: {
          plugins: [pinia]
        }
      })

      // 验证催收册类标签部分存在
      expect(wrapper.text()).toContain('催收册类标签')
      
      const profileSections = wrapper.findAll('.profile-section')
      const portfolioSection = profileSections.find(section => 
        section.text().includes('催收册类标签')
      )
      expect(portfolioSection).toBeTruthy()
    })

    it('应该正确渲染投诉类标签', () => {
      const wrapper = mount(PostLoanProfile, {
        props: { userInfo: {}, collectionRecords: [] },
        global: {
          plugins: [pinia]
        }
      })

      // 验证投诉类标签部分存在
      expect(wrapper.text()).toContain('投诉类标签')
      
      const profileSections = wrapper.findAll('.profile-section')
      const complaintSection = profileSections.find(section => 
        section.text().includes('投诉类标签')
      )
      expect(complaintSection).toBeTruthy()
    })

    it('应该正确渲染催收记录详情表格', () => {
      const collectionRecords = [
        {
          id: 1,
          date: '2024-01-15',
          method: '电话催收',
          operator: '张三',
          result: '配合良好',
          notes: '客户表示将在本周内还款'
        },
        {
          id: 2,
          date: '2024-01-10',
          method: '短信催收',
          operator: '李四',
          result: '一般配合',
          notes: '客户已读短信，暂未回复'
        }
      ]

      const wrapper = mount(PostLoanProfile, {
        props: { userInfo: {}, collectionRecords },
        global: {
          plugins: [pinia]
        }
      })

      // 验证催收记录详情部分存在
      expect(wrapper.find('.collection-records-section').exists()).toBe(true)
      expect(wrapper.text()).toContain('催收记录详情')
      
      // 验证表格组件存在
      expect(wrapper.findComponent({ name: 'ATable' }).exists()).toBe(true)
    })

    it('应该正确处理催收记录详情查看', async () => {
      const collectionRecords = [
        {
          id: 1,
          date: '2024-01-15',
          method: '电话催收',
          operator: '张三',
          result: '配合良好',
          notes: '客户表示将在本周内还款'
        }
      ]

      const wrapper = mount(PostLoanProfile, {
        props: { userInfo: {}, collectionRecords },
        global: {
          plugins: [pinia]
        }
      })

      // 查找操作按钮
      const buttons = wrapper.findAllComponents({ name: 'AButton' })
      if (buttons.length > 0) {
        await buttons[0].trigger('click')
        // 验证Message.info被调用
        expect(vi.mocked(require('@arco-design/web-vue').Message.info)).toHaveBeenCalled()
      }
    })
  })

  describe('画像模块数据传递测试', () => {
    it('BasicProfile应该正确接收和处理userInfo props', () => {
      const userInfo = {
        name: '张三',
        age: 30,
        gender: '男'
      }

      const wrapper = mount(BasicProfile, {
        props: { userInfo },
        global: {
          plugins: [pinia]
        }
      })

      expect(wrapper.props('userInfo')).toEqual(userInfo)
    })

    it('RiskProfile应该正确接收和处理creditInfo props', () => {
      const creditInfo = {
        creditScore: 785,
        creditLevel: 'AA',
        riskLevel: '低风险'
      }

      const wrapper = mount(RiskProfile, {
        props: { userInfo: {}, creditInfo },
        global: {
          plugins: [pinia]
        }
      })

      expect(wrapper.props('creditInfo')).toEqual(creditInfo)
    })

    it('PostLoanProfile应该正确接收和处理collectionRecords props', () => {
      const collectionRecords = [
        { id: 1, date: '2024-01-15', method: '电话催收' }
      ]

      const wrapper = mount(PostLoanProfile, {
        props: { userInfo: {}, collectionRecords },
        global: {
          plugins: [pinia]
        }
      })

      expect(wrapper.props('collectionRecords')).toEqual(collectionRecords)
    })
  })
})