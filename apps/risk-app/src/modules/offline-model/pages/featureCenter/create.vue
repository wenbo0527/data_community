<template>
  <div class="feature-create-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/model-offline-analysis/feature-center">特征中心</a-breadcrumb-item>
        <a-breadcrumb-item>新建特征</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-actions">
        <a-space>
          <a-button @click="goBack">取消</a-button>
          <a-button type="primary" @click="handleSubmit">提交保存</a-button>
        </a-space>
      </div>
    </div>

    <div class="content-container">
      <a-form :model="form" layout="vertical" :rules="rules" auto-label-width validation-trigger="blur">
        <a-row :gutter="16">
          <!-- 第一列：基础配置 -->
          <a-col :span="8">
            <a-card title="基础配置信息" :bordered="false" class="panel-card">
              <a-form-item label="特征大类" required field="majorCategory">
                <a-radio-group v-model="form.majorCategory" type="button" size="small">
                  <a-radio value="credit">征信变量</a-radio>
                  <a-radio value="behavior">行为变量</a-radio>
                  <a-radio value="model_output">模型输出</a-radio>
                </a-radio-group>
              </a-form-item>

              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="一级分类" required field="level1">
                    <a-select v-model="form.level1" placeholder="请选择">
                      <a-option v-for="opt in effectiveLevel1Options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="二级分类" field="level2">
                    <a-select v-model="form.level2" placeholder="请选择" v-if="form.majorCategory!=='model_output'">
                      <a-option v-for="opt in level2Options(form.level1)" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
                    </a-select>
                    <a-input v-else disabled placeholder="自动关联" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="特征编码" required field="code">
                <a-input v-model="form.code" placeholder="请输入编码" />
              </a-form-item>
              <a-form-item label="特征名称" required field="name">
                <a-input v-model="form.name" placeholder="请输入名称" />
              </a-form-item>
              
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="数据类型" required field="dataType">
                    <a-select v-model="form.dataType" placeholder="请选择">
                      <a-option value="int">int</a-option>
                      <a-option value="double">double</a-option>
                      <a-option value="string">string</a-option>
                      <a-option value="timestamp">timestamp</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="默认值" field="defaultValue">
                    <a-input v-model="form.defaultValue" placeholder="请输入默认值" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="模型类型" required field="modelType">
                <a-select v-model="form.modelType" placeholder="请选择模型类型" multiple allow-clear>
                  <a-option value="daily">日模型</a-option>
                  <a-option value="monthly">月模型</a-option>
                  <a-option value="other">其他模型</a-option>
                </a-select>
              </a-form-item>

              <a-alert v-if="form.majorCategory==='model_output'" type="info" class="mb-8">来源自动填充为平台模型输出</a-alert>
            </a-card>
          </a-col>

          <!-- 第二列：数据来源与逻辑 -->
          <a-col :span="8">
            <a-card title="数据来源与处理" :bordered="false" class="panel-card">
              <a-form-item label="日模型来源表" v-if="form.modelType.includes('daily') || form.modelType.includes('other') || form.modelType.length === 0" field="sourceTable">
                <a-input v-model="form.sourceTable" placeholder="请输入日模型来源表" />
              </a-form-item>
              <a-form-item label="月模型来源表" v-if="form.modelType.includes('monthly')" field="monthlySourceTable">
                <a-input v-model="form.monthlySourceTable" placeholder="请输入月模型来源表" />
              </a-form-item>
              
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="更新频率" field="updateFrequency">
                    <a-select v-model="form.updateFrequency" placeholder="请选择">
                      <a-option value="实时">实时</a-option>
                      <a-option value="日度">日度</a-option>
                      <a-option value="周度">周度</a-option>
                      <a-option value="月度">月度</a-option>
                      <a-option value="按需">按需</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="批次" field="batch">
                    <a-input v-model="form.batch" placeholder="请输入批次" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="加工逻辑" field="processingLogic">
                <a-textarea v-model="form.processingLogic" placeholder="请输入加工逻辑" :auto-size="{ minRows: 4, maxRows: 6 }" />
              </a-form-item>

              <a-form-item label="备注" field="remark">
                <a-textarea v-model="form.remark" placeholder="备注信息" :auto-size="{ minRows: 2, maxRows: 4 }" />
              </a-form-item>

              <a-form-item label="选择模型" v-if="form.majorCategory==='model_output'" required field="modelCode">
                <a-select v-model="form.modelCode" placeholder="请选择已注册模型" allow-search @change="onModelCodeChange">
                  <a-option v-for="m in modelList" :key="m.code" :value="m.code">{{ m.name }} ({{ m.code }})</a-option>
                </a-select>
              </a-form-item>
            </a-card>
          </a-col>

          <!-- 第三列：管理与映射 -->
          <a-col :span="8">
            <a-card title="管理信息" :bordered="false" class="panel-card" style="margin-bottom: 16px;">
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="需求提出人" field="proposer">
                    <a-input v-model="form.proposer" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="开发人" field="developer">
                    <a-input v-model="form.developer" placeholder="请输入" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="上线时间" field="onlineTime">
                    <a-date-picker v-model="form.onlineTime" style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="验收人" field="accepter">
                    <a-input v-model="form.accepter" placeholder="请输入" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-card>

            <a-card title="默认值转化映射" :bordered="false" class="panel-card">
              <template #extra>
                <a-button type="outline" size="mini" @click="addMapping">
                  <template #icon><icon-plus /></template>
                  添加策略
                </a-button>
              </template>

              <div v-if="form.defaultValueMappings.length === 0" class="empty-mapping">
                <a-empty description="暂无映射规则，建议配置默认值转化逻辑" />
              </div>

              <div v-for="(mapping, mIdx) in form.defaultValueMappings" :key="mIdx" class="mapping-card">
                <div class="mapping-card-header">
                  <div class="header-left">
                    <a-tag color="arcoblue" size="small">策略 {{ mIdx + 1 }}</a-tag>
                  </div>
                  <div class="header-right">
                    <a-button type="text" status="danger" size="mini" @click="removeMapping(mIdx)">
                      <template #icon><icon-delete /></template>
                      移除
                    </a-button>
                  </div>
                </div>
                
                <a-row :gutter="12">
                  <a-col :span="12">
                    <a-form-item label="适用模型" required>
                      <a-select v-model="mapping.conditionType" placeholder="模型类型" size="small">
                        <a-option value="daily">日模型</a-option>
                        <a-option value="monthly">月模型</a-option>
                        <a-option value="all">全量通用</a-option>
                        <a-option value="other">其他</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="规则描述">
                      <a-input v-model="mapping.ruleDesc" placeholder="如：空值转0" size="small" />
                    </a-form-item>
                  </a-col>
                </a-row>

                <div class="mapping-rule-container">
                  <div class="rules-header">
                    <span class="rules-title">映射明细</span>
                    <a-button type="text" size="mini" @click="addMappingRule(mIdx)">
                      <template #icon><icon-plus /></template>
                      添加
                    </a-button>
                  </div>
                  <div v-for="(rule, rIdx) in mapping.rules" :key="rIdx" class="mapping-rule-row">
                    <a-input v-model="rule.origin" placeholder="原值" size="mini" />
                    <icon-arrow-right style="color: #86909c" />
                    <a-input v-model="rule.target" placeholder="目标值" size="mini" />
                    <a-button type="text" status="danger" size="mini" @click="removeMappingRule(mIdx, rIdx)">
                      <icon-close />
                    </a-button>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { featureAPI, modelAPI } from '../../api/index.js'

