<template>
  <div class="data-map-container">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">外部数据源</h1>
        </div>
        <p class="banner-subtitle">外部数据资源的统一接入与管理，包括征信、运营商、三方数据等。</p>
        
        <div class="search-area">
          <a-input-search 
            v-model="searchKeyword"
            class="main-search-input"
            placeholder="输入数据源名称、供应商或负责人进行搜索"
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
              v-model="sourceType"
              placeholder="数据类型"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="credit">征信数据</a-option>
              <a-option value="telecom">运营商数据</a-option>
              <a-option value="business">工商数据</a-option>
              <a-option value="other">其他三方</a-option>
            </a-select>
            <a-select
              v-model="accessType"
              placeholder="接入方式"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="api">API接口</a-option>
              <a-option value="file">文件传输</a-option>
              <a-option value="db">直连库</a-option>
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
            <h3 class="section-title">数据源列表</h3>
            <span class="result-count">共找到 {{ pagination.total }} 个外部数据源</span>
          </div>
        </div>

        <a-spin :loading="loading" style="width: 100%">
          <a-empty v-if="sourceList.length === 0" description="未找到相关外部数据源" />
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
                      <a-tag size="mini" :color="getSourceColor(source.type)">{{ source.typeName }}</a-tag>
                      <a-tag size="mini" color="gray">{{ source.accessTypeName }}</a-tag>
                    </div>
                  </div>
                  <div class="status-badge" :class="source.status">
                    {{ source.status === 'active' ? '正常接入' : '异常断连' }}
                  </div>
                </div>
                
                <div class="card-body">
                  <p class="description" :title="source.description">{{ source.description || '暂无描述' }}</p>
                  
                  <div class="stats-row">
                    <div class="stat-item">
                      <span class="stat-val">{{ source.provider }}</span>
                      <span class="stat-label">供应商</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                      <span class="stat-val">{{ source.callCount }}</span>
                      <span class="stat-label">本月调用</span>
                    </div>
                  </div>

                  <div class="meta-row">
                    <span class="meta-item"><icon-user /> {{ source.owner }}</span>
                    <span class="meta-item"><icon-clock-circle /> {{ source.updateTime }}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <a-button type="text" size="mini" @click="viewDetail(source)">详情</a-button>
                  <a-button type="text" size="mini" @click="viewData(source)">数据预览</a-button>
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
const sourceType = ref('')
const accessType = ref('')
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
    name: '人行二代征信报告',
    type: 'credit',
    typeName: '征信数据',
    accessType: 'api',
    accessTypeName: 'API接口',
    status: 'active',
    description: '提供个人及企业的基础信用信息、信贷记录及公共记录查询服务。',
    provider: '央行征信中心',
    callCount: '12.5w次',
    owner: '张风控',
    updateTime: '2023-11-20'
  },
  {
    id: 2,
    name: '运营商三要素核验',
    type: 'telecom',
    typeName: '运营商数据',
    accessType: 'api',
    accessTypeName: 'API接口',
    status: 'active',
    description: '验证姓名、身份证号、手机号是否一致，支持三大运营商。',
    provider: '聚信立',
    callCount: '35.2w次',
    owner: '李业务',
    updateTime: '2023-11-19'
  },
  {
    id: 3,
    name: '全国企业工商信息',
    type: 'business',
    typeName: '工商数据',
    accessType: 'file',
    accessTypeName: '文件传输',
    status: 'active',
    description: '企业工商登记信息、股东信息、变更记录的每日批量更新。',
    provider: '企查查',
    callCount: '30批次',
    owner: '王数据',
    updateTime: '2023-11-18'
  },
  {
    id: 4,
    name: '多头借贷风险名单',
    type: 'other',
    typeName: '其他三方',
    accessType: 'api',
    accessTypeName: 'API接口',
    status: 'error',
    description: '同盾提供的多平台借贷风险名单查询服务。',
    provider: '同盾科技',
    callCount: '8.1w次',
    owner: '赵合规',
    updateTime: '2023-11-15'
  }
]

const sourceList = ref<any[]>([])

const getSourceColor = (type: string) => {
  const map: Record<string, string> = {
    credit: 'arcoblue',
    telecom: 'green',
    business: 'orange',
    other: 'purple'
  }
  return map[type] || 'gray'
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    sourceList.value = mockSources.filter(src => {
      const keywordMatch = !searchKeyword.value || src.name.includes(searchKeyword.value) || src.provider.includes(searchKeyword.value)
      const typeMatch = !sourceType.value || src.type === sourceType.value
      const accessMatch = !accessType.value || src.accessType === accessType.value
      return keywordMatch && typeMatch && accessMatch
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
  Message.info('打开接入数据源弹窗')
}

const viewDetail = (source: any) => {
  Message.info(`查看 ${source.name} 详情`)
}

const viewData = (source: any) => {
  Message.info(`预览 ${source.name} 数据`)
}

const configSource = (source: any) => {
  Message.info(`配置 ${source.name}`)
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