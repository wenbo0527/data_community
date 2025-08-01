declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vue Router 类型定义
declare module '@vue/runtime-core' {
  import { Router, RouteLocationNormalizedLoaded } from 'vue-router'
  
  interface ComponentCustomProperties {
    $router: Router
    $route: RouteLocationNormalizedLoaded
  }
}

// Ensure Vue 3 exports are available
declare module 'vue' {
  export * from '@vue/runtime-core'
}
