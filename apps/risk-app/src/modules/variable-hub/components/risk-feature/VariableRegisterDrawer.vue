<!--
  变量新增（B1 特征注册表单 · 文档 §三 模块 B）
  - 4 区块：特征核心属性 / 特征分类信息 / 来源与时效 / 协作信息
  - 支持 Excel 评估报告附件上传（B1 R14）
  - 提交后状态=已注册，生成 MIDLOAN-FEAT-DRAFT-NNNN，详情页可继续走 9 状态机
-->
<template>
  <a-drawer
    :visible="visible"
    :width="640"
    title="新增变量（特征注册）"
    :ok-loading="submitting"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      提交后将生成特征资产并跳转到详情页，状态为「已注册」，可在详情页继续发起「提开发OA单」等流程。
    </a-alert>

    <a-steps :current="currentStep" size="small" style="margin-bottom: 20px">
      <a-step title="核心属性" />
      <a-step title="分类信息" />
      <a-step title="来源与时效" />
      <a-step title="协作信息" />
    </a-steps>

    <a-form :model="form" layout="vertical" :disabled="submitting" ref="formRef">
      <!-- ============ 区块 1：特征核心属性 ============ -->
      <a-card title="特征核心属性" :bordered="false" size="small" class="reg-block">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item
              label="特征英文名"
              required
              :validate-status="errors.name ? 'error' : ''"
              :help="errors.name || '≤30 字，仅英文大小写+下划线，不允许特殊字符/空格'"
            >
              <a-input
                v-model="form.name"
                placeholder="例如：MIDLOAN_BIGTXN_CNT_30D"
                :max-length="30"
                show-word-limit
                @blur="validateNameOnBlur"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="特征中文名"
              required
              :validate-status="errors.featureCnName ? 'error' : ''"
              :help="errors.featureCnName || '不可重复'"
            >
              <a-input
                v-model="form.featureCnName"
                placeholder="例如：近30日大额交易次数"
                @blur="validateCnNameOnBlur"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="字段类型" required>
              <a-select v-model="form.fieldType" :options="FIELD_TYPE_OPTIONS" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="默认值（非必填）">
              <a-input
                v-model="form.defaultValue"
                :placeholder="form.fieldType === 'Boolean' ? '例如：false' : (form.fieldType === 'String' ? '例如：未知' : '例如：0')"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="加工逻辑" required>
          <a-textarea
            v-model="form.processingLogic"
            :rows="3"
            placeholder="描述特征的衍生/计算规则，例如：从 dwd_trade_detail 过滤 amount >= 5000 的成功记录，按 user_id 维度统计 30 天滚动窗口"
          />
        </a-form-item>

        <a-form-item label="特征分类">
          <a-radio-group v-model="form.category">
            <a-radio value="midloan_behavior">贷中行为（一期固定）</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-card>

      <!-- ============ 区块 2：特征分类信息 ============ -->
      <a-card title="特征分类信息" :bordered="false" size="small" class="reg-block">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="一级分类" required>
              <a-select
                v-model="form.l1Category"
                :options="L1_CATEGORY_OPTIONS"
                placeholder="请选择一级分类"
                @change="onL1Change"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="二级分类（与一级联动）" required>
              <a-select
                v-model="form.l2Category"
                :options="l2Options"
                placeholder="请选择二级分类"
                :disabled="!form.l1Category"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>

      <!-- ============ 区块 3：来源与时效 ============ -->
      <a-card title="来源与时效" :bordered="false" size="small" class="reg-block">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="数据时效">
              <a-select
                v-model="form.dataFreshness"
                :options="DATA_FRESHNESS_OPTIONS"
                placeholder="请选择"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据源类型">
              <a-select
                v-model="form.sourceType"
                :options="SOURCE_TYPE_OPTIONS"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="标准化后来源表（非必填）">
              <a-input v-model="form.sourceTableAfter" placeholder="例如：ads_midloan_bigtxn_30d" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="标准化前来源表（非必填）">
              <a-input v-model="form.sourceTableBefore" placeholder="例如：dwd_trade_detail" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="原特征英文名（非必填）">
              <a-input v-model="form.sourceField" placeholder="对应原始字段名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据底表名称（非必填，可暂空）">
              <a-input v-model="form.dataTableName" placeholder="由开发人员后续在详情页补充" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="数仓任务ID（非必填）">
          <a-input v-model="form.dwTaskId" placeholder="例如：DW-TASK-XXXXXX（数仓回调写入或研发手动补充）" />
        </a-form-item>
      </a-card>

      <!-- ============ 区块 4：协作信息 ============ -->
      <a-card title="协作信息" :bordered="false" size="small" class="reg-block">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="创建人（自动带入）">
              <a-input :model-value="form.creator" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开发人员（必填，从数仓团队）" required>
              <a-select
                v-model="form.developer"
                :options="developerOptions"
                placeholder="请选择开发人员"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="验收人（默认带入创建人）">
              <a-input v-model="form.acceptor" placeholder="可手动调整" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="产品范围">
              <a-input v-model="form.productScope" placeholder="例如：风控反欺诈" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="名单类型">
              <a-select
                v-model="form.listType"
                :options="LIST_TYPE_OPTIONS"
                placeholder="可选"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="批次">
              <a-input v-model="form.batch" placeholder="例如：MIDLOAN-2026Q3" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="备注">
          <a-textarea
            v-model="form.remark"
            :rows="2"
            :max-length="200"
            show-word-limit
            placeholder="协作说明、风险点、依赖等"
          />
        </a-form-item>

        <a-divider style="margin: 12px 0">Excel 评估报告附件（非必填）</a-divider>

        <a-upload
          :custom-request="customUpload"
          :before-upload="beforeUpload"
          :show-file-list="false"
          accept=".xlsx,.xls,.csv"
        >
          <a-button>
            <icon-upload /> 选择 Excel 文件
          </a-button>
          <span class="upload-hint" style="margin-left: 8px; color: var(--color-text-3); font-size: 12px">
            支持 .xlsx / .xls / .csv，单文件不超过 10MB
          </span>
        </a-upload>
        <div v-if="form.excelAttachment" style="margin-top: 8px; color: var(--color-text-2); font-size: 12px">
          <icon-file /> {{ form.excelAttachment.name }}
          （{{ formatSize(form.excelAttachment.size) }}，{{ form.excelAttachment.uploadedAt }}）
          <a-link style="margin-left: 8px" @click="form.excelAttachment = undefined">移除</a-link>
        </div>
      </a-card>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="handleSaveDraft">保存草稿</a-button>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">提交并跳转详情</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  FIELD_TYPE_OPTIONS,
  DATA_FRESHNESS_OPTIONS,
  L1_CATEGORY_OPTIONS,
  L1_L2_CATEGORY_MAP,
  SOURCE_TYPE_OPTIONS,
  validateFeatureName,
  validateFeatureCnName,
  type RegisterFormPayload
} from '@/modules/variable-hub/mock/variable-management/variable-draft-store'

