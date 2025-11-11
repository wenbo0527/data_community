<template>
  <div class="service-application">
    <!-- 搜索筛选 -->
    <a-card class="search-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input v-model="searchForm.applicationId" placeholder="申请编号" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-select v-model="searchForm.serviceType" placeholder="服务类型" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="data-query">数据查询</a-option>
            <a-option value="batch-processing">批量处理</a-option>
            <a-option value="real-time-monitoring">实时监控</a-option>
            <a-option value="data-analysis">数据分析</a-option>
            <a-option value="api-service">API服务</a-option>
            <a-option value="report-generation">报表生成</a-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-select v-model="searchForm.status" placeholder="申请状态" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="pending">待审批</a-option>
            <a-option value="approved">已批准</a-option>
            <a-option value="rejected">已拒绝</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="failed">已失败</a-option>
          </a-select>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="8">
          <a-input v-model="searchForm.dataProduct" placeholder="数据产品" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
        </a-col>
        <a-col :span="8">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 申请列表 -->
    <a-card class="list-card">
      <div class="list-header">
        <h3>服务申请列表</h3>
        <a-space>
          <a-button type="outline" @click="batchApprove">
            <template #icon><icon-check /></template>
            批量审批
          </a-button>
          <a-button type="outline" @click="batchDelete">
            <template #icon><icon-delete /></template>
            批量删除
          </a-button>
        </a-space>
      </div>
      
      <a-table
        :data="applicationList"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="申请编号" data-index="applicationId" width="120">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.applicationId }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="服务类型" data-index="serviceType" width="100">
            <template #cell="{ record }">
              <a-tag :color="getServiceTypeColor(record.serviceType)">
                {{ getServiceTypeText(record.serviceType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="数据产品" data-index="dataProduct" width="120" />
          <a-table-column title="申请描述" data-index="description" ellipsis />
          <a-table-column title="优先级" data-index="priority" width="80">
            <template #cell="{ record }">
              <a-tag :color="getPriorityColor(record.priority)">
                {{ getPriorityText(record.priority) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请状态" data-index="status" width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请人" data-index="applicant" width="100" />
          <a-table-column title="申请时间" data-index="applicationTime" width="160" />
          <a-table-column title="期望时间" data-index="expectedTime" width="160" />
          <a-table-column title="操作" width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="showDetail(record)">
                  详情
                </a-button>
                <a-button 
                  v-if="record.status === 'pending'" 
                  type="text" 
                  size="small" 
                  @click="approveApplication(record)"
                >
                  审批
                </a-button>
                <a-button 
                  v-if="record.status === 'approved'" 
                  type="text" 
                  size="small" 
                  @click="startProcessing(record)"
                >
                  开始处理
                </a-button>
                <a-button 
                  v-if="['processing', 'failed'].includes(record.status)" 
                  type="text" 
                  size="small" 
                  @click="retryApplication(record)"
                >
                  重试
                </a-button>
                <a-button 
                  type="text" 
                  status="danger" 
                  size="small" 
                  @click="deleteApplication(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 申请详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="服务申请详情"
      width="800px"
      :footer="false"
    >
      <div class="detail-content" v-if="currentRecord">
        <a-descriptions :data="detailData" :column="2" bordered />
        
        <div class="detail-actions" style="margin-top: 24px; text-align: center;">
          <a-space>
            <a-button type="primary" @click="approveApplication(currentRecord)">
              批准申请
            </a-button>
            <a-button status="danger" @click="rejectApplication(currentRecord)">
              拒绝申请
            </a-button>
            <a-button @click="showDetailModal = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconSearch,
  IconRefresh,
  IconCheck,
  IconDelete
} from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  applicationId: '',
  serviceType: '',
  status: '',
  dataProduct: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const applicationList = ref([
  {
    id: '1',
    applicationId: 'APP2024001',
    serviceType: 'data-query',
    dataProduct: '数据产品A',
    description: '查询用户行为数据，用于用户画像分析',
    priority: 'high',
    status: 'pending',
    applicant: '张三',
    applicationTime: '2024-01-15 09:30:00',
    expectedTime: '2024-01-20 18:00:00',
    parameters: '{"user_id": "12345", "date_range": "30d"}',
    outputFormat: 'json',
    remarks: '需要实时数据'
  },
  {
    id: '2',
    applicationId: 'APP2024002',
    serviceType: 'batch-processing',
    dataProduct: '数据产品B',
    description: '批量处理历史交易数据，生成月度报表',
    priority: 'medium',
    status: 'approved',
    applicant: '李四',
    applicationTime: '2024-01-14 14:20:00',
    expectedTime: '2024-01-25 18:00:00',
    parameters: '{"start_date": "2024-01-01", "end_date": "2024-01-31"}',
    outputFormat: 'excel',
    remarks: '需要包含图表'
  },
  {
    id: '3',
    applicationId: 'APP2024003',
    serviceType: 'real-time-monitoring',
    dataProduct: '数据产品C',
    description: '实时监控业务指标，设置预警阈值',
    priority: 'high',
    status: 'processing',
    applicant: '王五',
    applicationTime: '2024-01-13 11:15:00',
    expectedTime: '2024-01-18 18:00:00',
    parameters: '{"metrics": ["revenue", "users"], "thresholds": {"revenue": 10000, "users": 1000}}',
    outputFormat: 'json',
    remarks: '需要短信通知'
  },
  {
    id: '4',
    applicationId: 'APP2024004',
    serviceType: 'data-analysis',
    dataProduct: '数据产品A',
    description: '分析用户留存率，找出流失原因',
    priority: 'low',
    status: 'completed',
    applicant: '赵六',
    applicationTime: '2024-01-12 16:45:00',
    expectedTime: '2024-01-22 18:00:00',
    parameters: '{"analysis_type": "retention", "cohort_size": 1000}',
    outputFormat: 'pdf',
    remarks: '需要详细分析报告'
  },
  {
    id: '5',
    applicationId: 'APP2024005',
    serviceType: 'api-service',
    dataProduct: '数据产品D',
    description: '提供API接口服务，支持第三方数据调用',
    priority: 'high',
    status: 'failed',
    applicant: '孙七',
    applicationTime: '2024-01-11 10:30:00',
    expectedTime: '2024-01-16 18:00:00',
    parameters: '{"api_key": "test_key", "rate_limit": 1000}',
    outputFormat: 'json',
    remarks: '需要高并发支持'
  }
])

// 分页配置
const pagination = reactive({
  total: 5,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 行选择
const selectedRows = ref([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onSelect: (rowKeys) => {
    selectedRows.value = rowKeys
  }
})

// 详情弹窗
const showDetailModal = ref(false)
const currentRecord = ref(null)

// 详情数据
const detailData = computed(() => {
  if (!currentRecord.value) return []
  return [
    { label: '申请编号', value: currentRecord.value.applicationId },
    { label: '服务类型', value: getServiceTypeText(currentRecord.value.serviceType) },
    { label: '数据产品', value: currentRecord.value.dataProduct },
    { label: '优先级', value: getPriorityText(currentRecord.value.priority) },
    { label: '申请描述', value: currentRecord.value.description },
    { label: '输入参数', value: currentRecord.value.parameters },
    { label: '输出格式', value: currentRecord.value.outputFormat },
    { label: '申请人', value: currentRecord.value.applicant },
    { label: '申请时间', value: currentRecord.value.applicationTime },
    { label: '期望时间', value: currentRecord.value.expectedTime },
    { label: '备注说明', value: currentRecord.value.remarks }
  ]
})

// 搜索方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    Message.success('搜索完成')
  }, 1000)
}

const handleReset = () => {
  Object.assign(searchForm, {
    applicationId: '',
    serviceType: '',
    status: '',
    dataProduct: '',
    dateRange: []
  })
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 显示详情
const showDetail = (record) => {
  currentRecord.value = record
  showDetailModal.value = true
}

// 审批申请
const approveApplication = (record) => {
  Modal.confirm({
    title: '确认批准',
    content: `确定要批准申请 ${record.applicationId} 吗？`,
    onOk: () => {
      record.status = 'approved'
      Message.success('申请已批准')
      showDetailModal.value = false
    }
  })
}

const rejectApplication = (record) => {
  Modal.confirm({
    title: '确认拒绝',
    content: `确定要拒绝申请 ${record.applicationId} 吗？`,
    onOk: () => {
      record.status = 'rejected'
      Message.success('申请已拒绝')
      showDetailModal.value = false
    }
  })
}

// 开始处理
const startProcessing = (record) => {
  record.status = 'processing'
  Message.success('开始处理申请')
}

// 重试申请
const retryApplication = (record) => {
  record.status = 'processing'
  Message.success('申请重试成功')
}

// 删除申请
const deleteApplication = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除申请 ${record.applicationId} 吗？`,
    onOk: () => {
      const index = applicationList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        applicationList.value.splice(index, 1)
      }
      Message.success('申请已删除')
    }
  })
}

// 批量操作
const batchApprove = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请选择要审批的申请')
    return
  }
  Message.success(`批量审批 ${selectedRows.value.length} 个申请成功`)
}

const batchDelete = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请选择要删除的申请')
    return
  }
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.value.length} 个申请吗？`,
    onOk: () => {
      Message.success('批量删除成功')
      selectedRows.value = []
    }
  })
}

// 辅助函数
const getServiceTypeColor = (type) => {
  const colors = {
    'data-query': 'blue',
    'batch-processing': 'green',
    'real-time-monitoring': 'orange',
    'data-analysis': 'purple',
    'api-service': 'red',
    'report-generation': 'cyan'
  }
  return colors[type] || 'gray'
}

const getServiceTypeText = (type) => {
  const texts = {
    'data-query': '数据查询',
    'batch-processing': '批量处理',
    'real-time-monitoring': '实时监控',
    'data-analysis': '数据分析',
    'api-service': 'API服务',
    'report-generation': '报表生成'
  }
  return texts[type] || type
}

const getPriorityColor = (priority) => {
  const colors = {
    'high': 'red',
    'medium': 'orange',
    'low': 'green'
  }
  return colors[priority] || 'gray'
}

const getPriorityText = (priority) => {
  const texts = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return texts[priority] || priority
}

const getStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'approved': 'blue',
    'rejected': 'red',
    'processing': 'cyan',
    'completed': 'green',
    'failed': 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待审批',
    'approved': '已批准',
    'rejected': '已拒绝',
    'processing': '处理中',
    'completed': '已完成',
    'failed': '已失败'
  }
  return texts[status] || status
}
</script>

<style scoped lang="less">
.service-application {
  .search-card {
    margin-bottom: 16px;
    border-radius: 8px;
  }
  
  .list-card {
    border-radius: 8px;
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        font-size: 16px;
        color: var(--color-text-1);
      }
    }
  }
  
  .detail-content {
    .detail-actions {
      margin-top: 24px;
      text-align: center;
    }
  }
}
</style>