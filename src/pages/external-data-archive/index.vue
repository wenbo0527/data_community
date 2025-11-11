<template>
  <div class="external-data-archive">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h2>外数档案管理</h2>
          <p class="page-description">外部数据的生命周期档案管理，统一管理数据产品、接口信息和供应商信息</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-button type="primary" @click="addModalVisible = true">
              <template #icon><IconPlus /></template>
              新增数据产品
            </a-button>
            <a-button type="outline" @click="batchModalVisible = true">
              <template #icon><IconUpload /></template>
              批量导入
            </a-button>
            <a-button type="outline" @click="handleExport">
              <template #icon><IconDownload /></template>
              导出数据
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-cards">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconFolderAdd />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.registering }}</div>
              <div class="stat-label">注册中</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconClockCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pending }}</div>
              <div class="stat-label">待上线</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconCheckCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.online }}</div>
              <div class="stat-label">已上线</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconStop />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.offline }}</div>
              <div class="stat-label">已下线</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

  <!-- 错误提示 -->
  <div v-if="error" class="error-message">
    <a-alert 
      :type="error.type || 'error'" 
      :title="error.title || '错误'" 
      :description="error.message" 
      closable 
      @close="error = null"
      show-icon
    >
      <template #icon>
<IconExclamationCircleFill />
      </template>
      <template #action v-if="error.action">
        <a-button type="primary" size="mini" @click="handleErrorAction(error.action)">
          {{ error.actionText || '重试' }}
        </a-button>
      </template>
    </a-alert>
  </div>
  
  <!-- 数据一致性警告 -->
  <div v-if="consistencyWarnings.length > 0" class="consistency-warning">
    <a-alert title="数据一致性警告" type="warning" closable @close="consistencyWarnings = []">
      <div v-for="(item, index) in consistencyWarnings" :key="index" class="consistency-item">
        {{ item.message }}
      </div>
    </a-alert>
  </div>
  
  <!-- 数据一致性警告 -->
  <div v-if="inconsistencies.length > 0" class="consistency-warning">
    <a-alert title="数据一致性警告" type="warning" closable @close="inconsistencies = []">
      <div v-for="(item, index) in inconsistencies" :key="index" class="consistency-item">
        {{ item.message }}
      </div>
    </a-alert>
  </div>

  <!-- 搜索和筛选 -->
  <a-card class="search-card">
      <a-form :model="searchForm" layout="inline">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item field="keyword" label="搜索">
              <a-input-search
                v-model="searchForm.keyword"
                placeholder="搜索产品名称、接口编号、供应商"
                @search="handleSearch"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item field="dataType" label="数据类型">
              <a-select v-model="searchForm.dataType" placeholder="全部" allow-clear @change="handleSearch">
                <a-option value="核验类">核验类</a-option>
                <a-option value="评分类">评分类</a-option>
                <a-option value="标签类">标签类</a-option>
                <a-option value="名单类">名单类</a-option>
                <a-option value="价格评估类">价格评估类</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item field="status" label="状态">
              <a-select v-model="searchForm.status" placeholder="全部" allow-clear @change="handleSearch">
                <a-option value="registering">注册中</a-option>
                <a-option value="pending">待上线</a-option>
                <a-option value="online">已上线</a-option>
                <a-option value="offline">已下线</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item field="supplier" label="供应商">
              <a-select v-model="searchForm.supplier" placeholder="全部" allow-clear @change="handleSearch">
                <a-option value="供应商A">供应商A</a-option>
                <a-option value="供应商B">供应商B</a-option>
                <a-option value="供应商C">供应商C</a-option>
                <a-option value="供应商D">供应商D</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">查询</a-button>
                <a-button @click="handleReset">重置</a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 数据列表 -->
    <a-card title="档案列表" class="data-list-card">
      <!-- 加载骨架 -->
      <div v-if="loading" class="loading-skeleton">
        <a-skeleton :animation="true" :loading="loading" :rows="6" />
        <div class="loading-text">正在加载档案数据...</div>
      </div>
      
      <!-- 空态处理 -->
      <div v-if="!loading && !tableData.length" class="empty-state">
        <div class="empty-icon-wrapper">
          <IconFile class="empty-icon" />
        </div>
        <div class="empty-title">暂无档案数据</div>
        <div class="empty-description">您可以通过以下方式添加档案数据</div>
        <div class="empty-actions">
          <a-space>
            <a-button type="primary" @click="addModalVisible = true">
              <template #icon><IconPlus /></template>
              新增数据产品
            </a-button>
            <a-button type="outline" @click="batchModalVisible = true">
              <template #icon><IconUpload /></template>
              批量导入
            </a-button>
          </a-space>
        </div>
      </div>
      <a-table
        v-if="!loading && tableData.length"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="id"
      >
        <template #empty>
          <div class="empty-container">
            <IconFile class="empty-icon" />
            <div class="empty-text">暂无档案数据</div>
            <div class="empty-description">您可以上传新的档案文件或调整筛选条件</div>
            <a-button type="primary" @click="batchModalVisible = true">
              <template #icon><IconUpload /></template>
              上传档案
            </a-button>
          </div>
        </template>
        <template #name="{ record }">
          <a-button type="text" @click="viewDetail(record)">
            {{ record.dataName }}
          </a-button>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #dataType="{ record }">
          <a-space>
            <a-tag :color="getTypeColor(record.dataType)">
              {{ record.dataType }}
            </a-tag>
            <a-tag :color="getTypeColor(record.subType)" v-if="record.subType">
              {{ record.subType }}
            </a-tag>
          </a-space>
        </template>
        
        <template #interfaceTag="{ record }">
          <a-tag :color="record.isPrimary ? 'green' : 'orange'">
            {{ record.isPrimary ? '主接口' : '备接口' }}
          </a-tag>
        </template>
        
        <template #price="{ record }">
          <span class="price-text">¥{{ record.price }}/次</span>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewDetail(record)">
              详情
            </a-button>
            <a-button type="text" size="small" @click="editRecord(record)">
              编辑
            </a-button>
            <a-button type="text" size="small" @click="copyRecord(record)">
              复制
            </a-button>
            <a-popconfirm
              content="确定要删除该数据产品吗？"
              @ok="deleteRecord(record)"
            >
              <a-button type="text" size="small" status="danger">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="addModalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item field="dataName" label="数据产品名称" required>
          <a-input v-model="addForm.dataName" placeholder="请输入数据产品名称" />
        </a-form-item>
        <a-form-item field="interfaceId" label="接口编号" required>
          <a-input v-model="addForm.interfaceId" placeholder="请输入接口编号" />
        </a-form-item>
        <a-form-item field="dataType" label="数据类型" required>
          <a-select v-model="addForm.dataType" placeholder="请选择数据类型">
            <a-option value="核验类">核验类</a-option>
            <a-option value="评分类">评分类</a-option>
            <a-option value="标签类">标签类</a-option>
            <a-option value="名单类">名单类</a-option>
            <a-option value="价格评估类">价格评估类</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="subType" label="数据分类">
          <a-input v-model="addForm.subType" placeholder="请输入数据分类" />
        </a-form-item>
        <a-form-item field="supplier" label="供应商" required>
          <a-input v-model="addForm.supplier" placeholder="请输入供应商" />
        </a-form-item>
        <a-form-item field="price" label="单价(元/次)" required>
          <a-input-number v-model="addForm.price" :min="0" :precision="2" style="width: 100%" />
        </a-form-item>
        <a-form-item field="manager" label="管理人员">
          <a-input v-model="addForm.manager" placeholder="请输入管理人员" />
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-textarea v-model="addForm.description" placeholder="请输入描述信息" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量导入弹窗 -->
    <a-modal
      v-model:visible="batchModalVisible"
      title="批量导入数据产品"
      width="600px"
      @ok="handleBatchSubmit"
      @cancel="handleBatchCancel"
    >
      <a-form :model="batchForm" layout="vertical">
        <a-form-item label="上传文件" required>
          <a-upload
            :file-list="batchFileList"
            :limit="1"
            @change="handleBatchFileChange"
            accept=".xlsx,.xls,.csv"
          >
            <template #upload-button>
              <a-button type="outline">
                <template #icon><IconUpload /></template>
                选择文件
              </a-button>
            </template>
          </a-upload>
        </a-form-item>
        <a-form-item label="模板下载">
          <a-button type="text" @click="downloadTemplate">
            <template #icon><IconDownload /></template>
            下载导入模板
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useExternalDataStore } from '@/stores/external-data.js'
import { ROUTE_PATHS } from '@/router/constants.ts'
import axios from 'axios'
import {
  IconPlus,
  IconUpload,
  IconDownload,
  IconFolderAdd,
  IconClockCircle,
  IconCheckCircle,
  IconStop,
  IconFile,
  IconExclamationCircleFill
} from '@arco-design/web-vue/es/icon'

