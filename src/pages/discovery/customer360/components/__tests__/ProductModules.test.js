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
  depositProducts: [
    { productId: 'D001', productName: '定期存款', balance: 100000 },
    { productId: 'D002', productName: '活期存款', balance: 50000 }
  ],
  loanProducts: [
    { productId: 'L001', productName: '个人贷款', balance: 200000 },
    { productId: 'L002', productName: '信用卡', balance: 30000 }
  ]
}

const mockProductData = {
  self: [
    { productId: 'D001', productName: '定期存款', balance: 100000 },
    { productId: 'D002', productName: '活期存款', balance: 50000 }
  ],
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
          productType: 'self',
          productData: mockProductData.self,
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
          productType: 'self',
          productData: mockProductData.self,
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
          productType: 'self',
          productData: mockProductData.self,
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
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo
        }
      })

      // 切换到催收记录
      await wrapper.find('[data-testid="collection-records-tab"]').trigger('click')
      expect(wrapper.find('[data-testid="collection-records"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="product-basic-info"]').exists()).toBe(false)

      // 切换到征信记录
      await wrapper.find('[data-testid="credit-records-tab"]').trigger('click')
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
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo,
          rememberState: true
        }
      })

      // 切换到催收记录
      await wrapper.find('[data-testid="collection-records-tab"]').trigger('click')
      
      // 切换产品类型到助贷产品
      await wrapper.setProps({ productType: 'loan', productData: mockProductData.loan })
      
      // 切换回自营产品，应该记住之前选中的催收记录
      await wrapper.setProps({ productType: 'self', productData: mockProductData.self })
      
      expect(wrapper.find('[data-testid="collection-records-tab"]').classes()).toContain('ant-tabs-tab-active')
      expect(wrapper.find('[data-testid="collection-records"]').exists()).toBe(true)
    })

    it('应该在localStorage中保存状态', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo,
          rememberState: true
        }
      })

      await wrapper.find('[data-testid="credit-records-tab"]').trigger('click')
      
      const savedState = JSON.parse(localStorage.getItem('productModules_tabState'))
      expect(savedState.self).toBe('credit-records')
    })

    it('应该从localStorage恢复状态', () => {
      // 预设localStorage状态
      localStorage.setItem('productModules_tabState', JSON.stringify({
        self: 'marketing-records',
        loan: 'basic-info'
      }))

      wrapper = mount(ProductModules, {
        props: {
          productType: 'self',
          productData: mockProductData.self,
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
          productType: 'self',
          productData: mockProductData.self,
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
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo,
          lazyLoad: true
        }
      })

      await wrapper.find('[data-testid="collection-records-tab"]').trigger('click')
      
      expect(wrapper.find('[data-testid="collection-records"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="product-basic-info"]').exists()).toBe(false)
    })

    it('禁用懒加载时应该渲染所有模块', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo,
          lazyLoad: false
        }
      })

      // 所有模块都被渲染，但只有当前选中的可见
      expect(wrapper.findAll('[data-testid="product-basic-info"]')).toHaveLength(1)
      expect(wrapper.findAll('[data-testid="collection-records"]')).toHaveLength(1)
      expect(wrapper.findAll('[data-testid="credit-records"]')).toHaveLength(1)
      expect(wrapper.findAll('[data-testid="marketing-records"]')).toHaveLength(1)
    })
  })

  describe('加载状态', () => {
    it('loading状态下应该显示加载指示器', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo,
          loading: true
        }
      })

      expect(wrapper.find('.ant-spin').exists()).toBe(true)
    })

    it('loading状态下应该禁用tab切换', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo,
          loading: true
        }
      })

      const collectionTab = wrapper.find('[data-testid="collection-records-tab"]')
      expect(collectionTab.classes()).toContain('ant-tabs-tab-disabled')
      
      await collectionTab.trigger('click')
      
      // 应该仍然在基础信息模块
      expect(wrapper.find('[data-testid="basic-info-tab"]').classes()).toContain('ant-tabs-tab-active')
    })
  })

  describe('错误处理', () => {
    it('productData为空时应该显示空状态', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'self',
          productData: [],
          userInfo: mockUserInfo
        }
      })

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    })

    it('userInfo为空时应该显示错误状态', () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'self',
          productData: mockProductData.self,
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
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo
        }
      })

      await wrapper.find('[data-testid="collection-records-tab"]').trigger('click')
      
      expect(wrapper.emitted('tab-change')).toBeTruthy()
      expect(wrapper.emitted('tab-change')[0]).toEqual(['collection-records'])
    })

    it('模块加载完成时应该发射module-loaded事件', async () => {
      wrapper = mount(ProductModules, {
        props: {
          productType: 'self',
          productData: mockProductData.self,
          userInfo: mockUserInfo,
          lazyLoad: true
        }
      })

      await wrapper.find('[data-testid="credit-records-tab"]').trigger('click')
      
      expect(wrapper.emitted('module-loaded')).toBeTruthy()
      expect(wrapper.emitted('module-loaded')[0]).toEqual(['credit-records'])
    })
  })
})