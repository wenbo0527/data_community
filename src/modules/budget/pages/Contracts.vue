<template>
  <div class="contract-management">
    <div class="page-header">
      <h3>合同管理</h3>
      <p class="desc">合同统计、趋势与到期预警，按供应商维度分析</p>
    </div>
    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="supplier" label="供应商">
          <a-select v-model="filters.supplier" placeholder="选择供应商" allow-clear style="width: 180px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="contractType" label="合同类型">
          <a-select v-model="filters.contractType" placeholder="全部类型" allow-clear style="width: 160px">
            <a-option value="framework">框架协议</a-option>
            <a-option value="supplement">补充合同</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" placeholder="选择状态" allow-clear style="width: 160px">
            <a-option value="active">进行中</a-option>
            <a-option value="pending">待生效</a-option>
            <a-option value="expired">已到期</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="goCreatePage">
            <template #icon><IconUpload /></template>
            合同上传
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="showSupplierModal = true">新增供应商</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-grid :cols="4" :col-gap="12" :row-gap="12" class="stats">
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="合同数量" :value="stats.count" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="合同总额" :value="stats.totalAmount">
            <template #suffix>元</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="近30天到期" :value="stats.expiringCount" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="供应商数量" :value="stats.supplierCount" />
        </a-card>
      </a-grid-item>
    </a-grid>
    <a-card title="供应商维度分析">
      <a-table :data="supplierSummary" :pagination="false" :bordered="{ wrapper: true, cell: true }">
        <template #columns>
          <a-table-column title="供应商">
            <template #cell="{ record }">
              <a-link @click="filterBySupplier(record.supplier)">{{ record.supplier }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="合同数" data-index="count" />
          <a-table-column title="总额" :width="180">
            <template #cell="{ record }">{{ formatAmount(record.totalAmount) }}</template>
          </a-table-column>
          <a-table-column title="即将到期(≤30天)" data-index="expiringCount" />
        </template>
      </a-table>
    </a-card>
    <a-card title="合同列表" :loading="loading">
      <a-table :data="tableData" row-key="id" :pagination="pagination" @page-change="onPageChange" @row-click="openContractDetail">
        <template #columns>
          <a-table-column title="合同名称" data-index="contractName" :width="240" />
          <a-table-column title="类型" :width="120">
            <template #cell="{ record }">{{ record.contractType === 'supplement' ? '补充合同' : '框架协议' }}</template>
          </a-table-column>
          <a-table-column title="关联框架协议" :width="240">
            <template #cell="{ record }">
              <span v-if="record.contractType === 'supplement'">{{ frameworkLabel(record.frameworkId) }}</span>
              <span v-else>—</span>
            </template>
          </a-table-column>
          <a-table-column title="合同总金额" :width="160">
            <template #cell="{ record }">{{ formatAmount(record.amount) }}</template>
          </a-table-column>
          <a-table-column title="合同数据条数" :width="160">
            <template #cell="{ record }">{{ record.dataCount ?? '—' }}</template>
          </a-table-column>
          <a-table-column title="关联产品数" :width="140">
            <template #cell="{ record }">{{ record.productCount ?? '—' }}</template>
          </a-table-column>
          <a-table-column title="已核销金额" :width="160">
            <template #cell="{ record }">{{ formatAmount(record.writtenOffAmount) }}</template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    <a-modal v-model:visible="showSupplierModal" title="新增供应商" :width="600" @ok="submitSupplier" @cancel="resetSupplierForm">
      <a-form ref="supplierFormRef" :model="supplierForm" :rules="supplierFormRules" layout="vertical">
        <a-form-item label="供应商名称" field="name" required>
          <a-input v-model="supplierForm.name" placeholder="请输入供应商名称" />
        </a-form-item>
        <a-form-item label="供应商说明" field="description" required>
          <a-textarea v-model="supplierForm.description" placeholder="请输入供应商说明" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUpload } from '@arco-design/web-vue/es/icon'
