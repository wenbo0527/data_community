import { describe, it, expect, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useGraphInstance } from '../../src/composables/canvas/useGraphInstance.js'

function makeFakeGraph() {
  return { on: vi.fn(), off: vi.fn(), dispose: vi.fn() }
}

function runWithUnmount(fn) {
  const scope = effectScope()
  const api = scope.run(() => fn()) || {}
  // 卸载：停止 scope 会触发内部注册的 onBeforeUnmount
  scope.stop()
  return api
}

describe('useGraphInstance', () => {
  it('初始 graph 为 null', () => {
    const { inst } = runWithUnmount(() => ({ inst: useGraphInstance() }))
    expect(inst.graph.value).toBeNull()
  })

  it('registerGraph 注入实例', () => {
    const { inst } = runWithUnmount(() => ({ inst: useGraphInstance() }))
    const fake = makeFakeGraph()
    inst.registerGraph(fake)
    expect(inst.graph.value).toBe(fake)
  })

  it('on 在 graph 注册后绑定事件', () => {
    const { inst } = runWithUnmount(() => ({ inst: useGraphInstance() }))
    const fake = makeFakeGraph()
    inst.registerGraph(fake)
    const handler = vi.fn()
    inst.on('node:added', handler)
    expect(fake.on).toHaveBeenCalledWith('node:added', handler)
  })

  it('on 在 graph 未注册时安全跳过', () => {
    const { inst } = runWithUnmount(() => ({ inst: useGraphInstance() }))
    expect(() => inst.on('node:added', () => {})).not.toThrow()
  })

  it('off 反注册指定 handler', () => {
    const { inst } = runWithUnmount(() => ({ inst: useGraphInstance() }))
    const fake = makeFakeGraph()
    inst.registerGraph(fake)
    const handler = vi.fn()
    inst.on('node:added', handler)
    inst.off('node:added', handler)
    expect(fake.off).toHaveBeenCalledWith('node:added', handler)
  })

  it('dispose 解除全部监听并 dispose graph', () => {
    const { inst } = runWithUnmount(() => ({ inst: useGraphInstance() }))
    const fake = makeFakeGraph()
    inst.registerGraph(fake)
    const h1 = vi.fn(), h2 = vi.fn()
    inst.on('e1', h1)
    inst.on('e2', h2)
    inst.dispose()
    expect(fake.off).toHaveBeenCalledWith('e1', h1)
    expect(fake.off).toHaveBeenCalledWith('e2', h2)
    expect(fake.dispose).toHaveBeenCalledOnce()
    expect(inst.graph.value).toBeNull()
  })

  it('dispose 时 graph 为 null 时安全跳过', () => {
    const { inst } = runWithUnmount(() => ({ inst: useGraphInstance() }))
    expect(() => inst.dispose()).not.toThrow()
  })

  it('scope.stop 自动 dispose', () => {
    const fake = makeFakeGraph()
    const scope = effectScope()
    const inst = scope.run(() => {
      const i = useGraphInstance()
      i.registerGraph(fake)
      i.on('e', vi.fn())
      return i
    })
    scope.stop()
    expect(fake.dispose).toHaveBeenCalledOnce()
    expect(fake.off).toHaveBeenCalled()
    expect(inst.graph.value).toBeNull()
  })
})
/*
用途：useGraphInstance 单元测试
说明：使用 effectScope 模拟组件 setup + onBeforeUnmount 钩子；不依赖 @vue/test-utils。
边界：使用 fake graph；不测真实 X6 绑定。
*/