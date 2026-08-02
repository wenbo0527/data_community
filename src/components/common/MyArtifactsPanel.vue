<template>
  <a-card class="my-artifacts" :bordered="false">
    <template #title>
      <div class="panel-header">
        <icon-storage class="header-icon" />
        <span class="header-title">我的产出</span>
        <a-tag size="small">{{ totalCount }}</a-tag>
      </div>
    </template>
    <template #extra>
      <a-link @click="showAll = true">查看全部</a-link>
    </template>

    <a-tabs v-model:active-key="activeTab" size="small">
      <a-tab-pane v-for="tab in tabs" :key="tab.key">
        <template #title>
          {{ tab.title }} ({{ counts[tab.key] }})
        </template>
        <a-empty v-if="counts[tab.key] === 0" :description="`暂无${tab.title}`" />
        <a-list
          v-else
          :data="artifacts.filter(a => a.type === tab.key).slice(0, 4)"
          :bordered="false"
        >
          <template #item="item">
            <a-list-item class="artifact-item">
              <a-list-item-meta>
                <template #avatar>
                  <component :is="getIcon(item.item.type)" class="artifact-icon" />
                </template>
                <template #title>
                  <a-link @click="onOpen(item.item)">{{ item.item.title }}</a-link>
                </template>
                <template #description>
                  <span class="artifact-meta">
                    <a-tag v-if="item.item.status" size="small" :color="statusColor(item.item.status)">
                      {{ statusLabel(item.item.status) }}
                    </a-tag>
                    <span class="artifact-time">{{ item.item.time }}</span>
                  </span>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IconStorage,
  IconBranch,
  IconDesktop,
  IconUserGroup,
  IconTags,
  IconCalendar
} from '@arco-design/web-vue/es/icon'
import { useCrossNav } from '@/composables/useCrossNav'

interface Artifact {
  id: string
  type: 'workflow' | 'dashboard' | 'audience' | 'tag' | 'report' | 'model'
  title: string
  status?: 'running' | 'success' | 'failed' | 'draft'
  time: string
  routeKey: string
}

const props = defineProps<{
  artifacts?: Artifact[]
}>()

const emit = defineEmits<{
  open: [artifact: Artifact]
}>()

const { go } = useCrossNav()
const activeTab = ref('workflow')
const showAll = ref(false)

// 默认 mock 数据(可在 props 覆盖)
const mockArtifacts: Artifact[] = [
  { id: '1', type: 'workflow', title: 'DAU 计算工作流', status: 'success', time: '今天 14:30', routeKey: 'exploration:workflows' },
  { id: '2', type: 'workflow', title: '授信转化漏斗', status: 'running', time: '昨天 09:15', routeKey: 'exploration:workflows' },
  { id: '3', type: 'dashboard', title: 'CEO 经营看板', status: 'success', time: '2 天前', routeKey: 'exploration:indicator-dashboard' },
  { id: '4', type: 'audience', title: '高价值活跃用户', status: 'success', time: '今天 10:00', routeKey: 'exploration:audience-management' },
  { id: '5', type: 'audience', title: '新注册用户', status: 'draft', time: '昨天 16:20', routeKey: 'exploration:audience-management' },
  { id: '6', type: 'tag', title: '信用良好用户', status: 'success', time: '3 天前', routeKey: 'exploration:tag-system' },
  { id: '7', type: 'report', title: 'Q1 销售复盘', status: 'success', time: '上周', routeKey: 'exploration:indicator-dashboard' },
  { id: '8', type: 'model', title: '欺诈检测模型 v2', status: 'failed', time: '昨天 22:00', routeKey: 'exploration:workflows' }
]

const artifacts = computed(() => props.artifacts || mockArtifacts)

const tabs = [
  { key: 'workflow', title: '工作流' },
  { key: 'dashboard', title: '看板' },
  { key: 'audience', title: '人群' },
  { key: 'tag', title: '标签' },
  { key: 'report', title: '报表' },
  { key: 'model', title: '模型' }
]

const counts = computed(() => {
  const map: Record<string, number> = {}
  artifacts.value.forEach(a => {
    map[a.type] = (map[a.type] || 0) + 1
  })
  return map
})

const totalCount = computed(() => artifacts.value.length)

const getIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    workflow: IconBranch,
    dashboard: IconDesktop,
    audience: IconUserGroup,
    tag: IconTags,
    report: IconStorage,
    model: IconCalendar
  }
  return iconMap[type] || IconStorage
}

const statusColor = (s: string) => ({
  running: 'arcoblue',
  success: 'green',
  failed: 'red',
  draft: 'gray'
}[s] || 'gray')

const statusLabel = (s: string) => ({
  running: '运行中',
  success: '成功',
  failed: '失败',
  draft: '草稿'
}[s] || s)

const onOpen = (artifact: Artifact) => {
  emit('open', artifact)
  go(artifact.routeKey)
}
</script>

<style lang="scss" scoped>
.my-artifacts {
  background: #fff;
  border-radius: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;

  .header-icon {
    color: #165dff;
    font-size: 18px;
  }

  .header-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
  }
}

.artifact-item {
  cursor: pointer;
  transition: background-color 0.15s;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 4px;

  &:hover {
    background-color: #f7f8fa;
  }
}

.artifact-icon {
  font-size: 20px;
  color: #165dff;
}

.artifact-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.artifact-time {
  font-size: 12px;
  color: #86909c;
}
</style>