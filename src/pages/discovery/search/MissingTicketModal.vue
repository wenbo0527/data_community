<template>
  <a-modal
    v-model:visible="visible"
    title="缺失工单"
    :width="600"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="form" ref="formRef" layout="vertical">
      <a-form-item
        field="type"
        label="缺失类型"
        :rules="[{ required: true, message: '请选择缺失类型' }]"
      >
        <a-select v-model="form.type" placeholder="请选择缺失类型">
          <a-option value="table">数据表</a-option>
          <a-option value="metric">业务指标</a-option>
          <a-option value="external">外部数据</a-option>
          <a-option value="other">其他</a-option>
        </a-select>
      </a-form-item>
      
      <a-form-item
        field="description"
        label="描述"
        :rules="[{ required: true, message: '请输入描述信息' }]"
      >
        <a-textarea
          v-model="form.description"
          placeholder="请输入缺失数据的详细描述"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </a-form-item>
      
      <a-form-item
        field="screenshot"
        label="截图上传"
      >
        <a-upload
          v-model:file-list="fileList"
          :limit="1"
          :auto-upload="false"
          :show-file-list="true"
          :custom-request="customRequest"
        >
          <template #upload-button>
            <div class="arco-upload-list-item">
              <div class="arco-upload-picture-card">
                <div class="arco-upload-picture-card-text">
                  <icon-plus />
                  <div style="margin-top: 10px; font-weight: 600">点击上传截图</div>
                </div>
              </div>
            </div>
          </template>
        </a-upload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const visible = defineModel<boolean>('visible', { required: true })
const emits = defineEmits(['confirm'])

const formRef = ref()
const fileList = ref([])

const form = reactive({
  type: '',
  description: ''
})

const customRequest = (options: any) => {
  // 模拟上传逻辑
  const { fileItem, onSuccess } = options
  setTimeout(() => {
    onSuccess({})
    Message.success('上传成功')
  }, 1000)
}

const handleOk = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) {
    Message.error('请填写必填项')
    return
  }
  
  // 提交表单逻辑
  emits('confirm', {
    ...form,
    screenshot: fileList.value.length > 0 ? fileList.value[0] : null
  })
  
  // 重置表单
  formRef.value?.resetFields()
  fileList.value = []
  visible.value = false
  Message.success('提交成功')
}

const handleCancel = () => {
  formRef.value?.resetFields()
  fileList.value = []
  visible.value = false
}
</script>

<style scoped>
.arco-upload-picture-card {
  width: 100%;
  height: 120px;
  border-radius: 4px;
}

.arco-upload-picture-card-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-2);
}
</style>