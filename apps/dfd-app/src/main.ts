// DFD main entry (替代 qiankun-entry.ts，cherry-pick 8373096c 删除 qiankun 后使用)
// 来源：cherry-pick commit 8373096c qiankun-entry.ts 独立运行分支提取
// 不引入新业务，仅简化为基础 Vue app entry
// 2026-07-07 合并 feat/dmt-classify-excel-import-and-menu-cleanup · 4B3EFC02 · +ArcoVue +ArcoVueIcon
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
console.log('[DFD] main.ts 挂载成功 (cherry-pick 候选 D2 修复 + feat/dmt-classify-excel-import-and-menu-cleanup 合并 ArcoVue)')
