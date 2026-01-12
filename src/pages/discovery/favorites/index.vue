<template>
  <div class="favorites-page">
    <a-page-header title="我的收藏" class="page-header" />
    <a-card class="filter-bar">
      <a-space>
        <a-input-search v-model="query" :placeholder="searchPlaceholder" style="width: 320px" allow-clear @search="onSearch" />
      </a-space>
    </a-card>

    <a-tabs v-model:active-key="activeTab" type="line" class="type-tabs">
      <a-tab-pane key="table" title="数据表">
        <a-tabs v-model:active-key="activeSubTab" size="small" class="sub-tabs">
          <a-tab-pane key="collections" title="常用表集合" />
          <a-tab-pane key="tables" title="数据表" />
        </a-tabs>

        <div v-if="activeSubTab === 'collections'">
          <FavoriteTable
            :favorite-tables="filteredFavoriteTables"
            :table-collections="filteredCollections"
            @show-collection-detail="showCollectionDetail"
            @create-collection="createCollection"
          />
        </div>
        <div v-else>
          <a-card class="section-card" title="数据表收藏">
            <a-table :data="filteredFavoriteTables" :pagination="false" :bordered="false">
              <template #columns>
                <a-table-column title="名称" data-index="name" />
                <a-table-column title="类型" data-index="type" />
                <a-table-column title="描述" data-index="description" />
              </template>
            </a-table>
          </a-card>
        </div>
      </a-tab-pane>

      <a-tab-pane key="metric" title="指标">
        <div class="results-grid">
          <div 
            v-for="m in filteredMetrics" 
            :key="m.id" 
            class="result-item"
            @click="handleMetricClick(m)"
          >
            <div class="item-header">
              <div class="item-type">
                <a-tag :color="getTypeColor('metric')">指标</a-tag>
              </div>
              <div class="item-actions">
                <a-button type="text" size="mini" @click.stop="toggleMetricFavorite(m)">
                  <icon-heart :style="{ color: m.isFavorite ? '#f53f3f' : '#86909c' }" />
                </a-button>
              </div>
            </div>
            <div class="item-content">
              <h3 class="item-title">{{ m.name }}</h3>
              <p class="item-description">{{ m.description }}</p>
              <div class="item-meta">
                <span class="meta-item"><icon-user />{{ m.owner || '系统管理员' }}</span>
                <span class="meta-item"><icon-clock-circle />{{ m.updateTime || '2025-01-01' }}</span>
                <span class="meta-item" v-if="m.category"><icon-apps />{{ m.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="external" title="外数">
        <div class="results-grid">
          <div 
            v-for="e in filteredExternal" 
            :key="e.id" 
            class="result-item"
            @click="handleExternalClick(e)"
          >
            <div class="item-header">
              <div class="item-type">
                <a-tag :color="getTypeColor('external')">外数</a-tag>
              </div>
              <div class="item-actions">
                <a-button type="text" size="mini" @click.stop="toggleExternalFavorite(e)">
                  <icon-heart :style="{ color: e.isFavorite ? '#f53f3f' : '#86909c' }" />
                </a-button>
              </div>
            </div>
            <div class="item-content">
              <h3 class="item-title">{{ e.name }}</h3>
              <p class="item-description">{{ e.description }}</p>
              <div class="item-meta">
                <span class="meta-item"><icon-user />{{ e.owner || '系统管理员' }}</span>
                <span class="meta-item"><icon-clock-circle />{{ e.updateTime || '2025-01-01' }}</span>
                <span class="meta-item" v-if="e.domain"><icon-apps />{{ e.domain }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="variable" title="变量">
        <div class="results-grid">
          <div 
            v-for="v in filteredVariables" 
            :key="v.id" 
            class="result-item"
            @click="handleVariableClick(v)"
          >
            <div class="item-header">
              <div class="item-type">
                <a-tag :color="getTypeColor('variable')">变量</a-tag>
              </div>
              <div class="item-actions">
                <a-button type="text" size="mini" @click.stop="toggleVariableFavorite(v)">
                  <icon-heart :style="{ color: v.isFavorite ? '#f53f3f' : '#86909c' }" />
                </a-button>
              </div>
            </div>
            <div class="item-content">
              <h3 class="item-title">{{ v.name }}</h3>
              <p class="item-description">{{ v.description }}</p>
              <div class="item-meta">
                <span class="meta-item"><icon-user />{{ v.owner || '系统管理员' }}</span>
                <span class="meta-item"><icon-clock-circle />{{ v.updateTime || '2025-01-01' }}</span>
                <span class="meta-item" v-if="v.domain"><icon-apps />{{ v.domain }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
  </template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FavoriteTable from '@/pages/discovery/data-map/components/FavoriteTable.vue'
import { IconHeart, IconUser, IconClockCircle, IconApps } from '@arco-design/web-vue/es/icon'

const query = ref('')
const route = useRoute()
const router = useRouter()
const initialType = typeof route.query.type === 'string' ? route.query.type : 'table'
const initialSub = typeof route.query.sub === 'string' ? route.query.sub : 'collections'
const activeTab = ref(['table', 'metric', 'external', 'variable'].includes(initialType) ? initialType : 'table')
const activeSubTab = ref(['collections', 'tables'].includes(initialSub) ? initialSub : 'collections')

const searchPlaceholder = computed(() => {
  switch (activeTab.value) {
    case 'table': return activeSubTab.value === 'collections' ? '搜索集合名称或描述' : '搜索表名或描述'
    case 'metric': return '搜索指标名称或描述'
    case 'external': return '搜索外数名称或描述'
    case 'variable': return '搜索变量名称或描述'
    default: return '搜索名称或描述'
  }
})

watch([activeTab, activeSubTab], ([type, sub]) => {
  router.replace({ query: { type, sub: type === 'table' ? sub : undefined } })
})

const favoriteTables = ref([
  { name: 'dwd_order', type: '宽表', description: '订单宽表' },
  { name: 'dim_user', type: '维表', description: '用户维表' },
  { name: 'ods_pay', type: '明细表', description: '支付明细' }
])

const tableCollections = ref([
  {
    id: 'c1',
    name: '贷前分析常用表',
    description: '贷前准入分析常用数据集合',
    tables: [
      { name: 'dim_user', type: '维表', description: '用户维表' },
      { name: 'dwd_order', type: '宽表', description: '订单宽表' }
    ]
  },
  {
    id: 'c2',
    name: '贷后监控集合',
    description: '贷后风险监控相关数据表集合',
    tables: [
      { name: 'dwd_repay', type: '宽表', description: '还款宽表' },
      { name: 'ods_overdue', type: '明细表', description: '逾期明细' }
    ]
  }
])

const metrics = ref([
  { id: 'm1', name: '逾期率', description: '逾期订单占比', isFavorite: false, owner: '风控中心', updateTime: '2025-01-01', category: '风控' },
  { id: 'm2', name: '通过率', description: '风控通过占比', isFavorite: false, owner: '风控中心', updateTime: '2025-01-03', category: '风控' }
])

const external = ref([
  { id: 'e1', name: '运营商三要素', description: '姓名+身份证+手机号核验', isFavorite: false, owner: '外数平台', updateTime: '2025-01-02', domain: '认证' },
  { id: 'e2', name: '社保缴纳查询', description: '近12个月社保', isFavorite: false, owner: '外数平台', updateTime: '2025-01-04', domain: '就业' }
])

const variables = ref([
  { id: 'v1', name: '近7日APP访问次数', description: '近7日行为频次', isFavorite: false, owner: '行为平台', updateTime: '2025-01-05', domain: '行为' },
  { id: 'v2', name: '近30日逾期次数', description: '近30日逾期次数', isFavorite: false, owner: '风控中心', updateTime: '2025-01-06', domain: '风控' }
])

const filteredFavoriteTables = computed(() => {
  const q = query.value.trim().toLowerCase()
  return favoriteTables.value.filter(i => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
})

const filteredCollections = computed(() => {
  const q = query.value.trim().toLowerCase()
  return tableCollections.value.filter(i => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
})

const filteredMetrics = computed(() => {
  const q = query.value.trim().toLowerCase()
  return metrics.value.filter(i => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
})

const filteredExternal = computed(() => {
  const q = query.value.trim().toLowerCase()
  return external.value.filter(i => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
})

const filteredVariables = computed(() => {
  const q = query.value.trim().toLowerCase()
  return variables.value.filter(i => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
})

const onSearch = () => {}

const showCollectionDetail = () => {}
const createCollection = () => {}

const getTypeColor = (type) => {
  switch (type) {
    case 'table': return '#165DFF'
    case 'metric': return '#00B42A'
    case 'external': return '#FF7D00'
    case 'variable': return '#722ED1'
    default: return '#86909C'
  }
}

const toggleMetricFavorite = (item) => { item.isFavorite = !item.isFavorite }
const toggleExternalFavorite = (item) => { item.isFavorite = !item.isFavorite }
const toggleVariableFavorite = (item) => { item.isFavorite = !item.isFavorite }

const handleMetricClick = (item) => {}
const handleExternalClick = (item) => {}
const handleVariableClick = (item) => {}
</script>

<style scoped>
.favorites-page {
  padding: 16px;
}
.page-header {
  margin-bottom: 12px;
  background: #fff;
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
  margin-bottom: 8px;
}
.section-card {
  margin-bottom: 16px;
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
</style>
