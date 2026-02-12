<template>
  <a-modal
    v-model:visible="visible"
    title="上报缺失资产"
    :width="640"
    :mask-closable="false"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="modal-intro">
      <icon-info-circle-fill /> 没找到想要的数据？告诉我们，我们将尽快为您补齐。
    </div>

    <a-form 
      :model="form" 
      ref="formRef" 
      layout="vertical" 
      class="optimized-form"
      validate-trigger="blur"
    >
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item
            field="type"
            label="缺失类型"
            :rules="[{ required: true, message: '请选择缺失类型' }]"
          >
            <a-select v-model="form.type" placeholder="请选择类型" allow-clear>
              <a-option value="table">
                <template #prefix><icon-storage /></template>
                数据表
              </a-option>
              <a-option value="metric">
                <template #prefix><icon-experiment /></template>
                业务指标
              </a-option>
              <a-option value="external">
                <template #prefix><icon-cloud /></template>
                外部数据
              </a-option>
              <a-option value="other">
                <template #prefix><icon-more /></template>
                其他
              </a-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item
            v-if="form.type"
            field="targetAssetName"
            :label="targetAssetNameLabel"
            :rules="[{ required: true, message: `请输入${targetAssetNameLabel}` }]"
          >
            <a-input 
              v-model="form.targetAssetName" 
              :placeholder="`名称或关键字`" 
              allow-clear 
              @press-enter="handleOk"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item
            field="priority"
            label="紧急程度"
          >
            <a-radio-group v-model="form.priority" type="button" size="medium">
              <a-radio value="low">普通</a-radio>
              <a-radio value="medium">紧急</a-radio>
              <a-radio value="high">非常紧急</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item
            field="expectedUsageTime"
            label="期望补齐时间"
          >
            <a-date-picker v-model="form.expectedUsageTime" style="width: 100%" placeholder="不限" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item
        field="description"
        label="详细描述与用途"
        :rules="[{ required: true, message: '描述一下您需要的数据及其用途' }]"
      >
        <a-textarea
          v-model="form.description"
          placeholder="例如：需要近一年的信贷逾期明细表，用于营销策略模型训练..."
          :auto-size="{ minRows: 3, maxRows: 5 }"
          show-word-limit
          :max-length="200"
        />
      </a-form-item>

      <a-collapse :bordered="false" class="advanced-options">
        <a-collapse-item header="更多可选信息（问题范围、截图等）" key="1">
          <a-form-item
            field="marketingScope"
            label="影响范围"
          >
            <a-input v-model="form.marketingScope" placeholder="哪些业务或部门受影响？" />
          </a-form-item>

          <a-form-item
            field="screenshot"
            label="截图附件"
          >
            <a-upload
              v-model:file-list="fileList"
              :limit="1"
              :auto-upload="false"
              draggable
              :custom-request="customRequest"
            >
              <template #upload-button>
                <div class="upload-trigger">
                  <icon-upload /> <span>拖拽或点击上传</span>
                </div>
              </template>
            </a-upload>
          </a-form-item>
        </a-collapse-item>
      </a-collapse>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconStorage, 
  IconExperiment, 
  IconCloud, 
  IconMore,
  IconInfoCircleFill,
  IconUpload
} from '@arco-design/web-vue/es/icon'

const props = defineProps<{
  initialName?: string
}>()

const visible = defineModel<boolean>('visible', { required: true })
const emits = defineEmits(['confirm'])

const formRef = ref()
const fileList = ref([])

const form = reactive({
  type: 'table',
  targetAssetName: '',
  priority: 'low',
  marketingScope: '',
  expectedUsageTime: '',
  description: ''
})

// 监听 initialName 变化并自动填充
watch(() => props.initialName, (newVal) => {
  if (newVal && !form.targetAssetName) {
    form.targetAssetName = newVal
  }
}, { immediate: true })

const targetAssetNameLabel = computed(() => {
  switch (form.type) {
    case 'table':
      return '业务表名称'
    case 'metric':
      return '指标名称'
    case 'external':
      return '数据源名称'
    default:
      return '资产名称'
  }
})

const customRequest = (options: any) => {
  const { onSuccess } = options
  setTimeout(() => {
    onSuccess({})
    Message.success('上传成功')
  }, 500)
}

const handleOk = async () => {
  const errors = await formRef.value?.validate()
  if (errors) {
    return
  }
  
  emits('confirm', {
    ...form,
    screenshot: fileList.value.length > 0 ? fileList.value[0] : null
  })
  
  resetForm()
  visible.value = false
  Message.success({
    content: '感谢您的反馈，我们将尽快处理',
    duration: 3000
  })
}

const isDirty = computed(() => {
  return form.targetAssetName !== (props.initialName || '') || 
         form.description !== '' || 
         form.marketingScope !== '' || 
         fileList.value.length > 0
})

const handleCancel = () => {
  if (isDirty.value) {
    Modal.confirm({
      title: '确认取消？',
      content: '您输入的内容尚未提交，取消将丢失已填写的资料。',
      okText: '确认取消',
      cancelText: '继续填写',
      onOk: () => {
        resetForm()
        visible.value = false
      }
    })
  } else {
    resetForm()
    visible.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.type = 'table'
  form.priority = 'low'
  form.targetAssetName = props.initialName || ''
  fileList.value = []
}
</script>

<style scoped>
.modal-intro {
  margin-bottom: 20px;
  padding: 10px 16px;
  background-color: var(--color-fill-2);
  border-radius: 4px;
  color: var(--color-text-2);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-intro .arco-icon {
  color: #165dff;
  font-size: 16px;
}

.optimized-form :deep(.arco-form-item-label) {
  font-weight: 500;
  color: var(--color-text-1);
}

.advanced-options {
  margin-top: 12px;
  background: transparent;
}

.advanced-options :deep(.arco-collapse-item-header) {
  padding-left: 0;
  color: var(--color-text-3);
  font-size: 13px;
}

.upload-trigger {
  width: 100%;
  border: 1px dashed var(--color-border-3);
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  color: var(--color-text-3);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.upload-trigger:hover {
  border-color: #165dff;
  color: #165dff;
  background-color: var(--color-primary-light-1);
}
</style>