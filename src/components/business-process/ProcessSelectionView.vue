<template>
  <div class="process-selection-view">
    <!-- 头部操作区 -->
    <div class="selection-header">
      <div class="header-title">
        <h4>业务流程列表</h4>
        <p class="header-desc">选择要编辑的业务流程，或创建新的流程</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="handleCreateProcess">
          <template #icon><icon-plus /></template>
          新增流程
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="selection-filters">
      <a-input-search
        v-model="searchKeyword"
        placeholder="搜索流程名称或描述"
        style="width: 300px"
        @search="handleSearch"
      />
      <a-select
        v-model="selectedBusinessType"
        placeholder="业务类型"
        style="width: 150px"
        allow-clear
        @change="handleFilter"
      >
        <a-option value="data-analysis">数据分析</a-option>
        <a-option value="data-processing">数据处理</a-option>
        <a-option value="data-integration">数据集成</a-option>
        <a-option value="data-governance">数据治理</a-option>
      </a-select>
    </div>

    <!-- 流程列表 -->
    <div class="process-list">
      <div v-if="loading" class="loading-container">
        <a-spin :size="1" tip="加载中..." />
      </div>
      
      <div v-else-if="filteredProcesses.length === 0" class="empty-container">
        <a-empty description="暂无业务流程">
          <a-button type="primary" @click="handleCreateProcess">
            创建第一个流程
          </a-button>
        </a-empty>
      </div>
      
      <div v-else class="process-grid">
        <div
          v-for="process in filteredProcesses"
          :key="process.id"
          class="process-card"
          @click="handleEditProcess(process)"
        >
          <div class="card-header">
            <div class="process-info">
              <h5 class="process-name">{{ process.name }}</h5>
              <p class="process-desc">{{ process.description || '暂无描述' }}</p>
            </div>
            <div class="process-actions" @click.stop>
              <a-dropdown>
                <a-button type="text" size="small">
                  <template #icon><icon-more /></template>
                </a-button>
                <template #content>
                  <a-doption @click="handleEditProcess(process)">
                    <template #icon><icon-edit /></template>
                    编辑
                  </a-doption>
                  <a-doption @click="handleDuplicateProcess(process)">
                    <template #icon><icon-copy /></template>
                    复制
                  </a-doption>
                  <a-doption @click="handleDeleteProcess(process.id)" class="danger">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>
          
          <div class="card-content">
            <div class="process-meta">
              <a-tag :color="getBusinessTypeColor(process.businessType)">
                {{ getBusinessTypeName(process.businessType) }}
              </a-tag>
              <a-tag v-if="process.productType" color="blue">
                {{ getProductTypeName(process.productType) }}
              </a-tag>
            </div>
            
            <div class="process-stats">
              <span class="stat-item">
                <icon-layers />
                {{ process.steps?.length || 0 }} 个步骤
              </span>
              <span class="stat-item">
                <icon-calendar />
                {{ formatDate(process.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconSearch,
  IconMore,
  IconEdit,
  IconCopy,
  IconDelete,
  IconLayers,
  IconCalendar
} from '@arco-design/web-vue/es/icon'

// 组件事件
interface Emits {
  (e: 'create-process'): void
  (e: 'edit-process', process: any): void
  (e: 'delete-process', processId: string): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const selectedBusinessType = ref('')
const processes = ref<any[]>([])

// 模拟数据
const mockProcesses = [
  {
    id: '1',
    name: '用户行为数据分析流程',
    description: '分析用户在平台上的行为数据，生成用户画像和行为报告',
    businessType: 'data-analysis',
    productType: 'analytics',
    steps: [
      { id: '1-1', name: '数据收集' },
      { id: '1-2', name: '数据清洗' },
      { id: '1-3', name: '数据分析' },
      { id: '1-4', name: '报告生成' }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: '销售数据处理流程',
    description: '处理和整合来自不同渠道的销售数据',
    businessType: 'data-processing',
    productType: 'etl',
    steps: [
      { id: '2-1', name: '数据提取' },
      { id: '2-2', name: '数据转换' },
      { id: '2-3', name: '数据加载' }
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z'
  },
  {
    id: '3',
    name: '客户数据集成流程',
    description: '整合多个系统中的客户数据，建立统一的客户视图',
    businessType: 'data-integration',
    productType: 'mdm',
    steps: [
      { id: '3-1', name: '数据源识别' },
      { id: '3-2', name: '数据映射' },
      { id: '3-3', name: '数据合并' },
      { id: '3-4', name: '质量检查' }
    ],
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z'
  }
]

// 计算属性
const filteredProcesses = computed(() => {
  let result = processes.value
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(process => 
      process.name.toLowerCase().includes(keyword) ||
      (process.description && process.description.toLowerCase().includes(keyword))
    )
  }
  
  // 按业务类型筛选
  if (selectedBusinessType.value) {
    result = result.filter(process => process.businessType === selectedBusinessType.value)
  }
  
  return result
})

// 方法
const loadProcesses = async () => {
  try {
    loading.value = true
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    processes.value = mockProcesses
  } catch (error) {
    console.error('加载流程列表失败:', error)
    Message.error('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleCreateProcess = () => {
  emit('create-process')
}

const handleEditProcess = (process: any) => {
  emit('edit-process', process)
}

const handleDeleteProcess = (processId: string) => {
  emit('delete-process', processId)
}

const handleDuplicateProcess = (process: any) => {
  try {
    const duplicatedProcess = {
      ...process,
      id: `${process.id}-copy-${Date.now()}`,
      name: `${process.name} - 副本`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    processes.value.push(duplicatedProcess)
    Message.success('流程复制成功')
  } catch (error) {
    console.error('复制流程失败:', error)
    Message.error('复制失败，请重试')
  }
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

// 工具方法
const getBusinessTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'data-analysis': 'blue',
    'data-processing': 'green',
    'data-integration': 'orange',
    'data-governance': 'purple'
  }
  return colors[type] || 'gray'
}

const getBusinessTypeName = (type: string) => {
  const names: Record<string, string> = {
    'data-analysis': '数据分析',
    'data-processing': '数据处理',
    'data-integration': '数据集成',
    'data-governance': '数据治理'
  }
  return names[type] || type
}

const getProductTypeName = (type: string) => {
  const names: Record<string, string> = {
    'analytics': '分析平台',
    'etl': 'ETL工具',
    'mdm': '主数据管理',
    'governance': '治理平台'
  }
  return names[type] || type
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return '未知时间'
  }
}

// 生命周期
onMounted(() => {
  loadProcesses()
})
</script>

<style scoped>
.process-selection-view {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-title h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.header-desc {
  margin: 0;
  color: var(--color-text-3);
  font-size: 14px;
}

.selection-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.process-list {
  flex: 1;
  overflow: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.process-card {
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  padding: 16px;
  background: var(--color-bg-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.process-card:hover {
  border-color: var(--color-primary-light-4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.process-info {
  flex: 1;
  min-width: 0;
}

.process-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.process-desc {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-3);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.process-actions {
  margin-left: 8px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.process-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.process-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-4);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item svg {
  width: 14px;
  height: 14px;
}

:deep(.arco-dropdown-option.danger) {
  color: var(--color-danger-6);
}

:deep(.arco-dropdown-option.danger:hover) {
  background-color: var(--color-danger-light-1);
}
</style>