// Vue 3 类型声明文件
// 确保 TypeScript 能正确识别 Vue 的所有导出成员

declare module 'vue' {
  // 重新导出 @vue/runtime-dom 的所有内容
  export * from '@vue/runtime-dom'
  
  // 明确声明常用的 Vue 函数
  export { 
    ref, 
    reactive, 
    computed, 
    watch, 
    watchEffect,
    onMounted, 
    onUnmounted, 
    onBeforeMount,
    onBeforeUnmount,
    onUpdated,
    onBeforeUpdate,
    defineComponent, 
    h,
    createApp,
    nextTick,
    provide,
    inject,
    readonly,
    shallowRef,
    shallowReactive,
    toRef,
    toRefs,
    unref,
    isRef,
    isReactive,
    isReadonly,
    isProxy
  } from '@vue/runtime-dom'
  
  // 编译器函数
  export function compileToFunction(template: string | HTMLElement, options?: any): any
  export { compileToFunction as compile }
}