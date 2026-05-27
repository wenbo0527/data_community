/**
 * Registry Store (Pinia) - 微应用注册中心
 * 从 mkt-app/src/registry.ts 迁移
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem } from '@/shared/registry/types'
import registryConfig from '@/registry'

interface AppInfo {
  name: string
  version: string
  description: string
}

interface RegistryState {
  app: AppInfo | null
  basePath: string
  entry: string
  menu: MenuItem[]
  routes: any[]
}

export const useRegistryStore = defineStore('registry', () => {
  // 状态
  const app = ref<RegistryState['app']>({
    name: registryConfig.app.name,
    version: registryConfig.app.version,
    description: registryConfig.app.description
  })
  const basePath = ref(registryConfig.basePath)
  const entry = ref(registryConfig.entry)
  const menu = ref<MenuItem[]>(registryConfig.menu || [])
  const routes = ref<any[]>(registryConfig.routes || [])

  // 是否已加载
  const isLoaded = ref(true) // 本地配置，直接可用

  // 计算属性：所有菜单
  const allMenus = computed(() => menu.value)

  // 计算属性：注册应用数量
  const appCount = computed(() => 1) // 单应用模式

  // 计算属性：所有应用信息
  const allApps = computed(() => [{
    name: app.value?.name || '',
    version: app.value?.version || '',
    menu: menu.value
  }])

  // 获取应用信息
  function getApp(appName: string) {
    if (app.value?.name === appName) {
      return {
        name: app.value.name,
        version: app.value.version,
        menu: menu.value,
        routes: routes.value
      }
    }
    return null
  }

  // 加载所有注册信息（本地配置，无需异步加载）
  async function loadAll() {
    // 本地配置，直接标记为已加载
    isLoaded.value = true
    return true
  }

  return {
    // 状态
    app,
    basePath,
    entry,
    menu,
    routes,
    isLoaded,

    // 计算属性
    allMenus,
    appCount,
    allApps,

    // 方法
    getApp,
    loadAll
  }
})