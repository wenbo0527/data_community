<template>
  <div class="data-map-container">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">数据消费新体验</h1>
          <span class="version-tag">2.0</span>
        </div>
        <p class="banner-subtitle">全新版本数据地图，包含查数、找数、用数等场景升级；为用户解决找数难，理解数据难的难点。</p>
        
        <div class="search-area">
          <a-input-search 
            v-model="searchForm.keyword"
            class="main-search-input"
            placeholder="输入关键词进行查询，支持各业务/标签/分组/指标等多个关键字，或尝试执行路径定义搜索"
            search-button
            size="large"
            @search="handleSearch"
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>
          <a-button 
            class="action-btn" 
            size="large"
            @click="toggleAdvancedFilter"
            :type="showAdvancedFilter ? 'primary' : 'secondary'"
          >
            <template #icon><icon-filter /></template>
            高级
          </a-button>
          <a-button class="action-btn" size="large">
            <template #icon><icon-star /></template>
            收藏
          </a-button>
        </div>

        <!-- 高级筛选面板 -->
        <div v-if="showAdvancedFilter" class="advanced-filter-panel">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="包含关键词" label-col-flex="80px">
                <a-input v-model="searchForm.include" placeholder="输入包含的关键词" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="排除关键词" label-col-flex="80px">
                <a-input v-model="searchForm.exclude" placeholder="输入排除的关键词" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="业务模块" label-col-flex="80px">
                <a-select v-model="searchForm.module" placeholder="选择业务模块" allow-clear>
                  <a-option>贷前分析</a-option>
                  <a-option>风控评估</a-option>
                  <a-option>反欺诈</a-option>
                  <a-option>自营业务</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <div class="filter-actions">
            <a-button type="primary" size="small" @click="handleSearch">应用筛选</a-button>
            <a-button size="small" @click="resetSearch">重置</a-button>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <!-- 装饰背景，使用 CSS 或 SVG -->
        <div class="decoration-circle"></div>
        <div class="decoration-cube"></div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-content">
      <a-row :gutter="24">
        <!-- 左侧内容：最近浏览 + 常用表集合 -->
        <a-col :span="17">
          <!-- 最近浏览 -->
          <div class="content-section">
            <div class="section-header">
              <h3 class="section-title">最近浏览</h3>
              <div class="sort-options">
                <icon-sort />
                <span class="sort-label">排序</span>
                <span class="sort-item active">按热度</span>
                <span class="divider">|</span>
                <span class="sort-item">按时间</span>
              </div>
            </div>
            
            <a-list :bordered="false" class="recent-list">
              <a-list-item v-for="item in recentlyViewed" :key="item.id" class="recent-item">
                <div class="recent-item-content">
                  <div class="item-icon" :style="{ backgroundColor: item.iconColor || '#165DFF' }">
                    {{ item.type }}
                  </div>
                  <span class="item-name">{{ item.name }}</span>
                </div>
                <template #actions>
                  <span class="action-item"><icon-star /> {{ item.star }}</span>
                  <span class="action-item"><icon-eye /></span>
                </template>
              </a-list-item>
            </a-list>
          </div>

          <!-- 常用表集合 -->
          <div class="content-section" style="margin-top: 24px;">
            <div class="section-header">
              <h3 class="section-title">常用表集合</h3>
              <a-link class="more-link" @click="router.push('/discovery/data-map/collections')">查看更多 <icon-right /></a-link>
            </div>
            
            <TableCollectionGrid
              :collections="collections"
              :show-header="false"
              :page-size="6"
              @collection-click="handleCollectionClick"
            />
          </div>
        </a-col>

        <!-- 右侧侧栏：数据资产/资源/要素 -->
        <a-col :span="7">
          <!-- 数据资产 -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">数据资产</h3>
            <a-list :bordered="false" class="asset-list">
              <a-list-item 
                v-for="(item, index) in dataAssets" 
                :key="index" 
                class="asset-item clickable-item"
                @click="handleAssetClick(item)"
              >
                <div class="asset-content">
                  <icon-storage class="asset-icon" v-if="item.icon === 'icon-storage'" />
                  <icon-folder class="asset-icon" v-else-if="item.icon === 'icon-folder'" />
                  <icon-drive-file class="asset-icon" v-else-if="item.icon === 'icon-database'" />
                  <span class="asset-name">{{ item.name }}</span>
                  <a-tag v-if="item.isNew" color="orangered" size="small" class="new-tag">NEW</a-tag>
                </div>
                <span class="asset-count">{{ item.count }}</span>
              </a-list-item>
            </a-list>
          </div>

          <!-- 数据资源 -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">数据资源</h3>
            <a-list :bordered="false" class="asset-list">
              <a-list-item 
                v-for="(item, index) in dataResources" 
                :key="index" 
                class="asset-item clickable-item"
                @click="handleResourceClick(item)"
              >
                <div class="asset-content">
                  <icon-apps class="asset-icon" />
                  <span class="asset-name">{{ item.name }}</span>
                </div>
                <span class="asset-count">{{ item.count }}</span>
              </a-list-item>
            </a-list>
          </div>

          <!-- 数据要素 -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">数据要素</h3>
            <a-list :bordered="false" class="asset-list">
              <a-list-item 
                v-for="(item, index) in dataElements" 
                :key="index" 
                class="asset-item clickable-item"
                @click="handleElementClick(item)"
              >
                <div class="asset-content">
                  <icon-bulb class="asset-icon" />
                  <span class="asset-name">{{ item.name }}</span>
                </div>
                <span class="asset-count">{{ item.count }}</span>
              </a-list-item>
            </a-list>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 悬浮按钮 -->
    <div class="floating-btn">
      <icon-notification />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IconSearch, IconStar, IconSort, IconEye, IconRight, 
  IconFire, IconStorage, IconFolder, IconDriveFile,
  IconApps, IconBulb, IconNotification, IconFilter
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import TableCollectionGrid from './components/TableCollectionGrid.vue'
import { 
  mockRecentlyViewed, 
  mockDataAssets, 
  mockDataResources, 
  mockDataElements, 
  mockBusinessRecommendations 
} from '@/mock/data-map'
import mockData from '@/mock/data-map'

