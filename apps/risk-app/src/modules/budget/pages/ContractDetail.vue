<template>
  <div class="contract-detail">
    <a-page-header title="合同详情">
      <template #extra>
        <a-space>
          <a-button @click="goBack">返回</a-button>
          <a-button v-if="!editing" type="outline" @click="startEdit">编辑</a-button>
          <template v-else>
            <a-button @click="cancelEdit">取消</a-button>
            <a-button type="primary" :loading="saving" @click="saveEdit">保存</a-button>
          </template>
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
        <a-form ref="formRef" :model="form" layout="vertical" :size="'large'" :disabled="!editing">
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
                      <a-upload :show-file-list="true" v-model:file-list="form.fileList" :disabled="!editing" />
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
                  <!-- PRD R11: 合同初始占用金额 -->
                  <a-col :span="12"><a-form-item field="initialOccupiedAmount" label="合同初始占用金额"><a-input-number v-model="form.initialOccupiedAmount" :min="0" :step="1000" style="width:100%" placeholder="历史已使用金额，默认0" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12" v-if="form.contractType === 'framework'">
                  <a-col :span="12"><a-form-item field="writtenOffAmount" label="已核销金额"><a-input-number v-model="form.writtenOffAmount" style="width:100%" disabled /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="12"><a-form-item field="signDate" label="签订日期"><a-date-picker v-model="form.signDate" style="width:100%" /></a-form-item></a-col>
                  <a-col :span="12"><a-form-item field="isGroupPurchase" label="总行代采"><a-switch v-model="form.isGroupPurchase" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12">
                  <!-- PRD R08/R09: 合作机构改为选项列表 -->
                  <a-col :span="12">
                    <a-form-item field="supplier" label="合作机构">
                      <a-select v-model="form.supplier" allow-clear allow-search placeholder="选择合作机构" :options="partnerOrgOptions" />
                    </a-form-item>
                  </a-col>
                  <!-- PRD R10: 签报号字段（搜索选择，非必填，支持后续补绑） -->
                  <a-col :span="12">
                    <a-form-item field="signReportNo" label="签报号">
                      <a-select v-model="form.signReportNo" allow-clear allow-search placeholder="搜索选择已有签报（可后续补绑）">
                        <a-option v-for="r in signReportOptions" :key="r.id" :value="r.reportNo">{{ r.reportNo }} - {{ r.title }}</a-option>
                      </a-select>
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
                  <!-- PRD D1: 穿梭框（Transfer）+ 接口号搜索 + 已关联不可取消 -->
                  <a-transfer
                    v-model:target-keys="selectedExternalIds"
                    :data="externalTransferData"
                    :allow-search="true"
                    :search-placeholder="'搜索外数名称或接口号'"
                    :titles="['可选外数', '已关联外数']"
                    :filter-option="filterExternal"
                    show-check-all
                    :disabled="!editing"
                    :virtual-list-props="{ height: 360 }"
                    style="width: 100%"
                  />
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
import { partnerOrgNames } from '@/modules/budget/api/supplierDictionary'
import { useSignReportStore } from '@/modules/budget/stores/signReport'

const route = useRoute()
const router = useRouter()
const store = useContractStore()
const externalStore = useExternalDataStore()
const signReportStore = useSignReportStore()
const id = String(route.params.id || '')

const currentStatus = ref<string>('')
const editing = ref(false)
const saving = ref(false)

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

// PRD R08/R09: 合作机构选项列表
const partnerOrgOptions = computed(() => partnerOrgNames.map(n => ({ label: n, value: n })))
// PRD R10: 签报搜索选项
const signReportOptions = computed(() => signReportStore.list)

const form = reactive<any>({
  contractType: 'framework',
  fileList: [],
  shortName: '',
  fullName: '',
  contractNo: '',
  amount: undefined,
  initialOccupiedAmount: 0,
  writtenOffAmount: undefined,
  signDate: undefined,
  isGroupPurchase: false,
  supplier: '',
  signReportNo: '',
  frameworkIds: [] as Array<string>
})

