<template>
  <div class="budget-search-filter">
    <a-card :bordered="false">
      <a-form :model="searchForm" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
        <a-row :gutter="16">
          <!-- 基础搜索条件 -->
          <a-col :span="6">
            <a-form-item field="keyword" label="关键词">
              <a-input
                v-model="searchForm.keyword"
                placeholder="预算名称/项目编号/关键词"
                allow-clear
                @press-enter="handleSearch"
              >
                <template #prefix>
                  <icon-search />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          
          <a-col :span="6">
            <a-form-item field="year" label="预算年度">
              <a-select
                v-model="searchForm.year"
                placeholder="请选择预算年度"
                allow-clear
                @change="handleYearChange"
              >
                <a-option
                  v-for="year in yearOptions"
                  :key="year.value"
                  :value="year.value"
                  :label="year.label"
                />
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="6">
            <a-form-item field="granularity" label="预算粒度">
              <a-select
                v-model="searchForm.granularity"
                placeholder="请选择预算粒度"
                allow-clear
                @change="handleGranularityChange"
              >
                <a-option value="year">年度</a-option>
                <a-option value="quarter">季度</a-option>
                <a-option value="month">月度</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="6">
            <a-form-item field="businessType" label="业务类型">
              <a-select
                v-model="searchForm.businessType"
                placeholder="请选择业务类型"
                allow-clear
                @change="handleBusinessTypeChange"
              >
                <a-option
                  v-for="type in businessTypeOptions"
                  :key="type.value"
                  :value="type.value"
                  :label="type.label"
                />
              </a-select>
            </a-form-item>
          </a-col>
          
          <!-- 高级搜索条件 -->
          <template v-if="showAdvanced">
            <a-col :span="6">
              <a-form-item field="status" label="预算状态">
                <a-select
                  v-model="searchForm.status"
                  placeholder="请选择预算状态"
                  allow-clear
                  multiple
                  @change="handleStatusChange"
                >
                  <a-option value="draft">草稿</a-option>
                  <a-option value="pending">待审核</a-option>
                  <a-option value="approved">已通过</a-option>
                  <a-option value="rejected">已拒绝</a-option>
                  <a-option value="executing">执行中</a-option>
                  <a-option value="completed">已完成</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            
            <a-col :span="6">
              <a-form-item field="platform" label="平台产品">
                <a-select
                  v-model="searchForm.platform"
                  placeholder="请选择平台产品"
                  allow-clear
                  @change="handlePlatformChange"
                >
                  <a-option
                    v-for="platform in platformOptions"
                    :key="platform.value"
                    :value="platform.value"
                    :label="platform.label"
                  />
                </a-select>
              </a-form-item>
            </a-col>
            
            <a-col :span="6">
              <a-form-item field="amountRange" label="金额范围">
                <a-space>
                  <a-input-number
                    v-model="searchForm.minAmount"
                    placeholder="最小值"
                    :min="0"
                    :precision="2"
                    style="width: 100px"
                    @change="handleAmountRangeChange"
                  />
                  <span>-</span>
                  <a-input-number
                    v-model="searchForm.maxAmount"
                    placeholder="最大值"
                    :min="0"
                    :precision="2"
                    style="width: 100px"
                    @change="handleAmountRangeChange"
                  />
                </a-space>
              </a-form-item>
            </a-col>
            
            <a-col :span="6">
              <a-form-item field="executionRate" label="执行率">
                <a-slider
                  v-model="searchForm.executionRate"
                  :min="0"
                  :max="100"
                  :step="10"
                  show-input
                  @change="handleExecutionRateChange"
                />
              </a-form-item>
            </a-col>
            
            <a-col :span="6">
              <a-form-item field="dateRange" label="创建时间">
                <a-range-picker
                  v-model="searchForm.dateRange"
                  style="width: 100%"
                  @change="handleDateRangeChange"
                />
              </a-form-item>
            </a-col>
            
            <a-col :span="6">
              <a-form-item field="creator" label="创建人">
                <a-select
                  v-model="searchForm.creator"
                  placeholder="请选择创建人"
                  allow-clear
                  allow-search
                  @change="handleCreatorChange"
                >
                  <a-option
                    v-for="user in userOptions"
                    :key="user.value"
                    :value="user.value"
                    :label="user.label"
                  />
                </a-select>
              </a-form-item>
            </a-col>
            
            <a-col :span="6">
              <a-form-item field="projectStatus" label="项目状态">
                <a-select
                  v-model="searchForm.projectStatus"
                  placeholder="请选择项目状态"
                  allow-clear
                  multiple
                  @change="handleProjectStatusChange"
                >
                  <a-option value="planning">规划中</a-option>
                  <a-option value="executing">执行中</a-option>
                  <a-option value="completed">已完成</a-option>
                  <a-option value="cancelled">已取消</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            
            <a-col :span="6">
              <a-form-item field="verificationStatus" label="核销状态">
                <a-select
                  v-model="searchForm.verificationStatus"
                  placeholder="请选择核销状态"
                  allow-clear
                  multiple
                  @change="handleVerificationStatusChange"
                >
                  <a-option value="pending">待核销</a-option>
                  <a-option value="partial">部分核销</a-option>
                  <a-option value="completed">已核销</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
        </a-row>
        
        <!-- 操作按钮 -->
        <a-row :gutter="16" justify="end">
          <a-col>
            <a-space>
              <a-button type="text" @click="toggleAdvanced">
                <template #icon>
                  <icon-down v-if="!showAdvanced" />
                  <icon-up v-else />
                </template>
                {{ showAdvanced ? '收起' : '高级搜索' }}
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
      
      <!-- 快速筛选标签 -->
      <div class="quick-filters" v-if="quickFilters.length > 0">
        <span class="filter-label">快速筛选：</span>
        <a-space>
          <a-tag
            v-for="filter in quickFilters"
            :key="filter.key"
            :color="filter.active ? 'blue' : 'gray'"
            checkable
            :checked="filter.active"
            @check="handleQuickFilter(filter)"
          >
            {{ filter.label }}
          </a-tag>
        </a-space>
      </div>
      
      <!-- 已选条件展示 -->
      <div class="selected-filters" v-if="selectedFilters.length > 0">
        <span class="filter-label">已选条件：</span>
        <a-space>
          <a-tag
            v-for="filter in selectedFilters"
            :key="filter.key"
            closable
            @close="removeFilter(filter)"
          >
            {{ filter.label }}
          </a-tag>
          <a-button type="text" size="small" @click="clearAllFilters">
            清除全部
          </a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconDown, IconUp, IconRefresh } from '@arco-design/web-vue/es/icon'

