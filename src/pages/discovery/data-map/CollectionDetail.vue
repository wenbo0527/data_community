<template>
  <div class="collection-detail">
    <a-spin :loading="loading" tip="加载中...">
      <a-page-header
        :title="collection.name"
        :subtitle="collection.description"
        @back="onBack"
      />
      <a-space align="center" style="margin: 16px 0;">
        <icon-user />
        <span>集合负责人: </span>
        <a-tag>{{ collection.owner || '未指定' }}</a-tag>
        <span style="margin-left: 16px;">总表数: {{ collection.tables.length }}</span>
      </a-space>

      <a-divider />

      <a-pagination 
        v-model:current="currentPage" 
        v-model:page-size="pageSize" 
        :total="collection.tables.length" 
        show-total 
        style="margin-bottom: 16px;"
      />
      <a-row :gutter="[16, 16]">
        <a-col v-for="table in paginatedTables" :key="table.name" :span="8">
          <a-card class="table-card" hoverable @click="showDetail(table)">
            <template #title>
              <a-space align="center">
                <icon-file />
                <span class="table-name">{{ table.name }}</span>
              </a-space>
            </template>
            <div class="table-info">
              <div class="table-meta">
                <a-tag>{{ table.type }}</a-tag>
                <a-tag>{{ table.category }}</a-tag>
                <a-tag>{{ table.domain }}</a-tag>
                <a-tag>{{ table.owner }}</a-tag>
              </div>
              <a-typography-paragraph :ellipsis="{ rows: 2 }" type="secondary" class="table-description">
                {{ table.description }}
              </a-typography-paragraph>
            </div>
          </a-card>
        </a-col>
      </a-row>

      
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { goBack } from '@/router/utils'
import { IconFile, IconUser } from '@arco-design/web-vue/es/icon'
import mockData from '@/mock/data-map'

interface TableField {
  name: string
  type: string
  description: string
}

interface TableItem {
  name: string
  theme?: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: TableField[]
}

interface TableCollection {
  id: string
  name: string
  description: string
  owner?: string
  tables: TableItem[]
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const collection = ref<TableCollection>({
  id: '',
  name: '',
  description: '',
  tables: []
})

const currentPage = ref(1)
const pageSize = ref(9)

const paginatedTables = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return collection.value.tables.slice(start, end)
})



// 获取表集合数据
const fetchCollection = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const found = mockData.collections.find(c => c.id === id)
    if (found) {
      collection.value = found
    } else {
      Message.error('未找到该场景')
      goBack(router, '/discovery/data-map/collections')
    }
  } catch (error) {
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 显示表详情
const showDetail = (table: TableItem) => {
  router.push({
    name: 'TableDetail',
    params: { 
      tableName: table.name 
    },
    state: { 
      table: {
        ...table,
        theme: table.theme || ''
      } as unknown as any
    }
  }).catch(err => {
    console.error('路由跳转失败:', err)
    Message.error('无法打开表详情')
  })
}



onMounted(() => {
  fetchCollection()
})
</script>

<style scoped>
.collection-detail {
  padding: 16px;
}

.table-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
}

.table-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.table-name {
  font-size: 16px;
  font-weight: 500;
}

.table-info {
  margin-top: 8px;
}

.table-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.table-description {
  margin: 0;
  color: var(--color-text-3);
}
</style>
const onBack = () => goBack(router, '/discovery/data-map/collections')
