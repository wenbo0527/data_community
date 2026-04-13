<template>
  <div class="task-flow-config-drawers-test">
    <div>测试组件已挂载</div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

console.log('='.repeat(50))
console.log('[TaskFlowConfigDrawersTest] 🚀🚀🚀 测试组件开始初始化 🚀🚀🚀')
console.log('='.repeat(50))

// 定义 props
const props = defineProps({
  drawerStates: {
    type: Object,
    required: true
  },
  getGraph: {
    type: Function,
    required: true
  }
})

// 定义事件
const emit = defineEmits([
  'config-confirm',
  'config-cancel',
  'visibility-change'
])

console.log('[TaskFlowConfigDrawersTest] Props接收成功:', {
  drawerStates: !!props.drawerStates,
  getGraph: typeof props.getGraph
})

// 测试getGraph函数
try {
  const testGraph = props.getGraph()
  console.log('[TaskFlowConfigDrawersTest] getGraph函数测试结果:', {
    result: !!testGraph,
    type: typeof testGraph,
    constructor: testGraph?.constructor?.name
  })
} catch (testError) {
  console.error('[TaskFlowConfigDrawersTest] getGraph函数测试失败:', testError)
}

// 导入useConfigDrawers
import { useConfigDrawers } from '../composables/canvas/useConfigDrawers.js'

console.log('[TaskFlowConfigDrawersTest] 🔧 开始调用useConfigDrawers...')

// 初始化configDrawersManager
let configDrawersManager
try {
  configDrawersManager = useConfigDrawers(props.getGraph)
  console.log('[TaskFlowConfigDrawersTest] ✅ configDrawersManager初始化成功:', !!configDrawersManager)
  console.log('[TaskFlowConfigDrawersTest] structuredLayout存在:', !!configDrawersManager?.structuredLayout)
} catch (error) {
  console.error('[TaskFlowConfigDrawersTest] ❌ useConfigDrawers初始化失败:', error)
  console.error('[TaskFlowConfigDrawersTest] 错误堆栈:', error.stack)
}

// 暴露给父组件
defineExpose({
  structuredLayout: configDrawersManager?.structuredLayout,
  configDrawersManager
})

onMounted(() => {
  console.log('[TaskFlowConfigDrawersTest] 🎉 组件已挂载')
})
</script>

<style scoped>
.task-flow-config-drawers-test {
  padding: 10px;
  background: #f0f0f0;
  border: 1px solid #ccc;
}
</style>