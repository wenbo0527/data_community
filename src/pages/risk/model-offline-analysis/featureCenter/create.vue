<template>
  <div class="feature-create-page">
    <a-breadcrumb style="margin-bottom: 12px">
      <a-breadcrumb-item to="/risk/model-offline-analysis/feature-center">特征中心</a-breadcrumb-item>
      <a-breadcrumb-item>新建特征</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :bordered="false" class="panel-card">
      <template #title>特征基础信息</template>
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="特征大类" required>
              <a-radio-group v-model="form.majorCategory" type="button">
                <a-radio value="credit">征信变量</a-radio>
                <a-radio value="behavior">行为变量</a-radio>
                <a-radio value="model_output">模型输出</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="一级分类" required>
              <a-select v-model="form.level1" placeholder="请选择">
                <a-option v-for="opt in effectiveLevel1Options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-alert v-if="form.majorCategory==='model_output'" type="info" style="margin-bottom: 8px">来源自动填充为平台模型输出，创建人为模型归属人</a-alert>
        <a-alert v-else-if="form.majorCategory==='credit'" type="info" style="margin-bottom: 8px">征信大类需填写来源表与征信分类（一级/二级）</a-alert>
        <a-alert v-else-if="form.majorCategory==='behavior'" type="info" style="margin-bottom: 8px">贷中行为需填写来源表与行为分类（一级/二级）</a-alert>
        <a-row :gutter="16" v-if="form.majorCategory==='model_output'">
          <a-col :span="24">
            <a-form-item label="选择模型" required>
              <a-select v-model="form.modelCode" placeholder="请选择已注册模型" allow-search @change="onModelCodeChange">
                <a-option v-for="m in modelList" :key="m.code" :value="m.code">{{ m.name }} ({{ m.code }})</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="二级分类">
              <a-select v-model="form.level2" placeholder="请选择" v-if="form.majorCategory!=='model_output'">
                <a-option v-for="opt in level2Options(form.level1)" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="来源表">
              <a-input v-model="form.sourceTable" placeholder="请输入来源表" v-if="form.majorCategory!=='model_output'" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="特征编码" required>
              <a-input v-model="form.code" placeholder="请输入编码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="特征名称" required>
              <a-input v-model="form.name" placeholder="请输入名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据类型" required>
              <a-select v-model="form.dataType" placeholder="请选择">
                <a-option value="int">int</a-option>
                <a-option value="double">double</a-option>
                <a-option value="string">string</a-option>
                <a-option value="timestamp">timestamp</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="批次">
              <a-input v-model="form.batch" placeholder="请输入批次" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="模型类型" required>
              <a-select v-model="form.modelType" placeholder="请选择模型类型">
                <a-option value="daily">日模型</a-option>
                <a-option value="monthly">月模型</a-option>
                <a-option value="other">其他模型</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="更新频率">
              <a-select v-model="form.updateFrequency" placeholder="请选择更新频率">
                <a-option value="实时">实时</a-option>
                <a-option value="日度">日度</a-option>
                <a-option value="周度">周度</a-option>
                <a-option value="月度">月度</a-option>
                <a-option value="季度">季度</a-option>
                <a-option value="年度">年度</a-option>
                <a-option value="按需">按需</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="默认值">
              <a-input v-model="form.defaultValue" placeholder="请输入默认值" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="需求提出人">
              <a-input v-model="form.proposer" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开发人">
              <a-input v-model="form.developer" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="上线时间">
              <a-date-picker v-model="form.onlineTime" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="验收人">
              <a-input v-model="form.accepter" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="加工逻辑">
          <a-input v-model="form.processingLogic" placeholder="请输入加工逻辑" />
        </a-form-item>
        <a-form-item label="备注">
          <a-input v-model="form.remark" placeholder="备注" />
        </a-form-item>
      </a-form>
    </a-card>

    <div class="actions-bar">
      <a-space>
        <a-button @click="goBack">取消</a-button>
        <a-button type="primary" @click="handleSubmit">提交</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { featureAPI, modelAPI } from '@/api/offlineModel'

const router = useRouter()
const modelList = ref([])

