<template>
  <div class="query-mode-panel">
    <div class="panel-header">
      <h3 class="panel-title">查询模式</h3>
      <p class="panel-description">通过可视化画布查询和分析任务流程数据</p>
    </div>

    <div class="query-controls">
      <div class="control-section">
        <h4 class="section-title">查询条件</h4>
        <div class="control-row">
          <a-space wrap>
            <a-select v-model="queryParams.taskType" placeholder="任务类型" style="width: 150px;">
              <a-option value="all">全部类型</a-option>
              <a-option value="促实名">促实名</a-option>
              <a-option value="促授信">促授信</a-option>
              <a-option value="促支用">促支用</a-option>
            </a-select>
            
            <a-select v-model="queryParams.status" placeholder="任务状态" style="width: 150px;">
              <a-option value="all">全部状态</a-option>
              <a-option value="draft">草稿</a-option>
              <a-option value="running">运行中</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="disabled">停用</a-option>
            </a-select>
            
            <a-range-picker v-model="queryParams.dateRange" placeholder="时间范围" style="width: 300px;" />
            
            <a-button type="primary" @click="executeQuery" :loading="queryLoading">
              <template #icon>
                <IconSearch />
              </template>
              查询
            </a-button>
            
            <a-button @click="resetQuery">
              <template #icon>
                <IconRefresh />
              </template>
              重置
            </a-button>
          </a-space>
        </div>
      </div>

      <div class="control-section">
        <h4 class="section-title">节点类型筛选</h4>
        <div class="control-row">
          <a-checkbox-group v-model="queryParams.nodeTypes" @change="onNodeTypeChange">
            <a-checkbox value="start">开始节点</a-checkbox>
            <a-checkbox value="crowd-split">人群分流</a-checkbox>
            <a-checkbox value="event-split">事件分流</a-checkbox>
            <a-checkbox value="sms">短信发送</a-checkbox>
            <a-checkbox value="push">推送</a-checkbox>
            <a-checkbox value="email">邮件</a-checkbox>
            <a-checkbox value="manual-call">人工外呼</a-checkbox>
            <a-checkbox value="end">结束节点</a-checkbox>
          </a-checkbox-group>
        </div>
      </div>
    </div>

    <div class="query-results">
      <div class="results-header">
        <h4 class="section-title">查询结果</h4>
        <div class="results-stats">
          <a-statistic title="匹配任务" :value="queryResults.length" />
          <a-statistic title="总节点数" :value="totalNodes" />
          <a-statistic title="总连接数" :value="totalConnections" />
        </div>
      </div>

      <div class="results-content">
        <a-tabs v-model:active-key="resultsTab" type="card">
          <a-tab-pane key="list" title="列表视图">
            <a-table 
              :columns="resultColumns" 
              :data="queryResults" 
              :pagination="{ pageSize: 10 }"
              size="small"
            >
              <template #taskName="{ record }">
                <a-link @click="viewTaskCanvas(record)">{{ record.taskName }}</a-link>
              </template>
              
              <template #nodeCount="{ record }">
                <a-tag color="blue">{{ record.nodeCount }} 个节点</a-tag>
              </template>
              
              <template #connectionCount="{ record }">
                <a-tag color="green">{{ record.connectionCount }} 个连接</a-tag>
              </template>
              
              <template #actions="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="viewTaskCanvas(record)">
                    查看画布
                  </a-button>
                  <a-button type="text" size="small" @click="analyzeTask(record)">
                    分析
                  </a-button>
                </a-space>
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="canvas" title="画布视图">
            <div class="canvas-preview">
              <div class="canvas-grid">
                <div 
                  v-for="task in queryResults.slice(0, 6)" 
                  :key="task.id"
                  class="canvas-item"
                  @click="viewTaskCanvas(task)"
                >
                  <div class="canvas-header">
                    <h5>{{ task.taskName }}</h5>
                    <a-tag :color="getStatusColor(task.status)" size="small">
                      {{ getStatusText(task.status) }}
                    </a-tag>
                  </div>
                  <div class="canvas-preview-area">
                    <svg width="200" height="120" class="mini-canvas">
                      <!-- 简化的节点和连接预览 -->
                      <g v-for="(node, index) in task.canvasData?.nodes?.slice(0, 4)" :key="node.id">
                        <circle 
                          :cx="40 + (index % 2) * 60" 
                          :cy="30 + Math.floor(index / 2) * 40"
                          r="15"
                          :fill="getNodeColor(node.type)"
                          stroke="#fff"
                          stroke-width="2"
                        />
                        <text 
                          :x="40 + (index % 2) * 60" 
                          :y="35 + Math.floor(index / 2) * 40"
                          text-anchor="middle"
                          font-size="8"
                          fill="#fff"
                        >
                          {{ getNodeIcon(node.type) }}
                        </text>
                      </g>
                      <!-- 连接线 -->
                      <g v-for="(conn, index) in task.canvasData?.connections?.slice(0, 3)" :key="index">
                        <line 
                          x1="55" y1="30" 
                          x2="85" y2="30"
                          stroke="#1890ff"
                          stroke-width="1"
                          marker-end="url(#arrowhead)"
                        />
                      </g>
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                          refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#1890ff" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                  <div class="canvas-stats">
                    <span>{{ task.nodeCount }} 节点</span>
                    <span>{{ task.connectionCount }} 连接</span>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon'
import { TaskStorage } from '../utils/taskStorage.js'
import MockDataGenerator from '../utils/mockDataGenerator.js'

// Props定义
const props = defineProps({
  canvasData: {
    type: Object,
    default: () => ({ nodes: [], connections: [] })
  },
  graph: {
    type: Object,
    default: null
  }
})