// Props
interface Props {
  modelValue?: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any]
  'search': [params: any]
  'reset': []
}>()

// 响应式数据
const searchForm = reactive({
  keyword: '',
  year: undefined,
  granularity: undefined,
  businessType: undefined,
  status: [],
  platform: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  executionRate: undefined,
  dateRange: [],
  creator: undefined,
  projectStatus: [],
  verificationStatus: []
})

const showAdvanced = ref(false)
const loading = ref(false)

// 选项数据
const yearOptions = ref<Array<{value: string, label: string}>>([])
const businessTypeOptions = ref<Array<{value: string, label: string}>>([])
const platformOptions = ref<Array<{value: string, label: string}>>([])
const userOptions = ref<Array<{value: string, label: string}>>([])

// 快速筛选
const quickFilters = ref<Array<{
  key: string
  label: string
  active: boolean
  filterFn: () => void
}>>([])

// 计算属性
const selectedFilters = computed(() => {
  const filters: Array<{key: string, label: string}> = []
  
  if (searchForm.keyword) {
    filters.push({ key: 'keyword', label: `关键词: ${searchForm.keyword}` })
  }
  if (searchForm.year) {
    filters.push({ key: 'year', label: `年度: ${searchForm.year}` })
  }
  if (searchForm.granularity) {
    const granularityMap: Record<string, string> = {
      year: '年度',
      quarter: '季度',
      month: '月度'
    }
    filters.push({ key: 'granularity', label: `粒度: ${granularityMap[searchForm.granularity]}` })
  }
  if (searchForm.businessType) {
    const businessType = businessTypeOptions.value.find(t => t.value === searchForm.businessType)
    if (businessType) {
      filters.push({ key: 'businessType', label: `业务类型: ${businessType.label}` })
    }
  }
  if (searchForm.status?.length > 0) {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
      executing: '执行中',
      completed: '已完成'
    }
    const statusLabels = searchForm.status.map(s => statusMap[s] || s).join(', ')
    filters.push({ key: 'status', label: `状态: ${statusLabels}` })
  }
  if (searchForm.platform) {
    const platform = platformOptions.value.find(p => p.value === searchForm.platform)
    if (platform) {
      filters.push({ key: 'platform', label: `平台: ${platform.label}` })
    }
  }
  if (searchForm.minAmount !== undefined || searchForm.maxAmount !== undefined) {
    let amountLabel = '金额: '
    if (searchForm.minAmount !== undefined && searchForm.maxAmount !== undefined) {
      amountLabel += `¥${searchForm.minAmount.toLocaleString('zh-CN')} - ¥${searchForm.maxAmount.toLocaleString('zh-CN')}`
    } else if (searchForm.minAmount !== undefined) {
      amountLabel += `≥¥${searchForm.minAmount.toLocaleString('zh-CN')}`
    } else {
      amountLabel += `≤¥${searchForm.maxAmount.toLocaleString('zh-CN')}`
    }
    filters.push({ key: 'amount', label: amountLabel })
  }
  if (searchForm.executionRate !== undefined) {
    filters.push({ key: 'executionRate', label: `执行率: ${searchForm.executionRate}%` })
  }
  if (searchForm.dateRange?.length === 2) {
    filters.push({ key: 'dateRange', label: `创建时间: ${searchForm.dateRange[0]} 至 ${searchForm.dateRange[1]}` })
  }
  if (searchForm.creator) {
    const creator = userOptions.value.find(u => u.value === searchForm.creator)
    if (creator) {
      filters.push({ key: 'creator', label: `创建人: ${creator.label}` })
    }
  }
  if (searchForm.projectStatus?.length > 0) {
    const statusMap: Record<string, string> = {
      planning: '规划中',
      executing: '执行中',
      completed: '已完成',
      cancelled: '已取消'
    }
    const statusLabels = searchForm.projectStatus.map(s => statusMap[s] || s).join(', ')
    filters.push({ key: 'projectStatus', label: `项目状态: ${statusLabels}` })
  }
  if (searchForm.verificationStatus?.length > 0) {
    const statusMap: Record<string, string> = {
      pending: '待核销',
      partial: '部分核销',
      completed: '已核销'
    }
    const statusLabels = searchForm.verificationStatus.map(s => statusMap[s] || s).join(', ')
    filters.push({ key: 'verificationStatus', label: `核销状态: ${statusLabels}` })
  }
  
  return filters
})

