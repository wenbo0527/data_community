<template>
  <div class="user-profile-container">
    <!-- 用户画像标题 -->
    <div class="profile-header">
      <div class="header-left">
        <IconUser class="header-icon" />
        <h3 class="header-title">用户画像</h3>
      </div>
      <div class="header-right">
        <a-tag color="blue">AI智能分析</a-tag>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin :size="24" />
      <span class="loading-text">正在分析用户画像...</span>
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="!userProfile" class="empty-container">
      <a-empty description="暂无用户画像数据" />
    </div>

    <!-- 用户画像内容 -->
    <div v-else class="profile-content">
      <!-- 人口统计特征 -->
      <div class="profile-section">
        <div class="section-header">
          <IconUserGroup class="section-icon" />
          <h4 class="section-title">人口统计特征</h4>
        </div>
        <div class="feature-grid">
          <div class="feature-item">
            <span class="feature-label">年龄段</span>
            <a-tag :color="getAgeGroupColor(userProfile.demographics.ageGroup)">
              {{ userProfile.demographics.ageGroup }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">收入水平</span>
            <a-tag :color="getIncomeColor(userProfile.demographics.incomeLevel)">
              {{ userProfile.demographics.incomeLevel }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">教育程度</span>
            <span class="feature-value">{{ userProfile.demographics.education }}</span>
          </div>
          <div class="feature-item">
            <span class="feature-label">职业类型</span>
            <span class="feature-value">{{ userProfile.demographics.occupation }}</span>
          </div>
          <div class="feature-item">
            <span class="feature-label">婚姻状况</span>
            <span class="feature-value">{{ userProfile.demographics.maritalStatus }}</span>
          </div>
          <div class="feature-item">
            <span class="feature-label">居住地区</span>
            <span class="feature-value">{{ userProfile.demographics.location }}</span>
          </div>
        </div>
      </div>

      <!-- 行为特征 -->
      <div class="profile-section">
        <div class="section-header">
          <IconDesktop class="section-icon" />
          <h4 class="section-title">行为特征</h4>
        </div>
        <div class="behavior-metrics">
          <div class="metric-card">
            <div class="metric-header">
              <IconClockCircle class="metric-icon" />
              <span class="metric-title">活跃度</span>
            </div>
            <div class="metric-value">{{ userProfile.productPreference.activityLevel }}</div>
            <div class="metric-desc">登录活跃用户</div>
          </div>
          <div class="metric-card">
            <div class="metric-header">
              <IconMobile class="metric-icon" />
              <span class="metric-title">使用习惯</span>
            </div>
            <div class="metric-value">{{ userProfile.behavior.usageHabits }}</div>
            <div class="metric-desc">主要使用方式</div>
          </div>
          <div class="metric-card">
            <div class="metric-header">
              <IconCalendar class="metric-icon" />
              <span class="metric-title">操作模式</span>
            </div>
            <div class="metric-value">{{ userProfile.behavior.operationPattern }}</div>
            <div class="metric-desc">月均交易次数</div>
          </div>
        </div>
      </div>

      <!-- 消费特征 -->
      <div class="profile-section">
        <div class="section-header">
          <IconApps class="section-icon" />
          <h4 class="section-title">消费特征</h4>
        </div>
        <div class="consumption-grid">
          <div class="consumption-item">
            <span class="consumption-label">消费水平</span>
            <a-tag :color="getConsumptionColor(userProfile.consumption.spendingLevel)">
              {{ userProfile.consumption.spendingLevel }}
            </a-tag>
          </div>
          <div class="consumption-item">
            <span class="consumption-label">消费类型</span>
            <div class="consumption-tags">
              <a-tag 
                v-for="category in userProfile.consumption.categories" 
                :key="category"
                size="small"
              >
                {{ category }}
              </a-tag>
            </div>
          </div>
          <div class="consumption-item">
            <span class="consumption-label">价格敏感度</span>
            <span class="consumption-value">{{ userProfile.consumption.priceSensitivity }}</span>
          </div>
        </div>
      </div>

      <!-- 风险特征 -->
      <div class="profile-section">
        <div class="section-header">
          <IconSafe class="section-icon" />
          <h4 class="section-title">风险特征</h4>
        </div>
        <div class="risk-assessment">
          <div class="risk-score">
            <div class="score-circle" :class="getRiskScoreClass(userProfile.risk.riskScore)">
              <span class="score-value">{{ userProfile.risk.riskScore }}</span>
              <span class="score-label">风险评分</span>
            </div>
          </div>
          <div class="risk-details">
            <div class="risk-item">
              <span class="risk-label">风险等级</span>
              <a-tag :color="getRiskLevelColor(userProfile.risk.riskLevel)">
                {{ userProfile.risk.riskLevel }}
              </a-tag>
            </div>
            <div class="risk-item">
              <span class="risk-label">信用状况</span>
              <span class="risk-value">{{ userProfile.risk.creditStatus }}</span>
            </div>
            <div class="risk-item">
              <span class="risk-label">还款能力</span>
              <span class="risk-value">{{ userProfile.risk.repaymentCapacity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 产品偏好 -->
      <div class="profile-section">
        <div class="section-header">
          <IconStar class="section-icon" />
          <h4 class="section-title">产品偏好</h4>
        </div>
        <div class="preference-grid">
          <div class="preference-item">
            <span class="preference-label">偏好产品</span>
            <div class="preference-tags">
              <a-tag 
                v-for="product in userProfile.productPreference.preferredProducts" 
                :key="product"
                color="blue"
              >
                {{ product }}
              </a-tag>
            </div>
          </div>
          <div class="preference-item">
            <span class="preference-label">投资偏好</span>
            <span class="preference-value">{{ userProfile.productPreference.investmentStyle }}</span>
          </div>
          <div class="preference-item">
            <span class="preference-label">期限偏好</span>
            <span class="preference-value">{{ userProfile.productPreference.termPreference }}</span>
          </div>
        </div>
      </div>

      <!-- 营销响应 -->
      <div class="profile-section">
        <div class="section-header">
          <IconNotification class="section-icon" />
          <h4 class="section-title">营销响应</h4>
        </div>
        <div class="marketing-metrics">
          <div class="marketing-item">
            <span class="marketing-label">响应率</span>
            <div class="marketing-progress">
              <a-progress 
                :percent="userProfile.marketingResponse.responseRate" 
                :color="getResponseRateColor(userProfile.marketingResponse.responseRate)"
                size="small"
              />
              <span class="progress-text">{{ userProfile.marketingResponse.responseRate }}%</span>
            </div>
          </div>
          <div class="marketing-item">
            <span class="marketing-label">偏好渠道</span>
            <div class="marketing-channels">
              <a-tag 
                v-for="channel in userProfile.marketingResponse.preferredChannels" 
                :key="channel"
                size="small"
                color="green"
              >
                {{ channel }}
              </a-tag>
            </div>
          </div>
          <div class="marketing-item">
            <span class="marketing-label">最佳时间</span>
            <span class="marketing-value">{{ userProfile.marketingResponse.bestContactTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 调试信息 -->
    <div v-if="showDebugPanel" class="debug-panel">
      <div class="debug-header">
        <IconBug class="debug-icon" />
        <span class="debug-title">UserProfile组件调试</span>
      </div>
      <div class="debug-content">
        <div class="debug-item">
          <span class="debug-label">组件状态:</span>
          <span class="debug-value">{{ loading ? '加载中' : '已加载' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">数据状态:</span>
          <span class="debug-value">{{ userProfile ? '有数据' : '无数据' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">更新时间:</span>
          <span class="debug-value">{{ new Date().toLocaleTimeString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  IconUser,
  IconUserGroup,
  IconDesktop,
  IconClockCircle,
  IconMobile,
  IconCalendar,
  IconApps,
  IconSafe,
  IconStar,
  IconNotification,
  IconBug
} from '@arco-design/web-vue/es/icon'

// Props
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  showDebugPanel: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['debug-info'])

// 计算用户画像数据
const userProfile = computed(() => {
  return props.userInfo?.userProfile || null
})

// 颜色辅助函数
const getAgeGroupColor = (ageGroup) => {
  const colorMap = {
    '青年': 'green',
    '中年': 'blue',
    '老年': 'orange'
  }
  return colorMap[ageGroup] || 'gray'
}

const getIncomeColor = (incomeLevel) => {
  const colorMap = {
    '高收入': 'red',
    '中等收入': 'blue',
    '低收入': 'gray'
  }
  return colorMap[incomeLevel] || 'gray'
}

const getConsumptionColor = (spendingLevel) => {
  const colorMap = {
    '高消费': 'red',
    '中等消费': 'blue',
    '低消费': 'gray'
  }
  return colorMap[spendingLevel] || 'gray'
}

const getRiskLevelColor = (riskLevel) => {
  const colorMap = {
    '低风险': 'green',
    '中风险': 'orange',
    '高风险': 'red'
  }
  return colorMap[riskLevel] || 'gray'
}

const getRiskScoreClass = (score) => {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-medium'
  return 'score-low'
}

const getResponseRateColor = (rate) => {
  if (rate >= 70) return '#52c41a'
  if (rate >= 40) return '#faad14'
  return '#ff4d4f'
}

// 组件挂载时发送调试信息
onMounted(() => {
  emit('debug-info', {
    component: 'UserProfile',
    type: 'mounted',
    message: '用户画像组件已挂载',
    data: {
      hasUserProfile: !!userProfile.value,
      loading: props.loading
    },
    timestamp: new Date().toLocaleTimeString()
  })
})
</script>

<style scoped>
.user-profile-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 20px;
  color: #1890ff;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #8c8c8c;
}

.empty-container {
  padding: 40px;
  text-align: center;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  background: #fafafa;
  border-radius: 6px;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 16px;
  color: #1890ff;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.feature-label {
  font-weight: 500;
  color: #595959;
}

.feature-value {
  color: #262626;
}

.behavior-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-card {
  background: #fff;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  text-align: center;
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
}

.metric-icon {
  font-size: 14px;
  color: #1890ff;
}

.metric-title {
  font-size: 14px;
  color: #8c8c8c;
}

.metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.metric-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.consumption-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consumption-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.consumption-label {
  min-width: 80px;
  font-weight: 500;
  color: #595959;
}

.consumption-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.consumption-value {
  color: #262626;
}

.risk-assessment {
  display: flex;
  gap: 24px;
  align-items: center;
}

.risk-score {
  flex-shrink: 0;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid;
}

.score-circle.score-high {
  border-color: #52c41a;
  background: #f6ffed;
}

.score-circle.score-medium {
  border-color: #faad14;
  background: #fffbe6;
}

.score-circle.score-low {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.score-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.score-label {
  font-size: 12px;
  color: #8c8c8c;
}

.risk-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.risk-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.risk-label {
  font-weight: 500;
  color: #595959;
}

.risk-value {
  color: #262626;
}

.preference-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.preference-label {
  min-width: 80px;
  font-weight: 500;
  color: #595959;
}

.preference-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preference-value {
  color: #262626;
}

.marketing-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.marketing-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.marketing-label {
  min-width: 80px;
  font-weight: 500;
  color: #595959;
}

.marketing-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.progress-text {
  font-size: 14px;
  color: #262626;
}

.marketing-channels {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.marketing-value {
  color: #262626;
}

.debug-panel {
  margin-top: 24px;
  padding: 16px;
  background: #f0f2f5;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.debug-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.debug-icon {
  font-size: 14px;
  color: #fa8c16;
}

.debug-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.debug-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.debug-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.debug-label {
  font-weight: 500;
  color: #8c8c8c;
}

.debug-value {
  color: #262626;
}
</style>