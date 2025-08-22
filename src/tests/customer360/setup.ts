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
    customerId: 'C001',
    address: '北京市朝阳区',
    idCard: '110101199001011234',
    idCardExpiry: '2030-01-01',
    status: '正常',
    faceScore: 95.5,
    threshold: 85.0,
    errorInfo: null
  },
  productInfo: {
    selfOperated: [],
    assisted: []
  },
  creditList: [],
  loanList: [],
  adjustmentHistory: []
})

// 测试数据验证工具
export const validateTestData = (data: any, expectedFields: string[]) => {
  expectedFields.forEach(field => {
    expect(data).toHaveProperty(field)
  })
}