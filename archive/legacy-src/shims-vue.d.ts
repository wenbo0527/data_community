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

// Vue 3 exports are handled by the official Vue package
