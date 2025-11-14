<template>
  <div class="contract-detail">
    <a-page-header title="合同详情" :back="true" @back="goBack" />

    <a-card :bordered="true" style="margin-bottom: 12px">
      <a-descriptions :data="basicInfo" layout="horizontal" :column="3" bordered />
      <div style="margin-top: 12px">
        <a-space>
          <a-button type="primary" @click="editAssociations">编辑关联外数产品</a-button>
          <a-button @click="goToPurchaseRegister">在外采登记中编辑</a-button>
        </a-space>
      </div>
    </a-card>

    <a-card title="已关联外数产品">
      <a-table :data="associatedProducts" row-key="id" :pagination="false">
        <template #columns>
          <a-table-column title="数据名称" data-index="dataName" :width="220" />
          <a-table-column title="数源种类" data-index="dataType" :width="120" />
          <a-table-column title="供应商" data-index="supplier" :width="160" />
          <a-table-column title="单价(元/次)" :width="140">
            <template #cell="{ record }">{{ formatPrice(record.price) }}</template>
          </a-table-column>
          <a-table-column title="接口标签" data-index="interfaceTag" :width="120" />
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="editVisible" title="编辑关联外数产品" :width="900" @ok="confirmAssociations" @cancel="cancelAssociations">
      <a-form :model="filterForm" layout="inline" style="margin-bottom: 12px">
        <a-form-item label="名称">
          <a-input v-model="filterForm.name" allow-clear placeholder="输入名称筛选" />
        </a-form-item>
        <a-form-item label="数源种类">
          <a-select v-model="filterForm.dataType" allow-clear placeholder="选择种类">
            <a-option value="API">API</a-option>
            <a-option value="文件">文件</a-option>
            <a-option value="数据库">数据库</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="供应商">
          <a-select v-model="filterForm.supplier" allow-clear placeholder="选择供应商">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-button type="primary" @click="applyFilter">筛选</a-button>
        <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
      </a-form>
      <a-table
        :columns="selectColumns"
        :data="filteredTableData"
        :pagination="selectPagination"
        :row-selection="{
          type: 'checkbox',
          showCheckedAll: true,
          selectedRowKeys: selectedRowKeys,
          onChange: handleSelectionChange
        }"
        @page-change="handlePageChange"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContractStore } from '@/store/modules/contract'

interface DataProduct {
  id: string
  dataName: string
  dataType: string
  supplier: string
  price: number
  interfaceTag: string
}

const route = useRoute()
const router = useRouter()
const store = useContractStore()

const contract = ref(store.list.find(i => i.id === String(route.params.id)))
const associatedProducts = ref<DataProduct[]>([])
const editVisible = ref(false)

const basicInfo = computed(() => [
  { label: '合同名称', value: contract.value?.contractName || '' },
  { label: '合同编号', value: contract.value?.contractNo || '' },
  { label: '供应商', value: contract.value?.supplier || '' },
  { label: '合同总金额', value: formatAmount(contract.value?.amount) },
  { label: '合同数据条数', value: String(contract.value?.dataCount ?? '') },
  { label: '关联产品数', value: String(contract.value?.productCount ?? '') },
  { label: '已核销金额', value: formatAmount(contract.value?.writtenOffAmount) },
  { label: '开始日期', value: formatDate(contract.value?.startDate) },
  { label: '结束日期', value: formatDate(contract.value?.endDate) }
])

const supplierOptions = computed(() => ['数据供应商A','数据供应商B','数据供应商C','第三方数据公司'])

const filterForm = reactive({ name: '', dataType: '', supplier: '' })
const selectColumns = [
  { title: '数据名称', dataIndex: 'dataName', width: 200 },
  { title: '数源种类', dataIndex: 'dataType', width: 120 },
  { title: '供应商', dataIndex: 'supplier', width: 160 },
  { title: '单价(元/次)', dataIndex: 'price', width: 140 },
  { title: '接口标签', dataIndex: 'interfaceTag', width: 120 }
]
const selectTableData = ref<DataProduct[]>([])
const selectPagination = reactive({ current: 1, pageSize: 10, total: 0 })
const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<DataProduct[]>([])

