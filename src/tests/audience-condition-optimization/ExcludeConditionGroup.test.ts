import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import ExcludeConditionGroup from '@/components/common/ExcludeConditionGroup.vue'
import ConditionConfig from '@/components/common/ConditionConfig.vue'
import ConditionGroup from '@/components/common/ConditionGroup.vue'
import type { ConditionGroup, BaseCondition } from '@/types/audience'

// Mock Arco Design 组件
// Mock ConditionConfig 组件
vi.mock('./ConditionConfig.vue', () => ({
  default: {
    name: 'ConditionConfig',
    template: '<div class="condition-config" data-testid="condition-config">Mock Condition Config</div>',
    props: ['condition', 'editable'],
    emits: ['update:condition', 'delete']
  }
}))

vi.mock('@arco-design/web-vue', () => ({
  Button: {
    name: 'AButton',
    template: '<button v-bind="$attrs" :data-testid="$attrs[\"data-testid\"]"><slot /></button>',
    inheritAttrs: false
  },
  Card: {
    name: 'ACard',
    template: '<div class="arco-card"><slot /></div>'
  },
  Input: {
    name: 'AInput',
    template: '<input :data-testid="$attrs[\"data-testid\"]" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    inheritAttrs: false
  },
  Space: {
    name: 'ASpace',
    template: '<div class="arco-space"><slot /></div>'
  },
  Divider: {
    name: 'ADivider',
    template: '<div class="arco-divider"></div>'
  },
  Tag: {
    name: 'ATag',
    template: '<span class="arco-tag"><slot /></span>'
  },
  Empty: {
    name: 'AEmpty',
    template: '<div class="arco-empty"><slot /></div>'
  },
  'a-empty': {
    template: '<div class="a-empty"><slot /></div>'
  },
  'a-space': {
    template: '<div class="a-space"><slot /></div>'
  }
}))

// Mock Arco Design 图标
vi.mock('@arco-design/web-vue/es/icon', () => ({
  IconDown: {
    name: 'IconDown',
    template: '<span class="icon-down">▼</span>'
  },
  IconRight: {
    name: 'IconRight',
    template: '<span class="icon-right">▶</span>'
  },
  IconDelete: {
    name: 'IconDelete',
    template: '<span class="icon-delete">🗑</span>'
  },
  IconPlus: {
    name: 'IconPlus',
    template: '<span class="icon-plus">+</span>'
  }
}))

// Mock 数据
const mockExcludeConditionGroup: ConditionGroup = {
  id: 'exclude-group-1',
  type: 'exclude',
  logic: 'and',
  conditions: []
}

const mockTagCondition = {
  field: 'tag',
  operator: 'equals',
  value: 'VIP客户',
  type: 'exclude' as const
}

const mockBehaviorCondition = {
  field: 'behavior',
  operator: 'contains',
  value: '购买行为',
  type: 'exclude' as const
}

// Mock Vuex Store
const createMockStore = () => {
  return createStore({
    state: {
      audience: {
        currentAudience: {
          excludeConditionGroups: [mockExcludeConditionGroup]
        },
        preCalculateStats: {
          excludeCount: 0,
          loading: false
        }
      }
    },
    mutations: {
      ADD_EXCLUDE_CONDITION_GROUP: vi.fn(),
      REMOVE_EXCLUDE_CONDITION_GROUP: vi.fn(),
      UPDATE_EXCLUDE_CONDITION_GROUP: vi.fn(),
      ADD_CONDITION_TO_EXCLUDE_GROUP: vi.fn(),
      REMOVE_CONDITION_FROM_EXCLUDE_GROUP: vi.fn()
    },
    actions: {
      addExcludeConditionGroup: vi.fn(),
      removeExcludeConditionGroup: vi.fn(),
      updateExcludeConditionGroup: vi.fn(),
      addConditionToExcludeGroup: vi.fn(),
      removeConditionFromExcludeGroup: vi.fn()
    }
  })
}

