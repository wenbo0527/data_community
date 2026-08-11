<template>
  <div class="service-monitor-page">
    <div class="page-header">
      <a-typography-title :heading="3">服务监控</a-typography-title>
      <a-typography-text>实时监控数据服务和API的运行状态</a-typography-text>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayCalls }}</div>
            <div class="stat-label">今日调用量</div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value success">{{ stats.successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.avgResponseTime }}ms</div>
            <div class="stat-label">平均响应时间</div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value danger">{{ stats.errorRate }}%</div>
            <div class="stat-label">错误率</div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 实时监控表格 -->
    <a-card class="table-card">
      <template #title>
        <div class="card-title">
          <span>实时调用监控</span>
          <a-button type="primary" size="small" @click="refreshData">
            <template #icon><IconRefresh /></template>
            刷新
          </a-button>
        </div>
      </template>
      <a-table :data="monitorList" :loading="loading" :pagination="false">
        <a-table-column title="服务名称" data-index="serviceName" />
        <a-table-column title="调用量" data-index="calls" />
        <a-table-column title="成功" data-index="success" />
        <a-table-column title="失败" data-index="failed" />
        <a-table-column title="成功率" data-index="successRate">
          <template #cell="{ record }">
            <a-progress :percent="record.successRate" :color="record.successRate >= 95 ? 'green' : 'orange'" />
          </template>
        </a-table-column>
        <a-table-column title="平均响应(ms)" data-index="avgTime" />
        <a-table-column title="最后调用时间" data-index="lastCall" />
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconRefresh } from '@arco-design/web-vue/es/icon'

const loading = ref(false)

const stats = ref({
  todayCalls: 12580,
  successRate: 99.2,
  avgResponseTime: 45,
  errorRate: 0.8
})

const monitorList = ref([
  { serviceName: '客户360查询服务', calls: 3250, success: 3235, failed: 15, successRate: 99.5, avgTime: 32, lastCall: '10:23:45' },
  { serviceName: '指标计算服务', calls: 2890, success: 2870, failed: 20, successRate: 99.3, avgTime: 156, lastCall: '10:23:42' },
  { serviceName: '标签查询服务', calls: 2100, success: 2095, failed: 5, successRate: 99.8, avgTime: 28, lastCall: '10:23:40' },
  { serviceName: '外部数据服务', calls: 1850, success: 1800, failed: 50, successRate: 97.3, avgTime: 234, lastCall: '10:23:38' },
  { serviceName: '数据模型服务', calls: 2490, success: 2470, failed: 20, successRate: 99.2, avgTime: 89, lastCall: '10:23:35' }
])

function refreshData() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

onMounted(() => {
  console.log('[DMT] ServiceMonitor mounted')
})
</script>

<style scoped>
.service-monitor-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header .arco-typography {
  margin-bottom: 8px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 4px;
}

.stat-value.success {
  color: rgb(var(--success-6));
}

.stat-value.danger {
  color: rgb(var(--danger-6));
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-3);
}

.table-card {
  margin-top: 16px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>