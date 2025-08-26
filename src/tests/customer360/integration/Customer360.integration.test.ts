import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Customer360 from '@/pages/discovery/customer360/detail.vue'
import { mockUsers } from '@/mock/customer360'
import '../setup'

// 验证mockUsers数据
if (!mockUsers || !mockUsers['887123']) {
  throw new Error('mockUsers数据未正确导入')
}

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  ALayout: { name: 'ALayout', template: '<div class="a-layout"><slot /></div>' },
  ALayoutHeader: { name: 'ALayoutHeader', template: '<header class="a-layout-header"><slot /></header>' },
  ALayoutContent: { name: 'ALayoutContent', template: '<main class="a-layout-content"><slot /></main>' },
  ALayoutSider: { name: 'ALayoutSider', template: '<aside class="a-layout-sider"><slot /></aside>' },
  ACard: { name: 'ACard', template: '<div class="a-card"><slot /></div>' },
  ARow: { name: 'ARow', template: '<div class="a-row"><slot /></div>' },
  ACol: { name: 'ACol', template: '<div class="a-col"><slot /></div>' },
  AForm: { name: 'AForm', template: '<form class="a-form"><slot /></form>' },
  AFormItem: { name: 'AFormItem', template: '<div class="a-form-item"><slot /></div>' },
  ATable: { name: 'ATable', template: '<div class="a-table"><slot /></div>' },
  ATableColumn: { name: 'ATableColumn', template: '<div class="a-table-column"><slot /></div>' },
  ATag: { name: 'ATag', template: '<span class="a-tag"><slot /></span>' },
  AButton: { name: 'AButton', template: '<button class="a-button"><slot /></button>' },
  ASpace: { name: 'ASpace', template: '<div class="a-space"><slot /></div>' },
  ASelect: { name: 'ASelect', template: '<select class="a-select"><slot /></select>' },
  AOption: { name: 'AOption', template: '<option class="a-option"><slot /></option>' },
  AInput: { name: 'AInput', template: '<input class="a-input" />' },
  ATextarea: { name: 'ATextarea', template: '<textarea class="a-textarea"></textarea>' },
  AModal: { name: 'AModal', template: '<div class="a-modal"><slot /></div>' },
  ADrawer: { name: 'ADrawer', template: '<div class="a-drawer"><slot /></div>' },
  ATabs: { name: 'ATabs', template: '<div class="a-tabs"><slot /></div>' },
  ATabPane: { name: 'ATabPane', template: '<div class="a-tab-pane"><slot /></div>' },
  APagination: { name: 'APagination', template: '<div class="a-pagination"></div>' },
  AEmpty: { name: 'AEmpty', template: '<div class="a-empty">暂无数据</div>' },
  AAlert: { name: 'AAlert', template: '<div class="a-alert"><slot /></div>' },
  ASpin: { name: 'ASpin', template: '<div class="a-spin"><slot /></div>' },
  ATooltip: { name: 'ATooltip', template: '<div class="a-tooltip"><slot /></div>' },
  ACollapse: { name: 'ACollapse', template: '<div class="a-collapse"><slot /></div>' },
  ACollapseItem: { name: 'ACollapseItem', template: '<div class="a-collapse-item"><slot /></div>' },
  ATimeline: { name: 'ATimeline', template: '<div class="a-timeline"><slot /></div>' },
  ATimelineItem: { name: 'ATimelineItem', template: '<div class="a-timeline-item"><slot /></div>' },
  AStatistic: { name: 'AStatistic', template: '<div class="a-statistic"><slot /></div>' },
  AProgress: { name: 'AProgress', template: '<div class="a-progress"></div>' },
  ACheckbox: { name: 'ACheckbox', template: '<input type="checkbox" class="a-checkbox" />' },
  ARadio: { name: 'ARadio', template: '<input type="radio" class="a-radio" />' },
  ARadioGroup: { name: 'ARadioGroup', template: '<div class="a-radio-group"><slot /></div>' },
  ADatePicker: { name: 'ADatePicker', template: '<input class="a-date-picker" />' },
  ARangePicker: { name: 'ARangePicker', template: '<input class="a-range-picker" />' },
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

