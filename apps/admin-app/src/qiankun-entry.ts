/**
 * admin-app Qiankun 子应用入口
 * 通用域子应用 - 完整复刻原有代码结构
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

// 路由配置 - qiankun 模式
const qiankunRoutes = [
  { path: '/', component: IndexVue },
  // 基础路由占位，后续完善完整路由
]

// Qiankun 生命周期
function bootstrap() {
  console.log('[Admin] Qiankun bootstrap')
  return Promise.resolve()
}

function mount(props?: { container?: HTMLElement | ShadowRoot }) {
  console.log('[Admin] Qiankun mount', props)
  
  // qiankun 模式：base 为 /admin/
  const base = '/admin/'
  
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
    console.log('[Admin] Router is ready')
  })
  
  console.log('[Admin] 挂载完成')
  return Promise.resolve()
}

function unmount() {
  console.log('[Admin] Qiankun unmount')
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
;(window as any).adminApp = {
  bootstrap,
  mount,
  unmount
}

// 独立运行模式
if (!isQiankun) {
  const currentPath = window.location.pathname
  const base = currentPath.startsWith('/admin') ? '/admin/' : '/'
  console.log('[Admin] 独立模式启动, base:', base)
  
  router = createRouter({
    history: createWebHistory(base),
    routes: qiankunRoutes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  app.mount('#app')
  
  console.log('[Admin] 独立模式启动')
}