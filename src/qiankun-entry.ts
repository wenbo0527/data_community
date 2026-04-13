/**
 * data-community Qiankun 子应用入口
 */
import { createApp, type App } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import * as ArcoIcons from '@arco-design/web-vue/es/icon'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Root from './App.vue'

let app: App | null = null
let router: any = null

export async function bootstrap() {
  console.log('[DataCommunity] Qiankun bootstrap')
}

export async function mount(props?: { container?: string }) {
  console.log('[DataCommunity] Qiankun mount', props)
  
  const routes = await import('./router')
  router = createRouter({
    history: createWebHistory(window.__POWERED_BY_QIANKUN__ ? '/community/' : '/'),
    routes: routes.default
  })
  
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(router)
  
  Object.keys(ArcoIcons).forEach((key) => {
    const c = (ArcoIcons as Record<string, any>)[key]
    if (c && c.name) app.component(c.name, c)
  })
  
  const container = props?.container || '#app'
  app.mount(container)
  console.log('[DataCommunity] 挂载到', container)
}

export async function unmount() {
  console.log('[DataCommunity] Qiankun unmount')
  if (app) {
    app.unmount()
    app = null
    router = null
  }
}

// 独立运行模式在 main.js 中