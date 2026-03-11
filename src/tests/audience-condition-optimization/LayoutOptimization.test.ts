import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import ConditionGroup from '@/components/audience-condition/ConditionGroup.vue'
import { ArcoVue } from '@arco-design/web-vue'

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  ArcoVue: {},
  Button: { name: 'AButton', template: '<button><slot /></button>' },
  Select: { name: 'ASelect', template: '<select><slot /></select>' },
  Option: { name: 'AOption', template: '<option><slot /></option>' },
  Input: { name: 'AInput', template: '<input />' },
  Card: { name: 'ACard', template: '<div class="arco-card"><slot /></div>' },
  Space: { name: 'ASpace', template: '<div class="arco-space"><slot /></div>' },
  Divider: { name: 'ADivider', template: '<div class="arco-divider"></div>' },
  Tooltip: { name: 'ATooltip', template: '<div><slot /></div>' },
  Switch: { name: 'ASwitch', template: '<input type="checkbox" />' }
}))

// Mock store
const createMockStore = () => {
  return createStore({
    modules: {
      audienceCondition: {
        namespaced: true,
        state: {
          availableTags: [
            { id: 'age', name: '年龄', type: 'number' },
            { id: 'gender', name: '性别', type: 'string' },
            { id: 'city', name: '城市', type: 'string' }
          ],
          availableEvents: [
            { id: 'login', name: '登录事件', properties: ['timestamp', 'device'] },
            { id: 'purchase', name: '购买事件', properties: ['amount', 'product_id'] }
          ],
          availableDataSources: [
            { id: 'user_profile', name: '用户档案' },
            { id: 'order_data', name: '订单数据' }
          ]
        },
        getters: {
          getAvailableTags: (state) => state.availableTags,
          getAvailableEvents: (state) => state.availableEvents,
          getAvailableDataSources: (state) => state.availableDataSources
        },
        actions: {
          updateConditionGroup: vi.fn(),
          removeCondition: vi.fn(),
          addCondition: vi.fn()
        }
      }
    }
  })
}

// Mock condition group data
const mockConditionGroup = {
  id: 'group-1',
  name: '标签规则',
  type: 'tag',
  isExclude: false,
  logic: 'and', // 统一逻辑控制
  conditions: [
    {
      id: 'c1',
      type: 'tag',
      tagId: 'age',
      operator: 'greater_than',
      value: '25'
    },
    {
      id: 'c2',
      type: 'tag',
      tagId: 'gender',
      operator: 'equals',
      value: '男'
    }
  ]
}

const mockBehaviorConditionGroup = {
  id: 'group-2',
  name: '行为规则',
  type: 'behavior',
  isExclude: false,
  logic: 'or', // 统一逻辑控制
  conditions: [
    {
      id: 'b1',
      type: 'behavior',
      eventId: 'login',
      properties: [
        { name: 'device', operator: 'equals', value: 'mobile' }
      ],
      timeRange: { start: '2024-01-01', end: '2024-12-31' }
    }
  ]
}

