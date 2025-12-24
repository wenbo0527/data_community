<template>
  <a-modal
    v-model:visible="visible"
    title="审批历史"
    :width="800"
    :footer="false"
    @cancel="handleCancel"
  >
    <div class="history-modal">
      <!-- 申请基本信息 -->
      <a-card title="申请信息" size="small" class="mb-4">
        <a-descriptions :column="2" size="small">
          <a-descriptions-item label="申请编号">{{ applicationInfo?.id }}</a-descriptions-item>
          <a-descriptions-item label="申请人">{{ applicationInfo?.applicantName }}</a-descriptions-item>
          <a-descriptions-item label="申请时间">{{ formatTime(applicationInfo?.applyTime) }}</a-descriptions-item>
          <a-descriptions-item label="资源名称">{{ applicationInfo?.resourceName }}</a-descriptions-item>
          <a-descriptions-item label="申请权限">{{ getPermissionTypeText(applicationInfo?.permissionType) }}</a-descriptions-item>
          <a-descriptions-item label="当前状态">
            <StatusLabel :status="applicationInfo?.status" />
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 审批流程时间线 -->
      <a-card title="审批流程" size="small">
        <div v-if="loadingHistory" class="loading-container">
          <a-spin />
        </div>
        
        <a-timeline v-else-if="approvalHistory.length > 0">
          <a-timeline-item
            v-for="(record, index) in approvalHistory"
            :key="record.id"
            :label="formatTime(record.createTime)"
            :dot-color="getTimelineDotColor(record.action)"
          >
            <!-- 时间线内容 -->
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="action-type">{{ getActionTypeText(record.action) }}</span>
                <span class="operator">{{ record.operatorName }}</span>
                <a-tag v-if="record.isForwarded" size="small" color="blue">转发</a-tag>
              </div>
              
              <div class="timeline-body">
                <div v-if="record.reason" class="reason">
                  <span class="label">意见：</span>
                  <span class="value">{{ record.reason }}</span>
                </div>
                
                <div v-if="record.expiryDate" class="expiry">
                  <span class="label">有效期至：</span>
                  <span class="value">{{ formatTime(record.expiryDate) }}</span>
                </div>
                
                <div v-if="record.forwardTo" class="forward-info">
                  <span class="label">转发给：</span>
                  <span class="value">{{ record.forwardToName }}</span>
                </div>
                
                <div v-if="record.attachments && record.attachments.length > 0" class="attachments">
                  <span class="label">附件：</span>
                  <div class="attachment-list">
                    <a-tag
                      v-for="file in record.attachments"
                      :key="file.id"
                      size="small"
                      @click="downloadFile(file)"
                      style="cursor: pointer; margin-right: 8px;"
                    >
                      <template #icon><icon-paper-clip /></template>
                      {{ file.name }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>

        <a-empty v-else description="暂无审批历史" />
      </a-card>

      <!-- 操作统计 -->
      <a-card v-if="statistics" title="审批统计" size="small" class="mt-4">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-statistic
              title="总审批次数"
              :value="statistics.totalCount"
            />
          </a-col>
          <a-col :span="8">
            <a-statistic
              title="转发次数"
              :value="statistics.forwardCount"
            />
          </a-col>
          <a-col :span="8">
            <a-statistic
              title="耗时（小时）"
              :value="statistics.durationHours"
              :precision="1"
            />
          </a-col>
        </a-row>
      </a-card>

      <!-- 导出选项 -->
      <div class="export-actions">
        <a-space>
          <a-button @click="exportHistory('pdf')">
            <template #icon><icon-download /></template>
            导出PDF
          </a-button>
          <a-button @click="exportHistory('excel')">
            <template #icon><icon-download /></template>
            导出Excel
          </a-button>
          <a-button @click="printHistory">
            <template #icon><icon-printer /></template>
            打印
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconPaperClip, 
  IconDownload, 
  IconPrinter 
} from '@arco-design/web-vue/es/icon'
import StatusLabel from './StatusLabel.vue'
import { getPermissionTypeText } from '../utils'
import { getApplicationHistory } from '@/api/permission'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  applicationId: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:visible'])

// 响应式数据
const loadingHistory = ref(false)
const applicationInfo = ref(null)
const approvalHistory = ref([])
const statistics = ref(null)

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 监听
watch(() => props.visible, (newVal) => {
  if (newVal && props.applicationId) {
    loadHistory()
  }
})

// 方法
const loadHistory = async () => {
  try {
    loadingHistory.value = true
    const response = await getApplicationHistory(props.applicationId)
    applicationInfo.value = response.data.application
    approvalHistory.value = response.data.history
    statistics.value = response.data.statistics
  } catch (error) {
    Message.error('加载审批历史失败')
  } finally {
    loadingHistory.value = false
  }
}

const getTimelineDotColor = (action) => {
  const colorMap = {
    'submit': 'blue',
    'approve': 'green',
    'reject': 'red',
    'forward': 'orange',
    'withdraw': 'gray'
  }
  return colorMap[action] || 'blue'
}

const getActionTypeText = (action) => {
  const textMap = {
    'submit': '提交申请',
    'approve': '审批通过',
    'reject': '审批拒绝',
    'forward': '转发申请',
    'withdraw': '撤回申请'
  }
  return textMap[action] || action
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

const downloadFile = (file) => {
  // 实现文件下载逻辑
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  link.click()
}

const exportHistory = (format) => {
  // 实现导出逻辑
  const data = {
    application: applicationInfo.value,
    history: approvalHistory.value,
    statistics: statistics.value
  }
  
  if (format === 'pdf') {
    // PDF导出逻辑
    Message.success('PDF导出功能开发中')
  } else if (format === 'excel') {
    // Excel导出逻辑
    Message.success('Excel导出功能开发中')
  }
}

const printHistory = () => {
  // 打印逻辑
  window.print()
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.history-modal {
  max-height: 70vh;
  overflow-y: auto;

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .mt-4 {
    margin-top: 16px;
  }

  .timeline-content {
    .timeline-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .action-type {
        font-weight: 500;
        color: var(--color-text-1);
      }

      .operator {
        color: var(--color-text-2);
        font-size: 12px;
      }
    }

    .timeline-body {
      .reason,
      .expiry,
      .forward-info,
      .attachments {
        margin-bottom: 4px;
        font-size: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: var(--color-text-3);
          margin-right: 8px;
        }

        .value {
          color: var(--color-text-1);
        }
      }

      .attachment-list {
        display: inline-block;
      }
    }
  }

  .export-actions {
    margin-top: 16px;
    text-align: right;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);
  }
}

@media print {
  .export-actions {
    display: none;
  }
}
</style>