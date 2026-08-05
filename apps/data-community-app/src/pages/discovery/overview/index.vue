<template>
  <div class="discovery-overview-page">
    <a-page-header title="数据总览" sub-title="所有录入数据的统一看板 · 资源 / 资产 / 要素 一目了然" :back="false" />

    <div class="content-wrapper">
      <!-- 顶部:核心指标 -->
      <a-row :gutter="[16, 16]" class="kpi-row">
        <a-col :span="6">
          <a-card :bordered="false" class="kpi-card">
            <a-statistic title="数据资源(原始)" :value="resourceStats.total" :value-style="{ color: '#165dff' }">
              <template #suffix>个</template>
            </a-statistic>
            <div class="kpi-sub">接入中 {{ resourceStats.online }} · 接入中暂未上线 {{ resourceStats.offline }}</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="kpi-card">
            <a-statistic title="数据资产(治理后)" :value="assetStats.total" :value-style="{ color: '#722ed1' }">
              <template #suffix>个</template>
            </a-statistic>
            <div class="kpi-sub">已采集 {{ assetStats.collected }} · 待治理 {{ assetStats.pending }}</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="kpi-card">
            <a-statistic title="数据要素(业务形态)" :value="elementStats.total" :value-style="{ color: '#00b42a' }">
              <template #suffix>条</template>
            </a-statistic>
            <div class="kpi-sub">指标 {{ elementStats.metric }} · 变量 {{ elementStats.variable }} · 特征 {{ elementStats.feature }}</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="kpi-card">
            <a-statistic title="我关注的" :value="favorites.length" :value-style="{ color: '#f53f3f' }">
              <template #suffix>个</template>
            </a-statistic>
            <div class="kpi-sub">收藏 + 关注 + 申请记录</div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 中部:三大分类明细 -->
      <a-row :gutter="[16, 16]" style="margin-top: 16px">
        <a-col :span="8">
          <a-card title="📥 数据资源" :bordered="false" hoverable @click="goResource" class="category-card">
            <a-list :data="resourceList" size="small">
              <template #cell="{ item }">
                <a-list-item class="category-item" @click="goItem(item.path)">
                  <a-space>
                    <a-tag :color="item.color">{{ item.typeLabel }}</a-tag>
                    <span>{{ item.name }}</span>
                    <a-tag size="small">{{ item.count }}</a-tag>
                  </a-space>
                </a-list-item>
              </template>
            </a-list>
            <div class="footer-action">
              <a-link @click="goResource">查看全部数据资源 →</a-link>
            </div>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card title="🏛️ 数据资产" :bordered="false" hoverable @click="goAsset" class="category-card">
            <a-list :data="assetList" size="small">
              <template #cell="{ item }">
                <a-list-item class="category-item" @click="goItem(item.path)">
                  <a-space>
                    <a-tag :color="item.color">{{ item.domain }}</a-tag>
                    <span>{{ item.name }}</span>
                    <a-tag size="small">{{ item.tableCount }}</a-tag>
                  </a-space>
                </a-list-item>
              </template>
            </a-list>
            <div class="footer-action">
              <a-link @click="goAsset">查看全部数据资产 →</a-link>
            </div>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card title="✨ 数据要素" :bordered="false" hoverable @click="goElement" class="category-card">
            <a-tabs default-active-key="metric">
              <a-tab-pane v-for="t in elementTabs" :key="t.code" :title="`${t.name} (${t.items.length})`">
                <a-list :data="t.items" size="small">
                  <template #cell="{ item }">
                    <a-list-item class="category-item" @click="goItem(item.path)">
                      <a-space>
                        <a-tag :color="t.color">{{ item.code }}</a-tag>
                        <span>{{ item.name }}</span>
                      </a-space>
                    </a-list-item>
                  </template>
                </a-list>
              </a-tab-pane>
            </a-tabs>
            <div class="footer-action">
              <a-link @click="goElement">查看全部数据要素 →</a-link>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 底部:关注 + 最近浏览 -->
      <a-row :gutter="[16, 16]" style="margin-top: 16px">
        <a-col :span="12">
          <a-card title="⭐ 我的关注" :bordered="false" class="bottom-card">
            <template #extra>
              <a-space>
                <a-button size="small" @click="goFavorite">前往关注中心</a-button>
              </a-space>
            </template>
            <a-list :data="favorites" size="small">
              <template #cell="{ item }">
                <a-list-item class="favorite-item" @click="goItem(item.path)">
                  <a-space>
                    <a-tag :color="typeColor(item.type)">{{ typeLabel(item.type) }}</a-tag>
                    <span>{{ item.name }}</span>
                  </a-space>
                  <a-tag size="small">{{ item.owner }}</a-tag>
                </a-list-item>
              </template>
            </a-list>
            <a-empty v-if="favorites.length === 0" description="还没有关注的数据" />
          </a-card>
        </a-col>

        <a-col :span="12">
          <a-card title="🕒 最近浏览" :bordered="false" class="bottom-card">
            <a-list :data="recentlyViewed" size="small">
              <template #cell="{ item }">
                <a-list-item class="favorite-item" @click="goItem(item.path)">
                  <a-space>
                    <a-tag color="gray">{{ item.type }}</a-tag>
                    <span>{{ item.name }}</span>
                  </a-space>
                  <span class="view-time">{{ item.time }}</span>
                </a-list-item>
              </template>
            </a-list>
            <a-empty v-if="recentlyViewed.length === 0" description="还没有浏览记录" />
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiStore, MetricStore, VariableStore, FeatureStore, CollectionStore } from '../../../mock/shared/dataset'

