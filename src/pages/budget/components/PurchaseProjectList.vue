<template>
  <div class="purchase-project-list">
    <a-card title="采购项目列表" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="primary" size="small" @click="handleCreateProject">
            <template #icon>
              <icon-plus />
            </template>
            新建项目
          </a-button>
          <a-button size="small" @click="handleRefresh">
            <template #icon>
              <icon-refresh />
            </template>
            刷新
          </a-button>
        </a-space>
      </template>
      
      <a-table
        :columns="columns"
        :data="projectList"
        :loading="loading"
        :pagination="paginationConfig"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @sorter-change="handleSortChange"
      >
        <template #projectName="{ record }">
          <a-link @click="handleViewDetail(record)">{{ record.projectName }}</a-link>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #budgetInfo="{ record }">
          <div v-if="record.budgetInfo" class="budget-info">
            <div class="budget-name">{{ record.budgetInfo.budgetName }}</div>
            <div class="budget-amount">¥{{ formatAmount(record.budgetInfo.totalAmount) }}</div>
          </div>
          <div v-else class="no-budget">
            <a-tag size="small" color="orange">未关联</a-tag>
          </div>
        </template>
        
        <template #amountInfo="{ record }">
          <div class="amount-info">
            <div class="total-amount">
              <span class="label">总金额:</span>
              <span class="value">¥{{ formatAmount(record.totalAmount) }}</span>
            </div>
            <div class="consumed-amount">
              <span class="label">已消耗:</span>
              <span class="value">¥{{ formatAmount(record.actualConsumedAmount) }}</span>
            </div>
            <div class="remaining-amount">
              <span class="label">剩余:</span>
              <span class="value">¥{{ formatAmount(record.totalAmount - record.actualConsumedAmount) }}</span>
            </div>
          </div>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleViewDetail(record)">
              <template #icon>
                <icon-eye />
              </template>
              详情
            </a-button>
            <a-button type="text" size="small" @click="handleEdit(record)">
              <template #icon>
                <icon-edit />
              </template>
              编辑
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="handleAssociateBudget(record)"
              v-if="!record.budgetId"
            >
              <template #icon>
                <icon-link />
              </template>
              关联预算
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="handleUpdateStatus(record)"
            >
              <template #icon>
                <icon-swap />
              </template>
              状态变更
            </a-button>
            <a-popconfirm 
              content="确定要删除这个项目吗？" 
              @ok="handleDelete(record)"
            >
              <a-button type="text" size="small" status="danger">
                <template #icon>
                  <icon-delete />
                </template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>
    
    <!-- 关联预算对话框 -->
    <AssociateBudgetModal
      v-model:visible="associateModalVisible"
      :project="currentProject"
      @confirm="handleAssociateConfirm"
    />
    
    <!-- 状态变更对话框 -->
    <UpdateStatusModal
      v-model:visible="statusModalVisible"
      :project="currentProject"
      @confirm="handleStatusUpdateConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconRefresh, 
  IconEye, 
  IconEdit, 
  IconLink, 
  IconSwap, 
  IconDelete 
} from '@arco-design/web-vue/es/icon'
import AssociateBudgetModal from './AssociateBudgetModal.vue'
import UpdateStatusModal from './UpdateStatusModal.vue'
import { purchaseProjectApiService } from '@/api/purchase-project'
import type { PurchaseProject } from '@/types/purchase-project'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const projectList = ref<PurchaseProject[]>([])
const associateModalVisible = ref(false)
const statusModalVisible = ref(false)
const currentProject = ref<PurchaseProject | null>(null)

// 分页配置
const paginationConfig = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
})

// 排序配置
const sortConfig = reactive({
  field: 'createdAt',
  direction: 'desc'
})

