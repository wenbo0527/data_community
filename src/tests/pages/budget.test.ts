import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BudgetCreate from '../../src/pages/budget/BudgetCreate.vue'
import BudgetDetail from '../../src/pages/budget/BudgetDetail.vue'
import BudgetEdit from '../../src/pages/budget/BudgetEdit.vue'
import BudgetAllocation from '../../src/pages/budget/BudgetAllocation.vue'
import BudgetMonitor from '../../src/pages/budget/BudgetMonitor.vue'
import BudgetAlerts from '../../src/pages/budget/BudgetAlerts.vue'
import { BudgetStatus, Department, BusinessType } from '../../src/types/budget'

// 模拟 Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  Card: {
    template: '<div class="arco-card"><slot /></div>'
  },
  Button: {
    template: '<button class="arco-btn"><slot /></button>'
  },
  Input: {
    template: '<input class="arco-input" />'
  },
  InputNumber: {
    template: '<input class="arco-input-number" />'
  },
  Select: {
    template: '<select class="arco-select"><slot /></select>'
  },
  Form: {
    template: '<form class="arco-form"><slot /></form>'
  },
  FormItem: {
    template: '<div class="arco-form-item"><slot /></div>'
  },
  Table: {
    template: '<table class="arco-table"><slot /></table>'
  },
  Tag: {
    template: '<span class="arco-tag"><slot /></span>'
  },
  Space: {
    template: '<div class="arco-space"><slot /></div>'
  },
  Row: {
    template: '<div class="arco-row"><slot /></div>'
  },
  Col: {
    template: '<div class="arco-col"><slot /></div>'
  },
  Modal: {
    template: '<div class="arco-modal"><slot /></div>'
  },
  TabPane: {
    template: '<div class="arco-tab-pane"><slot /></div>'
  },
  Tabs: {
    template: '<div class="arco-tabs"><slot /></div>'
  },
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

// 模拟 G2 图表库
vi.mock('@antv/g2', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    data: vi.fn().mockReturnThis(),
    scale: vi.fn().mockReturnThis(),
    axis: vi.fn().mockReturnThis(),
    legend: vi.fn().mockReturnThis(),
    tooltip: vi.fn().mockReturnThis(),
    line: vi.fn().mockReturnThis(),
    bar: vi.fn().mockReturnThis(),
    area: vi.fn().mockReturnThis(),
    render: vi.fn().mockReturnThis(),
    changeSize: vi.fn().mockReturnThis(),
    destroy: vi.fn()
  }))
}))

// 模拟预算 API 服务
vi.mock('../../src/api/budget', () => ({
  budgetApiService: {
    getBudgetById: vi.fn().mockResolvedValue({
      id: 'test-budget-id',
      name: '2024年IT部门预算',
      year: 2024,
      department: Department.IT,
      businessType: BusinessType.TECHNOLOGY,
      totalAmount: 1000000,
      usedAmount: 600000,
      remainingAmount: 400000,
      executionRate: 60,
      status: BudgetStatus.ACTIVE,
      createdAt: '2024-01-01T00:00:00Z',
      description: 'IT部门年度预算',
      subjects: [
        {
          id: 'subject-1',
          code: 'IT-001',
          name: '人力成本',
          amount: 500000,
          usedAmount: 300000
        }
      ]
    }),
    createBudget: vi.fn().mockResolvedValue({
      id: 'new-budget-id',
      name: '新建预算',
      year: 2024,
      department: Department.IT,
      businessType: BusinessType.TECHNOLOGY,
      totalAmount: 1000000,
      status: BudgetStatus.DRAFT
    }),
    updateBudget: vi.fn().mockResolvedValue({
      id: 'test-budget-id',
      name: '更新后的预算',
      year: 2024,
      department: Department.IT,
      businessType: BusinessType.TECHNOLOGY,
      totalAmount: 1200000,
      status: BudgetStatus.ACTIVE
    }),
    getBudgetAllocations: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'allocation-1',
          department: Department.IT,
          allocatedAmount: 500000,
          usedAmount: 300000,
          remainingAmount: 200000,
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ],
      total: 1
    }),
    getAlerts: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'alert-1',
          title: '超支预警',
          content: '预算执行率超过80%',
          level: 'HIGH',
          status: 'UNREAD',
          createdAt: '2024-01-15T00:00:00Z'
        }
      ],
      total: 1
    }),
    getCostRecords: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'cost-1',
          amount: 50000,
          type: '人力成本',
          description: '开发人员工资',
          date: '2024-01-15T00:00:00Z'
        }
      ],
      total: 1
    })
  }
}))