const router = useRouter()

// 顶部 KPI(全部由 mock 实时统计,无硬编码)
const resourceStats = computed(() => ({
  total: ApiStore.all().length,
  online: ApiStore.all().filter(a => a.monthlyCalls > 500000).length,
  offline: ApiStore.all().filter(a => a.monthlyCalls <= 500000).length
}))

const assetStats = computed(() => {
  const cols = CollectionStore.all()
  return {
    total: cols.length,
    collected: cols.filter(c => c.tableCount > 100).length,
    pending: cols.filter(c => c.tableCount <= 100).length
  }
})

const elementStats = computed(() => ({
  total: MetricStore.all().length + VariableStore.all().length + FeatureStore.all().length,
  metric: MetricStore.all().length,
  variable: VariableStore.all().length,
  feature: FeatureStore.all().length
}))

// 中部三分类明细
const resourceList = computed(() => ApiStore.all().map(a => ({
  id: a.id,
  name: a.name,
  typeLabel: a.categoryLabel,
  color: a.category === 'user' ? 'arcoblue' : a.category === 'risk' ? 'red' : a.category === 'marketing' ? 'orange' : 'green',
  count: Math.round(a.monthlyCalls / 10000) + '万',
  path: 'discovery/api-market'
})))

const assetList = computed(() => CollectionStore.all().map(c => ({
  id: c.id,
  name: c.name,
  domain: c.type,
  tableCount: c.tableCount + '张',
  path: `discovery/data-map/collection/${c.id}`
})))

const elementTabs = computed(() => {
  const metrics = MetricStore.all().slice(0, 5).map(m => ({ code: m.code, name: m.name, path: `discovery/indicator-dict` }))
  const variables = VariableStore.all().slice(0, 5).map(v => ({ code: v.code, name: v.name, path: `discovery/variable-dict` }))
  const features = FeatureStore.all().slice(0, 5).map(f => ({ code: f.code, name: f.name, path: `discovery/feature-dict` }))
  return [
    { code: 'metric', name: '指标', items: metrics, color: 'arcoblue' },
    { code: 'variable', name: '变量', items: variables, color: 'green' },
    { code: 'feature', name: '特征', items: features, color: 'purple' }
  ]
})

// 底部关注 / 浏览(走 mock,后续接 favorites store)
const favorites = ref([
  { name: 'DAU 指标', type: 'metric', owner: '王运营', path: 'discovery/unified-metrics' },
  { name: '贷前分析 集合', type: 'asset', owner: '王运营', path: 'discovery/data-map/collection/1' },
  { name: '用户画像查询 API', type: 'api', owner: '王运营', path: 'discovery/api-market' },
  { name: '信用分 变量', type: 'variable', owner: '张风控', path: 'discovery/variable-dict' }
])
const recentlyViewed = ref([
  { name: 'DAU', type: 'metric', time: '5 分钟前', path: 'discovery/unified-metrics' },
  { name: 'dwd_贷款_0042', type: 'table', time: '20 分钟前', path: 'discovery/data-map' },
  { name: 'getCreditScore', type: 'api', time: '1 小时前', path: 'discovery/api-market' }
])

function typeColor(t: string) {
  return { metric: 'arcoblue', variable: 'green', feature: 'purple', asset: 'purple', api: 'orange' }[t] || 'gray'
}
function typeLabel(t: string) {
  return { metric: '指标', variable: '变量', feature: '特征', asset: '资产', api: 'API' }[t] || t
}

// 跳转入口
function goItem(path: string) { router.push(path) }
function goResource() { router.push('discovery/data-resources') }
function goAsset() { router.push('discovery/asset-catalog') }
function goElement() { router.push('discovery/indicator-dict') }
function goFavorite() { router.push('management/favorites') }
</script>

<style lang="scss" scoped>
.discovery-overview-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }

.kpi-card {
  .kpi-sub { font-size: 12px; color: #86909c; margin-top: 4px; }
}

.category-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); }
  .footer-action { text-align: right; margin-top: 12px; }
  .category-item { cursor: pointer; transition: background 0.2s; }
  .category-item:hover { background: #f5f7fa; }
}

.bottom-card {
  .favorite-item {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
  }
  .favorite-item:hover { background: #f5f7fa; }
  .view-time { font-size: 12px; color: #86909c; }
}
</style>