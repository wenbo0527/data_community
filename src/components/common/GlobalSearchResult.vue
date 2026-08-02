<template>
  <div class="global-search-result">
    <a-empty v-if="loading" description="搜索中..." />
    <a-empty
      v-else-if="!results || totalCount === 0"
      :description="`未找到与 '${props.keyword}' 相关的结果`"
    />
    <template v-else>
      <div class="result-summary">
        找到 <b>{{ totalCount }}</b> 条结果
      </div>
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane v-for="tab in tabs" :key="tab.key">
          <template #title>
            {{ tab.title }} ({{ results[tab.key]?.length || 0 }})
          </template>
          <a-list
            :data="results[tab.key] || []"
            :bordered="false"
            :pagination-props="false"
          >
            <template #item="item">
              <a-list-item
                class="result-item"
                @click="onClickItem(item.item)"
              >
                <a-list-item-meta
                  :title="item.item.title || item.item.name || item.item.elementName || item.item.chineseName || '(无标题)'"
                  :description="item.item.description || item.item.desc || ''"
                >
                  <template #avatar>
                    <component :is="getIcon(item.item.type || '')" class="result-icon" />
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-tag v-if="item.item.domain" size="small">{{ item.item.domain }}</a-tag>
                  <a-tag v-if="item.item.category" size="small" color="arcoblue">{{ item.item.category }}</a-tag>
                  <a-tag v-if="item.item.entityType" size="small" color="purple">{{ item.item.entityType }}</a-tag>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-tab-pane>
      </a-tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  IconStorage,
  IconBranch,
  IconTags,
  IconCommon,
  IconDesktop,
  IconApps
} from '@arco-design/web-vue/es/icon'
import { searchApi } from '@/api/community'

interface SearchItem {
  id?: string
  name?: string
  title?: string
  elementName?: string
  chineseName?: string
  description?: string
  desc?: string
  domain?: string
  category?: string
  entityType?: string
  type?: string
  routeKey?: string
  routeParams?: Record<string, string | number>
}

interface SearchResults {
  tables: SearchItem[]
  metrics: SearchItem[]
  tags: SearchItem[]
  concepts: SearchItem[]
  dashboards?: SearchItem[]
}

const props = defineProps<{
  keyword: string
}>()

const emit = defineEmits<{
  navigate: [result: { routeKey: string; params?: Record<string, string | number> }]
}>()

const loading = ref(false)
const activeTab = ref('tables')
const results = ref<SearchResults>({
  tables: [],
  metrics: [],
  tags: [],
  concepts: [],
  dashboards: []
})

const tabs = [
  { key: 'tables', title: '数据表', icon: IconStorage },
  { key: 'metrics', title: '指标', icon: IconBranch },
  { key: 'concepts', title: '业务概念', icon: IconCommon },
  { key: 'dashboards', title: '看板', icon: IconDesktop }
] as const

const totalCount = computed(() => {
  if (!results.value) return 0
  return Object.values(results.value).reduce(
    (acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0),
    0
  )
})

const getIcon = (type: string) => {
  if (type.includes('metric')) return IconBranch
  if (type.includes('concept')) return IconCommon
  if (type.includes('tag')) return IconTags
  if (type.includes('dashboard')) return IconDesktop
  return IconStorage
}

const onClickItem = (item: SearchItem) => {
  if (item.routeKey) {
    emit('navigate', { routeKey: item.routeKey, params: item.routeParams })
    return
  }
  // 兜底映射:按 type 字段路由
  const map: Record<string, string> = {
    table: 'discovery:data-map',
    metric: 'discovery:metrics-map',
    concept: 'management:business-concept',
    dashboard: 'exploration:indicator-dashboard'
  }
  const routeKey = map[item.type || 'table'] || 'discovery:search'
  emit('navigate', { routeKey })
}

const doSearch = async (kw: string) => {
  if (!kw) return
  loading.value = true
  try {
    const res: any = await searchApi({ keyword: kw, include: 'all' })
    const data = res.data || res || {}

    results.value = {
      tables: (data.tables || []).map((it: any) => ({
        ...it,
        type: 'table',
        title: it.name || it.title,
        description: it.description || it.desc
      })),
      metrics: (data.metrics || []).map((it: any) => ({
        ...it,
        type: 'metric',
        title: it.name || it.title
      })),
      tags: (data.tags || []).map((it: any) => ({
        ...it,
        type: 'tag',
        title: it.name || it.tagName
      })),
      concepts: (data.concepts?.elements || data.concepts || []).map((it: any) => ({
        ...it,
        type: 'concept',
        title: it.elementName || it.chineseName || it.name,
        description: it.definition || it.description
      })),
      dashboards: (data.dashboards || []).map((it: any) => ({
        ...it,
        type: 'dashboard',
        title: it.name || it.title
      }))
    }

    // 自动切到第一个有结果的 tab
    const firstTab = tabs.find(t => (results.value as any)[t.key]?.length > 0)
    if (firstTab) activeTab.value = firstTab.key
  } catch (err) {
    console.warn('[GlobalSearchResult] 搜索失败', err)
    results.value = { tables: [], metrics: [], tags: [], concepts: [], dashboards: [] }
  } finally {
    loading.value = false
  }
}

watch(
  () => props.keyword,
  kw => doSearch(kw),
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.global-search-result {
  .result-summary {
    padding: 0 0 16px;
    color: #86909c;
    font-size: 13px;
  }

  .result-item {
    cursor: pointer;
    transition: background-color 0.15s;
    &:hover {
      background-color: #f7f8fa;
    }
  }

  .result-icon {
    font-size: 22px;
    color: #165dff;
  }
}
</style>