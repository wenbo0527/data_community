<template>
  <a-drawer
    v-model:visible="visible"
    title="申请详情"
    :width="800"
    :footer="false"
    @cancel="handleCancel"
  >
    <div class="application-detail-drawer">
      <!-- 申请基本信息 -->
      <a-card title="基本信息" size="small" class="mb-4">
        <a-descriptions :column="2" size="small">
          <a-descriptions-item label="申请编号">{{ application?.applicationNo }}</a-descriptions-item>
          <a-descriptions-item label="申请时间">{{ DateUtils.formatDateTime(application?.applyTime) }}</a-descriptions-item>
          <a-descriptions-item label="申请人">{{ application?.applicantName }}</a-descriptions-item>
          <a-descriptions-item label="所属部门">{{ application?.department }}</a-descriptions-item>
          <a-descriptions-item label="资源名称">{{ application?.resourceName }}</a-descriptions-item>
          <a-descriptions-item label="资源类型">{{ getResourceTypeText(application?.resourceType) }}</a-descriptions-item>
          <a-descriptions-item label="申请权限">{{ getPermissionTypeText(application?.permissionType) }}</a-descriptions-item>
          <a-descriptions-item label="敏感度">
            <SensitivityLabel :level="application?.sensitivityLevel" />
          </a-descriptions-item>
          <a-descriptions-item label="申请期限">{{ application?.duration ? `${application.duration}天` : '永久' }}</a-descriptions-item>
          <a-descriptions-item label="当前状态">
            <StatusLabel :status="application?.status" />
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 申请理由 -->
      <a-card title="申请理由" size="small" class="mb-4">
        <div class="application-reason">
          {{ application?.reason }}
        </div>
      </a-card>

      <!-- 审批流程 -->
      <a-card title="审批流程" size="small" class="mb-4">
        <div v-if="loadingFlow" class="loading-container">
          <a-spin />
        </div>
        
        <a-timeline v-else-if="approvalFlow.length > 0">
          <a-timeline-item
            v-for="(step, index) in approvalFlow"
            :key="step.id"
            :dot-color="getStepColor(step)"
          >
            <div class="flow-step">
              <div class="step-header">
                <span class="step-name">{{ step.name }}</span>
                <span class="step-status" :class="step.status">
                  {{ getStepStatusText(step.status) }}
                </span>
              </div>
              
              <div v-if="step.approver" class="step-approver">
                <span class="approver-name">{{ step.approver.name }}</span>
                <span class="approver-dept">{{ step.approver.department }}</span>
              </div>
              
                <div v-if="step.action" class="step-action">
                <div class="action-type">{{ getActionTypeText(step.action) }}</div>
                <div v-if="step.reason" class="action-reason">{{ step.reason }}</div>
                  <div v-if="step.time" class="action-time">{{ DateUtils.formatDateTime(step.time) }}</div>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>

        <a-empty v-else description="暂无审批流程" />
      </a-card>

      <!-- 当前进度 -->
      <a-card v-if="showCurrentProgress" title="当前进度" size="small" class="mb-4">
        <div class="current-progress">
          <a-progress
            :percent="getProgressPercent()"
            :status="getProgressStatus()"
            size="large"
            show-text
          />
          <div class="progress-info">
            <div class="progress-text">{{ getProgressText() }}</div>
            <div v-if="currentStep" class="current-step">
              当前步骤：{{ currentStep.name }}
            </div>
            <div v-if="estimatedTime" class="estimated-time">
              预计完成时间：{{ DateUtils.formatDateTime(estimatedTime) }}
            </div>
          </div>
        </div>
      </a-card>

      <!-- 操作历史 -->
      <a-card title="操作历史" size="small">
        <div v-if="loadingHistory" class="loading-container">
          <a-spin />
        </div>
        
        <a-timeline v-else-if="operationHistory.length > 0" direction="horizontal">
          <a-timeline-item
            v-for="(op, index) in operationHistory"
            :key="op.id"
            :label="DateUtils.formatDateTime(op.createTime)"
            :dot-color="getOperationColor(op.type)"
          >
            <div class="operation-item">
              <div class="operation-type">{{ getOperationTypeText(op.type) }}</div>
              <div class="operation-operator">{{ op.operatorName }}</div>
              <div v-if="op.description" class="operation-desc">{{ op.description }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>

        <a-empty v-else description="暂无操作历史" />
      </a-card>

      <!-- 底部操作 -->
      <div class="drawer-footer">
        <a-space>
          <a-button @click="viewFullHistory">
            <template #icon><IconHistory /></template>
            查看完整历史
          </a-button>
          <a-button @click="printApplication">
            <template #icon><IconPrinter /></template>
            打印申请
          </a-button>
          <a-button @click="exportApplication">
            <template #icon><IconDownload /></template>
            导出详情
          </a-button>
        </a-space>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconHistory, 
  IconPrinter, 
  IconDownload 
} from '@arco-design/web-vue/es/icon'
import StatusLabel from './StatusLabel.vue'
import SensitivityLabel from './SensitivityLabel.vue'
import { getPermissionTypeText, getResourceTypeText } from '../utils'
import { getApplicationDetail, getApplicationFlow, getApplicationHistory } from '@/api/permission'
import DateUtils from '@/utils/dateUtils'

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
const emit = defineEmits(['update:visible', 'refresh'])

