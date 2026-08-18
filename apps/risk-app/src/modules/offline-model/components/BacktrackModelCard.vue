<template>
  <a-card
    class="model-card"
    :class="{ 'is-main': kind === 'main', 'is-sub': kind === 'sub' }"
    size="small"
  >
    <template #title>
      <div class="card-title">
        <a-tag :color="kind === 'main' ? 'arcoblue' : 'gray'" size="small">
          {{ kind === 'main' ? '主模型' : '子模型' }}
        </a-tag>
        <span class="title-text">{{ fields.model_id }}</span>
        <span class="title-version">V: {{ fields.model_version }}</span>
        <a-tag
          v-if="fields.state !== null && fields.state !== undefined"
          :color="fields.state === 0 ? 'red' : 'green'"
          size="small"
        >{{ fields.state === 0 ? '失败' : '成功' }}</a-tag>
      </div>
    </template>
    <div class="card-fields">
      <div v-if="fields.progress" class="field-row">
        <span class="field-label">进度</span>
        <a-progress :percent="parseProgress(fields.progress)" :show-text="true" size="small" />
      </div>
      <div class="field-row">
        <span class="field-label">结果表</span>
        <span class="field-value">{{ fields.result_table || '―' }}</span>
      </div>
      <div class="field-row">
        <span class="field-label">成功子任务</span>
        <a-tag color="green" size="small">{{ fields.successCount }}</a-tag>
      </div>
      <div class="field-row">
        <span class="field-label">错误信息</span>
        <a-tag :color="fields.errorCount > 0 ? 'red' : 'gray'" size="small">
          {{ fields.errorCount }}
        </a-tag>
        <a-button
          v-if="fields.errorCount > 0"
          type="text"
          size="mini"
          @click="errorExpanded = !errorExpanded"
        >
          {{ errorExpanded ? '收起错误' : `查看 ${fields.errorCount} 条错误` }}
        </a-button>
      </div>
      <div v-if="errorExpanded && fields.errorCount > 0" class="error-list">
        <div v-for="(e, i) in (model.errorInfo || [])" :key="i" class="error-item">
          {{ e }}
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { pickModelCardFields } from '../utils/logParser'

const props = defineProps({
  model: { type: Object, default: null },
  kind: { type: String, default: 'main' }, // 'main' | 'sub'
  includeState: { type: Boolean, default: true }
})

const errorExpanded = ref(false)
const fields = computed(() => pickModelCardFields(props.model, props.includeState) || {
  model_id: '―',
  model_version: '―',
  successCount: 0,
  errorCount: 0
})

function parseProgress(p) {
  if (typeof p === 'number') return Math.max(0, Math.min(100, p))
  if (typeof p === 'string') {
    const n = parseFloat(p.replace('%', ''))
    if (!isNaN(n)) return Math.max(0, Math.min(100, n))
  }
  return 0
}
</script>

<style scoped>
.model-card { margin-bottom: 12px; border: 1px solid var(--color-neutral-3); }
.model-card.is-main { border-left: 3px solid rgb(var(--arcoblue-6)); }
.model-card.is-sub { border-left: 3px solid var(--color-neutral-4); background: var(--color-fill-relaxed); }
.card-title { display: flex; align-items: center; gap: 8px; }
.title-text { font-weight: 600; }
.title-version { color: var(--color-text-3); font-size: 12px; }
.card-fields { display: flex; flex-direction: column; gap: 8px; }
.field-row { display: flex; align-items: center; gap: 8px; }
.field-label { min-width: 80px; color: var(--color-text-3); font-size: 12px; }
.field-value { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px; }
.error-list { margin-top: 4px; padding: 8px; background: var(--color-danger-light-1); border-radius: 4px; }
.error-item { font-size: 12px; color: rgb(var(--red-6)); padding: 2px 0; font-family: 'SFMono-Regular', Consolas, monospace; }
</style>