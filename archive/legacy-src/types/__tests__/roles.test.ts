/**
 * 角色机制单元测试(P0 · Step 7)
 *
 * 覆盖:
 *   1. ROLE_DEFINITIONS 完整性
 *   2. SHORTCUT_REGISTRY 注册完整性
 *   3. canAccessRoute 路由权限
 *   4. getRoleShortcuts 快捷作业
 *   5. roleStore 切换/持久化
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  ROLE_DEFINITIONS,
  SHORTCUT_REGISTRY,
  canAccessRoute,
  getRoleShortcuts,
  type UserRole
} from '../../types/roles'

beforeAll(() => {
  setActivePinia(createPinia())
})

// ==================== 1. ROLE_DEFINITIONS 完整性 ====================

describe('ROLE_DEFINITIONS - 角色定义', () => {
  it('应至少 10 个角色', () => {
    expect(Object.keys(ROLE_DEFINITIONS).length).toBeGreaterThanOrEqual(10)
  })

  it('所有角色都有必需字段', () => {
    Object.values(ROLE_DEFINITIONS).forEach(role => {
      expect(role.role).toBeDefined()
      expect(role.label).toBeTruthy()
      expect(role.department).toBeTruthy()
      expect(role.description).toBeTruthy()
      expect(role.shortcuts.length).toBeGreaterThan(0)
      expect(role.defaultLanding).toBeTruthy()
      expect(role.allowedRoutes).toBeDefined()
      expect(role.color).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(role.avatar).toBeTruthy()
    })
  })

  it('每个角色都有合理数量的快捷作业(4-14)', () => {
    Object.values(ROLE_DEFINITIONS).forEach(role => {
      expect(role.shortcuts.length).toBeGreaterThanOrEqual(4)
      expect(role.shortcuts.length).toBeLessThanOrEqual(14)
    })
  })

  it('所有快捷作业 key 都在 SHORTCUT_REGISTRY 中注册', () => {
    Object.values(ROLE_DEFINITIONS).forEach(role => {
      role.shortcuts.forEach(key => {
        expect(SHORTCUT_REGISTRY).toHaveProperty(key)
      })
    })
  })

  it('所有 defaultLanding 路径都以 / 开头', () => {
    Object.values(ROLE_DEFINITIONS).forEach(role => {
      expect(role.defaultLanding.startsWith('/')).toBe(true)
    })
  })
})

// ==================== 2. SHORTCUT_REGISTRY 完整性 ====================

describe('SHORTCUT_REGISTRY - 快捷作业注册', () => {
  it('应有 17+ 个快捷作业', () => {
    expect(Object.keys(SHORTCUT_REGISTRY).length).toBeGreaterThanOrEqual(17)
  })

  it('每个快捷作业都有 module / routeKey', () => {
    Object.values(SHORTCUT_REGISTRY).forEach(meta => {
      expect(['discovery', 'management', 'exploration']).toContain(meta.module)
      expect(meta.routeKey).toBeTruthy()
      expect(meta.routeKey.includes(':')).toBe(true)
    })
  })

  it('iconName 应为 Arco Icon 名称', () => {
    Object.values(SHORTCUT_REGISTRY).forEach(meta => {
      expect(meta.iconName.startsWith('Icon')).toBe(true)
    })
  })

  it('三个模块都有覆盖', () => {
    const mods = new Set(Object.values(SHORTCUT_REGISTRY).map(m => m.module))
    expect(mods.has('discovery')).toBe(true)
    expect(mods.has('management')).toBe(true)
    expect(mods.has('exploration')).toBe(true)
  })
})

// ==================== 3. canAccessRoute ====================

describe('canAccessRoute - 路由权限', () => {
  it('data_engineer 默认可访问任何路由(*)', () => {
    const r: UserRole = 'data_engineer'
    expect(canAccessRoute(r, 'discovery-data-map')).toBe(true)
    expect(canAccessRoute(r, 'any-route-name')).toBe(true)
  })

  it('admin 始终可访问', () => {
    expect(canAccessRoute('admin', 'anything')).toBe(true)
  })

  it('非法角色返回 false', () => {
    expect(canAccessRoute('invalid' as any, 'foo')).toBe(false)
  })
})

// ==================== 4. getRoleShortcuts ====================

describe('getRoleShortcuts - 快捷作业', () => {
  it('data_engineer 应有 6 个快捷作业', () => {
    const shortcuts = getRoleShortcuts('data_engineer')
    expect(shortcuts.length).toBe(6)
    expect(shortcuts[0].key).toBe('data-map')
  })

  it('admin 应有 14 个快捷作业(最多)', () => {
    const shortcuts = getRoleShortcuts('admin')
    expect(shortcuts.length).toBe(14)
  })

  it('marketing_lead 应包含 audience-system', () => {
    const shortcuts = getRoleShortcuts('marketing_lead')
    expect(shortcuts.find(s => s.key === 'audience-system')).toBeDefined()
  })

  it('risk_analyst 应包含 customer360', () => {
    const shortcuts = getRoleShortcuts('risk_analyst')
    expect(shortcuts.find(s => s.key === 'customer360')).toBeDefined()
  })

  it('每个快捷作业都有完整元数据', () => {
    const shortcuts = getRoleShortcuts('data_admin')
    shortcuts.forEach(s => {
      expect(s.title).toBeTruthy()
      expect(s.desc).toBeTruthy()
      expect(s.routeKey).toBeTruthy()
    })
  })
})

// ==================== 5. roleStore Pinia ====================

describe('useRoleStore - 角色状态管理', () => {
  it('初始角色为 data_engineer', async () => {
    const { useRoleStore } = await import('../../stores/role')
    const store = useRoleStore()
    expect(store.currentRole).toBe('data_engineer')
  })

  it('switchRole 切换成功', async () => {
    const { useRoleStore } = await import('../../stores/role')
    const store = useRoleStore()
    const ok = store.switchRole('marketing_lead')
    expect(ok).toBe(true)
    expect(store.currentRole).toBe('marketing_lead')
  })

  it('switchRole 切换非法角色返回 false', async () => {
    const { useRoleStore } = await import('../../stores/role')
    const store = useRoleStore()
    const ok = store.switchRole('invalid_role' as any)
    expect(ok).toBe(false)
  })

  it('切换后快捷作业跟着变', async () => {
    const { useRoleStore } = await import('../../stores/role')
    const store = useRoleStore()
    store.switchRole('risk_analyst')
    expect(store.currentRoleDef.label).toBe('风控分析师')
    expect(store.shortcuts.some(s => s.key === 'audience-system')).toBe(true)
  })

  it('canAccess 始终 true (* 权限)', async () => {
    const { useRoleStore } = await import('../../stores/role')
    const store = useRoleStore()
    store.switchRole('data_engineer')
    expect(store.canAccess('any-route')).toBe(true)
  })

  it('reset 重置为 data_engineer', async () => {
    const { useRoleStore } = await import('../../stores/role')
    const store = useRoleStore()
    store.switchRole('marketing_lead')
    store.reset()
    expect(store.currentRole).toBe('data_engineer')
  })

  it('defaultLanding 与角色对应', async () => {
    const { useRoleStore } = await import('../../stores/role')
    const store = useRoleStore()
    store.switchRole('marketing_lead')
    expect(store.defaultLanding).toContain('audience')
    store.switchRole('risk_manager')
    expect(store.defaultLanding).toContain('indicator-dashboard')
  })
})

// ==================== 6. 关键角色场景 ====================

describe('关键角色场景验证', () => {
  it('运营主管应能访问圈选和客户 360', () => {
    const shortcuts = getRoleShortcuts('operation_lead')
    expect(shortcuts.find(s => s.key === 'audience-system')).toBeDefined()
    expect(shortcuts.find(s => s.key === 'customer360')).toBeDefined()
  })

  it('财务主管主要看看板和数据权限', () => {
    const shortcuts = getRoleShortcuts('finance_lead')
    expect(shortcuts.find(s => s.key === 'indicator-dashboard')).toBeDefined()
    expect(shortcuts.find(s => s.key === 'data-permission')).toBeDefined()
  })

  it('产品经理应能看客户画像和人群', () => {
    const shortcuts = getRoleShortcuts('product_manager')
    expect(shortcuts.find(s => s.key === 'customer360')).toBeDefined()
    expect(shortcuts.find(s => s.key === 'audience-system')).toBeDefined()
  })

  it('数据治理者应有资产上下架/标准/建模', () => {
    const shortcuts = getRoleShortcuts('data_admin')
    expect(shortcuts.find(s => s.key === 'metadata-modeling')).toBeDefined()
    expect(shortcuts.find(s => s.key === 'data-standard')).toBeDefined()
    expect(shortcuts.find(s => s.key === 'asset-tags')).toBeDefined()
  })

  it('信贷经理应能操作数据服务 API', () => {
    const shortcuts = getRoleShortcuts('loan_manager')
    expect(shortcuts.find(s => s.key === 'service')).toBeDefined()
  })
})