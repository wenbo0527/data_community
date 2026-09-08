<template>
  <div class="permission-approval">
    <a-row :gutter="16">
      <!-- 左侧待审批列表 -->
      <a-col :span="8">
        <a-card title="待审批申请" :bordered="false">
          <template #extra>
            <a-space>
              <a-button size="mini" @click="refreshList">
                <template #icon><IconRefresh /></template>
                刷新
              </a-button>
              <a-button size="mini" @click="handleBatchApproval">
                <template #icon><IconCheckCircle /></template>
                批量审批
              </a-button>
            </a-space>
          </template>

          <!-- 搜索和筛选 -->
          <a-space direction="vertical" fill>
            <a-input-search
              v-model="searchText"
              placeholder="搜索申请人、资源名称"
              allow-clear
              @search="handleSearch"
            />
            <a-select
              v-model="filterStatus"
              placeholder="筛选状态"
              allow-clear
              style="width: 100%"
            >
              <a-option value="pending">待审批</a-option>
              <a-option value="processing">审批中</a-option>
              <a-option value="forwarded">已转发</a-option>
            </a-select>
          </a-space>

          <!-- 申请列表 -->
          <div class="approval-list" style="margin-top: 16px">
            <div
              v-for="item in filteredApplications"
              :key="item.id"
              class="approval-item"
              :class="{ active: selectedId === item.id }"
              @click="selectApplication(item)"
            >
              <div class="approval-header">
                <span class="applicant">{{ item.applicantName }}</span>
                <StatusLabel :status="item.status" />
              </div>
              <div class="approval-content">
                <div class="resource-info">
                  <span class="resource-name">{{ item.resourceName }}</span>
                  <SensitivityLabel :level="item.sensitivityLevel" />
                </div>
                <div class="permission-info">
                  <span class="permission-type">{{ getPermissionTypeText(item.permissionType) }}</span>
                  <span class="apply-time">{{ DateUtils.formatDateTime(item.applyTime) }}</span>
                </div>
              </div>
              <div class="approval-meta">
                <span class="approval-level">审批级别: {{ getApprovalLevelText(item.approvalLevel) }}</span>
                <span v-if="item.isUrgent" class="urgent-tag">紧急</span>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <a-pagination
            v-model:current="currentPage"
            :total="totalApplications"
            :page-size="pageSize"
            size="small"
            simple
            @change="handlePageChange"
            style="margin-top: 16px; text-align: center;"
          />
        </a-card>
      </a-col>

      <!-- 右侧审批详情 -->
      <a-col :span="16">
        <a-card v-if="selectedApplication" :bordered="false">
          <template #title>
            <span>审批详情</span>
            <a-space style="margin-left: 16px">
              <a-button size="mini" @click="handleForward">
                <template #icon><IconShareInternal /></template>
                转发
              </a-button>
              <a-button size="mini" @click="handleViewHistory">
                <template #icon><IconHistory /></template>
                历史记录
              </a-button>
              <a-button size="mini" @click="handlePrint">
                <template #icon><IconPrinter /></template>
                打印
              </a-button>
            </a-space>
          </template>

          <!-- 审批详情组件 -->
          <ApprovalDetail
            :application="selectedApplication"
            :readonly="false"
            @approve="handleApprove"
            @reject="handleReject"
            @forward="handleForwardWithReason"
          />
        </a-card>

        <!-- 空状态 -->
        <a-card v-else :bordered="false">
          <a-empty description="请选择要审批的申请">
            <template #image>
              <IconUnorderedList />
            </template>
          </a-empty>
        </a-card>
      </a-col>
    </a-row>

    <!-- 批量审批对话框 -->
    <BatchApprovalModal
      v-model:visible="batchApprovalVisible"
      :selected-applications="selectedApplications"
      @confirm="handleBatchApprovalConfirm"
    />

    <!-- 转发对话框 -->
    <ForwardModal
      v-model:visible="forwardVisible"
      :application="selectedApplication"
      @confirm="handleForwardConfirm"
    />

    <!-- 历史记录对话框 -->
    <HistoryModal
      v-model:visible="historyVisible"
      :application-id="selectedId"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconRefresh, 
  IconCheckCircle, 
  IconShareInternal, 
  IconHistory, 
  IconPrinter,
  IconUnorderedList 
} from '@arco-design/web-vue/es/icon'
import StatusLabel from './components/StatusLabel.vue'
import SensitivityLabel from './components/SensitivityLabel.vue'
import ApprovalDetail from './components/ApprovalDetail.vue'
import BatchApprovalModal from './components/BatchApprovalModal.vue'
import ForwardModal from './components/ForwardModal.vue'
import HistoryModal from './components/HistoryModal.vue'
import { getPermissionTypeText, getApprovalLevelText } from './utils'
import { getPendingApplications, approveApplication, rejectApplication, forwardApplication } from '@/api/permission'
import DateUtils from '@/utils/dateUtils'

