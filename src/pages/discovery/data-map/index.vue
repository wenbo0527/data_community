<template>
  <div class="data-map-container">
    <!-- 加载状态 -->
    <LoadingState 
      v-if="loading"
      type="skeleton"
      :show-search="true"
      :show-tabs="true"
      :show-grid="true"
      loading-text="正在加载数据资产..."
    />
    
    <template v-else>
      <!-- 页面标题和搜索区域 -->
      <div class="header-section">
        <div class="header-top-row">
          <div class="title-area">
            <h2 class="page-title">数据搜索</h2>
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
        
        <!-- 优化后的搜索组件 -->
        <SearchSection
          v-model="searchForm.name"
          placeholder="请输入表名、描述或业务域进行搜索"
          :loading="searchLoading"
          :show-advanced-filter="showAdvancedFilter"
          :show-history="showHistory"
          @search="handleSearch"
          @clear="handleClearSearch"
          @filter-change="handleFilterChange"
        />
      </div>

      <!-- 标签页区域 -->
      <div class="tabs-section">
        <a-tabs v-model:active-key="activeTab" animation @change="handleTabChange">
          <a-tab-pane key="1" title="常用表">
            <div class="tab-content-wrapper">
              <!-- 使用新的表集合网格组件 -->
              <TableCollectionGrid
                :collections="enhancedCollections"
                :loading="collectionsLoading"
                :page-size="12"
                @collection-click="showCollectionDetail"
                @create-collection="handleCreateCollection"
                @edit-collection="handleEditCollection"
                @delete-collection="handleDeleteCollection"
                @favorite-change="handleFavoriteChange"
              />
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" title="核心业务流程">
            <div class="tab-content-wrapper business-process">
              <BusinessProcessFlow />
            </div>
          </a-tab-pane>
          <a-tab-pane key="3" title="指标地图">
            <div class="tab-content-wrapper">
              <!-- 指标层级筛选区域 -->
              <div class="metrics-filter-section">
                <div class="filter-header">
                  <div class="filter-controls">
                    <a-space>
                      <span class="filter-label">指标层级:</span>
                      <a-select 
                        v-model="selectedLevel" 
                        placeholder="选择层级" 
                        style="width: 120px"
                        @change="handleLevelChange"
                      >
                        <a-option value="all">全部层级</a-option>
                        <a-option value="1">战略层(L1)</a-option>
                        <a-option value="2">管理层(L2)</a-option>
                        <a-option value="3">执行层(L3)</a-option>
                      </a-select>
                      
                      <span class="filter-label">业务线:</span>
                      <a-select 
                        v-model="selectedLine" 
                        placeholder="选择业务线" 
                        style="width: 120px"
                        @change="handleLineChange"
                      >
                        <a-option value="all">全部线路</a-option>
                        <a-option value="scale">规模线</a-option>
                        <a-option value="quality">质量线</a-option>
                      </a-select>
                      
                      <a-button type="text" @click="resetFilters">
                        <template #icon><IconRefresh /></template>
                        重置
                      </a-button>
                    </a-space>
                  </div>
                </div>
              </div>
              
              <!-- 指标画布 -->
              <SubwayMap 
                :level-filter="selectedLevel"
                :line-filter="selectedLine"
              />
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 表详情跳转 -->
      <router-link 
        v-if="currentTable" 
        :to="`/discovery/data-map/${encodeURIComponent(JSON.stringify(currentTable))}`"
        class="hidden-link"
      />
      
      <!-- 创建/编辑集合对话框 -->
      <CreateCollectionModal
        v-model:visible="createCollectionVisible"
        :edit-data="editingCollection"
        @create="handleCreateCollectionSubmit"
        @update="handleUpdateCollectionSubmit"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useDebounceFn } from '@vueuse/core'
import { IconRefresh, IconFilter, IconHistory } from '@arco-design/web-vue/es/icon'
import SearchSection from './components/SearchSection.vue'
import TableCollectionGrid from './components/TableCollectionGrid.vue'
import LoadingState from './components/LoadingState.vue'
import CreateCollectionModal from './components/CreateCollectionModal.vue'
import BusinessProcessFlow from '@/components/BusinessProcessFlow.vue'
import SubwayMap from './components/SubwayMap.vue'
import { tableMockData } from '@/mock/tableData.ts'
import mockData from '@/mock/data-map'


// 新增状态管理
const activeTab = ref('1')
const searchLoading = ref(false)
const collectionsLoading = ref(false)
const searchFilters = ref<SearchFilters>({})
const createCollectionVisible = ref(false)
const editingCollection = ref<TableCollection | null>(null)
const showAdvancedFilter = ref(false)
const showHistory = ref(false)

