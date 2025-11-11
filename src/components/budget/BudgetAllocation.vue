<template>
  <div class="budget-allocation">
    <div class="allocation-header">
      <h3 class="allocation-title">预算分配与监控</h3>
      <div class="allocation-controls">
        <a-space>
          <a-button type="primary" size="small" @click="handleAddAllocation">
            <template #icon>
              <icon-plus />
            </template>
            新增分配
          </a-button>
          <a-button size="small" @click="handleRefresh">
            <template #icon>
              <icon-refresh />
            </template>
          </a-button>
        </a-space>
      </div>
    </div>

    <div class="allocation-content">
      <!-- 预算概览 -->
      <div class="budget-overview">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="overview-card">
              <div class="overview-label">总预算</div>
              <div class="overview-value">¥{{ formatAmount(totalBudget) }}</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="overview-card">
              <div class="overview-label">已分配</div>
              <div class="overview-value">¥{{ formatAmount(allocatedAmount) }}</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="overview-card">
              <div class="overview-label">剩余可分配</div>
              <div class="overview-value" :class="{ warning: remainingAmount < totalBudget * 0.1 }">
                ¥{{ formatAmount(remainingAmount) }}
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 分配进度条 -->
      <div class="allocation-progress">
        <div class="progress-header">
          <span>分配进度</span>
          <span>{{ allocationProgress }}%</span>
        </div>
        <a-progress 
          :percent="allocationProgress" 
          :status="getProgressStatus(allocationProgress)"
          :show-text="false"
        />
      </div>

      <!-- 分配列表 -->
      <div class="allocation-list">
        <a-table
          :data="allocationList"
          :columns="columns"
          :loading="loading"
          :pagination="false"
          size="small"
        >
          <template #name="{ record }">
            <div class="department-info">
              <div class="department-name">{{ record.name }}</div>
            </div>
          </template>

          <template #allocatedAmount="{ record }">
            <div class="amount-info">
              <div class="allocated">¥{{ formatAmount(record.allocatedAmount) }}</div>
              <div class="percentage">{{ record.allocationPercentage }}%</div>
            </div>
          </template>

          <template #usedAmount="{ record }">
            <div class="usage-info">
              <div class="used">¥{{ formatAmount(record.usedAmount) }}</div>
              <div class="usage-rate" :class="getUsageRateClass(record.usageRate)">
                {{ record.usageRate }}%
              </div>
            </div>
          </template>

          <template #remainingAmount="{ record }">
            <div class="remaining-info">
              <div class="remaining">¥{{ formatAmount(record.remainingAmount) }}</div>
              <div class="remaining-rate" :class="getRemainingRateClass(record.remainingRate)">
                {{ record.remainingRate }}%
              </div>
            </div>
          </template>

          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleEditAllocation(record)">
                调整
              </a-button>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                详情
              </a-button>
              <a-popconfirm 
                content="确定要撤销这个分配吗？" 
                @ok="handleRevokeAllocation(record.id)"
              >
                <a-button type="text" size="small" status="danger">
                  撤销
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </div>

      <!-- 分配趋势图 -->
      <div class="allocation-trend" v-if="showTrend">
        <h4 class="trend-title">分配趋势</h4>
        <div ref="trendChartRef" class="trend-chart"></div>
      </div>
    </div>

    <!-- 新增分配对话框 -->
    <a-modal
      v-model:visible="allocationModalVisible"
      title="新增预算分配"
      @ok="handleAllocationSubmit"
      @cancel="handleAllocationCancel"
    >
      <a-form :model="allocationForm" :rules="allocationRules" ref="allocationFormRef">
        <a-form-item label="分配金额" field="allocatedAmount">
          <a-input-number
            v-model="allocationForm.allocatedAmount"
            :min="0"
            :max="remainingAmount"
            :precision="2"
            placeholder="请输入分配金额"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="分配说明" field="description">
          <a-textarea
            v-model="allocationForm.description"
            placeholder="请输入分配说明"
            :max-length="200"
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import * as echarts from 'echarts'
import { budgetApiService } from '@/api/budget'
import type { Budget } from '@/types/budget'

