import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import ConfigurationValidator from '@/components/audience/ConfigurationValidator.vue'
import ConditionFormValidator from '@/components/audience/ConditionFormValidator.vue'
import type { ConditionGroup, Condition, ValidationResult, ValidationRule } from '@/types/audience'

// Mock 数据
const mockValidCondition: Condition = {
  id: 'c1',
  type: 'tag',
  dataSource: 'user_tags',
  field: 'vip_level',
  aggregation: 'none',
  operator: 'equals',
  value: 'VIP',
  isValid: true,
  logic: 'and'
}

const mockInvalidCondition: Condition = {
  id: 'c2',
  type: 'behavior',
  dataSource: '',
  field: '',
  aggregation: 'count',
  operator: 'greater_than',
  value: '',
  isValid: false,
  logic: 'and'
}

const mockValidConditionGroup: ConditionGroup = {
  id: 'group-1',
  name: '有效条件组',
  logic: 'and',
  conditions: [mockValidCondition],
  isExclude: false,
  collapsed: false,
  groupType: 'include'
}

const mockInvalidConditionGroup: ConditionGroup = {
  id: 'group-2',
  name: '无效条件组',
  logic: 'and',
  conditions: [mockInvalidCondition],
  isExclude: false,
  collapsed: false,
  groupType: 'include'
}

const mockEmptyConditionGroup: ConditionGroup = {
  id: 'group-3',
  name: '空条件组',
  logic: 'and',
  conditions: [],
  isExclude: false,
  collapsed: false,
  groupType: 'include'
}

// Mock 验证规则
const mockValidationRules: ValidationRule[] = [
  {
    id: 'required-datasource',
    field: 'dataSource',
    type: 'required',
    message: '请选择数据源',
    priority: 'error'
  },
  {
    id: 'required-field',
    field: 'field',
    type: 'required',
    message: '请选择字段',
    priority: 'error'
  },
  {
    id: 'required-operator',
    field: 'operator',
    type: 'required',
    message: '请选择操作符',
    priority: 'error'
  },
  {
    id: 'required-value',
    field: 'value',
    type: 'conditional',
    condition: (condition: Condition) => ['equals', 'not_equals', 'contains'].includes(condition.operator),
    message: '请输入值',
    priority: 'error'
  },
  {
    id: 'numeric-value',
    field: 'value',
    type: 'format',
    condition: (condition: Condition) => ['greater_than', 'less_than'].includes(condition.operator),
    validator: (value: string) => !isNaN(Number(value)),
    message: '请输入有效的数字',
    priority: 'error'
  },
  {
    id: 'min-conditions',
    field: 'conditions',
    type: 'array',
    validator: (conditions: Condition[]) => conditions.length > 0,
    message: '条件组至少需要一个条件',
    priority: 'warning'
  }
]

// Mock Vuex Store
const createMockStore = () => {
  return createStore({
    state: {
      audience: {
        currentAudience: {
          includeConditionGroups: [mockValidConditionGroup, mockInvalidConditionGroup],
          excludeConditionGroups: [],
          validationRules: mockValidationRules,
          validationResults: []
        }
      }
    },
    mutations: {
      UPDATE_VALIDATION_RESULTS: vi.fn(),
      UPDATE_CONDITION_VALIDITY: vi.fn()
    },
    actions: {
      validateConfiguration: vi.fn(),
      validateCondition: vi.fn(),
      validateConditionGroup: vi.fn()
    }
  })
}

