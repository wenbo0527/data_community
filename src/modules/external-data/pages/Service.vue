<template>
  <div class="external-data-service">
    <a-page-header title="外数数据服务" />
    <a-card :bordered="true" class="toolbar">
      <a-form :model="filters" layout="inline">
        <a-form-item field="supplier" label="供应商">
          <a-select v-model="filters.supplier" allow-clear placeholder="选择供应商" style="width: 200px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="serviceType" label="服务类型">
          <a-select v-model="filters.serviceType" allow-clear placeholder="选择类型" style="width: 160px">
            <a-option value="API">API</a-option>
            <a-option value="文件">文件</a-option>
            <a-option value="数据库">数据库</a-option>
            <a-option value="平台工具">平台工具</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card title="服务列表">
      <a-table :data="displayedServices" row-key="id" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="服务名称" data-index="name" :width="200" />
          <a-table-column title="供应商" data-index="supplier" :width="160" />
          <a-table-column title="类型" :width="120">
            <template #cell="{ record }">{{ record.serviceType }}</template>
          </a-table-column>
          <a-table-column title="计费模式" :width="140">
            <template #cell="{ record }">{{ billingModeLabel(record.billingMode) }}</template>
          </a-table-column>
          <a-table-column title="单价" :width="160">
            <template #cell="{ record }">{{ formatAmount(record.unitPrice) }}</template>
          </a-table-column>
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }"><a-tag :status="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
const store = useExternalDataStore()

type ServiceType = 'API'|'文件'|'数据库'|'平台工具'

const filters = reactive<{ supplier?: string; serviceType?: ServiceType }>({})
const services = ref<any[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })
const supplierOptions = computed(() => Array.from(new Set(services.value.map(s => s.supplier).filter(Boolean))))
const displayedServices = computed(() => services.value.filter(s => { if (filters.supplier && s.supplier !== filters.supplier) return false; if (filters.serviceType && s.serviceType !== filters.serviceType) return false; return true }))
const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const billingModeLabel = (m?: string) => m === 'per_call' ? '按次' : m === 'monthly' ? '按月' : m === 'tier' ? '阶梯' : '—'
const statusLabel = (s?: string) => s === 'online' ? '在线' : s === 'maintaining' ? '维护中' : s === 'pending' ? '待上线' : '—'
const statusTag = (s?: string) => s === 'online' ? 'success' : s === 'maintaining' ? 'warning' : 'default'

const applyFilter = () => { Message.success('筛选已更新') }
const resetFilter = () => { filters.supplier = undefined; filters.serviceType = undefined }
const onPageChange = (page: number) => { pagination.current = page }
const load = async () => { try { await store.fetchServices(); services.value = store.services || []; pagination.total = services.value.length; Message.success('已加载服务列表') } catch { Message.error('加载失败') } }
onMounted(load)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
