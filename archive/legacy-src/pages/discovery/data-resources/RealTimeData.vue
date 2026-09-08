<template>
  <div class="data-map-container">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">实时数据源</h1>
        </div>
        <p class="banner-subtitle">实时数据资源的注册与监控，支持Kafka、MQ等消息队列及流式数据的统一管理。</p>
        
        <div class="search-area">
          <a-input-search 
            v-model="searchKeyword"
            class="main-search-input"
            placeholder="输入Topic名称、集群或负责人进行搜索"
            search-button
            size="large"
            allow-clear
            @search="handleSearch"
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>
          
          <div class="search-filters-inline">
            <a-select
              v-model="engineType"
              placeholder="引擎类型"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="kafka">Kafka</a-option>
              <a-option value="rocketmq">RocketMQ</a-option>
              <a-option value="rabbitmq">RabbitMQ</a-option>
              <a-option value="flink">Flink</a-option>
            </a-select>
            <a-select
              v-model="envType"
              placeholder="所属环境"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="prod">生产环境</a-option>
              <a-option value="uat">UAT环境</a-option>
              <a-option value="test">测试环境</a-option>
            </a-select>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="decoration-cube"></div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-content">
      <div class="content-section">
        <div class="section-header">
          <div class="header-left">
            <h3 class="section-title">实时数据源列表</h3>
            <span class="result-count">共找到 {{ pagination.total }} 个实时数据源</span>
          </div>
        </div>

        <a-spin :loading="loading" style="width: 100%">
          <a-empty v-if="sourceList.length === 0" description="未找到相关实时数据源" />
          <a-row :gutter="[20, 20]" v-else>
            <a-col 
              v-for="source in sourceList" 
              :key="source.id" 
              :xs="24" :sm="12" :md="8" :lg="8" :xl="6"
            >
              <a-card hoverable class="system-card">
                <div class="card-header">
                  <div class="header-info">
                    <span class="system-name" :title="source.name">{{ source.name }}</span>
                    <div class="tags-row">
                      <a-tag size="mini" :color="getEngineColor(source.engineType)">{{ source.engineName }}</a-tag>
                      <a-tag size="mini" color="gray">{{ source.envName }}</a-tag>
                    </div>
                  </div>
                  <div class="status-badge" :class="source.status">
                    {{ source.status === 'active' ? '正常生产' : '积压告警' }}
                  </div>
                </div>
                
                <div class="card-body">
                  <p class="description" :title="source.description">{{ source.description || '暂无描述' }}</p>
                  
                  <div class="stats-row">
                    <div class="stat-item">
                      <span class="stat-val">{{ source.cluster }}</span>
                      <span class="stat-label">所属集群</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                      <span class="stat-val">{{ source.qps }}</span>
                      <span class="stat-label">峰值QPS</span>
                    </div>
                  </div>

                  <div class="meta-row">
                    <span class="meta-item"><icon-user /> {{ source.owner }}</span>
                    <span class="meta-item"><icon-clock-circle /> {{ source.updateTime }}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <a-button type="text" size="mini" @click="viewDetail(source)">详情</a-button>
                  <a-button type="text" size="mini" @click="viewMonitor(source)">消费监控</a-button>
                </div>
              </a-card>
            </a-col>
          </a-row>
          
          <div class="pagination-wrapper" v-if="sourceList.length > 0">
            <a-pagination
              :total="pagination.total"
              :current="pagination.current"
              :page-size="pagination.pageSize"
              show-total
              show-jumper
              @change="onPageChange"
              @page-size-change="onPageSizeChange"
            />
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconSearch, IconPlus, IconUser, IconClockCircle
} from '@arco-design/web-vue/es/icon'

const searchKeyword = ref('')
const engineType = ref('')
const envType = ref('')
const loading = ref(false)

const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 12
})

