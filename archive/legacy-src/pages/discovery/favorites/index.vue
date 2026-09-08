<template>
  <div class="favorites-page">
    <a-page-header title="我的关注" class="page-header">
      <template #subtitle>
        <span class="header-subtitle">统一管理你收藏的资产、指标、变量、特征、API 和表集合</span>
      </template>
      <template #extra>
        <a-space>
          <a-radio-group v-model="sortBy" type="button" size="small">
            <a-radio-button value="visit">按访问次数</a-radio-button>
            <a-radio-button value="recent">按最近访问</a-radio-button>
            <a-radio-button value="create">按收藏时间</a-radio-button>
          </a-radio-group>
        </a-space>
      </template>
    </a-page-header>

    <a-card class="filter-bar">
      <a-space>
        <a-input-search v-model="query" :placeholder="searchPlaceholder" style="width: 320px" allow-clear @search="onSearch" />
        <a-tag color="arcoblue">共 {{ totalCount }} 个关注</a-tag>
      </a-space>
    </a-card>

    <a-tabs v-model:active-key="activeTab" type="line" class="type-tabs">
      <!-- Tab 1: 数据表(文档 §6.2 第 1 类:资产=表/集合) -->
      <a-tab-pane key="table" title="数据表">
        <a-tabs v-model:active-key="activeSubTab" size="small" class="sub-tabs">
          <a-tab-pane key="collections" :title="`常用表集合 (${tableCollections.length})`" />
          <a-tab-pane key="tables" :title="`数据表 (${tableList.length})`" />
        </a-tabs>

        <div v-if="activeSubTab === 'collections'">
          <a-empty v-if="tableCollections.length === 0" description="暂无关注的表集合" />
          <a-row v-else :gutter="[16, 16]">
            <a-col v-for="c in tableCollections" :key="c.id" :xs="24" :sm="12" :md="12" :lg="8">
              <a-card class="collection-card" hoverable>
                <template #title>
                  <a-space>
                    <a-tag color="purple">集合</a-tag>
                    <span>{{ c.resourceName }}</span>
                  </a-space>
                </template>
                <template #extra>
                  <a-button type="text" size="mini" @click="toggleFavorite(c)">
                    <IconHeart :style="{ color: '#f53f3f' }" />
                  </a-button>
                </template>
                <p class="collection-desc">{{ c.description }}</p>
                <div class="collection-meta">
                  <a-space>
                    <a-tag v-for="t in c.tags" :key="t" size="small">{{ t }}</a-tag>
                  </a-space>
                </div>
                <div class="collection-footer">
                  <span class="meta-item"><IconUser />{{ c.owner }}</span>
                  <span class="meta-item"><IconClockCircle />访问 {{ c.visitCount }} 次</span>
                  <span class="meta-item" v-if="c.lastVisitTime"><IconCalendar />最近 {{ c.lastVisitTime }}</span>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>

        <div v-else>
          <a-empty v-if="tableList.length === 0" description="暂无关注的数据表" />
          <div v-else class="results-grid">
            <div
              v-for="t in tableList"
              :key="t.id"
              class="result-item"
              @click="handleClick(t)"
            >
              <div class="item-header">
                <div class="item-type">
                  <a-tag :color="getTypeColor('table')">资产</a-tag>
                </div>
                <div class="item-actions">
                  <a-button type="text" size="mini" @click.stop="toggleFavorite(t)">
                    <IconHeart :style="{ color: '#f53f3f' }" />
                  </a-button>
                </div>
              </div>
              <div class="item-content">
                <h3 class="item-title">{{ t.resourceName }}</h3>
                <p class="item-description">{{ t.description }}</p>
                <div class="item-meta">
                  <span class="meta-item"><IconUser />{{ t.owner }}</span>
                  <span class="meta-item" v-if="t.domain"><IconApps />{{ t.domain }}</span>
                  <span class="meta-item"><IconClockCircle />访问 {{ t.visitCount }} 次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- Tab 2: 指标(文档 §6.2 第 2 类) -->
      <a-tab-pane key="metric" :title="`指标 (${metricList.length})`">
        <a-empty v-if="metricList.length === 0" description="暂无关注的指标" />
        <div v-else class="results-grid">
          <div v-for="m in metricList" :key="m.id" class="result-item" @click="handleClick(m)">
            <div class="item-header">
              <div class="item-type">
                <a-tag :color="getTypeColor('metric')">指标</a-tag>
              </div>
              <div class="item-actions">
                <a-button type="text" size="mini" @click.stop="toggleFavorite(m)">
                  <IconHeart :style="{ color: '#f53f3f' }" />
                </a-button>
              </div>
            </div>
            <div class="item-content">
              <h3 class="item-title">{{ m.resourceName }}</h3>
              <p class="item-description">{{ m.description }}</p>
              <div class="item-meta">
                <span class="meta-item"><IconUser />{{ m.owner || '系统管理员' }}</span>
                <span class="meta-item" v-if="m.domain"><IconApps />{{ m.domain }}</span>
                <span class="meta-item"><IconClockCircle />访问 {{ m.visitCount }} 次</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- Tab 3: 变量(文档 §6.2 第 3 类) -->
      <a-tab-pane key="variable" :title="`变量 (${variableList.length})`">
        <a-empty v-if="variableList.length === 0" description="暂无关注的变量" />
        <div v-else class="results-grid">
          <div v-for="v in variableList" :key="v.id" class="result-item" @click="handleClick(v)">
            <div class="item-header">
              <div class="item-type">
                <a-tag :color="getTypeColor('variable')">变量</a-tag>
              </div>
              <div class="item-actions">
                <a-button type="text" size="mini" @click.stop="toggleFavorite(v)">
                  <IconHeart :style="{ color: '#f53f3f' }" />
                </a-button>
              </div>
            </div>
            <div class="item-content">
              <h3 class="item-title">{{ v.resourceName }}</h3>
              <p class="item-description">{{ v.description }}</p>
              <div class="item-meta">
                <span class="meta-item"><IconUser />{{ v.owner || '系统管理员' }}</span>
                <span class="meta-item" v-if="v.domain"><IconApps />{{ v.domain }}</span>
                <span class="meta-item"><IconClockCircle />访问 {{ v.visitCount }} 次</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- Tab 4: 特征(文档 §6.2 第 4 类) -->
      <a-tab-pane key="feature" :title="`特征 (${featureList.length})`">
        <a-empty v-if="featureList.length === 0" description="暂无关注的特征" />
        <div v-else class="results-grid">
          <div v-for="f in featureList" :key="f.id" class="result-item" @click="handleClick(f)">
            <div class="item-header">
              <div class="item-type">
                <a-tag :color="getTypeColor('feature')">特征</a-tag>
              </div>
              <div class="item-actions">
                <a-button type="text" size="mini" @click.stop="toggleFavorite(f)">
                  <IconHeart :style="{ color: '#f53f3f' }" />
                </a-button>
              </div>
            </div>
            <div class="item-content">
              <h3 class="item-title">{{ f.resourceName }}</h3>
              <p class="item-description">{{ f.description }}</p>
              <div class="item-meta">
                <span class="meta-item"><IconUser />{{ f.owner || '特征平台' }}</span>
                <span class="meta-item" v-if="f.domain"><IconApps />{{ f.domain }}</span>
                <span class="meta-item"><IconClockCircle />访问 {{ f.visitCount }} 次</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- Tab 5: API(文档 §6.2 第 5 类) -->
      <a-tab-pane key="api" :title="`API (${apiList.length})`">
        <a-empty v-if="apiList.length === 0" description="暂无关注的 API" />
        <div v-else class="results-grid">
          <div v-for="a in apiList" :key="a.id" class="result-item" @click="handleClick(a)">
            <div class="item-header">
              <div class="item-type">
                <a-tag :color="getTypeColor('api')">API</a-tag>
              </div>
              <div class="item-actions">
                <a-button type="text" size="mini" @click.stop="toggleFavorite(a)">
                  <IconHeart :style="{ color: '#f53f3f' }" />
                </a-button>
              </div>
            </div>
            <div class="item-content">
              <h3 class="item-title">{{ a.resourceName }}</h3>
              <p class="item-description">{{ a.description }}</p>
              <div class="item-meta">
                <span class="meta-item"><IconUser />{{ a.owner || 'API 团队' }}</span>
                <span class="meta-item" v-if="a.domain"><IconApps />{{ a.domain }}</span>
                <span class="meta-item"><IconClockCircle />访问 {{ a.visitCount }} 次</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- Tab 6: 外数(扩展保留:文档未列但 DCA 实际有) -->
      <a-tab-pane key="external" title="外数">
        <a-empty description="暂无关注的外数(从外数详情页点击收藏后会显示在这里)" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 我的关注 (P0-B + P0-C + P0-D)
 *
 * 数据源:FavoriteStore from '@/mock/shared'
 * 支持 6 类对象:资产(表/集合) / 指标 / 变量 / 特征 / API / 外数
 * 排序:访问次数 / 最近访问 / 收藏时间
 *
 * @see 文档 §6 我的关注
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { FavoriteStore } from '@/mock/shared/favorite-directory'
import { IconHeart, IconUser, IconClockCircle, IconApps, IconCalendar } from '@arco-design/web-vue/es/icon'

