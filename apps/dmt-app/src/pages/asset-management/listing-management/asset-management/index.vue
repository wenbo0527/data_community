<template>
  <div class="asset-listing-overview">
    <div class="page-header">
      <h2>数据资产上下架</h2>
      <a-typography-text>统一管理数据资源（表）与数据要素（指标）的上架、下架、归档状态</a-typography-text>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-section">
      <a-col :span="6">
        <a-card title="数据资源表" :bordered="false">
          <div class="stat-row">
            <span class="stat-label">总数</span>
            <span class="stat-value">{{ tableStats.total }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">已上架</span>
            <span class="stat-value active">{{ tableStats.onShelf }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">已下架</span>
            <span class="stat-value warning">{{ tableStats.offShelf }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">已归档</span>
            <span class="stat-value archived">{{ tableStats.archived }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card title="数据要素指标" :bordered="false">
          <div class="stat-row">
            <span class="stat-label">总数</span>
            <span class="stat-value">{{ metricStats.total }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">已上架</span>
            <span class="stat-value active">{{ metricStats.onShelf }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">已下架</span>
            <span class="stat-value warning">{{ metricStats.offShelf }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">已归档</span>
            <span class="stat-value archived">{{ metricStats.archived }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="快捷入口" :bordered="false">
          <a-space direction="vertical" :size="12" style="width: 100%">
            <a-button long @click="goToTableManagement" type="primary">
              <template #icon><IconPlus /></template>
              进入「数据资源上下架」（表管理）
            </a-button>
            <a-button long @click="goToMetricManagement">
              <template #icon><IconPlus /></template>
              进入「数据要素上下架」（指标管理）
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近上架列表 -->
    <a-row :gutter="16" class="recent-section">
      <a-col :span="12">
        <a-card title="最近上架表（Top 5）" :bordered="false">
          <a-table
            :columns="tableColumns"
            :data="recentTables"
            :pagination="false"
            size="small"
          />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="最近上架指标（Top 5）" :bordered="false">
          <a-table
            :columns="metricColumns"
            :data="recentMetrics"
            :pagination="false"
            size="small"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockTables } from '@/mock/data-map.ts'
import { listingStore } from '@/mock/listing-store.ts'
import { assetManagementStore } from '@/mock/asset-management.ts'

const router = useRouter()

const tableColumns = [
  { title: '表名', dataIndex: 'tableName', width: 180 },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '上架时间', dataIndex: 'onShelfTime', width: 160 },
  { title: '发布人', dataIndex: 'publisher', width: 100 }
]

const metricColumns = [
  { title: '指标名', dataIndex: 'metricName', width: 180 },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '上架时间', dataIndex: 'onShelfTime', width: 160 },
  { title: '发布人', dataIndex: 'publisher', width: 100 }
]

const tableStats = computed(() => {
  const tables = mockTables || []
  return {
    total: tables.length,
    onShelf: tables.filter(t => t.status === 'onShelf' || t.status === 'active').length,
    offShelf: tables.filter(t => t.status === 'offShelf').length,
    archived: tables.filter(t => t.status === 'archived' || t.status === 'inactive').length
  }
})

const metricStats = computed(() => {
  const metrics = listingStore.metrics || []
  return {
    total: metrics.length,
    onShelf: metrics.filter(m => m.status === 'onShelf' || m.status === 'active').length,
    offShelf: metrics.filter(m => m.status === 'offShelf').length,
    archived: metrics.filter(m => m.status === 'archived' || m.status === 'inactive').length
  }
})

const recentTables = computed(() => {
  const tables = mockTables || []
  return tables
    .filter(t => t.onShelfTime)
    .sort((a, b) => (b.onShelfTime || '').localeCompare(a.onShelfTime || ''))
    .slice(0, 5)
})

const recentMetrics = computed(() => {
  const metrics = listingStore.metrics || []
  return metrics
    .filter(m => m.onShelfTime)
    .sort((a, b) => (b.onShelfTime || '').localeCompare(a.onShelfTime || ''))
    .slice(0, 5)
})

function goToTableManagement() {
  router.push('/asset-management/listing-management/table-management').catch(() => {})
}

function goToMetricManagement() {
  router.push('/asset-management/listing-management/metric-management').catch(() => {})
}
</script>

<style scoped>
.asset-listing-overview {
  padding: 24px;
  background: var(--subapp-bg-secondary);
  min-height: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.stats-section {
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.stat-label {
  color: #86909c;
}

.stat-value {
  font-weight: 600;
  color: #1d2129;
}

.stat-value.active {
  color: #00b42a;
}

.stat-value.warning {
  color: #ff7d00;
}

.stat-value.archived {
  color: #86909c;
}

.recent-section {
  margin-top: 16px;
}
</style>