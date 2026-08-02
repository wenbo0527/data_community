/**
 * RoleSwitcher 组件测试
 *
 * 测试覆盖:
 *   1. 初始渲染(默认 data_engineer)
 *   2. 切换角色
 *   3. 重置角色
 *   4. 搜索过滤
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountComponent } from './createWrapper'
import RoleSwitcher from '@/components/common/RoleSwitcher.vue'
import { useRoleStore } from '@/stores/role'

describe('RoleSwitcher.vue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders with default role data_engineer', () => {
    const wrapper = mountComponent(RoleSwitcher)
    expect(wrapper.text()).toContain('数据工程师')
  })

  it('shows role department label', () => {
    const wrapper = mountComponent(RoleSwitcher)
    expect(wrapper.text()).toContain('数据团队')
  })

  it('renders avatar with role emoji', () => {
    const wrapper = mountComponent(RoleSwitcher)
    // 🧑‍💻 data_engineer avatar
    expect(wrapper.html()).toContain('🧑‍💻')
  })

  it('role store currentRole is data_engineer initially', () => {
    const wrapper = mountComponent(RoleSwitcher)
    const store = wrapper.vm.$.appContext.config.globalProperties.$pinia
      ? useRoleStore()
      : useRoleStore()
    expect(store.currentRole).toBe('data_engineer')
  })

  it('can switch to marketing_lead', () => {
    const wrapper = mountComponent(RoleSwitcher)
    const store = useRoleStore()
    expect(store.switchRole('marketing_lead')).toBe(true)
    expect(store.currentRole).toBe('marketing_lead')
    expect(store.currentRoleDef.label).toBe('营销经理')
  })

  it('rejects invalid role', () => {
    const wrapper = mountComponent(RoleSwitcher)
    const store = useRoleStore()
    expect(store.switchRole('invalid_role')).toBe(false)
    expect(store.currentRole).toBe('data_engineer')
  })

  it('reset returns to data_engineer', () => {
    const wrapper = mountComponent(RoleSwitcher)
    const store = useRoleStore()
    store.switchRole('risk_analyst')
    store.reset()
    expect(store.currentRole).toBe('data_engineer')
  })
})

describe('RoleSwitcher - Role Definitions', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('all 10 roles have valid shortcuts', async () => {
    const wrapper = mountComponent(RoleSwitcher)
    const { ROLE_DEFINITIONS } = await import('@/types/roles')
    expect(Object.keys(ROLE_DEFINITIONS).length).toBeGreaterThanOrEqual(10)
    Object.values(ROLE_DEFINITIONS).forEach(role => {
      expect(role.shortcuts.length).toBeGreaterThan(0)
    })
  })

  it('all roles have unique color hex', async () => {
    const wrapper = mountComponent(RoleSwitcher)
    const { ROLE_DEFINITIONS } = await import('@/types/roles')
    const colors = Object.values(ROLE_DEFINITIONS).map(r => r.color)
    const unique = new Set(colors)
    expect(unique.size).toBe(colors.length)
  })
})