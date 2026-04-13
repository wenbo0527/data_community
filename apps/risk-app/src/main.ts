import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/es/index.css'
import Root from './Root.vue'
import router from './router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let app: any = null

// 创建 Vue 应用实例的函数
function createAppInstance() {
  app = createApp(Root)
  app.use(createPinia())
  app.use(ArcoVue)
  app.use(ArcoVueIcon)
  app.use(router)
  return app
}

// Qiankun 生命周期 - 乾坤环境
renderWithQiankun({
  // 子应用挂载前
  bootstrap() {
    console.log('[Risk] bootstrap')
    return Promise.resolve()
  },
  // 子应用挂载
  mount(props: any) {
    console.log('[Risk] mount props:', JSON.stringify(Object.keys(props || {})))
    console.log('[Risk] qiankunWindow in mount:', qiankunWindow.__POWERED_BY_QIANKUN__, qiankunWindow.ROUTER_BASE)
    createAppInstance()
    
    // 获取挂载容器
    const container = props?.container
    if (container) {
      // Qiankun 已经从 index.html 解析了 DOM，查找已存在的 #app 元素
      const appDiv = container.querySelector('#app')
      if (appDiv) {
        app.mount(appDiv)
      } else {
        // 备用方案：创建新元素
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
  // 子应用卸载
  unmount() {
    console.log('[Risk] unmount')
    if (app) {
      app.unmount()
      app = null
    }
    return Promise.resolve()
  },
  // 可选的更新钩子
  update(props: any) {
    console.log('[Risk] update', props)
    return Promise.resolve()
  }
})

// 独立运行模式 - 非乾坤环境
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[Risk] 独立模式启动')
  createAppInstance()
  app.mount('#app')
  
  router.isReady().then(() => {
    console.log('[Risk] 独立模式路由就绪:', router.currentRoute.value.fullPath)
  })
}
