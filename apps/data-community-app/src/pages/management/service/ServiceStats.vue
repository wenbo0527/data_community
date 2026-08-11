<template>
  <div class="service-stats-page">
    <div class="page-header">
      <a-typography-title :heading="3">调用统计</a-typography-title>
      <a-typography-text>数据服务和API的调用统计分析</a-typography-text>
    </div>

    <!-- 时间范围选择 -->
    <a-card class="filter-card">
      <a-radio-group v-model="timeRange" @change="fetchStats">
        <a-radio value="today">今日</a-radio>
        <a-radio value="week">本周</a-radio>
        <a-radio value="month">本月</a-radio>
        <a-radio value="custom">自定义</a-radio>
      </a-radio-group>
      <a-space style="margin-left: 24px;">
        <a-date-picker v-if="timeRange === 'custom'" />
        <a-button type="primary" @click="fetchStats">查询</a-button>
      </a-space>
    </a-card>

    <!-- 统计概览 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">{{ totalStats.totalCalls.toLocaleString() }}</div>
          <div class="stat-label">总调用量</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">{{ totalStats.totalUsers.toLocaleString() }}</div>
          <div class="stat-label">调用用户数</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">{{ totalStats.avgDailyCalls.toLocaleString() }}</div>
          <div class="stat-label">日均调用量</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">{{ totalStats.peakCalls.toLocaleString() }}</div>
          <div class="stat-label">峰值调用量</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 调用排行 -->
    <a-card class="table-card">
      <template #title>服务调用排行 (Top 10)</template>
      <a-table :data="serviceRanking" :loading="loading" :pagination="false">
        <a-table-column title="排名" width="60">
          <template #cell="{ rowIndex }">
            <a-tag :color="rowIndex < 3 ? 'arcoblue' : 'gray'">{{ rowIndex + 1 }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="服务名称" data-index="serviceName" />
        <a-table-column title="调用量" data-index="calls" />
        <a-table-column title="调用用户" data-index="users" />
        <a-table-column title="占比" data-index="percentage">
          <template #cell="{ record }">
            <a-progress :percent="record.percentage" :show-text="true" :format="(v: number) => v + '%'" />
          </template>
        </a-table-column>
        <a-table-column title="趋势">
          <template #cell="{ record }">
            <IconArrowUp v-if="record.trend > 0" style="color: rgb(var(--success-6));" />
            <IconArrowDown v-else style="color: rgb(var(--danger-6));" />
            {{ Math.abs(record.trend) }}%
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <!-- API调用统计 -->
    <a-card class="table-card" style="margin-top: 16px;">
      <template #title>API调用统计</template>
      <a-table :data="apiStats" :loading="loading">
        <a-table-column title="API名称" data-index="apiName" />
        <a-table-column title="API路径" data-index="apiPath" />
        <a-table-column title="调用次数" data-index="calls" />
        <a-table-column title="成功次数" data-index="success" />
        <a-table-column title="失败次数" data-index="failed" />
        <a-table-column title="平均响应" data-index="avgTime" />
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconArrowUp, IconArrowDown } from '@arco-design/web-vue/es/icon'

const timeRange = ref('week')
const loading = ref(false)

const totalStats = ref({
  totalCalls: 125680,
  totalUsers: 3245,
  avgDailyCalls: 17954,
  peakCalls: 25680
})

const serviceRanking = ref([
  { serviceName: '客户360查询服务', calls: 32500, users: 1200, percentage: 25.8, trend: 12.5 },
  { serviceName: '指标计算服务', calls: 28900, users: 890, percentage: 23.0, trend: 8.3 },
  { serviceName: '标签查询服务', calls: 21000, users: 1050, percentage: 16.7, trend: -2.1 },
  { serviceName: '外部数据服务', calls: 18500, users: 456, percentage: 14.7, trend: 25.6 },
  { serviceName: '数据模型服务', calls: 14900, users: 678, percentage: 11.9, trend: 5.2 },
  { serviceName: '风险评估服务', calls: 5800, users: 234, percentage: 4.6, trend: -1.8 },
  { serviceName: '信用评分服务', calls: 3200, users: 189, percentage: 2.5, trend: 3.4 },
  { serviceName: '其他服务', calls: 880, users: 56, percentage: 0.7, trend: 0 }
])

const apiStats = ref([
  { apiName: '客户查询API', apiPath: '/api/v1/customer/query', calls: 45230, success: 44890, failed: 340, avgTime: 45 },
  { apiName: '指标计算API', apiPath: '/api/v1/metric/calculate', calls: 32100, success: 31800, failed: 300, avgTime: 128 },
  { apiName: '标签查询API', apiPath: '/api/v1/tag/search', calls: 28900, success: 28850, failed: 50, avgTime: 32 },
  { apiName: '外部数据API', apiPath: '/api/v1/external/fetch', calls: 18500, success: 17900, failed: 600, avgTime: 256 },
  { apiName: '数据模型API', apiPath: '/api/v1/model/predict', calls: 12000, success: 11900, failed: 100, avgTime: 89 }
])

function fetchStats() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 800)
}

onMounted(() => {
  console.log('[DMT] ServiceStats mounted')
  fetchStats()
})
</script>

<style scoped>
.service-stats-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header .arco-typography {
  margin-bottom: 8px;
}

.filter-card {
  margin-bottom: 24px;
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
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-3);
}

.table-card {
  margin-top: 16px;
}
</style>