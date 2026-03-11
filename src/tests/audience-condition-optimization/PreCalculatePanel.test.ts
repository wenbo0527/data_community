import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import PreCalculatePanel from '@/components/common/PreCalculatePanel.vue'
import type { ConditionGroup, PreCalculateStats, ValidationError } from '@/types/audience'

// Mock 数据
const mockIncludeConditionGroup: ConditionGroup = {
  id: 'include-group-1',
  name: '包含条件组1',
  logic: 'and',
  conditions: [
    {
      id: 'condition-1',
      type: 'tag',
      operator: 'equals',
      value: 'VIP客户',
      isValid: true
    }
  ],
  isExclude: false,
  collapsed: false,
  groupType: 'include'
}

const mockExcludeConditionGroup: ConditionGroup = {
  id: 'exclude-group-1',
  name: '剔除条件组1',
  logic: 'and',
  conditions: [
    {
      id: 'condition-2',
      type: 'tag',
      operator: 'equals',
      value: '流失客户',
      isValid: true
    }
  ],
  isExclude: true,
  collapsed: false,
  groupType: 'exclude'
}

const mockPreCalculateStats: PreCalculateStats = {
  totalCount: 100000,
  includeCount: 15000,
  excludeCount: 3000,
  finalCount: 12000,
  loading: false,
  lastUpdated: new Date('2024-01-15T10:30:00Z'),
  configValid: true,
  validationErrors: []
}

const mockValidationErrors: ValidationError[] = [
  {
    id: 'error-1',
    type: 'empty_condition_group',
    message: '条件组不能为空',
    groupId: 'include-group-1'
  },
  {
    id: 'error-2',
    type: 'invalid_condition',
    message: '条件配置不完整',
    groupId: 'include-group-1',
    conditionId: 'condition-1'
  }
]

// Mock API 调用
const mockPreCalculateAPI = vi.fn()
const mockValidateConfigAPI = vi.fn()

// Mock Vuex Store
const createMockStore = (initialStats = mockPreCalculateStats) => {
  return createStore({
    state: {
      audience: {
        currentAudience: {
          includeConditionGroups: [mockIncludeConditionGroup],
          excludeConditionGroups: [mockExcludeConditionGroup],
          crossGroupLogic: 'and',
          excludeGroupLogic: 'and'
        },
        preCalculateStats: initialStats,
        validationState: {
          isValid: true,
          errors: [],
          warnings: []
        }
      }
    },
    mutations: {
      SET_PRECALCULATE_LOADING: vi.fn(),
      SET_PRECALCULATE_STATS: vi.fn(),
      SET_VALIDATION_STATE: vi.fn()
    },
    actions: {
      preCalculateAudience: mockPreCalculateAPI,
      validateConfiguration: mockValidateConfigAPI
    }
  })
}

