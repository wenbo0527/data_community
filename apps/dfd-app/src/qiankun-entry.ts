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

  return Promise.resolve()
}

function mount(props?: { container?: HTMLElement | ShadowRoot }) {

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

  })
  
  return Promise.resolve()
}

function unmount() {

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

  router = createRouter({
    history: createWebHistory(base),
    routes
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  app.mount('#app')

}