interface Props {
  visible: boolean
  /** 已存在的英文名列表（用于去重校验）*/
  existingNames?: string[]
  /** 已存在的中文名列表（用于去重校验）*/
  existingCnNames?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  existingNames: () => [],
  existingCnNames: () => []
})

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', payload: RegisterFormPayload): void
  (e: 'save-draft', payload: RegisterFormPayload): void
}>()

const submitting = ref(false)
const formRef = ref<any>(null)

// ============ 表单初始值 ============
function createEmptyForm(): RegisterFormPayload {
  return {
    name: '',
    featureCnName: '',
    fieldType: 'Integer',
    processingLogic: '',
    defaultValue: '',
    category: 'midloan_behavior',
    l1Category: '',
    l2Category: '',
    dataFreshness: undefined,
    sourceTableAfter: '',
    sourceTableBefore: '',
    sourceField: '',
    dataTableName: '',
    dwTaskId: '',
    productScope: '',
    listType: undefined,
    batch: '',
    acceptor: '小李',
    remark: '',
    developer: '',
    creator: '小李',
    sourceType: 'internal',
    excelAttachment: undefined
  }
}

const form = reactive<RegisterFormPayload>(createEmptyForm())

// ============ 校验错误信息 ============
const errors = reactive<{ name?: string; featureCnName?: string }>({})

// ============ 联动：二级分类（按一级分类）============
const l2Options = computed(() => {
  if (!form.l1Category) return []
  return (L1_L2_CATEGORY_MAP[form.l1Category] || []).map((v) => ({ value: v, label: v }))
})

function onL1Change() {
  form.l2Category = ''
}

// ============ 步骤高亮（按当前已填字段）============
const currentStep = computed(() => {
  if (!form.l1Category || !form.l2Category) return 1
  if (!form.dataFreshness && !form.sourceTableAfter && !form.sourceTableBefore) return 2
  if (!form.developer) return 3
  return 4
})

// ============ 开发人员选项（数仓团队）============
const developerOptions = [
  { value: '王数仓', label: '王数仓' },
  { value: '数仓_A', label: '数仓_A' },
  { value: '数仓_B', label: '数仓_B' },
  { value: '数仓_C', label: '数仓_C' }
]

// ============ 名单类型 ============
const LIST_TYPE_OPTIONS = [
  { value: '白名单', label: '白名单' },
  { value: '黑名单', label: '黑名单' },
  { value: '灰名单', label: '灰名单' },
  { value: '其他', label: '其他' }
]

// ============ 校验函数 ============
function validateNameOnBlur() {
  const err = validateFeatureName(form.name || '', props.existingNames)
  errors.name = err || undefined
}

function validateCnNameOnBlur() {
  const err = validateFeatureCnName(form.featureCnName || '', props.existingCnNames)
  errors.featureCnName = err || undefined
}

function validateAll(): boolean {
  const nameErr = validateFeatureName(form.name || '', props.existingNames)
  const cnErr = validateFeatureCnName(form.featureCnName || '', props.existingCnNames)
  errors.name = nameErr || undefined
  errors.featureCnName = cnErr || undefined
  if (nameErr) {
    Message.error(nameErr)
    return false
  }
  if (cnErr) {
    Message.error(cnErr)
    return false
  }
  if (!form.fieldType) { Message.error('请选择字段类型'); return false }
  if (!form.processingLogic || !form.processingLogic.trim()) { Message.error('请填写加工逻辑'); return false }
  if (!form.l1Category) { Message.error('请选择一级分类'); return false }
  if (!form.l2Category) { Message.error('请选择二级分类'); return false }
  if (!form.developer) { Message.error('请选择开发人员'); return false }
  return true
}

// ============ 上传 Excel ============
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

// ============ 提交 / 取消 ============
function handleCancel() {
  emit('update:visible', false)
}

function reset() {
  Object.assign(form, createEmptyForm())
  errors.name = undefined
  errors.featureCnName = undefined
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

function handleSaveDraft() {
  // 保存草稿：允许必填项留空，仅记录已填字段
  submitting.value = true
  try {
    emit('save-draft', { ...form })
    Message.success('草稿已保存')
  } finally {
    submitting.value = false
  }
}

// 打开时重置
watch(() => props.visible, (v) => {
  if (v) reset()
})
</script>

<style scoped lang="less">
.reg-block {
  margin-bottom: 12px;
}
</style>