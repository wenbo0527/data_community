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
        // 基础
        'a-button': { template: '<button @click="$emit(\'click\')"><slot/></button>' },
        'a-tag': { template: '<span class="arco-tag"><slot/></span>' },
        'a-card': { template: '<div class="arco-card"><slot/></div>' },
        'a-popover': { template: '<div class="arco-popover"><slot/></div>' },
        'a-avatar': { template: '<div class="arco-avatar"><slot/></div>' },
        'a-modal': { template: '<div class="arco-modal"><slot/></div>' },
        'a-divider': { template: '<hr class="arco-divider"/>' },
        'a-icon': { template: '<i class="arco-icon"><slot/></i>' },
        'a-page-header': { template: '<div class="arco-page-header"><slot/></div>' },

        // 列表
        'a-list': { template: '<div class="arco-list"><slot/></div>' },
        'a-list-item': { template: '<div class="arco-list-item"><slot/></div>' },
        'a-list-item-meta': { template: '<div class="arco-list-item-meta"><slot/></div>' },

        // 表单
        'a-form': { template: '<form class="arco-form"><slot/></form>' },
        'a-form-item': { template: '<div class="arco-form-item"><slot/></div>' },
        'a-input': { template: '<input class="arco-input" />' },
        'a-input-search': { template: '<input class="arco-input-search" />' },
        'a-textarea': { template: '<textarea class="arco-textarea" />' },
        'a-radio-group': { template: '<div class="arco-radio-group"><slot/></div>' },
        'a-radio': { template: '<label class="arco-radio"><slot/></label>' },
        'a-checkbox': { template: '<label class="arco-checkbox"><slot/></label>' },
        'a-checkbox-group': { template: '<div class="arco-checkbox-group"><slot/></div>' },
        'a-rate': { template: '<div class="arco-rate"><slot/></div>' },
        'a-upload': { template: '<div class="arco-upload"><slot/></div>' },

        // 步骤/进度
        'a-steps': { template: '<div class="arco-steps"><slot/></div>' },
        'a-step': { template: '<div class="arco-step"><slot/></div>' },
        'a-progress': { template: '<div class="arco-progress"><slot/></div>' },
        'a-timeline': { template: '<div class="arco-timeline"><slot/></div>' },
        'a-timeline-item': { template: '<div class="arco-timeline-item"><slot/></div>' },
        'a-result': { template: '<div class="arco-result"><slot/></div>' },
        'a-collapse': { template: '<div class="arco-collapse"><slot/></div>' },
        'a-collapse-item': { template: '<div class="arco-collapse-item"><slot/></div>' },
        'a-empty': { template: '<div class="arco-empty"><slot/></div>' },
        'a-statistic': { template: '<div class="arco-statistic"><slot/></div>' },
        'a-descriptions': { template: '<div class="arco-descriptions"><slot/></div>' },
        'a-descriptions-item': { template: '<div class="arco-descriptions-item"><slot/></div>' },

        // 选择
        'a-select': { template: '<select class="arco-select"><slot/></select>' },
        'a-option': { template: '<option class="arco-option"><slot/></option>' },
        'a-segmented': { template: '<div class="arco-segmented"><slot/></div>' },
        'a-switch': { template: '<button class="arco-switch"><slot/></button>' },
        'a-radio-button': { template: '<button class="arco-radio-button"><slot/></button>' },

        // 表格
        'a-table': { template: '<table class="arco-table"><slot/></table>' },
        'a-table-column': { template: '<col class="arco-table-column"><slot/></col>' },

        // Tabs
        'a-tabs': { template: '<div class="arco-tabs"><slot/></div>' },
        'a-tab-pane': { template: '<div class="arco-tab-pane"><slot/></div>' }
      },
      mocks: {
        $router: router,
        $route: router.currentRoute
      }
    },
    ...options
  })
}