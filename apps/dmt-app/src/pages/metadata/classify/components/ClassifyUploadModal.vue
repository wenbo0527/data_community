<template>
  <a-modal
    :visible="visible"
    :title="`批量上传分级分类${tableName ? ' · ' + tableName : ''}`"
    :width="720"
    :mask-closable="false"
    :ok-text="step === 2 ? '开始解析' : '下一步'"
    :cancel-text="step === 0 ? '取消' : '上一步'"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <!-- 步骤条 -->
    <a-steps :current="step" size="small" style="margin-bottom: 20px">
      <a-step title="选择文件" />
      <a-step title="数据预览" />
      <a-step title="解析" />
    </a-steps>

    <!-- Step 0: 选择文件 -->
    <div v-if="step === 0" class="upload-step">
      <a-upload
        :auto-upload="false"
        :show-file-list="false"
        accept=".xlsx"
        @change="onFileChange"
      >
        <template #upload-button>
          <div class="dropzone" :class="{ active: dragActive }">
            <icon-upload :size="48" />
            <div class="dropzone-title">点击或拖拽 Excel 文件到此处</div>
            <div class="dropzone-hint">仅支持 .xlsx 格式</div>
          </div>
        </template>
      </a-upload>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    </div>

    <!-- Step 1: 数据预览 -->
    <div v-else-if="step === 1" class="preview-step">
      <a-alert type="info" style="margin-bottom: 12px">
        <template #title>已选择：{{ fileName }}</template>
        <template #content>仅展示前 5 行数据（Demo 模式）</template>
      </a-alert>
      <a-table :data="previewRows" :pagination="false" :bordered="true" :scroll="{ x: '100%' }">
        <template #columns>
          <a-table-column title="字段名" data-index="field_name" :width="120" />
          <a-table-column title="字段注释" data-index="field_comment" :width="120" />
          <a-table-column title="业务属于" data-index="business_belonging" :width="100" />
          <a-table-column title="分级" data-index="grade" :width="80" />
          <a-table-column title="敏感级别" :width="100">
            <template #cell="{ record }">
              <a-tag :color="SENSITIVITY_COLORS[record.sensitivity_level as SensitivityLevel]">
                {{ record.sensitivity_level }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="一级" data-index="category_l1" :width="100" />
          <a-table-column title="二级" data-index="category_l2" :width="100" />
          <a-table-column title="三级" data-index="category_l3" :width="100" />
          <a-table-column title="四级" data-index="category_l4" :width="100" />
        </template>
      </a-table>
      <a-button type="text" size="small" style="margin-top: 8px" @click="resetFile">重新选择</a-button>
    </div>

    <!-- Step 2: 解析中 -->
    <div v-else class="parse-step">
      <a-spin :loading="loading" tip="解析中..." style="width: 100%; min-height: 160px; display: flex; align-items: center; justify-content: center;">
        <div v-if="parseSuccess" class="success-area">
          <icon-check-circle-fill :size="64" style="color: #52C41A" />
          <div class="success-title">解析成功！共 {{ parsedCount }} 字段</div>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { SENSITIVITY_COLORS } from '@shared/classify-constants'
import type { SensitivityLevel } from '@shared/classify-types'
import {
  IconUpload, IconCheckCircleFill
} from '@arco-design/web-vue/es/icon'

const props = defineProps<{
  visible: boolean
  tableName?: string
}>()
const emit = defineEmits<{
  'update:visible': [v: boolean]
  'success': [count: number]
}>()

const step = ref(0)
const fileName = ref('')
const errorMsg = ref('')
const dragActive = ref(false)
const loading = ref(false)
const parseSuccess = ref(false)
const parsedCount = ref(0)

const previewRows = ref([
  { field_name: 'mobile', field_comment: '手机号', business_belonging: '零售', grade: '重要', sensitivity_level: 'L3', category_l1: '客户信息', category_l2: '个人PII', category_l3: '联系方式', category_l4: '手机号' },
  { field_name: 'id_card', field_comment: '身份证号', business_belonging: '零售', grade: '关键', sensitivity_level: 'L4', category_l1: '客户信息', category_l2: '个人PII', category_l3: '身份信息', category_l4: '身份证号' },
  { field_name: 'email', field_comment: '邮箱', business_belonging: '零售', grade: '重要', sensitivity_level: 'L3', category_l1: '客户信息', category_l2: '个人PII', category_l3: '联系方式', category_l4: '邮箱' },
  { field_name: 'user_id', field_comment: '用户ID', business_belonging: '零售', grade: '一般', sensitivity_level: 'L2', category_l1: '客户信息', category_l2: '基础属性', category_l3: '用户标识', category_l4: '用户ID' },
  { field_name: 'register_time', field_comment: '注册时间', business_belonging: '零售', grade: '一般', sensitivity_level: 'L1', category_l1: '客户信息', category_l2: '基础属性', category_l3: '账户信息', category_l4: '注册时间' }
])

watch(() => props.visible, (v) => {
  if (v) {
    step.value = 0
    fileName.value = ''
    errorMsg.value = ''
    parseSuccess.value = false
    loading.value = false
  }
})

const onFileChange = (file: any) => {
  errorMsg.value = ''
  if (!file?.name) return
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    errorMsg.value = '仅支持 .xlsx 格式'
    setTimeout(() => { errorMsg.value = '' }, 2000)
    return
  }
  fileName.value = file.name
  step.value = 1
}

const resetFile = () => { step.value = 0; fileName.value = '' }

const handleOk = () => {
  if (step.value === 0) {
    if (!fileName.value) { Message.warning('请先选择文件'); return }
    step.value = 1
  } else if (step.value === 1) {
    step.value = 2
    loading.value = true
    setTimeout(() => {
      parsedCount.value = 500
      parseSuccess.value = true
      loading.value = false
      setTimeout(() => {
        emit('success', parsedCount.value)
      }, 800)
    }, 1500)
  } else if (step.value === 2) {
    emit('update:visible', false)
  }
}

const handleCancel = () => {
  if (step.value === 0) {
    emit('update:visible', false)
  } else if (step.value === 1) {
    step.value = 0
    fileName.value = ''
  } else {
    // step 2 解析中不允许取消
  }
}

const visible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})
</script>

<style scoped>
.upload-step, .preview-step, .parse-step { padding: 8px 0; }
.dropzone {
  border: 2px dashed #c9cdd4;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  color: #4e5969;
  transition: all 0.2s;
}
.dropzone:hover, .dropzone.active {
  border-color: #165DFF;
  background: #f2f5ff;
  color: #165DFF;
}
.dropzone-title { font-size: 16px; font-weight: 500; margin: 8px 0 4px; }
.dropzone-hint { font-size: 13px; color: #86909c; }
.error-msg { color: #F5222D; font-size: 13px; margin-top: 8px; text-align: center; }
.success-area { text-align: center; padding: 20px 0; }
.success-title { font-size: 16px; font-weight: 500; margin-top: 12px; color: #52C41A; }
</style>
