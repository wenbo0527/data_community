<!--
  变更记录 Tab · 版本列表
  文档 B2 R10 · 每次状态变更保留历史版本
-->
<template>
  <div class="tab-content">
    <a-card title="版本列表" class="detail-card">
      <a-table
        :data="versionList"
        :columns="versionColumns"
        row-key="id"
        :pagination="versionPagination"
        @page-change="$emit('version-page-change', $event)"
      >
        <template #version="{ record }">
          <div class="version-info">
            <div class="version-number">{{ record.version }}</div>
            <a-tag v-if="record.isCurrent" color="green">当前版本</a-tag>
          </div>
        </template>
        <template #changes="{ record }">
          <div class="changes-content">
            <div v-for="change in record.changes" :key="change" class="change-item">
              • {{ change }}
            </div>
          </div>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button
              v-if="!record.isCurrent"
              type="text"
              size="small"
              @click="$emit('compare-version', record)"
            >
              对比
            </a-button>
            <a-button
              v-if="!record.isCurrent"
              type="text"
              size="small"
              status="warning"
              @click="$emit('rollback-version', record)"
            >
              回滚
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  versionList: any[]
  versionColumns: any[]
  versionPagination: any
}

defineProps<Props>()

defineEmits<{
  (e: 'version-page-change', page: number): void
  (e: 'compare-version', record: any): void
  (e: 'rollback-version', record: any): void
}>()
</script>

<style scoped>
.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.version-number {
  font-weight: 600;
  color: #1d2129;
}
.changes-content {
  font-size: 13px;
}
.change-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
</style>
