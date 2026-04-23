<template>
  <div class="call-workbench-page">
    <div class="page-header">
      <h1>人工电销工作台</h1>
      <div class="header-tabs">
        <a-tabs :active-key="activeTab" @change="handleTabChange">
          <a-tab-pane key="dashboard" title="数据看板" />
          <a-tab-pane key="task" title="外呼任务" />
          <a-tab-pane key="list" title="名单管理" />
          <a-tab-pane key="monitor" title="坐席监控" />
          <a-tab-pane key="record" title="通话记录" />
        </a-tabs>
      </div>
    </div>
    
    <!-- 数据看板 -->
    <div v-if="activeTab === 'dashboard'" class="dashboard-section">
      <a-row :gutter="16" class="stats-row">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-value">1,250</div>
            <div class="stat-label">今日外呼量</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-value">85%</div>
            <div class="stat-label">接通率</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-value">23%</div>
            <div class="stat-label">转化率</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-value">156</div>
            <div class="stat-label">在线坐席</div>
          </a-card>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="16">
          <a-card title="外呼趋势">
            <div class="chart-placeholder">
              <p>折线图展示近7日外呼量趋势</p>
            </div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="坐席排行榜">
            <a-table :columns="rankColumns" :data="rankData" size="small" :pagination="false">
              <template #index="{ rowIndex }">{{ rowIndex + 1 }}</template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 外呼任务 -->
    <div v-if="activeTab === 'task'" class="task-section">
      <div class="section-header">
        <a-button type="primary" @click="handleCreateTask">
          <template #icon><IconPlus /></template>
          新建外呼任务
        </a-button>
      </div>
      <a-table :columns="taskColumns" :data="taskData" :loading="loading">
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">{{ record.statusText }}</a-tag>
        </template>
        <template #actions="{ record }">
          <a-button type="text" size="small" @click="handleTaskDetail(record)">详情</a-button>
          <a-button type="text" size="small" @click="handleTaskPause(record)">暂停</a-button>
          <a-button type="text" size="small" @click="handleTaskStop(record)">终止</a-button>
        </template>
      </a-table>
    </div>
    
    <!-- 名单管理 -->
    <div v-if="activeTab === 'list'" class="list-section">
      <div class="section-header">
        <a-button type="primary" @click="handleImportList">
          <template #icon><IconUpload /></template>
          批量导入
        </a-button>
        <a-button @click="handleExportList">
          <template #icon><IconDownload /></template>
          导出名单
        </a-button>
      </div>
      <a-table :columns="listColumns" :data="listData" :loading="loading">
        <template #index="{ rowIndex }">{{ rowIndex + 1 }}</template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'pending' ? 'orange' : record.status === 'called' ? 'green' : 'gray'">
            {{ record.statusText }}
          </a-tag>
        </template>
      </a-table>
    </div>
    
    <!-- 坐席监控 -->
    <div v-if="activeTab === 'monitor'" class="monitor-section">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="实时监控">
            <a-table :columns="monitorColumns" :data="monitorData" size="small">
              <template #status="{ record }">
                <a-badge :status="record.online ? 'success' : 'default'" :text="record.online ? '在线' : '离线'" />
              </template>
            </a-table>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="队列状态">
            <a-list :data="queueData">
              <template #item="{ item }">
                <a-list-item-meta :title="item.name" :description="item.desc">
                  <template #avatar>
                    <a-badge :status="item.waiting > 0 ? 'warning' : 'success'" />
                  </template>
                </a-list-item-meta>
              </template>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 通话记录 -->
    <div v-if="activeTab === 'record'" class="record-section">
      <div class="search-bar">
        <a-form :model="searchForm" layout="inline">
          <a-form-item label="拨打时间">
            <a-range-picker v-model="searchForm.dateRange" />
          </a-form-item>
          <a-form-item label="通话结果">
            <a-select v-model="searchForm.result" placeholder="请选择" allow-clear>
              <a-option value="connected">已接通</a-option>
              <a-option value="no-answer">未接听</a-option>
              <a-option value="busy">占线</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <a-table :columns="recordColumns" :data="recordData" :loading="loading">
        <template #duration="{ record }">{{ record.duration }}秒</template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const activeTab = ref('dashboard')
