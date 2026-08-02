<template>
  <div class="unified-workbench">
    <!-- 1. Hero 区(模块标题 + 全局搜索) -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">{{ moduleTitle }}</h1>
        <p class="hero-greeting">{{ greeting }}</p>
      </div>
      <div class="hero-search">
        <a-input-search
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          size="large"
          search-button
          @search="handleSearch"
          @press-enter="handleSearch"
        />
      </div>
    </section>

    <!-- 1.5. 数据治理全景(打通数据标准/分级/资源/资产/要素) -->
    <section class="governance">
      <GlobalGovernanceOverview />
    </section>

    <!-- 2. 模块快捷作业 -->
    <section class="shortcuts">
      <h2 class="section-title">{{ moduleTitle }} · 快捷作业</h2>
      <a-row :gutter="16" class="shortcut-grid">
        <a-col
          v-for="tool in shortcuts"
          :key="tool.key"
          :xs="12" :sm="12" :md="6" :lg="6" :xl="6"
          :xxl="6"
        >
          <a-card class="shortcut-card" hoverable @click="onToolClick(tool)">
            <div class="shortcut-card-inner">
              <div class="shortcut-icon">
                <component :is="tool.icon" />
              </div>
              <div class="shortcut-text">
                <div class="shortcut-title">{{ tool.title }}</div>
                <div class="shortcut-desc">{{ tool.desc }}</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </section>

    <!-- 3. 跨模块跳转入口 -->
    <section v-if="showCrossNav" class="cross-nav">
      <h2 class="section-title">进入其他模块</h2>
      <a-row :gutter="16">
        <a-col
          v-for="mod in otherModules"
          :key="mod.key"
          :xs="24" :sm="8" :md="8" :lg="8" :xl="8"
        >
          <a-card class="cross-nav-card" hoverable @click="onCrossNav(mod.key)">
            <div class="cross-nav-inner">
              <component :is="mod.icon" class="cross-nav-icon" />
              <div class="cross-nav-text">
                <div class="cross-nav-title">{{ mod.title }}</div>
                <div class="cross-nav-desc">{{ mod.desc }}</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </section>

    <!-- 4. 最近访问(从 localStorage 读) -->
    <section class="recent">
      <h2 class="section-title">最近访问</h2>
      <a-empty v-if="recentVisits.length === 0" description="暂无最近访问" />
      <a-row v-else :gutter="16">
        <a-col
          v-for="visit in recentVisits.slice(0, 6)"
          :key="visit.path"
          :xs="12" :sm="8" :md="6" :lg="6"
        >
          <a-card class="recent-card" hoverable @click="onRecentClick(visit)">
            <div class="recent-inner">
              <icon-clock-circle class="recent-icon" />
              <div class="recent-info">
                <div class="recent-title">{{ visit.title }}</div>
                <div class="recent-time">{{ visit.time }}</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </section>

    <!-- 5. P0#5: 我的产出(跨模块工作产出聚合) -->
    <section class="artifacts">
      <h2 class="section-title">我的产出</h2>
      <MyArtifactsPanel />
    </section>

    <!-- 5. 搜索结果抽屉(L2 整合接入) -->
    <a-drawer
      v-model:visible="searchDrawer"
      :title="`搜索结果: ${lastKeyword}`"
      :width="720"
      :footer="false"
    >
      <GlobalSearchResult
        :keyword="lastKeyword"
        @navigate="onResultNavigate"
      />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IconStorage,
  IconUserGroup,
  IconBranch,
  IconSearch,
  IconSettings,
  IconSafe,
  IconCommon,
  IconTags,
  IconCalendar,
  IconDesktop,
  IconClockCircle,
  IconApps
} from '@arco-design/web-vue/es/icon'
import { useCrossNav } from '@/composables/useCrossNav'
import GlobalSearchResult from './GlobalSearchResult.vue'
import MyArtifactsPanel from './MyArtifactsPanel.vue'
import GlobalGovernanceOverview from './GlobalGovernanceOverview.vue'

type Module = 'discovery' | 'management' | 'exploration'

interface Shortcut {
  key: string
  title: string
  icon: any
  desc: string
  navKey: string
}

const props = defineProps<{
  module: Module
  greeting?: string
  shortcuts: Shortcut[]
}>()

const emit = defineEmits<{
  toolClick: [tool: Shortcut]
  crossNav: [module: Module]
}>()

const { go } = useCrossNav()

// 搜索(L2 整合入口)
const searchKeyword = ref('')
const searchDrawer = ref(false)
const lastKeyword = ref('')

const moduleTitle = computed(() => ({
  discovery: '数据发现',
  management: '数据管理',
  exploration: '数据探索'
}[props.module]))

const searchPlaceholder = computed(() => ({
  discovery: '搜索数据表、指标、变量、血缘...',
  management: '搜索元数据、标准、权限...',
  exploration: '搜索标签、事件、人群、看板...'
}[props.module]))

