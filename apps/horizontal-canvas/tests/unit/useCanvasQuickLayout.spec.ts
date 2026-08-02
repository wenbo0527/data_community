import { describe, it, expect, vi } from 'vitest'
import { useCanvasQuickLayout } from '../../src/composables/canvas/useCanvasQuickLayout.js'

function makeDeps(overrides = {}) {
  return {
    getGraph: () => ({}),
    getContainerEl: () => ({}),
    getMinimap: () => ({}),
    getMinimapPaused: () => true,
    getLayoutOptions: () => ({ colSpacing: 300 }),
    Message: { warning: vi.fn(), loading: vi.fn(() => ({ close: vi.fn() })), success: vi.fn(), error: vi.fn() },
    onAfterLayout: vi.fn(),
    applyQuickLayoutSvc: vi.fn(async () => undefined),
    ...overrides
  }
}

describe('useCanvasQuickLayout', () => {
  it('graph 缺失时 warning + 不调用 service', async () => {
    const deps = makeDeps({ getGraph: () => null })
    const ctl = useCanvasQuickLayout(deps)
    const ok = await ctl.applyQuickLayout()
    expect(ok).toBe(false)
    expect(deps.Message.warning).toHaveBeenCalledWith('画布未初始化，请稍后再试')
    expect(deps.applyQuickLayoutSvc).not.toHaveBeenCalled()
  })

  it('正常路径：调用 service + success + onAfterLayout', async () => {
    const deps = makeDeps()
    const ctl = useCanvasQuickLayout(deps)
    const ok = await ctl.applyQuickLayout()
    expect(ok).toBe(true)
    expect(deps.applyQuickLayoutSvc).toHaveBeenCalledOnce()
    expect(deps.Message.loading).toHaveBeenCalled()
    expect(deps.Message.success).toHaveBeenCalledWith('智能布局应用成功！')
    expect(deps.onAfterLayout).toHaveBeenCalledOnce()
  })

  it('异常路径：service 抛错 → error Toast + 返回 false', async () => {
    const deps = makeDeps({ applyQuickLayoutSvc: vi.fn(async () => { throw new Error('layout failed') }) })
    const ctl = useCanvasQuickLayout(deps)
    const ok = await ctl.applyQuickLayout()
    expect(ok).toBe(false)
    expect(deps.Message.error).toHaveBeenCalledWith(expect.stringContaining('布局失败'))
  })

  it('getLayoutOptions 返回空时也能正常调用', async () => {
    const deps = makeDeps({ getLayoutOptions: () => null })
    const ctl = useCanvasQuickLayout(deps)
    const ok = await ctl.applyQuickLayout()
    expect(ok).toBe(true)
    expect(deps.applyQuickLayoutSvc).toHaveBeenCalledOnce()
  })
})
/*
用途：useCanvasQuickLayout 单元测试
说明：覆盖 graph 缺失 / 正常 / 异常 / 空配置分支。
边界：使用 vi.fn 注入 Message/service；不测真实 X6 布局。
*/