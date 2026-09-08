/**
 * 路由守卫(P0 角色机制 · Step 6)
 *
 * 检查路由 meta 中的 allowedRoles,如果当前角色不在白名单,跳转到 /unauthorized
 */

import type { Router } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useRoleStore } from '@/stores/role'

export function setupPermissionGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const meta = to.meta as { allowedRoles?: string[]; requireAuth?: boolean }

    // 不需要权限检查
    if (!meta?.allowedRoles && !meta?.requireAuth) {
      next()
      return
    }

    // 需要登录但当前未登录
    const roleStore = useRoleStore()
    const currentRole = roleStore.currentRole

    // 没有 allowedRoles = 全员可访问
    if (!meta.allowedRoles || meta.allowedRoles.length === 0) {
      next()
      return
    }

    // 当前角色在白名单
    if (meta.allowedRoles.includes(currentRole) || meta.allowedRoles.includes('*')) {
      next()
      return
    }

    // 当前角色无权限
    Message.warning(`当前角色(${roleStore.currentRoleDef.label})无权访问该页面`)
    next({
      path: '/unauthorized',
      query: { from: to.fullPath, requiredRole: meta.allowedRoles.join(',') }
    })
  })
}

/**
 * 全局未授权页
 */
export const unauthorizedRoute = {
  path: '/unauthorized',
  name: 'unauthorized',
  meta: { title: '无访问权限' },
  component: () => import('@/components/common/UnauthorizedPage.vue')
}