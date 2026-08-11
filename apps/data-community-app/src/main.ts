import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/es/index.css'
// 2026-08-06:DCA 全局设计 token(CSS 变量),所有页面可直接 var(--dca-xxx) 使用
import './styles-dca/tokens.css'
import Root from './Root.vue'
import router from './router'

const app = createApp(Root)
app.use(createPinia())
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(router)

app.mount('#app')

router.isReady().then(() => {
  console.log('[DCA] 数据社区子应用启动，路由就绪:', router.currentRoute.value.fullPath)
})