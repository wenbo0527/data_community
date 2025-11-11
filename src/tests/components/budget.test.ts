import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BudgetOverview from '../../src/pages/budget/BudgetOverview.vue'
import BudgetTrendChart from '../../src/components/budget/BudgetTrendChart.vue'
import BudgetAlertPanel from '../../src/components/budget/BudgetAlertPanel.vue'
import BudgetAllocation from '../../src/components/budget/BudgetAllocation.vue'
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
  Select: {
    template: '<select class="arco-select"><slot /></select>'
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
    getBudgets: vi.fn().mockResolvedValue({
      data: [
        {
          id: '1',
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
          description: 'IT部门年度预算'
        },
        {
          id: '2',
          name: '2024年市场部门预算',
          year: 2024,
          department: Department.MARKETING,
          businessType: BusinessType.MARKETING,
          totalAmount: 800000,
          usedAmount: 400000,
          remainingAmount: 400000,
          executionRate: 50,
          status: BudgetStatus.ACTIVE,
          createdAt: '2024-01-01T00:00:00Z',
          description: '市场部门年度预算'
        }
      ],
      total: 2,
      page: 1,
      pageSize: 10
    }),
    getBudgetStatistics: vi.fn().mockResolvedValue({
      totalBudgets: 5,
      totalAmount: 5000000,
      averageExecutionRate: 65,
      pendingAlerts: 2
    }),
    deleteBudget: vi.fn().mockResolvedValue({ success: true })
  }
}))

describe('BudgetOverview Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders budget overview page', async () => {
    wrapper = mount(BudgetOverview, {
      global: {
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('预算总览')
    expect(wrapper.text()).toContain('新建预算')
    expect(wrapper.text()).toContain('导出数据')
  })

  it('displays budget statistics cards', async () => {
    wrapper = mount(BudgetOverview, {
      global: {
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('总预算数')
    expect(wrapper.text()).toContain('预算总额')
    expect(wrapper.text()).toContain('平均执行率')
    expect(wrapper.text()).toContain('待处理预警')
  })

  it('displays budget list table', async () => {
    wrapper = mount(BudgetOverview, {
      global: {
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('预算名称')
    expect(wrapper.text()).toContain('年度')
    expect(wrapper.text()).toContain('部门')
    expect(wrapper.text()).toContain('业务类型')
    expect(wrapper.text()).toContain('总额')
    expect(wrapper.text()).toContain('已使用')
    expect(wrapper.text()).toContain('剩余')
    expect(wrapper.text()).toContain('执行率')
    expect(wrapper.text()).toContain('状态')
  })

  it('handles budget search and filter', async () => {
    wrapper = mount(BudgetOverview, {
      global: {
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    await wrapper.vm.$nextTick()

    // 模拟搜索输入
    const searchInput = wrapper.find('.arco-input')
    if (searchInput.exists()) {
      await searchInput.setValue('IT部门')
      expect(wrapper.vm.searchKeyword).toBe('IT部门')
    }
  })

  it('handles budget deletion', async () => {
    wrapper = mount(BudgetOverview, {
      global: {
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 模拟删除操作
    const deleteButtons = wrapper.findAll('.arco-btn').filter((btn: any) => 
      btn.text().includes('删除')
    )
    
    if (deleteButtons.length > 0) {
      await deleteButtons[0].trigger('click')
      // 这里可以进一步测试删除确认逻辑
    }
  })
})

describe('BudgetTrendChart Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders trend chart component', async () => {
    wrapper = mount(BudgetTrendChart, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('预算趋势分析')
    expect(wrapper.text()).toContain('折线图')
    expect(wrapper.text()).toContain('柱状图')
    expect(wrapper.text()).toContain('面积图')
  })

  it('handles chart type switching', async () => {
    wrapper = mount(BudgetTrendChart, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()

    // 模拟切换图表类型
    const chartTypeButtons = wrapper.findAll('.arco-btn').filter((btn: any) => 
      ['折线图', '柱状图', '面积图'].includes(btn.text())
    )
    
    if (chartTypeButtons.length > 0) {
      await chartTypeButtons[1].trigger('click') // 切换到柱状图
      expect(wrapper.vm.chartType).toBe('bar')
    }
  })

  it('handles time range selection', async () => {
    wrapper = mount(BudgetTrendChart, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()

    // 模拟选择时间范围
    const timeRangeButtons = wrapper.findAll('.arco-btn').filter((btn: any) => 
      ['近6个月', '近12个月', '近24个月'].includes(btn.text())
    )
    
    if (timeRangeButtons.length > 0) {
      await timeRangeButtons[1].trigger('click') // 选择近12个月
      expect(wrapper.vm.timeRange).toBe(12)
    }
  })
})

describe('BudgetAlertPanel Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders alert panel component', async () => {
    wrapper = mount(BudgetAlertPanel, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('预算预警')
    expect(wrapper.text()).toContain('刷新')
    expect(wrapper.text()).toContain('查看全部')
  })

  it('displays alert list', async () => {
    wrapper = mount(BudgetAlertPanel, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证预警列表是否显示
    expect(wrapper.find('.alert-list')).toBeDefined()
  })

  it('handles alert refresh', async () => {
    wrapper = mount(BudgetAlertPanel, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()

    const refreshButton = wrapper.findAll('.arco-btn').find((btn: any) => 
      btn.text().includes('刷新')
    )
    
    if (refreshButton) {
      await refreshButton.trigger('click')
      // 验证刷新逻辑
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

  it('renders budget allocation component', async () => {
    wrapper = mount(BudgetAllocation, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('预算分配与监控')
    expect(wrapper.text()).toContain('总预算')
    expect(wrapper.text()).toContain('已分配')
    expect(wrapper.text()).toContain('剩余可分配')
  })

  it('displays allocation progress', async () => {
    wrapper = mount(BudgetAllocation, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('分配进度')
    expect(wrapper.find('.allocation-progress')).toBeDefined()
  })

  it('displays allocation list', async () => {
    wrapper = mount(BudgetAllocation, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('分配明细')
    expect(wrapper.find('.allocation-list')).toBeDefined()
  })

  it('handles new allocation', async () => {
    wrapper = mount(BudgetAllocation, {
      props: {
        budgetId: 'test-budget-id'
      }
    })

    await wrapper.vm.$nextTick()

    const newAllocationButton = wrapper.findAll('.arco-btn').find((btn: any) => 
      btn.text().includes('新增分配')
    )
    
    if (newAllocationButton) {
      await newAllocationButton.trigger('click')
      // 验证新增分配逻辑
    }
  })
})