<template>
  <div class="coupon-inventory-container">
    <!-- 统计卡片区域 -->
    <div class="statistics-cards">
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic 
              title="总库存数量" 
              :value="statisticsData.totalInventory"
              :value-style="{ color: '#1890ff' }">
              <template #suffix>
                <icon-check-circle />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic 
              title="待审批数量" 
              :value="statisticsData.pendingApproval"
              :value-style="{ color: '#faad14' }">
              <template #suffix>
                <icon-clock-circle />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic 
              title="已通过数量" 
              :value="statisticsData.approvedCount"
              :value-style="{ color: '#52c41a' }">
              <template #suffix>
                <icon-check-circle />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic 
              title="已拒绝数量" 
              :value="statisticsData.rejectedCount"
              :value-style="{ color: '#ff4d4f' }">
              <template #suffix>
                <icon-close-circle />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索表单 -->
    <a-card class="search-card">
      <a-form :model="formModel" @submit="handleSearch" layout="horizontal" :style="{ width: '100%' }">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="couponId" label="券实例ID">
              <a-input v-model="formModel.couponId" placeholder="请输入券实例ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="templateId" label="券模版">
              <a-input v-model="formModel.templateId" placeholder="请输入券模版ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="userId" label="用户ID">
              <a-input v-model="formModel.userId" placeholder="请输入用户ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="packageId" label="券包ID">
              <a-input v-model="formModel.packageId" placeholder="请输入券包ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="status" label="券状态">
              <a-select v-model="formModel.status" placeholder="请选择券状态" allow-clear>
                <a-option value="received">已领取</a-option>
                <a-option value="locked">已锁定</a-option>
                <a-option value="used">已核销</a-option>
                <a-option value="expired">已过期</a-option>
                <a-option value="invalid">已作废</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="createTime" label="创建时间">
              <a-range-picker v-model="formModel.createTime" placeholder="请选择创建时间范围" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" style="text-align: right">
            <a-space>
              <a-button @click="resetForm">重置</a-button>
              <a-button type="primary" html-type="submit">查询</a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 数据列表 -->
    <a-card class="table-card">
      <template #title>
        库存统计列表
      </template>
      <template #extra>
        <div class="table-actions">
          <!-- 库存操作区域 -->
          <div class="inventory-actions">
            <a-button 
              type="primary" 
              @click="handleExport">
              <template #icon><icon-download /></template>
              导出数据
            </a-button>
            <a-button 
              type="outline" 
              @click="handleRefresh">
              <template #icon><icon-refresh /></template>
              刷新数据
            </a-button>
          </div>
        </div>
      </template>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :bordered="{ cell: true, wrapper: true }"
        stripe
        :row-selection="rowSelection"
        @row-click="handleRowClick"
      >
        <template #columns>
          <template v-for="column in columns" :key="column.dataIndex">
            <a-table-column v-bind="column">
              <template #cell="{ record }" v-if="column.customCell">
                <component :is="column.customCell" :record="record" />
              </template>
            </a-table-column>
          </template>
        </template>

        <template #approvalStatus="{ record }">
          <a-tag :color="getApprovalStatusColor(record.approvalStatus)">
            {{ getApprovalStatusText(record.approvalStatus) }}
          </a-tag>
        </template>
        
        <template #action="{ record }">
          <a-space>
            <template v-if="record.approvalStatus === 'pending'">
              <a-button 
                type="text" 
                size="small" 
                status="success"
                @click="handleSingleApprove(record)"
              >
                <template #icon>
                  <icon-check-circle />
                </template>
                通过
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleSingleReject(record)"
              >
                <template #icon>
                  <icon-close-circle />
                </template>
                拒绝
              </a-button>
            </template>
            <a-button 
              type="text" 
              size="small"
              @click="viewDetail(record)"
            >
              查看详情
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
   </div>
</template>

<script setup>
import { ref, reactive, h, computed } from 'vue'
import { IconDownload, IconRefresh, IconCheckCircle, IconCloseCircle, IconClockCircle } from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'

// 表格列配置
const columns = [
  { title: '用户ID', dataIndex: 'userId', width: 120, align: 'center' },
  { title: '券实例ID', dataIndex: 'couponId', width: 120, align: 'center' },
  { title: '券模版ID', dataIndex: 'templateId', width: 120, align: 'center' },
  { title: '券名称', dataIndex: 'couponName', width: 200 },
  {
    title: '券类型',
    dataIndex: 'couponType',
    width: 100,
    align: 'center',
    customCell: ({ record }) => h('a-tag', {
      color: record.couponType === 'discount' ? 'blue' : record.couponType === 'reduction' ? 'green' : 'orange'
    }, record.couponType === 'discount' ? '折扣券' : record.couponType === 'reduction' ? '满减券' : '立减券')
  },
  {
    title: '有效期',
    dataIndex: 'validPeriod',
    width: 200,
    customCell: ({ record }) => `${record.startTime} ~ ${record.endTime}`
  },
  {
    title: '券状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    customCell: ({ record }) => h('a-tag', {
      color: {
        'received': 'blue',
        'locked': 'orange',
        'used': 'green',
        'expired': 'red',
        'invalid': 'gray'
      }[record.status]
    }, {
      'received': '已领取',
      'locked': '已锁定',
      'used': '已核销',
      'expired': '已过期',
      'invalid': '已作废'
    }[record.status])
  },
  { 
    title: '创建时间', 
    dataIndex: 'createTime', 
    width: 160
  },
  {
    title: '操作',
    width: 200,
    align: 'center',
    slotName: 'action'
  }
]

// 搜索表单数据
const formModel = reactive({
  couponId: '',
  templateId: '',
  userId: '',
  packageId: '',
  status: '',
  createTime: []
})

