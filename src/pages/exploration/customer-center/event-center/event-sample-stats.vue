<template>
  <div class="event-sample-stats">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <h2 class="page-title">{{ eventName }} - 抽样统计</h2>
          <span class="page-description">查看事件发生情况和完整报文数据</span>
        </div>
        <div class="header-actions">
          <a-button size="small" @click="goBack">
            <template #icon><icon-arrow-left /></template>
            返回
          </a-button>
        </div>
      </div>
    </div>

    <a-card class="content-card" :bordered="false">
      <!-- 搜索区域 -->
      <div class="search-section">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-input 
              v-model="searchForm.userId" 
              placeholder="请输入用户唯一标识"
              allow-clear
              @press-enter="handleSearch"
            >
              <template #prefix>
                <icon-search style="color: var(--color-text-3)" />
              </template>
            </a-input>
          </a-col>
          <a-col :span="8">
            <a-range-picker 
              v-model="searchForm.timeRange"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              :placeholder="['开始时间', '结束时间']"
              style="width: 100%"
            />
          </a-col>
          <a-col :span="8">
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><icon-search /></template>
                搜索
              </a-button>
              <a-button @click="resetSearch">
                <template #icon><icon-refresh /></template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>

      <!-- 统计图表区域 -->
      <div class="stats-section">
        <a-card title="分时段统计" size="small" class="chart-card">
          <div ref="chartContainer" class="chart-container"></div>
        </a-card>
      </div>

      <!-- 事件列表区域 -->
      <div class="table-section">
        <a-card title="事件详情" size="small">
          <a-table 
            :data="tableData" 
            :loading="loading" 
            :pagination="{
              ...pagination,
              showTotal: true,
              showPageSize: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              size: 'small'
            }"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
            size="small"
            :scroll="{ x: 1000 }"
          >
            <template #columns>
              <a-table-column title="时间" data-index="timestamp" :width="160">
                <template #cell="{ record }">
                  <span style="font-size: 12px;">{{ record.timestamp }}</span>
                </template>
              </a-table-column>
              <a-table-column title="用户ID" data-index="userId" :width="120">
                <template #cell="{ record }">
                  <a-tag color="blue" size="small">{{ record.userId }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="事件类型" data-index="eventType" :width="100">
                <template #cell="{ record }">
                  <a-tag size="small">{{ record.eventType }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="getStatusColor(record.status)" size="small">{{ record.status }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="100" fixed="right">
                <template #cell="{ record }">
                  <a-button type="text" size="mini" @click="viewMessage(record)">
                    <icon-eye />
                    查看报文
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </div>
    </a-card>

    <!-- 报文详情弹窗 -->
    <a-modal 
      v-model:visible="messageModalVisible" 
      title="完整报文" 
      width="800px"
      :footer="false"
    >
      <div class="message-content">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="事件ID">{{ currentMessage.eventId }}</a-descriptions-item>
          <a-descriptions-item label="用户ID">{{ currentMessage.userId }}</a-descriptions-item>
          <a-descriptions-item label="时间戳">{{ currentMessage.timestamp }}</a-descriptions-item>
          <a-descriptions-item label="事件类型">{{ currentMessage.eventType }}</a-descriptions-item>
        </a-descriptions>
        
        <div class="json-content">
          <h4>完整报文内容：</h4>
          <pre class="json-viewer">{{ formatJson(currentMessage.rawData) }}</pre>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconSearch, 
  IconRefresh, 
  IconArrowLeft,
  IconEye
} from '@arco-design/web-vue/es/icon'
import * as echarts from 'echarts'

// 路由相关
const router = useRouter()
const route = useRoute()

// 页面状态
const loading = ref(false)
const eventName = ref(route.query.eventName || '未知事件')
const eventId = ref(route.query.eventId || '')
const chartContainer = ref(null)
const messageModalVisible = ref(false)

// 搜索表单
const searchForm = reactive({
  userId: '',
  timeRange: []
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref([])

// 当前查看的报文
const currentMessage = ref({})

// 图表实例
let chartInstance = null

// 模拟数据生成
const generateSampleData = () => {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    data.push({
      id: `EVT${Math.random().toString(36).substr(2, 9)}`,
      eventId: eventId.value,
      userId: `USER${Math.random().toString(36).substr(2, 6)}`,
      timestamp: timestamp.toISOString().replace('T', ' ').substr(0, 19),
      eventType: ['登录', '购买', '浏览', '收藏', '分享'][Math.floor(Math.random() * 5)],
      status: ['成功', '失败'][Math.floor(Math.random() * 2)],
      rawData: {
        eventId: eventId.value,
        userId: `USER${Math.random().toString(36).substr(2, 6)}`,
        timestamp: timestamp.toISOString(),
        eventType: 'user_action',
        properties: {
          action: ['login', 'purchase', 'browse', 'favorite', 'share'][Math.floor(Math.random() * 5)],
          platform: ['web', 'mobile', 'app'][Math.floor(Math.random() * 3)],
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: Math.random().toString(36).substr(2, 16),
          referrer: 'https://example.com',
          customData: {
            productId: Math.random().toString(36).substr(2, 8),
            category: 'electronics',
            price: Math.floor(Math.random() * 1000) + 100
          }
        }
      }
    })
  }
  
  return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

// 生成时间统计数据
const generateTimeStats = () => {
  const hours = []
  const counts = []
  
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, '0')}:00`)
    counts.push(Math.floor(Math.random() * 100) + 10)
  }
  
  return { hours, counts }
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return
  
  chartInstance = echarts.init(chartContainer.value)
  const { hours, counts } = generateTimeStats()
  
  const option = {
    title: {
      text: '24小时事件发生次数统计',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '事件次数'
    },
    series: [{
      name: '事件次数',
      type: 'line',
      smooth: true,
      data: counts,
      itemStyle: {
        color: '#165dff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(22, 93, 255, 0.3)'
          }, {
            offset: 1, color: 'rgba(22, 93, 255, 0.1)'
          }]
        }
      }
    }]
  }
  
  chartInstance.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let data = generateSampleData()
    
    // 根据搜索条件过滤
    if (searchForm.userId) {
      data = data.filter(item => item.userId.includes(searchForm.userId))
    }
    
    if (searchForm.timeRange && searchForm.timeRange.length === 2) {
      const [startTime, endTime] = searchForm.timeRange
      data = data.filter(item => {
        const itemTime = new Date(item.timestamp)
        return itemTime >= startTime && itemTime <= endTime
      })
    }
    
    // 分页处理
    pagination.total = data.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = data.slice(start, end)
    
  } catch (error) {
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.userId = ''
  searchForm.timeRange = []
  pagination.current = 1
  fetchData()
}

// 分页处理
const onPageChange = (page) => {
  pagination.current = page
  fetchData()
}

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchData()
}

// 查看报文
const viewMessage = (record) => {
  currentMessage.value = record
  messageModalVisible.value = true
}

// 格式化JSON
const formatJson = (obj) => {
  return JSON.stringify(obj, null, 2)
}

// 获取状态颜色
const getStatusColor = (status) => {
  return status === '成功' ? 'green' : 'red'
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 页面初始化
onMounted(async () => {
  await fetchData()
  await nextTick()
  initChart()
})
</script>

<style scoped>
.event-sample-stats {
  padding: 12px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  font-size: 13px;
  color: #86909c;
}

.content-card {
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.search-section {
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.stats-section {
  margin-bottom: 16px;
}

.chart-card {
  margin-bottom: 0;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.table-section {
  margin-bottom: 0;
}

.message-content {
  max-height: 600px;
  overflow-y: auto;
}

.json-content {
  margin-top: 16px;
}

.json-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #1d2129;
}

.json-viewer {
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 400px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 表格样式优化 */
:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 500;
  padding: 8px 12px;
  font-size: 13px;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f2f3f5;
  padding: 8px 12px;
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

/* 卡片样式 */
:deep(.arco-card-header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f2f3f5;
}

:deep(.arco-card-body) {
  padding: 16px;
}
</style>