// 模拟数据
const mockSources = [
  {
    id: 1,
    name: 'topic_trade_orders_realtime',
    engineType: 'kafka',
    engineName: 'Kafka',
    envType: 'prod',
    envName: '生产环境',
    status: 'active',
    description: '核心交易系统实时订单流水，用于实时风控和实时大屏计算。',
    cluster: 'kafka-core-prod',
    qps: '15.2k',
    owner: '李架构',
    updateTime: '2023-11-20'
  },
  {
    id: 2,
    name: 'topic_user_behavior_logs',
    engineType: 'kafka',
    engineName: 'Kafka',
    envType: 'prod',
    envName: '生产环境',
    status: 'active',
    description: 'APP端用户点击、浏览、搜索等行为日志实时采集。',
    cluster: 'kafka-log-prod',
    qps: '85.5k',
    owner: '张数据',
    updateTime: '2023-11-19'
  },
  {
    id: 3,
    name: 'topic_risk_alert_events',
    engineType: 'rocketmq',
    engineName: 'RocketMQ',
    envType: 'prod',
    envName: '生产环境',
    status: 'error',
    description: '风控引擎实时产出的风险告警事件，供下游业务系统订阅阻断。',
    cluster: 'rmq-risk-prod',
    qps: '2.1k',
    owner: '王风控',
    updateTime: '2023-11-18'
  },
  {
    id: 4,
    name: 'topic_marketing_push_uat',
    engineType: 'rabbitmq',
    engineName: 'RabbitMQ',
    envType: 'uat',
    envName: 'UAT环境',
    status: 'active',
    description: '营销系统消息推送测试Topic。',
    cluster: 'rmq-market-uat',
    qps: '150',
    owner: '赵测试',
    updateTime: '2023-11-15'
  }
]

const sourceList = ref<any[]>([])

const getEngineColor = (type: string) => {
  const map: Record<string, string> = {
    kafka: 'orangered',
    rocketmq: 'arcoblue',
    rabbitmq: 'orange',
    flink: 'purple'
  }
  return map[type] || 'gray'
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    sourceList.value = mockSources.filter(src => {
      const keywordMatch = !searchKeyword.value || src.name.includes(searchKeyword.value) || src.cluster.includes(searchKeyword.value)
      const typeMatch = !engineType.value || src.engineType === engineType.value
      const envMatch = !envType.value || src.envType === envType.value
      return keywordMatch && typeMatch && envMatch
    })
    pagination.value.total = sourceList.value.length
    loading.value = false
  }, 500)
}

const handleFilterChange = () => {
  handleSearch()
}

const onPageChange = (current: number) => {
  pagination.value.current = current
}

const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
}

const handleRegister = () => {
  Message.info('打开注册Topic弹窗')
}

const viewDetail = (source: any) => {
  Message.info(`查看 ${source.name} 详情`)
}

const viewMonitor = (source: any) => {
  Message.info(`查看 ${source.name} 消费监控`)
}

const configSource = (source: any) => {
  Message.info(`申请订阅 ${source.name}`)
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
/* 完全复用 BusinessSystem.vue 的样式 */
.data-map-container {
  min-height: 100vh;
  background: #f7f8fa;
}

.banner-section {
  background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%);
  padding: 40px 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.banner-content {
  width: 100%;
  max-width: 1800px;
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 40% 0 40px;
  box-sizing: border-box;
}

.banner-title {
  font-size: 40px;
  font-weight: bold;
  color: #1d2129;
  margin: 0 0 16px 0;
}

.banner-subtitle {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 32px;
  max-width: 600px;
}

.search-area {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  max-width: 900px;
  flex-wrap: wrap;
}

.main-search-input {
  flex: 1;
  min-width: 400px;
  background: #fff;
  border-radius: 30px;
  border: 1px solid #165DFF;
  box-shadow: 0 4px 10px rgba(22, 93, 255, 0.1);
}

.main-search-input :deep(.arco-input-wrapper) {
  border-radius: 30px;
  padding-left: 20px;
  background: #fff;
}

.main-search-input :deep(.arco-input-search-btn) {
  border-radius: 0 30px 30px 0;
  background: transparent;
  color: #165DFF;
  border-left: 1px solid #f2f3f5;
}

.search-filters-inline {
  display: flex;
  gap: 12px;
}

.filter-select {
  background: #fff;
  border-radius: 4px;
}

/* Main Content */
.main-content {
  padding: 0 40px 40px;
  width: 100%;
  max-width: 1800px;
  margin: -40px auto 0;
  position: relative;
  z-index: 3;
}

.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.result-count {
  font-size: 13px;
  color: #86909c;
  margin-left: 12px;
}

/* System Card */
.system-card {
  border-radius: 8px;
  transition: all 0.2s;
  background: #fff;
  border: 1px solid #e5e6eb;
  height: 100%;
}

.system-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #165DFF;
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.header-info {
  flex: 1;
  overflow: hidden;
}

.system-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  display: block;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-row {
  display: flex;
  gap: 6px;
}

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #e8ffea;
  color: #00b42a;
}
.status-badge.error {
  background: #ffece8;
  color: #f53f3f;
}

.description {
  color: #86909c;
  font-size: 13px;
  line-height: 1.5;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7f8fa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-val {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: #e5e6eb;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86909c;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>