const form = ref({
  majorCategory: '',
  level1: '',
  level2: '',
  code: '',
  name: '',
  sourceTable: '',
  processingLogic: '',
  dataType: '',
  batch: '',
  proposer: '',
  developer: '',
  onlineTime: '',
  accepter: '',
  remark: '',
  modelCode: '',
  modelType: '',
  updateFrequency: '按需',
  defaultValue: ''
})

onMounted(async () => {
  try {
    const res = await modelAPI.getModels({ page: 1, pageSize: 200 })
    modelList.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch (err) {
    console.error('获取模型列表失败:', err)
  }
})

const level1Options = [
  { value: 'credit_report', label: '征信报告' },
  { value: 'credit_history', label: '信贷记录' },
  { value: 'transaction_behavior', label: '交易行为' },
  { value: 'activity', label: '活跃度' },
  { value: 'model_outputs', label: '模型输出' }
]

const effectiveLevel1Options = computed(() => {
  const cat = form.value.majorCategory
  if (cat === 'model_output') return level1Options.filter(o => o.value === 'model_outputs')
  if (cat === 'credit') return level1Options.filter(o => o.value === 'credit_report' || o.value === 'credit_history')
  if (cat === 'behavior') return level1Options.filter(o => o.value === 'transaction_behavior' || o.value === 'activity')
  return level1Options
})

const level2Options = (l1) => {
  const map = {
    credit_report: [
      { value: 'overdue_count', label: '逾期次数' },
      { value: 'query_count', label: '查询次数' }
    ],
    credit_history: [
      { value: 'loan_times', label: '贷款次数' },
      { value: 'repay_ratio', label: '还款比率' }
    ],
    transaction_behavior: [
      { value: 'avg_amount', label: '平均交易额' },
      { value: 'frequency', label: '交易频次' }
    ],
    activity: [
      { value: 'login_days', label: '登录天数' },
      { value: 'session_count', label: '会话次数' }
    ],
    model_outputs: [
      { value: 'score', label: '评分' },
      { value: 'probability', label: '概率' }
    ]
  }
  return map[l1] || []
}

const onModelCodeChange = (code) => {
  if (!code) return
  if (!form.value.name) form.value.name = '模型分'
  if (!form.value.dataType) form.value.dataType = 'double'
}

const goBack = () => {
  router.go(-1)
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.code || !form.value.majorCategory || !form.value.level1 || !form.value.dataType) {
    Message.error('请填写必填项')
    return
  }

  const isModelOutput = form.value.majorCategory === 'model_output'
  if (isModelOutput && !form.value.modelCode) {
    Message.error('请选择已注册的模型')
    return
  }

  const typeMap = (dt) => {
    if (dt === 'timestamp') return 'time'
    if (dt === 'string') return 'categorical'
    if (dt === 'int' || dt === 'double') return 'numerical'
    return 'numerical'
  }

  const selectedModel = isModelOutput ? (modelList.value || []).find(m => m.code === form.value.modelCode) : null
  
  const payload = {
    name: form.value.name,
    code: form.value.code,
    type: typeMap(form.value.dataType),
    description: form.value.processingLogic || '',
    dataSource: isModelOutput ? '平台模型输出' : (form.value.sourceTable || ''),
    updateFrequency: form.value.updateFrequency || '按需',
    majorCategory: form.value.majorCategory,
    level1: isModelOutput ? 'model_outputs' : form.value.level1,
    level2: isModelOutput ? (form.value.modelCode || '') : form.value.level2,
    batch: form.value.batch,
    proposer: form.value.proposer,
    developer: form.value.developer,
    onlineTime: form.value.onlineTime,
    accepter: form.value.accepter,
    remark: form.value.remark,
    sourceType: isModelOutput ? 'model_output' : '',
    sourceRefId: isModelOutput ? (form.value.modelCode || '') : '',
    creator: isModelOutput ? (selectedModel?.creator || '平台模型') : undefined,
    modelType: form.value.modelType || 'other',
    defaultValue: form.value.defaultValue || ''
  }

  const res = await featureAPI.createFeature(payload)
  if (res.success) {
    Message.success(res.message || '创建成功')
    router.push('/risk/model-offline-analysis/feature-center')
  } else {
    Message.error(res.message || '创建失败')
  }
}
</script>

<style scoped>
.feature-create-page { padding: 16px; background: #fff; }
.panel-card { margin-bottom: 12px; }
.actions-bar { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>