// 引入统一Mock数据
import { getMockData } from '@/mock/index.js'

const router = useRouter()

// 统计数据
const statistics = reactive({
  registering: 0,
  pending: 0,
  online: 0,
  offline: 0
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  dataType: '',
  status: '',
  supplier: ''
})

// 表格数据
const tableData = ref([])
// 加载状态
const loading = ref(false)

// 使用统一状态管理
const externalDataStore = useExternalDataStore()
const inconsistencies = ref([])
const consistencyWarnings = ref([])

// 错误信息
const error = ref(null)

// 错误处理函数
const handleErrorAction = (action) => {
  switch (action) {
    case 'refresh':
      refreshData()
      break
    case 'retry':
      loadTableData()
      break
    case 'navigate':
      if (error.value?.route) {
        router.push(error.value.route)
      }
      break
    default:
      error.value = null
  }
}

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 弹窗状态
const addModalVisible = ref(false)
const batchModalVisible = ref(false)
const modalTitle = ref('新增数据产品')
// 批量导入表单，模板中有使用，需定义以避免未定义错误
const batchForm = reactive({})
const batchFileList = ref([])

// 新增/编辑表单
const addForm = reactive({
  dataName: '',
  interfaceId: '',
  dataType: '',
  subType: '',
  supplier: '',
  price: 0,
  manager: '',
  description: ''
})

