<template>
  <div class="sample-preparation-list">
    <a-page-header title="样本表准备" subtitle="管理您的数据样本及其历史版本">
      <template #extra>
        <a-button type="primary" @click="goToCreate">
          <template #icon><icon-plus /></template>
          新建样本表
        </a-button>
      </template>
    </a-page-header>

    <a-card class="list-card">
      <!-- 筛选区域 -->
      <a-row :gutter="24" class="search-form">
        <a-col :span="8">
          <a-form-item label="样本名称">
            <a-input v-model="searchForm.name" placeholder="请输入样本逻辑名称" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="创建人">
            <a-input v-model="searchForm.creator" placeholder="请输入创建人姓名" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="创建时间">
            <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 表格区域 -->
      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="样本表逻辑名称" data-index="logicName" />
          <a-table-column title="创建人" data-index="creator" />
          <a-table-column title="当前版本" data-index="version">
            <template #cell="{ record }">
              <a-tag color="arcoblue">{{ record.version }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="最近更新时间" data-index="updateTime" />
          <a-table-column title="最近运行时间" data-index="lastRunTime">
            <template #cell="{ record }">
              <span v-if="record.lastRunTime" style="color: var(--subapp-success);">{{ record.lastRunTime }}</span>
              <span v-else style="color: #86909C;">-</span>
            </template>
          </a-table-column>
          <a-table-column title="应用场景说明" data-index="description" ellipsis tooltip />
          <a-table-column title="操作" width="250">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" status="success" @click="handleRun(record)">运行</a-button>
                <a-button type="text" size="small" @click="showHistory(record)">历史版本</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 历史版本抽屉 -->
    <a-drawer :visible="historyVisible" @ok="historyVisible = false" @cancel="historyVisible = false" title="历史版本管理" width="600" :footer="false">
      <div v-if="currentHistoryRecord">
        <a-descriptions :column="1" bordered title="当前样本信息" style="margin-bottom: 20px">
          <a-descriptions-item label="样本名称">{{ currentHistoryRecord.logicName }}</a-descriptions-item>
          <a-descriptions-item label="当前版本">{{ currentHistoryRecord.version }}</a-descriptions-item>
        </a-descriptions>

        <a-timeline>
          <a-timeline-item v-for="(ver, index) in historyVersions" :key="index" :label="ver.time">
            <template #dot>
              <icon-check-circle v-if="index === 0" style="color: var(--subapp-success); font-size: 16px" />
              <icon-clock-circle v-else style="font-size: 16px" />
            </template>
            <div class="version-content">
              <div class="version-header">
                <span class="version-tag">{{ ver.version }}</span>
                <span class="version-operator">{{ ver.operator }}</span>
              </div>
              <div class="version-desc">{{ ver.description }}</div>
              <div class="version-actions" style="margin-top: 8px">
                <a-button type="secondary" size="mini" @click="handleRollback(ver)">回滚至此版本</a-button>
                <a-button type="text" size="mini" @click="handleViewVersion(ver)">查看详情</a-button>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-drawer>

    <!-- 新建/编辑抽屉 (父组件控制壳子) -->
    <a-drawer
      :visible="createDrawerVisible"
      :width="800"
      title="新建样本表"
      @cancel="createDrawerVisible = false"
      @ok="handleCreateSubmit"
      :ok-loading="createRef?.isSubmitting"
      ok-text="创建并校验"
    >
      <SamplePreparationCreate 
        ref="createRef"
        @success="handleDrawerSuccess"
      />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconRefresh, IconCheckCircle, IconClockCircle } from '@arco-design/web-vue/es/icon'
import SamplePreparationCreate from './SamplePreparationCreate.vue'

const router = useRouter()
const createRef = ref()