// Props
const props = defineProps({
  budgetId: {
    type: String,
    required: true
  },
  showTrend: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits<{
  allocationAdded: [allocation: any]
  allocationUpdated: [allocation: any]
  allocationRevoked: [allocationId: string]
}>()

// 响应式数据
const loading = ref(false)
const budget = ref<Budget | null>(null)
const allocationList = ref<BudgetAllocation[]>([])
const allocationModalVisible = ref(false)
const allocationFormRef = ref()

// 图表实例
let trendChart: echarts.ECharts | null = null
const trendChartRef = ref<HTMLElement>()

// 分配表单
const allocationForm = reactive({
  allocatedAmount: 0,
  description: ''
})

// 表单验证规则
const allocationRules = {
  allocatedAmount: [
    { required: true, message: '请输入分配金额' },
    { 
      validator: (value: number, callback: Function) => {
        if (value <= 0) {
          callback('分配金额必须大于0')
        } else if (value > remainingAmount.value) {
          callback('分配金额不能超过剩余可分配金额')
        } else {
          callback()
        }
      }
    }
  ]
}

// 计算属性
const totalBudget = computed(() => budget.value?.totalAmount || 0)
const allocatedAmount = computed(() => 
  allocationList.value.reduce((sum, item) => sum + item.allocatedAmount, 0)
)
const remainingAmount = computed(() => totalBudget.value - allocatedAmount.value)
const allocationProgress = computed(() => 
  totalBudget.value > 0 ? Math.round((allocatedAmount.value / totalBudget.value) * 100) : 0
)

// 表格列配置
const columns = [
  {
    title: '分配项',
    dataIndex: 'name',
    slotName: 'name',
    width: 180
  },
  {
    title: '分配金额',
    dataIndex: 'allocatedAmount',
    slotName: 'allocatedAmount',
    width: 120
  },
  {
    title: '已使用',
    dataIndex: 'usedAmount',
    slotName: 'usedAmount',
    width: 120
  },
  {
    title: '剩余',
    dataIndex: 'remainingAmount',
    slotName: 'remainingAmount',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '分配时间',
    dataIndex: 'createdAt',
    width: 160,
    render: ({ record }: any) => formatDate(record.createdAt)
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 180,
    fixed: 'right'
  }
]

// 生命周期
onMounted(async () => {
  await loadData()
  if (props.showTrend) {
    nextTick(() => {
      initTrendChart()
    })
  }
})

// 方法
const loadData = async () => {
  try {
    loading.value = true
    
    // 加载预算详情
    const budgetData = await budgetApiService.getBudgetById(props.budgetId)
    if (budgetData) {
      budget.value = budgetData
    }
    
    // 加载分配数据（这里使用模拟数据）
    allocationList.value = generateMockAllocationData()
    
  } catch (error) {
    Message.error('加载数据失败')
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const generateMockAllocationData = (): any[] => {
  const items = Array.from({ length: 4 }).map((_, i) => `分配项${i + 1}`)
  
  return items.map((name, index) => {
    const allocatedAmount = Math.floor((totalBudget.value / items.length) * (0.8 + Math.random() * 0.4))
    const usedAmount = Math.floor(allocatedAmount * (0.3 + Math.random() * 0.6))
    const remainingAmount = allocatedAmount - usedAmount
    const usageRate = Math.round((usedAmount / allocatedAmount) * 100)
    const remainingRate = Math.round((remainingAmount / allocatedAmount) * 100)
    
    return {
      id: `allocation-${index + 1}`,
      budgetId: props.budgetId,
      name,
      allocatedAmount,
      usedAmount,
      remainingAmount,
      allocationPercentage: Math.round((allocatedAmount / totalBudget.value) * 100),
      usageRate,
      remainingRate,
      status: usageRate > 80 ? 'warning' : 'normal',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  })
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

const updateTrendChart = () => {
  if (!trendChart) return
  const trendData = generateTrendData()
  const months = trendData.map(d => d.month)
  const allocated = trendData.filter(d => d.type === '分配').map(d => d.amount)
  const used = trendData.filter(d => d.type === '使用').map(d => d.amount)
  const remaining = trendData.filter(d => d.type === '剩余').map(d => d.amount)
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['分配', '使用', '剩余'] },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [
      { name: '分配', type: 'line', smooth: true, data: allocated },
      { name: '使用', type: 'line', smooth: true, data: used },
      { name: '剩余', type: 'line', smooth: true, data: remaining }
    ]
  }
  trendChart.setOption(option)
}

const generateTrendData = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const data = []
  
  months.forEach(month => {
    data.push(
      { month, type: '分配', amount: Math.floor(Math.random() * 100000) + 50000 },
      { month, type: '使用', amount: Math.floor(Math.random() * 80000) + 30000 },
      { month, type: '剩余', amount: Math.floor(Math.random() * 70000) + 20000 }
    )
  })
  
  return data
}

const handleAddAllocation = () => {
  allocationForm.allocatedAmount = 0
  allocationForm.description = ''
  allocationModalVisible.value = true
}

const handleEditAllocation = (allocation: any) => {
  allocationForm.allocatedAmount = allocation.allocatedAmount
  allocationForm.description = ''
  allocationModalVisible.value = true
}

const handleViewDetail = (allocation: BudgetAllocation) => {
  Message.info('查看详情功能开发中')
}

const handleRevokeAllocation = async (allocationId: string) => {
  try {
    // 模拟撤销操作
    const index = allocationList.value.findIndex(item => item.id === allocationId)
    if (index !== -1) {
      allocationList.value.splice(index, 1)
      Message.success('撤销分配成功')
      emit('allocationRevoked', allocationId)
    }
  } catch (error) {
    Message.error('撤销分配失败')
    console.error('撤销分配失败:', error)
  }
}

const handleAllocationSubmit = async () => {
  try {
    // 表单验证
    const valid = await allocationFormRef.value.validate()
    if (!valid) return
    
    // 创建新的分配记录
    const index = allocationList.value.length + 1
    const newAllocation: any = {
      id: `allocation-${Date.now()}`,
      budgetId: props.budgetId,
      name: `分配项${index}`,
      allocatedAmount: allocationForm.allocatedAmount,
      usedAmount: 0,
      remainingAmount: allocationForm.allocatedAmount,
      allocationPercentage: Math.round((allocationForm.allocatedAmount / totalBudget.value) * 100),
      usageRate: 0,
      remainingRate: 100,
      status: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 添加到列表
    allocationList.value.push(newAllocation)
    
    // 关闭对话框
    allocationModalVisible.value = false
    
    Message.success('分配成功')
    emit('allocationAdded', newAllocation)
    
  } catch (error) {
    Message.error('分配失败')
    console.error('分配失败:', error)
  }
}

const handleAllocationCancel = () => {
  allocationModalVisible.value = false
}

const handleRefresh = async () => {
  await loadData()
  if (props.showTrend && trendChart) {
    updateTrendChart()
  }
  Message.success('数据已刷新')
}

// 工具函数
const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN')
}

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getProgressStatus = (progress: number): 'success' | 'warning' | 'danger' => {
  if (progress >= 90) return 'danger'
  if (progress >= 80) return 'warning'
  return 'success'
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    normal: 'green',
    warning: 'orange',
    danger: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    normal: '正常',
    warning: '预警',
    danger: '危险'
  }
  return textMap[status] || status
}

const getUsageRateClass = (rate: number): string => {
  if (rate >= 90) return 'danger'
  if (rate >= 80) return 'warning'
  return 'success'
}

const getRemainingRateClass = (rate: number): string => {
  if (rate <= 10) return 'danger'
  if (rate <= 20) return 'warning'
  return 'success'
}

// 暴露方法
defineExpose({
  refresh: loadData
})
</script>

<style scoped lang="less">
.budget-allocation {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  
  .allocation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .allocation-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
    }
  }
  
  .allocation-content {
    .budget-overview {
      margin-bottom: 24px;
      
      .overview-card {
        text-align: center;
        padding: 16px;
        background: #f7f8fa;
        border-radius: 6px;
        
        .overview-label {
          font-size: 14px;
          color: #86909c;
          margin-bottom: 8px;
        }
        
        .overview-value {
          font-size: 20px;
          font-weight: 600;
          color: #1d2129;
          
          &.warning {
            color: #ff7d00;
          }
        }
      }
    }
    
    .allocation-progress {
      margin-bottom: 24px;
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;
        color: #4e5969;
      }
    }
    
    .allocation-list {
      margin-bottom: 24px;
      
      .department-info {
        .department-name {
          font-weight: 500;
          color: #1d2129;
        }
        
        .department-manager {
          font-size: 12px;
          color: #86909c;
        }
      }
      
      .amount-info {
        .allocated {
          font-weight: 500;
          color: #1d2129;
        }
        
        .percentage {
          font-size: 12px;
          color: #86909c;
        }
      }
      
      .usage-info {
        .used {
          font-weight: 500;
          color: #1d2129;
        }
        
        .usage-rate {
          font-size: 12px;
          font-weight: 500;
          
          &.success { color: #00b42a; }
          &.warning { color: #ff7d00; }
          &.danger { color: #f53f3f; }
        }
      }
      
      .remaining-info {
        .remaining {
          font-weight: 500;
          color: #1d2129;
        }
        
        .remaining-rate {
          font-size: 12px;
          font-weight: 500;
          
          &.success { color: #00b42a; }
          &.warning { color: #ff7d00; }
          &.danger { color: #f53f3f; }
        }
      }
    }
    
    .allocation-trend {
      .trend-title {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
      }
      
      .trend-chart {
        height: 250px;
      }
    }
  }
}
</style>