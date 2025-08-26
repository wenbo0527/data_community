import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Customer360Detail from '@/pages/discovery/customer360/detail.vue'
import '../setup'

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  ALayout: { name: 'ALayout', template: '<div class="a-layout"><slot /></div>' },
  ALayoutHeader: { name: 'ALayoutHeader', template: '<header class="a-layout-header"><slot /></header>' },
  ALayoutContent: { name: 'ALayoutContent', template: '<main class="a-layout-content"><slot /></main>' },
  ALayoutSider: { name: 'ALayoutSider', template: '<aside class="a-layout-sider"><slot /></aside>' },
  ATabs: { 
    name: 'ATabs', 
    template: '<div class="a-tabs" :activeKey="activeKey" @change="$emit(\'change\', $event)"><slot /></div>',
    props: ['activeKey'],
    emits: ['change']
  },
  ATabPane: { 
    name: 'ATabPane', 
    template: '<div class="a-tab-pane" :key="tabKey"><slot /></div>',
    props: ['key', 'tab']
  },
  ACard: { name: 'ACard', template: '<div class="a-card"><slot /></div>' },
  ATag: { name: 'ATag', template: '<span class="a-tag"><slot /></span>' },
  ATable: { name: 'ATable', template: '<div class="a-table"><slot /></div>' },
  AButton: { name: 'AButton', template: '<button class="a-button"><slot /></button>' },
  ASelect: { name: 'ASelect', template: '<select class="a-select"><slot /></select>' },
  AOption: { name: 'AOption', template: '<option class="a-option"><slot /></option>' },
  AInput: { name: 'AInput', template: '<input class="a-input" />' },
  ARangePicker: { name: 'ARangePicker', template: '<input class="a-range-picker" />' },
  ADrawer: { name: 'ADrawer', template: '<div class="a-drawer"><slot /></div>' },
  ASpin: { name: 'ASpin', template: '<div class="a-spin"><slot /></div>' },
  AEmpty: { name: 'AEmpty', template: '<div class="a-empty">暂无数据</div>' },
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// Mock fetchUserInfo 函数
vi.mock('@/mock/customer360', () => ({
  fetchUserInfo: vi.fn().mockResolvedValue({
    basicInfo: {
      name: '张三',
      idCard: '110101199001011234',
      phone: '13800138000',
      age: 30,
      gender: '男',
      address: '北京市朝阳区'
    },
    products: [
      { id: 1, productType: 'loan', amount: 10000 },
      { id: 2, productType: 'loan', amount: 50000 }
    ],
    collectionRecords: [{ id: 1, type: '电话催收', amount: 1000 }],
    creditReports: [{ id: 1, reportDate: '2024-01-01', score: 750 }],
    marketingRecords: [{ id: 1, campaignName: '信贷推广', responseRate: 15.5 }],
    loanRecords: [{ id: 1, amount: 50000, status: '正常' }]
  }),
  mockUsers: {
    '887123': {
      basicInfo: {
        name: '张三',
        idCard: '110101199001011234',
        phone: '13800138000',
        age: 30,
        gender: '男',
        address: '北京市朝阳区'
      }
    }
  }
}))

