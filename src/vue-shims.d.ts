declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vue 3 Composition API 类型声明
declare module 'vue' {
  import { Ref, ComputedRef, WatchOptions, reactive, ref, watch, computed, onMounted } from '@vue/runtime-core'
  
  export { Ref, ComputedRef, WatchOptions, reactive, ref, watch, computed, onMounted }
  
  // 重新导出其他需要的类型
  export * from '@vue/runtime-core'
}

export {}