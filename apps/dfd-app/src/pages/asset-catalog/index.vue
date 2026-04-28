<template>
  <div class="data-map-container">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">资产目录</h1>
        </div>
        <p class="banner-subtitle">全域数据资产的统一检索与管理入口，支持按业务域、主题域快速定位数据表。</p>
        
        <div class="search-area">
          <a-input-search 
            v-model="searchKeyword"
            class="main-search-input"
            placeholder="输入表名、字段名或描述进行搜索"
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
              v-model="businessDomain"
              placeholder="业务域"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option v-for="theme in assetThemes" :key="theme.name" :value="theme.name">{{ theme.name }}</a-option>
            </a-select>
            <a-select
              v-model="tableType"
              placeholder="资产类型"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="fact">事实表</a-option>
              <a-option value="dim">维度表</a-option>
              <a-option value="dws">汇总表</a-option>
              <a-option value="dwd">明细表</a-option>
              <a-option value="metric">指标</a-option>
              <a-option value="variable">变量</a-option>
              <a-option value="feature">特征</a-option>
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
      <!-- 资产主题区域 (默认展示) -->
      <div v-if="!hasSearchQuery" class="content-section">
        <div class="section-header">
          <h3 class="section-title">数据资产主题</h3>
          <span class="section-subtitle">按业务域划分的数据资产集合</span>
        </div>
        
        <a-row :gutter="[16, 16]">
          <a-col 
            v-for="theme in assetThemes" 
            :key="theme.name" 
            :xs="24" :sm="12" :md="12" :lg="8" :xl="6"
          >
            <a-card 
              class="collection-card" 
              hoverable 
              @click="handleThemeClick(theme)"
            >
              <div class="card-content">
                <div class="card-title">
                  <h4 class="title-text" :title="theme.name">
                    {{ theme.name }}
                  </h4>
                  <div class="title-actions" style="margin-left: 12px;">
                    <div class="theme-icon-box-small" :class="getThemeColorClass(theme.name)">
                      <component :is="getIconComponent(theme.icon)" />
                    </div>
                  </div>
                </div>
                
                <div class="collection-stats">
                  <a-tag size="small" color="arcoblue">业务域</a-tag>
                  <span class="table-count">{{ theme.count }} 资产</span>
                </div>
              
                <p class="card-description" :title="theme.description || `包含${theme.name}相关的核心数据资产`">
                  {{ theme.description || `包含${theme.name}相关的核心数据资产` }}
                </p>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 搜索结果列表 (搜索后展示) -->
      <div v-else class="content-section">
        <div class="section-header">
          <div class="header-left">
            <h3 class="section-title">搜索结果</h3>
            <span class="result-count">共找到 {{ pagination.total }} 条相关数据资产</span>
          </div>
          <a-button type="text" size="small" @click="clearSearch">
            <template #icon><icon-close /></template>
            清空搜索
          </a-button>
        </div>

        <a-spin :loading="loading" style="width: 100%">
          <a-empty v-if="tableData.length === 0" description="未找到相关数据资产" />
          <a-row :gutter="[16, 16]" v-else>
            <a-col 
              v-for="record in tableData" 
              :key="record.name" 
              :xs="24" :sm="12" :md="12" :lg="8" :xl="6"
            >
              <a-card 
                class="collection-card" 
                hoverable 
                @click="showTableDetail(record)"
              >
                <div class="card-content">
                  <div class="card-title">
                    <h4 class="title-text" :title="record.name">
                      {{ record.name }}
                    </h4>
                    <div class="title-actions">
                      <a-tooltip content="申请权限">
                        <a-button 
                          type="text" 
                          size="mini" 
                          @click.stop="requestPermission(record)"
                          class="permission-btn"
                        >
                          <icon-lock />
                        </a-button>
                      </a-tooltip>
                      <a-button 
                        type="text" 
                        size="mini" 
                        @click.stop="addToFavorite(record)"
                      >
                        <icon-star />
                      </a-button>
                    </div>
                  </div>
                  
                  <div class="collection-stats">
                    <a-tag size="small" :color="record.type === '维度表' ? 'blue' : (record.type === '事实表' ? 'green' : 'arcoblue')">
                      {{ record.type || '数据表' }}
                    </a-tag>
                    <span class="table-count">{{ record.domain }}</span>
                  </div>
                
                  <p class="card-description" :title="record.description || '暂无描述'">
                    {{ record.description || '暂无描述' }}
                  </p>
                </div>
              </a-card>
            </a-col>
          </a-row>
          
          <div class="pagination-wrapper" v-if="tableData.length > 0">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconClose, IconSearch,
  IconUserGroup, IconBranch, IconCommon, IconNotification,
  IconSafe, IconPublic, IconLock, IconStar
} from '@arco-design/web-vue/es/icon'

