import { createApp } from 'vue';
import App from './App.vue';

// 引入mock数据
import './mock/external-data'
import './mock/budget'

// 初始化控制台日志系统（仅在开发环境）
if (import.meta.env.DEV) {
  import('./utils/consoleLogger.js').then(({ initConsoleLogger }) => {
    initConsoleLogger();
    console.log('🚀 控制台日志系统已启动 - 日志将自动保存到技术方案目录');
  });
}

// 配置全局事件监听器为被动模式
const eventOptions = { passive: true };
document.addEventListener('wheel', () => {}, { passive: true });
document.addEventListener('touchstart', () => {}, eventOptions);

import router from './router';
import pinia from './store';
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(ArcoVue);

app.mount('#app');
