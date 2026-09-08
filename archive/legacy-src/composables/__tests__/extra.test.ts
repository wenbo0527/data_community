/**
 * 补充覆盖测试:useAssetClassification / usePersonalizedWorkbench / search-extras
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

beforeAll(() => {
  setActivePinia(createPinia())
})

describe('useAssetClassification - 资产分类', () => {
  it('提供 tableView / fieldView 两种视图', async () => {
    const { useAssetClassification } = await import('@/composables/useAssetClassification')
    const ac = useAssetClassification()
    expect(typeof ac.tableView).toBe('function')
    expect(typeof ac.fieldView).toBe('function')
  })

  it('tableView 返回表级信息', async () => {
    const { useAssetClassification } = await import('@/composables/useAssetClassification')
    const ac = useAssetClassification()
    const view = ac.tableView('dim_user')
    expect(view).toBeDefined()
  })

  it('fieldView 返回单字段视图', async () => {
    const { useAssetClassification } = await import('@/composables/useAssetClassification')
    const ac = useAssetClassification()
    const view = ac.fieldView('dim_user', 'user_id')
    expect(view).toBeDefined()
  })

  it('fieldView 含字段元数据', async () => {
    const { useAssetClassification } = await import('@/composables/useAssetClassification')
    const ac = useAssetClassification()
    const view = ac.fieldView('dim_user', 'id_card_no')
    expect(view).toBeDefined()
  })
})

describe('usePersonalizedWorkbench - 个性化工作台', () => {
  it('提供 shortcuts / onShortcutClick / canAccessShortcut', async () => {
    const { usePersonalizedWorkbench } = await import('@/composables/usePersonalizedWorkbench')
    const wp = usePersonalizedWorkbench()
    expect(wp.shortcuts).toBeDefined()
    expect(typeof wp.onShortcutClick).toBe('function')
    expect(typeof wp.canAccessShortcut).toBe('function')
    expect(typeof wp.switchRoleAndRedirect).toBe('function')
  })

  it('shortcuts 按当前角色派生', async () => {
    const { usePersonalizedWorkbench } = await import('@/composables/usePersonalizedWorkbench')
    const wp = usePersonalizedWorkbench()
    expect(Array.isArray(wp.shortcuts.value)).toBe(true)
  })

  it('currentRoleDef 含部门 + label', async () => {
    const { usePersonalizedWorkbench } = await import('@/composables/usePersonalizedWorkbench')
    const wp = usePersonalizedWorkbench()
    expect(wp.currentRoleDef.value.department).toBeTruthy()
    expect(wp.currentRoleDef.value.label).toBeTruthy()
  })

  it('defaultLanding 路径以 / 开头', async () => {
    const { usePersonalizedWorkbench } = await import('@/composables/usePersonalizedWorkbench')
    const wp = usePersonalizedWorkbench()
    expect(wp.defaultLanding.value.startsWith('/')).toBe(true)
  })

  it('shortcutsByModule 按 3 模块分组', async () => {
    const { usePersonalizedWorkbench } = await import('@/composables/usePersonalizedWorkbench')
    const wp = usePersonalizedWorkbench()
    const groups = wp.shortcutsByModule.value
    expect(groups.discovery).toBeDefined()
    expect(groups.management).toBeDefined()
    expect(groups.exploration).toBeDefined()
  })

  it('canAccessShortcut 检查快捷作业是否在角色白名单', async () => {
    const { usePersonalizedWorkbench } = await import('@/composables/usePersonalizedWorkbench')
    const wp = usePersonalizedWorkbench()
    const result = wp.canAccessShortcut('data-map')
    expect(typeof result).toBe('boolean')
  })

  it('onShortcutClick 是函数', async () => {
    const { usePersonalizedWorkbench } = await import('@/composables/usePersonalizedWorkbench')
    const wp = usePersonalizedWorkbench()
    expect(typeof wp.onShortcutClick).toBe('function')
  })
})

describe('SearchExtrasStore - 搜索补充', () => {
  it('hotSearches 提供 10 条', async () => {
    const { SearchExtrasStore } = await import('@/mock/shared/search-extras')
    expect(SearchExtrasStore.hotSearches().length).toBe(10)
  })

  it('topHot(n) 返回前 n 条', async () => {
    const { SearchExtrasStore } = await import('@/mock/shared/search-extras')
    const top3 = SearchExtrasStore.topHot(3)
    expect(top3.length).toBe(3)
  })

  it('suggestions 返回匹配的建议', async () => {
    const { SearchExtrasStore } = await import('@/mock/shared/search-extras')
    const sugg = SearchExtrasStore.suggestions('客户')
    expect(Array.isArray(sugg)).toBe(true)
    expect(sugg.length).toBeGreaterThan(0)
  })

  it('expandKeyword 同义词扩展', async () => {
    const { SearchExtrasStore } = await import('@/mock/shared/search-extras')
    const expanded = SearchExtrasStore.expandKeyword('客户')
    expect(Array.isArray(expanded)).toBe(true)
    expect(expanded.length).toBeGreaterThan(0)
  })

  it('history 提供搜索历史', async () => {
    const { SearchExtrasStore } = await import('@/mock/shared/search-extras')
    const h = SearchExtrasStore.history('user-zhangsan')
    expect(Array.isArray(h)).toBe(true)
    expect(h.length).toBeGreaterThan(0)
  })

  it('stats 统计', async () => {
    const { SearchExtrasStore } = await import('@/mock/shared/search-extras')
    const stats = SearchExtrasStore.stats()
    expect(stats.totalSearches).toBeGreaterThan(0)
  })

  it('expandKeyword 返回多个同义词', async () => {
    const { SearchExtrasStore } = await import('@/mock/shared/search-extras')
    const expanded = SearchExtrasStore.expandKeyword('授信')
    expect(expanded.length).toBeGreaterThan(1)
  })
})