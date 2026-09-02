<template>
  <div class="global-search-result">
    <a-spin :loading="loading" style="width: 100%">
      <a-empty v-if="!loading && totalCount === 0" :description="`未找到与 '${props.keyword}' 相关的结果`" />

      <template v-else>
        <div class="result-summary">
          找到 <b>{{ totalCount }}</b> 条结果 · 已按"用户意图"分组
        </div>

        <!-- P0#1: 意图推荐卡片(分组放在顶部) -->
        <section v-if="intentCards.length > 0" class="intent-section">
          <div class="intent-title">意图推荐</div>
          <a-row :gutter="[16, 16]">
            <a-col
              v-for="card in intentCards"
              :key="card.key"
              :xs="24" :sm="12" :md="12" :lg="8" :xl="6"
            >
              <AssetCard
                :title="card.title"
                type="intent"
                :tags="[{ label: '推荐', value: card.title }]"
                :description="card.desc"
                :icon="card.icon"
                theme-color="blue"
                @click="onIntentClick(card)"
              />
            </a-col>
          </a-row>
        </section>

        <!-- 详情结果(按类型分 tab,每个 tab 内统一用 AssetCard 卡片网格) -->
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane v-for="tab in tabs" :key="tab.key">
            <template #title>
              {{ tab.title }} ({{ results[tab.key]?.length || 0 }})
            </template>
            <a-empty
              v-if="(results[tab.key] || []).length === 0"
              :description="`该分类暂无结果`"
            />
            <a-row v-else :gutter="[16, 16]">
              <a-col
                v-for="(item, idx) in results[tab.key]"
                :key="(item.id || item.name || item.title || '') + '-' + idx"
                :xs="24" :sm="12" :md="8" :lg="6"
              >
                <AssetCard
                  :title="getItemTitle(item)"
                  :type="getItemTypeLabel(item)"
                  :tags="getItemTags(item)"
                  :meta-lines="getItemMetaLines(item)"
                  :description="getItemDesc(item)"
                  @click="onClickItem(item)"
                />
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { searchApi } from '@/api/search-shim'
import AssetCard from '@/components-dca/common/AssetCard.vue'
import type { MetaTag } from '@/components-dca/common/AssetCard.vue'

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
  owner?: string
  updateTime?: string
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

const props = defineProps<{ keyword: string }>()

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
  { key: 'tables', title: '数据表' },
  { key: 'metrics', title: '指标' },
  { key: 'concepts', title: '业务概念' },
  { key: 'dashboards', title: '看板' }
] as const

const totalCount = computed(() => {
  if (!results.value) return 0
  return Object.values(results.value).reduce(
    (acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0),
    0
  )
})

function getItemTitle(item: SearchItem): string {
  return item.title || item.name || item.elementName || item.chineseName || '(无标题)'
}
function getItemDesc(item: SearchItem): string {
  return item.description || item.desc || ''
}
function getItemTypeLabel(item: SearchItem): string {
  const map: Record<string, string> = {
    table: '数据表',
    metric: '指标',
    tag: '标签',
    concept: '业务概念',
    dashboard: '看板'
  }
  return map[item.type || ''] || '数据'
}
function getItemTags(item: SearchItem): MetaTag[] {
  const tags: MetaTag[] = []
  if (item.domain) tags.push({ label: '业务域', value: item.domain, color: 'arcoblue' })
  if (item.category) tags.push({ label: '分类', value: item.category, color: 'purple' })
  if (item.entityType) tags.push({ label: '实体', value: item.entityType, color: 'cyan' })
  return tags
}
function getItemMetaLines(item: SearchItem): string[] {
  const lines: string[] = []
  if (item.owner) lines.push(`责任人: ${item.owner}`)
  if (item.updateTime) lines.push(`更新时间: ${item.updateTime}`)
  return lines
}

function onClickItem(item: SearchItem) {
  if (item.routeKey) {
    emit('navigate', { routeKey: item.routeKey, params: item.routeParams })
    return
  }
  const map: Record<string, string> = {
    table: 'discovery:asset-catalog',
    metric: 'discovery:metrics-map',
    concept: 'management:business-concept',
    dashboard: 'exploration:indicator-dashboard'
  }
  const routeKey = map[item.type || 'table'] || 'discovery:search'
  emit('navigate', { routeKey })
}

async function doSearch(kw: string) {
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

    const firstTab = tabs.find(t => (results.value as any)[t.key]?.length > 0)
    if (firstTab) activeTab.value = firstTab.key

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
  /** icon 字符串 key(传给 AssetCard,由 AssetCard 内部 markRaw 解析) */
  icon: string
  routeKey: string
  params?: Record<string, string>
}

const intentCards = ref<IntentCard[]>([])

const CUSTOMER_KEYWORDS = ['客户', 'user', '用户', '授信', '信贷', 'loan', '客户数', '客户画像', '客户360', '客户洞察']
const METRIC_KEYWORDS = ['指标', 'metric', '日活', 'dau', 'gmv', '转化率']
const SOURCE_KEYWORDS = ['数据源', 'datasource', '数据库', 'kafka', 'mysql']
const BOARD_KEYWORDS = ['看板', 'dashboard', '报表', 'report', '驾驶舱']

function generateIntentCards(kw: string, res: SearchResults): IntentCard[] {
  const lower = kw.toLowerCase()
  const cards: IntentCard[] = []

  const isCustomerIntent = CUSTOMER_KEYWORDS.some(k => lower.includes(k.toLowerCase()))
  if (isCustomerIntent) {
    cards.push({
      key: 'customer-insight',
      title: '查看客户洞察',
      desc: `跳转到客户 360,预填搜索"${kw}"`,
      icon: 'icon-user-group',
      routeKey: 'exploration:customer360',
      params: { keyword: kw }
    })
  }

  if (res.tables.length > 0) {
    cards.push({
      key: 'browse-tables',
      title: `浏览 ${res.tables.length} 张数据表`,
      desc: '在数据地图中查看详情与血缘',
      icon: 'icon-storage',
      routeKey: 'discovery:asset-catalog'
    })
  }

  if (res.metrics.length > 0) {
    cards.push({
      key: 'browse-metrics',
      title: `查看 ${res.metrics.length} 个指标定义`,
      desc: '在指标地图中查看业务口径',
      icon: 'icon-branch',
      routeKey: 'discovery:metrics-map'
    })
  }

  if (BOARD_KEYWORDS.some(k => lower.includes(k.toLowerCase())) || (res.dashboards?.length || 0) > 0) {
    cards.push({
      key: 'browse-dashboards',
      title: `查看看板/报表`,
      desc: '在指标看板中浏览可视化',
      icon: 'icon-desktop',
      routeKey: 'exploration:indicator-dashboard'
    })
  }

  if (SOURCE_KEYWORDS.some(k => lower.includes(k.toLowerCase()))) {
    cards.push({
      key: 'browse-sources',
      title: '查看数据源',
      desc: '管理数据源接入',
      icon: 'icon-storage',
      routeKey: 'exploration:tag-system'
    })
  }

  if (res.concepts.length > 0) {
    cards.push({
      key: 'browse-concepts',
      title: `查看 ${res.concepts.length} 个业务概念`,
      desc: '在业务概念图谱中浏览',
      icon: 'icon-common',
      routeKey: 'management:business-concept'
    })
  }

  return cards.slice(0, 4)
}

function onIntentClick(card: IntentCard) {
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
    color: var(--dca-text-tertiary);
    font-size: 13px;
  }

  .intent-section {
    margin-bottom: 24px;

    .intent-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--dca-text-secondary);
      margin-bottom: 12px;
    }
  }
}
</style>
