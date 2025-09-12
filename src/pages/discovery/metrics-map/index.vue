

<template>
  <div class="metrics-map">
    <div class="page-header">
      <h2>指标地图</h2>
      <div class="metric-type-tabs">
        <a-tabs v-model:active-key="activeMetricType" @change="handleMetricTypeChange">
          <a-tab-pane key="business" title="业务核心指标" />
          <a-tab-pane key="regulatory" title="监管指标" />
        </a-tabs>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="searchKeyword"
            placeholder="搜索指标名称"
            allow-clear
            @press-enter="handleSearch"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4" v-if="activeMetricType === 'business'">
          <a-select
            v-model="selectedCategory"
            placeholder="选择分类"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部分类</a-option>
            <a-option value="用户指标">用户指标</a-option>
            <a-option value="业务域">业务域</a-option>
            <a-option value="交易指标">交易指标</a-option>
          </a-select>
        </a-col>
        <a-col :span="4" v-if="activeMetricType === 'business'">
          <a-select
            v-model="selectedDomain"
            placeholder="选择业务域"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部业务域</a-option>
            <a-option value="获客域">获客域</a-option>
            <a-option value="转化域">转化域</a-option>
            <a-option value="留存域">留存域</a-option>
            <a-option value="变现域">变现域</a-option>
          </a-select>
        </a-col>
        <a-col :span="4" v-if="activeMetricType === 'regulatory'">
          <a-select
            v-model="selectedRegulatoryCategory"
            placeholder="选择监管大类"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部监管大类</a-option>
            <a-option value="资本监管">资本监管</a-option>
            <a-option value="流动性监管">流动性监管</a-option>
            <a-option value="信贷风险监管">信贷风险监管</a-option>
          </a-select>
        </a-col>
        <a-col :span="4" v-if="activeMetricType === 'regulatory'">
          <a-select
            v-model="selectedReportName"
            placeholder="选择报表名称"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部报表</a-option>
            <a-option value="银行业监管统计报表">银行业监管统计报表</a-option>
            <a-option value="人民银行大集中系统报表">人民银行大集中系统报表</a-option>
            <a-option value="银行业风险监管报表">银行业风险监管报表</a-option>
            <a-option value="资本充足率报告">资本充足率报告</a-option>
            <a-option value="流动性风险监管报告">流动性风险监管报告</a-option>
            <a-option value="信贷资产质量报告">信贷资产质量报告</a-option>
          </a-select>
        </a-col>
        <a-col :span="3">
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
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

        <a-table
          :data="tableData"
          :pagination="pagination"
          @page-change="onPageChange"
          @table-render="handleTableRender"
          :scroll="{ x: 1200 }"
        >
          <template #columns>
            <a-table-column title="指标名称" data-index="name" :width="200">
              <template #cell="{ record }">
                <span class="metric-name" @click="showDetail(record)">{{ record.name }}</span>
              </template>
            </a-table-column>
            <a-table-column v-for="column in dynamicColumns" :key="column.dataIndex" 
              :title="column.title" :data-index="column.dataIndex" :width="column.width">
              <template #cell="{ record }" v-if="column.dataIndex === 'businessDefinition'">
                <a-tooltip :content="record.businessDefinition">
                  <div style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ record.businessDefinition }}
                  </div>
                </a-tooltip>
              </template>
            </a-table-column>

          </template>
        </a-table>
        </a-card>
      </a-col>
    </a-row>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'
import type { TreeNodeData } from '@arco-design/web-vue'
import type { RequestOption, UploadRequest, FileItem } from '@arco-design/web-vue/es/upload/interfaces'
import metricsMock from '@/mock/metrics'
import { IconUpload, IconDownload, IconPlus } from '@arco-design/web-vue/es/icon'
import IncrementalImportModal from '@/components/modals/IncrementalImportModal.vue'
import BatchImportModal from '@/components/modals/BatchImportModal.vue'
import BusinessProcessFlow from '@/components/BusinessProcessFlow.vue'
import type { MetricItem } from '@/types/metrics'
import { MetricType } from '@/types/metrics'
import { useRouter } from 'vue-router'

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
  regulatoryCategory: string
  reportName: string
  type: string
}

