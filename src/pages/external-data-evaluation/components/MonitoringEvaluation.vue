<template>
  <a-card title="监控评估" hoverable>
    <template #extra>
      <a-space>
        <a-select v-model="query.productId" placeholder="选择产品" style="width: 160px" allow-clear>
          <a-option v-for="p in products" :key="p.id" :value="String(p.id)">{{ p.name }}</a-option>
        </a-select>
        <a-button type="outline" size="small" @click="refresh">刷新</a-button>
      </a-space>
    </template>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="预算燃尽" size="small">
          <a-table :columns="burndownColumns" :data="burndown" size="mini" :pagination="false" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="预警信息" size="small">
          <a-table :columns="warningColumns" :data="warnings" size="mini" :pagination="false" />
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useExternalDataStore } from '../../../store/modules/external-data'

const store = useExternalDataStore()
const products = computed(() => store.products)
const burndown = computed(() => store.burndown)
const warnings = computed(() => store.warnings)

const query = reactive<{ productId?: string }>({ productId: undefined })

const burndownColumns = [
  { title: '日期', dataIndex: 'date' },
  { title: '计划', dataIndex: 'planned' },
  { title: '实际', dataIndex: 'actual' }
]
const warningColumns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '级别', dataIndex: 'level' },
  { title: '信息', dataIndex: 'message' },
  { title: '时间', dataIndex: 'createdAt' }
]

const refresh = async () => {
  await Promise.all([
    store.fetchBurndown({ productId: query.productId }),
    store.fetchWarnings({ productId: query.productId })
  ])
}

onMounted(async () => {
  // 先加载产品列表用于筛选
  await store.fetchProducts()
  await refresh()
})
</script>