const router = useRouter()

// 状态管理
const searchForm = ref({
  keyword: '',
  include: '',
  exclude: '',
  module: ''
})
const showAdvancedFilter = ref(false)

// 从 Mock 数据中获取
const recentlyViewed = ref(mockRecentlyViewed || [])
const dataAssets = ref(mockDataAssets || [])
const dataResources = ref(mockDataResources || [])
const dataElements = ref(mockDataElements || [])
const collections = ref(mockData.collections || [])

// 搜索处理
const handleSearch = () => {
  if (!searchForm.value.keyword && !showAdvancedFilter.value) {
    Message.warning('请输入搜索关键词')
    return
  }
  
  // 模拟搜索跳转
  router.push({
    path: '/discovery/search',
    query: {
      q: searchForm.value.keyword,
      include: searchForm.value.include,
      exclude: searchForm.value.exclude,
      module: searchForm.value.module
    }
  })
}

const toggleAdvancedFilter = () => {
  showAdvancedFilter.value = !showAdvancedFilter.value
}

const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    include: '',
    exclude: '',
    module: ''
  }
}

// 路由跳转处理
const handleAssetClick = (item: any) => {
  // 根据资产类型进行筛选跳转
  // 例如：跳转到数据搜索页并带上类型参数
  // 这里暂时统一跳转到数据搜索，并使用 query 参数
  // 实际项目中可能需要更复杂的映射逻辑
  
  // 如果是"数据专题"，跳转到专题页（假设有）或搜索专题
  if (item.name === '数据专题') {
     // 示例：Message.info('跳转到数据专题页')
     router.push({ path: '/discovery/search', query: { type: 'topic' } })
     return
  }

  // 其他类型视为表类型或数据源类型
  router.push({ 
    path: '/discovery/search', 
    query: { 
      q: '', 
      type: 'table',
      source: item.name // 将名称作为来源筛选
    } 
  })
}

const handleResourceClick = (item: any) => {
  if (item.name === 'API 接口') {
    router.push({ path: '/discovery/api-market' })
  } else if (item.name === '数据报表') {
    // 假设跳转到报表中心或相关搜索
    router.push({ path: '/discovery/search', query: { type: 'report' } })
  } else if (item.name === '算法模型') {
    // 跳转到模型相关页面
    // 检查路由表，似乎有 model-offline-analysis 或 offlineModel
    // 这里先跳搜索
    router.push({ path: '/discovery/search', query: { type: 'model' } })
  } else if (item.name === '数据看板') {
    router.push({ path: '/discovery/search', query: { type: 'dashboard' } })
  } else {
    Message.info(`即将跳转到：${item.name}`)
  }
}