// 指标地图筛选状态
const selectedLevel = ref('all')
const selectedLine = ref('all')

// 防抖搜索
const debouncedFetchData = useDebounceFn(async () => {
  await fetchCollections()
}, 300)

interface SearchForm {
  name: string
}

interface SearchFilters {
  type?: string
  domain?: string
  updateFrequency?: string
}

interface TableField {
  name: string
  type: string
  description: string
}

interface TableItem {
  name: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: TableField[]
}

interface TableCollection {
  id: string
  name: string
  description: string
  type?: string
  tables: TableItem[]
  owner?: string
  updateTime?: string
  isFavorite?: boolean
  isRecommended?: boolean
}

const router = useRouter()

const searchForm = ref<SearchForm>({
  name: ''
})

const loading = ref(false)
const currentTable = ref<TableItem | null>(null)
const favoriteTables = ref<TableItem[]>(tableMockData)
const tableCollections = ref<TableCollection[]>(mockData.collections || [])

// 表详情数据
const tableDetailData = computed(() => {
  if (!currentTable.value) return []
  return [
    { label: '表名', value: currentTable.value.name },
    { label: '表类型', value: currentTable.value.type },
    { label: '所属目录', value: currentTable.value.category },
    { label: '业务域', value: currentTable.value.domain },
    { label: '更新频率', value: currentTable.value.updateFrequency },
    { label: '负责人', value: currentTable.value.owner },
    { label: '描述', value: currentTable.value.description }
  ]
})

// 增强的集合数据
const enhancedCollections = computed(() => {
  return tableCollections.value.map(collection => ({
    ...collection,
    type: collection.type || getCollectionType(collection),
    owner: collection.owner || '系统管理员',
    updateTime: collection.updateTime || new Date().toISOString(),
    isFavorite: collection.isFavorite || false,
    isRecommended: collection.isRecommended || false
  }))
})

// 根据集合内容推断类型
const getCollectionType = (collection: TableCollection): string => {
  const tableTypes = collection.tables.map(t => t.type)
  if (tableTypes.includes('事实表')) return '业务流程'
  if (tableTypes.includes('维度表')) return '数据分析'
  return '通用'
}

// 获取表集合数据
const fetchCollections = async () => {
  collectionsLoading.value = true
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    tableCollections.value = mockData.collections || []
    favoriteTables.value = mockData.favoriteTables || []
  } catch (error) {
    Message.error('获取数据失败')
    console.error('Failed to fetch collections:', error)
  } finally {
    collectionsLoading.value = false
  }
}

// 优化的搜索处理
const handleSearch = async (value: string, filters: SearchFilters) => {
  if (!value.trim()) {
    Message.warning('请输入搜索关键词')
    return
  }
  
  searchLoading.value = true
  try {
    // 模拟搜索API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    router.push({
      path: '/discovery/search',
      query: { 
        q: value,
        type: filters.type,
        domain: filters.domain,
        updateFrequency: filters.updateFrequency
      }
    })
  } catch (error) {
    Message.error('搜索失败，请重试')
  } finally {
    searchLoading.value = false
  }
}

const handleClearSearch = () => {
  searchForm.value.name = ''
  searchFilters.value = {}
}

const handleFilterChange = (filters: SearchFilters) => {
  searchFilters.value = filters
  // 如果有搜索关键词，自动触发搜索
  if (searchForm.value.name) {
    handleSearch(searchForm.value.name, filters)
  }
}

const handleTabChange = (key: string) => {
  activeTab.value = key
  // 切换标签页时可以进行相应的数据加载
  if (key === '1' && !tableCollections.value.length) {
    debouncedFetchData()
  }
}

// 显示表详情
const showDetail = (table: TableItem) => {
  currentTable.value = table
}

const showCollectionDetail = (collection: TableCollection) => {
  // 这里添加跳转到场景详情页的逻辑
  router.push({
    name: 'CollectionDetail',
    params: { id: collection.id },
    state: { data: collection as unknown as HistoryState }
  })
}

// 移除收藏
const removeFavorite = (table: TableItem) => {
  favoriteTables.value = favoriteTables.value.filter(t => t.name !== table.name)
  Message.success('已取消收藏')
}

// 创建表集合 - 打开对话框
const handleCreateCollection = () => {
  editingCollection.value = null
  createCollectionVisible.value = true
}

