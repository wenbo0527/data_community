/**
 * 构建专用入口 - 仅包含客户360
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './build-router'

const app = createApp(App)
app.use(router)
app.mount('#app')