const filteredTableData = computed(() => {
  let result = [...selectTableData.value]
  if (filterForm.name) result = result.filter(i => i.dataName.toLowerCase().includes(filterForm.name.toLowerCase()))
  if (filterForm.dataType) result = result.filter(i => i.dataType === filterForm.dataType)
  if (filterForm.supplier) result = result.filter(i => i.supplier === filterForm.supplier)
  selectPagination.total = result.length
  return result
})

const applyFilter = () => { selectPagination.current = 1 }
const resetFilter = () => { filterForm.name = ''; filterForm.dataType = ''; filterForm.supplier = ''; selectPagination.current = 1 }
const handlePageChange = (page: number) => { selectPagination.current = page }
const handleSelectionChange = (rowKeys: string[], rows: DataProduct[]) => { selectedRowKeys.value = rowKeys; selectedRows.value = rows }

const editAssociations = () => { editVisible.value = true }
const cancelAssociations = () => { editVisible.value = false }
const confirmAssociations = () => {
  associatedProducts.value = [...selectedRows.value]
  store.updateAssociations(String(route.params.id), associatedProducts.value.map(p => ({ id: p.id })))
  editVisible.value = false
}

const formatAmount = (n?: number) => { if (!n && n !== 0) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const formatPrice = (n?: number) => { if (!n && n !== 0) return '—'; return Number(n).toFixed(2) }
const formatDate = (d?: string) => { try { return new Date(d || '').toLocaleDateString() } catch { return '—' } }

const goBack = () => { router.back() }
const goToPurchaseRegister = () => {
  const record = contract.value
  if (!record) return
  const relatedProducts = associatedProducts.value.map(p => ({ id: p.id, dataName: p.dataName, dataType: p.dataType, supplier: p.supplier, price: p.price, interfaceTag: p.interfaceTag, isNew: false }))
  const editData = {
    projectName: record.contractName,
    purchaseVolume: record.dataCount ?? 0,
    totalAmount: record.amount ?? 0,
    purchaseDate: record.startDate,
    description: `${record.contractName} 合同详情`,
    relatedProducts,
    uploadedFiles: [{ id: `file-${record.id}`, name: `${record.contractNo}.pdf`, url: '#', size: 1024 }]
  }
  router.push({ path: '/discovery/asset-management/external-purchase-register', query: { mode: 'edit', id: record.id }, state: { editData } })
}

onMounted(async () => {
  if (!contract.value) {
    await store.fetchContractList({ page: 1, pageSize: 20 })
    contract.value = store.list.find(i => i.id === String(route.params.id))
  }
  const count = contract.value?.productCount ?? 0
  associatedProducts.value = Array.from({ length: count }).map((_, idx) => ({
    id: `data-associated-${contract.value?.id}-${idx + 1}`,
    dataName: `已关联数据产品 ${idx + 1}`,
    dataType: '文件',
    supplier: contract.value?.supplier || '',
    price: 0,
    interfaceTag: '合同关联'
  }))
  selectTableData.value = Array.from({ length: 30 }).map((_, index) => ({
    id: `data-${index + 1}`,
    dataName: `外部数据产品 ${index + 1}`,
    dataType: ['API', '文件', '数据库'][Math.floor(Math.random() * 3)],
    supplier: ['数据供应商A', '数据供应商B', '数据供应商C', '第三方数据公司'][Math.floor(Math.random() * 4)],
    price: Math.floor(Math.random() * 1000) / 100,
    interfaceTag: ['金融', '电商', '运营商', '社交', '交通'][Math.floor(Math.random() * 5)]
  }))
  selectedRowKeys.value = associatedProducts.value.map(p => p.id)
  selectedRows.value = [...associatedProducts.value]
  selectPagination.total = selectTableData.value.length
})
</script>

<style scoped>
.contract-detail { padding: 16px }
</style>
