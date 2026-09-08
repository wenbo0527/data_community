import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'whatwg-fetch'
import { createApp } from 'vue';
import App from './App.vue';

// Mock数据现在通过vite-plugin-mock自动加载

// 初始化控制台日志系统（仅在开发环境）
if (import.meta.env.DEV) {
  import('./utils/consoleLogger.js').then(({ consoleLogger }) => {
    console.log('🚀 控制台日志系统已启动 - 调试日志工具已加载');
  });
}

// 加载调试工具
if (import.meta.env.DEV) {
  import('./utils/debug-node-config.js')
    .then(() => {
      console.info('🔧 节点配置调试工具已加载')
    })
    .catch(err => {
      console.warn('⚠️ 调试工具加载失败:', err)
    })
}

// 在开发环境加载 Mock 接口
if (import.meta.env.DEV) {
  import('./mock/bootstrap.js')
    .then(() => {
      console.info('🧪 Mock 接口已加载')
    })
    .catch(err => {
      console.warn('⚠️ Mock 接口加载失败:', err)
    })
}

// 配置全局事件监听器为被动模式
const eventOptions = { passive: true };
document.addEventListener('wheel', () => {}, { passive: true });
document.addEventListener('touchstart', () => {}, eventOptions);

import router from './router';
import pinia from './store';
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import './style.css';
import * as ArcoIcons from '@arco-design/web-vue/es/icon';

const app = createApp(App);

// 配置Vue警告过滤器，抑制Arco Design组件库内部的警告
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    // 过滤掉Arco Design组件库内部的slot警告
    const isSlotWarning = msg.includes('Slot "default" invoked outside of the render function') ||
                         msg.includes('Slot "content" invoked outside of the render function') ||
                         msg.includes('Slot "label" invoked outside of the render function') ||
                         msg.includes('Slot "suffix" invoked outside of the render function');
    
    // 过滤toRefs相关警告（通常来自组件库内部）
    const isToRefsWarning = msg.includes('toRefs() expects a reactive object but received a plain one');
    
    // 过滤调度器执行期间的未处理错误
    const isSchedulerError = msg.includes('Unhandled error during execution of scheduler flush');
    
    // 检查是否来自Arco Design组件
    const isArcoComponent = trace && (
      trace.includes('ResizeObserver') ||
      trace.includes('Trigger') ||
      trace.includes('Select') ||
      trace.includes('Scrollbar') ||
      trace.includes('SelectDropdown') ||
      trace.includes('BaseTransition') ||
      trace.includes('MenuOverflowWrap') ||
      trace.includes('LayoutHeader') ||
      trace.includes('Layout') ||
      trace.includes('MainLayout')
    );
    
    // 如果是Arco Design组件的slot警告、toRefs警告或调度器错误，则不显示
    if ((isSlotWarning && isArcoComponent) || isToRefsWarning || isSchedulerError) {
      return;
    }
    
    // 其他警告正常显示
    console.warn(`[Vue warn]: ${msg}`, instance, trace);
  };
  // 进一步过滤控制台输出中的 toRefs 警告
  const __origConsoleWarn = console.warn.bind(console);
  console.warn = (...args) => {
    try {
      const [first] = args;
      if (typeof first === 'string' && first.includes('toRefs() expects a reactive object but received a plain one')) {
        return;
      }
    } catch (_) {}
    __origConsoleWarn(...args);
  };
  
  // 配置全局错误处理器
  app.config.errorHandler = (err, instance, info) => {
    // 过滤DOM操作相关错误
    if (err.message && err.message.includes('Cannot read properties of null')) {
      console.debug('DOM操作错误已被过滤:', err.message);
      return;
    }
    
    // 其他错误正常处理
    console.error('Vue应用错误:', err, info);
  };
}

app.use(router);
app.use(pinia);
app.use(ArcoVue);
Object.keys(ArcoIcons).forEach((key) => {
  const comp = ArcoIcons[key];
  if (comp && comp.name) {
    app.component(comp.name, comp);
  }
});

app.mount('#app');