const searchForm = ref<SearchForm>({
  name: '',
  category: '',
  businessDomain: '',
  regulatoryCategory: '',
  reportName: '',
  type: 'business'
})

// 计算属性已简化，移除了重复的监管分类筛选条件

// 计算属性 - 动态表格列
const dynamicColumns = computed(() => {
  if (activeMetricType.value === 'business') {
    return [
      { title: '指标分类', dataIndex: 'category', width: 120 },
      { title: '业务域', dataIndex: 'businessDomain', width: 120 },
      { title: '业务定义', dataIndex: 'businessDefinition', width: 300 },
      { title: '数据源', dataIndex: 'dataSource', width: 120 },
      { title: '更新频率', dataIndex: 'updateFrequency', width: 100 },
      { title: '负责人', dataIndex: 'owner', width: 100 }
    ]
  } else {
    return [
      { title: '监管大类', dataIndex: 'regulatoryCategory', width: 120 },
      { title: '报表名称', dataIndex: 'reportName', width: 150 },
      { title: '业务定义', dataIndex: 'businessDefinition', width: 300 },
      { title: '数据源', dataIndex: 'dataSource', width: 120 },
      { title: '负责人', dataIndex: 'owner', width: 100 }
    ]
  }
})

// 路由
const router = useRouter()

// 添加缺失的响应式变量
const activeMetricType = ref('business')
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedDomain = ref('')
const selectedRegulatoryCategory = ref('')
const selectedReportName = ref('')
const selectedKeys = ref<(string | number)[]>([])
const showCreateModal = ref(false)

const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10
})

const tableData = ref<MetricItem[]>([])
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

// 计算属性 - 动态树形数据结构
const treeData = computed(() => {
  if (activeMetricType.value === 'business') {
    return [
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
    ]
  } else {
    return [
      {
        title: '资本监管',
        key: '资本监管',
        children: [
          {
            title: '资本充足率报告',
            key: '资本监管-资本充足率报告'
          },
          {
            title: '杠杆率监管报告',
            key: '资本监管-杠杆率监管报告'
          }
        ]
      },
      {
        title: '流动性监管',
        key: '流动性监管',
        children: [
          {
            title: '流动性风险监管报告',
            key: '流动性监管-流动性风险监管报告'
          },
          {
            title: '净稳定资金比例报告',
            key: '流动性监管-净稳定资金比例报告'
          }
        ]
      },
      {
        title: '信贷风险监管',
        key: '信贷风险监管',
        children: [
          {
            title: '信贷资产质量报告',
            key: '信贷风险监管-信贷资产质量报告'
          },
          {
            title: '大额风险暴露报告',
            key: '信贷风险监管-大额风险暴露报告'
          }
        ]
      }
    ]
  }
})

// 处理树节点选择
const handleTabChange = (key: string | number) => {
  // 标签页切换处理逻辑
}

const onTreeSelect = (selectedKeys: (string | number)[], data: { selected?: boolean, selectedNodes: TreeNodeData[], node?: TreeNodeData, e?: Event }) => {
  handleTreeSelect(selectedKeys, data)
}