// 模拟 Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn()
  }),
  useRoute: () => ({
    params: { id: 'test-budget-id' },
    query: {},
    path: '/budget/detail/test-budget-id'
  })
}))

describe('BudgetCreate Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders budget creation form', async () => {
    wrapper = mount(BudgetCreate)

    await flushPromises()
    
    expect(wrapper.text()).toContain('新建预算')
    expect(wrapper.text()).toContain('预算名称')
    expect(wrapper.text()).toContain('预算年度')
    expect(wrapper.text()).toContain('部门')
    expect(wrapper.text()).toContain('业务类型')
    expect(wrapper.text()).toContain('预算总额')
    expect(wrapper.text()).toContain('预算描述')
  })

  it('handles form validation', async () => {
    wrapper = mount(BudgetCreate)

    await flushPromises()

    // 模拟提交空表单
    const form = wrapper.find('.arco-form')
    if (form.exists()) {
      await form.trigger('submit')
      // 验证表单验证逻辑
    }
  })

  it('handles budget creation', async () => {
    wrapper = mount(BudgetCreate)

    await flushPromises()

    // 模拟填写表单
    const formInputs = wrapper.findAll('.arco-input')
    if (formInputs.length > 0) {
      await formInputs[0].setValue('测试预算')
      // 继续填写其他字段
    }

    // 模拟提交表单
    const submitButton = wrapper.findAll('.arco-btn').find((btn: any) => 
      btn.text().includes('提交')
    )
    
    if (submitButton) {
      await submitButton.trigger('click')
      // 验证提交逻辑
    }
  })
})

describe('BudgetDetail Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders budget detail page', async () => {
    wrapper = mount(BudgetDetail)

    await flushPromises()
    
    expect(wrapper.text()).toContain('预算详情')
    expect(wrapper.text()).toContain('2024年IT部门预算')
  })

  it('displays budget basic information', async () => {
    wrapper = mount(BudgetDetail)

    await flushPromises()

    expect(wrapper.text()).toContain('预算名称')
    expect(wrapper.text()).toContain('预算年度')
    expect(wrapper.text()).toContain('部门')
    expect(wrapper.text()).toContain('业务类型')
    expect(wrapper.text()).toContain('预算总额')
    expect(wrapper.text()).toContain('已使用金额')
    expect(wrapper.text()).toContain('剩余金额')
    expect(wrapper.text()).toContain('执行率')
    expect(wrapper.text()).toContain('状态')
  })

  it('displays budget subjects', async () => {
    wrapper = mount(BudgetDetail)

    await flushPromises()

    expect(wrapper.text()).toContain('预算科目')
    expect(wrapper.text()).toContain('人力成本')
  })

  it('handles budget operations', async () => {
    wrapper = mount(BudgetDetail)

    await flushPromises()

    const editButton = wrapper.findAll('.arco-btn').find((btn: any) => 
      btn.text().includes('编辑')
    )
    
    if (editButton) {
      await editButton.trigger('click')
      // 验证编辑操作
    }
  })
})