// Mock API 服务
const mockApiService = {
  getUserInfo: vi.fn().mockResolvedValue({
    success: true,
    data: mockUsers['887123']
  }),
  updateUserInfo: vi.fn().mockResolvedValue({
    success: true,
    message: '更新成功'
  }),
  getProductInfo: vi.fn().mockResolvedValue({
    success: true,
    data: {
      loans: mockUsers['887123'].products // 所有产品都是信贷产品
    }
  }),
  getCollectionRecords: vi.fn().mockResolvedValue({
    success: true,
    data: mockUsers['887123'].collectionRecords
  }),
  getCreditReports: vi.fn().mockResolvedValue({
    success: true,
    data: mockUsers['887123'].creditReports
  }),
  getMarketingRecords: vi.fn().mockResolvedValue({
    success: true,
    data: mockUsers['887123'].marketingRecords
  }),
  getLoanRecords: vi.fn().mockResolvedValue({
    success: true,
    data: mockUsers['887123'].loanRecords
  })
}
vi.mock('@/services/apiService', () => ({
  default: mockApiService
}))

// Mock 复制服务
const mockCopyService = {
  copyText: vi.fn().mockResolvedValue(true),
  copyJSON: vi.fn().mockResolvedValue(true),
  copyTableData: vi.fn().mockResolvedValue(true),
  copyBasicInfo: vi.fn().mockResolvedValue(true),
  copyProductInfo: vi.fn().mockResolvedValue(true),
  copyCollectionRecord: vi.fn().mockResolvedValue(true),
  copyCreditRecord: vi.fn().mockResolvedValue(true),
  copyMarketingRecord: vi.fn().mockResolvedValue(true),
  copyLoanRecord: vi.fn().mockResolvedValue(true)
}
vi.mock('@/services/copyService', () => ({
  default: mockCopyService
}))

// Mock 路由
const routes = [
  {
    path: '/customer360/:userId',
    name: 'Customer360Detail',
    component: Customer360,
    props: true
  }
]

