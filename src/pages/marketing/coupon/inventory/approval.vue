<template>
  <div class="approval-container">
    <!-- 页面标题 -->
    <a-page-header title="审批管理" subtitle="批量创建券库存审批流程管理">
      <template #breadcrumb>
        <a-breadcrumb>
          <a-breadcrumb-item>营销画布</a-breadcrumb-item>
          <a-breadcrumb-item>券管理</a-breadcrumb-item>
          <a-breadcrumb-item>审批管理</a-breadcrumb-item>
        </a-breadcrumb>
      </template>
    </a-page-header>

    <!-- 筛选条件 -->
    <a-card class="filter-card">
      <a-form 
        :model="filterForm" 
        layout="inline" 
        @submit="handleSearch">
        <a-form-item field="status" label="审批状态">
          <a-select 
            v-model="filterForm.status" 
            placeholder="请选择审批状态"
            allow-clear
            style="width: 150px">
            <a-option value="">全部</a-option>
            <a-option value="pending">待审批</a-option>
            <a-option value="approved">已通过</a-option>
            <a-option value="rejected">已拒绝</a-option>
            <a-option value="cancelled">已取消</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="usageScenario" label="使用场景">
          <a-select 
            v-model="filterForm.usageScenario" 
            placeholder="请选择使用场景"
            allow-clear
            style="width: 150px">
            <a-option value="">全部</a-option>
            <a-option value="batch_distribute">批量下发</a-option>
            <a-option value="telesales">电销使用</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="configMode" label="配置模式">
          <a-select 
            v-model="filterForm.configMode" 
            placeholder="请选择配置模式"
            allow-clear
            style="width: 150px">
            <a-option value="">全部</a-option>
            <a-option value="unified">统一配置</a-option>
            <a-option value="individual">分别编辑</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="dateRange" label="申请时间">
          <a-range-picker 
            v-model="filterForm.dateRange"
            style="width: 240px" />
        </a-form-item>
        <a-form-item field="keyword" label="关键词">
          <a-input 
            v-model="filterForm.keyword"
            placeholder="搜索申请人、批次ID"
            style="width: 200px"
            @press-enter="handleSearch" />
        </a-form-item>
        <a-form-item field="priority" label="优先级">
          <a-select 
            v-model="filterForm.priority" 
            placeholder="请选择优先级"
            allow-clear
            style="width: 120px">
            <a-option value="">全部</a-option>
            <a-option value="high">高</a-option>
            <a-option value="medium">中</a-option>
            <a-option value="low">低</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="resetFilter">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 审批列表 -->
    <a-card class="table-card">
      <template #title>
        <div class="table-header">
          <a-space>
            <span>审批列表</span>
            <a-tag color="blue">共 {{ pagination.total }} 条记录</a-tag>
            <a-tag v-if="selectedRowKeys.length > 0" color="orange">
              已选择 {{ selectedRowKeys.length }} 条
            </a-tag>
          </a-space>
          
          <!-- 批量操作按钮 -->
          <a-space v-if="selectedRowKeys.length > 0 && canApprove">
            <a-button 
              type="primary" 
              size="small"
              @click="handleBatchApprove('approved')">
              <template #icon><icon-check /></template>
              批量通过
            </a-button>
            <a-button 
              type="primary" 
              status="danger"
              size="small"
              @click="handleBatchApprove('rejected')">
              <template #icon><icon-close /></template>
              批量拒绝
            </a-button>
          </a-space>
        </div>
      </template>
      
      <a-table 
        :data="approvalList"
        :loading="loading"
        :pagination="pagination"
        :bordered="{ cell: true }"
        :row-selection="rowSelection"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange">
        <template #columns>
          <a-table-column title="批次ID" dataIndex="batchId" width="120" />
          <a-table-column title="申请人" dataIndex="applicant" width="100" />
          <a-table-column title="使用场景" width="100">
            <template #cell="{ record }">
              <a-tag :color="record.usageScenario === 'batch_distribute' ? 'blue' : 'green'">
                {{ record.usageScenario === 'batch_distribute' ? '批量下发' : '电销使用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="配置模式" width="100">
            <template #cell="{ record }">
              <a-tag :color="record.configMode === 'unified' ? 'purple' : 'orange'">
                {{ record.configMode === 'unified' ? '统一配置' : '分别编辑' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="券模板数量" dataIndex="templateCount" width="100" align="right" sortable />
          <a-table-column title="预计库存" dataIndex="totalInventory" width="100" align="right" sortable />
          <a-table-column title="优先级" width="80">
            <template #cell="{ record }">
              <a-tag :color="getPriorityColor(record.priority || 'medium')">
                {{ getPriorityText(record.priority || 'medium') }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="审批状态" width="100">
            <template #cell="{ record }">
              <a-tag :color="getApprovalStatusColor(record.status)">
                {{ getApprovalStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请时间" dataIndex="createTime" width="160" sortable />
          <a-table-column title="审批时间" dataIndex="approvalTime" width="160" sortable>
            <template #cell="{ record }">
              {{ record.approvalTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作" width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button 
                  type="text" 
                  size="small"
                  @click="viewDetail(record)">
                  查看详情
                </a-button>
                <!-- 快速审批按钮 -->
                <a-button 
                  v-if="record.status === 'pending' && canApprove"
                  type="text" 
                  size="small"
                  status="success"
                  @click="quickApprove(record, 'approved')"
                  title="快速通过 (Ctrl+Y)">
                  <template #icon><icon-check /></template>
                  通过
                </a-button>
                <a-button 
                  v-if="record.status === 'pending' && canApprove"
                  type="text" 
                  size="small"
                  status="danger"
                  @click="quickApprove(record, 'rejected')"
                  title="快速拒绝 (Ctrl+N)">
                  <template #icon><icon-close /></template>
                  拒绝
                </a-button>
                <a-button 
                  v-if="record.status === 'pending' && record.applicant === currentUser"
                  type="text" 
                  size="small"
                  status="warning"
                  @click="handleCancel(record)">
                  取消申请
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 审批详情弹窗 -->
    <a-modal 
      v-model:visible="detailModalVisible"
      title="审批详情"
      width="1000px"
      :footer="false">
      <div v-if="currentDetail" class="detail-content">
        <!-- 基础信息 -->
        <h4>基础信息</h4>
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="批次ID">
            {{ currentDetail.batchId }}
          </a-descriptions-item>
          <a-descriptions-item label="申请人">
            {{ currentDetail.applicant }}
          </a-descriptions-item>
          <a-descriptions-item label="使用场景">
            <a-tag :color="currentDetail.usageScenario === 'batch_distribute' ? 'blue' : 'green'">
              {{ currentDetail.usageScenario === 'batch_distribute' ? '批量下发' : '电销使用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="配置模式">
            <a-tag :color="currentDetail.configMode === 'unified' ? 'purple' : 'orange'">
              {{ currentDetail.configMode === 'unified' ? '统一配置' : '分别编辑' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="券模板数量">
            {{ currentDetail.templateCount }} 个
          </a-descriptions-item>
          <a-descriptions-item label="预计总库存">
            {{ currentDetail.totalInventory }} 张
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ currentDetail.createTime }}
          </a-descriptions-item>
          <a-descriptions-item label="审批状态">
            <a-tag :color="getApprovalStatusColor(currentDetail.status)">
              {{ getApprovalStatusText(currentDetail.status) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <!-- 申请理由 -->
        <h4 style="margin-top: 24px;">申请理由</h4>
        <a-card>
          <p>{{ currentDetail.reason }}</p>
        </a-card>

        <!-- 券库存详情 -->
        <h4 style="margin-top: 24px;">券库存详情</h4>
        <a-table 
          :data="currentDetail.inventoryDetails"
          :pagination="false"
          :bordered="{ cell: true }">
          <template #columns>
            <a-table-column title="券模板名称" dataIndex="templateName" />
            <a-table-column title="模板ID" dataIndex="templateId" />
            <a-table-column title="库存数量" dataIndex="quantity" align="right" />
            <a-table-column title="生效时间" dataIndex="validFrom" />
            <a-table-column title="失效时间" dataIndex="validTo" />
            <a-table-column title="备注" dataIndex="remark" />
          </template>
        </a-table>

        <!-- 审批流程 -->
        <h4 style="margin-top: 24px;">审批流程</h4>
        <a-steps 
          :current="getApprovalStepCurrent(currentDetail.status)"
          :status="getApprovalStepStatus(currentDetail.status)"
          direction="vertical">
          <a-step 
            title="申请提交" 
            :description="`${currentDetail.applicant} 于 ${currentDetail.createTime} 提交申请`" />
          <a-step 
            title="审批处理" 
            :description="getApprovalStepDescription(currentDetail)" />
          <a-step 
            v-if="currentDetail.status === 'approved'"
            title="执行创建" 
            description="系统自动执行批量创建券库存" />
        </a-steps>

        <!-- 审批意见 -->
        <div v-if="currentDetail.approvalComment" style="margin-top: 24px;">
          <h4>审批意见</h4>
          <a-card>
            <p><strong>审批人：</strong>{{ currentDetail.approver }}</p>
            <p><strong>审批时间：</strong>{{ currentDetail.approvalTime }}</p>
            <p><strong>审批意见：</strong>{{ currentDetail.approvalComment }}</p>
          </a-card>
        </div>
      </div>
    </a-modal>

    <!-- 审批操作弹窗 -->
    <a-modal 
      v-model:visible="approvalModalVisible"
      :title="approvalAction === 'approved' ? '审批通过' : '审批拒绝'"
      @ok="confirmApproval"
      @cancel="cancelApproval">
      <a-form :model="approvalForm" layout="vertical">
        <a-form-item 
          field="comment" 
          :label="approvalAction === 'approved' ? '审批意见' : '拒绝理由'"
          :rules="[{ required: approvalAction === 'rejected', message: '请输入拒绝理由' }]">
          <a-textarea 
            v-model="approvalForm.comment"
            :placeholder="approvalAction === 'approved' ? '请输入审批意见（可选）' : '请输入拒绝理由'"
            :max-length="200"
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 6 }" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量审批弹窗 -->
    <a-modal 
      v-model:visible="batchApprovalModalVisible"
      :title="batchApprovalAction === 'approved' ? '批量审批通过' : '批量审批拒绝'"
      @ok="confirmBatchApproval"
      @cancel="cancelBatchApproval">
      <div class="batch-approval-info">
        <a-alert 
          :type="batchApprovalAction === 'approved' ? 'success' : 'warning'"
          show-icon>
          <template #icon>
            <icon-check v-if="batchApprovalAction === 'approved'" />
            <icon-close v-else />
          </template>
          即将{{ batchApprovalAction === 'approved' ? '通过' : '拒绝' }} {{ selectedRows.filter(r => r.status === 'pending').length }} 条待审批记录
        </a-alert>
      </div>
      
      <a-form :model="batchApprovalForm" layout="vertical" style="margin-top: 16px;">
        <a-form-item 
          field="comment" 
          :label="batchApprovalAction === 'approved' ? '批量审批意见' : '批量拒绝理由'"
          :rules="[{ required: batchApprovalAction === 'rejected', message: '请输入拒绝理由' }]">
          <a-textarea 
            v-model="batchApprovalForm.comment"
            :placeholder="batchApprovalAction === 'approved' ? '请输入批量审批意见（可选）' : '请输入批量拒绝理由'"
            :max-length="200"
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 6 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconRefresh, IconCheck, IconClose } from '@arco-design/web-vue/es/icon'
import { approvalAPI } from '@/api/coupon.js'

// 筛选表单
const filterForm = reactive({
  status: '',
  usageScenario: '',
  configMode: '',
  dateRange: [],
  keyword: '',
  priority: ''
})

// 审批列表
const approvalList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 详情弹窗
const detailModalVisible = ref(false)
const currentDetail = ref(null)

// 审批弹窗
const approvalModalVisible = ref(false)
const approvalAction = ref('')
const currentApprovalRecord = ref(null)
const approvalForm = reactive({
  comment: ''
})

// 批量选择相关
const selectedRowKeys = ref([])
const selectedRows = ref([])

// 行选择配置
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedRowKeys,
  onSelect: (rowKeys, rowKey, record) => {
    selectedRowKeys.value = rowKeys
    selectedRows.value = approvalList.value.filter(item => rowKeys.includes(item.id))
  },
  onSelectAll: (selected) => {
    if (selected) {
      const pendingRecords = approvalList.value.filter(item => item.status === 'pending')
      selectedRowKeys.value = pendingRecords.map(item => item.id)
      selectedRows.value = pendingRecords
    } else {
      selectedRowKeys.value = []
      selectedRows.value = []
    }
  }
})

// 批量审批弹窗
const batchApprovalModalVisible = ref(false)
const batchApprovalAction = ref('')
const batchApprovalForm = reactive({
  comment: ''
})

// 用户权限
const canApprove = ref(true) // 这里可以根据实际权限控制
const currentUser = ref('当前用户') // 这里可以从用户信息中获取

// 获取审批列表
const fetchApprovalList = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: filterForm.status,
      usageScenario: filterForm.usageScenario,
      configMode: filterForm.configMode,
      keyword: filterForm.keyword
    }

    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0]
      params.endDate = filterForm.dateRange[1]
    }

    const response = await approvalAPI.getApprovalList(params)
    
    if (response.code === 200) {
      approvalList.value = response.data.list
      pagination.total = response.data.total
    } else {
      Message.error(response.message || '获取审批列表失败')
    }
  } catch (error) {
    console.error('获取审批列表失败:', error)
    Message.error('获取审批列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchApprovalList()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    status: '',
    usageScenario: '',
    configMode: '',
    dateRange: [],
    keyword: '',
    priority: ''
  })
  pagination.current = 1
  fetchApprovalList()
}

// 分页变化
const onPageChange = (page) => {
  pagination.current = page
  fetchApprovalList()
}

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchApprovalList()
}

// 查看详情
const viewDetail = async (record) => {
  try {
    const response = await approvalAPI.getApprovalDetail(record.id)
    if (response.code === 200) {
      currentDetail.value = response.data
      detailModalVisible.value = true
    } else {
      Message.error(response.message || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    Message.error('获取详情失败')
  }
}

// 审批操作
const handleApprove = (record, action) => {
  currentApprovalRecord.value = record
  approvalAction.value = action
  approvalForm.comment = ''
  approvalModalVisible.value = true
}

// 确认审批
const confirmApproval = async () => {
  try {
    if (approvalAction.value === 'rejected' && !approvalForm.comment.trim()) {
      Message.error('请输入拒绝理由')
      return
    }

    const params = {
      id: currentApprovalRecord.value.id,
      action: approvalAction.value,
      comment: approvalForm.comment
    }

    const response = await approvalAPI.processApproval(params)
    
    if (response.code === 200) {
      Message.success(approvalAction.value === 'approved' ? '审批通过成功' : '审批拒绝成功')
      approvalModalVisible.value = false
      fetchApprovalList()
    } else {
      Message.error(response.message || '审批操作失败')
    }
  } catch (error) {
    console.error('审批操作失败:', error)
    Message.error('审批操作失败')
  }
}

// 取消审批弹窗
const cancelApproval = () => {
  approvalModalVisible.value = false
  approvalForm.comment = ''
}

// 批量审批操作
const handleBatchApprove = (action) => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请先选择要审批的记录')
    return
  }
  
  // 过滤出待审批的记录
  const pendingRecords = selectedRows.value.filter(record => record.status === 'pending')
  if (pendingRecords.length === 0) {
    Message.warning('所选记录中没有待审批的记录')
    return
  }
  
  batchApprovalAction.value = action
  batchApprovalForm.comment = ''
  batchApprovalModalVisible.value = true
}

// 确认批量审批
const confirmBatchApproval = async () => {
  try {
    if (batchApprovalAction.value === 'rejected' && !batchApprovalForm.comment.trim()) {
      Message.error('请输入拒绝理由')
      return
    }

    const pendingRecords = selectedRows.value.filter(record => record.status === 'pending')
    const params = {
      ids: pendingRecords.map(record => record.id),
      action: batchApprovalAction.value,
      comment: batchApprovalForm.comment
    }

    const response = await approvalAPI.batchProcessApproval(params)
    
    if (response.code === 200) {
      const actionText = batchApprovalAction.value === 'approved' ? '通过' : '拒绝'
      Message.success(`批量审批${actionText}成功，共处理 ${pendingRecords.length} 条记录`)
      batchApprovalModalVisible.value = false
      selectedRowKeys.value = []
      selectedRows.value = []
      fetchApprovalList()
    } else {
      Message.error(response.message || '批量审批操作失败')
    }
  } catch (error) {
    console.error('批量审批操作失败:', error)
    Message.error('批量审批操作失败')
  }
}

// 取消批量审批弹窗
const cancelBatchApproval = () => {
  batchApprovalModalVisible.value = false
  batchApprovalForm.comment = ''
}

// 取消申请
const handleCancel = (record) => {
  Modal.confirm({
    title: '确认取消申请',
    content: '取消后将无法恢复，确定要取消这个批量创建申请吗？',
    onOk: async () => {
      try {
        const response = await approvalAPI.cancelApproval(record.id)
        if (response.code === 200) {
          Message.success('取消申请成功')
          fetchApprovalList()
        } else {
          Message.error(response.message || '取消申请失败')
        }
      } catch (error) {
        console.error('取消申请失败:', error)
        Message.error('取消申请失败')
      }
    }
  })
}

// 获取审批状态颜色
const getApprovalStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    cancelled: 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取审批状态文本
const getApprovalStatusText = (status) => {
  const textMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

// 获取优先级颜色
const getPriorityColor = (priority) => {
  const colorMap = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  }
  return colorMap[priority] || 'gray'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const textMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || '中'
}

// 获取审批步骤当前位置
const getApprovalStepCurrent = (status) => {
  switch (status) {
    case 'pending':
      return 1
    case 'approved':
      return 2
    case 'rejected':
    case 'cancelled':
      return 1
    default:
      return 0
  }
}

// 获取审批步骤状态
const getApprovalStepStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'process'
    case 'approved':
      return 'finish'
    case 'rejected':
    case 'cancelled':
      return 'error'
    default:
      return 'wait'
  }
}

// 获取审批步骤描述
const getApprovalStepDescription = (detail) => {
  switch (detail.status) {
    case 'pending':
      return '等待审批人处理'
    case 'approved':
      return `${detail.approver} 于 ${detail.approvalTime} 审批通过`
    case 'rejected':
      return `${detail.approver} 于 ${detail.approvalTime} 审批拒绝`
    case 'cancelled':
      return `${detail.applicant} 于 ${detail.cancelTime} 取消申请`
    default:
      return '等待处理'
  }
}

// 快速审批（无需填写意见）
const quickApprove = async (record, action) => {
  try {
    const params = {
      id: record.id,
      action: action,
      comment: action === 'approved' ? '快速审批通过' : '快速审批拒绝'
    }

    const response = await approvalAPI.processApproval(params)
    
    if (response.code === 200) {
      Message.success(action === 'approved' ? '快速审批通过成功' : '快速审批拒绝成功')
      fetchApprovalList()
    } else {
      Message.error(response.message || '快速审批操作失败')
    }
  } catch (error) {
    console.error('快速审批操作失败:', error)
    Message.error('快速审批操作失败')
  }
}

// 键盘快捷键处理
const handleKeydown = (event) => {
  // 只在没有弹窗打开时处理快捷键
  if (detailModalVisible.value || approvalModalVisible.value || batchApprovalModalVisible.value) {
    return
  }

  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'y':
        event.preventDefault()
        // 批量快速通过
        if (selectedRowKeys.value.length > 0) {
          handleBatchQuickApprove('approved')
        }
        break
      case 'n':
        event.preventDefault()
        // 批量快速拒绝
        if (selectedRowKeys.value.length > 0) {
          handleBatchQuickApprove('rejected')
        }
        break
      case 'a':
        event.preventDefault()
        // 全选待审批记录
        const pendingRecords = approvalList.value.filter(item => item.status === 'pending')
        selectedRowKeys.value = pendingRecords.map(item => item.id)
        selectedRows.value = pendingRecords
        break
    }
  }
}

