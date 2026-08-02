import { useRouter } from 'vue-router'

/**
 * 跨模块/同模块导航契约
 * 替代散落的 router.push('/xxx/yyy') 字符串
 *
 * 用法:
 *   const { go } = useCrossNav()
 *   go('discovery:data-map')
 *   go('discovery:customer360-detail', { userId: '123' })
 */
export const ROUTE_KEYS = {
  // discovery
  discoveryHome: { module: 'discovery', page: 'index' },
  discoveryDataMap: { module: 'discovery', page: 'data-map' },
  discoveryCustomer360: { module: 'discovery', page: 'customer360' },
  discoveryCustomer360Detail: { module: 'discovery', page: 'customer360/detail', param: 'userId' },
  discoveryMetrics: { module: 'discovery', page: 'metrics-map' },
  discoveryVariable: { module: 'discovery', page: 'variable-map' },
  discoveryLineage: { module: 'discovery', page: 'lineage' },
  discoverySearch: { module: 'discovery', page: 'search' },
  // management
  managementHome: { module: 'management', page: 'service' },
  managementMetadata: { module: 'management', page: 'metadata/modeling' },
  managementStandard: { module: 'management', page: 'data-standard/standards' },
  managementDataPermission: { module: 'management', page: 'permission/data-permission' },
  managementBusinessConcept: { module: 'management', page: 'business-concept' },
  managementService: { module: 'management', page: 'service' },
  // exploration
  explorationHome: { module: 'exploration', page: 'index' },
  explorationTags: { module: 'exploration', page: 'customer-center/tag-system' },
  explorationEvents: { module: 'exploration', page: 'customer-center/event-center' },
  explorationAudience: { module: 'exploration', page: 'customer-center/audience-system/audience-management' },
  explorationWorkflows: { module: 'exploration', page: 'workflows' },
  explorationDashboard: { module: 'exploration', page: 'indicator-dashboard' }
} as const

export type RouteKey = keyof typeof ROUTE_KEYS

/**
 * 路由表:key = "module:page", value = 完整路径
 * 凡是引用了路由跳转的地方都应从此处取值,避免散落字符串
 */
export const ROUTE_TABLE: Record<string, string> = {
  // discovery
  'discovery:index': '/discovery/index',
  'discovery:data-map': '/discovery/data-map',
  'discovery:customer360': '/discovery/customer360',
  'discovery:customer360-detail': '/discovery/customer360/detail/:userId',
  'discovery:metrics-map': '/discovery/metrics-map',
  'discovery:variable-map': '/discovery/variable-map',
  'discovery:lineage': '/discovery/lineage',
  'discovery:search': '/discovery/search',

  // management
  'management:index': '/management/index',
  'management:service': '/management/service',
  'management:metadata-modeling': '/management/metadata/modeling',
  'management:data-permission': '/management/permission/data-permission',
  'management:business-concept': '/management/business-concept',
  'management:data-standard': '/management/data-standard/standards',

  // exploration
  'exploration:index': '/exploration/index',
  'exploration:tag-system': '/exploration/customer-center/tag-system',
  'exploration:event-center': '/exploration/customer-center/event-center',
  'exploration:audience-management': '/exploration/customer-center/audience-system/audience-management',
  'exploration:workflows': '/exploration/workflows',
  'exploration:indicator-dashboard': '/exploration/indicator-dashboard'
}

export function useCrossNav() {
  const router = useRouter()

  /**
   * 跳转到指定 key 路由
   * @param key 例如 'discovery:data-map' 或 'discovery:customer360-detail'
   * @param params 参数替换,例如 { userId: '123' } 会替换 :userId
   */
  const go = (key: string, params?: Record<string, string | number>) => {
    let path = ROUTE_TABLE[key]
    if (!path) {
      console.warn(`[useCrossNav] 未注册的路由 key: ${key}`)
      return Promise.reject(new Error(`Unknown route key: ${key}`))
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        path = path.replace(`:${k}`, String(v))
      })
    }
    return router.push(path)
  }

  /**
   * 仅解析路径,不跳转(用于 a-link href)
   */
  const resolve = (key: string, params?: Record<string, string | number>): string => {
    let path = ROUTE_TABLE[key] || '#'
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        path = path.replace(`:${k}`, String(v))
      })
    }
    return path
  }

  /**
   * 兼容旧菜单配置:从 moduleKey + pageKey 拼接
   */
  const goFromMenuPath = (moduleKey: string, pageKey: string) => {
    return go(`${moduleKey}:${pageKey}`)
  }

  return { go, resolve, goFromMenuPath, ROUTE_KEYS, ROUTE_TABLE }
}