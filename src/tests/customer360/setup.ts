import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

// Customer360测试专用设置

// 创建测试用的Pinia实例
export const createTestPinia = () => {
  return createPinia()
}

// 创建测试用的路由实例
export const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/discovery/customer360',
        name: 'Customer360Index',
        component: { template: '<div>Customer360 Index</div>' }
      },
      {
        path: '/discovery/customer360/detail/:userId',
        name: 'Customer360Detail',
        component: { template: '<div>Customer360 Detail</div>' }
      }
    ]
  })
}

// Mock Arco Design组件
config.global.stubs = {
  'a-card': {
    template: '<div class="a-card"><slot /></div>'
  },
  'a-tabs': {
    template: '<div class="a-tabs"><slot /></div>'
  },
  'a-tab-pane': {
    template: '<div class="a-tab-pane"><slot /></div>'
  },
  'a-table': {
    template: '<div class="a-table"><slot /></div>'
  },
  'a-button': {
    template: '<button class="a-button"><slot /></button>'
  },
  'a-input': {
    template: '<input class="a-input" />'
  },
  'a-form': {
    template: '<form class="a-form"><slot /></form>'
  },
  'a-form-item': {
    template: '<div class="a-form-item"><slot /></div>'
  },
  'a-skeleton': {
    template: '<div class="a-skeleton"></div>'
  },
  'a-skeleton-line': {
    template: '<div class="a-skeleton-line"></div>'
  },
  'a-skeleton-shape': {
    template: '<div class="a-skeleton-shape"></div>'
  },
  'a-descriptions': {
    template: '<div class="a-descriptions"><slot /></div>'
  },
  'a-descriptions-item': {
    template: '<div class="a-descriptions-item"><slot /></div>'
  },
  'a-progress': {
    template: '<div class="a-progress"><slot /></div>'
  },
  'a-alert': {
    template: '<div class="a-alert"><slot /></div>'
  },
  'a-spin': {
    template: '<div class="a-spin"><slot /></div>'
  },
  'a-pagination': {
    template: '<div class="a-pagination"><slot /></div>'
  },
  'a-empty': {
    template: '<div class="a-empty"><slot /></div>'
  },
  'a-date-picker': {
    template: '<div class="a-date-picker"><slot /></div>'
  },
  'a-range-picker': {
    template: '<div class="a-range-picker"><slot /></div>'
  },
  'a-table': {
    template: '<div class="a-table"><slot /></div>'
  },
  'a-timeline': {
    template: '<div class="a-timeline"><slot /></div>'
  },
  'a-timeline-item': {
    template: '<div class="a-timeline-item"><slot /></div>'
  },
  'a-tree': {
    template: '<div class="a-tree"><slot /></div>'
  },
  'a-tag': {
    template: '<span class="a-tag"><slot /></span>'
  },
  'a-tooltip': {
    template: '<div class="a-tooltip"><slot /></div>'
  },
  'a-popover': {
    template: '<div class="a-popover"><slot /></div>'
  },
  'a-modal': {
    template: '<div class="a-modal"><slot /></div>'
  },
  'a-message': {
    template: '<div class="a-message"><slot /></div>'
  }
}

// Mock 浏览器API
global.navigator = {
  ...global.navigator,
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('')
  }
}

// Mock window.open
global.open = vi.fn()

// Mock console方法以避免测试输出污染
const originalConsole = { ...console }
export const mockConsole = () => {
  console.log = vi.fn()
  console.warn = vi.fn()
  console.error = vi.fn()
  console.info = vi.fn()
}

export const restoreConsole = () => {
  Object.assign(console, originalConsole)
}

// 通用测试工具函数
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const createMockUserData = () => ({
  userId: '887123',
  basicInfo: {
    name: '张三',
    age: 30,
    gender: '男',
    phone: '138****1234',
    customerNo: 'C001',
    address: '北京市朝阳区',
    idCard: '110101199001011234',
    idExpiry: '2030-01-01',
    status: '正常',
    similarity: 95.5,
    threshold: 85.0,
    errorMsg: null
  },
  productInfo: {
    selfOperated: [],
    assisted: []
  },
  creditList: [],
  loanList: [],
  adjustmentHistory: [],
  collectionRecords: [
    {
      id: '1',
      type: '电话催收',
      date: '2024-01-15',
      status: '已联系',
      method: '电话催收',
      collector: '李催收',
      overdueAmount: 5000,
      overdueDays: 15,
      riskLevel: 'medium',
      notes: '客户承诺本周内还款'
    },
    {
      id: '2',
      type: '短信催收',
      date: '2024-01-14',
      status: '无法联系',
      method: '短信催收',
      collector: '王催收',
      overdueAmount: 3000,
      overdueDays: 10,
      riskLevel: 'low',
      notes: '客户电话无人接听'
    }
  ],
  creditRecords: [
    {
      id: '1',
      reportDate: '2024-01-10',
      creditScore: 750,
      riskLevel: '低风险',
      reportSource: '人民银行',
      queryReason: '贷款审批',
      details: '信用记录良好'
    }
  ],
  creditReports: [
    {
      queryDate: '2024-01-15',
      reportDate: '2024-01-15',
      validUntil: '2024-07-15',
      creditScore: 750,
      creditLevel: '优秀',
      reportType: '个人征信报告',
      reportSource: '中国人民银行征信中心',
      status: 'valid',
      reportUrl: 'https://example.com/report1.pdf',
      notes: '征信状况良好',
      institution: '中国人民银行征信中心',
      queryReason: '贷款审批',
      version: '2.0',
      overdueRecords: [],
      guaranteeRecords: [],
      queryRecords: []
    },
    {
      queryDate: '2024-02-20',
      reportDate: '2024-02-20',
      validUntil: '2024-08-20',
      creditScore: 680,
      creditLevel: '良好',
      reportType: '个人征信报告',
      reportSource: '中国人民银行征信中心',
      status: 'valid',
      reportUrl: 'https://example.com/report2.pdf',
      notes: '征信记录正常',
      institution: '中国人民银行征信中心',
      queryReason: '贷款审批',
      version: '2.0',
      overdueRecords: [],
      guaranteeRecords: [],
      queryRecords: []
    }
  ],
  marketingRecords: [
    {
      id: '1',
      campaignName: '新年理财活动',
      productName: '理财产品A',
      channel: '短信',
      sendTime: '2024-01-01 09:00:00',
      responseTime: '2024-01-01 10:30:00',
      status: '已响应',
      responseRate: 85.5
    }
  ]
})

// 测试数据验证工具
export const validateTestData = (data: any, expectedFields: string[]) => {
  expectedFields.forEach(field => {
    expect(data).toHaveProperty(field)
  })
}