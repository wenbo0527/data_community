/**
 * useMenu Composable - 动态菜单管理
 * 从微应用注册中心获取菜单，支持动态更新
 */
import { computed, onMounted } from 'vue'
import { useRegistryStore } from '@/store'
import type { MenuItem } from '@/shared/registry/types'

// 导出菜单项类型供外部使用
export type { MenuItem }

// 兼容旧版 menuConfig 的菜单项格式
interface LegacyMenuItem {
  key: string
  title: string
  path?: string
  routeName?: string
  icon?: string
  type?: string
  children?: LegacyMenuItem[]
}

/**
 * 转换注册中心菜单为旧版格式
 * 用于兼容 SideMenu 等现有组件
 */
function convertToLegacyMenu(menus: MenuItem[]): LegacyMenuItem[] {
  return menus.map(menu => ({
    key: menu.key,
    title: menu.label,
    path: menu.path,
    icon: menu.icon,
    type: menu.children?.length ? 'group' : 'single',
    children: menu.children ? convertToLegacyMenu(menu.children) : undefined
  }))
}

/**
 * 转换旧版菜单为注册中心格式
 */
function convertToRegistryMenu(items: LegacyMenuItem[]): MenuItem[] {
  return items.map(item => ({
    key: item.key,
    label: item.title,
    path: item.path,
    icon: item.icon,
    children: item.children ? convertToRegistryMenu(item.children) : undefined
  }))
}

export function useMenu() {
  const registryStore = useRegistryStore()

  /**
   * 获取所有已注册应用的合并菜单
   */
  const menus = computed<MenuItem[]>(() => {
    return registryStore.allMenus
  })

  /**
   * 获取扁平化菜单列表（用于搜索）
   */
  const flatMenus = computed<MenuItem[]>(() => {
    const result: MenuItem[] = []
    const flatten = (items: MenuItem[], parentKey = '') => {
      items.forEach(item => {
        result.push(item)
        if (item.children?.length) {
          flatten(item.children, item.key)
        }
      })
    }
    flatten(menus.value)
    return result
  })

  /**
   * 获取旧版格式菜单（兼容现有组件）
   */
  const legacyMenus = computed<LegacyMenuItem[]>(() => {
    return convertToLegacyMenu(menus.value)
  })

  /**
   * 根据 key 查找菜单项
   */
  function findMenuByKey(key: string): MenuItem | undefined {
    return flatMenus.value.find(item => item.key === key)
  }

  /**
   * 根据路径查找菜单项
   */
  function findMenuByPath(path: string): MenuItem | undefined {
    return flatMenus.value.find(item => item.path === path)
  }

  /**
   * 过滤菜单（支持搜索）
   */
  function filterMenus(searchTerm: string): MenuItem[] {
    if (!searchTerm) return menus.value
    
    const term = searchTerm.toLowerCase()
    const result: MenuItem[] = []
    
    const match = (item: MenuItem): boolean => {
      if (item.label.toLowerCase().includes(term)) return true
      if (item.key.toLowerCase().includes(term)) return true
      if (item.children?.some(match)) return true
      return false
    }
    
    menus.value.forEach(item => {
      if (match(item)) {
        result.push(item)
      }
    })
    
    return result
  }

  /**
   * 获取特定应用的菜单
   */
  function getMenusByApp(appName: string): MenuItem[] {
    const registry = registryStore.getApp(appName)
    return registry?.menu || []
  }

  /**
   * 获取已注册应用数量
   */
  const appCount = computed(() => registryStore.appCount)

  /**
   * 获取所有应用信息
   */
  const allApps = computed(() => registryStore.allApps)

  /**
   * 初始化加载所有应用注册信息
   */
  async function loadRegistries() {
    await registryStore.loadAll()
  }

  return {
    menus,
    flatMenus,
    legacyMenus,
    appCount,
    allApps,
    findMenuByKey,
    findMenuByPath,
    filterMenus,
    getMenusByApp,
    loadRegistries,
    convertToRegistryMenu
  }
}
