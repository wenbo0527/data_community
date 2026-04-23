<template>
  <div class="customer-profile">
    <div class="data-zone offline-zone">
      <div class="zone-header">
        <div class="zone-title">
          <IconBarChart />
          <span>客户全景分析</span>
          <span class="update-time">数据更新于 T-1</span>
        </div>
        <div class="zone-actions">
          <a-tooltip content="数据反馈">
            <a-button type="text" size="mini" @click="handleFeedback">
              <template #icon><IconBug /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>
      
      <div class="profile-tabs-container">
        <div class="detail-content">
          <BasicProfile :user-info="userInfo" />
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
import { IconBarChart, IconBug } from '@arco-design/web-vue/es/icon'
import BasicProfile from './profile/BasicProfile.vue'

interface Props {
  userInfo?: any
}

withDefaults(defineProps<Props>(), {
  userInfo: () => ({})
})

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
  border-bottom: 1px solid var(--subapp-bg-secondary);
}

.zone-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.zone-title .arco-icon {
  margin-right: 8px;
  font-size: 18px;
}

.update-time {
  font-size: 12px;
  color: var(--subapp-text-tertiary);
  font-weight: normal;
  margin-left: 12px;
}

.profile-tabs-container {
  padding: 0 20px 20px 20px;
}

.tab-title-with-icon {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.profile-inner-tabs :deep(.arco-tabs-nav) {
  margin-bottom: 16px;
}

.profile-inner-tabs :deep(.arco-tabs-content) {
  padding-top: 8px;
}

.detail-content {
  min-height: 300px;
}
</style>
