<template>
  <div class="variable-management-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item>变量管理</a-breadcrumb-item>
        <a-breadcrumb-item>变量列表</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <h1 class="page-title">变量管理</h1>
        <div class="header-actions">
          <a-dropdown trigger="click" @select="handleCreateMenuSelect">
            <a-button type="primary">
              <template #icon><icon-plus /></template>
              新建变量
            </a-button>
            <template #content>
              <a-doption value="create">单独注册</a-doption>
              <a-doption value="incremental">导入更新</a-doption>
            </template>
          </a-dropdown>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出变量清单
          </a-button>
        </div>
      </div>
    </div>

  <div class="page-content">
      <!-- 统计概览 -->
      <a-row :gutter="16" class="stats-row">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">变量总数</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.active }}</div>
              <div class="stat-label">活跃变量</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.inactive }}</div>
              <div class="stat-label">已停用</div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 搜索筛选 -->
      <a-card class="filter-card">
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="关键词">
            <a-input
              v-model="filterForm.keyword"
              placeholder="搜索变量名称、编码或描述"
              allow-clear
              @change="handleSearch"
            />
          </a-form-item>
          <a-form-item label="变量类型">
            <a-select
              v-model="filterForm.type"
              placeholder="全部类型"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="numerical">数值型</a-option>
              <a-option value="categorical">分类型</a-option>
              <a-option value="text">文本型</a-option>
              <a-option value="datetime">时间型</a-option>
              <a-option value="boolean">布尔型</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model="filterForm.status"
              placeholder="全部状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="draft">草稿</a-option>
              <a-option value="pending">待审核</a-option>
              <a-option value="active">已发布</a-option>
              <a-option value="inactive">已停用</a-option>
              <a-option value="expired">已过期</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="数据源">
            <a-select
              v-model="filterForm.dataSource"
              placeholder="全部数据源"
              allow-clear
              @change="handleSearch"
            >
              <a-option v-for="source in dataSources" :key="source.id" :value="source.id">
                {{ source.name }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 变量列表 -->
      <a-card class="table-card">
        <a-modal v-model:visible="incrementalModalVisible" title="导入更新变量" width="600px" @ok="confirmIncrementalUpload" @cancel="incrementalModalVisible = false">
          <a-upload :auto-upload="false" :limit="1" :accept="'.xlsx,.xls'" @change="handleIncrementalFileChange">
            <a-button>选择Excel文件</a-button>
          </a-upload>
          <div style="margin-top: 12px">已解析记录数：{{ incrementalFileCount }}</div>
        </a-modal>
        <a-table
          :data="variableList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
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
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                详情
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                :status="record.status === 'active' ? 'warning' : 'normal'"
                @click="handleToggleStatus(record)"
              >
                {{ record.status === 'active' ? '停用' : '启用' }}
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useVariableStore } from '@/store/modules/variable'
import { incrementalImportVariables, getDataSources } from '@/api/variable-management'
import * as XLSX from 'xlsx'

const router = useRouter()
const variableStore = useVariableStore()

// 统计数据
const stats = computed(() => variableStore.variableStats)

// 筛选表单
const filterForm = reactive({
  keyword: '',
  type: '',
  status: '',
  dataSource: ''
})

// 数据源列表
const dataSources = ref([])

// 新建变量改为跳转页面，不再使用弹窗

// 变量列表
const variableList = computed(() => variableStore.filteredVariables)
const loading = computed(() => variableStore.variableLoading)

// 分页配置
const pagination = reactive({
  current: computed(() => variableStore.pagination.page),
  pageSize: computed(() => variableStore.pagination.pageSize),
  total: computed(() => variableStore.variableTotal),
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '变量名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '变量编码',
    dataIndex: 'code',
    width: 180
  },
  {
    title: '类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '数据源',
    dataIndex: 'dataSourceName',
    width: 150
  },
  
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180
  },
  {
    title: '操作',
    dataIndex: 'actions',
    slotName: 'actions',
    width: 180,
    fixed: 'right'
  }
]

// 类型映射
const typeMap = {
  numerical: { label: '数值型', color: 'blue' },
  categorical: { label: '分类型', color: 'green' },
  text: { label: '文本型', color: 'orange' },
  datetime: { label: '时间型', color: 'purple' },
  boolean: { label: '布尔型', color: 'cyan' }
}

// 状态映射
const statusMap = {
  draft: { label: '草稿', color: 'gray' },
  pending: { label: '待审核', color: 'orange' },
  active: { label: '已发布', color: 'green' },
  inactive: { label: '已停用', color: 'red' },
  expired: { label: '已过期', color: 'lightgray' }
}