// === 路由查询参数 ===
const query = ref('')
const route = useRoute()
const router = useRouter()
const initialType = typeof route.query.type === 'string' ? route.query.type : 'table'
const initialSub = typeof route.query.sub === 'string' ? route.query.sub : 'collections'
const ALLOWED_TABS = ['table', 'metric', 'variable', 'feature', 'api', 'external']
const activeTab = ref(ALLOWED_TABS.includes(initialType) ? initialType : 'table')
const activeSubTab = ref(['collections', 'tables'].includes(initialSub) ? initialSub : 'collections')
const sortBy = ref('visit')

// === 从 Store 加载数据(响应式触发更新)===
const allFavorites = ref([])

const reload = () => {
  allFavorites.value = FavoriteStore.listMine()
}

onMounted(() => {
  reload()
})

// === 各 Tab 数据(从 Store 拉取)===
const tableList = computed(() => sortByChoice(FavoriteStore.byResourceType('table')))
const tableCollections = computed(() => sortByChoice(FavoriteStore.byResourceType('collection')))
const metricList = computed(() => sortByChoice(FavoriteStore.byResourceType('metric')))
const variableList = computed(() => sortByChoice(FavoriteStore.byResourceType('variable')))
const featureList = computed(() => sortByChoice(FavoriteStore.byResourceType('feature')))
const apiList = computed(() => sortByChoice(FavoriteStore.byResourceType('api')))

