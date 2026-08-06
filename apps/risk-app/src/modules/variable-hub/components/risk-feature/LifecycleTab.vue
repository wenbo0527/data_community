<!--
  治理与生命周期 Tab 容器 · 文档 §三 模块 J（v2 完整重构）
  - 单一组件：9 状态机时间轴（StatusStepFlow）
  - 整合：特征档案 + 动态操作 + 状态变更记录 + 同步日志 + 下线批次
  - 用户反馈：所有信息都收纳到状态步骤条，步骤信息展示在右侧
-->
<template>
  <div class="tab-content">
    <!-- midloan_behavior 特征：完整生命周期 -->
    <template v-if="isMidloanBehavior">
      <a-card title="9 状态机 · 全生命周期（点击操作按钮触发流程）" class="detail-card">
        <StatusStepFlow
          :status="currentMidloanStatus"
          :status-change-list="statusChangeList"
          :sync-logs="syncLogList"
          :offline-batches="offlineBatchSummary?.list || []"
          :feature-archive="featureArchiveSummary"
          :retry-count="variableData.syncRetryCount || 0"
          :failed-reason="variableData.syncFailedReason"
          :failed-at="variableData.syncFailedAt"
          :show-retry="canRetry && hasPerm('midloan:retry:execute')"
          :show-manual-retry="currentMidloanStatus === 'offline_failed' && hasPerm('midloan:retry:execute')"
          :retry-label="retryLabel"
          @retry="$emit('retry')"
          @manual-retry="$emit('manual-retry')"
          @action="$emit('action', $event)"
          @supplement-table="$emit('supplement-table')"
        />
      </a-card>
    </template>

    <!-- 其他品类特征：通用生命周期（非 11 状态机） -->
    <template v-else>
      <a-card title="生命周期阶段（通用）" class="detail-card">
        <a-alert type="info" :show-icon="false" style="margin-bottom: 12px">
          本品类（{{ nonMidloanCategoryLabel }}）采用通用生命周期阶段，不接入贷中行为 11 状态机。
          如需使用精细化状态机，请联系数据团队评估迁移到「贷中行为」品类。
        </a-alert>
        <a-descriptions :column="2" :data="lifecycleHeader" bordered />
        <a-divider style="margin: 12px 0" />
        <a-table :data="lifecycleStages" :pagination="false">
          <template #columns>
            <a-table-column title="阶段" data-index="stage" :width="160" />
            <a-table-column title="状态" :width="120">
              <template #cell="{ record }">
                <a-tag :status="record.status==='completed'?'success':(record.status==='in_progress'?'warning':'default')">{{ record.statusLabel }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="开始时间" data-index="startDate" :width="160" />
            <a-table-column title="结束时间" data-index="endDate" :width="160" />
            <a-table-column title="说明" data-index="description" />
          </template>
          <template #empty><a-empty description="暂无阶段数据" /></template>
        </a-table>
      </a-card>

      <a-card title="评估与效果" class="detail-card">
        <a-descriptions :column="2" :data="effectSummary" bordered />
      </a-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured } from 'vue'
import StatusStepFlow from '@/modules/variable-hub/components/risk-feature/StatusStepFlow.vue'

// 捕获 LifecycleTab 内子树抛出的错误，便于排查治理与生命周期侧报错
onErrorCaptured((err: any) => {
  // eslint-disable-next-line no-console
  console.error('[LifecycleTab captured error]', err)
  // 返回 false 让错误继续向上传播，方便 dev 模式显示原始堆栈
  return false
})

interface Props {
  isMidloanBehavior: boolean
  variableData: any
  currentMidloanStatus: string
  canRetry: boolean
  retryLabel: string
  allowedActions: any[]
  statusChangeList: any[]
  /** 同步日志（用于步骤条内嵌展示）*/
  syncLogList?: any[]
  /** 下线批次（含 list 数组）*/
  offlineBatchSummary: any
  lifecycleHeader: any[]
  lifecycleStages: any[]
  effectSummary: any[]
  /** 权限判断函数 */
  hasPerm?: (perm: string) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  syncLogList: () => [],
  hasPerm: () => true
})

defineEmits<{
  (e: 'retry'): void
  (e: 'manual-retry'): void
  (e: 'supplement-table'): void
  (e: 'action', action: any): void
}>()

// ============ 特征档案摘要（从 variableData 提取，防御性兜底）============
const featureArchiveSummary = computed(() => {
  const v = props.variableData || {}
  return {
    featureId: v.id || v.featureId || '',
    name: v.name || v.featureCnName || '',
    devOaOrderId: v.devOaOrderId || '',
    acceptor: v.acceptor || '',
    dataTableName: v.dataTableName || ''
  }
})

// 非 midloan 品类的中文标签（用于提示卡，防御性兜底）
const nonMidloanCategoryLabel = computed(() => {
  const v = props.variableData || {}
  const cat = v.category || v.sourceType || ''
  const map: Record<string, string> = {
    external: '外数',
    credit: '征信',
    internal: '内数',
    behavior: '行为（非贷中）'
  }
  return map[cat] || cat || '当前'
})
</script>

<style scoped>
.detail-card {
  margin-bottom: 16px;
}
</style>