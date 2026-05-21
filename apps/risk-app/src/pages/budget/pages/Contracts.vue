<template>
  <div class="contract-management">
    <div class="page-header">
      <h3>合同管理</h3>
      <p class="desc">合同统计、趋势与到期预警，按征信机构维度分析</p>
    </div>
    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="supplier" label="征信机构">
          <a-select v-model="filters.supplier" placeholder="选择征信机构" allow-clear style="width: 180px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" placeholder="选择状态" allow-clear style="width: 160px">
            <a-option value="active">生效</a-option>
            <a-option value="completed">完结</a-option>
            <a-option value="terminated">中止</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="goCreatePage">
            <template #icon>
              <IconUpload />
            </template>
            合同上传
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="showSupplierModal = true">新增征信机构</a-button>
        </a-form-item>
        <a-form-item>
          <a-dropdown @select="handleSettlementSelect">
            <a-button type="primary">
              结算 <IconDown />
            </a-button>
            <template #content>
              <a-doption value="initiate">发起结算</a-doption>
              <a-doption value="list">进入结算列表页</a-doption>
            </template>
          </a-dropdown>
        </a-form-item>
      </a-form>
    </a-card>
    <a-grid :cols="4" :col-gap="12" :row-gap="12" class="stats">
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="生效合同数" :value="stats.count" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="合同剩余总金额" :value="stats.totalAmount">
            <template #suffix>元</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="产品覆盖率" :value="productCoverageRate">
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="征信机构数量" :value="stats.supplierCount" />
        </a-card>
      </a-grid-item>
    </a-grid>
    <a-card title="征信机构维度分析">
      <a-table :data="supplierSummary" :pagination="false" :bordered="{ wrapper: true, cell: false }">
        <template #columns>
          <a-table-column title="征信机构">
            <template #cell="{ record }">
              {{ record.supplier }}
            </template>
          </a-table-column>
          <a-table-column title="框架协议数" data-index="frameworkCount" />
          <a-table-column title="补充合同数" data-index="supplementCount" />
          <a-table-column title="关联外数产品">
            <template #cell="{ record }">{{ record.productCount ?? '—' }}</template>
          </a-table-column>
          <a-table-column title="剩余总额">
            <template #cell="{ record }">{{ formatAmount(record.totalAmount) }}</template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    <a-card title="合同列表" :loading="loading">
      <a-tabs v-model:active-key="activeTab" type="capsule">
        <a-tab-pane key="framework" title="框架协议">
          <a-table :data="frameworkData" row-key="id" :pagination="pagination" @page-change="onPageChange"
            @row-click="openContractDetail">
            <template #columns>
              <a-table-column title="合同名称" :width="240">
                <template #cell="{ record }">
                  <a-link>{{ record.contractName }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="合同编号" data-index="contractNo" :width="160" />
              <a-table-column title="合同总金额" :width="160">
                <template #cell="{ record }">{{ formatAmount(record.amount) }}</template>
              </a-table-column>
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="关联产品数" :width="140">
                <template #cell="{ record }">{{ record.productCount ?? '—' }}</template>
              </a-table-column>
              <a-table-column title="已核销金额" :width="160">
                <template #cell="{ record }">{{ formatAmount(record.writtenOffAmount) }}</template>
              </a-table-column>
              <a-table-column title="签订日期" :width="160">
                <template #cell="{ record }">{{ record.startDate?.split('T')[0] || '—' }}</template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="supplement" title="补充合同">
          <a-table :data="supplementData" row-key="id" :pagination="pagination" @page-change="onPageChange"
            @row-click="openContractDetail">
            <template #columns>
              <a-table-column title="合同名称" :width="240">
                <template #cell="{ record }">
                  <a-link>{{ record.contractName }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="合同编号" data-index="contractNo" :width="160" />
              <a-table-column title="关联框架协议" :width="240">
                <template #cell="{ record }">
                  <span>{{ frameworkLabel(record.frameworkId) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="关联产品数" :width="140">
                <template #cell="{ record }">{{ record.productCount ?? '—' }}</template>
              </a-table-column>
              <a-table-column title="签订日期" :width="160">
                <template #cell="{ record }">{{ record.startDate?.split('T')[0] || '—' }}</template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>
    <a-modal v-model:visible="showSupplierModal" title="新增征信机构" :width="600" @ok="submitSupplier"
      @cancel="resetSupplierForm">
      <a-form ref="supplierFormRef" :model="supplierForm" :rules="supplierFormRules" layout="vertical">
        <a-form-item label="征信机构名称" field="name" required>
          <a-input v-model="supplierForm.name" placeholder="请输入征信机构名称" />
        </a-form-item>
        <a-form-item label="征信机构说明" field="description" required>
          <a-textarea v-model="supplierForm.description" placeholder="请输入征信机构说明" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconDown } from '@arco-design/web-vue/es/icon'
import { useContractStore } from '../stores/contract'
import type { ContractItem } from '../stores/contract'
import { useSettlementSupplier } from '../composables/useSettlementSupplier'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'

const store = useContractStore()
const externalStore = useExternalDataStore()
const router = useRouter()
const { supplierOptions: settlementSupplierOptions, loadSuppliers } = useSettlementSupplier()
const loading = computed(() => store.loading)
const list = computed(() => store.list)
const products = computed(() => externalStore.products || [])

const activeTab = ref<'framework' | 'supplement'>('framework')
const frameworkData = computed(() => list.value.filter(i => i.contractType === 'framework' || !i.contractType))
const supplementData = computed(() => list.value.filter(i => i.contractType === 'supplement'))

const productCoverageRate = computed(() => {
  const activeContracts = list.value.filter(i => i.status === 'active')
  const coveredProductCount = activeContracts.reduce((sum, i) => sum + (Number(i.productCount) || 0), 0)
  const totalProducts = products.value.length || 1 // Avoid division by zero
  return Math.min(100, Math.round((coveredProductCount / totalProducts) * 100))
})

const stats = computed(() => store.stats)

const current = ref(1)
const pageSize = ref(10)
const pagination = reactive({ total: 0, pageSize: pageSize.value, current: current.value, showTotal: true })

const filters = reactive<{ supplier?: string; status?: string }>({ supplier: undefined, status: undefined })

const supplierRegistry = ref<{ name: string; description: string }[]>([])
const supplierOptions = computed(() => Array.from(new Set([
  ...list.value.map((i: ContractItem) => i.supplier), ...supplierRegistry.value.map((s: { name: string; description: string }) => s.name)
].filter(Boolean))))

const applyFilter = async () => { await store.fetchContractList({ page: 1, pageSize: pageSize.value, supplier: filters.supplier, status: filters.status }); pagination.total = store.total }
const resetFilter = async () => { filters.supplier = undefined; filters.status = undefined; await applyFilter() }
const filterBySupplier = async (supplier: string) => { filters.supplier = supplier; await applyFilter() }
const goCreatePage = () => { router.push('/budget/contracts/create') }

const showSupplierModal = ref(false)
const supplierFormRef = ref()
const supplierForm = reactive({ name: '', description: '' })
const supplierFormRules = { name: [{ required: true, message: '请输入征信机构名称' }], description: [{ required: true, message: '请输入征信机构说明' }] }
const submitSupplier = async () => { const valid = await supplierFormRef.value?.validate(); if (!valid) return; supplierRegistry.value.unshift({ name: supplierForm.name, description: supplierForm.description }); Message.success('新增征信机构成功'); showSupplierModal.value = false; resetSupplierForm() }
const resetSupplierForm = () => { supplierForm.name = ''; supplierForm.description = ''; supplierFormRef.value?.clearValidate() }

const formatAmount = (n?: number) => { if (!n && n !== 0) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const frameworkLabel = (id?: string | null) => { if (!id) return '—'; const m = store.list.find(i => i.id === id); return m ? `${m.contractName}（${m.contractNo}）` : id }

const statusColor = (s: string) => {
  const map: Record<string, string> = { active: 'green', completed: 'blue', terminated: 'red', pending: 'orange', expired: 'gray' }
  return map[s] || 'gray'
}
const statusLabel = (s: string) => {
  const map: Record<string, string> = { active: '生效', completed: '完结', terminated: '中止', pending: '待生效', expired: '已到期' }
  return map[s] || s
}

const onPageChange = async (page: number) => { current.value = page; await applyFilter() }
const openContractDetail = (record: ContractItem) => { router.push(`/budget/contracts/${record.id}`) }

const supplierSummary = computed(() => {
  const map = new Map<string, { supplier: string; frameworkCount: number; supplementCount: number; totalAmount: number; expiringCount: number; productCount: number }>()
  list.value.forEach((i: ContractItem) => {
    const key = i.supplier || '—'
    const bucket = map.get(key) || { supplier: key, frameworkCount: 0, supplementCount: 0, totalAmount: 0, expiringCount: 0, productCount: 0 }
    if (i.contractType === 'supplement') {
      bucket.supplementCount += 1
    } else {
      bucket.frameworkCount += 1
    }
    bucket.totalAmount += Number(i.amount) || 0
    bucket.productCount += Number(i.productCount) || 0
    map.set(key, bucket)
  })
  return Array.from(map.values())
})

const handleSettlementSelect = (value: string | number | Record<string, any> | undefined) => {
  if (value === 'initiate') {
    router.push('/budget/settlement?action=initiate')
  } else if (value === 'list') {
    router.push('/budget/settlement')
  }
}

onMounted(async () => {
  await Promise.all([
    store.fetchContractList({ page: current.value, pageSize: pageSize.value }),
    externalStore.fetchProducts()
  ])
  pagination.total = store.total
  try { await loadSuppliers() } catch {}
})
</script>

<style scoped>
.page-header {
  margin-bottom: 12px;
}
.desc {
  color: var(--color-text-2);
}
.toolbar {
  margin-bottom: 12px;
}
.stats {
  margin-bottom: 12px;
}
</style>
