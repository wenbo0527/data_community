/**
 * 微应用注册中心 Store
 * 负责自动发现、注册、管理所有子应用
 */
import { defineStore } from 'pinia'
import type { MicroAppRegistry, MicroAppInfo, MenuItem } from '@/shared/registry/types'

const useRegistryStore = defineStore('registry', {
  state: () => ({
    /** 已注册的微应用 Map */
    apps: new Map<string, MicroAppRegistry>(),
    /** 活跃的微应用名称列表 */
    activeApps: [] as string[],
    /** 是否已加载 */
    loaded: false
  }),

  getters: {
    /** 获取所有已注册应用的基本信息 */
    allApps: (state): MicroAppInfo[] => {
      return Array.from(state.apps.values()).map(r => r.app)
    },

    /** 根据名称获取应用注册信息 */
    getApp: (state) => (name: string): MicroAppRegistry | undefined => {
      return state.apps.get(name)
    },

    /** 获取合并排序后的所有菜单项 */
    allMenus: (state): MenuItem[] => {
      const menus: MenuItem[] = []
      state.activeApps.forEach(name => {
        const registry = state.apps.get(name)
        if (registry) {
          menus.push(...registry.menu)
        }
      })
      return menus.sort((a, b) => (a.order || 999) - (b.order || 999))
    },

    /** 获取应用数量 */
    appCount: (state): number => {
      return state.apps.size
    }
  },

  actions: {
    /**
     * 注册一个微应用
     */
    register(registry: MicroAppRegistry) {
      if (this.apps.has(registry.app.name)) {
        console.warn(`[Registry] App ${registry.app.name} already registered, skipping...`)
        return
      }
      this.apps.set(registry.app.name, registry)
      this.activeApps.push(registry.app.name)
      console.log(`[Registry] Registered: ${registry.app.name}@${registry.app.version}`)
    },

    /**
     * 注销一个微应用
     */
    unregister(name: string) {
      const registry = this.apps.get(name)
      if (registry?.lifecycle?.unmount) {
        try {
          registry.lifecycle.unmount()
        } catch (err) {
          console.error(`[Registry] Error unmounting ${name}:`, err)
        }
      }
      this.apps.delete(name)
      this.activeApps = this.activeApps.filter(n => n !== name)
      console.log(`[Registry] Unregistered: ${name}`)
    },

    /**
     * 批量注册微应用
     */
    registerBatch(registries: MicroAppRegistry[]) {
      registries.forEach(r => this.register(r))
    },

    /**
     * 加载所有已发现的微应用
     */
    async loadAll() {
      if (this.loaded) {
        console.log('[Registry] Already loaded, skipping...')
        return
      }

      console.log('[Registry] Starting discovery...')

      try {
        // 自动发现所有子应用的 registry
        const modules = import.meta.glob('/apps/*/src/registry.ts', { eager: true })

        for (const [path, module] of Object.entries(modules)) {
          try {
            const registry = (module as { default: MicroAppRegistry }).default
            if (registry?.app?.name) {
              this.register(registry)
            } else {
              console.warn(`[Registry] Invalid registry in ${path}: missing app info`)
            }
          } catch (err) {
            console.warn(`[Registry] Failed to load ${path}:`, err)
          }
        }

        this.loaded = true
        console.log(`[Registry] Discovery complete. Loaded ${this.appCount} apps.`)
      } catch (err) {
        console.error('[Registry] Discovery failed:', err)
      }
    },

    /**
     * 重置注册中心（主要用于测试）
     */
    reset() {
      this.apps.clear()
      this.activeApps = []
      this.loaded = false
    }
  }
})

export default useRegistryStore
export { useRegistryStore }
