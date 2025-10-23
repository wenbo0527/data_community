/**
 * 现有测试兼容性验证
 * 验证改进后的测试配置与现有测试的兼容性
 */

import { describe, it, expect, vi } from 'vitest'

describe('现有测试兼容性验证', () => {
  it('应该能够运行基本的单元测试', () => {
    // 基本断言测试
    expect(1 + 1).toBe(2)
    expect('hello world').toContain('world')
    expect([1, 2, 3]).toHaveLength(3)
    expect({ name: 'test', value: 42 }).toHaveProperty('name')
  })

  it('应该能够使用Mock功能', () => {
    const mockFn = vi.fn()
    const mockReturnValue = vi.fn().mockReturnValue('mocked')
    
    mockFn('test argument')
    const result = mockReturnValue()
    
    expect(mockFn).toHaveBeenCalledWith('test argument')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(result).toBe('mocked')
  })

  it('应该能够测试异步函数', async () => {
    const asyncFn = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('async result'), 10)
      })
    }
    
    const result = await asyncFn()
    expect(result).toBe('async result')
  })

  it('应该能够使用DOM API', () => {
    // 测试DOM操作
    const element = document.createElement('div')
    element.className = 'test-element'
    element.textContent = '测试内容'
    
    document.body.appendChild(element)
    
    const found = document.querySelector('.test-element')
    expect(found).toBeTruthy()
    expect(found.textContent).toBe('测试内容')
    
    // 清理
    document.body.removeChild(element)
  })

  it('应该能够测试事件处理', () => {
    const element = document.createElement('button')
    let clicked = false
    
    element.addEventListener('click', () => {
      clicked = true
    })
    
    // 模拟点击事件
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    })
    
    element.dispatchEvent(clickEvent)
    
    expect(clicked).toBe(true)
  })

  it('应该能够测试错误处理', () => {
    const errorFn = () => {
      throw new Error('测试错误')
    }
    
    expect(errorFn).toThrow('测试错误')
    expect(errorFn).toThrow(Error)
  })

  it('应该能够使用定时器', async () => {
    vi.useFakeTimers()
    
    let executed = false
    setTimeout(() => {
      executed = true
    }, 1000)
    
    expect(executed).toBe(false)
    
    vi.advanceTimersByTime(1000)
    
    expect(executed).toBe(true)
    
    vi.useRealTimers()
  })

  it('应该能够测试模块导入', async () => {
    // 测试动态导入
    const module = await import('../setup/real-environment.js')
    
    expect(module.createRealDOMContainer).toBeDefined()
    expect(module.cleanupDOM).toBeDefined()
    expect(typeof module.createRealDOMContainer).toBe('function')
  })
})