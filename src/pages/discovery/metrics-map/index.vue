

<template>
  <div class="metrics-map">
    <div class="page-header">
      <h2>指标地图</h2>
      <a-space>
        <a-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <icon-plus />
          </template>
          新建指标
        </a-button>
        <a-button @click="exportMetrics">
          <template #icon>
            <icon-download />
          </template>
          导出
        </a-button>
      </a-space>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索指标名称、描述"
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedCategory"
            placeholder="选择分类"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="business">业务指标</a-option>
            <a-option value="technical">技术指标</a-option>
            <a-option value="quality">质量指标</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedDomain"
            placeholder="业务域"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="user">用户域</a-option>
            <a-option value="transaction">交易域</a-option>
            <a-option value="product">产品域</a-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <a-row :gutter="24">
      <!-- 左侧导航树 -->
      <a-col :span="6">
        <a-card title="指标分类" :bordered="false">
          <a-tree
            v-model:selected-keys="selectedKeys"
            :data="treeData"
            :show-line="true"
            @select="onTreeSelect"
          />
        </a-card>
      </a-col>
      
      <!-- 右侧内容区 -->
      <a-col :span="18">
        <a-card :bordered="false">

        <!-- 指标列表 -->
        <a-table :data="tableData" :pagination="pagination" @page-change="onPageChange" @after-render="handleTableRender">
          <template #columns>
            <a-table-column title="指标名称" dataIndex="name">
              <template #cell="{ record }: { record: any }">
                <div style="display: flex; align-items: center; gap: 8px">
                  <a-link @click="showDetail(record)">{{ record.name }}</a-link>
                  <a-button
                    type="text"
                    size="mini"
                    @click.stop="toggleFavorite(record)"
                  >
                    <template #icon>
                      <icon-star-fill v-if="record.isFavorite" style="color: #f7ba1e" />
                      <icon-star v-else />
                    </template>
                  </a-button>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="指标分类" dataIndex="category" />
            <a-table-column title="业务域" dataIndex="businessDomain" />
            <a-table-column title="业务口径" dataIndex="businessDefinition" />
            <a-table-column title="指标负责人" dataIndex="owner" />
          </template>
        </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 指标详情抽屉 -->
    <a-drawer
      v-model:visible="drawerVisible"
      :width="800"
      title="指标详情"
      @cancel="closeDrawer"
      placement="right"
      :mask="false"
      :wrap-style="{ top: '64px', height: 'calc(100% - 64px)' }"
    >
      <template v-if="currentMetric">
        <a-space direction="vertical" size="small" fill style="padding: 12px 16px">
          <!-- 分类导航 -->
          <a-tabs type="rounded" :default-active-key="0" @change="handleTabChange">
            <a-tab-pane key="0" title="基础信息"></a-tab-pane>
            <a-tab-pane key="1" title="业务口径"></a-tab-pane>
            <a-tab-pane key="2" title="技术逻辑"></a-tab-pane>
            <a-tab-pane key="3" title="报表位置"></a-tab-pane>
            <a-tab-pane key="4" title="结果表信息"></a-tab-pane>
            <a-tab-pane key="5" title="查询代码"></a-tab-pane>
            <a-tab-pane key="6" title="历史版本"></a-tab-pane>
          </a-tabs>
          
          <a-row :gutter="24">
            <a-col :span="24">
              <!-- 基础信息 -->
              <a-card class="detail-card">
                <template #title>
                  <span class="card-title" @click="scrollToCard('basic-info')">基础信息</span>
                </template>
                <a-descriptions :column="2" :label-style="{ 'font-weight': 600 }">
                  <a-descriptions-item label="指标名称">
                    <span class="highlight-text">{{ currentMetric.name }}</span>
                  </a-descriptions-item>
                  <a-descriptions-item label="指标编号">{{ currentMetric.code }}</a-descriptions-item>
                  <a-descriptions-item label="分类/业务域">
                    <a-tag>{{ currentMetric.category }}</a-tag>
                    <a-tag color="purple" style="margin-left: 8px">{{ currentMetric.businessDomain }}</a-tag>
                  </a-descriptions-item>
                  <a-descriptions-item label="负责人">
                    <span class="highlight-text">{{ currentMetric.owner }}</span>
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
          </a-row>

          <!-- 业务口径 -->
          <a-card class="detail-card">
            <template #title>
              <span class="card-title" @click="scrollToCard('business-definition')">业务口径</span>
            </template>
            <a-descriptions :column="1" :label-style="{ 'font-weight': 600 }">
              <a-descriptions-item label="业务定义">
                <div class="description-content">{{ currentMetric.businessDefinition }}</div>
              </a-descriptions-item>
              <a-descriptions-item label="使用场景">
                <div class="description-content">{{ currentMetric.useCase }}</div>
              </a-descriptions-item>
              <a-descriptions-item label="统计周期">
                <a-tag color="blue">{{ currentMetric.statisticalPeriod }}</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 技术逻辑 -->
          <a-card class="detail-card">
            <template #title>
              <span class="card-title" @click="scrollToCard('technical-logic')">技术逻辑</span>
            </template>
            <a-descriptions :column="1" :label-style="{ 'font-weight': 600 }">
              <a-descriptions-item label="数据来源表">
                <div class="code-block">{{ currentMetric.sourceTable }}</div>
              </a-descriptions-item>
              <a-descriptions-item label="加工逻辑">
                <a-typography-paragraph code class="code-block">
                  {{ currentMetric.processingLogic }}
                </a-typography-paragraph>
              </a-descriptions-item>
              <a-descriptions-item label="关联字段说明">
                <div class="description-content">{{ currentMetric.fieldDescription }}</div>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 报表位置 -->
          <a-card class="detail-card">
            <template #title>
              <span class="card-title" @click="scrollToCard('report-position')">报表位置</span>
            </template>
            <a-descriptions :column="1" :label-style="{ 'font-weight': 600 }">
              <a-descriptions-item label="报表信息">
                <div class="description-content">{{ currentMetric.reportInfo }}</div>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 结果表信息 -->
          <a-card class="detail-card">
            <template #title>
              <span class="card-title" @click="scrollToCard('result-table')">结果表信息</span>
            </template>
            <a-descriptions :column="1" :label-style="{ 'font-weight': 600 }">
              <a-descriptions-item label="存储位置">
                <div class="code-block">{{ currentMetric.storageLocation }}</div>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 查询代码 -->
          <a-card class="detail-card">
            <template #title>
              <span class="card-title" @click="scrollToCard('query-code')">查询代码</span>
            </template>
            <a-typography-paragraph code class="code-block query-code">
              {{ currentMetric.queryCode }}
            </a-typography-paragraph>
          </a-card>

          <!-- 历史版本 -->
          <a-card class="detail-card">
            <template #title>
              <span class="card-title" @click="scrollToCard('history-version')">历史版本</span>
            </template>
            <a-timeline class="version-timeline">
              <a-timeline-item
                v-for="(version, index) in currentMetric.versions"
                :key="index"
              >
                <div class="version-item">
                  <span class="version-date">{{ version.date }}</span>
                  <span class="version-description">{{ version.description }}</span>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-card>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'
