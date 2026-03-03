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
      
      <a-tabs 
        v-model:active-key="activeTab" 
        type="line" 
        size="default"
      >
        <a-tab-pane key="basic" title="基础画像">
          <div class="module-content">
            <BasicProfile :user-info="userInfo" />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="credit" title="征信综合">
          <div class="module-content">
            <CreditProfile :user-info="userInfo" :credit-info="creditInfo" />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="postloan" title="贷后管理">
          <div class="module-content">
            <PostLoanProfile :user-info="userInfo" :collection-records="collectionRecords" />
          </div>
        </a-tab-pane>
      </a-tabs>
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
import { IconBarChart, IconBug } from '@arco-design/web-vue/es/icon'
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

const activeTab = ref('basic')

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
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  overflow: hidden;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
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

.module-content {
  padding: 16px;
  min-height: 300px;
}

/* Tab样式优化 - 使用Arco Design */
:deep(.arco-tabs-nav) {
  margin-bottom: 0;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
}

:deep(.arco-tabs-tab) {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border: none;
  background: transparent;
}

:deep(.arco-tabs-tab:hover) {
  color: #1890ff;
}

:deep(.arco-tabs-tab.arco-tabs-tab-active) {
  color: #1890ff;
  font-weight: 600;
}

:deep(.arco-tabs-nav-ink) {
  background: #1890ff;
  height: 2px;
}
</style>