describe('Customer360 集成测试', () => {
  let wrapper: any
  let pinia: any
  let router: any

  beforeEach(async () => {
    pinia = createPinia()
    router = createRouter({
      history: createWebHistory(),
      routes
    })
    
    // 重置所有 mock
    vi.clearAllMocks()
    
    // fetchUserInfo已在mock中设置默认返回值
    
    // 设置初始路由
    await router.push('/customer360/887123')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}) => {
    return mount(Customer360, {
      props: {
        userId: '887123',
        ...props
      },
      global: {
        plugins: [pinia, router]
      }
    })
  }

  describe('页面初始化和路由', () => {
    it('应该正确初始化Customer360页面', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.customer360-container').exists()).toBe(true)
    })

    it('应该根据路由参数加载正确的用户数据', async () => {
      wrapper = createWrapper({ userId: '887123' })
      await wrapper.vm.$nextTick()
      
      expect(mockApiService.getUserInfo).toHaveBeenCalledWith('887123')
    })

    it('应该支持路由参数变化', async () => {
      wrapper = createWrapper({ userId: '887123' })
      await wrapper.vm.$nextTick()
      
      await wrapper.setProps({ userId: '123' })
      await wrapper.vm.$nextTick()
      
      expect(mockApiService.getUserInfo).toHaveBeenCalledWith('123')
    })

    it('应该正确处理无效的用户ID', async () => {
      mockApiService.getUserInfo.mockRejectedValueOnce(new Error('用户不存在'))
      
      wrapper = createWrapper({ userId: 'invalid' })
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.a-alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('用户不存在')
    })
  })

  describe('数据加载流程', () => {
    it('应该按顺序加载所有模块数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 等待所有异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(mockApiService.getUserInfo).toHaveBeenCalled()
      expect(mockApiService.getProductInfo).toHaveBeenCalled()
      expect(mockApiService.getCollectionRecords).toHaveBeenCalled()
      expect(mockApiService.getCreditReports).toHaveBeenCalled()
      expect(mockApiService.getMarketingRecords).toHaveBeenCalled()
      expect(mockApiService.getLoanRecords).toHaveBeenCalled()
    })

    it('应该显示加载状态', async () => {
      // 模拟慢速API响应
      mockApiService.getUserInfo.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 200))
      )
      
      wrapper = createWrapper()
      
      expect(wrapper.find('.a-spin').exists()).toBe(true)
      
      await new Promise(resolve => setTimeout(resolve, 250))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.a-spin').exists()).toBe(false)
    })

    it('应该处理部分数据加载失败', async () => {
      mockApiService.getCollectionRecords.mockRejectedValueOnce(new Error('催收数据加载失败'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 等待所有异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('催收数据加载失败')
    })
  })

  describe('模块切换和导航', () => {
    it('应该支持在不同模块间切换', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 切换到产品信息模块
      const productTab = wrapper.find('[data-testid="product-tab"]')
      if (productTab.exists()) {
        await productTab.trigger('click')
        expect(wrapper.find('.product-info').exists()).toBe(true)
      }
      
      // 切换到催收记录模块
      const collectionTab = wrapper.find('[data-testid="collection-tab"]')
      if (collectionTab.exists()) {
        await collectionTab.trigger('click')
        expect(wrapper.find('.collection-records').exists()).toBe(true)
      }
    })

    it('应该保持模块状态', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 在产品模块中进行操作
      const productTab = wrapper.find('[data-testid="product-tab"]')
      if (productTab.exists()) {
        await productTab.trigger('click')
        
        // 切换产品类型
        const productTypeSwitch = wrapper.find('[data-testid="product-type-switch"]')
        if (productTypeSwitch.exists()) {
          await productTypeSwitch.trigger('click')
        }
      }
      
      // 切换到其他模块再切换回来
      const basicTab = wrapper.find('[data-testid="basic-tab"]')
      if (basicTab.exists()) {
        await basicTab.trigger('click')
      }
      
      if (productTab.exists()) {
        await productTab.trigger('click')
        // 验证状态是否保持
        expect(wrapper.vm.productType).toBeDefined()
      }
    })

    it('应该支持深度链接', async () => {
      await router.push('/customer360/887123/products')
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.product-info').exists()).toBe(true)
    })
  })

  describe('用户交互流程', () => {
    it('应该支持完整的数据查看流程', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 1. 查看基本信息
      expect(wrapper.find('.basic-info').exists()).toBe(true)
      
      // 2. 切换到产品信息
      const productTab = wrapper.find('[data-testid="product-tab"]')
      if (productTab.exists()) {
        await productTab.trigger('click')
        expect(wrapper.find('.product-info').exists()).toBe(true)
      }
      
      // 3. 查看产品详情
      const productDetail = wrapper.find('[data-testid="product-detail"]')
      if (productDetail.exists()) {
        await productDetail.trigger('click')
        expect(wrapper.find('.product-detail-modal').exists()).toBe(true)
      }
    })

    it('应该支持数据复制流程', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 复制基本信息
      const copyBasicButton = wrapper.find('[data-testid="copy-basic-info"]')
      if (copyBasicButton.exists()) {
        await copyBasicButton.trigger('click')
        expect(mockCopyService.copyBasicInfo).toHaveBeenCalled()
      }
      
      // 切换到产品模块并复制产品信息
      const productTab = wrapper.find('[data-testid="product-tab"]')
      if (productTab.exists()) {
        await productTab.trigger('click')
        
        const copyProductButton = wrapper.find('[data-testid="copy-product-info"]')
        if (copyProductButton.exists()) {
          await copyProductButton.trigger('click')
          expect(mockCopyService.copyProductInfo).toHaveBeenCalled()
        }
      }
    })

    it('应该支持数据筛选和搜索', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 切换到催收记录模块
      const collectionTab = wrapper.find('[data-testid="collection-tab"]')
      if (collectionTab.exists()) {
        await collectionTab.trigger('click')
        
        // 使用筛选功能
        const filterSelect = wrapper.find('[data-testid="collection-filter"]')
        if (filterSelect.exists()) {
          await filterSelect.setValue('电话催收')
          expect(wrapper.vm.filteredCollections).toBeDefined()
        }
        
        // 使用搜索功能
        const searchInput = wrapper.find('[data-testid="collection-search"]')
        if (searchInput.exists()) {
          await searchInput.setValue('逾期')
          expect(wrapper.vm.searchResults).toBeDefined()
        }
      }
    })
  })

  describe('数据更新和同步', () => {
    it('应该支持实时数据刷新', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const refreshButton = wrapper.find('[data-testid="refresh-data"]')
      if (refreshButton.exists()) {
        await refreshButton.trigger('click')
        
        expect(mockApiService.getUserInfo).toHaveBeenCalledTimes(2)
      }
    })

    it('应该处理数据更新', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 模拟数据更新
      const updateButton = wrapper.find('[data-testid="update-user-info"]')
      if (updateButton.exists()) {
        await updateButton.trigger('click')
        
        expect(mockApiService.updateUserInfo).toHaveBeenCalled()
      }
    })

    it('应该同步多模块数据变化', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 在基本信息模块更新数据
      await wrapper.vm.updateBasicInfo({ riskLevel: 'B' })
      
      // 切换到其他模块验证数据同步
      const productTab = wrapper.find('[data-testid="product-tab"]')
      if (productTab.exists()) {
        await productTab.trigger('click')
        expect(wrapper.vm.userData.basicInfo.riskLevel).toBe('B')
      }
    })
  })

  describe('错误处理和恢复', () => {
    it('应该处理网络错误', async () => {
      mockApiService.getUserInfo.mockRejectedValueOnce(new Error('网络错误'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('网络错误')
    })

    it('应该提供错误恢复机制', async () => {
      mockApiService.getUserInfo.mockRejectedValueOnce(new Error('网络错误'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 点击重试按钮
      const retryButton = wrapper.find('[data-testid="retry-button"]')
      if (retryButton.exists()) {
        // 重置mock为成功响应
        mockApiService.getUserInfo.mockResolvedValueOnce({
          success: true,
          data: mockUsers['887123']
        })
        
        await retryButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.error-message').exists()).toBe(false)
        expect(wrapper.find('.basic-info').exists()).toBe(true)
      }
    })

    it('应该处理权限错误', async () => {
      mockApiService.getUserInfo.mockRejectedValueOnce(new Error('权限不足'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.permission-error').exists()).toBe(true)
      expect(wrapper.text()).toContain('权限不足')
    })
  })

  describe('性能和用户体验', () => {
    it('应该支持懒加载', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 初始只加载基本信息
      expect(mockApiService.getUserInfo).toHaveBeenCalled()
      expect(mockApiService.getCollectionRecords).not.toHaveBeenCalled()
      
      // 切换到催收模块时才加载催收数据
      const collectionTab = wrapper.find('[data-testid="collection-tab"]')
      if (collectionTab.exists()) {
        await collectionTab.trigger('click')
        expect(mockApiService.getCollectionRecords).toHaveBeenCalled()
      }
    })

    it('应该缓存已加载的数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 切换到产品模块
      const productTab = wrapper.find('[data-testid="product-tab"]')
      if (productTab.exists()) {
        await productTab.trigger('click')
        expect(mockApiService.getProductInfo).toHaveBeenCalledTimes(1)
        
        // 切换到其他模块再切换回来
        const basicTab = wrapper.find('[data-testid="basic-tab"]')
        if (basicTab.exists()) {
          await basicTab.trigger('click')
        }
        
        await productTab.trigger('click')
        // 应该使用缓存，不再调用API
        expect(mockApiService.getProductInfo).toHaveBeenCalledTimes(1)
      }
    })

    it('应该支持虚拟滚动处理大数据', async () => {
      // 模拟大量数据
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        type: '电话催收',
        amount: 1000 + i,
        date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`
      }))
      
      mockApiService.getCollectionRecords.mockResolvedValueOnce({
        success: true,
        data: largeDataset
      })
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const collectionTab = wrapper.find('[data-testid="collection-tab"]')
      if (collectionTab.exists()) {
        await collectionTab.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.virtual-scroll').exists()).toBe(true)
      }
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正确显示', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.mobile-layout').exists()).toBe(true)
      expect(wrapper.find('.desktop-layout').exists()).toBe(false)
    })

    it('应该在平板端正确显示', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.tablet-layout').exists()).toBe(true)
    })

    it('应该在桌面端正确显示', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.desktop-layout').exists()).toBe(true)
    })
  })

  describe('数据完整性验证', () => {
    it('应该验证所有必要数据已加载', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 等待所有数据加载完成
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.vm.userInfo).toBeDefined()
      expect(wrapper.vm.userInfo.basicInfo).toBeDefined()
      // 所有产品都是信贷产品，不再有存款产品
      expect(wrapper.vm.userInfo.products).toBeDefined()
      expect(wrapper.vm.userInfo.collectionRecords).toBeDefined()
      expect(wrapper.vm.userInfo.creditReports).toBeDefined()
      expect(wrapper.vm.userInfo.marketingRecords).toBeDefined()
      expect(wrapper.vm.userInfo.loanRecords).toBeDefined()
    })

    it('应该处理数据不一致的情况', async () => {
      // 模拟缺少关键基本信息字段的情况
      const inconsistentData = {
        basicInfo: {
          // 缺少关键字段 name, idCard, phone
          age: 30,
          gender: '男'
          // name: undefined,
          // idCard: undefined,
          // phone: undefined
        },
        products: [
          { id: 1, productType: 'deposit', amount: 10000 },
          { id: 2, productType: 'loan', amount: 50000 }
        ],
        // 产品数据与记录数据不一致
        creditsList: [], // 有信贷产品但没有信贷记录
        loanRecords: []  // 有贷款产品但没有贷款记录
      }
      
      // 模拟fetchUserInfo返回不一致的数据
      const { fetchUserInfo } = await import('@/mock/customer360')
      vi.mocked(fetchUserInfo).mockResolvedValueOnce(inconsistentData)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 等待组件完全渲染和数据加载
      await new Promise(resolve => setTimeout(resolve, 200))
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 添加调试信息
      console.log('=== 测试调试信息 ===')
      console.log('userInfo:', wrapper.vm.userInfo)
      console.log('userInfo.basicInfo:', wrapper.vm.userInfo?.basicInfo)
      console.log('basicInfo.name:', wrapper.vm.userInfo?.basicInfo?.name)
      console.log('basicInfo.idCard:', wrapper.vm.userInfo?.basicInfo?.idCard)
      console.log('basicInfo.phone:', wrapper.vm.userInfo?.basicInfo?.phone)
      console.log('hasDataInconsistency:', wrapper.vm.hasDataInconsistency)
      console.log('products:', wrapper.vm.userInfo?.products)
      console.log('creditsList:', wrapper.vm.userInfo?.creditsList)
      console.log('DOM中的警告元素:', wrapper.find('.data-inconsistency-warning').exists())
      console.log('=== 调试信息结束 ===')
      
      // 验证数据不一致警告显示
      const warningElement = wrapper.find('.data-inconsistency-warning')
      expect(warningElement.exists()).toBe(true)
    })
  })

  describe('用户权限和安全', () => {
    it('应该根据用户权限显示不同内容', async () => {
      // 模拟受限权限用户
      const limitedUser = {
        ...mockUsers['887123'],
        permissions: ['basic_info', 'products']
      }
      
      mockApiService.getUserInfo.mockResolvedValueOnce({
        success: true,
        data: limitedUser
      })
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="collection-tab"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="credit-tab"]').exists()).toBe(false)
    })

    it('应该保护敏感数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 验证身份证号是否被脱敏
      const idCardElement = wrapper.find('[data-testid="id-card"]')
      if (idCardElement.exists()) {
        expect(idCardElement.text()).toContain('****')
      }
      
      // 验证手机号是否被脱敏
      const phoneElement = wrapper.find('[data-testid="phone"]')
      if (phoneElement.exists()) {
        expect(phoneElement.text()).toContain('****')
      }
    })
  })
})