const frameworkOptions = computed(() => store.frameworkOptions)
const products = computed(() => externalStore.products || [])
// PRD R24: 外数选项附加展示接口号
const externalOptions = computed(() => {
  return products.value.map((p: any) => ({
    label: `${p.name}（${p.supplier || '—'}/${p.channel || p.provider || '—'}${p.interfaceNo ? ' / ' + p.interfaceNo : ''}）`,
    value: p.id
  }))
})
// PRD D1: 穿梭框数据源 + 已关联项 disabled（不可取消）
const externalTransferData = computed(() => {
  // 初始关联集合（来自合同已绑定的外数 ID 列表）
  const initialIds = (initialSelectedIds.value || []).map((x: any) => String(x))
  const sup = String(form.supplier || '').trim()
  const base = (products.value || []).filter((p: any) => !sup || String(p.supplier || '').trim() === sup)
  return base.map((p: any) => {
    const v = String(p.id)
    // PRD R26a: 已关联外数保持关联关系不变，不可取消关联
    const isInitial = initialIds.includes(v)
    return {
      value: v,
      label: p.name || p.productName || p.code,
      disabled: isInitial,
      interfaceNo: p.interfaceNo || '',
      supplier: p.supplier || '—',
      tag: isInitial ? '已关联（不可取消）' : (p.interfaceNo ? `接口号:${p.interfaceNo}` : '待补充接口号')
    }
  })
})
const filterExternal = (inputValue: string, item: any) => {
  if (!inputValue) return true
  const k = String(inputValue).toLowerCase()
  return String(item.label || '').toLowerCase().includes(k)
    || String(item.interfaceNo || '').toLowerCase().includes(k)
    || String(item.supplier || '').toLowerCase().includes(k)
}
const initialSelectedIds = ref<Array<string | number>>([])

const selectedExternalIds = ref<Array<string | number>>([])
const activeExternalId = ref<string | number | undefined>(undefined)
const externalConfigs = reactive<Record<string, any>>({})

const externalLabel = (id: string | number) => {
  const p = products.value.find((x: any) => String(x.id) === String(id)) as any
  return p ? `${p.name}（${p.supplier || '—'}/${p.channel || p.provider || '—'}${p.interfaceNo ? ' / ' + p.interfaceNo : ''}）` : String(id)
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

const startEdit = () => { editing.value = true }
const cancelEdit = () => { editing.value = false; loadData() }

const saveEdit = async () => {
  saving.value = true
  try {
    // PRD V1: 合同总金额 ≥ 合同初始占用金额 + 合同已报销金额
    const totalAmount = Number(form.amount || 0)
    const initialOccupied = Number(form.initialOccupiedAmount || 0)
    const writtenOff = Number(form.writtenOffAmount || 0)
    if (form.contractType === 'framework' && totalAmount < initialOccupied + writtenOff) {
      const diff = (initialOccupied + writtenOff) - totalAmount
      Message.error(`合同总金额不足，差额${diff.toLocaleString('zh-CN')}元`)
      saving.value = false
      return
    }

    // PRD V3: 签报/成交通知书金额 ≥ 合同总金额（跨层级校验）
    if (form.signReportNo && form.supplier && form.contractType === 'framework') {
      const signReport = signReportStore.list.find((r: any) => r.reportNo === form.signReportNo)
      if (signReport) {
        const partnerOrgData = signReport.partnerOrgs?.find((p: any) => p.partnerOrg === form.supplier)
        if (partnerOrgData) {
          const noticeAmount = Number(partnerOrgData.noticeAmount || 0)
          if (noticeAmount < totalAmount) {
            const diff = totalAmount - noticeAmount
            Message.error(`签报/成交通知书金额不足，差额${diff.toLocaleString('zh-CN')}元`)
            saving.value = false
            return
          }
        }
      }
    }

    // 更新合同数据
    const contract = store.list.find(i => String(i.id) === id)
    if (contract) {
      contract.supplier = form.supplier
      contract.signReportNo = form.signReportNo || undefined
      contract.initialOccupiedAmount = Number(form.initialOccupiedAmount) || 0
      contract.amount = Number(form.amount) || contract.amount
      contract.contractName = form.fullName || form.shortName
    }
    Message.success('合同保存成功')
    editing.value = false
  } catch {
    Message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const loadData = async () => {
  if (!store.list.length) {
    await store.fetchContractList()
  }
  if (!externalStore.products.length) {
    await externalStore.fetchProducts()
  }
  // PRD R10: 加载签报列表（供搜索选择/补绑）
  if (!signReportStore.list.length) {
    await signReportStore.fetchList()
  }

  const contract = store.list.find(i => String(i.id) === id)
  if (contract) {
    form.contractType = contract.contractType || 'framework'
    form.shortName = contract.contractName
    form.fullName = contract.contractName
    form.contractNo = contract.contractNo
    form.amount = contract.amount
    form.initialOccupiedAmount = (contract as any).initialOccupiedAmount || 0
    form.writtenOffAmount = contract.writtenOffAmount
    form.signDate = contract.startDate
    form.supplier = contract.supplier
    form.signReportNo = (contract as any).signReportNo || ''
    form.frameworkIds = contract.frameworkId ? [contract.frameworkId] : []
    currentStatus.value = contract.status

    // 模拟关联外数
    const relatedProducts = products.value.filter(p => p.supplier === contract.supplier)
    const initialIds = relatedProducts.slice(0, 2).map(p => p.id)
    initialSelectedIds.value = [...initialIds]
    selectedExternalIds.value = [...initialIds]
    selectedExternalIds.value.forEach(extId => ensureConfigFor(String(extId)))
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
