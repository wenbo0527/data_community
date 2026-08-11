<template>
  <!-- @prd: classify.matrix -->
  <div class="classify-matrix-page">
    <PageHeader title="数据安全分级矩阵表" :sub-title="`总行制定的分级分类标准定义，共 ${classifyMatrixData.length} 条规范`">
      <template #extra>
        <a-space>
          <a-button @click="openUpload">
            <template #icon><icon-upload /></template>
            批量导入
          </a-button>
          <a-radio-group v-model="viewMode" type="button">
            <a-radio value="table">矩阵视图</a-radio>
            <a-radio value="tree">树形视图</a-radio>
          </a-radio-group>
        </a-space>
      </template>
    </PageHeader>

    <!-- 筛选区 -->
    <a-card class="filter-card">
      <a-form layout="inline" :model="filterForm">
        <a-form-item label="一级分类">
          <a-select
            v-model="filterForm.l1"
            placeholder="全部"
            allow-clear
            style="width: 160px"
            @change="applyFilter"
          >
            <a-option v-for="l1 in matrixL1List" :key="l1" :value="l1">{{ l1 }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="安全级别">
          <a-select
            v-model="filterForm.level"
            placeholder="全部"
            allow-clear
            style="width: 140px"
            @change="applyFilter"
          >
            <a-option value="L1">L1 公开</a-option>
            <a-option value="L2">L2 内部</a-option>
            <a-option value="L3">L3 秘密</a-option>
            <a-option value="L4">L4 机密</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关键词">
          <a-input
            v-model="filterForm.keyword"
            placeholder="搜索四级分类内容"
            allow-clear
            style="width: 220px"
            @input="onSearchInput"
          />
        </a-form-item>
        <a-form-item>
          <a-button @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>

      <!-- 筛选标签栏 -->
      <div v-if="activeFilters.length" class="filter-tags">
        <a-tag v-for="f in activeFilters" :key="f.key" closable @close="removeFilter(f.key)">
          {{ f.label }}
        </a-tag>
      </div>
    </a-card>

    <!-- 矩阵视图 -->
    <a-card v-if="viewMode === 'table'" class="table-card">
      <a-table
        :data="pagedData"
        :pagination="pagination"
        row-key="id"
        :bordered="false"
        :scroll="{ x: '100%' }"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        @row-click="openDetail"
      >
        <template #columns>
          <a-table-column title="一级分类" data-index="category_l1" :width="120">
            <template #cell="{ record }">
              <a-tag color="arcoblue">{{ record.category_l1 }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="二级定义" data-index="category_l2" :width="140" />
          <a-table-column title="三级定义" data-index="category_l3" :width="140" />
          <a-table-column title="四级分类内容" data-index="category_l4" :width="160" />
          <a-table-column title="安全级别" data-index="sensitivity_level" :width="140">
            <template #cell="{ record }">
              <a-tag :color="SENSITIVITY_COLORS[record.sensitivity_level]">
                {{ record.sensitivity_level }} {{ SENSITIVITY_NAMES[record.sensitivity_level] }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 树形视图 -->
    <a-card v-else class="tree-card">
      <a-tree
        :data="treeData"
        :default-expand-all="true"
        block-node
      >
        <template #title="nodeData">
          <span class="tree-node">
            <span class="tree-label">{{ nodeData.title }}</span>
            <a-tag v-if="nodeData.level" :color="SENSITIVITY_COLORS[nodeData.level]" size="small">
              {{ nodeData.level }}
            </a-tag>
            <a-tag v-else-if="nodeData.count !== undefined" size="small" color="gray">
              {{ nodeData.count }} 条
            </a-tag>
          </span>
        </template>
      </a-tree>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      :title="detailRecord ? `${detailRecord.category_l4} · 分级详情` : '分级详情'"
      :width="600"
      :footer="false"
      :mask-closable="false"
    >
      <a-descriptions v-if="detailRecord" :column="1" bordered>
        <a-descriptions-item label="一级分类">
          <a-tag color="arcoblue">{{ detailRecord.category_l1 }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="二级定义">{{ detailRecord.category_l2 }}</a-descriptions-item>
        <a-descriptions-item label="三级定义">{{ detailRecord.category_l3 }}</a-descriptions-item>
        <a-descriptions-item label="四级分类内容">{{ detailRecord.category_l4 }}</a-descriptions-item>
        <a-descriptions-item label="安全级别">
          <a-tag :color="SENSITIVITY_COLORS[detailRecord.sensitivity_level]">
            {{ detailRecord.sensitivity_level }} {{ SENSITIVITY_NAMES[detailRecord.sensitivity_level] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="使用该分类的 Mock 字段数">
          <a-statistic :value="detailRecord.usage_count" :value-style="{ color: '#165DFF' }" />
        </a-descriptions-item>
        <a-descriptions-item v-if="detailRecord.description" label="备注">
          {{ detailRecord.description }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 批量导入弹窗 -->
    <ClassifyMatrixUploadModal v-model:visible="uploadVisible" @success="onUploadSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUpload } from '@arco-design/web-vue/es/icon'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import ClassifyMatrixUploadModal from './classify/components/ClassifyMatrixUploadModal.vue'
import { classifyMatrixData, matrixL1List } from '@/mock-shared/classify-matrix'
import { SENSITIVITY_COLORS, SENSITIVITY_NAMES } from '@/mock-shared/classify-constants'
import type { ClassifyMatrixItem } from '@/mock-shared/classify-types'

// ============ 视图模式（持久化） ============
const STORAGE_KEY = 'classify-matrix-view-mode'
const viewMode = ref<'table' | 'tree'>('table')
onMounted(() => {
  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached === 'tree' || cached === 'table') viewMode.value = cached
})
watch(viewMode, v => localStorage.setItem(STORAGE_KEY, v))

// ============ 筛选 ============
const filterForm = ref({ l1: '', level: '', keyword: '' })
const keywordDebounced = ref('')
let keywordTimer: number | undefined
const onSearchInput = () => {
  if (keywordTimer) window.clearTimeout(keywordTimer)
  keywordTimer = window.setTimeout(() => {
    keywordDebounced.value = filterForm.value.keyword.trim()
  }, 300)
}
const applyFilter = () => { /* 触发 computed */ }
const resetFilter = () => { filterForm.value = { l1: '', level: '', keyword: '' }; keywordDebounced.value = '' }

const activeFilters = computed(() => {
  const arr: { key: string; label: string }[] = []
  if (filterForm.value.l1) arr.push({ key: 'l1', label: `一级：${filterForm.value.l1}` })
  if (filterForm.value.level) arr.push({ key: 'level', label: `级别：${filterForm.value.level}` })
  if (filterForm.value.keyword) arr.push({ key: 'keyword', label: `关键词：${filterForm.value.keyword}` })
  return arr
})
const removeFilter = (key: string) => {
  if (key === 'l1') filterForm.value.l1 = ''
  else if (key === 'level') filterForm.value.level = ''
  else if (key === 'keyword') { filterForm.value.keyword = ''; keywordDebounced.value = '' }
}

// ============ 过滤 + 分页 ============
const filteredData = computed(() => {
  return classifyMatrixData.filter(item => {
    if (filterForm.value.l1 && item.category_l1 !== filterForm.value.l1) return false
    if (filterForm.value.level && item.sensitivity_level !== filterForm.value.level) return false
    if (keywordDebounced.value && !item.category_l4.includes(keywordDebounced.value)) return false
    return true
  })
})

const pagination = ref({ current: 1, pageSize: 20, total: 0, showTotal: true, showPageSize: true })
watch(filteredData, (list) => {
  pagination.value.total = list.length
  pagination.value.current = 1
}, { immediate: true })
const pagedData = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  return filteredData.value.slice(start, start + pagination.value.pageSize)
})
const onPageChange = (current: number) => { pagination.value.current = current }
const onPageSizeChange = (size: number) => { pagination.value.pageSize = size; pagination.value.current = 1 }

// ============ 树形视图 ============
const treeData = computed(() => {
  // 构造一级→二级→三级→四级 树
  const root: any[] = []
  const l1Map = new Map<string, any>()
  filteredData.value.forEach(item => {
    if (!l1Map.has(item.category_l1)) {
      const node = { key: `l1-${item.category_l1}`, title: item.category_l1, count: 0, children: [] }
      l1Map.set(item.category_l1, node)
      root.push(node)
    }
    const l1Node = l1Map.get(item.category_l1)!
    l1Node.count++

    let l2Node = l1Node.children.find((c: any) => c.title === item.category_l2)
    if (!l2Node) {
      l2Node = { key: `l2-${item.category_l1}-${item.category_l2}`, title: item.category_l2, count: 0, children: [] }
      l1Node.children.push(l2Node)
    }
    l2Node.count++

    let l3Node = l2Node.children.find((c: any) => c.title === item.category_l3)
    if (!l3Node) {
      l3Node = { key: `l3-${item.category_l2}-${item.category_l3}`, title: item.category_l3, count: 0, children: [] }
      l2Node.children.push(l3Node)
    }
    l3Node.count++

    l3Node.children.push({
      key: item.id,
      title: item.category_l4,
      level: item.sensitivity_level,
      isLeaf: true
    })
  })
  return root
})

// ============ 详情弹窗 ============
const detailVisible = ref(false)
const detailRecord = ref<ClassifyMatrixItem | null>(null)
const openDetail = (record: ClassifyMatrixItem) => {
  detailRecord.value = record
  detailVisible.value = true
}

// ============ Excel 批量导入弹窗 ============
const uploadVisible = ref(false)
const openUpload = () => { uploadVisible.value = true }
const onUploadSuccess = (result: { added: number; updated: number; ignored: number }) => {
  uploadVisible.value = false
  Message.success(`导入完成：新增 ${result.added} 条，更新 ${result.updated} 条，忽略 ${result.ignored} 条`)
}
</script>

<style scoped>
.classify-matrix-page { padding: 16px 24px; }
.filter-card { margin-bottom: 16px; }
.filter-tags { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
.table-card :deep(.clickable-row) { cursor: pointer; }
.table-card :deep(.clickable-row:hover) { background-color: var(--color-fill-2); }
.tree-card { min-height: 400px; }
.tree-node { display: inline-flex; align-items: center; gap: 8px; }
.tree-label { font-weight: 500; }
</style>