// 响应式数据
const loadingFlow = ref(false)
const loadingHistory = ref(false)
const approvalFlow = ref([])
const operationHistory = ref([])
const currentStep = ref(null)
const estimatedTime = ref(null)

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const showCurrentProgress = computed(() => {
  return ['pending', 'processing'].includes(props.application?.status)
})

// 监听
watch(() => props.visible, (newVal) => {
  if (newVal && props.application?.id) {
    loadDetail()
  }
})

// 方法
const loadDetail = async () => {
  try {
    loadingFlow.value = true
    loadingHistory.value = true
    
    // 并行加载数据
    const [flowResponse, historyResponse] = await Promise.all([
      getApplicationFlow(props.application.id),
      getApplicationHistory(props.application.id)
    ])
    
    approvalFlow.value = flowResponse.data.flow
    operationHistory.value = historyResponse.data.history
    currentStep.value = flowResponse.data.currentStep
    estimatedTime.value = flowResponse.data.estimatedTime
  } catch (error) {
    Message.error('加载申请详情失败')
  } finally {
    loadingFlow.value = false
    loadingHistory.value = false
  }
}

const getStepColor = (step) => {
  const colorMap = {
    'completed': 'green',
    'processing': 'blue',
    'pending': 'gray',
    'skipped': 'orange',
    'rejected': 'red'
  }
  return colorMap[step.status] || 'gray'
}

const getStepStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'processing': '进行中',
    'pending': '待处理',
    'skipped': '已跳过',
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}

const getActionTypeText = (action) => {
  const textMap = {
    'approve': '通过',
    'reject': '拒绝',
    'forward': '转发',
    'comment': '批注'
  }
  return textMap[action] || action
}

const getProgressPercent = () => {
  if (!approvalFlow.value.length) return 0
  const completedSteps = approvalFlow.value.filter(step => step.status === 'completed').length
  return Math.round((completedSteps / approvalFlow.value.length) * 100)
}

const getProgressStatus = () => {
  if (props.application?.status === 'approved') return 'success'
  if (['rejected', 'expired', 'withdrawn'].includes(props.application?.status)) return 'danger'
  return 'normal'
}

const getProgressText = () => {
  const percent = getProgressPercent()
  return `${percent}%`
}

const getOperationColor = (type) => {
  const colorMap = {
    'submit': 'blue',
    'approve': 'green',
    'reject': 'red',
    'forward': 'orange',
    'withdraw': 'gray',
    'comment': 'blue'
  }
  return colorMap[type] || 'blue'
}

const getOperationTypeText = (type) => {
  const textMap = {
    'submit': '提交',
    'approve': '审批通过',
    'reject': '审批拒绝',
    'forward': '转发',
    'withdraw': '撤回',
    'comment': '批注'
  }
  return textMap[type] || type
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

const viewFullHistory = () => {
  // 打开完整历史对话框
  Message.success('完整历史功能开发中')
}

const printApplication = () => {
  window.print()
}

const exportApplication = () => {
  // 导出申请详情
  Message.success('导出功能开发中')
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.application-detail-drawer {
  .mb-4 {
    margin-bottom: 16px;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
  }

  .application-reason {
    background-color: var(--color-fill-2);
    padding: 12px;
    border-radius: 4px;
    line-height: 1.6;
    color: var(--color-text-1);
  }

  .flow-step {
    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .step-name {
        font-weight: 500;
        color: var(--color-text-1);
      }

      .step-status {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 2px;

        &.completed {
          background-color: rgb(var(--success-1));
          color: rgb(var(--success-6));
        }

        &.processing {
          background-color: rgb(var(--primary-1));
          color: rgb(var(--primary-6));
        }

        &.pending {
          background-color: var(--color-fill-2);
          color: var(--color-text-3);
        }

        &.skipped {
          background-color: rgb(var(--warning-1));
          color: rgb(var(--warning-6));
        }

        &.rejected {
          background-color: rgb(var(--danger-1));
          color: rgb(var(--danger-6));
        }
      }
    }

    .step-approver {
      margin-bottom: 8px;
      font-size: 12px;

      .approver-name {
        color: var(--color-text-1);
        margin-right: 8px;
      }

      .approver-dept {
        color: var(--color-text-3);
      }
    }

    .step-action {
      .action-type {
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 4px;
      }

      .action-reason {
        color: var(--color-text-2);
        font-size: 12px;
        margin-bottom: 4px;
        background-color: var(--color-fill-2);
        padding: 4px 8px;
        border-radius: 2px;
      }

      .action-time {
        color: var(--color-text-3);
        font-size: 12px;
      }
    }
  }

  .current-progress {
    text-align: center;

    .progress-info {
      margin-top: 16px;

      .progress-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 8px;
      }

      .current-step {
        color: var(--color-text-2);
        font-size: 12px;
        margin-bottom: 4px;
      }

      .estimated-time {
        color: var(--color-text-3);
        font-size: 12px;
      }
    }
  }

  .operation-item {
    text-align: center;

    .operation-type {
      font-weight: 500;
      color: var(--color-text-1);
      margin-bottom: 4px;
    }

    .operation-operator {
      color: var(--color-text-2);
      font-size: 12px;
      margin-bottom: 2px;
    }

    .operation-desc {
      color: var(--color-text-3);
      font-size: 12px;
    }
  }

  .drawer-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);
    text-align: center;
  }
}

@media print {
  .drawer-footer {
    display: none;
  }
}
</style>
