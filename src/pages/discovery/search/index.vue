<template>
  <div class="search-page-container">
    <!-- 加载状态 -->
    <LoadingState 
      v-if="loading"
      type="skeleton"
      :show-search="true"
      :show-tabs="true"
      :show-grid="true"
      loading-text="正在搜索数据资产..."
    />
    
    <template v-else>
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="search-header">
          <div class="title-area">
            <h2 class="page-title">聚合搜索</h2>
            <p class="page-description">搜索和管理您的数据资产</p>
          </div>
          
          <div class="search-actions">
            <a-button 
              type="text" 
              @click="toggleAdvancedFilter"
              :class="{ active: showAdvancedFilter }"
            >
              <icon-filter />高级搜索
            </a-button>
            <a-button type="text" @click="toggleHistory">
              <icon-history />搜索历史
            </a-button>
          </div>
        </div>
        
        <!-- 搜索输入框 -->
        <div class="search-input-area">
          <a-input-search
            v-model="searchQuery"
            placeholder="请输入表名、描述或业务域进行搜索"
            search-button
            allow-clear
            :loading="searchLoading"
            @search="handleSearch"
            @clear="handleClearSearch"
            size="large"
          >
            <template #prefix>
              <icon-search style="color: var(--color-text-3)" />
            </template>
          </a-input-search>
        </div>
        
        <!-- 高级搜索条件 -->
        <div v-if="showAdvancedFilter" class="advanced-filter">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-select 
                v-model="filters.type" 
                placeholder="数据类型" 
                allow-clear
                @change="handleFilterChange"
              >
                <a-option value="table">数据表</a-option>
                <a-option value="metric">指标</a-option>
                <a-option value="external">外部数据</a-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-select 
                v-model="filters.domain" 
                placeholder="业务域" 
                allow-clear
                @change="handleFilterChange"
              >
                <a-option value="用户域">用户域</a-option>
                <a-option value="交易域">交易域</a-option>
                <a-option value="产品域">产品域</a-option>
                <a-option value="风控域">风控域</a-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-select 
                v-model="filters.updateFrequency" 
                placeholder="更新频率" 
                allow-clear
                @change="handleFilterChange"
              >
                <a-option value="实时">实时</a-option>
                <a-option value="日更新">日更新</a-option>
                <a-option value="周更新">周更新</a-option>
                <a-option value="月更新">月更新</a-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-button type="outline" @click="resetFilters">
                重置筛选
              </a-button>
            </a-col>
          </a-row>
        </div>
        
        <!-- 搜索历史 -->
        <div v-if="showHistory && searchHistory.length > 0" class="search-history">
          <div class="history-header">
            <span>最近搜索</span>
            <a-button type="text" size="mini" @click="clearHistory">
              <icon-delete />清空
            </a-button>
          </div>
          <div class="history-list">
            <a-tag 
              v-for="(item, index) in searchHistory.slice(0, 5)" 
              :key="index"
              class="history-tag"
              @click="selectHistory(item)"
            >
              {{ item }}
            </a-tag>
          </div>
        </div>
      </div>
      
      <!-- 结果展示区域 -->
      <div class="results-section">
        <!-- 结果统计 -->
        <div class="results-header">
          <div class="results-count">
            <span>找到 {{ totalResults }} 个结果</span>
            <span v-if="searchQuery" class="search-term">"{{ searchQuery }}"</span>
          </div>
          
          <!-- 结果类型切换 -->
          <div class="result-type-tabs">
            <a-tabs v-model:active-key="activeResultType" @change="handleResultTypeChange">
              <a-tab-pane key="all" title="全部">
                <template #title>
                  全部 <a-badge :count="allResults.length" :max-count="99" />
                </template>
              </a-tab-pane>
              <a-tab-pane key="table" title="数据表">
                <template #title>
                  数据表 <a-badge :count="tableResults.length" :max-count="99" />
                </template>
              </a-tab-pane>
              <a-tab-pane key="metric" title="指标">
                <template #title>
                  指标 <a-badge :count="metricResults.length" :max-count="99" />
                </template>
              </a-tab-pane>
              <a-tab-pane key="external" title="外部数据">
                <template #title>
                  外部数据 <a-badge :count="externalResults.length" :max-count="99" />
                </template>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
        
        <!-- 结果列表 -->
        <div class="results-content">
          <div v-if="currentResults.length === 0 && !searchLoading" class="empty-results">
            <a-empty description="暂无搜索结果">
              <template #image>
                <icon-search style="font-size: 64px; color: var(--color-text-4)" />
              </template>
            </a-empty>
          </div>
          
          <div v-else class="results-grid">
            <div 
              v-for="item in currentResults" 
              :key="item.id"
              class="result-item"
              @click="handleItemClick(item)"
            >
              <div class="item-header">
                <div class="item-type">
                  <a-tag :color="getTypeColor(item.type)">{{ getTypeLabel(item.type) }}</a-tag>
                </div>
                <div class="item-actions">
                  <a-button type="text" size="mini" @click.stop="toggleFavorite(item)">
                    <icon-heart :style="{ color: item.isFavorite ? '#f53f3f' : '#86909c' }" />
                  </a-button>
                </div>
              </div>
              
              <div class="item-content">
                <h3 class="item-title">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                
                <div class="item-meta">
                  <span class="meta-item">
                    <icon-user />{{ item.owner }}
                  </span>
                  <span class="meta-item">
                    <icon-clock-circle />{{ item.updateTime }}
                  </span>
                  <span v-if="item.domain" class="meta-item">
                    <icon-apps />{{ item.domain }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div v-if="currentResults.length > 0" class="pagination-wrapper">
            <a-pagination
              v-model:current="currentPage"
              :total="totalResults"
              :page-size="pageSize"
              show-total
              show-jumper
              show-page-size
              @change="handlePageChange"
              @page-size-change="handlePageSizeChange"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useDebounceFn } from '@vueuse/core'
