<template>
  <div class="feature-detail-page">
    <a-breadcrumb style="margin-bottom: 12px">
      <a-breadcrumb-item to="/risk/model-offline-analysis/feature-center">特征中心</a-breadcrumb-item>
      <a-breadcrumb-item>特征详情</a-breadcrumb-item>
    </a-breadcrumb>
    <a-card :bordered="false" class="panel-card">
      <template #title>
        <div class="title-row">
          <span>{{ detail?.name || '-' }}（{{ detail?.code || '-' }}）</span>
          <a-tag :color="bizColor">{{ bizLabel }}</a-tag>
        </div>
      </template>
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="特征名称">{{ detail?.name }}</a-descriptions-item>
        <a-descriptions-item label="特征编码">{{ detail?.code }}</a-descriptions-item>
        <a-descriptions-item label="特征类型">{{ typeLabel(detail?.type) }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="statusColor(detail?.status)">{{ statusLabel(detail?.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="业务大类">{{ detail?.majorCategory || '-' }}</a-descriptions-item>
        <a-descriptions-item label="一级分类">{{ detail?.level1 || '-' }}</a-descriptions-item>
        <a-descriptions-item label="二级分类">{{ detail?.level2 || '-' }}</a-descriptions-item>
        <a-descriptions-item label="数据源">{{ detail?.dataSource || '-' }}</a-descriptions-item>
        <a-descriptions-item label="更新频率">{{ detail?.updateFrequency || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detail?.createTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ detail?.creator || '-' }}</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ detail?.description || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card :bordered="false" class="panel-card" v-if="isModelScore">
      <template #title>模型注册基础信息</template>
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="平台服务">{{ platformModel?.serviceName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="平台名称">{{ platformModel?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="模型编码">{{ platformModel?.code || '-' }}</a-descriptions-item>
        <a-descriptions-item label="版本">{{ platformModel?.version || '-' }}</a-descriptions-item>
        <a-descriptions-item label="算法框架">{{ platformModel?.framework || '-' }}</a-descriptions-item>
        <a-descriptions-item label="模型类型">{{ modelTypeLabel(platformModel?.type) }}</a-descriptions-item>
        <a-descriptions-item label="主键字段" :span="2">{{ (platformModel?.pkFields || []).join(', ') || '-' }}</a-descriptions-item>
        <a-descriptions-item label="入参" :span="2">{{ (platformModel?.inputs || []).map(i=>i.name).join(', ') || '-' }}</a-descriptions-item>
        <a-descriptions-item label="出参" :span="2">{{ (platformModel?.outputs || []).map(o=>o.name).join(', ') || '-' }}</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ platformModel?.description || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <div class="actions-bar">
      <a-space>
        <a-button @click="goBack">返回</a-button>
        <a-button type="primary" @click="goEdit">编辑</a-button>
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
const platformModel = ref(null)

const isModelScore = computed(() => detail.value?.level1 === 'model_outputs')
const bizLabel = computed(() => {
  if (isModelScore.value) return '模型分'
  if (detail.value?.majorCategory === 'behavior') return '贷中行为特征'
  if (detail.value?.majorCategory === 'credit') return '征信衍生特征'
  if (detail.value?.level1 === 'credit_report' || detail.value?.level1 === 'credit_history') return '征信衍生特征'
  if (detail.value?.level1 === 'transaction_behavior' || detail.value?.level1 === 'activity') return '贷中行为特征'
  return '未分类'
})
const bizColor = computed(() => {
  const map = { '模型分': 'purple', '贷中行为特征': 'blue', '征信衍生特征': 'green', '未分类': 'gray' }
  return map[bizLabel.value] || 'gray'
})

const typeLabel = (t) => ({ numerical: '数值型', categorical: '分类型', text: '文本型', time: '时间型' }[t] || t)
const statusColor = (s) => ({ active: 'green', inactive: 'red', draft: 'orange', pending: 'blue', expired: 'gray' }[s] || 'gray')
const statusLabel = (s) => ({ active: '有效', inactive: '无效', draft: '草稿', pending: '待审核', expired: '已过期' }[s] || s)
const modelTypeLabel = (t) => ({ classification: '分类模型', regression: '回归模型', clustering: '聚类模型', deep_learning: '深度学习' }[t] || t)

onMounted(async () => {
  try {
    const res = await featureAPI.getFeatureDetail(id)
    detail.value = res.data || res
    if (isModelScore.value) {
      const serviceName = detail.value?.level2
      const pm = await modelAPI.getPlatformModel(serviceName)
      if (pm.success) platformModel.value = pm.data
    }
  } catch (e) {
    Message.error('加载详情失败')
  }
})

import { goBack as goBackUtil } from '@/router/utils'
const goBack = () => goBackUtil(router, '/risk/model-offline-analysis/feature-center')
const goEdit = () => router.push(`/risk/model-offline-analysis/feature-center/edit/${id}`)
</script>

<style scoped>
.feature-detail-page { padding: 16px; background: #fff; }
.panel-card { margin-bottom: 12px; }
.title-row { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.actions-bar { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
