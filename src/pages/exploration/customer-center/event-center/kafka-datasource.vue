<template>
  <div class="kafka-datasource">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Kafka数据源管理</h1>
        <div class="page-stats">
          <span class="stat-item">总计: {{ totalDatasources }}</span>
          <span class="stat-item">在线: {{ onlineDatasources }}</span>
          <span class="stat-item">异常: {{ errorDatasources }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="search-area">
          <a-input 
            v-model="searchKeyword" 
            placeholder="搜索数据源名称或地址"
            allow-clear
            style="width: 280px"
            @change="handleSearch"
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </div>
        <div class="filter-area">
          <a-select 
            v-model="statusFilter" 
            placeholder="连接状态"
            style="width: 120px"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="">全部状态</a-option>
            <a-option value="connected">已连接</a-option>
            <a-option value="disconnected">未连接</a-option>
            <a-option value="error">连接异常</a-option>
          </a-select>
        </div>
        <div class="button-area">
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            新建数据源
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
        </div>
      </div>
    </div>

    <!-- 数据源列表 -->
    <div class="table-container">
      <a-table
        :data="filteredDatasources"
        :loading="loading"
        :pagination="paginationConfig"
        row-key="id"
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column type="selection" width="50" />
          
          <!-- 数据源信息 -->
          <a-table-column title="数据源信息" width="250">
            <template #cell="{ record }">
              <div class="datasource-info">
                <div class="datasource-name">{{ record.name }}</div>
                <div class="datasource-id">{{ record.id }}</div>
                <div class="bootstrap-servers" :title="record.bootstrapServers">
                  {{ record.bootstrapServers }}
                </div>
              </div>
            </template>
          </a-table-column>
          
          <!-- 连接状态 -->
          <a-table-column title="连接状态" width="120">
            <template #cell="{ record }">
              <div class="connection-status">
                <div class="status-indicator" :class="record.status">
                  <span class="status-dot"></span>
                  <span class="status-text">{{ getStatusText(record.status) }}</span>
                </div>
                <div class="status-time">{{ formatTime(record.updatedAt) }}</div>
              </div>
            </template>
          </a-table-column>
          
          <!-- 安全协议 -->
          <a-table-column title="安全协议" width="120">
            <template #cell="{ record }">
              <a-tag size="small">
                {{ record.securityProtocol }}
              </a-tag>
              <div v-if="record.saslMechanism" class="sasl-info">
                {{ record.saslMechanism }}
              </div>
            </template>
          </a-table-column>
          
          <!-- Topic信息 -->
          <a-table-column title="Topic信息" width="150">
            <template #cell="{ record }">
              <div class="topic-info">
                <div class="topic-count">{{ record.topics.length }} 个Topic</div>
                <div class="topic-partitions">
                  总计 {{ getTotalPartitions(record) }} 分区
                </div>
              </div>
            </template>
          </a-table-column>
          
          <!-- 消费监控 -->
          <a-table-column title="消费监控" width="180">
            <template #cell="{ record }">
              <div class="consumer-info">
                <div class="consumer-groups">
                  消费组: {{ getTotalConsumerGroups(record) }}
                </div>
                <div class="total-lag">
                  总延迟: {{ formatNumber(getTotalLag(record)) }}
                </div>
              </div>
            </template>
          </a-table-column>
          
          <!-- 创建信息 -->
          <a-table-column title="创建信息" width="160">
            <template #cell="{ record }">
              <div class="create-info">
                <div class="create-time">{{ formatTime(record.createdAt) }}</div>
                <div class="update-time">{{ formatTime(record.updatedAt) }}</div>
              </div>
            </template>
          </a-table-column>
          
          <!-- 操作 -->
          <a-table-column title="操作" fixed="right" width="200">
            <template #cell="{ record }">
              <div class="action-buttons">
                <a-button type="text" size="small" @click="handleEdit(record)">
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-button type="text" size="small" @click="handleTestConnection(record)">
                  <template #icon><icon-play-circle /></template>
                  测试
                </a-button>
                <a-button type="text" size="small" @click="handleMonitor(record)">
                  <template #icon><icon-bar-chart /></template>
                  监控
                </a-button>
                <a-popconfirm
                  content="确定要删除此数据源吗？"
                  @ok="handleDelete(record)"
                >
                  <a-button type="text" size="small" status="danger">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-button>
                </a-popconfirm>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 创建/编辑数据源模态框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="700px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <kafka-config-form
        v-if="modalVisible"
        :datasource-data="currentDatasource"
        @submit="handleFormSubmit"
        @cancel="handleModalCancel"
        @test-connection="handleTestConnectionSubmit"
      />
    </a-modal>

    <!-- 监控面板 -->
    <a-modal
      v-model:visible="monitorVisible"
      title="数据源监控"
      width="900px"
      :footer="false"
    >
      <div class="monitor-panel" v-if="currentMonitorDatasource">
        <div class="monitor-header">
          <h3>{{ currentMonitorDatasource.name }} - 实时监控</h3>
          <div class="monitor-controls">
            <a-radio-group v-model="monitorTimeRange" type="button" size="small">
              <a-radio value="1h">近1小时</a-radio>
              <a-radio value="6h">近6小时</a-radio>
              <a-radio value="24h">近24小时</a-radio>
            </a-radio-group>
            <a-button size="small" @click="refreshMonitor">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
          </div>
        </div>
        
        <div class="monitor-content">
          <a-row :gutter="24">
            <a-col :span="8">
              <div class="monitor-card">
                <div class="monitor-title">连接状态</div>
                <div class="monitor-value" :class="currentMonitorDatasource.status">
                  {{ getStatusText(currentMonitorDatasource.status) }}
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="monitor-card">
                <div class="monitor-title">消息吞吐量</div>
                <div class="monitor-value">{{ formatNumber(monitorData.throughput) }}/s</div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="monitor-card">
                <div class="monitor-title">总延迟</div>
                <div class="monitor-value">{{ formatNumber(monitorData.totalLag) }}</div>
              </div>
            </a-col>
          </a-row>
          
          <div class="monitor-chart">
            <div ref="monitorChartRef" class="chart-container"></div>
          </div>
          
          <div class="topic-list">
            <h4>Topic详情</h4>
            <a-table :data="currentMonitorDatasource.topics" size="small">
              <template #columns>
                <a-table-column title="Topic名称" data-index="name" />
                <a-table-column title="分区数" data-index="partitions" />
                <a-table-column title="副本数" data-index="replicationFactor" />
                <a-table-column title="操作">
                  <template #cell="{ record }">
                    <a-button type="text" size="mini" @click="viewTopicDetails(record)">
                      详情
                    </a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Message } from '@arco-design/web-vue'
