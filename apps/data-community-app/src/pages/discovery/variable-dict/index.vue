<template>
  <PageContainer>
    <PageHeader
      :title="focusVariable ? `特征字典 · ${focusVariable}` : '特征字典'"
      sub-title="所有特征的标准定义 · 字典视图与地图视图合一"
    >
      <template #extra>
        <a-button @click="goOverview">
          <template #icon><icon-storage /></template>
          数据总览
        </a-button>
      </template>
    </PageHeader>
    <div class="content-wrapper">
      <a-alert v-if="focusVariable" type="info" :show-icon="true" style="margin-bottom: 16px">
        正在查看「{{ focusVariable }}」的特征定义
      </a-alert>

      <a-card :bordered="false">
        <a-tabs v-model:activeKey="viewMode">
          <a-tab-pane key="dict" title="字典视图">
            <a-input-search v-model="keyword" placeholder="搜索特征名/编码" size="large" allow-clear style="margin-bottom: 16px" />
            <a-collapse :default-active-key="['population', 'behavior', 'finance', 'risk']">
              <a-collapse-item v-for="t in types" :key="t.code" :header="`${t.name} (${t.variables.length})`">
                <a-table :data="filtered(t.variables)" :pagination="false" row-key="code" size="small">
                  <template #columns>
                    <a-table-column title="编码" data-index="code" :width="100" />
                    <a-table-column title="特征名" data-index="name">
                      <template #cell="{ record }">
                        <a-link @click="focusVariableInfo = record; focusVariable = record.name">{{ record.name }}</a-link>
                      </template>
                    </a-table-column>
                    <a-table-column title="数据类型" data-index="dataType" :width="110">
                      <template #cell="{ record }"><a-tag color="cyan">{{ record.dataType }}</a-tag></template>
                    </a-table-column>
                    <a-table-column title="覆盖率(%)" data-index="coverage" :width="180">
                      <template #cell="{ record }">
                        <a-progress :percent="record.coverage" :stroke-width="6" />
                        <span style="margin-left: 8px; font-size: 12px">{{ record.coverage }}%</span>
                      </template>
                    </a-table-column>
                    <a-table-column title="Owner" data-index="owner" :width="100" />
                    <a-table-column title="描述" data-index="description" />
                  </template>
                </a-table>
              </a-collapse-item>
            </a-collapse>
          </a-tab-pane>

          <a-tab-pane key="map" title="地图视图">
            <a-row :gutter="[16, 16]" style="margin-bottom: 16px">
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="特征总数" :value="variablesTotal" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="平均覆盖率" :value="avgCoverage" suffix="%" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="衍生特征" :value="derivedCount" /></a-card></a-col>
              <a-col :span="6"><a-card :bordered="false"><a-statistic title="枚举值" :value="enumCount" /></a-card></a-col>
            </a-row>

            <a-tabs default-active-key="all">
              <a-tab-pane v-for="t in types" :key="t.code" :title="`${t.name} (${t.variables.length})`">
                <a-row :gutter="[12, 12]">
                  <a-col :span="8" v-for="v in t.variables" :key="v.code">
                    <a-card hoverable :bordered="false" class="map-card" @click="focusVariableInfo = v; focusVariable = v.name">
                      <div class="map-card-row">
                        <a-tag color="cyan">{{ v.dataType }}</a-tag>
                        <a-tag color="purple">{{ v.code }}</a-tag>
                      </div>
                      <div class="map-card-name">{{ v.name }}</div>
                      <a-progress :percent="v.coverage" :stroke-width="6" style="margin: 8px 0" />
                      <div class="map-card-meta">
                        <span>Owner: {{ v.owner }}</span>
                      </div>
                      <div class="map-card-desc">{{ v.description }}</div>
                    </a-card>
                  </a-col>
                </a-row>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>
        </a-tabs>
      </a-card>

      <!-- 详情抽屉 -->
      <a-drawer :visible="!!focusVariableInfo" :title="focusVariableInfo?.name" :width="560" @cancel="closeDetail" @ok="closeDetail" :ok-text="'关闭'" :cancel-text="'关闭'">
        <a-descriptions v-if="focusVariableInfo" :column="1" size="medium" bordered>
          <a-descriptions-item label="编码">{{ focusVariableInfo.code }}</a-descriptions-item>
          <a-descriptions-item label="名称">{{ focusVariableInfo.name }}</a-descriptions-item>
          <a-descriptions-item label="数据类型"><a-tag color="cyan">{{ focusVariableInfo.dataType }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="覆盖率">{{ focusVariableInfo.coverage }}%</a-descriptions-item>
          <a-descriptions-item label="Owner">{{ focusVariableInfo.owner }}</a-descriptions-item>
          <a-descriptions-item label="描述">{{ focusVariableInfo.description || '-' }}</a-descriptions-item>
        </a-descriptions>
      </a-drawer>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import { VariableStore } from '@/mock-shared/dataset'

const router = useRouter()
const route = useRoute()
const viewMode = ref<'dict' | 'map'>('dict')

const focusVariable = ref<string>((route.query.name as string) || (route.query.code as string) || '')
const focusVariableInfo = ref<any>(null)
const keyword = ref('')

// 由公共 mock 派生:按 type 分组(字典视图 + 地图视图共用)
const types = ref(
  (() => {
    const all = VariableStore.all()
    const byType: Record<string, { name: string; variables: any[] }> = {}
    all.forEach(v => {
      const key = v.type
      if (!byType[key]) {
        byType[key] = {
          name:
            key === 'population' ? '人口属性' :
            key === 'behavior' ? '行为特征' :
            key === 'finance' ? '金融属性' :
            '风险特征',
          variables: []
        }
      }
      byType[key].variables.push({
        code: v.code,
        name: v.name,
        dataType: v.dataType,
        coverage: v.coverage,
        owner: v.owner,
        description: v.description
      })
    })
    return Object.entries(byType).map(([code, info]) => ({ code, ...info }))
  })()
)

// KPI
const flatVars = computed(() => types.value.flatMap(t => t.variables))
const variablesTotal = computed(() => flatVars.value.length)
const avgCoverage = computed(() => Math.round(flatVars.value.reduce((s, v) => s + v.coverage, 0) / Math.max(flatVars.value.length, 1)))
const derivedCount = computed(() => flatVars.value.filter(v => v.dataType === 'derived').length)
const enumCount = computed(() => flatVars.value.filter(v => v.dataType === 'enum').length)

function filtered(arr: any[]) {
  if (!keyword.value) return arr
  const k = keyword.value.toLowerCase()
  return arr.filter(f => f.name.toLowerCase().includes(k) || f.code.toLowerCase().includes(k))
}

function closeDetail() { focusVariableInfo.value = null }
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
.map-card-name { font-size: 15px; font-weight: 600; color: #1d2129; }
.map-card-meta { font-size: 12px; color: #86909c; margin-bottom: 8px; }
.map-card-desc {
  font-size: 12px;
  color: #4e5969;
  background: #f5f7fa;
  padding: 6px 8px;
  border-radius: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>