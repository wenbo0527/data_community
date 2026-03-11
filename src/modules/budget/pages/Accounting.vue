<template>
  <div class="accounting-flow">
    <div class="page-header">
      <h3>核算流程</h3>
      <p class="desc">供应商费用核算、外部对账与确认核销统一流程</p>
    </div>
    <a-card class="toolbar" :bordered="true" style="margin-bottom: 12px">
      <template v-if="stage === 'costing'">
        <a-form :model="form" layout="inline">
          <a-form-item field="supplierId" label="供应商" required>
            <a-select v-model="form.supplierId" allow-clear placeholder="选择供应商" style="width: 260px">
              <a-option v-for="opt in supplierOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="taskName" label="任务名称">
            <a-input v-model="form.taskName" allow-clear placeholder="输入任务名称" style="width: 240px" />
          </a-form-item>
          <a-form-item field="granularity" label="粒度" required>
            <a-select v-model="form.granularity" allow-clear placeholder="选择" style="width: 120px">
              <a-option value="year">年</a-option>
              <a-option value="quarter">季</a-option>
              <a-option value="month">月</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="timeLabel" label="时间" required>
            <a-input v-model="form.timeLabel" allow-clear placeholder="如 2025 / 2025-Q2 / 2025-01" style="width: 180px" />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="applySelection">应用</a-button>
              <a-button @click="resetSelection">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </template>
      <template v-else>
        <a-space>
          <a-tag>当前供应商：{{ currentSupplierName }}</a-tag>
          <a-tag>账期：{{ selectedMonth }}</a-tag>
          <a-button size="small" @click="goStage('costing')">费用核算</a-button>
          <a-button size="small" @click="goStage('reconcile')">外部对账</a-button>
          <a-button size="small" @click="goStage('writeoff')">确认核销</a-button>
        </a-space>
      </template>
    </a-card>
    <a-steps :current="currentStep" style="margin-bottom: 12px">
      <a-step title="费用核算" />
      <a-step title="外部对账" />
      <a-step title="确认核销" />
    </a-steps>
    <a-card :title="stepCardTitle" :bordered="true" style="margin-bottom: 12px">
      <CostingPanel v-if="currentStep === 0" :embedded="true" :supplierId="form.supplierId" :month="selectedMonth" :taskName="form.taskName" />
      <ReconcilePanel v-else-if="currentStep === 1" :embedded="true" :supplierId="form.supplierId" :month="selectedMonth" />
      <WriteoffPanel v-else-if="currentStep === 2" :embedded="true" :supplierId="form.supplierId" :month="selectedMonth" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CostingPanel from './settlement/CostingPanel.vue'
import ReconcilePanel from './settlement/ReconcilePanel.vue'
import WriteoffPanel from './settlement/WriteoffPanel.vue'
import { useSettlementSupplier } from '@/modules/budget/composables/useSettlementSupplier'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()
const stage = computed(() => {
  const s = String(route.query.stage || 'costing')
  if (['costing','reconcile','writeoff'].includes(s)) return s
  return 'costing'
})
const currentStep = computed(() => stage.value === 'costing' ? 0 : stage.value === 'reconcile' ? 1 : 2)
const stepCardTitle = computed(() => currentStep.value === 0 ? '费用核算' : currentStep.value === 1 ? '外部对账' : '确认核销')

const { supplierOptions, loadSuppliers } = useSettlementSupplier()
const form = reactive<{ supplierId: string; granularity: 'year'|'quarter'|'month'; timeLabel: string; taskName?: string }>({
  supplierId: '',
  granularity: 'month',
  timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
  taskName: ''
})
const selectedMonth = computed(() => {
  if (form.granularity === 'month' && /^\d{4}-\d{2}$/.test(form.timeLabel)) return form.timeLabel
  return `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
})
const applySelection = () => {
  if (!form.supplierId || !form.timeLabel) {
    Message.error('请选择供应商并填写账期')
    return
  }
  Message.success('已应用供应商与账期')
}
const resetSelection = () => {
  form.supplierId = ''
  form.granularity = 'month'
  form.timeLabel = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
}
const goStage = (next: 'costing'|'reconcile'|'writeoff') => {
  const qSupplier = form.supplierId || ''
  const qMonth = selectedMonth.value
  router.push(`/risk/budget/accounting?stage=${next}&supplierId=${encodeURIComponent(qSupplier)}&month=${encodeURIComponent(qMonth)}`)
}
onMounted(async () => {
  await loadSuppliers()
  const qSupplier = String(route.query.supplierId || '')
  const qMonth = String(route.query.month || '')
  if (qSupplier) form.supplierId = qSupplier
  if (qMonth) { form.granularity = 'month'; form.timeLabel = qMonth }
})

const currentSupplierName = computed(() => {
  const opt = supplierOptions.value.find((o: any) => o.value === form.supplierId)
  return opt ? opt.label : form.supplierId || '—'
})
</script>

<style scoped>
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; }
</style>
