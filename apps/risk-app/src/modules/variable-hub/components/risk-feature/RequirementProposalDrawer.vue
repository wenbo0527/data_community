<!--
  需求提出表单（A1 · 文档 v2.1 模块 A0/A1）
  - 业务方填写基础信息：需求名称/业务场景/预期效果/加工逻辑/默认值/特征粒度
  - 支持单次提交 + 批量上传 Excel 创建多条需求
  - 提交后状态=需求提出（requirement_proposal），生成 DRV-YYYYMMDD-NNNN，通知管理员审核
-->
<template>
  <a-drawer
    :visible="visible"
    :width="560"
    title="新建需求（需求提出）"
    :ok-loading="submitting"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      提交后将生成需求记录（DRV-YYYYMMDD-NNNN），状态为「需求提出」，并通知管理员审核。审核通过后可继续发起特征注册（B1）。
    </a-alert>

    <a-form :model="form" layout="vertical" :disabled="submitting" ref="formRef">
      <a-form-item
        label="需求名称"
        required
        :validate-status="errors.requirementName ? 'error' : ''"
        :help="errors.requirementName || '≤30 字，简要概括需求意图'"
      >
        <a-input
          v-model="form.requirementName"
          placeholder="例如：贷中行为-近30日大额交易次数"
          :max-length="30"
          show-word-limit
          @blur="validateNameOnBlur"
        />
      </a-form-item>

      <a-form-item
        label="业务场景"
        required
        :validate-status="errors.businessScenario ? 'error' : ''"
        :help="errors.businessScenario || '描述业务用途、使用场景'"
      >
        <a-textarea
          v-model="form.businessScenario"
          :rows="3"
          :max-length="300"
          show-word-limit
          placeholder="例如：贷中风险监控，用于识别近30日大额交易频次异常的借款人"
        />
      </a-form-item>

      <a-form-item label="预期效果（选填）" help="描述预期效果/提升度预期">
        <a-textarea
          v-model="form.expectedEffect"
          :rows="2"
          :max-length="300"
          show-word-limit
          placeholder="例如：预期 IV≥0.05，高风险识别 recall 提升约 10%"
        />
      </a-form-item>

      <a-form-item label="加工逻辑（选填）" help="描述大致加工思路，可在后续特征注册时补充">
        <a-textarea
          v-model="form.processingLogic"
          :rows="3"
          :max-length="500"
          show-word-limit
          placeholder="例如：从 dwd_trade_detail 过滤 amount≥5000 的成功记录，按 user_id 维度统计 30 天滚动窗口"
        />
      </a-form-item>

      <a-row :gutter="12">
        <a-col :span="12">
          <a-form-item label="默认值（选填）" help="如 0 / false">
            <a-input v-model="form.defaultValue" placeholder="例如：0" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item
        label="特征粒度"
        required
        :validate-status="errors.featureGranularity ? 'error' : ''"
        :help="errors.featureGranularity || '区分特征入参维度：仅身份证号 或 身份证号+产品号'"
      >
        <a-radio-group v-model="form.featureGranularity">
          <a-radio value="identity_only">身份证号</a-radio>
          <a-radio value="identity_plus_product">身份证号 + 产品号</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-divider style="margin: 12px 0">批量上传 / Excel 附件</a-divider>

      <a-space direction="vertical" style="width: 100%">
        <!-- 批量上传：从 Excel 创建多条需求 -->
        <div>
          <a-button type="outline" @click="openBatchImport">
            <template #icon><icon-upload /></template>
            批量上传
          </a-button>
        </div>

        <!-- Excel 评估报告附件（选填） -->
        <div>
          <a-upload
            :custom-request="customUpload"
            :before-upload="beforeUpload"
            :show-file-list="false"
            accept=".xlsx,.xls"
          >
            <a-button>
              <template #icon><icon-upload /></template>
              上传 Excel 评估报告（选填）
            </a-button>
            <span class="upload-hint" style="margin-left: 8px; color: var(--color-text-3); font-size: 12px">
              支持 .xlsx / .xls，≤10MB
            </span>
          </a-upload>
          <div v-if="form.excelAttachment" style="margin-top: 4px; color: var(--color-text-2); font-size: 12px">
            <icon-file /> {{ form.excelAttachment.name }}
            （{{ formatSize(form.excelAttachment.size) }}，{{ form.excelAttachment.uploadedAt }}）
            <a-link style="margin-left: 8px" @click="form.excelAttachment = undefined">移除</a-link>
          </div>
        </div>
      </a-space>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">提交需求</a-button>
      </a-space>
    </template>

    <!-- 批量创建需求弹窗 -->
    <a-modal
      v-model:visible="batchImportVisible"
      title="批量创建需求"
      :width="760"
      :ok-text="batchParsedRows.length ? '确认批量创建' : '解析并预览'"
      :ok-loading="batchSubmitting"
      :mask-closable="false"
      @ok="handleBatchModalOk"
      @cancel="cancelBatchImport"
    >
      <a-alert type="info" :show-icon="false" style="margin-bottom: 12px">
        <div style="font-size: 13px; line-height: 1.6;">
          Excel 每行一条需求，列名要求：<br>
          <b>需求名称</b>（必填）、<b>业务场景</b>（必填）、预期效果、加工逻辑、默认值、特征粒度（身份证号 / 身份证号+产品号）
        </div>
      </a-alert>
      <a-upload
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :show-file-list="true"
        @change="handleBatchFileChange"
      >
        <a-button>选择 Excel 文件</a-button>
      </a-upload>
      <div v-if="batchFileName" style="margin-top: 12px; color: var(--color-text-2); font-size: 13px">
        已选择：{{ batchFileName }}
      </div>

      <!-- 预览表格 -->
      <a-table
        v-if="batchParsedRows.length"
        :data="batchParsedRows"
        :columns="batchPreviewColumns"
        :pagination="{ pageSize: 5 }"
        size="small"
        style="margin-top: 16px"
      />
      <a-empty
        v-else
        description="请选择 Excel 文件后点击「解析并预览」"
        style="margin-top: 16px"
      />
    </a-modal>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import * as XLSX from 'xlsx'
