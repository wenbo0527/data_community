<template>
  <div class="status-timeline-11">
    <a-alert v-if="isFailed" type="error" :show-icon="true" class="mb-16">
      <template #title>{{ failedTitle }}</template>
      <div class="failed-detail">
        <div>失败原因：{{ failedReason || '—' }}</div>
        <div>失败时间：{{ failedAt || '—' }} · 已尝试 {{ retryCount }} 次</div>
        <a-space style="margin-top: 8px">
          <a-button v-if="showRetry" type="primary" size="small" @click="$emit('retry')">{{ retryLabel }}</a-button>
          <a-button v-if="showManualRetry" size="small" @click="$emit('manual-retry')">手动触发批次重试</a-button>
        </a-space>
      </div>
    </a-alert>

    <a-steps
      direction="vertical"
      :current="currentStepIndex"
      :status="isFailed ? 'error' : 'process'"
    >
      <a-step
        v-for="(step, idx) in steps"
        :key="step.key"
        :title="step.label"
        :description="stepDesc(step, idx)"
      >
        <template #icon>
          <span v-if="idx < currentStepIndex" class="step-icon done">✓</span>
          <span v-else-if="idx === currentStepIndex && !isFailed" class="step-icon current">{{ idx + 1 }}</span>
          <span v-else-if="idx === currentStepIndex && isFailed" class="step-icon failed">✕</span>
          <span v-else class="step-icon pending">{{ idx + 1 }}</span>
        </template>
      </a-step>
    </a-steps>

    <!-- 异常状态分支提示 -->
    <div v-if="isFailed" class="failed-branch-tip">
      <icon-exclamation-circle-fill style="color:#f53f3f" />
      <span>当前处于异常分支，需要修复后点击上方按钮重试。修复后将回到正常状态「{{ nextNormalLabel }}」</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  MIDLOAN_STATUS_ORDER,
  midloanStatusMeta,
  MIDLOAN_FAILED_STATUSES,
  isRetryableFailedStatus
} from '@/modules/variable-hub/constants/midloanStatusMap'

const props = defineProps({
  /** 当前状态 */
  status: { type: String, required: true },
  /** 状态变更时间戳映射（可选，用于展示每个节点的时间） */
  timestamps: { type: Object, default: () => ({}) },
  /** 重试次数 */
  retryCount: { type: Number, default: 0 },
  /** 失败原因 */
  failedReason: { type: String, default: '' },
  /** 失败时间 */
  failedAt: { type: String, default: '' },
  /** 是否显示重试按钮 */
  showRetry: { type: Boolean, default: false },
  /** 是否显示手动批次重试按钮 */
  showManualRetry: { type: Boolean, default: false },
  /** 重试按钮文案 */
  retryLabel: { type: String, default: '重新同步' }
})

defineEmits(['retry', 'manual-retry'])

const isFailed = computed(() => isRetryableFailedStatus(props.status))

// 把异常状态映射到对应正常状态的下标，作为时间轴 current
// 9 状态机索引：registered=0, developing_oa=1, dw_online=2, business_verified=5,
//               verified=4, syncing_internal=5, syncing_variable=6,
//               online=7, offline=8
const currentStepIndex = computed(() => {
  if (isFailed.value) {
    // 找到异常对应的前一个正常状态
    const failedMap = {
      internal_sync_failed: 5,    // 9 状态机：内数同步中 = index 5
      variable_sync_failed: 6,    // 9 状态机：变量中心同步中 = index 6
      dw_online_failed: 2,        // 9 状态机：数仓开发完成 = index 2
      offline_failed: 8           // 9 状态机：已下线 = index 8
    }
    return failedMap[props.status] !== undefined ? failedMap[props.status] : 0
  }
  const idx = MIDLOAN_STATUS_ORDER.indexOf(props.status)
  return idx >= 0 ? idx : -1
})

const steps = computed(() =>
  MIDLOAN_STATUS_ORDER.map((key) => ({
    key,
    label: midloanStatusMeta(key).label
  }))
)

function stepDesc(step, idx) {
  const ts = props.timestamps[step.key]
  if (ts) return ts
  if (idx === currentStepIndex.value && !isFailed.value) return '当前状态'
  if (idx > currentStepIndex.value) return '未到达'
  return '已完成'
}

const failedTitle = computed(() => {
  return midloanStatusMeta(props.status).label
})

const nextNormalLabel = computed(() => {
  // 异常修复后回到的下一个正常状态
  if (props.status === 'internal_sync_failed') return '同步中（变量中心）'
  if (props.status === 'variable_sync_failed') return '已上线'
  if (props.status === 'dw_online_failed') return '数仓已上线'
  if (props.status === 'offline_failed') return '已下线'
  return ''
})
</script>

<style scoped>
.status-timeline-11 {
  padding: 8px 0;
}
.mb-16 { margin-bottom: 16px; }
.failed-detail {
  font-size: 12px;
  line-height: 1.7;
}
.step-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.step-icon.done {
  background: #00b42a;
}
.step-icon.current {
  background: #165dff;
}
.step-icon.failed {
  background: #f53f3f;
}
.step-icon.pending {
  background: #c9cdd4;
}
.failed-branch-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff1f0;
  border-radius: 4px;
  font-size: 13px;
  color: #4e5969;
}
</style>