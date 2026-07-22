<template>
  <div class="metadata-container">
    <!-- 顶部统计 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card hoverable @click="handleStatClick('task')">
          <a-statistic title="采集任务" :value="taskStats.total" :value-style="{ color: '#165DFF' }">
            <template #suffix><span style="font-size: 14px; color: #86909c">个</span></template>
          </a-statistic>
          <div class="stat-extra">
            <a-space :size="8">
              <a-tag color="orange" size="small">运行中 {{ taskStats.running }}</a-tag>
              <a-tag color="red" size="small">失败 {{ taskStats.failed }}</a-tag>
            </a-space>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card hoverable @click="handleStatClick('entity')">
          <a-statistic title="业务实体" :value="entityStats.total" :value-style="{ color: '#722ED1' }">
            <template #suffix><span style="font-size: 14px; color: #86909c">个</span></template>
          </a-statistic>
          <div class="stat-extra">
            <a-space :size="8">
              <a-tag color="green" size="small">已绑定 {{ entityStats.bound }}</a-tag>
              <a-tag color="gray" size="small">未绑定 {{ entityStats.unbound }}</a-tag>
            </a-space>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="血缘关系" :value="lineageStats.total" :value-style="{ color: '#00B42A' }">
            <template #suffix><span style="font-size: 14px; color: #86909c">条</span></template>
          </a-statistic>
          <div class="stat-extra">
            <span style="color: #86909c; font-size: 12px">最近一次解析：{{ lineageStats.lastParsed }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="数据标准" :value="standardStats.total" :value-style="{ color: '#FA8C16' }">
            <template #suffix><span style="font-size: 14px; color: #86909c">条</span></template>
          </a-statistic>
          <div class="stat-extra">
            <a-space :size="8">
              <a-tag color="green" size="small">合规 {{ standardStats.compliant }}</a-tag>
              <a-tag color="red" size="small">不合规 {{ standardStats.nonCompliant }}</a-tag>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 顶层 Tab -->
    <a-tabs v-model:active-key="activeTab" @change="onTabChange">
      <a-tab-pane key="task" title="采集任务">
        <TaskView />
      </a-tab-pane>
      <a-tab-pane key="entity" title="业务实体">
        <EntityView />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TaskView from './task/index.vue'
import EntityView from './entity/index.vue'

const route = useRoute()
const router = useRouter()

// Tab 状态 + deep-link (?tab=task / ?tab=entity)
const activeTab = ref<string>(((route.query.tab as string) || 'task') as string)
const onTabChange = (key: string | number) => {
  router.replace({ query: { ...route.query, tab: String(key) } })
}

// 顶部统计（demo 数据，可后续接入 store）
const taskStats = computed(() => ({
  total: 12,
  running: 3,
  failed: 1
}))
const entityStats = computed(() => ({
  total: 25,
  bound: 18,
  unbound: 7
}))
const lineageStats = computed(() => ({
  total: 42,
  lastParsed: '2026-07-21 09:30'
}))
const standardStats = computed(() => ({
  total: 86,
  compliant: 64,
  nonCompliant: 22
}))

// 点击统计卡片 → 激活对应 Tab（自动滚动到 Tabs 区域）
const handleStatClick = (key: 'task' | 'entity') => {
  activeTab.value = key
  router.replace({ query: { ...route.query, tab: key } })
}
</script>

<style scoped>
.metadata-container {
  padding: 24px;
  background: var(--subapp-bg-secondary);
  min-height: 100%;
}
.stats-row { margin-bottom: 16px; }
.stat-extra {
  margin-top: 6px;
  font-size: 12px;
}
</style>