import type { TreeNodeData } from '@arco-design/web-vue'
import type { RequestOption, UploadRequest, FileItem } from '@arco-design/web-vue/es/upload/interfaces'
import metricsMock from '@/mock/metrics'
import { IconUpload, IconStarFill, IconStar, IconDownload, IconPlus } from '@arco-design/web-vue/es/icon'
import IncrementalImportModal from '@/components/modals/IncrementalImportModal.vue'
import BatchImportModal from '@/components/modals/BatchImportModal.vue'
import BusinessProcessFlow from '@/components/BusinessProcessFlow.vue'
import type { MetricItem } from '@/types/metrics'

interface ApiResponse<T> {
  data: {
    list: T[]
    total: number
  }
}

interface SearchForm {
  name: string
  category: string
  businessDomain: string
  onlyFavorite: boolean
  isFavorite?: boolean
}

const searchForm = ref<SearchForm>({
  name: '',
  category: '',
  businessDomain: '',
  onlyFavorite: false
})

// 添加缺失的响应式变量
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedDomain = ref('')
const selectedKeys = ref<(string | number)[]>([])
const showCreateModal = ref(false)

const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10
})

const tableData = ref<MetricItem[]>([])
const drawerVisible = ref(false)
const currentMetric = ref<MetricItem | null>(null)
const incrementalModalVisible = ref(false)
const batchModalVisible = ref(false)
const incrementalFileCount = ref(0)
const batchFileCount = ref(0)

