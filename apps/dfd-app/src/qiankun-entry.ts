import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@arco-design/web-vue/es/index.css'
import Root from './Root.vue'
import router from './router'

const isQiankun = (window as any).__POWERED_BY_QIANKUN__ || false

function bootstrap() {
  return Promise.resolve({})
}

function mount() {
  // qiankun 加载分支
  const app = createApp(Root)
  app.use(createPinia())
  app.use(router)
  return app
}

function unmount() {
  console.log('[DFD] 应用卸载')
}

// 独立运行分支（生产环境实际走这里）
if (!isQiankun) {
  const app = createApp(Root)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
  console.log('[DFD] 独立模式挂载成功')
}

export { bootstrap, mount, unmount }
export default isQiankun ? { bootstrap, mount, unmount } : null
