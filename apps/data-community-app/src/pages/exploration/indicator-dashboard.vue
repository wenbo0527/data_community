<template>
  <PageContainer>
    <PageHeader title="指标看板" sub-title="业务指标可视化、对比分析、趋势监控">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">
          <template #icon><icon-plus /></template>
          新建看板
        </a-button>
      </template>
    </PageHeader>

    <a-tabs default-active-key="overview">
      <!-- ===== 1. 总览 ===== -->
      <a-tab-pane key="overview" title="总览">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card>
              <a-statistic title="今日 DAU" :value="580000" :value-style="{ color: '#165dff' }" />
              <div class="trend up">↑ 3.2% 同比</div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="今日 GMV" :value="1280" suffix="万" :value-style="{ color: '#0fc6c2' }" />
              <div class="trend up">↑ 8.5% 同比</div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="今日新客" :value="3280" :value-style="{ color: '#722ed1' }" />
              <div class="trend up">↑ 12.1% 同比</div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="今日授信通过率" :value="68.5" :precision="2" suffix="%" :value-style="{ color: '#00b42a' }" />
              <div class="trend up">↑ 1.2pp</div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="12">
            <a-card title="DAU 趋势(近 7 天)">
              <div class="chart-area">
                <div v-for="(p, i) in dauTrend" :key="i" class="bar-row">
                  <div class="bar-label">{{ p.label }}</div>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: p.percent + '%' }">
                      <span class="bar-value">{{ p.value }}K</span>
                    </div>
                  </div>
                </div>
                <div class="chart-tip">最高 620K · 最低 540K · 平均 580K</div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="GMV 趋势(近 7 天)">
              <div class="chart-area">
                <div v-for="(p, i) in gmvTrend" :key="i" class="bar-row">
                  <div class="bar-label">{{ p.label }}</div>
                  <div class="bar-track">
                    <div class="bar-fill gmv" :style="{ width: p.percent + '%' }">
                      <span class="bar-value">¥{{ p.value }}万</span>
                    </div>
                  </div>
                </div>
                <div class="chart-tip">最高 ¥1,420 万 · 最低 ¥1,180 万 · 平均 ¥1,280 万</div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="12">
            <a-card title="渠道 GMV 占比">
              <div class="channel-row">
                <div v-for="c in channels" :key="c.name" class="channel-item">
                  <div class="channel-name">{{ c.name }}</div>
                  <div class="channel-bar"><div class="channel-fill" :style="{ width: c.share + '%', background: c.color }"></div></div>
                  <div class="channel-share">{{ c.share }}%</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="风控核心指标">
              <a-list size="small">
                <a-list-item v-for="(k, i) in kpis" :key="i">
                  <a-list-item-meta>
                    <template #title>{{ k.name }}</template>
                    <template #description>{{ k.value }} {{ k.trend }}</template>
                  </a-list-item-meta>
                  <a-tag :color="k.trend.startsWith('↑') ? 'green' : 'red'">{{ k.trend.split(' ')[0] }}</a-tag>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>

      <!-- ===== 2. 用户域 ===== -->
      <a-tab-pane key="user" title="用户域">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-card :title="`用户域指标(共 ${userMetrics.length} 个)`">
              <a-table :columns="metricColumns" :data="userMetrics" :pagination="{ pageSize: 8 }" row-key="code" size="small">
                <template #layer="{ record }">
                  <a-tag :color="layerColor(record.layer)">{{ record.layer }}</a-tag>
                </template>
                <template #type="{ record }">
                  <a-tag :color="record.type === 'atomic' ? 'arcoblue' : 'purple'">
                    {{ record.type === 'atomic' ? '原子' : '衍生' }}
                  </a-tag>
                </template>
                <template #currentValue="{ record }">
                  <strong>{{ mockValue(record) }}</strong>
                </template>
                <template #action="{ record }">
                  <a-link @click="openMetric(record)">下钻</a-link>
                </template>
              </a-table>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="用户域趋势">
              <div class="chart-area">
                <div v-for="(p, i) in dauTrend" :key="i" class="bar-row">
                  <div class="bar-label">{{ p.label }}</div>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: p.percent + '%' }">
                      <span class="bar-value">{{ p.value }}K</span>
                    </div>
                  </div>
                </div>
              </div>
              <a-divider />
              <div class="kpi-mini">
                <div><span class="lbl">DAU/MAU</span><strong>25.2%</strong></div>
                <div><span class="lbl">次日留存</span><strong>42.5%</strong></div>
                <div><span class="lbl">VIP 用户</span><strong>18,420</strong></div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>

      <!-- ===== 3. 交易域 ===== -->
      <a-tab-pane key="trade" title="交易域">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-card :title="`交易域指标(共 ${tradeMetrics.length} 个)`">
              <a-table :columns="metricColumns" :data="tradeMetrics" :pagination="{ pageSize: 8 }" row-key="code" size="small">
                <template #layer="{ record }">
                  <a-tag :color="layerColor(record.layer)">{{ record.layer }}</a-tag>
                </template>
                <template #type="{ record }">
                  <a-tag :color="record.type === 'atomic' ? 'arcoblue' : 'purple'">
                    {{ record.type === 'atomic' ? '原子' : '衍生' }}
                  </a-tag>
                </template>
                <template #currentValue="{ record }">
                  <strong>{{ mockValue(record) }}</strong>
                </template>
                <template #action="{ record }">
                  <a-link @click="openMetric(record)">下钻</a-link>
                </template>
              </a-table>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="交易域趋势">
              <div class="chart-area">
                <div v-for="(p, i) in gmvTrend" :key="i" class="bar-row">
                  <div class="bar-label">{{ p.label }}</div>
                  <div class="bar-track">
                    <div class="bar-fill gmv" :style="{ width: p.percent + '%' }">
                      <span class="bar-value">¥{{ p.value }}万</span>
                    </div>
                  </div>
                </div>
              </div>
              <a-divider />
              <div class="kpi-mini">
                <div><span class="lbl">客单价</span><strong>¥285</strong></div>
                <div><span class="lbl">退款率</span><strong>3.2%</strong></div>
                <div><span class="lbl">复购率</span><strong>34.8%</strong></div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>

      <!-- ===== 4. 风控域 ===== -->
      <a-tab-pane key="risk" title="风控域">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-card :title="`风控域指标(共 ${riskMetrics.length} 个)`">
              <a-table :columns="metricColumns" :data="riskMetrics" :pagination="{ pageSize: 8 }" row-key="code" size="small">
                <template #layer="{ record }">
                  <a-tag :color="layerColor(record.layer)">{{ record.layer }}</a-tag>
                </template>
                <template #type="{ record }">
                  <a-tag :color="record.type === 'atomic' ? 'arcoblue' : 'purple'">
                    {{ record.type === 'atomic' ? '原子' : '衍生' }}
                  </a-tag>
                </template>
                <template #currentValue="{ record }">
                  <strong>{{ mockValue(record) }}</strong>
                </template>
                <template #action="{ record }">
                  <a-link @click="openMetric(record)">下钻</a-link>
                </template>
              </a-table>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="风控指标">
              <a-list size="small">
                <a-list-item v-for="(k, i) in kpis" :key="i">
                  <a-list-item-meta>
                    <template #title>{{ k.name }}</template>
                    <template #description>{{ k.value }} {{ k.trend }}</template>
                  </a-list-item-meta>
                  <a-tag :color="k.trend.startsWith('↑') ? 'green' : 'red'">{{ k.trend.split(' ')[0] }}</a-tag>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>

      <!-- ===== 5. 营销域 ===== -->
      <a-tab-pane key="marketing" title="营销域">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-card :title="`营销域指标(共 ${marketingMetrics.length} 个)`">
              <a-table :columns="metricColumns" :data="marketingMetrics" :pagination="{ pageSize: 8 }" row-key="code" size="small">
                <template #layer="{ record }">
                  <a-tag :color="layerColor(record.layer)">{{ record.layer }}</a-tag>
                </template>
                <template #type="{ record }">
                  <a-tag :color="record.type === 'atomic' ? 'arcoblue' : 'purple'">
                    {{ record.type === 'atomic' ? '原子' : '衍生' }}
                  </a-tag>
                </template>
                <template #currentValue="{ record }">
                  <strong>{{ mockValue(record) }}</strong>
                </template>
                <template #action="{ record }">
                  <a-link @click="openMetric(record)">下钻</a-link>
                </template>
              </a-table>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="营销域核心">
              <div class="kpi-mini">
                <div><span class="lbl">首单转化率</span><strong>18.5%</strong></div>
                <div><span class="lbl">渠道 ROI</span><strong>3.2 倍</strong></div>
                <div><span class="lbl">券核销率</span><strong>62.4%</strong></div>
                <div><span class="lbl">触达成本</span><strong>¥0.42/人</strong></div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>
    </a-tabs>

    <!-- 指标下钻抽屉 -->
    <a-drawer
      v-model:visible="drawerVisible"
      :title="currentMetric ? `${currentMetric.name} · 下钻分析` : '指标下钻'"
      :width="640"
      :footer="false"
    >
      <template v-if="currentMetric">
        <a-descriptions :column="1" size="medium">
          <a-descriptions-item label="编码">{{ currentMetric.code }}</a-descriptions-item>
          <a-descriptions-item label="名称">{{ currentMetric.name }}</a-descriptions-item>
          <a-descriptions-item label="所属域">{{ currentMetric.domain }}</a-descriptions-item>
          <a-descriptions-item label="层级">{{ currentMetric.layer }} · {{ currentMetric.type === 'atomic' ? '原子指标' : '衍生指标' }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ currentMetric.owner }}</a-descriptions-item>
          <a-descriptions-item label="更新频率">{{ freqLabel(currentMetric.updateFrequency) }}</a-descriptions-item>
          <a-descriptions-item label="口径">
            <pre class="formula">{{ currentMetric.formula }}</pre>
          </a-descriptions-item>
          <a-descriptions-item v-if="currentMetric.tags?.length" label="标签">
            <a-tag v-for="t in currentMetric.tags" :key="t" color="green">{{ t }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
        <a-divider />
        <h4>最近 7 天趋势</h4>
        <div class="chart-area">
          <div v-for="(p, i) in dauTrend" :key="i" class="bar-row">
            <div class="bar-label">{{ p.label }}</div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: p.percent + '%' }">
                <span class="bar-value">{{ Math.round(p.value * 0.01) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </a-drawer>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { METRICS, type MetricItem } from '@/mock-shared/dataset'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'

const router = useRouter()

// 按域拆分(2026-08-06:用 dataset.ts 真实数据替换"占位文字")
const userMetrics = computed(() => METRICS.filter(m => m.domain === '用户域'))
const tradeMetrics = computed(() => METRICS.filter(m => m.domain === '交易域'))
const riskMetrics = computed(() => METRICS.filter(m => m.domain === '风控域'))
const marketingMetrics = computed(() => METRICS.filter(m => m.domain === '营销域'))

const metricColumns = [
  { title: '编码', dataIndex: 'code', width: 80 },
  { title: '名称', dataIndex: 'name', width: 160 },
  { title: '层级', dataIndex: 'layer', slotName: 'layer', width: 80 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 80 },
  { title: '当前值', dataIndex: 'currentValue', slotName: 'currentValue', width: 120 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '操作', slotName: 'action', width: 80, fixed: 'right' }
]

function layerColor(layer: string) {
  return ({ L1: 'arcoblue', L2: 'purple', L3: 'green', L4: 'orange' } as any)[layer] || 'gray'
}

// 根据指标 code 生成稳定的 mock 当前值
function mockValue(m: MetricItem) {
  const seed = m.code.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const base = (seed % 9000) + 1000
  if (m.unit === '%') return `${(base / 100).toFixed(2)}%`
  if (m.unit === '元') return `¥${base.toLocaleString()}`
  if (m.unit === '人') return base.toLocaleString()
  if (m.unit === '单') return `${base} 单`
  if (m.unit === '倍') return `${(base / 1000).toFixed(2)} 倍`
  return `${base.toLocaleString()} ${m.unit || ''}`
}

function freqLabel(f?: string) {
  return ({ daily: '日更新', hourly: '小时更新', realtime: '实时', weekly: '周更新', monthly: '月更新' } as any)[f || ''] || f || '日更新'
}

// 下钻抽屉
const drawerVisible = ref(false)
const currentMetric = ref<MetricItem | null>(null)
function openMetric(m: MetricItem) {
  currentMetric.value = m
  drawerVisible.value = true
}

// ===== 总览区数据 =====
const dauTrend = ref([
  { label: '周一', value: 552, percent: 89 },
  { label: '周二', value: 568, percent: 92 },
  { label: '周三', value: 575, percent: 93 },
  { label: '周四', value: 580, percent: 94 },
  { label: '周五', value: 620, percent: 100 },
  { label: '周六', value: 612, percent: 99 },
  { label: '周日', value: 580, percent: 94 }
])

const gmvTrend = ref([
  { label: '周一', value: 1180, percent: 83 },
  { label: '周二', value: 1220, percent: 86 },
  { label: '周三', value: 1250, percent: 88 },
  { label: '周四', value: 1290, percent: 91 },
  { label: '周五', value: 1420, percent: 100 },
  { label: '周六', value: 1380, percent: 97 },
  { label: '周日', value: 1280, percent: 90 }
])

const channels = ref([
  { name: 'APP', share: 45, color: '#165dff' },
  { name: '小程序', share: 30, color: '#0fc6c2' },
  { name: 'H5', share: 15, color: '#722ed1' },
  { name: '其他', share: 10, color: '#ff7d00' }
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
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
.dashboard-page {
  padding: 0 24px;

  .trend {
    margin-top: 8px;
    font-size: 12px;
    &.up { color: #00b42a; }
    &.down { color: #f53f3f; }
  }

  // ===== 简易柱状图(CSS 实现,无需引入 echarts) =====
  .chart-area {
    padding: 8px 0;
    .bar-row {
      display: flex;
      align-items: center;
      margin: 6px 0;
      font-size: 12px;

      .bar-label {
        width: 50px;
        color: #86909c;
        flex-shrink: 0;
      }
      .bar-track {
        flex: 1;
        height: 22px;
        background: #f2f3f5;
        border-radius: 2px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #165dff, #4080ff);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 8px;
        color: #fff;
        transition: width 0.3s;

        &.gmv {
          background: linear-gradient(90deg, #0fc6c2, #5cdbd3);
        }
      }
      .bar-value {
        font-size: 11px;
        white-space: nowrap;
      }
    }
    .chart-tip {
      color: #86909c;
      font-size: 12px;
      margin-top: 12px;
      text-align: center;
    }
  }

  // 渠道占比
  .channel-row {
    .channel-item {
      display: flex;
      align-items: center;
      margin: 8px 0;
      .channel-name { width: 60px; font-size: 13px; }
      .channel-bar { flex: 1; height: 8px; background: #f2f3f5; border-radius: 4px; overflow: hidden; }
      .channel-fill { height: 100%; }
      .channel-share { width: 50px; text-align: right; color: #1d2129; font-weight: 500; }
    }
  }

  // KPI 小卡片
  .kpi-mini {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    > div {
      background: #f7f8fa;
      border-radius: 4px;
      padding: 12px;
      text-align: center;
      .lbl { display: block; color: #86909c; font-size: 12px; margin-bottom: 4px; }
      strong { color: #1d2129; font-size: 16px; }
    }
  }

  // 指标口径
  .formula {
    background: #f2f3f5;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    margin: 0;
    color: #1d2129;
    white-space: pre-wrap;
  }
}
</style>