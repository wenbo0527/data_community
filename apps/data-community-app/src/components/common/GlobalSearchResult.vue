<template>
  <div class="global-search-result">
    <a-empty v-if="loading" description="搜索中..." />
    <a-empty
      v-else-if="!results || totalCount === 0"
      :description="`未找到与 '${props.keyword}' 相关的结果`"
    />
    <template v-else>
      <div class="result-summary">
        找到 <b>{{ totalCount }}</b> 条结果 · 已按"用户意图"分组
      </div>

      <!-- 1. 智能意图推荐(P0#1 整合点:不按数据类型,按意图) -->
      <section v-if="intentCards.length > 0" class="intent-section">
        <div class="intent-title">意图推荐</div>
        <div class="intent-grid">
          <div
            v-for="card in intentCards"
            :key="card.key"
            class="intent-card"
            @click="onIntentClick(card)"
          >
            <component :is="card.icon" class="intent-icon" />
            <div class="intent-content">
              <div class="intent-card-title">{{ card.title }}</div>
              <div class="intent-card-desc">{{ card.desc }}</div>
            </div>
            <icon-right class="intent-arrow" />
          </div>
        </div>
      </section>

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
  IconApps,
  IconUserGroup,
  IconRight
} from '@arco-design/web-vue/es/icon'
import { searchApi } from '@/api/search-shim'

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

    // P0#1: 生成意图推荐卡片
    intentCards.value = generateIntentCards(kw, results.value)
  } catch (err) {
    console.warn('[GlobalSearchResult] 搜索失败', err)
    results.value = { tables: [], metrics: [], tags: [], concepts: [], dashboards: [] }
    intentCards.value = []
  } finally {
    loading.value = false
  }
}

// === P0#1: 意图识别 ===
interface IntentCard {
  key: string
  title: string
  desc: string
  icon: any
  routeKey: string
  params?: Record<string, string>
}

const intentCards = ref<IntentCard[]>([])

// 客户相关关键词
const CUSTOMER_KEYWORDS = ['客户', 'user', '用户', '授信', '信贷', 'loan', '客户数', '客户画像', '客户360', '客户洞察']
// 指标相关
const METRIC_KEYWORDS = ['指标', 'metric', '日活', 'dau', 'gmv', '转化率']
// 数据源相关
const SOURCE_KEYWORDS = ['数据源', 'datasource', '数据库', 'kafka', 'mysql']
// 看板相关
const BOARD_KEYWORDS = ['看板', 'dashboard', '报表', 'report', '驾驶舱']

const generateIntentCards = (kw: string, res: SearchResults): IntentCard[] => {
  const lower = kw.toLowerCase()
  const cards: IntentCard[] = []

  // 1. 客户洞察(命中客户关键词 或 results.tags/metrics 里有客户相关)
  const isCustomerIntent = CUSTOMER_KEYWORDS.some(k => lower.includes(k.toLowerCase()))
  if (isCustomerIntent) {
    cards.push({
      key: 'customer-insight',
      title: '查看客户洞察',
      desc: `跳转到客户 360,预填搜索"${kw}"`,
      icon: IconUserGroup,
      routeKey: 'discovery:customer360',
      params: { keyword: kw }
    })
  }

  // 2. 数据地图(有表)
  if (res.tables.length > 0) {
    cards.push({
      key: 'browse-tables',
      title: `浏览 ${res.tables.length} 张数据表`,
      desc: '在数据地图中查看详情与血缘',
      icon: IconStorage,
      routeKey: 'discovery:data-map'
    })
  }

  // 3. 指标地图(有指标)
  if (res.metrics.length > 0) {
    cards.push({
      key: 'browse-metrics',
      title: `查看 ${res.metrics.length} 个指标定义`,
      desc: '在指标地图中查看业务口径',
      icon: IconBranch,
      routeKey: 'discovery:metrics-map'
    })
  }

  // 4. 看板(命中看板关键词)
  if (BOARD_KEYWORDS.some(k => lower.includes(k.toLowerCase())) || res.dashboards.length > 0) {
    cards.push({
      key: 'browse-dashboards',
      title: `查看看板/报表`,
      desc: '在指标看板中浏览可视化',
      icon: IconDesktop,
      routeKey: 'exploration:indicator-dashboard'
    })
  }

  // 5. 数据源(命中)
  if (SOURCE_KEYWORDS.some(k => lower.includes(k.toLowerCase()))) {
    cards.push({
      key: 'browse-sources',
      title: '查看数据源',
      desc: '管理数据源接入',
      icon: IconStorage,
      routeKey: 'exploration:tag-system'
    })
  }

  // 6. 业务概念(命中)
  if (res.concepts.length > 0) {
    cards.push({
      key: 'browse-concepts',
      title: `查看 ${res.concepts.length} 个业务概念`,
      desc: '在业务概念图谱中浏览',
      icon: IconCommon,
      routeKey: 'management:business-concept'
    })
  }

  return cards.slice(0, 4) // 最多 4 张
}

const onIntentClick = (card: IntentCard) => {
  emit('navigate', { routeKey: card.routeKey, params: card.params })
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

  // P0#1: 意图卡片样式
  .intent-section {
    margin-bottom: 24px;

    .intent-title {
      font-size: 13px;
      font-weight: 500;
      color: #4e5969;
      margin-bottom: 12px;
    }

    .intent-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .intent-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: linear-gradient(90deg, #f0f7ff 0%, #ffffff 100%);
      border: 1px solid #e8f3ff;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        border-color: #165dff;
        transform: translateX(4px);
        box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
      }

      .intent-icon {
        font-size: 24px;
        color: #165dff;
        flex-shrink: 0;
      }

      .intent-content {
        flex: 1;
        min-width: 0;
      }

      .intent-card-title {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
      }

      .intent-card-desc {
        font-size: 12px;
        color: #86909c;
        margin-top: 2px;
      }

      .intent-arrow {
        color: #c9cdd4;
        font-size: 14px;
      }
    }
  }
}
</style>