const totalCount = computed(() => tableList.value.length + tableCollections.value.length + metricList.value.length + variableList.value.length + featureList.value.length + apiList.value.length)

/** 按当前排序方式对列表排序 */
function sortByChoice(items) {
  let result = items.filter(item => {
    const q = query.value.trim().toLowerCase()
    if (!q) return true
    return (
      item.resourceName.toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.owner || '').toLowerCase().includes(q) ||
      (item.domain || '').toLowerCase().includes(q)
    )
  })

  if (sortBy.value === 'visit') {
    result = FavoriteStore.sortByVisitCount(result)
  } else if (sortBy.value === 'recent') {
    result = FavoriteStore.sortByLastVisit(result)
  } else if (sortBy.value === 'create') {
    result = [...result].sort((a, b) => b.createTime.localeCompare(a.createTime))
  }
  return result
}

const searchPlaceholder = computed(() => {
  switch (activeTab.value) {
    case 'table': return activeSubTab.value === 'collections' ? '搜索集合名称或描述' : '搜索表名、Owner 或描述'
    case 'metric': return '搜索指标名称、Owner 或描述'
    case 'variable': return '搜索变量名称、Owner 或描述'
    case 'feature': return '搜索特征名称、Owner 或描述'
    case 'api': return '搜索 API 名称、Owner 或描述'
    default: return '搜索名称或描述'
  }
})

watch([activeTab, activeSubTab], ([type, sub]) => {
  router.replace({ query: { type, sub: type === 'table' ? sub : undefined } })
})

const onSearch = () => {
  // 搜索由 computed 响应,这里仅触发 reactivity
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'table': return '#165DFF'
    case 'metric': return '#00B42A'
    case 'variable': return '#722ED1'
    case 'feature': return '#FF7D00'
    case 'api': return '#0FC6C2'
    case 'external': return '#F53F3F'
    default: return '#86909C'
  }
}

/** 切换收藏状态(乐观更新 + Store 操作) */
const toggleFavorite = (item) => {
  const result = FavoriteStore.toggle({
    userId: item.userId,
    userName: item.userName,
    resourceType: item.resourceType,
    resourceId: item.resourceId,
    resourceName: item.resourceName,
    resourcePath: item.resourcePath,
    description: item.description,
    owner: item.owner,
    domain: item.domain,
    group: item.group,
    tags: item.tags,
    notification: item.notification
  })
  Message.success(result?.added ? `已关注 ${item.resourceName}` : `已取消关注 ${item.resourceName}`)
  reload()
}

const handleClick = (item) => {
  if (item.resourcePath) {
    router.push(item.resourcePath)
  }
}
</script>

<style scoped>
.favorites-page {
  padding: 16px;
}
.page-header {
  margin-bottom: 12px;
  background: #fff;
}
.header-subtitle {
  color: var(--color-text-3);
  font-size: 13px;
}
.filter-bar {
  margin-bottom: 16px;
}
.type-tabs {
  background: #fff;
  padding: 0 12px 12px;
  border-radius: 8px;
}
.sub-tabs {
  margin-bottom: 12px;
}
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.result-item {
  padding: 16px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.result-item:hover {
  border-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin: 0 0 8px 0;
  line-height: 1.5;
}
.item-description {
  font-size: 14px;
  color: #4e5969;
  margin: 0 0 12px 0;
  line-height: 1.57;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #86909c;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.collection-card {
  height: 100%;
}
.collection-desc {
  color: var(--color-text-2);
  font-size: 13px;
  margin: 8px 0 12px;
  min-height: 40px;
}
.collection-meta {
  margin-bottom: 12px;
}
.collection-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-3);
  padding-top: 8px;
  border-top: 1px dashed var(--color-border-2);
}
</style>