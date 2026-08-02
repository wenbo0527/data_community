/**
 * 组件测试工具函数:封装 mount
 */
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

/**
 * 创建一个 Pinia 实例并激活
 */
export function setupPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * 创建一个内存路由(供组件内 useRouter / useRoute 使用)
 */
export function setupRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/discovery', component: { template: '<div/>' } },
      { path: '/management', component: { template: '<div/>' } },
      { path: '/exploration', component: { template: '<div/>' } },
      { path: '/unauthorized', component: { template: '<div/>' } }
    ]
  })
}

/**
 * 挂载组件并返回 wrapper
 */
export function mountComponent(
  component: any,
  options: any = {}
): VueWrapper {
  const pinia = setupPinia()
  const router = setupRouter()

  return mount(component, {
    global: {
      plugins: [pinia, router],
      stubs: {
        'a-button': { template: '<button @click="$emit(\'click\')"><slot/></button>' },
        'a-tag': { template: '<span class="arco-tag"><slot/></span>' },
        'a-card': { template: '<div class="arco-card"><slot/></div>' },
        'a-popover': { template: '<div class="arco-popover"><slot/></div>' },
        'a-avatar': { template: '<div class="arco-avatar"><slot/></div>' },
        'a-list': { template: '<div class="arco-list"><slot/></div>' },
        'a-list-item': { template: '<div class="arco-list-item"><slot/></div>' },
        'a-modal': { template: '<div class="arco-modal"><slot/></div>' },
        'a-divider': { template: '<hr/>' },
        'a-radio-group': { template: '<div class="arco-radio-group"><slot/></div>' },
        'a-radio': { template: '<label class="arco-radio"><slot/></label>' },
        'a-input-search': { template: '<input class="arco-input-search" />' },
        'a-input': { template: '<input class="arco-input" />' }
      },
      mocks: {
        $router: router,
        $route: router.currentRoute
      }
    },
    ...options
  })
}