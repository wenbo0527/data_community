<template>
  <div class="call-team-page">
    <div class="page-header">
      <a-button type="primary">
        <template #icon><IconPlus /></template>
        创建班组
      </a-button>
    </div>
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">8</div>
          <div class="stat-label">班组总数</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">156</div>
          <div class="stat-label">坐席总数</div>
        </a-card>
      </a-col>
    </a-row>
    <a-table :columns="teamColumns" :data="teamData" :loading="loading">
      <template #actions="{ record }">
        <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
        <a-button type="text" size="small" @click="handleMembers(record)">成员</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const loading = ref(false)

const teamColumns = [
  { title: '班组名称', dataIndex: 'name' },
  { title: '坐席数量', dataIndex: 'memberCount', align: 'center' },
  { title: '组长', dataIndex: 'leader' },
  { title: '今日外呼量', dataIndex: 'calls', align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', slotName: 'actions', align: 'center', width: 150 }
]

const teamData = ref([
  { id: '1', name: '第一组', memberCount: 20, leader: '张三', calls: 156, createTime: '2026-01-01 09:00' },
  { id: '2', name: '第二组', memberCount: 18, leader: '李四', calls: 142, createTime: '2026-01-01 09:00' }
])

const handleEdit = (record: any) => console.log('编辑:', record)
const handleMembers = (record: any) => console.log('成员:', record)
</script>

<style scoped>
.call-team-page {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.stats-row {
  margin-bottom: 20px;
}
.stat-card {
  text-align: center;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--subapp-primary);
}
.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}
</style>