<template>
  <div class="search-page">
    <a-page-header title="全局搜索" sub-title="数据资产 · 指标 · 变量 · API · 文档" :back="false">
      <template #extra>
        <a-button @click="goBack">
          <template #icon><icon-left /></template>
          返回
        </a-button>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-card :bordered="false" class="search-card">
        <a-input-search
          v-model="keyword"
          placeholder="输入表名 / 字段 / 指标 / 标签"
          size="large"
          allow-clear
          enter-button="搜索"
          @search="doSearch"
        />
        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="6">
            <a-select v-model="filterType" placeholder="类型" allow-clear size="large">
              <a-option value="table">数据表</a-option>
              <a-option value="field">字段</a-option>
              <a-option value="metric">指标</a-option>
              <a-option value="api">API</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select v-model="filterDomain" placeholder="业务域" allow-clear size="large">
              <a-option value="user">用户域</a-option>
              <a-option value="trade">交易域</a-option>
              <a-option value="risk">风控域</a-option>
              <a-option value="marketing">营销域</a-option>
            </a-select>
          </a-col>
        </a-row>
        <div class="hot-keywords">
          <span style="color: #86909c; font-size: 13px">热门搜索:</span>
          <a-tag v-for="k in hotKeywords" :key="k" class="hot-tag" @click="quickSearch(k)">{{ k }}</a-tag>
        </div>
      </a-card>

      <a-card :bordered="false" v-if="searched" style="margin-top: 16px">
        <template #title>
          <span>搜索结果(共 <b>{{ totalResults }}</b> 条)</span>
          <a-tag color="arcoblue" v-if="expandedKeywords.length > 1" style="margin-left: 8px">
            同义词扩展: {{ expandedKeywords.join(', ') }}
          </a-tag>
        </template>

        <a-tabs default-active-key="all">
          <a-tab-pane :key="`all`" :title="`全部(${totalResults})`">
            <a-table
              :columns="columns"
              :data="allResults"
              :pagination="{ pageSize: 10, showTotal: true }"
              row-key="id"
              size="medium"
            >
              <template #type="{ record }">
                <a-tag :color="typeColor(record.type)">{{ typeLabel(record.type) }}</a-tag>
              </template>
              <template #name="{ record }">
                <a-link @click="goTo(record)">{{ record.name }}</a-link>
              </template>
              <template #domain="{ record }">
                <a-tag size="small">{{ record.domain }}</a-tag>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane v-for="t in typeTabs" :key="t.key" :title="`${t.label}(${t.count})`">
            <a-table
              :columns="columns"
              :data="resultsByType(t.key)"
              :pagination="{ pageSize: 10, showTotal: true }"
              row-key="id"
              size="medium"
            >
              <template #type="{ record }">
                <a-tag :color="typeColor(record.type)">{{ typeLabel(record.type) }}</a-tag>
              </template>
              <template #name="{ record }">
                <a-link @click="goTo(record)">{{ record.name }}</a-link>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane v-if="totalResults === 0" key="missing" title="找不到结果?">
            <a-result status="warning" title="未找到匹配的数据资产" sub-title="您的需求可能尚未在数据社区中收录,提交反馈后数据团队会跟进">
              <template #icon><icon-question-circle-fill :style="missingIconStyle" /></template>
              <template #extra>
                <a-space>
                  <a-button type="primary" size="large" @click="openMissingTicket">
                    <template #icon><icon-edit /></template>
                    提交缺票反馈
                  </a-button>
                  <a-button size="large" @click="quickSearch('用户')">
                    <template #icon><icon-refresh /></template>
                    换个关键词试试
                  </a-button>
                </a-space>
              </template>
            </a-result>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <a-modal v-model:visible="missingTicketVisible" title="提交缺票反馈" :width="600" @ok="submitMissingTicket">
      <a-alert type="info" :show-icon="true" style="margin-bottom: 16px">
        您的反馈会直接发送给数据团队,我们会在 1-2 个工作日内回复
      </a-alert>
      <a-form :model="missingForm" layout="vertical">
        <a-form-item label="需要的数据"><a-input v-model="missingForm.keyword" disabled /></a-form-item>
        <a-form-item label="数据类型" required>
          <a-select v-model="missingForm.type">
            <a-option value="table">数据表</a-option>
            <a-option value="field">字段</a-option>
            <a-option value="metric">指标</a-option>
            <a-option value="api">API</a-option>
            <a-option value="other">其他</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="业务场景" required>
          <a-textarea v-model="missingForm.scenario" :auto-size="{ minRows: 3 }" placeholder="请详细描述您的使用场景..." />
        </a-form-item>
        <a-form-item label="紧急程度">
          <a-radio-group v-model="missingForm.urgency">
            <a-radio value="low">低 (1 周内)</a-radio>
            <a-radio value="medium">中 (3 天内)</a-radio>
            <a-radio value="high">高 (24 小时内)</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { SearchExtrasStore } from '@/mock/shared/search-extras'
