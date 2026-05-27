<template>
  <div class="call-record-page">
    <div class="search-bar">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="拨打时间">
          <a-range-picker v-model="searchForm.dateRange" />
        </a-form-item>
        <a-form-item label="通话结果">
          <a-select v-model="searchForm.result" placeholder="请选择" allow-clear style="width: 120px">
            <a-option value="connected">已接通</a-option>
            <a-option value="no-answer">未接听</a-option>
            <a-option value="busy">占线</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="坐席">
          <a-select v-model="searchForm.agent" placeholder="请选择" allow-clear style="width: 120px">
            <a-option value="zhangsan">张三</a-option>
            <a-option value="lisi">李四</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <a-table :columns="recordColumns" :data="recordData" :loading="loading" :pagination="pagination">
      <template #duration="{ record }">{{ record.duration }}秒</template>
      <template #result="{ record }">
        <a-tag :color="record.result === 'connected' ? 'green' : record.result === 'busy' ? 'orange' : 'gray'">
          {{ record.resultText }}
        </a-tag>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const loading = ref(false)
const pagination = { pageSize: 10, total: 100 }

const searchForm = reactive({
  dateRange: [],
  result: '',
  agent: ''
})

const recordColumns = [
  { title: '客户姓名', dataIndex: 'customer' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '坐席', dataIndex: 'agent' },
  { title: '拨打时间', dataIndex: 'callTime', width: 180 },
  { title: '通话时长', slotName: 'duration', align: 'center', width: 100 },
  { title: '结果', slotName: 'result', align: 'center', width: 100 },
  { title: '录音', dataIndex: 'recording', align: 'center', width: 80 }
]

const recordData = ref([
  { id: '1', customer: '张三', phone: '138****1234', agent: '李四', callTime: '2026-05-27 10:30:25', duration: 236, result: 'connected', resultText: '已接通', recording: '▶' },
  { id: '2', customer: '李四', phone: '139****5678', agent: '张三', callTime: '2026-05-27 10:15:10', duration: 0, result: 'no-answer', resultText: '未接听', recording: '-' }
])

const handleSearch = () => console.log('搜索:', searchForm)
const handleReset = () => {
  searchForm.dateRange = []
  searchForm.result = ''
  searchForm.agent = ''
}
</script>

<style scoped>
.call-record-page {
  padding: 20px;
}
.search-bar {
  background: #f7f8fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>