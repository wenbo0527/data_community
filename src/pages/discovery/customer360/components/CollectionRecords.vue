<template>
  <div class="collection-records">
    <div class="section-header">
      <h3 class="section-title">
        <icon-exclamation-circle class="title-icon" />
        催收记录
      </h3>
      <div class="section-meta">
        <span class="record-count">共 {{ records.length }} 条记录</span>
      </div>
    </div>

    <div v-if="records.length === 0" class="empty-state">
      <icon-folder class="empty-icon" />
      <p class="empty-text">暂无催收记录</p>
    </div>

    <div v-else class="records-list">
      <div 
        v-for="record in records" 
        :key="record.id"
        class="record-item"
        :class="{
          'high-risk': record.riskLevel === 'high',
          'medium-risk': record.riskLevel === 'medium',
          'low-risk': record.riskLevel === 'low'
        }"
      >
        <div class="record-header">
          <div class="record-info">
            <span class="record-type">{{ record.type }}</span>
            <span class="record-date">{{ formatDate(record.date) }}</span>
          </div>
          <div class="record-status">
            <a-tag 
              :color="getStatusColor(record.status)"
              class="status-tag"
            >
              {{ record.status }}
            </a-tag>
          </div>
        </div>

        <div class="record-content">
          <div class="record-details">
            <div class="detail-item">
              <span class="detail-label">逾期金额：</span>
              <span class="detail-value amount">{{ formatAmount(record.overdueAmount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">逾期天数：</span>
              <span class="detail-value days">{{ record.overdueDays }}天</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">催收方式：</span>
              <span class="detail-value">{{ record.method }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">催收人员：</span>
              <span class="detail-value">{{ record.collector }}</span>
            </div>
          </div>
          
          <div v-if="record.notes" class="record-notes">
            <span class="notes-label">备注：</span>
            <span class="notes-content">{{ record.notes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Tag as ATag } from '@arco-design/web-vue'
import { IconExclamationCircle, IconFolder } from '@arco-design/web-vue/es/icon'
import { formatAmount } from '@/utils/formatUtils'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  }
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '已解决': 'green',
    '处理中': 'orange',
    '待处理': 'red',
    '已联系': 'blue',
    '无法联系': 'gray'
  }
  return colorMap[status] || 'default'
}
</script>

<style scoped>
.collection-records {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.title-icon {
  color: #ff7875;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-count {
  font-size: 12px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  margin: 0;
  font-size: 14px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  transition: all 0.2s ease;
  position: relative;
}

.record-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.record-item.high-risk {
  border-left: 4px solid #ff4d4f;
}

.record-item.medium-risk {
  border-left: 4px solid #faad14;
}

.record-item.low-risk {
  border-left: 4px solid #52c41a;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-type {
  font-weight: 500;
  color: #262626;
}

.record-date {
  font-size: 12px;
  color: #8c8c8c;
}

.record-status {
  display: flex;
  align-items: center;
}

.status-tag {
  font-size: 12px;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #8c8c8c;
  min-width: 60px;
}

.detail-value {
  font-size: 13px;
  color: #262626;
}

.detail-value.amount {
  font-weight: 500;
  color: #ff4d4f;
}

.detail-value.days {
  font-weight: 500;
  color: #faad14;
}

.record-notes {
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.notes-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 8px;
}

.notes-content {
  font-size: 13px;
  color: #595959;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .collection-records {
    padding: 16px;
  }
  
  .record-details {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>