describe('ConfigurationValidator 配置验证器', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(ConfigurationValidator, {
      global: {
        plugins: [store]
      },
      props: {
        conditionGroups: [mockValidConditionGroup, mockInvalidConditionGroup, mockEmptyConditionGroup],
        validationRules: mockValidationRules,
        autoValidate: true
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('配置验证器渲染', () => {
    test('应该正确渲染配置验证器', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="configuration-validator"]').exists()).toBe(true)
    })

    test('应该显示验证状态指示器', () => {
      const statusIndicator = wrapper.find('[data-testid="validation-status"]')
      expect(statusIndicator.exists()).toBe(true)
    })

    test('应该显示验证按钮', () => {
      const validateButton = wrapper.find('[data-testid="validate-button"]')
      expect(validateButton.exists()).toBe(true)
    })

    test('应该显示验证结果面板', () => {
      const resultsPanel = wrapper.find('[data-testid="validation-results"]')
      expect(resultsPanel.exists()).toBe(true)
    })
  })

  describe('自动验证功能', () => {
    test('启用自动验证时应该自动触发验证', async () => {
      await wrapper.setProps({ autoValidate: true })
      
      // 模拟条件变化
      await wrapper.vm.$nextTick()
      
      expect(store.dispatch).toHaveBeenCalledWith('validateConfiguration')
    })

    test('禁用自动验证时不应该自动触发验证', async () => {
      await wrapper.setProps({ autoValidate: false })
      
      // 重置mock
      store.dispatch.mockClear()
      
      // 模拟条件变化
      await wrapper.vm.$nextTick()
      
      expect(store.dispatch).not.toHaveBeenCalledWith('validateConfiguration')
    })

    test('条件组变化时应该触发自动验证', async () => {
      const newConditionGroups = [...wrapper.props('conditionGroups'), mockValidConditionGroup]
      await wrapper.setProps({ conditionGroups: newConditionGroups })
      
      expect(store.dispatch).toHaveBeenCalledWith('validateConfiguration')
    })
  })

  describe('手动验证功能', () => {
    test('点击验证按钮应该触发验证', async () => {
      const validateButton = wrapper.find('[data-testid="validate-button"]')
      await validateButton.trigger('click')
      
      expect(store.dispatch).toHaveBeenCalledWith('validateConfiguration')
      expect(wrapper.emitted('validation-triggered')).toBeTruthy()
    })

    test('验证过程中按钮应该显示加载状态', async () => {
      // 模拟验证中状态
      await wrapper.setData({ isValidating: true })
      
      const validateButton = wrapper.find('[data-testid="validate-button"]')
      expect(validateButton.classes()).toContain('loading')
      expect(validateButton.attributes('disabled')).toBeDefined()
    })

    test('应该支持键盘快捷键触发验证', async () => {
      await wrapper.trigger('keydown', { key: 'F5', ctrlKey: true })
      
      expect(store.dispatch).toHaveBeenCalledWith('validateConfiguration')
    })
  })

  describe('验证结果展示', () => {
    test('应该显示验证成功状态', async () => {
      await wrapper.setData({ 
        validationResults: [],
        isValid: true 
      })
      
      const statusIndicator = wrapper.find('[data-testid="validation-status"]')
      expect(statusIndicator.classes()).toContain('success')
      expect(statusIndicator.text()).toContain('验证通过')
    })

    test('应该显示验证错误状态', async () => {
      const errorResults = [
        {
          id: 'error-1',
          type: 'error',
          message: '数据源不能为空',
          field: 'dataSource',
          conditionId: 'c2'
        }
      ]
      
      await wrapper.setData({ 
        validationResults: errorResults,
        isValid: false 
      })
      
      const statusIndicator = wrapper.find('[data-testid="validation-status"]')
      expect(statusIndicator.classes()).toContain('error')
      expect(statusIndicator.text()).toContain('验证失败')
    })

    test('应该显示验证警告状态', async () => {
      const warningResults = [
        {
          id: 'warning-1',
          type: 'warning',
          message: '条件组至少需要一个条件',
          field: 'conditions',
          groupId: 'group-3'
        }
      ]
      
      await wrapper.setData({ 
        validationResults: warningResults,
        isValid: true 
      })
      
      const statusIndicator = wrapper.find('[data-testid="validation-status"]')
      expect(statusIndicator.classes()).toContain('warning')
    })

    test('应该显示错误和警告的数量统计', async () => {
      const mixedResults = [
        { id: '1', type: 'error', message: '错误1' },
        { id: '2', type: 'error', message: '错误2' },
        { id: '3', type: 'warning', message: '警告1' }
      ]
      
      await wrapper.setData({ validationResults: mixedResults })
      
      const errorCount = wrapper.find('[data-testid="error-count"]')
      const warningCount = wrapper.find('[data-testid="warning-count"]')
      
      expect(errorCount.text()).toBe('2')
      expect(warningCount.text()).toBe('1')
    })
  })

  describe('验证结果详情', () => {
    test('应该显示详细的错误列表', async () => {
      const errorResults = [
        {
          id: 'error-1',
          type: 'error',
          message: '数据源不能为空',
          field: 'dataSource',
          conditionId: 'c2',
          groupId: 'group-2'
        },
        {
          id: 'error-2',
          type: 'error',
          message: '字段不能为空',
          field: 'field',
          conditionId: 'c2',
          groupId: 'group-2'
        }
      ]
      
      await wrapper.setData({ validationResults: errorResults })
      
      const errorList = wrapper.findAll('[data-testid^="error-item-"]')
      expect(errorList).toHaveLength(2)
      
      expect(errorList[0].text()).toContain('数据源不能为空')
      expect(errorList[1].text()).toContain('字段不能为空')
    })

    test('点击错误项应该定位到对应的条件', async () => {
      const errorResults = [
        {
          id: 'error-1',
          type: 'error',
          message: '数据源不能为空',
          field: 'dataSource',
          conditionId: 'c2',
          groupId: 'group-2'
        }
      ]
      
      await wrapper.setData({ validationResults: errorResults })
      
      const errorItem = wrapper.find('[data-testid="error-item-error-1"]')
      await errorItem.trigger('click')
      
      expect(wrapper.emitted('navigate-to-condition')).toBeTruthy()
      expect(wrapper.emitted('navigate-to-condition')[0]).toEqual(['c2', 'group-2'])
    })

    test('应该支持按类型筛选验证结果', async () => {
      const mixedResults = [
        { id: '1', type: 'error', message: '错误1' },
        { id: '2', type: 'warning', message: '警告1' }
      ]
      
      await wrapper.setData({ validationResults: mixedResults })
      
      // 筛选只显示错误
      const errorFilter = wrapper.find('[data-testid="filter-errors"]')
      await errorFilter.trigger('click')
      
      const visibleItems = wrapper.findAll('[data-testid^="result-item-"]:not(.hidden)')
      expect(visibleItems).toHaveLength(1)
      expect(visibleItems[0].text()).toContain('错误1')
    })
  })

  describe('实时验证反馈', () => {
    test('条件输入时应该提供实时验证反馈', async () => {
      // 模拟条件输入变化
      await wrapper.vm.validateConditionRealtime(mockInvalidCondition)
      
      expect(wrapper.vm.realtimeErrors).toContain('数据源不能为空')
    })

    test('应该在条件旁边显示验证图标', async () => {
      await wrapper.setData({ 
        conditionValidationStates: {
          'c1': { isValid: true, errors: [] },
          'c2': { isValid: false, errors: ['数据源不能为空'] }
        }
      })
      
      const validIcon = wrapper.find('[data-testid="condition-valid-c1"]')
      const invalidIcon = wrapper.find('[data-testid="condition-invalid-c2"]')
      
      expect(validIcon.exists()).toBe(true)
      expect(validIcon.classes()).toContain('success-icon')
      expect(invalidIcon.exists()).toBe(true)
      expect(invalidIcon.classes()).toContain('error-icon')
    })

    test('悬停验证图标应该显示详细错误信息', async () => {
      await wrapper.setData({ 
        conditionValidationStates: {
          'c2': { isValid: false, errors: ['数据源不能为空', '字段不能为空'] }
        }
      })
      
      const invalidIcon = wrapper.find('[data-testid="condition-invalid-c2"]')
      await invalidIcon.trigger('mouseenter')
      
      const tooltip = wrapper.find('[data-testid="validation-tooltip-c2"]')
      expect(tooltip.exists()).toBe(true)
      expect(tooltip.text()).toContain('数据源不能为空')
      expect(tooltip.text()).toContain('字段不能为空')
    })
  })

  describe('批量验证功能', () => {
    test('应该支持批量验证所有条件组', async () => {
      const batchValidateButton = wrapper.find('[data-testid="batch-validate-button"]')
      await batchValidateButton.trigger('click')
      
      expect(store.dispatch).toHaveBeenCalledWith('validateConfiguration', {
        groups: wrapper.props('conditionGroups'),
        mode: 'batch'
      })
    })

    test('批量验证应该显示进度条', async () => {
      await wrapper.setData({ isBatchValidating: true, validationProgress: 60 })
      
      const progressBar = wrapper.find('[data-testid="validation-progress"]')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('value')).toBe('60')
    })

    test('应该支持取消批量验证', async () => {
      await wrapper.setData({ isBatchValidating: true })
      
      const cancelButton = wrapper.find('[data-testid="cancel-validation-button"]')
      await cancelButton.trigger('click')
      
      expect(wrapper.vm.isBatchValidating).toBe(false)
      expect(wrapper.emitted('validation-cancelled')).toBeTruthy()
    })
  })

  describe('验证规则配置', () => {
    test('应该支持自定义验证规则', async () => {
      const customRules = [
        ...mockValidationRules,
        {
          id: 'custom-rule',
          field: 'value',
          type: 'custom',
          validator: (value: string) => value.length >= 3,
          message: '值长度至少为3个字符',
          priority: 'warning'
        }
      ]
      
      await wrapper.setProps({ validationRules: customRules })
      
      expect(wrapper.vm.validationRules).toHaveLength(7)
    })

    test('应该验证水平布局下的条件配置', async () => {
      const horizontalLayoutCondition = {
        ...mockValidCondition,
        layout: 'horizontal'
      }
      
      await wrapper.setProps({ condition: horizontalLayoutCondition })
      
      const validationResult = await wrapper.vm.validateCondition(horizontalLayoutCondition)
      expect(validationResult.isValid).toBe(true)
    })

    test('应该验证统一逻辑控制的条件组', async () => {
      const unifiedLogicGroup = {
        id: 'group-1',
        logic: 'and',
        conditions: [
          mockValidCondition,
          { ...mockValidCondition, id: 'c2' }
        ]
      }
      
      const validationResult = await wrapper.vm.validateConditionGroup(unifiedLogicGroup)
      expect(validationResult.isValid).toBe(true)
      expect(validationResult.logicConsistency).toBe(true)
    })

    test('应该支持禁用特定验证规则', async () => {
      const rulesWithDisabled = mockValidationRules.map(rule => ({
        ...rule,
        disabled: rule.id === 'required-value'
      }))
      
      await wrapper.setProps({ validationRules: rulesWithDisabled })
      
      const activeRules = wrapper.vm.getActiveValidationRules()
      expect(activeRules.find(r => r.id === 'required-value')).toBeUndefined()
    })

    test('应该支持验证规则优先级排序', () => {
      const sortedRules = wrapper.vm.sortRulesByPriority(mockValidationRules)
      
      // 错误级别应该排在前面
      expect(sortedRules[0].priority).toBe('error')
    })

    test('应该验证树状结构的条件层级', async () => {
      const treeStructureGroup = {
        id: 'group-1',
        type: 'tag',
        logic: 'and',
        conditions: [
          { id: 'c1', level: 1, parentId: null },
          { id: 'c2', level: 1, parentId: null },
          { id: 'c3', level: 2, parentId: 'c1' }
        ]
      }
      
      const validationResult = await wrapper.vm.validateTreeStructure(treeStructureGroup)
      expect(validationResult.isValid).toBe(true)
      expect(validationResult.maxDepth).toBe(2)
    })
  })
})

