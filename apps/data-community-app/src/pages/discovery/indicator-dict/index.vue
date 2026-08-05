<template>
  <div class="indicator-dict-page">
    <a-page-header
      :title="focusMetric ? `指标字典 · ${focusMetric}` : '指标字典'"
      sub-title="原子指标、衍生指标 · 字典视图与地图视图合一"
      :back="false"
    >
      <template #extra>
        <a-button @click="goOverview">
          <template #icon><icon-storage /></template>
          数据总览
        </a-button>
      </template>
    </a-page-header>
    <div class="content-wrapper">
      <a-alert v-if="focusMetric" type="info" :show-icon="true" style="margin-bottom: 16px">
        正在查看「{{ focusMetric }}」的指标定义
      </a-alert>

      <a-card :bordered="false">
        <!-- 视图切换:字典(扁平表) / 地图(按 layer 分组卡片) -->
        <a-tabs v-model:activeKey="viewMode">
          <a-tab-pane key="dict" title="字典视图">
            <a-input-search v-model="keyword" placeholder="搜索指标编码/名称/描述/口径" size="large" allow-clear style="margin-bottom: 16px" />
            <a-collapse :default-active-key="['用户域', '交易域', '风控域', '营销域']">
              <a-collapse-item v-for="d in domains" :key="d.code" :header="`${d.name} (${d.metrics.length})`">
                <a-table :data="d.metrics" :pagination="false" row-key="code" size="small">
                  <template #columns>
                    <a-table-column title="编码" data-index="code" :width="100" />
                    <a-table-column title="指标" data-index="name" :width="160">
                      <template #cell="{ record }">
                        <a-link @click="focusMetricInfo = record; focusMetric = record.name">{{ record.name }}</a-link>
                      </template>
                    </a-table-column>
                    <a-table-column title="分层" data-index="layer" :width="80">
                      <template #cell="{ record }"><a-tag :color="layerColor(record.layer)">{{ record.layer }}</a-tag></template>
                    </a-table-column>
                    <a-table-column title="类型" data-index="type" :width="100">
                      <template #cell="{ record }">
                        <a-tag :color="record.type === 'atomic' ? 'arcoblue' : 'purple'">{{ record.type === 'atomic' ? '原子' : '衍生' }}</a-tag>
                      </template>
                    </a-table-column>
                    <a-table-column title="Owner" data-index="owner" :width="100" />
                    <a-table-column title="口径" data-index="formula" />
                  </template>
                </a-table>
              </a-collapse-item>
            </a-collapse>
          </a-tab-pane>

          <a-tab-pane key="map" title="地图视图">
            <a-row :gutter="[16, 16]" style="margin-bottom: 16px">
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="指标总数" :value="metricsTotal" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="原子指标" :value="atomicCount" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="衍生指标" :value="derivedCount" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="Owner 数" :value="ownerCount" /></a-card></a-col>
            </a-row>

            <a-collapse v-for="cat in mapCategories" :key="cat.code" :default-active-key="['L1']" style="margin-bottom: 12px">
              <a-collapse-item :header="`${cat.name} (${cat.metrics.length})`" :key="cat.code">
                <a-row :gutter="[12, 12]">
                  <a-col :span="8" v-for="m in cat.metrics" :key="m.code">
                    <a-card hoverable :bordered="false" class="map-card" @click="focusMetricInfo = m; focusMetric = m.name">
                      <div class="map-card-row">
                        <a-tag :color="m.type === 'atomic' ? 'arcoblue' : 'purple'">{{ m.type === 'atomic' ? '原子' : '衍生' }}</a-tag>
                        <a-tag :color="layerColor(m.layer)">{{ m.layer }}</a-tag>
                      </div>
                      <div class="map-card-name">{{ m.name }}</div>
                      <div class="map-card-meta">
                        <span>{{ m.code }}</span>
                        <span>·</span>
                        <span>{{ m.owner }}</span>
                      </div>
                      <div class="map-card-formula" v-if="m.formula">{{ m.formula }}</div>
                    </a-card>
                  </a-col>
                </a-row>
              </a-collapse-item>
            </a-collapse>
          </a-tab-pane>
        </a-tabs>
      </a-card>

      <!-- 指标详情抽屉 -->
      <a-drawer :visible="!!focusMetricInfo" :title="focusMetricInfo?.name" :width="560" @cancel="closeDetail" @ok="closeDetail" :ok-text="'关闭'" :cancel-text="'关闭'">
        <a-descriptions v-if="focusMetricInfo" :column="1" size="medium" bordered>
          <a-descriptions-item label="编码">{{ focusMetricInfo.code }}</a-descriptions-item>
          <a-descriptions-item label="名称">{{ focusMetricInfo.name }}</a-descriptions-item>
          <a-descriptions-item label="分层"><a-tag :color="layerColor(focusMetricInfo.layer)">{{ focusMetricInfo.layer }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="类型"><a-tag :color="focusMetricInfo.type === 'atomic' ? 'arcoblue' : 'purple'">{{ focusMetricInfo.type === 'atomic' ? '原子' : '衍生' }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="数据域">{{ focusMetricInfo.domain }}</a-descriptions-item>
          <a-descriptions-item label="Owner">{{ focusMetricInfo.owner }}</a-descriptions-item>
          <a-descriptions-item label="单位">{{ focusMetricInfo.unit || '-' }}</a-descriptions-item>
          <a-descriptions-item label="更新频率">{{ focusMetricInfo.updateFrequency || '-' }}</a-descriptions-item>
          <a-descriptions-item label="口径"><code>{{ focusMetricInfo.formula }}</code></a-descriptions-item>
          <a-descriptions-item label="描述">{{ focusMetricInfo.description || '-' }}</a-descriptions-item>
        </a-descriptions>
      </a-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MetricStore } from '../../../mock/shared/dataset'

const router = useRouter()
const route = useRoute()

// 视图模式: dict(字典) / map(地图)
const viewMode = ref<'dict' | 'map'>('dict')

// 从 ?code / ?name 拿当前聚焦的指标
const focusMetric = ref<string>((route.query.name as string) || (route.query.code as string) || '')
const focusMetricInfo = ref<any>(null)

const keyword = ref('')

// 字典视图:按 domain 分组
const domains = ref(
  (() => {
    const all = MetricStore.all()
    const byDomain: Record<string, { name: string; metrics: any[] }> = {}
    all.forEach(m => {
      if (!byDomain[m.domain]) byDomain[m.domain] = { name: m.domain, metrics: [] }
      byDomain[m.domain].metrics.push(m)
    })
    return Object.entries(byDomain).map(([code, info]) => ({ code, ...info }))
  })()
)

// 地图视图:按 layer 分组(原 metrics-map 的核心能力)
const mapCategories = ref(
  (() => {
    const all = MetricStore.all()
    const byLayer: Record<string, { name: string; metrics: any[] }> = {}
    all.forEach(m => {
      const key = m.layer
      if (!byLayer[key]) {
        byLayer[key] = {
          name:
            key === 'L1' ? 'L1 一级指标' :
            key === 'L2' ? 'L2 衍生指标' :
            key === 'L3' ? 'L3 业务指标' :
            'L4 综合指标',
          metrics: []
        }
      }
      byLayer[key].metrics.push(m)
    })
    return Object.entries(byLayer).map(([code, info]) => ({ code, ...info }))
  })()
)

// 顶部 KPI(原 metrics-map 顶部统计)
const metricsTotal = computed(() => MetricStore.all().length)
const atomicCount = computed(() => MetricStore.all().filter(m => m.type === 'atomic').length)
const derivedCount = computed(() => MetricStore.all().filter(m => m.type === 'derived').length)
const ownerCount = computed(() => new Set(MetricStore.all().map(m => m.owner)).size)

function layerColor(layer: string) {
  return { L1: 'red', L2: 'orange', L3: 'arcoblue' }[layer] || 'gray'
}

function closeDetail() { focusMetricInfo.value = null }
function goOverview() { router.push('discovery/overview') }
</script>
<style lang="scss" scoped>
.indicator-dict-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }
.map-card {
  transition: all 0.2s;
  cursor: pointer;
  &:hover { transform: translateY(-2px); border-color: #165dff; }
}
.map-card-row { display: flex; gap: 8px; margin-bottom: 8px; }
.map-card-name { font-size: 15px; font-weight: 600; color: #1d2129; margin-bottom: 4px; }
.map-card-meta { font-size: 12px; color: #86909c; margin-bottom: 8px; display: flex; gap: 4px; }
.map-card-formula {
  font-size: 12px;
  color: #4e5969;
  background: #f5f7fa;
  padding: 6px 8px;
  border-radius: 4px;
  font-family: 'Menlo', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>