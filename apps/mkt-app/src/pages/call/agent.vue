<template>
  <div class="call-agent-page">
    <div class="page-header">
      <a-button type="primary">
        <template #icon><IconPlus /></template>
        添加坐席
      </a-button>
    </div>
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">156</div>
          <div class="stat-label">在线坐席</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">142</div>
          <div class="stat-label">空闲中</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">14</div>
          <div class="stat-label">通话中</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">28</div>
          <div class="stat-label">离线</div>
        </a-card>
      </a-col>
    </a-row>
    <a-table :columns="agentColumns" :data="agentData" :loading="loading">
      <template #status="{ record }">
        <a-badge :status="record.online ? 'success' : 'default'" :text="record.online ? '在线' : '离线'" />
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const loading = ref(false)

const agentColumns = [
  { title: '坐席工号', dataIndex: 'id' },
  { title: '姓名', dataIndex: 'name' },
  { title: '班组', dataIndex: 'team' },
  { title: '状态', slotName: 'status' },
  { title: '当前客户', dataIndex: 'currentCustomer' },
  { title: '今日外呼量', dataIndex: 'calls', align: 'center' }
]

const agentData = ref([
  { id: 'A001', name: '张三', team: '第一组', online: true, currentCustomer: '李四', calls: 45 },
  { id: 'A002', name: '李四', team: '第一组', online: true, currentCustomer: '-', calls: 38 },
  { id: 'A003', name: '王五', team: '第二组', online: false, currentCustomer: '-', calls: 0 }
])
</script>

<style scoped>
.call-agent-page {
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