import type { RequirementProposalPayload } from '@/modules/variable-hub/mock/variable-management/variable-draft-store'

interface Props {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', payload: RequirementProposalPayload): void
  (e: 'batch-submit', payloads: RequirementProposalPayload[]): void
}>()

const submitting = ref(false)
const formRef = ref<any>(null)

// ============ 表单初始值 ============
function createEmptyForm(): RequirementProposalPayload {
  return {
    requirementName: '',
    businessScenario: '',
    expectedEffect: '',
    processingLogic: '',
    defaultValue: '',
    featureGranularity: 'identity_only',
    excelAttachment: undefined,
    batchImportedRecords: undefined,
    creator: '小李'
  }
}

const form = reactive<RequirementProposalPayload>(createEmptyForm())

// ============ 校验错误信息 ============
const errors = reactive<{
  requirementName?: string
  businessScenario?: string
  featureGranularity?: string
}>({})

function validateNameOnBlur() {
  if (!form.requirementName || !form.requirementName.trim()) {
    errors.requirementName = '需求名称必填'
  } else if (form.requirementName.length > 30) {
    errors.requirementName = '需求名称不超过 30 字'
  } else {
    errors.requirementName = undefined
  }
}

function validateAll(): boolean {
  // 需求名称
  if (!form.requirementName || !form.requirementName.trim()) {
    errors.requirementName = '需求名称必填'
    Message.error('请填写需求名称')
    return false
  }
  if (form.requirementName.length > 30) {
    errors.requirementName = '需求名称不超过 30 字'
    Message.error('需求名称不超过 30 字')
    return false
  }
  errors.requirementName = undefined

  // 业务场景
  if (!form.businessScenario || !form.businessScenario.trim()) {
    errors.businessScenario = '业务场景必填'
    Message.error('请填写业务场景')
    return false
  }
  errors.businessScenario = undefined

  // 特征粒度
  if (!form.featureGranularity) {
    errors.featureGranularity = '请选择特征粒度'
    Message.error('请选择特征粒度')
    return false
  }
  errors.featureGranularity = undefined

  return true
}

// ============ 上传 Excel 评估报告 ============
const MAX_EXCEL_SIZE = 10 * 1024 * 1024

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function beforeUpload(file: any) {
  if (file.size > MAX_EXCEL_SIZE) {
    Message.error('Excel 文件超过 10MB 上限')
    return false
  }
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    Message.error('仅支持 .xlsx / .xls / .csv 格式')
    return false
  }
  return true
}