const loading = ref(false)

const searchForm = reactive({
  dateRange: [],
  result: ''
})

// 数据看板统计
const rankColumns = [
  { title: '排名', slotName: 'index', width: 60 },
  { title: '坐席', dataIndex: 'name' },
  { title: '外呼量', dataIndex: 'calls', width: 100 }
]
const rankData = [
  { name: '张三', calls: 156 },
  { name: '李四', calls: 142 },
  { name: '王五', calls: 138 }
]

// 外呼任务
const taskColumns = [
  { title: '任务名称', dataIndex: 'name' },
  { title: '外呼人数', dataIndex: 'total', width: 100 },
  { title: '已完成', dataIndex: 'completed', width: 100 },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', slotName: 'actions', width: 200 }
]
const taskData = ref([
  { id: '1', name: 'VIP客户回访', total: 500, completed: 320, status: 'running', statusText: '进行中', createTime: '2026-04-10 09:00' },
  { id: '2', name: '流失客户召回', total: 300, completed: 300, status: 'completed', statusText: '已完成', createTime: '2026-04-08 14:00' },
  { id: '3', name: '新品推广', total: 1000, completed: 0, status: 'pending', statusText: '待开始', createTime: '2026-04-12 10:00' }
])

// 名单管理
const listColumns = [
  { title: '序号', slotName: 'index', width: 60 },
  { title: '客户姓名', dataIndex: 'customerName' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '意向产品', dataIndex: 'product' },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '分配坐席', dataIndex: 'assignee' }
]
const listData = ref([
  { id: '1', customerName: '张三', phone: '138****1234', product: '消费贷', status: 'pending', statusText: '待拨打', assignee: '李四' },
  { id: '2', customerName: '李四', phone: '139****5678', product: '信用卡', status: 'called', statusText: '已拨打', assignee: '张三' }
])

// 坐席监控
const monitorColumns = [
  { title: '坐席', dataIndex: 'name' },
  { title: '状态', slotName: 'status' },
  { title: '当前客户', dataIndex: 'currentCustomer' }
]
const monitorData = ref([
  { name: '张三', online: true, currentCustomer: '李四' },
  { name: '李四', online: true, currentCustomer: '-' },
  { name: '王五', online: false, currentCustomer: '-' }
])
const queueData = [
  { name: 'VIP客户队列', desc: '等待中: 5人', waiting: 5 },
  { name: '普通队列', desc: '等待中: 12人', waiting: 12 }
]

// 通话记录
const recordColumns = [
  { title: '客户', dataIndex: 'customer' },
  { title: '坐席', dataIndex: 'agent' },
  { title: '拨打时间', dataIndex: 'callTime', width: 180 },
  { title: '时长', slotName: 'duration', width: 100 },
  { title: '结果', dataIndex: 'result' }
]
const recordData = ref([])

const handleTabChange = (key: string) => {
  activeTab.value = key
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = { running: 'green', pending: 'orange', completed: 'blue' }
  return colors[status] || 'gray'
}

const handleCreateTask = () => console.log('新建外呼任务')
const handleTaskDetail = (record: any) => console.log('任务详情:', record)
const handleTaskPause = (record: any) => console.log('暂停任务:', record)
const handleTaskStop = (record: any) => console.log('终止任务:', record)
const handleImportList = () => console.log('批量导入')
const handleExportList = () => console.log('导出名单')
const handleSearch = () => console.log('搜索:', searchForm)
</script>

<style scoped>
.call-workbench-page {
  padding: 20px;
}
.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0 0 16px 0;
}
.header-tabs {
  background: #fff;
  padding: 0 16px;
  margin-bottom: 16px;
}
.dashboard-section .stats-row {
  margin-bottom: 16px;
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
.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
  border-radius: 4px;
  color: #999;
}
.section-header {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}
.search-bar {
  background: #f7f8fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>
