<template>
  <div class="credit-info-card">
    <div class="card-header">
      <h3 class="card-title">
        <CreditCard class="title-icon" />
        授信信息
      </h3>
      <div class="card-actions">
        <a-button type="text" size="small" @click="refreshData">
          <RefreshCw class="action-icon" />
          刷新
        </a-button>
        <a-button type="text" size="small" @click="exportData">
          <Download class="action-icon" />
          导出
        </a-button>
      </div>
    </div>

    <div class="card-content">
      <a-spin :loading="loading" class="loading-wrapper">
        <div v-if="creditInfo" class="credit-details">
          <!-- 基本信息行 -->
          <div class="info-row">
            <div class="info-item">
              <span class="label">授信单号：</span>
              <span class="value">{{ creditInfo.creditNo }}</span>
              <a-button type="text" size="mini" @click="copyCreditData(creditInfo.creditNo)">
                <Copy class="copy-icon" />
              </a-button>
            </div>
            <div class="info-item">
              <span class="label">授信日期：</span>
              <span class="value">{{ formatDate(creditInfo.creditDate) }}</span>
            </div>
            <div class="info-item">
              <span class="label">渠道：</span>
              <span class="value">{{ creditInfo.channel }}</span>
            </div>
          </div>

          <!-- 授信结果行 -->
          <div class="info-row">
            <div class="info-item">
              <span class="label">授信结果：</span>
              <a-tag :color="getCreditStatusColor(creditInfo.result)" class="status-tag">
                {{ creditInfo.result }}
              </a-tag>
            </div>
            <div class="info-item" v-if="creditInfo.rejectReason && creditInfo.rejectReason !== '-'">
              <span class="label">拒绝原因：</span>
              <span class="value reject-reason">{{ creditInfo.rejectReason }}</span>
            </div>
            <div class="info-item">
              <span class="label">风险等级：</span>
              <a-tag :color="getRiskLevelColor(creditInfo.riskLevel)" class="risk-tag">
                {{ creditInfo.riskLevel }}
              </a-tag>
            </div>
          </div>

          <!-- 额度信息行 -->
          <div class="info-row amount-row">
            <div class="amount-item">
              <div class="amount-label">总授信额度</div>
              <div class="amount-value primary">{{ formatAmount(creditInfo.initialAmount) }}</div>
            </div>
            <div class="amount-item">
              <div class="amount-label">当前额度</div>
              <div class="amount-value">{{ formatAmount(creditInfo.currentAmount) }}</div>
            </div>
            <div class="amount-item">
              <div class="amount-label">已用额度</div>
              <div class="amount-value used">{{ formatAmount(creditInfo.usedAmount) }}</div>
            </div>
            <div class="amount-item">
              <div class="amount-label">可用额度</div>
              <div class="amount-value available">{{ formatAmount(creditInfo.currentAmount - creditInfo.usedAmount) }}</div>
            </div>
          </div>

          <!-- 额度使用率进度条 -->
          <div class="usage-progress">
            <div class="progress-header">
              <span class="progress-label">额度使用率</span>
              <span class="progress-value">{{ usagePercentage }}%</span>
            </div>
            <a-progress 
              :percent="usagePercentage" 
              :color="getUsageColor(usagePercentage)"
              :show-text="false"
              size="small"
            />
          </div>

          <!-- 定价和期限信息 -->
          <div class="info-row">
            <div class="info-item">
              <span class="label">授信定价：</span>
              <span class="value rate">{{ creditInfo.rate }}%</span>
            </div>
            <div class="info-item">
              <span class="label">授信期限：</span>
              <span class="value">{{ creditInfo.period }}个月</span>
            </div>
            <div class="info-item">
              <span class="label">到期日期：</span>
              <span class="value">{{ formatDate(creditInfo.expiryDate) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <FileX class="empty-icon" />
          <p class="empty-text">暂无授信信息</p>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CreditCard, RefreshCw, Download, Copy, FileX } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

interface CreditInfo {
  creditNo: string
  productKey: string
  creditDate: string
  channel: string
  productName: string
  result: string
  rejectReason: string
  initialAmount: number
  currentAmount: number
  usedAmount: number
  riskLevel: string
  rate: number
  period: number
  expiryDate: string
}

interface Props {
  userInfo?: any
  productKey?: string
  loading?: boolean
}

interface Emits {
  refresh: []
  export: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 计算属性
const creditInfo = computed(() => {
  const credits = props.userInfo?.creditsList
  if (!Array.isArray(credits) || credits.length === 0) {
    return null
  }
  
  // 如果有productKey，过滤对应产品的授信记录
  if (props.productKey) {
    const filteredCredits = credits.filter((item: any) => item.productKey === props.productKey)
    return filteredCredits.length > 0 ? filteredCredits[0] : null
  }
  
  // 返回第一个授信记录
  return credits[0]
})

// 计算额度使用率
const usagePercentage = computed(() => {
  if (!props.creditInfo || props.creditInfo.currentAmount === 0) return 0
  return Math.round((props.creditInfo.usedAmount / props.creditInfo.currentAmount) * 100)
})

// 格式化金额
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount)
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取授信状态颜色
const getCreditStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '通过': 'green',
    '拒绝': 'red',
    '待审核': 'orange',
    '审核中': 'blue'
  }
  return colorMap[status] || 'gray'
}

// 获取风险等级颜色
const getRiskLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '关注': 'orange',
    '次级': 'red',
    '可疑': 'red',
    '损失': 'red'
  }
  return colorMap[level] || 'gray'
}

// 获取使用率颜色
const getUsageColor = (percentage: number): string => {
  if (percentage >= 90) return '#f53f3f'
  if (percentage >= 70) return '#ff7d00'
  if (percentage >= 50) return '#ffb400'
  return '#00b42a'
}

// 刷新数据
const refreshData = () => {
  emit('refresh')
}

// 导出数据
const exportData = () => {
  emit('export')
}

// 复制数据
const copyCreditData = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
  }
}
</script>

<style scoped>
.credit-info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.card-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.title-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #165dff;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.card-content {
  padding: 16px;
}

.loading-wrapper {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.credit-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.label {
  font-size: 14px;
  color: #86909c;
  margin-right: 8px;
  white-space: nowrap;
}

.value {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.value.rate {
  color: #165dff;
  font-weight: 600;
}

.value.reject-reason {
  color: #f53f3f;
}

.copy-icon {
  width: 12px;
  height: 12px;
  margin-left: 4px;
  color: #86909c;
  cursor: pointer;
}

.copy-icon:hover {
  color: #165dff;
}

.status-tag,
.risk-tag {
  font-size: 12px;
  border-radius: 4px;
}

.amount-row {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  gap: 20px;
}

.amount-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.amount-label {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.amount-value.primary {
  color: #165dff;
  font-size: 20px;
}

.amount-value.used {
  color: #f53f3f;
}

.amount-value.available {
  color: #00b42a;
}

.usage-progress {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.progress-value {
  font-size: 14px;
  color: #165dff;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #86909c;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .info-item {
    min-width: auto;
  }
  
  .amount-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .amount-item {
    min-width: auto;
  }
}
</style>