import { 
  IconSearch, 
  IconFilter, 
  IconHistory, 
  IconDelete, 
  IconHeart, 
  IconUser, 
  IconClockCircle, 
  IconApps 
} from '@arco-design/web-vue/es/icon'

// 导入组件
import LoadingState from '../data-map/components/LoadingState.vue'

// 导入模拟数据
import { tableMockData } from '@/mock/tableData.ts'
import mockDataMap from '@/mock/data-map'
import mockMetrics from '@/mock/metrics'
import { generateBurndownData, generateWarningData } from '@/mock/external-data'

interface SearchFilters {
  type?: string
  domain?: string
  updateFrequency?: string
}

interface SearchResult {
  id: string
  name: string
  description: string
  type: 'table' | 'metric' | 'external'
  owner: string
  updateTime: string
  domain?: string
  isFavorite?: boolean
  [key: string]: any
}

const router = useRouter()
const route = useRoute()

// 响应式状态
const loading = ref(false)
const searchLoading = ref(false)
const searchQuery = ref('')
const showAdvancedFilter = ref(false)
const showHistory = ref(false)
const activeResultType = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const searchHistory = ref<string[]>([])
const filters = ref<SearchFilters>({})

// 搜索结果数据
const allResults = ref<SearchResult[]>([])
const tableResults = ref<SearchResult[]>([])
const metricResults = ref<SearchResult[]>([])
const externalResults = ref<SearchResult[]>([])

// 计算属性
const currentResults = computed(() => {
  switch (activeResultType.value) {
    case 'table':
      return tableResults.value
    case 'metric':
      return metricResults.value
    case 'external':
      return externalResults.value
    default:
      return allResults.value
  }
})

const totalResults = computed(() => currentResults.value.length)