// 模拟主题数据
const mockDataAssets = [
  { name: '用户域', icon: 'icon-user-group', count: 128, description: '用户注册、登录、行为等用户核心数据资产' },
  { name: '交易域', icon: 'icon-branch', count: 256, description: '订单、支付、退款等交易全流程数据资产' },
  { name: '商品域', icon: 'icon-common', count: 84, description: '商品信息、库存、价格等商品数据资产' },
  { name: '营销域', icon: 'icon-notification', count: 62, description: '营销活动、优惠券、用户触达等营销数据资产' },
  { name: '风控域', icon: 'icon-safe', count: 95, description: '风控模型、欺诈检测、信用评估等风控数据资产' },
  { name: '财务域', icon: 'icon-branch', count: 48, description: '账单、结算、对账等财务数据资产' },
  { name: '供应链域', icon: 'icon-public', count: 37, description: '采购、库存、物流等供应链数据资产' },
  { name: '公共域', icon: 'icon-common', count: 112, description: '时间维表、地区维表等公共数据资产' }
]

// 模拟表格数据
const tableMockData = [
  { name: 'dwd_trade_order', type: '明细表', domain: '交易域', description: '交易订单明细宽表', updateTime: '2024-04-15', owner: '数据平台组' },
  { name: 'dws_trade daily', type: '汇总表', domain: '交易域', description: '交易每日汇总表', updateTime: '2024-04-14', owner: '数据平台组' },
  { name: 'dim_user_info', type: '维度表', domain: '用户域', description: '用户信息维度表', updateTime: '2024-04-10', owner: '数据平台组' },
  { name: 'dwd_risk_event', type: '明细表', domain: '风控域', description: '风控事件明细表', updateTime: '2024-04-12', owner: '风控组' },
  { name: 'dws_mkt_campaign', type: '汇总表', domain: '营销域', description: '营销活动汇总表', updateTime: '2024-04-11', owner: '营销组' },
  { name: 'dim_product', type: '维度表', domain: '商品域', description: '商品维度表', updateTime: '2024-04-09', owner: '商品组' },
  { name: 'dwd_finance_settle', type: '明细表', domain: '财务域', description: '财务结算明细表', updateTime: '2024-04-13', owner: '财务组' },
  { name: 'dws_user_behavior', type: '汇总表', domain: '用户域', description: '用户行为每日汇总', updateTime: '2024-04-14', owner: '数据平台组' },
  { name: 'fact_core_indicator', type: '事实表', domain: '风控域', description: '核心指标事实表', updateTime: '2024-04-08', owner: '风控组' },
  { name: 'dim_time', type: '维度表', domain: '公共域', description: '时间维度表', updateTime: '2024-01-01', owner: '数据平台组' },
  { name: 'dwd_supply_chain', type: '明细表', domain: '供应链域', description: '供应链明细表', updateTime: '2024-04-07', owner: '供应链组' },
  { name: 'dws_product_sales', type: '汇总表', domain: '商品域', description: '商品销售汇总表', updateTime: '2024-04-12', owner: '商品组' }
]

interface TableItem {
  name: string
  type: string
  description: string
  updateTime: string
  domain?: string
  owner?: string
}

const route = useRoute()
const router = useRouter()
const searchKeyword = ref('')
const businessDomain = ref('')
const tableType = ref('')
const loading = ref(false)
const tableData = ref<TableItem[]>([])
const assetThemes = ref(mockDataAssets)

const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 12,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
})

const hasSearchQuery = computed(() => {
  return !!(searchKeyword.value || businessDomain.value || tableType.value)
})

// 图标组件映射
const iconMap: Record<string, any> = {
  'icon-user-group': IconUserGroup,
  'icon-transaction': IconBranch,
  'icon-common': IconCommon,
  'icon-notification': IconNotification,
  'icon-shield': IconSafe,
  'icon-safe': IconSafe,
  'icon-branch': IconBranch,
  'icon-public': IconPublic
}

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || IconCommon
}

const getThemeColorClass = (name: string) => {
  const colorMap: Record<string, string> = {
    '用户域': 'theme-blue',
    '交易域': 'theme-green',
    '商品域': 'theme-orange',
    '营销域': 'theme-red',
    '风控域': 'theme-purple',
    '财务域': 'theme-cyan',
    '供应链域': 'theme-arcoblue',
    '公共域': 'theme-gray'
  }
  return colorMap[name] || 'theme-blue'
}

