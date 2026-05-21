<template>
  <div class="permission-progress">
    <a-card title="权限申请进度" :bordered="false">
      <!-- 搜索和筛选区域 -->
      <a-space direction="vertical" fill style="margin-bottom: 16px;">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-input-search
              v-model="searchText"
              placeholder="搜索资源名称、申请编号"
              allow-clear
              @search="handleSearch"
            />
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="statusFilter"
              placeholder="申请状态"
              allow-clear
              style="width: 100%"
            >
              <a-option value="">全部状态</a-option>
              <a-option value="pending">待审批</a-option>
              <a-option value="processing">审批中</a-option>
              <a-option value="approved">已通过</a-option>
              <a-option value="rejected">已拒绝</a-option>
              <a-option value="expired">已过期</a-option>
              <a-option value="withdrawn">已撤回</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-range-picker
              v-model="dateRange"
              style="width: 100%"
              @change="handleDateChange"
            />
          </a-col>
          <a-col :span="4">
            <a-button type="primary" @click="handleSearch">
              <template #icon><IconSearch /></template>
              查询
            </a-button>
            <a-button @click="handleReset" style="margin-left: 8px;">
              重置
            </a-button>
          </a-col>
        </a-row>

        <!-- 快捷操作 -->
        <a-row>
          <a-col :span="24">
            <a-space>
              <a-button size="mini" @click="handleNewApplication">
                <template #icon><IconPlus /></template>
                新建申请
              </a-button>
              <a-button size="mini" @click="handleBatchApply">
                <template #icon><IconUpload /></template>
                批量申请
              </a-button>
              <a-button size="mini" @click="handleExport">
                <template #icon><IconDownload /></template>
                导出记录
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-space>

      <!-- 申请列表 -->
      <a-table
        :data="applications"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <!-- 申请编号 -->
        <template #applicationNo="{ record }">
          <a-link @click="viewDetail(record)">{{ record.applicationNo }}</a-link>
        </template>

        <!-- 资源信息 -->
        <template #resource="{ record }">
          <div class="resource-info">
            <div class="resource-name">{{ record.resourceName }}</div>
            <div class="resource-type">{{ getResourceTypeText(record.resourceType) }}</div>
          </div>
        </template>

        <!-- 权限类型 -->
        <template #permission="{ record }">
          <div class="permission-info">
            <div>{{ getPermissionTypeText(record.permissionType) }}</div>
            <div v-if="record.duration" class="duration">{{ record.duration }}天</div>
          </div>
        </template>

        <!-- 状态 -->
        <template #status="{ record }">
          <div class="status-info">
            <StatusLabel :status="record.status" />
            <div v-if="record.isUrgent" class="urgent-tag">紧急</div>
          </div>
        </template>

        <!-- 进度 -->
        <template #progress="{ record }">
          <div class="progress-info">
            <a-progress
              :percent="getProgressPercent(record)"
              :status="getProgressStatus(record)"
              size="small"
            />
            <div class="progress-text">{{ getProgressText(record) }}</div>
          </div>
        </template>

        <!-- 当前审批人 -->
        <template #currentApprover="{ record }">
          <div class="approver-info">
            <div v-if="record.currentApprover">
              {{ record.currentApprover.name }}
              <div class="approver-dept">{{ record.currentApprover.department }}</div>
            </div>
            <div v-else class="no-approver">-</div>
          </div>
        </template>

        <!-- 申请时间 -->
        <template #applyTime="{ record }">
          <div class="time-info">
            <div>{{ formatDate(record.applyTime) }}</div>
            <div class="time-ago">{{ formatTimeAgo(record.applyTime) }}</div>
          </div>
        </template>

        <!-- 操作 -->
        <template #actions="{ record }">
          <a-space>
            <a-link @click="viewDetail(record)">查看</a-link>
            <a-link 
              v-if="canWithdraw(record)" 
              @click="handleWithdraw(record)"
              status="warning"
            >
              撤回
            </a-link>
            <a-link 
              v-if="canRenew(record)" 
              @click="handleRenew(record)"
              status="success"
            >
              续期
            </a-link>
            <a-link 
              v-if="canReapply(record)" 
              @click="handleReapply(record)"
            >
              重新申请
            </a-link>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 申请详情抽屉 -->
    <ApplicationDetailDrawer
      v-model:visible="detailVisible"
      :application="selectedApplication"
      @refresh="loadApplications"
    />

    <!-- 撤回确认对话框 -->
    <a-modal
      v-model:visible="withdrawVisible"
      title="撤回申请"
      @ok="confirmWithdraw"
      @cancel="cancelWithdraw"
    >
      <p>确定要撤回申请 "{{ withdrawTarget?.resourceName }}" 吗？</p>
      <a-textarea
        v-model="withdrawReason"
        placeholder="请输入撤回原因（可选）"
        :rows="3"
        style="margin-top: 16px;"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconSearch, 
  IconPlus, 
  IconUpload, 
  IconDownload 
} from '@arco-design/web-vue/es/icon'
import StatusLabel from './components/StatusLabel.vue'
import ApplicationDetailDrawer from './components/ApplicationDetailDrawer.vue'
import { getPermissionTypeText, getResourceTypeText } from './utils'
import { getMyApplications, withdrawApplication } from '@/api/permission'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// 响应式数据
const searchText = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const loading = ref(false)
const applications = ref([])
const detailVisible = ref(false)
const selectedApplication = ref(null)
const withdrawVisible = ref(false)
const withdrawTarget = ref(null)
const withdrawReason = ref('')

