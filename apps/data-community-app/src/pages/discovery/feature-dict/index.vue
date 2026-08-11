<template>
  <PageContainer>
    <PageHeader
      :title="focusFeature ? `特征字典 · ${focusFeature}` : '特征字典'"
      sub-title="所有 ML 特征的标准定义 · 字典视图与地图视图合一"
    >
      <template #extra>
        <a-button @click="goOverview">
          <template #icon><icon-storage /></template>
          数据总览
        </a-button>
      </template>
    </PageHeader>
    <div class="content-wrapper">
      <a-alert v-if="focusFeature" type="info" :show-icon="true" style="margin-bottom: 16px">
        正在查看「{{ focusFeature }}」的特征定义
      </a-alert>

      <a-card :bordered="false">
        <a-tabs v-model:activeKey="viewMode">
          <a-tab-pane key="dict" title="字典视图">
            <a-input-search v-model="keyword" placeholder="搜索特征名/编码" size="large" allow-clear style="margin-bottom: 16px" />
            <a-collapse :default-active-key="['risk', 'marketing', 'fraud', 'churn']">
              <a-collapse-item v-for="t in types" :key="t.code" :header="`${t.name} (${t.features.length})`">
                <a-table :data="filtered(t.features)" :pagination="false" row-key="code" size="small">
                  <template #columns>
                    <a-table-column title="编码" data-index="code" :width="100" />
                    <a-table-column title="特征名" data-index="name">
                      <template #cell="{ record }">
                        <a-link @click="focusFeatureInfo = record; focusFeature = record.name">{{ record.name }}</a-link>
                      </template>
                    </a-table-column>
                    <a-table-column title="类型" data-index="type" :width="120">
                      <template #cell="{ record }">
                        <a-tag :color="typeColor(record.type)">{{ typeLabel(record.type) }}</a-tag>
                      </template>
                    </a-table-column>
                    <a-table-column title="重要性" data-index="importance" :width="140">
                      <template #cell="{ record }">
                        <a-progress :percent="record.importance" :stroke-width="6" :color="importanceColor(record.importance)" />
                      </template>
                    </a-table-column>
                    <a-table-column title="状态" data-index="status" :width="100">
                      <template #cell="{ record }">
                        <a-tag :color="record.status === 'online' ? 'green' : 'gray'">{{ record.status === 'online' ? '在线' : '离线' }}</a-tag>
                      </template>
                    </a-table-column>
                    <a-table-column title="Owner" data-index="owner" :width="100" />
                  </template>
                </a-table>
              </a-collapse-item>
            </a-collapse>
          </a-tab-pane>

          <a-tab-pane key="map" title="地图视图">
            <a-row :gutter="[16, 16]" style="margin-bottom: 16px">
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="特征总数" :value="featuresTotal" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="在线特征" :value="onlineCount" :value-style="{ color: '#00b42a' }" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="平均重要性" :value="avgImportance" suffix="%" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="场景数" :value="types.length" /></a-card></a-col>
            </a-row>

            <a-tabs default-active-key="all">
              <a-tab-pane v-for="t in types" :key="t.code" :title="`${t.name} (${t.features.length})`">
                <a-row :gutter="[12, 12]">
                  <a-col :span="8" v-for="f in t.features" :key="f.code">
                    <a-card hoverable :bordered="false" class="map-card" @click="focusFeatureInfo = f; focusFeature = f.name">
                      <div class="map-card-row">
                        <a-tag :color="typeColor(f.type)">{{ typeLabel(f.type) }}</a-tag>
                        <a-tag :color="f.status === 'online' ? 'green' : 'gray'">{{ f.status === 'online' ? '在线' : '离线' }}</a-tag>
                      </div>
                      <div class="map-card-name">{{ f.name }}</div>
                      <div class="map-card-meta">
                        <span>{{ f.code }}</span>
                        <span>·</span>
                        <span>{{ f.owner }}</span>
                      </div>
                      <a-progress :percent="f.importance" :stroke-width="6" :color="importanceColor(f.importance)" style="margin-top: 8px" />
                      <div class="map-card-imp">重要性 {{ f.importance.toFixed(1) }}</div>
                    </a-card>
                  </a-col>
                </a-row>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>
        </a-tabs>
      </a-card>

      <!-- 详情抽屉 -->
      <a-drawer :visible="!!focusFeatureInfo" :title="focusFeatureInfo?.name" :width="560" @cancel="closeDetail" @ok="closeDetail" :ok-text="'关闭'" :cancel-text="'关闭'">
        <a-descriptions v-if="focusFeatureInfo" :column="1" size="medium" bordered>
          <a-descriptions-item label="编码">{{ focusFeatureInfo.code }}</a-descriptions-item>
          <a-descriptions-item label="名称">{{ focusFeatureInfo.name }}</a-descriptions-item>
          <a-descriptions-item label="类型"><a-tag :color="typeColor(focusFeatureInfo.type)">{{ typeLabel(focusFeatureInfo.type) }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="重要性">{{ focusFeatureInfo.importance.toFixed(1) }}</a-descriptions-item>
          <a-descriptions-item label="状态"><a-tag :color="focusFeatureInfo.status === 'online' ? 'green' : 'gray'">{{ focusFeatureInfo.status === 'online' ? '在线' : '离线' }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="Owner">{{ focusFeatureInfo.owner }}</a-descriptions-item>
          <a-descriptions-item label="描述">{{ focusFeatureInfo.description || '-' }}</a-descriptions-item>
        </a-descriptions>
      </a-drawer>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FeatureStore } from '@/mock-shared/dataset'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'

const router = useRouter()
const route = useRoute()
const viewMode = ref<'dict' | 'map'>('dict')

const focusFeature = ref<string>((route.query.name as string) || (route.query.code as string) || '')
const focusFeatureInfo = ref<any>(null)
const keyword = ref('')

// 由公共 mock 派生:按 scenario 分组(字典 + 地图共用)
const types = ref(
  (() => {
    const all = FeatureStore.all()
    const byScenario: Record<string, { name: string; features: any[] }> = {}
    all.forEach(f => {
      const key = f.scenario
      if (!byScenario[key]) {
        byScenario[key] = {
          name:
            key === 'risk' ? '风控场景' :
            key === 'marketing' ? '营销场景' :
            key === 'fraud' ? '反欺诈' :
            key === 'churn' ? '流失预警' :
            '通用',
          features: []
        }
      }
      byScenario[key].features.push({
        code: f.code,
        name: f.name,
        type: f.type,
        owner: f.owner,
        importance: f.importance,
        status: f.status,
        description: f.description
      })
    })
    return Object.entries(byScenario).map(([code, info]) => ({ code, ...info }))
  })()
)

// KPI
const flatFeatures = computed(() => types.value.flatMap(t => t.features))
const featuresTotal = computed(() => flatFeatures.value.length)
const onlineCount = computed(() => flatFeatures.value.filter(f => f.status === 'online').length)
const avgImportance = computed(() => {
  if (!flatFeatures.value.length) return 0
  return Math.round(flatFeatures.value.reduce((s, f) => s + f.importance, 0) / flatFeatures.value.length)
})

function filtered(arr: any[]) {
  if (!keyword.value) return arr
  const k = keyword.value.toLowerCase()
  return arr.filter(f => f.name.toLowerCase().includes(k) || f.code.toLowerCase().includes(k))
}
function typeColor(t: string) { return { raw: 'arcoblue', derived: 'green', embedding: 'purple', cross: 'orange' }[t] || 'gray' }
function typeLabel(t: string) { return { raw: '原始', derived: '衍生', embedding: 'Embedding', cross: '交叉' }[t] || t }
function importanceColor(v: number) { if (v >= 90) return '#00b42a'; if (v >= 70) return '#ff7d00'; return '#f53f3f' }

function closeDetail() { focusFeatureInfo.value = null }
function goOverview() { router.push('discovery/overview') }
</script>
<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度由 PageContainer 提供 */
.content-wrapper { padding: 0 24px 24px; }
.map-card {
  transition: all 0.2s;
  cursor: pointer;
  &:hover { transform: translateY(-2px); border-color: #165dff; }
}
.map-card-row { display: flex; gap: 8px; margin-bottom: 8px; }
.map-card-name { font-size: 15px; font-weight: 600; color: #1d2129; margin-bottom: 4px; }
.map-card-meta { font-size: 12px; color: #86909c; }
.map-card-imp { font-size: 12px; color: #4e5969; margin-top: 4px; }
</style>