// 获取类型标签
const getTypeLabel = (type) => typeMap[type]?.label || type
const getTypeColor = (type) => typeMap[type]?.color || 'gray'

// 获取状态标签
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusColor = (status) => statusMap[status]?.color || 'gray'

// 已移除数据质量相关显示

// 获取统计数据
const fetchStats = async () => {
  try {
    // 统计数据已通过getter自动计算
    console.log('变量统计:', stats.value)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取数据源列表
const fetchDataSources = async () => {
  try {
    const res = await getDataSources()
    if (res.code === 200) {
      dataSources.value = res.data || []
    }
  } catch (error) {
    console.error('获取数据源列表失败:', error)
  }
}

// 获取变量列表
const fetchVariableList = async () => {
  try {
    await variableStore.fetchVariableList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword,
      type: filterForm.type,
      status: filterForm.status
    })
  } catch (error) {
    console.error('获取变量列表失败:', error)
    Message.error('获取变量列表失败')
  }
}

// 搜索处理
const handleSearch = () => {
  variableStore.updateFilters({
    keyword: filterForm.keyword,
    type: filterForm.type,
    status: filterForm.status
  })
  pagination.current = 1
  fetchVariableList()
}

// 重置筛选
const handleReset = () => {
  filterForm.keyword = ''
  filterForm.type = ''
  filterForm.status = ''
  filterForm.dataSource = ''
  variableStore.resetFilters()
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
  fetchVariableList()
}

// 查看详情
const handleViewDetail = (record) => {
  router.push({ name: 'VariableAssetDetail', params: { id: record.id, mode: 'view' } })
}

// 编辑变量
const handleEdit = (record) => {
  router.push({ name: 'VariableAssetDetail', params: { id: record.id, mode: 'edit' } })
}

// 切换状态
const handleToggleStatus = async (record) => {
  try {
    const newStatus = record.status === 'active' ? 'inactive' : 'active'
    // 实际应调用API更新状态
    Message.success(`变量状态已更新为${getStatusLabel(newStatus)}`)
    fetchVariableList()
  } catch (error) {
    Message.error('状态更新失败')
  }
}

// 创建变量（跳转页面）
const handleCreate = () => {
  router.push('/discovery/asset-management/variable-management/create/edit')
}

// 导出变量清单
const handleExport = () => {
  Message.info('导出功能开发中...')
}

// 弹窗创建逻辑已移除

const incrementalModalVisible = ref(false)
const incrementalFileCount = ref(0)
const incrementalRecords = ref([])

const showIncrementalModal = () => {
  incrementalModalVisible.value = true
  incrementalFileCount.value = 0
  incrementalRecords.value = []
}

const handleCreateMenuSelect = (val) => {
  if (val === 'create') {
    handleCreate()
  } else if (val === 'incremental') {
    showIncrementalModal()
  }
}


const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) return resolve([])
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet)
        const records = json.map((r) => ({
          name: r.name || r.变量名称 || '',
          code: r.code || r.变量编码 || '',
          type: r.type || r.类型 || '',
          status: r.status || r.状态 || 'draft',
          dataSource: r.dataSource || r.数据源 || '',
          usageCount: Number(r.usageCount ?? r.使用次数 ?? 0),
          sourceField: r.sourceField ?? r.来源字段 ?? '',
          updateFrequency: r.updateFrequency ?? r.更新频率 ?? '',
          definition: r.definition ?? r.定义说明 ?? '',
          description: r.description ?? r.描述 ?? ''
        }))
        resolve(records)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const handleIncrementalFileChange = async (info) => {
  const file = info.file?.file
  if (!file) return
  try {
    const records = await parseExcelFile(file)
    incrementalRecords.value = records
    incrementalFileCount.value = records.length
  } catch (e) {
    Message.error('解析文件失败')
  }
}



const confirmIncrementalUpload = async () => {
  try {
    const res = await incrementalImportVariables(incrementalRecords.value)
    if (res.code === 200) {
      Message.success(`导入更新成功 ${res.data?.count || 0} 条`)
      incrementalModalVisible.value = false
      await variableStore.fetchVariableList({ page: 1, pageSize: variableStore.pagination.pageSize })
    }
  } catch (e) {
    Message.error('导入更新失败')
  }
}



// 初始化
onMounted(() => {
  fetchStats()
  fetchDataSources()
  fetchVariableList()
})
</script>

<style scoped>
.variable-management-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #86909c;
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

 
</style>
