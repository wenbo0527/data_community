/**
 * 基础兼容性测试
 * 验证改进后的测试配置与现有测试的兼容性
 */

import { describe, it, expect, vi } from 'vitest'

describe('基础兼容性测试', () => {
  it('应该能够运行基本测试', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toBe('hello')
    expect(true).toBe(true)
  })

  it('应该能够使用vitest的基本功能', () => {
    const mockFn = vi.fn()
    mockFn('test')
    
    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('应该能够访问全局变量', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    expect(typeof global).toBe('object')
  })

  it('应该能够使用DOM API', () => {
    const div = document.createElement('div')
    div.textContent = '测试内容'
    
    expect(div.tagName).toBe('DIV')
    expect(div.textContent).toBe('测试内容')
  })

  it('应该能够测试异步操作', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => resolve('完成'), 10)
    })
    
    const result = await promise
    expect(result).toBe('完成')
  })

  it('应该能够使用数组和对象匹配器', () => {
    const array = [1, 2, 3]
    const object = { name: '测试', value: 42 }
    
    expect(array).toHaveLength(3)
    expect(array).toContain(2)
    expect(object).toHaveProperty('name')
    expect(object).toMatchObject({ name: '测试' })
  })
})