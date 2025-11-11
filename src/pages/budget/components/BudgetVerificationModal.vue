<template>
  <a-modal
    v-model:visible="visible"
    title="预算核销"
    :width="720"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-descriptions layout="horizontal" :column="2" :data="budgetDesc" style="margin-bottom: 12px" />
    <a-form :model="form" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item field="verificationAmount" label="核销金额" required>
            <a-input-number v-model="form.verificationAmount" :min="0" :precision="2" style="width: 100%">
              <template #prefix>¥</template>
            </a-input-number>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="verificationDate" label="核销日期" required>
            <a-date-picker v-model="form.verificationDate" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item field="remark" label="核销说明">
        <a-textarea v-model="form.remark" :rows="3" placeholder="请输入说明" />
      </a-form-item>
    </a-form>
    <div v-if="projects && projects.length" style="margin-top: 12px">
      <h4 style="margin-bottom: 8px">可关联项目</h4>
      <a-table :columns="projectColumns" :data="projects" :pagination="false" row-key="id">
        <template #amount="{ record }">¥{{ formatAmount(record.amount) }}</template>
      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  budget: { type: Object, default: null },
  projects: { type: Array as () => any[], default: () => [] }
})
const emit = defineEmits(['update:visible', 'confirm'])

// 可写的可见性绑定，支持父组件 v-model:visible
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const form = reactive({
  verificationAmount: 0,
  verificationDate: '',
  remark: ''
})

const budgetDesc = computed(() => ([
  { label: '预算名称', value: props.budget?.budgetName || '-' },
  { label: '预算编号', value: props.budget?.budgetNo || '-' },
  { label: '预算总额', value: `¥${formatAmount(props.budget?.totalAmount || 0)}` },
  { label: '剩余金额', value: `¥${formatAmount(props.budget?.remainingAmount || 0)}` }
]))

const projectColumns = [
  { title: '项目名称', dataIndex: 'projectName', width: 200 },
  { title: '项目编号', dataIndex: 'projectNo', width: 120 },
  { title: '金额', slotName: 'amount', width: 120 }
]

const handleOk = () => {
  if (!form.verificationAmount || !form.verificationDate) {
    Message.error('请完整填写核销信息')
    return
  }
  emit('confirm', { ...form })
  emit('update:visible', false)
}
const handleCancel = () => emit('update:visible', false)

const formatAmount = (val: number) => {
  const n = Number(val || 0)
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
</style>