// 批量快速审批
const handleBatchQuickApprove = async (action) => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请先选择要审批的记录')
    return
  }
  
  const pendingRecords = selectedRows.value.filter(record => record.status === 'pending')
  if (pendingRecords.length === 0) {
    Message.warning('所选记录中没有待审批的记录')
    return
  }

  try {
    const params = {
      ids: pendingRecords.map(record => record.id),
      action: action,
      comment: action === 'approved' ? '批量快速审批通过' : '批量快速审批拒绝'
    }

    const response = await approvalAPI.batchProcessApproval(params)
    
    if (response.code === 200) {
      const actionText = action === 'approved' ? '通过' : '拒绝'
      Message.success(`批量快速审批${actionText}成功，共处理 ${pendingRecords.length} 条记录`)
      selectedRowKeys.value = []
      selectedRows.value = []
      fetchApprovalList()
    } else {
      Message.error(response.message || '批量快速审批操作失败')
    }
  } catch (error) {
    console.error('批量快速审批操作失败:', error)
    Message.error('批量快速审批操作失败')
  }
}

// 初始化
onMounted(() => {
  fetchApprovalList()
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.approval-container {
  padding: 24px;
  background-color: var(--color-bg-2);
}

.filter-card,
.table-card {
  margin-bottom: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.batch-approval-info {
  margin-bottom: 16px;
}

.detail-content h4 {
  margin: 16px 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.detail-content h4:first-child {
  margin-top: 0;
}

:deep(.arco-table-th) {
  background-color: var(--color-bg-2);
  font-weight: 600;
}

:deep(.arco-descriptions-item-label) {
  font-weight: 600;
}

:deep(.arco-steps-item-title) {
  font-weight: 600;
}
</style>