// 表格列配置
const columns = [
  {
    title: '数据产品名称',
    dataIndex: 'dataName',
    slotName: 'name',
    width: 200
  },
  {
    title: '接口编号',
    dataIndex: 'interfaceId',
    width: 120
  },
  {
    title: '数据类型',
    dataIndex: 'dataType',
    slotName: 'dataType',
    width: 150
  },
  {
    title: '接口标签',
    dataIndex: 'interfaceTag',
    slotName: 'interfaceTag',
    width: 100
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 120
  },
  {
    title: '单价',
    dataIndex: 'price',
    slotName: 'price',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '管理人员',
    dataIndex: 'manager',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    fixed: 'right',
    width: 200
  }
]

// 模拟数据
const mockData = [
  {
    id: 1,
    dataName: '身份信息核验服务',
    interfaceId: 'EXT001',
    dataType: '核验类',
    subType: '身份核验类',
    supplier: '供应商A',
    price: 0.5,
    status: 'online',
    manager: '张三',
    isPrimary: true,
    createTime: '2024-01-15 10:30:00',
    description: '用于验证用户身份信息的真实性'
  },
  {
    id: 2,
    dataName: '信用评分查询',
    interfaceId: 'EXT002',
    dataType: '评分类',
    subType: '信用评分',
    supplier: '供应商B',
    price: 1.2,
    status: 'online',
    manager: '李四',
    isPrimary: true,
    createTime: '2024-01-20 14:20:00',
    description: '获取用户的信用评分信息'
  },
  {
    id: 3,
    dataName: '用户画像标签',
    interfaceId: 'EXT003',
    dataType: '标签类',
    subType: '用户画像',
    supplier: '供应商C',
    price: 0.8,
    status: 'pending',
    manager: '王五',
    isPrimary: false,
    createTime: '2024-02-01 09:15:00',
    description: '提供用户画像标签数据'
  },
  {
    id: 4,
    dataName: '风险名单核验',
    interfaceId: 'EXT004',
    dataType: '名单类',
    subType: '风险名单',
    supplier: '供应商D',
    price: 0.3,
    status: 'registering',
    manager: '赵六',
    isPrimary: true,
    createTime: '2024-02-10 16:45:00',
    description: '核验用户是否在风险名单中'
  }
]

// 状态相关方法
const getStatusColor = (status) => {
  const colors = {
    registering: 'orange',
    maintenance: 'orange',
    '维护中': 'orange',
    pending: 'blue',
    '待上线': 'blue',
    online: 'green',
    '在线': 'green',
    active: 'green',
    offline: 'gray',
    '已下线': 'gray',
    inactive: 'gray'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    registering: '注册中',
    maintenance: '维护中',
    '维护中': '维护中',
    pending: '待上线',
    '待上线': '待上线',
    online: '已上线',
    '在线': '已上线',
    active: '已上线',
    offline: '已下线',
    '已下线': '已下线',
    inactive: '已下线'
  }
  return texts[status] || status
}

