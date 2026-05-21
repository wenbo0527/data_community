/**
 * risk-app Qiankun 子应用入口
 * 同时支持独立运行和 Qiankun 微前端模式
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/es/index.css'
import Root from './Root.vue'
import router from './router'

// 判断是否在 Qiankun 环境中
const isQiankun = window.__POWERED_BY_QIANKUN__ || false

// 创建 Vue 应用
function bootstrap() {
  return new Promise((resolve) => {
    resolve({})
  })
}

function mount() {
  const app = createApp(Root)
  
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(ArcoVueIcon)
  app.use(router)
  
  // 独立运行时直接挂载
  if (!isQiankun) {
    app.mount('#app')
  } else {
    // Qiankun 环境下返回应用实例
    return app
  }
}

function unmount() {
  // Qiankun 卸载时清理
  console.log('[Risk] 应用卸载')
}

// 独立运行时直接启动
if (!isQiankun) {
  const app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(ArcoVueIcon)
  app.use(router)
  app.mount('#app')
}

// Qiankun 生命周期导出
export { bootstrap, mount, unmount }

// 兼容 ES Module 命名导出
export default isQiankun ? { bootstrap, mount, unmount } : null