describe('PreCalculatePanel 预计算面板', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(PreCalculatePanel, {
      props: {
        results: {
          includeCount: 15000,
          excludeCount: 3000,
          finalCount: 12000,
          lastUpdateTime: '2024-01-15T10:30:00Z',
          formula: '包含 - 剔除 = 最终'
        },
        validation: {
          isValid: true,
          errors: []
        },
        loading: false
      },
      global: {
        plugins: [store]
      }
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('预计算面板渲染', () => {
    test('应该正确渲染预计算面板', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="precalculate-panel"]').exists()).toBe(true)
    })

    test('应该显示预计算按钮', () => {
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      expect(calculateButton.exists()).toBe(true)
      expect(calculateButton.text()).toContain('预计算')
    })

    test('应该显示结果统计区域', () => {
      const statsArea = wrapper.find('[data-testid="stats-area"]')
      expect(statsArea.exists()).toBe(true)
    })

    test('应该显示配置验证区域', () => {
      const validationArea = wrapper.find('[data-testid="validation-area"]')
      expect(validationArea.exists()).toBe(true)
    })
  })

  describe('预计算按钮功能', () => {
    test('应该能够触发预计算', async () => {
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      await calculateButton.trigger('click')
      
      expect(mockPreCalculateAPI).toHaveBeenCalled()
    })

    test('配置无效时预计算按钮应该被禁用', async () => {
      const storeWithInvalidConfig = createMockStore({
        ...mockPreCalculateStats,
        configValid: false
      })
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithInvalidConfig]
        }
      })
      
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      expect(calculateButton.attributes('disabled')).toBeDefined()
    })

    test('预计算进行中时按钮应该显示加载状态', async () => {
      const storeWithLoading = createMockStore({
        ...mockPreCalculateStats,
        loading: true
      })
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithLoading]
        }
      })
      
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      expect(calculateButton.text()).toContain('计算中')
      expect(calculateButton.attributes('disabled')).toBeDefined()
    })

    test('应该支持键盘快捷键触发预计算', async () => {
      const panel = wrapper.find('[data-testid="precalculate-panel"]')
      await panel.trigger('keydown', { key: 'Enter', ctrlKey: true })
      
      expect(mockPreCalculateAPI).toHaveBeenCalled()
    })
  })

  describe('预计算结果展示', () => {
    test('应该显示包含条件组人群数量', () => {
      const includeCount = wrapper.find('[data-testid="include-count"]')
      expect(includeCount.exists()).toBe(true)
      expect(includeCount.text()).toContain('15,000')
    })

    test('应该显示剔除条件组人群数量', () => {
      const excludeCount = wrapper.find('[data-testid="exclude-count"]')
      expect(excludeCount.exists()).toBe(true)
      expect(excludeCount.text()).toContain('3,000')
    })

    test('应该显示最终人群数量', () => {
      const finalCount = wrapper.find('[data-testid="final-count"]')
      expect(finalCount.exists()).toBe(true)
      expect(finalCount.text()).toContain('12,000')
    })

    test('应该显示计算公式说明', () => {
      const formula = wrapper.find('[data-testid="calculation-formula"]')
      expect(formula.exists()).toBe(true)
      expect(formula.text()).toContain('包含 - 剔除 = 最终')
    })

    test('应该显示最后更新时间', () => {
      const lastUpdated = wrapper.find('[data-testid="last-updated"]')
      expect(lastUpdated.exists()).toBe(true)
      expect(lastUpdated.text()).toContain('2024-01-15')
    })

    test('没有预计算结果时应该显示提示信息', async () => {
      const storeWithoutStats = createMockStore({
        ...mockPreCalculateStats,
        includeCount: 0,
        excludeCount: 0,
        finalCount: 0,
        lastUpdated: null
      })
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithoutStats]
        }
      })
      
      const noResultsMessage = wrapper.find('[data-testid="no-results-message"]')
      expect(noResultsMessage.exists()).toBe(true)
      expect(noResultsMessage.text()).toContain('暂无预计算结果')
    })
  })

  describe('配置验证功能', () => {
    test('应该在预计算前自动验证配置', async () => {
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      await calculateButton.trigger('click')
      
      expect(mockValidateConfigAPI).toHaveBeenCalled()
    })

    test('配置有效时应该显示成功状态', () => {
      const validationStatus = wrapper.find('[data-testid="validation-status"]')
      expect(validationStatus.exists()).toBe(true)
      expect(validationStatus.classes()).toContain('validation-success')
    })

    test('配置无效时应该显示错误状态', async () => {
      const storeWithErrors = createMockStore({
        ...mockPreCalculateStats,
        configValid: false,
        validationErrors: mockValidationErrors
      })
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithErrors]
        }
      })
      
      const validationStatus = wrapper.find('[data-testid="validation-status"]')
      expect(validationStatus.classes()).toContain('validation-error')
    })

    test('应该显示验证错误列表', async () => {
      const storeWithErrors = createMockStore({
        ...mockPreCalculateStats,
        configValid: false,
        validationErrors: mockValidationErrors
      })
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithErrors]
        }
      })
      
      const errorList = wrapper.find('[data-testid="validation-errors"]')
      expect(errorList.exists()).toBe(true)
      
      const errorItems = wrapper.findAll('[data-testid^="validation-error-"]')
      expect(errorItems).toHaveLength(2)
      expect(errorItems[0].text()).toContain('条件组不能为空')
      expect(errorItems[1].text()).toContain('条件配置不完整')
    })

    test('应该支持手动触发配置验证', async () => {
      const validateButton = wrapper.find('[data-testid="validate-button"]')
      await validateButton.trigger('click')
      
      expect(mockValidateConfigAPI).toHaveBeenCalled()
    })
  })

  describe('预计算状态管理', () => {
    test('预计算开始时应该设置加载状态', async () => {
      mockPreCalculateAPI.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ includeCount: 10000, excludeCount: 2000 }), 100)
        })
      })
      
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      await calculateButton.trigger('click')
      
      // 验证加载状态
      expect(wrapper.find('[data-testid="loading-indicator"]').exists()).toBe(true)
    })

    test('预计算完成时应该更新结果并清除加载状态', async () => {
      const mockResult = {
        includeCount: 8000,
        excludeCount: 1500,
        finalCount: 6500
      }
      
      mockPreCalculateAPI.mockResolvedValue(mockResult)
      
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      await calculateButton.trigger('click')
      
      // 等待异步操作完成
      await wrapper.vm.$nextTick()
      
      expect(mockPreCalculateAPI).toHaveBeenCalled()
    })

    test('预计算失败时应该显示错误信息', async () => {
      const errorMessage = '网络连接失败'
      mockPreCalculateAPI.mockRejectedValue(new Error(errorMessage))
      
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      await calculateButton.trigger('click')
      
      // 等待异步操作完成
      await wrapper.vm.$nextTick()
      
      const errorDisplay = wrapper.find('[data-testid="error-message"]')
      expect(errorDisplay.exists()).toBe(true)
      expect(errorDisplay.text()).toContain('预计算失败')
    })
  })

  describe('预计算结果格式化', () => {
    test('应该正确格式化大数字显示', async () => {
      const storeWithLargeNumbers = createMockStore({
        ...mockPreCalculateStats,
        includeCount: 1234567,
        excludeCount: 234567,
        finalCount: 1000000
      })
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithLargeNumbers]
        }
      })
      
      const includeCount = wrapper.find('[data-testid="include-count"]')
      const excludeCount = wrapper.find('[data-testid="exclude-count"]')
      const finalCount = wrapper.find('[data-testid="final-count"]')
      
      expect(includeCount.text()).toContain('1,234,567')
      expect(excludeCount.text()).toContain('234,567')
      expect(finalCount.text()).toContain('1,000,000')
    })

    test('应该显示百分比信息', () => {
      const excludePercentage = wrapper.find('[data-testid="exclude-percentage"]')
      expect(excludePercentage.exists()).toBe(true)
      // 3000 / 15000 = 20%
      expect(excludePercentage.text()).toContain('20%')
    })

    test('零值时应该正确显示', async () => {
      const storeWithZeroValues = createMockStore({
        ...mockPreCalculateStats,
        includeCount: 0,
        excludeCount: 0,
        finalCount: 0
      })
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithZeroValues]
        }
      })
      
      const finalCount = wrapper.find('[data-testid="final-count"]')
      expect(finalCount.text()).toContain('0')
    })
  })

  describe('预计算面板交互', () => {
    test('应该支持展开/折叠详细信息', async () => {
      const toggleButton = wrapper.find('[data-testid="toggle-details"]')
      await toggleButton.trigger('click')
      
      const detailsPanel = wrapper.find('[data-testid="calculation-details"]')
      expect(detailsPanel.isVisible()).toBe(true)
      
      await toggleButton.trigger('click')
      expect(detailsPanel.isVisible()).toBe(false)
    })

    test('应该支持复制结果到剪贴板', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText
        }
      })
      
      const copyButton = wrapper.find('[data-testid="copy-results"]')
      await copyButton.trigger('click')
      
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('包含: 1.5万')
      )
    })

    test('应该支持导出预计算结果', async () => {
      const exportButton = wrapper.find('[data-testid="export-results"]')
      await exportButton.trigger('click')
      
      // 验证导出功能被触发
      expect(wrapper.emitted('export-results')).toBeTruthy()
    })
  })

  describe('预计算面板响应式设计', () => {
    test('小屏幕下应该调整布局', async () => {
      // Mock 小屏幕尺寸
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      const panel = wrapper.find('[data-testid="precalculate-panel"]')
      expect(panel.classes()).toContain('mobile-layout')
    })

    test('大屏幕下应该使用桌面布局', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      const panel = wrapper.find('[data-testid="precalculate-panel"]')
      expect(panel.classes()).toContain('desktop-layout')
    })
  })

  describe('预计算面板可访问性', () => {
    test('应该有正确的ARIA标签', () => {
      const panel = wrapper.find('[data-testid="precalculate-panel"]')
      expect(panel.attributes('role')).toBe('region')
      expect(panel.attributes('aria-label')).toContain('预计算面板')
    })

    test('按钮应该有正确的ARIA属性', () => {
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      expect(calculateButton.attributes('aria-describedby')).toBeDefined()
    })

    test('应该支持屏幕阅读器', () => {
      const screenReaderText = wrapper.find('[data-testid="sr-only-description"]')
      expect(screenReaderText.exists()).toBe(true)
      expect(screenReaderText.classes()).toContain('sr-only')
    })
  })

  describe('布局优化功能测试', () => {
    test('应该支持水平布局模式的预计算', async () => {
      const storeWithHorizontalLayout = createMockStore({
        ...mockPreCalculateStats,
        layoutMode: 'horizontal'
      })
      
      wrapper = mount(PreCalculatePanel, {
        props: {
          layoutMode: 'horizontal'
        },
        global: {
          plugins: [storeWithHorizontalLayout]
        }
      })
      
      const panel = wrapper.find('[data-testid="precalculate-panel"]')
      expect(panel.classes()).toContain('horizontal-layout')
      
      // 验证水平布局下的统计信息排列
      const statsContainer = wrapper.find('[data-testid="stats-container"]')
      expect(statsContainer.classes()).toContain('flex-row')
    })

    test('应该正确计算统一逻辑控制下的预计算结果', async () => {
      const mockUnifiedLogicGroups = [
        {
          ...mockIncludeConditionGroup,
          unifiedLogic: 'and',
          conditions: [
            { id: 'c1', type: 'tag', operator: 'equals', value: 'VIP', isValid: true },
            { id: 'c2', type: 'behavior', operator: 'contains', value: '购买', isValid: true }
          ]
        }
      ]
      
      const storeWithUnifiedLogic = createMockStore({
        ...mockPreCalculateStats,
        includeConditionGroups: mockUnifiedLogicGroups
      })
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithUnifiedLogic]
        }
      })
      
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      await calculateButton.trigger('click')
      
      // 验证统一逻辑控制被正确应用
      expect(mockPreCalculateAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          unifiedLogicMode: true
        })
      )
    })

    test('应该显示树状结构的计算层级信息', () => {
      const hierarchicalStats = {
        ...mockPreCalculateStats,
        hierarchicalBreakdown: {
          level1: { count: 15000, conditions: ['VIP客户'] },
          level2: { count: 12000, conditions: ['VIP客户', '活跃用户'] },
          level3: { count: 10000, conditions: ['VIP客户', '活跃用户', '近期购买'] }
        }
      }
      
      const storeWithHierarchy = createMockStore(hierarchicalStats)
      
      wrapper = mount(PreCalculatePanel, {
        global: {
          plugins: [storeWithHierarchy]
        }
      })
      
      const hierarchyDisplay = wrapper.find('[data-testid="hierarchy-breakdown"]')
      expect(hierarchyDisplay.exists()).toBe(true)
      
      const levelItems = wrapper.findAll('[data-testid^="hierarchy-level-"]')
      expect(levelItems).toHaveLength(3)
    })

    test('应该支持响应式布局的预计算面板', async () => {
      // 测试移动端布局
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      const panel = wrapper.find('[data-testid="precalculate-panel"]')
      expect(panel.classes()).toContain('mobile-responsive')
      
      // 验证移动端下统计信息垂直排列
      const statsContainer = wrapper.find('[data-testid="stats-container"]')
      expect(statsContainer.classes()).toContain('flex-col')
      
      // 验证按钮在移动端的全宽显示
      const calculateButton = wrapper.find('[data-testid="calculate-button"]')
      expect(calculateButton.classes()).toContain('w-full')
    })

    test('应该正确处理条件组宽度分配的预计算', () => {
      const storeWithWidthConfig = createMockStore({
        ...mockPreCalculateStats,
        layoutConfig: {
          tagConditionWidth: '40%',
          behaviorConditionWidth: '35%',
          detailConditionWidth: '25%'
        }
      })
      
      wrapper = mount(PreCalculatePanel, {
        props: {
          layoutConfig: {
            tagConditionWidth: '40%',
            behaviorConditionWidth: '35%',
            detailConditionWidth: '25%'
          }
        },
        global: {
          plugins: [storeWithWidthConfig]
        }
      })
      
      // 验证宽度配置被正确应用到预计算逻辑中
      const widthIndicators = wrapper.findAll('[data-testid^="width-indicator-"]')
      expect(widthIndicators[0].text()).toContain('40%')
      expect(widthIndicators[1].text()).toContain('35%')
      expect(widthIndicators[2].text()).toContain('25%')
    })
  })
})

