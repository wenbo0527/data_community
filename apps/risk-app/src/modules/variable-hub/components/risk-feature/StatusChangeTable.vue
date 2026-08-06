<!--
  状态变更记录表 · 文档 B2 R11
  时间/操作人/前/后状态/备注
-->
<template>
  <a-card title="状态变更记录（B2 R11 · 时间/操作人/前/后状态/备注）" class="detail-card">
    <a-table
      :data="data"
      :columns="columns"
      :pagination="false"
      row-key="id"
      size="small"
    >
      <template #fromStatusCell="{ record }">
        <a-tag :color="getColor(record.fromStatus)" size="small">
          {{ getLabel(record.fromStatus) }}
        </a-tag>
      </template>
      <template #toStatusCell="{ record }">
        <a-tag :color="getColor(record.toStatus)" size="small">
          {{ getLabel(record.toStatus) }}
        </a-tag>
      </template>
      <template #operatorCell="{ record }">
        <span>{{ record.operator }} <a-tag size="mini" :color="getRoleColor(record.operatorRole)">{{ getRoleLabel(record.operatorRole) }}</a-tag></span>
      </template>
      <template #empty><a-empty description="暂无状态变更记录" /></template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { midloanStatusLabel, midloanStatusColor } from '@/modules/variable-hub/constants/midloanStatusMap'
import { ROLE_LABELS, ROLE_COLORS } from '@/modules/variable-hub/types/permission'

interface Props {
  data: any[]
}

defineProps<Props>()

const columns = [
  { title: '变更时间', dataIndex: 'operatedAt', slotName: 'operatedAtCell', width: 160 },
  { title: '触发', dataIndex: 'trigger', width: 200 },
  { title: '前状态', dataIndex: 'fromStatus', slotName: 'fromStatusCell', width: 130 },
  { title: '后状态', dataIndex: 'toStatus', slotName: 'toStatusCell', width: 130 },
  { title: '操作人', dataIndex: 'operator', slotName: 'operatorCell', width: 200 },
  { title: '备注', dataIndex: 'reason' }
]

function getLabel(s: string) {
  return midloanStatusLabel(s as any) || s
}
function getColor(s: string) {
  return midloanStatusColor(s as any) || 'gray'
}
function getRoleLabel(r: string) {
  return ROLE_LABELS[r as keyof typeof ROLE_LABELS] || r
}
function getRoleColor(r: string) {
  return ROLE_COLORS[r as keyof typeof ROLE_COLORS] || 'gray'
}
</script>