const greeting = computed(() => props.greeting || '欢迎使用数据中台')

const handleSearch = () => {
  const kw = searchKeyword.value.trim()
  if (!kw) return
  lastKeyword.value = kw
  searchDrawer.value = true
  // 记录最近访问
  saveRecentVisit({
    title: kw,
    path: '__search__',
    module: props.module,
    time: new Date().toLocaleString('zh-CN')
  })
}

const onResultNavigate = (result: { routeKey: string; params?: Record<string, string | number> }) => {
  searchDrawer.value = false
  go(result.routeKey, result.params)
}

// 快捷作业
const onToolClick = (tool: Shortcut) => {
  emit('toolClick', tool)
  go(tool.navKey as any)
  saveRecentVisit({
    title: tool.title,
    path: tool.navKey,
    module: props.module,
    time: new Date().toLocaleString('zh-CN')
  })
}

// 跨模块
const otherModules = computed(() => {
  const all = [
    {
      key: 'discovery' as Module,
      title: '数据发现',
      desc: '浏览数据资产、指标、客户360',
      icon: IconStorage,
      color: '#165DFF'
    },
    {
      key: 'management' as Module,
      title: '数据管理',
      desc: '元数据、标准、权限治理',
      icon: IconSettings,
      color: '#722ED1'
    },
    {
      key: 'exploration' as Module,
      title: '数据探索',
      desc: '标签、事件、人群、分析流程',
      icon: IconApps,
      color: '#0FC6C2'
    }
  ]
  return all.filter(m => m.key !== props.module)
})

const showCrossNav = computed(() => props.module !== undefined)

const onCrossNav = (mod: Module) => {
  emit('crossNav', mod)
  const map: Record<Module, string> = {
    discovery: 'discovery:index',
    management: 'management:index',
    exploration: 'exploration:index'
  }
  go(map[mod])
}

// 最近访问
interface RecentVisit {
  title: string
  path: string
  module: Module
  time: string
}

const recentVisits = ref<RecentVisit[]>([])

const RECENT_KEY = 'data-mid-platform:recent-visits'

const loadRecentVisits = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (raw) recentVisits.value = JSON.parse(raw)
  } catch (e) {
    console.warn('[UnifiedWorkbench] 加载最近访问失败', e)
  }
}

const saveRecentVisit = (visit: RecentVisit) => {
  try {
    const list = recentVisits.value.filter(v => v.path !== visit.path)
    list.unshift(visit)
    recentVisits.value = list.slice(0, 10)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentVisits.value))
  } catch (e) {
    console.warn('[UnifiedWorkbench] 保存最近访问失败', e)
  }
}

const onRecentClick = (visit: RecentVisit) => {
  if (visit.path === '__search__') {
    lastKeyword.value = visit.title
    searchDrawer.value = true
    return
  }
  go(visit.path as any)
}

onMounted(loadRecentVisits)
</script>

<style lang="scss" scoped>
.unified-workbench {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .hero-content {
    .hero-title {
      font-size: 28px;
      font-weight: 600;
      color: #1d2129;
      margin: 0 0 8px;
    }
    .hero-greeting {
      font-size: 14px;
      color: #4e5969;
      margin: 0;
    }
  }

  .hero-search {
    max-width: 640px;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 16px;
}

.shortcuts {
  margin-bottom: 24px;
}

.shortcut-grid {
  .shortcut-card {
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }
  }

  .shortcut-card-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
  }

  .shortcut-icon {
    font-size: 28px;
    color: #165dff;
    flex-shrink: 0;
  }

  .shortcut-text {
    flex: 1;
    min-width: 0;
  }

  .shortcut-title {
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 2px;
  }

  .shortcut-desc {
    font-size: 12px;
    color: #86909c;
    line-height: 1.4;
  }
}

.cross-nav {
  margin-bottom: 24px;

  .cross-nav-card {
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid #e5e6eb;
    &:hover {
      border-color: #165dff;
      box-shadow: 0 6px 16px rgba(22, 93, 255, 0.08);
    }
  }

  .cross-nav-inner {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cross-nav-icon {
    font-size: 32px;
    color: #165dff;
  }

  .cross-nav-title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
  }

  .cross-nav-desc {
    font-size: 12px;
    color: #86909c;
    margin-top: 4px;
  }
}

.recent {
  .recent-card {
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
  }

  .recent-inner {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .recent-icon {
    color: #86909c;
    font-size: 14px;
  }

  .recent-title {
    font-size: 13px;
    color: #1d2129;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-time {
    font-size: 11px;
    color: #c9cdd4;
    margin-top: 2px;
  }
}

.artifacts {
  margin-top: 24px;
}

.governance {
  margin-bottom: 24px;
}
</style>