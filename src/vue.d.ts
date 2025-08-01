// Vue 3 全局类型声明
declare module 'vue' {
  export * from '@vue/runtime-core'
  export { ref, reactive, computed, onMounted, watch, nextTick } from '@vue/runtime-core'
  export type { Ref } from '@vue/runtime-core'
}