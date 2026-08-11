<template>
  <PageContainer>
    <PageHeader title="我的关注" sub-title="收藏的资产 / 关注的指标 / 申请过的字段 · 一站式查看">
      <template #extra>
        <a-button @click="goOverview">
          <template #icon><icon-storage /></template>
          返回数据总览
        </a-button>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <!-- 顶部统计(2026-08-06:从 FavoriteStore 派生) -->
      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="总关注" :value="allItems.length" :value-style="{ color: '#165dff' }" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="变更通知订阅" :value="notifyCount" :value-style="{ color: '#f53f3f' }" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="团队共享" :value="groupCount.team" :value-style="{ color: '#722ed1' }" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="近 7 天访问" :value="recentVisitCount" :value-style="{ color: '#00b42a' }" />
        </a-col>
      </a-row>

      <a-tabs default-active-key="all" v-model:activeKey="activeTab">
        <a-tab-pane v-for="t in tabs" :key="t.code" :title="`${t.name} (${t.items.length})`">
          <a-card :bordered="false">
            <a-list :data="t.items" size="medium">
              <template #item="{ item }">
                <a-list-item class="fav-row">
                  <a-space>
                    <a-tag :color="typeColor(item.resourceType)">{{ typeLabel(item.resourceType) }}</a-tag>
                    <a-link @click="goItem(item)">{{ item.resourceName }}</a-link>
                    <a-tag size="small">{{ item.resourceId }}</a-tag>
                    <a-tag v-for="tag in item.tags" :key="tag" size="small">{{ tag }}</a-tag>
                  </a-space>
                  <a-space>
                    <a-tag :color="groupColor(item.group)" size="small">{{ groupLabel(item.group) }}</a-tag>
                    <a-tag :color="notifColor(item.notification)" size="small">{{ notifLabel(item.notification) }}</a-tag>
                    <span class="meta">访问 {{ item.visitCount }} 次 · {{ item.lastVisitTime }}</span>
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
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import {
  FavoriteStore,
  FAVORITE_TYPES,
  FAVORITE_GROUP_LABEL,
  FAVORITE_GROUP_COLOR,
  FAVORITE_NOTIFICATION_LABEL,
  FAVORITE_NOTIFICATION_COLOR,
  type FavoriteItem,
  type FavoriteResourceType
} from '@/mock-shared/favorite-store'

const router = useRouter()
const activeTab = ref<string>('all')

// 2026-08-06:全部接 FavoriteStore,统一数据源
const allItems = computed(() => FavoriteStore.mine())

const tabs = computed(() => {
  const groups: { code: string; name: string; items: FavoriteItem[] }[] = [{ code: 'all', name: '全部', items: allItems.value }]
  FAVORITE_TYPES.forEach(t => {
    const items = allItems.value.filter(f => f.resourceType === t.value)
    groups.push({ code: t.value, name: t.label, items })
  })
  return groups.filter(g => g.code === 'all' || g.items.length > 0 || ['metric', 'variable', 'feature', 'api', 'table'].includes(g.code))
})

const groupCount = computed(() => ({
  team: allItems.value.filter(f => f.group === 'team').length,
  personal: allItems.value.filter(f => f.group === 'personal').length,
  shared: allItems.value.filter(f => f.group === 'shared').length
}))

const notifyCount = computed(() => allItems.value.filter(f => f.notification === 'on_change').length)

const recentVisitCount = computed(() => allItems.value.filter(f => f.lastVisitTime.includes('今天') || f.lastVisitTime.includes('昨天') || f.lastVisitTime.includes('刚刚') || /\d+\s*天前/.test(f.lastVisitTime)).length)

function typeColor(t: FavoriteResourceType) {
  return FAVORITE_TYPES.find(x => x.value === t)?.color || 'gray'
}
function typeLabel(t: FavoriteResourceType) {
  return FAVORITE_TYPES.find(x => x.value === t)?.label || t
}
function groupColor(g: string) {
  return FAVORITE_GROUP_COLOR[g as keyof typeof FAVORITE_GROUP_COLOR] || 'gray'
}
function groupLabel(g: string) {
  return FAVORITE_GROUP_LABEL[g as keyof typeof FAVORITE_GROUP_LABEL] || g
}
function notifColor(n: string) {
  return FAVORITE_NOTIFICATION_COLOR[n as keyof typeof FAVORITE_NOTIFICATION_COLOR] || 'gray'
}
function notifLabel(n: string) {
  return FAVORITE_NOTIFICATION_LABEL[n as keyof typeof FAVORITE_NOTIFICATION_LABEL] || n
}

function goItem(item: FavoriteItem) {
  FavoriteStore.visit(item.id)
  if (item.resourcePath) {
    const p = item.resourcePath.startsWith('/') ? item.resourcePath.substring(1) : item.resourcePath
    router.push(p)
  }
}

function goOverview() {
  router.push('discovery/overview')
}

function unfollow(item: FavoriteItem) {
  const ok = FavoriteStore.remove(item.id)
  if (ok) Message.success(`已取消关注「${item.resourceName}」`)
}
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度由 PageContainer 提供 */
.content-wrapper { padding: 0 24px 24px; }
.stat-row { margin-bottom: 16px; }
.fav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .meta { font-size: 12px; color: #86909c; }
}
</style>