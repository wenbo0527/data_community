<template>
  <a-drawer
    :visible="visible"
    :width="'40%'"
    :footer="false"
    unmount-on-close
    @cancel="$emit('update:visible', false)"
  >
    <template #title>
      <span class="uq-drawer-title">{{ task?.name ?? '任务详情' }}</span>
    </template>

    <div v-if="task" class="uq-drawer-body">
      <!-- 任务基本信息 -->
      <a-descriptions :column="2" size="small" class="uq-drawer-meta">
        <a-descriptions-item label="关联脚本">{{ task.scriptName }}</a-descriptions-item>
        <a-descriptions-item label="数据源">
          <DataSourceBadge :datasource="task.datasource" mode="full" />
        </a-descriptions-item>
        <a-descriptions-item label="调度频率">{{ task.schedule }}</a-descriptions-item>
        <a-descriptions-item label="Cron 表达式">
          <code class="uq-cron">{{ task.cronExpression }}</code>
        </a-descriptions-item>
        <a-descriptions-item label="上次执行">{{ task.lastRun || '—' }}</a-descriptions-item>
        <a-descriptions-item label="下次执行">{{ task.nextRun || '—' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 通知告警摘要 -->
      <div class="uq-drawer-section">
        <span class="uq-drawer-section__title">通知告警</span>
        <a-space wrap>
          <a-tag v-if="task.notify.notifyOnSuccess" color="green" size="small">成功时通知</a-tag>
          <a-tag v-if="task.notify.notifyOnFailed" color="red" size="small">失败时通知</a-tag>
          <a-tag v-if="task.notify.timeoutMinutes > 0" color="orange" size="small">超时 {{ task.notify.timeoutMinutes }} 分钟</a-tag>
          <a-tag v-if="task.notify.maxConsecutiveFailures > 0" color="orange" size="small">连续失败 {{ task.notify.maxConsecutiveFailures }} 次升级</a-tag>
          <a-tag v-if="!task.notify.notifyOnSuccess && !task.notify.notifyOnFailed" color="gray" size="small">未配置通知</a-tag>
        </a-space>
      </div>

      <!-- 高级设置摘要 -->
      <div class="uq-drawer-section">
        <span class="uq-drawer-section__title">高级设置</span>
        <a-space wrap>
          <a-tag size="small">重试 {{ task.advanced.retryCount }} 次</a-tag>
          <a-tag size="small">间隔 {{ task.advanced.retryInterval }} 分钟</a-tag>
          <a-tag v-if="task.advanced.skipBacklog" color="arcoblue" size="small">跳过堆积</a-tag>
        </a-space>
      </div>

      <a-divider margin="12px" />

      <!-- 三 Tab:执行结果 / 执行历史 / 执行日志 -->
      <a-tabs v-model:active-key="tab" size="small">
        <a-tab-pane key="result" title="执行结果">
          <div v-if="taskResult" class="uq-drawer-result">
            <a-table
              :columns="taskResult.columns"
              :data="taskResult.rows"
              :pagination="false"
              size="small"
              :scroll="{ y: 200 }"
            />
            <div class="uq-drawer-result__meta">
              耗时: <b>{{ taskResult.duration }}</b>
              <a-divider direction="vertical" />
              行数: <b>{{ taskResult.rowCount }}</b>
            </div>
          </div>
          <a-empty v-else description="暂无执行结果" />
        </a-tab-pane>

        <a-tab-pane key="history" title="执行历史">
          <div v-if="histories.length" class="uq-drawer-history">
            <div v-for="h in histories" :key="h.id" class="uq-drawer-history__item">
              <StatusTag :status="h.status" />
              <span class="uq-drawer-history__time">{{ h.runAt }}</span>
              <span class="uq-drawer-history__dur">{{ h.duration }}</span>
              <span class="uq-drawer-history__rows">{{ h.rowCount }} 行</span>
              <span v-if="h.errorMsg" class="uq-drawer-history__err">{{ h.errorMsg }}</span>
            </div>
          </div>
          <a-empty v-else description="暂无执行历史" />
        </a-tab-pane>

        <a-tab-pane key="log" title="执行日志">
          <LogViewer :logs="taskLogs" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
/**
 * 任务详情抽屉(F24 + F34 + F35)
 *
 * 右侧 40% 宽度抽屉,展示任务基本信息 + 通知告警 + 高级设置 +
 * 三 Tab(执行结果 / 执行历史 / 执行日志)。
 */
import { computed, ref, watch } from 'vue'
import StatusTag from './StatusTag.vue'
import DataSourceBadge from './DataSourceBadge.vue'
import LogViewer from './LogViewer.vue'
import { useUqTaskStore } from '@/stores-dca/unified-query/task'
import { getResultByTable } from '@/mock/unified-query/queryResults'
import { taskRunLogs } from '@/mock/unified-query/logs'
import { extractTableName } from '@/mock/unified-query/executor'
import type { TaskRecord } from '@/mock/unified-query/types'

const props = defineProps<{ visible: boolean; taskId: string | null }>()
defineEmits<{ 'update:visible': [boolean] }>()

const taskStore = useUqTaskStore()
const tab = ref<'result' | 'history' | 'log'>('result')

const task = computed<TaskRecord | null>(() =>
  props.taskId ? taskStore.getById(props.taskId) : null
)

const histories = computed(() =>
  props.taskId ? taskStore.getHistory(props.taskId) : []
)

/** 根据 TaskRecord 的关联脚本名查找对应的 Mock 结果集 */
const taskResult = computed(() => {
  const t = task.value
  if (!t) return null
  // 从脚本名推断表名,取对应的 Mock 结果
  const scriptName = t.scriptName
  const allScripts = ['dwd_loan_daily', 'dwd_repay_daily', 'ads_user_summary', 'dwd_loan_detail', 'dws_risk_summary', 'b_crm_customer_info']
  // 简单映射:从脚本名找关联表
  let tableName = allScripts[0]
  if (scriptName.includes('放款') || scriptName.includes('日报')) tableName = 'dwd_loan_daily'
  else if (scriptName.includes('还款')) tableName = 'dwd_repay_daily'
  else if (scriptName.includes('风控') || scriptName.includes('逾期') || scriptName.includes('审批')) tableName = 'dws_risk_summary'
  else if (scriptName.includes('客户') || scriptName.includes('画像')) tableName = 'b_crm_customer_info'
  else if (scriptName.includes('渠道')) tableName = 'dwd_loan_daily'
  const set = getResultByTable(tableName)
  return {
    columns: set.columns.map(c => ({ title: c.title, dataIndex: c.dataIndex, width: c.width })),
    rows: set.rows.slice(0, 5),
    duration: histories.value[0]?.duration ?? '1.2s',
    rowCount: histories.value[0]?.rowCount ?? set.rows.length
  }
})

/** 根据任务状态和名称生成日志 */
const taskLogs = computed(() => {
  const t = task.value
  if (!t) return []
  const rows = histories.value[0]?.rowCount ?? 5
  if (t.status === 'failed') {
    return taskRunLogs(t.name, 0)
  }
  return taskRunLogs(t.name, rows)
})

watch(() => props.taskId, () => { tab.value = 'result' })
</script>

<style lang="scss" scoped>
.uq-drawer-title {
  font-weight: 600;
  font-size: 15px;
}

.uq-drawer-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.uq-drawer-meta {
  :deep(.arco-descriptions-item-label) {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.uq-drawer-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &__title {
    flex: none;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-2);
    width: 70px;
    line-height: 28px;
  }
}

.uq-cron {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 3px;
}

.uq-drawer-result {
  &__meta {
    margin-top: 8px;
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.uq-drawer-history {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    padding: 6px 8px;
    border-radius: 4px;
    background: var(--color-fill-1);

    &:hover {
      background: var(--color-fill-2);
    }
  }

  &__time { color: var(--color-text-2); font-weight: 500; }
  &__dur { color: var(--color-text-3); }
  &__rows { color: var(--color-text-3); }
  &__err {
    color: rgb(var(--danger-6));
    flex: 1;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
