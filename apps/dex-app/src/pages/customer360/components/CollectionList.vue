<template>
  <div class="records-list">
    <div 
      v-for="record in paginatedRecords" 
      :key="record.id"
      class="record-item"
      :class="{ 'expanded': expandedItems.has(record.id) }"
      @click="toggleExpand(record.id)"
    >
      <div class="record-header">
        <div class="record-info">
          <span class="record-type">{{ record.collectionMethod }}</span>
          <span class="record-date">{{ formatDate(record.collectionDate) }} {{ record.collectionTime }}</span>
        </div>
        <div class="record-status">
          <a-tag 
            :color="getResultColor(record.contactResult)"
            class="status-tag"
          >
            {{ record.contactResult }}
          </a-tag>
          <span class="score-badge" :class="getScoreClass(record.effectiveScore)">
            {{ record.effectiveScore }}分
          </span>
        </div>
      </div>
      
      <div class="record-content">
        <div class="record-details">
          <div class="detail-item">
            <span class="detail-label">催收人员：</span>
            <span class="detail-value">{{ record.collectorName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">逾期金额：</span>
            <span class="detail-value amount">{{ formatAmount(record.overdueAmount) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">逾期天数：</span>
            <span class="detail-value days" :class="getOverdueDaysClass(record.overdueDays)">{{ record.overdueDays }}天</span>
          </div>
          <div class="detail-item" v-if="record.promiseAmount && parseFloat(record.promiseAmount) > 0">
            <span class="detail-label">承诺还款：</span>
            <span class="detail-value promise">{{ formatAmount(record.promiseAmount) }}</span>
          </div>
        </div>
        
        <div class="record-actions">
          <a-button size="mini" type="text" @click.stop="viewDetail(record)">
            <template #icon>
              <IconEye />
            </template>
          </a-button>
          <a-button size="mini" type="text" @click.stop="copyRecord(record)">
            <template #icon>
              <IconCopy />
            </template>
          </a-button>
        </div>
      </div>
      
      <div v-if="record.remark" class="record-remark">
        <strong>备注：</strong>{{ record.remark }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconEye, IconCopy } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { formatAmount } from '@/utils/formatUtils'

export interface CollectionRecord {
  id?: string | number
  collectionMethod?: string
  collectionDate?: string
  collectionTime?: string
  contactResult?: string
  effectiveScore?: string | number
  collectorName?: string
  overdueAmount?: string | number
  overdueDays?: number
  promiseAmount?: string | number
  remark?: string
  [key: string]: any
}

interface Props {
  records: CollectionRecord[]
  expandedItems?: Set<string | number>
}

const props = withDefaults(defineProps<Props>(), {
  expandedItems: () => new Set()
})

const emit = defineEmits<{
  (e: 'toggle-expand', id: string | number): void
  (e: 'view-detail', record: CollectionRecord): void
  (e: 'copy-record', record: CollectionRecord): void
}>()

// 分页相关（由父组件传入）
const currentPage = defineModel<number>('currentPage', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

const paginatedRecords = defineModel<CollectionRecord[]>('paginatedRecords', { default: () => [] })

// 格式化日期
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取结果颜色
const getResultColor = (result: string | undefined) => {
  const colorMap: Record<string, string> = {
    '联系成功': 'green',
    '联系失败': 'red',
    '已发送': 'blue',
    '未联系到': 'orange'
  }
  return colorMap[result || ''] || 'default'
}

// 获取评分样式类
const getScoreClass = (score: string | number | undefined) => {
  const numScore = parseFloat(String(score))
  if (numScore >= 8) return 'score-high'
  if (numScore >= 5) return 'score-medium'
  return 'score-low'
}

// 获取逾期天数样式类
const getOverdueDaysClass = (days: number | undefined) => {
  if (!days) return ''
  if (days > 30) return 'days-critical'
  if (days > 7) return 'days-warning'
  return 'days-normal'
}

// 展开/收起
const toggleExpand = (id: string | number) => {
  emit('toggle-expand', id)
}

// 查看详情
const viewDetail = (record: CollectionRecord) => {
  emit('view-detail', record)
}

// 复制记录
const copyRecord = async (record: CollectionRecord) => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(record, null, 2))
    Message.success('已复制到剪贴板')
    emit('copy-record', record)
  } catch {
    Message.error('复制失败')
  }
}
</script>

<style scoped>
.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.record-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.record-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.record-type {
  font-weight: 600;
  color: #333;
}

.record-date {
  color: #666;
  font-size: 12px;
}

.record-status {
  display: flex;
  gap: 8px;
  align-items: center;
}

.score-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.score-high {
  background: #f0f9f0;
  color: #52c41a;
}

.score-medium {
  background: #fffbe6;
  color: #faad14;
}

.score-low {
  background: #fff2f0;
  color: #ff4d4f;
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.record-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.detail-item {
  display: flex;
  gap: 4px;
  font-size: 13px;
}

.detail-label {
  color: #999;
}

.detail-value {
  color: #333;
}

.detail-value.amount {
  color: #1650d8;
  font-weight: 500;
}

.detail-value.promise {
  color: #52c41a;
}

.days-critical {
  color: #ff4d4f;
}

.days-warning {
  color: #faad14;
}

.days-normal {
  color: #52c41a;
}

.record-actions {
  display: flex;
  gap: 4px;
}

.record-remark {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
  font-size: 13px;
  color: #666;
}
</style>
