// DFD main entry (替代 qiankun-entry.ts，cherry-pick 8373096c 删除 qiankun 后使用)
// 来源：cherry-pick commit 8373096c qiankun-entry.ts 独立运行分支提取
// 不引入新业务，仅简化为基础 Vue app entry
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue/es/arco-vue.js'
import '@arco-design/web-vue/es/index.css'
// 引入 DCA 设计 token(与 data-community-app 共享)
import '../data-community-app/src/styles-dca/tokens.css'
import Root from './Root.vue'
import router from './router'

const app = createApp(Root)
app.use(createPinia())
app.use(ArcoVue)
app.use(router)
app.mount('#app')

console.log('[DFD] main.ts 挂载成功 (cherry-pick 候选 D2 修复)')