// 监听表单变化
watch(searchForm, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// 生命周期
onMounted(async () => {
  await loadFilterOptions()
  initQuickFilters()
})

// 方法
const loadFilterOptions = async () => {
  try {
    loading.value = true
    
    // 加载年度选项
    const currentYear = new Date().getFullYear()
    yearOptions.value = Array.from({ length: 5 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: `${currentYear - i}年`
    }))
    
    // 加载业务类型选项
    businessTypeOptions.value = [
      { value: 'marketing', label: '市场营销' },
      { value: 'operation', label: '运营推广' },
      { value: 'development', label: '产品开发' },
      { value: 'infrastructure', label: '基础设施' },
      { value: 'other', label: '其他' }
    ]
    
    // 加载平台选项
    platformOptions.value = [
      { value: 'platform1', label: '平台产品1' },
      { value: 'platform2', label: '平台产品2' },
      { value: 'platform3', label: '平台产品3' }
    ]
    
    // 加载用户选项
    userOptions.value = [
      { value: 'user1', label: '张三' },
      { value: 'user2', label: '李四' },
      { value: 'user3', label: '王五' }
    ]
    
  } catch (error) {
    Message.error('加载筛选选项失败')
    console.error('加载筛选选项失败:', error)
  } finally {
    loading.value = false
  }
}

