<template>
  <a-modal
    :visible="visible"
    :title="title || '特征注册 · 补充数据底表与协作信息'"
    :width="960"
    :ok-loading="submitting"
    :mask-closable="false"
    @ok="onOk"
    @cancel="onCancel"
  >
    <a-alert type="info" :show-icon="false" style="margin-bottom: 12px">
      <template #title>说明</template>
      提交后将生成特征 ID <b>{{ previewFeatureId }}</b>（格式 MIDLOAN-FEAT-NNNN），状态变为「已注册」。
      A1 已填字段在下方以只读形式展示，开发人员可后续在特征详情页补充数据底表名称。
    </a-alert>

    <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
      <!-- 区块 1：A1 已填字段（只读预览）-->
      <div class="form-section">
        <div class="section-title">
          <icon-lock />
          A1 已填字段（只读预览）
          <a-tag size="small" color="gray">衍生需求阶段</a-tag>
        </div>
        <a-descriptions :column="3" :data="readonlyDesc" size="small" bordered />
      </div>

      <!-- 区块 2：协作信息（B1 必填项）-->
      <div class="form-section">
        <div class="section-title">
          <icon-user />
          协作信息
          <a-tag size="small" color="arcoblue">注册阶段填写</a-tag>
        </div>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="产品范围" field="productScope">
              <a-select v-model="form.productScope" placeholder="选择产品" allow-clear>
                <a-option value="现金贷">现金贷</a-option>
                <a-option value="消费分期">消费分期</a-option>
                <a-option value="小微贷">小微贷</a-option>
                <a-option value="全部">全部</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="名单类型" field="listType">
              <a-select v-model="form.listType" placeholder="选择名单类型">
                <a-option v-for="opt in LIST_TYPES" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="批次" field="batch">
              <a-input v-model="form.batch" placeholder="如：2026Q3" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="验收人" field="acceptor">
              <a-select v-model="form.acceptor" placeholder="选择验收人" allow-clear>
                <a-option value="小李">小李</a-option>
                <a-option value="王数仓">王数仓</a-option>
                <a-option value="李验收">李验收</a-option>
                <a-option value="张风控">张风控</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="备注" field="remark">
              <a-textarea v-model="form.remark" :rows="2" placeholder="可选" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 区块 3：数据底表与数仓任务（可暂空）-->
      <div class="form-section">
        <div class="section-title">
          <icon-storage />
          数据底表与数仓任务（可暂空，开发人员后续补充）
        </div>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据底表名称" field="dataTableName">
              <a-input v-model="form.dataTableName" placeholder="如：ads_midloan_xxx（开发人员后续可补充）" />
              <template #extra>开发人员后续可在特征详情页「补充」按钮填写</template>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数仓任务ID" field="dwTaskId">
              <a-input v-model="form.dwTaskId" placeholder="如：DW-TASK-xxx（数仓回调时写入）" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { LIST_TYPES } from '@/modules/variable-hub/constants/riskCategoryMap'

const props = defineProps({
  visible: Boolean,
  derivation: Object,
  title: String
})
const emit = defineEmits(['ok', 'cancel'])

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  productScope: '',
  listType: 'none',
  batch: '',
  acceptor: '',
  remark: '',
  dataTableName: '',
  dwTaskId: ''
})

const rules = {
  productScope: [{ required: true, message: '请选择产品范围' }],
  listType: [{ required: true, message: '请选择名单类型' }],
  batch: [{ required: true, message: '请填写批次' }],
  acceptor: [{ required: true, message: '请选择验收人' }]
}

const readonlyDesc = computed(() => {
  const d = props.derivation || {}
  return [
    { label: '需求ID', value: d.id || '—' },
    { label: '需求名称', value: d.name || '—' },
    { label: '业务场景', value: d.businessScene || '—' },
    { label: '特征英文名', value: d.featureEnName || '—' },
    { label: '中文名', value: d.featureCnName || '—' },
    { label: '字段类型', value: d.fieldType || '—' },
    { label: '一级分类', value: d.l1Category || '—' },
    { label: '二级分类', value: d.l2Category || '—' },
    { label: '数据时效', value: d.dataFreshness || '—' },
    { label: '标准化后来源表', value: d.sourceTableAfter || '—' },
    { label: '标准化前来源表', value: d.sourceTableBefore || '—' },
    { label: '原特征英文名', value: d.originFeatureEnName || '—' },
    { label: '加工逻辑', value: d.processingLogic || '—' },
    { label: '默认值', value: d.defaultValue || '—' },
    { label: '开发人员', value: d.developer || '—' }
  ]
})

const previewFeatureId = computed(() => {
  // 生成预览 ID（实际 ID 在 DerivationStore.register() 内生成）
  const d = props.derivation
  if (!d) return 'MIDLOAN-FEAT-NNNN'
  // 简化展示：复用 store 中的下一个序号逻辑无法拿到，先展示模板
  return 'MIDLOAN-FEAT-NNNN（提交后生成）'
})

function onOk() {
  if (!formRef.value) return
  formRef.value.validate((errors) => {
    if (errors) {
      Message.warning('请补全协作信息必填项')
      return
    }
    submitting.value = true
    emit('ok', { ...form })
  })
}

function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
.form-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--color-border-2, #e5e6eb);
}
.form-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-1, #1d2129);
}
</style>