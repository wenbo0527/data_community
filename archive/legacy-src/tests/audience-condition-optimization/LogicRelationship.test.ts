import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import LogicRelationshipDisplay from '@/components/common/LogicRelationshipDisplay.vue'
import LogicSwitcher from '@/components/common/LogicSwitcher.vue'
import type { ConditionGroup, LogicConnection } from '@/types/audience'

// Mock 数据
const mockConditionGroups: ConditionGroup[] = [
  {
    id: 'group-1',
    name: '包含条件组1',
    logic: 'and',
    conditions: [
      { id: 'c1', type: 'tag', operator: 'equals', value: 'VIP', isValid: true },
      { id: 'c2', type: 'behavior', operator: 'contains', value: '购买', isValid: true }
    ],
    isExclude: false,
    collapsed: false,
    groupType: 'include'
  },
  {
    id: 'group-2',
    name: '包含条件组2',
    logic: 'or',
    conditions: [
      { id: 'c3', type: 'tag', operator: 'equals', value: '活跃用户', isValid: true }
    ],
    isExclude: false,
    collapsed: false,
    groupType: 'include'
  },
  {
    id: 'group-3',
    name: '剔除条件组1',
    logic: 'and',
    conditions: [
      { id: 'c4', type: 'tag', operator: 'equals', value: '流失客户', isValid: true }
    ],
    isExclude: true,
    collapsed: false,
    groupType: 'exclude'
  }
]

const mockLogicConnections: LogicConnection[] = [
  {
    id: 'conn-1',
    fromGroupId: 'group-1',
    toGroupId: 'group-2',
    logic: 'and',
    type: 'include-to-include',
    style: 'solid'
  },
  {
    id: 'conn-2',
    fromGroupId: 'group-2',
    toGroupId: 'group-3',
    logic: 'exclude',
    type: 'include-to-exclude',
    style: 'dashed'
  }
]

// Mock Vuex Store
const createMockStore = (crossGroupLogic = 'and', excludeGroupLogic = 'and') => {
  return createStore({
    state: {
      audience: {
        currentAudience: {
          includeConditionGroups: mockConditionGroups.filter(g => !g.isExclude),
          excludeConditionGroups: mockConditionGroups.filter(g => g.isExclude),
          crossGroupLogic,
          excludeGroupLogic,
          logicConnections: mockLogicConnections
        }
      }
    },
    mutations: {
      UPDATE_CROSS_GROUP_LOGIC: vi.fn(),
      UPDATE_EXCLUDE_GROUP_LOGIC: vi.fn(),
      UPDATE_CONDITION_GROUP_LOGIC: vi.fn(),
      UPDATE_CONDITION_LOGIC: vi.fn()
    },
    actions: {
      updateLogicRelationship: vi.fn()
    }
  })
}

