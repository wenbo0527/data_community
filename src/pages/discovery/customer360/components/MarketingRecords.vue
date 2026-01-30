<template>
  <div class="marketing-records">
    <div class="records-header">
      <h4>营销记录</h4>
      <div class="header-actions">

        <a-button size="small" @click="refreshData">
          <template #icon><IconRefresh /></template>
          刷新
        </a-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <a-spin size="large" />
      <p>加载营销记录数据...</p>
    </div>
    
    <div v-else-if="!marketingRecords.length" class="empty-state">
      <a-empty description="暂无营销记录" />
    </div>
    
    <div v-else class="records-content">

      
      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <a-input-search 
          v-model="searchText"
          placeholder="搜索营销活动..."
          style="width: 200px;"
          @search="handleSearch"
        />
        
        <a-select 
          v-model="statusFilter"
          placeholder="筛选状态"
          style="width: 120px;"
          allow-clear
          @change="handleStatusFilter"
        >
          <a-option value="成功">成功</a-option>
          <a-option value="失败">失败</a-option>
          <a-option value="进行中">进行中</a-option>
        </a-select>
        
        <a-select 
          v-model="channelFilter"
          placeholder="筛选渠道"
          style="width: 120px;"
          allow-clear
          @change="handleChannelFilter"
        >
          <a-option value="短信">短信</a-option>
          <a-option value="邮件">邮件</a-option>
          <a-option value="电话">电话</a-option>
          <a-option value="APP推送">APP推送</a-option>
        </a-select>
        
        <a-range-picker 
          v-model="dateRange"
          style="width: 240px;"
          @change="handleDateFilter"
        />
      </div>
      
      <!-- 营销记录表格 -->
      <div class="table-container">
        <a-table 
          :columns="columns"
          :data="filteredRecords"
          :pagination="pagination"
          :loading="loading"
          size="small"
          @page-change="handlePageChange"
        >
          <template #campaignType="{ record }">
            <a-tag :color="getCampaignTypeColor(record.campaignType)">
              {{ record.campaignType }}
            </a-tag>
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
          
          <template #channel="{ record }">
            <div class="channel-cell">
              <IconMessage v-if="record.channel === '短信'" class="channel-icon" />
              <IconEmail v-else-if="record.channel === '邮件'" class="channel-icon" />
              <IconPhone v-else-if="record.channel === '电话'" class="channel-icon" />
              <IconNotification v-else class="channel-icon" />
              <span>{{ record.channel }}</span>
            </div>
          </template>
          
          <template #responseRate="{ record }">
            <div class="response-rate">
              <a-progress 
                :percent="record.responseRate"
                :color="getResponseRateColor(record.responseRate)"
                size="small"
                :show-text="false"
              />
              <span class="rate-text">{{ record.responseRate }}%</span>
            </div>
          </template>
          
          <template #actions="{ record }">
            <a-button size="mini" type="text" @click="viewDetail(record)">
              查看详情
            </a-button>
            <a-button size="mini" type="text" @click="viewAnalysis(record)">
              效果分析
            </a-button>
          </template>
        </a-table>
      </div>
      

    </div>
    
    <!-- 详情抽屉 -->
    <a-drawer
      v-model:visible="detailDrawerVisible"
      title="营销活动详情"
      width="600px"
      placement="right"
    >
      <div v-if="selectedRecord" class="detail-content">
        <div class="detail-section">
          <h4>基本信息</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="活动名称">{{ selectedRecord.campaignName }}</a-descriptions-item>
            <a-descriptions-item label="活动类型">
              <a-tag :color="getCampaignTypeColor(selectedRecord.campaignType)">
                {{ selectedRecord.campaignType }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(selectedRecord.status)">
                {{ selectedRecord.status }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="渠道">{{ selectedRecord.channel }}</a-descriptions-item>
            <a-descriptions-item label="开始时间">{{ selectedRecord.startTime }}</a-descriptions-item>
            <a-descriptions-item label="结束时间">{{ selectedRecord.endTime }}</a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div class="detail-section">
          <h4>效果数据</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="响应率">{{ selectedRecord.responseRate }}%</a-descriptions-item>
            <a-descriptions-item label="目标金额">{{ formatAmount(selectedRecord.targetAmount) }}</a-descriptions-item>
            <a-descriptions-item label="实际金额">{{ formatAmount(selectedRecord.actualAmount) }}</a-descriptions-item>
            <a-descriptions-item label="完成率">{{ calculateCompletionRate(selectedRecord) }}%</a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div class="detail-section">
          <h4>活动描述</h4>
          <p>{{ selectedRecord.description || '暂无描述' }}</p>
        </div>
      </div>
    </a-drawer>
    
    <!-- 效果分析抽屉 -->
    <a-drawer
      v-model:visible="analysisDrawerVisible"
      title="效果分析"
      width="800px"
      placement="right"
    >
      <div v-if="selectedRecord" class="analysis-content">
        <div class="analysis-section">
          <h4>核心指标</h4>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">{{ selectedRecord.responseRate }}%</div>
              <div class="metric-label">响应率</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ calculateCompletionRate(selectedRecord) }}%</div>
              <div class="metric-label">完成率</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ calculateROI(selectedRecord) }}%</div>
              <div class="metric-label">投资回报率</div>
            </div>
          </div>
        </div>
        

      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { 
  IconRefresh,
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle,
  IconMessage,
  IconEmail,
  IconPhone,
  IconNotification,
  IconSearch,
  IconEye
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

interface Props {
  productKey: string
  productData?: any
  userInfo?: any
  loading?: boolean
  marketingData?: any
}

interface Emits {
  (e: 'debug-info', info: any): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 筛选状态
const searchText = ref('')
const statusFilter = ref('')
const channelFilter = ref('')
const dateRange = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 抽屉状态
const detailDrawerVisible = ref(false)
const analysisDrawerVisible = ref(false)
const selectedRecord = ref(null)

// 表格列定义
const columns = [
  { title: '活动名称', dataIndex: 'campaignName', width: 150 },
  { title: '活动类型', dataIndex: 'campaignType', slotName: 'campaignType', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '渠道', dataIndex: 'channel', slotName: 'channel', width: 100 },
  { title: '开始时间', dataIndex: 'startTime', width: 120 },
  { title: '结束时间', dataIndex: 'endTime', width: 120 },
  { title: '响应率', dataIndex: 'responseRate', slotName: 'responseRate', width: 120 },
  { title: '操作', slotName: 'actions', width: 140 }
]

// 营销记录数据
const marketingRecords = computed(() => {
  console.log('🔍 [MarketingRecords] 计算营销记录数据:', {
    hasMarketingData: !!props.marketingData,
    hasUserInfo: !!props.userInfo,
    productKey: props.productKey,
    userInfoMarketingRecords: props.userInfo?.marketingRecords
  })
  
  // 优先使用传入的marketingData
  if (props.marketingData) {
    const touchRecords = props.marketingData.touchRecords || []
    const benefitRecords = props.marketingData.benefitRecords || []
    
    console.log('📊 [MarketingRecords] 使用传入的marketingData:', {
      touchRecordsCount: touchRecords.length,
      benefitRecordsCount: benefitRecords.length
    })
    
    // 合并触达记录和权益记录
    return [...touchRecords, ...benefitRecords]
  }
  
  // 如果没有传入数据，从userInfo中获取并过滤
  if (props.userInfo?.marketingRecords) {
    const allTouchRecords = props.userInfo.marketingRecords.touchRecords || []
    const allBenefitRecords = props.userInfo.marketingRecords.benefitRecords || []
    
    console.log('📊 [MarketingRecords] 从userInfo获取数据:', {
      allTouchRecordsCount: allTouchRecords.length,
      allBenefitRecordsCount: allBenefitRecords.length,
      productKey: props.productKey
    })
    
    // 根据productKey过滤
    const filteredTouch = props.productKey 
      ? (allTouchRecords || []).filter((item: any) => item.productKey === props.productKey)
      : (allTouchRecords || [])
    
    const filteredBenefit = props.productKey
      ? (allBenefitRecords || []).filter((item: any) => item.productKey === props.productKey) 
      : (allBenefitRecords || [])
    
    console.log('📊 [MarketingRecords] 过滤后的数据:', {
      filteredTouchCount: filteredTouch.length,
      filteredBenefitCount: filteredBenefit.length,
      totalCount: filteredTouch.length + filteredBenefit.length
    })
    
    return [...filteredTouch, ...filteredBenefit]
  }
  
  // 最后使用默认的模拟数据
  return [
    {
      id: 1,
      campaignName: '新年贷款优惠活动',
      campaignType: '产品推广',
      status: '成功',
      channel: '短信',
      startTime: '2024-01-01 10:00:00',
      endTime: '2024-01-31 23:59:59',
      responseRate: 85,
      targetAmount: 50000,
      actualAmount: 42500
    },
    {
      id: 2,
      campaignName: '信用卡分期推荐',
      campaignType: '交叉销售',
      status: '进行中',
      channel: 'APP推送',
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-02-15 23:59:59',
      responseRate: 62,
      targetAmount: 30000,
      actualAmount: 18600
    },
    {
      id: 3,
      campaignName: '理财产品介绍',
      campaignType: '新产品',
      status: '失败',
      channel: '邮件',
      startTime: '2023-12-01 08:00:00',
      endTime: '2023-12-31 23:59:59',
      responseRate: 23,
      targetAmount: 100000,
      actualAmount: 23000
    },
    {
      id: 4,
      campaignName: '客户满意度调研',
      campaignType: '客户关怀',
      status: '成功',
      channel: '电话',
      startTime: '2024-01-10 14:00:00',
      endTime: '2024-01-20 18:00:00',
      responseRate: 78,
      targetAmount: 0,
      actualAmount: 0
    }
  ]
})



// 筛选后的记录
const filteredRecords = computed(() => {
  let filtered = marketingRecords.value || []
  
  if (searchText.value) {
    filtered = (filtered || []).filter(record => 
      record.campaignName.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  if (statusFilter.value) {
    filtered = (filtered || []).filter(record => record.status === statusFilter.value)
  }
  
  if (channelFilter.value) {
    filtered = (filtered || []).filter(record => record.channel === channelFilter.value)
  }
  
  pagination.total = filtered.length
  return filtered
})

// 方法
const refreshData = () => {
  emit('refresh')
  emit('debug-info', {
    action: 'refresh',
    component: 'MarketingRecords',
    productKey: props.productKey
  })
}



const handleSearch = () => {
  pagination.current = 1
}

const handleStatusFilter = () => {
  pagination.current = 1
}

const handleChannelFilter = () => {
  pagination.current = 1
}

const handleDateFilter = () => {
  pagination.current = 1
}

const handlePageChange = (page: number) => {
  pagination.current = page
}



const viewDetail = (record: any) => {
  selectedRecord.value = record
  detailDrawerVisible.value = true
  emit('debug-info', {
    action: 'view-detail',
    component: 'MarketingRecords',
    record: record
  })
}

const viewAnalysis = (record: any) => {
  selectedRecord.value = record
  analysisDrawerVisible.value = true
  emit('debug-info', {
    action: 'view-analysis',
    component: 'MarketingRecords',
    record: record
  })
}

// 格式化和计算辅助方法
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

const calculateCompletionRate = (record: any) => {
  if (!record.targetAmount || record.targetAmount === 0) return 100
  return Math.round((record.actualAmount / record.targetAmount) * 100)
}

const calculateROI = (record: any) => {
  if (!record.targetAmount || record.targetAmount === 0) return 0
  const investment = record.targetAmount * 0.1 // 假设投入成本为目标金额的10%
  const profit = record.actualAmount - investment
  return Math.round((profit / investment) * 100)
}

// 颜色辅助方法
const getCampaignTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '产品推广': 'blue',
    '交叉销售': 'green',
    '新产品': 'orange',
    '客户关怀': 'purple'
  }
  return colorMap[type] || 'default'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '成功': 'green',
    '失败': 'red',
    '进行中': 'orange'
  }
  return colorMap[status] || 'default'
}

const getResponseRateColor = (rate: number) => {
  if (rate >= 70) return '#00b42a'
  if (rate >= 40) return '#ff7d00'
  return '#f53f3f'
}


</script>

<style scoped lang="scss">
.marketing-records {
  padding: 16px;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.records-header h4 {
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #86909c;
}

.records-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}



.filter-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.table-container {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
}

.channel-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.channel-icon {
  font-size: 14px;
  color: #165dff;
}

.response-rate {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-text {
  font-size: 12px;
  color: #1d2129;
  font-weight: 500;
  min-width: 35px;
}



/* 抽屉样式 */
.detail-content, .analysis-content {
  .detail-section, .analysis-section {
    margin-bottom: 24px;
    
    h4 {
      margin-bottom: 16px;
      color: #1d2129;
      font-weight: 600;
    }
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  text-align: center;
  padding: 20px;
  background: #f7f8fa;
  border-radius: 8px;
  
  .metric-value {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 8px;
  }
  
  .metric-label {
    font-size: 14px;
    color: #86909c;
  }
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 500;
}

:deep(.arco-table-td) {
  padding: 8px 12px;
}

:deep(.arco-table-size-small .arco-table-td) {
  padding: 6px 8px;
}

:deep(.arco-progress-line-inner) {
  height: 4px;
}
</style>