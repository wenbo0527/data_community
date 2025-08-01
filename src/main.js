import { createApp } from 'vue';
import App from './App.vue';

// 引入mock数据
import './mock/external-data'
import './mock/budget'

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
