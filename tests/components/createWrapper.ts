/**
 * 组件测试工具函数:封装 mount
 *
 * 增强版:补齐所有 DCA P0/P1 页面用到的 Arco 组件 stub
 *   原版只覆盖 ~30 个,现版本覆盖 ~50 个,可直接 mount 任何业务页面
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
export function setupRouter(routes?: any[]) {
  return createRouter({
    history: createMemoryHistory(),
    routes: routes || [
      { path: '/', component: { template: '<div/>' } },
      { path: '/home', component: { template: '<div/>' } },
      { path: '/home/discovery/:pathMatch(.*)*', component: { template: '<div/>' } },
      { path: '/home/management/:pathMatch(.*)*', component: { template: '<div/>' } },
      { path: '/home/exploration/:pathMatch(.*)*', component: { template: '<div/>' } },
      { path: '/unauthorized', component: { template: '<div/>' } }
    ]
  })
}

/**
 * Arco 组件 stub 工厂
 * 返回完整覆盖 DCA 业务页面的 ~50 个 Arco 组件 stub
 */
export function arcoStubs() {
  return {
    // === 基础 ===
    'a-button': { template: '<button class="arco-button" @click="$emit(\'click\')"><slot/></button>' },
    'a-tag': { template: '<span class="arco-tag"><slot/></span>' },
    'a-card': { template: '<div class="arco-card"><slot/></div>' },
    'a-popover': { template: '<div class="arco-popover"><slot/></div>' },
    'a-avatar': { template: '<div class="arco-avatar"><slot/></div>' },
    'a-modal': { template: '<div class="arco-modal"><slot/></div>' },
    'a-divider': { template: '<hr class="arco-divider"/>' },
    'a-icon': { template: '<i class="arco-icon"><slot/></i>' },
    'a-page-header': { template: '<div class="arco-page-header"><slot/></div>' },
    'a-link': { template: '<a class="arco-link" @click="$emit(\'click\')"><slot/></a>' },
    'a-skeleton': { template: '<div class="arco-skeleton"><slot/></div>' },
    'a-spin': { template: '<div class="arco-spin"><slot/></div>' },
    'a-alert': { template: '<div class="arco-alert"><slot/></div>' },
    'a-badge': { template: '<span class="arco-badge"><slot/></span>' },
    'a-tooltip': { template: '<span class="arco-tooltip"><slot/></span>' },
    'a-image': { template: '<img class="arco-image"><slot/></img>' },
    'a-typography-text': { template: '<span class="arco-typography-text"><slot/></span>' },
    'a-typography-paragraph': { template: '<p class="arco-typography-paragraph"><slot/></p>' },
    'a-affix': { template: '<div class="arco-affix"><slot/></div>' },
    'a-back-top': { template: '<div class="arco-back-top"><slot/></div>' },
    'a-trigger': { template: '<div class="arco-trigger"><slot/></div>' },

    // === 列表 ===
    'a-list': { template: '<div class="arco-list"><slot/></div>' },
    'a-list-item': { template: '<div class="arco-list-item"><slot/></div>' },
    'a-list-item-meta': { template: '<div class="arco-list-item-meta"><slot/></div>' },

    // === 表单 ===
    'a-form': { template: '<form class="arco-form"><slot/></form>' },
    'a-form-item': { template: '<div class="arco-form-item"><slot/></div>' },
    'a-input': { template: '<input class="arco-input" />' },
    'a-input-search': { template: '<input class="arco-input-search" />' },
    'a-input-number': { template: '<input type="number" class="arco-input-number" />' },
    'a-input-password': { template: '<input type="password" class="arco-input-password" />' },
    'a-textarea': { template: '<textarea class="arco-textarea" />' },
    'a-radio-group': { template: '<div class="arco-radio-group"><slot/></div>' },
    'a-radio': { template: '<label class="arco-radio"><slot/></label>' },
    'a-radio-button': { template: '<button class="arco-radio-button"><slot/></button>' },
    'a-checkbox': { template: '<label class="arco-checkbox"><slot/></label>' },
    'a-checkbox-group': { template: '<div class="arco-checkbox-group"><slot/></div>' },
    'a-rate': { template: '<div class="arco-rate"><slot/></div>' },
    'a-upload': { template: '<div class="arco-upload"><slot/></div>' },
    'a-select': { template: '<select class="arco-select" @change="$emit(\'change\', $event.target.value)"><slot/></select>' },
    'a-select-view': { template: '<div class="arco-select-view"><slot/></div>' },
    'a-cascader': { template: '<div class="arco-cascader"><slot/></div>' },
    'a-tree-select': { template: '<div class="arco-tree-select"><slot/></div>' },
    'a-date-picker': { template: '<input class="arco-date-picker" />' },
    'a-time-picker': { template: '<input class="arco-time-picker" />' },
    'a-range-picker': { template: '<input class="arco-range-picker" />' },
    'a-color-picker': { template: '<div class="arco-color-picker"><slot/></div>' },
    'a-mention': { template: '<input class="arco-mention" />' },

    // === 选择 ===
    'a-option': { template: '<option class="arco-option"><slot/></option>' },
    'a-segmented': { template: '<div class="arco-segmented"><slot/></div>' },
    'a-switch': { template: '<button class="arco-switch"><slot/></button>' },
    'a-slider': { template: '<div class="arco-slider"><slot/></div>' },
    'a-rate-list': { template: '<div class="arco-rate-list"><slot/></div>' },

    // === 步骤/进度 ===
    'a-steps': { template: '<div class="arco-steps"><slot/></div>' },
    'a-step': { template: '<div class="arco-step"><slot/></div>' },
    'a-progress': { template: '<div class="arco-progress"><slot/></div>' },
    'a-result': { template: '<div class="arco-result"><slot/></div>' },
    'a-collapse': { template: '<div class="arco-collapse"><slot/></div>' },
    'a-collapse-item': { template: '<div class="arco-collapse-item"><slot/></div>' },
    'a-empty': { template: '<div class="arco-empty"><slot/></div>' },
    'a-statistic': { template: '<div class="arco-statistic"><slot/></div>' },
    'a-descriptions': { template: '<div class="arco-descriptions"><slot/></div>' },
    'a-descriptions-item': { template: '<div class="arco-descriptions-item"><slot/></div>' },
    'a-timeline': { template: '<ul class="arco-timeline"><slot/></ul>' },
    'a-timeline-item': { template: '<li class="arco-timeline-item"><slot/></li>' },

    // === 表格 ===
    'a-table': { template: '<table class="arco-table"><slot/></table>' },
    'a-table-column': { template: '<col class="arco-table-column"><slot/></col>' },
    'a-table-pagination': { template: '<div class="arco-table-pagination"><slot/></div>' },

    // === Tabs ===
    'a-tabs': {
      template: '<div class="arco-tabs"><slot/></div>',
      props: ['defaultActiveKey', 'activeKey']
    },
    'a-tab-pane': { template: '<div class="arco-tab-pane"><slot/></div>' },

    // === 菜单 ===
    'a-menu': { template: '<div class="arco-menu"><slot/></div>' },
    'a-menu-item': { template: '<div class="arco-menu-item" @click="$emit(\'click\')"><slot/></div>' },
    'a-sub-menu': { template: '<div class="arco-sub-menu"><slot/></div>' },

    // === 树 ===
    'a-tree': { template: '<div class="arco-tree"><slot/></div>' },
    'a-tree-node': { template: '<div class="arco-tree-node"><slot/></div>' },

    // === 抽屉 ===
    'a-drawer': {
      template: '<div class="arco-drawer"><slot/></div>',
      props: ['visible', 'title', 'width', 'footer']
    },

    // === 下拉 ===
    'a-dropdown': { template: '<div class="arco-dropdown"><slot/></div>' },
    'a-doption': { template: '<div class="arco-doption" @click="$emit(\'click\')"><slot/></div>' },
    'a-dgroup': { template: '<div class="arco-dgroup"><slot/></div>' },
    'a-dsubmenu': { template: '<div class="arco-dsubmenu"><slot/></div>' },

    // === 布局 ===
    'a-layout': { template: '<div class="arco-layout"><slot/></div>' },
    'a-layout-header': { template: '<header class="arco-layout-header"><slot/></header>' },
    'a-layout-content': { template: '<main class="arco-layout-content"><slot/></main>' },
    'a-layout-sider': { template: '<aside class="arco-layout-sider"><slot/></aside>' },
    'a-layout-footer': { template: '<footer class="arco-layout-footer"><slot/></footer>' },

    // === 面包屑 ===
    'a-breadcrumb': { template: '<nav class="arco-breadcrumb"><slot/></nav>' },
    'a-breadcrumb-item': { template: '<span class="arco-breadcrumb-item"><slot/></span>' },

    // === 行/列 ===
    'a-row': { template: '<div class="arco-row"><slot/></div>' },
    'a-col': { template: '<div class="arco-col"><slot/></div>' },

    // === 间距 ===
    'a-space': { template: '<div class="arco-space"><slot/></div>' },
    'a-space-compact': { template: '<div class="arco-space-compact"><slot/></div>' },

    // === 表单控件补充 ===
    'a-auto-complete': { template: '<input class="arco-auto-complete" />' },

    // === 数据展示 ===
    'a-comment': { template: '<div class="arco-comment"><slot/></div>' },
    'a-anchor': { template: '<div class="arco-anchor"><slot/></div>' },
    'a-anchor-link': { template: '<a class="arco-anchor-link"><slot/></a>' },
    'a-calendar': { template: '<div class="arco-calendar"><slot/></div>' },
    'a-carousel': { template: '<div class="arco-carousel"><slot/></div>' },
    'a-collapse-transition': { template: '<div class="arco-collapse-transition"><slot/></div>' },
    'a-pin-code': { template: '<input class="arco-pin-code" />' },

    // === 其他 ===
    'a-empty-default': { template: '<div class="arco-empty-default"><slot/></div>' }
  }
}

/**
 * 挂载组件并返回 wrapper(增强版)
 *
 * 用法:
 *   const wrapper = mountComponent(MyComponent)
 *   const wrapper = mountComponent(MyComponent, {
 *     props: { foo: 'bar' },
 *     router: customRouter
 *   })
 */
export function mountComponent(
  component: any,
  options: any = {}
): VueWrapper {
  const pinia = setupPinia()
  const router = options.router || setupRouter()

  // 合并默认 stubs + 用户自定义 stubs
  const userStubs = options.global?.plugins ? {} : (options.stubs || {})
  const mergedStubs = { ...arcoStubs(), ...userStubs }

  const { router: _r, stubs: _s, ...rest } = options

  return mount(component, {
    global: {
      plugins: [pinia, router],
      stubs: mergedStubs,
      mocks: {
        $router: router,
        $route: router.currentRoute,
        ...(options.global?.mocks || {})
      }
    },
    ...rest
  })
}