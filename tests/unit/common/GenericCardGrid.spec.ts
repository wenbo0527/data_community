import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GenericCardGrid from '@/components/common/GenericCardGrid.vue'

describe('GenericCardGrid.vue', () => {
  const mockItems = [
    { id: 1, name: '测试卡片1', description: '这是测试卡片1的描述' },
    { id: 2, name: '测试卡片2', description: '这是测试卡片2的描述' },
    { id: 3, name: '测试卡片3', description: '这是测试卡片3的描述' }
  ]

  describe('P0 - 阻塞性测试', () => {
    it('TC-CG-001: 基础渲染 - 传入 items 数组', () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems
        }
      })
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAll('.generic-card').length).toBe(3)
    })

    it('TC-CG-002: 加载状态 - 设置 loading=true', () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems,
          loading: true
        }
      })
      
      expect(wrapper.classes()).toContain('is-loading')
      expect(wrapper.find('.a-skeleton').exists()).toBe(true)
    })

    it('TC-CG-003: 空状态 - 传入空数组', () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: []
        }
      })
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.a-empty').exists()).toBe(true)
    })

    it('TC-CG-004: 响应式布局 - xs/sm/md/lg/xl', () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems,
          gridCols: {
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            xl: 4
          }
        }
      })
      
      expect(wrapper.find('.a-row').exists()).toBe(true)
    })

    it('TC-CG-005: 悬停效果 - 鼠标悬停卡片', async () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems,
          hoverable: true
        }
      })
      
      const card = wrapper.find('.generic-card')
      expect(card.exists()).toBe(true)
    })

    it('TC-CG-006: 点击事件 - 点击卡片', async () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems,
          clickable: true
        }
      })
      
      const card = wrapper.find('.generic-card')
      await card.trigger('click')
      
      expect(wrapper.emitted('card-click')).toBeTruthy()
      expect(wrapper.emitted('card-click')?.[0]?.[0]).toEqual(mockItems[0])
    })
  })

  describe('P1 - 重要测试', () => {
    it('TC-CG-007: 外层卡片 - 设置 showOuterCard=true', () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems,
          showOuterCard: true,
          outerCardTitle: '外层卡片标题'
        }
      })
      
      expect(wrapper.find('.generic-card-grid-outer').exists()).toBe(true)
      expect(wrapper.text()).toContain('外层卡片标题')
    })

    it('TC-CG-008: 分页功能 - 设置 showPagination=true', () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems,
          showPagination: true,
          total: 100,
          pageSize: 12,
          currentPage: 1
        }
      })
      
      expect(wrapper.find('.pagination-wrapper').exists()).toBe(true)
      expect(wrapper.find('.a-pagination').exists()).toBe(true)
    })

    it('TC-CG-009: 统一样式 - 圆角/边框/阴影', () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems
        }
      })
      
      const card = wrapper.find('.generic-card')
      expect(card.exists()).toBe(true)
    })
  })

  describe('P2 - 一般测试', () => {
    it('TC-CG-010: 插槽系统 - 所有插槽', () => {
      const wrapper = mount(GenericCardGrid, {
        props: {
          items: mockItems
        },
        slots: {
          'card-title': '<div class="custom-title">自定义标题</div>',
          'card-description': '<div class="custom-desc">自定义描述</div>',
          'card-stats': '<div class="custom-stats">自定义统计</div>',
          'card-actions': '<div class="custom-actions">自定义操作</div>'
        }
      })
      
      expect(wrapper.find('.custom-title').exists()).toBe(true)
    })
  })
})
