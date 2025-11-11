<template>
  <div class="budget-verification-panel">
    <a-card title="核销操作" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleBatchVerification">
            <template #icon>
              <icon-check />
            </template>
            批量核销
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon>
              <icon-refresh />
            </template>
            刷新
          </a-button>
        </a-space>
      </template>
      
      <!-- 核销统计信息 -->
      <div class="verification-stats">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic title="待核销预算" :value="pendingVerificationStats.totalBudget" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="待核销项目" :value="pendingVerificationStats.totalProjects" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="本月已核销" :value="verificationStats.monthlyVerified" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="核销成功率" :value="verificationStats.successRate" suffix="%">
              <template #prefix>
                <icon-arrow-rise />
              </template>
            </a-statistic>
          </a-col>
        </a-row>
      </div>
      
      <!-- 核销操作表单 -->
      <div class="verification-form-section">
        <a-form :model="verificationForm" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="budgetId" label="选择预算" required>
                <a-select
                  v-model="verificationForm.budgetId"
                  placeholder="请选择预算"
                  allow-clear
                  @change="handleBudgetChange"
                >
                  <a-option
                    v-for="budget in availableBudgets"
                    :key="budget.id"
                    :value="budget.id"
                    :label="`${budget.budgetName} (剩余: ¥${formatAmount(budget.remainingAmount)})`"
                  />
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="projectId" label="选择项目" required>
                <a-select
                  v-model="verificationForm.projectId"
                  placeholder="请选择项目"
                  allow-clear
                  @change="handleProjectChange"
                >
                  <a-option
                    v-for="project in availableProjects"
                    :key="project.id"
                    :value="project.id"
                    :label="`${project.projectName} (金额: ¥${formatAmount(project.amount)})`"
                  />
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="verificationAmount" label="核销金额" required>
                <a-input-number
                  v-model="verificationForm.verificationAmount"
                  :min="0"
                  :max="maxVerificationAmount"
                  :precision="2"
                  placeholder="请输入核销金额"
                  style="width: 100%"
                >
                  <template #prefix>¥</template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="verificationDate" label="核销日期" required>
                <a-date-picker
                  v-model="verificationForm.verificationDate"
                  placeholder="请选择核销日期"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item field="remark" label="核销说明">
            <a-textarea
              v-model="verificationForm.remark"
              placeholder="请输入核销说明"
              :max-length="500"
              show-word-limit
              :rows="3"
            />
          </a-form-item>
          
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSubmit" :loading="submitLoading">
                <template #icon>
                  <icon-check-circle />
                </template>
                确认核销
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
      
      <!-- 核销记录列表 -->
      <div class="verification-history">
        <div class="section-header">
          <h4>核销记录</h4>
          <a-space>
            <a-range-picker
              v-model="dateRange"
              style="width: 240px"
              @change="handleDateRangeChange"
            />
            <a-select
              v-model="statusFilter"
              placeholder="状态筛选"
              style="width: 120px"
              allow-clear
              @change="handleStatusFilterChange"
            >
              <a-option value="pending">待审核</a-option>
              <a-option value="approved">已通过</a-option>
              <a-option value="rejected">已拒绝</a-option>
            </a-select>
          </a-space>
        </div>
        
        <a-table
          :data="verificationRecords"
          :loading="tableLoading"
          :pagination="paginationConfig"
          row-key="id"
          @page-change="handlePageChange"
        >
          <template #columns>
            <a-table-column title="核销编号" data-index="verificationNo" width="120" />
            <a-table-column title="预算名称" data-index="budgetName" width="150" />
            <a-table-column title="项目名称" data-index="projectName" width="150" />
            <a-table-column title="核销金额" width="100">
              <template #cell="{ record }">
                <span class="amount-text">¥{{ formatAmount(record.verificationAmount) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="核销日期" data-index="verificationDate" width="100" />
            <a-table-column title="状态" width="80">
              <template #cell="{ record }">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作人" data-index="operator" width="100" />
            <a-table-column title="操作" width="120" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewDetail(record)">
                    详情
                  </a-button>
                  <a-button 
                    v-if="record.status === 'pending'" 
                    type="text" 
                    size="small" 
                    @click="handleApprove(record)"
                  >
                    审核
                  </a-button>
                  <a-popconfirm
                    v-if="record.status === 'pending'"
                    content="确定要撤销此核销申请吗？"
                    @ok="handleRevoke(record)"
                  >
                    <a-button type="text" size="small" status="danger">
                      撤销
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconCheck, 
  IconRefresh, 
  IconCheckCircle,
  IconArrowRise 
} from '@arco-design/web-vue/es/icon'
import { budgetApiService } from '@/api/budget'
import dayjs from 'dayjs'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const tableLoading = ref(false)

// 核销统计
const pendingVerificationStats = reactive({
  totalBudget: 0,
  totalProjects: 0
})

const verificationStats = reactive({
  monthlyVerified: 0,
  successRate: 0
})

// 核销表单
const verificationForm = reactive({
  budgetId: undefined,
  projectId: undefined,
  verificationAmount: 0,
  verificationDate: dayjs().format('YYYY-MM-DD'),
  remark: ''
})

// 可用预算和项目
const availableBudgets = ref<Array<any>>([])
const availableProjects = ref<Array<any>>([])
const maxVerificationAmount = ref(0)

// 核销记录
const verificationRecords = ref<Array<any>>([])
const dateRange = ref<Array<string>>([])
const statusFilter = ref<string>('')

// 分页配置
const paginationConfig = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 生命周期
onMounted(async () => {
  await loadAvailableBudgets()
  await loadVerificationStats()
  await loadVerificationRecords()
})

// 方法
const loadVerificationStats = async () => {
  try {
    loading.value = true
    // 计算待核销预算总额（剩余金额累计）
    const budgetsResp = await budgetApiService.getBudgets({ page: 1, pageSize: 100 })
    const budgets = budgetsResp.list || []
    const remainingSum = budgets.reduce((sum: number, b: any) => sum + Number(b?.remainingAmount || 0), 0)
    pendingVerificationStats.totalBudget = Number(remainingSum.toFixed(2))
    
    // 统计项目总数（近似，使用项目列表总条数）
    const projectsResp = await budgetApiService.getProjects({ page: 1, pageSize: 1 })
    pendingVerificationStats.totalProjects = Number(projectsResp?.total || 0)

    // 计算本月已核销与成功率（基于核销记录）
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD')
    const approvedResp = await budgetApiService.getVerificationRecords({
      startDate: startOfMonth,
      endDate: endOfMonth,
      status: 'approved',
      page: 1,
      pageSize: 200
    })
    const allResp = await budgetApiService.getVerificationRecords({
      startDate: startOfMonth,
      endDate: endOfMonth,
      page: 1,
      pageSize: 200
    })
    const approvedList = approvedResp?.list || []
    const allList = allResp?.list || []
    const monthlyVerifiedSum = approvedList.reduce((sum: number, r: any) => sum + Number(r?.verificationAmount || 0), 0)
    verificationStats.monthlyVerified = Number(monthlyVerifiedSum.toFixed(2))
    const approvedCount = approvedList.length
    const rejectedCount = allList.filter((r: any) => r?.status === 'rejected').length
    const totalChecked = approvedCount + rejectedCount
    verificationStats.successRate = totalChecked > 0 ? Math.round((approvedCount / totalChecked) * 100) : 0
  } catch (error) {
    Message.error('加载核销统计失败')
    console.error('加载核销统计失败:', error)
  } finally {
    loading.value = false
  }
}

const loadAvailableBudgets = async () => {
  try {
    const resp = await budgetApiService.getBudgets({ page: 1, pageSize: 100 })
    const list = resp?.list || []
    availableBudgets.value = list.filter((b: any) => Number(b?.remainingAmount || 0) > 0)
  } catch (error) {
    Message.error('加载可用预算失败')
    console.error('加载可用预算失败:', error)
  }
}

const loadAvailableProjects = async () => {
  try {
    if (!verificationForm.budgetId) {
      availableProjects.value = []
      return
    }
    
    const projects = await budgetApiService.getRelatedProjects(String(verificationForm.budgetId))
    availableProjects.value = Array.isArray(projects) ? projects : []
  } catch (error) {
    Message.error('加载可用项目失败')
    console.error('加载可用项目失败:', error)
  }
}

const loadVerificationRecords = async () => {
  try {
    tableLoading.value = true
    
    const params = {
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      status: statusFilter.value
    }
    
    const result = await budgetApiService.getVerificationRecords(params)
    verificationRecords.value = result.list || []
    paginationConfig.total = result.total || 0
  } catch (error) {
    Message.error('加载核销记录失败')
    console.error('加载核销记录失败:', error)
  } finally {
    tableLoading.value = false
  }
}

const handleBudgetChange = async (budgetId: string) => {
  verificationForm.projectId = undefined
  verificationForm.verificationAmount = 0
  maxVerificationAmount.value = 0
  
  if (budgetId) {
    await loadAvailableProjects()
    const budget = availableBudgets.value.find((b: any) => b.id === budgetId)
    if (budget) {
      maxVerificationAmount.value = budget.remainingAmount
    }
  } else {
    availableProjects.value = []
  }
}

const handleProjectChange = (projectId: string) => {
  verificationForm.verificationAmount = 0
  
  if (projectId && verificationForm.budgetId) {
    const project = availableProjects.value.find((p: any) => p.id === projectId)
    if (project) {
      maxVerificationAmount.value = Math.min(
        maxVerificationAmount.value,
        Number(project?.remainingAmount ?? project?.totalAmount ?? project?.amount ?? 0)
      )
    }
  }
}

const handleSubmit = async () => {
  if (!verificationForm.budgetId || !verificationForm.projectId || !verificationForm.verificationAmount) {
    Message.warning('请填写完整的核销信息')
    return
  }
  
  try {
    submitLoading.value = true
    
    await budgetApiService.createVerification({
      ...verificationForm,
      verificationDate: dayjs(verificationForm.verificationDate).format('YYYY-MM-DD')
    })
    
    Message.success('核销申请提交成功')
    handleReset()
    await loadVerificationRecords()
    await loadVerificationStats()
  } catch (error) {
    Message.error('核销申请提交失败')
    console.error('核销申请提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleReset = () => {
  verificationForm.budgetId = undefined
  verificationForm.projectId = undefined
  verificationForm.verificationAmount = 0
  verificationForm.verificationDate = dayjs().format('YYYY-MM-DD')
  verificationForm.remark = ''
  maxVerificationAmount.value = 0
  availableProjects.value = []
}

const handleBatchVerification = () => {
  Message.info('批量核销功能开发中')
}

const handleRefresh = async () => {
  await loadVerificationStats()
  await loadVerificationRecords()
  Message.success('数据已刷新')
}

const handleDateRangeChange = async () => {
  paginationConfig.current = 1
  await loadVerificationRecords()
}

const handleStatusFilterChange = async () => {
  paginationConfig.current = 1
  await loadVerificationRecords()
}

const handlePageChange = async (page: number) => {
  paginationConfig.current = page
  await loadVerificationRecords()
}

const handleViewDetail = (record: any) => {
  Message.info(`查看核销详情: ${record.verificationNo}`)
}

const handleApprove = async (record: any) => {
  try {
    await budgetApiService.approveVerification(record.id)
    Message.success('核销审核通过')
    await loadVerificationRecords()
    await loadVerificationStats()
  } catch (error) {
    Message.error('核销审核失败')
    console.error('核销审核失败:', error)
  }
}

const handleRevoke = async (record: any) => {
  try {
    await budgetApiService.revokeVerification(record.id)
    Message.success('核销申请已撤销')
    await loadVerificationRecords()
    await loadVerificationStats()
  } catch (error) {
    Message.error('撤销核销申请失败')
    console.error('撤销核销申请失败:', error)
  }
}

// 工具函数
const formatAmount = (amount: number | null | undefined): string => {
  const n = Number(amount ?? 0)
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString('zh-CN')
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}
</script>

<style scoped lang="less">
.budget-verification-panel {
  margin-bottom: 24px;
  
  .verification-stats {
    margin-bottom: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }
  
  .verification-form-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #fff;
    border: 1px solid #e0e6ed;
    border-radius: 8px;
  }
  
  .verification-history {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .amount-text {
      font-weight: 500;
      color: #165dff;
    }
  }
}
</style>