// 防抖搜索
const debouncedSearch = useDebounceFn(async () => {
  await performSearch()
}, 300)

// 初始化
onMounted(() => {
  loadSearchHistory()
  // 如果URL中有搜索参数，自动执行搜索
  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
    handleSearch(query)
  }
})

// 监听搜索查询变化
watch(searchQuery, (newValue: string) => {
  if (newValue) {
    debouncedSearch()
  } else {
    clearResults()
  }
})

// 搜索方法
const handleSearch = async (query?: string) => {
  const searchTerm = query || searchQuery.value
  if (!searchTerm.trim()) return
  
  searchLoading.value = true
  saveSearchHistory(searchTerm)
  
  try {
    await performSearch(searchTerm)
  } finally {
    searchLoading.value = false
  }
}

const performSearch = async (query?: string) => {
  const searchTerm = query || searchQuery.value
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 搜索数据表
  const tables = mockDataMap.collections?.flatMap(collection => 
    collection.tables.map(table => ({
      id: `table_${table.name}`,
      name: table.name,
      description: table.description,
      type: 'table' as const,
      owner: table.owner,
      updateTime: '2024-01-15',
      domain: table.domain,
      isFavorite: false
    }))
  ) || []
  
  // 搜索指标
  const metrics = mockMetrics?.map((metric: any) => ({
    id: `metric_${metric.id}`,
    name: metric.name,
    description: metric.description,
    type: 'metric' as const,
    owner: metric.owner || '系统管理员',
    updateTime: metric.updateTime || '2024-01-15',
    domain: metric.category,
    isFavorite: false
  })) || []
  
  // 搜索外部数据
  const external = [
    {
      id: 'external_1',
      name: '外部数据源A',
      description: '来自第三方的数据源',
      type: 'external' as const,
      owner: '系统管理员',
      updateTime: '2024-01-15',
      domain: '金融',
      isFavorite: false
    },
    {
      id: 'external_2',
      name: '外部数据源B',
      description: '合作伙伴提供的数据',
      type: 'external' as const,
      owner: '数据管理员',
      updateTime: '2024-01-10',
      domain: '营销',
      isFavorite: false
    }
  ]
  
  // 过滤搜索结果
  const filterResults = (items: SearchResult[]) => {
    return items.filter(item => {
      const matchesQuery = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = !filters.value.type || item.type === filters.value.type
      const matchesDomain = !filters.value.domain || item.domain === filters.value.domain
      
      return matchesQuery && matchesType && matchesDomain
    })
  }
  
  tableResults.value = filterResults(tables)
  metricResults.value = filterResults(metrics)
  externalResults.value = filterResults(external)
  allResults.value = [...tableResults.value, ...metricResults.value, ...externalResults.value]
}

const handleClearSearch = () => {
  searchQuery.value = ''
  clearResults()
}

const clearResults = () => {
  allResults.value = []
  tableResults.value = []
  metricResults.value = []
  externalResults.value = []
  currentPage.value = 1
}

// 筛选方法
const handleFilterChange = () => {
  if (searchQuery.value) {
    debouncedSearch()
  }
}

const resetFilters = () => {
  filters.value = {}
  if (searchQuery.value) {
    debouncedSearch()
  }
}

// 切换方法
const toggleAdvancedFilter = () => {
  showAdvancedFilter.value = !showAdvancedFilter.value
  if (showAdvancedFilter.value) {
    showHistory.value = false
  }
}

const toggleHistory = () => {
  showHistory.value = !showHistory.value
  if (showHistory.value) {
    showAdvancedFilter.value = false
  }
}

