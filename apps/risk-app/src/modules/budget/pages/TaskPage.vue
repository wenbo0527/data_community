<template>
  <div class="task-page">
    <a-page-header :title="id ? '结算任务' : '创建结算任务'" @back="goBack" />
    <a-space direction="vertical" fill style="width: 100%">
      <a-card v-if="!id" :bordered="true" title="基础信息">
        <a-form :model="form" layout="vertical">
          <a-row :gutter="12">
            <a-col :span="12"><a-form-item field="supplierId" label="征信机构" required><a-select v-model="form.supplierId" placeholder="选择征信机构"><a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option></a-select></a-form-item></a-col>
            <a-col :span="12"><a-form-item field="contractIds" label="合同"><a-select v-model="form.contractIds" multiple allow-clear placeholder="选择合同"><a-option v-for="c in filteredContractOptions" :key="c.id" :value="c.id">{{ c.contractName }}</a-option></a-select></a-form-item></a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="8"><a-form-item field="granularity" label="结算粒度" required><a-select v-model="form.granularity"><a-option value="month">月</a-option></a-select></a-form-item></a-col>
            <a-col :span="8"><a-form-item field="timeLabel" label="结算时间" required><a-select v-model="form.timeLabel" placeholder="选择月份"><a-option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</a-option></a-select></a-form-item></a-col>
            <a-col :span="8"><a-form-item field="createdBy" label="创建人"><a-input v-model="form.createdBy" placeholder="输入创建人" /></a-form-item></a-col>
          </a-row>
          <div style="text-align: right">
            <a-space>
              <a-button type="outline" @click="goBack">返回列表</a-button>
              <a-button type="primary" :disabled="!form.supplierId || !form.timeLabel" @click="submitCreate">创建任务</a-button>
            </a-space>
          </div>
        </a-form>
      </a-card>
      <a-card :bordered="true" v-else>
        <a-descriptions :column="3" title="任务信息" style="margin-bottom: 12px">
          <a-descriptions-item label="任务名称">{{ taskName }}</a-descriptions-item>
          <a-descriptions-item label="征信机构">{{ supplierName }}</a-descriptions-item>
          <a-descriptions-item label="账期">{{ month }}</a-descriptions-item>
        </a-descriptions>
        <a-steps :current="currentIndex" style="margin-bottom:12px">
          <a-step title="费用核算" />
          <a-step title="外部对账" />
          <a-step title="确认核销" />
          <a-step title="待报销" />
        </a-steps>
        <component :is="currentPanel" :supplierId="supplierId" :month="month" :embedded="true" ref="panelRef" />
        <div style="margin-top:12px; display:flex; justify-content:flex-end">
          <a-space>
            <a-button @click="prev" :disabled="currentIndex===0">上一步</a-button>
            <a-button type="outline" @click="save">保存</a-button>
            <a-button type="primary" @click="next" :disabled="currentIndex===3">下一步</a-button>
          </a-space>
        </div>
      </a-card>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useSettlementFlowStore } from '../stores/settlementFlow'
import { useContractStore } from '../stores/contract'
import CostingPanel from './settlement/CostingPanel.vue'
import ReconcilePanel from './settlement/ReconcilePanel.vue'
import WriteoffPanel from './settlement/WriteoffPanel.vue'
import ReimbursementPanel from './settlement/ReimbursementPanel.vue'

const route = useRoute()
const router = useRouter()
const store = useContractStore()
const flow = useSettlementFlowStore()

const id = computed(() => String(route.params.id || ''))
const taskName = computed(() => String(route.query.taskName || route.params.id || ''))
const supplierId = computed(() => String(route.query.supplierId || ''))
const month = computed(() => String(route.query.month || ''))
const currentIndex = computed(() => flow.currentStepIndex)
const currentPanel = computed(() => {
  if (currentIndex.value === 0) return CostingPanel
  if (currentIndex.value === 1) return ReconcilePanel
  if (currentIndex.value === 2) return WriteoffPanel
  return ReimbursementPanel
})
const panelRef = ref<any>()
const isStepCompleted = computed(() => {
  const sid = supplierId.value
  const mon = month.value
  if (!sid || !mon) return false
  if (currentIndex.value === 0) return flow.isCostingCompleted(sid, mon)
  if (currentIndex.value === 1) return flow.isReconcileCompleted(sid, mon)
  if (currentIndex.value === 2) return flow.isWriteoffCompleted(sid, mon)
  return flow.isReimbursementCompleted(sid, mon)
})

const form = ref<{ supplierId: string; contractIds: string[]; granularity: 'month'; timeLabel: string; createdBy: string }>({
  supplierId: '',
  contractIds: [],
  granularity: 'month',
  timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
  createdBy: '管理员'
})

const supplierOptions = computed(() => Array.from(new Set(store.list.map((i: any) => i.supplier).filter(Boolean))))
const contractOptions = computed(() => store.list.map((i: any) => ({ id: String(i.id), contractName: String(i.contractName || i.id), supplier: i.supplier || '—' })))
const filteredContractOptions = computed(() => {
  if (!form.value.supplierId) return contractOptions.value
  return contractOptions.value.filter(c => c.supplier === form.value.supplierId)
})
const supplierName = computed(() => form.value.supplierId || String(route.query.supplierId || ''))
const pad = (n: number) => String(n).padStart(2,'0')
const buildMonthOptions = () => {
  const arr: Array<{ value: string; label: string }> = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const v = `${d.getFullYear()}-${pad(d.getMonth()+1)}`
    const start = `${d.getFullYear()}${pad(d.getMonth()+1)}01`
    const endDate = new Date(d.getFullYear(), d.getMonth()+1, 0)
    const end = `${endDate.getFullYear()}${pad(endDate.getMonth()+1)}${pad(endDate.getDate())}`
    arr.push({ value: v, label: `${start} - ${end}` })
  }
  return arr
}
const monthOptions = computed(() => buildMonthOptions())

const next = async () => {
  try {
    let ok = false
    if (panelRef.value && typeof panelRef.value.complete === 'function') {
      ok = Boolean(await panelRef.value.complete())
    } else {
      Message.warning('当前步骤未暴露完成方法，请先保存或刷新后重试')
    }
    if (ok || isStepCompleted.value) {
      flow.next()
      router.replace({ path: route.path, query: { ...route.query, step: String(flow.currentStepIndex) } })
      Message.success('已进入下一步')
    } else {
      Message.warning('请先完成当前步骤')
    }
  } catch (e) {
    Message.error('推进失败，请稍后重试')
  }
}
const prev = () => flow.prev()
const goBack = () => router.push('/budget/settlement')
const save = async () => {
  try {
    if (panelRef.value && typeof panelRef.value.save === 'function') {
      await panelRef.value.save()
      Message.success('已保存当前步骤进度')
    }
  } catch (e) {}
}

const submitCreate = () => {
  const nid = `ST-${Date.now()}`
  router.replace({ path: `/budget/settlement/task/${nid}`, query: { supplierId: form.value.supplierId, month: form.value.timeLabel } })
  Message.success('结算任务已创建')
}

onMounted(async () => { await store.fetchContractList({ page: 1, pageSize: 100 }) })
const stepParam = computed(() => Number(route.query.step || 0))
onMounted(() => { const idx = stepParam.value; if (!Number.isNaN(idx)) { while (flow.currentStepIndex > idx) flow.prev(); while (flow.currentStepIndex < idx) flow.next() } })
</script>

<style scoped>
.task-page { width: 100%; }
</style>
