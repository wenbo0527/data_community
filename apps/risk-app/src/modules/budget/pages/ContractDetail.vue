<template>
  <div class="contract-detail">
    <a-page-header title="合同详情">
      <template #extra>
        <a-space>
          <a-button @click="goBack">返回</a-button>
          <a-button type="primary" status="danger" v-if="currentStatus !== 'terminated'" @click="handleVoid">中止</a-button>
        </a-space>
      </template>
      <template #content>
        <div class="header-sub">
          查看合同详细信息与外数配置
          <a-tag v-if="currentStatus" :color="statusColor(currentStatus)" style="margin-left: 12px">{{ statusLabel(currentStatus) }}</a-tag>
        </div>
      </template>
    </a-page-header>
    <a-row :gutter="12">
      <a-col :span="24">
        <a-form ref="formRef" :model="form" layout="vertical" :size="'large'" disabled>
          <a-collapse :bordered="false" :default-active-key="['contract', 'external']">
            <a-collapse-item key="contract" header="合同信息与上传">
                <a-row :gutter="12">
                  <a-col :span="24">
                    <a-form-item field="contractType" label="合同类型">
                      <a-select v-model="form.contractType" placeholder="选择类型">
                        <a-option value="framework">框架合同</a-option>
                        <a-option value="supplement">补充协议</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="24">
                    <a-form-item field="fileList" label="合同文件">
                      <a-upload :show-file-list="true" v-model:file-list="form.fileList" disabled />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="12"><a-form-item field="shortName" label="合同简称"><a-input v-model="form.shortName" /></a-form-item></a-col>
                  <a-col :span="12"><a-form-item field="contractNo" label="合同编号"><a-input v-model="form.contractNo" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="24"><a-form-item field="fullName" label="合同全称"><a-input v-model="form.fullName" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12" v-if="form.contractType === 'framework'">
                  <a-col :span="12"><a-form-item field="amount" label="合同总金额"><a-input-number v-model="form.amount" style="width:100%" /></a-form-item></a-col>
                  <a-col :span="12"><a-form-item field="writtenOffAmount" label="已核销金额"><a-input-number v-model="form.writtenOffAmount" style="width:100%" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="12"><a-form-item field="signDate" label="签订日期"><a-date-picker v-model="form.signDate" style="width:100%" /></a-form-item></a-col>
                  <a-col :span="12"><a-form-item field="isGroupPurchase" label="总行代采"><a-switch v-model="form.isGroupPurchase" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="12">
                    <a-form-item field="supplier" label="征信机构">
                      <a-input v-model="form.supplier" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" v-if="form.contractType === 'supplement'">
                    <a-form-item field="frameworkIds" label="关联框架合同">
                      <a-select v-model="form.frameworkIds" multiple placeholder="无关联框架合同">
                        <a-option v-for="f in frameworkOptions" :key="f.value" :value="f.value">{{ f.label }}</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="关联外数">
                  <a-select v-model="selectedExternalIds" multiple :options="externalOptions" style="width: 100%" />
                </a-form-item>
            </a-collapse-item>
            <a-collapse-item key="external" header="外数信息配置">
              <a-divider orientation="left">外数价格与备注</a-divider>
              <template v-if="selectedExternalIds.length">
                <a-tabs v-model:active-key="activeExternalId">
                  <a-tab-pane v-for="extId in selectedExternalIds" :key="String(extId)" :title="externalLabel(extId)">
                    <a-row :gutter="12">
                      <a-col :span="12"><a-form-item label="计费方式"><a-select v-model="externalConfigs[String(extId)].billingMode"><a-option value="查得计费">查得计费</a-option><a-option value="查询计费">查询计费</a-option></a-select></a-form-item></a-col>
                      <a-col :span="12"><a-form-item label="计费类型"><a-select v-model="externalConfigs[String(extId)].billingType"><a-option value="fixed">固定单价计费</a-option><a-option value="tiered">阶梯条件计费</a-option><a-option value="special">特殊计费</a-option></a-select></a-form-item></a-col>
                    </a-row>
                    <a-row :gutter="12">
                      <a-col :span="12"><a-form-item label="基础单价" v-if="externalConfigs[String(extId)].billingType === 'fixed'"><a-input-number v-model="externalConfigs[String(extId)].basePrice" style="width:100%" /></a-form-item></a-col>
                    </a-row>
                    <a-row :gutter="12">
                      <a-col :span="12"><a-form-item label="免费调用次数"><a-input-number v-model="externalConfigs[String(extId)].freeQuotaValue" style="width:100%" /></a-form-item></a-col>
                      <a-col :span="12"><a-form-item label="免费量有效期"><a-range-picker v-model="externalConfigs[String(extId)].freeQuotaRange" style="width:100%" /></a-form-item></a-col>
                    </a-row>
                    <a-row :gutter="12" v-if="externalConfigs[String(extId)].billingType === 'tiered'">
                      <a-col :span="24">
                        <a-table :data="externalConfigs[String(extId)].tiers || []" :pagination="false" row-key="idx">
                          <template #columns>
                            <a-table-column title="下限" :width="160"><template #cell="{ record }"><a-input-number v-model="record.lower" style="width:100%" /></template></a-table-column>
                            <a-table-column title="上限" :width="160"><template #cell="{ record }"><a-input-number v-model="record.upper" style="width:100%" /></template></a-table-column>
                            <a-table-column title="单价" :width="160"><template #cell="{ record }"><a-input-number v-model="record.price" style="width:100%" /></template></a-table-column>
                          </template>
                        </a-table>
                      </a-col>
                    </a-row>
                    <a-form-item label="备注补充"><a-textarea v-model="externalConfigs[String(extId)].remark" :rows="3" /></a-form-item>
                  </a-tab-pane>
                </a-tabs>
              </template>
              <template v-else><a-empty description="暂无关联外数" /></template>
            </a-collapse-item>
          </a-collapse>
        </a-form>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { useContractStore } from '@/modules/budget/stores/contract'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'