describe('LogicRelationshipDisplay 逻辑关系展示', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(LogicRelationshipDisplay, {
      global: {
        plugins: [store]
      },
      props: {
        conditionGroups: mockConditionGroups,
        logicConnections: mockLogicConnections
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('逻辑关系可视化', () => {
    test('应该正确渲染逻辑关系图', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="logic-relationship-display"]').exists()).toBe(true)
    })

    test('应该显示条件组节点', () => {
      const groupNodes = wrapper.findAll('[data-testid^="group-node-"]')
      expect(groupNodes).toHaveLength(3)
      
      // 验证包含条件组节点
      const includeNodes = wrapper.findAll('[data-testid^="include-group-node-"]')
      expect(includeNodes).toHaveLength(2)
      
      // 验证剔除条件组节点
      const excludeNodes = wrapper.findAll('[data-testid^="exclude-group-node-"]')
      expect(excludeNodes).toHaveLength(1)
    })

    test('应该显示逻辑连接线', () => {
      const connectionLines = wrapper.findAll('[data-testid^="connection-line-"]')
      expect(connectionLines).toHaveLength(2)
    })

    test('包含条件组之间应该显示实线连接', () => {
      const includeConnection = wrapper.find('[data-testid="connection-line-conn-1"]')
      expect(includeConnection.exists()).toBe(true)
      expect(includeConnection.classes()).toContain('solid-line')
    })

    test('剔除条件组应该显示虚线连接', () => {
      const excludeConnection = wrapper.find('[data-testid="connection-line-conn-2"]')
      expect(excludeConnection.exists()).toBe(true)
      expect(excludeConnection.classes()).toContain('dashed-line')
    })

    test('剔除条件组应该有红色边框', () => {
      const excludeNode = wrapper.find('[data-testid="exclude-group-node-group-3"]')
      expect(excludeNode.exists()).toBe(true)
      expect(excludeNode.classes()).toContain('exclude-border')
    })

    test('应该显示逻辑操作符标签', () => {
      const andLabel = wrapper.find('[data-testid="logic-label-and"]')
      const excludeLabel = wrapper.find('[data-testid="logic-label-exclude"]')
      
      expect(andLabel.exists()).toBe(true)
      expect(andLabel.text()).toBe('且')
      expect(excludeLabel.exists()).toBe(true)
      expect(excludeLabel.text()).toBe('剔除')
    })
  })

  describe('逻辑关系交互', () => {
    test('点击条件组节点应该高亮显示', async () => {
      const groupNode = wrapper.find('[data-testid="group-node-group-1"]')
      await groupNode.trigger('click')
      
      expect(groupNode.classes()).toContain('highlighted')
      expect(wrapper.emitted('group-selected')).toBeTruthy()
      expect(wrapper.emitted('group-selected')[0]).toEqual(['group-1'])
    })

    test('悬停条件组节点应该显示详细信息', async () => {
      const groupNode = wrapper.find('[data-testid="group-node-group-1"]')
      await groupNode.trigger('mouseenter')
      
      const tooltip = wrapper.find('[data-testid="group-tooltip-group-1"]')
      expect(tooltip.exists()).toBe(true)
      expect(tooltip.text()).toContain('包含条件组1')
      expect(tooltip.text()).toContain('2个条件')
    })

    test('点击连接线应该显示逻辑切换器', async () => {
      const connectionLine = wrapper.find('[data-testid="connection-line-conn-1"]')
      await connectionLine.trigger('click')
      
      expect(wrapper.emitted('connection-clicked')).toBeTruthy()
      expect(wrapper.emitted('connection-clicked')[0]).toEqual(['conn-1'])
    })

    test('应该支持拖拽调整布局', async () => {
      const groupNode = wrapper.find('[data-testid="group-node-group-1"]')
      
      await groupNode.trigger('mousedown', { clientX: 100, clientY: 100 })
      await groupNode.trigger('mousemove', { clientX: 150, clientY: 120 })
      await groupNode.trigger('mouseup')
      
      expect(wrapper.emitted('node-moved')).toBeTruthy()
    })
  })

  describe('逻辑关系计算', () => {
    test('应该正确计算包含条件组之间的逻辑关系', () => {
      const calculateIncludeLogic = (groups: ConditionGroup[], crossLogic: string) => {
        if (crossLogic === 'and') {
          return groups.every(group => group.conditions.length > 0)
        } else {
          return groups.some(group => group.conditions.length > 0)
        }
      }
      
      const includeGroups = mockConditionGroups.filter(g => !g.isExclude)
      expect(calculateIncludeLogic(includeGroups, 'and')).toBe(true)
      expect(calculateIncludeLogic(includeGroups, 'or')).toBe(true)
    })

    test('应该正确处理剔除逻辑', () => {
      const calculateExcludeLogic = (includeResult: boolean, excludeGroups: ConditionGroup[]) => {
        if (!includeResult) return false
        
        const hasExcludeConditions = excludeGroups.some(group => 
          group.conditions.length > 0 && group.conditions.every(c => c.isValid)
        )
        
        return includeResult && !hasExcludeConditions
      }
      
      const excludeGroups = mockConditionGroups.filter(g => g.isExclude)
      expect(calculateExcludeLogic(true, excludeGroups)).toBe(false)
      expect(calculateExcludeLogic(false, excludeGroups)).toBe(false)
      expect(calculateExcludeLogic(true, [])).toBe(true)
    })

    test('应该正确生成逻辑表达式', () => {
      const generateLogicExpression = (groups: ConditionGroup[], crossLogic: string) => {
        const includeGroups = groups.filter(g => !g.isExclude)
        const excludeGroups = groups.filter(g => g.isExclude)
        
        let expression = includeGroups.map(g => `(${g.name})`).join(` ${crossLogic} `)
        
        if (excludeGroups.length > 0) {
          const excludeExpression = excludeGroups.map(g => `(${g.name})`).join(' 或 ')
          expression += ` 且 非(${excludeExpression})`
        }
        
        return expression
      }
      
      const expression = generateLogicExpression(mockConditionGroups, 'and')
      expect(expression).toContain('(包含条件组1) and (包含条件组2)')
      expect(expression).toContain('且 非(剔除条件组1)')
    })
  })

  describe('逻辑关系布局', () => {
    test('应该使用合适的布局算法', () => {
      const layoutNodes = wrapper.findAll('[data-testid^="group-node-"]')
      
      // 验证节点位置
      layoutNodes.forEach((node, index) => {
        const style = node.attributes('style')
        expect(style).toContain('position')
        expect(style).toContain('left')
        expect(style).toContain('top')
      })
    })

    test('应该避免节点重叠', () => {
      const getNodePosition = (nodeId: string) => {
        const node = wrapper.find(`[data-testid="group-node-${nodeId}"]`)
        const style = node.attributes('style')
        const leftMatch = style.match(/left:\s*(\d+)px/)
        const topMatch = style.match(/top:\s*(\d+)px/)
        
        return {
          left: leftMatch ? parseInt(leftMatch[1]) : 0,
          top: topMatch ? parseInt(topMatch[1]) : 0
        }
      }
      
      const pos1 = getNodePosition('group-1')
      const pos2 = getNodePosition('group-2')
      
      // 验证节点不重叠（至少有50px间距）
      const distance = Math.sqrt(
        Math.pow(pos2.left - pos1.left, 2) + Math.pow(pos2.top - pos1.top, 2)
      )
      expect(distance).toBeGreaterThan(50)
    })

    test('应该支持自动布局调整', async () => {
      const autoLayoutButton = wrapper.find('[data-testid="auto-layout-button"]')
      await autoLayoutButton.trigger('click')
      
      expect(wrapper.emitted('auto-layout-triggered')).toBeTruthy()
    })
  })

  describe('逻辑关系导出', () => {
    test('应该支持导出为图片', async () => {
      const exportButton = wrapper.find('[data-testid="export-image-button"]')
      await exportButton.trigger('click')
      
      expect(wrapper.emitted('export-image')).toBeTruthy()
    })

    test('应该支持导出逻辑表达式', async () => {
      const exportExpressionButton = wrapper.find('[data-testid="export-expression-button"]')
      await exportExpressionButton.trigger('click')
      
      expect(wrapper.emitted('export-expression')).toBeTruthy()
    })
  })
})

