<template>
  <div class="logs-page">
    <PageBanner
      v-model:search="search"
      :title="selectedCategory ? `日志数据 · ${selectedCategory.name}` : '数据资源目录 · 日志数据'"
      :subtitle="selectedCategory ? selectedCategory.description : '埋点 / 应用 / 操作 / 调用 日志'"
      :search-placeholder="selectedCategory ? '输入日志源、类型或负责人搜索' : '搜索主题'"
    >
      <template v-if="selectedCategory" #actions>
        <a-button size="large" @click="goBack">
          <template #icon><icon-left /></template>
          返回
        </a-button>
      </template>
    </PageBanner>

    <div v-if="!selectedCategory" class="main-content">
      <a-row :gutter="[16, 16]">
        <a-col v-for="cat in filteredCategories" :key="cat.code" :xs="24" :sm="12" :md="8" :lg="6">
          <a-card hoverable :bordered="false" class="theme-card" @click="selectCategory(cat)">
            <div class="theme-card-header">
              <a-tag :color="cat.color" size="large">{{ cat.name }}</a-tag>
            </div>
            <div class="theme-card-count">{{ cat.count }}<span class="theme-card-unit"> 项</span></div>
            <div class="theme-card-desc">{{ cat.description }}</div>
            <div class="theme-card-footer"><span>点击查看详情</span><icon-right /></div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div v-else class="main-content">
      <a-card :bordered="false">
        <a-table :columns="columns" :data="filteredList" :pagination="{ pageSize: 10, showTotal: true }" row-key="id" size="medium">
          <template #type="{ record }">
            <a-tag color="purple">{{ record.type }}</a-tag>
          </template>
          <template #status="{ record }">
            <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
          </template>
          <template #actions="{ record }">
            <a-button type="text" size="small" @click="viewDetail(record)">详情</a-button>
            <a-button type="text" size="small" @click="configLog(record)">采集配置</a-button>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconLeft, IconRight } from '@arco-design/web-vue/es/icon'
import PageBanner from '@/components-dca/common/PageBanner.vue'

const search = ref('')
const selectedCategory = ref<any>(null)

const sources = ref([
  { id: 'L001', name: '客户端埋点日志', type: '埋点', dailyEvents: '3.5 亿', retention: '90 天', owner: '王运营', status: 'running', updatedAt: '今天 09:00' },
  { id: 'L002', name: '应用系统操作日志', type: '操作', dailyEvents: '4.2 亿', retention: '180 天', owner: '吴工程', status: 'running', updatedAt: '今天 09:00' },
  { id: 'L003', name: '服务调用日志', type: '调用', dailyEvents: '0.5 亿', retention: '30 天', owner: '吴工程', status: 'paused', updatedAt: '昨天 18:00' },
  { id: 'L004', name: '数据库慢查询', type: '操作', dailyEvents: '2,300', retention: '180 天', owner: '李开发', status: 'running', updatedAt: '今天 06:00' },
  { id: 'L005', name: '页面曝光埋点', type: '埋点', dailyEvents: '5.8 亿', retention: '60 天', owner: '王运营', status: 'running', updatedAt: '今天 08:30' },
  { id: 'L006', name: 'API网关调用日志', type: '调用', dailyEvents: '1.2 亿', retention: '30 天', owner: '吴工程', status: 'running', updatedAt: '今天 07:00' }
])

const categories = computed(() => [
  { code: '埋点', name: '埋点', count: sources.value.filter(s => s.type === '埋点').length, description: '客户端页面曝光、点击等埋点日志', color: 'arcoblue' },
  { code: '操作', name: '操作', count: sources.value.filter(s => s.type === '操作').length, description: '应用系统操作、慢查询等日志', color: 'green' },
  { code: '调用', name: '调用', count: sources.value.filter(s => s.type === '调用').length, description: '服务调用、API网关等调用日志', color: 'orange' }
])

const filteredCategories = computed(() => {
  if (!search.value) return categories.value
  const k = search.value.toLowerCase()
  return categories.value.filter(c => c.name.toLowerCase().includes(k) || c.description.toLowerCase().includes(k))
})

function matchSearch(s: any) {
  if (!search.value) return true
  const k = search.value.toLowerCase()
  return s.name.toLowerCase().includes(k) || s.type.toLowerCase().includes(k) || s.owner.toLowerCase().includes(k)
}

const filteredList = computed(() => {
  if (!selectedCategory.value) return []
  return sources.value.filter(s => s.type === selectedCategory.value.code).filter(matchSearch)
})

function selectCategory(cat: any) { selectedCategory.value = cat; search.value = '' }
function goBack() { selectedCategory.value = null; search.value = '' }

const columns = [
  { title: '日志ID', dataIndex: 'id', width: 100 },
  { title: '日志名称', dataIndex: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 80 },
  { title: '日均事件', dataIndex: 'dailyEvents', width: 110 },
  { title: '保留期', dataIndex: 'retention', width: 90 },
  { title: '负责人', dataIndex: 'owner', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
  { title: '操作', slotName: 'actions', width: 140, fixed: 'right' as const }
]

function statusColor(s: string) { return s === 'running' ? 'green' : 'gray' }
function statusLabel(s: string) { return s === 'running' ? '采集中' : '已停' }
function viewDetail(l: any) { Message.info(`查看日志源: ${l.name}`) }
function configLog(l: any) { Message.success(`已打开采集配置: ${l.name}`) }
</script>

<style scoped>
.logs-page { min-height: 100vh; background: var(--dca-bg-page-alt); position: relative; overflow-x: hidden; }
.main-content { padding: 0 40px var(--dca-spacing-2xl); width: 100%; max-width: var(--dca-page-max-width-wide); margin: -40px auto 0; position: relative; z-index: 3; }
.theme-card { cursor: pointer; transition: all 0.3s; border-radius: var(--dca-radius-lg); }
.theme-card:hover { transform: translateY(-4px); box-shadow: var(--dca-shadow-lg); }
.theme-card-header { margin-bottom: var(--dca-spacing-md); }
.theme-card-count { font-size: 32px; font-weight: 700; color: var(--dca-text-primary); margin-bottom: var(--dca-spacing-xs); }
.theme-card-unit { font-size: var(--dca-font-md); font-weight: 400; color: var(--dca-text-tertiary); }
.theme-card-desc { font-size: var(--dca-font-sm); color: var(--dca-text-secondary); margin-bottom: var(--dca-spacing-md); line-height: 1.5; }
.theme-card-footer { display: flex; justify-content: space-between; align-items: center; font-size: var(--dca-font-sm); color: var(--dca-text-tertiary); border-top: 1px solid var(--dca-border-light); padding-top: var(--dca-spacing-sm); }
</style>
