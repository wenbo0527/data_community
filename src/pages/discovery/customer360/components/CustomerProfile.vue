<template>
  <div class="customer-profile">
    <div class="data-zone offline-zone">
      <div class="zone-header">
        <div class="zone-title">
          <icon-bar-chart />
          <span>客户全景分析</span>
          <span class="update-time">数据更新于 T-1</span>
        </div>
        <div class="zone-actions">
          <a-tooltip content="数据反馈">
            <a-button type="text" size="mini" @click="handleFeedback">
              <template #icon><icon-bug /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>
      
      <div class="modules-grid">
        <div class="module-card" @click="activeTab = 'basic'">
          <div class="card-header">
            <icon-user />
            <span>基础画像</span>
            <a-tag size="small" color="blue">核心</a-tag>
          </div>
          <div class="card-content">
            <div class="data-summary">
              <div class="summary-item">
                <span class="label">年龄</span>
                <span class="value">{{ userInfo?.basicInfo?.age || '28' }}岁</span>
              </div>
              <div class="summary-item">
                <span class="label">性别</span>
                <span class="value">{{ userInfo?.basicInfo?.gender || '男' }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a-link @click.stop="activeTab = 'basic'">查看详情 <icon-right /></a-link>
          </div>
        </div>

        <div class="module-card" @click="activeTab = 'credit'">
          <div class="card-header">
            <icon-safe />
            <span>征信综合</span>
            <a-tag size="small" color="green">重要</a-tag>
          </div>
          <div class="card-content">
            <div class="data-summary">
              <div class="summary-item">
                <span class="label">查询次数</span>
                <span class="value highlight">{{ creditInfo?.queryCount || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="label">逾期记录</span>
                <span class="value">{{ creditInfo?.overdueCount || 0 }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a-link @click.stop="activeTab = 'credit'">查看详情 <icon-right /></a-link>
          </div>
        </div>

        <div class="module-card" @click="activeTab = 'postloan'">
          <div class="card-header">
            <icon-bar-chart />
            <span>贷后管理</span>
            <a-tag size="small" color="orange">监控</a-tag>
          </div>
          <div class="card-content">
            <div class="data-summary">
              <div class="summary-item">
                <span class="label">催收记录</span>
                <span class="value">{{ collectionRecords?.length || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="label">风险等级</span>
                <span class="value">{{ getRiskLevel() }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a-link @click.stop="activeTab = 'postloan'">查看详情 <icon-right /></a-link>
          </div>
        </div>
      </div>

      <div v-if="activeTab" class="detail-panel">
        <div class="detail-header">
          <a-button type="text" size="small" @click="activeTab = ''">
            <template #icon><icon-right :style="{ transform: 'rotate(180deg)' }" /></template>
            返回概览
          </a-button>
        </div>
        <div class="detail-content">
          <BasicProfile v-if="activeTab === 'basic'" :user-info="userInfo" />
          <CreditProfile v-if="activeTab === 'credit'" :user-info="userInfo" :credit-info="creditInfo" />
          <PostLoanProfile v-if="activeTab === 'postloan'" :user-info="userInfo" :collection-records="collectionRecords" />
        </div>
      </div>
    </div>

    <!-- 数据反馈抽屉 -->
    <a-drawer 
      v-model:visible="feedbackVisible" 
      title="数据问题反馈" 
      width="400"
      unmount-on-close
      @ok="submitFeedback"
    >
      <a-form :model="feedbackForm" layout="vertical">
        <a-form-item label="反馈来源">
          <a-tag color="arcoblue">客户全景看板</a-tag>
        </a-form-item>
        <a-form-item label="问题类型" required>
          <a-select v-model="feedbackForm.type" placeholder="请选择问题类型">
            <a-option value="data_error">数据准确性错误</a-option>
            <a-option value="data_missing">数据缺失/未展示</a-option>
            <a-option value="data_outdated">数据更新不及时</a-option>
            <a-option value="other">其他问题</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="问题描述" required>
          <a-textarea 
            v-model="feedbackForm.description" 
            placeholder="请详细描述您发现的数据问题，以便我们快速排查..." 
            :auto-size="{ minRows: 4, maxRows: 8 }"
          />
        </a-form-item>
        <a-form-item label="上传截图 (可选)">
          <a-upload draggable />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="feedbackVisible = false">取消</a-button>
        <a-button type="primary" @click="submitFeedback">提交反馈</a-button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconBarChart, IconBug, IconUser, IconSafe, IconRight } from '@arco-design/web-vue/es/icon'
import BasicProfile from './profile/BasicProfile.vue'
import CreditProfile from './profile/CreditProfile.vue'
import PostLoanProfile from './profile/PostLoanProfile.vue'

interface Props {
  userInfo?: any
  creditInfo?: any
  collectionRecords?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  userInfo: () => ({}),
  creditInfo: () => ({}),
  collectionRecords: () => []
})

const activeTab = ref('')

const getRiskLevel = () => {
  const overdueCount = collectionRecords?.value?.length || 0
  if (overdueCount === 0) return '低风险'
  if (overdueCount <= 2) return '中风险'
  return '高风险'
}

// 数据反馈相关
const feedbackVisible = ref(false)
const feedbackForm = reactive({
  type: '',
  description: ''
})

const handleFeedback = () => {
  feedbackForm.type = ''
  feedbackForm.description = ''
  feedbackVisible.value = true
}

const submitFeedback = () => {
  Message.success('反馈提交成功！')
  feedbackVisible.value = false
}
</script>

<style scoped>
.customer-profile {
  background: transparent;
  width: 100%;
}

.data-zone {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f2f3f5;
}

.zone-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.zone-title .arco-icon {
  margin-right: 8px;
  font-size: 18px;
}

.update-time {
  font-size: 12px;
  color: #86909c;
  font-weight: normal;
  margin-left: 12px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  padding: 20px;
}

.module-card {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #165DFF;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
}

.card-header .arco-icon {
  font-size: 18px;
  color: #165DFF;
}

.card-content {
  margin-bottom: 12px;
}

.data-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label {
  color: #86909c;
  font-size: 13px;
}

.summary-item .value {
  color: #1d2129;
  font-size: 14px;
  font-weight: 500;
}

.summary-item .value.highlight {
  color: #165DFF;
  font-weight: 600;
}

.card-footer {
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
  text-align: right;
}

.detail-panel {
  border-top: 1px solid #f2f3f5;
  padding: 20px;
}

.detail-header {
  margin-bottom: 16px;
}

.detail-content {
  min-height: 300px;
}
</style>
