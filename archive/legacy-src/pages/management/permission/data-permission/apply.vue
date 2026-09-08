<template>
  <div class="data-permission-apply">
    <a-page-header
      :title="contextTitle || '数据权限申请'"
      sub-title="申请访问受限字段 · 待 Owner 审批通过后方可使用"
    />

    <a-alert
      v-if="contextResourceName"
      type="info"
      :show-icon="true"
      style="margin-bottom: 16px"
    >
      正在为资源「{{ contextResourceName }}」申请字段权限({{ contextResourceType }})
    </a-alert>

    <!-- 3 步骤指示器 -->
    <a-steps :current="currentStep" class="apply-steps" style="margin-bottom: 24px">
      <a-step title="选择资源" description="选择要访问的数据字段" />
      <a-step title="填写原因" description="说明使用场景" />
      <a-step title="等待审批" description="Owner 审批" />
    </a-steps>

    <!-- Step 1: 选择资源 -->
    <a-card v-if="currentStep === 1" :bordered="false" title="选择受限字段" style="margin-bottom: 16px">
      <a-table
        :data="mockFields"
        :pagination="false"
        :bordered="false"
        :row-selection="{ type: 'checkbox', showCheckedAll: true }"
      >
        <template #columns>
          <a-table-column title="表名" data-index="table">
            <template #cell="{ record }">
              <code>{{ record.table }}</code>
            </template>
          </a-table-column>
          <a-table-column title="字段" data-index="field">
            <template #cell="{ record }">
              <code>{{ record.field }}</code>
            </template>
          </a-table-column>
          <a-table-column title="敏感级别" data-index="sensitivity" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getColor(record.sensitivity)" size="small">{{ record.sensitivity }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="业务用途" data-index="purpose" />
        </template>
      </a-table>

      <a-space style="margin-top: 16px">
        <a-button type="primary" @click="nextStep">下一步</a-button>
        <a-button @click="onBack">取消</a-button>
      </a-space>
    </a-card>

    <!-- Step 2: 填写原因 -->
    <a-card v-if="currentStep === 2" :bordered="false" title="填写申请原因" style="margin-bottom: 16px">
      <a-form layout="vertical" :model="form">
        <a-form-item label="使用场景" required>
          <a-select v-model="form.usage" placeholder="请选择">
            <a-option value="data_analysis">数据分析</a-option>
            <a-option value="risk_modeling">风控建模</a-option>
            <a-option value="marketing">营销活动</a-option>
            <a-option value="report">报表统计</a-option>
            <a-option value="other">其他</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="有效期" required>
          <a-radio-group v-model="form.validity">
            <a-radio value="3">3 个月</a-radio>
            <a-radio value="6">6 个月</a-radio>
            <a-radio value="12">12 个月</a-radio>
            <a-radio value="permanent">永久</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="详细原因" required>
          <a-textarea
            v-model="form.reason"
            placeholder="请详细说明使用场景、数据范围、风险评估..."
            :auto-size="{ minRows: 4, maxRows: 8 }"
          />
        </a-form-item>
      </a-form>

      <a-space style="margin-top: 16px">
        <a-button @click="currentStep = 1">上一步</a-button>
        <a-button type="primary" @click="submitApply">提交申请</a-button>
      </a-space>
    </a-card>

    <!-- Step 3: 等待审批 -->
    <a-card v-if="currentStep === 3" :bordered="false" style="margin-bottom: 16px">
      <a-result status="info" title="申请已提交" sub-title="Owner 审批通过后即可使用对应字段">
        <template #extra>
          <a-space>
            <a-button type="primary" @click="onBack">返回列表</a-button>
            <a-button @click="reset">再次申请</a-button>
          </a-space>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script setup>
/**
 * 数据权限申请页面
 *
 * 文档 §5.1.1: 申请者申请访问受限字段
 * 文档 §5.4: 3 步骤:选择资源 → 填写原因 → 等待审批
 */
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const currentStep = ref(1)
const contextTitle = computed(() => route.query.title || '')
const contextResourceName = computed(() => route.query.resourceName || '')
const contextResourceType = computed(() => route.query.resourceType || '')

const form = ref({
  usage: 'data_analysis',
  validity: '6',
  reason: ''
})

const mockFields = [
  { table: 'dim_user', field: 'id_card_no', sensitivity: 'L3', purpose: '客户实名验证' },
  { table: 'dim_user', field: 'mobile', sensitivity: 'L3', purpose: '客户联系' },
  { table: 'fact_loan_apply', field: 'apply_amt', sensitivity: 'L3', purpose: '贷款申请金额' },
  { table: 'dws_user_value', field: 'balance', sensitivity: 'L2', purpose: '用户价值分析' }
]

function getColor(level) {
  return { L1: 'green', L2: 'orange', L3: 'red' }[level] || 'gray'
}

function nextStep() {
  currentStep.value++
}

function submitApply() {
  if (!form.value.reason.trim()) {
    Message.warning('请填写详细原因')
    return
  }
  currentStep.value++
  Message.success('申请已提交,等待 Owner 审批')
}

function onBack() {
  router.push('/management/permission/data-permission')
}

function reset() {
  currentStep.value = 1
  form.value = { usage: 'data_analysis', validity: '6', reason: '' }
}

onMounted(() => {
  // 从 query 参数预填上下文
})
</script>

<style scoped>
.data-permission-apply { padding: 16px; }
.apply-steps { padding: 16px 24px; background: #fff; border-radius: 4px; }
code {
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  color: #165dff;
}
</style>