const handleTreeSelect = (selectedKeys: (string | number)[], data: { selected?: boolean, selectedNodes: TreeNodeData[], node?: TreeNodeData, e?: Event }) => {
  if (selectedKeys.length === 0) {
    // 清空所有筛选条件
    searchForm.value.category = ''
    searchForm.value.businessDomain = ''
    searchForm.value.regulatoryCategory = ''
    searchForm.value.reportName = ''
    selectedCategory.value = ''
    selectedDomain.value = ''
    selectedRegulatoryCategory.value = ''
    selectedReportName.value = ''
    handleSearch()
    return
  }
  
  const selectedKey = String(selectedKeys[0])
  
  if (activeMetricType.value === 'business') {
    // 业务核心指标处理逻辑
    if (selectedKey.includes('-')) {
      const [category, domain] = selectedKey.split('-')
      searchForm.value.category = category
      searchForm.value.businessDomain = domain
      selectedCategory.value = category
      selectedDomain.value = domain
    } else {
      searchForm.value.category = selectedKey
      searchForm.value.businessDomain = ''
      selectedCategory.value = selectedKey
      selectedDomain.value = ''
    }
    // 清空监管指标相关筛选
    searchForm.value.regulatoryCategory = ''
    searchForm.value.reportName = ''
    selectedRegulatoryCategory.value = ''
    selectedReportName.value = ''
  } else {
    // 监管指标处理逻辑 - 只使用监管大类，不使用重复的监管分类
    if (selectedKey.includes('-')) {
      const [regulatoryCategory, reportName] = selectedKey.split('-')
      searchForm.value.regulatoryCategory = regulatoryCategory
      searchForm.value.reportName = reportName
      selectedRegulatoryCategory.value = regulatoryCategory
      selectedReportName.value = reportName
    } else {
      searchForm.value.regulatoryCategory = selectedKey
      searchForm.value.reportName = ''
      selectedRegulatoryCategory.value = selectedKey
      selectedReportName.value = ''
    }
    // 清空业务指标相关筛选
    searchForm.value.category = ''
    searchForm.value.businessDomain = ''
    selectedCategory.value = ''
    selectedDomain.value = ''
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
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        
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
  incrementalFileCount.value = 0
  incrementalModalVisible.value = false
}

// 确认批量上传
const confirmBatchUpload = () => {
  batchFileCount.value = 0
  batchModalVisible.value = false
}

// 批量上传
const handleBatchUpload = async (option: { fileItem: FileItem }): Promise<UploadRequest> => {
  const formData = new FormData()
  formData.append('file', option.fileItem.file as Blob)
  
  try {
    const res = await axios.post<{success: boolean, count: number}>('/api/metrics/batch-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
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
  
  try {
    const res = await axios.post<{success: boolean, count: number}>('/api/metrics/incremental-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
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
    // 直接使用 mock 数据
    let queryParams = { 
      ...searchForm.value, 
      page: pagination.value.current + '', 
      pageSize: pagination.value.pageSize + '',
      type: activeMetricType.value
    }
    const mockList = metricsMock[0].response({ query: queryParams })
    if (mockList && mockList.data) {
      tableData.value = mockList.data.list || []
      pagination.value.total = mockList.data.total || 0
    } else {
      tableData.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('获取指标列表失败:', error)
    tableData.value = []
    pagination.value.total = 0
  }
}

// 指标类型切换处理
const handleMetricTypeChange = (type: string) => {
  activeMetricType.value = type
  searchForm.value.type = type
  
  // 清空筛选条件
  searchKeyword.value = ''
  if (type === 'business') {
    // 业务指标：清空业务相关筛选，保留监管筛选为空
    selectedCategory.value = ''
    selectedDomain.value = ''
    selectedRegulatoryCategory.value = ''
    selectedReportName.value = ''
  } else {
    // 监管指标：清空监管相关筛选，保留业务筛选为空
    selectedRegulatoryCategory.value = ''
    selectedReportName.value = ''
    selectedCategory.value = ''
    selectedDomain.value = ''
  }
  
  // 重置分页
  pagination.value.current = 1
  
  // 重新获取数据
  fetchMetrics()
}

// 搜索处理
const handleSearch = () => {
  // 同步搜索表单数据
  searchForm.value.name = searchKeyword.value
  // 只有业务指标才使用category筛选
  searchForm.value.category = activeMetricType.value === 'business' ? selectedCategory.value : ''
  searchForm.value.businessDomain = selectedDomain.value
  searchForm.value.regulatoryCategory = selectedRegulatoryCategory.value
  searchForm.value.reportName = selectedReportName.value
  searchForm.value.type = activeMetricType.value
  
  pagination.value.current = 1
  fetchMetrics()
}



// 分页处理
const onPageChange = (current: number) => {
  pagination.value.current = current
  fetchMetrics()
}

// 显示详情 - 跳转到详情页面
const showDetail = (record: any) => {
  router.push({
    name: 'MetricsMapDetail',
    params: { id: record.id },
    query: { type: activeMetricType.value }
  })
}





// 表格渲染完成处理
const handleTableRender = () => {
  // 表格渲染完成后的处理逻辑
}

onMounted(() => {
  fetchMetrics();
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

.metric-type-tabs {
  .arco-tabs {
    .arco-tabs-nav {
      margin-bottom: 0;
    }
  }
}


</style>