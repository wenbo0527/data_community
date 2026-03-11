import { createApp } from 'vue'
import Root from './Root.vue'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import * as ArcoIcons from '@arco-design/web-vue/es/icon'
import { router } from './router'

const app = createApp(Root)
app.use(ArcoVue)
app.use(router)

Object.keys(ArcoIcons).forEach((k: string) => {
  const c: any = (ArcoIcons as any)[k]
  if (c && c.name) app.component(c.name, c)
})

router.isReady().then(() => app.mount('#app'))