// 处理创建集合提交
const handleCreateCollectionSubmit = (collection: Omit<TableCollection, "id">) => {
  const newCollection: TableCollection = {
    id: String(Date.now()),
    name: collection.name,
    description: collection.description || '',
    type: collection.type || getCollectionType(collection as TableCollection),
    tables: collection.tables,
    owner: collection.owner || '当前用户',
    updateTime: collection.updateTime || new Date().toISOString(),
    isFavorite: collection.isFavorite || false
  }
  tableCollections.value.push(newCollection)
  editingCollection.value = null
  Message.success('创建成功')
}

// 处理编辑集合提交
const handleUpdateCollectionSubmit = (collection: TableCollection) => {
  const index = tableCollections.value.findIndex(c => c.id === collection.id)
  if (index > -1) {
    tableCollections.value[index] = collection
    editingCollection.value = null
    Message.success('更新成功')
  }
}

// 编辑表集合
const handleEditCollection = (collection: TableCollection) => {
  console.log('[DataMap] handleEditCollection called with collection:', collection)
  editingCollection.value = collection
  console.log('[DataMap] Set editingCollection.value to:', collection)
  createCollectionVisible.value = true
  console.log('[DataMap] Set createCollectionVisible.value to true')
}

// 删除表集合
const handleDeleteCollection = (collection: TableCollection) => {
  const index = tableCollections.value.findIndex(c => c.id === collection.id)
  if (index > -1) {
    tableCollections.value.splice(index, 1)
    Message.success('删除成功')
  }
}

// 收藏状态变更
const handleFavoriteChange = (collection: TableCollection, isFavorite: boolean) => {
  const index = tableCollections.value.findIndex(c => c.id === collection.id)
  if (index > -1) {
    tableCollections.value[index].isFavorite = isFavorite
  }
}

// 切换高级搜索
const toggleAdvancedFilter = () => {
  showAdvancedFilter.value = !showAdvancedFilter.value
  if (showAdvancedFilter.value) {
    showHistory.value = false
  }
}

// 切换搜索历史
const toggleHistory = () => {
  showHistory.value = !showHistory.value
  if (showHistory.value) {
    showAdvancedFilter.value = false
  }
}

// 指标地图筛选方法
const handleLevelChange = (value: string) => {
  selectedLevel.value = value
  console.log('Level filter changed to:', value)
}

const handleLineChange = (value: string) => {
  selectedLine.value = value
  console.log('Line filter changed to:', value)
}

const resetFilters = () => {
  selectedLevel.value = 'all'
  selectedLine.value = 'all'
  console.log('Filters reset')
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchCollections()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.data-map-container {
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 24px;
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.header-top-row {
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

.tabs-section {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.tabs-section :deep(.arco-tabs-nav) {
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e6eb;
  margin: 0;
}

.tabs-section :deep(.arco-tabs-tab) {
  font-weight: 400;
  font-size: 14px;
  color: #4e5969;
  padding: 16px 20px;
  margin: 0;
  transition: all 0.2s ease;
}

.tabs-section :deep(.arco-tabs-tab-active) {
  color: #165dff;
  font-weight: 500;
}

.tabs-section :deep(.arco-tabs-tab:hover) {
  color: #165dff;
  background-color: #f2f3f5;
}

.tabs-section :deep(.arco-tabs-content) {
  padding: 0;
}

.tabs-section :deep(.arco-tabs-content-item) {
  padding: 0;
}

.tab-content-wrapper {
  padding: 24px;
  min-height: 480px;
  background: #ffffff;
}

.business-process {
  background: #ffffff;
  border-radius: 0 0 8px 8px;
}

.hidden-link {
  display: none;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .data-map-container {
    padding: 20px;
  }
  
  .header-section {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .tab-content-wrapper {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .data-map-container {
    padding: 16px;
  }
  
  .header-section {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .header-top-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .title-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .search-actions {
    align-self: flex-end;
  }
  
  .tab-content-wrapper {
    padding: 16px;
    min-height: 360px;
  }
  
  .tabs-section :deep(.arco-tabs-nav) {
    padding: 0 16px;
  }
  
  .tabs-section :deep(.arco-tabs-tab) {
    padding: 12px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .data-map-container {
    padding: 12px;
  }
  
  .header-section {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .header-top-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .title-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .page-title {
    font-size: 18px;
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
  
  .tab-content-wrapper {
    padding: 16px;
    min-height: 320px;
  }
  
  .tabs-section :deep(.arco-tabs-nav) {
    padding: 0 12px;
  }
  
  .tabs-section :deep(.arco-tabs-tab) {
    padding: 12px 14px;
    font-size: 13px;
  }
}
</style>