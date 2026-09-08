<template>
  <a-modal
    v-model:visible="visible"
    title="转发申请"
    :width="500"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="forward-modal">
      <a-form :model="formData" layout="vertical">
        <!-- 申请信息预览 -->
        <a-form-item label="申请信息">
          <div class="application-preview">
            <div class="preview-item">
              <span class="label">申请人：</span>
              <span class="value">{{ application?.applicantName }}</span>
            </div>
            <div class="preview-item">
              <span class="label">资源名称：</span>
              <span class="value">{{ application?.resourceName }}</span>
            </div>
            <div class="preview-item">
              <span class="label">申请权限：</span>
              <span class="value">{{ getPermissionTypeText(application?.permissionType) }}</span>
            </div>
          </div>
        </a-form-item>

        <!-- 转发给 -->
        <a-form-item 
          label="转发给" 
          required
          :rules="[{ required: true, message: '请选择转发对象' }]"
        >
          <a-select
            v-model="formData.forwardTo"
            placeholder="请选择要转发给的审批人"
            allow-search
            :loading="loadingUsers"
          >
            <a-option
              v-for="user in approverOptions"
              :key="user.id"
              :value="user.id"
              :label="user.name"
            >
              <div class="user-option">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-dept">{{ user.department }}</span>
              </div>
            </a-option>
          </a-select>
        </a-form-item>

        <!-- 转发原因 -->
        <a-form-item 
          label="转发原因" 
          required
          :rules="[{ required: true, message: '请输入转发原因' }]"
        >
          <a-textarea
            v-model="formData.reason"
            placeholder="请说明转发原因，例如：需要更高级别审批、专业领域判断等"
            :max-length="500"
            allow-clear
            show-word-limit
            :rows="4"
          />
        </a-form-item>

        <!-- 常用转发原因 -->
        <a-form-item label="快捷选择">
          <a-space wrap>
            <a-tag
              v-for="template in forwardReasons"
              :key="template.value"
              checkable
              :checked="formData.reason === template.value"
              @check="handleTemplateSelect(template.value)"
            >
              {{ template.label }}
            </a-tag>
          </a-space>
        </a-form-item>

        <!-- 提醒设置 -->
        <a-form-item label="提醒设置">
          <a-checkbox v-model="formData.sendNotification">
            发送通知给被转发的审批人
          </a-checkbox>
          <a-checkbox v-model="formData.notifyApplicant">
            通知申请人审批已转发
          </a-checkbox>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getPermissionTypeText } from '../utils'
import { getApproverUsers } from '@/api/user'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  application: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible', 'confirm'])

// 响应式数据
const formData = ref({
  forwardTo: '',
  reason: '',
  sendNotification: true,
  notifyApplicant: true
})

const loadingUsers = ref(false)
const approverOptions = ref([])

// 常用转发原因
const forwardReasons = ref([
  { label: '需要更高级别审批', value: '需要更高级别审批，请上级领导审核' },
  { label: '专业领域判断', value: '涉及专业领域，需要相关专业人员审核' },
  { label: '权限范围较大', value: '权限范围较大，需要谨慎评估' },
  { label: '涉及敏感数据', value: '涉及敏感数据，需要数据负责人审核' },
  { label: '超出我的审批权限', value: '超出我的审批权限，请更高级别审批' },
  { label: '需要多人共同决策', value: '需要多人共同决策，请相关人员参与审核' }
])

// 监听
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 重置表单数据
    formData.value = {
      forwardTo: '',
      reason: '',
      sendNotification: true,
      notifyApplicant: true
    }
    // 加载审批人列表
    loadApproverUsers()
  }
})

// 方法
const loadApproverUsers = async () => {
  try {
    loadingUsers.value = true
    const response = await getApproverUsers({
      resourceType: props.application?.resourceType,
      sensitivityLevel: props.application?.sensitivityLevel,
      approvalLevel: props.application?.approvalLevel
    })
    approverOptions.value = response.data
  } catch (error) {
    Message.error('加载审批人列表失败')
  } finally {
    loadingUsers.value = false
  }
}

const handleTemplateSelect = (value) => {
  formData.value.reason = value
}

const handleConfirm = () => {
  // 验证必填字段
  if (!formData.value.forwardTo) {
    Message.warning('请选择转发对象')
    return
  }
  
  if (!formData.value.reason.trim()) {
    Message.warning('请输入转发原因')
    return
  }

  // 确认操作
  const confirmText = `确定要将此申请转发给选定的审批人吗？`
  
  if (!window.confirm(confirmText)) {
    return
  }

  emit('confirm', {
    ...formData.value
  })
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.forward-modal {
  .application-preview {
    background-color: var(--color-fill-2);
    padding: 12px;
    border-radius: 4px;

    .preview-item {
      display: flex;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: var(--color-text-3);
        width: 80px;
        flex-shrink: 0;
      }

      .value {
        color: var(--color-text-1);
        font-weight: 500;
      }
    }
  }

  .user-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .user-name {
      font-weight: 500;
      color: var(--color-text-1);
    }

    .user-dept {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
}
</style>