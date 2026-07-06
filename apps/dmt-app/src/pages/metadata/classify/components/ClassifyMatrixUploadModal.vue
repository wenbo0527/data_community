<template>
  <a-modal
    :visible="visible"
    title="批量导入分级分类矩阵表"
    :width="760"
    :mask-closable="false"
    :ok-text="okText"
    :cancel-text="step === 0 ? '取消' : '上一步'"
    :ok-button-props="{ disabled: step === 0 && !fileName }"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <!-- 步骤条 -->
    <a-steps :current="step" size="small" style="margin-bottom: 20px">
      <a-step title="选择文件" />
      <a-step title="数据预览" />
      <a-step title="解析结果" />
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
            <div class="dropzone-hint">仅支持 .xlsx 格式 · 模板：5 列（一级/二级/三级/四级/安全级别）</div>
          </div>
        </template>
      </a-upload>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <a-alert type="info" style="margin-top: 12px" :show-icon="false">
        <template #content>
          <div style="font-size: 12px; line-height: 1.6">
            Excel 列顺序：<b>一级分类 | 二级定义 | 三级定义 | 四级分类内容 | 安全级别</b><br />
            安全级别取值：L1（公开）/ L2（内部）/ L3（秘密）/ L4（机密）
          </div>
        </template>
      </a-alert>
    </div>

    <!-- Step 1: 数据预览 -->
    <div v-else-if="step === 1" class="preview-step">
      <a-alert type="info" style="margin-bottom: 12px">
        <template #title>已选择：{{ fileName }}</template>
        <template #content>仅展示前 5 行数据（Demo 模式）</template>
      </a-alert>
      <a-table :data="previewRows" :pagination="false" :bordered="true" :scroll="{ x: '100%' }">
        <template #columns>
          <a-table-column title="一级分类" data-index="category_l1" :width="110" />
          <a-table-column title="二级定义" data-index="category_l2" :width="120" />
          <a-table-column title="三级定义" data-index="category_l3" :width="120" />
          <a-table-column title="四级分类内容" data-index="category_l4" :width="140" />
          <a-table-column title="安全级别" :width="110">
            <template #cell="{ record }">
              <a-tag :color="SENSITIVITY_COLORS[record.sensitivity_level as SensitivityLevel]">
                {{ record.sensitivity_level }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <a-button type="text" size="small" style="margin-top: 8px" @click="resetFile">重新选择</a-button>
    </div>

    <!-- Step 2: 解析明细报表 -->
    <div v-else class="result-step">
      <a-spin :loading="loading" tip="解析中..." style="width: 100%; min-height: 80px; display: flex; align-items: center; justify-content: center;">
        <div v-if="parseSuccess" class="result-content">
          <!-- 成功提示 -->
          <div class="result-header">
            <icon-check-circle-fill :size="40" style="color: #52C41A" />
            <div class="result-title">解析完成</div>
          </div>

          <!-- 统计卡 -->
          <a-row :gutter="12" class="stats-row">
            <a-col :span="8">
              <a-card class="stat-card stat-added">
                <a-statistic title="新增" :value="result.added" :value-style="{ color: '#52C41A', fontSize: '22px' }" />
              </a-card>
            </a-col>
            <a-col :span="8">
              <a-card class="stat-card stat-updated">
                <a-statistic title="更新" :value="result.updated" :value-style="{ color: '#165DFF', fontSize: '22px' }" />
              </a-card>
            </a-col>
            <a-col :span="8">
              <a-card class="stat-card stat-ignored">
                <a-statistic title="忽略" :value="result.ignored" :value-style="{ color: '#86909c', fontSize: '22px' }" />
              </a-card>
            </a-col>
          </a-row>

          <!-- 详细列表 -->
          <div class="detail-title">解析明细（{{ result.details.length }} 条）</div>
          <a-table
            :data="result.details"
            :pagination="{ pageSize: 5, showTotal: true, showPageSize: false }"
            :bordered="false"
            size="small"
          >
            <template #columns>
              <a-table-column title="行号" data-index="row" :width="60" />
              <a-table-column title="四级分类" data-index="category_l4" :width="160" />
              <a-table-column title="安全级别" :width="90">
                <template #cell="{ record }">
                  <a-tag :color="SENSITIVITY_COLORS[record.sensitivity_level as SensitivityLevel]" size="small">
                    {{ record.sensitivity_level }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="处理结果" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="actionColor(record.action)" size="small">{{ actionLabel(record.action) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="说明" data-index="reason" />
            </template>
          </a-table>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { SENSITIVITY_COLORS } from '@shared/classify-constants'
import type { SensitivityLevel } from '@shared/classify-types'
import {
  IconUpload, IconCheckCircleFill
} from '@arco-design/web-vue/es/icon'

const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits<{
  'update:visible': [v: boolean]
  'success': [result: { added: number; updated: number; ignored: number }]
}>()

const step = ref(0)
const fileName = ref('')
const errorMsg = ref('')
const dragActive = ref(false)
const loading = ref(false)
const parseSuccess = ref(false)

/** 矩阵表条目的固定 5 列预览 */
const previewRows = ref([
  { category_l1: '客户信息', category_l2: '个人PII', category_l3: '联系方式', category_l4: '手机号', sensitivity_level: 'L3' },
  { category_l1: '客户信息', category_l2: '个人PII', category_l3: '身份信息', category_l4: '身份证号', sensitivity_level: 'L4' },
  { category_l1: '业务交易', category_l2: '订单', category_l3: '支付信息', category_l4: '支付金额', sensitivity_level: 'L3' },
  { category_l1: '财务', category_l2: '账户', category_l3: '余额信息', category_l4: '账户余额', sensitivity_level: 'L4' },
  { category_l1: '运营', category_l2: '营销触达', category_l3: '客户标签', category_l4: '营销偏好', sensitivity_level: 'L2' }
])

/** 解析结果（Demo 模式固定假数据） */
const result = ref({
  added: 0,
  updated: 0,
  ignored: 0,
  details: [] as Array<{
    row: number
    category_l4: string
    sensitivity_level: SensitivityLevel
    action: 'added' | 'updated' | 'ignored'
    reason: string
  }>
})

const okText = computed(() => {
  if (step.value === 0) return '下一步'
  if (step.value === 1) return '开始解析'
  return '完成'
})

watch(() => props.visible, (v) => {
  if (v) {
    step.value = 0
    fileName.value = ''
    errorMsg.value = ''
    parseSuccess.value = false
    loading.value = false
    result.value = { added: 0, updated: 0, ignored: 0, details: [] }
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

const actionColor = (a: string) => a === 'added' ? 'green' : a === 'updated' ? 'arcoblue' : 'gray'
const actionLabel = (a: string) => a === 'added' ? '新增' : a === 'updated' ? '更新' : '忽略'

const handleOk = () => {
  if (step.value === 0) {
    if (!fileName.value) return
    step.value = 1
  } else if (step.value === 1) {
    step.value = 2
    loading.value = true
    setTimeout(() => {
      // Demo 固定假数据：6 新增 / 4 更新 / 2 忽略
      result.value = {
        added: 6,
        updated: 4,
        ignored: 2,
        details: [
          { row: 2, category_l4: '手机号', sensitivity_level: 'L3', action: 'added', reason: '矩阵表无此条目' },
          { row: 5, category_l4: '家庭住址', sensitivity_level: 'L3', action: 'updated', reason: 'L2 → L3' },
          { row: 8, category_l4: '邮箱', sensitivity_level: 'L3', action: 'ignored', reason: '安全级别超出枚举范围' },
          { row: 11, category_l4: '银行卡号', sensitivity_level: 'L4', action: 'updated', reason: '修改一级分类' },
          { row: 14, category_l4: '支付金额', sensitivity_level: 'L3', action: 'added', reason: '矩阵表无此条目' },
          { row: 17, category_l4: '账户余额', sensitivity_level: 'L4', action: 'ignored', reason: '四级分类内容为空' }
        ]
      }
      parseSuccess.value = true
      loading.value = false
    }, 1500)
  } else if (step.value === 2) {
    emit('success', { added: result.value.added, updated: result.value.updated, ignored: result.value.ignored })
  }
}

const handleCancel = () => {
  if (step.value === 0) {
    emit('update:visible', false)
  } else if (step.value === 1) {
    step.value = 0
    fileName.value = ''
  }
  // step 2 不允许取消（必须点完成/外部关闭）
}

const visible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})
</script>

<style scoped>
.upload-step, .preview-step, .result-step { padding: 8px 0; }
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

.result-content { padding: 8px 0; }
.result-header { text-align: center; margin-bottom: 16px; }
.result-title { font-size: 16px; font-weight: 500; margin-top: 8px; color: #52C41A; }
.stats-row { margin-bottom: 16px; }
.stat-card { text-align: center; }
.detail-title { font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #4e5969; }
</style>
