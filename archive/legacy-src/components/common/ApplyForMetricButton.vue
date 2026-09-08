<template>
  <a-popover
    v-model:visible="popoverVisible"
    trigger="click"
    position="bottom"
    :width="420"
  >
    <template #content>
      <div class="apply-popover">
        <div class="apply-header">
          <icon-send class="apply-icon" />
          <div>
            <div class="apply-title">申请使用「{{ metricName }}」</div>
            <div class="apply-subtitle">提交后由 Owner 审批,无需跳页</div>
          </div>
        </div>
        <a-form :model="form" layout="vertical" size="small">
          <a-form-item label="使用场景" required>
            <a-textarea
              v-model="form.reason"
              placeholder="请简述使用该指标的业务场景"
              :max-length="200"
              show-word-limit
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-form-item label="预计使用周期">
            <a-radio-group v-model="form.duration">
              <a-radio value="7d">7 天</a-radio>
              <a-radio value="30d">30 天</a-radio>
              <a-radio value="90d">90 天</a-radio>
              <a-radio value="permanent">长期</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="通知方式">
            <a-checkbox v-model="form.notifyEmail">邮件</a-checkbox>
            <a-checkbox v-model="form.notifySite">站内消息</a-checkbox>
          </a-form-item>
        </a-form>
        <div class="apply-actions">
          <a-button @click="popoverVisible = false">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="handleSubmit">
            提交申请
          </a-button>
        </div>
      </div>
    </template>

    <a-button type="primary" size="small">
      <template #icon><icon-send /></template>
      申请使用
    </a-button>
  </a-popover>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSend } from '@arco-design/web-vue/es/icon'

const props = defineProps<{
  metricId: string
  metricName: string
  ownerId?: string
}>()

const emit = defineEmits<{
  submitted: [applicationId: string]
}>()

const popoverVisible = ref(false)
const submitting = ref(false)

const form = reactive({
  reason: '',
  duration: '30d',
  notifyEmail: true,
  notifySite: true
})

const handleSubmit = async () => {
  if (!form.reason.trim()) {
    Message.warning('请填写使用场景')
    return
  }
  submitting.value = true
  try {
    // 模拟 API 调用
    await new Promise(r => setTimeout(r, 600))
    const applicationId = `APP-${Date.now()}`
    Message.success(`申请已提交(ID: ${applicationId}),审批结果将通过站内信通知`)
    emit('submitted', applicationId)
    popoverVisible.value = false
    // 重置表单
    form.reason = ''
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.apply-popover {
  .apply-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f2f3f5;

    .apply-icon {
      font-size: 24px;
      color: #165dff;
    }

    .apply-title {
      font-size: 14px;
      font-weight: 600;
      color: #1d2129;
    }

    .apply-subtitle {
      font-size: 12px;
      color: #86909c;
      margin-top: 2px;
    }
  }

  .apply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
}
</style>