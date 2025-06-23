<script setup>
import { ref, reactive, computed } from 'vue'

// 表单数据
const formModel = reactive({
  maId: '',
  taskId: '',
  executeDate: null
})

// 表格数据
const tableData = ref([
  {
    taskId: 'STR20230515001',
    taskName: '风控策略A-实时任务',
    maId: 'MA001',
    executeTime: '2023-05-15',
    status: '成功'
  },
  {
    taskId: 'STR20230515002',
    taskName: '风控策略B-批量任务',
    maId: 'MA002',
    executeTime: '2023-05-15',
    status: '失败'
  },
  {
    taskId: 'STR20230515003',
    taskName: '风控策略C-实时任务',
    maId: 'MA003',
    executeTime: '2023-05-15',
    status: '处理中'
  }
])

// 分页配置
const pagination = reactive({
  total: 100,
  current: 1,
  pageSize: 10
})

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '成功': 'green',
    '失败': 'red',
    '处理中': 'blue'
  }
  return colorMap[status] || 'gray'
}

// 处理搜索
const handleSearch = () => {
  console.log('搜索条件:', formModel)
  // 实现搜索逻辑
}

// 处理分页
const onPageChange = (page) => {
  pagination.current = page
  // 实现分页逻辑
}

// 显示失败详情
const showFailDetail = (record) => {
  console.log('失败详情:', record)
  // 实现失败详情展示逻辑
}
</script>

<template>
  <div class="touch-home">
    <!-- 数据概览区域 -->
    <div class="data-overview">
      <h3 class="section-title">今日数据概览</h3>
      <div class="metrics-container">
        <div class="metric-item">
          <div class="metric-value">285<span class="unit">次</span></div>
          <div class="metric-label">今日触达数</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">263<span class="unit">次</span></div>
          <div class="metric-label">今日已工作触达数</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">18500<span class="unit">条</span></div>
          <div class="metric-label">今日总触达数</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">17920<span class="unit">条</span></div>
          <div class="metric-label">今日已工作触达数</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">96.86<span class="unit">%</span></div>
          <div class="metric-label">今日下发占比</div>
        </div>
      </div>
    </div>

    <!-- 任务明细区域 -->
    <div class="task-detail">
      <h3 class="section-title">任务明细</h3>
      <div class="search-form">
        <a-form :model="formModel" layout="inline">
          <a-form-item field="maId" label="MA任务ID">
            <a-input v-model="formModel.maId" placeholder="请输入MA任务ID" allow-clear />
          </a-form-item>
          <a-form-item field="taskId" label="任务执行批次">
            <a-input v-model="formModel.taskId" placeholder="请输入任务执行批次" allow-clear />
          </a-form-item>
          <a-form-item field="executeDate" label="选择执行日期">
            <a-date-picker v-model="formModel.executeDate" allow-clear />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
        </a-form>
      </div>

      <a-table :data="tableData" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="策略ID" dataIndex="taskId" :width="150" />
          <a-table-column title="MA任务名称" dataIndex="taskName" :width="200" />
          <a-table-column title="MA任务ID" dataIndex="maId" :width="120" />
          <a-table-column title="任务执行批次" dataIndex="executeTime" :width="150" />
          <a-table-column title="状态" dataIndex="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120">
            <template #cell="{ record }">
              <a-button type="text" @click="showFailDetail(record)" v-if="record.status === '失败'">
                失败详情
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>



<style scoped>
.touch-home {
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--color-text-1);
}

.data-overview {
  margin-bottom: 24px;
}

.metrics-container {
  display: flex;
  gap: 24px;
}

.metric-item {
  flex: 1;
  background: var(--color-bg-2);
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.metric-value {
  font-size: 24px;
  color: rgb(var(--primary-6));
  margin-bottom: 8px;
}

.unit {
  font-size: 14px;
  margin-left: 4px;
}

.metric-label {
  font-size: 14px;
  color: var(--color-text-2);
}

.task-detail {
  background: var(--color-bg-2);
  padding: 16px;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 16px;
}
</style>