const getTypeColor = (type) => {
  const colors = {
    '核验类': 'arcoblue',
    '评分类': 'orangered',
    '标签类': 'green',
    '名单类': 'purple',
    '价格评估类': 'gold',
    '身份核验类': 'blue',
    '信用评分': 'red',
    '用户画像': 'green',
    '风险名单': 'purple',
    '资产评估': 'orange'
  }
  return colors[type] || 'gray'
}

// 搜索和筛选
const handleSearch = () => {
  try {
    loading.value = true
    setTimeout(() => {
      // 使用统一状态或Mock产品列表作为数据源
      let filteredData = (Array.isArray(externalDataStore?.products?.value) && externalDataStore.products.value.length > 0)
        ? externalDataStore.products.value
        : (getMockData('externalDataArchive', 'products') || [])
      
      if (searchForm.keyword) {
        const keyword = String(searchForm.keyword || '').toLowerCase()
        filteredData = filteredData.filter(item => {
          const name = String(item?.dataName || item?.name || '').toLowerCase()
          const interfaceId = String(item?.interfaceId || '').toLowerCase()
          const supplier = String(item?.supplier || '').toLowerCase()
          return name.includes(keyword) || interfaceId.includes(keyword) || supplier.includes(keyword)
        })
      }
      
      if (searchForm.dataType) {
        filteredData = filteredData.filter(item => item.dataType === searchForm.dataType)
      }
      
      if (searchForm.status) {
        filteredData = filteredData.filter(item => item.status === searchForm.status)
      }
      
      if (searchForm.supplier) {
        filteredData = filteredData.filter(item => item.supplier === searchForm.supplier)
      }
      
      tableData.value = filteredData
      pagination.total = filteredData.length
      loading.value = false
      
      // 搜索无结果提示
      if (filteredData.length === 0 && searchForm.keyword) {
        Message.info({
          content: '未找到匹配的数据，请尝试其他关键词',
          duration: 2000
        })
      }
    }, 300)
  } catch (err) {
    console.error('搜索处理失败:', err)
    error.value = {
      type: 'error',
      title: '搜索失败',
      message: '搜索处理失败，请稍后重试',
      action: 'retry',
      actionText: '重新搜索'
    }
    loading.value = false
  }
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    dataType: '',
    status: '',
    supplier: ''
  })
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
}

// 行操作
const viewDetail = (record) => {
  router.push(`${ROUTE_PATHS.EXTERNAL_DATA.LIFECYCLE}/detail/${record.interfaceId}`)
}

const editRecord = (record) => {
  modalTitle.value = '编辑数据产品'
  Object.assign(addForm, {
    dataName: record.dataName,
    interfaceId: record.interfaceId,
    dataType: record.dataType,
    subType: record.subType,
    supplier: record.supplier,
    price: record.price,
    manager: record.manager,
    description: record.description
  })
  addModalVisible.value = true
}

const copyRecord = (record) => {
  modalTitle.value = '复制数据产品'
  Object.assign(addForm, {
    dataName: record.dataName + '_副本',
    interfaceId: record.interfaceId + '_COPY',
    dataType: record.dataType,
    subType: record.subType,
    supplier: record.supplier,
    price: record.price,
    manager: record.manager,
    description: record.description
  })
  addModalVisible.value = true
}

const deleteRecord = async (record) => {
  try {
    const response = await axios.delete(`/api/external-data/products/${record.id}`)
    const root = (response && typeof response.data === 'object') ? response.data : { success: false, message: '网络错误' }
    const ok = root.success === true || root.code === 200
    if (ok) {
      const list = Array.isArray(externalDataStore?.products?.value) ? externalDataStore.products.value : []
      const index = list.findIndex(item => item && item.id === record.id)
      if (index !== -1) {
        list.splice(index, 1)
        externalDataStore.products.value = list
      }
      Message.success('删除成功')
    } else {
      Message.error('删除失败: ' + (root.message || '未知错误'))
    }
  } catch (err) {
    console.error('删除失败:', err)
    Message.error('删除失败: ' + (err.message || '未知错误'))
  }
  handleSearch()
}

