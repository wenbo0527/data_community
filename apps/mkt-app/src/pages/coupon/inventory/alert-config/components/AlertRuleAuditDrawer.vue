<template>
  <a-drawer
    :visible="visible"
    :title="`审计日志 - ${ruleId}`"
    :width="640"
    :footer="false"
    @update:visible="(v: boolean) => $emit('update:visible', v)"
  >
    <a-timeline>
      <a-timeline-item
        v-for="log in filteredLogs"
        :key="log.id"
        :label="formatTime(log.operated_at)"
        :dot-color="getActionColor(log.action)"
      >
        <div style="margin-bottom: 8px">
          <a-tag :color="getActionColor(log.action)">{{ getActionLabel(log.action) }}</a-tag>
          <span style="color: var(--color-text-3); margin-left: 8px">
            {{ log.operator_name }} ({{ log.operator_id }})
          </span>
        </div>

        <div v-if="log.action === 'create'" style="font-size: 12px">
          <div><strong>新建规则：</strong></div>
          <pre style="background: var(--color-fill-2); padding: 8px; border-radius: 4px; margin-top: 4px">{{ formatJson(log.after_value) }}</pre>
        </div>

        <div v-else-if="log.action === 'update'" style="font-size: 12px">
          <div><strong>变更内容：</strong></div>
          <a-row :gutter="8" style="margin-top: 4px">
            <a-col :span="11">
              <div style="color: var(--color-text-3); font-size: 12px">变更前</div>
              <pre style="background: var(--color-fill-2); padding: 8px; border-radius: 4px">{{ formatJson(log.before_value) }}</pre>
            </a-col>
            <a-col :span="11">
              <div style="color: var(--color-text-3); font-size: 12px">变更后</div>
              <pre style="background: var(--color-fill-2); padding: 8px; border-radius: 4px">{{ formatJson(log.after_value) }}</pre>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="log.action === 'delete'" style="font-size: 12px">
          <div style="color: var(--color-text-3)">软删除（enabled=false，规则保留）</div>
          <pre style="background: var(--color-fill-2); padding: 8px; border-radius: 4px; margin-top: 4px">{{ formatJson(log.before_value) }}</pre>
        </div>

        <div v-else style="font-size: 12px">
          <div><strong>启用状态变更</strong></div>
          <pre style="background: var(--color-fill-2); padding: 8px; border-radius: 4px; margin-top: 4px">{{ formatJson({ before: log.before_value, after: log.after_value }) }}</pre>
        </div>
      </a-timeline-item>

      <a-empty v-if="filteredLogs.length === 0" description="暂无审计日志" />
    </a-timeline>
  </a-drawer>
</template>

<script setup lang="ts">
/**
 * 审计日志抽屉
 * TASK-20260603-B2A5D2BB
 */
import { computed } from 'vue'
import type { InventoryAlertRuleAudit } from '@/types/api/coupon'

interface Props {
  visible: boolean
  ruleId: string
  auditLogs: readonly InventoryAlertRuleAudit[]
}
const props = defineProps<Props>()
defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

// 过滤当前规则的审计（按时间倒序）
const filteredLogs = computed(() =>
  [...props.auditLogs]
    .filter((log) => log.rule_id === props.ruleId)
    .sort((a, b) => b.operated_at.localeCompare(a.operated_at))
)

function formatTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { hour12: false })
}

function formatJson(v: unknown): string {
  if (v === null || v === undefined) return 'null'
  return JSON.stringify(v, null, 2)
}

function getActionColor(action: string): string {
  return { create: 'green', update: 'blue', delete: 'red', enable: 'cyan', disable: 'orange' }[action] || 'gray'
}

function getActionLabel(action: string): string {
  return { create: '新建', update: '更新', delete: '删除', enable: '启用', disable: '停用' }[action] || action
}
</script>