const showIncrementalModal = () => {
  incrementalModalVisible.value = true
}

const showBatchModal = () => {
  batchModalVisible.value = true
}

// 树形数据结构
const treeData = ref([
  {
    title: '用户指标',
    key: '用户指标',
    children: [
      {
        title: '获客域',
        key: '用户指标-获客域'
      },
      {
        title: '转化域',
        key: '用户指标-转化域'
      },
      {
        title: '留存域',
        key: '用户指标-留存域'
      }
    ]
  },
  {
    title: '交易指标',
    key: '交易指标',
    children: [
      {
        title: '变现域',
        key: '交易指标-变现域'
      }
    ]
  }
])

// 处理树节点选择
const handleTabChange = (key: string | number) => {
  console.log('切换标签页:', key)
}

const onTreeSelect = (selectedKeys: (string | number)[], data: { selected?: boolean, selectedNodes: TreeNodeData[], node?: TreeNodeData, e?: Event }) => {
  handleTreeSelect(selectedKeys, data)
}

const handleTreeSelect = (selectedKeys: (string | number)[], data: { selected?: boolean, selectedNodes: TreeNodeData[], node?: TreeNodeData, e?: Event }) => {
  if (selectedKeys.length === 0) {
    searchForm.value.category = ''
    searchForm.value.businessDomain = ''
    handleSearch()
    return
  }
  
  const selectedKey = String(selectedKeys[0])
  if (selectedKey.includes('-')) {
    const [category, domain] = selectedKey.split('-')
    searchForm.value.category = category
    searchForm.value.businessDomain = domain
  } else {
    searchForm.value.category = selectedKey
    searchForm.value.businessDomain = ''
  }
  handleSearch()
}

// 下载模板
const downloadTemplate = (type: string) => {
  const link = document.createElement('a')
  link.href = `/templates/metrics-${type}-template.xlsx`
  link.download = `指标${type === 'incremental' ? '增量' : '批量'}导入模板.xlsx`
  link.click()
}

// 处理文件变化
const handleFileChange = (type: string, event: any) => {
  const file = event.file
  if (file) {
    console.log(`[${type}上传] 选择的文件:`, file.name, '大小:', file.size, '类型:', file.type)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        console.log(`[${type}上传] 解析成功，共${jsonData.length}条记录`, jsonData.slice(0, 3))
        
        if (type === 'incremental') {
          incrementalFileCount.value = jsonData.length
        } else {
          batchFileCount.value = jsonData.length
        }
      } catch (error) {
        console.error('文件解析失败:', error)
      }
    }
    reader.readAsArrayBuffer(file)
  }
}

// 确认增量上传
const confirmIncrementalUpload = () => {
  console.log('确认增量上传', incrementalFileCount.value, '条记录')
  console.log('触发增量上传API请求')
  incrementalFileCount.value = 0
  incrementalModalVisible.value = false
}

// 确认批量上传
const confirmBatchUpload = () => {
  console.log('确认批量上传', batchFileCount.value, '条记录')
  console.log('触发批量上传API请求')
  batchFileCount.value = 0
  batchModalVisible.value = false
}

