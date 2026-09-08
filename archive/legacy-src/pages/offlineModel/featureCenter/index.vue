<template>
  <div class="feature-center-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="page-title">
        <h2>特征中心</h2>
        <span class="page-subtitle">管理和查看所有特征数据</span>
      </div>
      <div class="page-actions">
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <icon-plus />
            </template>
            新建特征
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="filter-section">
      <a-card>
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="特征名称">
            <a-input
              v-model="filterForm.name"
              placeholder="请输入特征名称"
              allow-clear
              @change="handleFilterChange"
            />
          </a-form-item>
          
          <a-form-item label="特征类型">
            <a-select
              v-model="filterForm.type"
              placeholder="请选择特征类型"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="numerical">数值型</a-option>
              <a-option value="categorical">分类型</a-option>
              <a-option value="text">文本型</a-option>
              <a-option value="time">时间型</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="状态">
            <a-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="active">上线</a-option>
              <a-option value="inactive">归档</a-option>
              <a-option value="draft">草稿</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button 
                @click="toggleAdvancedFilter"
                :type="showAdvancedFilter ? 'primary' : 'secondary'"
              >
                <template #icon><icon-filter /></template>
                高级
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>

        <!-- 高级筛选面板 -->
        <div v-if="showAdvancedFilter" class="advanced-filter-panel">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-select 
                v-model="advancedFilter.source" 
                placeholder="来源" 
                allow-clear
              >
                <a-option value="风控">风控</a-option>
                <a-option value="营销">营销</a-option>
                <a-option value="运营">运营</a-option>
                <a-option value="财务">财务</a-option>
                <a-option value="客服">客服</a-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-select 
                v-model="advancedFilter.updateFrequency" 
                placeholder="更新频率" 
                allow-clear
              >
                <a-option value="实时">实时</a-option>
                <a-option value="日更新">日更新</a-option>
                <a-option value="周更新">周更新</a-option>
                <a-option value="月更新">月更新</a-option>
              </a-select>
            </a-col>
          </a-row>

          <div class="condition-builder">
            <div class="condition-header">
              <span class="condition-title">筛选条件</span>
              <a-button type="text" size="mini" @click="addCondition">
                <icon-plus />添加条件
              </a-button>
            </div>

            <div v-if="advancedConditions.length > 0" class="condition-list">
              <div 
                v-for="(condition, index) in advancedConditions" 
                :key="index"
                class="condition-item"
              >
                <a-select 
                  v-model="condition.matchType" 
                  style="width: 100px"
                >
                  <a-option value="include">包含</a-option>
                  <a-option value="exclude">剔除</a-option>
                </a-select>
                <a-input
                  v-model="condition.value"
                  placeholder="请输入关键词"
                  style="flex: 1"
                  allow-clear
                />
                <a-button type="text" status="danger" @click="removeCondition(index)">
                  <icon-delete />
                </a-button>
              </div>
            </div>

            <div v-if="advancedConditions.length === 0" class="quick-conditions">
              <span class="quick-label">快速添加：</span>
              <a-tag 
                v-for="(tag, index) in quickTags" 
                :key="index"
                class="quick-tag"
                @click="addQuickCondition(tag, 'include')"
              >
                包含 {{ tag }}
              </a-tag>
              <a-tag 
                v-for="(tag, index) in quickTags" 
                :key="'ex-' + index"
                class="quick-tag exclude"
                @click="addQuickCondition(tag, 'exclude')"
              >
                剔除 {{ tag }}
              </a-tag>
            </div>
          </div>

          <div class="filter-actions-bottom">
            <a-button type="outline" @click="resetAdvancedFilters">重置筛选</a-button>
            <a-button type="primary" @click="handleSearch">应用筛选</a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-apps />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalFeatures }}</div>
                <div class="stat-label">总特征数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-check-circle />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeFeatures }}</div>
                <div class="stat-label">有效特征</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-clock-circle />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pendingFeatures }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-warning />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.expiredFeatures }}</div>
                <div class="stat-label">已过期</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-card>
        <template #title>
          <div class="table-header">
            <span>特征列表</span>
          </div>
        </template>
        
        <a-table
          :data="featureList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
        >
          <template #name="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
          </template>
          
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          
          <template #createTime="{ record }">
            {{ formatDate(record.createTime) }}
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                查看
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOfflineModelStore } from '@/stores/offlineModel'
import { Message } from '@arco-design/web-vue'
import { featureAPI } from '@/api/offlineModel'
import {
  IconSearch,
  IconPlus,
  IconFilter,
  IconDelete
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const store = useOfflineModelStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  name: '',
  type: '',
  status: '',
  modelType: ''
})

// 高级筛选状态
const showAdvancedFilter = ref(false)
const advancedFilter = reactive({
  source: '',
  updateFrequency: ''
})

interface AdvancedCondition {
  matchType: 'include' | 'exclude'
  value: string
}