const router = useRouter()
const modelList = ref([])

const rules = {
  majorCategory: [{ required: true, message: '请选择特征大类' }],
  level1: [{ required: true, message: '请选择一级分类' }],
  code: [{ required: true, message: '请输入特征编码' }],
  name: [{ required: true, message: '请输入特征名称' }],
  dataType: [{ required: true, message: '请选择数据类型' }],
  modelType: [{ required: true, message: '请选择模型类型' }],
  modelCode: [{ required: true, message: '请选择关联模型' }]
}

const form = ref({
  majorCategory: 'credit',
  level1: '',
  level2: '',
  code: '',
  name: '',
  sourceTable: '',
  monthlySourceTable: '',
  processingLogic: '',
  dataType: 'double',
  batch: '',
  proposer: '',
  developer: '',
  onlineTime: '',
  accepter: '',
  remark: '',
  modelCode: '',
  modelType: ['daily'],
  updateFrequency: '按需',
  defaultValue: '',
  defaultValueMappings: []
})

const addMapping = () => {
  form.value.defaultValueMappings.push({ conditionType: 'daily', ruleDesc: '', rules: [{ origin: '', target: '' }] })
}

const removeMapping = (index) => {
  form.value.defaultValueMappings.splice(index, 1)
}

const addMappingRule = (mIdx) => {
  form.value.defaultValueMappings[mIdx].rules.push({ origin: '', target: '' })
}

const removeMappingRule = (mIdx, rIdx) => {
  form.value.defaultValueMappings[mIdx].rules.splice(rIdx, 1)
}

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
    Message.error({ content: '请填写必填项', duration: 6000 })
    return
  }

  const isModelOutput = form.value.majorCategory === 'model_output'
  if (isModelOutput && !form.value.modelCode) {
    Message.error({ content: '请选择已注册的模型', duration: 6000 })
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
    dataSource: (isModelOutput && !form.value.modelType.includes('daily')) ? '平台模型输出' : (form.value.sourceTable || ''),
    monthlyDataSource: form.value.monthlySourceTable || '',
    updateFrequency: form.value.modelType.includes('monthly') ? '月度' : (form.value.updateFrequency || '按需'),
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
    modelType: form.value.modelType,
    defaultValue: form.value.defaultValue || '',
    defaultValueMappings: form.value.defaultValueMappings
  }

  try {
    const res = await featureAPI.createFeature(payload)
    if (res.success) {
      Message.success({ content: res.message || '创建成功', duration: 3000 })
      router.push('/model-offline-analysis/feature-center')
    } else {
      Message.error({ content: res.message || '创建失败', duration: 6000 })
    }
  } catch (error) {
    console.error('创建特征失败:', error)
    Message.error({ content: '创建失败', duration: 6000 })
  }
}
</script>

<style scoped>
.feature-create-page {
  padding: 16px;
  background-color: #f4f7f9;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: #fff;
  padding: 12px 20px;
  border-radius: 4px;
}

.panel-card {
  height: 100%;
  border-radius: 4px;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #f2f3f5;
  height: 48px;
}

:deep(.arco-card-title) {
  font-size: 15px;
  font-weight: 600;
}

.mb-8 {
  margin-bottom: 8px;
}

.mapping-card {
  background: #f8f9fb;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.mapping-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e5e6eb;
}

.mapping-rule-container {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #f2f3f5;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rules-title {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

.mapping-rule-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mapping-rule-row :deep(.arco-input-wrapper) {
  padding: 0 8px;
}

.empty-mapping {
  padding: 24px 0;
  background: #f8f9fb;
  border-radius: 4px;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
}
</style>
