<template>
  <div class="backtrack-detail-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/risk/model-offline-analysis/model-backtrack">模型回溯</a-breadcrumb-item>
        <a-breadcrumb-item>回溯详情</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <h1 class="page-title">回溯详情 #{{ id }}</h1>
        <div class="header-actions">
          <a-tag :color="getStatusColor(detail.status)">{{ getStatusLabel(detail.status) }}</a-tag>
        </div>
      </div>
    </div>

    <div class="page-content">
      <a-tabs type="card" :active-key="activeTab" @change="activeTab=$event">
        <a-tab-pane key="config" title="配置信息">
          <a-card :bordered="false">
            <a-descriptions :column="2" bordered title="基础信息" size="small">
              <a-descriptions-item label="回溯ID">{{ detail.id }}</a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-tag :color="getStatusColor(detail.status)">{{ getStatusLabel(detail.status) }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="数据来源">{{ detail.config?.sourceType }}</a-descriptions-item>
              <a-descriptions-item label="样本表">{{ detail.config?.table }}</a-descriptions-item>
              <a-descriptions-item label="库名">{{ detail.config?.dbName }}</a-descriptions-item>
              <a-descriptions-item label="表名">{{ detail.config?.tableName }}</a-descriptions-item>
              <a-descriptions-item label="模型服务">{{ detail.config?.serviceName }}</a-descriptions-item>
              <a-descriptions-item label="创建时间">{{ detail.createTime }}</a-descriptions-item>
            </a-descriptions>

            <div class="section">
              <h3 class="section-title">必填字段映射</h3>
              <a-table :data="detail.config?.requiredFieldMappings || []" :columns="requiredCols" row-key="field" size="small" :pagination="false" />
            </div>

            <div class="section">
              <h3 class="section-title">入参匹配情况</h3>
              <a-table :data="detail.config?.inputMappings || []" :columns="inputCols" row-key="input" size="small" :pagination="false" />
            </div>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="progress" title="执行进度">
          <a-card :bordered="false">
            <div class="steps-wrapper">
              <a-steps :current="currentStep" status="process" direction="vertical">
                <a-step v-for="s in detail.progress" :key="s.key" :title="s.name" :description="stepDesc(s)" />
              </a-steps>
            </div>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="result" title="执行结果">
          <a-card :bordered="false">
            <a-descriptions :column="3" bordered title="统计信息" size="small">
              <a-descriptions-item label="总样本数">{{ detail.result?.total }}</a-descriptions-item>
              <a-descriptions-item label="成功数">
                <span class="text-success">{{ detail.result?.success }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="失败数">
                <span class="text-danger">{{ detail.result?.failed }}</span>
              </a-descriptions-item>
            </a-descriptions>

            <div class="section">
              <h3 class="section-title">样例输出 (Top 10)</h3>
              <a-table :data="detail.result?.samples || []" :columns="sampleCols" row-key="idx" size="small" :pagination="false" />
            </div>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="report" title="回溯报告">
          <div class="report-section" v-if="detail.status === 'completed'">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-card title="模型性能评估" class="report-card">
                  <a-grid :cols="3" :col-gap="12" :row-gap="12">
                    <a-grid-item>
                      <a-statistic title="准确率" :value="detail.report?.accuracy || 0" :precision="2" suffix="%" show-group-separator />
                    </a-grid-item>
                    <a-grid-item>
                      <a-statistic title="召回率" :value="detail.report?.recall || 0" :precision="2" suffix="%" show-group-separator />
                    </a-grid-item>
                    <a-grid-item>
                      <a-statistic title="F1分数" :value="detail.report?.f1Score || 0" :precision="2" show-group-separator />
                    </a-grid-item>
                  </a-grid>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="12">
                <a-card title="数据分布分析" class="report-card">
                  <a-table 
                    :data="detail.report?.dataDistribution || []" 
                    :columns="distributionCols" 
                    row-key="category" 
                    size="small" 
                    :pagination="false" 
                  />
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="特征重要性" class="report-card">
                  <a-table 
                    :data="detail.report?.featureImportance || []" 
                    :columns="importanceCols" 
                    row-key="feature" 
                    size="small" 
                    :pagination="false" 
                  />
                </a-card>
              </a-col>
            </a-row>
          </div>
          <div v-else class="report-placeholder">
            <a-empty description="任务进行中或已停止，暂无完整报告数据" />
          </div>
        </a-tab-pane>
      </a-tabs>

      <div class="actions-bar">
        <a-space>
          <a-button @click="handleBack">返回列表</a-button>
          <a-button 
            v-if="detail.status === 'running'" 
            status="danger" 
            @click="handleStop"
          >
            停止任务
          </a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { backtrackAPI } from '@/api/offlineModel'
import { 
  getBacktrackRouteParams, 
  isFromRiskModule 
} from '@/utils/model-backtrack-router'
import { goBack } from '@/router/utils'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// 从路由参数获取默认标签页
const routeParams = getBacktrackRouteParams(route)
const activeTab = ref(routeParams.tab || 'config')
const detail = ref({ id, status: 'running', config: {}, progress: [], result: {} })

// 来源模块信息
const isFromRisk = computed(() => isFromRiskModule(route))

const requiredCols = [
  { title: '字段名称', dataIndex: 'field', width: 160 },
  { title: '映射目标', dataIndex: 'target', width: 200 }
]

const inputCols = [
  { title: '模型入参', dataIndex: 'input', width: 160 },
  { title: '数据目标', dataIndex: 'target', width: 200 }
]

const sampleCols = [
  { title: '序号', dataIndex: 'idx', width: 80 },
  { title: '输出结果', dataIndex: 'output', slotName: 'output' }
]

// 报告相关列配置
const distributionCols = [
  { title: '风险类别', dataIndex: 'category', width: 160 },
  { title: '样本数量', dataIndex: 'count', width: 120 },
  { title: '占比', dataIndex: 'percentage', width: 120 }
]

const importanceCols = [
  { title: '特征名称', dataIndex: 'feature', width: 200 },
  { title: '重要性得分', dataIndex: 'score', width: 150 },
  { title: '排名', dataIndex: 'rank', width: 100 }
]

const currentStep = computed(() => {
  const steps = detail.value.progress || []
  const idx = steps.findIndex(s => s.status === 'running')
  return idx >= 0 ? idx : steps.length - 1
})

const stepDesc = (s) => {
  if (s.status === 'done') return s.time || '已完成'
  if (s.status === 'running') return '正在处理中...'
  if (s.status === 'failed') return '执行失败'
  return '待执行'
}

const getStatusColor = (status) => {
  const colors = {
    running: 'arcoblue',
    completed: 'green',
    failed: 'red',
    stopped: 'orange'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    running: '进行中',
    completed: '已完成',
    failed: '已失败',
    stopped: '已停止'
  }
  return labels[status] || status
}

const loadDetail = async () => {
  try {
    const res = await backtrackAPI.getBacktrackDetail(id)
    if (res.success && res.data) {
      detail.value = res.data
    } else {
      Message.error(res.message || '加载详情失败')
    }
  } catch (e) {
    Message.error('网络请求错误')
  }
}

const handleBack = () => {
  if (isFromRisk.value) {
    goBack(router, '/risk/model-offline-analysis/model-backtrack')
  } else {
    goBack(router, '/offline-model/model-backtrack')
  }
}

const handleStop = async () => {
  try {
    const res = await backtrackAPI.stopBacktrack(id)
    if (res.success) {
      Message.success('任务停止指令已发送')
      await loadDetail()
    } else {
      Message.error(res.message || '停止失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

onMounted(loadDetail)
</script>

<style scoped lang="less">
.backtrack-detail-page {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;

  .page-header {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 20px;
    border-radius: 4px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;

      .page-title {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: #1d2129;
      }
    }
  }

  .page-content {
    .section {
      margin-top: 24px;

      .section-title {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
        color: #1d2129;
        padding-left: 8px;
        border-left: 4px solid #165dff;
      }
    }

    .steps-wrapper {
      padding: 20px 40px;
      max-width: 600px;
    }

    .text-success { color: #00b42a; }
    .text-danger { color: #f53f3f; }

    .report-section {
      .report-card {
        border-radius: 4px;
      }
    }

    .report-placeholder {
      background: #fff;
      padding: 80px 0;
      border-radius: 4px;
    }

    .actions-bar {
      margin-top: 24px;
      padding: 16px 24px;
      background: #fff;
      border-radius: 4px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

:deep(.arco-tabs-nav-tab) {
  padding: 0 20px;
  background: #fff;
}
</style>
