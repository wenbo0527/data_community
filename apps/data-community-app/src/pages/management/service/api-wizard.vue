<template>
  <div class="api-wizard-page">
    <a-page-header title="API 上架向导" sub-title="5 步完成 API 服务发布:基本信息 → 数据源 → 参数 → 限流 → 审核">
      <template #extra>
        <a-button @click="goBack">取消</a-button>
      </template>
    </a-page-header>

    <a-card>
      <a-steps :current="currentStep - 1" class="wizard-steps">
        <a-step title="基本信息" />
        <a-step title="数据源" />
        <a-step title="参数配置" />
        <a-step title="限流策略" />
        <a-step title="提交审核" />
      </a-steps>

      <a-divider />

      <!-- Step 1: 基本信息 -->
      <div v-show="currentStep === 1" class="step-content">
        <h3>API 基本信息</h3>
        <a-form :model="form.basic" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="API 名称" required>
                <a-input v-model="form.basic.name" placeholder="例如:用户画像查询" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="API 编码" required>
                <a-input v-model="form.basic.code" placeholder="例如:user-profile-query" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="请求方式" required>
                <a-radio-group v-model="form.basic.method">
                  <a-radio value="GET">GET</a-radio>
                  <a-radio value="POST">POST</a-radio>
                  <a-radio value="PUT">PUT</a-radio>
                  <a-radio value="DELETE">DELETE</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="所属分类" required>
                <a-select v-model="form.basic.category">
                  <a-option value="user">用户域</a-option>
                  <a-option value="trade">交易域</a-option>
                  <a-option value="risk">风控域</a-option>
                  <a-option value="marketing">营销域</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="API 描述" required>
                <a-textarea v-model="form.basic.description" :auto-size="{ minRows: 3 }" placeholder="请描述 API 的用途、典型场景..." />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Owner" required>
                <a-input v-model="form.basic.owner" placeholder="负责人邮箱或姓名" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="SLA 等级">
                <a-select v-model="form.basic.sla">
                  <a-option value="high">高 (99.9% 可用性)</a-option>
                  <a-option value="medium">中 (99.5% 可用性)</a-option>
                  <a-option value="low">低 (99.0% 可用性)</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <!-- Step 2: 数据源 -->
      <div v-show="currentStep === 2" class="step-content">
        <h3>数据源选择</h3>
        <a-form :model="form.source" layout="vertical">
          <a-form-item label="源表" required>
            <a-select v-model="form.source.table" placeholder="选择数据源表">
              <a-option value="dim_user">dim_user · 用户维表</a-option>
              <a-option value="dws_risk_score">dws_risk_score · 风险评分表</a-option>
              <a-option value="fact_loan_apply">fact_loan_apply · 贷款申请表</a-option>
              <a-option value="asset_customer_balance">asset_customer_balance · 客户余额表</a-option>
            </a-select>
          </a-form-item>

          <a-form-item label="返回字段" required>
            <a-checkbox-group v-model="form.source.fields">
              <a-checkbox value="user_id">user_id</a-checkbox>
              <a-checkbox value="name">name</a-checkbox>
              <a-checkbox value="mobile">mobile</a-checkbox>
              <a-checkbox value="credit_score">credit_score</a-checkbox>
              <a-checkbox value="risk_level">risk_level</a-checkbox>
              <a-checkbox value="total_assets">total_assets</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <a-form-item label="脱敏规则">
            <a-radio-group v-model="form.source.mask">
              <a-radio value="none">不脱敏</a-radio>
              <a-radio value="partial">部分脱敏(手机号中间4位)</a-radio>
              <a-radio value="full">完全脱敏</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-alert type="info" :show-icon="true">
            <p>已选择: <strong>{{ form.source.fields.length }}</strong> 个字段</p>
            <p>脱敏规则: <strong>{{ maskLabel }}</strong></p>
          </a-alert>
        </a-form>
      </div>

      <!-- Step 3: 参数配置 -->
      <div v-show="currentStep === 3" class="step-content">
        <h3>入参 / 出参配置</h3>
        <a-button @click="addParam" size="small" style="margin-bottom: 12px">
          <template #icon><icon-plus /></template>添加入参
        </a-button>
        <a-table :columns="inputColumns" :data="form.params" :pagination="false" row-key="key" size="small">
          <template #required="{ record }">
            <a-switch v-model="record.required" />
          </template>
          <template #type="{ record }">
            <a-select v-model="record.type" size="small" style="width: 100px">
              <a-option value="string">string</a-option>
              <a-option value="number">number</a-option>
              <a-option value="boolean">boolean</a-option>
              <a-option value="array">array</a-option>
            </a-select>
          </template>
          <template #actions="{ record }">
            <a-link @click="removeParam(record)">删除</a-link>
          </template>
        </a-table>

        <h3 style="margin-top: 24px">返回示例</h3>
        <pre class="json-example">
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": "U100001",
    "name": "张明",
    "credit_score": 720,
    "risk_level": "low"
  }
}
        </pre>
      </div>

      <!-- Step 4: 限流策略 -->
      <div v-show="currentStep === 4" class="step-content">
        <h3>限流策略</h3>
        <a-form :model="form.rateLimit" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="QPS 上限">
                <a-input-number v-model="form.rateLimit.qps" :min="1" :max="100000" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="日调用上限">
                <a-input-number v-model="form.rateLimit.daily" :min="1" :max="100000000" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="单用户 QPS">
                <a-input-number v-model="form.rateLimit.userQps" :min="1" :max="1000" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="超时(毫秒)">
                <a-input-number v-model="form.rateLimit.timeout" :min="100" :max="60000" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="超限响应">
                <a-radio-group v-model="form.rateLimit.overLimitAction">
                  <a-radio value="block">直接拒绝</a-radio>
                  <a-radio value="queue">排队等待</a-radio>
                  <a-radio value="degrade">降级返回</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <!-- Step 5: 提交审核 -->
      <div v-show="currentStep === 5" class="step-content">
        <h3>提交审核</h3>
        <a-card :bordered="false" title="API 信息预览">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="API 名称">{{ form.basic.name }}</a-descriptions-item>
            <a-descriptions-item label="API 编码">{{ form.basic.code }}</a-descriptions-item>
            <a-descriptions-item label="请求方式">{{ form.basic.method }}</a-descriptions-item>
            <a-descriptions-item label="所属分类">{{ form.basic.category }}</a-descriptions-item>
            <a-descriptions-item label="数据源表">{{ form.source.table }}</a-descriptions-item>
            <a-descriptions-item label="字段数">{{ form.source.fields.length }}</a-descriptions-item>
            <a-descriptions-item label="入参数">{{ form.params.length }}</a-descriptions-item>
            <a-descriptions-item label="QPS 上限">{{ form.rateLimit.qps }}</a-descriptions-item>
            <a-descriptions-item label="SLA">{{ form.basic.sla }}</a-descriptions-item>
            <a-descriptions-item label="Owner">{{ form.basic.owner }}</a-descriptions-item>
            <a-descriptions-item label="描述" :span="2">{{ form.basic.description }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card :bordered="false" title="审核流程" style="margin-top: 16px">
          <a-timeline>
            <a-timeline-item><strong>① Owner 提交</strong> · 当前状态</a-timeline-item>
            <a-timeline-item><strong>② 数据团队审核</strong> · 1-2 个工作日</a-timeline-item>
            <a-timeline-item><strong>③ 安全团队审核</strong> · 1-2 个工作日</a-timeline-item>
            <a-timeline-item><strong>④ 平台上线</strong> · 审核通过后</a-timeline-item>
          </a-timeline>
        </a-card>
      </div>

      <a-divider />

      <div class="step-actions">
        <a-button v-if="currentStep > 1" @click="prevStep">上一步</a-button>
        <a-button v-if="currentStep < 5" type="primary" @click="nextStep">下一步</a-button>
        <a-button v-if="currentStep === 5" type="primary" @click="submitApi">
          <template #icon><icon-check /></template>提交审核
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const currentStep = ref(1)

const form = reactive({
  basic: {
    name: '',
    code: '',
    method: 'GET',
    category: 'user',
    description: '',
    owner: '',
    sla: 'medium'
  },
  source: {
    table: 'dim_user',
    fields: ['user_id', 'name'] as string[],
    mask: 'partial'
  },
  params: [] as any[],
  rateLimit: {
    qps: 1000,
    daily: 100000,
    userQps: 50,
    timeout: 3000,
    overLimitAction: 'block'
  }
})

onMounted(() => {
  form.params = [
    { key: 'user_id', name: '用户 ID', type: 'string', required: true, description: '要查询的用户 ID' }
  ]
})

const inputColumns = [
  { title: '参数名', dataIndex: 'key', width: 150 },
  { title: '名称', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 120 },
  { title: '必填', dataIndex: 'required', slotName: 'required', width: 80 },
  { title: '描述', dataIndex: 'description' },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 80 }
]

const maskLabel = computed(() => ({
  none: '不脱敏',
  partial: '部分脱敏',
  full: '完全脱敏'
})[form.source.mask])

function addParam() {
  form.params.push({ key: '', name: '', type: 'string', required: false, description: '' })
}

function removeParam(p: any) {
  form.params = form.params.filter(x => x !== p)
}

function nextStep() {
  if (currentStep.value === 1 && (!form.basic.name || !form.basic.code)) {
    Message.warning('请填写 API 名称和编码')
    return
  }
  if (currentStep.value === 2 && form.source.fields.length === 0) {
    Message.warning('请至少选择一个返回字段')
    return
  }
  currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function submitApi() {
  Message.success('API 已提交审核!审核通过后会邮件通知。')
  setTimeout(() => router.push('management/service'), 1500)
}

const goBack = () => router.push('management/service')
</script>

<style lang="scss" scoped>
.api-wizard-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .wizard-steps {
    margin: 0 80px;
  }
  .step-content {
    min-height: 400px;
    padding: 0 24px;
  }
  .step-actions {
    text-align: right;
    :deep(.arco-btn) { margin-left: 8px; }
  }
  .json-example {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 16px;
    border-radius: 4px;
    font-family: 'Menlo', monospace;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>