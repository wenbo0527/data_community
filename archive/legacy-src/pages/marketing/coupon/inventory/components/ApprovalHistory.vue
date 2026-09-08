<template>
  <a-modal
    :visible="visible"
    title="审批历史"
    width="1000px"
    :footer="false"
    @cancel="handleCancel"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="approval-history">
      <!-- 搜索区域 -->
      <a-card class="search-card" :bordered="false">
        <a-form
          :model="searchForm"
          layout="inline"
          @submit="handleSearch"
        >
          <a-form-item field="status" label="审批状态">
            <a-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              allow-clear
              style="width: 150px"
            >
              <a-option value="pending">待审批</a-option>
              <a-option value="approved">已通过</a-option>
              <a-option value="rejected">已拒绝</a-option>
              <a-option value="cancelled">已撤销</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="dateRange" label="申请时间">
            <a-range-picker
              v-model="searchForm.dateRange"
              style="width: 240px"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">查询</a-button>
              <a-button @click="resetSearch">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 审批记录表格 -->
      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #status="{ record }">
          <a-tag
            :color="getStatusColor(record.status)"
          >
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template #priority="{ record }">
          <a-tag
            :color="getPriorityColor(record.priority)"
          >
            {{ getPriorityText(record.priority) }}
          </a-tag>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button
              type="text"
              size="small"
              @click="viewDetail(record)"
            >
              查看详情
            </a-button>
            <a-button
              v-if="record.status === 'pending'"
              type="text"
              size="small"
              status="danger"
              @click="cancelApproval(record)"
            >
              撤销申请
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 详情弹窗 -->
    <ApprovalDetail
      v-model:visible="detailVisible"
      :approval-data="selectedRecord"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import ApprovalDetail from './ApprovalDetail.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const loading = ref(false)
const detailVisible = ref(false)
const selectedRecord = ref({})

// 搜索表单
const searchForm = reactive({
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([])

// 表格列配置
const columns = [
  {
    title: '申请ID',
    dataIndex: 'id',
    width: 120
  },
  {
    title: '券模板名称',
    dataIndex: 'templateName',
    width: 200
  },
  {
    title: '发券数量',
    dataIndex: 'couponCount',
    width: 100
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
    width: 120
  },
  {
    title: '审批人',
    dataIndex: 'approver',
    width: 120
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    slotName: 'priority',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '申请时间',
    dataIndex: 'createTime',
    width: 160
  },
  {
    title: '审批时间',
    dataIndex: 'approvalTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 获取审批历史数据
const fetchApprovalHistory = async () => {
  loading.value = true
  try {
    const { approvalAPI } = await import('@/api/coupon.js')
    const response = await approvalAPI.getApprovalHistory({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    
    if (response.code === 200) {
      tableData.value = response.data.list
      pagination.total = response.data.total
    } else {
      Message.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取审批历史失败:', error)
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    cancelled: 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已撤销'
  }
  return textMap[status] || '未知'
}

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  }
  return colorMap[priority] || 'gray'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || '未知'
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchApprovalHistory()
}

// 重置搜索
const resetSearch = () => {
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 查看详情
const viewDetail = (record: any) => {
  selectedRecord.value = record
  detailVisible.value = true
}

// 撤销申请
const cancelApproval = (record: any) => {
  Modal.confirm({
    title: '确认撤销',
    content: `确定要撤销申请"${record.templateName}"吗？`,
    onOk: async () => {
      try {
        // TODO: 调用撤销接口
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success('申请已撤销')
        fetchApprovalHistory()
      } catch (error) {
        Message.error('撤销失败')
      }
    }
  })
}

// 分页变化
const onPageChange = (current: number) => {
  pagination.current = current
  fetchApprovalHistory()
}

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchApprovalHistory()
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
}

// 初始化
onMounted(() => {
  if (props.visible) {
    fetchApprovalHistory()
  }
})
</script>

<style scoped>
.approval-history {
  max-height: 600px;
}

.search-card {
  margin-bottom: 16px;
}

:deep(.arco-table-th) {
  background-color: var(--color-bg-2);
  font-weight: 600;
}

:deep(.arco-table-tr:hover) {
  background-color: var(--color-fill-1);
}
</style>