describe('LogicSwitcher 逻辑切换器', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(LogicSwitcher, {
      global: {
        plugins: [store]
      },
      props: {
        currentLogic: 'and',
        type: 'cross-group',
        disabled: false
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('逻辑切换器渲染', () => {
    test('应该正确渲染逻辑切换器', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="logic-switcher"]').exists()).toBe(true)
    })

    test('应该显示当前逻辑状态', () => {
      const currentLogicDisplay = wrapper.find('[data-testid="current-logic"]')
      expect(currentLogicDisplay.exists()).toBe(true)
      expect(currentLogicDisplay.text()).toBe('且')
    })

    test('应该显示切换按钮', () => {
      const switchButton = wrapper.find('[data-testid="switch-logic-button"]')
      expect(switchButton.exists()).toBe(true)
    })

    test('禁用状态下按钮应该不可点击', async () => {
      await wrapper.setProps({ disabled: true })
      
      const switchButton = wrapper.find('[data-testid="switch-logic-button"]')
      expect(switchButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('逻辑切换功能', () => {
    test('点击应该切换逻辑状态', async () => {
      const switchButton = wrapper.find('[data-testid="switch-logic-button"]')
      await switchButton.trigger('click')
      
      expect(wrapper.emitted('logic-changed')).toBeTruthy()
      expect(wrapper.emitted('logic-changed')[0]).toEqual(['or'])
    })

    test('应该支持键盘操作', async () => {
      const switcher = wrapper.find('[data-testid="logic-switcher"]')
      await switcher.trigger('keydown', { key: 'Space' })
      
      expect(wrapper.emitted('logic-changed')).toBeTruthy()
    })

    test('应该正确处理不同类型的逻辑切换', async () => {
      // 测试条件组内逻辑切换
      await wrapper.setProps({ type: 'condition-group' })
      
      const switchButton = wrapper.find('[data-testid="switch-logic-button"]')
      await switchButton.trigger('click')
      
      expect(wrapper.emitted('logic-changed')).toBeTruthy()
    })

    test('应该显示逻辑切换动画', async () => {
      const switchButton = wrapper.find('[data-testid="switch-logic-button"]')
      await switchButton.trigger('click')
      
      const switcher = wrapper.find('[data-testid="logic-switcher"]')
      expect(switcher.classes()).toContain('switching')
    })
  })

  describe('布局优化功能测试', () => {
    test('应该支持统一逻辑控制模式', async () => {
      await wrapper.setProps({ 
        type: 'unified-control',
        unifiedLogicControl: true 
      })
      
      const unifiedController = wrapper.find('[data-testid="unified-logic-controller"]')
      expect(unifiedController.exists()).toBe(true)
      expect(unifiedController.classes()).toContain('unified-control')
    })

    test('统一逻辑控制应该影响所有相关条件', async () => {
      await wrapper.setProps({ 
        type: 'unified-control',
        unifiedLogicControl: true,
        currentLogic: 'and'
      })
      
      const switchButton = wrapper.find('[data-testid="switch-logic-button"]')
      await switchButton.trigger('click')
      
      expect(wrapper.emitted('unified-logic-changed')).toBeTruthy()
      expect(wrapper.emitted('unified-logic-changed')[0]).toEqual(['or'])
    })

    test('应该支持树状结构逻辑显示', async () => {
      await wrapper.setProps({ 
        type: 'tree-structure',
        treeStructure: true 
      })
      
      const treeLogicDisplay = wrapper.find('[data-testid="tree-logic-display"]')
      expect(treeLogicDisplay.exists()).toBe(true)
      expect(treeLogicDisplay.classes()).toContain('tree-structure')
    })

    test('树状结构应该显示层级逻辑关系', async () => {
      await wrapper.setProps({ 
        type: 'tree-structure',
        treeStructure: true 
      })
      
      const hierarchyIndicators = wrapper.findAll('[data-testid="hierarchy-indicator"]')
      expect(hierarchyIndicators.length).toBeGreaterThan(0)
      
      hierarchyIndicators.forEach(indicator => {
        expect(indicator.classes()).toContain('hierarchy-level')
      })
    })

    test('应该支持水平布局的逻辑切换', async () => {
      await wrapper.setProps({ 
        type: 'horizontal-layout',
        layoutMode: 'horizontal' 
      })
      
      const horizontalSwitcher = wrapper.find('[data-testid="horizontal-logic-switcher"]')
      expect(horizontalSwitcher.exists()).toBe(true)
      expect(horizontalSwitcher.classes()).toContain('horizontal-layout')
    })

    test('水平布局下逻辑切换应该保持对齐', async () => {
      await wrapper.setProps({ 
        type: 'horizontal-layout',
        layoutMode: 'horizontal' 
      })
      
      const switchButton = wrapper.find('[data-testid="switch-logic-button"]')
      const buttonStyle = switchButton.attributes('style')
      
      expect(buttonStyle).toContain('display: inline-flex')
      expect(buttonStyle).toContain('align-items: center')
    })

    test('应该支持响应式逻辑切换器', async () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })
      
      await wrapper.setProps({ 
        responsiveLayout: true 
      })
      
      const responsiveSwitcher = wrapper.find('[data-testid="logic-switcher"]')
      expect(responsiveSwitcher.classes()).toContain('mobile-responsive')
    })

    test('移动端应该使用简化的逻辑切换界面', async () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      })
      
      await wrapper.setProps({ 
        responsiveLayout: true 
      })
      
      const mobileInterface = wrapper.find('[data-testid="mobile-logic-interface"]')
      expect(mobileInterface.exists()).toBe(true)
      expect(mobileInterface.classes()).toContain('mobile-simplified')
    })
  })

  describe('逻辑切换器样式', () => {
    test('且逻辑应该有正确的样式', () => {
      const switcher = wrapper.find('[data-testid="logic-switcher"]')
      expect(switcher.classes()).toContain('logic-and')
    })

    test('或逻辑应该有正确的样式', async () => {
      await wrapper.setProps({ currentLogic: 'or' })
      
      const switcher = wrapper.find('[data-testid="logic-switcher"]')
      expect(switcher.classes()).toContain('logic-or')
    })

    test('剔除逻辑应该有特殊样式', async () => {
      await wrapper.setProps({ type: 'exclude', currentLogic: 'exclude' })
      
      const switcher = wrapper.find('[data-testid="logic-switcher"]')
      expect(switcher.classes()).toContain('logic-exclude')
    })
  })
})

