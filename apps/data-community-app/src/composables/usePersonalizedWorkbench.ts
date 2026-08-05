/**
 * 个性化工作台(P0 角色机制 · Step 4)
 *
 * 把"当前角色的元数据"封装成易用的 composable,
 * 让 UnifiedWorkbench / 任何页面都能:
 *   - 取当前角色的快捷作业
 *   - 取当前角色的默认着陆页
 *   - 切换角色
 *   - 判断权限
 *
 * 这是统一工作台"按角色分流"的核心 API。
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleStore } from '@/stores-dca/role'
import { useCrossNav } from '@/composables/useCrossNav'
import { SHORTCUT_REGISTRY, ROLE_DEFINITIONS, type ShortcutMeta, type UserRole } from '@/types-dca/roles'

export interface WorkbenchShortcutItem {
  key: string
  title: string
  desc: string
  iconName: string
  module: 'discovery' | 'management' | 'exploration'
  routeKey: string
}

export function usePersonalizedWorkbench() {
  const roleStore = useRoleStore()
  const router = useRouter()
  const { go } = useCrossNav()

  /** 当前角色快捷作业(转 UI 用) */
  const shortcuts = computed<WorkbenchShortcutItem[]>(() =>
    roleStore.shortcuts.map(s => ({
      key: s.key,
      title: s.title,
      desc: s.desc,
      iconName: s.iconName,
      module: s.module,
      routeKey: s.routeKey
    }))
  )

  /** 按模块分组 */
  const shortcutsByModule = computed(() => ({
    discovery: shortcuts.value.filter(s => s.module === 'discovery'),
    management: shortcuts.value.filter(s => s.module === 'management'),
    exploration: shortcuts.value.filter(s => s.module === 'exploration')
  }))

  /** 当前角色元数据 */
  const currentRoleDef = computed(() => roleStore.currentRoleDef)

  /** 当前角色默认着陆页 */
  const defaultLanding = computed(() => roleStore.defaultLanding)

  /**
   * 处理快捷作业点击:跳转到对应路由
   */
  const onShortcutClick = (shortcut: WorkbenchShortcutItem) => {
    try {
      go(shortcut.routeKey as any)
    } catch (e) {
      console.warn(`[usePersonalizedWorkbench] 跳转失败: ${shortcut.routeKey}`, e)
      // 兜底:用 router.push
      const def = SHORTCUT_REGISTRY[shortcut.key as keyof typeof SHORTCUT_REGISTRY]
      if (def) {
        const meta = ROLE_DEFINITIONS[roleStore.currentRole]
        const targetRoute = shortcut.module === 'discovery' ? `${shortcut.key === 'lineage' ? 'discovery/lineage' : `discovery/${shortcut.key}`}`
          : shortcut.module === 'management' ? `management/${shortcut.key}`
          : shortcut.module === 'exploration' ? `exploration/${shortcut.key}`
          : '/'
        // 子应用 base 兼容:去前导 '/'
        const path = targetRoute.startsWith('/') ? targetRoute.substring(1) : targetRoute
        router.push(path || 'workbench')
      }
    }
  }

  /**
   * 角色切换 + 跳转到该角色的默认着陆页
   */
  const switchRoleAndRedirect = (role: UserRole) => {
    const ok = roleStore.switchRole(role)
    if (ok) {
      const def = ROLE_DEFINITIONS[role]
      const path = def.defaultLanding.startsWith('/')
        ? def.defaultLanding.substring(1)
        : def.defaultLanding
      router.push(path)
    }
  }

  /**
   * 工具:判断当前角色对某快捷作业是否有权访问
   */
  const canAccessShortcut = (key: string): boolean => {
    return roleStore.currentRoleDef.shortcuts.includes(key as any)
  }

  return {
    shortcuts,
    shortcutsByModule,
    currentRoleDef,
    defaultLanding,
    onShortcutClick,
    switchRoleAndRedirect,
    canAccessShortcut
  }
}