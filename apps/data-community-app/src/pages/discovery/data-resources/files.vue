<template>
  <div class="files-page">
    <PageBanner
      v-model:search="search"
      :title="selectedCategory ? `文件导入 · ${selectedCategory.name}` : '数据资源目录 · 文件导入'"
      :subtitle="selectedCategory ? selectedCategory.description : 'Excel / CSV / Parquet 线下数据'"
      :search-placeholder="selectedCategory ? '输入文件名、格式或上传人搜索' : '搜索主题'"
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
          <template #format="{ record }">
            <a-tag color="arcoblue">{{ record.format }}</a-tag>
          </template>
          <template #status="{ record }">
            <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
          </template>
          <template #actions="{ record }">
            <a-button type="text" size="small" @click="viewDetail(record)">详情</a-button>
            <a-button type="text" size="small" @click="relink(record)">重新关联</a-button>
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

const files = ref([
  { id: 'F001', name: '客户名单 2024Q4', format: 'CSV', size: '125 MB', rowCount: 1280000, uploader: '王运营', linkedAsset: '客户主档域', status: 'linked', importedAt: '2024-12-15 10:30' },
  { id: 'F002', name: '交易流水 11月', format: 'Parquet', size: '2.3 GB', rowCount: 25000000, uploader: '李开发', linkedAsset: '交易域', status: 'linked', importedAt: '2024-12-01 02:00' },
  { id: 'F003', name: '合作伙伴 2024', format: 'XLSX', size: '8.5 MB', rowCount: 3500, uploader: '陈营销', linkedAsset: '-', status: 'unlinked', importedAt: '今天 14:20' },
  { id: 'F004', name: '区域分布数据', format: 'GeoJSON', size: '15 MB', rowCount: 0, uploader: '吴工程', linkedAsset: '地理域', status: 'linked', importedAt: '2024-11-20 16:00' },
  { id: 'F005', name: '黑名单 2026', format: 'XLSX', size: '512 KB', rowCount: 4200, uploader: '张风控', linkedAsset: '风控评估', status: 'linked', importedAt: '2026-07-28 09:15' },
  { id: 'F006', name: '客户分群标签', format: 'CSV', size: '45 MB', rowCount: 580000, uploader: '王运营', linkedAsset: '用户域', status: 'linked', importedAt: '2026-08-01 10:00' },
  { id: 'F007', name: '渠道流水汇总', format: 'Parquet', size: '1.8 GB', rowCount: 18000000, uploader: '李开发', linkedAsset: '交易域', status: 'failed', importedAt: '2026-08-05 03:00' }
])

const categories = computed(() => [
  { code: 'CSV', name: 'CSV', count: files.value.filter(f => f.format === 'CSV').length, description: '逗号分隔文本文件', color: 'arcoblue' },
  { code: 'XLSX', name: 'XLSX', count: files.value.filter(f => f.format === 'XLSX').length, description: 'Excel 电子表格', color: 'green' },
  { code: 'Parquet', name: 'Parquet', count: files.value.filter(f => f.format === 'Parquet').length, description: '列式存储格式', color: 'orange' },
  { code: 'GeoJSON', name: 'GeoJSON', count: files.value.filter(f => f.format === 'GeoJSON').length, description: '地理空间数据', color: 'purple' }
])

const filteredCategories = computed(() => {
  if (!search.value) return categories.value
  const k = search.value.toLowerCase()
  return categories.value.filter(c => c.name.toLowerCase().includes(k) || c.description.toLowerCase().includes(k))
})

function matchSearch(f: any) {
  if (!search.value) return true
  const k = search.value.toLowerCase()
  return f.name.toLowerCase().includes(k) || f.format.toLowerCase().includes(k) || f.uploader.toLowerCase().includes(k)
}

const filteredList = computed(() => {
  if (!selectedCategory.value) return []
  return files.value.filter(f => f.format === selectedCategory.value.code).filter(matchSearch)
})

function selectCategory(cat: any) { selectedCategory.value = cat; search.value = '' }
function goBack() { selectedCategory.value = null; search.value = '' }

const columns = [
  { title: '文件ID', dataIndex: 'id', width: 90 },
  { title: '文件名称', dataIndex: 'name', width: 200 },
  { title: '格式', dataIndex: 'format', slotName: 'format', width: 90 },
  { title: '大小', dataIndex: 'size', width: 100 },
  { title: '行数', dataIndex: 'rowCount', width: 130 },
  { title: '上传人', dataIndex: 'uploader', width: 100 },
  { title: '关联资产', dataIndex: 'linkedAsset', width: 130 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 90 },
  { title: '导入时间', dataIndex: 'importedAt', width: 160 },
  { title: '操作', slotName: 'actions', width: 140, fixed: 'right' as const }
]

function statusColor(s: string) { return { linked: 'green', unlinked: 'orange', failed: 'red' }[s] || 'gray' }
function statusLabel(s: string) { return { linked: '已关联', unlinked: '未关联', failed: '失败' }[s] || s }
function viewDetail(f: any) { Message.info(`查看文件: ${f.name}`) }
function relink(f: any) { Message.success(`已发起重新关联: ${f.name}`) }
</script>

<style scoped>
.files-page { min-height: 100vh; background: var(--dca-bg-page-alt); position: relative; overflow-x: hidden; }
.main-content { padding: 0 40px var(--dca-spacing-2xl); width: 100%; max-width: var(--dca-page-max-width-wide); margin: -40px auto 0; position: relative; z-index: 3; }
.theme-card { cursor: pointer; transition: all 0.3s; border-radius: var(--dca-radius-lg); }
.theme-card:hover { transform: translateY(-4px); box-shadow: var(--dca-shadow-lg); }
.theme-card-header { margin-bottom: var(--dca-spacing-md); }
.theme-card-count { font-size: 32px; font-weight: 700; color: var(--dca-text-primary); margin-bottom: var(--dca-spacing-xs); }
.theme-card-unit { font-size: var(--dca-font-md); font-weight: 400; color: var(--dca-text-tertiary); }
.theme-card-desc { font-size: var(--dca-font-sm); color: var(--dca-text-secondary); margin-bottom: var(--dca-spacing-md); line-height: 1.5; }
.theme-card-footer { display: flex; justify-content: space-between; align-items: center; font-size: var(--dca-font-sm); color: var(--dca-text-tertiary); border-top: 1px solid var(--dca-border-light); padding-top: var(--dca-spacing-sm); }
</style>