import { useContractStore } from '@/modules/budget/stores/contract'
import type { ContractItem } from '@/modules/budget/stores/contract'

const store = useContractStore()
const router = useRouter()
const loading = computed(() => store.loading)
const list = computed(() => store.list)
const tableData = computed(() => {
  const base = list.value
  if (!filters.contractType) return base
  return base.filter((i: any) => i.contractType === filters.contractType)
})
const stats = computed(() => store.stats)

const current = ref(1)
const pageSize = ref(10)
const pagination = reactive({ total: 0, pageSize: pageSize.value, current: current.value, showTotal: true })

const filters = reactive<{ supplier?: string; status?: string; contractType?: 'framework' | 'supplement' | undefined }>({ supplier: undefined, status: undefined, contractType: undefined })

const supplierRegistry = ref<{ name: string; description: string }[]>([])
const supplierOptions = computed(() => Array.from(new Set([...
  list.value.map(i => i.supplier), ...supplierRegistry.value.map(s => s.name)
].filter(Boolean))))

const applyFilter = async () => { await store.fetchContractList({ page: 1, pageSize: pageSize.value, supplier: filters.supplier, status: filters.status }); pagination.total = store.total }
const resetFilter = async () => { filters.supplier = undefined; filters.status = undefined; filters.contractType = undefined; await applyFilter() }
const filterBySupplier = async (supplier: string) => { filters.supplier = supplier; await applyFilter() }
const goCreatePage = () => { router.push('/risk/budget/contracts/create') }

const showSupplierModal = ref(false)
const supplierFormRef = ref()
const supplierForm = reactive({ name: '', description: '' })
const supplierFormRules = { name: [{ required: true, message: '请输入供应商名称' }], description: [{ required: true, message: '请输入供应商说明' }] }
const submitSupplier = async () => { const valid = await supplierFormRef.value?.validate(); if (!valid) return; supplierRegistry.value.unshift({ name: supplierForm.name, description: supplierForm.description }); Message.success('新增供应商成功'); showSupplierModal.value = false; resetSupplierForm() }
const resetSupplierForm = () => { supplierForm.name = ''; supplierForm.description = ''; supplierFormRef.value?.clearValidate() }

const formatAmount = (n?: number) => { if (!n && n !== 0) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const formatDate = (d?: string) => { try { return new Date(d || '').toLocaleDateString() } catch { return '—' } }
const daysToExpire = (endDate?: string) => { try { const now = new Date(); const target = new Date(endDate || ''); return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) } catch { return NaN } }
const expireTagStatus = (endDate?: string) => { const days = daysToExpire(endDate); if (isNaN(days)) return 'default'; if (days < 0) return 'danger'; if (days <= 7) return 'danger'; if (days <= 30) return 'warning'; return 'success' }

const onPageChange = async (page: number) => { current.value = page; await applyFilter() }
const openContractDetail = (record: ContractItem) => { router.push(`/budget/contracts/${record.id}`) }
const frameworkLabel = (id?: string | null) => { if (!id) return '—'; const m = store.list.find(i => i.id === id); return m ? `${m.contractName}（${m.contractNo}）` : id }

const supplierSummary = computed(() => { const map = new Map<string, { supplier: string; count: number; totalAmount: number; expiringCount: number }>(); list.value.forEach((i: ContractItem) => { const key = i.supplier || '—'; const days = daysToExpire(i.endDate); const bucket = map.get(key) || { supplier: key, count: 0, totalAmount: 0, expiringCount: 0 }; bucket.count += 1; bucket.totalAmount += Number(i.amount) || 0; if (!isNaN(days) && days <= 30 && days >= 0) bucket.expiringCount += 1; map.set(key, bucket) }); return Array.from(map.values()) })

onMounted(async () => { await store.fetchContractList({ page: current.value, pageSize: pageSize.value }); pagination.total = store.total })
</script>

<style scoped>
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; }
.stats { margin-bottom: 12px; }
</style>
