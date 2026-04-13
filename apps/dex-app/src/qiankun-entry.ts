/**
 * dex-app Qiankun 子应用入口
 * 数据探索域子应用 - 完整复刻原有代码结构
 */
import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/es/index.css'
import Root from './Root.vue'
import IndexVue from './pages/index.vue'
import { createRouter, createWebHistory } from 'vue-router'

let app: App | null = null
let router: any = null

const isQiankun = !!(window as any).__POWERED_BY_QIANKUN__

const qiankunRoutes = [
  { path: '/', redirect: '/exploration' }
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
    routes: qiankunRoutes
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
    routes: qiankunRoutes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  app.mount('#app')
  
  console.log('[DEX] 独立模式启动')
}