/**
 * dex-app Qiankun 子应用入口
 * 数据探索域子应用 - 完整复刻原有代码结构
 */
import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/es/index.css'
import '../../../src/styles/subapp-tokens.css'
import Root from './Root.vue'
import { createRouter, createWebHistory } from 'vue-router'

let app: App | null = null
let router: any = null

const isQiankun = !!(window as any).__POWERED_BY_QIANKUN__

// 完整路由配置（与 router.ts 保持一致）
const appRoutes = [
  {
    path: '/',
    name: 'DexIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '数据探索域' }
  },
  {
    path: '/customer360',
    name: 'Customer360',
    component: () => import('./pages/customer360/index.vue'),
    meta: { title: '客户360' }
  },
  {
    path: '/customer360/detail/:userId?',
    name: 'Customer360Detail',
    component: () => import('./pages/customer360/detail.vue'),
    meta: { title: '客户详情' }
  },
  {
    path: '/indicator-dashboard',
    name: 'IndicatorDashboard',
    component: () => import('./pages/indicator-dashboard/index.vue'),
    meta: { title: '指标看板' }
  },
  {
    path: '/analytics-workbench',
    name: 'AnalyticsWorkbench',
    component: () => import('./pages/index.vue'),
    meta: { title: '分析工作台' }
  }
]

function bootstrap() {
  console.log('[DEX] Qiankun bootstrap')
  return Promise.resolve()
}

function mount(props?: { container?: HTMLElement | ShadowRoot }) {
  console.log('[DEX] Qiankun mount', props)
  
  const base = '/dex/'
  
  router = createRouter({
    history: createWebHistory(base),
    routes: appRoutes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  
  const container = props?.container
  if (container) {
    const appDiv = document.createElement('div')
    appDiv.id = 'app'
    container.appendChild(appDiv)
    app.mount(appDiv)
  } else {
    app.mount('#app')
  }
  
  router.isReady().then(() => {
    console.log('[DEX] Router is ready')
  })
  
  console.log('[DEX] 挂载完成')
  return Promise.resolve()
}

function unmount() {
  console.log('[DEX] Qiankun unmount')
  if (app) {
    app.unmount()
    app = null
  }
  if (router) {
    router = null
  }
  return Promise.resolve()
}

;(window as any).dexApp = {
  bootstrap,
  mount,
  unmount
}

if (!isQiankun) {
  const currentPath = window.location.pathname
  const base = currentPath.startsWith('/dex') ? '/dex/' : '/'
  console.log('[DEX] 独立模式启动, base:', base)
  
  router = createRouter({
    history: createWebHistory(base),
    routes: appRoutes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  app.mount('#app')
  
  console.log('[DEX] 独立模式启动')
}