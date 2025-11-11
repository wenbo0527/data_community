<template>
  <div class="budget-list">
    <a-card title="预算列表" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="primary" size="small" @click="handleCreateBudget">
            <template #icon>
              <icon-plus />
            </template>
            新建预算
          </a-button>
          <a-button size="small" @click="handleBatchVerification" :disabled="selectedRowKeys.length === 0">
            <template #icon>
              <icon-check-circle />
            </template>
            批量核销
          </a-button>
        </a-space>
      </template>
      
      <a-table
        :columns="columns"
        :data="budgetList"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="paginationConfig"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @sorter-change="handleSortChange"
      >
        <template #budgetName="{ record }">
          <a-link @click="handleViewDetail(record)">{{ record.budgetName }}</a-link>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #executionRate="{ record }">
          <div class="execution-rate">
            <span class="rate-text">{{ record.executionRate }}%</span>
            <a-progress 
              :percent="record.executionRate" 
              :status="getExecutionRateStatus(record.executionRate)"
              size="small"
            />
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
              @click="handleVerification(record)"
              :disabled="record.remainingAmount <= 0"
            >
              <template #icon>
                <icon-check-circle />
              </template>
              核销
            </a-button>
            <a-popconfirm 
              content="确定要删除这个预算吗？" 
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
    
    <!-- 核销对话框 -->
    <BudgetVerificationModal
      v-model:visible="verificationModalVisible"
      :budget="currentBudget"
      :projects="relatedProjects"
      @confirm="handleVerificationConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconCheckCircle, 
  IconEye, 
  IconEdit, 
  IconDelete 
} from '@arco-design/web-vue/es/icon'
import BudgetVerificationModal from './BudgetVerificationModal.vue'
import { budgetApiService } from '@/api/budget'
import type { Budget, BudgetVerificationRequest } from '@/types/budget'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const budgetList = ref<Budget[]>([])
const selectedRowKeys = ref<string[]>([])
const verificationModalVisible = ref(false)
const currentBudget = ref<Budget | null>(null)
const relatedProjects = ref([])

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
    title: '预算编号',
    dataIndex: 'budgetNo',
    width: 120,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '预算名称',
    dataIndex: 'budgetName',
    slotName: 'budgetName',
    width: 200,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '预算年度',
    dataIndex: 'budgetYear',
    width: 100,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '业务类型',
    dataIndex: 'businessType',
    width: 120
  },
  {
    title: '平台产品',
    dataIndex: 'platformProduct',
    width: 120
  },
  {
    title: '预算总额',
    dataIndex: 'totalAmount',
    width: 120,
    render: ({ record }: any) => `¥${formatAmount(record.totalAmount)}`,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '已使用',
    dataIndex: 'usedAmount',
    width: 120,
    render: ({ record }: any) => `¥${formatAmount(record.usedAmount)}`,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '剩余',
    dataIndex: 'remainingAmount',
    width: 120,
    render: ({ record }: any) => `¥${formatAmount(record.remainingAmount)}`,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '执行率',
    dataIndex: 'executionRate',
    slotName: 'executionRate',
    width: 150,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
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

// 计算属性
const rowSelection = computed(() => ({
  type: 'checkbox',
  showCheckedAll: true,
  selectedRowKeys: selectedRowKeys.value,
  onSelect: (rowKeys: string[]) => {
    selectedRowKeys.value = rowKeys
  }
}))

// 生命周期
onMounted(async () => {
  await loadBudgetList()
})

// 方法
const loadBudgetList = async () => {
  try {
    loading.value = true
    const params = {
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction
    }
    
    const response = await budgetApiService.getBudgets(params)
    budgetList.value = response.list
    paginationConfig.total = response.total
  } catch (error) {
    Message.error('加载预算列表失败')
    console.error('加载预算列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  paginationConfig.current = page
  loadBudgetList()
}

const handlePageSizeChange = (pageSize: number) => {
  paginationConfig.pageSize = pageSize
  paginationConfig.current = 1
  loadBudgetList()
}

const handleSortChange = (sort: { field: string; direction: string }) => {
  sortConfig.field = sort.field
  sortConfig.direction = sort.direction
  loadBudgetList()
}

const handleCreateBudget = () => {
  router.push('/budget/create')
}

const handleViewDetail = (record: Budget) => {
  router.push(`/budget/detail/${record.id}`)
}

const handleEdit = (record: Budget) => {
  router.push(`/budget/edit/${record.id}`)
}

const handleDelete = async (record: Budget) => {
  try {
    await budgetApiService.deleteBudget(record.id)
    Message.success('删除成功')
    await loadBudgetList()
  } catch (error) {
    Message.error('删除失败')
    console.error('删除预算失败:', error)
  }
}

const handleVerification = async (record: Budget) => {
  try {
    currentBudget.value = record
    // 获取关联的采购项目
    const projects = await budgetApiService.getRelatedProjects(record.id)
    relatedProjects.value = projects
    verificationModalVisible.value = true
  } catch (error) {
    Message.error('获取关联项目失败')
    console.error('获取关联项目失败:', error)
  }
}

const handleBatchVerification = async () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要核销的预算')
    return
  }
  
  try {
    // 获取选中的预算详情
    const selectedBudgets = budgetList.value.filter(budget => 
      selectedRowKeys.value.includes(budget.id)
    )
    
    // 检查是否有可核销的预算
    const availableBudgets = selectedBudgets.filter(budget => budget.remainingAmount > 0)
    
    if (availableBudgets.length === 0) {
      Message.warning('选中的预算无可核销金额')
      return
    }
    
    // 批量核销逻辑
    Message.info(`批量核销功能开发中，已选中 ${availableBudgets.length} 个预算`)
  } catch (error) {
    Message.error('批量核销失败')
    console.error('批量核销失败:', error)
  }
}

const handleVerificationConfirm = async (verificationData: BudgetVerificationRequest) => {
  try {
    await budgetApiService.createVerification(verificationData)
    Message.success('核销成功')
    verificationModalVisible.value = false
    await loadBudgetList()
  } catch (error) {
    Message.error('核销失败')
    console.error('核销失败:', error)
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
    active: 'green',
    inactive: 'gray',
    expired: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    active: '活跃',
    inactive: '停用',
    expired: '过期'
  }
  return textMap[status] || status
}

const getExecutionRateStatus = (rate: number): 'success' | 'warning' | 'danger' => {
  if (rate >= 90) return 'danger'
  if (rate >= 70) return 'warning'
  return 'success'
}

// 对外暴露加载方法，供父组件调用
defineExpose({
  loadData: loadBudgetList
})
</script>

<style scoped lang="less">
.budget-list {
  margin-bottom: 24px;
  
  .execution-rate {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .rate-text {
      font-size: 12px;
      color: #86909c;
    }
  }
}
</style>