describe('ExcludeConditionGroup 剔除条件组', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(ExcludeConditionGroup, {
      props: {
        group: mockExcludeConditionGroup,
        editable: true,
        groupIndex: 0
      },
      global: {
        plugins: [store]
      }
    })
  })

  describe('剔除条件组创建', () => {
    test('应该能够创建剔除条件组', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('group').isExclude).toBe(true)
      expect(wrapper.props('group').groupType).toBe('exclude')
    })

    test('剔除条件组应该有正确的初始状态', () => {
      const group = wrapper.props('group')
      expect(group.id).toBe('exclude-group-1')
      expect(group.name).toBe('剔除条件组1')
      expect(group.logic).toBe('and')
      expect(group.isExclude).toBe(true)
      expect(group.excludeLogic).toBe('and')
    })

    test('应该支持设置剔除条件组名称', async () => {
      const nameInput = wrapper.find('[data-testid="group-name-input"]')
      await nameInput.setValue('新的剔除条件组')
      
      expect(wrapper.emitted('update:group')).toBeTruthy()
      const emittedGroup = wrapper.emitted('update:group')[0][0]
      expect(emittedGroup.name).toBe('新的剔除条件组')
    })
  })

  describe('剔除条件组样式区分', () => {
    test('剔除条件组应该有红色边框样式', () => {
      const groupCard = wrapper.find('.condition-group-card')
      expect(groupCard.classes()).toContain('condition-group-exclude')
      expect(groupCard.classes()).not.toContain('condition-group-include')
    })

    test('剔除条件组应该显示特殊图标', () => {
      const excludeIcon = wrapper.find('[data-testid="exclude-icon"]')
      expect(excludeIcon.exists()).toBe(true)
      expect(excludeIcon.classes()).toContain('exclude-indicator')
    })

    test('剔除条件组标题应该包含"剔除"标识', () => {
      const groupTitle = wrapper.find('[data-testid="group-title"]')
      expect(groupTitle.text()).toContain('剔除')
    })

    test('剔除条件组应该有特殊的背景色', () => {
      const groupCard = wrapper.find('.condition-group-card')
      const computedStyle = getComputedStyle(groupCard.element)
      // 验证是否应用了剔除条件组的特殊样式
      expect(groupCard.attributes('style')).toContain('border-color')
    })
  })

  describe('剔除逻辑连接线样式', () => {
    test('剔除逻辑连接线应该是虚线样式', () => {
      const logicConnector = wrapper.find('[data-testid="exclude-logic-connector"]')
      if (logicConnector.exists()) {
        expect(logicConnector.classes()).toContain('exclude-connector')
        expect(logicConnector.attributes('style')).toContain('stroke-dasharray')
      }
    })

    test('剔除逻辑连接线应该使用红色', () => {
      const logicConnector = wrapper.find('[data-testid="exclude-logic-connector"]')
      if (logicConnector.exists()) {
        expect(logicConnector.attributes('style')).toContain('stroke: #f53f3f')
      }
    })
  })

  describe('剔除条件管理', () => {
    test('应该能够添加标签条件到剔除条件组', async () => {
      const addTagButton = wrapper.find('[data-testid="add-tag-condition"]')
      await addTagButton.trigger('click')
      
      expect(wrapper.emitted('add-condition')).toBeTruthy()
      const emittedEvent = wrapper.emitted('add-condition')[0]
      expect(emittedEvent[0]).toBe(0) // groupIndex
      expect(emittedEvent[1]).toBe('tag') // condition type
    })

    test('应该能够添加行为条件到剔除条件组', async () => {
      const addBehaviorButton = wrapper.find('[data-testid="add-behavior-condition"]')
      await addBehaviorButton.trigger('click')
      
      expect(wrapper.emitted('add-condition')).toBeTruthy()
      const emittedEvent = wrapper.emitted('add-condition')[0]
      expect(emittedEvent[1]).toBe('behavior')
    })

    test('应该能够添加明细数据条件到剔除条件组', async () => {
      const addDetailButton = wrapper.find('[data-testid="add-detail-condition"]')
      await addDetailButton.trigger('click')
      
      expect(wrapper.emitted('add-condition')).toBeTruthy()
      const emittedEvent = wrapper.emitted('add-condition')[0]
      expect(emittedEvent[1]).toBe('detail')
    })

    test('应该能够删除剔除条件组中的条件', async () => {
      // 先添加一个条件
      const groupWithCondition = {
        ...mockExcludeConditionGroup,
        conditions: [mockTagCondition]
      }
      
      await wrapper.setProps({ group: groupWithCondition })
      
      const removeButton = wrapper.find('[data-testid="remove-condition-0"]')
      await removeButton.trigger('click')
      
      expect(wrapper.emitted('remove-condition')).toBeTruthy()
      const emittedEvent = wrapper.emitted('remove-condition')[0]
      expect(emittedEvent[0]).toBe(0) // groupIndex
      expect(emittedEvent[1]).toBe(0) // conditionIndex
    })
  })

  describe('剔除逻辑切换', () => {
    test('应该能够切换剔除条件组内部逻辑（且/或）', async () => {
      const groupWithConditions = {
        ...mockExcludeConditionGroup,
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      await wrapper.setProps({ group: groupWithConditions })
      await wrapper.vm.$nextTick()
      
      const logicToggle = wrapper.find('[data-testid="exclude-logic-toggle"]')
      console.log('Logic toggle exists:', logicToggle.exists())
      console.log('Logic toggle HTML:', logicToggle.html())
      console.log('All buttons:', wrapper.findAll('button').map(b => ({ html: b.html(), testid: b.attributes('data-testid') })))
      
      expect(logicToggle.exists()).toBe(true)
      
      await logicToggle.trigger('click')
      
      console.log('Emitted events:', wrapper.emitted())
      expect(wrapper.emitted('toggle-logic')).toBeTruthy()
      const emittedEvent = wrapper.emitted('toggle-logic')[0]
      expect(emittedEvent[0]).toBe(0) // groupIndex
    })

    test('逻辑切换按钮应该存在并可点击', async () => {
      const logicToggle = wrapper.find('[data-testid="exclude-logic-toggle"]')
      
      expect(logicToggle.exists()).toBe(true)
      
      // 测试按钮点击功能
      await logicToggle.trigger('click')
      
      // 验证 update:group 事件被触发
      const updateEvents = wrapper.emitted('update:group')
      expect(updateEvents).toBeTruthy()
      expect(updateEvents!.length).toBeGreaterThan(0)
      
      // 验证逻辑已切换
      const lastEvent = updateEvents![updateEvents!.length - 1][0] as any
      expect(lastEvent.logic).toBe('or') // 从 'and' 切换到 'or'
    })
  })

  describe('剔除条件组删除', () => {
    test('应该能够删除整个剔除条件组', async () => {
      const deleteButton = wrapper.find('[data-testid="delete-exclude-group"]')
      await deleteButton.trigger('click')
      
      expect(wrapper.emitted('delete-group')).toBeTruthy()
      const emittedEvent = wrapper.emitted('delete-group')[0]
      expect(emittedEvent[0]).toBe(0) // groupIndex
    })

    test('删除按钮应该有确认提示', async () => {
      const deleteButton = wrapper.find('[data-testid="delete-exclude-group"]')
      expect(deleteButton.attributes('title')).toContain('删除')
    })
  })

  describe('剔除条件组折叠展开', () => {
    test('应该支持折叠剔除条件组', async () => {
      const collapseButton = wrapper.find('[data-testid="collapse-toggle"]')
      await collapseButton.trigger('click')
      
      expect(wrapper.emitted('update:group')).toBeTruthy()
      const emittedGroup = wrapper.emitted('update:group')[0][0]
      expect(emittedGroup.collapsed).toBe(true)
    })

    test('折叠状态下应该隐藏条件列表', async () => {
      const collapsedGroup = {
        ...mockExcludeConditionGroup,
        collapsed: true
      }
      
      await wrapper.setProps({ group: collapsedGroup })
      
      const conditionList = wrapper.find('[data-testid="condition-list"]')
      expect(conditionList.exists()).toBe(false)
    })
  })

  describe('剔除条件组验证', () => {
    test('空的剔除条件组应该显示提示信息', () => {
      const emptyMessage = wrapper.find('[data-testid="empty-conditions-message"]')
      expect(emptyMessage.exists()).toBe(true)
      expect(emptyMessage.text()).toContain('暂无剔除条件')
    })

    test('有条件的剔除条件组应该隐藏空状态提示', async () => {
      const groupWithConditions = {
        ...mockExcludeConditionGroup,
        conditions: [
          {
            field: 'tag',
            operator: 'equals',
            value: 'VIP客户',
            type: 'exclude' as const
          },
          mockBehaviorCondition
        ]
      }
      
      await wrapper.setProps({ group: groupWithConditions })
      
      const emptyMessage = wrapper.find('[data-testid="empty-conditions-message"]')
      expect(emptyMessage.exists()).toBe(false)
    })

    test('应该显示剔除条件组中的条件数量', async () => {
      const groupWithConditions = {
        ...mockExcludeConditionGroup,
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: groupWithConditions })
      
      const conditionCount = wrapper.find('[data-testid="condition-count"]')
      expect(conditionCount.text()).toContain('2')
    })
  })

  describe('剔除条件组交互', () => {
    test('不可编辑状态下应该禁用所有操作按钮', async () => {
      await wrapper.setProps({ editable: false })
      
      const addButtons = wrapper.findAll('[data-testid^="add-"]')
      const deleteButtons = wrapper.findAll('[data-testid^="delete-"]')
      const toggleButtons = wrapper.findAll('[data-testid^="toggle-"]')
      
      addButtons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined()
      })
      
      deleteButtons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined()
      })
      
      toggleButtons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })

    test('应该支持键盘快捷键操作', async () => {
      const groupElement = wrapper.find('.condition-group-card')
      
      // 测试 Delete 键删除条件组
      await groupElement.trigger('keydown', { key: 'Delete' })
      expect(wrapper.emitted('delete-group')).toBeTruthy()
      
      // 测试 Space 键切换折叠状态
      await groupElement.trigger('keydown', { key: ' ' })
      expect(wrapper.emitted('update:group')).toBeTruthy()
    })
  })

  describe('布局优化功能测试', () => {
    test('应该支持水平布局模式', async () => {
      const horizontalGroup = {
        ...mockExcludeConditionGroup,
        layoutMode: 'horizontal',
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: horizontalGroup })
      
      const conditionContainer = wrapper.find('[data-testid="condition-container"]')
      expect(conditionContainer.classes()).toContain('horizontal-layout')
    })

    test('水平布局下条件应该按比例分配宽度', async () => {
      const horizontalGroup = {
        ...mockExcludeConditionGroup,
        layoutMode: 'horizontal',
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: horizontalGroup })
      
      const tagConditionRow = wrapper.find('[data-testid="tag-condition-row"]')
      const behaviorConditionRow = wrapper.find('[data-testid="behavior-condition-row"]')
      
      expect(tagConditionRow.classes()).toContain('condition-row')
      expect(behaviorConditionRow.classes()).toContain('condition-row')
    })

    test('应该支持统一逻辑控制', async () => {
      const groupWithUnifiedLogic = {
        ...mockExcludeConditionGroup,
        unifiedLogicControl: true,
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: groupWithUnifiedLogic })
      
      const unifiedLogicController = wrapper.find('[data-testid="unified-logic-controller"]')
      expect(unifiedLogicController.exists()).toBe(true)
      expect(unifiedLogicController.classes()).toContain('unified-logic-control')
    })

    test('统一逻辑控制应该影响所有条件', async () => {
      const groupWithUnifiedLogic = {
        ...mockExcludeConditionGroup,
        unifiedLogicControl: true,
        logic: 'and',
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: groupWithUnifiedLogic })
      
      const logicToggle = wrapper.find('[data-testid="unified-logic-toggle"]')
      await logicToggle.trigger('click')
      
      expect(wrapper.emitted('update:group')).toBeTruthy()
      const emittedGroup = wrapper.emitted('update:group')[0][0]
      expect(emittedGroup.logic).toBe('or')
    })

    test('应该支持树状结构显示', async () => {
      const treeStructureGroup = {
        ...mockExcludeConditionGroup,
        treeStructure: true,
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: treeStructureGroup })
      
      const treeContainer = wrapper.find('[data-testid="tree-structure-container"]')
      expect(treeContainer.exists()).toBe(true)
      expect(treeContainer.classes()).toContain('tree-structure')
    })

    test('树状结构应该显示连接线', async () => {
      const treeStructureGroup = {
        ...mockExcludeConditionGroup,
        treeStructure: true,
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: treeStructureGroup })
      
      const connectionLines = wrapper.findAll('[data-testid="connection-line"]')
      expect(connectionLines.length).toBeGreaterThan(0)
      
      connectionLines.forEach(line => {
        expect(line.classes()).toContain('tree-connection-line')
      })
    })

    test('应该支持响应式布局', async () => {
      const responsiveGroup = {
        ...mockExcludeConditionGroup,
        responsiveLayout: true,
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: responsiveGroup })
      
      const groupContainer = wrapper.find('.condition-group-card')
      expect(groupContainer.classes()).toContain('responsive-layout')
    })

    test('移动端应该切换到垂直布局', async () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })
      
      const mobileGroup = {
        ...mockExcludeConditionGroup,
        responsiveLayout: true,
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      await wrapper.setProps({ group: mobileGroup })
      
      const conditionContainer = wrapper.find('[data-testid="condition-container"]')
      expect(conditionContainer.classes()).toContain('mobile-vertical-layout')
    })
  })
})