const advancedConditions = ref<AdvancedCondition[]>([])
const quickTags = ref(['欺诈', '逾期', '信用', '风险', '反欺诈', '评分'])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '特征名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '特征编码',
    dataIndex: 'code',
    width: 150
  },
  {
    title: '特征类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 计算属性
const featureList = computed(() => store.getFeatures)
const stats = computed(() => ({
  totalFeatures: featureList.value.length,
  activeFeatures: featureList.value.filter(item => item.status === 'active').length,
  pendingFeatures: featureList.value.filter(item => item.status === 'pending').length,
  expiredFeatures: featureList.value.filter(item => item.status === 'expired').length
}))

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    let response;
    if (filterForm.modelType) {
      // 如果选择了模型类型，则使用按模型类型获取特征的API
      response = await featureAPI.getFeaturesByModelType(filterForm.modelType, {
        ...filterForm,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
    } else {
      // 否则使用常规获取特征的API
      response = await featureAPI.getFeatures({
        ...filterForm,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
    }
    
    if (response.success) {
      store.setFeatures(response.data.data)
      pagination.total = response.data.total
    } else {
      Message.error(response.message || '加载数据失败')
    }
  } catch (error) {
    Message.error('加载数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.type = ''
  filterForm.status = ''
  loadData()
}

// 高级筛选方法
const toggleAdvancedFilter = () => {
  showAdvancedFilter.value = !showAdvancedFilter.value
}

const addCondition = () => {
  advancedConditions.value.push({
    matchType: 'include',
    value: ''
  })
}

const removeCondition = (index: number) => {
  advancedConditions.value.splice(index, 1)
}

const addQuickCondition = (tag: string, matchType: 'include' | 'exclude') => {
  const existing = advancedConditions.value.find((c: AdvancedCondition) => c.value === tag && c.matchType === matchType)
  if (!existing) {
    advancedConditions.value.push({
      matchType,
      value: tag
    })
  }
}

const resetAdvancedFilters = () => {
  advancedFilter.source = ''
  advancedFilter.updateFrequency = ''
  advancedConditions.value = []
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.current = page
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleCreate = () => {
  router.push('/offline-model/feature-center/create')
}

const handleImport = () => {
  Message.info('批量导入功能开发中')
}

const handleExport = () => {
  Message.info('导出功能开发中')
}

 

const handleViewDetail = (record) => {
  router.push(`/offline-model/feature-center/detail/${record.id}`)
}

const handleEdit = (record) => {
  router.push(`/offline-model/feature-center/edit/${record.id}`)
}

const handleDelete = (record) => {
  Message.info('删除功能开发中')
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    numerical: 'blue',
    categorical: 'green',
    text: 'orange',
    time: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    numerical: '数值型',
    categorical: '分类型',
    text: '文本型',
    time: '时间型'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    draft: 'orange',
    pending: 'blue'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '有效',
    inactive: '无效',
    draft: '草稿',
    pending: '待审核'
  }
  return labels[status] || status
}

const getModelTypeColor = (modelType) => {
  const colors = {
    daily: 'blue',
    monthly: 'green',
    other: 'orange'
  }
  return colors[modelType] || 'gray'
}

const getModelTypeLabel = (modelType) => {
  const labels = {
    daily: '日模型',
    monthly: '月模型',
    other: '其他模型'
  }
  return labels[modelType] || modelType
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="less">
.feature-center-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .page-title {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }
      
      .page-subtitle {
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .filter-section {
    margin-bottom: 24px;
  }
  
  .advanced-filter-panel {
    margin-top: 16px;
    padding: 24px;
    background: #f7f8fa;
    border-radius: 8px;
    border: 1px solid #e5e6eb;
  }
  
  .condition-builder {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #e5e6eb;
  }
  
  .condition-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .condition-title {
    font-size: 14px;
    font-weight: 500;
    color: #4e5969;
  }
  
  .condition-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .condition-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px;
    background: #fff;
    border: 1px solid #e5e6eb;
    border-radius: 6px;
  }
  
  .condition-item:hover {
    border-color: #165dff;
  }
  
  .quick-conditions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    background: #fff;
    border: 1px solid #e5e6eb;
    border-radius: 6px;
  }
  
  .quick-label {
    font-size: 13px;
    color: #86909c;
    margin-right: 8px;
  }
  
  .quick-tag {
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0;
  }
  
  .quick-tag:hover {
    background: #e8f3ff;
    border-color: #165dff;
    color: #165dff;
  }
  
  .quick-tag.exclude:hover {
    background: #fff1e8;
    border-color: #ff7d00;
    color: #ff7d00;
  }
  
  .filter-actions-bottom {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #e5e6eb;
  }
  
  .stats-section {
    margin-bottom: 24px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          font-size: 32px;
          color: #1890ff;
          margin-right: 16px;
        }
        
        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #333;
          }
          
          .stat-label {
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }
  
  .table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
