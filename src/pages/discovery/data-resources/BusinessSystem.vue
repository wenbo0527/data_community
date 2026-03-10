<template>
  <div class="data-map-container">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">业务系统</h1>
        </div>
        <p class="banner-subtitle">业务系统元数据采集与管理中心，支持对核心业务库表的自动发现与血缘追踪。</p>
        
        <div class="search-area">
          <a-input-search 
            v-model="searchKeyword"
            class="main-search-input"
            placeholder="输入系统名称、库名或负责人进行搜索"
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
              v-model="systemType"
              placeholder="系统类型"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="core">核心交易</a-option>
              <a-option value="risk">风控系统</a-option>
              <a-option value="marketing">营销系统</a-option>
              <a-option value="finance">财务系统</a-option>
            </a-select>
            <a-select
              v-model="dbType"
              placeholder="数据库类型"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="mysql">MySQL</a-option>
              <a-option value="oracle">Oracle</a-option>
              <a-option value="hive">Hive</a-option>
              <a-option value="mongo">MongoDB</a-option>
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
            <h3 class="section-title">系统列表</h3>
            <span class="result-count">共找到 {{ pagination.total }} 个业务系统</span>
          </div>
          <a-button type="primary" size="small" @click="handleRegister">
            <template #icon><icon-plus /></template>
            注册系统
          </a-button>
        </div>

        <a-spin :loading="loading" style="width: 100%">
          <a-empty v-if="systemList.length === 0" description="未找到相关业务系统" />
          <a-row :gutter="[20, 20]" v-else>
            <a-col 
              v-for="system in systemList" 
              :key="system.id" 
              :xs="24" :sm="12" :md="8" :lg="8" :xl="6"
            >
              <a-card hoverable class="system-card">
                <div class="card-header">
                  <div class="header-info">
                    <span class="system-name" :title="system.name">{{ system.name }}</span>
                    <div class="tags-row">
                      <a-tag size="mini" :color="getSystemColor(system.type)">{{ system.typeName }}</a-tag>
                      <a-tag size="mini" color="gray">{{ system.dbType }}</a-tag>
                    </div>
                  </div>
                  <div class="status-badge" :class="system.status">
                    {{ system.status === 'active' ? '运行中' : '维护中' }}
                  </div>
                </div>
                
                <div class="card-body">
                  <p class="description" :title="system.description">{{ system.description || '暂无描述' }}</p>
                  
                  <div class="stats-row">
                    <div class="stat-item">
                      <span class="stat-val">{{ system.tableCount }}</span>
                      <span class="stat-label">数据表</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                      <span class="stat-val">{{ system.apiCount }}</span>
                      <span class="stat-label">API接口</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                      <span class="stat-val">{{ system.storageSize }}</span>
                      <span class="stat-label">存储量</span>
                    </div>
                  </div>

                  <div class="meta-row">
                    <span class="meta-item"><icon-user /> {{ system.owner }}</span>
                    <span class="meta-item"><icon-clock-circle /> {{ system.updateTime }}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <a-button type="text" size="mini" @click="viewDetail(system)">详情</a-button>
                  <a-button type="text" size="mini" @click="viewTables(system)">表目录</a-button>
                  <a-button type="text" size="mini" @click="configSystem(system)">配置</a-button>
                </div>
              </a-card>
            </a-col>
          </a-row>
          
          <div class="pagination-wrapper" v-if="systemList.length > 0">
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
  IconSearch, IconPlus, IconUser, IconClockCircle,
  IconApps, IconSafe, IconDashboard, IconCommon
} from '@arco-design/web-vue/es/icon'

const searchKeyword = ref('')
const systemType = ref('')
const dbType = ref('')
const loading = ref(false)

const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 12
})

// 模拟数据
const mockSystems = [
  {
    id: 1,
    name: '核心交易系统',
    type: 'core',
    typeName: '核心交易',
    dbType: 'Oracle',
    status: 'active',
    description: '承载全行核心存款、贷款、支付结算等业务的主机系统。',
    tableCount: 1250,
    apiCount: 450,
    storageSize: '2.5TB',
    owner: '张架构',
    updateTime: '2023-11-15'
  },
  {
    id: 2,
    name: '信贷审批系统',
    type: 'core',
    typeName: '核心交易',
    dbType: 'MySQL',
    status: 'active',
    description: '负责个人及企业贷款的进件、审批、放款全流程管理。',
    tableCount: 860,
    apiCount: 210,
    storageSize: '800GB',
    owner: '李信贷',
    updateTime: '2023-11-14'
  },
  {
    id: 3,
    name: '智能风控平台',
    type: 'risk',
    typeName: '风控系统',
    dbType: 'Hive',
    status: 'active',
    description: '基于大数据的实时反欺诈与信用评估平台。',
    tableCount: 3200,
    apiCount: 120,
    storageSize: '150TB',
    owner: '王风控',
    updateTime: '2023-11-15'
  },
  {
    id: 4,
    name: '营销中台',
    type: 'marketing',
    typeName: '营销系统',
    dbType: 'MySQL',
    status: 'active',
    description: '统一管理客户权益、营销活动投放及效果分析。',
    tableCount: 450,
    apiCount: 85,
    storageSize: '320GB',
    owner: '赵营销',
    updateTime: '2023-11-10'
  }
]

const systemList = ref<any[]>([])

const getSystemIcon = (type: string) => {
  const map: Record<string, any> = {
    core: IconApps,
    risk: IconSafe,
    marketing: IconDashboard,
    finance: IconCommon
  }
  return map[type] || IconApps
}

const getSystemColor = (type: string) => {
  const map: Record<string, string> = {
    core: 'arcoblue',
    risk: 'orangered',
    marketing: 'purple',
    finance: 'cyan'
  }
  return map[type] || 'gray'
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    systemList.value = mockSystems.filter(sys => {
      const keywordMatch = !searchKeyword.value || sys.name.includes(searchKeyword.value)
      const typeMatch = !systemType.value || sys.type === systemType.value
      const dbMatch = !dbType.value || sys.dbType.toLowerCase() === dbType.value
      return keywordMatch && typeMatch && dbMatch
    })
    pagination.value.total = systemList.value.length
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
  Message.info('打开注册系统弹窗')
}

const viewDetail = (system: any) => {
  Message.info(`查看 ${system.name} 详情`)
}

const viewTables = (system: any) => {
  Message.info(`查看 ${system.name} 表目录`)
}

const configSystem = (system: any) => {
  Message.info(`配置 ${system.name}`)
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
/* 复用 TableList.vue 的基础样式结构 */
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