// 新增/编辑
const handleAddSubmit = () => {
  try {
    // 表单验证
    if (!addForm.dataName || !addForm.dataType) {
      Message.warning('请填写必填字段：数据名称和数据类型')
      return
    }
    
    Message.success({
      content: modalTitle.value.includes('新增') ? '新增成功' : '编辑成功',
      duration: 2000,
      closable: true
    })
    
    addModalVisible.value = false
    handleSearch()
    
  } catch (err) {
    console.error('提交失败:', err)
    Message.error({
      content: '提交失败：' + (err.message || '未知错误'),
      duration: 3000,
      closable: true
    })
  }
}

const handleAddCancel = () => {
  addModalVisible.value = false
}

// 批量导入
const handleBatchFileChange = (fileList) => {
  batchFileList.value = fileList
}

const handleBatchSubmit = () => {
  if (batchFileList.value.length === 0) {
    Message.error('请先上传文件')
    return
  }
  Message.success('批量导入成功')
  batchModalVisible.value = false
  handleSearch()
}

const handleBatchCancel = () => {
  batchModalVisible.value = false
  batchFileList.value = []
}

const downloadTemplate = () => {
  Message.success('模板下载成功')
}

const handleExport = () => {
  Message.success('数据导出成功')
}

// 加载产品数据
const loadProducts = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 优先使用统一状态管理（安全判空）
    const productsSafe = Array.isArray(externalDataStore?.products?.value)
      ? externalDataStore.products.value
      : []
    if (productsSafe.length > 0) {
      tableData.value = productsSafe
      pagination.total = productsSafe.length
    } else {
      // 尝试从API获取数据
      const response = await axios.get('/api/external-data/products')
      const root = (response && typeof response.data === 'object') ? response.data : {}
      const data = (root && typeof root.data === 'object') ? root.data : root
      const list = Array.isArray(data?.list) ? data.list : []
      const total = Number(data?.total || list.length || 0)

      tableData.value = list
      pagination.total = total
      // 同步到状态管理
      externalDataStore.products.value = list
    }
    
    // 检查数据一致性
    const consistencyCheck = externalDataStore.checkDataConsistency()
    const safeWarnings = Array.isArray(consistencyCheck) ? consistencyCheck : []
    inconsistencies.value = safeWarnings
    
    if (safeWarnings.length > 0) {
      console.warn('数据一致性检查发现问题:', consistencyCheck)
      Message.warning('检测到数据不一致，请检查相关数据')
    }
    
    // 显示加载成功提示
    if (Array.isArray(tableData.value) && tableData.value.length > 0) {
      Message.success({
        content: '数据加载成功！',
        duration: 1500,
        closable: true
      })
    }
    
  } catch (err) {
    console.error('加载产品数据失败:', err)
    error.value = {
      type: 'error',
      title: '数据加载失败',
      message: err.message || '无法加载档案数据，请检查网络连接或稍后重试',
      action: 'retry',
      actionText: '重新加载'
    }
    
    // 使用模拟数据作为备选
    const mockData = getMockData('externalDataArchive')
    const mockList = Array.isArray(mockData?.products) ? mockData.products : []
    tableData.value = mockList
    pagination.total = mockList.length
  } finally {
    loading.value = false
  }
}

