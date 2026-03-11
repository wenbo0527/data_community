<script setup>
import { ref, reactive, computed } from 'vue'

const formModel = reactive({
  maId: '',
  taskId: '',
  executeDate: null,
  reachType: '',
  status: ''
})

const tableData = ref([
  {
    taskId: 'STR20230515001',
    taskName: '风控策略A-实时任务',
    maId: 'MA001',
    executeTime: '2023-05-15',
    status: '策略执行完成',
    reachType: '实时',
    successRate: '79.0%',
    count: 150,
    warning: true
  },
  {
    taskId: 'STR20230515002',
    taskName: '风控策略B-批量任务',
    maId: 'MA002',
    executeTime: '2023-05-15',
    status: '策略执行失败',
    reachType: '批量',
    successRate: '-',
    count: 50,
    warning: false
  },
  {
    taskId: 'STR20230515003',
    taskName: '风控策略C-实时任务',
    maId: 'MA003',
    executeTime: '2023-05-15',
    status: '策略执行中',
    reachType: '实时',
    successRate: '95.0%',
    count: 200,
    warning: false
  },
  {
    taskId: 'STR20230515004',
    taskName: '风控策略D-批量任务',
    maId: 'MA004',
    executeTime: '2023-05-15',
    status: '数据准备中',
    reachType: '批量',
    successRate: '-',
    count: 0,
    warning: false
  },
  {
    taskId: 'STR20230515005',
    taskName: '风控策略E-批量任务',
    maId: 'MA005',
    executeTime: '2023-05-15',
    status: '批量任务执行取消',
    reachType: '批量',
    successRate: '-',
    count: 0,
    warning: false
  }
])

const pagination = reactive({
  total: 100,
  current: 1,
  pageSize: 10
})

const filteredData = computed(() => {
  return tableData.value.filter(item => {
    const typeOk = !formModel.reachType || item.reachType === formModel.reachType
    const statusOk = !formModel.status || item.status === formModel.status
    return typeOk && statusOk
  })
})

const getStatusColor = (status) => {
  const colorMap = {
    '策略执行完成': 'green',
    '数据准备完成': 'green',
    '策略执行失败': 'red',
    '批量任务执行取消': 'gray',
    '策略执行中': 'blue',
    '数据准备中': 'arcoblue'
  }
  return colorMap[status] || 'gray'
}

const handleSearch = () => {
  console.log('搜索条件:', formModel)
}

const onPageChange = (page) => {
  pagination.current = page
}

const showFailDetail = (record) => {
  console.log('失败详情:', record)
}
</script>

<template>
  <div class="touch-home">
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
          <a-form-item field="reachType" label="触达类型">
            <a-select v-model="formModel.reachType" placeholder="请选择触达类型" allow-clear>
              <a-option value="实时">实时</a-option>
              <a-option value="批量">批量</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="status" label="状态">
            <a-select v-model="formModel.status" placeholder="请选择状态" allow-clear>
              <a-option value="数据准备中">数据准备中</a-option>
              <a-option value="策略执行失败">策略执行失败</a-option>
              <a-option value="批量任务执行取消">批量任务执行取消</a-option>
              <a-option value="数据准备完成">数据准备完成</a-option>
              <a-option value="策略执行完成">策略执行完成</a-option>
              <a-option value="策略执行中">策略执行中</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
        </a-form>
      </div>

      <a-table :data="filteredData" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="策略ID" dataIndex="taskId" :width="150" />
          <a-table-column title="MA任务名称" dataIndex="taskName" :width="200" />
          <a-table-column title="MA任务ID" dataIndex="maId" :width="120" />
          <a-table-column title="任务执行批次" dataIndex="executeTime" :width="150" />
          <a-table-column title="触达类型" dataIndex="reachType" :width="120" />
          <a-table-column title="成功率（小于100条不统计）" :width="180">
            <template #cell="{ record }">
              <span v-if="record.count < 100">-</span>
              <span v-else :style="{ color: record.warning ? 'red' : 'inherit' }">
                {{ record.successRate }}
                <span v-if="record.warning" style="margin-left: 4px; font-size: 12px;">(已预警)</span>
              </span>
            </template>
          </a-table-column>
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
.touch-home { padding: 20px; }
.section-title { font-size: 16px; font-weight: 500; margin-bottom: 16px; color: var(--color-text-1); }
.data-overview { margin-bottom: 24px; }
.metrics-container { display: flex; gap: 24px; }
.metric-item { flex: 1; background: var(--color-bg-2); padding: 16px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.metric-value { font-size: 24px; color: rgb(var(--primary-6)); margin-bottom: 8px; }
.unit { font-size: 14px; margin-left: 4px; }
.metric-label { font-size: 14px; color: var(--color-text-2); }
.task-detail { background: var(--color-bg-2); padding: 16px; border-radius: 4px; }
.search-form { margin-bottom: 16px; }
</style>