// 搜索历史方法
const loadSearchHistory = () => {
  const history = localStorage.getItem('search-history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

const saveSearchHistory = (query: string) => {
  if (!query.trim()) return
  
  const history = [...searchHistory.value]
  const index = history.indexOf(query)
  
  if (index > -1) {
    history.splice(index, 1)
  }
  
  history.unshift(query)
  searchHistory.value = history.slice(0, 10)
  
  localStorage.setItem('search-history', JSON.stringify(searchHistory.value))
}

const selectHistory = (query: string) => {
  searchQuery.value = query
  showHistory.value = false
  handleSearch(query)
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search-history')
}

// 结果处理方法
const handleResultTypeChange = (key: string) => {
  activeResultType.value = key
  currentPage.value = 1
}

const handleItemClick = (item: SearchResult) => {
  // 根据类型跳转到不同的详情页
  switch (item.type) {
    case 'table':
      router.push(`/discovery/data-map/${encodeURIComponent(JSON.stringify(item))}`)
      break
    case 'metric':
      router.push(`/discovery/metrics-map/${item.id}`)
      break
    case 'external':
      router.push(`/discovery/external/${item.id}`)
      break
  }
}

const toggleFavorite = (item: SearchResult) => {
  item.isFavorite = !item.isFavorite
  Message.success(item.isFavorite ? '已添加到收藏' : '已取消收藏')
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 工具方法
const getTypeColor = (type: string) => {
  switch (type) {
    case 'table':
      return 'blue'
    case 'metric':
      return 'green'
    case 'external':
      return 'orange'
    default:
      return 'gray'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'table':
      return '数据表'
    case 'metric':
      return '指标'
    case 'external':
      return '外部数据'
    default:
      return '未知'
  }
}
</script>

<style scoped>
.search-page-container {
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
}

.search-section {
  margin-bottom: 24px;
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.title-area {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  line-height: 1.33;
}

.page-description {
  font-size: 14px;
  color: #86909c;
  margin: 0;
  line-height: 1.57;
  white-space: nowrap;
}

.search-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-actions .arco-btn {
  color: #4e5969;
  transition: all 0.2s ease;
}

.search-actions .arco-btn:hover {
  color: #165dff;
  background-color: #f2f3f5;
}

.search-actions .arco-btn.active {
  color: #165dff;
  background-color: #e8f3ff;
}

.search-input-area {
  margin-bottom: 20px;
}

.search-input-area :deep(.arco-input-search) {
  border-radius: 6px;
}

.search-input-area :deep(.arco-input-wrapper) {
  border-radius: 6px 0 0 6px;
  border-color: #c9cdd4;
}

.search-input-area :deep(.arco-input-wrapper:hover) {
  border-color: #165dff;
}

.search-input-area :deep(.arco-input-wrapper.arco-input-focus) {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.search-input-area :deep(.arco-input-search-btn) {
  border-radius: 0 6px 6px 0;
  background: #165dff;
  border-color: #165dff;
}

.search-input-area :deep(.arco-input-search-btn:hover) {
  background: #4080ff;
  border-color: #4080ff;
}

.advanced-filter,
.search-history {
  margin-top: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-tag:hover {
  background: #e8f3ff;
  border-color: #165dff;
  color: #165dff;
}

.results-section {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.results-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e6eb;
  background: #ffffff;
}

.results-count {
  margin-bottom: 16px;
  font-size: 14px;
  color: #4e5969;
}

.search-term {
  color: #165dff;
  font-weight: 500;
}

.result-type-tabs :deep(.arco-tabs-nav) {
  margin: 0;
  border: none;
}

.result-type-tabs :deep(.arco-tabs-tab) {
  padding: 8px 16px;
  font-size: 14px;
}

.results-content {
  padding: 24px;
}

.empty-results {
  text-align: center;
  padding: 60px 0;
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

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid #e5e6eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-page-container {
    padding: 16px;
  }
  
  .search-section {
    padding: 16px;
  }
  
  .search-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .title-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .search-actions {
    align-self: flex-end;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .results-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .search-page-container {
    padding: 12px;
  }
  
  .search-section {
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-description {
    font-size: 13px;
  }
  
  .search-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
  
  .search-actions .arco-btn {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>