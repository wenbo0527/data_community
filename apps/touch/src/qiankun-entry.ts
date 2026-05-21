/**
 * touch-app Qiankun 子应用入口
 */
import { createApp, type App } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import * as ArcoIcons from '@arco-design/web-vue/es/icon'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Root from './Root.vue'

let app: App | null = null
let router: any = null

export async function bootstrap() {
  console.log('[Touch] Qiankun bootstrap')
}

export async function mount(props?: { container?: string }) {
  console.log('[Touch] Qiankun mount', props)
  
  const routes = await import('./router')
  router = createRouter({
    history: createWebHistory(window.__POWERED_BY_QIANKUN__ ? '/touch/' : '/'),
    routes: routes.default
  })
  
  app = createApp(Root)
  app.use(ArcoVue)
  app.use(createPinia())
  app.use(router)
  
  Object.keys(ArcoIcons).forEach((key) => {
    const c = (ArcoIcons as Record<string, any>)[key]
    if (c && c.name) app.component(c.name, c)
  })
  
  const container = props?.container || '#app'
  app.mount(container)
  console.log('[Touch] 挂载到', container)
}

export async function unmount() {
  console.log('[Touch] Qiankun unmount')
  if (app) {
    app.unmount()
    app = null
    router = null
  }
}

if (typeof window !== 'undefined' && !(window as any).__POWERED_BY_QIANKUN__) {
  import('./router').then(({ router: routerInstance }) => {
    router = routerInstance
    app = createApp(Root)
    app.use(ArcoVue)
    app.use(createPinia())
    app.use(router)
    Object.keys(ArcoIcons).forEach((key) => {
      const c = (ArcoIcons as Record<string, any>)[key]
      if (c && c.name) app.component(c.name, c)
    })
    router.isReady().then(() => app.mount('#app'))
    console.log('[Touch] 独立模式启动')
  })
}
// 导出 qiankun 生命周期（UMD 格式需要挂载到 window）
;(window as any).touchApp = {
  bootstrap,
  mount,
  unmount
}