const handleElementClick = (item: any) => {
  if (item.name === '核心指标') {
    // 跳转到指标中心
    router.push({ path: '/discovery/unified-metrics' })
  } else if (item.name === '业务标签') {
    // 跳转到客户360或标签管理
    router.push({ path: '/discovery/customer360' })
  } else if (item.name === '数据标准') {
    // 假设有数据标准页
    Message.info('跳转到数据标准管理')
  } else {
    Message.info(`即将跳转到：${item.name}`)
  }
}

// 集合点击处理
const handleCollectionClick = (collection: any) => {
  // 跳转到集合详情页
  router.push(`/discovery/data-map/collection/${collection.id}`)
}

</script>

<style scoped>
.data-map-container {
  min-height: 100vh;
  background: #f7f8fa;
  position: relative;
  overflow-x: hidden;
}

/* Banner Section */
.banner-section {
  background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%);
  padding: 40px 60px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 320px;
  height: auto;
}

.banner-content {
  max-width: 60%;
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
}

.search-area {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  max-width: 800px;
  position: relative;
}

.advanced-filter-panel {
  margin-top: 16px;
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 800px;
  border: 1px solid #e5e6eb;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.action-btn {
  background: #fff;
  border: 1px solid #a9c5ff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  color: #165DFF;
}

.action-btn:hover {
  background: #f2f3f5;
  color: #165DFF;
  border-color: #165DFF;
}

.action-btn[type="primary"] {
  background: #e8f3ff;
  border-color: #165DFF;
  color: #165DFF;
}

.banner-title {
  font-size: 44px;
  font-weight: bold;
  color: #1d2129;
  margin: 0;
  line-height: 1.2;
}

.version-tag {
  font-size: 36px;
  font-weight: 600;
  background: linear-gradient(90deg, #165DFF 0%, #00B42A 100%);
  -webkit-background-clip: text;
  color: transparent;
  margin-left: 12px;
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
  max-width: 800px;
}

.main-search-input {
  flex: 1;
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

.favorite-btn {
  background: #fff;
  color: #165DFF;
  border: 1px solid #a9c5ff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* Decoration */
.banner-decoration {
  position: absolute;
  right: 0;
  top: 0;
  width: 40%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
/* 这里可以使用背景图，为了简单模拟效果，用CSS画几个图形 */
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

/* Main Content */
.main-content {
  padding: 0 40px 40px;
  max-width: 1600px;
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
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.sort-options {
  font-size: 12px;
  color: #86909c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-item {
  cursor: pointer;
}
.sort-item.active {
  color: #165DFF;
  font-weight: 500;
}

/* Recent List */
.recent-item {
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}
.recent-item:last-child {
  border-bottom: none;
}

.recent-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
}

.item-name {
  font-size: 14px;
  color: #1d2129;
}

.action-item {
  color: #86909c;
  font-size: 12px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Recommendation Grid */
.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.recommend-card {
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  background: #fff;
  transition: all 0.3s;
}
.recommend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.recommend-card :deep(.arco-card-body) {
  padding: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 12px;
}

.card-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  font-size: 12px;
  color: #4e5969;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Sidebar */
.sidebar-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 16px 0;
}

.asset-item {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clickable-item {
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 10px 8px;
  margin: 0 -8px;
  border-radius: 4px;
}

.clickable-item:hover {
  background-color: #f2f3f5;
}

.asset-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-icon {
  color: #165DFF;
  font-size: 16px;
}

.asset-name {
  font-size: 14px;
  color: #4e5969;
}

.asset-count {
  font-size: 12px;
  color: #86909c;
}

.new-tag {
  margin-left: 4px;
  font-size: 10px;
  transform: scale(0.9);
}

/* Floating Button */
.floating-btn {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #722ED1 0%, #165DFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.4);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.3s;
}
.floating-btn:hover {
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 1200px) {
  .banner-content {
    max-width: 80%;
  }
}

@media (max-width: 768px) {
  .banner-section {
    padding: 20px;
    height: auto;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .banner-content {
    max-width: 100%;
  }
  
  .main-content {
    padding: 20px;
    margin-top: 0;
  }
  
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
}
</style>