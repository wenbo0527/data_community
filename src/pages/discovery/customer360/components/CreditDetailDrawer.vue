<template>
  <a-drawer
    v-model:visible="visible"
    title="授信详情"
    width="800px"
    :footer="false"
    @cancel="handleClose"
  >
    <div v-if="creditData" class="credit-detail-content">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <CreditCard class="section-icon" />
          基本信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>授信单号</label>
            <div class="info-value credit-no">
              {{ creditData.creditNo }}
              <Copy class="copy-icon" @click="copyText(creditData.creditNo)" />
            </div>
          </div>
          <div class="info-item">
            <label>授信日期</label>
            <div class="info-value">{{ formatDate(creditData.creditDate) }}</div>
          </div>
          <div class="info-item">
            <label>渠道</label>
            <div class="info-value">{{ creditData.channel }}</div>
          </div>
          <div class="info-item">
            <label>授信结果</label>
            <div class="info-value">
              <a-tag :color="getCreditStatusColor(creditData.result)">{{ creditData.result }}</a-tag>
            </div>
          </div>
          <div class="info-item" v-if="creditData.rejectReason">
            <label>拒绝原因</label>
            <div class="info-value reject-reason">{{ creditData.rejectReason }}</div>
          </div>
          <div class="info-item">
            <label>风险等级</label>
            <div class="info-value">
              <a-tag :color="getRiskLevelColor(creditData.riskLevel)">{{ creditData.riskLevel }}</a-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 额度信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <DollarSign class="section-icon" />
          额度信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>总授信额度</label>
            <div class="info-value amount total-limit">{{ formatAmount(creditData.totalLimit) }}</div>
          </div>
          <div class="info-item">
            <label>当前额度</label>
            <div class="info-value amount current-limit">{{ formatAmount(creditData.currentLimit) }}</div>
          </div>
          <div class="info-item">
            <label>已用额度</label>
            <div class="info-value amount used-limit">{{ formatAmount(creditData.usedLimit) }}</div>
          </div>
          <div class="info-item">
            <label>可用额度</label>
            <div class="info-value amount available-limit">{{ formatAmount(creditData.availableLimit) }}</div>
          </div>
          <div class="info-item">
            <label>额度使用率</label>
            <div class="info-value">
              <div class="usage-rate">
                <span :class="getUsageRateColor(creditData.usageRate)">{{ (creditData.usageRate * 100).toFixed(2) }}%</span>
                <a-progress 
                  :percent="creditData.usageRate * 100" 
                  :color="getUsageRateColor(creditData.usageRate) === 'high-usage' ? '#f53f3f' : '#165dff'"
                  size="small"
                  :show-text="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 定价信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <Percent class="section-icon" />
          定价信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>授信定价</label>
            <div class="info-value pricing">{{ (creditData.pricing * 100).toFixed(2) }}%</div>
          </div>
          <div class="info-item">
            <label>授信期限</label>
            <div class="info-value">{{ creditData.term }}个月</div>
          </div>
          <div class="info-item">
            <label>到期日期</label>
            <div class="info-value">{{ formatDate(creditData.expiryDate) }}</div>
          </div>
        </div>
      </div>

      <!-- 操作记录 -->
      <div class="detail-section" v-if="creditData.operationHistory && creditData.operationHistory.length > 0">
        <h3 class="section-title">
          <History class="section-icon" />
          操作记录
        </h3>
        <div class="operation-history">
          <div v-for="(operation, index) in creditData.operationHistory" :key="index" class="operation-item">
            <div class="operation-time">{{ formatDateTime(operation.time) }}</div>
            <div class="operation-content">
              <span class="operation-type">{{ operation.type }}</span>
              <span class="operation-desc">{{ operation.description }}</span>
            </div>
            <div class="operation-operator">{{ operation.operator }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <a-empty description="暂无数据" />
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CreditCard, DollarSign, Percent, History, Copy } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

interface CreditData {
  productKey: string
  creditNo: string
  creditDate: string
  channel: string
  result: string
  rejectReason?: string
  riskLevel: string
  totalLimit: number
  currentLimit: number
  usedLimit: number
  availableLimit: number
  usageRate: number
  pricing: number
  term: number
  expiryDate: string
  operationHistory?: Array<{
    time: string
    type: string
    description: string
    operator: string
  }>
}

interface Props {
  visible: boolean
  creditData?: CreditData | null
}

interface Emits {
  'update:visible': [value: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  creditData: null
})

const emit = defineEmits<Emits>()

const visible = ref(props.visible)

watch(() => props.visible, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:visible', newVal)
})

const handleClose = () => {
  visible.value = false
}

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

// 格式化日期时间
const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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
    '低风险': 'green',
    '中风险': 'orange',
    '高风险': 'red'
  }
  return colorMap[level] || 'gray'
}

// 获取使用率颜色类名
const getUsageRateColor = (rate: number): string => {
  if (rate >= 0.8) return 'high-usage'
  if (rate >= 0.6) return 'medium-usage'
  return 'low-usage'
}

// 复制文本
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
  }
}
</script>

<style scoped>
.credit-detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

.section-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #165dff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-no {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.copy-icon {
  width: 12px;
  height: 12px;
  color: #86909c;
  cursor: pointer;
  transition: color 0.2s;
}

.copy-icon:hover {
  color: #165dff;
}

.reject-reason {
  color: #f53f3f;
}

.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.total-limit {
  color: #165dff;
}

.current-limit {
  color: #00b42a;
}

.used-limit {
  color: #f53f3f;
}

.available-limit {
  color: #ff7d00;
}

.usage-rate {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.usage-rate span {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.low-usage {
  color: #00b42a;
}

.medium-usage {
  color: #ff7d00;
}

.high-usage {
  color: #f53f3f;
}

.pricing {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #722ed1;
}

.operation-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.operation-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  border-left: 3px solid #165dff;
}

.operation-time {
  flex: 0 0 140px;
  font-size: 12px;
  color: #86909c;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.operation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.operation-type {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
}

.operation-desc {
  font-size: 12px;
  color: #4e5969;
}

.operation-operator {
  flex: 0 0 80px;
  font-size: 12px;
  color: #86909c;
  text-align: right;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .operation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .operation-time,
  .operation-operator {
    flex: none;
    text-align: left;
  }
}
</style>