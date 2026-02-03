<template>
  <div class="backtrack-detail-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/model-offline-analysis/model-backtrack">模型回溯</a-breadcrumb-item>
        <a-breadcrumb-item>回溯详情</a-breadcrumb-item>
      </a-breadcrumb>
      <h1 class="page-title">回溯详情 #{{ id }}</h1>
    </div>
    <a-tabs type="card" :active-key="activeTab" @change="activeTab=$event">
      <a-tab-pane key="config" title="配置信息">
        <a-descriptions :column="2" bordered title="基础信息" size="small">
          <a-descriptions-item label="回溯ID">{{ detail.id }}</a-descriptions-item>
          <a-descriptions-item label="状态"><a-tag>{{ detail.status }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="数据来源">{{ detail.config?.sourceType }}</a-descriptions-item>
          <a-descriptions-item label="样本表">{{ detail.config?.table }}</a-descriptions-item>
          <a-descriptions-item label="库名">{{ detail.config?.dbName }}</a-descriptions-item>
          <a-descriptions-item label="表名">{{ detail.config?.tableName }}</a-descriptions-item>
          <a-descriptions-item label="模型服务">{{ detail.config?.serviceName }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ detail.createTime }}</a-descriptions-item>
        </a-descriptions>
        <div class="section">
          <h3>必填字段映射</h3>
          <a-table :data="detail.config?.requiredFieldMappings || []" :columns="requiredCols" row-key="field" size="small" :pagination="false" />
        </div>
        <div class="section">
          <h3>入参匹配情况</h3>
          <a-table :data="detail.config?.inputMappings || []" :columns="inputCols" row-key="input" size="small" :pagination="false" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="progress" title="执行进度">
        <a-steps :current="currentStep" status="process">
          <a-step v-for="s in detail.progress" :key="s.key" :title="s.name" :description="stepDesc(s)" />
        </a-steps>
      </a-tab-pane>
      <a-tab-pane key="result" title="执行结果">
        <a-descriptions :column="3" bordered title="统计" size="small">
          <a-descriptions-item label="总数">{{ detail.result?.total }}</a-descriptions-item>
          <a-descriptions-item label="成功">{{ detail.result?.success }}</a-descriptions-item>
          <a-descriptions-item label="失败">{{ detail.result?.failed }}</a-descriptions-item>
        </a-descriptions>
        <div class="section">
          <h3>样例输出</h3>
          <a-table :data="detail.result?.samples || []" :columns="sampleCols" row-key="idx" size="small" :pagination="false" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="report" title="回溯报告">
        <div class="report-section" v-if="detail.status === 'completed'">
          <a-card title="模型性能评估" class="report-card">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-statistic title="准确率" :value="detail.report?.accuracy || 0" :precision="2" suffix="%" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="召回率" :value="detail.report?.recall || 0" :precision="2" suffix="%" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="F1分数" :value="detail.report?.f1Score || 0" :precision="2" />
              </a-col>
            </a-row>
          </a-card>
          <a-card title="数据分布分析" class="report-card">
            <a-table 
              :data="detail.report?.dataDistribution || []" 
              :columns="distributionCols" 
              row-key="category" 
              size="small" 
              :pagination="false" 
            />
          </a-card>
          <a-card title="特征重要性" class="report-card">
            <a-table 
              :data="detail.report?.featureImportance || []" 
              :columns="importanceCols" 
              row-key="feature" 
              size="small" 
              :pagination="false" 
            />
          </a-card>
        </div>
        <div v-else class="report-placeholder">
          <a-empty description="任务未完成，暂无报告数据" />
        </div>
      </a-tab-pane>
    </a-tabs>
    <div class="actions-bar">
      <a-space>
        <a-button @click="handleBack">返回</a-button>
        <a-button status="danger" @click="handleStop" :disabled="detail.status!=='running'">停止任务</a-button>
      </a-space>
    </div>
  </div>
 </template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { backtrackAPI } from '@/modules/offline-model/api'
import { 
  getBacktrackRouteParams, 
  DETAIL_TABS,
  isFromRiskModule,
  isFromOfflineModule 
} from '@/modules/offline-model/utils/model-backtrack-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// 从路由参数获取默认标签页
const routeParams = getBacktrackRouteParams(route)
const activeTab = ref(routeParams.tab || 'config')
const detail = ref({ id, status: 'running', config: {}, progress: [], result: {} })

// 来源模块信息
const isFromRisk = computed(() => isFromRiskModule(route))
const isFromOffline = computed(() => isFromOfflineModule(route))
const sourceModule = computed(() => {
  if (isFromRisk.value) return '风险域模块'
  if (isFromOffline.value) return '离线模块'
  return ''
})

const requiredCols = [
  { title: '字段', dataIndex: 'field', width: 160 },
  { title: '目标', dataIndex: 'target', width: 200 }
]
const inputCols = [
  { title: '入参', dataIndex: 'input', width: 160 },
  { title: '目标', dataIndex: 'target', width: 200 }
]
const sampleCols = [
  { title: '#', dataIndex: 'idx', width: 80 },
  { title: '输出', dataIndex: 'output' }
]

// 报告相关列配置
const distributionCols = [
  { title: '类别', dataIndex: 'category', width: 160 },
  { title: '数量', dataIndex: 'count', width: 120 },
  { title: '占比', dataIndex: 'percentage', width: 120 }
]

const importanceCols = [
  { title: '特征', dataIndex: 'feature', width: 200 },
  { title: '重要性得分', dataIndex: 'score', width: 150 },
  { title: '排名', dataIndex: 'rank', width: 100 }
]

const currentStep = computed(() => {
  const idx = (detail.value.progress || []).findIndex(s => s.status === 'running')
  return idx >= 0 ? idx : (detail.value.progress || []).length - 1
})

const stepDesc = (s) => {
  return s.status === 'done' ? (s.time || '') : (s.status === 'running' ? '进行中' : '')
}

const loadDetail = async () => {
  const res = await backtrackAPI.getBacktrackDetail(id)
  if (res.success && res.data) {
    detail.value = res.data
  } else {
    Message.error(res.message || '加载失败')
  }
}

import { goBack } from '@/router/utils'
const handleBack = () => {
  if (isFromRisk.value) {
    goBack(router, '/risk/model-offline-analysis/model-backtrack')
  } else {
    goBack(router, '/model-offline-analysis/model-backtrack')
  }
}
const handleStop = async () => {
  const res = await backtrackAPI.stopBacktrack(id)
  if (res.success) {
    Message.success('任务已停止')
    await loadDetail()
  }
}

onMounted(loadDetail)
</script>

<style scoped>
.backtrack-detail-page { padding: 16px; background: #fff; }
.page-header { margin-bottom: 12px; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.section { margin-top: 12px; }
.actions-bar { margin-top: 16px; }
.report-section { margin-top: 16px; }
.report-card { margin-bottom: 16px; }
.report-placeholder { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 300px; 
}
</style>
