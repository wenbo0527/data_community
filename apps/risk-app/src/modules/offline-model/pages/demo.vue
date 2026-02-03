<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>数字风险平台 - 离线模型模块演示</h1>
      <p>基于Vue 3 + TypeScript + Arco Design + AntV X6的完整前端解决方案</p>
    </div>
    
    <div class="demo-content">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-card title="🎯 模块功能" class="feature-card">
            <ul>
              <li>✅ 特征中心 - 特征数据管理</li>
              <li>✅ 模型注册 - 机器学习模型管理</li>
              <li>✅ 模型回溯 - 历史版本追踪</li>
              <li>✅ 任务管理 - 模型训练任务监控</li>
              <li>✅ 模型评估 - 模型性能评估分析</li>
            </ul>
            <a-button type="primary" @click="goToModule" style="width: 100%; margin-top: 16px;">
              进入离线模型模块
            </a-button>
          </a-card>
        </a-col>
        
        <a-col :span="8">
          <a-card title="🔧 技术特性" class="tech-card">
            <ul>
              <li>📦 Vue 3 Composition API</li>
              <li>🎨 Arco Design组件库</li>
              <li>📊 ECharts图表集成</li>
              <li>🗃️ Pinia状态管理</li>
              <li>🛣️ Vue Router路由</li>
              <li>🎭 Mock数据服务</li>
              <li>📱 响应式设计</li>
              <li>🎯 TypeScript支持</li>
            </ul>
          </a-card>
        </a-col>
        
        <a-col :span="8">
          <a-card title="📊 数据概览" class="stats-card">
            <div class="stat-item">
              <div class="stat-label">总特征数</div>
              <div class="stat-value">{{ stats.totalFeatures }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">注册模型</div>
              <div class="stat-value">{{ stats.totalModels }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">运行任务</div>
              <div class="stat-value">{{ stats.runningTasks }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">评估记录</div>
              <div class="stat-value">{{ stats.totalEvaluations }}</div>
            </div>
            <a-button @click="loadStats" style="width: 100%; margin-top: 16px;">
              刷新数据
            </a-button>
          </a-card>
        </a-col>
      </a-row>
      
      <a-row :gutter="24" style="margin-top: 24px;">
        <a-col :span="12">
          <a-card title="📈 功能演示" class="demo-card">
            <a-space direction="vertical" style="width: 100%">
              <a-button @click="showFeatureDemo = !showFeatureDemo">
                {{ showFeatureDemo ? '隐藏' : '显示' }}特征中心演示
              </a-button>
              <a-button @click="showModelDemo = !showModelDemo">
                {{ showModelDemo ? '隐藏' : '显示' }}模型注册演示
              </a-button>
              <a-button @click="showChartDemo = !showChartDemo">
                {{ showChartDemo ? '隐藏' : '显示' }}图表组件演示
              </a-button>
            </a-space>
            
            <!-- 特征中心演示 -->
            <div v-if="showFeatureDemo" class="demo-section">
              <h4>特征中心数据</h4>
              <CommonTable
                :data="featureDemoData"
                :columns="featureDemoColumns"
                :show-pagination="false"
              />
            </div>
            
            <!-- 模型注册演示 -->
            <div v-if="showModelDemo" class="demo-section">
              <h4>模型注册数据</h4>
              <CommonTable
                :data="modelDemoData"
                :columns="modelDemoColumns"
                :show-pagination="false"
              />
            </div>
            
            <!-- 图表演示 -->
            <div v-if="showChartDemo" class="demo-section">
              <h4>模型性能趋势</h4>
              <CommonChart
                type="line"
                :data="chartDemoData"
                title="模型准确率趋势"
                :height="250"
              />
            </div>
          </a-card>
        </a-col>
        
        <a-col :span="12">
          <a-card title="🎯 快速开始" class="quickstart-card">
            <a-timeline mode="left">
              <a-timeline-item>
                <template #label>步骤 1</template>
                <div>访问特征中心，查看和管理特征数据</div>
              </a-timeline-item>
              <a-timeline-item>
                <template #label>步骤 2</template>
                <div>在模型注册页面创建新的机器学习模型</div>
              </a-timeline-item>
              <a-timeline-item>
                <template #label>步骤 3</template>
                <div>使用模型回溯功能查看历史版本</div>
              </a-timeline-item>
              <a-timeline-item>
                <template #label>步骤 4</template>
                <div>通过任务管理监控模型训练进度</div>
              </a-timeline-item>
              <a-timeline-item>
                <template #label>步骤 5</template>
                <div>在模型评估页面分析模型性能</div>
              </a-timeline-item>
            </a-timeline>
            
            <a-divider />
            
            <div class="quick-actions">
              <a-space>
                <a-button type="primary" @click="goToFeatureCenter">
                  特征中心
                </a-button>
                <a-button @click="goToModelRegister">
                  模型注册
                </a-button>
                <a-button @click="goToTaskManagement">
                  任务管理
                </a-button>
              </a-space>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import CommonTable from '@/components/offlineModel/CommonTable.vue'
import CommonChart from '@/components/offlineModel/CommonChart.vue'
import { featureAPI, modelAPI } from '@/modules/offline-model/api'

const router = useRouter()

// 响应式数据
const stats = reactive({
  totalFeatures: 0,
  totalModels: 0,
  runningTasks: 0,
  totalEvaluations: 0
})

const showFeatureDemo = ref(false)
const showModelDemo = ref(false)
const showChartDemo = ref(false)

// 演示数据
const featureDemoData = ref([])
const modelDemoData = ref([])
const chartDemoData = ref([])

const featureDemoColumns = ref([
  { title: '特征名称', dataIndex: 'name', width: 150 },
  { title: '特征类型', dataIndex: 'type', width: 100 },
  { title: '状态', dataIndex: 'status', width: 80, dataType: 'status' }
])

const modelDemoColumns = ref([
  { title: '模型名称', dataIndex: 'name', width: 150 },
  { title: '模型类型', dataIndex: 'type', width: 100 },
  { title: '准确率', dataIndex: 'accuracy', width: 80 },
  { title: '状态', dataIndex: 'status', width: 80, dataType: 'status' }
])

// 生命周期
onMounted(() => {
  loadStats()
  loadDemoData()
})

// 方法
const loadStats = async () => {
  try {
    const [featureStats, modelStats] = await Promise.all([
      featureAPI.getFeatureStats(),
      modelAPI.getModelStats()
    ])
    
    if (featureStats.success) {
      stats.totalFeatures = featureStats.data.totalFeatures
    }
    
    if (modelStats.success) {
      stats.totalModels = modelStats.data.totalModels
      stats.runningTasks = modelStats.data.trainingModels
    }
    
    stats.totalEvaluations = Math.floor(Math.random() * 50) + 10 // 模拟数据
  } catch (error) {
    Message.error('加载统计数据失败')
  }
}

const loadDemoData = async () => {
  try {
    // 加载特征演示数据
    const featureResponse = await featureAPI.getFeatures({ page: 1, pageSize: 5 })
    if (featureResponse.success) {
      featureDemoData.value = featureResponse.data.data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status
      }))
    }
    
    // 加载模型演示数据
    const modelResponse = await modelAPI.getModels({ page: 1, pageSize: 5 })
    if (modelResponse.success) {
      modelDemoData.value = modelResponse.data.data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        accuracy: item.accuracy + '%',
        status: item.status
      }))
    }
    
    // 生成图表演示数据
    chartDemoData.value = [
      { name: '1月', value: Math.floor(Math.random() * 20) + 80 },
      { name: '2月', value: Math.floor(Math.random() * 20) + 80 },
      { name: '3月', value: Math.floor(Math.random() * 20) + 80 },
      { name: '4月', value: Math.floor(Math.random() * 20) + 80 },
      { name: '5月', value: Math.floor(Math.random() * 20) + 80 },
      { name: '6月', value: Math.floor(Math.random() * 20) + 80 }
    ]
  } catch (error) {
    Message.error('加载演示数据失败')
  }
}

const goToModule = () => {
  router.push('/model-offline-analysis/feature-center')
}

const goToFeatureCenter = () => {
  router.push('/model-offline-analysis/feature-center')
}

const goToModelRegister = () => {
  router.push('/model-offline-analysis/model-register')
}

const goToTaskManagement = () => {
  router.push('/model-offline-analysis/task-management')
}
</script>

<style scoped lang="less">
.demo-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
  
  .demo-header {
    text-align: center;
    margin-bottom: 32px;
    
    h1 {
      color: #333;
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    p {
      color: #666;
      font-size: 16px;
    }
  }
  
  .demo-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .feature-card,
  .tech-card,
  .stats-card,
  .demo-card,
  .quickstart-card {
    height: 100%;
    
    ul {
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
        color: #666;
      }
    }
  }
  
  .stats-card {
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .stat-label {
        color: #666;
        font-size: 14px;
      }
      
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #1890ff;
      }
    }
  }
  
  .demo-section {
    margin-top: 24px;
    padding: 16px;
    background: #fafafa;
    border-radius: 4px;
    
    h4 {
      margin-bottom: 16px;
      color: #333;
    }
  }
  
  .quick-actions {
    text-align: center;
    margin-top: 16px;
  }
}
</style>