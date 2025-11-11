<template>
  <div class="budget-alerts">
    <a-card title="预算预警">
      <template #extra>
        <a-space>
          <a-select v-model="alertLevel" placeholder="预警级别" style="width: 120px" @change="handleAlertLevelChange">
            <a-option value="all">全部</a-option>
            <a-option value="info">一般</a-option>
            <a-option value="warning">警告</a-option>
            <a-option value="danger">严重</a-option>
          </a-select>
          <a-select v-model="alertStatus" placeholder="状态" style="width: 120px" @change="handleStatusChange">
            <a-option value="all">全部</a-option>
            <a-option value="active">活跃</a-option>
            <a-option value="resolved">已解决</a-option>
          </a-select>
          <a-button @click="handleRefresh">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
          <a-button @click="handleBack">
            <template #icon><icon-arrow-left /></template>
            返回
          </a-button>
        </a-space>
      </template>

      <!-- 预警统计 -->
      <a-row :gutter="16" style="margin-bottom: 20px">
        <a-col :span="6">
          <a-statistic
            title="活跃预警"
            :value="alertStats.active"
            :value-from="0"
            animation
          >
            <template #prefix>
              <icon-warning style="color: #ff7d00" />
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="一般预警"
            :value="alertStats.info"
            :value-from="0"
            animation
          >
            <template #prefix>
              <icon-info-circle style="color: #3491fa" />
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="警告预警"
            :value="alertStats.warning"
            :value-from="0"
            animation
          >
            <template #prefix>
              <icon-exclamation-circle style="color: #ff7d00" />
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="严重预警"
            :value="alertStats.danger"
            :value-from="0"
            animation
          >
            <template #prefix>
              <icon-close-circle style="color: #f53f3f" />
            </template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 预警列表 -->
      <a-table
        :data="alertData"
        :columns="alertColumns"
        :pagination="paginationConfig"
        :loading="loading"
        row-key="id"
      >
        <template #level="{ record }">
          <a-tag :color="getAlertLevelColor(record.level)">
            {{ getAlertLevelText(record.level) }}
          </a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="getAlertStatusColor(record.status)">
            {{ getAlertStatusText(record.status) }}
          </a-tag>
        </template>
        <template #threshold="{ record }">
          <span>{{ record.threshold }}%</span>
        </template>
        <template #currentValue="{ record }">
          <span>{{ record.currentValue }}%</span>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="text" @click="handleView(record)">
              <template #icon><icon-eye /></template>
              查看
            </a-button>
            <a-button 
              v-if="record.status === 'active'" 
              type="text" 
              @click="handleResolve(record)"
            >
              <template #icon><icon-check /></template>
              解决
            </a-button>
            <a-button type="text" status="danger" @click="handleDelete(record)">
              <template #icon><icon-delete /></template>
              删除
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 预警详情对话框 -->
    <a-modal
      v-model:visible="alertModal.visible"
      :title="'预警详情'"
      :footer="false"
    >
      <a-descriptions :data="alertModal.data" :column="2" bordered />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { budgetApiService } from '@/api/budget'

const router = useRouter()

const alertLevel = ref('all')
const alertStatus = ref('all')
const loading = ref(false)

const alertStats = reactive({
  active: 0,
  info: 0,
  warning: 0,
  danger: 0
})

const alertData = ref([])

const alertColumns = [
  { title: '预警类型', dataIndex: 'type', width: 120 },
  { title: '预警级别', dataIndex: 'level', slotName: 'level', width: 80 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '预算科目', dataIndex: 'subject', width: 150 },
  { title: '阈值', dataIndex: 'threshold', slotName: 'threshold', width: 80 },
  { title: '当前值', dataIndex: 'currentValue', slotName: 'currentValue', width: 80 },
  { title: '描述', dataIndex: 'description' },
  { title: '创建时间', dataIndex: 'createdAt', width: 160 },
  { title: '操作', slotName: 'action', width: 120 }
]

const paginationConfig = {
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
}

const alertModal = reactive({
  visible: false,
  data: []
})

const getAlertLevelColor = (level) => {
  const colors = {
    'info': 'blue',
    'warning': 'orange',
    'danger': 'red'
  }
  return colors[level] || 'blue'
}

const getAlertLevelText = (level) => {
  const texts = {
    'info': '一般',
    'warning': '警告',
    'danger': '严重'
  }
  return texts[level] || '未知'
}

const getAlertStatusColor = (status) => {
  const colors = {
    'active': 'red',
    'resolved': 'green'
  }
  return colors[status] || 'blue'
}

const getAlertStatusText = (status) => {
  const texts = {
    'active': '活跃',
    'resolved': '已解决'
  }
  return texts[status] || '未知'
}

const handleAlertLevelChange = () => {
  loadAlertData()
}

const handleStatusChange = () => {
  loadAlertData()
}

const handleRefresh = () => {
  loadAlertData()
}

const handleBack = () => {
  router.push('/budget/overview')
}

const handleView = (record) => {
  alertModal.visible = true
  alertModal.data = [
    { label: '预警类型', value: record.type },
    { label: '预警级别', value: getAlertLevelText(record.level) },
    { label: '状态', value: getAlertStatusText(record.status) },
    { label: '预算科目', value: record.subject },
    { label: '阈值', value: `${record.threshold}%` },
    { label: '当前值', value: `${record.currentValue}%` },
    { label: '描述', value: record.description },
    { label: '创建时间', value: record.createdAt },
    { label: '更新时间', value: record.updatedAt }
  ]
}

const handleResolve = async (record) => {
  try {
    await budgetApiService.resolveBudgetAlert(record.id)
    await loadAlertData()
  } catch (error) {
    console.error('解决预警失败:', error)
  }
}

const handleDelete = async (record) => {
  try {
    await budgetApiService.deleteBudgetAlert(record.id)
    await loadAlertData()
  } catch (error) {
    console.error('删除预警失败:', error)
  }
}

const loadAlertData = async () => {
  loading.value = true
  try {
    const params = {
      level: alertLevel.value === 'all' ? null : alertLevel.value,
      status: alertStatus.value === 'all' ? null : alertStatus.value
    }
    
    const alerts = await budgetApiService.getBudgetAlerts(params)
    alertData.value = alerts

    // 统计预警数据
    alertStats.active = alerts.filter(alert => alert.status === 'active').length
    alertStats.info = alerts.filter(alert => alert.level === 'info').length
    alertStats.warning = alerts.filter(alert => alert.level === 'warning').length
    alertStats.danger = alerts.filter(alert => alert.level === 'danger').length
  } catch (error) {
    console.error('加载预警数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAlertData()
})
</script>

<style scoped>
.budget-alerts {
  padding: 20px;
}
</style>