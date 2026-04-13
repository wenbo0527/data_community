import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/es/index.css'
import Root from './Root.vue'
import router from './router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let app: any = null

function createAppInstance() {
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(ArcoVueIcon)
  app.use(router)
  return app
}

renderWithQiankun({
  bootstrap() {
    console.log('[MKT] bootstrap')
    return Promise.resolve()
  },
  mount(props: any) {
    console.log('[MKT] mount props:', JSON.stringify(Object.keys(props || {})))
    createAppInstance()
    const container = props?.container
    if (container) {
      const appDiv = container.querySelector('#app')
      if (appDiv) {
        app.mount(appDiv)
      } else {
        const newDiv = document.createElement('div')
        newDiv.id = 'app'
        container.appendChild(newDiv)
        app.mount(newDiv)
      }
    } else {
      app.mount('#app')
    }
    return Promise.resolve()
  },
  unmount() {
    console.log('[MKT] unmount')
    if (app) {
      app.unmount()
      app = null
    }
    return Promise.resolve()
  },
  update(props: any) {
    console.log('[MKT] update', props)
    return Promise.resolve()
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[MKT] 独立模式启动')
  createAppInstance()
  app.mount('#app')
  router.isReady().then(() => {
    console.log('[MKT] 独立模式路由就绪:', router.currentRoute.value.fullPath)
  })
}