import { useMockSearch, JUMP_TARGETS as MOCK_JUMP_TARGETS } from '@/composables/useMockSearch'

const router = useRouter()
const { goTo: mockGoTo } = useMockSearch()

const keyword = ref('')
const filterType = ref<string | undefined>(undefined)
const filterDomain = ref<string | undefined>(undefined)
const searched = ref(false)
const allResults = ref<any[]>([])
const expandedKeywords = ref<string[]>([])

// 缺票反馈
const missingTicketVisible = ref(false)
const missingForm = ref({ keyword: '', type: 'table', scenario: '', urgency: 'medium' })
const missingIconStyle = { color: '#ff7d00' }

const hotKeywords = ['DAU', 'GMV', '客户 360', 'VIP', 'AUM', '逾期率']

const columns = [
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 90 },
  { title: '名称', dataIndex: 'name', slotName: 'name' },
  { title: '业务域', dataIndex: 'domain', slotName: 'domain', width: 100 },
  { title: '描述', dataIndex: 'description' },
  { title: 'Owner', dataIndex: 'owner', width: 100 }
]

const totalResults = computed(() => allResults.value.length)
const typeTabs = computed(() => {
  const map: Record<string, { label: string; key: string; count: number }> = {
    table: { label: '数据表', key: 'table', count: 0 },
    field: { label: '字段', key: 'field', count: 0 },
    metric: { label: '指标', key: 'metric', count: 0 },
    api: { label: 'API', key: 'api', count: 0 }
  }
  allResults.value.forEach(r => {
    if (map[r.type]) map[r.type].count++
  })
  return Object.values(map).filter(m => m.count > 0)
})

function resultsByType(type: string) {
  return allResults.value.filter(r => r.type === type)
}

function doSearch() {
  if (!keyword.value.trim()) {
    Message.warning('请输入搜索关键词')
    return
  }
  searched.value = true
  // 同义词扩展
  expandedKeywords.value = SearchExtrasStore.expandSynonyms(keyword.value.trim())
  allResults.value = SearchExtrasStore.search(keyword.value.trim(), { type: filterType.value, domain: filterDomain.value })
  Message.success(`找到 ${allResults.value.length} 条结果`)
}

function quickSearch(k: string) {
  keyword.value = k
  doSearch()
}

function typeColor(t: string) {
  return { table: 'arcoblue', field: 'green', metric: 'orange', api: 'purple' }[t] || 'gray'
}
function typeLabel(t: string) {
  return { table: '数据表', field: '字段', metric: '指标', api: 'API' }[t] || t
}

/**
 * 搜索结果 type → 跳转目标(相对路径,不带 /dca 前缀)
 * 数据源 record 里如果有 path/query 字段会优先用,fallback 才用这张表
 */
const JUMP_TARGETS: Record<string, { path: string; query?: Record<string, string | number> }> = {
  table:  MOCK_JUMP_TARGETS.table,
  metric: MOCK_JUMP_TARGETS.metric,
  api:    MOCK_JUMP_TARGETS.api,
  field:  MOCK_JUMP_TARGETS.field
}

function goTo(record: any) {
  // 优先用 record 自带的跳转目标(由 mock 数据层维护),否则按 type 走兜底
  const target = record?.path
    ? { path: record.path, query: record.query }
    : JUMP_TARGETS[record?.type]
  if (!target?.path) {
    Message.warning('该结果暂不支持跳转')
    return
  }
  // 走 useMockSearch.goTo,埋好断点 E
  mockGoTo({
    id: record.id ?? '',
    type: record.type ?? 'table',
    name: record.name ?? '',
    description: record.description ?? '',
    domain: record.domain ?? '',
    owner: record.owner ?? '',
    path: target.path,
    query: target.query,
    score: 0
  })
}

function openMissingTicket() {
  missingForm.value.keyword = keyword.value
  missingTicketVisible.value = true
}

function submitMissingTicket() {
  if (!missingForm.value.scenario) {
    Message.warning('请描述业务场景')
    return
  }
  Message.success('反馈已提交,数据团队会在 1-2 个工作日内回复')
  missingTicketVisible.value = false
}

const goBack = () => router.push('discovery')
</script>

<style lang="scss" scoped>
.search-page {
  background: #f5f7fa;
  min-height: 100vh;
}
.content-wrapper {
  padding: 0 24px 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.search-card {
  .hot-keywords {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #f2f3f5;
    .hot-tag {
      cursor: pointer;
      margin-left: 8px;
    }
  }
}
</style>