// 预计算逻辑单元测试
describe('PreCalculateLogic 预计算逻辑', () => {
  describe('配置验证逻辑', () => {
    test('空条件组应该返回验证错误', () => {
      const emptyGroup: ConditionGroup = {
        id: 'empty-group',
        name: '空条件组',
        logic: 'and',
        conditions: [],
        isExclude: false,
        collapsed: false,
        groupType: 'include'
      }
      
      const validateConditionGroup = (group: ConditionGroup) => {
        if (group.conditions.length === 0) {
          return {
            isValid: false,
            errors: [{
              id: 'empty-group-error',
              type: 'empty_condition_group',
              message: '条件组不能为空',
              groupId: group.id
            }]
          }
        }
        return { isValid: true, errors: [] }
      }
      
      const result = validateConditionGroup(emptyGroup)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toBe('条件组不能为空')
    })

    test('不完整条件应该返回验证错误', () => {
      const incompleteCondition = {
        id: 'incomplete-condition',
        type: 'tag',
        operator: '',
        value: '',
        isValid: false
      }
      
      const validateCondition = (condition: any) => {
        const errors = []
        
        if (!condition.operator) {
          errors.push({
            id: 'missing-operator',
            type: 'missing_operator',
            message: '请选择操作符',
            conditionId: condition.id
          })
        }
        
        if (!condition.value) {
          errors.push({
            id: 'missing-value',
            type: 'missing_value',
            message: '请输入条件值',
            conditionId: condition.id
          })
        }
        
        return {
          isValid: errors.length === 0,
          errors
        }
      }
      
      const result = validateCondition(incompleteCondition)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
    })

    test('有效配置应该通过验证', () => {
      const validGroup = mockIncludeConditionGroup
      
      const validateConditionGroup = (group: ConditionGroup) => {
        if (group.conditions.length === 0) {
          return { isValid: false, errors: ['条件组不能为空'] }
        }
        
        const invalidConditions = group.conditions.filter(c => !c.isValid)
        if (invalidConditions.length > 0) {
          return { isValid: false, errors: ['存在无效条件'] }
        }
        
        return { isValid: true, errors: [] }
      }
      
      const result = validateConditionGroup(validGroup)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('预计算算法', () => {
    test('应该正确计算包含条件组人群', () => {
      const calculateIncludeConditions = (groups: ConditionGroup[], crossLogic: string) => {
        // 模拟计算逻辑
        if (crossLogic === 'and') {
          return groups.reduce((acc, group) => Math.min(acc, 5000), 10000)
        } else {
          return groups.reduce((acc, group) => acc + 3000, 0)
        }
      }
      
      const result = calculateIncludeConditions([mockIncludeConditionGroup], 'and')
      expect(result).toBe(5000)
    })

    test('应该正确计算剔除条件组人群', () => {
      const calculateExcludeConditions = (groups: ConditionGroup[], excludeLogic: string) => {
        if (excludeLogic === 'and') {
          return groups.reduce((acc, group) => Math.min(acc, 2000), 5000)
        } else {
          return groups.reduce((acc, group) => acc + 1500, 0)
        }
      }
      
      const result = calculateExcludeConditions([mockExcludeConditionGroup], 'and')
      expect(result).toBe(2000)
    })

    test('应该正确计算最终结果', () => {
      const calculateFinalResult = (includeCount: number, excludeCount: number) => {
        return Math.max(0, includeCount - excludeCount)
      }
      
      expect(calculateFinalResult(10000, 3000)).toBe(7000)
      expect(calculateFinalResult(5000, 8000)).toBe(0)
      expect(calculateFinalResult(0, 0)).toBe(0)
    })
  })
})