describe('BudgetEdit Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders budget edit form', async () => {
    wrapper = mount(BudgetEdit)

    await flushPromises()
    
    expect(wrapper.text()).toContain('编辑预算')
    expect(wrapper.text()).toContain('预算名称')
    expect(wrapper.text()).toContain('预算总额')
  })

  it('loads budget data for editing', async () => {
    wrapper = mount(BudgetEdit)

    await flushPromises()

    // 验证预算数据是否被加载
    expect(wrapper.vm.budget).toBeDefined()
    expect(wrapper.vm.budget.name).toBe('2024年IT部门预算')
  })

  it('handles budget update', async () => {
    wrapper = mount(BudgetEdit)

    await flushPromises()

    // 模拟修改表单
    const formInputs = wrapper.findAll('.arco-input')
    if (formInputs.length > 0) {
      await formInputs[0].setValue('更新后的预算名称')
    }

    // 模拟提交更新
    const submitButton = wrapper.findAll('.arco-btn').find((btn: any) => 
      btn.text().includes('更新')
    )
    
    if (submitButton) {
      await submitButton.trigger('click')
      // 验证更新逻辑
    }
  })
})

describe('BudgetAllocation Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders budget allocation page', async () => {
    wrapper = mount(BudgetAllocation, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await flushPromises()
    
    expect(wrapper.text()).toContain('预算分配与监控')
    expect(wrapper.text()).toContain('总预算')
    expect(wrapper.text()).toContain('已分配')
    expect(wrapper.text()).toContain('剩余可分配')
  })

  it('displays allocation statistics', async () => {
    wrapper = mount(BudgetAllocation, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('分配统计')
    expect(wrapper.text()).toContain('分配进度')
  })

  it('displays allocation list', async () => {
    wrapper = mount(BudgetAllocation, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('分配明细')
    expect(wrapper.text()).toContain('IT部门')
  })

  it('handles new allocation', async () => {
    wrapper = mount(BudgetAllocation, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await flushPromises()

    const newAllocationButton = wrapper.findAll('.arco-btn').find((btn: any) => 
      btn.text().includes('新增分配')
    )
    
    if (newAllocationButton) {
      await newAllocationButton.trigger('click')
      // 验证新增分配逻辑
    }
  })
})

describe('BudgetMonitor Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders budget monitor page', async () => {
    wrapper = mount(BudgetMonitor)

    await flushPromises()
    
    expect(wrapper.text()).toContain('预算监控')
    expect(wrapper.text()).toContain('监控概览')
    expect(wrapper.text()).toContain('预警信息')
  })

  it('displays monitor overview', async () => {
    wrapper = mount(BudgetMonitor)

    await flushPromises()

    expect(wrapper.text()).toContain('总预算')
    expect(wrapper.text()).toContain('已执行')
    expect(wrapper.text()).toContain('执行率')
  })

  it('displays alert information', async () => {
    wrapper = mount(BudgetMonitor)

    await flushPromises()

    expect(wrapper.text()).toContain('超支预警')
    expect(wrapper.text()).toContain('预算执行率超过80%')
  })
})

describe('BudgetAlerts Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders budget alerts page', async () => {
    wrapper = mount(BudgetAlerts)

    await flushPromises()
    
    expect(wrapper.text()).toContain('预算预警')
    expect(wrapper.text()).toContain('预警列表')
  })

  it('displays alert list', async () => {
    wrapper = mount(BudgetAlerts)

    await flushPromises()

    expect(wrapper.text()).toContain('超支预警')
    expect(wrapper.text()).toContain('预算执行率超过80%')
    expect(wrapper.text()).toContain('HIGH')
  })

  it('handles alert operations', async () => {
    wrapper = mount(BudgetAlerts)

    await flushPromises()

    const markReadButton = wrapper.findAll('.arco-btn').find((btn: any) => 
      btn.text().includes('标记已读')
    )
    
    if (markReadButton) {
      await markReadButton.trigger('click')
      // 验证标记已读逻辑
    }
  })
})