// 批量上传
const handleBatchUpload = async (option: { fileItem: FileItem }): Promise<UploadRequest> => {
  const formData = new FormData()
  formData.append('file', option.fileItem.file as Blob)
  console.log('开始批量上传文件:', option.fileItem.name)
  
  try {
    const res = await axios.post<{success: boolean, count: number}>('/api/metrics/batch-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    console.log('批量上传响应:', res.data)
    
    if (res.data.success) {
      batchFileCount.value = res.data.count
      fetchMetrics()
    }
  } catch (error) {
    console.error('批量上传失败:', error)
  }
  
  return {
    abort: () => {}
  }
}

// 增量上传
const handleIncrementalUpload = async (option: { fileItem: FileItem }): Promise<UploadRequest> => {
  const formData = new FormData()
  formData.append('file', option.fileItem.file as Blob)
  console.log('开始增量上传文件:', option.fileItem.name)
  
  try {
    const res = await axios.post<{success: boolean, count: number}>('/api/metrics/incremental-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    console.log('增量上传响应:', res.data)
    
    if (res.data.success) {
      incrementalFileCount.value = res.data.count
      fetchMetrics()
    }
  } catch (error) {
    console.error('增量上传失败:', error)
  }
  
  return {
    abort: () => {}
  }
}

// 获取指标列表
const fetchMetrics = async () => {
  try {
    console.log('请求参数:', {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    })
    // 直接使用 mock 数据
    let queryParams = { ...searchForm.value, page: pagination.value.current + '', pageSize: pagination.value.pageSize + '' }
    if (searchForm.value.onlyFavorite) {
      queryParams.isFavorite = true
    }
    const mockList = metricsMock[0].response({ query: queryParams })
    console.log('Mock数据:', mockList)
    if (mockList && mockList.data) {
      tableData.value = mockList.data.list || []
      pagination.value.total = mockList.data.total || 0
      console.log('更新后的表格数据:', tableData.value)
      console.log('更新后的分页信息:', pagination.value)
    } else {
      console.warn('Mock数据格式异常:', mockList)
      tableData.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('获取指标列表失败:', error)
    tableData.value = []
    pagination.value.total = 0
  }
}

// 搜索处理
const handleSearch = () => {
  // 同步搜索表单数据
  searchForm.value.name = searchKeyword.value
  searchForm.value.category = selectedCategory.value
  searchForm.value.businessDomain = selectedDomain.value
  
  pagination.value.current = 1
  fetchMetrics()
}

// 导出指标
const exportMetrics = () => {
  console.log('导出指标数据')
  // 这里可以添加导出逻辑
}

// 分页处理
const onPageChange = (current: number) => {
  pagination.value.current = current
  fetchMetrics()
}

// 显示详情
const showDetail = (record: any) => {
  currentMetric.value = record
  drawerVisible.value = true
}

// 关闭详情抽屉
const scrollToCard = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const closeDrawer = () => {
  drawerVisible.value = false
  currentMetric.value = null
}

// 收藏切换
const toggleFavorite = (record: any) => {
  record.isFavorite = !record.isFavorite
}

const toggleFavoriteFilter = () => {
  searchForm.value.onlyFavorite = !searchForm.value.onlyFavorite
  handleSearch()
}

// 表格渲染完成处理
const handleTableRender = () => {
  console.log('表格渲染完成，当前容器宽度:', document.querySelector('.metrics-map')?.clientWidth)
  console.log('表格列宽计算:', document.querySelectorAll('.arco-table-col').forEach((col: any) => {
    console.log(col.dataset.columnKey, '宽度:', col.clientWidth)
  }))
}

onMounted(() => {
    console.log('组件挂载，开始获取数据')
    console.log('初始容器宽度:', document.querySelector('.metrics-map')?.clientWidth)
    fetchMetrics()
  })
</script>

<style scoped>
.metrics-map {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.tree-card {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.metrics-table {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-name {
  font-weight: 500;
  color: #1890ff;
  cursor: pointer;
}

.metric-name:hover {
  text-decoration: underline;
}

.favorite-btn {
  border: none;
  background: none;
  padding: 4px;
}

.favorite-btn:hover {
  background-color: #f5f5f5;
}

.metric-detail-drawer {
  .drawer-content {
    padding: 0;
  }
  
  .detail-section {
    margin-bottom: 24px;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1d2129;
  }
}

.detail-card {
  border-radius: 4px;
  margin-bottom: 8px;
  max-width: 100%;
  overflow: hidden;
  width: 100%;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
}

.highlight-text {
  color: #165DFF;
  font-weight: 600;
}

.description-content {
  white-space: pre-wrap;
  line-height: 1.3;
  font-size: 13px;
}

.code-block {
  background-color: #f5f5f5;
  padding: 6px 10px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  font-size: 13px;
}

.query-code {
  margin: 0;
}

.version-timeline {
  padding: 8px 0;
}

.version-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.version-date {
  color: #86909c;
  font-size: 12px;
}

.version-description {
  color: #1d2129;
}
</style>