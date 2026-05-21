/**
 * mkt-app Qiankun 子应用入口
 * 营销域子应用 - 完整复刻原有代码结构
 */
import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/es/index.css'
import '../../../src/styles/subapp-tokens.css'
import Root from './Root.vue'
import { createRouter, createWebHistory } from 'vue-router'
import MarketingIndex from './pages/marketing/index.vue'
import BenefitIndex from './pages/benefit/index.vue'
import CanvasIndex from './pages/canvas/index.vue'
import IndexVue from './pages/index.vue'

let app: App | null = null
let router: any = null

// 判断是否在乾坤环境中
const isQiankun = !!(window as any).__POWERED_BY_QIANKUN__

// 路由配置 - qiankun 模式
const qiankunRoutes = [
  { path: '/', component: IndexVue },
  { path: '/benefit', component: BenefitIndex },
  { path: '/canvas', component: CanvasIndex },
  { path: '/marketing', component: MarketingIndex }
]

// Qiankun 生命周期
function bootstrap() {
  console.log('[MKT] Qiankun bootstrap')
  return Promise.resolve()
}

function mount(props?: { container?: HTMLElement | ShadowRoot }) {
  console.log('[MKT] Qiankun mount', props)
  
  // qiankun 模式：base 为 /mkt/
  const base = '/mkt/'
  
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
    console.log('[MKT] Router is ready, current route:', router.currentRoute.value.fullPath)
  })
  
  console.log('[MKT] 挂载完成')
  return Promise.resolve()
}

function unmount() {
  console.log('[MKT] Qiankun unmount')
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
(window as any).mktApp = {
  bootstrap,
  mount,
  unmount
}

// 独立运行模式
if (!isQiankun) {
  const currentPath = window.location.pathname
  // 检测是否通过 /mkt/ 路径访问
  const base = currentPath.startsWith('/mkt') ? '/mkt/' : '/'
  console.log('[MKT] 独立模式启动, 检测 base:', base)
  
  router = createRouter({
    history: createWebHistory(base),
    routes: qiankunRoutes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  app.mount('#app')
  
  console.log('[MKT] 独立模式启动')
}