// 搜索表单
const searchForm = reactive({
  name: '',
  creator: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 模拟数据生成
const generateMockData = () => {
  const data = []
  const lastRunTimes = [
    '2025-01-28 14:30:00',
    '2025-01-27 09:15:00',
    null,
    '2025-01-26 18:45:00',
    '2025-01-25 11:20:00',
    null,
    '2025-01-24 16:00:00',
    '2025-01-23 10:30:00',
    null,
    '2025-01-22 08:45:00'
  ]
  for (let i = 0; i < 10; i++) {
    data.push({
      id: `sample_${i + 1}`,
      logicName: `sample_risk_model_v${i + 1}`,
      creator: ['张三', '李四', '王五'][i % 3],
      version: `V1.${i}`,
      updateTime: '2023-10-27 10:30:00',
      lastRunTime: lastRunTimes[i],
      description: '用于风险控制模型的离线训练样本数据，包含用户基础信息和行为特征。',
      status: 'active'
    })
  }
  return data
}

// 页面加载
onMounted(() => {
  handleSearch()
})

// 查询操作
const handleSearch = () => {
  loading.value = true
  // 模拟接口请求
  setTimeout(() => {
    tableData.value = generateMockData().filter(item => {
      const matchName = !searchForm.name || item.logicName.includes(searchForm.name)
      const matchCreator = !searchForm.creator || item.creator.includes(searchForm.creator)
      return matchName && matchCreator
    })
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

// 重置操作
const handleReset = () => {
  searchForm.name = ''
  searchForm.creator = ''
  searchForm.dateRange = []
  handleSearch()
}

// 分页切换
const onPageChange = (current: number) => {
  pagination.current = current
  handleSearch()
}

// 跳转新建
const goToCreate = () => {
  createDrawerVisible.value = true
}

// 编辑操作
const handleEdit = (record: any) => {
  createDrawerVisible.value = true
  // 实际场景中，这里应调用子组件的 loadData 方法或传入 props
}

// 新建抽屉相关
const createDrawerVisible = ref(false)
const handleCreateSubmit = () => {
  if (createRef.value) {
    createRef.value.handleSubmit()
  }
}

const handleDrawerSuccess = () => {
  createDrawerVisible.value = false
  handleSearch() // 刷新列表
}

// 运行操作
const handleRun = (record: any) => {
  Message.loading('正在启动样本计算任务...')
  setTimeout(() => {
    Message.success(`样本 [${record.logicName}] 运行任务已提交`)
  }, 1000)
}

// 历史版本相关
const historyVisible = ref(false)
const currentHistoryRecord = ref<any>(null)
const historyVersions = ref<any[]>([])

const showHistory = (record: any) => {
  currentHistoryRecord.value = record
  // 模拟获取历史版本数据
  historyVersions.value = [
    { version: record.version, time: '2023-10-27 10:30:00', operator: record.creator, description: '更新了部分特征字段，优化了数据清洗规则' },
    { version: 'V1.1', time: '2023-10-20 15:20:00', operator: record.creator, description: '新增了用户行为埋点数据源' },
    { version: 'V1.0', time: '2023-10-01 09:00:00', operator: '系统管理员', description: '初始版本创建' }
  ]
  historyVisible.value = true
}

const handleRollback = (version: any) => {
  Message.info(`正在申请回滚至版本 ${version.version}...`)
}

const handleViewVersion = (version: any) => {
  Message.info(`查看版本 ${version.version} 详情`)
}
</script>

<style scoped>
.sample-preparation-list {
  padding: 0 16px;
}

.list-card {
  margin-top: 20px;
  min-height: 500px;
}

.search-form {
  margin-bottom: 20px;
}

.version-content {
  background-color: var(--color-fill-2);
  padding: 12px;
  border-radius: 4px;
}

.version-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.version-tag {
  font-weight: bold;
  color: rgb(var(--primary-6));
}

.version-operator {
  color: var(--color-text-3);
  font-size: 12px;
}

.version-desc {
  color: var(--color-text-2);
  font-size: 13px;
  margin-bottom: 8px;
}
</style>