import { mockEventAPI } from '@/mock/event'
import KafkaConfigForm from './components/KafkaConfigForm.vue'
import {
  IconSearch,
  IconPlus,
  IconRefresh,
  IconEdit,
  IconDelete,
  IconPlayCircle,
  IconBarChart
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const datasources = ref([])
const searchKeyword = ref('')
const statusFilter = ref('')
const selectedRows = ref([])
const modalVisible = ref(false)
const modalTitle = ref('')
const currentDatasource = ref(null)
const monitorVisible = ref(false)
const currentMonitorDatasource = ref(null)
const monitorTimeRange = ref('1h')
const monitorData = reactive({
  throughput: 0,
  totalLag: 0
})

// 图表引用
const monitorChartRef = ref(null)
let monitorChart = null

// 分页配置
const paginationConfig = reactive({
  total: 0,
  current: 1,
  pageSize: 20,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 计算属性
const filteredDatasources = computed(() => {
  let filtered = datasources.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(ds => 
      ds.name.toLowerCase().includes(keyword) ||
      ds.bootstrapServers.toLowerCase().includes(keyword)
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(ds => ds.status === statusFilter.value)
  }

  return filtered
})

const totalDatasources = computed(() => datasources.value.length)
const onlineDatasources = computed(() => datasources.value.filter(ds => ds.status === 'connected').length)
const errorDatasources = computed(() => datasources.value.filter(ds => ds.status === 'error').length)

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const data = await mockEventAPI.getKafkaDatasources()
    datasources.value = data
    paginationConfig.total = data.length
    Message.success('Kafka数据源加载成功')
  } catch (error) {
    Message.error('Kafka数据源加载失败')
    console.error('加载Kafka数据源失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const handleFilter = () => {
  // 过滤逻辑已在computed中处理
}

const handleCreate = () => {
  currentDatasource.value = null
  modalTitle.value = '创建Kafka数据源'
  modalVisible.value = true
}

const handleEdit = (record) => {
  currentDatasource.value = { ...record }
  modalTitle.value = '编辑Kafka数据源'
  modalVisible.value = true
}

const handleTestConnection = (record) => {
  Message.info('正在测试连接...')
  setTimeout(() => {
    Message.success('连接测试成功')
  }, 2000)
}

const handleMonitor = (record) => {
  currentMonitorDatasource.value = record
  monitorVisible.value = true
  
  nextTick(() => {
    initMonitorChart()
    refreshMonitor()
  })
}

const handleDelete = async (record) => {
  loading.value = true
  try {
    // 模拟删除操作
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = datasources.value.findIndex(ds => ds.id === record.id)
    if (index > -1) {
      datasources.value.splice(index, 1)
    }
    Message.success('数据源删除成功')
  } catch (error) {
    Message.error('数据源删除失败')
    console.error('删除数据源失败:', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handlePageChange = (page) => {
  paginationConfig.current = page
}

const handlePageSizeChange = (pageSize) => {
  paginationConfig.pageSize = pageSize
  paginationConfig.current = 1
}

const handleModalOk = () => {
  // 表单提交逻辑在KafkaConfigForm组件中处理
}

const handleModalCancel = () => {
  modalVisible.value = false
  currentDatasource.value = null
}

const handleFormSubmit = async (formData) => {
  try {
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (currentDatasource.value) {
      // 编辑模式
      const index = datasources.value.findIndex(ds => ds.id === currentDatasource.value.id)
      if (index > -1) {
        datasources.value[index] = { ...datasources.value[index], ...formData }
      }
      Message.success('数据源更新成功')
    } else {
      // 创建模式
      const newDatasource = {
        ...formData,
        id: `KAFKA${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'disconnected',
        topics: []
      }
      datasources.value.unshift(newDatasource)
      Message.success('数据源创建成功')
    }
    
    modalVisible.value = false
  } catch (error) {
    Message.error('操作失败')
    console.error('保存数据源失败:', error)
  }
}

const handleTestConnectionSubmit = async (formData) => {
  Message.info('正在测试连接...')
  try {
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 2000))
    Message.success('连接测试成功')
  } catch (error) {
    Message.error('连接测试失败')
    console.error('测试连接失败:', error)
  }
}

// 监控相关方法
const initMonitorChart = () => {
  if (!monitorChartRef.value) return
  
  monitorChart = echarts.init(monitorChartRef.value)
  
  const option = {
    title: {
      text: '消息吞吐量趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: generateTimeLabels()
    },
    yAxis: {
      type: 'value',
      name: '消息数/秒'
    },
    series: [
      {
        name: '吞吐量',
        type: 'line',
        data: generateThroughputData(),
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
            { offset: 1, color: 'rgba(22, 93, 255, 0.1)' }
          ])
        }
      }
    ]
  }
  
  monitorChart.setOption(option)
}

const refreshMonitor = () => {
  // 模拟监控数据刷新
  monitorData.throughput = Math.floor(Math.random() * 10000) + 1000
  monitorData.totalLag = Math.floor(Math.random() * 100000) + 10000
  
  if (monitorChart) {
    monitorChart.resize()
  }
}

const viewTopicDetails = (topic) => {
  Message.info(`查看Topic详情: ${topic.name}`)
}

// 工具函数
const getStatusText = (status) => {
  const statusMap = {
    'connected': '已连接',
    'disconnected': '未连接',
    'error': '连接异常'
  }
  return statusMap[status] || status
}

const getTotalPartitions = (datasource) => {
  return datasource.topics.reduce((total, topic) => total + topic.partitions, 0)
}

const getTotalConsumerGroups = (datasource) => {
  return datasource.topics.reduce((total, topic) => total + topic.consumerGroups.length, 0)
}

const getTotalLag = (datasource) => {
  return datasource.topics.reduce((total, topic) => {
    return total + topic.consumerGroups.reduce((lag, group) => lag + group.lag, 0)
  }, 0)
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatTime = (timeString) => {
  return new Date(timeString).toLocaleString('zh-CN')
}

const generateTimeLabels = () => {
  const labels = []
  const now = new Date()
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    labels.push(time.getHours() + ':00')
  }
  
  return labels
}

const generateThroughputData = () => {
  const data = []
  for (let i = 0; i < 24; i++) {
    data.push(Math.floor(Math.random() * 5000) + 1000)
  }
  return data
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.kafka-datasource {
  height: 100%;
  background: #F2F3F5;
  display: flex;
  flex-direction: column;
}

/* 页面头部样式 */
.page-header {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E6EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.page-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 14px;
  color: #4E5969;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-area {
  display: flex;
  align-items: center;
}

.filter-area {
  display: flex;
  gap: 8px;
}

.button-area {
  display: flex;
  gap: 8px;
}

/* 表格容器 */
.table-container {
  flex: 1;
  background: white;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: auto;
}

/* 表格样式优化 */
:deep(.arco-table) {
  border-radius: 8px;
}

:deep(.arco-table-th) {
  background: #F2F3F5 !important;
  font-weight: 600;
  color: #1D2129;
}

/* 数据源信息样式 */
.datasource-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.datasource-name {
  font-weight: 500;
  color: #1D2129;
  font-size: 14px;
}

.datasource-id {
  font-size: 12px;
  color: #8A8E99;
  font-family: monospace;
}

.bootstrap-servers {
  font-size: 12px;
  color: #4E5969;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* 连接状态样式 */
.connection-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.connected .status-dot {
  background: #00B42A;
}

.status-indicator.disconnected .status-dot {
  background: #C9CDD4;
}

.status-indicator.error .status-dot {
  background: #F53F3F;
}

.status-text {
  font-size: 13px;
  font-weight: 500;
}

.status-indicator.connected .status-text {
  color: #00B42A;
}

.status-indicator.disconnected .status-text {
  color: #4E5969;
}

.status-indicator.error .status-text {
  color: #F53F3F;
}

.status-time {
  font-size: 12px;
  color: #8A8E99;
}

/* 安全协议样式 */
.sasl-info {
  font-size: 12px;
  color: #4E5969;
  margin-top: 4px;
}

/* Topic信息样式 */
.topic-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.topic-count {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}

.topic-partitions {
  font-size: 12px;
  color: #4E5969;
}

/* 消费监控样式 */
.consumer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.consumer-groups {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}

.total-lag {
  font-size: 12px;
  color: #4E5969;
}

/* 创建信息样式 */
.create-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.create-time {
  font-size: 12px;
  color: #8A8E99;
}

.update-time {
  font-size: 12px;
  color: #8A8E99;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .arco-btn {
  padding: 4px 8px;
  font-size: 13px;
}

/* 监控面板样式 */
.monitor-panel {
  padding: 20px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.monitor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
}

.monitor-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.monitor-content {
  margin-top: 24px;
}

.monitor-card {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #E5E6EB;
}

.monitor-title {
  font-size: 14px;
  color: #4E5969;
  margin-bottom: 8px;
}

.monitor-value {
  font-size: 24px;
  font-weight: 700;
  color: #1D2129;
}

.monitor-value.connected {
  color: #00B42A;
}

.monitor-value.error {
  color: #F53F3F;
}

.monitor-chart {
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #E5E6EB;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.topic-list {
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #E5E6EB;
}

.topic-list h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

/* 专业桌面端优化 */
@media screen and (min-width: 1920px) {
  .page-header {
    padding: 24px 32px;
  }
  
  .table-container {
    margin: 24px;
  }
  
  .monitor-panel {
    padding: 32px;
  }
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>