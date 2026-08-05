<template>
  <div class="dashboard-page">
    <a-page-header title="指标看板" sub-title="业务指标可视化、对比分析、趋势监控">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">
          <template #icon><icon-plus /></template>
          新建看板
        </a-button>
      </template>
    </a-page-header>

    <a-tabs default-active-key="overview">
      <a-tab-pane key="overview" title="总览">
        <a-row :gutter="16">
          <a-col :span="6"><a-card><a-statistic title="今日 DAU" :value="580000" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="今日 GMV" :value="1280" suffix="万" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="今日新客" :value="3280" /></a-card></a-col>
          <a-col :span="6"><a-card><a-statistic title="今日授信通过率" :value="68.5" :precision="2" suffix="%" /></a-card></a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="12">
            <a-card title="DAU 趋势(近 7 天)">
              <div class="chart-placeholder">
                <p>📈</p>
                <p>DAU: 580K(+3.2%)</p>
                <p style="font-size: 12px; color: #86909c">最高 620K · 最低 540K · 平均 580K</p>
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="GMV 趋势(近 7 天)">
              <div class="chart-placeholder">
                <p>📊</p>
                <p>GMV: ¥1,280 万(+8.5%)</p>
                <p style="font-size: 12px; color: #86909c">最高 ¥1,420 万 · 最低 ¥1,180 万 · 平均 ¥1,280 万</p>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="12">
            <a-card title="渠道 GMV 占比">
              <a-row>
                <a-col :span="12">
                  <div class="chart-placeholder">
                    <p>🥧</p>
                    <p>APP: 45% · 小程序: 30% · H5: 15% · 其他: 10%</p>
                  </div>
                </a-col>
                <a-col :span="12">
                  <a-list size="small">
                    <a-list-item v-for="(c, i) in channels" :key="i">
                      <a-list-item-meta>
                        <template #title>{{ c.name }}</template>
                        <template #description>GMV {{ c.amount }} · 占比 {{ c.share }}%</template>
                      </a-list-item-meta>
                    </a-list-item>
                  </a-list>
                </a-col>
              </a-row>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="风控指标">
              <a-list size="small">
                <a-list-item v-for="(k, i) in kpis" :key="i">
                  <a-list-item-meta>
                    <template #title>{{ k.name }}</template>
                    <template #description>{{ k.value }} {{ k.trend }}</template>
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>

      <a-tab-pane key="user" title="用户域">用户域指标</a-tab-pane>
      <a-tab-pane key="trade" title="交易域">交易域指标</a-tab-pane>
      <a-tab-pane key="risk" title="风控域">风控域指标</a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const channels = ref([
  { name: 'APP', amount: '¥576 万', share: 45 },
  { name: '小程序', amount: '¥384 万', share: 30 },
  { name: 'H5', amount: '¥192 万', share: 15 },
  { name: '其他', amount: '¥128 万', share: 10 }
])

const kpis = ref([
  { name: 'Vintage 30+ 逾期率', value: '2.35%', trend: '↓ 0.18pp (同比)' },
  { name: '授信通过率', value: '68.5%', trend: '↑ 1.2pp' },
  { name: '首逾率(FPD30)', value: '1.85%', trend: '↓ 0.05pp' },
  { name: '回收率(30天)', value: '92.5%', trend: '↑ 0.8pp' }
])

const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  .chart-placeholder {
    padding: 40px 16px;
    text-align: center;
    background: #fafbfc;
    border-radius: 4px;
    p { margin: 8px 0; font-size: 16px; }
    p:first-child { font-size: 36px; }
  }
}
</style>