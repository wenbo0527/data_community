<template>
  <a-tag :color="conf.color" size="small">
    <template #icon>
      <icon-loading v-if="conf.spin" />
      <span v-else class="uq-dot" :style="{ background: conf.dot }" />
    </template>
    {{ conf.text }}
  </a-tag>
</template>

<script setup lang="ts">
/**
 * 状态标签(F36 颜色语义)
 *
 * 绿 = 成功 / 红 = 失败 / 蓝 = 运行中 / 灰 = 已停用,
 * 执行态与任务态共用一套映射,避免两个页面各写一份颜色表。
 */
import { computed } from 'vue'

type AnyStatus = 'idle' | 'running' | 'success' | 'error' | 'aborted' | 'failed' | 'disabled'

const props = defineProps<{ status: AnyStatus }>()

const MAP: Record<AnyStatus, { text: string; color: string; dot: string; spin?: boolean }> = {
  idle: { text: '空闲', color: 'gray', dot: '#c9cdd4' },
  running: { text: '运行中', color: 'arcoblue', dot: '#165dff', spin: true },
  success: { text: '成功', color: 'green', dot: '#00b42a' },
  error: { text: '失败', color: 'red', dot: '#f53f3f' },
  failed: { text: '失败', color: 'red', dot: '#f53f3f' },
  aborted: { text: '已终止', color: 'orange', dot: '#ff7d10' },
  disabled: { text: '已停用', color: 'gray', dot: '#c9cdd4' }
}

const conf = computed(() => MAP[props.status] ?? MAP.idle)
</script>

<style scoped>
.uq-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  vertical-align: middle;
}
</style>