const initQuickFilters = () => {
  quickFilters.value = [
    {
      key: 'my-budget',
      label: '我的预算',
      active: false,
      filterFn: () => {
        searchForm.creator = 'current-user'
        handleSearch()
      }
    },
    {
      key: 'pending-approval',
      label: '待审核',
      active: false,
      filterFn: () => {
        searchForm.status = ['pending']
        handleSearch()
      }
    },
    {
      key: 'executing',
      label: '执行中',
      active: false,
      filterFn: () => {
        searchForm.status = ['executing']
        handleSearch()
      }
    },
    {
      key: 'high-execution',
      label: '高执行率',
      active: false,
      filterFn: () => {
        searchForm.executionRate = 80
        handleSearch()
      }
    },
    {
      key: 'this-year',
      label: '本年度',
      active: false,
      filterFn: () => {
        searchForm.year = new Date().getFullYear().toString()
        handleSearch()
      }
    }
  ]
}

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleSearch = () => {
  const searchParams = {
    ...searchForm,
    startDate: searchForm.dateRange?.[0],
    endDate: searchForm.dateRange?.[1]
  }
  delete searchParams.dateRange
  
  emit('search', searchParams)
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    year: undefined,
    granularity: undefined,
    businessType: undefined,
    status: [],
    platform: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    executionRate: undefined,
    dateRange: [],
    creator: undefined,
    projectStatus: [],
    verificationStatus: []
  })
  
  // 重置快速筛选
  quickFilters.value.forEach(filter => {
    filter.active = false
  })
  
  emit('reset')
  handleSearch()
}

const handleQuickFilter = (filter: any) => {
  filter.active = !filter.active
  
  if (filter.active) {
    // 清除其他快速筛选
    quickFilters.value.forEach(f => {
      if (f.key !== filter.key) {
        f.active = false
      }
    })
    
    // 执行筛选函数
    filter.filterFn()
  } else {
    // 清除筛选
    handleReset()
  }
}

const removeFilter = (filter: {key: string, label: string}) => {
  switch (filter.key) {
    case 'keyword':
      searchForm.keyword = ''
      break
    case 'year':
      searchForm.year = undefined
      break
    case 'granularity':
      searchForm.granularity = undefined
      break
    case 'businessType':
      searchForm.businessType = undefined
      break
    case 'status':
      searchForm.status = []
      break
    case 'platform':
      searchForm.platform = undefined
      break
    case 'amount':
      searchForm.minAmount = undefined
      searchForm.maxAmount = undefined
      break
    case 'executionRate':
      searchForm.executionRate = undefined
      break
    case 'dateRange':
      searchForm.dateRange = []
      break
    case 'creator':
      searchForm.creator = undefined
      break
    case 'projectStatus':
      searchForm.projectStatus = []
      break
    case 'verificationStatus':
      searchForm.verificationStatus = []
      break
  }
  
  handleSearch()
}

const clearAllFilters = () => {
  handleReset()
}

// 事件处理函数
const handleYearChange = () => handleSearch()
const handleGranularityChange = () => handleSearch()
const handleBusinessTypeChange = () => handleSearch()
const handleStatusChange = () => handleSearch()
const handlePlatformChange = () => handleSearch()
const handleAmountRangeChange = () => handleSearch()
const handleExecutionRateChange = () => handleSearch()
const handleDateRangeChange = () => handleSearch()
const handleCreatorChange = () => handleSearch()
const handleProjectStatusChange = () => handleSearch()
const handleVerificationStatusChange = () => handleSearch()
</script>

<style scoped lang="less">
.budget-search-filter {
  margin-bottom: 24px;
  
  .quick-filters {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    
    .filter-label {
      font-size: 14px;
      color: #86909c;
      margin-right: 12px;
    }
  }
  
  .selected-filters {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    
    .filter-label {
      font-size: 14px;
      color: #86909c;
      margin-right: 12px;
    }
  }
}


</style>