// 分页配置
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '申请编号',
    dataIndex: 'applicationNo',
    slotName: 'applicationNo',
    width: 120
  },
  {
    title: '资源信息',
    slotName: 'resource',
    width: 200
  },
  {
    title: '权限类型',
    slotName: 'permission',
    width: 120
  },
  {
    title: '状态',
    slotName: 'status',
    width: 100
  },
  {
    title: '进度',
    slotName: 'progress',
    width: 150
  },
  {
    title: '当前审批人',
    slotName: 'currentApprover',
    width: 150
  },
  {
    title: '申请时间',
    slotName: 'applyTime',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 生命周期
onMounted(() => {
  loadApplications()
})

// 方法
const loadApplications = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
      startDate: dateRange.value?.[0] || undefined,
      endDate: dateRange.value?.[1] || undefined
    }
    const response = await getMyApplications(params)
    applications.value = response.data.list
    pagination.value.total = response.data.total
  } catch (error) {
    Message.error('加载申请列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  loadApplications()
}

const handleReset = () => {
  searchText.value = ''
  statusFilter.value = ''
  dateRange.value = []
  pagination.value.current = 1
  loadApplications()
}

const handleDateChange = () => {
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.value.current = page
  loadApplications()
}

const viewDetail = (record) => {
  selectedApplication.value = record
  detailVisible.value = true
}

const handleNewApplication = () => {
  router.push('/management/permission/apply')
}

const handleBatchApply = () => {
  router.push('/management/permission/batch-apply')
}

const handleExport = () => {
  // 导出申请记录
  Message.success('导出功能开发中')
}

const canWithdraw = (record) => {
  return ['pending', 'processing'].includes(record.status) && !record.isExpired
}

const canRenew = (record) => {
  return record.status === 'approved' && record.isNearExpiry
}

const canReapply = (record) => {
  return ['rejected', 'expired', 'withdrawn'].includes(record.status)
}

const handleWithdraw = (record) => {
  withdrawTarget.value = record
  withdrawVisible.value = true
}

const confirmWithdraw = async () => {
  try {
    await withdrawApplication({
      applicationId: withdrawTarget.value.id,
      reason: withdrawReason.value
    })
    Message.success('申请已撤回')
    withdrawVisible.value = false
    loadApplications()
  } catch (error) {
    Message.error('撤回失败')
  }
}

const cancelWithdraw = () => {
  withdrawVisible.value = false
  withdrawReason.value = ''
}

const handleRenew = (record) => {
  // 续期逻辑
  Message.success('续期功能开发中')
}

const handleReapply = (record) => {
  // 重新申请逻辑
  router.push({
    path: '/management/permission/apply',
    query: {
      reapply: record.id
    }
  })
}

const getProgressPercent = (record) => {
  const progressMap = {
    'pending': 25,
    'processing': 50,
    'approved': 100,
    'rejected': 100,
    'expired': 100,
    'withdrawn': 100
  }
  return progressMap[record.status] || 0
}

const getProgressStatus = (record) => {
  if (record.status === 'approved') return 'success'
  if (record.status === 'rejected' || record.status === 'expired' || record.status === 'withdrawn') return 'danger'
  return 'normal'
}

const getProgressText = (record) => {
  const textMap = {
    'pending': '待审批',
    'processing': '审批中',
    'approved': '已通过',
    'rejected': '已拒绝',
    'expired': '已过期',
    'withdrawn': '已撤回'
  }
  return textMap[record.status] || record.status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}个月前`
}
</script>

<style scoped lang="less">
.permission-progress {
  padding: 16px;
  background-color: var(--color-fill-2);
  min-height: calc(100vh - 84px);
}

.resource-info {
  .resource-name {
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 4px;
  }

  .resource-type {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.permission-info {
  .duration {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .urgent-tag {
    background-color: rgb(var(--danger-6));
    color: white;
    padding: 2px 6px;
    border-radius: 2px;
    font-size: 10px;
    text-align: center;
  }
}

.progress-info {
  .progress-text {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
    text-align: center;
  }
}

.approver-info {
  .approver-dept {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }

  .no-approver {
    color: var(--color-text-3);
    font-size: 12px;
  }
}

.time-info {
  .time-ago {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }
}
</style>