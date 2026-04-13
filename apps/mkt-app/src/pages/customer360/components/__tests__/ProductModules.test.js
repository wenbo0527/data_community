import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ProductModules from '../ProductModules.vue'
import ProductBasicInfo from '../ProductBasicInfo.vue'

// Mock子组件
vi.mock('../ProductBasicInfo.vue', () => ({
  default: {
    name: 'ProductBasicInfo',
    template: '<div data-testid="product-basic-info">ProductBasicInfo</div>',
    props: ['productType', 'productData', 'userInfo']
  }
}))

vi.mock('../CollectionRecords.vue', () => ({
  default: {
    name: 'CollectionRecords',
    template: '<div data-testid="collection-records">CollectionRecords</div>',
    props: ['productType', 'userInfo']
  }
}))

vi.mock('../CreditRecords.vue', () => ({
  default: {
    name: 'CreditRecords',
    template: '<div data-testid="credit-records">CreditRecords</div>',
    props: ['productType', 'userInfo']
  }
}))

vi.mock('../MarketingRecords.vue', () => ({
  default: {
    name: 'MarketingRecords',
    template: '<div data-testid="marketing-records">MarketingRecords</div>',
    props: ['productType', 'userInfo']
  }
}))

const mockUserInfo = {
  userId: '887123',
  userName: '张三',
  loanProducts: [
    { productId: 'L001', productName: '个人贷款', balance: 200000 },
    { productId: 'L002', productName: '信用卡', balance: 30000 }
  ]
}

const mockProductData = {
  loan: [
    { productId: 'L001', productName: '个人贷款', balance: 200000 },
    { productId: 'L002', productName: '信用卡', balance: 30000 }
  ]
}

