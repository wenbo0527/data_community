<template>
  <a-modal
    v-model:visible="visible"
    title="关联预算"
    :width="520"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-descriptions
      layout="horizontal"
      :column="2"
      :data="projectDesc"
      style="margin-bottom: 12px"
    />
    <a-form :model="form" layout="vertical">
      <a-form-item field="budgetId" label="预算ID" required>
        <a-input v-model="form.budgetId" placeholder="请输入要关联的预算ID" />
      </a-form-item>
      <a-form-item field="remark" label="备注">
        <a-textarea v-model="form.remark" :rows="3" placeholder="可填写关联说明" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null }
})
const emit = defineEmits(['update:visible', 'confirm'])

// 可写的可见性绑定
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const form = reactive({ budgetId: '', remark: '' })

const projectDesc = computed(() => ([
  { label: '项目名称', value: props.project?.projectName || '-' },
  { label: '项目编号', value: props.project?.projectNo || '-' },
  { label: '当前预算', value: props.project?.budgetId ? String(props.project?.budgetId) : '未关联' },
  { label: '负责人', value: props.project?.owner || '-' }
]))

const handleOk = () => {
  if (!form.budgetId) {
    Message.error('请填写预算ID')
    return
  }
  emit('confirm', form.budgetId)
  emit('update:visible', false)
}
const handleCancel = () => emit('update:visible', false)
</script>

<style scoped>
</style>