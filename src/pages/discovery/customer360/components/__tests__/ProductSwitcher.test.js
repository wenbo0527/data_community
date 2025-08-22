import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ProductSwitcher from '../ProductSwitcher.vue'
import { useRouter } from 'vue-router'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    currentRoute: {
      value: {
        params: { userId: '887123' },
        query: { productType: 'self' }
      }
    }
  }))
}))

describe('ProductSwitcher', () => {
  let wrapper
  let mockRouter

  beforeEach(() => {
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      currentRoute: {
        value: {
          params: { userId: '887123' },
          query: { productType: 'self' }
        }
      }
    }
    useRouter.mockReturnValue(mockRouter)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染产品切换器', () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false
        }
      })

      expect(wrapper.find('.product-switcher').exists()).toBe(true)
      expect(wrapper.find('[data-testid="self-tab"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="loan-tab"]').exists()).toBe(true)
    })

    it('应该显示正确的tab标签文本', () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false
        }
      })

      expect(wrapper.find('[data-testid="self-tab"]').text()).toContain('自营产品')
      expect(wrapper.find('[data-testid="loan-tab"]').text()).toContain('助贷产品')
    })

    it('应该正确显示当前选中的tab', () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false
        }
      })

      expect(wrapper.find('[data-testid="self-tab"]').classes()).toContain('active')
      expect(wrapper.find('[data-testid="loan-tab"]').classes()).not.toContain('active')
    })
  })

  describe('交互行为', () => {
    it('点击tab应该触发change事件', async () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false
        }
      })

      await wrapper.find('[data-testid="loan-tab"]').trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['loan'])
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')[0]).toEqual(['loan'])
    })

    it('点击当前选中的tab不应该触发change事件', async () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false
        }
      })

      await wrapper.find('[data-testid="self-tab"]').trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
      expect(wrapper.emitted('change')).toBeFalsy()
    })

    it('loading状态下应该禁用tab切换', async () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: true
        }
      })

      expect(wrapper.find('.product-switcher').classes()).toContain('loading')
      
      await wrapper.find('[data-testid="loan-tab"]').trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
      expect(wrapper.emitted('change')).toBeFalsy()
    })
  })

  describe('URL同步', () => {
    it('应该根据URL参数设置初始选中状态', () => {
      mockRouter.currentRoute.value.query.productType = 'loan'
      
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'loan',
          loading: false,
          syncUrl: true
        }
      })

      expect(wrapper.find('[data-testid="loan-tab"]').classes()).toContain('active')
    })

    it('切换tab时应该更新URL参数', async () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false,
          syncUrl: true
        }
      })

      await wrapper.find('[data-testid="loan-tab"]').trigger('click')
      
      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: { ...mockRouter.currentRoute.value.query, productType: 'loan' }
      })
    })
  })

  describe('动画效果', () => {
    it('应该包含切换动画类', () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false,
          animated: true
        }
      })

      expect(wrapper.find('.product-switcher').classes()).toContain('animated')
    })

    it('切换时应该触发相应事件', async () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false,
          animated: true
        }
      })

      await wrapper.find('[data-testid="loan-tab"]').trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('change')).toBeTruthy()
    })
  })

  describe('响应式设计', () => {
    it('移动端应该显示下拉选择器', () => {
      // 模拟移动端环境
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false,
          responsive: true
        }
      })

      expect(wrapper.find('.mobile-selector').exists()).toBe(true)
      expect(wrapper.find('.desktop-tabs').exists()).toBe(false)
    })

    it('桌面端应该显示tab标签', () => {
      // 模拟桌面端环境
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      })

      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false,
          responsive: true
        }
      })

      expect(wrapper.find('.desktop-tabs').exists()).toBe(true)
      expect(wrapper.find('.mobile-selector').exists()).toBe(false)
    })
  })

  describe('可访问性', () => {
    it('应该包含正确的ARIA属性', () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false
        }
      })

      expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
      expect(wrapper.find('[role="tab"][aria-selected="true"]').exists()).toBe(true)
      expect(wrapper.find('[role="tab"][aria-selected="false"]').exists()).toBe(true)
    })

    it('应该支持键盘导航', async () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false
        }
      })

      const selfTab = wrapper.find('[data-testid="self-tab"]')
      expect(selfTab.exists()).toBe(true)
      expect(selfTab.attributes('tabindex')).toBe('0')
    })
  })

  describe('数据统计', () => {
    it('应该显示产品数量统计', () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false,
          productCounts: {
            self: 3,
            loan: 2
          },
          showCounts: true
        }
      })

      expect(wrapper.find('[data-testid="self-count"]').text()).toBe('3')
      expect(wrapper.find('[data-testid="loan-count"]').text()).toBe('2')
    })

    it('产品数量为0时应该显示特殊样式', () => {
      wrapper = mount(ProductSwitcher, {
        props: {
          modelValue: 'self',
          loading: false,
          productCounts: {
            self: 0,
            loan: 2
          },
          showCounts: true
        }
      })

      expect(wrapper.find('[data-testid="self-tab"]').classes()).toContain('empty')
      expect(wrapper.find('[data-testid="loan-tab"]').classes()).not.toContain('empty')
    })
  })
})