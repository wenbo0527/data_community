/**
 * asset-app Qiankun 子应用入口
 * 数据资产域子应用 - 完整复刻原有代码结构
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

// 判断是否在乾坤环境中
const isQiankun = !!(window as any).__POWERED_BY_QIANKUN__

// 路由配置
const qiankunRoutes = [
  { path: '/', redirect: '/asset-management' }
]

// Qiankun 生命周期
function bootstrap() {
  console.log('[Asset] Qiankun bootstrap')
  return Promise.resolve()
}

function mount(props?: { container?: HTMLElement | ShadowRoot }) {
  console.log('[Asset] Qiankun mount', props)
  
  const base = '/asset/'
  
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
    console.log('[Asset] Router is ready')
  })
  
  console.log('[Asset] 挂载完成')
  return Promise.resolve()
}

function unmount() {
  console.log('[Asset] Qiankun unmount')
  if (app) {
    app.unmount()
    app = null
  }
  if (router) {
    router = null
  }
  return Promise.resolve()
}

// 导出 qiankun 生命周期
;(window as any).assetApp = {
  bootstrap,
  mount,
  unmount
}

// 独立运行模式
if (!isQiankun) {
  const currentPath = window.location.pathname
  const base = currentPath.startsWith('/asset') ? '/asset/' : '/'
  console.log('[Asset] 独立模式启动, base:', base)
  
  router = createRouter({
    history: createWebHistory(base),
    routes: qiankunRoutes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  app.mount('#app')
  
  console.log('[Asset] 独立模式启动')
}