// 响应式数据
const searchText = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalApplications = ref(0)
const applications = ref([])
const selectedId = ref(null)
const selectedApplications = ref([])
const batchApprovalVisible = ref(false)
const forwardVisible = ref(false)
const historyVisible = ref(false)

// 计算属性
const filteredApplications = computed(() => {
  let result = applications.value

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }

  // 搜索筛选
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(item => 
      item.applicantName.toLowerCase().includes(keyword) ||
      item.resourceName.toLowerCase().includes(keyword)
    )
  }

  return result
})

const selectedApplication = computed(() => {
  return applications.value.find(item => item.id === selectedId.value)
})

// 生命周期
onMounted(() => {
  loadApplications()
})

// 方法
const loadApplications = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      status: filterStatus.value || undefined,
      search: searchText.value || undefined
    }
    const response = await getPendingApplications(params)
    applications.value = response.data.list
    totalApplications.value = response.data.total
  } catch (error) {
    Message.error('加载申请列表失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadApplications()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadApplications()
}

const selectApplication = (application) => {
  selectedId.value = application.id
}

const refreshList = () => {
  loadApplications()
  Message.success('列表已刷新')
}

const handleBatchApproval = () => {
  const pendingApps = applications.value.filter(item => item.status === 'pending')
  if (pendingApps.length === 0) {
    Message.warning('没有待审批的申请')
    return
  }
  selectedApplications.value = pendingApps
  batchApprovalVisible.value = true
}

const handleBatchApprovalConfirm = async (approvalData) => {
  try {
    // 批量审批逻辑
    for (const app of selectedApplications.value) {
      if (approvalData.action === 'approve') {
        await approveApplication({
          applicationId: app.id,
          reason: approvalData.reason,
          expiryDate: approvalData.expiryDate
        })
      } else {
        await rejectApplication({
          applicationId: app.id,
          reason: approvalData.reason
        })
      }
    }
    Message.success(`批量${approvalData.action === 'approve' ? '通过' : '拒绝'}成功`)
    batchApprovalVisible.value = false
    loadApplications()
  } catch (error) {
    Message.error('批量审批失败')
  }
}

const handleApprove = async (approvalData) => {
  try {
    await approveApplication({
      applicationId: selectedId.value,
      reason: approvalData.reason,
      expiryDate: approvalData.expiryDate
    })
    Message.success('审批通过')
    loadApplications()
    // 自动选择下一个待审批的申请
    selectNextApplication()
  } catch (error) {
    Message.error('审批失败')
  }
}

const handleReject = async (rejectionData) => {
  try {
    await rejectApplication({
      applicationId: selectedId.value,
      reason: rejectionData.reason
    })
    Message.success('审批已拒绝')
    loadApplications()
    selectNextApplication()
  } catch (error) {
    Message.error('操作失败')
  }
}

const handleForward = () => {
  forwardVisible.value = true
}

const handleForwardWithReason = (forwardData) => {
  forwardVisible.value = true
}

const handleForwardConfirm = async (forwardData) => {
  try {
    await forwardApplication({
      applicationId: selectedId.value,
      forwardTo: forwardData.forwardTo,
      reason: forwardData.reason
    })
    Message.success('转发成功')
    forwardVisible.value = false
    loadApplications()
  } catch (error) {
    Message.error('转发失败')
  }
}

const handleViewHistory = () => {
  historyVisible.value = true
}

const handlePrint = () => {
  window.print()
}

const selectNextApplication = () => {
  const currentIndex = applications.value.findIndex(item => item.id === selectedId.value)
  const nextIndex = currentIndex + 1
  if (nextIndex < applications.value.length) {
    selectedId.value = applications.value[nextIndex].id
  } else if (applications.value.length > 0) {
    selectedId.value = applications.value[0].id
  } else {
    selectedId.value = null
  }
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}
</script>

<style scoped lang="less">
.permission-approval {
  padding: 16px;
  background-color: var(--color-fill-2);
  min-height: calc(100vh - 84px);
}

.approval-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.approval-item {
  padding: 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: var(--color-bg-1);

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  &.active {
    border-color: rgb(var(--primary-6));
    background-color: rgb(var(--primary-1));
  }
}

.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .applicant {
    font-weight: 500;
    color: var(--color-text-1);
  }
}

.approval-content {
  .resource-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .resource-name {
      font-size: 14px;
      color: var(--color-text-1);
    }
  }

  .permission-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--color-text-3);

    .permission-type {
      background-color: var(--color-fill-2);
      padding: 2px 6px;
      border-radius: 2px;
    }
  }
}

.approval-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;

  .approval-level {
    color: var(--color-text-3);
  }

  .urgent-tag {
    background-color: rgb(var(--danger-6));
    color: white;
    padding: 2px 6px;
    border-radius: 2px;
    font-size: 10px;
  }
}

@media print {
  .approval-list,
  .arco-card-extra {
    display: none !important;
  }

  .permission-approval {
    background-color: white !important;
    padding: 0 !important;
  }
}
</style>
