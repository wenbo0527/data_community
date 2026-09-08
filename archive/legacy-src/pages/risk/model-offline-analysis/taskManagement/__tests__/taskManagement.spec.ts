import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('@/store/modules/model-offline', () => {
  const store: any = { tasks: [] }
  Object.defineProperty(store, 'getTasks', {
    get() { return store.tasks }
  })
  store.setTasks = (data: any[]) => { store.tasks = data }
  return { useTaskStore: () => store }
})

vi.mock('@/utils/enhancedErrorHandler.js', () => {
  const info = vi.fn()
  const error = vi.fn()
  return {
    logger: {
      info,
      error,
      warn: vi.fn(),
      debug: vi.fn()
    }
  }
})

// 轻量级 stub Arco 组件，避免复杂渲染依赖
const stubs = {
  'a-button': {
    template: '<button @click="$emit(\'click\')"><slot /></button>'
  },
  'a-card': { template: '<div><slot /><slot name="title" /></div>' },
  'a-space': { template: '<div><slot /></div>' },
  'a-table': { template: '<table><slot /></table>' },
  'a-row': { template: '<div><slot /></div>' },
  'a-col': { template: '<div><slot /></div>' },
  'a-tag': { template: '<span><slot /></span>' },
  'a-progress': { template: '<div></div>' },
  'a-form': { template: '<form><slot /></form>' },
  'a-form-item': { template: '<div><slot /></div>' },
  'a-input': { template: '<input />' },
  'a-select': { template: '<select><slot /></select>' },
  'a-option': { template: '<option><slot /></option>' },
  'a-link': { template: '<a><slot /></a>' },
  'icon-plus': { template: '<i />' },
  'icon-settings': { template: '<i />' },
  'icon-loading': { template: '<i />' },
  'icon-check-circle': { template: '<i />' },
  'icon-exclamation-circle': { template: '<i />' },
  'icon-pause-circle': { template: '<i />' },
  'icon-search': { template: '<i />' },
  'icon-refresh': { template: '<i />' },
  'icon-tool': { template: '<i />' }
}

import Component from '../index.vue'

describe('TaskManagement', () => {
  it('触发加载并记录日志', async () => {
    mount(Component, { global: { stubs } })
    await new Promise((r) => setTimeout(r, 10))
    const { logger } = await import('@/utils/enhancedErrorHandler.js') as any
    expect(logger.info).toHaveBeenCalled()
    const calls = (logger.info as any).mock.calls.map((c: any[]) => String(c[0]))
    expect(calls.some((msg: string) => msg.includes('TaskManagement loadData start'))).toBe(true)
    expect(calls.some((msg: string) => msg.includes('TaskManagement loadData success'))).toBe(true)
  })
})
