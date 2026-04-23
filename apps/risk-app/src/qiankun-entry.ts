/**
 * risk-app Qiankun 子应用入口
 * 手动实现生命周期，不依赖 vite-plugin-qiankun
 */
import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/es/index.css'
import '../../../src/styles/subapp-tokens.css'
import Root from './Root.vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { routes } from './router'

let app: App | null = null
let router: any = null

// 判断是否在乾坤环境中
const isQiankun = !!(window as any).__POWERED_BY_QIANKUN__

// 静态路由定义 - qiankun 模式下使用
const qiankunRoutes: RouteRecordRaw[] = [
  { path: '/', redirect: '/external-data/lifecycle' },
  { path: '/index', component: { render: () => null } }
]

// 展开嵌套路由以便支持独立访问
function flattenRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = []
  for (const route of routes) {
    if (route.path) {
      result.push(route)
    }
    if (route.children) {
      result.push(...flattenRoutes(route.children))
    }
  }
  return result
}

// 独立模式专用路由 - 添加 /risk/ 前缀
function getStandaloneRoutes(): RouteRecordRaw[] {
  const flattened = flattenRoutes(routes)
  return flattened.map(r => ({
    ...r,
    path: r.path.startsWith('/') ? '/risk' + r.path : '/risk/' + r.path
  }))
}

// Qiankun 生命周期
function bootstrap() {
  console.log('[Risk] Qiankun bootstrap')
  return Promise.resolve()
}

function mount(props?: { container?: HTMLElement | ShadowRoot }) {
  console.log('[Risk] Qiankun mount', props)
  console.log('[Risk] container type:', props?.container?.constructor?.name)
  
  // qiankun 模式：使用原始路由配置，base 为 /risk/
  const base = '/risk/'
  console.log('[Risk] History base:', base)
  
  router = createRouter({
    history: createWebHistory(base),
    routes: qiankunRoutes
  })
  
  console.log('[Risk] Router created (qiankun mode)')
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  
  // 处理容器挂载
  const container = props?.container
  console.log('[Risk] 开始处理容器挂载')
  
  if (container) {
    const appDiv = document.createElement('div')
    appDiv.id = 'app'
    container.appendChild(appDiv)
    console.log('[Risk] appendChild 完成')
    
    app.mount(appDiv)
    console.log('[Risk] mount 完成')
  } else {
    app.mount('#app')
  }
  
  // 等待路由准备好
  router.isReady().then(() => {
    console.log('[Risk] Router is ready, current route:', router.currentRoute.value.fullPath)
  }).catch((err: any) => {
    console.error('[Risk] Router ready error:', err)
  })
  
  console.log('[Risk] 挂载完成')
  return Promise.resolve()
}

function unmount() {
  console.log('[Risk] Qiankun unmount')
  if (app) {
    app.unmount()
    app = null
  }
  if (router) {
    router = null
  }
  return Promise.resolve()
}

// 导出 qiankun 生命周期（UMD 格式）
;(window as any).riskApp = {
  bootstrap,
  mount,
  unmount
}

// 独立运行模式 - 直接访问 /risk/ 路径时使用
if (!isQiankun) {
  const currentPath = window.location.pathname
  const base = currentPath.startsWith('/risk') ? '/risk/' : '/'
  console.log('[Risk] 独立模式启动, 检测 base:', base)
  
  router = createRouter({
    history: createWebHistory(base),
    routes: routes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  app.mount('#app')
  
  router.isReady().then(() => {
    console.log('[Risk] 独立模式路由就绪:', router.currentRoute.value.fullPath)
  })
  
  console.log('[Risk] 独立模式启动')
}