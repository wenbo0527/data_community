<template>
  <div class="feature-detail-page">
    <a-breadcrumb style="margin-bottom: 16px">
      <a-breadcrumb-item to="/model-offline-analysis/feature-center">特征中心</a-breadcrumb-item>
      <a-breadcrumb-item>特征详情</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="content-container">
      <a-card :bordered="false" class="panel-card header-card">
        <div class="header-info">
          <div class="title-section">
            <h1 class="main-title">{{ detail?.name || '-' }}</h1>
            <span class="sub-code">{{ detail?.code || '-' }}</span>
            <a-tag :color="bizColor" size="small">{{ bizLabel }}</a-tag>
          </div>
          <div class="status-section">
            <a-tag :color="statusColor(detail?.status)" bordered>
              <template #icon><icon-check-circle-fill v-if="detail?.status === 'active'" /></template>
              {{ statusLabel(detail?.status) }}
            </a-tag>
          </div>
        </div>
      </a-card>

      <a-row :gutter="16">
        <a-col :span="16">
          <a-card :bordered="false" class="panel-card" title="基础配置信息">
            <a-descriptions :column="2" bordered size="medium">
              <a-descriptions-item label="特征类型">{{ typeLabel(detail?.type) }}</a-descriptions-item>
              <a-descriptions-item label="更新频率">{{ detail?.updateFrequency || '-' }}</a-descriptions-item>
              <a-descriptions-item label="业务大类">{{ detail?.majorCategory || '-' }}</a-descriptions-item>
              <a-descriptions-item label="一级分类">{{ detail?.level1 || '-' }}</a-descriptions-item>
              <a-descriptions-item label="二级分类">{{ detail?.level2 || '-' }}</a-descriptions-item>
              <a-descriptions-item label="模型类型">
                <a-space v-if="Array.isArray(detail?.modelType)">
                  <a-tag v-for="mt in detail.modelType" :key="mt" :color="modelTypeColor(mt)" size="small">
                    {{ modelTypeLabel(mt) }}
                  </a-tag>
                </a-space>
                <a-tag v-else :color="modelTypeColor(detail?.modelType)" size="small">
                  {{ modelTypeLabel(detail?.modelType) }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
            <div class="logic-section" v-if="detail?.processingLogic">
              <div class="section-label">处理逻辑</div>
              <div class="logic-content">{{ detail.processingLogic }}</div>
            </div>
          </a-card>

          <a-card :bordered="false" class="panel-card" title="数据源配置" style="margin-top: 16px;">
            <a-descriptions :column="1" bordered size="medium">
              <a-descriptions-item label="日模型数据源">{{ detail?.dataSource || '-' }}</a-descriptions-item>
              <a-descriptions-item label="月模型数据源" v-if="detail?.monthlyDataSource">{{ detail?.monthlyDataSource }}</a-descriptions-item>
              <a-descriptions-item label="默认值">{{ detail?.defaultValue || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card :bordered="false" class="panel-card" v-if="detail?.defaultValueMappings?.length > 0" title="默认值转化映射" style="margin-top: 16px;">
            <div v-for="(mapping, index) in detail.defaultValueMappings" :key="index" class="mapping-group">
              <div class="mapping-header">
                <icon-settings style="margin-right: 4px; color: #165dff;" />
                触发条件：<a-tag :color="modelTypeColor(mapping.conditionType)" size="small">{{ modelTypeLabel(mapping.conditionType) }}</a-tag>
              </div>
              <a-table :data="mapping.mappings" :pagination="false" size="small" :bordered="true" class="mapping-table">
                <template #columns>
                  <a-table-column title="Key (原始值)" data-index="key" />
                  <a-table-column title="Value (转化值)" data-index="value" />
                </template>
              </a-table>
            </div>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card :bordered="false" class="panel-card" title="管理信息">
            <a-descriptions :column="1" size="medium">
              <a-descriptions-item label="创建人">
                <a-space size="mini">
                  <a-avatar :size="24" style="background-color: #165dff;">
                    <icon-user />
                  </a-avatar>
                  {{ detail?.creator || '-' }}
                </a-space>
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">{{ detail?.createTime || '-' }}</a-descriptions-item>
            </a-descriptions>
            <div class="desc-section">
              <div class="section-label">特征描述</div>
              <div class="desc-content">{{ detail?.description || '暂无描述信息' }}</div>
            </div>
          </a-card>

          <a-card :bordered="false" class="panel-card" v-if="isModelScore" title="模型注册基础信息" style="margin-top: 16px;">
            <a-descriptions :column="1" size="medium">
              <a-descriptions-item label="平台服务">{{ platformModel?.serviceName || '-' }}</a-descriptions-item>
              <a-descriptions-item label="平台名称">{{ platformModel?.name || '-' }}</a-descriptions-item>
              <a-descriptions-item label="版本">{{ platformModel?.version || '-' }}</a-descriptions-item>
              <a-descriptions-item label="算法框架">{{ platformModel?.framework || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>
    </div>

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
import { featureAPI, modelAPI } from '@/modules/offline-model/api'

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
const modelTypeLabel = (t) => ({ daily: '日模型', monthly: '月模型', other: '其他模型', classification: '分类模型', regression: '回归模型', clustering: '聚类模型', deep_learning: '深度学习' }[t] || t)
const modelTypeColor = (mt) => ({ daily: 'blue', monthly: 'green', other: 'orange' }[mt] || 'gray')

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
    Message.error({ content: '加载详情失败', duration: 6000 })
  }
})

// import { goBack as goBackUtil } from '@/router/utils' // 暂时注释掉，使用替代方法
const goBack = () => router.push('/model-offline-analysis/feature-center')
const goEdit = () => router.push(`/model-offline-analysis/feature-center/edit/${id}`)
</script>

<style scoped>
.feature-detail-page {
  padding: 16px;
  background-color: #f4f7f9;
  min-height: calc(100vh - 60px);
}

.content-container {
  width: 100%;
}

.panel-card {
  margin-bottom: 0;
  border-radius: 4px;
}

.header-card {
  margin-bottom: 16px;
}

.header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.main-title {
  margin: 0;
  font-size: 20px;
  color: #1d2129;
  font-weight: 600;
}

.sub-code {
  font-size: 13px;
  color: #86909c;
  font-family: monospace;
}

.logic-section,
.desc-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f2f3f5;
}

.section-label {
  font-size: 13px;
  color: #4e5969;
  margin-bottom: 8px;
  font-weight: 500;
}

.logic-content,
.desc-content {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 4px;
  color: #1d2129;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.mapping-group {
  margin-bottom: 20px;
}

.mapping-group:last-child {
  margin-bottom: 0;
}

.mapping-header {
  margin-bottom: 12px;
  font-weight: 500;
  color: #1d2129;
  display: flex;
  align-items: center;
}

.mapping-table {
  border-radius: 4px;
  overflow: hidden;
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 4px;
}
</style>
