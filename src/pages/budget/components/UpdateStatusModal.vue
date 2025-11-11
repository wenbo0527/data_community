<template>
  <a-modal
    v-model:visible="visible"
    title="项目状态变更"
    :width="520"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-descriptions layout="horizontal" :column="2" :data="projectDesc" style="margin-bottom: 12px" />
    <a-form :model="form" layout="vertical">
      <a-form-item field="status" label="新状态" required>
        <a-select v-model="form.status" placeholder="请选择新状态">
          <a-option value="planning">规划中</a-option>
          <a-option value="in_progress">进行中</a-option>
          <a-option value="completed">已完成</a-option>
          <a-option value="paused">已暂停</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="remark" label="说明">
        <a-textarea v-model="form.remark" :rows="3" placeholder="请填写状态变更说明" />
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

const form = reactive({ status: '', remark: '' })

const projectDesc = computed(() => ([
  { label: '项目名称', value: props.project?.projectName || '-' },
  { label: '项目编号', value: props.project?.projectNo || '-' },
  { label: '当前状态', value: props.project?.status || '-' },
  { label: '负责人', value: props.project?.owner || '-' }
]))

const handleOk = () => {
  if (!form.status) {
    Message.error('请选择新状态')
    return
  }
  emit('confirm', form.status)
  emit('update:visible', false)
}
const handleCancel = () => emit('update:visible', false)
</script>

<style scoped>
</style>