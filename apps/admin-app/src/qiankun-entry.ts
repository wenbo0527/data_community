import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/es/index.css'
import Root from './Root.vue'
import router from './router'

const isQiankun = (window as any).__POWERED_BY_QIANKUN__ || false

function bootstrap() {
  return Promise.resolve({})
}

function mount() {
  const app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(ArcoVueIcon)
  app.use(router)

  if (!isQiankun) {
    app.mount('#app')
  } else {
    return app
  }
}

function unmount() {
  console.log('[Admin] 应用卸载')
}

if (!isQiankun) {
  const app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(ArcoVueIcon)
  app.use(router)
  app.mount('#app')
}

export { bootstrap, mount, unmount }
export default isQiankun ? { bootstrap, mount, unmount } : null
