<template>
  <a-modal
    v-model:visible="visible"
    title="批量审批"
    :width="600"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="batch-approval-modal">
      <!-- 统计信息 -->
      <a-alert class="mb-4">
        <template #icon><icon-info-circle /></template>
        本次将批量处理 <strong>{{ selectedApplications.length }}</strong> 个权限申请
      </a-alert>

      <!-- 审批操作选择 -->
      <a-form :model="formData" layout="vertical">
        <a-form-item label="审批操作">
          <a-radio-group v-model="formData.action" type="button">
            <a-radio value="approve">批量通过</a-radio>
            <a-radio value="reject">批量拒绝</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 通过时的额外选项 -->
        <template v-if="formData.action === 'approve'">
          <a-form-item label="权限有效期">
            <a-date-picker
              v-model="formData.expiryDate"
              placeholder="选择权限到期时间"
              style="width: 100%"
              :disabled-date="disabledDate"
            />
            <template #extra>
              为空表示永久有效
            </template>
          </a-form-item>
        </template>

        <!-- 审批意见 -->
        <a-form-item 
          label="审批意见" 
          :required="formData.action === 'reject'"
        >
          <a-textarea
            v-model="formData.reason"
            :placeholder="getReasonPlaceholder"
            :max-length="500"
            allow-clear
            show-word-limit
            :rows="4"
          />
        </a-form-item>

        <!-- 常用意见快捷选择 -->
        <a-form-item label="常用意见">
          <a-space wrap>
            <a-tag
              v-for="template in reasonTemplates"
              :key="template.value"
              checkable
              :checked="formData.reason === template.value"
              @check="handleTemplateSelect(template.value)"
            >
              {{ template.label }}
            </a-tag>
          </a-space>
        </a-form-item>

        <!-- 预览受影响申请 -->
        <a-form-item label="预览">
          <a-collapse>
            <a-collapse-item title="查看申请详情" header="查看申请详情">
              <div class="application-preview">
                <div
                  v-for="app in selectedApplications"
                  :key="app.id"
                  class="application-item"
                >
                  <div class="app-header">
                    <span class="app-title">{{ app.resourceName }}</span>
                    <SensitivityLabel :level="app.sensitivityLevel" />
                  </div>
                  <div class="app-info">
                    <span>申请人: {{ app.applicantName }}</span>
                    <span>权限: {{ getPermissionTypeText(app.permissionType) }}</span>
                  </div>
                </div>
              </div>
            </a-collapse-item>
          </a-collapse>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconInfoCircle } from '@arco-design/web-vue/es/icon'
import SensitivityLabel from './SensitivityLabel.vue'
import { getPermissionTypeText } from '../utils'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedApplications: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:visible', 'confirm'])

// 响应式数据
const formData = ref({
  action: 'approve',
  reason: '',
  expiryDate: undefined
})

// 常用意见模板
const reasonTemplates = ref([
  { label: '申请合理，予以通过', value: '申请合理，予以通过' },
  { label: '符合权限管理规范', value: '符合权限管理规范' },
  { label: '业务需要，同意授权', value: '业务需要，同意授权' },
  { label: '权限范围合理', value: '权限范围合理' },
  { label: '申请信息不完整', value: '申请信息不完整，请补充后重新申请' },
  { label: '权限范围过大', value: '权限范围过大，请调整申请范围' },
  { label: '安全风险较高', value: '安全风险较高，暂不予授权' },
  { label: '不符合权限策略', value: '不符合权限策略，拒绝申请' }
])

// 计算属性
const getReasonPlaceholder = computed(() => {
  return formData.value.action === 'approve' 
    ? '请输入审批意见（可选）' 
    : '请输入拒绝原因（必填）'
})

// 监听
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 重置表单数据
    formData.value = {
      action: 'approve',
      reason: '',
      expiryDate: undefined
    }
  }
})

// 方法
const disabledDate = (current) => {
  return current && current < Date.now()
}

const handleTemplateSelect = (value) => {
  formData.value.reason = value
}

const handleConfirm = () => {
  // 验证必填字段
  if (formData.value.action === 'reject' && !formData.value.reason.trim()) {
    Message.warning('请输入拒绝原因')
    return
  }

  // 确认操作
  const actionText = formData.value.action === 'approve' ? '通过' : '拒绝'
  const confirmText = `确定要批量${actionText}这${props.selectedApplications.length}个权限申请吗？`
  
  if (!window.confirm(confirmText)) {
    return
  }

  emit('confirm', {
    ...formData.value,
    expiryDate: formData.value.expiryDate ? formData.value.expiryDate.toISOString() : undefined
  })
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.batch-approval-modal {
  .mb-4 {
    margin-bottom: 16px;
  }

  .application-preview {
    max-height: 300px;
    overflow-y: auto;

    .application-item {
      padding: 12px;
      border: 1px solid var(--color-border-2);
      border-radius: 4px;
      margin-bottom: 8px;

      .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .app-title {
          font-weight: 500;
          color: var(--color-text-1);
        }
      }

      .app-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--color-text-3);
      }
    }
  }
}
</style>