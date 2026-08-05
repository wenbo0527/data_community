<template>
  <div class="discovery-favorites-page">
    <a-page-header title="我的关注" sub-title="收藏的资产 / 关注的指标 / 申请过的字段 · 一站式查看" :back="false">
      <template #extra>
        <a-button @click="goOverview">
          <template #icon><icon-storage /></template>
          返回数据总览
        </a-button>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-tabs default-active-key="all" v-model:activeKey="activeTab">
        <a-tab-pane v-for="t in tabs" :key="t.code" :title="`${t.name} (${t.items.length})`">
          <a-card :bordered="false">
            <a-list :data="t.items" size="medium">
              <template #cell="{ item }">
                <a-list-item class="fav-row">
                  <a-space>
                    <a-tag :color="typeColor(item.type)">{{ typeLabel(item.type) }}</a-tag>
                    <a-link @click="goItem(item.path)">{{ item.name }}</a-link>
                    <a-tag size="small">{{ item.code }}</a-tag>
                  </a-space>
                  <a-space>
                    <span class="meta">关注于 {{ item.followedAt }}</span>
                    <a-tag size="small">Owner: {{ item.owner }}</a-tag>
                    <a-button type="text" size="small" status="danger" @click="unfollow(item)">取消关注</a-button>
                  </a-space>
                </a-list-item>
              </template>
            </a-list>
            <a-empty v-if="t.items.length === 0" :description="`还没有关注的${t.name}`" />
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { ApiStore, MetricStore, VariableStore, FeatureStore } from '../../../mock/shared/dataset'

const router = useRouter()
const activeTab = ref('all')

// 由公共 mock 派生的关注列表,真实环境应走 favorites store
const followings = ref([
  { name: 'DAU', code: 'M001', type: 'metric', owner: '王运营', path: 'discovery/unified-metrics', followedAt: '2026-08-01' },
  { name: '首逾率', code: 'M020', type: 'metric', owner: '张风控', path: 'discovery/indicator-dict', followedAt: '2026-07-25' },
  { name: 'GMV', code: 'M010', type: 'metric', owner: '李产品', path: 'discovery/indicator-dict', followedAt: '2026-07-18' },
  { name: '信用分', code: 'V301', type: 'variable', owner: '张风控', path: 'discovery/variable-dict', followedAt: '2026-08-03' },
  { name: '近30天活跃天数', code: 'V101', type: 'variable', owner: '王运营', path: 'discovery/variable-dict', followedAt: '2026-07-30' },
  { name: '设备指纹风险分', code: 'F005', type: 'feature', owner: '数美', path: 'discovery/feature-dict', followedAt: '2026-07-15' },
  { name: '用户RFM分层', code: 'F003', type: 'feature', owner: '陈营销', path: 'discovery/feature-dict', followedAt: '2026-07-10' },
  { name: '用户画像查询', code: 'A001', type: 'api', owner: '王运营', path: 'discovery/api-market', followedAt: '2026-08-02' },
  { name: '授信查询', code: 'A002', type: 'api', owner: '张风控', path: 'discovery/api-market', followedAt: '2026-07-22' },
  { name: '贷前分析 集合', code: '1', type: 'asset', owner: '王运营', path: 'discovery/data-map/collection/1', followedAt: '2026-08-04' }
])

const tabs = computed(() => {
  const groups: Record<string, { name: string; items: any[] }> = {
    all: { name: '全部', items: followings.value },
    metric: { name: '指标', items: followings.value.filter(i => i.type === 'metric') },
    variable: { name: '变量', items: followings.value.filter(i => i.type === 'variable') },
    feature: { name: '特征', items: followings.value.filter(i => i.type === 'feature') },
    api: { name: 'API', items: followings.value.filter(i => i.type === 'api') },
    asset: { name: '资产', items: followings.value.filter(i => i.type === 'asset') }
  }
  return Object.entries(groups).map(([code, info]) => ({ code, ...info }))
})

function typeColor(t: string) {
  return { metric: 'arcoblue', variable: 'green', feature: 'purple', api: 'orange', asset: 'purple' }[t] || 'gray'
}
function typeLabel(t: string) {
  return { metric: '指标', variable: '变量', feature: '特征', api: 'API', asset: '资产' }[t] || t
}

function goItem(path: string) { router.push(path) }
function goOverview() { router.push('discovery/overview') }

function unfollow(item: any) {
  const idx = followings.value.findIndex(i => i.code === item.code && i.type === item.type)
  if (idx > -1) {
    followings.value.splice(idx, 1)
    Message.success(`已取消关注「${item.name}」`)
  }
}
</script>

<style lang="scss" scoped>
.discovery-favorites-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }
.fav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .meta { font-size: 12px; color: #86909c; }
}
</style>