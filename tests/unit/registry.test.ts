import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRegistryStore } from '@/store/modules/registry'
import type { MicroAppRegistry } from '@/shared/registry/types'

// Mock registry for testing
const mockRiskAppRegistry: MicroAppRegistry = {
  app: { name: 'risk-app', version: '1.0.0', description: 'Risk management app' },
  basePath: '/risk',
  entry: 'http://localhost:5176',
  menu: [
    {
      key: 'risk-index',
      label: '工作台',
      icon: 'icon-dashboard',
      path: '/risk',
      order: 1
    },
    {
      key: 'risk-lifecycle',
      label: '外数生命周期',
      icon: 'icon-user',
      path: '/risk/external-data/lifecycle',
      order: 2,
      children: [
        { key: 'risk-lifecycle-list', label: '生命周期', path: '/risk/external-data/lifecycle' }
      ]
    }
  ],
  routes: [
    { path: '/', redirect: '/risk' },
    { path: 'index', name: 'RiskIndex', component: './pages/index.vue', meta: { title: '工作台' } }
  ]
}

const mockTouchRegistry: MicroAppRegistry = {
  app: { name: 'touch', version: '1.0.0', description: 'Touch system app' },
  basePath: '/touch',
  entry: 'http://localhost:5181',
  menu: [
    {
      key: 'touch-index',
      label: '触达首页',
      icon: 'icon-home',
      path: '/touch',
      order: 1
    }
  ],
  routes: [
    { path: '/', redirect: '/touch' },
    { path: 'index', name: 'TouchIndex', component: './pages/index.vue', meta: { title: '触达首页' } }
  ]
}

describe('RegistryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should initialize with empty apps map', () => {
      const store = useRegistryStore()
      expect(store.apps.size).toBe(0)
      expect(store.activeApps).toEqual([])
      expect(store.loaded).toBe(false)
    })

    it('should have correct initial getters', () => {
      const store = useRegistryStore()
      expect(store.allApps).toEqual([])
      expect(store.appCount).toBe(0)
      expect(store.allMenus).toEqual([])
    })
  })

  describe('register action', () => {
    it('should register a new app successfully', () => {
      const store = useRegistryStore()
      store.register(mockRiskAppRegistry)
      
      expect(store.apps.has('risk-app')).toBe(true)
      expect(store.activeApps).toContain('risk-app')
      expect(store.appCount).toBe(1)
    })

    it('should add app to allApps getter', () => {
      const store = useRegistryStore()
      store.register(mockRiskAppRegistry)
      
      expect(store.allApps).toHaveLength(1)
      expect(store.allApps[0].name).toBe('risk-app')
      expect(store.allApps[0].version).toBe('1.0.0')
    })

    it('should skip duplicate app registration with warning', () => {
      const store = useRegistryStore()
      store.register(mockRiskAppRegistry)
      store.register(mockRiskAppRegistry)
      
      expect(store.appCount).toBe(1)
    })

    it('should include menu items from registered app', () => {
      const store = useRegistryStore()
      store.register(mockRiskAppRegistry)
      
      const menus = store.allMenus
      expect(menus).toHaveLength(2) // 2 menu items (workbench + lifecycle)
    })
  })

  describe('unregister action', () => {
    it('should unregister an app successfully', () => {
      const store = useRegistryStore()
      store.register(mockRiskAppRegistry)
      store.unregister('risk-app')
      
      expect(store.apps.has('risk-app')).toBe(false)
      expect(store.activeApps).not.toContain('risk-app')
      expect(store.appCount).toBe(0)
    })

    it('should remove menu items when app is unregistered', () => {
      const store = useRegistryStore()
      store.register(mockRiskAppRegistry)
      expect(store.allMenus).toHaveLength(2)
      
      store.unregister('risk-app')
      expect(store.allMenus).toHaveLength(0)
    })
  })

  describe('registerBatch action', () => {
    it('should register multiple apps at once', () => {
      const store = useRegistryStore()
      store.registerBatch([mockRiskAppRegistry, mockTouchRegistry])
      
      expect(store.appCount).toBe(2)
      expect(store.allApps).toHaveLength(2)
    })

    it('should merge menus from all registered apps', () => {
      const store = useRegistryStore()
      store.registerBatch([mockRiskAppRegistry, mockTouchRegistry])
      
      const menus = store.allMenus
      expect(menus.length).toBeGreaterThanOrEqual(3) // risk-app 2 + touch 1
    })
  })

  describe('allMenus getter', () => {
    it('should sort menus by order property', () => {
      const store = useRegistryStore()
      store.registerBatch([mockTouchRegistry, mockRiskAppRegistry]) // register in reverse order
      
      const menus = store.allMenus
      // touch has order 1, risk has order 1 and 2
      expect(menus[0].key).toBe('touch-index')
    })

    it('should return empty array when no apps registered', () => {
      const store = useRegistryStore()
      expect(store.allMenus).toEqual([])
    })
  })

  describe('getApp getter', () => {
    it('should retrieve app registry by name', () => {
      const store = useRegistryStore()
      store.register(mockRiskAppRegistry)
      
      const app = store.getApp('risk-app')
      expect(app).toBeDefined()
      expect(app?.app.name).toBe('risk-app')
    })

    it('should return undefined for non-existent app', () => {
      const store = useRegistryStore()
      const app = store.getApp('non-existent')
      expect(app).toBeUndefined()
    })
  })

  describe('reset action', () => {
    it('should reset store to initial state', () => {
      const store = useRegistryStore()
      store.register(mockRiskAppRegistry)
      store.register(mockTouchRegistry)
      store.reset()
      
      expect(store.apps.size).toBe(0)
      expect(store.activeApps).toEqual([])
      expect(store.loaded).toBe(false)
    })
  })

  describe('loadAll action', () => {
    it('should skip if already loaded', async () => {
      const store = useRegistryStore()
      store.loaded = true
      
      // Spy on console.log to verify it doesn't try to load again
      const consoleSpy = vi.spyOn(console, 'log')
      await store.loadAll()
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Already loaded'))
    })
  })
})
