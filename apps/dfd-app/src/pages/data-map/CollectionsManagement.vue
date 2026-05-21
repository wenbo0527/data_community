<template>
  <div class="collections-page">
    <a-page-header title="常用表管理" class="page-header" />
    <a-card class="toolbar-card">
      <a-row :gutter="16" align="middle">
        <a-col :span="8">
          <a-input-search
            v-model="keyword"
            placeholder="搜索集合名称或描述"
            allow-clear
            @search="onSearch"
          />
        </a-col>
        <a-col :span="6">
          <a-select v-model="typeFilter" placeholder="集合类型" allow-clear>
            <a-option value="业务流程">业务流程</a-option>
            <a-option value="数据分析">数据分析</a-option>
            <a-option value="风险管控">风险管控</a-option>
            <a-option value="用户画像">用户画像</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="handleCreate">
            <template #icon><IconPlus /></template>
            新建集合
          </a-button>
        </a-col>
      </a-row>
      <div class="selected-tags" v-if="selectedNames.length > 0">
        <span class="label">筛选词：</span>
        <a-tag v-for="n in selectedNames" :key="n" size="small" closable @close="removeName(n)">
          {{ n }}
        </a-tag>
      </div>
    </a-card>

    <TableCollectionGrid
      :collections="displayCollections"
      :loading="loading"
      :page-size="12"
      @create-collection="handleCreate"
      @collection-click="handleOpenDetail"
      @favorite-change="handleFavoriteChange"
      @edit-collection="handleEdit"
      @delete-collection="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import TableCollectionGrid from './components/TableCollectionGrid.vue'
import dataMapMock from '@/mock/data-map.ts'

interface TableCollection {
  id: string
  name: string
  description: string
  type?: string
  tables: any[]
  owner?: string
  updateTime?: string
  isFavorite?: boolean
}

const router = useRouter()
const loading = ref(false)
const keyword = ref('')
const typeFilter = ref<string | undefined>(undefined)
const selectedNames = ref<string[]>([])

const allCollections = ref<TableCollection[]>([])

onMounted(() => {
  // 与统一搜索保持一致的数据来源
  allCollections.value = dataMapMock.collections || []
})

const displayCollections = computed<TableCollection[]>(() => {
  const q = keyword.value.trim().toLowerCase()
  return allCollections.value.filter((c: TableCollection) => {
    const matchKeyword =
      !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    const matchType = !typeFilter.value || c.type === typeFilter.value
    const matchSelected =
      selectedNames.value.length === 0 ||
      selectedNames.value.some((n: string) => (c.name || '').toLowerCase().includes(n.toLowerCase()))
    return matchKeyword && matchType && matchSelected
  })
})

const onSearch = () => {}
const removeName = (n: string) => {
  selectedNames.value = selectedNames.value.filter((x: string) => x !== n)
}

const handleCreate = () => {}
const handleEdit = (collection: TableCollection) => {}
const handleDelete = (collection: TableCollection) => {}
const handleFavoriteChange = (collection: TableCollection) => {
  collection.isFavorite = !collection.isFavorite
}
const handleOpenDetail = (collection: TableCollection) => {
  router.push(`/discovery/data-map/collection/${collection.id}`)
}
</script>

<style scoped>
.collections-page {
  padding: 16px;
}
.page-header {
  margin-bottom: 12px;
  background: #fff;
}
.toolbar-card {
  margin-bottom: 16px;
}
.selected-tags {
  margin-top: 8px;
}
.selected-tags .label {
  color: var(--color-text-3);
  margin-right: 8px;
}
</style>
