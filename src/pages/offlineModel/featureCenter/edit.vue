<template>
  <div class="feature-edit-page">
    <a-breadcrumb style="margin-bottom: 12px">
      <a-breadcrumb-item to="/offline-model/feature-center">特征中心</a-breadcrumb-item>
      <a-breadcrumb-item>编辑特征</a-breadcrumb-item>
    </a-breadcrumb>

    <a-alert v-if="isModelScore" type="info" style="margin-bottom: 12px">
      当前特征来源为模型分，将跳转至模型注册编辑页进行修改
    </a-alert>

    <a-card v-if="!isModelScore" :bordered="false" class="panel-card">
      <template #title>特征基础信息</template>
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="特征大类">
              <a-select v-model="form.majorCategory" placeholder="请选择">
                <a-option value="credit">征信变量</a-option>
                <a-option value="behavior">行为变量</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="一级分类">
              <a-select v-model="form.level1" placeholder="请选择">
                <a-option v-for="opt in level1Options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="二级分类">
              <a-select v-model="form.level2" placeholder="请选择">
                <a-option v-for="opt in level2Options(form.level1)" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="来源表">
              <a-input v-model="form.sourceTable" placeholder="请输入来源表" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="特征编码">
              <a-input v-model="form.code" placeholder="请输入编码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="特征名称">
              <a-input v-model="form.name" placeholder="请输入名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据类型">
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
            <a-form-item label="需求提出人">
              <a-input v-model="form.proposer" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开发人">
              <a-input v-model="form.developer" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="上线时间">
              <a-date-picker v-model="form.onlineTime" style="width: 100%" />
            </a-form-item>
          </a-col>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { featureAPI, modelAPI } from '@/api/offlineModel'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const detail = ref(null)
const form = ref({})

const isModelScore = computed(() => detail.value?.level1 === 'model_outputs')

const level1Options = [
  { value: 'credit_report', label: '征信报告' },
  { value: 'credit_history', label: '信贷记录' },
  { value: 'transaction_behavior', label: '交易行为' },
  { value: 'activity', label: '活跃度' }
]
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
    ]
  }
  return map[l1] || []
}

onMounted(async () => {
  try {
    const res = await featureAPI.getFeatureDetail(id)
    detail.value = res.data || res
    if (isModelScore.value) {
      const serviceName = detail.value?.level2
      const pm = await modelAPI.getPlatformModel(serviceName)
      if (pm.success) {
        const code = pm.data?.code
        const models = await modelAPI.getModels({ name: code })
        const list = models.data?.data || models.data || []
        const modelId = Array.isArray(list) && list[0]?.id
        if (modelId) {
          router.replace(`/offline-model/model-register/edit/${modelId}`)
          return
        } else {
          Message.warning('未找到对应已注册模型，请先在模型注册中创建')
        }
      }
    }
    form.value = {
      majorCategory: detail.value?.majorCategory || '',
      level1: detail.value?.level1 || '',
      level2: detail.value?.level2 || '',
      code: detail.value?.code || '',
      name: detail.value?.name || '',
      sourceTable: detail.value?.dataSource || '',
      processingLogic: detail.value?.description || '',
      dataType: detail.value?.type === 'time' ? 'timestamp' : (detail.value?.type === 'categorical' ? 'string' : (detail.value?.type === 'numerical' ? 'double' : 'string')),
      batch: detail.value?.batch || '',
      proposer: detail.value?.proposer || '',
      developer: detail.value?.developer || '',
      onlineTime: detail.value?.onlineTime || '',
      accepter: detail.value?.accepter || '',
      remark: detail.value?.remark || ''
    }
  } catch (e) {
    Message.error('加载编辑数据失败')
  }
})

import { goBack as goBackUtil } from '@/router/utils'
const goBack = () => goBackUtil(router, '/offline-model/feature-center')
const handleSubmit = async () => {
  if (isModelScore.value) return
  const typeMap = (dt) => {
    if (dt === 'timestamp') return 'time'
    if (dt === 'string') return 'categorical'
    if (dt === 'int' || dt === 'double') return 'numerical'
    return 'numerical'
  }
  const payload = {
    name: form.value.name,
    code: form.value.code,
    type: typeMap(form.value.dataType),
    description: form.value.processingLogic || '',
    dataSource: form.value.sourceTable || '',
    updateFrequency: detail.value?.updateFrequency || '按需',
    majorCategory: form.value.majorCategory,
    level1: form.value.level1,
    level2: form.value.level2,
    batch: form.value.batch,
    proposer: form.value.proposer,
    developer: form.value.developer,
    onlineTime: form.value.onlineTime,
    accepter: form.value.accepter,
    remark: form.value.remark
  }
  const res = await featureAPI.updateFeature(id, payload)
  if (res.success) { Message.success('更新成功'); router.push('/offline-model/feature-center') } else { Message.error(res.message || '更新失败') }
}
</script>

<style scoped>
.feature-edit-page { padding: 16px; background: #fff; }
.panel-card { margin-bottom: 12px; }
.actions-bar { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
