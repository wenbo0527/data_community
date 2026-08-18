<template>
  <div class="backtrack-log-panel">
    <a-collapse :default-active-key="['logs']" :bordered="false">
      <a-collapse-item key="logs" header="详细日志">
        <a-empty v-if="groups.length === 0" description="无日志" />
        <template v-else>
          <a-input-search
            v-model="filter"
            placeholder="按关键词过滤日志（前端过滤）"
            allow-clear
            style="margin-bottom: 12px;"
          />
          <a-collapse :default-active-key="groups.map(g => g.groupId)" :bordered="false">
            <a-collapse-item
              v-for="group in groups"
              :key="group.groupId"
              :header="`${group.groupName}（成功 ${group.successEntries.length} / 错误 ${group.errorEntries.length}）`"
            >
              <a-tabs size="small">
                <a-tab-pane key="success" :title="`成功日志 (${group.successEntries.length})`">
                  <a-empty v-if="filtered(group.successEntries).length === 0" description="无匹配日志" />
                  <div v-else class="entry-list">
                    <div v-for="(e, i) in filtered(group.successEntries)" :key="i" class="entry-row">
                      <span class="ts">{{ e.timestamp }}</span>
                      <a-tag color="green" size="small">成功</a-tag>
                      <span class="meta">session={{ e.session }}</span>
                      <span class="meta">子任务={{ e.subtask }}</span>
                      <span v-if="e.cost" class="meta">耗时={{ e.cost }}</span>
                      <span class="content">{{ e.content }}</span>
                    </div>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="error" :title="`错误日志 (${group.errorEntries.length})`">
                  <a-empty v-if="filtered(group.errorEntries).length === 0" :description="group.errorEntries.length === 0 ? '无错误日志' : '无匹配日志'" />
                  <div v-else class="entry-list">
                    <div v-for="(e, i) in filtered(group.errorEntries)" :key="i" class="entry-row error">
                      <span class="ts">{{ e.timestamp }}</span>
                      <a-tag color="red" size="small">失败</a-tag>
                      <span class="meta">session={{ e.session }}</span>
                      <span class="meta">子任务={{ e.subtask }}</span>
                      <span v-if="e.cost" class="meta">耗时={{ e.cost }}</span>
                      <span class="content">{{ e.content }}</span>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </a-collapse-item>
          </a-collapse>
        </template>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { parseLogGroups } from '../utils/logParser'

const props = defineProps({
  log: { type: Object, default: null }
})

const filter = ref('')
const groups = computed(() => parseLogGroups(props.log))

function filtered(list) {
  const kw = (filter.value || '').trim().toLowerCase()
  if (!kw) return list
  return list.filter(e => {
    return (
      (e.timestamp || '').toLowerCase().includes(kw) ||
      (e.session || '').toLowerCase().includes(kw) ||
      (e.subtask || '').toLowerCase().includes(kw) ||
      (e.content || '').toLowerCase().includes(kw)
    )
  })
}
</script>

<style scoped>
.backtrack-log-panel { margin-top: 12px; }
.entry-list { display: flex; flex-direction: column; gap: 6px; }
.entry-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--color-fill-relaxed);
  border-radius: 4px;
  font-size: 12px;
  flex-wrap: wrap;
}
.entry-row.error { background: var(--color-danger-light-1); }
.ts { font-family: 'SFMono-Regular', Consolas, monospace; color: var(--color-text-2); }
.meta { color: var(--color-text-3); }
.content { color: var(--color-text-1); }
</style>