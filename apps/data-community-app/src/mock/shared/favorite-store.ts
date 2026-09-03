/**
 * favorite-store —— DCA 关注(收藏) store
 *
 * 2026-08-06 新建:统一"我的关注"入口,数据源桥接 dfd-app 的 favorite-directory。
 * 收藏对象 = 资产 / 指标 / 特征 / 特征 / API / 集合,与原版"资产门户"定位一致。
 *
 * 2026-08-12 候选 #172 v3.0 C 级:TASK-20260811-CFC1B6FD
 *   - 跨包 import 修复:从 `'../../../../dfd-app/src/mock/shared/favorite-directory'`
 *     改为本地 `'./favorite-directory'`(DCA 端已复制完整文件,仅 6 行 resourcePath 改为 DCA 路由)
 *   - 上线后:把 mutator 替换为 HTTP 调用即可,业务方不感知。
 */
import { ref, computed } from 'vue'
import {
  FAVORITES,
  type FavoriteItem,
  type FavoriteResourceType,
  type FavoriteGroup,
  type FavoriteNotification
} from './favorite-directory'

// ───────────────────────────── 响应式状态 ─────────────────────────────
const _items = ref<FavoriteItem[]>(FAVORITES.map(f => ({ ...f, tags: [...f.tags] })))

// 当前用户(默认;后续接 useUserStore)
const _currentUserId = ref<string>('user-yunying')

// ───────────────────────────── API ─────────────────────────────
export const FavoriteStore = {
  /** 全部收藏 */
  getAll(): FavoriteItem[] {
    return _items.value
  },
  /** 按用户筛选 */
  byUser(userId: string): FavoriteItem[] {
    return _items.value.filter(f => f.userId === userId)
  },
  /** 当前用户收藏 */
  mine(): FavoriteItem[] {
    return _items.value.filter(f => f.userId === _currentUserId.value)
  },
  /** 按类型筛选 */
  byType(t: FavoriteResourceType): FavoriteItem[] {
    return _items.value.filter(f => f.userId === _currentUserId.value && f.resourceType === t)
  },
  /** 取消收藏 */
  remove(id: string): boolean {
    const idx = _items.value.findIndex(f => f.id === id)
    if (idx === -1) return false
    _items.value.splice(idx, 1)
    return true
  },
  /** 新增收藏 */
  add(input: Omit<FavoriteItem, 'id' | 'createTime' | 'visitCount' | 'lastVisitTime'>) {
    const now = new Date().toISOString().slice(0, 10)
    const newOne: FavoriteItem = {
      id: 'fav_' + Date.now(),
      createTime: now,
      visitCount: 0,
      lastVisitTime: '-',
      ...input
    }
    _items.value.unshift(newOne)
    return newOne
  },
  /** 访问 +1 */
  visit(id: string) {
    const f = _items.value.find(x => x.id === id)
    if (f) {
      f.visitCount++
      f.lastVisitTime = '刚刚'
    }
  },
  /** 切当前用户(测试用) */
  setCurrentUser(userId: string) {
    _currentUserId.value = userId
  },
  getCurrentUser() {
    return _currentUserId.value
  }
}

// ───────────────────────────── 派生常量 ─────────────────────────────
export const FAVORITE_TYPES: { value: FavoriteResourceType; label: string; color: string }[] = [
  { value: 'metric', label: '指标', color: 'arcoblue' },
  { value: 'variable', label: '特征', color: 'green' },
  { value: 'feature', label: '特征', color: 'purple' },
  { value: 'api', label: 'API', color: 'orange' },
  { value: 'table', label: '表', color: 'arcoblue' },
  { value: 'field', label: '字段', color: 'cyan' },
  { value: 'dashboard', label: '看板', color: 'magenta' },
  { value: 'audience', label: '人群', color: 'red' },
  { value: 'tag', label: '标签', color: 'gold' },
  { value: 'service', label: '服务', color: 'arcoblue' },
  { value: 'report', label: '报表', color: 'green' }
]

export const FAVORITE_GROUP_LABEL: Record<FavoriteGroup, string> = {
  personal: '个人',
  team: '团队',
  shared: '共享'
}

export const FAVORITE_GROUP_COLOR: Record<FavoriteGroup, string> = {
  personal: 'gray',
  team: 'arcoblue',
  shared: 'purple'
}

export const FAVORITE_NOTIFICATION_LABEL: Record<FavoriteNotification, string> = {
  none: '不通知',
  on_change: '变更时',
  daily: '每日',
  weekly: '每周'
}

export const FAVORITE_NOTIFICATION_COLOR: Record<FavoriteNotification, string> = {
  none: 'gray',
  on_change: 'red',
  daily: 'orange',
  weekly: 'green'
}

// 类型别名导出
export type { FavoriteItem, FavoriteResourceType, FavoriteGroup, FavoriteNotification }