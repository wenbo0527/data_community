/**
 * data-community-app 路由
 * 数据社区子应用 - 数据发现 + 数据管理 + 数据探索
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'workbench' }
      },
      // ===== 统一工作台 =====
      {
        path: 'workbench',
        name: 'workbench',
        component: () => import('../pages/workbench/index.vue'),
        meta: { title: '数据社区工作台' }
      },
      // ===== 数据发现 =====
      {
        path: 'discovery',
        name: 'discovery',
        component: () => import('../pages/discovery/index.vue'),
        meta: { title: '数据发现' }
      },
      {
        path: 'discovery/data-map',
        name: 'data-map',
        component: () => import('../pages/discovery/data-map/index.vue'),
        meta: { title: '数据地图' }
      },
      {
        // 规范化路径:id 必须是数字,杜绝 '/collection/discovery' 这种把模块名当 id 的误用
        path: 'discovery/collection/:id(\\d+)',
        name: 'collection-detail',
        component: () => import('../pages/discovery/collection-detail.vue'),
        meta: { title: '集合详情' }
      },
      {
        // 兼容老路径:旧的 data-map/collection/:id 仍可访问,避免历史链接 404
        path: 'discovery/data-map/collection/:id(\\d+)',
        alias: ['discovery/collection/:id(\\d+)'],
        component: () => import('../pages/discovery/collection-detail.vue'),
        meta: { title: '集合详情(兼容)' }
      },
      {
        // 客户 360 已从「数据发现」移到「数据探索」,旧路径 discovery/customer360
        // 直接 redirect 到 exploration/customer360,避免 404
        path: 'discovery/customer360',
        redirect: { name: 'Customer360' }
      },
      {
        path: 'exploration/customer360',
        name: 'Customer360',
        component: () => import('../pages/customer360/index.vue'),
        meta: { title: '客户 360' }
      },
      {
        path: 'exploration/customer360/detail',
        name: 'Customer360Detail',
        component: () => import('../pages/customer360/detail.vue'),
        meta: { title: '客户 360 详情' }
      },
      {
        path: 'discovery/asset-catalog',
        name: 'asset-catalog',
        component: () => import('../../../dfd-app/src/pages/asset-catalog/index.vue'),
        // 用真实 dfd 复制版本
        meta: { title: '资产目录' }
      },
      {
        path: 'discovery/asset-overview',
        name: 'asset-overview',
        component: () => import('../../../dfd-app/src/pages/asset-overview/index.vue'),
        meta: { title: '资产概览' }
      },
      {
        path: 'discovery/asset-guide',
        name: 'asset-guide',
        component: () => import('../../../dfd-app/src/pages/asset-guide/index.vue'),
        meta: { title: '资产指南' }
      },
      {
        path: 'discovery/credit',
        name: 'credit',
        component: () => import('../../../dfd-app/src/pages/credit/index.vue'),
        meta: { title: '征信查询' }
      },
      {
        path: 'discovery/external',
        name: 'external',
        component: () => import('../../../dfd-app/src/pages/external/index.vue'),
        meta: { title: '外部数据' }
      },
      {
        path: 'discovery/metrics-map',
        name: 'metrics-map',
        component: () => import('../../../dfd-app/src/pages/metrics-map/index.vue'),
        meta: { title: '指标地图' }
      },
      {
        path: 'discovery/indicator-dict',
        name: 'indicator-dict',
        component: () => import('../../../dfd-app/src/pages/indicator-dict/index.vue'),
        meta: { title: '指标字典' }
      },
      {
        path: 'discovery/unified-metrics',
        name: 'unified-metrics',
        component: () => import('../../../dfd-app/src/pages/unified-metrics/index.vue'),
        meta: { title: '统一指标' }
      },
      {
        path: 'discovery/indicator-dashboard',
        name: 'discovery-indicator-dashboard',
        component: () => import('../../../dfd-app/src/pages/indicator-dashboard/index.vue'),
        meta: { title: '指标看板' }
      },
      {
        path: 'discovery/subway-map',
        name: 'subway-map',
        component: () => import('../pages/discovery/subway-map.vue'),
        meta: { title: '指标地铁图' }
      },
      {
        path: 'discovery/variable-map',
        name: 'variable-map',
        component: () => import('../../../dfd-app/src/pages/variable-map/index.vue'),
        meta: { title: '变量地图' }
      },
      {
        path: 'discovery/variable-dict',
        name: 'variable-dict',
        component: () => import('../../../dfd-app/src/pages/variable-dict/index.vue'),
        meta: { title: '变量字典' }
      },
      {
        path: 'discovery/feature-map',
        name: 'feature-map',
        component: () => import('../../../dfd-app/src/pages/feature-map/index.vue'),
        meta: { title: '特征地图' }
      },
      {
        path: 'discovery/feature-dict',
        name: 'feature-dict',
        component: () => import('../../../dfd-app/src/pages/feature-dict/index.vue'),
        meta: { title: '特征字典' }
      },
      {
        path: 'discovery/api-market',
        name: 'api-market',
        component: () => import('../../../dfd-app/src/pages/api-market/index.vue'),
        meta: { title: 'API 市场' }
      },
      {
        path: 'discovery/lineage',
        name: 'lineage',
        component: () => import('../../../dfd-app/src/pages/lineage/index.vue'),
        meta: { title: '血缘构建' }
      },
      {
        path: 'discovery/impact-analysis',
        name: 'impact-analysis',
        component: () => import('../../../dfd-app/src/pages/impact-analysis/index.vue'),
        meta: { title: '变更影响分析' }
      },
      {
        path: 'discovery/data-resources',
        name: 'data-resources',
        component: () => import('../../../dfd-app/src/pages/data-resources/index.vue'),
        meta: { title: '数据资源目录' }
      },
      {
        // 数据发现门户首页(原 dfd-app/data-map: banner + 搜索 + 常用表集合 + 数据体系全景)
        // 复用 pages/discovery/index.vue(已经是 dfd-app 的中文复制版,带 reactive icon 修复)
        path: 'discovery/overview',
        name: 'discovery-overview',
        component: () => import('../pages/discovery/index.vue'),
        meta: { title: '数据总览' }
      },
      {
        // 我的关注(跨资源/资产/要素)
        path: 'discovery/favorites',
        name: 'discovery-favorites',
        component: () => import('../pages/discovery/favorites/index.vue'),
        meta: { title: '我的关注' }
      },
      // 数据资源子页(类型化入口)
      { path: 'discovery/data-resources/files',    name: 'dr-files',    component: () => import('../pages/discovery/data-resources/files.vue'),    meta: { title: '文件导入' } },
      { path: 'discovery/data-resources/logs',     name: 'dr-logs',     component: () => import('../pages/discovery/data-resources/logs.vue'),     meta: { title: '日志数据' } },
      { path: 'discovery/data-resources/realtime', name: 'dr-realtime', component: () => import('../pages/discovery/data-resources/realtime.vue'), meta: { title: '实时数据' } },
      {
        path: 'discovery/batch-registration',
        name: 'batch-registration',
        component: () => import('../../../dfd-app/src/pages/batch-registration/index.vue'),
        meta: { title: '批量注册' }
      },
      {
        path: 'discovery/regulatory-config',
        name: 'regulatory-config',
        component: () => import('../../../dfd-app/src/pages/regulatory-config/index.vue'),
        meta: { title: '监管报表配置' }
      },
      {
        path: 'discovery/search',
        name: 'search',
        component: () => import('../../../dfd-app/src/pages/search/index.vue'),
        meta: { title: '全局搜索' }
      },
      // ===== 数据管理 =====
      {
        path: 'management',
        name: 'management',
        component: () => import('../../../dfd-app/src/pages/asset-management/index.vue'),
        meta: { title: '数据管理' }
      },
      {
        path: 'management/favorites',
        name: 'favorites',
        component: () => import('../../../dfd-app/src/pages/favorites/index.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'management/notifications',
        name: 'notifications',
        component: () => import('../pages/management/notifications/index.vue'),
        meta: { title: '通知中心' }
      },
      {
        path: 'management/business-concept',
        name: 'business-concept',
        component: () => import('../pages/management/business-concept/index.vue'),
        meta: { title: '业务概念' }
      },
      {
        path: 'management/data-standard/standards',
        name: 'data-standard',
        component: () => import('../pages/management/data-standard/standards.vue'),
        meta: { title: '数据标准' }
      },
      {
        path: 'management/data-standard/detail/:code',
        name: 'data-standard-detail',
        component: () => import('../pages/management/data-standard/detail.vue'),
        meta: { title: '标准详情' }
      },
      {
        path: 'management/data-models',
        name: 'data-models',
        component: () => import('../pages/management/data-models/index.vue'),
        meta: { title: '数据模型' }
      },
      {
        path: 'management/user-groups',
        name: 'user-groups',
        component: () => import('../pages/management/user-groups/index.vue'),
        meta: { title: '用户组管理' }
      },
      {
        path: 'management/metadata/modeling',
        name: 'metadata-modeling',
        component: () => import('../pages/management/metadata/modeling.vue'),
        meta: { title: '元数据建模' }
      },
      {
        path: 'management/service',
        name: 'service',
        component: () => import('../pages/management/service/index.vue'),
        meta: { title: '数据服务' }
      },
      {
        path: 'management/service/api-wizard',
        name: 'api-wizard',
        component: () => import('../pages/management/service/api-wizard.vue'),
        meta: { title: 'API 上架向导' }
      },
      {
        path: 'management/asset-management/asset-tags',
        name: 'asset-tags',
        component: () => import('../pages/management/asset-management/asset-tags/index.vue'),
        meta: { title: '资产标签管理' }
      },
      {
        path: 'management/asset-management/tag-group',
        name: 'tag-group',
        component: () => import('../pages/management/asset-management/tag-group/index.vue'),
        meta: { title: '标签分组管理' }
      },
      {
        path: 'management/permission/data-permission/apply',
        name: 'permission-apply',
        component: () => import('../pages/management/permission/data-permission/apply.vue'),
        meta: { title: '字段权限申请' }
      },
      // ===== 数据探索 =====
      {
        path: 'exploration',
        name: 'exploration',
        component: () => import('../pages/exploration/index.vue'),
        meta: { title: '数据探索' }
      },
      {
        path: 'exploration/workflows',
        name: 'workflows',
        component: () => import('../pages/exploration/workflows.vue'),
        meta: { title: '分析工作流' }
      },
      // ===== 无访问权限 =====
      {
        path: 'unauthorized',
        name: 'unauthorized',
        component: () => import('../components-dca/common/UnauthorizedPage.vue'),
        meta: { title: '无访问权限' }
      },
      // ===== 404 兜底已迁移到 router.beforeEach / afterEach 中 =====
      //   不在这里设置 catch-all,因为 `path: ':pathMatch(.*)*'` 会让
      //   vue-router 把 pathMatch 注入 to.params,后续重定向时残留
      //   报 "Discarded invalid param(s) 'pathMatch'" 并导致「点击搜索跳到 workbench」现象
      //   真正的兜底逻辑见下方 router.beforeEach 末尾与 afterEach
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/dca/'),
  routes
})

// 路由守卫 - P0 角色机制
import { useRoleStore } from "../stores-dca/role";
import { Message } from '@arco-design/web-vue'
import type { RouteLocationRaw } from 'vue-router'

const APP_BASE = '/dca/'

router.beforeEach((to, from, next) => {
  // ===== ⛳ 断点 A: 路由层入口 =====
  // 上线时可移除;当前用于诊断「URL → 组件」链路
  // eslint-disable-next-line no-console
  console.debug('[guard] to.path =', to.path, 'to.params =', to.params, 'to.fullPath =', to.fullPath)

  // ===== 容错 1: 去重双 dca 前缀 =====
  // 注意:next() 的 params 不重置会导致 to.params.pathMatch 残留(catch-all 路由 :pathMatch),
  //   抛出 "Discarded invalid param(s) 'pathMatch'" 警告并导致下一次跳转异常
  if (to.path.startsWith('/dca/dca/')) {
    const nextRoute: RouteLocationRaw = {
      path: to.path.replace(/^\/dca\/dca/, '/dca'),
      query: to.query,
      hash: to.hash,
      replace: true
    }
    // 显式把 params 清空,避免上一轮 catch-all 的 pathMatch 残留
    ;(nextRoute as any).params = {}
    next(nextRoute)
    return
  }

  // ===== 容错 2: 处理绝对路径(包含 /dca 前缀)=====
  if (to.path === '/dca' || to.path === '/dca/') {
    const nextRoute: RouteLocationRaw = { path: '/', replace: true }
    ;(nextRoute as any).params = {}
    next(nextRoute)
    return
  }
  if (to.path.startsWith('/dca/')) {
    const stripped = to.path.substring('/dca'.length)
    const nextRoute: RouteLocationRaw = {
      path: stripped,
      query: to.query,
      hash: to.hash,
      replace: true
    }
    ;(nextRoute as any).params = {}
    next(nextRoute)
    return
  }

  const meta = to.meta as { allowedRoles?: string[]; requireAuth?: boolean }

  if (!meta?.allowedRoles && !meta?.requireAuth) {
    next()
    return
  }

  const roleStore = useRoleStore()
  const currentRole = roleStore.currentRole

  if (!meta.allowedRoles || meta.allowedRoles.length === 0) {
    next()
    return
  }

  if (meta.allowedRoles.includes(currentRole) || meta.allowedRoles.includes('*')) {
    next()
    return
  }

  Message.warning(`当前角色(${roleStore.currentRoleDef.label})无权访问该页面`)
  next({
    path: 'unauthorized',
    query: { from: to.fullPath, requiredRole: meta.allowedRoles.join(',') }
  })
})

/**
 * 404 兜底(替代原 routes 里 path: ':pathMatch(.*)*' 的 catch-all)
 * 不用命名 catch-all 的原因:vue-router 4 会把 pathMatch 注入 to.params,
 *   后续 router.replace / beforeEach 中残留,报 "Discarded invalid param(s) 'pathMatch'"
 *   警告并导致「莫名跳到 workbench」/「侧栏点『数据搜索』跳 workbench」等现象
 *
 * 这里改在 guard 层检测:如果 to.matched 为空(没匹配到任何已声明路由),
 *   就替换成 workbench;同时显式把 to.params 清空,避免 pathMatch 残留
 */
router.beforeEach((to, from, next) => {
  // matched 为空数组 = 当前路径没有任何路由匹配 = 应走 404 兜底
  if (to.matched.length === 0) {
    next({
      name: 'workbench',
      replace: true,
      // 清空 params,即便 catch-all 留下了 pathMatch 也强制丢掉
      params: {}
    } as RouteLocationRaw)
    return
  }
  next()
})

/**
 * afterEach 作为兜底:即使 beforeEach 没拦住,这里再最后检查一次 matched
 *   防止边缘情况下用户拼写错误的路径在应用里露出空白页
 */
router.afterEach((to) => {
  if (to.matched.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('[router] unmatched path:', to.fullPath, '→ 兜底跳 workbench')
  }
  // 兜底:也清掉 params.pathMatch 这一类残留参数,防止后续路由报 warning
  // eslint-disable-next-line no-console
  if (to.params.pathMatch) {
    // eslint-disable-next-line no-console
    console.warn('[router] clearing stale to.params.pathMatch =', to.params.pathMatch)
  }
})

router.isReady().then(() => {
  console.log('[DCA Router] 路由就绪:', router.currentRoute.value.fullPath)
})

export default router