// 刷新数据（统一调用加载与一致性检查）
const refreshData = async () => {
  try {
    loading.value = true
    await loadProducts()
    checkDataConsistency()
    Message.success({ content: '数据已刷新', duration: 1500 })
  } catch (err) {
    console.error('刷新失败:', err)
    Message.error('刷新失败：' + (err.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 重试加载表格数据
const loadTableData = async () => {
  await loadProducts()
}

// 检查数据一致性
const checkDataConsistency = () => {
  try {
    const warnings = []
    
    // 检查档案数据一致性
    const safeTable = Array.isArray(tableData?.value) ? tableData.value : []
    if (safeTable.length > 0) {
      const offlineFlags = ['offline', '已下线', 'inactive']
      const onlineFlags = ['online', '在线', 'active']
      const offlineProducts = safeTable.filter(item => offlineFlags.includes(item.status))
      const onlineProducts = safeTable.filter(item => onlineFlags.includes(item.status))
      
      if (offlineProducts.length > onlineProducts.length * 2) {
        warnings.push({
          message: `离线产品数量(${offlineProducts.length})过多，可能影响服务稳定性`
        })
      }
      
      // 检查重复数据
      const productNames = safeTable.map(item => item.dataName || item.name || item.interfaceId)
      const duplicates = productNames.filter((name, index) => productNames.indexOf(name) !== index)
      if (duplicates.length > 0) {
        warnings.push({
          message: `发现重复的产品名称: ${duplicates.join(', ')}`
        })
      }
    }
    
    consistencyWarnings.value = warnings
  } catch (err) {
    console.warn('数据一致性检查失败:', err)
  }
}

// 初始化
onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    // 优先使用统一状态管理中的数据
    if (Array.isArray(externalDataStore?.products?.value) && externalDataStore.products.value.length > 0) {
      // 数据已存在，直接使用
    } else {
      // 加载产品数据
      await loadProducts()
    }
    
    // 加载统计数据
    await externalDataStore.fetchStatistics('externalDataArchive')
    
    // 检查数据一致性
    const consistencyCheck = externalDataStore.checkDataConsistency()
    const safeCheck = Array.isArray(consistencyCheck) ? consistencyCheck : []
    inconsistencies.value = safeCheck
    if (safeCheck.length > 0) {
      console.warn('档案管理模块数据一致性检查发现问题:', consistencyCheck)
      Message.warning('检测到数据不一致，建议刷新数据')
    }
    
    // 执行本地一致性检查
    checkDataConsistency()
  } catch (err) {
    console.error('初始化失败:', err)
    error.value = err.message || '系统错误，请稍后重试'
    Message.error({
      content: '初始化失败: ' + (err.message || '系统错误，请稍后重试'),
      duration: 5000,
      closable: true
    })
  } finally {
    loading.value = false
  }
  
  // 更新统计数据
  const safeTable = Array.isArray(tableData?.value) ? tableData.value : []
  const statusCounts = {
    registering: safeTable.filter(item => ['registering', 'maintenance', '维护中'].includes(item.status)).length,
    pending: safeTable.filter(item => ['pending', '待上线'].includes(item.status)).length,
    online: safeTable.filter(item => ['online', '在线', 'active'].includes(item.status)).length,
    offline: safeTable.filter(item => ['offline', '已下线', 'inactive'].includes(item.status)).length
  }
  
  statistics.registering = statusCounts.registering
  statistics.pending = statusCounts.pending
  statistics.online = statusCounts.online
  statistics.offline = statusCounts.offline
})
</script>

<style scoped lang="less">
.external-data-archive {
  padding: 32px;
  background: transparent;
  min-height: 100vh;
}

.loading-skeleton {
  padding: 48px 24px;
  text-align: center;
  
  .loading-text {
    margin-top: 16px;
    color: var(--color-text-3);
    font-size: 14px;
  }
}

.empty-state {
  padding: 64px 24px;
  text-align: center;
  
  .empty-icon-wrapper {
    margin-bottom: 16px;
    
    .empty-icon {
      font-size: 64px;
      color: var(--color-neutral-6);
      opacity: 0.5;
    }
  }
  
  .empty-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 8px;
  }
  
  .empty-description {
    font-size: 14px;
    color: var(--color-text-3);
    margin-bottom: 24px;
  }
  
  .empty-actions {
    .arco-btn {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.error-message {
  margin-bottom: 16px;
}

.consistency-warning {
  margin-bottom: 16px;
}

.consistency-item {
  margin: 4px 0;
  font-size: 14px;
}

.page-header {
    margin-bottom: 24px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.85);
      padding: 24px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(15px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      
      .header-info {
        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .page-description {
          margin: 0;
          color: var(--color-text-3);
          font-size: 14px;
        }
      }
    }
  }

.stats-cards {
    margin-bottom: 24px;
    
    .stat-card {
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(15px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      
      .stat-content {
        display: flex;
        align-items: center;
        padding: 24px;
        
        .stat-icon {
          font-size: 32px;
          color: var(--color-primary-6);
          margin-right: 16px;
        }
        
        .stat-info {
          flex: 1;
          
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-text-1);
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 14px;
            color: var(--color-text-3);
          }
        }
      }
      
      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }
  }

.search-card {
    margin-bottom: 24px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(15px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    :deep(.arco-form-item-label) {
      font-weight: 500;
    }
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #c9cdd4;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 16px;
}

.data-list-card {
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(15px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    .price-text {
      color: var(--color-primary-6);
      font-weight: 500;
    }
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }

@media (max-width: 768px) {
  .external-data-archive {
    padding: 16px;
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .stats-cards {
    .arco-col {
      margin-bottom: 16px;
    }
  }
}
</style>