const route = useRoute()
const router = useRouter()
const store = useContractStore()
const externalStore = useExternalDataStore()
const id = String(route.params.id || '')

const currentStatus = ref<string>('')

const statusColor = (s: string) => {
  const map: Record<string, string> = { active: 'green', completed: 'blue', terminated: 'red', pending: 'orange', expired: 'gray' }
  return map[s] || 'gray'
}
const statusLabel = (s: string) => {
  const map: Record<string, string> = { active: '生效', completed: '完结', terminated: '中止', pending: '待生效', expired: '已到期' }
  return map[s] || s
}

const handleVoid = () => {
  Modal.confirm({
    title: '确认中止',
    content: '确定要中止该合同吗？中止后不可恢复。',
    onOk: async () => {
      // Assuming store has update logic, otherwise we might need to implement it
      // For now, we'll try to update locally and ideally call an API
      // Since updateContract isn't explicitly in store actions for partial updates, we might need to add it or mock it
      // Let's assume we can update status via a new action or reuse create for mock if supported, but typically we need an update action.
      // Checking store... store only has create and delete.
      // We will implement a temporary update in store or just mock it here for UI feedback if store doesn't support it yet.
      // But better to add update capability to store.
      const success = await store.updateContractStatus(id, 'terminated')
      if (success) {
        Message.success('合同已中止')
        currentStatus.value = 'terminated'
        await loadData()
      } else {
        Message.error('操作失败')
      }
    }
  })
}

const form = reactive<any>({
  contractType: 'framework',
  fileList: [],
  shortName: '',
  fullName: '',
  contractNo: '',
  amount: undefined,
  writtenOffAmount: undefined,
  signDate: undefined,
  isGroupPurchase: false,
  supplier: '',
  frameworkIds: [] as Array<string>
})

const frameworkOptions = computed(() => store.frameworkOptions)
const products = computed(() => externalStore.products || [])
const externalOptions = computed(() => {
  return products.value.map((p: any) => ({
    label: `${p.name}（${p.supplier || '—'}/${p.channel || p.provider || '—'}）`,
    value: p.id
  }))
})

const selectedExternalIds = ref<Array<string | number>>([])
const activeExternalId = ref<string | number | undefined>(undefined)
const externalConfigs = reactive<Record<string, any>>({})

const externalLabel = (id: string | number) => { 
  const p = products.value.find((x: any) => String(x.id) === String(id))
  return p ? `${p.name}（${p.supplier || '—'}/${p.channel || p.provider || '—'}）` : String(id) 
}

const goBack = () => router.push('/budget/contracts')

function ensureConfigFor(extKey: string) {
  if (!externalConfigs[extKey]) {
    const p = products.value.find((x: any) => String(x.id) === String(extKey))
    const pricing = store.getPricing(extKey)
    externalConfigs[extKey] = pricing || {
      billingMode: (p?.channel === '文件批量') ? '查得计费' : '查询计费',
      billingType: 'fixed',
      basePrice: p?.unitPrice || 0,
      tiers: [],
      remark: ''
    }
  }
}

const loadData = async () => {
  if (!store.list.length) {
    await store.fetchContractList()
  }
  if (!externalStore.products.length) {
    await externalStore.fetchProducts()
  }
  
  const contract = store.list.find(i => String(i.id) === id)
  if (contract) {
    form.contractType = contract.contractType || 'framework'
    form.shortName = contract.contractName
    form.fullName = contract.contractName
    form.contractNo = contract.contractNo
    form.amount = contract.amount
    form.writtenOffAmount = contract.writtenOffAmount
    form.signDate = contract.startDate
    form.supplier = contract.supplier
    form.frameworkIds = contract.frameworkId ? [contract.frameworkId] : []
    currentStatus.value = contract.status
    
    // 模拟关联外数（从 Mock 逻辑推断或根据供应商随机分配）
    const relatedProducts = products.value.filter(p => p.supplier === contract.supplier)
    selectedExternalIds.value = relatedProducts.slice(0, 2).map(p => p.id)
    selectedExternalIds.value.forEach(id => ensureConfigFor(String(id)))
    if (selectedExternalIds.value.length) {
      activeExternalId.value = selectedExternalIds.value[0]
    }
  }
}

onMounted(loadData)
</script>

<style scoped>
.contract-detail { width: 100%; padding: 0 16px; }
.header-sub { color: var(--color-text-2); }
</style>