// 统计数据
const statisticsData = reactive({
  totalInventory: 0,
  pendingApproval: 0,
  approvedCount: 0,
  rejectedCount: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRowKeys = ref([])
const selectedRows = ref([])

// 行选择配置
const rowSelection = computed(() => ({
  type: 'checkbox',
  showCheckedAll: true,
  selectedRowKeys: selectedRowKeys.value,
  onChange: (rowKeys, rows) => {
    selectedRowKeys.value = rowKeys;
    selectedRows.value = rows;
  },
  checkStrictly: false,
  onlyCurrent: false
}))

// 导出数据功能
const handleExport = () => {
  Message.info('导出功能开发中...')
}

// 刷新数据功能
const handleRefresh = () => {
  fetchInventoryData()
  fetchStatistics()
}

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 50,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 获取库存数据
const fetchInventoryData = async () => {
  loading.value = true
  try {
    const { inventoryAPI } = await import('@/api/coupon.js')
    
    // 构建查询参数，过滤掉空值
    const queryParams = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    
    // 只添加非空的搜索条件
    Object.keys(formModel).forEach(key => {
      if (formModel[key] && formModel[key] !== '') {
        queryParams[key] = formModel[key]
      }
    })
    
    const response = await inventoryAPI.getInventoryList(queryParams)
    
    if (response.code === 200) {
       tableData.value = response.data.list
       pagination.total = response.data.total
     } else {
       Message.error(response.message || '获取数据失败')
     }
  } catch (error) {
    console.error('获取库存数据失败:', error)
    Message.error('获取数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const { inventoryAPI } = await import('@/api/coupon.js')
    const response = await inventoryAPI.getInventoryList({})
    if (response.code === 200) {
      const allData = response.data.list
      statisticsData.totalInventory = allData.length
      statisticsData.pendingApproval = allData.filter(item => item.approvalStatus === 'pending').length
      statisticsData.approvedCount = allData.filter(item => item.approvalStatus === 'approved').length
      statisticsData.rejectedCount = allData.filter(item => item.approvalStatus === 'rejected').length
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchInventoryData()
}

// 批量撤回
const withdrawLoading = ref(false)
const handleBatchWithdraw = async () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要撤回的券')
    return
  }
  
  // 检查选中的券是否都可以撤回
  const selectedRows = inventoryData.value.filter(item => selectedRowKeys.value.includes(item.id))
  const canWithdrawRows = selectedRows.filter(item => item.status === 'active')
  
  if (canWithdrawRows.length === 0) {
    Message.warning('选中的券都不能撤回')
    return
  }
  
  if (canWithdrawRows.length < selectedRows.length) {
    Message.warning(`只有 ${canWithdrawRows.length} 张券可以撤回`)
  }
  
  Modal.confirm({
    title: '确认撤回',
    content: `确定要撤回选中的 ${canWithdrawRows.length} 张券吗？`,
    onOk: () => executeWithdraw(canWithdrawRows.map(item => item.id))
  })
}

const executeWithdraw = async (couponIds) => {
  withdrawLoading.value = true
  try {
    const { inventoryAPI } = await import('@/api/coupon.js')
    const response = await inventoryAPI.batchWithdraw(couponIds)
    
    if (response.code === 200) {
      Message.success(`成功撤回 ${couponIds.length} 张券`)
      selectedRowKeys.value = []
      // 重新获取数据
      await fetchInventoryData()
    } else {
      Message.error(response.message || '撤回失败')
    }
  } catch (error) {
    console.error('撤回失败:', error)
    Message.error('撤回失败，请重试')
  } finally {
    withdrawLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formModel.couponId = ''
  formModel.templateId = ''
  formModel.userId = ''
  formModel.packageId = ''
  formModel.status = ''
  formModel.createTime = []
  handleSearch()
}



// 分页变化
const onPageChange = (current) => {
  pagination.current = current
  fetchInventoryData()
}

// 每页条数变化
const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchInventoryData()
}

// 行点击事件
const handleRowClick = (record) => {
  const index = selectedRowKeys.value.indexOf(record.couponId);
  if (index === -1) {
    selectedRowKeys.value = [...selectedRowKeys.value, record.couponId];
    selectedRows.value = [...selectedRows.value, record];
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== record.couponId);
    selectedRows.value = selectedRows.value.filter(row => row.couponId !== record.couponId);
  }
  
  // 验证选中状态
  const validStatus = ['received', 'locked'];
  const hasInvalidSelection = selectedRows.value.some(
    item => !validStatus.includes(item.status)
  );
  
  if (hasInvalidSelection) {
    Message.warning('只能选择状态为"已领取"或"已锁定"的券');
  }
};





// 查看详情
const viewDetail = (record) => {
  // 这里可以打开详情弹窗或跳转到详情页面
  Message.info(`查看券实例 ${record.couponId} 的详情`)
}

// 审批成功回调
const handleApprovalSuccess = async () => {
  approvalModalVisible.value = false
  Message.success('审批申请提交成功')
  // 重新获取数据
  await fetchInventoryData()
}

// 获取审批状态颜色
const getApprovalStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    none: 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取审批状态文本
const getApprovalStatusText = (status) => {
  const textMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    none: '无需审批'
  }
  return textMap[status] || '未知'
}

// 初始化加载数据
fetchInventoryData()
fetchStatistics()
</script>

<style scoped>
.coupon-inventory-container {
  padding: 24px;
  background-color: var(--color-bg-2);
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  :deep(.arco-table-th) {
    background-color: var(--color-bg-2);
    font-weight: 600;
  }

  :deep(.arco-table-tr:hover) {
    background-color: var(--color-fill-1);
  }
}
</style>