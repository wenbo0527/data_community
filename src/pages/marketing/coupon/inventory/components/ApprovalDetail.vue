<template>
  <a-modal
    v-model:visible="visible"
    title="审批详情"
    width="700px"
    :footer="false"
    @cancel="handleCancel"
  >
    <div class="approval-detail" v-if="approvalData.id">
      <!-- 基本信息 -->
      <a-descriptions
        title="申请信息"
        :column="2"
        bordered
        size="large"
      >
        <a-descriptions-item label="申请ID">
          {{ approvalData.id }}
        </a-descriptions-item>
        <a-descriptions-item label="券模板名称">
          {{ approvalData.templateName }}
        </a-descriptions-item>
        <a-descriptions-item label="发券数量">
          {{ approvalData.couponCount }}
        </a-descriptions-item>
        <a-descriptions-item label="申请人">
          {{ approvalData.applicant }}
        </a-descriptions-item>
        <a-descriptions-item label="审批人">
          {{ approvalData.approver }}
        </a-descriptions-item>
        <a-descriptions-item label="优先级">
          <a-tag :color="getPriorityColor(approvalData.priority)">
            {{ getPriorityText(approvalData.priority) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">
          {{ approvalData.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="审批状态">
          <a-tag :color="getStatusColor(approvalData.status)">
            {{ getStatusText(approvalData.status) }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <!-- 申请理由 -->
      <a-descriptions
        title="申请理由"
        :column="1"
        bordered
        size="large"
        style="margin-top: 16px"
      >
        <a-descriptions-item>
          {{ approvalData.approvalReason }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 审批结果 -->
      <a-descriptions
        v-if="approvalData.status !== 'pending'"
        title="审批结果"
        :column="1"
        bordered
        size="large"
        style="margin-top: 16px"
      >
        <a-descriptions-item label="审批时间">
          {{ approvalData.approvalTime }}
        </a-descriptions-item>
        <a-descriptions-item v-if="approvalData.rejectReason" label="拒绝理由">
          {{ approvalData.rejectReason }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 审批操作 (仅待审批状态显示) -->
      <div v-if="approvalData.status === 'pending' && canApprove" class="approval-actions">
        <a-divider>审批操作</a-divider>
        <a-form
          ref="approvalFormRef"
          :model="approvalForm"
          layout="vertical"
        >
          <a-form-item
            field="decision"
            label="审批决定"
            :rules="[{ required: true, message: '请选择审批决定' }]"
          >
            <a-radio-group v-model="approvalForm.decision">
              <a-radio value="approve">通过</a-radio>
              <a-radio value="reject">拒绝</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <a-form-item
            v-if="approvalForm.decision === 'reject'"
            field="reason"
            label="拒绝理由"
            :rules="[{ required: true, message: '请输入拒绝理由' }]"
          >
            <a-textarea
              v-model="approvalForm.reason"
              placeholder="请输入拒绝理由"
              :max-length="200"
              show-word-limit
              :auto-size="{ minRows: 3, maxRows: 6 }"
            />
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button
                type="primary"
                @click="handleApproval"
                :loading="approvalLoading"
              >
                提交审批
              </a-button>
              <a-button @click="resetApprovalForm">
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  approvalData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'approval-success'])

const approvalFormRef = ref()
const approvalLoading = ref(false)

// 审批表单
const approvalForm = reactive({
  decision: '',
  reason: ''
})

// 是否可以审批 (这里可以根据实际权限控制)
const canApprove = computed(() => {
  // TODO: 根据当前用户权限判断是否可以审批
  return true
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    cancelled: 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已撤销'
  }
  return textMap[status] || '未知'
}

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colorMap = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  }
  return colorMap[priority] || 'gray'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const textMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || '未知'
}

// 处理审批
const handleApproval = async () => {
  try {
    await approvalFormRef.value.validate()
    approvalLoading.value = true
    
    // TODO: 调用审批接口
    const approvalData = {
      id: props.approvalData.id,
      decision: approvalForm.decision,
      reason: approvalForm.reason
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const successMessage = approvalForm.decision === 'approve' ? '审批通过' : '审批拒绝'
    Message.success(successMessage)
    
    emit('approval-success', approvalData)
    handleCancel()
  } catch (error) {
    console.error('审批失败:', error)
  } finally {
    approvalLoading.value = false
  }
}

// 重置审批表单
const resetApprovalForm = () => {
  approvalForm.decision = ''
  approvalForm.reason = ''
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
  resetApprovalForm()
}
</script>

<style scoped>
.approval-detail {
  max-height: 600px;
  overflow-y: auto;
}

.approval-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-2);
}

:deep(.arco-descriptions-title) {
  font-weight: 600;
  color: var(--color-text-1);
}

:deep(.arco-descriptions-item-label) {
  font-weight: 500;
}
</style>