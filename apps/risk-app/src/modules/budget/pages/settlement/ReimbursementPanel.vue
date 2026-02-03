<template>
  <div class="reimbursement-panel">
    <a-form v-if="!embedded" :model="form" layout="inline" style="margin-bottom: 12px">
      <a-form-item field="supplierId" label="征信机构" required>
        <a-select v-model="form.supplierId" allow-clear placeholder="选择征信机构" style="width: 240px" disabled>
          <a-option v-for="s in supplierOptions" :key="s.value" :value="s.value">{{ s.label }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="month" label="账期" required>
        <a-input v-model="form.month" placeholder="YYYY-MM" style="width: 140px" disabled />
      </a-form-item>
    </a-form>

    <a-card title="报销信息录入" :bordered="true">
      <a-form :model="reimbursementForm" layout="vertical">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="reimbursementNo" label="易行宝报销单号" required>
              <a-input v-model="reimbursementForm.reimbursementNo" placeholder="请输入易行宝报销单号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="paymentDate" label="付款日期" required>
              <a-date-picker v-model="reimbursementForm.paymentDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <div v-if="!embedded" style="text-align: right; margin-top: 12px;">
      <a-space>
        <a-button type="primary" :disabled="!form.supplierId || !form.month" @click="finishReimbursement">完成报销</a-button>
        <a-button type="outline" :disabled="!form.supplierId || !form.month" @click="saveTask">保存</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { useSettlementSupplier } from '../../composables/useSettlementSupplier'
import { useSettlementFlowStore } from '../../stores/settlementFlow'
import { createSettlementTask } from '../../api/settlement'
import { log } from '@/utils/logger'

const router = useRouter()
const flowStore = useSettlementFlowStore()
const { supplierOptions, loadSuppliers } = useSettlementSupplier()

const props = defineProps<{ supplierId?: string; month?: string; embedded?: boolean; taskName?: string }>()
const embedded = computed(() => props.embedded === true)
const form = ref({ supplierId: props.supplierId || '', month: props.month || '' })

const reimbursementForm = ref({
  reimbursementNo: '',
  paymentDate: ''
})

const loadReimbursementData = () => {
  if (form.value.supplierId && form.value.month) {
    const data = flowStore.getReimbursement(form.value.supplierId, form.value.month)
    if (data) {
      reimbursementForm.value = {
        reimbursementNo: data.reimbursementNo,
        paymentDate: data.paymentDate
      }
    }
  }
}

const saveTask = async () => {
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择供应商与账期'); return }
  
  flowStore.setReimbursementSnapshot(form.value.supplierId, form.value.month, reimbursementForm.value)
  log('reimbursement.save', { supplierId: form.value.supplierId, month: form.value.month, data: reimbursementForm.value })
  
  await createSettlementTask({
    supplierIds: [form.value.supplierId],
    contractIds: [],
    granularity: 'month',
    timeLabel: form.value.month,
    createdBy: '管理员',
    stage: 'pending_reimbursement',
    taskName: props.taskName || `报销-${form.value.supplierId}-${form.value.month}`
  } as any)
  
  Message.success('已保存任务，状态为待报销')
  if (!embedded.value) router.push('/budget/settlement')
}

const finishReimbursement = async (): Promise<boolean> => {
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择征信机构与账期'); return false }
  if (!reimbursementForm.value.reimbursementNo || !reimbursementForm.value.paymentDate) {
    Message.warning('请填写完整的报销信息')
    return false
  }

  flowStore.setReimbursementSnapshot(form.value.supplierId, form.value.month, reimbursementForm.value)
  log('reimbursement.finish', { supplierId: form.value.supplierId, month: form.value.month, data: reimbursementForm.value })

  try {
    await createSettlementTask({
      supplierIds: [form.value.supplierId],
      contractIds: [],
      granularity: 'month',
      timeLabel: form.value.month,
      createdBy: '管理员',
      stage: 'done',
      taskName: props.taskName || `报销-${form.value.supplierId}-${form.value.month}`
    } as any)
  } catch (e) {
    Message.warning('保存任务到后端失败，已先行进入下一步')
  }

  flowStore.markReimbursementCompleted(form.value.supplierId, form.value.month, true)
  Message.success('已完成报销，任务状态为已完成')
  if (!embedded.value) router.push('/budget/settlement')
  return true
}

onMounted(async () => {
  try { await loadSuppliers() } catch {}
  loadReimbursementData()
})

watch(() => props.supplierId, (sid: string | undefined) => { 
  form.value.supplierId = sid || ''
  loadReimbursementData()
})
watch(() => props.month, (m: string | undefined) => { 
  form.value.month = m || ''
  loadReimbursementData()
})

defineExpose({
  save: saveTask,
  complete: finishReimbursement
})
</script>

<style scoped>
.reimbursement-panel { width: 100%; }
</style>