const handleThemeClick = (theme: any) => {
  businessDomain.value = theme.name
  handleSearch()
}

onMounted(() => {
  const { keyword, domain, type } = route.query
  if (keyword) searchKeyword.value = keyword as string
  if (domain) businessDomain.value = domain as string
  if (type) tableType.value = type as string
  
  if (hasSearchQuery.value) handleSearch()
})

const clearSearch = () => {
  searchKeyword.value = ''
  businessDomain.value = ''
  tableType.value = ''
  tableData.value = []
}

const handleFilterChange = () => {
  if (hasSearchQuery.value) handleSearch()
}

const handleSearch = async () => {
  if (!hasSearchQuery.value) return
  
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const filteredData = tableMockData.filter(item => {
      const keywordMatch = !searchKeyword.value || 
        item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchKeyword.value.toLowerCase()))
      
      const domainMatch = !businessDomain.value || item.domain === businessDomain.value
      
      let typeMatch = true
      if (tableType.value) {
        if (tableType.value === 'dim') typeMatch = item.type === '维度表'
        else if (tableType.value === 'fact') typeMatch = item.type === '事实表'
        else if (tableType.value === 'dws') typeMatch = item.type === '汇总表'
        else if (tableType.value === 'dwd') typeMatch = item.type === '明细表'
        else typeMatch = item.type === tableType.value
      }
      
      return keywordMatch && domainMatch && typeMatch
    })
    
    tableData.value = filteredData
    pagination.value.total = filteredData.length
  } catch (error) {
    Message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const onPageChange = (current: number) => {
  pagination.value.current = current
}

const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
}

const showTableDetail = (record: TableItem) => {
  Message.info(`资产详情：${record.name}（Demo模式）`)
}

const addToFavorite = async (record: TableItem) => {
  Message.success('添加收藏成功')
}

const requestPermission = async (record: TableItem) => {
  Message.success('权限申请已提交')
}
</script>

<style scoped>
.data-map-container {
  min-height: 100vh;
  background: #f7f8fa;
  position: relative;
  overflow-x: hidden;
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
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 32px;
  max-width: 600px;
  line-height: 1.6;
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

.banner-decoration {
  position: absolute;
  right: 0;
  top: 0;
  width: 40%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.decoration-cube {
  position: absolute;
  top: 40px;
  right: 100px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #e8f3ff 0%, #cce4ff 100%);
  transform: rotate(-15deg) skew(-10deg);
  border-radius: 20px;
  box-shadow: -20px 20px 40px rgba(22, 93, 255, 0.1);
}

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
  margin: 0;
}

.section-subtitle {
  font-size: 13px;
  color: #86909c;
  margin-left: 12px;
  font-weight: normal;
}

.result-count {
  font-size: 13px;
  color: #86909c;
  margin-left: 12px;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.theme-blue { background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%); }
.theme-green { background: linear-gradient(135deg, #00B42A 0%, #23C343 100%); }
.theme-orange { background: linear-gradient(135deg, #FF7D00 0%, #FF9A2E 100%); }
.theme-red { background: linear-gradient(135deg, #F53F3F 0%, #F76560 100%); }
.theme-purple { background: linear-gradient(135deg, #722ED1 0%, #9F5FEE 100%); }
.theme-cyan { background: linear-gradient(135deg, #0FC6C2 0%, #44E6E2 100%); }
.theme-arcoblue { background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%); }
.theme-gray { background: linear-gradient(135deg, #86909c 0%, #A9B3C1 100%); }

.theme-icon-box-small {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
}

.collection-card {
  position: relative;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  transition: all 0.2s ease;
  cursor: pointer;
  height: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.collection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #165dff;
}

.collection-card :deep(.arco-card-body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.title-actions {
  display: flex;
  gap: 4px;
  opacity: 1;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.title-actions :deep(.arco-btn) {
  padding: 4px;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: #86909c;
  border: 1px solid #e5e6eb;
}

.title-actions :deep(.arco-btn:hover) {
  color: #165dff;
  border-color: #165dff;
  background: #e8f3ff;
}

.collection-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.collection-stats :deep(.arco-tag) {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.table-count {
  font-size: 13px;
  font-weight: 500;
  color: #86909c;
}

.card-description {
  font-size: 14px;
  color: #86909c;
  line-height: 1.57;
  margin-bottom: 20px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 44px;
}
</style>