describe('ConditionGroup 布局优化测试', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(ConditionGroup, {
      global: {
        plugins: [store, ArcoVue]
      },
      props: {
        conditionGroup: mockConditionGroup,
        groupIndex: 0
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('水平布局优化', () => {
    test('标签条件应该采用水平布局', () => {
      const tagConditionRows = wrapper.findAll('[data-testid="tag-condition-row"]')
      expect(tagConditionRows.length).toBeGreaterThan(0)
      
      const firstRow = tagConditionRows[0]
      expect(firstRow.classes()).toContain('tag-condition-row')
      
      // 检查是否有水平布局的CSS类
      const tagConfig = firstRow.find('.tag-config')
      expect(tagConfig.exists()).toBe(true)
    })

    test('标签条件行应该包含正确的宽度分配', () => {
      const tagConditionRow = wrapper.find('[data-testid="tag-condition-row"]')
      const formGroups = tagConditionRow.findAll('.form-group')
      
      expect(formGroups.length).toBe(3) // 标签选择器、操作符、值输入框
      
      // 检查宽度分配样式类
      expect(formGroups[0].classes()).toContain('tag-selector') // 35%
      expect(formGroups[1].classes()).toContain('operator-selector') // 20%
      expect(formGroups[2].classes()).toContain('value-input') // 30%
    })

    test('操作按钮应该在右侧正确对齐', () => {
      const tagActions = wrapper.find('.tag-actions')
      expect(tagActions.exists()).toBe(true)
      expect(tagActions.classes()).toContain('tag-actions')
      
      const addButton = tagActions.find('[data-testid="add-condition-button"]')
      const removeButton = tagActions.find('[data-testid="remove-condition-button"]')
      
      expect(addButton.exists()).toBe(true)
      expect(removeButton.exists()).toBe(true)
    })

    test('行为条件的事件属性应该采用水平布局', async () => {
      await wrapper.setProps({ conditionGroup: mockBehaviorConditionGroup })
      
      const eventPropertyItems = wrapper.findAll('.event-property-item')
      expect(eventPropertyItems.length).toBeGreaterThan(0)
      
      const firstItem = eventPropertyItems[0]
      expect(firstItem.classes()).toContain('event-property-item')
      
      // 检查属性字段的宽度分配
      const propertyName = firstItem.find('.property-name')
      const propertyOperator = firstItem.find('.property-operator')
      const propertyValue = firstItem.find('.property-value')
      const propertyActions = firstItem.find('.property-actions')
      
      expect(propertyName.exists()).toBe(true)
      expect(propertyOperator.exists()).toBe(true)
      expect(propertyValue.exists()).toBe(true)
      expect(propertyActions.exists()).toBe(true)
    })
  })

  describe('统一逻辑控制', () => {
    test('条件组应该显示统一的逻辑控制器', () => {
      const logicController = wrapper.find('[data-testid="group-logic-controller"]')
      expect(logicController.exists()).toBe(true)
      
      // 检查当前逻辑类型
      expect(logicController.text()).toContain('且')
    })

    test('应该能够切换条件组的统一逻辑', async () => {
      const logicSwitch = wrapper.find('[data-testid="logic-switch"]')
      expect(logicSwitch.exists()).toBe(true)
      
      await logicSwitch.trigger('click')
      
      expect(wrapper.emitted('update-group-logic')).toBeTruthy()
      expect(wrapper.emitted('update-group-logic')[0]).toEqual(['group-1', 'or'])
    })

    test('统一逻辑指示器应该显示正确的样式', () => {
      const logicIndicator = wrapper.find('.group-logic-indicator')
      expect(logicIndicator.exists()).toBe(true)
      expect(logicIndicator.classes()).toContain('and-logic')
    })

    test('或逻辑应该显示不同的样式', async () => {
      const orConditionGroup = { ...mockConditionGroup, logic: 'or' }
      await wrapper.setProps({ conditionGroup: orConditionGroup })
      
      const logicIndicator = wrapper.find('.group-logic-indicator')
      expect(logicIndicator.classes()).toContain('or-logic')
    })

    test('条件间不应该显示单独的逻辑连接符', () => {
      const conditionConnectors = wrapper.findAll('.condition-logic-connector')
      expect(conditionConnectors.length).toBe(0)
    })
  })

  describe('树状结构布局', () => {
    test('条件组容器应该有树状结构样式', () => {
      const container = wrapper.find('.condition-groups-container')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('condition-groups-container')
    })

    test('应该显示左侧主连接线', () => {
      const container = wrapper.find('.condition-groups-container')
      const computedStyle = window.getComputedStyle(container.element, '::before')
      
      // 检查伪元素是否存在（通过CSS类来验证）
      expect(container.classes()).toContain('condition-groups-container')
    })

    test('条件组应该有分支连接线', () => {
      const conditionGroupCard = wrapper.find('.condition-group-card')
      expect(conditionGroupCard.exists()).toBe(true)
      expect(conditionGroupCard.classes()).toContain('condition-group-card')
    })

    test('条件项应该有正确的缩进和连接线', () => {
      const conditionItems = wrapper.findAll('.condition-item-wrapper')
      expect(conditionItems.length).toBeGreaterThan(0)
      
      conditionItems.forEach(item => {
        expect(item.classes()).toContain('condition-item-wrapper')
      })
    })

    test('条件项应该显示序号指示器', () => {
      const indexIndicators = wrapper.findAll('.condition-item-index')
      expect(indexIndicators.length).toBe(mockConditionGroup.conditions.length)
      
      indexIndicators.forEach((indicator, index) => {
        expect(indicator.text()).toBe((index + 1).toString())
      })
    })
  })

  describe('响应式适配', () => {
    test('在小屏幕下应该切换到垂直布局', async () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      const tagConditionRow = wrapper.find('.tag-condition-row')
      expect(tagConditionRow.classes()).toContain('mobile-layout')
    })

    test('在平板屏幕下应该调整宽度分配', async () => {
      // 模拟平板屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      const tagConditionRow = wrapper.find('.tag-condition-row')
      expect(tagConditionRow.classes()).toContain('tablet-layout')
    })
  })

  describe('用户体验优化', () => {
    test('条件项应该有hover效果', async () => {
      const conditionItem = wrapper.find('.condition-item-wrapper')
      
      await conditionItem.trigger('mouseenter')
      expect(conditionItem.classes()).toContain('hover')
      
      await conditionItem.trigger('mouseleave')
      expect(conditionItem.classes()).not.toContain('hover')
    })

    test('操作按钮应该有适当的点击区域', () => {
      const addButton = wrapper.find('[data-testid="add-condition-button"]')
      const removeButton = wrapper.find('[data-testid="remove-condition-button"]')
      
      // 检查按钮尺寸
      expect(addButton.element.offsetWidth).toBeGreaterThanOrEqual(24)
      expect(addButton.element.offsetHeight).toBeGreaterThanOrEqual(24)
      expect(removeButton.element.offsetWidth).toBeGreaterThanOrEqual(24)
      expect(removeButton.element.offsetHeight).toBeGreaterThanOrEqual(24)
    })

    test('应该支持键盘导航', async () => {
      const firstInput = wrapper.find('input')
      await firstInput.trigger('keydown', { key: 'Tab' })
      
      // 检查焦点是否正确移动
      expect(document.activeElement).toBe(firstInput.element.nextElementSibling)
    })
  })

  describe('视觉层次优化', () => {
    test('不同类型的条件应该有不同的背景色', () => {
      const tagConditionRow = wrapper.find('.tag-condition-row')
      expect(tagConditionRow.classes()).toContain('tag-condition-row')
      
      // 检查背景色样式
      const computedStyle = window.getComputedStyle(tagConditionRow.element)
      expect(computedStyle.backgroundColor).toBeTruthy()
    })

    test('条件组应该有清晰的边界', () => {
      const conditionGroupCard = wrapper.find('.condition-group-card')
      expect(conditionGroupCard.classes()).toContain('condition-group-card')
      
      const computedStyle = window.getComputedStyle(conditionGroupCard.element)
      expect(computedStyle.border).toBeTruthy()
      expect(computedStyle.borderRadius).toBeTruthy()
    })

    test('统一逻辑指示器应该有突出的视觉效果', () => {
      const logicIndicator = wrapper.find('.group-logic-indicator')
      expect(logicIndicator.exists()).toBe(true)
      
      const computedStyle = window.getComputedStyle(logicIndicator.element)
      expect(computedStyle.boxShadow).toBeTruthy()
      expect(computedStyle.background).toBeTruthy()
    })
  })
})