// 查询参数
const queryParams = reactive({
  taskType: 'all',
  status: 'all',
  dateRange: [],
  nodeTypes: []
})

// 查询状态
const queryLoading = ref(false)
const resultsTab = ref('list')

// 查询结果
const queryResults = ref([])

// 计算属性
const totalNodes = computed(() => {
  return queryResults.value.reduce((sum, task) => sum + (task.nodeCount || 0), 0)
})

const totalConnections = computed(() => {
  return queryResults.value.reduce((sum, task) => sum + (task.connectionCount || 0), 0)
})

// 表格列定义
const resultColumns = [
  {
    title: '任务名称',
    dataIndex: 'taskName',
    slotName: 'taskName',
    width: 200
  },
  {
    title: '类型',
    dataIndex: 'taskType',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }) => {
      const colorMap = {
        draft: 'blue',
        running: 'green',
        completed: 'green',
        disabled: 'red'
      }
      const textMap = {
        draft: '草稿',
        running: '运行中',
        completed: '已完成',
        disabled: '停用'
      }
      return h('a-tag', { color: colorMap[record.status] }, textMap[record.status])
    }
  },
  {
    title: '节点数',
    dataIndex: 'nodeCount',
    slotName: 'nodeCount',
    width: 100
  },
  {
    title: '连接数',
    dataIndex: 'connectionCount',
    slotName: 'connectionCount',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150
  }
]

// 执行查询
const executeQuery = async () => {
  queryLoading.value = true
  
  try {
    // 获取所有任务数据
    const allTasks = await getAllTasksData()
    
    // 应用筛选条件
    let filteredTasks = allTasks
    
    // 按任务类型筛选
    if (queryParams.taskType !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.taskType === queryParams.taskType)
    }
    
    // 按状态筛选
    if (queryParams.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === queryParams.status)
    }
    
    // 按节点类型筛选
    if (queryParams.nodeTypes.length > 0) {
      filteredTasks = filteredTasks.filter(task => {
        const taskNodeTypes = task.canvasData?.nodes?.map(node => node.type) || []
        return queryParams.nodeTypes.some(type => taskNodeTypes.includes(type))
      })
    }
    
    // 计算节点和连接数量
    filteredTasks = filteredTasks.map(task => ({
      ...task,
      nodeCount: task.canvasData?.nodes?.length || 0,
      connectionCount: task.canvasData?.connections?.length || 0
    }))
    
    queryResults.value = filteredTasks
    
    Message.success(`查询完成，找到 ${filteredTasks.length} 个匹配的任务`)
  } catch (error) {
    console.error('查询失败:', error)
    Message.error('查询失败，请重试')
  } finally {
    queryLoading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryParams.taskType = 'all'
  queryParams.status = 'all'
  queryParams.dateRange = []
  queryParams.nodeTypes = []
  queryResults.value = []
}

// 节点类型变化处理
const onNodeTypeChange = (values) => {
  console.log('节点类型筛选变化:', values)
}

// 获取所有任务数据
const getAllTasksData = async () => {
  // 从本地存储获取任务
  const storedTasks = TaskStorage.getAllTasks()
  
  // 生成Mock数据
  const mockTasks = MockDataGenerator.generateQueryMockData()
  
  // 转换格式
  const convertedStoredTasks = storedTasks.map(task => ({
    id: task.id,
    taskName: task.name || '未命名任务',
    taskType: task.type || '未分类',
    status: task.status || 'draft',
    createTime: task.createTime || new Date().toLocaleString('zh-CN'),
    canvasData: task.canvasData || { nodes: [], connections: [] }
  }))
  
  return [...convertedStoredTasks, ...mockTasks]
}

// 查看任务画布
const viewTaskCanvas = (task) => {
  console.log('查看任务画布:', task)
  // 这里可以打开画布编辑器或预览模式
  Message.info('画布查看功能开发中...')
}

// 分析任务
const analyzeTask = (task) => {
  console.log('分析任务:', task)
  Message.info('任务分析功能开发中...')
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'blue',
    running: 'green',
    completed: 'green',
    disabled: 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    running: '运行中',
    completed: '已完成',
    disabled: '停用'
  }
  return textMap[status] || '未知'
}

// 获取节点颜色
const getNodeColor = (nodeType) => {
  const colorMap = {
    start: '#52c41a',
    end: '#f5222d',
    'crowd-split': '#1890ff',
    'event-split': '#722ed1',
    sms: '#fa8c16',
    push: '#13c2c2',
    email: '#eb2f96',
    'manual-call': '#faad14'
  }
  return colorMap[nodeType] || '#666'
}

// 获取节点图标
const getNodeIcon = (nodeType) => {
  const iconMap = {
    start: '▶',
    end: '⏹',
    'crowd-split': '⚡',
    'event-split': '🔀',
    sms: '📱',
    push: '🔔',
    email: '📧',
    'manual-call': '📞'
  }
  return iconMap[nodeType] || '●'
}

// 初始化
onMounted(() => {
  executeQuery()
})
</script>

<style scoped>
.query-mode-panel {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.panel-description {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.query-controls {
  margin-bottom: 24px;
}

.control-section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.control-row {
  margin-bottom: 12px;
}

.query-results {
  margin-top: 24px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.results-stats {
  display: flex;
  gap: 24px;
}

.results-content {
  min-height: 400px;
}

.canvas-preview {
  padding: 16px;
}

.canvas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.canvas-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.canvas-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.canvas-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.canvas-preview-area {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  background: #fafafa;
  border-radius: 4px;
  padding: 8px;
}

.mini-canvas {
  border-radius: 4px;
}

.canvas-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8c8c8c;
}
</style>