import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/es/index.css'
import Root from './Root.vue'
import router from './router'

const app = createApp(Root)
app.use(createPinia())
app.use(router)
app.use(ArcoVue)      // 全局注册所有 <a-xxx /> 组件
app.use(ArcoVueIcon)  // 全局注册所有 <icon-xxx /> 组件
app.mount('#app')
// eslint-disable-next-line no-console
console.log('[DFD] 步骤4: +ArcoVue +ArcoVueIcon 完整注册 挂载成功')
