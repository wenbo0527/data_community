<template>
  <a-table
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :pagination="false"
    row-key="id"
  >
    <template #product="{ record }">
      <a-tag :color="getProductColor(record.product_id)">
        {{ record.product_name }}
      </a-tag>
    </template>

    <template #alert_level="{ record }">
      <a-tag :color="getLevelColor(record.alert_level)">
        {{ getLevelLabel(record.alert_level) }}
      </a-tag>
    </template>

    <template #notify_channel="{ record }">
      <a-space>
        <a-tag v-for="ch in record.notify_channel" :key="ch" size="small">
          {{ getChannelLabel(ch) }}
        </a-tag>
        <span v-if="record.notify_channel.length === 0" style="color: var(--color-text-3)">-</span>
      </a-space>
    </template>

    <template #threshold="{ record }">
      <span style="font-weight: 500">{{ record.threshold_value.toLocaleString() }}</span>
      <span style="color: var(--color-text-3); font-size: 12px; margin-left: 4px">张</span>
    </template>

    <template #enabled="{ record }">
      <a-switch
        :model-value="record.enabled"
        :disabled="record.isLegacy"
        @change="(val: boolean) => $emit('toggle', record, val)"
      />
    </template>

    <template #actions="{ record }">
      <a-space>
        <a-button
          v-if="!record.isLegacy"
          type="text"
          size="small"
          @click="$emit('edit', record)"
        >编辑</a-button>
        <a-button
          v-if="!record.isLegacy"
          type="text"
          size="small"
          status="danger"
          @click="$emit('delete', record)"
        >删除</a-button>
        <a-button
          type="text"
          size="small"
          @click="$emit('view-audit', record)"
        >审计</a-button>
      </a-space>
    </template>

    <template #status="{ record }">
      <a-tag v-if="record.isLegacy" color="gray">轻量版（只读）</a-tag>
      <a-tag v-else-if="record.enabled" color="green">监控中</a-tag>
      <a-tag v-else color="gray">已停用</a-tag>
    </template>
  </a-table>
</template>

<script setup lang="ts">
/**
 * 库存预警规则列表
 * TASK-20260603-B2A5D2BB
 *
 * 关键设计（arch §3.2 / §5.1）：
 * - SUD001 轻量版行硬编码追加（isLegacy=true，编辑/删除置灰）
 * - 字段命名 product_id / threshold_value（snake_case 与 mock 一致，5/26 教训防住）
 */
import { computed } from 'vue'
import { LEGACY_THRESHOLD_KEY } from '../composables/useAlertRules'
import type { InventoryAlertRule, InventoryAlertNotifyChannel, InventoryAlertLevel } from '@/types/api/coupon'

// Props
interface Props {
  rules: readonly InventoryAlertRule[]
  loading: boolean
}
const props = defineProps<Props>()
defineEmits<{
  (e: 'edit', rule: InventoryAlertRule): void
  (e: 'delete', rule: InventoryAlertRule): void
  (e: 'toggle', rule: InventoryAlertRule, enabled: boolean): void
  (e: 'view-audit', rule: InventoryAlertRule): void
}>()

// SUD001 轻量版行（arch §5.1.2 硬编码追加）
function getLegacyThreshold(): number {
  if (typeof window === 'undefined') return 100
  return parseInt(localStorage.getItem(LEGACY_THRESHOLD_KEY) || '100')
}

const legacyRow = computed<InventoryAlertRule & { isLegacy: true }>(() => ({
  id: 'legacy-sud001',
  product_id: 'SUD001',
  product_name: 'SU 贷（轻量版）',
  threshold_value: getLegacyThreshold(),
  alert_level: 'warning',
  notify_channel: [],
  notify_users: [],
  enabled: true,
  cooldown_minutes: 0,
  created_at: '',
  updated_at: '',
  created_by: 'system',
  updated_by: 'system',
  isLegacy: true,
}))

// 列表数据 = 规则 + 轻量版行
const tableData = computed(() => [legacyRow.value, ...props.rules.map(r => ({ ...r, isLegacy: false }))])

// 列定义（5/26 教训：dataIndex 必须与 mock 字段 1:1 对齐）
const columns = [
  { title: '产品', slotName: 'product', width: 180 },
  { title: '阈值', slotName: 'threshold', width: 120 },
  { title: '等级', slotName: 'alert_level', width: 100 },
  { title: '通知', slotName: 'notify_channel', width: 180 },
  { title: '启用', slotName: 'enabled', width: 80 },
  { title: '状态', slotName: 'status', width: 140 },
  { title: '操作', slotName: 'actions', width: 220, align: 'center' as const },
]

// 辅助
function getProductColor(productId: string): string {
  if (productId === 'JD_001') return 'red'
  if (productId === 'MT_001') return 'orange'
  return 'gray'
}
function getLevelColor(level: InventoryAlertLevel): string {
  if (level === 'critical') return 'red'
  if (level === 'warning') return 'orange'
  return 'blue'
}
function getLevelLabel(level: InventoryAlertLevel): string {
  return { info: '提示', warning: '警告', critical: '严重' }[level]
}
function getChannelLabel(ch: InventoryAlertNotifyChannel): string {
  return { inbox: '站内信', email: '邮件' }[ch]
}
</script>