function customUpload(option: any) {
  const file = option.fileItem?.file
  if (!file) return
  form.excelAttachment = {
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  option.onSuccess?.(file)
}

// ============ 批量创建需求 ============
const batchImportVisible = ref(false)
const batchFileName = ref('')
const batchParsedRows = ref<RequirementProposalPayload[]>([])
const batchSubmitting = ref(false)
let batchRawFile: File | null = null

const batchPreviewColumns = [
  { title: '需求名称', dataIndex: 'requirementName', width: 180, ellipsis: true, tooltip: true },
  { title: '业务场景', dataIndex: 'businessScenario', width: 160, ellipsis: true, tooltip: true },
  { title: '预期效果', dataIndex: 'expectedEffect', width: 140, ellipsis: true, tooltip: true },
  { title: '加工逻辑', dataIndex: 'processingLogic', width: 160, ellipsis: true, tooltip: true },
  { title: '默认值', dataIndex: 'defaultValue', width: 80 },
  {
    title: '特征粒度',
    dataIndex: 'featureGranularity',
    width: 130,
    render: ({ record }: any) =>
      record.featureGranularity === 'identity_plus_product' ? '身份证号 + 产品号' : '身份证号'
  }
]

/** 将 Excel 中的中文特征粒度映射为 enum 值 */
function mapGranularity(raw: string): 'identity_only' | 'identity_plus_product' {
  const v = (raw || '').trim()
  if (v === 'identity_plus_product' || v.includes('产品号')) return 'identity_plus_product'
  return 'identity_only'
}

function openBatchImport() {
  batchFileName.value = ''
  batchParsedRows.value = []
  batchRawFile = null
  batchImportVisible.value = true
}

function handleBatchFileChange(info: any) {
  const file = info.file?.file
  if (!file) return
  batchRawFile = file
  batchFileName.value = file.name
  // 选择新文件时清空旧解析结果
  batchParsedRows.value = []
}

/** 解析 Excel 文件并填充 batchParsedRows */
function parseBatchFile() {
  if (!batchRawFile) {
    Message.warning('请先选择 Excel 文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        Message.error('Excel 文件无有效工作表')
        batchParsedRows.value = []
        return
      }
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' })
      const rows: RequirementProposalPayload[] = json.map((r) => ({
        requirementName: String(r['需求名称'] ?? r['requirementName'] ?? '').trim(),
        businessScenario: String(r['业务场景'] ?? r['businessScenario'] ?? '').trim(),
        expectedEffect: String(r['预期效果'] ?? r['expectedEffect'] ?? '').trim(),
        processingLogic: String(r['加工逻辑'] ?? r['processingLogic'] ?? '').trim(),
        defaultValue: String(r['默认值'] ?? r['defaultValue'] ?? '').trim(),
        featureGranularity: mapGranularity(String(r['特征粒度'] ?? r['featureGranularity'] ?? ''))
      }))
      // 校验必填字段
      const invalid = rows.findIndex((r) => !r.requirementName || !r.businessScenario)
      if (invalid >= 0) {
        Message.error(`第 ${invalid + 1} 行：需求名称和业务场景为必填`)
        batchParsedRows.value = []
        return
      }
      if (rows.length === 0) {
        Message.warning('未解析到有效数据行')
        return
      }
      batchParsedRows.value = rows
      Message.success(`成功解析 ${rows.length} 条需求`)
    } catch (err) {
      Message.error('Excel 解析失败：' + (err as Error).message)
      batchParsedRows.value = []
    }
  }
  reader.onerror = () => {
    Message.error('文件读取失败')
  }
  reader.readAsArrayBuffer(batchRawFile)
}

/** 弹窗 OK：未解析时先解析，已解析则批量提交 */
function handleBatchModalOk() {
  if (batchParsedRows.value.length === 0) {
    parseBatchFile()
    return
  }
  batchSubmitting.value = true
  try {
    emit('batch-submit', batchParsedRows.value)
    batchImportVisible.value = false
  } finally {
    batchSubmitting.value = false
  }
}

function cancelBatchImport() {
  batchFileName.value = ''
  batchParsedRows.value = []
  batchRawFile = null
  batchImportVisible.value = false
}

// ============ 提交 / 取消 ============
function handleCancel() {
  emit('update:visible', false)
}

function reset() {
  Object.assign(form, createEmptyForm())
  errors.requirementName = undefined
  errors.businessScenario = undefined
  errors.featureGranularity = undefined
  batchParsedRows.value = []
  batchFileName.value = ''
  batchRawFile = null
}

function handleSubmit() {
  if (!validateAll()) return
  submitting.value = true
  try {
    emit('submit', { ...form })
  } finally {
    submitting.value = false
  }
}

// 打开时重置
watch(
  () => props.visible,
  (v) => {
    if (v) {
      Object.assign(form, createEmptyForm())
      errors.requirementName = undefined
      errors.businessScenario = undefined
      errors.featureGranularity = undefined
      batchParsedRows.value = []
      batchFileName.value = ''
      batchRawFile = null
    }
  }
)
</script>
