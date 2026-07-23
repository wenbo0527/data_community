<template>
  <!-- @prd: asset-listing.resource.business-system -->
  <div class="resource-sources-page">
    <DmtPageHeader title="数据资源上下架" sub-title="按业务系统分组管理源表的上架与下架" />

    <!-- 统计卡 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="8">
        <a-card>
          <a-statistic title="资源总数" :value="stats.totalAssets" :value-style="{ color: '#165DFF' }">
            <template #suffix><span style="font-size: 14px; color: #86909c">个</span></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic title="已上架" :value="stats.onShelfCount" :value-style="{ color: '#00B42A' }">
            <template #suffix>
              <span style="font-size: 14px; color: #86909c">/ {{ stats.totalAssets }}</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic title="已下架" :value="stats.offShelfCount" :value-style="{ color: '#FF7D00' }" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 系统分组卡矩阵 -->
    <div class="section-title">
      <h3>业务系统</h3>
      <span class="section-subtitle">点击进入查看系统下的源表列表与上下架操作</span>
    </div>
    <a-row :gutter="[16, 16]">
      <a-col v-for="sys in systemCards" :key="sys.id" :xs="24" :sm="12" :md="8" :lg="8">
        <a-card hoverable class="system-card" @click="goToSystem(sys.id)">
          <template #title>
            <a-space>
              <component :is="getIcon(sys.icon)" />
              <span class="card-title">{{ sys.name }}</span>
            </a-space>
          </template>
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="源表数量">
              <a-tag color="arcoblue">{{ sys.totalCount }} 个</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="已上架">
              <a-space :size="4">
                <a-tag color="green" size="small">{{ sys.onShelfCount }}</a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="已下架">
              <a-space :size="4">
                <a-tag color="orange" size="small">{{ sys.offShelfCount }}</a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="说明">{{ sys.description }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DmtPageHeader from '../../../../components/common/DmtPageHeader.vue'
import { getSystemsByKind, mockTables, type AssetSystemId } from '@/mock/data-map'
import { listingStore } from '@/mock/listing-store'
import {
  IconStorage, IconRobot, IconNotification, IconCustomerService, IconSafe
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 聚合所有资源（数据资源 = 业务系统源表 + 业务指标）
interface AssetRecord {
  name: string
  systemId: AssetSystemId
  status: 'active' | 'onShelf' | 'offShelf'
}

const allAssets = computed<AssetRecord[]>(() => {
  const tableAssets = mockTables.map(t => ({
    name: t.tableName,
    systemId: t.systemId,
    status: t.status
  }))
  const metricAssets = listingStore.metrics.map(m => ({
    name: m.metricName,
    systemId: m.systemId,
    status: m.status
  }))
  return [...tableAssets, ...metricAssets]
})

// 顶部统计
const stats = computed(() => {
  const list = allAssets.value
  return {
    totalAssets: list.length,
    onShelfCount: list.filter(a => a.status === 'onShelf' || a.status === 'active').length,
    offShelfCount: list.filter(a => a.status === 'offShelf').length
  }
})

// 系统卡片数据 - 只展示「数据资源」分组（核心系统/催收/客服/风控）
const systemCards = computed(() => {
  return getSystemsByKind('resource').map(sys => {
    const list = allAssets.value.filter(a => a.systemId === sys.id)
    return {
      ...sys,
      totalCount: list.length,
      onShelfCount: list.filter(a => a.status === 'onShelf' || a.status === 'active').length,
      offShelfCount: list.filter(a => a.status === 'offShelf').length
    }
  })
})

const iconMap: Record<string, any> = {
  'icon-storage': IconStorage,
  'icon-robot': IconRobot,
  'icon-notification': IconNotification,
  'icon-service': IconCustomerService,
  'icon-safe': IconSafe
}
const getIcon = (name: string) => iconMap[name] || IconStorage

const goToSystem = (sysId: AssetSystemId) => {
  router.push(`/asset-management/listing-management/data-source/system/${sysId}`)
}
</script>

<style scoped>
.resource-sources-page { padding: 16px 24px 24px; }
.stats-row { margin-bottom: 24px; }
.section-title { margin: 8px 0 16px; display: flex; align-items: baseline; gap: 12px; }
.section-title h3 { margin: 0; font-size: 16px; font-weight: 600; }
.section-subtitle { color: #86909c; font-size: 13px; }
.system-card { cursor: pointer; transition: all 0.2s; }
.system-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.card-title { font-size: 15px; font-weight: 600; }
</style>