describe('ConditionFormValidator 条件表单验证器', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(ConditionFormValidator, {
      global: {
        plugins: [store]
      },
      props: {
        condition: mockInvalidCondition,
        validationRules: mockValidationRules,
        realTimeValidation: true
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('表单字段验证', () => {
    test('应该验证必填字段', async () => {
      const result = await wrapper.vm.validateField('dataSource', '')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('请选择数据源')
    })

    test('应该验证字段格式', async () => {
      const numericCondition = {
        ...mockInvalidCondition,
        operator: 'greater_than'
      }
      
      await wrapper.setProps({ condition: numericCondition })
      
      const result = await wrapper.vm.validateField('value', 'abc')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('请输入有效的数字')
    })

    test('应该验证条件依赖关系', async () => {
      const conditionWithOperator = {
        ...mockInvalidCondition,
        operator: 'equals'
      }
      
      await wrapper.setProps({ condition: conditionWithOperator })
      
      const result = await wrapper.vm.validateField('value', '')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('请输入值')
    })
  })

  describe('实时验证', () => {
    test('字段值变化时应该触发实时验证', async () => {
      const spy = vi.spyOn(wrapper.vm, 'validateField')
      
      await wrapper.vm.onFieldChange('dataSource', 'user_tags')
      
      expect(spy).toHaveBeenCalledWith('dataSource', 'user_tags')
    })

    test('应该防抖处理频繁的输入变化', async () => {
      const spy = vi.spyOn(wrapper.vm, 'validateField')
      
      // 快速连续输入
      wrapper.vm.onFieldChange('value', 'a')
      wrapper.vm.onFieldChange('value', 'ab')
      wrapper.vm.onFieldChange('value', 'abc')
      
      // 等待防抖延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 应该只调用一次验证
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('value', 'abc')
    })

    test('失焦时应该立即触发验证', async () => {
      const spy = vi.spyOn(wrapper.vm, 'validateField')
      
      await wrapper.vm.onFieldBlur('value', 'test')
      
      expect(spy).toHaveBeenCalledWith('value', 'test')
    })
  })

  describe('验证状态管理', () => {
    test('应该正确管理字段验证状态', async () => {
      await wrapper.vm.setFieldValidationState('dataSource', {
        isValid: false,
        errors: ['请选择数据源']
      })
      
      expect(wrapper.vm.fieldValidationStates.dataSource.isValid).toBe(false)
      expect(wrapper.vm.fieldValidationStates.dataSource.errors).toContain('请选择数据源')
    })

    test('应该计算整体条件的验证状态', () => {
      wrapper.vm.fieldValidationStates = {
        dataSource: { isValid: false, errors: ['请选择数据源'] },
        field: { isValid: true, errors: [] },
        operator: { isValid: true, errors: [] },
        value: { isValid: false, errors: ['请输入值'] }
      }
      
      const overallState = wrapper.vm.getOverallValidationState()
      
      expect(overallState.isValid).toBe(false)
      expect(overallState.errorCount).toBe(2)
      expect(overallState.errors).toHaveLength(2)
    })

    test('应该清除字段验证状态', async () => {
      await wrapper.vm.setFieldValidationState('dataSource', {
        isValid: false,
        errors: ['请选择数据源']
      })
      
      wrapper.vm.clearFieldValidationState('dataSource')
      
      expect(wrapper.vm.fieldValidationStates.dataSource).toBeUndefined()
    })
  })

  describe('验证结果展示', () => {
    test('应该在字段旁边显示错误信息', async () => {
      await wrapper.vm.setFieldValidationState('dataSource', {
        isValid: false,
        errors: ['请选择数据源']
      })
      
      const errorMessage = wrapper.find('[data-testid="field-error-dataSource"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('请选择数据源')
    })

    test('应该显示字段验证成功状态', async () => {
      await wrapper.vm.setFieldValidationState('dataSource', {
        isValid: true,
        errors: []
      })
      
      const successIcon = wrapper.find('[data-testid="field-success-dataSource"]')
      expect(successIcon.exists()).toBe(true)
    })

    test('应该支持多个错误信息的显示', async () => {
      await wrapper.vm.setFieldValidationState('value', {
        isValid: false,
        errors: ['请输入值', '值长度至少为3个字符']
      })
      
      const errorMessages = wrapper.findAll('[data-testid^="field-error-value-"]')
      expect(errorMessages).toHaveLength(2)
    })
  })
})

// 验证逻辑单元测试
describe('ValidationLogic 验证逻辑', () => {
  describe('条件验证', () => {
    test('应该正确验证必填字段', () => {
      const validateRequired = (value: any, fieldName: string) => {
        if (value === null || value === undefined || value === '') {
          return {
            isValid: false,
            error: `${fieldName}不能为空`
          }
        }
        return { isValid: true, error: null }
      }
      
      expect(validateRequired('', '数据源').isValid).toBe(false)
      expect(validateRequired('user_tags', '数据源').isValid).toBe(true)
      expect(validateRequired(null, '字段').isValid).toBe(false)
    })

    test('应该正确验证数字格式', () => {
      const validateNumeric = (value: string) => {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          return {
            isValid: false,
            error: '请输入有效的数字'
          }
        }
        return { isValid: true, error: null }
      }
      
      expect(validateNumeric('123').isValid).toBe(true)
      expect(validateNumeric('12.34').isValid).toBe(true)
      expect(validateNumeric('abc').isValid).toBe(false)
      expect(validateNumeric('').isValid).toBe(false)
    })

    test('应该正确验证日期格式', () => {
      const validateDate = (value: string) => {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return {
            isValid: false,
            error: '请输入有效的日期格式'
          }
        }
        return { isValid: true, error: null }
      }
      
      expect(validateDate('2024-01-01').isValid).toBe(true)
      expect(validateDate('2024/01/01').isValid).toBe(true)
      expect(validateDate('invalid-date').isValid).toBe(false)
    })

    test('应该正确验证条件依赖关系', () => {
      const validateConditionalRequired = (condition: Condition) => {
        const needsValue = ['equals', 'not_equals', 'contains', 'not_contains'].includes(condition.operator)
        
        if (needsValue && !condition.value) {
          return {
            isValid: false,
            error: '当前操作符需要输入值'
          }
        }
        
        return { isValid: true, error: null }
      }
      
      const conditionWithEquals = { ...mockValidCondition, operator: 'equals', value: '' }
      const conditionWithIsNull = { ...mockValidCondition, operator: 'is_null', value: '' }
      
      expect(validateConditionalRequired(conditionWithEquals).isValid).toBe(false)
      expect(validateConditionalRequired(conditionWithIsNull).isValid).toBe(true)
    })
  })

  describe('条件组验证', () => {
    test('应该验证条件组至少包含一个条件', () => {
      const validateGroupConditions = (group: ConditionGroup) => {
        if (group.conditions.length === 0) {
          return {
            isValid: false,
            error: '条件组至少需要一个条件',
            priority: 'warning'
          }
        }
        return { isValid: true, error: null }
      }
      
      expect(validateGroupConditions(mockEmptyConditionGroup).isValid).toBe(false)
      expect(validateGroupConditions(mockValidConditionGroup).isValid).toBe(true)
    })

    test('应该验证条件组中所有条件的有效性', () => {
      const validateGroupConditionValidity = (group: ConditionGroup) => {
        const invalidConditions = group.conditions.filter(c => !c.isValid)
        
        if (invalidConditions.length > 0) {
          return {
            isValid: false,
            error: `条件组包含${invalidConditions.length}个无效条件`,
            invalidConditions
          }
        }
        
        return { isValid: true, error: null }
      }
      
      expect(validateGroupConditionValidity(mockValidConditionGroup).isValid).toBe(true)
      expect(validateGroupConditionValidity(mockInvalidConditionGroup).isValid).toBe(false)
    })

    test('应该验证条件组名称的唯一性', () => {
      const validateGroupNameUniqueness = (groups: ConditionGroup[], currentGroup: ConditionGroup) => {
        const duplicateNames = groups.filter(g => 
          g.id !== currentGroup.id && g.name === currentGroup.name
        )
        
        if (duplicateNames.length > 0) {
          return {
            isValid: false,
            error: '条件组名称不能重复'
          }
        }
        
        return { isValid: true, error: null }
      }
      
      const duplicateGroup = { ...mockValidConditionGroup, id: 'group-duplicate' }
      const groups = [mockValidConditionGroup, duplicateGroup]
      
      expect(validateGroupNameUniqueness(groups, duplicateGroup).isValid).toBe(false)
    })
  })

  describe('整体配置验证', () => {
    test('应该验证至少包含一个有效的包含条件组', () => {
      const validateOverallConfiguration = (includeGroups: ConditionGroup[], excludeGroups: ConditionGroup[]) => {
        const validIncludeGroups = includeGroups.filter(g => 
          g.conditions.length > 0 && g.conditions.every(c => c.isValid)
        )
        
        if (validIncludeGroups.length === 0) {
          return {
            isValid: false,
            error: '至少需要一个有效的包含条件组'
          }
        }
        
        return { isValid: true, error: null }
      }
      
      expect(validateOverallConfiguration([mockValidConditionGroup], []).isValid).toBe(true)
      expect(validateOverallConfiguration([mockInvalidConditionGroup], []).isValid).toBe(false)
      expect(validateOverallConfiguration([], []).isValid).toBe(false)
    })

    test('应该验证剔除条件组的合理性', () => {
      const validateExcludeGroups = (includeGroups: ConditionGroup[], excludeGroups: ConditionGroup[]) => {
        if (excludeGroups.length > includeGroups.length * 2) {
          return {
            isValid: false,
            error: '剔除条件组数量过多，可能导致结果为空',
            priority: 'warning'
          }
        }
        
        return { isValid: true, error: null }
      }
      
      const manyExcludeGroups = Array(5).fill(mockValidConditionGroup)
      expect(validateExcludeGroups([mockValidConditionGroup], manyExcludeGroups).isValid).toBe(false)
    })

    test('应该生成完整的验证报告', () => {
      const generateValidationReport = (groups: ConditionGroup[]) => {
        const report = {
          isValid: true,
          errors: [] as any[],
          warnings: [] as any[],
          summary: {
            totalGroups: groups.length,
            validGroups: 0,
            totalConditions: 0,
            validConditions: 0
          }
        }
        
        groups.forEach(group => {
          report.summary.totalConditions += group.conditions.length
          
          const validConditions = group.conditions.filter(c => c.isValid)
          report.summary.validConditions += validConditions.length
          
          if (validConditions.length === group.conditions.length && group.conditions.length > 0) {
            report.summary.validGroups++
          } else {
            report.isValid = false
            if (group.conditions.length === 0) {
              report.warnings.push({
                type: 'warning',
                message: `条件组"${group.name}"为空`,
                groupId: group.id
              })
            } else {
              report.errors.push({
                type: 'error',
                message: `条件组"${group.name}"包含无效条件`,
                groupId: group.id
              })
            }
          }
        })
        
        return report
      }
      
      const testGroups = [mockValidConditionGroup, mockInvalidConditionGroup, mockEmptyConditionGroup]
      const report = generateValidationReport(testGroups)
      
      expect(report.isValid).toBe(false)
      expect(report.errors).toHaveLength(1)
      expect(report.warnings).toHaveLength(1)
      expect(report.summary.totalGroups).toBe(3)
      expect(report.summary.validGroups).toBe(1)
    })
  })
})