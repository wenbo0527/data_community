<template>
  <a-drawer
    v-model:visible="visible"
    title="人工外呼节点配置"
    width="480px"
    placement="right"
    @cancel="handleCancel"
  >
    <div class="config-form">
      <a-form
        ref="formRef"
        :model="formData"
        layout="vertical"
      >
        <!-- 待开发 -->
        <a-form-item label="外呼配置" field="callConfig">
          <a-input placeholder="请输入外呼配置" />
        </a-form-item>
      </a-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSubmit">确定</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  nodeData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const formRef = ref()
const visible = ref(false)
const formData = reactive({
  callConfig: ''
})

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleSubmit = () => {
  emit('confirm', formData)
  emit('update:visible', false)
}
</script>