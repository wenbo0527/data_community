/**
 * 跨模块导航工具
 */
import { useRouter } from 'vue-router'

export function useCrossNav() {
  const router = useRouter()
  return {
    goAssetDetail(tableName: string) { router.push(`/discovery/asset-detail/${tableName}`) },
    goFavorites() { router.push('/discovery/favorites') },
    goImpactAnalysis(tableName: string) { router.push({ path: '/discovery/impact-analysis', query: { table: tableName } }) },
    goPermissionApply(resourceId: string, resourceType: string) {
      router.push({ path: '/management/permission/data-permission/apply', query: { resourceName: resourceId, resourceType } })
    }
  }
}

export default useCrossNav