// 表格列配置
const columns = [
  {
    title: '项目编号',
    dataIndex: 'projectNo',
    width: 120,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    slotName: 'projectName',
    width: 200,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '关联预算',
    slotName: 'budgetInfo',
    width: 180
  },
  {
    title: '金额信息',
    slotName: 'amountInfo',
    width: 200
  },
  {
    title: '采购用量',
    dataIndex: 'purchaseVolume',
    width: 100,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '采购日期',
    dataIndex: 'purchaseDate',
    width: 120,
    render: ({ record }: any) => formatDate(record.purchaseDate),
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '项目负责人',
    dataIndex: 'owner',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 160,
    render: ({ record }: any) => formatDate(record.createdAt),
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 生命周期
onMounted(async () => {
  await loadProjectList()
})

// 方法
const loadProjectList = async () => {
  try {
    loading.value = true
    const params = {
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction
    }
    
    const response = await purchaseProjectApiService.getProjectList(params)
    projectList.value = response.list || []
    paginationConfig.total = response.total || 0
  } catch (error) {
    Message.error('加载项目列表失败')
    console.error('加载项目列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  paginationConfig.current = page
  loadProjectList()
}

const handlePageSizeChange = (pageSize: number) => {
  paginationConfig.pageSize = pageSize
  paginationConfig.current = 1
  loadProjectList()
}

const handleSortChange = (sort: { field: string; direction: string }) => {
  sortConfig.field = sort.field
  sortConfig.direction = sort.direction
  loadProjectList()
}

const handleRefresh = () => {
  loadProjectList()
  Message.success('数据已刷新')
}

const handleCreateProject = () => {
  router.push('/discovery/asset-management/external-purchase-register')
}

const handleViewDetail = (record: PurchaseProject) => {
  // 跳转到项目详情页面
  Message.info(`查看项目详情: ${record.projectName}`)
}

const handleEdit = (record: PurchaseProject) => {
  // 跳转到项目编辑页面
  Message.info(`编辑项目: ${record.projectName}`)
}

const handleAssociateBudget = (record: PurchaseProject) => {
  currentProject.value = record
  associateModalVisible.value = true
}

const handleUpdateStatus = (record: PurchaseProject) => {
  currentProject.value = record
  statusModalVisible.value = true
}

const handleDelete = async (record: PurchaseProject) => {
  try {
    await purchaseProjectApiService.deleteProject(record.id)
    Message.success('删除成功')
    await loadProjectList()
  } catch (error) {
    Message.error('删除失败')
    console.error('删除项目失败:', error)
  }
}

const handleAssociateConfirm = async (budgetId: string) => {
  try {
    await purchaseProjectApiService.associateBudget(currentProject.value!.id, budgetId)
    Message.success('关联预算成功')
    associateModalVisible.value = false
    await loadProjectList()
  } catch (error) {
    Message.error('关联预算失败')
    console.error('关联预算失败:', error)
  }
}

const handleStatusUpdateConfirm = async (newStatus: string) => {
  try {
    await purchaseProjectApiService.updateProjectStatus(currentProject.value!.id, newStatus)
    Message.success('状态更新成功')
    statusModalVisible.value = false
    await loadProjectList()
  } catch (error) {
    Message.error('状态更新失败')
    console.error('状态更新失败:', error)
  }
}

// 工具函数
const formatAmount = (amount: number | null | undefined): string => {
  const n = Number(amount ?? 0)
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString('zh-CN')
}

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    pending: '待审批',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 对外暴露加载方法，供父组件调用
defineExpose({
  loadData: loadProjectList
})
</script>

<style scoped lang="less">
.purchase-project-list {
  margin-bottom: 24px;
  
  .budget-info {
    .budget-name {
      font-size: 14px;
      color: #1d2129;
      margin-bottom: 4px;
    }
    
    .budget-amount {
      font-size: 12px;
      color: #86909c;
    }
  }
  
  .no-budget {
    text-align: center;
  }
  
  .amount-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .total-amount,
    .consumed-amount,
    .remaining-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      
      .label {
        color: #86909c;
      }
      
      .value {
        color: #1d2129;
        font-weight: 500;
      }
    }
    
    .consumed-amount .value {
      color: #ff7d00;
    }
    
    .remaining-amount .value {
      color: #00b42a;
    }
  }
}
</style>