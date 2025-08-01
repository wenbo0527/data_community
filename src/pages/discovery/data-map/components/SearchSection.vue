<template>
  <div class="search-section">
    <a-card class="search-card">
      <a-input-search
        v-model="searchValue"
        :placeholder="placeholder"
        search-button
        allow-clear
        :loading="loading"
        @search="handleSearch"
        @clear="handleClear"
        @input="handleInput"
      >
        <template #prefix>
          <icon-search style="color: var(--color-text-3)" />
        </template>
      </a-input-search>
      
      <!-- 搜索建议 -->
      <div v-if="showSuggestions && suggestions.length > 0" class="search-suggestions">
        <div class="suggestions-header">
          <span>搜索建议</span>
        </div>
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <icon-search class="suggestion-icon" />
            <span class="suggestion-text">{{ suggestion }}</span>
          </div>
        </div>
      </div>
      
      <!-- 搜索历史 -->
      <div v-if="props.showHistory && searchHistory.length > 0" class="search-history">
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
      
      <!-- 高级筛选 -->
      <div v-if="props.showAdvancedFilter" class="advanced-filter">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-select 
              v-model="filters.type" 
              placeholder="表类型" 
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="维度表">维度表</a-option>
              <a-option value="事实表">事实表</a-option>
              <a-option value="明细表">明细表</a-option>
              <a-option value="汇总表">汇总表</a-option>
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
      

    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { IconSearch, IconDelete } from '@arco-design/web-vue/es/icon'

interface SearchFilters {
  type?: string
  domain?: string
  updateFrequency?: string
}

interface SearchSectionEmits {
  (e: 'search', value: string, filters: SearchFilters): void
  (e: 'clear'): void
  (e: 'filter-change', filters: SearchFilters): void
}

const props = defineProps<{
  placeholder?: string
  loading?: boolean
  modelValue?: string
  showAdvancedFilter?: boolean
  showHistory?: boolean
}>()

const emit = defineEmits<SearchSectionEmits>()
const router = useRouter()

const searchValue = ref(props.modelValue || '')
const showSuggestions = ref(false)
const suggestions = ref<string[]>([])
const searchHistory = ref<string[]>([])
const filters = ref<SearchFilters>({})

// 防抖搜索
const debouncedSearch = useDebounceFn((value: string) => {
  if (value.length >= 2) {
    generateSuggestions(value)
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
}, 300)

// 生成搜索建议
const generateSuggestions = (query: string) => {
  const mockSuggestions = [
    '用户基础信息表',
    '交易流水表',
    '产品信息表',
    '风险评估表',
    '客户画像表'
  ]
  
  suggestions.value = mockSuggestions.filter(item => 
    item.toLowerCase().includes(query.toLowerCase())
  )
  showSuggestions.value = suggestions.value.length > 0
}

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('search-history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveSearchHistory = (query: string) => {
  if (!query.trim()) return
  
  const history = [...searchHistory.value]
  const index = history.indexOf(query)
  
  if (index > -1) {
    history.splice(index, 1)
  }
  
  history.unshift(query)
  searchHistory.value = history.slice(0, 10) // 最多保存10条
  
  localStorage.setItem('search-history', JSON.stringify(searchHistory.value))
}

const handleInput = (value: string) => {
  searchValue.value = value
  debouncedSearch(value)
}

const handleSearch = (value: string = searchValue.value) => {
  if (!value.trim()) return
  
  saveSearchHistory(value)
  showSuggestions.value = false
  
  // 跳转到聚合搜索页面
  router.push({
    path: '/discovery/search',
    query: { q: value }
  })
  
  emit('search', value, filters.value)
}

const handleClear = () => {
  searchValue.value = ''
  suggestions.value = []
  showSuggestions.value = false
  emit('clear')
}

const selectSuggestion = (suggestion: string) => {
  searchValue.value = suggestion
  handleSearch(suggestion)
}

const selectHistory = (item: string) => {
  searchValue.value = item
  handleSearch(item)
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search-history')
}

const handleFilterChange = () => {
  emit('filter-change', filters.value)
}

const resetFilters = () => {
  filters.value = {}
  emit('filter-change', filters.value)
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue || ''
})

// 点击外部关闭建议
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.search-section')) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  loadSearchHistory()
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
const onUnmounted = () => {
  document.removeEventListener('click', handleClickOutside)
}
</script>

<style scoped>
.search-section {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.search-card :deep(.arco-card-body) {
  padding: 20px;
}

.search-card :deep(.arco-input-search) {
  border-radius: 6px;
}

.search-card :deep(.arco-input-wrapper) {
  border-radius: 6px 0 0 6px;
  border-color: #c9cdd4;
}

.search-card :deep(.arco-input-wrapper:hover) {
  border-color: #165dff;
}

.search-card :deep(.arco-input-wrapper.arco-input-focus) {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.search-card :deep(.arco-input-search-btn) {
  border-radius: 0 6px 6px 0;
  background: #165dff;
  border-color: #165dff;
}

.search-card :deep(.arco-input-search-btn:hover) {
  background: #4080ff;
  border-color: #4080ff;
}

.search-suggestions,
.search-history {
  margin-top: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.suggestions-header,
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #4e5969;
}

.suggestion-item:hover {
  background: #e8f3ff;
  color: #1d2129;
}

.suggestion-icon {
  font-size: 14px;
  color: #86909c;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid #c9cdd4;
  color: #4e5969;
}

.history-tag:hover {
  background: #e8f3ff;
  border-color: #165dff;
  color: #165dff;
}

.advanced-filter {
  margin-top: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.filter-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .search-card :deep(.arco-card-body) {
    padding: 16px;
  }
  
  .search-suggestions,
  .search-history,
  .advanced-filter {
    padding: 12px;
    margin-top: 12px;
  }
  

}
</style>