// 逻辑关系计算单元测试
describe('LogicRelationshipCalculation 逻辑关系计算', () => {
  describe('条件内逻辑计算', () => {
    test('且逻辑应该要求所有条件都满足', () => {
      const calculateConditionLogic = (conditions: any[], logic: string) => {
        if (logic === 'and') {
          return conditions.every(c => c.isValid && c.value)
        } else {
          return conditions.some(c => c.isValid && c.value)
        }
      }
      
      const andConditions = [
        { isValid: true, value: 'VIP' },
        { isValid: true, value: '活跃' }
      ]
      
      const mixedConditions = [
        { isValid: true, value: 'VIP' },
        { isValid: false, value: '' }
      ]
      
      expect(calculateConditionLogic(andConditions, 'and')).toBe(true)
      expect(calculateConditionLogic(mixedConditions, 'and')).toBe(false)
    })

    test('或逻辑应该只要有一个条件满足', () => {
      const calculateConditionLogic = (conditions: any[], logic: string) => {
        if (logic === 'and') {
          return conditions.every(c => c.isValid && c.value)
        } else {
          return conditions.some(c => c.isValid && c.value)
        }
      }
      
      const mixedConditions = [
        { isValid: true, value: 'VIP' },
        { isValid: false, value: '' }
      ]
      
      const invalidConditions = [
        { isValid: false, value: '' },
        { isValid: false, value: '' }
      ]
      
      expect(calculateConditionLogic(mixedConditions, 'or')).toBe(true)
      expect(calculateConditionLogic(invalidConditions, 'or')).toBe(false)
    })
  })

  describe('条件组间逻辑计算', () => {
    test('包含条件组且逻辑计算', () => {
      const calculateCrossGroupLogic = (groups: ConditionGroup[], logic: string) => {
        const validGroups = groups.filter(g => 
          !g.isExclude && g.conditions.length > 0 && g.conditions.every(c => c.isValid)
        )
        
        if (logic === 'and') {
          return validGroups.length === groups.filter(g => !g.isExclude).length
        } else {
          return validGroups.length > 0
        }
      }
      
      const includeGroups = mockConditionGroups.filter(g => !g.isExclude)
      expect(calculateCrossGroupLogic(includeGroups, 'and')).toBe(true)
      expect(calculateCrossGroupLogic(includeGroups, 'or')).toBe(true)
    })

    test('剔除条件组逻辑计算', () => {
      const calculateExcludeGroupLogic = (groups: ConditionGroup[], logic: string) => {
        const validExcludeGroups = groups.filter(g => 
          g.isExclude && g.conditions.length > 0 && g.conditions.every(c => c.isValid)
        )
        
        if (validExcludeGroups.length === 0) return false
        
        if (logic === 'and') {
          return validExcludeGroups.length === groups.filter(g => g.isExclude).length
        } else {
          return validExcludeGroups.length > 0
        }
      }
      
      const excludeGroups = mockConditionGroups.filter(g => g.isExclude)
      expect(calculateExcludeGroupLogic(excludeGroups, 'and')).toBe(true)
      expect(calculateExcludeGroupLogic(excludeGroups, 'or')).toBe(true)
    })
  })

  describe('复合逻辑计算', () => {
    test('应该正确计算包含+剔除的复合逻辑', () => {
      const calculateComplexLogic = (
        includeGroups: ConditionGroup[],
        excludeGroups: ConditionGroup[],
        crossLogic: string,
        excludeLogic: string
      ) => {
        // 计算包含条件组结果
        const includeResult = includeGroups.length > 0 && 
          (crossLogic === 'and' 
            ? includeGroups.every(g => g.conditions.every(c => c.isValid))
            : includeGroups.some(g => g.conditions.every(c => c.isValid))
          )
        
        // 如果包含条件不满足，直接返回false
        if (!includeResult) return false
        
        // 计算剔除条件组结果
        if (excludeGroups.length === 0) return includeResult
        
        const excludeResult = excludeLogic === 'and'
          ? excludeGroups.every(g => g.conditions.every(c => c.isValid))
          : excludeGroups.some(g => g.conditions.every(c => c.isValid))
        
        // 最终结果：包含 且 非剔除
        return includeResult && !excludeResult
      }
      
      const includeGroups = mockConditionGroups.filter(g => !g.isExclude)
      const excludeGroups = mockConditionGroups.filter(g => g.isExclude)
      
      expect(calculateComplexLogic(includeGroups, excludeGroups, 'and', 'and')).toBe(false)
      expect(calculateComplexLogic(includeGroups, [], 'and', 'and')).toBe(true)
    })

    test('应该处理空条件组的情况', () => {
      const calculateWithEmptyGroups = (includeGroups: ConditionGroup[], excludeGroups: ConditionGroup[]) => {
        if (includeGroups.length === 0) return false
        if (excludeGroups.length === 0) return true
        
        return includeGroups.some(g => g.conditions.length > 0) && 
               !excludeGroups.some(g => g.conditions.length > 0)
      }
      
      expect(calculateWithEmptyGroups([], [])).toBe(false)
      expect(calculateWithEmptyGroups([mockConditionGroups[0]], [])).toBe(true)
      expect(calculateWithEmptyGroups([], [mockConditionGroups[2]])).toBe(false)
    })
  })

  describe('逻辑表达式生成', () => {
    test('应该生成正确的SQL WHERE子句', () => {
      const generateSQLWhere = (groups: ConditionGroup[], crossLogic: string) => {
        const includeGroups = groups.filter(g => !g.isExclude)
        const excludeGroups = groups.filter(g => g.isExclude)
        
        let whereClause = ''
        
        if (includeGroups.length > 0) {
          const includeConditions = includeGroups.map(g => 
            `(${g.conditions.map(c => `${c.type} ${c.operator} '${c.value}'`).join(` ${g.logic} `)})`
          )
          whereClause = includeConditions.join(` ${crossLogic} `)
        }
        
        if (excludeGroups.length > 0) {
          const excludeConditions = excludeGroups.map(g => 
            `(${g.conditions.map(c => `${c.type} ${c.operator} '${c.value}'`).join(` ${g.logic} `)})`
          )
          whereClause += ` AND NOT (${excludeConditions.join(' OR ')})`
        }
        
        return whereClause
      }
      
      const sqlWhere = generateSQLWhere(mockConditionGroups, 'and')
      expect(sqlWhere).toContain('tag equals \'VIP\'')
      expect(sqlWhere).toContain('AND NOT')
      expect(sqlWhere).toContain('tag equals \'流失客户\'')
    })

    test('应该生成人类可读的逻辑描述', () => {
      const generateHumanReadableLogic = (groups: ConditionGroup[], crossLogic: string) => {
        const includeGroups = groups.filter(g => !g.isExclude)
        const excludeGroups = groups.filter(g => g.isExclude)
        
        let description = ''
        
        if (includeGroups.length > 0) {
          const includeDesc = includeGroups.map(g => g.name).join(crossLogic === 'and' ? ' 且 ' : ' 或 ')
          description = `满足 ${includeDesc}`
        }
        
        if (excludeGroups.length > 0) {
          const excludeDesc = excludeGroups.map(g => g.name).join(' 或 ')
          description += ` 但不满足 ${excludeDesc}`
        }
        
        return description
      }
      
      const description = generateHumanReadableLogic(mockConditionGroups, 'and')
      expect(description).toContain('满足 包含条件组1 且 包含条件组2')
      expect(description).toContain('但不满足 剔除条件组1')
    })
  })
})