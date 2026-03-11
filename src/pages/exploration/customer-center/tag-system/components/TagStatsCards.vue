<template>
  <a-row :gutter="16" class="stats-row">
    <a-col :span="8">
      <a-card hoverable class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <IconApps />
          </div>
          <div class="stat-info">
            <div class="stat-title">总标签表数</div>
            <div class="stat-value">{{ formatNumber(stats.total) }}</div>
            <div class="stat-trend" :class="{ positive: stats.trend.total > 0, negative: stats.trend.total < 0 }">
              <IconArrowRise v-if="stats.trend.total > 0" />
              <IconArrowFall v-if="stats.trend.total < 0" />
              {{ Math.abs(stats.trend.total).toFixed(1) }}%
            </div>
          </div>
        </div>
      </a-card>
    </a-col>
    <a-col :span="8">
      <a-card hoverable class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active">
            <IconCheckCircle />
          </div>
          <div class="stat-info">
            <div class="stat-title">已激活</div>
            <div class="stat-value">{{ formatNumber(stats.active) }}</div>
            <div class="stat-trend" :class="{ positive: stats.trend.active > 0, negative: stats.trend.active < 0 }">
              <IconArrowRise v-if="stats.trend.active > 0" />
              <IconArrowFall v-if="stats.trend.active < 0" />
              {{ Math.abs(stats.trend.active).toFixed(1) }}%
            </div>
          </div>
        </div>
      </a-card>
    </a-col>
    <a-col :span="8">
      <a-card hoverable class="stat-card">
        <div class="stat-content">
          <div class="stat-icon archived">
            <IconArchive />
          </div>
          <div class="stat-info">
            <div class="stat-title">已归档</div>
            <div class="stat-value">{{ formatNumber(stats.archived) }}</div>
            <div class="stat-trend" :class="{ positive: stats.trend.archived > 0, negative: stats.trend.archived < 0 }">
              <IconArrowRise v-if="stats.trend.archived > 0" />
              <IconArrowFall v-if="stats.trend.archived < 0" />
              {{ Math.abs(stats.trend.archived).toFixed(1) }}%
            </div>
          </div>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { IconApps, IconCheckCircle, IconArchive, IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon'

// Props定义
interface Props {
  stats: {
    total: number
    active: number
    archived: number
    trend: {
      total: number
      active: number
      archived: number
    }
  }
}

defineProps<Props>()

// 方法
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped lang="less">
.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #165dff 0%, #0b5de5 100%);
  color: white;
  font-size: 24px;
  
  &.active {
    background: linear-gradient(135deg, #00b96b 0%, #00a35c 100%);
  }
  
  &.archived {
    background: linear-gradient(135deg, #86909c 0%, #6b7280 100%);
  }
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #86909c;
  
  &.positive {
    color: #00b96b;
  }
  
  &.negative {
    color: #f53f3f;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .stat-icon {
    margin: 0 auto;
  }
}
</style>