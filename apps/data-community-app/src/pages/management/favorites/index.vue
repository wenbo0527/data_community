<template>
  <div class="favorites-page">
    <a-page-header
      title="我的收藏"
      sub-title="跨模块资产收藏 — 表/字段/指标/标签/人群/看板/服务/API/报表"
      :back="false"
    >
      <template #extra>
        <a-segmented
          v-model="viewMode"
          :options="[
            { label: '列表', value: 'list' },
            { label: '分组', value: 'group' },
            { label: '统计', value: 'stats' }
          ]"
        />
      </template>
    </a-page-header>

    <!-- 顶部统计 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-statistic title="总收藏" :value="myFavorites.length" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="个人" :value="groupCount.personal" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="团队" :value="groupCount.team" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="共享" :value="groupCount.shared" />
      </a-col>
    </a-row>

    <!-- 筛选 -->
    <a-row :gutter="16" class="filter-row">
      <a-col :span="8">
        <a-select v-model="filterGroup" placeholder="按分组筛选" allow-clear style="width: 100%;" :options="[
          { label: '个人', value: 'personal' },
          { label: '团队', value: 'team' },
          { label: '共享', value: 'shared' }
        ]" />
      </a-col>
      <a-col :span="8">
        <a-select v-model="filterType" placeholder="按资源类型筛选" allow-clear style="width: 100%;" :options="resourceTypeOptions" />
      </a-col>
      <a-col :span="8">
        <a-input-search v-model="keyword" placeholder="搜索收藏名称" />
      </a-col>
    </a-row>

    <!-- 内容 -->
    <!-- 1. 列表模式 -->
    <div v-if="viewMode === 'list'">
      <a-empty v-if="filteredFavorites.length === 0" description="暂无收藏" />
      <a-table
        v-else
        :data="filteredFavorites"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="资源" data-index="resourceName">
            <template #cell="{ record }">
              <div class="resource-cell">
                <a-link @click="onVisit(record)">
                  {{ record.resourceName }}
                </a-link>
                <a-tag size="small">{{ resourceTypeName(record.resourceType) }}</a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="Owner" data-index="userName" :width="120" />
          <a-table-column title="分组" data-index="group" :width="100">
            <template #cell="{ record }">
              <a-tag :color="groupColor(record.group)" size="small">{{ groupName(record.group) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="标签" :width="200">
            <template #cell="{ record }">
              <a-tag v-for="tag in record.tags" :key="tag" size="small" style="margin-right: 4px;">{{ tag }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="通知" data-index="notification" :width="100">
            <template #cell="{ record }">
              <a-tag size="small" :color="notificationColor(record.notification)">
                {{ notificationLabel(record.notification) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="访问次数" data-index="visitCount" :width="100" sortable />
          <a-table-column title="最后访问" data-index="lastVisitTime" :width="140" />
          <a-table-column title="操作" :width="120">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="onVisit(record)">访问</a-button>
              <a-button type="text" size="small" status="danger" @click="onRemove(record)">取消</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 2. 分组模式 -->
    <div v-else-if="viewMode === 'group'">
      <a-collapse :default-active-key="['team', 'personal', 'shared']">
        <a-collapse-item v-for="group in groups" :key="group.key" :header="`${group.label} (${group.items.length})`">
          <a-row :gutter="16">
            <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
              <a-card class="fav-card" hoverable @click="onVisit(item)">
                <div class="fav-card-header">
                  <component :is="resourceIcon(item.resourceType)" class="fav-icon" />
                  <a-link>{{ item.resourceName }}</a-link>
                </div>
                <div class="fav-card-meta">
                  <a-tag size="small">{{ resourceTypeName(item.resourceType) }}</a-tag>
                  <span class="visit-count">{{ item.visitCount }} 次访问</span>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </a-collapse-item>
      </a-collapse>
    </div>

    <!-- 3. 统计模式 -->
    <div v-else-if="viewMode === 'stats'">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="按资源类型分布">
            <div v-for="(count, type) in typeCount" :key="type" class="stat-bar">
              <div class="stat-bar-label">{{ resourceTypeName(type) }}</div>
              <a-progress :percent="(count / myFavorites.length) * 100" :show-text="false" />
              <div class="stat-bar-value">{{ count }}</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="访问 Top 5">
            <a-list :data="topFavorites" size="small">
              <template #item="item">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <a-link @click="onVisit(item.item)">{{ item.item.resourceName }}</a-link>
                    </template>
                    <template #description>
                      <span class="visit-count">{{ item.item.visitCount }} 次 · {{ item.item.lastVisitTime }}</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconStorage,
  IconDesktop,
  IconBranch,
  IconTags,
  IconUserGroup,
  IconCalendar,
  IconCode,
  IconFile,
  IconDashboard
} from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import { FavoriteStore } from '@/mock/shared/favorite-directory'

const router = useRouter()

const viewMode = ref<'list' | 'group' | 'stats'>('list')
const filterGroup = ref<string | undefined>(undefined)
const filterType = ref<string | undefined>(undefined)
const keyword = ref<string>('')

// 当前用户(可从 useUserStore 取,这里写死方便测试)
const currentUserId = ref('user-yunying')

const myFavorites = computed(() => FavoriteStore.byUser(currentUserId.value))

const filteredFavorites = computed(() => {
  let list = myFavorites.value
  if (filterGroup.value) list = list.filter(f => f.group === filterGroup.value)
  if (filterType.value) list = list.filter(f => f.resourceType === filterType.value)
  if (keyword.value) {
    const k = keyword.value.toLowerCase()
    list = list.filter(f =>
      f.resourceName.toLowerCase().includes(k) ||
      f.tags.some(t => t.toLowerCase().includes(k))
    )
  }
  return list
})

const groupCount = computed(() => ({
  personal: myFavorites.value.filter(f => f.group === 'personal').length,
  team: myFavorites.value.filter(f => f.group === 'team').length,
  shared: myFavorites.value.filter(f => f.group === 'shared').length
}))

const typeCount = computed(() => {
  const map: Record<string, number> = {}
  myFavorites.value.forEach(f => {
    map[f.resourceType] = (map[f.resourceType] || 0) + 1
  })
  return map
})

const topFavorites = computed(() =>
  [...myFavorites.value]
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 5)
)

const groups = computed(() => [
  { key: 'team', label: '团队收藏', items: myFavorites.value.filter(f => f.group === 'team') },
  { key: 'personal', label: '个人收藏', items: myFavorites.value.filter(f => f.group === 'personal') },
  { key: 'shared', label: '共享收藏', items: myFavorites.value.filter(f => f.group === 'shared') }
].filter(g => g.items.length > 0))

const resourceTypeOptions = [
  { label: '表', value: 'table' },
  { label: '字段', value: 'field' },
  { label: '指标', value: 'metric' },
  { label: '标签', value: 'tag' },
  { label: '人群', value: 'audience' },
  { label: '看板', value: 'dashboard' },
  { label: '服务', value: 'service' },
  { label: 'API', value: 'api' },
  { label: '报表', value: 'report' }
]

const resourceTypeName = (type: string) => resourceTypeOptions.find(r => r.value === type)?.label || type

const resourceIcon = (type: string) => ({
  table: IconStorage,
  field: IconCode,
  metric: IconBranch,
  tag: IconTags,
  audience: IconUserGroup,
  dashboard: IconDashboard,
  service: IconDesktop,
  api: IconFile,
  report: IconCalendar
}[type] || IconStorage)

const groupName = (g: string) => ({ personal: '个人', team: '团队', shared: '共享' }[g] || g)
const groupColor = (g: string) => ({ personal: 'gray', team: 'arcoblue', shared: 'purple' }[g] || 'gray')

const notificationLabel = (n: string) => ({
  none: '不通知', on_change: '变更时', daily: '每日', weekly: '每周'
}[n] || n)
const notificationColor = (n: string) => ({
  none: 'gray', on_change: 'red', daily: 'orange', weekly: 'green'
}[n] || 'gray')

const onVisit = (record: any) => {
  FavoriteStore.visit(record.id)
  if (record.resourcePath) {
    // 子应用 base 兼容:去前导 '/' 让 vue-router 自动加 base
    const path = record.resourcePath.startsWith('/')
      ? record.resourcePath.substring(1)
      : record.resourcePath
    router.push(path)
  }
}

const onRemove = (record: any) => {
  const ok = FavoriteStore.remove(record.id)
  if (ok) Message.success('已取消收藏')
}
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: 16px;

  .stats-row {
    margin-bottom: 16px;
  }

  .filter-row {
    margin-bottom: 16px;
  }

  .resource-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .fav-card {
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .fav-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .fav-icon {
        font-size: 18px;
        color: #165dff;
      }
    }

    .fav-card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #86909c;
    }
  }

  .stat-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .stat-bar-label {
      width: 80px;
      font-size: 13px;
      color: #4e5969;
    }

    .stat-bar-value {
      width: 40px;
      text-align: right;
      font-weight: 600;
      color: #1d2129;
    }
  }

  .visit-count {
    font-size: 12px;
    color: #86909c;
  }
}
</style>