<template>
  <div class="overview-dashboard">
    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--success">
          <IconSettings />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ overviewData?.activeRules || 0 }}</div>
          <div class="stat-card__label">活跃规则</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--primary">
          <IconExclamationCircle />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ overviewData?.todayAlerts || 0 }}</div>
          <div class="stat-card__label">当日预警</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--warning">
          <IconDashboard />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ overviewData?.inventoryAlerts || 0 }}</div>
          <div class="stat-card__label">库存预警</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--info">
          <IconBarChart />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ overviewData?.expiryAlerts || 0 }}</div>
          <div class="stat-card__label">过期预警</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  IconExclamationCircle, 
  IconSettings, 
  IconDashboard, 
  IconBarChart 
} from '@arco-design/web-vue/es/icon'

// Props
const props = defineProps({
  overviewData: {
    type: Object,
    default: () => ({
      activeRules: 0,
      todayAlerts: 0,
      inventoryAlerts: 0,
      expiryAlerts: 0
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['refresh'])

// 刷新数据
const handleRefresh = () => {
  emit('refresh')
}
</script>

<style scoped>
.overview-dashboard {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #fff;
}

.stat-card__icon--primary {
  background: linear-gradient(135deg, #1890FF, #40A9FF);
}

.stat-card__icon--success {
  background: linear-gradient(135deg, #52C41A, #73D13D);
}

.stat-card__icon--warning {
  background: linear-gradient(135deg, #FA8C16, #FFA940);
}

.stat-card__icon--info {
  background: linear-gradient(135deg, #722ED1, #9254DE);
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-card__label {
  font-size: 14px;
  color: #86909c;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-card__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-right: 12px;
  }
  
  .stat-card__value {
    font-size: 20px;
  }
  
  .stat-card__label {
    font-size: 13px;
  }
}
</style>