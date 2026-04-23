/**
 * dfd-app Qiankun 子应用入口
 * 数据发现域子应用
 */
import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/es/index.css'
import '../../../src/styles/subapp-tokens.css'
import Root from './Root.vue'
import routes from './router'
import { createRouter, createWebHistory } from 'vue-router'

let app: App | null = null
let router: any = null

const isQiankun = !!(window as any).__POWERED_BY_QIANKUN__

function bootstrap() {
  console.log('[DFD] Qiankun bootstrap')
  return Promise.resolve()
}

function mount(props?: { container?: HTMLElement | ShadowRoot }) {
  console.log('[DFD] Qiankun mount', props)
  
  const base = '/dfd/'
  
  router = createRouter({
    history: createWebHistory(base),
    routes
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
    console.log('[DFD] Router is ready')
  })
  
  return Promise.resolve()
}

function unmount() {
  console.log('[DFD] Qiankun unmount')
  if (app) {
    app.unmount()
    app = null
  }
  if (router) {
    router = null
  }
  return Promise.resolve()
}

;(window as any).dfdApp = {
  bootstrap,
  mount,
  unmount
}

if (!isQiankun) {
  const currentPath = window.location.pathname
  const base = currentPath.startsWith('/dfd') ? '/dfd/' : '/'
  console.log('[DFD] 独立模式启动, base:', base)
  
  router = createRouter({
    history: createWebHistory(base),
    routes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  app.mount('#app')
  
  console.log('[DFD] 独立模式启动')
}
