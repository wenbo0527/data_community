<template>
  <div class="asset-overview-page">
    <a-page-header title="资产概览" sub-title="数据资产总量、增长趋势、治理质量大盘">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary">
          <template #icon><icon-download /></template>导出报告
        </a-button>
      </template>
    </a-page-header>

    <!-- 关键指标卡片 -->
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card>
          <a-statistic title="资产总数" :value="1247">
            <template #suffix>张表</template>
          </a-statistic>
          <div style="color: #00b42a; font-size: 12px; margin-top: 4px">↑ 12.3% (近 30 天)</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="字段总数" :value="18420">
            <template #suffix>个</template>
          </a-statistic>
          <div style="color: #00b42a; font-size: 12px; margin-top: 4px">↑ 8.5% (近 30 天)</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已建模字段" :value="13820">
            <template #suffix>个 ({{ 75 }}%)</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="平均质量分" :value="86.5" :precision="1">
            <template #suffix>/ 100</template>
          </a-statistic>
          <div style="color: #00b42a; font-size: 12px; margin-top: 4px">↑ 2.1 (近 30 天)</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 业务域分布 + 资产增长趋势 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card :bordered="false" title="业务域资产分布">
          <a-row>
            <a-col :span="14">
              <div class="chart-placeholder">
                <p>📊</p>
                <p>用户域: 28% · 交易域: 22% · 风控域: 18% · 营销域: 12% · 运营域: 8% · 其他: 12%</p>
                <p style="font-size: 12px; color: #86909c">总表数: 1247</p>
              </div>
            </a-col>
            <a-col :span="10">
              <a-list size="small">
                <a-list-item v-for="(d, i) in domainDistribution" :key="i">
                  <a-list-item-meta>
                    <template #title>
                      <span :style="{ color: d.color }">●</span> {{ d.name }}
                    </template>
                    <template #description>{{ d.count }} 张表 · {{ d.share }}%</template>
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" title="资产增长趋势(近 12 个月)">
          <div class="chart-placeholder">
            <p>📈</p>
            <p>资产总数: 1247 (+42.3% YoY)</p>
            <p style="font-size: 12px; color: #86909c">月均新增 35 张表 · 月均下架 12 张</p>
            <p style="font-size: 12px; color: #86909c">峰值: 2025-05(125 张新增)</p>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 资产质量分布 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card :bordered="false" title="资产质量分布">
          <a-row>
            <a-col :span="12">
              <div class="chart-placeholder">
                <p>🎯</p>
                <p>高质量(≥90): 35%</p>
                <p>中等质量(60-89): 48%</p>
                <p>低质量(&lt;60): 17%</p>
              </div>
            </a-col>
            <a-col :span="12">
              <a-list size="small">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>高风险资产 Top 10</template>
                  </a-list-item-meta>
                </a-list-item>
                <a-list-item v-for="t in lowQualityTables" :key="t.name">
                  <a-link>{{ t.name }}</a-link>
                  <span style="float: right; color: #f53f3f">{{ t.score }}</span>
                </a-list-item>
              </a-list>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card :bordered="false" title="Owner 排行">
          <a-list size="small">
            <a-list-item v-for="(o, i) in ownerRanking" :key="i">
              <a-list-item-meta>
                <template #avatar>
                  <a-avatar :style="{ background: o.color }">{{ o.initial }}</a-avatar>
                </template>
                <template #title>{{ o.name }}<a-tag size="small" style="margin-left: 8px">{{ o.role }}</a-tag></template>
                <template #description>{{ o.tableCount }} 张表 · 质量分 {{ o.avgScore }} · 已建模 {{ o.modeledRate }}%</template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- 待办事项 -->
    <a-card :bordered="false" title="待办事项" style="margin-top: 16px">
      <a-list>
        <a-list-item v-for="(t, i) in todos" :key="i">
          <a-list-item-meta>
            <template #avatar>
              <a-avatar :style="{ background: t.color }">{{ t.icon }}</a-avatar>
            </template>
            <template #title>
              <strong>{{ t.title }}</strong>
              <a-tag size="small" :color="t.priorityColor" style="margin-left: 8px">{{ t.priority }}</a-tag>
            </template>
            <template #description>{{ t.desc }} · {{ t.count }} 项</template>
          </a-list-item-meta>
        </a-list-item>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const domainDistribution = ref([
  { name: '用户域', count: 349, share: 28, color: '#165dff' },
  { name: '交易域', count: 274, share: 22, color: '#00b42a' },
  { name: '风控域', count: 224, share: 18, color: '#f53f3f' },
  { name: '营销域', count: 150, share: 12, color: '#ff7d00' },
  { name: '运营域', count: 100, share: 8, color: '#722ed1' },
  { name: '其他', count: 150, share: 12, color: '#86909c' }
])

const lowQualityTables = ref([
  { name: 'ods_raw_log_2018', score: 32 },
  { name: 'dwd_event_buried_temp', score: 45 },
  { name: 'dws_aggregation_old', score: 52 },
  { name: 'fact_external_test', score: 55 },
  { name: 'dwd_legacy_2020', score: 58 }
])

const ownerRanking = ref([
  { initial: '王', name: '王运营', role: '数据负责人', color: '#165dff', tableCount: 320, avgScore: 88.5, modeledRate: 85 },
  { initial: '张', name: '张风控', role: '风控负责人', color: '#f53f3f', tableCount: 224, avgScore: 92.1, modeledRate: 90 },
  { initial: '李', name: '李产品', role: '产品负责人', color: '#00b42a', tableCount: 180, avgScore: 81.3, modeledRate: 70 },
  { initial: '陈', name: '陈营销', role: '营销负责人', color: '#ff7d00', tableCount: 150, avgScore: 85.6, modeledRate: 78 },
  { initial: '赵', name: '赵技术', role: '技术负责人', color: '#722ed1', tableCount: 95, avgScore: 79.2, modeledRate: 65 }
])

const todos = ref([
  { icon: '⚠', color: '#f53f3f', title: '17 张低质量资产需治理', priority: 'P0', priorityColor: 'red', desc: '质量分 < 60', count: 17 },
  { icon: '📝', color: '#ff7d00', title: '142 个未建模字段', priority: 'P1', priorityColor: 'orange', desc: '需补充业务含义和标签', count: 142 },
  { icon: '🔄', color: '#165dff', title: '8 个数据源元数据待更新', priority: 'P1', priorityColor: 'orange', desc: '超过 30 天未更新', count: 8 },
  { icon: '📊', color: '#722ed1', title: '12 个指标口径待确认', priority: 'P2', priorityColor: 'gray', desc: '与业务方需对齐', count: 12 }
])

const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.asset-overview-page {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;

  .chart-placeholder {
    padding: 40px 16px;
    text-align: center;
    background: #fafbfc;
    border-radius: 4px;
    p { margin: 8px 0; font-size: 14px; }
    p:first-child { font-size: 36px; }
  }
}
</style>