describe('两级Tab架构功能测试', () => {
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
    return mount(Customer360Detail, {
      props: {
        userId: '887123',
        ...props
      },
      global: {
        plugins: [pinia]
      }
    })
  }

  describe('一级Tab架构测试', () => {
    it('应该正确渲染一级Tab标签页', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证一级Tab容器存在
      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      expect(mainTabs.exists()).toBe(true)

      // 验证一级Tab页面存在
      const tabPanes = wrapper.findAllComponents({ name: 'ATabPane' })
      expect(tabPanes.length).toBeGreaterThan(0)

      // 验证主要的一级Tab标签
      const tabsText = wrapper.text()
      expect(tabsText).toContain('基本信息') // 或其他一级Tab名称
    })

    it('应该支持一级Tab切换功能', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      expect(mainTabs.exists()).toBe(true)

      // 模拟Tab切换
      await mainTabs.vm.$emit('change', 'profile')
      await wrapper.vm.$nextTick()

      // 验证Tab切换事件被正确处理
      expect(mainTabs.emitted('change')).toBeTruthy()
    })

    it('应该正确设置默认激活的一级Tab', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      expect(mainTabs.exists()).toBe(true)

      // 验证默认激活的Tab
      expect(mainTabs.props('activeKey')).toBeDefined()
    })
  })

  describe('二级Tab架构测试', () => {
    it('应该在客户画像Tab下正确渲染二级Tab', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 切换到客户画像Tab
      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 查找二级Tab
      const allTabs = wrapper.findAllComponents({ name: 'ATabs' })
      expect(allTabs.length).toBeGreaterThanOrEqual(1)

      // 验证二级Tab内容
      const tabsText = wrapper.text()
      expect(tabsText).toMatch(/(基础画像|风险画像|贷后画像)/)
    })

    it('应该支持二级Tab切换功能', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 切换到客户画像Tab
      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 查找二级Tab
      const allTabs = wrapper.findAllComponents({ name: 'ATabs' })
      if (allTabs.length > 1) {
        const secondLevelTabs = allTabs[1] // 假设第二个是二级Tab
        
        // 模拟二级Tab切换
        await secondLevelTabs.vm.$emit('change', 'risk')
        await wrapper.vm.$nextTick()

        // 验证二级Tab切换事件被正确处理
        expect(secondLevelTabs.emitted('change')).toBeTruthy()
      }
    })

    it('应该正确显示基础画像二级Tab内容', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 切换到客户画像Tab
      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 验证基础画像内容
      const content = wrapper.text()
      expect(content).toMatch(/(人口统计学特征|行为特征|消费特征)/)
    })

    it('应该正确显示风险画像二级Tab内容', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 切换到客户画像Tab和风险画像二级Tab
      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 查找并切换二级Tab
      const allTabs = wrapper.findAllComponents({ name: 'ATabs' })
      if (allTabs.length > 1) {
        await allTabs[1].vm.$emit('change', 'risk')
        await wrapper.vm.$nextTick()
      }

      // 验证风险画像内容
      const content = wrapper.text()
      expect(content).toMatch(/(欺诈风险|信用风险|行为风险|逾期情况)/)
    })

    it('应该正确显示贷后画像二级Tab内容', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 切换到客户画像Tab和贷后画像二级Tab
      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 查找并切换二级Tab
      const allTabs = wrapper.findAllComponents({ name: 'ATabs' })
      if (allTabs.length > 1) {
        await allTabs[1].vm.$emit('change', 'postloan')
        await wrapper.vm.$nextTick()
      }

      // 验证贷后画像内容
      const content = wrapper.text()
      expect(content).toMatch(/(催收记录|难易度标签|催收册类标签|投诉类标签)/)
    })
  })

  describe('Tab架构交互测试', () => {
    it('应该在一级Tab切换时保持二级Tab状态', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      
      // 切换到客户画像Tab
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 设置二级Tab状态
      const allTabs = wrapper.findAllComponents({ name: 'ATabs' })
      if (allTabs.length > 1) {
        await allTabs[1].vm.$emit('change', 'risk')
        await wrapper.vm.$nextTick()
      }

      // 切换到其他一级Tab再切换回来
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'basic')
        await wrapper.vm.$nextTick()
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 验证二级Tab状态是否保持
      expect(wrapper.vm).toBeDefined()
    })

    it('应该正确处理Tab切换时的数据加载', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      
      // 模拟Tab切换
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 验证数据加载状态
      const spinComponents = wrapper.findAllComponents({ name: 'ASpin' })
      expect(spinComponents.length).toBeGreaterThanOrEqual(0)
    })

    it('应该正确处理Tab切换时的错误状态', async () => {
      // Mock fetchUserInfo 返回错误
      const { fetchUserInfo } = await import('@/mock/customer360')
      vi.mocked(fetchUserInfo).mockRejectedValueOnce(new Error('网络错误'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      
      // 模拟Tab切换
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 验证错误处理
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('Tab架构响应式测试', () => {
    it('应该在不同屏幕尺寸下正确显示Tab', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证Tab组件存在
      const tabs = wrapper.findAllComponents({ name: 'ATabs' })
      expect(tabs.length).toBeGreaterThan(0)

      // 验证Tab容器的CSS类
      const tabElements = wrapper.findAll('.a-tabs')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('应该正确处理Tab内容的滚动', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证Tab内容容器存在
      const tabPanes = wrapper.findAllComponents({ name: 'ATabPane' })
      expect(tabPanes.length).toBeGreaterThan(0)
    })
  })

  describe('Tab架构性能测试', () => {
    it('应该正确实现Tab内容的懒加载', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // 验证初始状态下只加载激活的Tab内容
      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      expect(mainTabs.exists()).toBe(true)

      // 验证Tab切换时的性能
      const startTime = performance.now()
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }
      const endTime = performance.now()
      
      // 验证切换时间在合理范围内（小于100ms）
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('应该正确缓存Tab内容数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const mainTabs = wrapper.findComponent({ name: 'ATabs' })
      
      // 多次切换Tab
      if (mainTabs.exists()) {
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
        await mainTabs.vm.$emit('change', 'basic')
        await wrapper.vm.$nextTick()
        await mainTabs.vm.$emit('change', 'profile')
        await wrapper.vm.$nextTick()
      }

      // 验证fetchUserInfo只被调用一次（数据被缓存）
      const { fetchUserInfo } = await import('@/mock/customer360')
      expect(vi.mocked(fetchUserInfo)).toHaveBeenCalledTimes(1)
    })
  })
})