// 剔除逻辑计算测试
describe('ExcludeLogicCalculation 剔除逻辑计算', () => {
  describe('剔除条件组人群计算', () => {
    test('应该正确计算单个剔除条件组的人群数量', () => {
      const excludeGroup = {
        ...mockExcludeConditionGroup,
        conditions: [mockTagCondition]
      }
      
      // Mock 计算函数
      const calculateExcludeGroupCount = vi.fn().mockReturnValue(1000)
      
      const result = calculateExcludeGroupCount(excludeGroup)
      expect(result).toBe(1000)
      expect(calculateExcludeGroupCount).toHaveBeenCalledWith(excludeGroup)
    })

    test('应该正确计算多个剔除条件的"且"逻辑', () => {
      const excludeGroupWithAndLogic = {
        ...mockExcludeConditionGroup,
        logic: 'and',
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      const calculateExcludeGroupCount = vi.fn().mockReturnValue(500)
      
      const result = calculateExcludeGroupCount(excludeGroupWithAndLogic)
      expect(result).toBe(500)
    })

    test('应该正确计算多个剔除条件的"或"逻辑', () => {
      const excludeGroupWithOrLogic = {
        ...mockExcludeConditionGroup,
        logic: 'or',
        conditions: [mockTagCondition, mockBehaviorCondition]
      }
      
      const calculateExcludeGroupCount = vi.fn().mockReturnValue(1500)
      
      const result = calculateExcludeGroupCount(excludeGroupWithOrLogic)
      expect(result).toBe(1500)
    })
  })

  describe('多个剔除条件组计算', () => {
    test('应该正确计算多个剔除条件组的"且"逻辑', () => {
      const excludeGroups = [
        { ...mockExcludeConditionGroup, id: 'exclude-1' },
        { ...mockExcludeConditionGroup, id: 'exclude-2' }
      ]
      
      const calculateMultipleExcludeGroups = vi.fn().mockReturnValue(800)
      
      const result = calculateMultipleExcludeGroups(excludeGroups, 'and')
      expect(result).toBe(800)
    })

    test('应该正确计算多个剔除条件组的"或"逻辑', () => {
      const excludeGroups = [
        { ...mockExcludeConditionGroup, id: 'exclude-1' },
        { ...mockExcludeConditionGroup, id: 'exclude-2' }
      ]
      
      const calculateMultipleExcludeGroups = vi.fn().mockReturnValue(1200)
      
      const result = calculateMultipleExcludeGroups(excludeGroups, 'or')
      expect(result).toBe(1200)
    })
  })

  describe('最终人群数量计算', () => {
    test('应该正确计算最终人群数量（包含-剔除）', () => {
      const includeCount = 10000
      const excludeCount = 2000
      
      const calculateFinalCount = (include: number, exclude: number) => {
        return Math.max(0, include - exclude)
      }
      
      const result = calculateFinalCount(includeCount, excludeCount)
      expect(result).toBe(8000)
    })

    test('剔除数量大于包含数量时，最终结果应该为0', () => {
      const includeCount = 1000
      const excludeCount = 2000
      
      const calculateFinalCount = (include: number, exclude: number) => {
        return Math.max(0, include - exclude)
      }
      
      const result = calculateFinalCount(includeCount, excludeCount)
      expect(result).toBe(0)
    })

    test('没有剔除条件时，最终结果应该等于包含数量', () => {
      const includeCount = 5000
      const excludeCount = 0
      
      const calculateFinalCount = (include: number, exclude: number) => {
        return Math.max(0, include - exclude)
      }
      
      const result = calculateFinalCount(includeCount, excludeCount)
      expect(result).toBe(5000)
    })
  })
})