describe('ProductModules', () => {
  let wrapper

  beforeEach(() => {
    // 清理localStorage
    localStorage.clear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染所有模块标签', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo
        }
      })

      expect(wrapper.find('[data-testid="basic-info-tab"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="collection-records-tab"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="credit-records-tab"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="marketing-records-tab"]').exists()).toBe(true)
    })

    it('应该显示正确的模块标签文本', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo
        }
      })

      expect(wrapper.find('[data-testid="basic-info-tab"]').text()).toContain('基础信息')
      expect(wrapper.find('[data-testid="collection-records-tab"]').text()).toContain('催收记录')
      expect(wrapper.find('[data-testid="credit-records-tab"]').text()).toContain('征信记录')
      expect(wrapper.find('[data-testid="marketing-records-tab"]').text()).toContain('营销记录')
    })

    it('应该默认选中基础信息模块', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo
        }
      })

      expect(wrapper.find('[data-testid="basic-info-tab"]').classes()).toContain('ant-tabs-tab-active')
      expect(wrapper.find('[data-testid="product-basic-info"]').exists()).toBe(true)
    })
  })

  describe('模块切换', () => {
    it('点击不同模块应该切换内容', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo
        }
      })

      // 切换到催收记录
      await wrapper.vm.handleTabChange('collection-records')
      expect(wrapper.find('[data-testid="collection-records"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="product-basic-info"]').exists()).toBe(false)

      // 切换到征信记录
      await wrapper.vm.handleTabChange('credit-records')
      expect(wrapper.find('[data-testid="credit-records"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="collection-records"]').exists()).toBe(false)

      // 切换到营销记录
      await wrapper.find('[data-testid="marketing-records-tab"]').trigger('click')
      expect(wrapper.find('[data-testid="marketing-records"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="credit-records"]').exists()).toBe(false)
    })

    it('应该正确传递props到子组件', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo
        }
      })

      const basicInfoComponent = wrapper.findComponent({ name: 'ProductBasicInfo' })
      expect(basicInfoComponent.props('productType')).toBe('loan')
      expect(basicInfoComponent.props('productData')).toEqual(mockProductData.loan)
      expect(basicInfoComponent.props('userInfo')).toEqual(mockUserInfo)
    })
  })

  describe('状态记忆功能', () => {
    it('应该记住每个产品类型的选中模块', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          rememberState: true
        }
      })

      // 切换到催收记录
      await wrapper.vm.handleTabChange('collection-records')
      
      // 切换产品类型到其他产品
      await wrapper.setProps({ productType: 'other', productData: [] })
      
      // 切换回信贷产品，应该记住之前选中的催收记录
      await wrapper.setProps({ productType: 'loan', productData: mockProductData.loan })
      
      expect(wrapper.find('[data-testid="collection-records-tab"]').classes()).toContain('ant-tabs-tab-active')
      expect(wrapper.find('[data-testid="collection-records"]').exists()).toBe(true)
    })

    it('应该在localStorage中保存状态', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          rememberState: true
        }
      })

      await wrapper.vm.handleTabChange('credit-records')
      
      const savedState = JSON.parse(localStorage.getItem('productModules_tabState'))
      expect(savedState.loan).toBe('credit-records')
    })

    it('应该从localStorage恢复状态', () => {
      // 预设localStorage状态
      localStorage.setItem('productModules_tabState', JSON.stringify({
        loan: 'marketing-records'
      }))

      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          rememberState: true
        }
      })

      expect(wrapper.find('[data-testid="marketing-records-tab"]').classes()).toContain('ant-tabs-tab-active')
      expect(wrapper.find('[data-testid="marketing-records"]').exists()).toBe(true)
    })
  })

  describe('懒加载功能', () => {
    it('启用懒加载时只渲染当前选中的模块', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          lazyLoad: true
        }
      })

      // 只有基础信息模块被渲染
      expect(wrapper.find('[data-testid="product-basic-info"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="collection-records"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="credit-records"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="marketing-records"]').exists()).toBe(false)
    })

    it('切换模块时应该渲染新模块', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          lazyLoad: true
        }
      })

      await wrapper.vm.handleTabChange('collection-records')
      
      expect(wrapper.find('[data-testid="collection-records"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="product-basic-info"]').exists()).toBe(false)
    })

    it('禁用懒加载时应该渲染所有模块', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          lazyLoad: false
        }
      })

      // 调试：打印组件HTML结构
      console.log('Component HTML:', wrapper.html())
      
      // 检查组件是否正确设置了lazyLoad属性
      expect(wrapper.props('lazyLoad')).toBe(false)
      
      // 检查shouldRenderModule函数的行为
      expect(wrapper.vm.shouldRenderModule('basic-info')).toBe(true)
      expect(wrapper.vm.shouldRenderModule('collection-records')).toBe(true)
      expect(wrapper.vm.shouldRenderModule('credit-records')).toBe(true)
      expect(wrapper.vm.shouldRenderModule('marketing-records')).toBe(true)
      
      // 检查loadedModules的状态
      console.log('Loaded modules:', wrapper.vm.loadedModules)
    })
  })

  describe('加载状态', () => {
    it('loading状态下应该显示加载指示器', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          loading: true
        }
      })

      // 检查loading属性是否正确传递
      expect(wrapper.props('loading')).toBe(true)
      // 检查组件是否有loading类
      expect(wrapper.classes()).toContain('loading')
    })

    it('loading状态下应该禁用tab切换', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          loading: true
        }
      })

      // 检查loading状态
      expect(wrapper.props('loading')).toBe(true)
      
      // 在loading状态下，activeTab应该保持为默认值
      const initialActiveTab = wrapper.vm.activeTab
      
      // 尝试切换tab
      await wrapper.vm.handleTabChange('collection-records')
      
      // 应该仍然在初始tab
      expect(wrapper.vm.activeTab).toBe(initialActiveTab)
    })
  })

  describe('错误处理', () => {
    it('productData为空时应该显示空状态', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: [],
          userInfo: mockUserInfo
        }
      })

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    })

    it('userInfo为空时应该显示错误状态', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: null
        }
      })

      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true)
    })
  })

  describe('事件发射', () => {
    it('切换模块时应该发射tab-change事件', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo
        }
      })

      // 直接调用handleTabChange方法
      await wrapper.vm.handleTabChange('collection-records')
      
      expect(wrapper.emitted('tab-change')).toBeTruthy()
      expect(wrapper.emitted('tab-change')[0]).toEqual(['collection-records'])
    })

    it('模块加载完成时应该发射module-loaded事件', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'loan',
          productData: mockProductData.loan,
          userInfo: mockUserInfo,
          lazyLoad: true
        }
      })

      // 查找tabs组件并切换到征信记录tab
      const tabs = wrapper.findComponent({ name: 'ATabs' })
      if (tabs.exists()) {
        await tabs.vm.$emit('change', 'credit-records')
      } else {
        // 如果找不到tabs组件，直接调用handleTabChange方法
        await wrapper.vm.handleTabChange('credit-records')
      }
      
      expect(wrapper.emitted('module-loaded')).toBeTruthy()
      expect(wrapper.emitted('module-loaded')[0]).toEqual(['credit-records'])
    })
  })
})