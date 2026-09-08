import { inject, provide, ref } from 'vue'

const GRAPH_INSTANCE_KEY = Symbol('graph-instance')

export function provideGraphInstance(graph) {
  provide(GRAPH_INSTANCE_KEY, ref(graph))
}

export function useGraphInstance() {
  const graph = inject(GRAPH_INSTANCE_KEY)
  if (!graph) {
    console.warn('[useGraphInstance] 未找到graph实例，请确保在provideGraphInstance作用域内使用')
  }
  return { graph }
}