/**
 * 诊断失败原因(快速测试)
 */
import { describe, it } from 'vitest'
import { mountComponent } from './createWrapper'

describe('诊断', () => {
  it('PermissionApproval 加载错误', async () => {
    try {
      const mod = await import('@/pages/management/permission/PermissionApproval.vue')
      console.log('加载成功', !!mod.default)
      try {
        const wrapper = mountComponent(mod.default || mod)
        console.log('挂载成功', wrapper.html().slice(0, 200))
      } catch (e: any) {
        console.log('挂载失败:', e.message, '\n', e.stack)
      }
    } catch (e: any) {
      console.log('加载失败:', e.message)
    }
  })
})